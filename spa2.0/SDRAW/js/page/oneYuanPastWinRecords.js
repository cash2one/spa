(function () {
    var oneYuanBaseId = $.getUrlParam('oneYuanBaseId',true);
    if(!oneYuanBaseId){
        $.tipShow('缺少活动ID');
        return $.pageCancel();
    }
    //var testData = {"statusCode":"200","msg":"F","respData":[{"currentPeriod":1,"createdTime":"2016-11-2511:00","userAvatarUrl":"img/header_default.jpg","userName":1001,"ticketCount":5,"drawNo":102},{"currentPeriod":2,"createdTime":"2016-11-2511:00","userAvatarUrl":"img/header_default.jpg","userName":1002,"ticketCount":6,"drawNo":103},{"currentPeriod":3,"createdTime":"2016-11-2511:00","userAvatarUrl":"img/header_default.jpg","userName":1003,"ticketCount":7,"drawNo":104},{"currentPeriod":4,"createdTime":"2016-11-2511:00","userAvatarUrl":"img/header_default.jpg","userName":1004,"ticketCount":8,"drawNo":105},{"currentPeriod":5,"createdTime":"2016-11-2511:00","userAvatarUrl":"img/header_default.jpg","userName":1005,"ticketCount":9,"drawNo":106},{"currentPeriod":6,"createdTime":"2016-11-2511:00","userAvatarUrl":"img/header_default.jpg","userName":1006,"ticketCount":10,"drawNo":107},{"currentPeriod":7,"createdTime":"2016-11-2511:00","userAvatarUrl":"img/header_default.jpg","userName":1007,"ticketCount":11,"drawNo":108},{"currentPeriod":8,"createdTime":"2016-11-2511:00","userAvatarUrl":"img/header_default.jpg","userName":1008,"ticketCount":12,"drawNo":109},{"currentPeriod":9,"createdTime":"2016-11-2511:00","userAvatarUrl":"img/header_default.jpg","userName":1009,"ticketCount":13,"drawNo":110},{"currentPeriod":10,"createdTime":"2016-11-2511:00","userAvatarUrl":"img/header_default.jpg","userName":1010,"ticketCount":14,"drawNo":111},{"currentPeriod":11,"createdTime":"2016-11-2511:00","userAvatarUrl":"img/header_default.jpg","userName":1011,"ticketCount":15,"drawNo":112},{"currentPeriod":12,"createdTime":"2016-11-2511:00","userAvatarUrl":"img/header_default.jpg","userName":1012,"ticketCount":16,"drawNo":113},{"currentPeriod":13,"createdTime":"2016-11-2511:00","userAvatarUrl":"img/header_default.jpg","userName":1013,"ticketCount":17,"drawNo":114},{"currentPeriod":14,"createdTime":"2016-11-2511:00","userAvatarUrl":"img/header_default.jpg","userName":1014,"ticketCount":18,"drawNo":115},{"currentPeriod":15,"createdTime":"2016-11-2511:00","userAvatarUrl":"img/header_default.jpg","userName":1015,"ticketCount":19,"drawNo":116},{"currentPeriod":16,"createdTime":"2016-11-2511:00","userAvatarUrl":"img/header_default.jpg","userName":1016,"ticketCount":20,"drawNo":117},{"currentPeriod":17,"createdTime":"2016-11-2511:00","userAvatarUrl":"img/header_default.jpg","userName":1017,"ticketCount":21,"drawNo":118},{"currentPeriod":18,"createdTime":"2016-11-2511:00","userAvatarUrl":"img/header_default.jpg","userName":1018,"ticketCount":22,"drawNo":119},{"currentPeriod":19,"createdTime":"2016-11-2511:00","userAvatarUrl":"img/header_default.jpg","userName":1019,"ticketCount":23,"drawNo":120}]};
    $.ajax({
        url: '../api/v2/club/one_yuan/draw/records',
        isReplaceUrl: true,
        data: {
            clubId: $.$.clubID,
            oneYuanBaseId: oneYuanBaseId
        },
        success: function (res) {
            //res = testData;
            if(res.statusCode == 200){
                res = res.respData;
                var tmpHtml = [];
                res.forEach(function (record) {
                    tmpHtml.push('<div class="item">\
                        <div>第'+ record.currentPeriod +'期 （揭晓时间：'+ record.createdTime +'）</div>\
                        <div>\
                            <div style="background-image: url('+( record.userAvatarUrl || $.$.defaultHeader )+')"></div>\
                            <div>\
                                <div>获奖者：<span>'+record.userName+'</span></div>\
                                <div>参与次数：<span>'+record.ticketCount+'</span><span>次</span></div>\
                                <div>中将号码：<span>'+ record.actDrawNo +'</span></div>\
                            </div>\
                        </div>\
                    </div>');
                });
                if(tmpHtml.length > 0){
                    $('#content>div:nth-of-type(2)').Html(tmpHtml.join(''));
                    $('#finishTip').ClassClear('none');
                }else{
                    $('#content>div:nth-of-type(2)').Class('nullData');
                }
                $('#loadTip').Class('none');
            }
        }
    });
    $.pageSwitch();
})();