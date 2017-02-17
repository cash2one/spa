require(["css!../../compressed/css/page/"+$$.rootVm.page+".css?"+$$.rootVm.currTime,"!domReady"],function(){
    var vmId = $$.rootVm.page+"Ctrl"+(+new Date()),
        thisPage = $("#"+$$.rootVm.page+"Page"),
        chargeModal,
        chargeAccount = $("#charge-account"),
        chargeValue = $("#charge-value"),
        chargeRemark = $("#charge-remark"),
        creditPerConsume = $("#creditPerConsume"),
        creditPerRegister = $("#creditPerRegister"),
        creditPerExchange = $("#creditPerExchange"),
        creditExchangeLimitation = $("#creditExchangeLimitation"),
        creditTechRegister = $("#creditTechRegister"),
        creditTechRegisterTag = creditTechRegister.parent(),
        creditOfCharge = $("#creditOfCharge"),
        creditOfChargeTag = creditOfCharge.parent(),
        defaultTip = "输入用户或技师手机号，以逗号分隔";

    chargeAccount.plainTextOnly();
    chargeRemark.plainTextOnly();

    thisPage.attr("ms-controller",vmId);
    $$.currPath.html("积分管理");

    var vm = avalon.define({
        $id : vmId,
        deliverAmount : 0,
        recycleAmount : 0,
        settingSwitch : "off",
        selectedTab : "user",
        selectChargeType : '',
        checkAccountType : 'user',
        setDefaultSetting:false,    //采用默认配置
        defaultSetting:{},
        doCheckAll : function(type){
            vm.selectChargeType = type;
        },
        changeChargeType : function(type){
            vm.checkAccountType = type;
        },
        doClickSwitch : function(){
            var distSwitch = (vm.settingSwitch == "on" ? "off" : "on" );
            if(distSwitch == "on" && !checkCfgForm()){
                return;
            }
            $.ajax({
                url : "club/credit//system/switch",
                data : { status : distSwitch },
                success : function(res){
                    if(res.statusCode == 200){
                        vm.settingSwitch = distSwitch;
                        if(vm.settingSwitch == "on"){////保存设置
                            vm.doClickSaveCfgBtn();
                        }
                        /*else if(vm.setDefaultSetting){
                            setDefault();
                        }else {
                            creditExchangeLimitation.val("");
                            creditPerConsume.val("");
                            creditPerExchange.val("");
                            creditPerRegister.val("");
                        }*/
                    }
                    else{
                        msgAlert(res.msg || "操作失败！");
                    }
                }
            });
        },
        doClickChargeBtn : function(){////点击充值按钮
            chargeAccount.html(defaultTip);
            chargeAccount.addClass("tip");
            chargeValue.val("");
            chargeRemark.html("");
            chargeModal.show();
        },
        doClickSaveCfgBtn : function(){////点击保存设置按钮
            if(checkCfgForm()){
                $.ajax({
                    url : "club/credit/settings/save",
                    data : {
                        clubId : $$.clubId,
                        creditExchangeLimitation : creditExchangeLimitation.val() || 0,
                        creditPerConsume : creditPerConsume.val(),
                        creditPerExchange : creditPerExchange.val(),
                        creditPerRegister : creditPerRegister.val() || 0,
                        creditPerTechRegister : creditTechRegisterTag.hasClass("check") ? creditTechRegister.val() : 0,
                        creditPerCharge : creditOfChargeTag.hasClass("check") ? creditOfCharge.val() : 0
                    },
                    success : function(res){
                        if(res.statusCode == 200){
                            msgAlert("保存成功！",true);
                        }
                        else{
                            msgAlert(res.msg || "保存失败！");
                        }
                    }
                });
            }
        },
        doClickUseDefault: function () {
            setDefault();
        }
    });

    function checkCfgForm(){
        if(creditPerConsume.val().length==0){
            creditPerConsume.focus();
            msgAlert("请输入每消费1元获取的积分数量！");
            return false;
        }
        else if(parseInt(creditPerConsume.val())==0){
            creditPerConsume.focus();
            msgAlert("每消费1元获取的积分数量不能为0！");
            return false;
        }
        /*if(creditPerRegister.val().length==0){
            creditPerRegister.focus();
            msgAlert("请输入注册赠送积分数量！");
            return false;
        }*/
        if(creditPerExchange.val().length==0){
            creditPerExchange.focus();
            msgAlert("请输入技师每兑换1元所需积分数量！");
            return false;
        }
        else if(parseInt(creditPerExchange.val()) == 0){
            creditPerExchange.focus();
            msgAlert("技师每兑换1元所需积分数量不能为0！");
            return false;
        }
       /* if(creditExchangeLimitation.val().length==0){
            creditExchangeLimitation.focus();
            msgAlert("请输入技师起提积分数量！");
            return false;
        }*/

        if(creditTechRegisterTag.hasClass("check")){
            if(creditTechRegister.val().length==0){
                creditTechRegister.focus();
                msgAlert("请输入技师注册赠送积分数量！");
                return false;
            }
            else if(parseInt(creditTechRegister.val()) == 0){
                creditTechRegister.focus();
                msgAlert("技师注册赠送积分数量不能为0！");
                return false;
            }
        }

        if(creditOfChargeTag.hasClass("check")){
            if(creditOfCharge.val().length==0){
                creditOfCharge.focus();
                msgAlert("请输入充值赠送积分数量！");
                return false;
            }
            else if(parseInt(creditOfCharge.val()) == 0){
                creditOfCharge.focus();
                msgAlert("充值赠送积分数量不能为0！");
                return false;
            }
        }
        return true;
    }

    ////////////////////////////////////////////////输入限制
    $("div#settingCfg").on("input","div.item>input",function(){
        if(/\D/.test(this.value)){
            this.value=this.value.replace(/\D/g,'');
        }
        if(this.value.length>9){
            this.value = this.value.substring(0,9);
        }
    });

    $("div#settingCfg").on("click","div.item>i",function(){
        var $this = $(this), $parent = $this.parent();
        if(!$parent.hasClass("disable")){
            $parent.toggleClass("check");
        }
    });

    chargeValue.on("input",function(){
        if(/\D/.test(this.value)){
            this.value=this.value.replace(/\D/g,'');
        }
        if(this.value.length>9){
            this.value = this.value.substring(0,9);
        }
    });

    chargeAccount.on("input",function(){
        if(this.innerHTML == defaultTip){
            this.innerHTML = "";
            chargeAccount.removeClass("tip");
        }
        /*if (/[^0-9,]/.test(this.innerHTML)) {
            this.innerHTML = this.innerHTML.replace(/[^0-9,]/g,'');
        }*/
    });

    chargeAccount.blur(function(){
        if(this.innerHTML.trim() == ""){
            this.innerHTML = defaultTip;
            chargeAccount.addClass("tip");
        }
    });

    chargeAccount.focus(function(){
        if(this.innerHTML == defaultTip){
            this.innerHTML = "";
            chargeAccount.removeClass("tip");
        }
    });

    chargeModal = new Modal($("#chargeModal"),{
        doClickOkBtn : function(){
            if(checkChargeForm()){
                chargeModal.loading();
                if(vm.selectChargeType==""){
                    doCharge(vm.checkAccountType);
                }
                else{
                    doChargeAll(vm.selectChargeType);
                }
            }
        }
    });

    function doChargeAll(type){
        $.ajax({
            url : "club/credit/charge/all",
            data : {
                userType : type,
                amount :  chargeValue.val(),
                remark : chargeRemark.text().substr(0,1000)
            },
            success : function(res){
                if(res.statusCode == 200){
                    msgAlert(res.msg || "充值成功！",true);
                    chargeModal.loading("hide");
                    chargeModal.close();
                }
                else{
                    chargeModal.showTip(res.msg || "充值失败！");
                }
            },
            complete : function(){
                chargeModal.loading("hide");
            }
        });
    }

    function doCharge(type){
        $.ajax({
            url : "club/credit/charge",
            type : "post",
            data : {
                userType : type,
                telephone : chargeAccount.html().trim().replace(/，/g,","),
                amount :  chargeValue.val(),
                remark : chargeRemark.text().substr(0,1000)
            },
            success : function(res){
                if(res.statusCode == 200){
                    chargeModal.close();
                    queryClubAmount();
                    msgAlert(res.msg || "充值成功！",true);
                }
                else{
                    chargeModal.showTip(res.msg || "充值失败！");
                }
            },
            complete : function(){
                chargeModal.loading("hide");
            }
        });
    }

    function checkChargeForm(){
        if(vm.selectChargeType==""){
            if((!chargeAccount.html() || chargeAccount.html().trim() == defaultTip)){
                //chargeAccount.focus();
                chargeModal.showTip("请输入充值账号！");
                return false;
            }
            else{
                var str = chargeAccount.html().replace(/，/g,","),telArr = str.split(","),k;
                for(k=0;k<telArr.length;k++){
                    if(!/^1[34578]\d{9}$/.test(telArr[k])){
                        //chargeAccount.focus();
                        chargeModal.showTip("手机号码输入有误！");
                        return false;
                    }
                }
            }
        }

        if(!chargeValue.val()){
            chargeValue.focus();
            chargeModal.showTip("请输入充值积分！");
            return false;
        }
        return true;
    }

    function queryClubAmount(){
        $.ajax({
            url : "club/credit/account",
            success : function(res){
                if(res.statusCode == 200){
                    if(res.respData){
                        res = res.respData;
                        vm.deliverAmount = res.deliverAmount;
                        vm.recycleAmount = res.recycleAmount;
                    }
                }
            }
        });
    }

    ////////////////////////////////获取积分系统开关状态
    $.ajax({
        url : "club/credit/switch/status",
        data : { clubId : $$.clubId },
        success : function(res){
            getDefaultSetting();    //获取默认的积分配置信息
            if(res.statusCode==200){
                vm.settingSwitch = (res.respData.clubSwitch=="on" ? "on" : "off");
                if(vm.settingSwitch=="on"){////获取商家积分配置
                    $.ajax({
                        url : "club/credit/settings/get",
                        data : { clubId : $$.clubId },
                        success : function(cfgRes){
                            if(cfgRes.statusCode == 200){
                                cfgRes = cfgRes.respData;
                                if(cfgRes){
                                    creditPerRegister.val(cfgRes.creditPerRegister);
                                    creditExchangeLimitation.val(cfgRes.creditExchangeLimitation);
                                    creditPerConsume.val(cfgRes.creditPerConsume);
                                    creditPerExchange.val(cfgRes.creditPerExchange);
                                    if(cfgRes.creditPerTechRegister && cfgRes.creditPerTechRegister>0){
                                        creditTechRegisterTag.addClass("check");
                                        creditTechRegister.val(cfgRes.creditPerTechRegister);
                                    }
                                    if(cfgRes.creditPerCharge && cfgRes.creditPerCharge>0){
                                        creditOfChargeTag.addClass("check");
                                        creditOfCharge.val(cfgRes.creditPerCharge);
                                    }
                                }
                            }
                        }
                    });
                }
            }
        }
    });

    queryClubAmount();
    avalon.scan(thisPage[0]);

    /**
     * 获取默认的积分配置信息
     */
    function getDefaultSetting(){
        $.ajax({
            url:'club/credit/settings/getDefault',
            data:{
                clubId:$$.clubId
            },
            success: function (result) {
                if(result.statusCode == 200){
                    vm.setDefaultSetting = true;
                    vm.defaultSetting = result.respData;
                    if(vm.settingSwitch !== 'on'){      //当积分未开时，将默认配置信息设置到对应在文本框中
                        setDefault();
                    }
                }
            }
        });
    }

    function setDefault(){
        var defaultSetting = vm.defaultSetting;
        creditPerRegister.val(defaultSetting.creditPerRegister);
        creditExchangeLimitation.val(defaultSetting.creditExchangeLimitation);
        creditPerConsume.val(defaultSetting.creditPerConsume);
        creditPerExchange.val(defaultSetting.creditPerExchange);
        if(defaultSetting.creditPerTechRegister && defaultSetting.creditPerTechRegister>0){
            creditTechRegisterTag.addClass("check");
            creditTechRegister.val(defaultSetting.creditPerTechRegister);
        }
        if(defaultSetting.creditPerCharge && defaultSetting.creditPerCharge>0){
            creditOfChargeTag.addClass("check");
            creditOfCharge.val(defaultSetting.creditPerCharge);
        }
    }

});