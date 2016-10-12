<style>
    @import '../styles/page/qrPayComplete.css';
</style>
<template>
    <div>
        <div class="loading" v-show="loading"><i></i><i></i><i></i></div>
        <div class="page" id="qrpay-complete-page" v-show="!loading" :style="{ height : global.winHeight+'px' }">
            <div class="page-title"><a class="back" @click="doClickPageBack()"></a>支付完成</div>
            <div class="success-info">
                <div>
                    <span><i></i><spa>成功支付</spa></span><span><span>{{ money }}</span><span>元</span></span>
                </div>
            </div>
            <div class="comment-star">
                <div>
                    <div>环境</div>
                    <div>
                        <div class="stars-area" @click="doClickCommentStar(0,$event)"><div :style="{ width : environmentScore+'%' }"></div></div>
                    </div>
                    <div>非常好</div>
                </div>
                <div>
                    <div>服务</div>
                    <div>
                        <div class="stars-area" @click="doClickCommentStar(1,$event)"><div :style="{ width : serviceScore+'%' }"></div></div>
                    </div>
                    <div>非常好</div>
                </div>
            </div>
            <div class="comment-title">会所评价</div>
            <textarea class="comment-text" placeholder="您的建设很重要，来点评下吧！" v-model="commentStr"></textarea>
            <div class="submit-btn" @click="doClickSubmitBtn()">提交</div>
        </div>
    </div>
</template>
<script>
    import { Global } from '../libs/global';
    import Util from "../libs/util";

    module.exports = {
        data: function(){
            return {
                loading : false,
                global : Global.data,
                submitUrl : "../api/v2/profile/user/feedback/create",
                scoreObj : ['非常差','很差','一般','很好','非常好'],
                clubId : "",
                money : "",
                environmentScore : 100,
                serviceScore : 100,
                commentStr : "",
                payToken : ""
            }
        },
        created : function(){
            var   _this = this, global = _this.global, pageParams = global.currPageQuery;
            _this.money = pageParams.money;
            _this.clubId = pageParams.clubId;
            _this.payToken = pageParams.payToken;
            if(!_this.clubId && global.pageMode == "club"){
                _this.clubId = global.clubId;
            }
            if(!_this.money || !_this.clubId){
                Util.tipShow(global.visitPageErrorTip);
                _this.$router.back();
            }
        },
        methods: {
            doClickPageBack : function(){
                history.back();
            },
            doClickCommentStar : function(type,event){
                var _this = this,
                        v = Math.ceil((event.offsetX || event.layerX)/(8.611*16*_this.global.winScale*0.2));
                if(type == 0){
                    _this.environmentScore = v*20;
                }
                else{
                    _this.serviceScore = v*20;
                }
            },
            doClickSubmitBtn : function(){
                var _this = this;
                _this.$http.post(_this.submitUrl,{
                    "clubId" : _this.clubId,
                    "environmentalScore" : _this.environmentScore,
                    "serviceScore" : _this.serviceScore,
                    "comments" : encodeURIComponent(_this.commentStr.substr(0,1000)),
                    token : _this.payToken///////
                }).then(function(res){
                    res = res.body;
                    if(res.statusCode == 200){
                        Util.tipShow("提交成功！");
                        _this.$router.push({ name : "home" });
                    }
                    else{
                        Util.tipShow(res.msg || "提交失败！");
                    }
                });
            }
        }
    }
</script>