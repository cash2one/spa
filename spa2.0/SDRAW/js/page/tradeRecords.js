(function () {
    var accountId = $.param('accountId') || $.getUrlParam('accountId') || '',
      //paid_coupon：点钟券，club_charge:会所充值，coupon：优惠券，direct_reward：直接打赏, withdrawal:提现
      tradeType = {
          consume:'账号消费',
          line_recharge:'线下充值',
          pay_for_other:'请客',
          user_recharge:'用户充值'
      },
      pageHeight,
      str = '',
      nullDataDiv = $("#content div.nullData")[0],
      isAddData = false,
      page = 0,
      dataAddIcon = $('#loadTip'),
      dataFinishIcon = $('#finishTip'),
      dataAddEnd = false,
      listBox = $(".trade-list"),
      content$ = $('#content'),
      pageSize = 10,
      agile = 0.4;     //自裁加载下页的灵敏度  值越小越灵敏（0.4表示当前面有40%的内容在可视区域时就加载下一页的数据）;
    if(accountId == ''){
        $.tipShow('参数错误：缺少账户ID');
        return $.pageCancel();
    }

    //加载页面数据
    function addData(newpage, callback) {
        if (isAddData) return;
        isAddData = true;
        page = newpage || page + 1;

        //初始化提示
        dataAddIcon.ClassClear('none');
        dataFinishIcon.Class('none');
        dataAddEnd = false;

        //开始加载数据
        $.ajax({
            url: '../api/v2/financial/account/trades/'+accountId,
            isReplaceUrl:true,
            data: {
                page: page,
                pageSize: pageSize
            },
            success: function (data) {
                if (data.statusCode != "200") {
                    return $.tipShow(data.msg || "数据请求失败！")
                }
                data = data['respData'];
                str = "";
                var income = false;
                for (var i = 0, dataLength = data.length; i < dataLength; i++) {
                    income = data[i].tradeType=='income';
                    str +='<div>\
                              <div>'+tradeType[data[i].businessCategory]+'<span class="'+(income?'recharge':'')+'">'+(income?'+':'-')+((data[i].amount/100).toFixed(2))+'元</span>\
                                </div>\
                                <div>'+data[i].createDatetime+'</div>\
                            </div>';
                }

                if (page == 1) {
                    listBox.Html(str);
                    if (str) {
                        nullDataDiv.style.display='none';
                    } else {
                        nullDataDiv.style.display='block';
                        dataAddEnd = true;
                    }
                    pageHeight = listBox[0].scrollHeight;
                } else {
                    listBox.Html(str, true);
                    if (dataLength < pageSize) {
                        dataAddEnd = true;
                        dataFinishIcon.ClassClear('none');
                    }
                }
                //事件修正
                isAddData = false;
                dataAddIcon.Class('none');
                if (callback) callback();
            }
        });
    }
    //滚动设置
    content$.Event('scroll', function (e) {
        if(!dataAddEnd && content$[0].scrollTop + content$[0].clientHeight - (page + agile - 1) * pageHeight >= 0  ){
            addData();
        }
    });
    addData();

    $.pageSwitch(true,true);
})();