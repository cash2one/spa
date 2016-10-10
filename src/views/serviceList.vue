<style>
    @import '../styles/page/serviceList.css';
</style>
<template>
    <div class="loading" v-show="$loadingRouteData"><i></i><i></i><i></i></div>
    <div class="page-back-btn" @click="doClickPageBack()" v-show="!$loadingRouteData"></div>
    <div class="page" id="service-list-page" v-show="!$loadingRouteData">
         <div class="category" v-for="service in serviceList">
             <div :class="service['code']">
                 <div></div>
                 <div>{{service.name}}</div>
             </div>
             <ul class="service-list">
                 <router-link v-for="item in service.serviceItems" :to="{ name : 'serviceItem', query : { id : item.id } }" tag="li">
                     <div :style="{ backgroundImage : 'url('+item.imageUrl+')' }"></div>
                     <div>
                         <div>{{item.name}}</div>
                         <div>{{item.price1 | itemPriceFormatter(item.duration1,item.durationUnit)}}<span><span v-show="item.price2">加钟：</span>{{item.price2 | itemPriceFormatter(item.duration2,item.durationUnitPlus)}}</span></div>
                     </div>
                 </router-link>
             </ul>
         </div>
    </div>
</template>
<script>
    import { Global } from '../libs/global';
    import ItemPriceFormatter from "../filters/item-price-formatter";
    import Util from "../libs/util";

    module.exports = {
        data: function(){
            return {
                //getServiceListDataUrl : "../json/serviceList.json",
                getServiceListDataUrl : "../api/v2/club/"+Global.data.clubId+"/categoryService",
                global : Global.data,
                serviceList : []
            };
        },
        route: {
          data : function(transition){
              var _this = this;
              return new Promise(function(resolve,reject){
                  _this.$http.get(_this.getServiceListDataUrl).then(function(res){
                      res = res.body;
                      if(res){
                          resolve({ serviceList : res });
                      }
                      else{
                          Util.tipShow(_this.global.loadDataErrorTip);
                          reject(false);
                          transition.abort();
                      }
                  },function(){
                      Util.tipShow(_this.global.loadDataErrorTip);
                      reject(false);
                      transition.abort();
                  })
              });
          }
        },
        filters: {
            itemPriceFormatter : ItemPriceFormatter
        },
        methods: {
            doClickPageBack : function(){//点击返回按钮
                history.back();
            }
        }
    }
</script>