# Project

Shopbring aims to build a decentralized commissioned shopping platform in Polkadot ecosystem. Polkadot ecosystem users can commission e-commerce users to pay their shopping cart, and finally settle with them in cryptocurrency.

## Background

As the DeFi business model matures, there will be a demand for cryptocurrency as a payment option in the future. We are developing Shopbring to realize the first step of cryptocurrency shopping.

### Analysis from market demand

Shopbring meets the needs of two types of people:

* People who are attracted by the high returns of DeFi and want to invest a little money to participate in DeFi, but have no experience in cryptocurrency trading.
* People who don't want to frequently exchange fiat currencies in the OTC market, but want to directly use cryptocurrency for shopping, and can flexibly participate in DeFi.

### Feasibility analysis from technical realization

* We use Substrate to build the platform, which can not only customize the business functions, but also reuse the open-source pallets Library of Polkadot developers. The feature of substrate forkless upgrade makes our development plan more confident.
* We don't need to build a DeFi system, we only need to rent parachain slots. Shopbring can transmit messages with other parachains. For example, calling the currency exchange, pledge financing and other functions of the DeFi parachain.
* Shopbring is an independent parachain, which can greatly optimize transaction performance while minimizing transaction fees. Its electronic payment experience is comparable to centralized payment systems.

### Feasibility analysis of business model

Consumers who shop do not directly use cryptocurrency to make payments on the e-commerce platform, but instead issue commissioned shopping orders and lock the payment amount in the system. Other shopping agents can freely accept the order, complete the shopping on the specific e-commerce platform, and then ship it to the consumer's delivery address. After consumers receive the commodity, they confirm the receipt on chain, and finally the system pays the locked amount and tips to the shopping agents.

> In the process of shopping, consumer has not used legal currency, and the payment amount does not need to be hosted by a third party. Shopbring network consensus ensures the security of funds; there is a legal currency transaction between the e-commerce user and the e-commerce platform, and the security of funds is guaranteed by the state's compliant payment companies. Assuming that the e-commerce user did not complete the task, he could not get the amount locked in the chain. Suppose that the buyer completes the task of purchasing on behalf, and the consumer receives the commodity but does not confirm the arrival of the commodity, he cannot recover the unlocking amount. It is difficult to avoid such disputes, so we need to introduce the role of "arbitrator" in our system to solve the ownership problem of locked amount through dispute arbitration. In order to make the platform grow healthily, we also need to build a credit incentive mechanism. Good behavior increases credit, bad behavior deducts credit, and airdrops tokens according to the proportion of credit value.

## Project Details

### Project Features

* **Share consensus security with Polkadot network.** Shopbring is a Polkadot parachain base on Substrate. We don't have to invest long-term maintenance cost for network consensus.

* **No permission is required.** Shopbring does not require KYC(Know Your Customers), anyone who has a Polkadot account can issue commissioned shopping orders or provide shopping services.
* **Decentralized arbitrators.** In order to maintain the healthy development of the platform, we have established a arbitrator mechanism. When users have disputes in the commissioned shopping process, any party can report violations, and the system randomly assigns a arbitrator to assist in arbitration.
* **Credit incentive mechanism.** In order to stimulate more users to shop frequently at Shopbring, we have established a credit incentive mechanism. After the commissioned shopping is completed, the system converts the amount into a credit value and adds it to both parties of the transaction by verifying the receipt. Accounts with credits can receive native tokens as rewards.
* **Private information security**. The order details will not be recorded on chain, only the hash of the order data is stored on chain.
* **Support multi cryptocurrency payment.** Multi cryptocurrency payment is supported in the commissioned shopping, which makes cryptocurrency more widely used.

### Ecosystem Role

