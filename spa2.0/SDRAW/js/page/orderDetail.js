(function(){
    var orderId = $.param("id"),
        appendReward$ = $('#content > div:nth-of-type(6) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2)'),
        addOrder$ = $('#content > div:nth-of-type(6) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(1)'),
        techId,
        clubId = $.param("clubId") || $.$.clubID,
        itemId,
        commentId;
    if(!orderId){
        $.pageCancel();
        return $.tipShow("地址栏参数不正确！");
    }
    if($.param("tag")=="submit"){
        if($.param('backChat')){
            $("#content>div#title>div:nth-of-type(2)").Click(function(event){
                event.stopImmediatePropagation();
                $.page("chat&techId="+techId+($.$.visitChannel=="9358" ? "&clubId="+clubId : ""),-1,true);
            });
        }else if($.$.visitChannel == "9358"){
            $("#content>div#title>div:nth-of-type(2)").Click(function(event){
                event.stopImmediatePropagation();
                if($.param("backPublic")=="true") history.go(-2);
                else $.page("collect",-1,true);
            });
        }else{
            $("#content>div#title>div:nth-of-type(2)>a").Class("home");
        }
    }
	
	/**
     * 将  明天 19:00  这样的时间格式化为 YYYY-MM-DD HH:mm
     * @param start
     * @param dt
     */
    function dateFormat(dt, start){
        if(/^\d{2}:\d{2}$/g.test(dt)){
            dt = '今天 '+dt;
        }
        if(/今天|明天|后天|大后天/.test(dt)){
            start = start || new Date();
            dt = dt.split(' ');
            var addDay ={"今天":0,"明天":1,"后天":2,"大后天":3};
            start.setDate(start.getDate() + addDay[dt[0]] || 0);
            return new Date().getFullYear() + '-' +(start.getMonth()<9? '0'+(start.getMonth() + 1):(start.getMonth() + 1)) + '-' + (start.getDate() <= 9 ? "0"+start.getDate():start.getDate()) + ' ' + dt[1];
        }else if(/^\d{2}-\d{2}/.test(dt)){
            return new Date().getFullYear() + '-' + dt;
        }else{
            return dt;
        }

    }

    $.ajax({
        url: ($.$.clubID ? "../" : "") + "../profile/user/order/view",
        data: { id: orderId },
        success: function (data) {
            if(data.statusCode == '307'){
                setTimeout(function () {
                    $.ajax({
                        url: ($.$.clubID ? "../" : "") + "../profile/user/order/view",
                        data: { id: orderId },
                        success: function (data) {
                            if (data.statusCode != '200' || !data.respData) {
                                $.tipShow(data.msg || "请求数据失败！");
                                return $.pageCancel();
                            }
                            initPage(data);
                        }
                    });
                },300);
            }else if (data.statusCode != '200' || !data.respData) {
                $.tipShow(data.msg || "请求数据失败！");
                return $.pageCancel();
            }else{
                initPage(data);
            }

        }
    });

    function initPage(data){
        ///////////////////////////////////////////////////////////////////////////////////////////
        data = data.respData;
        var statusObj = {
            "unpaid" :{ "tag":"unpaid", "name":'待支付'},
            "submit" : { "tag" : "fail" , "name" : "待接受"},
            "accept" : { "tag" : "normal" , "name" : "已接受"},
            "cancel" : { "tag" : "fail" , "name" : "取消"},
            "reject" : { "tag" : "fail" , "name" : "拒接"},
            "complete" : { "tag" : "normal" , "name" : "完成"},
            "failure" : { "tag" : "fail" , "name" : "失效"},
            "overtime" : { "tag" : "fail" , "name" : "拒接"},
            "refund" : { "tag" : "refund" , "name" : "退款中"},
            "refunded" : { "tag" : "refunded" , "name" : "退款完成"},
            "refundfailure" : { "tag" : "refunded" , "name" : "退款失败"},
            "error" : { "tag" : "error" , "name" : "下单失败"},
            expire:{ "tag" : "expire" , "name" : "过期"},
            process:{ "tag" : "process" , "name" : "付款处理中"}
        };

        ///////////////////会所信息
        $("#content>div:nth-of-type(2)>div:nth-of-type(1)").Text(data.clubName);
        if(data.clubTelephone && data.clubTelephone.length>0 ){
            setTelDial(data.clubTelephone);
        }
        else{
            $("#content>div:nth-of-type(5)>div:nth-of-type(4)").CSS("display","none");
            $("#content>div:nth-of-type(2)>div:nth-of-type(2)").Click(function(){
                $.tipShow("暂无会所电话！");
            });
        }

        if(data['order']['refundStatus']){
            data['statusNow'] = data['order']['refundStatus']
        }

        ///////////////////技师信息
        if(data["order"]["technicianId"]){
            techId = data["order"]["technicianId"];
            clubId = data["order"]["clubId"];
            data["order"]["techAvatarUrl"] = data["order"]["techAvatarUrl"] || $.$.defaultHeader;
            data["order"]["techName"] = data["order"]["techName"] || $.$.defaultTechName;
            $("#content>div:nth-of-type(3)>div:nth-of-type(1)").CSS("backgroundImage","url('"+data["order"]["techAvatarUrl"]+"')");//头像
            $("#content>div:nth-of-type(3)>div:nth-of-type(2)>div:nth-of-type(1)").Html("<div>"+( $.$.ua.isFirefox && data["order"]["techName"].length>7 ? data["order"]["techName"].substr(0,7)+"..." : data["order"]["techName"])+"</div><div>[<span>"+(data["order"]["techSerialNo"]||'')+"</span>]</div>");//名称编号
            $("#content>div:nth-of-type(3)>div:nth-of-type(2)>div:nth-of-type(2)").Text(data["order"]["techDescription"] || "这个技师很懒，没有填写个人简介...");
            $("#content>div:nth-of-type(3)>div:nth-of-type(1)").Click(function(){
                $.page("chat&techId="+data["order"]["technicianId"]+($.$.visitChannel=="9358" ? "&clubId="+data["order"]["clubId"] : ""));
            });
        }
        else{
            $("#content>div:nth-of-type(3)>div:nth-of-type(1)").CSS("backgroundImage","url('"+$.$.defaultHeader+"')");//头像
            $("#content>div:nth-of-type(3)>div:nth-of-type(2)>div:nth-of-type(1)").Html("技师待定");
            $("#content>div:nth-of-type(3)>div:nth-of-type(2)>div:nth-of-type(2)").Text("到店选择技师");
        }

        ///////////////////服务项目信息
        itemId =data["order"]["serviceItemId"];
        $("#content>div:nth-of-type(4)>div:nth-of-type(1)>span").Text(data["order"]["serviceItemName"]||'到店选择');//预约项目
        $("#content>div:nth-of-type(4)>div:nth-of-type(2)>span").Text(data["order"]["serviceItemName"] ? $.formatPrice(data["order"]["servicePrie"],data["order"]["serviceDuration"],data["order"]["serviceUnit"]) : '待定');//项目价格
        $("#content>div:nth-of-type(4)>div:nth-of-type(3)>span:nth-of-type(1)").Text(dateFormat(data["order"]["appointTime"]));//到店时间
        $("#content>div:nth-of-type(4)>div:nth-of-type(3)>span:nth-of-type(2)").Text((function (_v) {
            if(/^(今天|明天|后天|大后天)/g.test(_v)) return RegExp.$1;
            else return '';
        })(/^\d{2}:\d{2}$/g.test(data["order"]["appointTime"])?'今天 '+data["order"]["appointTime"]:data["order"]["appointTime"]));//

        ///////////////////客户信息
        $("#content>div:nth-of-type(5)>div:nth-of-type(1)>span").Text(data["order"]["customerName"]);//联系人
        $("#content>div:nth-of-type(5)>div:nth-of-type(2)>span").Text(data["order"]["phoneNum"]);//联系电话
        $("#content>div:nth-of-type(5)>div:nth-of-type(3)>span").Text(dateFormat(data["order"]["createdAt"]));//下单时间


        /////////////////////////////////订单状态
        var orderStatus = $("#content>div:nth-of-type(3)>div:nth-of-type(3)");
        orderStatus.Class(statusObj[data["statusNow"]].tag);
        orderStatus.Text(statusObj[data["statusNow"]].name);

        if(data["statusNow"] == "complete"){//完成
            //确认预约电话隐藏
            $("#content>div:nth-of-type(5)>div:nth-of-type(4)").CSS("display","none");
            if(data["order"]["commented"] == "N" && data["order"]["technicianId"]){//未评论
                $("#content>div:nth-of-type(7)").CSS("display","block");
                $("#content>div:nth-of-type(7)").Click(function(){//跳转到评论页面

                    $.page("comment&orderId="+orderId+"&type=order&techId="+data["order"]["technicianId"]);

                });
            }
            else if(data["order"]["commented"] == "Y" && data["comment"]){//显示评论
                commentId = data["comment"]["id"];
                $("#content>div:nth-of-type(6)").CSS("display","block");
                $("#content>div:nth-of-type(6)>div:nth-of-type(1)>div:nth-of-type(1)>div>div").CSS("width",data["comment"]["rate"]+"%");
                $("#content>div:nth-of-type(6)>div:nth-of-type(1)>div:nth-of-type(2)>span").Text(data["comment"]["comment"]);

                var rewardAmounts = data.rewardAmounts,rewardStrs = [];
                if(Array.isArray(rewardAmounts) && rewardAmounts.length > 0){
                    rewardAmounts.forEach(function (money) {
                        rewardStrs.push('<div>'+money+'元</div>');
                    });
                }else{
                    rewardStrs.push('<div>0元</div>');
                }
                $('#content > div:nth-of-type(6) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(1)').Html(rewardStrs.join(''));
            }
        }
        else if(data["statusNow"] == "submit"){
            //$("#content>div:nth-of-type(5)>div:nth-of-type(4)").CSS("display","none");
        }
        else{
            $("#content>div:nth-of-type(5)>div:nth-of-type(4)").CSS("display","none");
        }
        clubId = data["order"]["clubId"];
        $.pageSwitch(true,false);
    }

    ///////////////////////////////////////////////////////////////////////////////////////////微信关注
    if($.$.ua.isWX){
        if($.$.visitChannel == "9358"){
            //隐藏关注微信
            $("#content>div:nth-of-type(8)").CSS("display","none");
        }
        else{
            //获取二维码图片
            $.ajax({
                url : "../api/v1/wx/club/param_qrcode",
				        isReplaceUrl:true,
                data : {
                    clubId : $.$.clubID
                },
                success : function(data){
                    if(data.statusCode == "200"){
                        if(data.respData == "N"){
                            $.ajax({
                                url : "../api/v1/wx/club/param_qrcode",
								                isReplaceUrl:true,
                                data : {
                                    clubId : $.$.clubID
                                },
                                success : function(data2){
                                    if(data2.statusCode == "200" && data2.respData != "N"){
                                        $("#content>div:nth-of-type(8)>div:nth-of-type(2)>img")[0].src = data2.respData;
                                    }
                                }});
                        }
                        else{
                            $("#content>div:nth-of-type(8)>div:nth-of-type(2)>img")[0].src = data.respData;
                        }
                    }
                }
            });
        }

        //隐藏关注微信中的文字内容
        $("#content>div:nth-of-type(8)>div:nth-of-type(3)").CSS("display","none");
        $("#content>div:nth-of-type(8)>div:nth-of-type(4)").CSS("display","none");
        $("#content>div:nth-of-type(8)>div:nth-of-type(1)").CSS("display","block");
        $("#content>div:nth-of-type(8)").CSS("padding-top","1.25rem");
    }else{
        $('#content > div:nth-of-type(6) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2)').Class('not-wx');
    }

    //== 追加打赏 ==
    appendReward$.Click(function () {
        
		$.page("techReward&techId=" + techId + "&backPublic=true" + (commentId?"&commentId=" + commentId:"")  );
        
    });

    //== 再来一单 ==
    addOrder$.Click(function () {
        var url = 'confirmOrder&clubId='+clubId;
        if(itemId){
            url +="&itemId="+itemId;
        }
        if(techId){
            url +="&techId="+techId
        }
        $.login(url,false,true,true);
    });


    function setTelDial(telephone){
        var str='';
        for(var i= 0,str1=telephone.split(','),length=str1.length;i<length;i++){
            str+='<div>商家电话：'+str1[i]+'</div>';
        }
        $('#telDetail>div').Html(str+'<div>取消</div>');

        var telDetail = $("#telDetail");
        telDetail.Event('touchmove',function(e){
            e.preventDefault();
        },false);
        telDetail.Click(function(e,item){
            if(e.target==item) telDetail.ClassClear("active");
        });
        //拨号
        var tel=$('#telDetail>div>div');
        var telCancel=tel.Remove(tel.length-1);
        tel.Click(function(e,item){
            location.href='tel:'+item.innerHTML.split("：")[1];
        });
        telCancel.Click(function(){
            telDetail.ClassClear("active");
        });

        ///////////////////////////////////
        $("#content>div:nth-of-type(5)>div:nth-of-type(4)>div").Click(function(){
            if($("#content>div:nth-of-type(3)>div:nth-of-type(2)>div:nth-of-type(1)").Html()!="技师待定"){
                $.page("chat&techId="+techId+($.$.visitChannel=="9358" ? "&clubId="+clubId : ""));
            }else telDetail.Class("active");
        });
        $("#content>div:nth-of-type(2)>div:nth-of-type(2)").Click(function(){
            telDetail.Class("active");
        });
    }
})();