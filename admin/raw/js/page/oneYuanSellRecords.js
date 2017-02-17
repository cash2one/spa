require(["css!../../compressed/css/page/"+$$.rootVm.page+".css?"+$$.rootVm.currTime,"!domReady"],function(){
    var vmId = $$.rootVm.page+"Ctrl"+(+new Date()),
        thisPage = $("#"+$$.rootVm.page+"Page"),
        dataListPagination = $('#dataListPagination'),
        pageParam = getParamObj(),
        statusObj = {
            0:'未中奖',
            1:'已中奖',
            2:'已兑奖'
        };

    thisPage.attr("ms-controller",vmId);
    $('#info>div.path>span:eq(0)>a').attr('href','#/oneYuan');
    $$.currPath.html("购买记录");

    avalon.filters.statusFilter=function (str) {
        return statusObj[str];
    };

    var vm = avalon.define({
        $id : vmId,
        page:1,
        pageSize:10,
        dataList : [],
        winnerInfo : [],
        isRefund: false,
        currPeriod: pageParam['currentPeriod'],
        selectedPeriod: pageParam['currentPeriod'],
        periods:(function (period) {
            var arr = [];
            for(var i = 1;i <= period; i++){
                arr.push(i);
            }
            return arr;
        })(pageParam['currentPeriod']),
        statusObj : [{"name":"全部状态","value":""},{"name":"已上线","value":"online"},{"name":"未上线","value":"not_online"},{"name":"已结束","value":"end"},{"name":"已完成","value":"complete"}],
        changePeriod: function () {
            vm.selectedPeriod = this.value;
            queryWinner(this.value);
            queryData(1,this.value);
        }
    });

    //////////////////分页器
    dataListPagination = new Pagination($("#dataListPagination"),{
        switchPage : function(page){
            queryData(page,vm.selectedPeriod);
        }
    });

    function queryWinner(currPeriod){
        $.ajax({
            url:'club/one_yuan/draw/records',
            data:{
                currentPeriod:currPeriod,
                oneYuanBaseId:pageParam['oneYuanBaseId']
            },
            success: function (res) {
                if(res.statusCode == 200){
                    vm.winnerInfo = res.respData ? (res.respData.drawUser ? [res.respData.drawUser] : []):[];
                    vm.winnerInfo.forEach(function (obj) {
                        obj.exchangeStatusName = statusObj[obj.exchangeStatus];
                    });

                    vm.isRefund = res.respData ? res.respData.actStatus == 'refund': false;
                    avalon.scan(thisPage[0]);
                }else{
                    msgAlert('查询中奖详情失败' + res.msg);
                }
            }
        });
    }

    function queryData(page,currPeriod){
        vm.page = page = page || 1;
        $.ajax({
            url : "club/one_yuan/paid/records",
            data:{
                currentPeriod:currPeriod,
                oneYuanBaseId:pageParam['oneYuanBaseId'],
                page:page,
                pageSize:vm.pageSize
            },
            success : function(res){
                if(res.statusCode == 200){
                    //res = res.respData;
                    vm.dataList = res.respData || [];
                    vm.dataList.forEach(function (obj) {
                        obj.amountText = obj.amount ? (obj.amount/100).toFixed(2) : 0;
                    });
                    dataListPagination.refresh({ currPage : page , totalPage : res.pageCount });
                    avalon.scan(thisPage[0]);
                }
            }
        });
    }
    queryWinner(pageParam['currentPeriod']);
    queryData(1,pageParam['currentPeriod']);
});