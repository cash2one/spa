(function () {
    var userOneYuanId = $.param('userOneYuanId') || $.getUrlParam('userOneYuanId',true),
        clubId = $.param('clubId') || $.getUrlParam('clubId',true) || $.$.clubID;
    if(!userOneYuanId || !clubId){
        $.tipShow('缺少必要参数');
        return $.pageCancel();
    }
    $.eventMaskShow(true);
    $.ajax({
        url:'../api/v2/club/one_yuan/draw/user_one_yuan/view',
        isReplaceUrl:true,
        data:{
            clubId:clubId,
            userOneYuanId: userOneYuanId
        },
        success: function (res) {
            $.eventMaskShow(false);
            if(res.statusCode == 200){
                res = res.respData;
                var userAct = res.userAct;

                //=== 会所信息
                $('div.club-info>div:nth-of-type(1)').CSS('background-image','url('+(userAct.clubImageUrl || $.$.defaultClubLogo)+')');
                $('div.club-info>div:nth-of-type(2)').Text(userAct.clubName);
                $('div.club-info').Click(function (e, item) {
                    if($.$.clubID && $.$.clubID == userAct.clubId){
                        $.page('home');
                    }else{
                        location.href = location.origin + location.pathname + '?club='+userAct.clubId;
                    }
                });

                //=== 项目信息 ===
                $('div.project-info>div:nth-of-type(1)').CSS('background-image','url('+res.imageUrl+')');
                $('div.project-info>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type(1)').Text(userAct.actTitle);
                $('div.project-info>div:nth-of-type(2)>div:nth-of-type(2)>span').Text(userAct.actValue+'元');
                $('div.project-info>div:nth-of-type(2)>div:nth-of-type(3)>span').Text(res.ticketNo);

                //=== 二维码 ===
                if(userAct.couponQrCodeUrl){
                    $('#content>div.qr-info>img')[0].src = userAct.couponQrCodeUrl;
                }else{
                    var count = 3;
                    function getQrCodeUrl(){
                        $.ajax({
                            url:'../api/v2/club//user/coupon_qrcode',
                            isReplaceUrl:true,
                            data: {
                                userActId:userAct.suaId
                            },
                            success: function (result) {
                                if(result.statusCode == 200 ){
                                    $('#content>div.qr-info>img')[0].src = result.respData;
                                }else if(count > 0){
                                    count --;
                                    getQrCodeUrl();
                                }else{
                                    $.tipShow(result.msg || '获取二维码失败');
                                }
                            }
                        });
                    }
                    getQrCodeUrl();
                }
                $('#content>div.qr-info>span').Text($.spaceStr(userAct.couponNo));

                //=== 活动说明 ===
                $('div.explain-item>.exp-item-plain:nth-of-type(2)>span').Text(userAct.couponPeriod);   //使用时间
                if(userAct.useTimePeriod){
                    $('div.explain-item>.exp-item-plain:nth-of-type(3)>span').Text(userAct.useTimePeriod);
                    $('div.explain-item>.exp-item-plain:nth-of-type(3)').Show()
                }
                $('#actExplain>.exp-item-ul').Html(userAct.actContent);

                //=== 项目说明 ===
                $('#projectExplain>.exp-item-ul').Html(userAct.actDescription);
            }else{
                $.tipShow(res.msg || '查询数据失败');
            }
        }
    });
    $.pageSwitch();
})();