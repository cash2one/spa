(function () {
    var cardId = $.param("id"),
        clubId = $.param("clubId") || $.$.clubID || "",
        techId = $.param("techId") || "",
        k,
        periodObj = { 'Y': '年', 'M': '月', 'D': '日' },
        $packageTitle,
        $packageContent,
        payAuthCode = $.param('code') || $.getUrlParam('code') || $.$.payAuthCode,
        paramData = $.sessionStorage('once-card-pay-param'),
        doc = document,
        confirmBtn = $("#footer"),
        payBtn = $("#footer>div");

    if(!cardId || !clubId){
        $.pageCancel();
        return $.tipShow("页面缺少访问参数！")
    }
    $.$.payAuthCode = payAuthCode;

    if(paramData && payAuthCode){
        $.ajax({
            url: "../wx/oauth2/user/openid",
            isReplaceUrl : true,
            type:'post',
            data: {
                code: $.$.payAuthCode,
                scope: 'snsapi_base',
                wxmp: '9358',
                userType: 'user',
                state: 'once-card-pay'
            },
            success: function (res) {
                if (res.statusCode == 200){
                    initPage();
                } else if(res.statusCode == '935801'){
                    $.getOauthCode('','9358','once-card-pay','base');
                }
                else {
                    $.tipShow(res.msg || "获取openId失败！");
                    return $.pageCancel();
                }
            }
        })
    } else {
        initPage();
    }

    // 点击购买按钮
    confirmBtn.Click(function(){
        if(payBtn.ClassHave("notPay")){
            $.page("discountMall")
            return ;
        }
        if(!$.$.ua.isWX){
            $.tipShow("请在微信中打开！")
        } else {
            var selectedPackageId = $(".package-title>li.active").Attr("planId");
            if(!selectedPackageId){
                return $.tipShow("未选择套餐！")
            }
            if(payBtn.ClassHave('processing')){
                return $.tipShow('购买中，请稍候...');
            }
            payBtn.Class('processing').Text("购买中...");
            $.ajax({
                url: "../api/v2/wx/pay/once_card/save",
                isReplaceUrl : true,
                type: "post",
                data: {
                    clubId: clubId,
                    techId: techId,
                    itemPlanId: selectedPackageId
                },
                success: function(res){
                    if(res.statusCode == 200){
                        res = JSON.parse(res.respData)

                        function onBridgeReady() {
                            WeixinJSBridge.invoke(
                                'getBrandWCPayRequest', {
                                    "appId": res.appId,
                                    "timeStamp": res.timeStamp+"",
                                    "nonceStr": res.nonceStr,
                                    "package": res.package,
                                    "signType": res.signType,
                                    "paySign" : res.paySign
                                },
                                function (payRes) {
                                    payBtn.ClassClear('processing');
                                    if (payRes.err_msg && payRes.err_msg.indexOf("ok")>=0) {//支付成功之后
                                        $.tipShow("支付成功！");
                                        $.page("onceCardOrders")
                                    }
                                    else{
                                        payBtn.Text('购买');
                                        $.tipShow("未能成功支付！");

                                        $.ajax({
                                            url: "../api/v2/wx/pay/activity/payment/cancel",
                                            isReplaceUrl : true,
                                            type: "post",
                                            data: { payId: res.payId },
                                            success: function(){}
                                        })
                                    }
                                });
                        }

                        if (typeof WeixinJSBridge == "undefined") {
                            if (doc.addEventListener) {
                                doc.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
                            } else if (doc.attachEvent) {
                                doc.attachEvent('WeixinJSBridgeReady', onBridgeReady);
                                doc.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
                            }
                        } else {
                            onBridgeReady();
                        }
                    } else if(res.statusCode == '935801'){
                        $.sessionStorage('once-card-pay-param',$(".package-title>li.active").Attr("data-index"));
                        $.getOauthCode('','9358','once-card-pay','base');
                    } else{
                        $.tipShow(res.msg || "支付失败！");
                        payBtn.ClassClear('processing').Text('购买');
                    }
                },
                error : function(){
                    $.tipShow('请求支付失败！');
                    payBtn.ClassClear('processing').Text('购买');
                }
            })
        }
    })

    // 获取次卡详情
    function initPage(){
        $.ajax({
            url: "../api/v2/club/item_card/activity/detail",
            data: {
                activityId: cardId,
                clubId: clubId
            },
            isReplaceUrl : true,
            success: function(res){
                if(res.statusCode == 200){
                    res = res.respData;
                    clubId = res.clubId;
                    var actData = res.activity, actItemData = res.item, plans = actData.itemCardPlans;

                    // 设置会所信息
                    $(".banner>div>div").CSS("background-image","url("+(res.clubImageUrl || $.$.defaultClubLogo)+")");
                    $(".banner>div>span").Text(res.clubName);

                    // 设置banner图
                    $(".banner").CSS("background-image","url("+actData.imageUrl+")");

                    // 设置次卡名
                    $(".service-wrap>div")[0].innerHTML = actData.name+"<span>"+actItemData.duration+actItemData.durationUnit+"</span>";

                    // 设置有效期
                    actData.period = actData.period.replace(/(Y|M|D)/g,function(){
                        if(periodObj[arguments[0]]) {
                            return periodObj[arguments[0]]
                        }
                        return arguments[0]
                    })
                    $(".pay>div:nth-of-type(3)>strong").Text(actData.period+"内");

                    // 设置说明文字
                    $(".pay>div:nth-of-type(5)").Html(actData.description || "无");

                    // 设置相关项目
                    $(".service>div.service-item>div:nth-of-type(1)").CSS("background-image","url("+(actItemData.imageUrl || $.$.defaultService)+")");
                    $(".service>div.service-item>div:nth-of-type(2)").Text(actItemData.name);
                    $(".service>div.service-item>div:nth-of-type(3)").Html(actItemData.price+"元/"+actItemData.duration+actItemData.durationUnit+(actItemData.pricePlus ? "<span>加钟</span>"+actItemData.pricePlus+"元/"+actItemData.durationPlus+actItemData.durationUnitPlus : ""))
                    $(".service>div.service-item").Click(function(){
                        $.page("serviceItem&id="+actItemData.id)
                    })

                    actItemData.price = parseFloat(actItemData.price);
                    // 设置套餐信息
                    var planTitleStr = "", planContentStr = "", plan, originAmount, optimalPlan;
                    for(k=0; k<plans.length; k++){
                        plan = plans[k];
                        if (plan.optimal == "Y") {
                            optimalPlan = plan
                        }
                        originAmount = actItemData.price*(plan.paidCount+plan.giveCount);
                        plan.originAmount = originAmount*100;
                        planTitleStr += "<li planId='"+plan.id+"' data-index='"+k+"' class='"+(plan.optimal=="Y" ? "active best" : "")+"'>买<span>"+plan.paidCount+"</span>送<span>"+plan.giveCount+"</span></li>";
                        planContentStr += "<li class='"+(plan.optimal=="Y" ? "active" : "")+"'>\
                                                     <div>"+actItemData.name+"<span>"+actItemData.price+"元/次</span><span>"+(plan.paidCount+plan.giveCount)+"次</span></div>\
                                                     <div>¥<b>"+(plan.actAmount/100).toFixed(2)+"</b><span>¥"+originAmount.toFixed(2)+"</span><span>每次立减"+((originAmount-plan.actAmount/100)/(plan.giveCount+plan.paidCount)).toFixed(2)+"元</span></div>\
                                                    </li>";
                    }
                    $(".service-wrap>ul.package-title").Html(planTitleStr)
                    $(".service-wrap>ul.package-content").Html(planContentStr)

                    // 切换套餐显示
                    $packageTitle = $(".service-wrap>ul.package-title>li");
                    $packageContent = $(".service-wrap>ul.package-content>li");
                    $packageTitle.Click(function(e,item){
                        if(!item.classList.contains("active")){
                            var itemIndex = item.getAttribute("data-index");
                            $packageTitle.ClassClear("active")
                            $packageContent.ClassClear("active")
                            item.classList.add("active");
                            $packageContent[itemIndex].classList.add("active");
                        }
                    })

                    // 点击会所title
                    $(".banner>div").Click(function(){
                        if($.$.clubID && $.$.clubID == clubId){
                            $.page("home")
                        } else if(clubId){
                            location.href = location.origin+"/spa-manager/spa2/?club="+clubId+"#home";
                        }
                    })

                    if(actData.statusName == "已售完" || actData.statusName == "已过期" ){
                        payBtn.Class("notPay")
                        payBtn.Text("逛商城、找优惠")
                        $(".service").Class("notPay")
                        if(actData.statusName == "已售完"){
                            confirmBtn.Class("sellOut")
                        } else {
                            confirmBtn.Class("expired")
                        }
                    }

                    //分享设置
                    if ($.$.ua.isWX) {
                        var discount = ((optimalPlan.actAmount/optimalPlan.originAmount)*10).toFixed(1)
                        $.X5Config({
                            "title": actData.name,
                            "desc": actItemData.name+"_"+discount+"折_（买"+optimalPlan.paidCount+"送"+optimalPlan.giveCount+"）",
                            "link": location.href.split("?")[0] + "?club=" + clubId + "#onceCardDetail&id=" + cardId+(techId ? "&techId="+techId : ""),
                            "imgUrl": (res.clubImageUrl || $.$.defaultClubLogo)
                        });
                    }

                    $.pageSwitch(false);

                    if(paramData){
                        $packageTitle[paramData-0].click();
                        confirmBtn[0].click();
                    }
                } else {
                    $.tipShow(res.msg || "获取次卡详情失败！");
                    $.pageCancel();
                }
            }
        })
    }
})();