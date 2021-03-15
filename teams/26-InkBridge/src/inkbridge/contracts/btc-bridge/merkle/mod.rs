// Refer from https://github.com/rust-bitcoin/rust-bitcoin/blob/master/src/util/merkleblock.rs
mod merkle_root;

pub use merkle_root::*;

use crate::{
    btc_bridge::{Error, Result},
    types::hash_rev,
};
use core::fmt;
use ink_env::Hash;
use ink_prelude::{vec, vec::Vec};
use ink_storage::traits::{PackedLayout, SpreadLayout};
use merkle_root::merkle_node_hash;

/// The maximum allowed weight for a block, see BIP 141 (network rule)
const MAX_BLOCK_WEIGHT: u32 = 4_000_000;
/// The minimum transaction weight for a valid serialized transaction
const MIN_TRANSACTION_WEIGHT: u32 = 4 * 60;

/// Data structure that represents a partial merkle tree.
///
/// It represents a subset of the txid's of a known block, in a way that
/// allows recovery of the list of txid's and the merkle root, in an
/// authenticated way.
///
/// The encoding works as follows: we traverse the tree in depth-first order,
/// storing a bit for each traversed node, signifying whether the node is the
/// parent of at least one matched leaf txid (or a matched txid itself). In
/// case we are at the leaf level, or this bit is 0, its merkle node hash is
/// stored, and its children are not explored further. Otherwise, no hash is
/// stored, but we recurse into both (or the only) child branch. During
/// decoding, the same depth-first traversal is performed, consuming bits and
/// hashes as they written during encoding.
///
/// The serialization is fixed and provides a hard guarantee about the
/// encoded size:
///
///   SIZE <= 10 + ceil(32.25*N)
///
/// Where N represents the number of leaf nodes of the partial tree. N itself
/// is bounded by:
///
///   N <= total_transactions
///   N <= 1 + matched_transactions*tree_height
///
/// The serialization format:
///  - uint32     total_transactions (4 bytes)
///  - varint     number of hashes   (1-3 bytes)
///  - uint256[]  hashes in depth-first order (<= 32*N bytes)
///  - varint     number of bytes of flag bits (1-3 bytes)
///  - byte[]     flag bits, packed per 8 in a byte, least significant bit first (<= 2*N-1 bits)
/// The size constraints follow from this.
#[derive(
    PartialEq, Eq, Clone, Default, scale::Encode, scale::Decode, SpreadLayout, PackedLayout,
)]
#[cfg_attr(
    feature = "std",
    derive(scale_info::TypeInfo, ink_storage::traits::StorageLayout)
)]
pub struct PartialMerkleTree {
    /// The total number of transactions in the block
    pub tx_count: u32,
    /// Transaction hashes and internal hashes
    pub hashes: Vec<Hash>,
    /// node-is-parent-of-matched-txid bits
    pub bits: Vec<bool>,
}

impl fmt::Debug for PartialMerkleTree {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("PartialMerkleTree")
            .field("tx_count", &self.tx_count)
            .field(
                "hashes",
                &self
                    .hashes
                    .iter()
                    .map(|hash| hash_rev(*hash))
                    .collect::<Vec<_>>(),
            )
            .field("bits", &self.bits)
            .finish()
    }
}

impl PartialMerkleTree {
    /// Construct a partial merkle tree
    /// The `txids` are the transaction hashes of the block and the `matches` is the contains flags
    /// wherever a tx hash should be included in the proof.
    ///
    /// Panics when `txids` is empty or when `matches` has a different length
    pub fn from_txids(txids: &[Hash], matches: &[bool]) -> Self {
        // We can never have zero txs in a merkle block, we always need the coinbase tx
        assert_ne!(txids.len(), 0);
        assert_eq!(txids.len(), matches.len());

        let mut pmt = PartialMerkleTree {
            tx_count: txids.len() as u32,
            hashes: vec![],
            bits: Vec::with_capacity(txids.len()),
        };
        // calculate height of tree
        let height = pmt.calc_tree_height();
        // traverse the partial tree
        pmt.traverse_and_build(height, 0, txids, matches);
        pmt
    }

