import Vue from 'vue';
import Util from "../libs/util";
import { IM } from "../libs/im";

/**
 * 全局的数据
 * */
exports.Global = {
    data : {
        baseWidth : null,                           //页面加载时窗口初始宽度，用于计算页面 scale
        winWidth : null,                             //页面内容容器的当前宽度--固定20rem
        winHeight : null,                            //页面的高度
        winScale : 1,                                   //页面当前的font scale

        currPage : {                                   //当前页面信息
            name : "",
            query : null
        },

        showAppMenu : false,                   //是否显示底部菜单--club模式下
        show9358Menu : false,                  //9358公众号模式下
        loading : false,                               //loading效果
        pageMode : 'club',                         //当前模式，club--会所网站 9358--公众号
        sessionType : 'web',                        //sessionType
        token : '',                                        //用户token
        userId : '',
        userAvatar : '',
        userHeader : '',
        userTel : '',
        userName : '',
        loginName : '',
        isTelephoneUser : false,
        isLogin : false,                                //用户是否登录
        loginPage : '',                                 //登录之后跳转的页面
        loginPageQuery : {},                       //登录之后跳转的页面参数

        authCode : '',
        loginChanel : '',
        openId : '',
        nickName : '',
        headerImgUrl : '',
        clubInviteCode : "",
        techSerialNo : "",
        techInviteCode : "",

        currLngx : "",
        currLaty : "",

        userAgent : {                                   //浏览器UA
            isWX : false,
            isiPhone : false
        },

        defaultClubLogo : 'images/home/logo_default.jpg',                       //默认的club logo
        defaultHeader : 'images/home/header_default.jpg',                       //默认的头像
        defaultTechName : "小摩豆技师",                                                   //默认的技师名字
        defaultName : '匿名用户',                                                               //默认的名称
        defaultBannerImgUrl : 'images/home/banner_default.jpg',             //默认的banner图
        defaultServiceItemImgUrl : "images/home/serviceItem_default.jpg",//默认的服务项目图
        defaultGiftImg : "images/chat/gift_default.png",                              //默认的积分礼物图片
        loadError : "数据请求失败！",
        visitError : "页面缺少访问参数！",

        clubId : null,                                                                               //当前会所ID
        clubLogoUrl : null,                                                                      //当前会所logo
        clubName : "",                                                                            //当前会所名称
        clubTelephone : [],                                                                      //当前会所联系电话

        clubCfg : {                                                                           //当前会所的一些配置信息、开关
            accountSwitch : null, //账户系统
            creditSwitch : false, //积分系统是否开启
            diceGameTimeout : 24*60*60*1000, //骰子游戏超时时间
            diceGameSwitch : false,//骰子游戏是否开启
            paidCouponSwitch : false,//点钟券
            paidCouponFee : 0, //点钟券手续费
            paidOrderSwitch : false,//付费预约开关
            paidOrderFee : 0//付费预约手续费
        },

        techList : [],                                                                                 //暂存的技师列表页面数据
        techListID : {},                                                                              //暂存的技师列表ID值
        pageData : {}                                                                               //缓存(在内存)的页面数据，切换回来的时候可以恢复状态
    },
    beforeInit : function(){
        var ua = navigator.userAgent.toLowerCase(),
            _this = this,
            data = _this.data,
            userAgent = data.userAgent;

        userAgent.isWX = /micromessenger/.test(ua);
        userAgent.isiPhone = /iPhone/i.test(ua);

        /////////////////////获取clubID
        var tArr = location.href.toString().match(/\/(\d{18,18})\/?/);
        if(tArr && tArr[1]){
            data.pageMode = 'club';
            data.clubId = tArr[1];
        }
        else{
            data.pageMode = "9358";
        }
        console.log("init club id："+data.clubId);
    },
    /*
     * 初始化一些数据
     */
    init : function(resolve, reject){
        var _this = this,
            data = _this.data;

        ////////////////////
        data.token = Util.localStorage("token") || Util.localStorage("userToken");
        data.userId = Util.localStorage("userID");
        data.userHeader = Util.localStorage("userHeader") || data.defaultHeader;
        data.userAvatar = Util.localStorage("userAvatar");
        data.userTel = Util.localStorage("userTel");
        data.userName = Util.localStorage("userName") || data.defaultName;
        data.loginName = Util.localStorage("userLoginName");

        /////check login
        if(data.token){
            Vue.http.get("../api/v1/check_login/"+data.sessionType+"/"+data.token).then(function(res){
                res = res.body;
                if(res.msg != "Y"){
                    _this.clearLoginInfo();
                }
                else{
                    ///////
                    IM.id = Util.md5(data.userId);
                    IM.password = IM.id;
                    IM.userId = data.userId;
                    IM.header = data.userHeader;
                    IM.avatar = data.userAvatar;
                    IM.name = (data.userName == data.defaultName && data.userTel) ? data.defaultName + "(" + data.userTel.substr(0, 3) + "****" + data.userTel.slice(-4) + ")" : data.userName;
                    IM.createConn();///创建环信连接

                    data.isLogin = true;
                    _this.updateUserNameAndHeader();
                }
                resolve();
            });
        }
        else{
            resolve();
        }

        //加载会所的基本信息
        if(data.clubId){
            Vue.http.get('../api/v2/club/'+data.clubId+'/clubName').then((res)=>{
                res = res.body;
                data.clubLogoUrl = res.logo || '';
                data.clubName = res.name;
                data.clubTelephone = res.telephone ? res.telephone.split(',') : [];
            })
        }

        //////添加Object.assign 方法，合并两个对象
        if (!Object.assign) {
            Object.defineProperty(Object, "assign", {
                enumerable: false,
                configurable: true,
                writable: true,
                value: function(target, firstSource) {
                    if (target === undefined || target === null) return;
                    var to = Object(target);
                    for (var i = 1; i < arguments.length; i++) {
                        var nextSource = arguments[i];
                        if (nextSource === undefined || nextSource === null) continue;
                        var keysArray = Object.keys(Object(nextSource));
                        for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                            var nextKey = keysArray[nextIndex];
                            var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                            if (desc !== undefined && desc.enumerable) to[nextKey] = nextSource[nextKey];
                        }
                    }
                    return to;
                }
            });
        }

        ////////////////////////////////
        IM.global = _this.data;
    },
    /*
     * 删除用户登录信息
     */
    clearLoginInfo : function(){
       var _this = this, data = _this.data;
        data.isLogin = false;

        data.token = "";
        data.userId = "";
        data.userHeader = "";
        data.userAvatar = "";
        data.userTel = "";
        data.userName = "";
        data.loginName = "";

        Util.removeLocalStorage("token");
        Util.removeLocalStorage("userID");
        Util.removeLocalStorage("userHeader");
        Util.removeLocalStorage("userAvatar");
        Util.removeLocalStorage("userTel");
        Util.removeLocalStorage("userName");
        Util.removeLocalStorage("userLoginName");
    },
    /*
     * 获取会所的开关信息
     */
    getClubSwitches : function(clubId,callback){
        var _this = this;
        clubId = clubId || _this.data.clubId;

        Vue.http.get("../api/v2/user/switches",{ params : { clubId : clubId }}).then(function(res){
            res = res.body;
            if(res.statusCode == 200){
                res = res.respData;
                var cfg = (clubId == _this.data.clubId ? _this.data.clubCfg : {} ) ;

                cfg.accountSwitch = (res.account.switch == "on");
                cfg.creditSwitch = (res.credit.systemSwitch == "on" && res.credit.clubSwitch == "on");
                cfg.diceGameSwitch = (cfg.creditSwitch && res.credit.diceGameSwitch == "on");
                if(cfg.diceGameSwitch) cfg.diceGameTimeout = res.credit.gameTimeoutSeconds * 1000;

                cfg.paidCouponSwitch = (res.paidCoupon.couponSwitch == "on");
                if(cfg.paidCouponSwitch) cfg.paidCouponFee = res.paidCoupon.couponPlatformFee;

                cfg.paidOrderSwitch = (res.paidOrder.switch == "on");
                if(cfg.paidOrderSwitch) cfg.paidOrderFee = res.paidOrder.platformFee;

                if(callback) callback(cfg);
            }
        });
    },
    /*
     * 获取当前用户积分
     */
    getCreditAccount : function(clubId,callback){
        var _this = this;
        clubId = clubId || _this.data.clubId;
        Vue.http.get("../api/v2/credit/user/account",{ params : { clubId : clubId , userType : "user" }}).then(function(res){
            res = res.body;
            if(res.statusCode == 200){
                if(callback) callback(res.respData);
            }
        });
    },
    /*
     * 更新用户的名称和头像
     */
    updateUserNameAndHeader : function(){
        var _this = this, data = _this.data;
        if(data.token){
            Vue.http.get("../api/v2/profile/user/info/view").then(function(res){
                res = res.body;
                if(res.statusCode == 200){
                    res = res.respData;
                    data.userAvatar = res.avatar || "";
                    data.userName = res.name || data.defaultName;
                    data.userHeader = res.avatarUrl || data.defaultHeader;

                    Util.localStorage("userName",data.userName);
                    Util.localStorage("userAvatar",data.userAvatar);
                    Util.localStorage("userHeader",data.userHeader);
                }
            });
        }
    },
    /*
     * 设置分享配置
     */
    shareConfig : function(option){
        var win = window, wx = win["wx"], _this = this;
        if (!wx) return;
        option = option || {};
        if (wx["signReady"]) {
            if (option.title) {
                wx.hideMenuItems({ menuList : ['menuItem:copyUrl']});
                wx.showAllNonBaseMenuItem();
                wx.onMenuShareAppMessage(option);//分享给朋友
                wx.onMenuShareTimeline(option);//分享到朋友圈
                wx.onMenuShareQQ(option);//分享到QQ
                wx.onMenuShareWeibo(option);//分享到腾讯微博
                wx.onMenuShareQZone(option);//分享到QQ空间
            }
            else {
                wx.hideAllNonBaseMenuItem();//屏蔽分享菜单
            }
        }
        else {
            win["requestSignCount"] = 2;
            _this.weiXinCfgSignature(option);
        }
    },
    weiXinCfgSignature : function(option){
        var signUrl = "",///////////////////////////
            win = window, wx = win["wx"], _this = this;

        Vue.http.get("../api/v1/wx/sign",{ params : {
            url : encodeURIComponent(signUrl),
            sessionType : "9358"
        }}).then(function(res){
            res = res.body;
            wx.config({
                debug: false,
                appId: res.appId,
                timestamp: res.timestamp,
                nonceStr: res.nonceStr,
                signature: res.signature,
                jsApiList: [ 'onMenuShareAppMessage','onMenuShareTimeline','onMenuShareQQ','onMenuShareWeibo','onMenuShareQZone','hideAllNonBaseMenuItem','showAllNonBaseMenuItem','hideMenuItems']
            });

            if (!win["wxError"]) {
                win["wxError"] = true;
                wx.error(function () {/////////////微信分享配置失败
                    wx["signReady"] = false;
                    win["requestSignCount"]--;
                    if (win["requestSignCount"] != 0) _this.weiXinCfgSignature();
                });
            }

            if (!win["wxReady"]) {
                win["wxReady"] = true;
                wx.ready(function (){
                    wx["signReady"] = true;
                    _this.shareConfig(option);
                });
            }
        });
    },

    checkAccess : function(fun){
        return true;
    },

    bindTelPhone : function(){

    },

    loginParams : function(page){
        var _this = this.data;
        _this.loginPage = page;
        _this.loginPageQuery = {};
        for(var item in _this.currPage.query){
            _this.loginPageQuery[item] = _this.currPage.query[item];
        }
    },

    getOauthCode : function(pageUrl, sessionType, state, scope, msg, errorCallBack, isReplaceUrl){
        var loc = location, _this = this;
        window.URL = window.URL || window.webkitURL;
        scope = ( scope == "base" ? "snsapi_base" : "snsapi_userinfo" );
        var _tmpSearch = loc.search;
        if(isReplaceUrl){
            pageUrl = new URL(pageUrl);
            _tmpSearch = pageUrl.search;
        }
        if (/_t=(\d*)/g.test(_tmpSearch)) {
            _tmpSearch = _tmpSearch.replace(/_t=(\d*)/g, function () {
                return "_t=" + (+new Date());
            });
        } else {
            _tmpSearch = (_tmpSearch || "")+ '&_t=' + (+new Date());
        }
        if(isReplaceUrl !== true){
            pageUrl = loc.origin + loc.pathname + _tmpSearch + loc.hash + (loc.hash ? (pageUrl.indexOf('&') == 0 ? pageUrl : (pageUrl ? '/' + pageUrl : '')) : pageUrl);
        }else{
            pageUrl = pageUrl.origin + pageUrl.pathname + _tmpSearch + pageUrl.hash;
        }
        if (!/_offline_notice/.test(pageUrl)) {
            pageUrl = pageUrl.replace(/(&|\?)code=[\da-zA-Z]+(&?)/g, function (v1, v2, v3) {
                return v2 == '?' ? ( v3 ? '?' : '') : ( v3 ? '&' : '' );
            });
        }
        pageUrl = pageUrl.replace(/(&|\?)state=[\da-zA-Z_\-]+(&?)/g, function (v1, v2, v3) {
            return v2 == '?' ? ( v3 ? '?' : '') : ( v3 ? '&' : '' );
        });

        Vue.http.get("../api/v2/wx/oauth2/code",{ params : {
            wxmp : sessionType,
            state : state,
            pageUrl : encodeURIComponent(pageUrl),
            scope : scope
        }
        }).then(function(res){
            res = res.body;
            if(res && res.statusCode == 200){
                loc.href = res.respData;
            }
            else{
                if (errorCallBack) {
                    errorCallBack(res);
                } else {
                    _this.tipShow(msg || res.msg || "请求微信授权失败！");
                }
            }
        });
    },

    getOpenId : function(resolve,reject){
        //Vue.http.get("../api/v2/wx/oauth2/openid",{ })
    }
};
