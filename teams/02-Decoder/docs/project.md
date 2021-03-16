## 1. Project Introduction

Sublend is a lending contract, based on the Substrate ink! implementation, that can be deployed to all parachains which support WASM contracts. It improves reserve fund utilization by providing a credit-delegated loan, distinct from the over-collateralized lending model, similar to a combination of credit card and matching vice card, while providing a fixed rate loan to meet the need for predictable financial expenses for some traditional financial institutions. It can effectively solve the problem of reserve liquidity and unpredictability of financial expenses in DeFi lending agreement.

Application scenarios ：
* fixed-rate loans from traditional financial institutions;
* donations from project supporters in DAOs,etc.

We have used the Redspot WASM Contract Development Kit from Patract to implement the lending contract and will make it available on the Patract Store.

### 1.1 Project Background

According to DeFi Pulse, the total value of assets locked in DeFi is now over $43.7 billion. In order to secure a decentralized system, DeFi lending agreements typically require overcollateralization. This, like traditional finance, has the disadvantage of being capital inefficient.

## 1.2 Project Highlights

* Addresses the illiquidity of reserves and unpredictability of financial expenses in existing DeFi lending agreements；
* Provide a set of un-collateralized lending smart contracts for the Polkadot ecosystem that can be used by parachains；
* Use NFT as collaterall;

## 2. Project design

The project adopts a pool model design, offering both collateralized lending and un-collateralized lending.
* For collateralized lending, users need to first deposit the crypto assets they own as collateral in the corresponding pool, and then lend other crypto assets they need from the pool. Crypto assets also support NFTs as collateral, increasing liquidity in the NFT market.
* For un-collateralized lending, users can borrow from a corresponding pool without collateralizing assets and simply obtain a line of credit authorized by other users, can also be called credit-delegated lending.

### 2.1 Architecture

![architecture](https://raw.githubusercontent.com/lesterli/Sublend/main/Architecture.png?token=ABFRESVBA3SVCLF4JKXBBA3AJ33UC)

### 2.2 Project Modules

* User action pages developed using React JS, supporting operations such as deposits, withdrawals, credit  borrowing and repayment.

* Use WASM smart contracts developed by Redspot to enable user lending and borrowing operations, as well as interest rate adjustments.

* Deploy deployment scripts for parachains which support smart contracts such as the Patract test network.

### 2.3 Technical Difficulties and Solutions

some numerical calculation problems in the Ink contract development, ,The problem of getting off-chain prices by interacting between contracts and Runtime, integrating the ocw of the parachain which supports smart contracts in the polkadot.

Check the documentation, refer to the official examples, use the WASM contract development tool provided by Patract to make development as efficient as possible, and deploy to the smart contract testing network it provides to facilitate testing.

## 3. Completed parts of the project

* Implemented an ERC20 smart contract that can be used to instantiate **sToken** and **debtToken**, representing user deposits/credit limits and borrowing limits, respectively.
* Implemented the **LendingPool** smart contract that allows users to deposit collateral and authorize their deposits/credits to others, as well as withdraw their collateral.
* At the same time **LendingPool** supports users to lend money by means of credit delegate and to return their borrowed money.
* The current support pools are: DOT.