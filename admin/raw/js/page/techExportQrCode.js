require(["css!../../compressed/css/page/"+$$.rootVm.page+".css?"+$$.rootVm.currTime,"qrcode","jszip","fileSaver","!domReady"],function(){
    var vmId = $$.rootVm.page+"Ctrl"+(+new Date()),
        thisPage = $("#"+$$.rootVm.page+"Page"),
        searchText = $("#search-text"),
        selectedCount = 0,
        preCanavs = $("div.canvasImg>canvas"),
        rectStyleCanvas = $("#rectStyle")[0],
        heartStyleCanvas = $("#heartStyle")[0],
        tempQrCode = $('#tempQrCode'),
        techCanvas = $(".pre-draw-card>canvas.tech")[0],
        techCtx = techCanvas.getContext("2d"),
        cardCanvas = $(".pre-draw-card>canvas.card")[0],
        cardCtx = cardCanvas.getContext("2d"),
        logoCanvas = $(".pre-draw-card>canvas.logo")[0],
        logoCtx = logoCanvas.getContext("2d"),
        currCanvas,
        currCtx,
        JSZip = require("jszip"),
        currCommitTechCount = 0,
        zipFile = null,
        currprogressBar = $("div.progress-bar"),
        currProgress = $("div.progress-bar>div>div>div"),
        currProgressText = $("div.progress-bar>div>span.text"),
        canSelectedCount = 0,
        currDate = new Date(),
        clubLogo = new Image();
    clubLogo.crossOrigin = "Anonymous";
    clubLogo.src = $$.clubLogo;

    thisPage.attr("ms-controller",vmId);
    $("div#info>div.path>span:eq(0)>a").attr('href','#!/techList');
    $$.currPath.html("导出二维码");

    var vm = avalon.define({
        $id : vmId,
        currCodeStyle : 1, //当前选择的二维码样式
        dataList : [],
        isSelectedAll : false,
        isCheckedComment: true, //导出点评二维码：默认选中
        isCheckedDetail: false, //导出技师二维码：默认不选中
        doClickSearchBtn : function(){
            queryData();
        },
        doChangeCodeStyle : function(v){
            vm.currCodeStyle = v;
        },
        doClickExportBtn : function(){ //点击导出按钮
            if(selectedCount == 0){
                return msgAlert("请选择技师！")
            }
            var isCross = true,tmpTrue = [],tmpFalse = [];
            for(var _ix = 0,_len = vm.dataList.length; _ix < _len; _ix++){
                if(vm.dataList[_ix].selected ){
                    vm.dataList[_ix].techNo && tmpTrue.push(true);
                    !vm.dataList[_ix].techNo && tmpFalse.push(false);
                }
            }
            if(tmpTrue.length == 0){
                msgAlert('技师工号为空，不可导出');
                return;
            }
            //selectedCount = selectedCount * (Number(vm.isCheckedComment) + Number(vm.isCheckedDetail));
            var tmpSelectedCount = selectedCount * (Number(vm.isCheckedComment) + Number(vm.isCheckedDetail));
            currCanvas = vm.currCodeStyle !=5 ? rectStyleCanvas : heartStyleCanvas;
            currCtx = currCanvas.getContext("2d");
            var zip = new JSZip();
            currProgress.css("width","0%");
            currProgressText.text("0/"+tmpSelectedCount);
            currprogressBar.addClass("active");

            setTimeout(function(){
                addZipFile(zip,0,0, function () {
                    zip.generateAsync({ type:"blob" }).then(function (blob) {
                        var dateStr = (currDate.getMonth()<9 ? "0" : "")+(currDate.getMonth()+1)+(currDate.getDate()<10 ? "0" : "")+currDate.getDate();
                        saveAs(blob, $$.clubName+"技师工牌"+dateStr+".zip");
                        currprogressBar.removeClass("active");
                    });
                });
                /*setTimeout(function(){
                    zip.generateAsync({ type:"blob" }).then(function (blob) {
                        var dateStr = (currDate.getMonth()<9 ? "0" : "")+(currDate.getMonth()+1)+(currDate.getDate()<10 ? "0" : "")+currDate.getDate();
                        saveAs(blob, $$.clubName+"技师工牌"+dateStr+".zip");
                        currprogressBar.removeClass("active");
                    });
                },130*selectedCount)*/
            },100);
        },
        deSelectTech : function(index){
            var list = vm.dataList;
            var isSelected = list[index].selected;
            /*if(!list[index].techNo){
                return msgAlert("技师工号为空，无法导出工牌！")
            }*/
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
                //if(list[k].techNo){
                    list[k].selected = vm.isSelectedAll;
                    if(vm.isSelectedAll){
                        selectedCount++;
                    }
                //}
            }
        },
        toggleDetailQr: function(){
            vm.isCheckedDetail = !vm.isCheckedDetail;
            if(!vm.isCheckedDetail){
                vm.isCheckedComment = true;
            }
        },
        toggleCommentQr: function(){
            vm.isCheckedComment = !vm.isCheckedComment;
            if(!vm.isCheckedComment){
                vm.isCheckedDetail = true;
            }
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
    });

    function addZipFile(zip,index,count,callback){
        var dataItem = vm.dataList[index/(Number(vm.isCheckedComment) + Number(vm.isCheckedDetail))];
        if(dataItem.selected && dataItem.techNo && dataItem.url){
            //console.count('调用次数：');
            //console.log("dataItem.techNo："+dataItem.techNo+"--dataItem.commentUrl："+dataItem.commentUrl);
            /*if(!dataItem.commentUrl){
                dataItem.commentUrl = location.protocol + '//' + location.host + location.pathname+"spa2/?club="+$$.clubId+"#comment&techId="+dataItem.id+"&type=tech&isScan=1";
                console.log("技师："+dataItem.id+"点评短链接不存在！");
            }
            if(!dataItem.detailUrl){
                dataItem.detailUrl = location.protocol + '//' + location.host + location.pathname+"spa2/?club="+$$.clubId+"#technicianDetail&id="+dataItem.id;
                console.log("技师："+dataItem.id+"主页短链接不存在！");
            }
            var imgData = '';
            if(vm.isCheckedDetail){
                imgData = drawCodeStyle(dataItem.techNo, dataItem.detailUrl);
                imgData = imgData.substr(imgData.indexOf(",") + 1);
                zip.file(dataItem.techNo+ '-【主页】' + ".png", imgData, {base64: true});
                count++;
                index++;
            }
            if(vm.isCheckedComment){
                imgData = drawCodeStyle(dataItem.techNo, dataItem.commentUrl);
                imgData = imgData.substr(imgData.indexOf(",") + 1);
                zip.file(dataItem.techNo+ '-【点评】' + ".png", imgData, {base64: true});
                count++;
                index++;
            }*/
            var imgData  = drawCodeStyle(dataItem.techNo, dataItem.url);
                imgData = imgData.substr(imgData.indexOf(",") + 1);
                zip.file(dataItem.techNo+ '-【点评】' + ".png", imgData, {base64: true});
                count++;
                index++;
            var tmpSelectedCount = selectedCount * (Number(vm.isCheckedComment) + Number(vm.isCheckedDetail))
            //console.log("complete：--编号：" + dataItem.techNo);
            currProgress[0].style.width= (count / tmpSelectedCount)*100 + "%";
            currProgressText[0].innerHTML = count+"/"+tmpSelectedCount;
            setTimeout(function(){
                if(index<vm.dataList.length * (Number(vm.isCheckedComment) + Number(vm.isCheckedDetail))){
                    addZipFile(zip,index,count,callback)
                }else{
                    callback();
                }
            },100)
        }
        else{
            if(vm.isCheckedDetail) {
                index++;
            }
            if(vm.isCheckedComment){
                index++;
            }
            if(index<vm.dataList.length * (Number(vm.isCheckedComment) + Number(vm.isCheckedDetail))){
                addZipFile(zip,index,count,callback)
            }else{
                callback();
            }
        }
    }

    function queryData(){
        $.ajax({
            url : "tech/list",
            data : {
                name : searchText.val().trim()
            },
            success : function(res){
                if(res.respData){
                    res = res.respData || [];
                    canSelectedCount = 0;
                    vm.isSelectedAll = false;
                    for(var k=0;k<res.length;k++){
                        res[k]["selected"] = false;
                        if(res[k].techNo){
                            canSelectedCount++;
                        }
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

    //预处理canvas绘图
    drawPreQrCodeImg();

    function drawPreQrCodeImg(){
        var w = 641, h = 1008;
        drawFirstCode(w,h);
        drawSecondCode(w,h);
        drawThirdCode(w,h);
        drawFourthCode(w,h);
        drawFifthCode();
    }

    function drawFirstCode(w,h){ ////绘制样式一
        var c1 = preCanavs[0].getContext("2d");

        c1.fillStyle="#fff";
        c1.fillRect(0,0,w,h);

        c1.beginPath();
        c1.fillStyle = "#eee";
        c1.moveTo(3,3);
        c1.lineTo(w-3,3);
        c1.lineTo(w-3,282);
        c1.lineTo(w-134,282);
        c1.lineTo(w/2,203);
        c1.lineTo(134,282);
        c1.lineTo(3,282);
        c1.closePath();
        c1.fill();

        c1.beginPath();
        c1.fillStyle="#e5007f";
        c1.moveTo(108,3);
        c1.lineTo(w-108,3);
        c1.lineTo(w-108,282);
        c1.lineTo(w/2,203);
        c1.lineTo(108,282);
        c1.lineTo(108,3);
        c1.closePath();
        c1.fill();

        c1.beginPath();
        c1.moveTo(36,h-209);
        c1.lineTo(165,h-209);
        c1.lineTo(165,h-123);
        c1.lineTo(36,h-123);
        c1.lineTo(59,h-166);
        c1.lineTo(36,h-209);
        c1.closePath();
        c1.fill();

        c1.beginPath();
        c1.moveTo(w-36,h-209);
        c1.lineTo(w-165,h-209);
        c1.lineTo(w-165,h-123);
        c1.lineTo(w-36,h-123);
        c1.lineTo(w-59,h-166);
        c1.lineTo(w-36,h-209);
        c1.closePath();
        c1.fill();

        c1.strokeStyle = "#fff";
        c1.lineWidth = 3;
        c1.fillRect((w-403)/2,h-186,403,90);
        c1.strokeRect((w-403)/2,h-186,403,90);

        var img1 = new Image();
        img1.src = "club-admin/img/tech/1-1.png";
        img1.onload = function(){
            c1.drawImage(img1,(w-391)/2,70);
        }

        //绘制会所名称
        c1.fillStyle = "#fff";
        c1.font = "normal 32px 微软雅黑";
        c1.textAlign = "center";
        c1.textBaseline = "middle";
        c1.fillText($$.clubName,w/2,h-141);

        c1.strokeStyle = "#c5c5c5";
        c1.lineWidth = 3;
        c1.strokeRect(0,0,w,h);
    }

    function drawSecondCode(w,h){
        var c2 = preCanavs[1].getContext("2d");
        var img1 = new Image();
        img1.src = "club-admin/img/tech/2-1.jpg";
        img1.onload = function(){
            c2.drawImage(img1,0,0);
            var img2 = new Image();
            img2.src = "club-admin/img/tech/2-2.png";
            img2.onload = function(){
                c2.drawImage(img2,(w-483)/2,108);
            };

            c2.strokeStyle = "#e40080";
            c2.lineWidth = 2;
            c2.lineCap = "round";
            c2.beginPath();
            c2.moveTo(122,262);
            c2.lineTo(w-122,262);
            c2.stroke();

            /////会所名称
            c2.fillStyle = "#5C5C5C";
            c2.font = "normal 32px 微软雅黑";
            c2.textAlign = "center";
            c2.textBaseline = "middle";
            c2.fillText($$.clubName,w/2,h-94);
        }
    }

    function drawThirdCode(w,h){
        var c3 = preCanavs[2].getContext("2d");
        var img1 = new Image();
        img1.src = "club-admin/img/tech/3-1.jpg";
        img1.onload = function() {
            c3.drawImage(img1, 0, 0);

            var img2 = new Image();
            img2.src = "club-admin/img/tech/3-2.png";
            img2.onload = function(){
                c3.drawImage(img2,(w-400)/2,108);
            }

            c3.strokeStyle = "#52bca8";
            c3.lineWidth = 3;
            c3.lineCap = "round";

            var left = 119, right = w-left, height = 398, top = 264, subWidth = 75, bottom = top+height;
            c3.beginPath();
            c3.moveTo(left,top+subWidth);
            c3.lineTo(left,top+subWidth-51);
            c3.arcTo(left,top,left+subWidth-51,top,20);
            c3.lineTo(left+subWidth,top);

            c3.moveTo(right,top+subWidth);
            c3.lineTo(right,top+subWidth-51);
            c3.arcTo(right,top,right-subWidth+51,top,20);
            c3.lineTo(right-subWidth,top);

            c3.moveTo(left,bottom-subWidth);
            c3.lineTo(left,bottom-subWidth+51);
            c3.arcTo(left,bottom,left+subWidth-51,bottom,20);
            c3.lineTo(left+subWidth,bottom);

            c3.moveTo(right,bottom-subWidth);
            c3.lineTo(right,bottom-subWidth+51);
            c3.arcTo(right,bottom,right-subWidth+51,bottom,20);
            c3.lineTo(right-subWidth,bottom);

            left = 92;
            right = w-92;
            subWidth = 40;
            top = top+height/2;

            c3.moveTo(left,top);
            c3.lineTo(left+subWidth,top);
            c3.moveTo(right,top);
            c3.lineTo(right-subWidth,top);
            c3.stroke();

            /////会所名称
            c3.fillStyle = "#6a6a6a";
            c3.font = "normal 25px 微软雅黑";
            c3.textAlign = "center";
            c3.textBaseline = "middle";
            c3.fillText($$.clubName, w / 2, h -135);
        }
    }

    function drawFourthCode(w,h){
        var c4 = preCanavs[3].getContext("2d");
        var img1 = new Image();
        img1.src = "club-admin/img/tech/4-1.jpg";
        img1.onload = function() {
            c4.drawImage(img1, 0, 0);

            var img2 = new Image();
            img2.src = "club-admin/img/tech/4-2.png";
            img2.onload = function(){
                c4.drawImage(img2,(w-407)/2,118);
            }

            /////会所名称
            c4.fillStyle = "#fdefe4";
            c4.font = "normal 25px 微软雅黑";
            c4.textAlign = "center";
            c4.textBaseline = "middle";
            c4.fillText($$.clubName, w / 2, h - 148);
        }
    }

    function drawFifthCode(){
        var c5 = preCanavs[4].getContext("2d");
        var img1 = new Image();
        var w = 948;
        img1.src = "club-admin/img/tech/5-1.png";
        img1.onload = function(){
            c5.drawImage(img1, 0, 0);
            c5.lineJoin = 'round';
            c5.lineWidth = 10;
            c5.strokeStyle = '#e6b644';
            c5.rect((w-404)/2,236,404,404);
            c5.stroke();
            c5.fillStyle = "#fff";
            c5.fillRect((w-400)/2,238,400,400);
        }
    }

    function drawCodeStyle(serialNo,qrCodeData){
        var w = currCanvas.width;
        var h = currCanvas.height;
        currCtx.clearRect(0,0,w,h);
        var copyCanvas;

        currCtx.textAlign = "center";
        currCtx.textBaseline = "middle";

        tempQrCode.html("");
        tempQrCode.qrcode({
            width:390,
            height:390,
            text:qrCodeData,
            roundBlank:false,
            correctLevel	: 0
        });

        if(vm.currCodeStyle == 1){
            copyCanvas = preCanavs[0];
            currCtx.drawImage(copyCanvas,0,0);

            ///绘制工号
            currCtx.fillStyle = "#575757";
            currCtx.font = "normal 42px 微软雅黑";
            currCtx.fillText(serialNo+"号",w/2,290);

            currCtx.drawImage(tempQrCode[0].querySelector("canvas"),(w-390)/2,350,390,390);
        }
        else if(vm.currCodeStyle == 2){
            copyCanvas = preCanavs[1];
            currCtx.drawImage(copyCanvas,0,0);

            //////绘制工号
            currCtx.fillStyle = "#fff";
            currCtx.font = "italic 42px 微软雅黑";
            var rectW = Math.floor(currCtx.measureText(serialNo).width)+36;
            currCtx.fillRect((w-rectW)/2,237,rectW+15,50);
            currCtx.fillStyle = "#e40080";
            currCtx.fillText(serialNo+"号",w/2,262);

            currCtx.drawImage(tempQrCode[0].querySelector("canvas"),(w-390)/2,353,390,390);
        }
        else if(vm.currCodeStyle == 3){
            copyCanvas =preCanavs[2];
            currCtx.drawImage(copyCanvas,0,0);
            ////绘制工号
            currCtx.fillStyle = "#52bca8";
            currCtx.font = "normal 48px 微软雅黑";
            currCtx.fillText(serialNo+"号",w/2,h-298);
            currCtx.drawImage(tempQrCode[0].querySelector("canvas"),0,0,390,390,(w-324)/2,300,324,324);
        }
        else if(vm.currCodeStyle == 4){
            copyCanvas = preCanavs[3];
            currCtx.drawImage(copyCanvas,0,0);

            ////绘制工号
            currCtx.fillStyle = "#9e272b";
            currCtx.font = "normal 48px 微软雅黑";
            currCtx.fillText(serialNo+"号",w/2,h-275);

            currCtx.drawImage(tempQrCode[0].querySelector("canvas"),(w-390)/2,280,390,390);
        }
        else if(vm.currCodeStyle == 5){
            copyCanvas = preCanavs[4];
            currCtx.drawImage(copyCanvas,0,0);

            ////绘制工号
            currCtx.fillStyle = "rgb(235,200,71)";
            currCtx.font = "bold 80px 微软雅黑";
            currCtx.fillText(serialNo,w/2,h-183);
            currCtx.drawImage(tempQrCode[0].querySelector("canvas"),0,0,390,390,(w-400)/2+12,238+12,376,376);

            //==== 绘制会所logo ===
            var logoRadius = 60;
            currCtx.save();
            currCtx.beginPath();
            currCtx.translate(224,173);
            currCtx.arc(0,0,logoRadius,0,2*Math.PI,false);
            currCtx.arc(0,0,logoRadius + 5,0,2*Math.PI,true);
            currCtx.fillStyle = '#e6b644';
            currCtx.closePath();
            currCtx.fill();
            currCtx.beginPath();
            currCtx.arc(0,0,logoRadius,0,2*Math.PI,false);
            currCtx.closePath();
            currCtx.clip();
            currCtx.drawImage(clubLogo,0,0,144,144,-logoRadius,-logoRadius,logoRadius * 2,logoRadius * 2);
            currCtx.restore();
        }
        return currCanvas.toDataURL("image/png")
    }

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
            drawTechCard(tech.name,tech.techNo,tech.avatarUrl,function(){
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