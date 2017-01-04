<style>
    @import '../styles/page/coupon.css';
</style>
<template>
    <div class="page" id="coupon-page" :style="{ height : global.winHeight+'px' }">
        <div class="page-title"><a class="back" @click="doClickPageBack()"></a>优惠券</div>
        <div class="list" ref="listEle" :style="{ height : (global.winHeight-2.611*global.winScale*16)+'px' }" @scroll="doHandlerListScroll()">
            <div class="list-item" v-for="singleClubData in dataList">
                <div class='header' v-if="isQueryAll">{{ singleClubData.clubName }}</div>
                <router-link v-for="item in singleClubData.list" class="item" :class="{ expire : item.isExpire }" :type="item.couponType" :to="{ name : item.couponType=='paid' ? 'paidCouponDetail' : 'couponDetail', query : { userActId : item.userActId }}">
                    <i></i>
                    <div>{{ item.actTitle }}</div>
                    <div>{{ item.useType == 'money' ? ( item.actValue+'元现金券') : '' }}<div v-html="item.consumeMoneyDescription"></div></div>
                    <div>券有效期：{{ item.couponPeriod }}</div>
                    <div>{{ item.useTypeName }}</div>
                    <span v-if="item.isExpire">{{ item.couponStatusDescription }}</span>
                    <span v-if="!item.isExpire && item.couponType == 'paid'" :class="item.couponStatusClass">{{ item.couponStatusDescription }}</span>
                    <div v-show="item.couponType== 'redpack'">分享获得更多优惠机会</div>
                </router-link>
            </div>
            <div class="data-load-tip" :class="{ none : !showDataLoadTip }"><div>加载数据</div></div>
            <div class="finish-load-tip border-top" :class="{ none : !showFinishLoadTip }"><div>已经加载全部数据</div></div>
            <div class="nullData" v-show="dataList.length==0 && !isAddData">
                <div v-show="!global.loading"></div>
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
                dataList: [],
                dataIndex: {},
                currPage: 0,
                pageSize: 10,
                isQueryAll: true, // 查询所有的
                showDataLoadTip: false, // 显示数据正在加载
                showFinishLoadTip: false, // 显示已经加载完成
                isDataAddEnd: false, // 数据是否已加载完
                isAddData: false // 数据是否正在加载
            }
        },
        mounted: function () {
            var that = this
            var global = that.global
            that.isQueryAll = global.pageMode != 'club' || global.currPage.query.all == 'true'
            that.queryRecord()
            global.loading = false
        },
        methods: {
            doClickPageBack: function () {
                history.back()
            },
            queryRecord: function (page) {
                var that = this
                var global = that.global
                if (that.isAddData) {
                    return
                }
                that.isAddData = true
                page = page || that.currPage + 1

                // 更新数据加载提示
                that.showDataLoadTip = true
                that.showFinishLoadTip = false
                that.isDataAddEnd = false

                that.$http.get('../api/v2/club/user_get_coupons', {
                    params: {
                        page: page,
                        pageSize: that.pageSize,
                        clubId: (that.isQueryAll ? '' : global.clubId),
                        loginName: global.loginName
                    }
                }).then(function (res) {
                    res = res.body
                    if (res) {
                        res = (res.statusCode != '200') ? [] : res['respData']
                        that.doHandlerData(res)
                        if (res.length < that.pageSize) {
                            that.isDataAddEnd = true
                            if (res.length != 0) {
                                that.showFinishLoadTip = true
                            }
                        }
                        that.currPage = page
                        that.isAddData = false
                        that.showDataLoadTip = false
                    } else {
                        Util.tipShow(global.loadError)
                    }
                }, function () {
                    Util.tipShow(global.loadError)
                })
            },
            doHandlerListScroll: function () {
                var that = this
                var listEle = that.$refs.listEle
                if (!that.isDataAddEnd && listEle.scrollTop + listEle.clientHeight * 1.4 > listEle.scrollHeight) {
                    that.queryRecord()
                }
            },
            doHandlerData: function (data) {
                var that = this
                var item
                var dataIndex
                for (var k = 0; k < data.length; k++) {
                    item = data[k]
                    item.isExpire = (item['couponStatusDescription'] == '已过期' || item['couponStatusDescription'] == '已使用')
                    item.useType = item.useType || 'money'
                    if (item.useType == 'money' && item.consumeMoney == 0) {
                        item.consumeMoneyDescription = '&nbsp;'
                    }
                    item.couponStatusClass = (item['couponStatus'] == 0 ? 'unpay' : (item['couponStatus'] == 1 ? 'payed' : 'expire'))
                    dataIndex = that.dataIndex[item['clubId']]
                    if (dataIndex == undefined) {
                        dataIndex = that.dataList.length
                        that.dataIndex[item['clubId']] = dataIndex
                        that.dataList.push({clubName: item.clubName, list: []})
                    }
                    that.dataList[dataIndex].list.push(item)
                }
            }
        }
    }
</script>