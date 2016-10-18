import Vue from 'vue';
import Util from "./util";
import "./websdk-1.1.2";

/**
 * 即时通讯IM
 * */

exports.IM = {
    global : null, //全局数据对象的引用
    id : "", //聊天ID
    password : '', //登录密码
    apiUrl : 'http://a1.easemob.com',
    xmppUrl: 'im-api.easemob.com',
    appKey : "xiaomodo#spa"+( /spa.93wifi.com/.test(location.hostname) ? "" : "test" ), //环信AppKey
    userId : "", //用户id--在小摩豆系统中
    header : null, //用户头像
    name : "", //聊天时的用户名称
    avatar : "",//用户头像ID
    conn : null, //与环信的连接

    secondId : "", //第二个账户
    secondConn : null,//第二个账户的连接
    reConnTimer : null, //重新连接的定时器
    newMsgTotal : 0, //新消息总数

    sessionList : null, //会话列表
    messageList : {}, //从本地缓存中读取的消息列表暂存于此

    talker : { //当前聊天对方信息
        name : "",//对方名称
        id : "",//对方环信ID
        userId : "",//小摩豆系统中的用户id
        userNo : "",//用户编号
        userType : "tech", //技师或者管理者 tech、manager
        header : "", //对方用户头像
        avatar : "", //头像编号
        clubId : "", //对方所在的clubID
        clubName : "", //对方所在的clubName
        inviteCode : "",///邀请码
        isAppointment : true,//是否可预约
        isPhoneAppointment : false,//是否可以电话预约
        telephone : [], //预约电话
        messageList : [] //当前聊天页面的消息列表
    },

    expression : {
        "/::O": "/大笑", "/::Y": "/坏笑", "/::B": "/害羞", "/::A": "/色", "/::C": "/晕", "/::D": "/红心", "/::X": "/心碎了", "/::Z": "/握手", "/::F": "/抱拳", "/::E": "/花", "/::T": "/花谢了", "/::P": "/示爱", "/::G": "/亲亲", "/::H": "/大哭",
        "/::I": "/可怜", "/::J": "/生气", "/::K": "/微笑", "/::L": "/冷汗", "/::M":"/困", "/::N":"/调皮", "/::Q":"/敲打", "/::R":"/疑问","/::S":"/猪头", "/::U": "/汽水", "/::V": "/西瓜", "/::W": "/鼓掌", "/::a": "/大拇指", "/::b": "/剪刀手"
    },
    decodeExpressionReg : new RegExp('/::[A-Zab]+', "g"),
    expressionIndexObj : null, //索引

    //获取缓存中的会话列表
    getSessionList : function(reGet){
        var _this = this, item, global = _this.global, pageMode = global.pageMode;
        if(!_this.sessionList || reGet){
            var cacheStr = Util.localStorage(_this.userId+"_SessionList");
            _this.sessionList = cacheStr ? JSON.parse(cacheStr) : {};

            ///////统计新消息数目
            var newMsgCount = 0, sessionObj;
            for(item in _this.sessionList){
                sessionObj = _this.sessionList[item];
                if(!(pageMode == "club" && sessionObj.clubId != global.clubId)){
                    newMsgCount += sessionObj.new;
                }
            }
            _this.newMsgTotal = newMsgCount;
            _this.updateHeader();//更新头像
        }
        return _this.sessionList;
    },

    //更新会话列表
    updateSessionList : function(msg, type, isNew){
        var _this = this,
            talkerId = ((msg.from == _this.id || msg.from == _this.secondId) ? msg.to : msg.from),
            sessionList = _this.getSessionList(),
            ext = msg.ext,
            sessionObj;
        if (!sessionList[talkerId]) {
            sessionObj = sessionList[talkerId] = {
                name : ext.name,
                header : ext.header,
                avatar : (ext.avatar || ""),
                techId : (ext.techId || ""),
                no : (ext.no || ""),
                clubId : ext.clubId,
                new : 0
            }
        }
        else {//更新
            sessionObj = sessionList[talkerId];
            sessionObj.name = ext.name;
            sessionObj.header = ext.header;
            sessionObj.avatar = ext.avatar;
            sessionObj.no = ext.no;
        }
        var dataObj = { id: msg.id || '', type: type, data: (type == 'pic' ? '[图片]' : msg.data), time: (+new Date()) };
        if (ext && ext.msgType) {
            var msgType = dataObj.msgType = ext.msgType;
            if (msgType == "order") dataObj.orderId = ext.orderId;
            else if(msgType == "diceGame") dataObj.data = "[骰子游戏]";
        }
        if (type == 'pic') {
            dataObj.url = msg.url;
            dataObj.width = msg.width;
            dataObj.height = msg.height;
        }

        sessionObj.msg = dataObj;
        if (isNew != false) sessionObj.new++;//更新新消息数
        sessionObj.time = msg.time || (+new Date());//更新时间
        Util.localStorage(_this.userId + '_SessionList', JSON.stringify(sessionList));//存储
    },

    //获取与某个聊天者的messageList
    getMessageList : function(talkerId){
        var _this = this, messageList = _this.messageList;
        if(!messageList[talkerId]){//从localStorage中读取
            var cacheMsg = Util.localStorage(_this.userId + '_MsgList_' + talkerId);
            if(cacheMsg){
                messageList[talkerId] = JSON.parse(cacheMsg);
                var list = messageList[talkerId].list;
                if (list.length > 100) {
                    list.splice(0,30);
                    Util.localStorage(_this.userId + '_MsgList_' + talkerId, JSON.stringify(messageList[talkerId]));//存储
                }
                if (_this.sessionList && _this.sessionList[talkerId]) {//以sessionList的header为准
                    messageList[talkerId].header = _this.sessionList[talkerId].header;
                }
            }
            else{
                messageList[talkerId] = {};
            }
        }
        return messageList[talkerId];
    },

    //存储接收到的消息
    storeMessage : function(msg,type){
        var _this = this,
            talkerId = ((msg.from == _this.id || msg.from== _this.secondId) ? msg.to : msg.from),
            messageListObj = _this.getMessageList(talkerId),
            ext = msg.ext;
        if (!messageListObj.name) {
            messageListObj = {
                name : ext.name,
                header : ext.header,
                avatar : ext.avatar || "",
                techId : ext.techId || "",
                no : ext.no || "",
                clubId : ext.clubId,
                list : []
            };
        }
        else if(ext){
            Object.assign(messageListObj,ext);
        }
        var dataObj = {
            from : msg.from,
            to : msg.to,
            id : msg.id || '',
            type : type,
            data : (type == 'pic' ? '[图片]' : msg.data),
            time : msg.time || (+new Date()),
            status : msg.status || 1
        };
        if(ext && ext.msgType){
            var msgType = dataObj.msgType = ext.msgType;
            if (msgType == "order"){
                dataObj.orderId = ext.orderId;
            }
            else if (msgType == "paidCoupon") {
                dataObj.actId = ext.actId;
                dataObj.techCode = ext.techCode;
            }
            else if (msgType == "ordinaryCoupon") {
                dataObj.userActId = msg.userActId;
            }
            else if(msgType == "diceGame"){
                dataObj.gameStatus = ext.gameStatus;
                dataObj.gameId = ext.gameId;
                dataObj.gameInvite = ext.gameInvite;
                dataObj.gameResult = ext.gameResult;
            }
            else if(msgType == "gift"){
                dataObj.giftId = ext.giftId;
                dataObj.giftValue = ext.giftValue;
                dataObj.giftName = ext.giftName;
            }
        }
        if (type == 'pic') {
            dataObj.url = msg.url;
            dataObj.width = msg.width;
            dataObj.height = msg.height;
        }
        if(!messageListObj.list){
            messageListObj.list = [];
        }
        messageListObj.list.push(dataObj);
        Util.localStorage(_this.userId + '_MsgList_' + talkerId, JSON.stringify(messageListObj));//存储
    },

    //更新会话列表里面用户的头像
    updateHeader : function(){
        var _this = this, sessionList = _this.sessionList, avatarArr = [], avatar , avatarIndex = {} , countIndex = 0;
        if(sessionList){
            for(var item in sessionList){
                avatar = sessionList[item].avatar;
                if(avatar && avatar.length>0){
                    avatarArr.push(avatar);
                    avatarIndex[countIndex] = item;
                    countIndex++;
                }
            }
            if(avatarArr.length>0){
                Vue.http.get("../api/v1/emchat/tech/avatars",{ params : { avatarIds : avatarArr.join(",") }}).then(function(res){
                    res = res.body;
                    if(res.statusCode == 200){
                        for(var i = 0;i<res.length;i++){
                            sessionList[avatarIndex[i]].header = res[i];
                        }
                    }
                });
            }
        }
    },

    //合并两个环信账户
    mergeAccount : function(oldUserId,newUserId){
        var _this = this,
            oldSessionListStr = Util.localStorage(oldUserId+ '_SessionList'),
            newSessionListStr = Util.localStorage(newUserId+'_SessionList'),
            oldSessionList,
            newSessionList,
            sessionList,
            item;

        if(oldSessionListStr){
            oldSessionList = JSON.parse(oldSessionListStr);
            if(newSessionListStr){
                newSessionList = JSON.parse(newSessionListStr);
                for(item in oldSessionList){
                    if(!newSessionList[item] || newSessionList[item].time-0 < oldSessionList[item].time-0){
                        newSessionList[item] = oldSessionList[item];
                    }
                }
                Util.localStorage(newUserId + '_SessionList',JSON.stringify(newSessionList));//直接用旧的替换
                sessionList = newSessionList;
            }
            else{
                Util.localStorage(newUserId + '_SessionList',oldSessionListStr);//直接用旧的替换
                sessionList = oldSessionList;
            }
            Util.removeLocalStorage(oldUserId+ '_SessionList');//删除旧会话列表
        }
        else{
            sessionList = JSON.parse(newSessionListStr);
        }
        _this.getSessionList(true);

        /////切换消息列表---合并操作
        var newMsgList,
            oldMsgList,
            oldMsgListObj,
            newMsgListObj,
            k;

        for(item in sessionList){
            newMsgList = Util.localStorage(newUserId + '_MsgList_'+item);
            oldMsgList = Util.localStorage(oldUserId + '_MsgList_'+item);
            if(oldMsgList){
                oldMsgList = oldMsgList.replace(new RegExp(_this.secondId,"g"),_this.id);
                if(!newMsgList){
                    Util.localStorage(newUserId + '_MsgList_'+item,oldMsgList);///旧消息列表放到新的里面
                }
                else{
                    oldMsgListObj = JSON.parse(oldMsgList);
                    newMsgListObj = JSON.parse(newMsgList);
                    for(k=0;k<oldMsgListObj.list.length;k++){
                        newMsgListObj.list.push(oldMsgListObj.list[k]);
                    }
                    if(k!=0){
                        newMsgListObj.list.sort(function(a,b){ return (a.time < b.time ? -1 : 1) });
                    }
                    Util.localStorage(newUserId + '_MsgList_'+item,JSON.stringify(newMsgListObj));///旧消息列表放到新的里面
                }
                Util.removeLocalStorage(oldUserId+ '_MsgList_'+item);
            }
        }
        _this.messageList = null;
    },

    //保存好友关系
    makeFriend : function(option){
        if (!option.toChatId) return;
        var _this = this;
        Vue.http.post("../api/v1/emchat/markchattouser",{
            currentChatId : option.fromChatId || _this.id,
            currentUserType : option.fromType || 'user',
            friendChatId : option.toChatId,
            friendUserType : option.toType || 'tech',
            msgType : option.msgType || "text"
        });
    },

    //创建环信连接
    createConn : function(connIndex){
        console.log("创建环信连接");
        connIndex = connIndex || 0;
        var _this = this,
            conn = new WebIM.connection({
                https : false,
                url : _this.xmppUrl,
                isMultiLoginSessions : true  //开启多页面同步收消息
            });
        conn.listen({
            onOpened : function(){
                console.log("conn opened...");
                if(connIndex == 0 && _this.reConnTimer){
                    clearTimeout(_this.reConnTimer);
                }
                _this.getSessionList();//加载会话列表
            },
            onTextMessage : function(msg){
                _this.doReceiveTextMessage(msg,conn);
            },
            onPictureMessage : function(msg){
                _this.doReceivePicMessage(msg);
            },
            onOnline : function(){
                console.log("web im on online");
            },
            onOffline : function(){
                console.log("web im on offline");
            },
            onError : function(e){

            },
            onClosed : function(){
                console.log('与环信的连接关闭。。。');
            }
        });

        /////尝试登陆
        var loginId = (connIndex == 0 ? _this.id : _this.secondId);
        if(loginId){
            console.log("尝试open conn "+loginId);
            conn.open({
                user : loginId,
                pwd : loginId,
                appKey : _this.appKey,
                apiUrl : _this.apiUrl,
                success : function(){
                    console.log(loginId+"conn success");
                },
                error : function(){
                    console.log(loginId+"conn error");
                }
            });
        }
        connIndex == 0 ? _this.conn = conn : _this.secondConn = conn;
    },

    //处理接受到的文本消息
    doReceiveTextMessage : function(msg,conn){
        if(msg.data.toLowerCase()=="debug"){
            return console.dir(msg);
        }
        var _this = this, ext = msg.ext;
        msg.time = ext.time - 0;

        //收到一张技师发来的优惠券
        if(ext.msgType == "ordinaryCoupon" && ext.actId && ext.techCode){
            if(!_this.userTel){ //未绑定手机号
                return _this.sendTextMessage({
                    to : msg.from,
                    msg : "我还未绑定手机号码，暂无法领取您发送的券！",
                    ext : { msgType: "tip" }
                });
            }
            else{
                /////领取这张券
                Vue.http.get("../api/v2/club/get/redpacket",{ params : {
                    actId : ext.actId,
                    phoneNum : _this.userTel,
                    openId : _this.global.openId,
                    userCode : "",
                    techCode : ext.techCode,
                    chanel : "link",
                    groupMessageId : ext.groupmessageId || ""
                }}).then(function(res){
                    res = res.body;
                    var respData = res.respData;
                    if (res.statusCode == 200 && respData && respData.userActId) {
                        msg.userActId = respData.userActId;
                    }
                    _this.doHandlerMessage(msg,"text");

                    if(msg.userActId) {//回送已领取消息
                        console.log("回送已领取消息");
                        ////////**********////////
                    }
                })
            }
        }
        else{
            _this.doHandlerMessage(msg,"text");
        }

        ///如果是旧账号收到技师发来的消息，则发送changAccount消息通知技师用户的账号已切换
        if(conn==_this.secondConn){
            conn.send({
                to: msg.from,
                msg: "",
                type: "chat",
                ext: { msgType : "changeAccount" , oldChatId : _this.secondId , newChatId : _this.id }
            })
        }
    },

    //处理接受到的图片消息
    doReceivePicMessage : function(msg){
        var _this = this, img = null;
        if(msg.width == 0 && msg.height == 0){
            img = new Image();
            img.onload = function () {
                msg.width = this.width;
                msg.height = this.height;
                _this.doHandlerMessage(msg,"pic");
            };
            img.src = msg.url;
        }
        else{
            _this.doHandlerMessage(msg,"pic");
        }
    },

    //处理消息
    doHandlerMessage : function(msg,type){
        var _this = this, global = _this.global;
        _this.storeMessage(msg,"text");
        if(global.currPage.name == "chat"){///当前是聊天页面
            if(_this.talker.id == msg.from){
                _this.updateSessionList(msg,type,false);
                ///////***********///////////
            }
            else{
                _this.updateSessionList(msg,type);
            }
        }
        else{
            _this.updateSessionList(msg,type);
            ///////***********///////////
        }
    },

    //发送文本消息 talkerType--tech或者manager
    sendTextMessage : function(option,talker,callback){
        var _this = this,
            msgId = _this.conn.getUniqueId(),
            msg = new WebIM.message('txt',msgId),
            storeMsg = Object.assign({
                from : _this.id, data : option.msg, status : 0
            },option),
            storeMsgExt = storeMsg.ext;

        storeMsgExt.name = talker.name;
        storeMsgExt.header = talker.header;
        storeMsgExt.avatar = talker.avatar;
        storeMsgExt.no = talker.userNo;
        storeMsgExt.techId = talker.userType=="tech" ? talker.userId : "";
        storeMsgExt.clubId = talker.clubId;

        console.log("1-storeMsg：");
        console.dir(storeMsg);

        var sendFailTimer = setTimeout(function(){
            storeMsg.status = 0;
            _this.updateSessionList(storeMsg, "text", false);
            _this.storeMessage(storeMsg,"text");
        },10000);

        Object.assign(option,{
            type : "chat",
            ext : {
                name : _this.name,
                header : _this.header,
                avatar : _this.avatar,
                time : (+new Date())
            },
            success : function(id,serviceId){
                console.log("消息："+id+"发送成功！serviceId："+serviceId);
                clearTimeout(sendFailTimer);
                storeMsg.status = 1;
                _this.updateSessionList(storeMsg, "text", false);
                _this.storeMessage(storeMsg,"text");
                _this.makeFriend({ toChatId : option.to, toType : talker.userType });
                if(callback) callback();
            }
        });

        msg.set(option);
        _this.conn.send(msg.body);

        ////如果此消息正是发给当前的聊天者，则需要在聊天页面上显示出来
        if(_this.talker.id == option.to){
            _this.talker.messageList.push(storeMsg);
        }
    },

    ///发送图片
    sendPicMessage : function(fileObj,imgFile,talker){
        var _this = this,
            img = new Image();
        img.src = window.URL.createObjectURL(imgFile);
        img.onload = function(){
            var rawWidth = this.width, rawHeight = this.height;
            var storeMsg = {
                from : _this.id,
                to : talker.id,
                url : img.src,
                type : "pic",
                width : rawWidth,
                height : rawHeight,
                status : 0,
                ext : {
                    name : talker.name,
                    header : talker.header,
                    avatar : talker.avatar,
                    no : talker.userNo,
                    techId : talker.userType == "tech" ? talker.userId : "",
                    clubId : talker.clubId
                }
            };
            _this.conn.send({
                apiUrl : _this.apiUrl,
                file : fileObj,
                to : talker.id,
                type : 'img',
                width : rawWidth,
                height : rawHeight,
                file_length : imgFile.size,
                onFileUploadComplete: function (data) {
                    Util.tipShow("图片发送成功！");
                    console.dir(data);
                    _this.makeFriend({ toChatId : talker.id, toType : talker.userType, msgType : "image" });
                    storeMsg.url = data.uri + "/" + data.entities[0].uuid;
                    _this.updateSessionList(storeMsg, "pic", false);
                    _this.storeMessage(storeMsg,"pic");
                    window.URL.revokeObjectURL(img.src);
                },
                onFileUploadError: function (error) {
                    Util.tipShow("图片发送失败，请稍后重试！" + JSON.stringify(error));
                },
                ext : {
                    name : _this.name,
                    header : _this.header,
                    avatar : _this.avatar,
                    time : (+new Date())
                }
            });

            ////如果此消息正是发给当前的聊天者，则需要在聊天页面上显示出来
            if(_this.talker.id == talker.id){
                _this.talker.messageList.push(storeMsg);
            }
        }
    },

    //删除与某人的会话记录和聊天记录
    delMessageRecord : function(personId){

    },

    //解码文本消息中的表情编码
    decodeExpression : function(msg){
        var _this = this;
        return msg.replace(_this.decodeExpressionReg, function () {
            return _this.expression[arguments[0]] || arguments[0];
        });
    },

    ///解析文本消息，将里面的表情编码换成图片img标签
    decodeExpressionToImg : function(msg){//expElList 表情dom元素列表
        console.log("decodeExpressionToImg msg："+msg);
        var _this = this, item, k;
        if(!_this.expressionIndexObj){
            _this.expressionIndexObj = {};
            k = 1;
            for(item in _this.expression){
                _this.expressionIndexObj[item] = k++;
            }
        }
        return msg.replace(_this.decodeExpressionReg, function () {
            k = _this.expressionIndexObj[arguments[0]];
            if(k){
                return "<img src='images/chat/expression/"+k+".png' data-exp='" + arguments[0] + "'/>";
            }
            return arguments[0];
        });
    }
};