require(["css!../../compressed/css/page/"+$$.rootVm.page+".css?"+$$.rootVm.currTime,"daterangepicker","!domReady"],function(){
    var vmId = $$.rootVm.page+"Ctrl"+(+new Date()),
        thisPage = $("#"+$$.rootVm.page+"Page"),
        pageSize = 20,
        currPage = 1,
        seeDialSellModal,
        editDialSellModal,
        $editActContent = $("#editActContent"),
        $aticName = $("input[name='aticName']");

    $editActContent.plainTextOnly();
    thisPage.attr("ms-controller",vmId);
    $$.currPath.html("大转盘");

    var vm = avalon.define({
        $id : vmId,
        actId : "",
        dataList : [],
        serviceItems:[],
        page:1,
        pageSize:20,
        doPrizeList : "",
        prizeTypeList: [],
        prizeTypeListNew: [],
        couponList: [],
        projectList: [],
        activity: {},
        prizeList:[],
        operateType : "",
        probability: 0,
        editModal : "",
        doline : function ($actId,$status) {
            $.ajax({
                url : "api/v2/manager/luckyWheel/updateActivityStatus",
                type : "POST",
                data : {
                    status : $status != "1" ? "1" : "2",
                    actId : $actId
                },
                success : function(res){
                    if(res.statusCode == 200){
                        msgAlert(res.msg,true)
                        queryData(vm.page);
                    }else {
                        msgAlert(res.msg)
                    }
                }
            });
        },
        doAddDial : function () {
            vm.activity.name = "";
            vm.activity.description = "";
            vm.editModal = "添加大转盘";
            vm.probability = 0;
            vm.doPrizeList = "add";
            vm.actId = "";
            $("input[name='probability']").val("");
            editDialSellModal.show();
            setTimeout(function () {
                editDaterangepicker("add");
                limitCheckForm();
            }, 200)

        },
        doChangeType : function (thiss) {
            var $this = $(thiss);
            if($this.val() == "2" || $this.val() == "3" ){
                setTimeout(function () {
                    var $selectedIndex = $this.parents("tr").children("td.name").children("select")[0].selectedIndex;
                    if($selectedIndex == "-1"){
                        $this.parents("tr").children("td.name").children("select")[0].selectedIndex=0
                    }
                }, 200)
            }else {
                return;
            }
        },
        doEditDial : function (actId,type) {
            $("input[name='probability']").val("");
            $.ajax({
                url : "api/v2/manager/luckyWheel/activityDetail",
                data : {
                    "actId":actId
                },
                success : function(res){
                    if(res.statusCode == 200){
                        vm.editModal = type=="edit"?"修改大转盘":"查看大转盘";
                        vm.doPrizeList = type;
                        vm.actId = actId;
                        vm.activity = res.respData.activity;
                        var $prizeList = res.respData.prizeList;
                        $editActContent.html( vm.activity.description);
                        for (i=0;i<$prizeList.length;i++) {
                            $prizeList[i]["probability"] = parseFloat($prizeList[i]["probability"] * 100).toFixed(2);
                        }
                        vm.prizeList = $prizeList;
                        type == "see" ? seeDialSellModal.show() :  editDialSellModal.show();
                        setTimeout(function () {
                            limitCheckForm();
                            editDaterangepicker("edit");
                            var $probabilityNo  = 0;
                            for (i=0;i<vm.prizeList.length;i++){
                                $probabilityNo = parseInt($probabilityNo) + parseInt(vm.prizeList[i].probability * 100) ;
                            }
                            vm.probability = $probabilityNo/100;
                        }, 200)
                    }else {
                        msgAlert(res.msg)
                    }
                }
            });
        },
        doSaveCoupon: function (type) {
            if(checkForm()){
                var myarr = [],
                    $searchEdit = true;
                $("#editDialSellModal").find("table").children("tbody."+vm.doPrizeList).find("tr").each(function(i){
                    var $prizeType = $(this).children("td.prizeTypeTab").find("select").val(),
                        $name = "",
                        $nameTag = $nameTag = $(this).children("td.name").find("input"),
                        $number = "",
                        $numberTag = $(this).children("td.number").find("input"),
                        $concept = $(this).children("td.concept").find("input").val(),
                        $conceptTag = $(this).children("td.concept").find("input"),
                        $content = "",
                        $level =  $(this).children("td.level").text();
                    if($prizeType == "0"){ //积分
                        $content = $(this).children("td.name").find("input").val();
                        $name = $content == "" ? "" : $content + "积分";
                        $number = $(this).children("td.number").find("input").val();
                    }else if($prizeType ==  "1"){ //实物
                        $name = $(this).children("td.name").find("input").val();
                        $number = $(this).children("td.number").find("input").val();
                    }else if($prizeType == "2" ){ //优惠券
                        $name = $(this).children("td.name").find("select").find("option:selected").text();
                        $content = $(this).children("td.name").find("select").val();
                        $nameTag = $(this).children("td.name").find("select");
                        $number = $(this).children("td.number").find("input").val();
                    }else if($prizeType == "3" ){ //项目
                        $name = $(this).children("td.name").find("select").find("option:selected").text();
                        $content = $(this).children("td.name").find("select").val();
                        $nameTag = $(this).children("td.name").find("select");
                        $number = $(this).children("td.number").find("input").val();
                    }else if($prizeType == "4"){ //再来一次
                        $name = "再来一次";
                        $content = "";
                        $number = "0";
                    }else if($prizeType == "5"){ //谢谢惠顾
                        $name = "谢谢惠顾";
                        $content = "";
                        $number = "0";
                    }else{
                        $name = "0";
                        $content = "";
                    }
                    if($name == ""){
                        Modal.showErrorEleTip($nameTag);
                        editDialSellModal.showTip('奖品不能为空');
                        return $searchEdit=false;
                    }
                    if($number == ""){
                        Modal.showErrorEleTip($numberTag);
                        editDialSellModal.showTip('数量不能为空');
                        return $searchEdit=false;
                    }
                    if($conceptTag.val() == ""){
                        Modal.showErrorEleTip($conceptTag);
                        editDialSellModal.showTip('中奖概率不能为空');
                        return $searchEdit=false;
                    }
                    if(i>0){
                        myarr += ","+"{" +
                            "level:" + "'" + $level + "'," +
                            "content:" + "'" + $content + "'," +
                            "name:" + "'" + $name + "'," +
                            "prizeCount:" + "'" + $number + "'," +
                            "probability:" + "'" + parseFloat($concept)/100 + "',"  +
                            "type:" + "'" + $prizeType + "'"  +
                            "}";

                    }else{
                        myarr += "{" +
                            "level:" + "'" + $level + "'," +
                            "content:" + "'" + $content + "'," +
                            "name:" + "'" + $name + "'," +
                            "prizeCount:" + "'" + $number + "'," +
                            "probability:" + "'" + parseFloat($concept)/100 + "',"  +
                            "type:" + $prizeType +
                            "}";

                    }
                    return myarr;
                });
                function doSaveCoupon() {
                    var $type = type =="saveAndOnline" ? "1" : "0",
                        dateRange =formatDateRangeVal2($("input[name='addTime']").val()),
                        startDate = dateRange.start,
                        endDate = dateRange.end,
                        activity = {
                            name:$aticName.val(),
                            startTime:startDate,
                            endTime:endDate,
                            id:vm.actId,
                            limitCount:2,
                            type:1,
                            status:$type ,
                            description:$editActContent.html()
                        };
                    myarr = '['+myarr+']';
                    myarr =eval(myarr);
                    editDialSellModal.loading();
                    $.ajax({
                        url : vm.doPrizeList == "add" ? "api/v2/manager/luckyWheel/addActivity" : "api/v2/manager/luckyWheel/updateActivity",
                        type : "POST",
                        data : {
                            data: "{" +
                            '"activity":' + JSON.stringify(activity) + "," +
                            '"prizeList":' + JSON.stringify(myarr) +
                            "}"
                        },
                        success : function(res){
                            editDialSellModal.loading("hide");
                            if(res.statusCode == 200){
                                msgAlert(res.msg,true);
                                editDialSellModal.close();
                                queryData();
                            }else {
                                editDialSellModal.showTip(res.msg);
                            }
                        }
                    });
                }
                if(vm.probability != 100){
                    editDialSellModal.showTip('奖概率总和必需等于100%');
                    return;
                }
                if($searchEdit == false){
                    return;
                }else{
                    doSaveCoupon();
                }

            }
        }
    });


    function queryData(page){
        currPage = page || 1;
        vm.page = currPage;
        vm.pageSize = pageSize;
        $.ajax({
            url : "api/v2/manager/luckyWheel/listActivity",
            type : "POST",
            data : {clubId : $$.clubId},
            success : function(res){
                if(res.statusCode == 200){
                    vm.dataList = res.respData;
                    avalon.scan(thisPage[0]);
                }else {
                    msgAlert(res.msg)
                }
            }
        });
    }


    editDialSellModal = new Modal($('#editDialSellModal'),{
        doClickOkBtn : function(){
        }
    });
    seeDialSellModal = new Modal($('#seeDialSellModal'),{
        doClickOkBtn : function(){
        }
    });

    function queryType() {
        $.ajax({
            url : "api/v2/manager/luckyWheel/toAddActivity",
            data : {
                clubId : $$.clubId
            },
            success : function(res){
                if(res.statusCode == 200){
                    var prizeTypeListNew = res.respData.prizeTypeList;
                    var concat= [{"prizeType": "5","remark": "谢谢惠顾"}]
                    if(prizeTypeListNew.length < 6){
                        for(i=0;i<=(6-(prizeTypeListNew.length));i++){
                            prizeTypeListNew =  prizeTypeListNew.concat(concat);
                        }
                    } else if(prizeTypeListNew.length > 6){
                        prizeTypeListNew =  prizeTypeListNew.splice(prizeTypeListNew.length-6,prizeTypeListNew.length);
                    }
                    vm.prizeTypeListNew = prizeTypeListNew; //拼接数组，固定长度为6
                    vm.prizeTypeList = res.respData.prizeTypeList;
                    vm.couponList = res.respData.couponList;
                    vm.projectList = res.respData.projectList;
                }
            }
        });

    }

    Date.prototype.format = function (format) {
        var o = {
            "M+": this.getMonth() + 1, //month
            "d+": this.getDate(), //day
            "h+": this.getHours(), //hour
            "m+": this.getMinutes(), //minute
            "s+": this.getSeconds(), //second
            "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
            "S": this.getMilliseconds() //millisecond
        }
        if (/(y+)/.test(format))
            format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(format))
                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        return format;
    }

    function editDaterangepicker(type) {
        var initStartDate = new Date();
        initStartDate.setTime(initStartDate.getTime()+30*24*60*60*1000);
        vm.activity.startTime = vm.activity.startTime  || new Date().format("yyyy-MM-dd hh:mm:ss");
        vm.activity.endTime = vm.activity.endTime || initStartDate.format("yyyy-MM-dd hh:mm:ss");
        $("input[name='addTime']").daterangepicker({
            singleDatePicker : false,
            timePicker: true,
            timePicker24Hour: true,
            timePickerSeconds: true,
            timePickerIncrement:1,
            opens: 'right',
            startDate: type == "add" ? new Date() : vm.activity.startTime,
            endDate: type == "add" ? initStartDate : vm.activity.endTime,
            locale: {
                format : "YYYY-MM-DD HH:mm:ss",
                separator: " - "
            }
        });
    }


    ///////////////////////////////////////////输入限制
    function limitCheckForm() {
        $("#editDialSellModal").find("td.number").children("input").on("input",function(){
            if(this.value.length==1){
                this.value = this.value.replace(/[^1-9]/g, '');
            }else {
                this.value = this.value.replace(/D/g, '');
            }
            if(this.value.length>6) this.value = this.value.substr(0,6);
        });
        $("#editDialSellModal").find("td.name").children("input[placeholder='输入积分']").on("input",function(){
            if (/\D/.test(this.value)) {
                this.value = this.value.replace(/\D/g, '');
            }
            if(this.value.length>6) this.value = this.value.substr(0,6);
        });
        $("input[name='probability']").on("input",function(){
            this.value = this.value.replace(/[^\d.]/g,"");
            this.value = this.value.replace(/^\./g,"");
            this.value = this.value.replace(/\.{2,}/g,".");
            this.value = this.value.replace(".","$#$").replace(/\./g,"").replace("$#$",".");
            this.value = this.value.replace(/^(\-)*(\d+)\.(\d\d).*$/,'$1$2.$3');
            if(this.value.length>6) this.value = this.value.substr(0,5);
            if(parseInt(this.value *100)/100>=100){
                this.value = 99;
            }
            limitValue()
        });
        function limitValue() {
            var $No = 0;
            $("input[name='probability']").each(function(index,item){
                $No = parseInt($No) + parseInt(($(this).val() == "" ? 0 : $(this).val()) *100)
            });
            vm.probability = $No /100;
        }
    }

    function checkForm() {
        if($aticName.val() == ''){
            Modal.showErrorEleTip($aticName);
            editDialSellModal.showTip('活动名称不能为空');
            return false;
        }
        return true;
    }

    function formatDateRangeVal2(str){
        var arr = str.split(" - ");
        arr[0] = arr[0] || "";
        arr[1] = arr[1] || "";
        return { start : arr[0] , end : arr[1] }
    }

    queryData();
    queryType();
});