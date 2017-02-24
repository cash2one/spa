<style>
    @import '../styles/page/onceCardOrderDetail.css';
</style>
<template>
    <div class="page" id="once-card-order-detail-page">
        <page-title title-text="次卡订单"></page-title>
        <router-link class="title" :to="{ path: '/'+clubId+'/home' }" tag="div"><div :style="{ 'background-image': 'url('+clubLogo+')' }"></div><span>{{ clubName }}</span></router-link>
        <router-link class="service-item" tag="div" :to="{ name: 'onceCardDetail', query: { id: cardId } }">
            <div :style="{ 'background-image': 'url('+orderData.imgUrl+')' }"></div>
            <div>{{ orderData.itemName }}</div>
            <div>总价：<span>{{ orderData.amount | MoneyFormatter }}</span>元</div>
            <div>{{ orderData.useEndTime ? '有效期至：'+orderData.useEndTime : '长期有效' }}</div>
        </router-link>
        <div class="ope-wrap">
            <div :class="{ active: currShowIndex==0 }" @click="doSwitchList(0)">{{ orderData.status == 2 ? '失效': '可用' }}（<span>{{ orderData.totalCount - orderData.usedCount }}</span>）</div>
            <div :class="{ active: currShowIndex==1 }" @click="doSwitchList(1)">已用（<span>{{ orderData.usedCount }}</span>）</div>
        </div>

        <!--可用券列表-->
        <div class="can-use list" v-show="currShowIndex==0">
            <div class="no-data" v-show="canUseList.length == 0">已经全部用完啦~</div>
            <div class="item" v-show="canUseList.length !=0">
                <h4>{{ orderData.itemName }}券</h4>
                <div class="coupon" v-for="(coupon,index) in canUseList">
                    <div>券{{ index + 1 }}</div>
                    <img alt="核销二维码" :src="coupon.codeImgUrl"/>
                    <div>核销码：<span>{{ coupon.couponNoStr }}</span></div>
                </div>
            </div>
        </div>

        <!--已用券列表-->
        <div class="used list" v-show="currShowIndex==1">
            <div class="no-data" v-show="usedList.length == 0">还没有使用记录~</div>
            <div class="item" v-show="usedList.length != 0">
                <h4>{{ orderData.itemName }}券</h4>
                <div class="coupon" v-for="(coupon,index) in canUseList">
                    <div>券{{ index+1 }}</div>
                    <img alt="核销二维码" :src="coupon.codeImgUrl"/>
                    <div>核销码：<span>{{ coupon.couponNoStr }}</span></div>
                    <div>使用时间：{{ coupon.modifyDate }}</div>
                </div>
            </div>
        </div>

        <router-link class="submit-button footer" :to="{ name: 'discountMall' }" tag="div">逛商城、找优惠</router-link>
    </div>
</template>
<script>
    import { Global } from '../libs/global'
    import Util from '../libs/util'
    import MoneyFormatter from '../filters/money-formatter'
    import 'jr-qrcode'

    module.exports = {
        filters: {
            MoneyFormatter: MoneyFormatter
        },
        data: function () {
            return {
                global: Global.data,
                orderId: '',
                cardId: '',
                clubLogo: '',
                clubName: '',
                clubId: '',
                orderData: {
                    imgUrl: '',
                    itemName: '',
                    amount: '',
                    useEndTime: '',
                    totalCount: 0,
                    usedCount: 0,
                    status: ''
                },
                canUseList: [],
                usedList: [],
                currShowIndex: 0
            }
        },
        created: function () {
            var that = this
            var global = that.global
            var query = global.currPage.query

            that.orderId = query.id
            if (!that.orderId) {
                Util.tipShow(global.visitError)
                return that.$router.back()
            }
            that.$http.get('../api/v2/club/once_card/order/detail', {params: {orderId: that.orderId}}).then(function (res) {
                res = res.body
                if (res.statusCode == 200) {
                    res = res.respData
                    var orderData = res.order
                    var thisOrderData = that.orderData
                    var k
                    var couponList = res.couponList
                    var canUseList = []
                    var usedList = []
                    var couponItem

                    that.clubLogo = orderData.clubImageUrl || global.defaultClubLogo
                    that.clubName = orderData.clubName
                    that.clubId = orderData.clubId

                    thisOrderData.imgUrl = orderData.imageUrl || global.defaultServiceItemImgUrl
                    thisOrderData.itemName = orderData.itemName
                    thisOrderData.amount = orderData.amount
                    thisOrderData.useEndTime = orderData.useEndTime
                    thisOrderData.totalCount = orderData.totalCount
                    thisOrderData.usedCount = orderData.usedCount
                    thisOrderData.status = orderData.status

                    for (k = 0; k < couponList.length; k++) {
                        couponItem = couponList[k]
                        couponItem.codeImgUrl = jrQrcode.getQrBase64(couponItem.couponNo, {padding: 0})
                        couponItem.couponNoStr = Util.spaceFormat(couponItem.couponNo)
                        if (k == 0) {
                            that.cardId = couponItem.actId
                        }
                        if (couponItem.couponSettled == 'Y') {
                            usedList.push(couponItem)
                        } else {
                            canUseList.push(couponItem)
                        }
                    }

                    that.canUseList = canUseList
                    that.usedList = usedList
                }
            })
            global.loading = false
        },
        methods: {
            doSwitchList: function (index) {
                this.currShowIndex = index
            }
        }
    }
</script>