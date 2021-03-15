use std::time::Duration;

use codec::Decode;
use jsonrpsee::common::Params;
use sp_core::{crypto::AccountId32, Bytes};
use sp_rpc::number::NumberOrHex;
use std::path::PathBuf;
use std::str::FromStr;
use subxt::{
    contracts::*, system::System, Client, ClientBuilder, ContractsTemplateRuntime,
    ExtrinsicSuccess, Signer,
};
use tokio::time;
use url::Url;

use light_bitcoin::{
    chain::Transaction as BtcTransaction,
    primitives::{hash_rev, H256},
    serialization::serialize,
};

use crate::{contract::*, error::Error, types::*};
use codec::Encode;

#[derive(Clone)]
pub struct Relayer {
    pub client: Client<ContractsTemplateRuntime>,
    pub rpc_client: jsonrpsee::Client,
    pub contract: <ContractsTemplateRuntime as System>::AccountId,
    pub contract_metadata: PathBuf,
    signer: PatraPairSigner,
    timeout: u64,
}

impl Relayer {
    pub async fn new(
        url: Url,
        contract_address: String,
        contract_metadata: PathBuf,
        timeout: u64,
        signer: PatraPairSigner,
    ) -> Result<Self, Error> {
        let client = ClientBuilder::new()
            .set_url(url.clone().as_str())
            .skip_type_sizes_check()
            .build()
            .await?;

        let rpc_client = jsonrpsee::ws_client(url.as_str())
            .await
            .map_err(|err| Error::Other(err.to_string()))?;

        let contract = AccountId32::from_str(contract_address.as_str())
            .map_err(|err| Error::Other(err.into()))?;

        Ok(Self {
            client,
            rpc_client,
            contract,
            contract_metadata,
            signer,
            timeout,
        })
    }

    pub async fn btc_best_index(&self) -> Result<BtcHeaderIndex, Error> {
        let exec_result = self.query_contract_rpc("best_index", vec![]).await?;
        let exec_success = exec_result.result.map_err(|err| {
            Error::Other(format!(
                "[Relayer|btc_best_index] Failed to query contract, {:?}",
                err
            ))
        })?;
        let best_index = BtcHeaderIndex::decode(&mut &*exec_success.data)?;
        info!(
            "[Relayer|btc_best_index] Height #{}, Hash: {:?}",
            best_index.height, best_index.hash
        );
        Ok(best_index)
    }

    pub async fn btc_confirmed_index(&self) -> Result<BtcHeaderIndex, Error> {
        let exec_result = self.query_contract_rpc("confirmed_index", vec![]).await?;
        if exec_result.result.is_err() {
            // only use for the initialized confirmed index of the network.
            let genesis: BtcHeaderInfo = self.btc_genesis_info().await?;
            let confirmed_index = BtcHeaderIndex {
                hash: genesis.header.hash(),
                height: genesis.height,
            };
            info!(
                "[Relayer|btc_confirmed_index] (From genesis) Height #{}, Hash: {:?}",
                confirmed_index.height,
                hash_rev(confirmed_index.hash)
            );
            return Ok(confirmed_index);
        }
        let exec_success = exec_result.result.unwrap();
        let confirmed_index = BtcHeaderIndex::decode(&mut &*exec_success.data)?;
        info!(
            "[Relayer|btc_confirmed_index] Height #{}, Hash: {:?}",
            confirmed_index.height, confirmed_index.hash
        );
        Ok(confirmed_index)
    }

    pub async fn btc_block_hash_for(&self, height: u32) -> Result<Vec<H256>, Error> {
        let exec_result = self
            .query_contract_rpc("block_hash_for", u32::encode(&height))
            .await?;
        let exec_success = exec_result.result.map_err(|err| {
            Error::Other(format!(
                "[Relayer|btc_block_hash_for] Failed to query contract, {:?}",
                err
            ))
        })?;
        let hashes: Option<Vec<H256>> = Option::decode(&mut &*exec_success.data)?;

        if let Some(hashes) = hashes {
            info!(
                "[Relayer|btc_block_hash_for] Height #{}, Hashes: {:?}",
                height, hashes
            );
            Ok(hashes)
        } else {
            Err(Error::Other(format!(
                "[Relayer|btc_block_hash_for] Not found btc block hash for height [{}]",
                height
            )))
        }
    }

