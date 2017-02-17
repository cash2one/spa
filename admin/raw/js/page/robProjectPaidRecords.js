require(["css!../../compressed/css/page/"+$$.rootVm.page+".css?"+$$.rootVm.currTime,"daterangepicker","!domReady"],function(){
    var vmId = $$.rootVm.page+"Ctrl"+(+new Date()),
        thisPage = $("#"+$$.rootVm.page+"Page"),
        pageSize = 10,
        currPage = 1,
        dataListPagination,
        statusTypes = {
            not_online:'未上线',
            online:'已上线',
            downline:'已下线',
            lose_efficacy:'过期',
            delete:'删除',
        },
        $userTelSearch = $('#userTelSearch');
    thisPage.attr("ms-controller",vmId);
    $$.currPath.html("限时抢记录");

    //注册过滤器
    avalon.filters.couponStatusFilter = function (str) {
        return statusTypes[str] || '';
    };
    avalon.filters.clearZeroFilter = function (str) {
        return str?str.replace(/:\d{2}$/g,''):'';
    };
    function amountToTip(str){
        return str == 0 ? '无限制' : str;
    }
    avalon.filters.amountToTip = amountToTip;

    var vm = avalon.define({
        $id : vmId,
        dataList : [],
        page:1,
        pageSize:20,
        statusObj:[
            {
                value:'not_online',
                name:'未上线'
            },
            {
                value:'online',
                name:'已上线'
            },
            {
                value:'downline',
                name:'已下线'
            },
            {
                value:'lose_efficacy',
                name:'过期'
            }/*,
            {
                value:'delete',
                name:'删除'
            }*/
        ],
        paidItem:[],
        userPaidItems:[],
        doKeypress: function (e) {
            if(e.keyCode == '13'){
                queryData(1);
            }
        },
        doClickSearch: function () {
           queryData(1);
        }
    });

    //////////////////分页器
    dataListPagination = new Pagination($("#dataListPagination"),{
        switchPage : function(page){
            queryData(page);
        }
    });

    function queryData(page){
        currPage = page = page || 1;
        vm.page = currPage;
        vm.pageSize = pageSize;
        $.ajax({
            url : "club/paid/service/item/user_paid_service_item/list",
            data : { page : page , pageSize : pageSize, userName:$userTelSearch.val(), id:getParamObj('id')},
            success : function(res){
                if(res.statusCode == 200){
                    vm.paidItem = res.respData.paidItem;
                    vm.paidItem.canPaidCountText = amountToTip(vm.paidItem.canPaidCount);
                    vm.paidItem.statusName = statusTypes[vm.paidItem.status] || '';
                    vm.userPaidItems = res.respData.userPaidItems;
                    dataListPagination.refresh({ currPage : page , totalPage : res.pageCount });
                    avalon.scan(thisPage[0]);
                }
            }
        });
    }

    /////////////////////////////pageSize下拉的变化
    $("#dataListTable>table>thead>tr:eq(0)>th>div>select").on("change",function(){
        pageSize = this.value;
        queryData();
    });
    queryData();
});