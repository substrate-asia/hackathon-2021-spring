package services

import (
	"assets-api/utils"
	"bytes"
	"github.com/swdee/srkeyring"
	"io/ioutil"
	"math/rand"
	"encoding/hex"
	"fmt"
	"github.com/fogleman/gg"
	"github.com/nfnt/resize"
	"os"
	"strconv"
	"strings"
	"time"
	beego "github.com/beego/beego/v2/server/web"
	"github.com/skip2/go-qrcode"
	shell "github.com/ipfs/go-ipfs-api"

)

var sh *shell.Shell
var ipfsVisitUrl string

func init() {
	ipfsUrl, _ := beego.AppConfig.String("ipfs::ipfsUrl")
	ipfsVisit, _ := beego.AppConfig.String("ipfs::ipfsVisitUrl")
	ipfsVisitUrl = ipfsVisit
	sh = shell.NewShell(ipfsUrl)
	fmt.Println("初始化ipfs链接", sh)
}

type BaseService struct {
}

//存证数据保管函
func (this *BaseService) ImageNotary( Username, FileName, OrderNo, Hash, Tx, BlcokID, BlcokTime, createTime string, Types int) string {
	const W = 745
	const H = 1056
	var images string
	im, err := gg.LoadImage("static/letter_resource/images/05.png")
	if err != nil {
		fmt.Println("获取存证原图信息异常:", err)
		images = "static/letter_resource/images/05.png"
		return images
	}
	dc := gg.NewContext(W, H)
	dc.SetRGB(0, 0, 0)
	dc.Clear()
	dc.SetRGB(0, 0, 0)
	if err := dc.LoadFontFace("static/letter_resource/fonts/ArialUnicode.ttf", 20); err != nil {
		fmt.Println("获取存证字体信息异常:", err)
		images = "static/letter_resource/images/05.png"
		return images
	}
	dc.DrawRoundedRectangle(0, 0, 200, 200, 0)
	//
	dc.DrawImage(im, 0, 0)
	//标题1
	dc.DrawStringWrapped("自存证时间起，数据文件由Assets-Trust公证处进行保管，", W/2.2, H/3.8, 0.5, 0.5, W/2, 1.5, 0)
	if Types == 1 {
		//标题2
		dc.DrawStringWrapped("且数据完整未被篡改。与存证数据对应的时间信息由国家授时", W/2.5, H/3.4, 0.5, 0.5, W/2, 1.5, 0)
		//标题3
		dc.DrawStringWrapped("中心可信时间服务证明可信。", W/2.5, H/3.1, 0.5, 0.5, W/2, 1.5, 0)
	} else {
		//标题2
		dc.DrawStringWrapped("且数据完整未被篡改。", W/2.5, H/3.4, 0.5, 0.5, W/2, 1.5, 0)
	}
	dc.DrawStringWrapped("企业名称:", W/2.5, H/2.6, 0.5, 0.5, W/2, 1.5, 0)
	dc.DrawStringWrapped("使用账号:", W/2.5, H/2.3, 0.5, 0.5, W/2, 1.5, 0)
	dc.DrawStringWrapped("证据名称:", W/2.5, H/2.05, 0.5, 0.5, W/2, 1.5, 0)
	dc.DrawStringWrapped("存证时间:", W/2.5, H/1.86, 0.5, 0.5, W/2, 1.5, 0)
	dc.DrawStringWrapped("存证编号:", W/2.5, H/1.72, 0.5, 0.5, W/2, 1.5, 0)
	dc.DrawStringWrapped("电子数据指纹:", W/2.5, H/1.58, 0.5, 0.5, W/2, 1.5, 0)
	if Types == 1 {
		dc.DrawStringWrapped("可信时间凭证号:", W/2.5, H/1.45, 0.5, 0.5, W/2, 1.5, 0)
	}
	if err := dc.LoadFontFace("static/letter_resource/fonts/SimSun.ttf", 20); err != nil {
		panic(err)
	}
	//处理换行
	Name := "Assets Trust科技有限公司"
	ResName := []rune(Name)
	if len(ResName) >= 0 && len(ResName) <= 19 {
		dc.DrawStringWrapped(Name, W/1.6, H/2.6, 0.5, 0.5, W/2, 1.5, 0)
	} else {
		NameNew := ""
		if len(ResName) > 19 && len(ResName) < (19+16) {
			NameNew = utils.SubString(Name, 0, 19) + "\n" + utils.SubString(Name, 19, 17)
		} else {
			NameNew = utils.SubString(Name, 0, 19) + "\n" + utils.SubString(Name, 19, 17) + "..."
		}
		dc.DrawStringWrapped(NameNew, W/1.6, H/2.55, 0.5, 0.5, W/2, 1.9, 0)
	}
	ResUsername := []rune(Username)
	if len(ResUsername) >= 0 && len(ResUsername) <= 38 {
		dc.DrawStringWrapped(Username, W/1.6, H/2.3, 0.5, 0.5, W/2, 1.5, 0)
	} else {
		UsernameNew := ""
		if len(ResUsername) > 38 && len(ResUsername) < (38+34) {
			UsernameNew = utils.SubString(Username, 0, 38) + "\n" + utils.SubString(Username, 38, 35)
		} else {
			UsernameNew = utils.SubString(Username, 0, 38) + "\n" + utils.SubString(Username, 38, 35) + "..."
		}
		dc.DrawStringWrapped(UsernameNew, W/1.6, H/2.25, 0.5, 0.5, W/2, 1.7, 0)
	}
	ResFileName := []rune(FileName)
	if len(ResFileName) >= 0 && len(ResFileName) <= 19 {
		dc.DrawStringWrapped(FileName, W/1.6, H/2.05, 0.5, 0.5, W/2, 1.5, 0)
	} else {
		FileNameNew := ""
		if len(ResFileName) > 19 && len(ResFileName) < (19+16) {
			FileNameNew = utils.SubString(FileName, 0, 19) + "\n" + utils.SubString(FileName, 19, 17)
		} else {
			FileNameNew = utils.SubString(FileName, 0, 19) + "\n" + utils.SubString(FileName, 19, 17) + "..."
		}

		dc.DrawStringWrapped(FileNameNew, W/1.6, H/2.02, 0.5, 0.5, W/2, 1.7, 0)
	}
	dc.DrawStringWrapped(createTime, W/1.6, H/1.86, 0.5, 0.5, W/2, 1.5, 0)
	dc.DrawStringWrapped(OrderNo, W/1.6, H/1.72, 0.5, 0.5, W/2, 1.5, 0)
	ResHash := []rune(Hash)
	if len(ResHash) >= 0 && len(ResHash) <= 38 {
		dc.DrawStringWrapped(Hash, W/1.6, H/1.58, 0.5, 0.5, W/2, 1.5, 0)
	} else {
		HashNew := utils.SubString(Hash, 0, 38) + "\n" + utils.SubString(Hash, 38, 35)
		dc.DrawStringWrapped(HashNew, W/1.6, H/1.55, 0.5, 0.5, W/2, 1.9, 0)
	}
	if Types == 1 {
		ResTx := []rune(Tx)
		if len(ResTx) >= 0 && len(ResTx) <= 38 {
			dc.DrawStringWrapped(Tx, W/1.6, H/1.45, 0.5, 0.5, W/2, 1.5, 0)
		} else {
			TxNew := utils.SubString(Tx, 0, 38) + "\n" + utils.SubString(Tx, 38, 35)
			dc.DrawStringWrapped(TxNew, W/1.6, H/1.42, 0.5, 0.5, W/2, 1.9, 0)
		}
	}
	//公证处时间
	dc.DrawStringWrapped(BlcokID, W/1.65, H/1.18, 0.5, 0.5, 0, 0, 0)
	ResBlcokID := []rune(BlcokID)
	if len(ResBlcokID) >= 0 && len(ResBlcokID) <= 8 {
		dc.DrawStringWrapped(BlcokID, W/1.6, H/1.18, 0.5, 0.5, 0, 0, 0)
	} else {
		BlcokIDNew := utils.SubString(BlcokID, 0, 8)
		BlcokIDNew1 := utils.SubString(BlcokID, 8, 8)
		ResBlcokID1 := []rune(BlcokIDNew1)
		dc.DrawStringWrapped(BlcokIDNew, W/1.65, H/1.22, 0.5, 0.5, 0, 0, 0)
		if len(ResBlcokID1) >= 0 && len(ResBlcokID1) == 1 {
			dc.DrawStringWrapped(BlcokIDNew1, W/1.43, H/1.18, 0.5, 0.5, 0, 0, 0)
		} else if len(ResBlcokID1) >= 0 && len(ResBlcokID1) == 2 {
			dc.DrawStringWrapped(BlcokIDNew1, W/1.46, H/1.18, 0.5, 0.5, 0, 0, 0)
		} else if len(ResBlcokID1) >= 0 && len(ResBlcokID1) == 3 {
			dc.DrawStringWrapped(BlcokIDNew1, W/1.48, H/1.18, 0.5, 0.5, 0, 0, 0)
		} else if len(ResBlcokID1) >= 0 && len(ResBlcokID1) == 4 {
			dc.DrawStringWrapped(BlcokIDNew1, W/1.52, H/1.18, 0.5, 0.5, 0, 0, 0)
		} else if len(ResBlcokID1) >= 0 && len(ResBlcokID1) == 5 {
			dc.DrawStringWrapped(BlcokIDNew1, W/1.55, H/1.18, 0.5, 0.5, 0, 0, 0)
		} else if len(ResBlcokID1) >= 0 && len(ResBlcokID1) == 6 {
			dc.DrawStringWrapped(BlcokIDNew1, W/1.58, H/1.18, 0.5, 0.5, 0, 0, 0)
		} else if len(ResBlcokID1) >= 0 && len(ResBlcokID1) == 7 {
			dc.DrawStringWrapped(BlcokIDNew1, W/1.62, H/1.18, 0.5, 0.5, 0, 0, 0)
		} else if len(ResBlcokID1) >= 0 && len(ResBlcokID1) == 8 {
			dc.DrawStringWrapped(BlcokIDNew1, W/1.65, H/1.18, 0.5, 0.5, 0, 0, 0)
		} else {
			dc.DrawStringWrapped(BlcokIDNew1, W/1.65, H/1.18, 0.5, 0.5, 0, 0, 0)
		}
	}
	//时间
	dc.DrawStringWrapped(BlcokTime, W/1.6, H/1.14, 0.5, 0.5, 0, 0, 0)
	//可信时间戳图调整
	if Types == 1 {
		time_stamp := "static/letter_resource/images/07.png"
		imt, err := gg.LoadImage(time_stamp)
		if err != nil {
			fmt.Println("存证加载时间戳图异常:", err)
			images = "static/letter_resource/images/05.png"
			return images
		}
		//进行图片等比例缩放(放大)
		dst := resize.Resize(0, uint(120), imt, resize.Lanczos3)
		dc.DrawImage(dst, 120, 830)
	}
	//公章信息
	var qrcode_image string
	qrcode_image = "static/letter_resource/images/04.png"
	ims, err := gg.LoadImage(qrcode_image)
	if err != nil {
		fmt.Println("存证公章加载异常:", err)
		images = "static/letter_resource/images/05.png"
		return images
	}
	dsts := resize.Resize(0, uint(210), ims, resize.Lanczos3)
	dc.DrawImage(dsts, 436, 768)
	dc.Clip()
	//创建路径地址
	nowTime := time.Now().Unix()
	filepath := "." + "/" + "upload/"  + "proof" + "/"

	_, err = os.Stat(filepath)
	if nil != err {
		fmt.Println("存证进行时-文件夹不存在进行创建操作:", err)
		err := os.MkdirAll(filepath, 0777)
		if nil != err {
			fmt.Println("创建存证目录异常:", err)
			images = "static/letter_resource/images/05.png"
			return images
		}
	}
	newFile := ("letter_"+strconv.FormatInt(nowTime, 10)) + ".png"
	images = filepath + newFile
	err = dc.SavePNG(images)
	if nil != err {
		fmt.Println("存证保存新的画布图片异常:", err)
		images = "static/letter_resource/images/05.png"
		return images
	}
	ff, _ := ioutil.ReadFile(images)
	_, url, err:= UploadToIpfs(ff)
	if err != nil{
		return ""
	}
	return url
}

