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
const RSA_PRIVATE_KEY='xxxxx';
//支付宝公钥，账户中心->密钥管理->开放平台密钥，找到添加了支付功能的应用，根据你的加密类型，查看支付宝公钥
const ALIPAY_PUBLIC_KEY = 'xxxxx'
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
    method: 'alipay.trade.page.pay',
    method_type: 'page',
})

let app = express()
app.use(express.urlencoded({extended: true}))  //解析post请求

app.get('/', (request, response) => {
    response.send(`
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta charset="UTF-8">
    <title>Node.js 支付宝 当面付demo</title>
    <link href="https://cdn.bootcss.com/bootstrap/3.3.0/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
<div class="container-fluid">
    <h2>电脑网站支付demo</h2>
    <form action="/pay" method="get">
    <table class="table table-bordered">
        <tr>
            <td>订单金额</td>
            <td><input class="form-control" type="number" step="0.01" min="0.01" name="amount" id="amount" value="${PAY_AMOUNT}"></td>
        </tr>
        <tr>
            <td>订单号</td>
            <td><input class="form-control" type="text" name="orderid" id="orderid" value="${OUT_TRADE_NO}"></td>
        </tr>
        <tr>
            <td colspan="2"><input class="btn btn-primary" type="submit" value="支付"></td>
        </tr>
    </table>
    </form>
</div>
</body>
</html>
<script >
document.getElementById('orderid').value = new Date().getTime()
</script>
    `)
})

//发起支付
app.get('/pay',(request,response)=>{
    let query = request.query
    //请求参数
    let requestParams = {
        'out_trade_no': OUT_TRADE_NO,
        'product_code': 'FAST_INSTANT_TRADE_PAY',
        'total_amount': PAY_AMOUNT, //单位 元
        'subject': ORDER_NAME,  //订单标题
    }
    if (Object.prototype.toString.call(query) === '[object Object]' && query.amount)
        requestParams.total_amount = parseFloat(query.amount).toFixed(2)
    if (Object.prototype.toString.call(query) === '[object Object]' && query.orderid)
        requestParams.out_trade_no = query.orderid

    response.send(alipay.doPay(requestParams))
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
