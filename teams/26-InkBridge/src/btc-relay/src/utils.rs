use light_bitcoin::{
    chain::{Block as BtcBlock, TransactionOutput},
    keys::{Address, Network},
    script::{Script, ScriptType},
};

pub fn extract_block_miner_addr(block: &BtcBlock, network: Network) -> Option<Address> {
    for tx in &block.transactions {
        if tx.is_coinbase() && tx.outputs.len() > 0 {
            return extract_output_addr(&tx.outputs[0], network);
        }
    }
    None
}

/// Extract address from a transaction output script.
/// only support `p2pk`, `p2pkh` and `p2sh` output script
pub fn extract_output_addr(output: &TransactionOutput, network: Network) -> Option<Address> {
    let script = Script::new(output.script_pubkey.clone());

    // only support `p2pk`, `p2pkh` and `p2sh` script
    let script_type = script.script_type();
    match script_type {
        ScriptType::PubKey | ScriptType::PubKeyHash | ScriptType::ScriptHash => {
            let script_addresses = script
                .extract_destinations()
                .map_err(|err| {
                    error!(
                        "[extract_output_addr] Can't extract destinations of btc script err:{}, type:{:?}, script:{}",
                        err, script_type, script
                    );
                }).unwrap_or_default();
            // find address in this transaction
            if script_addresses.len() == 1 {
                let address = &script_addresses[0];
                Some(Address {
                    network,
                    kind: address.kind,
                    hash: address.hash,
                })
            } else {
                warn!(
                    "[extract_output_addr] Can't extract address of btc script, type:{:?}, address:{:?}, script:{}",
                    script_addresses, script_type, script
                );
                None
            }
        }
        _ => None,
    }
}
