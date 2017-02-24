(function () {
    var oneYuanId = $.getUrlParam('oneYuanId',true),
      $content = $('#content'),
      listBox = $('#content>.list'),
      isAdding = false,
      page= 1,
      pageSize = 10,
      dataAddIcon=$('#loadTip'),
      dataFinishIcon=$('#finishTip'),
      dataAddEnd=false,
      pageHeight = 0,          //一页内容的高度
      agile = 0.4;     //自裁加载下页的灵敏度  值越小越灵敏（0.4表示当前面有40%的内容在可视区域时就加载下一页的数据）
    //var testData = [{"statusCode":"200","msg":"查询成功","respData":[{"userAvatarUrl":"img/header_default.jpg","userName":1,"phoneNum":"18579055596","ticketCount":5,"createdTime":"2016-11-2511:00"},{"userAvatarUrl":"img/header_default.jpg","userName":2,"phoneNum":"18579055596","ticketCount":6,"createdTime":"2016-11-2511:00"},{"userAvatarUrl":"img/header_default.jpg","userName":3,"phoneNum":"18579055596","ticketCount":7,"createdTime":"2016-11-2511:00"},{"userAvatarUrl":"img/header_default.jpg","userName":4,"phoneNum":"18579055596","ticketCount":8,"createdTime":"2016-11-2511:00"},{"userAvatarUrl":"img/header_default.jpg","userName":5,"phoneNum":"18579055596","ticketCount":9,"createdTime":"2016-11-2511:00"},{"userAvatarUrl":"img/header_default.jpg","userName":6,"phoneNum":"18579055596","ticketCount":10,"createdTime":"2016-11-2511:00"},{"userAvatarUrl":"img/header_default.jpg","userName":7,"phoneNum":"18579055596","ticketCount":11,"createdTime":"2016-11-2511:00"},{"userAvatarUrl":"img/header_default.jpg","userName":8,"phoneNum":"18579055596","ticketCount":12,"createdTime":"2016-11-2511:00"},{"userAvatarUrl":"img/header_default.jpg","userName":9,"phoneNum":"18579055596","ticketCount":13,"createdTime":"2016-11-2511:00"},{"userAvatarUrl":"img/header_default.jpg","userName":10,"phoneNum":"18579055596","ticketCount":14,"createdTime":"2016-11-2511:00"}]},{"statusCode":"200","msg":"查询成功","respData":[{"userAvatarUrl":"img/header_default.jpg","userName":11,"phoneNum":"18579055596","ticketCount":15,"createdTime":"2016-11-2511:00"},{"userAvatarUrl":"img/header_default.jpg","userName":12,"phoneNum":"18579055596","ticketCount":16,"createdTime":"2016-11-2511:00"},{"userAvatarUrl":"img/header_default.jpg","userName":13,"phoneNum":"18579055596","ticketCount":17,"createdTime":"2016-11-2511:00"},{"userAvatarUrl":"img/header_default.jpg","userName":14,"phoneNum":"18579055596","ticketCount":18,"createdTime":"2016-11-2511:00"},{"userAvatarUrl":"img/header_default.jpg","userName":15,"phoneNum":"18579055596","ticketCount":19,"createdTime":"2016-11-2511:00"},{"userAvatarUrl":"img/header_default.jpg","userName":16,"phoneNum":"18579055596","ticketCount":20,"createdTime":"2016-11-2511:00"},{"userAvatarUrl":"img/header_default.jpg","userName":17,"phoneNum":"18579055596","ticketCount":21,"createdTime":"2016-11-2511:00"},{"userAvatarUrl":"img/header_default.jpg","userName":18,"phoneNum":"18579055596","ticketCount":22,"createdTime":"2016-11-2511:00"},{"userAvatarUrl":"img/header_default.jpg","userName":19,"phoneNum":"18579055596","ticketCount":23,"createdTime":"2016-11-2511:00"},{"userAvatarUrl":"img/header_default.jpg","userName":20,"phoneNum":"18579055596","ticketCount":24,"createdTime":"2016-11-2511:00"}]},{"statusCode":"200","msg":"查询成功","respData":[{"userAvatarUrl":"img/header_default.jpg","userName":21,"phoneNum":"18579055596","ticketCount":25,"createdTime":"2016-11-2511:00"},{"userAvatarUrl":"img/header_default.jpg","userName":22,"phoneNum":"18579055596","ticketCount":26,"createdTime":"2016-11-2511:00"},{"userAvatarUrl":"img/header_default.jpg","userName":23,"phoneNum":"18579055596","ticketCount":27,"createdTime":"2016-11-2511:00"},{"userAvatarUrl":"img/header_default.jpg","userName":24,"phoneNum":"18579055596","ticketCount":28,"createdTime":"2016-11-2511:00"},{"userAvatarUrl":"img/header_default.jpg","userName":25,"phoneNum":"18579055596","ticketCount":29,"createdTime":"2016-11-2511:00"},{"userAvatarUrl":"img/header_default.jpg","userName":26,"phoneNum":"18579055596","ticketCount":30,"createdTime":"2016-11-2511:00"},{"userAvatarUrl":"img/header_default.jpg","userName":27,"phoneNum":"18579055596","ticketCount":31,"createdTime":"2016-11-2511:00"},{"userAvatarUrl":"img/header_default.jpg","userName":28,"phoneNum":"18579055596","ticketCount":32,"createdTime":"2016-11-2511:00"},{"userAvatarUrl":"img/header_default.jpg","userName":29,"phoneNum":"18579055596","ticketCount":33,"createdTime":"2016-11-2511:00"},{"userAvatarUrl":"img/header_default.jpg","userName":30,"phoneNum":"18579055596","ticketCount":34,"createdTime":"2016-11-2511:00"}]},{"statusCode":"200","msg":"查询成功","respData":[{"userAvatarUrl":"img/header_default.jpg","userName":1,"phoneNum":"18579055596","ticketCount":5,"createdTime":"2016-11-2511:00"},{"userAvatarUrl":"img/header_default.jpg","userName":2,"phoneNum":"18579055596","ticketCount":6,"createdTime":"2016-11-2511:00"},{"userAvatarUrl":"img/header_default.jpg","userName":3,"phoneNum":"18579055596","ticketCount":7,"createdTime":"2016-11-2511:00"},{"userAvatarUrl":"img/header_default.jpg","userName":4,"phoneNum":"18579055596","ticketCount":8,"createdTime":"2016-11-2511:00"},{"userAvatarUrl":"img/header_default.jpg","userName":5,"phoneNum":"18579055596","ticketCount":9,"createdTime":"2016-11-2511:00"}]}];
    if(!oneYuanId){
        $.tipShow('缺少活动ID');
        return $.pageCancel();
    }

    function queryData(newpage){
        if(isAdding)
            return;
        isAdding=true;
        page = newpage || page+1;

        //初始化提示
        dataAddIcon.ClassClear('none');
        dataFinishIcon.Class('none');
        dataAddEnd=false;
        $.ajax({
            url:'../api/v2/club/one_yuan/paid/records',
            isReplaceUrl:true,
            data:{
                clubId: $.$.clubID,
                oneYuanId: oneYuanId,
                page:page,
                pageSize:pageSize
            },
            success: function (res) {
                //res = testData[page-1] || {statusCode:200,respData:[]};
                if(res.statusCode == 200){
                    res = res.respData;
                    var tmpHtml = [];
                    res.forEach(function (record) {
                        tmpHtml.push('<div class="item">\
                                <div>\
                                    <div style="background-image: url('+( record.userAvatarUrl || $.$.defaultHeader)+')"></div>\
                                    <div>\
                                        <div>\
                                            <div>'+record.userName+'（'+record.phoneNum.replace(/^(\d{3})\d{4}(\d{4})$/g,'$1****$2')+'）</div>\
                                            <div><span>'+record.ticketCount+'</span>人次</div>\
                                        </div>\
                                        <div>'+record.createdTime+'</div>\
                                    </div>\
                                </div>\
                            </div>');
                    });
                    //显示数据修正
                    if(page==1){
                        listBox.Html(tmpHtml.join(''));
                        if(tmpHtml.length > 0){
                            listBox.ClassClear('nullData');
                        }else{
                            listBox.Class('nullData');
                            dataAddEnd=true;
                        }
                        pageHeight = $content[0].scrollHeight;
                    }else{
                        listBox.Html(tmpHtml.join(''),true);
                        if(tmpHtml.length < pageSize){
                            dataAddEnd=true;
                            dataFinishIcon.ClassClear('none');
                        }
                    }
                    //事件修正
                    isAdding=false;
                    dataAddIcon.Class('none');
                }else{
                    $.tipShow(res.msg || '查询数据失败');
                }
            }
        });
    }

    //滚动设置
    $content.Event('scroll', function (e) {
        if(!dataAddEnd && $content[0].scrollTop + $content[0].clientHeight - (page + agile - 1) * pageHeight >= 0  ){
            queryData();
        }
    });

    queryData(1);

    $.pageSwitch();
})();