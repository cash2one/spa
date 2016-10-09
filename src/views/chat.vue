<style>
    @import '../styles/page/chat.css';
</style>
<template>
    <div class="loading" v-show="$loadingRouteData"><i></i><i></i><i></i></div>
    <div class="page" id="chat-page" v-show="!$loadingRouteData">
        <div class="page-title"><a class="back" @click="doClickPageBack()"></a>{{ talker.name }}<span v-show="talker.userNo">[{{ talker.userNo }}]</span><i></i><i></i></div>
        <div class="order-tip">如果技师没有回应，那就立即预约吧！<div></div></div>
        <div class="message-wrap">
           <loadmore :top-method="loadMoreData">
                <ul>
                    <li v-for="item in list">{{ item }}</li>
                </ul>
            </loadmore>
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
                talker : IM.talker,
                list : []
            }
        },
        route : {
            data : function(transition){
                var   _this = this, global = _this.global;
                transition.next();
            }
        },
        ready : function(){
          var _this = this;
            for(var i=0;i<10;i++){
                _this.list.push(i);
            }
            console.dir(_this.list);
        },
        methods: {
            doClickPageBack : function(){
                history.back();
            },
            loadMoreData : function(id){
                var _this = this, last = _this.list[_this.list.length-1];
                for(var i=last+1;i<last+10;i++){
                    _this.list.unshift(i);
                }
                _this.$broadcast('onTopLoaded', id);
            }
        }
    }
</script>