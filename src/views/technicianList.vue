<style>
    @import '../styles/page/technicianList.css';
</style>
<template>
    <div class="loading" v-show="$loadingRouteData"><i></i><i></i><i></i></div>
    <div class="page" id="technician-list-page" v-show="!$loadingRouteData">
        <div class="page-title">技师列表<a class="search" @click="doClickSwitchSearchInputBtn()"></a></div>
        <div class="search" :class="{ active: showSearchInput }">
            <input type="text" placeholder="技师昵称或者编号" maxlength="30" v-model="searchTechName" /><div @click="doClickSearchBtn()">搜索</div>
        </div>
        <div class="menu" :class="{ 'search-active': showSearchInput }">
            <div class="status" @click="doClickChangeStatus()">
                <div :class="{ active : stateActiveId=='free' }"></div>
                <div>只显示闲</div>
            </div>
            <div class="comment" @click="doClickShowSelectScore()">
                <div :class="{ active : showSelectScore }">
                    <div>{{ scoreActiveId =='1' ? '评论最多' : '评分最高' }}</div>
                    <span></span>
                </div>
                <div :class="{ active : showSelectScore }">
                    <div @click="doClickChangeScoreStatus('1')" :class="{ active : scoreActiveId =='1' }">评论最多</div>
                    <div @click="doClickChangeScoreStatus('-1')" :class="{ active : scoreActiveId !='1' }">评分最高</div>
                </div>
            </div>
            <div class="filter" @click="doClickShowServiceItemSelectArea()">
                <div></div>
                <div :class="{ active : currSelectItemName != '全部项目' }">{{currSelectItemName=="全部项目" ? "项目筛选" : currSelectItemName }}</div></div>
        </div>

        <div class="tech-list" ref="listEle" :style="{ height : (global.winHeight-7.633*global.winScale*16)+'px' }" @scroll="doHandlerTechListScroll()">
            <router-link class="item" :to="{ name : 'technicianDetail', query : { id : tech.id } }" v-for="tech in techList" :key="tech.id" tag="div">
                <div>
                    <div :style="{ backgroundImage : 'url('+(tech.avatarUrl || global.defaultHeader)+')' }"></div>
                    <div :class="tech['status']">{{ tech['status']=='free' ? '闲' : '忙' }}</div>
                </div>
                <div>
                    <div>
                        <div>
                            <div>{{ tech['name'] || global.defaultTechName }}</div>
                            <div v-show="tech['serialNo']">[<span>{{ tech['serialNo'] }}</span>]</div>
                        </div>
                        <div>
                            <div class="stars">
                                <div :style="{ width : tech['star']+'%'}"></div>
                            </div>
                            <div>{{tech['commentCount']}}评论</div>
                        </div>
                    </div>
                    <div>
                        <span v-for="tag in tech.tagStrArr">{{tag}}</span>
                    </div>
                    <div>
                        <div>{{tech['description'] || ''}}</div>
                        <div>预约</div>
                    </div>
                </div>
            </router-link>
            <div class="data-load-tip" :class="{ none : !showDataLoadTip }"><i></i><div>加载数据</div></div>
            <div class="finish-load-tip" :class="{ none : !showFinishLoadTip }"><div>已经加载全部数据</div></div>
            <div class="nullData" v-show="techList.length==0 && !isAddData"><div></div><div>暂无内容...</div></div>
        </div>
    </div>

    <div id="tech-list-select-area" class="pop-modal" :class="{ active : showServiceItemSelectArea }">
        <div>
            <div>
                <div class="all">
                    <div :class="{ active : itemActiveId=='-1' }" @click="doClickServiceItem('-1','全部项目','')">全部项目</div>
                </div>
                <div class="category" v-for="item in serviceItems">
                    <div>{{item.name}}</div>
                    <div>
                        <div v-for="subItem in item.serviceItems" :class="{ active : itemActiveId==subItem.id }" @click="doClickServiceItem(subItem.id,subItem.name,item.name)">{{subItem.name}}</div>
                    </div>
                </div>
                <div class="null"></div>
            </div>
            <div class="btns">
                <div @click="doClickServiceItemBtn('cancel')">取消</div>
                <div @click="doClickServiceItemBtn('ok')">确定</div>
            </div>
        </div>
    </div>
