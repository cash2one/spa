<template>
    <div class="page club-list-page" id="club-list-search-page" :style="{ height : (global.winHeight-2.667*global.winScale*16)+'px' }">
        <div class="page-title search-title">
            <a class="back" @click="doClickPageBack()"></a>
            <input type="text" v-model="searchText" placeholder="输入会所名称、地址、技师标签" maxlength="50" @keypress.enter="doClickSearchBtn()"/>
            <div @click="doClickSearchBtn()">搜索</div>
        </div>
        <div class="tags" v-show="showTags">
            <div>会所</div>
            <ul class="clear-fix">
                <li v-for="item in clubTags" @click="doClickTag(item)">{{ item }}</li>
            </ul>
        </div>
        <div class="tags" v-show="showTags && techTags.length>0">
            <div>技师</div>
            <ul class="clear-fix">
                <li @click="doClickTag(item.tag)" v-for="item in techTags">{{ item.tag }}</li>
            </ul>
        </div>
        <div class="club-list" v-show="!showTags && clubList.length>0">
            <div class="list-title">会所</div>
            <club v-for="item in clubList" :club-obj="item" key="item.id"></club>
            <div class="view-more" @click="doClickViewMore('club')" v-show="!showClubDataFinish" :class="{ 'loading-data' : loadingClubData }"><span>{{ loadingClubData ? '正在加载...' : '查看更多会所' }}</span></div>
            <div class="finish-load-tip" :class="{ none : !showClubDataFinish }">
                <div>已经加载全部数据</div>
            </div>
        </div>
        <div class="tech-list" v-show="!showTags && techList.length>0">
            <div class="list-title">技师</div>
            <tech v-for="item in techList" :tech-obj="item" :search-text="searchText" key="item.id"></tech>
            <div class="view-more" @click="doClickViewMore('tech')" v-show="!showTechDataFinish" :class="{ 'loading-data' : loadingTechData }"><span>{{ loadingTechData ? '正在加载...' : '查看更多技师' }}</span></div>
            <div class="finish-load-tip" :class="{ none : !showTechDataFinish }">
                <div>已经加载全部数据</div>
            </div>
        </div>
        <div class="nullData" v-show="!showTags && clubList.length==0 && techList.length==0">
            <div></div>
            <div>未能搜索到内容...</div>
        </div>
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
                searchUrl: '../api/v2/club/club_tech_search',
                currCity: '',
                currRegion: '',
                clubTags: ['按摩', '桑拿', '水疗', '水会', '休闲', 'SPA'],
                techTags: [],
                searchText: '',
                showTags: true,
                clubList: [],
                techList: [],
                showClubDataFinish: false,
                showTechDataFinish: false,
                queryClubPage: 1,
                queryTechPage: 1,
                loadingTechData: false,
                loadingClubData: false,
                queryPageSize: 3
            }
        },
        created: function () {
            var that = this
            var currPage = that.global.currPage.query
            eventHub.$on('put-curr-city-region', that.doPutCurrCityRegion)
            eventHub.$emit('get-curr-city-region')
            that.queryTechTags()
            if (currPage.key) {
                that.searchText = decodeURIComponent(currPage.key)
                that.doClickSearchBtn()
            }
        },
        methods: {
            // 查询会所标签
            queryClubTags: function () {
                var that = this
                var global = that.global
                that.$http.post('../api/v2/club/tags', {
                    city: encodeURIComponent(that.currCity || ''),
                    region: encodeURIComponent(that.currRegion || ''),
                    laty: global.currLaty || 0,
                    lngx: global.currLngx || 0
                }).then(function (res) {
                    res = res.body
                    if (res.statusCode == 200) {
                        res = res.respData
                        if (res && res instanceof Array) {
                            that.clubTags = res
                        }
                    } else {
                        Util.tipShow(res.msg || '查询会所标签数据出错！')
                    }
                })
            },
            // 查询技师标签
            queryTechTags: function () {
                var that = this
                that.$http.get('../api/v2/club/impression/list').then(function (res) {
                    res = res.body
                    if (res.statusCode == 200) {
                        that.techTags = res.respData
                    } else {
                        Util.tipShow(res.msg || '查询印象标签数据出错！')
                    }
                })
            },
            // 点击标签
            doClickTag: function (tag) {
                this.searchText = tag
                this.doClickSearchBtn()
            },
            // 点击搜索按钮
            doClickSearchBtn: function () {
                var that = this
                var global = that.global
                if (that.searchText == '') {
                    that.showTags = true
                    return
                }
                that.$router.replace({name: 'clubList-search', query: {key: encodeURIComponent(that.searchText)}})

                that.showClubDataFinish = false
                that.showTechDataFinish = false
                that.queryClubPage = 1
                that.queryTechPage = 1
                that.loadingTechData = false
                that.loadingClubData = false

                that.$http.post(that.searchUrl, {
                    laty: global.currLaty || '',
                    lngx: global.currLngx || '',
                    page: 1,
                    pageSize: 3,
                    search: that.searchText,
                    searchType: ''
                }).then(function (res) {
                    res = res.body
                    if (res.statusCode == 200) {
                        res = res.respData
                        that.showTags = false
                        that.techList = res.techs || []
                        that.clubList = res.clubs || []
                    }
                })
            },
            // 点击'查看更多会所/技师'
            doClickViewMore: function (type) {
                var that = this
                var global = that.global
                var page
                var k
                if ((type == 'club' && that.loadingClubData) || (type == 'tech' && that.loadingTechData)) return
                if (type == 'club') {
                    that.loadingClubData = true
                    page = ++that.queryClubPage
                } else {
                    that.loadingTechData = true
                    page = ++that.queryTechPage
                }
                that.$http.post(that.searchUrl, {
                    laty: global.currLaty || '',
                    lngx: global.currLngx || '',
                    page: page,
                    pageSize: that.queryPageSize,
                    search: that.searchText,
                    searchType: type
                }).then(function (res) {
                    res = res.body
                    type == 'club' ? that.loadingClubData = false : that.loadingTechData = false
                    if (res.statusCode == 200) {
                        res = res.respData
                        res = (type == 'club' ? res.clubs : res.techs) || []
                        if (page == 1) {
                            type == 'club' ? that.clubList = res : that.techList = res
                        } else {
                            if (type == 'club') {
                                for (k = 0; k < res.length; k++) {
                                    that.clubList.push(res[k])
                                }
                            } else {
                                for (k = 0; k < res.length; k++) {
                                    that.techList.push(res[k])
                                }
                            }
                        }
                        if (res.length < 10) {
                            type == 'club' ? that.showClubDataFinish = true : that.showTechDataFinish = true
                        }
                    }
                })
            },
            // 获取到curr city region
            doPutCurrCityRegion: function (option) {
                var that = this
                that.currCity = option.city
                that.currRegion = option.region
                that.queryClubTags()
            },
            doClickPageBack: function () {
                this.$router.go(-1)
            }
        },
        beforeDestroy: function () {
            eventHub.$off('put-curr-city-region', this.doPutCurrCityRegion)
        }
    }
</script>