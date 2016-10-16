<style>
    @import '../styles/components/chatInput.css';
</style>
<template>
    <div class="chat-input-wrap">
        <div class="input">
            <div contenteditable="true" ref="txtInput" @focus="onTextInputFocus()" @blur="onTextInputBlur()" @click="onClickOfTextInput($event)" @input="onInputOfText()"></div>
            <span v-show="showInputTip" @click="onClickInputTip()">在此输入...</span>
            <a :class="sendBtnStatus">发送</a>
        </div>
        <div class="menu">
            <div class="pic"><form><input name="file" type="file" accept="image/*"/></form></div>
            <div class="expression" ref="expressionBtn"></div>
            <div class="reward" @click="doClickRewardBtn()"></div>
            <div class="coupon" @click="doClickCouponBtn()" :class="{ active : showCoupons }">
                <ul>
                    <li v-for="(item,index) in coupons" @click="doClickCouponItem(item)"><i v-if="index==coupons.length-1"></i><i v-if="index==coupons.length-1"></i>{{ item.actTitle }}</li>
                </ul>
            </div>
            <div class="dice" @click="doClickDiceBtn()" v-show="creditConfig.diceGameSwitch && talker.userType=='tech'"></div>
            <div class="gift" v-show="creditConfig.creditSwitch"></div>
        </div>
        <swipe class="exp-swipe" :auto="24*60*60*1000" v-show="showExpression">
            <swipe-item class="exp-wrap-0"><div v-for="exp in exps[0]" @doSelectedExp($event)><div></div></div></swipe-item>
            <swipe-item class="exp-wrap-1"><div v-for="exp in exps[1]" @doSelectedExp($event)><div></div></div></swipe-item>
        </swipe>
        <div class="gift-list" v-show="showGiftList">
            <div class="list" :style="{ width : gifts.length*5+'rem' }">
                <div class='gift-item' @click="doClickGift(gift)" v-for="gift in gifts">
                    <i></i>
                    <img :src='gift.iconUrl'/>
                    <div><span>gift.ratio</span>积分</div>
                </div>
            </div>
            <div class="info"><span>*</span>&nbsp;当前剩余<b>{{ currIntegralAccount }}</b>积分</div>
        </div>
    </div>
</template>

