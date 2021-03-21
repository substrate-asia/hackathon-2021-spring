# **Dora Factory 1.0: DAO-as-a-Service Infrastructure for On-Chain Governance and Open Source Ventures**

Since the iron fist manager of Matsushiba Factory retired, the factory turned into a chaotic anarchy and production stalled. One day, Dora received a letter from Doraemon, one of his best friends, requesting help to resume productivities in the 22nd century. Dora is compassionate about future human beings and decided to restructure the Matsushiba Factory from building robots to building ventures and rename it “[**Dora Factory**](https://twitter.com/DoraFactory)”.

Dora is the curator of the great hacker community of the 21st century, how could he manage Matsushiba Factory in the 22nd century? He humbly inquired with the prophet from Phuket, who told him ventures will be organized in the form of DAOs, and he needs to build the right infrastructure for them.

Dora has already built a bunch of great tools to foster developer communities and problem-solving ventures, such as quadratic funding grants, on-chain bounties, bonding curve fundraisers, global hackathons series. Now he decides to build a unified infrastructure and let everyone, not only him, create tool kits for DAOs to plug and play, because only when he mobilizes the whole developer community’s code power of human beings, he can rebuild Matsushiba Factory when the time comes.

Building robust infrastructures and killer DApps, developer communities are crucial building blocks of every blockchain ecosystem. Yet, present-day blockchain projects often lack lasting mechanisms and effective toolkits to manage and incentivize their open source developer communities. We believe that this problem can be solved by a crypto-native solution: a programmable DAO-as-a-Service infrastructure specialized in developer community management, curation and incentivization. Dora Factory provides an infrastructure with features that allow blockchain ventures to fully realize the potential of the hacker community. Designed as a layer-2 infrastructure on Polkadot and Ethereum, Dora Factory provides solutions to all Polkadot-native, Ethereum native projects and beyond.

# **🌲 Vision Statement**

Dora Factory is an open-source, community-driven venture builder with the mission to empower hackers by creating tools for decentralized venture organizations to thrive.

Since the birth of the Open Source Movement, open-source developers and projects have been growing at an exponentially increasing speed. Now there are more than 190 million open source repositories and 40 million open source developers on GitHub alone. The development of the blockchain ecosystem adds another block to the movement — incentivization. While GitHub is managing open source code, there is no sound infrastructure to facilitate incentive schemes. Dora Factory is here to help.

We envision every open source project can become a venture, and every open source venture can become a venture DAO to create and manage schemes like funding, grants, various governance rules, bounties, and many more. On-chain incentives can be achieved via a set of decentralized fund management and incentive management protocols.

So far, every open source protocol / blockchain project needs a developer community. However, when open source movement and open source DAOs come together, we will see an explosion of open source ventures in the years to come.

The vision of Dora Factory is to build a DAO-as-a-Service infrastructure that empowers every DAO with the right toolkits to better engage with and incentivize open-source developers and hackers on their way of building the next venture.

# **✨ Highlights**

## **DAO-as-a-Service**

At Dora Factory, curators can freely launch DAOs and add different pallets in an ad-hoc manner based on their specific needs.

## **Programmable Infrastructure**

To implement new features, useful pallets can be created by developers and added to Dora Factory parachain runtime or Dora Factory Ethereum layer-2 through governance. DAOs manage functionalities by adding pallets based on their needs.

## **Powered by Developer Community**

Backed by DoraHacks Global Hackathon Series and Hackerlink Grants, Dora Factory engages global hackers, cypherpunks and open source developers.

## **Infrastructure for On-Chain Governance**

Specialized in community governance, Dora Factory prioritizes features that optimize vital daily processes in DAO management, including quadratic voting, grants, bounties, funding management, fundraising schemes, and many more.

# **⚓️ The Infrastructure**

Dora Factory consists of three parts: a Polkadot factory, an Ethereum factory, and a virtual bridge. Each DAO will have a vault in which its assets are held. DAO stakeholders will be able to deposit assets, withdrawal assets and manage assets of the DAO.

On Polkadot, DAO functionalities can be added via pallets. On Ethereum, DAOs will deploy individual governance smart contracts through the Dora Factory contracts. Dora Factory will allow developers to submit custom-developed pallets and factory contracts.

## **The Polkadot Factory**

When Polkadot fulfils its mission, assets should be able to move around easily between Polkadot parachains, a.k.a. Dora Factory DAOs will be able to manage tokens from all Polkadot parachains, therefore all Polkadot ventures can use Dora Factory to manage their DAOs.

**Dora Factory will be developed as a parachain on Polkadot for several reasons:**

- Cross-chain DAO asset management
- Shared security with Polkadot
- Ability for modular development of core service features (Pallets)

**There are a few low-level functions and components Dora Factory provides by default:**

- Create DAO
- Release DAO
- Cross-chain Asset Vaults
- Staking, Tax and Reward
- Payment
- Protocol Level Governance

Upon the basic level, there can be as many application-level pallets one can think of. These pallets can be developed by anyone or any group. Underlying the infrastructure is the Dora Factory Parachain which provides consensus to validate token transactions and powers the pallets. The parachain will first use a POA network for development purposes. It will be switched to a NPoS network prior to its official launch on Kusama network. By that time, the parachain token holders will be able to participate in the maintenance of the network: nomination and validation and get rewarded from the network.

![img](https://miro.medium.com/max/60/1*sedjJJGgvBwLmRlDn6qZNA.png?q=20)

![img](https://miro.medium.com/max/3368/1*sedjJJGgvBwLmRlDn6qZNA.png)

## **Client Frontend**

The Client Frontend will be an interface to access the on-chain DAO-as-a-Service. It will allow DAO curators to 1) create DAOs, 2) release DAOs, 3) deposit assets to cross-chain vaults, 4) withdraw funds from cross-chain vaults, 5) add pallets to perform DAO governance and DAO behaviors.

