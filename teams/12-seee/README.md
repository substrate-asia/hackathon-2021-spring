## SubEng.
###### 2021-02-18 by maxatbj
###### Hackson project-- SEEE.io


## 1. install postgreSql database
$vim .env file
``` bash   
HOST=127.0.0.1
PORT=5000
DATABASE_URL="postgres://pguser:pgpassword@127.0.0.1/mydb"
RUST_LOG=sqlx_todo=info,actix=info
```   
## 2. add database user  "pguser" with password "pgpassword"

``` bash   
createdb
psql
CREATE USER pguser WITH PASSWORD 'pgpassword';
DROP DATABASE postgres;
CREATE DATABASE mydb OWNER pguser;
GRANT ALL PRIVILEGES ON DATABASE mydb to pguser;
ALTER ROLE pguser CREATEDB;
```  
## 3. run schema-cargo.sql & schema-hash.sql
``` bash   
psql -h localhost -U pguser -d mydb -a -f schema-cargo.sql
psql -h localhost -U pguser -d mydb -a -f schema-hash.sql
```  
## 4. run cargo build
``` bash   
$ cargo build
```  

## 5. start server with command:
``` bash   
 $./target/debug/actix  
```   

## 6.  run a browser on  http://localhost:5000 ,you will see below text, and play on it

## 7. play with follow curl command


### 欢迎来到能源联盟链 SEEE
####     Welcome to   < Hyper Bigdata on Chain SubEng} 
####     Openging API:

####       ------------ (1) Cargo ------------------
``` bash   
    GET /cargos -> list all cargo 
    POST /cargo -> creat cargo item, 
       example: { "id": "1", "account":"123456", "mktree":[ "1231231", "2323232", "343434343" ] ,  "done": false }
    GET /cargo/{id} -> list cargo item by id (列出所有上链数据包)
    PUT /cargo    -> update cargo item by id (update 提交的id必须字段, cid 字段无法修改)
        example: { "id": "3", "account":"123456", "mktree":[ "1231231", "2323232", "343434343" ] ,  "done": false }
    DELETE /cargo/{id} -> delete cargo item by id  (delete 指定id 数据包)
```    

####       ------------ (2) hash (not complete yet)------------------
``` bash 
    GET /hashs ->  list all hashs
    GET /hash-by-cid/{cid} -> list a hash by cid
    DELETE /hash-by-cid/{cid} -> delete a hash item by cid 
    GET /hash/{id} -> list a hash by id
    DELETE /hash/{id} -> delete a hash item by id 
```

 #### ------------（3）注意 ---------------
 ####    POST/PUT 模板如下例:( 注释自行去除)
``` bash           
     curl -X POST   'http://localhost:5000/cargo'  \
      -H 'Content-Type: application/json; charset=utf-8' \
        -d '{
            "id": -1                // id      [PUT必须], [POST缺省]: 自增数字
            "cid": "",              // cid     [PUT必须], [POST缺省]: "0"
            "account": "1234567",   // account [POST/PUT必须]
            "mkarr": [              // mkarr   [POST/PUT必须] 为要上链的数据 hash数组，
                "1231281",                     // 数组每一个成员都是一个文件或者数据的 Hash 摘要值
                "2323232",
                "xzzzzzzzy"
            ],
            "tstz": 12312312,      // tstz   [缺省]: 0
            "mkroot":"0",          // mkroot [缺省]: "0"
            "blocknum":"0",        // mkroot [缺省]: "0"
            "done": false          // mkroot [缺省]: false
        }'
``` 



## test command curl
``` bash   

curl -X GET   'http://localhost:5000/cargos'  -H 'Content-Type: application/json; charset=utf-8'

curl -X GET   'http://localhost:5000/cargo/123456' -H 'Content-Type: application/json; charset=utf-8'

curl -X DELETE   'http://localhost:5000/cargo/123456'  -H 'Content-Type: application/json; charset=utf-8'


curl -X POST   'http://localhost:5000/cargo'  \
 -H 'Content-Type: application/json; charset=utf-8' \
-d '{  
  "account": "1234567",
  "mkarr": [
      "1231281",
      "2323232",
      "343434343"
  ]
}'



curl -X POST   'http://localhost:5000/verify'  \
 -H 'Content-Type: application/json; charset=utf-8' \
-d '{  
  "cid": "019911542ae6168eb1a1a02eba615240a74fa6613e2110929c73c99a9e750f2b",
  "hashcode": "1231281"
}'


``` 