require(["css!../../compressed/css/page/"+$$.rootVm.page+".css?"+$$.rootVm.currTime,"!domReady"],function(){
    var vmId = $$.rootVm.page+"Ctrl"+(+new Date()),
        thisPage = $("#"+$$.rootVm.page+"Page"),
        pageSize = 20,
        currPage = 1,
        editMemberModal,
        confirmModal,
        $memberCardName = $('#memberCardName'),
        $memberCardDiscount = $('#memberCardDiscount'),
        $memberCardExplain = $('#memberCardExplain'),
        memberTpl = $('#editMemberCardModal>div>div.member-tpl'),
        tplDiscount = $('#editMemberCardModal>div>div.member-tpl>div:first-child>div:nth-of-type(2)'),
        tplMemberName = $('#editMemberCardModal>div>div.member-tpl>div:first-child>div:nth-of-type(3)'),
        colorSpan = $('#editMemberCardModal>div>div:nth-of-type(1)>div:nth-of-type(3)>span');
    thisPage.attr("ms-controller",vmId);
    $$.currPath.html("会员设置");


    //注册过滤器
    avalon.filters.fenToYuanFilter = function (str) {
        str = parseInt(str || 0)/100;
        return str;
    };
    avalon.filters.descriptionFilter = function (str) {
        return str.replace(/[\f\n]/g,'<br/>').replace(/<br\/><br\/>/g,'<br/>');
    }

    var vm = avalon.define({
        $id : vmId,
        dataList : [],
        currMemberTypeId:'',
        page:1,
        pageSize:20,
        typeArr:[],
        typeObj:{},
        editModalTitle : "添加会员卡",
        confirmId:'',
        editObj:{
            id:'',
            memberCardName: '',
            memberCardDiscount: '',
            memberCardExplain: ''
        },
        doAddMemberCard: function () {
            vm.editModalTitle = '添加会员卡';
            vm.editObj.id='';
            vm.editObj.memberCardName = '';
            vm.editObj.memberCardDiscount = '';
            vm.editObj.memberCardExplain = '';
            $memberCardExplain.val(vm.editObj.memberCardExplain);
            colorSpan.removeClass('selected');
            colorSpan.eq(0).click();
            editMemberModal.show();
        },
        doModifyMemberCard: function (index) {
            var data = vm.dataList[index];
            vm.editModalTitle = '编辑会员卡';
            vm.editObj.id = data.id;
            vm.editObj.memberCardName = data.name;
            vm.editObj.memberCardDiscount = (data.discount/100).toFixed(2).replace(/0*$/g,'').replace(/\.$/g ,'');
            vm.editObj.memberCardExplain = data.description;
            $memberCardExplain.val(vm.editObj.memberCardExplain);
            colorSpan.removeClass('selected');
            colorSpan.eq(parseInt(data.styleId) - 1).click();
            editMemberModal.show();
        },
        doSaveMemberCard: function () {
            if(!checkForm()) return false;
            $.ajax({
                url:'club/member/type/save',
                type:'post',
                data:{
                    memberTypeId:vm.editObj.id,
                    description:$memberCardExplain.val(),
                    discount:(parseFloat($memberCardDiscount.val())*100).toFixed(0),
                    name:$memberCardName.val(),
                    styleId:parseInt(colorSpan.filter('.selected').attr('data-type'))
                },
                success: function (result) {
                    if(result.statusCode == 200){
                        queryData(1);
                        editMemberModal.close();
                    }else{
                        editMemberModal.showTip(result.msg || '操作失败');
                    }
                }
            });
        },
        deleteMemberCard: function (index) {
            vm.confirmId = vm.dataList[index].id;
            confirmModal.show();
        }
    });

    vm.$watch('editObj.memberCardName', function (v) {
        if(v == ''){
            tplMemberName.text('-会员');
        }else{
            tplMemberName.text(v+'会员');
        }
    });
    vm.$watch('editObj.memberCardDiscount', function (v) {
       if(v =='' ){
           tplDiscount.html('<span>-</span>折');
       }else if(v >= 10){
           tplDiscount.html('<span style="font-style: italic;">vip</span>');
       }else{
           tplDiscount.html('<span>'+v+'</span>折');
       }
    });


    editMemberModal = new Modal($('#editMemberCardModal'));
    confirmModal = new Modal($('#confirmModal'),{
        doClickOkBtn: function () {
            $.ajax({
                url:'club/member/type/delete',
                type:'post',
                data:{
                    memberTypeId:vm.confirmId
                },
                success: function (result) {
                    if(result.statusCode == 200){
                        queryData(1);
                        msgAlert('删除成功',true);
                    }else{
                        msgAlert(result.msg || '删除失败',false,3000);
                    }
                    confirmModal.close();
                }
            });
        }
    });

    function checkForm(){
        if($.trim($memberCardName.val()) == ''){
            editMemberModal.showTip('会员卡名称不能为空');
            return false;
        }
        if($.trim($memberCardDiscount.val()) == ''){
            editMemberModal.showTip('折扣不能为空');
            return false;
        }
        if(parseFloat($.trim($memberCardDiscount.val())) > 10){
            editMemberModal.showTip('折扣不能大于10');
            return false;
        }
        if($.trim($memberCardExplain.val()) == ''){
            editMemberModal.showTip('会员卡说明不能为空');
            return false;
        }
        return true;
    }

    function queryData(page,start,end){
        currPage = page = page || 1;
        vm.page = currPage;
        vm.pageSize = pageSize;
        $.ajax({
            url : "club/member/type/list",
            data : { page : page , pageSize : pageSize},
            success : function(res){
                if(res.statusCode == 200){
                    vm.dataList = res.respData || [];
                    avalon.scan(thisPage[0]);
                }
            }
        });
    }

    /////////////////////////////pageSize下拉的变化
    $("#dataListTable>table>thead>tr:eq(0)>th>div>select").on("change",function(){
        pageSize = this.value;
        queryData();
    });

    queryData();

    var tplImage = $('.member-tpl>div:nth-of-type(1)>div:nth-of-type(1)>img');
    tplImage[0].onerror = function () {
        tplImage[0].onerror = null;
        tplImage[0].src = './club-admin/img/common/logo.png';
    }
    tplImage[0].src=$('header>.logo>img').prop('src');
    $('#editMemberCardModal>div>div.member-tpl>div:first-child>div:nth-of-type(1)>span').text($('#info>.club').text());
    var lastSelectedType = 1;
    colorSpan.on('click', function (e) {
        var $this = $(this);
        if($this.hasClass('selected')) return false;
        colorSpan.removeClass('selected');
        $this.addClass('selected');
        memberTpl.removeClass('tpl-type-'+lastSelectedType);
        lastSelectedType = $(this).index();
        memberTpl.addClass('tpl-type-'+lastSelectedType);
    })
});