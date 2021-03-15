# btc-relay

Relay BTC header and transactions to ink-bridge contract on node via RPC.

## Usage

```
# Run the script to start the btc relay
./start.sh
# Or run the command manually
./btc-relay -c config.json

# verify tx by calling the bridge
/target/debug/relay-tools --height 478562 --tx-id "0164021aeddafb7d303ddad88245b5ae93bdbe508b9a1a844e7e99d684bbc3cd"

# generate the merkle proof
./target/debug/btc-relay gen-merkle-proof -h 478562 -i "0164021aeddafb7d303ddad88245b5ae93bdbe508b9a1a844e7e99d684bbc3cc"
```

## Config

```
/// Specify the HTTP url with basic auth of Bitcoin node, like http://user:password@127.0.0.1:8332
btc-url: Url,
/// Specify the time interval of waiting for the latest Bitcoin block, unit: second
btc-block-interval: u64,

/// Specify the WebSocket url of substrate node, like ws://127.0.0.1:9944
patra-url: Url,
/// Specify the mnemonic seed of chain account for btc relay
relayer-signer: String,
/// Specify whether to submit block header only, default: submit the whole block
only-header: bool,

/// Specify the log file path
log-path: PathBuf,
/// Specify the level of log, like: "OFF", "ERROR", "WARN", "INFO", "DEBUG", "TRACE"
log-level: LevelFilter,
/// Specify the roll size of log, unit: MB
log-roll-size: u64,
/// Specify the roll count of log
log-roll-count: u32,
/// Specify the timeout of RPC request, unit: second
rpc-timeout: u64,
```

## Note

The `subtext`, a fork version of `substrate-subxt`, has been deprecated, 
which is not used in the current version of `btc-relay`.

But it is still reserved to help maintainers understand the logic of `substrate-subxt`
(The expansion of `substrate-subxt` relies heavily on `module`, `Store`, `Call` and `Event` derive macros).

## License

[GPL-v3](LICENSE)
