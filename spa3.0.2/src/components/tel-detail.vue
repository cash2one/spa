<template>
    <div class="telDetail pop-modal" :class="{ active : show }" v-if="telephone.length>0" @click="doChange(false)">
        <div @click="doClickWrap($event)">
            <a v-for="tel in telephone" :href="'tel:'+tel">{{tel}}</a>
            <a @click="doChange(false)">取消</a>
        </div>
    </div>
</template>

<script>
    import { eventHub } from '../libs/hub'

    export default {
        name: 'tel-detail',
        data: function () {
            return {
                show: false
            }
        },
        props: {
            telephone: {
                type: Array,
                default: []
            }
        },
        created: function () {
            eventHub.$on('change-tel-detail', this.doChange)
        },
        methods: {
            doChange: function (type) {
                this.show = type
            },
            doClickWrap: function (e) {
                e.stopPropagation()
            }
        },
        beforeDestroy: function () {
            eventHub.$off('change-tel-detail', this.doChange)
        }
    }
</script>