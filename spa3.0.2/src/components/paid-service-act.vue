<template>
   <div class="paid-act-item" :class="{ 'act-end' : isActEnd }" @click="doClick()">
       <div :style="{ backgroundImage : 'url('+(actData.imageUrl || global.defaultServiceItemImgUrl )+')' }"></div>
       <div>
           <div class="paid-act-item-name">
               <div><div>{{ actData.name }}</div><div v-show="actData.usePeriod && (actData.usePeriod.match(/(\d)/g).length != 7 || actData.endTime)">限时用</div></div>
               <div v-show="!isActEnd"><span v-if="actData.canPaidCount>0">剩余{{ actData.canPaidCount - actData.paidCount }}份</span><span v-else>不限份数</span></div>
           </div>
           <div class="paid-act-item-price">
               <span>{{ actData.amount }}</span>元<span v-show="actData.credits>0">（或<b>{{ actData.credits }}</b>积分）</span>
           </div>
           <div class="paid-act-item-time">
               <span>{{ isActEnd ? '活动已结束，欢迎下次抢购！' : '原价：'+actData.price+'元' }}</span>
               <counter v-if="!isActEnd" :start="actData.startDate" :end="actData.endDate"></counter>
           </div>
           <div class="paid-act-item-btn">{{ isActEnd ? '抢光了' : '马上抢' }}</div>
       </div>
   </div>
</template>

<script>
    import { Global } from '../libs/global'

    module.exports = {
        data: function () {
            return {
                isActEnd: false,
                global: Global.data
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
            // 判断活动是否已经结束
            that.isActEnd = (actData.canPaidCount > 0 && actData.canPaidCount - actData.paidCount == 0) || ((+new Date()) - new Date(actData.endDate.replace(/-/g, '/')).getTime() >= 0)
        },
        methods: {
            doClick: function () {
                var that = this
                if (!that.isActEnd) {
                    that.$router.push({name: 'robProjectDetail', query: {robProjectId: that.actData.id}})
                }
            }
        }
    }
</script>