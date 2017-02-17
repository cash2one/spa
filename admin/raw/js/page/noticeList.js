require(["css!../../compressed/css/page/"+$$.rootVm.page+".css?"+$$.rootVm.currTime,"cropper","jqform","!domReady"],function(){
    var vmId = $$.rootVm.page+"Ctrl"+(+new Date()),
        thisPage = $("#"+$$.rootVm.page+"Page"),
        pageSize = 20,
        currPage = 1,
        editTechModal,
        addTechNoModal,
        dataListPagination,
        editHeaderModal,
        imagePreviewOfHeader,
        editHeaderModalContent = $("#editHeaderModal>div>div.content"),
        $techName = $("input[name='techName']"),
        $techBakModal  = $("input[name='techBakModal']"),
        $techSpareModal = $("select[name='techSpareModal']");
    thisPage.attr("ms-controller",vmId);
    $$.currPath.html("系统通知");

    var vm = avalon.define({
        $id : vmId,
        techId : "-1",
        spareTechId : "",
        clubTechAuditId : "",
        techNo : "",
        currSex : "male",
        techNoType : "spare",
        techSpareDisabled : false,
        techAddDisabled : true,
        dataList : [],
        editData : [],
        techSpare : [],
        statusObj : { accept : "已同意" , reject : "已拒绝" , cancel : "已取消"},
        doChangeSex : function(v){
            vm.currSex = v;
        },
        doChangeTechNo : function(v){
            vm.techNoType = v;
            if(vm.techNoType =="spare"){
                vm.techSpareDisabled = false;
                vm.techAddDisabled = true;
            }else {
                vm.techSpareDisabled = true;
                vm.techAddDisabled = false;
            }
        },
        doHandlerNotice : function(id,tips){
            if(tips=="已同意"){
                $.ajax({
                    url : "tech/audit/accept",
                    data : { id : id },
                    success : function(res){
                        if(res.statusCode){
                            queryData(currPage);
                            $$.rootVm.getMessageCount();
                        }
                    }
                });
            }
            else{
                $.ajax({
                    url : "tech/audit/reject",
                    data : { id : id },
                    success : function(res){
                        if(res.statusCode){
                            queryData(currPage);
                            $$.rootVm.getMessageCount();
                        }
                    }
                });
            }
        },
        doEechDetail : function (clubTechAuditId,techId,tips) {
            $.ajax({
                //url : "club-admin/json/data.json",
                url : "tech/update/data",
                type : "post",
                data : { type : "update" , ajax : "1" , id : techId },
                success : function(res){
                    if(res && res.data){
                        vm.editData = res.data;
                        vm.clubTechAuditId = clubTechAuditId;
                        vm.techId = techId;
                        vm.techName =  res.data.name || "小摩豆技师";
                        vm.techNo = res.data.serialNo;
                        $techName.val(res.data.name || "小摩豆技师");
                        vm.currSex = res.data.gender;
                        editTechModal.show();
                    }else {
                        msgAlert(res.msg || "获取技师信息失败")
                    }
                }
            });
        },
        doEditTechNo : function () {
            addTechNoModal.show()
            queryTechSpare();
        },
        doEditTechHeader : function(){
            if(vm.editData.avatarUrl){
                imagePreviewOfHeader.load(vm.editData.avatarUrl,{
                    autoCropArea : 1, disabled : true
                });
            }
            editHeaderModal.show();
        }
    });

    editTechModal = new Modal($("#editTechModal"),{
        doClickOkBtn : function(){
            if(checkForm()){
                $.ajax({
                    url : "tech/audit/accept_and_save",
                    type : "post",
                    data : {
                        techId : vm.techId,
                        spareTechId : vm.techSpareDisabled == true ?  "" : $techSpareModal.val(),
                        name : $techName.val(),
                        gender : vm.currSex,
                        serialNo : vm.techNo,
                        phoneNum : vm.editData.phoneNum,
                        provinceCode : vm.editData.provinceCode,
                        province : vm.editData.province,
                        cityCode : vm.editData.cityCode,
                        city : vm.editData.city,
                        clubTechAuditId : vm.clubTechAuditId,
                        description : vm.editData.description,
                        avatar : vm.editData.avatar
                    },
                    success : function(res){
                        if(res.statusCode == 200){
                            msgAlert(res.msg || "保存成功！",true);
                            editTechModal.close();
                            queryData(currPage);
                            $$.rootVm.getMessageCount();
                        }
                        else{
                            msgAlert(res.msg || "保存失败！");
                        }
                    }
                });
            }
        }
    });

    addTechNoModal = new Modal($("#addTechNoModal"),{
        doClickOkBtn : function(){
            if(checkTechBakForm()){
                addTechNoModal.loading();
                $.ajax({
                    url : "tech/update/serialNo",
                    data : {
                        serialNo : vm.techSpareDisabled == true ? $techBakModal.val() : $techSpareModal.find("option:selected").text(),
                        spareTechId : vm.techSpareDisabled == true ?  "" : $techSpareModal.val(),
                        id : vm.techId
                    },
                    success : function(res){
                        addTechNoModal.loading("hide");
                        if(res.statusCode =="200"){
                            addTechNoModal.close();
                            msgAlert(res.msg,true);
                            vm.techNo = vm.techSpareDisabled == true ? $techBakModal.val() : $techSpareModal.find("option:selected").text();
                            queryData(currPage);
                        }
                        else{
                            addTechNoModal.showTip(res.msg || "添加失败！");
                        }
                    }
                });
            }
        }
    });

    editHeaderModal =  new Modal($("#editHeaderModal"),{
        doClickOkBtn : function(){
            if($("#techHeaderForm>div>img")[0] && $("#techHeaderForm>div>img")[0].width != 0){
                if(!$("#tech-uploadImgBtn")[0].files[0]){
                    editHeaderModal.close();
                }
                else{
                    var checkRes = imagePreviewOfHeader.checkSelectionValidate();
                    if(checkRes != "OK"){
                        editHeaderModal.showTip(checkRes);
                        return;
                    }
                    $("#tech-image").val("");
                    editHeaderModal.loading();
                    $("#techHeaderForm").ajaxSubmit({
                        dataType:  'json',
                        success : function(res){
                            if(res && res.avatarUrl){
                                vm.editData.avatarUrl = res.avatarUrl;
                                editHeaderModal.close();
                                msgAlert("修改成功！",true);
                            }
                            else{
                                editHeaderModal.showTip(res.msg || res.message || "修改失败！");
                            }
                        },
                        complete : function(xhr){
                            editHeaderModal.loading("hide");
                            if(xhr.status == 400){
                                editHeaderModal.showTip("您选择的裁剪区域过大！请通过鼠标缩小区域！");
                            }
                        }
                    });
                }
            }
            else{
                editHeaderModal.showTip("请您上传图片！");
            }
        }
    });

    imagePreviewOfHeader = new iCropper({
        imgFile : $("#tech-uploadImgBtn")[0],
        img : $("#techHeaderForm>div>img")[0],
        imgName : $("#tech-imgFileName")[0],
        selectionTxt : $("#techHeaderForm>div>span.selectionTxt")[0],
        imgId : $("#techImageId"),
        maxWidth : 580,
        maxHeight : 300,
        x : $("#tech-x")[0],
        y : $("#tech-y")[0],
        w : $("#tech-w")[0],
        h : $("#tech-h")[0],
        imgWidth : 168,
        imgHeight : 168,
        onImgLoad : function(){
            if(!editHeaderModalContent.hasClass("hasImg")){
                editHeaderModalContent.addClass("hasImg");
            }
        }
    });

    //////////////////分页器
    dataListPagination = new Pagination($("#dataListPagination"),{
        switchPage : function(page){
            queryData(page);
        }
    });

    function queryData(page){
        currPage = page = page || 1;
        $.ajax({
            url : "tech/audit/data",
            //url : "club-admin/json/audit.json",
            type : "post",
            data : {  page : page , pageSize : pageSize },
            success : function(res){
                if(res.respData){
                    vm.dataList = res.respData.audits;
                    dataListPagination.refresh({ currPage : page , totalPage : res.respData.pageCount });
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

    function queryTechSpare() {
        $.ajax({
            url : "tech/spare_tech/list",
            data : {
                page: 1,
                pageSize: 1000
            },
            success : function(res){
                if(res.statusCode==200){
                    vm.techSpare = res.respData;
                    limitCheckForm();
                }else {
                    msgAlert(res.msg);
                }
            }
        });
    }
    ///////////////////////////////////////////输入限制
    function limitCheckForm() {
        $techBakModal.on("input",function(){
            if (/[^\d|a-zA-Z]/.test(this.value)) {
                this.value = this.value.replace(/[^\d|a-zA-Z]/g, '');
            }
            if(this.value.length>5) this.value = this.value.substr(0,5);
        })
    }

    function checkForm(){
        if(!$techName.val()){
            msgAlert("请输入技师昵称！");
            $techName.focus();
            return false;
        }
        return true;
    }

    function checkTechBakForm() {
        if(vm.techSpareDisabled == true){
            if(!$techBakModal.val()){
                addTechNoModal.showTip("添加技师编号！");
                $techBakModal.focus();
                return false;
            }
        }else {
            if($techSpareModal.val() == "-1"){
                addTechNoModal.showTip("选择技师编号！");
                $techSpareModal.focus();
                return false;
            }
        }
        return true;
    }

    queryData();
});