(function(){
    var htmlStr="", sessionObj, listDiv = $("#content .msg-area>div.list")[0],
        $editDiv = $('#title>div:nth-of-type(1)>div:nth-of-type(2)'),
        msgTip = $('#_clubMenu>div:nth-of-type(2)>div:nth-of-type(1)>i',true),
        msgTipPublic = $('#_publicMenu>div:nth-of-type(2)>div:nth-of-type(1)>i',true),
        confirmDelMsgDiv = $("#confirmDelMsg"),
        tabs = $('#title>div:nth-of-type(1)>div:nth-of-type(1)>div'),
        contentArea = $('#content>div'),
        $delDiv = $('#title>div:nth-of-type(1)>div:nth-of-type(3)'),
        str = '',
        i,
        dataLength,
        isAddData = false,
        page = 1,
        dataAddIcon = $('#loadTip'),
        dataFinishIcon = $('#finishTip'),
        dataAddEnd = ($.sessionStorage('msg_contacts_end') || 'false') == 'true',
        listBox = $("#content .contacts-area>div.list"),
        content$ = $('#content .contacts-area'),
        contentYTop = $.sessionStorage('msg_contacts_top'),
        contentPage = $.sessionStorage('msg_contacts_page'),
        contentData = $.sessionStorage('msg_contacts_data'),
        pageHeight = $.sessionStorage('msg_contacts_page_height') || 0,          //一页内容的高度
        pageSize = 10,
        agile = 0.4;     //自裁加载下页的灵敏度  值越小越灵敏（0.4表示当前面有40%的内容在可视区域时就加载下一页的数据）
    var decodeExpressionReg,sessionItem;
    var defaultMagagerLogo = './img/chat/defaultClubLogo.png';
    var defaultTechLogo = './img/chat/defaultUserLogo.png';
    var expressionObj = { //------表情编码的索引值
        "/::O": "/大笑", "/::Y": "/坏笑", "/::B": "/害羞", "/::A": "/色", "/::C": "/晕", "/::D": "/红心", "/::X": "/心碎了",
        "/::Z": "/握手", "/::F": "/抱拳", "/::E": "/花", "/::T": "/花谢了", "/::P": "/示爱", "/::G": "/亲亲", "/::H": "/大哭",
        "/::I": "/可怜", "/::J": "/生气", "/::K": "/微笑", "/::L": "/冷汗", "/::M":"/困", "/::N":"/调皮", "/::Q":"/敲打",
        "/::R":"/疑问","/::S":"/猪头", "/::U": "/汽水", "/::V": "/西瓜", "/::W": "/鼓掌", "/::a": "/大拇指", "/::b": "/剪刀手"
    },
    //=== 活动消息 ===
      activityMsg = {
          'plumFlower': {
              title: '一元夺',
              subTitle: '我和你只有一块钱的距离'
          },
          'oneYuan': {
              title: '一元夺',
              subTitle: '我和你只有一块钱的距离'
          },
          'timeLimit': {
              title: '限时抢',
              subTitle: '春宵一刻值千金'
          },
          'luckyWheel': {
              title: '大转盘',
              subTitle: '那一世转山转水，只为相见'
          },
          'journal': {
              title: '会所期刊',
              subTitle: '有美女、有福利，你就是我的VIP！'
          }
      };
    ///////////////////////////////////////////////////构造解析表情的正则
    decodeExpressionReg = new RegExp('/::[A-Zab]+', "g");
    var nullDataDiv = $("#content .msg-area>div.nullData")[0],contactsNullDataDiv = $("#content .contacts-area>div.nullData")[0];

    //////////////////////////////////////////////////显示SessionList
    var sl = $.getSessionList(false,true),clubContactMap = {};

    /////对sessionList 排序
    var i, chatId, sortArr = [];
    for(chatId in sl){//若非公众号页面，则显示与当前会所的技师的会话
        if(sl[chatId].clubId== $.$.clubID || !$.$.clubID){
            sortArr.push({ id : chatId , time : sl[chatId].time });
        }
    }
    sortArr.sort(function(a,b){ return (a.time> b.time ? -1 : 1) });
    var msgNewCount = 0;
    var isManager = false
    for(i=0;i<sortArr.length;i++){
        sessionObj = sl[sortArr[i].id];
        if(!sessionObj.name) continue;

        isManager = !sessionObj.techId
        htmlStr += '<div type="'+(isManager ? 'manager' : 'tech')+'" class="msg-item list_'+sortArr[i].id+'" chatId="'+sortArr[i].id+'" data-msg-num="'+sessionObj.new+'">\
                        <div style="background-image:'+(sessionObj.header ? 'url('+sessionObj.header+'),' : '')+'url('+(isManager ? defaultMagagerLogo : defaultTechLogo)+')'+'"></div>\
                        <div>\
                            <div>\
                                <div>\
                                    <div>'+sessionObj.name+'</div>\
                                    <div class="'+(isManager ? 'manager' : (sessionObj.no && sessionObj.no.length>0 ? 'tech' : 'none'))+'">'+(isManager ? '店长' : sessionObj.no)+'</div>\
                                </div>\
                                <div>'+ $.formatMsgTime(sessionObj.time)+'</div>\
                            </div>\
                            <div>\
                                <div>'+(activityMsg[sessionObj.msg.msgType] ? activityMsg[sessionObj.msg.msgType].subTitle : decodeTextMsg(sessionObj.msg.data.replace(/<br>|<br\/>/g,"")))+'</div>\
                                <div '+(sessionObj.new==0 ? "style='display:none;'" : "")+'>'+sessionObj.new+'</div>\
                            </div>\
                        </div>\
                    </div>';
        msgNewCount+=sessionObj.new;
    }
    listDiv.innerHTML = htmlStr;

    if(htmlStr.length==0){
        nullDataDiv.style.display="block";
        $editDiv.Hide();
    }
    if(msgNewCount>0){
        msgTip.Text(msgNewCount);
        msgTip.CSS({ visibility: 'hidden' });
        msgTipPublic.Text(msgNewCount);
        msgTipPublic.CSS({ visibility: 'hidden' });
    }

    //实时显示新消息
    $.refreshMessageList = function(chatId){
        var itemDiv = listDiv.querySelector("div.list_"+chatId), sessionObj = sl[chatId], msgNumTip;
        if(itemDiv){//存在则更新
            itemDiv.children[1].children[1].children[0].innerHTML = activityMsg[sessionObj.msg.msgType]? activityMsg[sessionObj.msg.msgType].subTitle : decodeTextMsg(sessionObj.msg.data.replace(/<br>|<br\/>/g, ""));
            itemDiv.children[1].children[0].children[1].innerHTML = $.formatMsgTime(sessionObj.time);
            msgNumTip = itemDiv.children[1].children[1].children[1];
            msgNumTip.className = "";
            msgNumTip.style.display = 'block';
            msgNumTip.innerHTML = sessionObj.new;
            itemDiv.dataset['msgNum'] = sessionObj.new;
            /////置顶最新的消息
            var firstDiv = listDiv.children[0];
            if(firstDiv != itemDiv){//itemDiv放到顶部
                listDiv.insertBefore(itemDiv,firstDiv);
            }
        }
        else{//不存在则添加
            if(nullDataDiv.style.display=="block") nullDataDiv.style.display="none";
            itemDiv = document.createElement("div");
            itemDiv.className = "msg-item list_"+chatId;
            itemDiv.setAttribute("chatId",chatId);
            itemDiv.dataset['msgNum'] = sessionObj.new;
            isManager = !sessionObj.techId
            itemDiv.innerHTML = '<div style="background-image: '+(sessionObj.header ? 'url('+sessionObj.header+'),' : '')+'url('+(isManager ? defaultMagagerLogo : defaultTechLogo)+')'+'"></div>\
                                <div>\
                                    <div>\
                                        <div>\
                                            <div>'+sessionObj.name+'</div>\
                                            <div class="'+(isManager ? 'manager' : (sessionObj.no && sessionObj.no.length>0 ? 'tech' : 'none'))+'">'+(isManager ? '店长' : sessionObj.no)+'</div>\
                                        </div>\
                                        <div>'+ $.formatMsgTime(sessionObj.time)+'</div>\
                                    </div>\
                                    <div>\
                                        <div>'+(activityMsg[sessionObj.msg.msgType] ? activityMsg[sessionObj.msg.msgType].subTitle : decodeTextMsg(sessionObj.msg.data.replace(/<br>|<br\/>/g,"")))+'</div>\
                                        <div '+(sessionObj.new==0 ? "style='display:none;'" : "")+'>'+sessionObj.new+'</div>\
                                    </div>\
                                </div>';
            if(listDiv.children.length==0) listDiv.appendChild(itemDiv);
            else listDiv.insertBefore(itemDiv,listDiv.children[0]);
            sortArr.push({id:chatId});
        }
        $editDiv.Show();
    };

    $("#_orderTech>div.message",true).ClassClear("new");
    $.pageSwitch(true,true);

    $("#content .msg-area>div.list").Delegate('click','>div>div:nth-of-type(1),>div>div:nth-of-type(2)',function(e,item){
        doClickItem(item);
    });

    //点击消息会话的处理
    function doClickItem(item){
        var chatId = item.parentNode.getAttribute("chatId"), sessionObj = sl[chatId]
          ,techId = sessionObj.techId;
        if(techId){
            $.page("chat&techId="+(sessionObj.techId || "")+(!$.$.clubID ? "&clubId="+sessionObj.clubId : ""));
        }else{      //管理者
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

    //解析文本消息里面的表情
    function decodeTextMsg(msg) {
        return msg.replace(decodeExpressionReg, function () {
            return expressionObj[arguments[0]] || arguments[0];
        });
    }

    //===== 清空按钮 =====
    $editDiv.Event('click',function(e,item){
        $.hideOrderMenu();
        confirmDelMsgDiv.Class('active');
    });

    //==== 清空列表及聊天记录 ====
    $('#conListAndRecords').Click(function () {
        deleteListFunc(true);
    });

    //==== 清空聊天记录 ====
    $('#conRecords').Click(function () {
        deleteListFunc(false);
    });

    //==== 清空列表及聊天记录 ====
    $('#conCancel').Click(function () {
        $.showOrderMenu();
        confirmDelMsgDiv.ClassClear('active');
    });

    function deleteListFunc(isClearList){
        var eb = $.$.easemob,chatId;
        sortArr.forEach(function (o) {
            chatId = o.id;
            $.getMsgList(chatId);
            if(eb.sessionList[chatId]){//从sessionList 里面删除
                if(isClearList) delete eb.sessionList[chatId];
                else {
                    eb.sessionList[chatId].msg.data = '';
                    eb.sessionList[chatId].msg.new = 0;
                    eb.sessionList[chatId].new = 0;
                }
                $.localStorage($.$.userID+"_SessionList",JSON.stringify(eb.sessionList));//替换存储
            }
            if(eb.msgList[chatId]){//从messageList里面删除
                if(isClearList) delete eb.msgList[chatId];
                else eb.msgList[chatId].list = [];
                $.localStorageClear($.$.userID+"_MsgList_"+chatId);
            }
            $('[chatid="'+chatId+'"]>div:nth-of-type(2)>div:nth-of-type(2)>div:nth-of-type(1)').Html('');
            $('[chatid="'+chatId+'"]>div:nth-of-type(2)>div:nth-of-type(2)>div:nth-of-type(2)').Hide();
            if(isClearList) listDiv.removeChild($('[chatid="'+chatId+'"]')[0]);
        });
        if(isClearList) nullDataDiv.style.display="block";
        msgTip.Text(0);
        msgTip.CSS({ visibility: 'hidden' });

        msgTipPublic.Text(0);
        msgTipPublic.CSS({ visibility: 'hidden' });
        $.showOrderMenu();
        confirmDelMsgDiv.ClassClear('active');
        $editDiv.Hide();
    }

    //=========== 联系人 ==========
    //=== 切换 消息/联系人 =====
    tabs.Index(0).Click(function (e,item) {
        item.parentNode.parentNode.classList.remove('show-contacts');
        tabs.ClassClear('active');
        item.classList.add('active');
        contentArea.ClassClear('show-contacts');
        if($delDiv.ClassHave('complete-title')){
            delDivEvent($delDiv[0]);
        }
    });
    tabs.Index(1).Click(function (e,item) {
        switch2Contacts(item);
    });

  /**
   *
   * @param item
   * @param needAni 是否需要过度动画
   */
    function switch2Contacts(item,needAni){
        item.parentNode.parentNode.classList.add('show-contacts');
        tabs.ClassClear('active');
        item.classList.add('active');
        contentArea.Class('show-contacts');
        if(needAni){
            contentArea.Class('no-duration');
            setTimeout(function () {
                contentArea.ClassClear('no-duration');
            },500);
        }
    }

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
                var d, arrDate, arrTime,msg,currClubId = '';
                for (i = 0, dataLength = data.length; i < dataLength; i++) {
                    if($.$.clubID && (!data[i].clubId || data[i].clubId != $.$.clubID)) continue;
                    if(!$.$.clubID && currClubId != data[i].clubId){
                        currClubId = data[i].clubId;
                        str += '<div class="item-header" id="club_'+currClubId+'">'+data[i].clubName+'</div>';
                    }
                    var _amount = clubContactMap[currClubId] || 0;
                    _amount++;
                    clubContactMap[currClubId] = _amount;
                    d = new Date();
                    arrDate = data[i].chatDate.split(" ");
                    arrTime = arrDate[1].split(":");
                    arrDate = arrDate[0].split("-");
                    d.setFullYear(arrDate[0]-0,arrDate[1]-1,arrDate[2]-0);
                    d.setHours(arrTime[0]-0,arrTime[1]-0,arrTime[2]-0);
                    sessionItem = sl[data[i].friendChatId];
                    msg = data[i].friendDescription || "";
                    /*if(sessionItem){
                        msg = decodeTextMsg(sessionItem.msg.data.replace(/<br>|<br\/>/g,""));
                        d = sessionItem.time;
                    }*/
                    isManager = data[i].toType == 'manager';
                    str += "<div class='contact-item' data-chat-Id='"+data[i].friendChatId+"' data-target-Id='"+data[i].friendUserId+"'  data-club-Id='"+(data[i].clubId || '')
                      +"'  data-friend-Name='"+(data[i].friendName || '')+"' data-to-type='"+data[i].toType+"' data-header='"+data[i].friendAvatarUrl+"'>\
                                <div style='background-image: "+(data[i].friendAvatarUrl ? "url("+data[i].friendAvatarUrl+")," : "")+"url("+(isManager ? defaultMagagerLogo : defaultTechLogo)+")"+"'></div>\
                                <div>\
                                    <div>\
                                        <div>\
                                            <div>"+data[i].friendName+"</div>\
                                            <div class='"+(isManager ? 'manager' : (data[i].techNo && data[i].techNo.length>0 ? 'tech' : 'none'))+"'>"+(isManager ? '店长' : data[i].techNo)+"</div>\
                                        </div>\
                                        <div><div>"+msg+"</div><div style='display:none;'>"+ $.formatMsgTime(d)+"</div></div>\
                                    </div>\
                                    <div class='contact-remove'>&times</div>\
                                </div>\
                            </div>";
                }

                if (page == 1) {
                    listBox.Html(str);
                    if (str) {
                        contactsNullDataDiv.style.display='none';
                        if (dataLength < pageSize) {
                            dataAddEnd = true;
                            dataFinishIcon.ClassClear('none');
                        }
                    } else {
                        contactsNullDataDiv.style.display='block';
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

    //点击联系人的处理
    function doContactsClickItem(item){
        $.sessionStorage('msg_contacts_data', listBox.Html());
        $.sessionStorage('msg_contacts_page', page);
        $.sessionStorage('msg_contacts_page_height',pageHeight);
        $.sessionStorage('msg_contacts_end', dataAddEnd);
        $.sessionStorage('msg_contacts_top', content$[0].scrollTop);

        var data = item.dataset,chatId = data.chatId,
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

    //===== 删除联系人 ====
    function delContacts(e, item){
        e.preventDefault();
        var $parent = $(item), chatId = $parent.Attr("data-chat-id"),
          clubId = $parent[0].dataset.clubId,
          listDiv = $("#content .contacts-area>div.list")[0];
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
                var _amount = clubContactMap[clubId] || 0;
                _amount--;
                if(_amount <= 0){
                    delete clubContactMap[clubId];
                    if($('#club_'+clubId).length > 0) listDiv.removeChild($('#club_'+clubId)[0]);
                }else{
                    clubContactMap[clubId] = _amount;
                }
                if($(listDiv).Children().length == 0){
                    contactsNullDataDiv.style.display="block";
                    dataFinishIcon.Class('none');
                    delDivEvent($delDiv[0]);
                }
            }
        });
    }

    function setListClick(){
        //滚动设置
        content$.Event('scroll', function (e) {
            if(contentArea.ClassHave('show-contacts')){
                if(!dataAddEnd && content$[0].scrollTop + content$[0].clientHeight - (page + agile - 1) * pageHeight >= 0  ){
                    addData();
                }
            }
        });

        $("#content").Delegate('click','.contact-item',function(e,item){
            if($(item.parentNode).ClassHave('del-contacts-state')){
                delContacts(e,item);
            }else{
                doContactsClickItem(item);
            }
        });
        //===== 编辑按钮 =====
        $delDiv.Event('click',function(e,item){
            delDivEvent(item);
        });
    }
    function delDivEvent(item){
        var $this = $(item);
        if($this.ClassHave('del-contacts')){
            $('.delete-msg').Class('active');
            $this.ClassClear('del-contacts');
            $this.Class('complete-title');
            $this.Text('完成');
            listBox.Class('del-contacts-state');
        }else{
            $this.ClassClear('complete-title');
            $this.Class('del-contacts');
            $('.delete-msg').ClassClear('active');
            $this.Text('删除');
            listBox.ClassClear('del-contacts-state');
        }
    }

    //缓存加载
    if (contentData) {
        switch2Contacts(tabs[1],true);
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
    $.sessionStorageClear('msg_contacts_data');
    $.sessionStorageClear('msg_contacts_end');
    $.sessionStorageClear('msg_contacts_top');
    $.sessionStorageClear('msg_contacts_page');
    $.sessionStorageClear('msg_contacts_page_height');       //一页内容的高度
})();