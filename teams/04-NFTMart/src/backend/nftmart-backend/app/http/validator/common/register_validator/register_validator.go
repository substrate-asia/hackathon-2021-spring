package register_validator

import (
	"nftmart/app/core/container"
	"nftmart/app/global/consts"
	"nftmart/app/http/validator/api/home"
	"nftmart/app/http/validator/common/upload_files"
	"nftmart/app/http/validator/common/websocket"
	"nftmart/app/http/validator/web/assets"
	"nftmart/app/http/validator/web/collections"
	"nftmart/app/http/validator/web/users"
)

// 各个业务模块验证器必须进行注册（初始化），程序启动时会自动加载到容器
func RegisterValidator() {
	//创建容器
	containers := container.CreateContainersFactory()

	//  key 按照前缀+模块+验证动作 格式，将各个模块验证注册在容器
	var key string
	// Users 模块表单验证器按照 key => value 形式注册在容器，方便路由模块中调用
	key = consts.ValidatorPrefix + "UsersRegister"
	containers.Set(key, users.Register{})
	key = consts.ValidatorPrefix + "UsersLogin"
	containers.Set(key, users.Login{})
	key = consts.ValidatorPrefix + "UsersWalletLogin"
	containers.Set(key, users.WalletLogin{})
	key = consts.ValidatorPrefix + "RefreshToken"
	containers.Set(key, users.RefreshToken{})

	// Users基本操作（CURD）
	key = consts.ValidatorPrefix + "UsersShow"
	containers.Set(key, users.Show{})
	key = consts.ValidatorPrefix + "showUserByAddress"
	containers.Set(key, users.ShowUserByAddress{})
	key = consts.ValidatorPrefix + "UsersStore"
	containers.Set(key, users.Store{})
	key = consts.ValidatorPrefix + "UsersUpdate"
	containers.Set(key, users.Update{})
	key = consts.ValidatorPrefix + "UsersDestroy"
	containers.Set(key, users.Destroy{})
    // NFT collections
	key = consts.ValidatorPrefix + "createCollection"
	containers.Set(key, collections.CreateCollection{})
	key = consts.ValidatorPrefix + "showCollectionList"
	containers.Set(key, collections.ShowCollection{})
	// NFT asset
	key = consts.ValidatorPrefix + "createAsset"
	containers.Set(key, assets.CreateAssets{})
	key = consts.ValidatorPrefix + "showAsset"
	containers.Set(key, assets.ShowAsset{})
	// 文件上传
	key = consts.ValidatorPrefix + "UploadFiles"
	containers.Set(key, upload_files.UpFiles{})

	// Websocket 连接验证器
	key = consts.ValidatorPrefix + "WebsocketConnect"
	containers.Set(key, websocket.Connect{})

	// 注册门户类表单参数验证器
	key = consts.ValidatorPrefix + "HomeNews"
	containers.Set(key, home.News{})
}
