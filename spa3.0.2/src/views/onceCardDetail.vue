<style>
    @import '../styles/page/onceCardDetail.css';
</style>
<template>
    <div class="once-card-detail-page-wrap">
        <div class="page" id="once-card-detail-page">
            <page-title title-text="次卡详情"></page-title>
            <router-link class="banner" :style="{ 'background-image': 'url('+actData.bannerImg+')' }" tag="div" :to="{ path: '/'+clubId+'/home' }">
                <div><div :style="{ 'background-image': 'url('+clubLogo+')' }"></div><span>{{ clubName }}</span></div>
            </router-link>

            <div class="service-wrap">
                <div>{{ actData.name }}<span>{{ actItemData.duration }}{{ actItemData.durationUnit }}</span></div>
                <ul class="package-title">
                    <li v-for="(plan,index) in plans" :class="{ active : currActiveIndex == index, best : plan.optimal=='Y' }" @click="doSelectPlan(index)">买<span>{{ plan.paidCount }}</span>送<span>{{ plan.giveCount }}</span></li>
                </ul>
                <ul class="package-content">
                    <li :class="{ active : currActiveIndex==index }" v-for="(plan,index) in plans">
                        <div>{{ actItemData.name }}<span>{{ actItemData.price }}元/次</span><span>{{ plan.totalCount }}次</span></div>
                        <div>¥<b>{{ plan.actAmount | MoneyFormatter }}</b><span>¥{{ plan.originAmount*100 | MoneyFormatter }}</span><span>每次立减{{ plan.discountAmount }}元</span></div>
                    </li>
                </ul>
            </div>

            <div class="item-wrap pay">
                <div class="item-title">购买须知</div>
                <div class="strong">有效期</div>
                <div>自购买之日起<strong>{{ actData.period }}内</strong></div>
                <div class="strong">补充说明</div>
                <div v-html="actData.description"></div>
            </div>

            <div class="item-wrap service" :class="{ notPay: isNotPay }">
                <div class="item-title">相关项目</div>
                <div class="service-item">
                    <div :style="{ 'background-image': 'url('+actItemData.imgUrl+')' }"></div>
                    <div>{{ actItemData.name }}</div>
                    <div>{{ actItemData.price }}元/{{ actItemData.duration }}{{ actItemData.durationUnit }}<template v-if="actItemData.pricePlus"><span>加钟</span>{{ actItemData.pricePlus }}元/{{ actItemData.durationPlus }}{{ actItemData.durationUnitPlus }}</template></div>
                </div>
            </div>
        </div>
        <div class="submit-button footer" :class="{ sellOut: actData.statusName == '已售完' , expired: actData.statusName == '已过期', processing: inProcessing }" @click="doClickConfirmBtn()">{{ isNotPay ? '逛商城、找优惠' : (inProcessing ? '购买中...' : '购买') }}</div>
    </div>
