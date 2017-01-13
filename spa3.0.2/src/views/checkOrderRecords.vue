<style>
    @import '../styles/page/checkOrderRecords.css';
</style>
<template>
    <div class="page" id="check-order-records-page" :style="{ height : global.winHeight+'px' }">
        <page-title title-text="买单记录"></page-title>
        <ul class="all-list">
            <li>
                <div class="item-title"><div></div>皇朝休闲会所</div>
                <ul class="item-list">
                    <li>
                        <div>服务技师：李<span>001</span></div>
                        <div>2017-01-02 18:00</div>
                        <div><b>111</b>元</div>
                    </li>
                    <li>
                        <div>服务技师：李<span>001</span></div>
                        <div>2017-01-02 18:00</div>
                        <div><b>111</b>元</div>
                    </li>
                </ul>
            </li>
        </ul>
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