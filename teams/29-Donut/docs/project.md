# Donut project report

## Introduction

Donut is a cross-chain bridge of Steem Blockchain and Polkadot, aiming at building Steem 2.0 on Polkadot. Through Donut, community founder without knowledge can tokenize their web content, application, online community, and structure their digital communities.

## Background

### Steem Blockchain

Steem Blockchain is the First and the largest public contents platform based on blockchain, which is used by many communities. The value of Steem from mutual content is just like the Bitcoin to digital asset. However, since Steem blockchain is lack of smart contract layer and sidechain, its interpolation ability is limited. Furthermore, a project called smart media token protocol (SMTs) which was leaded by Steem.inc. The project will finally help every community have the ability to issue a kind of community token that will be a part of mechanism of "proof of brain". Consequently, the project ended without result. 

### The problem need to solve

Donut network focus to bridge the ecosystem between Steem andPolkadot. With Donut, the founders of community can focus themselves over the community operation rather than technical IT infrastructure. In the ideal condition, with Donut, the founders of community can create DeFi and NFT module, issue community token through Donut and make a combination of community and other ecosystem on the Polkadot. 

In the process, Donut Network will sove two main problem: 1, to transfer assets across blockchains; 2, smart contract support. Because of these two solution, community founder can use itself community token to incentive its community development and social communication by rewarding people who contribute community with crypto currencies. Based on that, smart contract makes community develop much more DeFi and NFT digital scenario needs.

Through the Polkadot, Donut digitalized the communities, it not only benefit communities on the Steem to involve token, DeFi, and NFT scenarios. It also help the projects on Polkadot allocate their mutual content module, encourage community development and social communication.

## The Solution And The Structure

### Fundamental Structure

Donut network is an intermediate layer between the basic layer protocol of the blockchain and the community. The Donut blockchain is based on substrate, and it can interoperate with other basic layer protocols through participating in the Polkadot parachain slot auction.

