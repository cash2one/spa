require(["css!../../compressed/css/page/"+$$.rootVm.page+".css?"+$$.rootVm.currTime,"!domReady"],function(){
    var vmId = $$.rootVm.page+"Ctrl"+(+new Date()),
        thisPage = $("#"+$$.rootVm.page+"Page"),
      appointMoney = $('#appointMoney'),
      techMoney = $('#techMoney'),
      phoneInput = $('.phone-item'),
      confirmModal,
      clubAppointObj,
      paidTips = {
          appoint:'（预约时会生成订单，不收取项目费用）',
          phone:'（预约时客户只能拨打会所电话）',
          paid:'（预约时会生成订单，收取部分费用）',
          paid_full:'（预约时会生成订单，收取项目的全部费用）'
      },
      allTimes = ['00:00','00:30','01:00','01:30','02:00','02:30','03:00','03:30','04:00','04:30','05:00','05:30','06:00','06:30','07:00','07:30','08:00','08:30','09:00',
          '09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30',
          '20:00','20:30','21:00','21:30','22:00','22:30','23:00','23:30'];
    thisPage.attr("ms-controller",vmId);

    var vm = avalon.define({
        $id : vmId,
        isEditing: false,
        oaPaidSwitch: false,
        paidTip: '',
        appointTypeChange: function () {
            vm.isEditing = true;
            vm.paidTip = paidTips[this.value];
            vm.currPaidType = this.value;
            vm.appointMoney =  0;
            vm.techMoney =  0;
        },

        currPaidType: 'appoint',
        appointMoney: 0,
        techMoney: 0,

        times: allTimes,
        endTimes: allTimes,

        currStartTime: '00:00',
        currEndTime: '00:00',
        startTimeChange: function () {
            vm.isEditing = true;
            /*var index = 0;
            for(var i = 0,len = allTimes.length; i < len; ++i){
                if(allTimes[i] === this.value){
                    index = i;
                    break;
                }
            }*/
            //vm.endTimes = allTimes.slice(i+1);
            vm.currStartTime = this.value;
            vm.isAllDay = false;
        },
        endTimeChange: function () {
            vm.isEditing = true;
            vm.currEndTime = this.value;
            vm.isAllDay = false;
        },
        isAllDay: true,
        toggleAllDay: function () {
            vm.isEditing = true;
            vm.isAllDay = !vm.isAllDay;
            if(vm.isAllDay){
                vm.currStartTime = '00:00';
                vm.currEndTime = '00:00';
                //vm.endTimes = allTimes.slice(1);
            }
        },

        isEditPhone: false,
        $initPhones: [],
        phones: [],
        doEditPhone: function () {
            vm.isEditPhone = true;
            if(vm.phones.length === 0){
                vm.phones.push('');
            }
        },
        saveEditPhone: function () {
            var phones = vm.phones;
            if(vm.phones[vm.phones.length - 1] === ''){
                phones = vm.phones.slice(0,vm.phones.length - 1);
            }
            if(phones.join() === ''){
                msgAlert('无客服电话');
            }else{
                if(vm.phones[vm.phones.length - 1] === ''){
                    vm.phones = vm.phones.slice(0,vm.phones.length - 1);
                }
                confirmModal.show();
            }
        },
        cancelEditPhone: function () {
            vm.isEditPhone = false;
            vm.phones = vm.$initPhones.slice(0);
        },
        doOperationPhone: function (isLast,index) {
            if(isLast){  //add
                vm.phones.push('');
            }else{
                vm.phones.splice(index,1);
            }
        },

        save: function () {
            if(!checkForm()) return;
            $.ajax({
                url:'cluborder/save',
                type:'post',
                data:{
                    appointType: vm.currPaidType,
                    downPayment: parseInt(vm.appointMoney),
                    endTime: vm.currEndTime,
                    expireCommission: parseInt(vm.techMoney),
                    id: clubAppointObj.id,
                    startTime: vm.currStartTime,
                    techCommission: parseInt(vm.techMoney)
                },
                success: function (res) {
                    if(res.statusCode == 200){
                        vm.isEditing = false;
                        msgAlert('保存成功', true);
                    }else{
                        msgAlert(res.msg || '保存失败');
                    }
                }
            });
        },
        reset: function () {
            vm.currPaidType = clubAppointObj.appointType || 'appoint';
            vm.appointMoney = clubAppointObj.downPayment || 0;
            vm.techMoney = clubAppointObj.techCommission || 0;
            vm.currStartTime = clubAppointObj.startTime || '00:00';
            vm.currEndTime = clubAppointObj.endTime || '00:00';
            vm.isEditPhone = false;
            if(vm.currStartTime !== '00:00' || vm.currEndTime !== '00:00'){
                vm.isAllDay = false;
            }
        }

    });

    function checkForm(){
        if(vm.currPaidType === 'paid'){
            if(vm.appointMoney == 0){
                msgAlert('预约定金需大于0');
                appointMoney[0].focus();
                return false;
            }
            if(vm.appointMoney - vm.techMoney <= 0){
                msgAlert('技师提成需小于预约定金');
                techMoney[0].focus();
                return false;
            }
        }
        if(vm.currEndTime === ''){
            msgAlert('必须选择营业结束时间');
            $('#endTime')[0].focus();
            return false;
        }
        return true;
    }

    confirmModal = new Modal($('#confirmModal'),{
        doClickOkBtn : function(){
            var tmpArr = [];
            for(var i = 0,len = vm.phones.length; i< len; ++i){
                if(vm.phones[i]) tmpArr.push(vm.phones[i]);
            }
            vm.phones = tmpArr;
            $.ajax({
                url:'profile/club/updatePhone',
                data:{
                    phoneNos: vm.phones.join()
                },
                success: function (res) {
                    if(res.statusCode == 200){
                        msgAlert('修改成功',true);
                        vm.isEditPhone = false;
                    }else{
                        msgAlert(res.msg || '修改失败');
                    }
                    confirmModal.close();
                }
            });
        },
        doClickCancelBtn: function () {
            vm.cancelEditPhone();
            confirmModal.close();
        }
    });

    ///////限制输入
    $('#appointMoney, #techMoney').on("input",function(){
        vm.isEditing = true;
        var val = this.value;
        if(/^0\d+/.test(val)){
            val = val.substring(1);
        }
        this.value = val.replace(/\D/g,'');
    });

    $('.phone-area').on('input','input', function () {
        if(/[^-|\d]/.test(this.value)){
            this.value = this.value.replace(/[^-|\d]/g, '');
        }
        if (this.value.length > 15) {
            this.value = this.value.substring(0, 15);
        }
    });

    function queryData(){
        $.ajax({
            url : "cluborder/view",
            success : function(res){
                if(res.statusCode == 200){
                    clubAppointObj = res.respData || {};
                    if(!vm.oaPaidSwitch && (clubAppointObj.appointType != 'appoint' && clubAppointObj.appointType != 'phone')){
                        vm.currPaidType = 'appoint';
                    }else{
                        vm.currPaidType = clubAppointObj.appointType || 'appoint';
                    }
                    vm.appointMoney = clubAppointObj.downPayment || 0;
                    vm.techMoney = clubAppointObj.techCommission || 0;
                    vm.currStartTime = clubAppointObj.startTime || '00:00';
                    vm.currEndTime = clubAppointObj.endTime || '00:00';
                    if(vm.currStartTime !== '00:00' || vm.currEndTime !== '00:00'){
                        vm.isAllDay = false;
                    }
                    avalon.scan(thisPage[0]);
                }
            }
        });
    }

    ///////获取开关状态
    $.ajax({
        url : "api/v2/manager/paidOrder/openStatus",
        success : function(res){
            if(res.statusCode == 200){
                vm.oaPaidSwitch = res.respData.paidOrderSystemSwitch === 'on';
            }
            queryData();
        },
        error: function () {
            queryData();
        }
    });

    //获取客服电话
    $.ajax({
        url:'api/v2/club/'+$$.clubId+'/clubName',
        success: function (res) {
            vm.$initPhones = res.telephone.split(',');
            vm.phones = vm.$initPhones.slice(0);
        }
    });
});