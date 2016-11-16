<style>
    @import '../styles/page/robProjectDetail.css';
</style>
<template>
    <div>
        <div class="page-back-btn" @click="doClickPageBack()" v-show="!global.loading"></div>
        <div class="page" id="rob-project-detail-page"
             :style="{ height : (global.winHeight-2.943*16*global.winScale)+'px' }">
            <div class="top-banner"></div>
            <div class="info">
                <div>{{ itemData.name }}</div>
                <div><span>{{ itemData.amount }}</span> 元<span v-show="itemData.credits>0">或</span><span
                        v-show="itemData.credits>0"><span>{{ itemData.credits }}</span> 积分</span></div>
                <div>
                    <div><span>原价{{ itemData.price }}元</span></div>
                    <div><span v-if="itemData.canPaidCount>0">剩余{{ itemData.canPaidCount - itemData.paidCount }}份</span><span
                            v-else>不限份数</span></div>
                </div>
            </div>
            <div class="counter">
                <counter v-if="itemData.startDate" :start="itemData.startDate" :end="itemData.endDate"
                         :tip-text="tipText" @status-change="doCounterStatusChange"></counter>
            </div>
            <router-link class="club" tag="div" :to="{ name : 'home' }">
                <div :style="{ backgroundImage : 'url('+global.clubLogoUrl+')' }"></div>
                <div>{{ global.clubName }}</div>
                <div></div>
            </router-link>
            <div class="act-desc">
                <div class="node-pad-icon">活动说明</div>
                <div>
                    <div v-show="false">
                        <div>活动时间</div>
                        <div>{{ itemData.startDate }}-{{ itemData.endDate }}</div>
                    </div>
                    <div>
                        <div v-show="false">活动说明</div>
                        <div class="spec">
                            <div>使用时间：<span v-if="itemData.useStartDate">{{ itemData.useStartDate.split(' ')[0] }}-{{ itemData.useEndDate.split(' ')[0] }}</span>
                            </div>
                            <div>可用时段：<span>{{ itemData.usePeriod | WeekDayFormatter }}  {{ itemData.startTime }} - {{ itemData.endTime }}</span>
                            </div>
                            <div v-html="itemData.instructions"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="item-desc">
                <div class="info-icon">项目说明</div>
                <div>
                    <div>
                        <div>
                            <div v-if="itemData.imageUrl"
                                 :style="{ backgroundImage : 'url('+itemData.imageUrl+')' }"></div>
                            <div>
                                <div>{{ itemData.name }}</div>
                                <div>
                                    <span>{{ itemData.price }}元/{{ itemData.duration }}{{ itemData.durationUnit }}</span>&nbsp;&nbsp;<span
                                        v-show="itemData.pricePlus">{{ itemData.pricePlus }}元/{{ itemData.durationPlus }}{{ itemData.durationUnit }}</span>
                                </div>
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
        <div class="rob-project-confirm-btn" :class="{ 'disabled' : status != 'started', 'processing' : isProcessing }">
            <div v-show="isCredits" @click="doClickPayBtnOfCredit()" :class="{ processing : creditProcessing }">{{
                creditProcessing ? '购买中...' : '积分购买' }}
            </div>
            <div @click="doClickPayBtnOfCash()" :class="{ processing : cashProcessing }">{{ cashProcessing ? '购买中...' :
                '现金购买' }}
            </div>
        </div>
    </div>
