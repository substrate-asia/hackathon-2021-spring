### 公共请求参数结构

| 参数名 | 类型   | 描述                                                                              |
|--------|--------|---------------------------------------------------------------------------------|
| d      	| string |	 数据参数base64字符串,生成方式:base64.encode(JSON.stringify(请求实体)))        |
| n	        | string |	 随机字符串,防止重放攻击							  |
| t	        | int64  |   时间戳(毫秒),误差10分钟可校验通过                                     |
| s         | string |   数据签名,生成方式:hmac256(d+n+t,secret),secret登录接口获得(未登录接口忽略为空)   |

### 公共响应参数结构

| 参数名 | 类型   | 描述                                                                              |
|--------|--------|---------------------------------------------------------------------------------|
| c	       | string |   业务状态码,000000.成功 100000.业务处理失败 110000.JSON数据异常, 120000.公钥数据异常, 200000.令牌无效 200001.令牌超时, 300000.数据库异常 900000.系统错误|
| m	       | string |	业务处理提示信息                |
| d        | string |	数据参数base64字符串,生成方式:base64.encode(JSON.stringify(响应实体))							|
| t        | int64  |	服务响应时间,时间戳(毫秒)								|
| s        | string |   数据签名,生成方式:hmac256(d+t,secret)					|

### 重点: 接口请求实体以原始JSON示例展示,实际应用时候请以公共参数结构转换 -> base64.encode(JSON.stringify(请求实体))

### 请求结构示例

```json
{
	"d":"eyJjdHhVc2VySWQiOiIiLCJwYWdlTm8iOjAsInBhZ2VTaXplIjowfQ==",
	"n":"123456",
	"t":1614410188182,
	"s":"d63707e3c068a7ea9324aef093a93d98aed374995c1db0750ae69aa08da7e085"
}
```

### 响应结构示例

```json
{
	"c": "000000",
	"m": "success",
	"d": "eyJtb2JpbGUiOiIxMjM0NTYiLCJlbWFpbCI6IjEyMzQ1NkBxcS5jb20ifQ==",
	"t": 1614411069524,
	"s": "25773e0cef15d71cf24aa529f1563e9b44ed63ea94dfdd64a1d5d3a972eed62e"
}
```


### 1.1 获取Nonce接口 `/user/nonce`

`请求实体`

```json
{

}
```

`响应实体`

```json
{
    "message":"a28d29ab87c1425de225caaef83cb72ca8a5fa72aa3c5117264c6bfe5cf1b654",
    "nonce":"1365477376988938240",
    "time":1614390150674
}
```

### 1.2 公钥注册接口 `/user/register`

`请求实体`

```json
{
    "address":"钱包地址",
    "message":"a28d29ab87c1425de225caaef83cb72ca8a5fa72aa3c5117264c6bfe5cf1b654",
    "nonce":"1365477376988938240",
    "time":1614390150674,
	"email":"123456@qq.com",
	"mobile":"",
	"nickname":"张三",
    "signature":"私钥签名" // ECC(message)
}
```

`响应实体`

```json
{

}
```

### 1.3 公钥登录接口 `/user/login`

`请求实体`

```json
{
    "pubkey":"公钥",
    "message":"a28d29ab87c1425de225caaef83cb72ca8a5fa72aa3c5117264c6bfe5cf1b654",
    "nonce":"1365477376988938240",
    "time":1614390150674,
    "signature":"私钥签名" // ECC(message)
}
```

`响应实体`

```json
{
    "token":"eyJzdWIiOiIxMzY1NDk0MjQzMTMyNTcxNjQ4IiwiYXVkIjoiU0hPUEJSSU5HIiwiaXNzIjoiU0hPUEJSSU5HIiwianRpIjoiMTM2NTQ5NDI0Mzc2MTcxNzI0OCIsImluZiI6IiIsImRldiI6IiIsImlhdCI6MTYxNDM5NDE3MjAyNiwiZXhwIjoxNjE1NjkwMTcyMDI2fQ==.e1453973bd01b0eba2181ebea56952811e7fa580873662adb4021a6a4f40b499",
    "secret":"1eb49784b622b622d8ce11eb49784b622"
}
```

### 1.4 获取用户信息接口 `/user/info`

`请求实体`

```json
{

}
```

`响应实体`

```json
{
    "email":"123456@qq.com",
    "nickname":"张三"
}
```

### 2.1 获取电商平台列表 `/order/ebplatform`

`请求实体`

```json
{

}
```

