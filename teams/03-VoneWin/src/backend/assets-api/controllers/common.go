package controllers

import (
	"assets-api/services"
	"fmt"
)

type CommonController struct {
	BaseController
}

// @Title 查询存证
// @Description 参数描述 略
// @Success 200 {object} string
// @Param keyword query string true "存证编号"
// @Failure 400 no enough input
// @Failure 500 get proof book error
// @router /v2/category/detail [get]
func (this *CommonController) QueryProof() {
	proofNo := this.GetString("keyword")
	if "" == proofNo {
		this.JsonResult(1, "参数有误~不能为空", EMPTY)
	}
	commonService := new(services.CommonService)
	res, err := commonService.QueryProof(proofNo)
	if err != nil {
		fmt.Println("查询存证: " + err.Error())
		//this.JsonResult(1, err.Error(), EMPTY)
	}
	this.JsonResult(0, "查询资产存证成功！", res)
}
