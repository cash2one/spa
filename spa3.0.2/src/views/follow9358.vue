<style>
    @import '../styles/page/follow9358.css';
</style>
<template>
    <div class="page" id="follow9358-page" :style="{ height : global.winHeight+'px' }">
        <div>
            <div class="top">
                <div class="club-info">
                    <div v-if="resData.imageUrl" :style="{ backgroundImage : 'url('+resData.imageUrl+')' }" class="logo"></div>
                    <div class="info">
                        <div>{{ resData.name }}</div>
                        <div v-show="resData.serialNo && isTech">{{ resData.serialNo }}</div>
                    </div>
                </div>
                <div class="tech-list" :class="{ club : !isTech && images.length>0 }">
                    <div v-for="img in images" :style="{ backgroundImage : 'url('+(img || global.defaultHeader)+')' }"></div>
                </div>
                <div class="coupon-info" :class="{ club : !isTech }">
                    <div>
                        <div>{{ resData.couponTitle }}</div>
                        <div>
                            <div>
                                <div>￥</div>
                                <div :class="couponValueCls">{{ resData.couponValue }}</div>
                            </div>
                            <div>
                                <div>关注会所，</div>
                                <div>领取更多优惠券</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="qr-code" v-if="resData.qrCodeUrl"><img alt="二维码图片加载失败" :src="resData.qrCodeUrl"></div>
                <div class="attention">
                    <div :class="{ club : !isTech }">
                        <div>{{ isTech ? '长按识别二维码，' : '更多活动信息，'}}</div>
                        <div>{{ isTech ? '来"9358"约我吧~' : '长按关注会所~' }}</div>
                    </div>
                </div>
            </div>
            <div class="bottom"></div>
        </div>
    </div>
</template>
<script>
    import { Global } from '../libs/global'

    module.exports = {
        data: function () {
            return {
                global: Global.data,
                resData: {},
                isTech: false,
                images: [],
                couponValueCls: ''
            }
        },
        created: function () {
            var that = this
            var global = that.global
            var query = global.currPage.query
            var isTech = false

            if (query.techId) {
                isTech = true
            }
            that.isTech = isTech
            that.$http.get('../api/v2/club/clubortech/view', {
                params: {
                    id: isTech ? query.techId : global.clubId,
                    type: isTech ? 'tech' : 'club'
                }
            }).then(function (res) {
                res = res.body
                if (res.statusCode == 200) {
                    res = res.respData
                    if (!res.imageUrl) {
                        res.imageUrl = isTech ? global.defaultHeader : global.defaultClubLogo
                    }
                    if (res.couponValue) {
                        var len = res.couponValue.toString().length
                        if (len >= 6) {
                            that.couponValueCls = 'small'
                        } else if (len >= 4) {
                            that.couponValueCls = 'big'
                        }
                    }
                    res.qrCodeUrl = res.qrCodeUrl || res.qrcodeUrl
                    that.images = res.images || []
                    that.resData = res
                } else {
                    that.$router.push({name: 'home'})
                }
            })
        }
    }
</script>