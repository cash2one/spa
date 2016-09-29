<style>
    @import '../styles/page/integral.css';
</style>
<template>
    <div class="loading" v-show="$loadingRouteData"><i></i><i></i><i></i></div>
    <div class="page" id="integral-all-page" v-show="!$loadingRouteData" :style="{ height : global.winHeight+'px' }">
        <div class="page-title"><a class="back" @click="doClickPageBack()"></a>所有账户</div>
        <div class="list" v-el:list-ele :style="{ height : (global.winHeight-2.611*global.winScale*16)+'px' }" @scroll="doHandlerListScroll()">
            <div class="list-item" v-for="item in dataList" v-link="{ name : 'integralDetail', query : { clubId : item.clubId } }">
                <div><div :style="{ backgroundImage : 'url('+(item.clubImage || global.defaultClubLogo)+')' }"></div>{{ item.clubName || '小摩豆会所' }}<i></i></div>
                <div><span>剩余积分</span>{{ item.amount }}</div>
            </div>
            <div class="data-load-tip" :class="{ none : !showDataLoadTip }"><i></i><div>加载数据</div></div>
            <div class="finish-load-tip" :class="{ none : !showFinishLoadTip }"><div>已经加载全部数据</div></div>
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
                getRecordsUrl : "../api/v2/credit/user/account",
                dataList : [],
                currPage : 0,
                pageSize : 10,
                showDataLoadTip : false, //显示数据正在加载
                showFinishLoadTip : false,//显示已经加载完成
                isDataAddEnd : false,//数据是否已加载完
                isAddData : false//数据是否正在加载
            }
        },
        ready: function(){
            this.queryRecord();
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
                    clubId : "",
                    userType : "user"
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
                var _this = this, listEle = _this.$els.listEle;
                if(!_this.isDataAddEnd && listEle.scrollTop+listEle.clientHeight*1.4>listEle.scrollHeight ){
                    _this.queryRecord();
                }
            }
        }
    }
</script>