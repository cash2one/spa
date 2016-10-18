(function () {
    //////////////////////初始化页面
    function initPage() {
        function changeDiceGameMsgStatus(gameId){
            var k, list = eb.msgList[currChatTech.chatId].list;
            for(k=list.length-1;k>=0;k--){
                if(list[k].msgType && list[k].msgType=="diceGame" && list[k].gameId== gameId && list[k].gameStatus=="request" ){
                    list[k].gameStatus = "handled";
                    $.localStorage($.$.userID + '_MsgList_' + currChatTech.chatId, JSON.stringify(eb.msgList[currChatTech.chatId])); //存储
                    break;
                }
            }
        }

        ///点击聊天消息列表中的消息
        $(talkDiv).Event("click",function(e){
            var node = e.target, pNode=node.parentNode, ppNode=pNode.parentNode;
            if(/(paidCoupon|begReward|ordinaryCoupon|dice-game|dice-game-tip)/.test(pNode.className)) node=pNode;

            else if(/paidCoupon/.test(node.className)){
                if(!$.$.userTel){
                    $.$.loginUrl = location.hash.substring(1).replace(/^\//, '').replace(/\/$/, '');
                    $.bindPhone(true);
                }
                else $.page("paidCoupon&actId="+node.getAttribute("actId")+"&techCode="+node.getAttribute("techCode")+"&chanel=link");
            }
            else if(/begReward/.test(node.className)){
                $("#chatInput>div:nth-of-type(2)>div.reward")[0].click();
            }
            else if(/ordinaryCoupon/.test(node.className)){
                if(node.getAttribute("userActId")) $.page("couponDetail&userActId="+node.getAttribute("userActId"));
                else $.page("coupon");
            }
            else if(/dice-game-tip/.test(node.className)){///再玩一局
                doHandlerClickDiceBtn(node.getAttribute("amount"));
                return true;
            }

            if(/center/.test(pNode.className)) node=pNode;
            else if(/center/.test(ppNode.className)) node=ppNode;

            if(/center/.test(node.className)){
                $.page("coupon");//跳转到优惠券列表页
            }
            pNode =node.parentNode;
            if(/dice-game/.test(node.className) && pNode.className !="disabled"){////处理接受/拒绝/取消骰子积分游戏
                var k, list = eb.msgList[currChatTech.chatId].list, itemObj;
                for(k=list.length-1;k>=0;k--){
                    if(list[k].msgType && list[k].msgType=="diceGame" && list[k].gameId==pNode.getAttribute("gameId")){
                        itemObj = list[k];
                        break;
                    }
                }
                if(itemObj){
                    var ope = node.className.split(" ")[0];
                    if(ope == "cancel"){//取消游戏
                        //console.log("ope cancel: itemObj"+JSON.stringify(itemObj)+"---gameId："+pNode.getAttribute("gameId"));
                        doHandlerDiceGame(ope,itemObj,pNode);
                    }
                    else{
                        pNode.className = "disabled";
                        if(ope == "accept"){
                            ///////////////////查询账户积分
                            $.ajax({
                                url : "../api/v2/credit/user/account",
                                isReplaceUrl : true,
                                data : {
                                    clubId : clubId,
                                    userType : "user"
                                },
                                success : function(res){
                                    if(res.statusCode == 200) {
                                        res = res.respData;
                                        currIntegralAccount = (res && res[0] ? res[0].amount : 0);
                                        currIntegralText.Text(currIntegralAccount);
                                        if(parseInt(itemObj.data)>parseInt(currIntegralAccount)){///当前账户积分不够
                                            $("#notEnoughTip>div>div.tip").Text("玩骰子需要"+itemObj.data+"积分，当前您的积分不足。");
                                            notEnoughTip.Class("active");
                                            pNode.className = "";
                                        }
                                        else{
                                            doHandlerDiceGame(ope,itemObj,pNode.parentNode.children[0].children[0]);
                                        }
                                    }
                                    else{
                                        $.tipShow("请求异常！");
                                    }
                                }
                            });
                        }
                        else{
                            doHandlerDiceGame(ope,itemObj,pNode.parentNode.children[0].children[0]);
                        }
                    }
                }
            }
        });
    }

    ///处理点击拒绝接受游戏邀请
    function doHandlerDiceGame(ope,itemObj,txtNode){
        var preOpe = ope;
        if((+new Date())-itemObj.time>gameOverTime){//24*60*60*1000
            ope = "overtime";
            doHandlerSendGameStatus(ope,itemObj);
        }
        else{
            $.ajax({
                url : "../api/v2/credit/game/dice/accept",
                isReplaceUrl : true,
                data : {
                    gameId : itemObj.gameId.split("_")[1],
                    status : ope
                },
                success : function(res){
                    if(res.statusCode == 200){
                        res = res.respData;
                        doHandlerSendGameStatus(ope,itemObj,res);
                    }
                    else{
                        $.tipShow(res.msg || "处理游戏操作异常！");
                        if(ope == "accept"){
                            ope = "overtime";
                            txtNode.querySelector("span").innerHTML = "("+gameStatusObj[ope]+")";
                            doHandlerSendGameStatus(ope,itemObj);
                        }
                    }
                }
            });
        }
        if(ope == "cancel" || preOpe=="cancel"){
            txtNode.className = "cancel";
            txtNode.innerHTML = gameStatusObj[ope];
            var pNode = document.querySelector("#"+itemObj.gameId+"_invite");
            if(pNode){
                pNode = pNode.querySelector("div.hide");
                pNode.className = "";
                pNode.innerHTML = "<span>游戏已取消，"+pNode.innerHTML.split("，")[1];
            }
        }
        else{
            txtNode.innerHTML += "<span>("+gameStatusObj[ope]+")</span>";
        }
    }

    function doHandlerSendGameStatus(ope,itemObj,res){
        ////////////////////////////////发送接受/拒绝/取消/消息
        if(ope=="overtime"){
            itemObj.gameStatus = ope;
            $.localStorage($.$.userID + '_MsgList_' + currChatTech.chatId, JSON.stringify(eb.msgList[currChatTech.chatId])); //存储
        }
        else{
            eb.conn.send({
                to: currChatTech.chatId,
                msg: itemObj.data,
                type: "chat",
                ext: {
                    name: chatName,
                    header: chatHeader,
                    time: Date.now(),
                    avatar : $.$.userAvatar,
                    msgType : "diceGame",
                    gameInvite : itemObj.gameInvite,
                    gameStatus : ope,
                    gameId : itemObj.gameId,
                    gameResult : "0:0"
                },
                success : function(){
                    itemObj.gameStatus = ope;
                    $.localStorage($.$.userID + '_MsgList_' + currChatTech.chatId, JSON.stringify(eb.msgList[currChatTech.chatId])); //存储
                    $.sendFriend(currChatTech.chatId);
                }
            });
        }

        ////////////////////////////////////接受了对方的邀请，显示游戏结果
        if(res && res.status == "accept"){
            //console.log("接受了对方的邀请，显示游戏结果");
            var gameId = itemObj.gameId.split("_")[1],
                divItem = document.createElement("div"),
                nowTime = Date.now(),
                isVictory = (res.dstPoint > res.srcPoint);///我方的点数大于邀请方的点数
            divItem.className = "right dice-result";
            divItem.innerHTML += "<span>" + $.formatMsgTime(nowTime, true) + "</span>\
                                                                <div style='background-image: url(" + chatHeader + ")'></div>\
                                                                <div class='success'>\
                                                                    <div class='left'><div>"+currChatTech.name+"</div><div class='"+(isVictory ? "" : "act")+"'><img src='img/chat/dice/dice"+res.srcPoint+".gif'/></div></div>\
                                                                    <div class='right'><div class='"+(isVictory ? "victory" : "failure")+"'>"+chatName+"</div><div class='"+(isVictory ? "act" : "")+"'><img src='img/chat/dice/dice"+res.dstPoint+".gif'/></div><span>"+(isVictory ? "+" : "-")+res.belongingsAmount+"</span></div>\
                                                                    <div class='split'><i>vs</i></div>\
                                                                </div>\
                                                                <div><span>"+(isVictory ? "获取" : "消费")+res.belongingsAmount+"积分，<a amount='"+res.belongingsAmount+"' class='dice-game-tip'>再玩一局</a></span></div>";
            talkDiv.appendChild(divItem);
            scrollerToBottom();//滚动条移动到最下面
            setTimeout(function(){
                if(isVictory) showEffect();
                var diceImgs = divItem.querySelectorAll("img");
                diceImgs[0].src = diceImgs[0].src.slice(0,-3)+"png";
                diceImgs[1].src = diceImgs[1].src.slice(0,-3)+"png";
                divItem.classList.add("show");
            },2100);

            //保存-存储
            var msgObj = {
                from: eb.userId,
                to: currChatTech.chatId,
                data: res.belongingsAmount+"",///积分数
                ext: {
                    name: currChatTech.name,
                    header: currChatTech.header,
                    avatar: currChatTech.avatar,
                    no: currChatTech.no,
                    techId: currChatTech.techId,
                    clubId: currChatTech.clubId,
                    msgType : "diceGame",
                    gameInvite : currChatTech.chatId,//游戏发起方
                    gameStatus : "over",//游戏状态 over--已结束
                    gameId : "dice_"+gameId, //本地记录的游戏id
                    gameResult : res.srcPoint+":"+res.dstPoint//游戏结果 发出邀请者：接受邀请者
                }
            };
            //////////////////////////////发送结果到邀请方
            eb.conn.send({
                to: currChatTech.chatId,
                msg: res.belongingsAmount+"",
                type: "chat",
                ext: {
                    name: chatName,
                    header: chatHeader,
                    time: nowTime,
                    avatar : $.$.userAvatar,
                    msgType : "diceGame",
                    gameStatus : "over",
                    gameInvite : currChatTech.chatId,
                    gameId : "dice_"+gameId,
                    gameResult : res.srcPoint+":"+res.dstPoint
                },
                success : function(){
                    msgObj.status = "1";
                    $.updateSessionList(msgObj, "text", false);
                    $.addToMsgList(msgObj, "text");
                    $.sendFriend(currChatTech.chatId);
                }
            });
        }
    }
})();