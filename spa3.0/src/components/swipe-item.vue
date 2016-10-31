<template>
    <div class="swipe-item">
        <slot></slot>
    </div>
</template>

<script type="text/ecmascript-6">
    import { eventHub } from '../libs/hub';

    export default {
        name: 'mt-swipe-item',

        mounted() {
            eventHub.$emit("swipeItemCreated",this);
        },

        destroyed() {
            eventHub.$emit("swipeItemDestroyed",this);
        }
    };
</script>