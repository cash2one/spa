<template>
    <div class="page" id="club-list-search-page" v-show="!global.loading">
        <h1>搜索</h1>
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

        }
    }
</script>