//执行封装图片加上文字水印的效果(PC端)
func  (this *BaseService) ImageWordPC( WorksId,Name,Obligee,Types,AuthorName,pubSize,BlcokID, BlcokTime ,WorkHash string) string{
	const S = 1702
	const W = 2269
	var images string
	im, err := gg.LoadImage("static/certificate_resource/images/03.png")
	if err != nil {
		// log.Fatal(err)
		images  = "static/certificate_resource/images/03.png"
	}
	dc := gg.NewContext(S, W)
	if err := dc.LoadFontFace("static/certificate_resource/fonts/ArialBold.ttf", 30); err != nil {
		// panic(err)
		images  = "static/certificate_resource/images/03.png"
	}
	dc.DrawRoundedRectangle(0, 0, 200, 200, 0)
	//
	dc.DrawImage(im, 0, 0)
	//证书ID
	dc.SetHexColor("#BB9C65")
	dc.DrawStringWrapped(WorksId, S/4.8, W/3.75, 0.5, 0.5,0,0,0)
	if err := dc.LoadFontFace("static/certificate_resource/fonts/ArialUnicode.ttf", 35); err != nil {
		panic(err)
	}
	dc.SetHexColor("#030303")
	var Obligee_new,Name_new,AuthorNam_new string
	// 去除空格
	Obligee = strings.Replace(Obligee, " ", "", -1)
	Obligee = strings.Replace(Obligee, "  ", "", -1)
	// 去除换行符
	Obligee = strings.Replace(Obligee, "\n", "", -1)
	Obligee = strings.Replace(Obligee, "\r", "", -1)
	res_Obligee := []rune(Obligee)
	if (len(res_Obligee) >= 0 && len(res_Obligee) <= 20){
		//权利人
		dc.DrawStringWrapped(Obligee, S/2.25, W/3.11, 0.5, 0.5,0,0,0)
	}else{
		Obligee_new  = utils.SubString(Obligee,0,20)+"\n"+utils.SubString(Obligee,21,19)
		//权利人
		dc.DrawStringWrapped(Obligee_new, S/2.25, W/3.03, 0.5, 0.5,0,1.7,0)
	}
	// 去除空格
	Name = strings.Replace(Name, " ", "", -1)
	Name = strings.Replace(Name, "  ", "", -1)
	// 去除换行符
	Name = strings.Replace(Name, "\n", "", -1)
	Name = strings.Replace(Name, "\r", "", -1)
	res_Name := []rune(Name)
	if (len(res_Name) >= 0 && len(res_Name) <= 20){
		//作品名称
		dc.DrawStringWrapped(Name, S/2.25, W/2.75, 0.5, 0.5,0,0,0)
	}else{
		Name_new  = utils.SubString(Name,0,20)+"\n"+utils.SubString(Name,21,19)
		//作品名称
		dc.DrawStringWrapped(Name_new, S/2.25, W/2.69, 0.5, 0.5,0,1.7,0)
	}
	//作品类型
	dc.DrawStringWrapped(Types, S/2.25, W/2.48, 0.5, 0.5,0,0,0)
	// 去除空格
	AuthorName = strings.Replace(AuthorName, " ", "", -1)
	AuthorName = strings.Replace(AuthorName, "  ", "", -1)
	// 去除换行符
	AuthorName = strings.Replace(AuthorName, "\n", "", -1)
	AuthorName = strings.Replace(AuthorName, "\r", "", -1)
	res_AuthorName := []rune(AuthorName)
	if (len(res_AuthorName) >= 0 && len(res_AuthorName) <= 20){
		//作者名称
		dc.DrawStringWrapped(AuthorName, S/2.25, W/2.25, 0.5, 0.5,0,0,0)
	}else{
		AuthorNam_new  = utils.SubString(AuthorName,0,19)
		//作者名称
		dc.DrawStringWrapped(AuthorNam_new, S/2.25, W/2.25, 0.5, 0.5,0,0,0)
	}
	//存证平台
	var platform string
	value, err:= beego.AppConfig.String("copyrightplatform")
	if err != nil{
		panic(err)
	}
	if  value == ""{
		platform = "Assets-Trust科技有限公司"
	}else{
		platform, err= beego.AppConfig.String("copyrightplatform")
	}
	dc.DrawStringWrapped(platform, S/2.25, W/2.06, 0.5, 0.5,0,0,0)
	//文件大小
	dc.DrawStringWrapped(pubSize+"(字节)", S/2.25, W/1.9, 0.5, 0.5,0,0,0)
	//存证时间
	dc.DrawStringAnchored(BlcokTime, S/1.87, W/1.76, 0.5, 0.5)
	if err := dc.LoadFontFace("static/certificate_resource/fonts/SimSun.ttf", 35); err != nil {
		panic(err)
	}
	//区块链Hash
	dc.DrawStringWrapped(BlcokID, S/5.6, W/1.34, 0.5, 0.5,0,0,0)
	//执行存证Hash水印
	var qrcode_image,httpurl  string
	qrcode_image = "static/certificate_resource/copyright/qrcode/qrcode.png"
	values, err:= beego.AppConfig.String("runmode")
	if values == "prod"{
		httpurl, err = beego.AppConfig.String("copyrighturlqrcodemain")
	}else{
		httpurl, err= beego.AppConfig.String("copyrighturlqrcodedev")
	}
	if err != nil{
		panic(err)
	}
	//可信时间戳图调整
	time_stamp := "static/letter_resource/images/07.png"
	imt, err := gg.LoadImage(time_stamp)
	if err != nil {
		fmt.Println("存证加载时间戳图异常:", err)
		images = "static/letter_resource/images/05.png"
		return images
	}
	//进行图片等比例缩放(放大)
	dst := resize.Resize(0, uint(120), imt, resize.Lanczos3)
	dc.DrawImage(dst, 260, 1800)


	qrcode := qrcode.WriteFile(httpurl+WorkHash, qrcode.Medium, 180, qrcode_image)
	if qrcode != nil {
		qrcode_image = "static/certificate_resource/images/01.png"
	}
	ims, err := gg.LoadImage(qrcode_image)
	dc.DrawImage(ims, 772, 1420)
	dc.Clip()
	//创建路径地址
	nowTime := time.Now().Unix()
	filepath := "." + "/" + "upload/"  + "proof" + "/"
	err = os.MkdirAll(filepath, 0777)
	if err != nil {
		images  = "static/certificate_resource/images/03.png"
	}else{
		newFile := ("cert_"+ strconv.FormatInt(nowTime, 10)) + ".png"
		images  = filepath+newFile
	}
	dc.SavePNG(images)
	ff, _ := ioutil.ReadFile(images)
	_, url, err:= UploadToIpfs(ff)
	if err != nil{
		return ""
	}
	return url
}