* **Consumer.** Issue the commissioned shopping order and use cryptocurrency as the payment method.
* **Shopping agent.** Accept the commissioned shopping order, complete the actual shopping action on the e-commerce platform, and let the merchants deliver the commodity to the real consumers.
* **Arbitrators.** Users who register as a arbitrator need to freeze a certain amount of native tokens. After becoming a arbitrator, they are mainly responsible for arbitrating purchase transaction disputes. Part of the fine can be obtained by completing the arbitration.
* **Inspector**. To register as an inspector, a majority of the council is required. The inspector needs to run an off-chain service for verifying shopping receipts, such as verifying the authenticity of commodity invoices.
* **Council.** Election of council members in accordance with Polkadot governance rules.
* **Technical Committee.** Technical committees are established by the Council in accordance with Polkadot governance rules.
* **Treasury.** Refer to the design of the Polkadot Treasury, the funds come from the token incentive model, transaction fees and tips, etc. As long as they contribute to the development of the community, anyone can apply for financial support.

### Credit Incentive Mechanism

For the healthy development of Shopbring, we design a credit value growth model and native token incentive algorithm. The core meaning is as follows:

* The behavior that is favorable to the development of Shopbring will increase the credit value, and the behavior that is unfavorable to the development of Shopbring will reduce the credit value.
* Open and transparent credit data can help users choose trading partners.
* In Polkadot ecosystem, it provides credit data reference for other parachains.

In order to incentivize platform users to increase their credit value, the system initially sets an equation of credit value and native token value (this equation can be changed through community governance in the future), assuming: 1 credit value = 0.001 native token.

After the user completes the commissioned shopping and the shopping receipt is verified, the credit value of the account can be increased. The program will calculate the number of native tokens obtained by the account based on the new credit value and record it in the reward mapping table. When users receive rewards, a portion of the rewards are donated to the treasury.

### Arbitrator

Normal user registration arbitrators need to freeze a certain native token as an application condition. The `council` will review the applicant's information, and more than half of the members will vote to become an arbitrator.

The arbitrator’s obligation is that when a common user has a dispute during the commissioned shopping, either party will appeal to the system. The arbitrator can choose the case to intervene in the dispute. During the waiting period, up to `M` arbitrators can sign up to participate in the dispute. After the waiting period ends, the system will randomly select `N`($N < M$, and `N` is an odd number) arbitrators to actually participate in the dispute. If there are less than `N` arbitrators actually participating, the `council` will participate in dispute arbitration. After the arbitration is completed, the `treasury` will pay wages to the participating arbitrators.

> Note:
> In order to establish a good arbitration mechanism in the early stage of the network, the council will consider people with customer service experience to be arbitrators when reviewing applications. It is also considered that there are not many commissioned shopping disputes in the early stage of the network, so the wages of the arbitrator will be fixed and paid by the treasury. This can reduce the cost of both parties to the transaction and encourage more arbitrators to actively participate in dispute resolution.
>
>When the network's credit incentive mechanism is perfected, all accounts with credit value have been rewarded with native tokens. At this time, both parties need to deposit a certain native tokens (also can be deposited by other account) for commissioned shopping. Once a dispute occurs during the process, the party who loses the arbitration will pay the arbitrators.

### Inspector

Shopbring introduces the role of inspector to verify whether the shopping process actually happened. This role provides trusted services to verify shopping receipts(like invoices). For example, in China, most e-commerce platforms provide the right of applying for electronic invoices issued by the State Administration of Taxation. By verifying the authenticity of the electronic invoice, it can be determined whether the consumption process has occurred. Shopbing has the following design requirements for inspectors:

* The user submits the application for registering inspector, then waits for the council to review. When more than half of the members of the council vote for, the review is passed.
* The inspector needs to provide an API service to verify the shopping receipt. Shopbring's off-chain worker will submit the unverified shopping receipt to the inspector's API service, and finally the inspector will submit the verification result to the chain.
* Shopbring will have several certified inspectors. After more than half of the inspectors verify the authenticity of the shopping receipt, the value of the commodity can be converted into a credit value.

**How do off-chain worker communicate with the inspector's service?**

We define the structure of shopping receipt like this, and is stored in off-chain order system.

| Parameter      | Type     | Description                                                                                   |
|----------------|----------|-----------------------------------------------------------------------------------------------|
| area           | u32      | Country or area code.                                                                         |
| receipt_type   | u8       | Receipt type: 0: e-invoice, 1: physical bill, need to be photographed and uploaded.           |
| payload        | Vec\<u8> | E-invoice information is saved in json format according to different national standards.      |
| receipt_attach | Vec\<u8> | The link to the physical bill attachment requires manual verification.                        |
| receipt_hash   | Vec\<u8> | The receipt's data will be encoded using SCALE-codec and finally be hashed using blake2b-256. |
| order_hash     | Vec\<u8> | Order hash, used to associate original order detail.                                          |

