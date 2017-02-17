require(["css!../../compressed/css/page/"+$$.rootVm.page+".css?"+$$.rootVm.currTime,"area","dragsort","cropper","jqform","!domReady"],function(){
    var vmId = $$.rootVm.page+"Ctrl"+(+new Date()),
        thisPage = $("#"+$$.rootVm.page+"Page"),
        pageParam = getParamObj(),
        techName = $("#techName"),
        techNo = $("#techNo"),
        techPhoneNum = $("#techPhoneNum"),
        techDesc = $("#techDesc"),
        techAvatar = "",
        confirmModal,
        currDelImgId = "",
        editHeaderModal,
        imagePreviewOfHeader,
        editHeaderModalContent = $("#editHeaderModal>div>div.content"),
        editAlbumModal,
        imagePreviewOfAlbum,
        editAlbumModalContent = $("#editAlbumModal>div>div.content"),
        initPlaceObj = {},
        $techBakModal = $("input[name='techBakModal']"),
        $techSpareModal = $("select[name='techSpareModal']"),
        addTechNoModal;

    techDesc.plainTextOnly();
    if(!pageParam.id){
        msgAlert("地址栏缺少访问参数！");
        history.back();
    }
    thisPage.attr("ms-controller",vmId);
    $$.currPath.html("<a href='#!/techDetail?id="+pageParam.id+"'>技师详情</a> >> 技师编辑");

    var vm = avalon.define({
        $id : vmId,
        techId : pageParam.id,
        currSex : "male",
        provinceList : provinceData.provinceList,
        cityList : [],
        techInfoObj : {},
        imgList : [],
        techNo : "",
        techNoType : "spare",
        techSpareDisabled : false,
        techAddDisabled : true,
        techBak : [],
        doChangeSex : function(v){
            vm.currSex = v;
        },
        doChangeOfProvince : function(){
            doHandlerOfChangeProvince(this.value);
        },
        doSaveTechInfo : function(){/////保存技师信息
            if(checkForm()){
                $.ajax({
                    url : "tech/create",
                    type : "post",
                    data : {
                        id : pageParam.id,
                        name : techName.val(),
                        gender : vm.currSex,
                        serialNo : techNo.val(),
                        phoneNum : techPhoneNum.val(),
                        provinceCode : $("#provinceSelect").val(),
                        province : $("#provinceSelect").val() ? $("#provinceSelect option:selected").text() : "",
                        cityCode : $("#citySelect").val(),
                        city : $("#citySelect").val() ? $("#citySelect option:selected").text() : "",
                        description : techDesc.text(),
                        avatar : techAvatar
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
        doClickDelImg : function(imgId){ //删除技师图片、
            currDelImgId = imgId;
            confirmModal.show();
        },
        doEditTechHeader : function(){
            if(vm.techInfoObj.avatarUrl){
                imagePreviewOfHeader.load(vm.techInfoObj.avatarUrl,false);
            }
            editHeaderModal.show();
        },
        doClickAddTechAlbum : function(){
            imagePreviewOfAlbum.clean();
            editAlbumModalContent.removeClass("hasImg");
            editAlbumModal.show();
        },
        //////////////////////////////////////////
        doRenderedOfProvince : function(){
            if(initPlaceObj.provinceCode){
                $("#provinceSelect").val(initPlaceObj.provinceCode);
                doHandlerOfChangeProvince(initPlaceObj.provinceCode);
                delete initPlaceObj.provinceCode;
            }
        },
        doRenderedOfCity : function(){
            if(initPlaceObj.cityCode){
                $("#citySelect").val(initPlaceObj.cityCode);
                delete initPlaceObj.cityCode;
            }
        },
        doEditTechNo : function () {
            addTechNoModal.show();
            queryTechBak();
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
        }
    });

    ////////////////////////////////////////////////////////////////编辑会所logo图片
    editHeaderModal = new Modal($("#editHeaderModal"),{
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
                                vm.techInfoObj.avatarUrl = res.avatarUrl;
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

    ////////////////////////////////////////////////////////////////上传技师图片
    editAlbumModal = new Modal($("#editAlbumModal"),{
        doClickOkBtn : function(){
            if($("#album-uploadImgBtn")[0].files[0]){
                var checkRes = imagePreviewOfAlbum.checkSelectionValidate();
                if(checkRes != "OK"){
                    editAlbumModal.showTip(checkRes);
                    return;
                }
                $("#album-image").val("");
                editAlbumModal.loading();
                $("#techAlbumForm").ajaxSubmit({
                    dataType:  'json',
                    success : function(res){
                        if(res && res.id){
                            editAlbumModal.close();
                            msgAlert("上传成功！",true);
                            refreshTechImg();
                        }
                        else{
                            editAlbumModal.showTip(res.msg || res.message || "上传失败！");
                        }
                    },
                    complete : function(xhr){
                        editAlbumModal.loading("hide");
                        if(xhr.status == 400){
                            editAlbumModal.showTip("您选择的裁剪区域过大！请通过鼠标缩小区域！");
                        }
                    }
                });
            }
            else{
                editAlbumModal.showTip("请您上传图片！");
            }
        }
    });

    imagePreviewOfAlbum = new iCropper({
        imgFile : $("#album-uploadImgBtn")[0],
        img : $("#techAlbumForm>div>img")[0],
        imgName : $("#album-imgFileName")[0],
        selectionTxt : $("#techAlbumForm>div>span.selectionTxt")[0],
        maxWidth : 580,
        maxHeight : 300,
        factor : $("#album-factor")[0],
        x : $("#album-x")[0],
        y : $("#album-y")[0],
        w : $("#album-w")[0],
        h : $("#album-h")[0],
        imgWidth : 360,
        imgHeight : 360,
        onImgLoad : function(){
            if(!editAlbumModalContent.hasClass("hasImg")){
                editAlbumModalContent.addClass("hasImg");
            }
        }
    });

    confirmModal = new Modal($("#confirmModal"),{
        doClickOkBtn : function(){
            $.ajax({
                url : "tech/album/delete",
                type : "post",
                data : {
                    id : currDelImgId , techId : pageParam.id
                },
                success : function(res){
                    if(res.statusCode == 200){
                        msgAlert("删除成功！",true);
                        refreshTechImg();
                    }
                    else{
                        msgAlert(res.msg || res.message || "删除失败！");
                    }
                }
            });
            confirmModal.close();
        }
    });

    //修改技师工号
    addTechNoModal = new Modal($("#addTechNoModal"),{
        doClickOkBtn : function(){
            if(checkTechBakForm()){
                addTechNoModal.loading();
                $.ajax({
                    url : "tech/update/serialNo",
                    data : {
                        serialNo : vm.techSpareDisabled == true ? $techBakModal.val() : $techSpareModal.find("option:selected").text(),
                        spareTechId : vm.techSpareDisabled == true ?  "" : $techSpareModal.val(),
                        id : pageParam.id
                    },
                    success : function(res){
                        addTechNoModal.loading("hide");
                        if(res.statusCode =="200"){
                            addTechNoModal.close();
                            msgAlert(res.msg,true);
                            vm.techNo = vm.techSpareDisabled == true ? $techBakModal.val() : $techSpareModal.find("option:selected").text();
                            techNo.val(vm.techSpareDisabled == true ? $techBakModal.val() : $techSpareModal.find("option:selected").text());
                        }
                        else{
                            addTechNoModal.showTip(res.msg || "添加失败！");
                        }
                    }
                });
            }
        }
    });

    function doHandlerOfChangeProvince(v){
        $("#citySelect").val("");
        if(v==""){
            vm.cityList = [];
        }
        else{
            for(var i=0;i<provinceData.cityList.length;i++){
                if(provinceData.cityList[i].provinceCode == v){
                    vm.cityList = provinceData.cityList[i].city;
                }
            }
        }
    }

    function checkForm(){
        if(!techName.val()){
            msgAlert("请输入技师昵称！");
            techName.focus();
            return false;
        }
        if(!techPhoneNum.val()){
            msgAlert("请输入技师手机号码！");
            techPhoneNum.focus();
            return false;
        }
        else if(!/^1[34578]\d{9}$/.test(techPhoneNum.val())){
            msgAlert("请输入正确的手机号码！");
            techPhoneNum.focus();
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

    /////////////////////////////////////输入限制
    techName.on("input",function(){
        if(this.value.length>5){
            this.value = this.value.substr(0,5);
        }
    });

    techNo.on("input",function(){
        if(this.value.length>10){
            this.value = this.value.substr(0,10);
        }
    });

    techPhoneNum.on("input",function(){
        if (/\D/.test(this.value)) {
            this.value = this.value.replace(/\D/g, '');
        }
        if (this.value.length == 1 && this.value != 1) {
            this.value = "";
        }
        if (this.value.length == 2 && !/^1[34578]$/.test(this.value)) {
            this.value = 1;
        }
        if (this.value.length > 11) {
            this.value = this.value.substring(0, 11);
        }
    });

    function queryTechInfo(){
        $.ajax({
            url : "tech/update/data",
            type : "post",
            data : { type : "update" , ajax : "1" , id : pageParam.id },
            success : function(res){
                if(res && res.data){
                    techAvatar = res.data.avatar;
                    techName.val(res.data.name);
                    techNo.val(res.data.serialNo);
                    techPhoneNum.val(res.data.phoneNum);
                    vm.currSex = res.data.gender;
                    techDesc.text(res.data.description || "");
                    vm.techInfoObj = res.data;
                    vm.imgList = res.albums || [];
                    vm.techNo = res.data.serialNo;
                    avalon.scan(thisPage[0]);

                    if(res.data.provinceCode && res.data.provinceCode != 'null'){
                        initPlaceObj.provinceCode = res.data.provinceCode;
                    }

                    if(res.data.cityCode && res.data.cityCode != 'null'){
                        initPlaceObj.cityCode = res.data.cityCode;
                    }

                    /*setTimeout(function(){
                        if(res.data.provinceCode && res.data.provinceCode != 'null'){
                            $("#provinceSelect").val(res.data.provinceCode);
                            doHandlerOfChangeProvince(res.data.provinceCode);
                            if(res.data.cityCode && res.data.cityCode != 'null'){
                                setTimeout(function(){
                                    $("#citySelect").val(res.data.cityCode);
                                },2000)
                             }
                        }
                    },2500)*/
                }
            }
        });
    }

    function queryTechBak() {
        $.ajax({
            url : "tech/spare_tech/list",
            //url : "club-admin/json/list.json",
            data : {
                page: 1,
                pageSize: 1000
            },
            success : function(res){
                if(res.statusCode==200){
                    vm.techBak = res.respData;
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

    function refreshTechImg(){
        $.ajax({
            url : "tech/update/data",
            type : "post",
            data : { type : "update" , ajax : "1" , id : pageParam.id },
            success : function(res){
                if(res && res.albums){
                    vm.imgList = res.albums || [];
                }
            }
        });
    }

    $("#techImgList").dragsort({
        dragSelector : "li",
        dragSelectorExclude : ">div>ul>li",
        dragEnd : function(){
            var $this = $(this), list = $this.parents("ul").children(), ids = [];
            for(var k=0;k<list.length;k++){
                ids.push(list[k].getAttribute("imgId"));
            }
            $.ajax({
                url : "tech/album/sort",
                type : "post",
                data : { ids : ids.join(",") , techId : pageParam.id },
                success : function(){
                    msgAlert("操作成功！",true);
                }
            });
        }
    });

    queryTechInfo();
});