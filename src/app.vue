<style>
    @import './styles/page/index.css';
</style>
<template>
    <div id="page-container">
        <router-view></router-view>
    </div>
    <div id="menu-container">
        <a class="home" v-link="{name : 'home', activeClass : 'active' }">
            <div></div>
            <div>首页</div>
        </a>
        <a class="message" v-link="{name : 'message', activeClass : 'active' }">
            <div><i style="visibility: hidden">0</i></div>
            <div>聊天</div>
        </a>
        <a class="technicianList" v-link="{name : 'technicianList', activeClass : 'active'}">
            <div></div>
            <div>约技师</div>
        </a>
        <a class="order" v-link="{name : 'order', activeClass : 'active'}">
            <div></div>
            <div>订单</div>
        </a>
        <a class="personal" v-link="{name : 'personal', activeClass : 'active'}">
            <div></div>
            <div>个人中心</div>
        </a>
    </div>
    <div id="app-tip"><div></div></div>
</template>
<script>
    import { Global } from './libs/global';

    module.exports = {
        data: function() {
            return {
                global : Global.data
            }
        },
        ready: function() {
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