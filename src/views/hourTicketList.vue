<style>
    @import '../styles/page/hourTicketList.css';
</style>
<template>
    <div class="page" id="hour-ticket-list-page" v-show="!global.loading">
            <div class="page-title"><a class="back" @click="doClickPageBack()"></a>点钟券</div>
            <div class="list" :style="{ height : (global.winHeight-2.611*global.winScale*16)+'px' }">
                <div class="item" v-for="item in dataList" @click="doClickPaidCoupon(item.actId)">
                    <div>
                        <div><span v-show="item.useType == 'money'">￥</span>{{ item.useType == "money" ? item.actValue : item.actTitle }}</div>
                        <span>{{ item.consumeMoneyDescription }}</span>
                        <div><div>{{ item.useTypeName }}</div><div>立即购买</div></div>
                        <div></div>
                        <div></div>
                    </div>
                </div>
                <div class="nullData" v-show="dataList.length==0"><div></div><div>暂无内容...</div></div>
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
                queryDataUrl : "../api/v1/profile/redpack/list",
                dataList : [],
                clubId : "",
                techCode : ""
            }
        },
        created : function(){
            var   _this = this, global = _this.global;
            _this.clubId = global.currPageQuery.clubId || global.clubId;
            _this.techCode = global.currPageQuery.techCode;
            global.loading = true;
            _this.$http.get(_this.queryDataUrl, { params : { clubId : _this.clubId }}).then(function(res){
                res = res.body;
                global.loading = false;
                if(res.statusCode == 200){
                    res = res.respData.coupons;
                    var list = [];
                    for(var i=0;i<res.length;i++){
                        if(res[i].couponType == "paid"){
                            res[i].useType =( res[i].useType == "null" ? "money" : res[i].useType);
                            list.push(res[i]);
                        }
                    }
                    _this.dataList = list;
                }
                else{
                    Util.tipShow(res.msg || global.loadError);
                    _this.$router.back();
                }
            },function(){
                Util.tipShow(global.loadError);
                global.loading = false;
                _this.$router.back();
            });
        },
        methods: {
            doClickPageBack : function(){
                history.back();
            },
            doClickPaidCoupon : function(actId){
                var _this = this, global = _this.global;
                if(!global.isLogin){
                    global.loginPage = "paidCoupon";
                    global.loginPageQuery = { actId : actId, techCode : _this.techCode };
                }
                else{
                    _this.$router.push({ name : "paidCoupon", query : { actId : actId, techCode : _this.techCode }});
                }
            }
        }
    }
</script>