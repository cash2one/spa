(function () {
    /*************************************定义常用变量*************************************/
    var str = '',
        listID = JSON.parse($.sessionStorage('coupon_ID') || '{}'),
        i,
        groups,
        clubData,
        dataLength,
        isAddData = false,
        prevCouponType,
        page = 1,
        dataAddIcon = $('#loadTip'),
        dataFinishIcon = $('#finishTip'),
        dataAddEnd = ($.sessionStorage('coupon_end') || 'false') == 'true',
        listBox = $('#content>div>div:nth-of-type(2)>div'),
        singleListBox,
        content$ = $('#content'),
        contentYTop = $.sessionStorage('coupon_top'),
        contentPage = $.sessionStorage('coupon_page'),
        contentData = $.sessionStorage('coupon_data'),
        pageHeight = $.sessionStorage('page_height') || 0,          //一页内容的高度
        pageSize = 10,
        agile = 0.4;     //自裁加载下页的灵敏度  值越小越灵敏（0.4表示当前面有40%的内容在可视区域时就加载下一页的数据）

    if ($.$.visitChannel != "9358") {
        listBox.Html("<div></div>");
        singleListBox = $('#content>div>div:nth-of-type(2)>div>div');
    }
    else if($.param("backPublic")=="true"){
        $("#title>div:nth-of-type(2)").Click(function(event){
            event.stopImmediatePropagation();
            history.back();
        });
    }

    var loginTel = $.getUrlParams('loginTel')[0];
    if(loginTel && loginTel != $.$.userTel){
        $.$.loginUrl = 'coupon';
        $.$.userToken = null;
        $.page('login');
        return;
    }

    /*************************************加载数据*************************************/
    /*************************************定义逻辑*************************************/
    //加载页面数据
    function addData(newpage, callback) {
        if (isAddData) return;
        isAddData = true;
        page = newpage || page + 1;

        //初始化提示
        dataAddIcon.ClassClear('none');
        dataFinishIcon.Class('none');
        dataAddEnd = false;

        //开始加载数据
        $.ajax({
            url: "../api/v2/club/user_get_coupons",
            isReplaceUrl: true,
            data: {
                loginName: $.$.userLoginName,
                clubId: $.$.clubID,
                page: page,
                pageSize: pageSize
            },
            success: function (data) {
                if (data.statusCode != "200") {
                    return $.tipShow(data.msg || "数据请求失败！")
                }
                if ($.$.visitChannel != "9358") {//单个会所的优惠券列表处理
                    data = data['respData'];
                    str = "";
                    for (i = 0, dataLength = data.length; i < dataLength; i++) {
                        //if(listID[data[i]['actId']]) continue;
                        //else listID[data[i]['actId']]=1;
                        if(prevCouponType != data[i]["clubId"]+'-'+data[i].useType){
                            str +='<div class="coupon-type">'+data[i].useTypeName+'</div>';
                            prevCouponType = data[i]["clubId"]+'-'+data[i].useType;
                        }
                        str += generateItemHtml(data[i]);
                    }

                    if (page == 1) {
                        singleListBox.Html(str);
                        if (str) {
                            singleListBox.ClassClear('nullData');
                        } else {
                            singleListBox.Class('nullData');
                            dataAddEnd = true;
                        }
                        pageHeight = listBox[0].scrollHeight;
                    } else {
                        singleListBox.Html(str, true);
                        if (dataLength < pageSize) {
                            dataAddEnd = true;
                            dataFinishIcon.ClassClear('none');
                        }
                    }
                }
                else {//多个会所的优惠券列表处理
                    groups = {};
                    for (i = 0; i < data.respData.length; i++) {
                        //if(listID[data.respData[i]["actId"]]) continue;
                        //else listID[data.respData[i]["actId"]]=1;

                        if (!groups[data.respData[i]["clubId"]]) {
                            groups[data.respData[i]["clubId"]] = {
                                clubName: data.respData[i]["clubName"],
                                clubId: data.respData[i]["clubId"],
                                list: []
                            };
                        }
                        groups[data.respData[i]["clubId"]]["list"].push(data.respData[i]);
                    }

                    str = "";
                    var item, addItem, count = 0, addTag, addStr = "";
                    for (item in groups) {
                        addTag = false;
                        if (page > 1 && count == 0) {
                            addItem = $("#content>div>div:nth-of-type(2)>div>div:last-child");
                            if (addItem.Attr("hh") == groups[item]["clubId"]) {
                                clubData = groups[item]["list"];
                                for (i = 0; i < clubData.length; i++) {
                                    addStr += generateItemHtml(clubData[i]);
                                }
                                addItem.Html(addStr, true);
                                addTag = true;
                            }
                        }

                        if (!addTag) {
                            str += "<div hh='" + groups[item]["clubId"] + "'><div class='header'>" + groups[item]["clubName"] + "</div>";
                            clubData = groups[item]["list"];
                            for (i = 0; i < clubData.length; i++) {
                                if(prevCouponType != groups[item]["clubId"]+'-'+clubData[i].useType){
                                    str +='<div class="coupon-type">'+clubData[i].useTypeName+'</div>';
                                    prevCouponType = groups[item]["clubId"]+'-'+clubData[i].useType;
                                }
                                str += generateItemHtml(clubData[i]);
                            }
                            str += "</div>";
                        }
                        count++;
                    }

                    if (page == 1) {
                        listBox.Html(str);
                        if (str) {
                            listBox.ClassClear('nullData');
                        } else {
                            listBox.Class('nullData');
                            dataAddEnd = true;
                        }
                        pageHeight = listBox[0].scrollHeight;
                    } else {
                        listBox.Html(str, true);
                        if (data.respData.length < pageSize) {
                            dataAddEnd = true;
                            dataFinishIcon.ClassClear('none');
                        }
                    }
                }

                //事件修正
                setListClick();
                isAddData = false;
                dataAddIcon.Class('none');
                if (callback) callback();
            }
        });
    }

    function generateItemHtml(itemData) {
        var isExpire = (itemData["couponStatusDescription"] == "已过期" || itemData["couponStatusDescription"] == "已使用" ),
          isPaidServiceItem = itemData['couponType'] == 'paid_service_item';
        //itemData["useType"] = (itemData["useType"] || "money");
        if (itemData["useType"] == "money" && itemData["consumeMoney"] == 0) {
            itemData["consumeMoneyDescription"] = "&nbsp;";
        }
        var htmlStr = "<div type='" + itemData["couponType"] + "' hh='" + itemData["userActId"] + "' class='item " + (isExpire ? "expire" : "") + "'>\
                        <i></i>\
                        <div>" + (/*itemData["useType"] == "money" ? itemData["actValue"] + "元" :*/ itemData["actTitle"] + (isPaidServiceItem?'券':'')) + "</div>\
                        <div>" + (itemData.useType == 'money'?(itemData.actValue+'元现金券，'):'') + itemData["consumeMoneyDescription"] + "</div>\
                        <div>券有效期：" + (isPaidServiceItem?(itemData["couponPeriod"].replace(/ \d{2}:\d{2}/g,'')):itemData["couponPeriod"]) + "</div>\
                        <div>" + itemData["useTypeName"] + "</div>";
        if (isExpire) {
            htmlStr += "<span>" + itemData["couponStatusDescription"] + "</span>";
        }
        else if (itemData["couponType"] == "paid") {
            htmlStr += "<span class='" + (itemData["couponStatus"] == 0 ? "unpay" : (itemData["couponStatus"] == 1 ? "payed" : "expire")) + "'>" + itemData["couponStatusDescription"] + "</span>";
        }
        htmlStr += "<div style='display:" + (itemData["couponType"] == "redpack" ? "block" : "none") + "'>分享获得更多优惠机会</div>";
        if(isPaidServiceItem && !isExpire){
            var endDate = new Date(itemData.useEndDate.split(' ')[0].replace(/-/g,'/') + " 23:59:59").getTime() - new Date().getTime();
            if(Math.floor(endDate/86400000)>0){
                endDate = '<span>'+ Math.floor(endDate/86400000) + '</span> 天';
            }else if(Math.floor(endDate/3600000)>0){
                endDate = '<span>'+ Math.floor(endDate/3600000) + '</span> 小时';
            }else{
                endDate = '<span>'+ Math.floor(endDate/60000) + '</span> 分';
            }
            htmlStr += '<div>剩余 '+endDate+'</div>';
        }
        htmlStr += '</div>';
        return htmlStr;
    }

    function setListClick() {
        $('div#coupon #content>div>div:nth-of-type(2)>div>div>div.item', true).Event('click', function (e, item) {
            $.sessionStorage('coupon_data', listBox.Html());
            $.sessionStorage('coupon_page', page);
            $.sessionStorage('coupon_page_height',pageHeight);
            $.sessionStorage('coupon_end', dataAddEnd);
            $.sessionStorage('coupon_ID', JSON.stringify(listID));
            $.sessionStorage('coupon_top', content$[0].scrollTop);
            if (item.getAttribute("type") == "paid") {
                $.page("paidCouponDetail&userActId=" + item.getAttribute("hh"));
            }
            else $.page("couponDetail&userActId=" + item.getAttribute("hh")+'&couponType='+item.getAttribute('type'));
        }, true);
    }
    //滚动设置
    content$.Event('scroll', function (e) {
        if(!dataAddEnd && content$[0].scrollTop + content$[0].clientHeight - (page + agile - 1) * pageHeight >= 0  ){
            addData();
        }
    });

    //缓存加载
    if (contentData) {
        page = parseInt(contentPage);
        listBox.Html(contentData);
        //contentY$.Translate(0, contentYTop + 'px');
        setTimeout(function () {
            content$[0].scrollTop =  contentYTop;
        },1);
        setListClick();
        if (dataAddEnd)
            dataFinishIcon.ClassClear('none');
        $.pageSwitch();
    } else
        addData(1,function(){
            $.pageSwitch();
        });
        //addData(1, $.pageSwitch());
    $.sessionStorageClear('coupon_ID');
    $.sessionStorageClear('coupon_data');
    $.sessionStorageClear('coupon_end');
    $.sessionStorageClear('coupon_top');
    $.sessionStorageClear('coupon_page');
    $.sessionStorageClear('coupon_page_height');       //一页内容的高度
})();