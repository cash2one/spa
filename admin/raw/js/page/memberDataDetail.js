require(["css!../../compressed/css/page/"+$$.rootVm.page+".css?"+$$.rootVm.currTime,"daterangepicker","!domReady"],function(){
    var vmId = $$.rootVm.page+"Ctrl"+(+new Date()),
        thisPage = $("#"+$$.rootVm.page+"Page"),
        pageSize = 20,
        dateRangeSearch = $('.search .time'),
        dataListPagination,
          bizTypes = {
              consume:'会员消费',
              user_recharge:'会员充值（线上）',
              pay_for_other:'请客核销',
              line_recharge:'会员充值'
          };
    thisPage.attr("ms-controller",vmId);
    $$.currPath.html("历史记录");

    //注册过滤器
    avalon.filters.bizTypeFilter = function (str) {
        return bizTypes[str] || '';
    };
    avalon.filters.discountFilter = function (str) {
        return str == 10 ? '无折扣':(str+'折');
    }

    var vm = avalon.define({
        $id : vmId,
        dataList : [],
        selectType : "",
        searchTel:'',
        switchType : function(){
            vm.selectType = this.value;
            queryData();
        },
        doClickSearch : function(){
            queryData();
        }
    });

    //////////////////分页器
    dataListPagination = new Pagination($("#dataListPagination"),{
        switchPage : function(page){
            queryData(page);
        }
    });

    var initStartDate = new Date();
    initStartDate.setTime(initStartDate.getTime()-29*24*60*60*1000);
    dateRangeSearch.daterangepicker({ startDate : initStartDate , endDate : new Date() },function(start,end){
        queryData(1,start.format('YYYY-MM-DD'),end.format('YYYY-MM-DD'));
    });

    function queryData(page,start,end){
        page = page || 1;
        var dateRange =formatDateRangeVal(dateRangeSearch.val()),
          startDate = start || dateRange.start,
          endDate = end || dateRange.end;
        $.ajax({
            url : "club/financial/user/deal/list",
            type : "post",
            data : {
                startDate:startDate,
                endDate:endDate,
                page : page ,
                pageSize : pageSize,
                showOperator:'N',
                businessCategory : vm.selectType || '',
                userName : $("#userTelSearch").val() || ''
            },
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

    $("#userTelSearch").on("input",function(){
        if (/\D/.test(this.value)) {
            this.value = this.value.replace(/\D/g, '');
        }
        if(this.value.length>11) this.value = this.value.substr(0,11);
    }).on('keypress', function (e) {
        if(e.keyCode == 13){
            queryData();
        }
    });
    queryData();
});