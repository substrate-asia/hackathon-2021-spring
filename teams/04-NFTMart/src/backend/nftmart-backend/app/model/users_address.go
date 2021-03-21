package model


// create addressFactory
// argument desc： transfer null，default use config option：UseDbType（mysql）
func CreateAddressFactory(sqlType string) *UsersAddressModel {
	return &UsersAddressModel{BaseModel: BaseModel{DB: UseDbConn(sqlType)}}
}

type UsersAddressModel struct {
	BaseModel `json:"-"`
	UserId    int64 `gorm:"column:user_id" json:"user_id"`
	Address   string `gorm:"column:address" json:"address"`
}

// 表名
func (u *UsersAddressModel) TableName() string {
	return "nft_user_address"
}

func (u *UsersAddressModel) Save(userId int64, pubKey string) bool {
	userAddress :=UsersAddressModel{
		UserId:userId,
		Address:pubKey,
	}
	if result := u.Create(&userAddress); result.Error != nil {
		return false
	}else{
		return true
	}

}

