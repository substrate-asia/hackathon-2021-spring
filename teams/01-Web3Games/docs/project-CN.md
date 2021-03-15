# 							Web3Games 项目报告	



## 项目背景《原由，要解决的问题》



Web3Games 是基于 Substrate 开发的去中心化数字游戏集成平台，致力于为区块链 WEB3 游戏生态提供各种解决方案。为区块链游戏开发者提供了免费的开发工具和服务，并支持波卡公有链网络内的游戏平行链，以及基于波卡技术的企业级游戏联盟链等。



## 项目技术架构设计



![技术架构](http://qpjf9b6ys.hn-bkt.clouddn.com/%E6%8A%80%E6%9C%AF%E6%9E%B6%E6%9E%84.png)

名词解释

下面是我们的项目官网

https://web3games.blockspaper.com/en/ 

SubGam 代表Substrate Game Community

其它对应LOGO可以在项目官方网站找到他的详细介绍信息！



## 项目进展【项目现在做到的程度】

### 《概括》

项目从立项到开发时间仅有35天不到，小组成员均为兼职开发



截止到目前已经可以展示最小化可行MVP全套流程。



它们分别是 SubGas,SubGat,SubGac以及《额外的示例游戏开发》



这是我们的Yoube DEMO视频



油管 https://www.youtube.com/watch?v=3PIXF1Sa5L0



或者谷歌云盘  https://drive.google.com/file/d/167bwKm7SyP95FR5SMhNZGQ-R5Tv39NTZ/view?usp=sharing



<img src="http://qpjf9b6ys.hn-bkt.clouddn.com/11.png"/>





### 《具体》

#### 1-已完成我们自己的游戏基础链的初步开发并启动公开测试网并提交到Polkadot js app

https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fsubstrate.org.cn%3A4443#/explorer



<img src="http://qpjf9b6ys.hn-bkt.clouddn.com/1.png"/>



#### 2-创建了SubGas网站 

http://sdk.substrate.org.cn/



<img src="http://qpjf9b6ys.hn-bkt.clouddn.com/2.png"/>



#### 3-创建了基于Polkadot js 的测试网水龙头页面，可以领取公开测试网SGC代币并纳入到SubGas中

http://sdk.substrate.org.cn/post/Faucet





<img src="http://qpjf9b6ys.hn-bkt.clouddn.com/3.png"/>





#### 4-创建了项目的知识库面向开发者和玩家用户等

https://web3games.baklib-free.com/



<img src="http://qpjf9b6ys.hn-bkt.clouddn.com/4.png"/>





#### 5-完成了游戏基础链中大量的自研pallet模块

https://github.com/Web3-Substrate-Game-World/SGC/tree/main/pallets



<img src="http://qpjf9b6ys.hn-bkt.clouddn.com/5.png"/>



例如 





##### 5.1-Chain-extension



非常强大的合约与Runtime中pallet交互的公用模块，同时支持通过RUST开发的Wasm合约以及Solidiry编写的sol合约调用我们研发的游戏基础上的Pallet



Wasm 合约调用 其他 -> Wasm合约 【多合约调用】

Sol 合约调用 其他 ->  sol合约 【多合约调用】

Wasm 合约调用 游戏基础链中的 Pallet  

sol 合约调用 游戏基础链中的 Pallet 



##### 5.2-Currency-Token 铸币模块

结合了Acala 的ORML 系列模块 可以向链里铸币 例如SGC啊，DOT,KSM,USDT,ACA等多币种支持

为了接下来的跨链资产以及DEX,GameSwap做准备



##### 5.3-Dex 也叫GameSwap

面向所有Substrate底层的区块链游戏集成交换协议模块



游戏界的uniswap



凡是搭载在SGC游戏基础链上的资产都可以双向自行交换

并支持ERC1155合约资产以及自定义的Subgame合约资产

也就是说同时支持FT,NFT双向标定兑换以及跨链铸币资产



##### 5.4-Erc1155

将1155实现于Substrate中，即使不通过合约也可以直接调用pallet



##### 5.5-Evm-precompile



他是ETH EVM解析组件的重要模块，我们已经基于front bridge 实现了 与以太坊兼容的特性

同时支持Metamask网页端钱包插件以及Metamask移动端双重适配问题，



<img src="http://qpjf9b6ys.hn-bkt.clouddn.com/9.png"/>

欢迎连接我们的网络



##### 6-NFT pallet

很简单的NFT集成模块，你可以通过它制造你自己的NFT



### 6-项目本身的官方网站



https://web3games.blockspaper.com/en/



<img src="http://qpjf9b6ys.hn-bkt.clouddn.com/6.png"/>







### 7-SubGat 



1-SubGat- Game Web Template Frame



面向区块链+游戏开发者的快速构建游戏网站前端的【游戏网站前端模板框架】



提供自定义UI设计能力【基本】



提供去中心化WEB3游戏账户集成能力【核心】



提供玩家查询数字游戏资产的模块例如[NFTS]【拓展】



https://github.com/Web3-Substrate-Game-World/SubGat-Game-Web-Template-Frame







<img src="http://qpjf9b6ys.hn-bkt.clouddn.com/10.png"/>







2-SubGat-Game Web Back-end Server Frame

面向区块链+游戏开发者的快速构建游戏网站后端服务的【游戏网站后端服务模板框架】

https://github.com/Web3-Substrate-Game-World/SubGat-Game-Web-Back-end-Server-Frame



3-SubGat-Game-Client-Template-Frame

面向区块链+游戏开发者的快速构建游戏客户端的【游戏客户端模板框架】



开箱即用的初始化游戏模板【基本】



主流游戏开发引擎及编辑器的兼容支持【核心】



可扩展的第三方模板插件包【扩展】



https://github.com/Web3-Substrate-Game-World/SubGat-Game-Client-Template-Frame





<img src="http://qpjf9b6ys.hn-bkt.clouddn.com/8.png"/>





4-SubGat-Game-Real-Time-Server-Template-Frame



面向区块链+游戏开发者的快速构建游戏服务端【游戏服务端模板框架】



为游戏提供最基本的联机能力【基本】



高度优化的性能和资源占用优化【核心】



可自定义的实时服务器【拓展】



https://github.com/Web3-Substrate-Game-World/SubGat-Game-Real-Time-Server-Template-Frame



5-SubGat-Game-Contract-Library

面向区块链+游戏开发者的快速编写游戏合约的【游戏合约标准库】



为区块链+游戏定制的智能合约范例【基本】



生产级标准的资产及游戏逻辑合约审查测试【核心】



开放的游戏合约提案更新【拓展】

https://github.com/Web3-Substrate-Game-World/SubGat-Game-Contract-Library



### 8-基于SubGat,SubGas,SubGac,polkadotjs开发的示例捕鱼游戏客户端

https://github.com/Web3-Substrate-Game-World/Deep-Sea-Hunter-Webgame-example1



### 9-SGC的水龙头网页

https://github.com/Web3-Substrate-Game-World/Web3-Games-Faucet-Web

### 10-SGC的水龙头服务端及脚本

https://github.com/Web3-Substrate-Game-World/Web3-Games-Faucet-Server



-----------------------------------------------------------------------



## 项目遇到的技术难点以及解决方案

| 技术难点                                                     | 解决方案                                                     |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| More Actions通过REACT CLI怎么去跟polkadotjs交互              | 由于编排工具翻译之后的报错基本都是围绕webpack暴露的配置，不同脚手架工具反馈的错误也很奇葩 |
| NEXT JS 怎么去跟polkadotjs交互                               | 基本上都是围绕调用错误想办法处理，比如类型问题，合约传入的数组必须匹配双MAP映射的传参需求，前端的大数通过Types注入类型等 |
| 游戏客户端 怎么去跟polkadotjs交互                            | 基本上都是围绕调用错误想办法处理，比如类型问题，合约传入的数组必须匹配双MAP映射的传参需求，前端的大数通过Types注入类型等 |
| 对于网络后端的数据库ORM的链接选择使用在diesel与rbatis之间做了选择。 | 对于diesel ROM 库在                                                                                                                                                                                                                                                                                                                                                 连接数据库时，编写操作语句很复杂，执行一些业务查询使用比较复杂。 <br/>之后接触了rbatis，在软件的使用上很是方便，容易。复杂查询处理也很方便。 |
| .对于最近遇到的一个数据执行查询游戏账户登陆的一个接口，通过在rust终端中进行的错误提示我们可以知道，rbatis还不支持<br/>limit（1）的写法 | 这个也去对比了之前的查询写法之前也是没有的将该操作删除后。rbatis数据库查询不再发生问题。 |
| 在开发链逻辑是，要想使用ink合约去调runtime的逻辑时遇到了些问题，因为这里不止合约能实现功能<br/>对于之后的游戏来说，合约标准将是平台的主流标准，将一些业务逻辑实现在链上能对于提升整体的业务性能提升 | 之后根据进阶课大锤老师的ink调runtime的examaple示例，完整的将整个的合约实现在runtime中进行了实现。 |
| 游戏资产存储在合约还是runtime中?                             | 存储在runtime更加安全和去中心化                              |
| 如何在evm和contract合约中使用同一个资产？                    | 通过实现chain-extension和evm-precompile模块，将pallet中功能扩展到evm环境和contract环境 |
| frontier和orml依赖编译问题？                                 | 通过fork方式，修改为与项目相同的依赖，并修复由此产生的报错   |
| 需要多个erc1155独立存储                                      | 通过instance_id区分多个erc1155，是每个erc1155都拥有独立存储好操作 |












​                                                                                                           

