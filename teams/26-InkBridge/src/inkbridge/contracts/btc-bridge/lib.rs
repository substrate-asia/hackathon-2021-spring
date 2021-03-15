#![cfg_attr(not(feature = "std"), no_std)]

mod header;
mod merkle;
mod types;

pub use self::btc_bridge::BtcBridge;
pub use self::merkle::PartialMerkleTree;

use ink_lang as ink;
use ink_log::CustomEnvironment;

#[ink::contract(env = crate::CustomEnvironment)]
mod btc_bridge {
    use crate::header;
    use crate::merkle::PartialMerkleTree;
    use crate::types::*;
    use ink_log::info;
    use ink_prelude::{vec, vec::Vec};
    use ink_storage::collections::HashMap as StorageHashMap;

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        /// Cannot deserialize the header or tx vec
        DeserializeErr,
        /// Header already exists
        ExistingHeader,
        /// Can't find previous header
        PrevHeaderNotExisted,
        /// can't find the best header in chain or it's invalid
        InvalidBestIndex,
        /// Invalid proof-of-work (Block hash does not satisfy nBits)
        InvalidPoW,
        /// Futuristic timestamp
        HeaderFuturisticTimestamp,
        /// nBits do not match difficulty rules
        HeaderNBitsNotMatch,
        /// Fork is too long to proceed
        AncientFork,
        /// Validate bad merkle proof
        BadMerkleProof,
        /// When header merkle root don't match to the root calculated from the partial merkle tree
        MerkleRootMismatch,
        /// When partial merkle tree contains no transactions
        NoTransactions,
        /// When there are too many transactions
        TooManyTransactions,
        /// Proof contains more hashes than transactions
        TooManyHashes,
        /// Proof contains less bits than hashes
        ProofLessHashes,
        /// Not all bit were consumed
        NotAllBitConsumed,
        /// Not all hashes were consumed
        NotAllHashesConsumed,
        /// Overflowed the bits array
        OverflowedBitsArray,
        /// Overflowed the hash array
        OverflowedHashArray,
        /// Found identical transaction hashes
        FoundIdenticalTxHash,
    }

    /// The BtcBridge result type.
    pub type Result<T> = core::result::Result<T, Error>;

    #[ink(event)]
    pub struct HeaderPushed {
        #[ink(topic)]
        hash: Hash,
    }

    #[ink(event)]
    pub struct ConfirmedHeight {
        #[ink(topic)]
        height: u32,
        #[ink(topic)]
        hash: Hash,
    }

    #[ink(storage)]
    pub struct BtcBridge {
        /// best header info
        pub best_index: BtcHeaderIndex,
        /// confirmed header info
        pub confirmed_index: BtcHeaderIndex,
        // TODO maybe use Option
        /// block hash list for a height, include forked header hash
        pub block_hash_for: StorageHashMap<u32, Vec<Hash>>,
        /// mark this blockhash is in mainchain
        pub main_chain: StorageHashMap<Hash, bool>,
        /// all valid blockheader (include forked blockheader)
        pub headers: StorageHashMap<Hash, (AccountId, BtcHeaderInfo)>,
        /// get ConfirmationNumber from genesis_config
        pub confirmation_number: u32,
        /// get GenesisInfo (header, height)
        pub genesis_info: BtcHeaderInfo,
        /// get ParamsInfo from genesis_config
        pub params_info: BtcParams,
    }

    impl BtcBridge {
        /// Constructor that initializes the `bool` value to the given `init_value`.
        #[ink(constructor)]
        pub fn new(genesis_info: BtcHeaderInfo, confirmation_number: u32) -> Self {
            // 每21万个区块难度调整一次，需 4 年
            // 每个区块间隔 10 分钟
            // 每 2016 个区块调整一次挖矿难度系数, 需 14 天
            let info = BtcParams::new(486604799, 2 * 60 * 60, 2 * 7 * 24 * 60 * 60, 10 * 60, 4);

            let BtcHeaderInfo {
                header: genesis_header,
                height: genesis_height,
            } = genesis_info;
            let genesis_hash = genesis_header.hash();
            let genesis_index = BtcHeaderIndex {
                hash: genesis_hash,
                height: genesis_height,
            };
            let header_info = BtcHeaderInfo {
                header: genesis_header,
                height: genesis_height,
            };

            let caller = Self::env().caller();

            let mut headers = StorageHashMap::new();
            headers.insert(genesis_hash, (caller, header_info));

            let mut block_hash_for = StorageHashMap::new();
            block_hash_for.insert(genesis_height, vec![genesis_hash]);

            let mut main_chain = StorageHashMap::new();
            main_chain.insert(genesis_hash, true);

            Self {
                best_index: genesis_index,
                confirmed_index: genesis_index,
                block_hash_for,
                main_chain,
                headers,
                confirmation_number,
                genesis_info,
                params_info: info,
            }
        }

        /// Relayer push btc header to chain storage.
        #[ink(message)]
        pub fn push_header(&mut self, header: BtcHeader) -> Result<()> {
            self.apply_push_header(header)
        }

        #[ink(message)]
        pub fn best_index(&self) -> BtcHeaderIndex {
            self.best_index
        }

        #[ink(message)]
        pub fn confirmed_index(&self) -> BtcHeaderIndex {
            self.confirmed_index
        }

        #[ink(message)]
        pub fn header(&self, hash: Hash) -> Option<BtcHeaderInfo> {
            self.headers.get(&hash).map(|v| v.1)
        }

        #[ink(message)]
        pub fn header_with_relayer(&self, hash: Hash) -> Option<(AccountId, BtcHeaderInfo)> {
            self.headers.get(&hash).map(|v| *v)
        }

        #[ink(message)]
        pub fn header_bytes(&self, hash: Hash) -> Option<Vec<u8>> {
            self.headers
                .get(&hash)
                .map(|h| h.1.header.serialize().to_vec())
        }

        #[ink(message)]
        pub fn genesis_info(&self) -> BtcHeaderInfo {
            self.genesis_info
        }

        #[ink(message)]
        pub fn block_hash_for(&self, height: u32) -> Option<Vec<Hash>> {
            self.block_hash_for.get(&height).cloned()
        }

        #[ink(message)]
        pub fn is_main_chain(&self, hash: Hash) -> bool {
            self.main_chain.get(&hash).map(|a| *a).unwrap_or(false)
        }

        #[ink(message)]
        pub fn is_confirmed(&self, hash: Hash) -> bool {
            self.headers
                .get(&hash)
                .and_then(|block| {
                    if block.1.height <= self.confirmed_index.height {
                        Some(true)
                    } else {
                        None
                    }
                })
                .unwrap_or(false)
        }

        #[ink(message)]
        pub fn validate_transaction(
            &self,
            proof: PartialMerkleTree,
            tx_hash: Hash,
            block_hash: Hash,
        ) -> bool {
            if let Some(header) = self.header(block_hash) {
                proof
                    .verify(tx_hash, header.header.merkle_root_hash)
                    .is_ok()
            } else {
                false
            }
        }
    }

    #[ink(impl)]
    impl BtcBridge {
        fn apply_push_header(&mut self, header: BtcHeader) -> Result<()> {
            let caller = self.env().caller();
            // current should not exist
            let hash = header.hash();
            info!(
                "[apply_push_header] pushing header, header:{:?}, hash: {:?}",
                header, hash
            );
            assert!(self.headers.get(&hash).is_none(), "Existed header.");
            // prev header should exist, thus we reject orphan block
            let prev_info = self
                .headers
                .get(&hash_rev(header.previous_header_hash))
                .expect("PrevHeaderNotExisted.")
                .1;
            info!(
                "[apply_push_header] get pre block header info: {:?}",
                prev_info
            );
            // convert btc header to self header info
            let header_info = BtcHeaderInfo {
                header,
                height: prev_info.height + 1,
            };
            // verify header
            let header_verifier = header::HeaderVerifier::new(self, &header_info);
            header_verifier
                .check()
                .expect("[apply_push_header] header verify failed");
            info!("[apply_push_header] header verify succeed");
            // insert into storage
            // let hash = header_info.header.hash();
            // insert valid header into storage
            // Headers::insert(&hash, header_info.clone());
            self.headers.insert(hash, (caller, header_info.clone()));
            // storage height => block list (contains forked header hash)
            // BlockHashFor::mutate(header_info.height, |v| {
            //     if !v.contains(&hash) {
            //         v.push(hash);
            //     }
            // });
            let entry = self.block_hash_for.entry(header_info.height);
            let v = entry.or_insert(Default::default());
            if !v.contains(&hash) {
                v.push(hash);
            }

            info!(
                "[apply_push_header] Verify successfully, insert header to storage [height:{}, hash:{:?}, all hashes of the height:{:?}]",
                header_info.height,
                hash,
                self.block_hash_for(header_info.height)
            );

            // let best_index = Self::best_index();
            let best_index = self.best_index;

            if header_info.height > best_index.height {
                // note update_confirmed_header would mutate other storage depend on BlockHashFor
                if let Some(confirmed_index) = header::update_confirmed_header(self, &header_info) {
                    info!(
                        "[apply_push_header] Update new height:{}, hash:{:?}, confirm:{:?}",
                        header_info.height, hash, confirmed_index
                    );
                    self.env().emit_event(ConfirmedHeight {
                        height: confirmed_index.height,
                        hash: confirmed_index.hash,
                    });
                }

                // new best index
                let new_best_index = BtcHeaderIndex {
                    hash,
                    height: header_info.height,
                };
                // BestIndex::put(new_best_index);
                self.best_index = new_best_index;
            } else {
                // forked chain
                info!(
                    "[apply_push_header] Best index {} larger than this height {}",
                    best_index.height, header_info.height
                );
                header::check_confirmed_header(self, &header_info).expect("invalid forked chain");
            };

            self.env().emit_event(HeaderPushed { hash });
            Ok(())
        }
    }
}
