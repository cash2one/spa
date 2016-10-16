<style>
    @import '../styles/page/chat.css';
</style>
<template>
    <div class="page" id="chat-page" v-show="!global.loading">
        <div class="page-title"><a class="back" @click="doClickPageBack()"></a>{{ talker.name }}<span v-show="talker.userNo">[{{ talker.userNo }}]</span><a class="icon home" :class="{ once : talker.userType=='manager' }" @click="doClickHomeIcon()"></a><router-link class="icon tech" v-show="talker.userType=='tech'" :to="{ name : 'technicianDetail', query : { id : talker.userId } }"></router-link></div>
        <div class="order-tip" @click="doClickOrderTip()" v-show="talker.userType=='tech'">如果技师没有回应，那就立即预约吧！<div></div></div>
        <div class="message-wrap" :style="{ height : msgWrapHeight+'px' }">
            <!--<loadmore :top-method="loadMoreData">
                   <ul>
                        <li v-for="item in list">{{ item }}</li>
                    </ul>
                </loadmore>-->
        </div>
        <chat-input :credit-config="creditConfig" :gifts="gifts"></chat-input>
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
    import LoadMore from '../components/load-more';

    module.exports = {
        components : {
            'load-more' : LoadMore,
            'tel-detail' : TelDetail,
            'credit-tip' : CreditTip,
            'chat-input' : ChatInput,
            'dice-setting' : DiceSetting
        },
        data: function(){
            return {
                global : Global.data,
                im : IM,
                clubId : "",
                talker : IM.talker, //当前聊天的对方
                list : [], //聊天页面的消息列表数据
                msgWrapHeight : null,

                gameStatusObj : { request : "等待接受...", accept : "已接受", reject : "已拒绝", overtime : "已超时", cancel : "已取消" }, //游戏状态
                gameOverTime : 24*60*60*1000, //游戏超时时间
                giftMapData : {}, //积分礼物数据
                gifts : [],
                defaultGiftImg : "img/chat/gift_default.png", //默认的积分礼物图片
                creditConfig : null
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
                next();
            }
        },
        created : function(){
            var   _this = this, global = _this.global, params = global.currPage.query, talker = _this.talker;
            _this.clubId = params.clubId || global.clubId;
            _this.msgWrapHeight = global.winHeight-8.858*global.winScale*16;

            if(!_this.im.id){
                Util.tipShow("请您先登录！");
                Global.loginParams("chat");
                return _this.$router.push({ name : "login" });
            }

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
                    eventHub.$emit("update-credit-account");
                }
                else{
                    //addRecentlyMsg
                }
            });
        },
        mounted : function(){
          var _this = this;
            /*for(var i=0;i<10;i++){
                _this.list.push(i);
            }
            console.dir(_this.list);*/
            window["webIM"] = WebIM;
        },
        methods: {
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
            }
        }
    }
</script>