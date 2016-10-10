<style>
    @import '../styles/page/accountDetail.css';
</style>
<template>
    <div class="loading" v-show="$loadingRouteData"><i></i><i></i><i></i></div>
    <div class="page" id="account-detail-page" v-show="!$loadingRouteData">
        <div class="page-title"><a class="back" @click="doClickPageBack()"></a>我的账户</div>
        <div class="info-item item">
            <div>
                <div class="available-icon"></div>
                <div>可用金额</div>
                <div>{{availableMoney}}</div>
            </div>
            <div>
                <div class="frozen-icon"></div>
                <div>冻结金额</div>
                <div>{{frozenMoney}}</div>
            </div>
            <a @click="doChargeClick()">充值</a>
        </div>
        <router-link class="qrcode-item item" :to="{ name : 'qrPayCode' , query : { accountId : accountId }}" tag="div">
            <span>付款二维码</span>
            <div></div>
        </router-link>
        <router-link class="record-item item" :to="{ name : 'tradeRecords' , query : { accountId : accountId }}" tag="div">
            <span>交易记录</span>
            <div class="right-arrow"></div>
        </router-link>
        <router-link class="invite-item item" :to="{ name : 'treat' , query : { accountId : accountId }}" tag="div">
            <span>我要请客</span>
            <div class="right-arrow"></div>
        </router-link>
    </div>
</template>
<script>
    import { Global } from '../libs/global';
    import Util from "../libs/util";

    module.exports = {
        data: function(){
            return {
                global : Global.data,
                accountId : '',
                clubId : '',
                queryDataUrl : "../api/v2/finacial/",
                availableMoney : "-",
                frozenMoney : "-"
            }
        },
        route : {
            data : function(transition){
                var   _this = this, global = _this.global, pageParams = global.currPageQuery;
                _this.accountId = pageParams.accountId || "";
                if(!_this.accountId && !global.clubId){
                    transition.abort();
                }
                else if(_this.accountId){
                    _this.queryDataUrl += "account/"+_this.accountId;
                }
                else{
                    _this.queryDataUrl += "club/account";
                }
                return new Promise(function(resolve,reject){
                    _this.$http.get(_this.queryDataUrl,{ params : { clubId : global.clubId }}).then(function(res){
                        res = res.body;
                        if(res.statusCode == 200){
                            res = res.respData;
                            resolve({ accountId : res.id, availableMoney : (res.amount/100).toFixed(2), frozenMoney : (res.freezeAmount/100).toFixed(2), clubId : res.clubId });
                        }
                        else{
                            Util.tipShow(global.loadDataErrorTip);
                            reject(false);
                            transition.abort();
                        }
                    });
                });
            }
        },
        methods: {
            doClickPageBack : function(){
                history.back();
            },
            doChargeClick : function(){
                var _this = this, global = _this.global;
                if(global.userAgent.isWX){
                    _this.$router.push({ name : "recharge", query : { accountId : _this.accountId, clubId : _this.clubId } });
                }
                else{
                    Util.tipShow("使用微信打开才能充值！");
                }
            }
        }
    }
</script>