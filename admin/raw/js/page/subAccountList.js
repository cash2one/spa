require(["css!../../compressed/css/page/"+$$.rootVm.page+".css?"+$$.rootVm.currTime,"!domReady"],function(){
    var vmId = $$.rootVm.page+"Ctrl"+(+new Date()),
        thisPage = $("#"+$$.rootVm.page+"Page"),
        editAccountModal,
        loginName = $("#loginName"),
        loginPassword = $("#loginPassword"),
        accountName = $("#accountName"),
        accountTel = $("#accountTel"),
        authListTablePagination,
        roleAssociateUserModal,
        roleAssociateUserModalPagination,
        roleListModal,
        roleListModalPagination,
        selectedRoleObj = {},
        resourceGroupDetailModal,
        resourceGroupMaxLevelOfPC = 0,
        resourceGroupMaxLevelOfAPP = 0,
        numArr = ["一","二","三","四"];

    thisPage.attr("ms-controller",vmId);
    $$.currPath.html("会所子账号管理");

    var vm = avalon.define({
        $id : vmId,
        dataList : [],
        modelHeaderStr : "",
        opeType : "",
        currId : "",
        resourcesGroupList : [],///会所资源权限组列表
        resourcesGroupListPageSize : 10,
        associateUserList : [],
        currGroupId : "",
        currViewRoleName : "",
        doAddAccount : function(){
            vm.modelHeaderStr = "新增账号";
            vm.opeType = "add";
            vm.currId = "";
            vm.selectedRoleArr = [];
            loginName.val("");
            loginPassword.val("");
            accountName.val("");
            accountTel.val("");
            selectedRoleObj = {};
            editAccountModal.show();
        },
        doEditAccount : function(userId){
            $.ajax({
                url : "profile/subuser/detail",
                data : { userId : userId },
                success : function(res){
                    if(res.statusCode == 200){
                        var editObj = res.respData;
                        vm.currId = userId;
                        vm.modelHeaderStr = "编辑账号";
                        vm.opeType = "edit";
                        loginName.val(editObj.userInfo.loginName);
                        loginPassword.val("");
                        accountName.val(editObj.userInfo.name);
                        accountTel.val(editObj.userInfo.phoneNum);
                        //////角色权限
                        vm.selectedRoleArr = editObj.groups || [];
                        selectedRoleObj = {};
                        editAccountModal.show();
                    }
                }
            });
        },
        doChangeAccountPw : function(index){
            var editObj = vm.dataList[index];
            vm.currId = editObj.id;
            vm.modelHeaderStr = "修改账号密码";
            vm.opeType = "changePw";
            loginName.val(editObj.loginName);
            loginPassword.val("");
            accountName.val(editObj.name);
            accountTel.val(editObj.phoneNum);
            editAccountModal.show();
        },
        onChangeOfAuthListPage : function(){
            vm.resourcesGroupListPageSize = this.value;
            queryClubAuthData();
        },
        doClickAssociateAuthBtn : function(groupId){///关联角色
            vm.currGroupId = groupId;
            queryAssociateUserList();
            roleAssociateUserModal.show();
        },
        doSelectAssociateUser : function(userId){//角色关联用户
            $.ajax({
                url: "manager/resources/group/user/relation/save",
                type: "post",
                data: {
                    groupId: vm.currGroupId,
                    userId: userId
                },
                success: function (res) {
                    if (res.statusCode == 200) {
                        vm.currGroupId = res.respData;
                        queryAssociateUserList();
                        msgAlert(res.msg || "关联成功！",true);
                    }
                    else{
                        msgAlert(res.msg || "关联失败！");
                    }
                }
            });
        },
        doSearchInAssociateUserModal : function(){//点击搜索
            queryAssociateUserList();
        },
        selectedRoleArr : [],
        roleList : [],
        currRoleListPage : 1,
        selectedTab : "pc",
        doDelRoleRel : function(roleId,index){///删除关联
            vm.selectedRoleArr.splice(index,1);
            delete selectedRoleObj[roleId];

            /*if(vm.currId == ""){
                vm.selectedRoleArr.splice(index,1);
                delete selectedRoleObj[roleId];
            }
            else{
                $.ajax({
                    url : "manager/resources/group/user/relation/delete",
                    data : {
                        groupId : roleId,
                        userId : vm.currId
                    },
                    success : function(res){
                        if(res.statusCode == 200){
                            editAccountModal.showTip(res.msg || "删除成功！");
                            vm.selectedRoleArr.splice(index,1);
                            delete selectedRoleObj[roleId];
                        }
                        else{
                            editAccountModal.showTip(res.msg || "删除失败！");
                        }
                    }
                });
            }*/
        },
        doRoleListSearch : function(){//搜索
            queryRoleList();
        },
        doSelectRole : function(roleId,roleName,index){///增加关联
            //console.log("roleId："+roleId+"--roleName："+roleName);
            vm.roleList[index].selected = true;//已选标记
            vm.selectedRoleArr.push({ id : roleId , name : roleName });
            selectedRoleObj[roleId] = true;
        },
        doAddRole : function(){
            queryRoleList();
            roleListModal.show();
        },
        doViewResourceGroupDetail : function(groupId,groupName){
            vm.currViewRoleName = groupName;
            $.ajax({
                url : "manager/resources/group/detail",
                data : {
                    groupId : groupId
                },
                success : function(res){
                    if(res.statusCode == 200){
                        var authObj = {},
                            resourceGroupListOfPC = [],
                            resourceGroupListOfAPP = [];

                        ///具有权限的ID
                        for(var k=0;k<res.respData.selectResourcesIds.length;k++){
                            authObj[res.respData.selectResourcesIds[k]] = true;
                        }
                        doHandlerResourceGroup(res.respData.platformList[0].children,resourceGroupListOfPC,authObj,true);
                        $("#resourceGroupDataTable-PC").html(generateHtmlOfResourceGroup(resourceGroupMaxLevelOfPC,resourceGroupListOfPC));

                        doHandlerResourceGroup(res.respData.platformList[1].children,resourceGroupListOfAPP,authObj,false);
                        $("#resourceGroupDataTable-APP").html(generateHtmlOfResourceGroup(resourceGroupMaxLevelOfAPP,resourceGroupListOfAPP));
                    }
                }
            });
            resourceGroupDetailModal.show();
        },
        doChangeResourceViewTab : function(type){
            vm.selectedTab = type;
        }
    });

    function generateHtmlOfResourceGroup(maxLevel,resourceGroupList){
        var resHtmlPC = "<thead><tr>",colWidth = 100/(maxLevel+1);
        var k,n;
        for(k=0;k<maxLevel;k++){
            resHtmlPC += "<th style='width:"+colWidth+"%'>"+numArr[k]+"级功能点"+"</th>"
        }
        resHtmlPC +="<th style='width:"+colWidth+"%'>是否有权限</th></tr></thead><tbody>";
        for(k=0;k<resourceGroupList.length;k++){
            resHtmlPC +="<tr hasChild='"+(resourceGroupList[k]["hasChild"] ? "1" : "0")+"' nodeId='"+resourceGroupList[k]["id"]+"' pid='"+resourceGroupList[k]["parentId"]+"' class='"+(resourceGroupList[k]["hasAuth"] ? "act" : "")+(resourceGroupList[k]["level"]!=1 ? " hide" : "" )+"'>";
            for(n=1;n<=maxLevel;n++){
                if(n==resourceGroupList[k]["level"]){
                    resHtmlPC += "<td class='"+(resourceGroupList[k]["hasChild"] ? "hasChild" : "")+"'>"+resourceGroupList[k]["name"]+"</td>";
                }
                else{
                    resHtmlPC +="<td></td>";
                }
            }
            resHtmlPC +="<td>"+(resourceGroupList[k]["hasAuth"] ? "是" : "否")+"</td></tr>";
        }
        resHtmlPC += "</tbody>";
        return resHtmlPC;
    }

    function doHandlerResourceGroup(resData,resArr,authObj,isPC){
        for(var k=0;k<resData.length;k++){
            if(isPC && resData[k].level>resourceGroupMaxLevelOfPC){
                resourceGroupMaxLevelOfPC = resData[k].level-0;
            }
            else if(!isPC && resData[k].level>resourceGroupMaxLevelOfAPP){
                resourceGroupMaxLevelOfAPP = resData[k].level-0;
            }
            resArr.push({
                name : resData[k].name,
                hasAuth : !!authObj[resData[k].id],
                level : resData[k].level,
                parentId : resData[k].parentId,
                id : resData[k].id,
                hasChild : !!resData[k].children
            });
            if(resData[k].children){
                doHandlerResourceGroup(resData[k].children,resArr,authObj,isPC);
            }
        }
    }

    $("#resourceGroupDataTable-PC,#resourceGroupDataTable-APP").on("click","td.hasChild",function(){
        var $this = $(this), nodeId = $this.parent().attr("nodeId"),isFold = $this.hasClass("fold"),$tr= $this.parents("tr");
        var $list = $tr.siblings("tr[pid="+nodeId+"]");
        if(isFold){///关闭
            $list.hide();
            $this.removeClass("fold");
            for(var i=0;i<$list.length;i++){
                if($list[i].getAttribute("hasChild")=="1"){
                    $tr.siblings("tr[pid="+$list[i].getAttribute("nodeId")+"]").hide();
                }
            }
        }
        else{
            $this.addClass("fold");
            $list.show();
        }
    });

    ///查询子账户列表
    function queryData(){
        $.ajax({
            url : "profile/subuser/list",
            success : function(res){
                if(res.respData){
                    vm.dataList = res.respData;
                    avalon.scan(thisPage[0]);
                }
            }
        });
    }

    ///查询会所资源权限组列表
    function queryClubAuthData(page){
        page = page || 1;
        $.ajax({
            url : "manager/resources/group/list",
            data : {
                page : page , pageSize : vm.resourcesGroupListPageSize
            },
            success : function(res){
                if(res.statusCode == 200){
                    var authData = res.respData,k;
                    for(k=0;k<authData.length;k++){
                        authData[k]["remark"] = authData[k]["remark"].split(";").join("<br/>");
                    }
                    vm.resourcesGroupList = authData;
                    authListTablePagination.refresh({ currPage : page , totalPage : res.pageCount });
                }
            }
        });
    }

    ///查询子账户关联选择列表
    function queryAssociateUserList(page){
        page = page || 1;
        $.ajax({
            url : "manager/resources/group/user/list",
            data : {
                page : page,
                pageSize : 5,
                groupId : vm.currGroupId,
                userName : $("#roleAssociateUserSearch").val()
            },
            success : function(res){
                if(res.statusCode == 200){
                    roleAssociateUserModalPagination.refresh({currPage : page , totalPage : res.pageCount});
                    vm.associateUserList = res.respData;
                }
            }
        });
    }

    ///查询用户待选择的角色列表
    function queryRoleList(page){
        page = page || 1;
        $.ajax({
            url : "profile/subuser/group/list",
            data : {
                userId : vm.currId,
                page : page,
                pageSize : 5,
                groupName : $("#roleListSearch").val()
            },
            success : function(res){
                if(res.statusCode == 200){
                    for(var i=0;i<res.respData.length;i++){
                        res.respData[i].selected = !!selectedRoleObj[res.respData[i]["id"]];
                    }
                    vm.roleList = res.respData;
                    roleListModalPagination.refresh({ currPage : page , totalPage : res.pageCount });
                }
            }
        });
    }

    editAccountModal = new Modal($("#editAccountModal"),{
        doClickOkBtn : function(){
            if(checkForm()){
                if(vm.opeType=="add" || vm.opeType=="edit"){
                    var groupIds = [];
                    for(var k=0;k<vm.selectedRoleArr.length;k++){
                        groupIds.push(vm.selectedRoleArr[k]["id"]);
                    }
                    if(groupIds.length == 0){
                        editAccountModal.showTip("请增加关联角色！");
                        return;
                    }
                    editAccountModal.loading();
                    $.ajax({
                        url : "profile/subuser/save",
                        type : "post",
                        traditional : true,
                        data : {
                            id : vm.currId,
                            loginName : loginName.val().trim(),
                            name : accountName.val().trim(),
                            phoneNum : accountTel.val(),
                            plainPassword :  loginPassword.val(),
                            groupIds : groupIds
                        },
                        success : function(res){
                            editAccountModal.loading("hide");
                            if(res.statusCode == 200){
                                editAccountModal.close();
                                msgAlert(res.msg,true);
                                queryData();
                            }
                            else{
                                editAccountModal.showTip(res.msg);
                            }
                        }
                    })
                }
                else{
                    editAccountModal.loading();
                    $.ajax({
                        url : "profile/subuser/password/update",
                        type : "post",
                        data : {
                            id : vm.currId, plainPassword : loginPassword.val()
                        },
                        success : function(res){
                            editAccountModal.loading("hide");
                            if(res.statusCode == 200){
                                editAccountModal.close();
                                msgAlert(res.msg,true);
                            }
                            else{
                                editAccountModal.showTip(res.msg);
                            }
                        }
                    });
                }
            }
        }
    });

    authListTablePagination = new Pagination($("#authListTablePagination"),{
        switchPage : function(page){
            queryClubAuthData(page);
        }
    });

    /////角色选取子账户进行关联
    roleAssociateUserModal = new Modal($("#roleAssociateUserModal"),{
        doClickOkBtn : function(){
            queryData();///更新子账号列表
            roleAssociateUserModal.close();
        },
        afterClose : function(){
            queryClubAuthData();
        }
    });

    roleAssociateUserModalPagination = new Pagination($("#roleAssociateUserModalPagination"),{
        switchPage : function(page){
            queryAssociateUserList(page);
        }
    });

    roleListModal = new Modal($("#roleListModal"),{
        doClickOkBtn : function(){
            roleListModal.close();
        }
    });

    roleListModalPagination = new Pagination($("#roleListModalPagination"),{
        switchPage : function(page){
            queryRoleList(page);
        }
    });

    resourceGroupDetailModal = new Modal($("#resourceGroupDetailModal"),{
        doClickOkBtn : function(){
            resourceGroupDetailModal.close();
        }
    });

    function checkForm(){
        if(!loginName.val() || !loginName.val().trim() ){
            editAccountModal.showTip("请输入登录名！");
            loginName.focus();
            return false;
        }
        if(vm.opeType!="edit" && !loginPassword.val()){
            editAccountModal.showTip("请输入账号密码！");
            loginPassword.focus();
            return false;
        }
       if(accountTel.val() && !/^1[34578]\d{9}$/.test(accountTel.val())){
            editAccountModal.showTip("请输入正确的手机号码！");
            accountTel.focus();
            return false;
        }
        return true;
    }

    ///////////////////////////////////////////////输入限制
    loginName.on("input",function(){
       if(this.value.length>15) this.value = this.value.substr(0,15);
        if(/\s/.test(this.value)) this.value = this.value.replace(/\s/g,"");
    });
    loginPassword.on("input",function(){
        if(this.value.length>15) this.value = this.value.substr(0,15);
        if(/\s/.test(this.value)) this.value = this.value.replace(/\s/g,"");
    });
    accountName.on("input",function(){
        if(this.value.length>30) this.value = this.value.substr(0,30);
        if(/\s/.test(this.value)) this.value = this.value.replace(/\s/g,"");
    });
    accountTel.on("input",function(){
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

    queryData();
    queryClubAuthData();
});