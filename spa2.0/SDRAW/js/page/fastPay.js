(function () {
    var moneyInput = $(".center-wrap>input"),
        techId = $.param('techId'),
        clubId = "",
        payAuthCode = $.param('code') || $.getUrlParam('code') || $.$.payAuthCode,
        paramData = $.sessionStorage('fast-pay-param'),
        confirmBtn = $(".bottom-wrap>div:nth-of-type(2)>div:nth-of-type(2)"),
        doc = document,
        mTop = 0,
        bottomWrap = $(".bottom-wrap");

    $.$.payAuthCode = payAuthCode;

    if($.$.accessMenus.fastPayRecords.isOff){
        $.page("fastPayError&info="+encodeURIComponent("在线买单功能已关闭！"))
        return
    }

    if(!techId){
        $.tipShow("缺少页面访问参数！");
        $.pageCancel();
    }

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
                state: 'fast-pay'
            },
            success: function (res) {
                if (res.statusCode == 200){
                    initPage();
                }else if(res.statusCode == '935801'){
                    $.getOauthCode('','9358','fast-pay','base');
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

    // 点击取消按钮
    $(".bottom-wrap>div:nth-of-type(2)>div:nth-of-type(1)").Click(function(){
        $.page("comment&techId="+techId+"&type=tech&from=fastPay")
    })

    // 点击确定按钮
    confirmBtn.Click(function(){
        if(!$.$.ua.isWX){
            $.tipShow("请在微信中打开！")
        } else {
            var money = moneyInput.Value();
            if(!money){
                return $.tipShow("请输入消费金额！")
            }
            if(parseFloat(money)<0.001){
                return $.tipShow("买单金额不能为0！")
            }
            if(!(parseFloat(money)<5000.001)){
                return $.tipShow("单笔支付请不要超过5000元！")
            }
            if(confirmBtn.ClassHave('processing')){
                return $.tipShow('支付中，请稍候...');
            }
            confirmBtn.Class('processing').Text("支付中...");
            $.ajax({
                url: "../api/v2/wx/pay/fast_pay/save",
                isReplaceUrl : true,
                type: "post",
                data: {
                    amount: money * 100,
                    clubId: clubId,
                    techId: techId
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
                                function (res) {
                                    confirmBtn.ClassClear('processing');
                                    if (res.err_msg && res.err_msg.indexOf("ok")>=0) {//支付成功之后
                                        $.tipShow("支付成功！");
                                        $.page("comment&techId="+techId+"&type=tech&from=fastPay")
                                    }
                                    else{
                                        confirmBtn.Text('确认');
                                        $.tipShow("未能成功支付！");
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
                        $.sessionStorage('fast-pay-param',money);
                        $.getOauthCode('','9358','fast-pay','base');
                    } else{
                        $.tipShow(res.msg || "支付失败！");
                        confirmBtn.ClassClear('processing').Text('确定');
                    }
                },
                error : function(){
                    $.tipShow('请求支付失败！');
                    confirmBtn.ClassClear('processing').Text('确定');
                }
            })
        }
    })

    function initPage(){
        // 获取技师信息
        $.ajax({
            url: "../api/v2/club/fastpay/tech/get",
            isReplaceUrl : true,
            data: {
                techId: techId
            },
            success: function(res){
                if(res.statusCode == 200){
                    res = res.respData;
                    $('.top-wrap>div.name').Html(res.techName+(res.techNo ? "<span>"+res.techNo+"</span>" : ""));
                    $('.top-wrap>div.header').CSS("background-image","url("+(res.avatarUrl || $.$.defaultHeader)+")");
                    clubId = res.clubId;

                    mTop = $.$.winHeight/(16*$.$.scale)-24.4444
                    bottomWrap.ClassClear("fixed")
                    bottomWrap.CSS("margin-top",mTop+"rem");

                    $.pageSwitch();
                    if(paramData){
                        moneyInput[0].value = paramData;
                        confirmBtn[0].click()
                    }
                } else {
                    var errorInfo = res.msg || "未能获取到技师信息！";
                    $.tipShow(errorInfo)
                    $.page("fastPayError&info="+encodeURIComponent(errorInfo))
                }
            }
        })
    }

    // 限定输入整数或者两位小数
    moneyInput.Event("input",function(e, item){
        var val = item.value;
        if(val.length == 1){
            if(/\D/.test(val)){
                val = ""
            }
        } else{
            val = val.replace(/[^\d.]/g,"")
            var dotIndex = 0
            val = val.replace(/\./g,function(){
                if(dotIndex == 0){
                    dotIndex = arguments[1]
                    return "."
                } else {
                    return ""
                }
            })
            if(dotIndex>0){
                val = val.substring(0,dotIndex+3)
            }
        }
        if(val.length>7){
            val = val.substr(0,7)
        }
        item.value = val;
    })

    moneyInput.Event("focus",function(){
        $(".top-wrap").Class("act")
        bottomWrap.CSS("margin-top",(mTop+3)+"rem")
    })
    moneyInput.Event("blur",function(){
        $(".top-wrap").ClassClear("act")
        bottomWrap.CSS("margin-top",mTop+"rem")
    })
})();