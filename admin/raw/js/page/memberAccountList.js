require(["css!../../compressed/css/page/"+$$.rootVm.page+".css?"+$$.rootVm.currTime,"!domReady"],function(){
    var vmId = $$.rootVm.page+"Ctrl"+(+new Date()),
        thisPage = $("#"+$$.rootVm.page+"Page"),
        pageSize = 20,
        currPage = 1,
        dataListPagination,
        editMemberModal,
        confirmModal,
        $searchMemberName = $('#searchMemberName'),
        $searchMemberPhoneNum = $('#searchMemberPhoneNum'),
        currEditMemberId,
        $memberPhoneNum = $('#memberPhoneNum'),
        $memberType = $('#memberType'),
        $rechargeAmount = $('#rechargeAmount'),
        currChangeData,
        currChangeDom;
    thisPage.attr("ms-controller",vmId);
    $$.currPath.html("全部会员");

    //注册过滤器
    avalon.filters.fenToYuanFilter = function (str) {
        str = parseInt(str || 0)/100;
        return str;
    };

    var vm = avalon.define({
        $id : vmId,
        dataList : [],
        currMemberTypeId:'',
        page:1,
        pageSize:20,
        typeArr:[],
        typeObj:{},
        editModalTitle : "添加会员",
        editObj:{
            id:'',
            phoneNum:'',
            typeId:'',
            amount:'',
            isRecharge:false
        },
        doChangeType: function () {
            vm.currMemberTypeId = this.value;
            queryData(1);
        },
        $saveMemberInfo: function (id,typeId,phoneNum,amount) {
            $.ajax({
                url:'club/member/save',
                type:'post',
                data:{
                    accountAmount:parseInt(amount)*100,
                    memberId: id,
                    memberTypeId: typeId,
                    phoneNum: phoneNum,
                },
                success: function (result) {
                    if(result.statusCode == 200){
                        queryData(1);
                        editMemberModal.close();
                        msgAlert('更新成功',true);
                    }else{
                        editMemberModal.showTip(result.msg || '操作失败');
                    }
                }
            });
        },
        doModifyType: function (index) {
            currChangeData = vm.dataList[index];
            currChangeDom = this;
            confirmModal.show();
        },
        searchMember: function () {
            queryData(1);
        },
        doRechargeMember: function (index, isOnlyRecharge) {
            if(index<0){
                vm.editObj.phoneNum = '';
                vm.editObj.typeId = vm.typeArr[0]&&vm.typeArr[0].id || '';
                vm.editObj.id = ''
            }else{
                var data = vm.dataList[index];
                vm.editObj.id = data.id;
                vm.editObj.phoneNum = data.phoneNum;
                vm.editObj.typeId = data.memberTypeId;
            }
            if(isOnlyRecharge == 'add'){
                vm.editModalTitle = '添加会员';
            }else{
                vm.editModalTitle = '充值';
            }
            vm.editObj.amount = '';
            vm.editObj.isRecharge = isOnlyRecharge === true;
            //avalon.scan($('#editMemberModal')[0]);
            editMemberModal.show();
        },
        doSaveMember: function () {
            if(!checkForm()) return false;
            if(vm.editObj.isRecharge){      //充值
                $.ajax({
                    url:'club/financial/user/recharge/save',
                    type:'post',
                    data:{
                        amount:parseInt($rechargeAmount.val())*100,
                        telephone: vm.editObj.phoneNum
                    },
                    success: function (result) {
                        if(result.statusCode == 200){
                            queryData(1);
                            editMemberModal.close();
                            msgAlert('充值成功',true);
                        }else{
                            editMemberModal.showTip(result.msg || '操作失败');
                        }
                    }
                });
            }else{                              //添加会员
                $.ajax({
                    url:'club/member/save',
                    type:'post',
                    data:{
                        accountAmount:parseInt(vm.editObj.amount)*100,
                        memberId: '',
                        memberTypeId: vm.editObj.typeId,
                        phoneNum: vm.editObj.phoneNum
                    },
                    success: function (result) {
                        if(result.statusCode == 200){
                            queryData(1);
                            editMemberModal.close();
                            msgAlert('添加会员成功',true);
                        }else{
                            editMemberModal.showTip(result.msg || '操作失败');
                        }
                    }
                });
            }
        }
    });

    $('#searchMemberName,#searchMemberPhoneNum').on('keypress', function (e) {
        if(e.keyCode == '13'){
            queryData(1);
        }
    })

    //获取链接中的参数
    vm.currMemberTypeId = getParamObj('typeId');


    editMemberModal = new Modal($('#editMemberModal'));

    function checkForm(){
        if($memberPhoneNum.val() == ''){
            editMemberModal.showTip('手机号码不能为空');
            return false;
        }
        if($memberType.val() == ''){
            editMemberModal.showTip('会员类型不能为空');
            return false;
        }
        if($.trim($rechargeAmount.val()) == ''){
            editMemberModal.showTip('充值金额不能为空');
            return false;
        }
        return true;
    }



    //////////////////分页器
    dataListPagination = new Pagination($("#dataListPagination"),{
        switchPage : function(page){
            queryData(page);
        }
    });

    function queryData(page,start,end){
        currPage = page = page || 1;
        vm.page = currPage;
        vm.pageSize = pageSize;
        $.ajax({
            url : "club/member/list",
            type:'post',
            data : { page : page , pageSize : pageSize, memberTypeId: vm.currMemberTypeId, userName: $('#searchMemberName').val(), phoneNum:$('#searchMemberPhoneNum').val()},
            success : function(res){
                if(res.statusCode == 200){
                    vm.dataList = res.respData.memberList || [];
                    vm.typeArr = res.respData.types || [];
                    vm.typeArr.forEach(function (v) {
                        vm.typeObj[v.id] = v.name
                    })
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

    confirmModal = new Modal($('#confirmModal'),{
        doClickOkBtn: function () {
            vm.$saveMemberInfo(currChangeData.id,currChangeDom.value,currChangeData.phoneNum,0);
            confirmModal.close();
        },
        doClickCancelBtn: function () {
            currChangeDom.value = $(currChangeDom).find('option:selected').attr('data-value');
            confirmModal.close();
        }
    });

    queryData();
});