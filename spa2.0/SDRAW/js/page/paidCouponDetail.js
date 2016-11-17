(function(win,doc){//点钟券详情页面
    var userActId = $.param("userActId"),
        paramData = $.localStorage('paid-cou-detail-param'),
        payAuthCode = $.param("code") || $.getUrlParam('code') || $.$.payAuthCode,
        inPaid=false,
        prePayId,
        getQrCodeCount=0;

    if (!userActId) {
        $.tipShow("地址栏缺少参数！");
        return $.pageCancel();
    }
    else if (!$.$.userToken) {//未登录
        $.$.loginUrl = "paidCouponDetail" + location.hash.split("paidCouponDetail")[1];
        $.page("login");
    }
    else if ($.$.sessionType == "web"){//判定token是否有效
        $.ajax({
            url: "../api/v1/check_login/" + $.$.sessionType + "/" + $.$.userToken,
			isReplaceUrl:true,
            success: function (res) {
                if (res.msg == "Y") {
                    getPaidCouponData();
                }
                else {//无效的token，跳转到登录
                    $.$.loginUrl = "paidCouponDetail" + location.hash.split("paidCouponDetail")[1];
                    $.page("login");
                }
            }
        });
    }
    else getPaidCouponData();

    //////////////////////////////由userActId获取点钟券详情
    function getPaidCouponData(){
        $.ajax({
            url : ($.$.clubID ? "../" : "")+"/userredpacket/"+userActId,
            data : { userType : "user" },
            success : function(result){
                if(result.statusCode != 200){
                    $.tipShow(result.msg || "获取点钟券数据详情失败！");
                    $.page("home",-1,true);
                    return;
                }
                result = result.respData;
                if($.$.visitChannel !="9358"){
                    $("#content>div:nth-of-type(2)").CSS("display","none");
                }
                else{
                    $("#content>div:nth-of-type(2)>span").Text(result.clubName); //会所名称
                    $("#content>div:nth-of-type(2)>div:nth-of-type(1)").CSS("background-image","url("+ (result.imageUrl || $.$.defaultClubLogo)+")");//会所logo
                    $("#content>div:nth-of-type(2)>div:nth-of-type(2)").Click(function(){
                        if($.$.clubID) $.page("home",-1,true);
                        else{
                            location.href = location.href.split("spa2")[0]+"spa2/?club="+result.clubId+"#home";
                        }
                    });
                }

                $("#content>div:nth-of-type(3)>div:nth-of-type(1)>div").CSS("background-image","url("+ (result.techs.avatarUrl || $.$.defaultHeader)+")"); //技师头像
                $("#content>div:nth-of-type(3)>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type(1)").Html("<div>"+result.techs.name+"</div>[<div>"+(result.techs.serialNo || "")+"</div>]");
                $("#content>div:nth-of-type(3)>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type(2)>div:nth-of-type(2)").Text(result.techs.commentCount+"评论");
                $("#content>div:nth-of-type(3)>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type(2)>div:nth-of-type(1)>div").CSS("width",result.techs.star+"%");
                //$("#content>div:nth-of-type(3)>div:nth-of-type(2)>div:nth-of-type(2)").Text("中医按摩");
                $("#content>div:nth-of-type(3)>div:nth-of-type(2)>div:nth-of-type(3)>div:nth-of-type(1)").Text(result.techs.description || "这个技师很懒，没有填写个人简介...");
                $("#content>div:nth-of-type(3)>div:nth-of-type(2)>div:nth-of-type(3)>div:nth-of-type(2)").Click(function(){//点击预约按钮
                    $.login('confirmOrder&techId=' + result.techs.id+ ($.$.visitChannel == "9358" ?  "&clubId=" + result.clubId+"&backPublic=true" : ""),false,true,true);
                });

                /////点击技师头像
                $("#content>div:nth-of-type(3)>div:nth-of-type(1)>div").Click(function(){
                    $.page("chat&techId="+result.techs.id+($.$.visitChannel=="9358" ? "&clubId="+result.clubId : "" ));
                });

                $("#content>div:nth-of-type(4)>div:nth-of-type(1)>div:nth-of-type(1)").Text(result.userAct.actTitle);
                $("#content>div:nth-of-type(4)>div:nth-of-type(1)>div:nth-of-type(2)").Text(result.userAct.consumeMoneyDescription);
                $("#content>div:nth-of-type(4)>div:nth-of-type(1)>div:nth-of-type(3)>span").Text(result.userAct.couponPeriod);
                $("#content>div:nth-of-type(4)>div:nth-of-type(1)>div:nth-of-type(4)>span").Text(result.userAct.getDate.split(" ")[0]);

                if(result.userAct.couponQrCodeUrl){
                    $("#content>div:nth-of-type(4)>div:nth-of-type(2)>img")[0].src=result.userAct.couponQrCodeUrl;
                }else{
                    getQrCodeImg(); //调用接口生成二维码
                }

                function getQrCodeImg(){//调用接口生成二维码
                    getQrCodeCount++;
                    $.ajax({
                        url : ($.$.clubID ? "../" : "")+"/user/coupon_qrcode",
                        data : { userActId : userActId },
                        success : function(qrRes){
                            if(qrRes.statusCode == 200 && qrRes.respData){
                                $("#content>div:nth-of-type(4)>div:nth-of-type(2)>img")[0].src = qrRes.respData;
                            }
                            else if(getQrCodeCount<4){//再次发送请求
                                getQrCodeImg();
                            }
                        }
                    });
                }

                $("#content>div:nth-of-type(4)>div:nth-of-type(2)>span").Text(result.userAct.couponNo.substr(0,4)+" "+result.userAct.couponNo.substr(4,4)+" "+result.userAct.couponNo.substr(8));
                $("#content>div:nth-of-type(5)>div:nth-of-type(2)").Html(result.userAct.actContent);//券有效期
                $("#content>div:nth-of-type(4)>div:nth-of-type(1)>div:nth-of-type(5)").Text(result.userAct.couponStatusDescription);

                if(result.userAct.couponStatus == 4){       //支付处理中
                    $("#content>div:nth-of-type(4)>div:nth-of-type(1)>div:nth-of-type(5)").ClassClear("expire");
                    $("#payBtn").CSS("display","none");
                }else if(result.userAct.couponStatus==1){
                    $("#content>div:nth-of-type(4)>div:nth-of-type(1)>div:nth-of-type(5)").Class("already");
                    ///////////////////////////已支付，按钮改为预约
                    $("#payBtn>div").Text("立即预约");
                }else if(result.actStatus != 'online' && $("#payBtn>div").Text()!="立即预约"){
                    //$("#content>div:nth-of-type(4)>div:nth-of-type(1)>div:nth-of-type(5)").Class("downline");
                    ///////////////////////////已下线，按钮改为已下线
                    $("#payBtn>div").Class('downline').Text("已下线");
                }else if(result.userAct.couponStatus != 0){
                    $("#content>div:nth-of-type(4)>div:nth-of-type(1)>div:nth-of-type(5)").Class("expire");
                    $("#payBtn").CSS("display","none");
                }




                //////点击底部"立即支付","立即预约"按钮
                var payBtnSub = $("#payBtn>div");
                $("#payBtn>div").Click(function(e,item){
                    if(item.innerHTML == '已下线') return;
                    if(item.innerHTML=="立即支付"){
                        if(!$.$.ua.isWX){
                            if($.checkAccessMenu('paidCouponDetail')){
                               $.tipShow("请您打开微信登录'9358'公众号！")
                            }
                            return ;
                        }else if(!$.$.userTel){
                            $.$.loginUrl = location.hash;
                            $.page('bindPhone',1);
                        }else{
                            doPayCoupon();
                        }
                    }
                    else if(item.innerHTML=="立即预约"){
                        $.login('confirmOrder&techId=' + result.techs.id+ ($.$.visitChannel == "9358" ? "&clubId=" + result.clubId+"&backPublic=true" : ""),false,true,true);
                    }
                });

                function doPayCoupon(){
                    $.localStorageClear('paid-cou-detail-param');
                    if(!inPaid){
                        inPaid=true;
                        payBtnSub.Class('disabled');
                        payBtnSub.Text('支付中...');
                        $.ajax({
                            url : ($.$.clubID ? "../" : "")+"../wx/pay/paid_coupon_immediately",
                            type : "post",
                            data : {
                                actId : result.userAct.actId,  //点钟券id
                                businessType : "paid_coupon",
                                businessChannel : result.userAct.chanel,
                                clubId : result.userAct.clubId,
                                money : result.userAct.actValue,
                                openId : $.$.payOpenId,
                                techId : result.techs.id,
                                tradeChannel : "wx",
                                bizId : result.userAct.bizId,
                                userId : $.$.userID
                            },
                            success : function(payRes){
                                if(payRes.statusCode==200){
                                    if(payRes.respData){
                                        payRes = JSON.parse(payRes.respData);
                                        prePayId = payRes.package.split("=")[1];

                                        function onBridgeReady(){
                                            WeixinJSBridge.invoke(
                                                'getBrandWCPayRequest', {
                                                    "appId": payRes.appId,     //公众号名称
                                                    "timeStamp": payRes.timeStamp+"",  //时间戳
                                                    "nonceStr": payRes.nonceStr, //随机串
                                                    "package": payRes.package,
                                                    "signType": payRes.signType, //微信签名方式
                                                    "paySign" : payRes.paySign
                                                },
                                                function (res) {
                                                    inPaid = false;
                                                    payBtnSub.ClassClear('disabled');
                                                    payBtnSub.Text('立即支付');
                                                    if (res.err_msg.indexOf("ok")>=0) {//支付成功之后
                                                        $("#payBtn>div").Text("立即预约");
                                                        $("#content>div:nth-of-type(4)>div:nth-of-type(1)>div:nth-of-type(5)").Class("already");
                                                        $("#content>div:nth-of-type(4)>div:nth-of-type(1)>div:nth-of-type(5)").Text("已支付");
                                                        $.tipShow("支付成功！");

                                                        ////////////////////////////修改缓存中的状态
                                                        var couponData = $.sessionStorage('coupon_data'),  divContainer,  divItem;
                                                        if(couponData){
                                                            divContainer = document.createElement("div");
                                                            divContainer.innerHTML = couponData;
                                                            divItem = divContainer.querySelector("div>div[hh='"+userActId+"']");
                                                            if(divItem){
                                                                divItem.querySelector("span").className="payed";
                                                                divItem.querySelector("span").innerHTML="已支付";
                                                                $.sessionStorage('coupon_data',divContainer.innerHTML);
                                                            }
                                                        }

                                                        //////////////////////////////给技师发送我已购买点钟券的消息
                                                        var eb = $.$.easemob;
                                                        if (eb.userId && !eb.conn.isOpened()) {
                                                            var waitEasemobInit = setInterval(function () {//等待环信登录
                                                                if (eb.conn.isOpened()) {
                                                                    clearInterval(waitEasemobInit);
                                                                    sendPaidCouponMsg();
                                                                }
                                                            }, 10);
                                                        }
                                                        else {
                                                            sendPaidCouponMsg();
                                                        }
                                                    }// res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠
                                                    else{
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
                                    }
                                    else{
                                        inPaid = false;
                                        payBtnSub.ClassClear('disabled');
                                        $.tipShow("您已成功支付！");
                                        payBtnSub.Text("立即预约");
                                        $("#content>div:nth-of-type(4)>div:nth-of-type(1)>div:nth-of-type(5)").Class("already");
                                        $("#content>div:nth-of-type(4)>div:nth-of-type(1)>div:nth-of-type(5)").Text("已支付");
                                    }
                                }else if(payRes.statusCode == '935801'){
                                    $.localStorage('paid-cou-detail-param',true);
                                    $.getOauthCode('','9358','paid-coupon-detail','base');
                                }
                                else{
                                    payBtnSub.ClassClear('disabled');
                                    payBtnSub.Text("立即支付");
                                    $.tipShow(payRes.msg || "购买点钟券请求失败！");
                                }
                            }
                        })
                    }
                }
                if(paramData && payAuthCode){
                    $.ajax({
                        url: ($.$.clubID ? "../" : "")+"../wx/oauth2/user/openid",
                        type:'post',
                        data: {
                            code: $.$.payAuthCode,
                            scope:'snsapi_base',
                            wxmp: '9358',
                            userType:'user',
                            state:'paid-cou-detail'
                        },
                        success: function (result) {
                            if (result.statusCode == 200){
                                $.localStorageClear('paid-cou-detail-param');
                                doPayCoupon();
                            }else if(result.statusCode == '935801'){
                                $.getOauthCode('','9358','paid-cou-detail','base');
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
                function sendPaidCouponMsg(){
                    var chatHeader = $.$.userHeader,
                        chatName =  ($.$.userName == $.$.defaultUserName ? $.$.defaultUserName + "(" + $.$.userTel.substr(0, 3) + "****" + $.$.userTel.slice(-4) + ")" : $.$.userName ),
                        eb = $.$.easemob;

                    ///////////////////////////////保存-存储
                    var msgObj = {
                        from: eb.userId,
                        to: result.techs.emchatId,
                        data: "您购买了"+result.techs.name+'的"'+result.userAct.actTitle+'"',
                        ext: { name: result.techs.name, header: result.techs.avatarUrl, avatar: '', no: result.techs.serialNo, techId: result.techs.id, clubId: result.clubId, msgType: "paidCouponTip" }
                    };

                    var sendFailTimer = setTimeout(function(){
                        msgObj.status = 0;
                        $.updateSessionList(msgObj, "text", false);
                        $.addToMsgList(msgObj, "text");
                    },5000);

                    if(eb.conn.isOpened()){
                        eb.conn.send({
                            to: result.techs.emchatId,
                            msg: result.userAct.actTitle+"&"+result.userAct.actId,
                            type: "chat",
                            ext: { name: chatName, header: chatHeader, msgType: "paidCouponTip", time: Date.now() , avatar : $.$.userAvatar },
                            success: function(){
								$.sendFriend(result.techs.emchatId,"business_process");
                                clearTimeout(sendFailTimer);
                                msgObj.status = 1;
                                $.updateSessionList(msgObj, "text", false);
                                $.addToMsgList(msgObj, "text");
                            }
                        });
                    }
                }
            }
        });
    }
})(window,document);