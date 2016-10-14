(function(){

    $('#content>div:nth-of-type(1)>div:nth-of-type(2)').Page();

    var clubInviteCodeInput = $("#club-invite-code"),
        techNoInput = $("#tech-no"),clubInviteCode,techNo;
    if($.$.clubInviteCode){
        clubInviteCodeInput.Value($.$.clubInviteCode);
        $('#content>div:nth-of-type(1)>div:nth-of-type(2)').Event('click', function () {
            event.stopImmediatePropagation();
            location.href = location.origin+location.pathname+'?club='+ $.$.clubID;
        });
    }
    if($.$.techSerialNo){
        techNoInput.Value($.$.techSerialNo);
    }

    if($.$.clubInviteCode && ($.$.techSerialNo || $.$.techInviteCode)){
        doHandlerSubmit($.$.clubInviteCode,$.$.techSerialNo);
    }

    $.pageSwitch(false);

    clubInviteCodeInput.Event("input",function(e,item){
        item.value = item.value.replace(/\D/g, '').substring(0, 6)
    });

    techNoInput.Event("input",function(e,item){
        if (/\W/.test(item.value)) {
            item.value = item.value.replace(/\W/g, '');
        }
        if (item.value.length > 6) {
            item.value = item.value.substring(0, 6);
        }
    });

    $("#content>div:nth-of-type(3)").Click(function(){
        clubInviteCode = clubInviteCodeInput.Value();
        if(clubInviteCode.length == 0){
            return $.tipShow("请输入会所邀请码！");
        }
        else if(!/^\d{3,}$/.test(clubInviteCode)){
            return $.tipShow("请输入正确的会所邀请码！");
        }
        techNo = techNoInput.Value();
        if(techNo.length == 0) techNo="";
        else if(!/^\w{0,6}$/.test(techNo)){
            return $.tipShow("请输入正确的技师编号！");
        }
        doHandlerSubmit(clubInviteCode,techNo);
    });

    function doHandlerSubmit(clubInviteCode,techNo){
        $.ajax({
            url : "../api/v1/wx/club_tech_page_url",
            isReplaceUrl:true,
            data : {
                clubInviteCode : clubInviteCode,
                techSerialNo : techNo || '',
                techInviteCode : ($.$.techInviteCode || ""),
                source: $.getUrlParam('tmp_clubSource') || ''
            },
            success : function(result){
                if(result.statusCode == "200"){
                    if(result.respData["techInviteCode"]){
                        $.$.techInviteCode = result.respData["techInviteCode"];
                        $.sessionStorage("techInviteCode",$.$.techInviteCode);
                    }
                    var arr = result.respData["linkUrl"].split("#");
                    location.href = arr[0]+"#"+arr[1]+($.$.techSerialNo ? "&techNo="+$.$.techSerialNo : "")+($.$.clubInviteCode ? "&clubCode="+ $.$.clubInviteCode : "");
                }
                else if(result.msg){
                    $.tipShow(result.msg || '操作失败');
                }
            }
        });
    }
})();