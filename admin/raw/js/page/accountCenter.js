require(["css!../../compressed/css/page/"+$$.rootVm.page+".css?"+$$.rootVm.currTime,"amap","qrcode","cropper","jqform","jszip","fileSaver","!domReady"],function(){
    var vmId = $$.rootVm.page+"Ctrl"+(+new Date()),
        thisPage = $("#"+$$.rootVm.page+"Page"),
        changePwCurrPw = $("#changePw-currPw"),
        changePwNewPw = $("#changePw-newPw"),
        changePwRepeatNewPw = $("#changePw-repeatNewPw"),
        changePwModal,
        clubInfoModal,
        emailOfClubInfo = $("div#clubInfoModal>div>div.content>div.email"),
        clubInfoName = $("#clubInfo-name"),
        clubInfoContacts = $("#clubInfo-contacts"),
        clubInfoMobilePhone = $("#clubInfo-mobilePhone"),
        clubInfoOrderPhone = $('#clubInfo-orderPhone'),
        clubInfoTelephone = $("#clubInfo-telephone"),
        clubInfoEmail = $("#clubInfo-email"),
        clubInfoAddress = $("#clubInfo-address"),
        clubInfoViewType = $('input[name=viewClubType]'),
        customerRule = $("div.customer-rule"),
        clubLocModal,
        thisAMap,
        editLogoModal,
        imagePreview,
        editLogoModalContent = $("#editLogoModal>div>div.content"),
          currprogressBar = $("div.progress-bar"),
          currProgress = $("div.progress-bar>div>div>div"),
          currProgressText = $("div.progress-bar>div>span.text"),
      clubCanvas = $(".pre-draw-card>canvas.club")[0],
      clubCtx = clubCanvas.getContext("2d"),
      cardCanvas = $(".pre-draw-card>canvas.card")[0],
      cardCtx = cardCanvas.getContext("2d"),
      logoCanvas = $(".pre-draw-card>canvas.logo")[0],
      logoCtx = logoCanvas.getContext("2d"),
      JSZip = require("jszip");

    var $autoComInput = $('#locSearch'),$autoComResult = $('#autoSearchRes');

    thisPage.attr("ms-controller",vmId);
    $$.currPath.html("会所资料");

    //==== 注册一过滤器====
    avalon.filters.viewTypeFilter = function (str) {
        str = str || 'all';
        return str=='all' ? '全部可见' : '客户可见';
    };
    avalon.filters.nullToValueFilter = function (str, value) {
        return str ? str : value;
    };

    var vm = avalon.define({
        $id : vmId,
        info : {},
        currTelCount : 0,
        clubAddress : "",
        currWifiCount:0,
        doChangePw : function(){
            changePwCurrPw.val("");
            changePwNewPw.val("");
            changePwRepeatNewPw.val("");
            changePwModal.show();
        },
        doEditClubInfo : function(){
            $("div#clubInfoModal>div>div.content>div.del").remove();
            clubInfoName.val(vm.info.club.name);
            clubInfoContacts.val(vm.info.club.contacts);
            clubInfoMobilePhone.val(vm.info.club.mobilePhone);
            clubInfoOrderPhone.val(vm.info.club.orderPhone);
            clubInfoEmail.val(vm.info.club.email);
            clubInfoAddress.val(vm.info.club.address);
            vm.info.club.viewType || (vm.info.club.viewType = 'all');
            clubInfoViewType.filter('[value='+vm.info.club.viewType+']').prop('checked',true);
            $("#clubInfo-lngx").val(vm.info.club.lngx);
            $("#clubInfo-laty").val(vm.info.club.laty);

            $("#clubInfo-province").val(vm.info.club.province || "");
            $("#clubInfo-city").val(vm.info.club.city || "");
            $("#clubInfo-region").val(vm.info.club.region || "");
            $("#clubInfo-place-code").val(vm.info.club.regionCode || "");
            //////客服电话
            var telArr = vm.info.club.telephone.split(",") || [];
            vm.currTelCount = telArr.length;
            if(telArr.length !=0){
                clubInfoTelephone.val(telArr[0]);
                if(telArr.length>1){
                    for(var i=1;i<telArr.length;i++){
                        $("<div class='tel del'><label></label><input type='text' value='"+telArr[i]+"' maxlength='15' placeholder='请输入客服电话'/><i></i></div>").insertBefore(emailOfClubInfo);
                    }
                }
            }
            else{
                clubInfoTelephone.val("");
            }

            //////wifi列表
            var wifiArr = vm.info.ssid.split(",") || []
            var wifiPwArr = vm.info.ssidPassword.split(",") || []
            vm.currWifiCount = wifiArr.length
            if(wifiArr.length !=0){
                $("#clubInfo-wifi").val(wifiArr[0])
                $("#clubInfo-wifi-password").val(wifiPwArr[0])
                if(wifiArr.length>1){
                    for(var i=1;i<wifiArr.length;i++){
                        $("<div class='wifi del'><label></label><input type='text' value='"+wifiArr[i]+"' placeholder='wifi账号' maxlength='30'/><input type='text' value='"+wifiPwArr[i]+"' placeholder='wifi密码' maxlength='30'/><i></i></div>").insertBefore(customerRule);
                    }
                }
            } else {
                $("#clubInfo-wifi").val("")
                $("#clubInfo-wifi-password").val("")
            }

            clubInfoModal.show();
        },
        doLocMap : function(){
            clubLocModal.show();
        },
        doClickEditLogo : function(){
            if(vm.info.club.imageUrl){
                imagePreview.load(vm.info.club.imageUrl,{
                    autoCropArea : 1, disabled : true
                });
            }
            editLogoModal.show();
        },
        updateClubCard: function(){ // 更新会所
            currProgress.css("width","20%");
            currProgressText.text("");
            currprogressBar.addClass("active");
            setTimeout(function(){
                currProgress.css("width","60%");
            },200)
            zipFile = new JSZip();
            drawClubCard($$.clubName,$$.clubLogo,function(){
                var cardData = cardCanvas.toDataURL("image/png");
                $.ajax({
                    url: "club/tech/qrcode/image/upload",
                    type: "post",
                    data: {
                        type: "club",
                        value: $$.clubId,
                        imgFile: cardData
                    },
                    success: function(res){
                        if(res.statusCode == 200){
                            currProgress.css("width","100%");
                            msgAlert("更新成功！",true);
                            setTimeout(function(){
                                currprogressBar.removeClass("active");
                            },500)

                            // 导出图片
                            cardData = cardData.substr(cardData.indexOf(",") + 1);
                            zipFile.file("会所卡片.png", cardData, {base64: true});
                            if($$.exportCard){
                                zipFile.generateAsync({ type:"blob" }).then(function (blob) {
                                    saveAs(blob,"会所卡片.zip");
                                })
                            }
                        }
                    }
                })
            });
        },
    });

    /////////////////////////////////////////////////点击修改密码
    changePwModal = new Modal($("#changePwModal"),{
            doClickOkBtn : function(){
                if(checkChangePwFormValidate()){
                    changePwModal.loading();
                    $.ajax({
                        url : "profile/password/update",
                        type : "post",
                        data : { password : changePwCurrPw.val() , plainPassword : changePwNewPw.val() },
                        success : function(res){
                            if(res.statusCode == 200){
                                changePwModal.close();
                                msgAlert(res.msg,true);
                            }
                            else{
                                changePwModal.showTip(res.msg);
                            }
                        },
                        complete : function(xhr){
                            changePwModal.loading("hide");
                            if(xhr.status == 200){
                                changePwModal.close();
                                msgAlert("账号密码修改成功！",true);
                            }
                            else if(xhr.status == 400){
                                changePwModal.showTip(xhr.responseText);
                            }
                        }
                    });
                }
            }
        });

    $("#changePwModal>div>div.content").on("input","div>input",function(){
        if(this.value.length>30) this.value = this.value.substr(0,30);
        if(/\s/.test(this.value)) this.value = this.value.replace(/\s/g,"");
    }).on("keypress","div>input",function(event){
        if(event.keyCode==13){
            $("#changePwModal>div>div.footer>a:eq(0)").click();
        }
    });

    function checkChangePwFormValidate(){
        if(!changePwCurrPw.val()){
            changePwCurrPw.focus();
            changePwModal.showTip("请输入当前密码！");
            return false;
        }
        if(!changePwNewPw.val()){
            changePwNewPw.focus();
            changePwModal.showTip("请输入新的密码！");
            return false;
        }
        if(!changePwRepeatNewPw.val()){
            changePwRepeatNewPw.focus();
            changePwModal.showTip("请再次输入新密码！");
            return false;
        }
        if(changePwRepeatNewPw.val() != changePwNewPw.val()){
            changePwRepeatNewPw.focus();
            changePwModal.showTip("两次输入的新密码不一致！");
            return false;
        }
        return true;
    }

    ///////////////////////////////////////////////////////////修改会所资料
    clubInfoModal = new Modal($("#clubInfoModal"),{
        doClickOkBtn : function(){
            if(checkClubInfoForm()){
                clubInfoModal.loading();
                var province = $("#clubInfo-province").val(),
                    city = $("#clubInfo-city").val(),
                    region = $("#clubInfo-region").val(),
                    regionCode = $("#clubInfo-place-code").val();
                if(province && !city){
                    city = province;
                }

                $.ajax({
                    url : "profile/club/update",
                    type : "post",
                    data : {
                        name : clubInfoName.val(),
                        contacts : clubInfoContacts.val(),
                        mobilePhone : clubInfoMobilePhone.val(),
                        orderPhone: /[,，]$/.test(clubInfoOrderPhone.val())?(clubInfoOrderPhone.val().substring(0,clubInfoOrderPhone.val().length-1)):clubInfoOrderPhone.val(),
                        email : clubInfoEmail.val(),
                        address : clubInfoAddress.val(),
                        lngx : $("#clubInfo-lngx").val(),
                        laty : $("#clubInfo-laty").val(),
                        province : province,
                        city : city,
                        region : region,
                        telephone : getTelArr().join(","),
                        ssid: getWifiAccount().join(","),
                        ssidPassword: getWifiPw().join(","),
                        regionCode : regionCode,
                        viewType:clubInfoViewType.filter(':checked').val() || 'all'
                    },
                    success : function(res){
                        clubInfoModal.loading("hide");
                        if(res.statusCode == 200){
                            clubInfoModal.close();
                            msgAlert(res.msg,true);
                            //////////////////////////////
                            var clubInfo = vm.info.club
                            clubInfo.name = clubInfoName.val();
                            clubInfo.contacts = clubInfoContacts.val();
                            clubInfo.mobilePhone = clubInfoMobilePhone.val();
                            clubInfo.orderPhone = /[,，]$/.test(clubInfoOrderPhone.val())?(clubInfoOrderPhone.val().substring(0,clubInfoOrderPhone.val().length-1)):clubInfoOrderPhone.val();
                            clubInfo.email = clubInfoEmail.val();
                            clubInfo.address = clubInfoAddress.val();
                            clubInfo.lngx = $("#clubInfo-lngx").val();
                            clubInfo.laty = $("#clubInfo-laty").val();
                            clubInfo.province = $("#clubInfo-province").val();
                            clubInfo.city = $("#clubInfo-city").val();
                            clubInfo.region = $("#clubInfo-region").val();
                            clubInfo.regionCode = $("#clubInfo-place-code").val();
                            clubInfo.telephone = getTelArr().join(",");
                            clubInfo.viewType = clubInfoViewType.filter(':checked').val() || 'all';

                            vm.info.ssid = getWifiAccount().join(",")
                            vm.info.ssidPassword = getWifiPw().join(",")
                            $$.clubName = clubInfo.name
                            $("div#info>div.club").text($$.clubName);
                        }
                        else{
                            clubInfoModal.showTip(res.msg || "操作失败！");
                        }
                    }
                });
            }
        }
    });

    function checkClubInfoForm(){
        if(!clubInfoName.val()){
            clubInfoModal.showTip("请输入会所名称！");
            clubInfoName.focus();
            return false;
        }
        if(clubInfoMobilePhone.val() && !/^1[34578]\d{9}$/.test(clubInfoMobilePhone.val()) ){
            clubInfoModal.showTip("请输入正确的手机号码！");
            clubInfoMobilePhone.focus();
            return false;
        }
        if(clubInfoOrderPhone.val() && !/^(1[34578]\d{9}[,，]?){1,3}$/.test(clubInfoOrderPhone.val()) ){
            clubInfoModal.showTip("请输入正确的订单提醒的手机号码！");
            clubInfoOrderPhone.focus();
            return false;
        }
        if(clubInfoEmail.val() && !/^([\.a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/.test(clubInfoEmail.val())){
            clubInfoModal.showTip("请输入正确的电子邮箱！");
            clubInfoEmail.focus();
            return false;
        }
        return true;
    }

    function getTelArr(){
        var arr = [], k, list = $("#clubInfoModal>div>div.content>div.tel>input");
        for(k=0;k<list.length;k++){
            if(list[k].value){
                arr.push(list[k].value);
            }
        }
        return arr;
    }

    function getWifiAccount(){
        var arr = [], k, list = document.querySelectorAll("#clubInfoModal>div>div.content>div.wifi>input:nth-of-type(1)");
        for(k=0;k<list.length;k++){
            if(list[k].value){
                arr.push(list[k].value);
            }
        }
        return arr;
    }

    function getWifiPw(){
        var arr = [], k, list = document.querySelectorAll("#clubInfoModal>div>div.content>div.wifi>input:nth-of-type(2)");
        var wifiList = document.querySelectorAll("#clubInfoModal>div>div.content>div.wifi>input:nth-of-type(1)");
        for(k=0;k<wifiList.length;k++){
            if(wifiList[k].value){
                arr.push(list[k].value);
            }
        }
        return arr;
    }

    $("#clubInfoModal>div>div.content").on("click","div.tel.del>i",function(){//////删除客服电话
        $(this).parents("div.tel").remove();
        vm.currTelCount = vm.currTelCount-1;
    });

    $("#clubInfoModal>div>div.content").on("click","div.wifi.del>i",function(){//////删除wifi
        $(this).parents("div.wifi").remove();
        vm.currWifiCount = vm.currWifiCount-1;
    });

    $("#clubInfoModal>div>div.content").on("click","div.tel.plus>i",function(){//////增加客服电话
        $("<div class='tel del'><label></label><input type='text' maxlength='15' placeholder='请输入客服电话'/><i></i></div>").insertBefore(emailOfClubInfo);
        vm.currTelCount = vm.currTelCount+1;
    });

    $("#clubInfoModal>div>div.content").on("click","div.wifi.plus>i",function(){
        $("<div class='wifi del'><label></label><input placeholder='wifi账号' maxlength='30'/><input placeholder='wifi密码' maxlength='30'/><i></i></div>").insertBefore(customerRule);
        vm.currWifiCount = vm.currWifiCount+1;
    });

    ///////////////////////////输入限制
    clubInfoMobilePhone.on("input",function(){
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
    $("#clubInfoModal>div>div.content").on("input","div.tel>input",function(){
        if(/[^-|\d]/.test(this.value)){
            this.value = this.value.replace(/[^-|\d]/g, '');
        }
        if (this.value.length > 15) {
            this.value = this.value.substring(0, 15);
        }
    });

    ////////////////////////////////////////clubLocModal
    clubLocModal = new Modal($("#clubLocModal"),{
        doClickOkBtn : function(){
            $("#clubInfo-lngx").val($("#map-lngx").val());
            $("#clubInfo-laty").val($("#map-laty").val());
            $("#clubInfo-province").val($("#map-province").val());
            $("#clubInfo-city").val($("#map-city").val());
            $("#clubInfo-region").val($("#map-region").val());
            $("#clubInfo-place-code").val($("#map-place-code").val());
            clubInfoAddress.val(vm.clubAddress);
            clubLocModal.close();
        }
    });

    $("#club-logo")[0].onerror = function(){
        this.src = "club-admin/img/common/clubLogo.jpg";
    };

    ///////////////////////////////////////////////初始化地图
    function initMap(){
        var waitAMpaInit = setInterval(function(){
            if(AMap && AMap.LngLat){
                clearInterval(waitAMpaInit);
                /////////////////////////地图对象
                vm.clubAddress = vm.info.club.address;
                var mapInitObj = {
                    zoom:15 //地图显示的缩放级别
                };
                if(vm.info.club.laty && vm.info.club.lngx){
                    $("#map-lngx").val(vm.info.club.lngx);
                    $("#map-laty").val(vm.info.club.laty);
                    $("#map-province").val(vm.info.club.province || "");
                    $("#map-city").val(vm.info.club.city || "");
                    $("#map-region").val(vm.info.club.region || "");
                    $("#map-place-code").val(vm.info.club.regionCode || "");
                    mapInitObj.center = new AMap.LngLat(vm.info.club.lngx,vm.info.club.laty);
                }
                thisAMap = new AMap.Map("loc-map", {
                    resizeEnable: true,
                    view: new AMap.View2D(mapInitObj),
                    isHotspot: true//加载热点
                });

                if(vm.info.club.laty && vm.info.club.lngx){
                    AMap.event.addListener(thisAMap,'complete',function(){
                        var marker = new AMap.Marker({
                            position: new AMap.LngLat(vm.info.club.lngx,vm.info.club.laty),
                            offset: new AMap.Pixel(-10,-34),
                            icon: "./img/common/mark_bs.png"
                        });
                        marker.setMap(thisAMap);
                    });
                }

                //点击热点获取经纬度
                AMap.event.addListener(thisAMap, 'click', function(e){
                    $('.amap-icon').remove();
                    //获取地址
                    showMapAddress([e.lnglat.getLng(), e.lnglat.getLat()]);

                    //实例化信息窗体
                    new AMap.InfoWindow({
                        isCustom: true,  //使用自定义窗体
                        autoMove: false,
                        content:'<img src="./img/common/mark_bs.png" />', //信息窗体显示内容
                        offset:new AMap.Pixel(0, 8) //设置偏移量
                    }).open(thisAMap, e.lnglat);
                });

                //自动搜索
                var autoComplete;
                thisAMap.plugin(["AMap.Autocomplete"], function() {
                    AMap.event.addDomListener($autoComInput[0], 'input', function () {
                        var keywords = $autoComInput.val();
                        if(!keywords){
                            $autoComResult.hide();
                        }
                        else{
                            autoComplete = new AMap.Autocomplete({
                                pageIndex : 1,
                                pageSize : 10,
                                city : "" //城市，默认全国
                            });
                            //查询成功时返回查询结果
                            AMap.event.addListener(autoComplete, "complete", autoSearchCallback);
                            autoComplete.search(keywords);
                        }
                    });
                });

                $autoComResult.on('click','div', function (){ //截取输入提示的关键字部分
                    var text = this.innerHTML.replace(/<[^>].*?>.*<\/[^>].*?>/g,"");
                    $autoComInput.val(text);
                    //根据选择的输入提示关键字查询
                    thisAMap.plugin(["AMap.PlaceSearch"], function() {
                        var mapSearch = new AMap.PlaceSearch();  //构造地点查询类
                        AMap.event.addListener(mapSearch, "complete", searchCallback); //查询成功时的回调函数
                        mapSearch.search(text);  //关键字查询查询
                    });
                    $autoComResult.hide();
                });
            }
        },100);
    }

    function showMapAddress(locArr){
        $("#map-lngx").val(locArr[0]);
        $("#map-laty").val(locArr[1]);
        new AMap.Geocoder({
            radius: 1000,
            extensions: "all"
        }).getAddress(locArr, function(status, result) {
            if (status === 'complete' && result.info === 'OK') {
                var place = result.regeocode.addressComponent;
                //console.log("map result：province--"+place.province+"--city--"+place.city+"--district--"+place.district);
                $("#map-province").val(place.province);
                $("#map-city").val(place.city);
                $("#map-region").val(place.district);
                $("#format-address").val(result.regeocode.formattedAddress);
                $("#map-place-code").val(place.adcode);
                vm.clubAddress = result.regeocode.formattedAddress;
            }
        });
    }

    function autoSearchCallback(data){
        var resultStr = "", tipArr = [];
        if(!data.tips) return;
        tipArr = data.tips;
        if (tipArr.length>0) {
            for (var i = 0; i < tipArr.length; i++) {
                resultStr += "<div >" + tipArr[i].name + "<span>"+ tipArr[i].district + "</span></div>";
            }
        }
        else  {
            resultStr = "无搜索结果，请重新输入!";
        }
        $autoComResult[0].innerHTML = resultStr;
        $autoComResult.show();
    }

    function searchCallback(data){
        thisAMap.clearMap();
        var poiArr = data.poiList.pois;
        poiArr.forEach(function (d,i) {
            var lngX, latY;
            if(d.location){
                lngX = d.location.getLng();
                latY = d.location.getLat();
            }else{
                lngX = d._location.getLng();
                latY = d._location.getLat();
            }
            var markerOption = {
                map: thisAMap,
                icon:"http://webapi.amap.com/images/" + (i + 1) + ".png",
                position:new AMap.LngLat(lngX, latY)
            };
            var mar = new AMap.Marker(markerOption);
            AMap.event.addListener(mar, "click", function (e){
                showMapAddress([lngX, latY]);
            });
        });
        if(poiArr[0]) thisAMap.setZoomAndCenter(16,[poiArr[0].location.getLng(),poiArr[0].location.getLat()]);
    }

    ////////////////////////////////////////////////////////////////编辑会所logo图片
    editLogoModal = new Modal($("#editLogoModal"),{
        doClickOkBtn : function(){
            if($("#clubLogoForm>div>img")[0] && $("#clubLogoForm>div>img")[0].width !=0){
                if(!$("#uploadImgBtn")[0].files[0]){
                    editLogoModal.close();
                }
                else{
                    var checkRes = imagePreview.checkSelectionValidate();
                    if(checkRes != "OK"){
                        editLogoModal.showTip(checkRes);
                        return;
                    }
                    editLogoModal.loading();
                    $("#clubLogoForm").ajaxSubmit({
                        dataType:  'json',
                        success : function(res){
                            if(res && res.avatarUrl){
                                $("#club-logo")[0].src = res.avatarUrl;
                                $("header>div.logo>img")[0].src = res.avatarUrl;
                                vm.info.club.imageUrl = res.avatarUrl;
                                $$.clubLogo = res.avatarUrl;
                                editLogoModal.close();
                                msgAlert("修改成功！",true);
                            }
                            else{
                                editLogoModal.showTip(res.msg || res.message || "修改失败！");
                            }
                        },
                        complete : function(xhr){
                            editLogoModal.loading("hide");
                            if(xhr.status == 400){
                                editLogoModal.showTip("您选择的裁剪区域过大！请通过鼠标缩小区域！");
                            }
                        }
                    });
                }
            }
            else{
                editLogoModal.showTip("请您上传图片！");
            }
        }
    });

    imagePreview = new iCropper({
        imgFile : $("#uploadImgBtn")[0],
        img : $("#clubLogoForm>div>img")[0],
        selectionTxt : $("#clubLogoForm>div>span.selectionTxt")[0],
        imgName : $("#imgFileName")[0],
        maxWidth : 580,
        maxHeight : 300,
        x : $("#x")[0],
        y : $("#y")[0],
        w : $("#w")[0],
        h : $("#h")[0],
        imgWidth : 168,
        imgHeight : 168,
        onImgLoad : function(){
            if(!editLogoModalContent.hasClass("hasImg")){
                editLogoModalContent.addClass("hasImg");
            }
        }
    });

    $.ajax({
        url : "profile/data",
        success : function(res){
            if(res.statusCode == 200){
                vm.info = res.respData;
                $("#club-logo")[0].src = res.respData.club.imageUrl || "";
                avalon.scan(thisPage[0]);

                if(vm.info.club.indexQrcodeUrl && /^http/.test(vm.info.club.indexQrcodeUrl)){
                    $("#club-qrcode-img")[0].src = vm.info.club.indexQrcodeUrl;
                }
                else{
                    $.ajax({
                        url : "club/get/qrcode",
                        type : "post",
                        success : function(qrRes){
                            if(qrRes.statusCode==200) $("#club-qrcode-img")[0].src = qrRes.respData;
                        }
                    });
                }

                /////获取客人注册二维码
                $.ajax({
                    url : "api/v1/wx/club/param_qrcode",
                    data : {
                        clubId : res.respData.club.clubId
                    },
                    success : function(imgRes){
                        if(imgRes.statusCode == 200){
                            $("#registeredQrCode")[0].src = imgRes.respData;
                        }
                    }
                });
                initMap();
            }
        }
    });

    //===== 生成扫码支付的二维码 ====
    $('#qrPayCode').qrcode({
        width:430,
        height:430,
        text:location.origin+(location.pathname.split(';')[0]+'spa2/?#qrPay&clubId='+ $$.clubId),
        roundBlank:true         //四周是否留白
    });

    //==== 会所图片 ====
    function drawClubCard(clubName, logo, callback){
        cardCtx.clearRect(0,0,900,500);
        cardCtx.drawImage(clubCanvas,0,0,900,500)

        // 会所名称
        cardCtx.textBaseline = "middle";
        cardCtx.textAlign = "left";
        cardCtx.fillStyle = "#fffeed"
        cardCtx.font = "normal 48px 微软雅黑";
        cardCtx.strokeStyle = "#5f366b"
        cardCtx.lineWidth = 1
        cardCtx.fillText(clubName, 158, 120,724);
        //clubCtx.strokeText(clubName, 158, 73);

        // 会所logo
        var clubLogo = new Image()
        clubLogo.crossOrigin = "anonymous";
        //console.log("crossOrigin Anonymous")
        clubLogo.onload = function(){
            var w = clubLogo.width;
            var h = clubLogo.height;
            var width = Math.max(w,h);
            drawLogo(clubLogo,width)
            cardCtx.drawImage(logoCanvas,0,0,width,width,39,70,100,100)
            if (callback){
                callback();
            }
        }
        clubLogo.onerror = function(){
            clubLogo.src = "club-admin/img/card/4.png"
        }
        clubLogo.src = logo || "club-admin/img/card/4.png"
        //clubLogo.src = "http://sdcm162.stonebean.com:8489/s/group00/M00/05/40/ooYBAFe30G6AMZI9AADcsGfP37w209.png?st=VP8CwAn8UbXPldnGKae9iQ&e=1481969031"
    }

    function drawLogo(logoImg,width){
        logoCanvas.setAttribute("width",width)
        logoCanvas.setAttribute("height",width)
        logoCanvas.style.width = width +"px";
        logoCanvas.style.height = width +"px";

        var pattern = logoCtx.createPattern(logoImg, "no-repeat");
        logoCtx.arc(width/2, width/2, width/2, 0, 2 * Math.PI);
        logoCtx.fillStyle = pattern;
        logoCtx.fill();
    }

    function preDrawCard(){
        // 绘制会所的卡片
        var img2 = new Image()
        img2.onload = function(){
            clubCtx.drawImage(img2,0,0)

            clubCtx.fillStyle = "#fff";
            clubCtx.font = "normal 48px 微软雅黑";
            clubCtx.textAlign = "left";
            clubCtx.textBaseline = "middle";
            // clubCtx.fillText("约技师，抢优惠，关注9358", 48, 500-109/2);
        }
        img2.src = "club-admin/img/card/1.png";
    }
    preDrawCard();
});