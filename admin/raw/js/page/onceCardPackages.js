require(["css!../../compressed/css/page/"+$$.rootVm.page+".css?"+$$.rootVm.currTime,"!domReady"],function(){
    var vmId = $$.rootVm.page+"Ctrl"+(+new Date()),
        thisPage = $("#"+$$.rootVm.page+"Page"),
        confirmModal;

    thisPage.attr("ms-controller",vmId);
    $$.currPath.html("次卡套餐列表");

    var vm = avalon.define({
        $id : vmId,
        dataList : [{ a: "111" }],
        confirmTip: "确认删除此记录？",
        confirmType: "",
        doChangeStatus: function(){

        },
        doDel: function(){

        },
        doCopy: function(){

        }
    });

    confirmModal = new Modal($("#confirmModal"),{
        doClickOkBtn: function(){
            
        }
    })

    function queryData(){
        $.ajax({
            url: "api/v2/manager/fastpay/order/list",
            type: "post",
            data: {},
            success: function(res){
                if(res.statusCode == 200){
                    vm.dataList = res.respData || [];
                }
                avalon.scan(thisPage[0])
            }
        })
    }

    // queryData(1)
    avalon.scan(thisPage[0])
});