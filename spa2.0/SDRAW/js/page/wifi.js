(function(){
    if(!$.param("clubId") && !$.$.clubID){
        $.pageCancel();
        return;
    }
    var listBox=$('#content>div>div.list');

    $.ajax({
        url: '../api/v2/user/wifi',
        isReplaceUrl : true,
        data:{
            clubId : ($.param("clubId") || $.$.clubID)
        },
        success: function (data) {
            data = (data.statusCode != '200') ? [] : data['respData'];
            var str = "";
            for(var i=0;i<data.length;i++){
                str += "<div><div>WiFi："+data[i]["ssid"]+"</div><div>密码："+data[i]["password"]+"</div></div>"
            }
            listBox.Html(str)
            if(data.length == 0){
                listBox.Class('nullData')
            }
        }
    });
    $.pageSwitch();
})();