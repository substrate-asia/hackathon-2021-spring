package models

type Proof struct {
	Id          uint
	AssetsId    uint64
	UserId      int64
	ProofNo     string
	AssetsType  int
	TokenId     int64
	TotalHash   string
	TotalSize   int
	TxHash      string
	NftHash     string
	ProofBook   string
	Letter      string
	BlockHeight int64 //区块高度
	BlockTime   int64 //区块生成时间
	CreateTime  int64
}

//资产存证表
func (m *Proof) TableName() string {
	return TableName("proof")
}
