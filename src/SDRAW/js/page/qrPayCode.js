(function () {
    var qrcode=new QRCode($('#content > div > div:nth-of-type(2) > div > div:nth-of-type(1)')[0],{
        width:430,
        height:430
    }),timer= 0,
      refreshBtn = $('#content > div > div:nth-of-type(2) > div > div:nth-of-type(2)'),
      refreshText = $('#content > div > div:nth-of-type(2) > div > div:nth-of-type(2)>span');

    if($.param('isDirect')==true || $.getUrlParam('isDirect')){
        $('#title>div:nth-of-type(2)').CSS('display','none');
    }

    function reMakeCode(){
        if(refreshBtn.ClassHave('processing')){
            return $.tipShow('正在请求二维码');
        }
        refreshBtn.Class('processing');
        $.ajax({
            url:'../api/v2/finacial/account/pay/qrcode',
            isReplaceUrl:true,
            success: function (result) {
                refreshBtn.ClassClear('processing');
                if(result.statusCode == '200'){
                    if(timer) clearTimeout(timer);
                    qrcode.makeCode(JSON.stringify(result.respData));
                    var timeStr = '';
                    if(result.respData.period>0){
                        timer = setTimeout(reMakeCode,result.respData.period * 1000);
                        timeStr = formatSec(result.respData.period);
                        if(timeStr == '1分钟'){
                            timeStr = '每分钟自动更换';
                        }else{
                            timeStr = '每'+timeStr+'自动更换';
                        }
                    }else{
                        timeStr = '无限期，不自动刷新';
                    }
                    refreshText.Text(timeStr);
                }else{
                    $.tipShow(result.msg || '请求二维码失败');
                    if(timer) clearTimeout(timer);
                    $('#content > div > div:nth-of-type(2) > div > div:nth-of-type(1)>img').Attr('src', 'img/loading_page.png');
                    //qrcode.clear();
                }
            }
        });
    }
    reMakeCode()

    refreshBtn.Click(function () {
        reMakeCode();
    });

    function formatSec(sec){
        var str = '',tmp1,tmp2,floor=Math.floor;
        tmp1 = sec%60;
        if(tmp1){
            str += tmp1+'秒';
        }
        tmp2 = floor(sec/60);
        if(tmp2>=60){
            tmp1 = tmp2%60;
            if(tmp1){
                str = tmp1 + '分钟'+str;
            }
            tmp2 = floor(tmp2/60);
            if(tmp2>=24){
                tmp1 = tmp2%24;
                if(tmp1){
                    str = tmp1 + '小时' + str;
                }
                tmp2 = floor(tmp2/24);
                str = tmp2 + '天' + str;
            }else{
                str = tmp2 + '小时' + str;
            }
        }else{
            str = tmp2 + '分钟' + str;
        }
        return str;
    }

    $.pageSwitch();
})();