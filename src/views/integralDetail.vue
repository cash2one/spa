<style>
    @import '../styles/page/integralDetail.css';
</style>
<template>
    <div class="loading" v-show="$loadingRouteData"><i></i><i></i><i></i></div>
    <div class="page" id="integral-detail-page" v-show="!$loadingRouteData" :style="{ height : global.winHeight+'px' }">
        <div class="page-title"><a class="back" @click="doClickPageBack()"></a>积分中心</div>
        <div class="total">
            <div>现有积分<router-link :to="{ name : 'integralExplain' }" tag="span">积分规则</router-link><i></i></div>
            <b>{{amount}}<span>(冻结:{{freezeAmount}})</span></b>
        </div>
        <div class="tip" v-show="isNoIntegral">您没有积分了，<a>如何获取积分</a></div>
        <div class="title" v-show="!isNoIntegral">积分记录</div>
        <div class="list" ref="listEle" v-show="!isNoIntegral" :style="{ height : (global.winHeight-10.36*global.winScale*16)+'px' }" @scroll="doHandlerListScroll()">
            <div class="list-item" v-for="item in dataList">
                <div>{{ item.businessCategoryDesc }}<div :class="{ add : item.amount>0 }">{{ item.amount>0 ? "+" : "" }}{{ item.amount }}</div></div>
                <div><div :class="{ active : item.peerName }" :style="{ backgroundImage : 'url('+(item.peerAvatar || global.defaultHeader)+')' }"></div><div>{{ item.peerName || "" }}</div><span>{{ item.createDatetime }}</span></div>
            </div>
            <div class="data-load-tip" :class="{ none : !showDataLoadTip }"><i></i><div>加载数据</div></div>
            <div class="finish-load-tip" :class="{ none : !showFinishLoadTip }"><div>已经加载全部数据</div></div>
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
                getRecordsUrl : "../api/v2/credit/user/records",
                getUserAccountUrl : "../api/v2/credit/user/account",

                amount : "-",
                freezeAmount : 0,
                dataList : [],
                currPage : 0,
                pageSize : 10,
                isNoIntegral : true,
                listEle : null,
                clubId : '',

                showDataLoadTip : false, //显示数据正在加载
                showFinishLoadTip : false,//显示已经加载完成
                isDataAddEnd : false,//数据是否已加载完
                isAddData : false//数据是否正在加载
            }
        },
        route : {
            data : function(transition){
                var   _this = this, global = _this.global;
                _this.clubId = global.currPageQuery.clubId || global.clubId;

                if(global.clubCfg.accountSwitch == null || _this.clubId != global.clubId){//获取开关状态
                    Global.getClubSwitches(_this.clubId,function(cfg){
                         if(!cfg.creditSwitch){
                             Util.tipShow("积分系统未开启！");
                             transition.abort();
                         }
                        else{
                             _this.getUserAccount();
                             transition.next();
                         }
                    });
                }
                else{
                    _this.getUserAccount();
                    transition.next();
                }
            }
        },
        mounted: function(){
            this.queryRecord();
        },
        methods: {
            doClickPageBack : function(){
                history.back();
            },
            getUserAccount : function(){
                var _this = this;
                _this.$http.get(_this.getUserAccountUrl, { params : { clubId : _this.clubId, userType : "user" }}).then(function(res){
                    res = res.body;
                    if(res.statusCode == 200){
                        res = res.respData;
                        if(res && res.length !=0){
                            _this.amount = res[0].amount;
                            _this.freezeAmount = res[0].freezeAmount;
                        }
                        else{
                            Util.tipShow("获取账户积分信息失败！")
                        }
                    }
                });
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
                    clubId : _this.clubId,
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
                            else{
                                _this.isNoIntegral = false;
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
                var _this = this,listEle = _this.$refs.listEle;
                if(!_this.isDataAddEnd && listEle.scrollTop+listEle.clientHeight*1.4>listEle.scrollHeight ){
                    _this.queryRecord();
                }
            }
        }
    }
</script>