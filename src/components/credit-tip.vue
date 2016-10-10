<template>
    <div class="credit-tip-pop pop-modal" :class="{ active : showTip }">
        <div class="center-wrap">
            <h3>积分不足</h3>
            <div class="tip">送礼物需要<span>{{ giftValue }}</span>积分，当前您的积分不足。</div>
            <div class="btn">
                <div class="cancel" @click="doClickCancelBtn()">取消</div>
                <router-link class="get" :to="{ name : 'integralExplain' }" tag="div">如何获取积分</router-link>
            </div>
        </div>
    </div>
</template>

<script>
    module.exports = {
        data: function(){
            return {
                giftValue : 0,
                showTip : false
            };
        },
        props : ['giftValue'],
        events : {
          "change-visible" : function(isShow){
              this.showTip = isShow;
          }
        },
        methods: {
            doClickCancelBtn : function(){
                this.showTip = false;
            }
        }
    }
</script>