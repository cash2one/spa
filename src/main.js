/**
 * main.js
 */
import Vue from 'vue';
import VueRouter from 'vue-router';
import VueResource from 'vue-resource';
import App from './app.vue';
import Env from './config/env';
import { Global } from './libs/global';

Vue.use(VueRouter);
Vue.use(VueResource);
Vue.config.debug = true; // 开启debug模式
Vue.http.options.emulateJSON = true;

Global.init();
var _global = Global.data;

window["spa"] = _global;

//设置vue-resource的inteceptor
Vue.http.interceptors.push(function(request,next){
    //console.log("vue-request："+JSON.stringify(request));

    ///设置全局的请求参数
    if(request.method.toLowerCase() == "get"){
        request.params["_"] = (+new Date());///时间戳
        request.params["sessionType"] = _global.sessionType;
        request.params["token"] = _global.token;
    }
    else{
        request.body["sessionType"] = _global.sessionType;
        request.body["token"] = _global.token;
    }

    ///回调响应函数之前的处理
    next(function(response){
        return response;
    });
});

// 路由配置
var router = new VueRouter({
    // 是否开启History模式的路由,默认开发环境开启,生产环境不开启。如果生产环境的服务端没有进行相关配置,请慎用
    history: Env != 'production'
});

//对于有:club参数的路径，对应的name是页面名称,否则加$(公众号模式)
var pageRouterList = [
    '/:club/home',                         //会所首页
    '/:club/message',                     //消息列表
    '/message',
    '/:club/technicianList',              //技师列表
    '/:club/technicianDetail',          //技师详情
    '/technicianDetail',
    '/:club/order',                          //订单列表
    '/:club/personal',                     //个人中心
    '/:club/clubProfile',                  //会所简介
    '/:club/promotions',                 //优惠活动
    '/:club/serviceList',                   //服务项目列表
    '/:club/serviceItem',                 //服务项目详情
    '/:club/map',                            //会所地址
    '/:club/comment',                     //技师评论
    '/comment',
    '/:club/review',                          //技师评论列表
    '/review',
    '/:club/technicianImg',              //技师相册
    '/technicianImg',
    '/:club/chat',                             //聊天页面
    '/chat',
    '/:club/login',                             //登录
    '/login',
    '/:club/confirmLogin',                 //确认登录
    '/confirmLogin',
    '/:club/recoverPassword',            //找回密码
    '/recoverPassword',
    '/:club/register',                          //注册
    '/register',
    '/:club/promotionsActivity',          //会所活动详情
    '/:club/accountDetail',                 //个人账户
    '/:club/account',                          //个人账户
    '/account',
    '/:club/integralDetail',                 //积分中心
    '/:club/integral',                          //
    '/integral',
    '/:club/coupon',                          //我的优惠券
    '/coupon',
    '/:club/couponDetail',                 //优惠券详情
    '/couponDetail',
    '/:club/confirmOrder',                 //预约页面
    '/confirmOrder',
    '/:club/paidCouponDetail',           //点钟券详情
    '/paidCouponDetail',
    '/:club/paidCoupon',                   //点钟券
    '/paidCoupon',
    '/:club/collect',                            //技师收藏
    '/collect',
    '/:club/contacts',                         //最近联系人
    '/contacts',
    '/:club/info',                                //用户信息
    '/info',
    '/:club/picture',                           //用户修改头像
    '/picture',
    '/:club/integralDetail',                 //积分中心详情
    '/integralDetail',
    '/:club/integral',                          //积分中心--所有账户
    '/integral',
    '/:club/integralExplain',               //积分规则说明
    '/integralExplain',
    '/:club/suggestions',                    //投诉建议

    '/:club/qrPayCode',                          //我的账户-付款二维码
    '/qrPayCode',
    '/:club/tradeRecords',                       //我的账户--交易记录
    '/tradeRecords',
    '/:club/treat',                                    //我的账户--交易记录
    '/treat',
    '/:club/recharge',                               //我的账户--充值
    '/recharge',
    '/:club/treatExplain',                           //我的账户--请客说明
    '/treatExplain',
    '/:club/treatRecords',                          //我的账户--请客记录
    '/treatRecords',
    '/:club/treatDetail',                             //我的账户--请客详情
    '/treatDetail',
    '/:club/bindPhone',                            //绑定手机
    '/bindPhone',
    '/:club/inviteCode',                            //输入邀请码
    '/inviteCode',
    '/:club/hourTicketList',                       //点钟券列表页
    '/hourTicketList',
    '/:club/serviceGroup',                          //服务列表
    '/:club/member'                                  //会员活动
];

var pageRouterOption = {};          //构造router的map选项
var pageName;
function RouterOption(name,componentName){
    this.name = name;
    this.component = function(resolve){
        require(['./routers/'+componentName+'.vue'], resolve);
    }
}
for(var i=0;i<pageRouterList.length;i++){
    pageName = pageRouterList[i].substr(pageRouterList[i].lastIndexOf("/")+1);
    pageRouterOption[pageRouterList[i]] = new RouterOption(( /:club/.test(pageRouterList[i]) ? "" : "$") + pageName,pageName);
}

//配置路由
router.map(pageRouterOption);

router.beforeEach(function (transition) {
    //window.scrollTo(0, 0);
    _global.currPageParams = transition.to.params;
    _global.currPageQuery = transition.to.query;

    var _AppMenu = document.querySelector("#menu-container");
    if(/(home|message|order|personal|technicianList)/.test(transition.to.name)){
        _AppMenu.style.display = "block";
    }
    else{
        _AppMenu.style.display = "none";
    }
    transition.next()
});

router.afterEach(function (transition) {

});

router.redirect({
    '*': "/home"
});

router.start(App, '#app');