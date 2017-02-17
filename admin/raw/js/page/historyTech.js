require(["css!../../compressed/css/page/"+$$.rootVm.page+".css?"+$$.rootVm.currTime,"area","dragsort","!domReady"],function(){
    var vmId = $$.rootVm.page+"Ctrl"+(+new Date()),
        thisPage = $("#"+$$.rootVm.page+"Page"),
        techName = $("#techName"),
        techNo = $("#techNo"),
        techNoOrName = $("#techNoOrName"),
        dataListPagination;

    thisPage.attr("ms-controller",vmId);
    $$.currPath.html("离职技师");

    var vm = avalon.define({
        $id : vmId,
        dataList : [],
        totalData : {
            "historyTechNum" : "0",
            "techCustomNum" : "0"
        },
        currPage : 1,
        pageSize : 10,
        doClickSearchBtn : function(){
            queryData(1);
        }
    });

    //////////////////分页器
    dataListPagination = new Pagination($("#dataListPagination"),{
        switchPage : function(page){
            vm.currPage = page;
            queryData(page);
        }
    });

    function queryData(page){
        $.ajax({
            url : "api/v2/manager/history_tech/list",
            //url : "club-admin/json/historyList.json",
            type:"POST",
            data : {
                page : page,
                pageSize : vm.pageSize,
                techNoOrName : techNoOrName.val()
            },
            success : function(res){
                if(res.statusCode == 200){
                    res = res.respData;
                    if(res){
                        vm.dataList = res.respBeanList || [];
                        dataListPagination.refresh({ currPage : page , totalPage : res.totalPage });
                    }else {
                        vm.dataList = []
                    }
                }else {
                    msgAlert(res.msg || "获取信息失败，请联系管理员")
                }
                avalon.scan(thisPage[0]);
            }
        });
    }

    function queryDataTotal(){
        $.ajax({
            url : "api/v2/manager/history_tech/total/list",
            data : {},
            success : function(res){
                if(res.statusCode == 200){
                    res = res.respData;
                    vm.totalData = res;
                }else {
                    msgAlert(res.msg || "获取信息失败，请联系管理员")
                }
            }
        });
    }

    queryData();
    queryDataTotal();
});