<style>
    @import '../styles/components/chatInput.css';
</style>
<template>
    <div class="chat-input-wrap">
        <div class="input">
            <div contenteditable="true"></div>
            <span>在此输入...</span>
            <a class="disabled">发送</a>
        </div>
        <div class="menu">
            <div class="pic"><form><input name="file" type="file" accept="image/*"/></form></div>
            <div class="expression"></div>
            <div class="reward"></div>
            <div class="coupon"><ul></ul></div>
            <div class="dice"></div>
            <div class="gift"></div>
        </div>
        <swipe class="exp-swipe" :auto="24*60*60*1000" v-show="showExpression">
            <swipe-item class="exp-wrap-0"><div v-for="exp in exps[0]"></div></swipe-item>
            <swipe-item class="exp-wrap-1"><div v-for="exp in exps[1]"></div></swipe-item>
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
                exps : [[],[]],
                showExpression : false,
                showGiftList : false
            };
        },
        created : function(){
            var i = 0,  _this = this, global = _this.global, im = _this.im;

            /////////////////////////////////////////构造exps
            for(var item in im.expression){
                _this.exps[parseInt(i/14)].push(item);
                i++;
            }
        },
        methods: {

        }
    }
</script>