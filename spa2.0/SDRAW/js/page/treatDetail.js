(function () {
    var $treatCode = $('#treatCode'),
         $treatMoney = $('#treatMoney'),
         $visFriend = $('#visFriend'),
         $treatTel = $('#treatTel'),
         $callPhone = $('#callPhone'),
         $treatStatus = $('#treatStatus'),
         $treatTime = $('#treatTime'),
         $useMoney = $('#useMoney'),
         $useTime = $('#useTime'),
         $cancelTime = $('#cancelTime'),
         $sureBtn = $('#sureBtn'),
         $cancelTreatBtn = $('.cancel-btn'),
         $sureCancelBtn = $('.sure-btn'),
         $cancelDialog = $('#cancelTreat'),
         $useItem = $('#useItem'),
         $cancelItem = $('#cancelItem'),
         detailId = $.param('detailId') || $.getUrlParam('detailId') || '',
         backAccount = $.param('backAccount'),
         tmpCache = $.sessionStorage('tmpTreat_cache')?JSON.parse($.sessionStorage('tmpTreat_cache')) : '';
    if(detailId == ''){
        $.tipShow('参数不对。');
        return $.pageCancel();
    }
    if(backAccount=="true"){
        $("#title>div:nth-of-type(2)").Click(function(event){
            event.stopImmediatePropagation();
            history.go(-2);
        });
    }
    if(!tmpCache){
        $.ajax({
            url:'../api/v2/financial/account/payforother/detail',
            isReplaceUrl:true,
            type:'post',
            data:{
                detailId:detailId
            },
            success: function (result) {
                if(result.statusCode == '200'){
                    result = result.respData;
                    formatData(result);
                }else{
                    $.tipShow(result.msg || '查询数据失败');
                }
            }
        });
    }else{
        $.sessionStorageClear('tmpTreat_cache');
        formatData(tmpCache);
    }

    function formatData(result){
        $treatCode.Text(spaceStr(result.authorizeCode));
        $treatMoney.Text((result.amount/100).toFixed(2));
        result.open == 'Y'? $visFriend.Text('朋友可见'):$visFriend.Text('朋友不可见');
        $treatTel.Text(spaceStr(result.telephone,true));
        $callPhone.Attr('href','tel:'+result.telephone);
        $treatTime.Text(result.createDate);
        switch (result.status){
            case 'NOT_USERD':{
                $treatStatus.Text('未使用');
                $sureBtn.ClassClear('hide');
            }break;
            case 'CANCLED':{
                $treatStatus.Text('已取消');
                $cancelTime.Text(result.cancelDate);
                $cancelItem.ClassClear('hide');
                $sureBtn.Class('hide');
            }break;
            case 'USED':{
                $treatStatus.Text('已使用');
                $useTime.Text(result.usedDate);
                $useMoney.Text((result.usedAmount/100).toFixed(2));
                $useItem.ClassClear('hide');
                $sureBtn.Class('hide');
            }
        }

        $sureBtn.Click(function () {
            $cancelDialog.Class('active');
        });
        $cancelTreatBtn.Click(function () {
            $cancelDialog.ClassClear('active');
        });
        $sureCancelBtn.Click(function () {
            var _tmpObj = $($sureCancelBtn[0].parentNode);
            _tmpObj.Class('processing');
            $.ajax({
                url:'../api/v2/financial/account/payforother/cancel',
                isReplaceUrl:true,
                type:'post',
                data:{
                    detailId:detailId
                },
                success: function (response) {
                    _tmpObj.ClassClear('processing');
                    if(response.statusCode == '200'){
                        $.sessionStorage('treat_records_change_status',JSON.stringify({
                            id:detailId,
                            status:'CANCLED'
                        }));
                        $treatStatus.Text('已取消');
                        $cancelDialog.ClassClear('active');
                        $sureBtn.Class('hide');
                        $cancelItem.ClassClear('hide');
                        $cancelTime.Text($.commonDateFormat(new Date()));
                    }else{
                        $.tipShow(response.msg || '取消授权失败');
                    }
                },
                error: function (response) {
                    _tmpObj.ClassClear('processing');
                    $.tipShow(response || '出错');
                }
            });

        });
    }


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

    $.pageSwitch();
})();