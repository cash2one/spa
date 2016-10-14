<style>
    @import '../styles/components/chatInput.css';
</style>
<template>
    <div class="chat-input-wrap">
        <div class="input">
            <div contenteditable="true" ref="txtInput" @focus="onTextInputFocus()" @blur="onTextInputBlur()" @input="onInputOfText()"></div>
            <span v-show="showInputTip" @click="onClickInputTip()">在此输入...</span>
            <a :class="sendBtnStatus">发送</a>
        </div>
        <div class="menu">
            <div class="pic"><form><input name="file" type="file" accept="image/*"/></form></div>
            <div class="expression" ref="expressionBtn"></div>
            <div class="reward" @click="doClickRewardBtn()"></div>
            <div class="coupon"><ul></ul></div>
            <div class="dice"></div>
            <div class="gift"></div>
        </div>
        <swipe class="exp-swipe" :auto="24*60*60*1000" v-show="showExpression">
            <swipe-item class="exp-wrap-0"><div v-for="exp in exps[0]"><div></div></div></swipe-item>
            <swipe-item class="exp-wrap-1"><div v-for="exp in exps[1]"><div></div></div></swipe-item>
        </swipe>
        <div class="gift-list" v-show="showGiftList">
            <div class="list">
                <div></div>
            </div>
            <div class="info"><span>*</span>&nbsp;当前剩余<b>{{}}</b>积分</div>
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
                sendBtnStatus : "disabled" //发送按钮的状态
            };
        },
        created : function(){
            var i = 0,  _this = this, global = _this.global, im = _this.im;

            /////////////////////////////////////////构造exps
            for(var item in im.expression){
                _this.exps[parseInt(i/14)].push(item);
                i++;
            }

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
            }
        }
    }
</script>