<style>
    @import '../styles/page/personal.css';
</style>
<template>
    <div>
        <div class="page" id="personal-page" :style="{ height : (global.winHeight-2.611*global.winScale*16)+'px' }">
            <div class="page-title">个人中心</div>
            <div class="top">
                <div class="header" v-show="global.isLogin" :style="{ backgroundImage : 'url('+global.userHeader+')' }"></div>
                <div class="info" v-show="global.isLogin">
                    <div>{{ global.userName }}</div>
                    <div :class="{ 'bind-phone' : !global.userTel }" @click="bindTelPhone()">{{ global.userTel || '绑定手机'}}</div>
                </div>
                <div class="btn" v-show="!global.isLogin" @click="doClickLoginBtn()">登录/注册</div>
                <router-link class="edit" v-show="global.isLogin" :to="{ name : 'info' }"></router-link>
            </div>
            <div class="account-wrap" v-show="global.clubCfg.accountSwitch || global.clubCfg.creditSwitch">
                <router-link v-show="global.pageMode=='9358' || global.clubCfg.accountSwitch" :to="{ name : (global.pageMode=='club' ? 'accountDetail' : 'account') }">
                    <div class="account"></div>
                    <div>我的会员卡</div>
                    <div class="right-arrow"></div>
                </router-link>
                <router-link v-show="global.pageMode=='9358' || global.clubCfg.creditSwitch" :to="{ name : (global.pageMode=='club' ? 'integralDetail' : 'integral') }">
                    <div class="integral"></div>
                    <div>积分中心</div>
                    <div class="right-arrow"></div>
                </router-link>
            </div>

            <div class="menu-wrap">
                <router-link :to="{ name : 'coupon' }">
                    <div class="coupon"></div>
                    <div>优惠券<span>分享获得更多优惠券</span></div>
                    <div class="right-arrow"></div>
                </router-link>
                <router-link :to="{ name : 'order' }">
                    <div class="order"></div>
                    <div>我的订单</div>
                    <div class="right-arrow"></div>
                </router-link>
                <router-link :to="{ name : 'collect' }">
                    <div class="collect"></div>
                    <div>技师收藏</div>
                    <div class="right-arrow"></div>
                </router-link>
                <router-link :to="{ name : 'contacts' }">
                    <div class="contacts"></div>
                    <div>最近联系人</div>
                    <div class="right-arrow"></div>
                </router-link>
            </div>

            <router-link class="suggestion-wrap" v-show="global.pageMode=='club'" :to="{ name : 'suggestions' }">
                <div class="suggestions"></div>
                <div>投诉建议</div>
                <div class="right-arrow"></div>
            </router-link>

            <div class="wx-wrap" v-show="showWxUnbind">
                <div class="unbind-wechat"></div>
                <div>解除微信绑定</div>
                <div class="right-arrow"></div>
            </div>

            <div class="phone-wrap" v-show="global.userTel" @click="doClickUnbandTel()">
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
    </div>
</template>
<script>
    import { Global } from '../libs/global'
    import Util from '../libs/util'

    module.exports = {
        data: function () {
            return {
                global: Global.data,
                checkTelBandUrl: '../api/v2/wx/current/check_bind',
                checkWxBandUrl: '../api/v2/wx/check_bind',
                logoutUrl: '../api/v1/user/logout',
                showExitBtn: true,
                showWxUnbind: false,
                isWXUnbind: false,
                showLogout: false
            }
        },
        created: function () {
            var that = this
            var global = that.global
            if (global.clubCfg.accountSwitch == null) { // 获取开关状态
                Global.getClubSwitches()
            }
            if (global.isLogin) {
                if (global.loginChanel == '9358' && global.userTel) {
                    that.$http.get(that.checkTelBandUrl).then(function (res) {
                        res = res.body
                        if (res.respData == 200) {
                            if (res.msg == 'Y') {
                                global.isTelephoneUser = true
                                Util.localStorage('isTelephoneUser', true)
                                that.showExitBtn = false
                                that.isWXUnbind = true
                            } else {
                                global.isTelephoneUser = false
                                Util.localStorage('isTelephoneUser', false)
                                global.userTel = null
                                Util.removeLocalStorage('userTel')
                                // ====================
                            }
                        } else {
                            global.isTelephoneUser = false
                            Util.localStorage('isTelephoneUser', false)
                            Util.tipShow(res.msg || '检查绑定状态失败')
                        }
                        global.loading = false
                    })
                } else if (global.userTel) {
                    that.$http.get(that.checkWxBandUrl, {params: {phoneNum: global.userTel}}).then(function (res) {
                        res = res.body
                        if (res.statusCode == 200) {
                            if (res.respData != 1) {
                                // =============
                            }
                        } else {
                            Util.tipShow(res.msg || '检查绑定状态失败')
                        }
                        global.loading = false
                    })
                } else {
                    that.showExitBtn = false
                    global.loading = false
                }
            } else {
                global.loading = false
            }
        },
        mounted: function () {
        },
        methods: {
            bindTelPhone: function () {
                // ======
            },
            doClickLoginBtn: function () {
                var that = this
                that.global.loginPage = 'personal'
                that.global.loginPageQuery = {}
                that.$router.push({name: 'login'})
            },
            doClickUnbandTel: function () {
                // 解除手机绑定
            },
            doClickLogout: function () { // 点击退出登录
                this.showLogout = true
            },
            doClickLogoutBtn: function (type) { // 点击确认退出弹窗中的按钮
                var that = this
                if (type == 'cancel') { // cancel
                    that.showLogout = false
                } else { // OK
                    that.$http.get(that.logoutUrl).then(function () {
                        Global.clearLoginInfo()
                        that.showLogout = false
                    })
                }
            }
        }
    }
</script>