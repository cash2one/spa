<style>
    @import '../styles/page/info.css';
</style>
<template>
    <div class="page info-page" id="info-page">
        <page-title title-text="资料编辑"><div @click="doClickSaveBtn()">保存</div></page-title>
        <div class="info-content">
            <div>
                <input type="file" accept="image/*" capture="camcorder" @change="doImgChange($event)"/>
                <div>头像</div>
                <div class="header" :style="{ backgroundImage : 'url('+(global.userHeader)+')' }"></div>
                <div class="tip">更换头像</div>
            </div>
            <div>
                <div>昵称</div>
                <div><input type="text" maxlength="20" v-model="nickName"/></div>
            </div>
        </div>
    </div>
</template>
<script>
    import { Global } from '../libs/global'
    import Util from '../libs/util'

    module.exports = {
        data: function () {
            return {
                global: Global.data,
                nickName: ''
            }
        },
        created: function () {
            var that = this
            var global = that.global
            if (!global.isLogin) {
                Util.tipShow('请您先登录！')
                return that.$router.push({name: 'login'})
            } else {
                that.nickName = global.userName
                global.loading = false
            }
        },
        methods: {
            doClickSaveBtn: function () {
                var that = this
                if (that.nickName.length == 0) {
                    return Util.tipShow('昵称不能为空！')
                }
                that.$http.post('../api/v2/profile/user/info/eidt', {name: that.nickName}).then(function (res) {
                    res = res.body
                    if (res.statusCode == 200) {
                        that.global.userName = that.nickName
                        Util.localStorage('userName', that.nickName)
                        Util.tipShow('保存成功！')
                        that.$router.push({name: 'personal'})
                    } else {
                        Util.tipShow(res.msg || '保存失败！')
                    }
                })
            },
            doImgChange: function (event) {
                var that = this
                var file = event.target.files[0]
                var win = window
                if (!file) return
                if (!/image\/\w+/.test(file.type) && !/(jpg|jpeg|gif|bmp|png)$/.test(file.type.toLowerCase())) {
                    return Util.tipShow('只能上传图片格式哦！')
                }
                if (file.size > 1024 * 1024 * 10) {
                    return Util.tipShow('图片不能超过10M！')
                }
                win._fileReader = new FileReader()
                win._fileReader.onload = function () {
                    if (that.nickName.length != 0) {
                        that.$http.post(that.saveUserInfoUrl, {name: that.nickName})
                    }
                    that.$router.push({name: 'picture', query: {type: 'avatar'}})
                }
                win._fileReader.readAsDataURL(file)
            }
        }
    }
</script>