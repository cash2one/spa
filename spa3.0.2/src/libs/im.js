import Vue from 'vue'
import Util from './util'
import { eventHub } from './hub'
import './websdk-1.1.3'

/**
 * 即时通讯IM
 * */

exports.IM = {
    global: null, // 全局数据对象的引用
    id: '', // 聊天ID
    password: '', // 登录密码
    apiUrl: 'http://a1.easemob.com',
    xmppUrl: 'im-api.easemob.com',
    appKey: 'xiaomodo#spa' + (/spa.93wifi.com/.test(location.hostname) ? '' : 'test'), // 环信AppKey
    userId: '', // 用户id--在小摩豆系统中
    header: null, // 用户头像
    name: '', // 聊天时的用户名称
    avatar: '', // 用户头像ID
    conn: null, // 与环信的连接

    secondId: '', // 第二个账户
    secondConn: null, // 第二个账户的连接
    reConnTimer: null, // 重新连接的定时器
    newMsgTotal: 0, // 新消息总数

    sessionList: null, // 会话列表
    messageList: {}, // 从本地缓存中读取的消息列表暂存于此

    needShowEffectDiceGames: {}, // 需要在创建骰子游戏结果时显示动态效果的 游戏id数组
    talker: { // 当前聊天对方信息
        name: '', // 对方名称
        id: '', // 对方环信ID
        userId: '', // 小摩豆系统中的用户id
        userNo: '', // 用户编号
        userType: 'tech', // 技师或者管理者 tech、manager
        header: '', // 对方用户头像
        avatar: '', // 头像编号
        clubId: '', // 对方所在的clubID
        clubName: '', // 对方所在的clubName
        inviteCode: '', // 邀请码
        isAppointment: true, // 是否可预约
        isPhoneAppointment: false, // 是否可以电话预约
        telephone: [], // 预约电话
        messageList: [] // 当前聊天页面的消息列表
    },

    expression: {
        '/::O': '/大笑',
        '/::Y': '/坏笑',
        '/::B': '/害羞',
        '/::A': '/色',
        '/::C': '/晕',
        '/::D': '/红心',
        '/::X': '/心碎了',
        '/::Z': '/握手',
        '/::F': '/抱拳',
        '/::E': '/花',
        '/::T': '/花谢了',
        '/::P': '/示爱',
        '/::G': '/亲亲',
        '/::H': '/大哭',
        '/::I': '/可怜',
        '/::J': '/生气',
        '/::K': '/微笑',
        '/::L': '/冷汗',
        '/::M': '/困',
        '/::N': '/调皮',
        '/::Q': '/敲打',
        '/::R': '/疑问',
        '/::S': '/猪头',
        '/::U': '/汽水',
        '/::V': '/西瓜',
        '/::W': '/鼓掌',
        '/::a': '/大拇指',
        '/::b': '/剪刀手'
    },
    decodeExpressionReg: new RegExp('/::[A-Zab]+', 'g'),
    expressionIndexObj: null, // 索引

    // 获取缓存中的会话列表
    getSessionList: function (reGet) {
        var that = this
        var item
        var global = that.global
        var pageMode = global.pageMode
        if (!that.sessionList || reGet) {
            var cacheStr = Util.localStorage(that.userId + '_SessionList')
            that.sessionList = cacheStr ? JSON.parse(cacheStr) : {}

            // 统计新消息数目
            var newMsgCount = 0
            var sessionObj
            for (item in that.sessionList) {
                sessionObj = that.sessionList[item]
                if (!(pageMode == 'club' && sessionObj.clubId !== global.clubId)) {
                    newMsgCount += sessionObj.new
                }
            }
            that.newMsgTotal = newMsgCount
            that.updateHeader() // 更新头像
        }
        return that.sessionList
    },

    // 更新会话列表
    updateSessionList: function (msg, type, isNew) {
        var that = this
        var talkerId = ((msg.from == that.id || msg.from == that.secondId) ? msg.to : msg.from)
        var sessionList = that.getSessionList()
        var ext = msg.ext
        var sessionObj
        if (!sessionList[talkerId]) {
            sessionObj = sessionList[talkerId] = {
                name: ext.name,
                header: ext.header,
                avatar: (ext.avatar || ''),
                techId: (ext.techId || ''),
                no: (ext.no || ''),
                clubId: ext.clubId,
                new: 0
            }
        } else { // 更新
            sessionObj = sessionList[talkerId]
            sessionObj.name = ext.name
            sessionObj.header = ext.header
            sessionObj.avatar = ext.avatar
            sessionObj.no = ext.no
        }
        var dataObj = {id: msg.id || '', type: type, data: (type == 'pic' ? '[图片]' : msg.data), time: (+new Date())}
        if (ext && ext.msgType) {
            var msgType = dataObj.msgType = ext.msgType
            if (msgType == 'order') dataObj.orderId = ext.orderId
            else if (msgType == 'diceGame') dataObj.data = '[骰子游戏]'
        }
        if (type == 'pic') {
            dataObj.url = msg.url
            dataObj.width = msg.width
            dataObj.height = msg.height
        }

        sessionObj.msg = dataObj
        if (isNew !== false) sessionObj.new++ // 更新新消息数
        sessionObj.time = msg.time || (+new Date()) // 更新时间
        Util.localStorage(that.userId + '_SessionList', JSON.stringify(sessionList)) // 存储
    },

    // 获取与某个聊天者的messageList
    getMessageList: function (talkerId) {
        var that = this
        var messageList = that.messageList
        if (!messageList[talkerId]) { // 从localStorage中读取
            var cacheMsg = Util.localStorage(that.userId + '_MsgList_' + talkerId)
            if (cacheMsg && cacheMsg !== '{}') {
                messageList[talkerId] = JSON.parse(cacheMsg)
                var list = messageList[talkerId].list
                if (list.length > 100) {
                    list.splice(0, 30)
                    Util.localStorage(that.userId + '_MsgList_' + talkerId, JSON.stringify(messageList[talkerId])) // 存储
                }
                if (that.sessionList && that.sessionList[talkerId]) { // 以sessionList的header为准
                    messageList[talkerId].header = that.sessionList[talkerId].header
                }
            } else {
                messageList[talkerId] = {}
            }
        }
        return messageList[talkerId]
    },

    // 序列化到localStorage里面
    serialMessage: function (talkerId) {
        var that = this
        var messageList = that.getMessageList(talkerId)
        Util.localStorage(that.userId + '_MsgList_' + talkerId, JSON.stringify(messageList))
    },

    // 存储接收到的消息
    storeMessage: function (msg, type) {
        var that = this
        var talkerId = ((msg.from == that.id || msg.from == that.secondId) ? msg.to : msg.from)
        var messageListObj = that.getMessageList(talkerId)
        var ext = msg.ext
        if (!messageListObj.name) {
            messageListObj = {
                name: ext.name,
                header: ext.header,
                avatar: ext.avatar || '',
                techId: ext.techId || '',
                no: ext.no || '',
                clubId: ext.clubId,
                list: []
            }
        } else if (ext) {
            Object.assign(messageListObj, ext)
        }
        var dataObj = {
            from: msg.from,
            to: msg.to,
            id: msg.id || '',
            type: type,
            data: (type == 'pic' ? '[图片]' : msg.data),
            time: msg.time || (+new Date()),
            status: msg.status || 1
        }
        if (ext && ext.msgType) {
            var msgType = dataObj.msgType = ext.msgType
            if (msgType == 'order') {
                dataObj.orderId = ext.orderId
            } else if (msgType == 'paidCoupon') {
                dataObj.actId = ext.actId
                dataObj.techCode = ext.techCode
            } else if (msgType == 'ordinaryCoupon') {
                dataObj.userActId = msg.userActId
            } else if (msgType == 'diceGame') {
                dataObj.gameStatus = ext.gameStatus
                dataObj.gameId = ext.gameId
                dataObj.gameInvite = ext.gameInvite
                dataObj.gameResult = ext.gameResult
            } else if (msgType == 'gift') {
                dataObj.giftId = ext.giftId
                dataObj.giftValue = ext.giftValue
                dataObj.giftName = ext.giftName
            }
        }
        if (type == 'pic') {
            dataObj.url = msg.url
            dataObj.width = msg.width
            dataObj.height = msg.height
        }
        if (!messageListObj.list) {
            messageListObj.list = []
        }
        messageListObj.list.push(dataObj)
        Util.localStorage(that.userId + '_MsgList_' + talkerId, JSON.stringify(messageListObj)) // 存储
        that.messageList[talkerId] = messageListObj
        return dataObj
    },

    // 更新会话列表里面用户的头像
    updateHeader: function () {
        var that = this
        var sessionList = that.sessionList
        var avatarArr = []
        var avatar
        var avatarIndex = {}
        var countIndex = 0
        if (sessionList) {
            for (var item in sessionList) {
                avatar = sessionList[item].avatar
                if (avatar && avatar.length > 0) {
                    avatarArr.push(avatar)
                    avatarIndex[countIndex] = item
                    countIndex++
                }
            }
            if (avatarArr.length > 0) {
                Vue.http.get('../api/v1/emchat/tech/avatars', {params: {avatarIds: avatarArr.join(',')}}).then(function (res) {
                    res = res.body
                    if (res.statusCode == 200) {
                        for (var i = 0; i < res.length; i++) {
                            sessionList[avatarIndex[i]].header = res[i]
                        }
                    }
                })
            }
        }
    },

    // 合并两个环信账户
    mergeAccount: function (oldUserId, newUserId) {
        var that = this
        var oldSessionListStr = Util.localStorage(oldUserId + '_SessionList')
        var newSessionListStr = Util.localStorage(newUserId + '_SessionList')
        var oldSessionList
        var newSessionList
        var sessionList
        var item

        if (oldSessionListStr) {
            oldSessionList = JSON.parse(oldSessionListStr)
            if (newSessionListStr) {
                newSessionList = JSON.parse(newSessionListStr)
                for (item in oldSessionList) {
                    if (!newSessionList[item] || newSessionList[item].time - 0 < oldSessionList[item].time - 0) {
                        newSessionList[item] = oldSessionList[item]
                    }
                }
                Util.localStorage(newUserId + '_SessionList', JSON.stringify(newSessionList)) // 直接用旧的替换
                sessionList = newSessionList
            } else {
                Util.localStorage(newUserId + '_SessionList', oldSessionListStr) // 直接用旧的替换
                sessionList = oldSessionList
            }
            Util.removeLocalStorage(oldUserId + '_SessionList') // 删除旧会话列表
        } else {
            sessionList = JSON.parse(newSessionListStr)
        }
        that.getSessionList(true)

        // 切换消息列表---合并操作
        var newMsgList
        var oldMsgList
        var oldMsgListObj
        var newMsgListObj
        var k

        for (item in sessionList) {
            newMsgList = Util.localStorage(newUserId + '_MsgList_' + item)
            oldMsgList = Util.localStorage(oldUserId + '_MsgList_' + item)
            if (oldMsgList) {
                oldMsgList = oldMsgList.replace(new RegExp(that.secondId, 'g'), that.id)
                if (!newMsgList) {
                    Util.localStorage(newUserId + '_MsgList_' + item, oldMsgList) // 旧消息列表放到新的里面
                } else {
                    oldMsgListObj = JSON.parse(oldMsgList)
                    newMsgListObj = JSON.parse(newMsgList)
                    for (k = 0; k < oldMsgListObj.list.length; k++) {
                        newMsgListObj.list.push(oldMsgListObj.list[k])
                    }
                    if (k !== 0) {
                        newMsgListObj.list.sort(function (a, b) {
                            return (a.time < b.time ? -1 : 1)
                        })
                    }
                    Util.localStorage(newUserId + '_MsgList_' + item, JSON.stringify(newMsgListObj)) // 旧消息列表放到新的里面
                }
                Util.removeLocalStorage(oldUserId + '_MsgList_' + item)
            }
        }
        that.messageList = null
    },

    // 保存好友关系
    makeFriend: function (option) {
        if (!option.toChatId) return
        var that = this
        Vue.http.post('../api/v1/emchat/markchattouser', {
            currentChatId: option.fromChatId || that.id,
            currentUserType: option.fromType || 'user',
            friendChatId: option.toChatId,
            friendUserType: option.toType || 'tech',
            msgType: option.msgType || 'text'
        })
    },

    // 创建环信连接
    createConn: function (connIndex) {
        console.log('创建环信连接')
        connIndex = connIndex || 0
        var that = this
        /*eslint-disable */
        var conn = new WebIM.connection({
            https: false,
            url: that.xmppUrl,
            isMultiLoginSessions: true  // 开启多页面同步收消息
        })
        conn.listen({
            onOpened: function () {
                console.log('conn opened...')
                if (connIndex == 0 && that.reConnTimer) {
                    clearTimeout(that.reConnTimer)
                }
                that.getSessionList() // 加载会话列表
            },
            onTextMessage: function (msg) {
                that.doReceiveTextMessage(msg, conn)
            },
            onPictureMessage: function (msg) {
                that.doReceivePicMessage(msg)
            },
            onOnline: function () {
                console.log('web im on online')
            },
            onOffline: function () {
                console.log('web im on offline')
            },
            onError: function (e) {

            },
            onClosed: function () {
                console.log('与环信的连接关闭。。。')
            }
        })

        // 尝试登陆
        var loginId = (connIndex == 0 ? that.id : that.secondId)
        if (loginId) {
            console.log('尝试open conn ' + loginId)
            conn.open({
                user: loginId,
                pwd: loginId,
                appKey: that.appKey,
                apiUrl: that.apiUrl,
                success: function () {
                    console.log(loginId + 'conn success')
                },
                error: function () {
                    console.log(loginId + 'conn error')
                }
            })
        }
        connIndex == 0 ? that.conn = conn : that.secondConn = conn
    },

    // 处理接受到的文本消息
    doReceiveTextMessage: function (msg, conn) {
        console.log('im 收到一条消息：')
        console.log(JSON.stringify(msg))

        if (msg.data.toLowerCase() == 'debug') {
            return console.dir(msg)
        }
        var that = this
        var ext = msg.ext
        msg.time = ext.time - 0

        // 收到一张技师发来的优惠券
        if (ext.msgType == 'ordinaryCoupon' && ext.actId && ext.techCode) {
            console.log('收到一张技师发来的优惠券')
            if (!that.global.userTel) { // 未绑定手机号
                return that.sendTextMessage({
                    to: msg.from,
                    msg: '我还未绑定手机号码，暂无法领取您发送的券！',
                    ext: {msgType: 'tip'}
                }, {}, null, false)
            } else {
                console.log('领取这张券')
                // 领取这张券
                Vue.http.get('../api/v2/club/get/redpacket', {
                    params: {
                        actId: ext.actId,
                        phoneNum: that.global.userTel,
                        openId: that.global.openId,
                        userCode: '',
                        techCode: ext.techCode,
                        chanel: 'link',
                        groupMessageId: ext.groupmessageId || ''
                    }
                }).then(function (res) {
                    res = res.body
                    var respData = res.respData
                    if (res.statusCode == 200 && respData && respData.userActId) {
                        msg.userActId = respData.userActId
                    }
                    that.doHandlerMessage(msg, 'text')

                    if (msg.userActId) { // 回送已领取消息
                        console.log('回送已领取消息')
                        var couponName = msg.data.split('元<b>')[0]
                        var strArr = couponName.split('</i><span>')
                        couponName = strArr[1].slice(0, -7) + '元' + strArr[0].substr(3)
                        that.sendTextMessage({
                            to: msg.from,
                            msg: couponName,
                            data: '您领取了' + ext.name + '的"' + couponName + '"',
                            ext: {
                                msgType: 'couponTip'
                            }
                        }, {
                            id: msg.from,
                            name: ext.name,
                            header: ext.header,
                            avatar: ext.avatar,
                            userNo: ext.no,
                            userId: ext.techId,
                            clubId: ext.clubId,
                            userType: 'tech'
                        }, null, true)
                    } else if (res.statusCode == 206) {
                        that.sendTextMessage({ // 已结领取过了
                            to: msg.from,
                            msg: '已经领取过这张券了！',
                            ext: {msgType: 'tip'}
                        }, {}, null, false)
                    }
                })
            }
        } else {
            if (ext.msgType == 'diceGame' && ext.gameStatus !== 'request') {
                // 查找gameMessageObj,更改其状态
                var gameMessageObj
                var messageList = that.getMessageList(msg.from).list
                var item
                if (messageList) {
                    for (var k = messageList.length - 1; k >= 0; k--) {
                        item = messageList[k]
                        if (item.msgType == 'diceGame' && item.gameId == ext.gameId && item.gameStatus == 'request') {
                            gameMessageObj = item
                            break
                        }
                    }
                }

                if (/(reject|overtime|cancel)/.test(ext.gameStatus)) {
                    if (gameMessageObj) gameMessageObj.gameStatus = 'handled'
                } else {
                    if (gameMessageObj) gameMessageObj.gameStatus = ext.gameStatus
                    if (ext.gameStatus == 'accept') {
                        ext.gameStatus = 'handled'
                    } else if (ext.gameStatus == 'over') {
                        eventHub.$emit('update-credit-account')
                        that.needShowEffectDiceGames[ext.gameId] = true // 显示结果动画
                    }
                }
                that.serialMessage(msg.from)
            }
            that.doHandlerMessage(msg, 'text')
        }

        // 如果是旧账号收到技师发来的消息，则发送changAccount消息通知技师用户的账号已切换
        if (conn == that.secondConn) {
            conn.send({
                to: msg.from,
                msg: '',
                type: 'chat',
                ext: {msgType: 'changeAccount', oldChatId: that.secondId, newChatId: that.id}
            })
        }
    },

    // 处理接受到的图片消息
    doReceivePicMessage: function (msg) {
        console.log('收到图片消息：')
        console.log(JSON.stringify(msg))
        var that = this
        if (msg.width == 0 && msg.height == 0) {
            var img = new Image()
            img.onload = function () {
                msg.width = this.width
                msg.height = this.height
                that.doHandlerMessage(msg, 'pic')
            }
            img.src = msg.url
        } else {
            that.doHandlerMessage(msg, 'pic')
        }
    },

    // 处理收到的消息
    doHandlerMessage: function (msg, type) {
        var that = this
        var global = that.global
        var storeMsg = that.storeMessage(msg, type)
        if (global.currPage.name == 'chat') { // 当前是聊天页面
            if (that.talker.id == msg.from) {
                that.updateSessionList(msg, type, false)
                that.talker.messageList.push(storeMsg)
                setTimeout(function () {
                    eventHub.$emit('message-wrap-to-bottom')
                }, 300)
            } else {
                that.updateSessionList(msg, type)
            }
        } else {
            that.updateSessionList(msg, type)
            /* ****** */
        }
    },

    // 发送文本消息 talkerType--tech或者manager
    sendTextMessage: function (option, talker, callback, needStore) {
        var that = this
        var msgId = that.conn.getUniqueId()
        var storeMsg
        var sendFailTimer

        /*eslint-disable */
        var msg = new WebIM.message('txt', msgId)

        needStore = needStore !== false
        if (needStore) {
            storeMsg = {
                to: option.to,
                from: that.id,
                data: option.data || option.msg,
                status: 0,
                ext: {
                    name: talker.name,
                    header: talker.header,
                    avatar: talker.avatar,
                    no: talker.userNo,
                    techId: talker.userType == 'tech' ? talker.userId : '',
                    clubId: talker.clubId
                }
            }
            if (option.ext) {
                Object.assign(storeMsg.ext, option.ext)
            }
            that.updateSessionList(storeMsg, 'text', false)
            storeMsg = that.storeMessage(storeMsg, 'text')

            sendFailTimer = setTimeout(function () {
                storeMsg.status = 0
                that.serialMessage(talker.id)
            }, 10000)
        }

        var sendOption = {
            to: option.to,
            msg: option.msg,
            type: 'chat',
            ext: {
                name: that.name,
                header: that.header,
                avatar: that.avatar,
                time: (+new Date())
            },
            success: function () {
                if (needStore) {
                    clearTimeout(sendFailTimer)
                    storeMsg.status = 1
                    that.serialMessage(talker.id)
                }
                that.makeFriend({toChatId: option.to, toType: talker.userType})
                if (callback) callback()
            }
        }
        if (option.ext) {
            Object.assign(sendOption.ext, option.ext)
        }

        msg.set(sendOption)
        that.conn.send(msg.body)

        // 如果此消息正是发给当前的聊天者，则需要在聊天页面上显示出来
        if (that.talker.id == option.to && needStore) {
            that.talker.messageList.push(storeMsg)
            setTimeout(function () {
                eventHub.$emit('message-wrap-to-bottom')
            }, 300)
        }
    },

    // 发送图片
    sendPicMessage: function (fileObj, imgFile, talker) {
        var that = this
        var img = new Image()
        img.src = window.URL.createObjectURL(imgFile)
        img.onload = function () {
            var rawWidth = this.width
            var rawHeight = this.height
            var storeMsg = {
                from: that.id,
                to: talker.id,
                url: img.src,
                type: 'pic',
                width: rawWidth,
                height: rawHeight,
                status: 0,
                ext: {
                    name: talker.name,
                    header: talker.header,
                    avatar: talker.avatar,
                    no: talker.userNo,
                    techId: talker.userType == 'tech' ? talker.userId : '',
                    clubId: talker.clubId
                }
            }
            that.conn.send({
                apiUrl: that.apiUrl,
                file: fileObj,
                to: talker.id,
                type: 'img',
                width: rawWidth,
                height: rawHeight,
                file_length: imgFile.size,
                onFileUploadComplete: function (data) {
                    Util.tipShow('图片发送成功！')
                    that.makeFriend({toChatId: talker.id, toType: talker.userType, msgType: 'image'})
                    storeMsg.url = data.uri + '/' + data.entities[0].uuid
                    that.updateSessionList(storeMsg, 'pic', false)
                    that.storeMessage(storeMsg, 'pic')
                    window.URL.revokeObjectURL(img.src)
                },
                onFileUploadError: function (error) {
                    Util.tipShow('图片发送失败，请稍后重试！' + JSON.stringify(error))
                },
                ext: {
                    name: that.name,
                    header: that.header,
                    avatar: that.avatar,
                    time: (+new Date())
                }
            })

            // 如果此消息正是发给当前的聊天者，则需要在聊天页面上显示出来
            if (that.talker.id == talker.id) {
                that.talker.messageList.push(storeMsg)
                setTimeout(function () {
                    eventHub.$emit('message-wrap-to-bottom')
                }, 300)
            }
        }
    },

    // 删除与某人的会话记录和聊天记录
    delMessageRecord: function (personId) {
    },

    // 解码文本消息中的表情编码
    decodeExpression: function (msg) {
        var that = this
        return msg.replace(that.decodeExpressionReg, function () {
            return that.expression[arguments[0]] || arguments[0]
        })
    },

    // 解析文本消息，将里面的表情编码换成图片img标签
    decodeExpressionToImg: function (msg) {
        var that = this
        var item
        var k
        if (!that.expressionIndexObj) {
            that.expressionIndexObj = {}
            k = 1
            for (item in that.expression) {
                that.expressionIndexObj[item] = k++
            }
        }
        return msg.replace(that.decodeExpressionReg, function () {
            k = that.expressionIndexObj[arguments[0]]
            return k ? '<img src="images/chat/expression/' + k + '.png" data-exp="' + arguments[0] + '"/>' : arguments[0]
        })
    }
}
