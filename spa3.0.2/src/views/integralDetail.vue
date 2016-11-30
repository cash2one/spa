<style>
    @import '../styles/page/integralDetail.css';
</style>
<template>
    <div class="page" id="integral-detail-page" :style="{ height : global.winHeight+'px' }">
        <div class="page-title"><a class="back" @click="doClickPageBack()"></a>积分中心</div>
        <div class="total">
            <div>现有积分<router-link :to="{ name : 'integralExplain' }">积分规则</router-link><i></i></div>
            <b>{{amount}}<span>(冻结:{{freezeAmount}})</span></b>
        </div>
        <div class="tip" v-show="isNoIntegral && !showDataLoadTip">您没有积分了，<router-link :to="{ name : 'integralExplain' }">如何获取积分</router-link></div>
        <div class="title" v-show="!isNoIntegral">积分记录</div>
        <div class="list" ref="listEle" v-show="!isNoIntegral" :style="{ height : (global.winHeight-10.36*global.winScale*16)+'px' }" @scroll="doHandlerListScroll()">
            <div class="list-item" v-for="item in dataList">
                <div>{{ item.businessCategoryDesc }}
                    <div :class="{ add : item.amount>0 }">{{ item.amount>0 ? "+" : "" }}{{ item.amount }}</div>
                </div>
                <div>
                    <div :class="{ active : item.peerName }" :style="{ backgroundImage : 'url('+(item.peerAvatar || global.defaultHeader)+')' }"></div>
                    <div>{{ item.peerName || "" }}</div>
                    <span>{{ item.createDatetime }}</span>
                </div>
            </div>
            <div class="data-load-tip" :class="{ none : !showDataLoadTip }"><i></i><div>加载数据</div></div>
            <div class="finish-load-tip" :class="{ none : !showFinishLoadTip }"><div>已经加载全部数据</div></div>
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
                amount: '-',
                freezeAmount: 0,
                dataList: [],
                currPage: 0,
                pageSize: 10,
                isNoIntegral: true,
                listEle: null,
                clubId: '',
                showDataLoadTip: false, // 显示数据正在加载
                showFinishLoadTip: false, // 显示已经加载完成
                isDataAddEnd: false, // 数据是否已加载完
                isAddData: false // 数据是否正在加载
            }
        },
        created: function () {
            var that = this
            var global = that.global
            that.clubId = global.currPage.query.clubId || global.clubId

            if (global.clubCfg.accountSwitch == null || that.clubId != global.clubId) { // 获取开关状态
                Global.getClubSwitches(that.clubId).then(function (cfg) {
                    if (!cfg.creditSwitch) {
                        Util.tipShow('积分系统未开启！')
                        return that.$router.back()
                    } else {
                        that.getUserAccount()
                        global.loading = false
                    }
                })
            } else {
                that.getUserAccount()
                global.loading = false
            }
        },
        mounted: function () {
            this.queryRecord()
        },
        methods: {
            doClickPageBack: function () {
                history.back()
            },
            getUserAccount: function () {
                var that = this
                that.$http.get('../api/v2/credit/user/account', {
                    params: {
                        clubId: that.clubId,
                        userType: 'user'
                    }
                }).then(function (res) {
                    res = res.body
                    if (res.statusCode == 200) {
                        res = res.respData
                        if (res && res.length != 0) {
                            that.amount = res[0].amount
                            that.freezeAmount = res[0].freezeAmount
                        } else {
                            Util.tipShow('获取账户积分信息失败！')
                        }
                    }
                })
            },
            queryRecord: function (page) {
                var that = this
                var global = that.global
                if (that.isAddData) {
                    return
                }
                that.isAddData = true
                page = page || that.currPage + 1

                // 更新数据加载提示
                that.showDataLoadTip = true
                that.showFinishLoadTip = false
                that.isDataAddEnd = false

                that.$http.get('../api/v2/credit/user/records', {
                    params: {
                        page: page,
                        pageSize: that.pageSize,
                        clubId: that.clubId,
                        userType: 'user'
                    }
                }).then(function (res) {
                    res = res.body
                    if (res) {
                        res = (res.statusCode != '200') ? [] : res['respData']
                        if (page == 1) {
                            that.dataList = res
                            if (res.length == 0) {
                                that.isDataAddEnd = true
                            } else {
                                that.isNoIntegral = false
                            }
                        } else {
                            for (var i = 0; i < res.length; i++) {
                                that.dataList.push(res[i])
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
                        Util.tipShow(global.loadError)
                    }
                }, function () {
                    Util.tipShow(global.loadError)
                })
            },
            doHandlerListScroll: function () {
                var that = this
                var listEle = that.$refs.listEle
                if (!that.isDataAddEnd && listEle.scrollTop + listEle.clientHeight * 1.4 > listEle.scrollHeight) {
                    that.queryRecord()
                }
            }
        }
    }
</script>