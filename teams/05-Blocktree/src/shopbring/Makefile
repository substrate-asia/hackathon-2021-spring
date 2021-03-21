.PHONY: init
init:
	./scripts/init.sh

.PHONY: check
check:
	SKIP_WASM_BUILD=1 cargo check --release

.PHONY: test
test:
	SKIP_WASM_BUILD=1 cargo test --release --all

.PHONY: run
run:
	 cargo run --release -- --dev --tmp

.PHONY: build
build:
	 cargo build --release

.PHONY: build-runtime
build-runtime:
	 cargo build --release -p shopbring-runtime

.PHONY: build-spec
build-spec:
	./target/release/shopbring build-spec --disable-default-bootnode --chain shoprbing-staging > testnetSpec.json

.PHONY: build-spec-raw
build-spec-raw:
	./target/release/shopbring build-spec --chain=testnetSpec.json --raw --disable-default-bootnode > testnetSpecRaw.json