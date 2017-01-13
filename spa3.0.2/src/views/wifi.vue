<style>
    @import '../styles/page/wifi.css';
</style>
<template>
    <div class="page" id="wifi-page" :style="{ height : global.winHeight+'px' }">
        <page-title title-text="会所WiFi"></page-title>
        <div class="list" :style="{ height : (global.winHeight-2.611*global.winScale*16)+'px' }">
            <div class="list-item" v-for="item in dataList">
                <div>WiFi：{{ item.ssid }}</div>
                <div>密码：{{ item.password }}</div>
            </div>
        </div>
        <div class="nullData" v-show="dataList.length==0">
            <div v-show="!global.loading"></div>
            <div>{{ global.loading ? '数据加载中...' : '暂无内容...' }}</div>
        </div>
    </div>
</template>
<script>
    import { Global } from '../libs/global'
    import Util from '../libs/util'

    module.exports = {
        data: function () {
            return {
                global: Global.data,
                dataList: []
            }
        },
        created: function () {
            var that = this
            var global = that.global
            var clubId = global.clubId || global.currPage.query.clubId
            if (!clubId) {
                return Util.tipShow(global.visitError)
            }
            that.$http.get('../api/v2/user/wifi', {params: {clubId: clubId}}).then(function (res) {
                res = res.body
                if (res.statusCode == 200) {
                    that.dataList = res.respData
                    global.loading = false
                } else {
                    Util.tipShow(res.msg || global.loadError)
                    that.$router.back()
                }
            })
        }
    }
</script>