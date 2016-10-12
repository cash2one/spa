<style>
    @import '../styles/page/treat.css';
</style>
<template>
    <div class="page" id="treat-page" v-show="!global.loading" :style="{ height : global.winHeight+'px' }">
            <div class="page-title"><a class="back" @click="doClickPageBack()"></a>我要请客</div>
            <div class="treat-area">
                <div>
                    <div>授权金额<span>(可用金额：{{accountMoney}})</span></div>
                    <div><input type="number" v-model="money" pattern="[0-9]*" @input="doInputOfMoney()"/>元</div>
                    <div>注：朋友最多可用金额，授权完成后，将冻结授权金额。朋友使用后或者取消授权后将取消解冻。</div>
                </div>
                <div>
                    <div>朋友手机号码</div>
                    <div><input type="tel" v-model="tel" maxlength="11" v-tel-input="isTelValid"></div>
                    <div>注：我们将发送授权码给您的朋友。</div>
                </div>
            </div>
            <div class="check" :class="{ active : canVisible }" @click="canVisible = !canVisible">朋友可以看见授权金额。</div>
            <div class="btn" :class="{ active : isTelValid && isMoneyValid, processing : isProcessing }" @click="doClickConfirmBtn()">{{confirmBtnText}}</div>
            <div class="footer-area"><router-link :to="{ name : 'treatExplain' }">请客说明</router-link><router-link :to="{ name : 'treatRecords' , query : { clubId : clubId } }">请客记录</router-link></div>
        </div>
</template>
<script>
    import { Global } from '../libs/global';
    import Util from "../libs/util";
    import TelInput from "../directives/tel-input";

    module.exports = {
        directives: {
            "tel-input" : TelInput
        },
        data: function(){
            return {
                global : Global.data,
                queryDataUrl : "../api/v2/finacial/account/",
                payAuthUrl : "../api/v2/finacial/account/payforother/auth",
                accountId : "",
                accountMoney : "-",
                canVisible : true,
                tel : "",
                money : '',
                isTelValid : false,
                isMoneyValid : false,
                isProcessing : false,
                confirmBtnText : "确认授权",
                clubId : '',
                oldMoney : ''
            }
        },
        created : function(){
            var   _this = this, global = _this.global, pageParams = global.currPageQuery;
            _this.accountId = pageParams.accountId;
            if(!_this.accountId){
                return _this.$router.back();
            }
            else{
                _this.queryDataUrl += _this.accountId;
                global.loading = true;
                _this.$http.get(_this.queryDataUrl).then(function(res){
                    global.loading = false;
                    res = res.body;
                    if(res.statusCode == 200){
                        res = res.respData;
                        _this.clubId = res.clubId;
                        _this.accountMoney = (res.amount/100).toFixed(2);
                    }
                    else{
                        Util.tipShow(global.loadError);
                        _this.$router.back();
                    }
                });
            }
        },
        methods: {
            doClickPageBack : function(){
                history.back();
            },
            doClickConfirmBtn : function(){
                var _this = this;
                if(_this.isTelValid && _this.isMoneyValid){
                    if(_this.isProcessing){
                        Util.tipShow("正在授权，请稍候...");
                    }
                    else{
                        _this.isProcessing = true;
                        _this.confirmBtnText = "授权中...";
                        _this.$http.post(_this.payAuthUrl,{
                            accountId : _this.accountId,
                            amount : _this.money,
                            open : _this.canVisible ? "Y" : "N",
                            telephone : _this.tel
                        }).then(function(res){
                            res = res.body;
                            _this.isProcessing = false;
                            _this.confirmBtnText = "确认授权";
                            if(res.statusCode != 200){
                                Util.tipShow(res.msg || '授权失败。');
                            }
                            else{
                                _this.$router.push({
                                    name : "treatDetail",
                                    query : { backAccount : true, detailId : res.respData }
                                });
                            }
                        });
                    }
                }
            },
            doInputOfMoney : function(){
                var _this = this;
                if(_this.money == ''){
                    if(_this.oldMoney.length>1){
                        _this.money = _this.oldMoney;
                        _this.isMoneyValid = true;
                    }
                    else{
                        _this.oldMoney = '';
                        _this.isMoneyValid = false;
                    }
                }
                else{
                    _this.isMoneyValid = true;
                    var tmp = _this.money.match(/\./g);
                    if(tmp && tmp.length>1){
                        _this.money = _this.money.slice(0,-1);
                    }
                    if(!/^([1-9][0-9]*)$/g.test(_this.money)){
                        _this.money = _this.oldMoney;
                    }
                    else{
                        _this.oldMoney = _this.money;
                    }
                }
            }
        }
    }
</script>