#![cfg_attr(not(feature = "std"), no_std)]

mod parser;

use ink_lang as ink;
use ink_log::CustomEnvironment;

#[ink::contract(env = crate::CustomEnvironment)]
mod inkbridge {
    use crate::parser::*;
    use bridge_stub::BtcBridge;
    use ink_env::call::FromAccountId;
    use ink_log::{error, info};
    use ink_prelude::{string::String, vec, vec::Vec};
    use ink_storage::collections::HashMap as StorageHashMap;
    use ink_storage::{
        traits::{PackedLayout, SpreadLayout},
        Lazy,
    };
    use light_bitcoin::{
        chain::Transaction,
        keys::Network,
        merkle::PartialMerkleTree,
        serialization::{deserialize, Reader},
    };
    use scale::Decode;
    use wbtc::WBTC;

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        /// Cannot deserialize the header or tx vec
        DeserializeErr,

        BadMerkleProof,
        /// Previous tx id not equal input point hash
        InvalidPrevTx,

        HeaderNotFound,
        /// The tx is not yet confirmed, i.e, the block of which is not confirmed.
        UnconfirmedTx,
        /// reject replay proccessed tx
        ReplayedTx,
    }

    pub type Result<T> = core::result::Result<T, Error>;

    #[derive(Debug, PartialEq, Eq, Clone, scale::Encode, scale::Decode)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink_storage::traits::StorageLayout)
    )]
    pub struct RelayBlock {
        pub relayer: AccountId,
        pub miner: String,
        pub difficulty: u64,
        pub nonce: u32,
        pub height: u32,
        pub hash: Hash,
    }

    #[derive(
        Debug, PartialEq, Eq, Clone, scale::Encode, scale::Decode, PackedLayout, SpreadLayout,
    )]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink_storage::traits::StorageLayout)
    )]
    pub struct CheckedTansaction {
        pub tx_hash: Hash,
        pub height: u32,
        pub requester: AccountId,
        pub status: bool,
    }

    #[derive(
        Debug,
        Default,
        PartialEq,
        Eq,
        Clone,
        scale::Encode,
        scale::Decode,
        PackedLayout,
        SpreadLayout,
    )]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink_storage::traits::StorageLayout)
    )]
    pub struct BlockDetails {
        pub miner: String,
        pub difficulty: u64,
    }

    #[ink(event)]
    pub struct PushTransaction {
        #[ink(topic)]
        tx_hash: Hash,
    }

    #[ink(storage)]
    pub struct Inkbridge {
        bridge: Lazy<BtcBridge>,
        wbtc: Lazy<WBTC>,
        validate_lists: Vec<CheckedTansaction>,
        blocks: StorageHashMap<Hash, BlockDetails>,
        tx_state: StorageHashMap<Hash, bool>,
        deposit_addresses: StorageHashMap<String, AccountId>,
        owner: AccountId,
    }

    impl Inkbridge {
        #[ink(constructor)]
        pub fn new(btc_bridge: AccountId, wbtc_token: AccountId) -> Self {
            let bridge: BtcBridge = FromAccountId::from_account_id(btc_bridge);
            let wbtc: WBTC = FromAccountId::from_account_id(wbtc_token);
            Self {
                bridge: Lazy::new(bridge),
                wbtc: Lazy::new(wbtc),
                validate_lists: vec![],
                blocks: StorageHashMap::new(),
                tx_state: StorageHashMap::new(),
                deposit_addresses: StorageHashMap::new(),
                owner: Self::env().caller(),
            }
        }

        #[ink(message)]
        pub fn latest_block_list(&self) -> Vec<RelayBlock> {
            let mut lists = vec![];
            let best_index = self.bridge.best_index();
            for i in 0..10u32 {
                let height = best_index.height - i;
                if let Some(hashes) = self.bridge.block_hash_for(height) {
                    for v in hashes.iter() {
                        if let Some(header) = self.bridge.header_with_relayer(*v) {
                            let mut miner = "".parse().unwrap();
                            let mut difficulty = 0u64;
                            if let Some(info) = self.blocks.get(v) {
                                miner = info.miner.clone();
                                difficulty = info.difficulty;
                            }
                            lists.push(RelayBlock {
                                relayer: header.0,
                                miner,
                                difficulty,
                                nonce: header.1.header.nonce,
                                height,
                                hash: *v,
                            })
                        }
                    }
                }
            }
            lists
        }

        #[ink(message)]
        pub fn validate_transaction(
            &mut self,
            proof: PartialMerkleTree,
            tx_hash: Hash,
            block_hash: Hash,
        ) {
            let ret = self.bridge.validate_transaction(proof, tx_hash, block_hash);
            let mut height = 0;
            if let Some(header) = self.bridge.header(block_hash) {
                height = header.height;
            }
            let caller = self.env().caller();
            self.validate_lists.push(CheckedTansaction {
                tx_hash,
                height,
                requester: caller,
                status: ret,
            });
        }

        #[ink(message)]
        pub fn validate_transaction_list(&self) -> Vec<CheckedTansaction> {
            self.validate_lists.clone()
        }

        #[ink(message)]
        pub fn set_block_details(&mut self, hash: Hash, info: BlockDetails) {
            self.blocks.entry(hash).or_insert(info);
        }

        #[ink(message)]
        pub fn set_key_pair(&mut self, btc_addr: String, receiver: AccountId) {
            // assert_eq!(self.env().caller(), self.owner, "not owner");
            self.deposit_addresses.entry(btc_addr).or_insert(receiver);
        }

        #[ink(message)]
        pub fn get_account(&self, btc_addr: String) -> Option<AccountId> {
            self.deposit_addresses.get(&btc_addr).cloned()
        }

        #[ink(message)]
        pub fn get_btc_deposit_address(&self) -> Option<String> {
            let caller = self.env().caller();
            if let Some(addr) = self.deposit_addresses.iter().find(|x| *(*x).1 == caller) {
                Some(addr.0.clone())
            } else {
                None
            }
        }

        #[ink(message)]
        pub fn add_btc_deposit_address(&mut self, btc_addr: String) {
            // assert_eq!(self.env().caller(), self.owner, "not owner");
            assert!(self.deposit_addresses.get(&btc_addr).is_none());

            self.deposit_addresses.insert(btc_addr, Default::default());
        }

        #[ink(message)]
        pub fn verified_transactions(&self) -> Vec<Hash> {
            let mut txs = vec![];
            for v in self.tx_state.iter().filter(|x| *(*x).1 == true) {
                txs.push(*v.0)
            }
            txs
        }

        #[ink(message)]
        pub fn request_btc_deposit_address(&mut self) -> Option<String> {
            if let Some(addr) = self
                .deposit_addresses
                .iter_mut()
                .find(|x| *(*x).1 == Default::default())
            {
                *addr.1 = Self::env().caller();
                Some(addr.0.clone())
            } else {
                None
            }
        }

        #[ink(message)]
        pub fn push_transaction(
            &mut self,
            raw_tx: Vec<u8>,
            relayed_info: Vec<u8>,
            prev_tx: Option<Vec<u8>>,
        ) -> Result<()> {
            // let raw_tx: Transaction =
            //     deserialize(Reader::new(raw_tx.as_slice())).map_err(|_| Error::DeserializeErr)?;
            let raw_tx: Transaction =
                deserialize(Reader::new(raw_tx.as_slice())).expect("failed to deserialize tx vec");
            let prev_tx = if let Some(prev_tx) = prev_tx {
                // let prev_tx: Transaction = deserialize(Reader::new(prev_tx.as_slice()))
                //     .map_err(|_| Error::DeserializeErr)?;
                let prev_tx: Transaction = deserialize(Reader::new(prev_tx.as_slice()))
                    .expect("failed to deserialize pre_tx vec");
                Some(prev_tx)
            } else {
                None
            };
            let relayed_info = BtcRelayedTxInfo::decode(&mut relayed_info.as_slice())
                .expect("failed to decode relayed info");
            let relay_tx = relayed_info.into_relayed_tx(raw_tx);
            info!(
                "[push_transaction] from:{:?}, relay_tx:{:?}, prev_tx:{:?}",
                self.env().caller(),
                relay_tx,
                prev_tx
            );

            assert!(self.apply_push_transaction(relay_tx, prev_tx).is_ok());
            Ok(())
        }
    }

    #[ink(impl)]
    impl Inkbridge {
        fn apply_push_transaction(
            &mut self,
            tx: BtcRelayedTx,
            prev_tx: Option<Transaction>,
        ) -> Result<()> {
            use core::convert::TryFrom;

            let tx_hash = Hash::try_from(tx.raw.hash().as_bytes()).unwrap();
            let block_hash = tx.block_hash;
            let header_info = self
                .bridge
                .header(block_hash)
                .expect("Tx's block header must already exist");
            // verify, check merkle proof
            self.validate_tx(&tx, tx_hash, block_hash, prev_tx.as_ref())?;

            // ensure the tx should belong to the main chain, means should submit main chain tx,
            // e.g. a tx may be packed in main chain block, and forked chain block, only submit main chain tx
            // could pass the verify.
            assert!(self.bridge.is_main_chain(block_hash), "unconfirmed tx");
            // if ConfirmedIndex not set, due to confirm height not beyond genesis height
            let confirmed = self.bridge.confirmed_index();
            let height = header_info.height;
            if height > confirmed.height {
                error!(
                    "[apply_push_transaction] Receive an unconfirmed tx (height:{}, hash:{:?}), confirmed index (height:{}, hash:{:?})",
                    height, tx_hash, confirmed.height, confirmed.hash
                );
                return Err(Error::UnconfirmedTx);
            }
            // check whether replayed tx has been processed, just process failed and not processed tx;
            if let Some(state) = self.tx_state.get(&tx_hash) {
                if *state {
                    error!(
                        "[apply_push_transaction] Reject processed tx (hash:{:?}, result:{:?})",
                        tx_hash, *state
                    );
                    return Err(Error::ReplayedTx);
                }
            }

            assert!(tx.raw.outputs.len() > 0, "not found invalid utxo");

            // note: use
            let btc_addr = extract_output_addr(&tx.raw.outputs[0], Network::Mainnet)
                .expect("not found invalid address");
            let btc_addr = address_to_string(btc_addr);
            info!("extract output address: {}", btc_addr);

            let receiver = self
                .get_account(btc_addr.clone())
                .expect("not recognized btc address.");
            assert_ne!(receiver, Default::default());
            self.deposit_addresses
                .get_mut(&btc_addr)
                .map(|x| *x = Default::default());

            let amount = tx.raw.outputs[0].value;
            info!("transfer {} wbtc to user {:?}", amount, receiver);

            self.wbtc.mint(receiver, amount.into()).unwrap();

            self.tx_state.insert(tx_hash, true);

            self.env().emit_event(PushTransaction { tx_hash });

            Ok(())
        }

        fn validate_tx(
            &mut self,
            tx: &BtcRelayedTx,
            tx_hash: Hash,
            block_hash: Hash,
            prev_tx: Option<&Transaction>,
        ) -> Result<()> {
            info!(
                "[validate_transaction] tx_hash:{:?}, relay tx:{:?}",
                tx_hash, tx
            );

            let ret =
                self.bridge
                    .validate_transaction(tx.merkle_proof.clone(), tx_hash, block_hash);
            if !ret {
                return Err(Error::BadMerkleProof);
            }

            if let Some(prev) = prev_tx {
                // verify prev tx for input
                // only check the first(0) input in transaction
                let previous_txid = prev.hash();
                let expected_id = tx.raw.inputs[0].previous_output.txid;
                if previous_txid != expected_id {
                    error!(
                        "[validate_transaction] Relay previous tx's hash not equal to relay tx first input, expected_id:{:?}, prev:{:?}",
                        expected_id, previous_txid
                    );
                    return Err(Error::InvalidPrevTx);
                }
            }
            Ok(())
        }
    }
}
