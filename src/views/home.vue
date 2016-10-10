<style>
    @import '../styles/page/home.css';
</style>
<template>
    <div class="loading" v-show="$loadingRouteData"><i></i><i></i><i></i></div>
    <div class="page" id="home-page" v-show="!$loadingRouteData">
        <div class="banner">
            <swipe class="banner-swipe">
                <swipe-item v-for="pic in bannerPics">
                    <div :style="{ backgroundImage : 'url('+(pic.imageUrl || global.defaultBannerImgUrl )+')' }"></div>
                    <div></div>
                </swipe-item>
            </swipe>
            <div class="logo" v-if="global.clubLogoUrl"><div :style="{ backgroundImage : 'url('+global.clubLogoUrl+')' }"></div></div>
            <div class="club-name">{{global.clubName}}</div>
        </div>
        <div class="menu">
            <router-link :to="{name : 'clubProfile' }">
                <div class="clubProfile"></div>
                <div>会所</div>
            </router-link>
            <router-link :to="{name : 'promotions' }">
                <div class="promotions"></div>
                <div>活动</div>
            </router-link>
            <router-link :to="{name : 'serviceList' }">
                <div class="serviceGroup"></div>
                <div>项目</div>
            </router-link>
            <router-link :to="{name : 'map' }">
                <div class="address"></div>
                <div>地址</div>
            </router-link>
            <a @click="doClickContactClub()">
                <div class="master"></div>
                <div>店长</div>
            </a>
        </div>

        <div class="recommend-tech" v-if="techs.length>0">
            <div><div></div>推荐技师<router-link :to="{ name : 'technicianList' }">全部技师</router-link></div>
            <div>
                <div>
                    <router-link v-for="tech in techs" :to="{ name : 'technicianDetail', query : { id : tech.id } }" :style="{ backgroundImage : 'url('+(tech.avatarUrl || global.defaultHeader)+')' }" class="tech" tag="div">
                        <div>{{tech.name}}</div>
                    </router-link>
                </div>
            </div>
        </div>

        <div class="recommend-item">
            <div><div></div>推荐项目<router-link :to="{name : 'serviceList'}">全部项目</router-link></div>
            <div>
                <router-link class="item" v-for="item in serviceItems" :to="{ name : 'serviceItem', query : { top : '1' , id : item.id } }" tag="div">
                    <div :style="{ backgroundImage : 'url('+(item.imageUrl || global.defaultServiceItemImgUrl)+')' }"></div>
                    <div>{{item.name}}</div>
                    <div>
                        <div v-show="item.price1"></div>
                        <div v-show="item.price1">{{item.price1 | itemPriceFormatter(item.duration1,item.durationUnit)}}</div>
                    </div>
                </router-link>
            </div>
        </div>
    </div>
    <tel-detail ref="telDetail" v-if="global.clubTelephone.length>0" :telephone="global.clubTelephone"></tel-detail>
</template>
<script>
    import { Global } from '../libs/global';
    import Swipe from '../components/swipe';
    import SwipeItem from '../components/swipe-item';
    import TelDetail from '../components/tel-detail.vue';
    import Util from "../libs/util";
    import ItemPriceFormatter from "../filters/item-price-formatter";

    module.exports = {
        components: {
            'swipe' : Swipe,
            'swipe-item' : SwipeItem,
            'tel-detail' : TelDetail
        },
        data: function(){
            return {
                //getHomeDataUrl : "../json/homeData.json",
                getHomeDataUrl : "../api/v2/club/"+Global.data.clubId+"/homeData",
                global : Global.data,
                bannerPics : [],
                serviceItems : [],
                techs : []
            };
        },
        route : {
          data : function(transition){
              var _this = this;
              return new Promise(function(resolve,reject){
                  _this.$http.get(_this.getHomeDataUrl).then(function(res){
                      res = res.body;
                      if(res.statusCode == 200){
                          res = res.respData;
                          var global = _this.global;
                          global.clubLogoUrl = res.club.imageUrl || global.defaultClubLogo;
                          global.clubName = res.club.name;
                          global.clubTelephone = res.club.telephone.split(",");
                          resolve({ bannerPics : res.sliderPic , serviceItems : res.serviceItems , techs : res.techs });
                      }
                      else{
                          Util.tipShow(_this.global.loadDataErrorTip);
                      }
                  }, function(){
                      Util.tipShow(_this.global.loadDataErrorTip);
                  });
              })
          }
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
                    _this.$refs.telDetail.$emit("change-visible",{ ope : "show" });
                }
            }
        }
    }
</script>