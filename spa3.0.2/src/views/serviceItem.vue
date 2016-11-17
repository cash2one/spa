<style>
    @import '../styles/page/serviceItem.css';
</style>
<template>
    <div>
        <div class="page-back-btn" @click="doClickPageBack()" v-show="!global.loading"></div>
        <div class="confirm-btn" v-if="dataList.length>0"><a @click="doClickConfirmOrder()">确认预约</a></div>
        <div class="page" id="service-item-page" :style="{ height : (global.winHeight-3.333*global.winScale*16)+'px' }" v-if="!global.loading">
            <swiper v-if="dataList.length>0" class="profile-swipe" :options="swiperOption">
                <swiper-slide v-for="item in dataList" :key="item.id">
                    <div class="service-item-top">
                        <div class="img" :style="{ backgroundImage : 'url('+(item.imageUrl || global.defaultServiceItemImgUrl)+')' }"></div>
                        <div>
                            <div>{{item.name}}</div>
                            <div v-show="item.price">
                                <div></div>
                                <div>{{item.price | itemPriceFormatter(item.duration,item.durationUnit)}}</div>
                            </div>
                            <div v-show="item.pricePlus">加钟{{item.pricePlus | itemPriceFormatter(item.durationPlus,item.durationUnitPlus)}}</div>
                        </div>
                    </div>
                    <div class="service-item-desc">
                        <div><i></i>项目说明</div>
                        <div v-html="item['description'] || ''"></div>
                    </div>
                </swiper-slide>
            </swiper>
            <div class="nullData" v-show="dataList.length==0">
                <div></div>
                <div>暂无内容...</div>
            </div>
        </div>
        <tel-detail v-if="telephone.length>0" :telephone="telephone"></tel-detail>
    </div>
</template>
<script>
    import Vue from 'vue'
    import { Global } from '../libs/global'
    import { eventHub } from '../libs/hub'
    import ItemPriceFormatter from '../filters/item-price-formatter'
    import Util from '../libs/util'

    var serviceItemPage = null
    module.exports = {
        data: function () {
            return {
                global: Global.data,
                queryDataUrl: '../api/v2/club/{clubId}/service/item',
                // queryDataUrl : '../json/serviceItem.json',
                isQueryAll: true,
                currServiceItemId: '',
                dataList: [],
                telephone: [],
                appointment: true,
                payAppointment: false,
                phoneAppointment: false,
                swipeInitIndex: 0,
                swipeIndex: 0,
                activeItemId: '',
                swiperOption: {
                    observeParents: true,
                    onSlideChangeEnd: function (swiper) {
                        serviceItemPage.doSwipePageEnd({
                            currIndex: swiper.activeIndex
                        })
                    }
                }
            }
        },
        created: function () {
            var that = this
            var global = that.global
            var pageParam = global.currPage.query

            that.activeItemId = that.currServiceItemId = pageParam.id
            that.isQueryAll = pageParam.top != 1
            if (!that.currServiceItemId) {
                return that.$router.back()
            } else if (!that.isQueryAll && that.dataList.length == 0) {
                global.loading = true
                that.$http.get(that.queryDataUrl, {params: {top: 1, clubId: global.clubId}}).then(function (res) {
                    res = res.body
                    if (res.statusCode == 200) {
                        global.loading = false
                        res = res.respData
                        for (var i = 0; i < res.serviceItems.length; i++) {
                            if (res.serviceItems[i]['id'] == that.currServiceItemId) {
                                that.swipeIndex = that.swipeInitIndex = i
                                break
                            }
                        }
                        if (res.telephone) {
                            that.telephone = res.telephone.split(',')
                        }

                        that.dataList = res.serviceItems
                        that.appointment = res.appointment == 'Y'
                        that.payAppointment = res.payAppointment == 'Y'
                        that.phoneAppointment = res.phoneAppointment == 'Y'
                    } else {
                        Util.tipShow(global.loadError)
                        return that.$router.back()
                    }
                }, function () {
                    Util.tipShow(global.loadError)
                    global.loading = false
                    return that.$router.back()
                })
            }
            eventHub.$on('swipePageEnd', that.doSwipePageEnd)
        },
        filters: {
            itemPriceFormatter: ItemPriceFormatter
        },
        mounted: function () {
            var that = this
            if (that.isQueryAll) {
                that.queryItemData(that.currServiceItemId, 0)
            }
            serviceItemPage = this
        },
        methods: {
            queryItemData: function (itemId, direction) {
                var that = this
                that.$http.get(that.queryDataUrl, {
                    params: {
                        top: 0,
                        index: direction,
                        itemId: itemId,
                        pageSize: 5
                    }
                }).then(function (res) {
                    res = res.body
                    if (res.statusCode == 200) {
                        var data = res.respData
                        var i
                        if (direction == 0) { // 初始加载数据
                            var tempArr = []
                            for (i = 0; i < parseInt(res.pageCount); i++) {
                                tempArr.push({})
                            }
                            that.swipeIndex = that.swipeInitIndex = data.itemIndex
                            that.dataList = tempArr
                            if (res.pageCount == 0) {
                                return
                            }
                            that.appointment = data.appointment == 'Y'
                            that.payAppointment = data.payAppointment == 'Y'
                            that.phoneAppointment = data.phoneAppointment == 'Y'
                            if (data.telephone) {
                                that.telephone = data.telephone.split(',')
                            }
                        }

                        var itemIndex = data.itemIndex
                        var listData = data.serviceItems
                        var tempIndex

                        for (i = 0; i < listData.length; i++) {
                            if (listData[i].id == itemId) {
                                tempIndex = i
                                break
                            }
                        }
                        if (!tempIndex && direction != 0) {
                            if (direction == -1) tempIndex = listData.length
                        }
                        tempIndex = itemIndex - tempIndex
                        for (i = 0; i < listData.length; i++) {
                            if (!that.dataList[i + tempIndex].id) {
                                // console.log('填充位置:'+(i+tempIndex));
                                Vue.set(that.dataList, i + tempIndex, listData[i])
                            }
                        }
                    }
                })
            },
            doClickPageBack: function () { // 点击返回按钮
                history.back()
            },
            doClickConfirmOrder: function () { // 点击确认预约按钮
                var that = this
                var global = that.global
                if (!that.appointment && that.phoneAppointment) {
                    if (that.telephone.length == 0) {
                        Util.tipShow('暂无预约电话！')
                    } else {
                        eventHub.$emit('change-tel-detail', true)
                    }
                } else if (that.payAppointment && !global.userAgent.isWX) {
                    Util.tipShow('【此会所需支付预约，请在微信客户端中打开】')
                } else { // 跳转到预约
                    that.$router.push({name: 'confirmOrder', query: {itemId: that.activeItemId}})
                }
            },
            doSwipePageEnd: function (option) {
                var that = this
                var dataList = that.dataList
                that.activeItemId = dataList[option.currIndex]['id']
                var queryParam = {id: that.activeItemId}

                if (that.isQueryAll) {
                    var direction = (option.currIndex - that.swipeIndex > 0 ? 1 : -1)
                    var swipeIndex = that.swipeIndex = option.currIndex
                    if ((direction == 1 && swipeIndex < dataList.length - 1 && !dataList[swipeIndex + 1]) || (direction == -1 && swipeIndex > 0 && !dataList[swipeIndex - 1])) {
                        that.queryItemData(dataList[swipeIndex]['id'], direction)
                    }
                } else {
                    queryParam.top = 1
                }
                // that.$router.replace({ name : 'serviceItem' , query : queryParam })
            }
        }
    }
</script>