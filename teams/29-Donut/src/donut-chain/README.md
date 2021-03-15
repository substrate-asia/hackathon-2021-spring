# Donut Blockchain

Developed based on [substrate FRAME](https://substrate.dev/)

# Build

## Development Environment

 - Download and setup rust toolchain

See [rust-setup](./doc/rust-setup.md) doc.

## Build & Run

 - binary build by execute:

```sh
cargo build --release
```

After build successfully, you should see ```donut-node``` under directory **./target/release/**

 - Run with dev mode by execute:

```
./target/release/donut-node --dev --tmp
```

You should see logs once node has beed started, which contains useful information. Most important is see 
wether blocks are imported correctly.

 - Interact with node

Open browser and visit  ```https://polkadot.js.org/apps/?rpc=ws%3A%2F%2F127.0.0.1%3A9944#/explorer```