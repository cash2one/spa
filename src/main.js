/**
 * main.js
 */
import Vue from 'vue';
import VueRouter from 'vue-router';
import VueResource from 'vue-resource';
import App from './app.vue';
import Env from './config/env';
import { Global } from './libs/global';
import { IM } from './libs/im';

Vue.use(VueRouter);
Vue.use(VueResource);
Vue.http.options.emulateJSON = true;

Global.init();
var _global = Global.data, isClubMode = _global.pageMode == "club";
window["spa"] = _global;
window["im"] = IM;

//设置vue-resource的inteceptor
Vue.http.interceptors.push(function(request,next){
    //console.log("vue-request："+JSON.stringify(request));

    ///设置全局的请求参数
    if(request.method.toLowerCase() == "get"){
        var params = request.params;
        params["_"] = (+new Date());///时间戳
        params["sessionType"] = _global.sessionType;
        if(!params["token"]){
            params["token"] = _global.token;
        }
    }
    else{
        var body = request.body;
        body["sessionType"] = _global.sessionType;
        if(!body["token"]){
            body["token"] = _global.token;
        }
    }

    ///回调响应函数之前的处理
    next(function(response){
        return response;
    });
});

//对于有:club参数的路径，对应的name是页面名称,否则加$(公众号模式)
var pageRouterList = [
    'home',                         //会所首页
    'message',                     //消息列表
    'technicianList',              //技师列表
    'technicianDetail',          //技师详情
    'order',                          //订单列表
    'personal',                     //个人中心
    'clubProfile',                  //会所简介
    'promotions',                 //优惠活动
    'serviceList',                   //服务项目列表
    'serviceItem',                 //服务项目详情
    'map',                            //会所地址
    'comment',                     //技师评论
    'review',                          //技师评论列表
    'technicianImg',              //技师相册
    'chat',                             //聊天页面
    'login',                             //登录
    'confirmLogin',                 //确认登录
    'recoverPassword',            //找回密码
    'register',                          //注册
    'promotionsActivity',          //会所活动详情
    'accountDetail',                 //个人账户
    'account',                          //个人账户
    'integralDetail',                 //积分中心
    'integral',                          //
    'coupon',                          //我的优惠券
    'couponDetail',                 //优惠券详情
    'confirmOrder',                 //预约页面
    'paidCouponDetail',           //点钟券详情
    'paidCoupon',                   //点钟券
    'collect',                            //技师收藏
    'contacts',                         //最近联系人
    'techReward',                    //打赏技师
    'info',                                //用户信息
    'picture',                           //用户修改头像
    'integralDetail',                 //积分中心详情
    'integral',                          //积分中心--所有账户
    'integralExplain',               //积分规则说明
    'suggestions',                    //投诉建议
    'qrPayCode',                          //我的账户-付款二维码
    'tradeRecords',                       //我的账户--交易记录
    'treat',                                    //我的账户--交易记录
    'recharge',                               //我的账户--充值
    'treatExplain',                           //我的账户--请客说明
    'treatRecords',                          //我的账户--请客记录
    'treatDetail',                             //我的账户--请客详情
    'bindPhone',                            //绑定手机
    'inviteCode',                            //输入邀请码
    'hourTicketList',                       //点钟券列表页
    'serviceGroup',                          //服务列表
    'member',                                  //会员活动
    'qrPay',                                     //支付
    'qrPayComplete'                      //支付完成
];

var pageRouterOption = [];          //构造router的map选项
var pageName;
function RouterOption(path,name){
    this.path = path;
    this.name = name;
    this.component = function(resolve){
        require(['./views/'+name+'.vue'], resolve);
    }
}
for(var i=0;i<pageRouterList.length;i++){
    pageName = pageRouterList[i];
    if(!isClubMode){
        pageRouterList[i] = "/"+pageRouterList[i];
    }
    pageRouterOption.push(new RouterOption(pageRouterList[i],pageName));
}
var clubPageRouterOption = [];
if(isClubMode){//设置嵌套路由
    clubPageRouterOption.push({
        name : "app",
        path : "/"+_global.clubId,
        component : {
            template : "<router-view></router-view>"
        },
        children : pageRouterOption
    });
}

// 路由配置
var router = new VueRouter({
    linkActiveClass : 'active',
    routes : isClubMode ? clubPageRouterOption : pageRouterOption
});

console.log("router obj：");
console.dir(router);

router.beforeEach(function (to,from,next) {
    _global.currPageParams = to.params;
    _global.currPageQuery = to.query;
    _global.showAppMenu = /(home|message|order|personal|technicianList)/.test(to.name);
    next();
});

router.afterEach(function (to) {

});

new Vue({ router, render : h => h(App) }).$mount("#app");