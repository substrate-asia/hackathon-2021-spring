// @APIVersion 2.0.0
// @Title Assets Trust API
// @Description Assets Trust Apis
// @Contact xinmin.yang@vonechain.com

package routers

import (
	"assets-api/controllers"

	beego "github.com/beego/beego/v2/server/web"
)

func init() {
	beego.Router("/", &controllers.BaseController{}, "*:HelloApi")

	ns := beego.NewNamespace("/v2",

		//用户相关
		beego.NSNamespace("/user",
			//登录***
			beego.NSRouter("/login", &controllers.UserController{}, "post:Login"),
			//我提交的资产***
			beego.NSRouter("/assets", &controllers.UserController{}, "get:Assets"),
			//我购买的资产***
			beego.NSRouter("/orders", &controllers.UserController{}, "get:Orders"),
		),

		//资产相关
		beego.NSNamespace("/assets",
			//资产列表***
			beego.NSRouter("/list", &controllers.AssetsController{}, "get:List"),
			//资产详情***
			beego.NSRouter("/detail", &controllers.AssetsController{}, "get:Detail"),
			//资产文件上传
			beego.NSRouter("/upload", &controllers.AssetsController{}, "post:Upload"),
			//用户创建资产
			beego.NSRouter("/add", &controllers.AssetsController{}, "post:Add"),
		),

		//资产分类 用于测试
		beego.NSNamespace("/category",
			//分类列表***
			beego.NSRouter("/list", &controllers.CategoryController{}, "get:List"),
			//分类详情***
			beego.NSRouter("/detail", &controllers.CategoryController{}, "get:Detail"),
			//单个添加分类***
			beego.NSRouter("/add", &controllers.CategoryController{}, "post:Add"),
			//批量添加分类***
			beego.NSRouter("/batch_add", &controllers.CategoryController{}, "get:BatchAdd"),
			//删除分类***
			beego.NSRouter("/delete", &controllers.CategoryController{}, "get:Delete"),
		),

		//公共
		beego.NSNamespace("/common",
			//查询存证***
			beego.NSRouter("/proof", &controllers.CommonController{}, "get:QueryProof"),
		),

		//公共
		beego.NSNamespace("/chain",
			//查询存证***
			beego.NSRouter("/notice", &controllers.ChainController{}, "post:Notice"),
		),
	)
	beego.AddNamespace(ns)

	//swagger文档
	beego.SetStaticPath("/swagger", "swagger")
}
