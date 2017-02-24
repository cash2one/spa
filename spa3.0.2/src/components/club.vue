<style>
    @import '../styles/components/club.css';
</style>
<template>
    <div class="club-item-wrap" :class="{ 'no-techs' : techs.length>0 }" @click="doClickClub()">
        <div class="club-info" v-if="clubObj.name">
            <div :style="{ backgroundImage : 'url('+(clubObj.imageUrl || global.defaultClubLogo )+')' }"></div>
            <div>{{ clubObj.name }}</div>
            <div v-show="clubObj.couponCount>0" @click="doClickGetCoupon($event)">优惠</div>
            <div>{{ clubObj.distance | DistanceFormatter }}</div>
        </div>
        <swiper class="club-techs" v-if="techs.length>0" :options="swiperOption">
            <swiper-slide v-for="tech in techs">
                <div @click="doClickViewTech(tech.id, $event)" :style="{ backgroundImage : 'url('+(tech.avatarUrl || global.defaultHeader )+')' }"></div>
                <div>
                    <div>{{ tech.name }}</div>
                    <div>{{ visitCount | BigNumFormatter}}</div>
                </div>
            </swiper-slide>
        </swiper>
    </div>
</template>

<script>
    import { Global } from '../libs/global'
    import DistanceFormatter from '../filters/distance-formatter'
    import BigNumFormatter from '../filters/big-num-formatter'

    export default {
        data: function () {
            return {
                global: Global.data,
                swiperContainer: null,
                swiperOption: {
                    loop: true,
                    observeParents: true,
                    slidesPerView: 'auto',
                    onInit: function (swiper) {
                        setTimeout(function () {
                            if (swiper.slides.length > 3) {
                                swiper.reLoop()
                            } else {
                                swiper.destroyLoop()
                            }
                        }, 600)
                    }
                }
            }
        },
        props: {
            clubObj: {
                type: Object,
                required: true
            }
        },
        computed: {
            techs: function () {
                return this.clubObj.techs || []
            }
        },
        filters: {
            DistanceFormatter: DistanceFormatter,
            BigNumFormatter: BigNumFormatter
        },
        methods: {
            doClickClub: function () {
                var that = this
                if (that.clubObj.name) {
                    that.$router.push({path: '/' + that.clubObj.id + '/home'})
                }
            },
            doClickViewTech: function (id, event) {
                var that = this
                that.$router.push({
                    path: '/' + that.clubObj.id + '/technicianDetail',
                    query: {id: id}
                })
                event.stopPropagation()
            },
            doClickGetCoupon: function (e) {
                var that = this
                that.$router.push({path: '/' + that.clubObj.id + '/promotions'})
                e.stopPropagation()
            }
        }
    }
</script>