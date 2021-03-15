package main

import (
	"nftmart/app/global/variable"
	_ "nftmart/bootstrap"
	"nftmart/routers"
)

// 这里可以存放graphQL查询接口入口
func main() {
	// 初始化路由
	router := routers.InitGraphqlRouter()
	// 初始化数据
	//err := database.Seed(model.UseDbConn(""))
	//if err != nil {
	//	panic(err)
	//}
	_ = router.Run(variable.ConfigYml.GetString("HttpServer.Graph.Port"))
}
