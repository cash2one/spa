require(["css!../../compressed/css/page/"+$$.rootVm.page+".css?"+$$.rootVm.currTime,"!domReady"],function(){
    var vmId = $$.rootVm.page+"Ctrl"+(+new Date()),
        thisPage = $("#"+$$.rootVm.page+"Page"),
        pageSize = 20,
        currPage = 1,
        dataListPagination,
        confirmModal,
        currChangeData,
        currChangeDom,
        searchMemberName = $("#searchMemberName");
    thisPage.attr("ms-controller",vmId);
    $$.currPath.html("客户列表");


    var vm = avalon.define({
        $id : vmId,
        dataList : [],
        currMemberTypeId:'',
        page:1,
        pageSize:20,
        editModalTitle : "添加会员",
        doModifyType: function (index) {
            currChangeData = vm.dataList[index];
            currChangeDom = this;
            confirmModal.show();
        },
        searchMember: function () {
            queryData(1);
        }
    });

    //////////////////分页器
    dataListPagination = new Pagination($("#dataListPagination"),{
        switchPage : function(page){
            queryData(page);
        }
    });

    function queryData(page,start,end){
        currPage = page = page || 1;
        vm.page = currPage;
        vm.pageSize = pageSize;
        $.ajax({
            url : "api/v2/manager/history_tech/customer/list",
            data : {
                page: page,
                pageSize: pageSize,
                username: searchMemberName.val()
            },
            success : function(res){
                if(res.statusCode == 200){
                    vm.dataList = res.respData || [];
                    dataListPagination.refresh({ currPage : page , totalPage : res.pageCount });
                    avalon.scan(thisPage[0]);
                }
            }
        });
    }

    /////////////////////////////pageSize下拉的变化
    $("#dataListTable>table>thead>tr.search>th>div>select").on("change",function(){
        pageSize = this.value;
        queryData();
    });

    queryData();
});