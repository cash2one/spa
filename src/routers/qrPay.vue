<style>
    @import '../styles/page/qrPay.css';
</style>
<template>
    <div class="loading" v-show="$loadingRouteData"><i></i><i></i><i></i></div>
    <div class="page" id="qrpay-page" v-show="!$loadingRouteData" :style="{ height : global.winHeight+'px' }">
        <div class="page-title"><a v-if="!isDirect" class="back" @click="doClickPageBack()"></a>支付</div>
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
            data : function(){
                var   _this = this, global = _this.global, pageParams = global.currPageQuery;

            }
        },
        methods: {
            doClickPageBack : function(){
                history.back();
            }
        }
    }
</script>