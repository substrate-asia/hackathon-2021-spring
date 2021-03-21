package models

type ResCategoryList struct {
	List  interface{} `json:"list"`
	Count int64       `json:"count"`
}

type ResCategoryAdd struct {
	LastInsertId string `json:"id"`
}

type ResCategoryBatchAdd struct {
	Lines int64 `json:"lines"`
}

type ResUserLogin struct {
	UserId   string `json:"user_id"`
	Address  string `json:"address"`
	ApiToken string `json:"api_token"`
}

type ResProof struct {
	ProofBook string `json:"proof_book"`
	Letter    string `json:"letter"`
}

type ResMyAssetsList struct {
	List  interface{} `json:"list"`
	Count int64       `json:"count"`
}

type ResMyAssetList struct {
	Id           string `json:"id"`
	AssetName    string `json:"asset_name"`
	AssetType    int    `json:"asset_type"`
	CategoryId   string `json:"category_id"`
	CategoryName string `json:"category_name"`
	Describe     string `json:"describe"`
	Tag          string `json:"tag"`
	Owner        string `json:"owner"`
	UserId       string `json:"user_id"`
	Price        string `json:"price"`
	Cover        string `json:"cover"`
	TotalHash    string `json:"total_hash"`
	IsVerify     int    `json:"is_verify"`
	IsProof      int    `json:"is_proof"`
	IsRegister   int    `json:"is_register"`
	IsSold       int    `json:"is_sold"`
	CreateTime   int    `json:"create_time"`
	TokenId      int64  `json:"token_id"`
	AssetNo      string `json:"asset_no"` //资产编码

	Username string `json:"username"`
	//附件列表
	FileLists []*FileList `json:"file_lists"`
}

type FileList struct {
	FilePath string `json:"file_path"`
	FileHash string `json:"file_hash"`
}

type Count struct {
	Num int `json:"num"`
}

//列表通用结构体
type ResCommonList struct {
	List   interface{} `json:"list"`
	Count  int         `json:"count"`
	Offset uint64      `json:"offset"`
	Limit  uint64      `json:"limit"`
}

type ResMyOrderList struct {
	Id           uint64 `json:"id"`
	AssetName    string `json:"asset_name"`
	AssetType    int    `json:"asset_type"`
	CategoryId   string `json:"category_id"`
	CategoryName string `json:"category_name"`
	Describe     string `json:"describe"`
	Tag          string `json:"tag"`
	Price        string `json:"price"`
	Cover        string `json:"cover"`
	CreateTime   int    `json:"create_time"`
	AssetNo      string `json:"asset_no"` //资产编码

	TotalHash  string `json:"total_hash"`
	IsVerify   int    `json:"is_verify"`
	IsProof    int    `json:"is_proof"`
	IsRegister int    `json:"is_register"`
	IsSold     int    `json:"is_sold"`
	ProofBook  string `json:"proof_book"` //存证证书
}

type ResAssetList struct {
	Id           string `json:"id"`
	AssetName    string `json:"asset_name"`
	AssetType    int    `json:"asset_type"`
	CategoryId   string `json:"category_id"`
	CategoryName string `json:"category_name"`
	Describe     string `json:"describe"`
	Tag          string `json:"tag"`
	Price        string `json:"price"`
	Cover        string `json:"cover"`
	UserId       string `json:"user_id"`
}

type ResAssetDetail struct {
	Id         string `json:"id"`
	AssetName  string `json:"asset_name"`
	AssetType  int    `json:"asset_type"`
	CategoryId string `json:"category_id"`
	Describe   string `json:"describe"`
	Tag        string `json:"tag"`
	Owner      string `json:"owner"`
	UserId     string `json:"user_id"`
	Price      string `json:"price"`
	Cover      string `json:"cover"`
	Username   string `json:"username"`
	NickName   string `json:"nick_name"`
	IsVerify   int    `json:"is_verify"`
	IsProof    int    `json:"is_proof"`
	IsRegister int    `json:"is_register"`
	IsSold     int    `json:"is_sold"`
	TotalHash  string `json:"total_hash"`
	TokenId    int64  `json:"token_id"`

	AssetNo       string       `json:"asset_no"`        //资产编码
	ProofBook     string       `json:"proof_book"`      //存证证书
	CreateTime    int64        `json:"create_time"`     //证书日期
	BlockHeight   uint64       `json:"block_height"`    //区块高度
	BlockTime     int64        `json:"block_time"`      //区块生成时间
	TxHash        string       `json:"tx_hash"`         //区块哈希值
	TxHistoryList []*TxHistory `json:"tx_history_list"` //交易历史
}

type TxHistory struct { //交易历史，按交易打包时间倒序排列
	TxHash        string `json:"tx_hash"`        //转账交易哈希值
	SellerAddress string `json:"seller_address"` //卖家钱包地址，需要隐藏中间几位
	BuyerAddress  string `json:"buyer_address"`  //买家钱包地址，需要隐藏中间几位
	Price         string `json:"price"`          //价格
	TxTime        string `json:"tx_time"`        //交易打包时间
}

type ResUploadIpfs struct {
	Id       int    `json:"id"`
	FilePath string `json:"file_path"` //带https的完整网址
	FileHash string `json:"file_hash"` //文件哈希
	FileSize int64  `json:"file_size"`
	FileName string `json:"file_name"`
	//FileType 	  int    `json:"file_type"`
}

type ResQueryProof struct {
	ProofBook string `json:"proof_book"`
	TxHash    string `json:"tx_hash"`
}

type ResChainNotice struct {
	TxHash string `json:"tx_hash"`
}
