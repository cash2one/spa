require(["css!../../compressed/css/page/"+$$.rootVm.page+".css?"+$$.rootVm.currTime,"daterangepicker","!domReady"],function(){
    var vmId = $$.rootVm.page+"Ctrl"+(+new Date()),
        thisPage = $("#"+$$.rootVm.page+"Page"),
        dateRangeSearch = $("div.dataTable div.time>input"),
        dateBtns = $("div.dataTable div.time>a"),
        dataListPagination,
        $customerInfo = $('.customer-info'),
        actId = getParamObj("id"),
        checkRecordsModal;

    thisPage.attr("ms-controller",vmId);
    $$.currPath.html("次卡销售记录");

    var vm = avalon.define({
        $id : vmId,
        pageSize: 20,
        currPage: 1,
        dataList : [],

        cardList: [], // 次卡列表
        serviceItemList: [], //项目列表
        techList: [], // 技师列表
        statusList: [{value: 1, label : "可用"}, {value: 2, label: "已过期"}, {value: 3, label: "已用完"}], // 所有状态

        currCard: actId || "", // 当前所选的次卡
        currServiceItem: "", // 当前所选的项目
        currTech: "", // 当前所选的技师
        currStatus: "", // 当前所选的状态

        changePageSize: function(){
            vm.pageSize = this.value;
            queryData(1)
        },
        doSearch: function () {
            queryData(1)
        },
        doSearchAll: function () { // 查询所有
            vm.currCard = "";
            vm.currServiceItem = "";
            vm.currTech = "";
            vm.currStatus = "";
            $customerInfo.val("");
            if(dateBtns[3].className=="active"){
                queryData(1);
            } else {
                dateBtns[3].click();
            }
        },
        changeCard: function () { // 更改次卡
            vm.currCard = this.value;
            queryData(1)
        },
        changeServiceItem: function () { // 更改服务项目
            vm.currServiceItem = this.value;
            queryData(1)
        },
        changePackage: function () { // 更改套餐
            vm.currPackage = this.value;
            queryData(1)
        },
        changeTech: function () { // 更改技师
            vm.currTech = this.value;
            queryData(1)
        },
        changeStatus: function () { // 更改状态
            vm.currStatus = this.value;
            queryData(1)
        },
        checkObj: {
            userName: '-',
            telephone: '-',
            planName: '-',
            paidCount: '-',
            giveCount: '-',
            cardName: '-',
            list: []
        },
        doShowCheckRecord: function(index){
            var obj = vm.dataList[index];
            vm.checkObj.userName = obj.userName;
            vm.checkObj.telephone = obj.telephone;
            vm.checkObj.planName = obj.planName;
            vm.checkObj.paidCount = obj.paidCount;
            vm.checkObj.giveCount = obj.giveCount;
            vm.checkObj.cardName = obj.name;
            $.ajax({
                url: "api/v2/manager/once_card/verify/record/list",
                data: {
                    orderId: obj.id
                },
                success: function(res){
                    if(res.statusCode == 200){
                        vm.checkObj.list = res.respData;
                        checkRecordsModal.show()
                    } else {
                        msgAlert(res.msg || "查询核销记录失败！")
                    }
                }
            })
        }
    });

    //////////////////日期范围
    var initStartDate = new Date(), initEndDate = new Date();

    dateRangeSearch.daterangepicker({ startDate : initStartDate, endDate : initEndDate },function(start,end){
        dateBtns.removeClass("active");
        queryData(1,start.format("YYYY-MM-DD"),end.format("YYYY-MM-DD"))
    });
    dateRangeSearch.val("")

    //////////////////分页器
    dataListPagination = new Pagination($("#dataListPagination"),{
        switchPage : function(page){
            queryData(page);
        }
    });

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
            queryData(1);
        }
    });

    checkRecordsModal = new Modal($("#checkRecordsModal"),{
        doClickOkBtn: function(){
            checkRecordsModal.close()
        }
    })

    function queryData(page, start, end){
        page = page || 1;
        var  dateRange = formatDateRangeVal(dateRangeSearch.val()),
            startDate = start || dateRange.start,
            endDate = end || dateRange.end;
        var customerInfo = $customerInfo.val();
        if(customerInfo){
            $customerInfo.val(customerInfo.trim())
        }
        $.ajax({
            url: "api/v2/manager/once_card/order/list",
            type: "post",
            data: {
                startDate: startDate,
                endDate: endDate,
                page: page,
                pageSize: vm.pageSize,
                userName: $customerInfo.val(),
                activityId: vm.currCard,
                status: vm.currStatus,
                techId: vm.currTech,
                itemId: vm.currServiceItem
            },
            success: function(res){
                if(res.statusCode == 200){
                    vm.currPage = page;
                    vm.dataList = res.respData || [];
                    dataListPagination.refresh({ currPage : page , totalPage : res.pageCount });
                }
                avalon.scan(thisPage[0])
            }
        })
    }

    // 查询所有次卡列表
    $.ajax({
        url: "api/v2/manager/once_card/select/activity/list",
        success: function(cardsRes){
            if(cardsRes.statusCode == 200){
                vm.cardList = cardsRes.respData
            }
        }
    })

    // 查询所有技师
    $.ajax({
        url: "api/v2/manager/club/select/tech/list",
        success: function(techsRes){
            if(techsRes.statusCode == 200){
                vm.techList = techsRes.respData
            }
        }
    })

    // 查询所有项目
    $.ajax({
        url: "api/v2/manager/club/select/item/list",
        success: function(itemsRes){
            if(itemsRes.statusCode == 200){
                vm.serviceItemList = itemsRes.respData
            }
        }
    })

    queryData(1);
});