</template>
<script>
    import { Global } from '../libs/global';
    import Util from "../libs/util";

    module.exports = {
        data: function(){
            return {
                getTechListUrl : "../api/v2/club/"+Global.data.clubId+"/technician",
                getServiceItemUrl : "../api/v2/club/"+Global.data.clubId+"/service/select",
                global : Global.data,

                techList : [],
                showSearchInput: false,
                serviceItems : [],

                ////////////////////////////////查询参数
                currPage : 1,
                pageSize : 10,
                stateActiveId : "all", //只显示闲忙的选择
                scoreActiveId : "1",
                itemActiveId : "-1",
                searchTechName : "",

                selectedCategory : "",//选中项目的分类
                selectItemName : '全部项目',//选中的服务项目名
                currSelectedCategory : "",
                currSelectItemName : "全部项目",
                currItemActiveId : "-1",

                showDataLoadTip : false, //显示数据正在加载
                showFinishLoadTip : false,//显示已经加载完成
                isDataAddEnd : false,//数据是否已加载完
                isAddData : false,//数据是否正在加载
                showSelectScore : false,//评论评分的下拉选择
                showServiceItemSelectArea : false,//是否显示服务项目选择
                storeDataList : [ 'techList', 'showSearchInput', 'currPage', 'stateActiveId', 'scoreActiveId', 'itemActiveId', 'searchTechName', 'selectedCategory', 'selectItemName', 'currSelectedCategory', 'currSelectItemName', 'currItemActiveId', 'showFinishLoadTip', 'isDataAddEnd', 'showSelectScore', 'showServiceItemSelectArea']
            };
        },
        mounted : function(){
            var _this = this,pageData = _this.global.pageData["technicianList"];
            if(pageData){
                setTimeout(function(){
                    _this.$refs.listEle.scrollTop = pageData["scrollTop"];
                    //console.log("set scroll top："+ pageData["scrollTop"]+"---"+_this.techListEle.scrollTop);
                },100)
            }
            //////获取服务项目数据
            _this.$http.get(_this.getServiceItemUrl).then(function(res){
                res = res.body;
                if(res && res.length){
                    _this.serviceItems = res;
                }
            },function(){
                /////////////////
            })
        },
        route : {
            data : function(transition){
                var _this = this;
                return new Promise(function(resolve,reject){
                    var pageData = _this.global.pageData["technicianList"];
                    if(pageData){
                        var resolveDataObj = {};
                        for(var key in pageData){
                            resolveDataObj[key] = pageData[key];
                        }
                        resolve(resolveDataObj);
                    }
                    else{
                        _this.$http.get(_this.getTechListUrl,{ params : {
                            page : _this.currPage,
                            pageSize : _this.pageSize,
                            stateActiveId : _this.stateActiveId,
                            scoreActiveId : _this.scoreActiveId,
                            itemActiveId : _this.currItemActiveId,
                            techName : _this.showSearchInput ? encodeURIComponent(_this.searchTechName) : ""
                        }}).then(function(res){
                            res = res.body;
                            if(res && res.list){
                                _this.doHandlerTechListData(res.list);
                                resolve({ techList : res.list });
                            }
                            else{
                                Util.tipShow(_this.global.loadDataErrorTip);
                                reject(false);
                                transition.abort();
                            }
                        }, function(){
                            Util.tipShow(_this.global.loadDataErrorTip);
                            reject(false);
                            transition.abort();
                        });
                    }
                })
            }
        },
        methods: {
            doClickSwitchSearchInputBtn : function(){
                this.showSearchInput = !this.showSearchInput;
            },
            queryTechList : function(page){//查询列表数据
                var _this = this;
                if(_this.isAddData){
                    return;
                }
                _this.isAddData = true;
                page = page || _this.currPage+1;

                //更新数据加载提示
                _this.showDataLoadTip = true;
                _this.showFinishLoadTip = false;
                _this.isDataAddEnd = false;

                _this.$http.get(_this.getTechListUrl, { params: {
                    page: page,
                    pageSize: _this.pageSize,
                    stateActiveId: _this.stateActiveId,
                    scoreActiveId: _this.scoreActiveId,
                    itemActiveId: _this.currItemActiveId,
                    techName: _this.showSearchInput ? encodeURIComponent(_this.searchTechName) : ""
                }}).then(function (res) {
                    res = res.body;
                    if (res && res.list) {
                        _this.doHandlerTechListData(res.list);

                        if(page==1){
                            _this.techList = res.list;
                            if(res.list.length == 0){
                                _this.isDataAddEnd = true;
                            }
                        }
                        else{
                            for(var i=0;i<res.list.length;i++){
                                _this.techList.push(res.list[i]);
                            }
                            if(res.list.length < _this.pageSize){
                                _this.isDataAddEnd = true;
                                _this.showFinishLoadTip = true;
                            }
                        }
                        _this.currPage = page;
                        _this.isAddData = false;
                        _this.showDataLoadTip = false;
                        //console.log((+new Date())+"---_this.showFinishLoadTip："+_this.showFinishLoadTip+"--_this.isDataAddEnd："+_this.isDataAddEnd);
                    }
                    else {
                        Util.tipShow(_this.global.loadDataErrorTip);
                    }
                }, function () {
                    Util.tipShow(_this.global.loadDataErrorTip);
                });
            },
            doHandlerTechListScroll : function(){//数据列表往下滑动加载的处理
                var _this = this,listEle = _this.$refs.listEle;
                if(!_this.isDataAddEnd && listEle.scrollTop+listEle.clientHeight*1.4>listEle.scrollHeight ){
                    _this.queryTechList();
                }
            },
            doHandlerTechListData : function(list){//获取列表数据之后的处理
                var _this = this, gTechList = _this.global.techList, gTechID = _this.global.techListID;
                for(var i=0;i<list.length;i++){
                    if(!list[i]['techTags'] || list[i]['techTags'].length == 0){
                        list[i]['techTags']=[ { tagName : '(无)' } ];
                    }

                    if(_this.currSelectedCategory && list[i]["techTags"].length>1){
                        list[i]["techTags"].sort(function(a,b){
                            if(a.tagName == _this.currSelectedCategory) return -1;
                            else if(b.tagName == _this.currSelectedCategory) return 1;
                            return 0;
                        });
                    }
                    list[i]["tagStrArr"] = [];
                    for(var k=0;k<3 && k<list[i]["techTags"].length;k++){
                        list[i]["tagStrArr"].push(k==2 ? "..." : list[i]["techTags"][k]["tagName"]);
                    }

                    if(gTechID[list[i]["id"]] == undefined){
                        gTechID[list[i]["id"]] =  gTechList.length;
                        gTechList.push(list[i]);
                    }
                }
            },
            doClickChangeStatus : function(){
                this.showSelectScore = false;
                this.stateActiveId = (this.stateActiveId == "all" ? "free" : "all");
                this.queryTechList(1);
            },
            doClickShowSelectScore : function(){
                this.showSelectScore = !this.showSelectScore;
            },
            doClickChangeScoreStatus : function(type){
                this.scoreActiveId = type;
                this.queryTechList(1);
            },
            doClickSearchBtn : function(){
                this.queryTechList(1);
            },
            doClickShowServiceItemSelectArea : function(){
                this.showSelectScore = false;
                this.showServiceItemSelectArea = true;
            },
            doClickServiceItemBtn : function(type){
                var _this = this;
                if(type == "ok"){
                    _this.currSelectedCategory  = _this.selectedCategory;
                    _this.currSelectItemName = _this.selectItemName;
                    _this.currItemActiveId = _this.itemActiveId;
                    _this.queryTechList(1);
                }
                _this.showServiceItemSelectArea = false;
            },
            doClickServiceItem : function(itemId,itemName,categoryName){
                this.itemActiveId = itemId;
                this.selectItemName = itemName;
                this.selectedCategory = categoryName;
            }
        },
        beforeDestroy : function(){
            ////////////////////保存当前页面状态数据
            var _this = this, pageData = _this.global.pageData;
            if(!pageData.technicianList) pageData.technicianList = {};
            pageData = pageData.technicianList;
            var status;
            for(var k=0;k<_this.storeDataList.length;k++){
                status = _this.storeDataList[k];
                pageData[status] = _this[status];
            }
            pageData["scrollTop"] = _this.$refs.listEle.scrollTop;
        }
    }
</script>