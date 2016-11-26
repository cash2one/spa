<style>
    @import '../styles/page/qrPay.css';
</style>
<template>
    <div class="page" id="qrpay-page" :style="{ height : global.winHeight+'px' }">
        <div class="page-title"><a class="back" @click="doClickPageBack()"></a>支付</div>
        <div class="club-info">
            <div>
                <div :style="{ backgroundImage : 'url('+(logoImgUrl || global.defaultClubLogo )+')' }"></div>
                <p>{{ clubName }}</p>
            </div>
        </div>
        <div class="money-info">
            <div>消费金额</div>
            <div>
                <span>￥</span>
                <div>
                    <input type="number" pattern="[0-9]*" v-model="payMoney" @focus="onFocusOfInput()" @blur="onBlurOfInput()" @input="onInputOfPayMoney()"/>
                    <span v-show="showInputTip">请询问服务员后输入</span>
                    <i @click="doClickClearBtn()"></i></div>
            </div>
        </div>
        <div class="pay-btn" :class="payBtnStatusCls" @click="doClickPayBtn()">{{ payBtnText }}</div>
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
                getClubNameUrl: '../api/v2/club/',
                consumeUrl: '../api/v2/wx/pay/consume/save',
                logoImgUrl: '',
                clubName: '',
                payBtnStatusCls: 'disabled',
                payBtnText: '确认支付',
                showInputTip: true,
                payMoney: '',

                openId: Util.localStorage('_qrpay_user_open_id') || '',
                clubId: '',
                payAuthCode: '',
                paramData: '',
                oldMoney: '',
                payRequestObj: null
            }
        },
        created: function () {
            var that = this
            var global = that.global
            var pageParams = global.currPage.query

            that.clubId = pageParams.clubId
            if (!that.clubId && global.pageMode == 'club') {
                that.clubId = global.clubId
            }
            if (!that.clubId) {
                Util.tipShow(global.visitError)
                that.$router.back()
            } else {
                that.getClubNameUrl += that.clubId + '/clubName'
                that.payAuthCode = pageParams.payAuthCode || global.authCode
                var param = Util.localStorage('con-qrpay-param')
                if (param) {
                    that.paramData = JSON.parse(param)
                }

                if (global.userAgent.isWX) {
                    if (!that.openId || that.openId.length < 10) {
                        if (((+new Date()) - (global.currPage.query['_t'] || 0) > 2400) || !that.payAuthCode) {
                            Global.getOauthCode('', '9358', 'confirm-qrpay', 'base')
                        } else {
                            that.$http.get(that.getOpenIdUrl, {params: {
                                code: that.payAuthCode,
                                scope: 'snsapi_base',
                                wxmp: '9358',
                                openId: '',
                                webSessionId: ''
                            }}).then(function (res) {
                                res = res.body
                                if (res.statusCode == 200) {
                                    that.openId = res.respData.openid
                                    Util.localStorage('_qrpay_user_open_id', that.openId)
                                } else if (res.statusCode == 40029) {
                                    Util.getOauthCode('', '9358', 'confirm-qrpay', 'base')
                                } else {
                                    Util.tipShow(res.msg || '未能获取openId！')
                                    that.$router.back()
                                }
                            })
                        }
                    }
                }
            }
        },
        mounted: function () {
            var that = this
            that.$http.get(that.getClubNameUrl).then(function (res) {
                res = res.body
                if (res.name) {
                    that.logoImgUrl = res.logo
                    that.clubName = res.name
                }
                if (that.paramData) {
                    Util.removeLocalStorage('con-recharge-param')
                    that.payMoney = that.paramData.amount
                    that.payBtnStatusCls = ''
                    that.doClickPayBtn()
                }
            })
        },
        methods: {
            doClickPageBack: function () {
                history.back()
            },
            doClickClearBtn: function () {
                var that = this
                that.payMoney = ''
                that.oldMoney = ''
                that.showInputTip = true
            },
            onFocusOfInput: function () {
                this.showInputTip = false
            },
            onBlurOfInput: function () {
                var that = this
                if (that.payMoney == '') {
                    that.showInputTip = true
                }
            },
            onInputOfPayMoney: function () {
                var that = this
                if (that.payMoney == '') {
                    if (that.oldMoney.length > 1) {
                        that.payMoney = that.oldMoney
                    } else {
                        that.oldMoney = ''
                        that.payBtnStatusCls = 'disabled'
                    }
                } else {
                    var tmp = that.payMoney.match(/\./g)
                    if (tmp && tmp.length > 1) {
                        that.payMoney = that.payMoney.slice(0, -1)
                    }
                    if (!/^([1-9][0-9]*)$/g.test(that.payMoney)) {
                        that.payMoney = that.oldMoney
                    } else {
                        that.oldMoney = that.payMoney
                    }
                    that.payBtnStatusCls = ''
                }
            },
            doClickPayBtn: function () {
                var that = this
                if (that.payBtnStatusCls != 'disabled') {
                    if (that.payBtnStatusCls == 'processing') {
                        Util.tipShow('正在处理中，请稍候...')
                    } else {
                        that.payBtnStatusCls = 'processing'
                        that.payBtnText = '支付...'
                        var paramData = {
                            businessChannel: 'link',
                            amount: parseFloat(that.payMoney),
                            clubId: that.clubId || '',
                            tradeChannel: 'wx',
                            openId: that.openId
                        }
                        that.$http.post(that.consumeUrl, paramData).then(function (res) {
                            res = res.body
                            if (res.statusCode == 200) {
                                paramData.payToken = res.respData.token
                                that.payRequestObj = JSON.parse(res.respData.payInfo)
                                if (typeof WeixinJSBridge == 'undefined') {
                                    document.addEventListener('WeixinJSBridgeReady', function () {
                                        that.onBridgeReady(paramData)
                                    }, false)
                                } else {
                                    that.onBridgeReady(paramData)
                                }
                            } else if (res.statusCode == '935801') {
                                Util.localStorage('con-qrpay-param', JSON.stringify(paramData))
                                Global.getOauthCode('', '9358', 'confirm-qrpay', 'base')
                            } else {
                                that.payBtnStatusCls = ''
                                that.payBtnText = '确认支付'
                                Util.tipShow(res.msg || '支付失败！')
                            }
                        }, function () {
                            that.payBtnStatusCls = ''
                            that.payBtnText = '确认支付'
                            Util.tipShow('支付失败！')
                        })
                    }
                }
            },
            onBridgeReady: function (paramData) {
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
                    that.payBtnStatusCls = ''
                    that.payBtnText = '确认支付'
                    if (res.err_msg.indexOf('ok') >= 0) { // 支付成功之后
                        Util.tipShow('支付成功！')
                        that.$router.push({
                            name: 'qrPayComplete',
                            query: {clubId: paramData.clubId, money: paramData.amount, payToken: paramData.payToken}
                        })
                    } else {
                        Util.tipShow('未能成功支付！')
                    }
                })
            }
        }
    }
</script>