<style>
    @import '../styles/components/attention.css';
</style>
<template>
    <div class="attention-wrap" v-if="global.pageMode=='club'">
        <div v-show="showGzText">长按二维码关注"9358"</div>
        <div><img v-if="clubQrCodeImg" :src="clubQrCodeImg"/></div>
        <div v-show="!showGzText">点技师、约项目，就上9358</div>
        <div>
            <div class="list"><span>1</span>保存二维码到相册</div>
            <div class="arrow"></div>
            <div class="list"><span>2</span>微信打开扫一扫</div>
            <div class="arrow"></div>
            <div class="list"><span>3</span>点击右上角从相册选取二维码</div>
            <div class="arrow"></div>
            <div class="list"><span>4</span>点击关注</div>
        </div>
        <div v-show="!showGzText">或微信查找公众号"9358"</div>
    </div>
</template>

<script>
    import { Global } from '../libs/global';

    module.exports = {
        data: function(){
            return {
                global : Global.data,
                getClubQrCodeImgUrl : "../api/v1/wx/club/param_qrcode",
                showGzText : false,
                clubQrCodeImg : "", ////关注公众号二维码图片
                getCodeImgMaxCount : 2
            };
        },
        created : function(){
            var _this = this, global = _this.global;
            _this.getClubQrCodeImg();//获取二维码图片
            if(global.pageMode =="club" && global.userAgent.isWX){
                _this.showGzText = true;
            }
        },
        methods: {
            getClubQrCodeImg : function(){
                var _this = this, global = _this.global;
                if(global.pageMode == "club"){
                    _this.getCodeImgMaxCount--;
                    _this.$http.get(_this.getClubQrCodeImgUrl, { params : { clubId : global.clubId }}).then(function(res){
                        res = res.body;
                        if(res.statusCode == 200){
                            if(res.respData == "N"){
                                if(_this.getCodeImgMaxCount != 0) _this.getClubQrCodeImg();
                            }
                            else{
                                _this.clubQrCodeImg = res.respData;
                            }
                        }
                    });
                }
            }
        }
    }
</script>