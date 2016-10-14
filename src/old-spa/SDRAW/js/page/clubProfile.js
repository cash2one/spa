(function(){
    $.ajax({
        url: 'item',
        success: function (data) {
            /*************************************定义常用变量*************************************/
            var str = '',//用于生成内容
                content$=$('#content'),//内容控制器
                contentX$=content$.Children(),//内容容器
                pageNumber$=$('#pageNumber'),//页码
                index= 0,//内容初始化索引
                dataLength=data.length;
            /*************************************加载数据*************************************/
            for (var i = 0; i < dataLength; i++) {
                str +=
                    '<div>\
                        <div>\
                            <div>\
                                <div>'+(data[i]['title']||'')+'</div>\
                                <div>'+(data[i]['intro']||'')+'</div>\
                                <div imageCache="'+(data[i]['imageUrl']|| $.$.defaultBanner)+'"></div>\
                            </div>\
                            <div class="richText">'+(!data[i]['description']?'':data[i]['description'].replace(/src/g,'imageCache'))+'</div>\
                       </div>\
                    </div>';
            }
            if(str==''){
                pageNumber$.Hide();
                content$.Class('nullData');
            }else
                contentX$.Html(str);
            /*************************************定义逻辑*************************************/
            //初始化滚动模块
            $.scroll({
                content:content$[0],
                contentX:contentX$[0],
                //contentY:contentX$[0].children,
                indexX:index,
                endX:function(i){
                    index=i;
                    pageNumber$.Text((index+1)+'/'+dataLength);
                }
            });

            //初始化页码
            pageNumber$.Text((index+1)+'/'+dataLength);
            //页面切换
            $.pageSwitch();
            //固定banner开始加载
            $('#content>div>div>div>div:nth-of-type(1)>div:nth-of-type(3)').DivBackgroundCacheBack();
            //内容图片开始加载
            $('#content>div>div>div>div:nth-of-type(2) img').ImgSrcCacheBack();
        }
    });
})();