const express = require('express')
const alipayService = require('./alipay')
/*** 请填写以下配置信息 ***/
const APPID = 'xxxxx';  //https://open.alipay.com 账户中心->密钥管理->开放平台密钥，填写添加了电脑网站支付的应用的APPID
const RETURN_URL = 'http://www.xxx.com:3000/return';     //付款成功后的同步回调地址
const NOTIFY_URL = 'http://www.xxx.com:3000/notify';     //付款成功后的异步回调地址
const OUT_TRADE_NO = new Date().getTime();     //你自己的商品订单号
const PAY_AMOUNT = 0.01;          //付款金额，单位:元
const ORDER_NAME = '支付测试';    //订单标题
const SIGN_TYPE = 'RSA2';       //签名算法类型，支持RSA2和RSA，推荐使用RSA2
//商户私钥，填写对应签名算法类型的私钥，如何生成密钥参考：https://docs.open.alipay.com/291/105971和https://docs.open.alipay.com/200/105310
const RSA_PRIVATE_KEY='MIIEpAIBAAKCAQEA1MV+OY6MvGfXPM0MkpjT+FdzGmPOvVmX2wF3gjwQpeHBEUP9jLXhVS32fZ1iXI1e7WUGQ5tvXn28P8190kpOn/c/G5t2CAksUvemvF7uJN/N3Z1HFMdt3omvCd14K05lgcFYz7Z4c+A7ZJF5bPCB6oshjjUmbCY3hibuWzX/1j8AgsoD9lLyxoFqxLj98k5ZrYIhk900gMQs/WJ3A1FC09Dln9fuhBUyjtPHaml+4w+sdkdzxPktxdFrMcI7M7rNEwg25XtST5Z49oFpE84AlXM7+oC9jYvIpTGE00Womsgtak123456T/59Bup6pLkO08Rv85UXbqzGTcYAhNHLfQIDAQABAoIBAQCbuPM58s+j8KgB8ty5yiqRPoeaj+O2h4Txn7A02/sfPQvNtCI0wsTpT5twsihULo+EVYTxJCitUn7df2sP5pyGzTEd5njLRtNu4Zvhj+Thjf8grERiu9b4oXI/WRzjLRxzi+uREi40OK+fWi0xgxDCdROY/eNiEdJfV8zpaqsUxG7VdwZIJQ/8d3Mi31OWv30kr9jfEd15DBInGJgSqR+qwrAB4pBSMcW8hL6PYlzoPi1ygceFjRrnbeMG40zt0OUPSexQIgAmFvGqxTl5xo3dFEziGHdfWYsBKZ2M8ubAe+R6LcndxI+o2Hw4TNcC1tDeNMtjw7+h9S5aef5A8uWBAoGBAPxCLWPhUHCYlIXUz0D1SoolZs9WK7Kz1YSWnzqrpegN+foS5/ji93YylGE+KL31TwbnGQLAwknwMX3qTzmkv123458jevXBsCSEFm81q0wG/35e1SKkTXL66RqB2y0xFLdcF3f9s8ZiEclqkYwNSHh0nqzREfIxMMAsj+3n2vHdAoGBANftYkZYrbs4iI/ZcjmBYguYikNfNmrD+Ta6ckOGZqsHfwXJCAz1rF4/XCqVAc9nxuzJR/72qkn9z07uH6qSZCqlZDRkiiKaK2UVqFDB+0abMk/TGHXuMmdvMkyj2jEZxG2rkg0kmg4qYkkg/5tGG1On/0GeZNVPu8JpsFr1pDYhAoGBANr8pCTKC6fDfWP1C3qrtmrY7zhc6RB4d4pjq5UmP5+EypaiZQi2F/dfD1qfuIS3eURXyGmQZtoDDyPtDZvP/ImPnFs+pNbFryD0HfmrEKquhIvyzXoGQknnsgbV5iyEKCTJaII9FxzINAKzZei7+0a+jqUd1kN3Gogp50Sze2ltAoGARaM5Xpaa8RZ6dGocfI9Nn4/Ch5fdZPFvHkdjMoPV+LKiNKtw/Tz+KiclAlasDsfZT+RaY9AJe3NvuHTzoX807swIVR1Xr3EpLaCed+0XrN3AjB34dZAskU87WZw+cjdtMjFzGOoFBSyGJi+OP/WMOp6jo/YBbwoX88tCJROzsgECgYAT8pHHIyPt5Y/5pDb8EDvD3XNES1fBkfZffSoAodsrkeoKgrsKl+9M3rcGX+S9dscyoH0ur3BFTMHtIOOhC5qytt+BhMHIP5mAs4di4u/joQCWQbUyrUggVK5it+6BFgAT+jeB7zTAUtgGpTVFq3kLbV0NZ+XQyEHVlnoJnHYpQg==';
//支付宝公钥，账户中心->密钥管理->开放平台密钥，找到添加了支付功能的应用，根据你的加密类型，查看支付宝公钥
const ALIPAY_PUBLIC_KEY = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArodD5+7jyrN0YZUMq1j3ai5Tf/Ozycuhsuz0uvhCqrwGjo8y9UY12345PDQmCmfwIFvdrgd316pMDyDIUcbxLNHiQlD1xhLo+RXs71cEJiSdN9HqslZC4nxMgA+llfn8s2Xg4GFsLNQJrj2yW96wFwVMjfVzqtGrMtpbqUBlkeb/s46BKvaN1o9VSuqu+ZhbHQMX+UqkTXI3+12345yxWgX4rH9UsOPsJyTfkc5XCpcV3O0hz0TFE0eoZbrD+2oLzWcKmofJ2BDGz8bFZD57eL2j0A1szuj8y4MQWLzToBPJU0JjYZuemr+ynrQbZcAOiSsEE+sF8vViIc/liCz1TQIDAQAB'
/*** 配置结束 ***/
let alipay = new alipayService({
    appid:APPID,
    rsa_private_key:RSA_PRIVATE_KEY,
    alipay_public_key:ALIPAY_PUBLIC_KEY,
    total_amount:PAY_AMOUNT,
    subject:ORDER_NAME,
    out_trade_no:OUT_TRADE_NO,
    return_url:RETURN_URL,
    notify_url:NOTIFY_URL,
})

let app = express()
app.use(express.urlencoded({extended: true}))  //解析post请求

//发起支付
app.get('/pay',(request,response)=>{
    response.send(alipay.doPay())
})

//异步回调
app.post('/notify',(request,response)=>{
    let params = request.body
    let result = alipay.rsaCheck(params)
    if(result===true){
        console.log('验证签名成功')
        //处理你的逻辑，例如获取订单号 params.out_trade_no，订单金额 params.total_amount等
    }else{
        console.log('验证签名失败')
    }
    //程序执行完后打印输出“success”
    response.send('success')
})

//同步回调
app.get('/return',(request,response)=>{
    let params = request.query
    let result = alipay.rsaCheck(params)
    if(result===true){
        response.send('<h1>支付成功</h1>')
    }else{
        response.send('<h1>验证签名失败</h1>')
    }

})

//绑定端口监听
app.listen(3000,(err)=>{
    if(!err){
        console.log('服务器启动成功')
    }else{
        console.log(err)
    }
})
