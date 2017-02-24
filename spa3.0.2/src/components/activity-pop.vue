<template>
    <div class="pop-modal activity-pop" :class="{ active : show }">
        <div class="center-wrap" :class="clsName">
            <div><div @click="doJump()"></div></div>
            <div @click="doClose()">&times;</div>
        </div>
    </div>
</template>

<script>
    import { eventHub } from '../libs/hub'
    import { Global } from '../libs/global'

    export default {
        data: function () {
            return {
                global: Global.data,
                show: false
            }
        },
        props: {
            actData: {
                type: Object,
                required: true
            }
        },
        computed: {
            clsName: function () {
                var actData = this.actData
                var actType = actData.acactivityType
                if (actType == 'paid_service_item') { // 限时抢
                    return 'timeLimit'
                } else if (actType == 'paid_plumflowe' || actType == 'one_yuan') { // 一元夺
                    return 'oneYuan'
                } else {
                    return actType // luckyWheel journal
                }
            }
        },
        created: function () {
            eventHub.$on('change-activity-pop', this.doChange)
        },
        methods: {
            doClose: function () {
                this.show = false
            },
            doChange: function (type) {
                this.show = type
            },
            doJump: function () {
                var that = this
                var actData = that.actData
                var actType = actData.acactivityType

                if (actType == 'paid_service_item') {
                    that.$router.push({name: 'robProjectDetail', query: {robProjectId: actData.activityId}})
                } else if (actType == 'paid_plumflowe') {
                    that.$router.push({name: 'plumflowers', query: {id: actData.activityId}})
                } else if (actType == 'one_yuan') {
                    that.$router.push({name: 'oneYuanDetail', query: {oneYuanBaseId: actData.activityId}})
                } else if (actType == 'luckyWheel') {
                    that.$router.push({name: 'luckyWheel', query: {actId: actData.activityId}})
                } else if (actType == 'journal') {
                    location.href = location.origin + '/spa-manager/journal?id=' + actData.activityId
                }
            }
        },
        beforeDestroy: function () {
            eventHub.$off('change-activity-pop', this.doChange)
        }
    }
</script>