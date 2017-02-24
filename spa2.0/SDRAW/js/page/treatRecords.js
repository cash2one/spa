(function () {
    var str = '',
      statusObj = {
          "CANCLED":{
              name:'已取消',
              value:'treat-canceled'
          },
          "NOT_USERD":{
              name:'未使用',
              value:'treat-unuse'
          },
          "USED":{
              name:'已使用',
              value:'treat-used'
          }
      },
      nullDataDiv = $("#content div.nullData")[0],
      dataLength,
      isAddData = false,
      page = 0,
      dataAddIcon = $('#loadTip'),
      dataFinishIcon = $('#finishTip'),
      //dataAddEnd = false,
      dataAddEnd = ($.sessionStorage('treat_records_end') || 'false') == 'true',
      listBox = $(".treat-list"),
      content$ = $('#content'),
      contentYTop = $.sessionStorage('treat_records_top'),
      contentPage = $.sessionStorage('treat_records_page'),
      contentData = $.sessionStorage('treat_records_data'),
      pageHeight = $.sessionStorage('treat_records_page_height') || 0,          //一页内容的高度
      changeStatusObj = $.sessionStorage('treat_records_change_status'),
      pageSize = 10,
      agile = 0.4;     //自裁加载下页的灵敏度  值越小越灵敏（0.4表示当前面有40%的内容在可视区域时就加载下一页的数据）;

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
            url: '../api/v2/financial/account/payforother/list',
            isReplaceUrl:true,
            type:'post',
            data: {
                clubId: $.$.clubID || $.param('clubId') || $.getUrlParam('clubId') || '',
                page: page,
                pageSize: pageSize
            },
            success: function (data) {
                if (data.statusCode != "200") {
                    return $.tipShow(data.msg || "数据请求失败！")
                }
                data = data['respData'];
                str = "";
                for (var i = 0, dataLength = data.length; i < dataLength; i++) {
                    str +='<div class="item" data-id="'+data[i].id+'">\
                              <div class="border-b">\
                                <div>'+ $.commonDateFormat(new Date(data[i].createDate.replace(/-/g,'/')),'yyyy-MM-dd hh:mm')+'</div>\
                                <div class="'+statusObj[data[i].status].value+'">'+statusObj[data[i].status].name+'</div>\
                              </div>\
                              <div>\
                                  <div>\
                                  授权金额<span>'+(data[i].amount/100).toFixed(2)+'</span>\
                                  </div>\
                                  <div>\
                                      授权手机<span>'+spaceStr(data[i].telephone,true)+'</span>\
                                  </div>\
                            </div>\
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

    $('#content>div').Delegate('click','.item', function (e, item) {
        $.sessionStorage('treat_records_data', listBox.Html());
        $.sessionStorage('treat_records_page', page);
        $.sessionStorage('treat_records_page_height',pageHeight);
        $.sessionStorage('treat_records_end', dataAddEnd);
        $.sessionStorage('treat_records_top', content$[0].scrollTop);
        $.page('treatDetail&detailId='+item.dataset.id);
    });

    //缓存加载
    if (contentData) {
        page = parseInt(contentPage);
        listBox.Html(contentData);
        //contentY$.Translate(0, contentYTop + 'px');
        setTimeout(function () {
            content$[0].scrollTop =  contentYTop;
        },10);
        if(changeStatusObj){
            changeStatusObj = JSON.parse(changeStatusObj);
            if(changeStatusObj.status == 'CANCLED'){
                $('.treat-list>div[data-id="'+changeStatusObj.id+'"]>div:nth-of-type(1)>div:nth-of-type(2)').Class('treat-canceled').Text('已取消');
            }
        }
        if (dataAddEnd)
            dataFinishIcon.ClassClear('none');
        $.pageSwitch();
    } else
        addData(1,function(){
            $.pageSwitch();
        });
    //addData(1, $.pageSwitch());
    $.sessionStorageClear('treat_records_data');
    $.sessionStorageClear('treat_records_end');
    $.sessionStorageClear('treat_records_top');
    $.sessionStorageClear('treat_records_page');
    $.sessionStorageClear('treat_records_page_height');       //一页内容的高度
    $.sessionStorageClear('treat_records_change_status');

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