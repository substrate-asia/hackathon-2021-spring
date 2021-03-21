package model

import "time"

// create addressFactory
// argument desc： transfer null，default use config option：UseDbType（mysql）
func CreateCollectionFactory(sqlType string) *CollectionModel {
	return &CollectionModel{BaseModel: BaseModel{DB: UseDbConn(sqlType)}}
}

type CollectionModel struct {
	BaseModel     `json:"-"`
	ClassId       int       `gorm:"column:class_id" json:"classId"`
	CategoryId    float64   `gorm:"column:category_id" json:"categoryId"`
	Metadata      string    `gorm:"column:metadata" json:"Metadata"`
	Owner         string    `gorm:"column:owner" json:"owner"`
	TotalIssuance int       `gorm:"column:total_issuance" json:"totalIssuance"`
	Deposit       string    `gorm:"column:deposit" json:"deposit"`
	Properties    int       `gorm:"column:properties" json:"properties"`
	Name          string    `gorm:"column:name" json:"name"`
	Description   string    `gorm:"column:description" json:"description"`
	ShelveTime    time.Time `json:"shelveTime"`
	TradeTime     time.Time `json:"tradeTime"`
}

// table name
func (u *CollectionModel) TableName() string {
	return "nft_collection"
}

// create collections
func (u *CollectionModel) CreateCollection(collectionModel *CollectionModel) bool {
	if result := u.Create(&collectionModel); result.Error != nil {
		return false
	} else {
		return true
	}
}

// search collections list
func (u *CollectionModel) ShowCollectionList(address string) (bool, []CollectionModel) {

	collectionModels := make([]CollectionModel, 0)
	u.Model(collectionModels)
	u.Where("address = ?", address)
	if result := u.Find(&collectionModels); result.Error != nil {
		return false, collectionModels
	} else {
		return true, collectionModels
	}
}
