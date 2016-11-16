<style>
    @import '../styles/page/account.css';
</style>
<template>
    <div class="page" id="account-page" v-show="!global.loading" :style="{ height : global.winHeight+'px' }">
        <div class="page-title"><a class="back" @click="doClickPageBack()"></a>所有账户</div>
        <router-link class="jump-qrcode" v-show="dataList.length>0" :to="{ name : 'qrPayCode' }">
            <div></div>
            <div>付款二维码</div>
            <div></div>
        </router-link>
        <div class="list"
             :style="{ height : (global.winHeight-(dataList.length>0 ? 5.722 : 2.611)*global.winScale*16)+'px' }">
            <router-link class="list-item" v-for="item in dataList"
                         :to="{ name : 'accountDetail', query : { accountId : item.id } }">
                <div class="header">
                    <span :style="{ backgroundImage : 'url('+(item.clubImage || global.defaultClubLogo )+')' }"></span><span>{{ item.clubName }}</span><i></i>
                </div>
                <div class="item expire">
                    <div><span>可用金额</span><span>{{ item.amount | MoneyFormatter }}</span></div>
                    <div><span>冻结金额</span><span>{{ item.freezeAmount | MoneyFormatter }}</span></div>
                </div>
            </router-link>
            <div class="data-load-tip" :class="{ none : !showDataLoadTip }"><i></i>
                <div>加载数据</div>
            </div>
            <div class="finish-load-tip" :class="{ none : !showFinishLoadTip }">
                <div>已经加载全部数据</div>
            </div>
            <div class="nullData" v-show="dataList.length==0 && !showDataLoadTip">
                <div></div>
                <div>暂无内容...</div>
            </div>
        </div>
    </div>
</template>
<script>
    import {Global} from '../libs/global'
    import Util from '../libs/util'
    import MoneyFormatter from '../filters/money-formatter'

    module.exports = {
        data: function () {
            return {
                global: Global.data,
                getRecordsUrl: '../api/v2/finacial/accounts',
                dataList: [],
                showDataLoadTip: false, // 显示数据正在加载
                showFinishLoadTip: false // 显示已经加载完成
            }
        },
        created: function () {
            var _this = this
            var global = _this.global
            _this.showDataLoadTip = true
            global.loading = true
            _this.$http.get(_this.getRecordsUrl).then(function (res) {
                _this.showDataLoadTip = false
                res = res.body
                global.loading = false
                if (res.statusCode == 200) {
                    res = res.respData
                    _this.dataList = res
                    _this.showFinishLoadTip = res.length > 0
                } else {
                    Util.tipShow(res.msg || global.loadError)
                    return _this.$router.back()
                }
            }, function () {
                Util.tipShow(global.loadError)
                global.loading = false
                return _this.$router.back()
            })
        },
        methods: {
            doClickPageBack: function () {
                history.back()
            }
        },
        filters: {
            MoneyFormatter: MoneyFormatter
        }
    }
</script>
