(function () {
    /*************************************定义常用变量*************************************/
    var tel = $("#register-tel"),
        authcode = $("#register-authCode"),
        authcodeBtn = $("#register-authCode-btn"),
        password = $("#register-password"),
        footer=$("#register-btn"),
        verify=[0,0,0],
        inRequest=false,
        loginInfo=window['loginInfo'],
        tip = $("#content>div>div:nth-of-type(3)"),
        isBindWeixin = false,
        paramData = $.localStorage('user-register-param') ? JSON.parse($.localStorage('user-register-param')) : null,
        payAuthCode = $.param('code') || $.getUrlParam('code') || $.$.payAuthCode;
        $.$.payAuthCode = payAuthCode;
        $.$.authCode = payAuthCode;

    if($.$.ua.isWX && (!$.$.authCode || $.getUrlParam('state') != '9358_login')){
        $.getOauthCode('','9358','9358_login','base');
        return;
    }

    /*************************************加载数据*************************************/
    if(loginInfo){
        tel[0].value= loginInfo.username;
        if(loginInfo.password && loginInfo.code){
            authcode[0].value = loginInfo.code;
            password[0].value = loginInfo.password;
        }
        delete window['loginInfo'];
        verify[0]=true;
        check();
    }
    /*************************************定义逻辑*************************************/
    //验证函数
    function check(){
        if(verify[0]&&verify[1]&&verify[2]) footer.Class('active');
        else footer.ClassClear('active');
        verify[0] ? tip.CSS("display","none") : tip.CSS("display","block");
    }
    //输入电话号码
    tel.Verify('tel',function(ok){
        verify[0]=ok;
        check();
    });
    //输入验证码
    authcode.Verify('authcode',function(ok){
        verify[1]=ok;
        check();
    });
    //输入密码
    password.Verify('password',function(ok){
        verify[2] = ok;
        check();
    });

    //发送验证码
    authcodeBtn.Event('click',function(e,item) {
        if(authcodeBtn.ClassHave('disabled') || authcodeBtn.ClassHave('pause')){//无法发送验证码
            return;
        }
        if(!verify[0]) return $.tipShow("请输入正确的手机号码！");

        //验证是否已经注册
        $.ajax({
            url: '../api/v1/user/checkLoginName',
			isReplaceUrl:true,
            type: 'post',
            data: {
                loginName: tel.Value()
            },
            success: function (res) {
                if (res.toString() == "1")
                    return $.tipShow("该用户已经注册了！");

                authcodeBtn.Class('pause');
                authcodeBtn.Text("重新发送(60s)");
                var count = 60,
                    repeatCount,
                    sendInterval = setInterval(function(){
                        if(--count == 0) {
                            clearInterval(sendInterval);
                            repeatCount = authcodeBtn.Attr("data-repeat-count")-1;
                            authcodeBtn.Attr("data-repeat-count",repeatCount);
                            authcodeBtn.ClassClear('pause');
                            authcodeBtn.Text("获取验证码");
                            if(repeatCount == 0) authcodeBtn.Class('disabled');
                        }
                        else{
                            authcodeBtn.Text("重新发送("+count+"s)");
                        }
                    },1000);
                $.ajax({
                    url: '../api/v1/icode',
					isReplaceUrl:true,
                    type: 'get',
                    data: { mobile: tel.Value() }
                });
            }
        });
    });
    //点击注册按钮
    footer.Click(function(){
        if(footer.ClassHave('active') && !inRequest){
            inRequest = true;
            $.ajax({//先检查用户名是否存在
                url: '../api/v1/user/checkLoginName',
				        isReplaceUrl:true,
                type: 'post',
                data: { loginName : tel.Value() },
                success: function (res) {
                    if(res.toString() != "1"){
                        var param = {
                            mobile: tel.Value(),
                            code : authcode.Value(),
                            password: password.Value(),
                            clubId: $.$.clubID,
                            chanel: $.$.sessionType,
                            openId: $.$.openId || "",
                            wxNickName: $.$.nickName || "",
                            wxHeadimgurl : $.$.headerImgUrl || '',
                            clubCode : $.$.clubInviteCode || '',
                            techInviteCode : ($.$.techInviteCode || ''),
                            auth2code : payAuthCode || '',
                            isBindWeixin : isBindWeixin?'Y':'N'
                        };
                        $.ajax({ //注册
                            url: '../api/v1/user/register',
                            isReplaceUrl:true,
                            type: 'post',
                            data: param,
                            success: function (result) {
                                if(result.status == 200){
                                    $.$.userToken = result['token'];
                                    $.$.userID = result['userId'];
                                    $.$.userHeader = result['avatarUrl'] || $.$.defaultHeader;
                                    $.$.userTel = result['phoneNum'];
                                    $.$.userName = result['name'];
                                    $.$.userLoginName = result['loginName'];
                                    $.cookie('userToken', $.$.userToken, 30);
                                    $.cookie('userID', $.$.userID, 30);
                                    $.cookie('userHeader', $.$.userHeader, 30);
                                    $.cookie('userTel', $.$.userTel, 30);
                                    $.cookie('userName', $.$.userName, 30);
                                    $.cookie('userLoginName', $.$.userLoginName, 30);
                                    $.localStorage('userToken',$.$.userToken);
                                    $.localStorage('userID',$.$.userID);
                                    $.localStorage('userHeader',$.$.userHeader);
                                    $.localStorage('userTel',$.$.userTel);
                                    $.localStorage('userName',$.$.userName);
                                    $.localStorage('userLoginName',$.$.userLoginName);
                                    $.tipShow("注册成功！");

                                    var eb = $.$.easemob;
                                    eb.userId = result["emchatId"];
                                    $.localStorage("easemobUserId",eb.userId);
                                    if(paramData.oldUserId && paramData.oldUserId !=$.$.userID ){/////切换新账户
                                        $.localStorage('easemobSecondUserId',paramData.oldChatId);
                                        eb.secondUserId = paramData.oldChatId;
                                        $.switchUserChatInfo(paramData.oldUserId,$.$.userID);
                                    }

                                    initEasemob();
                                }else if(result.statusCode == '935801'){
                                    $.localStorage('user-register-param',JSON.stringify(param));
                                    $.getOauthCode('','9358','9358_login','base');
                                }
                                inRequest=false;
                            },
                            error : function(errorRes){
                                if(errorRes == "系统异常,请稍后重试"){
                                    $.tipShow("验证码不正确！");
                                }
                                inRequest = false;
                            }
                        });
                    }else{
                        $.tipShow("该用户已注册！");
                        inRequest=false;
                    }
                }
            });
        }
    });

    if(paramData && paramData.username){
        tel[0].value= paramData.username;
        verify[0]=true;
        isBindWeixin = paramData.isBindWeixin;
        if(paramData.password){
            password[0].value = paramData.password;
            verify[2]=true;
            authcode[0].value = paramData.code;
            verify[1]=true;
            check();
            $.localStorageClear('user-register-param');
            footer[0].click();
        }else{
            check();
        }
    }

    function initEasemob(){
        var eb = $.$.easemob, delay = false;
        if(!eb.conn.isClosed()){//退出重新登录
            delay = true;
            eb.conn.stopHeartBeat(eb.conn);
            eb.conn.close();
            eb.currChatTech = {};
            eb.sessionList = null;
            eb.msgList = {};
        }
        ////延时一段时间，目的是等conn关闭
        setTimeout(function(){
            $.createEasemobConn(0);

            if(eb.secondUserId){ //旧账号登录
                $.createEasemobConn(1);
            }
            $.$.loginUrl ? $.page($.$.loginUrl,-1,true) : $.page("home",-1,true);
        },(delay ? 500 : 1));
    }

    //点击登录
    $("#register-login-link").Page();
    //执行页面切换
    $.pageSwitch(true,false);
})();