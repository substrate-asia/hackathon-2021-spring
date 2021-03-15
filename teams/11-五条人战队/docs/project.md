# Project Report
## Project background
X predict Market is a decentralized prediction market. The objective of X predict Market is to enable users to participate in the prediction process in various ways by creating topics, discussing, predicting and approving the results. Users are also incentivized by these engaging activities. Beyond the prediction, users can actively interact and socialize with each other within the social system. It is a way to gather people's wisdom to conduct historical analysis and future exploration. It can also benefit current decision-making. Therefore, our team wants to contribute to such a way to condense the wisdom of the people.It will be developed based on Polkadot's substrate framework.

## Project technical design
#### Proposal management
The proposal is created using create，then the proposal is stored on-chain through the structure of storage Struct Proposal

- Data structure of proposal
Struct **Proposal** {
type:string,
title:vec<u8>,
optionDescription, 
currencyOption, 
settlement: id,
period:u32, 
time: u32,
proposalDescription: vec<u8>,
}

- Call for proposal creation
**Create**

- Storage
all the proposal
**Map<id, Proposal >**
The currency required for voting is specified during the creation of proposal
**Currency ProposalId**
Users need to stake the underlying asset governance token of predict DAO to participate in the market voting once the proposal is created.
**Doublemap <id, account, vote>**
accounts for the storage of the voting related data of the user, displaying their votes on each individual proposal.
**Map<id, vote>** 
applies to the counting of the total votes in the proposal.
When the proposal acquires enough votes to enter the formal proposal area, users can start voting on the options of the proposal.


#### Transaction
Transactions can only be enabled after the proposal enters the formal area
This module is the implementation design for the user to employ the vote function
User votes by **bet (proposal ID, optionID, amount)**
If the user wants to quit the vote. **revoke(proposal ID)** can revoke the vote.

#### Result(OCW)
Implementation of this module relies on the user governed OaaS (Oracle as a service).
This step applies the **Unsigned transaction with signed payloads** transaction type that does not generate mining fee.

**Doublemap(pid, account, oid)**  Result counting

**Doublemap(pid, did, vote)** Proposal votes counting,Storage of the result statistics

Trigger the report mechanism
When the result is published, anyone can trigger the report mechanism once malicious acting node is discovered.

**Vec< oid >** Staking or not
**Doublemap <account, pid, did>** 

This node will be recorded when the report succeeds
Proposal ends if no report filed
Implementation of this module relies on the user governed OaaS（Oracle as a service）, we use **Result (payload)** to submit the Unsigned transaction with signed payloads transaction, which does not generate mining fee.
When the voting ends, we use **Doublemap(pid, account, oid)** to count the result and the **Doublemap(pid, did, vote)** to count the votes of the proposal, the statistics storage of the result is accomplished by the above methods.
When the result is published, anyone can trigger the report mechanism once evil acting node is discovered.
Whether anyone file a report by staking is recorded through **Vec<oid>**
The report is evaluated by the community, the successful report result will be recorded by **map<pid, oid>**
The report cycles using Loop 
Proposal ends if no report filed

#### Liquidation
This module is used to withdraw assets (for winners in the prediction)
Data strucure is recorded in the result
Exchange the proposal related governance token
**map(pid, oid)**  result
The prediction proposal winner triggers the liquidation(transaction fee required in the withdrawal)
This module is used to withdraw assets (for winners in the prediction). The formal result is published using **map(pid, oid)**. According to the settings, the wrong prediction tokens are slashed while the correct prediction token will be cashed in the settlement currency at a 1:1 ratio, and the correct prediction will be charged a 2% transaction fee at the reward withdrawal. This transaction fee is set by the creator at the beginning of the proposal creation.
The token transfer employs **transfer()**  token, balanceof(oid)

#### Asset Modules for multiple asset management
**Transfer**:  Vote as transfer from to amount
In the final asset module, we use (from to amount) to manage multiple assets.

#### Key Functions
##### 1. Creation of The Prediction Market
Everyone can initiate a prediction proposal in the initial proposal pool through X predict Market. When creating the topic, users should set up the prediction type, topic, optional results, settlement currency, transaction fee ratio, prediction period, and the actual date when the result is revealed. Besides, any number of settlement tokens are required to add for initial liquidity, as well as a text describing the key points and merits of the proposal, the source of information, how the results will be validated and secured accurately and etc. It is to win the support and attract other users to join the prediction.

##### 2. Voting in Initial Proposal Pool
In the initial proposal pool, all users can browse and vote for any prediction proposals created by other users, which draw their interests. During the vote, users will need to verify the connected wallet addresses and hold a certain amount of governance tokens. If the number of ‘support’ votes exceeds a certain basic amount, and the support rate surpass 50%, the proposal is passed. If the proposal is finally passed, the users who voted in favor will get the governance tokens of the initial proposal vote as rewards. If it does not pass, the users who vote against it are getting rewards instead.

