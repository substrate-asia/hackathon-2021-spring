# 项目背景/原由/要解决的问题

随着 Ethereum 的发展，智能合约能力的增强，越来越多的开发者参与到开源社区的建设中，也越来越多的开发者基于智能合约来实现心中的理想。自从 Ethereum 主网上线以来，短短几年时间，DApp（去中心化应用）迅速发展，日渐繁荣，截止 2020 年 12 月 1 日，Ethereum 上总共有 14161 份智能合约，总计有 5714 个 DApp，单日 DApp 中交易金额达到 12 亿美元。

一直以来运行 Ethereum 节点是一份颇费精力和金钱的工作。最初绝大多数节点都能够对社区提供公开的服务，现在占据 Ethereum 节点中大部分的节点都是运行者们为了服务自己的特定业务而搭建。由于公开运营和维护成本的限制，加之缺少节点服务运行者们寻找对应社区开发者用户的生态机制，越来越少的节点运行者们愿意将节点服务公开。对于仅仅是想进行 DApp 开发的普通开发者运行一个 Ethereum 节点又是不可承受的压力，寻找一个稳定可用的 Ethereum 节点服务（接入点）成为一件越来越困难的事情。

于是在 Ethereum 生态中逐渐产生了少数几个能够提供 Ethereum 节点服务的商业公司，例如 infura.io，世界上最大的 Ethereum 节点服务提供商。一直以来 Infura 由 Consensys 资助，为 Ethereum 生态里数以万计的开发者们提供基础的节点服务。开发者们在自己的代码中调用着 Infura 提供的 Ethereum API 服务，使得开发者们开发出来的应用可以通过这些 API 服务访问 Ethereum 网络中的的一切。众多的开源社区应用和公司产品强烈依赖于 Infura 所提供的 Ethereum 节点服务，其中不乏区块链领域中的头部企业。

2020 年 11 月 11 日，Ethereum 节点服务提供商 Infura 的服务因故障导致不可访问，各种形形色色的应用、各种大大小小的交易所、各种功能各异的服务都出现了严重事故，成为区块链历史上影响最为广泛的事件之一。这对于以去中心化为基石的区块链世界而言看起来就是个充满矛盾的笑话。

我们 Apron Labs 的成员一直以来在 Ethereum 生态中开发 DApp，并且亲身经历了这一次重大事故。我们反思是时候对 Web 3.0 世界里这种严重依赖中心化服务的现状作出改变，并且决定开始创建去中心化基础设施服务网络来改变现状。

为解决 Web 3.0 世界中的基础设施服务发现、调用和计费中存在的问题，Apron Labs 提出 Apron Network 作为完善 Web 3.0 世界基础设施服务生态的解决方案，在 Web 3.0 时代让广大开发者们自由的提供和使用任何基础设施服务成为可能，将真实世界同 Web 3.0 世界链接起来，把自由还给每一个人！

# 项目技术设计

Apron Network 基于 Substrate 框架实现，并且可以成为 Kusama / Polkadot 的平行链。在 Apron Network 中运行的各节点分为 Apron Pillar Node 和 Apron Node 两种类型，在可以运行的节点之上，由 Apron DAO 对 Apron Network 进行治理。整个 Apron Network 将由 Apron Pillar Node、Apron Node、Apron Service Marketplace 和 Apron SDK 等组件构成。

![image](./image1.png)

参与网络建设的角色分为 Provider （服务提供者）、Miner （节点矿工）、Delegator （委托人）、Arbitrator （仲裁者）、Inspector （视察员）、Consumer （使用者）、Developer （服务使用开发者）和 Counselor （服务顾问）。所有网络建设的角色通过 Apron DAO 协作，确保整个 Apron Network 的稳定持续运转。

- Apron Pillar Node

Apron Pillar Node 采用 Substrate 框架开发，为 Apron Network 提供安全保证，确保网络的稳定运行，是构成 Apron Network 的基础网络节点。Apron Pillar Node 最初将由 Apron Labs 启动，后续将由社区里的参与者们来运行。

- Apron Node
Apron Node 是 Apron Network 的构成节点，使用 Substrate 框架进行开发，同时开启有 OCW 特性。基础服务提供者通过 Apron Node 实现服务公开提供，Apron Node 将该基础服务同步上链，并通过 OCW 模块实现服务使用情况和计费信息的链上同步。

任何一个基础设施服务提供者均可通过 Apron Node 来向公众提供其基础设施服务。无论是区块链接点运行者，还是传统互联网及其他领域信息技术服务的提供者，只需要将 Apron Node 部署在能够连通互联网并可以访问自己的基础设施服务的任何网络中就能将已有的基础设施服务向公众提供，在配置中添加相应的服务信息就能让公众发现并使用该基础设施服务，并获得服务使用费。所有曾经的或是将来的能够提供基础设施服务的个人、团队或公司都可以成为 Apron Network 参与者，都将能够通过运行 Apron Node 来为 Apron Network 和 Web 3.0 世界提供基础设施服务并获得相应收益。

