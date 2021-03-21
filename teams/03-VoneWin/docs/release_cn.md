# 用户本地启动

## 目录
- 一、启动链
- 二、链上发布合约
- 二、启动IPFS
- 三、启动后端
- 四、启动前端

## 一、启动链
编译步骤：
    cd ../../code/chain/vonevinchains/
    cargo build

直接启动步骤：
mac环境启动：
nohup ./release/chain_release_mac/node-template --chain ./customSpecRaw.json --base-path /tmp/validator1 --alice  --port 30333 --ws-external --ws-port 9944 >node1.log 2>&1 &

nohup ./release/chain_release_mac/node-template --chain ./customSpecRaw.json --base-path /tmp/validator2 --bob  --port 30334 --ws-external --ws-port 9945 >node2.log 2>&1 &

linux环境启动：
nohup ./release/chain_release_linux/node-template --chain ./customSpecRaw.json --base-path /tmp/validator1 --alice  --port 30333 --ws-external --ws-port 9944 >node1.log 2>&1 &

nohup ./release/chain_release_linux/node-template --chain ./customSpecRaw.json --base-path /tmp/validator2 --bob  --port 30334 --ws-external --ws-port 9945 >node2.log 2>&1 &

## 二、链上发布合约
打开 https://polkadot.js.org/apps，连接本地节点
然后上传合约  ../../code/contract/ink/erc721/target/ink/erc721.contract

## 三、启动IPFS
1: cd ../../code/ipfs/
2: 执行 make install  进行安装ipfs
3: 修改配置文件: 默认位置: /root/.ipfs/config 

],
    "API": "/ip4/0.0.0.0/tcp/5001",
    "Gateway": "/ip4/0.0.0.0/tcp/8080"
  },

"API": {
    "HTTPHeaders": {
 "Access-Control-Allow-Origin": [
        "*"
      ]
    }
  },

4: 初始化ipfs存储库: ipfs init --profile server
5: 启动ipfs : ipfs daemon
6: 将本地ipfs节点连接到网络: ipfs swarm peers

## 四、后端服务启动
编译步骤： go build -o assets-api ../../code/backend/assets-api/main.go
        chmod 777 assets-api
        ./assets-api

直接启动步骤：
mac环境启动：
默认启动连接的是项目提供的测试数据库，可能因为网络原因导致数据库连接失败，也可以在本地启动数据库来执行
./release/release-mac/assets-api-mac

如果数据库连接不上，建议修改配置文件的数据库连接，切换到本地数据库连接 vim release/release-mac/conf/app.conf
建表可导入sql文件 relase/db_assets.sql

linux环境启动：
./release/release-linux/assets-api-mac

## 五、前端服务启动