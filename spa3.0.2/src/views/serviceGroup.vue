<style>
    @import '../styles/page/serviceGroup.css';
</style>
<template>
    <div>
        <page-back></page-back>
        <div class="page" id="service-group-page">
            <router-link  tag="div" class="item" v-for="item in dataList" :style="{ backgroundImage : 'url('+item.imageUrl+')' }" :to="{ name: 'serviceList', query: { id: item.id }}"></router-link>
            <div class="nullData" v-show="dataList.length==0">
                <div v-show="global.loading"></div>
                <div>{{ global.loading ? '数据加载中...' : '暂无内容...' }}</div>
            </div>
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
            that.$http.get('../api/v2/club/{clubId}/service', {params: {clubId: global.clubId}}).then(function (res) {
                res = res.body
                if (res.length) {
                    that.dataList = res
                    global.loading = false
                } else {
                    Util.tipShow(res.msg || global.loadError)
                    return that.$router.back()
                }
            }, function () {
                Util.tipShow(global.loadError)
                return that.$router.back()
            })
        }
    }
</script>