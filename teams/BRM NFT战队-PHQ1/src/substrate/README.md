# Added orml-nft-pallet to Runtime

![Acala - Multicurrency 2](https://github.com/Maar-io/polkadot-gitcoin-hack/blob/main/acala-nft.jpg?raw=true "Optional Title")

## Build & Run

If you need to,
[set up your Substrate development environment](https://substrate.dev/docs/en/knowledgebase/getting-started/#manual-installation).
Then, build and run a development chain:

```shell
$ cargo run -- --dev --tmp
```

Once the node is running, use this link to open the Polkadot JS Apps UI and connect to the Substrate
node: https://polkadot.js.org/apps/#/settings/developer?rpc=ws://127.0.0.1:9944. Use the Settings >
Developer app and the contents of the [`types.json`](./types.json) file to add the
necessary types to the UI.

## Upstream

This project was forked from the
[Substrate Developer Hub Node Template](https://github.com/substrate-developer-hub/substrate-node-template).