`响应实体`

```json
[
    {
        "id":"1367439605804171265",
        "name":"淘宝",
        "url":"www.taobao.com",
        "introduction":"淘宝网"
    }
]
```

### 2.2 提交代购订单 `/order/applyOrder`

`请求实体`

```json
{
    "payment_amount":"1",
    "tip":"0",
    "currency":"1",
    "required_deposit":"0",
    "required_credit":"0",
    "note":"",
    "platform_id":"1367439605804171265",
	"place_id":"1369526987592433664",
    "merchant":"张三",
    "total":"100.56",
    "commodities":[
        {
            "skuid":"123",
            "name":"真丝羽绒服",
            "url":"taobao.com/123",
			"img":"www.baidu.com/1.jpg",
            "options":[
                "颜色:黑色",
                "规格:大码"
            ],
            "amount":3,
            "price":"100",
            "total":"300",
            "note":"我要黑色大码"
        }
    ]
}
```

`响应实体`

```json
{
	"consumer":"xxxx",
    "payment_amount":"100",
    "tip":"0",
    "currency":"1",
    "required_deposit":"0",
    "required_credit":"0",
    "version":0,
    "ext_order_hash":"9db091b2c70100026890c3dcfed6ee68d70ba3e37a0988ba0fa4ab385812dbd1"
}
```

### 2.3 获取订单列表 `/order/list`

`请求实体`

```json
{
    "order_type":1, // 0.待接单列表 1.消费者-买单列表 2.代购者-接单列表
    "order_id":"1369299868073459712" // 可空,有值指定查询
}
```

`响应实体`

```json
[
    {
        "order_id":"1369299868073459712",
        "consumer":"123456",
        "shopping_agent":"",
        "payment_amount":"200000000",
        "tip":"0",
        "currency":"1",
        "create_time":1615301503567,
        "accept_time":0,
        "shipping_time":0,
        "end_time":0,
        "required_deposit":"0",
        "required_credit":"0",
        "logistics_company":"",
        "shipping_num":"",
        "receiver":"",
        "receiver_phone":"",
        "shipping_address":"",
        "is_return":0,
        "platform_name":"",
        "platform_order_num":"",
        "merchant":"张三",
        "note":"",
        "fare":"",
        "total":"100.56",
        "onchain_status":"Pending",
        "ext_order_hash":"0x0000000000000000000000000000000000000000000000000000000000000123",
        "shipping_hash":"",
        "commodities":[
            {
                "id":"1369299868723576832",
                "skuid":"123",
                "name":"真丝羽绒服",
                "url":"taobao.com/123",
				"img":"1.jpg",
                "options":[
                    "颜色:黑色",
                    "规格:大码"
                ],
                "amount":3,
                "price":"100",
                "total":"300",
                "note":"我要黑色大码"
            }
        ]
    }
]
```

### 2.4 快递货物订单 `/order/shipping`

`请求实体`

```json
{
	"order_type":1, // 1.支付订单 2.退款订单
    "order_id":"1369299868073459712", // 订单ID
    "shipping_num":"xxxxx" // 快递单号
}
```

`响应实体`

```json
{
    "consumer":"xxxxx",
    "shopping_agent":"xxxxx",
    "shipping_hash":"0x0000000000000000000000000000000000000000000000000000000000000456",
    "ext_order_hash":"0x0000000000000000000000000000000000000000000000000000000000000123"
}
```

### 2.5 提交退货申请 `/order/applyRefund`

`请求实体`

```json
{
	"o_id":"1369299868073459712",
    "return_amount":"1",
	"total":"100.56",
	"return_type":0,
    "return_reason":"不想要了",
    "return_commodities":[
        {
            "id":"1369299868723576832",
            "amount":3,
            "price":"100",
            "total":"300"
        }
    ]
}
```

`响应实体`

```json
{
    "consumer":"123456",
    "shopping_agent":"123456",
    "return_amount":"1",
    "version":"0",
    "ext_order_hash":"0x0000000000000000000000000000000000000000000000000000000000000123",
    "ext_return_hash":"0xd9dce776b9bd66616b770844d9d61db9bf3a28c0f9aa89bdf55b262711ed66c4"
}
```

### 2.6 接受或拒绝退货申请 `/order/acceptRefund`

`请求实体`

```json
{
	"order_id":"1369299868073459712", // 退款订单ID
    "place_id":"1369299868073459142", // 我的收货ID,拒绝退货忽略为空
	"accept_refund":0 // 0.拒绝 1.接受
}
```

