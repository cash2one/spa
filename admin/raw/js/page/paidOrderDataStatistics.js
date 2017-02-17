require(["css!../../compressed/css/page/paidOrderDataStatistics.css?"+$$.rootVm.currTime,"daterangepicker","!domReady"],function(){
    var vmId = $$.rootVm.page+"Ctrl"+(+new Date()),
        thisPage = $("#"+$$.rootVm.page+"Page"),
        dataListPagination,
        statisticsDateRange = $("div.paidOrderTab>table>thead>tr>th>div.time>input"),
        statisticsDateBtns = $("div.paidOrderTab>table>thead>tr>th>div.time>a");

    thisPage.attr("ms-controller",vmId);
    $$.currPath.html("付费预约");

    var vm = avalon.define({
        paidOrderSwitch : "off",
        $id : vmId,
        pageSize : 20,
        currPage : 1,
        lastMonth: '',
        $statusObj:[
            { "value" : "" , "name" : "所有状态" },
            //{ "value":"unpaid", "name":'待支付'},
            { "value" : "submit" , "name" : "待接新单"},
            //{ "value" : "cancel" , "name" : "取消"},
            { "value" : "reject" , "name" : "已拒绝"},
            { "value" : "overtime" , "name" : "超时"},
            { "value" : "accept" , "name" : "即将到店"},
            { "value" : "complete" , "name" : "已核销"},
            { "value" : "failure" , "name" : "爽约"}
            //{ "value" : "refund" , "name" : "退款中"},
            //{ "value" : "refunded" , "name" : "退款完成"},
            //{ "value" : "refundfailure" , "name" : "退款失败"},
            //{ "value" : "error" , "name" : "下单失败"},
           // { "value" : "expire" , "name" : "过期"},
            //{ "value" : "process" , "name" : "付款处理中"}
        ],
        $appointTypes:{
            appoint:'免费预约',
            phone:'电话预约',
            1:'定金预约',
            2:'全额预约'
        },
        orders : [],
        currStatus:'',
        currAppointType: '',
        countData: {
            noHandlerCount: '',
            submitCount: '',
            rejectCount: '',
            overtimeCount: '',
            hasAcceptCount : '',
            acceptCount: "",
            completeCount: '',
            expireCount: '',
            incomeCount: '',
            noHandlerSum: '',
            submitSum: '',
            rejectSum: '',
            overtimeSum: '',
            hasAcceptSum: '',
            acceptSum: '',
            clubCompleteSum: '',
            clubExpireSum: '',
            clubIncomeSum: '',
            techCompleteSum: '',
            techExpireSum: '',
            techIncomeSum: ''
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
        appointTypeChange: function () {
            vm.currAppointType = this.value;
            queryOrderData();
        }
    });

    //////////////////日期范围
    var initStartDate = new Date(), initEndDate = new Date();
    var thisMonth = initStartDate.getMonth();
    vm.lastMonth = thisMonth == 0 ? 12 : thisMonth;
    initStartDate.setDate(1);

    statisticsDateRange.daterangepicker({ startDate : initStartDate, endDate : initEndDate },function(start,end){
        statisticsDateBtns.removeClass("active");
        queryData(start.format("YYYY-MM-DD"),end.format("YYYY-MM-DD"));
        queryOrderData(1,start.format("YYYY-MM-DD"),end.format("YYYY-MM-DD"));
    });

    //////////////////分页器
    dataListPagination = new Pagination($("#dataListPagination"),{
        switchPage : function(page){
            queryOrderData(page);
        }
    });

    /////////////////////////////pageSize下拉的变化
    $("#orderListDataTable>table>thead>tr:eq(0)>th>div>select").on("change",function(){
        vm.pageSize = this.value;
        queryOrderData();
    });

    //////////////////////////////日期范围的选择
    $("div.time>a").click(function(){
        var $this = $(this);
        var dateObj = statisticsDateRange;
        if(!$this.hasClass("active")){
            $this.siblings().removeClass("active");
            $this.addClass("active");
            var type = $this.attr("type");

            if(type != "all"){
                var startDate = new Date();
                var endDate = new Date();

                if(type == "thisMonth"){ // 本月
                    startDate.setDate(1);
                }
                else if(type == "lastMonth"){//上月
                    endDate.setTime(endDate.getTime()-endDate.getDate()*24*60*60*1000);
                    startDate.setTime(endDate.getTime());
                    startDate.setDate(1);
                }
                else{
                    startDate.setTime(startDate.getTime()-parseInt(type)*24*60*60*1000);
                }
                dateObj.data('daterangepicker').setStartDate(startDate);
                dateObj.data('daterangepicker').setEndDate(endDate);
            }
            else{//所有
                dateObj.val("");
            }

            queryData();
            queryOrderData();
        }
    });

    function queryOrderData(page,start,end){
        vm.currPage = page = page || 1;
        var  dateRange = formatDateRangeVal(statisticsDateRange.val()),
            startDate = start || dateRange.start,
            endDate = end || dateRange.end;
        $.ajax({
            url : "info/orderData",
            type : "post",
            data : { startTime : startDate , endTime : endDate, page : page , pageSize : vm.pageSize, serialNo : $("#search-serial").val() , status : vm.currStatus,orderType:vm.currAppointType, flagIndex : "" },
            success : function(res){
                if(res.respData){
                    res.respData.forEach(function (obj) {
                        if(obj.refundStatus){
                            obj.status = obj.refundStatus;
                        }
                    });
                    vm.orders = res.respData;
                    dataListPagination.refresh({ currPage : page , totalPage : res.pageCount });
                }
            }
        });
    }

    function queryData(start,end){
        var  dateRange = formatDateRangeVal(statisticsDateRange.val()),
            startDate = start || dateRange.start,
            endDate = end || dateRange.end;
        $.ajax({
            url : "api/v2/manager/datastatistics/club/paid_order",
            type : "post",
            data : { startDate : startDate , endDate : endDate },
            success : function(res){
                if(res.statusCode == 200){
                    res = res.respData;
                    if(res){
                        var countData = vm.countData
                        for(var dataItem in res){
                            res[dataItem] = (res[dataItem] || 0) - 0
                        }

                        ////订单数
                        countData.noHandlerCount = res.submitCount+res.rejectCount+res.overtimeCount;//未处理订单
                        countData.submitCount = res.submitCount; //待接受订单
                        countData.rejectCount = res.rejectCount; //拒绝订单
                        countData.overtimeCount = res.overtimeCount; //超时订单

                        countData.hasAcceptCount = res.acceptCount+res.completeCount+res.expireCount;//已接受订单
                        countData.acceptCount = res.acceptCount; // 未完成订单
                        countData.completeCount = res.completeCount; // 已核销订单
                        countData.expireCount = res.expireCount; // 过期订单

                        countData.incomeCount = res.completeCount+res.expireCount;//应结算收入

                        ////会所收入
                        countData.noHandlerSum = res.submitSum+res.rejectSum+res.overtimeSum;//未处理订单
                        countData.submitSum = res.submitSum; //待接受订单
                        countData.rejectSum = res.rejectSum; //拒绝订单
                        countData.overtimeSum = res.overtimeSum; //超时订单

                        countData.hasAcceptSum = res.acceptSum+res.clubCompleteSum+res.clubExpireSum;//已接受订单
                        countData.acceptSum = res.acceptSum; // 未完成订单
                        countData.clubCompleteSum = res.clubCompleteSum; // 已核销订单
                        countData.clubExpireSum = res.clubExpireSum; // 过期订单

                        countData.clubIncomeSum = res.clubCompleteSum+res.clubExpireSum;//应结算收入

                        ////技师收入
                        countData.techCompleteSum = res.techCompleteSum; // 已核销订单
                        countData.techExpireSum = res.techExpireSum; // 过期订单
                        countData.techIncomeSum = res.techCompleteSum+res.techExpireSum;//应结算收入
                    }
                    avalon.scan(thisPage[0]);
                }
            }
        })
    }

    $.ajax({
        url : "api/v2/manager/paidOrder/openStatus",
        success : function(res){
            if(res.statusCode == 200){
                res = res.respData;
                if (res.paidOrderSystemSwitch == "on" && res.paidOrderClubSwitch == "on" ) {
                    vm.paidOrderSwitch = "on";
                    queryData();
                    queryOrderData();
                }
                else{
                    avalon.scan(thisPage[0]);
                }
            }
        }
    });
});