    pub async fn btc_block_header(
        &self,
        block_hash: &H256,
    ) -> Result<Option<BtcHeaderInfo>, Error> {
        let exec_result = self
            .query_contract_rpc("header", block_hash.encode())
            .await?;
        let exec_success = exec_result.result.map_err(|_err| {
            Error::Other(format!("failed to query contract function [header] by rpc"))
        })?;
        let header: Option<BtcHeaderInfo> = Option::decode(&mut &*exec_success.data)?;
        if let Some(value) = header {
            info!(
                "[Relayer|btc_block_header] Height #{}, Header: {:?}",
                value.height, value.header
            );
            Ok(Some(value))
        } else {
            Ok(None)
        }
    }

    pub async fn btc_best_block_header(&self) -> Result<Option<BtcHeaderInfo>, Error> {
        let best_index = self.btc_best_index().await?;
        self.btc_block_header(&best_index.hash).await
    }

    pub async fn btc_genesis_info(&self) -> Result<BtcHeaderInfo, Error> {
        let exec_result = self.query_contract_rpc("genesis_info", vec![]).await?;
        let exec_success = exec_result.result.map_err(|err| {
            Error::Other(format!(
                "[Relayer|btc_genesis_info] Failed to query contract, {:?}",
                err
            ))
        })?;

        let genesis = BtcHeaderInfo::decode(&mut &*exec_success.data)?;
        info!(
            "[Relayer|btc_genesis_info] BTC Block Height #{}, Hash: {:?}",
            genesis.height,
            genesis.header.hash()
        );
        Ok(genesis)
    }

    pub async fn push_btc_header(&self, header: &BtcHeader) -> Result<(), Error> {
        info!(
            "[Relayer|push_btc_header] Btc Header Hash: {:?}",
            hash_rev(header.hash())
        );

        let ext: ExtrinsicSuccess<ContractsTemplateRuntime> = time::timeout(
            Duration::from_secs(self.timeout),
            self.call_contract("push_header", header.encode()),
        )
        .await??;
        info!(
            "[Relayer|push_btc_header] Extrinsic Block Hash: {:?}, Extrinsic Hash: {:?}",
            ext.block, ext.extrinsic
        );

        let mut event = ext
            .events
            .iter()
            .filter(|event| event.module == "Contracts" && event.variant == "ContractEmitted");
        if let Some(event) = event.next() {
            // TODO
            let _v = HeaderPushedEvent::decode(&mut &event.data[..])?;
            Ok(())
        } else {
            error!("[Relayer|push_btc_header] No HeaderPushedEvent Event");
            Err(Error::Other("Cannot find `PushHeader` event".into()))
        }
    }

    pub async fn validate_btc_transaction(
        &self,
        proof: &PartialMerkleTree,
        tx_hash: &H256,
        block_hash: &H256,
    ) -> Result<bool, Error> {
        let mut args = proof.encode();
        args.extend(tx_hash.encode());
        args.extend(block_hash.encode());

        let exec_result = self
            .query_contract_rpc("validate_transaction", args)
            .await?;
        let exec_success = exec_result.result.map_err(|err| {
            Error::Other(format!(
                "[Relayer|validate_btc_transaction] Failed to query contract, {:?}",
                err
            ))
        })?;
        let result = bool::decode(&mut &*exec_success.data)?;
        Ok(result)
    }

    pub async fn validate_btc_transaction_with_contract(
        &self,
        proof: &PartialMerkleTree,
        tx_hash: &H256,
        block_hash: &H256,
        contract_address: String,
        contract_metadata: PathBuf,
    ) -> Result<(), Error> {
        let mut args = proof.encode();
        args.extend(tx_hash.encode());
        args.extend(block_hash.encode());

        let ext: ExtrinsicSuccess<ContractsTemplateRuntime> = time::timeout(
            Duration::from_secs(self.timeout),
            self.call_contract_with_metadata(
                "validate_transaction",
                args,
                contract_address,
                contract_metadata,
            ),
        )
        .await??;

        info!(
            "[Relayer|validate_btc_transaction_with_contract] Extrinsic Block Hash: {:?}, Extrinsic Hash: {:?}, Events: {:?}",
            ext.block, ext.extrinsic, ext.events
        );
        Ok(())
    }

