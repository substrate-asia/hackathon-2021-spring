### 测试用例接口   
>   1.文档主要提供本项目骨架已经集成的Api接口使用说明。            
>   2.相关测试全部基于`postman`工具进行。     

### 默认已经集成的路由  

#### NFT业务接口
>GET    /http://127.0.0.1:20201                         

### NFT业务接口
>   1.ip、端口使用本项目默认配置，即：`http://127.0.0.1:20191`，NFT业务接口通用  
>
>   2.注意除钱包登录接口外其他接口都需要token鉴权，请在 `header` 头添加 `Authorization` 字段值，注意：该字段的值格式：Bearer (token)之间有一个空格, 这个是行业标准，网页端显示换行，不要被误导! 
>     CURD相关的其他接口格式与本接口基本一致，
####    1.钱包地址登录      
> <font color=#FF4500>*post*，http://localhost:20201/admin/users/walletlogin     </font>

参数字段|参数属性|类型|选项|默认值
---|---|---|---|---
address|form-data|string|必填|5ECKTKPyATYvKkw91xDBpn7E6HvhaZ39ehhvLbivVSiKc2ie  
> 返回示例：
```json
{
    "code": 200,
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwdWJrZXkiOiIweDEyNTQxMjU0MTg5OTk5IiwiZXhwIjoxNjE0NTIzNTUwLCJuYmYiOjE2MTQ0OTQ3NDB9.bXIAA5QYdZaH4ZP8jKiP1qB1yloaIO47AveznMtKKc8",
        "updated_at": "2021-02-28 14:45:50"
    },
    "msg": "Success"
}
```

####    2.修改用户信息     
> 表单参数验证器: [login](../app/http/validator/web/users/login.go) 
>    <font color=#FF4500>*post*，http://localhost:20201/admin/users/edit   </font>

参数字段|参数属性|类型|选项|默认值
---|---|---|---|---
Authorization|Headers|string|必填|Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOjQ3LCJ1c2VyX25hbWUiOiJnb3NrZWxldG9uMS40IiwicGhvbmUiOiIiLCJleHAiOjE2MDQwNTIxNzMsIm5iZiI6MTYwNDA0ODU2M30.YNhN9_QasHc5XILQiilZvhxpPDnmC_j82y4JfYPnI7A
nick_name|form-data|string|必填|昵称
profile_photo|form-data|string|非必填|头像
email|form-data|string|非必填|邮箱
twitter|form-data|string|非必填|推特
id|form-data|int|非必填|用户ID
> 返回示例：
```json
{
    "code": 200,
    "data": "",
    "msg": "Success"
}
```

####    3.根据钱包地址获取绑定的用户
> 此接口可获取登录的钱包地址历史绑定用户信息， 
>    <font color=#FF4500>*post*，http://localhost:20201/admin/users/getUserByAddress</font>  ，。    

参数字段|参数属性|类型|选项|默认值
---|---|---|---|---
Authorization|Headers|string|必填|Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOjQ3LCJ1c2VyX25hbWUiOiJnb3NrZWxldG9uMS40IiwicGhvbmUiOiIiLCJleHAiOjE2MDQwNTIxNzMsIm5iZiI6MTYwNDA0ODU2M30.YNhN9_QasHc5XILQiilZvhxpPDnmC_j82y4JfYPnI7A

> 返回示例：
```json
{
    "code": 200,
    "data": {
        "user_name": "",
        "nick_name": "昵称001",
        "profile_photo": "00xxsfdsfsdfsdfsdfsdf",
        "email": "www@mail.com",
        "twitter": "sfsfsfsf@isdfsdf.cn",
        "phone": "",
        "real_name": "",
        "status": 0,
        "token": "",
        "last_login_ip": "",
        "UsersAddressModels": null
    },
    "msg": "Success"
}
```

####    4.创建NFT集合
> ​    <font color=#FF4500>*post*，http://localhost:20201/admin/collections/createCollection  </font> 

参数字段|参数属性|类型|选项|默认值
---|---|---|---|---
Authorization|Headers|string|必填|Bearer 登陆后获取的token  
name|form-data|string|必填|NFT集合名称
icon|form-data|string|必填|NFT集合图标
describe|form-data|string|非必填|NFT集合描述
> 返回示例：
```json
{
    "code": 200,
    "data": "",
    "msg": "Success"
}
```

