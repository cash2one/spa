(function(){
    $.ajax({
        url: $.param('id')+'/actdetail',
        success: function (data) {
            if(data.statusCode != "200"){
                $.tipShow(data.msg);
                $.pageCancel();
                return;
            }
            /*************************************定义常用变量*************************************/
            var dataLength=0,
                str='',
                str1,
                items,
                itemsLast,
                i,
                sBanner=$('#content>div:nth-of-type(1)>div:nth-of-type(1)'),
                sTitle=$('#content>div:nth-of-type(1)>div:nth-of-type(2)>div:nth-of-type(1)>span'),
                sDate=$('#content>div:nth-of-type(1)>div:nth-of-type(2)>div:nth-of-type(2)>div:nth-of-type(2)'),
                sContent=$('#content>div:nth-of-type(1)>div:nth-of-type(2)>div:nth-of-type(3)>div:nth-of-type(2)'),
                content$=$('#content');
            data=data['respData'];
            /*************************************加载数据*************************************/
            if(data['act']){
                sBanner.CSS('backgroundImage','url("'+data['act']['actLogoUrl']+'")');
                sTitle.Text(data['act']['actTitle']);
                sDate.Text($.formatDate(data['act']['startDate'],data['act']['endDate']));
                sContent.Html(data['act']['actContent']);
            }
            if(data['acts']){
                for (i = 0,dataLength=data['acts'].length; i < dataLength; i++) {
                    //匹配已显示活动
                    str1=data['acts'][i]['actId']==data['act']['actId']?'active':'';
                    if(str1!='')
                        itemsLast=i;
                    //修正数据，在click的时候还会用到此字段
                    data['acts'][i]['dateStr'] = $.formatDate(data['acts'][i]['startDate'],data['acts'][i]['endDate']);
                    str+=
                        '<div class="'+str1+'">\
                        <div style="background-image: url(\''+data['acts'][i]['actLogoUrl']+'\')">\
                                <div>\
                                </div>\
                            </div>\
                            <div>\
                                <div>\
                                    <div></div>\
                                    <span>'+data['acts'][i]['actTitle']+'</span>\
                                </div>\
                                <div>\
                                    <div>活动时间：'+data['acts'][i]['dateStr']+'</div>\
                                    <a></a>\
                                </div>\
                            </div>\
                        </div>';
                }
                //var strTest='';
                //for(var j=0;j<150;j++)
                //    strTest+=str;
                //str=strTest;
                $('#content>div:nth-of-type(2)>div:nth-of-type(2)').Html(str);
                if(dataLength<2)
                    $('#content>div:nth-of-type(2)').Hide();
            }else{
                content$.Class('nullData');
                $('#content>div').Hide();
            }
            /*************************************定义逻辑*************************************/
            //点击预约按钮
            $('#content>div:nth-of-type(1)>div:nth-of-type(2)>div:nth-of-type(1)>a').Page('technicianList');
            //点击其他活动
            items=$('#content>div:nth-of-type(2)>div:nth-of-type(2)>div');
            itemsLast=items[itemsLast];
            items.Click(function(e,item,index){
                //处理已经显示的项
                itemsLast.classList.remove('active');
                //处理新项
                itemsLast=data['acts'][index];
                sBanner.CSS('backgroundImage','url("'+itemsLast['actLogoUrl']+'")');
                sTitle.Text(itemsLast['actTitle']);
                sDate.Html(itemsLast['dateStr']);
                sContent.Html(itemsLast['actContent']);
                //修改参数
                $.param('id',itemsLast['actId']);
                itemsLast=item;
                itemsLast.classList.add('active');
                //滚动条置顶
                content$[0].scrollTop=0;
            });
            //执行页面切换
            $.pageSwitch();
        }
    });
})();