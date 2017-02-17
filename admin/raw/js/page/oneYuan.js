require(["css!../../compressed/css/page/"+$$.rootVm.page+".css?"+$$.rootVm.currTime,"daterangepicker",'colorbox'
    ,"css!../../compressed/css/common/kindeditor.css"
    ,"kindeditor","kindeditor_zhCn","jqform","cropper","!domReady"],function(){
    var vmId = $$.rootVm.page+"Ctrl"+(+new Date()),
        thisPage = $("#"+$$.rootVm.page+"Page"),
        imagePreview,
        editForm = $("#editForm"),
        confirmModal,
        confirmModalEle = $("#confirmModal"),
        confirmModalContent = $("#confirmModal>div>div.content"),
        currEditImageId = $("#currEditImageId"),
        editor,
        editOneYuanModal,
        addImgBrowserClick = false,
        itemPriceSpan = $('#itemPriceSpan'),
        confirmModalObj = {
            title:{online:'谁替我买单上线',not_online:'谁替我买单下线',stop_period:'停止连期',start_period:'开始连期'},
            text:{
                online:'项目一旦上线后无法随意更改，请确认是否上线',
                not_online:'项目一旦下线后会影响用户购买及体验，请确认是否下线',
                stop_period:'停止连期后，该活动在买满结束后将不会自动创建新活动',
                start_period:'开始连期后，该活动在买满结束后将会自动创建新活动'
            },
            btnText:{
                online:'上线',
                not_online:'下线',
                stop_period:'停止连期',
                start_period:'开始连期'
            }
        },
        statusObj = {
            online:'已上线',
            not_online:'未上线',
            end:'已结束',
            complete:'已完成',
            refund:'已退款'
        },
        $itemSelect = $('#itemSelect'),
        $maxPeriod = $('#maxPeriod'),
        $periodValidity = $('#periodValidity'),
        itemDescriptionContent = $('#itemDescriptionContent'),
        itemDescription = $('#itemDescription'),
        dataListPagination,
        $currEditId = $('#currEditId'),
        $unitPrice = $('#unitPrice');

    itemDescriptionContent.plainTextOnly();

    thisPage.attr("ms-controller",vmId);
    $$.currPath.html("谁替我买单记录");

    avalon.filters.actStatusFilter=function(str){
        return statusObj[str] || '';
    };

    var vm = avalon.define({
        $id : vmId,
        dataList : [],
        statusObj : [{"name":"全部状态","value":""},{"name":"已上线","value":"online"},{"name":"未上线","value":"not_online"},{"name":"已结束","value":"end"},{"name":"已完成","value":"complete"},{"name":"已退款","value":"refund"}],
        currStatus : "",
        serviceItems : [],
        currCategoryId : '',
        currOpera:{
            flag:'',        //上线，下线，停止连期
            title:'',       //上线，下线，停止连期
            text:'',
            btnText:''
        },
        currPage: 1,
        pageSize: 10,
        editObj:{
            title:'',
            flag:'',
            item:{
                currentPeriod:1,
                maxPeriod: 1
            }
        },
        currEditId: -1,     //-1表示新增
        hasItem:false,      //是否已经选择了项目
        currPeriodValidity: 15, //默认活动时间：15天
        currProjectPrice: 0,    //当前项目价格
        currUnitPrice:1,    //当前活动单价
        currCount: 0,       //当前可购买的份数
        addOneYuan:function(){
            $currEditId.val(-1);
            vm.editObj.title = '新增';
            vm.editObj.flag = 'add';
            vm.currCategoryId = '';
            vm.currProjectPrice = 0;
            vm.currUnitPrice = 1;
            vm.currCount = 0;
            vm.currPeriodValidity = 15;
            $itemSelect.val('');
            $maxPeriod.val(1);
            currEditImageId.val("");
            itemDescriptionContent.html('');
            imagePreview.clean();
            editForm.removeClass("hasImg");
            editOneYuanModal.show();
        },
        doEditOneYuan: function (index) {
            var itemObj = vm.dataList[index];
            vm.editObj.title = '修改';
            vm.editObj.flag = 'modify';
            vm.editObj.item = itemObj;

            getBaseInfo(itemObj,true);
        },
        doCheckOneYuan: function (index) {
            var itemObj = vm.dataList[index];
            vm.editObj.title = '详情';
            vm.editObj.flag = 'check';
            getBaseInfo(itemObj);
        },
        doOperaConfirm: function (flag,index) {
            vm.currOpera.flag = flag;
            vm.currOpera.title = confirmModalObj.title[flag];
            vm.currOpera.text = confirmModalObj.text[flag];
            vm.currOpera.btnText = confirmModalObj.btnText[flag];
            vm.currOpera.item = vm.dataList[index];
            if(vm.dataList[index].status == 'end' || vm.dataList[index].status == 'refund' || vm.dataList[index].status == 'complete'){
                vm.currOpera.text = '项目一旦上线后无法随意更改(此次上线的为下一期活动)，请确认是否上线';
            }
            confirmModal.show();
        },
        //==== 更改项目 ===
        projectChange: function () {
            var self = this;
            if(!this.value){
                vm.hasItem = false;
                vm.currCategoryId = '';
                itemPriceSpan.text( '0 元');
                return;
            }
            vm.hasItem = true;
            vm.serviceItems.forEach(function (item) {
                if(item.id == self.value){
                    vm.currProjectPrice = item.price || 0;
                    if(vm.currUnitPrice && vm.currProjectPrice > 0){
                        var tmpCount = vm.currProjectPrice / vm.currUnitPrice;
                        if(tmpCount % parseInt(tmpCount) != 0){
                            vm.currCount = tmpCount.toFixed(1);
                        }else{
                            vm.currCount = tmpCount.toFixed(0);
                        }
                    }else{
                        vm.currCount = 0;
                    }
                    return false;
                }
            });
        },
    });

    vm.$watch('currUnitPrice', function (newValue, oldValue) {
        if(newValue && vm.currProjectPrice > 0){
            vm.currCount = Math.ceil(vm.currProjectPrice / newValue);
        }else{
            vm.currCount = 0;
        }
    });

    function getBaseInfo(item,isEdit){
        $.ajax({
            url:'club/one_yuan/view',
            data:{
                oneYuanBaseId: item.oneYuanBaseId
            },
            success:function(result){
                if(result.statusCode == 200){
                    result = result.respData;
                    $currEditId.val(result.id);
                    $itemSelect.val(result.prizeId);
                    $maxPeriod.val(result.maxPeriod);
                    $maxPeriod[0].dataset['minValue'] = item.currentPeriod;
                    $maxPeriod[0].dataset['maxPeriod'] = item.maxPeriod;
                    //$periodValidity.val(result.periodValidity);
                    vm.currPeriodValidity = result.periodValidity;
                    if(isEdit){
                        vm.serviceItems.forEach(function (item) {
                            if(item.id == result.prizeId){
                                vm.currProjectPrice = item.price ? item.price - 0 : 0;
                                return false;
                            }
                        });
                    }else{
                        vm.currProjectPrice = result.actPrice - 0;
                    }

                    vm.currUnitPrice = result.unitPrice - 0;
                    $periodValidity.val(vm.currPeriodValidity);
                    $unitPrice.val(vm.currUnitPrice);
                    currEditImageId.val(result.image);
                    itemDescription.val(result.actDescription);
                    itemDescriptionContent.html(result.actDescription);
                    if(result.imageUrl){
                        imagePreview.load(result.imageUrl,{
                            autoCropArea : 1, disabled : true
                        });
                        editForm.addClass("hasImg");
                    }
                    else{
                        imagePreview.clean();
                        editForm.removeClass("hasImg");
                    }
                    editOneYuanModal.show();
                }else{
                    msgAlert(result.msg || '查询数据失败');
                }
            }
        });
    }

    //////////////////分页器
    dataListPagination = new Pagination($("#dataListPagination"),{
        switchPage : function(page){
            queryData(page);
        }
    });

    confirmModal = new Modal(confirmModalEle,{
        doClickOkBtn : function(){
            confirmModal.loading();
            var data = {
                oneYuanBaseId : vm.currOpera.item.oneYuanBaseId, operation : vm.currOpera.flag
            };
            if(vm.currOpera.item.status != 'end' && vm.currOpera.item.status != 'refund' && vm.currOpera.item.status != 'complete'){
                data.oneYuanId =  vm.currOpera.item.oneYuanId;
            }

            $.ajax({
                url : "club/one_yuan/operation",
                data : data,
                success : function(res){
                    confirmModal.loading('hide');
                    confirmModal.close();
                    if(res.statusCode == 200){
                        msgAlert(res.msg,true);
                        queryData();
                    }
                    else{
                        msgAlert(res.msg || "操作失败！");
                    }
                }
            });
        }
    });

    editOneYuanModal = new Modal($('#editOneYuanModal'),{
        doClickOkBtn: function (e,dom) {
            if(dom.dataset.type=='sureBtn'){
                editOneYuanModal.close();
                return;
            }
            if(checkForm()){
                if(dom.dataset.type=='submitAndPublish'){
                    $('#actStatusDlg').val('online');
                }else{
                    $('#actStatusDlg').val('not_online');
                }
                var plainText = itemDescriptionContent[0].innerText || itemDescriptionContent.html();     //firefox兼容性问题
                if(itemDescriptionContent.html().indexOf('<ul>') == 0){
                    plainText = itemDescriptionContent.html();
                }else{
                    plainText = ('<ul><li>'+plainText.replace(/[\f\n]|<br>|<br\/>/g,'</li><li>').replace(/<li>$/,'')+'</li></ul>').replace("<li></li>",'').replace("</li></li>",'</li>');
                }
                itemDescription.val(plainText);
                var checkRes = imagePreview.checkSelectionValidate();
                if(checkRes != "OK"){
                    editOneYuanModal.showTip(checkRes);
                    return;
                }
                editOneYuanModal.loading();
                editForm.ajaxSubmit({
                    dataType:  'json',
                    success : function(res){
                        editOneYuanModal.loading("hide");
                        if(res.statusCode == 200){
                            queryData();
                            editOneYuanModal.close();
                            editForm[0].reset();
                        }
                        else{
                            editOneYuanModal.showTip(res.msg || "操作失败！");
                        }
                    },
                    complete : function(xhr){
                        editOneYuanModal.loading("hide");
                        if(xhr.status == 400){
                            editOneYuanModal.showTip("裁剪区域过大！请通过鼠标缩小区域！");
                        }
                    }
                });
            }
        },
        afterClose: function () {
            vm.currCategoryId = '';
        }
    });

    function checkForm(){
        if($("#editForm>div.img>img")[0].src=="" && !$("#imgFileName").val()){
            editOneYuanModal.showTip("请上传图片！");
            return false;
        }
        if(!$itemSelect.val()){
            $itemSelect.focus();
            editOneYuanModal.showTip("请输入选择项目！");
            return false;
        }
        if($("#imgFileName").val()){
            currEditImageId.val("");
        }
        if(!$maxPeriod.val()){
            $maxPeriod.val(1);
        }
        var periodData = $maxPeriod[0].dataset;
        if(periodData.minValue !== undefined){
            if($maxPeriod.val() - periodData.minValue < 0 && $maxPeriod.val() != 0){
                //$maxPeriod.val(periodData.minValue);
                Modal.showErrorEleTip($maxPeriod);
                editOneYuanModal.showTip("连续期数不能小于当前期期数！");
                return false;
            }
        }
        if(!$periodValidity.val()){
            $periodValidity.val(1);
        }
        return true;
    }

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
            if(!editForm.hasClass("hasImg")){
                editForm.addClass("hasImg");
            }
        }
    });

    initKindEditor();
    function initKindEditor(){
        //vm.currCategoryId = categoryId = '621615423355363328';
        var addClassFn = function(){
            if($('.ke-dialog-default').length > 0){
                $('.ke-dialog-default').addClass('oneYuan-image-dialog');
                isAddClass = true;
            }else{
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

    function queryData(page){
        vm.currpage = page = page || 1;
        $.ajax({
            url : "club/one_yuan/list",
            data:{
                page:page,
                pageSize:vm.pageSize
            },
            success : function(res){
                if(res.statusCode == 200){
                    vm.dataList = res.respData;
                    vm.dataList.forEach(function (obj) {
                        obj.statusName = statusObj[obj.status];
                    });
                    dataListPagination.refresh({ currPage : page , totalPage : res.pageCount });
                    avalon.scan(thisPage[0]);
                    setTimeout(function () {
                        $('a.show-image').colorbox({
                            rel:'activity-image',
                            opacity:.5,
                            overlayClose:true,
                            speed:300,
                            maxWidth:720,
                            maxHeight:360
                        });
                    },300);
                }
            }
        });
    }
    queryData();

    //=== 加载会所项目列表 ===
    $.ajax({
        url : "club/service/item/list",
        success: function (response) {
            if(response.statusCode == 200){
                var tmp = [];
                (response.respData || []).forEach(function (obj) {
                    if(obj.price - 0 < 1000){
                        tmp.push(obj);
                    }
                });
                vm.serviceItems = tmp;
                avalon.scan(thisPage[0]);
            }else{
                msgAlert('查询会所项目列表失败');
            }
        }
    });
});