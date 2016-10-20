<style lang="sass">
    @import "../sass/page/orderDetail.scss";
</style>
<template>
    <div>
        <div class="page" id="order-detail-page" v-if="!global.loading" >
            <div class="page-title"><a class="back" @click="doClickBackPage()"></a>订单详情</div>

            <div :style="{ height : (global.winHeight-2.611*global.winScale*16)+'px' }">
                <div>
                    <div>{{clubInfo.clubName}}</div>
                    <div @click="doClickTelDetail()"><div></div></div>
                </div>

                <div>
                    <router-link :style="{ backgroundImage : 'url('+(orderData.techAvatarUrl || global.defaultHeader)+')'}"
                                 :to="{name:'chat',query:{techId:orderData.technicianId,clubId:orderData.clubId}}" tag="div" v-if="orderData.technicianId"></router-link>
                    <div v-else :style="{ backgroundImage : 'url('+(orderData.techAvatarUrl || global.defaultHeader)+')'}"></div>
                    <div>
                        <div>
                            <div>{{orderData.technicianId?orderData.techName:'技师待定'}}</div>
                            <div v-if="orderData.technicianId">[<span>{{orderData.techSerialNo}}</span>]</div>
                        </div>
                        <div>{{orderData.technicianId?(orderData.techDescription || '这个技师很赖，没有填写个人简介...'):'到店选择技师'}}</div>
                    </div>
                    <div :class="computeOrderStatus(orderData.status)">{{orderData.status | OrderStatusFilter('name')}}</div>
                </div>

                <div>
                    <div>预约项目<span>{{orderData.serviceItemName || '到店选择'}}</span></div>
                    <div>项目价格<span>{{orderData.servicePrie?(orderData.servicePrie | ItemPriceFormatter( orderData.serviceTime,orderData.serviceUnit)):'待定'}}</span></div>
                    <div>到店时间<span>{{orderData.appointTime | DateFormat}}</span><span>{{orderData.appointTime | DayFormat}}</span></div>
                </div>

                <div>
                    <div>联系人&nbsp;&nbsp;&nbsp;&nbsp;<span>{{orderData.customerName}}</span></div>
                    <div>联系电话<span>{{orderData.phoneNum}}</span></div>
                    <div>下单时间<span>{{orderData.createdAt | DateFormat}}</span></div>
                    <div class="btn" v-if="orderData.status == 'submit'" @click="submitOrder()"><div>确认预约</div></div>
                </div>
                <div v-if="orderData.status == 'complete' && orderData.commented == 'Y' && clubInfo.comment">
                    <div>
                        <div>我的评分<div class="star"><div :style="{width:clubInfo.comment.rate+'%'}"></div></div></div>
                        <div>我的评论<span>{{clubInfo.comment.comment}}</span></div>
                    </div>

                    <div>
                        <div>
                            <div>我的打赏</div>
                        </div>
                        <div>
                            <div v-if="Array.isArray(clubInfo.rewardAmounts) && clubInfo.rewardAmounts.length>0">
                                <div v-for="reward in clubInfo.rewardAmounts">{{reward}}元</div>
                            </div>
                            <div v-else>0元</div>
                            <div :class="{ 'not-wx': !global.userAgent.isWX}">
                                <router-link tag="div" :to="{ name:'confirmOrder',query:{clubId:global.clubId,itemId:orderData.serviceItemId,techId:orderData.technicianId}}">再来一单</router-link>
                                <router-link tag="div" :to="{ name:'techReward', query:{ techId: orderData.technicianId, backPublic:true, commentId:(clubInfo.comment?clubInfo.comment.id:'')} }">追加打赏</router-link>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else></div>

                <router-link tag="div" v-show="orderData.status == 'complete' && orderData.commented == 'N' && orderData.technicianId"
                    :to="{ name:'comment',query:{ orderId:orderData.id,type:'order',techId:orderData.technicianId } }">立即评论</router-link>

                <attention></attention>
            </div>

        </div>
        <tel-detail v-if="global.clubTelephone.length>0" :telephone="global.clubTelephone"></tel-detail>
    </div>
