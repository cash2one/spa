<style>
    @import '../styles/page/message.css';
</style>
<template>
    <div class="page message-list-page" id="message-page">
        <page-title title-text="消息列表"><div v-show="dataList.length!=0" class="edit-title" @click="doClickEditBtn()">{{ inEdit ? "完成" : "编辑" }}</div></page-title>
        <div class="list" :style="{ height : (global.winHeight-2.611*global.winScale*16)+'px' }">
            <div class="list-item" v-for="item in dataList" @click="doClickRecord(item)" :key="item.chatId">
                <div :style="{ backgroundImage : 'url('+(item.header || global.defaultHeader)+')' }"></div>
                <div>
                    <div>{{ item.name }}<span v-if="item.no"><span>[</span>{{ item.no }}<span>]</span></span></div>
                    <div v-html="item.msgStr"></div>
                    <div>{{ item.time | MsgTimeFormatter }}</div>
                    <div v-show="item.new>0">{{ item.new }}</div>
                </div>
                <div :class="{ active : inEdit }" @click="doClickDelRecord(item)">删除记录</div>
            </div>
            <div class="nullData" v-show="dataList.length==0">
                <div v-show="!global.loading"></div>
                <div>{{ global.loading ? '数据加载中...' : '暂无内容...' }}</div>
            </div>
        </div>
    </div>
</template>
<script>
    import { Global } from '../libs/global'
    import { IM } from '../libs/im'
    import MsgTimeFormatter from '../filters/msg-time-formatter'

    module.exports = {
        filters: {
            MsgTimeFormatter: MsgTimeFormatter
        },
        data: function () {
            return {
                global: Global.data,
                im: IM,
                dataList: [],
                sessionList: null,
                inEdit: false
            }
        },
        created: function () {
            var that = this
            var global = that.global
            var dataArr = []
            var itemObj
            that.getRecordsUrl += that.im.id
            var sessionList = that.sessionList = that.im.getSessionList()
            for (var chatId in sessionList) {
                itemObj = sessionList[chatId]
                if (itemObj.name && ((global.pageMode == 'club' && itemObj.clubId == global.clubId) || (global.pageMode != 'club'))) {
                    itemObj.msgStr = that.im.decodeExpression(itemObj.msg.data.replace(/<br>|<br\/>/g, ''))
                    itemObj.chatId = chatId
                    dataArr.push(itemObj)
                }
            }
            if (dataArr.length > 0) {
                dataArr.sort(function (a, b) {
                    return (a.time > b.time ? -1 : 1)
                })
            }
            console.log('dataArr：' + JSON.stringify(dataArr))
            that.dataList = dataArr
        },
        methods: {
            doClickEditBtn: function () {
                this.inEdit = !this.inEdit
            },
            doClickRecord: function (item) {
                var that = this
                var techId = item.techId
                if (!techId) { // 管理者
                    /* manager */
                }
                that.$router.push({name: 'chat', query: {techId: techId, clubId: item.clubId}})
            },
            doClickDelRecord: function (item) {
                var that = this
                var im = that.im
                im.delMessageRecord(item.chatId)
                var itemIndex = that.dataList.indexOf(item)
                that.dataList.splice(itemIndex, 1)
            }
        }
    }
</script>