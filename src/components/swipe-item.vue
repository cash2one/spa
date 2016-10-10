<template>
    <div class="swipe-item">
        <slot></slot>
    </div>
</template>

<script type="text/ecmascript-6">
    export default {
        name: 'mt-swipe-item',

        mounted() {
            this.$dispatch('swipeItemCreated', this);
        },

        destroyed() {
            this.$dispatch('swipeItemDestroyed', this);
        }
    };
</script>