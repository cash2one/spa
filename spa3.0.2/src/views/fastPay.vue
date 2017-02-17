<style>
    @import '../styles/page/fastPay.css';
</style>
<template>
    <div class="page" id="fast-pay-page">
        <div class="top-wrap" :class="{ act: topPage }">
            <div class="header" :style="{ 'background-image' : 'url('+techHeader+')'}"></div>
            <div class="name">{{ techName }}<span v-if="techNo">{{ techNo }}</span></div>
        </div>
        <div class="center-wrap">
            <div>消费金额：</div>
            <input type="text" maxlength="7" v-model="money" @input="onInputMoney()" @focus="onFocusMoneyInput()" @blur="onBlurMoneyInput()"/>
        </div>
        <div class="bottom-wrap" :style="{ 'margin-top': mTop+'rem' }">
            <div>如需用使用券，请到收银台买单~</div>
            <div>
                <div @click="doCancel()">取消</div>
                <div @click="doConfirm()" :class="{ processing: inProcessing }">{{ inProcessing ? '支付中...' : '确认' }}</div>
            </div>
        </div>
    </div>
</template>
<script>
    import { Global } from '../libs/global'
    import Util from '../libs/util'

    module.exports = {
        data: function () {
            return {
                global: Global.data,
                money: '',
                clubId: '',
                techId: '',
                techName: '',
                techNo: '',
                techHeader: '',

                paramData: null,
                payAuthCode: '',
                openId: '',

                mTop: 0,
                topPage: false,
                inProcessing: false,
                payRequestObj: null
            }
        },
        created: function () {
            var that = this
            var global = that.global
            var query = global.currPage.query
            if (query.techId == undefined) {
                Util.tipShow(global.visitError)
                return that.$router.back()
            } else {
                if (!Global.checkAccess('fastPay')) {
                    return that.$router.replace({name: 'fastPayError', query: {info: encodeURIComponent('在线买单功能已关闭！')}})
                }
                that.techId = query.techId
                that.paramData = Util.localStorage('fast-pay-param')
                that.payAuthCode = query.code

                if (global.userAgent.isWX && that.paramData && that.payAuthCode) { // 获取openId
                    Global.getOpenId({authCode: that.payAuthCode}).then(function (res) {
                        that.openId = res.openid
                        that.init()
                    })
                } else {
                    that.init()
                }
            }
        },
        methods: {
            init: function () {
                var that = this
                var global = that.global
                // 获取技师信息
                that.$http.get('../api/v2/club/fastpay/tech/get', {params: {techId: that.techId}}).then(function (res) {
                    res = res.body
                    if (res.statusCode == 200) {
                        res = res.respData
                        that.clubId = res.clubId
                        that.techName = res.techName
                        that.techNo = res.techNo
                        that.techHeader = res.avatarUrl || global.defaultHeader
                        that.mTop = global.winHeight / (16 * global.winScale) - 24.4444
                        global.fullPage = true
                        global.loading = false

                        if (that.paramData) {
                            that.money = that.paramData
                            that.doConfirm()
                        }
                    } else {
                        var errorInfo = res.msg || '未能获取到技师信息！'
                        Util.tipShow(errorInfo)
                        that.$router.replace({name: 'fastPayError', query: {info: encodeURIComponent(errorInfo)}})
                    }
                })
            },
            doCancel: function () {
                var that = this
                that.$router.push({name: 'comment', query: {techId: that.techId, type: 'tech', from: 'fastPay'}})
            },
            doConfirm: function () {
                var that = this
                var global = that.global
                var thisMoney = that.money
                if (!global.userAgent.isWX) {
                    return Util.tipShow('请在微信中打开！')
                }
                if (that.inProcessing) {
                    return Util.tipShow('支付中，请稍候...')
                }
                if (!thisMoney) {
                    return Util.tipShow('请输入消费金额！')
                }
                if (parseFloat(thisMoney) < 0.001) {
                    return Util.tipShow('买单金额不能为0！')
                }
                if (!(parseFloat(thisMoney) < 5000.001)) {
                    return Util.tipShow('单笔支付请不要超过5000元！')
                }
                that.inProcessing = true
                that.$http.post('../api/v2/wx/pay/fast_pay/save', {
                    amount: thisMoney * 100,
                    clubId: that.clubId,
                    techId: that.techId
                }).then(function (res) {
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
                    } else if (res.statusCode == 935801) {
                        Util.localStorage('fast-pay-param', that.money)
                        Global.getOauthCode('', '9358', 'fast-pay', 'base')
                    } else {
                        that.inProcessing = false
                        Util.tipShow(res.msg || '支付失败！')
                    }
                }, function () {
                    that.inProcessing = false
                    Util.tipShow('支付请求失败！')
                })
            },
            onBridgeReady: function () {
                var that = this
                var payRequestObj = that.payRequestObj
                WeixinJSBridge.invoke(
                        'getBrandWCPayRequest', {
                            appId: payRequestObj.appId,
                            timeStamp: payRequestObj.timeStamp + '',
                            nonceStr: payRequestObj.nonceStr,
                            package: payRequestObj.package,
                            signType: payRequestObj.signType,
                            paySign: payRequestObj.paySign
                        },
                        function (res) {
                            that.inProcessing = false
                            if (res.err_msg && res.err_msg.indexOf('ok') >= 0) { // 支付成功之后
                                Util.tipShow('支付成功！')
                                that.$router.push({name: 'comment', query: {techId: that.techId, type: 'tech', from: 'fastPay'}})
                            } else {
                                Util.tipShow('未能成功支付！')
                            }
                        })
            },
            // 输入框获取焦点时
            onFocusMoneyInput: function () {
                var that = this
                that.topPage = true
                that.mTop += 3
            },
            // 输入框失去焦点时
            onBlurMoneyInput: function () {
                var that = this
                that.topPage = false
                that.mTop -= 3
            },
            // 金额输入限制
            onInputMoney: function () {
                var that = this
                var val = that.money
                if (val.length == 1) {
                    if (/\D/.test(val)) {
                        val = ''
                    }
                } else {
                    val = val.replace(/[^\d.]/g, '')
                    var dotIndex = 0
                    val = val.replace(/\./g, function () {
                        if (dotIndex == 0) {
                            dotIndex = arguments[1]
                            return '.'
                        } else {
                            return ''
                        }
                    })
                    if (dotIndex > 0) {
                        val = val.substring(0, dotIndex + 3)
                    }
                }
                that.money = val
            }
        }
    }
</script>