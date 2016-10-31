<style>
    @import '../styles/page/bindPhone.css';
</style>
<template>
    <div>
        <div class="page login-page" id="account-page" v-show="!global.loading">
            <div class="page-title"><a class="back" @click="doClickPageBack()"></a>绑定手机</div>
            <div class="input tel">
                <i></i><span>+86</span><input type="tel" placeholder="请输入您的11位手机号" v-model="tel" maxlength="11" v-tel-input="isTelValid" @keypress="dokeyPressOfInput($event)"/>
            </div>
            <div class="next-btn" :class="{ active : isTelValid }" @click="doClickBindBtn()">确认绑定</div>
        </div>
        <div class="bind-phone-dialog pop-modal" :class="{ active : showBindPhoneDialog }">
            <div class="center-wrap">
                <div>
                    <p class="h2">确认绑定</p>
                    <p>该手机已经绑定另一个微信，确认绑定将解除该手机原绑定关系。</p>
                </div>
                <div>
                    <a class="cancel-btn" @click="doCancelPhoneDialog()">取消</a>
                    <a class="sure-btn" @click="doLogin()">确定</a>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import { Global } from '../libs/global';
    import { IM } from '../libs/im';
    import Util from "../libs/util";
    import TelInput from "../directives/tel-input";

    module.exports = {
        directives: {
            "tel-input" : TelInput
        },
        data: function(){
            return {
                global : Global.data,
                im : IM,
                checkBandUrl : "../api/v2/wx/current/check_bind",
                telBandUrl : "../api/v2/wx/check_bind",
                loginUrl : "../api/v1/user/login",
                tel : "",
                isTelValid : false,
                showBindPhoneDialog : false
            }
        },
        methods: {
            doClickPageBack : function(){
                history.back();
            },
            dokeyPressOfInput : function(event){
                if(event.keyCode == 13 && this.isTelValid){
                    this.doClickBindBtn();
                }
            },
            doClickBindBtn : function(){
                var   _this = this, global = _this.global;
                if(_this.isTelValid){
                    _this.$http.get(_this.checkBandUrl).then(function(res){
                        res = res.body;
                        if(res.statusCode == 200){
                            if(res.msg == "Y"){
                                Util.tipShow("当前用户是已绑定状态。");
                                global.isTelephoneUser = true;
                                Util.localStorage('isTelephoneUser',true);
                                if(global.loginPage) _this.$router.push({ name : global.loginPage, query : global.loginPageQuery });
                            }
                            else{
                                _this.$http.get(_this.telBandUrl, { params : { 'phoneNum' : _this.tel }}).then(function(bindRes){
                                    bindRes = bindRes.body;
                                    if(bindRes.statusCode == 200){
                                        if(bindRes.respData == 1){
                                            _this.showBindPhoneDialog = true;
                                        }
                                        else{
                                            _this.doLogin();
                                        }
                                    }
                                    else{
                                        Util.tipShow(bindRes.msg || "检查绑定状态失败.");
                                    }
                                });
                            }
                        }
                    });
                }
            },
            doCancelPhoneDialog : function(){
                this.showBindPhoneDialog = false;
            },
            doLogin : function(){
                var   _this = this, global = _this.global, im = _this.im,
                        paramData = {
                            username : _this.tel,
                            password : "",
                            usertype : 'user',
                            clubId : global.clubId,
                            code : '',
                            scope : 'snsapi_base',
                            oldUserId : global.userId, ////旧账号
                            oldChatId : im.id
                        };
                if(global.sessionType == "9358" || global.userAgent.isWX){
                    paramData.loginChanel = global.loginChanel;
                    paramData.openId = global.openId;
                    paramData.wxNickName = global.nickName;
                    paramData.wxHeadimgurl = global.headerImgUrl;
                    paramData.isBindWeixin = true;
                }
                _this.$http.get(_this.loginUrl, { params : paramData }).then(function(res){
                    res = res.body;
                    window['spa-login-info'] = paramData;
                    if(res.statusCode==2){
                        Util.removeLocalStorage("user-login-param");
                        Util.localStorage('user-register-param',JSON.stringify(paramData));
                        _this.$router.push({ name : "register" });
                    }
                    else if(res.statusCode == '935801'){//需重新获取授权
                        Util.localStorage('user-login-param',JSON.stringify(paramData));
                        Global.getOauthCode('','9358','9358_login','base');
                    }
                    else if(res.statusCode ==1){
                        Util.removeLocalStorage("user-login-param");
                        Util.localStorage('con-login-param',JSON.stringify(paramData));
                        _this.$router.push({ name : "confirmLogin" });
                    }
                });
            }
        }
    }
</script>