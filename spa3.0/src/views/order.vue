<style>
    @import "../styles/page/order.css";
</style>
<template>
    <div v-show="!global.loading">
        <div class="page" id="order-list-page" v-if="!global.loading">
            <div class="page-title"><a class="back" @click="doClickBackPage()"></a>我的订单</div>
            <div class="order-list" ref="listEle" :style="{ height : (global.winHeight-5.411*global.winScale*16)+'px'}"
                 @scroll="doHandlerOrderListScroll()">
                <div v-for="(order,$index) in orderList" :key="order.id">
                    <router-link :to="{name:'orderDetail',query:{orderId:order.id}}" tag="div">{{order.clubName}}<span>{{order.downPayment>0?('￥'+order.downPayment+'元'):''}}</span><span>{{order.status | orderStatusFilter('name')}}</span>
                    </router-link>
                    <router-link :to="{name:'orderDetail',query:{orderId:order.id}}" tag="div">
                        <div>选择技师<span>{{order.techId ? order.techName : '到店安排'}}<span v-if="order.techId">[<strong>{{order.techSerialNo || ""}}</strong>]</span></span>
                        </div>
                        <div>选择项目<span>{{order.serviceItemName || "到店选择"}}</span></div>
                        <div>到店时间<span>{{order.appointTime | date2FullDate}}</span></div>
                        <div v-if="order.orderType=='paid'&&(order.status=='submit' || order.status=='accept' || order.status=='complete')"
                             v-show="order.qrShow">
                            <img :src='order.qrCodeUrl'/>
                            <div>预约号：{{order.orderNo}}</div>
                        </div>
                    </router-link>
                    <a class='paid' v-if="order.orderType=='paid' && order.status=='unpaid'"
                       @click="doClickPaid($index)">支付</a>
                    <a class='reminder' v-if="order.status=='submit'" @click="doClickReminder(order)">催单</a>
                    <a class='inquiries' v-if="order.status=='accept'" @click="doClickInquiries(order)">问询</a>
                    <router-link class='comment'
                                 v-if="order.status=='complete' && order.techId && order.commented == 'N'"
                                 :to="{name:'orderDetail',query:{orderId:order.id}}">点评
                    </router-link>
                    <a class='refunded' v-if="order.orderType=='paid' && order.status=='refund'"
                       @click="doClickRefuncQuery($index)">查询</a>
                    <router-link class='reAppoint' v-if="order.status=='error'"
                                 :to="{name:'confirmOrder',query:{orderId:order.id,clubId:order.clubId,downPayment:order.downPayment,customerName:encodeURIComponent(order.customerName),itemId:order.itemId,techId:order.techId}}">
                        预约
                    </router-link>
                    <a class='refund'
                       v-if="order.orderType=='paid' && (order.status=='refundfailure' || order.status=='reject' || order.status=='overtime' || order.ststus=='error')"
                       @click="doClickRefund(order)">退款</a>
                    <span class='expandBtn'
                          v-if="order.orderType=='paid' && (order.status=='submit' || order.status=='accept' || order.status=='complete')"
                          @click="doShowQrCode(order)" :class="{expand:order.qrShow}">{{order.qrShow?'收起':'展开'}}</span>
                </div>

                <div class="data-load-tip" :class="{ none : !showDataLoadTip }"><i></i>
                    <div>加载数据</div>
                </div>
                <div class="finish-load-tip" :class="{ none : !showFinishLoadTip }">
                    <div>已经加载全部数据</div>
                </div>
                <div class="nullData" v-show="orderList.length==0 && !isAddData">
                    <div></div>
                    <div>暂无内容...</div>
                </div>
            </div>
            <div id="refundDialog" :class="{ hide:!showRefundDlg }">
                <div>
                    <p>
                        系统消息
                    </p>
                    <p>
                        {{refundInfo}}
                    </p>
                    <div>
                        确定
                    </div>
                </div>
            </div>
            <div id="reAppointDlg" :class="{ hide:!showAppointDlg }">
                <div>
                    <p>
                        系统消息
                    </p>
                    <p>
                        您预约的技师（{{busyTechName}}）太抢手啦，被别人先预约了~。
                        <br/>
                        改约其它时间无需再次付费哦~
                    </p>
                    <div>
                        <div>取消</div>
                        <div>预约</div>
                    </div>
                </div>
            </div>
        </div>
        <tel-detail v-if="global.clubTelephone.length>0" :telephone="global.clubTelephone"></tel-detail>
    </div>
