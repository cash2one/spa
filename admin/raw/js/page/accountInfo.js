require(["css!../../compressed/css/page/"+$$.rootVm.page+".css?"+$$.rootVm.currTime,"daterangepicker","!domReady"],function(){
    var vmId = $$.rootVm.page+"Ctrl"+(+new Date()),
        thisPage = $("#"+$$.rootVm.page+"Page"),
        dateRangeSearch = $("section#accountInfoPage div.header>div>input");

    thisPage.attr("ms-controller",vmId);
    $$.currPath.html("账户金额");

    var vm = avalon.define({
        $id : vmId,
        dataObj:{
            balance:0,
            sum: 0,
            settled: 0,
            unsettled:0,
            transfer: 0
        },
        allData: [],
        dataAllList: [],

        unsettledList:[],

        settledList:[],

        transferList:[],

        currType:'all',     //all,notSettle,settled,transfer

        changeSelectType: function (type) {
            if(vm.currType !== type){
                vm.currType = type;
            }
        },
        filterType: function () {
            switch (this.value){
                //settled: 0,  unsettled:0, transfer: 0
                case 'settled':{
                    vm.dataAllList = vm.settledList.$model;
                }break;
                case 'unsettled':{
                    vm.dataAllList = vm.unsettledList.$model;
                }break;
                case 'transfer':{
                    vm.dataAllList = vm.transferList.$model;
                }break;
                default:{
                    vm.dataAllList = vm.allData.$model;
                }
            }
        }
    });

    var initStartDate = new Date(),minDate = new Date();
    initStartDate.setTime(initStartDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    minDate.setMonth(minDate.getMonth() - 3);
    dateRangeSearch.daterangepicker({startDate: initStartDate, endDate: new Date(),minDate:minDate,maxDate:new Date()}, function (start, end) {
        $("section#accountInfoPage div.times>a").removeClass("active");
        queryAllData(start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'));
    });
    
    $("section#accountInfoPage div.times>a").click(function () {
        var $this = $(this);
        if (!$this.hasClass("active")) {
            $this.siblings().removeClass("active");
            $this.addClass("active");
            var initStartDate = new Date();
            initStartDate.setTime(initStartDate.getTime() - parseInt($this.attr("type")) * 24 * 60 * 60 * 1000);
            dateRangeSearch.data('daterangepicker').setStartDate(initStartDate);
            dateRangeSearch.data('daterangepicker').setEndDate(new Date());
            queryAllData();
        }
    });

    $.ajax({
        url:'club/financial/club/settle/sum',
        success: function (result) {
            if(result.statusCode == 200){
                vm.dataObj.balance = result.respData.balance;
                vm.dataObj.sum = result.respData.sum;
                vm.dataObj.settled = result.respData.settled;
                vm.dataObj.unsettled = result.respData.unsettled;
                vm.dataObj.transfer = result.respData.transfer;
                avalon.scan(thisPage[0]);
            }else{
                msgAlert(result.msg || '查询数据失败');
            }
        }
    });

    function queryAllData(start,end){
        var dateRange = formatDateRangeVal(dateRangeSearch.val()),
          startDate = start || dateRange.start,
          endDate = end || dateRange.end;

        $.ajax({
            url: "club/financial/club/settle/records",
            data: {
                startDate: startDate,
                endDate: endDate
            },
            success: function (res) {
                if (res.statusCode == 200) {
                    vm.allData = res.respData;
                    var settledList = [],unsettledList = [],transferList = [];
                    res.respData.forEach(function (data) {
                        switch (data.tradeType){
                            //settled: 0,  unsettled:0, transfer: 0
                            case 'settled':{
                                settledList.push(data);
                            }break;
                            case 'unsettled':{
                                unsettledList.push(data);
                            }break;
                            case 'transfer':{
                                transferList.push(data);
                            }break;
                        }
                    });
                    vm.dataAllList = res.respData;
                    vm.settledList = settledList;
                    vm.unsettledList = unsettledList;
                    vm.transferList = transferList;
                    avalon.scan(thisPage[0]);
                }else{
                    msgAlert(res.msg || '查询失败');
                }
            }
        })
    }
    queryAllData();

});