<style>
    @import '../styles/page/clubList.css';
</style>
<template>
    <div class="page" id="club-list-page" v-show="!global.loading">
        <router-view></router-view>
    </div>
</template>
<script>
    import Vue from 'vue';
    import { Global } from '../libs/global';
    import Util from "../libs/util";

    module.exports = {
        data: function(){
            return {
                global : Global.data
            }
        },
        beforeRouteEnter : function(to,from,next){
            var global = Global.data,
                    authCode = to.query.code;
            if(global.userAgent.isWX && (!global.openId || global.openId.length<10)){
                if(authCode){
                    Global.getOpenId().then(function(res){
                        if(res.statusCode == 200){
                            next(function(vm){
                                vm.init();
                            });
                        }
                        else if(res.statusCode == 40029){
                            Global.getOauthCode('','9358','9358','base');
                        }
                        else{
                            Util.tipShow(res.msg || "未能获取OpenId！")
                        }
                    });
                }
                else{
                    Global.getOauthCode('','9358','9358','base');
                    next(false);
                }
            }
            else{
                next(function(vm){
                    vm.init();
                });
            }
        },
        created : function(){

        },
        methods: {
            init : function(){

            }
        }
    }
</script>