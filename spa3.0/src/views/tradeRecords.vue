<style>
    @import '../styles/page/tradeRecords.css';
</style>
<template>
    <div class="page" id="trade-records-page" v-show="!global.loading">
            <div class="page-title"><a class="back" @click="doClickPageBack()"></a>交易记录</div>
            <div class="list" ref="listEle" :style="{ height : (global.winHeight-2.611*global.winScale*16)+'px' }" @scroll="doHandlerListScroll()">
                <div class="list-item" v-for="item in dataList">
                    <div>{{ tradeType[item.bizType] }}<span :class="{ recharge : item.income }">{{ item.income ? '+' : '-' }}{{item.amount}}元</span></div>
                    <div>{{ item.createDatetime }}</div>
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
                getRecordsUrl : "../api/v2/finacial/account/trades/",
                dataList : [],
                currPage : 0,
                pageSize : 10,
                accountId : "",
                tradeType : {
                    consume : '账号消费',
                    line_recharge : '线下充值',
                    pay_for_other : '请客',
                    user_recharge : '用户充值'
                },
                showDataLoadTip : false, //显示数据正在加载
                showFinishLoadTip : false,//显示已经加载完成
                isDataAddEnd : false,//数据是否已加载完
                isAddData : false//数据是否正在加载
            }
        },
        created : function(){
            var   _this = this, global = _this.global, pageParams = global.currPage.query;
            _this.accountId = pageParams.accountId;
            if(!_this.accountId){
                _this.$router.back();
            }
            else{
                _this.getRecordsUrl += _this.accountId;
            }
        },
        mounted : function(){
            this.queryRecord();
        },
        methods: {
            doClickPageBack : function(){
                history.back();
            },
            queryRecord : function(page){
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

                _this.$http.get(_this.getRecordsUrl, { params: {
                    page: page,
                    pageSize: _this.pageSize
                }}).then(function (res) {
                    res = res.body;
                    if (res) {
                        res = (res.statusCode != '200') ? [] : res['respData'];

                        for(var i=0;i<res.length;i++){
                            res[i].income = res[i].tradeType=='income';
                            res[i].amount = (res[i].amount/100).toFixed(2);
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
                        Util.tipShow(_this.global.loadError);
                    }
                }, function () {
                    Util.tipShow(_this.global.loadError);
                });
            },
            doHandlerListScroll : function(){
                var _this = this, listEle = _this.$refs.listEle;
                if(!_this.isDataAddEnd && listEle.scrollTop+listEle.clientHeight*1.4>listEle.scrollHeight ){
                    _this.queryRecord();
                }
            }
        }
    }
</script>