(function(){
    $.ajax({
        url : "../club_map",
        data : {
            "clubId" : $.$.clubID
        },
        success : function(data) {
            if (data.statusCode != "200" || !data.respData.lngx || data.respData.lngx.length == 0) {
                $.tipShow("获取会所位置信息失败！");
                $.pageCancel();
                return;
            }
            if(AMap && AMap.LngLat){
                initPage(data);
            }
            else{
                var waitCount = 0;
                var waitAMapReady = setInterval(function(){
                    waitCount++;
                    if(AMap && AMap.LngLat){
                        clearInterval(waitAMapReady);
                        initPage(data);
                    }
                    else if(waitCount>30){
                        clearInterval(waitAMapReady);
                        $.tipShow("高德地图初始化失败！");
                        $.pageCancel();
                        return;
                    }
                },150);
            }
        }
    });

    function initPage(data){
        /*************************************定义常用变量*************************************/
        var destination = new AMap.LngLat(parseFloat(data.respData.lngx), parseFloat(data.respData.laty)),//终点---地址的经纬度
            mapObj = new AMap.Map("map-container", {
                view: new AMap.View2D({//创建地图二维视口
                    center: destination,//创建中心点坐标
                    zoom: 15, //设置地图缩放级别
                    rotation: 0 //设置地图旋转角度
                })
            });//创建地图实例

        /*************************************加载数据*************************************/
        /*************************************定义逻辑*************************************/
        AMap.event.addListener(mapObj, "complete", function () {
            //alert("complete");
        });
        //添加终点标记
        var markerElement = document.createElement("div");
        markerElement.className = "gd_marker";
        markerElement.innerHTML = "终";
        var marker = new AMap.Marker({
            map: mapObj,
            position: destination,
            content: markerElement,
            offset: new AMap.Pixel(-15, -40)
        });
        //添加信息窗口
        var infoWinElement = document.createElement("div");
        infoWinElement.className = "gd_infoWin";
        //infoWinElement.innerHTML = "<h3>"+posInfo.title+"</h3><span>"+posInfo.position+"</span><a id='map-nav'><i></i>导航</a><i></i>";
        infoWinElement.innerHTML = "<h3>" + data.respData.name + "</h3><span>" + data.respData.address + "</span><i></i>";
        var infoWin = new AMap.InfoWindow({
            isCustom: true, //使用自定义窗体
            content: infoWinElement,
            offset: new AMap.Pixel(0, -55)
        });
        infoWin.open(mapObj, marker.getPosition());
        //执行页面切换
        $.pageSwitch(true,false);
    }
})();