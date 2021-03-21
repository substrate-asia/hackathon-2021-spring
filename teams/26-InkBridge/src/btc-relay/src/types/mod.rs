mod compact;

use codec::{Decode, Encode};

use sp_core::sr25519;

use subxt::PairSigner;
pub use subxt::Signer;

pub use compact::Compact;
use light_bitcoin::{
    primitives::H256,
    serialization::{Serializable, Stream},
};

#[derive(PartialEq, Debug, Eq, Clone, Copy, Default, Encode, Decode)]
pub struct BtcHeader {
    /// The protocol version. Should always be 1.
    pub version: u32,
    /// Reference to the previous block in the chain
    ///
    /// Indicating user-visible serializations of this hash should be backward.
    pub previous_header_hash: H256,
    /// The root hash of the merkle tree of transactions in the block
    ///
    /// Indicating user-visible serializations of this hash should be backward.
    pub merkle_root_hash: H256,
    /// The timestamp of the block, as claimed by the miner
    pub time: u32,
    /// The target value below which the block hash must lie, encoded as a
    /// a float (with well-defined rounding, of course)
    pub bits: Compact,
    /// The nonce, selected to obtain a low enough block hash
    pub nonce: u32,
}

impl BtcHeader {
    pub fn hash(&self) -> H256 {
        use ink_env::hash::CryptoHash;
        let mut output: [u8; 32] = Default::default();
        ink_env::hash::Sha2x256::hash(&self.serialize(), &mut output);
        let mut output2: [u8; 32] = Default::default();
        ink_env::hash::Sha2x256::hash(&output, &mut output2);
        // change to big-endian
        output2.reverse();
        output2.into()
    }

    pub fn serialize(&self) -> [u8; 80] {
        let mut buffer: [u8; 80] = [0_u8; 80];

        let mut point = 0;
        let mut next_point = 0;
        let mut f = |v: &[u8]| {
            next_point = point + v.len();
            (&mut buffer[point..next_point]).copy_from_slice(v);
            point = next_point;
        };

        let v = self.version.to_le_bytes();
        f(&v[..]);

        let v = self.previous_header_hash.as_ref();
        f(&v[..]);

        let v = self.merkle_root_hash.as_ref();
        f(&v[..]);

        let v = self.time.to_le_bytes();
        f(&v[..]);

        let bits: u32 = self.bits.into();
        let v = bits.to_le_bytes();
        f(&v[..]);

        let v = self.nonce.to_le_bytes();
        f(&v[..]);

        buffer
    }
}

#[derive(PartialEq, Debug, Eq, Clone, Copy, Encode, Decode)]
pub struct BtcHeaderInfo {
    pub header: BtcHeader,
    pub height: u32,
}

#[derive(PartialEq, Debug, Eq, Clone, Copy, Default, Encode, Decode)]
pub struct BtcHeaderIndex {
    pub hash: H256,
    pub height: u32,
}

#[derive(Clone, Debug, Eq, PartialEq, Decode)]
pub struct HeaderPushedEvent {
    pub hash: H256,
}

pub type RelayerPair = sr25519::Pair;

pub type PatraPairSigner = PairSigner<subxt::ContractsTemplateRuntime, RelayerPair>;

#[derive(Clone, Debug, Eq, PartialEq, Encode, Decode)]
pub struct BtcRelayedTxInfo {
    pub block_hash: H256,
    pub merkle_proof: PartialMerkleTree,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq, Default, Encode, Decode)]
pub struct BtcTxState {
    pub tx_type: BtcTxType,
    pub result: BtcTxResult,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq, Encode, Decode)]
pub enum BtcTxResult {
    Success,
    Failed,
}

impl Default for BtcTxResult {
    fn default() -> Self {
        BtcTxResult::Failed
    }
}

#[derive(Clone, Copy, Debug, Eq, PartialEq, Encode, Decode)]
pub enum BtcTxType {
    Withdrawal,
    Deposit,
    HotAndCold,
    TrusteeTransition,
    Irrelevance,
}

impl Default for BtcTxType {
    fn default() -> Self {
        BtcTxType::Irrelevance
    }
}

#[derive(PartialEq, Debug, Eq, Clone, Default, Encode, Decode)]
pub struct PartialMerkleTree {
    /// The total number of transactions in the block
    pub tx_count: u32,
    /// Transaction hashes and internal hashes
    pub hashes: Vec<H256>,
    /// node-is-parent-of-matched-txid bits
    pub bits: Vec<bool>,
}

impl Serializable for PartialMerkleTree {
    fn serialize(&self, stream: &mut Stream) {
        let mut bytes: Vec<u8> = vec![0; (self.bits.len() + 7) / 8];
        for p in 0..self.bits.len() {
            bytes[p / 8] |= (self.bits[p] as u8) << (p % 8) as u8;
        }
        stream
            .append(&self.tx_count)
            .append_list(&self.hashes)
            .append_list(&bytes);
    }
}

#[derive(Debug, PartialEq, Eq, Clone, Encode, Decode)]
pub struct BlockDetails {
    pub miner: String,
    pub difficulty: u64,
}

#[cfg(test)]
mod tests {
    use super::*;
    use light_bitcoin::primitives::h256_rev;

    #[test]
    fn test_header() {
        let header = BtcHeader {
            version: 536870912,
            previous_header_hash: h256_rev(
                "0000000000000000000a4adf6c5192128535d4dcb56cfb5753755f8d392b26bf",
            ),
            merkle_root_hash: h256_rev(
                "1d21e60acb0b12e5cfd3f775edb647f982a2d666f9886b2f61ea5e72577b0f5e",
            ),
            time: 1558168296,
            bits: Compact::new(388627269),
            nonce: 1439505020,
        };
        let expect = "0000000000000000001721f58deb88b0710295a02551f0dde1e2e231a15f1882";
        let now = hex::encode(&header.hash());
        assert_eq!(&now, expect);
    }
}
