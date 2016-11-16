<style>
    @import '../styles/page/promotionsActivity.css';
</style>
<template>
    <div>
        <div class="page-back-btn" @click="doClickPageBack()" v-show="!global.loading"></div>
        <div class="page" id="promotions-activity-page" v-show="!global.loading">
            <div class="act-detail">
                <div class="act-bg"
                     :style="{ backgroundImage : 'url('+(actDetail.actLogoUrl || global.defaultBannerImgUrl)+')' }">
                    <div></div>
                </div>
                <div class="act-content">
                    <div class="act-title">
                        <div></div>
                        <span>{{actDetail.actTitle}}</span>
                        <router-link :to="{ name : 'technicianList' }">马上预约</router-link>
                    </div>
                    <div class="act-item">
                        <i></i>
                        <div>{{actDetail.startDate | dateToString(actDetail.endDate,'—')}}</div>
                    </div>
                    <div class="act-item">
                        <i></i>
                        <div>活动规则</div>
                    </div>
                    <div class="act-desc" v-html="actDetail.actContent"></div>
                </div>
            </div>
            <div class="other-act" v-if="otherActs.length>1">
                <div class="title">
                    <div></div>
                    <div>其他优惠</div>
                </div>
                <router-link v-if='act.actId !=actDetail.actId ' v-for="act in otherActs"
                             :to="{name :'promotionsActivity' , query : { id : act.actId }}">
                    <div :style="{ backgroundImage : 'url('+act.actLogoUrl+')' }"></div>
                    <div><i></i>{{act.actTitle}}</div>
                    <div>活动时间：{{act.startDate | dateToString(act.endDate,'—')}}</div>
                </router-link>
            </div>
        </div>
    </div>
</template>
<script>
    import {Global} from '../libs/global'
    import DateToString from '../filters/date-to-string'
    import Util from '../libs/util'

    module.exports = {
        data: function () {
            return {
                getDataUrl: '../api/v2/club/',
                global: Global.data,
                actDetail: {
                    actId: '',
                    actLogoUrl: null,
                    actTitle: '',
                    startDate: '',
                    endDate: '',
                    actContent: ''
                },
                otherActs: []
            }
        },
        created: function () {
            var _this = this
            var global = _this.global
            var query = global.currPage.query

            if (!query.id) {
                Util.tipShow(global.visitError)
                return _this.$router.back()
            }
            _this.getDataUrl += global.clubId + '/' + query.id + '/actdetail'
            _this.$http.get(_this.getDataUrl).then(function (res) {
                res = res.body
                if (res.statusCode == 200) {
                    res = res.respData
                    _this.actDetail = res.act
                    _this.otherActs = res.acts
                } else {
                    Util.tipShow(global.loadError)
                    _this.$router.back()
                }
            }, function () {
                Util.tipShow(global.loadError)
                _this.$router.back()
            })
        },
        filters: {
            dateToString: DateToString
        },
        methods: {
            doClickPageBack: function () { // 点击返回按钮
                history.back()
            }
        }
    }
</script>
