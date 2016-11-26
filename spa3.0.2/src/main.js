import Vue from 'vue'
import VueRouter from 'vue-router'
import VueResource from 'vue-resource'
import App from './app.vue'
import { Global } from './libs/global'
import { IM } from './libs/im'
import Util from './libs/util'
import AwesomeSwiper from 'vue-awesome-swiper'

// 全局插件
Vue.use(VueRouter)
Vue.use(VueResource)
Vue.use(AwesomeSwiper)

// 注册公用组件
var TelDetail = require('./components/tel-detail')
var Share = require('./components/share')
var Club = require('./components/club')
var Attention = require('./components/attention')
var CreditTip = require('./components/credit-tip')
var Spinner = require('./components/spinner')

Vue.component('tel-detail', TelDetail)
Vue.component('share', Share)
Vue.component('club', Club)
Vue.component('attention', Attention)
Vue.component('credit-tip', CreditTip)
Vue.component('spinner', Spinner)

// 非公共组件，但打包到app.js中
var Tech = require('./components/tech')
var ChatInput = require('./components/chat-input')
var DiceSetting = require('./components/dice-setting')
var LoadMore = require('./components/load-more')
var GoldenEffect = require('./components/golden-effect')
var HomeTech = require('./components/home-tech')

Vue.component('tech', Tech)
Vue.component('chat-input', ChatInput)
Vue.component('dice-setting', DiceSetting)
Vue.component('load-more', LoadMore)
Vue.component('golden-effect', GoldenEffect)
Vue.component('home-tech', HomeTech)

Vue.http.options.emulateJSON = true
Global.beforeInit()
var _global = Global.data

window['spa'] = _global // 调试用，编码中勿使用
window['im'] = IM
window['util'] = Util

// 设置vue-resource的inteceptor
Vue.http.interceptors.push(function (request, next) {
    // 设置全局的请求参数
    if (request.method.toLowerCase() === 'get') {
        var params = request.params
        params['_'] = (+new Date()) // 时间戳
        params['sessionType'] = _global.sessionType
        if (!params['token']) {
            params['token'] = _global.token
        }
    } else {
        var body = request.body
        body['sessionType'] = _global.sessionType
        if (!body['token']) {
            body['token'] = _global.token
        }
    }

    // 回调响应函数之前的处理
    next(function (response) {
        var resBody = response.body
        if (typeof resBody === 'string') {
            try {
                response.body = resBody = JSON.parse(resBody)
            } catch (e) {}
        }

        if (resBody && resBody.statusCode === 500) {
            Util.tipShow(resBody.msg || '服务端异常！')
            console.log('请求异常：' + response.url)
        }
        return response
    })
})

