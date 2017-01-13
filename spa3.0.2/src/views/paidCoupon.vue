<style>
    @import '../styles/page/paidCoupon.css';
</style>
<template>
    <div>
        <div class="page paid-coupon-page" id="paid-coupon-page" :style="{ height : (global.winHeight-6.966*global.winScale*16)+'px' }">
            <page-title title-text="点钟券"></page-title>
            <div class="club-info" @click="doClickClubInfo()">
                <div :style="{ backgroundImage : 'url('+(couponData.imageUrl || global.defaultClubLogo )+')' }"></div>
                <span>{{ couponData.clubName }}</span></div>
            <div class="coupon-info">
                <div>
                    <router-link :style="{ backgroundImage : 'url('+(couponData.techs.avatarUrl || global.defaultHeader )+')' }" :to="{ name : 'chat', query : { techId : couponData.techs.id, clubId : couponData.clubId }}"></router-link>
                    <div>{{ couponData.techs.name }}<span v-show="couponData.techs.serialNo">[<span>{{ couponData.techs.serialNo }}</span>]</span></div>
                </div>
                <div>
                    <div>
                        <div>{{ couponData.actTitle }}</div>
                        <div>{{ couponData.actValue }}元抵{{ couponData.consumeMoney }}元</div>
                    </div>
                    <div>点钟券</div>
                </div>
                <div>券有效期：<span>{{ couponData.couponPeriod }}</span></div>
            </div>
            <div class="coupon-desc">
                <div><i></i>使用说明：</div>
                <div v-html="couponData.actContent"></div>
            </div>
        </div>
        <div class="paid-coupon-bottom-wrap">
            <div>
                <span @click="doClickChangeCount(0)">-</span><span>{{ payCount }}</span><span @click="doClickChangeCount(1)">+</span>
                <div>共支付：￥<span>{{ payCount*couponData.actValue*100 | MoneyFormatter }}</span>元</div>
            </div>
            <div :class="{ processing : inPaid , downline : isDownLine }" @click="doClickPayBtn()">{{ isDownLine ? "已下线": ( inPaid ? "购买中..." : "立即购买")}}</div>
        </div>
    </div>
</template>
<script>
    import { Global } from '../libs/global'
    import Util from '../libs/util'
    import MoneyFormatter from '../filters/money-formatter'

    module.exports = {
        data: function () {
            return {
                global: Global.data,
                getDataUrl: '../api/v2/club/redpacket/data',
                getOpenIdUrl: '../api/v2/wx/oauth2/user/openid',
                paidUrl: '../api/v2/wx/pay/paid_coupon',
                actId: '',
                techCode: '',
                inPaid: false,
                chanel: '',
                paramData: Util.localStorage('paid-coupon-param'),
                payAuthCode: '',
                couponData: null,
                payCount: 1,
                isDownLine: false,
                payRequestObj: null
            }
        },
        created: function () {
            var that = this
            var global = that.global
            var query = global.currPage.query

            that.actId = query.actId
            that.techCode = query.techCode
            that.payAuthCode = query.code || global.authCode
            that.chanel = query.channel || 'link'
            if (!that.actId || !that.techCode) {
                Util.tipShow(global.visitError)
                that.$router.back()
            } else {
                that.$http.get(that.getDataUrl, {
                    params: {
                        actId: that.actId,
                        userCode: '',
                        techCode: that.techCode,
                        chanel: that.chanel,
                        phoneNum: ''
                    }
                }).then(function (res) {
                    res = res.body
                    if (res.statusCode == 200) {
                        res = res.respData
                        if (res.status == 'downline_can_use') {
                            that.isDownLine = true
                        }
                        that.couponData = res
                    } else {
                        Util.tipShow(res.msg || '获取点钟券数据失败！')
                        that.$router.back()
                    }
                }, function () {
                    Util.tipShow('获取点钟券数据失败！')
                    that.$router.back()
                })
            }
        },
        mounted: function () {
            var that = this
            if (that.paramData && that.payAuthCode) {
                that.$http.post(that.getOpenIdUrl, {
                    code: that.payAuthCode,
                    scope: 'snsapi_base',
                    wxmp: '9358',
                    userType: 'user',
                    state: 'confirm-order'
                }).then(function (res) {
                    res = res.body
                    if (res.statusCode == 200) {
                        that.doClickPayBtn()
                        Util.removeLocalStorage('paid-coupon-param')
                    } else if (res.statusCode == 935801) {
                        Global.getOauthCode('', '9358', 'paid-coupon', 'base')
                    } else {
                        Util.tipShow(res.msg || '获取openId失败！')
                    }
                })
            }
        },
        methods: {
            doClickClubInfo: function () { // 点击会所
                var that = this
                var global = that.global
                var couponData = that.couponData

                if (global.pageMode != 'club') {
                    that.$router.push({name: 'home'})
                } else {
                    that.$router.push({path: '/' + couponData.clubId + '/home'})
                }
            },
            doClickChangeCount: function (isAdd) {
                var that = this
                if (isAdd) {
                    if (that.payCount < 999) {
                        that.payCount++
                    }
                } else {
                    if (that.payCount > 1) {
                        that.payCount--
                    }
                }
            },
            doClickPayBtn: function () { // 点击购买按钮
                var that = this
                var global = that.global
                if (!that.isDownLine) {
                    if (!global.userAgent.isWX) {
                        if (global.checkAccess('paidCoupon')) {
                            Util.tipShow('请您打开微信登录\'9358\'公众号！')
                        }
                        return
                    }
                    if (!global.isLogin || !global.userTel) {
                        Global.login(null, 'paidCoupon')
                        if (!global.isLogin) {
                            Util.tipShow('请您先登录！')
                            that.$router.push({name: 'login'})
                        } else {
                            global.bindTelPhone()
                        }
                    } else if (!that.inPaid) { // 支付
                        that.inPaid = true
                        that.$http.post(that.paidUrl, {
                            actId: that.actId,
                            businessType: 'paid_coupon',
                            businessChannel: that.chanel,
                            clubId: that.couponData.clubId,
                            money: that.couponData.actValue * parseInt(that.payCount),
                            count: parseInt(that.payCount),
                            openId: global.openId,
                            techId: that.couponData.techs.id,
                            tradeChannel: 'wx'
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
                                Util.localStorage('paid-coupon-param', true)
                                Global.getOauthCode('', '9358', 'paid-coupon', 'base')
                            } else {
                                that.inPaid = false
                                Util.tipShow(res.msg || '购买点钟券请求失败！')
                            }
                        }, function () {
                            that.inPaid = false
                            Util.tipShow('购买点钟券请求异常！')
                        })
                    }
                }
            },
            onBridgeReady: function () {
                var that = this
                var payRequestObj = that.payRequestObj
                WeixinJSBridge.invoke('getBrandWCPayRequest', {
                    'appId': payRequestObj.appId,     // 众号名称，由商户传入
                    'timeStamp': payRequestObj.timeStamp + '',  // 时间
                    'nonceStr': payRequestObj.nonceStr, // 随机串
                    'package': payRequestObj.package,
                    'signType': payRequestObj.signType, // 微信签名方式
                    'paySign': payRequestObj.paySign
                }, function (res) {
                    that.inPaid = false
                    if (res.err_msg.indexOf('ok') >= 0) { // 支付成功之后
                        Util.tipShow('支付成功！')
                        // 发送环信消息
                    } else {
                        Util.tipShow('未能成功支付！')
                    }
                })
            }
        },
        filters: {
            MoneyFormatter: MoneyFormatter
        }
    }
</script>