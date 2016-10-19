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
})();