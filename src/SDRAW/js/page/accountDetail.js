(function () {
    var accountId = $.param('accountId') || $.getUrlParam('accountId') || '',
      url ;
    if(accountId == '' && !$.$.clubID){
        $.tipShow('参数错误：缺少会员卡ID');
        return $.pageCancel();
    }else if(accountId != ''){
        url = '../api/v2/finacial/account/'+accountId;
    }else{
        url = '../api/v2/finacial/club/account'
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
                if(!result){
                    $.tipShow('您暂不是此会所的会员');
                    $.page();
                    return ;
                }
                accountId = result.id;
                $availableMoney.Text((result.amount/100).toFixed(2));
                $frozenMoney.Text((result.freezeAmount/100).toFixed(2));

                $('.member-detail').Html('<div class="member-item tpl-0'+result.styleId+'" data-id="'+result.id+'" data-name="'+result.clubName+'">\
                                <div>\
                                    <div>\
                                        <div style="background-image:url('+(result.clubImage || $.$.defaultClubLogo)+')"></div>\
                                        <div>'+result.clubName+'</div>\
                                    </div>\
                                    <div>\
                                        <div>'+(result.discount/100 >= 10?'<span style="font-style: italic;">vip</span>':('<span>'+(result.discount/100).toFixed(2).replace(/0*$/g,'').replace(/\.$/g ,'')+'</span>折'))+'</div>\
                                        <div>'+result.memberTypeName+'会员</div>\
                                    </div>\
                                </div>\
                                <div>\
                                    <div>ID：'+ $.spaceStr(result.cardNo)+'</div>\
                                    <div></div>\
                                </div>\
                            </div>');

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
    $.pageSwitch();
})();