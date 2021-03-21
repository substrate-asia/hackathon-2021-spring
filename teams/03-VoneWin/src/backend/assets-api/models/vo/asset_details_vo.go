package vo

type AssetDetailsVo struct {
	Id            string `json:"id"`
	AssetName     string `json:"asset_name"`
	AssetType     int    `json:"asset_type"`
	CategoryId    int    `json:"category_id"`
	CategoryName  string `json:"category_name"`
	SubCategoryId int    `json:"sub_category_id"`
	Describe      string `json:"describe"`
	Tag           string `json:"tag"`
	Owner         int    `json:"owner"`
	UserId        int64  `json:"user_id"`
	Price         string `json:"price"`
	Cover         string `json:"cover"`
	Username      string `json:"username"`
	NickName      string `json:"nick_name"`
	IsVerify      int    `json:"is_verify"`
	IsProof       int    `json:"is_proof"`
	IsRegister    int    `json:"is_register"`
	IsSold        int    `json:"is_sold"`

	AssetNo       string      `json:"asset_no"`     //资产编码
	ProofBook     string      `json:"proof_book"`   //存证证书
	CreateTime    int64       `json:"create_time"`  //证书日期
	BlockHeight   int64       `json:"block_height"` //区块高度
	BlockTime     int64       `json:"block_time"`   //区块生成时间
	TxHash        string      `json:"tx_hash"`      //区块哈希值
	TxHistoryList []TxHistory `json:"tx_history_list"`
}

type TxHistory struct {
	TxHash        string
	SellerAddress string
	BuyerAddress  string
	Price         string
	TxTime        string
}
