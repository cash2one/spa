<style>
    @import '../styles/page/serviceGroup.css';
</style>
<template>
    <div class="loading" v-show="$loadingRouteData"><i></i><i></i><i></i></div>
    <div class="page-back-btn" @click="doClickPageBack()" v-show="!$loadingRouteData"></div>
    <div class="page" id="service-group-page" v-show="!$loadingRouteData">
        <div class="item" v-for="item in dataList" :style="{ backgroundImage : 'url('+item.imageUrl+')' }" v-link="{ name : 'serviceList' , query : { id : item.id }}"></div>
        <div class="nullData" v-show="dataList.length==0"><div></div><div>暂无内容...</div></div>
    </div>
</template>
<script>
    import { Global } from '../libs/global';
    import Util from "../libs/util";

    module.exports = {
        data: function(){
            return {
                global : Global.data,
                queryDataUrl : "../api/v2/club/"+Global.data.clubId+"/service",
                dataList : []
            }
        },
        route : {
            data : function(transition){
                var   _this = this, global = _this.global;
                return new Promise(function(resolve,reject){
                    _this.$http.get(_this.queryDataUrl).then(function(res){
                        res = res.body;
                        if(res.length){
                            resolve({ dataList : res });
                        }
                        else{
                            Util.tipShow(res.msg || global.loadDataErrorTip);
                            reject(false);
                            transition.abort();
                        }
                    },function(){
                        Util.tipShow(global.loadDataErrorTip);
                        reject(false);
                        transition.abort();
                    });
                });
            }
        },
        methods: {
            doClickPageBack : function(){
                history.back();
            }
        }
    }
</script>