####    5.获取我创建的NFT集合
   <font color=#FF4500>*post*，http://localhost:20201/admin/collections/showCollectionList </font> ，注意该接口需要token鉴权，请在 `header` 头添加 `Authorization` 字段值，注意：该字段的值格式：Bearer (token)之间有一个空格, 这个是行业标准，网页端显示换行，不要被误导!  

参数字段|参数属性|类型|选项|默认值
---|---|---|---|---
Authorization|Headers|string|必填|Bearer 登陆后获取的token  
> 返回示例：
```json
{
    "code": 200,
    "data": [
        {
            "name": "Raible",
            "icon": "adfiecsdkfsldfsdf6565",
            "category_id": 0,
            "describe": "Raible加密资产集合",
            "address": "0x12541254189999"
        },
        {
            "name": "SuperRare",
            "icon": "adfiecsdkfsldf99999",
            "category_id": 0,
            "describe": "SuperRare加密资产集合",
            "address": "0x12541254189999"
        },
        {
            "name": "CryptoPunks",
            "icon": "123dsofosdfsdf5656fds",
            "category_id": 0,
            "describe": "CryptoPunks加密资产集合",
            "address": "0x12541254189999"
        },
        {
            "name": "CryptoPunks",
            "icon": "123dsofosdfsdf5656fds",
            "category_id": 0,
            "describe": "CryptoPunks加密资产集合",
            "address": "0x12541254189999"
        },
        {
            "name": "CryptoPunks000",
            "icon": "123dsofosdfsdf5656fds",
            "category_id": 0,
            "describe": "",
            "address": "0x12541254189999"
        }
    ],
    "msg": "Success"
}"msg": "Success"
}
```
####    6.创建NFT资产
   <font color=#FF4500>*POST*，http://localhost:20201/admin/assets/createAsset </font> ，注意该接口需要token鉴权，请在 `header` 头添加 `Authorization` 字段值，注意：该字段的值格式：Bearer (token)之间有一个空格, 这个是行业标准，网页端显示换行，不要被误导!  

参数字段|参数属性|类型|选项|默认值
---|---|---|---|---
Authorization|Headers|string|必填|Bearer 登陆后获取的token  
collectionId|form-data|int|必填|所属集合ID  
name|form-data|string|必填|NFT资产名称 
picture|form-data|string|必填|NFT资产图片 
metadata|form-data|string|非必填|NFT资产元数据 
externalLinks|form-data|string|非必填|NFT资产外部链接扩展信息 
describe|form-data|string|非必填|NFT资产信息描述 
> 返回示例：
```json
{
    "code": 200,
    "data": "",
    "msg": "Success"
}
```

####    7.NFT资产列表      

   <font color=#FF4500>*post*，http://localhost:20201/admin/assets/createAsset   

参数字段|参数属性|类型|选项|默认值
---|---|---|---|---
Authorization|Headers|string|必填|Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOjQ3LCJ1c2VyX25hbWUiOiJnb3NrZWxldG9uMS40IiwicGhvbmUiOiIiLCJleHAiOjE2MDQwNTIxNzMsIm5iZiI6MTYwNDA0ODU2M30.YNhN9_QasHc5XILQiilZvhxpPDnmC_j82y4JfYPnI7A  
collectionId|form-data|int|非必填|NFT集合ID 
categoryId|form-data|int|非必填|NFT上架分类ID 
status|form-data|int|非必填|NFT状态(1.未上架 2.已上架3.已锁定) 
page|form-data|int|非必填|默认第一页 
pageSize|form-data|int|非必填|默认每页10条 

> 返回示例：
```json
{
    "code": 200,
    "data": [
        {
            "collection_id": 0,
            "category_id": -1,
            "name": "饕餮史蒂芬",
            "picture": "史蒂芬史蒂芬是否第三方",
            "metadata": "元数据",
            "external_links": "外部链接说明",
            "describe": "描述",
            "status": 0,
            "address": "0x12541254189999"
        },
        {
            "collection_id": 4,
            "category_id": 1,
            "name": "饕餮",
            "picture": "史蒂芬史蒂芬是否第三方",
            "metadata": "元数据",
            "external_links": "外部链接说明",
            "describe": "描述",
            "status": 0,
            "address": "0x12541254189999"
        }
    ],
    "msg": "Success"
}
```

