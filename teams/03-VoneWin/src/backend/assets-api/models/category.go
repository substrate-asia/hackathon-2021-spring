package models

type Category struct {
	Id           uint64
	CategoryName string
	ParentId     uint64
	Sort         int
}

//资产分类表
func (m *Category) TableName() string {
	return TableName("category")
}
