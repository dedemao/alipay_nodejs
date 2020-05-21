let alipay = require('./alipay')
let http = require('http')
/*** 请填写以下配置信息 ***/
const APPID = 'xxxxx';  //https://open.alipay.com 账户中心->密钥管理->开放平台密钥，填写添加了电脑网站支付的应用的APPID
const RETURN_URL = 'http://www.xxx.com/alipay/return.php';     //付款成功后的同步回调地址
const NOTIFY_URL = 'http://www.xxx.com/alipay/notify_redis.php';     //付款成功后的异步回调地址
const OUT_TRADE_NO = new Date().getTime();     //你自己的商品订单号
const PAY_AMOUNT = 0.01;          //付款金额，单位:元
const ORDER_NAME = '支付测试';    //订单标题
const SIGN_TYPE = 'RSA2';       //签名算法类型，支持RSA2和RSA，推荐使用RSA2
//商户私钥，填写对应签名算法类型的私钥，如何生成密钥参考：https://docs.open.alipay.com/291/105971和https://docs.open.alipay.com/200/105310
const rsaPrivateKey='MIIEpAIBAAKCAQEA1MV+OY6MvGfXPM0MkpjT+FdzGmPOvVmX2wF3gjwQpeHBEUP9jLXhVS32fZ1iXI1e7WUGQ5tvXn28P8190kpOn/c/G5t2CAksUvemvF7uJN/N3Z1HFMdt3omvCd14K05lgcFYz7Z4c+A7ZJF5bPCB6oshjjUmbCY3hibuWzX/1j8AgsoD9lLyxoFqxLj98k5ZrYIhk900gMQs/WJ3A1FC09Dln9fuhBUyjtPHaml+4w+sdkdzxPktxdFrMc12M7rNEwg25XtST5Z49oFpE84AlXM7+oC9jYvIpTGE00WomsgtakN039ucT/59Bup6pLkO08Rv85UXbqzGTcYAhNHLfQIDAQABAoIBAQC12PM58s+j8KgB8ty5yiqRPoeaj+O2h4Txn7A02/sfPQvNtCI0wsTpT5twsihULo+EVYTxJCitUn7df2sP5pyGzTEd5njLRtNu4Zvhj+Thjf8grERiu9b4oXI/WRzjLRxzi+uREi40OK+fWi0xgxDCdROY/eNiEdJfV8zpaqsUxG7VdwZIJQ/8d3Mi31OWv30kr9jfEd15DBInGJgSqR+qwrAB4pBSMcW8hL6PYlzoPi1ygceFjRrnbeMG40zt0OUPSexQIgAmFvGqxTl5xo3dFEziGHdfWYsBKZ2M8ubAe+R6LcndxI+o2Hw4TNcC1tDeNMtjw7+h9S5aef5A8uWBAoGBAPxCLWPhUHCYlIXUz0D1SoolZs9WK7Kz1YSWnzqrpegN+foS5/ji93YylGE+KL31TwbnGQLAwknwMX3qTzmkvTovmy8jevXBsCSEFm81q0wG/35e1SKkTXL66RqB2y0xFLdcF3f9s8ZiEclqkYwNSHh0nqzREfIxMMAsj+3n2vHdAoGBANftYkZYrbs4iI/ZcjmBYguYikNfNmrD+Ta6ckOGZqsHfwXJCAz1rF4/XCqVAc9nxuzJR/72qkn9z07uH6qSZCqlZDRkiiKaK22VqFDB+0abMk/TGHXuMmdvMkyj2jEZxG2rkg0kmg4qYkkg/5tGG1On/0GeZNVPu8JpsFr1pDYhAoGBANr8pCTKC6fDfWP1C3qrtmrY7zhc6RB4d4pjq5UmP5+EypaiZQi2F/dfD1qfuIS3eURXyGmQZtoDDyPtDZvP/ImPnFs+pNbFryD0HfmrEKquhIvyzXoGQknnsgbV5iyEKCTJaII9FxzINAKzZei7+0a+jqUd1kN3Gogp50Sze2ltAoGARaM5Xpaa8RZ6dGocfI9Nn4/Ch5fdZPFvHkdjMoPV+LKiNKtw/Tz+KiclAlasDsfZT+RaY9AJe3NvuHTzoX807swIVR1Xr3EpLaCed+0XrN3AjB34dZAskU87WZw+cjdtMjFzGOoFBSyGJi+OP/WMOp6jo/YBbwoX88tCJROzsgECgYAT8pHHIyPt5Y/5pDb8EDvD3XNES1fBkfZffSoAodsrkeoKgrsKl+9M3rcGX+S9dscyoH0ur3BFTMHtIOOhC5qytt+BhMHIP5mAs4di4u/joQCWQbUyrUggVK5it+6BFgAT+jeB7zTAUtgGpTVFq3kLbV0NZ+XQyEHVlnoJnHYpQg==';
/*** 配置结束 ***/

alipay.appid = APPID
alipay.return_url = RETURN_URL
alipay.notify_url = NOTIFY_URL
alipay.out_trade_no = OUT_TRADE_NO
alipay.pay_amount = PAY_AMOUNT
alipay.order_name = ORDER_NAME
alipay.sign_type = SIGN_TYPE
alipay.rsa_private_key = rsaPrivateKey
let html = alipay.doPay();

let server = http.createServer((request,response)=>{
	response.setHeader("content-type","text/html;Charset=utf-8")
    response.end(html)
})

server.listen(3000,(err)=>{
    if(!err){
        console.log('nodejs server 启动成功')
    }else{
        console.log(err)
    }
})