</template>
<script>
    import { Global } from '../libs/global'
    import Util from '../libs/util'
    import MoneyFormatter from '../filters/money-formatter'

    module.exports = {
        filters: {
            MoneyFormatter: MoneyFormatter
        },
        data: function () {
            return {
                global: Global.data,
                cardId: '',
                clubId: '',
                techId: '',

                clubName: '',
                clubLogo: '',
                actData: {
                    bannerImg: '',
                    name: '',
                    period: '',
                    description: '',
                    statusName: ''
                },
                actItemData: {
                    duration: '',
                    durationUnit: '',
                    imgUrl: '',
                    name: '',
                    price: '',
                    pricePlus: '',
                    durationPlus: '',
                    durationUnitPlus: ''
                },
                plans: [],
                currActiveIndex: 0,
                isNotPay: false,

                paramData: null,
                payAuthCode: '',
                openId: '',
                inProcessing: false,
                payRequestObj: null
            }
        },
        created: function () {
            var that = this
            var global = that.global
            var query = global.currPage.query

            that.clubId = query.clubId || global.clubId || ''
            that.cardId = query.id
            that.techId = query.techId

            if (!that.clubId || !that.cardId) {
                Util.tipShow(global.visitError)
                return that.$router.back()
            }

            that.paramData = Util.localStorage('once-card-pay-param')
            that.payAuthCode = query.code

            if (global.userAgent.isWX && that.paramData && that.payAuthCode) { // 获取openId
                Global.getOpenId({authCode: that.payAuthCode}).then(function (res) {
                    that.openId = res.openid
                    that.init()
                })
            } else {
                that.init()
            }
        },
        methods: {
            init: function () {
                var that = this
                var global = that.global
                that.$http.get('../api/v2/club/once_card/activity/detail', {params: {
                    activityId: that.cardId,
                    clubId: that.clubId
                }}).then(function (res) {
                    res = res.body
                    if (res.statusCode == 200) {
                        res = res.respData
                        var actData = res.activity
                        var actItemData = res.item
                        var thisActData = that.actData
                        var thisActItemData = that.actItemData
                        var plans = actData.onceCardPlans
                        var k
                        var plan
                        var periodObj = {'Y': '年', 'M': '月', 'D': '日'}

                        that.clubName = res.clubName
                        that.clubLogo = res.clubImageUrl || global.defaultClubLogo
                        thisActData.bannerImg = actData.imageUrl
                        thisActData.name = actData.name
                        thisActData.period = actData.period.replace(/(Y|M|D)/g, function () {
                            if (periodObj[arguments[0]]) {
                                return periodObj[arguments[0]]
                            }
                            return arguments[0]
                        })
                        thisActData.description = actData.description || '无'
                        thisActData.statusName = actData.statusName
                        that.isNotPay = (actData.statusName == '已售完' || actData.statusName == '已过期')

                        thisActItemData.duration = actItemData.duration
                        thisActItemData.durationUnit = actItemData.durationUnit
                        thisActItemData.imgUrl = actItemData.imageUrl || global.defaultServiceItemImgUrl
                        thisActItemData.name = actItemData.name
                        thisActItemData.price = actItemData.price
                        thisActItemData.pricePlus = actItemData.pricePlus
                        thisActItemData.durationPlus = actItemData.durationPlus
                        thisActItemData.durationUnitPlus = actItemData.durationUnitPlus

                        actItemData.price = parseFloat(actItemData.price)
                        for (k = 0; k < plans.length; k++) {
                            plan = plans[k]
                            if (plan.optimal == 'Y') {
                                that.currActiveIndex = k
                            }
                            plan.totalCount = plan.paidCount + plan.giveCount
                            plan.originAmount = actItemData.price * plan.totalCount
                            plan.discountAmount = ((plan.originAmount - plan.actAmount / 100) / plan.totalCount).toFixed(2)
                        }
                        that.plans = plans
                        global.loading = false

                        if (that.paramData) {
                            that.currActiveIndex = that.paramData
                            that.doClickConfirmBtn()
                        }
                    } else {
                        Util.tipShow(res.msg || '查询次卡详情失败！')
                        return that.$router.back()
                    }
                }, function () {
                    Util.tipShow('查询次卡详情失败！')
                    return that.$router.back()
                })
            },
            doSelectPlan: function (index) {
                this.currActiveIndex = index
            },
            doClickConfirmBtn: function () {
                var that = this
                var global = that.global
                if (that.isNotPay) {
                    return that.$router.push({name: 'discountMall'})
                }
                if (!global.userAgent.isWX) {
                    return Util.tipShow('请在微信中打开！')
                }
                if (that.inProcessing) {
                    return Util.tipShow('购买中，请稍候...')
                }
                that.inProcessing = true
                var selectedPlan = that.plans[that.currActiveIndex]
                that.$http.post('../api/v2/wx/pay/once_card/save', {
                    clubId: that.clubId,
                    techId: that.techId,
                    itemPlanId: selectedPlan.id
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
                        Util.localStorage('once-card-pay-param', that.currActiveIndex)
                        Global.getOauthCode('', '9358', 'once-card-pay', 'base')
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
                                that.$router.push({name: 'onceCardOrders'})
                            } else {
                                Util.tipShow('未能成功支付！')
                                that.$http.post('../api/v2/wx/pay/activity/payment/cancel', {payId: payRequestObj.payId})
                            }
                        })
            }
        }
    }
</script>