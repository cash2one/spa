<style>
    @import '../styles/page/discountMall.css';
</style>
<template>
    <div class="discount-mall-page-wrap">
        <div class="page" id="discount-mall-page">
            <page-title title-text="特惠商城"></page-title>
            <div class="search-wrap">
                <input type="input" maxlength="30" @keypress.enter="doSearch()" placeholder="搜索" v-model="searchVal"/>
                <div @click="doShowSelector()">选项目</div>
                <a class="search-icon" @click="doSearch()"></a>
            </div>
            <div class="nullData" v-show="noData"></div>
            <div class="result-list" v-show="!noData">
                <div class="tip" v-show="showTip" v-html="tipStr"></div>
                <ul class="clear-fix">
                    <router-link v-for="item in dataList" tag="li" :class="{ sellOut: item.statusName=='已售完', expired: item.statusName=='已过期' }" :to="{ name: 'onceCardDetail', query: { id: item.id } }">
                        <div :style="{'background-image': 'url('+(item.imageUrl || global.defaultServiceItemImgUrl)+')'}"><div>{{ item.itemName }}</div></div>
                        <div><b>{{ item.plan.price }}</b>元<span>买{{ item.plan.paidCount }}送{{ item.plan.giveCount }}</span></div>
                        <div>{{ Math.round(item.plan.itemAmount/100) }}元/次</div>
                        <div v-if="item.id==newId" class="new">最新</div>
                        <div v-else-if="item.id==bestId" class="best">最优惠</div>
                    </router-link>
                </ul>
                <div class="more-tip" v-show="showMoreTip">{{ moreTipStr }}</div>
                <ul class="clear-fix" v-show="showMoreList">
                    <router-link v-for="item in moreList" tag="li" :class="{ sellOut: item.statusName=='已售完', expired: item.statusName=='已过期' }" :to="{ name: 'onceCardDetail', query: {id: item.id} }">
                        <div :style="{'background-image': 'url('+(item.imageUrl || global.defaultServiceItemImgUrl)+')'}"><div>{{ item.itemName }}</div></div>
                        <div><b>{{ item.plan.price }}</b>元<span>买{{ item.plan.paidCount }}送{{ item.plan.giveCount }}</span></div>
                        <div>{{ Math.round(item.plan.itemAmount/100) }}元/次</div>
                        <div v-if="item.id==newId" class="new">最新</div>
                        <div v-else-if="item.id==bestId" class="best">最优惠</div>
                    </router-link>
                </ul>
            </div>
        </div>
        <router-link class="submit-button footer" :to="{name: 'serviceList'}" tag="div">查看全部项目</router-link>

        <div class="service-item-selector" :class="{ active: showSelectorPop }">
            <div class="pop-content">
                <ul class="clear-fix"><li :class="{ active : currSelectServiceItemId=='' }" @click="doSelectServiceItem('','全部项目')">全部项目</li></ul>
                <div class="service-list" v-for="serviceItem in serviceItems">
                    <div>{{ serviceItem.name }}</div>
                    <ul class="clear-fix">
                        <li v-for="item in serviceItem.serviceItems" :class="{ active: currSelectServiceItemId==item.id }" @click="doSelectServiceItem(item.id, item.name)">{{ item.name }}</li>
                    </ul>
                </div>
            </div>
            <div class="btn-wrap"><div @click="doCancel()">取消</div><div @click="doConfirm()">确定</div></div>
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
                clubId: '',
                noData: false,
                tipStr: '',
                showTip: false,
                searchVal: '',
                selectedItem: null,
                showSelectorPop: false,
                dataList: [],
                moreList: [],
                allCards: [],
                bestId: '',
                newId: '',
                showMoreTip: false,
                moreTipStr: '更多',
                showMoreList: false,

                serviceItems: [],
                currSelectServiceItemId: '', // 当前选择的服务项目ID
                currSelectServiceItemName: '全部项目' // 当前选择的服务项目名称
            }
        },
        created: function () {
            var that = this
            var global = that.global
            var query = global.currPage.query
            that.clubId = query.clubId || global.clubId || ''
            if (!that.clubId) {
                Util.tipShow(global.visitError)
                return that.$router.back()
            }
            that.$http.get('../api/v2/club/category/service/list', {params: {clubId: that.clubId}}).then(function (res) {
                res = res.body
                if (res.statusCode == 200) {
                    that.serviceItems = res.respData || []
                }
            })
            that.query()
            global.loading = false
        },
        methods: {
            query: function () {
                var that = this
                var selectedItemName = that.currSelectServiceItemName
                that.$http.post('../api/v2/club/once_card/activity/list', {
                    clubId: that.clubId,
                    itemId: that.currSelectServiceItemId,
                    itemName: that.searchVal
                }).then(function (res) {
                    res = res.body
                    if (res.statusCode == 200) {
                        res = res.respData
                        var activityList = res.activityList
                        var i
                        var k = 0
                        var listItem
                        var plan
                        var dataList = []
                        var moreList = []

                        if (that.currSelectServiceItemId == '' && that.searchVal == '') {
                            that.allCards = activityList
                            if (activityList.length > 0) {
                                that.newId = activityList[0].id
                                that.bestId = res.optimalActivity.id
                            }
                        }
                        for (i = 0; i < activityList.length; i++) {
                            listItem = activityList[i]
                            for (k = 0; k < listItem.onceCardPlans.length; k++) {
                                plan = listItem.onceCardPlans[k]
                                if (plan.optimal == 'Y') {
                                    plan.price = that.getPlanPrice(plan)
                                    listItem.plan = plan
                                    break
                                }
                            }
                            dataList.push(listItem)
                        }
                        that.dataList = dataList

                        if (that.searchVal || (selectedItemName && selectedItemName != '全部项目')) {
                            if (activityList.length > 0) {
                                that.tipStr = '以下是包含“<span>' + (that.searchVal || selectedItemName) + '”</span>项目的优惠'
                            } else {
                                that.tipStr = '没有“<span>' + (that.searchVal || selectedItemName) + '</span>”相关的次卡，看看其它吧~'
                            }
                            that.showTip = true
                        } else {
                            that.showTip = false
                        }

                        that.noData = (that.allCards.length == 0)
                        if (that.currSelectServiceItemId == '' && that.searchVal == '') {
                            that.showMoreTip = false
                            that.showMoreList = false
                        } else {
                            for (k = 0; k < that.allCards.length; k++) {
                                if (!that.inResultList(that.allCards[k].id, activityList)) {
                                    moreList.push(that.allCards[k])
                                }
                            }
                            if (moreList.length == 0) {
                                that.moreTipStr = '没有更多了~'
                                that.showMoreTip = true
                                that.showMoreList = false
                            } else {
                                for (i = 0; i < moreList.length; i++) {
                                    listItem = moreList[i]
                                    for (k = 0; k < listItem.onceCardPlans.length; k++) {
                                        plan = listItem.onceCardPlans[k]
                                        if (plan.optimal == 'Y') {
                                            plan.price = that.getPlanPrice(plan)
                                            listItem.plan = plan
                                            break
                                        }
                                    }
                                }
                                that.moreList = moreList
                                that.moreTipStr = '更多'
                                that.showMoreTip = true
                                that.showMoreList = true
                            }
                        }
                    }
                })
            },
            doSearch: function () {
                this.query()
            },
            doShowSelector: function () {
                this.showSelectorPop = !this.showSelectorPop
            },
            doSelectServiceItem: function (serviceItemId, serviceItemName) { // 选择服务项目时
                this.currSelectServiceItemId = serviceItemId
                this.currSelectServiceItemName = serviceItemName
            },
            doCancel: function () {
                this.showSelectorPop = false
            },
            doConfirm: function () {
                var that = this
                that.query()
                that.showSelectorPop = false
            },
            inResultList: function (cardId, resList) {
                for (var j = 0; j < resList.length; j++) {
                    if (resList[j].id == cardId) {
                        return true
                    }
                }
                return false
            },
            getPlanPrice: function (plan) {
                var price = plan.actAmount / 100 / (plan.giveCount + plan.paidCount)
                if (price > 1.001) {
                    price = Math.round(price)
                } else {
                    if (price < 0.01) {
                        price = 0.01
                    }
                    price = price.toFixed(2)
                }
                return price
            }
        }
    }
</script>