<style>
    @import '../styles/page/home.css';
</style>
<template>
    <div>
        <div class="page" id="home-page" v-show="!global.loading">
            <div class="banner">
                <swiper class="banner-swipe" :options="swiperOption">
                   <swiper-slide v-for="pic in bannerPics">
                        <div :style="{ backgroundImage : 'url('+(pic.imageUrl || global.defaultBannerImgUrl )+')' }"></div>
                        <div></div>
                    </swiper-slide>
                    <div class="swiper-pagination" slot="pagination"></div>
                </swiper>
                <div class="logo" v-if="global.clubLogoUrl"><div :style="{ backgroundImage : 'url('+global.clubLogoUrl+')' }"></div></div>
                <div class="club-name">{{global.clubName}}</div>
            </div>
            <div class="menu">
                <router-link :to="{name : 'clubProfile' }"><div class="clubProfile"></div><div>会所</div></router-link>
                <router-link :to="{name : 'promotions' }"><div class="promotions"></div><div>活动</div></router-link>
                <router-link :to="{name : 'serviceList' }"><div class="serviceGroup"></div><div>项目</div></router-link>
                <router-link :to="{name : 'map' }"><div class="address"></div><div>地址</div></router-link>
                <a @click="doClickContactClub()"><div class="master"></div><div>店长</div></a>
            </div>

            <div class="recommend-tech" v-if="techs.length>0">
                <div><div></div>推荐技师<router-link :to="{ name : 'technicianList' }">全部技师</router-link></div>
                <div>
                    <div>
                        <router-link v-for="tech in techs" :to="{ name : 'technicianDetail', query : { id : tech.id } }" :style="{ backgroundImage : 'url('+(tech.avatarUrl || global.defaultHeader)+')' }" class="tech">
                            <div>{{tech.name}}</div>
                        </router-link>
                    </div>
                </div>
            </div>

            <div class="recommend-item">
                <div><div></div>推荐项目<router-link :to="{name : 'serviceList'}">全部项目</router-link></div>
                <div>
                    <div class="item" v-for="item in serviceItems" @click="doClickServiceItem(item.id)">
                        <div :style="{ backgroundImage : 'url('+(item.imageUrl || global.defaultServiceItemImgUrl)+')' }"></div>
                        <div>{{item.name}}</div>
                        <div>
                            <div v-show="item.price1"></div>
                            <div v-show="item.price1">{{item.price1 | itemPriceFormatter(item.duration1,item.durationUnit)}}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <tel-detail v-if="global.clubTelephone.length>0" :telephone="global.clubTelephone"></tel-detail>
    </div>
</template>
<script>
    import { Global } from '../libs/global';
    import { eventHub } from '../libs/hub';
    import { swiper, swiperSlide } from 'vue-awesome-swiper';
    import TelDetail from '../components/tel-detail.vue';
    import Util from "../libs/util";
    import ItemPriceFormatter from "../filters/item-price-formatter";

    module.exports = {
        components: {
            'swiper' : swiper,
            'swiper-slide' : swiperSlide,
            'tel-detail' : TelDetail
        },
        data: function(){
            return {
                //getHomeDataUrl : "../json/homeData.json",
                getHomeDataUrl : "../api/v2/club/{clubId}/homeData",
                global : Global.data,
                bannerPics : [],
                serviceItems : [],
                techs : [],
                swiperOption : {
                    autoplay : 5000,
                    pagination : '.swiper-pagination',
                    paginationClickable :true,
                    loop : true,
                    autoplayDisableOnInteraction : false,
                    observeParents : true,
                    onInit : function (swiper) {
                        setTimeout(function(){
                            swiper.reLoop();
                            swiper.slideNext(null,0);
                        },500)
                    }
                }
            };
        },
        mounted : function(){
            var _this = this,global = _this.global;
            global.loading = true;
            console.log("param club id");
            _this.$http.get(_this.getHomeDataUrl,{ params : { clubId : global.clubId } }).then(function(res){
                res = res.body;
                global.loading = false;
                if(res.statusCode == 200){
                    res = res.respData;
                    global.clubLogoUrl = res.club.imageUrl || global.defaultClubLogo;
                    global.clubName = res.club.name;
                    global.clubTelephone = res.club.telephone.split(",");

                    _this.bannerPics = res.sliderPic;
                    _this.serviceItems = res.serviceItems;
                    _this.techs = res.techs;
                }
                else{
                    Util.tipShow(global.loadError);
                }
            }, function(){
                Util.tipShow(global.loadError);
            });
        },
        filters: {
            itemPriceFormatter : ItemPriceFormatter
        },
        methods: {
            doClickContactClub : function(){
                var _this = this;
                if(_this.global.clubTelephone.length==0){
                    Util.tipShow("暂无会所电话！");
                }
                else{
                    eventHub.$emit("change-tel-detail",true);
                }
            },
            doClickServiceItem : function(id){
                this.$router.push({ name : 'serviceItem', query : { top : '1' , id : id } });
            }
        }
    }
</script>