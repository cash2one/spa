<style>
    @import '../styles/page/clubProfile.css';
</style>
<template>
    <div class="loading" v-show="$loadingRouteData"><i></i><i></i><i></i></div>
    <div class="page-back-btn" @click="doClickPageBack()" v-show="!$loadingRouteData"></div>
    <div class="club-profile-page-num" v-show="totalPage>0">{{pageIndex}}/{{totalPage}}</div>
    <div class="page" id="club-profile-page" :style="{ height : global.winHeight+'px'}" v-show="!$loadingRouteData">
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
                getClubProfileDataUrl : "../api/v2/club/"+Global.data.clubId+"/item",
                global : Global.data,
                profileData : [],
                currPage : 0,
                totalPage : 0,
                maxAutoTime : 24*60*60*1000,
                pageIndex : 1
            };
        },
        route: {
            data : function(transition){
                var _this = this;
                return new Promise(function(resolve,reject){
                    _this.$http.get(_this.getClubProfileDataUrl).then(function(res){
                        res = res.body;
                        if(res){
                            resolve({ totalPage : res.length, currPage : 1, profileData : res });
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
                });
            }
        },
        methods: {
            doClickPageBack : function(){//点击返回按钮
                history.back();
            }
        },
        events : {
            "swipePageEnd" : function(option){
                this.pageIndex = option.currIndex+1;
            }
        }
    }
</script>