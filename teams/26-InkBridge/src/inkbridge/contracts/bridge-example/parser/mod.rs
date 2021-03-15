use scale::{Decode, Encode};

use ink_env::Hash;
use ink_prelude::string::String;
use ink_storage::traits::{PackedLayout, SpreadLayout};

use light_bitcoin::{
    chain::{Transaction, TransactionOutput},
    crypto::checksum,
    keys::{Address, Network, Type},
    merkle::PartialMerkleTree,
    script::{Script, ScriptType},
};

#[derive(PartialEq, Debug, Eq, Clone, Default, Encode, Decode, SpreadLayout, PackedLayout)]
#[cfg_attr(
    feature = "std",
    derive(scale_info::TypeInfo, ink_storage::traits::StorageLayout)
)]
pub struct BtcRelayedTxInfo {
    pub block_hash: Hash,
    pub merkle_proof: PartialMerkleTree,
}

impl BtcRelayedTxInfo {
    pub fn into_relayed_tx(self, tx: Transaction) -> BtcRelayedTx {
        BtcRelayedTx {
            block_hash: self.block_hash,
            raw: tx,
            merkle_proof: self.merkle_proof,
        }
    }
}

#[derive(PartialEq, Debug, Eq, Clone, Default, Encode, Decode, SpreadLayout, PackedLayout)]
#[cfg_attr(
    feature = "std",
    derive(scale_info::TypeInfo, ink_storage::traits::StorageLayout)
)]
pub struct BtcRelayedTx {
    pub block_hash: Hash,
    pub raw: Transaction,
    pub merkle_proof: PartialMerkleTree,
}

/// Extract address from a transaction output script.
/// only support `p2pk`, `p2pkh` and `p2sh` output script
pub fn extract_output_addr(output: &TransactionOutput, network: Network) -> Option<Address> {
    let script = Script::new(output.script_pubkey.clone());

    // only support `p2pk`, `p2pkh` and `p2sh` script
    let script_type = script.script_type();
    match script_type {
        ScriptType::PubKey | ScriptType::PubKeyHash | ScriptType::ScriptHash => {
            let script_addresses = script.extract_destinations().unwrap_or_default();
            // .map_err(|err| {
            //     error!(
            //         "[extract_output_addr] Can't extract destinations of btc script err:{}, type:{:?}, script:{}",
            //         err, script_type, script
            //     );
            // }).unwrap_or_default();
            // find address in this transaction
            if script_addresses.len() == 1 {
                let address = &script_addresses[0];
                Some(Address {
                    network,
                    kind: address.kind,
                    hash: address.hash,
                })
            } else {
                // warn!(
                //     "[extract_output_addr] Can't extract address of btc script, type:{:?}, address:{:?}, script:{}",
                //     script_addresses, script_type, script
                // );
                None
            }
        }
        _ => None,
    }
}

pub fn address_to_string(addr: Address) -> String {
    let mut result = [0u8; 25];

    result[0] = match (addr.network, addr.kind) {
        (Network::Mainnet, Type::P2PKH) => 0,
        (Network::Mainnet, Type::P2SH) => 5,
        (Network::Testnet, Type::P2PKH) => 111,
        (Network::Testnet, Type::P2SH) => 196,
    };

    result[1..21].copy_from_slice(addr.hash.as_bytes());
    let cs = checksum(&result[0..21]);
    result[21..25].copy_from_slice(cs.as_bytes());

    bs58::encode(result).into_string()
}
