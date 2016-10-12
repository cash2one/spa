<style>
    @import '../styles/page/info.css';
</style>
<template>
    <div>
        <div class="loading" v-show="loading"><i></i><i></i><i></i></div>
        <div class="page info-page" id="info-page" v-show="!loading">
            <div class="page-title"><a class="back" @click="doClickPageBack()"></a>资料编辑<div @click="doClickSaveBtn()">保存</div></div>
            <div class="info-content">
                <div>
                    <input type="file" accept="image/*" capture="camcorder" @change="doImgChange($event)"/>
                    <div>头像</div>
                    <div class="header" :style="{ backgroundImage : 'url('+(global.userHeader)+')' }"></div>
                    <div class="tip">更换头像</div>
                </div>
                <div>
                    <div>昵称</div>
                    <div><input type="text" maxlength="20" v-model="nickName" /></div>
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
                loading : false,
                global : Global.data,
                saveUserInfoUrl : "../api/v2/profile/user/info/eidt",
                nickName : ""
            }
        },
        created : function(){
            var _this = this;
            if(!_this.global.isLogin){
                Util.tipShow("请您先登录！");
                return _this.$router.push({ name : "login" });
            }
            else{
                _this.nickName = _this.global.userName;
            }
        },
        methods: {
            doClickPageBack : function(){
                history.back();
            },
            doClickSaveBtn : function(){
                var _this = this;
                if(_this.nickName.length == 0){
                    return Util.tipShow("昵称不能为空！")
                }
                _this.$http.post(_this.saveUserInfoUrl,{
                    name : _this.nickName
                }).then(function(res){
                    res = res.body;
                    if(res.statusCode == 200){
                        _this.global.userName = _this.nickName;
                        Util.localStorage("userName",_this.nickName);
                        Util.tipShow("保存成功！");
                        _this.$router.push({ name : "personal" });
                    }
                    else{
                        Util.tipShow(res.msg || "保存失败！");
                    }
                });
            },
            doImgChange : function(event){
                var _this = this, file = event.target.files[0], win = window;
                if (!file) return;
                if (!/image\/\w+/.test(file.type) && !/(jpg|jpeg|gif|bmp|png)$/.test(file.type.toLowerCase())) {
                    return Util.tipShow("只能上传图片格式哦！");
                }
                if (file.size > 1024 * 1024 * 10){
                    return Util.tipShow('图片不能超过10M！');
                }
                win._fileReader = new FileReader();
                win._fileReader.onload = function (){
                    if(_this.nickName.length != 0){
                        _this.$http.post(_this.saveUserInfoUrl,{ name : _this.nickName });
                    }
                    _this.$router.push({ name : "picture", query : { type : 'avatar' } });
                };
                win._fileReader.readAsDataURL(file);
            }
        }
    }
</script>