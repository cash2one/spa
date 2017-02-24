<style>
    @import '../styles/page/clubProfile.css';
</style>
<template>
    <div>
        <page-back></page-back>
        <div class="club-profile-page-num" v-show="totalPage>0"><span id="profile-page-num">1</span>/{{totalPage}}</div>
        <div class="page" id="club-profile-page" :style="{ height : global.winHeight + 'px' }">
            <swiper class="profile-swipe" :options="swiperOption">
                <swiper-slide v-for="item in profileData">
                    <div class="profile-top">
                        <div>{{ item.title || "" }}</div>
                        <div>{{ item.intro || "" }}</div>
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
                global: Global.data,
                profileData: [],
                totalPage: 0,
                pageIndex: 1,
                swiperOption: {
                    observeParents: true,
                    onSlideChangeEnd: function (swiper) {
                        document.querySelector('#profile-page-num').innerHTML = swiper.activeIndex + 1
                    }
                }
            }
        },
        created: function () {
            var that = this
            var global = that.global
            that.$http.get('../api/v2/club/{clubId}/item', {params: {clubId: global.clubId}}).then(function (res) {
                res = res.body
                if (res) {
                    that.totalPage = res.length
                    that.profileData = res
                    global.loading = false
                } else {
                    Util.tipShow(global.loadError)
                    that.$router.back()
                }
            }, function () {
                Util.tipShow(global.loadError)
                that.$router.back()
            })
        }
    }
</script>