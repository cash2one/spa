(function(){
    var userActId = $.param('userActId'),couponType = $.param('couponType'),
      isPaidServiceItem = couponType == 'paid_service_item';
    if(!userActId){
        $.tipShow("地址栏缺少参数！");
        return $.pageCancel();
    }

    if($.param("backPublic")=="true"){
        $("#title>div:nth-of-type(2)").Click(function(event){
            event.stopImmediatePropagation();
            history.back();
        });
    }
    var url = "../api/v2/club/userredpacket/"+userActId;
    if(isPaidServiceItem){
        url = '../api/v2/club/user_paid_service_item/view';
    }
    $.ajax({
        url : url,
        isReplaceUrl:true,
        data : { userType : "user",id:userActId },
        success : function(result){
            if(result.statusCode != 200){
                $.tipShow(result.msg || "数据请求失败！");
                return $.pageCancel();
            }
            result = result.respData;
            var useDefaultShareConfig = true;
            if(isPaidServiceItem){
                result.userAct = result;
                //隐藏别的
                $('#content>div:nth-of-type(3)>div:nth-of-type(3),#content>div:nth-of-type(3)>div:nth-of-type(4),' +
                  '#content>div:nth-of-type(3)>div:nth-of-type(5),#content>div:nth-of-type(3)>div:nth-of-type(6)').Class('hide');
                $('#content>div:nth-of-type(4),#content>div:nth-of-type(6),#content>div:nth-of-type(7),#content>div:nth-of-type(8)').Class('hide');

                //显示与抢项目相关的内容
                $('#content>div:nth-of-type(3)>div:nth-of-type(7),#content>div:nth-of-type(3)>div:nth-of-type(8),' +
                  '#content>div:nth-of-type(3)>div:nth-of-type(9),#content>div:nth-of-type(3)>div:nth-of-type(10)').ClassClear('hide');
                $('.rob-item').ClassClear('hide');

                $("#content>div:nth-of-type(3)>div:nth-of-type(1)").Text(result.userAct.couponTypeName);
                $("#content>div:nth-of-type(3)>div:nth-of-type(2)").Text( result.userAct.actTitle);
                if(result.userAct.paidType == 'credits'){
                    $('#content>div:nth-of-type(3)>div:nth-of-type(7)>span').Text(result.userAct.credits + ' 积分');
                }else{
                    $('#content>div:nth-of-type(3)>div:nth-of-type(7)>span').Text(result.userAct.actValue + ' 元');
                }
                $('#content>div:nth-of-type(3)>div:nth-of-type(8)>span').Text(result.userAct.couponPeriod.replace(/ \d{2}:\d{2}/g,''));
                $('#content>div:nth-of-type(3)>div:nth-of-type(9)>span').Text(result.userAct.getDate);
                var tmpDate = new Date(result.userAct.useEndDate.split(' ')[0].replace(/-/g,'/') + " 23:59:59").getTime() - new Date().getTime();
                if(Math.floor(tmpDate/86400000)>0){
                    tmpDate = '<span>'+ Math.floor(tmpDate/86400000) + '</span> 天';
                }else if(Math.floor(tmpDate/3600000)>0){
                    tmpDate = '<span>'+ Math.floor(tmpDate/3600000) + '</span> 小时';
                }else{
                    tmpDate = '<span>'+ Math.floor(tmpDate/60000) + '</span> 分';
                }
                $('#content>div:nth-of-type(3)>div:nth-of-type(10)').Html('剩余 '+tmpDate);
                result.userAct.status == "settled" ? ($('#content>div:nth-of-type(3)>div:nth-of-type(10)').Text('已使用'),$('#content>div:nth-of-type(5)').CSS('display','none')):'';
                //==活动说明
                $('#actExplain>div:nth-of-type(2)>div:nth-of-type(2)>div:nth-of-type(1)>span').Text(result.userAct.useStartDate.split(' ')[0] + ' - ' + result.userAct.useEndDate.split(' ')[0]);
                $('#actExplain>div:nth-of-type(2)>div:nth-of-type(2)>div:nth-of-type(2)').Html(result.userAct.actContent);

                //== 项目说明
                $('#projectExplain>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type(1)>div:nth-of-type(1)').CSS('background-image','url('+result.userAct.imageUrl+')');
                $('#projectExplain>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type(1)>div:nth-of-type(2)>div:nth-of-type(1)').Text(result.userAct.actTitle);
                $('#projectExplain>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type(1)' +
                  '>div:nth-of-type(2)>div:nth-of-type(2)>span:nth-of-type(1)').Text(result.userAct.price+'元/'+result.userAct.duration+result.userAct.durationUnit);
                if(result.userAct.pricePlus){
                    $('#projectExplain>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type(1)' +
                      '>div:nth-of-type(2)>div:nth-of-type(2)>span:nth-of-type(2)').Text(result.userAct.pricePlus+'元/'+result.userAct.durationPlus+result.userAct.durationUnitPlus);
                }
                $('#projectExplain>div:nth-of-type(2)>div:nth-of-type(2)>div:nth-of-type(2)').Html(result.userAct.description || '无');
            }else{
                var isMoneyCoupon = (result.userAct.useType == "money"),
                  isRepeatCoupn = (result.userAct.couponType == "redpack");

                //优惠券信息
                $("#content>div:nth-of-type(3)>div:nth-of-type(1)").Text(result.userAct.useTypeName);
                $("#content>div:nth-of-type(3)>div:nth-of-type(2)").Text(isMoneyCoupon ? result.userAct.actValue+"元" : result.userAct.actTitle);
                if(isMoneyCoupon && result.userAct.consumeMoney==0){
                    $("#content>div:nth-of-type(3)>div:nth-of-type(3)").CSS("display","none");
                }
                else{
                    $("#content>div:nth-of-type(3)>div:nth-of-type(3)").Text(result.userAct.consumeMoneyDescription);
                }
                $("#content>div:nth-of-type(3)>div:nth-of-type(4)>span").Text(result.userAct.couponPeriod);
                $("#content>div:nth-of-type(3)>div:nth-of-type(5)>span").Text(result.userAct.getDate);

                if(!isRepeatCoupn){
                    $("#content>div:nth-of-type(3)>div:nth-of-type(6)").CSS("display","none");
                    $("#content>div:nth-of-type(4)").CSS("display","none");
                    $("#content>div:nth-of-type(6)").CSS("display","none");
                }
                else{
                    $("#content>div:nth-of-type(3)>div:nth-of-type(6)>span").Text(result.userAct.canUseSum+"次");
                }

                //优惠说明
                if(isMoneyCoupon || !result.userAct.actDescription){
                    $("#content>div:nth-of-type(7)").CSS("display","none");
                }
                else{
                    if(!result.userAct.actDescription || result.userAct.actDescription.length==0) result.userAct.actDescription = "无";
                    $("#content>div:nth-of-type(7)>div:nth-of-type(2)").Html(result.userAct.actDescription);
                }

                //好友领取
                if((result.phoneNums_get && result.phoneNums_get.length>0) || (result.phoneNums_use && result.phoneNums_use.length>0)){
                    var i, str = "", couponName = (isMoneyCoupon ? result.userAct.actValue+"元"+result.userAct.useTypeName : result.userAct.actTitle);
                    if(result.phoneNums_get){
                        for(i=0;i<result.phoneNums_get.length;i++){
                            str += "<li>"+result.phoneNums_get[i]["phone"]+"<div>已经领取"+couponName+"<span>"+result.phoneNums_get[i]["date"]+"</span></div></li>"
                        }
                    }
                    if(result.phoneNums_use){
                        for(i=0;i<result.phoneNums_use.length;i++){
                            str += "<li>"+result.phoneNums_use[i]["phone"]+"<div>已经使用"+couponName+"<span>"+result.phoneNums_use[i]["date"]+"</span></div></li>"
                        }
                    }
                    $("#content>div:nth-of-type(6)>ul").Html(str);
                }
                else{
                    $("#content>div:nth-of-type(6)").CSS("display","none");
                }

                //使用说明
                if(!result.userAct.actContent || result.userAct.actContent.length==0) result.userAct.actContent = "无";
                $("#content>div:nth-of-type(8)>div:nth-of-type(2)").Text("券有效期："+result.userAct.couponPeriod);//券有效期
                $("#content>div:nth-of-type(8)>div:nth-of-type(3)").Text("使用时段："+result.userAct.useTimePeriod);//使用时段
                $("#content>div:nth-of-type(8)>div:nth-of-type(4)").Html('<div></div>'+result.userAct.actContent);
                var itemArr = [];
                result["items"] = result["items"] || [];
                for(var i=0;i<result["items"].length;i++){
                    itemArr.push(result["items"][i]["name"]);
                }
                if(itemArr.length>0){
                    $("#content>div:nth-of-type(8)>div:nth-of-type(4)>div").Html("使用项目：仅限"+itemArr.join("，"));
                }

                //分享给好友
                var getBtn = $("#content>div:nth-of-type(4)>div");
                if((result.userAct.couponStatus != "1" && result.userAct.couponStatus != "2") || !result.shareUrl) getBtn.Class("unwork");
                useDefaultShareConfig = !($.$.ua.isWX && !getBtn.ClassHave('unwork'));

                //******************************************************分享pop弹出层
                if(isRepeatCoupn){
                    var popWrap = $("#show-coupons-pop");
                    //点击关闭
                    $("#show-coupons-pop>div:nth-of-type(2)>div:nth-of-type(3)").Click(function(){
                        popWrap.ClassClear("active");
                    });
                    popWrap.Click(function(){
                        popWrap.ClassClear("active");
                    });
                    $("#show-coupons-pop>div:nth-of-type(2)").Click(function(e){
                        e.stopPropagation();
                    });
                    $("#show-coupons-pop>div:nth-of-type(1)").Click(function(e){
                        e.stopPropagation();
                    });

                    //分享链接
                    $("#show-coupons-pop>div:nth-of-type(2)>div:nth-of-type(1)").Html("<a href='"+result.shareUrl+"'>"+result.shareUrl+"</a>");//设置分享链接

                    if($.$.ua.isWX){//分享配置
                        $("#show-coupons-pop>div:nth-of-type(1)").CSS("display","block");
                    }else{
                        $("#show-coupons-pop>div:nth-of-type(2)").CSS("display","block");
                    }

                    if(!getBtn.ClassHave('unwork')){
                        getBtn.Click(function(){
                            popWrap.Class("active");
                        });
                    }
                    else{
                        getBtn.Click(function(){
                            $.tipShow('活动已过期！不可分享！');
                        });
                    }
                }
                if(!useDefaultShareConfig){
                    $.X5Config({
                        title: result.clubName+"-"+  (isMoneyCoupon ? result.userAct.actValue+"元"+result.userAct.useTypeName : result.userAct.actTitle), //分享标题
                        desc:  isRepeatCoupn ? "此券可在"+result.clubName+"使用，分享给朋友获得更多优惠。" : "送你一张优惠券，带上它，让你的身体爽一把。", // 分享描述
                        link: result.shareUrl, // 分享链接
                        imgUrl: result.imageUrl, // 分享图标
                        success: function (){
                            popWrap.ClassClear("act");
                            $.ajax({
                                url : ($.$.clubID ? "../" : "")+"/redpacket/share",
                                data : { userActId : userActId },
                                success : function(res){
                                    if(res.statusCode == "200"){
                                        popWrap.ClassClear("active");
                                    }
                                }
                            });
                        },
                        cancel: function () {
                            //用户取消分享后执行的回调函数
                        },
                        fail: function (res) {
                            $.tipShow("分享失败！请稍后再试！");
                        }
                    });
                }
            }

            $("#content>div:nth-of-type(2)").Text(result.clubName);//会所名称
            var qrCodeImg = $("#content>div:nth-of-type(5)>img")[0];
            qrCodeImg.onload = function(){
                qrCodeImg.style.opacity="1";
            };

            var getQrCodeCount= 0,getQrCodeUrl = "../api/v2/club/user/coupon_qrcode";
            if(isPaidServiceItem){
                getQrCodeUrl = "../api/v2/club/user_paid_service_item/qrcode";
            }
            //电子票号二维码
            if(result.userAct.couponQrCodeUrl || result.userAct.qrCodeUrl){
                qrCodeImg.src = result.userAct.couponQrCodeUrl || result.userAct.qrCodeUrl;
            }
            else{
                //调用接口生成二维码
                getQrCodeImg();
            }

            function getQrCodeImg(){
                getQrCodeCount++;
                $.ajax({
                    url : getQrCodeUrl ,
                    isReplaceUrl:true,
                    data : {
                        userActId : userActId,
                        id:userActId
                    },
                    success : function(res){
                        if(res.statusCode == 200 && res.respData){
                            qrCodeImg.src = res.respData;
                        }
                        else if(getQrCodeCount<4){//再次发送请求
                            getQrCodeImg();
                        }
                    }
                });
            }

            $("#content>div:nth-of-type(5)>span").Text(result.userAct.couponNo.substr(0,4)+" "+result.userAct.couponNo.substr(4,4)+" "+result.userAct.couponNo.substr(8));
            $.pageSwitch(useDefaultShareConfig);
            /*if(useDefaultShareConfig) $.pageSwitch(useDefaultShareConfig);
            else $.pageSwitch();*/
        }
    });
})();