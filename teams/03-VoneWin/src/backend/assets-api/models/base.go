package models

import (
	"log"

	"github.com/beego/beego/v2/client/orm"
	beego "github.com/beego/beego/v2/server/web"
	_ "github.com/go-sql-driver/mysql"
)

func init() {
	dbHost, _ := beego.AppConfig.String("mysql::dbhost")
	dbPort, _ := beego.AppConfig.String("mysql::dbport")
	dbUser, _ := beego.AppConfig.String("mysql::dbuser")
	dbPwd, _ := beego.AppConfig.String("mysql::dbpwd")
	dbName, _ := beego.AppConfig.String("mysql::dbname")

	if dbPort == "" {
		dbPort = "3306"
	}
	orm.RegisterDriver("mysql", orm.DRMySQL)
	dns := dbUser + ":" + dbPwd + "@tcp(" + dbHost + ":" + dbPort + ")/" + dbName + "?charset=utf8&loc=Asia%2FShanghai"
	log.Println(dns)
	orm.RegisterDataBase("default", "mysql", dns)
	orm.RegisterModel(
		new(Asset),
		new(AssetFile),
		new(Category),
		new(Subscribe),
		new(Order),
		new(Proof),
		new(User),
	)
	orm.RunSyncdb("default", false, true) //自动建表
	runMode, _ := beego.AppConfig.String("runmode")
	if "dev" == runMode {
		orm.Debug = true
	}
}

//返回带前缀的表名
func TableName(str string) string {
	dbPrefix, _ := beego.AppConfig.String("mysql::dbprefix")
	return dbPrefix + str
}
