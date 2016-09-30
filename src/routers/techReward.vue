<style>
    @import '../styles/page/techReward.css';
</style>
<template>
    <div class="loading" v-show="$loadingRouteData"><i></i><i></i><i></i></div>
    <div class="page" id="tech-reward-page" v-show="!$loadingRouteData">
        <div class="page-title"><a class="back" @click="doClickPageBack()"></a>技师打赏</div>
    </div>
</template>
<script>
    import { Global } from '../libs/global';
    import Util from "../libs/util";

    module.exports = {
        data: function(){
            return {
                global : Global.data
            }
        },
        route : {
            data : function(transition){
                var   _this = this, global = _this.global;
                transition.next();
            }
        },
        methods: {
            doClickPageBack : function(){
                history.back();
            }
        }
    }
</script>