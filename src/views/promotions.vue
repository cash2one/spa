<style>
    @import '../styles/page/promotions.css';
</style>
<template>
    <div class="loading" v-show="$loadingRouteData"><i></i><i></i><i></i></div>
    <div class="page" id="promotions-page" v-show="!$loadingRouteData">
        <div class="page-title"><a class="back" @click="doClickPageBack()"></a>优惠活动</div>
        <div class="title" v-if="coupons.length>0">优惠券</div>
        <div v-for="coupon in coupons" :class="[coupon['getFlag'], 'money', coupon['useType']=='money' ? '' : 'coupon' ]">
            <div>
                <div><span v-if="coupon['useType'] == 'money'">￥</span>{{coupon['useType'] == 'money' ? coupon['actValue'] : coupon['actTitle'] }}</div>
                <span v-show="coupon['useType']!='money' || coupon['consumeMoney']!=0">{{coupon['useType']=='money' ? coupon['consumeMoneyDescription'] : coupon['actValue']}}<span v-if="coupon['useType']!='money'">元&nbsp;&nbsp;&nbsp;&nbsp;原价：<span>{{coupon['consumeMoney']}}元</span></span></span>
                <div>
                    <div>{{coupon['useTypeName']}}</div>
                    <div>{{coupon['getFlag']=='already_get' ? '已领取' : (coupon['getFlag']=='finish_get' ? '已领取完' : '立即领取') }}</div>
                    <div></div><div></div>
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
        <div class="nullData" v-if="activities.length==0 && coupons.length==0"><div></div><div>暂无内容...</div></div>
    </div>
</template>
<script>
    import { Global } from '../libs/global';
    import DateToString from "../filters/date-to-string";
    import Util from "../libs/util";

    module.exports = {
        data: function(){
            return {
                getActivitiesDataUrl : "../api/v2/club/"+Global.data.clubId+"/activities",
                global : Global.data,
                coupons : [],
                activities : []
            };
        },
        route : {
            data : function(transition){
                var _this = this;
                return new Promise(function(resolve,reject){
                    _this.$http.get(_this.getActivitiesDataUrl).then(function(res){
                        res = res.body;
                        if(res.statusCode == 200){
                            res = res.respData;
                            for(var i=0;i<res.coupons.length;i++){
                                res.coupons[i]['useType'] = ( res.coupons[i]['useType']=="null" ? "money" : res.coupons[i]['useType']);
                                if(res['coupons'][i]['useType']=='money' && res['coupons'][i]['consumeMoney']==0 ){
                                    res['coupons'][i]['consumeMoneyDescription'] = "不限使用";
                                }
                            }
                            resolve({ coupons : res.coupons , activities : res.acts });
                        }
                        else{
                            Util.tipShow(_this.global.loadDataErrorTip);
                            reject(false);
                            transition.abort();
                        }
                    }, function(){
                        Util.tipShow(_this.global.loadDataErrorTip);
                        reject(false);
                        transition.abort();
                    });
                })
            }
        },
        filters: {
            dateToString : DateToString
        },
        methods: {
            doClickPageBack : function(){//点击返回按钮
                history.back();
            }
        }
    }
</script>