require(["css!../../compressed/css/page/"+$$.rootVm.page+".css?"+$$.rootVm.currTime,"daterangepicker","!domReady"],function(){
    var vmId = $$.rootVm.page+"Ctrl"+(+new Date()),
        thisPage = $("#"+$$.rootVm.page+"Page"),
        settledDate = getParamObj('settledDate') ? new Date(getParamObj('settledDate').replace(/-/g,'/')) : new Date();
    thisPage.attr("ms-controller",vmId);
    $$.currPath.html("账户详情");

    var vm = avalon.define({
        $id : vmId,
        accounts:[],
        accountTotal:[],
        $accountDetail:[],
        singleAccDetail:[],
        isNullData: false,
        $currSelectedAcc: '',
        isSelected:[],
        selectAcc: function (index) {
            var data = vm.accounts[index],tmp;
            if(data && data.businessCategory != vm.$currSelectedAcc){
                var tmpSel = [];
                tmpSel[index] = true;
                vm.isSelected = tmpSel;
                vm.$currSelectedAcc = data.businessCategory;
                tmp = [];
                vm.$accountDetail.forEach(function (obj) {
                    if(obj.businessCategory === vm.$currSelectedAcc){
                        tmp.push(obj);
                    }
                });
                vm.singleAccDetail = tmp;
            }
        }
    });

    function formatDate(date,needHour) {
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();

        var hour = date.getHours();
        var minute = date.getMinutes();
        var second = date.getSeconds();


        return [year, month, day].map(formatNumber).join('-') + ' ' + (needHour ? [hour, minute, second].map(formatNumber).join(':') : '');
    }
    function formatNumber(n) {
        n = n.toString();
        return n[1] ? n : '0' + n;
    }

    var minDate = new Date();
    minDate.setMonth(minDate.getMonth() - 3);
    $('.selectMonth>input').daterangepicker({singleDatePicker:true, startDate:settledDate,endDate:settledDate,minDate:minDate,maxDate:new Date(),locale:{format:'YYYY-MM-DD'}}, function (start, end) {
        queryData(start.format('YYYY-MM-DD'));
    });
    //$('.selectMonth>input').val(settledDate);

    function queryData(settledDate){
        $.ajax({
            url:'club/financial/club/settle/records/detail',
            data:{
                settleDate:settledDate
            },
            success: function (result) {
                if(result.statusCode == 200){
                    result = result.respData;
                    if(result.groupRecords){
                        vm.accountTotal = [result.totalRecord];
                    }else{
                        vm.accountTotal = [];
                    }
                    vm.accounts = result.groupRecords || [];
                    vm.$accountDetail = result.details || [];
                    vm.singleAccDetail = result.details || [];
                    vm.$currSelectedAcc = '';
                    vm.isNullData = true;
                }else{
                    msgAlert(result.msg || '查询失败');
                }
            }
        });
    }
    queryData(formatDate(settledDate,false));
    avalon.scan(thisPage[0]);
});