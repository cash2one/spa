<style>
    @import '../styles/page/technicianImg.css';
</style>
<template>
    <div class="loading" v-show="$loadingRouteData"><i></i><i></i><i></i></div>
    <div class="page" id="technician-img-page" v-show="!$loadingRouteData" :style="{ height : global.winHeight+'px' }">
        <swipe class="pic-swipe" :auto="maxAutoTime" :index="startIndex">
            <swipe-item v-for="pic in pics">
                <img :src="pic.bigImageUrl"/>
            </swipe-item>
        </swipe>
    </div>
</template>
<script>
    import { Global } from '../libs/global';
    import Util from "../libs/util";
    import Swipe from '../components/swipe';
    import SwipeItem from '../components/swipe-item';

    module.exports = {
        components: {
            'swipe' : Swipe,
            'swipe-item' : SwipeItem
        },
        data: function(){
            return {
                global : Global.data,
                queryTechDetailUrl : "../api/v2/club/technician/"+Global.data.currPageQuery.id,
                techId : "",
                maxAutoTime : 24*60*60*1000,
                startIndex : 0,
                pics : [] //相册
            };
        },
        route : {
            data : function(transition){
                var _this = this, pageParam = _this.global.currPageQuery;
                if(pageParam.id == undefined){//链接上无技师id
                    transition.abort();
                    return;
                }
                _this.startIndex = parseInt((pageParam.index || 0));
                return new Promise(function(resolve,reject){
                    var pageData = _this.global.pageData;
                    _this.techId = Global.data.currPageQuery.id;
                    if(!pageData["technicianImg"]){
                        pageData["technicianImg"] = {};
                    }
                    pageData = pageData["technicianImg"];
                    if(pageData[_this.techId]){
                        resolve({ pics : pageData[_this.techId] });
                    }
                    else{
                        _this.$http.get(_this.queryTechDetailUrl).then(function(res){
                            res = res.body;
                            if(res && res.albums && res.albums.length>0){
                                pageData[_this.techId] = res.albums;
                                resolve({ pics : pageData[_this.techId] });
                            }
                            else{
                                Util.tipShow(_this.global.loadDataErrorTip);
                                reject(false);
                                transition.abort();
                            }
                        }, function(){
                            Util.tipShow(_this.global.loadDataErrorTip);
                            reject(false);
                            transition.abort();
                        });
                    }
                })
            }
        },
        methods: {

        }
    }
</script>