`响应实体`

```json
{
    "consumer":"123456",
    "shopping_agent":"123456",
    "return_amount":"1",
    "version":"0",
    "ext_order_hash":"0x0000000000000000000000000000000000000000000000000000000000000123",
    "ext_return_hash":"0xd9dce776b9bd66616b770844d9d61db9bf3a28c0f9aa89bdf55b262711ed66c4"
}
```

### 2.7 获取退货订单列表 `/order/listRefund`

`请求实体`

```json
{
    "order_type":1, // // 1.消费者-退单列表 2.代购者-退单列表
    "order_id":"1369299868073459712" // 可空,有值指定查询
}
```

`响应实体`

```json
[
    {
        "order_id":"1370366895013888000", // 退单ID
        "consumer":"123456",
        "shopping_agent":"123456",
        "pay_order_id":"1369299868073459712", // 原付款订单ID
        "return_amount":"1",
        "create_time":1615555902629,
        "accept_time":0,
        "shipping_time":0,
        "end_time":0,
        "logistics_company":"",
        "shipping_num":"",
        "receiver":"",
        "receiver_phone":"",
        "shipping_address":"",
        "return_type":0,
        "return_reason":"",
        "version":"0",
        "note":"",
        "total":"100.56",
        "onchain_status":"",
        "ext_order_hash":"0x0000000000000000000000000000000000000000000000000000000000000123",
        "ext_return_hash":"0x199e30285d7d986ce98ed6f79e4d8eaafb6f6fac478af12f7563c7aa7044bfe8",
        "shipping_hash":"",
        "commodities":[
            {
                "id":"1370366895223603200",
                "skuid":"123",
                "name":"真丝羽绒服",
                "url":"taobao.com/123",
                "options":[
                    "颜色:黑色",
                    "规格:大码"
                ],
                "amount":3,
                "price":"100",
                "total":"300",
                "note":""
            }
        ]
    }
]
```

### 2.8 获取首页订单列表 `/order/index`

`请求实体`

```json
{
    "order_type":0, // 0.待接单列表
    "order_id":"1369299868073459712" // 可空,有值指定查询
}
```

`响应实体`

```json
[
    {
        "order_id":"1369299868073459712",
        "consumer":"*****",
        "shopping_agent":"*****",
        "payment_amount":"200000000",
        "tip":"0",
        "currency":"1",
        "create_time":1615301503567,
        "accept_time":0,
        "shipping_time":0,
        "end_time":0,
        "required_deposit":"0",
        "required_credit":"0",
        "logistics_company":"",
        "shipping_num":"",
        "receiver":"*****",
        "receiver_phone":"*****",
        "shipping_address":"*****",
        "is_return":0,
        "platform_name":"",
        "platform_order_num":"",
        "merchant":"张三",
        "note":"",
        "fare":"",
        "total":"100.56",
        "onchain_status":"Pending",
        "ext_order_hash":"0x0000000000000000000000000000000000000000000000000000000000000123",
        "shipping_hash":"",
        "commodities":[
            {
                "id":"1369299868723576832",
                "skuid":"123",
                "name":"真丝羽绒服",
                "url":"taobao.com/123",
				"img":"1.jpg",
                "options":[
                    "颜色:黑色",
                    "规格:大码"
                ],
                "amount":3,
                "price":"100",
                "total":"300",
                "note":"我要黑色大码"
            }
        ]
    }
]
```


### 3.1 添加收货地址 `/place/upset`

`请求实体`

```json
{
	"id":"1369526987592433664", // ID为空新增,反则修改
    "name":"张三",
    "mobile":"13823912345",
    "address":"广州番禺区大学城"
}
```

`响应实体`

```json
{

}
```

### 3.2 删除收货地址 `/place/del`

`请求实体`

```json
{
    "id":"1369526987592433664"
}
```

`响应实体`

```json
{

}
```

### 3.3 获取收货地址 `/place/get`

`请求实体`

```json
{

}
```

`响应实体`

```json
{
    "id":"1369526987592433664",
    "name":"张三11",
    "mobile":"13823912345",
    "address":"广州番禺区大学城1"
}
```

### 3.4 获取收货地址列表 `/place/list`

`请求实体`

```json
{
    "offset":0,
    "limit":10
}
```

`响应实体`

```json
[
    {
        "id":"1369526987592433664",
        "name":"张三11",
        "mobile":"13823912345",
        "address":"广州番禺区大学城1"
    }
]
```
