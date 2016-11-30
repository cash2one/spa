<style>
    @import '../styles/page/serviceItem.css';
</style>
<template>
    <div>
        <div class="page-back-btn" @click="doClickPageBack()"></div>
        <div class="confirm-btn" v-if="dataList.length>0"><a @click="doClickConfirmOrder()">确认预约</a></div>
        <div class="page" id="service-item-page" :style="{ height : (global.winHeight-3.333*global.winScale*16)+'px' }">
            <swiper v-if="dataList.length>0" class="profile-swipe" :options="swiperOption">
                <swiper-slide v-for="item in dataList" :key="item.id">
                    <div class="service-item-top">
                        <div class="img" :style="{ backgroundImage : 'url('+(item.imageUrl || global.defaultServiceItemImgUrl)+')' }"></div>
                        <div>
                            <div>{{ item.name }}</div>
                            <div v-show="item.price">
                                <div></div>
                                <div>{{ item.price | itemPriceFormatter(item.duration,item.durationUnit) }}</div>
                            </div>
                            <div v-show="item.pricePlus">加钟{{ item.pricePlus | itemPriceFormatter(item.durationPlus,item.durationUnitPlus) }}</div>
                        </div>
                    </div>
                    <div class="service-item-desc">
                        <div>项目说明</div>
                        <div v-html="item['description'] || ''"></div>
                    </div>
                    <div class="service-item-tech" v-if="item.technicians && item.technicians.length>0">
                        <div>选择技师</div>
                        <div class="tech" v-for="tech in item.technicians" :class="{ selected : selectedTechId==tech.id }" @click="doSelectTech(tech.id,item.id)">
                            <div></div>
                            <div :style="{ backgroundImage : 'url('+(tech.avatarUrl || global.defaultHeader )+')' }"></div>
                            <div>
                                <div>
                                    <div>{{ tech.name || global.defaultTechName }}</div>
                                    <div v-show="tech.serialNo">[<span>{{ tech.serialNo}}</span>]</div>
                                </div>
                                <div>{{ tech.description || "这个技师很懒，没有填写个人简介..." }}</div>
                                <div>
                                    <div><div :style="{ width: tech.star + '%' }"></div></div>
                                    <span>{{ tech.commentCount }}评论</span>
                                </div>
                        </div>
                    </div>
                    </div>
                </swiper-slide>
            </swiper>
            <div class="nullData" v-show="dataList.length==0">
                <div v-show="!global.loading"></div>
                <div>{{ global.loading ? '数据加载中...' : '暂无内容...' }}</div>
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
    var thisSwiper = null
    module.exports = {
        data: function () {
            return {
                global: Global.data,
                queryDataUrl: '../api/v2/club/{clubId}/service/item',
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
                selectedTechId: '', // 当前选择的技师
                selectedTechServiceItemId: '', // 当前选择的技师所在的服务项目id
                swiperOption: {
                    observeParents: true,
                    onInit: function (swiper) {
                        thisSwiper = swiper
                    },
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
            } else if (!that.isQueryAll && that.dataList.length == 0) { // 查询推荐项目
                that.$http.get(that.queryDataUrl, {params: {top: 1, clubId: global.clubId}}).then(function (res) {
                    res = res.body
                    if (res.statusCode == 200) {
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
                        global.loading = false
                    } else {
                        Util.tipShow(global.loadError)
                        return that.$router.back()
                    }
                }, function () {
                    Util.tipShow(global.loadError)
                    return that.$router.back()
                })
            }
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
                var global = that.global
                that.$http.get(that.queryDataUrl, {
                    params: {
                        top: 0, index: direction, itemId: itemId, pageSize: 5, clubId: global.clubId
                    }
                }).then(function (res) {
                    res = res.body
                    if (res.statusCode == 200) {
                        var i
                        var data = res.respData
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
                            var waitInitTimer = setInterval(function () {
                                if (thisSwiper) {
                                    clearInterval(waitInitTimer)
                                    thisSwiper.slideTo(that.swipeInitIndex, 0)
                                    global.loading = false
                                }
                            }, 30)
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
                                // console.log('填充位置:' + (i + tempIndex))
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
                    var params = {itemId: that.activeItemId}
                    if (that.selectedTechServiceItemId == that.activeItemId && that.selectedTechId) {
                        params.techId = that.selectedTechId
                    }
                    that.$router.push({name: 'confirmOrder', query: params})
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
                    if ((direction == 1 && swipeIndex < dataList.length - 1 && !dataList[swipeIndex + 1].id) || (direction == -1 && swipeIndex > 0 && !dataList[swipeIndex - 1].id)) {
                        that.queryItemData(dataList[swipeIndex].id, direction)
                    }
                } else {
                    queryParam.top = 1
                }
                that.$router.replace({name: 'serviceItem', query: queryParam})
            },
            doSelectTech: function (techId, itemId) { // 选择技师
                this.selectedTechId = techId
                this.selectedTechServiceItemId = itemId
            }
        }
    }
</script>