<style>
    @import '../styles/page/info.css';
</style>
<template>
    <div class="page info-page" id="picture-page">
        <page-title title-text="裁剪图片"><div @click="doClickSaveBtn()">保存</div></page-title>
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
                type: '',
                inPostData: false
            }
        },
        components: {
            'image-cut': ImageCut
        },
        created: function () {
            var that = this
            var global = that.global
            var win = window
            if (!win._fileReader) {
                that.$router.replace({name: 'info'})
            } else {
                that.type = global.currPage.query.type
                global.loading = false
            }
            eventHub.$on('put-base64', that.doPutBase64)
        },
        methods: {
            doClickSaveBtn: function () {
                var that = this
                that.inPostData = true
                eventHub.$emit('get-base64', {width: 160, height: 160})
            },
            doPutBase64: function (imgData) {
                var that = this
                that.$http.post('../api/v2/profile/user/avatar/eidt', {avatar: encodeURIComponent(imgData)}).then(function () {
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