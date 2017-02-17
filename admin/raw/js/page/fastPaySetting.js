require(["css!../../compressed/css/page/"+$$.rootVm.page+".css?"+$$.rootVm.currTime,"!domReady"],function(){
    var vmId = $$.rootVm.page+"Ctrl"+(+new Date()),
        thisPage = $("#"+$$.rootVm.page+"Page"),
        selectTechModal,
        $checkAllTech = $("#checkAllTech");

    thisPage.attr("ms-controller",vmId);
    $$.currPath.html("买单设置");

    var vm = avalon.define({
        $id : vmId,
        defaultHeader: "club-admin/img/common/head.jpg",
        fastPaySwitch: false,
        switchId: '',
        disabledTechList: [], // 当前不可买单的技师列表数据
        enabledTechList: [], // 可买单的技师数据
        showCheckAll: false, // 是否显示全选按钮
        doClickSwitch: function () {
            vm.fastPaySwitch = !vm.fastPaySwitch;
            $.ajax({
                url: "api/v2/manager/settings/switch/save",
                data: {
                    status: vm.fastPaySwitch ? 'Y' : 'N',
                    switchId: vm.switchId
                },
                success: function(res){
                    if(res.statusCode == 200){
                        msgAlert(res.msg || "操作成功！",true)
                    } else {
                        msgAlert(res.msg || "操作失败！")
                        vm.fastPaySwitch = !vm.fastPaySwitch; // 退回去
                    }
                    if(vm.fastPaySwitch){
                        queryData();
                    } else {
                        // 清空可买单的技师
                        $.ajax({
                            url: "api/v2/manager/fastpay/settings/tech/save",
                            type: "post",
                            data: { techIds: "" },
                            success: function(){
                                vm.disabledTechList = [];
                                vm.enabledTechList = [];
                            }
                        })
                    }
                }
            })
        },
        doAddTech: function () {
            vm.showCheckAll = false;
            for(var k=0;k<vm.disabledTechList.length;k++){
                vm.disabledTechList[k].checked = false
                if(vm.disabledTechList[k].techNo){
                    vm.showCheckAll = true;
                }
            }
            $checkAllTech[0].checked = false;
            selectTechModal.show();
        },
        doDelTech: function(index,event){ // 从可买单的技师中删除
            var enabledTechList = vm.enabledTechList;
            vm.disabledTechList.push(enabledTechList[index]);
            vm.disabledTechList.sort(function(a,b){
                if(!a.techNo) return 1;
                if(!b.techNo) return -1;
            })
            enabledTechList.splice(index,1);
            event.stopPropagation()
        },
        doSave: function(){
            $$.maskPage.addClass("active")
            var enabledTechList = vm.enabledTechList, techIds = [];
            for(var i=0; i<enabledTechList.length;i++){
                techIds.push(enabledTechList[i].id)
            }
            $.ajax({
                url: "api/v2/manager/fastpay/settings/tech/save",
                type: "post",
                data: {
                    techIds: techIds.join(",")
                },
                success: function(res){
                    $$.maskPage.removeClass("active");
                    if(res.statusCode == 200){
                        msgAlert(res.msg || "保存成功！",true);
                        queryData();
                    } else {
                        msgAlert(res.msg || "保存失败！");
                    }
                }
            })
        },
        doSelectAll: function(){
            var checked = this.checked;
            for(var k=0;k<vm.disabledTechList.length;k++){
                if(vm.disabledTechList[k].techNo){
                    vm.disabledTechList[k].checked = checked
                }
            }
        },
        doSelectTech: function(index){
            var disabledTechList = vm.disabledTechList;
            disabledTechList[index].checked = !disabledTechList[index].checked;
            if(disabledTechList[index].checked){
                var k = 0, isAllChecked = true
                for(;k<disabledTechList.length;k++){
                    if(!disabledTechList[k].checked && disabledTechList[k].techNo){
                        isAllChecked = false;
                        break;
                    }
                }
                $checkAllTech[0].checked = isAllChecked;
            } else {
                $checkAllTech[0].checked = false;
            }
        },
        doViewTech: function(techId){
            location.href = "#!/techDetail?id="+techId
        }
    });

    selectTechModal = new Modal($("#selectTechModal"),{
        doClickOkBtn: function () {
            var i = 0, disabledTechList = vm.disabledTechList, hasAdd = false;
            for(; i<disabledTechList.length;){
                if(disabledTechList[i].checked){
                    hasAdd = true;
                    disabledTechList[i].checked = false;
                    vm.enabledTechList.push(disabledTechList[i])
                    disabledTechList.splice(i, 1);
                } else {
                    i++;
                }
            }
            if(!hasAdd){
                return selectTechModal.showTip("没有勾选技师！")
            }
            selectTechModal.close()
        }
    })

    function queryData(){
        $.ajax({
            url: "api/v2/manager/fastpay/settings/tech/list",
            type: "post",
            success: function(res){
                if(res.statusCode == 200){
                    res = res.respData;
                    var enabledTechList = res.enabledTechList || [];
                    var disabledTechList = res.disabledTechList || [], k;
                    for(k=0; k<disabledTechList.length; k++){
                        if(!disabledTechList[k].avatarUrl){
                            disabledTechList[k].avatarUrl = vm.defaultHeader
                        }
                        disabledTechList[k].checked = false;
                    }
                    disabledTechList.sort(function(a,b){
                        if(!a.techNo) return 1;
                        if(!b.techNo) return -1;
                    })
                    for(k=0; k<enabledTechList.length; k++){
                        if(!enabledTechList[k].avatarUrl){
                            enabledTechList[k].avatarUrl = vm.defaultHeader
                        }
                        enabledTechList[k].checked = false;
                    }
                    vm.disabledTechList = disabledTechList;
                    vm.enabledTechList = enabledTechList;
                }
            }
        })
    }

    $.ajax({
        url: "api/v2/manager/settings/switch/get",
        data: {
            code: "fast_pay"
        },
        success: function(res){
            if(res.statusCode == 200){
                res = res.respData;
                vm.switchId = res.switchId;
                vm.fastPaySwitch = res.status == 'Y';
                if(vm.fastPaySwitch){
                    queryData();
                }
                avalon.scan(thisPage[0])
            }
        }
    })
});