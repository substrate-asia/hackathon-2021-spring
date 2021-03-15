package models

import "time"

type Collection struct {
	Id     int     `gorm:"primarykey" json:"id"`
	ClassId   int `gorm:"column:class_id" json:"classId"`
	CategoryId int `gorm:"column:category_id" json:"categoryId"`
	Metadata string `gorm:"column:metadata" json:"Metadata"`
	Owner string `gorm:"column:owner" json:"owner"`
	TotalIssuance int `gorm:"column:total_issuance" json:"totalIssuance"`
	Deposit string `gorm:"column:deposit" json:"deposit"`
	Properties int `gorm:"column:properties" json:"properties"`
	Name string `gorm:"column:name" json:"name"`
	Description string `gorm:"column:description" json:"description"`
	ShelveTime  time.Time `json:"shelveTime"`
	TradeTime time.Time `json:"tradeTime"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// table name
func (u *Collection) TableName() string {
	return "nft_collection"
}