## **The Ethereum and BSC Factory**

Dora Factory will deploy sub-factories on Ethereum and Binance Smart Chain. A sub-factory will be a set of factory contract that produces smart contracts for individual DAOs. Before Polkadot is fully functional, we encourage smart contract developers to build DAO pallets on Ethereum and Binance Smart Chain for proof of concepts. The client front end will enable DAO creation on Ethereum and BSC.

## **The Dora Factory Virtual Bridge**

In the first stage of Dora Factory, DAOs will have to choose which infrastructure they want to build on — Polkadot, Ethereum or BSC depending on their relevance to these public chains.

According to the Polkadot paper, eventually, there will be bridges that connect Polkadot replay chain with major public chains like Ethereum and Bitcoin. Therefore the cross-chain problem is automatically solved. However, for our own convenience, Dora Factory will build a simplified virtual bridge to bring tokens outside the polkadot ecosystem into the Dora Factory parachain so that DAOs can store token assets in the cross-chain vaults.

![img](https://miro.medium.com/max/60/1*KF5ASCFp01vSbqUg00Fb8A.png?q=20)

![img](https://miro.medium.com/max/5292/1*KF5ASCFp01vSbqUg00Fb8A.png)

# **🔧 Use Cases**

Specific features (use cases) can be added to the blockchain runtime as pallets or produced by factory contracts. DAOs can apply Pallets based on their needs.

There are infinite possibilities of pallets that can be developed. And because of that, unlike other general DAO infrastructures, Dora Factory will allow developers to create pallets for the network and get rewarded. In the first place we can imagine the following pallets that every DAO can choose to use:

## **Voting Pallets**

- simple majority voting
- direct democracy
- representative democracy
- liquid democracy
- quadratic voting
- futarchy

## **Fundraise Pallets**

- quadratic funding
- bonding curve fundraiser
- dutch auction
- direct donation

## **Incentive Protocol Pallets**

- bounty
- open source curation markets
- tipping

## **Dispute Resolution Pallets**

- arbitration
- court

## **Admin Tool Pallets**

- Member management
- Profile management
- Asset visualization tools

# **📚 Example DAOs**

Any organization or groups that need on-chain governance can use this network. Some of them are really cool in the future.

- A fund to support open source quantum computing library developments
- A public chain’s developer community
- A Defi project’s governance body
- Any open source project’s contributor DAO
- A DAO capital to invest in multiple blockchain projects
- A multinational corporation that embraces DAO to manage part of its team
- Hobbyist developer groups to explore new ideas
- Hackathon & event organizers to manage funds
- An association of crypto artists
- A decentralized media directly funded by viewers

# **💰 Token Economics: DORA**

Dora Factory is governed by DORA holders. DORA is the utility token that binds the network together. Users and holders of DORA can stake, mine and pay DORA tokens. Developers who build will be rewarded with DORA tokens. The initial total supply of DORA is 10,000,000.

## **DAO Staking**

Every DAO is created by staking 100 DORA tokens on-chain. When the DAO is terminated, staked DORA tokens will be released. Later, when the number of DAOs grows and the value of DORA changes, a fixed staking price might be necessary when a DAO is created. This can be achieved by implementing a price oracle with an off-chain worker, or simply using an existing oracle service provided by some other parachain.

## **Validator Staking, Mining and Inflation**

Dora Factory will first be a POA network, and transfer into an NPoS network when deployed on Kusama. Validators and nominators maintain the parachain by verifying transactions and producing blocks. As a result of that, validators and nominators are rewarded with tokens from inflation. Besides inflation, transaction fees will be distributed to validators and nominators, network fees (tax) collected from users and DAOs will be paid proportionally across all addresses that staked DORAs.

The inflation is 1,000,000 DORAs per year until a super majority of the community votes otherwise. Therefore, unlike Polkadot itself, this is a linear inflation starting from 10% in the first year. Inflation rate is decreasing every year. Among the tokens generated from inflation every year, 2% will go to a Dora Factory Treasury, the rest of DORAs generated from inflation will be distributed to the nominators and validators.

## **Network Fees (Tax)**

Pallets can charge fees. DAOs will have to “burn” DORA tokens (or pay fees) to use pallets (there can be free pallets!). Network Fees paid by DAOs are taxed by Dora Factory. The tax will be proportionally distributed to all staking addresses.

## **Network Rewards**

The network rewards validators, pallet developers and venture builders. Validators are rewarded from inflation as well as tax collected from DAOs. Non-validator DORA stakers are rewarded by network tax. Developers are rewarded by pallet income.

## **Transaction Fees**

A small transaction fee will be imposed on all transactions on the parachain. The Transaction fees collected will be distributed to nominators and validators.

![img](https://miro.medium.com/max/60/1*u3JIgGEpHigesO8P8zmeLw.png?q=20)

![img](https://miro.medium.com/max/3368/1*u3JIgGEpHigesO8P8zmeLw.png)

# **🏡 Governance**

Unlike Internet SaaS platforms, Dora Factory is governed by the community of DORA holders instead of a company.

There are two governance bodies. The Governance DAO and the Council. The governance DAO is a DAO of all DORA holders. The council is the core development team that is responsible for the project’s roadmap until sudo is removed.

The Governance DAO is a DAO produced by Dora Factory. After Dora Factory’s mainnet launch, the governance DAO will be presented on Dora Factory’s client frontend. All DORA holders are members of the DAO, and all staking addresses can vote on issues (we call them “DORA Voters”). There are several situations where governance comes into play.

## **Approve Major Parachain Mainnet Upgrade**

Any major upgrade of the parachain **mainnet** (parachain consensus, governance rules, mining & staking rules) needs a ⅔ majority vote from DORA Voters.

## **Approve Community Grants**

There will be ongoing quadratic funding grant rounds to support new ideas to improve the infrastructure and creating new pallets on Dora Factory. Community can donate to projects they deem important with DORA and a matching fund will be distributed to the projects based on the quadratic funding scheme. The community grant will be hosted on HackerLink.

Every community quadratic funding grant needs to be approved by a simple majority vote from DORA Voters.

In addition to the governance DAO, Dora Factory has a **Council**, which is responsible for implementing the roadmap and executing key operations.

**The Council** also has power to make minor changes and upgrades to the infrastructure, and add pallets based on the procedure of adding pallets.

## **Adding Pallets**

Pallets can be developed either by Dora Factory developers or any community developer (group) from any place. Mobilizing the developer community to invent DAO pallets is critical to Dora Factory. On Polkadot, pallets can be developed and tested freely on local substrate nodes. When a pallet is added to the parachain, its security must be ensured.

A pallet (either developed by Dora Factory core dev team, or by community developers) needs to go through a thorough testing and a security audit before it can be submitted to the Dora Factory testnet. The pallet will reside on the testnet for a certain period of time before it can be compiled into Dora Factory’s Polkadot Parachain. This process is facilitated by the council.

## **Open Grants**

The council also controls an open grant which supports new ideas, schemes and algorithms of on-chain governance, essential DAO pallets, important toolkits. In order to make a decision to issue an open grant, a simple majority must be reached among the councillors.

## **Bounty**

There will be certain features and improvements proposed by users or core developers. An open bounty program will be hosted on HackerLink. Both core DORAs and community projects can issue a bounty. Every bounty is linked to a GitHub issue so that workflows can be managed on GitHub. Many types of cryptos can be used for bounty payments.

Smaller features and improvements that are not within the scope of open grants might be posted as bounties.

## **Sudo and Election**

The councillors will be appointed by Matsushiba Foundation until Sudo is removed. When Sudo is removed, councillors will be elected by DORA Voters. The rules of election will be then hard coded into a governance pallet and be added to the Governance DAO. At that time, Dora Factory will enter DAO governance.

# **🚗 Polkadot Factory Roadmap**

🔽 Migrate key pallets to substrate

🔽 HackerLink Integration — Bounty & Grant

🔽 Run quadratic funding grants on Kusama

🔽 Launch POA parachain network on Rococo and Kusama

🔽 Release Independent Client Frontend for DAO-as-a-Service

🔽 Start DAO-as-a-Service for Kusama DAOs

🔽 Upgrade network consensus to NPoS on Kusama

🔽 Deploy Parachain Mainnet on Polkadot

🔽 Start DAO-as-a-Service for Polkadot DAOs

🔽 Enable cross-chain vaults

🔽 Remove Sudo