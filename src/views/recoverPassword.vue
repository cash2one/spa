<style>
    @import '../styles/page/login.css';
</style>
<template>
    <div class="page login-page" id="recover-password-page" v-show="!global.loading">
        <div class="page-title"><a class="back" @click="doClickPageBack()"></a>修改密码</div>
        <div class="input tel spec">
            <i></i><span>+86</span><input type="tel" placeholder="请输入您的11位手机号" v-model="tel" maxlength="11" v-tel-input/>
        </div>
        <div class="input auth spec">
            <i></i><input type="tel" placeholder="请输入手机短信验证码" v-model="testCode" v-test-code-input maxlength="4"/><a @click="getTestCode()" :class="testCodeBtnStatus">{{testCodeBtnText}}</a>
        </div>
        <div class="input pw">
            <i></i><input type="password" placeholder="请输入6-20位密码，仅限字母和数字" v-password-input v-model="password" maxlength="20"/>
        </div>
        <div class="error" v-show="!isTelValid">*&nbsp;请输入正确的11位手机号</div>
        <div class="error" v-show="isTelValid && !isTestCodeVaild">*&nbsp;请输入短信验证码</div>
        <div class="error" v-show="isTelValid && isTestCodeVaild && !isPasswordValid">*&nbsp;请输入6~20位密码</div>
        <div class="next-btn" :class="{ active : isTelValid && isTestCodeVaild && isPasswordValid }" @click="doClickConfirmBtn()">确认修改密码</div>
        <div class="tip-title">注：</div>
        <div class="tip">请输入相关信息完成密码的重置</div>
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
                checkLoginNameUrl : "../api/v1/user/checkLoginName",
                getTestCodeUrl : "../api/v1/icode",
                resetPasswordUrl : "../api/v1/user/resetPassword",
                global : Global.data,
                tel : "",
                password : "",
                testCode : "", //短信验证码
                userLoginParam : null,
                testCodeBtnStatus : "",
                testCodeBtnText : "获取验证码",
                getTestCodeRepeatCount : 6
            }
        },
        computed : {
            isTestCodeVaild : function(){
                return /^\d{4}$/.test(this.testCode)
            },
            isTelValid : function(){
                return /^1[34578]\d{9}$/.test(this.tel)
            },
            isPasswordValid : function(){
                return (this.password.length>=6)
            }
        },
        created : function(){
            var   _this = this, _userLoginParam = Util.localStorage("spa-login-info");
            if(_userLoginParam){
                _this.userLoginParam = JSON.parse(_userLoginParam);
            }
        },
        mounted: function(){
            var _this = this, param = _this.userLoginParam;
            if(param && param["username"]){
                _this.tel = param["username"];
                _this.isTelValid = /^1[34578]\d{9}$/.test(_this.tel);
            }
        },
        methods: {
            doClickConfirmBtn : function(){
                var _this = this;
                if(_this.isTelValid && _this.isTestCodeVaild && _this.isPasswordValid){
                    _this.$http.post(_this.checkLoginNameUrl,{ loginName : _this.tel }).then(function(res){
                        res = res.body;
                        if(res+"" == "-1") {
                            Util.tipShow("用户尚未注册！");
                            return;
                        }
                        _this.$http.post(_this.resetPasswordUrl,{
                            username : _this.tel,
                            code : _this.testCode,
                            password : _this.password
                        }).then(function(){
                            Util.tipShow("密码修改成功！");
                            var loginInfo = {
                                username : _this.tel,
                                isBindWeixin : false,
                                password : _this.password
                            };
                            Util.localStorage('con-login-param',JSON.stringify(loginInfo));
                            _this.$router.push({ name : "confirmLogin" });
                        });
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
                    if(res+"" == "-1"){
                        Util.tipShow("用户尚未注册！");
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