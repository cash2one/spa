<style>
    @import '../styles/page/suggestions.css';
</style>
<template>
    <div class="page" id="suggestions-page">
        <page-title title-text="投诉建议"></page-title>
        <div class="star-comment">
            <div>
                <div>环境</div>
                <div class="stars" @click="doClickCommentStar($event,0)">
                    <div :style="{ width: environmentScore+'%' }"></div>
                </div>
                <div>{{ scoreArr[environmentScore/20-1] }}</div>
            </div>
            <div>
                <div>服务</div>
                <div class="stars" @click="doClickCommentStar($event,1)">
                    <div :style="{ width: serviceScore+'%' }"></div>
                </div>
                <div>{{ scoreArr[serviceScore/20-1] }}</div>
            </div>
        </div>
        <div class="input-comment">
            <div>
                <div>会所评价</div>
            </div>
            <div><textarea placeholder="给会所一个评价吧" maxlength="1000" v-model="commentText"></textarea></div>
        </div>
        <div class="suggestion-btn">
            <div :class="{ checked: isAnonymous }" @click="doCheckAnonymous()">匿名评价</div>
            <div class="submit-button" @click="doSubmitComment()" :class="{ processing: inSubmit }">{{ inSubmit ? '提交中...' : '发表评价' }}</div>
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
                environmentScore: 100,
                serviceScore: 100,
                commentText: '',
                scoreArr: ['非常差', '不满意', '一般', '满意', '非常好'],
                isAnonymous: false,
                inSubmit: false
            }
        },
        created: function () {
            var that = this
            var global = that.global
            if (!global.clubId) {
                that.$router.back()
            } else {
                global.loading = false
            }
        },
        methods: {
            doClickCommentStar: function (event, type) {
                var that = this
                var v = Math.ceil((event.offsetX || event.layerX) / (10.944 * 16 * that.global.winScale * 0.2))
                if (type == 0) {
                    that.environmentScore = v * 20
                } else {
                    that.serviceScore = v * 20
                }
            },
            doCheckAnonymous: function () {
                this.isAnonymous = !this.isAnonymous
            },
            doSubmitComment: function () {
                var that = this
                if (that.inSubmit) {
                    return Util.tipShow('提交中，请稍候...')
                }
                that.inSubmit = true
                that.$http.post('../api/v2/profile/user/feedback/create', {
                    clubId: that.global.clubId,
                    environmentalScore: that.environmentScore,
                    serviceScore: that.serviceScore,
                    comments: that.commentText.substr(0, 1000),
                    isAnonymous: that.isAnonymous ? 'Y' : 'N'
                }).then(function (res) {
                    res = res.body
                    that.inSubmit = false
                    if (res.statusCode == 200) {
                        Util.tipShow('提交成功！')
                        that.$router.push({name: 'personal'})
                    } else {
                        Util.tipShow(res.msg || '提交失败！')
                    }
                }, function () {
                    that.inSubmit = false
                    Util.tipShow('提交失败！')
                })
            }
        }
    }
</script>