package models

type Order struct {
	Id            int
	Buyer         int64 //购买人
	Seller        int64 //出售人
	AssetsId      uint64
	Price         string
	IsAppealed    int
	Status        int
	Multisig      string
	CreateTime    int64
	TxHash        string
	SellerAddress string
	BuyerAddress  string
	TxStatus      int
	TxTime        int64
}

//订单表
func (m *Order) TableName() string {
	return TableName("order")
}
