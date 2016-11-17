(function () {
    /*************************************定义常用变量*************************************/
    var tel = $("#login-tel"),
        password = $("#login-password"),
        footer=$("#login-btn"),
        verify=[0,0],
        tip = $("#content>div>div:nth-of-type(3)"),
        isBindWeixin = false,
        paramData = $.localStorage('con-login-param') ? JSON.parse($.localStorage('con-login-param')) : window['loginInfo'],
        payAuthCode = $.param('code') || $.getUrlParam('code') || $.$.payAuthCode;

    $.$.payAuthCode = payAuthCode;
    if($.$.ua.isWX && (!payAuthCode || $.getUrlParam('state') != '9358_login')){
        $.getOauthCode('','9358','9358_login','base');
        return;
    }
    /*************************************加载数据*************************************/
    if(/^chat/.test($.$.loginUrl)){
        $("#content>div>div#title>div:nth-of-type(2)").Click(function(){
            $.page("home",-1,true);
        });
    }
    //验证函数
    function check(){
        if(verify[0]&&verify[1]) footer.Class('active');
        else footer.ClassClear('active');
        verify[0] ? tip.CSS("display","none") : tip.CSS("display","block");
    }
    //输入电话号码
    tel.Verify('tel',function(ok){
        verify[0]=ok;
        check();
    });
    //输入密码
    password.Verify('password',function(ok){
        verify[1]=ok;
        check();
    });
    //点击登录按钮
    footer.Click(function(){
        doLogin();
    });

    function doLogin(){
        if(footer.ClassHave('active')){
            var param = {
                username: tel.Value(),
                password: password.Value(),
                usertype: 'user',
                clubId: $.$.clubID || $.$.loginChannelClubID || '',
                code : payAuthCode,
                isBindWeixin : isBindWeixin ? 'Y' : 'N'
            };
            if($.$.sessionType=="9358"){
                param.loginChanel= $.$.loginChanel;
                param.openId= $.$.openId;
                param.wxNickName = ($.$.nickName == $.$.defaultUserName ? "" : $.$.nickName);
                param.wxHeadimgurl = ($.$.headerImgUrl == $.$.defaultHeader ? "" : $.$.headerImgUrl);
            }

            $.ajax({
                url: '../api/v1/user/login',
                isReplaceUrl:true,
                type: 'post',
                data: param,
                success: function (result) {
                    if(result.statusCode==2){
                        param.isHidePassword=change[0].checked;
                        window['loginInfo']=param;
                        $.page('register')
                    }else if(result.statusCode == '935801'){        //需重新获取授权
                        $.localStorage('con-login-param',JSON.stringify(param));
                        $.getOauthCode('','9358','9358_login','base');
                    }else if(result.status == 200){
                        $.$.userToken = result['token'];
                        $.$.userID = result['userId'];
                        $.$.userHeader = result['avatarUrl'] || "img/header_default.jpg";
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
                        $.localStorage($.$.sessionType=="web" ? 'userToken_web' : 'userToken_9358' ,$.$.userToken);
                        $.localStorage('userID',$.$.userID);
                        $.localStorage('userHeader',$.$.userHeader);
                        $.localStorage('userTel',$.$.userTel);
                        $.localStorage('userName',$.$.userName);
                        $.localStorage('userLoginName',$.$.userLoginName);

                        $.$.is_telphone_user = true;
                        $.localStorage('is_telphone_user',true);
                        $.cookie('is_telphone_user',true);

                        var eb = $.$.easemob;
                        eb.userId = result["emchatId"];
                        $.localStorage("easemobUserId",eb.userId);
                        if(paramData.oldUserId && paramData.oldUserId !=$.$.userID ){/////切换新账户
                            $.localStorage('easemobSecondUserId',paramData.oldChatId);
                            eb.secondUserId = paramData.oldChatId;
                            $.switchUserChatInfo(paramData.oldUserId,$.$.userID);
                        }
                        initEasemob();
                        if(result.message) $.tipShow(result.message);
                    }else{
                        if(result.respData=='HAS_BOUND'){
                            $.tipShow(result.message || '当前用户已绑定');
                            $.page($.$.loginUrl,-1,true)
                        }else{
                            $.tipShow(result.message);
                        }
                    }
                }
            });
        }
    }

    function initEasemob(){
        var eb = $.$.easemob, delay=false;
        if(!eb.conn.isClosed()){//退出重新登录
            delay = true;
            eb.conn.stopHeartBeat(eb.conn);
            eb.conn.close();
            eb.currChatTech = {};
            eb.sessionList = null;
            eb.msgList = {};
        }

        //////////////////////////等待关闭
        setTimeout(function(){
            eb.conn.open({ user : eb.userId, pwd : eb.userId, appKey : eb.appKey });
            if(eb.secondUserId){ ///////旧账号登录
                $.createEasemobConn(1);
            }
            if($.$.loginUrl && ($.$.loginUrl.indexOf('techReward&')!=-1 || $.$.loginUrl.indexOf('comment&')!=-1 || $.$.loginUrl.indexOf('confirmOrder&')!=-1)){
                $.localStorage('backIndex',3);//==使在打赏页时，返回键不返回登录页
            }
            $.$.loginUrl ?  $.page($.$.loginUrl,-1,true) : $.page("home",-1,true);
        },(delay ? 500 : 1))
    }

    //点击找密码
    $("#recover-password-link").Click(function(){
        window['loginInfo'] = { username : tel.Value() };
        $.page("recoverPassword");
    });

    //执行页面切换
    $.pageSwitch();

    if(paramData && paramData.username){
        tel[0].value = paramData.username;
        verify[0]=true;
        password[0].focus();
        isBindWeixin = paramData.isBindWeixin;
        if(paramData.password){
            password[0].value = paramData.password;
            verify[1]=true;
            check();
            $.localStorageClear('con-login-param');
            doLogin();
        }else{
            check();
        }
    }
})();