    /// Recursive function that traverses tree nodes, storing the data as bits and hashes
    fn traverse_and_build(&mut self, height: u32, pos: u32, txids: &[Hash], matches: &[bool]) {
        // Determine whether this node is the parent of at least one matched txid
        let mut parent_of_match = false;
        let mut p = pos << height;
        while p < (pos + 1) << height && p < self.tx_count {
            parent_of_match |= matches[p as usize];
            p += 1;
        }
        // Store as flag bit
        self.bits.push(parent_of_match);
        // proceed with descendants
        if height == 0 || !parent_of_match {
            // If at height 0, or nothing interesting below, store hash and stop
            let hash = self.calc_hash(height, pos, txids);
            self.hashes.push(hash);
        } else {
            // Otherwise, don't store any hash, but descend into the subtrees
            // proceed with left subtree
            self.traverse_and_build(height - 1, pos << 1, txids, matches);
            // proceed with right subtree if any
            if self.has_right_child(height, pos) {
                self.traverse_and_build(height - 1, (pos << 1) + 1, txids, matches);
            }
        }
    }

    pub fn verify(&self, tx_hash: Hash, merkle_root: Hash) -> Result<()> {
        // verify merkle proof
        let mut matches = Vec::new();
        let mut _indexes = Vec::new();
        let hash = self.extract_matches(&mut matches, &mut _indexes)?;
        if merkle_root != hash {
            // error!(
            //     "[validate_transaction] Check merkle tree proof error, merkle_root:{:?}, hash:{:?}",
            //     merkle_root, hash
            // );
            return Err(Error::BadMerkleProof);
        }
        if !matches.iter().any(|h| *h == tx_hash) {
            // error!("[validate_transaction] Tx hash should in matches of partial merkle tree");
            return Err(Error::BadMerkleProof);
        }
        Ok(())
    }

    /// Extract the matching txid's represented by this partial merkle tree
    /// and their respective indices within the partial tree.
    /// returns the merkle root, or error in case of failure
    pub fn extract_matches(&self, matches: &mut Vec<Hash>, indexes: &mut Vec<u32>) -> Result<Hash> {
        matches.clear();
        indexes.clear();

        // An empty set will not work
        if self.tx_count == 0 {
            return Err(Error::NoTransactions);
        }
        // check for excessively high numbers of transactions
        if self.tx_count > MAX_BLOCK_WEIGHT / MIN_TRANSACTION_WEIGHT {
            return Err(Error::TooManyTransactions);
        }
        // there can never be more hashes provided than one for every txid
        if self.hashes.len() as u32 > self.tx_count {
            return Err(Error::TooManyHashes);
        }
        // there must be at least one bit per node in the partial tree, and at least one node per hash
        if self.bits.len() < self.hashes.len() {
            return Err(Error::ProofLessHashes);
        }

        // traverse the partial tree
        let mut bits_used = 0u32;
        let mut hash_used = 0u32;
        let height = self.calc_tree_height();
        let merkle_root =
            self.traverse_and_extract(height, 0, &mut bits_used, &mut hash_used, matches, indexes)?;
        // Verify that all bits were consumed (except for the padding caused by serializing it as a byte sequence)
        if (bits_used + 7) / 8 != (self.bits.len() as u32 + 7) / 8 {
            return Err(Error::NotAllBitConsumed);
        }
        // Verify that all hashes were consumed
        if hash_used != self.hashes.len() as u32 {
            return Err(Error::NotAllHashesConsumed);
        }
        Ok(merkle_root)
    }

