(function(){
    var id = $.param('id'),isIntegral = $.param('isIntegral') === 'true',couponType = $.param('couponType') || 'paid_service_item';
    if(!id){
        $.tipShow('缺少必要参数：ID');
        return $.page('home',-1,true);
    }

    $('div#title>div:nth-of-type(2)').Click(function (e) {
        e.stopImmediatePropagation();
        $.page('home',-1,true);
    });

    $('#content>div>div:nth-of-type(2)').Page('home',-1,true);
    $('#content>div>div:nth-of-type(2)>div:nth-of-type(1)').CSS('background-image','url('+ $.$.clubLogo +')');
    $('#content>div>div:nth-of-type(2)>div:nth-of-type(2)').Text($.$.clubName);
    var params = {};
    if(isIntegral){
        params.suaId = id;
    }else{
        params.payId = id;
    }
    $.ajax({
        url:'../api/v2/club/user/service_item_coupon/pay/view',
        isReplaceUrl:true,
        data:params,
        success: function (result) {
            if(result.statusCode == 200){
                result = result.respData;
                $('#content>div>div:nth-of-type(4)>div:nth-of-type(1)>div:nth-of-type(1)>span').Text(spaceStr(result.couponNo) || '支付处理中...');

                $('#show-coupons-pop>div>div>a').Text(result.shareUrl)

                $('#content>div>div:nth-of-type(3)>div:nth-of-type(4)').Click(function () {
                    if($.$.ua.isWX){
                        $('#_shareMask',true).Class('active');
                    }else{
                        $('#show-coupons-pop').Class('active');
                    }
                });
                $('#show-coupons-pop>div>div:nth-of-type(3)').Click(function () {
                    $('#show-coupons-pop').ClassClear('active');
                });
                $('#content>div>div:nth-of-type(4)').Click(function (e, item) {
                    $.page('couponDetail&userActId='+result.id+'&couponType='+couponType);
                });
                if($.$.ua.isWX){
                    $.X5Config({
                        title: $.$.clubName+'-'+result.name+'限时抢购就等你来', //分享标题
                        desc:  '据说这个项目一般人抢不到，但是我觉得你可以！抢项目，约技师，享人间极乐。', // 分享描述
                        link: result.shareUrl, // 分享链接
                        imgUrl: result.imageUrl, // 分享图标
                        success: function (){
                            $('#_shareMask',true).ClassClear('active');
                        },
                        cancel: function () {
                            //用户取消分享后执行的回调函数
                        },
                        fail: function (res) {
                            $.tipShow("分享失败！请稍后再试！");
                        }
                    });
                }
            }else{
                $.tipShow(result.msg || '查询出错');
            }
        }
    });

    //加载推荐技师
    $.ajax({
        url:'../api/v2/club/top/techs',
        isReplaceUrl:true,
        data:{
            clubId: $.$.clubID
        },
        success: function (result) {
            if(result.statusCode == 200){
                var _techHtml = [],result = result.respData;
                result.forEach(function (techObj,index) {
                    if(index > 4) return false;
                    _techHtml.push('<div data-tech-id="'+techObj.id+'">\
                                        <div style="background-image: url('+(techObj.avatarUrl || $.$.defaultHeader)+')"><div>'+techObj.name+'</span></div></div>\
                                    </div>');
                });
                if(_techHtml.length > 0){
                    $('#content>div>div:nth-of-type(5)').ClassClear('hide');
                    $('#content>div>div:nth-of-type(5)>div:nth-of-type(2)>div').Html(_techHtml.join(''));
                    scrollHori({
                        container:$('#content>div>div:nth-of-type(5)>div:nth-of-type(2)>div')[0],
                        showEleCount:4
                    });
                    $('#content>div>div:nth-of-type(5)>div:nth-of-type(1)').Page('technicianList');
                    $('#content>div>div:nth-of-type(5)>div:nth-of-type(2)>div>div').Click(function (e, item) {
                        $.page('technicianDetail&id='+item.dataset.techId);
                    });
                }
            }
        }
    });

    $.pageSwitch();


    /**
     * 用空格来间隔字符串
     * @param str     字符串
     * @param last    逆向开始
     * @param num     多少个字符一间隔
     * @param space   间隔几个空格
     */
    function spaceStr(str,last,num,space){
        if(!str) return;
        var tmpArr = [],spaceStr='';
        last = last===true;
        num = Math.abs(num || 4);
        space = Math.abs(space || 1);
        str = str.split('');
        if(last){
            str = str.reverse();
        }
        for(var j=space;j>0;j--){
            spaceStr+=' ';
        }
        str.forEach(function (v, i) {
            tmpArr.push(v);
            if((i+1)%num == 0){
                tmpArr.push(spaceStr);
            }
        });
        if(last){
            tmpArr.reverse();
        }
        return tmpArr.join('');
    }
})();