require(["css!../../compressed/css/page/"+$$.rootVm.page+".css?"+$$.rootVm.currTime,"!domReady"],function(){
    var vmId = $$.rootVm.page+"Ctrl"+(+new Date()),
        thisPage = $("#"+$$.rootVm.page+"Page"),
        dataListPagination;
    thisPage.attr("ms-controller",vmId);

    var vm = avalon.define({
        $id : vmId,
        pageSize: 20,
        currPage : 1,
        canSend: false,
        typeObj : {
            ordinaryCoupon : '优惠券',
            oneYuan : '一元夺',
            timeLimit : '限时抢',
            luckyWheel : '转盘',
            journal: '电子期刊'
        },
        pageSizeChange: function(){
            vm.pageSize = this.value;
            queryData();
        },
        dataList : []
    });

    //////////////////分页器
    dataListPagination = new Pagination($("#dataListPagination"),{
        switchPage : function(page){
            queryData(page);
        }
    });

    function queryData(page){
        vm.currPage = page = page || 1;
        $.ajax({
            url : "api/v2/manager/group/message/list",
            data : {  page : page , pageSize : vm.pageSize },
            success : function(res){
                if(res.statusCode == 200){
                    vm.dataList = res.respData;
                    dataListPagination.refresh({ currPage : page , totalPage : res.pageCount });
                    avalon.scan(thisPage[0]);
                }
            }
        });
    }

    queryData();

    $.ajax({
        url : "api/v2/manager/group/message/edit/info",
        success : function(res){
            if(res.statusCode == 200){
                res = res.respData;
                vm.canSend = res.switch == 'on';
            }
        }
    });
});