(function () {
    var orderId = $.param("id"),
        k,
        $canUse = $(".can-use"),
        $used = $(".used"),
        $qrCodeArr,
        qrCode,
        cardId = "";

    if(!orderId){
        $.tipShow("页面缺少访问参数！");
        return $.pageCancel();
    }

    $(".ope-wrap>div").Click(function(e,item){
        var index = item.getAttribute("data-index");
        $(".ope-wrap>div").ClassClear("active");
        item.classList.add("active");
        if(index == 0){
            $canUse.Show();
            $used.Hide();
        } else {
            $canUse.Hide();
            $used.Show();
        }
    });

    // 到次卡详情
    $(".service-item").Click(function(){
        $.page("onceCardDetail&id="+cardId)
    })

    // 获取用户次卡订单详情
    $.ajax({
        url: "../api/v2/club/once_card/order/detail",
        isReplaceUrl : true,
        data: { orderId: orderId },
        success: function(res){
            if(res.statusCode == 200){
                res = res.respData;
                var orderData = res.order;

                // 设置会所logo 名称
                $(".title>div").CSS("background-image","url("+(orderData.clubImageUrl || $.$.defaultClubLogo)+")");
                $(".title>span").Text(orderData.clubName);

                $(".title").Click(function(){
                    if($.$.clubID){
                        $.page("home")
                    } else {
                        location.href = location.origin+"/spa-manager/spa2/?club="+orderData.clubId+"#home";
                    }
                })

                $("#footer").Click(function(){
                    if($.$.clubID){
                        $.page("discountMall")
                    } else {
                        location.href = location.origin+"/spa-manager/spa2/?club="+orderData.clubId+"#discountMall";
                    }
                })

                // 设置服务项目信息
                $(".service-item>div:nth-of-type(1)").CSS("background-image","url("+(orderData.imageUrl || $.$.defaultService)+")");
                $(".service-item>div:nth-of-type(2)").Text(orderData.itemName);
                $(".service-item>div:nth-of-type(3)>span").Text((orderData.amount/100).toFixed(2));
                $(".service-item>div:nth-of-type(4)").Text(orderData.useEndTime ? "有效期至："+orderData.useEndTime : "长期有效");

                // 设置可用，已用数目
                if(orderData.status == 2){ // 过期
                    $(".ope-wrap>div:nth-of-type(1)")[0].innerHTML = "失效（<span></span>）"
                }
                var canUseCount = orderData.totalCount - orderData.usedCount;
                $(".ope-wrap>div:nth-of-type(1)>span").Text(canUseCount)
                $(".ope-wrap>div:nth-of-type(2)>span").Text(orderData.usedCount)


                // couponList
                var canUseCouponStr = "", usedCouponStr = "", couponList = res.couponList, couponData, str;
                var canUseCount = 0, usedCount = 0, tag;

                for(k = 0; k<couponList.length;k++){
                    couponData = couponList[k];
                    tag = couponData.couponSettled == "Y";
                    tag ? usedCount++ : canUseCount++;
                    if(k==0){
                        cardId = couponData.actId;
                    }
                    str = "<div class='coupon'>\
                                <div>券"+(tag ? usedCount : canUseCount)+"</div>\
                                <div no='"+couponData.couponNo+"'></div>\
                                <div>核销码：<span>"+$.spaceStr(couponData.couponNo,false,4)+"</span></div>"+(tag ? "<div>使用时间："+couponData.modifyDate+"</div>" : "")+"\
                             </div>";
                    if(tag){
                        usedCouponStr += str;
                    } else {
                        canUseCouponStr += str;
                    }
                }

                if(canUseCount == 0){
                    $canUse.Html("<div class='no-data'>已经全部用完啦~</div>")
                } else {
                    $canUse.Html("<div class='item'>\
                                                    <h4>"+orderData.itemName+"券</h4>"+canUseCouponStr+"\
                                                </div>")

                    // 生成二维码
                    $qrCodeArr = $(".can-use>div.item>div.coupon>div:nth-of-type(2)");
                    for(k=0;k<$qrCodeArr.length;k++){
                        qrCode = new QRCode($qrCodeArr[k],{ width:430, height:430})
                        qrCode.makeCode($qrCodeArr[k].getAttribute("no"))
                    }
                }

                if(orderData.usedCount == 0){
                    $used.Html("<div class='no-data'>还没有使用记录~</div>")
                } else {
                    $used.Html("<div class='item'>\
                                                    <h4>"+orderData.itemName+"券</h4>"+usedCouponStr+"\
                                                </div>")
                    // 生成二维码
                    $qrCodeArr = $(".used>div.item>div.coupon>div:nth-of-type(2)");
                    for(k=0;k<$qrCodeArr.length;k++){
                        qrCode = new QRCode($qrCodeArr[k],{ width:430, height:430})
                        qrCode.makeCode($qrCodeArr[k].getAttribute("no"))
                    }
                }

                $.pageSwitch();
            }
        }
    })
})();