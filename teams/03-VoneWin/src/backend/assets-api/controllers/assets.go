package controllers

import (
	"assets-api/models"
	"assets-api/models/vo"
	"assets-api/services"
	"bytes"
	"encoding/json"
	"fmt"
	"log"
)

type AssetsController struct {
	BaseController
}

var service *services.AssetsService = &services.AssetsService{}

//交易中心资产列表
// @Title 查询交易中心资产列表
// @Description 参数描述 略
// @Param keyword query string true "资产名称"
// @Param category_id query uint64 true "分类id"
// @Param offset query uint64 true "分页查询起始索引"
// @Param limit query uint64 true "每页限制查询的记录数"
// @Success 200 {object} *models.ResCommonList
// @Failure 400 no enough input
// @Failure 500 get category list error
// @router /v2/assets/list [get]
func (this *AssetsController) List() {

	keyword := this.GetString("keyword")
	categoryId, _ := this.GetUint64("category_id")
	offset, err := this.GetUint64("offset")
	if err != nil {
		offset = 0
	}
	limit, err := this.GetUint64("limit")
	if err != nil {
		limit = 15
	}
	assetsService := new(services.AssetsService)
	res, err := assetsService.List(keyword, categoryId, offset, limit)
	if err != nil {
		this.JsonResult(1, err.Error(), EMPTY)
	}
	if res.List == nil {
		res.List = EMPTY
	}
	this.JsonResult(0, "获取交易中心资产列表成功！", &res)

}

//资产详情
// @Title 查询资产详情
// @Description 参数描述 略
// @Param assetsId query uint64 true "资产分类ID"
// @Success 200 {object} *models.ResAssetDetail
// @Failure 400 no enough input
// @Failure 500 get category detail error
// @router /v2/assets/detail [get]
func (this *AssetsController) Detail() {
	id, err := this.GetUint64("id")
	if err != nil {
		this.JsonResult(1, "参数有误~", EMPTY)
	}
	assetsService := new(services.AssetsService)
	res, err := assetsService.Detail(id)
	if err != nil {
		this.JsonResult(1, "获取资产详情失败~", EMPTY)
	}
	this.JsonResult(0, "获取资产详情成功！", res)
}

//提交资产
// @Title 提交资产
// @Description 参数描述 略
// @Success 200 {object} EMPTY
// @Param param body models.ReqAssetSubmit true "JSON参数"
// @Failure 400 no enough input
// @Failure 500 add category error
// @router /v2/assets/add [post]
func (this *AssetsController) Add() {
	submit := models.ReqAssetSubmit{}
	err := json.Unmarshal(this.Ctx.Input.RequestBody, &submit)
	if err != nil {
		this.JsonResult(ErrInvalidParam, "提交资产参数解析异常", EMPTY)
	}
	userId := this.IdentityAuth()
	submit.UserId = userId
	submit.Owner = userId

	err = service.Add(&submit)
	if err != nil {

		this.JsonResult(ErrInvalidParam, "保存提交资产异常||资产文件不存在||资产文件不能重复提交", EMPTY)
	}

	this.JsonResult(ErrSuccess, "提交资产成功", EMPTY)
}

//上传文件
// @Title 上传文件到ipfs
// @Description 参数描述 略
// @Param upfile form-data file true "文件"
// @Success 200 {object} int
// @Failure 400 no enough input
// @Failure 500 get category list error
// @router /v2/assets/upload [post]
func (this *AssetsController) Upload() {
	uploadIpfsVo := new(vo.UploadIpfsVo)
	f, h, err := this.GetFile("upfile")
	if err != nil {
		log.Fatal("getfile err ", err)
		this.JsonResult(ErrInvalidParam, "param error", EMPTY)
	}
	defer f.Close()
	a := make([]byte, 1024)
	buffer := bytes.Buffer{}
	for {
		if read, _ := f.Read(a); read > 0 {
			buffer.Write(a)
		} else {
			break
		}
	}
	ipfsHash, filePath, err := services.UploadToIpfs(buffer.Bytes())
	if err != nil && len(ipfsHash) == 0 {
		fmt.Println("上传到ipfs失败", err)
		this.JsonResult(ErrUploadAssetsFile, "ipfsHash上传存证失败", EMPTY)
	}
	log.Println("ipfsHash上传存证成功: {}", ipfsHash)
	uploadIpfsVo.FileHash = ipfsHash
	uploadIpfsVo.FilePath = filePath
	uploadIpfsVo.FileSize = h.Size
	uploadIpfsVo.FileName = h.Filename

	//保存信息进数据库
	id := service.SaveAssetsFile(uploadIpfsVo)
	uploadIpfsVo.Id = id

	this.JsonResult(ErrSuccess, "ipfsHash上传存证成功", uploadIpfsVo)
}