##### 3. The Prediction Stage
Proposals that have passed the initial voting will be displayed in the formal prediction pool. Users can choose any of the ongoing prediction topics to submit their opinions. When the topic is created, the creator sets the settlement currency for transaction at the very beginning, such as DOT. 
Users can either make predictions or add liquidity to the prediction topic. Users will get transaction fee by adding liquidity.

When making a prediction, a certain amount of settlement tokens is required in the wallet, and then the settlement token is exchanged for the prediction tokens. During the prediction period, users are free to sell prediction tokens to make profits or stop losses in a timely manner. When the prediction result is officially announced, the tokens which are successfully predicted will be exchanged for settlement tokens at a ratio of 1:1, otherwise the tokens that fail the prediction will lose value.

Referring to AMM, we set up a new type of fixed product automated market maker (FPMM), which will automatically adjust the value of prediction tokens, eliminating the need for in-depth support of order book, and the liquidity is greatly increased.

Compared with AMM, this can tokenize the two predicted options and control the sum of their prices to 1. The more people who buy one of the options, the higher the price, but the price will never exceed 1. The traditional AMM is only suitable for direct transactions between 1 token and another token, and the price can theoretically increase indefinitely.


##### 4. Prediction Completed
When the prediction period set by the creator of the topic ends, the result is pending. In this process, any new prediction can no longer be proceeded while liquidity can be removed.

##### 5. Result Uploaded On-chain
When the result is generated reaching the initially set-up timeline, the prediction result is uploaded automatically by the governance node through the oracle and is totally transparent to all users for judgement during the result announcement period.

##### 6. Market Settlement
After the result is revealed, the price of the token with the opposite position will decrease to zero, and the prediction tokens with successful prediction will be cashed in the settlement tokens at 1:1. When the person who predicts correctly gets the reward, a 2% withdrawal fee will be charged. Within the 2% fee, 50% of which will be allocated to the node for submitting the correct result, and the other 50% will be used as platform revenue for technology development, token buy-back and etc. The transaction fee ratio is set by the creator upon topic creation with a default 2% rate. 90% of the transaction fee will be rewarded to the liquidity provider, and 10% will be rewarded to the topic creator.

## The extent to which the project is now done
At present, business logic construction, prototype planning, and UI design have been completed, and the code part needs to be added.

## Technical difficulties encountered by the project and solutions
Ensure the consistency of the data on the chain with the real world. Solution: Data aggregation on the chain, through ocw and on-chain governance modules to ensure the authenticity and rationality of the data
## List the development work completed during the hackathon
Achieved the creation of topics, topic data on the chain, topic results upload, front-end UI implementation, front-end chain interaction




# 项目报告
## 项目背景
X predict Market是一个去中心化的预测市场。 X predict Market的目标是通过创建主题，讨论，预测和批准结果，使用户能够以各种方式参与预测过程。 这些吸引人的活动也激励了用户。 除了预测之外，用户还可以在社交系统内彼此进行积极的交互和社交。 这是一种通过收集人们的智慧来进行历史分析和探索未来的方法。 它还可以使当前的结果贡献者受益。 因此，我们的团队希望通过聚集人民智慧的方式做出贡献。它将基于Polkadot的基础框架进行开发。 

## 项目技术设计
### 提案管理
使用create创建提案，然后通过存储结构Struct Proposal的结构将提案存储在链上
- 提案的数据结构
Struct **Proposal** {
type:string,
title:vec< u8 >,
optionDescription, 
currencyOption, 
settlement: id,
period:u32, 
time: u32,
proposalDescription: vec< u8 >,
}

- 征集提案
创建

- 存储
所有的提案
**Map<id, Proposal >**
提案创建过程中指定了投票所需的货币
**Currency ProposalId**
创建提案后，用户需要放样预测DAO的基础资产管理令牌以参与市场投票。
**Doublemap <id, account, vote>**
帐户用于存储用户的投票相关数据，并显示他们对每个提案的投票。
**Map<id, vote>**
适用于计算提案中的总票数。
当提案获得足够的票数进入正式提案区域时，用户可以开始对提案的选项进行投票。

### 交易
提案进入正式区域后才能启用交易
该模块是供用户使用表决功能的实现设计
用户按 **bet (proposal ID, optionID, amount)** 投票
用户是否要退出投票。 **revoke(提案ID)** 可以撤消投票。

### Result(OCW)
该模块的实现依赖于用户控制的OaaS（Oracle即服务）。
此步骤将**未签名交易的签名有效负载交易类型**应用于不会产生采矿费的交易。

**Doublemap(pid, account, oid)**  结果计数
**Doublemap(pid, did, vote)** 提案计票，结果统计存储

触发报告机制
结果发布后，一旦发现恶意代理节点，任何人都可以触发报告机制。

**Vec< oid >** 是否质押
**Doublemap <account, pid, did>** 

