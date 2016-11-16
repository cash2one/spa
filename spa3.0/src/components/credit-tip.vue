<template>
    <div class="credit-tip-pop pop-modal" :class="{ active : show }">
        <div class="center-wrap">
            <h3>积分不足</h3>
            <div class="tip" v-if="type=='gift'">送礼物需要<span>{{ amount }}</span>积分，当前您的积分不足。</div>
            <div class="tip" v-if="type=='game'">玩骰子需要<span>{{ amount }}</span>积分，当前您的积分不足。</div>
            <div class="btn">
                <a class="cancel" @click="doClickCancelBtn()">取消</a>
                <router-link class="get" :to="{ name : 'integralExplain' }">如何获取积分</router-link>
            </div>
        </div>
    </div>
</template>

<script>
    import {eventHub} from '../libs/hub'

    module.exports = {
        data: function () {
            return {
                show: false,
                amount: 0,
                type: 'gift'
            }
        },
        created: function () {
            eventHub.$on('set-credit-tip', this.doSetCreditTip)
        },
        beforeDestroy: function () {
            eventHub.$off('set-credit-tip', this.doSetCreditTip)
        },
        methods: {
            doClickCancelBtn: function () {
                this.show = false
            },
            doSetCreditTip: function (option) {
                var _this = this
                _this.amount = option.amount || _this.amount
                _this.type = option.type || _this.type
                _this.show = option.show || _this.show
            }
        }
    }
</script>