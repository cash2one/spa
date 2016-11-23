<style>
    @import '../styles/page/home.css';
</style>
<template>
    <div>
        <div class="page" id="home-page">
            <div class="banner">
                <swiper class="banner-swipe" :options="swiperOption">
                    <swiper-slide v-for="pic in bannerPics">
                        <div :style="{ backgroundImage : 'url('+(pic.imageUrl || global.defaultBannerImgUrl )+')' }"></div>
                        <div></div>
                    </swiper-slide>
                    <div class="swiper-pagination" slot="pagination"></div>
                </swiper>
                <router-link :to="{ name : 'clubProfile' }" class="logo" tag="div">
                    <div v-if="global.clubLogoUrl" :style="{ backgroundImage : 'url('+global.clubLogoUrl+')' }"></div>
                    <div>{{ global.clubName }}</div>
                </router-link>
                <div class="collect" :class="{ act: isCollected }" @click="doClickCollectBtn()">{{ isCollected ? '已收藏' : '收藏' }}</div>
                <div class="address"><router-link tag="div" :to="{ name: 'map' }">{{ clubDist }}</router-link><div @click="doClickContactClub"></div></div>
            </div>

            <div class="recommend tech" v-if="techs.length>0">
                <div class="title"><div>点我聊聊</div><router-link :to="{ name: 'technicianList' }">全部</router-link></div>
                <home-tech :techs="techs"></home-tech>
            </div>

            <div class="recommend act" v-show="paidServiceItems.length>0">
                <div class="title"><div>热门活动</div></div>
                <div class="paid-item" v-for="item in paidServiceItems">
                    <div :style="{ backgroundImage : 'url('+(item.imageUrl || global.defaultServiceItemImgUrl )+')' }"></div>
                    <div>
                        <div>
                            <div>{{ item.name }}</div>
                            <div>剩余<span>{{ item.canPaidCount }}</span>份</div>
                        </div>
                        <div>￥{{ item.amount }}<span>原价{{ item.price }}元</span>
                            <router-link :to="{ name : 'robProjectDetail' , query : { robProjectId : item.id }}">去抢购</router-link>
                        </div>
                        <counter :start="item.startDate" :end="item.endDate"></counter>
                    </div>
                </div>
            </div>

            <div class="recommend service">
                <div class="title"><div>推荐项目</div><router-link :to="{ name: 'serviceList' }">全部</router-link></div>
                <div>
                    <div class="item" v-for="(item,index) in serviceItems" @click="doClickServiceItem(item.id)">
                        <div :style="{ backgroundImage : 'url('+(item.imageUrl || global.defaultServiceItemImgUrl)+')' }" :class="{ 'recommend-label': index == 0 }"><div>{{ item.name }}</div></div>
                        <div>
                            <div v-show="item.price1"><span>¥</span>{{ item.price1 }}</div>
                            <div v-show="item.price1">{{ item.duration1 }}<span>{{ item.durationUnit || '分钟' }}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <tel-detail v-if="global.clubTelephone.length>0" :telephone="global.clubTelephone"></tel-detail>
        <router-link class="home-coupon" :to="{ name: 'promotions' }" v-show="!global.loading">
            <div></div>
            <span>抢优惠</span>
        </router-link>

        <div id="home-red-pack" class="pop-modal" v-if="popActType == 'coupon'" :class="{ active : showPopCoupon }">
            <div @click="doClickPopCoupon()"><div :class="popCouponActCls"><div>{{ popActData.activityName }}</div></div></div>
            <div @click="doClickPopCoupon()">领取红包</div>
            <div @click="doClosePopCoupon()"></div>
        </div>
        <activity-pop v-if="popActType != 'coupon'" :act-data="popActData"></activity-pop>
    </div>
