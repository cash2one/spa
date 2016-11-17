<style>
    @import '../styles/page/info.css';
</style>
<template>
    <div class="page info-page" id="picture-page">
        <div class="page-title"><a class="back" @click="doClickPageBack()"></a>裁剪图片
            <div @click="doClickSaveBtn()">保存</div>
        </div>
        <image-cut :all-w-prop="global.winWidth" :all-h-prop="global.winHeight" :v-w-prop="global.winWidth*0.8" :v-h-prop="global.winWidth*0.8"></image-cut>
    </div>
</template>
<script>
    import { Global } from '../libs/global'
    import { eventHub } from '../libs/hub'
    import Util from '../libs/util'
    import ImageCut from 'components/image-cut.vue'

    module.exports = {
        data: function () {
            return {
                global: Global.data,
                saveUserPicUrl: '../api/v2/profile/user/avatar/eidt',
                type: '',
                inPostData: false
            }
        },
        components: {
            'image-cut': ImageCut
        },
        created: function () {
            var that = this
            var win = window
            if (!win._fileReader) {
                that.$router.redirect({name: 'info', query: {}})
            } else {
                that.type = that.global.currPage.query.type
            }
            // event on
            eventHub.$on('put-base64', that.doPutBase64)
        },
        methods: {
            doClickPageBack: function () {
                history.back()
            },
            doClickSaveBtn: function () {
                var that = this
                that.inPostData = true
                eventHub.$emit('get-base64', {width: 160, height: 160})
            },
            doPutBase64: function (imgData) {
                var that = this
                that.$http.post(that.saveUserPicUrl, {
                    avatar: encodeURIComponent(imgData)
                }).then(function () {
                    Global.updateUserNameAndHeader()
                    Util.tipShow('保存成功！')
                    that.inPostData = false
                    that.$router.push({name: 'info'})
                })
            }
        },
        beforeDestroy: function () {
            eventHub.$off('put-base64', this.doPutBase64)
        }
    }
</script>