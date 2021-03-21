### Intro

Ares基于Substrate构建，通过使用Babe共识来保证报价节点的匿名性，让作恶节点无法达成合谋篡改价格和报价节点的去中心化，使用波卡独有的Offchain Worker保证链下数据安全可信的提交到链上，采用NPOS来保证节点的去中心化和维护网络带来的奖励，而Babe共识强大的出块速度保证价格的实时提交，使用链上治理来惩罚恶意报价的节点，通过奖励挑战者来达到链上数据的真实可靠。


### About

Ares protocol is a decentralised cross-chain oracle service protocol in the Polkadot ecosystem, a new generation of oracle service protocol that implements verification on the data chain, and It opens up compensation channels for data users when they suffer business losses due to the use of oracle data. As an infrastructure builder connecting the real world and the blockchain network, facing the grand vision of the WEB3.0 era, it provides safe and reliable data services for multiple-chain interconnection and the development of the digital economy.

At first Ares protocol intended to be deployed on Ethereum. Due to Ethereum gas fee, it is difficult to build complex applications and some problems with transaction delays. It need to to find other platforms to deploy. Because Substrate can be chained with one-click, Polkadot’s blockchain architecture began to be reevaluated , and the Substrate can be customised on the blockchain and can construct out a low-gas-cost blockchain, by combining Babe and off-chain workers so that nodes can easily obtain the price of the oracle, and keep the price of the oracle machine on the chain in real time.
The Oracle serves as a bridge between the real world below the chain and the assets on the chain. It can provide on-chain random numbers for NFT and games to use, provide high quality price feeding for DEFI’s lending, AMM DEX, synthetic assets, stablecoin for asset pricing and clearing, real off-chain data enabling insurance providing, DID, IOT devices and forecast markets.

There are 4 main modules.
the exchange price of aggregation (coded withJava)
price-feeding procedure (coded with NodeJs)
Front-end interaction (PolkadotJS )
Oracle protocol (built by Substrate) which contains two pallets, one is based on the event listeners oracle request event module, and the other is the price-feeding system based on substrate unique Off-chain Worker.
It can be divided into the following 5 parts:
1. Registration and unregistration of validator aggregators
2. Request for data and return of off-chain prices
3. On-chain price aggregation
4. How to get the price with off-chain workers
5. How does the Oracle interact with Polkadot JS

安装部署文档 https://github.com/aresprotocols/ares-module/blob/master/README.md

Light Paper: https://docs.aresprotocol.com/#/whitepaper

Website: https://www.aresprotocol.com

Discord: https://discord.com/invite/gWGG63zJVk

Github: https://github.com/aresprotocols

Twitter: @AresProtocol
