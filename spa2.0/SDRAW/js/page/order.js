(function(){
    $.tipShow('Test',0,true);
    /*************************************定义常用变量*************************************/
    var str = '',
        listID=JSON.parse($.sessionStorage('order_ID')||'{}'),
        i,
        dataLength,
        processClass,
        isAddData=false,
        page= 1,
        dataAddIcon=$('#loadTip'),
        dataFinishIcon=$('#finishTip'),
        dataAddEnd=($.sessionStorage('order_end')||'false')=='true',
        listBox=$('#content>div>div:nth-of-type(2)'),
        content$=$('#content'),
        payMask = $('#payMask'),
        reAppointDlg = $('#reAppointDlg'),
        contentYTop= $.sessionStorage('order_top'),
        contentPage= $.sessionStorage('order_page'),
        contentData= $.sessionStorage('order_data'),
        telDetail = $('#telDetail'),
        tels = {},
        unpaidDatas = ($.sessionStorage('unpaidDatas')?JSON.parse($.sessionStorage('unpaidDatas')):0) || {},
        tel,
        isOperating = false,
        statusObj = {
            "unpaid" :{ "tag":"unpaid", "name":'待支付'},
           "submit" : { "tag" : "fail" , "name" : "待接受"},
           "accept" : { "tag" : "normal" , "name" : "已接受"},
           "cancel" : { "tag" : "fail" , "name" : "取消"},
           "reject" : { "tag" : "fail" , "name" : "拒接"},
           "complete" : { "tag" : "normal" , "name" : "完成"},
           "failure" : { "tag" : "fail" , "name" : "失效"},
           "overtime" : { "tag" : "fail" , "name" : "超时"},
            "refund" : { "tag" : "refund" , "name" : "退款中"},
            "refunded" : { "tag" : "refunded" , "name" : "退款完成"},
            "refundfailure" : { "tag" : "refunded" , "name" : "退款失败"},
            "error" : { "tag" : "error" , "name" : "下单失败"},
            expire:{ "tag" : "expire" , "name" : "过期"},
            process:{ "tag" : "process" , "name" : "付款处理中"}
        },
        paramData = $.localStorage('order-list-param')?JSON.parse($.localStorage('order-list-param')):null,
        payAuthCode = $.param("code") || $.getUrlParam("code") || $.$.payAuthCode,
        inPaid=false,
        prePayId,
        pageHeight = $.sessionStorage('order_page_height') || 0,          //一页内容的高度
        pageSize = 10,
        agile = 0.4;     //自裁加载下页的灵敏度  值越小越灵敏（0.4表示当前面有40%的内容在可视区域时就加载下一页的数据）
    $.$.payAuthCode = payAuthCode;
    /*************************************加载数据*************************************/
    /*************************************定义逻辑*************************************/
    function addData(newpage,callback){
        if(isAddData)
            return;
        isAddData=true;
        page=newpage||page+1;

        //初始化提示
        dataAddIcon.ClassClear('none');
        dataFinishIcon.Class('none');
        dataAddEnd=false;

        //开始加载数据
        $.ajax({
            url: ($.$.clubID ? "../" : "")+'../profile/user/order/list',
            data:{
                token : $.$.userToken,
                clubId : $.$.clubID,
                page : page,
                pageSize : pageSize
            },
            success: function (data) {
                data = (data.statusCode != '200') ? [] : data['respData'];
                if(page==1) listID={};
                for (i = 0,str='',dataLength=data.length; i < dataLength; i++) {
                    if(!statusObj[data[i]["status"]]){
                        console.warn('已忽略：未定义的订单状态：',data[i]["status"],'; 订单ID:',data[i]['id']);
                        continue;
                    }
		                if(listID[data[i]['id']])
                        continue;
                    else
                        listID[data[i]['id']]=1;

                    if(data[i]['refundStatus']){
                        data[i]['status'] = data[i]['refundStatus']
                    }

                    if(/^(reject|sysReject|failure)$/.test(data[i]["status"])){
                        processClass='failure'
                    }else
                        processClass=data[i]["status"];
                    //<div "+($.$.visitChannel=="9358" ? "" : "style='disrejectplay:none'" )+">"+data[i]["clubName"]+"</div>\
                    str +=
                        "<div orderId='"+data[i]["id"]+"' clubId='"+data[i]["clubId"]+"' techid='"+(data[i]["techId"] || '')
                        +"' itemid='"+(data[i]["serviceItemId"] || '')
                        +"' downPayment='"+(data[i]["downPayment"] || 0)
                        +"' customerName='"+(data[i]["customerName"] || '')
                        +"' tradeYear='"+(data[i]['createdAt'].match(/^(\d{4})/g)[0])+"'>\
                            <div >"+data[i]["clubName"]+"<span>"+(data[i]['downPayment']>0?("￥"+data[i]['downPayment']+"元"):"")+"</span><span>"+statusObj[data[i]["status"]]["name"]+"</span></div>\
                            <div>\
                                <div>选择技师<span>"+(data[i]["techId"] ? data[i]["techName"]+"<span>编号 [<strong>"+(data[i]["techSerialNo"] || "")+"</strong>]</span></span>" : "到店安排</span>")+"</div> \
                                <div>选择项目<span>"+(data[i]["serviceItemName"] || "到店选择")+"</span></div>\
                                <div>到店时间<span>"+(date2FullDate(data[i]["appointTime"]) || '')+"</span></div>";
                    /*if(data[i]["status"] == "complete" && data[i]["techId"] && data[i]["commented"]=="N"){
                        str +="<a orderId='"+data[i]["id"]+"'>评论</a>"
                    }*/
                    //str += "<div style='display:none;'><img src='https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=gQHW8DoAAAAAAAAAASxodHRwOi8vd2VpeGluLnFxLmNvbS9xL28wbmo2a0RsQW05N0V0aDVoV0ZrAAIE6oJJVgMEAAAAAA=='/><div>预约号：32877642</div></div></div>";
                    var isPaid = data[i].orderType == 'paid' ||  data[i].orderType == 'paid_full',
                        isCrossInner = !!data[i].innerProvider;
                    switch (data[i]['status']){     //根据状态显示不同的按钮
                        case 'unpaid':{
                            str += "</div>";
                            if(isPaid){
                                str +="<a orderId='"+data[i]["id"]+"' class='paid'>支付</a>";
                                //console.log(data[i]);
                                unpaidDatas[data[i]['id']] = data[i];
                            }
                        }break;
                        case 'submit':{
                            if(isPaid) {
                                str += "<div style='display:none;'><img src='" + data[i].qrCodeUrl + "'/><div></div></div></div>";
                            }else{
                                str += '</div>';
                            }
                            str +="<a class='reminder'>催单</a>";
                            if(isPaid && !isCrossInner){
                                str +="<span class='expandBtn'>展开</span>";
                            }
                        }break;
                        case 'accept':{ /////已接受的情况下显示预约号，其他状态下不显示
                            if(isPaid && !isCrossInner){
                                str += "<div style='display:none;'><img src='"+data[i].qrCodeUrl+"'/><div>预约号："+data[i].orderNo+"</div></div></div>";
                            }else{
                                str += '</div>';
                            }
                            str +="<a class='inquiries'>问询</a>";
                            if(isPaid && !isCrossInner){
                                str +="<span class='expandBtn'>展开</span>";
                            }
                        }break;
                        case 'complete':{
                            if(isPaid && !isCrossInner){
                                str += "<div style='display:none;'><img src='"+data[i].qrCodeUrl+"'/><div></div></div></div>";
                            }else{
                                str += '</div>';
                            }
                            if(data[i]["techId"] && data[i]["commented"]=="N")
                                str +="<a orderId='"+data[i]["id"]+"' class='comment'>点评</a>";
                            if(isPaid && !isCrossInner){
                                str +="<span class='expandBtn'>展开</span>";
                            }
                        }break;
                        case 'refundfailure':
                        case 'reject':
                        //case 'failure':
                        case 'overtime':{
                            str += "</div>";
                            if(isPaid) {
                                str += "<a orderId='" + data[i]["id"] + "' class='refund'>退款</a>";
                                unpaidDatas[data[i]['id']] = data[i];
                            }
                        }break;
                        case 'refund':{
                            str += "</div>";
                            if(isPaid)
                                str +="<a orderId='"+data[i]["id"]+"' class='refunded'>查询</a>"
                        }break;
                        case 'error':{
                            str += "</div><a orderId='" + data[i]["id"] + "' class='reAppoint'>预约</a>";
                            if(isPaid && !isCrossInner) {
                                str += "<a orderId='" + data[i]["id"] + "' class='refund'>退款</a>";
                                unpaidDatas[data[i]['id']] = data[i];
                            }
                        }break;
                        case 'cancel':
                        case 'refunded':
                        case 'failure':
                        case 'expire':
                        case 'process':
                        default:{
                            str += "</div>";
                        }break;
                    }
                    str+= "</div>";

                    if(data[i]['status'] == 'error' && reAppointDlg.ClassHave('hide')){
                        +function (tn){
                            setTimeout(function () {
                                var _tx = $('#reAppointDlg>div>p:nth-of-type(2)'),
                                    _txStr = _tx.Html().replace(/\{\d+\}/g, function () {
                                        return tn['techName'];
                                    });
                                $('#reAppointDlg>div>p:nth-of-type(2)')[0].innerHTML =_txStr;

                                $('#reAppointDlg>div>div>div:nth-of-type(2)').Attr('orderid',tn['id']);

                                reAppointDlg.ClassClear('hide');
                                $.hideOrderMenu();
                            },100);
                        }(data[i]);
                    }
                }
                //显示数据修正
                if(page==1){
                    listBox.Html(str);
                    if(str){
                        listBox.ClassClear('nullData');
                    }else{
                        listBox.Class('nullData');
                        dataAddEnd=true;
                    }
                    pageHeight = listBox[0].scrollHeight;
                }else{
                    listBox.Html(str,true);
                    if(dataLength < pageSize){
                        dataAddEnd=true;
                        dataFinishIcon.ClassClear('none');
                    }
                }
                //事件修正
                setListClick();
                isAddData=false;
                dataAddIcon.Class('none');
                if(callback)
                    callback();
            }
        });
    }

    /**
     * 将  明天 19:00  这样的时间格式化为 明天 ( 04-26 ) 19:00
     * @param dt
     */
    function date2FullDate(dt){
        if(/^\d{2}:\d{2}$/g.test(dt)){
            dt = '今天 '+dt;
        }
        if(/今天|明天|后天|大后天/.test(dt)){
            var start = new Date();
            dt = dt.split(' ');
            var addDay ={"今天":0,"明天":1,"后天":2,"大后天":3};
            start.setDate(start.getDate() + addDay[dt[0]] || 0);
            return dt[0]+ ' ( ' + (start.getMonth()<9?'0'+(start.getMonth() + 1):(start.getMonth() + 1)) + '-' + (start.getDate() <= 9 ? "0"+start.getDate():start.getDate()) + ' ) ' + dt[1];
        }else{
            return dt;
        }
    }

    /**
     * 将  明天 19:00  这样的时间格式化为 YYYY-MM-DD HH:mm
     * @param start
     * @param dt
     */
    function dateFormat(dt, start){
        if(/今天|明天|后天|大后天/.test(dt)){
            start = start || new Date();
            dt = dt.split(' ');
            var addDay ={"今天":0,"明天":1,"后天":2,"大后天":3};
            start.setDate(start.getDate() + addDay[dt[0]] || 0);
            return (start.getMonth() + 1) + '月' + (start.getDate() <= 9 ? "0"+start.getDate():start.getDate()) + '日 ' + dt[1];
        }else if(/^\d{2}:\d{2}$/g.test(dt)){
            start = new Date();
            return (start.getMonth() + 1) + '月' + (start.getDate() <= 9 ? "0"+start.getDate():start.getDate()) + '日 ' + dt;
        }else{
            return dt;
        }
    }

    function saveCache(){
        $.sessionStorage('order_data',listBox.Html());
        $.sessionStorage('order_page',page);
        $.sessionStorage('order_page_height',pageHeight);
        $.sessionStorage('order_end',dataAddEnd);
        $.sessionStorage('order_ID',JSON.stringify(listID));
        $.sessionStorage('order_top',content$[0].scrollTop);
        $.sessionStorage('unpaidDatas',JSON.stringify(unpaidDatas));
    }

    function setListClick(){
        $('#content>div>div:nth-of-type(2)>div>div:nth-of-type(1),#content>div>div:nth-of-type(2)>div>div:nth-of-type(2)>div',true).Event("click",function(e,item){
            saveCache();
            $.page("orderDetail&id="+(item.parentNode.getAttribute("orderId")||item.parentNode.parentNode.getAttribute("orderId")));
        });
    }

    //////////////////////////////////////////////////////////////支付的处理
    function showMask(){
        payMask.Class('active');
        $.hideOrderMenu();
    }
    function hideMask(){
        payMask.ClassClear('active');
        $.showOrderMenu();
    }

    function doPayCoupon(data){
        saveCache();
        var paramData2 = {
            bizId : data.id,
            sessionType : $.$.sessionType,
            token: $.$.userToken,
            openId:$.$.payOpenId,
            clubId: data.clubId,
            businessChannel : 'link',
            tradeChannel:'wx',
            downPayment:data.downPayment
        };
        if(!inPaid){
            inPaid=true;
            $.ajax({
                url : ($.$.clubID ? "../" : "")+"../wx/pay/paid_order_immediately",
                type : "post",
                data : paramData2,
                success : function(result){
                    if(result.statusCode==200){
                        result =  JSON.parse(result.respData);
                        prePayId = result.package.split("=")[1];
                        hideMask();
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
                                    inPaid = false;
                                    if (res.err_msg.indexOf("ok")>=0) {//支付成功之后
                                        $.tipShow("支付成功！");
                                        $('div[orderid="'+data.id+'"][tradeyear] > div:nth-of-type(1) > span:nth-of-type(2)').Text('付款处理中');
                                        $('div[orderid="'+data.id+'"][tradeyear] > a.paid[orderid="'+data.id+'"]').Class('hide');
                                        $.ajax({
                                            url: ($.$.clubID ? "../" : "") + "../profile/user/order/view",
                                            data: {id: data.id},
                                            success: function (response) {
                                                if(response.statusCode == 200){
                                                    response = response.respData.order;
                                                    if(response.status == 'submit'){
                                                        var item$ = $('div[orderid="'+data.id+'"][tradeyear]'),dv = document.createElement('div'),
                                                            aa$ = $('div[orderid="'+data.id+'"][tradeyear] > a.paid[orderid="'+data.id+'"]'),
                                                            span = document.createElement('span');
                                                        dv.style.display = 'none';
                                                        dv.innerHTML = '<img src="'+response.qrCodeUrl+'" /><div>'+(response.orderNo ? '预约号：'+response.orderNo:'')+'</div>';
                                                        item$.Children().Index(1)[0].appendChild(dv);

                                                        span.classList.add('expandBtn');
                                                        span.innerHTML = '展开';
                                                        item$[0].appendChild(span);
                                                        $('div[orderid="'+data.id+'"][tradeyear] > div:nth-of-type(1) > span:nth-of-type(2)').Text(statusObj[response.status].name);
                                                        aa$.ClassClear('paid');
                                                        aa$.Class('reminder');
                                                        aa$.ClassClear('hide');
                                                        aa$.Text('催单');
                                                    }else if(response.status == 'error'){
                                                        var item$ = $('div[orderid="'+data.id+'"][tradeyear]'),
                                                            aa$ = $('div[orderid="'+data.id+'"][tradeyear] > a.paid[orderid="'+data.id+'"]'),
                                                            newA = document.createElement('a');
                                                        newA.className = 'refund';
                                                        newA.textContent = '退款';
                                                        item$[0].appendChild(newA);

                                                        $('div[orderid="'+data.id+'"][tradeyear] > div:nth-of-type(1) > span:nth-of-type(2)').Text(statusObj[response.status].name);
                                                        aa$.ClassClear('paid');
                                                        aa$.Class('reAppoint');
                                                        aa$.Text('预约');
                                                        aa$.ClassClear('hide');
                                                        var _tx = $('#reAppointDlg>div>p:nth-of-type(2)'),
                                                            _txStr = _tx.Html().replace(/\{\d+\}/g, function () {
                                                                return response['techName'];
                                                            });
                                                        $('#reAppointDlg>div>p:nth-of-type(2)')[0].innerHTML =_txStr;
                                                        $('#reAppointDlg>div>div>div:nth-of-type(2)').Attr('orderid',response['id']);
                                                        reAppointDlg.ClassClear('hide');
                                                        $.hideOrderMenu();
                                                    }
                                                }else{
                                                    $.tipShow(response.msg);
                                                    location.href = location.href;
                                                }
                                            }
                                        });

                                        ///////////////////////////
                                        var eb = $.$.easemob;
                                        if (eb.userId && !eb.conn.isOpened()) {
                                            var waitEasemobInit = setInterval(function () {//等待环信登录
                                                if (eb.conn.isOpened()) {
                                                    clearInterval(waitEasemobInit);
                                                    sendOrderMsg(data);
                                                }
                                            }, 10);
                                        }
                                        else {
                                            sendOrderMsg(data);
                                        }
                                    }// res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠
                                    else{
                                        $.tipShow("未能成功支付！");
                                        inPaid=false;
                                    }
                                    hideMask();
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
                        saveCache();
                        $.localStorage('order-list-param',JSON.stringify(paramData2));
                        $.getOauthCode('&targetid='+paramData2.bizId,'9358','order-list','base');
                    }
                    else{
                        hideMask();
                        $.tipShow(result.msg || "支付预约请求失败！");
                        inPaid=false;
                    }
                },
                error : function(){
                    hideMask();
                    inPaid = false;
                }
            })
        }
    }

    function sendOrderMsg(data){
        var chatHeader = $.$.userHeader,
            chatName = ($.$.userName == $.$.defaultUserName ? $.$.defaultUserName + "(" + $.$.userTel.substr(0, 3) + "****" + $.$.userTel.slice(-4) + ")" : $.$.userName ),
            orderTxt = "<span>发起预约</span><br>到店时间：<b>"+dateFormat(data.appointTime)+"</b><br>"+"预约项目：<b>"+(data["serviceItemId"] ? data["serviceItemName"] : "到店选择" )+"</b>",
            orderId = data.id,
            eb = $.$.easemob;
        $.ajax({
            url: ($.$.clubID ? "../" : "") + '/technician/' + data.techId,
            success: function (data) {
				var emchatId = data.emchatId;
                data = data.info;
                //保存-存储
                var msgObj = {
                    from: $.$.easemob.userId,
                    to: emchatId,
                    data: orderTxt,
                    ext: { name: data.name, header: data.avatarUrl, avatar: data.avatar, no: data.serialNo, techId: data.id, clubId: data.clubId, msgType: "order", orderId: orderId }
                };
                var sendFailTimer = setTimeout(function(){
                    msgObj.status = 0;
                    $.updateSessionList(msgObj, "text", false);
                    $.addToMsgList(msgObj, "text");
                },5000);

                if(eb.conn.isOpened()){
                    eb.conn.send({
                        to: emchatId,
                        msg: orderTxt,
                        type: "chat",
                        ext: { name: chatName, header: chatHeader, msgType: "order", orderId: orderId, time: Date.now() , avatar : $.$.userAvatar },
                        success: function(){
							$.sendFriend(emchatId,"business_process");
                            clearTimeout(sendFailTimer);
                            msgObj.status = 1;
                            $.updateSessionList(msgObj, "text", false);
                            $.addToMsgList(msgObj, "text");
                        }
                    });
                }
            }
        });
    }

    //========  联系电话   ==========
    function showTel(telStr){
        if(!telStr) return $.tipShow('暂无服务电话');
        var _tels = [],telStr = telStr.split(',');
        telStr.forEach(function (v, i) {
            _tels.push('<div>'+v+'</div>');
        });
        _tels.push('<div>取消</div>');
        telDetail.Children().Index(0).Html(_tels.join(''));
        telDetail.Class('active');
        $.hideOrderMenu();
    }

    //支付，点评等按钮的事件绑定
    $('#content').Delegate('click','.paid:not(.disabled)', function (e,obj) {
        var orderId = $(obj).Attr('orderid'), orderData = unpaidDatas[orderId];
        if(!$.$.ua.isWX){
			if($.checkAccessMenu('order')){
				$.tipShow("请您打开微信登录'9358'公众号！")
			}
            return ;
        }
        if(!$.$.userToken){//未登录
            $.tipShow("请您先登录！");
            $.$.loginUrl="order"+location.hash.split("order")[1];
            $.page("login");
        }
        else{
            if(payAuthCode){
                showMask();
                doPayCoupon(orderData);
            }
            else if($.$.sessionType=="9358"){
                doPayCoupon(orderData);
            }
            else {//判定token是否有效
                $.sessionStorage('order_data',listBox.Html());
                $.sessionStorage('order_page',page);
                $.sessionStorage('order_page_height',pageHeight);
                $.sessionStorage('order_end',dataAddEnd);
                $.sessionStorage('order_ID',JSON.stringify(listID));
                $.sessionStorage('order_top',content$[0].scrollTop);
                $.sessionStorage('unpaidDatas',JSON.stringify(unpaidDatas));
                $.ajax({
                    url : "../api/v1/check_login/"+ $.$.sessionType+"/"+ $.$.userToken,
                    isReplaceUrl:true,
                    success : function(res){
                        if(res.msg=="Y"){
                            ////////////////////////////////////////请求微信授权
                            $.getOauthCode('&targetid='+orderId,'9358','order-list','base');
                        }
                        else{ //无效的token，跳转到登录
                            $.tipShow("请您先登录！");
                            $.$.loginUrl="order"+location.hash.split("order")[1];
                            $.page("login");
                        }
                    }
                });
            }
        }
    }).Delegate('click','.reminder', function (e, obj) {
        var $p = $(obj.parentNode);
        if(tels[$p.Attr('clubid')]){
            showTel(tels[$p.Attr('clubid')]);
        }else{
            $.ajax({
                url:($.$.clubID ? "../" : "")+"../club/"+$p.Attr('clubid')+"/clubName",
                type:'get',
                data:{},
                success: function (response) {
                    tels[$p.Attr('clubid')] = response.telephone;
                    showTel(response.telephone)
                }
            });
        }
    }).Delegate('click','.inquiries', function (e, obj) {
        var $obj = $(obj),$parent = $(obj.parentNode),
            techId = $parent.Attr('techId');
        if(techId){
            $.sessionStorage('order_data',listBox.Html());
            $.sessionStorage('order_page',page);
            $.sessionStorage('order_page_height',pageHeight);
            $.sessionStorage('order_end',dataAddEnd);
            $.sessionStorage('order_ID',JSON.stringify(listID));
            $.sessionStorage('order_top',content$[0].scrollTop);
            $.page("chat&techId="+techId+($.$.visitChannel=="9358" ? "&clubId="+$parent.Attr('clubId') : ""));
        }else{
            var $p = $(obj.parentNode);
            if(tels[$p.Attr('clubid')]){
                showTel(tels[$p.Attr('clubid')]);
                $.hideOrderMenu();
            }else{
                $.ajax({
                    url:($.$.clubID ? "../" : "")+"../club/"+$p.Attr('clubid')+"/clubName",
                    type:'get',
                    data:{},
                    success: function (response) {
                        tels[$p.Attr('clubid')] = response.telephone;
                        showTel(response.telephone);
                        $.hideOrderMenu();
                    }
                });
            }
        }
    }).Delegate('click','.comment', function (e, obj) {
        saveCache();
        $.page("orderDetail&id="+(obj.parentNode.getAttribute("orderId")||obj.parentNode.parentNode.getAttribute("orderId")));
    }).Delegate('click','.refund', function (e, obj) {
        var $parent = $(obj.parentNode);
        if(!isOperating){
            isOperating = true;
            $.ajax({
                url : ($.$.clubID ? "../" : "")+"../wx/pay/refund/applyfor",
                type : "post",
                data : {
                    bizId:$parent.Attr('orderid'),
                    businessChannel : 'link',
                    clubId :$parent.Attr('clubid'),
                    tradeChannel:'wx',
                    tradeYear: ($parent.Attr('tradeyear') || new Date().getFullYear() ),
                    userId : $.$.userID
                },
                success: function (result) {
                    isOperating = false;
                    if(result.statusCode == 200){
                        $.hideOrderMenu();
                        $('#refundDialog>div>p:nth-of-type(2)').Text('您的退款申请已提交，退款将在3个工作日内退回支付账号。');
                        $('#refundDialog').ClassClear('hide');

                        var item$ = $('div[orderid="'+$parent.Attr('orderid')+'"][tradeyear]'),
                            aa$ = $('div[orderid="'+$parent.Attr('orderid')+'"][tradeyear] > a.refund[orderid="'+$parent.Attr('orderid')+'"]');
                        $('div[orderid="'+$parent.Attr('orderid')+'"][tradeyear] > div:nth-of-type(1) > span:nth-of-type(2)').Text(statusObj['refund'].name);
                        aa$.ClassClear('refund');
                        aa$.Class('refunded');
                        aa$.Text('查询');
                    }else{
                        $.tipShow(result.msg || '退款不成功，请重试！');
                    }
                },
                error: function () {
                    isOperating = false;
                    $.tipShow('error');
                }
            });
        }
    }).Delegate('click','.refunded', function (e, obj) {
        var $parent = $(obj.parentNode);
        if(!isOperating){
            isOperating = true;
            $.ajax({
                url : ($.$.clubID ? "../" : "")+"../wx/pay/refund/applyfor",
                type : "post",
                data : {
                    bizId:$parent.Attr('orderid'),
                    businessChannel : 'link',
                    clubId : $parent.Attr('clubid'),
                    tradeChannel:'wx',
                    tradeYear: ($parent.Attr('tradeyear') || 2016),
                    userId : $.$.userID
                },
                success: function (result) {
                    isOperating = false;
                    if(result.statusCode == 200){
                        $('#refundDialog>div>p:nth-of-type(2)').Text(result.msg);
                        $('#refundDialog').ClassClear('hide');
                        $.hideOrderMenu();
                        //$.tipShow(result.msg || '查询失败，请重试！');
                    }else{
                        $.tipShow(result.msg || '查询失败，请重试！');
                    }
                },
                error: function () {
                    isOperating = false;
                    $.tipShow('error');
                }
            });
        }
    }).Delegate('click','.expandBtn', function (e, obj) {
        var $obj = $(obj),o = obj;
        while(o.tagName != 'DIV'){
            o = o.previousSibling;
        }
        o = $(o).Children().Index(3)
        if($obj.ClassHave('expand')){
            $obj.ClassClear('expand');
            $obj.Text('展开');
            o.CSS({
                display:"none"
            });
        }else{
            $obj.Class('expand');
            $obj.Text('收起');
            o.CSS({
                display:"block"
            });
        }
    }).Delegate('click','.reAppoint', function (e, obj) {
        var $parent = $(obj.parentNode),
            url = '&orderId='+ $parent.Attr('orderid')
                +'&clubId='+$parent.Attr('clubid')
                +'&downPayment='+$parent.Attr('downpayment')
                +'&customerName='+encodeURIComponent($parent.Attr('customername'));
        if($parent.Attr('itemid')){
            url+='&itemId='+$parent.Attr('itemid');
        }
        if($parent.Attr('techid')){
            url+='&techId='+$parent.Attr('techid');
        }
        $.page('confirmOrder'+url);
    });

    telDetail.Event('touchmove',function(e){
        e.preventDefault();
    },false);
    telDetail.Click(function(e,item){
        if(e.target==item){
            telDetail.ClassClear("active");
            $.showOrderMenu();
        }
    });
    //拨号
    telDetail.Delegate('click','>div>div:not(:last-child)', function (e, item) {
        location.href='tel:'+item.innerHTML;
    }).Delegate('click','>div>div:last-child', function (e, item) {
        telDetail.ClassClear("active");
        $.showOrderMenu();
    });

    $('#refundDialog>div>div').Event('click', function () {
        $('#refundDialog').Class('hide');
        $.showOrderMenu();
    });
    $('#refundDialog').Event('touchmove', function (e) {
        e.preventDefault();
    });

    payMask.Event('click', function (e) {
        e.preventDefault();
    });
    payMask.Event('touchmove', function (e) {
        e.preventDefault();
    });

    $('#reAppointDlg>div>div>div:nth-of-type(1)').Event('click',function (e, item) {
        reAppointDlg.Class('hide');
        $.showOrderMenu();
    });
    $('#reAppointDlg>div>div>div:nth-of-type(2)').Event('click',function (e, item) {
        var orderId = $(item).Attr('orderid');
        $('#content>div>div:nth-of-type(2)>div[orderid="'+orderId+'"] .reAppoint')[0].click();
        $.showOrderMenu();
    });

    //滚动设置
    content$.Event('scroll', function (e) {
        if(!dataAddEnd && content$[0].scrollTop + content$[0].clientHeight - (page + agile - 1) * pageHeight >= 0  ){
            addData();
        }
    });

    //缓存加载
    if(contentData){
        page=parseInt(contentPage);
        listBox.Html(contentData);
        var submit=$.sessionStorage('order_submitID');
        if(submit){
            var dom=$('div[orderId="'+submit+'"]');
            if(dom.length==1 && dom[0].children[1].children.length==4){
                dom[0].children[1].children[3].style.display="none";
            }
        }
        setTimeout(function () {
            content$[0].scrollTop = contentYTop;
        },1);
        setListClick();
        if(dataAddEnd)
            dataFinishIcon.ClassClear('none');
        if(payAuthCode && $.param("targetid")){///////////////////////////////////////发起支付
            $('.paid[orderid="'+$.param("targetid")+'"]')[0].click();
            setTimeout(function(){ $.pageSwitch(); },1000);
        }else
            $.pageSwitch();
    }else
        addData(1,function(){
            $.pageSwitch();
        });
    $.sessionStorageClear('order_ID');
    $.sessionStorageClear('order_data');
    $.sessionStorageClear('order_end');
    $.sessionStorageClear('order_top');
    $.sessionStorageClear('order_page');
    $.sessionStorageClear('order_submitID');
    $.sessionStorageClear('order_submitStr');
    $.sessionStorageClear('order_page_height');       //一页内容的高度
    $.sessionStorageClear('unpaidDatas');

    if(paramData && payAuthCode){
        $.ajax({
            url: ($.$.clubID ? "../" : "")+"../wx/oauth2/user/openid",
			      type:'post',
            data: {
                code: $.$.payAuthCode,
                scope:'snsapi_base',
                wxmp: '9358',
                userType:'user',
                state:'order-list'
            },
            success: function (result) {
                if (result.statusCode == 200){
                    $.localStorageClear('order-list-param');
                    //console.log(paramData);
                    doPayCoupon({
                        id:paramData.bizId,
                        downPayment:paramData.downPayment,
                        clubId:paramData.clubId
                    });
                }else if(result.statusCode == '935801'){
                    $.getOauthCode('&targetid='+paramData.bizId,'9358','order-list','base');
                }
                else {
                    $.tipShow(result.msg || "获取openId失败！");
                    return $.pageCancel();
                }
            }
        });
    }
})();