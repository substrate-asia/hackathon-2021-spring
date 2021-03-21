package services

import (
	"assets-api/models"
	"errors"
	"fmt"
	"github.com/beego/beego/v2/client/orm"
	"github.com/jinzhu/copier"
	"github.com/swdee/srkeyring"
	"math/rand"
	"strconv"
	"time"
)

type ChainService struct {
	BaseService
}

//存证
func (this *ChainService) Proof() {

}

//多签
func (this *ChainService) Multisig() {

}

//转账VOT 如水龙头功能
func (this *ChainService) Transfer() {

}

//交易状态监听
func (this *ChainService) ListeningChainState() {

}

//验证签名结果是否正确
func (this *ChainService) CheckSignature(signature [64]byte, ss58Address, message string) bool {
	// create new keyring from SS58 public address to verify message signature
	verkr, _ := srkeyring.FromURI(ss58Address, srkeyring.NetSubstrate{})
	return verkr.Verify(verkr.SigningContext([]byte(message)), signature)
}

//链交易记录
func (this *ChainService) ChainSubscribe(chainRecord *models.ReqChainNotice) (*models.ResChainNotice, error) {
	scbscribe := &models.Subscribe{}
	copier.Copy(scbscribe, chainRecord)
	scbscribe.CreateTime = time.Now().Unix()

	o := orm.NewOrm()

	_, err := o.Insert(scbscribe)
	if err != nil {
		return nil, errors.New("insert error")
	}
	return &models.ResChainNotice{chainRecord.TxHash}, nil
}

//链交易记录
func (this *ChainService) ChainNotice(chainRecord *models.ReqChainNotice, userId int64) (*models.ResChainNotice, error) {
	myAsset := models.Asset{}
	o := orm.NewOrm()
	assetsId, err := strconv.ParseUint(chainRecord.AssetsId, 10, 64)
	if err != nil {
		return nil, errors.New("assetsId params error!...")
	}
	// 查询资产信息
	err = o.QueryTable("tb_asset").Filter("Id", assetsId).One(&myAsset)
	if err != nil {
		return nil, errors.New("query asset data error")
	}
	// 资产交易类型分类
	txType := chainRecord.TxType
	switch txType {
	case 1: // 存证
		// 判断资产是否与当前用户匹配
		if userId != myAsset.UserId || userId != myAsset.Owner {
			return nil, errors.New("Operation without permission！...")
		}
		_, err = proof(chainRecord, &myAsset)

	case 2: // NFT创建
		// 判断资产是否与当前用户匹配
		if userId != myAsset.UserId || userId != myAsset.Owner {
			return nil, errors.New("Operation without permission！...")
		}
		err = nftTrad(chainRecord, &myAsset, userId, nil)

	case 3: // NFT交易
		// get seller info
		seller := models.User{}
		seller.Id = myAsset.Owner
		err = o.Read(&seller)
		if err != nil {
			return nil, errors.New("get seller info error!...")
		}
		// 判断资产是否与卖方匹配
		if seller.Id == userId {
			return nil, errors.New("seller address is not match！...")
		}

		err = nftTrad(chainRecord, &myAsset, userId, &seller)

	default:
		return nil, errors.New("tx_type error!...")
	}
	if err != nil {
		return nil, err
	}

	// 更新tb_asset
	_, err = o.Update(&myAsset)
	if err != nil {
		return nil, errors.New("update asset data error!...")
	}
	return &models.ResChainNotice{chainRecord.TxHash}, nil

}

