<style>
    @import '../styles/page/confirmOrder.css';
</style>
<template>
    <div>
        <div class="loading" v-show="loading"><i></i><i></i><i></i></div>
        <div class="page" id="service-item-page" v-if="!loading">

        </div>
    </div>
</template>
<script>
    import { Global } from '../libs/global';
    import TelDetail from '../components/tel-detail.vue';
    import Util from "../libs/util";

    module.exports = {
        data: function(){
            return {
                loading : false,
                global : Global.data,
                queryDataUrl : "../api/v2/club/"+Global.data.clubId+"/service/item"
            }
        },
        components: {

        },
        route: function(){
            var _this = this, global = _this.global,pageParam = global.currPageQuery;
        },
        filters: {
        },
        mounted : function(){
            var _this = this;

        },
        methods: {
            doClickPageBack : function(){//点击返回按钮
                history.back();
            }
        }
    }
</script>