- Apron Service Marketplace

Apron Service Marketplace 将基础设施服务者所提供的服务同 DApp 开发者们的需求进行撮合匹配。基础设施服务提供者通过一键部署 Apron Node 来实现基础设施服务的上链，Apron Node 将会通过 OCW 将基础设施服务提供到 Apron Market 智能合约中并将基础设施服务使用数据同步到智能合约中，由 Apron Market 智能合约对服务使用进行计费。

Apron Market 智能合约将通过 OCW 提供的数据来计算基础设施服务者获得的收益，并扣除服务使用者应当支付的使用费用。Apron Market 不仅仅是智能合约，亦是一个基于 Web 的服务发现平台。服务使用者可以在 Apron Market 上寻找其想要使用的基础设施服务，也可以通过 Apron Market 来发布其所需的基础设施需求，从来实现需求和供给之间的匹配。

- Apron SDK

Apron Network 中的服务除了可以直接无缝迁移的方式从原有的基础设施服务使用方式迁移到 Apron Network 上之外，还提供了 Apron SDK 来实现应用到 Apron Node 之间的链接动态平衡和通信数据加密。应用开发者仅仅需要在应用中集成 Apron SDK 便可以快速实现应用网络访问的动态平衡和通信数据加密，不仅能够在 Web 上使用还能够在 PC 端、移动端采用原生方式进行集成。

- Roles

Provider（服务提供者） 是基础设施服务的提供者，将其具有的能力通过 Apron Node 提供给广大开发者和用户，是 Apron Network 的关键参与者之一。任何能够提供服务的人或者组织均可以在 Apron Network 中成为 Provider 。

Miner（节点矿工）是 Apron Network 网络的重要维护者，运行 Apron Node 来确保 Provider 提供的服务能够被使用，同时通过维护网络来获得奖励，是 Apron Network 的关键参与者之一。

Delegator（委托人）并不直接参与网络建设，而是通过向 Miner 、 Provider 等等其他角色提供 Token 进行质押，协助 Provider 和 Miner 来参与网络建设，并从中获取收益。

Arbitrator（仲裁者） 将在去中心化仲裁法庭中对网络中的出现的冲突或仲裁申请进行仲裁，是 DAO 和去中心化仲裁法庭的重要组成部分。 

Inspector（视察员）在网络中巡视网络上已注册服务的运行情况，同时对已注册服务进行巡检，一旦发现服务出现问题或者作恶，Inspector 将向 Arbitrator 提供信息并发起仲裁申请。当遇到其他人发起仲裁申请时，Inspector 将向 Arbitrator 提供相应信息以便 Arbitrator 对仲裁案进行判断。

Developer（服务使用开发者）基于 Apron Network 中存在的基础设施服务来开发应用，向服务提供者支付服务使用费，是 Apron Network 的关键参与者之一。

Counselor（服务顾问）协助 Provider 在 Apron Network 上注册基础设施服务，对服务状态进行检查，并发起请求将 Provider 所提供的服务列到 Apron Service Marketplace 中。Counselor 也将根据统计数据信息对 Apron Service Marketplace 中的服务进行评分和排行，为开发者们挑选基础设施服务提供参考依据。

Consumer（使用者）是服务的使用者。

- Apron DAO

Apron DAO 是 Apron Network 的治理组织。Apron DAO 中的成员将有 Apron Network 社区中的参与者来组成，不仅包括 Apron Labs 的成员、社区开发者、社区贡献者，也包含应用开发者、用户和 Apron Network 资产持有者。Apron DAO 中将对 Apron Network 的未来发展计划、Apron Network 功能开发进展、Apron Pillar Node 升级、社区推广方案等进行决策，同时在 Apron DAO 中存在一个去中心化仲裁法院，可以对 Apron Network 中各方之间出现的问题进行仲裁，维护 Apron Network 的稳定发展。Apron Network 中的创始节点将由 Apron Labs 来运营维护，后续将通过社区治理的方式把运营维护交付给社区。

- Scenarios

建立在 Apron Network 上的去中心化基础设施服务市场由三方参与，基础设施服务提供者、DApp 开发者和 Apron Network 建设者。基础设施服务提供者拥有基础设施服务能力，需要将其拥有的能力输送到市场中供服务需求方来使用。DApp 开发者是应用开发者，在当下和未来，应用的开发均需要依赖于基础设施服务，而 DApp 开发者本身不具备开发相应基础设施服务能力或者资金，因此 DApp 开发者需要寻找其所需的基础设施服务。Apron Network 建设者主要是指 Apron Node 的运营者。在 Apron Network 中，基础设施服务提供者和 Apron Network 建设者的身份可以重叠。

![image](./image2.png)

去中心化基础设施服务市场由两个主要部分组成，市场智能合约和市场前端。市场智能合约是智能合约，是市场的核心，处理基础设施服务上链、发现、调用和计费等等需求。市场前端则是在互联网上提供市场信息展示、查询、开发者信息维护等辅助功能。

