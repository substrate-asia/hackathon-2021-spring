package web

import (
	"github.com/gin-gonic/gin"
	"nftmart/app/global/variable"
	"nftmart/app/service/upload_file"
	"nftmart/ipfs/client"
)

type Upload struct {
}

//  文件上传是一个独立模块，给任何业务返回文件上传后的存储路径即可。
// 开始上传
func (u *Upload) StartUpload(context *gin.Context) bool {
	savePath := variable.BasePath + variable.ConfigYml.GetString("FileUploadSetting.UploadFileSavePath")
	return upload_file.Upload(context, savePath)
}

//  文件上传是一个独立模块，给任何业务返回文件上传后的存储路径即可。
// 开始上传
func (u *Upload) IpfsUpload(context *gin.Context) string {
	return client.AddString("6565656")
}
