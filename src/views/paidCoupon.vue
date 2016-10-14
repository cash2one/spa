<style>
    @import '../styles/page/paidCoupon.css';
</style>
<template>
    <div>
        <div class="page paid-coupon-page" id="paid-coupon-page" v-show="!global.loading" :style="{ height : (global.winHeight-6.966*global.winScale*16)+'px' }">
            <div class="page-title"><a class="back" @click="doClickPageBack()"></a>点钟券</div>
            <div class="club-info" @click="doClickClubInfo()"><div :style="{ backgroundImage : 'url('+(couponData.imageUrl || global.defaultClubLogo )+')' }"></div><span>{{ couponData.clubName }}</span></div>
            <div class="coupon-info">
                <div>
                    <router-link :style="{ backgroundImage : 'url('+(couponData.techs.avatarUrl || global.defaultHeader )+')' }" :to="{ name : 'chat', query : { techId : couponData.techs.id, clubId : couponData.clubId }}"></router-link>
                    <div>{{ couponData.techs.name }}<span v-show="couponData.techs.serialNo">[<span>{{ couponData.techs.serialNo }}</span>]</span></div>
                </div>
                <div>
                    <div>
                        <div>{{ couponData.actTitle }}</div>
                        <div>{{ couponData.actValue }}元抵{{ couponData.consumeMoney }}元</div>
                    </div>
                    <div>点钟券</div>
                </div>
                <div>券有效期：<span>{{ couponData.couponPeriod }}</span></div>
            </div>
            <div class="coupon-desc">
                <div><i></i>使用说明：</div>
                <div v-html="couponData.actContent"></div>
            </div>
        </div>
        <div class="paid-coupon-bottom-wrap">
            <div>
                <span @click="doClickChangeCount(0)">-</span><span>{{ payCount }}</span><span @click="doClickChangeCount(1)">+</span>
                <div>共支付：￥<span>{{ payCount*couponData.actValue*100 | MoneyFormatter }}</span>元</div>
            </div>
            <div :class="{ processing : inPaid , downline : isDownLine }" @click="doClickPayBtn()">{{ isDownLine ? "已下线" : ( inPaid ? "购买中..." : "立即购买")}}</div>
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
                getDataUrl : "../api/v2/club/redpacket/data",
                getOpenIdUrl : "../api/v2/wx/oauth2/user/openid",
                paidUrl : "../api/v2/wx/pay/paid_coupon",
                actId : "",
                techCode : "",
                inPaid : false,
                chanel : "",
                paramData : Util.localStorage("paid-coupon-param"),
                payAuthCode : "",
                couponData : null,
                payCount : 1,
                isDownLine : false,
                payRequestObj : null
            }
        },
        created : function(){
            var   _this = this, global = _this.global, query = global.currPage.query;
            _this.actId = query.actId;
            _this.techCode = query.techCode;
            _this.payAuthCode = query.code || global.authCode;
            _this.chanel = query.channel || "link";
            if(!_this.actId || !_this.techCode){
                Util.tipShow(global.visitError);
                _this.$router.back();
            }
            else{
                _this.$http.get(_this.getDataUrl,{ params : {
                    actId : _this.actId,
                    userCode : "",
                    techCode : _this.techCode,
                    chanel : _this.chanel,
                    phoneNum : ""
                }}).then(function(res){
                    res = res.body;
                    if(res.statusCode == 200){
                        res = res.respData;
                        if(res.status == "downline_can_use"){
                            _this.isDownLine = true;
                        }
                        _this.couponData = res;
                    }
                    else{
                        Util.tipShow(res.msg || "获取点钟券数据失败！");
                        _this.$router.back();
                    }
                },function(){
                    Util.tipShow("获取点钟券数据失败！");
                    _this.$router.back();
                });
            }
        },
        mounted : function(){
            var _this = this;
            if(_this.paramData && _this.payAuthCode){
                _this.$http.post(_this.getOpenIdUrl,{
                    code : _this.payAuthCode,
                    scope : 'snsapi_base',
                    wxmp : '9358',
                    userType : 'user',
                    state : 'confirm-order'
                }).then(function(res){
                    res = res.body;
                    if(res.statusCode == 200){
                        _this.doClickPayBtn();
                        Util.removeLocalStorage("paid-coupon-param");
                    }
                    else if(res.statusCode == 935801){
                        Global.getOauthCode('','9358','paid-coupon','base');
                    }
                    else{
                        Util.tipShow(res.msg || "获取openId失败！");
                    }
                });
            }
        },
        methods: {
            doClickPageBack : function(){
                history.back();
            },
            doClickClubInfo : function(){//点击会所
                var _this = this, global = _this.global, couponData = _this.couponData;
                if(global.pageMode != "club"){
                    _this.$router.push({ name : "home" });
                }
                else{
                    Util.pageReload(couponData.clubId,"home");
                }
            },
            doClickChangeCount : function(isAdd){
                var _this = this;
                if(isAdd){
                    if(_this.payCount < 999){
                        _this.payCount++;
                    }
                }
                else{
                    if(_this.payCount > 1){
                        _this.payCount--;
                    }
                }
            },
            doClickPayBtn : function(){//点击购买按钮
                var _this = this, global = _this.global;
                if(!_this.isDownLine){
                    if(!global.userAgent.isWX){
                        if(global.checkAccess("paidCoupon")){
                            Util.tipShow("请您打开微信登录'9358'公众号！");
                        }
                        return;
                    }
                    if(!global.isLogin || !global.userTel){
                        global.saveLoginPageParams("paidCoupon");
                        if(!global.isLogin){
                            Util.tipShow("请您先登录！");
                            _this.$router.push({ name : "login" });
                        }
                        else{
                            global.bindTelPhone();
                        }
                    }
                    else if(!_this.inPaid){/////支付
                        _this.inPaid = true;
                        _this.$http.post(_this.paidUrl,{
                            actId : _this.actId,
                            businessType : "paid_coupon",
                            businessChannel :  _this.chanel,
                            clubId : _this.couponData.clubId,
                            money : _this.couponData.actValue * parseInt(_this.payCount),
                            count : parseInt(_this.payCount),
                            openId : global.openId,
                            techId : _this.couponData.techs.id,
                            tradeChannel : "wx"
                        }).then(function(res){
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
                            else if(res.statusCode == 935801){
                                Util.localStorage('paid-coupon-param',true);
                                Global.getOauthCode('','9358','paid-coupon','base');
                            }
                            else{
                                _this.inPaid = false;
                                Util.tipShow(res.msg || "购买点钟券请求失败！");
                            }
                        },function(){
                            _this.inPaid = false;
                            Util.tipShow("购买点钟券请求异常！");
                        });
                    }
                }
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
                    _this.inPaid = false;
                    if (res.err_msg.indexOf("ok") >= 0) {//支付成功之后
                        Util.tipShow("支付成功！");
                        ////////////////////////////////发送环信消息

                    }
                    else {
                        Util.tipShow("未能成功支付！");
                    }
                });
            }
        },
        filters : {
            MoneyFormatter : MoneyFormatter
        }
    }
</script>