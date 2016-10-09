<style>
    @import '../styles/page/message.css';
</style>
<template>
    <div class="loading" v-show="$loadingRouteData"><i></i><i></i><i></i></div>
    <div class="page message-list-page" id="contacts-page" v-show="!$loadingRouteData">
        <div class="page-title"><a class="back" @click="doClickPageBack()"></a>最近联系人<div class="edit-title" @click="doClickEditBtn()">{{ inEdit ? "完成" : "编辑"}}</div></div>
        <div class="list" v-el:list-ele :style="{ height : (global.winHeight-2.611*global.winScale*16)+'px' }" @scroll="doHandlerListScroll()">
            <div class="list-item" v-for="item in dataList" track-by="friendUserId" @click="doClickRecord(item)">
                <div :style="{ backgroundImage : 'url('+(item.friendAvatarUrl || (item.toType == 'manager' ? global.defaultClubLogo : global.defaultHeader ))+')' }"></div>
                <div>
                    <div>{{ item.friendName}}<span v-if="item.techNo"><span>[</span>{{ item.techNo }}<span>]</span></span></div>
                    <div>{{ item.msg }}</div>
                    <div>{{ item.chatDate | MsgTimeFormatter}}</div>
                </div>
                <div :class="{ active : inEdit }" @click="doClickDelRecord(item)">删除记录</div>
            </div>
            <div class="data-load-tip" :class="{ none : !showDataLoadTip }"><i></i><div>加载数据</div></div>
            <div class="finish-load-tip" :class="{ none : !showFinishLoadTip || dataList.length==0 }"><div>已经加载全部数据</div></div>
            <div class="nullData" v-show="dataList.length==0 && !isAddData"><div></div><div>暂无内容...</div></div>
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
                getRecordsUrl : "../api/v1/emchat/friendlist/",
                delRecordUrl : "../api/v1/emchat/friend",
                dataList : [],
                currPage : 0,
                pageSize : 10,
                sessionList : null,
                inEdit : false,
                showDataLoadTip : false, //显示数据正在加载
                showFinishLoadTip : false,//显示已经加载完成
                isDataAddEnd : false,//数据是否已加载完
                isAddData : false//数据是否正在加载
            }
        },
        route : {
            data : function(transition){
                var   _this = this;
                _this.getRecordsUrl += _this.im.id;
                _this.sessionList = _this.im.getSessionList();
                transition.next();
            }
        },
        ready : function(){
            var   _this = this;
            _this.queryRecord();
        },
        methods: {
            doClickPageBack : function(){
                history.back();
            },
            queryRecord : function(page){
                var _this = this, global = _this.global, sessionList = _this.sessionList;
                if(_this.isAddData){
                    return;
                }
                _this.isAddData = true;
                page = page || _this.currPage+1;

                //更新数据加载提示
                _this.showDataLoadTip = true;
                _this.showFinishLoadTip = false;
                _this.isDataAddEnd = false;

                _this.$http.get(_this.getRecordsUrl, { params: {
                    page : page,
                    pageSize : _this.pageSize,
                    channel : "center"
                }}).then(function (res) {
                    res = res.body;
                    if (res) {
                        res = (res.statusCode != '200') ? [] : res['respData'];
                        var item, sessionItem;
                        for(var i=0;i<res.length;i++){
                            item = res[i];
                            if(global.pageMode == "club" && (!item.clubId || item.clubId != global.clubId)){
                                continue;
                            }
                            item.chatDate = Util.stringToDate(item.chatDate);
                            sessionItem = sessionList[item.friendChatId];
                            item.msg = item.friendDescription || "";
                            if(sessionItem){
                                item.msg = _this.im.decodeExpression(sessionItem.msg.data.replace(/<br>|<br\/>/g,""));
                                item.chatDate = sessionItem.time;
                            }
                            _this.dataList.push(res[i]);
                        }
                        if(res.length < _this.pageSize){
                            _this.isDataAddEnd = true;
                            _this.showFinishLoadTip = true;
                        }
                        _this.currPage = page;
                        _this.isAddData = false;
                        _this.showDataLoadTip = false;
                    }
                    else {
                        Util.tipShow(global.loadDataErrorTip);
                    }
                }, function() {
                    Util.tipShow(global.loadDataErrorTip);
                });
            },
            doHandlerListScroll : function(){
                var _this = this,listEle = _this.$els.listEle;
                if(!_this.isDataAddEnd && listEle.scrollTop+listEle.clientHeight*1.4>listEle.scrollHeight ){
                    _this.queryRecord();
                }
            },
            doClickEditBtn : function(){
                var _this = this;
                _this.inEdit = !_this.inEdit;
            },
            doClickRecord : function(item){
                var _this = this, techId = item.friendUserId;
                if(item.toType == "manager"){
                    techId = "";
                    /////////////////////////
                }
                _this.$router.go({ name : "chat" , query : { techId : techId , clubId : item.clubId } });
            },
            doClickDelRecord : function(item){
                var _this = this, im = _this.im;
                _this.$http.post(_this.delRecordUrl,{
                    channel : 'center',
                    currentChatId : im.id,
                    showFlag : 'n',
                    friendChatId : item.friendChatId
                }).then(function(res){
                    res = res.body;
                    if(res.statusCode == 200){
                        im.delMessageRecord(item.friendUserId);
                        _this.dataList.$remove(item);
                    }
                    else{
                        Util.tipShow(res.msg || "操作失败！");
                    }
                });
            }
        }
    }
</script>