<style>
    @import '../styles/page/qrPay.css';
</style>
<template>
    <div class="page" id="qrpay-page" v-show="!global.loading" :style="{ height : global.winHeight+'px' }">
            <div class="page-title"><a class="back" @click="doClickPageBack()"></a>支付</div>
            <div class="club-info">
                <div>
                    <div :style="{ backgroundImage : 'url('+(logoImgUrl || global.defaultClubLogo )+')' }"></div>
                    <p>{{ clubName }}</p>
                </div>
            </div>
            <div class="money-info">
                <div>消费金额</div>
                <div>
                    <span>￥</span>
                    <div>
                        <input type="number" pattern="[0-9]*" v-model="payMoney" @focus="onFocusOfInput()" @blur="onBlurOfInput()" @input="onInputOfPayMoney()"/>
                        <span v-show="showInputTip">请询问服务员后输入</span>
                        <i @click="doClickClearBtn()"></i></div>
                </div>
            </div>
            <div class="pay-btn" :class="payBtnStatusCls" @click="doClickPayBtn()">{{ payBtnText }}</div>
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
                getClubNameUrl : "../api/v2/club/",
                consumeUrl : "../api/v2/wx/pay/consume/save",
                logoImgUrl : "",
                clubName : "",
                payBtnStatusCls : "disabled",
                payBtnText : "确认支付",
                showInputTip : true,
                payMoney : "",

                openId : Util.localStorage('_qrpay_user_open_id') || "",
                clubId : "",
                payAuthCode : "",
                paramData : "",
                oldMoney : "",
                payRequestObj : null
            }
        },
        created : function(){
            var   _this = this, global = _this.global, pageParams = global.currPage.query;
            _this.clubId = pageParams.clubId;
            if(!_this.clubId && global.pageMode == "club"){
                _this.clubId = global.clubId;
            }
            if(!_this.clubId){
                Util.tipShow(global.visitError);
                _this.$router.back();
            }
            else{
                _this.getClubNameUrl += _this.clubId +"/clubName";
                _this.payAuthCode = pageParams.payAuthCode || global.authCode;
                var param = Util.localStorage("con-qrpay-param");
                if(param){
                    _this.paramData = JSON.parse(param);
                }

                if(global.userAgent.isWX){
                    if(!_this.openId || _this.openId.length < 10){
                        if(((+new Date())-(global.currPage.query["_t"] || 0) > 2400) || !_this.payAuthCode){
                            Global.getOauthCode('','9358','confirm-qrpay','base');
                        }
                        else{
                            _this.$http.get(_this.getOpenIdUrl,{ params : {
                                code : _this.payAuthCode,
                                scope : 'snsapi_base',
                                wxmp : '9358',
                                openId : '',
                                webSessionId : ''
                            }}).then(function(res){
                                res = res.body;
                                if(res.statusCode == 200){
                                    _this.openId = res.respData.openid;
                                    Util.localStorage("_qrpay_user_open_id",_this.openId);
                                }
                                else if(res.statusCode == 40029){
                                    Util.getOauthCode('','9358','confirm-qrpay','base');
                                }
                                else{
                                    Util.tipShow(res.msg || "未能获取openId！");
                                    _this.$router.back();
                                }
                            });
                        }
                    }
                }
            }
        },
        mounted : function(){
            var _this = this;
            _this.$http.get(_this.getClubNameUrl).then(function(res){
                res = res.body;
                if(res.name){
                    _this.logoImgUrl = res.logo;
                    _this.clubName = res.name;
                }
                if(_this.paramData){
                    Util.removeLocalStorage('con-recharge-param');
                    _this.payMoney = _this.paramData.amount;
                    _this.payBtnStatusCls = "";
                    _this.doClickPayBtn();
                }
            });
        },
        methods: {
            doClickPageBack : function(){
                history.back();
            },
            doClickClearBtn : function(){
                var _this = this;
                _this.payMoney = "";
                _this.oldMoney = "";
                _this.showInputTip = true;
            },
            onFocusOfInput : function(){
                this.showInputTip = false;
            },
            onBlurOfInput : function(){
                var _this = this;
                if(_this.payMoney == ""){
                    _this.showInputTip = true;
                }
            },
            onInputOfPayMoney : function(){
                var _this = this;
                if(_this.payMoney == ""){
                    if(_this.oldMoney.length > 1){
                        _this.payMoney = _this.oldMoney;
                    }
                    else{
                        _this.oldMoney = "";
                        _this.payBtnStatusCls = "disabled";
                    }
                }
                else{
                    var tmp = _this.payMoney.match(/\./g);
                    if(tmp && _this.payMoney.match(/\./g).length>1){
                        _this.payMoney = _this.payMoney.slice(0,-1);
                    }
                    if(!/^([1-9][0-9]*)$/g.test(_this.payMoney)){
                        _this.payMoney = _this.oldMoney;
                    }
                    else{
                        _this.oldMoney = _this.payMoney;
                    }
                    _this.payBtnStatusCls = "";
                }
            },
            doClickPayBtn : function(){
                var _this = this;
                if(_this.payBtnStatusCls != "disabled"){
                    if(_this.payBtnStatusCls == "processing"){
                        Util.tipShow("正在处理中，请稍候...");
                    }
                    else{
                        _this.payBtnStatusCls = "processing";
                        _this.payBtnText = "支付...";
                        var paramData = {
                            businessChannel : 'link',
                            amount : parseFloat(_this.payMoney),
                            clubId : _this.clubId || '',
                            tradeChannel : 'wx',
                            openId : _this.openId
                        };
                        _this.$http.post(_this.consumeUrl,paramData).then(function(res){
                            res = res.body;
                            if(res.statusCode == 200){
                                paramData.payToken =  res.respData.token;
                                _this.payRequestObj =  JSON.parse(res.respData.payInfo);
                                if (typeof WeixinJSBridge == "undefined"){
                                    document.addEventListener('WeixinJSBridgeReady', function(){ _this.onBridgeReady(paramData) }, false);
                                }
                                else{
                                    _this.onBridgeReady(paramData);
                                }
                            }
                            else if(res.statusCode == '935801'){
                                Util.localStorage('con-qrpay-param',JSON.stringify(paramData));
                                Global.getOauthCode('','9358','confirm-qrpay','base');
                            }
                            else{
                                _this.payBtnStatusCls = "";
                                _this.payBtnText = '确认支付';
                                Util.tipShow(res.msg || "支付失败！");
                            }
                        },function(){
                            _this.payBtnStatusCls = "";
                            _this.payBtnText = '确认支付';
                            Util.tipShow("支付失败！");
                        });
                    }
                }
            },
            onBridgeReady : function(paramData){
                var _this = this, payRequestObj = _this.payRequestObj;
                WeixinJSBridge.invoke('getBrandWCPayRequest', {
                    "appId": payRequestObj.appId,     //公众号名称，由商户传入
                    "timeStamp": payRequestObj.timeStamp + "",  //时间
                    "nonceStr": payRequestObj.nonceStr, //随机串
                    "package": payRequestObj.package,
                    "signType": payRequestObj.signType,   //微信签名方式
                    "paySign": payRequestObj.paySign
                }, function (res) {
                    _this.payBtnStatusCls = "";
                    _this.payBtnText = '确认支付';
                    if (res.err_msg.indexOf("ok") >= 0) {//支付成功之后
                        Util.tipShow("支付成功！");
                        _this.$router.push({ name : "qrPayComplete", query : { clubId : paramData.clubId, money : paramData.amount, payToken : paramData.payToken }});
                    }
                    else {
                        Util.tipShow("未能成功支付！");
                    }
                });
            }
        }
    }
</script>