require(["css!../../compressed/css/page/"+$$.rootVm.page+".css?"+$$.rootVm.currTime,"daterangepicker","!domReady"],function(){
    var vmId = $$.rootVm.page+"Ctrl"+(+new Date()),
        thisPage = $("#"+$$.rootVm.page+"Page"),
        dataListPagination,
        $tel = $(".search input.user-tel"),
        $dateRangeSearch = $("div.time>input"),
        $dateBtns = $("div.time>a"),
        detailModal;

    thisPage.attr("ms-controller",vmId);
    $$.currPath.html("核销记录");

    var vm = avalon.define({
        $id : vmId,
        page: 1,
        pageSize: 20,
        dataList: [],
        currType: "",
        doSearch : function(){
            queryData(1);
        },
        pageSizeChange: function () {
            vm.pageSize = this.value;
            queryData(1);
        },
        typeChange: function () {
            vm.currType = this.value;
            queryData(1);
        },
        doViewDetail: function (index) {
            var record = vm.dataList[index];
            $.ajax({
                url: "api/v2/manager/checkinfo/record/detail",
                data: { recordId : record.id },
                success: function(res){
                    if(res.statusCode == 200){
                        res = res.respData;
                        var detailObj = vm.detailObj;
                        detailObj.telephone = record.telephone;
                        detailObj.businessTypeName = record.businessTypeName;
                        detailObj.verifyTime = record.verifyTime;
                        detailObj.operatorName = record.operatorName;
                        detailObj.verifyCode = res.record.verifyCode;
                        detailObj.avatarUrl = record.avatarUrl || "club-admin/img/common/head.jpg";
                        detailObj.userName = record.userName;
                        detailObj.sourceType = record.sourceType;
                        detailObj.info = res.detail || [];
                        detailModal.show();
                    } else {
                        msgAlert(res.msg || "查询详情失败！");
                    }
                }
            })
        },
        typeList: [
            {label: "全部类型", value: ""}
        ],
        detailObj: {
            telephone: '',
            businessTypeName: '',
            verifyTime: '',
            operatorName: '',
            verifyCode: '',
            avatarUrl: '',
            userName: '',
            sourceType: '',
            info: []
        }
    });

    //////////////////会所列表日期范围
    var initStartDate = new Date(), initEndDate = new Date();
    initStartDate.setTime(initStartDate.getTime()-30*24*60*60*1000);

    $dateRangeSearch.daterangepicker({ startDate : initStartDate , endDate : initEndDate },function(start,end){
        $dateBtns.removeClass("active");
        start = start.format("YYYY-MM-DD");
        end = end.format("YYYY-MM-DD");
        queryData(1,start, end);
    });

    //////////////////////////////日期范围的选择
    $dateBtns.click(function(){
        var $this = $(this);
        if(!$this.hasClass("active")){
            $this.siblings().removeClass("active");
            $this.addClass("active");
            var type = $this.attr("type");
            if(type != "all"){
                var initStartDate = new Date();
                initStartDate.setTime(initStartDate.getTime()-parseInt(type)*24*60*60*1000);
                $dateRangeSearch.data('daterangepicker').setStartDate(initStartDate);
                $dateRangeSearch.data('daterangepicker').setEndDate(new Date());
            }
            else{
                $dateRangeSearch.val("");
            }
            queryData(1);
        }
    });

    dataListPagination = new Pagination($("#dataListPagination"),{
        switchPage : function(page){
            queryData(page);
        }
    });

    detailModal = new Modal($("#detailModal"),{})

    $tel.on("input",function(){
        if(/\D/.test(this.value)){
            this.value=this.value.replace(/\D/g,'');
        }
        if(this.value.length>11){
            this.value = this.value.substring(0,11);
        }
    });

    function queryData(page, start, end){
        var  dateRange = formatDateRangeVal($dateRangeSearch.val());
        start = start || dateRange.start;
        end = end || dateRange.end;
        vm.page = page = page || 1;

        $.ajax({
            url: "api/v2/manager/checkinfo/record/list",
            data: {
                telephone: $tel.val(),
                type: vm.currType,
                endDate: end,
                startDate: start,
                page: page,
                pageSize: vm.pageSize
            },
            success: function(res){
                if(res.statusCode == 200){
                    vm.dataList = res.respData.data || [];
                    dataListPagination.refresh({ currPage : page , totalPage : res.pageCount });
                    avalon.scan(thisPage[0])
                }
            }
        })
    }

    function queryTypeList() {
        $.ajax({
            url: "api/v2/manager/checkinfo/type/list",
            success: function(res){
                if(res.statusCode == 200){
                    res = res.respData;
                    for(var k=0;k<res.length;k++){
                        vm.typeList.push({
                            label: res[k]["value"], value: res[k]["key"]
                        })
                    }
                }
            }
        })
    }

    queryData()
    queryTypeList()
});