package models

import "time"

type Asset struct {
	Id     int     `gorm:"primarykey" json:"id"`
	ClassId   int `gorm:"column:class_id" json:"classId"`
	AssetId   int `gorm:"column:asset_id" json:"assetId"`
	CategoryId    int `gorm:"column:category_id" json:"categoryId"`
	Metadata string `gorm:"column:metadata" json:"Metadata"`
	Owner string `gorm:"column:owner" json:"owner"`
	Price   int `gorm:"column:price" json:"price"`
	Name   string `gorm:"column:name" json:"name"`
	Deposit string `gorm:"column:deposit" json:"deposit"`
	ExternalLinks string `gorm:"column:external_links" json:"externalLinks"`
	Description string `gorm:"column:description" json:"description"`
	Status int `gorm:"column:status" json:"status"`
	ShelveTime  time.Time `json:"shelveTime"`
	TradeTime time.Time `json:"trade_time"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// table name
func (u *Asset) TableName() string {
	return "nft_asset"
}

