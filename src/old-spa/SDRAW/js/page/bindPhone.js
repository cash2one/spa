(function () {
    /*************************************定义常用变量*************************************/
    var tel = $("#bindTel"),
        footer = $('#sure-btn'),
        bindPhoneDialog = $('#bindPhoneDialog');

    /*************************************加载数据*************************************/
    //输入电话号码
    tel.Verify('tel',function(ok){
        ok ? footer.Class('active') : footer.ClassClear('active');
    });
    //点击下一步按钮
    footer.Click(function(){
        if(footer.ClassHave('active')){
            $.ajax({
                url:($.$.clubID ? "../" : "")+'../wx/current/check_bind',
                type:'get',
                success: function (result) {
                    if(result.statusCode == 200){
                        if(result.msg == 'Y'){
                            $.tipShow('当前用户是已绑定状态。');
                            $.$.is_telphone_user = true;
                            $.localStorage('is_telphone_user',true);
                            $.cookie('is_telphone_user',true);
                            $.page($.$.loginUrl);
                        }else{
                            $.ajax({
                                url:($.$.clubID ? "../" : "")+'../wx/check_bind',
                                type:'get',
                                data:{
                                    phoneNum: tel.Value()
                                },
                                success: function (result) {
                                    if(result.statusCode == 200){
                                        if(result.respData == 1){
                                            bindPhoneDialog.Class('active');
                                        }else{
                                            login();
                                        }
                                    }else{
                                        $.tipShow(result.msg || '检查绑定状态失败。');
                                    }
                                }
                            });
                        }
                    }else{
                        $.tipShow(result.msg || '检查绑定状态失败。');
                    }
                }
            });
        }
    });
    bindPhoneDialog.Delegate('click','a.cancel-btn', function (e, item) {
        bindPhoneDialog.ClassClear('active');
    }).Delegate('click','a.sure-btn', function (e, item) {
        login();
    });

    function login(){
        var paramData = {
            username: tel.Value(),
            password: "",
            usertype: 'user',
            clubId: $.$.clubID || $.$.loginChannelClubID || '',
            code:'',
            scope:'snsapi_base',
            oldUserId : $.$.userID, ////旧账号
            oldChatId : $.$.easemob.userId
        };
        if($.$.sessionType=="9358" || $.$.ua.isWX){
            paramData.loginChanel= $.$.loginChanel;
            paramData.openId= $.$.openId;
            paramData.wxNickName = $.$.nickName;
            paramData.wxHeadimgurl = $.$.headerImgUrl;
            paramData.isBindWeixin = true;
        }
        $.ajax({
            url: '../api/v1/user/login',
			isReplaceUrl:true,
            type: 'post',
            data: paramData,
            success: function (result) {
                window['loginInfo']=paramData;
                //$.$.loginUrl = 'personal';
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

    $.pageSwitch();
})();