####    8.NFT数据(graphQL方式查询接口)
> <font color=#FF4500>*post*，http://localhost:20201/admin/assets/graphql</font>        

参数字段|参数属性|类型|选项|默认值
---|---|---|---|---
Authorization|Headers|string|必填|Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOjQ3LCJ1c2VyX25hbWUiOiJnb3NrZWxldG9uMS40IiwicGhvbmUiOiIiLCJleHAiOjE2MDQwNTIxNzMsIm5iZiI6MTYwNDA0ODU2M30.YNhN9_QasHc5XILQiilZvhxpPDnmC_j82y4JfYPnI7A
> 
>
> 
>
> NFT集合详细信息查询参数
>
> {
>
>   collection(id:1){
>
> ​    id,
>
> ​    classId,
>
> ​    categoryId,
>
> ​    metadata,
>
> ​    name,
>
> ​    owner,
>
> ​    totalIssuance,
>
> ​    properties,
>
> ​    deposit,
>
> ​    externalLinks,
>
> ​    description,
>
> ​    tradeTime,
>
> ​    shelveTime,
>
> ​    createdAt,
>
> ​    updatedAt
>
>   }
>
> }
>
> 返回示例：
```json
{
    "data": {
        "collection": {
            "id": 1,
            "classId": 1,
            "categoryId": 2,
            "metadata": "asfsfsdfsdf",
            "name": "absf",
            "owner": "5ECKTKPyATYvKkw91xDBpn7E6HvhaZ39ehhvLbivVSiKc2ie",
            "totalIssuance": 100,
            "properties": 95,
            "deposit": "sdfsdf",
            "externalLinks": null,
            "description": "sdfsdfsdf ",
            "tradeTime": null,
            "shelveTime": null,
            "createdAt": "2021-03-12T20:55:43+08:00",
            "updatedAt": null
        }
    }
}
```



####    9.NFT查询所有NFT集合数据(graphQL方式查询接口)

> <font color=#FF4500>*post*，http://localhost:20201/admin/assets/graphql</font>        

| 参数字段      | 参数属性 | 类型   | 选项 | 默认值                                                       |
| ------------- | -------- | ------ | ---- | ------------------------------------------------------------ |
| Authorization | Headers  | string | 必填 | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOjQ3LCJ1c2VyX25hbWUiOiJnb3NrZWxldG9uMS40IiwicGhvbmUiOiIiLCJleHAiOjE2MDQwNTIxNzMsIm5iZiI6MTYwNDA0ODU2M30.YNhN9_QasHc5XILQiilZvhxpPDnmC_j82y4JfYPnI7A |

> 
>
> {
>
>   collections(page:1, pageSize:10){
>
> ​    id,
>
> ​    classId,
>
> ​    categoryId,
>
> ​    metadata,
>
> ​    name,
>
> ​    owner,
>
> ​    totalIssuance,
>
> ​    properties,
>
> ​    deposit,
>
> ​    externalLinks,
>
> ​    description,
>
> ​    tradeTime,
>
> ​    shelveTime,
>
> ​    createdAt,
>
> ​    updatedAt
>
>   }
>
> }
>
> 返回示例：

```json
{
    "data": {
        "collections": [
            {
                "id": 1,
                "classId": 1,
                "categoryId": 2,
                "metadata": "asfsfsdfsdf",
                "name": "absf",
                "owner": "5ECKTKPyATYvKkw91xDBpn7E6HvhaZ39ehhvLbivVSiKc2ie",
                "totalIssuance": 100,
                "properties": 95,
                "deposit": "sdfsdf",
                "externalLinks": null,
                "description": "sdfsdfsdf ",
                "tradeTime": null,
                "shelveTime": null,
                "createdAt": "2021-03-12T20:55:43+08:00",
                "updatedAt": null
            }
        ]
    }
}
```

####    10.NFT资产多条件过滤查询(graphQL方式查询接口)

> <font color=#FF4500>*post*，http://localhost:20201/admin/assets/graphql</font>        

