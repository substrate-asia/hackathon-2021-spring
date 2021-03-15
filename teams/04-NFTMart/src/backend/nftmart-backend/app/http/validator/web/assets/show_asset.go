package assets

import (
	"github.com/gin-gonic/gin"
	"nftmart/app/global/consts"
	"nftmart/app/http/controller/web"
	"nftmart/app/http/validator/core/data_transfer"
	"nftmart/app/utils/response"
)

type ShowAsset struct {
	CollectionId float64 `form:"collectionId" json:"collectionId"`
	CategoryId float64 `form:"categoryId" json:"categoryId"`
	Status float64 `form:"status" json:"status"`
	Page string `form:"page" json:"page"`
	PageSize string `form:"pageSize" json:"pageSize"`
}

// 验证器语法，参见 Register.go文件，有详细说明
func (s ShowAsset) CheckParams(context *gin.Context) {
	//1.基本的验证规则没有通过
	if err := context.ShouldBind(&s); err != nil {
		errs := gin.H{
			"tips": "CreateAssets参数校验失败，参数校验失败，name(>=2)、PicUrl(>8)",
			"err":  err.Error(),
		}
		response.ErrorParam(context, errs)
		return
	}

	//  该函数主要是将本结构体的字段（成员）按照 consts.ValidatorPrefix+ json标签对应的 键 => 值 形式绑定在上下文，便于下一步（控制器）可以直接通过 context.Get(键) 获取相关值
	extraAddBindDataContext := data_transfer.DataAddContext(s, consts.ValidatorPrefix, context)
	if extraAddBindDataContext == nil {
		response.ErrorSystem(context, "CollectionStore表单验证器json化失败", "")
	} else {
		// 验证完成，调用控制器,并将验证器成员(字段)递给控制器，保持上下文数据一致性
		(&web.Assets{}).ShowAssets(extraAddBindDataContext)
	}
}
