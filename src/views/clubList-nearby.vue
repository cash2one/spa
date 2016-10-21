<template>
    <div class="page club-list-page" id="club-list-nearby-page" v-show="!global.loading">
        <div class="search"><router-link :to="{ name : 'inviteCode' }">添加会所</router-link><router-link tag="div" :to="{ name : 'clubList-search' }"><span>搜索</span></router-link></div>
        <div class="title">附近会所<router-link :to="{ name : 'clubList-all' }">查看全部</router-link></div>
        <div class="list">

            <div class="data-load-tip" :class="{ none : !dataLoading }"><i></i><div>加载数据</div></div>
            <router-link :to="{ name : 'clubList-all' }" tag="div" class="view-all" v-show="!dataLoading">查看全部会所</router-link>
        </div>
    </div>
</template>
<script>
    import { Global } from '../libs/global';
    import Util from "../libs/util";

    module.exports = {
        data: function(){
            return {
                global : Global.data,
                dataLoading : false
            }
        },
        created : function(){
            var   _this = this, global = _this.global;
            console.log("club list near by created");
        },
        methods: {

        }
    }
</script>