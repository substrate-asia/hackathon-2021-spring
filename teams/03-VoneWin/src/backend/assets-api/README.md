# Assets Trust 数字资产生态平台

> 后端API采用Beego框架

## 安装

1、先安装Beego框架和Bee工具，参考：https://beego.me/docs/install/

2、克隆项目代码
```
git clone https://github.com/VoneWin/polkadot-hackathon.git
git checkout -b dev origin/dev
git pull origin dev
```

> 说明：公共自定义函数库 utils\common.go

## 更新swagger文档

```
bee run -gendoc=true
```
`-gendoc=true` 表示每次自动化的 build 文档，`-downdoc=true` 第一次执行时必须带上此参数（后续不用），就会自动的下载 swagger 文档查看器
参考：https://beego.me/docs/advantage/docs.md


## 部署

1、修改配置`./conf/app.conf`，如port

2、在linux下编译并启动
```
./publish.sh
```
