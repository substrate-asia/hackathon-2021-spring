# User local startup
 
## table of Contents
-1, start chain
-2. Release contract on the chain
-3, start IPFS
-4, back-end service startup
-5, front-end service start
 
## One, start chain
Compilation steps:
    cd ../../code/chain/vonevinchains/
    cargo build
 
Direct start steps:
Start the mac environment:
nohup ./release/chain_release_mac/node-template --chain ./customSpecRaw.json --base-path /tmp/validator1 --alice --port 30333 --ws-external --ws-port 9944 >node1.log 2 >&1 &
 
nohup ./release/chain_release_mac/node-template --chain ./customSpecRaw.json --base-path /tmp/validator2 --bob --port 30334 --ws-external --ws-port 9945 >node2.log 2 >&1 &
 
Start the linux environment:
nohup ./release/chain_release_linux/node-template --chain ./customSpecRaw.json --base-path /tmp/validator1 --alice --port 30333 --ws-external --ws-port 9944 >node1.log 2 >&1 &
 
nohup ./release/chain_release_linux/node-template --chain ./customSpecRaw.json --base-path /tmp/validator2 --bob --port 30334 --ws-external --ws-port 9945 >node2.log 2 >&1 &
 
## 2. Release the contract on the chain
Open https://polkadot.js.org/apps and connect to the local node
Then upload the contract ../../code/contract/ink/erc721/target/ink/erc721.contract
 
## 3, start IPFS
1: cd ../../code/ipfs/
2: Execute make install to install ipfs
3: Modify the configuration file: Default location: /root/.ipfs/config
 
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
 
4: Initialize the ipfs repository: ipfs init --profile server
5: Start ipfs: ipfs daemon
6: Connect the local ipfs node to the network: ipfs swarm peers
 
## 4, back-end service startup
Compilation steps:
    go build -o assets-api ../../code/backend/assets-api/main.go
    chmod 777 assets-api
    ./assets-api

Direct start steps:
Start the mac environment:
The default startup connection is the test database provided by the project. The database connection may fail due to network reasons. You can also start the database locally to execute
    ./release/release-mac/assets-api-mac

If the database connection fails, it is recommended to modify the database connection of the configuration file and switch to the local database connection .
    vim release/release-mac/conf/app.conf
Create table can import sql file.  relase/db_assets.sql

Start the linux environment:
    ./release/release-linux/assets-api-mac

## 5, front-end service start