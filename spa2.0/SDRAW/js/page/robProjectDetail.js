(function(){

    var projectId = $.param('robProjectId') || $.getUrlParam('robProjectId') || '',
      payAuthCode = $.param('code') || $.getUrlParam('code') || $.$.payAuthCode,
      paramData = $.sessionStorage('con-rob-project-param');
    $.$.payAuthCode = payAuthCode;
    if(!projectId){
        $.tipShow('缺少活动ID');
        return $.pageCancel();
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
                state:'confirm-order'
            },
            success: function (result) {
                if (result.statusCode == 200){
                    initPage();
                }else if(result.statusCode == '935801'){
                    $.getOauthCode('','9358','confirm-rob-project','base');
                }
                else {
                    $.tipShow(result.msg || "获取openId失败！");
                    return $.pageCancel();
                }
            }
        });
    }else{
        initPage();
    }

    function initPage(){
        var isCredits = false,isCanPaid = false;
        $.ajax({
            url:'../api/v2/club/paid_service_item/view',
            isReplaceUrl:true,
            data:{
                id:projectId
            },
            success: function (result) {
                if(result.statusCode == 200){
                    result = result.respData;
                    //$('#content>div>div:nth-of-type(1)>img').Attr('src',result.imageUrl);
                    $('#content>div>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type(1)').Text(result.name);
                    if(result.canPaidCount == 0 || result.canPaidCount - result.paidCount > 0 ){
                        isCanPaid = true;
                    }
                    $('#content>div>div:nth-of-type(2)>div:nth-of-type(3)>div:nth-of-type(2)').Html(result.canPaidCount>0?('剩余<span>'+(result.canPaidCount - result.paidCount)+'</span>份'):'<span>不限份数</span>');
                    $('#content>div>div:nth-of-type(2)>div:nth-of-type(2)>span:nth-of-type(1)').Text(result.amount);
                    $('#content>div>div:nth-of-type(2)>div:nth-of-type(3)>div:nth-of-type(1)>span>span').Text(result.price);
                    if(result.credits <= 0 ){
                        $('#content>div>div:nth-of-type(2)>div:nth-of-type(2)>span:nth-of-type(2),#content>div>div:nth-of-type(2)>div:nth-of-type(2)>span:nth-of-type(3)').Class('hide');
                    }
                    $('#content>div>div:nth-of-type(2)>div:nth-of-type(2)>span:nth-of-type(3)>span').Text(result.credits);

                    //==== 积分开关 ====
                    $.ajax({
                        url:'../api/v2/user/switches',
                        isReplaceUrl:true,
                        data:{
                            clubId: $.$.clubID
                        },
                        success: function (response) {
                            if(response.statusCode == 200){
                                response = response.respData;
                                if(response.credit.clubSwitch == 'on' && response.credit.systemSwitch == 'on' && result.credits > 0){
                                    $('#confirmBtn>div:nth-of-type(1)').ClassClear('hide');
                                    isCredits = true;
                                }
                            }
                        }
                    });

                    var startDate = +new Date(result.startDate.replace(/-/g,'/')),endDate = +new Date(result.endDate.replace(/-/g,'/')),isStart = false,isEnd = false;
                    calcTime();
                    function calcTime(){
                        //===========抢项目 活动倒计时==========//
                        var round = Math.round,floor = Math.floor,millis,endTimeProject,
                          currTime = +new Date(),
                          millisec,sec,min,hour,day
                          ,spans = $('#content>div>div:nth-of-type(3)>span')
                          ,labels = $('#content>div>div:nth-of-type(3)>span>div'),timeData
                          ,isStartMillis = false;       //是否启用毫秒
                        if(startDate > currTime){
                            millis = startDate - currTime;
                            $('#content>div>div:nth-of-type(3)>div:nth-of-type(2)').Text('距开始还剩：');
                        }else if(endDate > currTime){
                            millis = endDate - currTime;
                            $('#content>div>div:nth-of-type(3)>div:nth-of-type(2)').Text('距结束还剩：');
                            isStart = true;
                            if(isCanPaid)
                                $('#confirmBtn').ClassClear('disabled');
                        }else{
                            isStart = true;
                            isEnd = true;
                            $('#content>div>div:nth-of-type(3)>div:nth-of-type(2)').Text('已结束：');
                            $('#confirmBtn').Class('disabled');
                            return;
                        }
                        endTimeProject = millis/1000;

                        if(endTimeProject > 0){
                            millisec = floor(millis%1000/10);
                            sec = floor(endTimeProject%60);
                            min = floor(endTimeProject/60%60);
                            hour = floor(endTimeProject/3600%24);
                            day = floor(endTimeProject/3600/24);

                            timeData = [floor(day/10),day%10,floor(hour/10),hour%10,floor(min/10),min%10,floor(sec/10),sec%10,floor(millisec/10),floor(millis%10)];
                            //timeData = [0,0,0,0,0,0,0,5,9,5];

                            labels.Index(0).Children().Text(timeData[0]);
                            labels.Index(1).Children().Text(timeData[1]);
                            labels.Index(2).Children().Text(timeData[2]);
                            labels.Index(3).Children().Text(timeData[3]);
                            labels.Index(4).Children().Text(timeData[4]);
                            labels.Index(5).Children().Text(timeData[5]);
                            labels.Index(6).Children().Text(timeData[6]);
                            labels.Index(7).Children().Text(timeData[7]);
                            labels.Index(8).Children().Text(timeData[8]);
                            labels.Index(9).Children().Text(timeData[9]);

                            //== 开始计时
                            if(day == 0 && !isStartMillis){
                                isStartMillis = true;
                                $('.rob-day').Class('hide');
                                $('.rob-milli').ClassClear('hide');
                                setTimeout(startToggleMillis,10);
                            }
                            setTimeout(startToggle,millis%1000);


                            //==== 添加动画回调事件 =======
                            spans.Event((function(){
                                var t,el = document.createElement('tmpelement'),
                                  transitions = {
                                      'transition':'transitionend',
                                      'OTransition':'oTransitionEnd',
                                      'MozTransition':'transitionend',
                                      'WebkitTransition':'webkitTransitionEnd',
                                      'MsTransition':'msTransitionEnd'
                                  };

                                for(t in transitions){
                                    if( el.style[t] !== undefined ){
                                        return transitions[t];
                                    }
                                }
                            }()), function (e, item) {
                                var $item = $(item),cs = $item.Children().Index(0).Children();
                                cs.Index(1).Text(cs.Index(0).Text());
                                $item.ClassClear('toggle');
                                if(timeData[0] == 0 && timeData[1] == 0 && !isStartMillis){
                                    isStartMillis = true;
                                    $('.rob-day').Class('hide');
                                    $('.rob-milli').ClassClear('hide');
                                }
                            });

                            //========= 数值渐变 =========
                            function startToggleMillis(){
                                if(timeData[9]>0){
                                    timeData = [timeData[0],timeData[1],timeData[2],timeData[3],timeData[4],timeData[5],timeData[6],timeData[7],timeData[8],timeData[9] - 1];
                                    changeNums([9]);
                                }else if(timeData[8]>0){
                                    timeData = [timeData[0],timeData[1],timeData[2],timeData[3],timeData[4],timeData[5],timeData[6],timeData[7],timeData[8]-1,9];
                                    changeNums([8,9]);
                                }else{
                                    if(timeData.join('').replace(/0/g,'') == ''){
                                        if(!isStart||!isEnd){
                                            calcTime();
                                        }else{
                                            $('#content>div>div:nth-of-type(3)>div:nth-of-type(2)').Text('已结束：');
                                            $('#confirmBtn').Class('disabled');
                                        }
                                        return true;
                                    }
                                }
                                setTimeout(startToggleMillis,10);
                            }
                            function startToggle(){
                                var tmpArr = [];
                                if(timeData[7]>0){
                                    timeData = [timeData[0],timeData[1],timeData[2],timeData[3],timeData[4],timeData[5],timeData[6],timeData[7] - 1,9,9];
                                    tmpArr = tmpArr.concat([7]);
                                }else if(timeData[6]>0){
                                    timeData = [timeData[0],timeData[1],timeData[2],timeData[3],timeData[4],timeData[5],timeData[6] - 1,9,9,9];
                                    tmpArr = tmpArr.concat([6,7]);
                                }else if(timeData[5]>0){
                                    timeData = [timeData[0],timeData[1],timeData[2],timeData[3],timeData[4],timeData[5] - 1,5,9,9,9];
                                    tmpArr = tmpArr.concat([5,6,7]);
                                }else if(timeData[4]>0){
                                    timeData = [timeData[0],timeData[1],timeData[2],timeData[3],timeData[4] - 1,9,5,9,9,9];
                                    tmpArr = tmpArr.concat([4,5,6,7]);
                                }else if(timeData[3]>0){
                                    timeData = [timeData[0],timeData[1],timeData[2],timeData[3] - 1,5,9,5,9,9,9];
                                    tmpArr = tmpArr.concat([3,4,5,6,7]);
                                }else if(timeData[2]>0){
                                    timeData = [timeData[0],timeData[1],timeData[2]-1,9,5,9,5,9,9,9];
                                    tmpArr = tmpArr.concat([2,3,4,5,6,7]);
                                }else if(timeData[1]>0){
                                    timeData = [timeData[0],timeData[1] - 1,2,4,5,9,5,9,9,9];
                                    tmpArr = tmpArr.concat([1,2,3,4,5,6,7]);
                                }else if(timeData[0]>0){
                                    timeData = [timeData[0] - 1,9,2,4,5,9,5,9,9,9];
                                    tmpArr = tmpArr.concat([0,1,2,3,4,5,6,7]);
                                }else{
                                    if(timeData.join('').replace(/0/g,'') == '') {
                                        if (!isStart || !isEnd) {
                                            calcTime();
                                        } else {
                                            $('#content>div>div:nth-of-type(3)>div:nth-of-type(2)').Text('已结束：');
                                            $('#confirmBtn').Class('disabled');
                                        }
                                        return true;
                                    }
                                }
                                changeNums(tmpArr);
                                setTimeout(startToggle,1000);
                            }
                            function changeNums(_indexs){
                                _indexs.forEach(function (v) {
                                    labels.Index(v).Children().Index(0).Text(timeData[v]);
                                    spans.Index(v).Class('toggle');
                                })
                            }
                        }
                    }


                    $('#content>div>div:nth-of-type(4)>div:nth-of-type(1)').CSS('background-image','url('+ $.$.clubLogo +')');
                    $('#content>div>div:nth-of-type(4)>div:nth-of-type(2)').Text($.$.clubName);
                    $('#projectExplain>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type(2)')
                      .Text(result.startDate + ' - ' + result.endDate);
                    $('#projectExplain>div:nth-of-type(2)>div:nth-of-type(2)>div:nth-of-type(2)>div:nth-of-type(1)>span')
                      .Text(result.useStartDate.split(' ')[0] + ' - ' + result.useEndDate.split(' ')[0]);
                    if(result.usePeriod){
                        $('#projectExplain>div:nth-of-type(2)>div:nth-of-type(2)>div:nth-of-type(2)>div:nth-of-type(2)>span')
                          .Text((result.usePeriod || '').replace(/(\d)/g,function(){return ['周日','周一','周二','周三','周四','周五','周六'][arguments[1]]}) + ' '+ (result.startTime ? (result.startTime.replace(/:00$/g,'') + ':00 - ' + result.endTime.replace(/:00$/g,'') + ':00'):''));      //可用时段
                    }else{
                        $('#projectExplain>div:nth-of-type(2)>div:nth-of-type(2)>div:nth-of-type(2)>div:nth-of-type(2)').CSS('display','none');
                    }
                    $('#projectExplain>div:nth-of-type(2)>div:nth-of-type(2)>div:nth-of-type(2)>div:nth-of-type(3)').Html(result.instructions);
                    $('#itemExplain>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type(1)>div:nth-of-type(1)')
                      .CSS('background-image','url('+ result.imageUrl +')');
                    $('#itemExplain>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type(1)>div:nth-of-type(2)>div:nth-of-type(1)').Text(result.name);
                    $('#itemExplain>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type(1)>div:nth-of-type(2)>div:nth-of-type(2)>span:nth-of-type(1)')
                      .Text(result.price+'元/'+result.duration+result.durationUnit);
                    $('#itemExplain>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type(1)>div:nth-of-type(2)>div:nth-of-type(2)>span:nth-of-type(2)')
                      .Text(result.pricePlus?(result.pricePlus+'元/'+result.durationPlus+result.durationUnit):'');
                    $('#itemExplain>div:nth-of-type(2)>div:nth-of-type(2)>div:nth-of-type(2)>div:nth-of-type(1)').Html(result.description || '无');

                    $('#content>div>div:nth-of-type(4)').Click(function () {
                        $.page('home',-1,true);
                    });

                    //=== 分享 ===
                    if($.$.ua.isWX){
                        $.X5Config({
                            title: $.$.clubName+'-'+result.name+'限时抢购就等你来', //分享标题
                            desc:  '据说这个项目一般人抢不到，但是我觉得你可以！抢项目，约技师，享人间极乐。', // 分享描述
                            link: result.shareUrl || location.href, // 分享链接
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

                    //==== 判断是否已登录或已绑定手机 ====
                    function checkLoginOrBindPhone(){
                        if(!$.$.userToken){//未登录
                            $.tipShow("请您先登录！");
                            $.$.loginUrl=location.hash;
                            $.page("login");
                            return false;
                        }else if(!$.$.userTel){
                            $.$.loginUrl = location.hash;
                            $.bindPhone(true);
                            return false;
                        }
                        return true;
                    }
                    //===== 购买 ====
                    var confirmBtn = $('#confirmBtn'),confirmBtnDiv = $('#confirmBtn>div');
                    confirmBtnDiv.Index(0).Click(function () {
                        if(!checkLoginOrBindPhone()) return;
                        if(!isStart) return $.tipShow('活动未开始');
                        if(isEnd) return $.tipShow('活动已结束');
                        if(isCredits){
                            if(confirmBtn.ClassHave('disabled')) return;
                            if(confirmBtn.ClassHave('processing')){
                                return $.tipShow('购买中，请稍候...');
                            }
                            confirmBtn.Class('processing');
                            confirmBtnDiv.Index(0).Class('loading').Text('购买中...');
                            $.ajax({
                                url:'../api/v2/club/credits/paid/service_item',
                                isReplaceUrl: true,
                                data:{
                                    id:projectId,
                                    techCode: $.$.techInviteCode || $.param('techCode') || '',
                                    userCode: $.$.userCode || $.param('userCode') || ''
                                },
                                success: function (response) {
                                    confirmBtn.ClassClear('processing');
                                    confirmBtnDiv.Index(0).ClassClear('loading').Text('积分购买');
                                    if(response.statusCode == 200){
                                        $.tipShow("支付成功！");
                                        $.page('robProjectSuccess&id='+response.respData);
                                    }else{
                                        $.tipShow(response.msg || '积分支付失败');
                                    }
                                }
                            });
                        }else{
                            $.tipShow('未开通积分购买');
                        }
                    });

                    confirmBtnDiv.Index(1).Click(function () {
                        if(!checkLoginOrBindPhone()) return;
                        if(!isStart) return $.tipShow('活动未开始');
                        if(isEnd) return $.tipShow('活动已结束');
                        if(!$.$.ua.isWX){
							if($.checkAccessMenu('robProjectDetail')){
								$.tipShow('请在微信中打开')
							}
							return ;
						} 
                        if(confirmBtn.ClassHave('disabled')) return;
                        if(confirmBtn.ClassHave('processing')){
                            return $.tipShow('购买中，请稍候...');
                        }
                        confirmBtn.Class('processing');
                        confirmBtnDiv.Index(1).Class('loading').Text('购买中...');
                        $.ajax({
                            url : '../api/v2/wx/pay/paid_service_item',
                            isReplaceUrl:true,
                            type:'post',
                            data : {
                                paidServiceItemId:projectId,
                                clubId: result.clubId,
                                tradeChannel:'wx',
                                businessChannel: $.getUrlParam('channel') || 'link'
                            },
                            success : function(result){
                                if(result.statusCode==200){
                                    result =  JSON.parse(result.respData);
                                    function onBridgeReady() {
                                        WeixinJSBridge.invoke(
                                          'getBrandWCPayRequest', {
                                              "appId": result.appId,     //公众号名称，由商户传入
                                              "timeStamp": result.timeStamp+"",  //时间戳，自1970年以来的秒数
                                              "nonceStr": result.nonceStr, //随机串
                                              "package": result.package,
                                              "signType": result.signType,   //微信签名方式
                                              "paySign" : result.paySign
                                          },
                                          function (res) {
                                              confirmBtn.ClassClear('processing');
                                              if (res.err_msg.indexOf("ok")>=0) {//支付成功之后
                                                  $.tipShow("支付成功！");
                                                  $.page('robProjectSuccess&id='+result.bizId);
                                              }// res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠
                                              else{
                                                  confirmBtnDiv.Index(1).ClassClear('loading').Text('现金购买');
                                                  $.tipShow("未能成功支付！");
                                                  //==== 支付失败，删除预支付订单 ===
                                                  $.ajax({
                                                      url:'../api/v2/club/user_paid_service_item/delete/paid',
                                                      isReplaceUrl:true,
                                                      data:{
                                                          id: result.bizId
                                                      },
                                                      success: function () {}
                                                  });
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
                                }else if(result.statusCode == '935801'){
                                    $.localStorage('con-rob-project-param',true);
                                    $.getOauthCode('','9358','confirm-rob-project','base');
                                }
                                else{
                                    $.tipShow(result.msg || "抢项目失败！");
                                    confirmBtn.ClassClear('processing');
                                    confirmBtnDiv.Index(1).ClassClear('loading').Text('现金购买');
                                }
                            },
                            error : function(){
                                $.tipShow('error');
                                confirmBtn.ClassClear('processing');
                                confirmBtnDiv.Index(1).ClassClear('loading').Text('现金购买');
                            }
                        })
                    });

                    if(paramData){
                        confirmBtn[0].click();
                    }
                }else{
                    $.tipShow(result.msg || '查询抢项目详情失败');
                }
            }
        });
    }

    $.pageSwitch();
})();