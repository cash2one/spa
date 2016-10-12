<style>
    @import '../styles/page/serviceItem.css';
</style>
<template>
    <div>
        <div class="loading" v-show="loading"><i></i><i></i><i></i></div>
        <div class="page-back-btn" @click="doClickPageBack()" v-show="!loading"></div>
        <div class="confirm-btn" v-if="dataList.length>0"><a @click="doClickConfirmOrder()">确认预约</a></div>
        <div class="page" id="service-item-page" :style="{ height : (global.winHeight-3.333*global.winScale*16)+'px' }" v-if="!loading">
            <swipe class="profile-swipe" :show-indicators="false" :continuous="false" :auto="maxAutoTime" :curr-index="swipeInitIndex" v-if="dataList.length>0">
                <swipe-item v-for="item in dataList" :key="item.id">
                    <div class="service-item-top">
                        <div class="img" :style="{ backgroundImage : 'url('+(item.imageUrl || global.defaultServiceItemImgUrl)+')' }"></div>
                        <div>
                            <div>{{item.name}}</div>
                            <div v-show="item.price">
                                <div></div>
                                <div>{{item.price | itemPriceFormatter(item.duration,item.durationUnit)}}</div>
                            </div>
                            <div v-show="item.pricePlus">加钟{{item.pricePlus | itemPriceFormatter(item.durationPlus,item.durationUnitPlus)}}</div>
                        </div>
                    </div>
                    <div class="service-item-desc">
                        <div><i></i>项目说明</div>
                        <div v-html="item['description'] || ''"></div>
                    </div>
                </swipe-item>
            </swipe>
            <div class="nullData" v-show="dataList.length==0"><div></div><div>暂无内容...</div></div>
        </div>
        <tel-detail v-if="telephone.length>0" :telephone="telephone"></tel-detail>
    </div>
