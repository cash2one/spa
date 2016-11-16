<style>
    @import '../styles/page/login.css';
</style>
<template>
    <div class="page login-page" id="login-page" v-show="!global.loading">
        <div class="page-title"><a class="back" @click="doClickPageBack()"></a>登录/注册</div>
        <div class="input tel">
            <i></i><span>+86</span><input type="tel" placeholder="请输入您的11位手机号" v-model="tel" maxlength="11" v-tel-input
                                          @keypress="dokeyPressOfInput($event)"/>
        </div>
        <div class="next-btn" :class="{ active : isTelValid }" @click="doClickNextBtn()">下一步</div>
        <div class="tip-title">注：</div>
        <div class="tip">进行身份验证后系统会自动判断你是否为注册用户，并自动衔接后续的操作</div>
    </div>
</template>
<script>
    import {Global} from '../libs/global'
    import Util from '../libs/util'
    import TelInput from '../directives/tel-input'

    module.exports = {
        directives: {
            'tel-input': TelInput
        },
        data: function () {
            return {
                global: Global.data,
                loginUrl: '../api/v1/user/login',
                tel: '',
                userLoginParam: null
            }
        },
        computed: {
            isTelValid: function () {
                return /^1[34578]\d{9}$/.test(this.tel)
            }
        },
        created: function () {
            var _this = this
            var _userLoginParam = Util.localStorage('user-login-param')
            var pageParam = _this.global.currPage.query
            var global = _this.global
            if (_userLoginParam) {
                _this.userLoginParam = JSON.parse(_userLoginParam)
            }
            if (pageParam.code) {
                global.authCode = pageParam.code
            }
            if (global.userAgent.isWX && (!global.authCode || pageParam.state != '9358_login')) {
                Global.getOauthCode('', '9358', '9358_login', 'base')
                _this.$router.back()
            } else {
                if (pageParam['loginTel']) {
                    _this.tel = pageParam['loginTel']
                    _this.isTelValid = /^1[34578]\d{9}$/.test(_this.tel)
                }
            }
        },
        mounted: function () {
            var _this = this
            var param = _this.userLoginParam
            if (param && param['username']) {
                _this.tel = param['username']
                _this.isTelValid = /^1[34578]\d{9}$/.test(_this.tel)
                Util.removeLocalStorage('user-login-param')
                _this.doClickNextBtn()
            }
        },
        methods: {
            doClickNextBtn: function () {
                var _this = this
                var global = _this.global
                if (_this.isTelValid) {
                    var paramData = {
                        username: _this.tel,
                        password: '',
                        usertype: 'user',
                        clubId: global.clubId || '',
                        code: global.authCode,
                        scope: 'snsapi_base'
                    }
                    if (global.sessionType == '9358' || global.userAgent.isWX) {
                        paramData.loginChanel = global.loginChanel
                        paramData.openId = global.openId
                        paramData.wxNickName = global.nickName
                        paramData.wxHeadimgurl = global.headerImgUrl
                    }
                    _this.$http.get(_this.loginUrl, {params: paramData}).then(function (res) {
                        window['spa-login-info'] = paramData
                        res = res.body
                        if (res.statusCode == 2) {
                            Util.removeLocalStorage('user-login-param')
                            Util.localStorage('user-register-param', JSON.stringify(paramData))
                            _this.$router.push({name: 'register'})
                        } else if (res.statusCode == '935801') { // 需重新获取授权
                            Util.localStorage('user-login-param', JSON.stringify(paramData))
                            Global.getOauthCode('', '9358', '9358_login', 'base')
                        } else if (res.statusCode == 1) {
                            Util.removeLocalStorage('user-login-param')
                            Util.localStorage('con-login-param', JSON.stringify(paramData))
                            _this.$router.push({name: 'confirmLogin'})
                        }
                    })
                }
            },
            doClickPageBack: function () {
                history.back()
            },
            dokeyPressOfInput: function (event) {
                if (event.keyCode == 13) {
                    this.doClickNextBtn()
                }
            }
        }
    }
</script>
