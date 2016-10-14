(function(){
    var $joinInfo = $('#join-info'),
        $joinFirst = $('#joinFirst'),
        $joinSuccess = $('#joinSuccess'),
        $joinNotice = $('#joinNotice'),
        $timesCount = $('#joinFirst .times-count'),
        $reduceCount = $('#joinFirst .reduce-count'),
        $plusCount = $('#joinFirst .plus-count'),
        $selectAll = $('#joinFirst>div:nth-of-type(2)>.input-item:nth-of-type(2)>div:nth-of-type(3)'),
        $closeBtn = $('#join-info .close-btn'),
        reduceTimer = null,
        plusTimer = null,
        isPay = false,
        clubId = '',
        $telFirst = $('#joinFirst > div:nth-of-type(2) > .input-item:nth-of-type(1) > div:nth-of-type(2) > input'),
        $telNext = $('#joinNotice > div:nth-of-type(2) > .input-item > div:nth-of-type(2) > input'),
        $searchBtn = $('.act-mynums > div:nth-of-type(2) > a'),
        
        tel = $.localStorage('_indianas_tel_phone') || $.$.userTel || '',
        isNeedQuery = false,
        buyNos = [],
        actId = $.param('id') || $.getUrlParam('id') || '',
        timesSurplus = 0,     //剩余可参与次数
        shareCode = $.getUrlParam('shareCode') || '',
        authCode = $.getUrlParam('code') || '',
        openId = $.localStorage('_indianas_user_open_id') || '';
        //openId='';
    if(!actId){
        $.tipShow('参数不正确。');
        return $.pageCancel();
    }
    function getAuthCode() {
        var _tmpSearch = location.search;
        if (/_t=(\d*)/g.test(_tmpSearch)) {
            _tmpSearch = _tmpSearch.replace(/_t=(\d*)/g, function () {
                return "_t=" + Date.now();
            });
        } else {
            if (_tmpSearch)
                _tmpSearch += '&_t=' + Date.now();
            else _tmpSearch += '?_t=' + Date.now();
        }
        var pageUrl = location.origin + location.pathname + _tmpSearch + location.hash;
        pageUrl = pageUrl.replace(/(&|\?)code=[\da-zA-Z]+(&?)/g, function (v1, v2, v3) {
            if (v2 == '?') {
                return v3 ? '?' : '';
            } else {
                return v3 ? '&' : '';
            }
        });
        pageUrl = pageUrl.replace(/(&|\?)state=[\da-zA-Z_\-]+(&?)/g, function (v1, v2, v3) {
            if (v2 == '?') {
                return v3 ? '?' : '';
            } else {
                return v3 ? '&' : '';
            }
        });
        $.ajax({
            url: ($.$.clubID ? "../" : "")+"../wx/oauth2/code",
            data: { wxmp: '9358', state:'plumflowers_pay', pageUrl : encodeURIComponent(pageUrl), scope:'snsapi_base' },
            success: function (result) {
                if (result.statusCode == 200) {
                    location.href = result.respData;
                }
                else {
                    $.tipShow(msg || result.msg || "请求微信授权失败！");
                }
            }
        });
    }
    if($.$.ua.isWX){
        if(!openId || openId.length < 10){
            if((new Date().getTime() - ($.getUrlParam('_t') || 0) > 24000) || !authCode){
                getAuthCode();
                return;
            }else{
                $.ajax({
                    url: "../api/v2/wx/oauth2/openid",
                    isReplaceUrl:true,
                    data: {
                        code:authCode,
                        scope:'snsapi_base',
                        wxmp: '9358',
                        openId: '',
                        webSessionId: ''
                    },
                    success: function (resp) {
                        if (resp.statusCode == 200){
                            openId =  resp.respData.openid;
                            $.localStorage("_indianas_user_open_id",openId);
                            initPage();
                        }else if(resp.statusCode == '40029'){
                            getAuthCode();
                        }
                        else{
                            $.tipShow(resp.msg || "获取openId失败！");
                            return $.pageCancel();
                        }
                    }
                });
            }
        }else{
            initPage();
        }
    }else{
        initPage();
    }

    function initPage(){
        //===== 加载数据 ====
        $.ajax({
            url:'../api/v2/plumflower/view',
            isReplaceUrl:true,
            type:'post',
            data:{
                id:actId,
                phoneNum:tel,
                shareCode: $.getUrlParam('shareCode') || '',
                topShareCode: $.getUrlParam('topShareCode') || '',
                chanel: $.getUrlParam('chanel') || 'link'
            },
            success: function (result) {
                if(result.statusCode == 200){
                    result = result.respData;
                    clubId = result.clubId;
                    if($.$.ua.isWX){//分享配置
                        $("#share-coupons-pop>div:nth-of-type(1)").CSS("display","block");
                        setWXShare(result);
                    }
                    else{
                        $("#share-coupons-pop>div:nth-of-type(2)").CSS("display","block");
                    }
                    shareCode = result.shareCode || shareCode;
                    $("#share-coupons-pop>div:nth-of-type(2)>div:nth-of-type(1)").Html("<a href='"+result.shareUrl+"'>"+result.shareUrl+"</a>");//设置分享链接
                    $('.header > .logo').CSS("background-image",'url('+(result.clubLogo || 'img/logo_default.jpg')+')');
                    $('.header > .club-name').Text(result.clubName);
                    $('.show-imgs>img')[0].src = result.plumFloweActivity.imageUrl;
                    $('.act-process > .act-process-detail > div:nth-of-type(2)').Text(result.plumFloweActivity.title);
                    $('.price').Text(result.plumFloweActivity.price);
                    $('.act-process > .act-process-detail > div:nth-of-type(3) > span:nth-of-type(3)').Text('/'+result.plumFloweActivity.serviceTime +'分钟');
                    timesSurplus = result.plumFloweActivity.price - result.plumFloweActivity.successPaidAmount;
                    $('.timesSurplus').Text(timesSurplus);
                    $('.act-process > .act-process-bar > div > div:nth-of-type(1)').CSS("width",(result.plumFloweActivity.successPaidAmount/result.plumFloweActivity.price * 100).toFixed(3)+"%");
                    $('.act-process > .act-process-bar > div > div:nth-of-type(2)').CSS("left",(result.plumFloweActivity.successPaidAmount/result.plumFloweActivity.price * 100).toFixed(3)+"%");

                    //====
                    if(result.plumFloweActivity.status == 'complete'){
                        $('.act-process > .act-process-detail > div:nth-of-type(1)').Class('complete').Text('已结束');
                        if(result.plumFloweActivity.winningNo){
                            $('.act-result > div:nth-of-type(4) > div:nth-of-type(1) > span').Text(result.plumFloweActivity.winningNo);
                            $('.act-result > div:nth-of-type(3)').Class('hide');
                            $('.act-result > div:nth-of-type(4)').ClassClear('hide');
                            //=== 福彩3D的号码
                            $('.act-result > div:nth-of-type(4) > div:nth-of-type(2) >span').Text(result.plumFloweActivity.lotteryNo);
                        }else{
                            $('.act-result > div:nth-of-type(3)').ClassClear('hide');
                            $('.act-result > div:nth-of-type(4)').Class('hide');
                        }


                        $('#footer>div:nth-of-type(1)').Class('next-time').ClassClear('robed').Text('下次通知我');
                        $('#footer>div:nth-of-type(2)').Text('给朋友看看');

                        $('.act-result').ClassClear('hide');
                    }else if(Array.isArray(result.actNos) && result.actNos.length>0){
                        $('.act-result > div:nth-of-type(3)').ClassClear('hide');
                        $('.act-result > div:nth-of-type(4)').Class('hide');
                        if(timesSurplus == 0){
                            $('.act-result').ClassClear('hide');
                        }
                        $('.act-mynums').ClassClear('no-nums');
                    }

                    $('.lottery-date').Text(result.plumFloweActivity.lotteryDate || '无');

                    if(timesSurplus == 0){
                        $('#footer>div:nth-of-type(1)').Class('next-time').ClassClear('robed').Text('下次通知我');
                        $('#footer>div:nth-of-type(2)').Text('给朋友看看');
                    }

                    //==== 已存在手机号 ====
                    if(Array.isArray(result.actNos) && result.actNos.length>0){
                        //=== 已购买的号码
                        var _html = [];
                        result.actNos.forEach(function (v) {
                            _html.push('<li><div><div><span>手机<span>'+ v.phoneNum +'</span></span><span>'+ dateFormat(new Date(v.createdAt),'MM月dd日 hh:mm:ss') +'</span></div><div>'+
                              (function (nos) {
                                  var _tmpArr = [],nos = nos.split(',');
                                  nos.forEach(function (no) {
                                      _tmpArr.push('<span '+(no == result.plumFloweActivity.winningNo?'style="color:#fb5549;"':'')+'>'+no+'</span>');
                                      buyNos.push('<span>'+no+'</span>')
                                  });
                                  return _tmpArr.join('');
                              })(v.actNo)
                              +'</div></div></li>');
                        });
                        $('.item.act-mynums > div:nth-of-type(3) > ul').Html(_html.join(''));
                    }else if(tel){
                        if($.param('isSearch')){
                            $.paramClear('isSearch');
                            $.tipShow('未查询到您的购买信息。',5000);
                        }
                        //$('.act-mynums').Class('hide');
                    }

                    if(tel){
                        $('#joinFirst > div:nth-of-type(2) > .input-item:nth-of-type(1) > div:nth-of-type(2) > input,#joinNotice > div:nth-of-type(2) > .input-item > div:nth-of-type(2) > input').Value(tel,true);
                        $('#joinFirst > div.sure-btn,#joinNotice > div.sure-btn').ClassClear('disabled');
                        //$('.act-mynums > div:nth-of-type(2) > a').Class('hide');
                        isNeedQuery = true;
                    }



                    //==================== 事件绑定 ====================//
                    $('.club-name').Click(function () {
                        location.href = location.origin+location.pathname+'?club='+clubId;
                    });

                    $searchBtn.Click(function (e, item) {
                        $joinInfo.Class('active');
                        $joinFirst.Class('hide');
                        $joinSuccess.Class('hide');
                        $joinNotice.Class('hide');
                        $('#joinSearch').ClassClear('hide');
                    });
                    $('#joinSearch .sure-btn').Click(function (e, item) {
                        $.localStorage('_indianas_tel_phone',$('#joinSearch input').Value());
                        $.page('plumflowers&isSearch=true&_time='+new Date().getTime()+'&id='+actId,0,true,false);
                        return;
                    });

                    ////////////////////控制分享
                    var popWrap = $("#share-coupons-pop");
                    $(".shared").Click(function(){
                        popWrap.Class("active");
                    });
                    //点击关闭
                    $("#share-coupons-pop>div:nth-of-type(2)>div:nth-of-type(3)").Click(function(){
                        popWrap.ClassClear("active");
                    });
                    popWrap.Click(function(){
                        popWrap.ClassClear("active");
                    });
                    $("#share-coupons-pop>div:nth-of-type(2)").Click(function(e){
                        e.stopPropagation();
                    });
                    $("#share-coupons-pop>div:nth-of-type(1)").Click(function(e){
                        e.stopPropagation();
                    });

                    $('#footer').Delegate('click','>div.robed', function (e, item) {
                        $joinInfo.Class('active');
                        $joinFirst.ClassClear('hide');
                        $joinSuccess.Class('hide');
                        $joinNotice.Class('hide');
                        $('#joinSearch').Class('hide');
                    }).Delegate('click','>div.next-time', function (e, item) {
                        $joinInfo.Class('active');
                        $joinFirst.Class('hide');
                        $joinSuccess.Class('hide');
                        $joinNotice.ClassClear('hide');
                        $('#joinSearch').Class('hide');
                        $('#joinNotice>div:nth-of-type(2)').ClassClear('hide');
                        $('#joinNotice>div:nth-of-type(3)').Class('hide');
                    });

                    $closeBtn.Click(function (e, item) {
                        $joinInfo.ClassClear('active');
                    });
                    $('#joinFirst .sure-btn>div').Click(function (e, item) {
                        if($(item.parentNode).ClassHave('disabled')) return;
                        if($timesCount.Text() == 0){    //购买次数为0时，当作查询处理，刷新当前页面
                            $.localStorage('_indianas_tel_phone',$telFirst.Value());
                            $.page('plumflowers&isSearch=true&_time='+new Date().getTime()+'&id='+actId,0,true,false);
                            return;
                        }else if(!$.$.ua.isWX){
							if($.checkAccessMenu('plumflowers')){
								$.tipShow('请在微信中打开。')
							}
                            return ;
                        }
                        //=== 是否需要查询之前是否已有购买数据
                        if(isNeedQuery){
                            $.ajax({
                                url:'../api/v2/plumflower/view',
                                isReplaceUrl:true,
                                type:'post',
                                data:{
                                    id:actId,
                                    phoneNum:tel,
                                    shareCode: $.getUrlParam('shareCode') || '',
                                    topShareCode: $.getUrlParam('topShareCode') || '',
                                    chanel: $.getUrlParam('chanel') || 'link'
                                },
                                success: function (response) {
                                    if(Array.isArray(response.actNos) && response.actNos.length>0){
                                        //=== 已购买的号码
                                        var _html = [];
                                        response.actNos.forEach(function (v) {
                                            _html.push('<li><div><div><span>手机<span>'+ v.phoneNum +'</span></span><span>'+ dateFormat(new Date(v.createdAt),'MM月dd日 hh:mm:ss') +'</span></div><div>'+
                                              (function (nos) {
                                                  var _tmpArr = [],nos = nos.split(',');
                                                  nos.forEach(function (no) {
                                                      _tmpArr.push('<span '+(no == response.plumFloweActivity.winningNo?'style="color:#fb5549;"':'')+'>'+no+'</span>');
                                                      buyNos.push('<span>'+no+'</span>')
                                                  });
                                                  return _tmpArr.join('');
                                              })(v.actNo)
                                              +'</div></div></li>');
                                        });
                                        $('.item.act-mynums > div:nth-of-type(3) > ul').Html(_html.join(''));
                                        $('.act-mynums').ClassClear('no-nums');
                                    }
                                }
                            });
                        }

                        if(!isPay){
                            isPay = true;
                            $.ajax({
                                url:'../api/v2/wx/pay/paid_plumflower',
                                isReplaceUrl:true,
                                type:'post',
                                data:{
                                    plumFloweId:actId,
                                    amount:$timesCount.Text(),
                                    phoneNum:$telFirst.Value(),
                                    shareCode: $.getUrlParam('shareCode'),
                                    topShareCode: $.getUrlParam('topShareCode'),
                                    chanel: $.getUrlParam('chanel') || 'link',
                                    openId:openId,
                                    clubId:clubId,
                                    tradeChannel:'wx',
                                    businessChannel:$.getUrlParam('chanel') || 'link'
                                },
                                success: function (result) {
                                    if(result.statusCode == 200){
                                        result = result.respData;
                                        //var isUpdated = false;
                                        if(result.userPlumFlowe.userPlumFlowe.amount < $timesCount.Text()){
                                            //isUpdated = true;
                                            var upf = result.userPlumFlowe.userPlumFlowe,
                                              pf = result.userPlumFlowe.plumFlowe;
                                            var _paidAmount = upf.amount + pf.successPaidAmount
                                            timesSurplus = pf.price - pf.successPaidAmount;
                                            $('.timesSurplus').Text(timesSurplus);
                                            $('.act-process > .act-process-bar > div > div:nth-of-type(1)').CSS("width",(_paidAmount/pf.price * 100).toFixed(3)+"%");
                                            $('.act-process > .act-process-bar > div > div:nth-of-type(2)').CSS("left",(_paidAmount/pf.price * 100).toFixed(3)+"%");
                                            $timesCount.Text(timesSurplus==0?1:timesSurplus);
                                            if(timesSurplus == 0){
                                                $joinInfo.ClassClear('active');
                                                $('.act-result').ClassClear('hide');
                                                $('.lottery-date').Text(pf.lotteryDate);
                                                $('#footer>div:nth-of-type(1)').Class('next-time').ClassClear('robed').Text('下次通知我');
                                                $('#footer>div:nth-of-type(2)').Text('给朋友看看');
                                                if(pf.price - pf.successPaidAmount == 0 || upf.amount == 0){
                                                    isPay = false;
                                                    return $.tipShow('剩余次数为0，抱歉，您此次未抢到！');
                                                }
                                            }else{
                                                $.tipShow('剩余次数小于您所选购的次数，请注意！');
                                            }
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
                                                      $.tipShow("支付成功！");
                                                      $.localStorage('_indianas_tel_phone',$telFirst.Value());
                                                      if(tel && tel != $telFirst.Value()){
                                                          $('.act-mynums > div:nth-of-type(3) > ul').Html('');
                                                      }
                                                      $joinFirst.Class('hide');
                                                      $joinSuccess.ClassClear('hide');
                                                      var upf = result.userPlumFlowe.userPlumFlowe,
                                                            pf = result.userPlumFlowe.plumFlowe;
                                                      //if(!isUpdated){
                                                          var _paidAmount = upf.amount + pf.successPaidAmount
                                                          timesSurplus = pf.price - upf.amount - pf.successPaidAmount;
                                                          $('.timesSurplus').Text(timesSurplus);
                                                          $('.act-process > .act-process-bar > div > div:nth-of-type(1)').CSS("width",(_paidAmount/pf.price * 100).toFixed(3)+"%");
                                                          $('.act-process > .act-process-bar > div > div:nth-of-type(2)').CSS("left",(_paidAmount/pf.price * 100).toFixed(3)+"%");
                                                          if(timesSurplus == 0){
                                                              $('.act-result').ClassClear('hide');
                                                              var _lDate = new Date();
                                                              if(_lDate.getHours()>=20){
                                                                  _lDate.setDate(_lDate.getDate()+1);
                                                              }
                                                              $('.lottery-date').Text(dateFormat(_lDate,'yyyy-MM-dd'));
                                                              $('#footer>div:nth-of-type(1)').Class('next-time').ClassClear('robed').Text('下次通知我');
                                                              $('#footer>div:nth-of-type(2)').Text('给朋友看看');
                                                          }
                                                      //}
                                                      $('#joinSuccess .join-times>span').Text(upf.amount);
                                                      $('#joinSuccess .join-tel').Text(upf.phoneNum);
                                                      if(upf.amount + pf.successPaidAmount >= pf.price){
                                                        $('#joinSuccess .sure-btn>div').Class('num-over');
                                                      }else{
                                                        $('#joinSuccess .sure-btn>div').ClassClear('num-over');
                                                      }
                                                      var _tmpActHtml = [];
                                                      upf.actNo.split(',').forEach(function (v) {
                                                          _tmpActHtml.push('<span>'+v+'</span>');
                                                      });
                                                      $('#joinSuccess .join-nums').Html(_tmpActHtml.join(''));
                                                      $('.act-mynums').ClassClear('hide');
                                                      $('.act-mynums').ClassClear('no-nums');
                                                      $('.act-mynums > div:nth-of-type(3) > ul').Html('<li><div><div><span>手机<span>'+upf.phoneNum+'</span></span><span>'+(dateFormat(new Date(upf.createdAt),'MM月dd日 hh:mm:ss'))+'</span></div><div>'+_tmpActHtml.join('')+'</div></div></li>',true)
                                                  }// res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠
                                                  else{
                                                      $.tipShow("未能成功支付！");
                                                      $.ajax({
                                                          url:'../api/v2/plumflower/userplumflower/delete',
                                                          type:'post',
                                                          isReplaceUrl:true,
                                                          data:{ id:result.userPlumFlowe.userPlumFlowe.id },
                                                          success: function (response) {
                                                          }
                                                      });
                                                  }
                                                  $timesCount.Text(1);
                                                  $selectAll.ClassClear('checked');
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
                                    }else if(result.statusCode == 500){
                                        $.tipShow('此次未抢购成功。');
                                        $.page('plumflowers&isSearch=true&_time='+new Date().getTime()+'&id='+actId,0,true,false);
                                    }
                                }
                            });
                        }else{
                            $.tipShow('正在支付，请稍候...', 3000);
                        }
                    });
                    //==== 继续抢 ====
                    $('#joinSuccess .sure-btn>div>div:nth-of-type(1)').Click(function (e, item) {
                        $joinFirst.ClassClear('hide');
                        $joinSuccess.Class('hide');
                        $timesCount.Text(1);
                    });

                    //==== 下次通知 确定 ====
                    $('#joinNotice .sure-btn>div').Click(function (e, item) {
                        if($(item.parentNode).ClassHave('disabled')) return;
                        if($('#joinNotice > div:nth-of-type(2)').ClassHave('hide')){
                            $joinInfo.ClassClear('active');
                        }else{
                            $.ajax({
                                url:'../api/v2/plumflower/nextnoticeuser/save',
                                type:'post',
                                isReplaceUrl:true,
                                data:{
                                    phoneNum:$telNext.Value(),
                                    clubId:clubId,
                                    actId:actId
                                },
                                success: function (response) {
                                    if(response.statusCode == 200){
                                        $.tipShow('预约成功。');
                                        $('#joinNotice > div:nth-of-type(2)').Class('hide');
                                        $('#joinNotice > div:nth-of-type(3)').ClassClear('hide');
                                        $('#joinNotice > div:nth-of-type(3) > div:nth-of-type(3)').Text($telNext.Value());
                                    }else{
                                        $.tipShow(response.msg || '预约失败。');
                                    }
                                }
                            });
                        }
                    });
                    //=================全额======================//
                    $selectAll.Click(function (e, item) {
                        if($selectAll.ClassHave('checked')){
                            $selectAll.ClassClear('checked');
                        }else{
                            $selectAll.Class('checked');
                            $timesCount.Text(timesSurplus);
                        }
                    });
                    //================参与次数事件================//
                    function reduceCountFunc(){
                        clearTimeout(reduceTimer);
                        reduceTimer = 0;
                        if($timesCount.Text() > 1){
                            clearTimeout(reduceTimer);
                            clearTimeout(plusTimer);
                            plusTimer = 0;
                            $timesCount.Text($timesCount.Text() - 1);
                            reduceTimer = setTimeout(reduceCountFunc,100);
                        }
                    }
                    function plusCountFunc(){
                        clearTimeout(plusTimer);
                        plusTimer = 0;
                        if($timesCount.Text() < timesSurplus){
                            clearTimeout(reduceTimer);
                            clearTimeout(plusTimer);
                            reduceTimer = 0;
                            $timesCount.Text(($timesCount.Text() - 0) + 1);
                            plusTimer = setTimeout(plusCountFunc,100);
                        }
                    }
                    $reduceCount.Event('touchstart', function (e, item) {
                        e.preventDefault();
                        $selectAll.ClassClear('checked');
                        reduceCountFunc();
                    });
                    $reduceCount.Event('touchmove', function (e, item) {
                        clearTimeout(reduceTimer);
                        clearTimeout(plusTimer);
                        reduceTimer = 0;
                        plusTimer = 0;
                    });
                    $reduceCount.Event('touchend', function (e, item) {
                        e.preventDefault();
                        clearTimeout(reduceTimer);
                        clearTimeout(plusTimer);
                        reduceTimer = 0;
                        plusTimer = 0;
                    });
                    $plusCount.Event('touchstart', function (e, item) {
                        e.preventDefault();
                        plusCountFunc();
                    });
                    $plusCount.Event('touchmove', function (e, item) {
                        clearTimeout(reduceTimer);
                        clearTimeout(plusTimer);
                        reduceTimer = 0;
                        plusTimer = 0;
                    });
                    $plusCount.Event('touchend', function (e, item) {
                        e.preventDefault();
                        clearTimeout(reduceTimer);
                        clearTimeout(plusTimer);
                        reduceTimer = 0;
                        plusTimer = 0;
                    });
                }else{
                    $.tipShow(result.msg || '数据加载失败');
                }
                $.pageSwitch();
            }
        });


        $telFirst.Verify('tel', function (flag) {
            if(flag){
                $('#joinFirst > div.sure-btn').ClassClear('disabled');
            }else{
                $('#joinFirst > div.sure-btn').Class('disabled');
            }
        });
        $telNext.Verify('tel', function (flag) {
            if(flag){
                $('#joinNotice > div.sure-btn').ClassClear('disabled');
            }else{
                $('#joinNotice > div.sure-btn').Class('disabled');
            }
        });

        $('#joinSearch input').Verify('tel', function (flag) {
            if(flag){
                $('#joinSearch > div.sure-btn').ClassClear('disabled');
            }else{
                $('#joinSearch > div.sure-btn').Class('disabled');
            }
        });

        //设置微信分享
        function setWXShare(data){
            var shareLink;
            if(data.shareUrl) shareLink =  data.shareUrl;
            else{
                shareLink = $.param("chanel") ? location.href : location.href + "&chanel=link"
            }
            $.X5Config({
                title: '一元夺美女', //分享标题
                desc: '一元抢会所高端项目，美女技师任你挑~', // 分享描述
                link: shareLink, // 分享链接
                imgUrl: data.clubLogo || $.$.defaultClubLogo, //分享图标
                success: function (){
                    $.ajax({
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
                    });
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
        }

        function dateFormat(date, format){
            var o = {
                "M+" : date.getMonth()+1, //month
                "d+" : date.getDate(), //day
                "h+" : date.getHours(), //hour
                "m+" : date.getMinutes(), //minute
                "s+" : date.getSeconds(), //second
                "q+" : Math.floor((date.getMonth()+3)/3), //quarter
                "S" : date.getMilliseconds() //millisecond
            }

            if(/(y+)/.test(format)) {
                format = format.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));
            }

            for(var k in o) {
                if(new RegExp("("+ k +")").test(format)) {
                    format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
                }
            }
            return format;
        }
    }

    document.title='一元夺美女';
    if($.$.ua.isiPhone || $.$.ua.isWX){
        var doc = document, frame = doc.createElement('iframe');
        frame.style.display = 'none';
        frame.onload= function () {
            frame.onload=null;
            setTimeout(function () {
                doc.body.removeChild(frame);
            },0);
        };
        frame.src='img/cancel_icon.png';
        doc.body.appendChild(frame);
    }
})();