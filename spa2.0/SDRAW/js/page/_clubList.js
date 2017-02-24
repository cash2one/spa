(function () {
    var i;

    //搜索ICON
    var dataCache='',searchByNameFlag = false,
        searchCurrPage = 1,
        searchDataOver = false,
        searchInQuery = false;

    //查询会所数据列表
    function queryListData() {
        if(searchByNameFlag ){
            if(searchDataOver || searchInQuery) return;
        }else if(dataOver || inQuery) return;

        searchByNameFlag?(searchInQuery = true) : (inQuery = true);
        loadDataOver.CSS("display", "none");
        loadMore.CSS("display", "block");
        loadMoreTxt.Text("正在加载");
        loadMoreImg.CSS("visibility", 'visible');
        $("#content").ClassClear("over");
        var _url = '../api/v2/club/all/clubs';
        _url = searchByNameFlag ? '../api/v1/wx/visit_clubs/search':_url;
        $.ajax({
            url: _url,
            isReplaceUrl:true,
            type: 'get',
            data: {
                clubName:encodeURIComponent(encodeURIComponent($searchInput.Value())),
                pageSize: pageSize,
                page: searchByNameFlag?searchCurrPage:currPage,
                openId: $.$.openId,
                distance:distance,
                sort:sortField,
                loginName: $.$.userLoginName,
                lngx: $.$.currLngx || '',
                laty: $.$.currLaty || '',
                search: filterItem == "all" ? '' : filterItem//筛选类型
            },
            success: function (result) {
                //alert("查询会所列表result："+JSON.stringify(result));
                if (result.statusCode == "200") {
                    loadMoreTxt.Text("点击加载更多");
                    loadMoreImg.CSS("visibility", 'hidden');
                    var _html = "", distance, fliterStr = "";

                    for (i = 0; i < result.respData.length; i++) {
                        dataList.push(result.respData[i]);
                    }
                    _html = concatClubItemList(result.respData).join('');
                    var tmpCurrPage = searchByNameFlag?searchCurrPage:currPage;
                    if (tmpCurrPage == 1) {
                        if (result.respData.length == 0) {//无数据
                            list.Class("nodata");
                            searchByNameFlag?(searchDataOver = true):(dataOver = true);
                        }
                        else {
                            list.ClassClear("nodata");
                            list.Html(_html);
                        }
                    }
                    else {
                        list.Html(_html, true);
                    }

                    if (result.respData.length < pageSize) {
                        loadMore.CSS("display", "none");
                        if (tmpCurrPage != 1 || (tmpCurrPage==1 && result.respData.length>0)) {
                            loadDataOver.CSS("display", "block");
                            $("#content").Class("over");
                            searchByNameFlag?(searchDataOver = true):(dataOver = true);
                        }
                    }
                    else {
                        loadMore.CSS("display", "block");
                        if(searchByNameFlag){
                            searchCurrPage++;
                        }else{
                            currPage++;
                        }
                    }
                    $('.fourth-page .has-event').ClassClear('has-event');
                    initClubListEvent();
                }
                else if (result.msg) {
                    $.tipShow(result.msg || "请求会所列表数据失败！");
                    if(list.Html().length==0){
                        loadMore.CSS("display", "none");
                        list.Class("nodata");
                        searchByNameFlag?(searchDataOver = true):(dataOver = true);
                    }
                }
                searchByNameFlag?(searchInQuery=false):(inQuery = false);
            },
            error: function (text) {
                searchByNameFlag?(searchInQuery=false):(inQuery = false);
            }
        })
    }
})();