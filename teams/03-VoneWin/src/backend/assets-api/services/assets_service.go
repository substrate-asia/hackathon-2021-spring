package services

import (
	"assets-api/models"
	"assets-api/models/vo"
	"assets-api/utils"
	"errors"
	"fmt"
	"math/rand"
	"strconv"
	"time"

	"github.com/beego/beego/v2/client/orm"
	"github.com/jinzhu/copier"
)

type AssetsService struct {
	BaseService
}

//交易中心资产列表
func (this *AssetsService) List(keyword string, categoryId, offset, limit uint64) (*models.ResCommonList, error) {

	cond := ""
	if keyword != "" {
		cond = cond + " AND a.asset_name like '%" + keyword + "%'"
	}
	if categoryId != 0 {
		cond = cond + " AND a.category_id = " + strconv.FormatUint(categoryId, 10)
	}
	ormer := orm.NewOrm()
	count := models.Count{}
	ormer.Raw("SELECT count(*) as num FROM " + new(models.Asset).TableName() + " a WHERE a.is_sold = 0 AND a.is_delete = 0 AND a.is_proof = 1 " + cond).QueryRow(&count)

	resCommonList := &models.ResCommonList{}
	resCommonList.Count = count.Num //统计总记录数
	resCommonList.Offset = offset
	resCommonList.Limit = limit

	list := make([]*models.ResAssetList, 0)
	if count.Num <= 0 {
		return &models.ResCommonList{}, nil
	} else {

		sql := "SELECT a.id, a.asset_name, a.asset_type, a.category_id, a.`describe`, a.tag, a.`owner`, a.user_id, a.price, a.cover, " +
			" b.category_name FROM " + new(models.Asset).TableName() + " a LEFT JOIN " + new(models.Category).TableName() + " b ON a.category_id = b.id " +
			" WHERE a.is_sold = 0 AND a.is_delete = 0 AND a.is_proof = 1 " + cond + " ORDER BY a.id DESC limit ? , ?"
		_, err := ormer.Raw(sql, offset, limit).QueryRows(&list)
		if err != nil {
			return &models.ResCommonList{}, nil
		}
		resCommonList.List = list
	}
	return resCommonList, nil
}

//资产详情
func (this *AssetsService) Detail(id uint64) (*models.ResAssetDetail, error) {
	asset := &models.ResAssetDetail{}
	ormer := orm.NewOrm()
	err := ormer.Raw("SELECT a.id,a.total_hash, a.asset_name, a.asset_type, a.category_id, a.`describe`, a.tag, a.`owner`, a.user_id, a.price, a.cover, a.is_verify, a.is_proof, a.is_register, a.is_sold, "+
		" b.nick_name, b.username, "+
		" c.proof_no asset_no, c.proof_book,c.token_id, c.create_time, c.block_height, c.block_time, c.tx_hash "+
		" FROM "+new(models.Asset).TableName()+" a LEFT JOIN "+new(models.User).TableName()+" b ON a.user_id = b.id LEFT JOIN "+new(models.Proof).TableName()+" c ON a.id = c.assets_id"+
		" WHERE a.id = ? ", id).QueryRow(&asset)
	if err != nil {
		return &models.ResAssetDetail{}, err
	}

	orderList := make([]*models.Order, 0)
	num, err := ormer.QueryTable(new(models.Order).TableName()).Filter("AssetsId", id).All(&orderList, "tx_hash", "seller_address", "buyer_address", "price", "tx_time")
	if err != nil {
		return &models.ResAssetDetail{}, err
	}
	txHistoryList := make([]*models.TxHistory, num)
	for k, v := range orderList {
		txHistoryList[k] = &models.TxHistory{
			TxHash:        v.TxHash,
			SellerAddress: v.SellerAddress,
			BuyerAddress:  v.BuyerAddress,
			Price:         v.Price,
			TxTime:        strconv.FormatInt(v.TxTime, 10),
		}
	}

	asset.TxHistoryList = txHistoryList //交易历史记录
	return asset, nil
}

//提交资产
func (this *AssetsService) Add(reqAssetSubmit *models.ReqAssetSubmit) error {
	asset := &models.Asset{}
	snoyFlakeID := utils.GetSnoyFlakeID()

	copier.Copy(asset, reqAssetSubmit)
	createTime := time.Now().Unix()
	asset.Id = snoyFlakeID
	asset.CreateTime = createTime
	asset.IsVerify = 1
	asset.IsDelete = 0
	asset.IsRegister = 0
	asset.IsSold = 0

	o := orm.NewOrm()
	fileList := models.AssetFileList{}
	_, err := o.QueryTable(new(models.AssetFile).TableName()).Filter("Id__in", reqAssetSubmit.UplodFileList).Filter("IsValid", 0).All(&fileList)
	if err != nil {

		return err
	}
	if len(fileList) == 0 {

		return errors.New("资产文件不存在")
	}

	var totalsize int64
	var totalhash string
	for i := 0; i < len(fileList); i++ {

		totalsize += fileList[i].FileSize
		totalhash += (fileList[i].FileHash + "/")
	}
	//asset.TotalSize = utils.FileSize(totalsize)
	asset.TotalSize = int(totalsize)
	asset.TotalHash = totalhash

	// 生成tokenid并插入到tb_proof
	proof := models.Proof{}
createTokenId:
	tokenId, _ := strconv.ParseInt(fmt.Sprintf("%08v", rand.New(rand.NewSource(time.Now().UnixNano())).Int31n(100000000)), 10, 64)
	err = o.QueryTable(new(models.Proof).TableName()).Filter("TokenId", tokenId).One(&proof)
	if err == orm.ErrNoRows {
		proof.AssetsId = snoyFlakeID
		proof.TokenId = tokenId
		_, err = o.Insert(&proof)
		if err != nil {
			return errors.New("insert proof error!...")
		}
	} else {
		goto createTokenId
	}

	_, err = o.Insert(asset)
	if err != nil {
		return err
	}
	//批量修改
	_, err = o.QueryTable(new(models.AssetFile).TableName()).Filter("Id__in", reqAssetSubmit.UplodFileList).Update(orm.Params{
		"AssetsId": snoyFlakeID, "IsValid": 1,
	})

	if err != nil {

		return err
	}

	return nil
}

func (this *AssetsService) SaveAssetsFile(ipfsVo *vo.UploadIpfsVo) int {
	assetFile := &models.AssetFile{}
	copier.Copy(assetFile, ipfsVo)
	assetFile.IsValid = 0
	assetFile.IsDelete = 0
	assetFile.CreateTime = time.Now().Unix()

	o := orm.NewOrm()

	id, _ := o.Insert(assetFile)

	return int(id)
}
