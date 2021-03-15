package web

import (
	"github.com/gin-gonic/gin"
	"nftmart/app/global/consts"
	"nftmart/app/model"
	"nftmart/app/utils/response"
	"strconv"
)

type Assets struct {
}

// search NFT ASSET LIST
func (u *Assets) ShowAssets(context *gin.Context) {
	pubKey := context.GetString("pubKey")
	collectionId := context.GetFloat64(consts.ValidatorPrefix + "collectionId")
	categoryId := context.GetFloat64(consts.ValidatorPrefix + "categoryId")
	status := context.GetFloat64(consts.ValidatorPrefix + "status")
	page, _ := strconv.Atoi(context.GetString(consts.ValidatorPrefix + "page"))
	pageSize, _ := strconv.Atoi(context.GetString(consts.ValidatorPrefix + "pageSize"))
	if page == 0 {
		page = 1
	}
	if pageSize == 0 {
		pageSize = 10
	}
	offset := (page - 1) * pageSize

	//offset := (page - 1) * pageSize
	isOk, showlist := model.CreateAssetFactory("").ShowAssetList(pubKey, collectionId, categoryId, status, pageSize, offset)
	if isOk == true {
		response.Success(context, consts.CurdStatusOkMsg, showlist)
	} else {
		response.Fail(context, consts.CurdSelectFailCode, consts.CurdSelectFailMsg, "")
	}
}

// CREATE NFT ASSET
func (u *Assets) CreateAsset(context *gin.Context) {
	collectionId := context.GetFloat64(consts.ValidatorPrefix + "collectionId")
	pubKey := context.GetString("pubKey")
	name := context.GetString(consts.ValidatorPrefix + "name")
	metadata := context.GetString(consts.ValidatorPrefix + "metadata")
	externalLinks := context.GetString(consts.ValidatorPrefix + "externalLinks")
	describe := context.GetString(consts.ValidatorPrefix + "describe")
	assetModel := model.AssetModel{
		ClassId:       collectionId,
		Name:          name,
		Owner:         pubKey,
		Metadata:      metadata,
		ExternalLinks: externalLinks,
		Description:   describe,
		Status:        0, // default
	}
	if model.CreateAssetFactory("").CreateAsset(&assetModel) {
		response.Success(context, consts.CurdStatusOkMsg, "")
	} else {
		response.Fail(context, consts.CurdCreatFailCode, consts.CurdCreatFailMsg, "")
	}
}

// TODO nft asset sale info setting

// TODO nft asset buy operation