func RandHex(n int) []byte {
	if n <= 0 {
		return []byte{}
	}
	var need int
	if n & 1 == 0 { // even
		need = n
	} else { // odd
		need = n + 1
	}
	size := need / 2
	dst := make([]byte, need)
	src := dst[size:]
	if _, err := rand.Read(src[:]); err != nil {
		return []byte{}
	}
	hex.Encode(dst, src)
	return dst[:n]
}

func UploadToIpfs( buffer []byte) (string, string, error){

	ipfsHash, err := sh.Add(bytes.NewReader(buffer))
	if err != nil && len(ipfsHash) == 0 {
		fmt.Println("上传到ipfs失败", err)
		return "","", err
	}

	ipfsUrl := ipfsVisitUrl + ipfsHash
	return ipfsHash, ipfsUrl, err
}

func (this *BaseService)TrustedTimeNumber() string{
	secretURI := "silent budget wild stairs change evidence embrace hope process churn average pet"
	kr, _ := srkeyring.FromURI(secretURI, srkeyring.NetSubstrate{})
	time := strconv.FormatInt(time.Now().Unix(),10,)
	msg := []byte(time)
	fmt.Println(msg)
	sig, _:= kr.Sign(kr.SigningContext(msg))
	trustedTime := hex.EncodeToString(sig[:])
	return "NO_"+ trustedTime[10:18]
}


