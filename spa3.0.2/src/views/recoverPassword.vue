<style>
    @import '../styles/page/login.css';
</style>
<template>
    <div class="page login-page" id="recover-password-page">
        <page-title title-text="修改密码"></page-title>
        <div class="input tel spec"><i></i><span>+86</span><input type="tel" placeholder="请输入您的11位手机号" v-model="tel" maxlength="11" v-tel-input/></div>
        <div class="input auth spec"><i></i><input type="tel" placeholder="请输入手机短信验证码" v-model="testCode" v-test-code-input maxlength="4"/><a @click="getTestCode()" :class="testCodeBtnStatus">{{testCodeBtnText}}</a></div>
        <div class="input pw"><i></i><input type="password" placeholder="请输入6-20位密码，仅限字母和数字" v-password-input v-model="password" maxlength="20"/></div>
        <div class="error" v-show="!isTelValid">*&nbsp;请输入正确的11位手机号</div>
        <div class="error" v-show="isTelValid && !isTestCodeVaild">*&nbsp;请输入短信验证码</div>
        <div class="error" v-show="isTelValid && isTestCodeVaild && !isPasswordValid">*&nbsp;请输入6~20位密码</div>
        <div class="next-btn" :class="{ active : isTelValid && isTestCodeVaild && isPasswordValid }" @click="doClickConfirmBtn()">确认修改密码</div>
        <div class="tip-title">注：</div>
        <div class="tip">请输入相关信息完成密码的重置</div>
    </div>
</template>
<script>
    import { Global } from '../libs/global'
    import Util from '../libs/util'
    import TelInput from '../directives/tel-input'
    import PasswordInput from '../directives/password-input'
    import TestCodeInput from '../directives/test-code-input'

    module.exports = {
        directives: {
            'tel-input': TelInput,
            'password-input': PasswordInput,
            'test-code-input': TestCodeInput
        },
        data: function () {
            return {
                global: Global.data,
                tel: '',
                password: '',
                testCode: '', // 短信验证码
                testCodeBtnStatus: '',
                testCodeBtnText: '获取验证码',
                getTestCodeRepeatCount: 6
            }
        },
        computed: {
            isTestCodeVaild: function () {
                return /^\d{4}$/.test(this.testCode)
            },
            isTelValid: function () {
                return /^1[34578]\d{9}$/.test(this.tel)
            },
            isPasswordValid: function () {
                return (this.password.length >= 6)
            }
        },
        created: function () {
            var that = this
            var param = window['spa-login-info']
            if (param && param['username']) {
                that.tel = param['username']
                that.isTelValid = /^1[34578]\d{9}$/.test(that.tel)
            }
            that.global.loading = false
        },
        methods: {
            doClickConfirmBtn: function () {
                var that = this
                if (that.isTelValid && that.isTestCodeVaild && that.isPasswordValid) {
                    that.$http.post('../api/v1/user/checkLoginName', {loginName: that.tel}).then(function (res) {
                        res = res.body
                        if (res + '' == '-1') {
                            Util.tipShow('用户尚未注册！')
                            return
                        }
                        that.$http.post('../api/v1/user/resetPassword', {
                            username: that.tel,
                            code: that.testCode,
                            password: that.password
                        }).then(function () {
                            Util.tipShow('密码修改成功！')
                            var loginInfo = {
                                username: that.tel,
                                isBindWeixin: false,
                                password: that.password
                            }
                            Util.localStorage('con-login-param', JSON.stringify(loginInfo))
                            that.$router.push({name: 'confirmLogin'})
                        })
                    })
                }
            },
            getTestCode: function () { // 获取短信验证码
                var that = this
                if (that.testCodeBtnStatus == 'disabled' || that.testCodeBtnStatus == 'pause') {
                    return
                }
                if (!that.isTelValid) {
                    Util.tipShow('请输入正确的手机号码！')
                    return
                }
                that.$http.post(that.checkLoginNameUrl, {loginName: that.tel}).then(function (res) {
                    res = res.body
                    if (res + '' == '-1') {
                        Util.tipShow('用户尚未注册！')
                        return
                    }
                    that.testCodeBtnStatus = 'pause'
                    that.testCodeBtnText = '重新发送(60s)'

                    var count = 60
                    var sendInterval = setInterval(function () {
                        if (--count == 0) {
                            clearInterval(sendInterval)
                            that.getTestCodeRepeatCount--
                            that.testCodeBtnStatus = ''
                            that.testCodeBtnText = '获取验证码'

                            if (that.getTestCodeRepeatCount == 0) {
                                that.testCodeBtnStatus = 'disabled'
                            }
                        } else {
                            that.testCodeBtnText = '重新发送(' + count + 's)'
                        }
                    }, 1000)
                    that.$http.get('../api/v1/icode', {params: {mobile: that.tel}})
                })
            }
        }
    }
</script>