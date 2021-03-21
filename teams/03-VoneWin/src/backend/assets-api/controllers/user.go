package controllers

import (
	"assets-api/models"
	"assets-api/services"
	"assets-api/utils"
	"encoding/json"
	"fmt"
	"log"
)

type UserController struct {
	BaseController
}

func (this *UserController) Login() {

	req := models.ReqUserLogin{}
	//fmt.Printf("%v", this.Ctx.Input.RequestBody)
	err := json.Unmarshal(this.Ctx.Input.RequestBody, &req)
	if err != nil {
		fmt.Println(err.Error())
		this.JsonResult(1, "参数错误~", EMPTY)
	}
	byteData, _ := json.MarshalIndent(req, "", "\t") //加t 格式化显示
	log.Println("参数为：", string(byteData))

	chainService := new(services.ChainService)
	if !chainService.CheckSignature(req.Signature, req.Address, req.Message) {
		this.JsonResult(1, "签名验证失败，请检查~", EMPTY)
	} else {
		log.Println("验签通过")
	}

	userService := new(services.UserService)
	res, err := userService.Login(req.Username, req.Address, "", utils.GetExternalIp())
	if err != nil {
		this.JsonResult(1, err.Error(), EMPTY)
	}

	this.JsonResult(0, "登录成功！", &res)

}

//我发布的资产
// @Title 我发布的资产列表
// @Description 参数描述 略
// @Param offset query uint64 true "分页查询起始索引"
// @Param limit query uint64 true "每页限制查询的记录数"
// @Success 200 {object} *models.ResCommonList
// @Failure 400 no enough input
// @Failure 500 get category list error
// @router /v2/user/assets [get]
func (this *UserController) Assets() {
	userId := this.IdentityAuth()
	if userId <= 0 {
		this.JsonResult(1, "请重新登录~", EMPTY)
	}
	offset, err := this.GetUint64("offset")
	if err != nil {
		offset = 0
	}
	limit, err := this.GetUint64("limit")
	if err != nil {
		limit = 10
	}
	userService := new(services.UserService)
	res, err := userService.MyAssetList(userId, offset, limit)
	if err != nil {
		this.JsonResult(1, err.Error(), EMPTY)
	}
	if res.List == nil {
		res.List = EMPTY
	}
	this.JsonResult(0, "获取我发布的资产成功！", &res)

}

//我购买的资产
// @Title 查询我购买的资产列表
// @Description 参数描述 略
// @Param offset query uint64 true "分页查询起始索引"
// @Param limit query uint64 true "每页限制查询的记录数"
// @Success 200 {object} *models.ResCommonList
// @Failure 400 no enough input
// @Failure 500 get category detail error
// @router /v2/user/orders [get]
func (this *UserController) Orders() {
	userId := this.IdentityAuth()
	if userId <= 0 {
		this.JsonResult(1, "请重新登录~", EMPTY)
	}
	offset, err := this.GetUint64("offset")
	if err != nil {
		offset = 0
	}
	limit, err := this.GetUint64("limit")
	if err != nil {
		limit = 10
	}
	userService := new(services.UserService)
	res, err := userService.MyOrderList(userId, offset, limit)
	if err != nil {
		this.JsonResult(1, err.Error(), EMPTY)
	}
	if res.List == nil {
		res.List = make([]*models.ResMyOrderList, 0)
	}
	this.JsonResult(0, "获取我购买的资产成功！", &res)
}
