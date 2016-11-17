(function(win,doc){
    var actId= $.param("actId"),
        techCode = $.param("techCode"),
        paramData = $.localStorage('paid-coupon-param'),
        payAuthCode = $.param("code") || $.getUrlParam('code') || $.$.payAuthCode,
        inPaid=false,
        prePayId;

    if($.param("backPublic")=="true"){
        $("#title>div:nth-of-type(2)").Click(function(event){
            event.stopImmediatePropagation();
            history.back();
        });
    }

    ////////////////////////////////////////////////获取点钟券的信息
    $.ajax({
        url : ($.$.clubID ? "../" : "")+"redpacket/data",
        data : {
            actId : actId,
            userCode : "",
            techCode : techCode,
            chanel : $.param('chanel'),
            phoneNum : ''
        },
        success : function(data){
            if(data.statusCode==200){
                data = data.respData;
                $("#content>div:nth-of-type(2)>span").Text(data.clubName);//会所名称
                $("#content>div:nth-of-type(2)>div:nth-of-type(1)").CSS("background-image","url("+(data.imageUrl || $.$.defaultClubLogo)+")");//会所logo
                $("#content>div:nth-of-type(2)").Click(function(){//点击向右箭头
                    if($.$.clubID) $.page("home",-1,true);
                    else location.href = location.href.split("spa2")[0]+"spa2/?club="+data.clubId;
                });

                $("#content>div:nth-of-type(3)>div:nth-of-type(1)>div:nth-of-type(1)").CSS("background-image","url("+(data.techs.avatarUrl || $.$.defaultHeader)+")");//技师头像
                $("#content>div:nth-of-type(3)>div:nth-of-type(1)>div:nth-of-type(2)").Html(data.techs.name+"<span>[<span>"+(data.techs.serialNo || "")+"</span>]</span>");//技师名称 编号
                $("#content>div:nth-of-type(3)>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type(1)").Text(data.actTitle);
                $("#content>div:nth-of-type(3)>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type(2)").Text(data.actValue+"元抵"+data.consumeMoney+"元");
                $("#content>div:nth-of-type(3)>div:nth-of-type(3)>span").Text(data.couponPeriod);
                $("#content>div:nth-of-type(4)>div:nth-of-type(2)").Html(data.actContent);

                /////点击技师头像
                $("#content>div:nth-of-type(3)>div:nth-of-type(1)>div:nth-of-type(1)").Click(function(){
                    if(location.hash.indexOf("/paidCoupon")>0 && /^chat&techId/.test(location.hash.split("/paidCoupon")[0].slice(-30))){
                        history.back();
                    }
                    else{
                        $.page("chat&techId="+data.techs.id+($.$.visitChannel=="9358" ? "&clubId="+data.clubId : "" ));
                    }
                });

                //==== 购买张数 事件 ====
                var countTimer = 0,plusValue = 0,$payCount = $('#payCount>span:nth-of-type(2)'),plusSpeed = 200
                  ,runCount = 0
                  ,$countMoney = $('#payCount>div>span')
                  ,countMoney = data.actValue;
                $countMoney.Text(countMoney.toFixed(2));
                function initCountValue(){
                    clearTimeout(countTimer);
                    countTimer = 0;
                    runCount = 0;
                    plusSpeed = 200;
                }
                function plusCountFunc(){
                    if((plusValue < 0 && $payCount.Text() == 1) || (plusValue > 0 && $payCount.Text() == 999)){
                        initCountValue();
                        return;
                    }
                    runCount++;
                    //if(runCount%5 == 0){
                       plusSpeed = plusSpeed > 10 ? (plusSpeed-=5):plusSpeed;       //使渐变速度越来越快
                    //}
                    $payCount.Text(parseInt($payCount.Text()) + plusValue);
                    $countMoney.Text((countMoney*parseInt($payCount.Text())).toFixed(2));
                    countTimer = setTimeout(plusCountFunc,plusSpeed);
                }
                $('#payCount>span:nth-of-type(1),#payCount>span:nth-of-type(3)').Event('touchstart', function (e, item) {
                    e.preventDefault();
                    initCountValue();
                    if(item.dataset.type == 'plus'){
                        plusValue = 1;
                    }else{
                        plusValue = -1;
                    }
                    plusCountFunc()
                }).Event('touchmove', function (e, item) {
                    /*clearTimeout(countTimer);
                    countTimer = 0;
                    runCount = 0;
                    plusSpeed = 200;*/
                }).Event('touchend', function (e, item) {
                    e.preventDefault();
                    initCountValue();
                }).Event('touchcancel', function () {
                    e.preventDefault();
                    initCountValue();
                });

                //////////////////////////////////////////////点击购买按钮
                var payBtnSub = $("#payBtn>div");
                if(data.status == 'downline_can_use'){
                    payBtnSub.Class('downline').Text('已下线');
                }

                $("#payBtn").Click(function(){//点击购买按钮
                    if(payBtnSub.ClassHave('downline')) return;
                    if(!$.$.ua.isWX){
						if($.checkAccessMenu('paidCoupon')){
							$.tipShow("请您打开微信登录'9358'公众号！");
						}
                        return ;
                    }
                    if(!$.$.userToken){//未登录
                        $.tipShow("请您先登录！");
                        $.$.loginUrl="paidCoupon"+location.hash.split("paidCoupon")[1];
                        $.page("login");
                    }else if(!$.$.userTel){
                        $.$.loginUrl = location.hash;
                        $.bindPhone(true);
                        return true;
                    }else{
                        doPayCoupon();
                    }
                });

                //////////////////////////////////////////////////////////////支付的处理
                function doPayCoupon(){
                    if(!inPaid){
                        inPaid=true;
                        payBtnSub.Class('disabled');
                        payBtnSub.Text('购买中...');
                        $.ajax({
                            url : ($.$.clubID ? "../" : "")+"../wx/pay/paid_coupon",
                            type : "post",
                            data : {
                                actId : actId,//点钟券id
                                businessType : "paid_coupon",
                                businessChannel : $.param("chanel"),
                                clubId : data.clubId,
                                money : data.actValue * parseInt($payCount.Text()),
                                count:parseInt($payCount.Text()),
                                openId : $.$.payOpenId,
                                techId : data.techs.id,
                                tradeChannel : "wx",
                                token: $.$.userToken,
                                sessionType: $.$.sessionType
                            },
                            success : function(result){
                                if(result.statusCode==200){
                                    result =  JSON.parse(result.respData);
                                    prePayId = result.package.split("=")[1];

                                    function onBridgeReady() {
                                        WeixinJSBridge.invoke(
                                            'getBrandWCPayRequest', {
                                                "appId": result.appId,     //公众号名称，由商户传入
                                                "timeStamp": result.timeStamp+"",  //时间戳，自1970年以来的秒数
                                                "nonceStr": result.nonceStr, //随机串
                                                "package": result.package,
                                                "signType": result.signType,   //微信签名方式
                                                "paySign" : result.paySign
                                            },
                                            function (res) {
                                                inPaid = false;
                                                payBtnSub.ClassClear('disabled');
                                                if (res.err_msg.indexOf("ok")>=0) {//支付成功之后
                                                    $.tipShow("支付成功！");
                                                    payBtnSub.Text('购买成功');
                                                    /////给技师发送我已购买点钟券的消息
                                                    var eb = $.$.easemob;
                                                    if (eb.userId && !eb.conn.isOpened()) {//未登录
                                                        var waitEasemobInit = setInterval(function () {//等待环信初始化完成
                                                            if (eb.conn.isOpened()) {
                                                                clearInterval(waitEasemobInit);
                                                                sendPaidCouponMsg(result.bizId);
                                                            }
                                                        }, 10);
                                                    }
                                                    else {
                                                        sendPaidCouponMsg(result.bizId);
                                                    }
                                                }// res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠
                                                else{
                                                    payBtnSub.Text('立即购买');
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
                                }else if(result.statusCode == '935801'){
                                    $.localStorage('paid-coupon-param',true);
                                    $.getOauthCode('','9358','paid-coupon','base');
                                }
                                else{
                                    inPaid = false;
                                    payBtnSub.ClassClear('disabled');
                                    payBtnSub.Text('立即购买');
                                    $.tipShow(result.msg || "购买点钟券请求失败！");
                                }
                            },
                            error : function(){
                                inPaid = false;
                                payBtnSub.ClassClear('disabled');
                                payBtnSub.Text('立即购买');
                            }
                        })
                    }
                }
                if(paramData && payAuthCode){
                    $.ajax({
                        url: ($.$.clubID ? "../" : "")+"../wx/oauth2/user/openid",
                        type:'post',
                        data: {
                            code: payAuthCode,
                            scope:'snsapi_base',
                            wxmp: '9358',
                            userType:'user',
                            state:'confirm-order'
                        },
                        success: function (result) {
                            if (result.statusCode == 200){
                                $("#payBtn")[0].click();
                                $.localStorageClear('paid-coupon-param');
                            }else if(result.statusCode == '935801'){
                                $.getOauthCode('','9358','paid-coupon','base');
                            }
                            else {
                                $.tipShow(result.msg || "获取openId失败！");
                            }
                        }
                    });
                    $.pageSwitch();
                }else{
                    $.pageSwitch();
                }

                ////////给技师发送我已购买点钟券的消息
                function sendPaidCouponMsg(bizId){
                    var chatHeader = $.$.userHeader,
                        chatName = ($.$.userName == $.$.defaultUserName ? $.$.defaultUserName + "(" + $.$.userTel.substr(0, 3) + "****" + $.$.userTel.slice(-4) + ")" : $.$.userName ),
                        eb = $.$.easemob;

                    ///////////////////////////////保存-存储
                    var msgObj = {
                        from: eb.userId,
                        to: data.techs.emchatId,
                        data: "您购买了"+data.techs.name+'的"'+data.actTitle+'"',
                        ext: { name: data.techs.name, header: data.techs.avatarUrl, avatar: '', no: data.techs.serialNo, techId: data.techs.id, clubId: data.clubId, msgType: "paidCouponTip" }
                    };

                    var sendFailTimer = setTimeout(function(){
                        msgObj.status = 0;
                        afterSend();
                    },5000);

                    if(eb.conn.isOpened()){
                        eb.conn.send({
                            to: data.techs.emchatId,
                            msg: data.actTitle+"&"+actId,
                            type: "chat",
                            ext: { name: chatName, header: chatHeader, msgType: "paidCouponTip", time: Date.now() , avatar : $.$.userAvatar },
                            success: function(){
								$.sendFriend(data.techs.emchatId,"business_process");
                                clearTimeout(sendFailTimer);
                                msgObj.status = 1;
                                afterSend();
                            }
                        });
                    }

                    function afterSend(){
                        $.updateSessionList(msgObj, "text", false);
                        $.addToMsgList(msgObj, "text");
                        $.page("paidCouponDetail&userActId="+bizId);
                    }
                }
            }
            else{
                $.tipShow(data.msg || "获取点钟券数据失败！");
                $.page("home",-1,true);
            }
        }});
})(window,document);