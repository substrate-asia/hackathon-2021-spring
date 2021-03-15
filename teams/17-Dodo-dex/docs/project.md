## Background

- DODO’s decentralized exchange product suite consists of SmartTrade trading and aggregation, Crowdpooling/IDO, pools, and mining (which include liquidity mining, trading mining, and combiner harvest mining). It is integrated with various wallet applications through which users can interact with the platform.

  - **SmartTrade trading and aggregation:**

  Built on Ethereum and Binance Smart Chain (BSC), DODO enables trading between two arbitrary tokens on the same network. The SmartTrade feature intelligently finds the best order routing from aggregated liquidity sources to give traders the best prices. Users who execute trades on DODO also have the option to participate in trading mining, which rewards traders with DODO tokens.

  - **Crowdpooling:**

  Crowdpooling is an equal opportunity way to distribute tokens and kick-off liquidity markets. Inspired by the call auction mechanism commonplace in securities markets, Crowdpooling ensures that there is no front-running or bot interference. With the added security and assurance provided by a liquidity protection period, users are able to participate in liquidity offering campaigns and be involved in the projects they support with peace of mind.

  - **Pools:**

  DODO gives liquidity providers the flexibility to create and manage their own market making strategies through DODO Vending Machine and DODO Private Pool. This is a fully permissionless, non-custodial process and users are empowered to configure pools with various parameters in order to establish liquidity markets with the ideal pricing curves that suit their needs.

  - **Mining:**

  In addition to the aforementioned trading mining and the traditional liquidity mining, pool creators and liquidity providers can also get involved by participating in Combiner Harvest mining, which gives DODO platform users readily available exposure to trending, promising projects that are willing to collaborate with DODO. Vetted projects can create liquidity pools on DODO and liquidity providers of these pools will receive DODO reward tokens.

  - **pmm:**

  Proactive Market Maker (PMM) is a new chain market making model. It is different from the non-constant function market maker model, which separates the transaction-to-asset relationship. Parameters such as asset ratio and curve slope can be flexibly set. At the same time, an oracle machine can be introduced to guide prices or price discovery by the market on the chain. It will gather more funds near the market price and provide sufficient liquidity.

- Cooperate with Moonbeam and Clover, migrate the product into  Polkadot.

 

## Technical Design

