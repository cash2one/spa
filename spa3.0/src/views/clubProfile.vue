<style>
    @import '../styles/page/clubProfile.css';
</style>
<template>
    <div>
        <div class="page-back-btn" @click="doClickPageBack()" v-show="!global.loading"></div>
        <div class="club-profile-page-num" v-show="totalPage>0">{{pageIndex}}/{{totalPage}}</div>
        <div class="page" id="club-profile-page" :style="{ height : global.winHeight+'px'}" v-show="!global.loading">
            <swipe class="profile-swipe" :show-indicators="false" :auto="24*60*60*1000">
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
    import {Global} from '../libs/global'
    import {eventHub} from '../libs/hub'
    import Swipe from '../components/swipe'
    import SwipeItem from '../components/swipe-item'
    import Util from '../libs/util'

    module.exports = {
        components: {
            'swipe': Swipe,
            'swipe-item': SwipeItem
        },
        data: function () {
            return {
                getClubProfileDataUrl: '../api/v2/club/{clubId}/item',
                global: Global.data,
                profileData: [],
                currPage: 0,
                totalPage: 0,
                pageIndex: 1
            }
        },
        created: function () {
            var _this = this
            var global = _this.global
            global.loading = true
            _this.$http.get(_this.getClubProfileDataUrl, {params: {clubId: global.clubId}}).then(function (res) {
                res = res.body
                global.loading = false
                if (res) {
                    _this.totalPage = res.length
                    _this.currPage = 1
                    _this.profileData = res
                } else {
                    Util.tipShow(global.loadError)
                    _this.$router.back()
                }
            }, function () {
                Util.tipShow(global.loadError)
                global.loading = false
                _this.$router.back()
            })
            eventHub.$on('swipePageEnd', _this.doSwipePageEnd)
        },
        methods: {
            doClickPageBack: function () { // 点击返回按钮
                history.back()
            },
            doSwipePageEnd: function (option) {
                this.pageIndex = option.currIndex + 1
            }
        },
        beforeDestroy: function () {
            eventHub.$off('swipePageEnd', this.doSwipePageEnd)
        }
    }
</script>