var isClubMode = _global.pageMode === 'club'
var prefixPath = isClubMode ? '' : '/'
var clubPageRouterOption = []
var switchComponent = {
    template: '<div></div>',
    created: function () {
        location.reload(true)
    }
}
var pageRouterOption = [
    {
        path: prefixPath + 'home',
        name: 'home',
        meta: { checkLogin: false },
        component: function (resolve) {
            require(['./views/home.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'message',
        name: 'message',
        meta: { checkLogin: true },
        component: function (resolve) {
            require(['./views/message.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'technicianList',
        name: 'technicianList',
        meta: { checkLogin: false },
        component: function (resolve) {
            require(['./views/technicianList.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'technicianDetail',
        name: 'technicianDetail',
        meta: { checkLogin: false },
        component: function (resolve) {
            require(['./views/technicianDetail.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'order',
        name: 'order',
        meta: { checkLogin: true },
        component: function (resolve) {
            require(['./views/order.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'orderDetail',
        name: 'orderDetail',
        meta: { checkLogin: true },
        component: function (resolve) {
            require(['./views/orderDetail.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'personal',
        name: 'personal',
        meta: { checkLogin: false },
        component: function (resolve) {
            require(['./views/personal.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'clubProfile',
        name: 'clubProfile',
        meta: { checkLogin: false },
        component: function (resolve) {
            require(['./views/clubProfile.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'promotions',
        name: 'promotions',
        meta: { checkLogin: false },
        component: function (resolve) {
            require(['./views/promotions.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'serviceList',
        name: 'serviceList',
        meta: { checkLogin: false },
        component: function (resolve) {
            require(['./views/serviceList.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'serviceItem',
        name: 'serviceItem',
        meta: { checkLogin: false },
        component: function (resolve) {
            require(['./views/serviceItem.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'map',
        name: 'map',
        meta: { checkLogin: false },
        component: function (resolve) {
            require(['./views/map.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'comment',
        name: 'comment',
        meta: { checkLogin: false },
        component: function (resolve) {
            require(['./views/comment.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'review',
        name: 'review',
        meta: { checkLogin: false },
        component: function (resolve) {
            require(['./views/review.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'technicianImg',
        name: 'technicianImg',
        meta: { checkLogin: false },
        component: function (resolve) {
            require(['./views/technicianImg.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'chat',
        name: 'chat',
        meta: { checkLogin: true },
        component: function (resolve) {
            require(['./views/chat.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'login',
        name: 'login',
        meta: { checkLogin: false },
        component: function (resolve) {
            require(['./views/login.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'confirmLogin',
        name: 'confirmLogin',
        meta: { checkLogin: false },
        component: function (resolve) {
            require(['./views/confirmLogin.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'recoverPassword',
        name: 'recoverPassword',
        meta: { checkLogin: false },
        component: function (resolve) {
            require(['./views/recoverPassword.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'register',
        name: 'register',
        meta: { checkLogin: false },
        component: function (resolve) {
            require(['./views/register.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'promotionsActivity',
        name: 'promotionsActivity',
        meta: { checkLogin: false },
        component: function (resolve) {
            require(['./views/promotionsActivity.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'accountDetail',
        name: 'accountDetail',
        meta: { checkLogin: true },
        component: function (resolve) {
            require(['./views/accountDetail.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'account',
        name: 'account',
        meta: { checkLogin: true },
        component: function (resolve) {
            require(['./views/account.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'coupon',
        name: 'coupon',
        meta: { checkLogin: true },
        component: function (resolve) {
            require(['./views/coupon.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'couponDetail',
        name: 'couponDetail',
        meta: { checkLogin: true },
        component: function (resolve) {
            require(['./views/couponDetail.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'confirmOrder',
        name: 'confirmOrder',
        meta: { checkLogin: true },
        component: function (resolve) {
            require(['./views/confirmOrder.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'paidCouponDetail',
        name: 'paidCouponDetail',
        meta: { checkLogin: false },
        component: function (resolve) {
            require(['./views/paidCouponDetail.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'paidCoupon',
        name: 'paidCoupon',
        meta: { checkLogin: false },
        component: function (resolve) {
            require(['./views/paidCoupon.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'collect',
        name: 'collect',
        meta: { checkLogin: true },
        component: function (resolve) {
            require(['./views/collect.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'contacts',
        name: 'contacts',
        meta: { checkLogin: true },
        component: function (resolve) {
            require(['./views/contacts.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'techReward',
        name: 'techReward',
        meta: { checkLogin: true },
        component: function (resolve) {
            require(['./views/techReward.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'info',
        name: 'info',
        meta: { checkLogin: true },
        component: function (resolve) {
            require(['./views/info.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'picture',
        name: 'picture',
        meta: { checkLogin: true },
        component: function (resolve) {
            require(['./views/picture.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'integralDetail',
        name: 'integralDetail',
        meta: { checkLogin: true },
        component: function (resolve) {
            require(['./views/integralDetail.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'integral',
        name: 'integral',
        meta: { checkLogin: true },
        component: function (resolve) {
            require(['./views/integral.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'integralExplain',
        name: 'integralExplain',
        meta: { checkLogin: false },
        component: function (resolve) {
            require(['./views/integralExplain.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'suggestions',
        name: 'suggestions',
        meta: { checkLogin: true },
        component: function (resolve) {
            require(['./views/suggestions.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'qrPayCode',
        name: 'qrPayCode',
        meta: { checkLogin: true },
        component: function (resolve) {
            require(['./views/qrPayCode.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'tradeRecords',
        name: 'tradeRecords',
        meta: { checkLogin: true },
        component: function (resolve) {
            require(['./views/tradeRecords.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'treat',
        name: 'treat',
        meta: { checkLogin: true },
        component: function (resolve) {
            require(['./views/treat.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'recharge',
        name: 'recharge',
        meta: { checkLogin: true },
        component: function (resolve) {
            require(['./views/recharge.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'treatExplain',
        name: 'treatExplain',
        meta: { checkLogin: false },
        component: function (resolve) {
            require(['./views/treatExplain.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'treatRecords',
        name: 'treatRecords',
        meta: { checkLogin: true },
        component: function (resolve) {
            require(['./views/treatRecords.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'treatDetail',
        name: 'treatDetail',
        meta: { checkLogin: true },
        component: function (resolve) {
            require(['./views/treatDetail.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'bindPhone',
        name: 'bindPhone',
        meta: { checkLogin: false },
        component: function (resolve) {
            require(['./views/bindPhone.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'inviteCode',
        name: 'inviteCode',
        meta: { checkLogin: false },
        component: function (resolve) {
            require(['./views/inviteCode.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'hourTicketList',
        name: 'hourTicketList',
        meta: { checkLogin: false },
        component: function (resolve) {
            require(['./views/hourTicketList.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'serviceGroup',
        name: 'serviceGroup',
        meta: { checkLogin: false },
        component: function (resolve) {
            require(['./views/serviceGroup.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'member',
        name: 'member',
        meta: { checkLogin: false },
        component: function (resolve) {
            require(['./views/member.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'qrPay',
        name: 'qrPay',
        meta: { checkLogin: true },
        component: function (resolve) {
            require(['./views/qrPay.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'qrPayComplete',
        name: 'qrPayComplete',
        meta: { checkLogin: true },
        component: function (resolve) {
            require(['./views/qrPayComplete.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'follow9358',
        name: 'follow9358',
        meta: { checkLogin: false },
        component: function (resolve) {
            require(['./views/follow9358.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'plumflowers',
        name: 'plumflowers',
        meta: { checkLogin: false },
        component: function (resolve) {
            require(['./views/plumflowers.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'robProjectDetail',
        name: 'robProjectDetail',
        meta: { checkLogin: false },
        component: function (resolve) {
            require(['./views/robProjectDetail.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'robProjectSuccess',
        name: 'robProjectSuccess',
        meta: { checkLogin: false },
        component: function (resolve) {
            require(['./views/robProjectSuccess.vue'], resolve)
        }
    },
    {
        path: prefixPath + 'clubList',
        name: 'clubList',
        meta: { checkLogin: false },
        component: function (resolve) {
            require(['./views/clubList.vue'], resolve)
        },
        children: [
            {
                path: 'nearby',
                name: 'clubList-nearby',
                meta: { checkLogin: false },
                component: function (resolve) {
                    require(['./views/clubList-nearby.vue'], resolve)
                }
            },
            {
                path: 'all',
                name: 'clubList-all',
                meta: { checkLogin: false },
                component: function (resolve) {
                    require(['./views/clubList-all.vue'], resolve)
                }
            },
            {
                path: 'search',
                name: 'clubList-search',
                meta: { checkLogin: false },
                component: function (resolve) {
                    require(['./views/clubList-search.vue'], resolve)
                }
            }
        ]
    }
]

// 用于跳转
pageRouterOption.push({
    path: !isClubMode ? '/:clubId/*' : '/clubList/*', component: switchComponent
})

// 其他链接
pageRouterOption.push({
    path: '/', redirect: { name: isClubMode ? 'home' : 'clubList' }
})
pageRouterOption.push({
    path: '*', redirect: { name: isClubMode ? 'home' : 'clubList' }
})

console.dir(pageRouterOption)

if (isClubMode) { // 设置嵌套路由
    clubPageRouterOption.push({
        name: 'app',
        path: '/' + _global.clubId,
        component: {
            template: '<router-view></router-view>'
        },
        children: pageRouterOption
    })
}

// 路由配置
var router = new VueRouter({
    linkActiveClass: 'active',
    routes: isClubMode ? clubPageRouterOption : pageRouterOption
})

// 加载页面之前
router.beforeEach(function (to, from, next) {
    // 在已登录状态下，按返回键返回到的页面为 login 或 confirmLogin 页面时，拒绝此次切换，再次调用 history.back()
    if (_global.isLogin && /^(login|confirmLogin)$/.test(to.name)) {
        next(false)
        if (to.name === 'login') router.go(-1)
        else router.go(-2)
        return
    }
    if (_global.canShowLoading) {
        _global.loading = true
    } else {
        _global.canShowLoading = true
    }
    // 检测登录
    if (to.meta.checkLogin) {
        if (!(_global.isLogin && _global.token)) {
            Global.login(null, to.name)
            return next({ name: 'login' })
        }
    }

    var currPage = _global.currPage
    currPage.query = to.query
    currPage.name = to.name

    var lastPage = _global.lastPage
    lastPage.name = from.name
    lastPage.query = from.query

    _global.showAppMenu = isClubMode && /^(home|message|order|personal|technicianList)$/.test(to.name)
    _global.show9358Menu = !isClubMode && /(clubList|message|personal)/.test(to.name)
    next()
})

// 加载页面之后
router.afterEach(function (to) {
})

Global.init().then(function () {
    /* eslint-disable no-new */
    new Vue({router, render: h => h(App)}).$mount('#app')
})
