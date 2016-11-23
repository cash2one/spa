<style>
    @import '../styles/page/treat.css';
</style>
<template>
    <div class="page" id="treat-page" :style="{ height : global.winHeight+'px' }">
        <div class="page-title"><a class="back" @click="doClickPageBack()"></a>我要请客</div>
        <div class="treat-area">
            <div>
                <div>授权金额<span>(可用金额：{{accountMoney}})</span></div>
                <div><input type="number" v-model="money" pattern="[0-9]*" @input="doInputOfMoney()"/>元</div>
                <div>注：朋友最多可用金额，授权完成后，将冻结授权金额。朋友使用后或者取消授权后将取消解冻。</div>
            </div>
            <div>
                <div>朋友手机号码</div>
                <div><input type="tel" v-model="tel" maxlength="11" v-tel-input="isTelValid"></div>
                <div>注：我们将发送授权码给您的朋友。</div>
            </div>
        </div>
        <div class="check" :class="{ active : canVisible }" @click="canVisible = !canVisible">朋友可以看见授权金额。</div>
        <div class="btn" :class="{ active : isTelValid && isMoneyValid, processing : isProcessing }" @click="doClickConfirmBtn()">{{confirmBtnText}}</div>
        <div class="footer-area">
            <router-link :to="{ name : 'treatExplain' }">请客说明</router-link>
            <router-link :to="{ name : 'treatRecords' , query : { clubId : clubId } }">请客记录</router-link>
        </div>
    </div>
</template>
<script>
    import { Global } from '../libs/global'
    import Util from '../libs/util'
    import TelInput from '../directives/tel-input'

    module.exports = {
        directives: {
            'tel-input': TelInput
        },
        data: function () {
            return {
                global: Global.data,
                queryDataUrl: '../api/v2/finacial/account/',
                payAuthUrl: '../api/v2/finacial/account/payforother/auth',
                accountId: '',
                accountMoney: '-',
                canVisible: true,
                tel: '',
                money: '',
                isTelValid: false,
                isMoneyValid: false,
                isProcessing: false,
                confirmBtnText: '确认授权',
                clubId: '',
                oldMoney: ''
            }
        },
        created: function () {
            var that = this
            var global = that.global
            var pageParams = global.currPage.query

            that.accountId = pageParams.accountId
            if (!that.accountId) {
                return that.$router.back()
            } else {
                that.queryDataUrl += that.accountId
                global.loading = true
                that.$http.get(that.queryDataUrl).then(function (res) {
                    global.loading = false
                    res = res.body
                    if (res.statusCode == 200) {
                        res = res.respData
                        that.clubId = res.clubId
                        that.accountMoney = (res.amount / 100).toFixed(2)
                    } else {
                        Util.tipShow(global.loadError)
                        that.$router.back()
                    }
                })
            }
        },
        methods: {
            doClickPageBack: function () {
                history.back()
            },
            doClickConfirmBtn: function () {
                var that = this
                if (that.isTelValid && that.isMoneyValid) {
                    if (that.isProcessing) {
                        Util.tipShow('正在授权，请稍候...')
                    } else {
                        that.isProcessing = true
                        that.confirmBtnText = '授权中...'
                        that.$http.post(that.payAuthUrl, {
                            accountId: that.accountId,
                            amount: that.money,
                            open: that.canVisible ? 'Y' : 'N',
                            telephone: that.tel
                        }).then(function (res) {
                            res = res.body
                            that.isProcessing = false
                            that.confirmBtnText = '确认授权'
                            if (res.statusCode != 200) {
                                Util.tipShow(res.msg || '授权失败。')
                            } else {
                                that.$router.push({
                                    name: 'treatDetail',
                                    query: {backAccount: true, detailId: res.respData}
                                })
                            }
                        })
                    }
                }
            },
            doInputOfMoney: function () {
                var that = this
                if (that.money == '') {
                    if (that.oldMoney.length > 1) {
                        that.money = that.oldMoney
                        that.isMoneyValid = true
                    } else {
                        that.oldMoney = ''
                        that.isMoneyValid = false
                    }
                } else {
                    that.isMoneyValid = true
                    var tmp = that.money.match(/\./g)
                    if (tmp && tmp.length > 1) {
                        that.money = that.money.slice(0, -1)
                    }
                    if (!/^([1-9][0-9]*)$/g.test(that.money)) {
                        that.money = that.oldMoney
                    } else {
                        that.oldMoney = that.money
                    }
                }
            }
        }
    }
</script>