    pub async fn push_block_details_with_contract(
        &self,
        block_hash: &H256,
        block: &BlockDetails,
        contract_address: String,
        contract_metadata: PathBuf,
    ) -> Result<(), Error> {
        let mut args = block_hash.encode();
        args.extend(block.encode());

        let ext: ExtrinsicSuccess<ContractsTemplateRuntime> = time::timeout(
            Duration::from_secs(self.timeout),
            self.call_contract_with_metadata(
                "set_block_details",
                args,
                contract_address,
                contract_metadata,
            ),
        )
        .await??;

        info!(
            "[Relayer|push_block_details_with_contract] Extrinsic Block Hash: {:?}, Extrinsic Hash: {:?}, Events: {:?}",
            ext.block, ext.extrinsic, ext.events
        );
        Ok(())
    }

    pub async fn push_btc_transaction_with_contract(
        &self,
        tx: &BtcTransaction,
        relayed_info: &BtcRelayedTxInfo,
        prev_tx: Option<BtcTransaction>,
        contract_address: String,
        contract_metadata: PathBuf,
    ) -> Result<(), Error> {
        let raw_tx = serialize(tx).to_vec();
        info!(
            "[Relayer|push_btc_transaction_with_contract] raw tx: {}",
            hex::encode(raw_tx.clone())
        );
        let relayed_info = relayed_info.encode();
        let mut pre_raw_tx = None;
        if let Some(tx) = prev_tx {
            pre_raw_tx = Some(serialize(&tx).to_vec());
        }
        let mut args = raw_tx.encode();
        args.extend(relayed_info.encode());
        args.extend(pre_raw_tx.encode());

        let ext: ExtrinsicSuccess<ContractsTemplateRuntime> = time::timeout(
            Duration::from_secs(self.timeout),
            self.call_contract_with_metadata(
                "push_transaction",
                args,
                contract_address,
                contract_metadata,
            ),
        )
        .await??;

        info!(
            "[Relayer|push_btc_transaction_with_contract] Extrinsic Block Hash: {:?}, Extrinsic Hash: {:?}, Events: {:?}",
            ext.block, ext.extrinsic, ext.events
        );
        Ok(())
    }

    pub async fn push_btc_transaction(
        &self,
        _tx: &BtcTransaction,
        _relayed_info: &BtcRelayedTxInfo,
        _prev_tx: &Option<BtcTransaction>,
    ) -> Result<(), Error> {
        unimplemented!()
        //
        // let tx = serialize(tx).take();
        // let prev_tx = prev_tx.as_ref().map(|prev_tx| serialize(prev_tx).take());
        // let ext: ExtrinsicSuccess<ContractsTemplateRuntime> = time::timeout(
        //     Duration::from_secs(self.timeout),
        //     self.client
        //         .push_transaction_and_watch(signer, &tx, relayed_info, &prev_tx),
        // )
        // .await??;
        // info!(
        //     "[Relayer|push_btc_transaction] Extrinsic Block Hash: {:?}, Extrinsic Hash: {:?}",
        //     ext.block, ext.extrinsic,
        // );
        // if let Some(push_tx_event) = ext.push_transaction()? {
        //     info!("[Relayer|push_btc_transaction] Event: {:?}", push_tx_event);
        //     Ok(())
        // } else {
        //     error!("[Relayer|push_btc_transaction] No PushTransaction Event");
        //     Err(Error::Other("Cannot find `PushTransaction` event".into()))
        // }
    }

    async fn call_contract(
        &self,
        name: &str,
        args_encoded: Vec<u8>,
    ) -> Result<ExtrinsicSuccess<ContractsTemplateRuntime>, Error> {
        let contract = ContractMessage::new(self.contract_metadata.clone());
        let data = contract.call_data_encode(name, args_encoded)?;

        // let mut signer = self.signer.clone();
        // let nonce = self
        //     .client
        //     .account(&signer.account_id(), None)
        //     .await
        //     .unwrap()
        //     .nonce;
        // signer.set_nonce(nonce + 1);

        let extrinsic_success = self
            .client
            .call_and_watch(
                &self.signer,
                &sp_runtime::MultiAddress::from(self.contract.clone()),
                0,
                500_000_000_000,
                data.as_slice(),
            )
            .await?;
        info!(
            "[Relayer] call contract [{}] result: [{:?}]",
            name, extrinsic_success
        );
        Ok(extrinsic_success)
    }

