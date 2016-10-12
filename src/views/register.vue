<style>
    @import '../styles/page/login.css';
</style>
<template>
    <div>
        <div class="loading" v-show="loading"><i></i><i></i><i></i></div>
        <div class="page login-page" id="register-page" v-show="!loading">
            <div class="page-title"><a class="back" @click="doClickPageBack()"></a>注册</div>
            <div class="input tel spec">
                <i></i><span>+86</span><input type="tel" placeholder="请输入您的11位手机号" v-model="tel" maxlength="11" v-tel-input="isTelValid"/>
            </div>
            <div class="input auth spec">
                <i></i><input type="tel" placeholder="请输入手机短信验证码" v-model="testCode" v-test-code-input="isTestCodeVaild" maxlength="4"/><a @click="getTestCode()" :class="testCodeBtnStatus">{{testCodeBtnText}}</a>
            </div>
            <div class="input pw">
                <i></i><input type="password" placeholder="请输入6-20位密码，仅限字母和数字" v-password-input="isPasswordValid" v-model="password" maxlength="20"/>
            </div>
            <div class="error" v-show="!isTelValid">*&nbsp;请输入正确的11位手机号</div>
            <div class="error" v-show="isTelValid && !isTestCodeVaild">*&nbsp;请输入短信验证码</div>
            <div class="error" v-show="isTelValid && isTestCodeVaild && !isPasswordValid">*&nbsp;请输入6~20位密码</div>
            <div class="next-btn" :class="{ active : isTelValid && isTestCodeVaild && isPasswordValid }" @click="doClickConfirmBtn()">注册</div>
            <div class="tip-title">注：</div>
            <div class="tip">您的手机号未注册，请输入相关信息完成注册</div>
        </div>
    </div>
