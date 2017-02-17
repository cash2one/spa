require(["css!../../compressed/css/page/"+$$.rootVm.page+".css?"+$$.rootVm.currTime,"!domReady"],function(){
    var vmId = $$.rootVm.page+"Ctrl"+(+new Date()),
        thisPage = $("#"+$$.rootVm.page+"Page"),
        $msgContent = $("#msgContent"),
        actSelectorIndex = 0,
        msgImgFile = $("#msgImgFile"),
        imgArea = $(".imgArea"),
        imgCanvas = document.createElement("canvas"),
        imgCtx = imgCanvas.getContext("2d");

    $$.currPath.html("新增群发");
    thisPage.attr("ms-controller",vmId);

    var vm = avalon.define({
        $id : vmId,
        noAuth : true,
        canSendCount : 0,
        selectedReceiveCount : 0,
        selectedReceiver : '',
        allCount : 0, // 所有用户数
        activeCount: 0, // 活跃用户数
        unActiveCount: 0, // 有效用户数
        groupCount: 0, // 分组中选中的用户数
        acts:[], //活动列表
        groupList: [],
        isSending:false,
        sendInterval: 24,
        imgFileName: "",
        imgMaxSize: 2,
        doClickClearBtn: function(){
            vm.selectedReceiver = "";
            vm.selectedReceiveCount = vm.allCount;
            $msgContent.val("");
            actSelectorIndex = 0;
            $("#actSelector").val(0)
            $("#group-list>li").removeClass("active")
            $(".imgArea>div.del").click()
        },
        doSelectReceiver: function(type){
            if(type=='specified' && vm.groupList.length==0){
                return;
            }
            vm.selectedReceiver = type;
            if(type !="specified"){
                $("#group-list>li").removeClass("active")
            }
            if(type == ""){
                vm.selectedReceiveCount = vm.allCount;
            } else if(type=="active"){
                vm.selectedReceiveCount = vm.activeCount;
            } else if(type=="unactive"){
                vm.selectedReceiveCount = vm.unActiveCount;
            } else{
                vm.selectedReceiveCount = 0
            }
        },
        actSelectorChange: function() {
            actSelectorIndex = parseInt(this.value);
        },
        doClickSendBtn: function(){
            if(vm.isSending){
                return msgAlert("发送中，请稍后...",true)
            }
            var msgVal = $msgContent.val();
            if(!vm.canSendCount>0){
                return msgAlert("剩余可发送次数不足！")
            }
            if(!msgVal && actSelectorIndex==0 && !msgImgFile.attr("imgId") ){
                msgAlert("请输入发送内容或者选择优惠活动！");
                return;
            }
            if(vm.selectedReceiveCount ==0){
                msgAlert("当前选中的客户数目为0！");
                return;
            }
            vm.isSending = true;
            $$.maskPage.addClass("active")
            var postData = {
                actId : "",
                actName : "",
                couponContent : "",
                userGroupType : vm.selectedReceiver,
                messageContent : msgVal,
                groupIds: '',
                msgType : "",
                imageId: msgImgFile.attr("imgId") || ''
            }

            if(actSelectorIndex>0){
                var selectAct = vm.acts[actSelectorIndex-1];
                if(selectAct.msgType == "ordinaryCoupon"){
                    postData.couponContent = selectAct.msg;
                }
                postData.actId = selectAct.actId;
                postData.actName = selectAct.actName;
                postData.msgType = selectAct.msgType;
            }
            if(vm.selectedReceiver == "specified"){
                var selectGroups = $("#group-list>li.active")
                var groupArr = []
                for(var k=0;k<selectGroups.length;k++){
                    groupArr.push(selectGroups[k].getAttribute("gid"))
                }
                postData.groupIds = groupArr.join(",")
            }
            $.ajax({
                url : "api/v2/manager/group/message/send",
                type : "post",
                data : postData,
                success : function(res){
                    if(res.statusCode == 200){
                        msgAlert("发送成功！",true);
                        setTimeout(function (){
                            location.hash="#!/massMessageSendRecord"
                        },1000)
                    }
                    else {
                        msgAlert(res.msg)
                    }
                },
                complete: function(){
                    vm.isSending = false;
                    $$.maskPage.removeClass("active")
                }
            });
        }
    });

    $msgContent.on("input",function(){
        if(this.value.length>100){
            this.value = this.value.substr(0,100)
        }
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    })

    $("#group-list").on("click","li",function(){
        var $this = $(this);
        if($this.hasClass("active")){ // cancel select
            $this.removeClass("active")
            vm.selectedReceiveCount -= parseInt($this.attr("num"))
        } else {
            if(vm.selectedReceiver != "specified"){
                vm.selectedReceiver = 'specified'
                vm.selectedReceiveCount = 0
            }
            $this.addClass("active")
            vm.selectedReceiveCount += parseInt($this.attr("num"))
        }
    })

    $.ajax({
        url : "api/v2/manager/group/message/edit/info",
        success : function(res){
            if(res.statusCode == 200){
                res = res.respData;
                vm.noAuth = res.switch != 'on';
                vm.canSendCount =  res.limitNumber;
                vm.allCount =  res.allCount;
                vm.activeCount = res.activeCount
                vm.unActiveCount = res.unactiveCount;
                vm.selectedReceiveCount = res.allCount;
                vm.groupList = res.groupList;
                vm.sendInterval = res.sendInterval;
                //vm.imgMaxSize = (res.imageSize/1.333).toFixed(2);
                vm.imgMaxSize = res.imageSize;
                avalon.scan(thisPage[0]);
            }
        }
    });

    $.ajax({
        url : "api/v2/manager/group/message/activities",
        success : function(actRes){
            if(actRes.statusCode == 200){
                vm.acts = actRes.respData
            }
        }
    })

    msgImgFile.on("change",function(){
        if(this.files.length>0){
            var file = this.files[0]
            var dotIndex = file.name.lastIndexOf("."), type="";
            if(dotIndex>=0){
                type = file.name.substring(dotIndex+1);
            }
            if (!/^(png|jpg|jpeg|gif)$/i.test(type)) {
                msgAlert("请您上传图片！")
                return;
            }
            if(file.size> vm.imgMaxSize*1024*1024) {
                msgAlert("请您上传不大于"+vm.imgMaxSize+"的图片！")
                return;
            }

            var fr = new FileReader();
            fr.onload = function(evt){
                var img = new Image();
                img.onload = function(){
                    $(".imgArea>img").remove()
                    imgArea.append(img);
                    imgArea.addClass("remove");

                    var ratioX = img.width>280 ? 280/img.width : 1,
                        ratioY = img.height>300 ? 300/img.height : 1,
                        ratio = ratioX<= ratioY ? ratioX : ratioY,
                        imgW = img.width * ratio,
                        imgH = img.height * ratio;
                    img.style.width = imgW+"px";
                    img.style.height = imgH+"px";
                    uploadImg(img.src)
                }
                img.src = evt.target.result;
            };
            fr.readAsDataURL(file);
        }
    })

    function uploadImg(imgData){
        $.ajax({
            url: "api/v2/manager/group/message/album/upload",
            type: "post",
            data: { imgFile: imgData },
            success: function(res){
                if(res.statusCode == 200){
                    msgImgFile.attr("imgId", res.respData.imageId)
                }
            }
        })
    }

    $(".imgArea>div.del").click(function(){
        var imgId = msgImgFile.attr("imgId");
        if(imgId){
            $.ajax({
                url: "api/v2/manager/group/message/album/delete",
                data: {
                    imageId: imgId
                },
                success: function(res){
                    if(res.statusCode == 200){
                        $(".imgArea>img").remove()
                        imgArea.removeClass("remove");
                        msgImgFile.removeAttr("imgId")
                        msgImgFile[0].value=null
                    } else{
                        msgAlert(res.msg || "操作失败！")
                    }
                }
            })
        }
        else{
            $(".imgArea>img").remove()
            imgArea.removeClass("remove");
            msgImgFile[0].value=null
        }
    })
});