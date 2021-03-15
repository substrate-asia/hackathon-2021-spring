# Polkadot Hackathon -- Deeper Network project report

## Background

Deeper Network is committed to building a truly decentralized Internet and security gateway. It aims to bring a better Internet experience for every family and become the gateway for users to Web 3.0 applications. Deeper's vision is to combine network security, network sharing and blockchain technology to create a safer, freer, and faster decentralized network.

## Architecture

The structure of our blockchain Deeper Chain is divided into two layers. The upper layer is the blockchain layer, which is composed of validator nodes developed on the basis of Substrate, and the number is around hundreds. The bottom layer is called Deeper layer, similar to Layer 2 in other blockchain projects, but the design is not exactly the same. In our design, the upper and lower layers are closely related. The lower nodes are composed of Deeper Connect devices (also called light nodes), and both software and hardware are independently developed by us. The device can provide users with a safe home network environment. The number of light nodes can reach millions. There are already tens of thousands of units bought by our customers all over the world.

The light nodes of the Deeper layer discover peer IP addresses and establish connections through the blockchain layer; light nodes can earn DPR tokens and accumulate credits by sharing traffic; when the credits of light nodes accumulate to above certain threshold, the device can participate in consensus by staking its credit points and get the corresponding block rewards. In our consensus design, this part is called Proof of Credit (PoC). We have adopted the mixture of PoC and PoS to ensure the security of the network under the condition that the number of early nodes is small, and also allow users that don't have our devices and softwares to participate the staking. 

In the future, users can use Deeper Connect as the gateway to easily access various decentralized applications (DApp) and interact with other blockchain applications.

For detailed information, please refer to our [whitepaper](https://deeper.network/whitepaper_en.pdf)

## Progress



In terms of products, Deeper Connect has iterated several versions and is a mature product combining software and hardware. The core component is the network operating system, AtomOS, which is independently researched and developed by us. It can achieve a network speed of 1GB running inside low cost hardwares. It also provides the function of a 7-layer enterprise level firewall. A total of tens of thousands of nodes have been deployed around the world. A large part of them are users who need network security, privacy, and network acceleration.

In terms of blockchain, our testnet has been developed. It is divided into two parts: on-chain development and off-chain interaction. On-chain development includes the development of blockchain pallets, such as micropayments, node discovery, and PoC pallets. Off-chain interaction is the integration of blockchain-related functions into Deeper Connect, which includes micropayments between the device; the interactions between the devices and the blockchain: including node discovery, credit score delegation, and PoC mining. Users can use the wallet, PoC mining and other functions through the management page of the device, and check account information and different types of transaction records. We automate the entire process to minimize user difficulties. What the user must do is just backup the private key and refill the account if balance is low. Other processes can be automated.

Before the hackathon, most of functions on the chain were completed. Therefore, during the hackathon, we mainly developed off-chain parts, including the interaction between devices and the interaction between devices and the blockchain. During our testing process, certain modifications and additions were made to the code of the blockchain. details as follows:

1. (On-chain) Optimization of the code: including bug fixes and parameter adjustments.
1. (Off-chain) Based on polkadot-js api, various utility functions have been added, including node discovery, micropayment, PoC mining, etc.
1. (Off-chain) Automate the interactions and workflows: including device IP discovery through blockchain, micropayments workflow, tunnel managements, user PoC mining using automatic or manual delegation mode, error handling in different situations etc.

During our hackathon, the main difficulty we encountered was how to handle different situations correctly without affecting the device working properly. For example, when the wallet is not generated/bind; when devices don't get reply from the blockchain or the blockchain responds too slow; when the balance on the user account is insufficient, etc., under all these conditions, the blockchain related functions cannot work normally. Also, when these problems are resolved, we need to perform those functions again. In the process of micropayment, we also need to consider the various situations of users at both ends of the connection, such as when the client side doesn't pay on time. Hence, robust testing plays a crucial part. Through continuous testing, we can find the issues that has not been considered before. Generally speaking, we need to have a good understanding the process of asynchrony.


