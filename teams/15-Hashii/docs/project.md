## NFTSwap

中文
===========================================================================================================================================================

### 项目背景/原由/要解决的问题
    
在《名利场:1850 年以来的艺术品市场》一书中，提到艺术品价格有“社会性”:当社会主要购买能力的喜好发生变化时，艺术品的供需关系也会发生变化。艺术品一方面作为社会地位的象征，另一方面成为资产管理的需求。在当前物质水平日渐提升的人群中，对于精神消费的需求不断提高，艺术品则成为新的消费标的。

画廊、拍卖行、艺术品交易平台等作为撮合交易的载体，依旧解决不了以下矛盾:

1)艺术品过多，投资者面临选择困难的问题。

2)价格不明朗，拍卖价格依赖于宣发能力和拍卖平台。

3)头部效应严重，很多艺术家和艺术品无法被发现。

4)艺术品流动性差，多数艺术品长期无交易量。
 
在传统艺术品交易中，以画廊、拍卖行作为中枢，实现创作者和收藏者的价值交换，但容易出现“两头小，中间大”的问题，“画廊、拍卖行”作为利益最大方，一方面是创作者的作品价值无法得到合理的评估，另一方面，收藏家购买了哄抬价格后的“天价”作品。为解决收藏者和创作者的“两头小”矛盾，我们引入 NFTSwap 概念，打破“画廊、拍卖方”的定价权，将其回归于买卖双方——收藏者和创作者，由支持者实现价值发现和价值评估功能。

NFTSwap是一个智能协约框架，采用去中心质押池形成的NFT价值评估体系。每个可拍卖NFT对应一个质押池，用户可以通过质押来对NFT的的估值提供价值认可，通过NFTSwap托管拍卖的NFT需要支付最终成交10-20%的佣金，这个佣金将会分给提供价值认可提供者（VP）。
 
 NFTSwap对NFT的托管、拍卖、估值、质押提供一揽子协议框架，为NFT的去中心管理提供契约参考。
 
### 项目技术设计

#### NFT托管

用户可以将自己持有的NFT资产，转入NFTSwap智能契约进行托管。在NFT托管期间，NFT持有者可以对NFTSwap下达指令，进行NFT的提取、拍卖、信托等操作。

#### NFT拍卖

NFT持有者，可以对智能契约发出拍卖指令。拍卖需要注明最高价与最低价，并设定拍卖期，拍卖期按照区块高度进行设置，拍卖期最短不得少于6000个区块。拍卖期间NFT持有者无法对NFT进行操作；拍卖一旦成功，NFT即刻转让给最高出价者，到期没有完成拍卖（流拍），NFT持有者可以对NFT进行下一步指令。
拍卖最高价与最低价一致，简称为一口价，即购买者必须按照出价进行行购买。
拍卖最高价设置为不可能达到的价格，称为天价，即购买者必须等到拍卖期结束，价高者得。
竞买者出价不小于最低价，且不小于当前最高出价，一旦竞买者出价达到最高价，交易即可达成。

#### 一、交易接口

1. 创建Nft艺术品

```rust
pub fn create(
  origin, 
  title: Vec<u8>,  // 标题
  url: Vec<u8>,  // 链接
  desc: Vec<u8> // 详情
)
```

2. 移除Nft

```rust
pub fn remove(
  origin, 
  nft_id: T::NftId // 艺术品Id
)
```

3. 转移Nft艺术品

```rust
pub fn transfer(
  origin, 
  target: T::AccountId, // 转移目标
  nft_id: T::NftId // 艺术品Id
)
```

4. 下拍卖单出售艺术品

```rust
pub fn order_sell(
  origin, 
  nft_id: T::NftId,  // 艺术品Id
  start_price: BalanceOf<T>, // 起拍价格
  end_price: BalanceOf<T>, // 结拍价格
  keep_block_num: T::BlockNumber // 拍卖最大保留区块数量
)
```

5. 竞拍Nft艺术品

```rust
pub fn order_buy(
  origin, 
  order_id: T::OrderId, // 订单Id
  price: BalanceOf<T> // 竞拍价格
)
```

6. 主动结算拍卖 // 用于到期结算

```rust
pub fn order_settlement(
  origin, 
  order_id: T::OrderId // 订单Id
)
```

7. 进行投票质押

```rust
pub fn vote_order(
  origin, 
  order_id: T::OrderId,  // 订单Id
  amount: BalanceOf<T> // 质押数量
)
```



#### 二、trait Type: 类型信息/常数

