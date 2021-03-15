

//支付策略
export enum PayStrategy{
   GRAIN=0, //纯粹使用粒子
   MASTERCOIN=1, //纯粹使用大师币
   GRAIN_MASTERCOIN=2, //先用粒子抵扣，剩下使用大师币
   WEICHAT=3,//微信支付
   ALIPAY=4, //支付宝支付
   GRAIN_WEICHAT=5,//先用粒子抵扣，剩下使用微信支付
   GRAIN_ALIPAY=6 //先用粒子抵扣，剩下使用支付宝支付
}