1. The registered inspector can bind his verification API on-chain.
2. Because there may be many types of receipt formats, we store the detail of the receipt off-chain, and after encoding the data, submit the `receipt hash` to the chain for storage.
3. The verification system of the inspector needs to connect to the off-chain order system, and send the `receipt hash` to it to fetch the detail of the receipt. The verification system completes verification of the receipt data and records the result.
4. The off-chain worker sends the `receipt hash` to the verification API, fetchs the verification result, and submits the transaction signed by the inspector account to the chain.

### Invitation Reward

At the beginning, the Shopping agents had no native token on Shopbring, so they could not submit transaction on chain. In order to solve this problem, we design the invitation reward.

Shopbring users who hold native token can become invitees. The operation is as follows:

1. The inviter randomly generates an `ed25519` key pair, and then initiates an application to become the inviter. The parameters are: inviter's address, `ed25519` public key, single donation amount and maximum number of invitees.
1. The inviter provides the `ed25519` private key to the invitee, and the invitee uses the private key to sign account public key to obtain "accept invitation signature".
1. Invitee submits and accepts the invitation, parameters are: invitee's address, acceptance invitation signature, and the account inviter's address.
1. The system uses `ed25519` algorithm to verify the invitation signature. After approval, the amount of single donation will be transferred to the invitee, and no fee of this transaction will be paid.
1. Every time the invitee completes a commissioned shopping order, his credit value will increase, and the credit value of the person who invited him will also increase slightly.

### The Commissioned Shopping Process

> Users continue to make the commissioned shopping on the platform, and the system will record considerable order data. If the order data is stored on chain, it will incur very large storage costs. Therefore, we will develop an off-chain order management system to store order detail, like shopping order information, shipping information, invoice information, and return information. These information will be serialized and hashed before being stored on chain. The system is deployed on a centralized server managed by us, and will use Polkadot wallet authorization to sign in like `polkassembly.io`, and normal accounts can only access their own order data. The inspector can access the commodity invoice data to be verified and its associated commodity details.

There are several stages in the commissioned shopping process:

1. Consumer copies product information from the e-commerce platform to Shopbring's shopping cart until they are satisfied, then fill in the delivery address and confirm the order. The order information is stored in the off-chain order system.
2. The consumer selects the cryptocurrency to be paid, fills in the payment quantity and tip, issues the commissioned shopping order on chain. At this stage, consumer can also manually close the order.
3. The shopping agent accepts the order on chain.
4. The shopping agent submits the merchant's shipping information. The detailed information is recorded in the off-chain order system. The shipping information's hash is submitted on chain.
5. Consumer confirms receipt or applys for commodity return.
  5.1 If consumer confirms the receipt of commodity, then the commissioned shopping process is completed.
  5.2 Consumer applys for commodity return on chain, and the off-chain order system saves: type (return/exchange), reason for return and other information.
  5.3 The shopping agent shall contact the merchant to solve the return, submit the return address information to the off-chain order system.
  5.4 The consumer performs the return, submits the shipping number to the off-chain order system.
  5.5 After the merchant confirms the receipt of the commodity, the shopping agent confirms that the commodity are returned successfully.The frozen payment amount will be returned to the consumer, and the tip will be paid to the shopping agent.
6. After the commissioned shopping process is completed, the consumer or the shopping agent submits the invoice information to the off-chain order system, and submits the invoice hash data to be verified on chain.
7. The Shopbring's off-chain worker reads the invoice hash data which is not verified, and requests the invoice verification API to confirm whether the shopping process is actually happening. When the invoice hash data is verified by more than half of the inspectors, the value of the commodity can be converted into a credit value.

Each stage has an operation time limit. If the time-out occurs, there are the following processing conditions:

