<style>
    @import '../styles/page/clubProfile.css';
</style>
<template>
    <div>
        <div class="page-back-btn" @click="doClickPageBack()"></div>
        <div class="club-profile-page-num" v-show="totalPage>0"><span>1</span>/{{totalPage}}</div>
        <div class="page" id="club-profile-page" :style="{ height : global.winHeight+'px'}" v-show="!global.loading">
            <swiper class="profile-swipe" :options="swiperOption">
                <swiper-slide v-for="item in profileData">
                    <div class="profile-top">
                        <div>{{item.title || ""}}</div>
                        <div>{{item.intro || ""}}</div>
                        <div :style="{ backgroundImage : 'url('+(item.imageUrl || global.defaultBannerImgUrl )+')' }"></div>
                    </div>
                    <div class="rich-text profile-rich-text" v-html="item.description"></div>
                </swiper-slide>
            </swiper>
        </div>
    </div>
</template>
<script>
    import { Global } from '../libs/global'
    import Util from '../libs/util'

    module.exports = {
        data: function () {
            return {
                getClubProfileDataUrl: '../api/v2/club/{clubId}/item',
                global: Global.data,
                profileData: [],
                currPage: 0,
                totalPage: 0,
                pageIndex: 1,
                swiperOption: {
                    observeParents: true,
                    onSlideChangeEnd: function (swiper) {
                        document.querySelector('div.club-profile-page-num>span').innerHTML = swiper.activeIndex + 1
                    }
                }
            }
        },
        created: function () {
            var that = this
            var global = that.global
            global.loading = true
            that.$http.get(that.getClubProfileDataUrl, {params: {clubId: global.clubId}}).then(function (res) {
                res = res.body
                global.loading = false
                if (res) {
                    that.totalPage = res.length
                    that.currPage = 1
                    that.profileData = res
                } else {
                    Util.tipShow(global.loadError)
                    that.$router.back()
                }
            }, function () {
                Util.tipShow(global.loadError)
                global.loading = false
                that.$router.back()
            })
        },
        methods: {
            doClickPageBack: function () { // 点击返回按钮
                history.back()
            }
        }
    }
</script>