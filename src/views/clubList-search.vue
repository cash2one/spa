<template>
    <div class="page club-list-page" id="club-list-search-page" v-show="!global.loading" :style="{ height : (global.winHeight-2.667*global.winScale*16)+'px' }">
        <div class="page-title search-title">
            <a class="back" @click="doClickPageBack()"></a>
            <input type="text" v-model="searchText" placeholder="输入会所名称、地址、技师标签" maxlength="50" @keypress.enter="doClickSearchBtn()"/>
            <div @click="doClickSearchBtn()">搜索</div>
        </div>
        <div class="tags" v-show="showTags"><div>会所</div><ul class="clear-fix"><li v-for="item in clubTags" @click="doClickTag(item)">{{ item }}</li></ul></div>
        <div class="tags" v-show="showTags && techTags.length>0"><div>技师</div><ul class="clear-fix"><li @click="doClickTag(item.tag)" v-for="item in techTags">{{ item.tag }}</li></ul></div>
        <div class="club-list" v-show="!showTags && clubList.length>0">
            <div class="list-title">会所</div>
            <club v-for="item in clubList" :club-obj="item" key="item.id"></club>
            <div class="view-more" @click="doClickViewMore('club')" v-show="!showClubDataFinish" :class="{ 'loading-data' : loadingClubData }"><span>{{ loadingClubData ? '正在加载...' : '查看更多会所' }}</span></div>
            <div class="finish-load-tip" :class="{ none : !showClubDataFinish }"><div>已经加载全部数据</div></div>
        </div>
        <div class="tech-list" v-show="!showTags && techList.length>0">
            <div class="list-title">技师</div>
            <tech v-for="item in techList" :tech-obj="item" :search-text="searchText" key="item.id"></tech>
            <div class="view-more" @click="doClickViewMore('tech')" v-show="!showTechDataFinish" :class="{ 'loading-data' : loadingTechData }"><span>{{ loadingTechData ? '正在加载...' : '查看更多技师' }}</span></div>
            <div class="finish-load-tip" :class="{ none : !showTechDataFinish }"><div>已经加载全部数据</div></div>
        </div>
        <div class="nullData" v-show="!showTags && clubList.length==0 && techList.length==0"><div></div><div>未能搜索到内容...</div></div>
    </div>
</template>
<script>
    import { Global } from '../libs/global';
    import Util from "../libs/util";
    import { eventHub } from '../libs/hub';
    import Club from "../components/club";
    import Tech from "../components/tech";

    module.exports = {
        components : {
            'club' : Club,
            'tech' : Tech
        },
        data: function(){
            return {
                global : Global.data,
                searchUrl : "../api/v2/club/club_tech_search",
                currCity : "",
                currRegion : "",
                clubTags : [ '按摩', '桑拿', '水疗', '水会', '休闲', 'SPA' ],
                techTags : [],
                searchText : "",
                showTags : true,
                clubList : [],
                techList : [],
                showClubDataFinish : false,
                showTechDataFinish : false,
                queryClubPage : 1,
                queryTechPage : 1,
                loadingTechData : false,
                loadingClubData : false,
                queryPageSize : 3
            }
        },
        created : function(){
            var   _this = this, currPage = _this.global.currPage.query;
            eventHub.$on("put-curr-city-region",_this.doPutCurrCityRegion);
            eventHub.$emit("get-curr-city-region");
            _this.queryTechTags();
            if(currPage.key){
                _this.searchText = decodeURIComponent(currPage.key);
                _this.doClickSearchBtn();
            }
        },
        methods: {
            //查询会所标签
            queryClubTags : function(){
                var _this = this, global = _this.global;
                _this.$http.post("../api/v2/club/tags",{
                    city : encodeURIComponent(_this.currCity || ''),
                    region : encodeURIComponent(_this.currRegion || ''),
                    laty : global.currLaty || 0,
                    lngx : global.currLngx || 0
                }).then(function(res){
                    res = res.body;
                    if(res.statusCode == 200){
                        res = res.respData;
                        if(res && res instanceof Array){
                            _this.clubTags = res;
                        }
                    }
                    else{
                        Util.tipShow(res.msg || "查询会所标签数据出错！");
                    }
                });
            },

            //查询技师标签
            queryTechTags : function(){
                var _this = this;
                _this.$http.get("../api/v2/club/impression/list").then(function(res){
                    res = res.body;
                    if(res.statusCode == 200){
                        _this.techTags = res.respData;
                    }
                    else{
                        Util.tipShow(res.msg || "查询印象标签数据出错！");
                    }
                });
            },

            //点击标签
            doClickTag : function(tag){
                this.searchText = tag;
                this.doClickSearchBtn();
            },

            //点击搜索按钮
            doClickSearchBtn : function(){
                var _this = this, global = _this.global;
                if(_this.searchText == ""){
                    return _this.showTags = true;
                }
                _this.$router.replace({ name : "clubList-search", query : { key : encodeURIComponent(_this.searchText) } });

                _this.showClubDataFinish = false;
                _this.showTechDataFinish = false;
                _this.queryClubPage = 1;
                _this.queryTechPage = 1;
                _this.loadingTechData = false;
                _this.loadingClubData = false;

                _this.$http.post(_this.searchUrl,{
                    laty : global.currLaty || '',
                    lngx : global.currLngx || '',
                    page :1,
                    pageSize : 3,
                    search : _this.searchText,
                    searchType : ''
                }).then(function(res){
                    res = res.body;
                    if(res.statusCode == 200){
                        res = res.respData;
                        _this.showTags = false;
                        _this.techList = res.techs || [];
                        _this.clubList = res.clubs || [];
                    }
                });
            },

            //点击"查看更多会所/技师"
            doClickViewMore : function(type){
                var _this = this, global = _this.global, page, k;
                if((type=="club" && _this.loadingClubData) || (type=="tech" && _this.loadingTechData)) return;
                if(type=="club"){
                    _this.loadingClubData=true;
                    page = ++_this.queryClubPage;
                }
                else{
                    _this.loadingTechData=true;
                    page = ++_this.queryTechPage;
                }

                _this.$http.post(_this.searchUrl,{
                    laty : global.currLaty || '',
                    lngx : global.currLngx || '',
                    page : page,
                    pageSize : _this.queryPageSize,
                    search : _this.searchText,
                    searchType : type
                }).then(function(res) {
                    res = res.body;
                    type=="club" ? _this.loadingClubData=false : _this.loadingTechData=false;
                    if(res.statusCode == 200){
                        res = res.respData;
                        res = (type=="club" ? res.clubs : res.techs) || [];
                        if(page == 1){
                            type=="club" ? _this.clubList = res : _this.techList = res;
                        }
                        else{
                            if(type == "club"){
                                for(k=0;k<res.length;k++){
                                    _this.clubList.push(res[k]);
                                }
                            }
                            else{
                                for(k=0;k<res.length;k++){
                                    _this.techList.push(res[k]);
                                }
                            }
                        }
                        if(res.length<10){
                            type=="club" ? _this.showClubDataFinish=true : _this.showTechDataFinish=true;
                        }
                    }
                });
            },

            //获取到curr city region
            doPutCurrCityRegion : function(option){
                var _this = this;
                _this.currCity = option.city;
                _this.currRegion = option.region;
                _this.queryClubTags();
            },

            doClickPageBack : function(){
                this.$router.go(-1);
            }
        },
        beforeDestroy : function(){
            eventHub.$off("put-curr-city-region",this.doPutCurrCityRegion);
        }
    }
</script>