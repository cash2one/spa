<style>
    @import '../styles/page/account.css';
</style>
<template>
    <div class="loading" v-show="$loadingRouteData"><i></i><i></i><i></i></div>
    <div class="page" id="account-page" v-show="!$loadingRouteData" :style="{ height : global.winHeight+'px' }">
        <div class="page-title"><a class="back" @click="doClickPageBack()"></a>所有账户</div>
        <div class="jump-qrcode" v-show="dataList.length>0" v-link="{ name : 'qrPayCode' }">
            <div></div>
            <div>付款二维码</div>
            <div></div>
        </div>
        <div class="list" :style="{ height : (global.winHeight-(dataList.length>0 ? 5.722 : 2.611)*global.winScale*16)+'px' }">
            <div class="list-item" v-for="item in dataList" v-link="{ name : 'accountDetail', query : { accountId : item.id } }">
                <div class="header">
                    <span :style="{ backgroundImage : 'url('+(item.clubImage || global.defaultClubLogo )+')' }"></span><span>{{ item.clubName }}</span><i></i>
                </div>
                <div class="item expire">
                    <div><span>可用金额</span><span>{{ item.amount | MoneyFormatter }}</span></div>
                    <div><span>冻结金额</span><span>{{ item.freezeAmount | MoneyFormatter }}</span></div>
                </div>
            </div>
            <div class="data-load-tip" :class="{ none : !showDataLoadTip }"><i></i><div>加载数据</div></div>
            <div class="finish-load-tip" :class="{ none : !showFinishLoadTip }"><div>已经加载全部数据</div></div>
            <div class="nullData" v-show="dataList.length==0 && !showDataLoadTip"><div></div><div>暂无内容...</div></div>
        </div>
    </div>
</template>
<script>
    import { Global } from '../libs/global';
    import Util from "../libs/util";
    import MoneyFormatter from "../filters/money-formatter";

    module.exports = {
        data: function(){
            return {
                global : Global.data,
                getRecordsUrl : "../api/v2/finacial/accounts",
                dataList : [],
                showDataLoadTip : false, //显示数据正在加载
                showFinishLoadTip : false//显示已经加载完成
            }
        },
        route : {
            data : function(transition){
                var   _this = this, global = _this.global;
                return new Promise(function(resolve,reject){
                    _this.showDataLoadTip = true;
                    _this.$http.get(_this.getRecordsUrl).then(function(res){
                        _this.showDataLoadTip = false;
                        res = res.body;
                        if(res.statusCode == 200){
                            resolve({ dataList : res.respData, showFinishLoadTip : res.respData.length>0 });
                        }
                        else{
                            Util.tipShow(res.msg || global.loadDataErrorTip);
                            reject(false);
                            transition.abort();
                        }
                    },function(){
                        Util.tipShow(global.loadDataErrorTip);
                        reject(false);
                        transition.abort();
                    });
                });
            }
        },
        methods: {
            doClickPageBack : function(){
                history.back();
            }
        },
        filters: {
            MoneyFormatter : MoneyFormatter
        }
    }
</script>