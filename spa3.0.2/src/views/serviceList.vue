<style>
    @import '../styles/page/serviceList.css';
</style>
<template>
    <div>
        <page-back></page-back>
        <div class="page" id="service-list-page" v-show="!global.loading">
            <div class="category" v-for="service in serviceList">
                <div :class="service.code">
                    <div></div>
                    <div>{{ service.name }}</div>
                </div>
                <ul class="service-list">
                    <router-link tag="li" v-for="item in service.serviceItems" :to="{ name: 'serviceItem', query: { id : item.id }}">
                        <div :style="{ backgroundImage : 'url('+item.imageUrl+')' }"></div>
                        <div>
                            <div>{{ item.name }}</div>
                            <div>{{ item.price1 | itemPriceFormatter(item.duration1,item.durationUnit) }}<span><span v-show="item.price2">加钟：</span>{{ item.price2 | itemPriceFormatter(item.duration2,item.durationUnitPlus) }}</span></div>
                        </div>
                    </router-link>
                </ul>
            </div>
        </div>
    </div>
</template>
<script>
    import { Global } from '../libs/global'
    import ItemPriceFormatter from '../filters/item-price-formatter'
    import Util from '../libs/util'

    module.exports = {
        data: function () {
            return {
                global: Global.data,
                serviceList: []
            }
        },
        created: function () {
            var that = this
            var global = that.global
            that.$http.get('../api/v2/club/{clubId}/categoryService', {params: {clubId: global.clubId}}).then(function (res) {
                res = res.body
                if (res) {
                    that.serviceList = res
                    global.loading = false
                } else {
                    Util.tipShow(global.loadError)
                    that.$router.back()
                }
            }, function () {
                Util.tipShow(global.loadError)
                that.$router.back()
            })
        },
        filters: {
            itemPriceFormatter: ItemPriceFormatter
        }
    }
</script>