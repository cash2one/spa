(function(){
    $.ajax({
        url: 'memberinfo',
        success: function (data) {
            /*************************************定义常用变量*************************************/
            var content$=$('#content>div:nth-of-type(1)'),
                str='',
                dataLength=data.length;
            /*************************************加载数据*************************************/
            for (var i = 0; i < dataLength; i++) {
                str +=
                    '<div>\
                        <div imageCache="'+data[i]['logoUrl']+'"></div>\
                        <div>'+data[i]['memberName']+'</div>\
                        <div>'+(!data[i]['memberContent']?'':data[i]['memberContent'].replace(/src/g,'imageCache'))+'</div>\
                    </div>';
            }
            if(str==''){
                content$.Class('nullData');
            }else
                content$.Html(str);
            /*************************************定义逻辑*************************************/
            //执行页面切换
            $.pageSwitch();
            //加载banner
            $('#content>div:nth-of-type(1)>div>div:nth-of-type(1)').DivBackgroundCacheBack();
            //加载内容图片
            $('#content>div:nth-of-type(1)>div>div:nth-of-type(3) img').ImgSrcCacheBack();
        }
    });
})();