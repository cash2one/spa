require(["css!../../compressed/css/page/"+$$.rootVm.page+".css?"+$$.rootVm.currTime,"daterangepicker","!domReady"],function(){
    var vmId = $$.rootVm.page+"Ctrl"+(+new Date()),
        thisPage = $("#"+$$.rootVm.page+"Page"),
        pageSize = 20,
        currPage = 1,
        dateRangeSearch = $("#dataListTable>table>thead>tr.search>th>div.time>input"),
        dateBtns = $("#dataListTable>table>thead>tr.search>th>div.time>a"),
        dataListPagination,
        robProjectModal,
        statusTypes = {
            not_online:'未上线',
            online:'已上线',
            downline:'已下线',
            lose_efficacy:'过期',
            delete:'删除',
        },
        currEditActId,
        $actProject = $('#actProject'),
        $actAmount = $('#actAmount'),
        $canPaidCount = $('#canPaidCount'),
        $userPaidCount = $('#userPaidCount'),
        $actStartDate = $('#actStartDate'),
        $actStartTime = $('#actStartTime'),
        $actEndDate = $('#actEndDate'),
        $actEndTime = $('#actEndTime'),
        $actExpiredStartDate = $('#actExpiredStartDate'),
        $actExpiredEndDate = $('#actExpiredEndDate'),
        $actPlain = $('#actPlain'),
        $explainLenSpan = $('#robProjectModal .content>div:nth-of-type(9)>span'),
        $actCredits = $('#actCredits'),
        $useStartTime = $('#useStartTime'),
        $useEndTime = $('#useEndTime');
    thisPage.attr("ms-controller",vmId);
    $$.currPath.html("抢购活动记录");

    $actPlain.plainTextOnly();
    //注册过滤器
    avalon.filters.couponStatusFilter = function (str) {
        return statusTypes[str] || '';
    };
    avalon.filters.instructionsLengthFilter = function (str) {
        var len = 0;
        str = str || '';
        len = str.replace(/<ul>|<\/ul>|<li>|<\/li>|<div>|<\/div>|<br>|<br\/>/g,'').length;
        return len;
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
        serviceItems:[],
        currStatus:'',
        page:1,
        pageSize:20,
        creditSwitch:false,
        hourArr:(function () {
            var tmpArr = [];
            for(var i = 0;i<24;i++){
                tmpArr.push(i<10?'0'+i:i);
            }
            return tmpArr;
        })(),
        useEndTimeArr:[],
        weekArr:[{ name : "周一", value : "1", checked: true} , { name : "周二", value : "2", checked: true} ,
                { name : "周三", value : "3", checked: true},{ name : "周四", value : "4", checked: true},
                { name : "周五", value : "5", checked: true}, { name : "周六", value : "6", checked: true},
                { name : "周日", value : "0", checked: true}],
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
        editModalTitle : "新增抢购项目",
        operateType:'',
        addRobProject: function () {
            $('#projectPrice').text('');
            currEditActId = '';
            vm.editModalTitle = "新增抢购项目";
            vm.operateType = 'add';
            $('#robProjectModal').find('input,select').val('');
            $actStartTime.val('00:00');
            $actEndTime.val('00:00');
            $actPlain.html('');
            vm.weekArr.forEach(function (week) {
                week.checked = true;
            });
            $explainLenSpan.text(0+' /150');
            $useStartTime.val('');
            $useEndTime.val('');
            robProjectModal.show();
        },
        modifyRobProject: function (index,type) {
            $('#projectPrice').text('');
            var obj = vm.dataList[index];
            vm.editModalTitle = "修改抢购项目";
            vm.operateType = 'modify';
            currEditActId = obj.id;
            if(type){
                currEditActId = '';
                vm.editModalTitle = "抢购项目详情";
                vm.operateType = 'check';
            }
            var usePeriod = obj.usePeriod && obj.usePeriod.split(',') || [];
            vm.weekArr.forEach(function (week) {
                week.checked = false;
            });
            usePeriod.forEach(function (up) {
                up = up - 1;
                up = (vm.weekArr.length + up%vm.weekArr.length) % vm.weekArr.length;
                vm.weekArr[up].checked = true;
            });
            $actProject.val(obj.itemId);
            $actAmount.val(obj.amount);
            $actCredits.val(obj.credits);
            $canPaidCount.val(obj.canPaidCount);
            $userPaidCount.val(obj.userPaidCount);
            $actStartDate.val(obj.startDate.split(' ')[0] || '');
            $actStartTime.val(obj.startDate.split(' ')[1] || '');
            $actEndDate.val(obj.endDate.split(' ')[0] || '');
            $actEndTime.val(obj.endDate.split(' ')[1] || '');
            $actExpiredStartDate.val(obj.useStartDate.split(' ')[0]);
            $actExpiredEndDate.val(obj.useEndDate.split(' ')[0]);
            obj.startTime = obj.startTime || '';
            obj.endTime = obj.endTime || '';
            $useStartTime.val(obj.startTime.replace(/:00/g,'')).change();
            setTimeout(function () {
               $useEndTime.val(obj.endTime.replace(/:00/g,''));
            },0);
            $actPlain.html(obj.instructions);
            $explainLenSpan.text(avalon.filters.instructionsLengthFilter(obj.instructions)+' /150');
            robProjectModal.show();
        },
        /*doChangeStatus : function(){        //////筛选状态数据列表
            vm.currStatus = this.value;
            queryData();
        },*/
        //==== 更改项目 ===
        projectChange: function () {
            var self = this;
            vm.serviceItems.forEach(function (item) {
                if(item.id == self.value){
                    $('#projectPrice').text(' 原价 '+ (item.price || 0) + ' 元');
                    return false;
                }
            });
        },
        doSaveCoupon: function (type) {
            if(checkForm()){
                var plainText = $actPlain[0].innerText || $actPlain.html();     //firefox兼容性问题
                if($actPlain.html().indexOf('<ul>') == 0){
                    plainText = $actPlain.html();
                }else{
                    plainText = ('<ul><li>'+plainText.replace(/[\f\n]|<br>|<br\/>/g,'</li><li>').replace(/<li>$/,'')+'</li></ul>').replace("<li></li>",'');
                }
                $.ajax({
                    url:'club/paid/service/item/edit',
                    type:'post',
                    data:{
                        id:currEditActId,
                        itemId:$actProject.val(),
                        amount:$actAmount.val(),
                        credits:$actCredits.val() || 0,
                        canPaidCount:$canPaidCount.val(),
                        userPaidCount: $userPaidCount.val(),
                        startDate:$actStartDate.val() + ' ' + $actStartTime.val() + ':00',
                        endDate:$actEndDate.val() + ' ' + $actEndTime.val() + ':00',
                        useStartDate:$actExpiredStartDate.val() + ' 00:00:00',
                        useEndDate:$actExpiredEndDate.val() + ' 23:59:59',
                        instructions:plainText,
                        status:type === 'saveAndOnline'?'online':'not_online',
                        usePeriod:(function (weekArr) {
                            var tmpArr = [];
                            weekArr.forEach(function (week) {
                                week.checked && tmpArr.push(week.value);
                            });
                            return tmpArr;
                        })(vm.weekArr).join(),
                        startTime:$useStartTime.val(),
                        endTime:$useEndTime.val()
                    },
                    success: function (response) {
                        if(response.statusCode == 200){
                            queryData(1)
                            robProjectModal.close();
                        }else{
                            robProjectModal.showTip(response.msg || '操作失败');
                        }
                    }
                });
            }
        },
        onInputExplain: function () {
            var $this = $(this),len = $this.text().length;
            if(len>150){
                var tmpStr = $this.text().substring(150),tmpHtml = $this.html();
                tmpHtml = tmpHtml.split('').reverse().join('').replace(tmpStr.split('').reverse().join(''),'').split('').reverse().join('');
                $this.html(tmpHtml);
                len = 150;
            }
            $explainLenSpan.text(len+'/150');
        },
        robProjectOperaStatus: function (index,type) {
            if(new Date(vm.dataList[index].endDate.replace(/-/g,'/')) - new Date() > 0 || type=='downline'){
                $.ajax({
                    url:'club/paid/service/item/operation',
                    data:{
                        id:vm.dataList[index].id,
                        operation:type
                    },
                    success: function (response) {
                        if(response.statusCode == 200){
                            queryData(1);
                        }else{
                            msgAlert(response.msg || (type=='online'?'上线':'下线')+'操作失败');
                        }
                    }
                });
            }else{
                vm.modifyRobProject(index);
                Modal.showErrorEleTip([$actEndDate,$actEndTime]);
                robProjectModal.showTip('活动结束时间不能小于当前时间');
            }
        },
        /*doChangeStartTime: function () {

        },*/
        doCheckboxWeek: function (week) {
            if(vm.operateType !='check'){
                week.checked = !week.checked;
            }
        }
    });
    $useStartTime.change(function () {
        console.log('change');
        if(this.value){
            var index = this.options.selectedIndex;
            vm.useEndTimeArr = vm.hourArr.slice(index);
        }else{
            vm.useEndTimeArr = [];
        }
    });

    //查询积分系统开关
    $.ajax({
        url:'club/credit/switch/status',
        data:{
            clubId:$$.clubId
        },
        success: function (result) {
            if(result.statusCode == 200){
                vm.creditSwitch = result.respData.systemSwitch == 'on' && result.respData.clubSwitch == 'on';
            }
        }
    });

    robProjectModal = new Modal($('#robProjectModal'));

    function checkForm(){
        if($actProject.val() == ''){
            Modal.showErrorEleTip($actProject);
            robProjectModal.showTip('抢购项目不能为空');
            return false;
        }
        if($.trim($actAmount.val()) == ''){
            Modal.showErrorEleTip($actAmount);
            robProjectModal.showTip('抢购价格不能为空');
            return false;
        }
        /*if($actCredits.val() == 0 && $actAmount.val() == ''){
            robProjectModal.showTip('抢购积分为零时，抢购价格不能全为空');
            return false;
        }*/
        if($canPaidCount.val() == ''){
            Modal.showErrorEleTip($canPaidCount);
            robProjectModal.showTip('数量不能为空');
            return false;
        }
        if($userPaidCount.val() == ''){
            Modal.showErrorEleTip($userPaidCount);
            robProjectModal.showTip('限购数量不能为空');
            return false;
        }
        if($canPaidCount.val() != 0 && $userPaidCount.val() - $canPaidCount.val() > 0){
            Modal.showErrorEleTip($userPaidCount);
            robProjectModal.showTip('限购数量不能大于总数量');
            return false;
        }
        if($.trim($actStartDate.val()) == '' || $.trim($actEndDate.val()) == ''){
            if($.trim($actStartDate.val()) == ''){
                Modal.showErrorEleTip($actStartDate);
            }else{
                Modal.showErrorEleTip($actEndDate);
            }
            robProjectModal.showTip('活动时间不能为空');
            return false;
        }
        if(new Date($actEndDate.val().replace(/-/g,'/')+ ' '  + $actEndTime.val()) - new Date() <= 0){
            Modal.showErrorEleTip([$actEndDate,$actEndTime]);
            robProjectModal.showTip('活动结束时间不能小于当前时间');
            return false;
        }
        if($.trim($actExpiredStartDate.val()) == '' || $.trim($actExpiredEndDate.val()) == ''){
            if($.trim($actExpiredStartDate.val()) == ''){
                Modal.showErrorEleTip($actExpiredStartDate);
            }else{
                Modal.showErrorEleTip($actExpiredEndDate);
            }
            robProjectModal.showTip('有效期不能为空');
            return false;
        }
        if((function (weekArr) {
              var tmpArr = [];
              weekArr.forEach(function (week) {
                  week.checked && tmpArr.push(week.value);
              });
              return tmpArr;
          })(vm.weekArr).length == 0){
            robProjectModal.showTip('使用时间段必须至少勾选一个');
            return false;
        }
        if($.trim($actPlain.text()) == ''){
            Modal.showErrorEleTip($actPlain);
            robProjectModal.showTip('活动说明不能为空');
            return false;
        }
        if(new Date($actStartDate.val().replace(/-/g,'/')+ ' '  + $actStartTime.val()) - new Date($actEndDate.val().replace(/-/g,'/')+ ' '  + $actEndTime.val()) >= 0){
            Modal.showErrorEleTip([$actStartDate,$actEndDate]);
            robProjectModal.showTip('活动结束时间需大于活动开始时间');
            return false;
        }
        if(new Date($actExpiredStartDate.val().replace(/-/g,'/')) - new Date($actStartDate.val().replace(/-/g,'/')) < 0){
            Modal.showErrorEleTip([$actExpiredStartDate,$actStartDate]);
            robProjectModal.showTip('有效期开始日期不能小于活动开始日期');
            return false;
        }
        if(new Date($actExpiredEndDate.val().replace(/-/g,'/')) - new Date($actEndDate.val().replace(/-/g,'/')) < 0){
            Modal.showErrorEleTip([$actExpiredEndDate,$actEndDate]);
            robProjectModal.showTip('有效期结束日期不能小于活动结束日期');
            return false;
        }
        if(new Date($actExpiredStartDate.val().replace(/-/g,'/')) - new Date($actExpiredEndDate.val().replace(/-/g,'/')) > 0){
            Modal.showErrorEleTip([$actExpiredStartDate,$actExpiredEndDate]);
            robProjectModal.showTip('有效期起始日期不能大于有效期结束日期');
            return false;
        }
        return true;
    }

    //////////////////日期范围
    /*var initStartDate = new Date(), initEndDate = new Date();
    initStartDate.setTime(initStartDate.getTime()-29*24*60*60*1000);
    
    dateRangeSearch.daterangepicker({ startDate : initStartDate, endDate : initEndDate },function(start,end){
        dateBtns.removeClass("active");
        queryData(1,start.format("YYYY-MM-DD"),end.format("YYYY-MM-DD"))
    });*/

    $('.need-date').daterangepicker({
        singleDatePicker:true,
        locale:{
            format:'YYYY-MM-DD'
        }
    });
    $('.need-date').val('');

    //////////////////分页器
    dataListPagination = new Pagination($("#dataListPagination"),{
        switchPage : function(page){
            queryData(page);
        }
    });

    function queryData(page,start,end){
        currPage = page = page || 1;
        /*var  dateRange = formatDateRangeVal(dateRangeSearch.val()),
            startDate = start || dateRange.start,
            endDate = end || dateRange.end;*/
        vm.page = currPage;
        vm.pageSize = pageSize;
        $.ajax({
            url : "club/paid/service/item/list",
            data : { /*startDate : startDate , endDate : endDate,*/ page : page , pageSize : pageSize, status:vm.currStatus },
            success : function(res){
                if(res.statusCode == 200){
                    vm.dataList = res.respData;
                    vm.dataList.forEach(function (obj) {
                        obj.canPaidCountText = amountToTip(obj.canPaidCount);
                        obj.userPaidCountText = amountToTip(obj.userPaidCount);
                        obj.statusName = statusTypes[obj.status] || '';
                    });
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

    //////////////////////////////日期范围的选择
    dateBtns.click(function(){
        var $this = $(this);
        if(!$this.hasClass("active")){
            $this.siblings().removeClass("active");
            $this.addClass("active");
            var type = $this.attr("type");
            if(type != "all"){
                var initStartDate = new Date();
                initStartDate.setTime(initStartDate.getTime()-parseInt(type)*24*60*60*1000);
                dateRangeSearch.data('daterangepicker').setStartDate(initStartDate);
                dateRangeSearch.data('daterangepicker').setEndDate(new Date());
            }
            else{
                dateRangeSearch.val("");
            }
            queryData();
        }
    });

    //=== 加载会所项目列表 ===
    $.ajax({
        url : "club/service/item/list",
        success: function (response) {
            if(response.statusCode == 200){
                vm.serviceItems = response.respData;
                avalon.scan(thisPage[0]);
            }else{
                msgAlert('查询会所项目列表失败。');
            }
        }
    });
    queryData();
});