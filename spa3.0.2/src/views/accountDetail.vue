<style>
    @import '../styles/page/accountDetail.css';
</style>
<template>
    <div class="page" id="account-detail-page" v-show="!global.loading">
        <div class="page-title"><a class="back" @click="doClickPageBack()"></a>我的账户</div>
        <div class="info-item item">
            <div>
                <div class="available-icon"></div>
                <div>可用金额</div>
                <div>{{availableMoney}}</div>
            </div>
            <div>
                <div class="frozen-icon"></div>
                <div>冻结金额</div>
                <div>{{frozenMoney}}</div>
            </div>
            <a @click="doChargeClick()">充值</a>
        </div>
        <router-link class="qrcode-item item" :to="{ name : 'qrPayCode' , query : { accountId : accountId }}">
            <span>付款二维码</span>
            <div></div>
        </router-link>
        <router-link class="record-item item" :to="{ name : 'tradeRecords' , query : { accountId : accountId }}">
            <span>交易记录</span>
            <div class="right-arrow"></div>
        </router-link>
        <router-link class="invite-item item" :to="{ name : 'treat' , query : { accountId : accountId }}">
            <span>我要请客</span>
            <div class="right-arrow"></div>
        </router-link>
    </div>
</template>
<script>
    import { Global } from '../libs/global'
    import Util from '../libs/util'

    module.exports = {
        data: function () {
            return {
                global: Global.data,
                accountId: '',
                clubId: '',
                queryDataUrl: '../api/v2/finacial/',
                availableMoney: '-',
                frozenMoney: '-'
            }
        },
        created: function () {
            var that = this
            var global = that.global
            var pageParams = global.currPage.query
            that.accountId = pageParams.accountId || ''
            if (!that.accountId && !global.clubId) {
                return that.$router.back()
            } else if (that.accountId) {
                that.queryDataUrl += 'account/' + that.accountId
            } else {
                that.queryDataUrl += 'club/account'
            }
            global.loading = true
            that.$http.get(that.queryDataUrl, {params: {clubId: global.clubId}}).then(function (res) {
                res = res.body
                global.loading = false
                if (res.statusCode == 200 && res.respData) {
                    res = res.respData
                    that.accountId = res.id
                    that.availableMoney = (res.amount / 100).toFixed(2)
                    that.frozenMoney = (res.freezeAmount / 100).toFixed(2)
                    that.clubId = res.clubId
                } else {
                    Util.tipShow(global.loadError)
                    that.$router.back()
                }
            })
        },
        methods: {
            doClickPageBack: function () {
                history.back()
            },
            doChargeClick: function () {
                var that = this
                var global = that.global
                if (global.userAgent.isWX) {
                    that.$router.push({name: 'recharge', query: {accountId: that.accountId, clubId: that.clubId}})
                } else {
                    Util.tipShow('使用微信打开才能充值！')
                }
            }
        }
    }
</script>