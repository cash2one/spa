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
                if (actData.activityType == 'paid_service_item') {
                    return 'timeLimit'
                } else if (actData.activityType == 'paid_plumflowe') {
                    return 'oneYuan'
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
                if (actData.activityType == 'paid_service_item') {
                    that.$router.push({name: 'robProjectDetail', query: {robProjectId: actData.activityId}})
                } else if (actData.activityType == 'paid_plumflowe') {
                    that.$router.push({name: 'plumflowers', query: {id: actData.activityId}})
                }
            }
        },
        beforeDestroy: function () {
            eventHub.$off('change-activity-pop', this.doChange)
        }
    }
</script>