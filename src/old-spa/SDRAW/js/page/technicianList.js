(function(){
    $.ajax({
        url: 'service/select',
        success: function (data) {
            /*************************************定义常用变量*************************************/
            var str = '',
                str1='',
                tagStr = '',
                listID=JSON.parse($.sessionStorage('technicianList_ID')||'{}'),
                i,
                j,
                dataLength,
                dataLength2,
                freeIcon=$('#content>div>div:nth-of-type(3)>div:nth-of-type(1)>div:nth-of-type(1)>div:nth-of-type(1)'),
                orderIcon=$('#content>div>div:nth-of-type(3)>div:nth-of-type(1)>div:nth-of-type(2)>div:nth-of-type(1)'),
                orderTip=$('#content>div>div:nth-of-type(3)>div:nth-of-type(1)>div:nth-of-type(2)>div:nth-of-type(2)'),
                selectText=$('#content>div>div:nth-of-type(3)>div:nth-of-type(1)>div:nth-of-type(3)>div:nth-of-type(2)'),
                selectArea=$('#selectArea'),
                selectAll=$('#selectArea>div>div:nth-of-type(1)>div:nth-of-type(1)>div'),
                selectItemLast,
                selectItem,
                isAddData=false,
                page= 1,
                dataAddIcon=$('#loadTip'),
                dataFinishIcon=$('#finishTip'),
                dataAddEnd=($.sessionStorage('technicianList_end')||'false')=='true',
                listBox=$('#content>div>div:nth-of-type(3)>div:nth-of-type(2)'),
                content$=$('#content'),
                contentYTop= $.sessionStorage('technicianList_top'),
                contentPage= $.sessionStorage('technicianList_page'),
                contentData= $.sessionStorage('technicianList_data'),
                agile = 0.4,
                pageHeight = $.sessionStorage('technicianList_page_height'),
                pageSize = 10,
                searchIcon = $("#content>div>div#title>div:nth-of-type(3)"),
                searchDiv = $("#content>div>div.search"),
                searchInput = $("#content>div>div.search>input"),
                searchBtn = $("#content>div>div.search>div");
            /*************************************加载数据*************************************/
            for (i = 0,dataLength=data.length; i < dataLength; i++) {
                for (j = 0,str1='',dataLength2=data[i]['serviceItems'].length; j < dataLength2; j++) {
                    str1 +='<div hh="'+data[i]['serviceItems'][j]['id']+'">'+data[i]['serviceItems'][j]['name']+'</div>';
                }
                str +=
                    '<div>\
                        <div>'+data[i]['name']+'</div>\
                        <div hh=\"'+data[i]["name"]+'\">'+str1+'</div>\
                    </div>';
            }

            $('#selectArea>div>div:nth-of-type(1)>div:nth-of-type(2)').Html(str);
            /*************************************定义逻辑*************************************/
            //加载页面数据
            function addData(newpage,callback){
                if(isAddData)
                    return;
                isAddData=true;
                page=newpage||page+1;
                var state,
                    score,
                    item;
                //初始化闲忙
                if(freeIcon.ClassHave('active')){
                    state='free';
                    $.param('onlyFree',1);
                }else{
                    state='all';
                    $.paramClear('onlyFree');
                }
                //初始化顺序
                if(orderIcon.ClassHave('order_comment')){
                    score=1;
                    $.param('scoreUp',1);
                }else{
                    score=-1;
                    $.paramClear('scoreUp');
                }
                //初始化过滤
                if(selectItem){
                    item=selectItem.getAttribute('hh');
                    $.param('sid',item);
                }else{
                    item=-1;
                    $.paramClear('sid');
                }
                //初始化提示
                dataAddIcon.ClassClear('none');
                dataFinishIcon.Class('none');
                dataAddEnd=false;
                listBox.ClassClear('nullData');

                //开始加载数据
                $.ajax({
                    url: 'technician',
                    data:{
                        page : page,
                        pageSize : pageSize,
                        stateActiveId : state,
                        scoreActiveId : score,
                        itemActiveId : item,
                        techName : searchDiv.ClassHave("active") ? encodeURIComponent(searchInput[0].value) : ""
                    },
                    success: function (data) {
                        data=data['list'];
                        if(page==1)
                            listID={};
                        for (i = 0,str='',dataLength=data.length; i < dataLength; i++) {
                            if(listID[data[i]['id']])
                                continue;
                            else
                                listID[data[i]['id']]=1;
                            if(!data[i]['techTags']||data[i]['techTags'].length==0)
                                data[i]['techTags']=[{tagName:'(无)'}];

                            //排序，当前选择的放在最前面
                            if(selectItem && selectItem.parentNode && data[i]["techTags"].length>1){
                                data[i]["techTags"].sort(function(a,b){
                                    if(a.tagName == selectItem.parentNode.getAttribute("hh")) return -1;
                                    else if(b.tagName == selectItem.parentNode.getAttribute("hh")) return 1;
                                    return 0;
                                });
                            }

                            tagStr = "";
                            if(data[i]["techTags"].length >0) tagStr = "<div>"+data[i]["techTags"][0]["tagName"]+"</div>";
                            if(data[i]["techTags"].length >1) tagStr += "<div>"+data[i]["techTags"][1]["tagName"]+"</div>";
                            if(data[i]["techTags"].length >2) tagStr += "<div>...</div>";

                            str +=
                                '<div hh="'+data[i]['id']+'">\
                                    <div>\
                                        <div style="background-image: url(\''+(data[i]['avatarUrl']|| $.$.defaultHeader)+'\')"></div>\
                                        <div class="'+data[i]['status']+'">'+(data[i]['status']=='free'?'闲':'忙')+'</div>\
                                    </div>\
                                    <div>\
                                        <div>\
                                            <div><div>'+(data[i]['name']|| $.$.defaultTechName)+'</div><div>[<span>'+(data[i]['serialNo']||'')+'</span>]</div></div>\
                                            <div>\
                                                <div class="stars"><div style="width:'+data[i]['star']+'%"></div></div>\
                                                <div>'+data[i]['commentCount']+'评论</div>\
                                            </div>\
                                        </div>\
                                        <div>'+tagStr+'</div>\
                                        <div>\
                                            <div>'+(data[i]['description']||'')+'</div>\
                                            <div>预约</div>\
                                        </div>\
                                    </div>\
                                </div>';
                        }
                        //显示数据修正
                        if(page==1){
                            listBox.Html(str);
                            if(str){
                                listBox.ClassClear('nullData');
                            }else{
                                if(item==-1 && !$.param("sid") && !$.param("scoreUp") && !searchDiv.ClassHave("active")){
                                    $("#content>div>div:nth-of-type(3)").Hide();
                                    $("#content>div>div:nth-of-type(4)").Hide();
                                    $("#content>div>div:nth-of-type(5)").Hide();
                                    $("#content>div>div:nth-of-type(6)").Show();
                                    $("#content>div>div:nth-of-type(6)>div:nth-of-type(2)").Click(function(){
                                        $.page("serviceList");//跳转到服务项目列表
                                    });
                                }
                                else listBox.Class('nullData');
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
                        //事件修正
                        setListClick();
                        isAddData=false;
                        dataAddIcon.Class('none');
                        if(callback)
                            callback();
                    }
                });
            }
            function setListClick(){
                $('div#technicianList #content>div>div:nth-of-type(3)>div:nth-of-type(2)>div',true).Event('click',function(e,item){
                    $.sessionStorage('technicianList_data',listBox.Html());
                    $.sessionStorage('technicianList_page',page);
                    $.sessionStorage('technicianList_page_height',pageHeight);
                    $.sessionStorage('technicianList_end',dataAddEnd);
                    $.sessionStorage('technicianList_ID',JSON.stringify(listID));
                    $.sessionStorage('technicianList_top',content$[0].scrollTop);
                    $.page('technicianDetail&id='+item.getAttribute('hh'));
                },true);
            }
            //点击闲忙
            $('#content>div>div:nth-of-type(3)>div:nth-of-type(1)>div:nth-of-type(1)').Click(function(){
                if(freeIcon.ClassHave('active'))
                    freeIcon.ClassClear('active');
                else
                    freeIcon.Class('active');
                addData(1);
            });
            if($.param('onlyFree')==1)
                freeIcon.Class('active');
            //点击顺序
            $('#content>div>div:nth-of-type(3)>div:nth-of-type(1)>div:nth-of-type(2)>div:nth-of-type(1)').Click(function(e,item){

                if(orderTip.ClassHave('active')){
                    orderTip.ClassClear('active');
                    $(item).ClassClear('active');
                }else{
                    orderTip.Class('active');
                    $(item).Class('active');
                }
                //addData(1);
            });
            orderTip.Delegate('click','>div', function (e, item) {
                orderTip.ClassClear('active');
                var _type = item.dataset.type,$item = $(item),_text = $item.Text();
                if(_type == 'score'){
                    orderTip.Children().Index(0).ClassClear('active');
                    orderIcon.Class('order_score');
                    orderIcon.ClassClear('order_comment');
                }else{
                    orderTip.Children().Index(1).ClassClear('active');
                    orderIcon.ClassClear('order_score');
                    orderIcon.Class('order_comment');
                }
                $item.Class('active');
                orderIcon.ClassClear('active');
                orderIcon.Children().Index(0).Text(_text);
                addData(1);
            });
            if($.param('scoreUp')){
                orderIcon.ClassClear('order_score');
                orderIcon.Class('order_comment');
                orderIcon.Children().Index(0).Text($('#content>div>div:nth-of-type(3)>div:nth-of-type(1)>div:nth-of-type(2)>div:nth-of-type(2)>div[data-type="comment"]').Text());
                orderTip.Children().Index(0).Class('active');
                orderTip.Children().Index(1).ClassClear('active');
            }
            //点击过滤
            $('#content>div>div:nth-of-type(3)>div:nth-of-type(1)>div:nth-of-type(3)').Click(function(){
                $.hideOrderMenu();
                selectArea.TransitionDelay(300);
                selectArea.Translate(0,0);
            });
            //点击过滤遮罩
            function selectAreaHide(){
                selectArea.Translate(0,'100%');
                $.showOrderMenu();
            }
            selectArea.Click(function(e,item){
                if(e.target==item)
                    selectAreaHide();
            });
            //点击全部项目
            selectAll.Click(function(){
                if(selectItem){
                    selectItem.classList.remove('active');
                    selectItem=null;
                }
                selectAll.Class('active');
            });
            //点击项目
            $('#selectArea>div>div:nth-of-type(1)>div:nth-of-type(2)>div>div:nth-of-type(2)>div').Click(function(e,item){
                if(selectItem)
                    selectItem.classList.remove('active');
                selectAll.ClassClear('active');
                if(selectItem==item){
                    selectItem=null;
                }else{
                    selectItem=item;
                    selectItem.classList.add('active');
                }
            });
            //点击取消
            $('#selectArea>div>div:nth-of-type(2)>div:nth-of-type(1)').Click(function(){
                selectAreaHide();
                if(selectItem)
                    selectItem.classList.remove('active');
                selectItem=selectItemLast;
                if(selectItem){
                    selectItem.classList.add('active');
                    selectAll.ClassClear('active');
                }else
                    selectAll.Class('active');
            });
            //点击确定
            $('#selectArea>div>div:nth-of-type(2)>div:nth-of-type(2)').Click(function(){
                selectAreaHide();
                if(selectItem){
                    selectText.Class('active');
                    selectText.Text(selectItem.innerHTML);
                }else{
                    selectText.ClassClear('active');
                    selectText.Text('项目筛选');
                }
                selectItemLast=selectItem;
                addData(1);
            });
            if($.param('sid')){
                var sid=$.param('sid');
                $('#selectArea>div>div:nth-of-type(1)>div:nth-of-type(2)>div>div:nth-of-type(2)>div').Each(function(item){
                    if(item.getAttribute('hh')==sid)
                        selectItem=item;
                });
                if(selectItem){
                    selectItemLast=selectItem;
                    selectItem.classList.add('active');
                    selectAll.ClassClear('active');
                    selectText.Class('active');
                    selectText.Text(selectItem.innerHTML);
                }
            }
            //滚动设置
            content$.Event('scroll', function (e) {
                if(!dataAddEnd && content$[0].scrollTop + content$[0].clientHeight - (page + agile - 1) * pageHeight >= 0  ){
                    addData();
                }
            });

            //点击搜索图标
            searchIcon.Click(function(){
                searchDiv.ClassHave("active") ? searchDiv.ClassClear("active") : searchDiv.Class("active");
            });
            //点击搜索按钮
            searchBtn.Click(function(){
                addData(1);
            });

            //缓存加载
            if(contentData){
                page=parseInt(contentPage);
                listBox.Html(contentData);
                //contentY$.Translate(0,contentYTop+'px');
                setTimeout(function () {
                    content$[0].scrollTop = contentYTop;
                },1);
                setListClick();
                if(dataAddEnd)
                    dataFinishIcon.ClassClear('none');
                $.pageSwitch();
            }else
                addData(1,$.pageSwitch());
            $.sessionStorageClear('technicianList_ID');
            $.sessionStorageClear('technicianList_data');
            $.sessionStorageClear('technicianList_end');
            $.sessionStorageClear('technicianList_top');
            $.sessionStorageClear('technicianList_page');
            $.sessionStorageClear('technicianList_page_height');
        }
    });
})();