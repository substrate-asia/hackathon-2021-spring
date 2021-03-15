use std::{collections::BTreeMap, thread, time::Duration};

use codec::Encode;
use light_bitcoin::{
    chain::Block as BtcBlock, keys::Network, merkle::PartialMerkleTree as BtcPartialMerkleTree,
    primitives::hash_rev, serialization::serialize,
};

use sp_core::crypto::Pair as _;

use crate::{bitcoin::Bitcoin, cmd::Config, error::Result, relayer::Relayer, types::*};
use sp_core::H256;

const BTC_BLOCK_CONFIRM_GAP: u32 = 6;

#[derive(Clone)]
pub struct Service {
    conf: Config,
    relayer: Relayer,
    signer: PatraPairSigner,
    bitcoin: Bitcoin,

    // +----+      +----+               +----+      +----+               +----+
    // |    | ---> |    | ---> ... ---> |    | ---> |    | ---> ... ---> |    |
    // +----+      +----+               +----+      +----+               +----+
    //   |                                             |                    |
    // confirmed height                           current height      latest height
    // The BTC blocks (confirmed height ~ current height).
    blocks: BTreeMap<u32, BtcBlock>,
    // The confirmed BTC block height in the inkbridge contract.
    confirmed_height: u32,
    // The latest BTC block height in the inkbridge contract.
    current_height: u32,
    // The BTC genesis information in the inkbridge contract.
    btc_genesis: BtcHeaderInfo,
}

impl Service {
    async fn new(conf: Config) -> Result<Service> {
        let pair = RelayerPair::from_string(&conf.relayer_signer, None).unwrap();
        let signer = PatraPairSigner::new(pair);
        info!("[Service|new] Signer Account: {}", signer.account_id());

        let patra_url = &conf.patra_url;
        info!("[Service|new] Connecting Patract node: {}", patra_url);
        let relayer = Relayer::new(
            patra_url.clone(),
            conf.contract_address.clone(),
            conf.contract_metadata.clone(),
            conf.rpc_timeout,
            signer.clone(),
        )
        .await?;
        info!("[Service|new] Connected Patract node: {}", patra_url);

        let btc_url = &conf.btc_url;
        info!("[Service|new] Connecting Bitcoin node.");
        let bitcoin = Bitcoin::new(btc_url.as_str(), conf.rpc_timeout);
        info!("[Service|new] Connected Bitcoin node.");

        // let btc_genesis = relayer
        //     .btc_block_header(&H256::from(hex!(
        //         "0000000000000000004801aaa0db00c30a6c8d89d16fd30a2115dda5a9fc3469"
        //     )))
        //     .await?;

        // let b0 = BtcHeader {
        //     version: 0x20000002,
        //     previous_header_hash: h256_rev(
        //         "0000000000000000004801aaa0db00c30a6c8d89d16fd30a2115dda5a9fc3469",
        //     ),
        //     merkle_root_hash: h256_rev(
        //         "b2f6c37fb65308f2ff12cfc84e3b4c8d49b02534b86794d7f1dd6d6457327200",
        //     ),
        //     time: 1501593084,
        //     bits: Compact::new(0x18014735),
        //     nonce: 0x7a511539,
        // }; // 478557  btc/bch common use
        // info!("genesis block => {:?} {:?}",b0, hex::encode(&b0.hash()));

        // let b1 = BtcHeader {
        //     version: 0x20000002,
        //     previous_header_hash: h256_rev(
        //         "000000000000000000eb9bc1f9557dc9e2cfe576f57a52f6be94720b338029e4",
        //     ),
        //     merkle_root_hash: h256_rev(
        //         "5b65144f6518bf4795abd428acd0c3fb2527e4e5c94b0f5a7366f4826001884a",
        //     ),
        //     time: 1501593374,
        //     bits: Compact::new(0x18014735),
        //     nonce: 0x7559dd16,
        // }; //478558  bch forked from here
        //
        // relayer.push_btc_header(&b1).await?;

        let btc_genesis = relayer.btc_genesis_info().await?;
        let confirmed_height = relayer.btc_confirmed_index().await?.height;
        let best_height = relayer.btc_best_index().await?.height;
        let mut current_height = best_height;
        info!(
            "[Service|new] Confirmed Height: {}, Best Height: {}",
            confirmed_height, best_height
        );
        assert!(best_height - confirmed_height <= BTC_BLOCK_CONFIRM_GAP);

        // Fetch BTC blocks #confirmed_height - #best_height from Patract contract.
        info!(
            "[Service|new] Fetching BTC block hashes (#{}-#{}) from Patract contract",
            confirmed_height, best_height
        );
        let mut hashes = BTreeMap::new();
        for height in confirmed_height..=best_height {
            let hash = relayer.btc_block_hash_for(height).await?;
            hashes.insert(height, hash);
        }

        // Fetch BTC blocks #confirmed_height - #best_height from Bitcoin network.
        info!(
            "[Service|new] Fetching BTC blocks (#{}-#{}) from bitcoin network",
            confirmed_height, best_height
        );
        // Get the btc blocks that we need.
        let mut blocks = BTreeMap::new();
        for height in confirmed_height..=best_height {
            let block = bitcoin.block_by_height(height).await?;
            let hash_in_bitcoin = hash_rev(block.hash());
            // need to check if there is a fork block
            let hash_in_contract = hashes.get(&height).expect("the height must exist; qed");
            if hash_in_contract.contains(&hash_in_bitcoin) {
                blocks.insert(height, block);
                current_height = height;
            } else {
                // let hash_in_contract = hash_in_contract
                //     .iter()
                //     .map(|hash| hash_rev(*hash))
                //     .collect::<Vec<_>>();
                // let hash_in_bitcoin = hash_rev(block.hash());
                warn!(
                    "[Service|new] The BTC block #{} on the Bitcoin network and the Patract contract does not match, \
                    there may be a fork block on Patract contract, we need to resubmit this block, \
                    BTC block #{} hash in Patract ({:?}), BTC block #{} hash in Bitcoin ({:?})",
                    height, height, hash_in_contract, height, hash_in_bitcoin
                );
            }
        }
        info!(
            "[Service|new] BTC Blocks: {:?}",
            blocks
                .iter()
                .map(|(height, block)| (height, hash_rev(block.hash())))
                .collect::<Vec<_>>()
        );

        Ok(Self {
            conf,
            relayer,
            signer,
            bitcoin,
            blocks,
            confirmed_height,
            current_height,
            btc_genesis,
        })
    }

