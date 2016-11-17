<style>
    @import '../styles/components/share.css';
</style>
<template>
    <div class="share-pop pop-modal" :class="{ active : show }" @click="doChange(false)">
        <div v-if="global.userAgent.isWX" @click="doClickWrap($event)" class="top">发送给朋友或者分享到朋友圈</div>
        <div class="center-wrap center" @click="doClickWrap($event)" v-else>
            <div><a :href="shareUrl">{{ shareUrl }}</a></div>
            <div>长按复制您的专属链接，发送给您的朋友</div>
            <div @click="doChange(false)">关闭</div>
        </div>
    </div>
</template>

<script>
    import { Global } from '../libs/global'
    import { eventHub } from '../libs/hub'

    export default {
        name: 'share',
        data: function () {
            return {
                global: Global.data,
                show: false
            }
        },
        props: {
            shareUrl: {
                type: String,
                required: true
            }
        },
        created: function () {
            eventHub.$on('change-share-pop', this.doChange)
        },
        methods: {
            doChange: function (type) {
                this.show = type
            },
            doClickWrap: function (event) {
                event.stopPropagation()
            }
        },
        beforeDestroy: function () {
            eventHub.$off('change-share-pop', this.doChange)
        }
    }
</script>