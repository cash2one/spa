<style>
    @import '../styles/page/technicianDetail.css';
</style>
<template>
    <div>
        <div class="page-back-btn tech-detail-page" @click="doClickPageBack()"></div>
        <div class="page-back-home" @click="doClickBackHomeBtn()">会所</div>
        <div class="page" id="technician-detail-page" :style="{ height : (global.winHeight-2.667*global.winScale*16)+'px' }">
            <div class="top">
                <div class="header">
                    <div v-if="techAvatarUrl" :style="{ backgroundImage : 'url('+techAvatarUrl+')' }"></div>
                </div>
                <div class="name">
                    <div>{{ techName }}</div>
                    <div v-show="techNo">{{ techNo }}</div>
                    <div :class="techStatus">{{ techStatus=='free' ? '闲' : '忙' }}</div>
                </div>
                <div class="desc">{{ techDesc }}</div>
                <div class="favorite" @click="doClickCollectBtn()" :class="{ collected : isFavorite }">
                    <div></div>
                    <div>{{ favoriteCount }}</div>
                    <span :class="{ active : showCollectedAni }">{{ collectedText }}</span>
                </div>
            </div>
            <div class="pics" v-show="techPics.length>0">
                <div>
                    <router-link v-for="pic in techPics" :style="{ backgroundImage : 'url('+pic.imageUrl+')' }" :to="{ name : 'technicianImg' , query : { id : techId , index : pic.orders }}"></router-link>
                </div>
            </div>
            <router-link class="comment" :to="{ name : 'review' , query : { id : techId }}">
                <div class="icon"></div>
                <div class="arrow"></div>
                <div>所有评论</div>
                <div>
                    <div class="stars"><div :style="{ width : techStar+'%'}"></div></div>
                    <div>{{ techCommentCount }}评论</div>
                </div>
            </router-link>
            <router-link class="view" :to="{ name : 'technicianList' }">
                <div class="icon"></div>
                <div class="arrow"></div>
                <div>查看店内其他技师</div>
            </router-link>
            <div class="service-item" v-show="serviceItems.length>0">
                <div class="title">选择项目<div></div></div>
                <div class="wrap">
                    <div class="item" v-for="service in serviceItems" :class="{ selected : service.id == currSelectItem }" @click="doSelectServiceItem(service.id)">
                        <div></div>
                        <div :style="{ backgroundImage : 'url('+service.imageUrl+')' }"></div>
                        <div>{{service.name}}</div>
                        <div>
                            <div>{{service.price1 | itemPriceFormatter(service.duration1,service.durationUnit)}}</div>
                            <div v-show="service.price2">{{service.price2 | itemPriceFormatter(service.duration2,service.durationUnitPlus)}}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="tech-detail-footer-wrap">
            <a @click="doClickCommentBtn()"><i></i>点评</a>
            <a @click="doClickRewardBtn()"><i></i>打赏</a>
            <router-link :to="{ name : 'chat', query : { techId : techId } }"><i></i>聊天</router-link>
            <a @click="doClickOrderBtn()" :class="{ active : canOrder }">预约</a>
        </div>
        <tel-detail v-if="telephone.length>0" :telephone="telephone"></tel-detail>
        <div class="club-coupon" :class="{ hide : paidCoupons.length==0 && ordinaryCoupons.length==0 }" @click="switchCouponListStatus(true)">
            <div></div>
            <span>抢优惠</span></div>
        <div class="coupon-list" :class="{ active : showCouponList }">
            <div>
                <div class="title"><span>抢优惠</span>
                    <div @click="switchCouponListStatus(false)">&times;</div>
                </div>
                <div class="list">
                    <div class="coupon-title" v-if="paidCoupons.length>0">点钟券</div>
                    <div class="coupon-item paid" v-for="coupon in paidCoupons" @click="doClickPaidCoupon(coupon)">
                        <div>
                            <div>{{ coupon.actTitle }}</div>
                            <div>{{ coupon.consumeMoneyDescription }}</div>
                        </div>
                        <div>
                            <div>点钟券</div>
                            <div>立即购买</div>
                        </div>
                    </div>
                    <div class="coupon-title" v-if="ordinaryCoupons.length>0">优惠券</div>
                    <div class="coupon-item ordinary" v-for="coupon in ordinaryCoupons">
                        <div>
                            <div>{{ coupon.actTitle }}</div>
                            <div>{{(coupon.useType == 'money' ? (coupon.actValue+'元现金券，') : '') +coupon.consumeMoneyDescription}}</div>
                        </div>
                        <div>
                            <div>{{coupon.useTypeName}}</div>
                            <div>{{ (coupon.getFlag == 'already_get' ? '已领取' : (coupon.getFlag == 'finish_get' ? '已领完' :'立即领取')) }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import { Global } from '../libs/global'
    import Util from '../libs/util'
    import { eventHub } from '../libs/hub'
    import ItemPriceFormatter from '../filters/item-price-formatter'

    module.exports = {
        data: function () {
            return {
                global: Global.data,
                techId: '', // 技师ID
                techAvatarUrl: '',   // 技师头像
                techName: '', // 技师名称
                techNo: '', // 技师编号
                techStatus: '', // 技师状态
                techDesc: '', // 技师自评
                techInviteCode: '', // 技师邀请码
                favoriteCount: 0, // 技师收藏数

                techPics: [], // 技师相片
                techCommentCount: 0, // 技师评论数
                techStar: 0, // 技师星级
                serviceItems: [], // 服务项目列表
                canComment: false, // 是否可评论
                isFavorite: false, // 是否已收藏
                collectedAniTimer: null,
                showCollectedAni: false,
                collectedText: '',

                canOrder: true, // 是否可以预约
                phoneAppointment: '',
                appointment: '',
                payAppointment: '',
                telephone: [], // 电话
                currSelectItem: '', // 当前选中的项目
                paidCoupons: [], // 点钟券数据
                ordinaryCoupons: [], // 普通优惠券数据
                showCouponList: false // 是否显示优惠券列表
            }
        },
        mounted: function () {
            var that = this
            var global = that.global
            // 获取优惠券数据
            that.$http.get('../api/v2/club/{clubId}/coupons', {params: {clubId: global.clubId}}).then(function (res) {
                res = res.body
                if (res && res.statusCode == 200) {
                    res = res.respData.coupons || []
                    res.sort(function (a, b) {
                        return a.useType >= b.useType ? ((b.consumeMoney - b.actValue) - (a.consumeMoney - a.actValue)) : -1
                    })
                    for (var i = 0, len = res.length; i < len; i++) {
                        if (res[i]['couponType'] == 'paid') { // 点钟券
                            that.paidCoupons.push(res[i])
                        } else {
                            that.ordinaryCoupons.push(res[i])
                        }
                    }
                }
            })
        },
        created: function () {
            var that = this
            var global = that.global
            var query = global.currPage.query
            if (query.id == undefined) { // 链接上无技师id
                Util.tipShow(global.visitError)
                return that.$router.back()
            }
            // 查询技师数据
            that.$http.get('../api/v2/club/technician/{techId}', {params: {techId: query.id}}).then(function (res) {
                res = res.body
                if (res && res.info) {
                    var info = res.info
                    that.techId = res.id
                    that.techAvatarUrl = info.avatarUrl || global.defaultHeader
                    that.techName = info.name || global.defaultTechName
                    that.techNo = info.serialNo || ''
                    that.techStatus = info.status || 'free'
                    that.favoriteCount = parseInt(res.favoriteCount || 0)
                    that.techInviteCode = info.inviteCode || ''
                    that.techCommentCount = info.commentCount || 0
                    that.techStar = info.star || 0
                    that.techDesc = info.description
                    that.serviceItems = res.service || []
                    that.canComment = res.toDayCommentCount != 1
                    that.isFavorite = (res['isFavorite'] || 'n').toLowerCase() == 'y'
                    that.canOrder = (res['appointment'] || 'y').toLowerCase() != 'n' || (res['phoneAppointment'] || 'y').toLowerCase() != 'n'
                    that.phoneAppointment = (res.phoneAppointment || 'y').toLowerCase()
                    that.appointment = (res.appointment || 'y').toLowerCase()
                    that.telephone = res.telephone ? res.telephone.split(',') : []
                    that.payAppointment = res.payAppointment || 'N'
                    global.loading = false
                } else {
                    Util.tipShow(global.loadError)
                    that.$router.back()
                }
            }, function () {
                Util.tipShow(global.loadError)
                that.$router.back()
            })

            // 查询技师相册
            that.$http.get('../api/v2/club/tech/albums/{techId}', {params: {techId: query.id}}).then(function (picRes) {
                picRes = picRes.body
                if (picRes.statusCode == 200) {
                    picRes = picRes.respData
                    // 技师相册缓存到global
                    if (picRes) {
                        var pageData = global.pageData
                        if (!pageData['technicianImg']) {
                            pageData['technicianImg'] = {}
                        }
                        picRes.sort(function (pic1, pic2) { return pic1.orders > pic2.orders })
                        pageData['technicianImg'][query.id] = picRes
                        that.techPics = picRes
                    }
                }
            })
        },
        methods: {
            doClickPageBack: function () { // 点击返回按钮
                history.back()
            },
            doClickBackHomeBtn: function () { // 点击回到主页的按钮

            },
            doSelectServiceItem: function (itemId) {
                this.currSelectItem = itemId
            },
            doClickRewardBtn: function () { // 点击打赏按钮
                var that = this
                if (that.global.userAgent.isWX) {
                    that.$router.push({
                        name: 'techReward',
                        query: {techId: that.techId}
                    })
                } else {
                    Util.tipShow('请在微信中打开！')
                }
            },
            doClickOrderBtn: function () { // 点击预约按钮
                var that = this
                if (that.canOrder) {
                    if (that.phoneAppointment != 'n') {
                        if (!that.global.isLogin) { // 未登录，跳转到登录页
                            that.$router.push({name: 'login'})
                        } else if (that.telephone.length == 0) {
                            Util.tipShow('暂无联系电话！')
                        } else {
                            eventHub.$emit('change-tel-detail', true)
                        }
                    } else if (that.appointment != 'n') {
                        if (that.payAppointment == 'Y' && !that.global.userAgent.isWX) {
                            Util.tipShow('此会所需支付预约，请在微信客户端中打开！')
                        } else {
                            that.$router.push({
                                name: 'confirmOrder',
                                query: {
                                    techId: that.techId,
                                    itemId: that.currSelectItem,
                                    clubId: ''
                                }
                            })
                        }
                    }
                }
            },
            doClickCommentBtn: function () { // 点击点评按钮
                var that = this
                if (that.canComment) {
                    that.$router.push({
                        name: 'comment',
                        query: {techId: that.techId, type: 'tech'}
                    })
                } else {
                    Util.tipShow('您今天已经评论过该技师了！')
                }
            },
            switchCouponListStatus: function (type) {
                this.showCouponList = type
            },
            doClickCollectBtn: function () { // 点击收藏按钮
                var that = this
                var global = that.global
                if (!global.isLogin) {
                    Global.login(that.$router)
                    return
                }
                if (that.collectedAniTimer) {
                    clearTimeout(that.collectedAniTimer)
                    that.showCollectedAni = false
                }
                that.$http.get('../api/v2/profile/user/favorite/' + (that.isFavorite ? 'delete' : 'create'), {params: {id: that.techId}}).then(function () {
                    that.isFavorite = !that.isFavorite
                    if (that.isFavorite) {
                        that.collectedText = '已收藏'
                        that.favoriteCount += 1
                    } else {
                        that.collectedText = '已取消'
                        that.favoriteCount -= 1
                    }
                    that.showCollectedAni = true
                    that.collectedAniTimer = setTimeout(function () {
                        that.showCollectedAni = false
                    }, 1100)
                }, function (error) {
                    console.log('error' + JSON.stringify(error))
                })
            },
            doClickPaidCoupon: function (coupon) {
                var that = this
                var global = that.global
                that.$router.push({
                    name: 'paidCoupon',
                    query: {
                        actId: coupon.actId,
                        techCode: that.techInviteCode,
                        chanel: global.currPage.query.chanel || 'link'
                    }
                })
            }
        },
        filters: {
            itemPriceFormatter: ItemPriceFormatter
        }
    }
</script>