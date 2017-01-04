<style>
    @import '../styles/page/technicianDetail.css';
</style>
<template>
    <div>
        <div class="page-back-btn tech-detail-page" @click="doClickPageBack()"></div>
        <div class="page-back-home" @click="doClickBackHomeBtn()">会所</div>
        <div class="page" id="technician-detail-page" :style="{ height : (global.winHeight-2.667*global.winScale*16)+'px' }">
            <div class="top" :class="{ showCounter : showCounter }">
                <div class="header">
                    <div v-if="techAvatarUrl" :style="{ backgroundImage : 'url('+techAvatarUrl+')' }"></div>
                </div>
                <div class="name">
                    <div>{{ techName }}</div>
                    <div v-show="techNo">{{ techNo }}</div>
                    <div :class="techStatus">{{ techStatus }}</div>
                </div>
                <counter v-if="showCounter" :start="counterTime" :end="counterTime" type="clock"></counter>
                <div class="desc" v-show="techDesc">{{ techDesc }}</div>
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
            <a class="view" @click="doClickViewOtherTech()">
                <div class="icon"></div>
                <div class="arrow"></div>
                <div>查看店内其他技师</div>
            </a>
            <div class="service-item" v-show="serviceItems.length>0">
                <div class="title">选择项目<div></div></div>
                <div class="wrap">
                    <div class="item" v-for="service in serviceItems" :class="{ selected : service.id == currSelectItem }" @click="doSelectServiceItem(service.id)">
                        <div></div>
                        <div :style="{ backgroundImage : 'url('+service.imageUrl+')' }"></div>
                        <div>{{ service.name }}</div>
                        <div>
                            <div>{{service.price1 | itemPriceFormatter(service.duration1,service.durationUnit)}}</div>
                            <div v-show="service.price2">{{service.price2 | itemPriceFormatter(service.duration2,service.durationUnitPlus)}}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="tech-detail-footer-wrap">
            <a @click="doClickCommentBtn()">点评</a>
            <a @click="doClickRewardBtn()">打赏</a>
            <router-link :to="{ name : 'chat', query : { techId: techId, clubId: clubId } }">聊天</router-link>
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
                    <div class="coupon-item paid" v-for="coupon in paidCoupons" @click="doViewPaidCoupon(coupon)">
                        <div>
                            <div>{{ coupon.actTitle }}</div>
                            <div>{{ coupon.consumeMoneyDescription }}</div>
                        </div>
                        <div>
                            <div>点钟券</div>
                            <div @click="doGetPaidCoupon(coupon,$event)">立即购买</div>
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
                            <div :class="{ disabled: coupon.getFlag=='already_get' || coupon.getFlag == 'finish_get' }" @click="doGetOrdinaryCoupon(coupon,$event)">{{ (coupon.getFlag == 'already_get' ? '已领取' : (coupon.getFlag == 'finish_get' ? '已领完' :'立即领取')) }}</div>
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
    import { IM } from '../libs/im'

    module.exports = {
        data: function () {
            return {
                global: Global.data,
                isCrossInner: false, // 是否已经与内网对接
                showCounter: false,
                counterTime: '',
                authCode: '',

                techId: '', // 技师ID
                techChatId: '', // 技师聊天ID
                clubId: '', // 会所ID
                techAvatarUrl: '',   // 技师头像
                techAvatar: '', // 技师头像ID
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
                showCouponList: false, // 是否显示优惠券列表

                payRequestObj: null,
                payTarget: null,
                payCoupon: null
            }
        },
        created: function () {
            var that = this
            var global = that.global
            var query = global.currPage.query
            if (query.id == undefined) { // 链接上无技师id
                Util.tipShow(global.visitError)
                return that.$router.back()
            }

            that.authCode = query.code || global.code
            if (global.userAgent.isWX) {
                if (!global.openId || global.openId.length < 10) {
                    if ((+new Date()) - (query['_t'] || 0) > 24000 || !that.payAuthCode) {
                        Global.getOauthCode('', '9358', 'confirm-tech-pay', 'base')
                        return
                    } else {
                        Global.getOpenId({authCode: that.authCode, state: 'confirm-tech-pay'}).then(function (openId) {
                            global.openId = openId
                            that.init()
                        }, function (error) {
                            Util.tipShow(error)
                            return that.$router.back()
                        })
                    }
                } else {
                    that.init()
                }
            } else {
                that.init()
            }
        },
        methods: {
            init: function () {
                var that = this
                var global = that.global
                var query = global.currPage.query

                // 查询技师数据
                that.$http.get('../api/v2/club/technician/{techId}', {params: {techId: query.id}}).then(function (res) {
                    res = res.body
                    if (res && res.info) {
                        var info = res.info
                        that.techId = res.id
                        that.techChatId = res.emchatId
                        that.clubId = info.clubId
                        that.techAvatarUrl = info.avatarUrl || global.defaultHeader
                        that.techAvatar = info.avatar || ''
                        that.techName = info.name || global.defaultTechName
                        that.techNo = info.serialNo || ''
                        that.techStatus = {free: '闲', busy: '忙', rest: '休'}[info.status || 'free']
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

                        that.isCrossInner = res.hasInnerProvider == 'true'
                        if (that.isCrossInner && info.status == 'busy' && info.endTime) {
                            var endTime = (+new Date(info.endTime.replace(/-/g, '-')))
                            if (endTime - (+new Date()) > 0) {
                                that.counterTime = info.endTime
                                that.showCounter = true
                            }
                        }

                        // 设置分享
                        if (global.userAgent.isWX) {
                            Global.shareConfig({
                                title: that.techName + '欢迎您',
                                desc: '点我聊聊，更多优惠，更好服务！',
                                link: location.origin + '/spa-manager/spa/#/' + that.clubId + '/technicianDetail?visitChannel=9358&isNeedFollow=true&id=' + that.techId,
                                imgUrl: that.techAvatarUrl
                            }, 'technicianDetail-' + that.techId)
                        }

                        // 获取优惠券数据
                        that.getCouponData()
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
            doClickPageBack: function () { // 点击返回按钮
                history.back()
            },
            doClickViewOtherTech: function () { // 查看店内其他技师
                var that = this
                var global = that.global
                if (global.pageMode == 'club') {
                    that.$router.push({name: 'technicianList'})
                } else {
                    that.$router.push({path: '/' + that.clubId + '/technicianList', query: {clubsource: '9358'}})
                }
            },
            doClickBackHomeBtn: function () { // 点击回到主页的按钮
                var that = this
                var global = that.global
                if (global.pageMode == 'club') {
                    that.$router.push({name: 'home'})
                } else {
                    that.$router.push({path: '/' + that.clubId + '/home'})
                }
            },
            doSelectServiceItem: function (itemId) { // 选择服务项目
                var that = this
                if (that.currSelectItem == itemId) {
                    that.currSelectItem = ''
                } else {
                    that.currSelectItem = itemId
                }
            },
            doClickRewardBtn: function () { // 点击打赏按钮
                var that = this
                that.$router.push({name: 'techReward', query: {techId: that.techId}})
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
                        } else if (that.isCrossInner && !that.currSelectItem) {
                            Util.tipShow('必须选择一个服务项目！', 4000)
                        } else {
                            that.$router.push({
                                name: 'confirmOrder',
                                query: {techId: that.techId, itemId: that.currSelectItem, clubId: that.clubId}
                            })
                        }
                    } else {
                        Util.tipShow('会所不支持线上预约！')
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
            switchCouponListStatus: function (type) { // 切换优惠券的显示
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
            doViewPaidCoupon: function (coupon) {
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
            },
            getCouponData: function () { // 获取优惠券数据
                var that = this
                that.$http.get('../api/v2/club/{clubId}/coupons', {params: {clubId: that.clubId}}).then(function (res) {
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
            doGetPaidCoupon: function (coupon, event) { // 点击购买点钟券
                event.stopPropagation()
                var that = this
                var global = that.global
                var target = event.target
                var targetCls = target.classList
                var chanel = global.currPage.query.chanel || 'link'

                if (!global.userAgent.isWX) {
                    return Util.tipShow('需在微信中打开才可购买！')
                }
                if (!global.isLogin) {
                    Util.tipShow('请您先登录！')

                    // 登录之后跳转到paidCoupon页面
                    Global.login(that.$router, 'paidCoupon', {
                        actId: coupon.actId,
                        techCode: that.techInviteCode,
                        chanel: chanel
                    })
                    return
                } else if (!global.userTel) {
                    Global.login(null)
                    Global.bindTelPhone(false)
                    return
                } else if (targetCls.contains('processing')) {
                    Util.tipShow('购买中,请稍候...')
                } else {
                    targetCls.add('processing')
                    target.innerHTML = '购买中...'

                    that.$http.post('../api/v2/wx/pay/paid_coupon', {
                        actId: coupon.actId,
                        businessType: 'paid_coupon',
                        businessChannel: chanel,
                        clubId: that.clubId,
                        money: coupon.actValue,
                        openId: global.openId,
                        techId: that.techId,
                        tradeChannel: 'wx'
                    }).then(function (res) {
                        res = res.body
                        if (res.statusCode == 200) {
                            that.payRequestObj = JSON.parse(res.respData)
                            that.payTarget = target
                            that.payCoupon = coupon
                            if (typeof WeixinJSBridge == 'undefined') {
                                document.addEventListener('WeixinJSBridgeReady', function () {
                                    that.onBridgeReady()
                                }, false)
                            } else {
                                that.onBridgeReady()
                            }
                        } else if (res.statusCode == 935801) {
                            Util.localStorage('paid-coupon-param', true)
                            Global.getOauthCode('', '9358', 'paid-coupon', 'base')
                        } else {
                            targetCls.remove('processing')
                            target.innerHTML = '立即购买'
                            Util.tipShow(res.msg || '购买点钟券请求失败！')
                        }
                    }, function () {
                        targetCls.remove('processing')
                        target.innerHTML = '立即购买'
                    })
                }
            },
            onBridgeReady: function () {
                var that = this
                var payRequestObj = that.payRequestObj
                var target = that.payTarget
                var payCoupon = that.payCoupon
                WeixinJSBridge.invoke('getBrandWCPayRequest', {
                    appId: payRequestObj.appId,
                    timeStamp: payRequestObj.timeStamp + '',
                    nonceStr: payRequestObj.nonceStr,
                    package: payRequestObj.package,
                    signType: payRequestObj.signType,
                    paySign: payRequestObj.paySign
                }, function (res) {
                    target.classList.remove('processing')
                    target.innerHTML = '立即购买'
                    if (res.err_msg.indexOf('ok') >= 0) {
                        Util.tipShow('支付成功！')
                        target.innerHTML = '购买成功'

                        // 发送购买了点钟券的消息
                        IM.sendTextMessage({
                            to: that.techChatId,
                            data: '您购买了' + that.techName + '的"' + payCoupon.actTitle + '"',
                            msg: payCoupon.actTitle + '&' + payCoupon.actId,
                            ext: {
                                msgType: 'paidCouponTip'
                            }
                        }, {
                            id: that.techChatId,
                            name: that.techName,
                            header: that.techAvatarUrl,
                            avatar: that.techAvatar,
                            userNo: that.techNo,
                            userId: that.techId,
                            clubId: that.clubId,
                            userType: 'tech'
                        }, function () {
                            // 跳转到点钟券详情页
                            that.$router.push({name: 'paidCouponDetail', query: {userActId: payRequestObj.bizId}})
                        })
                    }
                })
            },
            doGetOrdinaryCoupon: function (coupon, event) { // 点击领取优惠券
                var that = this
                var global = that.global
                var target = event.target
                var targetCls = target.classList

                if (targetCls.contains('disabled')) {
                    return
                }
                if (!global.isLogin) {
                    Global.login(that.$router)
                    return
                } else if (!global.userTel) {
                    Global.login(null)
                    Global.bindTelPhone(false)
                    return
                } else if (targetCls.contains('processing')) {
                    Util.tipShow('领取中,请稍候...')
                } else {
                    targetCls.add('processing')
                    target.innerHTML = '领取中...'
                    that.$http.get('../api/v2/club/get/redpacket', {params: {
                        actId: coupon.actId,
                        phoneNum: global.userTel,
                        openId: global.openId,
                        techCode: that.techInviteCode
                    }}).then(function (res) {
                        res = res.body
                        targetCls.remove('processing')
                        target.innerHTML = '立即领取'
                        if (res.statusCode == 200) {
                            if (coupon.userGetCount > coupon.userGetCounts + 1) {
                                coupon.userGetCounts = coupon.userGetCounts + 1
                            } else {
                                targetCls.add('disabled')
                                target.innerHTML = '已领取'
                            }
                        } else if (res.statusCode == 206) {
                            targetCls.add('disabled')
                            target.innerHTML = '已领取'
                            Util.tipShow(res.msg || '你已经领取过了！')
                        } else {
                            Util.tipShow(res.msg || '领取失败！')
                        }
                    }, function () {
                        Util.tipShow('领取失败！')
                        targetCls.remove('processing')
                        target.innerHTML = '立即领取'
                    })
                }
            }
        },
        filters: {
            itemPriceFormatter: ItemPriceFormatter
        }
    }
</script>