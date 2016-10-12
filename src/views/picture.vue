<style>
    @import '../styles/page/info.css';
</style>
<template>
    <div>
        <div class="loading" v-show="loading || inPostData"><i></i><i></i><i></i></div>
        <div class="page info-page" id="picture-page">
            <div class="page-title"><a class="back" @click="doClickPageBack()"></a>裁剪图片<div @click="doClickSaveBtn()">保存</div></div>
            <image-cut ref="imgCut" :all-w="global.winWidth" :all-h="global.winHeight" :v-w="global.winWidth*0.8" :v-h="global.winWidth*0.8" @putBase64="doPutBase64($event)"></image-cut>
        </div>
    </div>
</template>
<script>
    import { Global } from '../libs/global';
    import Util from "../libs/util";
    import ImageCut from 'components/image-cut.vue';

    module.exports = {
        data: function(){
            return {
                loading : false,
                global : Global.data,
                saveUserPicUrl : "../api/v2/profile/user/avatar/eidt",
                type : "",
                imgCut : null,
                inPostData : false
            }
        },
        components : {
            "image-cut" : ImageCut
        },
        events : {
            "put-base64" : function(imgData) {
                var _this = this;
                _this.$http.post(_this.saveUserPicUrl,{
                    avatar : encodeURIComponent(imgData)
                 }).then(function(){
                    Global.updateUserNameAndHeader();
                    Util.tipShow("保存成功！");
                    _this.inPostData = false;
                    _this.$router.push({ name : "info" });
                 });
            }
        },
        created : function(){
            var _this = this, win = window;
            if(!win._fileReader){
                _this.$router.redirect({ name : "info", query : {} });
            }
            else{
                _this.type = _this.global.currPageQuery.type;
            }
        },
        methods: {
            doClickPageBack : function(){
                history.back();
            },
            doClickSaveBtn : function(){
                var _this = this;
                _this.inPostData = true;
                _this.$refs.imgCut.$emit("get-base64",{ width : 160, height : 160 });
            },
            doPutBase64 : function(){

            }
        }
    }
</script>