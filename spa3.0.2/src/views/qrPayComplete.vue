<style>
    @import '../styles/page/qrPayComplete.css';
</style>
<template>
    <div class="page" id="qrpay-complete-page" v-show="!global.loading" :style="{ height : global.winHeight+'px' }">
        <div class="page-title"><a class="back" @click="doClickPageBack()"></a>支付完成</div>
        <div class="success-info">
            <div>
                <span><i></i><spa>成功支付</spa></span><span><span>{{ money }}</span><span>元</span></span>
            </div>
        </div>
        <div class="comment-star">
            <div>
                <div>环境</div>
                <div>
                    <div class="stars-area" @click="doClickCommentStar(0,$event)">
                        <div :style="{ width : environmentScore+'%' }"></div>
                    </div>
                </div>
                <div>非常好</div>
            </div>
            <div>
                <div>服务</div>
                <div>
                    <div class="stars-area" @click="doClickCommentStar(1,$event)">
                        <div :style="{ width : serviceScore+'%' }"></div>
                    </div>
                </div>
                <div>非常好</div>
            </div>
        </div>
        <div class="comment-title">会所评价</div>
        <textarea class="comment-text" placeholder="您的建设很重要，来点评下吧！" v-model="commentStr"></textarea>
        <div class="submit-btn" @click="doClickSubmitBtn()">提交</div>
    </div>
</template>
<script>
    import { Global } from '../libs/global'
    import Util from '../libs/util'

    module.exports = {
        data: function () {
            return {
                global: Global.data,
                submitUrl: '../api/v2/profile/user/feedback/create',
                scoreObj: ['非常差', '很差', '一般', '很好', '非常好'],
                clubId: '',
                money: '',
                environmentScore: 100,
                serviceScore: 100,
                commentStr: '',
                payToken: ''
            }
        },
        created: function () {
            var that = this
            var global = that.global
            var pageParams = global.currPage.query
            that.money = pageParams.money
            that.clubId = pageParams.clubId
            that.payToken = pageParams.payToken
            if (!that.clubId && global.pageMode == 'club') {
                that.clubId = global.clubId
            }
            if (!that.money || !that.clubId) {
                Util.tipShow(global.visitError)
                that.$router.back()
            }
        },
        methods: {
            doClickPageBack: function () {
                history.back()
            },
            doClickCommentStar: function (type, event) {
                var that = this
                var v = Math.ceil((event.offsetX || event.layerX) / (8.611 * 16 * that.global.winScale * 0.2))
                if (type == 0) {
                    that.environmentScore = v * 20
                } else {
                    that.serviceScore = v * 20
                }
            },
            doClickSubmitBtn: function () {
                var that = this
                that.$http.post(that.submitUrl, {
                    'clubId': that.clubId,
                    'environmentalScore': that.environmentScore,
                    'serviceScore': that.serviceScore,
                    'comments': encodeURIComponent(that.commentStr.substr(0, 1000)),
                    token: that.payToken
                }).then(function (res) {
                    res = res.body
                    if (res.statusCode == 200) {
                        Util.tipShow('提交成功！')
                        that.$router.push({name: 'home'})
                    } else {
                        Util.tipShow(res.msg || '提交失败！')
                    }
                })
            }
        }
    }
</script>