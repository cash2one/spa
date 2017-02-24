<style>
    @import '../styles/page/oneYuanRecordsDetail.css';
</style>
<template>
    <div class="page" id="one-yuan-records-detail-page">
        <page-title title-text=""></page-title>
    </div>
</template>
<script>
    import { Global } from '../libs/global'
    import Util from '../libs/util'

    module.exports = {
        data: function () {
            return {
                global: Global.data
            }
        },
        created: function () {
            var that = this
            var global = that.global
            Util.tipShow(global.clubId)
        },
        methods: {
            doSearch: function () {

            }
        }
    }
</script>