| 参数字段      | 参数属性 | 类型   | 选项 | 默认值                                                       |
| ------------- | -------- | ------ | ---- | ------------------------------------------------------------ |
| Authorization | Headers  | string | 必填 | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOjQ3LCJ1c2VyX25hbWUiOiJnb3NrZWxldG9uMS40IiwicGhvbmUiOiIiLCJleHAiOjE2MDQwNTIxNzMsIm5iZiI6MTYwNDA0ODU2M30.YNhN9_QasHc5XILQiilZvhxpPDnmC_j82y4JfYPnI7A |

> {
>
>   assets(collectionId: 0,categoryId: 0,status: 0,sort: "deposit",page: 1, pageSize: 3){
>
> ​    name,
>
> ​    id,
>
> ​    collectionName,
>
> ​    categoryName,
>
> ​    metadata,
>
> ​    price,
>
> ​    name,
>
> ​    deposit,
>
> ​    externalLinks,
>
> ​    description,
>
> ​    status,
>
> ​    owner,
>
>   }
>
> }
>
> 返回示例：

```json
{
    "data": {
        "assets": [
            {
                "name": "青龙",
                "id": 1,
                "collectionName": "",
                "categoryName": "",
                "metadata": "0x6161626263636464",
                "price": 0,
                "deposit": "276480000000007",
                "externalLinks": "",
                "description": "",
                "status": 0,
                "owner": "65ADzWZUAKXQGZVhQ7ebqRdqEzMEftKytB8a7rknW82EASXB"
            },
            {
                "name": "白虎",
                "id": 2,
                "collectionName": "",
                "categoryName": "",
                "metadata": "0x6161626263636464",
                "price": 0,
                "deposit": "276480000000007",
                "externalLinks": "",
                "description": "",
                "status": 0,
                "owner": "65ADzWZUAKXQGZVhQ7ebqRdqEzMEftKytB8a7rknW82EASXB"
            },
            {
                "name": "朱雀",
                "id": 3,
                "collectionName": "",
                "categoryName": "",
                "metadata": "0x6161626263636464",
                "price": 0,
                "deposit": "276480000000007",
                "externalLinks": "",
                "description": "",
                "status": 0,
                "owner": "65ADzWZUAKXQGZVhQ7ebqRdqEzMEftKytB8a7rknW82EASXB"
            }
        ]
    }
}
```



####    11.NFT资产首页查询接口(graphQL方式查询接口)

> <font color=#FF4500>*post*，http://localhost:20201/admin/assets/graphql</font>        

| 参数字段      | 参数属性 | 类型   | 选项 | 默认值                                                       |
| ------------- | -------- | ------ | ---- | ------------------------------------------------------------ |
| Authorization | Headers  | string | 必填 | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOjQ3LCJ1c2VyX25hbWUiOiJnb3NrZWxldG9uMS40IiwicGhvbmUiOiIiLCJleHAiOjE2MDQwNTIxNzMsIm5iZiI6MTYwNDA0ODU2M30.YNhN9_QasHc5XILQiilZvhxpPDnmC_j82y4JfYPnI7A |

> {
>
>   assetsLastCreate(page: 1, pageSize: 10){
>
> ​    name,
>
> ​    id,
>
> ​    assetId,
>
> ​    collectionName,
>
> ​    categoryName,
>
> ​    metadata,
>
> ​    price,
>
> ​    name,
>
> ​    deposit,
>
> ​    externalLinks,
>
> ​    description,
>
> ​    status,
>
> ​    owner,
>
> ​    shelveTime,
>
> ​    tradeTime,
>
> ​    createdAt,
>
> ​    updatedAt
>
>   }
>
>    assetsLastTrade(page: 1, pageSize: 10){
>
> ​    name,
>
> ​    id,
>
> ​    assetId,
>
> ​    collectionName,
>
> ​    categoryName,
>
> ​    metadata,
>
> ​    price,
>
> ​    name,
>
> ​    deposit,
>
> ​    externalLinks,
>
> ​    description,
>
> ​    status,
>
> ​    owner,
>
> ​    shelveTime,
>
> ​    tradeTime,
>
> ​    createdAt,
>
> ​    updatedAt
>
>   }
>
>    assetsLastShelve(page: 1, pageSize: 10){
>
> ​    name,
>
> ​    id,
>
> ​    assetId,
>
> ​    collectionName,
>
> ​    categoryName,
>
> ​    metadata,
>
> ​    price,
>
> ​    name,
>
> ​    deposit,
>
> ​    externalLinks,
>
> ​    description,
>
> ​    status,
>
> ​    owner,
>
> ​    shelveTime,
>
> ​    tradeTime,
>
> ​    createdAt,
>
> ​    updatedAt
>
>   }
>
> 
>
> 
>
> }
>
> 返回示例：

