require(["css!../../compressed/css/page/"+$$.rootVm.page+".css?"+$$.rootVm.currTime,"area","dragsort","!domReady"],function(){
    var vmId = $$.rootVm.page+"Ctrl"+(+new Date()),
        thisPage = $("#"+$$.rootVm.page+"Page"),
        addTechModal,
        addTechBakModal,
        deleteTechModal,
        seeTechNoModal,
        techName = $("#techName"),
        techNo = $("#techNo"),
        techPhoneNum = $("#techPhoneNum"),
        techList = $("#freeTechList,#busyTechList"),
        $techBak = $("input[name='techBak']"),
        $deleteTechBak = $("input[name='deleteTechBak']"),
        $password = $("input[name='password']"),
        $techNoAdd = $("input[name='techNoAdd']"),
        $techNoSpare = $("select[name='techNoSpare']");

    thisPage.attr("ms-controller",vmId);
    $$.currPath.html("所有技师");

    var vm = avalon.define({
        $id : vmId,
        freeList : [],
        busyList : [],
        recommendList : [],
        itemList : [],
        queryCategory : "-1",
        currSex : "male",
        provinceList : provinceData.provinceList,
        cityList : [],
        password : "default",
        passwordValue : "123456",
        passwordDisabled : true,
        eidtTechBakDisabled : false,
        techBakValue : "",
        techBakDisabled : false,
        deleteTechBak : false,
        deleteTechBakTitle : "删除编号",
        resetPassword : false,
        techModalTitle : "",
        techBakModalTitle : "",
        eidtTechId : "",
        techNoType : "spare",
        techBak : [],
        viewTech : {},
        doClickSearchBtn : function(){
            queryData(true);
        },
        doAddTechBtn : function(type,id,number){
            techName.val("");
            techNo.val("");
            $techNoAdd.val("");
            techPhoneNum.val("");
            vm.currSex = "male";
            vm.techBakValue = number;
            if(type == "add"){
                vm.techModalTitle = "添加技师";
                vm.eidtTechBakDisabled = false;
                vm.eidtTechId = "-1";
            }else {
                vm.techModalTitle = "备用技师编辑";
                techNo.val(number);
                vm.eidtTechBakDisabled = true;
                vm.eidtTechId = id;
                vm.techBakDisabled = false;
            }
            addTechModal.show();
        },
        doDeleteTechBtn : function(type){
            deleteTechModal.show();
        },
        doChangeQueryCategory : function(){
            vm.queryCategory = this.value;
            queryData(true);
        },
        doChangeSex : function(v){
            vm.currSex = v;
        },
        doChangePassword : function(v){
            vm.password = v;
            if(vm.password =="default"){
                vm.passwordValue = "123456";
                vm.passwordDisabled = true;
            }else {
                vm.passwordValue = "";
                vm.passwordDisabled = false;
            }

        },
        doChangeOfProvince : function(){
            $("#citySelect").val("");
            if(this.value==""){
                vm.cityList = [];
            }
            else{
                for(var i=0;i<provinceData.cityList.length;i++){
                    if(provinceData.cityList[i].provinceCode == this.value){
                        vm.cityList = provinceData.cityList[i].city;
                    }
                }
            }
        },
        doClickTech : function(id){
            location.href="#!/techDetail?id="+id;
        },
        doTechBak : function (type) {
            vm.password = "default";
            vm.passwordValue = "123456";
            vm.passwordDisabled = true;
            if(type == "add"){
                vm.techBakModalTitle = "添加技师备用编号";
                vm.techBakDisabled = false;
                vm.eidtTechId = "-1";
                $techBak.val("");
            }else {
                vm.techBakModalTitle = "重置技师备用编号";
                vm.techBakDisabled = true;
                $techBak.val(vm.techBakValue);
            }
            addTechBakModal.show();
        },
        doDeleteTechBakBox : function () {
            if(vm.deleteTechBak == false){
                vm.deleteTechBak = true;
                vm.deleteTechBakTitle = "取消删除"
            }else {
                vm.deleteTechBak = false;
                vm.deleteTechBakTitle = "删除编号"
            }
        },
        doDeleteTechBak : function (thiss,id) {
            var $this = $(thiss);
            $.ajax({
                url : "tech/spare_tech/delete",
                data : {
                    id : id
                },
                success : function(res){
                    if(res.statusCode == 200){
                        $this.parents("li").remove();
                        msgAlert(res.msg,true)
                    }else {
                        msgAlert(res.msg)
                    }
                }
            });
        },
        doChangeTechNo : function(v){
            vm.techNoType = v;
        }
    });

    function queryData(needClear){
        if(needClear){
            var currTechList = techList.children("li");
            if(currTechList.length>0){
                currTechList.remove();
            }
        }
        $.ajax({
            url : "tech/data",
            data : {
                ajax : 1, categoryId : vm.queryCategory, name : $("#techInfoSearch").val()
            },
            success : function(res){
                if(res.statusCode == 200){
                    res = res.respData;
                    vm.freeList = res.free || [];
                    vm.busyList = res.work || [];
                }
                avalon.scan(thisPage[0]);
            }
        });
    }

    function queryRecomendTech(){
        $.ajax({
            url : "api/v2/manager/tech/recommend/list",
            success : function(res){
                if(res.statusCode == 200){
                    vm.recommendList = res.respData;
                }
            }
        });
    }

    function queryServiceCategory(){
        $.ajax({
            url : "club/service/data",
            success : function(res){
                if(res.statusCode==200){
                    vm.itemList = res.respData;
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

    $("#techInfoSearch").on("keypress",function(event){
        if(event.keyCode==13){
            queryData(true);
        }
    });

    addTechModal = new Modal($("#addTechModal"),{
        doClickOkBtn : function(){
            if(checkForm()){
                addTechModal.loading();
                $.ajax({
                    url : "tech/create",
                    type : "post",
                    data : {
                        id : vm.eidtTechId == "-1" ? "-1" : null,
                        name : techName.val(),
                        gender : vm.currSex,
                        serialNo : vm.eidtTechBakDisabled == true ? techNo.val() : (vm.techNoType == "add" ? $techNoAdd.val() : $techNoSpare.find("option:selected").text()),
                        phoneNum : techPhoneNum.val(),
                        provinceCode : $("#provinceSelect").val(),
                        province : $("#provinceSelect").val() ? $("#provinceSelect option:selected").text() : "",
                        cityCode : $("#citySelect").val(),
                        city : $("#citySelect").val() ? $("#citySelect option:selected").text() : "",
                        spareTechId : vm.eidtTechBakDisabled == true ? vm.eidtTechId : (vm.techNoType == "add" ? null : $techNoSpare.val())
                    },
                    success : function(res){
                        addTechModal.loading("hide");
                        if(res.statusCode == 200){
                            addTechModal.close();
                            msgAlert("添加成功！",true);
                            queryTechBak();
                            queryData(true);
                        }
                        else{
                            addTechModal.showTip(res.msg || "添加失败！");
                        }
                    }
                });
            }
        }
    });

    addTechBakModal = new Modal($("#addTechBakModal"),{
        doClickOkBtn : function(){
            if(checkTechBakForm()){
                addTechBakModal.loading();
                $.ajax({
                    url : vm.eidtTechId == "-1" ? "tech/spare_tech/create" : "tech/spare_tech/update/password",
                    data : {
                        serialNo :  vm.eidtTechId == "-1" ? $techBak.val() : null,
                        password : $password.val(),
                        id : vm.eidtTechId
                    },
                    success : function(res){
                        addTechBakModal.loading("hide");
                        if(res.statusCode =="200"){
                            addTechBakModal.close();
                            msgAlert(res.msg,true);
                            queryTechBak();
                        }
                        else{
                            addTechBakModal.showTip(res.msg || "添加失败！");
                        }
                    }
                });
            }
        }
    });

    deleteTechModal = new Modal($("#deleteTechModal"),{
        doClickOkBtn : function(){
            if(checkDeleteTechForm()){
                deleteTechModal.loading();
                $.ajax({
                    url : "tech/view/tech",
                    data : {
                        serialNo : $deleteTechBak.val()
                    },
                    success : function(res){
                        deleteTechModal.loading("hide");
                        if(res.statusCode =="200"){
                            vm.viewTech = res.respData;
                            seeTechNoModal.show();
                        }
                        else{
                            deleteTechModal.showTip(res.msg || "添加失败！");
                        }
                    }
                });

            }
        }
    });

    seeTechNoModal = new Modal($("#seeTechNoModal"), {
        doClickOkBtn: function () {
            seeTechNoModal.loading();
            $.ajax({
                url : "tech/delete/"+vm.viewTech.id,
                data : { operation : "quit" },
                success : function(res){
                    seeTechNoModal.loading("hide");
                    if(res.statusCode==200){
                        msgAlert(res.message,true);
                        seeTechNoModal.close();
                        queryData();
                        queryTechBak();
                    } else{
                        seeTechNoModal.showTip(res.msg || "操作失败！");
                    }
                }
            });
        }
    });

    function checkForm(){
        if(!techName.val()){
            addTechModal.showTip("请输入技师昵称！");
            techName.focus();
            return false;
        }
        if(!techPhoneNum.val()){
            addTechModal.showTip("请输入技师手机号码！");
            techPhoneNum.focus();
            return false;
        }
        else if(!/^1[34578]\d{9}$/.test(techPhoneNum.val())){
            addTechModal.showTip("请输入正确的手机号码！");
            techPhoneNum.focus();
            return false;
        }
        return true;
    }

    ///////////////////////////////////////////输入限制
    function limitCheckForm() {
        $techBak.on("input",function(){
            if (/[^\d|a-zA-Z]/.test(this.value)) {
                this.value = this.value.replace(/[^\d|a-zA-Z]/g, '');
            }
            if(this.value.length>5) this.value = this.value.substr(0,5);
        });
        $password.on("input",function(){
            if (/[^\d|a-zA-Z]/.test(this.value)) {
                this.value = this.value.replace(/[^\d|a-zA-Z]/g, '');
            }
            if(this.value.length>30) this.value = this.value.substr(0,30);
        })
    }

    function checkTechBakForm() {
        if(!$techBak.val()){
            addTechBakModal.showTip("请输入技师编号！");
            $techBak.focus();
            return false;
        }
        if(!$password.val()){
            addTechBakModal.showTip("请输入密码！");
            $password.focus();
            return false;
        }
        return true;
    }

    function checkDeleteTechForm() {
        if(!$deleteTechBak.val()){
            deleteTechModal.showTip("请输入技师编号！");
            $deleteTechBak.focus();
            return false;
        }
        return true;
    }
    /////////////////////////////////////输入限制
    techName.on("input",function(){
        if(this.value.length>15){
            this.value = this.value.substr(0,15);
        }
    });

    $deleteTechBak.on("input",function(){
        if (/[^\d|a-zA-Z]/.test(this.value)) {
            this.value = this.value.replace(/[^\d|a-zA-Z]/g, '');
        }
        if(this.value.length>5) this.value = this.value.substr(0,6);
    });

    $techNoAdd.on("input",function(){
        if (/[^\d|a-zA-Z]/.test(this.value)) {
            this.value = this.value.replace(/[^\d|a-zA-Z]/g, '');
        }
        if(this.value.length>5) this.value = this.value.substr(0,5);
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

    $("#recommendTechList").dragsort({
        dragSelector : "li",
        dragSelectorExclude : "div>a>div>b",
        dragEnd : function(){
            var list = $("#recommendTechList>li"), idArr = [];
            for(var k=0;k<list.length;k++){
                idArr.push(list[k].getAttribute("techId"));
            }
            $.ajax({
                url : "tech/top/sort",
                type : "post",
                data : { ids : idArr.join(",") },
                success : function(res){
                    if(res.statusCode == 200){
                        msgAlert(res.msg,true);
                    }
                    else{
                        msgAlert(res.msg || "排序失败！");
                    }
                }
            });
        }
    });

    techList.dragsort({
        dragSelector : "li",
        dragBetween : true,
        dragSelectorExclude : "div>a>div>b",
        dragEnd : function(){
            var $this = $(this), techId = $this.attr("techId"), status = $this.parents().attr("type");
            $.ajax({
                url : "tech/update/status",
                type : "post",
                data : { id : techId , status : status },
                success : function(res){
                    if(res.statusCode == 200){
                        msgAlert(res.message,true);
                    }
                    else{
                        msgAlert(res.message || "操作失败！");
                    }
                }
            });
        }
    });

    queryRecomendTech();
    queryServiceCategory();
    queryTechBak();
    queryData();
});