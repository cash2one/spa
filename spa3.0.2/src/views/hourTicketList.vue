<style>
    @import '../styles/page/hourTicketList.css';
</style>
<template>
    <div class="page" id="hour-ticket-list-page">
        <div class="page-title"><a class="back" @click="doClickPageBack()"></a>点钟券</div>
        <div class="list" :style="{ height : (global.winHeight-2.611*global.winScale*16)+'px' }">
            <div class="item" v-for="item in dataList" @click="doClickPaidCoupon(item.actId)">
                <div>
                    <div><span v-show="item.useType == 'money'">￥</span>{{ item.useType == "money" ? item.actValue : item.actTitle }}</div>
                    <span>{{ item.consumeMoneyDescription }}</span>
                    <div>
                        <div>{{ item.useTypeName }}</div>
                        <div>立即购买</div>
                    </div>
                    <div></div>
                    <div></div>
                </div>
            </div>
            <div class="nullData" v-show="dataList.length==0">
                <div></div>
                <div>{{ global.loading ? '数据加载中...' : '暂无内容...' }}</div>
            </div>
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
                queryDataUrl: '../api/v1/profile/redpack/list',
                dataList: [],
                clubId: '',
                techCode: ''
            }
        },
        created: function () {
            var that = this
            var global = that.global
            that.clubId = global.currPage.query.clubId || global.clubId
            that.techCode = global.currPage.query.techCode
            global.loading = true
            that.$http.get(that.queryDataUrl, {params: {clubId: that.clubId}}).then(function (res) {
                res = res.body
                global.loading = false
                if (res.statusCode == 200) {
                    res = res.respData.coupons
                    var list = []
                    for (var i = 0; i < res.length; i++) {
                        if (res[i].couponType == 'paid') {
                            res[i].useType = (res[i].useType == 'null' ? 'money' : res[i].useType)
                            list.push(res[i])
                        }
                    }
                    that.dataList = list
                } else {
                    Util.tipShow(res.msg || global.loadError)
                    that.$router.back()
                }
            }, function () {
                Util.tipShow(global.loadError)
                global.loading = false
                that.$router.back()
            })
        },
        methods: {
            doClickPageBack: function () {
                history.back()
            },
            doClickPaidCoupon: function (actId) {
                var that = this
                var global = that.global
                if (!global.isLogin) {
                    global.loginPage = 'paidCoupon'
                    global.loginPageQuery = {actId: actId, techCode: that.techCode}
                } else {
                    that.$router.push({name: 'paidCoupon', query: {actId: actId, techCode: that.techCode}})
                }
            }
        }
    }
</script>