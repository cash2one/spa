(function(){
    $.ajax({
        url: '../api/v1/profile/redpack/list',
		isReplaceUrl:true,
        data: { clubId : $.param('clubId') || $.$.clubID },
        success: function (data) {
            if(data.statusCode != "200"){
                $.tipShow(data.msg);
                return $.pageCancel();
            }
            data=data['respData'];
            /*************************************定义常用变量*************************************/
            var i,
                str = '',
                dataLength=data['coupons'].length,
                popCouponInfo = $("#popCouponInfo"),
                inGetting = false;
            /*************************************加载数据*************************************/
            for (i = 0; i < dataLength; i++) {
                if(data['coupons'][i]['couponType'] == 'paid'){        //点钟券
                    data['coupons'][i]['useType'] = ( data['coupons'][i]['useType']=="null" ? "money" : data['coupons'][i]['useType']);
                    str +=
                        '<div class="money" data-act-id="'+data['coupons'][i]['actId']+'">\
                        <div>\
                            <div>'+(data['coupons'][i]['useType'] == 'money' ? '<span>￥</span>'+data['coupons'][i]['actValue'] : data['coupons'][i]['actTitle'])+'</div>';

                    str += '<span>'+data['coupons'][i]['consumeMoneyDescription']+'</span>';
                    str +='<div>\
                                <div>'+data['coupons'][i]['useTypeName']+'</div>\
                                <div>立即购买</div>\
                            </div>\
                            <div></div><div></div>\
                        </div>\
                    </div>';
                }
            }

            if(str=='') $('#content>div:nth-of-type(2)').Class('nullData');
            else $('#content>div:nth-of-type(2)').Html(str);
            /*************************************定义逻辑*************************************/

            //点击立即购买
            $('#content>div:nth-of-type(2)>div.money').Click(function(e,item,index){
                var actId = item.dataset.actId;
                if(!$.$.userToken){//跳转到登录
                    $.$.loginUrl = 'paidCoupon&actId='+actId+'&techCode='+ ($.param('techCode') || $.getUrlParam('techCode'));
                    $.page("login");
                }
                else{
                    $.page('paidCoupon&actId='+actId+'&techCode='+ ($.param('techCode') || $.getUrlParam('techCode')));
                }
            });

            //执行页面切换
            $.pageSwitch();
        }
    });
})();