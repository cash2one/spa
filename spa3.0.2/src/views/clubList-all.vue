<template>
    <div class="page club-list-page" id="club-list-all-page">
        <div class="filter-title">
            <div @click="doClickFilterMenu('distance')">
                <div :class="{ active : activeFilterType=='distance' }">全部会所</div>
            </div>
            <div @click="doClickFilterMenu('sort')">
                <div :class="{ active : activeFilterType=='sort' }">距离最近</div>
            </div>
            <div @click="doClickFilterMenu('filter')">
                <div :class="{ active : activeFilterType=='filter' }">筛选</div>
            </div>
            <router-link :to="{ name: 'clubList-search' }" tag="div"></router-link>
        </div>

        <div class="list" ref="listEle" :style="{ height : (global.winHeight-4.896*global.winScale*16)+'px' }" @scroll="doHandlerListScroll()">
            <club v-for="item in dataList" :club-obj="item" key="item.id"></club>
            <div class="data-load-tip" :class="{ none : !dataLoading }"><div>加载数据</div></div>
            <div class="finish-load-tip" :class="{ none : !showFinish }"><div>已经加载全部数据</div></div>
            <div class="nullData" v-show="dataList.length==0 && !dataLoading">
                <div></div>
                <div>{{ global.loading ? '数据加载中...' : '暂无内容...' }}</div>
            </div>
        </div>

        <div class="filter-pop" :class="{ active: isFilterPop }" @click="doClickFilterWrap()">
            <ul class="distance" :class="{ active : activeFilterType=='distance' }">
                <li v-for="item in distanceList" :class="{ selected : selectedDistance==item.value }" @click="doSelectedItem('Distance',item.value,$event)">{{ item.label }}</li>
            </ul>
            <ul class="sort" :class="{ active : activeFilterType=='sort' }">
                <li v-for="item in sortFields" :class="{ selected : selectedSortField==item.value }" @click="doSelectedItem('SortField',item.value,$event)">{{ item.label }}</li>
            </ul>
            <ul class="filter" :class="{ active : activeFilterType=='filter' }">
                <li v-for="item in filters" :class="{ selected : selectedFilter==item.value }" @click="doSelectedItem('Filter',item.value,$event)">{{ item.label }}</li>
            </ul>
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
                dataLoading: false,
                showFinish: false,
                isDataAddEnd: false, // 数据是否已加载完
                isAddData: false, // 数据是否正在加载
                currPage: 0,
                pageSize: 10,
                dataList: [],

                activeFilterType: '', // 当前active的过滤条件类型
                selectedDistance: 0,
                selectedSortField: '',
                selectedFilter: 'all',
                isFilterPop: false,

                distanceList: [{label: '1km', value: 1}, {label: '3km', value: 3}, {label: '5km', value: 5}, {label: '10km', value: 10}, {label: '30km', value: 30}, {label: '全部会所', value: 0}],
                sortFields: [{label: '默认排序', value: ''}, {label: '距离最近', value: 'distance'}, {label: '人气最高', value: 'uv'}],
                filters: [{label: '全部会所', value: 'all'}, {label: '可选技师', value: 'tech'}, {label: '优惠活动', value: 'coupon'}, {label: '我的收藏', value: 'favorite'}]
            }
        },
        created: function () {
            var that = this
            that.global.loading = false
            that.queryData()
        },
        methods: {
            doClickFilterWrap: function () {
                this.isFilterPop = false
                this.activeFilterType = ''
            },
            doClickFilterMenu: function (type) {
                var that = this
                if (that.isFilterPop && that.activeFilterType == type) {
                    that.isFilterPop = ''
                    that.activeFilterType = ''
                } else {
                    that.isFilterPop = true
                    that.activeFilterType = type
                }
            },
            doSelectedItem: function (type, val) {
                var that = this
                if (that['selected' + type] == val) {
                    return
                } else {
                    that.activeFilterType = ''
                    that.isFilterPop = false
                    that.queryData(1)
                }
            },
            doHandlerListScroll: function () { // 滚动加载
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
                that.dataLoading = true
                that.showFinish = false
                that.isDataAddEnd = false

                that.$http.get('../api/v2/club/all/clubs', {
                    params: {
                        page: page,
                        pageSize: that.pageSize,
                        clubName: '',
                        openId: global.openId,
                        distance: that.selectedDistance,
                        sort: that.selectedSortField,
                        search: that.selectedFilter == 'all' ? '' : that.selectedFilter,
                        lngx: global.currLngx || '',
                        laty: global.currLaty || '',
                        loginName: global.loginName
                    }
                }).then(function (res) {
                    res = res.body
                    if (res) {
                        res = (res.statusCode != '200') ? [] : res['respData']
                        if (page == 1) {
                            that.dataList = res
                        } else {
                            for (var i = 0; i < res.length; i++) {
                                that.dataList.push(res[i])
                            }
                        }
                        that.currPage = page
                        if (res.length < that.pageSize) {
                            that.isDataAddEnd = true
                            that.showFinish = true
                        }
                        that.isAddData = false
                        that.dataLoading = false
                    } else {
                        Util.tipShow(global.loadError)
                    }
                }, function () {
                    Util.tipShow(global.loadError)
                })
            }
        }
    }
</script>