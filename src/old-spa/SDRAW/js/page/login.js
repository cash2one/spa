(function () {
    /*************************************定义常用变量*************************************/
    var tel = $("#login-tel"),
        footer=$("#login-btn"),
        paramData = $.localStorage('user-login-param') ? JSON.parse($.localStorage('user-login-param')) : null,
        payAuthCode = $.param('code') || $.getUrlParam('code') || $.$.payAuthCode;

    $.$.payAuthCode = payAuthCode;
    $.$.authCode = payAuthCode;

    if($.$.ua.isWX && (!$.$.authCode || $.getUrlParam('state') != '9358_login' )){
        $.getOauthCode('','9358','9358_login','base');
        return;
    }

    /*************************************加载数据*************************************/
    if(/^chat/.test($.$.loginUrl) || /hourTicketList/.test($.$.loginUrl)){
        $("#content>div>div#title>div:nth-of-type(2)").Click(function(event){
            history.go(-2);
            event.stopImmediatePropagation();
        });
    }

    if($.getUrlParams('loginTel')[0]){
        tel[0].value = $.getUrlParams('loginTel')[0] ;
        footer.Class('active');
    }

    //输入电话号码
    tel.Verify('tel',function(ok){
        ok ? footer.Class('active') : footer.ClassClear('active');
    });

    //点击下一步按钮
    footer.Click(function(){
        if(footer.ClassHave('active')){
            var paramData = {
                username: tel.Value(),
                password: "",
                usertype: 'user',
                clubId: $.$.clubID || $.$.loginChannelClubID || '',
                code:payAuthCode,
                scope:'snsapi_base'
            };
            if($.$.sessionType=="9358" || $.$.ua.isWX){
                paramData.loginChanel= $.$.loginChanel;
                paramData.openId= $.$.openId;
                paramData.wxNickName = $.$.nickName;
                paramData.wxHeadimgurl = $.$.headerImgUrl;
            }
            $.ajax({
                url: '../api/v1/user/login',
                isReplaceUrl:true,
                type: 'post',
                data: paramData,
                success: function (result) {
                    window['loginInfo']=paramData;
                    if(result.statusCode==2){
                        $.localStorageClear('user-login-param');
                        $.localStorage('user-register-param',JSON.stringify(paramData));
                        $.page('register');
                    }else if(result.statusCode == '935801'){        //需重新获取授权
                        $.localStorage('user-login-param',JSON.stringify(paramData));
                        $.getOauthCode('','9358','9358_login','base');
                    }else if(result.statusCode ==1){
                        $.localStorageClear('user-login-param');
                        $.localStorage('con-login-param',JSON.stringify(paramData));
                        $.page("confirmLogin");
                    }
                }
            });
        }
    });

    $.pageSwitch();

    if(paramData && paramData.username){
        tel[0].value = paramData.username;
        footer.Class('active');
        $.localStorageClear('user-login-param');
        footer[0].click();
    }

    //执行页面切换
    $.pageSwitch();
})();