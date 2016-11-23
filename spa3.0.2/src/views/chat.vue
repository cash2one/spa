<style>
    @import '../styles/page/chat.css';
</style>
<template>
    <div class="page" id="chat-page" :style="{ height : global.winHeight+'px' }">
        <div class="page-title"><a class="back" @click="doClickPageBack()"></a>{{ talker.name }}<span v-show="talker.userNo">[{{ talker.userNo }}]</span><a class="icon home" :class="{ once : talker.userType=='manager' }" @click="doClickHomeIcon()"></a>
            <router-link class="icon tech" v-show="talker.userType=='tech'" :to="{ name : 'technicianDetail', query : { id : talker.userId } }"></router-link>
        </div>
        <div class="order-tip" @click="doClickOrderTip()" v-show="talker.userType=='tech'">如果技师没有回应，那就立即预约吧！<div></div></div>
        <div class="message-wrap" :style="{ height : msgWrapHeight+'px' }" ref="wrapList">
            <load-more :top-method="loadMoreData">
                <message-node v-for="msg in talker.messageList" :msg="msg" :gift-map-data="giftMapData" :credit-config="creditConfig"></message-node>
            </load-more>
        </div>
        <chat-input :credit-config="creditConfig" :gifts="gifts" :coupons="coupons" :curr-integral-account="currIntegralAccount"></chat-input>
        <tel-detail v-if="talker.telephone.length>0" :telephone="talker.telephone"></tel-detail>
        <dice-setting></dice-setting>
        <credit-tip></credit-tip>
        <golden-effect></golden-effect>
    </div>
