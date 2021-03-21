package web

import (
	"github.com/gin-gonic/gin"
	"nftmart/app/global/consts"
	"nftmart/app/model"
	"nftmart/app/utils/response"
)

type Collections struct {
}

// search collections
func (u *Collections) ShowCollectionList(context *gin.Context) {

	pubKey := context.GetString("pubKey")

	isOk, showlist := model.CreateCollectionFactory("").ShowCollectionList(pubKey)
	if isOk == true {
		response.Success(context, consts.CurdStatusOkMsg, showlist)
	} else {
		response.Fail(context, consts.CurdSelectFailCode, consts.CurdSelectFailMsg, "")
	}
}

//add collections
func (u *Collections) CreateCollection(context *gin.Context) {
	pubKey := context.GetString("pubKey")
	name := context.GetString(consts.ValidatorPrefix + "name")
	metadata := context.GetString(consts.ValidatorPrefix + "metadata")
	describe := context.GetString(consts.ValidatorPrefix + "describe")
	categoryId := context.GetFloat64(consts.ValidatorPrefix + "categoryId")
	collectionModel := model.CollectionModel{
		Name:        name,
		Metadata:    metadata,
		Description: describe,
		CategoryId:  categoryId,
		Owner:       pubKey,
	}
	if model.CreateCollectionFactory("").CreateCollection(&collectionModel) {
		response.Success(context, consts.CurdStatusOkMsg, "")
	} else {
		response.Fail(context, consts.CurdCreatFailCode, consts.CurdCreatFailMsg, "")
	}
}