    async fn call_contract_with_metadata(
        &self,
        name: &str,
        args_encoded: Vec<u8>,
        contract_address: String,
        contract_metadata: PathBuf,
    ) -> Result<ExtrinsicSuccess<ContractsTemplateRuntime>, Error> {
        let contract_address = AccountId32::from_str(contract_address.as_str())
            .map_err(|err| Error::Other(err.into()))?;

        let contract = ContractMessage::new(contract_metadata);
        let data = contract.call_data_encode(name, args_encoded)?;

        let extrinsic_success = self
            .client
            .call_and_watch(
                &self.signer,
                &sp_runtime::MultiAddress::from(contract_address),
                0,
                500_000_000_000,
                data.as_slice(),
            )
            .await?;
        info!(
            "[Relayer] call contract with metadata [{}] result: [{:?}]",
            name, extrinsic_success
        );
        Ok(extrinsic_success)
    }

    async fn query_contract_rpc(
        &self,
        name: &str,
        args_encoded: Vec<u8>,
    ) -> Result<RpcContractExecResult, Error> {
        let contract = ContractMessage::new(self.contract_metadata.clone());
        let data = contract.call_data_encode(name, args_encoded)?;

        let call_request = CallRequest::<<ContractsTemplateRuntime as System>::AccountId> {
            origin: self.signer.account_id().clone(),
            dest: self.contract.clone(),
            value: NumberOrHex::Number(0),
            gas_limit: NumberOrHex::Number(5_000_000_000_000),
            input_data: Bytes(data),
        };
        let params = Params::Array(vec![serde_json::to_value(call_request)?]);
        let result: RpcContractExecResult = self
            .rpc_client
            .request("contracts_call", params)
            .await
            .map_err(|err| Error::Other(err.to_string()))?;
        Ok(result)
    }
}

#[cfg(test)]
mod tests {
    use sp_core::{crypto::DEV_PHRASE, Pair as _};
    use sp_runtime::traits::{IdentifyAccount, Verify};
    use subxt::Runtime;

    use super::*;
    use light_bitcoin::primitives::h256;

    // use your own node config.
    const SUB_WS_URL: &str = "ws://127.0.0.1:8087";
    const TIMEOUT: u64 = 15;

    /// Generate an account ID from seed.
    fn get_account_id_from_seed(seed: &str) -> AccountId {
        let pair = RelayerPair::from_string(&format!("//{}", seed), None)
            .expect("static values are valid; qed");
        <<ContractsTemplateRuntime as Runtime>::Signature as Verify>::Signer::from(pair.public())
            .into_account()
    }

    #[test]
    fn test_account() {
        let alice = get_account_id_from_seed("Alice");
        println!("Alice = {:?}, {}", alice, alice);
        let bob = get_account_id_from_seed("Bob");
        println!("Bob = {:?}, {}", bob, bob);
        let charlie = get_account_id_from_seed("Charlie");
        println!("Charlie = {:?}, {}", charlie, charlie);

        // xgatewaycommon_bitcoinGenerateTrusteeSessionInfo
        let hot_addr = "3Cg16oUAzxj5EzpaHX6HHJUpJnuctEb9L8"
            .parse::<BtcAddress>()
            .unwrap();
        let cold_addr = "3H7Gu3KsGoa8UbqrY5hfA2S3PVsPwzur3t"
            .parse::<BtcAddress>()
            .unwrap();
        println!("hot: {:?}, cold: {:?}", hot_addr, cold_addr);
    }

    #[test]
    fn test_seed() {
        let pair = RelayerPair::from_string(&format!("{}//Alice", DEV_PHRASE), None).unwrap();
        let public = pair.public();
        println!("public: {:?}", sp_core::H256::from(public.0));
    }

