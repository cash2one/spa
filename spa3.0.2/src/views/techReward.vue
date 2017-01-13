<style>
    @import '../styles/page/techReward.css';
</style>
<template>
    <div>
        <div class="page" id="tech-reward-page">
            <page-title title-text="技师打赏"></page-title>
            <div class="top-tip"><div></div></div>
            <div class="reward-list">
                <div v-for="(item, index) in moneyList" class="money" @click="doSelectReward('money',index)" :class="{ active : selectType=='money' && selectVal==index }">
                    <div>{{ item.value }}</div>
                    <div>{{ item.label }}</div>
                </div>
                <div v-for="item in giftList" class="gift" :class="{ active : selectType=='gift' && selectVal==item }" @click="doSelectReward('gift',item)">
                    <div><img :src="item.iconUrl"/></div>
                    <div>{{ item.ratio }}积分</div>
                </div>
            </div>
            <div class="submit-button" :class="submitStatusCls" @click="doClickSubmitBtn()">{{ submitBtnText }}</div>
            <div class="submit-button view-button" @click="doClickViewClub()">查看会所</div>
        </div>
        <credit-tip></credit-tip>
    </div>
</template>
<script>
    import { Global } from '../libs/global'
    import Util from '../libs/util'
    import { eventHub } from '../libs/hub'

    module.exports = {
        data: function () {
            return {
                global: Global.data,
                submitStatusCls: '',
                submitBtnText: '打赏',
                selectType: 'money',
                selectVal: 1,
                currSelectGiftValue: 0,
                moneyList: [{value: 1.68, label: '一路发'}, {value: 5.20, label: '我爱你'}, {value: 8.88, label: '土豪赏'}, {value: 18.8, label: '要抱抱'}],
                giftList: [],
                techInfo: null,
                techId: '',
                commentId: '',
                paramData: null,
                payAuthCode: '',
                clubId: '',
                currIntegralAccount: 0, // 当前账户积分
                payRequestObj: null,
                prePayId: ''
            }
        },
        created: function () {
            var that = this
            var global = that.global
            var params = global.currPage.query

            that.techId = params.techId
            if (!that.techId) {
                Util.tipShow(global.visitError)
                that.$router.back()
            } else {
                that.commentId = params.commentId
                that.paramData = Util.localStorage('tech-reward-param')
                that.payAuthCode = params.code
                that.clubId = global.clubId
                global.isFollowed = !!(global.isFollowed || Util.localStorage('spa_user_isFollowed') - 0 || false)

                if (global.userAgent.isWX && that.paramData && that.payAuthCode) {
                    // 获取openID 与其他页面获取openid的接口不一样
                    that.$http.post('../api/v2/wx/oauth2/user/openid', {
                        code: that.payAuthCode,
                        scope: 'snsapi_userinfo',
                        wxmp: '9358',
                        userType: 'user',
                        state: 'tech-reward'
                    }).then(function (res) {
                        res = res.body
                        if (res.statusCode == 200) {
                            Util.removeLocalStorage('tech-reward-param')
                        } else if (res.statusCode == 935801) {
                            Util.localStorage('tech-reward-param', that.selectVal)
                            Global.getOauthCode('', '9358', 'tech_reward', 'userInfo')
                        } else {
                            Util.tipShow('未能获取OpenId！')
                            that.$router.back()
                        }
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
                that.$http.get('../api/v2/club/technician/{techId}', {params: {techId: that.techId}}).then(function (res) {
                    res = res.body
                    that.techInfo = res.info
                    that.techInfo.emchatId = res.emchatId
                    that.techInfo.clubName = res.clubName
                    that.clubId = res.info.clubId
                    global.loading = false
                })

                // 获取积分系统开关
                Global.getClubSwitches(that.clubId).then(function (cfg) {
                    if (cfg.creditSwitch) {
                        // 获取积分礼物数据
                        that.$http.get('../api/v2/credit/gift/list').then(function (giftRes) {
                            giftRes = giftRes.body
                            if (giftRes.statusCode == 200) {
                                giftRes = giftRes.respData
                                if (giftRes.length > 4) { // 只显示前4个
                                    giftRes = giftRes.slice(0, 4)
                                }
                                that.giftList = giftRes
                            }
                        })
                        // 获取当前账户积分
                        Global.getCreditAccount(that.clubId).then(function (creditRes) {
                            if (creditRes && creditRes[0]) {
                                that.currIntegralAccount = creditRes[0].amount
                            }
                        })
                    }
                })

                if (that.paramData) {
                    that.selectType = 'money'
                    that.selectVal = that.paramData
                    that.doClickSubmitBtn()
                }
            },
            doSelectReward: function (type, val) {
                var that = this
                that.selectType = type
                that.selectVal = val
            },
            doClickSubmitBtn: function () {
                var that = this
                var global = that.global
                if (that.submitStatusCls == 'processing') {
                    Util.tipShow('打赏中，请稍候...')
                    return
                }
                if (that.selectType == 'gift') { // 送积分礼物
                    var selectGift = that.selectVal
                    that.currSelectGiftValue = selectGift.ratio
                    if (that.currSelectGiftValue > that.currIntegralAccount) {
                        eventHub.$emit('set-credit-tip', {amount: that.currSelectGiftValue, show: true})
                    } else {
                        that.submitStatusCls = 'processing'
                        that.submitBtnText = '打赏中...'
                        that.$http.get('../api/v2/credit/gift/send', {
                            params: {
                                clubId: that.clubId,
                                emchatId: that.techInfo.emchatId,
                                giftId: selectGift['id'],
                                num: 1
                            }
                        }).then(function (res) {
                            res = res.body
                            that.submitStatusCls = ''
                            that.submitBtnText = '打赏'
                            if (res.statusCode == 200) {
                                console.log('发送一条礼物消息给技师')
                            } else {
                                Util.tipShow(res.msg || '打赏礼物请求失败！')
                            }
                        })
                    }
                } else { // 打赏金钱
                    that.submitStatusCls = 'processing'
                    that.submitBtnText = '打赏中...'
                    that.$http.post('../api/v2/wx/pay/user_reward', {
                        consumeMoney: that.moneyList[that.selectVal],
                        openId: global.openId,
                        clubId: that.clubId,
                        consumeType: 'user_reward',
                        consumeChanel: 'user_reward',
                        techId: that.techId,
                        prePayId: '',
                        paySessionType: '9358_fw',
                        commentId: that.commentId
                    }).then(function (res) {
                        res = res.body
                        if (res.statusCode == 200) {
                            that.payRequestObj = res.respData
                            that.prePayId = res.respData.package.split('=')[1]
                            if (typeof WeixinJSBridge == 'undefined') {
                                document.addEventListener('WeixinJSBridgeReady', function () {
                                    that.onBridgeReady()
                                }, false)
                            } else {
                                that.onBridgeReady()
                            }
                        } else if (res.statusCode == 935801) {
                            Util.localStorage('tech-reward-param', that.selectVal)
                            Global.getOauthCode('', '9358', 'tech-reward', 'userInfo')
                        } else {
                            that.submitStatusCls = ''
                            that.submitBtnText = '打赏'
                            Util.tipShow(res.msg || '支付失败！')
                        }
                    })
                }
            },
            onBridgeReady: function () {
                var that = this
                var payRequestObj = that.payRequestObj

                WeixinJSBridge.invoke('getBrandWCPayRequest', {
                    appId: payRequestObj.appId,
                    timeStamp: payRequestObj.timeStamp + '',
                    nonceStr: payRequestObj.nonceStr,
                    package: payRequestObj.package,
                    signType: payRequestObj.signType,
                    paySign: payRequestObj.paySign
                }, function (res) {
                    that.submitStatusCls = ''
                    that.submitBtnText = '打赏'
                    if (res.err_msg.indexOf('ok') >= 0) { // 支付成功之后
                        that.$http.post('../api/v2/wx/pay/pay_result', {prePayId: that.prePayId}).then(function () {
                            console.log('发送一条打赏消息给技师')
                        })
                    } else {
                        Util.tipShow('未能成功支付！')
                    }
                })
            },
            doClickViewClub: function () { // 点击查看会所
                var that = this
                that.$router.push({path: '/' + that.clubId + '/home'})
            }
        }
    }
</script>