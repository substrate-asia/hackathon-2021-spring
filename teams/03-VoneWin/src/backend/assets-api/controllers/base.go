package controllers

import (
	"assets-api/models"
	"assets-api/utils"
	"errors"
	"fmt"
	"log"
	"os"
	"path"
	"strings"

	"github.com/beego/beego/v2/client/orm"
	beego "github.com/beego/beego/v2/server/web"
)

//基类控制器
type BaseController struct {
	beego.Controller
}

//空结构
type Empty struct{}

var EMPTY = Empty{}

const (
	ErrSuccess int = iota

	ErrInvalidParam

	ErrMissAppKey
	ErrMissAppSecret
	ErrInvalidAppKey
	ErrInvalidAppSecret
	ErrGenerateAppSecret
	ErrMissEMail
	ErrInvalidEMail

	ErrMissVC
	ErrInvalidVC
	ErrExpireVC
	ErrInvalidUserName // 12
	ErrUnRegUser

	ErrPWFail
	ErrMissPW
	ErrInvalidPW
	ErrUpPW

	ErrCreateToken //18
	ErrMissToken
	ErrExpireToken
	ErrInvalidToken

	ErrLogin

	ErrLockedUser // 23
	ErrCanceledUser
	ErrLockedCompany
	ErrCanceledCompany

	ErrUpDate // 27
	ErrUpFile

	ErrMissParam
	ErrLastBalance

	ErrMissCertification // 31
	ErrReqCert
	ErrGenCert
	ErrVerifyFile //hash 错误
	ErrSts

	ErrFileDown     // 下载失败 36
	ErrFilePers     // oss 持久化失败
	ErrWaitFileDown // 等下载文件

	ErrUploadAssetsFile //上传失败
)

type DataResponse struct {
	ErrCode int         `json:"errcode"`
	Msg     string      `json:"msg"`
	Data    interface{} `json:"data"`
}

//定义接口返回方法
func (this *BaseController) JsonResult(Code int, Msg string, Data interface{}) {
	r := DataResponse{Code, Msg, Data}
	this.Data["json"] = r
	this.ServeJSON()
	this.StopRun()
}

func (this *BaseController) StringResult(Msg string) {
	this.Ctx.WriteString(Msg)
	this.StopRun()
}

//Hello World
func (this *BaseController) HelloApi() {
	this.JsonResult(0, "Hello, Assets API", EMPTY)
}

//验证api_token，并返回用户ID
func (this *BaseController) IdentityAuth() int64 {
	user := models.User{}
	jwt := strings.TrimSpace(this.Ctx.Request.Header.Get("Authorization"))
	if "" == jwt { //游客
		return int64(0)
	}

	jwt = strings.TrimPrefix(jwt, "Bearer ")
	isCorrect := utils.CheckToken(jwt)
	if !isCorrect {
		this.JsonResult(2, "请重新登录~", "")
	}

	jclaim, err := utils.ParseJwt(jwt)
	//未授权访问
	if nil == jclaim || err != nil {
		this.JsonResult(2, "请重新登录~", "")
	}

	orm.NewOrm().QueryTable(new(models.User).TableName()).Filter("Id", jclaim.UserId).One(&user, "Id", "ApiToken")
	//登录已过期
	if 0 == user.Id {
		this.JsonResult(2, "请重新登录~", "")
	}
	if user.ApiToken != jclaim.StandardClaims.Id {
		this.JsonResult(2, "无效的Token~", "")
	}
	return user.Id
}

//公共上传文件
func (this *BaseController) UploadFile(filename string, savePath string, allowExtType int, allowMaxSize int, isRename bool) (string, int, error) {

	f, h, _ := this.GetFile(filename)
	if h == nil {
		return "", 0, errors.New("未选择文件~")
	}
	defer f.Close()
	//beego.Debug("进入公共上传文件，参数：filename:", h.Filename, "rootPath:", savePath)
	fileSuffix := strings.ToLower(path.Ext(h.Filename)) //获取文件后缀

	//验证后缀名是否符合要求
	var allowExtMap map[string]bool
	switch allowExtType {
	case 1: //图片
		suffix := map[string]bool{
			".jpg":  true,
			".png":  true,
			".jpeg": true,
		}
		allowExtMap = suffix
	case 2: //音视频
		suffix := map[string]bool{
			".mp3":  true,
			".mp4":  true,
			".mov":  true,
			".rmvb": true,
			".arm":  true,
			".wma":  true,
		}
		allowExtMap = suffix
	case 3: //文档
		suffix := map[string]bool{
			".txt":  true,
			".doc":  true,
			".docx": true,
			".ppt":  true,
			".pptx": true,
		}
		allowExtMap = suffix
	case 4: //综合
		suffix := map[string]bool{
			".jpg":  true,
			".png":  true,
			".jpeg": true,
			".txt":  true,
			".doc":  true,
			".docx": true,
			".ppt":  true,
			".pptx": true,
			".mp3":  true,
			".mp4":  true,
			".mov":  true,
			".rmvb": true,
			".arm":  true,
			".wma":  true,
		}
		allowExtMap = suffix
	case 5: //会员中心
		suffix := map[string]bool{
			".jpg":  true,
			".png":  true,
			".jpeg": true,
			".pdf":  true,
		}
		allowExtMap = suffix
	}

	if _, ok := allowExtMap[fileSuffix]; !ok && 0 != allowExtType {
		return "", 0, errors.New("文件后缀名不符合上传要求~")
	}
	//验证文件的大小是否符合要求
	if int(h.Size) > allowMaxSize && 0 != allowMaxSize {
		return "", 0, errors.New("文件不能超过" + string(allowMaxSize) + "Byte~")
	}

	newFileName := ""
	if isRename { //是否重命名
		newFileName = utils.GetRandomString(8) + fileSuffix
	} else {
		newFileName = h.Filename
	}
	//savePath := rootPath + "/" + time.Unix(time.Now().Unix(), 0).Format("200601/02/")
	_, err := os.Stat(savePath)
	if nil != err {
		err := os.MkdirAll(savePath, 0777)
		if nil != err {
			return "创建目录失败~", 0, nil
		}
	}
	fullPath := savePath + newFileName
	err = this.SaveToFile("upfile", fullPath)
	if nil != err {
		fmt.Println(err.Error())
		return "", 0, err
	}
	log.Println("公共上传文件成功！")
	return fullPath, int(h.Size), nil

}
