<style>
    @import '../styles/page/confirmOrder.css';
</style>
<template>
    <div class="loading" v-show="$loadingRouteData"><i></i><i></i><i></i></div>
    <div class="page" id="service-item-page" v-if="!$loadingRouteData">

    </div>
</template>
<script>
    import { Global } from '../libs/global';
    import TelDetail from '../components/tel-detail.vue';
    import Util from "../libs/util";

    module.exports = {
        data: function(){
            return {
                global : Global.data,
                queryDataUrl : "../api/v2/club/"+Global.data.clubId+"/service/item"
            }
        },
        components: {

        },
        route: {
            data : function(transition){
                var _this = this, global = _this.global,pageParam = global.currPageQuery;
                transition.next();
            }
        },
        filters: {
        },
        ready : function(){
            var _this = this;

        },
        methods: {
            doClickPageBack : function(){//点击返回按钮
                history.back();
            }
        }
    }
</script>