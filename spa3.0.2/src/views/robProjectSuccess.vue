<style>
    @import '../styles/page/robProjectSuccess.css';
</style>
<template>
    <div class="page" id="rob-project-success-page">
        <page-title title-text="抢购成功"></page-title>
        <router-link :to="{ name : 'home' }" class="club-info" tag="div">
            <div :style="{ backgroundImage : 'url('+global.clubLogoUrl+')' }"></div>
            <div>{{ global.clubName }}</div>
            <div></div>
        </router-link>
        <div class="success-tip">
            <div></div>
            <div>恭喜你，抢购成功！</div>
            <div>赶紧告诉您的朋友吧</div>
            <a @click="doClickPopShare()">告诉朋友</a>
        </div>
        <router-link class="paid-info" :to="{ name : 'couponDetail' , query : { userActId : resData.id, couponType : 'paid_service_item' } }" tag="div">
            <div>
                <div>优惠码：<span>{{ resData.couponNo}}</span></div>
                <div>查看详情</div>
                <div></div>
            </div>
            <div>凭优惠码到会所消费</div>
        </router-link>
        <div class="tech-list" v-if="clubObj.techs.length>0">
            <div class="title">
                <div>推荐技师</div>
                <router-link :to="{ name: 'technicianList' }" tag="div">查看全部</router-link>
            </div>
            <club :club-obj="clubObj"></club>
        </div>
        <share :share-url="shareUrl"></share>
    </div>
</template>
<script>
    import { Global } from '../libs/global'
    import Util from '../libs/util'
    import { eventHub } from '../libs/hub'

    module.exports = {
        data: function () {
            return {
                global: Global.data,
                bizId: '',
                isIntegral: true,
                couponType: '',
                resData: {},
                shareUrl: '',
                clubObj: {
                    id: '',
                    techs: []
                }
            }
        },
        beforeRouteEnter: function (to, from, next) {
            var query = to.query
            var global = Global.data
            if (!query.id) {
                Util.tipShow(global.visitError)
                next(false)
            } else {
                next(function (vm) {
                    vm.init()
                })
            }
        },
        methods: {
            init: function () {
                var that = this
                var global = that.global
                var query = global.currPage.query

                that.isIntegral = query.isIntegral == 'true'
                that.couponType = query.couponType || 'paid_service_item'
                that.bizId = query.id
                var params = {}
                if (that.isIntegral) {
                    params.suaId = that.bizId
                } else {
                    params.payId = that.bizId
                }
                that.$http.get('../api/v2/club/user/service_item_coupon/pay/view', {params: params}).then(function (res) {
                    res = res.body
                    if (res.statusCode == 200) {
                        res = res.respData
                        res.couponNo = Util.spaceFormat(res.couponNo) || '支付处理中...'
                        that.shareUrl = res.shareUrl
                        that.resData = res
                        if (global.userAgent.isWX) {
                            that.shareSetting()
                        }
                        global.loading = false
                    } else {
                        Util.tipShow(res.msg || '查询数据出错！')
                    }
                })
                // 查询推荐技师
                that.$http.get('../api/v2/club/top/techs', {params: {clubId: global.clubId}}).then(function (techRes) {
                    techRes = techRes.body
                    if (techRes.statusCode == 200) {
                        that.clubObj.id = global.clubId
                        that.clubObj.techs = techRes.respData
                    }
                })
            },
            // 点击'告诉朋友'
            doClickPopShare: function () {
                eventHub.$emit('change-share-pop', true)
            },
            shareSetting: function () {
                var that = this
                var global = that.global
                var resData = that.resData
                Global.shareConfig({
                    title: global.clubName + '-' + resData.name + '限时抢购就等你来',
                    desc: '据说这个项目一般人抢不到，但是我觉得你可以！抢项目，约技师，享人间极乐。',
                    link: resData.shareUrl,
                    imgUrl: resData.imageUrl,
                    success: function () {
                        eventHub.$emit('change-share-pop', false)
                    },
                    fail: function () {
                        Util.tipShow('分享失败！请刷新页面后再试！')
                    }
                })
            }
        }
    }
</script>