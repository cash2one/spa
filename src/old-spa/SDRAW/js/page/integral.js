(function(){
    /*************************************定义常用变量*************************************/
    var str = '',
        listID=JSON.parse($.sessionStorage('integral_ID')||'{}'),
        i,
        dataLength,
        isAddData=false,
        page= 1,
        dataAddIcon=$('#loadTip'),
        dataFinishIcon=$('#finishTip'),
        dataAddEnd=($.sessionStorage('integral_end')||'false')=='true',
        listBox=$('#content>div>div:nth-of-type(2)'),
        content$=$('#content'),
        contentYTop= $.sessionStorage('integral_top'),
        contentPage= $.sessionStorage('integral_page'),
        contentData= $.sessionStorage('integral_data'),
        pageHeight = $.sessionStorage('integral_page_height') || 0,          //一页内容的高度
        pageSize = 20,
        agile = 0.4;     //自裁加载下页的灵敏度  值越小越灵敏（0.4表示当前面有40%的内容在可视区域时就加载下一页的数据）
    /*************************************加载数据*************************************/
    /*************************************定义逻辑*************************************/
    function addData(newpage,callback){
        if(isAddData) return;
        isAddData=true;
        page=newpage || page+1;

        //初始化提示
        dataAddIcon.ClassClear('none');
        dataFinishIcon.Class('none');
        dataAddEnd=false;

        //开始加载数据
        $.ajax({
            url : '../api/v2/credit/user/account',
            isReplaceUrl : true,
            data : {
                clubId : "",
                page : page,
                pageSize : pageSize,
                userType : "user"
            },
            success: function (data) {
                data = (data.statusCode != '200') ? [] : data['respData'];
                if(page==1) listID={};
                for (i = 0,str='',dataLength=data.length; i < dataLength; i++) {
		            if(listID[data[i]['id']]) continue;
                    else listID[data[i]['id']]=1;

                    str += "<div>\
                                    <div clubId='"+data[i]["clubId"]+"'><div style='background-image: url("+(data[i]["clubImage"] || $.$.defaultClubLogo)+")'></div>"+(data[i]["clubName"] || $.$.defaultClubName)+"<i></i></div>\
                                    <div><span>剩余积分</span>"+data[i]["amount"]+"</div>\
                                </div>";
                }

                //显示数据修正
                if(page==1){
                    listBox.Html(str);
                    if(str){
                        listBox.ClassClear('nullData');
                    }else{
                        listBox.Class('nullData');
                        dataAddEnd=true;
                    }
                    pageHeight = listBox[0].scrollHeight;
                }else{
                    listBox.Html(str,true);
                    if(dataLength < pageSize){
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

    function saveCache(){
        $.sessionStorage('integral_data',listBox.Html());
        $.sessionStorage('integral_page',page);
        $.sessionStorage('integral_page_height',pageHeight);
        $.sessionStorage('integral_end',dataAddEnd);
        $.sessionStorage('integral_ID',JSON.stringify(listID));
        $.sessionStorage('integral_top',content$[0].scrollTop);
    }

    function setListClick(){
        $('#content>div>div.list>div>div:nth-of-type(1)',true).Event("click",function(e,item){
            saveCache();
            $.page("integralDetail&clubId="+item.getAttribute("clubId"));
        });
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
        if(dataAddEnd) dataFinishIcon.ClassClear('none');
        $.pageSwitch();
    }else
        addData(1,function(){ $.pageSwitch() });
    $.sessionStorageClear('integral_ID');
    $.sessionStorageClear('integral_data');
    $.sessionStorageClear('integral_end');
    $.sessionStorageClear('integral_top');
    $.sessionStorageClear('integral_page');
    $.sessionStorageClear('integral_page_height');
})();