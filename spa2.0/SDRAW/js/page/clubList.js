(function () {
    var i;
    var dataList = [], currPage = 1, pageSize = 20,
        distance = 0,
        sortField = 'distance',
        filterItem = "all",
        $content = $('#content'),
        $filterMenuArea = $('#filterMenu'),
        filterMenus = $("#filterMenu>div:not(:nth-of-type(4))>div"),
        clubFilterPop = $('#clubFilterPop'),
        list = $("#content div.fourth-page>div.list"),
        loadMore = $("#content div.fourth-page>div:nth-of-type(2)"),
        loadMoreTxt = $("#content div.fourth-page>div:nth-of-type(2)>span"),
        loadMoreImg = $("#content div.fourth-page>div:nth-of-type(2)>img"),
        loadDataOver = $("#content div.fourth-page>div:nth-of-type(3)"),
        dataOver = false,
        inQuery = false,
        $searchIcon = $("div#content>div:nth-of-type(1)>div:nth-of-type(1)>div:last-child"),
        $searchIcon2 = $('#filterMenu>div:nth-of-type(4)'),
        $searchBtn = $('#searchArea>div:nth-of-type(3)'),
        $searchInput = $('#searchArea input'),
        $titleDiv = $('#searchArea'),
        $returnBtn = $('#searchArea>div:nth-of-type(2)'),
        payAuthCode = $.param('code') || $.getUrlParam('code'),
        isSearched = true,
        initShowPageIndex = $.param('showPageIndex') || $.getUrlParam('showPageIndex') || 4,
        showPageIndex = $.param('showPageIndex') || $.getUrlParam('showPageIndex') || initShowPageIndex,
        $showArea =$('.show-area'),
        isOldUser = true,
        searchValue = '',
        currCity = '',      //当前所在城市
        currCityCanton = '',    //当前所在区
        currPage5 = 1,
        pageSize5 = 10,
        list5 = $("#content div.fifth-page>div.list"),
        loadMore5 = $("#content div.fifth-page>div:nth-of-type(2)"),
        loadDataOver5 = $("#content div.fifth-page>div:nth-of-type(3)"),
        dataOver5 = false,
        searchType5 = 'club',     //第五页要显示的是会所还是技师
        isReadCacheList = JSON.parse($.localStorage('9358_club_list_cache_list') || '[]') || [],
        //isReadCacheList = $.localStorage('9358_club_list_cache_list') || [],
        isReadCache = $.getUrlParam('clubListReadCache') || false,        //是否从缓存里拿数据
        clubListDataCache = null,           //已缓存的数据
        viewPath = [],
        scrollHories = [],
        fromPageIndex = 1;      //进入搜索页之前是显示哪个页

    if($.$.ua.isWX&&(!$.$.openId || $.$.openId.length < 10)){
        if(payAuthCode){
            $.ajax({
                url: ($.$.clubID ? "../" : "")+"../wx/oauth2/openid",
                data: {
                    code:payAuthCode,
                    scope:'snsapi_base',
                    sessionType: '9358',
                    openId: $.$.payOpenId || '',
                    webSessionId: $.$.paySessionId || ''
                },
                success: function (result) {
                    if (result.statusCode == 200){
                        $.$.openId =  result.respData.openid;
                        $.$.payOpenId = result.respData.openid;
                        $.$.paySessionId = result.respData.sessionId;
                        $.localStorage("openId", $.$.openId);
                        $.localStorage("payOpenId", $.$.payOpenId);
                        $.localStorage("paySessionId", $.$.paySessionId);
                        initPage();
                        $.pageSwitch();
                    }else if(result.statusCode == '40029'){
                        $.getOauthCode('','9358','9358','base');
                    }
                    else{
                        $.tipShow(result.msg || "获取openId失败！");
                        return $.pageCancel();
                    }
                }
            });
        }else{
            $.getOauthCode('','9358','9358','base');
            return;
        }
    }else{
        initPage();
        $.pageSwitch();
    }

    function initElement(){
      list = $("#content div.fourth-page>div.list");
      loadMore = $("#content div.fourth-page>div:nth-of-type(2)");
      loadMoreTxt = $("#content div.fourth-page>div:nth-of-type(2)>span");
      loadMoreImg = $("#content div.fourth-page>div:nth-of-type(2)>img");
      loadDataOver = $("#content div.fourth-page>div:nth-of-type(3)");
      $searchIcon = $("div#content>div:nth-of-type(1)>div:nth-of-type(1)>div:last-child");
      $searchBtn = $('#searchArea>div:nth-of-type(3)');
      $searchInput = $('#searchArea input');
      $titleDiv = $('#searchArea');
      $returnBtn = $('#searchArea>div:nth-of-type(2)');
      list5 = $("#content div.fifth-page>div.list");
      loadMore5 = $("#content div.fifth-page>div:nth-of-type(2)");
      loadDataOver5 = $("#content div.fifth-page>div:nth-of-type(3)");
      $showArea =$('.show-area');
      filterMenus = $("#filterMenu>div:not(:nth-of-type(4))>div");
      clubFilterPop = $('#clubFilterPop');
    }
    //地图信息
    if($.$.currLngx && $.$.currLaty){
        if(AMap && AMap.LngLat){
            initLocationInfo();
        }
        else{
            var waitCount = 0;
            var waitAMapReady = setInterval(function(){
                waitCount++;
                if(AMap && AMap.LngLat){
                    clearInterval(waitAMapReady);
                    initLocationInfo();
                }
                else if(waitCount>30){
                    clearInterval(waitAMapReady);
                    $.tipShow("高德地图初始化失败！");
                }
            },150);
        }
    }else{
        $.tipShow('请打开“9358”公众号的位置信息');
    }
    function initLocationInfo(){
        var mapObj,
            geocoder,
            lnglatXY=new AMap.LngLat($.$.currLngx,$.$.currLaty);
        //加载地理编码插件
        mapObj = new AMap.Map("mapInfo", {
            resizeEnable: false,
            view: new AMap.View2D({
                zoom:15,
                center : lnglatXY
            })
        });
        mapObj.plugin(["AMap.Geocoder"],function(){
            geocoder=new AMap.Geocoder({
                radius:1000, //以已知坐标为中心点，radius为半径，返回范围内兴趣点和道路信息
                extensions: "all"//返回地址描述以及附近兴趣点和道路信息，默认"base"
            });
            //返回地理编码结果
            AMap.event.addListener(geocoder, "complete",geocoder_callBack);
            //逆地理编码
            geocoder.getAddress(lnglatXY);
        });
    }
    function geocoder_callBack(data){
        currCity = data.regeocode.addressComponent.city || data.regeocode.addressComponent.province;
        currCityCanton = data.regeocode.addressComponent.district;
        queryClubLabels();

    }

    function showPageByIndex(index){
        showPageIndex = index;
        $showArea.Children().Class('hide').Index(index-1).ClassClear('hide');
    }

    //搜索ICON
    var dataCache='',searchByNameFlag = false,
        searchCurrPage = 1,
        searchDataOver = false,
        searchInQuery = false;

    //初始化加载页面
    function initPage() {
        //==菜单可能会不显示,使之重新显示==//
        if( $('#_publicMenu',true)[0].style.display == 'none'){
            $('#_publicMenu',true)[0].style.display = 'block';
            $('#_publicMenu>.clubList',true).Class('active');
            $('#content', true).ClassClear('noneMenu');
        }
        //=== 清除之前的缓存数据 ===
        for(var k = 0,ll = isReadCacheList.length-1;k<ll;k++){
            $.localStorageClear(isReadCacheList[k]);
        }
        isReadCacheList = isReadCacheList.slice(isReadCacheList.length-1) || [];
        if(isReadCache && ( Date.now() -  parseInt(isReadCache,36) < 30*60*1000)){            //从缓存里读数据
            clubListDataCache = $.localStorage(isReadCache);
            $.localStorageClear(isReadCache);
            try{
                clubListDataCache = JSON.parse(clubListDataCache);
                initShowPageIndex = clubListDataCache.initShowPageIndex;
                showPageIndex = clubListDataCache.showPageIndex;
                $('#content').Html(clubListDataCache.data);
                initElement();
                searchType5 = clubListDataCache.searchType5;
                $searchInput[0].value = clubListDataCache.searchText;
                setTimeout(function () {
                   $('#content')[0].scrollTop = clubListDataCache.scrollTop;
                },10);
                $('.has-event').ClassClear('has-event');    //需重新绑定事件
                initClubListEvent();
            }catch(e) {
                clubListDataCache = null;
                nextStep();
            }
        }else{
            nextStep();
        }
        function nextStep(){
            if(isOldUser){
                initShowPageIndex = showPageIndex = 4;
            }else{
                initShowPageIndex = showPageIndex = 1
            }
            showPageByIndex(showPageIndex);
            if($.param('search_text')){
                filterMenus.ClassClear('active');
                clubFilterPop.ClassClear('active');
                $content.ClassClear('no-scroll');
                $filterMenuArea.Class('hide');
                searchIconFunc();
                $searchInput[0].value = decodeURIComponent($.param('search_text'));
                //$searchBtn[0].click();
                isSearched = false;
                searchBtnClick();
            }

            if(initShowPageIndex == 1){
                //查询附近会所
                queryNearbyClub();
            }else if(initShowPageIndex == 4){
                //=== 当用户查看自己已访问过的会所时，默认查全部会所
                distance = 0;
                $('#filterMenu>div:nth-of-type(1)>span').Text('全部会所');
                var lis = $('#filterMenu>div:nth-of-type(1)>ul>li').ClassClear('selected');
                lis.Index(lis.length-1).Class('selected');

                //查询会所数据列表
                queryListData();
            }
            //=== 查询会所标签 ===
            queryTechLabels();
        }
        function searchIconFunc() {
            fromPageIndex = showPageIndex;
            $titleDiv.ClassClear('hide');
            showPageIndex = 2;
            showPageByIndex(showPageIndex);
            /*}*/
        }
        $searchIcon.Event('click', searchIconFunc);

        //返回按钮
        $returnBtn.Event('click', function () {
            if(showPageIndex == 3 || showPageIndex == 5){
                showPageIndex = 2;
            }else{
                showPageIndex = 4;
                $titleDiv.Class('hide');
                $filterMenuArea.ClassClear('hide');
            }
            /*if(fromPageIndex == 4){
                $('#showListTitle').ClassClear('hide');
            }*/
            showPageByIndex(showPageIndex);
            $searchInput[0].value = '';
        });

        //搜索
        $searchBtn.Click(function () {
            searchBtnClick();
        });
        $searchIcon2.Click(function () {
            filterMenus.ClassClear('active');
            clubFilterPop.ClassClear('active');
            $content.ClassClear('no-scroll');
            $filterMenuArea.Class('hide');
            searchIconFunc();
        });
        function searchBtnClick(){
            if($searchInput.Value().trim()){
                searchValue = $searchInput.Value().trim();
                if(showPageIndex == 2 || showPageIndex == 3){
                    $('.third-page>div:nth-of-type(3)').ClassClear('hide');
                    $('.third-page>div:nth-of-type(1),.third-page>div:nth-of-type(2)').Class('hide');
                    showPageIndex = 3;
                    showPageByIndex(showPageIndex);
                    queryClubAndTech(true);
                }else{
                    showPageIndex = 5;
                    showPageByIndex(showPageIndex);
                    queryClubOrTech(true);
                }
            }else{
                if(showPageIndex==3 || showPageIndex==4){
                    showPageIndex = 2;
                    showPageByIndex(showPageIndex);
                }
            }
        }

        //点击邀请码
        /*$("div#content>div:nth-of-type(1)>div:nth-of-type(1)>div:first-child").Click(function () {
            $.page('inviteCode&tmp_clubSource=9358');
        });*/
        //点击加载更多
        loadMore.Click(function () {
            queryListData();
        });
        loadMore5.Click(function () {
            queryClubOrTech();
        });

        //监听滑动自动加载数据
        $("#content").Event("scroll",function(e,item){
            if(item.scrollTop+ $.$.winHeight*1.4>item.scrollHeight){
                if(showPageIndex == 4 && !dataOver){
                    queryListData();
                }else if(showPageIndex == 5 && !dataOver5){
                    queryClubOrTech();
                }
            }
        });

        if($.$.isLogin != "Y"){
            loadMore.CSS("display", "none");
            list.Class("nodata");
        }

        filterMenus.Click(function (e, item) {
            var $item = $(item), isShow = $item.ClassHave( "active" ),type = item.dataset.type;
            if (isShow) {
                $item.ClassClear('active');
                clubFilterPop.ClassClear('active');
                $content.ClassClear('no-scroll');
            }
            else {
                filterMenus.ClassClear('active');
                $item.Class('active');
                switch (type){
                    case 'distance':clubFilterPop.ClassClear('show-sort').ClassClear('show-filter').Class('show-distance');break;
                    case 'sort':clubFilterPop.ClassClear('show-distance').ClassClear('show-filter').Class('show-sort');break;
                    case 'filter':clubFilterPop.ClassClear('show-sort').ClassClear('show-distance').Class('show-filter');break;
                }
                clubFilterPop.Class('active');
                $content.Class('no-scroll');
            }
        });

        //点击地理位置
        /*$("div#content div.fourth-page>div:nth-of-type(1)>div:nth-of-type(1)").Click(function(e,item){
         item.className = ( item.className == "active" ? "" : "active");
         });*/
        var popDiv = $(".pop-select-layer>div>div>div"),
          distanceTextDiv = $('#filterMenu>div:nth-of-type(1)>div'),
          sortTextDiv = $('#filterMenu>div:nth-of-type(2)>div'),
          filterTextDiv = $('#filterMenu>div:nth-of-type(3)>div');
        popDiv.Event('click',function (e, item) {
            var parentNode,siblings;
            if(item.className == 'active') return;
            parentNode = $(item.parentNode);
            siblings = parentNode.Children();
            siblings.ClassClear('active');
            $(item).Class( 'active');
            switch (parentNode[0].id){
                case 'distancePop':distanceTextDiv.Text($(item).Text());distance = item.dataset.item;break;
                case 'sortPop':sortTextDiv.Text($(item).Text());sortField = item.dataset.item;break;
                case 'filterPop':filterTextDiv.Text($(item).Text());filterItem = item.dataset.item;break;
            }
            clubFilterPop.ClassClear('active');
            $content.ClassClear('no-scroll');
            filterMenus.ClassClear('active');
            list.ClassClear('nodata');
            currPage = 1;
            dataOver = false;
            queryListData();
        });

        $('div.first-page>div:first-child,div.first-page>div:nth-of-type(4)').Click(function () {
            list.ClassClear('nodata');
            currPage = 1;
            dataOver = false;
            queryListData();
            showPageIndex = 4;
            showPageByIndex(showPageIndex);
            $('#showListTitle').ClassClear('hide');
        });
        $('#showListTitle a').Click(function () {
            $('#showListTitle').Class('hide');
            showPageIndex = initShowPageIndex;
            showPageByIndex(showPageIndex);
        });

        //====  标签绑定事件  ===
        $('.second-page>div>div:last-child').Delegate('click','>div>div',function (e, item) {
            $searchInput[0].value = $(item).Text();
            searchBtnClick();
        });

        //==== club-item 相关事件  ====
        /*$('.show-area').Delegate('click','div.club-item>div>div:first-child,div.tech-item>div:first-child', function (e, item) {     //点击会所栏
         jumpToSpaPage(item.dataset.clubId,'home');
         }).Delegate('click','div.club-item>div>div:nth-of-type(2)>div:first-child>i,div.tech-item>div:nth-of-type(2)>div', function (e, item) {       //点击技师头像
         jumpToSpaPage(item.dataset.clubId,'technicianDetail&id='+item.dataset.techId);
         }).Delegate('click','div.club-item>div>div:nth-of-type(2)>div:last-child', function (e, item) {          //点击优惠券
         jumpToSpaPage(item.dataset.clubId,'promotions');
         });*/

        //=== 查看更多会所或技师
        $('.third-page>div:nth-of-type(1)>div:last-child').Click(function () {
            searchType5 = 'club';
            queryClubOrTech(true);
            showPageIndex = 5;
            showPageByIndex(showPageIndex);
        });
        $('.third-page>div:nth-of-type(2)>div:last-child').Click(function () {
            searchType5 = 'tech';
            queryClubOrTech(true);
            showPageIndex = 5;
            showPageByIndex(showPageIndex);
        });

        $('#content').Delegate('click','.tech-item>div:nth-of-type(2)>div',function (e, item) {
            e.stopPropagation();
            e.stopImmediatePropagation();
            jumpToSpaPage(item.dataset.clubId,'technicianDetail&id='+item.dataset.techId);
        }).Delegate('click','.tech-item>div:nth-of-type(1)', function (e, item) {
            e.stopPropagation();
            e.stopImmediatePropagation();
            jumpToSpaPage(item.dataset.clubId);
        });

        //// ======= 取消正在执行的动画 =======
        $('#content').Event('touchstart', function (e) {
            scrollHories.forEach(function (sh) {
                sh.stopAnimation();
            });
        });
    }

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
        _url = searchByNameFlag?'../api/v1/wx/visit_clubs/search':_url;
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

    //查询附近10家会所
    function queryNearbyClub(){
        $.ajax({
            url:'../api/v2/club/near/clubs',
            isReplaceUrl:true,
            data:{
                lngx:$.$.currLngx || '',
                laty:$.$.currLaty || '',
            },
            success: function (result) {
                if(result.statusCode == 200){
                    result = result.respData || [];
                    var _html = concatClubItemList(result);
                    if(_html.length == 0){
                        $('#firstClubList').Class('nodata');
                        $('.first-page>div:nth-of-type(4)').Class('hide');
                    }else{
                        $('#firstClubList').Html(_html.join(''));
                        $('.first-page>div:nth-of-type(4)').ClassClear('hide');
                    }
                    initClubListEvent();
                }else{
                    $.tipShow(result.msg || '查询附近会所失败');
                }
                $('.first-page>div:nth-of-type(1),.first-page>div:nth-of-type(2)').ClassClear('hide');
                $('.first-page>div:nth-of-type(3)').Class('hide');
            }
        });

    }
    function initClubListEvent(){
        $('#content>div.show-area .club-item-list.has-techs>div:last-child>div').Each(function (item) {
            var sch = scrollHori({
                container:item,
                showEleCount:4
            });
            if(sch)
                scrollHories.push(sch);
        });
        $('.club-item-list>div:first-child>div:nth-of-type(3):not(.has-event)').Click(function (e, item) {
            e.stopPropagation();
            jumpToSpaPage(item.dataset.clubId,'activities');
        }).Class('has-event');
        $('.club-item-list>div:first-child:not(.has-event)').Click(function (e, item) {
            e.stopPropagation();
            jumpToSpaPage(item.dataset.clubId);
        }).Class('has-event');
        $('.club-item-list>div:last-child>div>div:not(.has-event)').Click(function (e, item) {
            e.stopPropagation();
            jumpToSpaPage(item.dataset.clubId,'technicianDetail&id='+item.dataset.techId);
        }).Class('has-event');

    }
    //查询技师标签
    function queryTechLabels(){
        $.ajax({
            url: '../api/v2/club/impression/list',
            isReplaceUrl:true,
            data: {},
            success: function (response) {
                if(response.statusCode != 200){
                    $.tipShow(response.msg || '查询印象标签数据出错');
                }
                var _tags = [];
                response.respData.forEach(function (v) {
                    _tags.push('<div>'+ v.tag +'</div>');
                });
                $('.second-page>div:nth-of-type(2)>div:last-child>div').Html(_tags.join(''));

            }
        });
    }
    //查询会所标签
    function queryClubLabels(){
        $.ajax({
            url:'../api/v2/club/tags',
            isReplaceUrl:true,
            type:'post',
            data:{
                city:encodeURIComponent(currCity || ''),
                region:encodeURIComponent(currCityCanton || ''),
                laty: $.$.currLaty || 0,
                lngx: $.$.currLngx || 0
            },
            success: function (response) {
                if(response.statusCode == 200){
                    if(response.respData && Array.isArray(response.respData)){
                        $('.second-page>div:nth-of-type(1)>div:last-child>div').Html('<div>'+response.respData.join('</div><div>')+'</div>');
                    }
                }else{
                    $.tipShow(response.msg || '查询会所标签数据出错');
                }
            }
        });
    }

    //===
    function queryClubAndTech(){
        $('.third-page').ClassClear('nodata');
        $.ajax({
            url:'../api/v2/club/club_tech_search',
            isReplaceUrl:true,
            type:'post',
            data:{
                laty: $.$.currLaty || '',
                lngx: $.$.currLngx || '',
                page:1,
                pageSize:3,
                search:encodeURIComponent(searchValue),
                searchType:''
            },
            success: function (result) {
                if(result.statusCode == 200){
                    result = result.respData;
                    var _clubs = [],_techs = [];
                    _clubs = concatClubItemList(result.clubs || []);
                    _techs = concatTechItem(result.techs || []);
                    if(_techs.length == 0 && _clubs.length == 0){
                        $('.third-page').Class('nodata');
                    }else{
                        if(_clubs.length > 0){
                            $('.third-page>div:nth-of-type(1)').ClassClear('hide');
                            $('.third-page>div:nth-of-type(1)>div:nth-of-type(2)').Html(_clubs.join(''));
                            initClubListEvent();
                        }
                        if(_techs.length > 0){
                            $('.third-page>div:nth-of-type(2)').ClassClear('hide');
                            $('.third-page>div:nth-of-type(2)>div:nth-of-type(2)').Html(_techs.join(''));
                        }
                    }

                }else{
                    $('.third-page').Class('nodata')
                    $.tipShow(result.msg || '');
                }
                $('.third-page>div:nth-of-type(3)').Class('hide');
            }
        });
    }

    //===
    function queryClubOrTech(init){
        if(init){
            currPage5 = 0;
            dataOver5 = false;
            list5.Html('');
        }
        currPage5++;
        loadMore5.ClassClear('hide');
        loadDataOver5.Class('hide');
        $.ajax({
            url:'../api/v2/club/club_tech_search',
            isReplaceUrl:true,
            type:'post',
            data:{
                laty: $.$.currLaty || '',
                lngx: $.$.currLngx || '',
                page:currPage5,
                pageSize:pageSize5,
                search:encodeURIComponent(searchValue),
                searchType:searchType5
            },
            success: function (result) {
                if(result.statusCode == 200){
                    result = result.respData;
                    var _html = [],_length = 0;
                    $('.fifth-page .has-event').ClassClear('has-event');
                    if(searchType5 == 'club'){
                        result.clubs || (result.clubs=[]);
                        _length = result.clubs.length
                        _html = concatClubItemList(result.clubs);
                    }else{
                        result.techs || (result.techs=[]);
                        _length = result.techs.length;
                        _html = concatTechItem(result.techs || []);
                    }

                    if(_html.length == 0){
                        if(currPage5 == 1){
                            $('.fifth-page').Class('nodata');
                            loadDataOver5.Class('hide');
                        }else{
                            dataOver5 = true;
                            loadDataOver5.ClassClear('hide');
                        }
                    }else{
                        $('.fifth-page').ClassClear('nodata');
                        list5.Html(_html.join(''),true);
                        if(_length<pageSize5){
                            dataOver5 = true;
                            loadDataOver5.ClassClear('hide');
                        }
                        initClubListEvent();
                    }
                }else{
                    $('.fifth-page').Class('nodata')
                    $.tipShow(result.msg || '');
                }
                loadMore5.Class('hide');
            }
        });
    }
    //==== 拼装会所item ===
    function concatClubItem(data){
        var _clubs = [];
        data.forEach(function (c) {
            _clubs.push('<div class="club-item">\
                            <div>\
                                <div data-club-id="'+ c.id +'">\
                                    <i style="background-image: url('+(c.imageUrl || $.$.defaultClubLogo)+')"></i>\
                                    <div>\
                                        <span>'+ c.name.replace(new RegExp(searchValue,'g'),'<span class="key-words">'+searchValue+'</span>') +'</span>\
                                        <span>'+formatDistance(c.distance)+'</span>\
                                    </div>\
                                    <div>'+ c.address +'</div>\
                                </div>\
                                <div '+(c.techCount>0||c.couponCount?'':'class="hide"')+'>\
                                    <div '+(c.techCount>0?'':'class="hide"')+'>\
                                        <span>技</span>\
                                        '+ function (techs) {
                                              var _tmpH = [];
                                              techs.forEach(function (techObj) {
                                                  _tmpH.push('<i style="background-image: url('+(techObj.avatarUrl || $.$.defaultHeader)+')" data-club-id="'+c["id"]+'" data-tech-id="'+techObj.id+'"></i>');
                                              });
                                              return _tmpH.join('');
                                          }(c["techs"])+'</div>\
                                    <div '+(c.couponCount>0?'':'class="hide"')+' data-club-id="'+ c.id +'">\
                                        <span>惠</span>\
                                        <span>'+ c.couponCount +' 张优惠券</span>\
                                    </div>\
                                </div>\
                            </div>\
                        </div>');
        });
        return _clubs;
    }
    //=== 拼装会所item，技师头像为大图 ===
    function concatClubItemList(data){
        var _html = [],distance;
        data.forEach(function (clubObj, i) {
            if (clubObj["distance"] && Number.MAX_VALUE!=clubObj["distance"] ) {
                distance = formatDistance(clubObj["distance"]);
            }
            else {
                distance = "- m";
            }
            clubObj["distance"] = distance;

            if (!clubObj["imageUrl"] || clubObj["imageUrl"].length == 0) {
                clubObj["imageUrl"] = "img/logo_default.jpg";
            }
            _html.push('<div class="club-item-list '+(clubObj.techs&&clubObj.techs.length>0?'has-techs':'no-techs')+'">\
                                        <div data-club-id="'+clubObj.id+'">\
                                            <div style="background-image: url('+(clubObj.imageUrl || $.$.defaultClubLogo)+')"></div>\
                                            <div>'+clubObj.name+'</div>\
                                            <div '+(clubObj.couponCount>0?'':'class="hide"' )+' data-club-id="'+clubObj.id+'">优惠</div>\
                                            <div>'+distance+'</span></div>\
                                        </div><div>\
                                        '+(clubObj.techs&&clubObj.techs.length>0?('\
                                            <div>\
                                            '+function(techs){
                                                var _techHtml = [];
                                                techs.forEach(function (techObj) {
                                                    _techHtml.push('<div data-club-id="'+clubObj.id+'" data-tech-id="'+techObj.id+'">\
                                                                        <div style="background-image: url('+(techObj.avatarUrl || $.$.defaultHeader)+')"></div>\
                                                                        <div><div>'+techObj.name+'</div><div>'+(techObj.visitCount?(techObj.visitCount >= 1000 ?((techObj.visitCount/1000).toFixed(1) + 'K'):techObj.visitCount):0)+'</div>\
                                                                        </div>\
                                                                    </div>');
                                                });
                                                return _techHtml.join('');
                                            }(clubObj.techs)
                                            +'</div>'):'')
                                        +'\
                                    </div></div>');
        });

        return _html;
    }
    //==== 拼装技师item ===
    function concatTechItem(data){
        var _techs = [];
        data.forEach(function (t) {
            _techs.push('<div class="tech-item">\
                                        <div data-club-id="'+ t.id +'"><div><div style="background-image:url('+( t.imageUrl || $.$.defaultClubLogo )+')"></div></div>\
                                            <div>\
                                                <div>'+ t.name.replace(new RegExp(searchValue,'g'),'<span class="key-words">'+searchValue+'</span>') +'</div>\
                                            </div>\
                                            <div>'+formatDistance(t.distance)+'</div>\
                                        </div>\
                                        <div>'+function(ts){
                                                  var _tmp = [];
                                                  ts.forEach(function (tech) {
                                                      _tmp.push('<div data-club-id="'+tech.clubId+'" data-tech-id="'+tech.techId+'">\
                                                                                                <div><div style="background-image: url('+(tech.avatarUrl || $.$.defaultHeader)+')"></div></div>\
                                                                                                <div>\
                                                                                                    <div><div>'+(tech.name || $.$.defaultTechName).replace(new RegExp(searchValue,'g'),'<span class="key-words">'+searchValue+'</span>')+'</div><div><span>\
                                                                                                            <span><span style="width:'+tech.star+'%"></span></span>'+tech.commentCount+' 评论</span>\
                                                                                                    </div></div>\
                                                                                                    <div><span>'+tech.tag.replace(new RegExp(searchValue,'g'),'<span class="key-words">'+searchValue+'</span>').replace(/,/g,'，</span><span>')+'</span></div>\
                                                                                                </div>\
                                                                                            </div>');
                                                  })
                                                  return _tmp.join('');
                                              }(t.techImpression)+'\
                                        </div>\
                                    </div>');
        });
        return _techs;
    }

    function formatDistance(d) {
        d = parseFloat(d, 10)*1000;
        if(isNaN(d) || d == 1000000*1000){
            return '- m';
        }
        if (d > 1000) {
            return (d / 1000.0).toFixed(1) + "km";
        }
        return (d).toFixed(0) + " m";
    }

    function saveCache(){
        isReadCache = Date.now().toString(36);
        dataCache = {
            initShowPageIndex:initShowPageIndex,
            showPageIndex:showPageIndex,
            scrollTop:$('#content')[0].scrollTop,
            searchType5:searchType5,
            searchText:$searchInput.Value(),
            data:$('#content').Html()
        }
        isReadCacheList.push(isReadCache);
        $.localStorage('9358_club_list_cache_list',JSON.stringify(isReadCacheList));
        $.localStorage(isReadCache,JSON.stringify(dataCache));
        $.paramClear('clubListReadCache');
        $.param('clubListReadCache',isReadCache);
        return isReadCache
    }

    var baseUrl = location.origin+location.pathname+ "?club=";
    function jumpToSpaPage(id,url) {
        url = url || 'home';
        location.href = baseUrl + id + "#"+url+($.$.visitChannel == '9358'?'&clubsource=9358':'')+'&clubListReadCache='+saveCache();
    }
})();
