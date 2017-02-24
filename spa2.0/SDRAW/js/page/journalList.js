(function () {
    var clubId = $.param("clubId") || $.$.clubID;
    if(!clubId){
        $.pageCancel();
        return;
    }
    var listBox = $("#content>div.list");
    $.ajax({
        url : "../api/v2/user/journal/list",
        data : {
            clubId : clubId
        },
        isReplaceUrl: true,
        success: function (res){
            if(res.statusCode == 200){
                res = res.respData;
                var htmlStr = "", itemObj;
                for(var i=0;i<res.length;i++){
                    itemObj = res[i];
                    htmlStr += "<div class='item' data-id='"+itemObj.journalId+"' data-tpl-id='"+itemObj.templateId+"'>\
                                            <div class='logo' style='background-image: url(\"img/journal/"+(itemObj.templateId || 1)+".png\")'>NO."+itemObj.sequenceNo+"</div>\
                                            <div class='title'>\
                                                <div>"+itemObj.title+"</div>\
                                                <div>发布时间："+itemObj.modifyDate+"</div>\
                                            </div>\
                                        </div>";
                }
                listBox[0].innerHTML = htmlStr;
                if(res.length !=0){
                    $("#content>div.list>div.item").Click(function(event,item){
                        var jid = item.getAttribute("data-id");
                        var tplid = item.getAttribute('data-tpl-id')
                        location.href = location.origin+"/spa-manager/journal/#/"+(tplid || 1)+"/?id="+jid;
                    });
                }
                else{
                    listBox.Class("nullData");
                }
                $.pageSwitch();
            }
            else{
                $.tipShow(res.msg || "查询数据出错！");
                $.pageCancel();
            }
        }
    });
})();