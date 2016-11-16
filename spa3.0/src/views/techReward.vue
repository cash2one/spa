<style>
    @import '../styles/page/techReward.css';
</style>
<template>
    <div>
        <div class="page" id="tech-reward-page" v-show="!global.loading">
            <div class="page-title"><a class="back" @click="doClickPageBack()"></a>技师打赏</div>
            <div class="top-tip">
                <div></div>
            </div>
            <div class="reward-list">
                <div v-for="item in moneyList" class="money" @click="doSelectReward('money',item)"
                     :class="{ active : selectType=='money' && selectVal==item }">{{ item }}元
                </div>
                <div v-for="item in giftList" class="gift" :class="{ active : selectType=='gift' && selectVal==item }"
                     @click="doSelectReward('gift',item)">
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
    import {Global} from '../libs/global'
    import Util from '../libs/util'
    import {eventHub} from '../libs/hub'
    import CreditTip from '../components/credit-tip'

    module.exports = {
        components: {
            'credit-tip': CreditTip
        },
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
            var _this = this
            var global = _this.global
            var params = global.currPage.query

            _this.techId = params.techId
            if (!_this.techId) {
                Util.tipShow(global.visitErrori)
                _this.$router.back()
            } else {
                _this.getTechInfoUrl += _this.techId
                _this.commentId = params.commentId
                _this.paramData = Util.localStorage('tech-reward-param')
                _this.payAuthCode = params.code
                _this.clubId = global.clubId
                if (_this.paramData && _this.payAuthCode) {
                    _this.$http.post(_this.getOpenIdUrl, {
                        code: _this.payAuthCode,
                        scope: 'snsapi_userinfo',
                        wxmp: '9358',
                        userType: 'user',
                        state: 'tech-reward'
                    }).then(function (res) {
                        res = res.body
                        if (res.statusCode == 200) {
                            Util.removeLocalStorage('tech-reward-param')
                        } else if (res.statusCode == 935801) {
                            Util.localStorage('tech-reward-param', _this.selectVal)
                            Global.getOauthCode('', '9358', 'tech_reward', 'userInfo')
                        } else {
                            Util.tipShow('未能获取OpenId！')
                            _this.$router.back()
                        }
                    })
                }
            }
        },
        mounted: function () {
            var _this = this
            // 获取技师信息
            _this.$http.get(_this.getTechInfoUrl).then(function (res) {
                res = res.body
                _this.techInfo = res.info
                _this.techInfo.emchatId = res.emchatId
                _this.techInfo.clubName = res.clubName
                _this.clubId = res.info.clubId
            })

            // 获取积分系统开关
            Global.getClubSwitches(_this.clubId).then(function (cfg) {
                if (cfg.creditSwitch) {
                    // 获取积分礼物数据
                    _this.$http.get(_this.getGiftListUrl).then(function (giftRes) {
                        giftRes = giftRes.body
                        if (giftRes.statusCode == 200) {
                            _this.giftList = giftRes.respData
                        }
                    })
                    // 获取当前账户积分
                    Global.getCreditAccount(_this.clubId).then(function (creditRes) {
                        if (creditRes && creditRes[0]) {
                            _this.currIntegralAccount = creditRes[0].amount
                        }
                    })
                }
            })

            if (_this.paramData) {
                _this.selectType = 'money'
                _this.selectVal = _this.paramData
                _this.doClickSubmitBtn()
            }
        },
        methods: {
            doClickPageBack: function () {
                history.back()
            },
            doSelectReward: function (type, val) {
                var _this = this
                _this.selectType = type
                _this.selectVal = val
            },
            doClickSubmitBtn: function () {
                var _this = this
                var global = _this.global
                if (_this.submitStatusCls == 'processing') {
                    Util.tipShow('打赏中，请稍候...')
                    return
                }
                if (_this.selectType == 'gift') { // 送积分礼物
                    var selectGift = _this.selectVal
                    _this.currSelectGiftValue = selectGift.ratio
                    if (_this.currSelectGiftValue > _this.currIntegralAccount) {
                        eventHub.$emit('set-credit-tip', {amount: _this.currSelectGiftValue, show: true})
                    } else {
                        _this.submitStatusCls = 'processing'
                        _this.submitBtnText = '打赏中...'
                        _this.$http.get(_this.sendGiftUrl, {
                            params: {
                                clubId: _this.clubId,
                                emchatId: _this.techInfo.emchatId,
                                giftId: selectGift['id'],
                                num: 1
                            }
                        }).then(function (res) {
                            res = res.body
                            _this.submitStatusCls = ''
                            _this.submitBtnText = '打赏'
                            if (res.statusCode == 200) {
                                console.log('发送一条礼物消息给技师')
                            } else {
                                Util.tipShow(res.msg || '打赏礼物请求失败！')
                            }
                        })
                    }
                } else { // 打赏金钱
                    _this.submitStatusCls = 'processing'
                    _this.submitBtnText = '打赏中...'
                    _this.$http.post(_this.rewardUrl, {
                        consumeMoney: _this.selectVal,
                        openId: global.openId,
                        clubId: _this.clubId,
                        consumeType: 'user_reward',
                        consumeChanel: 'user_reward',
                        techId: _this.techId,
                        prePayId: '',
                        paySessionType: '9358_fw',
                        commentId: _this.commentId
                    }).then(function (res) {
                        res = res.body
                        if (res.statusCode == 200) {
                            _this.payRequestObj = res.respData
                            _this.prePayId = res.respData.package.split('=')[1]
                            if (typeof WeixinJSBridge == 'undefined') {
                                document.addEventListener('WeixinJSBridgeReady', function () {
                                    _this.onBridgeReady()
                                }, false)
                            } else {
                                _this.onBridgeReady()
                            }
                        } else if (res.statusCode == 935801) {
                            Util.localStorage('tech-reward-param', _this.selectVal)
                            Global.getOauthCode('', '9358', 'tech-reward', 'userInfo')
                        } else {
                            _this.submitStatusCls = ''
                            _this.submitBtnText = '打赏'
                            Util.tipShow(res.msg || '支付失败！')
                        }
                    })
                }
            },
            onBridgeReady: function () {
                var _this = this
                var payRequestObj = _this.payRequestObj
                WeixinJSBridge.invoke('getBrandWCPayRequest', {
                    'appId': payRequestObj.appId,     // 公众号名称
                    'timeStamp': payRequestObj.timeStamp + '',  // 时间
                    'nonceStr': payRequestObj.nonceStr, // 随机串
                    'package': payRequestObj.package,
                    'signType': payRequestObj.signType,   // 微信签名方式
                    'paySign': payRequestObj.paySign
                }, function (res) {
                    _this.submitStatusCls = ''
                    _this.submitBtnText = '打赏'
                    if (res.err_msg.indexOf('ok') >= 0) { // 支付成功之后
                        _this.$http.post(_this.payResUrl, {prePayId: _this.prePayId}).then(function () {
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