##### 注入类型

- NftId: Nft艺术品Id
- OrderId: 订单Id

##### 常数

- MinKeepBlockNumber: 拍卖订单最小保留区块数
- MaxKeepBlockNumber: 拍卖订单最大保留区块数
- MinimumPrice: 最小拍卖价格
- MinimumVotingLock: 最小质押投票数量
- FixRate: 用于分润算法的固定利润常数
- ProfitRate: 参与质押的分润比例

##### 复合类型

- Nft艺术品

```rust
pub struct Nft {
	pub title: Vec<u8>, // 标题
	pub url: Vec<u8>, // 链接
	pub desc: Vec<u8>, // 详情
}
```

- 拍卖单

```rust
pub struct Order<OrderId, NftId, AccountId, Balance, BlockNumber> {
	pub order_id: OrderId, // 订单Id
	pub start_price: Balance, // 起拍价格
	pub end_price: Balance, // 结拍价格
	pub nft_id: NftId, // nftId
	pub create_block: BlockNumber, // 创建时区块数
	pub keep_block_num: BlockNumber, // 最大保留区块数
	pub owner: AccountId, // nft所有者
}
```

- 竞拍单

```rust
pub struct Bid<OrderId, AccountId, Balance> {
	pub order_id: OrderId, // 订单Id
	pub price: Balance, // 竞拍价格
	pub owner: AccountId, // 竞拍人
}
```

- 质押投票

```rust
pub struct Vote<OrderId, AccountId, Balance, BlockNumber> {
	pub order_id: OrderId, // 订单Id
	pub amount: Balance, // 质押数量
	pub keep_block_num: BlockNumber, // 通过拍卖单生成的质押区块长度
	pub owner: AccountId, // 质押者
}
```



#### 三、Storage: 存储数据结构

1. Map nftId -> nft详情， 用于存储所有nft

```rust
pub Nfts: map hasher(twox_64_concat) T::NftId => Option<Nft>;
```

2. Map nftId -> 账户Id， 用于记录nft所有者

```rust
pub NftAccount: map hasher(twox_64_concat) T::NftId => T::AccountId;
```

3. Map nftId -> 订单Id， 用于记录Nft对应的订单数据

```rust
pub NftOrder: map hasher(twox_64_concat) T::NftId => Option<T::OrderId>;
```

4. Map  订单Id -> 订单详情, 用于存储所有待完成的拍卖订单

```rust
pub Orders: map hasher(twox_64_concat) T::OrderId => Option<OrderOf<T>>;
```

5. Map 订单Id -> 当前最大出价，用于存储当前订单的最大出价

```rust
pub Bids: map hasher(twox_64_concat) T::OrderId => Option<BidOf<T>>;
```

6. Map 订单Id -> 质押投票列表, 用于存储质押列表

```rust
pub Votes: map hasher(twox_64_concat) T::OrderId => Vec<VoteOf<T>>;
```

7. NftId生成器，递增

```rust
pub NextNftId: T::NftId;
```

8. 拍卖订单Id生成器，递增

```
pub NextOrderId: T::OrderId;
```


### 项目现在做到的程度

已完成NFTSwap 1.0版本开发，支持用户在平台创建NFT、托管NFT、NFT拍卖、质押资产、参与拍卖等操作。


### 项目遇到的技术难点及解决方案

难点：如何设置一套公正合理的去中心化收益算法。


##### 解决方案：

通过价值评估博弈系统，让拍卖人、质押支持者、购买者相互制约，帮助作品接近其合理价，，最终实现作品拍卖成功。

1) 当质押支持者普遍认为拍卖人拍卖的作品无多大价值时，即便拍卖成功，所得佣金也很少， 大部分 质押支持者不会质押支持。质押支持者 角色起到价值发现的作用。
2) 当拍卖人将起拍价格设置的过高时，购买者基本不会参与竞拍，所以成交概率低，导致 质押支持者 不去质押支持。对于该作品 拍卖人与 质押支持者 存在价值偏差，质押支持者 从侧面起到价值估价的 作用。
3) 当质押支持者认可拍卖人拍卖的作品，且价格相对合理，积极参与质押支持。同时为购买者节省 筛选的成本，当 购买者 参与竞拍后，作品拍卖成功，拍卖人按比例获得拍卖收入，购买者 获得作品，质押支持者 获得佣金。


因此，拍卖人承担合理报价的义务，实现作品交易流通变现的权益;质押支持者承担监督 拍卖人 合理报价的义务，获得价值发现与评估的奖励;购买者 作为最终的作品消费者，节约了筛 选优质项目的服务，同时享有作品的最终定价权以及检验 质押支持者的评估效果。



