<style>
    @import '../styles/page/checkOrder.css';
</style>
<template>
    <div class="page" id="check-order-page" :style="{ height : global.winHeight+'px' }">
        <div class="top-wrap">
            <div class="header"></div>
            <div class="name">李好美<span>110</span></div>
        </div>
        <div class="center-wrap">
            <div>消费金额：</div>
            <input type="text" maxlength="9" v-model="money" @input="onInputMoney()"/>
        </div>
        <div class="bottom-wrap">
            <div>如需用使用券，请到收银台买单~</div>
            <div>
                <div @click="doCancel()">取消</div>
                <div @click="doConfirm()">确认</div>
            </div>
        </div>
    </div>
</template>
<script>
    import { Global } from '../libs/global'
    // import Util from '../libs/util'

    module.exports = {
        data: function () {
            return {
                global: Global.data,
                money: ''
            }
        },
        created: function () {
            var that = this
            var global = that.global
            global.loading = false
        },
        methods: {
            doClickPageBack: function () {
                history.back()
            },
            doCancel: function () {

            },
            doConfirm: function () {

            },
            // 金额输入限制
            onInputMoney: function () {
                var that = this
                var val = that.money
                if (val.length == 1) {
                    if (/\D/.test(val)) {
                        val = ''
                    }
                } else {
                    val = val.replace(/[^\d.]/g, '')
                    var dotIndex = 0
                    val = val.replace(/\./g, function () {
                        if (dotIndex == 0) {
                            dotIndex = arguments[1]
                            return '.'
                        } else {
                            return ''
                        }
                    })
                    if (dotIndex > 0) {
                        val = val.substring(0, dotIndex + 3)
                    }
                }
                that.money = val
            }
        }
    }
</script>