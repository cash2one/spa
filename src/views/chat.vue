<style>
    @import '../styles/page/chat.css';
</style>
<template>
    <div>
        <div class="page" id="chat-page" v-show="!global.loading">
            <div class="page-title"><a class="back" @click="doClickPageBack()"></a>{{ talker.name }}<span v-show="talker.userNo">[{{ talker.userNo }}]</span><i></i><i></i></div>
            <div class="order-tip" @click="doClickOrderTip()">如果技师没有回应，那就立即预约吧！<div></div></div>
            <div class="message-wrap" :style="{ height : msgWrapHeight+'px' }">
                <!--<loadmore :top-method="loadMoreData">
                    <ul>
                        <li v-for="item in list">{{ item }}</li>
                    </ul>
                </loadmore>-->
            </div>
            <chat-input></chat-input>
        </div>
    </div>
</template>
<script>
    import { Global } from '../libs/global';
    import { eventHub } from '../libs/hub';
    import { IM } from '../libs/im';
    import Util from "../libs/util";
    import TelDetail from '../components/tel-detail';
    import CreditTip from '../components/credit-tip';
    import ChatInput from '../components/chat-input';
    import LoadMore from '../components/load-more';

    module.exports = {
        components : {
            'load-more' : LoadMore,
            'tel-detail' : TelDetail,
            'credit-tip' : CreditTip,
            'chat-input' : ChatInput
        },
        data: function(){
            return {
                global : Global.data,
                im : IM,
                talker : IM.talker, //当前聊天的对方
                list : [], //聊天页面的消息列表数据
                msgWrapHeight : null,

                gameStatusObj : { request : "等待接受...", accept : "已接受", reject : "已拒绝", overtime : "已超时", cancel : "已取消" }, //游戏状态
                gameOverTime : 24*60*60*1000, //游戏超时时间
                giftListData : {} //积分礼物数据
            }
        },
        beforeRouteEnter : function(to,from,next){

        },
        created : function(){
            var   _this = this, global = _this.global, params = global.currPageQuery;
            if(!params.clubId && global.pageMode != "club"){
                Util.tipShow(global.visitError);
                return _this.$router.back();
            }
            _this.msgWrapHeight = global.winHeight-8.858*global.winScale*16;
        },
        mounted : function(){
          var _this = this;
            /*for(var i=0;i<10;i++){
                _this.list.push(i);
            }
            console.dir(_this.list);*/
            window["webIM"] = WebIM;
        },
        methods: {
            doClickPageBack : function(){
                history.back();
            },
            loadMoreData : function(id){
                var _this = this, last = _this.list[_this.list.length-1];
                /*for(var i=last+1;i<last+10;i++){
                    _this.list.unshift(i);
                }*/
                eventHub.$emit('onTopLoaded', id);
            },
            doClickOrderTip : function(){//点击预约（提示）

            }
        }
    }
</script>