<style>
    @import '../styles/page/confirmOrder.css';
</style>
<template>
    <div class="page" id="service-item-page" v-if="!global.loading"></div>
</template>
<script>
    import { Global } from '../libs/global'

    module.exports = {
        data: function () {
            return {
                global: Global.data
            }
        },
        components: {},
        route: function () {
        },
        filters: {},
        mounted: function () {
        },
        methods: {
            doClickPageBack: function () { // 点击返回按钮
                history.back()
            }
        }
    }
</script>