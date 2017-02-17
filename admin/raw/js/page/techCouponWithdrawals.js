require(["css!../../compressed/css/page/"+$$.rootVm.page+".css?"+$$.rootVm.currTime,"!domReady"],function(){
    var vmId = $$.rootVm.page+"Ctrl"+(+new Date()),
        thisPage = $("#"+$$.rootVm.page+"Page"),
        pageSize = 20,
        currPage = 1,
        $likeName = $("input[name='likeName']"),
        $phoneNum = $("input[name='phoneNum']"),
        $amount = $("input[name='editAmount']"),
        confirmModal,
        dataListPagination;
    thisPage.attr("ms-controller",vmId);
    $$.currPath.html(" 技师优惠券提成");

    var vm = avalon.define({
        $id : vmId,
        dataList : [],
        currPage : 1,
        doStatementModal : {
            "amount" : "",
            "userId" : ""
        },
        doViewClubList : function(){
            queryData(1);
        },
        doStatement : function(row){
            vm.doStatementModal = row;
            confirmModal.show();

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
        currPage = page = page || 1;
        $.ajax({
            url : "api/v2/financial/tech/account/list",
            type : "post",
            data : { likeName : $likeName.val() , phoneNum : $phoneNum.val(), page : page , pageSize : pageSize},
            success : function(res){
                if(res.statusCode == 200){
                    vm.dataList = res.respData;
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


    confirmModal = new Modal($("#confirmModal"),{
        doClickOkBtn : function(){
            if(formValidate()){
                $.ajax({
                    url : "api/v2/financial/tech/amount/setttlement",
                    type : "post",
                    data : { amount : $amount.val().trim() , userId : vm.doStatementModal.userId},
                    success : function(res){
                        if(res.statusCode == 200){
                            confirmModal.close();
                            queryData(vm.currPage);
                            msgAlert(res.msg,true);
                        }else{
                            msgAlert(res.msg);
                        }
                    }
                });
            }
        }
    });

    function formValidate(){
        if(!$amount.val().trim()){
            confirmModal.showTip("请输入结算金额！");
            $amount.focus();
            return false;
        }else if($amount.val().trim() == 0){
            confirmModal.showTip("结算金额不能为0！");
            $amount.focus();
            return false;
        }else if(!/^[0-9]+(.[0-9]{1,2})?$/.test($amount.val().trim())){
            confirmModal.showTip("请输入正确的结算金额！");
            $amount.focus();
            return false;
        }else if($amount.val().trim() > vm.doStatementModal.amount){
            confirmModal.showTip("结算金额不能大于余额" + vm.doStatementModal.amount);
            $amount.focus();
            return false;
        }
        return true;
    }
    queryData();
});