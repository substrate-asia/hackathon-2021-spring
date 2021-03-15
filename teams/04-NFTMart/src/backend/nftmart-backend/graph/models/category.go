package models

import "time"

type Category struct {
	Id     int     `gorm:"primarykey" json:"id"`
	Name   string `gorm:"column:name" json:"name"`
	Remark string `gorm:"column:remark" json:"remark"`
	Sort int `gorm:"column:sort" json:"sort"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

//  table name
func (u *Category) TableName() string {
	return "nft_category"
}

