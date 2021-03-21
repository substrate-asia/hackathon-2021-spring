package services

import (
	"assets-api/models"
	"assets-api/utils"
	"errors"
	"fmt"
	"log"
	"strconv"
	"time"

	"github.com/beego/beego/v2/client/orm"
	beego "github.com/beego/beego/v2/server/web"
	_ "github.com/go-sql-driver/mysql"
)

type UserService struct {
	BaseService
}

func (this *UserService) Login(userName, walletAddress, password, ip string) (*models.ResUserLogin, error) {

	var err error
	var lastInsertId int64 = 0

	user := models.User{}
	ormer := orm.NewOrm()
	err = ormer.QueryTable(new(models.User).TableName()).Filter("WalletAddress", walletAddress).One(&user)
	if err == orm.ErrNoRows { //记录不存在
		lastInsertId, _ = ormer.Insert(&models.User{
			Username:      userName,
			WalletAddress: walletAddress,
			Ip:            ip,
			IsLocked:      0,
			CreateTime:    time.Now().Unix(),
		})
		ormer.QueryTable(new(models.User).TableName()).Filter("Id", lastInsertId).One(&user)
	}

	if 1 == user.IsLocked {
		return nil, errors.New("用户已被冻结，请联系管理员~")
	}

	//创建token
	userId := strconv.FormatInt(user.Id, 10)
	apiId := utils.Sha1(userId + utils.CreateValidateCode(6)) //用户token
	timeConfig, err := beego.AppConfig.String("jwt::expiretime")
	if nil != err {
		return nil, err
	}
	expireTime, _ := strconv.ParseInt(timeConfig, 10, 64) //过期时间
	apiToken, err := utils.CreateToken(userId, apiId, expireTime)
	if nil != err {
		return nil, err
	}
	log.Println("登录token为：", apiToken)

	//更新token
	user.ApiToken = apiId
	if _, err := ormer.Update(&user); err != nil {
		return nil, nil
	}

	res := models.ResUserLogin{
		UserId:   strconv.FormatInt(user.Id, 10),
		Address:  walletAddress,
		ApiToken: apiToken,
	}
	fmt.Println(res)
	return &res, nil

}

//我发布的资产列表
func (this *UserService) MyAssetList(userId int64, offset, limit uint64) (*models.ResCommonList, error) {

	ormer := orm.NewOrm()

	count := models.Count{}
	ormer.Raw("SELECT count(*) as num FROM `"+new(models.Asset).TableName()+"` a LEFT JOIN `"+new(models.User).TableName()+"` b ON a.`user_id` = b.`id` WHERE a.user_id = ? ", userId).QueryRow(&count)
	resCommonList := &models.ResCommonList{}
	resCommonList.Count = count.Num //统计总记录数
	resCommonList.Offset = offset
	resCommonList.Limit = limit

	list := make([]*models.ResMyAssetList, 0)
	if count.Num <= 0 {
		return &models.ResCommonList{}, nil
	} else {
		sql := "SELECT a.id, a.asset_name, a.asset_type,a.total_hash, a.category_id, a.describe, a.tag, a.owner, a.user_id, a.price, a.cover, a.is_verify, a.is_proof, a.is_register, a.is_sold,a.create_time,p.token_id,p.proof_no asset_no, " +
			" b.nick_name, b.username" +
			" FROM " + new(models.Asset).TableName() + " a LEFT JOIN " + new(models.User).TableName() + " b ON a.user_id = b.id" +
			"  LEFT JOIN " + new(models.Proof).TableName() + " p ON a.id = p.assets_id" +
			" WHERE a.user_id = ? ORDER BY a.id DESC limit ? , ? "
		_, err := ormer.Raw(sql, userId, offset, limit).QueryRows(&list)
		if err != nil {
			return &models.ResCommonList{}, nil
		}
		for k, v := range list {
			category := models.Category{}
			ormer.QueryTable(new(models.Category).TableName()).Filter("Id", v.CategoryId).One(&category, "CategoryName")
			list[k].CategoryName = category.CategoryName
			fileLists := make([]*models.FileList, 0)
			ormer.Raw("SELECT f.file_hash,f.file_path FROM "+new(models.AssetFile).TableName()+" f WHERE f.assets_id = ? AND f.is_valid = ? AND f.is_delete = ?", v.Id, 1, 0).QueryRows(&fileLists)
			list[k].FileLists = fileLists
		}
		resCommonList.List = list
	}
	return resCommonList, nil
}

//我购买的资产列表
func (this *UserService) MyOrderList(userId int64, offset, limit uint64) (*models.ResCommonList, error) {

	ormer := orm.NewOrm()
	count := models.Count{}
	ormer.Raw("SELECT count(*) as num FROM `"+new(models.Order).TableName()+"` a LEFT JOIN `"+new(models.User).TableName()+"` b ON a.`buyer` = b.`id` LEFT JOIN "+new(models.Asset).TableName()+" c ON a.assets_id = c.id WHERE a.`buyer` = ? ", userId).QueryRow(&count) //AND c.is_delete = 0

	resCommonList := &models.ResCommonList{}
	resCommonList.Count = count.Num //统计总记录数
	resCommonList.Offset = offset
	resCommonList.Limit = limit

	list := make([]*models.ResMyOrderList, 0)
	if count.Num <= 0 {
		return &models.ResCommonList{}, nil
	} else {
		sql := "SELECT a.id,a.create_time, " +
			" b.nick_name, b.username," +
			" c.asset_name,c.total_hash, c.is_verify, c.is_proof, c.is_register, c.is_sold, c.asset_type, c.category_id, c.`describe`, c.tag, c.`owner`, c.user_id, c.price, c.cover,p.proof_no asset_no,p.proof_book " +
			" FROM " + new(models.Order).TableName() + " a LEFT JOIN " + new(models.User).TableName() + " b ON a.buyer = b.id" +
			" LEFT JOIN " + new(models.Asset).TableName() + " c ON a.assets_id = c.id" +
			"  LEFT JOIN " + new(models.Proof).TableName() + " p ON a.assets_id = p.assets_id" +
			" WHERE a.`buyer_address` = ? ORDER BY a.id DESC limit ? , ? " // AND c.is_delete = 0
		_, err := ormer.Raw(sql, userId, offset, limit).QueryRows(&list)
		if err != nil {
			return &models.ResCommonList{}, nil
		}
		for k, v := range list {
			category := models.Category{}
			ormer.QueryTable(new(models.Category).TableName()).Filter("Id", v.CategoryId).One(&category, "CategoryName")
			list[k].CategoryName = category.CategoryName
		}
		resCommonList.List = list
	}
	return resCommonList, nil
}
