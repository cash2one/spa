<style>
    @import '../styles/page/serviceGroup.css';
</style>
<template>
    <div>
        <div class="loading" v-show="loading"><i></i><i></i><i></i></div>
        <div class="page-back-btn" @click="doClickPageBack()" v-show="!loading"></div>
        <div class="page" id="service-group-page" v-show="!loading">
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
                loading : false,
                global : Global.data,
                queryDataUrl : "../api/v2/club/"+Global.data.clubId+"/service",
                dataList : []
            }
        },
        created : function(){
            var   _this = this, global = _this.global;
            _this.$http.get(_this.queryDataUrl).then(function(res){
                res = res.body;
                if(res.length){
                    _this.dataList = res;
                }
                else{
                    Util.tipShow(res.msg || global.loadDataErrorTip);
                    return _this.$router.back();
                }
            },function(){
                Util.tipShow(global.loadDataErrorTip);
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