<style>
    @import '../styles/page/onceCardOrderDetail.css';
</style>
<template>
    <div class="page" id="once-card-order-detail-page">
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

        }
    }
</script>