    /// Recursive function that traverses tree nodes, consuming the bits and hashes produced by
    /// TraverseAndBuild. It returns the hash of the respective node and its respective index.
    fn traverse_and_extract(
        &self,
        height: u32,
        pos: u32,
        bits_used: &mut u32,
        hash_used: &mut u32,
        matches: &mut Vec<Hash>,
        indexes: &mut Vec<u32>,
    ) -> Result<Hash> {
        if *bits_used as usize >= self.bits.len() {
            return Err(Error::NotAllBitConsumed);
        }

        let parent_of_match = self.bits[*bits_used as usize];
        *bits_used += 1;

        if height == 0 || !parent_of_match {
            // If at height 0, or nothing interesting below, use stored hash and do not descend
            if *hash_used as usize >= self.hashes.len() {
                return Err(Error::OverflowedHashArray);
            }

            // get node hash
            let hash = self.hashes[*hash_used as usize];
            *hash_used += 1;

            // in case of height 0, we have a matched txid
            if height == 0 && parent_of_match {
                matches.push(hash);
                indexes.push(pos);
            }
            Ok(hash)
        } else {
            // otherwise, descend into the subtrees to extract matched txids and hashes
            // proceed with left child
            let left = self.traverse_and_extract(
                height - 1,
                pos * 2,
                bits_used,
                hash_used,
                matches,
                indexes,
            )?;
            // proceed with right child if any
            let has_right_child = self.has_right_child(height, pos);
            let right = if has_right_child {
                self.traverse_and_extract(
                    height - 1,
                    pos * 2 + 1,
                    bits_used,
                    hash_used,
                    matches,
                    indexes,
                )?
            } else {
                left
            };
            if has_right_child && right == left {
                // The left and right branches should never be identical, as the transaction
                // hashes covered by them must each be unique.
                return Err(Error::FoundIdenticalTxHash);
            }
            // and combine them before returning
            Ok(merkle_node_hash(&left, &right))
        }
    }

    fn calc_tree_height(&self) -> u32 {
        let mut height = 0u32;
        while self.calc_tree_width(height) > 1 {
            height += 1;
        }
        height
    }

    /// Helper function to efficiently calculate the number of nodes at given height in the merkle tree
    #[inline]
    fn calc_tree_width(&self, height: u32) -> u32 {
        (self.tx_count + (1 << height) - 1) >> height
    }

    #[inline]
    fn has_right_child(&self, height: u32, pos: u32) -> bool {
        pos * 2 + 1 < self.calc_tree_width(height - 1)
    }