### 项目如果报名时已经做到一定高度 (之前已经开始做)，请列点说明在黑客松期间 (2月1日 - 3月15日) 所完成的事项/开发工作。

 期间完成了NFT创建、NFT托管、发起拍卖、价值认可、参与拍卖、收益自动结算等代码开发功能。

### 未来6个月的商业规划

2021年3月，NFTSwap框架在波卡生态推出并开源。

2021年4月，成立NFT专项基金，扶持NFT生态，同时将NFTSwap框架在以太坊、币安智能链、火币链部署。

2021年5～9月，发起倡议成立NFT标准协会，联合生态伙伴制定NFT在艺术品、游戏、门票、身份、资产等多领域的解决方案，并将标准推广到主流公链。


### 市场定位及调研

#### 产品定位
NFTSwap 旨在建立去中心化的艺术品交易平台，通过算法引入支持者投票质押 支持方式，建立公平、透明、合理的艺术品价值评估体系，为创作者与收藏者的艺 术品交易流通提供公平与合理的交易方式。
  
通过人人都可是拍卖人、支持者、竞买者的体系，让艺术品走向普通大众，提 升大众的艺术认知观念。NFTSwap简化了艺术品交易流程，并对艺术品进行有效推广，平衡了艺术品供需关系，形成艺术品完整产业链，使得 NFTSwap 具有权威性、创造性、可靠性、交易性的特质，引领艺术市场良性发展。

NFTSwap致力于成为全球最大的NFT资产价值估价拍卖平台。

#### 调研情况
与多家画廊、艺术家、行业KOL沟通后，普遍表现出强烈合作意愿，均认可NFTSwap框架可以解决NFT行业痛点，解决NFT估价困难，宣发成本高等问题。

### 现在拥有的资源及项目运营到什么程度

举办北京最大线下艺术展的经验，正在筹办上海艺术展。

已合作了数百家画廊，有海量插画师和艺术家资源，可以为NFTSwap输入优质的NFT资产。

与国内头部区块链媒体平台有深度合作，有强大的媒体宣发能力。


Englist
===========================================================================================================================================================
### Project background/reason/problem to be solved

In the book "Vanity Fair: The Art Market since 1850", it is mentioned that the price of art is "social": when the society's main purchasing power preferences change, the supply and demand relationship of art will also change. On the one hand, art works as a symbol of social status, and on the other hand, it becomes a demand for asset management. Among the people whose material level is increasing day by day, the demand for spiritual consumption continues to increase, and artworks have become new consumption targets.

Galleries, auction houses, art trading platforms, etc., as vehicles for matching transactions, still cannot solve the following contradictions:

1) There are too many artworks, and investors face the problem of difficult choices.
2) The price is uncertain, and the auction price depends on the ability of publicity and the auction platform.
3) The head effect is so serious that many artists and artworks cannot be found.
4) The liquidity of artworks is poor, and most artworks have no trading volume for a long time.

In traditional art transactions, galleries and auction houses are used as the hub to realize the value exchange between creators and collectors. However, the problem of "small at the two ends and big in the middle" is prone to appear. "Gallery and auction houses" are the parties with the greatest interest. On the one hand, the value of the creator’s work cannot be reasonably evaluated; on the other hand, the collector purchases the “expensive” work after the price has been driven up. In order to resolve the contradiction between collectors and creators, we introduce the concept of NFTSwap to break the pricing power of “galleries and auction parties” and return them to buyers and sellers—collectors and creators. Supporters realize value discovery. And value evaluation function.

NFTSwap is a smart contract framework that uses an NFT value evaluation system formed by a decentralized pledge pool. Each auctionable NFT corresponds to a staking pool. Users can provide value recognition for the valuation of the NFT through staking. NFTs that are auctioned through NFTSwap need to pay a commission of 10-20% of the final transaction, and this commission will be allocated to provide value Recognized provider (VP).

NFTSwap provides a package agreement framework for the custody, auction, valuation, and pledge of NFTs, and provides contractual reference for the decentralized management of NFTs.

### Project technical design
#### NFT hosting
After communicating with many galleries, artists, and industry KOLs, the other party expressed a strong willingness to cooperate, and they all recognized that the NFTSwap framework can solve the pain points of the NFT industry, solve the problems of NFT valuation difficulties, and high publicity costs.

