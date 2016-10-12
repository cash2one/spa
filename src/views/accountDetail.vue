<style>
    @import '../styles/page/accountDetail.css';
</style>
<template>
    <div class="page" id="account-detail-page" v-show="!global.loading">
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
        created : function(){
            var   _this = this, global = _this.global, pageParams = global.currPageQuery;
            _this.accountId = pageParams.accountId || "";
            if(!_this.accountId && !global.clubId){
                return _this.$router.back();
            }
            else if(_this.accountId){
                _this.queryDataUrl += "account/"+_this.accountId;
            }
            else{
                _this.queryDataUrl += "club/account";
            }
            global.loading = true;
            _this.$http.get(_this.queryDataUrl,{ params : { clubId : global.clubId }}).then(function(res){
                res = res.body;
                global.loading = false;
                if(res.statusCode == 200 && res.respData){
                    res = res.respData;
                    _this.accountId = res.id;
                    _this.availableMoney = (res.amount/100).toFixed(2);
                    _this.frozenMoney = (res.freezeAmount/100).toFixed(2);
                    _this.clubId = res.clubId;
                }
                else{
                    Util.tipShow(global.loadError);
                    return _this.$router.back();
                }
            });
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