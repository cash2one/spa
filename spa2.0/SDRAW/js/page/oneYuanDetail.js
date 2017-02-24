(function () {
    var $robBtn = $('#oneYuan-footer .robed'),
      $sharedBtn = $('#oneYuan-footer .shared'),
      $myNumsArea = $('#my-nums'),
      $popWrap = $("#share-coupons-pop"),
      $showNumsPop = $('#showNumsPop'),
      $showNumsPopCloseBtn = $('#showNumsPop>div>div:nth-of-type(1)>div:nth-of-type(2)'),
      $joinInfo = $('#join-info'),
      $phoneInput = $('.phone-item>div:nth-of-type(2)>input'),
      $codeInput = $('.code-item>div:nth-of-type(2)>input'),
      $sendCodeBtn = $('.phone-item>div:nth-of-type(3)'),
      intervalTime = 60,        //两次验证码的间隔时间
      $timesCount = $('#join-info .times-count'),
      $selectAll = $('#join-info>div>div:nth-of-type(2)>.input-item.amount-item>div:nth-of-type(3)'),
      isSelectAll = false,
      $closeBtn = $('#join-info .close-btn'),
      $sureBtn = $('#join-info div.sure-btn'),
      verifyArr = [0, 0],   //手机号与验证码是否全部填写了
      //是否已经绑定手机
      isBindPhone = !!$.$.userTel,
      //盛余可参与数量
      timesSurplus = 0,
      $timesSurplus = $('#join-info .timesSurplus'),
      oneYuanId = $.getUrlParam('oneYuanId',true),
      oneYuanBaseId = $.getUrlParam('oneYuanBaseId',true),
      otherUserNums,
      reloadCount = 3,
      payAuthCode = $.param('code') || $.getUrlParam('code') || $.$.payAuthCode,
      shareUrl,
      shareImage = './img/oneYuan/bg-image.jpg',
      loadQuest = 0,
      isLoadedRecords = false;

    if(!oneYuanId && !oneYuanBaseId){
        $.tipShow('缺少活动ID');
        return $.pageCancel();
    }

    /*if(!$.$.userToken){
        $.$.loginUrl = 'oneYuanDetail&oneYuanId='+oneYuanId;
        $.page('login');
        return $.tipShow('请先登录');
    }*/
    if(payAuthCode && $.getUrlParam('state') == 'paid-oneYuan'){
        $.ajax({
            url: ($.$.clubID ? "../" : "")+"../wx/oauth2/user/openid",
            type:'post',
            data: {
                code: payAuthCode,
                scope:'snsapi_base',
                wxmp: '9358',
                userType:'user',
                state:'paid-oneYuan'
            },
            success: function (result) {
                if (result.statusCode == 200){
                    $.$.openId = resp.respData.openid;
                    initPage();
                }else if(result.statusCode == '935801'){
                    $.getOauthCode('','9358','paid-oneYuan','base');
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

    //如果已经绑定手机了，则自动填写手机号码，且不可更改
    if(isBindPhone) {
        $('#join-info>div>div:nth-of-type(2)').Class('is-bind');
        $phoneInput.Value($.$.userTel).Attr('disabled','disabled');
        $sureBtn.ClassClear('disabled');
    }

    function initPage(){
        $.ajax({
            url:'../api/v2/club/one_yuan/view',
            isReplaceUrl:true,
            data:{
                clubId: $.$.clubID,
                oneYuanId: oneYuanId,
                oneYuanBaseId: oneYuanBaseId
            },
            success:function(res){
                if(res.statusCode == 200){
                    var lastOneYuanDrawLog = res.respData.lastOneYuanDrawLog,
                      myTicketNos = res.respData.myTicketNos.split(','),
                      oneYuanAct = res.respData.oneYuanAct,
                      oneYuanDrawLog = res.respData.oneYuanDrawLog;
                    timesSurplus = res.respData.canPaidCount;
                    $timesSurplus.Text(timesSurplus);
                    oneYuanId = oneYuanAct.id;

                    if(oneYuanId && !isLoadedRecords){
                        isLoadedRecords = true;
                        queryPaidRecords()
                    }
                    //获取分享链接
                    $.ajax({
                        url:'../api/v2/club/one_yuan/share/url',
                        isReplaceUrl:true,
                        data:{
                            oneYuanId:oneYuanId
                        },
                        success: function (res) {
                            if(res.statusCode == 200){
                                shareUrl = res.respData;
                                loadQuest ++;
                                if(loadQuest == 2){
                                    setWXShare();
                                }
                            }
                        }
                    });
                    oneYuanBaseId = oneYuanAct.oneYuanBaseId;
                    //往期中奖记录
                    $('#past-win-info>div:nth-of-type(1)').Page('oneYuanPastWinRecords&oneYuanBaseId='+oneYuanBaseId);
                    $('#oneYuan-header>img')[0].src = oneYuanAct.imageUrl || './img/oneYuan/bg-image.jpg';
                    shareImage = oneYuanAct.imageUrl || './img/oneYuan/bg-image.jpg';
                    loadQuest ++;
                    if(loadQuest == 2){
                        setWXShare();
                    }
                    $('#content>div:nth-of-type(1)').Class('act-'+oneYuanAct.status);
                    $('#act-processing>div:nth-of-type(1)>div:nth-of-type(2)').Html(oneYuanAct.actName+'<span>(第'+oneYuanAct.currentPeriod+'期)</span>');  //活动名称
                    $('#showNumsPop>div>div:nth-of-type(1)>div:nth-of-type(1)').Text(oneYuanAct.actName);
                    $('#act-processing>div:nth-of-type(1)>div:nth-of-type(3)>span:nth-of-type(1),#act-processing>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type(1)>span:nth-of-type(1)').Html('<span>￥</span>'+oneYuanAct.actPrice);     //项目价格
                    $('#act-processing>div:nth-of-type(1)>div:nth-of-type(3)>span:nth-of-type(2),#act-processing>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type(1)>span:nth-of-type(2)').Text(oneYuanAct.duration);
                    $('#act-processing>div:nth-of-type(2)>div:nth-of-type(2)>div').CSS('width',(oneYuanAct.paidCount/oneYuanAct.totalPaidCount*100)+'%');
                    $('#act-processing>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type(2)>span').Text(timesSurplus);

                    //====
                    $('#join-info>div>div:nth-of-type(1)>div:nth-of-type(1)>span').Text('('+oneYuanAct.unitPrice+'元参与一次)');

                    if(oneYuanAct.status === 'end'){
                        //===开奖倒计时
                        $('#act-processing>div:nth-of-type(1)>div:nth-of-type(1)').Text('待开奖');
                        var plusDate,
                          completeTime = new Date(oneYuanAct.completeTime),
                          drawTime,
                          times= ['00','时','00','分'],
                          calcFunc, h, m, sec,
                          timeSpan1 = $('#act-calc-time>div:nth-of-type(1)>div:nth-of-type(3)'),
                          timeSpan2 = $('#act-calc-time>div:nth-of-type(1)>div:nth-of-type(4)'),
                          timeSpan3 = $('#act-calc-time>div:nth-of-type(1)>div:nth-of-type(5)'),
                          timeSpan4 = $('#act-calc-time>div:nth-of-type(1)>div:nth-of-type(6)'),
                          showTimes = function () {
                              timeSpan1.Text(times[0]);
                              timeSpan2.Text(times[1]);
                              timeSpan3.Text(times[2]);
                              timeSpan4.Text(times[3]);
                          },intervalTime, cacheDate = $.localStorage('spa_one_yuan_detail') ? JSON.parse($.localStorage('spa_one_yuan_detail')) : {};

                        plusDate = cacheDate[oneYuanId] || 0;
                        if(plusDate && (new Date() - plusDate < 10*60*1000)){
                            $.tipShow('暂未开奖，稍后重新查询');
                            drawTime = new Date(plusDate - 0);
                        }else{
                            var todayDrawTime = new Date();
                            if(completeTime - new Date($.commonDateFormat(todayDrawTime,'yyyy/MM/dd 20:30:00')) > 0){
                                todayDrawTime.setDate(todayDrawTime.getDate() + 1);
                            }
                            drawTime = new Date($.commonDateFormat(todayDrawTime,'yyyy/MM/dd 21:00:00'));
                        }
                        calcFunc = function(){
                            var currTime = new Date();
                            if(drawTime - currTime > 0){
                                var dvaule = (drawTime - currTime)/1000;
                                h = ~~(dvaule / 3600 % 24);
                                m = ~~(dvaule / 60 % 60);
                                sec = ~~(dvaule % 60);
                                if(h > 0){
                                    times = [h<10?'0'+h:h,'时',m<10?'0'+m:m,'分'];
                                    intervalTime = (sec + 1) * 1000;
                                }else{
                                    times = [m<10?'0'+m:m,'分',sec<10?'0'+sec:sec,'秒'];
                                    intervalTime = 1000;
                                }
                                setTimeout(calcFunc,intervalTime);
                            }else{
                                //$.tipShow('已开奖，3秒后重新加载数据');
                                //setTimeout(function(){
                                    plusDate = new Date();
                                    plusDate.setMinutes(plusDate.getMinutes() + 10);
                                    var tmp = {};
                                    tmp[oneYuanId] = plusDate - 0;
                                    $.localStorage('spa_one_yuan_detail', JSON.stringify(tmp));
                                    initPage();
                                //},3000);
                            }
                            showTimes();
                        };
                        calcFunc();
                        $('#act-calc-time>div:nth-of-type(2)').Text('将以'+(drawTime.getFullYear()+'年'+(drawTime.getMonth()+1)+'月'+drawTime.getDate()+'日')+'福彩3D开奖结果为准');

                        //==== 隐藏底部的按钮 ===
                        $('#oneYuan-footer').Hide();
                    }else if(oneYuanAct.status === 'complete' && oneYuanDrawLog){
                        $('#act-processing>div:nth-of-type(1)>div:nth-of-type(1)').Text('已揭晓');
                        $('#winner-info>div>div:nth-of-type(1)>div:nth-of-type(1)').CSS('background-image','url('+(oneYuanDrawLog.userAvatarUrl || $.$.defaultHeader)+')');
                        $('#winner-info>div>div:nth-of-type(1)>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type(2)').Text(oneYuanDrawLog.userName);
                        $('#winner-info>div>div:nth-of-type(1)>div:nth-of-type(2)>div:nth-of-type(2)>div:nth-of-type(2)>span').Text(oneYuanDrawLog.ticketCount);
                        $('#winner-info>div>div:nth-of-type(1)>div:nth-of-type(2)>div:nth-of-type(3)>div:nth-of-type(2)').Text(oneYuanAct.drawTime);
                        $('#winner-info>div>div:nth-of-type(2)>div:nth-of-type(2)').Text(oneYuanDrawLog.actDrawNo);
                        //查看他人号码
                        $('#winner-info>div>div:nth-of-type(2)>div:nth-of-type(3)').Attr('data-user-id',oneYuanDrawLog.userId).Click(function (e, item) {
                            e.stopImmediatePropagation();
                            if(!otherUserNums){
                                $.ajax({
                                    url:'../api/v2/club/one_yuan/user/ticket_no',
                                    isReplaceUrl:true,
                                    data:{
                                        userId: item.dataset.userId,
                                        oneYuanId: oneYuanId
                                    },
                                    success:function(result){
                                        if(result.statusCode == 200){
                                            otherUserNums = result.respData.split(',');
                                            showOtherNums();
                                        }else{
                                            $.tipShow(resutl.msg || '查询中奖者号码失败');
                                        }
                                    }
                                });
                            }else{
                                showOtherNums();
                            }
                        });

                        if(res.respData.onlinePeriod){
                            $('#oneYuan-footer').Class('oneYuan-over');
                            //=== 前往正在进行的活动 ===
                            $('#oneYuan-footer>div:nth-of-type(2)>div:nth-of-type(1)').Text('第'+res.respData.onlinePeriod+'期正在火热进行中...');
                            $('#oneYuan-footer>div:nth-of-type(2)>div:nth-of-type(2)').Click(function () {
                                $.page('oneYuanDetail&oneYuanId='+res.respData.onlineOneYuanId,1,true);
                            });
                        }else{
                            $('#oneYuan-footer').Hide();
                        }
                    }else if(oneYuanAct.status === 'refund'){       //=== 已退款 ===
                        $('#act-processing>div:nth-of-type(1)>div:nth-of-type(1)').Text('已退款');
                        if(res.respData.onlinePeriod){
                            $('#oneYuan-footer').Class('oneYuan-over');
                            //=== 前往正在进行的活动 ===
                            $('#oneYuan-footer>div:nth-of-type(2)>div:nth-of-type(1)').Text('第'+res.respData.onlinePeriod+'期正在火热进行中...');
                            $('#oneYuan-footer>div:nth-of-type(2)>div:nth-of-type(2)').Click(function () {
                                $.page('oneYuanDetail&oneYuanId='+res.respData.onlineOneYuanId,1,true);
                            });
                        }else{
                            $('#oneYuan-footer').Hide();
                        }
                    }else if(oneYuanAct.status === 'not_online'){  //已下线
                        $('#act-processing>div:nth-of-type(1)>div:nth-of-type(1)').Text('已下线');
                        if(res.respData.onlinePeriod){
                            $('#oneYuan-footer').Class('oneYuan-over');
                            //=== 前往正在进行的活动 ===
                            $('#oneYuan-footer>div:nth-of-type(2)>div:nth-of-type(1)').Text('第'+res.respData.onlinePeriod+'期正在火热进行中...');
                            $('#oneYuan-footer>div:nth-of-type(2)>div:nth-of-type(2)').Click(function () {
                                $.page('oneYuanDetail&oneYuanId='+res.respData.onlineOneYuanId,1,true);
                            });
                        }else{
                            $('#oneYuan-footer').Hide();
                        }
                    }


                    //我的号码
                    if(myTicketNos.length > 0 && myTicketNos[0]){
                        $('#my-nums>div:nth-of-type(1)>div:nth-of-type(2)').Text(myTicketNos.slice(0,7).join(' '));
                        if(myTicketNos.length > 7){
                            $myNumsArea.ClassClear('no-more');
                            $('#my-nums>div:nth-of-type(2)>div:nth-of-type(1)').Text(myTicketNos.join(' '));
                        }else{
                            $myNumsArea.Class('no-more');
                        }
                    }else{
                        $myNumsArea.Class('null-data');
                        $('#my-nums>div:nth-of-type(1)>div:nth-of-type(2)').Text('您暂未购买');
                    }
                    if(lastOneYuanDrawLog){
                        //上期中奖
                        $('#past-win-info>div:nth-of-type(2)>div').CSS('background-image','url('+(lastOneYuanDrawLog.userAvatarUrl || $.$.defaultHeader)+')');
                        $('#past-win-info>div:nth-of-type(3)').Text(lastOneYuanDrawLog.userName + lastOneYuanDrawLog.phoneNum.replace(/^(\d{3})\d{4}(\d{4})$/g,'（$1****$2）'));
                        $('#past-win-info').ClassClear('hide');
                    }

                    //=== 活动说明 ===
                    $('div#actExplain>div:nth-of-type(2)>div:nth-of-type(2)>div:nth-of-type(2)>div:nth-of-type(1)').Html(oneYuanAct.actDescription || '无');
                    //=== 项目说明 ===
                    $('div#itemExplain>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type(1)>div:nth-of-type(1)').CSS('background-image','url('+ ( oneYuanAct.prizeImageUrl || $.$.defaultService )+')');
                    $('div#itemExplain>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type(1)>div:nth-of-type(2)>div:nth-of-type(1)').Text(oneYuanAct.actName);
                    $('div#itemExplain>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type(1)>div:nth-of-type(2)>div:nth-of-type(2)').Text(oneYuanAct.actPrice+'元/'+oneYuanAct.duration);
                    $('div#itemExplain>div:nth-of-type(2)>div:nth-of-type(2)>div:nth-of-type(2)>div:nth-of-type(1)').Html(oneYuanAct.prizeDescription || '无');

                    //=== 购买按钮 ===
                    var isPay = false;
                    $sureBtn.Click(function (e, item) {
                        if($sureBtn.ClassHave('disabled')) return;
                        if(isPay) return $.tipShow('支付购买中...');
                        isPay = true;
                        $.eventMaskShow(true);
                        if(isBindPhone){
                            $.tipShow('支付购买中...');
                            buy();
                        }else{
                            $.tipShow('绑定手机中...');
                            $.execBindPhone($phoneInput.Value(),$codeInput.Value(), function (callData) {
                                if(callData.statusCode != 200){      //绑定失败，也跳转到购买成功页面
                                    $.eventMaskShow(false);
                                    $.tipShow(callData.msg || '绑定失败，请重新绑定。');
                                }else{
                                    $.tipShow('绑定成功，支付购买中...');
                                    buy();
                                }
                            },false);
                        }
                        function buy(){
                            $.ajax({
                                url:'../api/v2/wx/pay/paid_one_yuan',
                                isReplaceUrl:true,
                                type:'post',
                                data:{
                                    count: $timesCount.Text(),
                                    chanel: $.getUrlParam('chanel',true) || 'link',
                                    clubId: $.$.clubID,
                                    oneYuanId: oneYuanId,
                                    openId: $.$.openId,
                                    phoneNum:$phoneInput.Value(),
                                    shareCode: $.getUrlParam('shareCode',true) || '',
                                    topShareCode: $.getUrlParam('topShareCode',true) || '',
                                    tradeChannel:'wx',
                                    businessChannel:$.getUrlParam('chanel',true) || 'link'
                                },
                                success: function (result) {
                                    if(result.statusCode == 200){
                                        result = result.respData;
                                        var oneYuanOrderLog = result.oneYuanOrderLog;
                                        if(oneYuanOrderLog.amount < $timesCount.Text()){
                                            timesSurplus = oneYuanOrderLog.amount;
                                            $('.timesSurplus,#act-processing>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type(2)>span').Text(timesSurplus);
                                            $('#act-processing>div:nth-of-type(2)>div:nth-of-type(2)>div').CSS('width','100%');
                                            $timesCount.Text(timesSurplus==0?1:timesSurplus);
                                            $.tipShow('剩余次数小于您所选购的次数，请注意！');
                                        }
                                        var tradeReqData =  JSON.parse(result.tradeReqData);
                                        function onBridgeReady() {
                                            WeixinJSBridge.invoke(
                                              'getBrandWCPayRequest', {
                                                  "appId": tradeReqData.appId,     //公众号名称，由商户传入
                                                  "timeStamp": tradeReqData.timeStamp+"",  //时间戳，自1970年以来的秒数
                                                  "nonceStr": tradeReqData.nonceStr, //随机串
                                                  "package": tradeReqData.package,
                                                  "signType": tradeReqData.signType,   //微信签名方式
                                                  "paySign" : tradeReqData.paySign
                                              },
                                              function (res) {
                                                  isPay = false;
                                                  if (res.err_msg && res.err_msg.indexOf("ok")>=0) {//支付成功之后
                                                      $.localStorage('tmpOneYuanNums_cache',JSON.stringify({
                                                          nums:oneYuanOrderLog.ticketNo,
                                                          shareUrl: shareUrl,
                                                          shareImage: shareImage,
                                                          oneYuanId:oneYuanId
                                                      })); //记录所购买的号码
                                                      $.tipShow('购买成功');
                                                      $.eventMaskShow(false);
                                                      $timesCount.Text(1);
                                                      $selectAll.ClassClear('checked');
                                                      $.page('oneYuanSuccess&oneYuanId=' + oneYuanId);
                                                  }// res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠
                                                  else{
                                                      isPay = false;
                                                      $.eventMaskShow(false);
                                                      $.tipShow("未能成功支付！");
                                                      $.ajax({
                                                          url:'../api/v2/club/one_yuan/pay_failure',
                                                          type:'post',
                                                          isReplaceUrl:true,
                                                          data:{ oneYuanOrderId:oneYuanOrderLog.id },
                                                          success: function (response) {
                                                          }
                                                      });
                                                  }
                                              });
                                        }

                                        if (typeof WeixinJSBridge == "undefined") {
                                            if (document.addEventListener) {
                                                document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
                                            } else if (document.attachEvent) {
                                                document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
                                                document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
                                            }
                                        } else {
                                            onBridgeReady();
                                        }
                                    }else if(result.statusCode == '935801'){
                                        isPay = false;
                                        $.eventMaskShow(false);
                                        $.tipShow('OpenId无效，重新授权');
                                        $.getOauthCode('','9358','paid-oneYuan','base');
                                    }else if(result.statusCode == 500){
                                        isPay = false;
                                        $.eventMaskShow(false);
                                        $.tipShow('此次未购买成功。');
                                    }
                                }
                            });
                        }
                    });
                }else{
                    $.tipShow(res.msg || '查询数据失败');
                }
            }
        });
    }

    //查询本期购买记录
    function queryPaidRecords(){
        $.ajax({
            url:'../api/v2/club/one_yuan/paid/records',
            isReplaceUrl: true,
            data:{
                clubId: $.$.clubID,
                oneYuanId: oneYuanId,
                page: 1,
                pageSize: 3
            },
            success:function(res){
                if(res.statusCode == 200){
                    var tmpHtml = [];
                    res = res.respData;
                    for(var i = 0,l = res.length; i < l; i++){
                        tmpHtml.push('<div class="join-item">\
                        <div style="background-image: url('+(res[i].userAvatarUrl || $.$.defaultHeader)+')"></div>\
                        <div>\
                            <div>\
                                <div>'+(res[i].userName + res[i].phoneNum.replace(/^(\d{3})\d{4}(\d{4})$/g,'（$1****$2）'))+'</div>\
                                <div><span>'+res[i].ticketCount+'</span>人次</div>\
                            </div>\
                            <div>'+res[i].createdTime+'</div>\
                        </div>\
                    </div>');
                    }
                    if(tmpHtml.length > 0){
                        $('#join-list>div:nth-of-type(2)>div:nth-of-type(1)').Html(tmpHtml.join(''));
                        $('#join-list>div:nth-of-type(2)').ClassClear('null-data');
                        $('#join-list>div:nth-of-type(1)>div:nth-of-type(3),#join-list>div:nth-of-type(1)>div:nth-of-type(4)').ClassClear('hide');
                        $('#join-list>div:nth-of-type(1)').Page('oneYuanJoinRecords&oneYuanId='+oneYuanId);
                    }
                }else{
                    $.tipShow(res.msg || '查询参与记录失败');
                }
            }
        });
    }

    if(oneYuanId && !isLoadedRecords){
        isLoadedRecords = true;
        queryPaidRecords()
    }

    $.pageSwitch(false);


    //===== 会所信息 ===
    $('#oneYuan-header>.club-info>div:nth-of-type(1)').CSS('background-image','url('+($.$.clubLogo || $.$.defaultClubLogo)+')');
    $('#oneYuan-header>.club-info>div:nth-of-type(2)').Text($.$.clubName || $.$.defaultClubName);
    $('#oneYuan-header>.club-info').Page('home',-1,true);

    //==== 活动规则 ===
    $('#oneYuan-header>div.act-rule').Page('oneYuanExplain');

    function showOtherNums(){
        $('#showNumsPop>div>div:nth-of-type(2)>div:nth-of-type(1)>span').Text(otherUserNums.length);
        $('#showNumsPop>div>div:nth-of-type(2)>div:nth-of-type(2)').Text(otherUserNums.join(' '));
        $showNumsPop.Class('active');
    }
    $showNumsPopCloseBtn.Click(function () {
        $showNumsPop.ClassClear('active');
    });

    //展开自己的号码
    $myNumsArea.Delegate('click','>div:nth-of-type(1)',function (e, item) {
        if(!$myNumsArea.ClassHave('no-more')){
            if($myNumsArea.ClassHave('expanded')){
                $myNumsArea.ClassClear('expanded');
            }else{
                $myNumsArea.Class('expanded');
            }
        }
    }).Delegate('click','>div:nth-of-type(2)>div:nth-of-type(2)', function (e, item) {
        $myNumsArea.ClassClear('expanded');
    });


    //一元抢 按钮
    $robBtn.Click(function (e, item) {
        if(!$.$.ua.isWX) return $.tipShow('请在微信浏览器中打开');
        if(!$.$.userToken){
            $.$.loginUrl = 'oneYuanDetail&oneYuanId='+oneYuanId;
            $.page('login');
            return $.tipShow('请先登录');
        }
        $joinInfo.Class('active');
    });

    //叫朋友一起 按钮
    $sharedBtn.Click(function(){
        $popWrap.Class("active");
    });
    //点击关闭
    $("#share-coupons-pop>div:nth-of-type(2)>div:nth-of-type(3)").Click(function(){
        $popWrap.ClassClear("active");
    });
    $popWrap.Click(function(){
        $popWrap.ClassClear("active");
    });
    $("#share-coupons-pop>div:nth-of-type(2)").Click(function(e){
        e.stopPropagation();
    });
    $("#share-coupons-pop>div:nth-of-type(1)").Click(function(e){
        e.stopPropagation();
    });

    //关闭按钮
    $closeBtn.Click(function (e, item) {
        $joinInfo.ClassClear('active');
    });

    //验证手机号与验证码
    $phoneInput.Verify('tel', function (flag) {
        verifyArr[0] = Number(flag);
        if(verifyArr[0]) $sendCodeBtn.ClassClear('disabled');
        else $sendCodeBtn.Class('disabled');
        checkVerifyArr();
    });
    $codeInput.Verify('authcode',function(flag){
        verifyArr[1] = Number(flag);
        checkVerifyArr();
    });

    function checkVerifyArr(){
        if(verifyArr[0]&(verifyArr[1]|Number(isBindPhone))){
            $sureBtn.ClassClear('disabled');
        }else{
            $sureBtn.Class('disabled');
        }
    }

    //发送验证码
    $sendCodeBtn.Click(function (e, item) {
        if($sendCodeBtn.ClassHave('disabled') || intervalTime < 60){
            return;
        }
        $sendCodeBtn.Class('disabled').Text('重发（60s）');
        $phoneInput.Attr('disabled','disabled');
        $.ajax({
            url: '../api/v1/icode',
            isReplaceUrl:true,
            type: 'get',
            data: { mobile: $phoneInput.Value() }
        });
        setTimeout(function sendCode() {
            intervalTime--;
            if(intervalTime > 0){
                $sendCodeBtn.Text('重发（'+intervalTime+'s）');
               setTimeout(sendCode,1000);
            }else{
                intervalTime = 60;
                $sendCodeBtn.Text('发送验证码');
                $phoneInput.AttrRemove('disabled');
                if(verifyArr[0]) $sendCodeBtn.ClassClear('disabled');
            }
        },1000);
    });


    //==== 购买数量 事件 ====
    var countTimer = 0,plusValue = 1,plusSpeed = 200
      ,runCount = 0;
    function initCountValue(){
        clearTimeout(countTimer);
        countTimer = 0;
        runCount = 0;
        plusSpeed = 200;
    }
    function plusCountFunc(){
        if((plusValue < 0 && $timesCount.Text() == 1) || (plusValue > 0 && $timesCount.Text() == timesSurplus)){
            initCountValue();
            return;
        }
        if(isSelectAll) {
            isSelectAll = false;
            $selectAll.ClassClear('checked');
        }
        runCount++;
        //if(runCount%5 == 0){
        plusSpeed = plusSpeed > 10 ? (plusSpeed-=5):plusSpeed;       //使渐变速度越来越快
        //}
        $timesCount.Text(parseInt($timesCount.Text()) + plusValue);
        countTimer = setTimeout(plusCountFunc,plusSpeed);
    }
    $('#join-info .reduce-count,#join-info .plus-count').Event('touchstart', function (e, item) {
        e.preventDefault();
        initCountValue();
        if(item.dataset.type == 'plus'){
            plusValue = 1;
        }else{
            plusValue = -1;
        }
        plusCountFunc()
    }).Event('touchmove', function (e, item) {
        /*clearTimeout(countTimer);
         countTimer = 0;
         runCount = 0;
         plusSpeed = 200;*/
    }).Event('touchend', function (e, item) {
        e.preventDefault();
        initCountValue();
    }).Event('touchcancel', function () {
        e.preventDefault();
        initCountValue();
    });

    //勾选全额
    $selectAll.Click(function (e, item) {
        if(isSelectAll){
            $selectAll.ClassClear('checked');
            $timesCount.Text(1);
        }else{
            $selectAll.Class('checked');
            $timesCount.Text(timesSurplus);
        }
        isSelectAll = !isSelectAll;
    });

    //设置微信分享
    function setWXShare(){
        if(!shareUrl){
            shareUrl = $.param("chanel") ? location.href : location.href + "&chanel=link"
        }
        if($.$.ua.isWX){
            $.X5Config({
                title: '谁替我买单', //分享标题
                desc: '我和你只有一块钱的距离,点我立即参与', // 分享描述
                link: shareUrl, // 分享链接
                imgUrl: shareImage, //分享图标
                success: function (){
                    $popWrap.ClassClear("active");
                    /*$.ajax({
                     url:'../api/v2/plumflower/share',
                     type:'post',
                     isReplaceUrl:true,
                     data:{
                     id:data.plumFloweActivity.id,
                     shareCode: shareCode || '',
                     topShareCode: $.getUrlParam('topShareCode') || '',
                     chanel: $.getUrlParam('chanel')
                     },
                     success: function () {

                     }
                     });*/
                },
                cancel: function () {
                    //用户取消分享后执行的回调函数
                },
                fail: function (res) {
                    $.tipShow("分享失败！请刷新页面后再试！");
                    $.ajax({
                        url:'../api/v2/user/share/info',
                        isReplaceUrl:true,
                        type:'post',
                        token:'null',
                        data:{
                            url:encodeURIComponent(location.href),
                            browser: encodeURIComponent($.$.ua.value),
                            message:encodeURIComponent(JSON.stringify(res||{}))
                        },
                        error:function(){}
                    });
                }
            });
            $('#share-coupons-pop>div:nth-of-type(1)').Show();
        }else{
            $('#share-coupons-pop>div:nth-of-type(2)>div:nth-of-type(1)>a').Text(shareUrl);
            $('#share-coupons-pop>div:nth-of-type(2)').Show();

        }
    }
})();