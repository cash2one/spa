require(["css!../../compressed/css/page/"+$$.rootVm.page+".css?"+$$.rootVm.currTime,"!domReady"],function(){
    var vmId = $$.rootVm.page+"Ctrl"+(+new Date()),
        thisPage = $("#"+$$.rootVm.page+"Page"),
        dataListPagination,
        confirmModal,
        $cardInfo=$("input.card-info");

    thisPage.attr("ms-controller",vmId);
    $$.currPath.html("次卡列表");

    var vm = avalon.define({
        $id : vmId,
        pageSize: 20,
        currPage: 1,
        dataList : [],
        statusObj: { 0 : "未发布", 1 : "已发布", 2 : "已下线", 3 : "已删除" },
        confirmTip: "确认删除此记录？",
        confirmType: "",
        confirmCardId: '',
        changePageSize: function(){
            vm.pageSize = this.value;
            queryData(1)
        },
        doSearch: function(){
            queryData(1)
        },
        doResetSearch: function(){
            $cardInfo.val("");
            queryData(1)
        },
        doChangeStatus: function(id, type, cardName){
            vm.confirmType = type;
            vm.confirmCardId = id;
            if(type == 1){
                vm.confirmTip = "确认上线名称为 '"+cardName+"' 的次卡？"
            } else if(type == 2){
                vm.confirmTip = "确认下线名称为 '"+cardName+"' 的次卡？"
            } else if(type == 3){
                vm.confirmTip = "确认删除名称为 '"+cardName+"' 的次卡？"
            }
            confirmModal.show()
        }
    });

    confirmModal = new Modal($("#confirmModal"),{
        doClickOkBtn: function(){
            confirmModal.loading();
            $.ajax({
                url: "api/v2/manager/once_card/activity/status/update",
                data: {
                    activityId: vm.confirmCardId,
                    status: vm.confirmType
                },
                success: function(res){
                    if(res.statusCode == 200){
                        confirmModal.close();
                        msgAlert("操作成功！",true);
                        queryData(1)
                    } else {
                        confirmModal.showTip(res.msg || "操作失败！")
                    }
                },
                complete: function(){
                    confirmModal.loading("hide")
                }
            })
        }
    })

    //////////////////分页器
    dataListPagination = new Pagination($("#dataListPagination"),{
        switchPage : function(page){
            queryData(page);
        }
    });

    function queryData(page){
        page = page || 1;
        var cardInfo = $cardInfo.val();
        if(cardInfo){
            $cardInfo.val(cardInfo.trim())
        }
        $.ajax({
            url: "api/v2/manager/once_card/activity/list",
            type: "get",
            data: {
                page: page,
                pageSize: vm.pageSize,
                itemName: $cardInfo.val()
            },
            success: function(res){
                if(res.statusCode == 200){
                    vm.currPage = page;
                    var totalPage = res.pageCount;
                    res= res.respData || [];
                    var list = [], i=0, k=0, plans, item, className = 0;
                    for(;k<res.length;k++){
                        item = res[k];
                        plans = item.onceCardPlans;
                        className = 1-className;
                        for(i=0;i<plans.length;i++){
                            if(i==0){
                                item.tag = true;
                                item.index = k;
                                item.plan = plans[0];
                                item.len = plans.length;
                                item.clsName = className==0 ? 'classA' : 'classB';
                                if(item.status == 2){
                                    item.canOnline = (!item.endTime || item.endTime>formatDate(new Date()))
                                }
                                list.push(item)
                            } else {
                                list.push({
                                    plan: plans[i],
                                    clsName: className==0 ? 'classA' : 'classB'
                                })
                            }
                        }
                    }
                    console.dir(list)
                    vm.dataList = list;
                    dataListPagination.refresh({ currPage : page , totalPage : totalPage });
                }
                avalon.scan(thisPage[0])
            }
        })
    }

    queryData(1)
});