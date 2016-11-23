<style>
    @import '../styles/page/promotions.css';
</style>
<template>
    <div class="page" id="promotions-page">
        <div class="page-title"><a class="back" @click="doClickPageBack()"></a>优惠活动</div>
        <div class="title" v-if="coupons.length>0">优惠券</div>
        <div v-for="coupon in coupons" :class="[coupon['getFlag'], 'money', coupon['useType']=='money' ? '' : 'coupon' ]">
            <div>
                <div><span v-if="coupon['useType'] == 'money'">￥</span>{{coupon['useType'] == 'money' ?coupon['actValue'] : coupon['actTitle'] }}</div>
                <span v-show="coupon['useType']!='money' || coupon['consumeMoney']!=0">{{coupon['useType']=='money' ? coupon['consumeMoneyDescription'] : coupon['actValue']}}<span v-if="coupon['useType']!='money'">元&nbsp;&nbsp;&nbsp;&nbsp;原价：<span>{{coupon['consumeMoney']}}元</span></span></span>
                <div>
                    <div>{{coupon['useTypeName']}}</div>
                    <div>{{coupon['getFlag']=='already_get' ? '已领取' : (coupon['getFlag']=='finish_get' ? '已领取完' :'立即领取') }}</div>
                    <div></div>
                    <div></div>
                </div>
            </div>
        </div>
        <div class="title" v-if="activities.length>0">优惠活动</div>
        <router-link v-for="act in activities" class="activity" :style="{ backgroundImage : 'url('+act.actLogoUrl+')' }" :to="{ name :'promotionsActivity' , query : { id : act.actId }}">
            <div>
                <div>{{act.actTitle}}</div>
                <div>活动时间：{{act.startDate | dateToString(act.endDate,'—')}}</div>
            </div>
        </router-link>
        <div class="nullData" v-if="activities.length==0 && coupons.length==0">
            <div></div>
            <div>{{ global.loading ? '数据加载中...' : '暂无内容...' }}</div>
        </div>
    </div>
</template>
<script>
    import { Global } from '../libs/global'
    import DateToString from '../filters/date-to-string'
    import Util from '../libs/util'

    module.exports = {
        data: function () {
            return {
                global: Global.data,
                getActivitiesDataUrl: '../api/v2/club/{clubId}/activities',
                coupons: [],
                activities: []
            }
        },
        created: function () {
            var that = this
            var global = that.global
            global.loading = true
            that.$http.get(that.getActivitiesDataUrl, {params: {clubId: global.clubId}}).then(function (res) {
                res = res.body
                if (res.statusCode == 200) {
                    global.loading = false
                    res = res.respData
                    for (var i = 0; i < res.coupons.length; i++) {
                        res.coupons[i]['useType'] = (res.coupons[i]['useType'] == 'null' ? 'money' : res.coupons[i]['useType'])
                        if (res['coupons'][i]['useType'] == 'money' && res['coupons'][i]['consumeMoney'] == 0) {
                            res['coupons'][i]['consumeMoneyDescription'] = '不限使用'
                        }
                    }
                    that.coupons = res.coupons
                    that.activities = res.acts
                } else {
                    Util.tipShow(global.loadError)
                    that.$router.back()
                }
            }, function () {
                Util.tipShow(global.loadError)
                global.loading = false
                that.$router.back()
            })
        },
        filters: {
            dateToString: DateToString
        },
        methods: {
            doClickPageBack: function () { // 点击返回按钮
                history.back()
            }
        }
    }
</script>