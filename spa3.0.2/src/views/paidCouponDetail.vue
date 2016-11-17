<style>
    @import '../styles/page/paidCoupon.css';
</style>
<template>
    <div>
        <div class="page paid-coupon-page" id="paid-coupon-detail-page" v-show="!global.loading" :style="{ height : (global.winHeight-(hidePayBtn ? 0 : 3.278)*global.winScale*16)+'px' }">
            <div class="page-title"><a class="back" @click="doClickPageBack()"></a>点钟券详情</div>
            <div class="club-info" @click="doClickClubInfo()" v-show="global.pageMode != 'club'">
                <div :style="{ backgroundImage : 'url('+(couponData.imageUrl || global.defaultClubLogo )+')' }"></div>
                <span>{{ couponData.clubName }}</span></div>
            <div class="detail-info">
                <div>
                    <router-link :style="{ backgroundImage : 'url('+(couponData.techs.avatarUrl || global.defaultHeader )+')' }" :to="{ name : 'chat', query : { techId : couponData.techs.id, clubId : couponData.clubId }}"></router-link>
                </div>
                <div>
                    <div>
                        <div>
                            <div>{{ couponData.techs.name }}</div>
                            <div v-show="couponData.techs.serialNo">[<span>{{ couponData.techs.serialNo }}</span>]</div>
                        </div>
                        <div>
                            <div class="stars">
                                <div :style="{ width : couponData.techs.star+'%' }"></div>
                            </div>
                            <div>{{ couponData.techs.commentCount }}评论</div>
                        </div>
                    </div>
                    <div></div>
                    <div>
                        <div>{{ couponData.techs.description || "这个技师很懒，没有填写个人简介..." }}</div>
                        <router-link :to="{ name : 'confirmOrder', query : { techId : couponData.techs.id , clubId : couponData.clubId }}">预约</router-link>
                    </div>
                </div>
            </div>
            <div class="detail-desc">
                <div>
                    <div>{{ couponData.userAct.actTitle }}</div>
                    <div>{{ couponData.userAct.consumeMoneyDescription }}</div>
                    <div>券有效期：<span>{{ couponData.userAct.couponPeriod }}</span></div>
                    <div>购买时间：<span>{{ couponData.userAct.getDate }}</span></div>
                    <div :class="couponStatusCls">{{ couponStatusDescription }}</div>
                    <span>30分钟未支付将失效</span>
                </div>
                <div>
                    <div>电子票号（使用时请出示二维码，或者优惠码）</div>
                    <img alt="二维码" v-show="qrCodeImgUrl" :src="qrCodeImgUrl"/>
                    <span>{{ couponData.userAct.couponNo }}</span>
                </div>
            </div>
            <div class="detail-use-desc">
                <div>使用说明：</div>
                <div v-html="couponData.userAct.actContent"></div>
            </div>
        </div>
        <div class="paid-coupon-pay-btn" v-show="!hidePayBtn">
            <div :class="{ downline : footerBtnText=='已下线' , processing : inPaid }" @click="doClickPayBtn()">{{footerBtnText }}</div>
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
                queryDataUrl: '../api/v2/club/userredpacket/',
                getOpenIdUrl: '../api/v2/wx/oauth2/user/openid',
                queryQrCodeUrl: '../api/v2/club/user/coupon_qrcode',
                payUrl: '../api/v2/wx/pay/paid_coupon_immediately',
                userActId: '',
                couponData: null,
                qrCodeImgUrl: '',
                getQrCodeCount: 0,
                paramData: Util.localStorage('paid-cou-detail-param'),
                inPaid: false,
                payAuthCode: '',
                payRequestObj: null,
                footerBtnText: '立即支付',
                couponStatusCls: '',
                couponStatusDescription: '',
                hidePayBtn: false
            }
        },
        created: function () {
            var that = this
            var global = that.global
            var query = global.currPage.query
            that.userActId = query.userActId
            console.log('paid coupon detail userActId;' + that.userActId)
            if (!that.userActId) {
                Util.tipShow(global.visitError)
                that.$router.back()
            } else if (!global.isLogin) {
                Global.loginParams('paidCouponDetail')
                that.$router.push({name: 'login'})
            } else {
                that.payAuthCode = query.code || global.authCode
                that.queryDataUrl += that.userActId
                global.loading = true
                that.$http.get(that.queryDataUrl, {params: {userType: 'user'}}).then(function (res) {
                    res = res.body
                    if (res.statusCode == 200) {
                        global.loading = false
                        res = res.respData
                        res.userAct.getDate = res.userAct.getDate.split(' ')[0]
                        if (res.userAct.couponQrCodeUrl) {
                            that.qrCodeImgUrl = res.userAct.couponQrCodeUrl
                        } else {
                            that.getQrCodeImg() // 获取二维码
                        }
                        var couponNo = res.userAct.couponNo
                        res.userAct.couponNo = couponNo.substr(0, 4) + ' ' + couponNo.substr(4, 4) + ' ' + couponNo.substr(8)

                        if (res.userAct.couponStatus == 1) {
                            that.couponStatusCls = 'already'
                            that.footerBtnText = '立即预约'
                        } else if (res.actStatus != 'online') {
                            that.footerBtnText = '已下线'
                        } else if (res.userAct.couponStatus != 0) {
                            that.couponStatusCls = 'expire'
                            that.hidePayBtn = true
                        }
                        that.couponStatusDescription = res.userAct.couponStatusDescription
                        that.couponData = res
                    } else {
                        Util.tipShow(res.msg || '获取点钟券数据详情失败！')
                        that.$router.back()
                    }
                }, function () {
                    Util.tipShow('获取点钟券数据详情失败！')
                    global.loading = false
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
                    state: 'paid-cou-detail'
                }).then(function (res) {
                    res = res.body
                    if (res.statusCode == 200) {
                        that.doClickPayBtn()
                        Util.removeLocalStorage('paid-cou-detail-param')
                    } else if (res.statusCode == 935801) {
                        Global.getOauthCode('', '9358', 'paid-cou-detail', 'base')
                    } else {
                        Util.tipShow(res.msg || '获取openId失败！')
                    }
                })
            }
        },
        methods: {
            doClickPageBack: function () {
                history.back()
            },
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
            getQrCodeImg: function () { // 获取二维码图片
                var that = this
                that.getQrCodeCount++
                that.$http.get(that.queryQrCodeUrl, {params: {userActId: that.userActId}}).then(function (res) {
                    res = res.body
                    if (res.statusCode == 200 && res.respData) {
                        that.qrCodeImgUrl = res.respData
                    } else if (that.getQrCodeCount < 4) {
                        that.getQrCodeImg()
                    }
                })
            },
            doClickPayBtn: function () {
                var that = this
                var couponData = that.couponData
                var global = that.global
                if (that.footerBtnText != '已下线') {
                    if (that.footerBtnText == '立即支付') {
                        if (!global.userAgent.isWX) {
                            if (global.checkAccess('paidCouponDetail')) {
                                Util.tipShow('请您打开微信登录\'9358\'公众号！')
                            }
                            return
                        } else if (!global.userTel) {
                            Global.loginParams('paidCouponDetail')
                            that.$router.push({name: 'bindPhone'})
                        } else {
                            Util.removeLocalStorage('paid-cou-detail-param')
                            if (!that.inPaid) {
                                that.inPaid = true
                                that.footerBtnText = '支付中...'
                                that.$http.post(that.payUrl, {
                                    actId: couponData.userAct.actId,  // 点钟券id
                                    businessType: 'paid_coupon',
                                    businessChannel: couponData.userAct.chanel,
                                    clubId: couponData.userAct.clubId,
                                    money: couponData.userAct.actValue,
                                    openId: global.openId,
                                    techId: couponData.techs.id,
                                    tradeChannel: 'wx',
                                    bizId: couponData.userAct.bizId,
                                    userId: global.userId
                                }).then(function (res) {
                                    res = res.body
                                    if (res.statusCode == 200) {
                                        res = res.respData
                                        if (res) {
                                            that.payRequestObj = JSON.parse(res)
                                            if (typeof WeixinJSBridge == 'undefined') {
                                                document.addEventListener('WeixinJSBridgeReady', function () {
                                                    that.onBridgeReady()
                                                }, false)
                                            } else {
                                                that.onBridgeReady()
                                            }
                                        } else {
                                            that.inPaid = false
                                            that.footerBtnText = '立即预约'
                                            Util.tipShow('您已成功支付！')
                                            that.couponStatusCls = 'already'
                                            that.couponStatusDescription = '已支付'
                                        }
                                    } else if (res.statusCode == 935801) {
                                        Util.localStorage('paid-cou-detail-param', true)
                                        Global.getOauthCode('', '9358', 'paid-coupon-detail', 'base')
                                    } else {
                                        that.inPaid = false
                                        that.footerBtnText = '立即支付'
                                        Util.tipShow(res.msg || '购买点钟券请求失败！')
                                    }
                                })
                            }
                        }
                    } else if (that.footerBtnText == '立即预约') {
                        that.$router.push({
                            name: 'confirmOrder',
                            query: {techId: couponData.techs.id, clubId: couponData.clubId}
                        })
                    }
                }
            },
            onBridgeReady: function () {
                var that = this
                var payRequestObj = that.payRequestObj
                WeixinJSBridge.invoke('getBrandWCPayRequest', {
                    'appId': payRequestObj.appId,     // 公众号名称，由商户传入
                    'timeStamp': payRequestObj.timeStamp + '',  // 时间
                    'nonceStr': payRequestObj.nonceStr, // 随机串
                    'package': payRequestObj.package,
                    'signType': payRequestObj.signType, // 微信签名方式
                    'paySign': payRequestObj.paySign
                }, function (res) {
                    that.inPaid = false
                    if (res.err_msg.indexOf('ok') >= 0) { // 支付成功之后
                        Util.tipShow('支付成功！')
                        that.footerBtnText = '立即预约'
                        that.couponStatusCls = 'already'
                        that.couponStatusDescription = '已支付'
                        // 发送环信消息
                    } else {
                        that.footerBtnText = '立即支付'
                        Util.tipShow('未能成功支付！')
                    }
                })
            }
        }
    }
</script>