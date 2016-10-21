(function(){
    $.ajax({
        url: 'activities',
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
            //优惠券
            if(dataLength!=0)
                str+='<div class="title">优惠券</div><div class="coupon-list">';
            for (i = 0; i < dataLength; i++) {
                data['coupons'][i]['useType'] = ( data['coupons'][i]['useType']=="null" ? "money" : data['coupons'][i]['useType']);
                var v = data['coupons'][i];
                str +='<div class="money-coupon">\
                              <div data-act-id="'+ v.actId +'">\
                                <div>'+ v.actTitle +'</div>\
                                <div>'+ (v.useType == 'money'?(v.actValue+'元现金券，'):'') + v.consumeMoneyDescription +'</div>\
                              </div>\
                              <div>\
                                <div>'+ v.useTypeName +'</div>\
                                <div class="sure-btn '+((v.getFlag == 'already_get' || v.getFlag == 'finish_get')?'disabled':'')+'" data-act-id="'+ v.actId
                  +'" data-act-value="'+ v.actValue +'" data-act-title="'+ v.actTitle +'" data-user-get-count="'+ v.userGetCount+'"  data-user-get-counts="'+ v.userGetCounts+'">'
                  +(v.getFlag == 'already_get'?'已领取':(v.getFlag == 'finish_get'?'已领完':'立即领取'))+'</div>\
                              </div>\
                            </div>';

                /*str +=
                    '<div class="money '+(data['coupons'][i]['useType']=='money' ? ' ' : 'coupon ')+data['coupons'][i]['getFlag']+'">\
                        <div>\
                            <div>'+(data['coupons'][i]['useType'] == 'money' ? '<span>￥</span>'+data['coupons'][i]['actValue'] : data['coupons'][i]['actTitle'])+'</div>';

                if(data['coupons'][i]['useType']=='money'){
                    if(data['coupons'][i]['consumeMoney']==0){
                        data['coupons'][i]['consumeMoneyDescription'] = "不限使用";
                        str += '<span style="visibility: hidden">'+data['coupons'][i]['consumeMoneyDescription']+'</span>';
                    }
                    else{
                        str += '<span>'+(data['coupons'][i].useType == 'money'?(data['coupons'][i].actValue+'元现金券，'):'') +data['coupons'][i]['consumeMoneyDescription']+'</span>';
                    }
                }
                else{
                    str += '<span>'+data['coupons'][i]['actValue']+'<span>元&nbsp;&nbsp;&nbsp;&nbsp;原价：<span>'+data['coupons'][i]['consumeMoney']+'元</span></span></span>';
                }

                str +='<div>\
                                <div>'+data['coupons'][i]['useTypeName']+'</div>\
                                <div>'+(data['coupons'][i]['getFlag']=='already_get' ? '已领取' : (data['coupons'][i]['getFlag']=='finish_get' ? '已领取完' : '立即领取'))+'</div>\
                            </div>\
                            <div></div><div></div>\
                        </div>\
                    </div>';*/
            }
            str+='</div>';
            //活动
            dataLength=data['acts'].length;
            if(dataLength!=0)
                str+='<div class="title">优惠活动</div>';
            for (i = 0; i < dataLength; i++) {
                str +=
                    '<div class="activity" style="background-image: url(\''+data['acts'][i]['actLogoUrl']+'\')">\
                    <div>\
                        <div>'+data['acts'][i]['actTitle']+'</div>\
                        <div>活动时间：'+ $.formatDate(data['acts'][i]['startDate'],data['acts'][i]['endDate'])+'</div>\
                        </div>\
                    </div>';
            }
            if(str=='') $('#content>div:nth-of-type(2)').Class('nullData');
            else $('#content>div:nth-of-type(2)').Html(str);
            /*************************************定义逻辑*************************************/
            //点击活动
            $('.activity').Click(function(e,item,index){
                $.page('promotionsActivity&id='+data['acts'][index]['actId']);
            });

            //**************************消息弹出框
            //点击"取消"
            $("#popCouponInfo>div>div:nth-of-type(2)>div:nth-of-type(1)").Click(function(){
                popCouponInfo.ClassClear();
            });
            //点击"立即查看"
            $("#popCouponInfo>div>div:nth-of-type(2)>div:nth-of-type(2)").Click(function(){
                $.page("personal");
            });

            //点击优惠券领取
            var getCouBtn = $('#content>div:nth-of-type(2)>div.coupon-list>div.money-coupon.money-coupon>div:nth-of-type(2)>div:nth-of-type(2)');
            getCouBtn.Click(function(e,item,index){
                var $item = $(item);
                if(!$.$.userToken){//跳转到登录
                    $.$.loginUrl = "promotions";
                    $.page("login");
                }else if(!$.$.userTel){
                    $.$.loginUrl = "promotions";
                    $.bindPhone();
                    return true;
                }else if(!$item.ClassHave("disabled") && !$item.ClassHave("disabled") && !inGetting){
                    var shareUrl = data["coupons"][index]["shareUrl"];
                    inGetting = true;

                    $item.Class('disabled');
                    $item.Text('领取中...');
                    //领取优惠券
                    $.ajax({
                        url : '../get/redpacket',
                        data:{
                            actId : data["coupons"][index]["actId"],
                            phoneNum : $.$.userTel,
                            openId : $.$.openId
                        },
                        success : function(res){
                            inGetting = false;
                            $item.ClassClear('disabled');
                            $item.Text('立即领取');
                            if(res.statusCode == 200){
                                popCouponInfo.Class("active");
                                if(data["coupons"][index]["couponType"]!="redpack"){
                                    data["coupons"][index]["userGetCounts"]++;
                                    data["coupons"][index]["couponSellTotal"]++;
                                }
                            }
                            else if(res.statusCode == 206){
                                $.tipShow(res.msg || "你已经领取过了！");
                            }
                            else{
                                $.tipShow(res.msg || "领取失败！");
                            }

                            if(res.statusCode !=200 && data["coupons"][index]["couponType"]!="redpack" ){
                                $item.Class('disabled');
                                if(res.statusCode==200 || res.statusCode==206) item.innerHTML = "已领取完";
                            }

                            if(data["coupons"][index]["couponType"]=="redpack"){
                                $item.Class('disabled');
                                if(res.statusCode==200 || res.statusCode==206) item.innerHTML = "已领取";
                            }
                            else if(res.statusCode == 200){
                                if(!(data["coupons"][index]["userGetCount"]>data["coupons"][index]["userGetCounts"] && data["coupons"][index]["couponSellTotal"]<data["coupons"][index]["actTotal"])){
                                    $item.Class('disabled');
                                    if(res.statusCode==200 || res.statusCode==206) item.innerHTML = "已领取完";
                                }
                            }
                        },
                        error : function(res){
                            if(res.msg){
                                $.tipShow(res.msg);
                            }
                            inGetting = false;
                            $item.ClassClear('disabled');
                            $item.Text('立即领取');
                        }
                    });
                }
            });

            //执行页面切换
            $.pageSwitch();
        }
    });
})();