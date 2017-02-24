<style>
    @import '../styles/page/comment.css';
</style>
<template>
    <div class="page" id="comment-page" :class="{ 'already-comment' : orderType != 0 }">
        <page-title title-text="评价"></page-title>
        <div class="wrap thanks">
            <div>
                <div></div>
                <div>感谢您的评价!</div>
            </div>
        </div>
        <div class="tech-info-wrap">
            <router-link :to="{ name : 'technicianDetail' , query : { id : techId }}">
                <div :style="{ backgroundImage : 'url('+techHeader+')' }"></div>
                <div>
                    <div>{{ techName }}</div>
                    <div v-show="techNo">{{ techNo }}</div>
                </div>
            </router-link>
        </div>
        <div class="comment-info wrap">
            <div class="item" v-for="item in commentItems" v-show="item.show">
                <div>{{ item.label }}</div>
                <div @click="doClickCommentStar($event,item)"><div :style="{ width : item.value+'%' }"></div></div>
                <div>{{ item.value | commentFormatter(item.type) }}</div>
            </div>
        </div>
        <div class="comment-impression wrap">
            <div class="title">印象点评<span>（最多3项）</span></div>
            <div class="comment-labels">
                <div v-for="item in impressionList" :key="item.id" @click="doClickImpressionItem(item)" :class="{ active : item.selected }">{{ item.tag }}</div>
            </div>
            <div class="comment-text" v-show="!(orderType == 1 && commentInputText.length == 0)">
                <textarea maxlength="200" ref="commentInput" @focus="onTextareaFocus()" @blur="onTextareaBlur()" v-model="commentInputText" :readonly="orderType==1"></textarea>
                <div>200字以内哦~</div>
                <span :class="{ none : !showTextareaPlaceholder }">亲，点击这里，留句好评哦，么么哒~</span>
            </div>
        </div>
        <attention></attention>
        <div class="submit-btn">
            <div :class="{ checked: isAnonymous }" @click="doCheckAnonymous()">匿名评价</div>
            <div class="submit-button" @click="doClickSubmitBtn()" :class="{ processing : inProcessing }">{{ inProcessing ? '提交中...' : '发表评价' }}</div>
        </div>
    </div>
