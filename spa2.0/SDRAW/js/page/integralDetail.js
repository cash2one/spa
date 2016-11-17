(function(){
    if(!$.param("clubId") && !$.$.clubID){
        $.pageCancel();
        return;
    }
    /*************************************定义常用变量*************************************/
    var str = '',
        i,
        dataLength,
        isAddData=false,
        page= 1,
        dataAddIcon=$('#loadTip'),
        dataFinishIcon=$('#finishTip'),
        dataAddEnd=false,
        listTip = $("#content>div>div.tip"),
        listTitle = $("#content>div>div.title"),
        listBox=$('#content>div>div.list'),
        content$=$('#content'),
        pageSize = 10,
        agile = 0.4,
        pageHeight;
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
            url: '../api/v2/credit/user/records',
            isReplaceUrl : true,
            data:{
                clubId : ($.param("clubId") || $.$.clubID),
                page : page,
                pageSize : pageSize,
                userType : "user"
            },
            success: function (data) {
                data = (data.statusCode != '200') ? [] : data['respData'];
                if(page==1 && data.length !=0){
                    listTip.Hide();
                    listTitle.Show();
                    listBox.Show();
                }
                for (i = 0,str='',dataLength=data.length; i < dataLength; i++) {
                    str += "<div>\
                                    <div>"+data[i]['businessCategoryDesc']+"<div class='"+(data[i]["amount"]>0 ? "add" : "")+"'>"+(data[i]["amount"]>0 ? "+" : "")+data[i]["amount"]+"</div></div>\
                                    <div "+(data[i]["peerName"]?'':'style="padding-left:0;"')+"><div "+(data[i]["peerName"] ? "style='background-image:url("+(data[i]['peerAvatar'] || $.$.defaultHeader)+")'" : "")+"></div><div>"+((data[i]['businessCategoryDesc'] == '项目抢购'?data[i]["description"]:data[i]["peerName"]) || "")+"</div><span>"+data[i]["createDatetime"]+"</span></div>\
                                </div>";
                }

                //显示数据修正
                if(page==1){
                    listBox.Html(str);
                    if(str){
                        //listBox.ClassClear('nullData');
                    }else{
                        //listBox.Class('nullData');
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
                isAddData=false;
                dataAddIcon.Class('none');
                if(callback) callback();
            }
        });
    }

    //滚动设置
    content$.Event('scroll', function (e) {
        if(!dataAddEnd && content$[0].scrollTop + content$[0].clientHeight - (page + agile - 1) * pageHeight >= 0  ){
            addData();
        }
    });

    //////获取积分账户
    $.ajax({
        url : "../api/v2/credit/user/account",
        isReplaceUrl : true,
        data : { clubId : ($.param("clubId") || $.$.clubID), userType : "user" },
        success : function(res){
            if(res.statusCode == 200){
                if(res.respData && res.respData.length != 0){
                    res = res.respData[0];
                    $("#content>div>div.total>b").Html(res.amount+"<span>(冻结:"+res.freezeAmount+")</span>");
                }
            }
        }
    });

    $("div#content>div>div.total>div>span,div#content>div>div.tip>a").Click(function(){
        $.page("integralExplain");
    });

    addData(1,function(){ $.pageSwitch() });
})();