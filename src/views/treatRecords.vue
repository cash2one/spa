<style>
    @import '../styles/page/treatRecords.css';
</style>
<template>
    <div class="page" id="treat-records-page" v-show="!global.loading">
            <div class="page-title"><a class="back" @click="doClickPageBack()"></a>请客记录</div>
            <div class="list" ref="listEle" :style="{ height : (global.winHeight-2.611*global.winScale*16)+'px' }" @scroll="doHandlerListScroll()">
                <router-link class="list-item" v-for="item in dataList" :to="{ name : 'treatDetail' , query : { detailId : item.id }}" tag="div">
                    <div>
                        <div>{{ item.createDateStr }}</div>
                        <div :class="statusObj[item.status].value">{{ statusObj[item.status].name }}</div>
                    </div>
                    <div>
                        <div>授权金额<span>{{ item.amount }}</span></div>
                        <div>授权手机<span>{{ item.telStr }}</span></div>
                    </div>
                </router-link>
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
        created : function(){
            var   _this = this,
                    global = _this.global,
                    pageParams = global.currPageQuery,
                    pageData = global.pageData["treatRecords"];
            _this.clubId = pageParams.clubId || global.clubId;
            if(pageData && _this.clubId == pageData.clubId){
                for(var key in pageData) {//从数据缓存中加载数据
                    _this[key] = pageData[key];
                }
            }
            else {
                _this.$router.back();
            }
        },
        mounted : function(){
            var _this = this, global = _this.global, k, pageData = global.pageData["treatRecords"];
            if(pageData){
                setTimeout(function(){
                    _this.$refs.listEle.scrollTop = pageData["scrollTop"];
                },100);

                var changeObj = pageData.changeStatusRecord;
                if(changeObj){
                    var dataList = _this.dataList;
                    for(k=0;k<dataList.length;k++){
                        if(dataList[k]['id'] == changeObj.id ){
                            if(changeObj.status == 'CANCLED'){
                                dataList[k]['status'] = 'CANCLED';
                                Vue.set(dataList,k,dataList[k]);
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
                        Util.tipShow(global.loadError);
                    }
                }, function () {
                    Util.tipShow(global.loadError);
                });
            },
            doHandlerListScroll : function(){
                var _this = this,listEle = _this.$refs.listEle;
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
            pageData["scrollTop"] = _this.$refs.listEle.scrollTop;
        }
    }
</script>