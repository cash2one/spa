<style>
    @import '../styles/page/fastPayError.css';
</style>
<template>
    <div class="page" id="fast-pay-error-page">
        <div><span>{{ info }}</span><br/>请咨询会所买单~</div>
    </div>
</template>
<script>
    import { Global } from '../libs/global'

    module.exports = {
        data: function () {
            return {
                info: '',
                global: Global.data
            }
        },
        created: function () {
            var that = this
            var global = that.global
            var query = global.currPage.query
            that.info = query.info ? decodeURIComponent(query.info) : '该技师不能在线买单！'
            global.loading = false
        }
    }
</script>