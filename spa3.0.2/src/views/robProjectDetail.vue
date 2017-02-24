<style>
    @import '../styles/page/robProjectDetail.css';
</style>
<template>
    <div>
        <div class="page" id="rob-project-detail-page" :style="{ height : (global.winHeight-2.943*16*global.winScale)+'px' }">
            <div class="top-banner">
                <router-link class="club" tag="div" :to="{ name: 'home' }"><div :style="{ 'background-image': 'url('+global.clubLogoUrl+')' }"></div><div>{{ global.clubName }}</div></router-link>
            </div>
            <div class="info">
                <div class="clear-fix"><div>{{ itemData.name }}</div><span v-show="isShowLimitUseTag">限时用</span></div>
                <div><span>{{ itemData.amount }}</span> 元<span v-show="itemData.credits>0">或</span><span v-show="itemData.credits>0"><span>{{ itemData.credits }}</span> 积分</span></div>
                <div>
                    <div><span>原价{{ itemData.price }}元</span></div>
                    <div><span v-if="itemData.canPaidCount>0">剩余{{ itemData.canPaidCount - itemData.paidCount }}份</span><span v-else>不限份数</span></div>
                </div>
            </div>
            <clock v-if="itemData.startDate" :start="itemData.startDate" :end="itemData.endDate" @status-change="doCounterStatusChange"></clock>

            <div class="act-desc">
                <div class="node-pad-icon">活动说明</div>
                <div class="act-desc-info">
                    <div class="item-title">可用时段</div>
                    <div class="use-time">{{ itemData.useStartDateStr }} - {{ itemData.useEndDateStr }}</div>
                    <div class="use-time" v-show="isShowLimitUseTag">{{ periodStr }}</div>
                    <div class="item-title">活动说明</div>
                    <div class="desc" v-html="itemData.instructions"></div>
                    <div class="item-title">活动时间</div>
                    <div class="act-time">{{ itemData.actTimeStr }}</div>
                </div>
            </div>

            <div class="item-desc">
                <div class="info-icon">项目说明</div>
                <div>
                    <div>
                        <div>
                            <div v-if="itemData.imageUrl" :style="{ backgroundImage : 'url('+itemData.imageUrl+')' }"></div>
                            <div>
                                <div>{{ itemData.name }}</div>
                                <div><span>{{ itemData.price }}元/{{ itemData.duration }}{{ itemData.durationUnit }}</span>&nbsp;&nbsp;<span v-show="itemData.pricePlus">{{ itemData.pricePlus }}元/{{ itemData.durationPlus }}{{ itemData.durationUnit }}</span></div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div>项目说明</div>
                        <div>
                            <div v-html="itemData.description || '无'"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="rob-project-confirm-btn" :class="{ 'disabled' : (status != 'started' || itemData.status != 'online' ), 'processing' : isProcessing }">
            <div v-show="isCredits" @click="doClickPayBtnOfCredit()" :class="{ processing : creditProcessing }">{{creditProcessing ? '购买中...' : '积分购买' }}</div>
            <div @click="doClickPayBtnOfCash()" :class="{ processing : cashProcessing }">{{ cashProcessing ? '购买中...' :'现金购买' }}</div>
        </div>
    </div>
