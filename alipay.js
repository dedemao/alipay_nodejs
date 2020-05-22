const crypto = require('crypto');

const ALIPAY_ALGORITHM_MAPPING = {
    RSA: 'RSA-SHA1',
    RSA2: 'RSA-SHA256',
};

class alipayService {
    constructor(config) {
        if (!config.appid) throw Error('config.appid is required');
        if (!config.rsa_private_key) throw Error('config.rsa_private_key is required');
        this.appid = config.appid
        this.rsa_private_key = config.rsa_private_key
        this.alipay_public_key = config.alipay_public_key
        this.pay_amount = config.total_amount
        this.order_name = config.subject
        this.out_trade_no = config.out_trade_no
        this.sign_type = 'RSA2'
        this.return_url = config.return_url
        this.notify_url = config.notify_url
        this.charset = 'utf-8'
    }

    doPay() {
        //请求参数
        let requestConfigs = {
            'out_trade_no': this.out_trade_no,
            'product_code': 'FAST_INSTANT_TRADE_PAY',
            'total_amount': this.pay_amount, //单位 元
            'subject': this.order_name,  //订单标题
        };
        let commonConfigs = {
            //公共参数
            'app_id': this.appid,
            'method': 'alipay.trade.page.pay',             //接口名称
            'format': 'JSON',
            'return_url': this.return_url,
            'charset': this.charset,
            'sign_type': 'RSA2',
            'version': '1.0',
            'notify_url': this.notify_url,
            'timestamp': `${this.getCurrentTime()}`,
            'biz_content': requestConfigs,
        };
        commonConfigs = this.sign(commonConfigs);
        return this.buildRequestForm(commonConfigs);
    }

    sign(params) {
        if (params.biz_content)
            params.biz_content = JSON.stringify(params.biz_content);
        // 排序
        const signStr = Object.keys(params).sort().map((key) => {
            let data = params[key];
            if (data && Array.prototype.toString.call(data) !== '[object String]') {
                data = JSON.stringify(data);
            }
            return `${key}=${data}`;
        }).join('&');

        let privateKey = this.rsa_private_key
        privateKey = "-----BEGIN RSA PRIVATE KEY-----\n" +
            (function () {
                let arr = [];
                let offset = 0;
                while (true) {
                    let str = privateKey.substr(offset, 64);
                    if (str == '') {
                        break;
                    }
                    arr.push(str);
                    offset += 64;
                }
                return arr.join("\n");
            })() +
            "\n-----END RSA PRIVATE KEY-----";

        // 计算签名
        const sign = crypto.createSign(ALIPAY_ALGORITHM_MAPPING[params.sign_type])
            .update(signStr, 'utf8').sign(privateKey, 'base64');
        return Object.assign(params, {sign});
    }

    getCurrentTime() {
        let date = new Date();
        let month = (date.getMonth() + 1).toString().padStart(2, '0');
        let dateStr = date.getDate().toString().padStart(2, '0');
        let hourStr = date.getHours().toString().padStart(2, '0');
        let minutesStr = date.getMinutes().toString().padStart(2, '0');
        let secondsStr = date.getSeconds().toString().padStart(2, '0');

        //时间格式YYYY-mm-dd HH:MM:SS
        return `${date.getFullYear()}-${month}-${dateStr} ${hourStr}:${minutesStr}:${secondsStr}`;
    }

    buildRequestForm(params) {
        let sHtml = "正在跳转至支付页面...<form id='alipaysubmit' name='alipaysubmit' action='https://openapi.alipay.com/gateway.do?charset=" + this.charset + "' method='POST'>";
        Object.keys(params).map((key) => {
            const value = String(params[key]).replace(/\"/g, '&quot;');
            // const value = params[key];
            sHtml += `<input type="hidden" name="${key}" value="${value}" />`;
        }).join('')

        //submit按钮控件请不要含有name属性
        sHtml = sHtml + "<input type='submit' value='ok' style='display:none;''></form>";
        sHtml = sHtml + "<script>document.forms['alipaysubmit'].submit();</script>";
        return sHtml;
    }

    //验证签名
    rsaCheck(params) {
        let sign_type = params.sign_type;
        let sign = params.sign;
        delete params.sign_type;
        delete params.sign;
        return this.verify(this.getSignContent(params), sign, sign_type);
    }

    //获取签名字符串
    getSignContent(params) {
        // 排序
        const signStr = Object.keys(params).sort().map((key) => {
            let data = params[key];
            if (data && Array.prototype.toString.call(data) !== '[object String]') {
                data = JSON.stringify(data);
            }
            return `${key}=${data}`;
        }).join('&');
        return signStr
    }

    //验证签名
    verify(paramStr,sign,signType) {
        let publicKey = this.alipay_public_key
        // 未设置“支付宝公钥”或签名字符串不存在，验签不通过
        if (!publicKey || !paramStr) {
            return false;
        }

        publicKey = "-----BEGIN PUBLIC KEY-----\n" +
            (function () {
                let arr = [];
                let offset = 0;
                while (true) {
                    let str = publicKey.substr(offset, 64);
                    if (str == '') {
                        break;
                    }
                    arr.push(str);
                    offset += 64;
                }
                return arr.join("\n");
            })() +
            "\n-----END PUBLIC KEY-----";

        // 计算签名
        const verifier = crypto.createVerify(ALIPAY_ALGORITHM_MAPPING[signType]);

        return verifier.update(paramStr, 'utf8').verify(publicKey, sign, 'base64');
    }
}

module.exports = alipayService