</template>
<script>
    import { Global } from '../libs/global';
    import Util from "../libs/util";
    import TelInput from "../directives/tel-input";
    import PasswordInput from "../directives/password-input";
    import TestCodeInput from "../directives/test-code-input";

    module.exports = {
        directives: {
            "tel-input" : TelInput,
            "password-input" : PasswordInput,
            "test-code-input" : TestCodeInput
        },
        data: function(){
            return {
                loading : false,
                checkLoginNameUrl : "../api/v1/user/checkLoginName",
                getTestCodeUrl : "../api/v1/icode",
                registerUrl : "../api/v1/user/register",
                global : Global.data,
                tel : "",
                password : "",
                testCode : "", //短信验证码
                isTelValid : false,
                isPasswordValid : false,
                isTestCodeVaild : false,
                userLoginParam : null,
                testCodeBtnStatus : "",
                testCodeBtnText : "获取验证码",
                getTestCodeRepeatCount : 6,

                inRequest : false,
                isBindWeixin : false
            }
        },
        created : function(){
            var   _this = this,
                    _userLoginParam = Util.localStorage("user-register-param"),
                    _loginInfo = window["spa-login-info"],
                    global = _this.global,
                    pageParam = global.currPageQuery;
            if(_userLoginParam){
                _this.userLoginParam = JSON.parse(_userLoginParam);
            }
            if(pageParam.code){
                global.authCode = pageParam.code;
            }
            if(global.userAgent.isWX && (!global.authCode || pageParam.state != '9358_login' )){
                Global.getOauthCode('','9358','9358_login','base');
                _this.$router.back();
            }
            else{
                if(_loginInfo){
                    _this.tel = _loginInfo["username"];
                    _this.isTelValid = /^1[34578]\d{9}$/.test(_this.tel);
                    if(_loginInfo.password && _loginInfo.code){
                        _this.testCode = _loginInfo.code;
                        _this.password = _loginInfo.password;
                        _this.isTestCodeVaild = /^\d{4}$/.test(_this.testCode) ;
                        _this.isPasswordValid = (_this.password.length>=6);
                    }
                    delete window['spa-login-info'];
                }
            }
        },
        mounted: function(){
            var _this = this, param = _this.userLoginParam;
            if(param && param["username"]){
                _this.tel = param["username"];
                _this.isTelValid = /^1[34578]\d{9}$/.test(_this.tel);
                _this.isBindWeixin = param["isBindWeixin"];
                if(param["password"]){
                    _this.password = param["password"];
                    _this.isPasswordValid = (_this.password.length>=6);
                }
                if(param["code"]){
                    _this.testCode = param["code"];
                    _this.isTestCodeVaild = /^\d{4}$/.test(_this.testCode);
                }
                Util.removeLocalStorage('user-register-param');
                _this.doClickConfirmBtn();
            }
        },
        methods: {
            doClickConfirmBtn : function(){
                var _this = this, global = _this.global;
                if(_this.isTelValid && _this.isTestCodeVaild && _this.isPasswordValid){
                    _this.inRequest = true;
                    _this.$http.post(_this.checkLoginNameUrl,{ loginName : _this.tel }).then(function(res){
                        res = res.body;
                        if(res+"" == "1") {
                            Util.tipShow("该用户已经注册了！");
                            _this.inRequest = false;
                        }
                        else{
                            var param = {
                                mobile : _this.tel,
                                code : _this.testCode,
                                password : _this.password,
                                clubId : global.clubId,
                                chanel : global.sessionType,
                                openId : global.openId || "",
                                wxNickName: global.nickName || "",
                                wxHeadimgurl : global.headerImgUrl,
                                clubCode : global.clubInviteCode,
                                techInviteCode : (global.techInviteCode || ''),
                                auth2code : global.authCode,
                                isBindWeixin : _this.isBindWeixin ? 'Y' : 'N'
                            };
                            _this.$http.post(_this.registerUrl,param).then(function(res){
                                res = res.body;
                                if(res.status == 200){
                                    global.token = res['token'];
                                    global.userId = res['userId'];
                                    global.userHeader = res['avatarUrl'] || global.defaultHeader;
                                    global.userTel = res['phoneNum'];
                                    global.userName = res['name'];
                                    global.loginName = res['loginName'];
                                    global.isLogin = true;

                                    Util.localStorage('token',global.token);
                                    Util.localStorage('userID',global.userId);
                                    Util.localStorage('userHeader',global.userHeader);
                                    Util.localStorage('userTel',global.userTel);
                                    Util.localStorage('userName',global.userName);
                                    Util.localStorage('userLoginName',global.loginName);

                                    //////////////////////////////////////////////
                                    /////////////////////////////////////////////

                                    Util.tipShow("注册成功！");

                                    if(global.loginPage){
                                        _this.$router.push({ name : global.loginPage, query : global.loginPageQuery });
                                    }
                                    else{
                                        _this.$router.push({ name : "home" });
                                    }
                                }
                                else if(res.statusCode == "935801"){
                                    Util.localStorage('user-register-param',JSON.stringify(param));
                                    Global.getOauthCode('','9358','9358_login','base');
                                }
                                _this.inRequest = false;
                            },function(error){
                                Util.tipShow(error.data || "注册出错！");
                                _this.inRequest = false;
                            });
                        }
                    });
                }
            },
            doClickPageBack : function(){
                history.back();
            },
            getTestCode : function(){//获取短信验证码
                var _this = this;
                if(_this.testCodeBtnStatus == "disabled" || _this.testCodeBtnStatus == "pause" ){
                    return;
                }
                if(!_this.isTelValid){
                    Util.tipShow("请输入正确的手机号码！");
                    return;
                }
                _this.$http.post(_this.checkLoginNameUrl,{ loginName : _this.tel }).then(function(res){
                    res = res.body;
                    if(res+"" == "1"){
                        Util.tipShow("该用户已经注册了！");
                        return;
                    }
                    _this.testCodeBtnStatus = "pause";
                    _this.testCodeBtnText = "重新发送(60s)";

                    var   count = 60,
                            sendInterval = setInterval(function () {
                                if (--count == 0) {
                                    clearInterval(sendInterval);
                                    _this.getTestCodeRepeatCount--;
                                    _this.testCodeBtnStatus = "";
                                    _this.testCodeBtnText = "获取验证码";

                                    if(_this.getTestCodeRepeatCount == 0){
                                        _this.testCodeBtnStatus = "disabled";
                                    }
                                }
                                else{
                                    _this.testCodeBtnText = "重新发送(" + count + "s)";
                                }
                            }, 1000);
                    _this.$http.get(_this.getTestCodeUrl,{ params : { mobile : _this.tel }});
                });
            }
        }
    }
</script>