(function(){
    if($.$.userToken){
        $("#content>div:nth-of-type(2)>div:nth-of-type(1)>div.header").CSS("background-image","url('"+ $.$.userHeader+"')");
        var nickNameInput = $("#content>div:nth-of-type(2)>div:nth-of-type(2)>div:nth-of-type(2)>input");
        nickNameInput.Value($.$.userName);

        $('#content>div:nth-of-type(2)>div:nth-of-type(1)>input').Event('change', function (e, item) {
            return upload(item);
        });

        function upload(fileBtn) {
            var file = fileBtn.files[0];
            if (!/image\/\w+/.test(file.type) && !/(jpg|jpeg|gif|bmp|png)$/.test(file.type.toLowerCase())) {
                return $.tipShow("只能上传图片格式哦");
            }
            if (!file) return;
            if (file.size > 1024 * 1024 * 10) return $.tipShow('图片不能超过10M');
            window._fileReader = new FileReader();
            window._fileReader.onload = function (){
                var nk = nickNameInput.Value();
                if(nk.length != 0){
                    $.ajax({
                        url : ($.$.clubID ? "../" : "")+"../profile/user/info/eidt",
                        data : { name : nk },
                        type : 'post'
                    });
                }
                $.page('picture&type=avatar');
            };
            _fileReader.readAsDataURL(file);
            return false;
        }

        //////保存
        $("#content>div#title>div:nth-of-type(3)").Click(function(){
            var nk = nickNameInput.Value();
            if(nk.length==0){
                return $.tipShow("昵称不能为空！");
            }
            $.ajax({
                url : ($.$.clubID ? "../" : "")+"../profile/user/info/eidt",
                data : { name : nk },
                type : 'post',
                success : function(res){
                    if(res.statusCode == 200){
                        $.page();
                        $.$.userName = nk;
                        $.tipShow("保存成功！");
                    }
                    else{
                        $.tipShow(res.msg || "保存失败！");
                    }
                }
            });
        });

        $.pageSwitch();
    }
    else{
        $.page("login");
    }
})();