<style>
    @import '../styles/page/technicianDetail.css';
</style>
<template>
    <div>
        <div class="page-back-btn tech-detail-page" @click="doClickPageBack()" v-show="!global.loading"></div>
        <div class="page-back-home" @click="doClickBackHomeBtn()">会所</div>
        <div class="page" id="technician-detail-page" v-show="!global.loading" :style="{ height : (global.winHeight-2.667*global.winScale*16)+'px' }">
            <div class="top">
                <div class="header"><div v-if="techAvatarUrl" :style="{ backgroundImage : 'url('+techAvatarUrl+')' }"></div></div>
                <div class="name"><div>{{techName}}</div><div v-show="techNo">{{techNo}}</div><div :class="techStatus">{{ techStatus=='free' ? '闲' : '忙' }}</div></div>
                <div class="favorite" @click="doClickCollectBtn()" :class="{ collected : isFavorite }"><div></div><div>{{favoriteCount}}</div><span :class="{ active : showCollectedAni }">{{collectedText}}</span></div>
            </div>
            <div class="pics" v-show="techPics.length>0">
                <div><router-link v-for="pic in techPics" :style="{ backgroundImage : 'url('+pic.imageUrl+')' }" :to="{ name : 'technicianImg' , query : { id : techId , index : pic.orders }}" tag="div"></router-link></div>
            </div>
            <router-link class="comment" :to="{ name : 'review' , query : { id : techId }}" tag="div">
                <div class="icon"></div>
                <div class="arrow"></div>
                <div>所有评论</div>
                <div>
                    <div class="stars"><div :style="{ width : techStar+'%'}"></div></div>
                    <div>{{techCommentCount}}评论</div>
                </div>
            </router-link>
            <router-link class="view" :to="{ name : 'technicianList' }" tag="div">
                <div class="icon"></div>
                <div class="arrow"></div>
                <div>查看店内其他技师</div>
            </router-link>
            <div class="service-item" v-show="serviceItems.length>0">
                <div class="title">选择项目<div></div></div>
                <div class="wrap">
                    <div class="item" v-for="service in serviceItems" :class="{ selected : service.id == currSelectItem }" @click="doSelectServiceItem(service.id)">
                        <div></div>
                        <div :style="{ backgroundImage : 'url('+service.imageUrl+')' }"></div>
                        <div>{{service.name}}</div>
                        <div>
                            <div>{{service.price1 | itemPriceFormatter(service.duration1,service.durationUnit)}}</div>
                            <div v-show="service.price2">{{service.price2 | itemPriceFormatter(service.duration2,service.durationUnitPlus)}}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="tech-detail-footer-wrap">
            <div @click="doClickCommentBtn()"><i></i>点评</div>
            <div @click="doClickRewardBtn()"><i></i>打赏</div>
            <router-link :to="{ name : 'chat', query : { techId : techId } }" tag="div"><i></i>聊天</router-link>
            <div @click="doClickOrderBtn()" :class="{ active : canOrder }">预约</div>
        </div>

        <tel-detail ref="telDetail" v-if="telephone.length>0" :telephone="telephone"></tel-detail>

        <div class="club-coupon" :class="{ hide : paidCoupons.length==0 && ordinaryCoupons.length==0 }" @click="switchCouponListStatus(true)"><div></div><span>抢优惠</span></div>
        <div class="coupon-list" :class="{ active : showCouponList }">
            <div>
                <div class="title"><span>抢优惠</span><div @click="switchCouponListStatus(false)">&times;</div></div>
                <div class="list">
                    <div class="coupon-title" v-if="paidCoupons.length>0">点钟券</div>
                    <div class="coupon-item paid" v-for="coupon in paidCoupons" @click="doClickPaidCoupon(coupon)">
                        <div>
                            <div>{{coupon.actTitle}}</div>
                            <div>{{coupon.consumeMoneyDescription}}</div>
                        </div>
                        <div>
                            <div>点钟券</div>
                            <div>立即购买</div>
                        </div>
                    </div>
                    <div class="coupon-title" v-if="ordinaryCoupons.length>0">优惠券</div>
                    <div class="coupon-item ordinary" v-for="coupon in ordinaryCoupons">
                        <div>
                            <div>{{coupon.actTitle}}</div>
                            <div>{{(coupon.useType == 'money' ? (coupon.actValue+'元现金券，') : '') + coupon.consumeMoneyDescription}}</div>
                        </div>
                        <div>
                            <div>{{coupon.useTypeName}}</div>
                            <div>{{ (coupon.getFlag == 'already_get' ? '已领取' : (coupon.getFlag == 'finish_get' ? '已领完' : '立即领取')) }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import { Global } from '../libs/global';
    import Util from "../libs/util";
    import TelDetail from '../components/tel-detail.vue';
    import ItemPriceFormatter from "../filters/item-price-formatter";

    module.exports = {
        components : {
            'tel-detail' : TelDetail
        },
        data: function(){
            return {
                global : Global.data,
                queryTechDetailUrl : "../api/v2/club/technician/"+Global.data.currPageQuery.id,
                queryClubCouponUrl : "../api/v2/club/"+Global.data.clubId+"/coupons",
                updateFavoriteTechUrl : "../api/v2/profile/user/favorite/",

                techId : '', //技师ID
                techAvatarUrl : "",   //技师头像
                techName : "", //技师名称
                techNo : "", //技师编号
                techStatus : "", //技师状态
                techInviteCode : "",//技师邀请码
                favoriteCount : 0, //技师收藏数

                techPics : [], //技师相片
                techCommentCount : 0,//技师评论数
                techStar : 0,//技师星级
                serviceItems : [],//服务项目列表
                canComment : false, //是否可评论
                isFavorite : false, //是否已收藏
                collectedAniTimer : null,
                showCollectedAni : false,
                collectedText : "",

                canOrder : true, //是否可以预约
                phoneAppointment : "",
                appointment : "",
                payAppointment : "",
                telephone : [],//电话

                currSelectItem : '',//当前选中的项目

                paidCoupons : [], //点钟券数据
                ordinaryCoupons : [], //普通优惠券数据
                showCouponList : false //是否显示优惠券列表
            };
        },
        mounted : function(){
            var _this = this;
            ////////////////////////////////////获取优惠券数据
            _this.$http.get(_this.queryClubCouponUrl).then(function(res) {
                res = res.body;
                if (res && res.statusCode==200){
                    res = res.respData.coupons || [];
                    res.sort(function (a, b) {
                        return a.useType >= b.useType ? ((b.consumeMoney - b.actValue) - (a.consumeMoney - a.actValue)) : -1;
                    });
                    for(var i= 0,len = res.length;i<len;i++){
                        if(res[i]["couponType"] == "paid"){ //点钟券
                            _this.paidCoupons.push(res[i]);
                        }
                        else{
                            _this.ordinaryCoupons.push(res[i]);
                        }
                    }
                }
            });
        },
        created : function(){
            var _this = this, global = _this.global;
            if(global.currPageQuery.id == undefined){//链接上无技师id
                return _this.$router.back();
            }
            global.loading = true;
            _this.$http.get(_this.queryTechDetailUrl).then(function(res){
                res = res.body;
                global.loading = false;
                if(res && res.info){
                    ///////////技师相册缓存到global
                    if(res.albums){
                        var pageData = global.pageData;
                        if(!pageData["technicianImg"]){
                            pageData["technicianImg"] = {};
                        }
                        pageData["technicianImg"][res.id] = res.albums;
                    }
                    _this.techId = res.id;
                    _this.techAvatarUrl = res.info.avatarUrl || _this.global.defaultHeader;
                    _this.techName = res.info.name || _this.global.defaultTechName;
                    _this.techNo = res.info.serialNo || "";
                    _this.techStatus = res.info.status || "free";
                    _this.favoriteCount = parseInt(res.favoriteCount || 0);
                    _this.techInviteCode = res.info.inviteCode || "";
                    _this.techPics = res.albums || [];
                    _this.techCommentCount = res.info.commentCount || 0;
                    _this.techStar = res.info.star || 0;
                    _this.serviceItems = res.service || [];
                    _this.canComment = res.toDayCommentCount != 1;
                    _this.isFavorite = (res["isFavorite"] || 'n').toLowerCase() == 'y';
                    _this.canOrder = (res['appointment'] || 'y').toLowerCase() != 'n' || (res['phoneAppointment'] || 'y').toLowerCase() != 'n';
                    _this.phoneAppointment = (res.phoneAppointment || 'y').toLowerCase();
                    _this.appointment = (res.appointment || 'y').toLowerCase();
                    _this.telephone = res.telephone ? res.telephone.split(",") : [];
                    _this.payAppointment = res.payAppointment || 'N';
                }
                else{
                    Util.tipShow(global.loadError);
                    _this.$router.back();
                }
            }, function(){
                Util.tipShow(global.loadError);
                global.loading = false;
                _this.$router.back();
            });
        },
        methods: {
            doClickPageBack : function(){//点击返回按钮
                history.back();
            },
            doClickBackHomeBtn : function(){//点击回到主页的按钮

            },
            doSelectServiceItem : function(itemId){
                this.currSelectItem = itemId;
            },
            doClickRewardBtn : function(){//点击打赏按钮
                var _this = this;
                if(_this.global.userAgent.isWX){
                    _this.$router.push({
                        name : "techReward",
                        query : { techId : _this.techId }
                    });
                }
                else{
                    Util.tipShow("请在微信中打开！");
                }
            },
            doClickOrderBtn : function(){//点击预约按钮
                var _this = this;
                if(_this.canOrder){
                    if(_this.phoneAppointment != "n"){
                        if(!_this.global.isLogin){//未登录，跳转到登录页
                            _this.$router.push({ name : "login" });
                        }
                        else if(_this.telephone.length ==0){
                            Util.tipShow("暂无联系电话！");
                        }
                        else{
                            _this.$refs.telDetail.$emit("change-visible",{ ope : "show" });
                        }
                    }
                    else if(_this.appointment != "n"){
                        if(_this.payAppointment == "Y" && !_this.global.userAgent.isWX){
                            Util.tipShow("此会所需支付预约，请在微信客户端中打开！");
                        }
                        else{
                            _this.$router.push({
                                name : "confirmOrder",
                                query : {
                                    techId : _this.techId,
                                    itemId : _this.currSelectItem,
                                    clubId : ""
                                }
                            });
                        }
                    }
                }
            },
            doClickCommentBtn : function(){//点击点评按钮
                var _this = this;
                if(_this.canComment){
                    _this.$router.push({
                        name : 'comment',
                        query : { techId : _this.techId, type : 'tech' }
                    })
                }
                else{
                    Util.tipShow("您今天已经评论过该技师了！");
                }
            },
            switchCouponListStatus : function(type){
                this.showCouponList = type;
            },
            doClickCollectBtn : function(){//点击收藏按钮
                var _this = this, global = _this.global;
                if(!global.isLogin){
                    global.loginPage = "technicianDetail";
                    global.loginPageQuery = { id : _this.techId };
                    _this.$router.push({ name : 'comment' });
                    return;
                }
                if(_this.collectedAniTimer){
                    clearTimeout(_this.collectedAniTimer);
                    _this.showCollectedAni = false;
                }
                _this.$http.get(_this.updateFavoriteTechUrl+(_this.isFavorite ? "delete" : "create"),{ params : { id : _this.techId } }).then(function(res){
                    _this.isFavorite = !_this.isFavorite;
                    if(_this.isFavorite){
                        _this.collectedText = "已收藏";
                        _this.favoriteCount += 1;
                    }
                    else{
                        _this.collectedText = "已取消";
                        _this.favoriteCount -= 1;
                    }
                    _this.showCollectedAni = true;
                    _this.collectedAniTimer = setTimeout(function(){
                        _this.showCollectedAni = false;
                    },1100)
                },function(error){
                    console.log("error"+JSON.stringify(error));
                });
            },
            doClickPaidCoupon : function(coupon){
                var _this = this, global = _this.global;
                _this.$router.push({
                    name : "paidCoupon",
                    query : { actId : coupon.actId , techCode : _this.techInviteCode, chanel : global.currPageQuery.chanel || "link" }
                });
            }
        },
        filters: {
            itemPriceFormatter : ItemPriceFormatter
        }
    }
</script>