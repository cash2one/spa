<template>
    <div class="credit-tip-pop pop-modal" :class="{ active : show }">
        <div class="center-wrap">
            <h3>积分不足</h3>
            <div class="tip" v-if="tipType=='gift'">送礼物需要<span>{{ amount }}</span>积分，当前您的积分不足。</div>
            <div class="tip" v-if="tipType=='game'">玩骰子需要<span>{{ amount }}</span>积分，当前您的积分不足。</div>
            <div class="btn">
                <a class="cancel" @click="doClickCancelBtn()">取消</a>
                <router-link class="get" :to="{ name : 'integralExplain' }">如何获取积分</router-link>
            </div>
        </div>
    </div>
</template>

<script>
    import { eventHub } from '../libs/hub';

    module.exports = {
        data: function(){
            return {
                show : false,
                amount : 0
            };
        },
        props : {
            giftValue : {
                type : Number,
                default : 0
            },
            tipType : {
                type : String,
                default : "gift"
            }
        },
        computed : {
            amount : function(){
                return this.giftValue
            }
        },
        created : function(){
            eventHub.$on("change-credit-tip",this.doChangeVisible);
            eventHub.$on("set-credit-tip",this.doSetCreditTip);
        },
        beforeDestroy : function(){
            eventHub.$off("change-credit-tip",this.doChangeVisible);
            eventHub.$off("set-credit-tip",this.doSetCreditTip);
        },
        methods: {
            doClickCancelBtn : function(){
                this.show = false;
            },
            doChangeVisible : function(type){
                this.show = type;
            },
            doSetCreditTip : function(option){
                var _this = this;
                _this.amount = option.amount;
                _this.tipType = option.tipType;
                _this.show = option.show;
            }
        }
    }
</script>