# QuadraticFunding pallet based on substrate

A fresh pallet which implements quadratic voting and funding using [Substrate](https://github.com/substrate-developer-hub/substrate-node-template/tree/v2.0.1). :rocket:

## Getting Started

This project contains is developed with Rust, please make sure you have set up rust correctly before running and testing.

### Rust Setup

Follow the [Rust setup instructions](./doc/rust-setup.md) before using the included Makefile to
build the Node Template.

### Makefile

This project uses a [Makefile](Makefile) to document helpful commands and make it easier to execute
them. Get started by running these [`make`](https://www.gnu.org/software/make/manual/make.html)
targets:

1. `make init` - Run the [init script](scripts/init.sh) to configure the Rust toolchain for
   [WebAssembly compilation](https://substrate.dev/docs/en/knowledgebase/getting-started/#webassembly-compilation).
1. `make run` - Build and launch this project in development mode.

The init script and Makefile both specify the version of the
[Rust nightly compiler](https://substrate.dev/docs/en/knowledgebase/getting-started/#rust-nightly-toolchain)
that this project depends on.

### Build

The `make run` command will perform an initial build. Use the following command to build the node
without launching it:

```sh
make build
```

## Test & Run
The `make test` command will run all the test cases in [tests.rs](./pallets/quadratic-funding/src/tests.rs).  

The `make run` command will launch a temporary node and its state will be discarded after you
terminate the process. After the project has been built, there are other ways to launch the node.

## Pallet Structure
The pallet follows official [pallet develop guide](https://substrate.dev/docs/en/tutorials/build-a-dapp/pallet), we'll skip the step-by-step guide and only focus on it's storage and functions.

### Storage
- Rounds `map` Stores a unsigned interger index as key with a round struct as value. The round struct contains information about funding pool, status and support_area etc.
- Projects `double_map` Using (round_id, project_hash) as key, the value is a project struct.
- ProjectVotes `double_map` Using (vote_hash, account) as key, the values is number of votes this account has voted for this project. 
```
Note: We should NOT use project_hash as the first key of ProjectVotes, as projects with same hash may exist in multiple ongoing rounds, which will lead to misfunction of vote.
```
### Functions
- start_round, The pallet admin can open a new round
- donate, Donate some tokens to some specific round
- register_project, Register your projects to some ongoing rounds
- vote, Vote to a project in some ongoing rounds
- vote_cost, Calculate estimated cost for any willing ballots, this function will NOT update storage. In order to get value, frontend should subscribe its events.
- end_round, The pallet admin can close an existing round, the fund in pool will be distributed to those voted projects accordingly.

## Changelog
- 2021.03.08 Implements multi-round voting mechanism, which allows admin users to open several rounds of QF at the same time
- 2020.03.01 Basic quadratic voting and funding logics, including set up charging fee and project name
