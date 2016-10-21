(function(){
    $.ajax({
        url: 'categoryService',
        success: function (data) {
            /*************************************定义常用变量*************************************/
            var str = '',
                str1,
                dataItem,
                dataLength,
                dataLength2,
                i,
                j,
                content$=$('#content'),
                gid=$.param('id'),
                gindex=0,
                gTop=$.sessionStorage('serviceList_top');
            /*************************************加载数据*************************************/
            for (i = 0,dataLength=data.length; i < dataLength; i++) {
                if(gid==data[i]['id'])
                    gindex=i;
                for (j = 0, str1 = '',dataLength2=data[i]['serviceItems'].length; j < dataLength2; j++){
                    dataItem=data[i]['serviceItems'][j];
                    str1 +=
                        '<div hh="' + dataItem['id'] + '">\
                        <div style="background-image: url(\'' + dataItem['imageUrl'] + '\')"></div>\
                            <div>\
                                <div>' + dataItem['name'] + '</div>\
                                <div>'+$.formatPrice(dataItem['price1'],dataItem['duration1'],dataItem['durationUnit'])+'<span><span '+(dataItem['price2']?'':'style="display:none;"')+'>加钟：</span>'+$.formatPrice(dataItem['price2'],dataItem['duration2'],dataItem['durationUnitPlus'])+'</span></div>\
                            </div>\
                        </div>';
                }
                str +=
                    '<div>\
                        <div class="' + (data[i]['code']||'').toLowerCase() + '">\
                            <div></div>\
                            <div>' + data[i]['name'] + '</div>\
                        </div>\
                        <div>' + str1 + '</div>\
                    </div>';
            }
            if(str!=''){
                content$.Class("hasContent");
                content$.Html(str);

                //点击服务
                $('#content>div>div:nth-of-type(2)>div').Click(function(e,item,index){
                    $.sessionStorage('serviceList_top',content$[0].scrollTop);
                    $.page('serviceItem&id=' + item.getAttribute('hh'));
                });
                //初始化高度
                if(content$[0].scrollTop){
                    content$[0].scrollTop = $('#content>div')[gindex].offsetTop;
                    if(gTop!=null) content$[0].scrollTop=gTop;
                    $.sessionStorageClear('serviceList_top');
                }
            }
            else{
                content$.Class("noContent");
                str = "<div>\
                                <div>暂时没有可预约项目哦，去约技师吧</div>\
                                <div>预约技师</div>\
                        </div>";
                content$.Html(str);
                $("#content>div>div:nth-of-type(2)").Click(function(){
                    $.page("technicianList",-1,true);
                });
            }
            //执行页面切换
            $.pageSwitch();
        }
    });
})();