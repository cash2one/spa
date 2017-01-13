<style>
    @import '../styles/page/bindPhone.css';
</style>
<template>
    <div>
        <div class="page login-page" id="account-page">
            <page-title title-text="绑定手机"></page-title>
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
    import { Global } from '../libs/global'
    import { IM } from '../libs/im'
    import Util from '../libs/util'
    import TelInput from '../directives/tel-input'

    module.exports = {
        directives: {
            'tel-input': TelInput
        },
        data: function () {
            return {
                global: Global.data,
                im: IM,
                checkBandUrl: '../api/v2/wx/current/check_bind',
                telBandUrl: '../api/v2/wx/check_bind',
                loginUrl: '../api/v1/user/login',
                tel: '',
                isTelValid: false,
                showBindPhoneDialog: false
            }
        },
        methods: {
            dokeyPressOfInput: function (event) {
                if (event.keyCode == 13 && this.isTelValid) {
                    this.doClickBindBtn()
                }
            },
            doClickBindBtn: function () {
                var that = this
                var global = that.global
                if (that.isTelValid) {
                    that.$http.get(that.checkBandUrl).then(function (res) {
                        res = res.body
                        if (res.statusCode == 200) {
                            if (res.msg == 'Y') {
                                Util.tipShow('当前用户是已绑定状态。')
                                global.isTelephoneUser = true
                                Util.localStorage('isTelephoneUser', true)
                                if (global.loginPage) {
                                    that.$router.push({
                                        name: global.loginPage,
                                        query: global.loginPageQuery
                                    })
                                }
                            } else {
                                that.$http.get(that.telBandUrl, {params: {'phoneNum': that.tel}}).then(function (bindRes) {
                                    bindRes = bindRes.body
                                    if (bindRes.statusCode == 200) {
                                        if (bindRes.respData == 1) {
                                            that.showBindPhoneDialog = true
                                        } else {
                                            that.doLogin()
                                        }
                                    } else {
                                        Util.tipShow(bindRes.msg || '检查绑定状态失败.')
                                    }
                                })
                            }
                        }
                    })
                }
            },
            doCancelPhoneDialog: function () {
                this.showBindPhoneDialog = false
            },
            doLogin: function () {
                var that = this
                var global = that.global
                var im = that.im
                var paramData = {
                    username: that.tel,
                    password: '',
                    usertype: 'user',
                    clubId: global.clubId,
                    code: '',
                    scope: 'snsapi_base',
                    oldUserId: global.userId, // 旧账号
                    oldChatId: im.id
                }

                if (global.sessionType == '9358' || global.userAgent.isWX) {
                    paramData.loginChanel = global.loginChanel
                    paramData.openId = global.openId
                    paramData.wxNickName = global.nickName
                    paramData.wxHeadimgurl = global.headerImgUrl
                    paramData.isBindWeixin = true
                }

                that.$http.get(that.loginUrl, {params: paramData}).then(function (res) {
                    res = res.body
                    window['spa-login-info'] = paramData
                    if (res.statusCode == 2) {
                        Util.removeLocalStorage('user-login-param')
                        Util.localStorage('user-register-param', JSON.stringify(paramData))
                        that.$router.push({name: 'register'})
                    } else if (res.statusCode == '935801') { // 需重新获取授权
                        Util.localStorage('user-login-param', JSON.stringify(paramData))
                        Global.getOauthCode('', '9358', '9358_login', 'base')
                    } else if (res.statusCode == 1) {
                        Util.removeLocalStorage('user-login-param')
                        Util.localStorage('con-login-param', JSON.stringify(paramData))
                        that.$router.push({name: 'confirmLogin'})
                    }
                })
            }
        }
    }
</script>