```json
{
    "data": {
        "assetsLastCreate": [],
        "assetsLastTrade": [],
        "assetsLastShelve": []
    }
}
```

####    12.NFT上架分类详细信息查询接口(graphQL方式查询接口)

> <font color=#FF4500>*post*，http://localhost:20201/admin/assets/graphql</font>        

| 参数字段      | 参数属性 | 类型   | 选项 | 默认值                                                       |
| ------------- | -------- | ------ | ---- | ------------------------------------------------------------ |
| Authorization | Headers  | string | 必填 | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOjQ3LCJ1c2VyX25hbWUiOiJnb3NrZWxldG9uMS40IiwicGhvbmUiOiIiLCJleHAiOjE2MDQwNTIxNzMsIm5iZiI6MTYwNDA0ODU2M30.YNhN9_QasHc5XILQiilZvhxpPDnmC_j82y4JfYPnI7A |

> {
>
>   category(id:5){
>
> ​    id,
>
> ​    name,
>
> ​    remark,
>
> ​    sort,
>
> ​    createdAt,
>
> ​    updatedAt
>
>   }
>
> 
>
> }
>
> 返回示例：

```json
{
    "data": {
        "category": {
            "id": 5,
            "name": "其他",
            "remark": "",
            "sort": 4,
            "createdAt": "2021-02-02T00:40:13+08:00",
            "updatedAt": "2021-03-08T00:40:16+08:00"
        }
    }
}
```

####    13.NFT所有上架分类查询接口(graphQL方式查询接口)

> <font color=#FF4500>*post*，http://localhost:20201/admin/assets/graphql</font>        

| 参数字段      | 参数属性 | 类型   | 选项 | 默认值                                                       |
| ------------- | -------- | ------ | ---- | ------------------------------------------------------------ |
| Authorization | Headers  | string | 必填 | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOjQ3LCJ1c2VyX25hbWUiOiJnb3NrZWxldG9uMS40IiwicGhvbmUiOiIiLCJleHAiOjE2MDQwNTIxNzMsIm5iZiI6MTYwNDA0ODU2M30.YNhN9_QasHc5XILQiilZvhxpPDnmC_j82y4JfYPnI7A |

> {
>
>   categorys(page:1, pageSize:10){
>
> ​     id,
>
> ​    name,
>
> ​    remark,
>
> ​    sort,
>
> ​    createdAt,
>
> ​    updatedAt
>
>   }
>
> }
>
> 返回示例：

```json
{
    "data": {
        "categorys": [
            {
                "id": 4,
                "name": "收藏品",
                "remark": "",
                "sort": 3,
                "createdAt": "2021-03-01T00:40:06+08:00",
                "updatedAt": "2021-03-04T00:40:09+08:00"
            },
            {
                "id": 1,
                "name": "数字艺术品",
                "remark": "一个由制作者、开发商和交易商组成的在线社区正在把艺术世界推向新的领域。这一切都始于CryptoPunks，这是一组由1万名随机生成的朋克组成的集合，在2017年证明了对非实体物品和收藏品的数字所有权的需求，自那以后，这个市场发展迅速",
                "sort": 0,
                "createdAt": "2021-02-26T00:35:56+08:00",
                "updatedAt": "2021-02-26T00:35:59+08:00"
            },
            {
                "id": 2,
                "name": "虚拟世界",
                "remark": "",
                "sort": 1,
                "createdAt": "2021-02-24T00:39:52+08:00",
                "updatedAt": "2021-02-28T00:39:56+08:00"
            },
            {
                "id": 3,
                "name": "运动",
                "remark": "",
                "sort": 2,
                "createdAt": "2021-02-08T00:40:00+08:00",
                "updatedAt": "2021-02-20T00:40:02+08:00"
            },
            {
                "id": 5,
                "name": "其他",
                "remark": "",
                "sort": 4,
                "createdAt": "2021-02-02T00:40:13+08:00",
                "updatedAt": "2021-03-08T00:40:16+08:00"
            }
        ]
    }
}
```

