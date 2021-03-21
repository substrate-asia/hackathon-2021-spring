### NFTMART
NFTMART in Go. It provides APIs and SERVERS around NFT business. 

Documentation & Usage Examples

### Build
 cd project dir
 docker build -t nftmart:v1 -f Dockerfile .
 run server
 docker run --rm -it -p 20201:20201 nftmart:v1
---
Contributing
>   the first: use `goland(>=2019.3version)` open this project ，find`database/db_demo_mysql.sql`import database，autoconfigue the account、securet、port and so on。    
>   the second:double click`cmd/(graph/web|api|cli)/main.go`，Enter the code interface, the right mouse button 'Run' to run this project, the first time will automatically download the dependency, can be started after a moment.  
#### V 1.0.0  2021-02-20
*   nftmart business model design
*   User login interface development
*   User basic information modification interface development

#### V 1.0.0  2021-02-13
*   Integrated graphQL interface service

  
