package models

type ReqCategoryList struct {
	Keyword  string `json:"keyword,omitempty"`
	ParentId string `json:"parent_id,omitempty"`
	Orderby  string `json:"orderby,omitempty"`
	Offset   int    `json:"offset,omitempty"`
	Limit    int    `json:"limit,omitempty"`
}

type ReqCategoryAdd struct {
	CategoryName string `json:"category_name"`
	ParentId     string `json:"parent_id"`
	Sort         int    `json:"sort"`
}

type ReqCategoryUpdate struct {
	Id           string `json:"id"`
	CategoryName string `json:"category_name"`
}

type ReqUserLogin struct {
	Username  string   `json:"username"`    //账户名
	Address   string   `json:"address"`     //钱包地址
	Message   string   `json:"message"`     //随机消息字符串，如时间戳
	Signature [64]byte `json:"sign_result"` //对message的签名结果
	SignAlg   string   `json:"sign_alg"`    //签名算法
}

//资产提交body
type ReqAssetSubmit struct {
	AssetName     string `json:"asset_name"`
	AssetType     int    `json:"asset_type"` //1-版权，2-使用权
	CategoryId    int    `json:"category_id"`
	SubCategoryId int    `json:"sub_category_id"`
	UserId        int64  `json:"user_id"`
	Describe      string `json:"describe"`
	Tag           string `json:"tag"`
	Price         string `json:"price"`
	Owner         int64  `json:"owner"`
	Cover         string `json:"cover"`
	UplodFileList []int  `json:"upload_file"`

	//FileType 	  int    `json:"file_type"`
}

// 资产存证
type ReqAssetProof struct {
	AssetsId string `json:"assets_id"`
	UserId   int64  `json:"user_id"`
	FileName string `json:"file_name"` // 名称
	ProofNo  string `json:"proof_no"`  // 存证编号
}

//资产交易body
type ReqAssetTrading struct {
	UserId        int64  `json:"user_id"`
	AssetsId      uint64 `json:"assets_id"`
	Status        int    `json:"status"`
	Multisig      string `json:"multisig"`
	TxHash        string `json:"tx_hash"`
	SellerAddress string `json:"seller_address"`
	BuyerAddress  string `json:"buyer_address"`
	TxStatus      int    `json:"tx_status"`
	TxTime        int64  `json:"tx_time"`
}

//永远资产列表
type ReqAssetList struct {
	Offset     int    `json:"offset"`
	Limit      int    `json:"limit"`
	Keyword    string `json:"keyword"`
	CategoryId string `json:"category_id"`
}

//与链交互数据
type ReqChainSubscribe struct {
	TxHash string `json:"tx_hash"`
	TxType int8   `json:"tx_type"`
}

type ReqChainNotice struct {
	TxHash      string `json:"tx_hash"`
	TxType      int8   `json:"tx_type"`
	AssetsId    string `json:"assets_id"`
	TokenId     int64  `json:"token_id"`
	BlockHeight int64  `json:"block_height""`
	BlockTime   int64  `json:"block_time"`
}
