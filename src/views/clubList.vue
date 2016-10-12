<style>
    @import '../styles/page/techReward.css';
</style>
<template>
    <div>
        <div class="loading" v-show="loading"><i></i><i></i><i></i></div>
        <div class="page" id="tech-reward-page" v-show="!loading">
            <div class="page-title"><a class="back" @click="doClickPageBack()"></a>技师打赏</div>
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
                loading : false
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