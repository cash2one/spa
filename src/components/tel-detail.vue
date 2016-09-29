<template>
    <div class="telDetail pop-modal" :class="{'active' : showTelDetail }" v-if="telephone.length>0">
        <div>
            <a v-for="tel in telephone" :href="'tel:'+tel">{{tel}}</a>
            <a @click="hideTelDetail()">取消</a>
        </div>
    </div>
</template>

<script>
    module.exports = {
        data: function(){
            return {
                telephone : [],
                showTelDetail : false
            };
        },
        props : ['telephone'],
        events : {
          "change-visible" : function(option){
              console.log("change-visible");
              this.showTelDetail = option.ope == "show";
          }
        },
        methods: {
            hideTelDetail : function(){
                this.showTelDetail = false;
            }
        }
    }
</script>