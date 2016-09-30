(function () {
    var accountId = $.param('accountId') || $.getUrlParam('accountId') || '',
      $moneyInput = $('#moneyInput'),
      $inputPlaceholder = $('#inputPlaceholder'),
      $sureBtn = $('#sureBtn'),
      oldMoney = '',
      payAuthCode = $.param('code') || $.getUrlParam('code') || $.$.payAuthCode,
      clubId = $.param("clubId") || $.$.clubID,
      paramData = $.localStorage('con-recharge-param')?JSON.parse($.localStorage('con-recharge-param')):null;
    if(!$.$.ua.isWX){
		if($.checkAccessMenu('recharge')){
			$.tipShow('请在微信中打开');
			$.pageCancel();
		}
        return ;
    }
    if(paramData && payAuthCode){
        $.ajax({
            url: ($.$.clubID ? "../" : "")+"../wx/oauth2/user/openid",
            type:'post',
            data: {
                code: payAuthCode,
                scope:'snsapi_base',
                wxmp: '9358',
                userType:'user',
                state:'confirm-recharge'
            },
            success: function (result) {
                if (result.statusCode == 200){
                    initPage();
                }else if(result.statusCode == '935801'){
                    $.getOauthCode('','9358','confirm-recharge','base');
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
                accountId:accountId,
                amount:$moneyInput.Value(),
                clubId : clubId || '',
                tradeChannel:'wx'
            }
            $.ajax({
                url : '../api/v2/wx/pay/recharge/save',
                isReplaceUrl:true,
                type : "post",
                data : paramData2,
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
                                  $sureBtn.ClassClear('processing')
                                  $sureBtn.Text('确认支付');
                                  if (res.err_msg.indexOf("ok")>=0) {//支付成功之后
                                      $.tipShow("支付成功！");
                                      $.page('accountDetail&accountId='+accountId);
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
                        $.localStorage('con-recharge-param',JSON.stringify(paramData2));
                        $.getOauthCode('','9358','confirm-recharge','base');
                    }
                    else{
                        $sureBtn.ClassClear('processing')
                        $sureBtn.Text('确认支付');
                        $.tipShow(result.msg || "充值失败！");
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
                    $sureBtn.ClassClear('disabled');
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
                    if(oldMoney!='') $sureBtn.ClassClear('disabled');
                }else{
                    if($moneyInput[0].value != 0){
                        oldMoney = $moneyInput[0].value;
                        $sureBtn.ClassClear('disabled');
                    }else{
                        $sureBtn.Class('disabled');
                    }
                }
            }
        });
        $.pageSwitch();
    }
})();