</template>
<script>
    import { Global } from '../libs/global'
    import Util from '../libs/util'
    import WeekDayFormatter from '../filters/week-day-formatter'

    module.exports = {
        filters: {
            WeekDayFormatter: WeekDayFormatter
        },
        data: function () {
            return {
                global: Global.data,
                itemId: '',
                itemData: {},
                isCanPaid: false,
                isCredits: false,
                status: 'notStarted',
                isProcessing: false,
                creditProcessing: false, // 积分购买中
                cashProcessing: false, // 现金购买中
                cashPayData: null,

                periodStr: '',
                isShowLimitUseTag: false // 是否显示限时用标记
            }
        },
        beforeRouteEnter: function (to, from, next) {
            var query = to.query
            var global = Global.data
            var paramData = Util.sessionStorage('con-rob-project-param')
            var code = query.code

            if (!query.robProjectId) {
                Util.tipShow(global.visitError)
                next(false)
            } else {
                if (paramData && code) {
                    Global.getOpenId({authCode: code, userType: 'user', state: 'confirm-order'}).then(function () {
                        next(function (vm) {
                            vm.init()
                        })
                    })
                } else {
                    next(function (vm) {
                        vm.init()
                    })
                }
            }
        },
        methods: {
            init: function () {
                var that = this
                var global = that.global
                var query = global.currPage.query

                that.itemId = query.robProjectId
                that.$http.get('../api/v2/club/paid_service_item/view', {params: {id: that.itemId}}).then(function (res) {
                    res = res.body
                    if (res.statusCode == 200) {
                        res = res.respData
                        res.useStartDateStr = res.useStartDate.split(' ')[0].replace(/-/g, '.')
                        res.useEndDateStr = res.useEndDate.split(' ')[0].replace(/-/g, '.')
                        res.actTimeStr = res.startDate.replace(/-/g, '.') + ' - ' + res.endDate.replace(/-/g, '.')
                        if (res.usePeriod && (res.usePeriod.match(/(\d)/g).length != 7 || res.endTime)) {
                            that.isShowLimitUseTag = true
                        }
                        if (res.canPaidCount == 0 || res.canPaidCount - res.paidCount > 0) {
                            that.isCanPaid = true
                        }
                        if (that.isShowLimitUseTag) {
                            that.formatPeriodData(res)
                        }
                        that.itemData = res

                        Global.getClubSwitches(global.clubId).then(function (switchRes) {
                            if (switchRes.creditSwitch && res.credits > 0) {
                                that.isCredits = true
                            }
                        })
                        that.shareSetting(res.shareUrl, res.imageUrl, res.name)
                        global.loading = false
                    } else {
                        Util.tipShow(res.msg || '查询抢项目详情失败！')
                        that.$router.back()
                    }
                }, function () {
                    Util.tipShow('查询抢项目详情失败！')
                    that.$router.back()
                })
            },
            doCounterStatusChange: function (status) {
                this.status = status
            },
            // 设置分享
            shareSetting: function (shareUrl, imageUrl, name) {
                var that = this
                var global = that.global
                Global.shareConfig({
                    title: global.clubName + '-' + name + '限时抢购就等你来',
                    desc: '据说这个项目一般人抢不到，但是我觉得你可以！抢项目，约技师，享人间极乐。',
                    link: shareUrl || location.href,
                    imgUrl: imageUrl,
                    success: function () {
                    },
                    fail: function () {
                        Util.tipShow('分享失败！请刷新页面后再试！')
                    }
                })
            },
            doCheck: function () {
                var that = this
                var global = that.global
                if (!global.isLogin) {
                    Util.tipShow('请您先登录！')
                    Global.login(that.$router)
                    return false
                } else if (!global.userTel) {
                    Global.bindPhone(true)
                    return false
                }
                return true
            },
            // 点击积分购买按钮
            doClickPayBtnOfCredit: function () {
                var that = this
                var global = that.global
                var query = global.currPage.query

                if (that.status == 'notStarted') {
                    return Util.tipShow('活动未开始！')
                } else if (that.status == 'over') {
                    return Util.tipShow('活动已结束！')
                } else if (that.itemData.status != 'online') {
                    return Util.tipShow('活动未上线！')
                }
                if (!that.doCheck()) return

                if (that.isCredits) {
                    if (that.isProcessing) {
                        return Util.tipShow('购买中，请稍候...')
                    }
                    that.isProcessing = true
                    that.creditProcessing = true
                    that.$http.get('../api/v2/club/credits/paid/service_item', {
                        params: {
                            id: that.itemId,
                            techCode: global.techInviteCode || query.techCode || '',
                            userCode: query.userCode || ''
                        }
                    }).then(function (res) {
                        res = res.body
                        that.isProcessing = false
                        that.creditProcessing = false
                        if (res.statusCode == 200) {
                            Util.tipShow('支付成功！')
                            that.$router.push({name: 'robProjectSuccess', query: {id: res.respData, isIntegral: 'true'}})
                        } else {
                            Util.tipShow(res.msg || '积分支付失败！')
                        }
                    }, function () {
                        that.isProcessing = false
                        that.creditProcessing = false
                        Util.tipShow('积分支付失败！')
                    })
                } else {
                    Util.tipShow('未开通积分购买！')
                }
            },
            // 点击现金购买按钮
            doClickPayBtnOfCash: function () {
                var that = this
                var global = that.global
                var query = global.currPage.query

                if (that.status == 'notStarted') {
                    return Util.tipShow('活动未开始！')
                } else if (that.status == 'over') {
                    return Util.tipShow('活动已结束！')
                } else if (that.itemData.status != 'online') {
                    return Util.tipShow('活动未上线！')
                }

                if (!global.userAgent.isWX) {
                    if (Global.checkAccess('robProjectDetail')) {
                        return Util.tipShow('请在微信中打开页面！')
                    } else {
                        return Util.tipShow('未开通此权限！')
                    }
                }
                if (!that.doCheck()) return
                if (that.isProcessing) {
                    return Util.tipShow('购买中，请稍候...')
                }

                that.isProcessing = true
                that.cashProcessing = true
                that.$http.post('../api/v2/wx/pay/paid_service_item/save', {
                    paidServiceItemId: that.itemId,
                    clubId: that.itemData.clubId,
                    tradeChannel: 'wx',
                    businessChannel: query.channel || 'link'
                }).then(function (res) {
                    res = res.body
                    if (res.statusCode == 200) {
                        that.cashPayData = JSON.parse(res.respData)
                        if (typeof WeixinJSBridge == 'undefined') {
                            document.addEventListener('WeixinJSBridgeReady', function () {
                                that.onBridgeReady()
                            }, false)
                        } else {
                            that.onBridgeReady()
                        }
                    } else if (res.statusCode == 935801) {
                        Util.localStorage('con-rob-project-param', true)
                        Global.getOauthCode('', '9358', 'confirm-rob-project', 'base')
                    } else {
                        Util.tipShow(res.msg || '抢项目失败！')
                        that.isProcessing = false
                        that.cashProcessing = false
                    }
                }, function () {
                    Util.tipShow('请求异常！')
                    that.isProcessing = false
                    that.cashProcessing = false
                })
            },
            onBridgeReady: function () {
                var that = this
                var cashPayData = that.cashPayData
                WeixinJSBridge.invoke('getBrandWCPayRequest', {
                    appId: cashPayData.appId,
                    timeStamp: cashPayData.timeStamp + '',
                    nonceStr: cashPayData.nonceStr,
                    package: cashPayData.package,
                    signType: cashPayData.signType,
                    paySign: cashPayData.paySign
                }, function (res) {
                    that.isProcessing = false
                    if (res.err_msg.indexOf('ok') >= 0) {
                        Util.tipShow('支付成功！')
                        that.$router.push({name: 'robProjectSuccess', query: {id: cashPayData.payId}})
                    } else {
                        that.cashProcessing = false
                        Util.tipShow('未能成功支付！')
                        // 支付失败，删除预支付订单
                        that.$http.get('../api/v2/wx/pay/activity/payment/cancel', {params: {payId: cashPayData.payId}})
                    }
                })
            },
            formatPeriodData: function (res) {
                var that = this
                var usePeriod = res.usePeriod || ''
                var str = '仅限'
                if (usePeriod === '1,2,3,4,5') {
                    str += '工作日（周一至周五）'
                } else if (usePeriod === '6,0') {
                    str += '周末（周六、周日）'
                } else if (usePeriod.match(/(\d)/g).length == 7) {
                    str += '周一至周日'
                } else {
                    str += (usePeriod || '').replace(/(\d)/g, function () {
                        return ['周日', '周一', '周二', '周三', '周四', '周五', '周六', ' 至 '][arguments[1]]
                    })
                }

                that.periodStr = str + ' ' + (res.startTime ? (res.startTime.replace(/:00$/g, '') + ':00 - ' + res.endTime.replace(/:00$/g, '') + ':00') : '') + '可用'
            }
        }
    }
</script>