    pub async fn relay(conf: Config) -> Result<()> {
        loop {
            let conf = conf.clone();
            let mut service = Self::new(conf).await?;
            info!(
                "[Service|relay] Start to relay the Bitcoin block into the network, \
                Confirmed X-BTC Block #{}, Current X-BTC Block #{}",
                service.confirmed_height, service.current_height
            );
            let handle = service.run().await;
            match handle {
                Ok(_) => error!("[Service|relay] Relay service exits unexpectedly"),
                Err(err) => error!("[Service|relay] Relay service error: {:?}", err),
            }
            info!("[Service|relay] New relay service will restart after 15s");
            tokio::time::delay_for(Duration::from_secs(15)).await;
        }
    }

    async fn run(&mut self) -> Result<()> {
        // Check for missing transactions
        if !self.conf.only_header {
            // TODO
            let confirmed_block = self.confirmed_block();
            self.push_btc_transaction(confirmed_block).await?;
        }
        let mut new_height = self.current_height + 1;
        loop {
            // Get new block from BTC-network based on BTC block height in network.
            let new_block = match self.bitcoin.block_by_height(new_height).await {
                Ok(block) => block,
                Err(_) => {
                    info!("[Service|run] Relay to the latest Block #{}", new_height);
                    info!("[Service|run] Waiting for next BTC Block...");
                    tokio::time::delay_for(Duration::from_secs(self.conf.btc_block_interval)).await;
                    continue;
                }
            };
            // Check if the current BTC block is a fork block.
            if self.is_fork_block(new_height, &new_block) {
                // example: next block #1863321, current block #1863320 is a fork block
                // rollback to the block #18663319 (current block = #18663319, next block = #18663320)
                self.blocks.remove(&self.current_height);
                self.current_height -= 1;
                warn!(
                    "[Service|is_fork_block] Rollback block to #{}",
                    self.current_height
                );
                new_height -= 1;
                continue;
            }
            self.blocks.insert(new_height, new_block);
            self.current_height = new_height;

            // ================================================================

            let confirmed_block = self.confirmed_block();
            let current_block = self.current_block();

            if let Some(miner) =
                super::utils::extract_block_miner_addr(current_block, Network::Mainnet)
            {
                self.relayer
                    .push_block_details_with_contract(
                        &hash_rev(current_block.header.hash()),
                        &BlockDetails {
                            miner: miner.to_string(),
                            difficulty: (current_block.header.bits.to_f64() * 100.0).round() as u64,
                        },
                        self.conf.app_address.clone(),
                        self.conf.app_metadata.clone(),
                    )
                    .await?;
            }

            // Push BTC block header and confirmed transaction to the inkbridge contract.
            if let Err(err) = self.push_btc_block(&current_block, &confirmed_block).await {
                error!("[Service|push_btc_block] error: {:?}", err);
                tokio::time::delay_for(Duration::from_secs(5)).await;
                return Err(err);
            }

            // Make sure btc header and transactions were submitted to the inkbridge contract.
            let current_block_hash = current_block.hash();
            if let Some(header) = self
                .relayer
                .btc_block_header(&hash_rev(current_block_hash))
                .await?
            {
                info!(
                    "[Service|run] BTC Block #{} ({:?}) was submitted successfully",
                    header.height,
                    hash_rev(header.header.hash()),
                );
                let new_confirmed_height = self.relayer.btc_confirmed_index().await?.height;
                self.update_confirmed_height(new_confirmed_height);
                new_height += 1;
            } else {
                warn!(
                    "[Service|run] BTC BlockHeaderInfo ({:?}) doesn't exist on contract chain",
                    current_block_hash
                );
                self.blocks.remove(&self.current_height);
                self.current_height -= 1;
            }

            info!(
                "[Service|run] new_height: {}, BTC Blocks: {:?}",
                new_height,
                self.blocks
                    .iter()
                    .map(|(height, block)| (height, hash_rev(block.hash())))
                    .collect::<Vec<_>>()
            );

            thread::sleep(Duration::from_secs(3));
        }
    }