#### NFT Auction
NFT holders can issue auction instructions to smart contracts. The auction needs to indicate the highest price and the lowest price, and set the auction period. The auction period is set according to the block height, and the minimum auction period shall not be less than 6000 blocks. NFT holders cannot operate NFT during the auction period; once the auction is successful, the NFT is immediately transferred to the highest bidder, and the auction is not completed (passed auction) at the expiration date, and the NFT holder can make the next order for the NFT. The highest auction price is the same as the lowest price, referred to as a buy-it-price for short, that is, the buyer must make a purchase according to the bid. The highest auction price is set to an impossible price, called a sky-high price, that is, the buyer must wait until the end of the auction period, and the highest bidder gets the price. The bidder's bid is not less than the lowest price and not less than the current highest bid. Once the bidder's bid reaches the highest price, the transaction can be concluded.

#### One, trading interface

1. Create Nft Artwork

```rust
pub fn create(
   origin,
   title: Vec<u8>, // title
   url: Vec<u8>, // link
   desc: Vec<u8> // details
)
```
2. Remove Nft

```rust
pub fn remove(
   origin,
   nft_id: T::NftId // Artwork Id
)
```

3. Transfer Nft Artwork

```rust
pub fn transfer(
   origin,
   target: T::AccountId, // transfer target
   nft_id: T::NftId // Artwork Id
)
```

4. Place an auction order to sell artworks

```rust
pub fn order_sell(
   origin,
   nft_id: T::NftId, // Artwork Id
   start_price: BalanceOf<T>, // starting price
   end_price: BalanceOf<T>, // closing price
   keep_block_num: T::BlockNumber // The maximum number of blocks reserved for auction
)
```

5. Bid for Nft artwork

```rust
pub fn order_buy(
   origin,
   order_id: T::OrderId, // Order Id
   price: BalanceOf<T> // auction price
)
```

6. Active settlement auction // for expiry settlement

```rust
pub fn order_settlement(
   origin,
   order_id: T::OrderId // Order Id
)
```

7. Pledge voting

```rust
pub fn vote_order(
   origin,
   order_id: T::OrderId, // Order Id
   amount: BalanceOf<T> // pledge amount
)
```



#### Second, trait Type: type information/constant

##### Injection type

-NftId: Nft artwork Id
-OrderId: Order Id

##### Constant

-MinKeepBlockNumber: The minimum number of blocks reserved for auction orders
-MaxKeepBlockNumber: The maximum number of blocks reserved for auction orders
-MinimumPrice: minimum auction price
-MinimumVotingLock: The minimum number of pledged votes
-FixRate: fixed profit constant used for profit sharing algorithm
-ProfitRate: The percentage of profit sharing involved in the pledge

##### Composite type

-Nft artwork

```rust
pub struct Nft {
pub title: Vec<u8>, // title
pub url: Vec<u8>, // link
pub desc: Vec<u8>, // details
}
```

-Auction List

```rust
pub struct Order<OrderId, NftId, AccountId, Balance, BlockNumber> {
pub order_id: OrderId, // Order Id
pub start_price: Balance, // starting price
pub end_price: Balance, // end price
pub nft_id: NftId, // nftId
pub create_block: BlockNumber, // number of blocks at creation
pub keep_block_num: BlockNumber, // Maximum number of reserved blocks
pub owner: AccountId, // nft owner
}
```

-Bidding list

```rust
pub struct Bid<OrderId, AccountId, Balance> {
pub order_id: OrderId, // Order Id
pub price: Balance, // auction price
pub owner: AccountId, // bidder
}
```

-Pledge voting

```rust
pub struct Vote<OrderId, AccountId, Balance, BlockNumber> {
pub order_id: OrderId, // Order Id
pub amount: Balance, // pledge amount
pub keep_block_num: BlockNumber, // The length of the pledge block generated by the auction order
pub owner: AccountId, // pledger
}
```



#### Three, Storage: storage data structure

1. Map nftId -> nft details, used to store all nft

```rust
pub Nfts: map hasher(twox_64_concat) T::NftId => Option<Nft>;
```

2. Map nftId -> Account Id, used to record the nft owner

```rust
pub NftAccount: map hasher(twox_64_concat) T::NftId => T::AccountId;
```

3. Map nftId -> Order Id, used to record the order data corresponding to Nft

```rust
pub NftOrder: map hasher(twox_64_concat) T::NftId => Option<T::OrderId>;
```

4. Map order Id -> order details, used to store all pending auction orders

