package utils

import (
	"bytes"
	"crypto/md5"
	"crypto/sha1"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"io/ioutil"
	"math"
	"math/rand"
	"net"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/sony/sonyflake"
	"gopkg.in/gomail.v2" //邮件发送包，当然也可以用官方net/smtp包
)

func CreateOrderNo() string {
	return time.Unix(time.Now().Unix(), 0).Format("20060102150405") + CreateValidateCode(4)
}

//执行定义Md5加密
func Md5(str string) string {
	data := []byte(str)
	has := md5.Sum(data)
	return fmt.Sprintf("%x", has) //将[]byte转成16进制
}

//生成随机字符串
func GetRandomString(length int) string {
	str := "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
	bytes := []byte(str)
	result := []byte{}
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	for i := 0; i < length; i++ {
		result = append(result, bytes[r.Intn(len(bytes))])
	}
	return string(result)
}

//随机数生成,带有位数限制
func CreateValidateCode(width int) string {
	numeric := [10]byte{0, 1, 2, 3, 4, 5, 6, 7, 8, 9}
	r := len(numeric)
	rand.Seed(time.Now().UnixNano())

	var data strings.Builder
	for i := 0; i < width; i++ {
		fmt.Fprintf(&data, "%d", numeric[rand.Intn(r)])
	}
	return data.String()
}

//执行手机号的正则验证
func VerifyMobileFormat(mobileNum string) bool {
	regular := "^((13[0-9])|(14[5,7])|(15[0-3,5-9])|(17[0,3,5-8])|(18[0-9])|166|198|199|(147))\\d{8}$"

	reg := regexp.MustCompile(regular)
	return reg.MatchString(mobileNum)
}

//执行密码的正则验证(8~20)
func VerifyPasswordFormat(res string) bool {
	regular := "^[a-zA-Z0-9_\\@\\#\\$\\%\\^\\&\\*\\(\\)\\!\\,\\.\\?\\-\\+\\|\\=]{6,16}$"
	reg := regexp.MustCompile(regular)
	return reg.MatchString(res)
}

//执行验证码的正则验证(8~20)
func VerifyCodeFormat(res string) bool {
	regular := "^[0-9]{6}$"
	reg := regexp.MustCompile(regular)
	return reg.MatchString(res)
}

//执行sha1加密
func Sha1(data string) string {
	sha1 := sha1.New()
	sha1.Write([]byte(data))
	has := sha1.Sum([]byte(""))
	return fmt.Sprintf("%x", has)
}

//用户昵称的验证(16)
func VerifyNickNameFormat(mobileNum string) bool {
	regular := "^[a-zA-Z0-9_\u4e00-\u9fa5]{1,16}$"
	reg := regexp.MustCompile(regular)
	return reg.MatchString(mobileNum)
}

//身份证号的验证
func VerifyIDFormat(mobileNum string) bool {
	regular := "[1-9]\\d{5}(18|19|([23]\\d))\\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$"
	reg := regexp.MustCompile(regular)
	return reg.MatchString(mobileNum)
}

//真实姓名的验证
func VerifyRealNameFormat(mobileNum string) bool {
	regular := "^[\u4e00-\u9fa5]{2,5}$"
	reg := regexp.MustCompile(regular)
	return reg.MatchString(mobileNum)
}

//分页处理函数
func PageEditor(pageCount int, pageIndex int) []int {
	var pages []int
	if pageCount < 5 {
		pages = make([]int, pageCount)
		for i := 1; i <= pageCount; i++ {
			pages[i-1] = i
		}
	} else if pageIndex <= 3 {
		pages = make([]int, 5)
		for i := 1; i <= 5; i++ {
			pages[i-1] = i
		}
	} else if pageIndex >= pageCount-2 {
		pages = make([]int, 5)
		for i := 1; i <= 5; i++ {
			pages[i-1] = pageCount - 5 + i
		}
	} else {
		pages = make([]int, 5)
		for i := 1; i <= 5; i++ {
			pages[i-1] = pageIndex - 3 + i
		}
	}
	return pages
}

//生成一个在区间范围的随机数
func GenerateRangeNum(min, max int) int {
	// rand.Seed(time.Now().Unix())//时间戳秒，跟新的随机数相同，暂时不用
	rand.Seed(time.Now().UnixNano()) //获取纳秒
	randNum := rand.Intn(max - min)
	randNum = randNum + min
	fmt.Printf("rand is %v\n", randNum)
	return randNum
}

