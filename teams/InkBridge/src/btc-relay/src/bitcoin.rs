use std::time::Duration;

use async_jsonrpc_client::{HttpTransport, Params, Transport};
use serde_json::to_value as to_json_value;
use tokio::time;

use light_bitcoin::{
    chain::{Block as BtcBlock, Transaction as BtcTransaction},
    primitives::H256,
    serialization::{deserialize, Reader},
};

use crate::error::Error;

#[derive(Clone)]
pub struct Bitcoin {
    client: HttpTransport,
    timeout: u64,
}

impl Bitcoin {
    /// Create a new Bitcoin RPC client.
    pub fn new<U: Into<String>>(url: U, timeout: u64) -> Self {
        let client = HttpTransport::new(url.into());
        Self { client, timeout }
    }

    pub async fn block_by_height(&self, height: u32) -> Result<BtcBlock, Error> {
        let hash = self.block_hash(height).await.map(|hash| {
            debug!("[Bitcoin|block_hash] Height: {}, Hash: {}", height, hash);
            hash
        })?;
        let block = self.block(&hash).await.map(|block| {
            let tx_size = block.transactions.len();
            debug!("[Bitcoin|block] Hash: {}, Tx size: {}", hash, tx_size);
            block
        })?;
        info!(
            "[Bitcoin|block_by_height] Block #{} ({}), Tx size: {}",
            height,
            hash,
            block.transactions.len(),
        );
        Ok(block)
    }
}

impl Bitcoin {
    pub async fn block_hash(&self, height: u32) -> Result<String, Error> {
        let params = Params::Array(vec![to_json_value(height)?]);
        time::timeout(
            Duration::from_secs(self.timeout),
            self.client.send("getblockhash", params),
        )
        .await?
        .map_err(Into::into)
    }

    pub async fn block<H: AsRef<str>>(&self, hash: H) -> Result<BtcBlock, Error> {
        let params = Params::Array(vec![to_json_value(hash.as_ref())?, to_json_value(0)?]);
        let response: String = time::timeout(
            Duration::from_secs(self.timeout),
            self.client.send("getblock", params),
        )
        .await??;
        let bytes = hex::decode(response)?;
        deserialize(Reader::new(&bytes)).map_err(Into::into)
    }

    pub async fn send_raw_transaction<T: AsRef<str>>(&self, raw_tx: T) -> Result<H256, Error> {
        let params = Params::Array(vec![to_json_value(raw_tx.as_ref())?]);
        let response: String = time::timeout(
            Duration::from_secs(self.timeout),
            self.client.send("sendrawtransaction", params),
        )
        .await??;
        let bytes = hex::decode(response)?;
        Ok(H256::from_slice(&bytes))
    }

    pub async fn raw_transaction<H: AsRef<str>>(
        &self,
        tx_hash: H,
    ) -> Result<BtcTransaction, Error> {
        let params = Params::Array(vec![to_json_value(tx_hash.as_ref())?, to_json_value(0)?]);
        let response: String = time::timeout(
            Duration::from_secs(self.timeout),
            self.client.send("getrawtransaction", params),
        )
        .await??;
        let bytes = hex::decode(response)?;
        deserialize(Reader::new(&bytes)).map_err(Into::into)
    }
}

#[cfg(test)]
mod tests {
    use light_bitcoin::{
        chain::{OutPoint, Transaction, TransactionInput, TransactionOutput},
        merkle::PartialMerkleTree,
        primitives::{h256_rev, hash_rev, Bytes},
        serialization::serialize,
    };

    use super::Bitcoin;

    // use your own bitcoin node config.
    const BITCOIN_HTTP_URL: &str = "http://user:pass@127.0.0.1:8332";
    const TIMEOUT: u64 = 15;

    #[ignore]
    #[tokio::test]
    async fn merkle_proof() {
        let btc = Bitcoin::new(BITCOIN_HTTP_URL, TIMEOUT);
        let block = btc.block_by_height(577696).await.unwrap();

        let mut tx_hashes = Vec::with_capacity(block.transactions.len());
        let mut tx_matches = Vec::with_capacity(block.transactions.len());

        for tx in block.transactions {
            tx_hashes.push(tx.hash());
            if tx.hash()
                == h256_rev("62c389f1974b8a44737d76f92da0f5cd7f6f48d065e7af6ba368298361141270")
            {
                tx_matches.push(true);
            } else {
                tx_matches.push(false);
            }
        }

        let merkle_proof = PartialMerkleTree::from_txids(&tx_hashes, &tx_matches);
        let bytes = serialize(&merkle_proof);
        println!("merkle_proof: {:?}", bytes);

        let mut tx_hashes = vec![];
        let mut tx_matches = vec![];
        let merkle_root = merkle_proof
            .extract_matches(&mut tx_hashes, &mut tx_matches)
            .unwrap();
        let merkle_root = hash_rev(merkle_root);
        let tx_hashes = tx_hashes.into_iter().map(hash_rev).collect::<Vec<_>>();
        println!(
            "merkle_root = {:?}, tx = {:?}, index = {:?}",
            merkle_root, tx_hashes, tx_matches
        );
    }

