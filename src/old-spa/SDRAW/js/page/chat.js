(function () {
    var techId = $.param("techId"), clubId = $.param("clubId") || $.$.clubID;
    if (!clubId) {
        $.tipShow("会所不存在！");
        return $.pageCancel();
    }
    while($.param("imgScan")) $.paramClear("imgScan");

    ////////////////////////////////////////////////////////////////////////
    var expressionObj = { //------表情编码的索引值
        "/::O": 1, "/::Y": 2, "/::B": 3, "/::A": 4, "/::C": 5, "/::D": 6, "/::X": 7, "/::Z": 8, "/::F": 9, "/::E": 10, "/::T": 11, "/::P": 12, "/::G": 13, "/::H": 14,
        "/::I": 15, "/::J": 16, "/::K": 17, "/::L": 18, "/::M":19, "/::N":20, "/::Q":21, "/::R":22, "/::S":23, "/::U": 24, "/::V": 25, "/::W": 26, "/::a": 27, "/::b": 28
    };
    var i,
        txtInput = $("#chatInput>div:nth-of-type(1)>div.input"),
        sendBtn = $("#chatInput>div:nth-of-type(1)>a"),
        talkDiv = $("#message-list-scroller>div.talk")[0],
        inputTip = $("#chatInput>div:nth-of-type(1)>span")[0],
        inputDiv = $("#chatInput")[0],
        expressionBtn = $("#chatInput>div:nth-of-type(2)>div.expression"),
        expressionList = $("#chatInput>div:nth-of-type(3) li"),
        giftDiv = $("#chatInput>div.gift-list"),
        giftList = $("#chatInput>div.gift-list>div.list>div"),
        giftAllItem = null,
        giftBtn = $("#chatInput>div:nth-of-type(2)>div.gift"),
        msgNode = document.createElement("div"),
        lastSelection = { node: null, offset: null },
        expUl = $('#chatInput>div:nth-of-type(3)'),
        expPageIndex = 1,
        expPageEl = $('#chatInput>div:nth-of-type(3)>div:nth-of-type(2)>span'),
        decodeExpressionReg,//发送消息表情编码时之用
        pageSize = 10,
        currHistoryMsgCursor = -1,
        messageListScroller = $("#message-list-scroller")[0],
        messageListWrap = $("#message-list-wrapper")[0],
        pullDownDiv = messageListScroller.querySelector("div:nth-of-type(1)"),
        pullDownOffset = Math.round(1.387 * $.$.scale * 16),
        scrollInProgress = false,
        listScroll,
        isTxtInputFocus=false,
        ordinaryCouponBtn = $("#chatInput>div:nth-of-type(2)>div.coupon"),
        diceSetting = $("#diceSetting"),
        notEnoughTip = $("#notEnoughTip"),
        diceScoreItems = $("#diceSetting>div>ul>li"),
        currIntegralText = $("#chatInput>div.gift-list>div.info>b"),
        currDiceScore = "1",
        gameStatusObj = {
            request : "等待接受...", accept : "已接受", reject : "已拒绝", overtime : "已超时", cancel : "已取消"
        },
        isManager = false,  //当前是与管理者聊天
        currIntegralAccount,///在技师的会所所有的积分值
        effectHtml = "",
        gameOverTime = 24*60*60*1000,
        giftListData = {},
        defaultGiftImg = "img/chat/gift_default.png";

    ///////////////////////////////////////////////////构造解析表情的正则
    decodeExpressionReg = new RegExp('/::[A-Zab]+', "g");
    var chatHeader = $.$.userHeader,
        chatName = ($.$.userName == $.$.defaultUserName) ? $.$.defaultUserName + "(" + $.$.userTel.substr(0, 3) + "****" + $.$.userTel.slice(-4) + ")" : $.$.userName;

    ////////////////////////////////////////获取当前聊天的技师信息
    var eb = $.$.easemob, currChatTech;

    if (!eb.conn.isOpened()) {//未登录
        if (eb.userId) {///存在环信账号
            var waitEasemobInit = setInterval(function(){//等待环信登录完成
                if(eb.conn.isOpened()){
                    clearInterval(waitEasemobInit);
                    startChat();
                }
            },20)
        }
        else {//跳转到login页面---未能获取您的账号信息
            $.$.loginUrl = "chat&techId=" + (techId || "") + ($.$.visitChannel == "9358" ? "&clubId=" + clubId : "");
            return $.page("login");
        }
    }
    else{///已登录状态
        startChat();
    }

    function startChat(){
        if(techId){////////////////////查询技师的信息
            $.ajax({
                url: ($.$.clubID ? '..' : '') + '/technician/' + techId,
                data : { needServiceInfo : 'N' },
                success: function (res){
                    if (res.id) {
                        eb.currChatTech = currChatTech = {
                            chatId : res["emchatId"],
                            name : res['info']['name'] || $.$.defaultTechName,
                            header : res['info']['avatarUrl'] || $.$.defaultHeader,
                            avatar : res["info"]["avatar"],
                            clubId : res['info']['clubId'],
                            clubName : res["clubName"],
                            techId : res["info"]["id"],
                            inviteCode : res["info"]["inviteCode"],
                            no : res["info"]["serialNo"] || "",
                            appointment : res["appointment"],
                            phoneAppointment : res["phoneAppointment"],
                            telephone : res["telephone"],
                            chatName : chatName,
                            chatHeader : chatHeader
                        };
                        if((res.isFavorite || 'n').toLowerCase()=="y"){//已收藏该技师
                            $("div#title>i:nth-of-type(1)").Class("collected");
                        }
                        initPage();
                    }
                    else {
                        $.tipShow(res.msg || "未能获取技师的信息！");
                        return $.pageCancel();
                    }
                },
                error: function () {
                    $.tipShow("未能获取技师的信息，技师可能已离开会所！");
                    return $.pageCancel();
                }
            });
        }
        else if(eb.currChatTech && eb.currChatTech.chatId){//////未有技师id,当做是管理者
            $("#tip").Hide();
            $("div#title>i:nth-of-type(1)").Hide();
            ordinaryCouponBtn.Hide();
            $("#chatInput>div:nth-of-type(2)>div.reward").Hide();
            currChatTech = eb.currChatTech;
            isManager = true;
            initPage();
        }
        else{
            $.page("message",-1,true);
        }
    }

    //////////////////////初始化页面
    function initPage() {
        //判定今天是否已和该技师聊过
        var isChatThisDay = $.localStorage($.$.userID+"_isChatThisDay_"+currChatTech.chatId);

        ///添加iscroll
        messageListWrap.addEventListener('touchmove',function(e){ e.preventDefault() }, false);

        listScroll = new IScroll('#message-list-wrapper', {
            probeType: 1,
            tap: true,
            click: false,
            preventDefaultException: { tagName: /.*/ },
            mouseWheel: true,
            scrollbars: true,
            fadeScrollbars: true,
            interactiveScrollbars: false,
            keyBindings: false,
            deceleration: 0.0002,
            startY: ( parseInt(pullDownOffset) * (-1) )
        });

        listScroll.on('scrollStart', function () {
            scrollInProgress = true;
        });

        listScroll.on('scroll', function () {
            scrollInProgress = true;
            if (this.y >= 5 && pullDownDiv.className != "flip") {
                pullDownDiv.className = "flip";
                pullDownDiv.querySelector('span').innerHTML = '松开之后刷新...';
            } else if (this.y <= 5 && pullDownDiv.className == "flip") {
                pullDownDiv.className = "";
                pullDownDiv.querySelector('span').innerHTML = '加载更多...';
            }
        });

        listScroll.on('scrollEnd', function () {
            setTimeout(function () { scrollInProgress = false }, 100);
            if (pullDownDiv.className == "flip") {
                pullDownDiv.className = 'loading';
                pullDownDiv.querySelector('span').innerHTML = '加载更多...';
                addHistoryMsgList();
            }
        });

        //设置标题-当前聊天的技师名
        $("#title>div:nth-of-type(1)").Html(currChatTech.name+(currChatTech.no ? "<span>["+currChatTech.no+"]</span>" : ""));

        //输入框获得焦点时
        var initDelay = 500,initH = $.$.winHeight;
        txtInput.Event("focus", function () {
            if (txtInput.Html().length == 0) {
                inputTip.style.display = "none";
            }
            setTimeout(function () { scrollerToBottom(false) }, 300);
            isTxtInputFocus = true;

            if($.$.ua.isiPhone){
                setTimeout(function () {
                    expressionBtn[0].scrollIntoView(true);
                    initDelay = 300;
                },initDelay);
            }else{
                setTimeout(function (){
                    if(initH - $.$.winHeight < 100){
                        txtInput[0].scrollIntoView(true);       //上处滚动值为id=_content的元素的margin-bottom值
                    }
                },500);
            }

            if(giftDiv.ClassHave("active")){
                doGiftBtnClick();
            }
        });

        inputTip.onclick = function () {
            inputTip.style.display = "none";
            txtInput[0].focus();
        };

        //输入框失去焦点时
        txtInput.Event("blur", function () {
            if (txtInput.Html().replace(/<br>/,'').length == 0) {
                txtInput[0].innerHTML = "";
                inputTip.style.display = "block";
                sendBtn[0].className = "disabled";
            }
            isTxtInputFocus=false;
            setTimeout(function () {
                $('#content')[0].scrollIntoView();
            },300);
        });

        //监听输入框的输入
        txtInput.Event("input", function () {
            if ((txtInput.Html().length == 0)) {
                if (sendBtn[0].className != "disabled") sendBtn[0].className = "disabled";
            }
            else{
                if (sendBtn[0].className == "disabled") sendBtn[0].className = "";
            }
            var sel = window.getSelection();
            lastSelection.node = sel.focusNode;
            lastSelection.offset = sel.focusOffset;
        });

        //点击输入框时定位光标
        txtInput.Event("click", function (e) {
            if (e.target.tagName.toLowerCase() == "img") {
                var currNode = e.target, pNode = currNode.parentNode, currIndex;
                for (var j = 0; j < pNode.childNodes.length; j++) {
                    if (currNode == pNode.childNodes[j]) {
                        currIndex = j + 1;
                        break;
                    }
                }
                if (document.createRange && window.getSelection && currIndex) {
                    setCursorPosition(pNode, currIndex);
                }
            }
            var sel = window.getSelection();
            lastSelection.node = sel.focusNode;
            lastSelection.offset = sel.focusOffset;

            if(giftDiv.ClassHave("active")){
                doGiftBtnClick();
                txtInput[0].focus();
            }
        });

        //点击发送按钮
        sendBtn.Event("click", function (e, item) {
            inputTip.style.display = "none";
            if (item.className != "disabled") {
                var currSelectedGift = giftList[0].querySelector("div.active");

                if(giftBtn.ClassHave("active") && currSelectedGift){//发送礼物
                    var amount = (currSelectedGift.getAttribute("gift-integral") || 0)-0;
                    //console.log("发送礼物："+amount);
                    if(amount>0){
                        $.ajax({////获取当前账号积分
                            url : "../api/v2/credit/user/account",
                            isReplaceUrl : true,
                            data : {
                                clubId : clubId,
                                userType : "user"
                            },
                            success : function(res){
                                if(res.statusCode == 200){
                                    res = res.respData;
                                    currIntegralAccount = (res && res[0] ? res[0].amount : 0);
                                    currIntegralText.Text(currIntegralAccount);
                                    if(parseInt(currIntegralAccount)<=0 || (amount && parseInt(amount)>parseInt(currIntegralAccount))){
                                        $("#notEnoughTip>div>div.tip").Text("发送礼物需要"+(amount || "")+"积分，当前您的积分不足。");
                                        notEnoughTip.Class("active");
                                        txtInput[0].innerHTML = "";
                                        sendBtn[0].className = "disabled";
                                        currSelectedGift.className = "gift-item";
                                    }
                                    else{
                                        doHandlerSendGift(currSelectedGift,amount);
                                    }
                                }
                            }
                        });
                    }
                    else{///不需要积分的礼物
                        doHandlerSendGift(currSelectedGift,amount);
                    }
                }
                else{//发送普通文字表情
                    var sendTxt = txtInput[0].innerHTML.replace(/<\/div>/g, '').replace(/<div>/g, '<br/>');

                ////将表情图片转为编码
                msgNode.innerHTML = sendTxt;
                var imgNodes = msgNode.getElementsByTagName("img"), textNode, imgNodesLen =imgNodes.length;
                for (var i = imgNodesLen - 1; i >= 0; i--) {
                    textNode = document.createTextNode(imgNodes[i].getAttribute("data-exp"));
                    msgNode.replaceChild(textNode, imgNodes[i]);
                }
                if(msgNode.innerHTML.length>1000){
                    return $.tipShow("您输入的太多了，无法发送！");
                }
                if(msgNode.innerHTML.length != imgNodesLen *4 ) txtInput[0].focus();
                //console.log("发送文本消息：" + msgNode.innerHTML);

                var divItem = document.createElement("div");
                divItem.className = "right";
                divItem.innerHTML += "<span>" + $.formatMsgTime(Date.now(), true) + "</span><div style='background-image: url(" + chatHeader + ")'></div><div>" + sendTxt + "</div>";
                talkDiv.appendChild(divItem);

                ////滚动条移动到最下面
                scrollerToBottom();
                ////清除input
                txtInput[0].innerHTML = "";
                //inputTip.style.display = "block";
                ////发送按钮失效
                sendBtn[0].className = "disabled";

                //保存-存储
                var msgObj = {
                    from: eb.userId,
                    to: currChatTech.chatId,
                    data: msgNode.innerHTML,
                    ext: { name: currChatTech.name, header: currChatTech.header, avatar: currChatTech.avatar, no: currChatTech.no, techId: currChatTech.techId, clubId: currChatTech.clubId }
                };
                var sendFailTimer = setTimeout(function(){
                    msgObj.status = "0";
                    $.updateSessionList(msgObj, "text", false);
                    $.addToMsgList(msgObj, "text");
                },5000);

                eb.conn.send({
                    to: currChatTech.chatId,
                    msg: msgNode.innerHTML,
                    type: "chat",
                    ext: { name: chatName, header: chatHeader, time: Date.now() , avatar : $.$.userAvatar },
                    success : function(){
                        divItem.querySelector("div:nth-of-type(2)").classList.add("success");
                        clearTimeout(sendFailTimer);
                        msgObj.status = "1";
                        $.updateSessionList(msgObj, "text", false);
                        $.addToMsgList(msgObj, "text");
                        $.sendFriend(currChatTech.chatId,'text',isManager?'manager':'tech');
                    }
                });

                    //////设置lastSelection
                    lastSelection.node = txtInput[0];
                    lastSelection.offset = 0;
                    if($.$.ua.isiPhone){
                        setTimeout(function(){ scrollerToBottom() },800)
                    }
                }
            }
        });

        //初始化滚动模块--表情滚动页
        $.scroll({
            content:expUl[0],
            contentX:expUl.Children()[0],
            //contentY:contentX$[0].children,
            indexX:expPageIndex - 1,
            endX:function(i){
                expPageIndex = i + 1;
                expPageEl.ClassClear('active');
                expPageEl.Index(expPageIndex - 1).Class('active');
            }
        });

        //点击表情按钮
        expressionBtn.Click(function () {
            if (expressionBtn.ClassHave("active")) {//隐藏表情区域
                inputDiv.className = "";
                messageListWrap.className = "";
                expressionBtn.ClassClear("active");
                expUl.Class('hide');
            }
            else {
                changeToolClosed("expression");
                expUl.ClassClear('hide');
                inputDiv.className = "popExpression";
                messageListWrap.className = "popExp";
                lastSelection.offset = txtInput[0].childNodes.length;
                lastSelection.node = txtInput[0];
                expressionBtn.Class("active");
            }
            scrollerToBottom();
        });

        //选择表情的时候
        expUl.Delegate('click','li', function (e, item) {
            if (lastSelection.node && isFocusInText(lastSelection.node)) {
                var expressionNode = item.children[0];//选择的表情节点
                var oldNode, newNode, currNode, nodeText, nextSibling, cursorIndex, splitNode;
                newNode = document.createElement("img");
                var imgData = window.getComputedStyle(expressionNode , null)['backgroundImage'];
                if(imgData.charAt(4)=='"' || imgData.charAt(4)=="'"){
                    imgData = imgData.slice(5,-2);
                }
                else{
                    imgData = imgData.slice(4,-1);
                }
                newNode.src = imgData;
                newNode.setAttribute("data-exp",expressionNode.getAttribute("data-exp"));
                if (lastSelection.node.nodeType == 3) {//在文本节点中插入表情
                    oldNode = lastSelection.node;
                    if (lastSelection.offset == 0) {//在文本节点之前插入img节点
                        oldNode.parentNode.insertBefore(newNode, oldNode);
                    }
                    else if (lastSelection.offset == oldNode.nodeValue.length) {//在文本节点之后插入img节点
                        if (oldNode.nextSibling) {//当前文本节点是否还有下一个兄弟节点
                            oldNode.parentNode.insertBefore(newNode, oldNode.nextSibling);
                        }
                        else {
                            oldNode.parentNode.appendChild(newNode);
                        }
                    }
                    else {//原文本节点被img节点截断成两个节点
                        nodeText = oldNode.nodeValue;
                        oldNode.nodeValue = nodeText.substr(0, lastSelection.offset);
                        nextSibling = oldNode.nextSibling;
                        if (nextSibling) {//当前文本节点是否还有下一个兄弟节点
                            oldNode.parentNode.insertBefore(newNode, nextSibling);
                            splitNode = document.createTextNode(nodeText.substr(lastSelection.offset));
                            oldNode.parentNode.insertBefore(splitNode, nextSibling);
                        }
                        else {//直接append到最后
                            oldNode.parentNode.appendChild(newNode);
                            splitNode = document.createTextNode(nodeText.substr(lastSelection.offset));
                            oldNode.parentNode.appendChild(splitNode);
                        }
                    }
                }
                else if (lastSelection.node.nodeType == 1) {//div节点
                    if (lastSelection.offset == lastSelection.node.childNodes.length) {
                        lastSelection.node.appendChild(newNode);
                    }
                    else {
                        currNode = lastSelection.node.childNodes[lastSelection.offset];
                        lastSelection.node.insertBefore(newNode, currNode);
                    }
                }

                if (txtInput[0].innerHTML != "") {
                    inputTip.style.display = "none";
                    sendBtn[0].className = "";
                }
                else{
                    inputTip.style.display = "block";
                    sendBtn[0].className = "disabled";
                }

                //将光标定位到当前newNode之后
                if (document.createRange) {
                    var parentNode = newNode.parentNode;
                    for (var j = 0; j < parentNode.childNodes.length; j++) {
                        if (parentNode.childNodes[j] == newNode) {
                            cursorIndex = j + 1;
                            break;
                        }
                    }
                    if (cursorIndex) {
                        if(isTxtInputFocus) setCursorPosition(parentNode, cursorIndex);
                        else{
                            lastSelection.offset = cursorIndex;
                            lastSelection.node = parentNode;
                        }
                    }
                }
            }
        });

        ////选中礼物的时候
        giftList.Delegate("click","div",function(e,item){
            var $item = $(item), giftName = item.getAttribute("gift-name");
            if(giftName){
                if(!$item.ClassHave("active")){
                    giftAllItem.ClassClear("active");
                    $item.Class("active");
                    inputTip.style.display = "none";
                    txtInput[0].innerHTML = "[礼物："+giftName+"]";
                    sendBtn[0].className = "";
                }
                else{
                    $item.ClassClear("active");
                    inputTip.style.display = "block";
                    txtInput[0].innerHTML = "";
                    sendBtn[0].className = "disabled";
                }
            }
        });

        giftBtn.Click(function(){
            doGiftBtnClick();
        });

        function doGiftBtnClick(){
            if(giftList[0].innerHTML == ""){
                $.tipShow("当前无积分礼物可发送！");
                return;
            }
            if(giftDiv.ClassHave("active")){
                inputDiv.className = "";
                messageListWrap.className = "";
                giftBtn.ClassClear("active");
                giftDiv.ClassClear("active");
            }
            else{
                changeToolClosed("gift");
                inputDiv.className = "popExpression";
                messageListWrap.className = "popExp";
                giftBtn.Class("active");
                giftDiv.Class("active");
            }
            scrollerToBottom();
        }

        //点击上传图片按钮的时候
        $("#chatInput input#uploadImg").Event("change", function (e, item) {
            changeToolClosed("pic");
            if (eb.conn) {
                var imgFile = item.files[0];
                if(imgFile.size>10*1024*1024){
                    return $.tipShow("抱歉！所选图片超过10M，太大无法发送！");
                }
                var dotIndex = imgFile.name.lastIndexOf(".");
                if(dotIndex<0) return;
                var type = imgFile.name.substring(dotIndex+1);
                if (!/^(jpg|jpeg|gif|png|bmp)$/i.test(type)) {
                    return $.tipShow("请选择图片进行发送！");
                }
                var fileObj = Easemob.im.Helper.getFileUrl("uploadImg");
                if (!fileObj.url || fileObj.url.length == 0) {
                    return ;
                }
                //在聊天界面上显示图片
                var divItem = document.createElement("div");
                divItem.className = "right";
                divItem.innerHTML = "<span>" + $.formatMsgTime(new Date(), true) + "</span><div style='background-image: url(" + chatHeader + ")'></div><div class='img'><img /></div>";
                var imgItem = divItem.children[2].children[0];
                imgItem.src = window.URL.createObjectURL(imgFile);
                imgItem.onload = function () {
                    window.URL.revokeObjectURL(this.src);
                    //console.log("发送图片的宽高：" + this.width + "--" + this.height);
                    imgItem.setAttribute("w",this.width);
                    imgItem.setAttribute("h",this.height);
                    var rawWidth = this.width, rawHeight = this.height;
                    var w = this.width / (16 * $.$.scale), h = this.height / (16 * $.$.scale), ratio;
                    if (!(w < 10 && h < 9)) {
                        w = this.width / 10 , h = this.height / 9, ratio = w > h ? w : h;
                        w = this.width / ratio;
                        h = this.height / ratio;
                    }
                    imgItem.style.width = w + "rem";
                    imgItem.style.height = h + "rem";
                    talkDiv.appendChild(divItem);
                    scrollerToBottom();

                    eb.conn.send({
                        file: fileObj,
                        to: currChatTech.chatId,
                        type: 'img',
                        width: rawWidth,
                        height: rawHeight,
                        file_length: imgFile.size,
                        onFileUploadComplete: function (data) {
                            $.tipShow("图片发送成功！");
                            $.sendFriend(currChatTech.chatId,'image',isManager?'manager':'tech');
                            //console.log("图片发送成功！" + JSON.stringify(data));
                            imgItem.onload = null;
                            imgItem.src= data.uri + "/" + data.entities[0].uuid;
                            divItem.querySelector("div:nth-of-type(2)").classList.add("success");
                            //保存-存储
                            var msgObj = {
                                from: eb.userId,
                                to: currChatTech.chatId,
                                url: data.uri + "/" + data.entities[0].uuid,
                                width: rawWidth,
                                height: rawHeight,
                                status:1,
                                ext: {  //技师的名称和头像
                                    name: currChatTech.name,
                                    header: currChatTech.header,
                                    avatar: currChatTech.avatar,
                                    no: currChatTech.no,
                                    techId: currChatTech.techId,
                                    clubId: currChatTech.clubId
                                }
                            };
                            $.updateSessionList(msgObj, "pic", false);
                            $.addToMsgList(msgObj, "pic");
                        },
                        onFileUploadError: function (error) {
                            $.tipShow("图片发送失败，请稍后重试！" + JSON.stringify(error));
                        },
                        ext: {
                            name: chatName, header: chatHeader, time: Date.now() , avatar : $.$.userAvatar
                        }
                    });
                }
            }
        });

        /////////取消/收藏技师
        var colledAniTimer = null,collectTip = $('#title>i:nth-of-type(1)>span');
        $("#title>i:nth-of-type(1)").Click(function(e,item){
            var isCollected = item.className=="collected";
            if(colledAniTimer){
                clearTimeout(colledAniTimer);
                collectTip.CSS('display','none');
                collectTip.ClassClear('active');
            }
            $.ajax({
                url : ($.$.clubID ? "../" : "")+"../profile/user/favorite/"+(isCollected ? 'delete' : 'create'),
                data : { id : currChatTech.techId },
                success:function(){
                    item.className=(isCollected ? "" : "collected");
                    if(isCollected){
                        collectTip.Text('已取消');
                    }else{
                        collectTip.Text('已收藏');
                    }
                    collectTip.CSS('display','block');
                    collectTip.Class('active');
                    colledAniTimer = setTimeout(function () {
                        collectTip.CSS('display','none');
                        collectTip.ClassClear('active');
                    },1100);
                }
            });
        });

        //点击技师图标
        if(techId){
            $("#title>i:nth-of-type(2)").Click(function(){
                //==== 防止在聊天与技师首页间多次点击后，地址栏地址无限增长，及返回操作无限在此两者间跳转 ====
                if(!!history.replaceState)
                    history.replaceState(null, document.title, location.search + location.hash.toString().replace(new RegExp('technicianDetail&id='+techId+'[^\/]*/'),''));
                $.page('technicianDetail&id='+techId);
            });
        }else{
            $("#title>i:nth-of-type(2)").CSS('display','none');
            $("#title>i:nth-of-type(3)").CSS('right','.667rem');
        }
        ////////////点击会所主页
        $("#title>i:nth-of-type(3)").Click(function(){
            if($.$.clubID) $.page("home",-1,true);
            else location.href=location.origin+location.pathname+"?club="+currChatTech.clubId;
        });

        //电话按钮及是否可预约
        var telDetail=$('#telDetail'),
            orderBtn = $("#tip"),
            telStr = "", telArr = currChatTech['telephone'].split(",");
        if((currChatTech['appointment']||'y').toLowerCase()=='y' || (currChatTech['phoneAppointment']||'y').toLowerCase()=='y') orderBtn.Class('active');
        if(currChatTech['telephone'] !=''){
            for(i= 0;i<telArr.length;i++){
                telStr+='<div>'+telArr[i]+'</div>';
            }
        }
        telDetail[0].querySelector("div").innerHTML = telStr+'<div>取消</div>';
        telDetail.Event('touchmove',function(e){ e.preventDefault() },false);
        telDetail.Click(function(e,item){
            if(e.target==item) telDetail.ClassClear();
        });
        var tel=$('#telDetail>div>div'),
            telCancel=tel.Remove(tel.length-1);
        tel.Click(function(e,item){
            location.href='tel:'+item.innerHTML;
        });
        telCancel.Click(function(){
            telDetail.ClassClear();
        });

        //点击"赏"按钮
        $("#chatInput>div:nth-of-type(2)>div.reward").Click(function () {
            changeToolClosed("reward");
            if ($.$.ua.isWX) {  /////===================================
                //if ($.$.sessionType == "9358") {
                    $.login("techReward&techId=" + techId+"&backPublic=true");
                /*}
                else {
                    $.getOauthCode("techReward&techId="+techId,'9358','tech_reward','', function (result) {
                        $.tipShow(result.msg || "请求authcode失败！");
                    });
                }*/
            }
            else {
				if($.checkAccessMenu('techReward')){
					$.tipShow('请打开微信登录"9358"公众号！');
				}
            }
        });

        //点击头部预约提示条
        orderBtn.Click(function () {
            if(orderBtn.ClassHave("active")){
                if((currChatTech['phoneAppointment'] || 'y').toLowerCase()=='y'){
                    if(currChatTech['telephone']=='') $.tipShow('暂无预约电话！');
                    else if(!telDetail.ClassHave("active")) telDetail.Class('active');
                    else telDetail.ClassClear('active');
                }else if((currChatTech['appointment'] || 'y').toLowerCase()=='y'){
                    $.login('confirmOrder&techId=' + techId + '&backChat=true' + ($.$.visitChannel == "9358" ? "&clubId=" + clubId : ""),false,true,true);
                }
            }
            else{
                $.tipShow("抱歉！当前技师不可预约！");
            }
        });

        //点击骰子
        $("#chatInput>div:nth-of-type(2)>div.dice").Click(function(){
            changeToolClosed("dice");
            doHandlerClickDiceBtn();
        });

        //游戏设置，选择分数
        diceScoreItems.Click(function(e,item){
            diceScoreItems.ClassClear("active");
            currDiceScore = item.innerHTML+"";
            item.className = "active";
        });

        ////游戏设置点击取消
        $("#diceSetting div.cancel").Click(function(){
            diceSetting.ClassClear("active");
        });

        /////游戏设置点击邀请
        $("#diceSetting div.invite").Click(function(){
            diceSetting.ClassClear("active");
            doHandlerStartDiceGame();
        });

        /////积分不足提示界面点击取消
        $("#notEnoughTip div.cancel").Click(function(){
            notEnoughTip.ClassClear("active");
        });

        /////积分不足提示界面点击如何获取积分
        $("#notEnoughTip div.get").Click(function(){
            $.page("integralExplain");
        });

        function changeDiceGameMsgStatus(gameId){
            var k, list = eb.msgList[currChatTech.chatId].list;
            for(k=list.length-1;k>=0;k--){
                if(list[k].msgType && list[k].msgType=="diceGame" && list[k].gameId== gameId && list[k].gameStatus=="request" ){
                    list[k].gameStatus = "handled";
                    $.localStorage($.$.userID + '_MsgList_' + currChatTech.chatId, JSON.stringify(eb.msgList[currChatTech.chatId])); //存储
                    break;
                }
            }
        }

        //将历史消息显示在界面上的函数
        $.addMsgDiv = function (msg, type, isOld,isNeedScroll,isImageLazyload) {
            var divItem = document.createElement("div"), preDivItem;
            type = (type || msg.type || "text");
            if(msg.ext && msg.ext.msgType) msg.msgType = msg.ext.msgType;

            if(msg.msgType=="paidCouponTip" || msg.msgType == "couponTip"){
                divItem.className="center "+msg.msgType;
                divItem.innerHTML='<div>'+$.formatMsgTime((msg.time || new Date()), true)+'</div><span><i></i>'+msg.data+'<a>点击查看</a></span>';
            }
            else if(msg.msgType == "diceGame"){//骰子游戏
                var gameStatus = msg.gameStatus || msg.ext.gameStatus,
                    gameInvite = msg.gameInvite || msg.ext.gameInvite,
                    gameId = msg.gameId || msg.ext.gameId;
                divItem.setAttribute("gameId",gameId);
                if(gameStatus == "handled"){
                    divItem = null;
                }
                else if(gameStatus != "over"){
                    if(gameInvite == eb.userId){//////本方发起的
                        preDivItem = document.querySelector("#"+gameId+"_invite");
                        if(preDivItem){////收到接受或者拒绝的消息
                            //console.log("需要remove child");
                            talkDiv.removeChild(preDivItem);
                            changeDiceGameMsgStatus(gameId);
                        }
                        if(gameStatus=="request"){
                            divItem.setAttribute("id",gameId+"_invite");
                            if(msg.time && Date.now()-msg.time>gameOverTime){
                                gameStatus = "overtime";
                            }
                        }
                        divItem.className = "right dice-invite";
                        divItem.innerHTML = "<span>" + $.formatMsgTime((msg.time || new Date()), true) + "</span>\
                                                      <div style='background-image: url(" + chatHeader + ")'></div>\
                                                      <div class='"+((msg.status || 1) == 1 ? "success" : "")+"'>\
                                                           <h4>邀请"+currChatTech.name+"玩骰子<span>"+msg.data+"积分</span></h4>\
                                                          <div>\
                                                             <div class='other'><div>"+currChatTech.name+"</div>"+("<div gameId="+gameId+" class='"+(gameStatus=="request" ? "wait" : "reject")+"'>"+gameStatusObj[gameStatus]+(gameStatus=="request" ? "<a class='cancel dice-game'>取消</a>" : "")+"</div>")+"</div>\
                                                             <div class='dice'></div>\
                                                             <div class='mine'><div>"+$.$.userName+"</div><div style='background-image: url("+chatHeader+")'></div></div>\
                                                          </div>\
                                                      </div>\
                                                     <div class='"+(gameStatus =="reject" || gameStatus =="cancel" || gameStatus =="overtime" ? "" : "hide")+"'><span>"+(gameStatus == "reject" ? "对方拒绝游戏" : (gameStatus == "cancel" ? "游戏已取消" : "游戏超时"))+"，返还"+msg.data+"积分</span></div>";
                    }
                    else{////由对方发起的
                        preDivItem = document.querySelector("#"+gameId+"_request");
                        if(preDivItem){
                            if(preDivItem.getAttribute("gameStatus")=="cancel"){
                                divItem = null;
                            }
                            else{
                                talkDiv.removeChild(preDivItem);
                            }
                            changeDiceGameMsgStatus(gameId);
                        }

                        if(divItem){
                            if(gameStatus=="request" && msg.time && Date.now()-msg.time>gameOverTime){//超时
                                gameStatus = "overtime";
                            }
                            divItem.id = gameId+"_request";
                            divItem.className = "left dice-request";
                            divItem.setAttribute("gameStatus",gameStatus);
                            divItem.innerHTML = "<span>" + $.formatMsgTime((msg.time || Date.now()), true) + "</span>\
                                                            <div style='background-image: url(" + currChatTech.header + ")'></div>\
                                                            <div>\
                                                                <div>\
                                                                    <div>"+currChatTech.name+"邀请您玩骰子"+(gameStatus !="request" ? "<span>("+gameStatusObj[gameStatus]+")</span>" : "")+"</div>\
                                                                    <div>比大小，每局胜方将获得负方"+msg.data+"积分</div>\
                                                                </div>\
                                                                <div gameId='"+gameId+"' class='"+(gameStatus != "request" ? "disabled" : "")+"'><div class='reject dice-game'>拒绝</div><div class='accept dice-game'>接受</div></div>\
                                                            </div>";
                        }
                    }
                }
                else{
                    //console.log("over game addMsgDiv："+JSON.stringify(msg));
                    var gameResult = msg.gameResult || msg.ext.gameResult,
                        isMineInvite = (gameInvite == eb.userId );
                    gameResult = gameResult.split(":");
                    var isVictory = (isMineInvite ? (gameResult[0] > gameResult[1]) : (gameResult[0] < gameResult[1])),
                        techPoint = (isMineInvite ? gameResult[1] : gameResult[0]),
                        userPoint = (isMineInvite ? gameResult[0] : gameResult[1]);

                    divItem.className = "right dice-result"+(msg.ext ? "" : " show");
                    divItem.innerHTML += "<span>" + $.formatMsgTime((msg.time || new Date()), true) + "</span>\
                                                                <div style='background-image: url(" + chatHeader + ")'></div>\
                                                                <div class='success'>\
                                                                    <div class='left'><div>"+currChatTech.name+"</div><div class='"+(isVictory ? "" : "act")+"'><img src='img/chat/dice/dice"+techPoint+(msg.ext ? ".gif" : ".png")+"'/></div></div>\
                                                                    <div class='right'><div class='"+(isVictory ? "victory" : "failure")+"'>"+chatName+"</div><div class='"+(isVictory ? "act" : "")+"'><img src='img/chat/dice/dice"+userPoint+(msg.ext ? ".gif" : ".png")+"'/></div><span>"+(isVictory ? "+" : "-")+msg.data+"</span></div>\
                                                                    <div class='split'><i>vs</i></div>\
                                                                </div>\
                                                                <div><span>"+(isVictory ? "获取" : "消费")+msg.data+"积分，<a amount='"+msg.data+"' class='dice-game-tip'>再玩一局</a></span></div>";
                    if(msg.ext){
                        setTimeout(function(){
                            if(isVictory) showEffect();
                            var diceImgs = divItem.querySelectorAll("img");
                            diceImgs[0].src = diceImgs[0].src.slice(0,-3)+"png";
                            diceImgs[1].src = diceImgs[1].src.slice(0,-3)+"png";
                            divItem.classList.add("show");
                        },2100);
                    }
                }
            }
            else if(msg.msgType == "gift"){
                //console.log("gift msg :"+JSON.stringify(msg)); gift_default
                var giftImg = giftListData[msg.giftId || msg.ext.giftId];
                giftImg = giftImg ? (giftImg.url || defaultGiftImg) : defaultGiftImg;
                divItem.className = "right gift";
                divItem.innerHTML += "<span>" + $.formatMsgTime(msg.time || new Date(), true) + "</span><div style='background-image: url(" + chatHeader + ")'></div><div "+((msg.status || 1) == 1 ? "class='success'" : "")+"><img gift='true' src='"+giftImg+"'/></div>";
            }
            else{
                divItem.className = (msg.from == eb.userId ? "right" : "left");
                var header = (msg.from == eb.userId ? chatHeader : currChatTech.header);
                if(msg.msgType=="paidCoupon"){
                    msg.actId = msg.actId || msg.ext.actId;
                    msg.techCode = msg.techCode || msg.ext.techCode;
                }
                var statusCls = (divItem.className == "right" && (msg.status || 1) == 1 ) ? "success" : "";
                if (type == "text") {//文本消息
                    divItem.innerHTML += "<span>" + $.formatMsgTime((msg.time || new Date()), true) + "</span><div style='background-image: url(" + header + ")'></div><div class='"+(msg.msgType || '' )+" "+statusCls+"' "+(msg.msgType=="paidCoupon" ? "actId='"+msg.actId+"' techCode='"+msg.techCode+"'" : msg.msgType=="ordinaryCoupon" && msg.userActId ? "userActId='"+msg.userActId+"'" : "")+">" + decodeTextMsg(msg.data) + "</div>";
                }
                else if (type == "pic") {//图片消息
                    var w = msg.width / (16 * $.$.scale), h = msg.height / (16 * $.$.scale), ratio;
                    if (!(w < 10 && h < 9)) {
                        w = msg.width / 10 , h = msg.height / 9, ratio = w > h ? w : h;
                        w = msg.width / ratio;
                        h = msg.height / ratio;
                    }
                    divItem.innerHTML += "<span>" + $.formatMsgTime((msg.time || new Date()), true) + "</span><div style='background-image: url(" + header + ")'></div><div class='img "+statusCls+"'><img "+(isImageLazyload==true ? "data-" : "")+"src='" + msg.url + "' style='width:" + w + "rem;height:" + h + "rem' w='"+msg.width+"' h='"+msg.height+"'/></div>";
                }
            }

            if(divItem){
                if (talkDiv.children.length == 0 || isOld != true) talkDiv.appendChild(divItem);
                else talkDiv.insertBefore(divItem, talkDiv.children[0]);//插入到最前面
            }
            if(isNeedScroll !=false) scrollerToBottom();
        };

        $.pageSwitch(true);

        ///获取积分系统开关状态
        $.ajax({
            url : "../api/v2/credit/switch/status",
            isReplaceUrl : true,
            data : { clubId : clubId },
            success : function(switchRes){
                switchRes = switchRes.respData;
                if(switchRes && switchRes.clubSwitch=="on"){
                    if(switchRes.diceGameSwitch=="on" && !isManager){
                        $("#chatInput>div:nth-of-type(2)>div.dice").Show();
                        gameOverTime = switchRes.gameTimeoutSeconds*1000;
                        //addRecentlyMsg(isChatThisDay);
                    }
                    giftBtn.Show();
                    ///////获取积分礼物
                    $.ajax({
                        url : "../api/v2/credit/gift/list",
                        isReplaceUrl : true,
                        success : function(giftRes){
                            giftRes = giftRes.respData;
                            if(giftRes){
                                var giftHtml = "",k;
                                for(k=0;k<giftRes.length;k++){
                                    giftListData[giftRes[k]["id"]] = { url : giftRes[k]["gifUrl"] };
                                    giftHtml += "<div class='gift-item' gift-id='"+giftRes[k]["id"]+"' gift-name='"+giftRes[k]["name"]+"' gift-integral = '"+giftRes[k]["ratio"]+"' gift-url='"+giftRes[k]["gifUrl"]+"'>\
                                                                <i></i>\
                                                                <img src='"+giftRes[k]["iconUrl"]+"'/>\
                                                                <div><span>"+giftRes[k]["ratio"]+"</span>积分</div>\
                                                            </div>";
                                }
                                giftList[0].innerHTML = giftHtml;
                                giftList.CSS("width",(5*giftRes.length)+"rem");
                                giftAllItem = $("#chatInput>div.gift-list>div.list>div>div.gift-item");
                            }
                            addRecentlyMsg(isChatThisDay);
                        }
                    });
                    updateUserAccount();
                }
                else{
                    addRecentlyMsg(isChatThisDay);
                }
            }
        });

        ///点击聊天消息列表中的消息
        $(talkDiv).Event("click",function(e){
            var node = e.target, pNode=node.parentNode, ppNode=pNode.parentNode;
            if(/(paidCoupon|begReward|ordinaryCoupon|dice-game|dice-game-tip)/.test(pNode.className)) node=pNode;
            if(node.tagName.toLowerCase()=="img" && !/dice/.test(node.src) && !node.getAttribute("gift")){
                if(!node.getAttribute("data-exp")){
                    $.param("imgScan","true");
                    $.$.lastScanImgParent = pNode;
                    $.$.scanimg.showImg(node);
                }
            }
            else if(/paidCoupon/.test(node.className)){
                if(!$.$.userTel){
                    $.$.loginUrl = location.hash.substring(1).replace(/^\//, '').replace(/\/$/, '');
                    $.bindPhone(true);
                    //$.page($.$.loginUrl.replace(/\/[^\/]*$/, '/bindPhone'), 1, true, true);
                }
                else $.page("paidCoupon&actId="+node.getAttribute("actId")+"&techCode="+node.getAttribute("techCode")+"&chanel=link");
            }
            else if(/begReward/.test(node.className)){
                $("#chatInput>div:nth-of-type(2)>div.reward")[0].click();
            }
            else if(/ordinaryCoupon/.test(node.className)){
                if(node.getAttribute("userActId")) $.page("couponDetail&userActId="+node.getAttribute("userActId"));
                else $.page("coupon");
            }
            else if(/dice-game-tip/.test(node.className)){///再玩一局
                doHandlerClickDiceBtn(node.getAttribute("amount"));
                return true;
            }

            if(/center/.test(pNode.className)) node=pNode;
            else if(/center/.test(ppNode.className)) node=ppNode;

            if(/center/.test(node.className)){
                $.page("coupon");//跳转到优惠券列表页
            }

            pNode =node.parentNode;
            if(/dice-game/.test(node.className) && pNode.className !="disabled"){////处理接受/拒绝/取消骰子积分游戏
                var k, list = eb.msgList[currChatTech.chatId].list, itemObj;
                for(k=list.length-1;k>=0;k--){
                    if(list[k].msgType && list[k].msgType=="diceGame" && list[k].gameId==pNode.getAttribute("gameId")){
                        itemObj = list[k];
                        break;
                    }
                }
                if(itemObj){
                    var ope = node.className.split(" ")[0];
                    if(ope == "cancel"){//取消游戏
                        //console.log("ope cancel: itemObj"+JSON.stringify(itemObj)+"---gameId："+pNode.getAttribute("gameId"));
                        doHandlerDiceGame(ope,itemObj,pNode);
                    }
                    else{
                        pNode.className = "disabled";
                        if(ope == "accept"){
                            ///////////////////查询账户积分
                            $.ajax({
                                url : "../api/v2/credit/user/account",
                                isReplaceUrl : true,
                                data : {
                                    clubId : clubId,
                                    userType : "user"
                                },
                                success : function(res){
                                    if(res.statusCode == 200) {
                                        res = res.respData;
                                        currIntegralAccount = (res && res[0] ? res[0].amount : 0);
                                        currIntegralText.Text(currIntegralAccount);
                                        if(parseInt(itemObj.data)>parseInt(currIntegralAccount)){///当前账户积分不够
                                            $("#notEnoughTip>div>div.tip").Text("玩骰子需要"+itemObj.data+"积分，当前您的积分不足。");
                                            notEnoughTip.Class("active");
                                            pNode.className = "";
                                        }
                                        else{
                                            doHandlerDiceGame(ope,itemObj,pNode.parentNode.children[0].children[0]);
                                        }
                                    }
                                    else{
                                        $.tipShow("请求异常！");
                                    }
                                }
                            });
                        }
                        else{
                            doHandlerDiceGame(ope,itemObj,pNode.parentNode.children[0].children[0]);
                        }
                    }
                }
            }
        });

        //////获取技师的优惠券列表
        if(currChatTech.techId){
            $.ajax({
                url: '../api/v1/profile/redpack/list',
				isReplaceUrl:true,
                data: { clubId : currChatTech.clubId },
                success: function (couponData) {
                    if(couponData.statusCode==200){
                        var couponData= couponData.respData.coupons || [];
                        var k, htmlStr="";

                        //////////////////////构造技师的分享有礼券
                        for(k=0;k<couponData.length;k++){
                            if(couponData[k]["couponType"]=="paid"){
                                if(k==couponData.length-1){
                                    htmlStr+="<li type='paid' actId='"+couponData[k]["actId"]+"'>"+(couponData[k]["actTitle"].length>7 ? couponData[k]["actTitle"].substr(0,7)+"..." : couponData[k]["actTitle"])+"<i></i><i></i></li>";
                                }
                                else{
                                    htmlStr+="<li type='paid' actId='"+couponData[k]["actId"]+"'>"+couponData[k]["actTitle"]+"</li>";
                                }
                            }
                            else{
                                if(k==couponData.length-1){
                                    htmlStr+="<li type='"+couponData[k]["couponType"]+"' actId='"+couponData[k]["actId"]+"' techCode='"+currChatTech.inviteCode+"' actTitle='"+couponData[k]["actTitle"]+"'>"+(couponData[k]["actTitle"].length>7 ? couponData[k]["actTitle"].substr(0,7)+"..." : couponData[k]["actTitle"])+"<i></i><i></i></li>";
                                }
                                else{
                                    htmlStr+="<li type='"+couponData[k]["couponType"]+"' actId='"+couponData[k]["actId"]+"' techCode='"+currChatTech.inviteCode+"' actTitle='"+couponData[k]["actTitle"]+"'>"+couponData[k]["actTitle"]+"</li>";
                                }
                            }
                        }
                        ordinaryCouponBtn[0].querySelector("ul").innerHTML=htmlStr;

                        /////////////////////////////处理点击优惠券图标
                        if(couponData.length>0){
                            ////点击优惠券图标
                            ordinaryCouponBtn.Click(function(){
                                changeToolClosed("coupon");
                                ordinaryCouponBtn.ClassHave("active") ? ordinaryCouponBtn.ClassClear("active") : ordinaryCouponBtn.Class("active");
                            });
                            ////领取技师的优惠券
                            $("#chatInput>div:nth-of-type(2)>div.coupon>ul>li").Click(function(e,item) {
                                var couponType = item.getAttribute("type");
                                if(couponType == "paid"){
                                    $.login("paidCoupon&actId="+item.getAttribute("actId")+"&techCode="+currChatTech.inviteCode,false,true,true);
                                }
                                else{
                                    if(!$.$.userTel){
                                        $.$.loginUrl = location.hash.substring(1).replace(/^\//, '').replace(/\/$/, '');
                                        $.bindPhone(true);
                                        //$.page($.$.loginUrl.replace(/\/[^\/]*$/, '/bindPhone'), 1, true, true);
                                        return false;
                                    }
                                    $.ajax({////////领取
                                        url: ($.$.clubID ? "../" : "")+"get/redpacket",
                                        data: {
                                            actId: item.getAttribute("actId"),
                                            phoneNum: $.$.userTel,
                                            openId: $.$.openId,
                                            userCode : "",
                                            techCode : item.getAttribute("techCode"),
                                            chanel : "link"
                                        },
                                        success: function (res) {
                                            //console.log("领取优惠券的返回："+JSON.stringify(res));
                                            if(res.statusCode==200){
                                                $.tipShow("成功领取一张优惠券！");
                                                var getCouponMsgObj = {
                                                    from: eb.userId,
                                                    to: currChatTech.chatId,
                                                    data: "您领取了"+currChatTech.name+'的"'+item.getAttribute("actTitle")+'"',
                                                    ext: { name: currChatTech.name, header: currChatTech.header, avatar: currChatTech.avatar, no: currChatTech.no, techId: currChatTech.techId, clubId: currChatTech.clubId, msgType: "couponTip" },
                                                    status : 1
                                                };

                                                eb.conn.send({
                                                    to: currChatTech.chatId,
                                                    msg: item.getAttribute("actTitle"),
                                                    type: "chat",
                                                    ext: { name: chatName, header: chatHeader, msgType: "couponTip", time: Date.now() , avatar : $.$.userAvatar },
                                                    success: function(){
                                                        $.sendFriend(currChatTech.chatId,'coupon',isManager?'manager':'tech');
                                                        $.addMsgDiv(getCouponMsgObj,"couponTip",false,true,false);
                                                        $.updateSessionList(getCouponMsgObj, "text", false);
                                                        $.addToMsgList(getCouponMsgObj, "text");
                                                    }
                                                });
                                            }
                                            else{
                                                $.tipShow(res.msg || "未能成功领取优惠券！");
                                            }
                                        }});
                                }
                            });
                        }
                        else{
                            ordinaryCouponBtn.Click(function(){
                                changeToolClosed("coupon");
                                $.tipShow("抱歉！暂无优惠券！");
                            });
                        }
                    }
                }
            });
        }
    }

    function updateUserAccount(){
        //////查询当前账户积分
        $.ajax({
            url : "../api/v2/credit/user/account",
            isReplaceUrl : true,
            data : {
                clubId : clubId,
                userType : "user"
            },
            success : function(res){
                if(res.statusCode == 200) {
                    res = res.respData;
                    currIntegralAccount = (res && res[0] ? res[0].amount : 0);
                    currIntegralText.Text(currIntegralAccount);
                }
            }
        });
    }

    function addRecentlyMsg(isChatThisDay){
        //添加消息列表中的最近几条消息
        var sessionList = $.getSessionList(false), messageList = $.getMsgList(currChatTech.chatId);
        if (sessionList[currChatTech.chatId] && messageList.name) {//如果历史消息数据大于10条，则显示10条，目的是显示iscroll滚动条
            var newCount = sessionList[currChatTech.chatId].new, len = messageList.list.length;
            if (newCount <10){
                newCount=(len>=10 ? 10 : len);
            }
            for (i = messageList.list.length - 1; i >= len - newCount; i--) {
                $.addMsgDiv(messageList.list[i], null,true,false,true);//将消息添加到显示界面上
            }
            currHistoryMsgCursor = i;
            $.showMsgNum(-sessionList[currChatTech.chatId].new);
            sessionList[currChatTech.chatId].new = 0;//更新会话列表
            $.localStorage($.$.userID + "_SessionList", JSON.stringify(sessionList));//存储
            setTimeout(function(){
                scrollerToBottom(true,800);
            },200);

            /////lazyload img
            var imgs = talkDiv.querySelectorAll("div>div.img>img");
            for(i=0;i<imgs.length;i++){
                if(imgs[i].getAttribute("data-src")){
                    imgs[i].src = imgs[i].getAttribute("data-src");
                }
            }
        }

        if(isChatThisDay !==true || !messageList.list || messageList.list.length==0){//////显示欢迎语
            $.addMsgDiv({
                from : currChatTech.chatId, to : eb.userId, type : "text", data : currChatTech.clubName+"欢迎您！", time : Date.now()
            },"text",true,true);
        }
    }

    function doHandlerStartDiceGame(amount){
        var diceScore = (amount || currDiceScore)+"";
        if(parseInt(diceScore)>parseInt(currIntegralAccount)){//所选积分大于当前账户积分
            $("#notEnoughTip>div>div.tip").Text("玩骰子需要"+diceScore+"积分，当前您的积分不足。");
            notEnoughTip.Class("active");
        }
        else{
            $.ajax({
                url : "../api/v2/credit/game/dice/submit",
                isReplaceUrl : true,
                data : {
                    clubId : clubId,
                    amount : diceScore,
                    emchatId : currChatTech.chatId
                },
                success : function(res){
                    if(res.statusCode==200){
                        var gameId = res.respData.gameId,
                            divItem = document.createElement("div"),
                            nowTime = Date.now();

                        divItem.className = "right dice-invite";
                        divItem.setAttribute("gameId","dice_"+gameId);
                        divItem.setAttribute("id","dice_"+gameId+"_invite");
                        divItem.innerHTML += "<span>" + $.formatMsgTime(nowTime, true) + "</span>\
                                                                <div style='background-image: url(" + chatHeader + ")'></div>\
                                                                <div>\
                                                                    <h4>邀请" + currChatTech.name + "玩骰子<span>" + diceScore + "积分</span></h4>\
                                                                    <div>\
                                                                        <div class='other'><div>" + currChatTech.name + "</div><div class='wait' gameId='dice_"+gameId+"'>等待接受...<a class='cancel dice-game'>取消</a></div></div>\
                                                                        <div class='dice'></div>\
                                                                        <div class='mine'><div>" + $.$.userName + "</div><div style='background-image: url(" + chatHeader + ")'></div></div>\
                                                                    </div>\
                                                                </div>\
                                                                <div class='hide'><span>对方拒绝游戏，返还" + diceScore + "积分</span></div>";
                        talkDiv.appendChild(divItem);
                        scrollerToBottom();//滚动条移动到最下面

                        //保存-存储
                        var msgObj = {
                            from: eb.userId,
                            to: currChatTech.chatId,
                            data: diceScore,///积分数
                            ext: {
                                name: currChatTech.name,
                                header: currChatTech.header,
                                avatar: currChatTech.avatar,
                                no: currChatTech.no,
                                techId: currChatTech.techId,
                                clubId: currChatTech.clubId,
                                msgType : "diceGame",
                                gameInvite : eb.userId,//游戏发起方
                                gameStatus : "request",//游戏状态：request--请求中  reject--已拒绝 accepted--已接受  over--已结束
                                gameId : "dice_"+gameId, //本地记录的游戏id
                                gameResult : "0:0"//游戏结果 发出邀请者：接受邀请者
                            }
                        };
                        var sendFailTimer = setTimeout(function(){
                            msgObj.status = "0";
                            $.updateSessionList(msgObj, "diceGame", false);
                            $.addToMsgList(msgObj, "diceGame");
                        },5000);

                        eb.conn.send({
                            to: currChatTech.chatId,
                            msg: diceScore,
                            type: "chat",
                            ext: {
                                name: chatName,
                                header: chatHeader,
                                time: nowTime,
                                avatar : $.$.userAvatar,
                                msgType : "diceGame",
                                gameStatus : "request",
                                gameInvite : eb.userId,
                                gameId : "dice_"+gameId,
                                gameResult : "0:0"
                            },
                            success : function(){
                                divItem.querySelector("div:nth-of-type(2)").classList.add("success");
                                clearTimeout(sendFailTimer);
                                msgObj.status = "1";
                                $.updateSessionList(msgObj, "text", false);
                                $.addToMsgList(msgObj, "text");
                                $.sendFriend(currChatTech.chatId,'game',isManager?'manager':'tech');
                            }
                        });
                    }
                    else{
                        $.tipShow(res.msg || "游戏创建失败！");
                    }
                }
            });
        }
    }

    ////点击骰子之后的处理
    function doHandlerClickDiceBtn(amount){
        $.ajax({////获取当前账号积分
            url : "../api/v2/credit/user/account",
            isReplaceUrl : true,
            data : {
                clubId : clubId,
                userType : "user"
            },
            success : function(res){
                if(res.statusCode == 200){
                    currIntegralAccount = (res.respData && res.respData[0] ? res.respData[0].amount : 0);
                    currIntegralText.Text(currIntegralAccount);
                    if(parseInt(currIntegralAccount)<=0 || (amount && parseInt(amount)>parseInt(currIntegralAccount))){
                        $("#notEnoughTip>div>div.tip").Text("玩骰子需要"+(amount || "")+"积分，当前您的积分不足。");
                        notEnoughTip.Class("active");
                    }
                    else if(amount){
                        doHandlerStartDiceGame(amount);
                    }
                    else{
                        diceSetting.Class("active");
                    }
                }
            }
        });
    }

    ///处理点击拒绝接受游戏邀请
    function doHandlerDiceGame(ope,itemObj,txtNode){
        //console.log("doHandlerDiceGame msgObj："+JSON.stringify(itemObj));
        var preOpe = ope;
        if((+new Date())-itemObj.time>gameOverTime){//24*60*60*1000
            ope = "overtime";
            doHandlerSendGameStatus(ope,itemObj);
        }
        else{
            $.ajax({
                url : "../api/v2/credit/game/dice/accept",
                isReplaceUrl : true,
                data : {
                    gameId : itemObj.gameId.split("_")[1],
                    status : ope
                },
                success : function(res){
                    if(res.statusCode == 200){
                        res = res.respData;
                        doHandlerSendGameStatus(ope,itemObj,res);
                    }
                    else{
                        $.tipShow(res.msg || "处理游戏操作异常！");
                        if(ope == "accept"){
                            ope = "overtime";
                            txtNode.querySelector("span").innerHTML = "("+gameStatusObj[ope]+")";
                            doHandlerSendGameStatus(ope,itemObj);
                        }
                    }
                }
            });
        }
        if(ope == "cancel" || preOpe=="cancel"){
            txtNode.className = "cancel";
            txtNode.innerHTML = gameStatusObj[ope];
            var pNode = document.querySelector("#"+itemObj.gameId+"_invite");
            if(pNode){
                pNode = pNode.querySelector("div.hide");
                pNode.className = "";
                pNode.innerHTML = "<span>游戏已取消，"+pNode.innerHTML.split("，")[1];
            }
        }
        else{
            txtNode.innerHTML += "<span>("+gameStatusObj[ope]+")</span>";
        }
    }

    function doHandlerSendGameStatus(ope,itemObj,res){
        ////////////////////////////////发送接受/拒绝/取消/消息
        if(ope=="overtime"){
            itemObj.gameStatus = ope;
            $.localStorage($.$.userID + '_MsgList_' + currChatTech.chatId, JSON.stringify(eb.msgList[currChatTech.chatId])); //存储
        }
        else{
            eb.conn.send({
                to: currChatTech.chatId,
                msg: itemObj.data,
                type: "chat",
                ext: {
                    name: chatName,
                    header: chatHeader,
                    time: Date.now(),
                    avatar : $.$.userAvatar,
                    msgType : "diceGame",
                    gameInvite : itemObj.gameInvite,
                    gameStatus : ope,
                    gameId : itemObj.gameId,
                    gameResult : "0:0"
                },
                success : function(){
                    itemObj.gameStatus = ope;
                    $.localStorage($.$.userID + '_MsgList_' + currChatTech.chatId, JSON.stringify(eb.msgList[currChatTech.chatId])); //存储
                    $.sendFriend(currChatTech.chatId);
                }
            });
        }

        ////////////////////////////////////接受了对方的邀请，显示游戏结果
        if(res && res.status == "accept"){
            //console.log("接受了对方的邀请，显示游戏结果");
            var gameId = itemObj.gameId.split("_")[1],
                divItem = document.createElement("div"),
                nowTime = Date.now(),
                isVictory = (res.dstPoint > res.srcPoint);///我方的点数大于邀请方的点数
            divItem.className = "right dice-result";
            divItem.innerHTML += "<span>" + $.formatMsgTime(nowTime, true) + "</span>\
                                                                <div style='background-image: url(" + chatHeader + ")'></div>\
                                                                <div class='success'>\
                                                                    <div class='left'><div>"+currChatTech.name+"</div><div class='"+(isVictory ? "" : "act")+"'><img src='img/chat/dice/dice"+res.srcPoint+".gif'/></div></div>\
                                                                    <div class='right'><div class='"+(isVictory ? "victory" : "failure")+"'>"+chatName+"</div><div class='"+(isVictory ? "act" : "")+"'><img src='img/chat/dice/dice"+res.dstPoint+".gif'/></div><span>"+(isVictory ? "+" : "-")+res.belongingsAmount+"</span></div>\
                                                                    <div class='split'><i>vs</i></div>\
                                                                </div>\
                                                                <div><span>"+(isVictory ? "获取" : "消费")+res.belongingsAmount+"积分，<a amount='"+res.belongingsAmount+"' class='dice-game-tip'>再玩一局</a></span></div>";
            talkDiv.appendChild(divItem);
            scrollerToBottom();//滚动条移动到最下面
            setTimeout(function(){
                if(isVictory) showEffect();
                var diceImgs = divItem.querySelectorAll("img");
                diceImgs[0].src = diceImgs[0].src.slice(0,-3)+"png";
                diceImgs[1].src = diceImgs[1].src.slice(0,-3)+"png";
                divItem.classList.add("show");
            },2100);

            //保存-存储
            var msgObj = {
                from: eb.userId,
                to: currChatTech.chatId,
                data: res.belongingsAmount+"",///积分数
                ext: {
                    name: currChatTech.name,
                    header: currChatTech.header,
                    avatar: currChatTech.avatar,
                    no: currChatTech.no,
                    techId: currChatTech.techId,
                    clubId: currChatTech.clubId,
                    msgType : "diceGame",
                    gameInvite : currChatTech.chatId,//游戏发起方
                    gameStatus : "over",//游戏状态 over--已结束
                    gameId : "dice_"+gameId, //本地记录的游戏id
                    gameResult : res.srcPoint+":"+res.dstPoint//游戏结果 发出邀请者：接受邀请者
                }
            };
            //////////////////////////////发送结果到邀请方
            eb.conn.send({
                to: currChatTech.chatId,
                msg: res.belongingsAmount+"",
                type: "chat",
                ext: {
                    name: chatName,
                    header: chatHeader,
                    time: nowTime,
                    avatar : $.$.userAvatar,
                    msgType : "diceGame",
                    gameStatus : "over",
                    gameInvite : currChatTech.chatId,
                    gameId : "dice_"+gameId,
                    gameResult : res.srcPoint+":"+res.dstPoint
                },
                success : function(){
                    msgObj.status = "1";
                    $.updateSessionList(msgObj, "text", false);
                    $.addToMsgList(msgObj, "text");
                    $.sendFriend(currChatTech.chatId);
                }
            });
        }
    }

    /////处理发送积分礼物
    function doHandlerSendGift(currSelectedGift,amount){
        var divItem = document.createElement("div"),
            giftName = currSelectedGift.getAttribute("gift-name"),
            giftId = currSelectedGift.getAttribute("gift-id"),
            imgUrl = currSelectedGift.getAttribute("gift-url");
        divItem.className = "right gift";
        divItem.innerHTML += "<span>" + $.formatMsgTime(Date.now(), true) + "</span><div style='background-image: url(" + chatHeader + ")'></div><div><img gift='true' src='"+imgUrl+"'/></div>";
        talkDiv.appendChild(divItem);

        ////清除input
        txtInput[0].innerHTML = "";
        ////发送按钮失效
        sendBtn[0].className = "disabled";
        currSelectedGift.className = "gift-item";

        //保存-存储
        var msgObj = {
            from: eb.userId,
            to: currChatTech.chatId,
            data: "[礼物："+giftName+"]",
            ext: {
                name: currChatTech.name,
                header: currChatTech.header,
                avatar: currChatTech.avatar,
                no: currChatTech.no,
                techId: currChatTech.techId,
                clubId: currChatTech.clubId,
                msgType : "gift",
                giftValue : amount,
                giftName : giftName,
                giftId : giftId
            }
        };

        var sendFailTimer = setTimeout(function(){
            msgObj.status = "0";
            $.updateSessionList(msgObj, "text", false);
            $.addToMsgList(msgObj, "text");
        },5000);
        eb.conn.send({
            to: currChatTech.chatId,
            msg: "[礼物："+giftName+"]",
            type: "chat",
            ext: {
                name: chatName,
                header: chatHeader,
                time: Date.now(),
                avatar : $.$.userAvatar,
                msgType : "gift",
                giftValue : amount+"",
                giftName : giftName,
                giftId : giftId
            },
            success : function(){
                divItem.querySelector("div:nth-of-type(2)").classList.add("success");
                clearTimeout(sendFailTimer);
                msgObj.status = "1";
                $.updateSessionList(msgObj, "text", false);
                $.addToMsgList(msgObj, "text");
                $.ajax({
                    url : "../api/v2/credit/gift/send",
                    isReplaceUrl : true,
                    data : {
                        clubId : clubId,
                        emchatId : currChatTech.chatId,
                        giftId : giftId,
                        num : 1
                    },
                    success : function(res){
                        if(res.statusCode == 200){
                            updateUserAccount();//更新当前积分值
                        }
                        else{
                            $.tipShow(res.msg || "礼物发送失败！");
                        }
                    }
                });
                $.sendFriend(currChatTech.chatId,'text',isManager ? 'manager' : 'tech');
            }
        });

        //////设置lastSelection
        lastSelection.node = txtInput[0];
        lastSelection.offset = 0;

        ////滚动条移动到最下面
        scrollerToBottom();
    }

    //点击技师头像跳转到技师首页
    $('#message-list-wrapper').Delegate('click','.talk>.left>div:nth-of-type(1)', function () {
        if(isManager) return;
        //==== 防止在聊天与技师首页间多次点击后，地址栏地址无限增长，及返回操作无限在此两者间跳转 ====
        if(!!history.replaceState)
            history.replaceState(null, document.title, location.search + location.hash.toString().replace(new RegExp('technicianDetail&id='+techId+'[^\/]*/'),''));
        $.page('technicianDetail&id='+techId);
    });

    /////////////关闭按钮的状态
    function changeToolClosed(toolName){
        if(toolName != "expression"){//表情
            inputDiv.className = "";
            messageListWrap.className = "";
            expressionBtn.ClassClear("active");
            expUl.Class('hide');
        }
        if(toolName != "coupon"){//优惠券
            ordinaryCouponBtn.ClassClear("active")
        }
        if(toolName != "gift"){
            inputDiv.className = "";
            messageListWrap.className = "";
            giftBtn.ClassClear("active");
            giftDiv.ClassClear('active');
            $("#chatInput>div.gift-list>div.list>div>div.gift-item").ClassClear("active");
            inputTip.style.display = "block";
            txtInput[0].innerHTML = "";
            sendBtn[0].className = "disabled";
        }
    }

    ////滚动到底部
    function scrollerToBottom(refresh,time) {
        if (listScroll) {
            if (refresh != false) listScroll.refresh();
            if (messageListScroller.offsetHeight > messageListWrap.offsetHeight) {
                setTimeout(function () {
                    if (parseInt(messageListScroller.style.top) != listScroll.maxScrollY) {
                        listScroll.scrollTo(0, listScroll.maxScrollY, (time || 300), false);
                    }
                }, (refresh != false ? 300 : 1));
            }
        }
    }

    //////addHistoryMsgList
    function addHistoryMsgList() {
        if (currHistoryMsgCursor >= 0) {
            var j = currHistoryMsgCursor;
            for (; j >= 0 && j >= currHistoryMsgCursor - pageSize; j--) {
                $.addMsgDiv(eb.msgList[currChatTech.chatId].list[j], null, true,false);//将消息添加到显示界面上
            }
            currHistoryMsgCursor = j;
        }
        listScroll.refresh();
    }

    /////递归检查当前节点是否在div.input节点下(上溯4层)
    function isFocusInText(node, layer) {
        if (!node || layer > 4) return false;
        if (node == txtInput[0]) return true;
        else {
            node = node.parentNode;
            return isFocusInText(node, layer + 1);
        }
    }

    /////解析文本消息，里面可能有表情图片
    function decodeTextMsg(msg) {
        return msg.replace(decodeExpressionReg, function () {
            var k = expressionObj[arguments[0]];
            if(k){
                var str = window.getComputedStyle(expressionList[k-1].children[0],null)['backgroundImage'];
                str = (str.charAt(4)=='"' || str.charAt(4)=="'") ? str.slice(5,-2) : str.slice(4,-1);
                return "<img src='"+str+"' data-exp='" + arguments[0] + "'/>";
            }
            return arguments[0];
        });
    }

    /////设定光标的位置
    function setCursorPosition(pNode, cursorIndex) {
        var range = document.createRange(),
            selection = window.getSelection();
        range.selectNodeContents(pNode);
        range.collapse(true);
        range.setEnd(pNode, cursorIndex);
        range.setStart(pNode, cursorIndex);
        selection.removeAllRanges();
        selection.addRange(range);
        lastSelection.offset = cursorIndex;
        lastSelection.node = pNode;
    }

    function makeEffect(type,count,time){
        count=count || 3;
        if(count<3) count=3;
        time = time || 3000;
        if(time<=0) time=3000;
        time*=2;
        var d;
        for(var i=1,l=parseInt(Math.random(+new Date())*(count-3))+3;i<l;i++){
            d = parseInt(Math.random(+new Date())*time+4000)+'ms';
            effectHtml +='<div class="'+type+'" style="left:'+parseInt(Math.random(+new Date())*18)+'rem;transition-duration: '+d+';-webkit-transition-duration: '+d+';-moz-transition-duration: '+d+';-ms-transition-duration: '+d+'; -o-transition-duration: '+d+';"></div>';
        }
    }

    function showEffect(){
        effectHtml = "";
        makeEffect('m1',18);
        makeEffect('m2',18);
        $('#specEffect').Html(effectHtml);
        setTimeout(function(){
            $('#specEffect>div').Translate(0,$.$.winHeight*2+'px');
        },300);
    }
})();