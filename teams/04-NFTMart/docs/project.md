# NFTMart info

## Background

Starting from 2017, the NFT market has only 3 years of history so far, which is very immature compared to Bitcoin (11 years) or the traditional 
financial market (hundreds of years). As an on-chain mapping of the real economy, the market size of NFT will be much larger than the FT Token 
market. The current monthly transaction amount is only about 10 million US dollars, which is less than one hundred thousandth of the FT Token 
market. Even with a conservative attitude toward the development of NFTs, there will be hundreds or even thousands of times the market size 
growth space in the next two to three years.

从2017年开始，NFT市场至今只有3年的历史，与比特币(11年)或传统的比特币相比，这是非常不成熟的金融市场(数百年)。作为实体经济的链上映射，NFT的市场规模将远远大于FT代币市场。目前每月交易金额仅为1000万美元左右，不到FT代币的十万分之一市场。即使以保守的态度看待nft的发展，也会有数以百计甚至上千倍的市场规模未来两到三年的增长空间。

### Problem
- High transaction cost and slow speed
- Few NFT categories
- Lack of quality NFT
- High-quality assets are not easy to mine

- 交易成本高，速度慢
- NFT 类别较少
- 缺乏高质量的 NFT
- 缺乏优质的 NFT 渠道
### How to solve
- Use substrate to solve cost and transaction speed issues
- Adopt POB (Proof of Behavior)mining mechanism to increase the activity of merchants and players
- Operations will generally cooperate with institutions to establish NFT alliances
- Strengthen the support of key industries and increase the supply of high-quality assets highquality assets
- Provide better tools and services

- 使用 Substrate 解决成本和交易速度问题
- 采用 POB 行为挖矿机制，增加商家和玩家的活跃度
- 运营部门一般会与机构合作建立 NFT 联盟
- 加强对重点产业的支持，增加优质资产供给优质资产
- 提供更好的工具和服务

### Technical design

- Substrate as our asset chain
- IPFS as our media store service
- Go and data collector as our data cache service
- Client APP with react and integrate with polkadot{js} and polkadot extension

- Substrate 作为我们的资产链
- IPFS 作为我们的媒体存储
- Go 和 js indexer 作为我们的数据缓存服务(还在研发中)
- react 客户端应用程序，与 polkado{js} 和 polkadot 扩展集成
### what we do now 

- Substrae on-chain logic and api done
- data collector and graphQL api done
- client with polkadot api and ipfs client integration done

- 完成链上逻辑和 api demo
- 数据收集器和 graphQL api 进行中
- 客户端与 polkadoapi 和 ipfs 客户端集成完成
### What we got and fixed

- Go-RPC client cannot work,after open an issue for the repo, we change to node.js sdk as our on-chain data and combine the go server to cache on-chain dat

go-rpc 客户端无法正常工作，在给 repo 提出的问题后，我们更改为 node.js sdk作为我们的链上数据，并结合go服务器缓存链上数据
## Business plan for the next 6 months

* Complete financing in April
* Complete testnet development in May
* Start to expand NFT resource cooperation in May
* Complete the mainnet launch and cross-chain solution in August

* 4 月份完成融资
* 5 月份完成测试网开发
* 5 月开始扩大 NFT 资源合作
* 8 月份完成主网上线及跨链解决方案