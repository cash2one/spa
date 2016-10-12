<style>
    @import '../styles/page/clubProfile.css';
</style>
<template>
    <div>
        <div class="loading" v-show="loading"><i></i><i></i><i></i></div>
        <div class="page-back-btn" @click="doClickPageBack()" v-show="!loading"></div>
        <div class="club-profile-page-num" v-show="totalPage>0">{{pageIndex}}/{{totalPage}}</div>
        <div class="page" id="club-profile-page" :style="{ height : global.winHeight+'px'}" v-show="!loading">
            <swipe class="profile-swipe" :show-indicators="false" :auto="maxAutoTime">
                <swipe-item v-for="item in profileData">
                    <div class="profile-top">
                        <div>{{item.title || ""}}</div>
                        <div>{{item.intro || ""}}</div>
                        <div :style="{ backgroundImage : 'url('+(item.imageUrl || global.defaultBannerImgUrl )+')' }"></div>
                    </div>
                    <div class="rich-text profile-rich-text" v-html="item.description"></div>
                </swipe-item>
            </swipe>
        </div>
    </div>
</template>
<script>
    import { Global } from '../libs/global';
    import Swipe from '../components/swipe';
    import SwipeItem from '../components/swipe-item';
    import Util from "../libs/util";

    module.exports = {
        components: {
            'swipe' : Swipe,
            'swipe-item' : SwipeItem
        },
        data: function(){
            return {
                loading : false,
                eventHub : Global.eventHub,
                getClubProfileDataUrl : "../api/v2/club/"+Global.data.clubId+"/item",
                global : Global.data,
                profileData : [],
                currPage : 0,
                totalPage : 0,
                maxAutoTime : 24*60*60*1000,
                pageIndex : 1
            };
        },
        created: function(){
            var _this = this, global = _this.global;
            _this.loading = true;
            _this.$http.get(_this.getClubProfileDataUrl).then(function(res){
                res = res.body;
                if(res){
                    _this.totalPage = res.length;
                    _this.currPage = 1;
                    _this.profileData = res;
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
            _this.eventHub.$on("swipePageEnd",_this.doSwipePageEnd);
        },
        methods: {
            doClickPageBack : function(){//点击返回按钮
                history.back();
            },
            doSwipePageEnd : function(option){
                this.pageIndex = option.currIndex+1;
            }
        },
        beforeDestroy : function(){
            var _this = this;
            _this.eventHub.$off("swipePageEnd",_this.doSwipePageEnd);
        }
    }
</script>