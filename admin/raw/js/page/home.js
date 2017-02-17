require(["css!../../compressed/css/page/"+$$.rootVm.page+".css?"+$$.rootVm.currTime,'daterangepicker',"!domReady"],function(){
    var vmId = $$.rootVm.page+"Ctrl"+(+new Date()),
        thisPage = $("body #"+$$.rootVm.page+"Page"),
        couponVerificationModal,
        searchTel = $("body #search-tel-input"),
        searchCouponNo = $("body #search-couponNo-input"),
        couponPagination,
        couponArr = [],
        orderVerificationModal,
        treatVerificationModal,
        luckyWheelVerificationModal,
        treatCodeInput = $('body #treatCodeInput'),
        moneyInput = $('body #moneyInput'),
        robProjectCodeInput = $('body #robProjectCodeInput'),
        dateRangeSearch = $("body #orderListDataTable>table>thead>tr.search>th>div.time>input"),
        dateBtns = $("body #orderListDataTable>table>thead>tr.search>th>div.time>a"),
        dataListPagination,
        refundModal,
        pageSize = 15,
        currPage = 1,
        confirmFastPayModal,
        $confirmFastPayRemark = $("#confirm-fast-pay-remark");

    thisPage.attr("ms-controller",vmId);
    $$.currPath.html("首页");

    var vm = avalon.define({
        $id : vmId,
        $statusObj:[
            { "value" : "" , "name" : "所有状态" },
            { "value" : "submit" , "name" : "待接受"},
            { "value" : "accept" , "name" : "已接受"},
            { "value" : "reject" , "name" : "拒绝"},
            { "value" : "complete" , "name" : "完成"},
            { "value" : "failure" , "name" : "失效"},
            { "value" : "overtime" , "name" : "超时"}
        ],
        $appointTypes:{
            appoint:'免费预约',
            phone:'电话预约',
            1:'定金预约',
            2:'全额预约'
        },
        $refundOrder:null,      //退款的订单
        currStatus:'',
        currAppointType: '',
        paidOrderSwitch : 'on',
        couponSwitch : 'off',
        orders : [],
        freeCount : 0,
        inProgressCount : 0,
        coupons : [],
        settledList:[],
        couponsPage : 1,
        verifyCouponSuaId : "",
        selectCoupon : [],
        selectOrder : {
            id : "",
            customerName : "",
            phoneNum : "",
            appointTime : "",
            createdAt : "",
            techName : "",
            downPayment : "",
            statusName : "",
            status : "reject",
            isExpire : false
        },
        menuAuth : { ///权限控制
            couponVerify : false,
            paidOrderVerify : false,
            treatVerify : false,
            robProjectVerify:false,
            fastPayRemind: false
        },
        isCrossInner:false,     //是否对接内网
        fastPayDataList: [],     // 买单数据
        doPaidOrderVerify : function(){
            clearOrderSearch();
            orderVerificationModal.show();
        },
        doUsePaidOrder : function(type){///核销/过期预付费订单
            if(vm.selectOrder.id){
                $.ajax({
                    url : "api/v2/manager/checkinfo/paid_order/save",
                    data : {processType : type , orderNo : vm.currUseCode },
                    success : function(res){
                        if(res.statusCode == 200){
                            msgAlert(type == "verified" ? "使用成功！" : "操作成功！",true);
                            orderVerificationModal.close();
                        }
                        else{
                            msgAlert(res.msg || "操作失败！");
                        }
                    }
                });
            }
        },
        doCouponVerify : function(){
            //////还原到初始值
            clearCouponSearch();
            couponVerificationModal.show();
        },
        couponVerifyType : "tel",
        doSearchCoupon : function(showMsg){
            if(vm.couponVerifyType == "tel"){////以手机号码搜索
                if(!/^1[34578]\d{9}$/.test(searchTel.val())){
                    searchTel.focus();
                    couponVerificationModal.showTip("请输入正确的手机号码！");
                    return;
                }
                $.ajax({
                    url : "api/v2/manager/user/coupons",
                    data : { phoneNum : searchTel.val() },
                    success : function(res){
                        //////还原到初始值
                        clearCouponSearch();

                        if(res.statusCode == 200){
                            handlerGetCoupon(res.respData.canUseList);
                            vm.settledList = res.respData.settledList;
                        }
                        else if(res.msg && showMsg){
                            msgAlert(res.msg);
                        }
                    }
                });
            }
            else{
                if(!/^\d{12}$/.test(searchCouponNo.val())){////以券优惠码搜索
                    searchCouponNo.focus();
                    couponVerificationModal.showTip("请输入12位券优惠码！");
                    return;
                }
                var url = "api/v2/manager/user/coupon/view";
                if(vm.currCodeType == 'service_item_coupon'){
                    url = 'api/v2/manager/checkinfo/service_item_coupon/detail';
                }
                $.ajax({
                    url : url,
                    data : { couponNo : searchCouponNo.val()},
                    success : function(res){
                        //////还原到初始值
                        clearCouponSearch();

                        if(res.statusCode == 200){
                            if(vm.currCodeType == 'service_item_coupon'){
                                res.respData.actAmount = ((res.respData.actAmount - 0 || 0 ) / 100).toFixed(2);
                                res.respData.useTypeName = res.respData.useTypeName || '项目券';
                                handlerGetCoupon([res.respData]);
                            }else{
                                handlerGetCoupon([res.respData.userAct]);
                            }
                        }
                        else if(res.msg && showMsg){
                            msgAlert(res.msg);
                        }
                    }
                });
            }
        },
        deSelectVerifyCoupon : function(suaId,index){
            if(vm.verifyCouponSuaId == suaId){
                vm.verifyCouponSuaId = '';
                vm.selectCoupon = [];
                return;
            }
            vm.verifyCouponSuaId = suaId;
            /////当前选中对象
            /*vm.selectCoupon.consumeMoneyDescription = vm.coupons[index].consumeMoneyDescription;
            vm.selectCoupon.getDate = vm.coupons[index].getDate;
            vm.selectCoupon.useTimePeriod = vm.coupons[index].useTimePeriod;
            vm.selectCoupon.actContent = vm.coupons[index].actContent;
            vm.selectCoupon.couponNo = vm.coupons[index].couponNo;*/
            vm.selectCoupon = [vm.coupons[index]];
        },
        doTreatVerify: function () {
            treatCodeInput.val('');
            moneyInput.val('');
            treatVerificationModal.show();
        },
        doSearchQuery : function(){///点击搜索按钮
            queryOrderData();
        },
        doSearchEnter: function (e) {
            if(e.keyCode == 13){
                queryOrderData();
            }
        },
        doChangeStatusQuery : function(){////状态改变时触发查询
            vm.currStatus = this.value;
            queryOrderData();
        },
        doHandlerUsePaidOrder : function(id,type,orderNo){
            $$.maskPage.addClass("active")
            $.ajax({
                url : "api/v2/manager/checkinfo/paid_order/save",
                data : { id : id , processType : type , orderNo : orderNo },
                success : function(res){
                    if(res.statusCode == 200){
                        msgAlert(type == "verified" ? "使用成功！" : "操作成功！",true);
                        queryOrderData(currPage);
                    }
                    else{
                        msgAlert(res.msg || "操作失败！");
                    }
                },
                complete: function () {
                    $$.maskPage.removeClass("active")
                }
            });
        },
        doHandlerOrder: function(id,processType){
            $$.maskPage.addClass("active")
            $.ajax({
                url : "api/v2/manager/club/order",
                data : { id : id , processType : processType },
                success : function(res){
                    if(res.statusCode == 200){
                        msgAlert("操作成功！",true);
                        queryOrderData(currPage);
                    }
                    else{
                        msgAlert(res.msg || "操作失败！");
                    }
                },
                complete: function () {
                    $$.maskPage.removeClass("active")
                }
            });
        },
        doHandlerRefund: function (index) {
            vm.$refundOrder = vm.orders[index];
            refundModal.show();
        },

        //=======  核销相关  ======
        useAllCode:'',
        currUsePhone:'',
        currUseCode:'',
        currUseType: '',    // 手机号或优惠码 tel,coupon
        currCodeType: '',   // 优惠码类型
        defaultInfo: {
            title:'',
            detail:[]
        },
        luckyWheelInfo: [],
        useAllKeyPress: function (e) {
            if(e.keyCode == 13){
                useAllByCode();
            }
        },
        useAllClick: function(){
            useAllByCode();
        },

        //买单数据
        fastPayDataList: [],
        confirmType: '',
        confirmOrderId: '',
        showCanSelectTechList: false,
        canSelectTechList: [],
        confirmFastPayTitle: "确认",
        doConfirmPay: function(confirmType,orderId){ // 确认
            vm.confirmType = confirmType;
            if(confirmType == "pass"){
                vm.confirmFastPayTitle = "确认"
            } else {
                vm.confirmFastPayTitle = "异常"
            }
            $.ajax({
                url: "api/v2/manager/fastpay/order/status/edit",
                data: {
                    orderId: orderId
                },
                success: function(res){
                    if(res.statusCode == 200){
                        res = res.respData;
                        vm.showCanSelectTechList = false;
                        var canSelectTechList = [], k = 0, allList = res.allTechList || [], orderTechIds = res.orderTechIds || [], notSelectIds={};
                        for(;k<orderTechIds.length;k++){
                            notSelectIds[orderTechIds[k]] = true
                        }
                        if(orderTechIds.length>1){
                            vm.showCanSelectTechList = true;
                        }
                        for(k=0;k<allList.length;k++){
                            if(allList[k].id != res.scanTechId){
                                allList[k].isSelected = notSelectIds[allList[k].id];
                                canSelectTechList.push(allList[k])
                            }
                        }
                        vm.canSelectTechList = canSelectTechList;
                        vm.confirmOrderId = orderId;
                        $confirmFastPayRemark.val("");
                        confirmFastPayModal.show()
                    }
                }
            })
        },
        doSelectPayTech: function(index){
            var tech = vm.canSelectTechList[index];
            tech.isSelected = !tech.isSelected;
        },
        doSwitchShowTechList: function(){
            vm.showCanSelectTechList = true
        },
        doRefreshFastPay: function(){
            queryFastPayData()
        },
        appointTypeChange: function () {
            vm.currAppointType = this.value;
            queryOrderData();
        }
    });

    function useAllByCode(){
        var codeInput = $('#check-code-input');
        if(codeInput.val().trim().length < 11) return msgAlert("请输入手机号码或12位券优惠码！");
        if(codeInput.val().trim().length == 11 && !/^1[34578]\d{9}$/.test(codeInput.val().trim())){
            return msgAlert("请输入正确的手机号码！");
        }
        vm.useAllCode = codeInput.val().trim();
        $.ajax({
            url:'api/v2/manager/checkinfo/type/get',
            data:{
                code:vm.useAllCode
            },
            success: function (result) {
                if(result.statusCode == 200){
                    //coupon-优惠券;order-付费预约;pay_for_other-请客;paid_service_item-抢项目;service_item_coupon-项目券;phone-电话号码
                    switch (result.respData){
                        case 'phone':{
                            vm.currCodeType = 'phone';
                            vm.currUseType = 'tel';
                            vm.currUsePhone = vm.useAllCode;
                            vm.currUseCode = '';
                            vm.couponVerifyType = 'tel';

                            clearCouponSearch();
                            couponVerificationModal.show();
                            setTimeout(function () {
                                vm.doSearchCoupon(1);
                            },200);
                        }break;
                        case 'coupon':{
                            vm.currCodeType = 'coupon';
                            vm.currUseType = 'coupon';
                            vm.couponVerifyType = 'couponNo';
                            vm.currUsePhone = '';
                            vm.currUseCode = vm.useAllCode;

                            clearCouponSearch();
                            couponVerificationModal.show();
                            setTimeout(function () {
                                vm.doSearchCoupon(1);
                            },200);
                        }break;
                        case 'service_item_coupon':{
                            vm.currCodeType = 'service_item_coupon';
                            vm.currUseType = 'coupon';
                            vm.couponVerifyType = 'couponNo';
                            vm.currUsePhone = '';
                            vm.currUseCode = vm.useAllCode;

                            clearCouponSearch();
                            couponVerificationModal.show();
                            setTimeout(function () {
                                vm.doSearchCoupon(1);
                            },200);
                        }break;
                        case 'order':{
                            vm.currCodeType = 'order';
                            vm.currUseCode = vm.useAllCode;
                            $.ajax({
                                url : "api/v2/manager/checkinfo/paid_order/detail",
                                data : { orderNo : vm.currUseCode },
                                success : function(res){
                                    if(res.statusCode == 200){
                                        vm.selectOrder = res.respData;
                                        vm.selectOrder.downPaymentYuan = ( vm.selectOrder.downPayment / 100 ).toFixed(2);
                                        orderVerificationModal.show();
                                    }
                                    else{
                                        msgAlert(res.msg || "未能查询到预付费订单！");
                                        clearOrderSearch();
                                    }
                                }
                            });
                        }break;
                        case 'pay_for_other':
                        case 'paid_service_item':{
                            vm.currCodeType = result.respData;
                            vm.currUseCode = vm.useAllCode;
                            $.ajax({
                                url:'api/v2/manager/checkinfo/common/detail',
                                data:{
                                    code: vm.currUseCode,
                                    type: vm.currCodeType
                                },
                                success: function (res) {
                                    if(res.statusCode == 200){
                                        vm.defaultInfo.title = res.respData.title;
                                        vm.defaultInfo.detail = res.respData ? [res.respData] : [];
                                        $('body #moneyInput').val('');
                                        treatVerificationModal.show();
                                    }else{
                                        msgAlert(res.msg || '查询数据失败');
                                    }
                                }
                            });
                        }break;
                        case 'lucky_wheel':{
                            vm.currCodeType = result.respData;
                            vm.currUseCode = vm.useAllCode;
                            $.ajax({
                                url:'api/v2/manager/checkinfo/lucky_wheel/detail',
                                data:{
                                    verifyCode: vm.currUseCode
                                },
                                success: function (res) {
                                    if(res.statusCode == 200){
                                        vm.luckyWheelInfo = res.respData ? [res.respData] : [];
                                        luckyWheelVerificationModal.show();
                                    }else{
                                        msgAlert(res.msg || '查询数据失败');
                                    }
                                }
                            });
                        }break;
                    }
                    $('#check-code-input').val('');
                }else{
                    msgAlert(result.msg || '查询数据失败');
                }
            }
        });
    }

    //////////////////日期范围
    var initStartDate = new Date(), initEndDate = new Date();
    initStartDate.setTime(initStartDate.getTime()-30*24*60*60*1000);

    dateRangeSearch.daterangepicker({ startDate : initStartDate, endDate : initEndDate },function(start,end){
        dateBtns.removeClass("active");
        queryOrderData(1,start.format("YYYY-MM-DD"),end.format("YYYY-MM-DD"))
    });

    //////////////////分页器
    dataListPagination = new Pagination($("body #dataListPagination"),{
        switchPage : function(page){
            queryOrderData(page);
        }
    });

    /////////////////////////////pageSize下拉的变化
    $("body #orderListDataTable>table>thead>tr:eq(0)>th>div>select").on("change",function(){
        pageSize = this.value;
        queryOrderData();
    });

    //////////////////////////////日期范围的选择
    dateBtns.click(function(){
        var $this = $(this);
        if(!$this.hasClass("active")){
            $this.siblings().removeClass("active");
            $this.addClass("active");
            var type = $this.attr("type");
            if(type != "all"){
                var initStartDate = new Date();
                initStartDate.setTime(initStartDate.getTime()-parseInt(type)*24*60*60*1000);
                dateRangeSearch.data('daterangepicker').setStartDate(initStartDate);
                dateRangeSearch.data('daterangepicker').setEndDate(new Date());
            }
            else{
                dateRangeSearch.val("");
            }
            queryOrderData();
        }
    });

    function handlerGetCoupon(resCoupons){
        var pIndex;
        for(var i=0;i<resCoupons.length;i++){
            pIndex = parseInt(i/4);///页索引
            if(couponArr[pIndex] == undefined) couponArr[pIndex] = [];
            if(resCoupons[i].couponType === 'service_item' && !resCoupons[i].actAmount){
                resCoupons[i].actAmount = resCoupons[i].actValue;
            }
            couponArr[pIndex].push(resCoupons[i]);
        }
        vm.coupons = couponArr[0] || [];
        if(couponArr.length>0) couponPagination.refresh({ currPage : 1 , totalPage : couponArr.length });
        vm.couponsPage = couponArr.length;
    }

    function clearCouponSearch(){
        couponArr = [];
        vm.coupons = [];
        vm.settledList = [];
        vm.couponsPage = 1;
        vm.verifyCouponSuaId = "";
        vm.selectCoupon = [];
        /*vm.selectCoupon.consumeMoneyDescription = "";
        vm.selectCoupon.getDate = "";
        vm.selectCoupon.useTimePeriod = "";
        vm.selectCoupon.actContent = "";
        vm.selectCoupon.couponNo = "";*/
    }

    function clearOrderSearch(){
        vm.selectOrder.id = "";
        vm.selectOrder.customerName = "";
        vm.selectOrder.phoneNum = "";
        vm.selectOrder.appointTime = "";
        vm.selectOrder.createdAt = "";
        vm.selectOrder.techName = "";
        vm.selectOrder.downPayment = "";
        vm.selectOrder.statusName ="";
        vm.selectOrder.status ="reject";
        vm.selectOrder.isExpire = false;
    }

    $.ajax({
        url : "api/v2/manager/paidOrder/openStatus",
        success : function(res){
            if(res.statusCode == 200){
                res = res.respData;
				res.payAppointment = res.paidOrderSystemSwitch;
				res.openStatus = res.paidOrderClubSwitch;
                //res.payAppointment = res.payAppointment == "Y" ? "on" : "off";
                if (res.payAppointment == "on" && res.openStatus == "on") {
                    vm.paidOrderSwitch = "on";
                }
                vm.couponSwitch = res.couponSwitch;
                /////////////////////////////////////////////
                $.ajax({  
                    url : "api/v2/manager/current/menu/children/list",
                    data : {
                        menuId : $$.menuCodeObj["home"]
                    },
                    success : function(authRes){
                        if(authRes.statusCode == 200){
                            authRes = authRes.respData;
                            var tObj = {};
                            for(var k=0; k<authRes.allResourcesCodes.length;k++){
                                tObj[authRes.allResourcesCodes[k]] = false;
                            }
                            for(k=0;k<authRes.resourcesList.length;k++){
                                tObj[authRes.resourcesList[k]["code"]] = true;
                            }
                            for(var item in tObj){
                                vm.menuAuth[item] = tObj[item];
                            }

                            if(vm.menuAuth.fastPayRemind){
                                queryFastPayData();
                                window.refreshFastPayDataTimer = setInterval(function(){
                                    $.ajax({
                                        url: "api/v2/club/order/notify/check",
                                        data: { type: "fast_pay" },
                                        success: function(res){
                                            if(res.statusCode == 200 && res.respData=="Y"){
                                                queryFastPayData()
                                            }
                                        }
                                    })
                                },10000)
                            }
                        }
                    }
                })
                queryHomeData();
            }
        }
    });

    function queryHomeData(){
        $.ajax({
            url : "info/data",
            type : "post",
            success : function(res){
                if(res.statusCode == 200){
                    res = res.respData;
                    //vm.orders = res.orders;
                    vm.banners = res.data.banners;
                    vm.freeCount = res.data.free || 0;
                    vm.inProgressCount = res.data.inProgress || 0;
                    avalon.scan(thisPage[0]);
                    queryOrderData();
                }
            }
        });
    }

    function queryOrderData(page,start,end){
        currPage = page = page || 1;
        var  dateRange = formatDateRangeVal(dateRangeSearch.val()),
          startDate = start || dateRange.start,
          endDate = end || dateRange.end;
        $.ajax({
            url : "info/orderData",
            type : "post",
            data : { startTime : startDate , endTime : endDate, page : page , pageSize : pageSize, serialNo : $("body #search-serial").val() , status : vm.currStatus, orderType: vm.currAppointType , flagIndex : "index" },
            success : function(res){
                if(res.respData){
                    res.respData.forEach(function (obj) {
                        if(obj.refundStatus){
                            obj.status = obj.refundStatus;
                        }
                    });
                    vm.orders = res.respData;
                    dataListPagination.refresh({ currPage : page , totalPage : res.pageCount });
                    avalon.scan(thisPage[0]);
                }
            }
        });
    }

    couponVerificationModal = new Modal($("body #couponVerificationModal"),{
        doClickOkBtn : function(){/////核销
            if(vm.verifyCouponSuaId != ""){
                couponVerificationModal.loading();
                var url = 'api/v2/manager/checkinfo/coupon/save';
                if(vm.selectCoupon[0].couponType === 'service_item'){
                    url = 'api/v2/manager/checkinfo/service_item_coupon/save';
                }
                $.ajax({
                    url : url,
                    data : { couponNo : vm.selectCoupon[0].couponNo },
                    success : function(res){
                        couponVerificationModal.loading("hide");
                        if(res.statusCode == 200){
                            msgAlert(res.msg,true);
                            if(vm.couponVerifyType == 'tel'){
                                vm.doSearchCoupon(false);
                            }else{
                                couponVerificationModal.close();
                            }
                        }
                        else{
                            msgAlert(res.msg || "核销失败！");
                        }
                    }
                });
            }
        }
    });

    couponPagination = new Pagination($("body #couponPagination"),{///分页
        switchPage : function(page){
            vm.coupons = couponArr[page-1];
            couponPagination.refresh({ currPage : page , totalPage : couponArr.length });
        }
    });

    $("body #couponSearchTypeSelect").on("change",function(){
        vm.couponVerifyType = this.value;
    });

    searchTel.on("input",function(){//////输入限制
        if (/\D/.test(this.value)) {
            this.value = this.value.replace(/\D/g, '');
        }
        if (this.value.length == 1 && this.value != 1) {
            this.value = "";
        }
        if (this.value.length == 2 && !/^1[34578]$/.test(this.value)) {
            this.value = 1;
        }
        if (this.value.length > 11) {
            this.value = this.value.substring(0, 11);
        }
    }).on("keypress",function(event){
        if(event.keyCode == 13){
            vm.doSearchCoupon(true);
        }
    });

    searchCouponNo.on("input",function(){///////输入限制
        if (/\D/.test(this.value)) {
            this.value = this.value.replace(/\D/g, '');
        }
        if (this.value.length > 12) {
            this.value = this.value.substring(0, 12);
        }
    }).on("keypress",function(event){
        if(event.keyCode == 13){
            vm.doSearchCoupon(true);
        }
    });

    orderVerificationModal = new Modal($("body #orderVerificationModal"));

    treatVerificationModal = new Modal($("body #treatVerificationModal"),{
        doClickOkBtn : function(){/////核销
            verifiedTreat();
        }
    });

    $("body #treatVerificationModal").on("keypress",'#moneyInput',function(event){
        if(event.keyCode == 13){
            verifiedTreat();
        }
    });

    //=== 核销抢项目或请客 ===
    function verifiedTreat(){
        var param = {},moneyInput = $('body #moneyInput');
        if(moneyInput.length > 0){
            if(moneyInput.val() == ''){
                return treatVerificationModal.showTip('消费金额不能为空');
            }else{
                param.amount = (parseFloat(moneyInput.val())*100).toFixed(0);
            }
        }
        param.code = vm.currUseCode;
        param.type = vm.currCodeType;
        treatVerificationModal.loading();
        $.ajax({
            url:'api/v2/manager/checkinfo/common/save',
            type:'post',
            data:param,
            success: function (result) {
                treatVerificationModal.loading('hide');
                if(result.statusCode == '200'){
                    msgAlert('核销成功',true);
                    treatVerificationModal.close();
                }else{
                    msgAlert(result.msg || '核销失败，请检查授权码或金额是否出错后再次核销');
                }
            }
        });
    }

    //====== 核销大转盘实物奖品 =======
    luckyWheelVerificationModal = new Modal($('body #luckyWheelVerificationModal'),{
        doClickOkBtn : function(){/////核销
            luckyWheelVerificationModal.loading();
            $.ajax({
                url:'api/v2/manager/checkinfo/lucky_wheel/save',
                type:'post',
                data:{
                    verifyCode:vm.currUseCode,
                },
                success: function (result) {
                    luckyWheelVerificationModal.loading('hide');
                    if(result.statusCode == '200'){
                        msgAlert('核销成功',true);
                        luckyWheelVerificationModal.close();
                    }else{
                        msgAlert(result.msg || '核销失败，请检查核销码是否出错后再次核销');
                    }
                }
            });
        }
    });

    //=== 对接内网 ===
    //==查询是否对接了内网==
    $.ajax({
        url:'club/inner/provider/get',
        success: function (result) {
            if(result.statusCode == 200){
                vm.isCrossInner = true;
                avalon.scan(thisPage[0]);
            }
        }
    });
    //=== 退款确认框
    refundModal = new Modal( $('body #refundModal'),{
        doClickOkBtn : function(){
            var order = vm.$refundOrder.$model;
            $.ajax({
                url:'api/v2/wx/pay/manager/refund/applyfor',
                type:'post',
                data:{
                    bizId:order.id,
                    businessChannel:'link',
                    clubId:$$.clubId,
                    tradeChannel:'wx'
                },
                success: function (result) {
                    if(result.statusCode == 200){
                        msgAlert(result.msg, true);
                    }else{
                        msgAlert(result.msg);
                    }
                    refundModal.close();
                }
            });
        }
    });

    function queryFastPayData(){
        $.ajax({
            url: "api/v2/manager/fastpay/order/list",
            type: "post",
            data: {
                techName: "",
                isRemind: 'Y',
                pageSize: 100000
            },
            success: function(res){
                if(res.statusCode == 200){
                    vm.fastPayDataList = res.respData || [];
                }
            }
        })
    }

    //在线买单
    confirmFastPayModal = new Modal($("#confirmFastPayModal"),{
        doClickOkBtn: function () {
            confirmFastPayModal.loading();
            var selectTechs = [], i, list = vm.canSelectTechList;
            for(i=0;i<list.length;i++){
                if(list[i].isSelected){
                    selectTechs.push(list[i].id)
                }
            }
            $.ajax({
                url: "api/v2/manager/fastpay/order/status/update",
                data: {
                    description: $confirmFastPayRemark.val(),
                    orderId: vm.confirmOrderId,
                    status: vm.confirmType,
                    techIds: selectTechs.join(',')
                },
                type: "post",
                success: function(res){
                    if(res.statusCode == 200){
                        queryFastPayData();
                        confirmFastPayModal.close();
                        msgAlert(res.msg || "操作成功！",true);
                    } else {
                        confirmFastPayModal.showTip(res.msg || "操作失败！")
                    }
                },
                complete: function(){
                    confirmFastPayModal.loading('hide')
                }
            })
        }
    })

    queryOrderData();
});