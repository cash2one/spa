(function () {
    var accountId = $.param('accountId') || $.getUrlParam('accountId') || '',
      url,isFromClub = false;
    if(accountId == '' && !$.$.clubID){
        $.tipShow('参数错误：缺少会员卡ID');
        return $.pageCancel();
    }else if(accountId != ''){
        isFromClub = false;
        url = '../api/v2/financial/account/'+accountId;
    }else{
        isFromClub = true;
        url = '../api/v2/financial/club/account'
        $("#title>div:nth-of-type(2)").Click(function(event){
            event.stopImmediatePropagation();
            $.page('personal',-1,true);
        });
    }
    $.ajax({
        url:url,
        isReplaceUrl:true,
        data:{
            clubId: $.$.clubID
        },
        success: function (result) {
            var $availableMoney = $('#availableMoney'),
                $frozenMoney = $('#frozenMoney');
            if(result.statusCode == '200'){
                result = result.respData;
                if(!result.info && isFromClub){
                    var tmpHtml = '';
                    if(result.memberTypes){
                        for(var i = 0,l = result.memberTypes.length;i < l ; i++ ){
                            tmpHtml += concatMemberInfo(result.memberTypes[i])
                        }
                        $('.member-list').Html(tmpHtml);
                    }else{
                        $('.member-list-title,.member-list').Class('hide');
                    }
                    $('#content').Class('none-member-content');
                    $('#memberArea').Class('hide');
                    $('#noneMemberArea').ClassClear('hide');
                    return ;
                }
                if(isFromClub) result = result.info;
                accountId = result.id;
                $availableMoney.Text((result.amount/100).toFixed(2));
                $frozenMoney.Text((result.freezeAmount/100).toFixed(2));

                $('.member-detail').Html(concatMemberInfo(result));

                $('.member-item').Page('qrPayCode&accountId='+accountId);
                $('#jumpRecords').Page('tradeRecords&accountId='+accountId);
                $('#jumpTreat').Page('treat&accountId='+accountId);
                var desces = result.description.split(/[\f\n]/g),tmpHtml = [];
                desces.forEach(function (d) {
                    tmpHtml.push('<li>'+d+'</li>');
                })
                $('#explainList').Html(tmpHtml.join(''));
            }else{
                $.tipShow(result.msg || '查询数据失败');
            }
        }
    });
    function concatMemberInfo(info){
        var tmp = '<div class="member-item tpl-0'+info.styleId+'">\
                                <div>\
                                    <div>\
                                        <div style="background-image:url('+(info.clubImage || $.$.clubLogo || $.$.defaultClubLogo)+')"></div>\
                                        <div>'+(info.clubName || $.$.clubName)+'</div>\
                                    </div>\
                                    <div>\
                                        <div>'+(info.discount/100 >= 10?'<span style="font-style: italic;">vip</span>':('<span>'+(info.discount/100).toFixed(2).replace(/0*$/g,'').replace(/\.$/g ,'')+'</span>折'))+'</div>\
                                        <div>'+(info.memberTypeName || info.name)+'会员</div>\
                                    </div>\
                                </div>\
                                <div>\
                                    <div>ID：'+ $.spaceStr(info.cardNo || '8888888888888888')+'</div>\
                                    <div></div>\
                                </div>\
                            </div>';
        return tmp;
    }
    $.pageSwitch();
})();