    pub async fn validate_transaction(
        conf: Config,
        block_height: u32,
        tx_id: String,
    ) -> Result<()> {
        let pair = RelayerPair::from_string(&conf.relayer_signer, None).unwrap();
        let signer = PatraPairSigner::new(pair);
        info!("[Service|new] Signer Account: {}", signer.account_id());

        let patra_url = &conf.patra_url;
        info!("[Service|new] Connecting Patract node: {}", patra_url);
        let relayer = Relayer::new(
            patra_url.clone(),
            conf.contract_address.clone(),
            conf.contract_metadata.clone(),
            conf.rpc_timeout,
            signer.clone(),
        )
        .await?;
        info!("[Service|new] Connected Patract node: {}", patra_url);

        let btc_url = &conf.btc_url;
        info!("[Service|new] Connecting Bitcoin node.");
        let bitcoin = Bitcoin::new(btc_url.as_str(), conf.rpc_timeout);
        info!("[Service|new] Connected Bitcoin node.");

        let block = bitcoin.block_by_height(block_height).await?;
        let mut tx_hashes = Vec::with_capacity(block.transactions.len());
        let mut tx_matches = Vec::with_capacity(block.transactions.len());

        let match_tx = hash_rev(H256::from_slice(
            hex::decode(tx_id.clone()).unwrap().as_slice(),
        ));
        for tx in &block.transactions {
            // Prepare for constructing partial merkle tree
            let tx_hash = tx.hash();
            tx_hashes.push(tx_hash);
            if tx_hash == match_tx {
                tx_matches.push(true);
            } else {
                tx_matches.push(false);
            }
        }

        let merkle_proof = BtcPartialMerkleTree::from_txids(&tx_hashes, &tx_matches);
        let merkle_proof = PartialMerkleTree {
            tx_count: merkle_proof.tx_count,
            hashes: merkle_proof.hashes,
            bits: merkle_proof.bits,
        };

        let ret = relayer
            .validate_btc_transaction(&merkle_proof, &match_tx, &hash_rev(block.header.hash()))
            .await?;

        info!(
            "[Service|validate_transaction] validate transaction {}, result: {}",
            tx_id, ret
        );

        relayer
            .validate_btc_transaction_with_contract(
                &merkle_proof,
                &match_tx,
                &hash_rev(block.header.hash()),
                conf.app_address,
                conf.app_metadata,
            )
            .await?;

        Ok(())
    }

