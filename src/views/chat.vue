<style>
    @import '../styles/page/chat.css';
</style>
<template>
    <div class="page" id="chat-page" v-show="!global.loading" :style="{ height : global.winHeight+'px' }">
        <div class="page-title"><a class="back" @click="doClickPageBack()"></a>{{ talker.name }}<span v-show="talker.userNo">[{{ talker.userNo }}]</span><a class="icon home" :class="{ once : talker.userType=='manager' }" @click="doClickHomeIcon()"></a><router-link class="icon tech" v-show="talker.userType=='tech'" :to="{ name : 'technicianDetail', query : { id : talker.userId } }"></router-link></div>
        <div class="order-tip" @click="doClickOrderTip()" v-show="talker.userType=='tech'">如果技师没有回应，那就立即预约吧！<div></div></div>
        <div class="message-wrap" :style="{ height : msgWrapHeight+'px' }">
            <!--<loadmore :top-method="loadMoreData">
                   <ul>
                        <li v-for="item in list">{{ item }}</li>
                    </ul>
                </loadmore>-->
        </div>
        <chat-input :credit-config="creditConfig" :gifts="gifts" :coupons="coupons" :curr-integral-account="currIntegralAccount"></chat-input>
        <tel-detail v-if="talker.telephone.length>0" :telephone="talker.telephone"></tel-detail>
        <dice-setting></dice-setting>
    </div>
</template>
<script>
    import Vue from 'vue';
    import { Global } from '../libs/global';
    import { eventHub } from '../libs/hub';
    import { IM } from '../libs/im';
    import Util from "../libs/util";
    import TelDetail from '../components/tel-detail';
    import CreditTip from '../components/credit-tip';
    import ChatInput from '../components/chat-input';
    import DiceSetting from '../components/dice-setting';
    import MessageNode from '../components/message-node';
    import LoadMore from '../components/load-more';

    module.exports = {
        components : {
            'load-more' : LoadMore,
            'tel-detail' : TelDetail,
            'credit-tip' : CreditTip,
            'chat-input' : ChatInput,
            'dice-setting' : DiceSetting,
            'message-node' : MessageNode
        },
        data: function(){
            return {
                global : Global.data,
                im : IM,
                clubId : "",
                talker : IM.talker, //当前聊天的对方
                list : [], //聊天页面的消息列表数据
                msgWrapHeight : null,

                giftMapData : {}, //积分礼物数据
                gifts : [],
                creditConfig : {
                    diceGameSwitch : false,
                    creditSwitch : false,
                    diceGameTimeout : 24*60*60*1000
                },
                currIntegralAccount : 0, //当前账户积分

                coupons : [] //优惠券数据
            }
        },
        beforeRouteEnter : function(to,from,next){
            if(Global.data.pageMode != "club" && to.query.clubId){
                Util.tipShow(Global.data.visitError);
                return next(false);
            }
            var techId = to.query.techId;
            if(techId){
                /////查询技师的信息
                Vue.http.get("../api/v2/club/technician/"+techId,{ params : { needServiceInfo : 'N' }}).then(function(res){
                    res = res.body;
                    if(res.id){
                        next(function(vm){
                            var talker = vm.talker, global = vm.global, info = res.info;
                            talker.userType = "tech";
                            talker.userId = techId;
                            talker.id = res.emchatId;
                            talker.name = info.name || global.defaultTechName;
                            talker.header = info.avatarUrl || global.defaultHeader;
                            talker.userNo = info.serialNo || "";
                            talker.avatar = info.avatar;
                            talker.clubId = info.clubId;
                            talker.clubName = res.clubName;
                            talker.inviteCode = info.inviteCode;
                            talker.isAppointment = res.appointment != "N";
                            talker.isPhoneAppointment = res.phoneAppointment != "N";
                            talker.telephone = (res.telephone ? res.telephone.split(",") : []);
                            vm.init();
                        });
                    }
                    else{
                        Util.tipShow("未能获取技师信息！");
                        next(false);
                    }
                });
            }
            else if(!IM.talker.id){ ///如果没有技师id参数，则当做管理者
                next(false);
            }
            else{
                next(function(vm){ vm.init() });
            }
        },
        created : function(){
            var _this = this;
            if(!_this.im.id){
                Util.tipShow("请您先登录！");
                Global.loginParams("chat");
                _this.$router.push({ name : "login" });
            }
        },
        methods: {
            init : function(){
                var   _this = this, global = _this.global, params = global.currPage.query, talker = _this.talker;
                _this.clubId = params.clubId || global.clubId;
                _this.msgWrapHeight = global.winHeight-8.858*global.winScale*16;

                //////获取积分系统开关
                Global.getClubSwitches(talker.clubId,function(res){
                    _this.creditConfig = res;

                    if(res.creditSwitch){
                        _this.$http.get("../api/v2/credit/gift/list").then(function(giftRes){
                            giftRes = giftRes.body.respData;
                            if(giftRes){
                                var list = {};
                                for(var i=0;i<giftRes.length;i++){
                                    list[giftRes[i]["id"]] = { url : giftRes[i]["gifUrl"] };
                                }
                                _this.giftMapData = list;
                                _this.gifts = giftRes;
                                //addRecentlyMsg
                            }
                        });
                        _this.updateCreditAccount();//获取当前账户积分
                    }
                    else{
                        //addRecentlyMsg
                    }
                });

                /////获取优惠券数据
                if(talker.userType == "tech"){
                    _this.$http.get("../api/v1/profile/redpack/list",{ params : { clubId : talker.clubId }}).then(function(couponRes){
                        couponRes = couponRes.body;
                        if(couponRes.statusCode == 200){
                            var couponData= couponRes.respData.coupons || [];
                            if(couponData.length>0){
                                var lastObj = couponData[couponData.length-1];
                                if(lastObj.actTitle.length>7) lastObj.actTitle = lastObj.actTitle.substr(0,7)+"...";
                            }
                            _this.coupons = couponData;
                        }
                    });
                }
            },
            doClickPageBack : function(){
                history.back();
            },
            loadMoreData : function(id){
                var _this = this, last = _this.list[_this.list.length-1];
                /*for(var i=last+1;i<last+10;i++){
                    _this.list.unshift(i);
                }*/
                eventHub.$emit('onTopLoaded', id);
            },
            doClickOrderTip : function(){//点击预约（提示）
                var _this = this, talker = _this.talker;
                if(talker.isAppointment){
                    _this.$router.push({ name : "confirmOrder", query : { techId : talker.userId, clubId : talker.clubId }});
                }
                else if(talker.isPhoneAppointment){
                    if(talker.telephone.length == 0){
                        Util.tipShow("暂无预约电话！");
                    }
                    else{
                        eventHub.$emit("change-tel-detail",true);
                    }
                }
                else{
                    Util.tipShow("抱歉！当前技师不可预约！");
                }
            },
            doClickHomeIcon : function(){//点击主页图标
                var _this = this;
                if(_this.global.pageMode == "club"){
                    _this.$router.push({ name : "home" });
                }
                else{
                    location.href = location.origin+location.pathname+"#/"+_this.talker.clubId+"/home";
                    location.reload(true);
                }
            },
            updateCreditAccount : function(){ //更新当前账户积分
                var _this = this, talker = _this.talker;
                Global.getCreditAccount(talker.clubId,function(res){
                    _this.currIntegralAccount = (res[0] ? res[0].amount : 0);
                });
            }
        }
    }
</script>