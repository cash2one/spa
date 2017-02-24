(function(){
    /*************************************定义常用变量*************************************/
    var str = '',
        listID=JSON.parse($.sessionStorage('lucky_ID')||'{}'),
        i,
        dataLength,
        isAddData=false,
        page= 1,
        dataAddIcon=$('#loadTip'),
        dataFinishIcon=$('#finishTip'),
        dataAddEnd=($.sessionStorage('lucky_end')||'false')=='true',
        listBox=$('#content>div>div:nth-of-type(2)>div'),
        singleListBox,
        content$=$('#content'),
        contentYTop= $.sessionStorage('lucky_top'),
        contentPage= $.sessionStorage('lucky_page'),
        contentData= $.sessionStorage('lucky_data'),
        //agile = 0.4,       //自裁加载下页的灵敏度  值越小越灵敏（0.4表示当前面有40%的内容在可视区域时就加载下一页的数据）
        agile = -0.5,      //此处因后台数据请求接口有bug(第二次--第二页请求，如果数据多于5条，则一直只返回5条数据)，
        //为不改onscroll的逻辑，此处的值暂时为负值
        pageHeight = $.sessionStorage('lucky_page_height'),
        pageSize = 10;
    if(!$.$.userToken){//跳转到登录
        $.$.loginUrl = "lucky";
        $.page("login");
        return;
    }
        listBox.Html("<div></div>");
        singleListBox=$('#content>div>div:nth-of-type(2)>div>div');


    /*************************************定义逻辑*************************************/
    //加载页面数据
    function addData(newpage,callback){
        if(isAddData)
            return;
        isAddData=true;
        page=newpage||page+1;
        //初始化提示
        dataAddIcon.ClassClear('none');
        dataFinishIcon.Class('none');
        dataAddEnd=false;
        //开始加载数据

        $.ajax({
            url:"../api/v2/user/luckyWheel/userPrizeRecordList",
            isReplaceUrl:true,
            data:{
                token : $.$.userToken,
                clubId : $.$.visitChannel=="9358" ? "" : $.$.clubID,
                page : page,
                pageSize : pageSize
            },
            success: function (data) {
                if(data.statusCode != "200"){
                    return $.tipShow(data.msg||"数据请求失败！")
                }

                data=data.respData['recordList'] == null ? [] : data.respData['recordList'] ;
                str="";
                for (i = 0,dataLength=data.length; i < dataLength; i++) {
                    str +=generateItemHtml(data[i]);
                }
                if(page==1){
                    singleListBox.Html(str);
                    if(str){
                        singleListBox.ClassClear('nullData');
                    }else{
                        singleListBox.Class('nullData');
                        dataAddEnd=true;
                    }
                    pageHeight = listBox[0].scrollHeight;
                }else{
                    singleListBox.Html(str,true);
                    if(str==''){
                        dataAddEnd=true;
                        dataFinishIcon.ClassClear('none');
                    }
                }
                //事件修正
                setListClick();
                isAddData=false;
                dataAddIcon.Class('none');
                if(callback) callback();
            }
        });
    }

    function generateItemHtml(itemData){
        if(!itemData['tags'] || itemData['tags'].length==0){
            itemData['tags']=[{tagName:'(无)'}];
        }
        var $createTime =itemData['createTime'].substr(5,6);
        var verifyCode = itemData.verifyCode;
        if(verifyCode){
            verifyCode = $.spaceStr(verifyCode,false,4);
        }

        return '<div  class="list" clubId="'+itemData['clubId']+'" actId="'+itemData['activityId']+'" cardId="'+itemData['prizeContent']+'" prizeType="'+itemData['prizeType']+'" recordId="'+itemData['recordId']+'"> \
                          <div class="title">\
                                <div class="img" style="background-image: url(\''+(itemData['clubLogo']|| $.$.defaultClubLogo)+'\')"></div>\
                                <div class="name">'+(itemData['clubName']|| $.$.defaultClubName)+' </div>'+((itemData.prizeType==1 || itemData.prizeType==2 || itemData.prizeType==3) ? '<div class="run"></div>' : '')+'\
                          </div>\
                          <div class="info">\
                                <div class="name">'+(itemData['prizeName'].length>15?itemData['prizeName'].substr(0,15)+'...':itemData['prizeName'])+' </div>\
                                <div class="state '+(itemData['status']=='1'?'have ':'not')+'">'+(itemData['status']=='0'?'未核销':(itemData['status']=='1'?'已核销':(itemData['status']=='2'?'过期':(itemData['status']=='3'?'未中奖':'-'))))+' </div>\
                           </div>\
                          <div class="number">\
                                <div class="num '+(verifyCode ? 'have' : 'none')+'">兑换码：'+verifyCode+' </div>\
                                <div class="time">'+$createTime+'</div>\
                          </div>\
                    </div>';
    }

    function setListClick(){
        $('div#lucky #content>div>div:nth-of-type(2)>div>div>div.list',true).Event('click',function(e,item){
            if(/(1|2|3)/.test(item.getAttribute('prizeType'))){
                $.sessionStorage('lucky_data',listBox.Html());
                $.sessionStorage('lucky_page',page);
                $.sessionStorage('lucky_page_height',pageHeight);
                $.sessionStorage('lucky_end',dataAddEnd);
                $.sessionStorage('lucky_ID',JSON.stringify(listID));
                $.sessionStorage('lucky_top',content$[0].scrollTop);
                if($.$.clubID){
                    $.page('luckyDetail&actId='+item.getAttribute('actId') +'&cardId='+item.getAttribute('cardId')+'&prizeType='+item.getAttribute('prizeType')+'&recordId='+item.getAttribute('recordId'));
                }else {
                    location.href = location.origin + location.pathname + '?club='+item.getAttribute('clubId') +'#luckyDetail&actId='+item.getAttribute('actId') +'&cardId='+item.getAttribute('cardId')+'&prizeType='+item.getAttribute('prizeType')+'&recordId='+item.getAttribute('recordId');
                }
            }
        },true);
    }
    //滚动设置
    content$.Event('scroll', function (e) {
        if(!dataAddEnd && content$[0].scrollTop + content$[0].clientHeight - (page + agile - 1) * pageHeight >= 0  ){
            addData();
        }
    });
    //缓存加载
    if(contentData){
        page=parseInt(contentPage);
        listBox.Html(contentData);
        setTimeout(function () {
            content$[0].scrollTop = contentYTop;
        },1);
        setListClick();
        if(dataAddEnd)
            dataFinishIcon.ClassClear('none');
        $.pageSwitch();
    }else
        addData(1,$.pageSwitch());
    $.sessionStorageClear('lucky_ID');
    $.sessionStorageClear('lucky_data');
    $.sessionStorageClear('lucky_end');
    $.sessionStorageClear('lucky_top');
    $.sessionStorageClear('lucky_page');
    $.sessionStorageClear('lucky_page_height');
})();