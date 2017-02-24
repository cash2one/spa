(function () {
    var clubId = $.$.clubID || $.param("clubId") || "",
        $tip = $(".result-list>div.tip"),
        $moreTip = $(".result-list>div.more-tip"),
        $list = $(".result-list>ul:nth-of-type(1)"),
        $otherList = $(".result-list>ul:nth-of-type(2)"),
        $searchInput = $(".search-wrap>input"),
        $popSelector = $("#service-item-selector"),
        $noResult = $(".nullData"),
        hasPopSelector = false, // 选项目窗口是否弹出
        $allServiceItem,
        k,
        newId = "", // 最新的
        bestId = "", // 最优惠的
        tagObj = {},
        allCards = [];

    if(!clubId) {
        $.tipShow("页面访问缺少参数！");
        return $.pageCancel();
    }

    // 点击进入次卡详情
    $list.Delegate("click",">li",function(e,item){
        $.page("onceCardDetail&id="+item.getAttribute("cardId"))
    })
    $otherList.Delegate("click",">li",function(e,item){
        $.page("onceCardDetail&id="+item.getAttribute("cardId"))
    })

    // 点击选项目，弹出窗口
    $(".search-wrap>div").Click(function(){
        if(!hasPopSelector) {
            $popSelector.Class("active")
            hasPopSelector = true
        } else {
            $popSelector.ClassClear("active")
            hasPopSelector = false
        }
    })

    // 弹窗 点击取消按钮
    $(".btn-wrap>div:nth-of-type(1)").Click(function(){
        $popSelector.ClassClear("active")
        hasPopSelector = false
    })

    // 弹窗 点击确定按钮
    $(".btn-wrap>div:nth-of-type(2)").Click(function(){
        var selectedItem = $("#service-item-selector li.active")[0];
        if(selectedItem){
            query();
        }
        $popSelector.ClassClear("active");
        hasPopSelector = false;
    })

    // 点击搜索按钮
    $(".search-icon").Click(function(){
        query()
    })

    $searchInput.Event("keypress",function(e){
        if(e.keyCode==13){
            query()
        }
    })

    $("#footer").Click(function(){
        $.page("serviceList")
    })

     function query(){
         var selectedItem = $("#service-item-selector li.active")[0],
             itemId = "",
             selectedItemName = "",
             itemName = $searchInput[0].value;
         if(selectedItem){
             itemId = selectedItem.getAttribute("itemId") || "";
             selectedItemName = selectedItem.innerHTML;
         }

         $.ajax({
             url: "../api/v2/club/item_card/activity/list",
             type: "post",
             data: {
                 clubId: clubId,
                 itemId: itemId,
                 itemName: itemName
             },
             isReplaceUrl : true,
             success: function(res){
                 if(res.statusCode == 200){
                     res = res.respData;
                     var list = res.activityList || [], htmlStr = "", listItem, i = 0, plan;
                     if(itemId == "" && itemName == ""){
                         allCards = list; // 此时查询的结果是所有的次卡
                         if(list.length>0){
                             newId = list[0].id;
                             bestId = res.optimalActivity.id;
                             tagObj[bestId] = 'best'
                             tagObj[newId] = 'new'
                         }
                     }
                     for(k=0; k<list.length; k++){
                         listItem = list[k];
                         for(i=0;i<listItem.itemCardPlans.length;i++){
                             plan = listItem.itemCardPlans[i];
                             if(plan.optimal == "Y"){
                                 htmlStr += generateItem(listItem,plan);
                                 break;
                             }
                         }
                     }
                     $list[0].innerHTML = htmlStr;

                     if($searchInput[0].value || (selectedItemName && selectedItemName!='全部项目')){
                         if(list.length>0){
                             $tip[0].innerHTML = "以下是包含“<span>"+($searchInput[0].value || selectedItemName)+"”</span>项目的优惠";
                         } else {
                             $tip[0].innerHTML = "没有“<span>"+($searchInput[0].value || selectedItemName)+"</span>”相关的次卡，看看其它吧~"
                         }
                         $tip.Show()
                     } else {
                         $tip.Hide()
                     }

                     if(allCards.length>0){
                         $noResult.Hide();
                         $(".result-list").Show()
                     } else {
                         $noResult.Show();
                         $(".result-list").Hide()
                     }

                     if(itemId == "" && itemName == ""){
                         $moreTip.Hide();
                         $otherList.Hide();
                     } else { // 需要显示更多 其他的次卡
                         var otherList = [];
                         for(k=0;k<allCards.length;k++){
                             if(!inResultList(allCards[k].id, list)){
                                 otherList.push(allCards[k])
                             }
                         }
                         if(otherList.length == 0){
                             $moreTip.Text("没有更多了~");
                             $moreTip.Show();
                             $otherList.Hide();
                         } else {
                             htmlStr = "";
                             for(k=0; k<otherList.length; k++){
                                 listItem = otherList[k];
                                 for(i=0;i<listItem.itemCardPlans.length;i++){
                                     plan = listItem.itemCardPlans[i];
                                     if(plan.optimal == "Y"){
                                         htmlStr += generateItem(listItem,plan);
                                         break;
                                     }
                                 }
                             }
                             $otherList[0].innerHTML = htmlStr;

                             $moreTip.Text("更多");
                             $moreTip.Show();
                             $otherList.Show();
                         }
                     }
                 }
             }
         })
     }

     function generateItem(listItem,plan){
         var price = plan.actAmount/100/(plan.giveCount+plan.paidCount);
         if(price>1.001){
             price = Math.round(price)
         } else {
             if(price<0.01){
                 price = 0.01;
             }
             price = price.toFixed(2)
         }
         var progress = 0
         if (listItem.totalCount != 0 && listItem.paidCount > listItem.totalCount * 0.49) {
             progress = (listItem.paidCount / listItem.totalCount) * 100
         }
         return "<li cardId='"+listItem.id+"' class='"+(listItem.statusName=="已售完" ? "sellOut" : (listItem.statusName=="已过期" ? "expired" : ""))+"'>\
                           <div style='background-image: url("+(listItem.imageUrl || $.$.defaultService)+")'><div>"+listItem.name+"</div></div>\
                           <div><b>"+price+"</b>元/次<span>买"+plan.paidCount+"送"+plan.giveCount+"</span></div>\
                           <div>"+Math.round(plan.itemAmount/100)+"元/次"+( progress ? "<div>"+progress+"%<div style='left:"+progress+"%'></div></div>" : "")+"</div>"+(tagObj[listItem.id] ? "<div class='"+tagObj[listItem.id]+"'>"+(tagObj[listItem.id]=='new' ? '最新' : '最优惠')+"</div>" : "")+"\
                     </li>";
     }

     function inResultList(cardId, resList){
         for(var i=0; i<resList.length; i++){
             if(resList[i].id == cardId) {
                 return true;
             }
         }
         return false;
     }

    query();

    // 获取服务项目
    $.ajax({
        url : "../api/v2/club/category/service/list",
        data: { clubId: clubId },
        isReplaceUrl : true,
        success: function(res){
            if(res.statusCode == 200){
                res = res.respData;
                var i = 0, itemStr = "<ul><li class='active' itemId=''>全部项目</li></ul>", item;
                for(k=0; k<res.length; k++){
                    itemStr += "<div class='service-list'>\
                                            <div>"+res[k].name+"</div>\
                                            <ul>";
                    for(i=0;i<res[k].serviceItems.length;i++){
                        item = res[k].serviceItems[i];
                        itemStr += "<li itemId='"+item.id+"'>"+item.name+"</li>";
                    }
                    itemStr += "</ul></div>";
                }
                $("#service-item-selector>div.pop-content")[0].innerHTML = itemStr;
            }
            $allServiceItem = $("#service-item-selector ul>li");

            $allServiceItem.Click(function(e,item){
                if(!item.classList.contains("disabled")){
                    $allServiceItem.ClassClear("active");
                    item.classList.add("active");
                }
            })
            $.pageSwitch();
        }
    })
})();