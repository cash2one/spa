(function () {
  //^(([1-9][0-9]*\.?[0-9]*)|(0\.?[0-9]*[1-9][0-9]*)|(0\.?01)|1)$
  var $moneyInput = $('#moneyInput'),
    $inputPlaceholder = $('#inputPlaceholder'),
    $deleteBtn = $('.money-info > div:nth-of-type(2) > div > i'),
    $sureBtn = $('#sureBtn'),
    oldMoney = '',
    openId = $.localStorage('_qrpay_user_open_id') || '',
    clubId = $.param('clubId') || $.getUrlParam('clubId') || '',
    payAuthCode = $.param('code') || $.getUrlParam('code') || $.$.payAuthCode,
    paramData = $.localStorage('con-qrpay-param')?JSON.parse($.localStorage('con-qrpay-param')):null;;

  if($.$.ua.isWX){
    if(!openId || openId.length < 10){
      if((new Date().getTime() - ($.getUrlParam('_t') || 0) > 24000) || !payAuthCode){
        $.getOauthCode('','9358','confirm-qrpay','base');
        return;
      }else{
        $.ajax({
          url: "../api/v2/wx/oauth2/openid",
          isReplaceUrl:true,
          data: {
            code:payAuthCode,
            scope:'snsapi_base',
            wxmp: '9358',
            openId: '',
            webSessionId: ''
          },
          success: function (resp) {
            if (resp.statusCode == 200){
              openId =  resp.respData.openid;
              $.localStorage("_qrpay_user_open_id",openId);
              initPage();
            }else if(resp.statusCode == '40029'){
              $.getOauthCode('','9358','confirm-qrpay','base');
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
    $moneyInput.Event('focus', function () {
      $inputPlaceholder.Class('hide');
    });
    $moneyInput.Event('blur', function () {
      if($moneyInput.Value() == ''){
        $inputPlaceholder.ClassClear('hide');
      }
    });
    $moneyInput.Event('input', function () {
      if($moneyInput[0].value == ''){
        if(oldMoney.length>1){
          $moneyInput[0].value = oldMoney;
        }else{
          oldMoney='';
          $sureBtn.Class('disabled');
        }
      }else{
        var tmp = $moneyInput[0].value.match(/\./g);
        if(tmp&&$moneyInput[0].value.match(/\./g).length>1){
          $moneyInput[0].value = $moneyInput[0].value.substring(0,$moneyInput[0].value.length -1);
        }
        if(!/^([1-9][0-9]*)$/g.test($moneyInput[0].value)){
          $moneyInput[0].value = oldMoney;
        }else{
          oldMoney = $moneyInput[0].value;
        }
        $sureBtn.ClassClear('disabled');
      }
    });
    $deleteBtn.Event('click', function () {
      $moneyInput[0].value = '';
      oldMoney = '';
      $inputPlaceholder.ClassClear('hide');
    });

    $.ajax({
      url:'../api/v2/club/'+clubId+'/clubName',
      isReplaceUrl:true,
      success: function (result) {
        $('#clubLogo').CSS('backgroundImage','url('+result.logo+')');
        $('#clubName').Text(result.name);

        //////////////////////////////////////////////////////////////支付的处理
        $sureBtn.Click(function () {
          if($sureBtn.ClassHave('disabled')) return;
          if($sureBtn.ClassHave('processing')){
            return $.tipShow('正在处理中，请稍候...');
          }
          $sureBtn.Class('processing')
          $sureBtn.Text('支付...');
          var paramData2 = {
            businessChannel : 'link',
            amount:parseFloat($moneyInput.Value()),
            clubId : clubId || '',
            tradeChannel:'wx',
            openId:openId
          }
          $.ajax({
            url : '../api/v2/wx/pay/consume/save',
            isReplaceUrl:true,
            type : "post",
            data : paramData2,
            success : function(result){
              if(result.statusCode==200){
                $.$.payToken = result.respData.token;
                result =  JSON.parse(result.respData.payInfo);
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
                      $sureBtn.ClassClear('processing')
                      $sureBtn.Text('确认支付');
                      if (res.err_msg.indexOf("ok")>=0) {//支付成功之后
                        $.tipShow("支付成功！");
                        $.page('qrPayComplete&clubId='+paramData2.clubId+'&money='+paramData2.amount);
                      }// res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠
                      else{
                        $.tipShow("未能成功支付！");
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
                $.localStorage('con-qrpay-param',JSON.stringify(paramData2));
                $.getOauthCode('','9358','confirm-qrpay','base');
              }
              else{
                $sureBtn.ClassClear('processing')
                $sureBtn.Text('确认支付');
                $.tipShow(result.msg || "支付失败！");
              }
            },
            error : function(){
              $sureBtn.ClassClear('processing')
              $sureBtn.Text('确认支付');
              $.tipShow('error');
            }
          })
        });

        if(paramData){
          $.localStorageClear('con-recharge-param');
          $moneyInput[0].value = paramData.amount;
          $sureBtn.ClassClear('disabled')
          $sureBtn[0].click();
        }

      }
    });

    //执行页面切换
    $.pageSwitch();
  }
})();