    pub async fn push_transaction(conf: Config, block_height: u32, tx_id: String) -> Result<()> {
        let pair = RelayerPair::from_string(&conf.relayer_signer, None).unwrap();
        let signer = PatraPairSigner::new(pair);
        info!("[Service|new] Signer Account: {}", signer.account_id());

        let patra_url = &conf.patra_url;
        info!("[Service|new] Connecting Patract node: {}", patra_url);
        let relayer = Relayer::new(
            patra_url.clone(),
            conf.contract_address.clone(),
            conf.contract_metadata.clone(),
            conf.rpc_timeout,
            signer.clone(),
        )
        .await?;
        info!("[Service|new] Connected Patract node: {}", patra_url);

        let btc_url = &conf.btc_url;
        info!("[Service|new] Connecting Bitcoin node.");
        let bitcoin = Bitcoin::new(btc_url.as_str(), conf.rpc_timeout);
        info!("[Service|new] Connected Bitcoin node.");

        let block = bitcoin.block_by_height(block_height).await?;
        let mut tx_hashes = Vec::with_capacity(block.transactions.len());
        let mut tx_matches = Vec::with_capacity(block.transactions.len());

        let match_tx = hash_rev(H256::from_slice(
            hex::decode(tx_id.clone()).unwrap().as_slice(),
        ));
        let mut raw_tx = Default::default();
        for tx in &block.transactions {
            // Prepare for constructing partial merkle tree
            let tx_hash = tx.hash();
            tx_hashes.push(tx_hash);
            if tx_hash == match_tx {
                tx_matches.push(true);
                raw_tx = tx.clone();
            } else {
                tx_matches.push(false);
            }
        }

        let merkle_proof = BtcPartialMerkleTree::from_txids(&tx_hashes, &tx_matches);
        let merkle_proof = PartialMerkleTree {
            tx_count: merkle_proof.tx_count,
            hashes: merkle_proof.hashes,
            bits: merkle_proof.bits,
        };

        let relayed_info = BtcRelayedTxInfo {
            block_hash: hash_rev(block.hash()),
            merkle_proof,
        };

        info!(
            "[Service|push_transaction] validate transaction {}, relayed_info: {:?}",
            tx_id, relayed_info,
        );

        relayer
            .push_btc_transaction_with_contract(
                &raw_tx,
                &relayed_info,
                None,
                conf.app_address,
                conf.app_metadata,
            )
            .await?;

        Ok(())
    }

    pub async fn gen_tx_merkle_proof(conf: Config, block_height: u32, tx_id: String) -> Result<()> {
        let pair = RelayerPair::from_string(&conf.relayer_signer, None).unwrap();
        let signer = PatraPairSigner::new(pair);
        info!("[Service|new] Signer Account: {}", signer.account_id());

        let patra_url = &conf.patra_url;
        info!("[Service|new] Connecting Patract node: {}", patra_url);

        let btc_url = &conf.btc_url;
        info!("[Service|new] Connecting Bitcoin node.");
        let bitcoin = Bitcoin::new(btc_url.as_str(), conf.rpc_timeout);
        info!("[Service|new] Connected Bitcoin node.");

        let block = bitcoin.block_by_height(block_height).await?;
        let mut tx_hashes = Vec::with_capacity(block.transactions.len());
        let mut tx_matches = Vec::with_capacity(block.transactions.len());

        let match_tx = hash_rev(H256::from_slice(
            hex::decode(tx_id.clone()).unwrap().as_slice(),
        ));
        let mut raw_tx = Default::default();
        for tx in &block.transactions {
            // Prepare for constructing partial merkle tree
            let tx_hash = tx.hash();
            tx_hashes.push(tx_hash);
            if tx_hash == match_tx {
                tx_matches.push(true);
                raw_tx = tx.clone();
            } else {
                tx_matches.push(false);
            }
        }

        let merkle_proof = BtcPartialMerkleTree::from_txids(&tx_hashes, &tx_matches);
        let merkle_proof = PartialMerkleTree {
            tx_count: merkle_proof.tx_count,
            hashes: merkle_proof.hashes,
            bits: merkle_proof.bits,
        };

        let relayed_info = BtcRelayedTxInfo {
            block_hash: hash_rev(block.hash()),
            merkle_proof,
        };

        let mut output_address = "".to_string();
        if let Some(v) = super::utils::extract_output_addr(&raw_tx.outputs[0], Network::Mainnet) {
            output_address = v.to_string();
        }
        let amount = raw_tx.outputs[0].value;

        #[derive(serde::Serialize, serde::Deserialize, Debug)]
        pub struct MerkleProof {
            tx_id: String,
            output_address: String,
            amount: u64,
            raw_tx: String,
            merkle_proof: String,
        }

        info!(
            "[Service|gen_tx_merkle_proof] data:\n {:#?}",
            MerkleProof {
                tx_id,
                output_address,
                amount,
                raw_tx: hex::encode(serialize(&raw_tx).as_slice()),
                merkle_proof: hex::encode(relayed_info.encode().as_slice()),
            }
        );

        Ok(())
    }