报告成功后将记录此节点
如果未提交报告，则提案结束
该模块的实现依赖于用户控制的OaaS（Oracle即服务），我们使用**Result（payload）** 提交带有签名有效负载交易的Unsigned交易，这不会产生采矿费。
当投票结束时，我们使用**Doublemap(pid，account，oid)** 对结果进行计数，并使用**Doublemap(pid，did，vote)** 对提案进行计数，结果的统计存储通过上述方法完成。
结果发布后，一旦发现恶意节点，任何人都可以触发报告机制。
通过**Vec< oid >** 记录是否有人通过放样提交报告
该报告由社区评估，成功的报告结果将通过**map <pid，oid>** 进行记录
报告循环使用循环
如果未提交报告，则提案结束

### 清算
此模块用于提取资产（适用于预测中的获胜者）
数据结构记录在结果中
交换与提案相关的治理令牌
**map（pid，oid）** 结果
预测提案获胜者触发清算（提款中需要的交易费）
此模块用于提取资产（针对预测中的获胜者）。 形式结果使用**map(pid，oid)** 发布。 根据设置，将削减错误的预测令牌，而正确的预测令牌将以1：1的比例在结算货币中兑现，并且正确的预测将在奖励提取时收取2％的交易费。 该交易费用由创建者在提案创建开始时设置。
令牌转移使用**transfer（）** 令牌，balanceof（oid）

### 用于多种资产管理的资产模块
**转移**：从转移到金额
在最终资产模块中，我们使用（从到金额）来管理多个资产。
### 关键功能
#### 1.建立预测市场
每个人都可以通过X predict Market在初始投标池中发起预测投标。 创建主题时，用户应设置预测类型，主题，可选结果，结算货币，交易费用比率，预测期限以及显示结果的实际日期。 此外，还需要增加任意数量的结算代币以增加初始流动性，以及描述提案要点和优点，信息来源，如何正确验证和确保结果等。 赢得支持并吸引其他用户加入预测。

#### 2.在初始提案池中投票
在初始提案池中，所有用户都可以浏览其他用户创建的任何预测提案并对其进行投票，从而吸引他们的兴趣。 投票期间，用户将需要验证连接的钱包地址并持有一定数量的管理令牌。 如果“支持”票数超过某个基本数量，并且支持率超过50％，则提案通过。 如果最终通过提案，则投票的用户将获得初始提案投票的管理令牌作为奖励。 如果未通过，则对它投反对票的用户将获得奖励。

#### 3. 预测阶段
经过初步投票的提案将显示在正式预测池中。 用户可以选择任何进行中的预测主题来提交他们的意见。 创建主题后，创建者会在一开始就设置交易的结算货币，例如DOT。
用户可以进行预测或向预测主题添加流动性。 通过增加流动性，用户将获得交易费用。

进行预测时，钱包中需要一定数量的结算令牌，然后将结算令牌交换为预测令牌。在预测期内，用户可以自由出售预测代币以及时获利或止损。当正式宣布预测结果时，成功预测的令牌将以1：1的比例交换为结算令牌，否则未通过预测的令牌将失去价值。

参照AMM，我们建立了一种新型的固定产品自动做市商（FPMM），它将自动调整预测代币的价值，从而无需深度支持订单簿，并且大大增加了流动性。

与AMM相比，这可以将两个预测的期权标记化并将价格总和控制为1。购买其中一个期权的人越多，价格越高，但是价格永远不会超过1。传统的AMM仅适合对于一个令牌和另一个令牌之间的直接交易，价格理论上可以无限期地上涨。


#### 4.预测完成
主题创建者设置的预测期结束时，结果待定。在这个过程中，在可以消除流动性的同时，不再进行任何新的预测。

#### 5.结果上传到链上
当生成的结果到达初始设置的时间线时，预测结果将由管理节点通过oracle自动上载，并且对所有用户完全透明，以便在结果发布期间进行判断。

#### 6.市场结算
结果显示后，相对位置的代币的价格将降至零，并且成功预测的预测代币将以1：1兑现到结算代币中。当正确预测的人获得奖励时，将收取2％的取款费。在2％的费用中，其中50％将分配给节点以提交正确的结果，另外50％将用作技术开发，令牌回购等的平台收入。设置交易费用比率由创建者在创建主题时使用默认2％的费率。 90％的交易费用将奖励给流动性提供者，而10％的奖励将奖励给主题创建者。

## 现在完成项目的程度
目前，业务逻辑构造，原型计划和UI设计已经完成，并且需要添加代码部分。

## 项目遇到的技术难点及解决方案
保证链上数据与真实世界的一致性 解决方法：链上数据聚合，通过ocw和链上治理模块来确保数据的真实合理性

## 列点说明黑客松期间完成的开发工作
实现了创建议题 议题数据上链 议题结果上传 前端UI实现 前端链的交互
