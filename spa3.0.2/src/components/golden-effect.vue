<style>
    @import '../styles/components/goldenEffect.css';
</style>
<template>
    <div class="golden-effect" :class="{ show : isShow }" v-html="effectHtml"></div>
</template>

<script>
    import { eventHub } from '../libs/hub'
    import { Global } from '../libs/global'

    module.exports = {
        data: function () {
            return {
                effectHtml: '',
                isShow: false
            }
        },
        created: function () {
            eventHub.$on('show-golden-effect', this.showEffect)
        },
        methods: {
            makeEffect: function (type, count, time) {
                count = count || 3
                if (count < 3) count = 3
                time = time || 3000
                if (time <= 0) time = 3000
                time *= 2
                var d
                var effectHtml = ''
                for (var i = 1, l = parseInt(Math.random(+new Date()) * (count - 3)) + 3; i < l; i++) {
                    d = parseInt(Math.random(+new Date()) * time + 4000) + 'ms'
                    effectHtml += '<div class=\'' + type + '\' style=\'left:' + parseInt(Math.random(+new Date()) * 18) + 'rem;transition-duration: ' + d + ';-webkit-transition-duration: ' + d + ';-moz-transition-duration: ' + d + ';-ms-transition-duration: ' + d + '; -o-transition-duration: ' + d + ';\'></div>'
                }
                return effectHtml
            },
            showEffect: function () {
                var that = this
                that.isShow = true
                that.effectHtml = that.makeEffect('m1', 18) + that.makeEffect('m2', 18)
                setTimeout(function () {
                    var k = 0
                    var list = that.$el.children
                    for (; k < list.length; k++) {
                        list[k].style.webkitTransform = list[k].style.transform = 'translate(0,' + Global.data.winHeight * 2 + 'px)'
                    }
                    setTimeout(function () {
                        that.isShow = false
                        that.effectHtml = ''
                    }, 4000)
                }, 300)
            }
        },
        beforeDestroy: function () {
            eventHub.$off('show-golden-effect', this.showEffect)
        }
    }
</script>