    /// Get the confirmed bitcoin block.
    fn confirmed_block(&self) -> &BtcBlock {
        self.blocks
            .get(&self.confirmed_height)
            .expect("Block with confirmed height must exist; qed")
    }

    /// Get the current bitcoin block.
    fn current_block(&self) -> &BtcBlock {
        self.blocks
            .get(&self.current_height)
            .expect("Block with current height must exist; qed")
    }

    /// Update the confirmed block height and remove the confirmed blocks from the blocks.
    fn update_confirmed_height(&mut self, new_confirmed_height: u32) {
        assert!(new_confirmed_height >= self.confirmed_height);
        assert!(new_confirmed_height <= self.current_height);
        // remove all blocks that the height < confirmed height
        for height in self.confirmed_height..new_confirmed_height {
            self.blocks.remove(&height);
        }
        self.confirmed_height = new_confirmed_height;
    }
}

impl Service {
    // Check if the current BTC block is a fork block,
    // if it is, return the `true`, otherwise return `false`.
    fn is_fork_block(&self, new_height: u32, new_block: &BtcBlock) -> bool {
        // if `new_block_header.prev_header_hash != current_block_header_hash`,
        // then current block is a fork block, and we should rollback to the previous block of current block.
        //
        // example: new block #1863321, current block # 18663320 (is a fork block)
        // we should rollback to the block #18663319 to check if block #1863319 is a fork block too.
        if self.current_block().hash() != new_block.header().previous_header_hash {
            warn!(
                "[Service|is_fork_block] Current Block #{} ({:?}) is a fork block",
                self.current_height,
                hash_rev(self.current_block().hash()),
            );
            info!(
                "[Service|is_fork_block] New Block Hash #{} ({:?}), Previous Block Hash: {:?}",
                new_height,
                hash_rev(new_block.hash()),
                hash_rev(new_block.header().previous_header_hash)
            );
            return true;
        }
        false
    }

    /// Submit BTC block header, BTC deposit/withdraw transaction to the inkbridge contract.
    pub async fn push_btc_block(
        &self,
        current_block: &BtcBlock,
        confirmed_block: &BtcBlock,
    ) -> Result<()> {
        // Check whether the current block header has already existed on the inkbridge contract.
        let current_block_hash = current_block.hash();
        if let Some(block_header) = self.relayer.btc_block_header(&current_block_hash).await? {
            info!(
                "[Service|push_btc_block] Block Header #{} ({:?}) has been pushed to the network",
                block_header.height,
                hash_rev(current_block_hash)
            );
        } else {
            self.push_btc_header(current_block).await?;
        }

        // Check whether push header only.
        if self.conf.only_header {
            return Ok(());
        }

        self.push_btc_transaction(confirmed_block).await?;
        Ok(())
    }

    /// Submit BTC block header to the bridge contract.
    pub async fn push_btc_header(&self, block: &BtcBlock) -> Result<()> {
        info!(
            "[Service|push_btc_header] Block Hash: {:?}",
            hash_rev(block.hash())
        );

        let header = BtcHeader {
            version: block.header.version,
            previous_header_hash: block.header.previous_header_hash,
            merkle_root_hash: block.header.merkle_root_hash,
            time: block.header.time,
            bits: Compact::from(u32::from(block.header.bits)),
            nonce: block.header.nonce,
        };
        self.relayer.push_btc_header(&header).await?;
        Ok(())
    }

