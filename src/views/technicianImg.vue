<style>
    @import '../styles/page/technicianImg.css';
</style>
<template>
    <div class="page" id="technician-img-page" v-show="!global.loading" :style="{ height : global.winHeight+'px' }">
            <swipe class="pic-swipe" :auto="24*60*60*1000" :index="startIndex">
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
                queryTechDetailUrl : "../api/v2/club/technician/"+Global.data.currPage.query.id,
                techId : "",
                startIndex : 0,
                pics : [] //相册
            };
        },
        created : function(){
            var _this = this, global = _this.global, pageParam = global.currPage.query;
            if(pageParam.id == undefined){//链接上无技师id
                return _this.$router.back();
            }
            _this.startIndex = parseInt((pageParam.index || 0));
            var pageData = global.pageData;
            _this.techId = global.currPage.query.id;
            if(!pageData["technicianImg"]){
                pageData["technicianImg"] = {};
            }
            pageData = pageData["technicianImg"];
            if(pageData[_this.techId]){
                _this.pics = pageData[_this.techId];
            }
            else{
                global.loading = true;
                _this.$http.get(_this.queryTechDetailUrl).then(function(res){
                    res = res.body;
                    global.loading = false;
                    if(res && res.albums && res.albums.length>0){
                        pageData[_this.techId] = res.albums;
                        _this.pics = pageData[_this.techId];
                    }
                    else{
                        Util.tipShow(global.loadError);
                        _this.$router.back();
                    }
                }, function(){
                    Util.tipShow(global.loadError);
                    global.loading = false;
                    _this.$router.back();
                });
            }
        },
        methods: {

        }
    }
</script>