<script>
    import { Global } from '../libs/global';
    import { IM } from '../libs/im';
    import { eventHub } from '../libs/hub';
    import Util from "../libs/util";
    import Swipe from './swipe';
    import SwipeItem from './swipe-item';

    module.exports = {
        components: {
            'swipe' : Swipe,
            'swipe-item' : SwipeItem
        },
        data: function(){
            return {
                global : Global.data,
                im : IM,
                talker : IM.talker,
                exps : [[],[]],
                lastSelection : { node : null, offset : null },
                showExpression : false, //显示表情区域
                showGiftList : false, //显示积分礼物区域
                initHeight : 0,
                showInputTip : true, //显示在此输入的提示语
                isTxtInputFocus : false,
                initDelay : 500,
                sendBtnStatus : "disabled", //发送按钮的状态
                currIntegralAccount : 0, //当前账户积分

                coupons : [],
                showCoupons : false
            };
        },
        props : [ 'creditConfig','gifts'],
        created : function(){
            var i = 0,  _this = this, global = _this.global, im = _this.im, talker = _this.talker;

            /////////////////////////////////////////构造exps
            for(var item in im.expression){
                _this.exps[parseInt(i/14)].push(item);
                i++;
            }

            /////////////////////////////////////////获取优惠券
            if(talker.userType == "tech"){
                _this.$http.get("../api/v1/profile/redpack/list",{ params : { clubId : talker.clubId }}).then(function(res){
                    res = res.body;
                    if(res.statusCode == 200){
                        var couponData= res.respData.coupons || [];
                        if(couponData.length>0){
                            var lastObj = couponData[couponData.length-1];
                            if(lastObj.actTitle.length>7) lastObj.actTitle = lastObj.actTitle.substr(0,7)+"...";
                        }
                        _this.coupons = couponData;
                    }
                });
            }

            //////on events
            eventHub.$on("update-credit-account",_this.updateCreditAccount);

            _this.initHeight = global.winHeight;
        },
        methods: {
            doClickRewardBtn : function(){//点击打赏按钮
                var _this = this, global = _this.global;
                _this.changeToolClosed("reward");
                if(global.userAgent.isWX){
                    _this.$router.push({ name : 'techReward' , query : { techId : _this.talker.userId }});
                }
                else if(Global.checkAccess("techReward")){
                    Util.tipShow('请打开微信登录"9358"公众号！');
                }
            },


            changeToolClosed : function(type){

            },

            /*
             输入框的on focus
             */
            onTextInputFocus : function(){
                var _this = this, global = _this.global, txtInput = _this.$refs.txtInput;
                if(txtInput.innerHTML.length == 0){
                    _this.showInputTip = false;
                }
                ///scrollerToBottom
                _this.isTxtInputFocus = true;
                if(global.userAgent.isiPhone){
                    setTimeout(function(){
                        _this.$refs.expressionBtn.scrollIntoView(true);
                        _this.initDelay = 300;
                    },_this.initDelay)
                }
                else{
                    setTimeout(function(){
                        if(_this.initHeight - global.winHeight < 100){
                            txtInput.scrollIntoView(true);
                        }
                    },500)
                }

              /*  if(giftDiv.ClassHave("active")){
                    doGiftBtnClick();
                }*/
            },

            /*
             输入框的on blur
             */
            onTextInputBlur : function(){
                var _this = this, txtInput = _this.$refs.txtInput;
                if(txtInput.innerHTML.replace(/<br>/,'').length == 0){
                    txtInput.innerHTML = "";
                    _this.showInputTip = true;
                    _this.sendBtnStatus = "disabled";
                }
                _this.isTxtInputFocus = false;

              /*  setTimeout(function () {
                    $('#content')[0].scrollIntoView();
                },300);*/
            },

            /*
            输入框的 on click
            */
            onClickOfTextInput : function(event){
                var _this = this, txtInput = _this.$refs.txtInput;
                if (event.target.tagName.toLowerCase() == "img") {
                    var currNode = event.target, pNode = currNode.parentNode, currIndex;
                    for (var j = 0; j < pNode.childNodes.length; j++) {
                        if (currNode == pNode.childNodes[j]) {
                            currIndex = j + 1;
                            break;
                        }
                    }
                    if (document.createRange && window.getSelection && currIndex) {
                        _this.setCursorPosition(pNode, currIndex);
                    }
                }
                var sel = window.getSelection();
                _this.lastSelection.node = sel.focusNode;
                _this.lastSelection.offset = sel.focusOffset;

                /*if(giftDiv.ClassHave("active")){
                    doGiftBtnClick();
                    txtInput[0].focus();
                }*/
            },

            /*
             输入框的on input
             */
            onInputOfText : function(){
                var _this = this, txtInput = _this.$refs.txtInput;
                if(txtInput.innerHTML.length == 0){
                    _this.sendBtnStatus = "disabled";
                }
                else{
                    _this.sendBtnStatus = "";
                }
                var lastSelection = _this.lastSelection, sel = window.getSelection();
                lastSelection.node = sel.focusNode;
                lastSelection.offset = sel.focusOffset;
            },

            /*
             点击输入提示
             */
            onClickInputTip : function(){
                var _this = this;
                _this.showInputTip = false;
                _this.$refs.txtInput.focus();
            },

            /*
             设定光标的位置
            */
            setCursorPosition : function(pNode, cursorIndex){
                var _this = this,
                        range = document.createRange(),
                        selection = window.getSelection();

                range.selectNodeContents(pNode);
                range.collapse(true);
                range.setEnd(pNode, cursorIndex);
                range.setStart(pNode, cursorIndex);
                selection.removeAllRanges();
                selection.addRange(range);
                _this.lastSelection.offset = cursorIndex;
                _this.lastSelection.node = pNode;
            },

            /*
             递归检查当前节点是否在div.input节点下(上溯4层)
             */
            isFocusInText : function(node, layer){
                var _this = this;
                if (!node || layer > 4) return false;
                if (node == _this.$refs.txtInput) return true;
                else {
                    node = node.parentNode;
                    return _this.isFocusInText(node, layer + 1);
                }
            },

            /*
             选择表情的时候
             */
            doSelectedExp : function(event){
                var _this = this, lastSelection = _this.lastSelection, item = event.target, txtInput = _this.$refs.txtInput;
                if (lastSelection.node && _this.isFocusInText(lastSelection.node)) {
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

                    if (txtInput.innerHTML != "") {
                        _this.showInputTip = false;
                        _this.sendBtnStatus = "";
                    }
                    else{
                        _this.showInputTip = true;
                        _this.sendBtnStatus = "disabled";
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
                            if(_this.isTxtInputFocus) _this.setCursorPosition(parentNode, cursorIndex);
                            else{
                                lastSelection.offset = cursorIndex;
                                lastSelection.node = parentNode;
                            }
                        }
                    }
                }
            },

            /*
             点击骰子图标按钮
             */
            doClickDiceBtn : function(){
                this.changeToolClosed("dice");
                this.doBeforeDiceGame();
            },

            doBeforeDiceGame : function(amount){
                var _this = this, talker = _this.talker;
                Global.getCreditAccount(talker.clubId,function(res){
                    _this.currIntegralAccount = (res[0] ? res[0].amount : 0);
                    if(parseInt(_this.currIntegralAccount)<=0 || (amount && parseInt(amount)>parseInt(_this.currIntegralAccount))){
                        eventHub.$emit("set-credit-tip",{ amount : amount || "", show : true, tipType : "game" });
                    }
                    else if(amount){
                        _this.doStartDiceGame(amount);
                    }
                    else{
                        eventHub.$on("change-dice-setting",true);
                    }
                });
            },

            doStartDiceGame : function(amount){

            },

            doClickCouponItem : function(couponData){
                var _this = this, talker = _this.talker;
                if(couponData.couponType == "paid"){//点钟券
                    _this.$router.push({ name : "paidCoupon", query : {
                        actId : couponData.actId,
                        techCode : talker.inviteCode
                    }});
                }
                else{//优惠券
                    /*if(!$.$.userTel){
                        $.$.loginUrl = location.hash.substring(1).replace(/^\//, '').replace(/\/$/, '');
                        $.bindPhone(true);
                        //$.page($.$.loginUrl.replace(/\/[^\/]*$/, '/bindPhone'), 1, true, true);
                        return false;
                    }*/

                    /*$.ajax({////////领取
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
                        }});*/
                }
            },

            /*
            点击优惠券图标
             */
            doClickCouponBtn : function(){
                var _this = this;
                _this.changeToolClosed("coupon");

                if(_this.coupons.length == 0){
                    Util.tipShow("抱歉！暂无优惠券！");
                }
                else{
                    _this.showCoupons = !_this.showCoupons;
                }
            },

            /*
            更新当前账户积分
             */
            updateCreditAccount : function(){
                var _this = this, talker = _this.talker;
                Global.getCreditAccount(talker.clubId,function(res){
                    _this.currIntegralAccount = (res[0] ? res[0].amount : 0);
                });
            },

            /*
            点击礼物
             */
            doClickGift : function(gift){

            }
        },
        beforeDestroy : function(){
            eventHub.$off("update-credit-account",this.updateCreditAccount);
        }
    }
</script>