# Web3Games Project Report



## Background

Web3Games is a new generation game development ecosystem based on Substrate. We provide various solutions for the web3games ecosystem, from development frameworks and tools targeting the game developers to parachains designed for the ecosystem.

## Project Design and Technical Structure

![Technical Structure](http://qpjf9b6ys.hn-bkt.clouddn.com/%E6%8A%80%E6%9C%AF%E6%9E%B6%E6%9E%84.png)

Project Introduction Website

https://web3games.blockspaper.com/en/ 


## Project Progress

### General

Project is developed in less than 35 days by a group of part-time developers.
Til now, we've developed the MVP framework to show how games can be integrated with blockchain.

Please check our demo for what we have completed.



YOUTUBE https://www.youtube.com/watch?v=3PIXF1Sa5L0



OR Google drive  https://drive.google.com/file/d/167bwKm7SyP95FR5SMhNZGQ-R5Tv39NTZ/view?usp=sharing



<img src="http://qpjf9b6ys.hn-bkt.clouddn.com/11.png"/>



### Specific

#### 1-Complete our parachain SGC and release the testnet on Polkadot JS App

https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fsubstrate.org.cn%3A4443#/explorer



<img src="http://qpjf9b6ys.hn-bkt.clouddn.com/1.png"/>



#### 2-Build SubGas Website

http://sdk.substrate.org.cn/



<img src="http://qpjf9b6ys.hn-bkt.clouddn.com/2.png"/>



#### 3-Build SGC token testnet faucet based on Polkadot JS, users can get 100 free test tokens per day

http://sdk.substrate.org.cn/post/Faucet



<img src="http://qpjf9b6ys.hn-bkt.clouddn.com/3.png"/>





#### 4-Build Wiki for game developers and game players.

https://web3games.baklib-free.com/



<img src="http://qpjf9b6ys.hn-bkt.clouddn.com/4.png"/>





#### 5-Build pallet modules in game frameworks

https://github.com/Web3-Substrate-Game-World/SGC/tree/main/pallets



<img src="http://qpjf9b6ys.hn-bkt.clouddn.com/5.png"/>





##### 5.1-Chain-extension

We build contracts to interact with runtime pallet modules, and support rust-based wasm contact and solidity sol contract to call pallets on our contracts.

Wasm Contracts Interact with other -> Wasm Contracts 【Multiple】

Sol Contracts Interact with other ->  Sol Contracts 【Multiple】

Wasm Contracts Interact with Game Chain Pallet  

Sol Contracts Interact with Game Chain  Pallet 





##### 5.2-Currency-Token Minting Module

Integrated with Acala ORML moduel, we can mint tokens easily in the chain and we support SGC, DOT,KSM,USDT,ACA, etc.

We can compatible with the cross-chain, dex and upcoming game swaps.



##### 5.3-Dex also called GameSwap

We develop the decentralised exchange protocol for substrate-based game assets (or NFT).

The Uniswap for Gamers
- Compatible with all NFT, Fungible token assets developed on SGC Game Chain
- Support ERC1155 NFT tokens and customised subgame contract assets.

##### 5.4-Erc1155

- Implemented ERC1155 in substrate
- Can interact with pallet without contract


##### 5.5-Evm-precompile

- We implement the module with ETH, EVM compile module with front bridge
- Compatible with Ethereum
- Support Metamask chrome extension and mobile app



<img src="http://qpjf9b6ys.hn-bkt.clouddn.com/9.png"/>

Welcome to connect to our testnet



##### 6-NFT pallet

- A simple NFT integrated module
- You can mint your NFT tokens based on Substrate

### 6-Project Introduction Website

https://web3games.blockspaper.com/en/



<img src="http://qpjf9b6ys.hn-bkt.clouddn.com/6.png"/>





### 7-SubGat 



1-SubGat- Game Web Template Frame


- Front-end framework for blockchain and game developers to set up game web client easily
- Customisable UI Design
- Provide integration with Web3 Game accounts
- Users can browse digital assets NFT on web client

https://github.com/Web3-Substrate-Game-World/SubGat-Game-Web-Template-Frame

2-SubGat-Game Web Back-end Server Frame

- Back-end framework for blockchain and game developers to set up game web backend easily

https://github.com/Web3-Substrate-Game-World/SubGat-Game-Web-Back-end-Server-Frame





<img src="http://qpjf9b6ys.hn-bkt.clouddn.com/10.png"/>





3-SubGat-Game-Client-Template-Frame

Quickly build game client for blockchain + game developers【Game client template framework】

Game client framework
- One-click set up for game development based on Cocos
- Support main stream game engine and editors
- Support third-party extension

https://github.com/Web3-Substrate-Game-World/SubGat-Game-Client-Template-Frame



<img src="http://qpjf9b6ys.hn-bkt.clouddn.com/8.png"/>





4-SubGat-Game-Real-Time-Server-Template-Frame

- Game Real Time backend server framework
- Provide multiple game player connection
- High performace and optimise resource allocation
- Customisable real time server extension

https://github.com/Web3-Substrate-Game-World/SubGat-Game-Real-Time-Server-Template-Frame



5-SubGat-Game-Contract-Library

- Game contract library for blockchain and game developers
- Blockchain game related smart contract template
- Use to store game digital data
- Use to generate game digital assets (fungible tokens and NFT)
- With game logic contract test cases

https://github.com/Web3-Substrate-Game-World/SubGat-Game-Contract-Library

### 8-Fishing Game Demo based on SubGat,SubGas,SubGac,polkadotjs

https://github.com/Web3-Substrate-Game-World/Deep-Sea-Hunter-Webgame-example1

### 9-SGC Testnet Faucet Website

https://github.com/Web3-Substrate-Game-World/Web3-Games-Faucet-Web

### 10-SGC Testnet Faucet Server

https://github.com/Web3-Substrate-Game-World/Web3-Games-Faucet-Server



-----------------------------------------------------------------------



## Technical difficulties and solutions

| Technical difficulties                                      | Solutions                                                    |
| ----------------------------------------------------------- | ------------------------------------------------------------ |
| More ActionsInteract with polkadot js with react cli        | Did research and fix the compile problem with webpack and integration with different tools / frameworks. For Typescript, we need to inject or write our own Types to fix the compile problems |
| Interact with polkadot js with next js                      | Did research and fix the compile problem with webpack and integration with different tools / frameworks. For Typescript, we need to inject or write our own Types to fix the compile problems |
| Interact with polkadot js with game client                  | Did research and fix the compile problem with webpack and integration with different tools / frameworks. For Typescript, we need to inject or write our own Types to fix the compile problems |
| Choose diesel or rbatis for website backend ORM             | For diesel ROM,the query statemenet and integration is more complicated. We finally chose rbatis which is more user-friendly with lower development entry barrier. |
| Rbatis doesn't support some specific statements             | We faced the problem when we tried to access game account in our testnet and fixed it by checking rust terminal error messages and we decided to remove the additional query. |
| Problems about interacting the runtime with ink contract    | We fixed it based on the ink <> runtime contract example and implement the contract in runtime. |
| Game asset should be stored in contact or runtime?          | We did research and found that storing in runtime should be safer and more decentralised. |
| How to access the same digital asset from evm and contract? | We implemented chain-extension and evm-precompile modules, bringing pallet features to evm and contract environment. |
| Frontier and orml dependence compile problem?               | We fix it by forking the project, editing the dependence and fix the compile error. |
| Mulitple ERC1155 storage                                    | We use instance_id to separate multiple erc1155 to make sure they have independent storage for access. |










​                                                                                                