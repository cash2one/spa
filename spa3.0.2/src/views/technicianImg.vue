<style>
    @import '../styles/page/technicianImg.css';
</style>
<template>
    <div class="page" id="technician-img-page" :style="{ height : global.winHeight+'px' }">
        <swiper class="pic-swipe" :auto="24*60*60*1000" :index="startIndex">
            <swiper-slide v-for="pic in pics" :options="swiperOption">
                <img :src="pic.bigImageUrl"/>
            </swiper-slide>
        </swiper>
    </div>
</template>
<script>
    import { Global } from '../libs/global'
    import Util from '../libs/util'

    module.exports = {
        data: function () {
            return {
                global: Global.data,
                queryTechDetailUrl: '../api/v2/club/technician/{techId}',
                techId: '',
                startIndex: 0,
                swiperOption: {
                    observeParents: true,
                    loop: true,
                    onInit: function (swiper) {
                        setTimeout(function () {
                            swiper.reLoop()
                            swiper.slideNext(null, 0)
                        }, 500)
                    }
                },
                pics: [] // 相册
            }
        },
        created: function () {
            var that = this
            var global = that.global
            var pageParam = global.currPage.query
            if (pageParam.id == undefined) { // 链接上无技师id
                return that.$router.back()
            }
            that.startIndex = parseInt((pageParam.index || 0))
            var pageData = global.pageData
            that.techId = global.currPage.query.id
            if (!pageData['technicianImg']) {
                pageData['technicianImg'] = {}
            }
            pageData = pageData['technicianImg']
            if (pageData[that.techId]) {
                that.pics = pageData[that.techId]
            } else {
                global.loading = true
                that.$http.get(that.queryTechDetailUrl, {params: {techId: global.currPage.query.id}}).then(function (res) {
                    res = res.body
                    global.loading = false
                    if (res && res.albums && res.albums.length > 0) {
                        pageData[that.techId] = res.albums
                        that.pics = pageData[that.techId]
                    } else {
                        Util.tipShow(global.loadError)
                        that.$router.back()
                    }
                }, function () {
                    Util.tipShow(global.loadError)
                    global.loading = false
                    that.$router.back()
                })
            }
        }
    }
</script>