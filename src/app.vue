<style>
    @import './styles/page/index.css';
</style>
<template>
    <div>
        <div id="page-container">
            <router-view></router-view>
        </div>
        <div id="menu-container">
            <router-link class="home" :to="{ name : 'home' }">
                <div></div>
                <div>首页</div>
            </router-link>
            <router-link class="message" :to="{ name : 'message' }">
                <div><i style="visibility: hidden">0</i></div>
                <div>聊天</div>
            </router-link>
            <router-link class="technicianList" :to="{ name : 'technicianList' }">
                <div></div>
                <div>约技师</div>
            </router-link>
            <router-link class="order" :to="{ name : 'order' }">
                <div></div>
                <div>订单</div>
            </router-link>
            <router-link class="personal" :to="{ name : 'personal' }">
                <div></div>
                <div>个人中心</div>
            </router-link>
        </div>
        <div id="app-tip"><div></div></div>
    </div>
</template>
<script>
    import { Global } from './libs/global';

    module.exports = {
        data: function() {
            return {
                global : Global.data
            }
        },
        mounted: function() {
            var _this = this;

            ////依据窗口的宽度调整
            window.addEventListener("resize",function(){
                _this.initWindowWidth();
            });
            _this.initWindowWidth();
        },
        beforeDestroy: function() {

        },
        methods: {
            initWindowWidth : function(){
                var global = this.global, win = window, doc = document;
                if (!global.baseWidth){
                    global.baseWidth = doc.body.clientWidth || 320;
                }
                global.winWidth = doc.documentElement.clientWidth || win.innerWidth || doc.body.clientWidth;
                global.winHeight = doc.documentElement.clientHeight || win.innerHeight;
                global.winWidth = global.winWidth>720 ? 720 : (global.winWidth<320 ? 320 : global.winWidth);
                global.winScale = global.winWidth / global.baseWidth;
                doc.querySelector("html").style.fontSize = doc.documentElement.style.fontSize = global.winScale * 16 + 'px';
            }
        }
    }
</script>