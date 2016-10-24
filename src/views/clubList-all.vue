<template>
    <div class="page club-list-page" id="club-list-all-page" v-show="!global.loading" @click="doClickPage()">
        <div class="page-title"><a class="back" @click="doClickPageBack()"></a>会所列表</div>
        <div class="filter-title">
            <div :class="{ active : activeFilterType=='distance' }" @click="doActiveFilterType('distance',$event)">
                <span>附近会所</span>
                <div></div>
                <ul><li v-for="item in distanceList" :class="{ selected : selectedDistance==item.value }" @click="doSelectedItem('Distance',item.value,$event)">{{ item.label }}</li></ul>
            </div>
            <div :class="{ active : activeFilterType=='sort' }" @click="doActiveFilterType('sort',$event)">
                <span>默认排序</span>
                <div></div>
                <ul><li v-for="item in sortFields" :class="{ selected : selectedSortField==item.value }" @click="doSelectedItem('SortField',item.value,$event)">{{ item.label }}</li></ul>
            </div>
            <div :class="{ active : activeFilterType=='filter' }" @click="doActiveFilterType('filter',$event)">
                <span>筛选</span>
                <div></div>
                <ul><li v-for="item in filters" :class="{ selected : selectedFilter==item.value }" @click="doSelectedItem('Filter',item.value,$event)">{{ item.label }}</li></ul>
            </div>
        </div>
        <div class="list" ref="listEle" :style="{ height : (global.winHeight-7.507*global.winScale*16)+'px' }" @scroll="doHandlerListScroll()">
            <club v-for="item in dataList" :club-obj="item"></club>
            <div class="data-load-tip" :class="{ none : !dataLoading }"><i></i><div>加载数据</div></div>
            <div class="finish-load-tip" :class="{ none : !showFinish }"><div>已经加载全部数据</div></div>
            <div class="nullData" v-show="dataList.length==0 && !dataLoading"><div></div><div>暂无内容...</div></div>
        </div>
    </div>
</template>
<script>
    import { Global } from '../libs/global';
    import Util from "../libs/util";
    import Club from "../components/club";

    module.exports = {
        components : {
            'club' : Club
        },
        data: function(){
            return {
                global : Global.data,
                dataLoading : false,
                showFinish : false,
                isDataAddEnd : false,//数据是否已加载完
                isAddData : false,//数据是否正在加载
                currPage : 0,
                pageSize : 10,
                dataList : [],
                activeFilterType : "",
                selectedDistance : 30,
                selectedSortField : "",
                selectedFilter : "",
                distanceList : [{ label : "附近会所", value : 30 }, { label : "1000米", value : 1 }, { label : "2000米", value : 2 }, { label : "3000米", value : 3 },{ label : "5000米", value : 5 }, { label : "10千米", value : 10 }, { label : "全部会所", value : 0 }],
                sortFields : [{ label : "默认排序", value : ""}, { label : "距离最近", value : "distance"},{ label : "人气最高", value : "uv"}],
                filters : [{ label : "全部会所", value : ""}, { label : "优惠会所", value : "coupon"},{ label : "可选技师", value : "tech"}],
            }
        },
        created : function(){
            this.queryData();
        },
        methods: {
            doActiveFilterType : function(type,event){
                this.activeFilterType = type;
                event.stopPropagation();
            },
            doClickPageBack : function(){
                this.$router.go(-1);
            },
            doSelectedItem : function(type,val){
                var _this = this;
                _this.activeFilterType = "";
                _this["selected"+type] = val;
                event.stopPropagation();
                _this.queryData();
            },
            doClickPage : function(){
                this.activeFilterType = "";
            },
            doHandlerListScroll : function(){///滚动加载
                var _this = this, listEle = _this.$refs.listEle;
                if(!_this.isDataAddEnd && listEle.scrollTop+listEle.clientHeight*1.4>listEle.scrollHeight ){
                    _this.queryData();
                }
            },
            queryData : function(page){
                var _this = this, global = _this.global;
                if(_this.isAddData){
                    return;
                }
                _this.isAddData = true;
                page = page || _this.currPage+1;

                //更新数据加载提示
                _this.dataLoading = true;
                _this.showFinish = false;
                _this.isDataAddEnd = false;

                _this.$http.get("../api/v2/club/all/clubs", { params: {
                    page: page,
                    pageSize: _this.pageSize,
                    clubName : "",
                    openId : global.openId,
                    distance : _this.selectedDistance,
                    sort : _this.selectedSortField,
                    search : _this.selectedFilter,
                    lngx : global.currLngx || "",
                    laty : global.currLaty || "",
                    loginName : global.loginName
                }}).then(function (res) {
                    res = res.body;
                    if (res) {
                        res = (res.statusCode != '200') ? [] : res['respData'];
                        if(page==1){
                            _this.dataList = res;
                            if(res.length == 0){
                                _this.isDataAddEnd = true;
                            }
                        }
                        else{
                            for(var i=0;i<res.length;i++){
                                _this.dataList.push(res[i]);
                            }
                            if(res.length < _this.pageSize){
                                _this.isDataAddEnd = true;
                                _this.showFinish = true;
                            }
                        }
                        _this.currPage = page;
                        _this.isAddData = false;
                        _this.dataLoading = false;
                    }
                    else {
                        Util.tipShow(global.loadError);
                    }
                }, function () {
                    Util.tipShow(global.loadError);
                });
            }
        }
    }
</script>