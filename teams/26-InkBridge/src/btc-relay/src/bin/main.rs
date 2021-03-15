use btc_relay::{logger, CmdConfig, Command, Result, Service};

#[tokio::main]
async fn main() -> Result<()> {
    let (conf, cmds) = CmdConfig::init()?;

    logger::init(&conf)?;

    if let Some(cmd) = cmds {
        match cmd {
            Command::GenMerkleProof(opts) => {
                Service::gen_tx_merkle_proof(conf, opts.height, opts.tx_id).await?;
            }
            Command::ValidateTx(opts) => {
                Service::validate_transaction(conf, opts.height, opts.tx_id).await?;
            }
            Command::PushTx(opts) => {
                Service::push_transaction(conf, opts.height, opts.tx_id).await?;
            }
        }
    } else {
        Service::relay(conf).await?;
    }

    Ok(())
}
