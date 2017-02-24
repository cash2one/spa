<style>
    @import '../styles/page/lucky.css';
</style>
<template>
    <div class="page" id="lucky-page" :style="{ height : global.winHeight+'px' }">
        <page-title title-text="抽奖记录"></page-title>
        <div class="all-list" ref="listEle" v-show="!noData" :style="{ height : (global.winHeight-2.611*global.winScale*16)+'px' }" @scroll="doHandlerListScroll()">
            <div v-for="item in dataList">
                <router-link class="item-title" tag="div" :to="{ path: '/'+item.clubId+'/home' }"><div :style="{ 'background-image': 'url('+item.clubLogo+')'}"></div>{{ item.clubName }}</router-link>
                <ul class="item-list">
                    <li v-for="record in item.list" @click="doClickRecordDetail(record)">
                        <div>{{ record.prizeName }}<span :class="{ active: record.status!=1 }">{{ statusObj[record.status] || '-'}}</span></div>
                        <div><span v-show="record.verifyCode">核销码：</span>{{ record.verifyCode | CodeFormatter }}&nbsp;<span>{{ record.createTime.substr(5,11) }}</span></div>
                    </li>
                </ul>
            </div>
            <div class="data-load-tip" :class="{ none : !showDataLoadTip }"><div>加载数据</div></div>
            <div class="finish-load-tip" :class="{ none : !showFinishLoadTip }"><div>已经加载全部数据</div></div>
        </div>
        <div class="nullData" v-show="noData">
            <div v-show="!global.loading"></div>
            <div>{{ global.loading ? '数据加载中...' : '暂无内容...' }}</div>
        </div>
    </div>
</template>
<script>
    import { Global } from '../libs/global'
    import Util from '../libs/util'
    import CodeFormatter from '../filters/code-formatter'

    module.exports = {
        filters: {
            CodeFormatter: CodeFormatter
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
                statusObj: {
                    0: '未核销', 1: '已核销', 2: '过期', 3: '未中奖'
                }
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
            doClickRecordDetail: function (record) {
                var that = this
                if (/(1|2|3)/.test(record.prizeType)) {
                    that.$router.push({name: 'luckyDetail', query: {recordId: record.recordId, actId: record.activityId, cardId: record.prizeContent, prizeType: record.prizeType}})
                } else {
                    Util.tipShow('您中了：' + record.prizeName)
                }
            },
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

                that.$http.get('../api/v2/user/luckyWheel/userPrizeRecordList', {params: {
                    clubId: that.clubId,
                    page: page,
                    pageSize: that.pageSize
                }}).then(function (res) {
                    res = res.body
                    if (res.statusCode == 200) {
                        res = res.respData.recordList || []
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
                                    clubLogo: dataItem.clubLogo || global.defaultClubLogo,
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