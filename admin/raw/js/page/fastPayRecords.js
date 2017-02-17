require(["css!../../compressed/css/page/"+$$.rootVm.page+".css?"+$$.rootVm.currTime,"daterangepicker","!domReady"],function(){
    var vmId = $$.rootVm.page+"Ctrl"+(+new Date()),
        thisPage = $("#"+$$.rootVm.page+"Page"),
        dateRangeSearch = $("div.dataTable div.time>input"),
        dateBtns = $("div.dataTable div.time>a"),
        dataListPagination,
        confirmModal,
        $techInfo = $('.tech-info'),
        $confirmRemark = $('#confirm-remark'),
        revokeModal;

    thisPage.attr("ms-controller",vmId);
    $$.currPath.html("全部买单记录");

    var vm = avalon.define({
        $id : vmId,
        pageSize: 20,
        currPage: 1,
        dataList : [],
        statusObj: {
            paid: '未确认', pass: '已确认', unpass: '异常'
        },
        confirmType: '',
        confirmOrderId: '',
        showCanSelectTechList: false,
        canSelectTechList: [],
        confirmTitle: "确认",
        changePageSize: function(){
            vm.pageSize = this.value;
            queryData(1)
        },
        doSearch: function () {
            queryData(1)
        },
        doSelectTech: function (index){
            var tech = vm.canSelectTechList[index];
            tech.isSelected = !tech.isSelected;
        },
        doConfirm: function(confirmType,orderId){
            vm.confirmType = confirmType;
            if(confirmType == "pass"){
                vm.confirmTitle = "确认"
            } else {
                vm.confirmTitle = "异常"
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
                        $confirmRemark.val("");
                        confirmModal.show()
                    }
                }
            })
        },
        doRevoke: function(orderId){
            vm.confirmOrderId = orderId;
            revokeModal.show();
        },
        doSwitchShowTechList: function(){
            vm.showCanSelectTechList = true
        }
    });

    //==== 注册一过滤器：分转元，保留两位小数 ====
    avalon.filters.techNameSplit = function (str) {
        return str ? str.replace(/,/g,"<br>").replace(/\[/g,'<span>[').replace(/]/g,']</span>') : '';
    };

    //////////////////日期范围
    var initStartDate = new Date(), initEndDate = new Date();
    initStartDate.setTime(initStartDate.getTime()-30*24*60*60*1000);

    dateRangeSearch.daterangepicker({ startDate : initStartDate, endDate : initEndDate },function(start,end){
        dateBtns.removeClass("active");
        queryData(1,start.format("YYYY-MM-DD"),end.format("YYYY-MM-DD"))
    });

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

    confirmModal = new Modal($("#confirmModal"),{
        doClickOkBtn: function () {
            confirmModal.loading();
            var selectTechs = [], i, list = vm.canSelectTechList;
            for(i=0;i<list.length;i++){
                if(list[i].isSelected){
                    selectTechs.push(list[i].id)
                }
            }
            $.ajax({
                url: "api/v2/manager/fastpay/order/status/update",
                type: "post",
                data: {
                    description: $confirmRemark.val(),
                    orderId: vm.confirmOrderId,
                    status: vm.confirmType,
                    techIds: selectTechs.join(',')
                },
                success: function(res){
                    if(res.statusCode == 200){
                        queryData(vm.currPage);
                        confirmModal.close();
                        msgAlert(res.msg || "操作成功！",true);
                    } else {
                        confirmModal.showTip(res.msg || "操作失败！")
                    }
                },
                complete: function(){
                    confirmModal.loading('hide')
                }
            })
        }
    })

    revokeModal = new Modal($("#revokeModal"),{
        doClickOkBtn: function(){
            revokeModal.loading();
            $.ajax({
                url: "api/v2/manager/fastpay/order/status/update",
                data: {
                    orderId: vm.confirmOrderId,
                    status: 'paid'
                },
                type: "post",
                success: function(res){
                    if(res.statusCode == 200){
                        revokeModal.close();
                        queryData(vm.currPage);
                        msgAlert(res.msg || "操作成功！",true);
                    } else {
                        revokeModal.showTip(res.msg || "操作失败！");
                    }
                },
                complete: function(){
                    revokeModal.loading('hide');
                }
            });
        }
    })

    function queryData(page, start, end){
        page = page || 1;
        var  dateRange = formatDateRangeVal(dateRangeSearch.val()),
            startDate = start || dateRange.start,
            endDate = end || dateRange.end,
            techInfo = $techInfo.val();
        if(techInfo){
            $techInfo.val(techInfo.trim())
        }
        $.ajax({
            url: "api/v2/manager/fastpay/order/list",
            type: "post",
            data: {
                startDate: startDate,
                endDate: endDate,
                page: page,
                pageSize: vm.pageSize,
                techName: $techInfo.val(),
                isRemind: 'N'
            },
            success: function(res){
                if(res.statusCode == 200){
                    vm.dataList = res.respData || [];
                    vm.currPage = page;
                    dataListPagination.refresh({ currPage : page , totalPage : res.pageCount });
                }
                avalon.scan(thisPage[0])
            }
        })
    }

    queryData(1)
});