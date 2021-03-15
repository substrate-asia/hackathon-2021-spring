package model

import "time"

// create addressFactory
// argument desc： transfer null，default use config option：UseDbType（mysql）
func CreateAssetFactory(sqlType string) *AssetModel {
	return &AssetModel{BaseModel: BaseModel{DB: UseDbConn(sqlType)}}
}

type AssetModel struct {
	BaseModel     `json:"-"`
	ClassId       float64   `gorm:"column:class_id" json:"classId"`
	AssetId       float64   `gorm:"column:asset_id" json:"assetId"`
	CategoryId    int       `gorm:"column:category_id" json:"categoryId"`
	Metadata      string    `gorm:"column:metadata" json:"Metadata"`
	Owner         string    `gorm:"column:owner" json:"owner"`
	Price         int       `gorm:"column:price" json:"price"`
	Name          string    `gorm:"column:name" json:"name"`
	Deposit       string    `gorm:"column:deposit" json:"deposit"`
	ExternalLinks string    `gorm:"column:external_links" json:"externalLinks"`
	Description   string    `gorm:"column:description" json:"description"`
	Status        int       `gorm:"column:status" json:"status"`
	ShelveTime    time.Time `json:"shelveTime"`
	TradeTime     time.Time `json:"trade_time"`
}

// 表名
func (u *AssetModel) TableName() string {
	return "nft_asset"
}

// create asset
func (u *AssetModel) CreateAsset(assetModel *AssetModel) bool {
	if result := u.Create(&assetModel); result.Error != nil {
		return false
	} else {
		return true
	}
}

// search asset list
func (u *AssetModel) ShowAssetList(address string, collectionId float64, categoryId float64, status float64, pageSize int, offset int) (bool, []AssetModel) {

	assetModels := make([]AssetModel, 0)
	if collectionId != 0 {
		u.Where("collection_id", collectionId)
	}
	if categoryId != 0 {
		u.Where("category_id", categoryId)
	}
	u.Where("status", status)
	if result := u.Limit(pageSize).Offset(offset).Where("address = ?", address).Order("created_at desc").Find(&assetModels); result.Error != nil {
		return false, assetModels
	} else {
		return true, assetModels
	}

}
func (u *AssetModel) GetByAssetId(id int64) (bool, AssetModel) {

	assetModel := new(AssetModel)
	assetModel.Id = id

	if result := u.Find(&assetModel); result.Error != nil {
		return false, *assetModel
	} else {
		return true, *assetModel
	}
}
