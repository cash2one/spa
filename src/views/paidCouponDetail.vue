<style>
    @import '../styles/page/paidCoupon.css';
</style>
<template>
    <div>
        <div class="page paid-coupon-page" id="paid-coupon-detail-page" v-show="!global.loading" :style="{ height : (global.winHeight-(hidePayBtn ? 0 : 3.278)*global.winScale*16)+'px' }">
            <div class="page-title"><a class="back" @click="doClickPageBack()"></a>点钟券详情</div>
            <div class="club-info" @click="doClickClubInfo()" v-show="global.pageMode != 'club'"><div :style="{ backgroundImage : 'url('+(couponData.imageUrl || global.defaultClubLogo )+')' }"></div><span>{{ couponData.clubName }}</span></div>
            <div class="detail-info">
                <div><router-link :style="{ backgroundImage : 'url('+(couponData.techs.avatarUrl || global.defaultHeader )+')' }" :to="{ name : 'chat', query : { techId : couponData.techs.id, clubId : couponData.clubId }}" tag="div"></router-link></div>
                <div>
                    <div>
                        <div>
                            <div>{{ couponData.techs.name }}</div><div v-show="couponData.techs.serialNo">[<span>{{ couponData.techs.serialNo }}</span>]</div>
                        </div>
                        <div>
                            <div class="stars"><div :style="{ width : couponData.techs.star+'%' }"></div></div>
                            <div>{{ couponData.techs.commentCount }}评论</div>
                        </div>
                    </div>
                    <div></div>
                    <div>
                        <div>{{ couponData.techs.description || "这个技师很懒，没有填写个人简介..." }}</div>
                        <router-link :to="{ name : 'confirmOrder', query : { techId : couponData.techs.id , clubId : couponData.clubId }}" tag="div">预约</router-link>
                    </div>
                </div>
            </div>
            <div class="detail-desc">
                <div>
                    <div>{{ couponData.userAct.actTitle }}</div>
                    <div>{{ couponData.userAct.consumeMoneyDescription }}</div>
                    <div>券有效期：<span>{{ couponData.userAct.couponPeriod }}</span></div>
                    <div>购买时间：<span>{{ couponData.userAct.getDate }}</span></div>
                    <div :class="couponStatusCls">{{ couponStatusDescription }}</div>
                    <span>30分钟未支付将失效</span>
                </div>
                <div>
                    <div>电子票号（使用时请出示二维码，或者优惠码）</div>
                    <img alt="二维码" v-show="qrCodeImgUrl" :src="qrCodeImgUrl"/>
                    <span>{{ couponData.userAct.couponNo }}</span>
                </div>
            </div>
            <div class="detail-use-desc">
                <div>使用说明：</div>
                <div v-html="couponData.userAct.actContent"></div>
            </div>
        </div>
        <div class="paid-coupon-pay-btn" v-show="!hidePayBtn"><div :class="{ downline : footerBtnText=='已下线' , processing : inPaid }" @click="doClickPayBtn()">{{ footerBtnText }}</div></div>
    </div>
