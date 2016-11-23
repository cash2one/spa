<style>
    @import '../styles/page/couponDetail.css';
</style>
<template>
    <div>
        <div class="page" id="coupon-detail-page">
            <div class="page-title"><a class="back" @click="doClickPageBack()"></a>优惠券详情</div>
            <div class="club-name">{{userAct.clubName}}</div>
            <div class="coupon-info">
                <div>{{userAct.useTypeName}}</div>
                <div>{{isMoneyCoupon ? userAct.actValue+"元" : userAct.actTitle}}</div>
                <div v-show="!isMoneyCoupon || userAct.consumeMoney!=0">{{userAct.consumeMoneyDescription}}</div>
                <div>券有效期：<span>{{userAct.couponPeriod}}</span></div>
                <div>领取时间：<span>{{userAct.getDate}}</span></div>
                <div v-show="isRepeatCoupn">可用次数：<span>{{userAct.canUseSum}}次</span></div>
            </div>
            <div class="item share" v-show="isRepeatCoupn">分享给朋友<br/>朋友使用后可再获得一次使用机会
                <div :class="shareStatus" @click="doClickShareBtn()">立即分享</div>
            </div>
            <div class="item qrcode">
                <div>电子票号（使用时请出示二维码，或者优惠码）</div>
                <img alt="二维码" v-if="couponQrCodeUrl" :src="couponQrCodeUrl"/>
                <span>{{userAct.couponNoText}}</span>
            </div>
            <div class="item get-records" v-show="isRepeatCoupn" v-if="phoneNumsOfGet.length>0 || phoneNumsOfUse.length>0">
                <div>好友领取</div>
                <ul>
                    <li v-for="item in phoneNumsOfGet">{{item.phone}}
                        <div>已经领取{{couponName}}<span>{{item.date}}</span></div>
                    </li>
                    <li v-for="item in phoneNumsOfUse">{{item.phone}}
                        <div>已经使用{{couponName}}<span>{{item.date}}</span></div>
                    </li>
                </ul>
            </div>
            <div class="item desc" v-if="!isMoneyCoupon && !userAct.actDescription">
                <div>优惠说明：</div>
                <div>{{userAct.actDescription || "无"}}</div>
            </div>
            <div class="item desc content">
                <div>使用说明：</div>
                <div>券有效期：{{userAct.couponPeriod}}</div>
                <div>使用时段：{{userAct.useTimePeriod}}</div>
                <div>
                    <div v-show="useServiceItem">使用项目：仅限{{useServiceItem}}</div>
                    <div v-html="userAct.actContent"></div>
                </div>
            </div>
        </div>
        <div class="share-coupons-pop pop-modal" :class="{ active : showSharePop }" v-if="isRepeatCoupn">
            <div :class="{ active : global.userAgent.isWX }">发送给朋友或者分享到朋友圈</div>
            <div class="center-wrap" :class="{ active : !global.userAgent.isWX }">
                <div><a :href="shareUrl">{{shareUrl}}</a></div>
                <div>长按复制您的专属链接，发送给您的朋友<br/>赢取更多优惠</div>
                <div @click="doCloseSharePop()">关闭</div>
            </div>
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
                userActId: '',
                getDataUrl: '../api/v2/club/userredpacket/',
                queryQrCodeUrl: '../api/v2/club/user/coupon_qrcode',
                shareCallbackUrl: '../api/v2/club/redpacket/share',
                userAct: {},
                couponQrCodeUrl: '',
                isMoneyCoupon: false,
                isRepeatCoupn: false,
                getQrCodeCount: 3,
                phoneNumsOfGet: [],
                phoneNumsOfUse: [],
                couponName: '',
                useServiceItem: '',
                shareStatus: '',
                useDefaultShareConfig: false,
                showSharePop: false,
                shareUrl: ''
            }
        },
        created: function () {
            var that = this
            var global = that.global
            that.userActId = global.currPage.query.userActId
            if (!that.userActId) {
                return that.$router.back()
            } else {
                global.loading = true
                that.$http.get(that.getDataUrl + that.userActId, {params: {userType: 'user'}}).then(function (res) {
                    res = res.body
                    global.loading = false
                    if (res.statusCode == 200) {
                        res = res.respData
                        var userAct = res.userAct
                        var couponNo = userAct.couponNo
                        that.isMoneyCoupon = userAct.useType == 'money'
                        that.isRepeatCoupn = userAct.couponType == 'redpack'
                        that.couponQrCodeUrl = userAct.couponQrCodeUrl || ''
                        userAct.couponNoText = couponNo.substr(0, 4) + ' ' + couponNo.substr(4, 4) + ' ' + couponNo.substr(8)
                        that.couponName = that.isMoneyCoupon ? userAct.actValue + '元' + userAct.useTypeName : userAct.actTitle
                        if ((userAct.couponStatus != '1' && userAct.couponStatus != '2') || !res.shareUrl) that.shareStatus = 'unwork'
                        that.useDefaultShareConfig = !(global.userAgent.isWX && (that.shareStatus == ''))
                        res.items = res.items || []
                        if (res.items.length > 0) {
                            var items = res.items
                            var itemsArr = []
                            for (var i = 0; i < items.length; i++) {
                                itemsArr.push(items[i]['name'])
                            }
                            that.useServiceItem = itemsArr.join('，')
                        }
                        if (that.isRepeatCoupn && !that.useDefaultShareConfig) {
                            that.doHandlerShareConfig(res)
                        }
                        that.userAct = userAct
                        that.phoneNumsOfGet = res.phoneNums_get || []
                        that.phoneNumsOfUse = res.phoneNums_use || []
                        that.shareUrl = res.shareUrl
                    } else {
                        return that.$router.back()
                    }
                })
            }
        },
        mounted: function () {
            var that = this
            if (!that.couponQrCodeUrl) {
                that.getQrCodeImageUrl()
            }
        },
        methods: {
            doClickPageBack: function () {
                history.back()
            },
            getQrCodeImageUrl: function () {
                var that = this
                if (that.getQrCodeCount > 0) {
                    that.getQrCodeCount--
                    that.$http.get(that.queryQrCodeUrl, {params: {userActId: that.userActId}}).then(function (res) {
                        res = res.body
                        if (res.statusCode == 200 && res.respData) {
                            that.couponQrCodeUrl = res.respData
                        } else {
                            that.getQrCodeImageUrl()
                        }
                    })
                }
            },
            doClickShareBtn: function () {
                var that = this
                if (that.shareStatus == '') {
                    that.showSharePop = true
                } else {
                    Util.tipShow('活动已过期！不可分享！')
                }
            },
            doCloseSharePop: function () {
                this.showSharePop = false
            },
            doHandlerShareConfig: function (res) {
                var that = this
                Global.shareConfig({
                    title: res.clubName + '-' + (that.isMoneyCoupon ? res.userAct.actValue + '元' + res.userAct.useTypeName : res.userAct.actTitle), // 分享标题
                    desc: that.isRepeatCoupn ? '此券可在' + res.clubName + '使用，分享给朋友获得更多优惠。' : '送你一张优惠券，带上它，让你的身体爽一把。', // 分享描述
                    link: res.shareUrl, // 分享链接
                    imgUrl: res.imageUrl, // 分享图标
                    success: function () {
                        that.showSharePop = false
                        that.$http.get(that.shareCallbackUrl, {params: {userActId: that.userActId}}).then(function (shareRes) {
                            shareRes = shareRes.body
                            if (shareRes.statusCode == 200) {
                                that.showSharePop = false
                            }
                        })
                    },
                    cancel: function () {
                        // 用户取消分享后执行的回调函数
                    },
                    fail: function () {
                        Util.tipShow('分享失败！请稍后再试！')
                    }
                })
            }
        }
    }
</script>