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
            <div v-show="!showWinningNo"><ul><li><span>本次开奖将以<span class="lottery-date">{{ lotteryDate || '无' }}</span>福彩3D结果为参照，敬请期待！</span></li></ul></div>
            <div v-show="showWinningNo">
                <div>幸运号码<span>{{ actDetail.winningNo }}</span></div>
                <div>福彩3D<span>{{ actDetail.lotteryNo }}</span></div>
            </div>
        </div>
        <div class="item act-mynums" :class="{ 'no-nums' : !hasNum }">
            <div></div>
            <div>我的号码<a @click="doClickViewBtn()">查看</a></div>
            <div>
                <ul>
                    <li v-for="item in actNos">
                        <div><div><span>手机<span>{{ item.phoneNum }}</span></span><span>{{ item.createdAt | DateFormatter('MM月dd日 hh:mm:ss') }}</span></div><div v-html="item.actNo | PlumNumber(winningNo)"></div></div>
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
            <div :class="isComplete ? 'next-time' : 'robed'" @click="doClickRobedBtn()">{{ isComplete ? '下次通知我' : '一元抢' }}</div>
            <div class="shared" @click="doClickShareBtn()">{{ isComplete ? '给朋友看看' : '叫上朋友一起' }}</div>
        </div>
        <div class="join-info pop-modal" :class="{ active : popJoin }">
            <div>
                <div class="close-btn" @click="doCloseJoinPop()">&times;</div>
                <div class="join join-first" v-show="showJoinName=='first'">
                    <div>参与信息<span>(1元参与一次)</span></div>
                    <div>
                        <div class="input-item">
                            <div>手机号码</div>
                            <div><input type="tel" placeholder="请输入您的手机号" v-model="telOfInputFirst" maxlength="11" v-tel-input/></div>
                        </div>
                        <div class="input-item">
                            <div>参与数量</div>
                            <div>
                                <div>
                                    <span class="reduce-count" @touchstart="doTouchStartReduce($event)" @touchmove="doTouchMoveReduce($event)" @touchend="doTouchEndReduce($event)"><span>-</span></span>
                                    <span class="times-count">{{ timesCount }}</span>
                                    <span class="plus-count" @touchstart="doTouchStartPlus($event)" @touchmove="doTouchMovePlus($event)" @touchend="doTouchEndPlus($event)">+</span>
                                </div>
                            </div>
                            <div :class="{ checked : checkedAll }" @click="doClickCheckAll()">全额</div>
                        </div>
                        <div>
                            <span>剩余可参与次数</span>
                            <span><span class="timesSurplus"></span>次</span>
                        </div>
                    </div>
                    <div class="sure-btn" :class="{ disabled : !telOfInputFirstValid }"><div @click="doClickJoinFirstBtn()">确定</div></div>
                </div>
                <div class="join join-success" v-show="showJoinName=='success'">
                    <div>成功参与</div>
                    <div>
                        <div><div>您参与了</div><div class="join-times"><span>{{ joinTimes }}</span>次</div></div>
                        <div><div>您的手机</div><div class="join-tel">{{ joinTel }}</div></div>
                        <div>
                            <div>您的号码</div>
                            <div class="join-nums"><span v-for="num in joinNums">{{ num }}</span></div>
                        </div>
                    </div>
                    <div class="sure-btn">
                        <div :class="{ 'num-over' : isNumOver }"><div @click="doClickContinueRob()">继续抢</div><div class="shared">我要炫耀</div></div>
                    </div>
                </div>
                <div class="join join-notice" v-show="showJoinName=='notice'">
                    <div>联系人信息</div>
                    <div v-show="showJoinNoticeTelInput">
                        <div class="input-item">
                            <div>手机号码</div>
                            <div><input type="tel" placeholder="请输入您的手机号" v-model="telOfInputNotice" maxlength="11" v-tel-input/></div>
                        </div>
                    </div>
                    <div v-show="showJoinNoticeTelList">
                        <div></div>
                        <div>活动开启信息将会发送到下列手机号码</div>
                        <div>{{ noticeTel }}</div>
                    </div>
                    <div class="sure-btn" :class="{ disabled : !telOfInputNoticeValid }"><div @click="doClickJoinNoticeBtn()">确定</div></div>
                </div>
                <div class="join join-search" v-show="showJoinName=='search'">
                    <div>输入手机号查看已购买</div>
                    <div><div><input type="tel" placeholder="请输入您的手机号" v-model="telOfInputSearch"/></div></div>
                    <div class="sure-btn" :class="{ disabled : !telOfInputSearchValid }" @click="doClickJoinSearchBtn()"><div>确定</div></div>
                </div>
            </div>
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
    import PlumNumber from "../filters/plum-number";
    import TelInput from "../directives/tel-input";

    module.exports = {
        filters : {
            DateFormatter : DateFormatter,
            PlumNumber : PlumNumber
        },
        directives: {
            "tel-input" : TelInput
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
                actNos : [],
                winningNo : "",
                telOfInputFirst : "",
                telOfInputNotice : "",
                telOfInputSearch : "",
                popJoin : false,
                showJoinName : 'first',
                showJoinNoticeTelInput : false,
                showJoinNoticeTelList : false,
                telInputReg : /^1[34578]\d{9}$/,
                timesCount : 1,
                lotteryDate : "",
                tradeReqData : null,
                payResData : null,
                joinTimes : "",
                joinTel : "",
                isNumOver : true,
                checkedAll : false,
                noticeTel : "",
                reduceTimer : null,
                plusTimer : null,
                joinNums : []
            };
        },
        computed : {
            telOfInputFirstValid : function(){
                return this.telInputReg.test(this.telOfInputFirst);
            },
            telOfInputNoticeValid : function(){
                return this.telInputReg.test(this.telOfInputNotice);
            },
            telOfInputSearchValid : function(){
                return this.telInputReg.test(this.telOfInputSearch);
            }
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
            this.$nextTick(function(){
                Global.setDocumentTitle("一元夺美女");
            });
        },
        methods: {
            init : function(){
                var _this = this, global = _this.global, query = global.currPage.query, detail, joinNums = [];
                _this.actId = query.id;
                _this.shareCode = query.shareCode || "";
                _this.tel = Util.localStorage("_indianas_tel_phone") || global.userTel || "";
                for(var i=1;i<=200;i++){
                    if(i<10){
                        joinNums.push("00"+i);
                    }
                    else if(i<100){
                        joinNums.push("0"+i);
                    }
                    else{
                        joinNums.push(i);
                    }
                }
                _this.joinNums = joinNums;

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
                        _this.winningNo = detail.winningNo;
                        _this.lotteryDate = detail.lotteryDate;

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
                            _this.isNeedQuery = true;
                            _this.telOfInputFirst = _this.tel;
                            _this.telOfInputNotice = _this.tel;
                        }
                    }
                    else{
                        Util.tipShow(res.msg || "数据请求失败！");
                    }
                });
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
            },

            doCloseJoinPop : function(){
                this.popJoin = false;
            },

            doClickViewBtn : function(){
                this.showJoinName = "search";
                this.popJoin = true;
            },

            doClickJoinSearchBtn : function(){
                var _this = this;
                Util.localStorage("_indianas_tel_phone",_this.telOfInputSearch);
                //$.page('plumflowers&isSearch=true&_time='+new Date().getTime()+'&id='+actId,0,true,false);
            },

            doClickRobedBtn : function(){
                var _this = this;
                _this.popJoin = true;
                if(_this.isComplete){ //next-time
                    _this.showJoinName = "notice";
                    _this.showJoinNoticeTelInput = true;
                    _this.showJoinNoticeTelList = false;
                }
                else{
                    _this.showJoinName = "first";
                }
            },

            onBridgeReady : function(){
                var _this = this, tradeReqData = _this.tradeReqData, payResData = _this.payResData;

                WeixinJSBridge.invoke('getBrandWCPayRequest', {
                    "appId" : tradeReqData.appId,
                    "timeStamp" : tradeReqData.timeStamp+"",
                    "nonceStr" : tradeReqData.nonceStr,
                    "package" : tradeReqData.package,
                    "signType" : tradeReqData.signType,
                    "paySign" : tradeReqData.paySign
                },function (res) {
                    _this.isPay = false;
                    if(res.err_msg && res.err_msg.indexOf("ok")>=0){//支付成功之后
                        Util.tipShow("支付成功！");
                        Util.localStorage('_indianas_tel_phone',_this.telOfInputFirst);
                        if(_this.tel && _this.tel != _this.telOfInputFirst){
                            _this.actNos = [];
                        }
                        _this.showJoinName='success';

                        var userPlumFlower = payResData.userPlumFlowe.userPlumFlowe,
                                plumFlower = payResData.userPlumFlowe.plumFlowe,
                                paidAmount = userPlumFlower.amount + plumFlower.successPaidAmount,
                                date = new Date();
                        _this.timesSurplus = plumFlower.price - paidAmount;
                        _this.processRatio = (paidAmount/plumFlower.price*100).toFixed(3);

                        if(_this.timesSurplus == 0){
                            _this.showActResult = true;
                            if(date.getHours()>=20){
                                date.setDate(date.getDate()+1);
                            }
                            _this.lotteryDate = Util.dateFormat(date,"yyyy-MM-dd");
                            _this.isComplete = true;
                        }

                        _this.joinTimes = userPlumFlower.amount;
                        _this.joinTel = userPlumFlower.phoneNum;
                        _this.isNumOver = (userPlumFlower+plumFlower.successPaidAmount >= plumFlower.price);
                        _this.joinNums = userPlumFlower.actNo.split(",");
                        _this.hasNum = true;
                        _this.actNos = [{ phoneNum : userPlumFlower.phoneNum, createdAt : userPlumFlower.createdAt, actNo : userPlumFlower.actNo }];
                    }
                    else{
                        Util.tipShow("未能成功支付！");
                        _this.$http.post("../api/v2/plumflower/userplumflower/delete",{ id : payResData.userPlumFlowe.userPlumFlowe.id })
                    }
                    _this.timesCount = 1;
                    _this.checkedAll = false;
                });
            },

            doClickJoinFirstBtn : function(){
                var _this = this, global = _this.global, query = global.currPage.query;
                if(!_this.telOfInputFirstValid) return;
                if(_this.timesCount == 0){
                    Util.localStorage('_indianas_tel_phone',_this.telOfInputFirst);
                    ////$.page('plumflowers&isSearch=true&_time='+new Date().getTime()+'&id='+actId,0,true,false);
                    return;
                }
                else if(!global.userAgent.isWX){
                    if(Global.checkAccess("plumflowers")){
                        Util.tipShow("请在微信中打开！")
                    }
                    return;
                }

                //是否需要查询之前是否已有购买数据
                if(_this.isNeedQuery){
                    _this.$http.post("../api/v2/plumflower/view",{
                        id : _this.actId,
                        phoneNum : _this.tel,
                        shareCode : query.shareCode || '',
                        topShareCode : query.topShareCode || '',
                        chanel : query.chanel || 'link'
                    }).then(function(res){
                        res = res.body;
                        _this.actNos = (res.actNos && res.actNos.length ? res.actNos : []);
                        if(_this.actNos.length>0){
                            _this.hasNum = true;
                            _this.winningNo = res.plumFloweActivity.winningNo;
                        }
                    });
                }

                //////////
                if(!_this.isPay){
                    _this.isPay = true;
                    _this.$http.post("../api/v2/wx/pay/paid_plumflower",{
                        plumFloweId : actId,
                        amount : _this.timesCount,
                        phoneNum : _this.telOfInputFirst,
                        shareCode : query.shareCode,
                        topShareCode : query.topShareCode,
                        chanel : query.chanel || 'link',
                        openId : _this.openId,
                        clubId : _this.clubId,
                        tradeChannel : 'wx',
                        businessChannel : query.chanel || 'link'
                    }).then(function(payRes){
                        payRes = payRes.body;
                        if(payRes.statusCode == 200){
                            _this.payResData = payRes = payRes.respData;
                            var userPlumFlower = payRes.userPlumFlowe.userPlumFlowe,
                                    plumFlower = payRes.userPlumFlowe.plumFlowe,
                                    paidAmount;
                            if(userPlumFlower.amount<parseInt(_this.timesCount)){
                                paidAmount = userPlumFlower.amount+plumFlower.successPaidAmount;
                                _this.timesSurplus = plumFlower.price-plumFlower.successPaidAmount;
                                _this.processRatio = (paidAmount/plumFlower.price*100).toFixed(3);

                                if(_this.timesSurplus == 0){
                                    _this.timesCount = 1;
                                    _this.popJoin = false;
                                    _this.showActResult = true;
                                    _this.lotteryDate = plumFlower.lotteryDate;
                                    _this.isComplete = true;
                                    if(plumFlower.price-plumFlower.successPaidAmount == 0 || userPlumFlower.amount == 0){
                                        _this.isPay = false;
                                        return Util.tipShow("剩余次数为0，抱歉，您此次未抢到！")
                                    }
                                }
                                else{
                                    _this.timesCount = _this.timesSurplus;
                                    Util.tipShow('剩余次数小于您所选购的次数，请注意！');
                                }
                            }

                            _this.tradeReqData = JSON.parse(payRes.tradeReqData);
                            if (typeof WeixinJSBridge == "undefined"){
                                document.addEventListener('WeixinJSBridgeReady', function(){ _this.onBridgeReady() }, false);
                            }
                            else{
                                _this.onBridgeReady();
                            }
                        }
                        else if(payRes.statusCode == 500){
                            Util.tipShow('此次未抢购成功。');
                            //////$.page('plumflowers&isSearch=true&_time='+new Date().getTime()+'&id='+actId,0,true,false);
                        }
                    })
                }
                else{
                    Util.tipShow("正在支付，请稍候...",3000);
                }
            },

            //点击全额
            doClickCheckAll : function(){
                var _this = this;
                if(!_this.checkedAll){
                    _this.timesCount = _this.timesSurplus;
                }
                _this.checkedAll = !_this.checkedAll;
            },

            //点击继续抢
            doClickContinueRob : function(){
                this.showJoinName='first';
                this.timesCount = 1;
            },

            //点击下次通知确定按钮
            doClickJoinNoticeBtn : function(){
                var _this = this, global = _this.global;
                if(!_this.telOfInputNoticeValid) return;

                if(!_this.showJoinNoticeTelInput){
                    _this.popJoin = false;
                }
                else{
                    _this.$http.post("../api/v2/plumflower/nextnoticeuser/save",{
                        phoneNum : _this.telOfInputNotice,
                        clubId : _this.clubId,
                        actId : _this.actId
                    }).then(function(res){
                        res = res.body;
                        if(res.statusCode == 200){
                            Util.tipShow("预约成功！");
                            _this.showJoinNoticeTelInput = false;
                            _this.showJoinNoticeTelList = true;
                            _this.noticeTel = _this.telOfInputNotice;
                        }
                        else{
                            Util.tipShow(res.msg || "预约失败！");
                        }
                    });
                }
            },

            //点击分享按钮
            doClickShareBtn : function(){
                eventHub.$emit("change-share-pop",true);
            },

            doReduceCount : function(){
                var _this = this;
                clearTimeout(_this.reduceTimer);
                _this.reduceTimer = 0;
                if(parseInt(_this.timesCount)> 1){
                    clearTimeout(_this.plusTimer);
                    _this.plusTimer = 0;
                    _this.timesCount = _this.timesCount-1;
                    _this.reduceTimer = setTimeout(_this.doReduceCount,100);
                }
            },

            doPlusCount : function(){
                var _this = this;
                clearTimeout(_this.plusTimer);
                _this.plusTimer = 0;
                if(parseInt(_this.timesCount) < _this.timesSurplus){
                    clearTimeout(_this.reduceTimer);
                    _this.reduceTimer = 0;
                    _this.timesCount = parseInt(_this.timesCount)+1;
                    _this.plusTimer = setTimeout(_this.doPlusCount,100);
                }
            },

            doTouchStartReduce : function(e){
                e.preventDefault();
                this.checkedAll = false;
                this.doReduceCount();
            },

            doTouchMoveReduce : function(){
                var _this = this;
                clearTimeout(_this.reduceTimer);
                clearTimeout(_this.plusTimer);
                _this.reduceTimer = 0;
                _this.plusTimer = 0;
            },

            doTouchEndReduce : function(e){
                e.preventDefault();
                this.doTouchMoveReduce();
            },

            doTouchStartPlus : function(e){
                e.preventDefault();
                this.doPlusCount();
            },

            doTouchMovePlus : function(){
                var _this = this;
                clearTimeout(_this.reduceTimer);
                clearTimeout(_this.plusTimer);
                _this.reduceTimer = 0;
                _this.plusTimer = 0;
            },

            doTouchEndPlus : function(e){
                e.preventDefault();
                this.doTouchMovePlus();
            }
        }
    }
</script>