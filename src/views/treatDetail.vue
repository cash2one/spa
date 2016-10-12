<style>
    @import '../styles/page/treatDetail.css';
</style>
<template>
    <div>
        <div class="page" id="treat-detail-page" v-show="!global.loading">
            <div class="page-title"><a class="back" @click="doClickPageBack()"></a>我要请客</div>
            <div class="info-area">
                <div class="info-top">
                    <div>
                        <div class="treat-code">授权码：</div>
                        <div>{{ authorizeCode }}</div>
                        <div></div>
                    </div>
                    <div>
                        <div class="treat-money">授权金额：</div>
                        <div>
                            <span>{{ treatMoney }}</span>
                            <span class="vis-friend">朋友{{ isOpen ? "" : "不" }}可见</span>
                        </div>
                    </div>
                    <div>
                        <div class="treat-tel">授权手机：</div>
                        <div>
                            <span>{{ telStr }}</span>
                            <a :href="'tel:'+telephone" class="call-phone">拨打</a>
                        </div>
                    </div>
                </div>
                <div class="info-status">
                    <div>
                        <div>目前状态：</div>
                        <div>{{ resultStatus=='NOT_USERD' ? '未使用' : ( resultStatus=='CANCLED' ? '已取消' : '已使用' ) }}</div>
                    </div>
                    <div>
                        <div>授权时间：</div>
                        <div>{{ createDate }}</div>
                    </div>
                </div>
                <div class="use-item" v-show="resultStatus=='USED'">
                    <div>
                        <div>使用金额：</div>
                        <div>{{ usedAmount }}</div>
                    </div>
                    <div>
                        <div>使用时间：</div>
                        <div>{{ usedDate }}</div>
                    </div>
                </div>
                <div class="cancel-item" v-show="resultStatus=='CANCLED'">
                    <div>
                        <div>取消时间：</div>
                        <div>{{ cancelDate }}</div>
                    </div>
                </div>
            </div>
            <div class="cancel-auth" v-show="resultStatus=='NOT_USERD'" @click="doClickCancelAuthBtn()">取消授权</div>
        </div>
        <div class="cancel-treat-confirm pop-modal" :class="{ active : isShowConfirm }">
            <div class="center-wrap">
                <div>
                    <p class="h2">取消授权</p>
                    <p>取消授权后，授权码将作废，同时会通知到您的朋友。</p>
                </div>
                <div :class="{ processing : isProcessing }">
                    <a class="cancel-btn" @click="doClickAbortCancel()">放弃取消</a>
                    <a class="sure-btn" @click="doClickConfirmCancel()">确认取消</a>
                    <div>取消授权中...</div>
                </div>
            </div>
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
                queryDataUrl : "../api/v2/finacial/account/payforother/detail",
                cancelAuthUrl : "../api/v2/finacial/account/payforother/cancel",
                detailId : "",
                authorizeCode : "-",
                treatMoney : "-",
                isOpen : false,
                telephone : "",
                telStr : "-",
                createDate : "-",
                resultStatus : "",
                cancelDate : "-",
                usedDate : "-",
                usedAmount : "-",
                isShowConfirm : false,
                isProcessing : false
            }
        },
        created : function(){
            var   _this = this, global = _this.global, pageParams = global.currPageQuery;
            _this.detailId = pageParams.detailId;
            if(!_this.detailId){
                Util.tipShow(global.visitError);
                return _this.$router.back();
            }
            else{
                _this.$http.get(_this.queryDataUrl, { params : { detailId : _this.detailId }}).then(function(res){
                    res = res.body;
                    if(res.statusCode == 200){
                        res = res.respData;
                        _this.authorizeCode = Util.spaceFormat(res.authorizeCode);
                        _this.treatMoney = (res.amount / 100).toFixed(2);
                        _this.isOpen = res.open == 'Y';
                        _this.telephone = res.telephone;
                        _this.telStr = Util.spaceFormat(res.telephone, true);
                        _this.createDate = res.createDate;
                        _this.resultStatus = res.status;
                        _this.cancelDate = res.cancelDate;
                        _this.usedDate = res.usedDate;
                        _this.usedAmount = (res.usedAmount / 100).toFixed(2);
                    }
                    else{
                        Util.tipShow(res.msg || global.loadError);
                        return _this.$router.back();
                    }
                });
            }
        },
        methods: {
            doClickPageBack : function(){
                history.back();
            },
            doClickCancelAuthBtn : function(){
                this.isShowConfirm = true;
            },
            doClickAbortCancel : function(){
                this.isShowConfirm = false;
            },
            doClickConfirmCancel : function(){
                var _this = this, global = _this.global;
                _this.isProcessing = true;
                _this.$http.post(_this.cancelAuthUrl,{ detailId : _this.detailId }).then(function(res){
                    _this.isProcessing = false;
                    res = res.body;
                    if(res.statusCode == 200){
                        _this.isShowConfirm = false;
                        _this.resultStatus = "CANCLED";
                        _this.cancelDate = Util.dateFormat(new Date());
                        var pageData = global.pageData["treatRecords"];
                        if(pageData){
                            pageData.changeStatusRecord = { id : _this.detailId , status : 'CANCLED' };
                        }
                    }
                    else{
                        Util.tipShow(res.msg || "请求出错！");
                    }
                },function(){
                    _this.isProcessing = false;
                    Util.tipShow("操作出错了！");
                });
            }
        }
    }
</script>