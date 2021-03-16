package vo

type AssetVo struct {
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
	IsVerify      int    `json:"is_verify"`
	IsProof       int    `json:"is_proof"`
	IsRegister    int    `json:"is_register"`
	IsSold        int    `json:"is_sold"`

	Username string `json:"username"`
	NickName string `json:"nick_name"`
}

type AssetResList []AssetVo
