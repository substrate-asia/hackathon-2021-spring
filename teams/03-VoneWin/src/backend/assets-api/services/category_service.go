package services

import (
	"assets-api/models"
	"assets-api/utils"
	"encoding/json"
	"errors"
	"log"
	"strconv"
	"strings"

	"github.com/beego/beego/v2/client/orm"
	_ "github.com/go-sql-driver/mysql"
)

type CategoryService struct {
	BaseService
}

//获取列表
func (this *CategoryService) GetList(keyword string, parentId uint64, fields []string, orderby string, offset, limit uint64) (models.ResCategoryList, error) {
	//orm.Debug = true //设置 orm.Debug 为 true 可以打印 orm 查询的 sql 语句
	ormer := orm.NewOrm()
	query := ormer.QueryTable(new(models.Category).TableName())

	cond := orm.NewCondition()
	//按关键词搜索
	keyword = strings.TrimSpace(keyword)
	if keyword != "" {
		cond = cond.And("CategoryName", keyword)
		query.SetCond(cond)
	}
	if 0 == parentId {
		parentId = 0
	}
	if parentId != 0 {
		//cond.And("parent_id__gte", 0).And("parent_id__lt", 100)
		//以上条件相当于parent_id>=0 and parent_id<100
		cond = cond.And("ParentId", parentId)
		query.SetCond(cond)
	}

	categoryList := make([]*models.Category, 0)
	count, err := query.Count() //统计记录总数
	if err != nil {
		return models.ResCategoryList{}, err
	}
	if count > 0 {
		//排序
		//.OrderBy("-sort")相当于降序sort desc
		if orderby != "" {
			query.OrderBy(orderby)
		}
		//分页
		if limit > 0 {
			query.Offset(offset).Limit(limit)
		}
		//查询多条记录，使用.All()，第二个参数开始可以指定字段，如果不指定，则为所有字段
		_, err := query.All(&categoryList, fields...)
		if err != nil {
			return models.ResCategoryList{}, err
		}
	}
	resList := models.ResCategoryList{
		List:  categoryList,
		Count: count,
	}
	return resList, nil

}

//获取详情
func (this *CategoryService) GetDetail(id uint64, fields []string) (models.Category, error) {
	category := models.Category{}
	ormer := orm.NewOrm()
	err := ormer.QueryTable(new(models.Category).TableName()).Filter("Id", id).One(&category, fields...)
	if err != nil {
		return models.Category{}, err
	}
	return category, nil
}

//新增
func (this *CategoryService) Add(categoryName string, parentId string, sort int) (int64, error) {
	pid, err := strconv.ParseUint(parentId, 0, 64) //string转uint64
	if err != nil {
		return int64(0), err
	}
	category := models.Category{
		Id:       utils.GetSnoyFlakeID(), //获取雪花ID
		ParentId: pid,
		Sort:     sort,
	}
	ormer := orm.NewOrm()
	lastInsertId, err := ormer.Insert(&category)
	if err != nil {
		return int64(0), err
	}
	log.Println(lastInsertId)
	return lastInsertId, nil
}

//批量新增
func (this *CategoryService) BatchAdd(categoryList []models.Category) (int64, error) {
	if len(categoryList) <= 0 {
		return int64(0), errors.New("待添加的数据为空")
	} else {
		for k, _ := range categoryList {
			categoryList[k].Id = utils.GetSnoyFlakeID()
		}
	}
	byteData, _ := json.MarshalIndent(categoryList, "", "\t") //加t 格式化显示
	log.Println(string(byteData))

	ormer := orm.NewOrm()
	//InsertMulti()返回值为成功插入的数量
	lines, err := ormer.InsertMulti(len(categoryList), &categoryList)
	if err != nil {
		return int64(0), err
	}
	return lines, nil
}

//更新
func (this *CategoryService) Update(id string, categoryName string) error {
	ormer := orm.NewOrm()
	updateData := orm.Params{
		"CategoryName": categoryName,
	}
	if _, err := ormer.QueryTable(new(models.Category).TableName()).Filter("Id", id).Update(updateData); err != nil {
		return err
	}
	return nil
}

//删除
func (this *CategoryService) Delete(id uint64) error {
	ormer := orm.NewOrm()
	//删除后返回的第一个值为影响行数
	if _, err := ormer.Delete(&models.Category{Id: id}); err != nil {
		return err
	}
	return nil
}
