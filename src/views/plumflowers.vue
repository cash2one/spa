<style>
    @import '../styles/page/plumflowers.css';
</style>
<template>
    <div class="page" id="plumflowers-page">
        <router-link :to="{ name : 'home' }" class="header" tag="div"><div :style="{ backgroundImage : 'url('+(actData.clubLogo || global.defaultClubLogo )+')' }"></div><div>{{ actData.clubName }}</div><div class="right-arrow"></div></router-link>
        <div class="banner"><img v-if="actDetail.imageUrl" :src="actDetail.imageUrl" /></div>
        <div class="act-process">
            <div class="act-process-detail">
                <div :class="actDetail.status">{{ actDetail.status=='complete' ? "已结束" : "进行中" }}</div>
                <div>{{ actDetail.title }}</div>
                <div><span>￥</span><span class="price">{{ actDetail.price }}</span><span>/{{ actDetail.serviceTime }}分钟</span></div>
            </div>
            <div class="act-process-bar">
                <div><div :style="{ width : processRatio+'%' }"></div><div :style="{ left : processRatio+'%' }"></div></div>
            </div>
            <div class="act-process-text">
                <div>总需<span class="price">{{ actDetail.price }}</span>人次</div>
                <div>还差<span class="timesSurplus">{{ timesSurplus }}</span></div>
            </div>
        </div>
        <div class="item act-result" v-show="showActResult">
            <div></div>
            <div>中奖揭晓</div>
            <div v-show="!showWinningNo"><ul><li><span>本次开奖将以<span class="lottery-date">{{ actDetail.lotteryDate || '无' }}</span>福彩3D结果为参照，敬请期待！</span></li></ul></div>
            <div v-show="showWinningNo">
                <div>幸运号码<span>{{ actDetail.winningNo }}</span></div>
                <div>福彩3D<span>{{ actDetail.lotteryNo }}</span></div>
            </div>
        </div>
        <div class="item act-mynums" :class="{ 'no-nums' : !hasNum }">
            <div></div>
            <div>我的号码<a>查看</a></div>
            <div>
                <ul>
                    <li v-for="item in actNos">
                        <div><div><span>手机<span>{{ item.phoneNum }}</span></span><span>{{ item.createdAt | DateFormatter('MM月dd日 hh:mm:ss') }}</span></div><div v-html="item.actNo | PlumNumber(actDetail.winningNo)"></div></div>
                    </li>
                </ul>
            </div>
        </div>
        <div class="item act-rules">
            <div></div>
            <div>活动规则</div>
            <div>
                <ul>
                    <li><span>本活动需要支付，最低一元起，每支付一块钱获得一个号码。</span></li>
                    <li><span>当参与购买的达到{{ actDetail.price }}元，活动停止参与，并根据当天(20点之后则根据明天)福利彩票3D开奖号码计算出一个幸运号码，持有该号码的用户，即可获得奖励。</span></li>
                    <li><span>幸运号码计算办法：若开奖号码小于等于{{ actDetail.price }}即视作为幸运号码；若大于{{ actDetail.price }}则用该号码除以{{ actDetail.price }}余数作为幸运号码。</span></li>
                    <li><span>中奖者收到通知一个月内凭手机号到店消费，奖品不可兑现。</span></li>
                    <li><span>中奖者揭晓后，将会收到电话通知，但不会有任何形式付费领奖要求。一切要求转账、提供银行卡信息行为均为诈骗，请谨防上当受骗。</span></li>
                </ul>
            </div>
            <div><img :src="imgUrl"></div>
        </div>
        <div class="foot-btn">
            <div :class="isComplete ? 'next-time' : 'robed'">{{ isComplete ? '下次通知我' : '一元抢' }}</div>
            <div class="shared">{{ isComplete ? '给朋友看看' : '叫上朋友一起' }}</div>
        </div>
        <share :share-url="shareUrl"></share>
    </div>