- Service Registration

基础设施服务提供者在连接 Apron Node 后可以将其所能提供的服务信息，包括调用方式、访问地址、费用说明、权限等等信息，通过 Apron Node 注册到 Apron Service Marketplace。通过 Apron Service Marketplace 记录所有同服务相关的信息，并通过前端页面将服务信息展示给所有的开发者和用户。任何基础设施服务调用的信息将通过 Apron Node 上到链上。

- Service Discovery

在市场中如何发现服务对于服务提供者和服务需求者而言都至关重要。在 Apron Service Marketplace 中，所有基础设施服务都将通过前端页面展示给服务使用者。服务需求者也可以在市场中检索对应的服务或者发布对于服务需求悬赏来寻找能够提供服务的服务提供者。

![image](./image3.png)

Apron Network 将通过引入 Inspector 的角色来对所有市场中的基础设施服务进行状态的检索和检查，向 Apron Network 中的使用者提供相关的服务信息，并供 Apron SDK 中的动态平衡功能参考。

- Service Calling

应用开发者将应用开发出来后，用户在使用应用时均通过 Apron Node 来调用应用中所使用到的服务。

![image](./image4.png)

如图所示，所有应用均通过 Apron Node 调用服务提供者所提供的服务。 Apron Node 提供的服务调用方式既有 JSON RPC ，也有 RESTFull API 和 GraphQL方式。开发者可以依据使用场景来选择合适的服务调用方式。


- Service Billing

每一次服务调用均被 Apron Node 记录，到达固定的周期时，Apron Node 会通过 OCW （Off-chain Worker）特性将服务调用信息聚合后同步到链上。 Apron Service Marketplace 上有服务的定价信息，服务的使用费用将依据定价信息、服务调用次数和服务调用者信息进行计算。开发者将基于计费信息向服务提供者支付使用费，一旦开发者发现服务出现问题或计费信息作假，开发者可以向 DAO 的去中心仲裁法院提起仲裁申请，要求服务提供者赔偿由此造成的损失。

- Service Ranking

在 Apron Service Marketplace 里引入排行规则，通过 Inspector 和 Couselor 从多个维度来自动对服务进行评价。当前被调用次数是最重要的衡量标准，如果当前服务节点被调用次数过少或过多都将影响其权重，当调用次数过多时，系统会减少其展示次数，降低展示排名，我们希望每个服务节点都保持合理的调用次数。当服务出现不可用时，将服务排除在排行榜之外。排行榜仅是作为给 DApp 开发者推荐基础设施服务的一种方式，方便 DApp 开发者在市场中快速发现所需的基础设施服务，不会因此而下架、封禁任何基础设施服务。

- Service Penalty Policy

Inspector 对网络中的服务进行巡检，在发现基础设施服务提供者存在作恶行为或基础设施服务用户存在恶意行为时，将自动提请惩罚措施到 DAO 中，由 DAO 中的成员对行为进行判别并予以实施惩罚措施。Inspector 提起的惩罚仲裁如果被去中心化仲裁法院判定为成立，Inspector 将可以获得罚金中的一部分作为奖励。当基础设施服务提供者发现有用户恶意使用服务时可以提请 DAO 对行为作出判断。当服务使用者发现服务存在问题时亦可以向 DAO 提起申诉。

# 项目现在做到的程度

之前在进行项目方案调研和试验，在黑客松开始前后进行 POC 版本开发，目前已经基于POC版本发布 Heco 和 BSC 节点 RPC 服务测试版本，并在社区进行测试；

1. 完成 Apron Network Beta 1.0 版本发布
2. 提供 Heco节点主网和测试网服务
3. 提供 BSC 节点服务
4. 发布 Apron Marketplace

# 项目遇到的技术难点 及 解决方案
#### 如何解决计费问题

通过区块链网络来解决积分问题很难，因为无法知道开发者使用 API 的情况。在经过长时间的调研后，我们认为，关键点在于提供 API 服务的组件。于是我们决定要构建我们自己的 gateway，用来集成到区块链节点中。我们如是就这么做了。



#### Pallet vs Contract

Pallet 在 Substrate 技术栈中很出名。而智能合约是我们刚开始接触区块链开发时第一眼看到的。Pallet 设计很棒，同时也很容易使用。为了实现我们的目标，我们不知道如何选择。于是我们又投入了大量时间来学习两种技术。最后我们决定使用 Contract，因为 Pallet 可以很好的用来自定义和升级链，但是 Contract 更好的为第三方开发者提供了使用的自由。



#### 如何选择智能合约方案

在最初决定使用智能合约时，我们不知道该怎么选，是使用 Solidity 还是使用 ink!。 于是我们又在这个问题上浪费了3周时间来进行调研。我们尝试了 Frontier、Solang 来支持 Solidity。大多数情况下两个方案都可以，但是有些关键的功能并不能实现。于是我们又迁移到 ink！的方案。我们重新将项目采用 ink! 做了实现，好在代码量很少。