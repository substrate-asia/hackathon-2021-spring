
## Project website : www.seee.io
------------


# 1、简单介绍团队和这个项目。

答：我们团队6个人，

李强架构，有国网区块链项目背景，

吴威是资深C/C++开发，也在学习Rust/substrate，

梁文柱是SubStrate优秀学员，兼资深前端开发，

陈一飞：substrate开发 目前北航研一 ，有一定以太坊的经验，

舒凡诚 ：后端 目前北航大四保研

王晓轩： 资深以太坊开发，熟悉国网区块链架构，正在学习rust/substrat

# 2、参赛项目名称和所属参赛类别是？ 

答： 我们的参赛项目是 SEEE（Substrate Energy Enterprise Edition）能源企业联盟链，黑客松具体项目是SEEE 高通量上链服务，实现可横向扩展的联盟链高速上链服务

参赛类别是： 类别2：构建联盟链

# 3、请描述项目要解决的问题。

答：参加黑客松具体项目是SEEE 高通量上链服务，实现可横向扩展的substrate联盟链高速上链服务

# 4、描述项目解决方案，大概架构。

答：SEEE 高通量上链服务，实现可横向扩展的联盟链高速上链服务， 利用Merkle Tree等高效数据结构来实现批量数据的聚合，通过Root Hash上链实现一次锚定自定义的批量数据上链

架构上，

海量数据通过多租户、多优先级、支持functions轻量级计算处理的分布式先进MQ消息队列进行预处理与分级持久化

通过分布式的去中心化结构数据库对Schema、MT Path、Data Proof、元数据进行持久化，也可以对源数据进行可选保存

可选：通过分布式的无共享对象存储对文件等元数据进行加密保存

实现海量结构化、非结构化数据上链，验证云服务、并将来逐步实现用户自定义Schema等一站式低代码上链….

# 5、有什么行业应用场景用到你的方案。

答： 能源行业物联网、计量、大数据等海量数据上链场景

The 5 questions are:
# 1. Briefly introduce yourself/team and this project.
Answer: There are 6 people in our team,

Li Qiang is a software architect with a background in the State Grid blockchain project.
Wu Wei is a senior C/C++ developer and he is also learning Rust/substrate.
Liang Wenzhu is an outstanding student of SubStrate and a senior front-end developer.
Chen Yifei: Substrate development At present, Beihang Research Institute has some experience in Ethereum.
Fancheng Shu: Back-end
Wang Xiaoxuan: Senior Ethereum development, familiar with State Grid's blockchain architecture, learning rust/substrat
# 2. What is the name of your entry project and its category? (You can refer to the Answer: Substrate Hackathon entry category we provide to choose the project and category you want to do.)
Answer: Our participating project is the SEEE (Substrate Energy Enterprise Edition) energy enterprise alliance chain, and the specific project of the hackathon is SEEE high-throughput on-chain service, realizing horizontally scalable alliance chain high-speed on-chain service
The entry categories are: Category 2: Building an alliance chain


# 3. Please describe the problem to be solved by your project.
Answer: The specific project of the hackathon is SEEE high-throughput on-chain service, realizing horizontally scalable substrate consortium chain high-speed on-chain service

# 4. Describe your project solution and approximate structure.
Answer: SEEE high-throughput on-chain service, realizes horizontally scalable alliance chain high-speed on-chain service, uses efficient data structures such as Merkle Tree to realize the aggregation of batch data, and realizes one-time anchoring of customized batch data on the chain through Root Hash.
Architecturally,

Massive data is pre-processed and persisted through the distributed advanced MQ message queue with multi-tenant, multi-priority, and lightweight computing support for functions
Schema, MT Path, Data Proof, and metadata are persisted through a distributed decentralized structured database, and the source data can also be optionally saved
Optional: encrypt and save metadata such as files through distributed no shared object storage
Realize massive structured and unstructured data on-chain, verify cloud services, and gradually implement user-defined Schema and other one-stop low-code on-chain...
# 5. What industry application scenarios use your solution.
Answer: Scenarios of massive data on-chain such as the Internet of Things, metering, and big data in the energy industry
