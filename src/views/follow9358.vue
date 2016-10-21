<style>
    @import '../styles/page/techReward.css';
</style>
<template>
    <div class="page" id="tech-reward-page" v-show="!global.loading">
        <div class="page-title"><a class="back" @click="doClickPageBack()"></a>会所列表</div>
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
        created : function(){
            var   _this = this, global = _this.global;
        },
        methods: {
            doClickPageBack : function(){
                history.back();
            }
        }
    }
</script>