    /// Submit BTC deposit/withdraw transaction to the bridge contract.
    pub async fn push_btc_transaction(&self, confirmed_block: &BtcBlock) -> Result<()> {
        info!(
            "[Service|push_btc_transaction] Push Transactions Of Confirmed Block Hash: {:?}",
            hash_rev(confirmed_block.hash())
        );

        let mut needed = Vec::new();
        let mut tx_hashes = Vec::with_capacity(confirmed_block.transactions.len());
        let mut tx_matches = Vec::with_capacity(confirmed_block.transactions.len());

        for tx in &confirmed_block.transactions {
            // Prepare for constructing partial merkle tree
            tx_hashes.push(tx.hash());
            if tx.is_coinbase() {
                tx_matches.push(false);
                continue;
            }
            tx_matches.push(true);

            let outpoint = tx.inputs[0].previous_output;
            let prev_tx_hash = hex::encode(hash_rev(outpoint.txid));
            let prev_tx = self.bitcoin.raw_transaction(prev_tx_hash).await?;

            needed.push((tx.clone(), Some(prev_tx)));
        }

        if !needed.is_empty() {
            info!(
                "[Service|push_btc_transaction] Generate partial merkle tree from the Confirmed Block {:?}",
                hash_rev(confirmed_block.hash())
            );

            // Construct partial merkle tree
            // We can never have zero txs in a merkle block, we always need the coinbase tx.
            let merkle_proof = BtcPartialMerkleTree::from_txids(&tx_hashes, &tx_matches);
            let merkle_proof = PartialMerkleTree {
                tx_count: merkle_proof.tx_count,
                hashes: merkle_proof.hashes,
                bits: merkle_proof.bits,
            };

            // Push btc relay (withdraw/deposit) transaction
            for (tx, prev_tx) in needed {
                let relayed_info = BtcRelayedTxInfo {
                    block_hash: confirmed_block.hash(),
                    merkle_proof: merkle_proof.clone(),
                };

                // if let Some(state) = self.relayer.btc_tx_state(&tx.hash()).await? {
                //     if state.result == BtcTxResult::Success {
                //         continue;
                //     }
                // }

                self.relayer
                    .push_btc_transaction(&tx, &relayed_info, &prev_tx)
                    .await?;
            }
        } else {
            info!(
                "[Service|push_btc_transaction] No X-BTC Deposit/Withdraw Transactions in th Confirmed Block {:?}",
                hash_rev(confirmed_block.hash())
            );
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use sp_core::crypto::DEV_PHRASE;

    // use your own node config.
    const SUB_WS_URL: &str = "ws://127.0.0.1:8087";
    const BITCOIN_HTTP_URL: &str = "http://user:pass@127.0.0.1:8332";
    const TIMEOUT: u64 = 15;

    #[ignore]
    #[tokio::test]
    async fn test_push_btc_header() {
        let bitcoin = Bitcoin::new(BITCOIN_HTTP_URL, TIMEOUT);

        let relayer = Relayer::new(SUB_WS_URL, TIMEOUT).await.unwrap();
        let height = relayer.btc_best_index().await.unwrap().height;
        let block = bitcoin.block_by_height(height + 1).await.unwrap();

        let alice = RelayerPair::from_string(&format!("{}//Alice", DEV_PHRASE), None).unwrap();
        let signer = PatraPairSigner::new(alice);
        relayer
            .push_btc_header(&signer, block.header())
            .await
            .unwrap();
    }

    #[tokio::test]
    async fn test_push_transaction() {
        let conf = Config {
            btc_url: "http://user:password@127.0.0.1:8332".parse().unwrap(),
            btc_block_interval: 120,
            patra_url: "ws://127.0.0.1:8000".parse().unwrap(),
            relayer_signer: format!("{}//Alice", DEV_PHRASE),
            only_header: true,
            log_path: std::path::Path::new("log/btc_relay.log").to_path_buf(),
            log_level: log::LevelFilter::Debug,
            log_roll_size: 100,
            log_roll_count: 5,
            rpc_timeout: 15,
        };
        crate::logger::init(&conf).unwrap();
        let service = Service::new(conf).await.unwrap();
        let block = service.bitcoin.block_by_height(1_836_232).await.unwrap();
        service.push_btc_transaction(&block).await.unwrap();
    }
}
