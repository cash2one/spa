<style>
    @import '../styles/page/journalList.css';
</style>
<template>
    <div class="page" id="journal-list-page" :style="{ height : global.winHeight+'px' }">
        <page-title title-text="电子期刊"></page-title>
        <div class="list" :style="{ height : (global.winHeight-2.611*global.winScale*16)+'px' }">
            <div class="list-item" v-for="item in dataList" @click="doViewJournal(item)">
                <div class='logo' :style="{ backgroundImage : 'url(images/journal/'+item.templateId+'.png)' }">NO.{{ item.sequenceNo }}</div>
                <div class='title'>
                    <div>{{ item.title }}</div>
                    <div>发布时间：{{ item.modifyDate }}</div>
                </div>
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
            that.$http.get('../api/v2/user/journal/list', {params: {clubId: clubId}}).then(function (res) {
                res = res.body
                if (res.statusCode == 200) {
                    that.dataList = res.respData
                    global.loading = false
                } else {
                    Util.tipShow(res.msg || global.loadError)
                    that.$router.back()
                }
            })
        },
        methods: {
            doViewJournal: function (journal) {
                var loc = location
                loc.href = loc.origin + '/spa-manager/journal?id=' + journal.journalId
            }
        }
    }
</script>