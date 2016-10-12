<style>
    @import '../styles/page/chat.css';
</style>
<template>
    <div>
        <div class="page" id="chat-page" v-show="!global.loading">
            <div class="page-title"><a class="back" @click="doClickPageBack()"></a>{{ talker.name }}<span v-show="talker.userNo">[{{ talker.userNo }}]</span><i></i><i></i></div>
            <div class="order-tip" @click="doClickOrderTip()">如果技师没有回应，那就立即预约吧！<div></div></div>
            <div class="message-wrap" :style="{ height : msgWrapHeight+'px' }">
                <loadmore :top-method="loadMoreData">
                    <ul>
                        <li v-for="item in list">{{ item }}</li>
                    </ul>
                </loadmore>
            </div>
        </div>
    </div>
</template>
<script>
    import { Global } from '../libs/global';
    import { IM } from '../libs/im';
    import Util from "../libs/util";
    import LoadMore from '../components/loadmore';

    module.exports = {
        components : {
            'loadmore' : LoadMore
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
        created : function(){
            var   _this = this, global = _this.global, params = global.currPageQuery;
            if(!params.clubId && global.pageMode != "club"){
                Util.tipShow(global.visitError);
                return _this.$router.back();
            }
            _this.msgWrapHeight = global.winHeight-4.389*global.winScale*16;
        },
        mounted : function(){
          /*var _this = this;
            for(var i=0;i<10;i++){
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
                /*var _this = this, last = _this.list[_this.list.length-1];
                for(var i=last+1;i<last+10;i++){
                    _this.list.unshift(i);
                }
                _this.$broadcast('onTopLoaded', id);*/
            },
            doClickOrderTip : function(){//点击预约（提示）

            }
        }
    }
</script>