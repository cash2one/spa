<style>
    @import '../styles/page/member.css';
</style>
<template>
    <div>
        <div class="page-back-btn" @click="doClickPageBack()" v-show="!global.loading"></div>
        <div class="page" id="member-page" v-show="!global.loading">
            <div class="item" v-for="item in dataList">
                <div :style="{ backgroundImage : 'url('+item.logoUrl+')' }"></div>
                <div>{{ item.memberName }}</div>
                <div v-html="item.memberContent"></div>
            </div>
            <div class="nullData" v-show="dataList.length==0"><div></div><div>暂无内容...</div></div>
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
                queryDataUrl : "../api/v2/club/{clubId}/memberinfo",
                dataList : []
            }
        },
        created : function(){
            var   _this = this, global = _this.global;
            global.loading = true;
            _this.$http.get(_this.queryDataUrl,{ params : { clubId : global.clubId }}).then(function(res){
                res = res.body;
                global.loading = false;
                if(res.length){
                    _this.dataList = res;
                }
                else{
                    Util.tipShow(res.msg || global.loadError);
                    return _this.$router.back();
                }
            },function(){
                Util.tipShow(global.loadError);
                global.loading = false;
                _this.$router.back();
            });
        },
        methods: {
            doClickPageBack : function(){
                history.back();
            }
        }
    }
</script>