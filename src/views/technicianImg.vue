<style>
    @import '../styles/page/technicianImg.css';
</style>
<template>
    <div>
        <div class="loading" v-show="loading"><i></i><i></i><i></i></div>
        <div class="page" id="technician-img-page" v-show="!loading" :style="{ height : global.winHeight+'px' }">
            <swipe class="pic-swipe" :auto="maxAutoTime" :index="startIndex">
                <swipe-item v-for="pic in pics">
                    <img :src="pic.bigImageUrl"/>
                </swipe-item>
            </swipe>
        </div>
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
                loading : false,
                global : Global.data,
                queryTechDetailUrl : "../api/v2/club/technician/"+Global.data.currPageQuery.id,
                techId : "",
                maxAutoTime : 24*60*60*1000,
                startIndex : 0,
                pics : [] //相册
            };
        },
        created : function(){
            var _this = this, global = _this.global, pageParam = global.currPageQuery;
            if(pageParam.id == undefined){//链接上无技师id
                return _this.$router.back();
            }
            _this.startIndex = parseInt((pageParam.index || 0));
            var pageData = global.pageData;
            _this.techId = global.currPageQuery.id;
            if(!pageData["technicianImg"]){
                pageData["technicianImg"] = {};
            }
            pageData = pageData["technicianImg"];
            if(pageData[_this.techId]){
                _this.pics = pageData[_this.techId];
            }
            else{
                _this.loading = true;
                _this.$http.get(_this.queryTechDetailUrl).then(function(res){
                    res = res.body;
                    if(res && res.albums && res.albums.length>0){
                        pageData[_this.techId] = res.albums;
                        _this.pics = pageData[_this.techId];
                    }
                    else{
                        Util.tipShow(global.loadDataErrorTip);
                        _this.$router.back();
                    }
                    _this.loading = false;
                }, function(){
                    Util.tipShow(global.loadDataErrorTip);
                    _this.$router.back();
                });
            }
        },
        methods: {

        }
    }
</script>