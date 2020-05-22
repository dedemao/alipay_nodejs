# alipay_nodejs
一个js文件搞定支付宝支付

# 环境依赖
nodejs

express

# 文件对应说明
pc.js 电脑网站支付

# 如何使用

1.需要用到支付宝哪一种支付方式，就只下载对应的文件即可。

2.文件开头的配置信息必须完善

3.命令行下进入文件所在目录，运行`node pc.js`

4.浏览器打开 http://localhost:3000 即可体验支付

## 以`电脑网站支付`为例

1.下载`pc.js`、`alipay.js`、`package.json`三个文件。

2.打开`pc.js`文件，根据注释信息填写文件开头的配置信息

3.命令行下进入文件所在目录，安装express环境：
```
npm install
```
或
```
yarn
```
4.运行pc.js：
```
node pc.js
```

5.浏览器打开 http://localhost:3000 即可体验支付
