require(["css!../../compressed/css/page/"+$$.rootVm.page+".css?"+$$.rootVm.currTime,"colorbox","qrcode","!domReady"],function(){
    var vmId = $$.rootVm.page+"Ctrl"+(+new Date()),
        thisPage = $("#"+$$.rootVm.page+"Page"),
        pageParam = getParamObj(),
        orderListPagination,
        commentListPagination,
        couponListPagination;

    if(!pageParam.userId){
        msgAlert("地址栏缺少访问参数！");
        history.back();
    }
    thisPage.attr("ms-controller",vmId);
    if(pageParam.type =="all"){
        $("div#info>div.path>span:eq(0)").html("技师管理>>");
        $("div#content>div#menu>div[nav='techAdmin']>ul>li:eq(0)").attr('class','active');
        $("div#content>div#menu>div[nav='techAdmin']>ul>li:eq(1)").attr('class','');
    }else {
        $("div#info>div.path>span:eq(0)>a").attr('href','#!/historyTech');
    }
    $$.currPath.html("客户详情");

    var vm = avalon.define({
        $id : vmId,
        techId : pageParam.id,
        orderList : [],
        customerObj : {},
        $statusObj:[
            { "value" : "" , "name" : "所有状态" },
            { "value" : "submit" , "name" : "待接受"},
            { "value" : "accept" , "name" : "已接受"},
            { "value" : "reject" , "name" : "拒绝"},
            { "value" : "complete" , "name" : "完成"},
            { "value" : "failure" , "name" : "失效"},
            { "value" : "overtime" , "name" : "超时"}
        ],
        $couponStatus:[
            { "value" : "" , "name" : "所有状态" },
            { "value":"not_used", "name":'未使用'},
            { "value" : "already_used" , "name" : "已使用"},
            { "value" : "expired" , "name" : "已过期"}
        ],
        currQueryStatus : "",
        currCouponStatus : "",
        orderListPageSize : 15,
        commentListPageSize : 15,
        coupontListPageSize : 15,
        couponList : [],
        commentList : [],
        selectedTab : "order",
        doChangeQueryStatus : function(type){
            if(type == "order"){
                vm.currQueryStatus = this.value;
                queryOrderList();
            }else {
                vm.currCouponStatus = this.value;
                queryCouponList();
            }
        },
        onChangeOrderListPageSize : function(){
            vm.orderListPageSize = this.value;
            queryOrderList();
        },
        onChangeCommentListPageSize : function(){
            vm.commentListPageSize = this.value;
            queryCommentList();
        },
        onChangeCouponListPageSize : function(){
            vm.coupontListPageSize = this.value;
            queryCouponList();
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

    couponListPagination = new Pagination($("#couponListPagination"),{
        switchPage : function(page){
            queryCouponList(page);
        }
    });

    function queryData(refreshServiceItem){
        $.ajax({
            url : "api/v2/manager/user/view",
            type : "post",
            data : { userId : pageParam.userId, ajax : 1 },
            success : function(res){
                if(res.statusCode == 200){
                        vm.customerObj = res.respData;
                        avalon.scan(thisPage[0]);
                }
                else{
                    msgAlert(res.msg || "数据查询失败！");
                    history.back();
                }
            }
        });
    }

    function queryOrderList(page){
        page  = page || 1;
        $.ajax({
            url : "api/v2/manager/user/order/list",
            type : "post",
            data : {
                userId : pageParam.userId,
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
        $.ajax({
            url : "api/v2/manager/user/comment/list",
            type : "get",
            data : {
                userId : pageParam.userId,
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

    function queryCouponList(page){
        page  = page || 1;
        $.ajax({
            url : "api/v2/manager/user/coupon/list",
            type : "get",
            data : {
                userId : pageParam.userId,
                page : page,
                pageSize : vm.coupontListPageSize,
                status : vm.currCouponStatus,
                isViewShareMan : "Y"
            },
            success : function(res){
                if(res.statusCode == 200){
                    vm.couponList = res.respData;
                    couponListPagination.refresh({ currPage : page , totalPage : res.pageCount });
                }
                else vm.commentList = [];
            }
        });
    }


    queryData();
    queryOrderList();
    queryCommentList();
    queryCouponList()
});