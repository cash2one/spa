<template>
    <div class="swipe-item">
        <slot></slot>
    </div>
</template>

<script type="text/ecmascript-6">
    import { Global } from '../libs/global';

    export default {
        name: 'mt-swipe-item',

        mounted() {
            Global.eventHub.$emit("swipeItemCreated",this);
        },

        destroyed() {
            Global.eventHub.$emit("swipeItemDestroyed",this);
        }
    };
</script>