<style>
    @import '../styles/components/chatInput.css';
</style>
<template>
    <div class="chat-input-wrap">
        <div class="input">
            <div contenteditable="true" ref="txtInput" @focus="onTextInputFocus()" @blur="onTextInputBlur()" @click="onClickOfTextInput($event)" @input="onInputOfText()"></div>
            <span v-show="showInputTip" @click="onClickInputTip()">在此输入...</span>
            <a :class="sendBtnStatus" @click="doClickSendBtn()">发送</a>
        </div>
        <div class="menu">
            <div class="pic">
                <form><input type="file" accept="image/*" ref="imgFile" @change="doChangeFileInput()"/></form>
            </div>
            <div class="expression" :class="{ active : showExpression }" @click="doClickExpressionBtn()" ref="expressionBtn"></div>
            <div class="reward" @click="doClickRewardBtn()" v-show="talker.userType=='tech'"></div>
            <div class="coupon" @click="doClickCouponBtn()" :class="{ active : showCoupons }" v-show="talker.userType=='tech'">
                <ul>
                    <li v-for="coupon in coupons" @click="doClickCouponItem(coupon)">{{ coupon.actTitle }}</li>
                </ul>
            </div>
            <div class="dice" v-show="creditConfig.diceGameSwitch && talker.userType=='tech'" @click="doClickDiceBtn()"></div>
            <div class="gift" v-show="creditConfig.creditSwitch" @click="doClickGiftBtn()" :class="{ active : showGiftList }"></div>
        </div>
        <swipe class="exp-swipe" :auto="24*60*60*1000" v-show="showExpression">
            <swipe-item class="exp-wrap-0">
                <div v-for="exp in exps[0]" @click="doSelectedExp($event)">
                    <div :data-exp="exp"></div>
                </div>
            </swipe-item>
            <swipe-item class="exp-wrap-1">
                <div v-for="exp in exps[1]" @click="doSelectedExp($event)">
                    <div :data-exp="exp"></div>
                </div>
            </swipe-item>
        </swipe>
        <div class="gift-list" v-show="showGiftList">
            <div class="list" :style="{ width : gifts.length*5+'rem' }">
                <div class='gift-item' @click="doClickGiftItem(gift)" v-for="gift in gifts" :class="{ active : currSelectGift == gift }">
                    <i></i>
                    <img :src='gift.iconUrl'/>
                    <div><span>{{ gift.ratio }}</span>积分</div>
                </div>
            </div>
            <div class="info"><span>*</span>&nbsp;当前剩余<b>{{ integralAccount }}</b>积分</div>
        </div>
    </div>
</template>

