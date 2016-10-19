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
            <div class="pic"><form><input type="file" accept="image/*" ref="imgFile" @change="doChangeFileInput()"/></form></div>
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
            <swipe-item class="exp-wrap-0"><div v-for="exp in exps[0]" @click="doSelectedExp($event)"><div :data-exp="exp"></div></div></swipe-item>
            <swipe-item class="exp-wrap-1"><div v-for="exp in exps[1]" @click="doSelectedExp($event)"><div :data-exp="exp"></div></div></swipe-item>
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
                exps : [[],[]], //表情数据
                lastSelection : { node : null, offset : null },
                initHeight : 0,
                initDelay : 500,
                divNode : document.createElement("div"),//用于表情图片转文本

                showExpression : false, //显示表情区域
                showGiftList : false, //显示积分礼物区域
                showInputTip : true, //显示在此输入的提示语
                isTxtInputFocus : false,
                showCoupons : false, //显示优惠券列表

                sendBtnStatus : "disabled", //发送按钮的状态
                currSelectGift : null //当前选择的积分礼物
            };
        },
        computed : {
            integralAccount : function(){ //当前账户积分
                return this.currIntegralAccount;
            }
        },
        props : {
            creditConfig : { //系统积分配置
                type : Object
            },
            gifts : { //积分礼物数据
                type : Array,
                default : []
            },
            coupons : { //优惠券数据
                type : Array,
                default : []
            },
            currIntegralAccount : { //当前账户积分
                type : Number,
                default : 0
            }
        },
        created : function(){
            var i = 0,  _this = this, global = _this.global, im = _this.im;

            /////////////////////////////////////////构造exps
            for(var item in im.expression){
                _this.exps[parseInt(i/14)].push(item);
                i++;
            }

            _this.initHeight = global.winHeight;

            //////////////event on
            eventHub.$on("goto-reward-tech",_this.doClickRewardBtn);//跳转到打赏页面
            eventHub.$on("before-dice-game",_this.doBeforeDiceGame);
        },
        methods: {
            /*
             点击打赏按钮
             */
            doClickRewardBtn : function(){
                var _this = this, global = _this.global;
                _this.changeToolClosed("reward");
                if(global.userAgent.isWX){
                    _this.$router.push({ name : 'techReward' , query : { techId : _this.talker.userId }});
                }
                else if(Global.checkAccess("techReward")){
                    Util.tipShow('请打开微信登录"9358"公众号！');
                }
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
             点击表情按钮
             */
            doClickExpressionBtn : function(){
                var _this = this, txtInput = _this.$refs.txtInput, lastSelection = _this.lastSelection;
                if(!_this.showExpression){
                    _this.changeToolClosed("expression");
                    lastSelection.offset = txtInput.childNodes.length;
                    lastSelection.node = txtInput;
                }
                _this.showExpression = !_this.showExpression;
                ///scrollerToBottom();
            },

            /*
             选择表情的时候
             */
            doSelectedExp : function(event){
                var _this = this, lastSelection = _this.lastSelection, item = event.currentTarget, txtInput = _this.$refs.txtInput;

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
                    _this.integralAccount = (res[0] ? res[0].amount : 0);
                    if(parseInt(_this.integralAccount)<=0 || (amount && parseInt(amount)>parseInt(_this.integralAccount))){
                        eventHub.$emit("set-credit-tip",{ amount : amount || "", show : true, type : "game" });
                    }
                    else if(amount){
                        console.log("start-dice-game："+amount);
                        eventHub.$emit("start-dice-game",amount);
                    }
                    else{
                        console.log("show-dice-setting");
                        eventHub.$emit("change-dice-setting",{ show : true, integralAccount : _this.integralAccount });
                    }
                });
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
            点击礼物
             */
            doClickGiftItem : function(gift){
                var _this = this, txtInput = _this.$refs.txtInput;
                if(_this.currSelectGift == gift){
                    _this.currSelectGift = null;
                    _this.showInputTip = true;
                    txtInput.innerHTML = "";
                    _this.sendBtnStatus = "disabled";
                }
                else{
                    _this.currSelectGift = gift;
                    txtInput.innerHTML = "[礼物："+gift.name+"]";
                    _this.showInputTip = false;
                    _this.sendBtnStatus = "";
                }
            },

            /*
            点击积分礼物按钮
             */
            doClickGiftBtn : function(){
                var _this = this , txtInput = _this.$refs.txtInput;
                if(_this.gifts.length == 0){
                    return Util.tipShow("当前无积分礼物可发送！");
                }
                if(_this.showGiftList){
                    txtInput.innerHTML = "";
                }
                else{
                    _this.changeToolClosed("gift");
                }
                _this.showGiftList = !_this.showGiftList;
                //scrollerToBottom();
            },

            /*
            image input 发送图片按钮
             */
            doChangeFileInput : function(){
                var _this = this, imgFile = _this.$refs.imgFile, file = imgFile.files[0];
                _this.changeToolClosed("pic");
                if(file.size > 10*1024*1024){
                    return Util.tipShow("抱歉！所选图片超过10M，太大无法发送！");
                }
                var fileName = file.name, dotIndex = fileName.lastIndexOf("."), fileType;
                if(dotIndex<0) return;
                fileType = fileName.substring(dotIndex+1);
                if (!/^(jpg|jpeg|gif|png|bmp)$/i.test(fileType)) {
                    return Util.tipShow("请选择图片进行发送！");
                }
                var fileObj = WebIM.utils.getFileUrl(imgFile);
                if (!fileObj.url || fileObj.url.length == 0) {
                    return ;
                }
                IM.sendPicMessage(fileObj,file,_this.talker);
            },

            changeToolClosed : function(type){
                var _this = this;
                if(type != "expression"){
                    _this.showExpression = false;
                }
                if(type != "coupon"){
                    _this.showCoupons = false;
                }
                if(type != "gift"){
                    _this.showGiftList = false;
                    _this.currSelectGift = null;
                    _this.showInputTip = true;
                    _this.$refs.txtInput.innerHTML = "";
                    _this.sendBtnStatus = "disabled";
                }
            },

            /*
            点击发送按钮
             */
            doClickSendBtn : function(){
                var _this = this, talker = _this.talker;
                if(_this.sendBtnStatus == "disabled") return;
                if(_this.showGiftList && _this.currSelectGift){///发送积分礼物
                    var giftVal = _this.currSelectGift.ratio || 0;
                    if(giftVal>0){
                        Global.getCreditAccount(talker.clubId,function(res){
                            _this.integralAccount=parseInt(res[0] ? res[0].amount : 0);
                            if(_this.integralAccount<=0 || giftVal>_this.integralAccount){
                                eventHub.$emit("set-credit-tip",{ amount : giftVal, show : true, tipType : "gift" });
                            }
                            else{
                                _this.sendGift();
                            }
                        });
                    }
                    else{
                        _this.sendGift();
                    }
                }
                else{
                    _this.sendText();
                }
            },

            /*
            发送礼物
             */
            sendGift : function(){
                console.log("发送礼物");
                console.dir(this.currSelectGift);
                var _this = this, talker = _this.talker, txtInput = _this.$refs.txtInput, currSelectGift = _this.currSelectGift, lastSelection = _this.lastSelection;
                txtInput.innerHTML = "";
                _this.sendBtnStatus = "disabled";
                IM.sendTextMessage({
                    to : talker.id,
                    msg : "[礼物："+currSelectGift.name+"]",
                    ext : {
                        msgType : "gift",
                        giftValue : currSelectGift.ratio,
                        giftName : currSelectGift.name,
                        giftId : currSelectGift.id
                    }},talker,function(){
                    _this.$http.get("../api/v2/credit/gift/send", { params : { clubId : talker.clubId, emchatId : talker.id, giftId : currSelectGift.id, num : 1 }}).then(function(res){
                            res = res.body;
                            _this.currSelectGift = null;
                            if(res.statusCode == 200){
                                console.log("更新当前积分值");
                                eventHub.$emit("update-credit-account");
                            }
                            else{
                                Util.tipShow(res.msg || "礼物发送失败！");
                            }
                        })
                });

                lastSelection.node = txtInput;
                lastSelection.offset = 0;
            },

            /*
             发送普通文本消息
             */
            sendText : function(){
                console.log("发送文本");
                var _this = this, talker = _this.talker, txtInput = _this.$refs.txtInput, lastSelection = _this.lastSelection, divNode = _this.divNode;

                divNode.innerHTML = txtInput.innerHTML.replace(/<\/div>/g, '').replace(/<div>/g, '<br/>');
                var imgNodes = divNode.getElementsByTagName("img"), textNode, imgNodesLen =imgNodes.length;
                for (var i = imgNodesLen-1; i >= 0; i--) {
                    textNode = document.createTextNode(imgNodes[i].getAttribute("data-exp"));
                    divNode.replaceChild(textNode, imgNodes[i]);
                }
                if(divNode.innerHTML.length>1000){
                    return Util.tipShow("您输入的太多了，无法发送！");
                }
                if(divNode.innerHTML.length != imgNodesLen *4 ) txtInput.focus();
                txtInput.innerHTML = "";
                _this.sendBtnStatus = "disabled";

                IM.sendTextMessage({
                    to : talker.id,
                    msg : divNode.innerHTML,
                    ext : {}
                },talker);

                lastSelection.node = txtInput;
                lastSelection.offset = 0;
            }
        },
        beforeDestroy : function(){
            var _this = this;
            eventHub.$off("goto-reward-tech",_this.doClickRewardBtn);
            eventHub.$off("before-dice-game",_this.doBeforeDiceGame);
        }
    }
</script>