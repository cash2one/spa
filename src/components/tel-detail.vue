<template>
    <div class="telDetail pop-modal" :class="{ active : show }" v-if="telephone.length>0">
        <div>
            <a v-for="tel in telephone" :href="'tel:'+tel">{{tel}}</a>
            <a @click="doChangeVisible(false)">取消</a>
        </div>
    </div>
</template>

<script>
    import { Global } from '../libs/global';

    module.exports = {
        data : function(){
            return {
                show : false,
                eventHub : Global.eventHub
            }
        },
        props : {
            telephone : {
                type : Array,
                default : []
            }
        },
        created : function(){
            var _this = this;
            _this.eventHub.$on("change-tel-detail",_this.doChangeVisible);
        },
        methods: {
            doChangeVisible : function(type){
                this.show = type;
            }
        },
        beforeDestroy : function(){
            var _this = this;
            _this.eventHub.$off("change-tel-detail",_this.doChangeVisible);
        }
    }
</script>