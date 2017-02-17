require(["css!../../compressed/css/page/"+$$.rootVm.page+".css?"+$$.rootVm.currTime,"colorbox","qrcode","!domReady"],function(){
    var vmId = $$.rootVm.page+"Ctrl"+(+new Date()),
        thisPage = $("#"+$$.rootVm.page+"Page"),
        pageParam = getParamObj(),
        orderListPagination,
        commentListPaginationl;

    if(!pageParam.techId){
        msgAlert("地址栏缺少访问参数！");
        history.back();
    }
    thisPage.attr("ms-controller",vmId);
    $("div#info>div.path>span:eq(0)>a").attr('href','#!/historyTech');
    $$.currPath.html("技师详情");

    var vm = avalon.define({
        $id : vmId,
        techId : pageParam.id,
        orderList : [],
        techInfoObj : {},
        serviceItems : [],
        currQueryStatus : "",
        orderListPageSize : 15,
        commentListPageSize : 15,
        customerListPageSize : 15,
        orderStatus : [{ name : "已完成" , value : "complete"} , { name : "待接受" , value : "submit"} , { name : "已接受" , value : "accept"} , { name : "已拒绝" , value : "reject"} ,{ name : "失效" , value : "failure"} ,{ name : "超时" , value : "overtime"}  ],
        commentList : [],
        customerList : [],
        selectedTab : "order",
        isRecommend : "N",
        opeType : "",
        serviceList : [],
        doChangeQueryStatus : function(){
            vm.currQueryStatus = this.value;
            queryOrderList();
        },
        onChangeOrderListPageSize : function(){
            vm.orderListPageSize = this.value;
            queryOrderList();
        },
        onChangeCommentListPageSize : function(){
            vm.commentListPageSize = this.value;
            queryCommentList();
        },
        onChangeCustomerListPageSize : function () {
            vm.customerListPageSize = this.value;
            queryCustomerList();
        },
        doChangeTab : function(tab){
            vm.selectedTab = tab;
        }
    });

    orderListPagination = new Pagination($("#orderListPagination"),{
        switchPage : function(page){
            queryOrderList(page);
        }
    });

    commentListPagination = new Pagination($("#commentListPagination"),{
        switchPage : function(page){
            queryCommentList(page);
        }
    });
    customerListPagination = new Pagination($("#customerListPagination"),{
        switchPage : function(page){
            queryCustomerList(page);
        }
    });

    function queryData(){
        $.ajax({
            url : "api/v2/manager/history_tech/view",
            type : "get",
            data : { historyTechId : pageParam.historyTechId , ajax : 1 },
            success : function(res){
                if(res.statusCode ==200){
                    vm.techInfoObj = res.respData;
                    if(res.respData.serviceItem){
                        vm.serviceItems = res.respData.serviceItem.substr(0,res.respData.serviceItem.length-1).split(";");
                    }else {
                        vm.serviceItems = [];
                    }
                    avalon.scan(thisPage[0]);
                }
                else{
                    msgAlert("数据查询失败！");
                    history.back();
                }
            }
        });
    }

    function queryOrderList(page){
        page  = page || 1;
        $.ajax({
            url : "api/v2/manager/tech/orders",
            type : "post",
            data : {
                techId : pageParam.techId,
                page : page,
                pageSize : vm.orderListPageSize,
                status : vm.currQueryStatus
            },
            success : function(res){
                if(res.statusCode == 200){
                    vm.orderList = res.respData;
                    orderListPagination.refresh({ currPage : page , totalPage : res.pageCount });
                }
                else vm.orderList = [];
            }
        });
    }

    function queryCommentList(page){
        page  = page || 1;
        //console.log("vm.commentListPageSize："+vm.commentListPageSize);
        $.ajax({
            url : "api/v2/manager/tech/comments",
            type : "post",
            data : {
                techId : pageParam.techId,
                page : page,
                pageSize : vm.commentListPageSize
            },
            success : function(res){
                if(res.statusCode == 200){
                    vm.commentList = res.respData;
                    commentListPagination.refresh({ currPage : page , totalPage : res.pageCount });
                }
                else vm.commentList = [];
            }
        });
    }

    function queryCustomerList(page){
        page  = page || 1;
        $.ajax({
            url : "api/v2/manager/user/list",
            type : "get",
            data : {
                techId : pageParam.techId || -1,
                page : page,
                pageSize : vm.customerListPageSize
            },
            success : function(res){
                if(res.statusCode == 200){
                    vm.customerList = res.respData;
                    customerListPagination.refresh({ currPage : page , totalPage : res.pageCount });
                }
                else vm.customerList = [];
            }
        });
    }


    queryData();
    queryOrderList();
    queryCommentList();
    queryCustomerList();
});