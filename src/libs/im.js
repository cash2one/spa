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
    appKey : "xiaomodo#spa"+( /spa.93wifi.com/.test(location.hostname) ? "" : "test" ), //环信AppKey
    userId : "", //用户id--在小摩豆系统中
    header : null, //用户头像
    name : "", //聊天时的用户名称
    conn : null, //与环信的连接

    secondId : "", //第二个账户
    secondConn : null,//第二个账户的连接
    reConnTimer : null, //重新连接的定时器
    sessionList : null, //会话列表

    talker : { //当前聊天对方信息
        name : "",//对方名称
        id : "",//对方环信ID
        userId : "",//小摩豆系统中的用户id
        userNo : "",//用户编号
        userType : "tech", //技师或者管理者 tech、manager
        header : "", //对方用户头像
        avatar : "", //头像编号
        clubId : "", //对方所在的clubID
        msgList : [] //当前聊天页面的消息列表
    },

    expression : {
        "/::O": "/大笑", "/::Y": "/坏笑", "/::B": "/害羞", "/::A": "/色", "/::C": "/晕", "/::D": "/红心", "/::X": "/心碎了", "/::Z": "/握手", "/::F": "/抱拳", "/::E": "/花", "/::T": "/花谢了", "/::P": "/示爱", "/::G": "/亲亲", "/::H": "/大哭",
        "/::I": "/可怜", "/::J": "/生气", "/::K": "/微笑", "/::L": "/冷汗", "/::M":"/困", "/::N":"/调皮", "/::Q":"/敲打", "/::R":"/疑问","/::S":"/猪头", "/::U": "/汽水", "/::V": "/西瓜", "/::W": "/鼓掌", "/::a": "/大拇指", "/::b": "/剪刀手"
    },
    decodeExpressionReg : new RegExp('/::[A-Zab]+', "g"),

    //获取缓存中的会话列表
    getSessionList : function(reGet){
        var _this = this;
        if(!_this.sessionList || reGet){
            var cacheStr = Util.localStorage(_this.userId+"_SessionList");
            _this.sessionList = cacheStr ? JSON.parse(cacheStr) : {};
        }
        return _this.sessionList;
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

    //创建环信连接
    createConn : function(connIndex){
        connIndex = connIndex || 0;
        var _this = this,
            conn = new WebIM.connection({
                isMultiLoginSessions : true  //开启多页面同步收消息
            });
        conn.listen({
            onOpened : function(){
                if(connIndex == 0 && _this.reConnTimer){
                    clearTimeout(_this.reConnTimer);
                }
                _this.getSessionList();//加载会话列表
            },
            onTextMessage : function(msg){
                _this.doReceiveTextMessage(msg,conn);
            },
            onPictureMessage : function(msg){
                _this.doReceivePicMessage(msg,conn);
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

            }
        });
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
                    actId: ext.actId,
                    phoneNum: _this.userTel,
                    openId: _this.global.openId,
                    userCode: "",
                    techCode: ext.techCode,
                    chanel: "link",
                    groupMessageId : ext.groupmessageId || ""
                }}).then(function(res){
                    res = res.body;
                    var respData = res.respData;
                    if (res.statusCode == 200 && respData && respData.userActId) {
                        msg.userActId = respData.userActId;
                    }
                    _this.doHandlerTextMessage(msg);

                    if(msg.userActId) {//回送已领取消息
                        console.log("回送已领取消息");
                        ////////**********////////
                    }
                })
            }
        }
        else{
            _this.doHandlerTextMessage(msg);
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
    doReceivePicMessage : function(msg,conn){

    },

    //处理文本消息
    doHandlerTextMessage : function(msg){

    },

    //发送文本消息
    sendTextMessage : function(option){
        var _this = this,
            msgId = _this.conn.getUniqueId(),
            msg = new WebIM.message('txt',msgId);//创建文本消息

        Object.assign(option,{
            type : "chat",
            ext : {
                name : _this.name,
                header : _this.header,
                time : (+new Date())
            },
            success : function(id,serviceId){
                console.log("消息："+id+"发送成功！serviceId："+serviceId);
            }
        });

        msg.set(option);
        _this.conn.send(msg.body);
    },

    //存储接收到的消息
    storeMessage : function(msg){

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
    }
};
