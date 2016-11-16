<style>
    @import '../styles/page/robProjectSuccess.css';
</style>
<template>
    <div class="page" id="rob-project-success-page">
        <div class="page-title"><a class="back" @click="doClickPageBack()"></a>抢购成功</div>
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
        <router-link class="paid-info"
                     :to="{ name : 'couponDetail' , query : { userActId : resData.id, couponType : 'paid_service_item' } }"
                     tag="div">
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
                <div>查看全部</div>
            </div>
            <club :club-obj="clubObj"></club>
        </div>
        <share :share-url="shareUrl"></share>
    </div>
</template>
<script>
    import {Global} from '../libs/global'
    import Util from '../libs/util'
    import {eventHub} from '../libs/hub'
    import Share from '../components/share'
    import Club from '../components/club'

    module.exports = {
        components: {
            share: Share,
            Club: Club
        },
        data: function () {
            return {
                global: Global.data,
                bizId: '',
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
                var _this = this
                var global = _this.global
                var query = global.currPage.query

                _this.bizId = query.id
                _this.$http.get('../api/v2/club/user_paid_service_item/pay/view', {params: {id: query.id}}).then(function (res) {
                    res = res.body
                    if (res.statusCode == 200) {
                        res = res.respData
                        res.couponNo = Util.spaceFormat(res.couponNo) || '支付处理中...'
                        _this.shareUrl = res.shareUrl
                        _this.resData = res
                        if (global.userAgent.isWX) {
                            _this.shareSetting()
                        }
                    } else {
                        Util.tipShow(res.msg || '查询数据出错！')
                    }
                })
                // 查询推荐技师
                _this.$http.get('../api/v2/club/top/techs', {params: {clubId: global.clubId}}).then(function (techRes) {
                    techRes = techRes.body
                    if (techRes.statusCode == 200) {
                        _this.clubObj.id = global.clubId
                        _this.clubObj.techs = techRes.respData
                    }
                })
            },
            doClickPageBack: function () {
                this.$router.push({name: 'home'})
            },
            // 点击'告诉朋友'
            doClickPopShare: function () {
                eventHub.$emit('change-share-pop', true)
            },
            shareSetting: function () {
                var _this = this
                var global = _this.global
                var resData = _this.resData
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
