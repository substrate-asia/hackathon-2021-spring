package controllers

import (
	"assets-api/models"
	"assets-api/services"
	"assets-api/utils"
	"encoding/json"
	"log"
	"strconv"
)

type CategoryController struct {
	BaseController
}

// @Title 查询资产分类列表
// @Description 参数描述 略
// @Success 200 {object} models.ResCategoryList
// @Failure 400 no enough input
// @Failure 500 get category list error
// @router /v2/category/list [get]
func (this *CategoryController) List() {
	keyword := this.GetString("keyword")
	parentId, err := this.GetUint64("parent_id")
	if err != nil {
		parentId = 0
	}
	orderBy := this.GetString("orderby")
	if "" == orderBy {
		orderBy = "sort"
	}
	offset, err := this.GetUint64("offset")
	if err != nil {
		offset = 0
	}
	limit, err := this.GetUint64("limit")
	if err != nil {
		limit = 0
	}

	categoryService := new(services.CategoryService)
	//定义要加载的字段
	fields := []string{"id", "category_name", "parent_id", "sort"}
	res, err := categoryService.GetList(keyword, parentId, fields, orderBy, offset, limit)
	if err != nil {
		//beego.Error(err.Error())
		this.JsonResult(1, "获取资产分类列表失败~", EMPTY)
	}
	this.JsonResult(0, "获取资产分类列表成功！", res)
}

// @Title 查询资产分类详情
// @Description 参数描述 略
// @Success 200 {object} models.Category
// @Param id query string true "资产分类ID"
// @Failure 400 no enough input
// @Failure 500 get category detail error
// @router /v2/category/detail [get]
func (this *CategoryController) Detail() {
	id, err := this.GetUint64("id")
	if err != nil || 0 == id {
		this.JsonResult(1, "参数格式有误~", EMPTY)
	}
	categoryService := new(services.CategoryService)
	fields := []string{"id", "category_name", "parent_id", "sort"}
	res, err := categoryService.GetDetail(id, fields)
	if err != nil {
		//beego.Error(err.Error())
		this.JsonResult(1, "获取资产分类详情失败~", EMPTY)
	}
	this.JsonResult(0, "获取资产分类详情成功！", res)
}

// @Title 添加资产分类
// @Description 参数描述 略
// @Success 200 {object} models.ResCategoryAdd
// @Param param body models.ReqCategoryAdd true "JSON参数"
// @Failure 400 no enough input
// @Failure 500 add category error
// @router /v2/category/add [post]
func (this *CategoryController) Add() {
	req := models.ReqCategoryAdd{}
	err := json.Unmarshal(this.Ctx.Input.RequestBody, &req)
	if err != nil {
		//beego.Error(err.Error())
		this.JsonResult(1, "参数错误~", EMPTY)
	}
	byteData, _ := json.MarshalIndent(req, "", "\t") //加t 格式化显示
	log.Println("参数为：", string(byteData))

	categoryService := new(services.CategoryService)
	lastInsertId, err := categoryService.Add(
		req.CategoryName,
		req.ParentId,
		req.Sort,
	)
	if err != nil {
		//beego.Error(err.Error())
		this.JsonResult(1, "添加资产分类列表失败~", EMPTY)
	}
	res := models.ResCategoryAdd{
		LastInsertId: strconv.FormatInt(lastInsertId, 10),
	}
	this.JsonResult(0, "添加资产分类列表成功！", res)

}

// @Title 批量添加资产分类
// @Description 参数描述 略
// @Success 200 {object} models.ResCategoryBatchAdd
// @Failure 400 no enough input
// @Failure 500 batch add category error
// @router /v2/category/batch_add [post]
func (this *CategoryController) BatchAdd() {
	categoryService := new(services.CategoryService)
	categoryList := make([]models.Category, 0)
	categoryList = append(categoryList, []models.Category{
		models.Category{
			CategoryName: "分类" + utils.GetRandomString(5),
			ParentId:     0,
			Sort:         0,
		},
		models.Category{
			CategoryName: "分类" + utils.GetRandomString(5),
			ParentId:     0,
			Sort:         1,
		},
	}...)
	lines, err := categoryService.BatchAdd(categoryList)
	if err != nil {
		//beego.Error(err.Error())
		this.JsonResult(1, "批量添加资产分类列表失败~", EMPTY)
	}
	res := models.ResCategoryBatchAdd{
		Lines: lines,
	}
	this.JsonResult(0, "批量添加资产分类列表成功！", res)
}

// @Title 更新资产分类
// @Description 参数描述 略
// @Success 200 {object} DataResponse
// @Param param body models.ReqCategoryUpdate true "JSON参数"
// @Failure 400 no enough input
// @Failure 500 update category error
// @router /v2/category/update [post]
func (this *CategoryController) Update() {
	req := models.ReqCategoryUpdate{}
	err := json.Unmarshal(this.Ctx.Input.RequestBody, &req)
	if err != nil {
		//beego.Error(err.Error())
		this.JsonResult(1, "参数错误~", EMPTY)
	}
	byteData, _ := json.MarshalIndent(req, "", "\t") //加t 格式化显示
	log.Println("参数为：", string(byteData))
	categoryService := new(services.CategoryService)
	err = categoryService.Update(
		req.Id,
		req.CategoryName,
	)
	if err != nil {
		//beego.Error(err.Error())
		this.JsonResult(1, "更新资产分类列表失败~", EMPTY)
	}
	this.JsonResult(0, "更新资产分类列表成功！", EMPTY)
}

// @Title 删除资产分类
// @Description 参数描述 略
// @Success 200 {object} DataResponse
// @Param id query string true "category id"
// @Failure 400 no enough input
// @Failure 500 update category error
// @router /v2/category/delete [get]
func (this *CategoryController) Delete() {
	var id uint64
	var err error
	categoryId, err := this.GetUint64("id")
	if err != nil || 0 == categoryId {
		this.JsonResult(1, "参数格式有误~", EMPTY)
	}

	categoryService := new(services.CategoryService)
	err = categoryService.Delete(id)
	if err != nil {
		//beego.Error(err.Error())
		this.JsonResult(1, "删除资产分类列表失败~", EMPTY)
	}
	this.JsonResult(0, "删除资产分类列表成功！", EMPTY)
}
