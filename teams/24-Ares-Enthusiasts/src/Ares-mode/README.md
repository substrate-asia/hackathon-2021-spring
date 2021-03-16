# ares-module &middot; [![GitHub license](https://img.shields.io/badge/license-GPL3%2FApache2-blue)](#LICENSE) [![GitLab Status](https://gitlab.parity.io/parity/substrate/badges/master/pipeline.svg)](https://gitlab.parity.io/parity/substrate/pipelines) ![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg) [![Discord](https://img.shields.io/badge/discord-join%20chat-blue.svg)](https://discord.gg/gWGG63zJVk)

It's the pallets repo for Ares Protocol

[`Example Video`](https://www.youtube.com/watch?v=HlYhsHFKzJw&t)

### substrate-node-template is substrate node
*  `pallet-ares` deal aggregator register and unregister
*  `pallet-ares` oracle request and result callback
*   add `pallet-ares` test code
*   add `pallet-ocw` use off-chain worker fetcher price
*   add `on chain aggregate` price
*   support `multi token` price


### substrate-front-end-template
* the front end displays the registration and results of events on the chain
* query the oracle price and data warehouse price
* query chain data history

### fetch-data is ares oracle scanner
* transfer token to aggregator
* listen for Oracle event requests
* fetch aggregate price and return to oracle

[Learn More](https://github.com/aresprotocols/ares-module/tree/main/fetch-data)


### aggregate-ares is ares data warehouse
* it fetch huobi and binance and okex price
* privide api for oracle visite and use.

[Learn More](https://github.com/aresprotocols/ares-module/tree/main/aggregate-ares)

#### getPrice
Suppot `BTC`,`ETH`, `DOT`

http://api.aresprotocol.com/api/getPartyPrice/btcusdt
```
{"msg":"success","code":0,"data":{"market":null,"symbol":"btcusdt","price":18319.72,"nodes":null,"sn":null,"systs":1607528442761,"ts":1607528442761}}
```

## Build

### 1. Start Node
Enter `substrate-node-template`
```
make build
```
then start
```
./target/release/node-template --dev --tmp
```

### 2. Start Front
Enter `substrate-front-end-template`
run
```
yarn start
```

### 3. Start Aggregator
Enter `fetch-data` run
```
npm index.js
```

you can use `Start Front` send `register`, `unregister`,`initial_request`,`feed_data` action with `node-template`
