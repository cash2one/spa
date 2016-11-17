(function(){
    var techId = $.param("techId"),
        itemId = $.param("itemId"),
        payAuthCode = $.param('code') || $.getUrlParam('code') || $.$.payAuthCode,
        clubId = $.param("clubId") || $.getUrlParam('clubId') || $.$.clubID,
        oldOrderId = $.param('orderId') || $.getUrlParam('orderId'),
        oldDownPayment = $.param('downPayment') || $.getUrlParam('downPayment'),
        oldOrderCustomerName = $.param('customerName') || $.getUrlParam('customerName') || '',
        paramData = $.localStorage('con-order-param')?JSON.parse($.localStorage('con-order-param')):null,
        isCrossInner = false;        //是否对接内网
    $.$.payAuthCode = payAuthCode;
    if(paramData && payAuthCode){
        $.ajax({
            url: ($.$.clubID ? "../" : "")+"../wx/oauth2/user/openid",
            type:'post',
            data: {
                code: $.$.payAuthCode,
                scope:'snsapi_base',
                wxmp: '9358',
                userType:'user',
                state:'confirm-order'
            },
            success: function (result) {
                if (result.statusCode == 200){
                    doInitPage();
                }else if(result.statusCode == '935801'){
                    $.getOauthCode('','9358','confirm-order','base');
                }
                else {
                    $.tipShow(result.msg || "获取openId失败！");
                    return $.pageCancel();
                }
            }
        });
    }
    if((!techId && !itemId) || !clubId){
        $.pageCancel();
        return $.tipShow("地址栏参数不正确！");
    }
    if(!$.$.userToken){//未登录
        $.tipShow("请您先登录！");
        $.$.loginUrl="paidCoupon"+location.hash.split("paidCoupon")[1];
        $.page("login");
    }
    var dayListDiv = $('.day-list>div'),
        $timeListDom = $('.time-list'),
        timeListDiv = $('.time-list>div'),
        timeSelectedDiv = $('.selected-time>span'),
        confirmBtn = $('.confirm-button'),
        _timePicker = $('#_timePicker'),
        projectTimeDiv = $('#content>div:nth-of-type(4)>div:nth-of-type(4)>span'),
        _service = $('#content>div:nth-of-type(4)>div:nth-of-type(4)>span'),
        payMask = $('#payMask'),
        _seviceTimeArr = [45,60,90,120],
        curSelectTime = '',
        timesData,weeks = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'],
        days = ['今天','明天','后天'],
        fdates = [],
        allTimes = [],
        downPayment = 0,
        serviceDuration = 0,
        payAppointment,     //是否是付费预约   on：是，off：否;
        selectTimeId = '';  //内网对接时，所选时间的timeId
    if($.param("backPublic")=="true"){
        $("#title>div:nth-of-type(2)").Click(function(event){
            event.stopImmediatePropagation();
            history.back();
        });
    }
    doInitPage();
    function doInitPage(){
        $.ajax({
            url :  ($.$.clubID ? "../" : "") +"/order/appoint/view",
            data : {
                clubId : clubId, techId : techId || '', itemId : itemId || ''
            },
            success : function(data){
                if(data.statusCode != '200')  {
                    $.tipShow(data.msg || "请求数据失败！");
                    if($.localStorage('backIndex') == 3){
                        $.page('');
                        return;
                    }else{
                        return $.pageCancel();
                    }
                }
                ///////////////////////////////////////////////////////////////////////////////////////////
                var arriveTime = $('#content>div:nth-of-type(4)>div:nth-of-type(2)>span:nth-of-type(2)')[0],
                  isSubmit=false,
                  footer=$('#footer>div'),
                  contactName = $("#content>div:nth-of-type(5)>div:nth-of-type(1)>input");
                data = data.respData;
                isCrossInner = data.hasInnerProvider === 'true';
                downPayment = data.downPayment || 0;
                payAppointment = isCrossInner ? 'on' : data.payAppointment;
                /////////////////////////技师信息
                if(data["tech"]){
                    data["tech"]["avatarUrl"] = data["tech"]["avatarUrl"] || $.$.defaultHeader;
                    $("#content>div:nth-of-type(2)>div:nth-of-type(1)").CSS("backgroundImage","url('"+data["tech"]["avatarUrl"]+"')");//头像
                    $("#content>div:nth-of-type(2)>div:nth-of-type(2)>div:nth-of-type(1)").Html(data["tech"]["name"]+"<span>[<span>"+(data["tech"]["serialNo"] || '')+"</span>]</span>");//名称编号
                    $("#content>div:nth-of-type(2)>div:nth-of-type(2)>div:nth-of-type(2)").Text(data["tech"]["description"] || "这个技师很懒，没有填写个人简介...");//描述
                    $("#content>div:nth-of-type(2)>div:nth-of-type(1)>div").Class(data["tech"]["status"]);//技师状态
                    $("#content>div:nth-of-type(2)>div:nth-of-type(1)>div").Text(data['tech']['status']=='free'?'闲':'忙');
                    $("#content>div:nth-of-type(2)>div:nth-of-type(1)").Login("chat&techId="+data["tech"]["id"]+($.$.visitChannel=="9358" ? "&clubId="+data["tech"]["clubId"] : ""));
                }
                else{
                    $("#content>div:nth-of-type(2)>div:nth-of-type(1)").CSS("backgroundImage","url('"+$.$.defaultHeader+"')");//头像
                    $("#content>div:nth-of-type(2)>div:nth-of-type(1)>div").CSS("display","none");
                    $("#content>div:nth-of-type(2)>div:nth-of-type(2)>div:nth-of-type(1)").Html("技师待定");
                    $("#content>div:nth-of-type(2)>div:nth-of-type(2)>div:nth-of-type(2)").Text("到店选择技师");
                }
                //////////////////////////项目信息
                if(!data["item"]){
                    $("#content>div:nth-of-type(3)>div:nth-of-type(1)>span").Text("到店选择");
                    $("#content>div:nth-of-type(3)>div:nth-of-type(2)>span").Text("待定");
                    $('#content>div:nth-of-type(4)>div:nth-of-type(3),#content>div:nth-of-type(4)>div:nth-of-type(4)').Show();
                }
                else{
                    $("#content>div:nth-of-type(3)>div:nth-of-type(1)>span").Text(data["item"]["name"]);//预约项目名
                    $("#content>div:nth-of-type(3)>div:nth-of-type(2)>span").Text($.formatPrice(data['item']['price'],data['item']['duration'],data['item']['durationUnit']));//项目价格
                    $('#content>div:nth-of-type(4)>div:nth-of-type(3),#content>div:nth-of-type(4)>div:nth-of-type(4)').Hide();
                }

                if(oldOrderId){
                    $('#content>div:nth-of-type(6)>div>span').CSS({
                        "text-decoration": "line-through"
                    });
                    downPayment = oldDownPayment;
                    $('#content>div:nth-of-type(5)>div>input').Value(oldOrderCustomerName);
                    $('#content>div:nth-of-type(4)>div:nth-of-type(3),#content>div:nth-of-type(4)>div:nth-of-type(4)').Hide();
                }
                //if(isCrossInner) downPayment = data.item.price;
                //////////////////////////联系人 手机号码
                $("#content>div:nth-of-type(5)>div:nth-of-type(2)>span").Text($.$.userTel);

                /////////===== 付费预约 ====//////////
                if(!payAppointment || payAppointment == 'off' || downPayment <= 0){
                    $('#content>div:nth-of-type(6),#content>div:nth-of-type(7)').Hide();
                    $('#content>div:nth-of-type(5)').CSS('margin-bottom','4rem');
                }else{
                    $('#content>div:nth-of-type(6)>div>span').Text('￥'+downPayment+'元');
                }
                /////////////////////////处理预约时间
                var isActive = false,
                  timeTagArr = [];
                //timesData = [{time:[]},{time:[]},{time:[]}];
                timesData = [];
                if(isCrossInner){       //对接内网
                    //如果已无可预约时间，则隐藏 确认预约 按钮，及不再弹出时间选择窗
                    if(data['time'].length <= 0){
                        $(arriveTime).Text('无可预约时间').Class('cancel');
                        $('#footer')[0].style.display = 'none';
                    }else{
                        var tmpDays = {},tmpDate = new Date();
                        for(var n = 0;n<3;n++){
                            tmpDays[$.commonDateFormat(formatDate(tmpDate,(n==0?0:1)).currDate,'yyyy-MM-dd')] = days[n];
                        }
                        days = tmpDays;
                        data['time'].forEach(function (o, _ix) {
                            if(o.time && o.time.length>0) isActive = true;
                            timesData[o.id] = o;
                            Array.prototype.push.apply(allTimes, o.time);
                        });
                        allTimes.forEach(function (v,_ix) {
                            v.tmpFlag = v.status == 'Y'? false:true;
                            //v.status = v.status == 'Y'?'N':'Y';
                            v.status = 'Y';
                        });
                        var today = new Date(data.today),fObj;
                        today = $.commonDateFormat(today,'yyyy-MM-dd') == timesData[0].day?today:new Date(timesData[0].day.replace(/-/g,'/'));
                        for(var k = 1;k<=data['time'].length;k++){
                            fObj = formatDate(today,(k==1?0:1));
                            $(dayListDiv[k-1]).Text(days[data['time'][k-1].day]+fObj.month+'月'+fObj.day+'日');
                            $(dayListDiv[k-1]).Attr('data-index',k).Attr('data-day',k + 2 - data['time'].length);
                            fdates.push(fObj);
                        }
                        for(k=dayListDiv.length;k>data['time'].length;k--){
                            dayListDiv[k-1].style.display = 'none';
                        }
                        showTimePicker(0);
                    }
                }else{
                    data["time"].forEach(function (o,_ix) {
                        //o.time = _test[_ix];
                        if(o.time && o.time.length>0) isActive = true;
                        o.time.sort(function (a, b) {
                            return a.time - b.time;
                        });
                        timesData[o.id] = o;
                        //if(itemId){
                        Array.prototype.push.apply(allTimes, o.time);
                        //}
                    });

                    var tmpDuration = 45,_dt;
                    if(itemId){
                        var _sevItem = data['item'];
                        if(/次/g.test(_sevItem.durationUnit)){
                            tmpDuration = Number(_sevItem.duration) * 30;
                        }else if(/天/g.test(_sevItem.durationUnit)){
                            tmpDuration = Number(_sevItem.duration) * 24 * 60;
                        }else if(/时/g.test(_sevItem.durationUnit)){
                            tmpDuration = Number(_sevItem.duration)*60;
                        }else{
                            tmpDuration = Number(_sevItem.duration);
                        }
                        serviceDuration = tmpDuration;
                    }
                    _dt = Math.ceil(tmpDuration/30);
                    allTimes.forEach(function (v,_ix) {
                        if(v.status == 'N') v.tmpFlag = false;
                        else if(_ix + 1 < allTimes.length){
                            var tmpTs = allTimes.slice(_ix + 1,_ix+_dt),
                              flag = tmpTs.every(function (tmpV) {
                                  if(tmpV.status == 'N') return false;
                                  return true;
                              });
                            v.tmpFlag = flag;
                        }else{
                            v.tmpFlag = true;
                        }
                        timesData[~~(_ix/48)]['time'][_ix%48].tmpFlag = v.tmpFlag;
                    });

                    var today = new Date(data.today),fObj;
                    for(var k = 1;k<4;k++){
                        fObj = formatDate(today,(k==1?0:1));
                        $(dayListDiv[k-1]).Text(days[k-1]+fObj.month+'月'+fObj.day+'日');
                        $(dayListDiv[k-1]).Attr('data-index',k).Attr('data-day',k + 2 - data['time'].length);
                        fdates.push(fObj);
                    }
                    showTimePicker(0);
                }

                if(!isActive){
                    $('#content>div:nth-of-type(4)>div:nth-of-type(2)>span:nth-of-type(2)').Class("cancel");
                    $('#content>div:nth-of-type(4)>div:nth-of-type(2)>span:nth-of-type(2)').Text("当前无可预约时间");
                    footer.ClassClear('active');
                }

                $.pageSwitch(true,false);

                if($.localStorage("customerName") && !oldOrderId){
                    contactName.Value($.localStorage("customerName"));
                }

                //////////////////////////////////////////////
                //单击提交
                footer.Click(function(){
                    if(contactName.Value()) $.localStorage("customerName",contactName.Value());
                    if(!isSubmit){
                        if($('#content>div:nth-of-type(4)>div:nth-of-type(2)>span:nth-of-type(2)')[0].className == "cancel"){
                            return $.tipShow("当前无可预约时间！");
                        }
                        if(!footer.ClassHave('active')){
                            return $.tipShow("请选择到店时间！");
                        }
                        if(!contactName.Value()) {
                            return $.tipShow("请输入联系人姓名！");
                        }
                        payMask.Class('active');
                        if(!itemId){
                            var sdText = $('#content>div:nth-of-type(4)>div:nth-of-type(4)>span.active');
                            if(sdText.ClassHave('disabled')){
                                sdText = '0';
                            }else{
                                sdText = sdText.Text();
                            }
                            if(/小时/.test(sdText)){
                                serviceDuration = parseFloat(sdText) * 60;
                            }else{
                                serviceDuration = parseInt(sdText);
                            }
                        }
                        if(!oldOrderId){
                            if(!itemId && serviceDuration == 0){
                                payMask.ClassClear('active');
                                return $.tipShow("无项目时长，请更改到店时间。");
                            }
                            //==== 付费预约
                            if(payAppointment&&payAppointment == 'on'&&downPayment>0){
                                if(!$.$.ua.isWX){
                                    payMask.ClassClear('active');
                                    if($.checkAccessMenu('confirmOrder')){
                                      $.tipShow("请您打开微信登录'9358'公众号！");
                                    }
                                    return ;
                                }
                                if(!$.$.userToken){//未登录
                                    $.tipShow("请您先登录！");
                                    $.$.loginUrl="confirmOrder"+location.hash.split("confirmOrder")[1];
                                    $.page("login");
                                }else{
                                    isSubmit=true;
                                    footer.Class('disabled');
                                    footer.Text('预约中...');
                                    doPayCoupon($('.day-list>div.active').Attr('data-day') - 0
                                      ,arriveTime.innerHTML.slice(-5)
                                      ,downPayment
                                      ,serviceDuration);
                                }
                            }else{
                                isSubmit=true;
                                footer.Class('disabled');
                                footer.Text('预约中...');
                                //setTimeout(function () {
                                    $.ajax({
                                        url: ($.$.clubID ? "../" : "")+'/order/appoint',
                                        type:'post',
                                        data:{
                                            username : contactName.Value(),
                                            dateDay: $('.day-list>div.active').Attr('data-day') - 0 ,
                                            dateTime:arriveTime.innerHTML.slice(-5),
                                            clubId : clubId,
                                            techId : techId || '',
                                            itemId : itemId || '',
                                            orderType: payAppointment == 'on'?'paid':'appoint',
                                            downPayment:0,
                                            serviceDuration:serviceDuration,
                                            timeId: selectTimeId,               //内网对接所需的timeId
                                        },
                                        success: function (result) {
                                            isSubmit=false;
                                            footer.ClassClear('disabled');
                                            footer.Text('立即预约');
                                            if(result.statusCode=='200'){
                                                initSendMsgTech(result.respData);
                                            }
                                            else{
                                                $.tipShow(result.msg || "预约失败！");
                                                payMask.ClassClear('active');
                                            }
                                        },
                                        error:function(){
                                            $.tipShow("预约失败！");
                                            payMask.ClassClear('active');
                                            isSubmit=false;
                                            footer.ClassClear('disabled');
                                            footer.Text('立即预约');
                                        }
                                    });
                                //},3000);
                            }
                        }else{          //===修改预约时间
                            isSubmit=true;
                            footer.Class('disabled');
                            footer.Text('预约中...');
                            $.ajax({
                                url: ($.$.clubID ? "../" : "")+'/order/update_time',
                                data:{
                                    clubId : clubId,
                                    dateDay: $('.day-list>div.active').Attr('data-day') - 0 ,
                                    dateTime:arriveTime.innerHTML.slice(-5),
                                    orderId: oldOrderId,
                                    sessionType: $.$.sessionType,
                                    timeId: selectTimeId,               //内网对接所需的timeId
                                },
                                success: function (result) {
                                    isSubmit=false;
                                    footer.ClassClear('disabled');
                                    footer.Text('立即预约');
                                    if(result.statusCode=='200'){
                                        initSendMsgTech(oldOrderId);
                                    }
                                    else{
                                        $.tipShow(result.msg || "预约失败！");
                                        payMask.ClassClear('active');
                                    }
                                },
                                error:function(){
                                    $.tipShow("预约失败！");
                                    payMask.ClassClear('active');
                                    isSubmit=false;
                                    footer.ClassClear('disabled');
                                    footer.Text('立即预约');
                                }
                            });
                        }
                    }
                    else{
                        $.tipShow("正在提交，请稍候...");
                    }
                });
                if(paramData){
                    $.localStorageClear('con-order-param');
                    var _tmp = {45:1,60:2,90:3,120:4}[paramData.serviceDuration];
                    if(_tmp){
                        var _tO = $('#content>div:nth-of-type(4)>div:nth-of-type(4)>span');
                        _tO.ClassClear('cancel');
                        _tO.ClassClear('active');
                        $('#content>div:nth-of-type(4)>div:nth-of-type(4)>span:nth-of-type('+_tmp+')')[0].click();
                    }
                    arriveTime.innerHTML = paramData.arriveTime;
                    contactName[0].value = paramData.username;
                    doPayCoupon(paramData.dateDay,paramData.dateTime,paramData.downPayment,paramData.serviceDuration);
                }
                ///////////////////////////////////////////////////发送一条预约消息给技师
                function initSendMsgTech(bizId){
                    if(techId){
                        if(isCrossInner) return;
                        var eb = $.$.easemob;
                        if (!eb.conn.isOpened()) {
                            if (eb.conn.userId) {
                                var waitEasemobInit = setInterval(function(){//等待环信登录
                                    if(eb.conn.isOpened()) {
                                        clearInterval(waitEasemobInit);
                                        sendOrderMsg(bizId);
                                    }
                                },20);
                            }
                            else {//跳转到login页面
                                $.tipShow("未能获取您的账号信息，请您重新登录！");
                                return $.page("login");
                            }
                        }
                        else{
                            sendOrderMsg(bizId);
                        }
                    }
                    else{//只预约项目
                        $.page("orderDetail&id="+bizId+"&tag=submit"+($.param('backChat')?"&backChat=true":"")+($.param("backPublic")=="true" ? "&backPublic=true" : ""),0,true);//跳转到订单详情页
                    }
                }

                function sendOrderMsg(orderId){
                    if(isCrossInner) return;
                    var chatHeader = $.$.userHeader,
                      chatName =   ($.$.userName == $.$.defaultUserName ? $.$.defaultUserName + "(" + $.$.userTel.substr(0, 3) + "****" + $.$.userTel.slice(-4) + ")" : $.$.userName ),
                      orderTxt = "<span>发起预约</span><br>到店时间：<b>"+arriveTime.innerHTML+"</b><br>"+"预约项目：<b>"+(data["item"] ? data["item"]["name"] : "到店选择" )+"</b>",
                      eb = $.$.easemob;

                    //保存-存储
                    var msgObj = {
                        from: $.$.easemob.userId,
                        to: data.emchatId,
                        data: orderTxt,
                        ext: { name: data["tech"].name, header: data["tech"].avatarUrl, avatar: data["tech"].avatar, no: data["tech"].serialNo, techId: data["tech"].id, clubId: data["tech"].clubId, msgType: "order", orderId: orderId }
                    };
                    var sendFailTimer = setTimeout(function(){
                        msgObj.status = 0;
                        afterSend();
                    },5000);

                    if(eb.conn.isOpened()){
                        eb.conn.send({
                            to: data.emchatId,
                            msg: orderTxt,
                            type: "chat",
                            ext: { name: chatName, header: chatHeader, msgType: "order", orderId: orderId, time: Date.now() , avatar : $.$.userAvatar },
                            success: function(){
                                $.sendFriend(data.emchatId,payAppointment=="off" ? "order" : "paid_order");
                                clearTimeout(sendFailTimer);
                                msgObj.status = 1;
                                afterSend();
                            }
                        });
                    }

                    function afterSend(){
                        $.updateSessionList(msgObj, "text", false);
                        $.addToMsgList(msgObj, "text");

                        if(payAppointment == 'on' && downPayment>0){
                            $.page("order");
                        }else{
                            $.page("orderDetail&id="+orderId+"&tag=submit"+($.param('backChat')?"&backChat=true":"")+($.param("backPublic")=="true" ? "&backPublic=true" : ""),0,true);//跳转到订单详情页
                        }
                    }
                }
                //////////////////////////////////////////////////////////////支付的处理
                function doPayCoupon(dateDay,dateTime,downPayment,serviceDuration){
                    var paramData2 = {
                        businessChannel : 'link',
                        clubId : clubId || '',
                        dateDay:dateDay || 0,
                        dateTime:dateTime,
                        downPayment:downPayment,
                        itemId:itemId || '',
                        orderType:'paid',
                        serviceDuration:serviceDuration,
                        techId:techId || '',
                        tradeChannel:'wx',
                        username: contactName.Value(),
                        timeId:selectTimeId,            //内网对接所需的timeId
                    };
                    $.ajax({
                        url : ($.$.clubID ? "../" : "")+"../wx/pay/paid_order",
                        type : "post",
                        data : paramData2,
                        success : function(result){
                            if(result.statusCode==200){
                                result =  JSON.parse(result.respData);
                                function onBridgeReady() {
                                    WeixinJSBridge.invoke(
                                      'getBrandWCPayRequest', {
                                          "appId": result.appId,     //公众号名称，由商户传入
                                          "timeStamp": result.timeStamp+"",  //时间戳，自1970年以来的秒数
                                          "nonceStr": result.nonceStr, //随机串
                                          "package": result.package,
                                          "signType": result.signType,   //微信签名方式
                                          "paySign" : result.paySign
                                      },
                                      function (res) {
                                          if (res.err_msg.indexOf("ok")>=0) {//支付成功之后
                                              payMask.ClassClear('active');
                                              $.tipShow("支付成功！");
                                              initSendMsgTech(result.bizId);
                                          }// res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠
                                          else{
                                              payMask.ClassClear('active');
                                              $.tipShow("未能成功支付！");
                                              if(isCrossInner){
                                                  footer.ClassClear('disabled');
                                                  footer.Text('立即预约');
                                                  $.ajax({
                                                      url:($.$.clubID ? "../" : "")+"../wx/pay/delete_order",
                                                      data:{
                                                          orderId:result.bizId
                                                      },
                                                      success: function () {}
                                                  });
                                              }else{
                                                  $.page("order");
                                              }
                                          }
                                          isSubmit=false;
                                      });
                                }

                                if (typeof WeixinJSBridge == "undefined") {
                                    if (doc.addEventListener) {
                                        doc.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
                                    } else if (doc.attachEvent) {
                                        doc.attachEvent('WeixinJSBridgeReady', onBridgeReady);
                                        doc.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
                                    }
                                } else {
                                    onBridgeReady();
                                }
                            }else if(result.statusCode == '935801'){
                                paramData2.arriveTime = arriveTime.innerHTML;
                                $.localStorage('con-order-param',JSON.stringify(paramData2));
                                $.getOauthCode('','9358','confirm-order','base');
                            }
                            else{
                                $.tipShow(result.msg || "付费预约失败！");
                                isSubmit=false;
                                payMask.ClassClear('active');
                            }
                        },
                        error : function(){
                            $.tipShow('error');
                            isSubmit=false;
                            payMask.ClassClear('active');
                        }
                    })
                }
            }
        });
    }

    $('#content>div:nth-of-type(4)>div:nth-of-type(2)>span:nth-of-type(2)').Event('click', function (e, obj) {
        var $obj = $(obj);
        if($obj.ClassHave('cancel')) return;
        curSelectTime = $obj.Attr('data-time');
        var index = $obj.Attr('data-index')-1;
        index = index<0?0:index;
        dayListDiv.Index(index)[0].click();
        _timePicker.Class('active');
    });

    projectTimeDiv.Event('click', function (e,obj) {
        var $obj = $(obj);
        if($obj.ClassHave('cancel') || $obj.ClassHave('disabled')) return;
        projectTimeDiv.ClassClear('active');
        $obj.Class('active');
    });

    dayListDiv.Event('click', function (e,obj) {
        var $obj = $(obj);
        if($obj.ClassHave('active') && !curSelectTime) return;
        dayListDiv.ClassClear('active');
        $obj.Class('active');
        $('.time-list>div').ClassClear('active');
        timeSelectedDiv.Text('--:--');
        confirmBtn.Class('disabled');
        showTimePicker($obj.Attr('data-index')-1,curSelectTime);
        curSelectTime = '';
    });

    $('.time-list').Delegate('click','>div', function (e, obj) {
        var $obj = $(obj);
        if($obj.ClassHave('disabled')) return;
        $('.time-list>div').ClassClear('active');
        $obj.Class('active');
        var to = fdates[$('.day-list>div.active').Attr('data-index') - 1];
        timeSelectedDiv.Text(to.month+'月'+to.day+'日 '+weeks[to.week]+' '+$obj.Children().Index(0).Text());
        confirmBtn.ClassClear('disabled');
    });

    confirmBtn.Event('click', function (e, obj) {
        if($(obj).ClassHave('disabled')) return;
        var tmp = $('#content>div:nth-of-type(4)>div:nth-of-type(2)>span:nth-of-type(2)'),
            _active = $('.day-list>div.active'),
            _timeActive = $('.time-list>div.active');
        tmp.Text(timeSelectedDiv.Text());
        tmp.Attr('data-index',_active.Attr('data-index'));
        tmp.Attr('data-time',_active.Children().Index(0).Text());
        tmp.ClassClear('cancel');
        _timePicker.ClassClear('active');
        projectTimeDiv.ClassClear('cancel');
        $('#footer>div').Class('active');
        selectTimeId = _timeActive[0].dataset.timeId || '';
        //===== 判断时长是否可选 ====//
        var _index = (_active.Attr('data-index') - 1)*48 + (_timeActive.Attr('ix') - 0);
        if(itemId) return;      //=== 已选项目，无需判断
        _service.ClassClear('cancel');
        _service.ClassClear('disabled')
        _seviceTimeArr.every(function (v, i) {
            var _dt = Math.ceil(v/30) ,
                _tmpArr = allTimes.slice(_index+1,_index+_dt),
                disabledFlag = _tmpArr.every(function (tmpV) {
                    if(tmpV.status === 'N') return false;
                    return true;
                });
            if(!disabledFlag){
                for(var k = i,l = _service.length;k<l;k++){
                    _service.Index(k).Class('disabled');
                    if(k == 1){
                        _service.Index(0)[0].click();
                    }else{
                        _service.Index(1)[0].click();
                    }
                }
                return false;
            }
            return true;
        })
    });

    $('#_timePicker>div>div>div:nth-of-type(1)>span').Event('click', function () {
        _timePicker.ClassClear('active');
    });

    function formatDate(date,add){
        if(add){
            date.setDate(date.getDate()+add);
        }
        return {
            currDate:date,
            date:date.getTime(),
            year:date.getFullYear(),
            month:date.getMonth() + 1,
            day:date.getDate(),
            week:date.getDay()
        };
    }

    function showTimePicker(index,selected){
        if(!index || index<0) index = 0;
        $('.time-list>div').Class('disabled');
        $('.time-list>div').ClassClear('active');
        var htmlStr = [];
        $timeListDom[0].innerHTML = '';
        timesData[index]['time'].forEach(function (v, i) {
            var _class = '';
            if(v.status === 'N' || (v.status === 'Y'&& !v.tmpFlag)){
                _class = 'disabled';
            }else if(selected && selected == v.timeStr){
                _class = 'active';
            }
            if(v.timeStr){
                if(v.status === 'Y' && !v.tmpFlag){
                    htmlStr.push('<div ix="'+i+'" class="'+_class+'" data-time-id="'+(v.timeId || '')+'"><span '+(v.tmpFlag|| v.status==='N'?'':'style="display:block;"')+'>'+ v.timeStr +'</span><span '+(v.tmpFlag|| v.status==='N'?"":'style="display:none;"')+'>&#45;&#45;:&#45;&#45;</span></div>')
                }else{
                    htmlStr.push('<div ix="'+i+'" class="'+_class+'" data-time-id="'+(v.timeId || '')+'"><span >'+ v.timeStr +'</span><span >&#45;&#45;:&#45;&#45;</span></div>')
                }
            }
        });
        $timeListDom[0].innerHTML = htmlStr.join('');
        if($('.time-list>div.active').length > 0) $('.time-list>div.active')[0].click();
    }
})();