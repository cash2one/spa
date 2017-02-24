<template>
   <div class="paid-act-item one-yuan" :class="{ 'started' : statusStr == 'started', 'completed': statusStr == 'completed' }" @click="doClick()">
       <div :style="{ backgroundImage : 'url('+(actData.imageUrl || global.defaultServiceItemImgUrl )+')' }"></div>
       <div>
           <div class="one-yuan-act-name">{{ actData.name }}<span>(第{{ actData.currentPeriod }})期</span><span>{{ statusStr == 'started' ? '剩余'+actData.canPaidCount+'份' : ( actData.status == 'end' ? '待开奖' : '未开始' )}}</span></div>
           <div class="paid-act-item-price"><span>{{ actData.amount }}</span>元<label>原价：{{ actData.price }}元</label></div>
           <div class="one-yuan-act-status">
               <div class="progress"><label>开奖进度：</label><span>{{ progress }}%</span><div><div :style="{ width: progress +'%' }"></div></div></div>
               <span>已揭晓</span>
               <counter :start="actData.startDate" :end="actData.endDate" :show-day="false" :show-second="true"></counter>
           </div>
           <div class="paid-act-item-btn">一元抢</div>
       </div>
   </div>
</template>

<script>
    import { Global } from '../libs/global'

    module.exports = {
        data: function () {
            return {
                isActEnd: false,
                global: Global.data,
                statusStr: '',
                progress: 0
            }
        },
        props: {
            actData: {
                type: Object,
                required: true
            }
        },
        created: function () {
            var that = this
            var actData = that.actData

            if (actData.status == 'online' && ((+new Date()) - new Date(actData.startDate.replace(/-/g, '/'))) > 0) {
                that.statusStr = 'started'
            } else if (actData.status == 'complete') {
                that.statusStr = 'completed'
            }
            that.progress = ((actData.paidCount / actData.totalPaidCount) * 100).toFixed(0)
        },
        methods: {
            doClick: function () {
                var that = this
                that.$router.push({name: 'oneYuanDetail', query: {oneYuanId: that.actData.id}})
            }
        }
    }
</script>