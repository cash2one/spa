<style>
    @import '../styles/page/coupon.css';
</style>
<template>
    <div class="page" id="coupon-page" v-show="!global.loading" :style="{ height : global.winHeight+'px' }">
        <div class="page-title"><a class="back" @click="doClickPageBack()"></a>优惠券</div>
        <div class="list" ref="listEle" :style="{ height : (global.winHeight-2.611*global.winScale*16)+'px' }" @scroll="doHandlerListScroll()">
                <div class="list-item" v-for="singleClubData in dataList">
                    <div class='header' v-if="isQueryAll">{{ singleClubData.clubName }}</div>
                    <router-link v-for="item in singleClubData.list" class="item" :class="{ expire : item.isExpire }" :type="item.couponType" :to="{ name : item.couponType=='paid' ? 'paidCouponDetail' : 'couponDetail', query : { userActId : item.userActId }}">
                        <i></i>
                        <div>{{ item.actTitle }}</div>
                        <div>{{ item.useType == 'money' ? ( item.actValue+'元现金券') : '' }}<div v-html="item.consumeMoneyDescription"></div></div>
                        <div>券有效期：{{ item.couponPeriod }}</div>
                        <div>{{ item.useTypeName }}</div>
                        <span v-if="item.isExpire">{{ item.couponStatusDescription }}</span>
                        <span v-if="!item.isExpire && item.couponType == 'paid'" :class="item.couponStatusClass">{{ item.couponStatusDescription }}</span>
                        <div v-show="item.couponType== 'redpack'">分享获得更多优惠机会</div>
                    </router-link>
                </div>
                <div class="data-load-tip" :class="{ none : !showDataLoadTip }"><i></i><div>加载数据</div></div>
                <div class="finish-load-tip border-top" :class="{ none : !showFinishLoadTip }"><div>已经加载全部数据</div></div>
                <div class="nullData" v-show="dataList.length==0 && !isAddData"><div></div><div>暂无内容...</div></div>
            </div>
    </div>
</template>
<script>
    import { Global } from '../libs/global';
    import Util from "../libs/util";

    module.exports = {
        data: function(){
            return {
                global : Global.data,
                getRecordsUrl : "../api/v2/club/user_get_coupons",
                dataList : [],
                dataIndex : {},
                currPage : 0,
                pageSize : 10,
                isQueryAll : true,//查询所有的

                showDataLoadTip : false, //显示数据正在加载
                showFinishLoadTip : false,//显示已经加载完成
                isDataAddEnd : false,//数据是否已加载完
                isAddData : false//数据是否正在加载
            }
        },
        mounted: function(){
            var _this = this;
            _this.isQueryAll = _this.global.pageMode != "club" || _this.global.currPage.query.all=="true";
            _this.queryRecord();
        },
        methods: {
            doClickPageBack : function(){
                history.back();
            },
            queryRecord : function(page){
                var _this = this, global = _this.global;
                if(_this.isAddData){
                    return;
                }
                _this.isAddData = true;
                page = page || _this.currPage+1;

                //更新数据加载提示
                _this.showDataLoadTip = true;
                _this.showFinishLoadTip = false;
                _this.isDataAddEnd = false;

                _this.$http.get(_this.getRecordsUrl, { params: {
                    page: page,
                    pageSize: _this.pageSize,
                    clubId : (_this.isQueryAll ? "" : global.clubId),
                    loginName : global.loginName
                }}).then(function (res) {
                    res = res.body;
                    if (res) {
                        res = (res.statusCode != '200') ? [] : res['respData'];

                        _this.doHandlerData(res);
                        if(res.length < _this.pageSize){
                            _this.isDataAddEnd = true;
                            if(res.length != 0){
                                _this.showFinishLoadTip = true;
                            }
                        }
                        _this.currPage = page;
                        _this.isAddData = false;
                        _this.showDataLoadTip = false;
                    }
                    else {
                        Util.tipShow(global.loadError);
                    }
                }, function () {
                    Util.tipShow(global.loadError);
                });
            },
            doHandlerListScroll : function(){
                var _this = this,listEle = _this.$refs.listEle;
                if(!_this.isDataAddEnd && listEle.scrollTop+listEle.clientHeight*1.4>listEle.scrollHeight ){
                    _this.queryRecord();
                }
            },
            doHandlerData : function(data){
                var _this = this, item,dataIndex;
                for(var k=0;k<data.length;k++){
                    item = data[k];
                    item.isExpire = (item["couponStatusDescription"] == "已过期" || item["couponStatusDescription"] == "已使用" );
                    item.useType = item.useType || "money";
                    if (item.useType == "money" && item.consumeMoney == 0) {
                        item.consumeMoneyDescription = "&nbsp;";
                    }
                    item.couponStatusClass = (item["couponStatus"] == 0 ? "unpay" : (item["couponStatus"] == 1 ? "payed" : "expire"));
                    dataIndex = _this.dataIndex[item["clubId"]];
                    if(dataIndex == undefined){
                        dataIndex = _this.dataList.length;
                        _this.dataIndex[item["clubId"]] = dataIndex;
                        _this.dataList.push({ clubName : item.clubName , list : [] });
                    }
                    _this.dataList[dataIndex].list.push(item);
                }
            }
        }
    }
</script>