<style>
    @import '../styles/components/counter.css';
</style>
<template>
    <div class="counter-wrap" @transitionend="doTransitionEnd($event)">
        <label>{{ tipText[status] }}</label>
        <template v-if="status !='over' ">
            <div ref="w0"><div data-index="0"><b>{{ times[0][0] }}</b><b>{{ times[0][1] }}</b></div></div>
            <div ref="w1"><div data-index="1"><b>{{ times[1][0] }}</b><b>{{ times[1][1] }}</b></div></div>
            <label>天</label>
            <div ref="w2"><div data-index="2"><b>{{ times[2][0] }}</b><b>{{ times[2][1] }}</b></div></div>
            <div ref="w3"><div data-index="3"><b>{{ times[3][0] }}</b><b>{{ times[3][1] }}</b></div></div>
            <label>时</label>
            <div ref="w4"><div data-index="4"><b>{{ times[4][0] }}</b><b>{{ times[4][1] }}</b></div></div>
            <div ref="w5"><div data-index="5"><b>{{ times[5][0] }}</b><b>{{ times[5][1] }}</b></div></div>
            <label>分</label>
            <div ref="w6"><div data-index="6"><b>{{ times[6][0] }}</b><b>{{ times[6][1] }}</b></div></div>
            <div ref="w7"><div data-index="7"><b>{{ times[7][0] }}</b><b>{{ times[7][1] }}</b></div></div>
            <label>秒</label>
        </template>
        <label v-else>活动已结束，欢迎下次抢购！</label>
    </div>
</template>

<script>
    import Vue from 'vue';

    module.exports = {
        data: function(){
            return {
                times : [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
                surplusMillSecond : 0, //剩余的毫秒数
                timer : null
            };
        },
        props : {
            start : {
                type : String,
                required : true
            },
            end : {
                type : String,
                required : true
            },
            tipText : {
                type : Object,
                default : function(){
                    return { 'notStarted' : '距开始：', 'started' : '距结束：', 'over' : '已结束' }
                }
            }
        },
        computed : {
            status : function(){
                var currStatus = this.getStatus();
                this.$emit("status-change",currStatus);
                return currStatus;
            },
            startTime : function(){
                return new Date(this.start.replace(/-/g,'/')).getTime()
            },
            endTime : function(){
                return new Date(this.end.replace(/-/g,'/')).getTime()
            }
        },
        mounted : function(){
            var _this = this;
            if(_this.status != "over"){
                _this.$nextTick(function(){
                    _this.update(_this.getFormatTime(_this.surplusMillSecond),true);
                    _this.doCount();
                });
            }
        },
        methods: {
            getStatus : function(){
                var _this = this, currTime = (+new Date());
                if(currTime<_this.startTime){
                    _this.surplusMillSecond = _this.startTime-currTime;
                    return "notStarted"; //未开始
                }
                else if(currTime<_this.endTime){
                    _this.surplusMillSecond = _this.endTime-currTime;
                    return "started"; //已开始
                }
                else{
                    return "over"; //已结束
                }
            },
            getFormatTime : function(millSecond){
                var   floor = Math.floor,
                        second = millSecond/1000,
                        sec = floor(second%60),
                        min = floor(second/60%60),
                        hour = floor(second/3600%24),
                        day = floor(second/3600/24);
                return [ floor(day/10), day%10, floor(hour/10), hour%10, floor(min/10), min%10, floor(sec/10), sec%10 ]
            },
            doTransitionEnd : function(event){
                var _this = this, target = event.target || event.srcElement, index = target.dataset.index, times = _this.times;
                index = index-0;
                Vue.set(times[index],1,times[index][0]);
                _this.$refs['w'+index].className = "";
            },
            update : function(timeArr,isInit){
                var _this = this, times = _this.times, k = 0;
                for(;k<timeArr.length;k++){
                    if(times[k][1] != timeArr[k]){//需要更新
                        Vue.set(times[k],0,timeArr[k]);
                        if(isInit){
                            Vue.set(times[k],1,timeArr[k]);
                        }
                        else{
                            _this.$refs['w'+k].className = "toggle";
                        }
                    }
                }
            },
            doCount : function(){
                var _this = this;
                _this.timer = setTimeout(function(){
                    _this.surplusMillSecond -= 1000;
                    if(_this.surplusMillSecond == 0){
                        _this.status = _this.getStatus();
                        this.$emit("status-change",_this.status);
                    }
                    _this.update(_this.getFormatTime(_this.surplusMillSecond));
                    _this.doCount();
                },1000);
            }
        },
        beforeDestroy : function(){
            if(this.timer){ clearTimeout(this.timer) }
        }
    }
</script>