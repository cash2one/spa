<style>
    @import '../styles/components/plumflowers-pop.css';
</style>
<template>
    <div class="plumflowers-pop pop-modal" :class="{ active : show }">
        <div class="center-wrap">
            <div>
                <div><div></div><div></div></div>
                <a @click="doClickGet()">立即抢购</a>
            </div>
            <div @click="doChange(false)">&times;</div>
        </div>
    </div>
</template>

<script>
    import { eventHub } from '../libs/hub'
    import Util from '../libs/util'

    module.exports = {
        data: function () {
            return {
                show: false
            }
        },
        props: {
            shareUrl: {
                type: String
            }
        },
        created: function () {
            eventHub.$on('change-plumflowers-pop', this.doChange)
        },
        methods: {
            doChange: function (type) {
                this.show = type
            },
            doClickGet: function () {
                var that = this
                var urlObj = Util.urlFormat(that.shareUrl)
                that.$router.push({name: urlObj.page, query: urlObj.querys})
            }
        },
        beforeDestroy: function () {
            eventHub.$off('change-plumflowers-pop', this.doChange)
        }
    }
</script>