require(["css!../../compressed/css/page/clubPopWindowSetting.css?"+$$.rootVm.currTime,"daterangepicker","dragsort","!domReady"],function(){
    var vmId = $$.rootVm.page+"Ctrl"+(+new Date()),
        thisPage = $("#"+$$.rootVm.page+"Page"),        //当前选择的内网项目ID
        popWindowModal,
        images = {
            coupon:'club-admin/img/clubInfo/coupon.png',
            paid_service_item:'club-admin/img/clubInfo/timeLimit.png',
            one_yuan:'club-admin/img/clubInfo/oneYuan.png',
            paid_plumflowe:'club-admin/img/clubInfo/oneYuan.png',
            journal:'club-admin/img/clubInfo/journal.png',
            luckyWheel:'club-admin/img/clubInfo/luckyWheel.png'
        },
      $actItem = $('#popWindowModal #actItem'),
      $actPriority = $('#popWindowModal #actPriority'),
      $actPopStartDate = $('#popWindowModal #actPopStartDate'),
      $actPopStartTime = $('#popWindowModal #actPopStartTime'),
      $actPopEndDate = $('#popWindowModal #actPopEndDate'),
      $actPopEndTime = $('#popWindowModal #actPopEndTime'),
      $confirmDelModal,
      currDelPopId;
    thisPage.attr("ms-controller",vmId);
    $$.currPath.html("弹窗设置");

    var vm = avalon.define({
        $id : vmId,
        list:[],
        actTypeList:[],
        isCoupon:false,     //当前最高优先级的弹窗，是否为优惠券
        actTypeImage:null,
        modalIsCoupon:false,
        modalSelectTypeImage:'',
        hourArr:(function () {
            var tmpArr = [];
            for(var i = 0;i<24;i++){
                tmpArr.push(i<10?'0'+i:i);
            }
            return tmpArr;
        })(),
        addPop:function(){
            $actItem.val('');
            $actPopStartDate.val('');
            $actPopStartTime.val('00:00');
            $actPopEndDate.val('');
            $actPopEndTime.val('00:00');
            $actPriority.val(1);
            vm.modalSelectTypeImage = '';
            vm.modalIsCoupon = false;
            popWindowModal.show();
        },
        deletePop: function (index) {
            currDelPopId = vm.list[index].id;
            $confirmDelModal.show();
        },
        setTopPop:function(index){
            updatePriority(vm.list[index].id);
        },
        changeActType: function () {
            var dataset = this.selectedOptions[0].dataset, selectType = dataset.type,
              startDate = dataset.startDate || '',endDate = dataset.endDate || '',
              dateOptions = {
                  singleDatePicker:true,
                  locale:{
                      format:'YYYY-MM-DD'
                  }
              };
            vm.modalIsCoupon = selectType === 'coupon';
            vm.modalSelectTypeImage = selectType ? images[selectType] : '';
            var titleName = dataset.name.substring(dataset.name.indexOf('】') + 1);
            var titleLen = (function (words) {
                var len = 0, a;
                for (var i = 0; i < words.length; i++) {
                    a = words.charAt(i);
                    if (a.match(/[^\x00-\xff]/ig) != null)len += 2;
                    else len += 1;
                }
                return len;
            })(titleName);
            setTimeout(function () {
                var titlePDiv = $('section#clubPopWindowSettingPage div#popWindowModal .dialog-act-preview>div>div.coupon>div'),
                  titleDiv = $('section#clubPopWindowSettingPage div#popWindowModal .dialog-act-preview>div>div.coupon>div>div');
                titleDiv.html(titleName);
                if (titleLen <= 10) {
                    //////default
                }
                else if (titleLen <= 12) {
                    titlePDiv.addClass("spec-6");
                }
                else if (titleLen <= 14) {
                    titlePDiv.addClass("spec-7");
                }
                else if (titleLen <= 16) {
                    titlePDiv.addClass("spec-8");
                }
                else {
                    titlePDiv.addClass("two-line");
                    if (titleLen > 32) {
                        titleDiv.html(titleName.substr(0, 14) + "...");
                    }
                }
            },100);

            //$('#popWindowModal .dialog-act-preview>div>div>div>div').text(dataset.name.substring(_idx + 1));

            if(startDate){
                dateOptions.minDate = startDate;
            }
            if(endDate){
                dateOptions.maxDate = endDate;
            }
            $('.need-date').daterangepicker(dateOptions);
            if(startDate){
                $actPopStartDate.val(startDate.split(' ')[0]);
                $actPopStartTime.val(startDate.split(' ')[1]?startDate.split(' ')[1].substring(0,3)+'00':'00:00');
            }else{
                $actPopStartDate.val('')
            }
            if(endDate){
                $actPopEndDate.val(endDate.split(' ')[0]);
                $actPopEndTime.val(endDate.split(' ')[1]?endDate.split(' ')[1].substring(0,3)+'00':'00:00');
            }else{
                $actPopEndDate.val('');
            }
        }
    });

    /*$('.need-date').daterangepicker({
        singleDatePicker:true,
        locale:{
            format:'YYYY-MM-DD'
        }
    });
    $('.need-date').val('');*/

    popWindowModal = new Modal($('#popWindowModal'),{
        doClickOkBtn:function(){
            if(checkForm()){
                $.ajax({
                    url:'club/popup/save',
                    type:'post',
                    data:{
                        activityId: $actItem.val(),
                        activityName: $actItem[0].selectedOptions[0].dataset.name.substring($actItem[0].selectedOptions[0].dataset.name.indexOf('】')+1),
                        activityType: $actItem[0].selectedOptions[0].dataset.type,
                        priority: $actPriority.val(),
                        startTime: $actPopStartDate.val() + ' '+$actPopStartTime.val()+':00',
                        endTime: $actPopEndDate.val() + ' '+$actPopEndTime.val()+':00'
                    },
                    success: function (result) {
                        if(result.statusCode == 200){
                            popWindowModal.close();
                            queryData();
                        }else{
                            popWindowModal.showTip(result.msg || '操作失败');
                        }
                    }
                });
            }
        }
    });

    function checkForm(){
        if($actItem.val() == ''){
            Modal.showErrorEleTip($actItem);
            popWindowModal.showTip('请选择活动');
            return;
        }
        if($actPopStartDate.val().trim() == ''){
            Modal.showErrorEleTip($actPopStartDate);
            popWindowModal.showTip('请选择弹窗开始日期');
            return;
        }
        if($actPopEndDate.val().trim() == ''){
            Modal.showErrorEleTip($actPopEndDate);
            popWindowModal.showTip('请选择弹窗结束日期');
            return;
        }
        if(new Date() - new Date($actPopEndDate.val().replace(/-/g,'/') + ' '+$actPopEndTime.val()+':00') > 0){
            Modal.showErrorEleTip([$actPopEndDate]);
            popWindowModal.showTip('弹窗结束日期不能小于当前日期');
            return;
        }
        if(new Date($actPopStartDate.val().replace(/-/g,'/')+ ' '+$actPopStartTime.val()+':00') - new Date($actPopEndDate.val().replace(/-/g,'/')+ ' '+$actPopEndTime.val()+':00') > 0){
            Modal.showErrorEleTip([$actPopStartDate,$actPopEndDate]);
            popWindowModal.showTip('弹窗开始日期不能大于弹窗结束日期');
            return;
        }

        return true;
    }

    $confirmDelModal =new Modal($('#confirmDelModal'),{
        doClickOkBtn: function(){
            $confirmDelModal.close();
            $.ajax({
                url:'club/popup/delete',
                type:'post',
                data:{
                    popupId: currDelPopId
                },
                success:function(result){
                    if(result.statusCode == 200){
                        queryData();
                    }else{
                        msgAlert(result.msg || '删除失败');
                    }
                }
            });
        }
    });

    function updatePriority(popupId,prevPopupId){
        prevPopupId = prevPopupId || '';
        $.ajax({
            url:'club/popup/priority/update',
            type:'post',
            data:{
                popupId:popupId,
                prevPopupId:prevPopupId
            },
            success:function(result){
                if(result.statusCode != 200){
                    msgAlert(result.msg || '操作失败');
                }else{
                    msgAlert('操作成功',true);
                }
                queryData();
            }
        })
    }

    var ajaxCount = 2;
    function queryData(){
        $.ajax({
            url : "club/popup/list",
            success : function(res){
                if(res.statusCode == 200){
                    vm.list = res.respData.popupList;
                    if(vm.list.length > 0){
                        vm.isCoupon = vm.list[0].activityType == 'coupon';
                        vm.actTypeImage = images[vm.list[0].activityType];
                        setTimeout(function () {
                            var titleName = vm.list[0].activityName.substring(vm.list[0].activityName.indexOf('】')+1);
                            var titleLen = (function (words) {
                                var len = 0, a;
                                for (var i = 0; i < words.length; i++) {
                                    a = words.charAt(i);
                                    if (a.match(/[^\x00-\xff]/ig) != null)len += 2;
                                    else len += 1;
                                }
                                return len;
                            })(titleName);

                            var titlePDiv = $('section#clubPopWindowSettingPage div.act-preview>div'),
                              titleDiv = $('section#clubPopWindowSettingPage div.act-preview>div>div');
                            titleDiv.html(titleName);
                            titlePDiv[0].className = '';
                            if (titleLen <= 10) {
                                //////default
                            }
                            else if (titleLen <= 12) {
                                titlePDiv.addClass("spec-6");
                            }
                            else if (titleLen <= 14) {
                                titlePDiv.addClass("spec-7");
                            }
                            else if (titleLen <= 16) {
                                titlePDiv.addClass("spec-8");
                            }
                            else {
                                titlePDiv.addClass("two-line");
                                if (titleLen > 32) {
                                    titleDiv.html(titleName.substr(0, 14) + "...");
                                }
                            }
                        },100);
                        //$('#clubPopWindowSettingPage div.act-preview>div>div').text(vm.list[0].activityName.substring(_idx + 1));
                    }else{
                        vm.isCoupon = false;
                        vm.actTypeImage = '';
                    }
                    ajaxCount--;
                    if(ajaxCount <= 0){
                        avalon.scan(thisPage[0]);
                    }
                }
            }
        });
        $.ajax({
            url : "club/popup/activity/list",
            success : function(res){
                if(res.statusCode == 200){
                    res = res.respData.activityList;
                    var list = [];
                    for(var k=0;k<res.length;k++){
                        list.push(res[k]);
                    }
                    vm.actTypeList = list;
                    ajaxCount--;
                    if(ajaxCount <= 0){
                        avalon.scan(thisPage[0]);
                    }
                }
            }
        });
    }

    $('.act-list>ul').dragsort({
        dragSelector : "li",
        dragSelectorExclude : "a",
        dragEnd : function(){
            var popupId = vm.list[this[0].dataset.index].id,
              domIndex = this.index(),prevPopupId;
            if(domIndex > 0 ){
                prevPopupId = vm.list[$('.act-list>ul>li').get(domIndex - 1).dataset.index].id
            }
            updatePriority(popupId,prevPopupId);
        }
    });

    queryData();
});