    #[ignore]
    #[tokio::test]
    async fn headers() {
        let btc = Bitcoin::new(BITCOIN_HTTP_URL, TIMEOUT);
        let start_height = 576576;
        let stop_height = 576576 + 2016 + 100;

        #[derive(serde::Serialize)]
        struct Headers(Vec<(u32, Bytes)>);

        let mut headers = vec![];
        for height in start_height..=stop_height {
            let block = btc.block_by_height(height).await.unwrap();
            let header = block.header();
            let bytes = serialize(header);
            print!("{}/{}\r", height, stop_height);
            headers.push((height, bytes));
        }

        let headers = Headers(headers);
        let dir = std::env::var("CARGO_MANIFEST_DIR").unwrap();
        let file = std::fs::OpenOptions::new()
            .create(true)
            .write(true)
            .open(format!(
                "{}/headers-{}-{}.json",
                dir, start_height, stop_height
            ))
            .unwrap();

        serde_json::to_writer_pretty(file, &headers).unwrap();
    }

    #[ignore]
    #[tokio::test]
    async fn test_block() {
        let btc = Bitcoin::new(BITCOIN_HTTP_URL, TIMEOUT);
        let height = 0;
        // let hash = btc.block_hash(height).await.unwrap();
        // println!("Block #{}: {}", height, hash);
        // let block = btc.block(hash).await.unwrap();
        // println!("Block #{}: {:?}", height, block);
        let block = btc.block_by_height(height).await.unwrap();
        println!("Block #{}: {:?}", height, block);
    }

    #[ignore]
    #[tokio::test]
    async fn test_raw_transaction() {
        let btc = Bitcoin::new(BITCOIN_HTTP_URL, TIMEOUT);
        let tx_hash = "6293e983c04963adb4bd15ca9bd8480df6929869059084d69511a3d5a2142244";
        let tx = btc.raw_transaction(tx_hash).await.unwrap();
        println!("Transaction #{}: {:?}", tx_hash, tx);
    }

    #[ignore]
    #[tokio::test]
    async fn test_send_btc_withdrawal_proposal() {
        let bitcoin = Bitcoin::new(BITCOIN_HTTP_URL, TIMEOUT);

        // let hash = hex::decode("337bc95ae87335a87d35b52e3a2c92ccd204981558a9c4862306b6e9c67f0efb").unwrap();
        // let hash = H256::from_slice(&hash);
        // println!("previous_output hash: {}", h256_conv_endian_and_hex(hash));
        let tx = Transaction {
            version: 1,
            inputs: vec![
                TransactionInput {
                    previous_output: OutPoint {
                        txid: h256_rev("fb0e7fc6e9b6062386c4a958159804d2cc922c3a2eb5357da83573e85ac97b33"),
                        index: 2
                    },
                    script_sig: hex::decode("004730440220142a22fc0c58bd739499fbfa63534e70edfa050ff8b8a4a0cfe802d27a1a4dcf02203e3c148963052414ab2047c6ed4b4afbb1639a71d20044568e2546d45538f59101483045022100c8a0f8a1a648098d22fd52910d8d36dfecfa75628e4277140bdf629cda203f7202202c26e1c2c44ad0228e0762e710969c58b3a1251db36090c3eda2f158be429b07014730440220208c51861ed6338289fa168d55ea83fc761df82f08d654dd15716af00ba2072102202d65b35e7807cc8838f9235aa00b512b670b377f40d7344c9522e0c536dd0e9801483045022100afe166ef2ad792e26a7caa0cd60e9ec8d6056427d19ec97fef95634eb32b412302206fdf24924177263479baba5ff24d871010a86dc17bbc742d9039cf97e387f744014ccf542102e2b2720a9e54617ba87fca287c3d7f9124154d30fa8dc9cd260b6b254e1d7aea210219fc860933a1362bc5e0a0bbe1b33a47aedf904765f4a85cd166ba1d767927ee2102b921cb319a14c6887b12cee457453f720e88808a735a578d6c57aba0c74e5af32102df92e88c4380778c9c48268460a124a8f4e7da883f80477deaa644ced486efc6210346aa7ade0b567b34182cacf9444deb44ee829e14705dc87175107dd09d5dbf4021034d3e7f87e69c6c71df6052b44f9ed99a3d811613140ebf09f8fdaf904a2e1de856ae").unwrap().into(),
                    sequence: 4294967295,
                    script_witness: vec![]
                }
            ],
            outputs: vec![
                TransactionOutput {
                    value: 2623662,
                    script_pubkey: hex::decode("76a914939d4d10fd66c38742af43d5b63576ff874c442c88ac").unwrap().into(),
                },
                TransactionOutput {
                    value: 197000000,
                    script_pubkey: hex::decode("a9140a71a54260b4b08652497f1bfacf39b72c95686e87").unwrap().into(),
                },
                TransactionOutput {
                    value: 10290696123,
                    script_pubkey: hex::decode("a914d246f700f4969106291a75ba85ad863cae68d66787").unwrap().into(),
                }
            ],
            lock_time: 0
        };

        let tx = serialize(&tx).take();
        let hex_tx = hex::encode(&tx);
        println!("[Bitcoin|send_raw_transaction] Btc Tx Hex: {}", hex_tx);
        match bitcoin.send_raw_transaction(hex_tx).await {
            Ok(hash) => {
                println!(
                    "[Bitcoin|send_raw_transaction] Return Hash: {:?}",
                    hash_rev(hash)
                );
            }
            Err(err) => {
                println!("[Bitcoin|send_raw_transaction] Err: {}", err);
            }
        }
    }
}
