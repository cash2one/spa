(function (win) {
    function isObject(obj){
        return Object.prototype.toString.call(obj) === "[object Object]";
    }
    function cClone(obj1,obj2,isClone){
        if(Object.keys(obj2).length == 0) return obj1;
        var co,obj1 = isObject(obj1)? obj1 : {};
        isClone = isClone === false?false:true;
        co = isClone?{}:obj1;
        if(isClone){
            clonePro(obj1);
        }
        clonePro(obj2);
        function clonePro(obj){
            for(var key in obj){
                if(obj.hasOwnProperty(key)){
                    if(isObject(obj[key])){
                        co[key] = cClone(co[key],obj[key]);
                    }else{
                        co[key] = obj[key];
                    }
                }
            }
        }
        return co;
    }

    function scrollHori(options){
        var startPos,changeData,container,aollowScroll,slides,circleCount,eleCurrentTx = {}
          ,prevEleTx = {}
          ,changeIndex
          ,isReStart = false
          ,moveTotal = 0
          ,isAnimation = false
          ,scrollApi = new ScrollHoriAPI();
        options = cClone({
            container:null,
            callback:function(){},
            transitionEnd: null,
            oneEleWidth:0,
            index:0,
            showEleCount:1
        },options);
        if(!options.container){
            throw new Error('ScrollHori 窗器不能为空。');
        }
        if(options.container.dataset.hasScroll == true){
            return;
        }
        container = options.container;
        container.dataset.hasScroll = true;
        if(options.container.children.length<options.showEleCount){
            console.info('无需滚动');
            return;
        }
        if(container.children.length < options.showEleCount * 2){
            //添加一定的元素做辅助视图
            container.innerHTML+=container.innerHTML;
        }
        slides = container.children;
        var cssValue = getComputedStyle(slides[0]);
        options.oneEleWidth = options.oneEleWidth || ((getRect(slides[0]).width || slides[0].offsetWidth || parseFloat(cssValue.width))+parseFloat(cssValue.marginLeft)+parseFloat(cssValue.marginRight));
        for(var i= 0,l=slides.length;i<l;i++){
            slides[i].dataset.tx = i*options.oneEleWidth;
            slides[i].dataset.index = i;
        }

        //==== 获得初始状态 =========
        if(typeof container.dataset.index !== 'undefined'){
            for (var i = 0, l = slides.length; i < l; i++) {
                eleCurrentTx[i] = slides[i].dataset.currentTx  - 0;
            }
            options.index = container.dataset.index - 0;
            moveTotal = container.dataset.moveTotal - 0;
        }else{
            //===初始最后一个元素放到第一位置
            translate(slides.length - 1, -slides.length * options.oneEleWidth, 0, false);
            slides[slides.length - 1].dataset.currentTx = -slides.length * options.oneEleWidth;
            eleCurrentTx[slides.length - 1] = -slides.length * options.oneEleWidth;
        }

        prevEleTx = cClone({}, eleCurrentTx);

        function getRect(dom){
            var rect = dom.getBoundingClientRect(),
              cTop = document.documentElement.clientTop,
              cLeft = document.documentElement.clientLeft;
            return {
                top:rect.top - cTop,
                right:rect.right - cLeft,
                bottom:rect.bottom - cTop,
                left:rect.left - cLeft,
                width: rect.width
            };
        }

        function translate(index, dist, speed, isNeedZ) {

            var slide = container.children[index],isNeedZ = false !== isNeedZ;
            var style = slide && slide.style;

            if (!style) return;

            /*if(!isReStart){
             dist = (slide.dataset.currentTx || 0) - 0 + dist;
             }*/

            style.webkitTransitionDuration =
              style.MozTransitionDuration =
                style.msTransitionDuration =
                  style.OTransitionDuration =
                    style.transitionDuration = speed + 'ms';

            style.webkitTransform = 'translate(' + dist + 'px,0)' + 'translateZ(0)';
            style.msTransform =
              style.MozTransform =
                style.OTransform = 'translateX(' + dist + 'px)';

            if(!isNeedZ){
                setTimeout(function () {
                    style.webkitTransform = 'translate(' + dist + 'px,0)';
                },speed)
            }
            //slide.dataset.currentTx = dist;
            eleCurrentTx[index] = dist;
        }

        function calcIndex(index){
            return (slides.length + (index % slides.length)) % slides.length;
        }

        function calcPrevTx(index,speed){
            var slide = slides[calcIndex(index)],slideIndex = slide.dataset.index - 0,
              prevSlide = slides[calcIndex(slideIndex-1)],prevSlideIndex = prevSlide.dataset.index,
              changeL = eleCurrentTx[slideIndex];

            if(slideIndex - 1 >= 0){
                translate(prevSlideIndex, - options.oneEleWidth + parseFloat(prevEleTx[slideIndex] || 0), 0);
                eleCurrentTx[prevSlideIndex] = changeL;
            }else{
                translate(prevSlideIndex,parseFloat(slide.dataset.tx || 0) - parseFloat(prevSlide.dataset.tx || 0) - options.oneEleWidth + parseFloat(prevEleTx[slideIndex] || 0 ),0);
                eleCurrentTx[prevSlideIndex] = -options.oneEleWidth - parseFloat(prevSlide.dataset.tx || 0 ) + changeL;
            }
            //translate(prevSlideIndex,eleCurrentTx[prevSlideIndex],speed || 0);
            return prevSlideIndex;
        }
        function calcNextTx(index,speed){
            var slide = slides[calcIndex(index)],slideIndex = slide.dataset.index - 0,
              nextSlide = slides[calcIndex(slideIndex+1)],nextSlideIndex = nextSlide.dataset.index,
              changeL = eleCurrentTx[slideIndex];

            if(slideIndex+1<slides.length){
                translate(nextSlideIndex, options.oneEleWidth + parseFloat(prevEleTx[slideIndex] || 0) , 0);
                eleCurrentTx[nextSlideIndex] = changeL;
            }else{
                translate(nextSlideIndex,options.oneEleWidth + parseFloat(prevEleTx[slideIndex] || 0 ) + parseFloat(slide.dataset.tx || 0) + parseFloat(nextSlide.dataset.tx || 0),0);
                eleCurrentTx[nextSlideIndex] = options.oneEleWidth + parseFloat(slide.dataset.tx || 0 ) + changeL;
            }
            //translate(nextSlideIndex,eleCurrentTx[nextSlideIndex],speed || 0);
            return nextSlideIndex;
        }

        function moveToRight(absChangeIndex,changeL,speed,isNeedZ){
            var showLastIndex = options.index + options.showEleCount - absChangeIndex+ 2,
              mArr = [];
            //translate(calcIndex(showLastIndex),(slides[calcIndex(showLastIndex)].dataset.currentTx || 0) - 0 + changeL,speed);

            eleCurrentTx[calcIndex(showLastIndex)] = (slides[calcIndex(showLastIndex)].dataset.currentTx || 0) - 0 + changeL;
            mArr[calcIndex(showLastIndex)];
            for(var i = showLastIndex,l = options.index - absChangeIndex ;i>=l;i--){
                mArr.push(calcPrevTx(i,speed));
            }
            mArr.forEach(function (v) {
                translate(v,eleCurrentTx[v],speed,isNeedZ);
            });
        }

        function moveToLeft(absChangeIndex,changeL,speed,isNeedZ){
            var showLastIndex = absChangeIndex+options.index + options.showEleCount+1;
            var index = options.index - 1,
              mArr = [];
            eleCurrentTx[calcIndex(index)] = (slides[calcIndex(index)].dataset.currentTx || 0) - 0 + changeL;
            mArr.push(calcIndex(index));
            //translate(calcIndex(index),(slides[calcIndex(index)].dataset.currentTx || 0) - 0 + changeL,speed);
            for(var i = index,l = showLastIndex;i<=l;i++){
                mArr.push(calcNextTx(i,speed));
            }
            mArr.forEach(function (v) {
                translate(v,eleCurrentTx[v],speed,isNeedZ);
            });
        }


        function touchStart(e){
            var touches = e.touches[0];
            startPos = {
                x:touches.clientX,
                y:touches.clientY,
                time:+new Date
            };
            isReStart = true;
            aollowScroll = undefined;
            changeData = {};
            //moveTotal = 0;
            container.addEventListener('touchmove',touchMove,false);
            container.addEventListener('touchend',touchEnd,false);
            container.addEventListener('touchcancel',touchEnd,false);
        }
        function touchMove(e){
            var touches = e.touches[0],calcI;
            changeData = {
                x:touches.clientX - startPos.x,
                y:touches.clientY - startPos.y
            }
            if(typeof aollowScroll === 'undefined'){
                aollowScroll = !!(Math.abs(changeData.x) > Math.abs(changeData.y));
            }
            if(aollowScroll){
                e.preventDefault();
                changeIndex = Math.ceil(changeData.x/options.oneEleWidth);
                var absChangeIndex = Math.abs(changeIndex);
                if(changeData.x<0){     //往左移动
                    moveToLeft(absChangeIndex,changeData.x,0);
                    /*translate(calcIndex(options.index),(slides[calcIndex(options.index)].dataset.currentTx || 0) - 0 + changeData.x,0);
                     for(var i = options.index,l = showLastIndex;i<=l;i++){
                     calcNextTx(i);
                     }*/
                }else{                  //往右移动
                    moveToRight(absChangeIndex,changeData.x,0);
                }
                isReStart = false;
            }
            prevEleTx = cClone({},eleCurrentTx);
        }
        function touchEnd(e){
            if(!aollowScroll) return;
            //e.preventDefault();
            moveTotal += changeData.x;
            for(var i= 0,l = slides.length;i<l;i++){
                slides[i].dataset.currentTx = eleCurrentTx[i] || 0;
            }
            options.index = calcIndex(Math.ceil(-moveTotal/options.oneEleWidth)-1);
            /*var duration = +new Date - startPos.time,tmp;*/
            /*if(aollowScroll && Math.abs(changeData.x) > 20 && duration < 250){
             tmp = Math.ceil(Math.abs(changeData.x)/duration  - 0.5) * options.oneEleWidth + (slides[options.index].dataset.tx - 0 + eleCurrentTx[options.index])%options.oneEleWidth;  //缓动距离
             var absChangeIndex = Math.ceil(tmp/options.oneEleWidth + 0.5);
             absChangeIndex = absChangeIndex > 2?2:absChangeIndex;

             if(changeData.x < 0 ){
             tmp = -slides[options.index].dataset.tx - eleCurrentTx[options.index] - absChangeIndex*options.oneEleWidth;
             moveToLeft(absChangeIndex-1,tmp,300);
             }else{
             tmp = -slides[options.index].dataset.tx - eleCurrentTx[options.index] + absChangeIndex*options.oneEleWidth;
             moveToRight(absChangeIndex,tmp,300);
             }
             }else{*/
            var tmp = -slides[options.index].dataset.tx - eleCurrentTx[options.index];
            isAnimation = true;
            if(changeData.x < 0){
                if(Math.abs(tmp) > options.oneEleWidth/2){
                    tmp = tmp - options.oneEleWidth;
                    moveToRight(0,tmp,300,false);
                }else{
                    moveToLeft(0,tmp,300,false);
                }
            }else{
                moveToRight(0,tmp,300,false);
            }
            setTimeout(function () {
                isAnimation = false;
            },300);
            /*}*/
            moveTotal += tmp;
            for(var i= 0,l = slides.length;i<l;i++){
                slides[i].dataset.currentTx = eleCurrentTx[i] || 0;
            }
            options.index = calcIndex(Math.ceil(-moveTotal/options.oneEleWidth));

            container.dataset.index = options.index;
            container.dataset.moveTotal = moveTotal

            container.removeEventListener('touchmove',touchMove,false);
            container.removeEventListener('touchend',touchEnd,false);
            container.removeEventListener('touchcancel',touchEnd,false);
        }

        container.addEventListener('touchstart',touchStart,false);

        //停止动画
        function stopAnimation(){
            if(isAnimation){
                for(var i = 0,l = slides.length;i<l;i++){
                    var style = slides[i].style;
                    style.webkitTransitionDuration =
                      style.MozTransitionDuration =
                        style.msTransitionDuration =
                          style.OTransitionDuration =
                            style.transitionDuration =  '0ms';
                }
                isAnimation = false;
            }
        }
        function ScrollHoriAPI(){}
        ScrollHoriAPI.prototype.stopAnimation = stopAnimation;

        return scrollApi;
    }

    win.scrollHori = scrollHori;
})(window);

