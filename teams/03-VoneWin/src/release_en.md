# User local startup
 
## Table of Contents
- start chain
- Release contract on the chain
- start IPFS
- back-end service startup
- front-end service start
 
## Start chain

Compilation steps:

```
cd chain/vonevinchains/
cargo build
```

Direct start steps:

Start the mac environment:

```
cd ./chain/release/release-mac/
nohup ./node-template --chain ./customSpecRaw.json --base-path /tmp/validator1 --alice  --port 30333 --ws-external --ws-port 9944 >node1.log 2>&1 &

nohup ./node-template --chain ./customSpecRaw.json --base-path /tmp/validator2 --bob  --port 30334 --ws-external --ws-port 9945 >node2.log 2>&1 &
```

Start the linux environment:

```
cd ./chain/release/release-linux/
nohup ./node-template --chain ./customSpecRaw.json --base-path /tmp/validator1 --alice  --port 30333 --ws-external --ws-port 9944 >node1.log 2>&1 &

nohup ./node-template --chain ./customSpecRaw.json --base-path /tmp/validator2 --bob  --port 30334 --ws-external --ws-port 9945 >node2.log 2>&1 &
```

## Release the contract on the chain
Open https://polkadot.js.org/apps and connect to the local node
Then upload the contract ./contract/erc721.contract
 
## Start IPFS

1、`cd ./ipfs/`

2、Execute make install to install ipfs

3、Modify the configuration file: Default location: `/root/.ipfs/config`

```
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
```

4、Initialize the ipfs repository: `ipfs init --profile server`

5、Start ipfs: `ipfs daemon`

6、Connect the local ipfs node to the network: `ipfs swarm peers`
 
## Back-end service startup

Compilation steps:

```
cd ./backend/assets-api
go build
chmod 777 assets-api
```

Direct start steps:

Start the mac environment:

The default startup connection is the test database provided by the project. The database connection may fail due to network reasons. You can also start the database locally to execute

```
cd ./backend/release/mac/
./assets-api-mac
```

If the database connection fails, it is recommended to modify the database connection of the configuration file and switch to the local database connection.

```
vim ./backend/release/mac/conf/app.conf
```

Create table can import sql file.  `backend/relase/db_assets.sql`

Start the linux environment:
```
cd ./backend/release/mac/
./assets-api-mac
```

## Front-end service start
```
./frontend/Readme.md
```