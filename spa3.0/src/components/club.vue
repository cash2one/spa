<style>
    @import '../styles/components/club.css';
</style>
<template>
    <div class="club-item-wrap" :class="{ 'no-techs' : techs.length>0 }" @click="doClickClub()">
        <div class="club-info" v-if="clubObj.name">
            <i :style="{ backgroundImage : 'url('+(clubObj.imageUrl || global.defaultClubLogo )+')' }"></i>
            <div>
                <div><span>{{ clubObj.name }}</span><span v-show="clubObj.couponCount>0" @click="doClickGetCoupon($event)">抢优惠</span></div>
                <div><span>{{ clubObj.address }}</span><span>{{ clubObj.distance | DistanceFormatter }}</span></div>
            </div>
        </div>
        <swiper class="club-techs" v-if="techs.length>0" :options="swiperOption">
            <swiper-slide v-for="tech in techs" :style="{ backgroundImage : 'url('+(tech.avatarUrl || global.defaultHeader )+')' }" data-tech-id="tech.id"></swiper-slide>
        </swiper>
    </div>
</template>

<script>
    import {Global} from '../libs/global'
    import DistanceFormatter from '../filters/distance-formatter'
    import {swiper, swiperSlide} from 'vue-awesome-swiper'

    module.exports = {
        components: {
            'swiper': swiper,
            'swiper-slide': swiperSlide
        },
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
            DistanceFormatter: DistanceFormatter
        },
        mounted: function () {
            var _this = this
            var count = 0
            var waitSwiperInitTimer
            _this.$nextTick(function () {
                waitSwiperInitTimer = setInterval(function () {
                    count++
                    _this.swiperContainer = _this.$el.querySelector('div.swiper-container')
                    if (_this.swiperContainer) {
                        _this.swiperContainer.addEventListener('click', _this.doClickSwiper)
                        clearInterval(waitSwiperInitTimer)
                    }
                    if (count > 10) {
                        clearInterval(waitSwiperInitTimer)
                    }
                }, 300)
            })
        },
        methods: {
            doClickClub: function () {
                var _this = this
                if (_this.clubObj.name) {
                    _this.$router.push({path: '/' + _this.clubObj.id + '/home'})
                }
            },
            doClickSwiper: function (event) {
                var el = event.target || event.srcElement
                var swipeIndex = el.dataset['swiperSlideIndex']
                var _this = this
                if (swipeIndex && swipeIndex < _this.techs.length) {
                    _this.$router.push({
                        path: '/' + _this.clubObj.id + '/technicianDetail',
                        query: {id: _this.techs[swipeIndex - 0].id}
                    })
                }
                event.stopPropagation()
            },
            doClickGetCoupon: function () {
                var _this = this
                _this.$router.push({path: '/' + _this.clubObj.id + '/promotions'})
            }
        },
        beforeDestroy: function () {
            if (this.swiperContainer) {
                this.swiperContainer.removeEventListener('click', this.doClickSwiper)
            }
        }
    }
</script>