<style>
    @import '../styles/page/message.css';
</style>
<template>
    <div class="page message-list-page" id="message-page" v-show="!global.loading">
            <div class="page-title"><a class="back" @click="doClickPageBack()"></a>消息列表<div v-show="dataList.length!=0" class="edit-title" @click="doClickEditBtn()">{{ inEdit ? "完成" : "编辑" }}</div></div>
            <div class="list" :style="{ height : (global.winHeight-2.611*global.winScale*16)+'px' }">
                <div class="list-item" v-for="item in dataList" @click="doClickRecord(item)" :key="item.chatId">
                    <div :style="{ backgroundImage : 'url('+(item.header || global.defaultHeader)+')' }"></div>
                    <div>
                        <div>{{ item.name }}<span v-if="item.no"><span>[</span>{{ item.no }}<span>]</span></span></div>
                        <div>{{ item.msgStr }}</div>
                        <div>{{ item.time | MsgTimeFormatter }}</div>
                        <div v-show="item.new>0">{{ item.new }}</div>
                    </div>
                    <div :class="{ active : inEdit }" @click="doClickDelRecord(item)">删除记录</div>
                </div>
                <div class="nullData" v-show="dataList.length==0"><div></div><div>暂无内容...</div></div>
            </div>
        </div>
</template>
<script>
    import { Global } from '../libs/global';
    import Util from "../libs/util";
    import { IM } from "../libs/im";
    import MsgTimeFormatter from "../filters/msg-time-formatter";

    module.exports = {
        filters: {
            MsgTimeFormatter : MsgTimeFormatter
        },
        data: function(){
            return {
                global : Global.data,
                im : IM,
                dataList : [],
                sessionList : null,
                inEdit : false
            }
        },
        created : function(){
            var   _this = this, global = _this.global, dataArr = [], itemObj;
            _this.getRecordsUrl += _this.im.id;
            var sessionList = _this.sessionList = _this.im.getSessionList();
            for(var chatId in sessionList){
                itemObj = sessionList[chatId];
                if(itemObj.name && ((global.pageMode == "club" && itemObj.clubId == global.clubId) || (global.pageMode != "club"))){
                    itemObj.msgStr = _this.im.decodeExpression(itemObj.msg.data.replace(/<br>|<br\/>/g,""));
                    itemObj.chatId = chatId;
                    dataArr.push(itemObj);
                }
            }
            if(dataArr.length>0){
                dataArr.sort(function(a,b){ return (a.time> b.time ? -1 : 1) });
            }
            console.log("dataArr："+JSON.stringify(dataArr));
            _this.dataList = dataArr;
        },
        methods: {
            doClickPageBack : function(){
                history.back();
            },
            doClickEditBtn : function(){
                this.inEdit = !this.inEdit;
            },
            doClickRecord : function(item){
                var _this = this, techId = item.techId;
                if(!techId){///管理者
                    /////
                }
                _this.$router.push({ name : "chat" , query : { techId : techId , clubId : item.clubId } });
            },
            doClickDelRecord : function(item){
                var _this = this, im = _this.im;
                im.delMessageRecord(item.chatId);
                var itemIndex = _this.dataList.indexOf(item);
                _this.dataList.splice(itemIndex,1);
            }
        }
    }
</script>