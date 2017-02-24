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
                //data['serviceItems'][i]['discountPrice']  = data['serviceItems'][i]['price1'];  //测试
                if(data['serviceItems'][i]['discountPrice']){
                    str +=
                      '<div hh="' + data['serviceItems'][i]['id'] + '">\
                     <div '+(i==0?'class="recommend-label"':'')+' style="background-image: url(\'' + (data['serviceItems'][i]['imageUrl'] || $.$.defaultService) + '\')"><div>' + data['serviceItems'][i]['name'] + '</div></div>\
                        <div class="has-discount">\
                            <div >网店价<span>￥</span>'+data['serviceItems'][i]['discountPrice']+'</div>\
                            <div ><span>￥</span>'+data['serviceItems'][i]['price1']+'</div>\
                        </div>\
                    </div>';
                }else{
                    str +=
                      '<div hh="' + data['serviceItems'][i]['id'] + '">\
                     <div '+(i==0?'class="recommend-label"':'')+' style="background-image: url(\'' + (data['serviceItems'][i]['imageUrl'] || $.$.defaultService) + '\')"><div>' + data['serviceItems'][i]['name'] + '</div></div>\
                        <div>\
                            <div' + (data['serviceItems'][i]['price1'] ? '' : ' style="visibility:hidden;"') + '><span>￥</span>'+data['serviceItems'][i]['price1']+'</div>\
                            <div' + (data['serviceItems'][i]['price1'] ? '' : ' style="visibility:hidden;"') + '>' + data['serviceItems'][i]['duration1'] + '<span>' + (data['serviceItems'][i]['durationUnit'] || '分钟') + '</span></div>\
                        </div>\
                    </div>';
                }
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

            if(data['journal'] && data['journal']['id']){
                $(".journal").CSS('display','block');
                $(".journal>div>span").Text(data['journal']['title']).Click(function(){
                    location.href = location.origin+"/spa-manager/journal/#/"+(data['journal']['templateId'] || 1)+"/?id="+data['journal']['id'];
                })
                //点击全部期刊
                $(".journal>div>div").Page("journalList")
            }

            //点击会所简介
            $('.banner>div:nth-of-type(2)').Page('clubProfile');
            //点击优惠活动
            $('#paidCoupon').Page('activities');
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

            //==== 获取弹窗数据 ===
            var coupons = $('#coupons'),activityPop = $('.activity-pop'),timeLimit = $('#timeLimit')
              ,oneYuan = $('#oneYuan'),luckyWheel = $('#luckyWheel'),popJournal = $('#journal');
            $('.activity-pop>div>div:nth-of-type(2)').Click(function(){
                activityPop.ClassClear('active');
            });
            activityPop.Event('touchmove', function (e, item) {
                e.preventDefault();
            });

            $.ajax({
                url:'../api/v2/club/popup/get',
                isReplaceUrl:true,
                data:{
                    clubId: $.$.clubID
                },
                success: function (popResult) {
                    if(popResult.statusCode == 200){
                        popResult = popResult.respData;
                        if(!popResult) return;
                        var pastPopInfo = $.localStorage('pastPopInfo_'+ $.$.clubID) ? JSON.parse($.localStorage('pastPopInfo_'+ $.$.clubID)) : {};
                        if( pastPopInfo.id != popResult.id || (pastPopInfo.id && pastPopInfo.time && new Date() - new Date(pastPopInfo.time) > 24 * 3600 * 1000)){
                            $.localStorage('pastPopInfo_' + $.$.clubID, JSON.stringify({
                                id: popResult.id,
                                time: new Date().getTime()
                            }));
                            switch (popResult.activityType){
                                case 'coupon':{                 //优惠券
                                    popResult.activityName = popResult.activityName.substring(popResult.activityName.indexOf('】'));
                                    var titleLen = (function (words) {
                                        var len = 0, a;
                                        for (var i = 0; i < words.length; i++) {
                                            a = words.charAt(i);
                                            if (a.match(/[^\x00-\xff]/ig) != null)len += 2;
                                            else len += 1;
                                        }
                                        return len;
                                    })(popResult.activityName);

                                    var titlePDiv = $('#coupons>div:nth-of-type(1)>div'),
                                      titleDiv = $('#coupons>div:nth-of-type(1)>div>div');
                                    titleDiv.Html(popResult.activityName);

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
                                            titleDiv.Html(popResult['activityName'].substr(0, 14) + "...");
                                        }
                                    }
                                    function jump() {
                                        location.href = location.origin + '/spa-manager/coupons/#home&actId='+popResult.activityId+'&chanel=index'
                                    }
                                    $('#coupons>div:nth-of-type(1),#coupons>div:nth-of-type(2)').Click(jump);
                                    coupons.Event('touchmove', function (e) {
                                        e.preventDefault();
                                    }, false);
                                    $('#coupons>div:nth-of-type(3)').Click(function () {
                                        coupons.Hide();
                                    });
                                    coupons.Show();
                                }break;
                                case 'paid_service_item':{      //限时抢
                                    timeLimit.Class('active');
                                    $('#timeLimit>div>div:nth-of-type(1)>div').Click(function (e, item) {
                                        $.page('robProjectDetail&robProjectId='+popResult.activityId);
                                    });
                                }break;
                                case 'one_yuan':
                                case 'paid_plumflowe':{                       //一元夺
                                    oneYuan.Class('active');
                                    $('#oneYuan>div>div:nth-of-type(1)>div').Click(function (e, item) {
                                        if(popResult.activityType == 'one_yuan'){
                                            $.page('oneYuanDetail&oneYuanBaseId='+popResult.activityId);
                                        }else{
                                            $.page('plumflowers&id='+popResult.activityId);
                                        }
                                    });
                                }break;
                                case 'luckyWheel':{         //大转盘
                                    luckyWheel.Class('active');
                                    $('#luckyWheel>div>div:nth-of-type(1)>div').Click(function (e, item) {
                                        location.href = location.origin+'/spa-manager/luckyWheel/?actId='+popResult.activityId+'&clubId='+popResult.clubId;
                                    });
                                }break;
                                case 'journal':{
                                    popJournal.Class('active');
                                    $('#journal>div>div:nth-of-type(1)>div').Click(function (e, item) {
                                        location.href = location.origin+"/spa-manager/journal?id="+popResult.activityId;
                                    });
                                }break;
                            }
                        }
                    }
                }
            });

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
                        response.forEach(function (resp,index) {
                            var currTime = +new Date();
                            if(resp.actType == 'paid_item'){
                                actEnds[index] = (resp.canPaidCount > 0 && resp.canPaidCount - resp.paidCount == 0) || new Date() - new Date(resp.endDate.replace(/-/g,'/')).getTime() >= 0 ? true : resp;
                                _html.push('<div class="act-detail act-paid_item '+(actEnds[index] === true ?'act-end':'')+'" data-act-id="'+resp.id+'" data-act-index="'+index+'">\
                                    <div>\
                                        <div style="background-image: url('+ (resp.imageUrl || $.$.defaultService)+')"></div>\
                                        <div>\
                                            <div>\
                                                <div><div>'+resp.name+'</div><div '+(resp.usePeriod && (resp.usePeriod.match(/(\d)/g).length != 7 || resp.endTime) ? '':'class="hide"')+'>限时用</div></div>\
                                                '+(actEnds[index] === true?'<div style="display:none;"></div>':('<div>'+(resp.canPaidCount>0?('剩余<span>'+(resp.canPaidCount - resp.paidCount)+'</span>份'):'<span>不限份数</span>')+'</div>'))+'\
                                            </div>\
                                            <div>\
                                                <div>\
                                                    <span>'+resp.amount+'</span><span>元</span><span '+(resp.credits > 0?'':'style="display:none;"')+'>（或<span>'+resp.credits+'</span><span>积分</span>）</span>\
                                                </div>\
                                                <div>\
                                                    <div>\
                                                        <div>'+(actEnds[index] === true?'抢光了':'马上抢')+'</div>\
                                                        <div></div>\
                                                    </div>\
                                                </div>\
                                            </div>\
                                            <div>\
                                                <div>原价：'+resp.price+'元</div>\
                                                <div class="count-down">\
                                                    <div>距开始：</div>\
                                                    <div>12</div>\
                                                    <div>天</div>\
                                                    <div>23</div>\
                                                    <div>时</div>\
                                                    <div>59</div>\
                                                    <div>分</div>\
                                                </div>\
                                            </div>\
                                            <div>活动已结束，欢迎下次抢购！</div>\
                                        </div>\
                                    </div>\
                                </div>');
                            }
                            else if(resp.actType == 'one_yuan'){
                                resp.status == 'end' ? actEnds.push(resp) : actEnds.push(false);
                                _html.push('<div class="act-detail act-one_yuan '+((resp.status == 'online' && currTime - new Date(resp.startDate.replace(/-/g,'/')) > 0) ? 'act-started':(resp.status == 'complete' ? 'act-complete': ''))
                                  +'" data-item-id="'+resp.id+'" data-act-index="'+index+'">\
                                        <div>\
                                            <div style="background-image:url('+(resp.imageUrl || $.$.defaultService)+')"></div>\
                                            <div>\
                                                <div>\
                                                    <div>'+resp.name+'<span>(第'+resp.currentPeriod+'期)</span></div>\
                                                    '+(function(){
                                                          if(resp.status == 'online' && currTime - new Date(resp.startDate.replace(/-/g,'/')) > 0){
                                                              return '<div>剩余<span>'+resp.canPaidCount+'</span>份</div>';
                                                          }else if(resp.status == 'end'){
                                                              return '<div>待开奖</div>';
                                                          }else{
                                                              return '<div>未开始</div>';
                                                          }
                                                      }())+'\
                                                </div>\
                                                <div>\
                                                    <div><span>'+resp.amount+'<span>元</span></span><span>原价：<span>'+resp.price+'</span>元</span></div>\
                                                </div>\
                                                <div>\
                                                    <div class="countDown">\
                                                        <div>揭晓倒计时：</div>\
                                                        <div>00</div>\
                                                        <div>时</div>\
                                                        <div>00</div>\
                                                        <div>分</div>\
                                                        <div>00</div>\
                                                        <div>秒</div>\
                                                    </div>\
                                                    <div>\
                                                        <div>开奖进度：</div>\
                                                        <div>'+(resp.paidCount/(resp.totalPaidCount) * 100).toFixed(0)+'%</div>\
                                                        <div>\
                                                            <div style="width:'+((resp.paidCount)/resp.totalPaidCount * 100).toFixed(0)+'%"></div>\
                                                        </div>\
                                                        <div>\
                                                            <div>\
                                                                <div>一元抢</div>\
                                                                <div></div>\
                                                            </div>\
                                                        </div>\
                                                    </div>\
                                                </div>\
                                                <div>已揭晓</div>\
                                            </div>\
                                        </div>\
                                    </div>');
                            }
                        });
                        //return;
                        if(_html.length > 0){
                            $('.activity').ClassClear('hide');
                            $('.activity>div:nth-of-type(2)').Html(_html.join('')).Delegate('click','.act-paid_item', function (e, item) {
                                if(actEnds[item.dataset.actIndex] !== true){
                                    $.page('robProjectDetail&robProjectId='+item.dataset.actId);
                                }
                            }).Delegate('click','.act-one_yuan',function(e,item){
                                $.page('oneYuanDetail&oneYuanId='+item.dataset.itemId);
                            });
                            actEnds.forEach(function (tl,i) {
                                if(tl.actType == 'paid_item' && tl !== true){
                                    +function countDown(tl,i){
                                        var drawTime,
                                          times= ['揭晓倒计时：','00','时','00','分','00','秒'],
                                          calcFunc, d, h, m, sec,
                                          timeSpans = $('.activity .act-paid_item:nth-of-type('+(i + 1)+') .count-down>div'),
                                          showTimes = function () {
                                              timeSpans.Index(0).Text(times[0]);
                                              timeSpans.Index(1).Text(times[1]);
                                              timeSpans.Index(2).Text(times[2]);
                                              timeSpans.Index(3).Text(times[3]);
                                              timeSpans.Index(4).Text(times[4]);
                                              timeSpans.Index(5).Text(times[5]);
                                              timeSpans.Index(6).Text(times[6]);
                                          },intervalTime;
                                        if(new Date() - new Date(tl.startDate.replace(/-/g,'/')).getTime() < 0 ){
                                            times[0] = '距开始：';
                                            drawTime = new Date(tl.startDate.replace(/-/g,'/'));
                                        }else if( new Date() - new Date(tl.endDate.replace(/-/g,'/')).getTime() < 0 ){
                                            times[0] = '距结束：';
                                            drawTime = new Date(tl.endDate.replace(/-/g,'/'));
                                        }
                                        showTimes();
                                        calcFunc = function(){
                                            var currTime = new Date();
                                            if(drawTime - currTime > 0){
                                                var dvaule = (drawTime - currTime)/1000;
                                                sec = ~~(dvaule%60);
                                                m = ~~(dvaule/60%60);
                                                h = ~~(dvaule/3600%24);
                                                d = ~~(dvaule/3600/24);
                                                if(d > 0 ){
                                                    times = [times[0],d<10?'0'+d:d,'天',h<10?'0'+h:h,'时',m<10?'0'+m:m,'分'];
                                                    intervalTime = (sec + 1) * 1000;
                                                }else{
                                                    times = [times[0],h<10?'0'+h:h,'时',m<10?'0'+m:m,'分',sec<10?'0'+sec:sec,'秒'];
                                                    intervalTime = 1000;
                                                }
                                                setTimeout(calcFunc,intervalTime);
                                            }else{
                                                if(times[0] == '距开始：'){
                                                    times[0] = '距结束：';
                                                    drawTime = new Date(tl.endDate.replace(/-/g,'/'));
                                                    calcFunc();
                                                }else{
                                                    $('.activity .act-paid_item:nth-of-type('+(i + 1)+')').Class('act-end');
                                                    $('.activity .act-paid_item:nth-of-type('+(i + 1)+')>div:nth-of-type(1)>div:nth-of-type(2)>div:nth-of-type(2)>div:nth-of-type(2)>div>div:nth-of-type(1)').Text('抢光了');
                                                }
                                            }
                                            showTimes();
                                        };
                                        calcFunc();
                                    }(tl,i);
                                }
                                else if (tl.actType == 'one_yuan'){
                                    if(tl){
                                        +function countDown(tl,i){
                                            var drawTime,
                                              completeTime = new Date(tl.completeTime),
                                              times= ['距开始：','00','时','00','分','00','秒'],
                                              calcFunc, d, h, m, sec,
                                              timeSpans = $('.activity .act-one_yuan:nth-of-type('+(i + 1)+') .countDown>div'),
                                              showTimes = function () {
                                                  timeSpans.Index(0).Text(times[0]);
                                                  timeSpans.Index(1).Text(times[1]);
                                                  timeSpans.Index(2).Text(times[2]);
                                                  timeSpans.Index(3).Text(times[3]);
                                                  timeSpans.Index(4).Text(times[4]);
                                                  timeSpans.Index(5).Text(times[5]);
                                                  timeSpans.Index(6).Text(times[6]);
                                              },intervalTime;
                                            var todayDrawTime = new Date();
                                            if(completeTime - new Date($.commonDateFormat(todayDrawTime,'yyyy/MM/dd 20:30:00')) > 0){
                                                todayDrawTime.setDate(todayDrawTime.getDate() + 1);
                                            }
                                            drawTime = new Date($.commonDateFormat(todayDrawTime,'yyyy/MM/dd 21:00:00'));
                                            calcFunc = function(){
                                                var currTime = new Date();
                                                if(drawTime - currTime > 0){
                                                    var dvaule = (drawTime - currTime)/1000;
                                                    sec = ~~(dvaule%60);
                                                    m = ~~(dvaule/60%60);
                                                    h = ~~(dvaule/3600%24);
                                                    d = ~~(dvaule/3600/24);
                                                    if(d > 0 ){
                                                        times = [times[0],d<10?'0'+d:d,'天',h<10?'0'+h:h,'时',m<10?'0'+m:m,'分'];
                                                        intervalTime = (sec + 1) * 1000;
                                                    }else{
                                                        times = [times[0],h<10?'0'+h:h,'时',m<10?'0'+m:m,'分',sec<10?'0'+sec:sec,'秒'];
                                                        intervalTime = 1000;
                                                    }
                                                    setTimeout(calcFunc,intervalTime);
                                                }else{
                                                    $('.activity .act-one_yuan:nth-of-type('+(i + 1)+')').Class('act-complete');
                                                }
                                                showTimes();
                                            };
                                            calcFunc();
                                        }(tl,i);
                                    }
                                }
                            })
                        }
                    }
                }
            });

            //=== 点击全部活动 ===
            $('.activity>div:nth-of-type(1)').Page('activities');

            if($.$.accessMenus.onceCardMall && !$.$.accessMenus.onceCardMall.isOff){
                // 查询项目次卡
                $.ajax({
                    url: "../api/v2/club/item_card/activity/list",
                    data: { clubId: $.$.clubID },
                    isReplaceUrl: true,
                    success: function(onceCardRes){
                        if(onceCardRes.statusCode == 200){
                            onceCardRes = onceCardRes.respData;
                            if(onceCardRes && onceCardRes.activityList.length>0){
                                var cards = onceCardRes.activityList, cardList = [];
                                cardList.push(cards[0]);
                                cardList[0].tag="new";
                                var count = 1;
                                if(cards[0].id != onceCardRes.optimalActivity.id){
                                    cardList.push(onceCardRes.optimalActivity);
                                    cardList[1].tag="best";
                                }
                                while(cardList.length<=3 && count<cards.length){
                                    if(cards[count].id != onceCardRes.optimalActivity.id){
                                        cardList.push(cards[count])
                                    }
                                    count++;
                                }
                                var cardStr = "", cardItem, plan, price;
                                for(count = 0; count< cardList.length; count++){
                                    cardItem = cardList[count];
                                    for(i=0;i<cardItem.itemCardPlans.length;i++){
                                        plan = cardItem.itemCardPlans[i];
                                        if(plan.optimal == "Y"){
                                            price = plan.actAmount/100/(plan.giveCount+plan.paidCount);
                                            if(price>1.001){
                                                price = Math.round(price)
                                            } else {
                                                if(price<0.01){
                                                    price = 0.01;
                                                }
                                                price = price.toFixed(2)
                                            }
                                            var progress = 0
                                            if (cardItem.totalCount != 0 && cardItem.paidCount > cardItem.totalCount * 0.49) {
                                                progress = (cardItem.paidCount / cardItem.totalCount) * 100
                                            }
                                            cardStr += "<li cardId='"+cardItem.id+"' class='"+(cardItem.statusName=="已售完" ? "sellOut" : (cardItem.statusName=="已过期" ? "expired" : ""))+"'>\
                                                                <div style='background-image: url("+(cardItem.imageUrl || $.$.defaultService)+")'><div>"+cardItem.name+"</div></div>\
                                                                <div><b>"+price+"</b>元/次<span>买"+plan.paidCount+"送"+plan.giveCount+"</span></div>\
                                                                <div>"+Math.round(plan.itemAmount/100)+"元/次"+(progress ? "<div>"+progress+"%<div style='left:"+progress+"%'></div></div>" : "")+"</div>"+(cardItem.tag ? "<div class='"+cardItem.tag+"'>"+(cardItem.tag=='new' ? '最新' : '最优惠')+"</div>" : "")+"\
                                                            </li>";
                                            break;
                                        }
                                    }
                                }
                                $(".discount-service").Show();
                                $(".discount-service>ul")[0].innerHTML = cardStr;
                                $(".discount-service>ul>li").Click(function(e,item){
                                    $.page("onceCardDetail&id="+item.getAttribute("cardId"))
                                })
                                $(".discount-service>div>div:nth-of-type(2)").Click(function(){
                                    $.page("discountMall")
                                })
                            }
                        }
                    }
                })
            }

            //执行页面切换
            $.pageSwitch();

            //=== 获取大转盘活动 ===
            /*var luckyWheelTip = $('#luckyWheelTip');
            $.ajax({
                url:'../api/v2/user/luckyWheel/clubActList',
                isReplaceUrl:true,
                data:{
                    clubId: $.$.clubID
                },
                success: function (result) {
                    if(result.statusCode == 200){
                        if(result.respData && result.respData.length > 0){
                            if($.$.userToken){
                                $.ajax({
                                    url:'../api/v2/user/luckyWheel/getUserLeftDrawCount',
                                    isReplaceUrl:true,
                                    data:{
                                        clubId: $.$.clubID
                                    },
                                    success: function (res) {
                                        if(res.statusCode == 200){
                                            if(res.respData && res.respData - 0 > 0){
                                                luckyWheelTip.Class('active').Click(function (e, item) {
                                                    location.href = location.origin+'/spa-manager/luckyWheel/?actId='+result.respData[0].id+'&clubId='+ $.$.clubID;
                                                });
                                            }
                                        }else{
                                            $.tipShow(res.msg || '查询可抽奖次数失败');
                                        }
                                    }
                                });
                            }else{
                                luckyWheelTip.Class('active').Click(function (e, item) {
                                    location.href = location.origin+'/spa-manager/luckyWheel/?actId='+result.respData[0].id+'&clubId='+ $.$.clubID;
                                });
                            }
                        }
                    }else{
                        $.tipShow(result.msg || '查询大转盘活动失败');
                    }
                }
            });*/
        },
        error: function (res) {
        }
    });
})();