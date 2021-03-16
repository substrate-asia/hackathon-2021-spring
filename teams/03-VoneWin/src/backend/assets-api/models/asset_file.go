package models

type AssetFile struct {
	Id         int
	AssetsId   uint64
	FileName   string
	FileType   int
	FilePath   string
	FileSize   int64
	FileHash   string
	IsValid    int
	IsDelete   int
	CreateTime int64
}

type AssetFileList []AssetFile

//资产文件表
func (m *AssetFile) TableName() string {
	return TableName("asset_file")
}