</template>
<script>
    import {Global} from '../libs/global'
    import Util from '../libs/util'
    import Counter from '../components/counter'
    import WeekDayFormatter from '../filters/week-day-formatter'

    module.exports = {
        filters: {
            WeekDayFormatter: WeekDayFormatter
        },
        components: {
            'counter': Counter
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
                tipText: {'notStarted': '距开始还剩：', 'started': '距结束还剩：', 'over': '已结束'},
                cashPayData: null
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
                    Global.getOpenId({
                        authCode: code,
                        userType: 'user',
                        state: 'confirm-order'
                    }).then(function () {
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
                var _this = this
                var global = _this.global
                var query = global.currPage.query

                _this.itemId = query.robProjectId
                console.log('init query data...')
                _this.$http.get('../api/v2/club/paid_service_item/view', {params: {id: _this.itemId}}).then(function (res) {
                    res = res.body
                    if (res.statusCode == 200) {
                        _this.itemData = res = res.respData
                        if (res.canPaidCount == 0 || res.canPaidCount - res.paidCount > 0) {
                            _this.isCanPaid = true
                        }
                        Global.getClubSwitches(global.clubId).then(function (switchRes) {
                            if (switchRes.creditSwitch && res.credits > 0) {
                                _this.isCredits = true
                            }
                        })
                        _this.shareSetting(res.shareUrl, res.imageUrl, res.name)

                        if (Util.sessionStorage('con-rob-project-param')) {
                            _this.doClickPayBtnOfCash()
                        }
                    } else {
                        Util.tipShow(res.msg || '查询抢项目详情失败！')
                    }
                })
            },
            doClickPageBack: function () {
                this.$router.go(-1)
            },
            doCounterStatusChange: function (status) {
                this.status = status
            },
            // 设置分享
            shareSetting: function (shareUrl, imageUrl, name) {
                var _this = this
                var global = _this.global
                Global.shareConfig({
                    title: global.clubName + '-' + name + '限时抢购就等你来',
                    desc: '据说这个项目一般人抢不到，但是我觉得你可以！抢项目，约技师，享人间极乐。',
                    link: shareUrl || location.href,
                    imgUrl: imageUrl,
                    success: function () {
                        // $('#_shareMask',true).ClassClear('active');
                    },
                    fail: function () {
                        Util.tipShow('分享失败！请刷新页面后再试！')
                    }
                })
            },
            doCheck: function () {
                var _this = this
                var global = _this.global
                if (!global.isLogin) {
                    Util.tipShow('请您先登录！')
                    Global.loginParams()
                    _this.$router.push({name: 'login'})
                    return false
                } else if (!global.userTel) {
                    /* $.$.loginUrl = location.hash;
                     $.bindPhone(true);
                     return false; */
                }
                return true
            },

            // 点击积分购买按钮
            doClickPayBtnOfCredit: function () {
                var _this = this
                var global = _this.global
                var query = global.currPage.query
                if (!_this.doCheck()) return
                if (_this.status == 'notStarted') {
                    return Util.tipShow('活动未开始！')
                } else if (_this.status == 'over') {
                    return Util.tipShow('活动已结束！')
                }
                if (_this.isCredits) {
                    if (_this.isProcessing) {
                        return Util.tipShow('购买中，请稍候...')
                    }
                    _this.isProcessing = true
                    _this.creditProcessing = true
                    _this.$http.get('../api/v2/club/credits/paid/service_item', {
                        params: {
                            id: _this.itemId,
                            techCode: global.techInviteCode || query.techCode || '',
                            userCode: query.userCode || ''
                        }
                    }).then(function (res) {
                        res = res.body
                        _this.isProcessing = false
                        _this.creditProcessing = false
                        if (res.statusCode == 200) {
                            Util.tipShow('支付成功！')
                            _this.$router.push({name: 'robProjectSuccess', query: {id: res.respData}})
                        } else {
                            Util.tipShow(res.msg || '积分支付失败！')
                        }
                    })
                } else {
                    Util.tipShow('未开通积分购买！')
                }
            },
            // 点击现金购买按钮
            doClickPayBtnOfCash: function () {
                var _this = this
                var global = _this.global
                var query = global.currPage.query

                if (!_this.doCheck()) return
                if (_this.status == 'notStarted') {
                    return Util.tipShow('活动未开始！')
                } else if (_this.status == 'over') {
                    return Util.tipShow('活动已结束！')
                }
                if (!global.userAgent.isWX) {
                    if (Global.checkAccess('robProjectDetail')) {
                        return Util.tipShow('请在微信中打开页面！')
                    } else {
                        return Util.tipShow('未开通此权限！')
                    }
                }
                if (_this.isProcessing) {
                    return Util.tipShow('购买中，请稍候...')
                }
                _this.isProcessing = true
                _this.cashProcessing = true
                _this.$http.post('../api/v2/wx/pay/paid_service_item', {
                    paidServiceItemId: _this.itemId,
                    clubId: _this.itemData.clubId,
                    tradeChannel: 'wx',
                    businessChannel: query.channel || 'link'
                }).then(function (res) {
                    res = res.body
                    if (res.statusCode == 200) {
                        _this.cashPayData = JSON.parse(res.respData)
                        if (typeof WeixinJSBridge == 'undefined') {
                            document.addEventListener('WeixinJSBridgeReady', function () {
                                _this.onBridgeReady()
                            }, false)
                        } else {
                            _this.onBridgeReady()
                        }
                    } else if (res.statusCode == 935801) {
                        Util.localStorage('con-rob-project-param', true)
                        Global.getOauthCode('', '9358', 'confirm-rob-project', 'base')
                    } else {
                        Util.tipShow(res.msg || '抢项目失败！')
                        _this.isProcessing = false
                        _this.cashProcessing = false
                    }
                }, function () {
                    Util.tipShow('请求异常！')
                    _this.isProcessing = false
                    _this.cashProcessing = false
                })
            },

            onBridgeReady: function () {
                var _this = this
                var cashPayData = _this.cashPayData
                WeixinJSBridge.invoke('getBrandWCPayRequest', {
                    'appId': cashPayData.appId,
                    'timeStamp': cashPayData.timeStamp + '',
                    'nonceStr': cashPayData.nonceStr,
                    'package': cashPayData.package,
                    'signType': cashPayData.signType,
                    'paySign': cashPayData.paySign
                }, function (res) {
                    _this.isProcessing = false
                    if (res.err_msg.indexOf('ok') >= 0) {
                        Util.tipShow('支付成功！')
                        _this.$router.push({name: 'robProjectSuccess', query: {id: cashPayData.bizId}})
                    } else {
                        _this.cashProcessing = false
                        Util.tipShow('未能成功支付！')
                        // 支付失败，删除预支付订单
                        _this.$http.get('../api/v2/club/user_paid_service_item/delete/paid', {params: {id: cashPayData.bizId}})
                    }
                })
            }
        },
        beforeDestroy: function () {
        }
    }
</script>