* Base on PMM Algorithm. Markets contain huge amounts of data and information that represent buyers and sellers’ sentiment and valuation of assets. In essence, a market reacts dynamically to changes in available information and thus requires sophisticated mechanisms to do so. In a blockchain context, building such a complex platform, given the limited computing and storage resources, presents us with various unique challenges, the most daunting of which is the compression aspect.

  Compression is the act of extracting the most important features of a thing while removing the less important bits. So what is a market’s “most important feature”? The answer is liquidity. Liquidity can be graphically represented by a market depth chart, pictured below.

  ![pmm_1](https://dodoex.github.io/docs/img/pmm_1.png)

  

  The depth chart consists of two roughly triangular (though not necessarily symmetrical) shapes, representing bids (buy orders) and asks (sell orders) respectively, along the price x-axis and the depth y-axis. The two triangles can be mathematically described by two parameters, mid price and slope, or how “steep” the triangle is.![pmm_2](https://dodoex.github.io/docs/img/pmm_2.png)

  Let us closely examine the depth triangle on the right hand side first. This is the ask side, where ask (sell) prices are quoted. We can see that the more base tokens are sold, the higher the price. Thus, this linear relationship can be captured by the following formula:
  $$
  P = i + ik(\frac{B_0-B}{B_0})
  $$
  

  where i is Parameter 1, the mid price, and k is Parameter 2, the slope. B is the number of base tokens currently in the inventory and B_0 is the initial number of base tokens in the inventory. (B_0-B)/B_0 is the portion of base tokens that have been removed from the ask side due to transactions, relative to the initial base token balance. This formula stipulates that as the number of base tokens that have been traded increases, the base token price rises **linearly**.

  But is this an accurate representation of market reality? Not exactly, because this linear model has two limitations:

  1. In practice, most liquidity is concentrated near (immediately above or below) the mid price, because that is the most capital-efficient strategy for market makers. The linear model does not reflect this uneven distribution and is thus an oversimplification
  2. The linear model returns a liquidity of zero after the price exceeds or goes below a certain threshold. However, in reality, no matter how favourable the quoted price is (e.g. for ETH/USDC, a bid order at $100 and an ask order at $1,500), there is liquidity present at that price. This model fails to take such scenarios into account

  Therefore, we need to make this pricing curve/depth chart nonlinear to align it with market patterns, but we also don’t want to introduce additional parameters. How should we go about doing that?![pmm_3](https://dodoex.github.io/docs/img/pmm_3.png)

  We want to make the depth chart nonlinear to depict the fact that depth is more concentrated in the vicinity of the mid price.

  Mathematically, the most obvious and straightforward solution is to change the addition in the aforementioned linear formula to multiplication, like this:
  $$
  P = i(\frac{B_0}{B})
  $$
  

  In this formula, P increases as B decreases, and it also doesn’t have an upper or lower bound (technically it has a lower limit of 0, but a subzero price doesn’t make sense anyway). But what about the slope? The solution is to refactor the B_0/B term and add a new parameter k that we can use to control the magnitude of the change in price due to B.
  $$
  P = i(1-k + k\frac{B_0}{B})
  $$
  

  When B_0/B >= 1, P is directly proportional to B_0/B in the previous formula, but in this new formula, k dictates the extent of which P is affected by B_0/B. **More specifically, k is in the range [0, 1] and governs the slope of the pricing curve.**

  - When k = 0, the formula becomes P = i, so the price does not change regardless of other parameters
  - When k = 1, the formula reverts back to (2)
  - When k is in (0, 1), as k increases, so does the price elasticity, meaning that the price becomes more sensitive to change in base token quantity (i.e. B). Conversely, as k decreases, the price elasticity also decreases

  This model seems sufficiently complete to cover all scenarios, but there is another issue. In a transaction, the total amount of tokens that needs to be paid is the area under the pricing curve, so we will have to take the integral of the curve, but the curve formula above makes this calculation cumbersome as B_0/B introduces a logarithmic term during derivation. To make computation easier, we square the B_0/B term to eliminate all instances of log:
  $$
  P = i(1-k + k(\frac{B_0}{B}^2))
  $$
  **Incredibly, when k = 1, this curve is identical to the AMM bonding curve**. This reaffirms our belief that this algorithm has captured the essence of market activities and patterns. If traditional AMM pricing method is Newtonian classical mechanics, then PMM is akin to Einstein’s theory of general relativity.

  Similarly, without the loss of generality, we apply the same derivation procedure for the bid side depth chart, substituting base tokens with quote tokens (denoted by Q) and using division instead of multiplication. We get:
  $$
  P=i/(1-k+(\frac{Q_0}{Q})^2k)
  $$
  

  Combining both formulae, we get the proactive market maker (PMM) pricing formula, described in mathematical terms below.
  $$
  P_{margin}=iR
  $$
  R*R* determined by the following formula:
  $$
  if B<B_0, then R=1-k+(\frac{B_0}{B})^2k \\
  if Q<Q_0, then R=1/(1-k+(\frac{Q_0}{Q})^2k) \\
  
  else R=1
  $$
  

  The PMM algorithm is a “high-fidelity” abstraction of the orderbook-based market, defined and regulated by a handful of simple parameters, but it is also highly flexible and optimized for on-chain operations.

  We will then enumerate several promising use cases for PMM that can be achieved by fine-tuning parameters and instituting different withdrawal/deposit rules.

* DODO Private Pool for private market maker.

* Crowdpool. With the added security and assurance provided by a liquidity protection period, users are able to participate in liquidity offering campaigns and be involved in the projects they support with peace of mind.

* Design vDODO token. vDODO is a token that serves as a user’s proof of membership in DODO’s loyalty program.  vDODO token holders benefit from the token, different from ordinary token.

* Smart Contract Framework![dodo_framework_v2](https://dodoex.github.io/docs/img/dodo_framework_v2.png)



## Progress

* Created Classic Pool with PMM

* Update DODO V2, made DVM(DODO Vending Machine), DPP(DODO Private Pool), Crowdpools, vDODO system

* Smart Trade

  ![7471f206ecf403590b9b2412ace202884bf87718](https://aws1.discourse-cdn.com/standard14/uploads/dodoex/original/1X/7471f206ecf403590b9b2412ace202884bf87718.png)

  

## Difficulties and solutions

* EVM compatibility.

  Subtly Modified the solidity code, to make them adjust the Moonbeam environment

* Polymerize blockchain data into the grath

  Make a tiny version to suit the new codes


## Hackthon duration  progress

* **Update DODO V2**. Provide a variety of asset issuance models: Crowdpooling, auction, fixed-price issuance, and customized bonding curve issuance (DVM IDO)
* **Institutional Market Makers On-Chain**. Partnered up with Wootrade to provide quotes for mainstream assets on BSC with almost ZERO spread, with a small inventory of $100k+
* Successfully deal with one attack action