</template>
<script>
    import Vue from 'vue'
    import { Global } from '../libs/global'
    import { eventHub } from '../libs/hub'
    import { IM } from '../libs/im'
    import Util from '../libs/util'
    import MessageNode from '../components/message-node'

    module.exports = {
        components: {
            'message-node': MessageNode
        },
        data: function () {
            return {
                global: Global.data,
                im: IM,
                clubId: '',
                talker: IM.talker, // 当前聊天的对方
                msgWrapHeight: null,
                giftMapData: {}, // 积分礼物数据
                gifts: [],
                creditConfig: { // 积分的配置
                    diceGameSwitch: false,
                    creditSwitch: false,
                    diceGameTimeout: 24 * 60 * 60 * 1000
                },
                currIntegralAccount: 0, // 当前账户积分
                coupons: [], // 优惠券数据
                onceLoadCount: 10, // 一次加载10条
                isLoadOver: false // 是否已经全部加载
            }
        },
        beforeRouteEnter: function (to, from, next) {
            if (Global.data.pageMode != 'club' && to.query.clubId) {
                Util.tipShow(Global.data.visitError)
                return next(false)
            }
            var techId = to.query.techId
            if (techId) {
                // 查询技师的信息
                Vue.http.get('../api/v2/club/technician/' + techId, {params: {needServiceInfo: 'N'}}).then(function (res) {
                    res = res.body
                    if (res.id) {
                        next(function (vm) {
                            var talker = vm.talker
                            var global = vm.global
                            var info = res.info

                            talker.userType = 'tech'
                            talker.userId = techId
                            talker.id = res.emchatId
                            talker.name = info.name || global.defaultTechName
                            talker.header = info.avatarUrl || global.defaultHeader
                            talker.userNo = info.serialNo || ''
                            talker.avatar = info.avatar
                            talker.clubId = info.clubId
                            talker.clubName = res.clubName
                            talker.inviteCode = info.inviteCode
                            talker.isAppointment = res.appointment != 'N'
                            talker.isPhoneAppointment = res.phoneAppointment != 'N'
                            talker.telephone = (res.telephone ? res.telephone.split(',') : [])
                            vm.init()
                        })
                    } else {
                        Util.tipShow('未能获取技师信息！')
                        next(false)
                    }
                })
            } else if (!IM.talker.id) { // 如果没有技师id参数，则当做管理者
                next(false)
            } else {
                next(function (vm) {
                    vm.init()
                })
            }
        },
        created: function () {
            var that = this
            if (!that.im.id) {
                Util.tipShow('请您先登录！')
                Global.login(that.$router, 'chat')
            }

            // event on
            eventHub.$on('update-credit-account', that.updateCreditAccount)
            eventHub.$on('start-dice-game', that.startDiceGame)
            eventHub.$on('handler-dice-game', that.doReceiveHandlerDiceGameEvent)
            eventHub.$on('message-wrap-to-bottom', that.scrollToBottom)
        },
        methods: {
            init: function () {
                var that = this
                var global = that.global
                var params = global.currPage.query
                var talker = that.talker
                var im = that.im

                that.clubId = params.clubId || global.clubId
                that.msgWrapHeight = global.winHeight - 8.858 * global.winScale * 16

                // 获取积分系统开关
                Global.getClubSwitches(talker.clubId).then(function (res) {
                    console.log('获取积分系统开关 promise ' + JSON.stringify(res))
                    that.creditConfig = res

                    if (res.creditSwitch) {
                        that.$http.get('../api/v2/credit/gift/list').then(function (giftRes) {
                            giftRes = giftRes.body.respData
                            if (giftRes) {
                                var list = {}
                                for (var i = 0; i < giftRes.length; i++) {
                                    list[giftRes[i]['id']] = {url: giftRes[i]['gifUrl']}
                                }
                                that.giftMapData = list
                                that.gifts = giftRes
                            }
                        })
                        that.updateCreditAccount() // 获取当前账户积分
                    }
                })
                // 获取优惠券数据
                if (talker.userType == 'tech') {
                    that.$http.get('../api/v1/profile/redpack/list', {params: {clubId: talker.clubId}}).then(function (couponRes) {
                        couponRes = couponRes.body
                        if (couponRes.statusCode == 200) {
                            var couponData = couponRes.respData.coupons || []
                            if (couponData.length > 0) {
                                var lastObj = couponData[couponData.length - 1]
                                if (lastObj.actTitle.length > 7) lastObj.actTitle = lastObj.actTitle.substr(0, 7) + '...'
                            }
                            that.coupons = couponData
                        }
                    })
                }

                // 获取消息列表
                var sessionList = IM.getSessionList()
                var messageList = IM.getMessageList(talker.id)
                var sessionObj = sessionList[talker.id]

                if (messageList.list && messageList.list.length != 0) {
                    var msgList = messageList.list
                    var k
                    for (k = msgList.length - 1; k >= msgList.length - that.onceLoadCount && k >= 0; k--) {
                        talker.messageList.unshift(msgList[k])
                    }
                    if (msgList.length <= that.onceLoadCount) {
                        that.isLoadOver = true
                    }
                } else {
                    that.isLoadOver = true
                }
                talker.messageList.push({
                    from: talker.id,
                    to: im.id,
                    type: 'text',
                    data: talker.clubName + '欢迎您！',
                    time: (+new Date())
                })

                that.$nextTick(function () {
                    var wrapList = that.$refs.wrapList
                    if (wrapList) {
                        console.log('init scroll bottom')
                        wrapList.scrollTop = wrapList.scrollHeight - wrapList.clientHeight
                    }
                })

                if (sessionObj) { // 更新新消息数目
                    im.newMsgTotal -= sessionObj.new
                    sessionObj.new = 0
                    Util.localStorage(im.userId + '_SessionList', JSON.stringify(sessionList)) // 存储
                }
            },
            doClickPageBack: function () {
                history.back()
            },
            loadMoreData: function (id) {
                console.log('loadMoreData....' + this.isLoadOver)
                var that = this
                var talker = that.talker
                var im = that.im
                if (!that.isLoadOver) {
                    var loadCount = 0
                    var lastLoadMsgTime = talker.messageList[0].time
                    var list = im.getMessageList(talker.id).list
                    var cursor = list.length - 1
                    while (loadCount < that.onceLoadCount && cursor >= 0) {
                        if (list[cursor].time < lastLoadMsgTime) {
                            loadCount++
                            talker.messageList.unshift(list[cursor])
                        }
                        cursor--
                    }
                    if (loadCount < that.onceLoadCount) {
                        that.isLoadOver = true
                    }
                }
                eventHub.$emit('onTopLoaded', id)
            },
            doClickOrderTip: function () { // 点击预约（提示）
                var that = this
                var talker = that.talker
                if (talker.isAppointment) {
                    that.$router.push({name: 'confirmOrder', query: {techId: talker.userId, clubId: talker.clubId}})
                } else if (talker.isPhoneAppointment) {
                    if (talker.telephone.length == 0) {
                        Util.tipShow('暂无预约电话！')
                    } else {
                        eventHub.$emit('change-tel-detail', true)
                    }
                } else {
                    Util.tipShow('抱歉！当前技师不可预约！')
                }
            },
            doClickHomeIcon: function () { // 点击主页图标
                var that = this
                if (that.global.pageMode == 'club') {
                    that.$router.push({name: 'home'})
                } else {
                    location.href = location.origin + location.pathname + '#/' + that.talker.clubId + '/home'
                    location.reload(true)
                }
            },
            updateCreditAccount: function (callback) { // 更新当前账户积分
                var that = this
                var talker = that.talker
                Global.getCreditAccount(talker.clubId).then(function (res) {
                    that.currIntegralAccount = (res[0] ? res[0].amount : 0)
                    if (callback) callback()
                })
            },
            startDiceGame: function (amount) {
                var that = this
                var talker = that.talker
                var im = that.im
                that.$http.get('../api/v2/credit/game/dice/submit', {
                    params: {
                        clubId: talker.clubId,
                        amount: amount + '',
                        emchatId: talker.id
                    }
                }).then(function (res) {
                    res = res.body
                    console.log('startDiceGame：' + JSON.stringify(res))
                    if (res.statusCode == 200) {
                        res = res.respData
                        IM.sendTextMessage({
                            to: talker.id,
                            msg: amount + '',
                            ext: {
                                msgType: 'diceGame',
                                gameStatus: 'request',
                                gameInvite: im.id,
                                gameId: 'dice_' + res.gameId,
                                gameResult: '0:0'
                            }
                        }, talker)
                    } else {
                        Util.tipShow(res.msg || '游戏创建失败！')
                    }
                    that.updateCreditAccount()
                })
            },
            doReceiveHandlerDiceGameEvent: function (option) {
                console.log('handler dice game')
                console.dir(option)
                var that = this
                var talker = that.talker
                var game = option.game
                var talkerMessageList = talker.messageList
                var k = talkerMessageList.length - 1
                var messageObj
                var item

                // 先找到gameid一致的messageObj
                for (; k >= 0; k--) {
                    item = talkerMessageList[k]
                    if (item.msgType == 'diceGame' && item.gameId == game.id && item.gameStatus == 'request') {
                        messageObj = item
                        break
                    }
                }

                if (messageObj) {
                    if (option.ope == 'accept') { // 接受对方游戏邀请
                        // 查询当前账户积分
                        that.updateCreditAccount(function () {
                            if (parseInt(game.value) > that.currIntegralAccount) { // 积分不足
                                eventHub.$emit('set-credit-tip', {amount: game.value, show: true, tipType: 'game'})
                            } else {
                                that.doHandlerDiceGame(option, messageObj)
                            }
                        })
                    } else {
                        that.doHandlerDiceGame(option, messageObj)
                    }
                }
            },
            doHandlerDiceGame: function (option, messageObj) {
                console.log('doHandlerDiceGame...... messageObj')
                console.dir(messageObj)
                var that = this
                var game = option.game
                if ((+new Date()) - messageObj.time > that.creditConfig.diceGameTimeout) { // 超时
                    option.ope = 'overtime'
                    that.doHandlerSendGameStatus(option, messageObj)
                } else { // 接受、拒绝、取消
                    that.$http.get('../api/v2/credit/game/dice/accept', {
                        params: {
                            gameId: game.id.substr(5),
                            status: option.ope
                        }
                    }).then(function (res) {
                        res = res.body
                        if (res.statusCode == 200) {
                            res = res.respData
                            that.doHandlerSendGameStatus(option, messageObj, res)
                        } else {
                            Util.tipShow(res.msg || '处理游戏操作异常！')
                            if (option.ope == 'accept') {
                                option.ope = 'overtime'
                                that.doHandlerSendGameStatus(option, messageObj)
                            }
                        }
                    })
                }
            },
            doHandlerSendGameStatus: function (option, messageObj, res) {
                var that = this
                var talker = that.talker
                var im = that.im
                var game = option.game
                var messageList = im.getMessageList(talker.id)

                if (option.ope == 'overtime') {
                    messageObj.gameStatus = option.ope
                    Util.localStorage(im.userId + '_MsgList_' + talker.id, JSON.stringify(messageList))
                } else {
                    im.sendTextMessage({
                        to: talker.id,
                        msg: messageObj.data,
                        ext: {
                            msgType: 'diceGame',
                            gameInvite: messageObj.gameInvite,
                            gameStatus: option.ope,
                            gameId: messageObj.gameId,
                            gameResult: '0:0'
                        }
                    }, talker, function () {
                        messageObj.gameStatus = option.ope
                        Util.localStorage(im.userId + '_MsgList_' + talker.id, JSON.stringify(messageList))

                        // 接受了对方的邀请，发送游戏结果
                        if (res && res.status == 'accept') {
                            // console.log('接受了对方的邀请，发送游戏结果：'+res.srcPoint+':'+res.dstPoint);
                            im.needShowEffectDiceGames[game.id] = true
                            im.sendTextMessage({
                                to: talker.id,
                                msg: res.belongingsAmount + '',
                                ext: {
                                    msgType: 'diceGame',
                                    gameStatus: 'over',
                                    gameInvite: talker.id,
                                    gameId: game.id,
                                    gameResult: res.srcPoint + ':' + res.dstPoint
                                }
                            }, talker)
                        }
                    }, false)
                }
            },
            scrollToBottom: function () {
                var that = this
                var wrapList = that.$refs.wrapList
                if (!wrapList) return
                var bottom = wrapList.scrollHeight - wrapList.clientHeight

                var timer = setInterval(function () {
                    wrapList.scrollTop += 10
                    if (wrapList.scrollTop >= bottom) {
                        clearInterval(timer)
                    }
                }, 10)
            }
        },
        beforeDestroy: function () { // 销毁数据
            var that = this
            var talker = that.talker

            talker.id = '' // 置空talker id
            talker.messageList = []
            eventHub.$off('update-credit-account', that.updateCreditAccount)
            eventHub.$off('start-dice-game', that.startDiceGame)
            eventHub.$off('handler-dice-game', that.doReceiveHandlerDiceGameEvent)
            eventHub.$off('message-wrap-to-bottom', that.scrollToBottom)
        }
    }
</script>