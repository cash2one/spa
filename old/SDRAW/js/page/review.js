(function () {
    var i, currPage = 1, pageSize = 20,
        filterSpan = $("#content>div#title>div:nth-of-type(3)>span"),
        filterItem = "",
        filterMenus = $("#content>div#title>div:nth-of-type(3)"),
        list = $("#content>ul"),
        loadMore = $("#content>div.loadMore"),
        loadMoreTxt = $("#content>div.loadMore>span"),
        loadMoreImg = $("#content>div.loadMore>img"),
        loadDataOver = $("#content>div.loadOver"),
        techId = $.param("id"),
        _html;

    if(!techId){
        $.pageCancel();
        return;
    }

    initPage();
    $.pageSwitch();
    $(window).Event("resize", fixedStarWidth);

    //初始化加载页面
    function initPage() {

        //查询评论数据列表
        queryListData();

        //点击加载更多
        loadMore.Click(function () {
            queryListData();
        });

        //点击右侧菜单
        filterMenus.Click(function (e, item) {
            item.className = (item.className == "active" ? "" : "active");
        });

        //点击菜单项
        $("div#content>div#title>div:nth-of-type(3)>ul>li").Click(function (e, item) {
            if (item.className == "selected") return;
            $("div#content>div#title>div:nth-of-type(3)>ul>li.selected").ClassClear();
            item.className = "selected";
            filterSpan.Text($(item).Text());
            filterItem = item.getAttribute("data-type");
            currPage = 1;
            queryListData();
        });
    }

    //查询数据列表
    function queryListData() {
        loadDataOver.CSS("display", "none");
        loadMore.CSS("display", "block");
        loadMoreTxt.Text("正在加载");
        loadMoreImg.CSS("visibility", 'visible');

        $.ajax({
            url: ($.$.clubID ? "../" : "")+'technician/comments',
            data: {
                pageSize: pageSize,
                page: currPage,
                type : filterItem,
                techId : techId
            },
            success: function (result) {
                if (result.statusCode == "200") {
                    loadMoreTxt.Text("点击加载更多");
                    loadMoreImg.CSS("visibility", 'hidden');
                    _html = "";
                    result = result.respData;
                    for (i = 0; i < result.length; i++) {
                        _html += "<li>\
                                            <div>\
                                                <div style='background-image: url("+(result[i].avatarUrl || $.$.defaultHeader)+")'></div>\
                                                <div>"+((!result[i].name || result[i].name=="null") ? "匿名用户" : result[i].name )+"</div>\
                                                <div>"+result[i].createdAt+"</div>\
                                                <div>"+result[i].commentTypeName+"</div>\
                                            </div>\
                                            <div>\
                                                <div><div style='width:"+result[i].rate+"%'></div></div>\
                                                <div style='display: "+(result[i].rewardAmount==0 ? "none" : "")+"'><i></i>打赏：<span>"+result[i].rewardAmount+"</span>元</div>\
                                            </div>\
                                            <div>"+result[i].comment+"</div>\
                                        </li>";
                    }

                    if (currPage == 1) {
                        if (result.length == 0) {//无数据
                            list.Class("nodata");
                            list.Html('<li></li>');
                        }
                        else {
                            list.ClassClear("nodata");
                            list.Html(_html);
                        }
                    }
                    else {
                        list.Html(_html, true);
                    }

                    if (result.length < pageSize) {
                        loadMore.CSS("display", "none");
                        if (currPage != 1 || (currPage == 1 && result.length > 0)) {
                            loadDataOver.CSS("display", "block");
                        }
                    }
                    else {
                        loadMore.CSS("display", "block");
                        currPage++;
                    }

                    ///////////////////////////////////////////////////////////////////
                    fixedStarWidth();
                }
                else if (result.msg) {
                    $.tipShow(result.msg || "请求列表数据失败！");
                    if (list.Html().length == 0) {
                        loadMore.CSS("display", "none");
                        list.Class("nodata");
                        list.Html('<div></div>');
                    }
                }
            },
            error: function (text) {
                //alert(text);
            }
        })
    }

    function fixedStarWidth() {
        var w = Math.floor(1.333 * $.$.scale * 16);
        $("#content>ul>li>div:nth-of-type(2)>div:nth-of-type(1)").CSS({"width": w * 5 + "px", "background-size" : w+"px 1.111rem"});
        $("#content>ul>li>div:nth-of-type(2)>div:nth-of-type(1)>div").CSS({"background-size" : w+"px 1.111rem"});
    }
})();