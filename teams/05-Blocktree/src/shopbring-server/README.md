# Shopbring-server

## step 1. mysql环境

安装mysql -> 5.7+
创建数据库 databaseName: shopbring-server
设置数据库字符集 utf8mb4 -- UTF-8 Unicode
设置数据库排序规则 utf8mb4_general_ci
导入shopbring-sever.sql数据脚本

## step 2. node环境

安装node -> v13.14.0+
安装yarn -> npm install -g yarn

## step 3. 配置项目

vscode导入shopbring-server项目文件夹
打开项目termial -> yarn install
重命名项目默认配置文件env -> .env

## step 4. 运行项目(npm scripts)

start-webapp (webapp-api接口程序)
start-watcher (区块扫块监听器程序)
start-task (订单状态清理任务程序)
