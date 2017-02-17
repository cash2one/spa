require.config({
    baseUrl : "club-admin/compressed/js/",
    paths : {
        avalon : "lib/avalon",
        domReady : "lib/domReady",
        mmHistory : "lib/mmHistory",
        mmRouter : "lib/mmRouter",
        css : "lib/css",
        jquery : "lib/jquery-1.12.4.min",
        util : "common/util",
        jsAddress : "common/jsAddress",
        moment : "common/moment.min",
        daterangepicker : "common/daterangepicker",
        qrcode : "common/jquery.qrcode",
        jqform : "common/jquery.form.min",
        highcharts : "common/highcharts",
        kindeditor:"common/kindeditor/kindeditor-min",
        kindeditor_zhCn:"common/kindeditor/lang/zh_CN",
        area : "common/area",
        dragsort : "common/jquery.dragsort-0.5.2.min",
        colorbox : "common/jquery.colorbox-min",
        cropper : "common/cropper.min",
        jszip : "common/jszip.min",
        fileSaver : "common/FileSaver.min",
        amap : "http://webapi.amap.com/maps?v=1.3&key=f71d6fc056a3ab4cab5229aeebef1c0c&plugin=AMap.Geocoder"
    },
    shim : {
        avalon : { exports : "avalon" },
        mmHistory : { deps : ["avalon"] },
        mmRouter : { deps : ["avalon"] },
        util : { deps : ["jquery"] },
        daterangepicker : { deps : ["jquery","moment"] },
        qrcode : { deps : ["jquery"] },
        jqform : { deps : ["jquery"] },
        highcharts : { deps : ["jquery"] },
        dragsort : { deps : ["jquery"] },
        colorbox : { deps : ["jquery"] },
        kindeditor_zhCn : { deps : ["kindeditor"] },
        cropper : { deps : ["jquery"] }
    }
});

///////////////////全局变量的存储
window.$$= {
    rootVm : null, /////顶层vm
    currPath : null, //////用于设置当前访问的位置
    menuCodeObj : {},
    exportCard: false // 是否导出微信推送消息上的图片到zip
};

