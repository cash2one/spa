<style>
    @import '../styles/page/info.css';
</style>
<template>
    <div class="page info-page" id="picture-page">
        <div class="page-title"><a class="back" @click="doClickPageBack()"></a>裁剪图片<div @click="doClickSaveBtn()">保存</div></div>
        <image-cut :all-w="global.winWidth" :all-h="global.winHeight" :v-w="global.winWidth*0.8" :v-h="global.winWidth*0.8"></image-cut>
    </div>
</template>
<script>
    import { Global } from '../libs/global';
    import Util from "../libs/util";
    import ImageCut from 'components/image-cut.vue';

    module.exports = {
        data: function(){
            return {
                global : Global.data,
                eventHub : Global.eventHub,
                saveUserPicUrl : "../api/v2/profile/user/avatar/eidt",
                type : "",
                inPostData : false
            }
        },
        components : {
            "image-cut" : ImageCut
        },
        created : function(){
            var _this = this, win = window;
            if(!win._fileReader){
                _this.$router.redirect({ name : "info", query : {} });
            }
            else{
                _this.type = _this.global.currPageQuery.type;
            }

            /////event on
            _this.eventHub.$on("put-base64",_this.doPutBase64);
        },
        methods: {
            doClickPageBack : function(){
                history.back();
            },
            doClickSaveBtn : function(){
                var _this = this;
                _this.inPostData = true;
                _this.eventHub.$emit("get-base64",{ width : 160, height : 160 });
            },
            doPutBase64 : function(imgData){
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
        beforeDestroy : function(){
            var _this = this;
            _this.eventHub.$off("put-base64",_this.doPutBase64);
        }
    }
</script>