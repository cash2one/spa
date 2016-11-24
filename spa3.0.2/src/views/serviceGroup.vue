<style>
    @import '../styles/page/serviceGroup.css';
</style>
<template>
    <div>
        <div class="page-back-btn" @click="doClickPageBack()"></div>
        <div class="page" id="service-group-page">
            <div class="item" v-for="item in dataList" :style="{ backgroundImage : 'url('+item.imageUrl+')' }" @click="doClickItem(item.id)"></div>
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
        },
        methods: {
            doClickPageBack: function () {
                history.back()
            },
            doClickItem: function (id) {
                this.$router.push({name: 'serviceList', query: {id: id}})
            }
        }
    }
</script>