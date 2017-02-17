require(["css!../../compressed/css/page/"+$$.rootVm.page+".css?"+$$.rootVm.currTime,"css!../../compressed/css/common/kindeditor.css","kindeditor","kindeditor_zhCn","jqform","cropper","daterangepicker","!domReady"],function(){
    var vmId = $$.rootVm.page+"Ctrl"+(+new Date()),
        thisPage = $("#"+$$.rootVm.page+"Page"),
        imagePreview,
        editForm = $("#editForm"),
        imgDiv = $("#editForm>div.img"),
        currEditImageId = $("#currEditImageId"),
        addImgBrowserClick = false,
        editor,
        cardId = getParamObj("id") || "", // 当前编辑的次卡状态，未发布或者已发布
        $packageCountInput = $("input.package"),
        $techTip = $("input.tech-tip"),
        $dateInput = $('.need-date'),
        $onceCardName = $("#onceCardName"),
        $totalCount = $("#totalCount"),
        $personalLimit = $("#personalLimit"),
        $panelContent = $(".panel-content"),
        k;

    thisPage.attr("ms-controller",vmId);
    $$.currPath.html(cardId ? "编辑次卡" : "新建次卡");

    var vm = avalon.define({
        $id : vmId,
        cardStatus: cardId ? "1" : "0", // 当前正编辑的次卡状态，默认为已发布
        serviceItems: [], // 服务项目列表
        currSelectServiceItem: { id : "", name: "", duration: "", durationUnit: "", price: "" }, // 当前选中的服务项目
        packagePrice: [
            { originalAmount: '-', actAmount: '-', actSinglePrice: '-' }, { originalAmount: '-', actAmount: '-', actSinglePrice: '-' }, { originalAmount: '-', actAmount: '-', actSinglePrice: '-' }
        ],
        doChangeServiceItem: function(){
            var items = vm.serviceItems, k = 0;
            for(;k<items.length;k++){
                if(items[k].id == this.value){
                    vm.currSelectServiceItem = items[k];
                    refreshPackagePrice(0);
                    refreshPackagePrice(1);
                    refreshPackagePrice(2);
                    break;
                }
            }
        },
        doSave: function(isPublish){ // 是否发布
            if(doCheckForm()){
                $$.maskPage.addClass("active")

                if(!$("#currEditImageId").val() && vm.cardStatus ==0){ // 上传banner pic，获取img id
                    $("#editForm").ajaxSubmit({
                        dataType: 'json',
                        success: function (res) {
                            if(res.statusCode == 200){
                                $("#currEditImageId").val(res.respData)
                                doSaveOnceCard(isPublish)
                            } else {
                                msgAlert(res.msg || "图片上传失败！");
                                $$.maskPage.removeClass("active");
                            }
                        }
                    })
                } else {
                    doSaveOnceCard(isPublish)
                }
            }
        },
        validPeriod: [{ label: '一年', value: '1Y', selected: true }, { label: '9个月', value: '9M', selected: false }, { label: '6个月', value: '6M', selected: false }, { label: '3个月', value: '3M', selected: false }]
    });

    // 可售时间
    $dateInput.daterangepicker({
        singleDatePicker:true,
        locale:{ format:'YYYY-MM-DD' }
    });
    $dateInput.val('');

    imagePreview = new iCropper({
        imgFile : $("#uploadImgBtn")[0],
        img : $("#editForm>div.img>img")[0],
        imgName : $("#imgFileName")[0],
        imgId : $("#currEditImageId")[0],
        selectionTxt : $("#editForm>div.img>span.selectionTxt")[0],
        x : $("#x")[0],
        y : $("#y")[0],
        w : $("#w")[0],
        h : $("#h")[0],
        ratioW : 2.057,
        ratioH : 1,
        onImgLoad : function(){
            if(!imgDiv.hasClass("hasImg")){
                imgDiv.addClass("hasImg");
            }
        }
    });

    initKindEditor();

    function initKindEditor(){
        var addClassFn = function(){
            if($('.ke-dialog-default').length > 0){
                $('.ke-dialog-default').addClass('oneYuan-image-dialog');
            } else {
                setTimeout(function () {
                    addClassFn();
                },50);
            }
        };
        if(editor) editor.remove();
        editor= KindEditor.editor({
            fileManagerJson : 'club-admin/data/oneYuan/oneYuanDefaultImages.json',
            allowFileManager : true
        });

        if(addImgBrowserClick==false){
            KindEditor('#fileManager').click(function() {
                addClassFn();
                editor.loadPlugin('filemanager', function() {
                    editor.plugin.filemanagerDialog({
                        viewType : 'VIEW',
                        dirName : 'image',
                        clickFn : function(id,fileUrl) {
                            imagePreview.clean();
                            imagePreview.load(fileUrl,{
                                autoCropArea : 1, disabled : true
                            });
                            editForm.addClass("hasImg");
                            currEditImageId.val(id);
                            editor.hideDialog();
                        }
                    });
                });
            });
            addImgBrowserClick = true;
        }
    }

    // 表单输入限制
    $(".int").on("input",function(){
        var val = this.value;
        if(val){
            val = val.replace(/\D/g,"")
        }
        this.value = val;
        if(/package/.test(this.className) && parseInt(this.value==0)){
            this.value =0;
        }
    })

    // 套餐次数输入监听
    $packageCountInput.on("input", function(){
        refreshPackagePrice(parseInt(this.getAttribute("package-index")));
    })

    // 技师佣金限定输入两位小数
    $techTip.on("input",function(){
        var val = this.value;
        if(val.length == 1){
            if(/\D/.test(val)){
                val = ""
            }
        } else{
            val = val.replace(/[^\d.]/g,"")
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

    // 更新套餐界面上显示的价格
    function refreshPackagePrice(packageIndex){
        var paidCount = $packageCountInput[packageIndex * 2].value,
            giveCount = $packageCountInput[packageIndex * 2+1].value || 0,
            packagePriceObj = vm.packagePrice[packageIndex],
            currServicePrice = vm.currSelectServiceItem.price - 0;
        if(paidCount && currServicePrice){
            paidCount = paidCount - 0;
            giveCount = giveCount - 0;
            packagePriceObj.originalAmount = ((paidCount +giveCount)*currServicePrice).toFixed(2);
            packagePriceObj.actAmount = (paidCount*currServicePrice).toFixed(2);
            packagePriceObj.actSinglePrice = ((packagePriceObj.actAmount)/(paidCount +giveCount)).toFixed(2)
        } else {
            packagePriceObj.originalAmount = "-";
            packagePriceObj.actAmount = "-";
            packagePriceObj.actSinglePrice = "-";
        }
    }

    //校验表单
    function doCheckForm(){
        if(vm.cardStatus ==0){
            var bannerImg = $("#editForm>div.img>img");
            if(bannerImg[0] && bannerImg[0].width !=0){
                var checkRes = imagePreview.checkSelectionValidate();
                if(checkRes != "OK"){
                    msgAlert(checkRes);
                    return false;
                }
            } else {
                msgAlert("请您上传图片！");
                return false;
            }

            if(!vm.currSelectServiceItem.id){
                msgAlert("服务项目为空！");
                $("select.service-item").focus();
                return false;
            }

            if(vm.packagePrice[0].originalAmount == "-" && vm.packagePrice[1].originalAmount == "-" && vm.packagePrice[2].originalAmount == "-"){
                msgAlert("请您设置套餐！");
                return false;
            }

            var paidCountArr = [];
            for(var i=0;i<3;i++){
                if(vm.packagePrice[i].originalAmount != "-"){
                    if($techTip[i].value == ""){
                        msgAlert("技师提成不能为空！")
                        $techTip[i].focus();
                        return false;
                    } else if(parseFloat($techTip[i].value) > parseFloat(vm.packagePrice[i].actAmount)){
                        msgAlert("套餐"+String.fromCharCode(65+i)+"设置的技师佣金大于了总售价！");
                        $techTip[i].focus();
                        return false;
                    }
                    paidCountArr.push($packageCountInput[2*i].value);
                }
            }
            //console.log("paidCountArr："+JSON.stringify(paidCountArr))
            if(paidCountArr.length==2 && paidCountArr[0] == paidCountArr[1]){
                msgAlert("套餐数量不能设置为相同！");
                return false
            }
            if(paidCountArr.length == 3 && (paidCountArr[0]==paidCountArr[1] || paidCountArr[0]==paidCountArr[2] || paidCountArr[1]==paidCountArr[2])){
                msgAlert("套餐数量不能设置为相同！");
                return false
            }
        }

        if($totalCount.val() && $personalLimit.val() && parseInt($personalLimit.val())>parseInt($totalCount.val())){
            msgAlert("每人限购数不能大于总数！");
            $personalLimit[0].focus();
            return false;
        }

        if($dateInput[0].value && $dateInput[1].value && $dateInput[0].value > $dateInput[1].value){
            msgAlert("可售结束时间须大于开始时间！");
            return false;
        }
        if($dateInput[1].value && $dateInput[1].value<formatDate(new Date())){
            msgAlert("可售结束时间须大于今日！");
            return false;
        }

        return true;
    }

    // 保存次卡信息
    function doSaveOnceCard(isPublish){
        var paramObj = {}, plans = [];
        paramObj["activity.id"] = cardId;
        paramObj["activity.period"] = $("#cardPeriod").val();
        paramObj["activity.status"] = isPublish ? 1 : 0;
        paramObj["activity.endTime"] = $dateInput[1].value;
        paramObj["activity.startTime"] = $dateInput[0].value;

        if(vm.cardStatus ==0){ // 未发布或者新建状态
            var cardName = $onceCardName.val();
            if(cardName){
                $onceCardName.val(cardName.trim())
            }
            paramObj["activity.description"] = $("#act-description").val();
            paramObj["activity.image"] = $("#currEditImageId").val();
            paramObj["activity.itemId"] = vm.currSelectServiceItem.id;
            paramObj["activity.name"] = $onceCardName.val();
            paramObj["activity.personalLimit"] = $personalLimit.val();
            paramObj["activity.totalCount"] = $totalCount.val();

            // 套餐
            var giveCountArr = [], nameArr = [], paidCountArr = [], techAmountArr = [];
            for(var i=0;i<3;i++){
                if(vm.packagePrice[i].originalAmount != "-"){
                    giveCountArr.push($packageCountInput[2*i+1].value);
                    nameArr.push(String.fromCharCode(65+i));
                    paidCountArr.push($packageCountInput[2*i].value);
                    techAmountArr.push(Math.round($techTip[i].value*100));
                }
            }

            paramObj["plans.giveCount"] = giveCountArr;
            paramObj["plans.name"] = nameArr;
            paramObj["plans.paidCount"] = paidCountArr;
            paramObj["plans.techAmount"] = techAmountArr;
        }
        //console.log(JSON.stringify(paramObj))

        $.ajax({
            url: "api/v2/manager/once_card/activity/save",
            data: paramObj,
            type: "post",
            traditional: true,
            success: function(res){
                if(res.statusCode == 200){
                    msgAlert("操作成功！",true);
                    location.href = "#!/onceCards"
                } else {
                    msgAlert(res.msg || "保存失败！")
                }
            },
            complete: function(){
                $$.maskPage.removeClass("active");
            }
        })
    }

    // 获取待编辑的次卡信息
    $.ajax({
        url: "api/v2/manager/once_card/activity/edit",
        data: {
            activityId: cardId
        },
        success: function(res){
            if(res.statusCode == 200){
                res = res.respData;
                vm.serviceItems = res.items;

                // 设置次卡信息
                if(res.activity){
                    var actData = res.activity;
                    vm.cardStatus = actData.status;
                    $("#act-description").val(actData.description);
                    $onceCardName.val(actData.name);
                    $("#cardPeriod").val(actData.period);
                    for(k=0;k<vm.validPeriod.length;k++){
                        vm.validPeriod[k].selected = vm.validPeriod[k].value == actData.period
                    }

                    if(actData.personalLimit != 0){
                        $personalLimit.val(actData.personalLimit)
                    }
                    if(actData.totalCount != 0){
                        $totalCount.val(actData.totalCount)
                    }
                    if(actData.startTime){
                        var startTimePicker = $($dateInput[0]).data('daterangepicker');
                        startTimePicker.setStartDate(actData.startTime);
                        startTimePicker.setEndDate(actData.startTime);
                        $dateInput[0].value = actData.startTime;
                    }
                    if(actData.endTime){
                        var endTimePicker = $($dateInput[1]).data('daterangepicker');
                        endTimePicker.setStartDate(actData.endTime);
                        endTimePicker.setEndDate(actData.endTime);
                        $dateInput[1].value = actData.endTime;
                    }

                    // 设置banner图
                    if(actData.image){
                        currEditImageId.val(actData.image);
                    }
                    if(actData.imageUrl){
                        imagePreview.clean();
                        imagePreview.load(actData.imageUrl,{ autoCropArea : 1, disabled : true });
                        editForm.addClass("hasImg");
                    }
                }

                // 设置服务项目
                if(res.items.length>0){
                    if(cardId == ""){ // 新增次卡时，默认的选中服务项目为第一项
                        vm.currSelectServiceItem = res.items[0];
                    } else if(res.activity){
                        for(k=0;k<res.items.length;k++){
                            if(res.items[k].id == res.activity.itemId){
                                vm.currSelectServiceItem = res.items[k];
                                break;
                            }
                        }
                    }
                }

                // 设置套餐信息
                if(res.plans && res.plans.length>0){
                    var plans = res.plans, plan, planIndex, packagePriceObj;
                    for(k=0;k<plans.length;k++){
                        plan = plans[k];
                        planIndex = plan.name.charCodeAt(0) - 65;
                        packagePriceObj = vm.packagePrice[planIndex];
                        packagePriceObj.originalAmount = ((plan.itemAmount*(plan.giveCount+plan.paidCount))/100).toFixed(2);
                        packagePriceObj.actAmount = (plan.actAmount/100).toFixed(2);
                        packagePriceObj.actSinglePrice = (packagePriceObj.actAmount/(plan.paidCount+plan.giveCount)).toFixed(2);
                        $packageCountInput[planIndex*2].value = plan.paidCount;
                        $packageCountInput[planIndex*2+1].value = plan.giveCount;
                        $techTip[planIndex].value = (plan.techAmount/100).toFixed(2);
                    }
                }

                avalon.scan(thisPage[0]);
            } else {
                msgAlert(res.msg || "查询次卡信息失败！");
                history.back();
            }
        }
    })

    var $win = $(window);
    function resizePanelContentHeight(){
        $panelContent.height(($win.height()-195)+"px")
    }
    $win.on("resize",function(){
        resizePanelContentHeight()
    })
    resizePanelContentHeight();
});