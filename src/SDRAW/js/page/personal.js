(function(){
    /*************************************定义逻辑*************************************/
    var isWxUnbind = false,
        isUnbinding = false;
    if($.$.userToken){
        //设置头像、昵称、手机号码
        $('#content>div.top>div:nth-of-type(1)').CSS('backgroundImage',"url('"+ $.$.userHeader+"')");
        $('#content>div.top>div:nth-of-type(2)>div:nth-of-type(1)').Text($.$.userName);
        //========>>>>>
        //$.$.userTel = null;
        //<<<<<========
        if($.$.userTel){
            var telDiv = $('#content>div.top>div:nth-of-type(2)>div:nth-of-type(2)');
            telDiv.Text($.$.userTel);
            telDiv.ClassClear('bind-phone');
        }
        if($.$.loginChanel == '9358' && $.$.userTel){
            $.param('visitChannel','9358');
            $.ajax({
                url:($.$.clubID ? "../" : "")+'../wx/current/check_bind',
                type:'get',
                data:{},
                success: function (result) {
                    if(result.statusCode == 200){
                        if(result.msg == 'Y'){
                            initPage();
                            var telDiv = $('#content>div.top>div:nth-of-type(2)>div:nth-of-type(2)');
                            telDiv.Text($.$.userTel);
                            telDiv.ClassClear('bind-phone');

                            $.is_telphone_user = true;
                            $.localStorage('is_telphone_user',true);
                            $.cookie('is_telphone_user',true);
                            //====>>>  先隐藏此标签
                            //$('#content>div:nth-of-type(6)').ClassClear('hide');
                            //<<<====
                            $('#content>div.exit-wrap').Class('hide');
                            isWxUnbind = true;
                        }else{
                            $.is_telphone_user = false;
                            $.localStorage('is_telphone_user',false);
                            $.cookie('is_telphone_user',false);
                            //$.clearUserInfo();
                            $.$.userTel = null;
                            $.localStorageClear("userTel");
                            $.cookieClear('userTel');
                            $.cookie('isNeedIndex',1,0.0003);
                            location.reload();
                            $('#content>div.phone-wrap').Class('hide');
                            $('#content>div.exit-wrap').ClassClear('hide');
                        }
                    }else{
                        $.is_telphone_user = false;
                        $.localStorage('is_telphone_user',false);
                        $.cookie('is_telphone_user',false);
                        initPage();
                        $.tipShow(result.msg || '检查绑定状态失败。');
                    }
                }
            });
        }else{
            if($.$.userTel){
                $.ajax({
                    url:($.$.clubID ? "../" : "")+'../wx/check_bind',
                    type:'get',
                    data:{ phoneNum: $.$.userTel },
                    success: function (result) {
                        if(result.statusCode == 200){
                            if(result.respData == 1){
                                //====>>>  先隐藏此标签
                                //$('#content>div:nth-of-type(5)').ClassClear('hide');
                                //<<<====
                            }else{
                                $('#content>div.wx-wrap').Class('hide');
                            }
                        }else{
                            $.tipShow(result.msg || '检查绑定状态失败。');
                        }
                    }
                });
            }else{
                $('#content>div.exit-wrap').Class('hide');
            }
            initPage();
        }
    }
    else{
        $('#content>div.exit-wrap').CSS("display","none");
        $("#content>div.top>div:nth-of-type(1)").CSS("display","none");
        $("#content>div.top>div:nth-of-type(2)").CSS("display","none");
        $("#content>div.top>div:nth-of-type(4)").CSS("display","none");
        $("#content>div.top>div:nth-of-type(3)").CSS("display","block");
        initPage();
    }

    if($.$.visitChannel == "9358"){
        //隐藏投诉建议
        if(!$.$.clubID){
            $("#content>div.suggestion-wrap").CSS("display","none");
        }
        //隐藏关注微信
        $("#content>div.gz-wrap").CSS("display","none");
        //点击返回按钮
        /*$("#content>#title>div:nth-of-type(2)").Click(function(){
            //跳转回9358页面
            history.back();
        });*/
        //隐藏返回按钮
        $("#content>div#title>div:nth-of-type(2)").CSS("display","none");
    }
    else{
        //获取二维码图片
        $.ajax({
            url : "../api/v1/wx/club/param_qrcode",
            isReplaceUrl:true,
            data : { clubId : $.$.clubID },
            success : function(data){
                if(data.statusCode == "200"){
                    if(data.respData == "N"){
                        $.ajax({
                            url : "../api/v1/wx/club/param_qrcode",
                            isReplaceUrl:true,
                            data : { clubId : $.$.clubID },
                            success : function(data2){
                                if(data2.statusCode == "200" && data2.respData != "N"){
                                    $("#content>div.gz-wrap>div:nth-of-type(2)>img")[0].src = data2.respData;
                                }
                            }});
                    }
                    else{
                        $("#content>div.gz-wrap>div:nth-of-type(2)>img")[0].src = data.respData;
                    }
                }
            }
        });
        if($.$.ua.isWX){
            //隐藏关注微信中的文字内容
            $("#content>div.gz-wrap>div:nth-of-type(3)").CSS("display","none");
            $("#content>div.gz-wrap>div:nth-of-type(4)").CSS("display","none");
            $("#content>div.gz-wrap>div:nth-of-type(1)").CSS("display","block");
            $("#content>div.gz-wrap").CSS("padding-top","1.25rem");
        }
    }

    function initPage(){
        //单击绑定手机
        $('#content').Delegate('click','.bind-phone', function () {
            $.$.loginUrl = 'personal';
            $.bindPhone(true);
        });

        //单击积分中心
        $('#content>div.account-wrap>div:nth-of-type(2)').Click(function(){
            /*if(isWxUnbind){
                $.tipShow("请您先绑定手机号码！");
            }
            else{*/
                $.login($.$.clubID ? 'integralDetail' : 'integral');
            /*}*/
        });

        //点击我的账户
        $('#content>div.account-wrap>div:nth-of-type(1)').Click(function () {
            $.login($.$.clubID ? 'accountDetail' : 'account',false,true,true);
        });
	
        //单击优惠券
        $('#content>div.menu-wrap>div:nth-of-type(1)').Login('coupon',false,true,true);

        //单击订单
        $('#content>div.menu-wrap>div:nth-of-type(2)').Login('order',false,true,true);

        //单击收藏
        $('#content>div.menu-wrap>div:nth-of-type(3)').Login('collect');

        //单击消息
        $('#content>div.menu-wrap>div:nth-of-type(4)').Login('contacts');

        //单击投诉
        $('#content>div.suggestion-wrap').Login('suggestions');

        //单击解除微信绑定
        $('#content>div.wx-wrap').Click(function (e, item) {
            $('#unbindWxDialog').Class('active');
            isUnbinding = false;
        });

        $('#unbindWxDialog').Delegate('click','a.cancel-btn', function (e, item) {
            $('#unbindWxDialog').ClassClear('active');
        }).Delegate('click','a.sure-btn', function () {
            unbind();
        });

        //单击解除手机绑定
        $('#content>div.phone-wrap').Click(function (e, item) {
            $('#unbindPhoneDialog').Class('active');
            isUnbinding = false;
        });

        $('#unbindPhoneDialog').Delegate('click','a.cancel-btn', function (e, item) {
            $('#unbindPhoneDialog').ClassClear('active');
        }).Delegate('click','a.sure-btn', function () {
            unbind();
        });

        //点击编辑用户信息
        $("#content>div.top>div:nth-of-type(4)").Click(function(){
            $.page("info");
        });

        //点击登录
        $('#content>div.top>div:nth-of-type(3)').Click(function(){
            $.$.loginUrl = "personal";
            $.page("login");
        });

        //点击退出登录
        $('#content>div.exit-wrap').Click(function(){
            $("#confirmLogout").Class("act");
        });

        //点击'确认退出登录窗口'中的取消
        $("#confirmLogout>div>div:nth-of-type(2)>a:nth-of-type(1)").Click(function(){
            $("#confirmLogout").ClassClear("act");
        });

        //点击'确认退出登录窗口'中的确定
        $("#confirmLogout>div>div:nth-of-type(2)>a:nth-of-type(2)").Click(function(){
            $.ajax({
                url : "../api/v1/user/logout",
                isReplaceUrl:true,
                data : {},
                success : function(){
                    $('#content>div.wx-wrap,#content>div.phone-wrap').Class('hide');
                    $('#content>div.exit-wrap').CSS("display","none");
                    $("#content>div.top>div:nth-of-type(1)").CSS("display","none");
                    $("#content>div.top>div:nth-of-type(2)").CSS("display","none");
                    $("#content>div.top>div:nth-of-type(4)").CSS("display","none");
                    $("#content>div.top>div:nth-of-type(3)").CSS("display","block");
                    $("#confirmLogout").ClassClear("act");
                    $.clearUserInfo();
                }
            });
        });

        function unbind(){
            if(!isUnbinding){
                isUnbinding = true;
                $.ajax({
                    url:($.$.clubID ? "../" : "")+'../wx/current/unbind',
                    type:'post',
                    success: function (response) {
                        isUnbinding = false;
                        if(response.statusCode == 200){
                            $('#content>div.wx-wrap,#content>div.phone-wrap').Class('hide');
                            if(isWxUnbind){
                                $('#_clubMenu>div:nth-of-type(2)>div:nth-of-type(1)>i',true).Text(0);
                                $('#_clubMenu>div:nth-of-type(2)>div:nth-of-type(1)>i',true).CSS({ visibility: 'hidden' });
                                $('#_publicMenu>div:nth-of-type(2)>div:nth-of-type(1)>i',true).Text(0);
                                $('#_publicMenu>div:nth-of-type(2)>div:nth-of-type(1)>i',true).CSS({ visibility: 'hidden' });
                                var telDiv = $('#content>div.top>div:nth-of-type(2)>div:nth-of-type(2)');
                                telDiv.Text('绑定手机');
                                telDiv.Class('bind-phone');
                                $.$.userTel = null;
                                $.cookieClear('userTel');
                                $.cookieClear('userLoginName');
                                $.localStorageClear('userTel');
                                $.localStorageClear('userLoginName');

                                $.$.userToken = response.respData;
                                $.cookie('userToken',$.$.userToken);
                                $.localStorage('userToken',$.$.userToken);
                                $.localStorage('userToken_' + $.$.sessionType, $.$.userToken);

                                $.ajax({
                                    url:($.$.clubID ? "../" : "")+'../wx/current/userInfo',
                                    type:'post',
                                    success:function(resp){
                                        if(resp.statusCode == 200){
                                            $.$.userName = resp.respData.nickname || $.$.nickName;
                                            $.$.userHeader = resp.respData.avatarUrl || resp.respData.headimgurl || $.$.headerImgUrl || $.$.defaultHeader;

                                            $.$.userID = resp.respData.userId;
                                            $.cookie('userID',$.$.userID);
                                            $.localStorage('userID',$.$.userID);

                                            //重新登录环信
                                            $.$.easemob.userId = resp.respData["emchatId"];
                                            $.localStorage("easemobUserId",$.$.easemob.userId);
                                            reInitEasemob();
                                        }else{
                                            $.$.userName = $.$.nickName;
                                            $.$.userHeader = $.$.headerImgUrl || $.$.defaultHeader;
                                        }
                                        $('#content>div.top>div:nth-of-type(2)>div:nth-of-type(1)').Text($.$.userName);
                                        $('#content>div.top>div:nth-of-type(1)').CSS('background-image', 'url("'+$.$.userHeader+'")');
                                    }
                                });
                            }
                            $.tipShow('解绑成功');
                        }else{
                            $.tipShow(response.msg || '解绑失败');
                        }
                        $('#unbindWxDialog,#unbindPhoneDialog').ClassClear('active');
                    }
                });
            }else{
                $.tipShow('正在解绑...');
            }
        }

        function reInitEasemob(){
            var eb = $.$.easemob, delay = false;
            if(!eb.conn.isClosed()){//退出重新登录
                delay = true;
                eb.conn.stopHeartBeat(eb.conn);
                eb.conn.close();
                eb.currChatTech = {};
                eb.sessionList = null;
                eb.msgList = {};
            }
            setTimeout(function(){
                eb.conn.open({ user : eb.userId, pwd : eb.userId, appKey : eb.appKey });
            },(delay ? 500 : 1));
        }

        $.pageSwitch();

        ///获取账户及积分系统开关状态
        if($.$.clubID){
            $.ajax({
                url : "../api/v2/user/switches",
                isReplaceUrl : true,
                data : {
                    clubId : $.$.clubID
                },
                success : function(switchRes){
                    if(switchRes.statusCode == 200){
                        switchRes = JSON.parse(JSON.stringify(switchRes.respData).replace(/"on"/g,1).replace(/"off"/g,0));
                        if(switchRes.account.switch){
                            $("#content>div.account-wrap>div:nth-of-type(1)").ClassClear("hide");
                        }
                        if(switchRes.credit.systemSwitch & switchRes.credit.clubSwitch){
                            $("#content>div.account-wrap>div:nth-of-type(2)").ClassClear("hide");
                        }
                    }
                }
            });
        }
        else{
            $("#content>div.account-wrap>div:nth-of-type(1)").ClassClear("hide");
            $("#content>div.account-wrap>div:nth-of-type(2)").ClassClear("hide");
        }
    }
})();