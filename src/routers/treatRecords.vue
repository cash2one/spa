<style>
    @import '../styles/page/treatRecords.css';
</style>
<template>
    <div class="loading" v-show="$loadingRouteData"><i></i><i></i><i></i></div>
    <div class="page" id="treat-records-page" v-show="!$loadingRouteData">
        <div class="page-title"><a class="back" @click="doClickPageBack()"></a>请客记录</div>
        <div class="list" v-el:list-ele :style="{ height : (global.winHeight-2.611*global.winScale*16)+'px' }" @scroll="doHandlerListScroll()">
            <div class="list-item" v-for="item in dataList" v-link="{ name : 'treatDetail' , query : { detailId : item.id }}">
                <div>
                    <div>{{ item.createDateStr }}</div>
                    <div :class="statusObj[item.status].value">{{ statusObj[item.status].name }}</div>
                </div>
                <div>
                    <div>授权金额<span>{{ item.amount }}</span></div>
                    <div>授权手机<span>{{ item.telStr }}</span></div>
                </div>
            </div>
            <div class="data-load-tip" :class="{ none : !showDataLoadTip }"><i></i><div>加载数据</div></div>
            <div class="finish-load-tip" :class="{ none : !showFinishLoadTip || dataList.length==0 }"><div>已经加载全部数据</div></div>
            <div class="nullData" v-show="dataList.length==0 && !isAddData"><div></div><div>暂无内容...</div></div>
        </div>
    </div>
</template>
<script>
    import { Global } from '../libs/global';
    import Util from "../libs/util";

    module.exports = {
        data: function(){
            return {
                global : Global.data,
                getRecordsUrl : "../api/v2/finacial/account/payforother/list",
                dataList : [],
                currPage : 0,
                pageSize : 10,
                statusObj : {
                    "CANCLED" : { name : '已取消', value : 'treat-canceled' },
                    "NOT_USERD" : { name : '未使用', value : 'treat-unuse' },
                    "USED" : { name : '已使用', value : 'treat-used' }
                },
                clubId : "",
                showDataLoadTip : false, //显示数据正在加载
                showFinishLoadTip : false,//显示已经加载完成
                isDataAddEnd : false,//数据是否已加载完
                isAddData : false,//数据是否正在加载
                storeDataList : ['dataList', 'currPage', 'showFinishLoadTip', 'isDataAddEnd', 'showFinishLoadTip', 'clubId']
            }
        },
        route : {
            data : function(transition){
                var   _this = this,
                        global = _this.global,
                        pageParams = global.currPageQuery,
                        pageData = global.pageData["treatRecords"];
                _this.clubId = pageParams.clubId || global.clubId;
                if(pageData && _this.clubId == pageData.clubId){
                    return new Promise(function(resolve){ //从数据缓存中加载数据
                        var resolveDataObj = {};
                        for(var key in pageData){
                            resolveDataObj[key] = pageData[key];
                        }
                        resolve(resolveDataObj);
                    });
                }
                else {
                    transition.next();
                }
            }
        },
        ready : function(){
            var _this = this, global = _this.global, k, pageData = global.pageData["treatRecords"];
            if(pageData){
                setTimeout(function(){
                    _this.$els.listEle.scrollTop = pageData["scrollTop"];
                },100);

                var changeObj = pageData.changeStatusRecord;
                if(changeObj){
                    for(k=0;k<_this.dataList.length;k++){
                        if(_this.dataList[k]['id'] == changeObj.id ){
                            if(changeObj.status == 'CANCLED'){
                                _this.dataList[k]['status'] = 'CANCLED';
                                _this.dataList.$set(k,_this.dataList[k]);
                            }
                            break;
                        }
                    }
                }
            }
            else{
                _this.queryRecord();
            }
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
                    page : page,
                    pageSize : _this.pageSize,
                    clubId : _this.clubId
                }}).then(function (res) {
                    res = res.body;
                    if (res) {
                        res = (res.statusCode != '200') ? [] : res['respData'];
                        for(var i=0;i<res.length;i++){
                            res[i].amount = (res[i].amount/100).toFixed(2);
                            res[i].telStr = Util.spaceFormat(res[i].telephone,true);
                            res[i].createDateStr = Util.dateFormat(new Date(res[i].createDate.replace(/-/g,'/')),'yyyy-MM-dd hh:mm');
                            _this.dataList.push(res[i]);
                        }
                        if(res.length < _this.pageSize){
                            _this.isDataAddEnd = true;
                            _this.showFinishLoadTip = true;
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
                var _this = this,listEle = _this.$els.listEle;
                if(!_this.isDataAddEnd && listEle.scrollTop+listEle.clientHeight*1.4>listEle.scrollHeight ){
                    _this.queryRecord();
                }
            }
        },
        beforeDestroy : function(){
            var _this = this, pageData = _this.global.pageData;
            if(!pageData.treatRecords) pageData.treatRecords = {};
            pageData = pageData.treatRecords;
            var status;
            for(var k=0;k<_this.storeDataList.length;k++){
                status = _this.storeDataList[k];
                pageData[status] = _this[status];
            }
            pageData["scrollTop"] = _this.$els.listEle.scrollTop;
        }
    }
</script>