(function () {
    var $content = $('#content'),
      switchBtns = $('.switch-two-button > div'),
      $contentArea = $('.content-area'),
      $allRecords = $('.all-records'),
      $winRecords = $('.win-records'),
      $allRecordsList = $('#allRecordsList'),
      $winRecordsList = $('#winRecordsList'),
      $showNumsPop = $('#showNumsPop'),
      pageHeightAll,
      pageHeightWin,
      prevClubAll,
      prevClubWin,
      currShowType = 'all',     //all  win
      myNums = {},
      isAddDataAll = false,
      isAddDataWin = false,
      isAddEndAll = false,
      isAddEndWin = false,
      isAddAlreadyWin = false,
      dataAddIconAll = $('.all-records>div.loadTip'),
      dataAddIconWin = $('.win-records>div.loadTip'),
      dataFinishIcon1All = $('.all-records>div.finishTip'),
      dataFinishIcon1Win = $('.win-records>div.finishTip'),
      statusTextObj = {
          not_online:'未上线',
          online:'进行中',
          end:'待开奖',
          complete:'已揭晓',
          refund:'已退款'
      },
      pageAll = 1,
      pageWin = 1,
      pageSize = 10,
      agile = 0.4;     //自裁加载下页的灵敏度  值越小越灵敏（0.4表示当前面有40%的内容在可视区域时就加载下一页的数据）

    if(!$.$.userToken){//跳转到登录
        $.$.loginUrl = "oneYuanRecords";
        $.page("login");
        return;
    }

    function queryAllData(page){
        pageAll = page || pageAll + 1;
        if(isAddDataAll) return;
        isAddDataAll = true;
        $.ajax({
            url:'../api/v2/club/one_yuan/act/list',
            isReplaceUrl:true,
            data:{
                clubId: $.$.clubID || '',
                page:pageAll,
                pageSize:pageSize
            },
            success: function (res) {
                //res = testAllData[pageAll - 1];
                if(res.statusCode == 200){
                    res = res.respData;
                    var tmpHtml = [];
                    res.forEach(function (record) {
                        if(prevClubAll != record.clubId){
                            prevClubAll = record.clubId;
                            tmpHtml.push('<div class="club-header" data-club-id="'+record.clubId+'">\
                                            <div>'+record.clubName+'</div>\
                                            <div></div>\
                                        </div>');
                        }
                       tmpHtml.push('<div class="item '+record.status +'" data-status="'+record.status+'" data-club-id="'+record.clubId+'" data-one-yuan-id="'+record.oneYuanId+'" data-user-one-yuan-id="'+record.userOneYuanId+'" data-is-draw="'+(record.drawUserId == $.$.userID)+'">\
                                        <div>\
                                            <div style="background-image: url('+(record.actImageUrl || $.$.defaultService)+')"></div>\
                                            <div>\
                                                <div>\
                                                    <div>'+record.actName+'</div>\
                                                    <div>'+statusTextObj[record.status]+'</div>\
                                                </div>\
                                                <div>\
                                                    <div>\
                                                        <div class="act-process">开奖进度：<span>'+(((record.totalPaidCount - record.canPaidCount)/record.totalPaidCount) * 100).toFixed(2) +'%</span></div>\
                                                        <div class="act-process-bar"><div style="width:'+(((record.totalPaidCount - record.canPaidCount)/record.totalPaidCount) * 100).toFixed(2) +'%;"></div></div>\
                                                        <div class="act-nums">\
                                                            <div>总需'+record.totalPaidCount+'次</div>\
                                                            <div>还剩<span>'+ record.canPaidCount +'</span></div>\
                                                        </div>\
                                                    </div>\
                                                    <div class="act-buy-btn" data-club-id="'+record.clubId+'" data-one-yuan-id="'+record.oneYuanId+'">继续抢购</div>\
                                                </div>\
                                                <div>\
                                                    <div>我参与了<span>'+record.ticketCount+'</span>次</div>\
                                                    <div class="check-my-nums" data-club-id="'+record.clubId+'" data-act-name="'+record.actName+'" data-one-yuan-id="'+record.oneYuanId+'">查看我的号码</div>\
                                                </div>\
                                                <div>\
                                                    <div><div>获奖者：</div><div>'+(record.status == 'complete'?record.drawUserName+record.phoneNum.replace(/^(\d{3})\d{4}(\d{4})$/g,'（$1****$2）'):'')+'</div></div>\
                                                    <div><div>幸运号码：</div><div>'+record.actDrawNo+'</div></div>\
                                                    <div><div>揭晓时间：</div><div>'+record.drawTime+'</div></div>\
                                                </div>\
                                            </div>\
                                        </div>\
                                    </div>');
                    });
                    //显示数据修正
                    if(page==1){
                        $allRecordsList.Html(tmpHtml.join(''));
                        if(tmpHtml.length > 0){
                            $allRecordsList.ClassClear('nullData');
                        }else{
                            $allRecordsList.Class('nullData');
                            isAddEndAll=true;
                        }
                        pageHeightAll = $allRecordsList[0].clientHeight;
                    }else{
                        $allRecordsList.Html(tmpHtml.join(''),true);
                        if(tmpHtml.length < pageSize){
                            isAddEndAll=true;
                            dataFinishIcon1All.ClassClear('none');
                        }
                    }
                    isAddDataAll=false;
                    dataAddIconAll.Class('none');
                }else{
                    $.tipShow(res.msg || '查询数据失败');
                }
            }
        });
    }

    function queryWinData(page){
        pageWin = page || pageWin + 1;
        if(isAddDataWin) return;
        isAddDataWin = true;
        $.ajax({
            url:'../api/v2/club/one_yuan/draw/list',
            isReplaceUrl:true,
            data:{
                clubId: $.$.clubID || '',
                page:pageWin,
                pageSize:pageSize
            },
            success: function (res) {
                //res = testWinData[pageWin - 1];
                if(res.statusCode == 200){
                    res = res.respData;
                    var tmpHtml = [];
                    isAddAlreadyWin = true;
                    res.forEach(function (record) {
                        if(prevClubWin != record.clubId){
                            prevClubWin = record.clubId;
                            tmpHtml.push('<div class="club-header" data-club-id="'+record.clubId+'">\
                                            <div>'+record.clubName+'</div>\
                                            <div></div>\
                                        </div>');
                        }
                        tmpHtml.push('<div class="item complete" data-status="'+record.status+'" data-club-id="'+record.clubId+'"  data-club-id="'+record.clubId+'" data-one-yuan-id="'+record.oneYuanId+'" data-user-one-yuan-id="'+record.userOneYuanId+'" data-is-draw="'+(record.drawUserId == $.$.userID)+'">\
                                        <div>\
                                            <div style="background-image: url('+(record.actImageUrl || $.$.defaultService)+')"></div>\
                                            <div>\
                                                <div>\
                                                    <div>'+record.actName+'</div>\
                                                    <div>已揭晓</div>\
                                                </div>\
                                                <div>\
                                                    <div>\
                                                        <div class="act-nums">\
                                                            <div>总需'+record.totalPaidCount+'次</div>\
                                                            <div>还剩<span>0</span></div>\
                                                        </div>\
                                                    </div>\
                                                </div>\
                                                <div>\
                                                    <div>我参与了<span>'+record.ticketCount+'</span>次</div>\
                                                    <div class="check-my-nums" data-club-id="'+record.clubId+'" data-act-name="'+record.actName+'" data-one-yuan-id="'+record.oneYuanId+'">查看我的号码</div>\
                                                </div>\
                                                <div>\
                                                    <div><div>幸运号码：</div><div>'+record.actDrawNo+'</div></div>\
                                                    <div><div>揭晓时间：</div><div>'+record.drawTime+'</div></div>\
                                                </div>\
                                            </div>\
                                        </div>\
                                    </div>');
                    });
                    //显示数据修正
                    if(page==1){
                        $winRecordsList.Html(tmpHtml.join(''));
                        if(tmpHtml.length > 0){
                            $winRecordsList.ClassClear('nullData');
                        }else{
                            $winRecordsList.Class('nullData');
                            isAddEndWin=true;
                        }
                        pageHeightWin = $winRecordsList[0].clientHeight;
                    }else{
                        $winRecordsList.Html(tmpHtml.join(''),true);
                        if(tmpHtml.length < pageSize){
                            isAddEndWin=true;
                            dataFinishIcon1Win.ClassClear('none');
                        }
                    }
                    isAddDataWin=false;
                    dataAddIconWin.Class('none');
                }else{
                    $.tipShow(res.msg || '查询数据失败');
                }
            }
        });
    }

    //滚动设置
    $allRecords.Event('scroll', function (e) {
        if(!isAddEndAll && $allRecords[0].scrollTop + $allRecords[0].clientHeight - (pageAll + agile - 1) * pageHeightAll >= 0  ){
            queryAllData();
        }
    });
    $winRecords.Event('scroll', function (e) {
        if(!isAddEndWin && $winRecords[0].scrollTop + $winRecords[0].clientHeight - (pageWin + agile - 1) * pageHeightWin >= 0  ){
            queryWinData();
        }
    });

    queryAllData(1);

    $.pageSwitch();

    switchBtns.Click(function (e, item) {
        var $item = $(item);
        if($item.ClassHave('active')) return;
        switchBtns.ClassClear();
        $item.Class('active');
        if(item.dataset.type == 'win'){
            $contentArea.Class('show-win');
            currShowType = 'win';
            if(!isAddAlreadyWin){
                queryWinData(1);
            }
        }else{
            $contentArea.ClassClear('show-win');
            currShowType = 'all';
        }
    });
    $('.content-area').Delegate('click','div.club-header', function (e, item) {
        if($.$.clubID){
            $.page('home',1,true);
        }else{
            location.href = location.origin + location.pathname + '?club=' + item.dataset.clubId;
        }
    })
      .Delegate('click','div.act-buy-btn', function (e, item) {
        if($.$.clubID){
            $.page('oneYuanDetail&oneYuanId='+item.dataset.oneYuanId);
        }else{
            location.href = location.origin + location.pathname + '?club=' + item.dataset.clubId + '#oneYuanDetail&oneYuanId=' + item.dataset.oneYuanId;
        }
    })
      .Delegate('click','div.item>div>div:nth-of-type(2)>div:nth-of-type(3)>div:nth-of-type(2)', function (e, item) {
        var oneYuanId = item.dataset.oneYuanId,actName = item.dataset.actName,nums;
        if(myNums[oneYuanId]){
            showNums(myNums[oneYuanId],actName);
        }else{
            $.eventMaskShow(true);
            $.ajax({
                url:'../api/v2/club/one_yuan/my/ticket_no',
                isReplaceUrl:true,
                data:{
                    clubId: item.dataset.clubId,
                    oneYuanId: oneYuanId
                },
                success: function (res) {
                    $.eventMaskShow(false);
                    if(res.statusCode == 200){
                        res = res.respData.split(',');
                        if(res.length > 0 && res[0]){
                            myNums[oneYuanId] = res;
                        }else{
                            myNums[oneYuanId] = [];
                        }
                        showNums(myNums[oneYuanId],actName);
                    }else{
                        $.tipShow(res.msg || '加载我的号码失败');
                    }
                },
                error: function (msg) {
                    $.eventMaskShow(false);
                }
            });
        }
    })
      .Delegate('click','.all-records div.item', function (e, item) {
          var target = e.target || e.srcElement,$target = $(target),dataset = item.dataset;
          if(!$target.ClassHave('act-buy-btn') && !$target.ClassHave('check-my-nums')){
              if($.$.clubID){
                  $.page('oneYuanDetail&oneYuanId='+dataset.oneYuanId);
              }else{
                  location.href = location.origin + location.pathname + '?club=' + dataset.clubId + '#oneYuanDetail&oneYuanId=' + dataset.oneYuanId;
              }
          }
      })
      .Delegate('click','.win-records div.item', function (e, item) {
          var target = e.target || e.srcElement,$target = $(target),dataset = item.dataset;
          if(!$target.ClassHave('act-buy-btn') && !$target.ClassHave('check-my-nums')){
              $.page('oneYuanRecordsDetail&userOneYuanId='+dataset.userOneYuanId+'&clubId='+dataset.clubId);
          }
      });

    function showNums(nums,actName){
        $('#showNumsPop>div>div:nth-of-type(1)>div:nth-of-type(1)').Text(actName);
        $('#showNumsPop>div>div:nth-of-type(2)>div:nth-of-type(1)>span').Text(nums.length);
        $('#showNumsPop>div>div:nth-of-type(2)>div:nth-of-type(2)').Text(nums.join(' '));
        $showNumsPop.Class('active');
    }
    $('#showNumsPop>div>div:nth-of-type(1)>div:nth-of-type(2)').Click(function(){
        $showNumsPop.ClassClear('active');
    });
})();