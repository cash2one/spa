<style>
    @import '../styles/components/home-tech.css';
</style>
<template>
    <div class="home-tech-wrap">
        <swiper v-if="techs.length>0" :options="swiperOption">
            <swiper-slide v-for="(tech,index) in techs">
                <div :style="{ backgroundImage : 'url('+(tech.avatarUrl || global.defaultHeader )+')' }" @click="doClickTech(tech.techId)">
                    <div>{{ tech.techName }}</div>
                    <div v-show="index == 0"></div>
                </div>
                <div>
                    <div><div></div><div>{{ tech.visitCount | kiloNumFormat }}</div></div>
                    <div><div></div><div>{{ tech.goodCommentCount | kiloNumFormat }}</div></div>
                </div>
            </swiper-slide>
        </swiper>
    </div>
</template>

<script>
    import { Global } from '../libs/global'

    module.exports = {
        data: function () {
            return {
                global: Global.data,
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
        filters: {
            kiloNumFormat: function (val) {
                if (val >= 1000) {
                    return (val / 1000).toFixed(1) + 'K'
                } else {
                    return val
                }
            }
        },
        props: {
            techs: {
                type: Array,
                required: true
            }
        },
        methods: {
            doClickTech: function (techId) {
                this.$router.push({name: 'technicianDetail', query: {id: techId}})
            }
        }
    }
</script>