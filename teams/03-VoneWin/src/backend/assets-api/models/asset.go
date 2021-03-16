package models

type Asset struct {
	Id            uint64
	AssetName     string
	AssetType     int
	CategoryId    int
	SubCategoryId int
	Describe      string
	Tag           string
	Owner         int64
	UserId        int64
	Price         string
	Cover         string
	TotalSize     int
	TotalHash     string
	IsVerify      int
	IsProof       int
	IsRegister    int
	IsSold        int
	IsDelete      int
	CreateTime    int64
}

//资产表
func (m *Asset) TableName() string {
	return TableName("asset")
}
