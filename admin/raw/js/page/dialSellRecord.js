require(["css!../../compressed/css/page/"+$$.rootVm.page+".css?"+$$.rootVm.currTime,"daterangepicker","!domReady"],function(){
    var vmId = $$.rootVm.page+"Ctrl"+(+new Date()),
        thisPage = $("#"+$$.rootVm.page+"Page"),
        pageSize = 20,
        currPage = 1,
        dataListPagination,
        $actId = getParamObj('actId'),
        $status =  $("select[name='status']"),
        $prizeType = $("select[name='prizeType']");

    thisPage.attr("ms-controller",vmId);
    $$.currPath.html("大转盘中奖记录");

    var vm = avalon.define({
        $id : vmId,
        actName : "",
        dataList : [],
        serviceItems:[],
        page:1,
        pageSize:20,
        newRequest:queryData
    });

    //////////////////分页器
    dataListPagination = new Pagination($("#dataListPagination"),{
        switchPage : function(page){
            vm.page = page;
            queryData(page);
        }
    });

    function queryData(page){
        currPage = page = page || 1;
        vm.page = currPage;
        vm.pageSize = pageSize;
        $.ajax({
            url : "api/v2/manager/luckyWheel/listRecord",
            type : "post",
            data : {
            	page : page,
                pageSize : pageSize,
                actId : $actId,
                prizeType: $prizeType.val(),
                status: $status.val()
            },
            success : function(res){
                if(res.statusCode == 200){
                    vm.dataList = res.respData.recordList;
                    vm.actName = res.respData.actName;
                    dataListPagination.refresh({ currPage : page , totalPage : res.pageCount });
                    avalon.scan(thisPage[0]);
                }
            }
        });
    }

    /////////////////////////////pageSize下拉的变化
    $("div.sizeOption>select").on("change",function(){
        pageSize = this.value;
        queryData();
    });

    queryData();
});