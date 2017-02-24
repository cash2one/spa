(function () {
    var content$ = $('#content'),
        luckyWheelFirstSize = 3,
        timeLimitFirstSize = 2,
        oneYuanFirstSize = 1,
        clubListBox = $('#content>div>div.list'),
        currClubPage = 0,
        clubLoading = $('#loadTip'),
        clubLoadFinish = $('#finishTip'),
        clubDataEnd = false,
        pageHeight = 0,
        agile = 0.4;     //自裁加载下页的灵敏度  值越小越灵敏（0.4表示当前面有40%的内容在可视区域时就加载下一页的数据）

    if(!$.$.clubID && !$.$.userToken){//跳转到登录
        $.$.loginUrl = "activities";
        $.page("login");
        return;
    }else if($.$.userToken && !$.$.userTel){     //绑定手机(绑定手机后才可领取优惠券)
        $.$.loginUrl = "activities";
        $.bindPhone();
        return true;
    }else{
        initEvent();
        queryClubList(1, function (result) {
            var $item = $('#club_'+result.id + ' >.club-info'),$parent = $($item[0].parentNode),dataset = $parent[0].dataset;
            if($.$.clubID) {
                clubLoadFinish.CSS('display','none');
                $item.CSS('display','none');
                $parent.Class('expanded');
                $parent.Children().Index(1).ClassClear('hide');
                if(!dataset.isLoaded){  //=== 未加载过数据，则加载数据 ===
                    dataset.isLoaded = true;
                    var n = 0;
                    function callback(){
                        n++;
                        if(n == 4){
                            loadingEnd($item);
                        }
                    }
                    loadingStart($item);
                    queryClubDetail(dataset.clubId,callback);
                    queryLuckyWheel(dataset.clubId,1,luckyWheelFirstSize,callback);
                    queryTimeLimit(dataset.clubId,1,timeLimitFirstSize,callback);
                    queryOneYuan(dataset.clubId,1,oneYuanFirstSize,callback);
                }
            }
        });
    }

    function queryClubList(page,callback){
        currClubPage = page = page || currClubPage + 1;
        if(!clubLoading.ClassHave('none') || clubDataEnd) return;
        clubLoading.ClassClear('none');
        var url = '../api/v2/club/act/count';
        if(!$.$.clubID){
            url = '../api/v2/profile/user/favorite/club/act_count'
        }
        $.ajax({
            url:url,
            isReplaceUrl:true,
            data:{
                clubId: $.$.clubID || '',
                page: page,
                pageSize: 10
            },
            success: function (result) {
                if(result.statusCode == 200){
                    clubLoading.Class('none');
                    var _html = [];
                    result = result.respData || [];
                    result.forEach(function (club) {
                        _html.push('<div class="club-item" data-club-id="'+club.id+'" id="club_'+club.id+'">\
                                        <div class="club-info loading-process-bar">\
                                            <div><div style="background-image:url('+(club.imageUrl || $.$.defaultClubLogo)+')"></div>\
                                            <div>'+club.name+'</div></div>\
                                            <div><div>&nbsp;</div><div>'+club.actCount+'活动</div>\
                                            <div></div></div>\
                                        </div>\
                                        <div class="content-area hide">\
                                            <div class="coupons-area m-b-16">\
                                                <div class="item-header coupon-header">\
                                                    <div>\
                                                        <div></div>\
                                                        <div>优惠券</div>\
                                                    </div>\
                                                </div>\
                                                <div>\
                                                    <div class="scroll-area coupon-scroll"></div>\
                                                </div>\
                                            </div>\
                                            <div class="lucky-wheel-area m-b-16">\
                                                <div class="item-header lucky-header b-b  loading-process-bar"  data-club-id="'+club.id+'">\
                                                    <div>\
                                                        <div></div>\
                                                        <div>抽奖活动</div><div>参与记录</div><div></div>\
                                                    </div>\
                                                </div>\
                                                <div class="lucky-list"></div>\
                                                <div class="lucky-wheel-more item-more loading-process-bar" data-club-id="'+club.id+'" data-type="luckyWheel">\
                                                    <div>更多展开</div>\
                                                    <div></div>\
                                                </div>\
                                            </div>\
                                            <div class="time-limit-area m-b-16">\
                                                <div class="item-header time-limit-header  loading-process-bar">\
                                                    <div>\
                                                        <div></div>\
                                                        <div>限时抢购</div>\
                                                    </div>\
                                                </div>\
                                                <div class="time-limit-list"></div>\
                                                <div class="time-limit-more item-more loading-process-bar" data-club-id="'+club.id+'" data-type="timeLimit">\
                                                    <div>更多展开</div>\
                                                    <div></div>\
                                                </div>\
                                            </div>\
                                            <div class="one-yuan-area m-b-16 ">\
                                                <div class="one-yuan-header item-header loading-process-bar"  data-club-id="'+club.id+'" >\
                                                    <div>\
                                                        <div></div>\
                                                        <div>谁替我买单</div>\
                                                        <div>参与记录</div><div></div>\
                                                    </div>\
                                                </div>\
                                                <div class="one-yuan-list"></div>\
                                                <div class="one-yuan-more item-more loading-process-bar" data-club-id="'+club.id+'" data-type="oneYuan">\
                                                    <div>更多展开</div>\
                                                    <div></div>\
                                                </div>\
                                            </div>\
                                            <div class="discount-act-area m-b-16">\
                                                <div class="item-header discount-act-header b-b">\
                                                    <div>\
                                                        <div></div>\
                                                        <div>优惠活动</div>\
                                                    </div>\
                                                </div>\
                                                <div class="discount-act-list"></div>\
                                            </div>\
                                        </div>\
                                    </div>');
                    });
                    if(page == 1){
                        if(_html.length == 0){
                            clubListBox.Class('nullData');
                            clubDataEnd = true;
                        }else if(_html.length < 10){
                            clubDataEnd = true;
                            clubLoadFinish.ClassClear('none');
                        }
                        clubListBox.Html(_html.join(''));
                        pageHeight = clubListBox[0].scrollHeight;
                        if(_html.length > 0){
                            callback(result[0]);
                        }
                    }else{
                        if(_html.length < 10){
                            clubDataEnd = true;
                            clubLoadFinish.ClassClear('none');
                        }
                        clubListBox.Html(_html.join(''),true);
                    }
                    initClubClick();
                    initCouponScroll();
                }else{
                    $.tipShow(result.msg || '查询数据失败');
                }
            }
        });
    }

    //=== 查询优惠券列表 ===
    function queryClubDetail(clubId,callback){
        $.ajax({
            url:'../api/v2/club/'+clubId+'/activities',
            isReplaceUrl:true,
            success: function (result) {
                if(typeof callback === 'function') callback(result);
                if(result.statusCode == 200){
                    var _html = [], coupons,discountActs;
                    coupons = result.respData.coupons || [];
                    coupons.forEach(function (coupon) {
                        _html.push('<div class="coupon-item"><div class="money-coupon">\
                                          <div data-act-id="'+ coupon.actId +'">\
                                            <div>'+ coupon.actTitle +'</div>\
                                            <div>'+ (coupon.useType == 'money'?(coupon.actValue+'元现金券，'):'') + coupon.consumeMoneyDescription +'</div>\
                                          </div>\
                                          <div>\
                                            <div>'+ coupon.useTypeName +'</div>\
                                            <div class="sure-btn '+((coupon.getFlag == 'already_get' || coupon.getFlag == 'finish_get')?'disabled':'')+'" data-act-id="'+ coupon.actId
                                        +'" data-act-value="'+ coupon.actValue +'" data-act-title="'+ coupon.actTitle +'" data-coupon-type="'+ coupon.couponType
                                        +'" data-act-total="'+ coupon.actTotal +'" data-user-get-count="'+ coupon.userGetCount+'" data-coupon-Sell-Total="'+ coupon.couponSellTotal +'"  data-user-get-counts="'+ coupon.userGetCounts+'">'
                                        +(coupon.getFlag == 'already_get'?'已领取':(coupon.getFlag == 'finish_get'?'已领完':'立即领取'))+'</div>\
                                          </div>\
                                        </div></div>');
                    });
                    if(coupons.length > 0){
                        $('#club_'+clubId+' .coupons-area .scroll-area').Html(_html.join(''));
                        scrollHori({
                            container:$('#club_'+clubId+' .coupons-area .scroll-area')[0],
                            showEleCount: 2,
                            overlap:4
                        });
                    }else{
                        $('#club_'+clubId+' .coupons-area').Hide();
                    }

                    //=== 优惠活动 ===
                    discountActs = result.respData.acts || [];
                    _html = [];
                    discountActs.forEach(function (act) {
                        _html.push('<div class="discount-act-item" data-act-id="'+act.actId+'" data-club-id="'+clubId+'"  style="background-image: url('+act.actLogoUrl+')">\
                                        <div>\
                                            <div>'+act.actTitle+'</div>\
                                            <div>活动时间：'+ $.formatDate(act['startDate'],act['endDate'])+'</div>\
                                        </div>\
                                    </div>');
                    });
                    if(_html.length > 0){
                        $('#club_'+clubId + ' .discount-act-area .discount-act-list').Html(_html.join(''));
                    }else{
                        $('#club_'+clubId + ' .discount-act-area').Hide();
                    }
                }else{
                    $.tipShow(result.msg || '查询优惠券列表失败');
                    $('#club_'+clubId+' .coupons-area').Hide();
                }
            }
        });
    }

    //=== 查询抽奖活动 ===
    function queryLuckyWheel(clubId,page,pageSize,callback){
        var dataset = $('#club_'+clubId + ' .lucky-wheel-area>.item-more')[0].dataset,domId = '#club_'+clubId;
        page = page || (dataset.page || 0 ) - 0 + 1;
        loadingStart($(domId + ' .lucky-wheel-area .loading-process-bar'));
        $.ajax({
            url:'../api/v2/user/luckyWheel/online/list',
            isReplaceUrl:true,
            data:{
                clubId:clubId,
                page:page,
                pageSize:pageSize
            },
            success: function (result) {
                if(typeof callback === 'function') callback(result);
                if(result.statusCode == 200){
                    var pageCount = result.pageCount;
                    loadingEnd($(domId + ' .lucky-wheel-area .loading-process-bar'));
                    pageSize > luckyWheelFirstSize && (dataset.page = page);
                    var _html = [];
                    result = result.respData || [];
                    result.forEach(function (lw,i) {
                        if(page == 1 && i == 0){
                            _html.push('<div class="lucky-item image" data-act-id="'+lw.id+'" data-club-id="'+clubId+'">\
                                            <div>\
                                                <div>活动时间：'+ formatLuckyTime(lw.startTime) + ' - '+ formatLuckyTime(lw.endTime ) +'</div>\
                                                <div>赢取'+lw.firstPrize+'</div>\
                                            </div>\
                                        </div>');
                        }else{
                            _html.push('<div class="lucky-item default" data-act-id="'+lw.id+'" data-club-id="'+clubId+'">\
                                            <div>\
                                                <div>活动奖品：</div>\
                                                <div>'+lw.firstPrize+'</div>\
                                            </div>\
                                            <div>\
                                                <div>活动时间：</div>\
                                                <div>'+lw.startTime + ' - '+ lw.endTime+'</div>\
                                            </div>\
                                        </div>');
                        }
                    });
                    if(_html.length > 0){
                        if(page == 1){
                            $(domId + ' .lucky-wheel-area .lucky-list').Html(_html.join(''));
                            if(pageSize == luckyWheelFirstSize){
                                dataset.boxHeight = $(domId + ' .lucky-wheel-area .lucky-list')[0].getBoundingClientRect().height;
                            }
                        }else{
                            $(domId + ' .lucky-wheel-area .lucky-list').Html(_html.join(''),true);
                        }
                        if( pageSize > luckyWheelFirstSize || pageCount > 1){      //还有更多
                            $(domId + ' .lucky-wheel-area').Class('has-more');
                            if(page == pageCount){
                                dataset.isEnd = true;
                                $(domId + ' .lucky-wheel-area>.item-more>div:nth-of-type(1)').Text('收起');
                                $(domId + ' .lucky-wheel-area>.item-more').Class('expanded');
                            }
                        }
                    }else if(page == 1){
                        $(domId + ' .lucky-wheel-area').Hide();
                    }else{
                        $(domId + ' .lucky-wheel-area').ClassClear('has-more');
                    }
                }else{
                    $.tipShow(result.msg || '查询抽奖活动失败');
                    $('#club_'+clubId + ' .lucky-wheel-area').Hide();
                }
            }
        });
    }

    //=== 查询限时抢购 ===
    function queryTimeLimit(clubId,page,pageSize,callback){
        var dataset = $('#club_'+clubId + ' .time-limit-area>.item-more')[0].dataset,domId = '#club_'+clubId;
        page = page || (dataset.page || 0 ) - 0 + 1;
        loadingStart($(domId + ' .time-limit-area .loading-process-bar'));
        $.ajax({
            url:'../api/v2/club/paid_service_item/online/list',
            isReplaceUrl:true,
            data:{
                clubId:clubId,
                page:page,
                pageSize:pageSize
            },
            success: function (result) {
                if(typeof callback === 'function') callback(result);
                if(result.statusCode == 200){
                    var pageCount = result.pageCount;
                    loadingEnd($(domId + ' .time-limit-area .loading-process-bar'));
                    pageSize > timeLimitFirstSize && (dataset.page = page);
                    var _html = [],currTime = +new Date(),actEnds = [];
                    result = result.respData || [];
                    result.forEach(function (tl,i) {
                        actEnds[i] = (tl.canPaidCount > 0 && tl.canPaidCount - tl.paidCount == 0) || new Date() - new Date(tl.endDate.replace(/-/g,'/')).getTime() >= 0 ? true : tl;
                        _html.push('<div class="act-detail act-paid_item '+(actEnds[i] === true ?'act-end':'')+'" data-act-id="'+tl.id+'" data-act-index="'+((page-1) * pageSize + i)+'" data-club-id="'+clubId+'">\
                                <div>\
                                    <div style="background-image: url('+ (tl.imageUrl || $.$.defaultService)+')"></div>\
                                    <div>\
                                        <div>\
                                            <div><div>'+tl.name+'</div><div '+(tl.usePeriod && (tl.usePeriod.match(/(\d)/g).length != 7 || tl.endTime) ? '':'class="hide"')+'>限时用</div></div>\
                                            '+(actEnds[i] === true?'<div style="display:none;"></div>':('<div>'+(tl.canPaidCount>0?('剩余<span>'+(tl.canPaidCount - tl.paidCount)+'</span>份'):'<span>不限份数</span>')+'</div>'))+'\
                                        </div>\
                                        <div>\
                                            <div>\
                                                <span>'+tl.amount+'</span><span>元</span><span '+(tl.credits > 0?'':'style="display:none;"')+'>（或<span>'+tl.credits+'</span><span>积分</span>）</span>\
                                            </div>\
                                            <div>\
                                                <div>\
                                                    <div>'+(actEnds[i] === true?'抢光了':'马上抢')+'</div>\
                                                    <div></div>\
                                                </div>\
                                            </div>\
                                        </div>\
                                        <div>\
                                            <div>原价：'+tl.price+'元</div>\
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
                    });
                    if(_html.length > 0){
                        if(page == 1){
                            $(domId + ' .time-limit-area .time-limit-list').Html(_html.join(''));
                            if(pageSize == timeLimitFirstSize){
                                dataset.boxHeight = $(domId + ' .time-limit-area .time-limit-list')[0].getBoundingClientRect().height;
                            }
                        }else{
                            $(domId + ' .time-limit-area .time-limit-list').Html(_html.join(''),true);
                        }
                        if(pageSize > timeLimitFirstSize || pageCount > 1){      //还有更多
                            $(domId + ' .time-limit-area').Class('has-more');
                            if(page == pageCount){
                                $(domId + ' .time-limit-area').Class('has-more');
                                dataset.isEnd = true;
                                $(domId + ' .time-limit-area>.item-more>div:nth-of-type(1)').Text('收起');
                                $(domId + ' .time-limit-area>.item-more').Class('expanded');
                            }
                        }
                        //=== 倒计时 ===
                        actEnds.forEach(function (tl,i) {
                            if(tl !== true){
                                +function countDown(tl,i,page,pageSize){
                                    var drawTime,
                                      times= ['距开始：','00','时','00','分','00','秒'],
                                      calcFunc, d, h, m, sec,
                                      timeSpans = $(domId + ' .time-limit-area .time-limit-list>div:nth-of-type('+((page-1)*pageSize + i + 1)+') .count-down>div'),
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
                                                $(domId + ' .time-limit-area .time-limit-list>div:nth-of-type('+((page-1)*pageSize + i + 1)+')').Class('act-end');
                                                $(domId + ' .time-limit-area .time-limit-list>div:nth-of-type('+((page-1)*pageSize + i + 1)
                                                  +')>div:nth-of-type(1)>div:nth-of-type(2)>div:nth-of-type(2)>div:nth-of-type(2)>div>div:nth-of-type(1)').Text('抢光了');
                                            }
                                        }
                                        showTimes();
                                    };
                                    calcFunc();
                                }(tl,i,page,pageSize);
                            }
                        })
                    }else if(page == 1){
                        $(domId + ' .time-limit-area').Hide();
                    }else{
                        $(domId + ' .time-limit-area').ClassClear('has-more');
                    }
                }else{
                    $.tipShow(result.msg || '查询限时抢购失败');
                    $('#club_'+clubId + ' .time-limit-area').Hide();
                }
            }
        });
    }

    //=== 查询谁替我买单 ===
    function queryOneYuan(clubId,page,pageSize,callback){
        var dataset = $('#club_'+clubId + ' .one-yuan-area>.item-more')[0].dataset,domId = '#club_'+clubId;
        page = page || (dataset.page || 0 ) - 0 + 1;
        loadingStart($(domId + ' .one-yuan-area .loading-process-bar'));
        $.ajax({
            url:'../api/v2/club/one_yuan/online/list',
            isReplaceUrl:true,
            data:{
                clubId:clubId,
                page:page,
                pageSize:pageSize
            },
            success: function (result) {
                if(typeof callback === 'function') callback(result);
                if(result.statusCode == 200){
                    var pageCount = result.pageCount;
                    loadingEnd($(domId + ' .one-yuan-area .loading-process-bar'));
                    pageSize > oneYuanFirstSize && (dataset.page = page);
                    var _html = [],currTime = +new Date(),actEnds = [];
                    result = result.respData || [];
                    result.forEach(function (oy,i) {
                        oy.status == 'end' ? actEnds.push(oy) : actEnds.push(false);
                        _html.push('<div class="act-detail act-one_yuan '+((oy.status == 'online' && currTime - new Date(oy.startTime) > 0) ? 'act-started':(oy.status == 'complete' ? 'act-complete': ''))
                          +'" data-item-id="'+oy.id+'" data-act-index="'+((page -1) * pageSize + 1)+'"  data-club-id="'+clubId+'">\
                                <div>\
                                    <div style="background-image:url('+(oy.imageUrl || $.$.defaultService)+')"></div>\
                                    <div>\
                                        <div>\
                                            <div>'+oy.actName+'<span>(第'+oy.currentPeriod+'期)</span></div>\
                                            '+(function(){
                                                  if(oy.status == 'online' && currTime - new Date(oy.startTime) > 0){
                                                      return '<div>剩余<span>'+oy.actualCanPaidCount+'</span>份</div>';
                                                  }else if(oy.status == 'end'){
                                                      return '<div>待开奖</div>';
                                                  }else{
                                                      return '<div>未开始</div>';
                                                  }
                                              }())+'\
                                        </div>\
                                        <div>\
                                            <div><span>'+oy.unitPrice+'<span>元</span></span><span>原价：<span>'+oy.actPrice+'</span>元</span></div>\
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
                                                <div>'+(oy.paidCount/(oy.totalPaidCount) * 100).toFixed(0)+'%</div>\
                                                <div>\
                                                    <div style="width:'+((oy.paidCount)/oy.totalPaidCount * 100).toFixed(0)+'%"></div>\
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
                    });
                    if(_html.length > 0){
                        if(page == 1){
                            $(domId + ' .one-yuan-area .one-yuan-list').Html(_html.join(''));
                            if(pageSize == oneYuanFirstSize){
                                dataset.boxHeight = $(domId + ' .one-yuan-area .one-yuan-list')[0].getBoundingClientRect().height;
                            }
                        }else{
                            $(domId + ' .one-yuan-area .one-yuan-list').Html(_html.join(''),true);
                        }
                        if(pageCount > 1 || pageSize > oneYuanFirstSize){      //还有更多
                            $(domId + ' .one-yuan-area').Class('has-more');
                            if(page == pageCount){
                                dataset.isEnd = true;
                                $(domId + ' .one-yuan-area>.item-more>div:nth-of-type(1)').Text('收起');
                                $(domId + ' .one-yuan-area>.item-more').Class('expanded');
                            }
                        }
                        //=== 倒计时 ===
                        actEnds.forEach(function(oy,i){
                            if(oy){
                                +function countDown(tl,i,page,pageSize){
                                    var drawTime,
                                      completeTime = new Date(tl.completeTime),
                                      times= ['揭晓倒计时：','00','时','00','分','00','秒'],
                                      calcFunc, d, h, m, sec,
                                      timeSpans = $(domId + ' .one-yuan-area .one-yuan-list>div:nth-of-type('+((page-1)*pageSize + i + 1)+') .countDown>div'),
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
                                            $(domId + ' .one-yuan-area .one-yuan-list>div:nth-of-type('+((page-1)*pageSize + i + 1)+')').Class('act-complete');
                                        }
                                        showTimes();
                                    };
                                    calcFunc();
                                }(oy,i,page,pageSize);
                            }
                        });
                    }else if(page == 1){
                        $(domId + ' .one-yuan-area').Hide();
                    }else{
                        $(domId + ' .one-yuan-area').ClassClear('has-more');
                    }
                }else{
                    $.tipShow(result.msg || '查询谁替我买单失败');
                    $('#club_'+clubId + ' .one-yuan-area').Hide();
                }
            }
        });
    }

    $.pageSwitch();

    //=== 绑定事件 ===
    function initEvent(){
        content$.Event('scroll', function (e) {
            if(!clubDataEnd && content$[0].scrollTop + content$[0].clientHeight - (currClubPage + agile - 1) * pageHeight >= 0  ){
                queryClubList();
            }
        });
        content$.Event('touchstart', function (e) {
            if(scrollTimer) clearTimeout(scrollTimer);
        });
        //=== 点击会所 ===
        $('#content>div')
          /*.Delegate('click','>.list>.club-item>.club-info>div:nth-of-type(1),>.list>.club-item>.club-info>div:nth-of-type(2)>div:nth-of-type(1)',function(e,item){
              var $item = $(item.parent),$parent = $(item.parentNode.parentNode),dataset = $parent[0].dataset;
              if(!dataset.clubId){
                  $parent = $(item.parentNode.parentNode.parentNode);
                  dataset = $parent[0].dataset;
              }
              location.href = location.origin + location.pathname + '?club=' + dataset.clubId + '#home';
          })*/
          /*.Delegate('click','>.list>.club-item>.club-info>div:nth-of-type(2)>div:nth-of-type(2),>.list>.club-item>.club-info>div:nth-of-type(3),>.list>.club-item>.club-info>div:nth-of-type(4)',function(e,item){
            var $item = $(item.parent),$parent = $(item.parentNode.parentNode),dataset = $parent[0].dataset;
              if(!dataset.clubId){
                  $parent = $(item.parentNode.parentNode.parentNode);
                  dataset = $parent[0].dataset;
              }
            if($parent.ClassHave('expanded')){
                $parent.ClassClear('expanded');
                $parent.Children().Index(1).Class('hide');
            }else{
                $parent.Class('expanded');
                $parent.Children().Index(1).ClassClear('hide');
                if(!dataset.isLoaded){  //=== 未加载过数据，则加载数据 ===
                    dataset.isLoaded = true;
                    var n = 0;
                    function callback(){
                        n++;
                        if(n == 4){
                            loadingEnd($item);
                        }
                    }
                    loadingStart($item);
                    queryClubDetail(dataset.clubId,callback);
                    queryLuckyWheel(dataset.clubId,1,luckyWheelFirstSize,callback);
                    queryTimeLimit(dataset.clubId,1,timeLimitFirstSize,callback);
                    queryOneYuan(dataset.clubId,1,oneYuanFirstSize,callback);
                }
            }
        })*/
          .Delegate('click','>.list>.club-item .coupons-area .sure-btn', function (e, item) {
              if(!$.$.userToken){//跳转到登录
                  $.$.loginUrl = "activities";
                  $.page("login");
                  return;
              }else if(!$.$.userTel){     //绑定手机(绑定手机后才可领取优惠券)
                  $.$.loginUrl = "activities";
                  $.bindPhone();
                  return true;
              }
              var $item = $('.coupons-area .sure-btn[data-act-id="'+item.dataset.actId+'"]'),dataset = item.dataset;
              if(!$item.ClassHave("disabled")){

                  $item.Class('disabled');
                  $item.Text('领取中...');
                  //领取优惠券
                  $.ajax({
                      url : '../api/v2/club/get/redpacket',
                      isReplaceUrl:true,
                      data:{
                          actId : dataset.actId,
                          phoneNum : $.$.userTel,
                          openId : $.$.openId
                      },
                      success : function(res){
                          $item.ClassClear('disabled');
                          $item.Text('立即领取');
                          if(res.statusCode == 200){
                              if(dataset["couponType"]!="redpack"){
                                  dataset["userGetCounts"]++;
                                  dataset["couponSellTotal"]++;
                              }
                          }
                          else if(res.statusCode == 206){
                              $.tipShow(res.msg || "你已经领取过了！");
                          }
                          else{
                              $.tipShow(res.msg || "领取失败！");
                          }

                          if(res.statusCode !=200 && dataset["couponType"]!="redpack" ){
                              $item.Class('disabled');
                              if(res.statusCode==200 || res.statusCode==206) item.innerHTML = "已领取完";
                          }

                          if(dataset["couponType"]=="redpack"){
                              $item.Class('disabled');
                              if(res.statusCode==200 || res.statusCode==206) item.innerHTML = "已领取";
                          }
                          else if(res.statusCode == 200){
                              $.tipShow('领取成功，可重复领取');
                              if(dataset["userGetCount"] - dataset["userGetCounts"] <= 0 || (dataset["actTotal"] != 0 && dataset["couponSellTotal"]-dataset["actTotal"]>=0)){
                                  $item.Class('disabled');
                                  if(res.statusCode==200 || res.statusCode==206) item.innerHTML = "已领取完";
                              }
                          }
                      },
                      error : function(res){
                          if(res.msg){
                              $.tipShow(res.msg);
                          }
                          $item.ClassClear('disabled');
                          $item.Text('立即领取');
                      }
                  });
              }
          })

          .Delegate('click','>.list>.club-item .lucky-wheel-area .lucky-item', function (e, item) {
              location.href = location.origin+'/spa-manager/luckyWheel/?actId='+item.dataset.actId+'&clubId='+item.dataset.clubId;
          })
          .Delegate('click','>.list>.club-item .lucky-wheel-area .lucky-header', function (e, item) {
              if($.$.clubID){
                  $.page('lucky');
              }else{
                  location.href = location.origin + location.pathname + '?club=' + item.dataset.clubId + '#lucky';
              }
          })


          .Delegate('click','>.list>.club-item .time-limit-area .act-detail', function (e, item) {
              if(!$(item).ClassHave('act-end')){
                  if($.$.clubID){
                      $.page('robProjectDetail&robProjectId='+item.dataset.actId);
                  }else{
                      location.href = location.origin + location.pathname + '?club=' + item.dataset.clubId + '#robProjectDetail&robProjectId='+item.dataset.actId;
                  }
              }
          })
          .Delegate('click','>.list>.club-item .one-yuan-area .act-detail', function (e, item) {
              if($.$.clubID){
                  $.page('oneYuanDetail&oneYuanId='+item.dataset.itemId);
              }else{
                  location.href = location.origin + location.pathname + '?club=' + item.dataset.clubId + '#oneYuanDetail&oneYuanId='+item.dataset.itemId;
              }
          })
          .Delegate('click','>.list>.club-item .one-yuan-area .one-yuan-header', function (e, item) {
              if($.$.clubID){
                  $.page('oneYuanRecords');
              }else{
                  location.href = location.origin + location.pathname + '?club=' + item.dataset.clubId + '#oneYuanRecords';
              }
          })

          .Delegate('click','>.list>.club-item .discount-act-area .discount-act-item', function (e, item) {
              if($.$.clubID){
                  $.page('promotionsActivity&id='+item.dataset.actId);
              }else{
                  location.href = location.origin + location.pathname + '?club=' + item.dataset.clubId + '#promotionsActivity&id='+item.dataset.actId;
              }
          })
          .Delegate('click','>.list>.club-item .item-more', function (e, item) {
              var dataset = item.dataset,$item = $(item);
              if(!dataset.isEnd){ //继续加载数据
                  if(dataset.type == 'luckyWheel'){
                      queryLuckyWheel(item.dataset.clubId,0,10);
                  }else if(dataset.type == 'timeLimit'){
                      queryTimeLimit(item.dataset.clubId,0,10);
                  }
                  else if(dataset.type == 'oneYuan'){
                      queryOneYuan(item.dataset.clubId,0,10);
                  }
              }else{
                  var prevDom = $('#club_'+ dataset.clubId + ' .lucky-wheel-area .lucky-list');
                  if(dataset.type == 'timeLimit'){
                      prevDom = $('#club_'+ dataset.clubId + ' .time-limit-area .time-limit-list');
                  }
                  else if(dataset.type == 'oneYuan'){
                      prevDom = $('#club_'+ dataset.clubId + ' .one-yuan-area .one-yuan-list');
                  }
                  if($item.ClassHave('expanded')){      //已展开将收起
                      if(scrollTimer) clearTimeout(scrollTimer);
                      scrollTopChangeAnimate(prevDom[0].getBoundingClientRect().height - dataset.boxHeight);
                      //prevDom.Class('list-expanded-animate');
                      prevDom.CSS('height',((dataset.boxHeight - 0) / $.$.scale / 16) + 'rem');
                      setTimeout(function () {
                          //prevDom.ClassClear('list-expanded-animate');
                          $item.ClassClear('expanded');
                          $item.Children().Index(0).Text('更多展开');
                      },300);
                  }else{                                 //重新展开
                      $item.Class('expanded');
                      $item.Children().Index(0).Text('收起');
                      prevDom.CSS('height','auto');
                  }
              }
          });
    }

    function initCouponScroll(){
        $('.club-item .coupons-area .scroll-area').Each(function (item,i) {
            if(item.children.length >　0){
                scrollHori({
                    container:item,
                    showEleCount: 2,
                    overlap:4
                });
            }
        });
    }

    function initClubClick(){
        $('#content>div>.list>.club-item>.club-info>div:nth-of-type(1)').Click(function(e,item){
            var $item = $(item.parentNode),$parent = $(item.parentNode.parentNode),dataset = $parent[0].dataset;
            if(!dataset.clubId){
                $parent = $(item.parentNode.parentNode);
                dataset = $parent[0].dataset;
            }
            location.href = location.origin + location.pathname + '?club=' + dataset.clubId + '#home';
        });
        $('#content>div>.list>.club-item>.club-info>div:nth-of-type(2)').Click(function(e,item){
            var $item = $(item.parentNode),$parent = $(item.parentNode.parentNode),dataset = $parent[0].dataset;
            if(!dataset.clubId){
                $parent = $(item.parentNode.parentNode);
                dataset = $parent[0].dataset;
            }
            if($parent.ClassHave('expanded')){
                $parent.ClassClear('expanded');
                $parent.Children().Index(1).Class('hide');
            }else{
                $parent.Class('expanded');
                $parent.Children().Index(1).ClassClear('hide');
                if(!dataset.isLoaded){  //=== 未加载过数据，则加载数据 ===
                    dataset.isLoaded = true;
                    var n = 0;
                    function callback(){
                        n++;
                        if(n == 4){
                            loadingEnd($item);
                        }
                    }
                    loadingStart($item);
                    queryClubDetail(dataset.clubId,callback);
                    queryLuckyWheel(dataset.clubId,1,luckyWheelFirstSize,callback);
                    queryTimeLimit(dataset.clubId,1,timeLimitFirstSize,callback);
                    queryOneYuan(dataset.clubId,1,oneYuanFirstSize,callback);
                }
            }
        });
    }

    var scrollTimer = 0 ;
    function scrollTopChangeAnimate(changeValue){
        if(changeValue <= 0) return;
        var step = changeValue / 150 * 17;
        function changeScrollTop(){
            changeValue -= step;
            if(changeValue >= 0){
                content$[0].scrollTop -= step;
                scrollTimer = setTimeout(changeScrollTop,17);
            }
        }
        scrollTimer = setTimeout(changeScrollTop,17);
    }

    function loadingStart($dom){
        $dom.Class('loading-process-bar-active');
    }
    function loadingEnd($dom){
        $dom.Class('loading-process-bar-end');
        setTimeout(function () {
            $dom.ClassClear('loading-process-bar-active');
            $dom.ClassClear('loading-process-bar-end');
        },50);
    }

    //===
    function formatLuckyTime(time){
        return $.commonDateFormat(new Date(time.replace(/-/g,'/')),'yy.MM.dd hh:mm');
    }
})();