    #[ignore]
    #[tokio::test]
    async fn test_relayer() {
        let relayer = Relayer::new(SUB_WS_URL, TIMEOUT).await.unwrap();

        let _btc_withdrawal_proposal = relayer.btc_withdrawal_proposal().await.unwrap();

        let alice = get_account_id_from_seed("Alice");
        let _free_pcx = relayer.free_pcx_balance(&alice).await.unwrap();

        let index = relayer.btc_best_index().await.unwrap();
        println!(
            "Best Index: height {:?}, hash {:?}",
            index.height,
            hash_rev(index.hash)
        );
        // Height #576576, Hash: 0x82185fa131e2e2e1ddf05125a0950271b088eb8df52117000000000000000000
        let index = relayer.btc_confirmed_index().await.unwrap();
        println!(
            "Confirmed Index: height {:?} hash {:?}",
            index.height,
            hash_rev(index.hash)
        );
        let hashes = relayer.btc_block_hash_for(1863320).await.unwrap();
        println!(
            "Block Hash For: {:?}",
            hashes.into_iter().map(hash_rev).collect::<Vec<_>>()
        );
        // Height #576576, Hash: 0x82185fa131e2e2e1ddf05125a0950271b088eb8df52117000000000000000000
        let header = relayer.btc_best_block_header().await.unwrap();
        println!("Best Block Header: {:?}", header);
        // Height #576576, Header: BlockHeader { version: 536870912, previous_header_hash: 0x0000000000000000000a4adf6c5192128535d4dcb56cfb5753755f8d392b26bf, merkle_root_hash: 0x1d21e60acb0b12e5cfd3f775edb647f982a2d666f9886b2f61ea5e72577b0f5e, time: 1558168296, bits: Compact(388627269), nonce: 1439505020 }
        let btc_genesis = relayer.btc_genesis_info().await.unwrap();
        println!("Bitcoin Genesis: {:?}", btc_genesis);
        // Height #576576, Header: BlockHeader { version: 536870912, previous_header_hash: 0x0000000000000000000a4adf6c5192128535d4dcb56cfb5753755f8d392b26bf, merkle_root_hash: 0x1d21e60acb0b12e5cfd3f775edb647f982a2d666f9886b2f61ea5e72577b0f5e, time: 1558168296, bits: Compact(388627269), nonce: 1439505020 }
        let tx_state = relayer
            .btc_tx_state(&h256(
                "08b5673864d4f639a8b2006bc4fac18b92f3c7a5fd4e31eeb1813deff66dde8c",
            ))
            .await
            .unwrap()
            .unwrap();
        println!(
            "Tx Hash: {:?}",
            h256("08b5673864d4f639a8b2006bc4fac18b92f3c7a5fd4e31eeb1813deff66dde8c")
        );
        println!("Transaction State: {:?}", tx_state);
        // Transaction State: BtcTxState { tx_type: Deposit, result: Success }
    }

    #[ignore]
    #[tokio::test]
    async fn test_transfer() {
        let relayer = Relayer::new(SUB_WS_URL, TIMEOUT).await.unwrap();

        let alice = get_account_id_from_seed("Alice");
        let bob = get_account_id_from_seed("Bob");

        let alice_before = relayer.free_pcx_balance(&alice).await.unwrap();
        let bob_before = relayer.free_pcx_balance(&bob).await.unwrap();
        println!("Alice = {}, Bob = {}", alice_before, bob_before);

        // transfer (Alice ==> Bob)
        let pair = RelayerPair::from_string(&format!("{}//Alice", DEV_PHRASE), None).unwrap();
        let signer = PatraPairSigner::new(pair);
        let amount = 10_000;
        let dest = get_account_id_from_seed("Bob").into();
        relayer.transfer(&signer, &dest, amount).await.unwrap();

        let alice_after = relayer.free_pcx_balance(&alice).await.unwrap();
        let bob_after = relayer.free_pcx_balance(&bob).await.unwrap();
        println!("Alice = {}, Bob = {}", alice_after, bob_after);

        assert!(alice_before - amount >= alice_after);
        assert_eq!(bob_before + amount, bob_after);
    }
}
