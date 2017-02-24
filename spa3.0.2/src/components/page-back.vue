<!--页面的返回按钮-->
<template>
    <div class="page-back-btn" @click="doClickPageBack()" v-show="showBack"></div>
</template>

<script>
    export default {
        props: {
            showBack: {
                default: true
            }
        },
        methods: {
            doClickPageBack: function () {
                history.back()
            }
        }
    }
</script>