(function(){
    var oneYuanId = $.getUrlParam('oneYuanId',true)
      ,$numArea = $('#content>div>div:nth-of-type(4)>div:nth-of-type(2)')
      ,$expand = $('#content>div>div:nth-of-type(4)>div:nth-of-type(3)')
      ,$sharePop = $('#share-activity-pop')
      ,actInfo = $.localStorage('tmpOneYuanNums_cache')?JSON.parse($.localStorage('tmpOneYuanNums_cache')) : {nums:''}
      ,nums = actInfo.nums;

    if(!oneYuanId && !nums){
        $.tipShow('缺少必要参数：ID');
        return $.page('home',-1,true);
    }
    if(nums && oneYuanId == actInfo.oneYuanId){
        nums = nums.split(',');
        handleNums();
    }else{
        $.ajax({
            url:'../api/v2/club/one_yuan/my/ticket_no',
            isReplaceUrl:true,
            data:{
                oneYuanId: oneYuanId,
                clubId: $.$.clubID
            },
            success: function (result) {
                if(result.statusCode == 200){
                    nums = result.respData.split(',');
                    handleNums();
                }else{
                    $.tipShow(result.msg || '');
                }
            }
        });
    }

    $.pageSwitch(false);

    //设置微信分享
    function setWXShare(){
        $.X5Config({
            title: '谁替我买单', //分享标题
            desc: '我和你只有一块钱的距离,点我立即参与', // 分享描述
            link: actInfo.shareUrl, // 分享链接
            imgUrl: actInfo.shareImage, //分享图标
            success: function (){
                $sharePop.ClassClear('active');
                /*$.ajax({
                 url:'../api/v2/plumflower/share',
                 type:'post',
                 isReplaceUrl:true,
                 data:{
                 id:data.plumFloweActivity.id,
                 shareCode: shareCode || '',
                 topShareCode: $.getUrlParam('topShareCode') || '',
                 chanel: $.getUrlParam('chanel')
                 },
                 success: function () {

                 }
                 });*/
            },
            cancel: function () {
                //用户取消分享后执行的回调函数
            },
            fail: function (res) {
                $.tipShow("分享失败！请刷新页面后再试！");
                $.ajax({
                    url:'../api/v2/user/share/info',
                    isReplaceUrl:true,
                    type:'post',
                    token:'null',
                    data:{
                        url:encodeURIComponent(location.href),
                        browser: encodeURIComponent($.$.ua.value),
                        message:encodeURIComponent(JSON.stringify(res||{}))
                    },
                    error:function(){}
                });
            }
        });
    }


    if($.$.ua.isWX){
        setWXShare();
    }

    $('div#title>div:nth-of-type(2)').Click(function (e) {
        e.stopImmediatePropagation();
        $.page('home',-1,true);
    });

    $('#content>div>div:nth-of-type(2)').Page('home',-1,true);
    $('#content>div>div:nth-of-type(2)>div:nth-of-type(1)').CSS('background-image','url('+ $.$.clubLogo +')');
    $('#content>div>div:nth-of-type(2)>div:nth-of-type(2)').Text($.$.clubName);

    $('#content>div>div:nth-of-type(5)>a').Login('oneYuanRecords');

    //分享
    $('#content>div>div:nth-of-type(3)>div:nth-of-type(4)>a').Click(function (e, item) {
        $sharePop.Class('active');
    });
    $sharePop.Click(function (e, item) {
        $sharePop.ClassClear('active');
    });

    function concatNums(nums,isShowAll){
        if(!nums) return '';
        nums = nums.slice(0);
        isShowAll = isShowAll ? Math.ceil(nums.length/10) : 3;
        var tmpArr = [];
        while (isShowAll > 0 && nums.length > 0){
            tmpArr.push(nums.splice(0,10).join(' '));     //一行显示10个
            isShowAll --;
        }
        return '<div>'+tmpArr.join('</div><div>')+'</div>';
    }

    function handleNums(){
        if(nums.length > 0 && nums[0]){
            if(nums.length > 30){
                $expand.ClassClear('hide');
                $expand.Click(function (e, item) {
                    var $item = $(item);
                    if($item.ClassHave('expanded')){
                        $item.ClassClear('expanded');
                        $numArea.Html(concatNums(nums));
                    }else{
                        $item.Class('expanded');
                        $numArea.Html(concatNums(nums,true));
                    }
                });
            }else{
                $expand.Class('hide');
            }
            $numArea.Html(concatNums(nums));
            $('#content>div>div:nth-of-type(4)').ClassClear('null-data');
        }
    }

})();