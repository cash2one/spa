<style>
    @import '../styles/page/techReward.css';
</style>
<template>
    <div>
        <div class="page" id="tech-reward-page">
            <div class="page-title"><a class="back" @click="doClickPageBack()"></a>技师打赏</div>
            <div class="top-tip"><div></div></div>
            <div class="reward-list">
                <div v-for="item in moneyList" class="money" @click="doSelectReward('money',item)" :class="{ active : selectType=='money' && selectVal==item }">{{ item }}元</div>
                <div v-for="item in giftList" class="gift" :class="{ active : selectType=='gift' && selectVal==item }" @click="doSelectReward('gift',item)">
                    <div><img :src="item.iconUrl"/></div>
                    <div>{{ item.ratio }}积分</div>
                </div>
            </div>
            <div class="submit-button" :class="submitStatusCls" @click="doClickSubmitBtn()">{{ submitBtnText }}</div>
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
                getOpenIdUrl: '../api/v2/wx/oauth2/openid',
                getTechInfoUrl: '../api/v2/club/technician/',
                getGiftListUrl: '../api/v2/credit/gift/list',
                sendGiftUrl: '../api/v2/credit/gift/send',
                rewardUrl: '../api/v2/wx/pay/user_reward',
                payResUrl: '../api/v2/wx/pay/pay_result',
                submitStatusCls: '',
                submitBtnText: '打赏',
                selectType: 'money',
                selectVal: 1,
                currSelectGiftValue: 0,
                moneyList: [1, 3, 6, 9],
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
                Util.tipShow(global.visitErrori)
                that.$router.back()
            } else {
                that.getTechInfoUrl += that.techId
                that.commentId = params.commentId
                that.paramData = Util.localStorage('tech-reward-param')
                that.payAuthCode = params.code
                that.clubId = global.clubId
                if (that.paramData && that.payAuthCode) {
                    that.$http.post(that.getOpenIdUrl, {
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
                }
            }
        },
        mounted: function () {
            var that = this
            // 获取技师信息
            that.$http.get(that.getTechInfoUrl).then(function (res) {
                res = res.body
                that.techInfo = res.info
                that.techInfo.emchatId = res.emchatId
                that.techInfo.clubName = res.clubName
                that.clubId = res.info.clubId
            })

            // 获取积分系统开关
            Global.getClubSwitches(that.clubId).then(function (cfg) {
                if (cfg.creditSwitch) {
                    // 获取积分礼物数据
                    that.$http.get(that.getGiftListUrl).then(function (giftRes) {
                        giftRes = giftRes.body
                        if (giftRes.statusCode == 200) {
                            that.giftList = giftRes.respData
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
        methods: {
            doClickPageBack: function () {
                history.back()
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
                        that.$http.get(that.sendGiftUrl, {
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
                    that.$http.post(that.rewardUrl, {
                        consumeMoney: that.selectVal,
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
                    'appId': payRequestObj.appId,     // 公众号名称
                    'timeStamp': payRequestObj.timeStamp + '',  // 时间
                    'nonceStr': payRequestObj.nonceStr, // 随机串
                    'package': payRequestObj.package,
                    'signType': payRequestObj.signType,   // 微信签名方式
                    'paySign': payRequestObj.paySign
                }, function (res) {
                    that.submitStatusCls = ''
                    that.submitBtnText = '打赏'
                    if (res.err_msg.indexOf('ok') >= 0) { // 支付成功之后
                        that.$http.post(that.payResUrl, {prePayId: that.prePayId}).then(function () {
                            console.log('发送一条打赏消息给技师')
                        })
                    } else {
                        Util.tipShow('未能成功支付！')
                    }
                })
            }
        }
    }
</script>