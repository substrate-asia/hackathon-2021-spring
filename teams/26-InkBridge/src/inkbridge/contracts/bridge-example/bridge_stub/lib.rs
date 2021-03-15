#![cfg_attr(not(feature = "std"), no_std)]

#[allow(unused)]
mod types;

pub use self::bridge_stub::BtcBridge;
pub use crate::types::*;

use ink_lang as ink;

#[ink::contract]
mod bridge_stub {
    use crate::types::*;
    use ink_prelude::vec::Vec;
    use light_bitcoin::{chain::BlockHeader as BtcHeader, merkle::PartialMerkleTree};

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
    pub struct BtcBridge {}

    impl BtcBridge {
        /// Constructor that initializes the `bool` value to the given `init_value`.
        #[ink(constructor)]
        pub fn new(_genesis_info: BtcHeaderInfo, _confirmation_number: u32) -> Self {
            unimplemented!()
        }

        /// Relayer push btc header to chain storage.
        #[ink(message)]
        pub fn push_header(&mut self, _header: BtcHeader) -> Result<()> {
            unimplemented!()
        }

        #[ink(message)]
        pub fn best_index(&self) -> BtcHeaderIndex {
            unimplemented!()
        }

        #[ink(message)]
        pub fn confirmed_index(&self) -> BtcHeaderIndex {
            unimplemented!()
        }

        #[ink(message)]
        pub fn header(&self, _hash: Hash) -> Option<BtcHeaderInfo> {
            unimplemented!()
        }

        #[ink(message)]
        pub fn header_with_relayer(&self, _hash: Hash) -> Option<(AccountId, BtcHeaderInfo)> {
            unimplemented!()
        }

        #[ink(message)]
        pub fn header_bytes(&self, _hash: Hash) -> Option<Vec<u8>> {
            unimplemented!()
        }

        #[ink(message)]
        pub fn genesis_info(&self) -> BtcHeaderInfo {
            unimplemented!()
        }

        #[ink(message)]
        pub fn block_hash_for(&self, _height: u32) -> Option<Vec<Hash>> {
            unimplemented!()
        }

        #[ink(message)]
        pub fn is_main_chain(&self, _hash: Hash) -> bool {
            unimplemented!()
        }

        #[ink(message)]
        pub fn is_confirmed(&self, _hash: Hash) -> bool {
            unimplemented!()
        }

        #[ink(message)]
        pub fn validate_transaction(
            &self,
            _proof: PartialMerkleTree,
            _tx_hash: Hash,
            _block_hash: Hash,
        ) -> bool {
            unimplemented!()
        }
    }
}
