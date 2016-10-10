<style>
    @import '../styles/page/personal.css';
</style>
<template>
    <div class="loading" v-show="$loadingRouteData"><i></i><i></i><i></i></div>
    <div class="page" id="personal-page" v-show="!$loadingRouteData" :style="{ height : (global.winHeight-2.611*global.winScale*16)+'px' }">
        <div class="page-title">个人中心</div>
        <div class="top">
            <div class="header" v-show="global.isLogin" :style="{ backgroundImage : 'url('+global.userHeader+')' }"></div>
            <div class="info" v-show="global.isLogin">
                <div>{{global.userName}}</div>
                <div :class="{ 'bind-phone' : !global.userTel }" @click="bindTelPhone()">{{ global.userTel || '绑定手机' }}</div>
            </div>
            <div class="btn" v-show="!global.isLogin" @click="doClickLoginBtn()">登录/注册</div>
            <router-link class="edit" v-show="global.isLogin" :to="{ name : 'info' }" tag="div"></router-link>
        </div>

        <div class="account-wrap" v-show="global.clubCfg.accountSwitch || global.clubCfg.creditSwitch">
            <router-link v-show="global.pageMode=='9358' || global.clubCfg.accountSwitch" :to="{ name : (global.pageMode=='club' ? 'accountDetail' : 'account') }" tag="div">
                <div class="account"></div>
                <div>我的账户</div>
                <div class="right-arrow"></div>
            </router-link>
            <router-link v-show="global.pageMode=='9358' || global.clubCfg.creditSwitch" :to="{ name : (global.pageMode=='club' ? 'integralDetail' : 'integral') }" tag="div">
                <div class="integral"></div>
                <div>积分中心</div>
                <div class="right-arrow"></div>
            </router-link>
        </div>

        <div class="menu-wrap">
            <router-link :to="{ name : 'coupon' }" tag="div">
                <div class="coupon"></div>
                <div>优惠券<span>分享获得更多优惠券</span></div>
                <div class="right-arrow"></div>
            </router-link>
            <router-link :to="{ name : 'order' }" tag="div">
                <div class="order"></div>
                <div>我的订单</div>
                <div class="right-arrow"></div>
            </router-link>
            <router-link :to="{ name : 'collect' }" tag="div">
                <div class="collect"></div>
                <div>技师收藏</div>
                <div class="right-arrow"></div>
            </router-link>
            <router-link :to="{ name : 'contacts' }" tag="div">
                <div class="contacts"></div>
                <div>最近联系人</div>
                <div class="right-arrow"></div>
            </router-link>
        </div>

        <router-link class="suggestion-wrap" v-show="global.pageMode=='club'" :to="{ name : 'suggestions' }" tag="div">
            <div class="suggestions"></div>
            <div>投诉建议</div>
            <div class="right-arrow"></div>
        </router-link>

        <div class="wx-wrap" v-show="showWxUnbind">
            <div class="unbind-wechat"></div>
            <div>解除微信绑定</div>
            <div class="right-arrow"></div>
        </div>

        <div class="phone-wrap" v-show = "global.userTel" @click="doClickUnbandTel()">
            <div class="unbind-phone"></div>
            <div>解除手机绑定</div>
            <div class="right-arrow"></div>
        </div>

        <div class="exit-wrap" v-show="global.isLogin && showExitBtn" @click="doClickLogout()">
            <div class="logout"></div>
            <div>退出登录</div>
            <div class="right-arrow"></div>
        </div>

        <attention></attention>
    </div>
    <div class="confirm-logout pop-modal" :class="{ active : showLogout }">
        <div class="center-wrap">
            <div>确认退出登录？</div>
            <div><a @click="doClickLogoutBtn('cancel')">取消</a><a @click="doClickLogoutBtn('ok')">确定</a></div>
        </div>
    </div>
</template>
<script>
    import { Global } from '../libs/global';
    import Util from "../libs/util";
    import Attention from '../components/attention';

    module.exports = {
        components: {
            'attention' : Attention
        },
        data: function(){
            return {
                global : Global.data,
                checkTelBandUrl : "../api/v2/wx/current/check_bind",
                checkWxBandUrl : "../api/v2/wx/check_bind",
                logoutUrl : "../api/v1/user/logout",

                showExitBtn : true,
                showWxUnbind : false,
                isWXUnbind : false,
                showLogout : false
            }
        },
        route : {
            data : function(transition){
                var _this = this, global = _this.global;
                if(global.clubCfg.accountSwitch == null){//获取开关状态
                    Global.getClubSwitches();
                }
                if(global.isLogin){
                    if(global.loginChanel == "9358" && global.userTel){
                        _this.$http.get(_this.checkTelBandUrl).then(function(res){
                            res = res.body;
                            if(res.respData == 200){
                                if(res.msg == "Y"){
                                    global.isTelephoneUser = true;
                                    Util.localStorage("isTelephoneUser",true);
                                    _this.showExitBtn = false;
                                    _this.isWXUnbind = true;
                                }
                                else{
                                    global.isTelephoneUser = false;
                                    Util.localStorage("isTelephoneUser",false);
                                    global.userTel = null;
                                    Util.removeLocalStorage("userTel");
                                    //////////////////////////////====================
                                }
                            }
                            else{
                                global.isTelephoneUser = false;
                                Util.localStorage("isTelephoneUser",false);
                                Util.tipShow(res.msg || "检查绑定状态失败");
                            }
                        });
                    }
                    else if(global.userTel){
                        _this.$http.get(_this.checkWxBandUrl,{ params : { phoneNum : global.userTel }}).then(function(res){
                            res = res.body;
                            if(res.statusCode == 200){
                                if(res.respData != 1){
                                    /////////////////////////////
                                }
                            }
                            else{
                                Util.tipShow(res.msg || "检查绑定状态失败");
                            }
                        });
                    }
                    else{
                        _this.showExitBtn = false;
                    }
                }
                transition.next();
            }
        },
        mounted: function(){

        },
        methods: {
            bindTelPhone : function(){
                /////////////////////////////
            },
            doClickLoginBtn : function(){
                var _this = this;
                _this.global.loginPage = "personal";
                _this.global.loginPageQuery = {};
                _this.$router.push({ name : "login" });
            },
            doClickUnbandTel : function(){
                ///////////////解除手机绑定
            },
            doClickLogout : function(){///点击退出登录
                this.showLogout = true;
            },
            doClickLogoutBtn : function(type){///点击确认退出弹窗中的按钮
                var _this = this;
                if(type == "cancel"){//cancel
                    _this.showLogout = false;
                }
                else{//OK
                    _this.$http.get(_this.logoutUrl).then(function(){
                        Global.clearLoginInfo();
                        _this.showLogout = false;
                    });
                }
            }
        }
    }
</script>