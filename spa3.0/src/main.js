/**
 * main.js
 */
import Vue from 'vue'
import VueRouter from 'vue-router'
import VueResource from 'vue-resource'
import App from './app.vue'
import { Global } from './libs/global'
import { IM } from './libs/im'
import Util from './libs/util'

Vue.use(VueRouter)
Vue.use(VueResource)
Vue.http.options.emulateJSON = true

Global.beforeInit()
var _global = Global.data

window['spa'] = _global // 调试用，代码中勿使用
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

// 页面列表，true表示需要checkLogin
var pageRouterList = {
    'home': '',                         // 会所首页
    'message': true,                // 消息列表
    'technicianList': '',             // 技师列表
    'technicianDetail': '',          // 技师详情
    'order': true,                     // 订单列表
    'orderDetail': true,            // 订单详情
    'personal': '',                      // 个人中心
    'clubProfile': '',                   // 会所简介
    'promotions': '',                  // 优惠活动
    'serviceList': '',                    // 服务项目列表
    'serviceItem': '',                  // 服务项目详情
    'map': '',                            // 会所地址
    'comment': '',                     // 技师评论
    'review': '',                          // 技师评论列表
    'technicianImg': '',              // 技师相册
    'chat': true,                         // 聊天页面
    'login': '',                             // 登录
    'confirmLogin': '',                // 确认登录
    'recoverPassword': '',           // 找回密码
    'register': '',                         // 注册
    'promotionsActivity': '',        // 会所活动详情
    'accountDetail': true,           // 个人账户
    'account': true,                    // 个人账户
    'coupon': true,                     // 我的优惠券
    'couponDetail': true,            // 优惠券详情
    'confirmOrder': '',                 // 预约页面
    'paidCouponDetail': '',           // 点钟券详情
    'paidCoupon': '',                   // 点钟券
    'collect': true,                        // 技师收藏
    'contacts': true,                     // 最近联系人
    'techReward': true,                // 打赏技师
    'info': true,                            // 用户信息
    'picture': true,                        // 用户修改头像
    'integralDetail': true,              // 积分中心详情
    'integral': true,                       // 积分中心--所有账户
    'integralExplain': '',                  // 积分规则说明
    'suggestions': true,                 // 投诉建议
    'qrPayCode': true,                   // 我的账户-付款二维码
    'tradeRecords': true,                // 我的账户--交易记录
    'treat': true,                             // 我的账户--交易记录
    'recharge': true,                       // 我的账户--充值
    'treatExplain': '',                        // 我的账户--请客说明
    'treatRecords': true,                  // 我的账户--请客记录
    'treatDetail': true,                      // 我的账户--请客详情
    'bindPhone': '',                           // 绑定手机
    'inviteCode': '',                           // 输入邀请码
    'hourTicketList': '',                      // 点钟券列表页
    'serviceGroup': '',                        // 服务列表
    'member': '',                               // 会员活动
    'qrPay': '',                                    // 支付
    'qrPayComplete': '',                     // 支付完成
    'follow9358': '',
    'plumflowers': '',                         // 一元夺
    'robProjectDetail': '',                    // 抢购项目详情
    'robProjectSuccess': true,                 // 抢购项目成功
    'clubList': {                                  // 会所列表，配置子页面
        children: ['clubList-nearby', 'clubList-all', 'clubList-search']
    }
}

var isClubMode = _global.pageMode === 'club'
var pageRouterOption = [] // 构造router
var prefixPath = isClubMode ? '' : '/'
var clubPageRouterOption = []
var itemContent
var optionItem
var switchComponent = {
    template: '<div></div>',
    created: function () {
        location.reload(true)
    }
}

function RouterOption (path, name, isCheckLogin) {
    this.path = path
    this.name = name
    this.meta = { checkLogin: isCheckLogin }
    this.component = function (resolve) {
        require(['./views/' + name + '.vue'], resolve)
    }
}

for (var pageName in pageRouterList) {
    itemContent = pageRouterList[pageName]
    optionItem = new RouterOption(prefixPath + pageName, pageName, !!itemContent)
    if (itemContent && itemContent.children) {
        optionItem.children = [] // 增加子页面配置
        itemContent.children.forEach(function (subPage) {
            optionItem.children.push(new RouterOption(subPage.split('-')[1], subPage, false))
        })
    }
    pageRouterOption.push(optionItem)
}

// 用于跳转
pageRouterOption.push({
    path: !isClubMode ? '/:clubId/*' : '/clubList/*', component: switchComponent
})

// 其他链接
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

    // 检测登录
    if (to.meta.checkLogin) {
        if (!(_global.isLogin && _global.token)) {
            Global.loginParams(to.name)
            return next({ name: 'login' })
        }
    }

    var currPage = _global.currPage
    currPage.query = to.query
    currPage.name = to.name
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
