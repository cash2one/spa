<style>
    @import '../styles/page/serviceGroup.css';
</style>
<template>
    <div>
        <div class="page-back-btn" @click="doClickPageBack()" v-show="!global.loading"></div>
        <div class="page" id="service-group-page" v-show="!global.loading">
            <div class="item" v-for="item in dataList" :style="{ backgroundImage : 'url('+item.imageUrl+')' }" @click="doClickItem(item.id)"></div>
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
                queryDataUrl : "../api/v2/club/{clubId}/service",
                dataList : []
            }
        },
        created : function(){
            var   _this = this, global = _this.global;
            _this.$http.get(_this.queryDataUrl,{ params : { clubId : global.clubId }}).then(function(res){
                res = res.body;
                if(res.length){
                    _this.dataList = res;
                }
                else{
                    Util.tipShow(res.msg || global.loadError);
                    return _this.$router.back();
                }
            },function(){
                Util.tipShow(global.loadError);
                return _this.$router.back();
            });
        },
        methods: {
            doClickPageBack : function(){
                history.back();
            },
            doClickItem : function(id){
                this.$router.push({ name : 'serviceList' , query : { id : id }});
            }
        }
    }
</script>