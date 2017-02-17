<style>
    @import '../styles/page/onceCardOrders.css';
</style>
<template>
    <div class="page" id="once-card-orders-page">
        <page-title title-text="次卡订单"></page-title>
        <div class="all-list" ref="listEle" v-show="!noData" :style="{ height : (global.winHeight-2.611*global.winScale*16)+'px' }" @scroll="doHandlerListScroll()">
            <div v-for="item in dataList">
                <router-link class="item-title" tag="div" :to="{ path: '/'+item.clubId+'/home' }"><div :style="{ 'background-image': 'url('+item.clubLogo+')'}"></div>{{ item.clubName }}</router-link>
                <ul class="item-list">
                    <router-link v-for="record in item.list" :class="{ disabled : record.status != 1 }" @click="doClickCardOrder()" tag="li" :to="{ name: 'onceCardOrderDetail', query: { id: record.id } }">
                        <div :style="{ 'background-image': 'url('+(record.imageUrl || global.defaultServiceItemImgUrl)+')' }"></div>
                        <div>{{ record.itemName }}</div>
                        <div>总价：<span>{{ record.amount | MoneyFormatter }}</span>元</div>
                        <div>{{ record.useEndTime ? "有效期至："+record.useEndTime : "长期有效" }}<span v-if="record.status==1">剩余 <b>{{ record.totalCount - record.usedCount }}</b>/{{ record.totalCount }}</span></div>
                        <div>{{ statusObj[record.status] }}</div>
                    </router-link>
                </ul>
            </div>
            <div class="data-load-tip border-top" :class="{ none : !showDataLoadTip }"><div>加载数据</div></div>
            <div class="finish-load-tip border-top" :class="{ none : !showFinishLoadTip }"><div>已经加载全部数据</div></div>
        </div>
        <div class="nullData" v-show="noData">
            <div v-show="!global.loading"></div>
            <div>{{ global.loading ? '数据加载中...' : '暂无内容...' }}</div>
        </div>
        <router-link class="submit-button footer" :to="{name: 'discountMall'}" tag="div">逛商城、找优惠</router-link>
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
                clubId: '',
                dataList: [],
                currPage: 0,
                pageSize: 10,
                listEle: null,
                clubDataSet: {},
                showDataLoadTip: false, // 显示数据正在加载
                showFinishLoadTip: false, // 显示已经加载完成
                isDataAddEnd: false, // 数据是否已加载完
                isAddData: false, // 数据是否正在加载
                noData: true,
                statusObj: { 1: '使用', 2: '已过期', 3: '用完啦~' }
            }
        },
        created: function () {
            var that = this
            var global = that.global
            var query = global.currPage.query
            that.clubId = query.clubId || global.clubId || ''
            that.queryData(1)
        },
        methods: {
            doHandlerListScroll: function () {
                var that = this
                var listEle = that.$refs.listEle
                if (!that.isDataAddEnd && listEle.scrollTop + listEle.clientHeight * 1.4 > listEle.scrollHeight) {
                    that.queryData()
                }
            },
            queryData: function (page) {
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

                that.$http.get('../api/v2/club/once_card/order/list', {params: {
                    clubId: that.clubId,
                    page: page,
                    pageSize: that.pageSize
                }}).then(function (res) {
                    res = res.body
                    if (res.statusCode == 200) {
                        res = res.respData || []
                        var dataItem
                        var itemIndex
                        var dataItemObj

                        for (var i = 0; i < res.length; i++) {
                            dataItem = res[i]
                            itemIndex = that.clubDataSet[dataItem.clubId]
                            if (itemIndex == undefined) {
                                dataItemObj = {
                                    clubId: dataItem.clubId,
                                    clubName: dataItem.clubName,
                                    clubLogo: dataItem.clubImageUrl || global.defaultClubLogo,
                                    list: []
                                }
                                that.clubDataSet[dataItem.clubId] = that.dataList.length
                                that.dataList.push(dataItemObj)
                            } else {
                                dataItemObj = that.dataList[itemIndex]
                            }
                            dataItemObj.list.push(dataItem)
                        }
                        if (res.length < that.pageSize) {
                            that.isDataAddEnd = true
                            that.showFinishLoadTip = true
                        }
                        that.currPage = page
                        that.isAddData = false
                        that.showDataLoadTip = false

                        if (res.length > 0) {
                            that.noData = false
                        }
                        if (page == 1) {
                            global.loading = false
                        }
                    } else {
                        Util.tipShow(res.msg || global.loadError)
                    }
                }, function () {
                    Util.tipShow(global.loadError)
                })
            }
        }
    }
</script>