require(["css!../../compressed/css/page/"+$$.rootVm.page+".css?"+$$.rootVm.currTime,"!domReady"],function(){
    var vmId = $$.rootVm.page+"Ctrl"+(+new Date()),
        thisPage = $("#"+$$.rootVm.page+"Page"),
        editRewardGiftModal;

    thisPage.attr("ms-controller",vmId);
    $$.currPath.html("打赏设置");

    var currBelongings = {}
    var vm = avalon.define({
        $id : vmId,
        moneyRewardSwitch: false, // 金钱打赏开关
        giftRewardSwitch: false, // 礼物打赏开关
        editMoneyReward: false, // 打赏金额设置是否处于编辑状态
        gifts: [], // 所有的积分礼物
        moneyRewardSetting: [], // 当前金钱打赏设置
        giftRewardSetting: [], // 当前积分打赏设置
        currSelectedGift: -1, // 当前在积分礼物库中勾选的礼物
        currSelectedEditGift: -1, // 当前选择的在编辑的礼物
        defaultGiftImg: "club-admin/img/common/gift.png",
        defaultRewardType: '', // 默认的打赏类型
        defaultRewardId: '', // 默认的打赏ID
        doClickMoneyRewardSwitch: function(){ // 点击打赏金钱开关
            vm.moneyRewardSwitch = !vm.moneyRewardSwitch
            rewardSwitch(1, vm.moneyRewardSwitch ? 1 : 0);
        },
        doEditMoneyReward: function(){ // 点击编辑按钮
            vm.editMoneyReward = !vm.editMoneyReward
            if(!vm.editMoneyReward){
                // 恢复input里面的值
                var list = $(".money-reward-setting>li"), k = 0,
                    item, moneyInput, descInput, setting = vm.moneyRewardSetting;
                for(;k<list.length;k++) {
                    item = list[k];
                    moneyInput = item.querySelector("input.money");
                    descInput = item.querySelector("input.desc");
                    moneyInput.value = (setting[k].amount/100).toFixed(2);
                    descInput.value = setting[k].description;
                }
            }
        },
        doClickRestoreMoneyDefault: function(){ // 恢复金钱打赏默认
            restoreDefaultSetting(1);
        },
        doClickSaveMoneySetting: function(){ // 保存金钱打赏设置
            if(!vm.editMoneyReward){
                msgAlert("保存成功！",true)
            } else {
                var dataArr = [],
                    list = $(".money-reward-setting>li"),
                    k = 0,
                    item, moneyInput, descInput;
                for(;k<list.length;k++){
                    item = list[k];
                    moneyInput = item.querySelector("input.money");
                    descInput = item.querySelector("input.desc");
                    descInput.value = descInput.value.trim();
                    if(!/^[0-9]+(.[0-9]{1,2})?$/.test(moneyInput.value)){
                        moneyInput.focus();
                        return msgAlert("打赏金额输入有误！")
                    }
                    if(parseFloat(moneyInput.value) < 0.0001){
                        moneyInput.focus();
                        return msgAlert("打赏金额不能为0！")
                    }
                    if(descInput.value.length != 3){
                        descInput.focus();
                        return msgAlert("请输入3个字的文字描述！")
                    }
                    //console.log("moneyInput.value:"+moneyInput.value)
                    dataArr.push({
                        id: vm.moneyRewardSetting[k].id,
                        description: descInput.value,
                        amount: Math.round(moneyInput.value * 100)
                    })
                }
                //console.log("保存打赏金额设置：")
                //console.log(JSON.stringify(dataArr));
                $$.maskPage.addClass("active")
                $.ajax({
                    url: "api/v2/manager/reward/saveRewardTip",
                    type: "post",
                    data:  { jsonData: JSON.stringify(dataArr) },
                    success: function(res){
                        if(res.statusCode == 200){
                            if(res.respData){
                                msgAlert("保存成功！",true)
                                vm.editMoneyReward = false
                                getClubMoneyRewardSetting()
                            } else{
                                msgAlert(res.msg || "保存失败！")
                            }
                        }
                    },
                    complete: function(){
                        $$.maskPage.removeClass("active")
                    }
                })
            }
        },
        doClickGiftRewardSwitch: function(){ // 点击打赏礼物开关
            vm.giftRewardSwitch = !vm.giftRewardSwitch
            rewardSwitch(0, vm.giftRewardSwitch ? 1 : 0);
        },
        doClickRestoreGiftDefault: function(){ // 恢复礼物设置
            restoreDefaultSetting(0)
        },
        doClickSaveGiftSetting: function(){ // 保存礼物设置
            $$.maskPage.addClass("active")
            var dataArr = [],
                k = 0,
                currSetting = vm.giftRewardSetting;
            for(;k<currSetting.length;k++){
                dataArr.push({
                    belongingsId: currSetting[k].belongingsId,
                    id: currSetting[k].rewardId
                })
            }
            //console.log("保存积分打赏：")
            //console.dir(dataArr)
            $.ajax({
                url: "api/v2/manager/reward/saveRewardCredit",
                type: "post",
                data: { jsonData: JSON.stringify(dataArr) },
                success: function(res){
                    if(res.statusCode == 200){
                        if(res.respData){
                            msgAlert("保存成功！",true);
                            getClubGiftRewardSetting();
                        } else {
                            msgAlert(res.msg || "保存失败！")
                        }
                    }
                },
                complete: function(){
                    $$.maskPage.removeClass("active")
                }
            })
        },
        doShowEditGift: function(index){ // 弹出礼物库Modal
            vm.currSelectedGift = -1
            vm.currSelectedEditGift = index
            editRewardGiftModal.show()
        },
        doSelectGift: function(index){ // 选择礼物库中的礼物
            vm.currSelectedGift = index;
        },
        doSelectDefault: function(id, type, tipShow){ // 设置默认值
            vm.defaultRewardType = type
            vm.defaultRewardId = id
            $.ajax({
                url: "api/v2/manager/reward/updateRewardDefault",
                data: {
                    rewardId: id, rewardType: type
                },
                type: "get",
                success: function(res){
                    if(res.statusCode == 200 && res.respData){
                        if(tipShow!=false) msgAlert("操作成功！",true)
                    }
                }
            })
        }
    });

    editRewardGiftModal = new Modal($("#editRewardGiftModal"), {
        doClickOkBtn: function () {
            if(vm.currSelectedGift == -1){
                return editRewardGiftModal.showTip("需要选择一个积分礼物！")
            } else {
                var editGift = vm.giftRewardSetting[vm.currSelectedEditGift];
                var selectedGift = vm.gifts[vm.currSelectedGift];
                currBelongings[selectedGift.belongingsId] = true
                selectedGift.show = false
                if(currBelongings[editGift.belongingsId]){
                    delete currBelongings[editGift.belongingsId]
                }
                for(var k=0;k<vm.gifts.length;k++){
                    if(vm.gifts[k].belongingsId == editGift.belongingsId){
                        vm.gifts[k].show = true;
                        break;
                    }
                }
                editGift.credit = selectedGift.credit;
                editGift.belongingsId = selectedGift.belongingsId;
                editGift.imgPath = selectedGift.imgPath;
                editRewardGiftModal.close();
            }
        }
    });

    // 获取积分打赏库
    function getGifts(){
        $.ajax({
            url: "api/v2/manager/reward/rewardCreditRepository",
            success: function(res){
                if(res.statusCode == 200){
                    var gifts = res.respData
                    if(gifts && gifts.length>0){
                        for(var i=0;i<gifts.length;i++){
                            if(!gifts[i].imgPath){
                                gifts[i].imgPath = vm.defaultGiftImg;
                            }
                            gifts[i].show = !currBelongings[gifts[i].belongingsId]
                        }
                    }
                    vm.gifts = gifts
                } else if(res.msg){
                    msgAlert(res.msg)
                }
            }
        })
    }

    function refreshGiftsShow(){
        var gifts = vm.gifts
        for(var i=0;i<gifts.length;i++){
            if(!gifts[i].imgPath){
                gifts[i].imgPath = vm.defaultGiftImg;
            }
            gifts[i].show = !currBelongings[gifts[i].belongingsId]
        }
    }

    // 获取会所金钱打赏设置
    function getClubMoneyRewardSetting(){
        $.ajax({
            url: "api/v2/manager/reward/tipList",
            success: function(res){
                if(res.statusCode == 200){
                    res = res.respData;
                    res.sort(function(a,b){
                        return a.amount > b.amount
                    })
                    if(vm.defaultRewardType == 1){
                        vm.defaultRewardId = ""
                    }
                    for(var k=0;k<res.length;k++){
                        if(res[k].defaultChoose){
                            vm.defaultRewardId = res[k].id;
                            vm.defaultRewardType = 1;
                            break;
                        }
                    }
                    vm.moneyRewardSetting = res;
                } else if(res.msg){
                    msgAlert(res.msg)
                }
            }
        })
    }

    // 获取会所积分打赏设置
    function getClubGiftRewardSetting(){
        $.ajax({
            url: "api/v2/manager/reward/creditList",
            success: function(res){
                if(res.statusCode == 200){
                    var currGifts = res.respData
                    currBelongings = {}
                    for(var i=0;i<currGifts.length;i++){
                        currBelongings[currGifts[i].belongingsId] = true
                    }
                    currGifts.sort(function(a,b){
                        return a.credit > b.credit
                    })
                    if(vm.defaultRewardType == 0){
                        vm.defaultRewardId = ""
                    }
                    for(var k=0;k<currGifts.length;k++){
                        if(currGifts[k].defaultChoose){
                            vm.defaultRewardId = currGifts[k].rewardId;
                            vm.defaultRewardType = 0;
                            break;
                        }
                    }
                    vm.giftRewardSetting = currGifts
                    if(vm.gifts.length == 0){
                        getGifts();
                    } else {
                        refreshGiftsShow()
                    }
                }
            }
        })
    }

    // 恢复默认设置
    function restoreDefaultSetting(type){
        $$.maskPage.addClass("active")
        $.ajax({
            url: "api/v2/manager/reward/recoveryDefault",
            data: {
                clubId: $$.clubId,
                rewardType: type
            },
            success: function(res){
                if(res.statusCode == 200 && res.respData){
                    if(type == 0) {
                        getClubGiftRewardSetting();
                    } else {
                        getClubMoneyRewardSetting();
                    }
                    msgAlert("操作成功！",true);
                } else {
                    msgAlert(res.msg || "操作失败！");
                }
            },
            complete: function(){
                $$.maskPage.removeClass("active")
            }
        })
    }

    // 控制打赏开关
    function rewardSwitch(type, status){
        $.ajax({
            url: "api/v2/manager/reward/opSwitch",
            type: "post",
            data: {
                clubId: $$.clubId,
                rewardType: type,
                status: status,
                haveDefault: status==1 ? false : (vm.defaultRewardType==type)
            },
            success: function(res){
                if(res.statusCode == 200 && res.respData){
                    msgAlert("操作成功！",true)
                } else {
                    msgAlert(res.msg || "操作失败！")
                    // 开关操作失败，恢复之前的状态
                    if(type==0){
                        vm.giftRewardSwitch = !vm.giftRewardSwitch
                    } else{
                        vm.moneyRewardSwitch = !vm.moneyRewardSwitch
                    }
                }
                // 当打开开关时重新查询数据
                if(vm.giftRewardSwitch){
                    getClubGiftRewardSetting();
                }
                if(vm.moneyRewardSwitch){
                    getClubMoneyRewardSetting();
                }
            }
        })
    }

    $(".money-reward-setting").on("input","input.money", function(){
        var val = this.value;
        if(val.length == 1){
            if(/\D/.test(val)){
                val = ""
            }
        } else{
            val = val.replace(/[^\d\.]/g,"")
            var dotIndex = 0
            val = val.replace(/\./g,function(){
                if(dotIndex == 0){
                    dotIndex = arguments[1]
                    return "."
                } else {
                    return ""
                }
            })
            if(dotIndex>0){
                val = val.substring(0,dotIndex+3)
            }
        }
        this.value = val;
    })

    $.ajax({
        url: "api/v2/manager/reward/getSwitchStatu",
        success: function(res){
            if(res.statusCode == 200 && res.respData){
                res = res.respData
                for(var i=0;i<res.length;i++){
                    if(res[i].type=="0"){
                        vm.giftRewardSwitch = (res[i].status == 1)
                    } else {
                        vm.moneyRewardSwitch = (res[i].status == 1)
                    }
                }
                if(vm.giftRewardSwitch){
                    getClubGiftRewardSetting();
                }
                if(vm.moneyRewardSwitch){
                    getClubMoneyRewardSetting();
                }
                avalon.scan(thisPage[0])
            }
        }
    })
});