<style>
    @import '../styles/page/collect.css';
</style>
<template>
    <div>
        <div class="loading" v-show="loading"><i></i><i></i><i></i></div>
        <div class="page" id="collect-page" v-show="!loading" :style="{ height : global.winHeight+'px' }">
            <div class="page-title"><a class="back" @click="doClickPageBack()"></a>我的收藏</div>
            <div class="list" ref="listEle" :style="{ height : (global.winHeight-2.611*global.winScale*16)+'px' }" @scroll="doHandlerListScroll()">
                <div class="list-item" v-for="singleClubData in dataList">
                    <div class='header' v-if="isQueryAll">{{ singleClubData.clubName }}</div>
                    <router-link class="item" v-for="item in singleClubData.list" :to="{ name : 'technicianDetail', query : { id : item.techId } }" tag="div">
                        <div>
                            <div :style="{ backgroundImage : 'url('+(item.avatarUrl || global.defaultHeader)+')' }"></div>
                            <div :class="item.status">{{ item.status == 'free' ? '闲' : '忙' }}</div>
                        </div>
                        <div>
                            <div>
                                <div><div>{{ item.techName || global.defaultTechName }}</div><span v-if="item.serialNo">[</span><div v-if="item.serialNo">{{ item.serialNo}}</div><span v-if="item.serialNo">]</span></div>
                                <div>
                                    <div class="stars"><div :style="{ width: item.star+'%' }"></div></div>
                                    <div>{{ item.commentCount || 0 }}评论</div>
                                </div>
                            </div>
                            <div>{{ item['tags'][0]['tagName'] }}</div>
                            <div>
                                <div>{{ item.description || '' }}</div>
                                <div>预约</div>
                            </div>
                        </div>
                    </router-link>
                </div>
                <div class="data-load-tip" :class="{ none : !showDataLoadTip }"><i></i><div>加载数据</div></div>
                <div class="finish-load-tip" :class="{ none : !showFinishLoadTip }"><div>已经加载全部数据</div></div>
                <div class="nullData" v-show="dataList.length==0 && !isAddData"><div></div><div>暂无内容...</div></div>
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
                loading : false,
                global : Global.data,
                getRecordsUrl : "../api/v2/profile/user/favorite",
                dataList : [],
                dataIndex : {},
                currPage : 0,
                pageSize : 10,
                isQueryAll : true,//查询所有的

                showDataLoadTip : false, //显示数据正在加载
                showFinishLoadTip : false,//显示已经加载完成
                isDataAddEnd : false,//数据是否已加载完
                isAddData : false//数据是否正在加载
            }
        },
        mounted: function(){
            var _this = this;
            _this.isQueryAll = _this.global.pageMode != "club" || _this.global.currPageQuery.all=="true";
            _this.queryRecord();
        },
        methods: {
            doClickPageBack : function(){
                history.back();
            },
            queryRecord : function(page){
                var _this = this, global = _this.global;
                if(_this.isAddData){
                    return;
                }
                _this.isAddData = true;
                page = page || _this.currPage+1;

                //更新数据加载提示
                _this.showDataLoadTip = true;
                _this.showFinishLoadTip = false;
                _this.isDataAddEnd = false;

                _this.$http.get(_this.getRecordsUrl, { params: {
                    page: page,
                    pageSize: _this.pageSize,
                    clubId : (_this.isQueryAll ? "" : global.clubId)
                }}).then(function (res) {
                    res = res.body;
                    if (res) {
                        res = (res.statusCode != '200') ? [] : res['respData'];
                        _this.doHandlerData(res);

                      if(res.length < _this.pageSize){
                            _this.isDataAddEnd = true;
                          if(res.length != 0){
                              _this.showFinishLoadTip = true;
                          }
                        }
                        _this.currPage = page;
                        _this.isAddData = false;
                        _this.showDataLoadTip = false;
                    }
                    else {
                        Util.tipShow(global.loadDataErrorTip);
                    }
                }, function () {
                    Util.tipShow(global.loadDataErrorTip);
                });
            },
            doHandlerListScroll : function(){
                var _this = this,listEle = _this.$refs.listEle;
                if(!_this.isDataAddEnd && listEle.scrollTop+listEle.clientHeight*1.4>listEle.scrollHeight ){
                    _this.queryRecord();
                }
            },
            doHandlerData : function(data){
                var _this = this, item, dataIndex;
                for(var k=0;k<data.length;k++){
                    item = data[k];
                    if(!item['tags'] || item['tags'].length==0){
                        item['tags']=[ { tagName : '(无)' } ];
                    }
                    dataIndex = _this.dataIndex[item["clubId"]];
                    if(dataIndex == undefined){
                        dataIndex = _this.dataList.length;
                        _this.dataIndex[item["clubId"]] = dataIndex;
                        _this.dataList.push({ clubName : item.clubName , list : [] });
                    }
                    _this.dataList[dataIndex].list.push(item);
                }
            }
        }
    }
</script>