</template>
<script>
    import Vue from 'vue'
    import { Global } from '../libs/global'
    import Util from '../libs/util'
    import { eventHub } from '../libs/hub'
    import CommentFormatter from '../filters/comment-formatter'

    module.exports = {
        filters: {
            commentFormatter: CommentFormatter
        },
        data: function () {
            return {
                global: Global.data,
                orderId: '',
                techId: '',
                type: '',
                commentId: '',
                orderType: 0,
                techHeader: '',
                techName: '',
                techStars: 0,
                techNo: '',
                commentCount: 0,
                commentInputText: '',
                showTextareaPlaceholder: true,
                inProcessing: false,
                impressionList: [],
                selectedImpression: [],
                isScan: false,
                commentItems: [],

                isAnonymous: false,
                isFromFastPay: false
            }
        },
        created: function () {
            var that = this
            var global = that.global
            var query = global.currPage.query
            var k
            var impressionLabelObj
            var selectedImpressionObj

            that.techId = query.techId
            that.orderId = query.orderId || query.id
            that.type = query.type || ''
            that.commentId = query.commentId || ''
            that.isScan = query.isScan == 1
            that.isFromFastPay = query.from == 'fastPay'

            that.commentItems = [
                {label: '态度：', value: 100, type: 0, show: true},
                {label: '仪容：', value: 100, type: 0, show: true},
                {label: '技能：', value: 100, type: 0, show: true},
                {label: '偷钟：', value: 100, type: 1, show: true},
                {label: '会所环境：', value: 100, type: 0, show: false},
                {label: '接待服务：', value: 100, type: 0, show: false}]

            that.$http.get('../api/v2/club/impression/list').then(function (res) {
                res = res.body
                if (res.statusCode == 200) {
                    var list = res.respData
                    impressionLabelObj = {}
                    for (k = 0; k < list.length; k++) {
                        if (selectedImpressionObj && selectedImpressionObj[list[k]['tag']]) {
                            list[k]['selected'] = true
                        } else {
                            list[k]['selected'] = false
                        }
                        impressionLabelObj[list[k]['tag']] = k
                    }
                    that.impressionList = list
                } else {
                    Util.tipShow(res.msg || '查询印象标签数据出错！')
                }
            })
            that.$http.get('../api/v2/club/shared/technician', {
                params: {
                    id: that.orderId || that.techId,
                    type: that.type,
                    commentId: that.commentId
                }
            }).then(function (res) {
                res = res.body
                global.loading = false
                if (res.statusCode == 200) {
                    res = res.respData
                    var techInfo = res.tech
                    var commentItems = that.commentItems
                    that.orderType = res.allow
                    if (that.orderType == 1) {
                        var commentData = res.comment
                        that.commentInputText = commentData.comment + ''
                        commentItems[0].value = commentData.attitudeRate
                        commentItems[1].value = commentData.appearanceRate
                        commentItems[2].value = commentData.skillRate
                        commentItems[3].value = commentData.clockRate
                        var impressionArr = commentData.impression.split('、')
                        var i
                        var impressionIndex
                        var impressionObj
                        selectedImpressionObj = {}
                        for (i = 0; i < impressionArr.length; i++) {
                            selectedImpressionObj[impressionArr[i]] = true
                            if (impressionLabelObj) {
                                impressionIndex = impressionLabelObj[impressionArr[i]]
                                impressionObj = that.impressionList[impressionIndex]
                                if (impressionObj) {
                                    Vue.set(that.impressionList, impressionIndex, {
                                        tag: impressionObj.tag,
                                        id: impressionObj.id,
                                        selected: true
                                    })
                                }
                            }
                        }
                    }

                    that.techId = techInfo.id
                    that.techHeader = techInfo.avatarUrl || global.defaultHeader
                    that.techName = techInfo.name || global.defaultTechName
                    that.commentCount = techInfo.commentCount || 0
                    that.techNo = techInfo.serialNo
                    that.techStars = techInfo.star || 0
                } else {
                    Util.tipShow(res.msg || global.loadError)
                    that.$router.back()
                }
            }, function () {
                Util.tipShow(global.loadError)
                that.$router.back()
            })
        },
        methods: {
            doCheckAnonymous: function () {
                this.isAnonymous = !this.isAnonymous
            },
            doClickCommentStar: function (event, item) { // 点击服务评级
                var that = this
                if (that.orderType != 0) return
                var v = Math.ceil((event.offsetX || event.layerX) / (8.611 * 16 * that.global.winScale * 0.2))
                var commentItems = that.commentItems
                var itemIndex = commentItems.indexOf(item)
                Vue.set(commentItems, itemIndex, {value: v * 20, type: item.type, label: item.label, show: item.show})
            },
            onTextareaFocus: function () {
                var that = this
                if (that.orderType != 0) return
                that.showTextareaPlaceholder = false
                that.$refs.commentInput.scrollIntoView(true)
            },
            onTextareaBlur: function () {
                var that = this
                if (that.orderType != 0) return
                if (that.commentInputText.length == 0) {
                    that.showTextareaPlaceholder = true
                }
            },
            doClickSubmitBtn: function () {
                var that = this
                var global = that.global
                if (that.inProcessing) {
                    Util.tipShow('正在提交评论，请稍候...')
                } else {
                    if (that.orderType == 0) {
                        that.inProcessing = true
                        var commentItems = that.commentItems
                        var impressionArr = []
                        var list = that.impressionList
                        for (var i = 0; i < list.length; i++) {
                            if (list[i].selected) {
                                impressionArr.push(list[i].tag)
                            }
                        }
                        that.$http.post('../api/v2/club/user/comment/create', {
                            id: that.orderId || that.techId,
                            type: that.isScan ? 'tech_qrcode' : that.type,
                            attitudeRate: commentItems[0].value,
                            appearanceRate: commentItems[1].value,
                            skillRate: commentItems[2].value,
                            clockRate: commentItems[3].value,
                            environmentalScore: that.isScan ? commentItems[4] : '',
                            serviceScore: that.isScan ? commentItems[5] : '',
                            impression: impressionArr.join('、'),
                            comment: encodeURIComponent(that.commentInputText),
                            isAnonymous: that.isAnonymous ? 'Y' : 'N'
                        }).then(function (res) {
                            res = res.body
                            if (res.statusCode == 200) {
                                Util.tipShow(res.msg)
                                that.orderType = 1
                                that.commentCount++
                                if (global.userAgent.isWX) {
                                    var currPageQuery = global.currPage.query
                                    var commentId = res.respData || ''
                                    currPageQuery.commentId = commentId
                                    that.$router.replace({name: 'comment', query: currPageQuery})
                                    that.$router.push({
                                        name: 'techReward',
                                        query: {techId: that.techId, commentId: res.respData || '', isAnonymous: (that.isAnonymous ? 'Y' : 'N')}
                                    })
                                }
                            } else if (res.statusCode == 412) {
                                Util.tipShow(res.msg || '您今天已经评论过该技师了')
                                if (that.isFromFastPay) {
                                    setTimeout(function () {
                                        eventHub.$emit('pop-reward-modal', {
                                            avatarUrl: that.techHeader,
                                            name: that.techName,
                                            clubName: ''
                                        })
                                        that.$router.push({naame: 'home'})
                                    }, 300)
                                } else {
                                    that.$router.back()
                                }
                            } else {
                                Util.tipShow(res.msg || '评论出错！')
                            }
                            that.inProcessing = false
                        })
                    } else {
                        Util.tipShow('此评论已提交。')
                    }
                }
            },
            doClickImpressionItem: function (impressionItem) {
                var that = this
                var k = 0
                var selectedList = that.selectedImpression
                var impressionList = that.impressionList
                if (that.orderType != 0) return
                if (impressionItem.selected) { // 取消选中
                    var index = impressionList.indexOf(impressionItem)
                    Vue.set(impressionList, index, {id: impressionItem.id, tag: impressionItem.tag, selected: false})
                    for (k = 0; k < selectedList.length; k++) {
                        if (selectedList[k] == impressionItem.id) {
                            selectedList.splice(k, 1)
                            break
                        }
                    }
                } else { // 增加选中
                    if (selectedList.length == 3) {
                        for (k = 0; k < impressionList.length; k++) {
                            if (impressionList[k].id == selectedList[0]) {
                                Vue.set(impressionList, k, {
                                    id: impressionList[k].id,
                                    tag: impressionList[k].tag,
                                    selected: false
                                })
                                break
                            }
                        }
                        selectedList.splice(0, 1)
                    }
                    Vue.set(impressionList, impressionList.indexOf(impressionItem), {
                        id: impressionItem.id,
                        tag: impressionItem.tag,
                        selected: true
                    })
                    selectedList.push(impressionItem.id)
                }
            }
        }
    }
</script>