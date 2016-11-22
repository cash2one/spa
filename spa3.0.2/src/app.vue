<style>
    @import './styles/page/index.css';
</style>
<template>
    <div id="page-container">
        <router-view></router-view>
        <div v-show="global.showAppMenu && !global.loading" class="menu-container club">
            <router-link class="home" :to="{ name : 'home' }"><div></div><div>首页</div></router-link>
            <router-link class="message" :to="{ name : 'message' }"><div><i v-show="im.newMsgTotal>0">{{ im.newMsgTotal }}</i></div><div>聊天</div></router-link>
            <router-link class="technicianList" :to="{ name : 'technicianList' }"><div></div></router-link>
            <router-link class="order" :to="{ name : 'order' }"><div></div><div>订单</div></router-link>
            <router-link class="personal" :to="{ name : 'personal' }"><div></div><div>个人中心</div></router-link>
        </div>
        <div v-show="global.show9358Menu" class="menu-container public">
            <router-link class="clubList" :to="{ name : 'clubList' }"><div></div><div>首页</div></router-link>
            <router-link class="message" :to="{ name : 'message' }"><div><i v-show="im.newMsgTotal>0">{{ im.newMsgTotal }}</i></div><div>聊天</div></router-link>
            <router-link class="personal" :to="{ name : 'personal' }"><div></div><div>个人中心</div></router-link>
        </div>
        <spinner v-show="global.loading && !global.loading"></spinner>
    </div>
</template>
<script>
    import { Global } from './libs/global'
    import { IM } from './libs/im'

    module.exports = {
        data: function () {
            return {
                global: Global.data,
                im: IM
            }
        }
    }
</script>