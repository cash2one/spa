<style>
    @import '../styles/page/map.css';
</style>
<template>
    <div>
        <div class="page-back-btn" @click="doClickPageBack()"></div>
        <div class="page" id="map-page" :style="{ height : global.winHeight+'px'}" v-show="!global.loading"></div>
    </div>
</template>
<script>
    import { Global } from '../libs/global'
    import Util from '../libs/util'

    module.exports = {
        data: function () {
            return {
                global: Global.data,
                mapData: null
            }
        },
        created: function () {
            var that = this
            var global = that.global
            that.$http.get('../api/v2/club/club_map', {params: {clubId: global.clubId}}).then(function (res) {
                res = res.body
                if (res && res.statusCode == '200' && AMap && res.respData.lngx) {
                    res = res.respData
                    that.mapData = res
                    that.initPage(res)
                    global.loading = false
                } else {
                    Util.tipShow('未能获取会所位置！')
                    that.$router.back()
                }
            }, function () {
                Util.tipShow('未能获取会所位置！')
                that.$router.back()
            })
        },
        methods: {
            initPage: function (res) {
                res = this.mapData || res
                var destination = new AMap.LngLat(parseFloat(res.lngx), parseFloat(res.laty)) // 终点---地址的经纬度
                var mapObj = new AMap.Map('map-page', {
                    view: new AMap.View2D({ // 创建地图二维视口
                        center: destination, // 创建中心点坐标
                        zoom: 15, // 设置地图缩放级别
                        rotation: 0 // 设置地图旋转角度
                    })
                }) // 创建地图实例
                AMap.event.addListener(mapObj, 'complete', function () {
                    // console.log('complete')
                })
                // 添加终点标记
                var markerElement = document.createElement('div')
                markerElement.className = 'gd_marker'
                markerElement.innerHTML = '终'
                var marker = new AMap.Marker({
                    map: mapObj,
                    position: destination,
                    content: markerElement,
                    offset: new AMap.Pixel(-15, -40)
                })
                // 添加信息窗口
                var infoWinElement = document.createElement('div')
                infoWinElement.className = 'gd_infoWin'
                infoWinElement.innerHTML = '<h3>' + res.name + '</h3><span>' + res.address + '</span><i></i>'
                var infoWin = new AMap.InfoWindow({
                    isCustom: true, // 使用自定义窗体
                    content: infoWinElement,
                    offset: new AMap.Pixel(0, -55)
                })
                infoWin.open(mapObj, marker.getPosition())
            },
            doClickPageBack: function () {
                history.back()
            }
        }
    }
</script>