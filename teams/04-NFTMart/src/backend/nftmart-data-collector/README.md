# nftmart-data-collector

NFT on-chain data collection, on-chain interaction, focusing on the NFT business Web 2.0 and Web 3.0 communication bridge


## instruction

### NftDataCollector The technology stack used：

```
1、polkadot sdk 3.11.2-2
2、nodejs 12 + eggjs 2
3、vue-cli
4、mariadb 10 / mysql 8
```

### NftDataCollector install：

**Create a database**

```
create database nftcollector;
```

**Check to see if the database was created successfully. If you see a database with DORACMS, the database is created success**

```
show databases;
```

**Log in to the database and use the database**

```
use nftcollector;
```

**Import the SQL file and generate the database tables. The SQL file is in the databak directory of DoraCMS**

> Change the directory to your own nftcollector.sql file directory

```
source D:\ProjectList\NodeJS\nftcollector\databak\nftcollector.sql
```

**The code root directory installs dependencies**

```
npm i --registry=https://registry.npm.taobao.org
```

**Modifying configuration files**
> /app/config/config.local.js

```
// configure MySQL
sequelize: {
    dialect: 'mysql'，
    host: '127.0.0.1'， // local
    port: 3306，
    database: 'nftcollector'， //mysql database dir
    username: "root"，
    password: "123456"，
    delegate: 'model'
}，
```

**run project**

```
npm run dev
```

```


