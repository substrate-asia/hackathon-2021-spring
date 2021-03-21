package controllers

import (
	"assets-api/models"
	"assets-api/services"
	"encoding/json"
)


type ChainController struct {
	BaseController
}

// @Title 链上交互结果记录
// @Description 参数描述 略
// @Success 200 {object} string
// @Param param body models.ReqChainNotice true "JSON参数"
// @Failure 400 no enough input
// @Failure 500 add category error
// @router /v2/chain/notice [post]
func (this *ChainController) Subscribe() {
	proofParam := models.ReqChainNotice{}
	err := json.Unmarshal(this.Ctx.Input.RequestBody, &proofParam)
	if err != nil {
		this.JsonResult(1, "参数解析异常", EMPTY)
	}
	service := new(services.ChainService)
	result, err := service.ChainSubscribe(&proofParam)
	if err != nil {
		this.JsonResult(1, err.Error(), EMPTY)
	}
	this.JsonResult(0, "提交成功", result)

}

// @Title 链上交互结果hash
// @Description 参数描述 略
// @Success 200 {object} string
// @Param param body models.ReqChainNotice true "JSON参数"
// @Failure 400 no enough input
// @Failure 500 add category error
// @router /v2/chain/notice [post]
func (this *ChainController) Notice() {
	proofParam := models.ReqChainNotice{}
	err := json.Unmarshal(this.Ctx.Input.RequestBody, &proofParam)
	if err != nil {
		this.JsonResult(1, "参数解析异常", EMPTY)
	}
	userId := this.IdentityAuth()
	service := new(services.ChainService)
	result, err := service.ChainNotice(&proofParam, userId)
	if err != nil {
		this.JsonResult(1, err.Error(), EMPTY)
	}
	this.JsonResult(0, "提交成功", result)

}
