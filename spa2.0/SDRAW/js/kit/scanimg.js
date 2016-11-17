(function(win,doc){
    var support = { transform3d: ("WebKitCSSMatrix" in win && "m11" in new WebKitCSSMatrix()), touch: ("ontouchstart" in win) };

    function getTranslate(x, y){
        var distX = x, distY = y;
        return support.transform3d ? "translate3d("+ distX +"px, "+ distY +"px, 0)" : "translate("+ distX +"px, "+ distY +"px)";
    }

    function getPage(event, page) {
        return support.touch ? event.changedTouches[0][page] : event[page];
    }

    function ImgScan(){};

    ImgScan.prototype = {
        init: function(param){ // 给初始化数据
            param = param || {};
            this.imgWrap   = param.imgWrap;//图片的外侧wrap
            this.img = null;
            this.hideScanImgWrap = false;//标记
            this.buffMove   = 3; //缓冲系数
            this.finger = false; //触摸手指的状态 false：单手指 true：多手指
            this.closeCallback = param.closeCallback;
            this._destroy();
            var self = this;

            // 获取浏览器支持的transitionEnd event name
           /* var style= doc.querySelector("body").style,
                transitionEnd=(function(){
                var transEndEventNames = {
                    WebkitTransition : 'webkitTransitionEnd',
                    MozTransition: 'transitionend',
                    OTransition: 'oTransitionEnd',
                    transition: 'transitionend'
                };
                for(var name in transEndEventNames){
                    if(typeof style[name] === "string"){
                        return transEndEventNames[name]
                    }
                }
            })();*/

            //点击的时候隐藏图片查看
            this.imgWrap.addEventListener("click",function(){
                if(self.showImgTime && (new Date()).getTime()-self.showImgTime<500) return;
                if(self.imgWrap.className=="show"){
                    self.close();
                }
            });
            /*this.imgWrap.addEventListener(transitionEnd,function(){
                if(self.hideScanImgWrap)  self.imgWrap.className="hide";
            });*/
        },
        close: function(){
            this.imgWrap.className = "hide";
            this.hideScanImgWrap=true;
            this._destroy();
            this.img.ontouchstart=null;
            this.img.ontouchmove=null;
            this.img.ontouchend=null;
            doc.removeEventListener("touchmove", this.eventStop, false);
            if(this.closeCallback) this.closeCallback(this.img,this.loadImgStyle);
        },
        showImg: function(targetImg){
            this.img=targetImg;
            this.imgWrap.appendChild(this.img);
            this.loadImgStyle = this.img.style.cssText;
            var winWidth = document.documentElement.clientWidth || window.innerWidth,
                rawWidth = this.img.getAttribute("w"),
                rawHeight = this.img.getAttribute("h"),
                ratio = winWidth/rawWidth,
                offsetHeight = rawHeight*ratio,
                self = this;
            this.img.style.height = offsetHeight+"px";
            this.img.style.width = winWidth+"px";
            this.img.style.marginTop = "-"+(offsetHeight/2)+"px";
            doc.addEventListener("touchmove", self.eventStop, false);// 禁止页面滚动
            this.imgBaseWidth  = winWidth;
            this.imgBaseHeight = offsetHeight;
            this.addEventStart({
                wrapX: self.imgWrap.offsetWidth,
                wrapY: self.imgWrap.offsetHeight,
                mapX: winWidth,
                mapY: offsetHeight
            });
            //this.imgWrap.className = "";
            this.hideScanImgWrap=false;
            this.lastTapTime = null;
            this.closeTimeOut = null;
            /*setTimeout(function(){
                self.imgWrap.className="show";
            },10);*/
            this.imgWrap.className="show";
            this.showImgTime = new Date().getTime();

            /////添加事件
            this.img.ontouchstart=function(e){
                self._touchStart(e);
            };

            this.img.ontouchmove=function(e){
                self._touchMove(e);
            };

            this.img.ontouchend=function(e){
                self._touchEnd(e);
            };
        },
        addEventStart: function(param){
            param = param || {};
            this.wrapX = param.wrapX || 0; 	//可视区域宽度
            this.wrapY = param.wrapY || 0; 	//可视区域高度
            this.mapX  = param.mapX || 0;
            this.mapY  = param.mapY || 0;
            this.width  = this.mapX - this.wrapX;   //图的宽度减去可视区域的宽度
            this.height = this.mapY - this.wrapY;   //图的高度减去可视区域的高度
        },
        _destroy: function(){// 重置坐标数据
            this.distX = 0; this.distY = 0; this.newX  = 0; this.newY  = 0;
        },
        _changeData: function(){// 更新地图信息
            this.mapX     = this.img.offsetWidth;
            this.mapY     = this.img.offsetHeight;
            this.width    = this.mapX - this.wrapX;   //图片的宽度减去可视区域的宽度
            this.height   = this.mapY - this.wrapY;   //图片的高度减去可视区域的高度
        },
        _touchStart: function(e){
            e.preventDefault();
            var touchTarget = e.targetTouches.length; //获得触控点数
            this._changeData(); //重新初始化图片、可视区域数据

            if(touchTarget == 1){// 获取开始坐标
                this.basePageX = getPage(e, "pageX");
                this.basePageY = getPage(e, "pageY");
                this.finger = false;
            } else{
                this.finger = true;
                this.startFingerDist = this.getTouchDist(e).dist;
                this.startFingerX = this.getTouchDist(e).x;
                this.startFingerY = this.getTouchDist(e).y;
            }
        },
        _touchMove: function(e){
            e.preventDefault();
            e.stopPropagation();
            var touchTarget = e.targetTouches.length; //获得触控点数
            if(touchTarget == 1 && !this.finger){
                this._move(e);
            }
            if(touchTarget>=2){
                this._zoom(e);
            }
        },
        _touchEnd: function(e){
            var endPageX = getPage(e, "pageX"), endPageY = getPage(e, "pageY");
            var self = this;
            if(this.basePageX && this.basePageY){
                if(endPageX == this.basePageX && endPageY==this.basePageY){
                    /*if (!this.lastTapTime) {
                        this.lastTapTime = new Date().getTime();
                        this.closeTimeOut = setTimeout(function(){
                            self.imgWrap.click();//退出图片浏览
                        },300);
                    }
                    else {
                        var currTime = new Date().getTime();
                        console.log(currTime-this.lastTapTime);
                        if(currTime-this.lastTapTime<300){//双击
                            if(this.closeTimeOut) win.clearTimeout(this.closeTimeOut);
                            //////处理双击
                            this.startFingerX = endPageX;
                            this.startFingerY = endPageY;
                            var currWidth = parseInt(this.img.style.width);
                            if(currWidth && currWidth>this.imgBaseWidth){//缩小
                                this.zoomImg(this.imgBaseWidth/currWidth);
                            }
                            else{//放大
                                this.zoomImg(1.5);
                            }
                        }
                        else{
                            return self.imgWrap.click();//退出图片浏览
                        }
                        this.lastTapTime = null;
                    }*/

                    return self.imgWrap.click();//退出图片浏览
                }
            }

            this._changeData(); //重新计算数据
            if(this.finger){
                this.distX = -this.imgNewX;
                this.distY = -this.imgNewY;
            }
            if( this.distX>0 ){
                this.newX = 0;
            }else if( this.distX<=0 && this.distX>=-this.width ){
                this.newX = this.distX;
                this.newY = this.distY;
            }else if( this.distX<-this.width ){
                this.newX = -this.width;
            }
            this.reset();
        },
        _move: function(e){
            var pageX = getPage(e, "pageX"), pageY = getPage(e, "pageY");//获取移动坐标

            // 获得移动距离
            this.distX = (pageX - this.basePageX) + this.newX;
            this.distY = (pageY - this.basePageY) + this.newY;

            if(this.distX > 0){
                this.moveX = Math.round(this.distX/this.buffMove);
            }else if( this.distX<=0 && this.distX>=-this.width ){
                this.moveX = this.distX;
            }else if(this.distX < -this.width ){
                this.moveX = -this.width+Math.round((this.distX+this.width)/this.buffMove);
            }
            this.movePos();
            this.finger = false;
        },
        _zoom: function(e){// 图片缩放
            var nowFingerDist = this.getTouchDist(e).dist, //获得当前长度
                ratio = nowFingerDist/this.startFingerDist; //计算缩放比
            this.zoomImg(ratio);
            this.finger = true;
        },
        zoomImg:function(ratio){
           /*var imgWidth = Math.round(this.mapX * ratio); //计算图片宽度

            // 计算图片新的坐标
            this.imgNewX = Math.round(this.startFingerX * ratio - this.startFingerX - this.newX * ratio);
            this.imgNewY = Math.round((this.startFingerY * ratio - this.startFingerY)/2 - this.newY * ratio);

            if(imgWidth >= this.imgBaseWidth){
                this.img.style.width = imgWidth + "px";
                this.refresh(-this.imgNewX, -this.imgNewY, "0s", "ease");
            }else{
                if(imgWidth < this.imgBaseWidth){
                    this.img.style.width = this.imgBaseWidth + "px";
                }
            }*/
        },
        movePos: function(){// 移动坐标
            if(this.height<0){
                if(this.img.offsetWidth == this.imgBaseWidth){
                    this.moveY = Math.round(this.distY/this.buffMove);
                }else{
                    var moveTop = Math.round((this.img.offsetHeight-this.imgBaseHeight)/2);
                    this.moveY = -moveTop + Math.round((this.distY + moveTop)/this.buffMove);
                }
            }else{
                var a = Math.round((this.wrapY - this.imgBaseHeight)/2),
                    b = this.img.offsetHeight - this.wrapY + Math.round(this.wrapY - this.imgBaseHeight)/2;
                if(this.distY >= -a){
                    this.moveY = Math.round((this.distY + a)/this.buffMove) - a;
                }else if(this.distY <= -b){
                    this.moveY = Math.round((this.distY + b)/this.buffMove) - b;
                }else{
                    this.moveY = this.distY;
                }
            }
            this.refresh(this.moveX, this.moveY, "0s", "ease");
        },
        reset: function(){// 重置数据
            var hideTime = ".2s";
            if(this.height<0){
                this.newY = -Math.round(this.img.offsetHeight - this.imgBaseHeight)/2;
            }else{
                var a = Math.round((this.wrapY - this.imgBaseHeight)/2),
                    b = this.img.offsetHeight - this.wrapY + Math.round(this.wrapY - this.imgBaseHeight)/2;
                if(this.distY >= -a){
                    this.newY = -a;
                }else if(this.distY <= -b){
                    this.newY = -b;
                }else{
                    this.newY = this.distY;
                }
            }
            this.refresh(this.newX, this.newY, hideTime, "ease-in-out");
        },
        refresh: function(x, y, timer, type){// 执行图片移动
            this.img.style.webkitTransitionProperty = "-webkit-transform";
            this.img.style.webkitTransitionDuration = timer;
            this.img.style.webkitTransitionTimingFunction = type;
            this.img.style.webkitTransform = getTranslate(x, y);
        },
        getTouchDist: function(e){// 获取多点触控
            var x1 = e.touches[0].pageX,  y1 = e.touches[0].pageY - doc.body.scrollTop ,  x2 = e.touches[1].pageX,  y2 = e.touches[1].pageY - doc.body.scrollTop,  x3 = 0,  y3 = 0;
            if(!x1 || !x2) return;

            if(x1<=x2){
                x3 = (x2-x1)/2+x1;
            }else{
                x3 = (x1-x2)/2+x2;
            }
            if(y1<=y2){
                y3 = (y2-y1)/2+y1;
            }else{
                y3 = (y1-y2)/2+y2;
            }
            return { dist: Math.round(Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2))),  x: Math.round(x3), y: Math.round(y3) };
        },
        eventStop: function(e){
            e.preventDefault();
            e.stopPropagation();
        }
    };
    win.ImgScan = ImgScan;
})(window,document);