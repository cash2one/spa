<style>
    @import '../styles/components/tech.css';
</style>
<template>
    <div class="tech-item-wrap">
        <div class="title" @click="doClickClub()">
            <div :style="{ backgroundImage : 'url('+(techObj.imageUrl || global.defaultClubLogo )+')' }"></div>
            <div v-html="clubName"></div>
            <div>{{ techObj.distance | DistanceFormatter }}</div>
        </div>
        <div class="list-item" v-for="item in techObj.techImpression" @click="doClickTech(item.techId)">
            <div :style="{ backgroundImage : 'url('+(item.avatarUrl || global.defaultHeader )+')' }"></div>
            <div v-html="techName[item.techId] || global.defaultTechName"></div>
            <div>
                <div class="stars"><div :style="{ width : item['star']+'%'}"></div></div>
                <span>{{ item.commentCount }}&nbsp;&nbsp;评论</span></div>
            <div v-html="techTag[item.techId]"></div>
        </div>
    </div>
</template>

<script>
    import { Global } from '../libs/global'
    import DistanceFormatter from '../filters/distance-formatter'

    module.exports = {
        data: function () {
            return {
                global: Global.data
            }
        },
        props: {
            techObj: {
                type: Object,
                required: true
            },
            searchText: {
                type: String,
                required: true
            }
        },
        computed: {
            clubName: function () {
                var that = this
                return that.techObj.name.replace(new RegExp(that.searchText, 'g'), '<span>' + that.searchText + '</span>')
            },
            techName: function () {
                var k = 0
                var that = this
                var arr = {}
                var item
                for (; k < that.techObj.techImpression.length; k++) {
                    item = that.techObj.techImpression[k]
                    if (item.name) {
                        arr[item['techId']] = item.name.replace(new RegExp(that.searchText, 'g'), '<span>' + that.searchText + '</span>')
                    }
                }
                return arr
            },
            techTag: function () {
                var k = 0
                var that = this
                var arr = {}
                var item
                for (; k < that.techObj.techImpression.length; k++) {
                    item = that.techObj.techImpression[k]
                    if (item.tag) {
                        arr[item['techId']] = item.tag.replace(new RegExp(that.searchText, 'g'), '<span>' + that.searchText + '</span>').replace(/,/g, '，')
                    }
                }
                return arr
            }
        },
        filters: {
            DistanceFormatter: DistanceFormatter
        },
        methods: {
            doClickClub: function () {
                this.$router.push({path: '/' + this.techObj.id + '/home'})
            },
            doClickTech: function (techId) {
                this.$router.push({path: '/' + this.techObj.id + '/technicianDetail', query: {id: techId}})
            }
        }
    }
</script>