    /// Calculate the hash of a node in the merkle tree (at leaf level: the txid's themselves)
    fn calc_hash(&self, height: u32, pos: u32, txids: &[Hash]) -> Hash {
        if height == 0 {
            // Hash at height 0 is the txid itself
            txids[pos as usize]
        } else {
            // Calculate left hash
            let left = self.calc_hash(height - 1, pos * 2, txids);
            // Calculate right hash if not beyond the end of the array - copy left hash otherwise
            let right = if self.has_right_child(height, pos) {
                self.calc_hash(height - 1, pos * 2 + 1, txids)
            } else {
                left
            };
            // Combine sub hashes
            merkle_node_hash(&left, &right)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::{merkle_root::merkle_root, PartialMerkleTree};
    use crate::types::{hash_rev, BtcHeader, Compact};
    use hashbrown::HashSet;
    use ink_env::Hash;
    use light_bitcoin_chain::Block;
    use light_bitcoin_serialization::{deserialize, Deserializable};
    use rand::prelude::*;
    use scale::{Decode, Encode};
    use std::convert::TryFrom;

    /// `s` must be 66 (with 0x prefix) or 64 (without 0x prefix) chars
    fn h256(s: &str) -> Hash {
        let data = if let Some(hex) = s.strip_prefix("0x") {
            hex::decode(hex).unwrap()
        } else {
            hex::decode(s).unwrap()
        };
        Hash::try_from(&data[..]).unwrap()
    }

    fn h256_rev(s: &str) -> Hash {
        hash_rev(h256(s))
    }

    #[derive(PartialEq, Eq, Clone, Default, Encode, Decode)]
    struct MerkleBlock {
        header: BtcHeader,
        pmt: PartialMerkleTree,
    }

    impl MerkleBlock {
        fn from_block(block: &Block, match_txids: &HashSet<Hash>) -> Self {
            let header = block.header;
            let header = BtcHeader {
                version: header.version,
                previous_header_hash: Hash::try_from(&header.previous_header_hash[..]).unwrap(),
                merkle_root_hash: Hash::try_from(&header.merkle_root_hash[..]).unwrap(),
                time: header.time,
                bits: Compact::from(u32::from(header.bits)),
                nonce: header.nonce,
            };

            let mut matches = Vec::with_capacity(block.transactions.len());
            let mut hashes = Vec::with_capacity(block.transactions.len());

            for hash in block.transactions.iter().map(|tx| tx.hash()) {
                let hash = Hash::try_from(&hash[..]).unwrap();
                matches.push(match_txids.contains(&hash));
                hashes.push(hash);
            }
            let pmt = PartialMerkleTree::from_txids(&hashes, &matches);
            MerkleBlock { header, pmt }
        }
    }

    impl PartialMerkleTree {
        /// Flip one bit in one of the hashes - this should break the authentication
        fn damage(&mut self, rng: &mut ThreadRng) {
            let n = rng.gen_range(0..self.hashes.len());
            let bit = rng.gen::<u8>();
            let hashes = &mut self.hashes;
            let mut hash = hashes[n];
            hash.as_mut()[(bit >> 3) as usize] ^= 1 << (bit & 7);
            hashes[n] = hash;
        }
    }

    #[test]
    fn pmt_tests() {
        let mut rng = rand::thread_rng();
        let tx_counts = vec![1, 4, 7, 17, 56, 100, 127, 256, 312, 513, 1000, 4095];
        for tx_count in tx_counts {
            // Create some fake tx ids
            let txids = (1..=tx_count)
                .map(|i| h256_rev(&format!("{:064x}", i)))
                .collect::<Vec<_>>();

            // Calculate the merkle root and height
            let merkle_root_1 = merkle_root(&txids);
            let mut height = 1;
            let mut ntx = tx_count;
            while ntx > 1 {
                ntx = (ntx + 1) / 2;
                height += 1;
            }

            // Check with random subsets with inclusion chances 1, 1/2, 1/4, ..., 1/128
            for att in 1..15 {
                let mut matches = vec![false; tx_count];
                let mut match_txid1 = vec![];
                for j in 0..tx_count {
                    // Generate `att / 2` random bits
                    let rand_bits = match att / 2 {
                        0 => 0,
                        bits => rng.gen::<u64>() >> (64 - bits),
                    };
                    let include = rand_bits == 0;
                    matches[j] = include;

                    if include {
                        match_txid1.push(txids[j]);
                    };
                }

                // Build the partial merkle tree
                let pmt1 = PartialMerkleTree::from_txids(&txids, &matches);
                let mut serialized = pmt1.encode();

                // Verify PartialMerkleTree's size guarantees
                let n = core::cmp::min(tx_count, 1 + match_txid1.len() * height);
                assert!(serialized.len() <= 10 + (258 * n + 7) / 8);

                // Deserialize into a tester copy
                let pmt2 = PartialMerkleTree::decode(&mut serialized)
                    .expect("Could not deserialize own data");

                // Extract merkle root and matched txids from copy
                let mut match_txid2 = vec![];
                let mut indexes = vec![];
                let merkle_root_2 = pmt2
                    .extract_matches(&mut match_txid2, &mut indexes)
                    .expect("Could not extract matches");

                // Check that it has the same merkle root as the original, and a valid one
                assert_eq!(merkle_root_1, merkle_root_2);
                assert_ne!(merkle_root_2, Hash::default());

                // check that it contains the matched transactions (in the same order!)
                assert_eq!(match_txid1, match_txid2);

                // check that random bit flips break the authentication
                for _ in 0..4 {
                    let mut pmt3 = PartialMerkleTree::decode(&mut serialized).unwrap();
                    pmt3.damage(&mut rng);
                    let mut match_txid3 = vec![];
                    let merkle_root_3 = pmt3
                        .extract_matches(&mut match_txid3, &mut indexes)
                        .unwrap();
                    assert_ne!(merkle_root_3, merkle_root_1);
                }
            }
        }
    }

    #[test]
    fn pmt_malleability() {
        // Create some fake tx ids with the last 2 hashes repeating
        let txids: Vec<Hash> = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 9, 10]
            .iter()
            .map(|i| h256_rev(&format!("{:064x}", i)))
            .collect();

        let matches = vec![
            false, false, false, false, false, false, false, false, false, true, true, false,
        ];

        let tree = PartialMerkleTree::from_txids(&txids, &matches);
        // Should fail due to duplicate txs found
        let result = tree.extract_matches(&mut vec![], &mut vec![]);
        assert!(result.is_err());
    }

    // #[test]
    // fn merkle_block_serialization() {
    //     // Got it by running the rpc call `gettxoutproof '["220ebc64e21abece964927322cba69180ed853bb187fbc6923bac7d010b9d87a"]'`
    //     let data = hex::decode(
    //         "0100000090f0a9f110702f808219ebea1173056042a714bad51b916cb6800000000000005275289558f51c\
    //         9966699404ae2294730c3c9f9bda53523ce50e9b95e558da2fdb261b4d4c86041b1ab1bf930900000005fac\
    //         7708a6e81b2a986dea60db2663840ed141130848162eb1bd1dee54f309a1b2ee1e12587e497ada70d9bd10d\
    //         31e83f0a924825b96cb8d04e8936d793fb60db7ad8b910d0c7ba2369bc7f18bb53d80e1869ba2c32274996c\
    //         ebe1ae264bc0e2289189ff0316cdc10511da71da757e553cada9f3b5b1434f3923673adb57d83caac392c38\
    //         af156d6fc30b55fad4112df2b95531e68114e9ad10011e72f7b7cfdb025700"
    //     ).unwrap();
    //     let mb: MerkleBlock = deserialize(data.as_slice()).unwrap();
    //     assert_eq!(get_block_13b8a().hash(), mb.header.hash());
    //
    //     let merkle_root = mb.pmt.extract_matches(&mut vec![], &mut vec![]).unwrap();
    //     assert_eq!(merkle_root, mb.header.merkle_root_hash);
    //
    //     // Serialize again and check that it matches the original bytes
    //     assert_eq!(data, *serialize(&mb));
    // }

    /// Create a MerkleBlock using a list of txids which will be found in the given block.
    #[test]
    fn merkle_block_construct_from_txids_found() {
        let block = get_block_13b8a();

        let txid1 = h256_rev("74d681e0e03bafa802c8aa084379aa98d9fcd632ddc2ed9782b586ec87451f20");
        let txid2 = h256_rev("f9fc751cb7dc372406a9f8d738d5e6f8f63bab71986a39cf36ee70ee17036d07");
        let txids = vec![txid1, txid2].into_iter().collect();

        let merkle_block = MerkleBlock::from_block(&block, &txids);
        assert_eq!(
            merkle_block.header.hash(),
            hash_rev(Hash::try_from(&block.hash()[..]).unwrap())
        );

        let mut matches: Vec<Hash> = vec![];
        let mut indexes: Vec<u32> = vec![];
        let merkle_root = merkle_block
            .pmt
            .extract_matches(&mut matches, &mut indexes)
            .unwrap();

        assert_eq!(
            merkle_root,
            Hash::try_from(&block.header.merkle_root_hash[..]).unwrap()
        );
        assert_eq!(matches.len(), 2);

        // Ordered by occurrence in depth-first tree traversal.
        assert_eq!(matches[0], txid2);
        assert_eq!(indexes[0], 1);
        assert_eq!(matches[1], txid1);
        assert_eq!(indexes[1], 8);
    }

    /// Create a MerkleBlock using a list of txids which will not be found in the given block
    #[test]
    fn merkle_block_construct_from_txids_not_found() {
        let block = get_block_13b8a();
        let txids = vec![h256_rev(
            "c0ffee00003bafa802c8aa084379aa98d9fcd632ddc2ed9782b586ec87451f20",
        )]
        .into_iter()
        .collect();

        let merkle_block = MerkleBlock::from_block(&block, &txids);

        assert_eq!(
            merkle_block.header.hash(),
            hash_rev(Hash::try_from(&block.hash()[..]).unwrap())
        );

        let mut matches: Vec<Hash> = vec![];
        let mut indexes: Vec<u32> = vec![];
        let merkle_root = merkle_block
            .pmt
            .extract_matches(&mut matches, &mut indexes)
            .unwrap();

        assert_eq!(
            merkle_root,
            Hash::try_from(&block.header.merkle_root_hash[..]).unwrap()
        );
        assert_eq!(matches.len(), 0);
        assert_eq!(indexes.len(), 0);
    }

    // Block 100,002 (0000000000013b8ab2cd513b0261a14096412195a72a0c4827d229dcc7e0f7af) with 9 txs.
    // https://blockchain.info/rawblock/0000000000013b8ab2cd513b0261a14096412195a72a0c4827d229dcc7e0f7af
    // https://blockchain.info/rawblock/0000000000013b8ab2cd513b0261a14096412195a72a0c4827d229dcc7e0f7af?format=hex
    fn get_block_13b8a() -> Block {
        let block_hex =
            "0100000090f0a9f110702f808219ebea1173056042a714bad51b916cb6800000000000005275289558f51c\
            9966699404ae2294730c3c9f9bda53523ce50e9b95e558da2fdb261b4d4c86041b1ab1bf930901000000010\
            000000000000000000000000000000000000000000000000000000000000000ffffffff07044c86041b0146\
            ffffffff0100f2052a01000000434104e18f7afbe4721580e81e8414fc8c24d7cfacf254bb5c7b949450c3e\
            997c2dc1242487a8169507b631eb3771f2b425483fb13102c4eb5d858eef260fe70fbfae0ac000000000100\
            00000196608ccbafa16abada902780da4dc35dafd7af05fa0da08cf833575f8cf9e836000000004a4930460\
            22100dab24889213caf43ae6adc41cf1c9396c08240c199f5225acf45416330fd7dbd022100fe37900e0644\
            bf574493a07fc5edba06dbc07c311b947520c2d514bc5725dcb401ffffffff0100f2052a010000001976a91\
            4f15d1921f52e4007b146dfa60f369ed2fc393ce288ac000000000100000001fb766c1288458c2bafcfec81\
            e48b24d98ec706de6b8af7c4e3c29419bfacb56d000000008c493046022100f268ba165ce0ad2e6d93f089c\
            fcd3785de5c963bb5ea6b8c1b23f1ce3e517b9f022100da7c0f21adc6c401887f2bfd1922f11d76159cbc59\
            7fbd756a23dcbb00f4d7290141042b4e8625a96127826915a5b109852636ad0da753c9e1d5606a50480cd0c\
            40f1f8b8d898235e571fe9357d9ec842bc4bba1827daaf4de06d71844d0057707966affffffff0280969800\
            000000001976a9146963907531db72d0ed1a0cfb471ccb63923446f388ac80d6e34c000000001976a914f06\
            88ba1c0d1ce182c7af6741e02658c7d4dfcd388ac000000000100000002c40297f730dd7b5a99567eb8d27b\
            78758f607507c52292d02d4031895b52f2ff010000008b483045022100f7edfd4b0aac404e5bab4fd3889e0\
            c6c41aa8d0e6fa122316f68eddd0a65013902205b09cc8b2d56e1cd1f7f2fafd60a129ed94504c4ac7bdc67\
            b56fe67512658b3e014104732012cb962afa90d31b25d8fb0e32c94e513ab7a17805c14ca4c3423e18b4fb5\
            d0e676841733cb83abaf975845c9f6f2a8097b7d04f4908b18368d6fc2d68ecffffffffca5065ff9617cbcb\
            a45eb23726df6498a9b9cafed4f54cbab9d227b0035ddefb000000008a473044022068010362a13c7f9919f\
            a832b2dee4e788f61f6f5d344a7c2a0da6ae740605658022006d1af525b9a14a35c003b78b72bd59738cd67\
            6f845d1ff3fc25049e01003614014104732012cb962afa90d31b25d8fb0e32c94e513ab7a17805c14ca4c34\
            23e18b4fb5d0e676841733cb83abaf975845c9f6f2a8097b7d04f4908b18368d6fc2d68ecffffffff01001e\
            c4110200000043410469ab4181eceb28985b9b4e895c13fa5e68d85761b7eee311db5addef76fa862186513\
            4a221bd01f28ec9999ee3e021e60766e9d1f3458c115fb28650605f11c9ac000000000100000001cdaf2f75\
            8e91c514655e2dc50633d1e4c84989f8aa90a0dbc883f0d23ed5c2fa010000008b48304502207ab51be6f12\
            a1962ba0aaaf24a20e0b69b27a94fac5adf45aa7d2d18ffd9236102210086ae728b370e5329eead9accd880\
            d0cb070aea0c96255fae6c4f1ddcce1fd56e014104462e76fd4067b3a0aa42070082dcb0bf2f388b6495cf3\
            3d789904f07d0f55c40fbd4b82963c69b3dc31895d0c772c812b1d5fbcade15312ef1c0e8ebbb12dcd4ffff\
            ffff02404b4c00000000001976a9142b6ba7c9d796b75eef7942fc9288edd37c32f5c388ac002d310100000\
            0001976a9141befba0cdc1ad56529371864d9f6cb042faa06b588ac000000000100000001b4a47603e71b61\
            bc3326efd90111bf02d2f549b067f4c4a8fa183b57a0f800cb010000008a4730440220177c37f9a505c3f1a\
            1f0ce2da777c339bd8339ffa02c7cb41f0a5804f473c9230220585b25a2ee80eb59292e52b987dad92acb0c\
            64eced92ed9ee105ad153cdb12d001410443bd44f683467e549dae7d20d1d79cbdb6df985c6e9c029c8d0c6\
            cb46cc1a4d3cf7923c5021b27f7a0b562ada113bc85d5fda5a1b41e87fe6e8802817cf69996ffffffff0280\
            651406000000001976a9145505614859643ab7b547cd7f1f5e7e2a12322d3788ac00aa0271000000001976a\
            914ea4720a7a52fc166c55ff2298e07baf70ae67e1b88ac00000000010000000586c62cd602d219bb60edb1\
            4a3e204de0705176f9022fe49a538054fb14abb49e010000008c493046022100f2bc2aba2534becbdf062eb\
            993853a42bbbc282083d0daf9b4b585bd401aa8c9022100b1d7fd7ee0b95600db8535bbf331b19eed8d961f\
            7a8e54159c53675d5f69df8c014104462e76fd4067b3a0aa42070082dcb0bf2f388b6495cf33d789904f07d\
            0f55c40fbd4b82963c69b3dc31895d0c772c812b1d5fbcade15312ef1c0e8ebbb12dcd4ffffffff03ad0e58\
            ccdac3df9dc28a218bcf6f1997b0a93306faaa4b3a28ae83447b2179010000008b483045022100be12b2937\
            179da88599e27bb31c3525097a07cdb52422d165b3ca2f2020ffcf702200971b51f853a53d644ebae9ec8f3\
            512e442b1bcb6c315a5b491d119d10624c83014104462e76fd4067b3a0aa42070082dcb0bf2f388b6495cf3\
            3d789904f07d0f55c40fbd4b82963c69b3dc31895d0c772c812b1d5fbcade15312ef1c0e8ebbb12dcd4ffff\
            ffff2acfcab629bbc8685792603762c921580030ba144af553d271716a95089e107b010000008b483045022\
            100fa579a840ac258871365dd48cd7552f96c8eea69bd00d84f05b283a0dab311e102207e3c0ee9234814cf\
            bb1b659b83671618f45abc1326b9edcc77d552a4f2a805c0014104462e76fd4067b3a0aa42070082dcb0bf2\
            f388b6495cf33d789904f07d0f55c40fbd4b82963c69b3dc31895d0c772c812b1d5fbcade15312ef1c0e8eb\
            bb12dcd4ffffffffdcdc6023bbc9944a658ddc588e61eacb737ddf0a3cd24f113b5a8634c517fcd20000000\
            08b4830450221008d6df731df5d32267954bd7d2dda2302b74c6c2a6aa5c0ca64ecbabc1af03c75022010e5\
            5c571d65da7701ae2da1956c442df81bbf076cdbac25133f99d98a9ed34c014104462e76fd4067b3a0aa420\
            70082dcb0bf2f388b6495cf33d789904f07d0f55c40fbd4b82963c69b3dc31895d0c772c812b1d5fbcade15\
            312ef1c0e8ebbb12dcd4ffffffffe15557cd5ce258f479dfd6dc6514edf6d7ed5b21fcfa4a038fd69f06b83\
            ac76e010000008b483045022023b3e0ab071eb11de2eb1cc3a67261b866f86bf6867d4558165f7c8c8aca2d\
            86022100dc6e1f53a91de3efe8f63512850811f26284b62f850c70ca73ed5de8771fb451014104462e76fd4\
            067b3a0aa42070082dcb0bf2f388b6495cf33d789904f07d0f55c40fbd4b82963c69b3dc31895d0c772c812\
            b1d5fbcade15312ef1c0e8ebbb12dcd4ffffffff01404b4c00000000001976a9142b6ba7c9d796b75eef794\
            2fc9288edd37c32f5c388ac00000000010000000166d7577163c932b4f9690ca6a80b6e4eb001f0a2fa9023\
            df5595602aae96ed8d000000008a4730440220262b42546302dfb654a229cefc86432b89628ff259dc87edd\
            1154535b16a67e102207b4634c020a97c3e7bbd0d4d19da6aa2269ad9dded4026e896b213d73ca4b63f0141\
            04979b82d02226b3a4597523845754d44f13639e3bf2df5e82c6aab2bdc79687368b01b1ab8b19875ae3c90\
            d661a3d0a33161dab29934edeb36aa01976be3baf8affffffff02404b4c00000000001976a9144854e695a0\
            2af0aeacb823ccbc272134561e0a1688ac40420f00000000001976a914abee93376d6b37b5c2940655a6fca\
            f1c8e74237988ac0000000001000000014e3f8ef2e91349a9059cb4f01e54ab2597c1387161d3da89919f7e\
            a6acdbb371010000008c49304602210081f3183471a5ca22307c0800226f3ef9c353069e0773ac76bb58065\
            4d56aa523022100d4c56465bdc069060846f4fbf2f6b20520b2a80b08b168b31e66ddb9c694e24001410497\
            6c79848e18251612f8940875b2b08d06e6dc73b9840e8860c066b7e87432c477e9a59a453e71e6d76d5fe34\
            058b800a098fc1740ce3012e8fc8a00c96af966ffffffff02c0e1e400000000001976a9144134e75a6fcb60\
            42034aab5e18570cf1f844f54788ac404b4c00000000001976a9142b6ba7c9d796b75eef7942fc9288edd37\
            c32f5c388ac00000000";
        deserialize(hex::decode(block_hex).unwrap().as_slice()).unwrap()
    }
}
