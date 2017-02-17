require(["css!../../compressed/css/page/"+$$.rootVm.page+".css?"+$$.rootVm.currTime,"css!../../compressed/css/common/kindeditor.css","kindeditor","kindeditor_zhCn","jqform","cropper","daterangepicker","!domReady"],function(){
    var vmId = $$.rootVm.page+"Ctrl"+(+new Date()),
        thisPage = $("#"+$$.rootVm.page+"Page"),
        imagePreview,
        editForm = $("#editForm"),
        imgDiv = $("#editForm>div.img"),
        currEditImageId = $("#currEditImageId"),
        addImgBrowserClick = false,
        editor;

    thisPage.attr("ms-controller",vmId);
    $$.currPath.html("次卡套餐编辑");

    var vm = avalon.define({
        $id : vmId,
        validPeriod: [{ label: '一年', value: 1 }, { label: '9个月', value: 2 }, { label: '6个月', value: 3 }, { label: '3个月', value: 4 }]
    });

    // 可售时间
    $('.need-date').daterangepicker({
        singleDatePicker:true,
        locale:{ format:'YYYY-MM-DD' }
    });
    $('.need-date').val('');

    imagePreview = new iCropper({
        imgFile : $("#uploadImgBtn")[0],
        img : $("#editForm>div.img>img")[0],
        imgName : $("#imgFileName")[0],
        imgId : $("#currEditImageId")[0],
        selectionTxt : $("#editForm>div.img>span.selectionTxt")[0],
        x : $("#x")[0],
        y : $("#y")[0],
        w : $("#w")[0],
        h : $("#h")[0],
        ratioW : 2.057,
        ratioH : 1,
        onImgLoad : function(){
            if(!imgDiv.hasClass("hasImg")){
                imgDiv.addClass("hasImg");
            }
        }
    });

    initKindEditor();

    function initKindEditor(){
        var addClassFn = function(){
            if($('.ke-dialog-default').length > 0){
                $('.ke-dialog-default').addClass('oneYuan-image-dialog');
            }else{
                setTimeout(function () {
                    addClassFn();
                },50);
            }
        };
        if(editor) editor.remove();
        editor= KindEditor.editor({
            fileManagerJson : 'club-admin/data/oneYuan/oneYuanDefaultImages.json',
            allowFileManager : true
        });

        if(addImgBrowserClick==false){
            KindEditor('#fileManager').click(function() {
                addClassFn();
                editor.loadPlugin('filemanager', function() {
                    editor.plugin.filemanagerDialog({
                        viewType : 'VIEW',
                        dirName : 'image',
                        clickFn : function(id,fileUrl) {
                            imagePreview.clean();
                            imagePreview.load(fileUrl,{
                                autoCropArea : 1, disabled : true
                            });
                            editForm.addClass("hasImg");
                            currEditImageId.val(id);
                            editor.hideDialog();
                        }
                    });
                });
            });
            addImgBrowserClick = true;
        }
    }

    // 表单输入限制
    $(".int").on("input",function(){
        var val = this.value;
        if(val){
            val = val.replace(/\D/g,"")
        }
        this.value = val;
    })

    avalon.scan(thisPage[0])
});