![Image text](http://wherein.mobi/wp-content/uploads/2021/03/donut.png)

### Donut Bridge

With the technology of cross-chain bridge, Donut connects assets on the Steem network and and the Steem assets on Donut network. The task of cross-chain bridge is supported by data vertification over original blockchain network, the function is similar to a light peer on the blockchain network. The cross-chain bridge is comprised by three factors:

* to acquire block data on the Steem network (Block & Header)

* to  process block data (validate and decode transaction)

* to submit the Deposit and the withdraw, proof to runtime

![Image text](http://wherein.mobi/wp-content/uploads/2021/03/Donut-Blockchain-Topology-1.png)
[Figure 1]Donut Blockchain

The issuing of DonutSteem requires its client to provide a Deposite proof. The Deposite proof is created when Donut's client deposit  his/her assets into the Donut delegation account. The Deposite proof include the transaction data signiture made by Donut cross-chain bridge. The Donut issue pallet on Donut vertifies the signiture of Deposite proof, which then be decode to Deposite MetaData.the later one includesthe amount of staking assets on the Steem blockchain and the public key of the account. After the vertification,  The Donut issue pallet on Donut will issue the DonutSteem with corresponding amount. 

![Image text](http://wherein.mobi/wp-content/uploads/2021/03/issue-donut-1.png)
[Figure 2]Lock Steem Asset And Issue DonutSteem

The DonutSteem hold by client can request to redeem the assets on Steem at any time [Figure 3]. After a client instruct to destory amount of DonutSteem, Donut Burning Pallet on Donut will burn the same amount of DonutSteem and issue a Withdraw proof, which include signitures of both Donut Burning Pallet and the client. the data structure of the Withdraw proof is similar to the Deposite proof. After vertification of signiture information, the information will be decoded to a Withdraw MetaData. The later one comprised of the amount of asset and the public key of account. Later, the Steem bridge on Donut will send the specified amount of Steem asset into client account on Steem. 

![Image text](http://wherein.mobi/wp-content/uploads/2021/03/burning-donut-1.png)
[Figure 3]Burn DonutSteem And Redeem Steem Asset

## The industry application scenario

### To boost user increasing by tokenization of content websites, application and communities

Donut Network enable anyone to create their own Proof of Brain token. These Tokens will be distributed through "upvote", they are also embeded into website to promote the development of community. The result of this model has been proved by steemit.com, WhereIN, Steemhunt and so on.These interfaces make a bit success on the way of tokenization of contents and media.

Donut Network connect contents applications and tokens through adjusting the incentive adjustment  between users and entrepreneurs. The founders of community develop the content application through Donut. Through the process of voting, new tokens will distributed original token holders. In the process, token holders, content creaters, and other actors in the community will make the consensus gradually. The specific characters of tokenomy will make incentives to new clients continuously. No matter what kind of application or online communities can help itself development by merging these specific tokens.

### Staking Economy + DeFi

The staking reward mechanism of delegation STEEM POWER on Steem Blockchain, will makes Steem- Polkadot become to a great "Staking economy+DeFi" platform.

Through the combination of Donut Network and Polkadot ecosystem project, The staking mining and the liquidity of staking token come true. Through the combination, Staking can add to other DeFi application scenarios such as Dex, lending, synthetics assets or farming. 

### Content + NFT

Steem is a blockchain based mutual content platefotm with incentive system, it realise local community token incentive its community development and social communication. Through a decentralized content management system and a decentralized token reward system, Steem provides an accurate and transparent evaluation mechanism for countless individuals who have contributed to the community, and rewards cryptocurrency. Simply put, Steem completed the pricing of the data produced by content creators and gave STEEM as an incentive.

On the basis of Steem, we can integrate content with NFT to complete the transaction after digital asset pricing. In this way, content as a digital asset forms a complete closed loop from creation, pricing, and trading. Through "Steem+NFT", the vision of allowing everyone to have ownership in the new attention competition to build a fairer and more balanced Internet is realized. NFT can allow content creators on Steem to get comparable returns for their work, and it also allows Steem to change the way the Internet operates and realize its dream of being a new infrastructure for rewarding content on the Internet.

From this perspective, we can not only package the ownership of the content on Steem into an NFT and enter the trading market. Alternatively, the 7-day income right of the content published on Steem (at the end of the 7 days, Steem will reward STEEM for the content) is packaged into an NFT, and market factors are introduced to allow the content to have a more fair price.

## the level of the project

Finish the aasets transacation across the blockchains. In the next step, Donut will launch its test-parachain. And Donut will bid for a parachain slot.

## Job Done during the hackathon

* to finish the framework  of Donut blockchain through substrate. 
* Donut pallets development
* light validator node of Steem monitor the information from delegatee accounts
* to connect light validator nodes with Donut blockchain 

# For CN 中文

## 介绍

Donut是一个连接Steem Blockchain和Polkadot的跨链桥，旨在在Polkadot上构建Steem 2.0。通过Donut，非技术社区创始人能够将其内容网站/应用程序、在线社区/群通证化，构建其数字化社区。

## 背景

### Steem区块链

Steem区块链作为第一个大规模采用的，基于区块链的公共内容平台，曾经被上百个社区使用。Steem在公共内容方面的价值，就像Bitcoin之于电子现金一样。然而，由于Steem Blockchain缺乏智能合约和侧链，一直无法得到有效拓展。steemit.inc自2017年主导开发的Steem 2.0 —— 智能媒体通证协议（SMTs），以让社区具有发行“Proof of Brain”机制社区通证的能力，最后也无疾而终。

### Donut要解决的问题

Donut network专注于做好Steem与Polkadot生态的桥接，让Steem上的社区创始人无需过多关注基础设施，只需更多专注于其社区的运营。理想情况下，社区创始人可以通过Donut，发行社区通证，构建社区DeFi、NFT等模块，将社区与Polkadot生态进行融合。

Donut network解决了两个主要问题：跨链资产互通和智能合约支持。通过这两个问题的解决，社区创始人能够使用社区自有通证奖励社区建设和社交互动，为无数对社区做出主观贡献的个人提供加密货币的回报。在此基础上，智能合约让社区得以拓展DeFi、NFT等更多数字化场景的需求。

Donut通过Polkadot让社区数字化，不仅有利于Steem上数百社区拓展包含社区通证、DeFi、NFT等的更多应用场景，更让Polkadot生态项目可以配置其公共内容模块，激励其社区建设和社交互动。

## 项目解决方案及架构

### 基础架构

Donut network是一个区块链基础层协议与社区之间的中间层。Donut blockchain基于substrate搭建，通过参与Polkadot平行链插槽拍卖，与其他基础层协议跨链互通。

![Image text](http://wherein.mobi/wp-content/uploads/2021/03/donut.png)

### Donut跨链桥

Donut通过跨链桥技术打通Steem网络中的资产和Donut网络中的Steem资产。跨链桥依托于对原始区块链网络的数据验证，类似于区块链网络里的轻节点，Donut的Steem跨链桥主要包含三部分：

* 获取Steem网络区块数据（Block和Header）

* 处理区块数据（验证以及解析交易）

* 提交Deposit和Withdraw Proof到runtime

![Image text](http://wherein.mobi/wp-content/uploads/2021/03/Donut-Blockchain-Topology-1.png)
 [Figure 1]Donut Blockchain

DonutSteem的发行需要用户提供 Deposit proof【见图2】，Deposit proof 由 Donut 在用户将Steem区块链资产存入 Donut 代理账户时颁发给用户，用户提交的 Deposit proof 包含 Donut跨链桥对交易数据的签名，Donut的Donut Issue Pallet首先验证 Deposit proof 的签名信息，经过验证的 Deposit proof 被解析为 Deposit MetaData，后者包含用户锁定的Steem区块链资产的金额以及Steem区块链网络账户公钥。Donut 的Donut Issue Pallet随后发行对应数额的 DonutSteem。

![Image text](http://wherein.mobi/wp-content/uploads/2021/03/issue-donut-1.png)
[Figure 2]Lock Steem Asset And Issue DonutSteem

用户持有的DonutSteem，可以在任何时候选择赎回为Steem网络资产【见图3】。用户选择销毁一定数额 DonutSteem后，Donut的Donut Burning Pallet会燃烧掉同等数额 DonutSteem，并向用户颁发 Withdraw proof，类似于Deposit proof，其中包含了Donut Burning Pallet的签名信息以及用户 Donut 账户签名。Donut的Steem桥会验证 Withdraw proof 签名信息，验证通过后解析出 Withdraw MetaData，后者包含用户需要解锁的 Steem资产 数额以及用户在Steem区块链网络中的账户公钥。随后，Donut的Steem桥将指定数额的Steem区块链资产转移到用户在Steem区块链网络账户中。

![Image text](http://wherein.mobi/wp-content/uploads/2021/03/burning-donut-1.png)
[Figure 3]Burn DonutSteem And Redeem Steem Asset

## 行业应用场景

### 为内容网站、应用程序、在线社区进行货币化和实现用户增长

Donut network让任何人都有能力推出基于Proof of Brain的通证，这些通证基于算法通过“upvote”和“like”进行分发，并与网站集成以协调激励措施实现社区的增长。这种模型在Steem上的steemit.com、WhereIN、steemhunt和其他Steem接口进行了验证，这些接口在将内容、通证和媒体货币化中取得了一定的成功。

Donut network通过在网络用户和构建应用程序的企业家之间调整激励，将世界范围内的内容应用程序与通证联系在一起。社区创始人依靠Donut来发展其内容应用程序，通过竞争投票的过程，自动生成由现有通证持有者分配给内容生产者的新通证。随着通证分发给网络用户，现有通证持有者进一步与内容创建者、运行应用程序的企业以及支持他们的企业家保持一致。通证经济学的这些独特属性继续为加入的和参与网络发展的新用户提供激励。任何应用程序，各种在线社区，都能够集成并利用这些特殊的通证来实现自身发展。
### 质押经济 + DeFi

Steem blockchain的通过 delegate STEEM POWER获得Staking reward的机制，使得Steem-Polkadot成为一个极佳的“Staking Economy + DeFi”的平台。

通过Donut network与Polkadot生态项目进行组合，可以实现Staking mining（质押挖矿）、Liquidty Staking Token（质押资产流动性），以及基于此的与Dex、Lending、合成资产、Farming结合的去中心化金融应用场景。

### 内容 + NFT

Steem作为一个基于区块链的、激励的公共内容平台，实现了通过加密货币激励社区建设和社交互动。通过分散的内容管理系统和分散的令牌奖励系统，Steem为无数对社区做出贡献的个人提供了一个准确的、透明地评估机制，并奖励加密货币。简单来说，Steem完成了内容创作者所生产数据的定价，并给与STEEM作为激励。

在Steem的基础上，我们可以将内容与NFT进行融合，完成数字资产定价之后的交易一环。这样，内容作为一种数字资产就从创造、定价、交易，构成一个完整的闭环。通过“Steem+NFT”，实现让每个人在新的注意力竞技中拥有所有权，来建立更公平、更均衡的互联网的愿景。NFT可以让Steem上的内容创作者为他们的工作获得与之相当的回报，亦让Steem改变互联网的运作方式，实现其作为互联网上奖励内容的新基础设施的梦想。

从这个角度出发，我们不仅可以将Steem上内容的所有权打包成为NFT，进入交易市场。亦可，将发布在Steem上内容7天的收益权（7天结束，Steem会对内容奖励STEEM）打包成为NFT，引入市场因子，让内容有一个更为公正的定价。

## 整体完成程度

完成跨链资产互通，下一步Donut上线平行链测试网，以及参与平行链插槽拍卖。

## 黑客松期间完成事项

* 完成基于substrate搭建donut blockchain基础架构. 
* Donut pallets开发.
* Steem轻验证节点代理账户交易信息监控.
* Steem轻验证节点对接Donut blockchain.
