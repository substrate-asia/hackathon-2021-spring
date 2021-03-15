# Uni-arts Network [云画链](https://uniarts.me)
![Image text](https://raw.githubusercontent.com/uni-arts-chain/uni-arts-network/master/docs/uniarts.png)

链接信用、助力原创。

[![Substrate version](https://img.shields.io/badge/Substrate-2.0.0-brightgreen?logo=Parity%20Substrate)](https://substrate.dev/)
[![Discord](https://img.shields.io/badge/Discord-gray?logo=discord)](https://discord.gg/ZBDGY79X)
[![Telegram](https://img.shields.io/badge/Telegram-gray?logo=telegram)](https://t.me/uniarts)



## Build from source

1.Install Rust
```bash
curl https://sh.rustup.rs -sSf | sh
```
2. Initialize your Wasm Build environment
```bash
./scripts/init.sh
```
3. Build
```bash
cargo build --release
```

## cross-chain
To enable cross-chain functionality, the Uni-Arts Network will connect to the Polkadot in one of the three ways:

- as parathread - pay-as-you-go connection to Polkadot
- as parachain - permanent connection for a given period
- as an solo chain with a bridge back to Polkadot

## Run

### Single Node Development Chain

Purge any existing dev chain state:

```bash
./target/release/uart purge-chain --dev
```

Start a dev chain:

```bash
./target/release/uart --dev
```

Or, start a dev chain with detailed logging:

```bash
RUST_LOG=debug RUST_BACKTRACE=1 ./target/release/uart -lruntime=debug --dev
```

### Multi-Node Local Testnet

To see the multi-node consensus algorithm in action, run a local testnet with two validator nodes,
Alice and Bob, that have been [configured](/node/src/chain_spec.rs) as the initial
authorities of the `local` testnet chain and endowed with testnet units.

Note: this will require two terminal sessions (one for each node).

Start Alice's node first. The command below uses the default TCP port (30333) and specifies
`/tmp/alice` as the chain database location. Alice's node ID will be
`12D3KooWEyoppNCUx8Yx66oV9fJnriXwCcXwDDUA2kj6vnc6iDEp` (legacy representation:
`QmRpheLN4JWdAnY7HGJfWFNbfkQCb6tFf4vvA6hgjMZKrR`); this is determined by the `node-key`.

```bash
cargo run -- \
  --base-path /tmp/alice \
  --chain=local \
  --alice \
  --node-key 0000000000000000000000000000000000000000000000000000000000000001 \
  --telemetry-url 'ws://telemetry.polkadot.io:1024 0' \
  --validator
```

In another terminal, use the following command to start Bob's node on a different TCP port (30334)
and with a chain database location of `/tmp/bob`. The `--bootnodes` option will connect his node to
Alice's on TCP port 30333:

```bash
cargo run -- \
  --base-path /tmp/bob \
  --bootnodes /ip4/127.0.0.1/tcp/30333/p2p/12D3KooWEyoppNCUx8Yx66oV9fJnriXwCcXwDDUA2kj6vnc6iDEp \
  --chain=local \
  --bob \
  --port 30334 \
  --ws-port 9945 \
  --telemetry-url 'ws://telemetry.polkadot.io:1024 0' \
  --validator
```

Execute `cargo run -- --help` to learn more about the node's CLI options.


## add key
```bash
curl --location --request POST 'http://localhost:9933' \
--header 'Content-Type: application/json' \
--data-raw '[
    {
        "jsonrpc":"2.0",
        "id":1,
        "method":"author_insertKey",
        "params": [
            "aura",
            "injury kiss fox obscure bone mango mammal reject very venue lawn depth",
            "0x5a185b3c60676cf602eb4bf0dab183d8eb6f9f33bf8994c248d9572dcf09de5b"
        ]
    },
    {
        "jsonrpc":"2.0",
        "id":2,
        "method":"author_insertKey",
        "params": [
            "gran",
            "space easy attend shoulder funny drop humble smooth diamond skill kite grant",
            "0x7c8c270600a0535b6aed2abfe13e08db6830d69a713e9d6d15403814fc3cde66"
        ]
    }

]'
```

```bash
curl --location --request POST 'http://localhost:9935' \
--header 'Content-Type: application/json' \
--data-raw '[
    {
        "jsonrpc":"2.0",
        "id":1,
        "method":"author_insertKey",
        "params": [
            "aura",
            "cancel bunker enemy toy order finger crime clay want acid pizza crash",
            "0x72238566d0f221dc5389f933837e611e6d95863936d926c33b0c69f317da2843"
        ]
    },
    {
        "jsonrpc":"2.0",
        "id":2,
        "method":"author_insertKey",
        "params": [
            "gran",
            "copper high monitor gesture avocado quick sponsor leaf cargo elbow heavy nice",
            "0x3ea0940442dae4931975a9f85068e212dd18b1437381b4cbf72cd56b0761c8b4"
        ]
    }

]'
```
## How to join our Uni-Arts test network ? (docker)
### docker run
```bash
docker run --rm uniart/uni-arts-network uart --chain pangu --base-path chain-data --rpc-cors=all \
 --ws-external --rpc-external --rpc-methods=Unsafe --telemetry-url "wss://telemetry.polkadot.io/submit/ 0" \
  --bootnodes /dns/testnet.uniarts.me/tcp/30333/p2p/12D3KooWKw1pAvrKcFTt5Tj3vY33Dw9Vg2sa2DWsXQAoWJsTGhYX
```
### docker-compose.yml
```yml
version: "3.5"

services:
  node_1:
    image: uniart/uni-arts-network
    ports:
      - 9944:9944
      - 9933:9933
      - 30333:30333
    volumes:
      - ./chain-data:/chain-data
    networks:
      - uniarts_network
    restart: always
    command: ['uart', '--chain', 'pangu', '--base-path', '/chain-data', '--validator', '--rpc-cors=all', '--ws-external', '--rpc-external', '--rpc-methods=Unsafe', '--telemetry-url', "wss://telemetry.polkadot.io/submit/ 0", '--bootnodes', '/dns/testnet.uniarts.me/tcp/30333/p2p/12D3KooWKw1pAvrKcFTt5Tj3vY33Dw9Vg2sa2DWsXQAoWJsTGhYX' ]
networks:
  uniarts_network:
    driver: bridge
    name: uniarts_network
```

run
```bash
docker-compose up -d
```

## License
[LICENSE](./LICENSE)
