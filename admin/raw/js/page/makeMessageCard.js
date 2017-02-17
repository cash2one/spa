require(["css!../../compressed/css/page/"+$$.rootVm.page+".css?"+$$.rootVm.currTime,"jszip","fileSaver","!domReady"],function(){
    var vmId = $$.rootVm.page+"Ctrl"+(+new Date()),
        thisPage = $("#"+$$.rootVm.page+"Page"),
        techCanvas = $(".pre-draw-card>canvas.tech")[0],
        techCtx = techCanvas.getContext("2d"),
        clubCanvas = $(".pre-draw-card>canvas.club")[0],
        clubCtx = clubCanvas.getContext("2d"),
        cardCanvas = $(".pre-draw-card>canvas.card")[0],
        cardCtx = cardCanvas.getContext("2d"),
        logoCanvas = $(".pre-draw-card>canvas.logo")[0],
        logoCtx = logoCanvas.getContext("2d");

    var searchText = $("#search-text"),
        selectedCount = 0,
        canSelectedCount = 0,
        currprogressBar = $("div.progress-bar"),
        currProgress = $("div.progress-bar>div>div>div"),
        currProgressText = $("div.progress-bar>div>span.text"),
        currCommitTechCount = 0,
        JSZip = require("jszip"),
        zipFile = null;

    thisPage.attr("ms-controller",vmId);
    $$.currPath.html("更新微信图片");

    var vm = avalon.define({
        $id : vmId,
        dataList : [],
        isSelectedAll : false,
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
        updateTechCard: function(){ // 更新技师
            if(selectedCount>0){
                currProgress.css("width","0%");
                currProgressText.text("0/"+selectedCount);
                currprogressBar.addClass("active");
                currCommitTechCount = 0;
                zipFile = new JSZip();
                commitTechCard(0);
            }
            else{
                msgAlert("未选择技师！",true)
            }
        },
        doClickSearchBtn : function(){
            queryData();
        },
        deSelectTech : function(index){
            var list = vm.dataList;
            var isSelected = list[index].selected;
            list[index].selected = !isSelected;
            if(isSelected){
                vm.isSelectedAll = false;
                selectedCount--;
            }
            else{
                selectedCount++;
                if(selectedCount == canSelectedCount){
                    vm.isSelectedAll = true;
                }
            }
        },
        doClickSelectAll : function(){
            vm.isSelectedAll = !vm.isSelectedAll;
            var list = vm.dataList;
            selectedCount = 0;
            for(var k=0;k<list.length;k++){
                list[k].selected = vm.isSelectedAll;
                if(vm.isSelectedAll){
                    selectedCount++;
                }
            }
        },
    });

    function commitTechCard(index){
        if(index>=vm.dataList.length){
            currprogressBar.removeClass("active");
            msgAlert("更新完成！",true)
            if($$.exportCard){
                zipFile.generateAsync({ type:"blob" }).then(function (blob) {
                    saveAs(blob,"技师卡片.zip");
                })
            }
            return;
        }
        var tech =  vm.dataList[index];
        if(tech.selected){
            currCommitTechCount++;
            currProgressText.text(currCommitTechCount+"/"+selectedCount);
            currProgress.css("width",(currCommitTechCount/selectedCount).toFixed(2)*100+"%");
            drawTechCard(tech.name,tech.techNo,tech.avatar,function(){
                console.log("draw tech card:"+tech.name)
                var cardData = cardCanvas.toDataURL("image/png");
                $.ajax({
                    url: "club/tech/qrcode/image/upload",
                    type: "post",
                    data: {
                        type: "tech",
                        value: tech.id,
                        imgFile: cardData
                    },
                    success: function(res){
                        if(res.statusCode == 200){
                            cardData = cardData.substr(cardData.indexOf(",") + 1);
                            zipFile.file(tech.name+".png", cardData, {base64: true});
                            commitTechCard(index+1)
                        }
                    }
                })
            });
        } else{
            commitTechCard(index+1)
        }
    }

    function queryData(){
        $.ajax({
            url : "tech/list",
            data : {
                name : searchText.val().toString().trim()
            },
            success : function(res){
                if(res.respData){
                    res = res.respData || [];
                    canSelectedCount = 0;
                    vm.isSelectedAll = false;
                    for(var k=0;k<res.length;k++){
                        res[k]["selected"] = false;
                        canSelectedCount++;
                    }
                    res.sort(function(a,b){
                        if(!a.techNo) return 1;
                        else if(!b.techNo) return -1;
                        return a.techNo>b.techNo ? 1 : -1;
                    });
                    vm.dataList = res;
                    selectedCount = 0;
                    avalon.scan(thisPage[0]);
                }
            }
        });
    }

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

    function drawTechCard(techName,techNo,techHeader,callBack){
        cardCtx.clearRect(0,0,900,500);
        cardCtx.drawImage(techCanvas,0,0,900,500)
        // 技师昵称
        cardCtx.fillStyle = "#663a8d";
        cardCtx.font = "bold 48px 微软雅黑";
        cardCtx.textBaseline = "middle";
        cardCtx.textAlign = "left";
        techName = getTechName(techName,cardCtx,280);
        cardCtx.fillText(techName, 318, 150);

        if(techNo){
            var techNameWidth = cardCtx.measureText(techName).width
            cardCtx.font = "normal 48px 微软雅黑";
            cardCtx.fillText(techNo, 328+ techNameWidth, 150);
        }

        // 绘制技师图片
        var techImg = new Image()
        techImg.crossOrigin = "";
        techImg.onload = function() {
            cardCtx.drawImage(techImg,48,133,232,232);
            if(callBack){
                callBack();
            }
        }
        techImg.onerror = function(){
            techImg.src = "club-admin/img/card/3.jpg"
        }
        techImg.src = techHeader || "club-admin/img/card/3.jpg"
    }

    function getTechName(techName,ctx,maxLen){
        var str = "";
        for(var k=0;k<techName.length;k++){
            str = str + techName.charAt(k);
            if(ctx.measureText(str)>maxLen){
                if(k<techName.length-1){
                    str = str+'...'
                }
                return str
            }
        }
        return str
    }

    function preDrawCard(){
        // 绘制技师的卡片
        var img1 = new Image();
        img1.onload = function() {
            techCtx.drawImage(img1,0,0)
            techCtx.fillStyle = "#fff";
            techCtx.font = "normal 48px 微软雅黑";
            techCtx.textAlign = "left";
            techCtx.textBaseline = "middle";
            // techCtx.fillText("约技师，抢优惠，关注9358", 48, 500-109/2);
        }
        img1.src = "club-admin/img/card/2.png";

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

    preDrawCard();
    queryData();
});