</template>
<script type="text/ecmascript-6">
    import { Global } from '../libs/global';
    import { eventHub } from '../libs/hub';
    import Util from '../libs/util';
    import Attention from '../components/attention';
    import OrderStatusFilter from '../filters/order-status-filter';
    import ItemPriceFormatter from '../filters/item-price-formatter';
    import TelDetail from '../components/tel-detail';

    export default {
        components:{
            attention:Attention,
            telDetail:TelDetail
        },
        filters:{
            OrderStatusFilter:OrderStatusFilter,
            ItemPriceFormatter:ItemPriceFormatter,
            DateFormat(dt, start){
                if(/^\d{2}:\d{2}$/g.test(dt)){
                    dt = '今天 '+dt;
                }
                if(/今天|明天|后天|大后天/.test(dt)){
                    start = start || new Date();
                    dt = dt.split(' ');
                    var addDay ={"今天":0,"明天":1,"后天":2,"大后天":3};
                    start.setDate(start.getDate() + addDay[dt[0]] || 0);
                    return new Date().getFullYear() + '-' +(start.getMonth()<9? '0'+(start.getMonth() + 1):(start.getMonth() + 1)) + '-' + (start.getDate() <= 9 ? "0"+start.getDate():start.getDate()) + ' ' + dt[1];
                }else if(/^\d{2}-\d{2}/.test(dt)){
                    return new Date().getFullYear() + '-' + dt;
                }else{
                    return dt;
                }
            },
            DayFormat(_v) {
                if(/^\d{2}:\d{2}$/g.test(_v)) return '今天';
                if(/^(今天|明天|后天|大后天)/g.test(_v)) return RegExp.$1;
                else return '';
            }
        },
        data(){
            return {
                global:Global.data,
                clubInfo:null,
                orderData:null,
                techDescription:'这个技师很赖，没有填写个人简介...'
            }
        },
        created(){
                var _this = this;
                if(!_this.global.currPage.query.orderId){
                    Util.tipShow('无订单ID');
                    _this.$router.back();
                }
                _this.global.loading = true;
                _this.$http.get('../api/v2/profile/user/order/view',{
                    params:{
                        id:_this.global.currPage.query.orderId
                    }
                }).then((res)=>{
                    res = res.body;
                    if(res.statusCode == '307'){    //重新请求一次
                        setTimeout(()=>{
                            _this.$http.get('../api/v2/profile/user/order/view',{
                                params:{
                                    id:_this.global.currPage.query.orderId
                                }
                            }).then((res)=>{
                                _this.global.loading = false;
                                res = res.body;
                                if(res.statusCode != '200' || !res.respData){
                                    Util.tipShow(_this.global.loadError);
                                    _this.$router.back();
                                }else{
                                    _this.clubInfo = res.respData;
                                    _this.orderData = res.respData.order;
                                }
                            });
                        },300);
                    }else if(res.statusCode != '200' || !res.respData){
                        _this.global.loading = false;
                        Util.tipShow(_this.global.loadError);
                        _this.$router.back();
                    }else{
                        _this.global.loading = false;
                        _this.clubInfo = res.respData;
                        _this.orderData = res.respData.order;
                    }
                });
        },
        methods:{
            computeOrderStatus(status){
                return OrderStatusFilter(status,'tag');
            },
            doClickBackPage(){
                this.$router.back();
            },
            doClickTelDetail(){
                var _this = this;
                if(_this.global.clubTelephone.length==0){
                    Util.tipShow("暂无会所电话！");
                }else{
                    eventHub.$emit("change-tel-detail",true);
                }
            },
            submitOrder(){      //确认预约
                var _this = this;
                if(_this.orderData.technicianId){
                    _this.$router.push({name:'chat',query:{techId:_this.orderData.technicianId,clubId:_this.orderData.clubId}});
                }else{
                    if(_this.global.clubTelephone.length==0){
                        Util.tipShow("暂无会所电话！");
                    }else{
                        eventHub.$emit("change-tel-detail",true);
                    }
                }
            }
        }
    }
</script>