</template>
<script>
    import { Global } from '../libs/global'
    import { eventHub } from '../libs/hub'
    import ActivityPop from '../components/activity-pop'
    import Util from '../libs/util'
    import Counter from '../components/counter'

    module.exports = {
        components: {
            'counter': Counter,
            'activity-pop': ActivityPop
        },
        data: function () {
            return {
                global: Global.data,
                bannerPics: [],
                serviceItems: [],
                techs: [],
                paidServiceItems: [],
                isCollected: false, // 是否已收藏
                clubDist: '', // 与会所的距离
                popActType: '', // 弹窗类型
                popActData: {}, // 弹窗数据
                popCouponActCls: '',
                showPopCoupon: false,
                swiperOption: {
                    autoplay: 5000,
                    pagination: '.swiper-pagination',
                    paginationClickable: true,
                    loop: true,
                    autoplayDisableOnInteraction: false,
                    observeParents: true,
                    onInit: function (swiper) {
                        setTimeout(function () {
                            swiper.reLoop()
                            swiper.slideNext(null, 0)
                        }, 500)
                    }
                }
            }
        },
        mounted: function () {
            var that = this
            var global = that.global
            that.$http.get('../api/v2/club/{clubId}/homeData', {params: {clubId: global.clubId}}).then(function (res) {
                res = res.body
                if (res.statusCode == 200) {
                    res = res.respData
                    global.clubLogoUrl = res.club.imageUrl || global.defaultClubLogo
                    global.clubName = res.club.name
                    global.clubTelephone = res.club.telephone.split(',')
                    that.bannerPics = res.sliderPic
                    that.serviceItems = res.serviceItems
                    that.techs = res.techs

                    // 用户定位
                    if (!global.currLngx || !global.currLaty) {
                        that.getLocation(function (position) {
                            global.currLngx = position.coords.longitude
                            global.currLaty = position.coords.latitude
                            that.setLocation(res.club)
                        }, function () {
                            that.setLocation(res.club)
                        })
                    } else {
                        that.setLocation(res.club)
                    }
                    // 用户是否已收藏会所
                    that.isCollected = res.isUserFavoriteClub

                    global.loading = false
                } else {
                    Util.tipShow(global.loadError)
                }
            }, function () {
                Util.tipShow(global.loadError)
            })
            // 请求弹窗数据
            that.$http.get('../api/v2/club/popup/get', {params: {clubId: global.clubId}}).then(function (popRes) {
                popRes = popRes.body
                if (popRes.statusCode == 200) {
                    popRes = popRes.respData
                    // 上次的弹窗数据
                    var lastPopInfo = Util.localStorage('pastPopInfo_' + global.clubId)
                    if (lastPopInfo) {
                        lastPopInfo = JSON.parse(lastPopInfo)
                    }
                    // 是否弹窗
                    if (!lastPopInfo || lastPopInfo.id != popRes.activityId || (lastPopInfo.id && lastPopInfo.time && (+new Date()) - new Date(lastPopInfo.time) > 24 * 3600 * 1000)) {
                        Util.localStorage('pastPopInfo_' + global.clubId, JSON.stringify({id: popRes.activityId, time: (+new Date())}))
                        that.popActType = popRes.activityType
                        if (that.popActType == 'coupon') { // 优惠券
                            var len = that.computedWords(popRes.activityName)
                            if (len > 10) {
                                if (len <= 12) that.popCouponActCls = 'spec-6'
                                else if (len <= 14) that.popCouponActCls = 'spec-7'
                                else if (len <= 16) that.popCouponActCls = 'spec-8'
                                else {
                                    that.popCouponActCls = 'two-line'
                                    if (len >= 32) {
                                        popRes.activityName = popRes.activityName.substr(0, 14) + '...'
                                    }
                                }
                            }
                            that.popActData = popRes
                            that.showPopCoupon = true
                        } else {
                            that.popActData = popRes
                            eventHub.$emit('change-activity-pop', true)
                        }
                    }
                }
            })

            // 抢购项目数据
            that.$http.get('../api/v2/club/paid_service_item/list', {params: {clubId: global.clubId}}).then(function (paidItemRes) {
                paidItemRes = paidItemRes.body
                if (paidItemRes.statusCode == 200) {
                    that.paidServiceItems = paidItemRes.respData || []
                }
            })
        },
        methods: {
            doClickContactClub: function () {
                var that = this
                if (that.global.clubTelephone.length == 0) {
                    Util.tipShow('暂无会所电话！')
                } else {
                    eventHub.$emit('change-tel-detail', true)
                }
            },
            doClickServiceItem: function (id) {
                this.$router.push({name: 'serviceItem', query: {top: '1', id: id}})
            },
            doClickCollectBtn: function () { // 点击收藏按钮
                var that = this
                var global = that.global
                if (!global.isLogin) {
                    Global.login(that.$router)
                    return
                }
                that.$http.get('../api/v2/profile/user/favorite/club/' + (that.isCollected ? 'delete' : 'save'), {params: {clubId: global.clubId}}).then(function (res) {
                    res = res.body
                    if (res.statusCode == 200) {
                        that.isCollected = !that.isCollected
                    } else {
                        Util.tipShow(res.msg || '操作失败！')
                    }
                })
            },
            getLocation: function (successFunc, failedFunc) {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(successFunc, function (error) {
                        var errorMsg = ''
                        switch (error.code) {
                            case error.PERMISSION_DENIED: errorMsg = '用户拒绝对获取地理位置的请求。'; break
                            case error.POSITION_UNAVAILABLE: errorMsg = '位置信息是不可用的。'; break
                            case error.TIMEOUT: errorMsg = '请求用户地理位置超时。'; break
                            case error.UNKNOWN_ERROR: errorMsg = '未知错误。'
                        }
                        typeof failedFunc === 'function' && failedFunc(errorMsg, error.code)
                    })
                } else {
                    typeof failedFunc === 'function' && failedFunc('该浏览器不支持定位。')
                }
            },
            getRad: function (d) {
                return d * Math.PI / 180.0
            },
            getGreatCircleDistance: function (lat1, lng1, lat2, lng2) {
                var EARTH_RADIUS = 6378137.0
                var that = this
                var radLat1 = that.getRad(lat1)
                var radLat2 = that.getRad(lat2)
                var a = radLat1 - radLat2
                var b = that.getRad(lng1) - that.getRad(lng2)
                var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)))
                s = s * EARTH_RADIUS
                s = Math.round(s * 10000) / 10000.0
                return s
            },
            setLocation: function (clubInfo) {
                var that = this
                var global = that.global
                if (global.currLngx && global.currLaty && clubInfo.longitude && clubInfo.latitude) {
                    var dist = ~~that.getGreatCircleDistance(global.currLaty, global.currLngx, clubInfo.longitude, clubInfo.latitude)
                    if (dist / 1000 > 1) {
                        dist = (dist / 1000).toFixed(1) + ' km'
                    } else {
                        dist += ' m'
                    }
                    that.clubDist = dist
                } else {
                    that.clubDist = '定位失败'
                }
            },
            computedWords: function (words) {
                var len = 0
                var a
                for (var i = 0; i < words.length; i++) {
                    a = words.charAt(i)
                    if (a.match(/[^\x00-\xff]/ig) != null) len += 2
                    else len += 1
                }
                return len
            },
            doClickPopCoupon: function () {
                location.href = location.origin + '/spa-manager/coupons/#home&actId=' + this.popActData.activityId + '&chanel=index'
            },
            doClosePopCoupon: function () {
                this.showPopCoupon = false
            }
        }
    }
</script>