</template>
<script>
    import Vue from 'vue';
    import { Global } from '../libs/global';
    import Swipe from '../components/swipe';
    import SwipeItem from '../components/swipe-item';
    import TelDetail from '../components/tel-detail.vue';
    import ItemPriceFormatter from "../filters/item-price-formatter";
    import Util from "../libs/util";

    module.exports = {
        data: function(){
            return {
                global : Global.data,
                eventHub : Global.eventHub,
                loading : false,
                queryDataUrl : "../api/v2/club/"+Global.data.clubId+"/service/item",
                //queryDataUrl : "../json/serviceItem.json",
                isQueryAll : true,
                currServiceItemId : "",
                dataList : [],
                telephone : [],
                appointment : true,
                payAppointment : false,
                phoneAppointment : false,
                swipeInitIndex : 0,
                swipeIndex : 0,
                activeItemId : "",
                maxAutoTime : 24*60*60*1000
            }
        },
        components: {
            'swipe' : Swipe,
            'swipe-item' : SwipeItem,
            'tel-detail' : TelDetail
        },
        created : function(){
            var _this = this, global = _this.global,pageParam = global.currPageQuery;
            _this.activeItemId = _this.currServiceItemId = pageParam.id;
            _this.isQueryAll = pageParam.top != 1;
            if(!_this.currServiceItemId){
                return _this.$router.back();
            }
            else if(!_this.isQueryAll && _this.dataList.length==0){
                _this.loading = true;
                _this.$http.get(_this.queryDataUrl, { params : { top : 1 }}).then(function(res){
                    res = res.body;
                    if(res.statusCode == 200){
                        res = res.respData;
                        for(var i=0;i<res.serviceItems.length;i++){
                            if(res.serviceItems[i]["id"] == _this.currServiceItemId ){
                                _this.swipeIndex = _this.swipeInitIndex = i;
                                break;
                            }
                        }
                        if(res.telephone){
                            _this.telephone = res.telephone.split(",");
                        }

                        _this.dataList = res.serviceItems;
                        _this.appointment = res.appointment == "Y";
                        _this.payAppointment = res.payAppointment == "Y";
                        _this.phoneAppointment = res.phoneAppointment == "Y";
                    }
                    else{
                        Util.tipShow(global.loadDataErrorTip);
                        return _this.$router.back();
                    }
                    _this.loading = false;
                },function(){
                    Util.tipShow(global.loadDataErrorTip);
                    return _this.$router.back();
                });
            }
            _this.eventHub.$on("swipePageEnd",_this.doSwipePageEnd);
        },
        filters: {
            itemPriceFormatter : ItemPriceFormatter
        },
        mounted : function(){
            var _this = this;
            if(_this.isQueryAll){
                _this.queryItemData(_this.currServiceItemId,0);
            }
        },
        methods: {
            queryItemData : function(itemId,direction){
                var _this = this;
                _this.$http.get(_this.queryDataUrl, { params : {
                    top : 0,
                    index : direction,
                    itemId : itemId,
                    pageSize : 5
                }}).then(function(res){
                    res = res.body;
                    if(res.statusCode == 200){
                        var data = res.respData,i;
                        if(direction == 0){////初始加载数据
                            var tempArr = [];
                            for(i=0;i<parseInt(res.pageCount);i++){
                                tempArr.push({});
                            }
                            _this.swipeIndex = _this.swipeInitIndex = data.itemIndex;
                            _this.dataList = tempArr;
                            if(res.pageCount == 0){
                                return;
                            }
                            _this.appointment = data.appointment == "Y";
                            _this.payAppointment = data.payAppointment == "Y";
                            _this.phoneAppointment = data.phoneAppointment == "Y";
                            if(data.telephone){ _this.telephone = data.telephone.split(",") }
                        }

                        var itemIndex = data.itemIndex, listData = data.serviceItems, tempIndex;
                        for(i=0 ; i<listData.length ; i++){
                            if(listData[i].id == itemId){
                                tempIndex = i;
                                break;
                            }
                        }
                        if(!tempIndex && direction != 0){
                            if(direction == -1) tempIndex = listData.length;
                        }
                        tempIndex = itemIndex - tempIndex;
                        for(i=0; i<listData.length; i++){
                            if(!_this.dataList[i+tempIndex].id){
                                //console.log("填充位置:"+(i+tempIndex));
                                Vue.set(_this.dataList,i+tempIndex,listData[i]);
                            }
                        }
                    }
                });
            },
            doClickPageBack : function(){//点击返回按钮
                history.back();
            },
            doClickConfirmOrder : function(){//点击确认预约按钮
                var _this = this, global = _this.global;
                if(!_this.appointment && _this.phoneAppointment){
                    if(_this.telephone.length==0){
                        Util.tipShow("暂无预约电话！");
                    }
                    else{
                        _this.eventHub.$emit("change-tel-detail",true);
                    }
                }
                else if(_this.payAppointment && !global.userAgent.isWX){
                    Util.tipShow('【此会所需支付预约，请在微信客户端中打开】');
                }
                else{//跳转到预约
                    _this.$router.push({ name : "confirmOrder", query : { itemId : _this.activeItemId }});
                }
            },
            doSwipePageEnd : function(option){
                var   _this = this, dataList = _this.dataList;
                _this.activeItemId = dataList[option.currIndex]["id"];
                var queryParam = { id : _this.activeItemId };

                if(_this.isQueryAll){
                    var  direction = (option.currIndex-_this.swipeIndex>0 ? 1 : -1);
                    var swipeIndex = _this.swipeIndex = option.currIndex;
                    if((direction==1 && swipeIndex<dataList.length-1 && !dataList[swipeIndex+1]) || (direction==-1 && swipeIndex>0 && !dataList[swipeIndex-1])){
                        _this.queryItemData(dataList[swipeIndex]["id"],direction);
                    }
                }
                else{
                    queryParam.top = 1;
                }
                //_this.$router.replace({ name : "serviceItem" , query : queryParam });
            }
        },
        beforeDestroy : function(){
            var _this = this;
            _this.eventHub.$off("swipePageEnd",_this.doSwipePageEnd);
        }
    }
</script>