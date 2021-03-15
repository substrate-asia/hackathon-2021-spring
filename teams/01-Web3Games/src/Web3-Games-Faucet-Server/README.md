# 接口文档

## 日常奖励
GET /daily-reward
获取所有地址信息
返回数据示例：
```
[
    {
        "address": "5Dtp6pqcX71gRny3GwUhXKzKYEydbdJt9745qqsDBRh8ToBS"
    },
    {
        "address": "12345"
    },
    {
        "address": "1234567"
    }
]
```

GET /daily-reward/:address
:address为地址参数
查询某地址当日是否获取了奖励
返回为null，403表示不允许，200表示允许

POST /daily-reward
Content-Type: application/json
请求示例:
```
{
    "address": "1234567"
}
```

返回数据示例：
```
// 已存在返回状态为400
{
    "message": "Duplicated address"
}

// 成功200
null

// 内部错误500
```