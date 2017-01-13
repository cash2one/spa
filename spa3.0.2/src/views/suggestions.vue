<style>
    @import '../styles/page/suggestions.css';
</style>
<template>
    <div>
        <div class="page" id="suggestions-page" :style="{ height : global.winHeight+'px' }">
            <page-title title-text="投诉建议"></page-title>
            <div class="star-comment">
                <div>
                    <div>环境</div>
                    <div class="stars" @click="doClickCommentStar($event,0)"><div :style="{ width: environmentScore+'%' }"></div></div>
                    <div>{{ scoreArr[environmentScore/20-1] }}</div>
                </div>
                <div>
                    <div>服务</div>
                    <div class="stars" @click="doClickCommentStar($event,1)"><div :style="{ width: serviceScore+'%' }"></div></div>
                    <div>{{ scoreArr[serviceScore/20-1] }}</div>
                </div>
            </div>
            <div class="input-comment">
                <div><div>会所评价</div></div>
                <div><textarea placeholder="给会所一个评价吧" maxlength="1000" v-model="commentText"></textarea></div>
            </div>
        </div>
        <div class="suggestion-btn">
            <div @click="doSubmitComment()">提交</div>
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
                scoreArr: ['非常差', '不满意', '一般', '满意', '非常好']
            }
        },
        created: function () {
            var that = this
            if (!that.global.clubId) {
                that.$router.back()
            } else {
                that.global.loading = false
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
            doSubmitComment: function () {
                var that = this
                that.$http.post('../api/v2/profile/user/feedback/create', {
                    clubId: that.global.clubId,
                    environmentalScore: that.environmentScore,
                    serviceScore: that.serviceScore,
                    comments: that.commentText.substr(0, 1000)
                }).then(function (res) {
                    res = res.body
                    if (res.statusCode == 200) {
                        Util.tipShow('提交成功！')
                        that.$router.push({name: 'personal'})
                    } else {
                        Util.tipShow(res.msg || '提交失败！')
                    }
                })
            }
        }
    }
</script>