// 处理存证操作
func proof(chainRecord *models.ReqChainNotice, myAsset *models.Asset) (*models.ResProof, error) {

	o := orm.NewOrm()
	assetsId, err := strconv.ParseUint(chainRecord.AssetsId, 10, 64)
	proof := models.Proof{}
	err = o.QueryTable(new(models.Proof).TableName()).Filter("AssetsId", assetsId).One(&proof)
	if err == orm.ErrNoRows { //记录不存在
		return nil, errors.New("资产记录不存在")
	}
	if proof.CreateTime != 0 {
		return nil, errors.New("重复上传")
	}

	// 将资产存证
	proofNo := "ASS-" + strconv.FormatInt(time.Now().Unix(), 10)[4:] + "-" + string(RandHex(6))
	proofHash := chainRecord.TxHash
	blockTime := time.Unix(int64(chainRecord.BlockTime), 0).Format("2006-01-02 15:04:05")

	// 获取资产电子证书
	services := BaseService{}
	// get user info
	user := models.User{}
	user.Id = myAsset.UserId
	err = o.Read(&user)
	if err != nil {
		return nil, errors.New("get user info error!...")
	}

	var assetType string
	if myAsset.AssetType == 0 {
		assetType = "使用权"
	} else {
		assetType = "版权"
	}

	worksId := proofNo
	proofBook := services.ImageWordPC(worksId,
		myAsset.AssetName,
		user.Username,
		assetType,
		user.Username,
		strconv.Itoa(myAsset.TotalSize),
		"",
		blockTime,
		proofHash)

	// 将结果写入到tp_proof表中
	proof.UserId = myAsset.UserId
	proof.ProofNo = proofNo
	proof.AssetsType = myAsset.AssetType
	proof.TotalHash = myAsset.TotalHash
	proof.TotalSize = myAsset.TotalSize
	proof.TxHash = chainRecord.TxHash
	proof.ProofBook = proofBook
	proof.BlockHeight = chainRecord.BlockHeight
	proof.BlockTime = chainRecord.BlockTime / 1000
	proof.CreateTime = time.Now().Unix()

	// 数据表更新
	_, err = o.Update(&proof)
	if err != nil {
		return nil, errors.New("update proof data error!...")
	}

	myAsset.IsProof = 1

	result := models.ResProof{}
	result.ProofBook = proofBook

	return &result, nil
}

//处理NFT
func nftTrad(chainRecord *models.ReqChainNotice, myAsset *models.Asset, owerId int64, seller *models.User) error {
	o := orm.NewOrm()
	proof := models.Proof{}
	err := o.QueryTable(new(models.Proof).TableName()).Filter("AssetsId", chainRecord.AssetsId).One(&proof)

	// 处理铸币
	if chainRecord.TxType == 2 {
		if len(proof.NftHash) != 0 { //记录存在
			return errors.New("重复操作")
		}
		if proof.TokenId != chainRecord.TokenId {
			return errors.New("tokenId 不匹配")
		}

		// 更新 tb_asset、tb_proof
		proof.NftHash = chainRecord.TxHash
		_, err = o.Update(&proof)
		if err != nil {
			fmt.Println(err.Error())
			return errors.New("update proof data error!...")
		}

		myAsset.IsRegister = 1

	} else { // 处理交易
		if proof.TokenId != chainRecord.TokenId {
			return errors.New("tokenId is not match!")
		}

		// get buyer info
		buyer := models.User{}
		buyer.Id = owerId
		err = o.Read(&buyer)
		if err != nil {
			return errors.New("get buyer info error!...")
		}
		// 插入数据 tb_order，更新表 tb_asset、tb_proof
		order := models.Order{}
		order.TxHash = chainRecord.TxHash
		order.AssetsId, _ = strconv.ParseUint(chainRecord.AssetsId, 10, 64)
		order.Buyer = buyer.Id
		order.Seller = seller.Id
		order.SellerAddress = seller.WalletAddress
		order.BuyerAddress = buyer.WalletAddress
		order.CreateTime = time.Now().Unix()
		order.Price = myAsset.Price
		order.Status = 1
		order.TxStatus = 1
		order.TxTime = chainRecord.BlockTime / 1000
		order.IsAppealed = 0

		_, err = o.Insert(&order)
		if err != nil {
			return errors.New("insert order error")
		}

		//获取作品作者信息
		aUthorUser := models.User{}
		aUthorUser.Id = myAsset.Owner
		err = o.Read(&aUthorUser)
		if err != nil {
			return errors.New("get aUthorUser info error!...")
		}

		//给买家生成新证书
		unpdateProofCert(&proof, myAsset, &buyer, aUthorUser.Username)

		myAsset.Owner = owerId
		myAsset.IsSold = 1

		proof.UserId = owerId
		_, err = o.Update(&proof)
		if err != nil {
			return errors.New("update proof data error!...")
		}
	}

	return nil
}

func unpdateProofCert(proof *models.Proof, myAsset *models.Asset, buyer *models.User, authorName string) {

	rand.Seed(time.Now().Unix())

	// 获取资产电子证书
	services := BaseService{}
	createTime := time.Unix(int64(proof.BlockTime), 0).Format("2006-01-02 15:04:05")

	var assetType string
	if myAsset.AssetType == 0 {
		assetType = "使用权"
	} else {
		assetType = "版权"
	}

	proofBook := services.ImageWordPC(proof.ProofNo,
		myAsset.AssetName,
		buyer.Username,
		assetType,
		authorName,
		strconv.Itoa(myAsset.TotalSize),
		"",
		createTime,
		proof.TxHash)
	proof.ProofBook = proofBook
}
