package models

type Subscribe struct {
	Id         int
	TxHash     string
	TxType     int8
	Status     int8
	CreateTime int64
}


//资产表
func (m *Subscribe) TableName() string {
	return TableName("subscribe")
}