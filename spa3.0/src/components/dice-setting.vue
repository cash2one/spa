<style>
    @import '../styles/components/diceSetting.css';
</style>
<template>
    <div class="dice-setting-wrap pop-modal" :class="{ active : show }">
        <div class="center-wrap">
            <h3>每局筹码</h3>
            <ul>
                <li :class="{ active : selectedDice==item }" v-for="item in diceValues" @click="doClickDiceItem(item)">
                    {{ item }}
                </li>
            </ul>
            <div class="shape"></div>
            <div class="tip">比大小，每局胜方将获得负方所选积分</div>
            <div class="btn">
                <div class="cancel" @click="doClickCancelBtn()">取消</div>
                <div class="invite" @click="doClickInviteBtn()">邀请</div>
            </div>
        </div>
    </div>
</template>

<script>
    import {eventHub} from '../libs/hub'

    module.exports = {
        data: function () {
            return {
                diceValues: [1, 10, 50, 100, 500, 1000],
                selectedDice: 1,
                integralAccount: 0,
                show: false
            }
        },
        created: function () {
            // event
            eventHub.$on('change-dice-setting', this.doChangeVisible)
        },
        methods: {
            doClickDiceItem: function (item) { // 点击每个dice设置项
                this.selectedDice = item
            },
            doClickCancelBtn: function () { // 点击取消按钮
                this.show = false
            },
            doClickInviteBtn: function () { // 点击邀请按钮
                var _this = this
                _this.show = false
                if (_this.selectedDice <= _this.integralAccount) {
                    // 可以 start game
                    eventHub.$emit('start-dice-game', _this.selectedDice)
                } else {
                    // 弹出积分不足的提示
                    eventHub.$emit('set-credit-tip', {amount: _this.selectedDice, show: true, type: 'game'})
                }
            },
            doChangeVisible: function (option) {
                this.show = option.show
                this.integralAccount = option.integralAccount
            }
        },
        beforeDestroy: function () {
            eventHub.$off('change-dice-setting', this.doChangeVisible)
        }
    }
</script>