</template>
<script>
    import { Global } from '../libs/global';
    import Util from "../libs/util";

    module.exports = {
        data: function(){
            return {
                global : Global.data,
                queryDataUrl : "../api/v2/club/userredpacket/",
                getOpenIdUrl : "../api/v2/wx/oauth2/user/openid",
                queryQrCodeUrl : "../api/v2/club/user/coupon_qrcode",
                payUrl : "../api/v2/wx/pay/paid_coupon_immediately",
                userActId : "",
                couponData : null,
                qrCodeImgUrl : "",
                getQrCodeCount : 0,
                paramData : Util.localStorage("paid-cou-detail-param"),
                inPaid : false,
                payAuthCode : "",
                payRequestObj : null,
                footerBtnText : "立即支付",
                couponStatusCls : "",
                couponStatusDescription : "",
                hidePayBtn : false
            }
        },
        created : function(){
            var   _this = this, global = _this.global, query = global.currPageQuery;
            _this.userActId = query.userActId;
            console.log("paid coupon detail userActId;"+_this.userActId);
            if(!_this.userActId){
                Util.tipShow(global.visitError);
                _this.$router.back();
            }
            else if(!global.isLogin){
                global.saveLoginPageParams("paidCouponDetail");
                _this.$router.push({ name : "login" });
            }
            else{
                _this.payAuthCode = query.code || global.authCode;
                _this.queryDataUrl += _this.userActId;
                global.loading = true;
                _this.$http.get(_this.queryDataUrl,{ params : { userType : "user" }}).then(function(res){
                    res = res.body;
                    if(res.statusCode == 200){
                        global.loading = false;
                        res = res.respData;
                        res.userAct.getDate = res.userAct.getDate.split(" ")[0];
                        if(res.userAct.couponQrCodeUrl){
                            _this.qrCodeImgUrl = res.userAct.couponQrCodeUrl;
                        }
                        else{
                            _this.getQrCodeImg();//获取二维码
                        }
                        var couponNo = res.userAct.couponNo;
                        res.userAct.couponNo = couponNo.substr(0,4)+" "+couponNo.substr(4,4)+" "+couponNo.substr(8);

                        if(res.userAct.couponStatus==1){
                            _this.couponStatusCls = "already";
                            _this.footerBtnText = "立即预约";
                        }
                        else if(res.actStatus != 'online'){
                            _this.footerBtnText = "已下线";
                        }
                        else if(res.userAct.couponStatus != 0){
                            _this.couponStatusCls = "expire";
                            _this.hidePayBtn = true;
                        }
                        _this.couponStatusDescription = res.userAct.couponStatusDescription;
                        _this.couponData = res;
                    }
                    else{
                        Util.tipShow(res.msg || "获取点钟券数据详情失败！");
                        _this.$router.back();
                    }
                },function(){
                    Util.tipShow("获取点钟券数据详情失败！");
                    global.loading = false;
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
                    state : 'paid-cou-detail'
                }).then(function(res){
                    res = res.body;
                    if(res.statusCode == 200){
                        _this.doClickPayBtn();
                        Util.removeLocalStorage("paid-cou-detail-param");
                    }
                    else if(res.statusCode == 935801){
                        Global.getOauthCode('','9358','paid-cou-detail','base');
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
            getQrCodeImg : function(){//获取二维码图片
                var _this = this;
                _this.getQrCodeCount++;
                _this.$http.get(_this.queryQrCodeUrl,{ params : { userActId : _this.userActId }}).then(function(res){
                    res = res.body;
                    if(res.statusCode == 200 && res.respData){
                        _this.qrCodeImgUrl = res.respData;
                    }
                    else if(_this.getQrCodeCount<4){
                        _this.getQrCodeImg();
                    }
                });
            },
            doClickPayBtn : function(){
                var _this = this, couponData = _this.couponData, global = _this.global;
                if(_this.footerBtnText != "已下线"){
                    if(_this.footerBtnText == "立即支付"){
                        if(!global.userAgent.isWX){
                            if(global.checkAccess("paidCouponDetail")){
                                Util.tipShow("请您打开微信登录'9358'公众号！");
                            }
                            return;
                        }
                        else if(!global.userTel){
                            global.saveLoginPageParams("paidCouponDetail");
                            _this.$router.push({ name : "bindPhone" });
                        }
                        else{
                            Util.removeLocalStorage("paid-cou-detail-param");
                            if(!_this.inPaid){
                                _this.inPaid = true;
                                _this.footerBtnText = "支付中...";
                                _this.$http.post(_this.payUrl,{
                                    actId : couponData.userAct.actId,  //点钟券id
                                    businessType : "paid_coupon",
                                    businessChannel : couponData.userAct.chanel,
                                    clubId : couponData.userAct.clubId,
                                    money : couponData.userAct.actValue,
                                    openId : global.openId,
                                    techId : couponData.techs.id,
                                    tradeChannel : "wx",
                                    bizId : couponData.userAct.bizId,
                                    userId : global.userId
                                }).then(function(res){
                                    res = res.body;
                                    if(res.statusCode == 200){
                                        res = res.respData;
                                        if(res){
                                            _this.payRequestObj =  JSON.parse(res);
                                            if (typeof WeixinJSBridge == "undefined"){
                                                document.addEventListener('WeixinJSBridgeReady', function(){ _this.onBridgeReady() }, false);
                                            }
                                            else{
                                                _this.onBridgeReady();
                                            }
                                        }
                                        else{
                                            _this.inPaid = false;
                                            _this.footerBtnText = "立即预约";
                                            Util.tipShow("您已成功支付！");
                                            _this.couponStatusCls = "already";
                                            _this.couponStatusDescription = "已支付";
                                        }
                                    }
                                    else if(res.statusCode == 935801){
                                        Util.localStorage('paid-cou-detail-param',true);
                                        Global.getOauthCode('','9358','paid-coupon-detail','base');
                                    }
                                    else{
                                        _this.inPaid = false;
                                        _this.footerBtnText = "立即支付";
                                        Util.tipShow(res.msg || "购买点钟券请求失败！");
                                    }
                                });
                            }
                        }
                    }
                    else if(_this.footerBtnText == "立即预约"){
                        _this.$router.push({ name : "confirmOrder", query : { techId : couponData.techs.id , clubId : couponData.clubId } });
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
                        _this.footerBtnText = "立即预约";
                        _this.couponStatusCls = "already";
                        _this.couponStatusDescription = "已支付";
                        ////////////////////////////////发送环信消息
                    }
                    else {
                        _this.footerBtnText = "立即支付";
                        Util.tipShow("未能成功支付！");
                    }
                });
            }
        }
    }
</script>