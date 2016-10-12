<style>
    @import '../styles/page/login.css';
</style>
<template>
    <div class="page login-page" id="register-page" v-show="!$loadingRouteData">
        <div class="page-title"><a class="back" @click="doClickPageBack()"></a>注册</div>

    </div>
</template>
<script>
    import { Global } from '../libs/global';
    import Util from "../libs/util";

    module.exports = {

    }
</script>