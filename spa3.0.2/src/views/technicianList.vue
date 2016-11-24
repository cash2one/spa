<style>
    @import '../styles/page/technicianList.css';
</style>
<template>
    <div class="page" id="technician-list-page">
        <div class="page-title">技师列表</div>
        <div class="search" :class="{ active: showSearchInput }">
            <input type="text" placeholder="技师昵称或者编号" maxlength="30" v-model="searchTechName"/>
            <div @click="queryTechList(1)">搜索</div>
        </div>

        <div class="menu" :class="{ 'search-active': showSearchInput }">
            <div class="status" @click="doClickChangeStatus()">
                <div :class="{ active : stateActiveId=='free' }">只显示闲</div>
            </div>
            <div class="comment" @click="doClickShowSelectScore()">
                <div :class="{ active : showSelectScore }">{{ scoreActiveId =='1' ? '评论最多' : '评分最高' }}</div>
            </div>
            <div class="filter" @click="doClickShowServiceItemSelectArea()">
                <div :class="{ active : showServiceItemSelectArea }">{{ currSelectItemName=="全部项目" ? "项目筛选" : currSelectItemName }}</div>
            </div>
            <div class="search-icon" @click="doSwitchSearchInput()"></div>
        </div>

        <div class="tech-list" ref="listEle" :style="{ height : (global.winHeight-7.633*global.winScale*16)+'px' }" @scroll="doHandlerTechListScroll()">
            <router-link class="item" :to="{ name : 'technicianDetail', query : { id : tech.id } }" v-for="tech in techList" :key="tech.id">
                <div :class="tech.status" :style="{ backgroundImage : 'url('+(tech.avatarUrl || global.defaultHeader)+')' }"></div>
                <div>
                    <div>
                        <div>
                            <div>{{ tech.name || global.defaultTechName }}</div>
                            <div v-show="tech.serialNo">{{ tech.serialNo }}</div>
                        </div>
                        <div>
                            <div>{{ tech.starStr }}</div>
                            <div>{{ tech.commentCount }}</div>
                            <div>{{ tech.impressionsStr }}</div>
                        </div>
                        <div><div>{{ tech.description || "" }}</div></div>
                    </div>
                    <div></div>
                </div>
            </router-link>
            <div class="data-load-tip" :class="{ none : !showDataLoadTip }"><i></i>
                <div>加载数据</div>
            </div>
            <div class="finish-load-tip" :class="{ none : !showFinishLoadTip }">
                <div>已经加载全部数据</div>
            </div>
            <div class="nullData" v-show="techList.length==0 && !isAddData">
                <div v-show="!global.loading"></div>
                <div>{{ global.loading ? '数据加载中...' : '暂无内容...' }}</div>
            </div>
        </div>

        <div class="pop-modal selector-area" :class="{ 'show-search' : showSearchInput, active : showSelectScore || showServiceItemSelectArea }">
            <div class="comment" :class="{ active : showSelectScore }">
                <div @click="doClickChangeScoreStatus('1')" :class="{ active : scoreActiveId =='1' }">评论最多</div>
                <div @click="doClickChangeScoreStatus('-1')" :class="{ active : scoreActiveId !='1' }">评分最高</div>
            </div>
            <div class="service-item" :class="{ active : showServiceItemSelectArea }">
                <div>
                    <div class="all">
                        <div class="item" :class="{ active : itemActiveId=='-1' }" @click="doClickServiceItem('-1','全部项目','')">全部项目</div>
                    </div>
                    <div class="category" v-for="item in serviceItems">
                        <div>{{ item.name }}</div>
                        <div>
                            <div class="item" v-for="subItem in item.serviceItems" :class="{ active : itemActiveId==subItem.id }" @click="doClickServiceItem(subItem.id,subItem.name,item.name)">{{ subItem.name }}</div>
                        </div>
                    </div>
                </div>
                <div>
                    <div @click="doClickServiceItemBtn('cancel')">取消</div>
                    <div @click="doClickServiceItemBtn('ok')">确定</div>
                </div>
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
                getDataUrl: '../api/v2/club/{clubId}/technician',
                global: Global.data,
                techList: [],
                showSearchInput: false,
                serviceItems: [],

                // 查询参数
                currPage: 1,
                pageSize: 10,
                stateActiveId: 'all', // 只显示闲忙的选择
                scoreActiveId: '1',
                itemActiveId: '-1',
                searchTechName: '',

                selectedCategory: '', // 选中项目的分类
                selectItemName: '全部项目', // 选中的服务项目名
                currSelectedCategory: '',
                currSelectItemName: '全部项目',
                currItemActiveId: '-1',

                currScrollTop: 0, // 当前滚动条
                showDataLoadTip: false, // 显示数据正在加载
                showFinishLoadTip: false, // 显示已经加载完成
                isDataAddEnd: false, // 数据是否已加载完
                isAddData: false, // 数据是否正在加载
                showSelectScore: false, // 评论评分的下拉选择
                showServiceItemSelectArea: false, // 是否显示服务项目选择
                storeDataList: ['techList', 'showSearchInput', 'currPage', 'stateActiveId', 'scoreActiveId', 'itemActiveId', 'searchTechName', 'selectedCategory', 'selectItemName', 'currSelectedCategory', 'currSelectItemName', 'currItemActiveId', 'showFinishLoadTip', 'isDataAddEnd', 'showSelectScore', 'showServiceItemSelectArea']
            }
        },
        mounted: function () {
            var that = this
            var global = that.global
            var pageData = global.pageData['technicianList']
            if (pageData) {
                setTimeout(function () {
                    console.log('scroll top：' + pageData['scrollTop'])
                    that.$refs.listEle.scrollTop = pageData['scrollTop']
                }, 100)
            }
            // 获取服务项目数据
            that.$http.get('../api/v2/club/{clubId}/service/select', {params: {clubId: global.clubId}}).then(function (res) {
                res = res.body
                if (res && res.length) {
                    that.serviceItems = res
                }
            })
        },
        created: function () {
            var that = this
            var global = that.global
            var pageData = global.pageData['technicianList'] // 获取缓存中的数据

            if (pageData) {
                for (var key in pageData) {
                    that[key] = pageData[key]
                }
                global.loading = false
            } else {
                that.$http.get(that.getDataUrl, {
                    params: {
                        clubId: global.clubId,
                        page: that.currPage,
                        pageSize: that.pageSize,
                        stateActiveId: that.stateActiveId,
                        scoreActiveId: that.scoreActiveId,
                        itemActiveId: that.currItemActiveId,
                        techName: that.showSearchInput ? encodeURIComponent(that.searchTechName) : ''
                    }
                }).then(function (res) {
                    res = res.body
                    if (res && res.list) {
                        that.doHandlerTechListData(res.list)
                        that.techList = res.list
                        global.loading = false
                    } else {
                        Util.tipShow(global.loadError)
                        that.$router.back()
                    }
                }, function () {
                    Util.tipShow(global.loadError)
                    that.$router.back()
                })
            }
        },
        methods: {
            doSwitchSearchInput: function () {
                this.showSearchInput = !this.showSearchInput
            },
            queryTechList: function (page) { // 查询列表数据
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
                that.$http.get(that.getDataUrl, {
                    params: {
                        clubId: global.clubId,
                        page: page,
                        pageSize: that.pageSize,
                        stateActiveId: that.stateActiveId,
                        scoreActiveId: that.scoreActiveId,
                        itemActiveId: that.currItemActiveId,
                        techName: that.showSearchInput ? encodeURIComponent(that.searchTechName) : ''
                    }
                }).then(function (res) {
                    res = res.body
                    if (res && res.list) {
                        that.doHandlerTechListData(res.list)

                        if (page == 1) {
                            that.techList = res.list
                            if (res.list.length == 0) {
                                that.isDataAddEnd = true
                            }
                        } else {
                            for (var i = 0; i < res.list.length; i++) {
                                that.techList.push(res.list[i])
                            }
                            if (res.list.length < that.pageSize) {
                                that.isDataAddEnd = true
                                that.showFinishLoadTip = true
                            }
                        }
                        that.currPage = page
                        that.isAddData = false
                        that.showDataLoadTip = false
                        // console.log((+new Date())+'---that.showFinishLoadTip：'+that.showFinishLoadTip+'--that.isDataAddEnd：'+that.isDataAddEnd);
                    } else {
                        Util.tipShow(global.loadError)
                    }
                }, function () {
                    Util.tipShow(global.loadError)
                })
            },
            doHandlerTechListScroll: function () { // 数据列表往下滑动加载的处理
                var that = this
                var listEle = that.$refs.listEle
                that.currScrollTop = listEle.scrollTop
                if (!that.isDataAddEnd && listEle.scrollTop + listEle.clientHeight * 1.4 > listEle.scrollHeight) {
                    that.queryTechList()
                }
            },
            doHandlerTechListData: function (list) { // 获取列表数据之后的处理
                var that = this
                var gTechList = that.global.techList
                var gTechID = that.global.techListID
                var impsArr
                var imps
                var techItem
                var k

                for (var i = 0; i < list.length; i++) {
                    techItem = list[i]
                    techItem.starStr = ((techItem.star - 0) / 20).toFixed(1)
                    imps = techItem.impressions
                    impsArr = []
                    if (imps && imps.length > 0) {
                        for (k = 0; k < imps.length; k++) {
                            if (imps[k]) {
                                impsArr.push('#' + imps[k])
                            }
                        }
                    }
                    techItem.impressionsStr = impsArr.join(' ')
                    if (gTechID[techItem.id] == undefined) {
                        gTechID[techItem.id] = gTechList.length
                        gTechList.push(techItem)
                    }
                }
            },
            doClickChangeStatus: function () {
                this.stateActiveId = (this.stateActiveId == 'all' ? 'free' : 'all')
                this.queryTechList(1)
            },
            doClickShowSelectScore: function () {
                this.showSelectScore = !this.showSelectScore
                this.showServiceItemSelectArea = false
            },
            doClickChangeScoreStatus: function (type) {
                this.scoreActiveId = type
                this.queryTechList(1)
            },
            doClickShowServiceItemSelectArea: function () {
                this.showSelectScore = false
                this.showServiceItemSelectArea = !this.showServiceItemSelectArea
            },
            doClickServiceItemBtn: function (type) {
                var that = this
                if (type == 'ok') {
                    that.currSelectedCategory = that.selectedCategory
                    that.currSelectItemName = that.selectItemName
                    that.currItemActiveId = that.itemActiveId
                    that.queryTechList(1)
                }
                that.showServiceItemSelectArea = false
            },
            doClickServiceItem: function (itemId, itemName, categoryName) {
                this.itemActiveId = itemId
                this.selectItemName = itemName
                this.selectedCategory = categoryName
            }
        },
        beforeDestroy: function () {
            // 保存当前页面状态数据
            var that = this
            var pageData = that.global.pageData
            if (!pageData.technicianList) pageData.technicianList = {}
            pageData = pageData.technicianList
            var status
            for (var k = 0; k < that.storeDataList.length; k++) {
                status = that.storeDataList[k]
                pageData[status] = that[status]
            }
            pageData['scrollTop'] = that.currScrollTop
        }
    }
</script>