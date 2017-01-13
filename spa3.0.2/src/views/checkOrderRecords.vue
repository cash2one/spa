<style>
    @import '../styles/page/checkOrderRecords.css';
</style>
<template>
    <div class="page" id="check-order-records-page" :style="{ height : global.winHeight+'px' }">
        <div class="page-title"><a class="back" @click="doClickPageBack()"></a>买单记录</div>
    </div>
</template>
<script>
    import { Global } from '../libs/global'
    // import Util from '../libs/util'

    module.exports = {
        data: function () {
            return {
                global: Global.data
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
            }
        }
    }
</script>