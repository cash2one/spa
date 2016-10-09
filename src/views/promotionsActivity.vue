<style>
    @import '../styles/page/promotionsActivity.css';
</style>
<template>
    <div class="loading" v-show="$loadingRouteData"><i></i><i></i><i></i></div>
    <div class="page-back-btn" @click="doClickPageBack()" v-show="!$loadingRouteData"></div>
    <div class="page" id="promotions-activity-page" v-show="!$loadingRouteData">
        <div class="act-detail">
            <div class="act-bg" :style="{ backgroundImage : 'url('+actDetail.actLogoUrl+')' }"><div></div></div>
            <div class="act-content">
                <div class="act-title">
                    <div></div>
                    <span>{{actDetail.actTitle}}</span>
                    <a v-link="{ name : 'technicianList' }">马上预约</a>
                </div>
                <div class="act-item">
                    <i></i><div>{{actDetail.startDate | DateToString actDetail.endDate '—'}}</div>
                </div>
                <div class="act-item">
                    <i></i><div>活动规则</div>
                </div>
                <div class="act-desc">{{{actDetail.actContent}}}</div>
            </div>
        </div>
        <div class="other-act" v-if="otherActs.length>1">
            <div class="title">
                <div></div>
                <div>其他优惠</div>
            </div>
            <a v-if='act.actId !=actDetail.actId ' v-for="act in otherActs" v-link="{name :'promotionsActivity' , query : { id : act.actId }}">
                <div :style="{ backgroundImage : 'url('+act.actLogoUrl+')' }"></div>
                <div><i></i>{{act.actTitle}}</div>
                <div>活动时间：{{act.startDate | DateToString act.endDate '—'}}</div>
            </a>
        </div>
    </div>
</template>
<script>
    import { Global } from '../libs/global';
    import DateToString from "../filters/date-to-string";
    import Util from "../libs/util";

    module.exports = {
        data: function(){
            return {
                getActDetailDataUrl : "../api/v2/club/"+Global.data.clubId+"/"+Global.data.currPageQuery.id+"/actdetail",
                global : Global.data,
                actDetail : {
                    actId : "",
                    actLogoUrl :  Global.data.defaultBannerImgUrl,
                    actTitle : "",
                    startDate : "",
                    endDate : "",
                    actContent : ""
                },
                otherActs : []
            };
        },
        route: {
          data : function(transition){
              var _this = this;
              return new Promise(function(resolve,reject){
                  _this.$http.get(_this.getActDetailDataUrl).then(function(res){
                      res = res.body;
                      if(res.statusCode == 200){
                          res = res.respData;
                          resolve({ actDetail : res.act, otherActs : res.acts });
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
              })
          }
        },
        filters: {
            DateToString : DateToString
        },
        methods: {
            doClickPageBack : function(){//点击返回按钮
                history.back();
            }
        }
    }
</script>