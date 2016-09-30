(function(){
    var top=$.param('top')||'';

    /*************************************定义常用变量*************************************/
    var str = '',
        sid= $.param('id'),
        sIndex= 0,
        content$=$('#content'),
        content=$('#content')[0],
        lastClickTime=null,
        contentX$=$('#content>div'),
        i,
        tel,
        telCancel,
        telDetail=$('#telDetail');

    var itemDataArr, itemIndex;

    if(top==1){//推荐的项目
        $.ajax({
            url : 'service/item',
            data : { top : 1 },
            success: function (data) {
                if(data.statusCode != "200"){
                    $.tipShow(data.msg || "数据请求失败！");
                    return $.pageCancel();
                }
                initAppointment(data.respData);
                data = data.respData.serviceItems;
                for (i = 0; i < data.length; i++) {
                    str += generateItemHtml(data[i]);
                    if(sid==data[i]['id']){
                        sIndex=i;
                    }
                }
                str=='' ? content$.Class('nullData') : contentX$.Html(str);
                $.scroll({
                    content:content,
                    contentX:contentX$[0],
                    //contentY:contentX$[0].children,
                    indexX:sIndex,
                    endX:function(i){
                        var prevIndex = sIndex;
                        sIndex=i;
                        $.param('id',data[i]['id']);

                    }
                });

                $("div.list").Click(function(e,item){//项目选择
                    var currTime =e.timeStamp || (new Date()).getTime();
                    if(!lastClickTime){
                        lastClickTime = currTime;
                        doClickList(item);
                    }
                    else{
                        if(currTime-lastClickTime>350){//处理有的浏览器两次派发click，导致无法选择
                            doClickList(item);
                        }
                        lastClickTime = currTime;
                    }
                });

                //执行页面切换
                $.pageSwitch(true,false);

                //固定banner开始加载
                $('#content>div>div>div>div:nth-of-type(1)>div:nth-of-type(1)').DivBackgroundCacheBack();
                //内容图片开始加载
                $('#content>div>div>div>div:nth-of-type(2) img').ImgSrcCacheBack();
            }
        });
    }
    else{//所有的服务项目
        queryItemData(sid,0);
    }

    function initAppointment(data){
        if(data.appointment == 'N' && data.phoneAppointment == 'Y'){
            //电话号码
            var str='';
            if(data['telephone']!=''){
                for(var i= 0,str1=data['telephone'].split(','),length=str1.length;i<length;i++){
                    str+='<div>'+str1[i]+'</div>';
                }
            }
            $('#telDetail>div').Html(str+'<div>取消</div>');
            telDetail.Event('touchmove',function(e){
                e.preventDefault();
            },false);
            telDetail.Click(function(e,item){
                if(e.target==item) telDetail.ClassClear();
            });
            tel=$('#telDetail>div>div');
            telCancel=tel.Remove(tel.length-1);
            tel.Click(function(e,item){
                location.href='tel:'+item.innerHTML;
            });
            telCancel.Click(function(){
                telDetail.ClassClear();
            });

            //点击"确认预约"按钮
            $("#confirmBtn").Click(function(){
                if(data['telephone']=='') $.tipShow('暂无电话');
                else telDetail.Class('active');
            });
        }else{
            //点击"确认预约"按钮
            $("#confirmBtn").Click(function(){
                if(data.payAppointment == 'on' && !$.$.ua.isWX){
					if($.checkAccessMenu('confirmOrder')){
						$.tipShow('【此会所需支付预约，请在微信客户端中打开】');
					}
                }else{
                    var itemID = (top==1 ? $("#content>div.scroll_content>div:nth-of-type("+(sIndex+1)+")").Attr("hh") : itemDataArr[sIndex].id);
                    var techID = $("#content>div.scroll_content>div:nth-of-type("+(sIndex+1)+")>div>div:nth-of-type(3)>div.selected").Attr("hh");
                    $.login("confirmOrder&itemId="+itemID+(techID ? "&techId="+techID : '')+"&backPublic=true",false,true,true);
                }
            });
        }
    }

    //分页查询服务项目
    function queryItemData(id,direction){//direction -1 0 1
        $.ajax({
            url: 'service/item',
            data: {
                top: 0,
                index:direction,
                itemId : id,
                pageSize : 5
            },
            success: function (data) {
                if (data.statusCode != "200"){
                    $.tipShow(data.msg || "数据请求失败！");
                    return $.pageCancel();
                }

                if(!itemDataArr){//初始加载数据
                    if(data.pageCount==0){
                        content$.Class('nullData');
                        return $.pageSwitch(true,false);
                    }
                    initServiceItemPage(data);
                }
                initAppointment(data.respData);
                itemIndex = data.respData.itemIndex;
                data = data.respData.serviceItems;
                var tempIndex;
                for(i=0;i<data.length;i++){
                    if(data[i].id == id){
                        tempIndex=i;
                        break;
                    }
                }
                if(!tempIndex && direction!=0){
                    if(direction==-1) tempIndex=data.length;
                }
                tempIndex = itemIndex-tempIndex;
                for(i=0;i<data.length;i++){
                    if(!itemDataArr[i+tempIndex]){
                        itemDataArr[i+tempIndex] = {
                            "status" : 0,
                            "id" : data[i].id,
                            "dataObj" : data[i]
                        };
                    }
                }

                //生成HTML
                for(i=0;i<itemDataArr.length;i++){
                    if(itemDataArr[i] && itemDataArr[i].status==0){
                        $("#content>div.scroll_content>div:nth-of-type("+(i+1)+")").Html(generateItemHtml(itemDataArr[i].dataObj));
                        $("div#content>div.scroll_content>div:nth-of-type("+(i+1)+") div.list").Click(function(e,item){//项目选择
                            var currTime =e.timeStamp || (new Date()).getTime();
                            if(!lastClickTime){
                                lastClickTime = currTime;
                                doClickList(item);
                            }
                            else{
                                if(currTime-lastClickTime>350){//处理有的浏览器两次派发click，导致无法选择
                                    doClickList(item);
                                }
                                lastClickTime = currTime;
                            }
                        });
                        itemDataArr[i].status = 1;//已处理更改状态
                    }
                }

                if(direction==0) $.pageSwitch(true,false);

                //固定banner开始加载
                $('#content>div>div>div>div:nth-of-type(1)>div:nth-of-type(1)').DivBackgroundCacheBack();
                //内容图片开始加载
                $('#content>div>div>div>div:nth-of-type(2) img').ImgSrcCacheBack();

            }
        });
    }

    function initServiceItemPage(data){
        itemDataArr = [];
        itemDataArr.length = data.pageCount;
        var htmlStr = "";
        for(var j=0;j<itemDataArr.length;j++){
            htmlStr += "<div></div>";
        }
        contentX$.Html(htmlStr);
        sIndex = data.respData.itemIndex;
        $.scroll({
            content:content,
            contentX:contentX$[0],
            //contentY:contentX$[0].children,
            indexX:sIndex,
            endX:function(i){
                var direction = (i-sIndex>0 ? 1 : -1);
                sIndex=i;
                $.param('id',itemDataArr[i]['id']);
                ///////////////////////////////////////////////
                if((direction==1 && sIndex<itemDataArr.length-1 && !itemDataArr[sIndex+1]) ||
                    (direction==-1 && sIndex>0 && !itemDataArr[sIndex-1])){
                    queryItemData(itemDataArr[i]["id"],direction);
                }
            }
        });
    }

    function generateItemHtml(itemData){
        var itemHtml = (top==1 ? '<div hh="'+itemData["id"]+'">' : ''),  j;
        itemHtml +='<div>\
                            <div>\
                                <div imageCache="'+(itemData['imageUrl']|| $.$.defaultService)+'"></div>\
                                <div>\
                                    <div>'+itemData['name']+'</div>\
                                    <div'+(itemData['price'] ? '' : ' style="display:none;"')+'>\
                                        <div></div>\
                                        <div>'+ $.formatPrice(itemData['price'],itemData['duration'],itemData['durationUnit'])+'</div>\
                                    </div>\
                                    <div'+(itemData['pricePlus'] ? '' : ' class="none"')+'>加钟'+$.formatPrice(itemData['pricePlus'],itemData['durationPlus'],itemData['durationUnitPlus'])+'</div>\
                                </div>\
                            </div>\
                            <div><div><div></div>项目说明</div>'+(itemData['description']||'').replace(/src/g,'imageCache')+'</div>';

        if(itemData["techs"] && itemData["techs"].length>0){
            itemHtml +=  '<div>\
                                <div class="title"><div></div>选择技师</div>';
            for(j=0;j<itemData["techs"].length;j++){
                itemHtml += '<div class="list" hh="'+itemData["techs"][j]["id"]+'">\
                                        <div></div>\
                                        <div style="background-image: url('+(itemData["techs"][j]["avatarUrl"] || $.$.defaultHeader)+')"></div>\
                                        <div>\
                                            <div><div>'+($.$.ua.isFirefox && itemData["techs"][j]["name"].length>3 ? itemData["techs"][j]["name"].substr(0,3)+"..." : itemData["techs"][j]["name"])+'</div><div>[<span>'+(itemData["techs"][j]["serialNo"] || '')+'</span>]</div> </div>\
                                            <div>'+(itemData["techs"][j]["description"] || "这个技师很懒，没有填写个人简介...")+'</div>\
                                            <div><div><div style="width:'+itemData["techs"][j]["star"]+'%"></div></div><span>'+itemData["techs"][j]["commentCount"]+'评论</span></div>\
                                        </div>\
                                    </div>';
            }
            itemHtml += '</div>';
        }
        itemHtml +='</div>';
        if(top==1) itemHtml+='</div>';

        return itemHtml;
    }

    function doClickList(item){
        var item = $(item);
        if(item.ClassHave("selected")){
            item.ClassClear("selected");
        }
        else{
            $("#content>div.scroll_content>div:nth-of-type("+(sIndex+1)+")>div>div:nth-of-type(3)>div.list").ClassClear("selected");//当前页的选择取消掉
            item.Class("selected");
        }
    }
})();