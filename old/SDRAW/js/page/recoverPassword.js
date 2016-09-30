(function () {
    /*************************************定义常用变量*************************************/
    var tel = $("#recover-tel"),
        authcode = $("#recover-authCode"),
        authcodeBtn = $("#send-authCode-btn"),
        password = $("#recover-password"),
        footer = $("#recover-password-btn"),
        verify = [0, 0, 0],
        tip = $("#content>div>div:nth-of-type(3)");
    /*************************************加载数据*************************************/
    /*************************************定义逻辑*************************************/
    //验证函数
    function check() {
        if (verify[0] && verify[1] && verify[2]) footer.Class('active');
        else footer.ClassClear('active');
        verify[0] ? tip.CSS("display","none") : tip.CSS("display","block");
    }

    //输入电话号码
    tel.Verify('tel', function (ok) {
        verify[0] = ok;
        check();
    });
    //输入验证码
    authcode.Verify('authcode', function (ok) {
        verify[1] = ok;
        check();
    });
    //输入新密码
    password.Verify('password',function(ok){
        verify[2] = ok;
        check();
    });

    if(window['loginInfo'] && window['loginInfo'].username){
        tel[0].value = window['loginInfo'].username;
        if(/^1[34578]\d{9}$/.test(tel[0].value)){
            verify[0]=true;
            check();
        }
    }

    //发送验证码
    authcodeBtn.Event('click', function (e, item) {
        if (authcodeBtn.ClassHave('disabled') || authcodeBtn.ClassHave('pause')) {//无法发送验证码
            return;
        }
        if (!verify[0]) return $.tipShow("请输入正确的手机号码！");

        $.ajax({
            url: '../api/v1/user/checkLoginName',
			isReplaceUrl:true,
            type: 'post',
            data: { loginName: tel.Value() },
            success: function (res) {
                if(res.toString() == "-1") return $.tipShow("用户尚未注册！");
                authcodeBtn.Class('pause');
                authcodeBtn.Text("重新发送(60s)");
                var count = 60,
                    repeatCount,
                    sendInterval = setInterval(function () {
                        if (--count == 0) {
                            clearInterval(sendInterval);
                            repeatCount = authcodeBtn.Attr("data-repeat-count")-1;
                            authcodeBtn.Attr("data-repeat-count",repeatCount);
                            authcodeBtn.ClassClear('pause');
                            authcodeBtn.Text("获取验证码");
                            if(repeatCount == 0) authcodeBtn.Class('disabled');
                        }
                        else{
                            authcodeBtn.Text("重新发送(" + count + "s)");
                        }
                    }, 1000);
                $.ajax({
                    url: '../api/v1/icode',
					isReplaceUrl:true,
                    type: 'get',
                    data: {
                        mobile: tel.Value()
                    }
                });
            }
        });
    });

    //点击确定按钮
    footer.Click(function () {
        if (footer.ClassHave('active'))
            $.ajax({//先检查用户名是否存在
                url: '../api/v1/user/checkLoginName',
				isReplaceUrl:true,
                type: 'post',
                data: {
                    loginName: tel.Value()
                },
                success: function (res) {
                    if (res.toString() == "-1")
                        return $.tipShow("无此用户！");

                    $.ajax({
                        url: '../api/v1/user/resetPassword',
						isReplaceUrl:true,
                        type: 'post',
                        data: {
                            username: tel.Value(),
                            code: authcode.Value(),
                            password: password.Value()
                        },
                        success: function(data){
                            $.tipShow("密码修改成功！");
                            var loginInfo = {
                                username : tel.Value(),
                                isBindWeixin : false,
                                password : password.Value()
                            };
                            $.localStorage('con-login-param',JSON.stringify(loginInfo));
                            $.page("confirmLogin");
                        },
                        error: function (data, code) {
                            $.tipShow(data);
                        }
                    });
                }
            });
    });
    //执行页面切换
    $.pageSwitch(true,false);
})();