```rust
pub Orders: map hasher(twox_64_concat) T::OrderId => Option<OrderOf<T>>;
```

5. Map order Id -> current maximum bid, used to store the maximum bid of the current order

```rust
pub Bids: map hasher(twox_64_concat) T::OrderId => Option<BidOf<T>>;
```

6. Map order Id -> pledge voting list, used to store pledge list

```rust
pub Votes: map hasher(twox_64_concat) T::OrderId => Vec<VoteOf<T>>;
```

7. NftId generator, increment

```rust
pub NextNftId: T::NftId;
```

8. Auction order Id generator, increment

```
pub NextOrderId: T::OrderId;
```


### How far the project is now
The development of NFTSwap version 1.0 has been completed, which supports users to create NFTs on the platform, host NFTs, NFT auctions, pledge assets, participate in auctions and other operations.

### Technical difficulties encountered by the project and solutions

Difficulty: How to set up a fair and reasonable decentralized revenue algorithm.

##### solution:

Through the value evaluation game system, the auctioneer, pledge supporter, and purchaser are mutually restricted, helping the work to approach its reasonable price, and finally achieving the success of the auction of the work.

1) When the pledge supporters generally believe that the auctioned works of the auctioneer are of little value, even if the auction is successful, the commission will be very small, and most pledge supporters will not pledge support. The role of pledge supporter plays a role in value discovery.
2) When the auctioneer sets the starting price too high, the buyer will basically not participate in the auction, so the probability of the transaction is low, which leads to the pledge supporters not to pledge support. For this work, there is a value deviation between the auctioneer and the pledge supporter, and the pledge supporter plays a role in value evaluation from the side.
3) When the pledge supporter recognizes the works auctioned by the auctioneer, and the price is relatively reasonable, actively participate in the pledge support. At the same time, it saves the purchaser the cost of screening. When the purchaser participates in the auction, the auction of the work is successful, the auctioneer gets the auction revenue in proportion, the purchaser gets the work, and the pledge supporter gets a commission.


Therefore, the auctioneer assumes the obligation of reasonable quotation and realizes the rights and interests of the work transaction circulation; the pledge supporter assumes the obligation to supervise the auctioneer’s reasonable quotation and obtain rewards for value discovery and evaluation; the purchaser is the ultimate consumer of the work, saving screening The service of high-quality projects, while enjoying the final pricing power of the work and the evaluation effect of the test pledge supporter.


### If the project has reached a certain height when registering (it has been done before), please list the items/development work completed during the hackathon (February 1st-March 15th).
During this period, code development functions such as NFT creation, NFT custody, auction initiation, value recognition, auction participation, and automatic settlement of proceeds were completed.
### Business plan for the next 6 months
In March 2021, the NFTSwap framework was launched in the Polkadot ecosystem and open sourced.

  In April 2021, a special NFT fund was established to support the NFT ecosystem, and the NFTSwap framework was deployed on Ethereum, Binance Smart Chain, and Huobi Chain.
  
  From May to September 2021, an initiative was initiated to establish the NFT Standards Association, to work with ecological partners to develop NFT solutions in various fields such as artwork, games, tickets, identity, and assets, and to promote the standards to the mainstream public chain.
### Market positioning and research

#### Product Positioning
NFTSwap aims to establish a decentralized art trading platform, introduce supporters to vote and pledge support through algorithms, establish a fair, transparent and reasonable art value evaluation system, and provide fairness and fairness for creators and collectors of art trading and circulation. Reasonable transaction method.
  
Through a system in which everyone can be an auctioneer, supporter, and bidder, art will be brought to the general public and the public's artistic perception will be improved. NFTSwap simplifies the art transaction process, effectively promotes the art, balances the supply and demand of art, and forms a complete industry chain of art, making NFTSwap authoritative, creative, reliable, and transactional, leading the art market to be healthy development of.

NFTSwap is committed to becoming the world's largest NFT asset valuation auction platform.

#### Research situation
Communicating with many galleries, artists, and industry KOLs, the other parties have expressed a strong willingness to cooperate, and they all generally recognize that the NFTSwap framework can solve the problems of reasonable pricing of NFTs and high cost of publicity.


### To what extent are the resources currently available and the project is operated

The experience of hosting the largest offline art exhibition in Beijing is currently preparing for the Shanghai Art Exhibition.

He has cooperated with hundreds of galleries, has a large number of illustrators and artists resources, and can import high-quality NFT assets for NFTSwap.

It has in-depth cooperation with the domestic leading blockchain media platform and has strong media promotion capabilities.
