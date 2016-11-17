(function () {
    $('#loadTip').ClassClear('none');

    $.ajax({
        url:'../api/v2/finacial/accounts',
        isReplaceUrl:true,
        success: function (result) {
            if (result.statusCode != "200") {
                return $.tipShow(result.msg || "数据请求失败！");
            }
            var searchInput = $('.search-area>input'),
              items ,
              $nullData = $('.nullData'),
              $accountList = $('#accountList'),
              $finishTip = $('#finishTip');

            result = result.respData;
            var htmlStr = [];
            result.forEach(function (obj) {
                htmlStr.push('<div class="member-item tpl-0'+obj.styleId+'" data-id="'+obj.id+'" data-name="'+obj.clubName+'">\
                                <div>\
                                    <div>\
                                        <div style="background-image:url('+(obj.clubImage || $.$.defaultClubLogo)+')"></div>\
                                        <div>'+obj.clubName+'</div>\
                                    </div>\
                                    <div>\
                                        <div>'+(obj.discount/100 >= 10?'<span style="font-style: italic;font-size:2rem;">vip</span>':('<span>'+(obj.discount/100).toFixed(2).replace(/0*$/g,'').replace(/\.$/g ,'')+'</span>折'))+'</div>\
                                        <div>'+obj.memberTypeName+'会员</div>\
                                    </div>\
                                </div>\
                                <div>\
                                    <div>ID：'+ $.spaceStr(obj.cardNo)+'</div>\
                                    <div></div>\
                                </div>\
                            </div>');
            });
            $('#loadTip').Class('none');
            if(htmlStr.length == 0){
                $nullData.ClassClear('none');
            }else{
                $accountList.Html(htmlStr.join(''));
                $finishTip.ClassClear('none');
            }

            items = $('#accountList > div');
            $('.search-area>span').Click(function () {
                if(searchInput.Value().trim()){
                    var searchItems = $('#accountList > div[data-name*="'+searchInput.Value().trim()+'"]'),
                      searchItemsArr = Array.prototype.slice.call(searchItems);
                    if(searchItems.length>0){
                        $accountList.ClassClear('none');
                        $finishTip.ClassClear('none');
                        $nullData.Class('none');
                        items.Each(function (dom,i) {
                            var flag = searchItemsArr.every(function (si) {
                                return dom == si;
                            });
                            if(!flag) items.Index(i).Class('none');
                            else items.Index(i).ClassClear('none');
                        });
                    }else{
                        $nullData.ClassClear('none');
                        $accountList.Class('none');
                        $finishTip.Class('none');
                    }
                }else{
                    if(items.length>0){
                        $accountList.ClassClear('none');
                        $finishTip.ClassClear('none');
                        items.ClassClear('none');
                        $nullData.Class('none');
                    }else{
                        $nullData.ClassClear('none');
                        $accountList.Class('none');
                        $finishTip.Class('none');
                    }
                }
            });

            $('#accountList>div').Click(function (e,item) {
                $.page('accountDetail&accountId='+item.dataset.id);
            });
        }
    });

    $.pageSwitch();
})();