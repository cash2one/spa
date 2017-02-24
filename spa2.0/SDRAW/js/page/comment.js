(function(){
    //FastClick.attach(document.body);
    var orderId=$.param('orderId') || $.param("id"),
        techId = $.param('techId'),
        type=$.param('type'),
        techInfo,
        commentId = $.param('commentId') || '',
        clubId,
        isScan = $.getUrlParam('isScan',true) == '1';     //是否是扫评论二维码进入此页面的
    $.$.payAuthCode = $.param("code") || $.getUrlParam('code') || $.$.payAuthCode;
    $.paramClear('commentId');
    if($.$.ua.isWX){
        //隐藏关注微信中的文字内容
        $("#content>div>div:nth-of-type(5)>div:nth-of-type(3)").CSS("display","none");
        $("#content>div>div:nth-of-type(5)>div:nth-of-type(4)").CSS("display","none");
        $("#content>div>div:nth-of-type(5)>div:nth-of-type(1)").CSS("display","block");
        $("#content>div>div:nth-of-type(5)").CSS("padding-top","1.25rem");
    }
    if(isScan){
        $('.service-level>div:nth-of-type(2)>div:nth-of-type(2)>div:nth-of-type(5),.service-level>div:nth-of-type(2)>div:nth-of-type(2)>div:nth-of-type(6)').ClassClear('hide');
    }
    $.ajax({
        url: ($.$.clubID ? "../" : "") + '/impression/list',
        data: {},
        success: function (response) {
            if(response.statusCode != 200){
                $.tipShow(response.msg || '查询印象标签数据出错');
            }
            var _listHtml = [],
                _listIndexs = {};
            response.respData.forEach(function (v,_i) {
                _listHtml.push('<div>'+v.tag+'</div>');
                _listIndexs[v.tag] = _i;
            });
            $('.comment-labels').Html(_listHtml.join(''));
            $.ajax({
                url: ($.$.clubID ? "../" : "")+'/shared/technician',
                data:{
                    id: orderId || techId,
                    type:type,
                    commentId: commentId
                },
                success:function(data){
                    if(data['statusCode'] != 200){
                        $.tipShow(data['msg'] || '数据获取失败！');
                        return $.pageCancel();
                    }
                    data = data.respData;
                    techInfo = data['tech'];
                    /*************************************定义常用变量*************************************/
                    var starValues = [100,100,100,100],
                      starTexts = [['非常差','很差','一般','很好','非常好'],['非常严重','很严重','一般','无偷钟','认真负责']],
                      starTextObjs = [
                          $('.service-level>div:nth-of-type(2)>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type(3)'),
                          $('.service-level>div:nth-of-type(2)>div:nth-of-type(2)>div:nth-of-type(2)>div:nth-of-type(3)'),
                          $('.service-level>div:nth-of-type(2)>div:nth-of-type(2)>div:nth-of-type(3)>div:nth-of-type(3)'),
                          $('.service-level>div:nth-of-type(2)>div:nth-of-type(2)>div:nth-of-type(4)>div:nth-of-type(3)'),
                          $('.service-level>div:nth-of-type(2)>div:nth-of-type(2)>div:nth-of-type(5)>div:nth-of-type(3)'),
                          $('.service-level>div:nth-of-type(2)>div:nth-of-type(2)>div:nth-of-type(6)>div:nth-of-type(3)')
                      ],
                      selectedLabels = [],
                      $textArea = $('div.comment-text>textarea'),
                      $textareaPlaceholder = $('div.comment-text>span');
                    var orderType=data['allow'],
                      footer=$('#commentFooter>div>div:nth-of-type(2)'),
                      isAnonymous = $('#commentFooter>div>div:nth-of-type(1)'),
                      isSubmit=false;
                    /*************************************加载数据*************************************/
                    $('.service-level>div:nth-of-type(1)>div:nth-of-type(2)>div:nth-of-type(1)').CSS('backgroundImage','url("' + (data['tech']['avatarUrl']|| $.$.defaultHeader) + '")');
                    $('.service-level>div:nth-of-type(1)>div:nth-of-type(2)>div:nth-of-type(2)>div:nth-of-type(1)').Text(data['tech']['name']|| $.$.defaultTechName);
                    if(data['tech']['serialNo']){
                        $('.service-level>div:nth-of-type(1)>div:nth-of-type(2)>div:nth-of-type(2)>div:nth-of-type(2)').Text(data['tech']['serialNo']);
                    }else{
                        $('.service-level>div:nth-of-type(1)>div:nth-of-type(2)>div:nth-of-type(2)>div:nth-of-type(2)').Hide();
                    }

                    $('#commentFooter>div>div:nth-of-type(2)').Class('active');
                    /*************************************定义逻辑*************************************/
                    clubId = data['tech']['clubId'];
                    techId = data['tech']['id'];
                    if($.$.visitChannel == "9358") {
                        $("#content>div>div:nth-of-type(5)").CSS("display","none");
                    }else{
                        //获取二维码图片
                        $.ajax({
                            url : "../api/v1/wx/club/param_qrcode",
                            isReplaceUrl:true,
                            data : { clubId : clubId },
                            success : function(data){
                                if(data.statusCode == "200"){
                                    if(data.respData == 'N'){//重新发送请求
                                        $.ajax({
                                            url : "../api/v1/wx/club/param_qrcode",
											                      isReplaceUrl:true,
                                            data : { clubId : clubId },
                                            success : function(data2){
                                                if(data2.statusCode == "200" && data2.respData != "N"){
                                                    $("#content>div>div:nth-of-type(5)>div:nth-of-type(2)>img")[0].src = data2.respData;
                                                }
                                            }});
                                    }
                                    else{
                                        $("#content>div>div:nth-of-type(5)>div:nth-of-type(2)>img")[0].src = data.respData;
                                    }
                                }
                            }
                        });
                    }
                    //点击技师
                    $('.service-level>div:nth-of-type(1)>div:nth-of-type(2)').Page('technicianDetail&id='+ data['tech']['id']);
                    //点击评分
                    function starFunc(e,item){
                        var v=Math.ceil(e.offsetX/item.clientWidth/0.2),
                          _index = item.dataset.index,
                          _child = $(item).Children();
                        if(!v || v<1) v=1;
                        starValues[_index] = v*20;

                        _child[0].style.width = starValues[_index]+'%';
                        starTextObjs[_index].Text(starTexts[_index==3?1:0][v-1]);
                    }
                    $('.service-level>div:nth-of-type(2)>div:nth-of-type(2)>div').Delegate('click','>div:nth-of-type(2)',starFunc,false,'__star_click_event__');
                    //$('.comment-stars>div').Click(starFunc,'__star_click_event__');
                    //$('.service-level>div:nth-of-type(2)>div:nth-of-type(2)>div>div:nth-of-type(2)').EventRemove('click',starFunc,false,'__star_click_event__');
                    //点击印象标签
                    function removeLabelsFromArray(label){
                        var _index = 0;
                        selectedLabels.every(function (obj, i) {
                            if(obj.Text() == label){
                                _index = i;
                                return false;
                            }
                            return true;
                        })
                        selectedLabels.splice(_index,1);
                    }
                    function labelsFunc(e,item){
                        var $item = $(item);
                        if($item.ClassHave('active')){
                            $item.ClassClear('active');
                            removeLabelsFromArray($item.Text());
                        }else{
                            $item.Class('active');
                            if(selectedLabels.length > 0 && selectedLabels.length == 3) selectedLabels.shift().ClassClear('active');
                            selectedLabels.push($item);
                        }
                    }
                    $('.comment-labels').Delegate('click','>div',labelsFunc,false,'__labels_click_event__');
                    //$('.comment-labels').EventRemove('click',labelsFunc,false,'__labels_click_event__');
                    //文本域
                    $textArea.Event('focus', function (e) {
                        $textareaPlaceholder.Class('none');
                        $('#content')[0].scrollTop = 20.444 * $.$.scale * 16;
                    });
                    $textArea.Event('blur', function (e) {
                        if($textArea.Value().length == 0){
                            $textareaPlaceholder.ClassClear('none');
                        }
                    });

                    if(orderType==0){
                        $('#content>div>div:nth-of-type(2)').Class('none');
                    }else if(orderType == 1){
                        $('#content>div>div:nth-of-type(2)').ClassClear('none');
                        $("#content>div>div:nth-of-type(5)").CSS("display","none");
                        //=== 移除绑定事件 ===
                        $('.service-level>div:nth-of-type(2)>div:nth-of-type(2)>div>div:nth-of-type(2)').EventRemove('click',starFunc,false,'__star_click_event__');
                        $('.comment-labels').EventRemove('click',labelsFunc,false,'__labels_click_event__');
                        $textArea.Value(data.comment.comment+' ');
                        $textArea.Attr('readonly','readonly');
                        $textareaPlaceholder.Hide();
                        $('div.comment-text>div').Hide();
                        $('#commentFooter').Hide();

                        var _starRates = $('.comment-stars>div').Children();
                        starValues = [data.comment.attitudeRate,data.comment.appearanceRate,data.comment.skillRate,data.comment.clockRate];
                        starValues.forEach(function (v, i) {
                            if(v<20) v=20;
                            starValues[i] = v;
                            _starRates[i].style.width = v+'%';
                            starTextObjs[i].Text(starTexts[i<3?0:1][Math.ceil(v/20)-1]);
                        });

                        var _impressionArr = data.comment.impression.split('、'),
                            _impressionDom = $('.comment-labels>div');
                        _impressionArr.forEach(function (v, i) {
                            _impressionDom.Index(_listIndexs[v]).Class('active');
                        });

                        $textArea.Event('focus', function (e,item) {
                            item.blur();
                        });

                        if(!data.comment.comment){
                            $('.comment-text').Hide();
                        }
                    }

                    //点击匿名提交
                    isAnonymous.Click(function (e, item) {
                        if(isAnonymous.ClassHave('checked')){
                            isAnonymous.ClassClear('checked');
                        }else{
                            isAnonymous.Class('checked');
                        }
                    });

                    //点击提交
                    footer.Click(function(){
                        if(footer.ClassHave('active') ) {
                            if(!isSubmit){
                                if (orderType == 0) {
                                    isSubmit=true;
                                    /*if(isScan){
                                        //==== 对会所的评价
                                        $.ajax({
                                            url : "../../profile/user/feedback/create",
                                            type : "post",
                                            data : {
                                                "clubId" : $.$.clubID,
                                                "environmentalScore" : $('div.service-level>div:nth-of-type(2)>div:nth-of-type(2)>div:nth-of-type(5)>div:nth-of-type(2)>div')[0].style.width.slice(0,-1) || 100,
                                                "serviceScore" : $('div.service-level>div:nth-of-type(2)>div:nth-of-type(2)>div:nth-of-type(6)>div:nth-of-type(2)>div')[0].style.width.slice(0,-1) || 100,
                                                "comments" : ''
                                            },
                                            success : function(){
                                            }
                                        });
                                    }*/

                                    footer.Class('disabled');
                                    footer.Text('提交中...');
                                    var contentStr = $textArea.Value();
                                    if(contentStr && contentStr.length>200) contentStr = contentStr.substr(0,200);
                                    //setTimeout(function () {
                                        $.ajax({
                                            url: ($.$.clubID ? "../" : "")+'/user/comment/create',
                                            data: {
                                                id: orderId || techId,
                                                type: isScan ? 'tech_qrcode':type,
                                                attitudeRate : starValues[0],
                                                appearanceRate :starValues[1],
                                                skillRate : starValues[2],
                                                clockRate : starValues[3],
                                                impression : (function () {
                                                    var _tmp = [];
                                                    selectedLabels.forEach(function (v) {
                                                        _tmp.push(v.Text());
                                                    })
                                                    return _tmp.join('、')
                                                })(),
                                                comment: encodeURIComponent(contentStr),
                                                isAnonymous: isAnonymous.ClassHave('checked')?'Y':'N'
                                            },
                                            type:'post',
                                            success: function (response) {
                                                if(response.statusCode == '200'){
                                                    //$.sessionStorage('order_submitID',orderId);
                                                    //$.sessionStorage('order_submitStar',JSON.stringify(starValues));
                                                    //$.sessionStorage('order_submitStr',contentStr);
                                                    isSubmit=false;
                                                    orderType=1;
                                                    footer.ClassClear('disabled');
                                                    footer.Text('提交');
                                                    $('#content>div>div:nth-of-type(2)').ClassClear('none');
                                                    $("#content>div>div:nth-of-type(5)").CSS("display","none");
                                                    //=== 移除绑定事件 ===
                                                    $('.service-level>div:nth-of-type(2)>div:nth-of-type(2)>div').EventRemove('click',starFunc,false,'__star_click_event__');
                                                    $('.comment-labels').EventRemove('click',labelsFunc,false,'__labels_click_event__');
                                                    if($textArea.Value() == ''){
                                                        $textArea.Value(' ');
                                                        $('.comment-text').Hide();
                                                    }
                                                    $textArea.Attr('readonly','readonly');
                                                    $textareaPlaceholder.Hide();
                                                    $('div.comment-text>div').Hide();
                                                    $('#commentFooter').Hide();

                                                    $textArea.Event('focus', function (e,item) {
                                                        item.blur();
                                                    });
                                                    $('#content')[0].scrollTop = 0;
                                                    //=== 评论数加1 ===
                                                    /*var comCount = $('#content>div>div:nth-of-type(3)>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type(2)>div:nth-of-type(2)');
                                                    comCount.Text((parseInt(comCount.Text())+1)+'评论');*/

                                                    if($.$.ua.isWX){
                                                        commentId = response.respData;
                                                        $.param('commentId',commentId);
                                                        $.page("techReward&isAnonymous="+(isAnonymous.ClassHave('checked')?'Y':'N')+"&techId=" + techId  + (commentId?"&commentId=" + commentId:"")  );
                                                    }
                                                }else if(response.statusCode == '412'){
                                                    $.tipShow(response.msg || '您今天已经评论过该技师了');
                                                    if($.param("from")=="fastPay"){
                                                        setTimeout(function(){
                                                            $.$.afterReward = true;
                                                            if(!$.$.afterRewardInfo){
                                                                $.$.afterRewardInfo = {}
                                                            }
                                                            $.$.afterRewardInfo['avatarUrl'] = techInfo.avatarUrl;
                                                            $.$.afterRewardInfo['name'] = techInfo.name;
                                                            $.$.afterRewardInfo['clubName'] = "";
                                                            $.page("home");
                                                        },500)
                                                    } else {
                                                        $.page();
                                                    }
                                                }else{
                                                    isSubmit=false;
                                                    footer.ClassClear('disabled');
                                                    footer.Text('提交');
                                                    $.tipShow(response.msg || '评论出错');
                                                }
                                            },
                                            error:function(){
                                                isSubmit=false;
                                                footer.ClassClear('disabled');
                                                footer.Text('提交');
                                            }
                                        });
                                    //},3000);

                                }else{
                                    $.tipShow('此评论已提交。');
                                }
                            }else{
                                $.tipShow('正在提交评论，请稍候...');
                            }
                        }
                    });

                    //执行页面切换
                    $.pageSwitch(true,false);
                }
            });
        }
    });
})();