* When the shopping agent accepts the commissioned shopping order and exceeds the shopping limit time, the order is automatically closed, the agent's deposit is paid to the consumer, and the locked payment amount and tip are returned to the consumer.
* When the consumer exceeds the time limit for confirming receipt, the order is completed automatically, and the payment amount and tip are transferred to the shopping agent.
* When a consumer applies for a return, but the shopping agent exceeds the time limit for submitting the return address, the order is automatically closed, the shopping agent pays the deposit to the consumer, and the locked payment amount and tip are returned to the consumer.
* When the consumer exceeds the time limit for submitting the return shipping order, the order is completed automatically, and the payment amount and tip are transferred to the shopping agent.
* When the shopping agent exceeds the time limit for acceptance of returned commodity, The order is completed automatically. If the action is return, payment amount will be returned to consumer, tip will be transferred to shopping agents; If the action is change, payment amount and tip will be transferred to shopping agent.

### Complaint of commodity return dispute

It is inevitable that some disputes will arise in the process of commodity return. Both parties of the transaction can submit a complaint and let the arbitrator intervene. Arbitrators generally determine the arbitration results according to the service terms of the e-commerce platform to which the commodity belong. There are two situations as follows:

* The purchasing behavior of the shopping agent does not conform to the service terms of the e-commerce platform, and the consumer does not receive the expected commodity, which belongs to the responsibility of the shopping agent.
* The consumer's return behavior complies with the terms of service of the e-commerce platform, but the shopping agent does not provide any help, which is the responsibility of the shopping agent.
* The return behavior of consumer does not conform to the service terms of e-commerce platform, and the shopping agent has done its duty to provide help, which belongs to the consumer responsibility.

The arbitrator completes the arbitration and determines the winner. The winner and the arbitrator will receive an increase in credit value and a deposit, and the loser will deduct the credit value.

### Revenue and use of Treasury

The revenue sources of the treasury are as follows:

* Transaction fees: A portion of each block's transaction fees goes to the Treasury, with the remainder going to the block author.
* The commissioned shopping tip: A portion of each commissioned shopping transaction tip goes to the Treasury.
* Native token inflation: As the credit value of the entire network increases, native tokens are also issued.

Anyone can propose to apply for the use of the treasury. Proposals may consist of (but are not limited to):

* Infrastructure deployment and continued operation.
* Network security operations (monitoring services, continuous auditing).
* Ecosystem provisions (collaborations with friendly chains).
* Marketing activities (advertising, paid features, collaborations).
* Community events and outreach (meetups, pizza parties, hackerspaces).
* Software development (wallets and wallet integration, clients and client upgrades).

## Ecosystem Architecture

