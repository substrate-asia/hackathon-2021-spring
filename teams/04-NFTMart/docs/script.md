# 脚本

## 前言
大家好，我是 NFTMart 团队的 Caos，很高兴能够参加波卡举办的黑客松活动，同时我也很兴奋能够和这么多优秀的团队一起，利用区块链技术共建 Web3 的世界。

> Hello everyone, I am CAOS of the NFTMart team. I am very happy to join the Polkadot hackathon, and I am also very excited to work with so many excellent teams, use  blockchain technology to build the Web3 ecosystems.

首先让我来介绍一下什么是 NFTMart ，NFTMart 是一个专业 NFT 资产服务的平台，包含了资产的管理，铸造，交易等模块，利用 token 经济来协调并治理整个 NFTMart 未来的发展。

> First of all, let me introduce what is NFTmart . NFTmart is a professional NFT asset service platform, including asset management, mining, trading and other modules. NFTMart uses token economy to coordinate and govern the future development of NFTmart.

在过去的几个月里，我们见证了 NFT 市场的兴起，这股热潮正在席卷圈外用户的注意力，NFT 越来越能够成为区块链出圈的核心，资产的所有权和资产数字化将成为区块链行业的增量空间，将会有大量 NFT 资产供给端和购买端的需求会被激活，这也让 NFTMart 更加有信心作为一个长久的创业项目为加入到 NFT 浪潮中的用户提供持续的服务于支持。

> In the past few months, we have witnessed the rise of NFT market, the craze is sweeping  the user who dont konw crypto, NFT is gonna to be the core asset for crypto world, the ownership of assets and asset digitalize are the incremental space block chain industry, there will be a lot of NFT assets supply and demand will be activated, which also makes NFTMart more confident as a long start-ups to join in the tide of NFT users to provide continuing service to the market.

## 技术选型

我们使用 substrate 并基于 Acala 开源的 ORML 的模块实现了 NFT 相关集合的功能进行改造，使用 IPFS 作为多媒体的存储，graphQL 服务器作为数据缓存层的实现（因为一些技术原因未整合到当前的代码库中）

> We use Substrate and module based on Acala open source ORML to implement the functions of NFT related collection, using IPFS as the media storage, and GraphQL server as the implementation of the data caching layer (WIP).

涉及到的模块如下：
> The modules involved are as follows
- Proxy
用来管理作品集的权限与未来 NFT 资产商业逻辑上的扩展。
> Porxy module manage NFT collection permissions ，decide who can mint the NFT , manage the admin white list for collection

- ORML NFT
初步作为 NFT 标准的抽象实现，未来会根据更多的场景扩展
> Initially as an abstract implementation of the NFT standard, it will be expanded for more scenarios in the future


- ORML Balances
用来支持多资产跨链，多币种结算交易 NFT 资产
> Prepare for multi-asset and cross-chain asset in NFT settlement of NFT trading

- Reserve
结合了 Token 经济和设计的逻辑，为未来的 token 激励和 NFT 资产的管理提供便利
> It combines the rule of Token economy and design for Token incentives for the users.


- IPFS client
我们希望 NFTMart 能够去客户端化，也是就是要考虑未来完全去中心化的运行终端的应用
> We need NFTmart to be decentralized running, without Centralized service


- GraphQL DB
为确保更加便捷的查询和友好的用户体验，为第三方定制化的客户端提供扩展和数据支持
> To ensure more convenient query and user-friendly experience, we will provide GraphQL and RESTful open api support for  third-party develop