</template>
<script>
    import { Global } from '../libs/global';
    import { eventHub } from '../libs/hub';
    import Util from "../libs/util";
    import Share from "../components/share";
    import DateFormatter from "../filters/date-formatter";
    import PlumNumber from "../filters/plum-munber";

    module.exports = {
        filters : {
            DateFormatter : DateFormatter,
            PlumNumber : PlumNumber
        },
        components : {
            share : Share
        },
        data: function(){
            return {
                global : Global.data,
                imgUrl : "images/plumflowers/9358.jpg",
                tel : "",
                isPay : false,
                isNeedQuery : false,
                actId : "",
                shareCode : "",
                openId : "",
                clubId : "",
                shareUrl : "",
                actData : {},
                actDetail : {},
                timesSurplus : "-",
                processRatio : 0,
                showActResult : false,
                showWinningNo : false,
                isComplete : false,
                hasNum : false,
                actNos : []
            };
        },
        beforeRouteEnter : function(to,from,next){
            var query = to.query, openId, global = Global.data, authCode = query.code || "";
            if(!query.id){
                Util.tipShow(global.visitError);
                next(false);
            }
            else{
                openId = Util.localStorage("_indianas_user_open_id") || "";
                if(global.userAgent.isWX){
                    if(!openId || openId.length<10){
                        if((+new Date())-(query["_t"] || 0)>24000 || authCode){
                            Global.getOauthCode("","9358","plumflowers_pay","base");
                        }
                        else{
                            Global.getOpenId({ authCode : authCode }).then(function(res){
                                openId = res.openid;
                                Util.localStorage("_indianas_user_open_id",openId);
                                next(function(vm){
                                    vm.openId = openId;
                                    vm.init();
                                })
                            },function(){
                                Util.tipShow("未能获取OpenId！");
                                next(false);
                            })
                        }
                    }
                    else{
                        next(function(vm){ vm.init() })
                    }
                }
                else{
                    next(function(vm){ vm.init() })
                }
            }
        },
        mounted : function(){

        },
        methods: {
            init : function(){
                var _this = this, global = _this.global, query = global.currPage.query, detail;
                _this.actId = query.id;
                _this.shareCode = query.shareCode || "";
                _this.tel = Util.localStorage("_indianas_tel_phone") || global.userTel || "";

                _this.$http.post("../api/v2/plumflower/view",{
                    id : _this.actId,
                    phoneNum : _this.tel,
                    shareCode : _this.shareCode,
                    topShareCode : query.topShareCode || '',
                    chanel : query.chanel || 'link'
                }).then(function(res){
                    res = res.body;
                    if(res.statusCode == 200){
                        res = res.respData;
                        _this.clubId = res.clubId;
                        _this.shareUrl = res.shareUrl || location.href + (query.chanel ? "" : "&chanel=link");
                        if(res.shareCode){
                            _this.shareCode = res.shareCode;
                        }
                        detail = _this.actDetail = res.plumFloweActivity;
                        _this.actData = res;
                        _this.timesSurplus = detail.price - detail.successPaidAmount;
                        _this.processRatio = (detail.successPaidAmount/detail.price*100).toFixed(3);
                        _this.actNos = (res.actNos && res.actNos.length ? res.actNos : []);

                        if(detail.status == "complete"){
                            _this.showActResult = true;
                            _this.showWinningNo = !!detail.winningNo;
                            _this.isComplete = true;
                        }
                        else if(_this.actNos.length>0){
                            _this.showWinningNo = false;
                            _this.hasNum = true;
                            if(_this.timesSurplus == 0){
                                _this.showActResult = true;
                            }
                        }

                        if(_this.timesSurplus == 0){
                            _this.isComplete = true;
                        }

                        if(_this.tel){
                            if(_this.actNos.length == 0 && query.isSearch){
                                /////////$.paramClear('isSearch');
                                Util.tipShow('未查询到您的购买信息。',5000);
                            }

                        }

                    }
                });

                Global.setDocumentTitle("一元夺美女");
            },

            //设置分享
            shareSetting : function(shareUrl,clubLogo,actId){
                var _this = this, global = _this.global, query = global.currPage.query;
                Global.shareConfig({
                    title : "一元夺美女",
                    desc : '一元抢会所高端项目，美女技师任你挑~',
                    link : shareUrl,
                    imgUrl : clubLogo || global.defaultClubLogo,
                    success : function(){
                        _this.$http.post("../api/v2/plumflower/share",{
                            id : actId,
                            shareCode : _this.shareCode || "",
                            topShareCode : query.topShareCode || "",
                            chanel : query.chanel || ""
                        })
                    },
                    fail : function(){
                        Util.tipShow("分享失败！请刷新页面后再试！")
                    }
                })
            }
        }
    }
</script>