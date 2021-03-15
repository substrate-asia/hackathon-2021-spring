[English](./README.md) / 中文

## 依赖

* [Node.js >= 14.15.1](https://nodejs.org/en/download/)
* [yarn](https://yarnpkg.com/getting-started/install)

## Tools

### `author_insert_key`

添加 [Aura](https://substrate.dev/docs/en/knowledgebase/getting-started/glossary#aura-aka-authority-round) 和 [GRANDPA](https://substrate.dev/docs/en/knowledgebase/getting-started/glossary#grandpa) 公钥：

```shell
$ NETWORK_CONFIG=./network_config.yaml node author_insert_key.js
```

### `add_well_known_node`

将组内的非主节点添加为 well known 节点：

```shell
$ NETWORK_CONFIG=./network_config.yaml node add_well_known_node.js
```

### `deploy_contract`

部署合约：

```shell
$ NETWORK_CONFIG=./network_config.yaml node deploy_contract.js ~/workspace/flipper/flipper.contract 1000 # 1000 为交易 endowment
```

注：`NETWORK_CONFIG` 为网络配置文件路径，相关详情参见：[网络配置](../substrate/README_CN.md)