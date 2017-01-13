<style>
    @import '../styles/page/recharge.css';
</style>
<template>
    <div class="page" id="recharge-page" :style="{ height : global.winHeight+'px' }">
        <page-title title-text="充值"></page-title>
        <div class="recharge-area">
            <div>充值金额</div>
            <div>
                <span>￥</span>
                <div><input type="number" pattern="[0-9]*" v-model="money" @input="doInputOfMoney()"/></div>
            </div>
            <div>注：充值金额可用于会所消费。</div>
        </div>
        <div class="submit-button" :class="submitStatusCls" @click="doClickSubmitBtn()">{{ submitText }}</div>
    </div>
</template>
<script>
    import { Global } from '../libs/global'
    import Util from '../libs/util'

    module.exports = {
        data: function () {
            return {
                global: Global.data,
                getOpenIdUrl: '../api/v2/wx/oauth2/openid',
                reChargeUrl: '../api/v2/wx/pay/recharge/save',
                submitStatusCls: 'disabled',
                submitText: '确认支付',
                accountId: '',
                oldMoney: '',
                money: '',
                payAuthCode: '',
                clubId: '',
                paramData: null,
                payRequestObj: null
            }
        },
        created: function () {
            var that = this
            var global = that.global
            var params = global.currPageParams

            if (!global.userAgent.isWX) {
                Util.tipShow('请在微信中打开！')
                that.$router.back()
            } else if (global.checkAccess('recharge')) {
                that.accountId = params.accountId
                that.payAuthCode = params.code || global.authCode
                that.clubId = params.clubId || global.clubId
                var rechargeParam = Util.localStorage('con-recharge-param')
                if (rechargeParam) {
                    that.paramData = JSON.parse(rechargeParam)
                }
                if (that.paramData && that.payAuthCode) {
                    that.$http.post(that.getOpenIdUrl, {
                        code: that.payAuthCode,
                        scope: 'snsapi_base',
                        wxmp: '9358',
                        userType: 'user',
                        state: 'confirm-recharge'
                    }).then(function (res) {
                        res = res.body
                        if (res.statusCode == '935801') {
                            Global.getOauthCode('', '9358', 'confirm-recharge', 'base')
                        } else if (res.statusCode != 200) {
                            Util.tipShow(res.msg || '未能获取openId！')
                            that.$router.back()
                        }
                    })
                }
            } else {
                Util.tipShow('当前会所未开放此功能！')
                that.$router.back()
            }
        },
        mounted: function () {
            var that = this
            if (that.paramData) {
                Util.removeLocalStorage('con-recharge-param')
                that.money = that.paramData.amount
                that.submitStatusCls = ''
                that.doClickSubmitBtn()
            }
        },
        methods: {
            doInputOfMoney: function () {
                var that = this
                if (that.money == '') {
                    if (that.oldMoney.length > 1) {
                        that.money = that.oldMoney
                        that.submitStatusCls = ''
                    } else {
                        that.oldMoney = ''
                        that.submitStatusCls = 'disabled'
                    }
                } else {
                    var tmp = that.money.match(/\./g)
                    if (tmp && that.money.match(/\./g).length > 1) {
                        that.money = that.money.slice(0, -1)
                    }
                    if (!/^([1-9][0-9]*)$/g.test(that.money)) {
                        that.money = that.oldMoney
                        if (that.oldMoney != '') {
                            that.submitStatusCls = ''
                        }
                    } else {
                        if (that.money != 0) {
                            that.oldMoney = that.money
                            that.submitStatusCls = ''
                        } else {
                            that.submitStatusCls = 'disabled'
                        }
                    }
                }
            },
            doClickSubmitBtn: function () {
                var that = this
                if (that.submitStatusCls == 'disabled') {
                    return
                }
                if (that.submitStatusCls == 'processing') {
                    Util.tipShow('正在处理中，请稍候...')
                    return
                }
                that.submitStatusCls = 'processing'
                that.submitText = '支付...'
                var paramData = {
                    businessChannel: 'link',
                    accountId: that.accountId,
                    amount: that.money,
                    clubId: that.clubId || '',
                    tradeChannel: 'wx'
                }
                that.$http.post(that.reChargeUrl, paramData).then(function (res) {
                    res = res.body
                    if (res.statusCode == 200) {
                        that.payRequestObj = JSON.parse(res.respData)
                        if (typeof WeixinJSBridge == 'undefined') {
                            document.addEventListener('WeixinJSBridgeReady', function () {
                                that.onBridgeReady()
                            }, false)
                        } else {
                            that.onBridgeReady()
                        }
                    } else if (res.statusCode == '935801') {
                        Util.localStorage('con-recharge-param', JSON.stringify(paramData))
                        Global.getOauthCode('', '9358', 'confirm-recharge', 'base')
                    } else {
                        that.submitStatusCls = ''
                        that.submitText = '确认支付'
                        Util.tipShow(res.msg || '充值失败！')
                    }
                }, function () {
                    that.submitStatusCls = ''
                    that.submitText = '确认支付'
                    Util.tipShow('充值失败！')
                })
            },
            onBridgeReady: function () {
                var that = this
                var payRequestObj = that.payRequestObj
                WeixinJSBridge.invoke('getBrandWCPayRequest', {
                    'appId': payRequestObj.appId,     // 公众号名称，由商户传入
                    'timeStamp': payRequestObj.timeStamp + '',  // 时间
                    'nonceStr': payRequestObj.nonceStr, // 随机串
                    'package': payRequestObj.package,
                    'signType': payRequestObj.signType,   // 微信签名方式
                    'paySign': payRequestObj.paySign
                }, function (res) {
                    that.submitStatusCls = ''
                    that.submitText = '确认支付'
                    if (res.err_msg.indexOf('ok') >= 0) { // 支付成功之后
                        Util.tipShow('支付成功！')
                        that.$router.push({name: 'accountDetail', query: {accountId: that.accountId}})
                    } else {
                        Util.tipShow('未能成功支付！')
                    }
                })
            }
        }
    }
</script>