require(["mmHistory","mmRouter","util","domReady!"], function() {

    /////////////////////////////////////////////设置当前路径
    $$.currPath = $("div#info>div.path>span:eq(1)");
    var sysPath = $("div#info>div.path>span:eq(0)");

    /////////////////////////////////////////////当前日期
    var currDate = new Date(),
        month = currDate.getMonth()+ 1,
        date = currDate.getDate(),
        weekObj = ['日', '一', '二', '三', '四', '五', '六'],
        currDateStr = currDate.getFullYear()+"年"+(month>9 ? month : "0"+month)+"月"+(date>9 ? date : "0"+date )+"日 星期"+weekObj[currDate.getDay()],
        integralAppCountNotice,
        defaultPath = "";

    //////////////////////////////////////////////////左侧菜单点击伸展、收缩
    $("#menu").on("click","div>div",function(){
        var $this = $(this),
            $list = $this.siblings("ul"),
            isSlideDown = !$list.is(":visible");
        $list.slideToggle(300);
        if(isSlideDown){///////其他区域需要slideUp
            /*var slideUpList = $this.parent().siblings("div:not(.fixed)").find("ul:visible");
            slideUpList.slideUp();
            slideUpList.siblings("div").removeClass('active')*/
        }
        $this.toggleClass("active")
        $$.rootVm.integrationExpand = ($list.parent().attr("nav")=="integrationSystem" && isSlideDown);
        refreshIntegralAppCountNotice();
    });

    function refreshIntegralAppCountNotice(){
        integralAppCountNotice.removeClass("active");
        if($$.rootVm.exchangeAppCount>0){
            if(!$$.rootVm.integrationExpand){
                $(integralAppCountNotice[0]).addClass("active").text($$.rootVm.exchangeAppCount);
            }
            else{
                $(integralAppCountNotice[1]).addClass("active").text($$.rootVm.exchangeAppCount);
            }
        }
    }

    ///////////////////////////////////////////define RootVM
    $$.maskPage = $("#globalMask");
    $$.rootVm = avalon.define({
        $id : "indexCtrl",
        pageUrl : "./home",
        page : "home",
        currTime : currDate.getTime(),
        currDateStr : currDateStr,
        sysNoticeCount : 0,
        feedBackCount : 0,
        exchangeAppCount : 0,////积分兑换申请数量
        integrationSwitchOpened : false,////会所是否开启积分系统-----控制积分系统菜单
        integrationExpand : false,////积分系统模块是否展开
        shopsAdmin : false,/////多店查看的进入浏览-----控制账号中心菜单
        doClickOfToolBtn : function(pageUrl){
            location.href= "#!/"+pageUrl;
        },
        doClickLogout : function(){////退出系统
            $.ajax({
                url : "logout",
                dataType : "text",
                success : function(){
                    location.href = "./login";//////跳转到登录
                    location.reload();
                }
            });
        },
        getMessageCount : function(){
            $.ajax({
                url : "messageCount",
                success : function(res){
                    if(res && res.data){
                        $$.rootVm.sysNoticeCount = res.data.messageCount;
                        $$.rootVm.feedBackCount = res.data.feedbackCount;
                    }
                }
            });
            ///////////////////////积分兑换申请
            $.ajax({
                url : "club/credit/exchange/applications/count",
                success : function(appRes){
                    if(appRes.statusCode==200){
                        $$.rootVm.exchangeAppCount = appRes.respData.submitCount;
                        refreshIntegralAppCountNotice();
                    }
                }
            });
        }
    });
    var i,
        allMenu,
        pageMenu = {////配置各个页面对应的主菜单
            orderList : "home", ///订单列表---首页
            noticeList : "home", ///系统通知---首页
            feedbackList : "home", ///用户反馈---首页
            fastPaySetting : "home", ///在线买单设置
            fastPayRecords : "home", ///在线买单记录
            messageSellGroups : "messageSell", ////短信营销--分组管理
            messageSellGroupDetail : "messageSell", ////短信营销--分组详情
            messageSellDetail : "messageSell", ////短信营销--短信详情
            messageSellSendDetail : "messageSell", ////短信营销--短信发送记录
            editOrdinaryCoupon : "ordinaryCouponSell", /////优惠券编辑或者添加
            registeredUserList : "registeredDataStatistics",//////数据统计-注册用户列表
            couponGetRecord : "ordinaryCouponDataStatistics",////////优惠券领取记录
            couponRewardDetail : "ordinaryCouponDataStatistics",////////优惠券提现记录
            couponUseRecord : "ordinaryCouponDataStatistics", ///优惠券使用记录
            couponDataDetail : "ordinaryCouponDataStatistics", ////优惠券数据详情
            paidOrderDailyData : "paidOrderDataStatistics", ////付费预约--每日数据
            paidCouponCanUseDetail : "paidCouponDataStatistics",/////点钟券未使用详情
            paidCouponSellDetail : "paidCouponDataStatistics",//////点钟券购买详情
            paidCouponUseDetail : "paidCouponDataStatistics",//////点钟券使用详情
            paidCouponExpireDetail : "paidCouponDataStatistics",//////点钟券过期详情
            clubServiceDetail : "clubServiceSetting",//////服务项目详情
            techDetail : "techList",//////服务项目详情
            techEdit : "techList",//////技师编辑
            customerList : "historyTech", //客户列表
            customerDetail : "historyTech", //客户详情
            historyTechDetail : "historyTech", //离职技师详情
            subAccountList : "accountCenter",//////会所子账号
            clubBriefDetail : "clubBriefSetting",//////会所简介的新建或者编辑
            accountDataDetail:"accountDataStatistics",//////充值记录详情
            scanPayDataDetail:"scanPayDataStatistics",/////扫码支付详情
            techCouponRecord : "techCouponWithdrawals",//////技师优惠券账户明细
            robProjectPaidRecords: "robProject",/////抢购详情--购买记录
            memberDataDetail:"memberDataStatistics",//////充值记录详情
            techExportQrCode: "techList", //////技师导出二维码
            massMessage: "massMessageSendRecord", //////群发消息
            paidOrderChartData: "paidOrderDataStatistics", //// 付费预约统计数据图表页面
            accountInfoDetail: "accountInfo", //// 结算中心-账户金额详情
        	oneYuanSellRecords:"oneYuan",   ///////一元夺
            dialSellRecord:"luckyWheel",   ///////大转盘详情
            makeMessageCard: 'accountCenter', // 更新公众号扫码消息推送技师会所卡片
            rewardSetting: 'accountCenter', // 打赏设置
            checkInfoRecords: 'home', // 核销记录
            onceCardEdit: 'onceCards' // 次卡编辑
        },
        pageMapping = {},
        pageTimestamp = {};

    $("#menu").on("click","div>ul>li>a",function(){
        location.hash = "#!/"+$(this).parent().attr("nav");
    });

    /////////////////////////////////////////////////ajax全局设置
    var paramObj = {}, pageParam = getParamObj();
    var paramToken = pageParam["cid"] || iSessionStorage("cid") || "";
    if(paramToken){
        paramObj.token = paramToken;
        iSessionStorage("cid",paramToken);
        ////////////////////////////////////////屏蔽一些菜单
        $$.rootVm.shopsAdmin = true;
    }

    ///////////////////////////////////////////////////
    var reloadCount = iSessionStorage("reloadCount"),
        lastReloadTime = iSessionStorage("lastReloadTime");
    $.ajaxSetup({
        type : "get",
        dataType : "json",
        data : paramObj,
        cache : false,
        complete : function(xhr){/////全局的处理
            if(xhr.status == 401 || xhr.status == 302){
               if(!lastReloadTime || !reloadCount){
                    lastReloadTime = (+new Date());
                    reloadCount = 1;
                }
                else{
                    lastReloadTime = lastReloadTime-0;
                    reloadCount = reloadCount -0;
                    if((+new Date())-lastReloadTime>1000){
                        lastReloadTime = (+new Date());
                        reloadCount = 1;
                    }
                    else{
                        reloadCount++;
                    }
                }

                iSessionStorage("reloadCount",reloadCount);
                iSessionStorage("lastReloadTime",lastReloadTime);
                if(reloadCount<5){
                    location.href = "./login";//////跳转到登录
                    location.reload();
                }
                else{
                    $("#reload-info").addClass("active");
                }
            }
        }
    });

    avalon.router.get("/*path", function(){//劫持url hash并触发回调
        var currPath = this.path;
        if(/^(\/|\/index|\/home)$/.test(this.path)){
            currPath = defaultPath;
        }
        var page = $$.rootVm.page = currPath.split("&")[0].replace(/\//, "");
        if( /@/.test(page) || (!pageMenu[page] && pageMapping[page]==undefined)) return;
        allMenu.removeClass("active");
        var thisMenu = allMenu[pageMapping[(pageMenu[page] || page)]] || allMenu[0];
        thisMenu.className = "active";
        var pMenu = $(thisMenu).parent("ul");
        if(pMenu.is(":hidden")){
            pMenu.siblings("div").click();
        }
        if(!pageTimestamp[page] || this.query.noRefresh !="true") pageTimestamp[page] = (+new Date());
        if(window.refreshFastPayDataTimer) clearInterval(window.refreshFastPayDataTimer)
        $$.rootVm.pageUrl = "club-admin/compressed/tpl/"+page + ".tpl.html?"+pageTimestamp[page];  //动态修改pageUrl属性值

        //////////////////////////////////////////////////////设置路径
        var topNavText = pMenu.siblings("div").html();
        topNavText = topNavText.indexOf("<i")>0 ? topNavText.slice(0,topNavText.indexOf("<i")) : topNavText;

        var thisMenuNav = thisMenu.getAttribute("nav"),
            thisMenuText = $(thisMenu).children("a").text(),
            sysPathStr = "";
        if(topNavText) sysPathStr = topNavText +" >> ";
        sysPathStr += "<a"+(thisMenuNav ? " href='#!\/"+thisMenuNav+"'" : "" )+">"+thisMenuText+"</a>";
        if(thisMenuNav != page){
            sysPathStr += " >> ";
            $$.currPath.show();
        }
        else{
            $$.currPath.hide();
        }
        sysPath.html(sysPathStr);
    });

    ////////////////////////////////////////////////调整内容高度
    var $win = $(window),
        $content = $("#content");
    $win.on("resize",function(){ doResize() });
    function doResize(){
        var h = $win.height()-108;
        $content.height(h+"px");
        $("#menu").height(h+"px");
        $("#pageContent").height((h-20)+"px");
    }
    doResize();

    //==== 注册一过滤器：分转元，保留两位小数 ====
    avalon.filters.bizMoneyToYuan = function (str) {
        return ((str - 0)/100).toFixed(2);
    };

    // 四舍五入取整
    avalon.filters.toRoundInt = function (val) {
        return Math.round(val);
    };

    ////////////////////////////////////////菜单权限
    $.ajax({
        url : "api/v2/manager/current/menu/list",
        //url : "club-admin/json/menu.json",
        data : {
            platform : "ADMIN_PC"
        },
        success : function(res){
            if(res.statusCode == 200){
                /*var accessIds = res.respData.switchOffResourcesIds || [],accessObj={};
                accessIds.forEach(function (v) {
                    accessObj[v] = true;
                });*/
                res = res.respData;
                var menuHtml = "",k,n,menuAuthObj = {};
                for(k=0;k<res.length;k++){
                    /*console.log(res[k].id,accessObj[res[k].id]);
                    if(accessObj[res[k].id]){
                        continue;
                    }*/

                    menuAuthObj[res[k]["code"]] = true;
                    $$.menuCodeObj[res[k]["code"]] = res[k]["id"];
                    menuHtml += "<div nav='"+res[k]["code"]+"'"+(!res[k]["children"] ? " class='fixed'" : "")+/*(res[k]["code"]=="integrationSystem"||res[k]['code'] == 'memberAccount'?' style="display:none;"':'')+*/">";
                    if(!res[k]["children"] && !/@/.test(res[k]["code"])){
                        pageMenu[res[k]["code"]] = res[k]["code"];
                        if(!defaultPath){
                            defaultPath = res[k]["code"];
                        }
                        menuHtml +="<div class='hide'></div>\
                                               <ul>\
                                                   <li nav='"+res[k]["code"]+"'><a>"+res[k]["name"]+"</a></li>\
                                               </ul>\
                                            </div>";
                    }
                    else{
                        menuHtml +="<div";
                        if(res[k]["code"]=="integrationSystem"){
                            menuHtml +=">"+res[k]["name"]+"<i class='integralAppCountNotice'></i>";
                        }else{
                            menuHtml +=">"+res[k]["name"];
                        }

                        if(res[k]["children"]){
                            menuHtml +="</div><ul style='display: none'>";
                            for(n=0;n<res[k]["children"].length;n++){
                                menuAuthObj[res[k]["children"][n]["code"]] = true;
                                $$.menuCodeObj[res[k]["children"][n]["code"]] = res[k]["children"][n]["id"];
                                pageMenu[res[k]["children"][n]["code"]] = res[k]["children"][n]["code"];
                                if(!defaultPath){
                                    defaultPath = res[k]["children"][n]["code"];
                                }

                                /*if(res[k]["children"][n]["code"]=="memberDataStatistics"){
                                    menuHtml += "<li nav='"+res[k]["children"][n]["code"]+"' style='display:none;'><a>"+res[k]["children"][n]["name"]+"</a>";
                                }else{
                                    menuHtml += "<li nav='"+res[k]["children"][n]["code"]+"'><a>"+res[k]["children"][n]["name"]+"</a>";
                                }*/
                                menuHtml += "<li nav='"+res[k]["children"][n]["code"]+"'><a>"+res[k]["children"][n]["name"]+"</a>";
                                if(res[k]["children"][n]["code"]=="integrationExchangeList"){
                                    menuHtml +="<i class='integralAppCountNotice' style='left:150px;top:12px;'></i>";
                                }
                                menuHtml +="</li>";
                            }
                            menuHtml +="</ul></div>";
                        }
                        else{
                            menuHtml +="</div></div>";
                        }
                    }
                }

                $("#menu").html(menuHtml);
                allMenu = $("#menu>div>ul>li");
                integralAppCountNotice = $("i.integralAppCountNotice");
                for(i=0;i<allMenu.length;i++){
                    pageMapping[allMenu[i].getAttribute("nav")] = i;
                }

                /////控制顶部右侧账号中心
                if($$.rootVm.shopsAdmin==false && menuAuthObj["accountCenter"]){
                    $("header>div.tool>div:eq(1)").show();
                }

                ///////////////////////////////////////////获取当前会所信息
                $.ajax({
                    url : "profile/data",
                    success : function(res){
                        if(res.statusCode == 200){
                            res = res.respData;
                            $$.clubId = res.club.clubId;
                            $$.userId = res.account.id;
                            $$.clubName = res.club.name;
                            $("div#info>div.club").text($$.clubName);
                            var logoImg = $("body>header>div.logo>img")[0];
                            logoImg.onerror = function(){
                                this.src = "./club-admin/img/common/logo.png";
                            };
                            logoImg.src = $$.clubLogo = res.club.imageUrl;

                            ///////////////////////////////////////////会所的积分系统开关
                            /*$.ajax({
                                url: "club/credit/switch/status",
                                data: { clubId: $$.clubId },
                                success: function (result) {
                                    if (result.statusCode == 200 && result.respData.systemSwitch == "on") {
                                        $("#menu>div[nav=integrationSystem]>div").css("display","block");
                                    }
                                }
                            })*/
                            /*$.ajax({
                                url : "api/v2/user/switches",
                                isReplaceUrl : true,
                                data : {
                                    clubId : $$.clubId
                                },
                                success : function(switchRes){
                                    if(switchRes.statusCode == 200){
                                        switchRes = JSON.parse(JSON.stringify(switchRes.respData).replace(/"on"/g,1).replace(/"off"/g,0));
                                        if(switchRes.account.switch){
                                            $("#menu>div[nav=memberAccount]").css("display","block");
                                            $('#menu>div>ul>li[nav=memberDataStatistics]').css("display","block");
                                        }
                                        if(switchRes.credit.systemSwitch){
                                            $("#menu>div[nav=integrationSystem]").css("display","block").find('>div').css("display","block");
                                        }
                                    }
                                }
                            });*/

                            ////////////////////////////////////////
                            avalon.history.start(); //历史记录堆栈管理
                            avalon.scan(document.body);//scan

                            setInterval(function(){ $$.rootVm.getMessageCount() },60*1000);////定时查询
                            setTimeout(function(){
                                $$.rootVm.getMessageCount();
                            },3000)

                        }
                    }
                });
            }
        }
    });
});