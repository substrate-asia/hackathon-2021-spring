package curd

import (
	"nftmart/app/model"
	"nftmart/app/utils/md5_encrypt"
)

func CreateUserCurdFactory() *UsersCurd {

	return &UsersCurd{}
}

type UsersCurd struct {
}

func (u *UsersCurd) Register(userName, pass, userIp string) bool {
	pass = md5_encrypt.Base64Md5(pass) // 预先处理密码加密，然后存储在数据库
	return model.CreateUserFactory("").Register(userName, pass, userIp)
}

func (u *UsersCurd) Store(name string, pass string, realName string, phone string, remark string) bool {

	pass = md5_encrypt.Base64Md5(pass) // 预先处理密码加密，然后存储在数据库
	return model.CreateUserFactory("").Store(name, pass, realName, phone, remark)
}

func (u *UsersCurd) Update(id float64, name string, pass string, realName string, phone string, remark string, clientIp string) bool {
	//预先处理密码加密等操作，然后进行更新
	pass = md5_encrypt.Base64Md5(pass) // 预先处理密码加密，然后存储在数据库
	return model.CreateUserFactory("").Update(id, name, pass, realName, phone, remark, clientIp)
}

func (u *UsersCurd) SaveOrUpdate(id float64, nickName string, profilePhoto string, pubKey string, email string,twitter string,clientIp string) bool {
	return model.CreateUserFactory("").SaveOrUpdate(id, nickName, profilePhoto, pubKey, email, twitter, clientIp)
}
