(function () {
    var $moneyInput = $('#moneyInput'),
      $inputPlaceholder = $('#inputPlaceholder'),
      $sureBtn = $('#sureBtn'),
      $telPhone = $('#telPhone'),
      $explain = $('#explain'),
      $records = $('#records'),
      //isTreating = false,               //是否正在授权
      $isVisible = $('#isVisible'),
      oldMoney = '',
      allows=[0,0],
      clubId = '',
      accountId = $.param('accountId') || $.getUrlParam('accountId') || '';

    if(accountId == ''){
        $.tipShow('参数不正确');
        return $.pageCancel();
    }

    //=== 计算最下面两按钮的位置(在安卓会被键盘顶上来,所以改为实时计算)  ===
    //=== 在IPhone下,需使用setTimeout延时执行，offsetHeight才会有值
    //=== setTimeout 延时为0表示由当前系统自身的最小延时时间（最优时间）
    setTimeout(function () {
        var _mt = ($.$.winHeight - $('#content>div')[0].offsetHeight)/ $.$.scale / 16;
        if(_mt>0){
            setTimeout(function () {
                $('.btn-area').CSS({
                    "margin-top":_mt+'rem'
                })
            },0);
        }
    },0);

    function check(){
        if(allows[0]&&allows[1]){
            $sureBtn.ClassClear('disabled');
        }else{
            $sureBtn.Class('disabled');
        }
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
                allows[0]=1;
                check();
            }else{
                oldMoney='';
                allows[0]=0;
                check();
            }
        }else{
            allows[0]=1;
            check();
            var tmp = $moneyInput[0].value.match(/\./g);
            if(tmp&&$moneyInput[0].value.match(/\./g).length>1){
                $moneyInput[0].value = $moneyInput[0].value.substring(0,$moneyInput[0].value.length -1);
            }
            if(!/^([1-9][0-9]*)$/g.test($moneyInput[0].value)){
                $moneyInput[0].value = oldMoney;
            }else{
                oldMoney = $moneyInput[0].value;
            }
        }
    });

    $telPhone.Verify('tel', function (flag) {
        if(flag){
            allows[1]=1;
        }else{
            allows[1]=0;
        }
        check();
    });

    $isVisible.Event('click', function (e, item) {
       if($isVisible.ClassHave('checked')){
           $isVisible.ClassClear('checked')
       }else{
           $isVisible.Class('checked');
       }
    });

    $.ajax({
        url:'../api/v2/finacial/account/'+accountId,
        isReplaceUrl:true,
        type:'post',
        success: function (result) {
            if(result.statusCode == '200'){
                result = result.respData;
                clubId = result.clubId;
                $('#balanceSpan').Text((result.amount/100).toFixed(2));

                $sureBtn.Event('click', function(){
                    if(!$sureBtn.ClassHave('disabled')){
                        if(!$sureBtn.ClassHave('processing')){
                            $sureBtn.Class('processing');
                            $sureBtn.Text('授权中...');
                            $.ajax({
                                url:'../api/v2/finacial/account/payforother/auth',
                                isReplaceUrl:true,
                                type:'post',
                                data:{
                                    accountId: accountId,
                                    amount:parseFloat($moneyInput.Value())*100,
                                    open:$isVisible.ClassHave('checked')?'Y':'N',
                                    telephone:$telPhone.Value()
                                },
                                success: function (result) {
                                    $sureBtn.ClassClear('processing');
                                    $sureBtn.Text('确认授权');
                                    if(result.statusCode != '200'){
                                        $.tipShow(result.msg || '授权失败。');
                                    }else {
                                        $.page('treatDetail&backAccount=true&detailId='+result.respData);
                                    }
                                },
                                error: function (msg) {
                                    $.tipShow(msg || '系统错误');
                                }
                            });
                        }else{
                            $.tipShow('正在授权，请稍候...');
                        }
                    }
                });
            }else{
                $.tipShow(result.msg || '查询数据失败');
            }
        }
    });



    $('#explain').Click(function () {
        $.page('treatExplain');
    });
    $('#records').Click(function () {
        $.page('treatRecords&clubId='+clubId);
    });

    $.pageSwitch();
})();