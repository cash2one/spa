(function (win) {
    function getLocation(successFunc,failedFunc){
        function showError(error){
            var errorMsg = '';
            switch(error.code){
                case error.PERMISSION_DENIED:
                    errorMsg="用户拒绝对获取地理位置的请求。"
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMsg="位置信息是不可用的。"
                    break;
                case error.TIMEOUT:
                    errorMsg="请求用户地理位置超时。"
                    break;
                case error.UNKNOWN_ERROR:
                    errorMsg="未知错误。"
                    break;
            }
            typeof failedFunc === 'function' && failedFunc(errorMsg,error.code);
        }

        if (navigator.geolocation){
            navigator.geolocation.getCurrentPosition(successFunc,showError);
        }else{
            typeof failedFunc === 'function' && failedFunc("该浏览器不支持定位。");
        }
    }

  /**
   * 粗略计算两点间的距离
   * @type {number}
   */
  var EARTH_RADIUS = 6378137.0; //单位M
    var PI = Math.PI;

    function getRad(d){
        return d*PI/180.0;
    }

    /**
     * caculate the great circle distance
     * @param {Object} lat1
     * @param {Object} lng1
     * @param {Object} lat2
     * @param {Object} lng2
     */
    function getGreatCircleDistance(lat1,lng1,lat2,lng2){
        var radLat1 = getRad(lat1);
        var radLat2 = getRad(lat2);

        var a = radLat1 - radLat2;
        var b = getRad(lng1) - getRad(lng2);

        var s = 2*Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2) + Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(b/2),2)));
        s = s*EARTH_RADIUS;
        s = Math.round(s*10000)/10000.0;

        return s;
    }
    win.spaHomeUtil = {
        getLocation:getLocation,
        getGreatCircleDistance:getGreatCircleDistance
    };
})(window);
(function () {
    /*var isNeedBindPhone = $.localStorage('pop_bind_phone_dialog') || false;
    if(!isNeedBindPhone && $.$.userToken && !$.$.userTel){
        $.bindPhone(false);
    }*/
    $.ajax({
        url: 'homeData',
        success: function (data) {
            if (data.statusCode != "200") {
                return $.tipShow(data.msg || "获取会所数据失败！");
            }
            data = data.respData;
            /*************************************定义常用变量*************************************/
            var str = '',
                str1 = '',
                i,
                scroll,
                imgs,
                length = data['sliderPic'].length,
                telDetail = $('#telDetail'),
                tel,
                telCancel,
                content = $('#content')[0],
                bannerX = $('.banner>div:nth-of-type(1)>div:nth-of-type(1)'),
                bannerFlag = $('.banner>div:nth-of-type(1)>div:nth-of-type(2)'),
                logo = $('.banner>div:nth-of-type(2)>div:nth-of-type(1)');
            /*************************************加载数据*************************************/
            //初始化可能出错的字段
            if (!data['club']['telephone'])
                data['club']['telephone'] = '';
            if (length == 0) {
                data['sliderPic'] = [{
                    imageUrl: $.$.defaultBanner
                }];
                length = 1;
            }
            //生成banner和banner的小圆点
            for (i = 0; i < length; i++) {
                str += '<img src="' + (data['sliderPic'][i]['imageUrl'] || $.$.defaultBanner) + '" link="' + (data['sliderPic'][i]['link'] || '') + '"/>';
                str1 += '<span></span>';
            }
            //banner
            bannerX.Html(str);
            //banner小圆点
            bannerFlag.Html(str1);
            //会所logo
            $.$.clubLogo = data['club']['imageUrl'] || $.$.defaultClubLogo;
            logo.CSS('backgroundImage', 'url("' + $.$.clubLogo + '")');
            //会所名字
            $.$.clubName = data['club']['name'] || $.$.defaultClubName;
            $('.banner>div:nth-of-type(2)>div:nth-of-type(2)').Text($.$.clubName);
            //当前用户距离会所的距离
            if(!$.$.currLngx ||  !$.$.currLaty){
                spaHomeUtil.getLocation(function (position) {
                    $.$.currLngx = position.coords.longitude;
                    $.$.currLaty = position.coords.latitude;
                    setLocation();
                }, function (msg, code) {
                    setLocation();
                })
            }else{
                setLocation();
            }
            function setLocation(){
                if($.$.currLngx && $.$.currLaty && data['club']['longitude'] && data['club']['latitude']){
                    var dist = ~~spaHomeUtil.getGreatCircleDistance($.$.currLaty,$.$.currLngx,data['club']['latitude'],data['club']['longitude']);
                    if(dist/1000 > 1){
                        dist = (dist/1000).toFixed(1) + ' km';
                    }else{
                        dist += ' m';
                    }
                    $('.banner>div:nth-of-type(4)>div:nth-of-type(1)').Text(dist);
                }else{
                    $('.banner>div:nth-of-type(4)>div:nth-of-type(1)').Text('定位失败');
                }
            }
            //当前用户是否已收藏会所
            if(data['isUserFavoriteClub']){
                $('.banner>div:nth-of-type(3)').Class('collected');
                $('.banner>div:nth-of-type(3)>div:nth-of-type(2)').Text('已收藏');
            }
            //会所地址
            //$('#content>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type(2)>div').Text(data['club']['address']||$.$.defaultClubAddress);
            //生成推荐项目
            str = '';
            for (i = 0, length = data['serviceItems'].length; i < length; i++) {
                str +=
                    '<div hh="' + data['serviceItems'][i]['id'] + '">\
                     <div '+(i==0?'class="recommend-label"':'')+' style="background-image: url(\'' + (data['serviceItems'][i]['imageUrl'] || $.$.defaultService) + '\')"><div>' + data['serviceItems'][i]['name'] + '</div></div>\
                        <div>\
                            <div' + (data['serviceItems'][i]['price1'] ? '' : ' style="visibility:hidden;"') + '><span>￥</span>'+data['serviceItems'][i]['price1']+'</div>\
                            <div' + (data['serviceItems'][i]['price1'] ? '' : ' style="visibility:hidden;"') + '>' + data['serviceItems'][i]['duration1'] + '<span>' + (data['serviceItems'][i]['durationUnit'] || '分钟') + '</span></div>\
                        </div>\
                    </div>';
            }
            $('.service>div:nth-of-type(2)').Html(str);
            if (length == 0) {
                $('.service').Hide();
                //$('#content>div:nth-of-type(7)').Hide();
            }
            //生成会所电话
            str = '';
            if (data['club']['telephone'] != '')
                for (i = 0, str1 = data['club']['telephone'].split(','), length = str1.length; i < length; i++) {
                    str += '<div>' + str1[i] + '</div>';
                }
            $('#telDetail>div').Html(str + '<div>取消</div>');
            /*************************************定义逻辑*************************************/
                //设置banner滚动
            scroll = $.scroll({
                content: $('.banner>div:nth-of-type(1)')[0],
                contentX: bannerX[0],
                flagX: bannerFlag[0],
                loopX: true,
                autoX: true,
                /*click: function (item, index) {
                    if (item.getAttribute("link")) top.location.href = item.getAttribute("link");
                }*/
            });
            //点击banner
            //imgs = $('.banner>div:nth-of-type(1)>div:nth-of-type(1)>img');
            $('.banner>div:nth-of-type(1)>div:nth-of-type(1)>img').Event('click', function (e, item) {
                var href = $(item).Attr('link');
                if (href)
                    top.location.href = href;
            });

            //点击会所简介
            $('.banner>div:nth-of-type(2)').Page('clubProfile');
            //点击优惠活动
            $('#paidCoupon').Page('promotions');
            //点击服务项目
            //$('.menu>div:nth-of-type(3)').Page('serviceList');
            //切换到地图
            $('.banner>div:nth-of-type(4)>div:nth-of-type(1)').Page('map');
            //弹出电话选择界面
            $('.banner>div:nth-of-type(4)>div:nth-of-type(2)').Click(
                data['club']['telephone'] == '' ?
                    function () {
                        $.tipShow('暂无电话');
                    } : function () {
                    telDetail.Class("active");
                    $.hideOrderMenu();
                }
            );
            $('.banner>div:nth-of-type(3)').Click(function (e,item) {
                var $this = $(item),url,isCollected;
                if(!$.$.userToken){
                    $.$.loginUrl = "home";
                    $.page("login");
                    return;
                }
                if($this.ClassHave('collected')){   //已收藏
                    isCollected = true;
                    url = '../api/v2/profile/user/favorite/club/delete';
                }else{
                    isCollected = false;
                    url = '../api/v2/profile/user/favorite/club/save';
                }
                $.ajax({
                    url:url,
                    isReplaceUrl:true,
                    data:{
                        clubId: $.$.clubID
                    },
                    success: function (result) {
                        if(result.statusCode == 200){
                            if(isCollected){
                                $this.ClassClear('collected');
                                $('.banner>div:nth-of-type(3)>div:nth-of-type(2)').Text('收藏');
                            }else{
                                $this.Class('collected');
                                $('.banner>div:nth-of-type(3)>div:nth-of-type(2)').Text('已收藏');
                            }
                        }else{
                            $.tipShow(result.msg || '操作失败');
                        }
                    }
                });
            });
            telDetail.Event('touchmove', function (e) {
                e.preventDefault();
            }, false);
            telDetail.Click(function (e, item) {
                if (e.target == item) {
                    telDetail.ClassClear("active");
                    $.showOrderMenu();
                }
            });
            //拨号
            tel = $('#telDetail>div>div');
            telCancel = tel.Remove(tel.length - 1);
            tel.Click(function (e, item) {
                location.href = 'tel:' + item.innerHTML;
            });
            telCancel.Click(function () {
                telDetail.ClassClear("active");
                $.showOrderMenu();
            });
            //推荐技师-跑马灯效果
            if (data.techs.length > 0) {
                str = "";
                for (i = 0; i < data.techs.length; i++) {
                    str +=
                        "<div hh='" + data.techs[i]["techId"] + "'>\
                            <div style=\"background-image: url('" + (data.techs[i]["avatarUrl"] || $.$.defaultHeader) + "')\">\
                                <div>" + data.techs[i]["techName"] + "</div><div "+(i > 0 ? 'style="display:none;"':'')+"></div>\
                            </div>\
                            <div><div><div></div><div>" + (data.techs[i]["visitCount"] >= 1000 ? ((data.techs[i]["visitCount"]/1000).toFixed(1)+'K'):data.techs[i]["visitCount"]) + "</div></div><div><div></div><div>" + (data.techs[i]["goodCommentCount"] >= 1000 ? ((data.techs[i]["goodCommentCount"]/1000).toFixed(1)+'K'):data.techs[i]["goodCommentCount"]) + "</div></div></div>\
                        </div>";
                }
                $('.tech>div:nth-of-type(2)>div').Html(str);
                scrollHori({
                    container:$('.tech>div:nth-of-type(2)>div')[0],
                    showEleCount:4
                });
                /*$.scroll({
                    content: $('.tech>div:nth-of-type(2)')[0],
                    contentX: $('.tech>div:nth-of-type(2)>div')[0],
                    numsX: 4,
                    indexX: 5,
                    perX: 5 * $.$.scale * 16,
                    widthX: 18.666 * $.$.scale * 16,
                    //widthX:5 * $.$.scale * 16,
                    loopX: true,
                    //autoX:true,
                    //autoXTouched:true,
                    //autoXDelay:2000,
                    //click:function(item){
                    //    $.page("technicianDetail&id="+item.getAttribute("hh"));
                    //}
                });*/
            }
            else {
                $('.tech').CSS("display", "none");
            }

            $('.tech>div:nth-of-type(1)').Click(function () {
                $.page("technicianList");
            });
            $('.tech>div:nth-of-type(2)').Delegate('click', '>div>div', function (e, item) {
                $.page("technicianDetail&id=" + item.getAttribute("hh"));
            });

            //点击推荐项目
            $('.service>div:nth-of-type(1)').Click(function () {
                $.page("serviceList");
            });
            $('.service>div:nth-of-type(2)>div').Click(function (e, item) {
                $.sessionStorage('home_top', content.scrollTop, 30000);
                $.page('serviceItem&id=' + item.getAttribute('hh') + '&top=1');
            });
            //初始化高度
            content.scrollTop = $.sessionStorage('home_top');
            $.sessionStorageClear('home_top');
            //点击预约技师
            $('#orderBtn').Page('technicianList');
            //点击红包
            var coupons = $('#coupons'),
                getCouponsTime = $.localStorage('getCouponsTime' + $.$.clubID) || 0,
                getFlowersTime = $.localStorage('getFlowersTime' + $.$.clubID) || 0,
                nowTime = new Date().getTime(),
                isNeedCoupun = nowTime - getCouponsTime > 24 * 3600 * 1000,
                //isNeedFlowers = nowTime - getFlowersTime > 24 * 3600 * 1000;
                isNeedFlowers = true;
            if (isNeedCoupun || isNeedFlowers) {
                if(isNeedCoupun){
                    coupons.Click(function (e, item) {
                        e.preventDefault();
                        if (e.target == item) {
                            coupons.Hide();
                            $.localStorage('getCouponsTime' + $.$.clubID, nowTime);
                        }
                    });
                    coupons.Event('touchmove', function (e) {
                        e.preventDefault();
                    }, false);
                    $('#coupons>div:nth-of-type(3)').Click(function () {
                        coupons.Hide();
                        $.localStorage('getCouponsTime' + $.$.clubID, nowTime);
                    });
                }

                //弹出红包
                $.ajax({
                    url: 'top_popup/data',
                    success: function (data) {
                        if (data['statusCode'] == 200) {
                            if(data.respData.type == 'coupon' && isNeedCoupun){
                                var titleLen = (function (words) {
                                    var len = 0, a;
                                    for (var i = 0; i < words.length; i++) {
                                        a = words.charAt(i);
                                        if (a.match(/[^\x00-\xff]/ig) != null)len += 2;
                                        else len += 1;
                                    }
                                    return len;
                                })(data['respData']['actTitle']);

                                var titlePDiv = $('#coupons>div:nth-of-type(1)>div'),
                                  titleDiv = $('#coupons>div:nth-of-type(1)>div>div');
                                titleDiv.Html(data['respData']['actTitle']);

                                if (titleLen <= 10) {
                                    //////default
                                }
                                else if (titleLen <= 12) {
                                    titlePDiv.Class("spec-6");
                                }
                                else if (titleLen <= 14) {
                                    titlePDiv.Class("spec-7");
                                }
                                else if (titleLen <= 16) {
                                    titlePDiv.Class("spec-8");
                                }
                                else {
                                    titlePDiv.Class("two-line");
                                    if (titleLen > 32) {
                                        titleDiv.Html(data['respData']['actTitle'].substr(0, 14) + "...");
                                    }
                                }
                                function jump() {
                                    $.localStorage('getCouponsTime' + $.$.clubID, nowTime);
                                    location.href = data['respData']['shareUrl'];
                                }
                                $('#coupons>div:nth-of-type(1)').Click(jump);
                                $('#coupons>div:nth-of-type(2)').Click(jump);
                                coupons.Show();
                            }else if(data.respData.type == 'plumFlower' && isNeedFlowers){
                                var _bgDom = $('#getPlumflowers>div>div:nth-of-type(1)>div'),
                                    bgFlag = true;
                                function aniBg(){
                                    bgFlag?_bgDom.Class('toggle'):_bgDom.ClassClear('toggle');
                                    bgFlag = !bgFlag;
                                    setTimeout(aniBg,800);
                                }
                                setTimeout(aniBg,800);
                                $('#getPlumflowers').Class('active');
                                $('#getPlumflowers>div>div:nth-of-type(2)').Click(function () {
                                    $('#getPlumflowers').ClassClear('active');
                                    $.localStorage('getFlowersTime' + $.$.clubID, nowTime);
                                });
                                $('#getPlumflowers>div>div:nth-of-type(1)>a').Click(function () {
                                    $.localStorage('getFlowersTime' + $.$.clubID, nowTime);
                                    location.href = data['respData']['shareUrl'];
                                });
                            }
                        }
                    }
                });
            }

            //==== 抢项目列表 ====
            var actEnds = [];
            $.ajax({
                url:'../api/v2/club/paid_service_item/list',
                isReplaceUrl:true,
                data:{
                    clubId: $.$.clubID
                },
                success: function (response) {
                    if(response.statusCode == 200){
                        response = response.respData || [];
                        var _html = [],itemTimes = [];
                        if(response.length <= 0){
                            return;
                        }
                        $('.activity').ClassClear('hide');
                        response.forEach(function (resp,index) {
                            var currTime = +new Date();
                            _html.push('<div class="act-detail act-rob-project" data-item-id="'+resp.id+'" data-act-index="'+index+'">\
                                          <div>\
                                            <div style="background-image:url('+resp.imageUrl+')"></div>\
                                            <div>\
                                              <div>\
                                                <div>'+resp.name+'</div>\
                                                '+(resp.canPaidCount > 0 && resp.canPaidCount - resp.paidCount == 0?(actEnds[index] = true,'<div class="act-end">抢光了</div>'):('<div>'+(resp.canPaidCount>0?('剩余<span>'+(resp.canPaidCount - resp.paidCount)+'</span>份'):'<span>不限份数</span>')+'</div>'))+'\
                                              </div>\
                                              <div>￥'+resp.amount+'<span>原价：<span>'+resp.price+'</span>元</span><span '+((currTime>new Date(resp.startDate.replace(/-/g,'/')).getTime() && currTime < new Date(resp.endDate.replace(/-/g,'/')).getTime())&&((resp.canPaidCount - resp.paidCount>0)|| resp.canPaidCount == 0)?'':'class="hide"')+'>去抢购</span>\
                                              </div>\
                                              '+((resp.canPaidCount == 0 || resp.canPaidCount - resp.paidCount > 0) && new Date().getTime() < new Date(resp.endDate.replace(/-/g,'/')).getTime() ?('<div>'+(function(){
                                                      var flag = currTime<new Date(resp.startDate.replace(/-/g,'/')).getTime();
                                                      if(flag){
                                                          itemTimes[index] = {
                                                              startDate:new Date(resp.startDate.replace(/-/g,'/')).getTime(),
                                                              endDate:new Date(resp.endDate.replace(/-/g,'/')).getTime()
                                                          };
                                                          return '<div>距开始：</div>';
                                                      }else if(currTime < new Date(resp.endDate.replace(/-/g,'/')).getTime()){
                                                          itemTimes[index] = {
                                                              startDate:new Date(resp.startDate.replace(/-/g,'/')).getTime(),
                                                              endDate:new Date(resp.endDate.replace(/-/g,'/')).getTime()
                                                          };
                                                          isCanPay = true;
                                                          return '<div>距结束：</div>';
                                                      }else{
                                                          return '<div>已结束：</div>';
                                                      }
                                                  }())+'\
                                              <span class="rob-day"><div><div>0</div><div>0</div></div></span>\
                                              <span class="rob-day"><div><div>0</div><div>0</div></div></span> <div class="rob-day">天</div>\
                                              <span><div><div>0</div><div>0</div></div></span>\
                                              <span><div><div>0</div><div>0</div></div></span> <div>时</div>\
                                              <span><div><div>0</div><div>0</div></div></span>\
                                              <span><div><div>0</div><div>0</div></div></span> <div>分</div>\
                                              <span><div><div>0</div><div>0</div></div></span>\
                                              <span><div><div>0</div><div>0</div></div></span> <div>秒</div>\
                                              <span class="rob-millis hide"><div><div>0</div><div>0</div></div></span>\
                                              <span class="rob-millis hide"><div><div>0</div><div>0</div></div></span> <div class="rob-millis hide">毫秒</div>\
                                              </div>'):(actEnds[index] = true,'<div class="act-end">活动已结束，欢迎下次抢购！</div>'))+'\
                                            </div>\
                                          </div>\
                                        </div>');
                        });
                        $('.activity>div:nth-of-type(2)').Html(_html.join('')).Delegate('click','.act-rob-project', function (e, item) {
                            if(actEnds[item.dataset.actIndex] !== true){
                                $.page('robProjectDetail&robProjectId='+item.dataset.itemId);
                            }
                        });
                        itemTimes.forEach(function (time,i) {
                            calcRobProject(time,i);
                        })
                    }
                }
            });
            //===========抢项目 活动倒计时==========//

            function calcRobProject(time,timeIndex){
                var startDate = time.startDate,endDate = time.endDate,isStart = false,isEnd = false;
                calcTime();
                function calcTime(){
                    var round = Math.round,floor = Math.floor,millis,endTimeProject,
                      currTime = +new Date(),
                      millisec,sec,min,hour,day
                      ,spans = $('.activity>div:nth-of-type(2)>div:nth-of-type('+(timeIndex+1)+')>div>div:nth-of-type(2)>div:nth-of-type(3)>span')
                      ,labels = $('.activity>div:nth-of-type(2)>div:nth-of-type('+(timeIndex+1)+')>div>div:nth-of-type(2)>div:nth-of-type(3)>span>div'),timeData
                      ,isStartMillis = false;       //是否启用毫秒
                    if(startDate > currTime){
                        millis = startDate - currTime;
                        $('.activity>div:nth-of-type(2)>div:nth-of-type('+(timeIndex+1)+')>div>div:nth-of-type(2)>div:nth-of-type(3)>div:nth-of-type(1)').Text('距开始：')
                    }else if(endDate > currTime){
                        millis = endDate - currTime;
                        $('.activity>div:nth-of-type(2)>div:nth-of-type('+(timeIndex+1)+')>div>div:nth-of-type(2)>div:nth-of-type(3)>div:nth-of-type(1)').Text('距结束：')
                        $('.activity>div:nth-of-type(2)>div:nth-of-type('+(timeIndex+1)+')>div:nth-of-type(2)').ClassClear('hide')
                        isStart = true;
                        $('.activity>div:nth-of-type(2)>div:nth-of-type('+(timeIndex+1)+')>div>div:nth-of-type(2)>div:nth-of-type(2)>span:nth-of-type(2)').ClassClear('hide');
                    }else{
                        isStart = true;
                        isEnd = true;
                        actEnds[timeIndex] = true;
                        $('.activity>div:nth-of-type(2)>div:nth-of-type('+(timeIndex+1)+')>div>div:nth-of-type(2)>div:nth-of-type(3)').Class('act-end').Html('活动已结束，欢迎下次抢购！')
                        $('.activity>div:nth-of-type(2)>div:nth-of-type('+(timeIndex+1)+')>div:nth-of-type(2)').Class('hide')
                        $('.activity>div:nth-of-type(2)>div:nth-of-type('+(timeIndex+1)+')>div>div:nth-of-type(2)>div:nth-of-type(2)>span:nth-of-type(2)').Class('hide');
                        return;
                    }
                    endTimeProject = millis/1000;
                    if(endTimeProject > 0){
                        millisec = floor(millis%1000/10);
                        sec = floor(endTimeProject%60);
                        min = floor(endTimeProject/60%60);
                        hour = floor(endTimeProject/3600%24);
                        day = floor(endTimeProject/3600/24);

                        timeData = [floor(day/10),day%10,floor(hour/10),hour%10,floor(min/10),min%10,floor(sec/10),sec%10,floor(millisec/10),floor(millis%10)];
                        //timeData = [0,0,0,0,0,2,0,1,9,5];

                        labels.Index(0).Children().Text(timeData[0]);
                        labels.Index(1).Children().Text(timeData[1]);
                        labels.Index(2).Children().Text(timeData[2]);
                        labels.Index(3).Children().Text(timeData[3]);
                        labels.Index(4).Children().Text(timeData[4]);
                        labels.Index(5).Children().Text(timeData[5]);
                        labels.Index(6).Children().Text(timeData[6]);
                        labels.Index(7).Children().Text(timeData[7]);
                        labels.Index(8).Children().Text(timeData[8]);
                        labels.Index(9).Children().Text(timeData[9]);
                        //== 开始计时
                        if(day == 0 && !isStartMillis){
                            isStartMillis = true;
                            $('.activity>div:nth-of-type(2)>div:nth-of-type('+(timeIndex+1)+') .rob-day').Class('hide');
                            $('.activity>div:nth-of-type(2)>div:nth-of-type('+(timeIndex+1)+') .rob-millis').ClassClear('hide');
                            setTimeout(startToggleMillis,10);
                        }
                        setTimeout(startToggle,millis%1000);        //毫秒与秒分别计时，因为只用毫秒的话，误差会越来越大


                        //==== 添加动画回调事件 =======
                        spans.Event((function(){
                            var t,el = document.createElement('tmpelement'),
                              transitions = {
                                  'transition':'transitionend',
                                  'OTransition':'oTransitionEnd',
                                  'MozTransition':'transitionend',
                                  'WebkitTransition':'webkitTransitionEnd',
                                  'MsTransition':'msTransitionEnd'
                              };

                            for(t in transitions){
                                if( el.style[t] !== undefined ){
                                    return transitions[t];
                                }
                            }
                        }()), function (e, item) {
                            var $item = $(item),cs = $item.Children().Index(0).Children();
                            cs.Index(1).Text(cs.Index(0).Text());
                            $item.ClassClear('toggle');
                            if(timeData[0] == 0 && timeData[1] == 0 && !isStartMillis){
                                isStartMillis = true;
                                $('.activity>div:nth-of-type(2)>div:nth-of-type('+(timeIndex+1)+') .rob-day').Class('hide');
                                $('.activity>div:nth-of-type(2)>div:nth-of-type('+(timeIndex+1)+') .rob-millis').ClassClear('hide');
                            }
                        });

                        //========= 数值渐变 =========
                        function startToggleMillis(){
                            if(timeData[9]>0){
                                timeData = [timeData[0],timeData[1],timeData[2],timeData[3],timeData[4],timeData[5],timeData[6],timeData[7],timeData[8],timeData[9] - 1];
                                changeNums([9]);
                            }else if(timeData[8]>0){
                                timeData = [timeData[0],timeData[1],timeData[2],timeData[3],timeData[4],timeData[5],timeData[6],timeData[7],timeData[8]-1,9];
                                changeNums([8,9]);
                            }else{
                                if(timeData.join('').replace(/0/g,'') == ''){
                                    if(!isStart||!isEnd){
                                        calcTime();
                                    }else{
                                        actEnds[timeIndex] = true;
                                        $('.activity>div:nth-of-type(2)>div:nth-of-type('+(timeIndex+1)+')>div>div:nth-of-type(2)>div:nth-of-type(2)>span:nth-of-type(2)').Class('hide');
                                    }
                                    return true;
                                }
                            }
                            setTimeout(startToggleMillis,10);
                        }
                        function startToggle(){
                            var tmpArr = [];
                            if(timeData[7]>0){
                                timeData = [timeData[0],timeData[1],timeData[2],timeData[3],timeData[4],timeData[5],timeData[6],timeData[7] - 1,9,9];
                                tmpArr = tmpArr.concat([7]);
                            }else if(timeData[6]>0){
                                timeData = [timeData[0],timeData[1],timeData[2],timeData[3],timeData[4],timeData[5],timeData[6] - 1,9,9,9];
                                tmpArr = tmpArr.concat([6,7]);
                            }else if(timeData[5]>0){
                                timeData = [timeData[0],timeData[1],timeData[2],timeData[3],timeData[4],timeData[5] - 1,5,9,9,9];
                                tmpArr = tmpArr.concat([5,6,7]);
                            }else if(timeData[4]>0){
                                timeData = [timeData[0],timeData[1],timeData[2],timeData[3],timeData[4] - 1,9,5,9,9,9];
                                tmpArr = tmpArr.concat([4,5,6,7]);
                            }else if(timeData[3]>0){
                                timeData = [timeData[0],timeData[1],timeData[2],timeData[3] - 1,5,9,5,9,9,9];
                                tmpArr = tmpArr.concat([3,4,5,6,7]);
                            }else if(timeData[2]>0){
                                timeData = [timeData[0],timeData[1],timeData[2]-1,9,5,9,5,9,9,9];
                                tmpArr = tmpArr.concat([2,3,4,5,6,7]);
                            }else if(timeData[1]>0){
                                timeData = [timeData[0],timeData[1] - 1,2,4,5,9,5,9,9,9];
                                tmpArr = tmpArr.concat([1,2,3,4,5,6,7]);
                            }else if(timeData[0]>0){
                                timeData = [timeData[0] - 1,9,2,4,5,9,5,9,9,9];
                                tmpArr = tmpArr.concat([0,1,2,3,4,5,6,7]);
                            }else{
                                if(timeData.join('').replace(/0/g,'') == '') {
                                    if (!isStart || !isEnd) {
                                        calcTime();
                                    } else {
                                        actEnds[timeIndex] = true;
                                        $('.activity>div:nth-of-type(2)>div:nth-of-type('+(timeIndex+1)+')>div>div:nth-of-type(2)>div:nth-of-type(2)>span:nth-of-type(2)').Class('hide');
                                    }
                                    return true;
                                }
                            }
                            changeNums(tmpArr);
                            setTimeout(startToggle,1000);
                        }

                        function changeNums(_indexs){
                            _indexs.forEach(function (v) {
                                labels.Index(v).Children().Index(0).Text(timeData[v]);
                                spans.Index(v).Class('toggle');
                            })
                        }

                    }
                }
            }


            //执行页面切换
            $.pageSwitch();
        },
        error: function (res) {
        }
    });
})();