//SHA256生成哈希值
func GetSHA256HashCode(message []byte) string {
	//方法一：
	//创建一个基于SHA256算法的hash.Hash接口的对象
	hash := sha256.New()
	//输入数据
	hash.Write(message)
	//计算哈希值
	bytes := hash.Sum(nil)
	//将字符串编码为16进制格式,返回字符串
	hashCode := hex.EncodeToString(bytes)
	//返回哈希值
	return hashCode
	//方法二：
	//bytes2:=sha256.Sum256(message)//计算哈希值，返回一个长度为32的数组
	//hashcode2:=hex.EncodeToString(bytes2[:])//将数组转换成切片，转换成16进制，返回字符串
	//return hashcode2
}

//执行获取文件夹中的某个文件(有待改善)
func FileOne(url string) (response string) {
	dir_list, _ := ioutil.ReadDir(url)
	list := make([]map[string]interface{}, len(dir_list))
	for k, v := range dir_list {
		row := make(map[string]interface{})
		row["files"] = v.Name()
		list[k] = row
	}
	asd := len(list)
	bb := GenerateRangeNum(0, asd)
	//intrface转换string
	str := list[bb]["files"].(string)
	response = url + str
	return
}

//执行MD5对文件生成hash值
func Md5File(path string) (string, error) {
	file, err := os.Open(path)
	defer file.Close()
	if err != nil {
		return "", err
	}

	h := md5.New()
	_, err = io.Copy(h, file)
	if err != nil {
		return "", err
	}

	return fmt.Sprintf("%x", h.Sum(nil)), nil
}

//执行SHA1对文件生成hash值
func SHA1File(path string) (string, error) {
	file, err := os.Open(path)
	defer file.Close()
	if err != nil {
		return "", err
	}

	h := sha1.New()
	_, err = io.Copy(h, file)
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%x", h.Sum(nil)), nil
}

//执行SHA256对文件内容生成hash值
func SHA256File(path string) (string, error) {
	file, err := os.Open(path)
	defer file.Close()
	if err != nil {
		return "", err
	}

	h := sha256.New()
	_, err = io.Copy(h, file)
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%x", h.Sum(nil)), nil
}

//获取内网IP
func GetIntranetIp() string {
	addrs, err := net.InterfaceAddrs()
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
	for _, address := range addrs {
		// 检查ip地址判断是否回环地址
		if ipnet, ok := address.(*net.IPNet); ok && !ipnet.IP.IsLoopback() {
			if ipnet.IP.To4() != nil {
				return ipnet.IP.String()
			}
		}
	}
	return ""
}

//获取公网IP
func GetExternalIp() string {
	resp, err := http.Get("http://myexternalip.com/raw")
	if err != nil {
		return ""
	}
	defer resp.Body.Close()
	content, _ := ioutil.ReadAll(resp.Body)
	buf := new(bytes.Buffer)
	buf.ReadFrom(resp.Body)
	//s := buf.String()
	return string(content)
}

//封装邮件发送函数
func SendMail(user, password, host, to, subject, body, senderName string, port int) error {
	m := gomail.NewMessage()
	// m.SetHeader("From",user)
	m.SetAddressHeader("From", user, senderName)
	m.SetHeader("To", to)
	m.SetHeader("Subject", subject)
	m.SetBody("text/html", body)
	d := gomail.NewPlainDialer(host, port, user, password) // 发送邮件服务器、端口、发件人账号、发件人密码
	err := d.DialAndSend(m)
	return err
}

//邮箱地址验证
func VerifyEmailFormat(emailNum string) bool {
	//2020-04-23处理
	// regular := "^[0-9A-Za-z][\\.-_0-9A-Za-z]*@[\u4e00-\u9fa5_-_0-9A-Za-z]+(\\.[\u4e00-\u9fa5_0-9A-Za-z]+)+$"
	regular := "^[0-9A-Za-z][\\._-_-0-9A-Za-z]*@[\u4e00-\u9fa5_-_-0-9A-Za-z]+(\\.[\u4e00-\u9fa5_0-9A-Za-z]+)+$"
	reg := regexp.MustCompile(regular)
	return reg.MatchString(emailNum)
}

//执行电话号验证(手机号+电话号)
func VerifyPhoneFormat(phoneNum string) bool {
	regular := "^([1]\\d{10}|([\\(（]?0[0-9]{2,3}[）\\)]?[-]?)?([2-9][0-9]{6,7})+(\\-[0-9]{1,4})?)$"
	reg := regexp.MustCompile(regular)
	return reg.MatchString(phoneNum)
}

//执行营业执照号验证
func VerifylicenseFormat(license string) bool {
	regular := "^[a-zA-Z0-9]{10,20}$"
	reg := regexp.MustCompile(regular)
	return reg.MatchString(license)
}

