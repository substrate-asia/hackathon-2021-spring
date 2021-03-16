# Dawn队介绍

## 团队成员
姓名 | 简介 | github链接
--|--|--
王业伟 | 上海交大本科毕业，万向区块链实验室研发实习 | https://github.com/Jackieyewang
沈尹沁 | UCL研究生毕业，从事数字货币量化交易与投资多年，区块链技术与数字货币爱好者 | https://github.com/yshen94
丁辉 | 前端开发工程师，目前就职于携程，曾参与过星云链dapp开发并获奖 | https://github.com/cleartime
林嘉锵 | 八年后台开发经验，做过百万级用户社交软件，K8s云原生和运维平台 | https://github.com/lamkacheong




# Getting started

Front-end for NFT-marketplace web application.

Related APIS/blockchain APIs are: TBD

## High Level Design

![HLD](nft-marketplace-HLD.png)

## Install

Install all requiered packages with

```
npm install
```



## How to run locally

```
npm run dev
```

(WIP) This command will start multiples npm tasks :

- `start-backend`, for starting the backend (_port 8181_)
- `start`, for starting the application through `dev react server` (_port 3000_)



Pick up another terminal

```
cd chainlink-polkadot
make run-chain
```



# How to run the tests

All the Tests can be run in interactive mode with

```
# all the tests
npm run test

# no watch mode
npm run test:nowatch

# no watch + coverage report
test:cov
```

# how to run in production

Build the application, set the environment variables and run the application :

```
npm run build

NFT_API_HOST=http://localhost # blockchain host name
NFT_API_PORT=8282 # blockchain host port
EXPRESS_PORT=8181 # application port

npm run production
```

# About authentication process

TBD

# How to do a PR

Please don't push directly to an environment branch. If you don't know how to make a PR, please ask to someone.

# Maintenance mode

TBD

## Branch strategy

We are using `Trunk base on test Branch` strategy

## CI/CD strategy & pipeline

Jenkins will be here soon .... stay tuned !
