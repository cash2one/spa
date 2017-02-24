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
                        <div @click="doClickBannerPic(pic.link)"></div>
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

            <div class="journal" v-show="journal.id">
                <div><span @click="doClickJournal()">{{ journal.title }}</span><router-link :to="{ name: 'journalList' }">全部</router-link></div>
            </div>

            <div class="recommend tech" v-if="techs.length>0">
                <div class="title"><div>点我聊聊</div><router-link :to="{ name: 'technicianList' }">全部</router-link></div>
                <home-tech :techs="techs"></home-tech>
            </div>

            <div class="recommend act" v-show="paidServiceItems.length>0">
                <div class="title"><div>热门活动</div><router-link :to="{ name: 'activities' }">全部</router-link></div>
                <template v-for="item in paidServiceItems">
                    <paid-service-act v-if="item.actType == 'paid_item'" :act-data="item"></paid-service-act>
                    <one-yuan-act v-if="item.actType == 'one_yuan'" :act-data="item"></one-yuan-act>
                </template>
            </div>

            <div class="recommend onceCard" v-show="onceCards.length>0">
                <div class="title"><div>特惠商城</div><router-link :to="{ name: 'discountMall' }">全部</router-link></div>
                <ul class="clear-fix">
                    <router-link class="onceCard" v-for="item in onceCards" tag="li" :class="{ sellOut: item.statusName=='已售完', expired: item.statusName=='已过期' }" :to="{ name: 'onceCardDetail', query: { id: item.id } }">
                        <div :style="{'background-image': 'url('+(item.imageUrl || global.defaultServiceItemImgUrl)+')'}"><div>{{ item.name }}</div></div>
                        <div><b>{{ item.plan.price }}</b>元/次<span>买{{ item.plan.paidCount }}送{{ item.plan.giveCount }}</span></div>
                        <div>{{ Math.round(item.plan.itemAmount/100) }}元/次<div v-if="item.progress">{{ item.progress }}%<div :style="{ left: item.progress +'%' }"></div></div></div>
                        <div v-if="item.id==newOnceCardId" class="new">最新</div>
                        <div v-else-if="item.id==bestOnceCardId" class="best">最优惠</div>
                    </router-link>
                </ul>
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

        <!--电话号码-->
        <tel-detail v-if="global.clubTelephone.length>0" :telephone="global.clubTelephone"></tel-detail>

        <!--抢优惠按钮-->
        <router-link class="home-coupon" :to="{ name: 'activities' }" v-show="!global.loading">
            <div></div>
            <span>抢优惠</span>
        </router-link>

        <!--coupon的弹窗-->
        <div id="home-red-pack" class="pop-modal" v-if="popActType == 'coupon'" :class="{ active : showPopCoupon }">
            <div @click="doClickPopCoupon()"><div :class="popCouponActCls"><div>{{ popActData.activityName }}</div></div></div>
            <div @click="doClickPopCoupon()">领取红包</div>
            <div @click="doClosePopCoupon()"></div>
        </div>

        <!--其他活动的弹窗-->
        <activity-pop v-if="popActType != 'coupon'" :act-data="popActData"></activity-pop>
    </div>
</template>
<script>
    import { Global } from '../libs/global'
    import { eventHub } from '../libs/hub'
    import ActivityPop from '../components/activity-pop'
    import Util from '../libs/util'

    module.exports = {
        components: {
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
                journal: {
                    id: '', title: '', templateId: 1
                },

                onceCards: [], // 次卡数据
                newOnceCardId: '', // 最新的次卡ID
                bestOnceCardId: '', // 最优惠的次卡ID

                swiperOption: { // banner图
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
        created: function () {
            var that = this
            var global = that.global

            // 请求主页数据
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

                    if (res.journal) {
                        that.journal = res.journal
                    }

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
                    if (!popRes) {
                        return
                    }
                    // 上次的弹窗数据
                    var lastPopInfo = Util.localStorage('pastPopInfo_' + global.clubId)
                    if (lastPopInfo) {
                        lastPopInfo = JSON.parse(lastPopInfo)
                    }
                    // 是否弹窗
                    if (!lastPopInfo || lastPopInfo.id != popRes.id || (lastPopInfo.id && lastPopInfo.time && (+new Date()) - new Date(lastPopInfo.time) > 24 * 3600 * 1000)) {
                        Util.localStorage('pastPopInfo_' + global.clubId, JSON.stringify({id: popRes.id, time: (+new Date())}))
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
                    paidItemRes = paidItemRes.respData || []
                    var actList = []
                    var actItem
                    for (var k = 0; k < paidItemRes.length; k++) {
                        actItem = paidItemRes[k]
                        if (/^(paid_item|one_yuan)$/.test(actItem.actType)) {
                            actList.push(actItem)
                        }
                    }
                    that.paidServiceItems = actList
                }
            })

            // 次卡数据
            that.$http.get('../api/v2/club/once_card/activity/list', {params: {clubId: global.clubId}}).then(function (onceCardRes) {
                onceCardRes = onceCardRes.body
                if (onceCardRes.statusCode == 200) {
                    onceCardRes = onceCardRes.respData
                    if (onceCardRes && onceCardRes.activityList.length > 0) {
                        var cards = onceCardRes.activityList
                        var cardList = []
                        cardList.push(cards[0])
                        that.newOnceCardId = cardList[0].id
                        var count = 1
                        if (cards[0].id != onceCardRes.optimalActivity.id) {
                            cardList.push(onceCardRes.optimalActivity)
                            that.bestOnceCardId = cardList[1].id
                        }
                        while (cardList.length <= 3 && count < cards.length) {
                            if (cards[count].id != onceCardRes.optimalActivity.id) {
                                cardList.push(cards[count])
                            }
                            count++
                        }
                        var cardItem
                        var plan
                        var price
                        for (count = 0; count < cardList.length; count++) {
                            cardItem = cardList[count]
                            if (cardItem.totalCount != 0 && cardItem.paidCount > cardItem.totalCount * 0.49) {
                                cardItem.progress = (cardItem.paidCount / cardItem.totalCount) * 100
                            }
                            for (var i = 0; i < cardItem.onceCardPlans.length; i++) {
                                plan = cardItem.onceCardPlans[i]
                                if (plan.optimal == 'Y') {
                                    price = plan.actAmount / 100 / (plan.giveCount + plan.paidCount)
                                    if (price > 1.001) {
                                        price = Math.round(price)
                                    } else {
                                        if (price < 0.01) {
                                            price = 0.01
                                        }
                                        price = price.toFixed(2)
                                    }
                                    plan.price = price
                                    cardItem.plan = plan
                                    break
                                }
                            }
                        }
                        that.onceCards = cardList
                    }
                }
            })
        },
        methods: {
            doClickBannerPic: function (link) {
                if (link) {
                    location.href = link
                }
            },
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
            doClickJournal: function () {
                var journal = this.journal
                location.href = location.origin + '/spa-manager/journal/#/' + journal.templateId + '/?id=' + journal.id
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