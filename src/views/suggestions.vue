<style>
    @import '../styles/page/suggestions.css';
</style>
<template>
    <div>
        <div class="page" id="suggestions-page" v-show="!global.loading" :style="{ height : global.winHeight+'px' }">
            <div class="page-title"><a class="back" @click="doClickPageBack()"></a>投诉建议</div>
            <div class="star-comment">
                <div>
                    <div>环境</div>
                    <div class="stars" @click="doClickCommentStar($event,0)"><div :style="{ width: environmentScore+'%' }"></div></div>
                    <div>{{ scoreArr[environmentScore/20-1] }}</div>
                </div>
                <div>
                    <div>服务</div>
                    <div class="stars" @click="doClickCommentStar($event,1)"><div :style="{ width: serviceScore+'%' }"></div></div>
                    <div>{{ scoreArr[serviceScore/20-1] }}</div>
                </div>
            </div>
            <div class="input-comment">
                <div><div>会所评价</div></div>
                <div><textarea placeholder="给会所一个评价吧" maxlength="1000" v-model="commentText"></textarea></div>
            </div>
        </div>
        <div class="suggestion-btn"><div @click="doSubmitComment()">提交</div></div>
    </div>
</template>
<script>
    import { Global } from '../libs/global';
    import Util from "../libs/util";

    module.exports = {
        data: function(){
            return {
                global : Global.data,
                submitCommentUrl : "../api/v2/profile/user/feedback/create",
                environmentScore : 100,
                serviceScore : 100,
                commentText : "",
                scoreArr : ['非常差','不满意','一般','满意','非常好']
            }
        },
        created : function(){
            if(!this.global.clubId){
                this.$router.back();
            }
        },
        methods: {
            doClickPageBack : function(){
                history.back();
            },
            doClickCommentStar : function(event,type){
                var _this = this,
                        v = Math.ceil((event.offsetX || event.layerX)/(10.944*16*_this.global.winScale*0.2));
                if(type == 0){
                    _this.environmentScore = v*20;
                }
                else{
                    _this.serviceScore = v*20;
                }
            },
            doSubmitComment : function(){
                var _this = this;
                _this.$http.post(_this.submitCommentUrl,{
                    clubId : _this.global.clubId,
                    environmentalScore : _this.environmentScore,
                    serviceScore : _this.serviceScore,
                    comments : _this.commentText.substr(0,1000)
                }).then(function(res){
                    res = res.body;
                    if(res.statusCode == 200){
                        Util.tipShow("提交成功！");
                        _this.$router.push({ name : "personal" });
                    }
                    else{
                        Util.tipShow(res.msg || "提交失败！");
                    }
                });
            }
        }
    }
</script>