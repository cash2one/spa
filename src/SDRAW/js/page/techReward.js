(function () {
    var techId = $.param("techId"),
        commentId = $.param("commentId"),
        paramData = $.localStorage('tech-reward-param'),
        backIndex = $.localStorage('backIndex'),
        payAuthCode = $.param("code") || $.getUrlParam('code'),
        giftNotEnoughTip = $("#giftNotEnoughTip"),
        giftNeedCount = $("#giftNotEnoughTip>div>div.tip>span"),
        payBtn = $("#content>div:nth-of-type(4)"),
        clubId = $.$.clubID,
        inReward = false,
        currIntegralAccount=0;
    if (!techId) {
        $.tipShow("技师不存在！");
        return $.pageCancel();
    }
    if(backIndex){
        $.localStorageClear('backIndex');
        $("#title>div:nth-of-type(2)").Click(function(event){
            event.stopImmediatePropagation();
            $.page();
        });
    }else if($.param("backPublic")=="true"){
        $("#title>div:nth-of-type(2)").Click(function(event){
            event.stopImmediatePropagation();
            history.back();
        });
    }else{
        $("#title>div:nth-of-type(2)").Click(function(event){
            event.stopImmediatePropagation();
            $.page();
        });
    }
    var techInfo;//技师的信息
    doInitPage();

   if(payAuthCode && paramData){
        $.ajax({
            url: ($.$.clubID ? "../" : "")+"../wx/oauth2/user/openid",
            type:'post',
            data: {
                code : payAuthCode,
                scope : 'snsapi_userinfo',
                wxmp : '9358',
                userType : 'user',
                state : 'tech-reward'
            },
            success: function (result) {
                if (result.statusCode == 200){
                    $.localStorageClear('tech-reward-param');
                    doInitPage();
                }else if(result.statusCode == '935801'){
                    $.localStorage('tech-reward-param', parseInt($("#content>div:nth-of-type(3)>div.active")[0].innerHTML) || 0);
                    $.getOauthCode('','9358','tech_reward','userInfo');
                }
                else {
                    $.tipShow(result.msg || "获取openId失败！");
                    return $.pageCancel();
                }
            }
        });
    }

    function doInitPage() {
        var rewardList = $("#content>div.reward-list"),
            rewardPop = $("#reward-pop"),
            k;
        rewardList.Delegate("click",">div",function(e,item){
            if(!/active/.test(item.className)){
                $("#content>div.reward-list>div").ClassClear("active");
                item.classList.add("active");
            }
        });

        $("#content>div:nth-of-type(4)").Click(function() {
            rewardPop.Class("active");
        });

        //点击"确认打赏"
        payBtn.Click(function () {
            var selectItem = $("#content>div:nth-of-type(3)>div.active"),
                itemValue = parseInt(selectItem.Attr("v"));
            if(selectItem.ClassHave("money")){//金钱打赏
                doReward(itemValue,'money');
            }
            else{
                if(currIntegralAccount<itemValue){//积分不足
                    giftNeedCount.Text(itemValue);
                    giftNotEnoughTip.Class("active");
                }
                else{
                    doReward(itemValue,'gift',selectItem.Attr("gift-id"),selectItem.Attr("gift-name"));
                }
            }
        });

        $.ajax({//获取技师信息
            url:  '../api/v2/club/technician/'+ techId,
            isReplaceUrl: true,
            success: function (data) {
                techInfo = data["info"];
                techInfo.emchatId = data.emchatId;
                techInfo.clubName = data['clubName'];
                clubId =techInfo.clubId;
                if(paramData){
                    var _index = { 1 : 1, 2 : 2, 8 : 3, 20 : 4 }[paramData];
                    $("#content>div:nth-of-type(3)>div:nth-of-type("+_index+")")[0].click();
                    $.localStorageClear('tech-reward-param');
                    doReward(paramData);
                }
                $.pageSwitch(true,false);

                ///////////////////////////////////////////获取积分礼物
                $.ajax({
                    url: "../api/v2/credit/switch/status",
                    isReplaceUrl: true,
                    data: { clubId: clubId },
                    success: function (switchRes) {
                        switchRes = switchRes.respData;
                        if (switchRes && switchRes.clubSwitch == "on") {
                            $.ajax({
                                url: "../api/v2/credit/gift/list",
                                isReplaceUrl: true,
                                success: function (giftRes) {
                                    giftRes = giftRes.respData;
                                    if (giftRes && giftRes.length>0) {
                                        var giftHtmlStr = "";
                                        for(k=0;k<giftRes.length;k++){
                                            giftHtmlStr += "<div class='gift' v='"+giftRes[k]["ratio"]+"' gift-id='"+giftRes[k]["id"]+"' gift-name='"+giftRes[k]["name"]+"'><div><img src='"+giftRes[k]["iconUrl"]+"'></div><div>"+giftRes[k]["ratio"]+"积分</div></div>";
                                        }
                                        rewardList[0].innerHTML += giftHtmlStr;
                                    }
                                }
                            });
                            ///////////////////////////获取当前账户积分
                            $.ajax({
                                url : "../api/v2/credit/user/account",
                                isReplaceUrl : true,
                                data : {
                                    clubId : clubId,
                                    userType : "user"
                                },
                                success : function(res){
                                    if(res.statusCode == 200) {
                                        res = res.respData;
                                        currIntegralAccount = (res && res[0] ? res[0].amount : 0);
                                    }
                                }
                            });

                            /////////////////////////////////////////////////////
                            $("#giftNotEnoughTip>div>div.btn>div.get").Click(function(){
                                $.page("integralExplain");
                            });
                            $("#giftNotEnoughTip>div>div.btn>div.cancel").Click(function(){
                                giftNotEnoughTip.ClassClear("active");
                            });
                        }
                    }
                })
            }});
    }

    function doReward(val,type,giftId,giftName) {
        if(inReward) return;
        inReward = true;
        if(val == 0){
            $.$.afterReward = true;//弹出感谢话语
            $.$.afterRewardInfo = techInfo;
            backIndex ? $.page() : ($.param("backPublic")=="true" ? history.back() : history.go(-2));
            return;
        }
        payBtn.Class('disabled');
        payBtn.Text('打赏中...');

        if(type=="gift"){
            $.ajax({
                url: "../api/v2/credit/gift/send",
                isReplaceUrl: true,
                data: {
                    clubId: clubId,
                    emchatId: techInfo.emchatId,
                    giftId: giftId,
                    num: 1
                },
                success: function (res) {
                    if (res.statusCode == 200) {
                        /////发送一条礼物消息给技师
                        var eb = $.$.easemob;
                        if (eb.userId && !eb.conn.isOpened()) {
                            var waitEasemobInit = setInterval(function () {//等待环信登录
                                if (eb.conn.isOpened()){
                                    clearInterval(waitEasemobInit);
                                    sendRewardMsg(val,"gift",giftId,giftName);
                                }
                            }, 10);
                        }
                        else {
                            sendRewardMsg(val,"gift",giftId,giftName);
                        }
                    }
                }
            });
        }
        else{
            $.ajax({
                url: "../api/v2/wx/pay/user_reward",
                type: 'post',
                isReplaceUrl: true,
                data: {
                    consumeMoney: val,
                    openId: $.$.payOpenId,
                    clubId: clubId,
                    consumeType: "user_reward",
                    consumeChanel: "user_reward",
                    techId: techId,
                    prePayId: $.$.prePayId || '',
                    paySessionType : "9358_fw",
                    commentId:commentId
                },
                success: function (result) {
                    if (result.statusCode == 200) {
                        $.$.prePayId = result.respData.package.split("=")[1];
                        $.localStorage("prePayId", $.$.prePayId);

                        function onBridgeReady() {
                            WeixinJSBridge.invoke(
                                'getBrandWCPayRequest', {
                                    "appId": result.respData.appId,     //公众号名称，由商户传入
                                    "timeStamp": result.respData.timeStamp+""  ,  //时间戳，自1970年以来的秒数
                                    "nonceStr": result.respData.nonceStr, //随机串
                                    "package": result.respData.package,
                                    "signType": result.respData.signType,   //微信签名方式
                                    "paySign" : result.respData.paySign
                                },
                                function (res) {
                                    inReward = false;
                                    payBtn.ClassClear('disabled');
                                    payBtn.Text('打赏');
                                    if (res.err_msg.indexOf("ok")>=0) {
                                        $.ajax({
                                            url : ($.$.clubID ? "../" : "")+'../wx/pay/pay_result',
                                            type : 'post',
                                            data : { prePayId : $.$.prePayId },
                                            success : function(){
                                                /////发送一条打赏消息给技师
                                                var eb = $.$.easemob;
                                                if (eb.userId && !eb.conn.isOpened()) {
                                                    var waitEasemobInit = setInterval(function () {//等待环信登录
                                                        if (eb.conn.isOpened()){
                                                            clearInterval(waitEasemobInit);
                                                            sendRewardMsg(val,'money');
                                                        }
                                                    }, 10);
                                                }
                                                else {
                                                    sendRewardMsg(val,'money');
                                                }
                                            }
                                        });
                                    }// res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠
                                    else{
                                        $.tipShow("未能成功支付！");
                                    }
                                });
                        }

                        if (typeof WeixinJSBridge == "undefined") {
                            if (document.addEventListener) {
                                document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
                            } else if (document.attachEvent) {
                                document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
                                document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
                            }
                        } else {
                            onBridgeReady();
                        }
                    }else if(result.statusCode =='935801'){
                        $.localStorage('tech-reward-param', val);
                        $.getOauthCode('','9358','tech-reward','userInfo');
                    }
                    else {
                        inReward = false;
                        payBtn.ClassClear('disabled');
                        payBtn.Text('打赏');
                        $.tipShow(result.msg || "支付失败！");
                    }
                }
            });
        }
    }

    function sendRewardMsg(val,type,giftId,giftName){
        $.$.afterReward = true;//弹出感谢话语
        $.$.afterRewardInfo = techInfo;

        var chatHeader = $.$.userHeader,
            chatName =  ($.$.userName == $.$.defaultUserName ? $.$.defaultUserName + "(" + $.$.userTel.substr(0, 3) + "****" + $.$.userTel.slice(-4) + ")" : $.$.userName ),
            eb = $.$.easemob;

        //保存-存储
        var msgObj = {
            from: $.$.easemob.userId,
            to: techInfo.emchatId,
            data: "",
            ext: {
                name: techInfo.name,
                header: techInfo.avatarUrl,
                avatar: techInfo.avatar,
                no: techInfo.serialNo,
                techId: techId,
                clubId: clubId,
                msgType: ""
            }
        };

        if(type == "money"){
            msgObj.data = "<i></i>打赏：<span>"+val+"</span>元";
            msgObj.ext.msgType = "reward";
        }
        else{
            msgObj.data = "[礼物："+giftName+"]";
            msgObj.ext.msgType = "gift";
            msgObj.ext.giftValue = val+"";
            msgObj.ext.giftName = giftName;
            msgObj.ext.giftId = giftId;
        }

        var sendFailTimer = setTimeout(function(){
            msgObj.status = 0;
            afterSend();
        },5000);

        if(eb.conn.isOpened()){
            var extObj = {
                name: chatName, header: chatHeader, msgType: msgObj.ext.msgType, time: Date.now() , avatar : $.$.userAvatar
            };
            if(type == "gift"){
                extObj.giftValue = val+"";
                extObj.giftName = giftName;
                extObj.giftId = giftId;
            }
            eb.conn.send({
                to: techInfo.emchatId,
                msg: msgObj.data,
                type: "chat",
                ext: extObj,
                success : function(){
                    $.sendFriend(techInfo.emchatId,"business_process");
                    clearTimeout(sendFailTimer);
                    msgObj.status = 1;
                    afterSend();
                }
            });
        }

        function afterSend(){
            $.updateSessionList(msgObj, "text", false);
            $.addToMsgList(msgObj, "text");
            backIndex ? $.page() : ($.param("backPublic")=="true" ? history.back() : history.go(-2));
        }
    }
})();