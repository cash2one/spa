<!--带返回箭头按钮的页面标题-->
<template>
    <div class="page-title"><a v-if="showBack" class="back" @click="doClickPageBack()"></a>{{ titleText }}<slot></slot></div>
</template>

<script>
    export default {
        props: {
            titleText: {
                required: true
            },
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