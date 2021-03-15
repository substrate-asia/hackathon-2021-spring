## Background

Deeper Network is committed to building a truly decentralized Internet and security gateway. It aims to bring a better Internet experience for every family and become the gateway for users to Web 3.0 applications. Deeper's vision is to combine network security, network sharing and blockchain technology to create a safer, freer, and faster decentralized network.

## Architecture

The structure of our blockchain Deeper Chain is divided into two layers. The upper layer is the blockchain layer, which is composed of validator nodes developed on the basis of Substrate, and the number is around hundreds. The bottom layer is called Deeper layer, similar to Layer 2 in other blockchain projects, but the design is not exactly the same. In our design, the upper and lower layers are closely related. The lower nodes are composed of Deeper Connect devices (also called light nodes), and both software and hardware are independently developed by us. The device can provide users with a safe home network environment. The number of light nodes can reach millions. There are already tens of thousands of units bought by our customers all over the world.

The light nodes of the Deeper layer discover peer IP addresses and establish connections through the blockchain layer; light nodes can earn DPR tokens and accumulate credits by sharing traffic; when the credits of light nodes accumulate to above certain threshold, the device can participate in consensus by staking its credit points and get the corresponding block rewards. In our consensus design, this part is called Proof of Credit (PoC). We have adopted the mixture of PoC and PoS to ensure the security of the network under the condition that the number of early nodes is small, and also allow users that don't have our devices and softwares to participate the staking. 

In the future, users can use Deeper Connect as the gateway to easily access various decentralized applications (DApp) and interact with other blockchain applications.

For detailed information, please refer to our [whitepaper](https://deeper.network/whitepaper_en.pdf)


## Code

`src/deeper-chain` contains the blockchain codebase. `src/control-plaine` is the client side codebase, which depends on `src/common-js`.

Please use the following link to download our software for test run:

[https://pan.baidu.com/s/1UBdXklPjyX3D9P5Cdq1LmA](https://pan.baidu.com/s/1UBdXklPjyX3D9P5Cdq1LmA)

password: ita1
