English / [中文](./README_CN.md)

## Prerequisites

* Install necessary dependencies of Substrate via [https://substrate.dev/docs/en/knowledgebase/getting-started/](https://substrate.dev/docs/en/knowledgebase/getting-started/).

## Compile And Run

```shell
$ cargo build --release
```

Create network describe file:


```shell
$ vim ./network_describe.yaml
```

The format of network describe is like:


```yaml
name: highway ## network's name
id: highway ## network's id
groups: ## group configurations
  - name: group1 ## group's name
    peers: ## group's peers
      - name: peer1 ## peer's name
        is_root: true ## whether the peer is a root peer(have Sudo rule), the default value is false
        is_group_main: true ## whether the peer is the group's main peer(used to manage other normal peers in the group), the default value is false
        ip: 127.0.0.1 ## peer's IP
        port: 30333 ## peer's listening port
        ws_port: 9944 ## peer's listening websocket port
        rpc_port: 9933 ## peer's listening rpc port
      - name: peer2
        ip: 127.0.0.1
        port: 30334
        ws_port: 9945
        rpc_port: 9934
  - name: group2
    peers:
      - name: peer1
        is_group_main: true
        ip: 127.0.0.1
        port: 30335
        ws_port: 9946
        rpc_port: 9935
      - name: peer2
        ip: 127.0.0.1
        port: 30336
        ws_port: 9947
        rpc_port: 9936
```

Generate the network configurations file:

```shell
$ ./target/release/highway network-config --input ./network_describe.yaml --output ./network_config.yaml
```

The format of network configurations is like:

```yaml
id: highway
name: highway
peers:
  - name: peer1
    group: group1
    is_root: true
    is_group_main: true
    ip: 127.0.0.1
    port: 30333
    ws_port: 9944
    rpc_port: 9933
    node_key: 10efb8d072cf459e588f85e03a0577b92dccace725a86aff6cb2b53baa249eeb
    peer_id: 12D3KooWEPVTqojAPonL3ViRk8UuM1D2um1RCtX8A7DuscdHDCDk
    peer_id_hex: 00240801122043eb29a379d2fece4630d250e25cc692ff2d7ee8cb325ba4ff16ad98a77c4c8f
    secret:
      phrase: favorite surge that photo toy chapter feed proof viable patrol soccer syrup
      seed: 5a8e8af771345e8bc1710b4c9ea3b3ee525d57365a170fe848a3fec36ff7a234
      sr25519_public_key: 0e8e516c399a16516415675da5c1141bb9fe7f2069d7452bdd60fa21809e1875
      sr25519_ss58_address: 5CPnodjdPtnrpUTqEqaH8LEXeRFJtBhijEHXbfnUNiWSvHDn
      ed25519_public_key: 26abd7771f8ee5f39fd309e71e163ff50a4e31d752d1bc7f48ce2a59e13e8d11
      ed25519_ss58_address: 5CwQiyBn5WycJSYa3SYuzZ3wsrvnkUGUB59wPSKdaut2XRjS
  - name: peer2
    group: group1
    is_root: false
    is_group_main: false
    ip: 127.0.0.1
    port: 30334
    ws_port: 9945
    rpc_port: 9934
    node_key: 08845d4c5108ca26a20294dfaece96eba2ad8fd6c9ba399774beb5210f737c96
    peer_id: 12D3KooWAFXTzQ7GWpFs7FWUGcrWVuofymr8xCHwUpnEQGWoFwdr
    peer_id_hex: 002408011220067208637d492051c59ac27cb01c956e3023210c229ffabf086f426f98b2ca61
    secret:
      phrase: sad crush helmet hospital load decline kitten roof enact kingdom skin lamp
      seed: 5dcc53bf7e2ff171813a7b3fe16f7f3b51144b301ed0ca78b47b2d2e6c65102e
      sr25519_public_key: 9cd3b334b2a8faf6d07361633aceedb3be0cf620d158acc5058619c55dc3fe19
      sr25519_ss58_address: 5FcLDSF5MGtBuCc8tanSLamJwcRBpMbxhXFniJBUZ2JvUMAp
      ed25519_public_key: d710d624cb3e8b90dc3106f663b68ab8b2e884370ed44532e246ac7096cbd767
      ed25519_ss58_address: 5Gvh9spxPfAL4qZYNoapPsT5sYauKnSaCHj9XNbbrrRnkjdi
  - name: peer1
    group: group2
    is_root: false
    is_group_main: true
    ip: 127.0.0.1
    port: 30335
    ws_port: 9946
    rpc_port: 9935
    node_key: 5a1d7d73140852dc6b30ee9f03d6e6c1e11e4a1e22e2a14e187acd11a0306392
    peer_id: 12D3KooWCcUby4FeYm6boSBN4WNHHQGpkuRxHTcab5865CUFF9aa
    peer_id_hex: 00240801122029875df444ab0e93c4598fa346a0d4073330196fb21921212259dbcb379a576b
    secret:
      phrase: rather acid silly kingdom degree among unique ahead screen palm sheriff work
      seed: c2e5327f83527243fc036afa0a7a747179b96f8cc1fa351690fa695ff0f7d9b1
      sr25519_public_key: 28e8d38832e06926a1b8250237b4a52132dd9d174d8106d7c3eec6f41de51e6a
      sr25519_ss58_address: 5CzLwGKcoQBzcVfABoeYr1gA63hwkVvR449r4iR2uRmizgZU
      ed25519_public_key: 13967428c62a6d8074f116de8718449b75fc6c37f9bb4b9487104c40e998bf38
      ed25519_ss58_address: 5CWPThHcQPHgCYFnKaVUyNs5agC87dHkMwPttTXJaNKpPPWs
  - name: peer2
    group: group2
    is_root: false
    is_group_main: false
    ip: 127.0.0.1
    port: 30336
    ws_port: 9947
    rpc_port: 9936
    node_key: f9318fb1a356225e01f244c74f8f2770ec510f8b80ea3e0930cb65a29994b382
    peer_id: 12D3KooWHkXJSgTfFZydxstoDn4tZDWmZD7HYYpcTJkyJWxjT2e5
    peer_id_hex: 00240801122075e17fa44b553a98cc7ce7e5e192bb9368bdf55a3dc1103db4ad36f08552895a
    secret:
      phrase: enlist mention blind alcohol silly gasp word wife wedding adjust either decorate
      seed: 364c7eb2db3f72c0a1c9fb719981150901973bfd0048fc97cbc4144816299328
      sr25519_public_key: 0aa857e2a49872a1185acdc2a6196323de0294f367132f0b39dc761390cb3371
      sr25519_ss58_address: 5CJgLvrvDRRTPS9y5hZah1SRMno2jQ1VNwGAztTMbciN1Rth
      ed25519_public_key: e76c966c6a0816aadb28eab24fa13f337c04745c967f56b0e097304f7430b2ce
      ed25519_ss58_address: 5HJ9B9aPZmFHRQKZe4mWaNzPjvjjqGfGFuSkLAhkcJytyTVK
```

Run all peers:

```shell
$ NETWORK_CONFIG=./network_config.yaml ./target/release/highway --group-name group1 --peer-name peer1 --base-path ~/workspace/group1_peer1
$ NETWORK_CONFIG=./network_config.yaml ./target/release/highway --group-name group1 --peer-name peer2 --base-path ~/workspace/group1_peer2
$ NETWORK_CONFIG=./network_config.yaml ./target/release/highway --group-name group2 --peer-name peer1 --base-path ~/workspace/group2_peer1
$ NETWORK_CONFIG=./network_config.yaml ./target/release/highway --group-name group2 --peer-name peer2 --base-path ~/workspace/group2_peer2
```

Complete the necessary initialization and deploy contract via [tools](../tools/README.md).

Congratulations, your network has been launched and is always ready to serve the world.