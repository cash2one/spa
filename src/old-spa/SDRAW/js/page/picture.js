(function(){
    if(window._fileReader==null){
        $.page();
        return;
    }else{
        var type = $.param('type'),
            bd_w = document.body.scrollWidth,
            w = bd_w*0.8,
            h = w,
            ic = imageCut({
                dom : $('#content>div:nth-of-type(2)')[0],//需要指定化的dom，建议使用调用div1
                width : document.body.scrollWidth,//控件的大小,默认300
                height : document.body.scrollHeight,//控件的大小,默认300
                widthCut : w,
                heightCut : h
            });
        ic.putImageUrl(window._fileReader.result);

        $('#content>div:nth-of-type(1)>div:nth-of-type(3)').Click(function(){
            if(type=='avatarR'){
                $.tmp=ic.getImageBase64(160,160);
                $.page();
                return
            }
            $.eventMaskShow(true);
            $.loadingShow(true);
            //$.tipShow('正在上传，请耐心等待哟~')
            $.ajax({
                url: ($.$.clubID ? "../" : "")+'../profile/user/avatar/eidt',
                data: { avatar : encodeURIComponent(type=='avatar'?ic.getImageBase64(160,160):ic.getImageBase64(720,720)) },
                type:'post',
                contentType: false,
                success: function (){
                    $.updateUserNameAndHeader(false);
                    $.page();
                }
            });
        });
        $.pageSwitch();
    }
})();