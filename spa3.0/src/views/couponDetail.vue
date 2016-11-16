<style>
    @import '../styles/page/couponDetail.css';
</style>
<template>
    <div>
        <div class="page" id="coupon-detail-page" v-show="!global.loading">
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
            <div class="item get-records" v-show="isRepeatCoupn"
                 v-if="phoneNumsOfGet.length>0 || phoneNumsOfUse.length>0">
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
    import {Global} from '../libs/global'
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
            var _this = this
            var global = _this.global
            _this.userActId = global.currPage.query.userActId
            if (!_this.userActId) {
                return _this.$router.back()
            } else {
                global.loading = true
                _this.$http.get(_this.getDataUrl + _this.userActId, {params: {userType: 'user'}}).then(function (res) {
                    res = res.body
                    global.loading = false
                    if (res.statusCode == 200) {
                        res = res.respData
                        var userAct = res.userAct
                        var couponNo = userAct.couponNo
                        _this.isMoneyCoupon = userAct.useType == 'money'
                        _this.isRepeatCoupn = userAct.couponType == 'redpack'
                        _this.couponQrCodeUrl = userAct.couponQrCodeUrl || ''
                        userAct.couponNoText = couponNo.substr(0, 4) + ' ' + couponNo.substr(4, 4) + ' ' + couponNo.substr(8)
                        _this.couponName = _this.isMoneyCoupon ? userAct.actValue + '元' + userAct.useTypeName : userAct.actTitle
                        if ((userAct.couponStatus != '1' && userAct.couponStatus != '2') || !res.shareUrl) _this.shareStatus = 'unwork'
                        _this.useDefaultShareConfig = !(global.userAgent.isWX && (_this.shareStatus == ''))
                        res.items = res.items || []
                        if (res.items.length > 0) {
                            var items = res.items
                            var itemsArr = []
                            for (var i = 0; i < items.length; i++) {
                                itemsArr.push(items[i]['name'])
                            }
                            _this.useServiceItem = itemsArr.join('，')
                        }
                        if (_this.isRepeatCoupn && !_this.useDefaultShareConfig) {
                            _this.doHandlerShareConfig(res)
                        }
                        _this.userAct = userAct
                        _this.phoneNumsOfGet = res.phoneNums_get || []
                        _this.phoneNumsOfUse = res.phoneNums_use || []
                        _this.shareUrl = res.shareUrl
                    } else {
                        return _this.$router.back()
                    }
                })
            }
        },
        mounted: function () {
            var _this = this
            if (!_this.couponQrCodeUrl) {
                _this.getQrCodeImageUrl()
            }
        },
        methods: {
            doClickPageBack: function () {
                history.back()
            },
            getQrCodeImageUrl: function () {
                var _this = this
                if (_this.getQrCodeCount > 0) {
                    _this.getQrCodeCount--
                    _this.$http.get(_this.queryQrCodeUrl, {params: {userActId: _this.userActId}}).then(function (res) {
                        res = res.body
                        if (res.statusCode == 200 && res.respData) {
                            _this.couponQrCodeUrl = res.respData
                        } else {
                            _this.getQrCodeImageUrl()
                        }
                    })
                }
            },
            doClickShareBtn: function () {
                var _this = this
                if (_this.shareStatus == '') {
                    _this.showSharePop = true
                } else {
                    Util.tipShow('活动已过期！不可分享！')
                }
            },
            doCloseSharePop: function () {
                this.showSharePop = false
            },
            doHandlerShareConfig: function (res) {
                var _this = this
                Global.shareConfig({
                    title: res.clubName + '-' + (_this.isMoneyCoupon ? res.userAct.actValue + '元' + res.userAct.useTypeName : res.userAct.actTitle), // 分享标题
                    desc: _this.isRepeatCoupn ? '此券可在' + res.clubName + '使用，分享给朋友获得更多优惠。' : '送你一张优惠券，带上它，让你的身体爽一把。', // 分享描述
                    link: res.shareUrl, // 分享链接
                    imgUrl: res.imageUrl, // 分享图标
                    success: function () {
                        _this.showSharePop = false
                        _this.$http.get(_this.shareCallbackUrl, {params: {userActId: _this.userActId}}).then(function (shareRes) {
                            shareRes = shareRes.body
                            if (shareRes.statusCode == 200) {
                                _this.showSharePop = false
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
