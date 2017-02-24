(function () {
    var pageSize = 20,
        agile = 0.4,
        isAddData=false,
        page= 1,
        dataAddIcon=$('#loadTip'),
        dataFinishIcon=$('#finishTip'),
        listBox=$('#content>ul.all-list'),
        nullList = $('#content>div.nullData'),
        content$=$('#content'),
        clubId = $.param("clubId") || $.$.clubID || "",
        pageHeight = 0,
        dataAddEnd = false,
        clubDataSet,
        i=0,
        itemData,
        dataSetItem,
        statusObj = { 1: "使用", 2: "已过期", 3: "用完啦~" };

    function queryData(newpage){
        if(isAddData) return;
        isAddData=true;
        page=newpage || page+1;

        //初始化提示
        dataAddIcon.ClassClear('none');
        dataFinishIcon.Class('none');
        dataAddEnd=false;

        $.ajax({
            url: "../api/v2/club/once_card/order/list",
            isReplaceUrl : true,
            data: {
                clubId: clubId,
                page : page,
                pageSize : pageSize
            },
            success: function(res){
                if(res.statusCode == 200){
                    res = res.respData || [];
                    clubDataSet = {};
                    for(i=0; i<res.length; i++){
                        itemData = res[i];
                        dataSetItem = clubDataSet[itemData.clubId];
                        if(!dataSetItem){
                            dataSetItem = clubDataSet[itemData.clubId] = [];
                        }
                        dataSetItem.push(itemData)
                    }

                    for(var obj in clubDataSet){
                        updateClubData(obj, clubDataSet[obj])
                    }

                    if(page==1){
                        if(res.length==0){
                            nullList.Show();
                            listBox.Hide();
                            dataAddEnd = true;
                        }
                        pageHeight = listBox[0].scrollHeight;
                    } else {
                        if(res.length<pageSize){
                            dataAddEnd = true;
                            dataFinishIcon.ClassClear('none');
                        }
                    }

                    isAddData=false;
                    dataAddIcon.Class('none');
                } else {
                    $.tipShow(res.msg || "查询数据失败！")
                }
            }
        })
    }

    //滚动设置
    content$.Event('scroll', function () {
        if(!dataAddEnd && content$[0].scrollTop + content$[0].clientHeight - (page + agile - 1) * pageHeight >= 0  ){
            queryData();
        }
    });

    $("#footer").Click(function(){0
        if($.$.clubID){
            $.page("discountMall")
        } else if(clubId){
            location.href = location.origin+"/spa-manager/spa2/?club="+clubId+"#discountMall";
        }
    })
    if(!$.$.clubID && !clubId){
        $("#footer").Hide()
    }

    // 跳转至次卡订单详情
    $(".all-list").Delegate('click','>li>ul.item-list>li',function(e,item){
        $.page("onceCardOrderDetail&id="+item.getAttribute("orderId"))
    })

    function updateClubData(clubId, listData){
        var wrapli = $('.all-list>li.club_'+clubId);
        if(!wrapli[0]){
            listBox[0].innerHTML += "<li class='club_"+clubId+"'>\
                                                        <div class='item-title'><div style='background-image:url("+(listData[0].clubImageUrl || $.$.defaultClubLogo)+")'></div>"+listData[0].clubName+"</div>\
                                                        <ul class='item-list'></ul>\
                                                    </li>";
            $('.all-list>li.club_'+clubId+'>div').Click(function(){
                if($.$.clubID){
                    $.page("home")
                } else {
                    location.href = location.origin+"/spa-manager/spa2/?club="+clubId;
                }
            })
        }
        wrapli = $('.all-list>li.club_'+clubId+'>ul')[0];

        var str = "", k = 0, item;
        for(;k<listData.length;k++){
            item = listData[k];
            str += "<li class='"+(item.status == 1 ? "" : "disabled")+"' orderId='"+item.id+"'>\
                            <div style='background-image: url("+(item.imageUrl || $.$.defaultService)+")'></div>\
                            <div>"+item.itemName+"</div>\
                            <div>总价：<span>"+(item.amount/100).toFixed(2)+"</span>元</div>\
                            <div>"+(item.useEndTime ? "有效期至："+item.useEndTime : "长期有效")+(item.status==1? "<span>剩余 <b>"+(item.totalCount-item.usedCount)+"</b>/"+item.totalCount+"</span>" : "")+"</div>\
                            <div>"+statusObj[item.status]+"</div>\
                        </li>"
        }
        wrapli.innerHTML += str;
    }

    queryData(1);
    $.pageSwitch();
})();