(function(){
    var id = $.param('id');
    if(!id){
        $.tipShow('缺少必要参数：ID');
        return $.page('home',-1,true);
    }

    $('div#title>div:nth-of-type(2)').Click(function (e) {
        e.stopImmediatePropagation();
        $.page('home',-1,true);
    });

    $('#content>div>div:nth-of-type(2)').Page('home',-1,true);
    $('#content>div>div:nth-of-type(2)>div:nth-of-type(1)').CSS('background-image','url('+ $.$.clubLogo +')');
    $('#content>div>div:nth-of-type(2)>div:nth-of-type(2)').Text($.$.clubName);

    $.ajax({
        url:'../api/v2/club/user_paid_service_item/pay/view',
        isReplaceUrl:true,
        data:{
            id:id
        },
        success: function (result) {
            if(result.statusCode == 200){
                result = result.respData;
                $('#content>div>div:nth-of-type(4)>div:nth-of-type(1)>div:nth-of-type(1)>span').Text(spaceStr(result.couponNo) || '支付处理中...');

                $('#show-coupons-pop>div>div>a').Text(result.shareUrl)

                $('#content>div>div:nth-of-type(3)>div:nth-of-type(4)').Click(function () {
                    if($.$.ua.isWX){
                        $('#_shareMask',true).Class('active');
                    }else{
                        $('#show-coupons-pop').Class('active');
                    }
                });
                $('#show-coupons-pop>div>div:nth-of-type(3)').Click(function () {
                    $('#show-coupons-pop').ClassClear('active');
                });
                $('#content>div>div:nth-of-type(4)').Click(function (e, item) {
                    $.page('couponDetail&userActId='+result.id+'&couponType=paid_service_item');
                });
                if($.$.ua.isWX){
                    $.X5Config({
                        title: $.$.clubName+'-'+result.name+'限时抢购就等你来', //分享标题
                        desc:  '据说这个项目一般人抢不到，但是我觉得你可以！抢项目，约技师，享人间极乐。', // 分享描述
                        link: result.shareUrl, // 分享链接
                        imgUrl: result.imageUrl, // 分享图标
                        success: function (){
                            $('#_shareMask',true).ClassClear('active');
                        },
                        cancel: function () {
                            //用户取消分享后执行的回调函数
                        },
                        fail: function (res) {
                            $.tipShow("分享失败！请稍后再试！");
                        }
                    });
                }
            }else{
                $.tipShow(result.msg || '查询出错');
            }
        }
    });

    //加载推荐技师
    $.ajax({
        url:'../api/v2/club/top/techs',
        isReplaceUrl:true,
        data:{
            clubId: $.$.clubID
        },
        success: function (result) {
            if(result.statusCode == 200){
                var _techHtml = [],result = result.respData;
                result.forEach(function (techObj,index) {
                    if(index > 4) return false;
                    _techHtml.push('<div data-tech-id="'+techObj.id+'">\
                                        <div style="background-image: url('+(techObj.avatarUrl || $.$.defaultHeader)+')"></div>\
                                        <div><span>'+techObj.name+'</span><span>'+(techObj.star/20).toFixed(1)+'</span>\
                                        </div>\
                                        <div>'+techObj.orderCount+' 人约</div>\
                                    </div>');
                });
                if(_techHtml.length > 0){
                    $('#content>div>div:nth-of-type(5)').ClassClear('hide');
                    $('#content>div>div:nth-of-type(5)>div:nth-of-type(2)>div').Html(_techHtml.join(''));
                    scrollHori({
                        container:$('#content>div>div:nth-of-type(5)>div:nth-of-type(2)>div')[0],
                        showEleCount:4
                    });
                    $('#content>div>div:nth-of-type(5)>div:nth-of-type(1)').Page('technicianList');
                    $('#content>div>div:nth-of-type(5)>div:nth-of-type(2)>div>div').Click(function (e, item) {
                        $.page('technicianDetail&id='+item.dataset.techId);
                    });
                }
            }
        }
    });

    $.pageSwitch();


    /**
     * 用空格来间隔字符串
     * @param str     字符串
     * @param last    逆向开始
     * @param num     多少个字符一间隔
     * @param space   间隔几个空格
     */
    function spaceStr(str,last,num,space){
        if(!str) return;
        var tmpArr = [],spaceStr='';
        last = last===true;
        num = Math.abs(num || 4);
        space = Math.abs(space || 1);
        str = str.split('');
        if(last){
            str = str.reverse();
        }
        for(var j=space;j>0;j--){
            spaceStr+=' ';
        }
        str.forEach(function (v, i) {
            tmpArr.push(v);
            if((i+1)%num == 0){
                tmpArr.push(spaceStr);
            }
        });
        if(last){
            tmpArr.reverse();
        }
        return tmpArr.join('');
    }
})();