</template>
<script>
    import {Global} from '../libs/global'
    import {eventHub} from '../libs/hub'
    import Util from '../libs/util'
    import OrderStatusFilter from '../filters/order-status-filter'
    import Date2FullDate from '../filters/order-date-to-full-date'
    import TelDetail from '../components/tel-detail.vue'

    export default {
        components: {
            'tel-detail': TelDetail
        },
        filters: {
            orderStatusFilter: OrderStatusFilter,
            date2FullDate: Date2FullDate
        },
        data () {
            return {
                getOrderListUrl: '../api/v2/profile/user/order/list',
                paidOrderUrl: '../api/v2/wx/pay/paid_order_immediately',
                global: Global.data,
                orderList: [],
                isDataAddEnd: false,
                isAddData: false,
                showDataLoadTip: false,    // 显示数据正在加载
                showFinishLoadTip: false,  // 显示已经加载完成
                currPage: 1,
                pageSize: 10,

                // === 退款信息
                refundInfo: '您的退款申请已提交，退款将在3个工作日内退回支付账号。',
                showRefundDlg: false,
                busyTechName: '',
                showAppointDlg: false,
                payAuthCode: '',     // 微信授权码
                paramData: null,     // 自动支付的参数
                storeDataList: ['orderList', 'currPage', 'showFinishLoadTip', 'isDataAddEnd']
            }
        },
        mounted () {
            var _this = this
            var pageData = _this.global.pageData['orderList']

            if (pageData) {
                setTimeout(function () {
                    _this.$refs.listEle.scrollTop = pageData['scrollTop']
                }, 100)
            }
            _this.paramData = Util.sessionStorage('order-list-param') || null
            _this.payAuthCode = _this.global.currPage.query.code

            if (_this.paramData && _this.payAuthCode) {
                _this.doClickPaid(+_this.paramData)
                _this.$http.post('../api/v2/wx/oauth2/user/openid', {
                    code: _this.payAuthCode,
                    scope: 'snsapi_base',
                    wxmp: '9358',
                    userType: 'user',
                    state: 'order-list'
                }).then((result) => {
                    result = result.body
                    if (result.statusCode == 200) {
                        Util.removeSessionStorage('order-list-param')
                        _this.doClickPaid(_this.paramData)
                    } else if (result.statusCode == '935801') {
                        Util.getOauthCode('', '9358', 'order-list', 'base')
                    } else {
                        Util.tipShow(result.msg || '获取openId失败！')
                    }
                })
            }
        },
        created () {
            var _this = this
            var pageData = _this.global.pageData['orderList']

            if (pageData) {
                for (var key in pageData) {
                    _this[key] = pageData[key]
                }
            } else {
                _this.global.loading = true
                _this.$http.get(_this.getOrderListUrl, {
                    params: {
                        page: _this.currPage,
                        pageSize: _this.pageSize,
                        clubId: _this.global.clubId
                    }
                }).then((res) => {
                    _this.global.loading = false
                    res = res.body
                    if (res && res.respData) {
                        _this.doHandlerOrderListData(res.respData)
                        _this.orderList = res.respData
                    } else {
                        Util.tipShow(_this.global.loadError)
                        _this.$router.back()
                    }
                }, function () {
                    Util.tipShow(_this.global.loadError)
                    _this.$router.back()
                })
            }
        },
        methods: {
            doClickBackPage () {
                this.$router.back()
            },
            queryOrderList (page) {
                var _this = this
                if (_this.isAddData) {
                    return
                }
                _this.isAddData = true
                page = page || _this.currPage + 1

                // 更新数据加载提示
                _this.showDataLoadTip = true
                _this.showFinishLoadTip = false
                _this.isDataAddEnd = false

                _this.$http.get(_this.getOrderListUrl, {
                    params: {
                        page: page,
                        pageSize: _this.pageSize,
                        clubId: _this.global.clubId
                    }
                }).then((res) => {
                    res = res.body
                    if (res && res.respData) {
                        _this.doHandlerOrderListData(res.respData)

                        if (page == 1) {
                            _this.orderList = res.respData
                            if (res.respData.length == 0) {
                                _this.isDataAddEnd = true
                            }
                        } else {
                            _this.orderList.push(...res.respData)
                            if (res.respData.length < _this.pageSize) {
                                _this.isDataAddEnd = true
                                _this.showFinishLoadTip = true
                            }
                        }
                        _this.currPage = page
                        _this.isAddData = false
                        _this.showDataLoadTip = false
                    } else {
                        Util.tipShow(_this.global.loadError)
                    }
                }, () => Util.tipShow(_this.global.loadError))
            },
            doHandlerOrderListData (list) {
                list.forEach(function (v) {
                    v.qrShow = v.qrShow || false
                })
            },
            doHandlerOrderListScroll () { // 数据列表往下滑动加载的处理
                var _this = this
                var listEle = _this.$refs.listEle
                if (!_this.isDataAddEnd && listEle.scrollTop + listEle.clientHeight * 1.4 > listEle.scrollHeight) {
                    _this.queryOrderList()
                }
            },
            doShowQrCode (order) {
                order.qrShow = !order.qrShow
            },
            doClickPaid (index) { // 支付
                var _this = this
                var data = this.orderList[index]
                if (!_this.global.userAgent.isWX) {
                    Util.tipShow('请您打开微信登录\'9358\'公众号！')
                    return
                }
                if (!_this.global.isLogin) {
                    _this.$router.push({
                        name: 'login'
                    })
                } else {
                    _this.paidOrder(data, index)
                }
            },
            doClickRefund (data) { // 退款
                var _this = this
                if (!data.isOperating) {
                    data.isOperating = true
                    _this.$http.post('../api/v2/wx/pay/refund/applyfor', {
                        bizId: data.id,
                        businessChannel: 'link',
                        clubId: data.clubId,
                        tradeChannel: 'wx',
                        tradeYear: (data['createdAt'].match(/^(\d{4})/g)[0] || new Date().getFullYear()),
                        userId: _this.global.userId
                    }).then((res) => {
                        data.isOperating = false
                        res = res.body
                        if (res && res.respData) {
                            _this.refundInfo = '您的退款申请已提交，退款将在3个工作日内退回支付账号。'
                            _this.showRefundDlg = true
                            data.status = 'refund'
                        } else {
                            Util.tipShow(res.msg || '退款不成功，请重试！')
                        }
                    }, () => {
                        Util.tipShow('error')
                        data.isOperating = false
                    })
                }
            },
            doClickRefundQuery (index) { // 查询退款状态
                var _this = this
                var data = _this.orderList[index]

                if (!data.isOperating) {
                    data.isOperating = true
                    _this.$http.post('../api/v2/wx/pay/refund/applyfor', {
                        bizId: data.id,
                        businessChannel: 'link',
                        clubId: data.clubId,
                        tradeChannel: 'wx',
                        tradeYear: (data['createdAt'].match(/^(\d{4})/g)[0] || new Date().getFullYear()),
                        userId: _this.global.userId
                    }).then((res) => {
                        data.isOperating = false
                        res = res.body
                        if (res && res.respData) {
                            _this.refundInfo = res.msg
                            _this.showRefundDlg = true
                        } else {
                            Util.tipShow(res.msg || '查询失败，请重试！')
                        }
                    }, () => {
                        Util.tipShow('error')
                        data.isOperating = false
                    })
                }
            },
            doClickReminder () { // 催单
                var _this = this
                if (_this.global.clubTelephone.length == 0) {
                    Util.tipShow('暂无会所电话！')
                } else {
                    eventHub.$emit('change-tel-detail', true)
                }
            },
            doClickInquiries (data) { // 问询
                var _this = this
                if (data.techId) {
                    _this.$router.push({
                        name: 'chat',
                        query: {
                            techId: data.techId,
                            clubId: data.clubId
                        }
                    })
                } else {
                    if (_this.global.clubTelephone.length == 0) {
                        Util.tipShow('暂无会所电话！')
                    } else {
                        eventHub.$emit('change-tel-detail', true)
                    }
                }
            },
            paidOrder (data, index) {
                var _this = this
                _this.$http.post(_this.paidOrderUrl, {
                    bizId: data.id,
                    sessionType: _this.global.sessionType,
                    clubId: data.clubId,
                    businessChannel: 'link',
                    tradeChannel: 'wx',
                    downPayment: data.downPayment
                }).then((result) => {
                    result = result.body
                    if (result.statusCode == 200) {
                        result = JSON.parse(result.respData)
                        /* eslint-disable */
                        function onBridgeReady () {
                            WeixinJSBridge.invoke(
                                    'getBrandWCPayRequest', {
                                        'appId': result.appId,     // 公众号名称，由商户传入
                                        'timeStamp': result.timeStamp + '',  // 时间戳，自1970年以来的秒数
                                        'nonceStr': result.nonceStr, // 随机串
                                        'package': result.package,
                                        'signType': result.signType, // 微信签名方式
                                        'paySign': result.paySign
                                    },
                                    function (res) {
                                        if (res.err_msg.indexOf('ok') >= 0) { // 支付成功之后
                                            Util.tipShow('支付成功！')
                                            _this.$http.get('../api/v2/profile/user/order/view', {params: {id: data.id}}).then((response) => {
                                                response = response.body
                                                if (response.statusCode == 200) {
                                                    response = response.respData.order
                                                    if (response.statusNow == 'submit') {
                                                        data.orderNo = response.orderNo
                                                        data.qrCodeUrl = response.qrCodeUrl
                                                        data.status = 'submit' // 更新订单状态
                                                    } else if (response.statusNow == 'error') {
                                                        data.status = 'error'
                                                        _this.busyTechName = response.techName
                                                        _this.showAppointDlg = true
                                                    }
                                                } else {
                                                    Util.tipShow(response.msg)
                                                }
                                            })
                                            // =====  发消息  ===
                                        } else {
                                            Util.tipShow('未能成功支付！')
                                        }
                                    })
                        }

                        if (typeof WeixinJSBridge == 'undefined') {
                            document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false)
                        } else {
                            onBridgeReady()
                        }
                    } else if (result.statusCode == '935801') {
                        Util.sessionStorage('order-list-param', index)
                        Util.getOauthCode('', '9358', 'order-list', 'base')
                    } else {
                        Util.tipShow(result.msg || '支付预约请求失败！')
                    }
                })
            }
        },
        beforeDestroy: function () {
            // 保存当前页面状态数据
            var _this = this
            var pageData = _this.global.pageData
            if (!pageData.orderList) pageData.orderList = {}
            pageData = pageData.orderList
            var status
            for (var k = 0; k < _this.storeDataList.length; k++) {
                status = _this.storeDataList[k]
                pageData[status] = _this[status]
            }
            pageData['scrollTop'] = _this.$refs.listEle.scrollTop
        }
    }
</script>
