<style>
    @import '../styles/page/recharge.css';
</style>
<template>
    <div class="loading" v-show="$loadingRouteData"><i></i><i></i><i></i></div>
    <div class="page" id="recharge-page" v-show="!$loadingRouteData" :style="{ height : global.winHeight+'px' }">
        <div class="page-title"><a class="back" @click="doClickPageBack()"></a>充值</div>
        <div class="recharge-area">
            <div>充值金额</div>
            <div>
                <span>￥</span>
                <div><input type="number" pattern="[0-9]*" v-model="money" @input="doInputOfMoney()"/></div>
            </div>
            <div>注：充值金额可用于会所消费。</div>
        </div>
        <div class="submit-button" :class="submitStatusCls" @click="doClickSubmitBtn()">{{ submitText }}</div>
    </div>
</template>
<script>
    import { Global } from '../libs/global';
    import Util from "../libs/util";

    module.exports = {
        data: function(){
            return {
                global : Global.data,
                getOpenIdUrl : "../api/v2/wx/oauth2/openid",
                reChargeUrl : "../api/v2/wx/pay/recharge/save",
                submitStatusCls : "disabled",
                submitText : "确认支付",
                accountId : "",
                oldMoney : "",
                money : "",
                payAuthCode : "",
                clubId : "",
                paramData : null,
                payRequestObj : null
            }
        },
        route : {
            data : function(transition){
                var   _this = this, global = _this.global, params = global.currPageParams;
                if(!global.userAgent.isWX){
                    Util.tipShow("请在微信中打开！");
                    transition.abort();
                }
                else if(global.checkAccess("recharge")){
                    _this.accountId = params.accountId;
                    _this.payAuthCode = params.code || global.authCode;
                    _this.clubId = params.clubId || global.clubId;
                    var rechargeParam = Util.localStorage("con-recharge-param");
                    if(rechargeParam){
                        _this.paramData = JSON.parse(rechargeParam);
                    }
                    if(_this.paramData && _this.payAuthCode){
                        _this.$http.post(_this.getOpenIdUrl,{
                            code : _this.payAuthCode,
                            scope : 'snsapi_base',
                            wxmp : '9358',
                            userType : 'user',
                            state : 'confirm-recharge'
                        }).then(function(res){
                            res = res.body;
                            if(res.statusCode == 200){
                                transition.next();
                            }
                            else if(res.statusCode == "935801"){
                                Global.getOauthCode('','9358','confirm-recharge','base');
                            }
                            else{
                                Util.tipShow(res.msg || "未能获取openId！");
                                transition.abort();
                            }
                        });
                    }
                    else{
                        transition.next();
                    }
                }
                else{
                    Util.tipShow("当前会所未开放此功能！");
                    transition.abort();
                }
            }
        },
        ready : function(){
            var _this = this;
            if(_this.paramData){
                Util.removeLocalStorage("con-recharge-param");
                _this.money = _this.paramData.amount;
                _this.submitStatusCls = "";
                _this.doClickSubmitBtn();
            }
        },
        methods: {
            doClickPageBack : function(){
                history.back();
            },
            doInputOfMoney : function(){
                var _this = this;
                if(_this.money == ""){
                    if(_this.oldMoney.length>1){
                        _this.money = _this.oldMoney;
                        _this.submitStatusCls = "";
                    }
                    else{
                        _this.oldMoney = "";
                        _this.submitStatusCls = "disabled";
                    }
                }
                else{
                    var tmp = _this.money.match(/\./g);
                    if(tmp && _this.money.match(/\./g).length>1){
                        _this.money = _this.money.slice(0,-1);
                    }
                    if(!/^([1-9][0-9]*)$/g.test(_this.money)){
                        _this.money = _this.oldMoney;
                        if(_this.oldMoney != ''){
                            _this.submitStatusCls = "";
                        }
                    }
                    else{
                        if(_this.money != 0){
                            _this.oldMoney = _this.money;
                            _this.submitStatusCls = "";
                        }
                        else{
                            _this.submitStatusCls = "disabled";
                        }
                    }
                }
            },
            doClickSubmitBtn : function(){
                var _this = this;
                if(_this.submitStatusCls == "disabled"){
                    return;
                }
                if(_this.submitStatusCls == "processing"){
                    Util.tipShow("正在处理中，请稍候...");
                    return;
                }
                _this.submitStatusCls = "processing";
                _this.submitText = "支付...";
                var paramData = {
                    businessChannel : 'link',
                    accountId : _this.accountId,
                    amount : _this.money,
                    clubId : _this.clubId || '',
                    tradeChannel : 'wx'
                };
                _this.$http.post(_this.reChargeUrl,paramData).then(function(res){
                    res = res.body;
                    if(res.statusCode == 200){
                        _this.payRequestObj =  JSON.parse(res.respData);
                        if (typeof WeixinJSBridge == "undefined"){
                            document.addEventListener('WeixinJSBridgeReady', function(){ _this.onBridgeReady() }, false);
                        }
                        else{
                            _this.onBridgeReady();
                        }
                    }
                    else if(res.statusCode == '935801'){
                        Util.localStorage('con-recharge-param',JSON.stringify(paramData));
                        Global.getOauthCode('','9358','confirm-recharge','base');
                    }
                    else{
                        _this.submitStatusCls = "";
                        _this.submitText = '确认支付';
                        Util.tipShow(res.msg || "充值失败！");
                    }
                },function(){
                    _this.submitStatusCls = "";
                    _this.submitText = '确认支付';
                    Util.tipShow("充值失败！");
                });
            },
            onBridgeReady : function(){
                var _this = this, payRequestObj = _this.payRequestObj;
                WeixinJSBridge.invoke('getBrandWCPayRequest', {
                    "appId": payRequestObj.appId,     //公众号名称，由商户传入
                    "timeStamp": payRequestObj.timeStamp + "",  //时间
                    "nonceStr": payRequestObj.nonceStr, //随机串
                    "package": payRequestObj.package,
                    "signType": payRequestObj.signType,   //微信签名方式
                    "paySign": payRequestObj.paySign
                }, function (res) {
                    _this.submitStatusCls = "";
                    _this.submitText = '确认支付';
                    if (res.err_msg.indexOf("ok") >= 0) {//支付成功之后
                        Util.tipShow("支付成功！");
                        _this.$router.go({ name : "accountDetail", query : { accountId : _this.accountId }});
                    }
                    else {
                        Util.tipShow("未能成功支付！");
                    }
                });
            }
        }
    }
</script>