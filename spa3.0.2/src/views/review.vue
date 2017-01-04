<style>
    @import '../styles/page/review.css';
</style>
<template>
    <div class="page" id="review-list-page">
        <div class="page-title">
            <a class="back" @click="doClickPageBack()"></a>评论列表
            <div class="comment-select" :class="{ active : showCommentTypeSelect }" @click="doShowCommentTypeSelect()">
                <span>{{currType == 'order' ? '订单评论' : ( currType == 'tech' ? '粉丝评论' : '全部评论' )}}</span>
                <div></div>
                <ul>
                    <li @click="doSelectCommentType('')" :class="{ selected : currType=='' }">全部评论<i></i><i></i></li>
                    <li @click="doSelectCommentType('order')" :class="{ selected : currType=='order' }">订单评论</li>
                    <li @click="doSelectCommentType('tech')" :class="{ selected : currType=='tech' }">粉丝评论</li>
                </ul>
            </div>
        </div>
        <div class="comment-list" ref="listEle" :style="{ height : (global.winHeight-2.611*global.winScale*16)+'px' }" @scroll="doHandlerListScroll()">
            <div class="comment-item" v-for="item in comments">
                <div>
                    <div :style="{ backgroundImage : 'url('+(item.avatarUrl || global.defaultHeader)+')' }"></div>
                    <div>{{ ((!item.name || item.name=="null") ? "匿名用户" : item.name ) }}</div>
                    <div>{{item.createdAt}}</div>
                    <div>{{item.commentTypeName}}</div>
                </div>
                <div>
                    <div><div :style="{ width : item.rate+'%' }"></div></div>
                    <div v-show="item.rewardAmount != 0"><i></i>打赏：<span>{{ (item.rewardAmount/100).toFixed(2) }}</span>元</div>
                </div>
                <div v-show="item.comment">{{item.comment}}</div>
            </div>
            <div class="data-load-tip" :class="{ none : !showDataLoadTip }"><div>加载数据</div></div>
            <div class="finish-load-tip" :class="{ none : !showFinishLoadTip }"><div>已加载完全部数据</div></div>
            <div class="nullData" v-show="comments.length==0 && !isAddData">
                <div v-show="!global.loading"></div>
                <div>{{ global.loading ? '数据加载中...' : '暂无内容...' }}</div>
            </div>
        </div>
    </div>
</template>
<script>
    import { Global } from '../libs/global'
    import Util from '../libs/util'

    module.exports = {
        data: function () {
            return {
                global: Global.data,
                queryTechCommentsUrl: '../api/v2/club/technician/comments',
                pageSize: 20,
                currPage: 1,
                currType: '',
                techId: '',
                comments: [],
                showDataLoadTip: false, // 显示数据正在加载
                showFinishLoadTip: false, // 显示已经加载完成
                isDataAddEnd: false, // 数据是否已加载完
                isAddData: false, // 数据是否正在加载
                showCommentTypeSelect: false
            }
        },
        created: function () {
            var that = this
            var global = that.global
            that.techId = global.currPage.query.id
            if (that.techId == undefined) { // 链接上无技师id
                Util.tipShow(global.visitError)
                return that.$router.back()
            }
            that.$http.get(that.queryTechCommentsUrl, {
                params: {
                    page: that.currPage,
                    pageSize: that.pageSize,
                    type: that.currType,
                    techId: that.techId
                }
            }).then(function (res) {
                res = res.body
                global.loading = false
                if (res.statusCode == 200) {
                    res = res.respData
                    if (res.length == 0) {
                        that.isDataAddEnd = true
                    } else if (res.length < that.pageSize) {
                        that.isDataAddEnd = true
                        that.showFinishLoadTip = true
                    }
                    that.comments = res
                } else {
                    Util.tipShow(global.loadError)
                    that.$router.back()
                }
            }, function () {
                Util.tipShow(global.loadError)
                that.$router.back()
            })
        },
        methods: {
            doSelectCommentType: function (type) {
                var that = this
                if (that.currType != type) {
                    that.currType = type
                    that.queryCommentData(1)
                }
            },
            doShowCommentTypeSelect: function () {
                this.showCommentTypeSelect = !this.showCommentTypeSelect
            },
            doClickPageBack: function () { // 点击返回按钮
                history.back()
            },
            queryCommentData: function (page) { // 查询列表数据
                var that = this
                if (that.isAddData) {
                    return
                }
                that.isAddData = true
                page = page || that.currPage + 1

                // 更新数据加载提示
                that.showDataLoadTip = true
                that.showFinishLoadTip = false
                that.isDataAddEnd = false

                that.$http.get(that.queryTechCommentsUrl, {
                    params: {
                        page: page,
                        pageSize: that.pageSize,
                        type: that.currType,
                        techId: that.techId
                    }
                }).then(function (res) {
                    res = res.body
                    if (res.statusCode == 200) {
                        res = res.respData
                        if (page == 1) {
                            that.comments = res
                            if (res.length == 0) {
                                that.isDataAddEnd = true
                            } else if (res.length < that.pageSize) {
                                that.isDataAddEnd = true
                                that.showFinishLoadTip = true
                            }
                        } else {
                            for (var i = 0; i < res.length; i++) {
                                that.comments.push(res[i])
                            }
                            if (res.length < that.pageSize) {
                                that.isDataAddEnd = true
                                that.showFinishLoadTip = true
                            }
                        }
                        that.currPage = page
                        that.isAddData = false
                        that.showDataLoadTip = false
                    } else {
                        Util.tipShow(that.global.loadError)
                    }
                }, function () {
                    Util.tipShow(that.global.loadError)
                })
            },
            doHandlerListScroll: function () { // 列表的滚动加载
                var that = this
                var listEle = that.$refs.listEle
                if (!that.isDataAddEnd && listEle.scrollTop + listEle.clientHeight * 1.4 > listEle.scrollHeight) {
                    that.queryCommentData()
                }
            }
        }
    }
</script>