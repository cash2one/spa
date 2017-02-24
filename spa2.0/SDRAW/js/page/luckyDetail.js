(function(){
    var actId = $.param("actId"),
        cardId = $.param("cardId"),
        prizeType = $.param("prizeType"),
        recordId = $.param("recordId"),
        clubId = $.param("clubId") || $.$.clubID;
    if(!actId){
        $.pageCancel();
        return $.tipShow("地址栏参数不正确！");
    }
    $("#content>div#title>div:nth-of-type(2)").Click(function(event){
        event.stopImmediatePropagation();
        if($.$.visitChannel == "9358"){
            history.go(-1)
        }else {
            $.page("lucky",-1,true);
        }
    });

    $.ajax({
        url: ($.$.clubID ? "../" : "") + "api/v2/user/luckyWheel/cardPrizeDetail",
        isReplaceUrl:true,
        type: "post",
        data: {
            actId: actId,
            cardId: cardId,
            prizeType: prizeType,
            recordId: recordId
        },
        success: function (data) {
            if(data.statusCode == '307'){
                setTimeout(function () {
                    $.ajax({
                        url: ($.$.clubID ? "../" : "") + "api/v2/user/luckyWheel/cardPrizeDetail",
                        isReplaceUrl:true,
                        type: "post",
                        data: {
                            actId: actId,
                            cardId: cardId,
                            prizeType: prizeType,
                            recordId: recordId
                        },
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
        data = data.respData;
        $("#content>div:nth-of-type(2)>div:nth-of-type(1)").Text(data.clubName);

        ///////////////////奖品信息
        $("#content>div:nth-of-type(3)>div:nth-of-type(1)>div:nth-of-type(1)").Html("<div>"+( $.$.ua.isFirefox && data.prizeName.length>7 ?data.prizeName.length.substr(0,7)+"..." :data.prizeName)+"</div>");//名称编号
        $("#content>div:nth-of-type(3)>div:nth-of-type(1)>div:nth-of-type(2)").Text("中奖时间:" + data.prizeTime);
        $("#content>div:nth-of-type(3)>div:nth-of-type(2)").Text("大转盘");

        ///////////////////二维码信息
        if(prizeType == "1"){
            $("#content>div:nth-of-type(4)")[0].style.display="none";
            $("#content>div:nth-of-type(5)>div:nth-of-type(2)").Text($.spaceStr(data.verifyCode,false,4));
        }else {
            $("#content>div:nth-of-type(5)")[0].style.display="none";
            var verifyCode = data.verifyCode;
            if(verifyCode){
                verifyCode = $.spaceStr(verifyCode,false,4)
            }
            $("#content>div:nth-of-type(4)>div:nth-of-type(4)").Text(verifyCode);
            new QRCode($('#content  > div:nth-of-type(4) > div:nth-of-type(3)')[0],{
                text: eval("("+data.qrCode+")").qrNo
            })
        }

        ///////////////////抽奖说明
        $("#content>div:nth-of-type(6)>div:nth-of-type(2)").Html(data.actDesp || '暂无抽奖说明');

        $.pageSwitch(true,false);
    }
})();