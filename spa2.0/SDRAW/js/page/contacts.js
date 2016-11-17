(function(){
    var $editDiv = $('#title>div:nth-of-type(1)>div'),
        str = '',
      i,
      dataLength,
      isAddData = false,
      page = 1,
      dataAddIcon = $('#loadTip'),
      dataFinishIcon = $('#finishTip'),
      dataAddEnd = ($.sessionStorage('contacts_end') || 'false') == 'true',
      listBox = $("#content>div.list"),
      content$ = $('#content'),
      contentYTop = $.sessionStorage('contacts_top'),
      contentPage = $.sessionStorage('contacts_page'),
      contentData = $.sessionStorage('contacts_data'),
      pageHeight = $.sessionStorage('contacts_page_height') || 0,          //一页内容的高度
      pageSize = 10,
      agile = 0.4;     //自裁加载下页的灵敏度  值越小越灵敏（0.4表示当前面有40%的内容在可视区域时就加载下一页的数据）

    var nullDataDiv = $("#content>div.nullData")[0],
        sl = $.getSessionList(false,true),
        decodeExpressionReg,
        sessionItem,
        expressionObj = { //------表情编码的索引值
        "/::O": "/大笑", "/::Y": "/坏笑", "/::B": "/害羞", "/::A": "/色", "/::C": "/晕", "/::D": "/红心", "/::X": "/心碎了",
        "/::Z": "/握手", "/::F": "/抱拳", "/::E": "/花", "/::T": "/花谢了", "/::P": "/示爱", "/::G": "/亲亲", "/::H": "/大哭",
        "/::I": "/可怜", "/::J": "/生气", "/::K": "/微笑", "/::L": "/冷汗", "/::M":"/困", "/::N":"/调皮", "/::Q":"/敲打",
        "/::R":"/疑问","/::S":"/猪头", "/::U": "/汽水", "/::V": "/西瓜", "/::W": "/鼓掌", "/::a": "/大拇指", "/::b": "/剪刀手"
    };
    ///////////////////////////////////////////////////构造解析表情的正则
    decodeExpressionReg = new RegExp('/::[A-Zab]+', "g");

    //加载页面数据
    function addData(newpage, callback) {
        if (isAddData) return;
        isAddData = true;
        page = newpage || page + 1;

        //初始化提示
        dataAddIcon.ClassClear('none');
        dataFinishIcon.Class('none');
        dataAddEnd = false;

        //开始加载数据
        $.ajax({
            url: "../api/v1/emchat/friendlist/"+ $.$.easemob.userId,
            isReplaceUrl:true,
            data: {
                channel: 'center',
                page: page,
                pageSize: pageSize
            },
            success: function (data) {
                if (data.statusCode != "200") {
                    return $.tipShow(data.msg || "数据请求失败！")
                }
                data = data['respData'];
                str = "";
                var d, arrDate, arrTime,msg;
                for (i = 0, dataLength = data.length; i < dataLength; i++) {
                    if($.$.clubID && (!data[i].clubId || data[i].clubId != $.$.clubID)) continue;
                    d = new Date();
                    arrDate = data[i].chatDate.split(" ");
                    arrTime = arrDate[1].split(":");
                    arrDate = arrDate[0].split("-");
                    d.setFullYear(arrDate[0]-0,arrDate[1]-1,arrDate[2]-0);
                    d.setHours(arrTime[0]-0,arrTime[1]-0,arrTime[2]-0);
                    sessionItem = sl[data[i].friendChatId];
                    msg = data[i].friendDescription || "";
                    if(sessionItem){
                        msg = decodeTextMsg(sessionItem.msg.data.replace(/<br>|<br\/>/g,""));
                        d = sessionItem.time;
                    }
                    str += "<div data-chat-Id='"+data[i].friendChatId+"' data-target-Id='"+data[i].friendUserId+"'  data-club-Id='"+(data[i].clubId || '')
                            +"'  data-friend-Name='"+(data[i].friendName || '')+"' data-to-type='"+data[i].toType+"' data-header='"+data[i].friendAvatarUrl+"'>\
                                <div style='background-image: url("+(data[i].friendAvatarUrl || (data[i].toType == 'manager'?$.$.defaultClubLogo:$.$.defaultHeader)) +")'></div>\
                                <div>\
                                    <div>"+data[i].friendName+(data[i].techNo && data[i].techNo.length>0 ? "<span><span>[</span>"+data[i].techNo+"<span>]</span></span>" : "")+"</div>\
                                    <div>"+msg+"</div>\
                                    <div>"+ $.formatMsgTime(d)+"</div>\
                                </div><div class='delete-msg'>删除记录</div>\
                         </div>";
                }

                if (page == 1) {
                    listBox.Html(str);
                    if (str) {
                        nullDataDiv.style.display='none';
                    } else {
                        nullDataDiv.style.display='block';
                        dataAddEnd = true;
                    }
                    pageHeight = listBox[0].scrollHeight;
                } else {
                    listBox.Html(str, true);
                    if (dataLength < pageSize) {
                        dataAddEnd = true;
                        dataFinishIcon.ClassClear('none');
                    }
                }
                //事件修正
                isAddData = false;
                dataAddIcon.Class('none');
                if (callback) callback();
            }
        });
    }

    $.pageSwitch(true,true);

    //点击联系人的处理
    function doClickItem(item){
        $.sessionStorage('contacts_data', listBox.Html());
        $.sessionStorage('contacts_page', page);
        $.sessionStorage('contacts_page_height',pageHeight);
        $.sessionStorage('contacts_end', dataAddEnd);
        $.sessionStorage('contacts_top', content$[0].scrollTop);

        var data = item.parentNode.dataset,chatId = data.chatId,
          targetId = data.targetId,
          clubId = data.clubId,
          toType = data.toType;
        if(toType == 'tech'){
            $.page("chat&techId="+targetId+"&clubId="+clubId);
        }else if(toType == 'manager'){
            var sessionObj = $.getSessionList(false,true)[chatId] || {
                  name: item.parentNode.getAttribute("data-friend-name"),
                  header: data.header || $.$.defaultClubLogo,
                  avatar: '',
                  clubId: clubId
              };
            $.$.easemob.currChatTech = {
                chatId : chatId,
                name : sessionObj.name,
                header : sessionObj.header,
                avatar : sessionObj.avatar,
                clubId : sessionObj.clubId,
                clubName : "",
                techId : "",
                inviteCode : "",
                no : "",
                appointment : "n",
                phoneAppointment : "n",
                telephone : "",
                chatName : "",
                chatHeader : ""
            };
            $.page("chat&techId="+(sessionObj.techId || "")+(!$.$.clubID ? "&clubId="+sessionObj.clubId : ""));
        }
    }

    function setListClick(){
        //滚动设置
        content$.Event('scroll', function (e) {
            if(!dataAddEnd && content$[0].scrollTop + content$[0].clientHeight - (page + agile - 1) * pageHeight >= 0  ){
                addData();
            }
        });

        $("#content").Delegate('click','>div.list>div>div:nth-of-type(1),>div.list>div>div:nth-of-type(2)',function(e,item){
            doClickItem(item);
        });

        //===== 编辑按钮 =====
        $editDiv.Event('click',function(e,item){
            var $this = $(item);
            if($this.ClassHave('edit-title')){
                $('.delete-msg').Class('active');
                $this.ClassClear('edit-title');
                $this.Class('complete-title');
                $this.Text('完成');
            }else{
                $this.ClassClear('complete-title');
                $this.Class('edit-title');
                $('.delete-msg').ClassClear('active');
                $this.Text('编辑');
            }
        });
        //===== 删除记录按钮 ====
        $("#content").Delegate('click','>div.list .delete-msg', function (e, item, i) {
            e.preventDefault();
            var $parent = $(item.parentNode), chatId = $parent.Attr("data-chat-id"),
              listDiv = $("#content>div.list")[0];
            $.ajax({
                url: "../api/v1/emchat/friend",
                isReplaceUrl:true,
                type:'post',
                data: {
                    channel: 'center',
                    currentChatId: $.$.easemob.userId,
                    showFlag: 'n',
                    friendChatId:chatId
                },
                success: function (data) {
                    if (data.statusCode != "200") {
                        return $.tipShow(data.msg || "请求失败！")
                    }
                    listDiv.removeChild($parent[0]);
                    if($(listDiv).Children().length == 0){
                        nullDataDiv.style.display="block";
                        $editDiv[0].click();
                    }
                }
            });
        });

        $('#title>div:nth-of-type(2)>a').Click(function (e, item) {
            $.page('',-1);
        });
    }



    //解析文本消息里面的表情
    function decodeTextMsg(msg) {
        return msg.replace(decodeExpressionReg, function () {
            return expressionObj[arguments[0]] || arguments[0];
        });
    }


    //缓存加载
    if (contentData) {
        page = parseInt(contentPage);
        listBox.Html(contentData);
        //contentY$.Translate(0, contentYTop + 'px');
        setTimeout(function () {
            content$[0].scrollTop =  contentYTop;
        },1);
        setListClick();
        if (dataAddEnd) dataFinishIcon.ClassClear('none');
        $.pageSwitch();
    } else{
        addData(1);
        setListClick();
    }
    //addData(1, $.pageSwitch());
    $.sessionStorageClear('contacts_data');
    $.sessionStorageClear('contacts_end');
    $.sessionStorageClear('contacts_top');
    $.sessionStorageClear('contacts_page');
    $.sessionStorageClear('contacts_page_height');       //一页内容的高度
})();