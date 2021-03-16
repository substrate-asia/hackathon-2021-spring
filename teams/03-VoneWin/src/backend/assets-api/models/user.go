package models

type User struct {
	Id            int64
	Username      string
	Password      string
	Salt          string
	NickName      string
	WalletAddress string
	Ip            string
	ApiToken      string
	LastLoginTime int
	IsLocked      int
	CreateTime    int64
}

//用户表
func (m *User) TableName() string {
	return TableName("user")
}
