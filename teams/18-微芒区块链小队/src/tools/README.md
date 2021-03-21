English / [中文](./README_CN.md)

## Prerequisites

* [Node.js >= 14.15.1](https://nodejs.org/en/download/)
* [yarn](https://yarnpkg.com/getting-started/install)

## Tools

### `author_insert_key`

Insert [Aura](https://substrate.dev/docs/en/knowledgebase/getting-started/glossary#aura-aka-authority-round) and [GRANDPA](https://substrate.dev/docs/en/knowledgebase/getting-started/glossary#grandpa) keys:

```shell
$ NETWORK_CONFIG=./network_config.yaml node author_insert_key.js
```

### `add_well_known_node`

Add normal nodes which in a group as well known nodes:

```shell
$ NETWORK_CONFIG=./network_config.yaml node add_well_known_node.js
```

### `deploy_contract`

Deploy contract:

```shell
$ NETWORK_CONFIG=./network_config.yaml node deploy_contract.js ~/workspace/flipper/flipper.contract 1000 # 1000 is endowment used to exec deploy transaction
```

Note：`NETWORK_CONFIG` is the path of network configurations file, get more detail from [Network configurations](../substrate/README.md).