![Ecosystem Architecture](https://github.com/blocktree/shopbring-docs/blob/master/resources/Shopbring-architecture-en.jpg?raw=true)

The whole ecosystem is divided into three parts: **Participants**, **Shopbring** and **Polkadot ecosystem**.

**Participants** include: external users, e-commerce platform(such as Taobao, JD, Amazon), OTC market(such as Huobi, ZB, Binance), cryptocurrency wallet, etc.
**Shopbring** is the underlying blockchain system base on Substrate, and as a parachain connected to Polkadot. It does not need to customize its own network consensus, but needs to have its own democratic governance mechanism.
**Polkadot ecosystem** is an infinitely expanded blockchain network. There will be many parachains focusing on a certain business to enrich the network, so that Shopbring only needs to do its own things.

## Ecosystem Fit

At present, we have not found any decentralized system to provide shopping services. Since the traditional e-commerce platform technology is very mature and the service experience is also very good, it is very difficult for merchants to spend the cost to migrate to the decentralized e-commerce platform.

Thanks to the many DeFi parachains in the Polkadot ecosystem, we can attract traditional e-commerce users through the higher returns generated by DeFi and provide shopping channels for cryptocurrency users. The business model as shown in the figure:

![Business Model](https://github.com/blocktree/shopbring-docs/blob/master/resources/Shopbring-business-en.jpg?raw=true)

1. Consumer transfers DOT to Acala account and exchange it into L-DOT. L-DOT is an asset issued by Acala that can not only obtain DOT staking income, but also freely flow. Polkadot's staking annualized interest rate averages 14%. In terms of comparative yield, DOT < L-DOT < Staked-DOT.
1. Consumers get Acala account to mortgage L-DOT to borrow aUSD. aUSD is an anchored (1:1) USD cryptocurrency issued by Acala, so aUSD is suitable for use as a payment currency. If consumer wants to redeem L-DOT, he also need to pay a stability fee. Refer to MakerDAO's largest DAI pool for borrowing at an annual interest of 2%.
1. The consumer transfers the aUSD cross-chain of the Acala account to Shopbring.
1. The consumer issues a commissioned shopping order and uses aUSD to pay the shopping agent.
1. The shopping agent pays fiat currency to the e-commerce platform to complete the purchase of commodity.
1. E-commerce platform ships to consumers.
1. With aUSD, the shopping agent can freely participate in Dapp in the Polkadot ecosystem or sell them to the OTC market at a premium.
1. When consumer feels that the L-DOT return has reached his expect, he will buy aUSD from the OTC market.
1. Consumer returns aUSD to their Acala account to redeem L-DOT, he can cash out L-DOT or participate in other higher-yield projects.

> In this business model, consumer can earn profits, need to satisfy: L-DOT income * unit price > (stability fee interest + transaction fees + aUSD premium margin).

**Why don't consumers sell aUSD directly to the OTC market, and use fiat currency to shop on e-commerce platforms?**

There are the following reasons:

* The OTC market generally has a relatively large exchange quota, and the price difference is relatively large, so that merchants have profit margins. Shopbring can make small payments and attract shopping agents to serve consumers by earning tips.
* There may be merchants laundering money in the OTC market. Users who frequently deposit and withdraw fiat currency may be contaminated by black money and face the risk of freezing bank accounts.
* Consumers can get aUSD again after completing the commissioned shopping order in Shopbring, and increase the account credit value and get more native token rewards.

## Project Development Progress

* Shopbring's POA testnet has been deployed, and modules such as `invitation`, `generic-asset`, and `commissioned-shopping` have been implemented.
* Shopbring's off-chain order system has been deployed, providing API services such as Polkadot wallet user registration and query shopping orders.
* Shopbring web app has completed the Polkadot wallet login and the commissioned shopping function.
* Shopbring wiki [website](https://wiki.shopbring.network/) has been deployed, displaying the Shopbring system design specifications and other documents.

## Technical difficulties and solutions

### Selection of Substrate version

At the beginning, we developed based on Substrate v2.0.0 and developed smoothly under the Mac os environment. When we deployed to the Linux environment, it failed to compile successfully.

Finally, we upgraded Substrate to v2.0.1, and the compilation problem was solved.

### The problem of using ECC cryptographic algorithm in Substrate runtime

We used the `ed25519` algorithm to verify the signature when developing `pallet-invitation`. The program passed the unit test, but failed during `cargo build`.

The logic code is as follows:

```rust

use sp_core::{Pair, ed25519};

let flag = ed25519::Pair::verify_weak(&sig, &msg, &pk);

```

Failure log:

```log

error[E0432]: unresolved import `sp_core::Pair`
    |
30 | use sp_core::{Pair, ed25519};
    |               ^^^^ no `Pair` in the root

error[E0433]: failed to resolve: could not find `Pair` in `ed25519`
    |
252 |             let flag = ed25519::Pair::verify_weak(&sig, &msg, &pk);
    |                                 ^^^^ could not find `Pair` in `ed25519`

```

This is because `Pair` is only available on `std`. Finally, our solution is to use `sp_runtime::traits::Verify` to verify the signature.

### No fees for sending transactions

When we implement the `pallet-invitation`. When invitee accepts the invitation, the system verifies the invited signature. If successed, invitee can get the bonus given by the inviter, and the call does not require transaction fees.

We cannot simply set the `weight` of the function to 0 to avoid the transaction fee, because the calculation of the transaction fee also includes the byte length of the transaction.

Finally, we implement `frame_support::unsigned::ValidateUnsigned` in the pallet, which satisfies the verification of unsigned transactions, and the invitee can submit unsigned extrinsic without transaction fees.
