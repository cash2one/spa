(function () {
    var techId = $.param('techId'),isTech = !!techId;
    $.ajax({
        url:'../api/v2/club/clubortech/view',
        isReplaceUrl:true,
        data:{
            id:isTech?techId: $.$.clubID,
            type:isTech?'tech':'club'
        },
        success: function (result) {
            if(result.statusCode == 200){
                result = result.respData;
                $('#content > div > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1)').CSS('background-image','url('+(result.imageUrl || (isTech? $.$.defaultHeader : $.$.defaultClubLogo))+')');
                $('#content > div > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1)').Text(result.name);
                if(isTech){
                    if(result.serialNo){
                        $('#content > div > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2)').Text(result.serialNo);
                    }else{
                        $('#content > div > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2)').CSS('display','none');
                    }
                }else{
                    $('#content > div > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2)').CSS('display','none');
                    $('#content > div > div:nth-of-type(1) > div:nth-of-type(3)').Class('club');
                    $('#content > div > div:nth-of-type(1) > div:nth-of-type(5) > div').Class('club');
                    $('#content > div > div:nth-of-type(1) > div:nth-of-type(5) > div > div:nth-of-type(1)').Text('更多活动信息，');
                    $('#content > div > div:nth-of-type(1) > div:nth-of-type(5) > div > div:nth-of-type(2)').Text('长按关注会所~');
                }
                var tmpHtml = [],images = result.images || [],imgArea = $('#content > div > div:nth-of-type(1) > div:nth-of-type(2)');
                images.forEach(function (url) {
                    tmpHtml.push('<div style="background-image: url('+(url || $.$.defaultHeader)+')"></div>');
                });
                if(tmpHtml.length == 0){
                    tmpHtml.push('<div></div>');
                }
                imgArea.Class('club').Html(tmpHtml.join(''));
                if(!isTech){
                    imgArea.Class('club');
                }
                //优惠券信息
                $('#content > div > div:nth-of-type(1) > div:nth-of-type(3) > div > div:nth-of-type(1)').Text(result.couponTitle);

                var couponValue = $('#content > div > div:nth-of-type(1) > div:nth-of-type(3) > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2)');
                couponValue.Text(result.couponValue);
                if(result.couponValue.toString().length>=6){
                    couponValue.CSS('font-size','1.1rem');
                }else if(result.couponValue.toString().length>=4){
                    couponValue.CSS('font-size','1.4rem');
                }

                //二维码
                $('#content > div > div:nth-of-type(1) > div:nth-of-type(4) > img')[0].src = result.qrCodeUrl || result.qrcodeUrl;
                $.pageSwitch(false);
                /*wx.ready(function () {
                    wx.hideAllNonBaseMenuItem();
                });*/
            }else{
                $.page($.$.tmpHash || 'home');
            }
        }
    });
})();