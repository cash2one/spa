(function(){
    /*************************************定义常用变量*************************************/
    var str = '',
	    listID=JSON.parse($.sessionStorage('collect_ID')||'{}'),
        i,
        groups,
        clubData,
        dataLength,
        isAddData=false,
        page= 1,
        dataAddIcon=$('#loadTip'),
        dataFinishIcon=$('#finishTip'),
        dataAddEnd=($.sessionStorage('collect_end')||'false')=='true',
        listBox=$('#content>div>div:nth-of-type(2)>div'),
        singleListBox,
        content$=$('#content'),
        contentYTop= $.sessionStorage('collect_top'),
        contentPage= $.sessionStorage('collect_page'),
        contentData= $.sessionStorage('collect_data'),
        //agile = 0.4,       //自裁加载下页的灵敏度  值越小越灵敏（0.4表示当前面有40%的内容在可视区域时就加载下一页的数据）
        agile = -0.5,      //此处因后台数据请求接口有bug(第二次--第二页请求，如果数据多于5条，则一直只返回5条数据)，
                                   //为不改onscroll的逻辑，此处的值暂时为负值
        pageHeight = $.sessionStorage('collect_page_height'),
        pageSize = 10;

    if($.$.visitChannel != "9358"){
        listBox.Html("<div></div>");
        singleListBox=$('#content>div>div:nth-of-type(2)>div>div');
    }

    if($.$.visitChannel == "9358"){
        $("#content>div>div#title>div:nth-of-type(2)").Click(function(){
            $.page("personal",-1,true);
        });
    }

    /*************************************加载数据*************************************/
    /*************************************定义逻辑*************************************/
    //加载页面数据
    function addData(newpage,callback){
        if(isAddData)
            return;
        isAddData=true;
        page=newpage||page+1;
        //初始化提示
        dataAddIcon.ClassClear('none');
        dataFinishIcon.Class('none');
        dataAddEnd=false;
        //开始加载数据
        $.ajax({
            url:"../api/v2/profile/user/favorite",
            isReplaceUrl:true,
            data:{
                token : $.$.userToken,
                clubId : $.$.visitChannel=="9358" ? "" : $.$.clubID,
                page : page,
                pageSize : pageSize
            },
            success: function (data) {
                if(data.statusCode != "200"){
                    return $.tipShow(data.msg||"数据请求失败！")
                }
                if($.$.visitChannel != "9358"){//单个会所的收藏列表处理
                    data=data['respData'];
                    str="";
                    for (i = 0,dataLength=data.length; i < dataLength; i++) {
                        if(listID[data[i]['techId']]) continue;
                        else listID[data[i]['techId']]=1;
                        str +=generateItemHtml(data[i]);
                    }
                    if(page==1){
                        singleListBox.Html(str);
                        if(str){
                            singleListBox.ClassClear('nullData');
                        }else{
                            singleListBox.Class('nullData');
                            dataAddEnd=true;
                        }
                        pageHeight = listBox[0].scrollHeight;
                    }else{
                        singleListBox.Html(str,true);
                        if(str==''){
                            dataAddEnd=true;
                            dataFinishIcon.ClassClear('none');
                        }
                    }
                }
                else{//多个会所的收藏列表处理
                    groups = {};
                    for(i=0;i<data.respData.length;i++){
                        if(listID[data.respData[i]["techId"]]) continue;
                        else listID[data.respData[i]["techId"]]=1;

                        if(!groups[data.respData[i]["clubId"]]){
                            groups[data.respData[i]["clubId"]] = {
                                clubName : data.respData[i]["clubName"],
                                clubId : data.respData[i]["clubId"],
                                list : []
                            };
                        }
                        groups[data.respData[i]["clubId"]]["list"].push(data.respData[i]);
                    }

                    str="";
                    var item,addItem,count= 0,addTag,addStr="";
                    for(item in groups ){
                        addTag = false;
                        if(page>1 && count==0){
                            addItem = $("#content>div>div:nth-of-type(2)>div>div:last-child");
                            if(addItem.Attr("hh")==groups[item]["clubId"]){
                                clubData = groups[item]["list"];
                                for(i=0;i<clubData.length;i++){
                                    addStr += generateItemHtml(clubData[i]);
                                }
                                addItem.Html(addStr,true);
                                addTag = true;
                            }
                        }

                        if(!addTag){
                            str+="<div hh='"+groups[item]["clubId"]+"'><div class='header"+(page==1 && count==0 ? " first" : "")+"'>"+groups[item]["clubName"]+"</div>";
                            clubData = groups[item]["list"];
                            for(i=0;i<clubData.length;i++){
                                str += generateItemHtml(clubData[i]);
                            }
                            str +="</div>";
                        }
                        count++;
                    }

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
                        if(str=='' && addStr==''){
                            dataAddEnd=true;
                            dataFinishIcon.ClassClear('none');
                        }
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

    function generateItemHtml(itemData){
        if(!itemData['tags'] || itemData['tags'].length==0){
            itemData['tags']=[{tagName:'(无)'}];
        }
        return '<div class="item" hh="'+itemData['techId']+'">\
                            <div>\
                                <div style="background-image: url(\''+(itemData['avatarUrl']|| $.$.defaultHeader)+'\')"></div>\
                                <div class="'+itemData['status']+'">'+(itemData['status']=='free'?'闲':'忙')+'</div>\
                            </div>\
                            <div>\
                                <div>\
                                    <div><div>'+(itemData['techName']|| $.$.defaultTechName)+'</div>[<div>'+(itemData['serialNo']||'')+'</div>]</div>\
                                    <div>\
                                        <div class="stars"><div style="width:'+itemData['star']+'%"></div></div>\
                                        <div>'+itemData['commentCount']+'评论</div>\
                                    </div>\
                                </div>\
                                <div>'+itemData['tags'][0]['tagName']+'</div>\
                                <div>\
                                    <div>'+(itemData['description']||'')+'</div>\
                                    <div>预约</div>\
                                </div>\
                            </div>\
                        </div>';
    }

    function setListClick(){
        $('div#collect #content>div>div:nth-of-type(2)>div>div>div.item',true).Event('click',function(e,item){
            $.sessionStorage('collect_data',listBox.Html());
            $.sessionStorage('collect_page',page);
            $.sessionStorage('collect_page_height',pageHeight);
            $.sessionStorage('collect_end',dataAddEnd);
            $.sessionStorage('collect_ID',JSON.stringify(listID));
            $.sessionStorage('collect_top',content$[0].scrollTop);
            $.page('technicianDetail&id='+item.getAttribute('hh'));
        },true);
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
        if(dataAddEnd)
            dataFinishIcon.ClassClear('none');
        $.pageSwitch();
    }else
        addData(1,$.pageSwitch());
    $.sessionStorageClear('collect_ID');
    $.sessionStorageClear('collect_data');
    $.sessionStorageClear('collect_end');
    $.sessionStorageClear('collect_top');
    $.sessionStorageClear('collect_page');
    $.sessionStorageClear('collect_page_height');
})();