<script>
    import { Global } from '../libs/global'
    import { IM } from '../libs/im'
    import { eventHub } from '../libs/hub'
    import Util from '../libs/util'

    module.exports = {
        data: function () {
            return {
                global: Global.data,
                im: IM,
                talker: IM.talker,
                exps: [[], []], // 表情数据
                lastSelection: {node: null, offset: null},
                initHeight: 0,
                initDelay: 500,
                divNode: document.createElement('div'), // 用于表情图片转文本

                showExpression: false, // 显示表情区域
                showGiftList: false, // 显示积分礼物区域
                showInputTip: true, // 显示在此输入的提示语
                isTxtInputFocus: false,
                showCoupons: false, // 显示优惠券列表

                sendBtnStatus: 'disabled', // 发送按钮的状态
                currSelectGift: null // 当前选择的积分礼物
            }
        },
        computed: {
            integralAccount: function () { // 当前账户积分
                return this.currIntegralAccount
            }
        },
        props: {
            creditConfig: { // 系统积分配置
                type: Object
            },
            gifts: { // 积分礼物数据
                type: Array,
                default: []
            },
            coupons: { // 优惠券数据
                type: Array,
                default: []
            },
            currIntegralAccount: { // 当前账户积分
                type: Number,
                default: 0
            }
        },
        created: function () {
            var i = 0
            var that = this
            var global = that.global
            var im = that.im

            // 构造exps
            for (var item in im.expression) {
                that.exps[parseInt(i / 14)].push(item)
                i++
            }
            that.initHeight = global.winHeight

            // event on
            eventHub.$on('goto-reward-tech', that.doClickRewardBtn) // 跳转到打赏页面
            eventHub.$on('before-dice-game', that.doBeforeDiceGame)
        },
        methods: {
            /*
             点击打赏按钮
             */
            doClickRewardBtn: function () {
                var that = this
                var global = that.global
                that.changeToolClosed('reward')
                if (global.userAgent.isWX) {
                    that.$router.push({name: 'techReward', query: {techId: that.talker.userId}})
                } else if (Global.checkAccess('techReward')) {
                    Util.tipShow('请打开微信登录"9358"公众号！')
                }
            },

            /*
             输入框的on focus
             */
            onTextInputFocus: function () {
                var that = this
                var global = that.global
                var txtInput = that.$refs.txtInput
                if (txtInput.innerHTML.length == 0) {
                    that.showInputTip = false
                }
                // scrollerToBottom
                that.isTxtInputFocus = true
                if (global.userAgent.isiPhone) {
                    setTimeout(function () {
                        that.$refs.expressionBtn.scrollIntoView(true)
                        that.initDelay = 300
                    }, that.initDelay)
                } else {
                    setTimeout(function () {
                        if (that.initHeight - global.winHeight < 100) {
                            txtInput.scrollIntoView(true)
                        }
                    }, 500)
                }

                /* if(giftDiv.ClassHave('active')){
                 doGiftBtnClick()
                 } */
            },

            /*
             输入框的on blur
             */
            onTextInputBlur: function () {
                var that = this
                var txtInput = that.$refs.txtInput
                if (txtInput.innerHTML.replace(/<br>/, '').length == 0) {
                    txtInput.innerHTML = ''
                    that.showInputTip = true
                    that.sendBtnStatus = 'disabled'
                }
                that.isTxtInputFocus = false

                /* setTimeout(function () {
                 $('#content')[0].scrollIntoView();
                 },300); */
            },

            /*
             输入框的 on click
             */
            onClickOfTextInput: function (event) {
                var that = this
                if (event.target.tagName.toLowerCase() == 'img') {
                    var currNode = event.target
                    var pNode = currNode.parentNode
                    var currIndex
                    for (var j = 0; j < pNode.childNodes.length; j++) {
                        if (currNode == pNode.childNodes[j]) {
                            currIndex = j + 1
                            break
                        }
                    }
                    if (document.createRange && window.getSelection && currIndex) {
                        that.setCursorPosition(pNode, currIndex)
                    }
                }
                var sel = window.getSelection()
                that.lastSelection.node = sel.focusNode
                that.lastSelection.offset = sel.focusOffset

                /* if(giftDiv.ClassHave('active')){
                 doGiftBtnClick()
                 txtInput[0].focus()
                 } */
            },

            /*
             输入框的on input
             */
            onInputOfText: function () {
                var that = this
                var txtInput = that.$refs.txtInput
                if (txtInput.innerHTML.length == 0) {
                    that.sendBtnStatus = 'disabled'
                } else {
                    that.sendBtnStatus = ''
                }
                var lastSelection = that.lastSelection
                var sel = window.getSelection()
                lastSelection.node = sel.focusNode
                lastSelection.offset = sel.focusOffset
            },

            /*
             点击输入提示
             */
            onClickInputTip: function () {
                var that = this
                that.showInputTip = false
                that.$refs.txtInput.focus()
            },

            /*
             设定光标的位置
             */
            setCursorPosition: function (pNode, cursorIndex) {
                var that = this
                var range = document.createRange()
                var selection = window.getSelection()

                range.selectNodeContents(pNode)
                range.collapse(true)
                range.setEnd(pNode, cursorIndex)
                range.setStart(pNode, cursorIndex)
                selection.removeAllRanges()
                selection.addRange(range)
                that.lastSelection.offset = cursorIndex
                that.lastSelection.node = pNode
            },

            /*
             递归检查当前节点是否在div.input节点下(上溯4层)
             */
            isFocusInText: function (node, layer) {
                var that = this
                if (!node || layer > 4) return false
                if (node == that.$refs.txtInput) return true
                else {
                    node = node.parentNode
                    return that.isFocusInText(node, layer + 1)
                }
            },

            /*
             点击表情按钮
             */
            doClickExpressionBtn: function () {
                var that = this
                var txtInput = that.$refs.txtInput
                var lastSelection = that.lastSelection
                if (!that.showExpression) {
                    that.changeToolClosed('expression')
                    lastSelection.offset = txtInput.childNodes.length
                    lastSelection.node = txtInput
                }
                that.showExpression = !that.showExpression
                // scrollerToBottom();
            },

            /*
             选择表情的时候
             */
            doSelectedExp: function (event) {
                var that = this
                var lastSelection = that.lastSelection
                var item = event.currentTarget
                var txtInput = that.$refs.txtInput

                if (lastSelection.node && that.isFocusInText(lastSelection.node)) {
                    var expressionNode = item.children[0] // 选择的表情节点
                    var oldNode
                    var newNode
                    var currNode
                    var nodeText
                    var nextSibling
                    var cursorIndex
                    var splitNode

                    newNode = document.createElement('img')
                    var imgData = window.getComputedStyle(expressionNode, null)['backgroundImage']
                    if (imgData.charAt(4) == '"' || imgData.charAt(4) == '\'') {
                        imgData = imgData.slice(5, -2)
                    } else {
                        imgData = imgData.slice(4, -1)
                    }
                    newNode.src = imgData
                    newNode.setAttribute('data-exp', expressionNode.getAttribute('data-exp'))
                    if (lastSelection.node.nodeType == 3) { // 在文本节点中插入表情
                        oldNode = lastSelection.node
                        if (lastSelection.offset == 0) { // 在文本节点之前插入img节点
                            oldNode.parentNode.insertBefore(newNode, oldNode)
                        } else if (lastSelection.offset == oldNode.nodeValue.length) { // 在文本节点之后插入img节点
                            if (oldNode.nextSibling) { // 当前文本节点是否还有下一个兄弟节点
                                oldNode.parentNode.insertBefore(newNode, oldNode.nextSibling)
                            } else {
                                oldNode.parentNode.appendChild(newNode)
                            }
                        } else { // 原文本节点被img节点截断成两个节点
                            nodeText = oldNode.nodeValue
                            oldNode.nodeValue = nodeText.substr(0, lastSelection.offset)
                            nextSibling = oldNode.nextSibling
                            if (nextSibling) { // 当前文本节点是否还有下一个兄弟节点
                                oldNode.parentNode.insertBefore(newNode, nextSibling)
                                splitNode = document.createTextNode(nodeText.substr(lastSelection.offset))
                                oldNode.parentNode.insertBefore(splitNode, nextSibling)
                            } else { // 直接append到最后
                                oldNode.parentNode.appendChild(newNode)
                                splitNode = document.createTextNode(nodeText.substr(lastSelection.offset))
                                oldNode.parentNode.appendChild(splitNode)
                            }
                        }
                    } else if (lastSelection.node.nodeType == 1) { // div节点
                        if (lastSelection.offset == lastSelection.node.childNodes.length) {
                            lastSelection.node.appendChild(newNode)
                        } else {
                            currNode = lastSelection.node.childNodes[lastSelection.offset]
                            lastSelection.node.insertBefore(newNode, currNode)
                        }
                    }

                    if (txtInput.innerHTML != '') {
                        that.showInputTip = false
                        that.sendBtnStatus = ''
                    } else {
                        that.showInputTip = true
                        that.sendBtnStatus = 'disabled'
                    }

                    // 将光标定位到当前newNode之后
                    if (document.createRange) {
                        var parentNode = newNode.parentNode
                        for (var j = 0; j < parentNode.childNodes.length; j++) {
                            if (parentNode.childNodes[j] == newNode) {
                                cursorIndex = j + 1
                                break
                            }
                        }
                        if (cursorIndex) {
                            if (that.isTxtInputFocus) {
                                that.setCursorPosition(parentNode, cursorIndex)
                            } else {
                                lastSelection.offset = cursorIndex
                                lastSelection.node = parentNode
                            }
                        }
                    }
                }
            },

            /*
             点击骰子图标按钮
             */
            doClickDiceBtn: function () {
                this.changeToolClosed('dice')
                this.doBeforeDiceGame()
            },

            doBeforeDiceGame: function (amount) {
                var that = this
                var talker = that.talker
                Global.getCreditAccount(talker.clubId).then(function (res) {
                    that.integralAccount = (res[0] ? res[0].amount : 0)
                    if (parseInt(that.integralAccount) <= 0 || (amount && parseInt(amount) > parseInt(that.integralAccount))) {
                        eventHub.$emit('set-credit-tip', {amount: amount || '', show: true, type: 'game'})
                    } else if (amount) {
                        console.log('start-dice-game：' + amount)
                        eventHub.$emit('start-dice-game', amount)
                    } else {
                        console.log('show-dice-setting')
                        eventHub.$emit('change-dice-setting', {show: true, integralAccount: that.integralAccount})
                    }
                })
            },

            doClickCouponItem: function (couponData) {
                var that = this
                var talker = that.talker
                if (couponData.couponType == 'paid') { // 点钟券
                    that.$router.push({
                        name: 'paidCoupon',
                        query: {
                            actId: couponData.actId,
                            techCode: talker.inviteCode
                        }
                    })
                } else { // 优惠券
                    /* if(!$.$.userTel){
                     $.$.loginUrl = location.hash.substring(1).replace(/^\//, '').replace(/\/$/, '');
                     $.bindPhone(true);
                     //$.page($.$.loginUrl.replace(/\/[^\/]*$/, '/bindPhone'), 1, true, true);
                     return false;
                     } */

                    /* $.ajax({//////// 领取
                     url: ($.$.clubID ? '../' : '')+'get/redpacket',
                     data: {
                     actId: item.getAttribute('actId'),
                     phoneNum: $.$.userTel,
                     openId: $.$.openId,
                     userCode : '',
                     techCode : item.getAttribute('techCode'),
                     chanel : 'link'
                     },
                     success: function (res) {
                     //console.log('领取优惠券的返回：'+JSON.stringify(res));
                     if(res.statusCode==200){
                     $.tipShow('成功领取一张优惠券！');
                     var getCouponMsgObj = {
                     from: eb.userId,
                     to: currChatTech.chatId,
                     data: '您领取了'+currChatTech.name+'的''+item.getAttribute('actTitle')+''',
                     ext: { name: currChatTech.name, header: currChatTech.header, avatar: currChatTech.avatar, no: currChatTech.no, techId: currChatTech.techId, clubId: currChatTech.clubId, msgType: 'couponTip' },
                     status : 1
                     };

                     eb.conn.send({
                     to: currChatTech.chatId,
                     msg: item.getAttribute('actTitle'),
                     type: 'chat',
                     ext: { name: chatName, header: chatHeader, msgType: 'couponTip', time: Date.now() , avatar : $.$.userAvatar },
                     success: function(){
                     $.sendFriend(currChatTech.chatId,'coupon',isManager?'manager':'tech');
                     $.addMsgDiv(getCouponMsgObj,'couponTip',false,true,false);
                     $.updateSessionList(getCouponMsgObj, 'text', false);
                     $.addToMsgList(getCouponMsgObj, 'text');
                     }
                     });
                     }
                     else{
                     $.tipShow(res.msg || '未能成功领取优惠券！');
                     }
                     }}); */
                }
            },

            /*
             点击优惠券图标
             */
            doClickCouponBtn: function () {
                var that = this
                that.changeToolClosed('coupon')

                if (that.coupons.length == 0) {
                    Util.tipShow('抱歉！暂无优惠券！')
                } else {
                    that.showCoupons = !that.showCoupons
                }
            },

            /*
             点击礼物
             */
            doClickGiftItem: function (gift) {
                var that = this
                var txtInput = that.$refs.txtInput
                if (that.currSelectGift == gift) {
                    that.currSelectGift = null
                    that.showInputTip = true
                    txtInput.innerHTML = ''
                    that.sendBtnStatus = 'disabled'
                } else {
                    that.currSelectGift = gift
                    txtInput.innerHTML = '[礼物：' + gift.name + ']'
                    that.showInputTip = false
                    that.sendBtnStatus = ''
                }
            },

            /*
             点击积分礼物按钮
             */
            doClickGiftBtn: function () {
                var that = this
                var txtInput = that.$refs.txtInput
                if (that.gifts.length == 0) {
                    return Util.tipShow('当前无积分礼物可发送！')
                }
                if (that.showGiftList) {
                    txtInput.innerHTML = ''
                } else {
                    that.changeToolClosed('gift')
                }
                that.showGiftList = !that.showGiftList
                // scrollerToBottom()
            },

            /*
             image input 发送图片按钮
             */
            doChangeFileInput: function () {
                var that = this
                var imgFile = that.$refs.imgFile
                var file = imgFile.files[0]

                that.changeToolClosed('pic')
                if (file.size > 10 * 1024 * 1024) {
                    return Util.tipShow('抱歉！所选图片超过10M，太大无法发送！')
                }
                var fileName = file.name
                var dotIndex = fileName.lastIndexOf('.')
                var fileType
                if (dotIndex < 0) return
                fileType = fileName.substring(dotIndex + 1)
                if (!/^(jpg|jpeg|gif|png|bmp)$/i.test(fileType)) {
                    return Util.tipShow('请选择图片进行发送！')
                }
                var fileObj = WebIM.utils.getFileUrl(imgFile)
                if (!fileObj.url || fileObj.url.length == 0) {
                    return
                }
                IM.sendPicMessage(fileObj, file, that.talker)
            },

            changeToolClosed: function (type) {
                var that = this
                if (type != 'expression') {
                    that.showExpression = false
                }
                if (type != 'coupon') {
                    that.showCoupons = false
                }
                if (type != 'gift') {
                    that.showGiftList = false
                    that.currSelectGift = null
                    that.showInputTip = true
                    that.$refs.txtInput.innerHTML = ''
                    that.sendBtnStatus = 'disabled'
                }
            },

            /*
             点击发送按钮
             */
            doClickSendBtn: function () {
                var that = this
                var talker = that.talker
                if (that.sendBtnStatus == 'disabled') return
                if (that.showGiftList && that.currSelectGift) { // 发送积分礼物
                    var giftVal = that.currSelectGift.ratio || 0
                    if (giftVal > 0) {
                        Global.getCreditAccount(talker.clubId).then(function (res) {
                            that.integralAccount = parseInt(res[0] ? res[0].amount : 0)
                            if (that.integralAccount <= 0 || giftVal > that.integralAccount) {
                                eventHub.$emit('set-credit-tip', {amount: giftVal, show: true, tipType: 'gift'})
                            } else {
                                that.sendGift()
                            }
                        })
                    } else {
                        that.sendGift()
                    }
                } else {
                    that.sendText()
                }
            },

            /*
             发送礼物
             */
            sendGift: function () {
                console.log('发送礼物')
                console.dir(this.currSelectGift)
                var that = this
                var talker = that.talker
                var txtInput = that.$refs.txtInput
                var currSelectGift = that.currSelectGift
                var lastSelection = that.lastSelection

                txtInput.innerHTML = ''
                that.sendBtnStatus = 'disabled'
                IM.sendTextMessage({
                    to: talker.id,
                    msg: '[礼物：' + currSelectGift.name + ']',
                    ext: {
                        msgType: 'gift',
                        giftValue: currSelectGift.ratio,
                        giftName: currSelectGift.name,
                        giftId: currSelectGift.id
                    }
                }, talker, function () {
                    that.$http.get('../api/v2/credit/gift/send', {
                        params: {
                            clubId: talker.clubId,
                            emchatId: talker.id,
                            giftId: currSelectGift.id,
                            num: 1
                        }
                    }).then(function (res) {
                        res = res.body
                        that.currSelectGift = null
                        if (res.statusCode == 200) {
                            console.log('更新当前积分值')
                            eventHub.$emit('update-credit-account')
                        } else {
                            Util.tipShow(res.msg || '礼物发送失败！')
                        }
                    })
                })

                lastSelection.node = txtInput
                lastSelection.offset = 0
            },

            /*
             发送普通文本消息
             */
            sendText: function () {
                console.log('发送文本')
                var that = this
                var talker = that.talker
                var txtInput = that.$refs.txtInput
                var lastSelection = that.lastSelection
                var divNode = that.divNode

                divNode.innerHTML = txtInput.innerHTML.replace(/<\/div>/g, '').replace(/<div>/g, '<br/>')
                var imgNodes = divNode.getElementsByTagName('img')
                var textNode
                var imgNodesLen = imgNodes.length
                for (var i = imgNodesLen - 1; i >= 0; i--) {
                    textNode = document.createTextNode(imgNodes[i].getAttribute('data-exp'))
                    divNode.replaceChild(textNode, imgNodes[i])
                }
                if (divNode.innerHTML.length > 1000) {
                    return Util.tipShow('您输入的太多了，无法发送！')
                }
                if (divNode.innerHTML.length != imgNodesLen * 4) txtInput.focus()
                txtInput.innerHTML = ''
                that.sendBtnStatus = 'disabled'

                IM.sendTextMessage({
                    to: talker.id,
                    msg: divNode.innerHTML,
                    ext: {}
                }, talker)

                lastSelection.node = txtInput
                lastSelection.offset = 0
            }
        },
        beforeDestroy: function () {
            var that = this
            eventHub.$off('goto-reward-tech', that.doClickRewardBtn)
            eventHub.$off('before-dice-game', that.doBeforeDiceGame)
        }
    }
</script>
