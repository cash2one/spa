(function(){
    var htmlStr="", sessionObj, listDiv = $("#content>div.list")[0],
        $editDiv = $('#title>div:nth-of-type(1)>div'),
        msgTip = $('#_clubMenu>div:nth-of-type(2)>div:nth-of-type(1)>i',true),
        msgTipPublic = $('#_publicMenu>div:nth-of-type(2)>div:nth-of-type(1)>i',true);
    var decodeExpressionReg;
    var expressionObj = { //------表情编码的索引值
        "/::O": "/大笑", "/::Y": "/坏笑", "/::B": "/害羞", "/::A": "/色", "/::C": "/晕", "/::D": "/红心", "/::X": "/心碎了",
        "/::Z": "/握手", "/::F": "/抱拳", "/::E": "/花", "/::T": "/花谢了", "/::P": "/示爱", "/::G": "/亲亲", "/::H": "/大哭",
        "/::I": "/可怜", "/::J": "/生气", "/::K": "/微笑", "/::L": "/冷汗", "/::M":"/困", "/::N":"/调皮", "/::Q":"/敲打",
        "/::R":"/疑问","/::S":"/猪头", "/::U": "/汽水", "/::V": "/西瓜", "/::W": "/鼓掌", "/::a": "/大拇指", "/::b": "/剪刀手"
    };
    ///////////////////////////////////////////////////构造解析表情的正则
    decodeExpressionReg = new RegExp('/::[A-Zab]+', "g");
    var nullDataDiv = $("#content>div.nullData")[0];

    //////////////////////////////////////////////////显示SessionList
    var sl = $.getSessionList(false,true);

    /////对sessionList 排序
    var i, chatId, sortArr = [];
    for(chatId in sl){//若非公众号页面，则显示与当前会所的技师的会话
        if(sl[chatId].clubId== $.$.clubID || !$.$.clubID){
            sortArr.push({ id : chatId , time : sl[chatId].time });
        }
    }
    sortArr.sort(function(a,b){ return (a.time> b.time ? -1 : 1) });
    var msgNewCount = 0;
    for(i=0;i<sortArr.length;i++){
        sessionObj = sl[sortArr[i].id];
        //console.log("sessionObj："+JSON.stringify(sessionObj));
        if(!sessionObj.name) continue;
        htmlStr += "<div chatId='"+sortArr[i].id+"' data-msg-num='"+sessionObj.new+"' class='list_"+sortArr[i].id+"'>\
                                <div style='background-image: url("+sessionObj.header +")'></div>\
                                <div>\
                                    <div>"+sessionObj.name+(sessionObj.no && sessionObj.no.length>0 ? "<span><span>[</span>"+sessionObj.no+"<span>]</span></span>" : "")+"</div>\
                                    <div>"+decodeTextMsg(sessionObj.msg.data.replace(/<br>|<br\/>/g,""))+"</div>\
                                    <div>"+ $.formatMsgTime(sessionObj.time)+"</div>\
                                    <div "+(sessionObj.new==0 ? "class='hidden'" : "")+">"+sessionObj.new+"</div>\
                                </div><div class='delete-msg'>删除记录</div>\
                         </div>";
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
            itemDiv.children[1].children[1].innerHTML = decodeTextMsg(sessionObj.msg.data.replace(/<br>|<br\/>/g, ""));
            itemDiv.children[1].children[2].innerHTML = $.formatMsgTime(sessionObj.time);
            msgNumTip = itemDiv.children[1].children[3];
            msgNumTip.className = "";
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
            itemDiv.className = "list_"+chatId;
            itemDiv.setAttribute("chatId",chatId);
            itemDiv.dataset['msgNum'] = sessionObj.new;
            itemDiv.innerHTML = "<div style='background-image: url(" + sessionObj.header + ")'></div>\
                                            <div>\
                                                <div>"+sessionObj.name+(sessionObj.no && sessionObj.no.length>0 ? "<span><span>[</span>"+sessionObj.no+"<span>]</span></span>" : "")+"</div>\
                                                <div>" + decodeTextMsg(sessionObj.msg.data.replace(/<br>|<br\/>/g, "")) + "</div>\
                                                <div>" + $.formatMsgTime(sessionObj.time) + "</div>\
                                                <div>" + sessionObj.new + "</div>\
                                            </div><div class='delete-msg'>删除记录</div>";
            if(listDiv.children.length==0) listDiv.appendChild(itemDiv);
            else listDiv.insertBefore(itemDiv,listDiv.children[0]);
        }
    };

    $("#_orderTech>div.message",true).ClassClear("new");
    $.pageSwitch(true,true);

    $("#content>div.list").Delegate('click','>div>div:nth-of-type(1),>div>div:nth-of-type(2)',function(e,item){
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
    $("#content>div.list").Delegate('click','.delete-msg', function (e, item, i) {
        e.preventDefault();
        var $parent = $(item.parentNode), chatId = $parent.Attr("chatid"), eb = $.$.easemob;
        $.getMsgList(chatId);
        if(eb.sessionList[chatId]){//从sessionList 里面删除
            delete eb.sessionList[chatId];
            $.localStorage($.$.userID+"_SessionList",JSON.stringify(eb.sessionList));//替换存储
        }
        if(eb.msgList[chatId]){//从messageList里面删除
            delete eb.msgList[chatId];
            $.localStorageClear($.$.userID+"_MsgList_"+chatId);
        }
        listDiv.removeChild($parent[0]);
        if($(listDiv).Children().length == 0){
            nullDataDiv.style.display="block";
            $editDiv[0].click();
        }
        var msgNum = msgTip.Text() - parseInt($parent[0].dataset['msgNum']),
            msgNumPublic = msgTipPublic.Text() - parseInt($parent[0].dataset['msgNum']);
        msgTip.Text(msgNum);
        if(msgNum == 0){
            msgTip.CSS({ visibility: 'hidden' });
        }

        msgTipPublic.Text(msgNumPublic);
        if(msgNumPublic == 0){
            msgTipPublic.CSS({ visibility: 'hidden' });
        }
    });

    /*
    function getListDiv(target){
        if(target.getAttribute("chatid")){
            return target;
        }
        if(target.parentNode.getAttribute("chatid")){
            return target.parentNode;
        }
        if(target.parentNode.parentNode.getAttribute("chatid")){
            return target.parentNode.parentNode;
        }
        return null;
    }

    //list div的长按、点击事件

    var startTapTime,startTapPoint = {},tapDelta = {};
    var confirmDelMsgDiv = $("#confirmDelMsg")[0];
    var currLongTapDiv;
    $(listDiv).Event("touchstart",function(e){
        e.preventDefault();
        var touch = e.touches[0];
        startTapTime = new Date();
        startTapPoint.x = touch.pageX;
        startTapPoint.y = touch.pageY;
    });
    $(listDiv).Event("touchmove",function(e){
        e.preventDefault();
        var touch = e.touches[0];
        tapDelta.x =touch.pageX- startTapPoint.pageX;
        tapDelta.y = touch.pageY-startTapPoint.pageY;
    });
    $(listDiv).Event("touchend",function(e){
        e.preventDefault();
        var touch = e.changedTouches[0],
            delteTime = (new Date()).getTime()-startTapTime.getTime(),
            item = getListDiv(e.target);
        if(touch.pageX == startTapPoint.x && touch.pageY==startTapPoint.y && item){
            if(delteTime<200){
                doClickItem(item);
            }
            else{
                currLongTapDiv = item;
                confirmDelMsgDiv.querySelector("div>div:nth-of-type(1)>span").innerHTML = item.children[1].children[0].innerHTML;
                confirmDelMsgDiv.className="act";
                $.hideOrderMenu();
            }
        }
    });

    $("#confirmDelMsg>div>div:nth-of-type(2)>a:nth-of-type(1)").Click(function(){//确定删除
        if(currLongTapDiv){
            var chatId = currLongTapDiv.getAttribute("chatid");
            $.getMsgList(chatId);
            if($.$.easemob.sessionList[chatId]){//从sessionList 里面删除
                delete $.$.easemob.sessionList[chatId];
                $.localStorage($.$.userID+"_SessionList",JSON.stringify($.$.easemob.sessionList));//替换存储
            }
            if($.$.easemob.msgList[chatId]){//从messageList里面删除
                delete $.$.easemob.msgList[chatId];
                $.localStorageClear($.$.userID+"_MsgList_"+chatId);
            }
            listDiv.removeChild(currLongTapDiv);
        }
        confirmDelMsgDiv.className = "";
        $.showOrderMenu();
    });

    $("#confirmDelMsg>div>div:nth-of-type(2)>a:nth-of-type(2)").Click(function(){//取消删除
        confirmDelMsgDiv.className = "";
        $.showOrderMenu();
    });*/
})();