//执行字符串部分截取的操作
func SubString(str string, begin, length int) string {
	rs := []rune(str)
	lth := len(rs)
	if begin < 0 {
		begin = 0
	}
	if begin >= lth {
		begin = lth
	}
	end := begin + length

	if end > lth {
		end = lth
	}
	return string(rs[begin:end])
}

//string转换int
func StringInt(data string) int {
	var string_int int
	if data != "" {
		string_int, _ = strconv.Atoi(data)
	} else {
		string_int = 0
	}
	return string_int
}

//int转换string
func IntString(data int) string {
	var int_string string
	int_string = strconv.Itoa(data)
	return int_string
}

//int64转换string
func Int64String(data int64) string {
	var int_string string
	int_string = strconv.FormatInt(data, 10)
	return int_string
}

//获取现在的Unix时间戳
func NowTime() int64 {
	nowtime := time.Now().Unix()
	return nowtime
}

//int64转换int
func Int64Int(data int64) int {
	var int64_int int
	int64_int, err := strconv.Atoi(strconv.FormatInt(data, 10))
	if err != nil {
		int64_int = 0
	}
	return int64_int
}

//float64转换string
func Float64String(data float64) string {
	var float64_strig string
	float64_strig = strconv.FormatFloat(data, 'f', -1, 64)
	return float64_strig
}

//获取文件大小
func FileSize(s int64) string {
	sizes := []string{"B", "KB", "MB", "GB", "TB", "PB", "EB"}
	return humanateBytes(uint64(s), 1024, sizes)
}

func humanateBytes(s uint64, base float64, sizes []string) string {
	if s < 10 {
		return fmt.Sprintf("%d B", s)
	}
	e := math.Floor(logn(float64(s), base))
	suffix := sizes[int(e)]
	val := float64(s) / math.Pow(base, math.Floor(e))
	f := "%.0f"
	if val < 10 {
		f = "%.1f"
	}
	return fmt.Sprintf(f+" %s", val, suffix)
}

func logn(n, b float64) float64 {
	return math.Log(n) / math.Log(b)
}

//string转换float64
func StringFloat64(data string) float64 {
	var string_float64 float64
	if data != "" {
		string_float64, _ = strconv.ParseFloat(data, 64)
	} else {
		string_float64 = 0
	}
	return string_float64
}

//int转换int64
func IntInt64(data int) int64 {
	var int_int64 int64
	int_int64, err := strconv.ParseInt(strconv.Itoa(data), 10, 64)
	if err != nil {
		int_int64 = 0
	}
	return int_int64
}

//字节转换mb
func BytesMB(data float64) float64 {
	var bytes_mb float64
	if data <= 0 {
		bytes_mb = 0
	} else {
		bytes_mb = data / 1024 / 1024
	}
	return bytes_mb
}

func GetRandString() string {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	randString := fmt.Sprintf("%d%0.2d%0.2d%0.2d%0.2d%0.2d%0.4d",
		time.Now().Year(),   //年
		time.Now().Month(),  //月
		time.Now().Day(),    //日
		time.Now().Hour(),   //小时
		time.Now().Minute(), //分钟
		time.Now().Second(), //秒
		r.Intn(9999),        //随机数
	)
	return randString
}

//获取本月的开始时间戳
func GetNowMonthFirst() int64 {
	now := time.Now()
	currentYear, currentMonth, _ := now.Date()
	currentLocation := now.Location()
	firstOfMonth := time.Date(currentYear, currentMonth, 1, 0, 0, 0, 0, currentLocation)
	firstOfMonthUnix := firstOfMonth.Unix()
	return firstOfMonthUnix
}

//获取本月的结束时间戳
func GetNowMonthEnd() int64 {
	now := time.Now()
	currentYear, currentMonth, _ := now.Date()
	currentLocation := now.Location()
	firstOfMonth := time.Date(currentYear, currentMonth, 1, 0, 0, 0, 0, currentLocation)
	lastOfMonth := firstOfMonth.AddDate(0, 1, -1)
	lastOfMonthUnix := lastOfMonth.Unix() + 86399
	return lastOfMonthUnix
}

//获取机器ID
func GetMachineID() (uint16, error) {
	return uint16(1), nil
}

//获取雪花ID
func GetSnoyFlakeID() uint64 {
	var sf *sonyflake.Sonyflake
	var config sonyflake.Settings
	config.MachineID = GetMachineID //传函数名即可，不需要带()
	sf = sonyflake.NewSonyflake(config)
	if sf == nil {
		panic("sonyflake not created")
	}
	id, err := sf.NextID()
	if err != nil {
		panic(err)
	}
	return id //strconv.FormatUint(id, 10)
}
