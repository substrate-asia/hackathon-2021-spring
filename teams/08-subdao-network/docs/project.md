
# overview
Refer to SubDAO_Deck_en.pdf or SubDAO-Deck-中文.pdf

# Solution and Technical design 
Refer to [article] 

# Progress of the project
* Completion of  main core code (master chain building and contract integration) 
* Complete project presentation documents, and related technical documents
* Complete integration with Polkadot JS Extention
* Build the chain browser and deploy it online.
* Complete the visibility Front-end,demo is completed.

# Ecosystem Fits
In the area of Decentralized Autonomous Organizations, there are many mature DAOs maintained in different ways with different tools or platforms, such as Maker, The DAO, and The LAO. Also, there are some other tools to help governors building a DAO, such as Aragon. Aragon is a project providing tools to create and the governor a DAO, but only available on Ethereum.
SubDAO is quite different and evolved from other DAO related projects. The goal of SubDAO is to create a (1) cross-chain platform providing (2) general and customized functionalities to govern a DAO (3) connecting to DApp with the ability to (4) access off-chain external data.

# Community Engagement
SubDAO's future community engagement strategies include:
Publish more articles on Medium and other leading media channels to expose our project.
Launch an Ecosystem Development Lead Program to recruit and get more contributors involved in our project.
Join Polkadot related on-line and off-line events in the Polkadot community to expose our project.
Bounty Program for General Community to attract more people into our project.
DApp Hackathon to get more DAOs and developers.

# Technical difficulties encountered in the project and Solutions
All smart contracts mentioned above will be implemented with Ink!. At the first we designed the smart contract that use solidity to implement the functions, then transform the solidity to WebAssembly. But we met a lot of problems, with the help from parity. We changed our design, to implement the smart contract fully powered by Ink!. But there were some critical issues blocked our coding. 
After the parity fixed the critical issues and merged the pull requests. We finally able to move forward.
the SubDAO Node includes an OCW(Off-chain Worker) pallet that interacts with external HTTP service (Github Http Wrapper). Since the OCW pallet is a general component, most of the processing work of external data is moved out of OCW to decrease the complexity of implementation and give the ability to the DAO governors who wanna use specific data sources for their DAO. The external HTTP service (Github Http Wrapper) will fetch the data such as contributions for a user in a project or repository from Github.com and feed the OCW pallet in the SubDAO Node.


