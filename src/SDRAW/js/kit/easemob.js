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
/*! iScroll v5.1.3 ~ (c) 2008-2014 Matteo Spinelli ~ http://cubiq.org/license */
(function(f,a,e){var h=f.requestAnimationFrame||f.webkitRequestAnimationFrame||f.mozRequestAnimationFrame||f.oRequestAnimationFrame||f.msRequestAnimationFrame||function(i){f.setTimeout(i,1000/60)};var c=(function(){var m={};var n=a.createElement("div").style;var k=(function(){var r=["t","webkitT","MozT","msT","OT"],p,q=0,o=r.length;for(;q<o;q++){p=r[q]+"ransform";if(p in n){return r[q].substr(0,r[q].length-1)}}return false})();function l(o){if(k===false){return false}if(k===""){return o}return k+o.charAt(0).toUpperCase()+o.substr(1)}m.getTime=Date.now||function i(){return new Date().getTime()};m.extend=function(q,p){for(var o in p){q[o]=p[o]}};m.addEvent=function(r,q,p,o){r.addEventListener(q,p,!!o)};m.removeEvent=function(r,q,p,o){r.removeEventListener(q,p,!!o)};m.prefixPointerEvent=function(o){return f.MSPointerEvent?"MSPointer"+o.charAt(9).toUpperCase()+o.substr(10):o};m.momentum=function(u,q,r,o,v,w){var p=u-q,s=e.abs(p)/r,x,t;w=w===undefined?0.0006:w;x=u+(s*s)/(2*w)*(p<0?-1:1);t=s/w;if(x<o){x=v?o-(v/2.5*(s/8)):o;p=e.abs(x-u);t=p/s}else{if(x>0){x=v?v/2.5*(s/8):0;p=e.abs(u)+x;t=p/s}}return{destination:e.round(x),duration:t}};var j=l("transform");m.extend(m,{hasTransform:j!==false,hasPerspective:l("perspective") in n,hasTouch:"ontouchstart" in f,hasPointer:f.PointerEvent||f.MSPointerEvent,hasTransition:l("transition") in n});m.isBadAndroid=/Android /.test(f.navigator.appVersion)&&!(/Chrome\/\d/.test(f.navigator.appVersion));m.extend(m.style={},{transform:j,transitionTimingFunction:l("transitionTimingFunction"),transitionDuration:l("transitionDuration"),transitionDelay:l("transitionDelay"),transformOrigin:l("transformOrigin")});m.hasClass=function(p,q){var o=new RegExp("(^|\\s)"+q+"(\\s|$)");return o.test(p.className)};m.addClass=function(p,q){if(m.hasClass(p,q)){return}var o=p.className.split(" ");o.push(q);p.className=o.join(" ")};m.removeClass=function(p,q){if(!m.hasClass(p,q)){return}var o=new RegExp("(^|\\s)"+q+"(\\s|$)","g");p.className=p.className.replace(o," ")};m.offset=function(o){var q=-o.offsetLeft,p=-o.offsetTop;while(o=o.offsetParent){q-=o.offsetLeft;p-=o.offsetTop}return{left:q,top:p}};m.preventDefaultException=function(q,p){for(var o in p){if(p[o].test(q[o])){return true}}return false};m.extend(m.eventType={},{touchstart:1,touchmove:1,touchend:1,mousedown:2,mousemove:2,mouseup:2,pointerdown:3,pointermove:3,pointerup:3,MSPointerDown:3,MSPointerMove:3,MSPointerUp:3});m.extend(m.ease={},{quadratic:{style:"cubic-bezier(0.25, 0.46, 0.45, 0.94)",fn:function(o){return o*(2-o)}},circular:{style:"cubic-bezier(0.1, 0.57, 0.1, 1)",fn:function(o){return e.sqrt(1-(--o*o))}},back:{style:"cubic-bezier(0.175, 0.885, 0.32, 1.275)",fn:function(p){var o=4;return(p=p-1)*p*((o+1)*p+o)+1}},bounce:{style:"",fn:function(o){if((o/=1)<(1/2.75)){return 7.5625*o*o}else{if(o<(2/2.75)){return 7.5625*(o-=(1.5/2.75))*o+0.75}else{if(o<(2.5/2.75)){return 7.5625*(o-=(2.25/2.75))*o+0.9375}else{return 7.5625*(o-=(2.625/2.75))*o+0.984375}}}}},elastic:{style:"",fn:function(o){var p=0.22,q=0.4;if(o===0){return 0}if(o==1){return 1}return(q*e.pow(2,-10*o)*e.sin((o-p/4)*(2*e.PI)/p)+1)}}});m.tap=function(q,o){var p=a.createEvent("Event");p.initEvent(o,true,true);p.pageX=q.pageX;p.pageY=q.pageY;q.target.dispatchEvent(p)};m.click=function(q){var p=q.target,o;if(!(/(SELECT|INPUT|TEXTAREA)/i).test(p.tagName)){o=a.createEvent("MouseEvents");o.initMouseEvent("click",true,true,q.view,1,p.screenX,p.screenY,p.clientX,p.clientY,q.ctrlKey,q.altKey,q.shiftKey,q.metaKey,0,null);o._constructed=true;p.dispatchEvent(o)}};return m})();function g(l,j){this.wrapper=typeof l=="string"?a.querySelector(l):l;this.scroller=this.wrapper.children[0];this.scrollerStyle=this.scroller.style;this.options={resizeScrollbars:true,mouseWheelSpeed:20,snapThreshold:0.334,startX:0,startY:0,scrollY:true,directionLockThreshold:5,momentum:true,bounce:true,bounceTime:600,bounceEasing:"",preventDefault:true,preventDefaultException:{tagName:/^(INPUT|TEXTAREA|BUTTON|SELECT)$/},HWCompositing:true,useTransition:true,useTransform:true};for(var k in j){this.options[k]=j[k]}this.translateZ=this.options.HWCompositing&&c.hasPerspective?" translateZ(0)":"";this.options.useTransition=c.hasTransition&&this.options.useTransition;this.options.useTransform=c.hasTransform&&this.options.useTransform;this.options.eventPassthrough=this.options.eventPassthrough===true?"vertical":this.options.eventPassthrough;this.options.preventDefault=!this.options.eventPassthrough&&this.options.preventDefault;this.options.scrollY=this.options.eventPassthrough=="vertical"?false:this.options.scrollY;this.options.scrollX=this.options.eventPassthrough=="horizontal"?false:this.options.scrollX;this.options.freeScroll=this.options.freeScroll&&!this.options.eventPassthrough;this.options.directionLockThreshold=this.options.eventPassthrough?0:this.options.directionLockThreshold;this.options.bounceEasing=typeof this.options.bounceEasing=="string"?c.ease[this.options.bounceEasing]||c.ease.circular:this.options.bounceEasing;this.options.resizePolling=this.options.resizePolling===undefined?60:this.options.resizePolling;if(this.options.tap===true){this.options.tap="tap"}if(this.options.shrinkScrollbars=="scale"){this.options.useTransition=false}this.options.invertWheelDirection=this.options.invertWheelDirection?-1:1;if(this.options.probeType==3){this.options.useTransition=false}this.x=0;this.y=0;this.directionX=0;this.directionY=0;this._events={};this._init();this.refresh();this.scrollTo(this.options.startX,this.options.startY);this.enable()}g.prototype={version:"5.1.3",_init:function(){this._initEvents();if(this.options.scrollbars||this.options.indicators){this._initIndicators()}if(this.options.mouseWheel){this._initWheel()}if(this.options.snap){this._initSnap()}if(this.options.keyBindings){this._initKeys()}},destroy:function(){this._initEvents(true);this._execEvent("destroy")},_transitionEnd:function(i){if(i.target!=this.scroller||!this.isInTransition){return}this._transitionTime();if(!this.resetPosition(this.options.bounceTime)){this.isInTransition=false;this._execEvent("scrollEnd")}},_start:function(j){if(c.eventType[j.type]!=1){if(j.button!==0){return}}if(!this.enabled||(this.initiated&&c.eventType[j.type]!==this.initiated)){return}if(this.options.preventDefault&&!c.isBadAndroid&&!c.preventDefaultException(j.target,this.options.preventDefaultException)){j.preventDefault()}var i=j.touches?j.touches[0]:j,k;this.initiated=c.eventType[j.type];this.moved=false;this.distX=0;this.distY=0;this.directionX=0;this.directionY=0;this.directionLocked=0;this._transitionTime();this.startTime=c.getTime();if(this.options.useTransition&&this.isInTransition){this.isInTransition=false;k=this.getComputedPosition();this._translate(e.round(k.x),e.round(k.y));this._execEvent("scrollEnd")}else{if(!this.options.useTransition&&this.isAnimating){this.isAnimating=false;this._execEvent("scrollEnd")}}this.startX=this.x;this.startY=this.y;this.absStartX=this.x;this.absStartY=this.y;this.pointX=i.pageX;this.pointY=i.pageY;this._execEvent("beforeScrollStart")},_move:function(n){if(!this.enabled||c.eventType[n.type]!==this.initiated){return}if(this.options.preventDefault){n.preventDefault()}var p=n.touches?n.touches[0]:n,k=p.pageX-this.pointX,j=p.pageY-this.pointY,o=c.getTime(),i,q,m,l;this.pointX=p.pageX;this.pointY=p.pageY;this.distX+=k;this.distY+=j;m=e.abs(this.distX);l=e.abs(this.distY);if(o-this.endTime>300&&(m<10&&l<10)){return}if(!this.directionLocked&&!this.options.freeScroll){if(m>l+this.options.directionLockThreshold){this.directionLocked="h"}else{if(l>=m+this.options.directionLockThreshold){this.directionLocked="v"}else{this.directionLocked="n"}}}if(this.directionLocked=="h"){if(this.options.eventPassthrough=="vertical"){n.preventDefault()}else{if(this.options.eventPassthrough=="horizontal"){this.initiated=false;return}}j=0}else{if(this.directionLocked=="v"){if(this.options.eventPassthrough=="horizontal"){n.preventDefault()}else{if(this.options.eventPassthrough=="vertical"){this.initiated=false;return}}k=0}}k=this.hasHorizontalScroll?k:0;j=this.hasVerticalScroll?j:0;i=this.x+k;q=this.y+j;if(i>0||i<this.maxScrollX){i=this.options.bounce?this.x+k/3:i>0?0:this.maxScrollX}if(q>0||q<this.maxScrollY){q=this.options.bounce?this.y+j/3:q>0?0:this.maxScrollY}this.directionX=k>0?-1:k<0?1:0;this.directionY=j>0?-1:j<0?1:0;if(!this.moved){this._execEvent("scrollStart")}this.moved=true;this._translate(i,q);if(o-this.startTime>300){this.startTime=o;this.startX=this.x;this.startY=this.y;if(this.options.probeType==1){this._execEvent("scroll")}}if(this.options.probeType>1){this._execEvent("scroll")}},_end:function(o){if(!this.enabled||c.eventType[o.type]!==this.initiated){return}if(this.options.preventDefault&&!c.preventDefaultException(o.target,this.options.preventDefaultException)){o.preventDefault()}var q=o.changedTouches?o.changedTouches[0]:o,k,j,n=c.getTime()-this.startTime,i=e.round(this.x),t=e.round(this.y),s=e.abs(i-this.startX),r=e.abs(t-this.startY),l=0,p="";this.isInTransition=0;this.initiated=0;this.endTime=c.getTime();if(this.resetPosition(this.options.bounceTime)){return}this.scrollTo(i,t);if(!this.moved){if(this.options.tap){c.tap(o,this.options.tap)}if(this.options.click){c.click(o)}this._execEvent("scrollCancel");return}if(this._events.flick&&n<200&&s<100&&r<100){this._execEvent("flick");return}if(this.options.momentum&&n<300){k=this.hasHorizontalScroll?c.momentum(this.x,this.startX,n,this.maxScrollX,this.options.bounce?this.wrapperWidth:0,this.options.deceleration):{destination:i,duration:0};j=this.hasVerticalScroll?c.momentum(this.y,this.startY,n,this.maxScrollY,this.options.bounce?this.wrapperHeight:0,this.options.deceleration):{destination:t,duration:0};i=k.destination;t=j.destination;l=e.max(k.duration,j.duration);this.isInTransition=1}if(this.options.snap){var m=this._nearestSnap(i,t);this.currentPage=m;l=this.options.snapSpeed||e.max(e.max(e.min(e.abs(i-m.x),1000),e.min(e.abs(t-m.y),1000)),300);i=m.x;t=m.y;this.directionX=0;this.directionY=0;p=this.options.bounceEasing}if(i!=this.x||t!=this.y){if(i>0||i<this.maxScrollX||t>0||t<this.maxScrollY){p=c.ease.quadratic}this.scrollTo(i,t,l,p);return}this._execEvent("scrollEnd")},_resize:function(){var i=this;clearTimeout(this.resizeTimeout);this.resizeTimeout=setTimeout(function(){i.refresh()},this.options.resizePolling)},resetPosition:function(j){var i=this.x,k=this.y;j=j||0;if(!this.hasHorizontalScroll||this.x>0){i=0}else{if(this.x<this.maxScrollX){i=this.maxScrollX}}if(!this.hasVerticalScroll||this.y>0){k=0}else{if(this.y<this.maxScrollY){k=this.maxScrollY}}if(i==this.x&&k==this.y){return false}this.scrollTo(i,k,j,this.options.bounceEasing);return true},disable:function(){this.enabled=false},enable:function(){this.enabled=true},refresh:function(){var i=this.wrapper.offsetHeight;this.wrapperWidth=this.wrapper.clientWidth;this.wrapperHeight=this.wrapper.clientHeight;this.scrollerWidth=this.scroller.offsetWidth;this.scrollerHeight=this.scroller.offsetHeight;this.maxScrollX=this.wrapperWidth-this.scrollerWidth;this.maxScrollY=this.wrapperHeight-this.scrollerHeight;this.hasHorizontalScroll=this.options.scrollX&&this.maxScrollX<0;this.hasVerticalScroll=this.options.scrollY&&this.maxScrollY<0;if(!this.hasHorizontalScroll){this.maxScrollX=0;this.scrollerWidth=this.wrapperWidth}if(!this.hasVerticalScroll){this.maxScrollY=0;this.scrollerHeight=this.wrapperHeight}this.endTime=0;this.directionX=0;this.directionY=0;this.wrapperOffset=c.offset(this.wrapper);this._execEvent("refresh");this.resetPosition()},on:function(j,i){if(!this._events[j]){this._events[j]=[]}this._events[j].push(i)},off:function(k,j){if(!this._events[k]){return}var i=this._events[k].indexOf(j);if(i>-1){this._events[k].splice(i,1)}},_execEvent:function(m){if(!this._events[m]){return}var k=0,j=this._events[m].length;if(!j){return}for(;k<j;k++){this._events[m][k].apply(this,[].slice.call(arguments,1))}},scrollBy:function(i,l,j,k){i=this.x+i;l=this.y+l;j=j||0;this.scrollTo(i,l,j,k)},scrollTo:function(i,l,j,k){k=k||c.ease.circular;this.isInTransition=this.options.useTransition&&j>0;if(!j||(this.options.useTransition&&k.style)){this._transitionTimingFunction(k.style);this._transitionTime(j);this._translate(i,l)}else{this._animate(i,l,j,k.fn)}},scrollToElement:function(j,k,i,n,m){j=j.nodeType?j:this.scroller.querySelector(j);if(!j){return}var l=c.offset(j);l.left-=this.wrapperOffset.left;l.top-=this.wrapperOffset.top;if(i===true){i=e.round(j.offsetWidth/2-this.wrapper.offsetWidth/2)}if(n===true){n=e.round(j.offsetHeight/2-this.wrapper.offsetHeight/2)}l.left-=i||0;l.top-=n||0;l.left=l.left>0?0:l.left<this.maxScrollX?this.maxScrollX:l.left;l.top=l.top>0?0:l.top<this.maxScrollY?this.maxScrollY:l.top;k=k===undefined||k===null||k==="auto"?e.max(e.abs(this.x-l.left),e.abs(this.y-l.top)):k;this.scrollTo(l.left,l.top,k,m)},_transitionTime:function(k){k=k||0;this.scrollerStyle[c.style.transitionDuration]=k+"ms";if(!k&&c.isBadAndroid){this.scrollerStyle[c.style.transitionDuration]="0.001s"}if(this.indicators){for(var j=this.indicators.length;j--;){this.indicators[j].transitionTime(k)}}},_transitionTimingFunction:function(k){this.scrollerStyle[c.style.transitionTimingFunction]=k;if(this.indicators){for(var j=this.indicators.length;j--;){this.indicators[j].transitionTimingFunction(k)}}},_translate:function(j,l){if(this.options.useTransform){this.scrollerStyle[c.style.transform]="translate("+j+"px,"+l+"px)"+this.translateZ}else{j=e.round(j);l=e.round(l);this.scrollerStyle.left=j+"px";this.scrollerStyle.top=l+"px"}this.x=j;this.y=l;if(this.indicators){for(var k=this.indicators.length;k--;){this.indicators[k].updatePosition()}}},_initEvents:function(i){var j=i?c.removeEvent:c.addEvent,k=this.options.bindToWrapper?this.wrapper:f;j(f,"orientationchange",this);j(f,"resize",this);if(this.options.click){j(this.wrapper,"click",this,true)}if(!this.options.disableMouse){j(this.wrapper,"mousedown",this);j(k,"mousemove",this);j(k,"mousecancel",this);j(k,"mouseup",this)}if(c.hasPointer&&!this.options.disablePointer){j(this.wrapper,c.prefixPointerEvent("pointerdown"),this);j(k,c.prefixPointerEvent("pointermove"),this);j(k,c.prefixPointerEvent("pointercancel"),this);j(k,c.prefixPointerEvent("pointerup"),this)}if(c.hasTouch&&!this.options.disableTouch){j(this.wrapper,"touchstart",this);j(k,"touchmove",this);j(k,"touchcancel",this);j(k,"touchend",this)}j(this.scroller,"transitionend",this);j(this.scroller,"webkitTransitionEnd",this);j(this.scroller,"oTransitionEnd",this);j(this.scroller,"MSTransitionEnd",this)},getComputedPosition:function(){var j=f.getComputedStyle(this.scroller,null),i,k;if(this.options.useTransform){j=j[c.style.transform].split(")")[0].split(", ");i=+(j[12]||j[4]);k=+(j[13]||j[5])}else{i=+j.left.replace(/[^-\d.]/g,"");k=+j.top.replace(/[^-\d.]/g,"")}return{x:i,y:k}},_initIndicators:function(){var l=this.options.interactiveScrollbars,n=typeof this.options.scrollbars!="string",p=[],k;var o=this;this.indicators=[];if(this.options.scrollbars){if(this.options.scrollY){k={el:d("v",l,this.options.scrollbars),interactive:l,defaultScrollbars:true,customStyle:n,resize:this.options.resizeScrollbars,shrink:this.options.shrinkScrollbars,fade:this.options.fadeScrollbars,listenX:false};this.wrapper.appendChild(k.el);p.push(k)}if(this.options.scrollX){k={el:d("h",l,this.options.scrollbars),interactive:l,defaultScrollbars:true,customStyle:n,resize:this.options.resizeScrollbars,shrink:this.options.shrinkScrollbars,fade:this.options.fadeScrollbars,listenY:false};this.wrapper.appendChild(k.el);p.push(k)}}if(this.options.indicators){p=p.concat(this.options.indicators)}for(var m=p.length;m--;){this.indicators.push(new b(this,p[m]))}function j(r){for(var q=o.indicators.length;q--;){r.call(o.indicators[q])}}if(this.options.fadeScrollbars){this.on("scrollEnd",function(){j(function(){this.fade()})});this.on("scrollCancel",function(){j(function(){this.fade()})});this.on("scrollStart",function(){j(function(){this.fade(1)})});this.on("beforeScrollStart",function(){j(function(){this.fade(1,true)})})}this.on("refresh",function(){j(function(){this.refresh()})});this.on("destroy",function(){j(function(){this.destroy()});delete this.indicators})},_initWheel:function(){c.addEvent(this.wrapper,"wheel",this);c.addEvent(this.wrapper,"mousewheel",this);c.addEvent(this.wrapper,"DOMMouseScroll",this);this.on("destroy",function(){c.removeEvent(this.wrapper,"wheel",this);c.removeEvent(this.wrapper,"mousewheel",this);c.removeEvent(this.wrapper,"DOMMouseScroll",this)})},_wheel:function(m){if(!this.enabled){return}m.preventDefault();m.stopPropagation();var k,j,n,l,i=this;if(this.wheelTimeout===undefined){i._execEvent("scrollStart")}clearTimeout(this.wheelTimeout);this.wheelTimeout=setTimeout(function(){i._execEvent("scrollEnd");i.wheelTimeout=undefined},400);if("deltaX" in m){if(m.deltaMode===1){k=-m.deltaX*this.options.mouseWheelSpeed;j=-m.deltaY*this.options.mouseWheelSpeed}else{k=-m.deltaX;j=-m.deltaY}}else{if("wheelDeltaX" in m){k=m.wheelDeltaX/120*this.options.mouseWheelSpeed;j=m.wheelDeltaY/120*this.options.mouseWheelSpeed}else{if("wheelDelta" in m){k=j=m.wheelDelta/120*this.options.mouseWheelSpeed}else{if("detail" in m){k=j=-m.detail/3*this.options.mouseWheelSpeed}else{return}}}}k*=this.options.invertWheelDirection;j*=this.options.invertWheelDirection;if(!this.hasVerticalScroll){k=j;j=0}if(this.options.snap){n=this.currentPage.pageX;l=this.currentPage.pageY;if(k>0){n--}else{if(k<0){n++}}if(j>0){l--}else{if(j<0){l++}}this.goToPage(n,l);return}n=this.x+e.round(this.hasHorizontalScroll?k:0);l=this.y+e.round(this.hasVerticalScroll?j:0);if(n>0){n=0}else{if(n<this.maxScrollX){n=this.maxScrollX}}if(l>0){l=0}else{if(l<this.maxScrollY){l=this.maxScrollY}}this.scrollTo(n,l,0);if(this.options.probeType>1){this._execEvent("scroll")}},_initSnap:function(){this.currentPage={};if(typeof this.options.snap=="string"){this.options.snap=this.scroller.querySelectorAll(this.options.snap)}this.on("refresh",function(){var s=0,q,o=0,k,r,p,u=0,t,w=this.options.snapStepX||this.wrapperWidth,v=this.options.snapStepY||this.wrapperHeight,j;this.pages=[];if(!this.wrapperWidth||!this.wrapperHeight||!this.scrollerWidth||!this.scrollerHeight){return}if(this.options.snap===true){r=e.round(w/2);p=e.round(v/2);while(u>-this.scrollerWidth){this.pages[s]=[];q=0;t=0;while(t>-this.scrollerHeight){this.pages[s][q]={x:e.max(u,this.maxScrollX),y:e.max(t,this.maxScrollY),width:w,height:v,cx:u-r,cy:t-p};t-=v;q++}u-=w;s++}}else{j=this.options.snap;q=j.length;k=-1;for(;s<q;s++){if(s===0||j[s].offsetLeft<=j[s-1].offsetLeft){o=0;k++}if(!this.pages[o]){this.pages[o]=[]}u=e.max(-j[s].offsetLeft,this.maxScrollX);t=e.max(-j[s].offsetTop,this.maxScrollY);r=u-e.round(j[s].offsetWidth/2);p=t-e.round(j[s].offsetHeight/2);this.pages[o][k]={x:u,y:t,width:j[s].offsetWidth,height:j[s].offsetHeight,cx:r,cy:p};if(u>this.maxScrollX){o++}}}this.goToPage(this.currentPage.pageX||0,this.currentPage.pageY||0,0);if(this.options.snapThreshold%1===0){this.snapThresholdX=this.options.snapThreshold;this.snapThresholdY=this.options.snapThreshold}else{this.snapThresholdX=e.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].width*this.options.snapThreshold);this.snapThresholdY=e.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].height*this.options.snapThreshold)}});this.on("flick",function(){var i=this.options.snapSpeed||e.max(e.max(e.min(e.abs(this.x-this.startX),1000),e.min(e.abs(this.y-this.startY),1000)),300);this.goToPage(this.currentPage.pageX+this.directionX,this.currentPage.pageY+this.directionY,i)})},_nearestSnap:function(k,p){if(!this.pages.length){return{x:0,y:0,pageX:0,pageY:0}}var o=0,n=this.pages.length,j=0;if(e.abs(k-this.absStartX)<this.snapThresholdX&&e.abs(p-this.absStartY)<this.snapThresholdY){return this.currentPage}if(k>0){k=0}else{if(k<this.maxScrollX){k=this.maxScrollX}}if(p>0){p=0}else{if(p<this.maxScrollY){p=this.maxScrollY}}for(;o<n;o++){if(k>=this.pages[o][0].cx){k=this.pages[o][0].x;break}}n=this.pages[o].length;for(;j<n;j++){if(p>=this.pages[0][j].cy){p=this.pages[0][j].y;break}}if(o==this.currentPage.pageX){o+=this.directionX;if(o<0){o=0}else{if(o>=this.pages.length){o=this.pages.length-1}}k=this.pages[o][0].x}if(j==this.currentPage.pageY){j+=this.directionY;if(j<0){j=0}else{if(j>=this.pages[0].length){j=this.pages[0].length-1}}p=this.pages[0][j].y}return{x:k,y:p,pageX:o,pageY:j}},goToPage:function(i,n,j,m){m=m||this.options.bounceEasing;if(i>=this.pages.length){i=this.pages.length-1}else{if(i<0){i=0}}if(n>=this.pages[i].length){n=this.pages[i].length-1}else{if(n<0){n=0}}var l=this.pages[i][n].x,k=this.pages[i][n].y;j=j===undefined?this.options.snapSpeed||e.max(e.max(e.min(e.abs(l-this.x),1000),e.min(e.abs(k-this.y),1000)),300):j;this.currentPage={x:l,y:k,pageX:i,pageY:n};this.scrollTo(l,k,j,m)},next:function(j,l){var i=this.currentPage.pageX,k=this.currentPage.pageY;i++;if(i>=this.pages.length&&this.hasVerticalScroll){i=0;k++}this.goToPage(i,k,j,l)},prev:function(j,l){var i=this.currentPage.pageX,k=this.currentPage.pageY;i--;if(i<0&&this.hasVerticalScroll){i=0;k--}this.goToPage(i,k,j,l)},_initKeys:function(l){var k={pageUp:33,pageDown:34,end:35,home:36,left:37,up:38,right:39,down:40};var j;if(typeof this.options.keyBindings=="object"){for(j in this.options.keyBindings){if(typeof this.options.keyBindings[j]=="string"){this.options.keyBindings[j]=this.options.keyBindings[j].toUpperCase().charCodeAt(0)}}}else{this.options.keyBindings={}}for(j in k){this.options.keyBindings[j]=this.options.keyBindings[j]||k[j]}c.addEvent(f,"keydown",this);this.on("destroy",function(){c.removeEvent(f,"keydown",this)})},_key:function(n){if(!this.enabled){return}var i=this.options.snap,o=i?this.currentPage.pageX:this.x,m=i?this.currentPage.pageY:this.y,k=c.getTime(),j=this.keyTime||0,l=0.25,p;if(this.options.useTransition&&this.isInTransition){p=this.getComputedPosition();this._translate(e.round(p.x),e.round(p.y));this.isInTransition=false}this.keyAcceleration=k-j<200?e.min(this.keyAcceleration+l,50):0;switch(n.keyCode){case this.options.keyBindings.pageUp:if(this.hasHorizontalScroll&&!this.hasVerticalScroll){o+=i?1:this.wrapperWidth}else{m+=i?1:this.wrapperHeight}break;case this.options.keyBindings.pageDown:if(this.hasHorizontalScroll&&!this.hasVerticalScroll){o-=i?1:this.wrapperWidth}else{m-=i?1:this.wrapperHeight}break;case this.options.keyBindings.end:o=i?this.pages.length-1:this.maxScrollX;m=i?this.pages[0].length-1:this.maxScrollY;break;case this.options.keyBindings.home:o=0;m=0;break;case this.options.keyBindings.left:o+=i?-1:5+this.keyAcceleration>>0;break;case this.options.keyBindings.up:m+=i?1:5+this.keyAcceleration>>0;break;case this.options.keyBindings.right:o-=i?-1:5+this.keyAcceleration>>0;break;case this.options.keyBindings.down:m-=i?1:5+this.keyAcceleration>>0;break;default:return}if(i){this.goToPage(o,m);return}if(o>0){o=0;this.keyAcceleration=0}else{if(o<this.maxScrollX){o=this.maxScrollX;this.keyAcceleration=0}}if(m>0){m=0;this.keyAcceleration=0}else{if(m<this.maxScrollY){m=this.maxScrollY;this.keyAcceleration=0}}this.scrollTo(o,m,0);this.keyTime=k},_animate:function(r,q,l,i){var o=this,n=this.x,m=this.y,j=c.getTime(),p=j+l;function k(){var s=c.getTime(),u,t,v;if(s>=p){o.isAnimating=false;o._translate(r,q);if(!o.resetPosition(o.options.bounceTime)){o._execEvent("scrollEnd")}return}s=(s-j)/l;v=i(s);u=(r-n)*v+n;t=(q-m)*v+m;o._translate(u,t);if(o.isAnimating){h(k)}if(o.options.probeType==3){o._execEvent("scroll")}}this.isAnimating=true;k()},handleEvent:function(i){switch(i.type){case"touchstart":case"pointerdown":case"MSPointerDown":case"mousedown":this._start(i);break;case"touchmove":case"pointermove":case"MSPointerMove":case"mousemove":this._move(i);break;case"touchend":case"pointerup":case"MSPointerUp":case"mouseup":case"touchcancel":case"pointercancel":case"MSPointerCancel":case"mousecancel":this._end(i);break;case"orientationchange":case"resize":this._resize();break;case"transitionend":case"webkitTransitionEnd":case"oTransitionEnd":case"MSTransitionEnd":this._transitionEnd(i);break;case"wheel":case"DOMMouseScroll":case"mousewheel":this._wheel(i);break;case"keydown":this._key(i);break;case"click":if(!i._constructed){i.preventDefault();i.stopPropagation()}break}}};function d(l,j,k){var m=a.createElement("div"),i=a.createElement("div");if(k===true){m.style.cssText="position:absolute;z-index:9999";i.style.cssText="-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;position:absolute;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.9);border-radius:3px"}i.className="iScrollIndicator";if(l=="h"){if(k===true){m.style.cssText+=";height:7px;left:2px;right:2px;bottom:0";i.style.height="100%"}m.className="iScrollHorizontalScrollbar"}else{if(k===true){m.style.cssText+=";width:7px;bottom:2px;top:2px;right:1px";i.style.width="100%"}m.className="iScrollVerticalScrollbar"}m.style.cssText+=";overflow:hidden";if(!j){m.style.pointerEvents="none"}m.appendChild(i);return m}function b(j,k){this.wrapper=typeof k.el=="string"?a.querySelector(k.el):k.el;this.wrapperStyle=this.wrapper.style;this.indicator=this.wrapper.children[0];this.indicatorStyle=this.indicator.style;this.scroller=j;this.options={listenX:true,listenY:true,interactive:false,resize:true,defaultScrollbars:false,shrink:false,fade:false,speedRatioX:0,speedRatioY:0};for(var l in k){this.options[l]=k[l]}this.sizeRatioX=1;this.sizeRatioY=1;this.maxPosX=0;this.maxPosY=0;if(this.options.interactive){if(!this.options.disableTouch){c.addEvent(this.indicator,"touchstart",this);c.addEvent(f,"touchend",this)}if(!this.options.disablePointer){c.addEvent(this.indicator,c.prefixPointerEvent("pointerdown"),this);c.addEvent(f,c.prefixPointerEvent("pointerup"),this)}if(!this.options.disableMouse){c.addEvent(this.indicator,"mousedown",this);c.addEvent(f,"mouseup",this)}}if(this.options.fade){this.wrapperStyle[c.style.transform]=this.scroller.translateZ;this.wrapperStyle[c.style.transitionDuration]=c.isBadAndroid?"0.001s":"0ms";this.wrapperStyle.opacity="0"}}b.prototype={handleEvent:function(i){switch(i.type){case"touchstart":case"pointerdown":case"MSPointerDown":case"mousedown":this._start(i);break;case"touchmove":case"pointermove":case"MSPointerMove":case"mousemove":this._move(i);break;case"touchend":case"pointerup":case"MSPointerUp":case"mouseup":case"touchcancel":case"pointercancel":case"MSPointerCancel":case"mousecancel":this._end(i);break}},destroy:function(){if(this.options.interactive){c.removeEvent(this.indicator,"touchstart",this);c.removeEvent(this.indicator,c.prefixPointerEvent("pointerdown"),this);c.removeEvent(this.indicator,"mousedown",this);c.removeEvent(f,"touchmove",this);c.removeEvent(f,c.prefixPointerEvent("pointermove"),this);c.removeEvent(f,"mousemove",this);c.removeEvent(f,"touchend",this);c.removeEvent(f,c.prefixPointerEvent("pointerup"),this);c.removeEvent(f,"mouseup",this)}if(this.options.defaultScrollbars){this.wrapper.parentNode.removeChild(this.wrapper)}},_start:function(j){var i=j.touches?j.touches[0]:j;j.preventDefault();j.stopPropagation();this.transitionTime();this.initiated=true;this.moved=false;this.lastPointX=i.pageX;this.lastPointY=i.pageY;this.startTime=c.getTime();if(!this.options.disableTouch){c.addEvent(f,"touchmove",this)}if(!this.options.disablePointer){c.addEvent(f,c.prefixPointerEvent("pointermove"),this)}if(!this.options.disableMouse){c.addEvent(f,"mousemove",this)}this.scroller._execEvent("beforeScrollStart")},_move:function(n){var j=n.touches?n.touches[0]:n,k,i,o,m,l=c.getTime();if(!this.moved){this.scroller._execEvent("scrollStart")}this.moved=true;k=j.pageX-this.lastPointX;this.lastPointX=j.pageX;i=j.pageY-this.lastPointY;this.lastPointY=j.pageY;o=this.x+k;m=this.y+i;this._pos(o,m);if(this.scroller.options.probeType==1&&l-this.startTime>300){this.startTime=l;this.scroller._execEvent("scroll")}else{if(this.scroller.options.probeType>1){this.scroller._execEvent("scroll")}}n.preventDefault();n.stopPropagation()},_end:function(k){if(!this.initiated){return}this.initiated=false;k.preventDefault();k.stopPropagation();c.removeEvent(f,"touchmove",this);c.removeEvent(f,c.prefixPointerEvent("pointermove"),this);c.removeEvent(f,"mousemove",this);if(this.scroller.options.snap){var i=this.scroller._nearestSnap(this.scroller.x,this.scroller.y);var j=this.options.snapSpeed||e.max(e.max(e.min(e.abs(this.scroller.x-i.x),1000),e.min(e.abs(this.scroller.y-i.y),1000)),300);if(this.scroller.x!=i.x||this.scroller.y!=i.y){this.scroller.directionX=0;this.scroller.directionY=0;this.scroller.currentPage=i;this.scroller.scrollTo(i.x,i.y,j,this.scroller.options.bounceEasing)}}if(this.moved){this.scroller._execEvent("scrollEnd")}},transitionTime:function(i){i=i||0;this.indicatorStyle[c.style.transitionDuration]=i+"ms";if(!i&&c.isBadAndroid){this.indicatorStyle[c.style.transitionDuration]="0.001s"}},transitionTimingFunction:function(i){this.indicatorStyle[c.style.transitionTimingFunction]=i},refresh:function(){this.transitionTime();if(this.options.listenX&&!this.options.listenY){this.indicatorStyle.display=this.scroller.hasHorizontalScroll?"block":"none"}else{if(this.options.listenY&&!this.options.listenX){this.indicatorStyle.display=this.scroller.hasVerticalScroll?"block":"none"}else{this.indicatorStyle.display=this.scroller.hasHorizontalScroll||this.scroller.hasVerticalScroll?"block":"none"}}if(this.scroller.hasHorizontalScroll&&this.scroller.hasVerticalScroll){c.addClass(this.wrapper,"iScrollBothScrollbars");c.removeClass(this.wrapper,"iScrollLoneScrollbar");if(this.options.defaultScrollbars&&this.options.customStyle){if(this.options.listenX){this.wrapper.style.right="8px"}else{this.wrapper.style.bottom="8px"}}}else{c.removeClass(this.wrapper,"iScrollBothScrollbars");c.addClass(this.wrapper,"iScrollLoneScrollbar");if(this.options.defaultScrollbars&&this.options.customStyle){if(this.options.listenX){this.wrapper.style.right="2px"}else{this.wrapper.style.bottom="2px"}}}var i=this.wrapper.offsetHeight;if(this.options.listenX){this.wrapperWidth=this.wrapper.clientWidth;if(this.options.resize){this.indicatorWidth=e.max(e.round(this.wrapperWidth*this.wrapperWidth/(this.scroller.scrollerWidth||this.wrapperWidth||1)),8);this.indicatorStyle.width=this.indicatorWidth+"px"}else{this.indicatorWidth=this.indicator.clientWidth}this.maxPosX=this.wrapperWidth-this.indicatorWidth;if(this.options.shrink=="clip"){this.minBoundaryX=-this.indicatorWidth+8;this.maxBoundaryX=this.wrapperWidth-8}else{this.minBoundaryX=0;this.maxBoundaryX=this.maxPosX}this.sizeRatioX=this.options.speedRatioX||(this.scroller.maxScrollX&&(this.maxPosX/this.scroller.maxScrollX))}if(this.options.listenY){this.wrapperHeight=this.wrapper.clientHeight;if(this.options.resize){this.indicatorHeight=e.max(e.round(this.wrapperHeight*this.wrapperHeight/(this.scroller.scrollerHeight||this.wrapperHeight||1)),8);this.indicatorStyle.height=this.indicatorHeight+"px"}else{this.indicatorHeight=this.indicator.clientHeight}this.maxPosY=this.wrapperHeight-this.indicatorHeight;if(this.options.shrink=="clip"){this.minBoundaryY=-this.indicatorHeight+8;this.maxBoundaryY=this.wrapperHeight-8}else{this.minBoundaryY=0;this.maxBoundaryY=this.maxPosY}this.maxPosY=this.wrapperHeight-this.indicatorHeight;this.sizeRatioY=this.options.speedRatioY||(this.scroller.maxScrollY&&(this.maxPosY/this.scroller.maxScrollY))}this.updatePosition()},updatePosition:function(){var i=this.options.listenX&&e.round(this.sizeRatioX*this.scroller.x)||0,j=this.options.listenY&&e.round(this.sizeRatioY*this.scroller.y)||0;if(!this.options.ignoreBoundaries){if(i<this.minBoundaryX){if(this.options.shrink=="scale"){this.width=e.max(this.indicatorWidth+i,8);this.indicatorStyle.width=this.width+"px"}i=this.minBoundaryX}else{if(i>this.maxBoundaryX){if(this.options.shrink=="scale"){this.width=e.max(this.indicatorWidth-(i-this.maxPosX),8);this.indicatorStyle.width=this.width+"px";i=this.maxPosX+this.indicatorWidth-this.width}else{i=this.maxBoundaryX}}else{if(this.options.shrink=="scale"&&this.width!=this.indicatorWidth){this.width=this.indicatorWidth;this.indicatorStyle.width=this.width+"px"}}}if(j<this.minBoundaryY){if(this.options.shrink=="scale"){this.height=e.max(this.indicatorHeight+j*3,8);this.indicatorStyle.height=this.height+"px"}j=this.minBoundaryY}else{if(j>this.maxBoundaryY){if(this.options.shrink=="scale"){this.height=e.max(this.indicatorHeight-(j-this.maxPosY)*3,8);this.indicatorStyle.height=this.height+"px";j=this.maxPosY+this.indicatorHeight-this.height}else{j=this.maxBoundaryY}}else{if(this.options.shrink=="scale"&&this.height!=this.indicatorHeight){this.height=this.indicatorHeight;this.indicatorStyle.height=this.height+"px"}}}}this.x=i;this.y=j;if(this.scroller.options.useTransform){this.indicatorStyle[c.style.transform]="translate("+i+"px,"+j+"px)"+this.scroller.translateZ}else{this.indicatorStyle.left=i+"px";this.indicatorStyle.top=j+"px"}},_pos:function(i,j){if(i<0){i=0}else{if(i>this.maxPosX){i=this.maxPosX}}if(j<0){j=0}else{if(j>this.maxPosY){j=this.maxPosY}}i=this.options.listenX?e.round(i/this.sizeRatioX):this.scroller.x;j=this.options.listenY?e.round(j/this.sizeRatioY):this.scroller.y;this.scroller.scrollTo(i,j)},fade:function(l,k){if(k&&!this.visible){return}clearTimeout(this.fadeTimeout);this.fadeTimeout=null;var j=l?250:500,i=l?0:300;l=l?"1":"0";this.wrapperStyle[c.style.transitionDuration]=j+"ms";this.fadeTimeout=setTimeout((function(m){this.wrapperStyle.opacity=m;this.visible=+m}).bind(this,l),i)}};g.utils=c;if(typeof module!="undefined"&&module.exports){module.exports=g}else{f.IScroll=g}})(window,document,Math);
/**************************************************************************
 ***                             Easemob WebIm Js SDK                    ***
 ***                             v1.1.1                                  ***
 **************************************************************************/
/**
 * Module1: Utility
 * Module2: EmMessage
 * Module3: Message
 * Module4: Connection
 */

;(function ( window, undefined ) {

    if ( typeof Strophe === 'undefined' ) {
        throw 'need Strophe';
    }

    var Easemob = Easemob || {};
    Easemob.im = Easemob.im || {};
    Easemob.im.version = "1.1.1";

    var https = location.protocol === 'https:';

    window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

    Strophe.Websocket.prototype._closeSocket = function () {
        var me = this;
        if ( me.socket ) {
            setTimeout(function () {
                try {
                    me.socket.close();
                } catch ( e ) {}
            }, 0);
        } else {
            me.socket = null;
        }
    }

    /**
     * Module1: Utility
     */
    var Utils = (function () {

        var _createStandardXHR = function () {
            try {
                return new window.XMLHttpRequest();
            } catch ( e ) {
                return false;
            }
        };

        var _createActiveXHR = function () {
            try {
                return new window.ActiveXObject( "Microsoft.XMLHTTP" );
            } catch ( e ) {
                return false;
            }
        };

        if ( window.XDomainRequest ) {
            XDomainRequest.prototype.oldsend = XDomainRequest.prototype.send;
            XDomainRequest.prototype.send = function () {
                XDomainRequest.prototype.oldsend.apply(this, arguments);
                this.readyState = 2;
            };
        }

        Strophe.Request.prototype._newXHR = function () {
            var xhr =  Utils.xmlrequest(true);
            if ( xhr.overrideMimeType ) {
                xhr.overrideMimeType("text/xml");
            }
            xhr.onreadystatechange = this.func.stropheBind(null, this);
            return xhr;
        };

        var _xmlrequest = function ( crossDomain ) {
            crossDomain = crossDomain || true;
            var temp = _createStandardXHR () || _createActiveXHR();

            if ( "withCredentials" in temp ) {
                return temp;
            }
            if ( !crossDomain ) {
                return temp;
            }
            if ( typeof window.XDomainRequest === 'undefined' ) {
                return temp;
            }
            var xhr = new XDomainRequest();
            xhr.readyState = 0;
            xhr.status = 100;
            xhr.onreadystatechange = EMPTYFN;
            xhr.onload = function () {
                xhr.readyState = 4;
                xhr.status = 200;

                var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                xmlDoc.async = "false";
                xmlDoc.loadXML(xhr.responseText);
                xhr.responseXML = xmlDoc;
                xhr.response = xhr.responseText;
                xhr.onreadystatechange();
            };
            xhr.ontimeout = xhr.onerror = function () {
                xhr.readyState = 4;
                xhr.status = 500;
                xhr.onreadystatechange();
            };
            return xhr;
        };

        var _hasFlash = (function () {
            if ( 'ActiveXObject' in window ) {
                try {
                    return new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
                } catch ( ex ) {
                    return 0;
                }
            } else {
                if ( navigator.plugins && navigator.plugins.length > 0 ) {
                    return navigator.plugins["Shockwave Flash"];
                }
            }
            return 0;
        }());

        var _tmpUtilXHR  = _xmlrequest(),
            _hasFormData = typeof FormData !== 'undefined',
            _hasBlob = typeof Blob !== 'undefined',
            _isCanSetRequestHeader = _tmpUtilXHR.setRequestHeader || false,
            _hasOverrideMimeType = _tmpUtilXHR.overrideMimeType || false,
            _isCanUploadFileAsync = _isCanSetRequestHeader && _hasFormData,
            _isCanUploadFile = _isCanUploadFileAsync || _hasFlash,
            _isCanDownLoadFile = _isCanSetRequestHeader && (_hasBlob || _hasOverrideMimeType);

        return {
            hasFormData: _hasFormData

            , hasBlob: _hasBlob

            , isCanSetRequestHeader: _isCanSetRequestHeader

            , hasOverrideMimeType: _hasOverrideMimeType

            , isCanUploadFileAsync: _isCanUploadFileAsync

            , isCanUploadFile: _isCanUploadFile

            , isCanDownLoadFile: _isCanDownLoadFile

            , isSupportWss: (function () {
                var notSupportList = [
                    //1:qq broswser X5 core
                    /MQQBrowser[\/]5([.]\d+)?\sTBS/

                    //2:etc.
                    //...
                ];

                if ( !window.WebSocket ) {
                    return false;
                }

                var ua = window.navigator.userAgent;
                for ( var i = 0, l = notSupportList.length; i < l; i++ ) {
                    if ( notSupportList[i].test(ua) ) {
                        return false;
                    }
                }
                return true;
            }())

            , stringify: function ( json ) {
                if ( typeof JSON !== 'undefined' && JSON.stringify ) {
                    return JSON.stringify(json);
                } else {
                    var s = '',
                        arr = [];

                    var iterate = function ( json ) {
                        var isArr = false;

                        if ( Object.prototype.toString.call(json) === '[object Array]' ) {
                            arr.push(']', '[');
                            isArr = true;
                        } else if ( Object.prototype.toString.call(json) === '[object Object]' ) {
                            arr.push('}', '{');
                        }

                        for ( var o in json ) {
                            if ( Object.prototype.toString.call(json[o]) === '[object Null]' ) {
                                json[o] = 'null';
                            } else if ( Object.prototype.toString.call(json[o]) === '[object Undefined]' ) {
                                json[o] = 'undefined';
                            }

                            if ( json[o] && typeof json[o] === 'object' ) {
                                s += ',' + (isArr ? '' : '"' + o + '":' + (isArr ? '"' : '')) + iterate(json[o]) + '';
                            } else {
                                s += ',"' + (isArr ? '' : o + '":"') + json[o] + '"';
                            }
                        }

                        if ( s != '' ) {
                            s = s.slice(1);
                        }

                        return arr.pop() + s + arr.pop();
                    }
                    return iterate(json);
                }
            }

            , registerUser: function ( options ) {
                var orgName = options.orgName || '';
                var appName = options.appName || '';
                var appKey = options.appKey || '';

                if ( !orgName && !appName && appKey ) {
                    var devInfos = appKey.split('#');
                    if ( devInfos.length === 2 ) {
                        orgName = devInfos[0];
                        appName = devInfos[1];
                    }
                }
                if ( !orgName && !appName ) {
                    options.error({
                        type: EASEMOB_IM_RESISTERUSER_ERROR
                        , msg: '没有指定开发者信息'
                    });
                    return;
                }

                var https = options.https || https;
                var apiUrl = options.apiUrl || (https ? 'https' : 'http') + '://a1.easemob.com';
                var restUrl = apiUrl + '/' + orgName + '/' + appName + '/users';

                var userjson = {
                    username: options.username
                    , password: options.password
                    , nickname: options.nickname || ''
                };

                var userinfo = Utils.stringify(userjson);
                var options = {
                    url: restUrl
                    , dataType: 'json'
                    , data: userinfo
                    , success: options.success || EMPTYFN
                    , error: options.error || EMPTYFN
                };
                return Utils.ajax(options);
            }

            , login2UserGrid: function ( options ) {
                options = options || {};

                var appKey = options.appKey || '';
                var devInfos = appKey.split('#');
                if ( devInfos.length !== 2 ) {
                    error({
                        type: EASEMOB_IM_CONNCTION_OPEN_USERGRID_ERROR
                        , msg: '请指定正确的开发者信息(appKey)'
                    });
                    return false;
                }

                var orgName = devInfos[0];
                var appName = devInfos[1];
                if ( !orgName ) {
                    error({
                        type: EASEMOB_IM_CONNCTION_OPEN_USERGRID_ERROR
                        , msg: '请指定正确的开发者信息(appKey)'
                    });
                    return false;
                }
                if ( !appName ) {
                    error({
                        type: EASEMOB_IM_CONNCTION_OPEN_USERGRID_ERROR
                        , msg: '请指定正确的开发者信息(appKey)'
                    });
                    return false;
                }

                var https = https || options.https;
                var suc = options.success || EMPTYFN;
                var error = options.error || EMPTYFN;
                var user = options.user || '';
                var pwd = options.pwd || '';

                var apiUrl = options.apiUrl || (https ? 'https' : 'http') + '://a1.easemob.com';

                var loginJson = {
                    grant_type: 'password'
                    , username: user
                    , password: pwd
                };
                var loginfo = Utils.stringify(loginJson);

                var options = {
                    url: apiUrl + "/" + orgName + "/" + appName + "/token"
                    , dataType: 'json'
                    , data: loginfo
                    , success: suc || EMPTYFN
                    , error: error || EMPTYFN
                };
                return Utils.ajax(options);
            }
            , getFileUrl: function ( fileInputId ) {
                var uri = {
                    url: ''
                    , filename: ''
                    , filetype: ''
                    , data: ''
                };

                var fileObj = document.getElementById(fileInputId);

                if ( !Utils.isCanUploadFileAsync || !fileObj ) {
                    return uri;
                }

                if ( window.URL.createObjectURL ) {
                    var fileItems = fileObj.files;
                    if (fileItems.length > 0) {
                        var u = fileItems.item(0);
                        uri.data = u;
                        uri.url = window.URL.createObjectURL(u);
                        uri.filename = u.name || '';
                    }
                } else { // IE
                    var u = document.getElementById(fileInputId).value;
                    uri.url = u;
                    var pos1 = u.lastIndexOf('/');
                    var pos2 = u.lastIndexOf('\\');
                    var pos = Math.max(pos1, pos2)
                    if (pos < 0)
                        uri.filename = u;
                    else
                        uri.filename = u.substring(pos + 1);
                }
                var index = uri.filename.lastIndexOf(".");
                if ( index != -1 ) {
                    uri.filetype = uri.filename.substring(index+1).toLowerCase();
                }
                return uri;
            }

            , getFileSizeFn: function ( fileInputId ) {
                var file = document.getElementById(fileInputId)
                var fileSize = 0;
                if ( file ) {
                    if ( file.files ) {
                        if ( file.files.length > 0 ) {
                            fileSize = file.files[0].size;
                        }
                    } else if ( file.select && 'ActiveXObject' in window ) {
                        file.select();
                        var fileobject = new ActiveXObject ("Scripting.FileSystemObject");
                        var file = fileobject.GetFile (file.value);
                        fileSize = file.Size;
                    }
                }
                return fileSize;
            }

            , hasFlash: _hasFlash

            , trim: function ( str ) {

                str = typeof str === 'string' ? str : '';

                return str.trim
                    ? str.trim()
                    : str.replace(/^\s|\s$/g, '');
            }

            , parseEmotions: function ( msg ) {
                if ( typeof Easemob.im.EMOTIONS === 'undefined' || typeof Easemob.im.EMOTIONS.map === 'undefined' ) {
                    return msg;
                } else {
                    var emotion = Easemob.im.EMOTIONS,
                        reg = null;

                    msg = msg.replace(/&amp;/g, '&');
                    msg = msg.replace(/&#39;/g, '\'');
                    msg = msg.replace(/&lt;/g, '<');

                    for ( var face in emotion.map ) {
                        if ( emotion.map.hasOwnProperty(face) ) {
                            while ( msg.indexOf(face) > -1 ) {
                                msg = msg.replace(face, '<img class="em-emotion" src="' + emotion.path + emotion.map[face] + '" alt="表情">');
                            }
                        }
                    }
                    return msg;
                }
            }

            , parseLink: function ( msg ) {
                var reg = /(https?\:\/\/|www\.)([a-zA-Z0-9-]+(\.[a-zA-Z0-9]+)+)(\:[0-9]{2,4})?\/?((\.[:_0-9a-zA-Z-]+)|[:_0-9a-zA-Z-]*\/?)*\??[:_#@*&%0-9a-zA-Z-/=]*/gm;
                var res = msg.match(reg);
                var src = res && res[0] ? res[0] : '';
                if ( res && res.length ) {
                    var prefix = /^https?:\/\//.test(src);
                    msg = msg.replace(reg
                        , "<a href='"
                        + (prefix
                            ? src
                            : '\/\/' + src)
                        + "' target='_blank'>"
                        + src
                        + "</a>");
                }
                return msg;
            }

            , parseJSON: function ( data ) {

                if ( window.JSON && window.JSON.parse ) {
                    return window.JSON.parse(data + "");
                }

                var requireNonComma,
                    depth = null,
                    str = Utils.trim(data + "");

                return str && !Utils.trim(
                    str.replace(/(,)|(\[|{)|(}|])|"(?:[^"\\\r\n]|\\["\\\/bfnrt]|\\u[\da-fA-F]{4})*"\s*:?|true|false|null|-?(?!0\d)\d+(?:\.\d+|)(?:[eE][+-]?\d+|)/g
                        , function ( token, comma, open, close ) {

                            if ( requireNonComma && comma ) {
                                depth = 0;
                            }

                            if ( depth === 0 ) {
                                return token;
                            }

                            requireNonComma = open || comma;
                            depth += !close - !open;
                            return "";
                        })
                )
                    ? (Function("return " + str))()
                    : (Function("Invalid JSON: " + data))();
            }

            , parseUploadResponse: function ( response ) {
                return response.indexOf('callback') > -1 ? //lte ie9
                    response.slice(9, -1) : response;
            }

            , parseDownloadResponse: function ( response ) {
                return ((response && response.type && response.type === 'application/json')
                || 0 > Object.prototype.toString.call(response).indexOf('Blob')) ?
                this.url+'?token=' : window.URL.createObjectURL(response);
            }
            , uploadFile: function ( options ) {
                options = options || {};
                options.onFileUploadProgress = options.onFileUploadProgress || EMPTYFN;
                options.onFileUploadComplete = options.onFileUploadComplete || EMPTYFN;
                options.onFileUploadError = options.onFileUploadError || EMPTYFN;
                options.onFileUploadCanceled = options.onFileUploadCanceled || EMPTYFN;
                var acc = options.accessToken || this.context.accessToken;
                if (!acc) {
                    options.onFileUploadError({
                        type: EASEMOB_IM_UPLOADFILE_NO_LOGIN
                        , msg: '用户未登录到usergrid服务器,无法使用文件上传功能'
                        , id: options.id
                    });
                    return;
                }

                orgName = options.orgName || this.context.orgName || '';
                appName = options.appName || this.context.appName || '';
                appKey = options.appKey || this.context.appKey || '';
                if(!orgName && !appName && appKey){
                    var devInfos = appKey.split('#');
                    if(devInfos.length==2){
                        orgName = devInfos[0];
                        appName = devInfos[1];
                    }
                }
                if ( !orgName && !appName ) {
                    options.onFileUploadError({
                        type: EASEMOB_IM_UPLOADFILE_ERROR
                        , msg: '没有指定开发者信息'
                        , id: options.id
                    });
                    return;
                }

                var apiUrl = options.apiUrl || 'http://a1.easemob.com';
                var uploadUrl = apiUrl + '/' + orgName + '/' + appName + '/chatfiles';

                if ( !Utils.isCanUploadFileAsync ) {
                    if ( Utils.hasFlash && typeof options.flashUpload === 'function' ) {
                        options.flashUpload && options.flashUpload(uploadUrl, options);
                    } else {
                        this.onError({
                            type : EASEMOB_IM_UPLOADFILE_BROWSER_ERROR
                            , msg : '当前浏览器不支持异步上传！'
                        });
                    }
                    return;
                }

                var fileSize = options.file.data ? options.file.data.size : undefined;
                if ( fileSize > EASEMOB_IM_FILESIZE_LIMIT ) {
                    options.onFileUploadError({
                        type: EASEMOB_IM_UPLOADFILE_ERROR
                        , msg: '上传文件超过服务器大小限制（10M）'
                        , id: options.id
                    });
                    return ;
                } else if ( fileSize <= 0 ) {
                    options.onFileUploadError({
                        type: EASEMOB_IM_UPLOADFILE_ERROR
                        , msg: '上传文件大小为0'
                        , id: options.id
                    });
                    return ;
                }

                var xhr = Utils.xmlrequest();
                var onError = function ( e ) {
                    options.onFileUploadError({
                        type: EASEMOB_IM_UPLOADFILE_ERROR
                        , msg: '上传文件失败'
                        , id: options.id
                        , xhr: xhr
                    });
                }
                if ( xhr.upload ) {
                    xhr.upload.addEventListener("progress",options.onFileUploadProgress, false);
                }
                if ( xhr.addEventListener ) {
                    xhr.addEventListener("abort", options.onFileUploadCanceled, false);
                    xhr.addEventListener("load", function ( e ) {
                        try {
                            var json = Utils.parseJSON(xhr.responseText);
                            options.onFileUploadComplete(json);
                        } catch ( e ) {
                            options.onFileUploadError({
                                type: EASEMOB_IM_UPLOADFILE_ERROR
                                , msg: '上传文件失败,服务端返回值值不正确'
                                , data: xhr.responseText
                                , id: options.id
                                , xhr: xhr
                            });
                        }
                    }, false);
                    xhr.addEventListener("error", onError, false);
                } else if ( xhr.onreadystatechange ) {
                    xhr.onreadystatechange = function () {
                        if ( xhr.readyState === 4 ) {
                            if ( ajax.status === 200 ) {
                                try {
                                    var json = Utils.parseJSON(xhr.responseText);
                                    options.onFileUploadComplete(json);
                                } catch ( e ) {
                                    options.onFileUploadError({
                                        type: EASEMOB_IM_UPLOADFILE_ERROR
                                        , msg: '上传文件失败,服务端返回值不正确'
                                        , data: xhr.responseText
                                        , id: options.id
                                        , xhr: xhr
                                    });
                                }
                            } else {
                                options.onFileUploadError({
                                    type: EASEMOB_IM_UPLOADFILE_ERROR
                                    , msg: '上传文件失败,服务端返回异常'
                                    , data: xhr.responseText
                                    , id: options.id
                                    , xhr: xhr
                                });
                            }
                        } else {
                            xhr.abort();
                            options.onFileUploadCanceled();
                        }
                    }
                }

                xhr.open("POST", uploadUrl);

                xhr.setRequestHeader('restrict-access', 'true');
                xhr.setRequestHeader('Accept', '*/*');//android qq browser has some problem at this attr
                xhr.setRequestHeader('Authorization', 'Bearer ' + acc);

                var formData = new FormData();
                formData.append("file", options.file.data);
                xhr.send(formData);
            }

            , downloadFn: function ( options ) {
                options.onFileDownloadComplete = options.onFileDownloadComplete || EMPTYFN;
                options.onFileDownloadError = options.onFileDownloadError || EMPTYFN;

                var accessToken = options.accessToken || '';
                if ( !accessToken ) {
                    options.onFileDownloadError({
                        type: EASEMOB_IM_DOWNLOADFILE_NO_LOGIN
                        , msg: '用户未登录到usergrid服务器,无法使用文件下载功能'
                        , id: options.id
                    });
                    return;
                }

                var onError = function ( e ) {
                    options.onFileDownloadError({
                        type: EASEMOB_IM_DOWNLOADFILE_ERROR
                        , msg: '下载文件失败'
                        , id: options.id
                        , xhr: xhr
                    });
                }
                if ( !Utils.isCanDownLoadFile ) {
                    options.onFileDownloadComplete();
                    return;
                }
                var xhr = Utils.xmlrequest();
                if ( "addEventListener" in xhr ) {
                    xhr.addEventListener("load", function ( e ) {
                        options.onFileDownloadComplete(xhr.response,xhr);
                    }, false);
                    xhr.addEventListener("error", onError, false);
                } else if ( "onreadystatechange" in xhr ) {
                    xhr.onreadystatechange = function () {
                        if ( xhr.readyState === 4 ) {
                            if ( ajax.status === 200 ) {
                                options.onFileDownloadComplete(xhr.response,xhr);
                            } else {
                                options.onFileDownloadError({
                                    type: EASEMOB_IM_DOWNLOADFILE_ERROR
                                    , msg: '下载文件失败,服务端返回异常'
                                    , id: options.id
                                    , xhr: xhr
                                });
                            }
                        } else {
                            xhr.abort();
                            options.onFileDownloadError({
                                type: EASEMOB_IM_DOWNLOADFILE_ERROR
                                , msg: '错误的下载状态,退出下载'
                                , id: options.id
                                , xhr: xhr
                            });
                        }
                    }
                }

                var method = options.method || 'GET';
                var resType = options.responseType || 'blob';
                var mimeType = options.mimeType || "text/plain; charset=x-user-defined";
                xhr.open(method, options.url);
                if ( typeof Blob !== 'undefined' ) {
                    xhr.responseType = resType;
                } else {
                    xhr.overrideMimeType(mimeType);
                }

                var innerHeaer = {
                    'X-Requested-With': 'XMLHttpRequest'
                    , 'Accept': 'application/octet-stream'
                    , 'share-secret': options.secret
                    , 'Authorization': 'Bearer ' + accessToken
                };
                var headers = options.headers || {};
                for ( var key in headers ) {
                    innerHeaer[key] = headers[key];
                }
                for ( var key in innerHeaer ) {
                    if ( innerHeaer[key] ) {
                        xhr.setRequestHeader(key, innerHeaer[key]);
                    }
                }
                xhr.send(null);
            }

            , parseTextMessage: function ( message, faces ) {
                if ( typeof message !== 'string' ) {
                    conn.onError({
                        type: EASEMOB_IM_MESSAGE_REC_TEXT_ERROR
                        , msg: '不合法的消息内容格式，请检查发送消息内容！'
                    });
                    return;
                }
                if ( Object.prototype.toString.call(faces) !== '[object Object]' ) {
                    return {
                        isemotion: false
                        , body: [
                            {
                                type: "txt"
                                , data: message
                            }
                        ]
                    };
                }

                var receiveMsg = message;
                var emessage = [];
                var expr = /\[[^[\]]{2,3}\]/mg;
                var emotions = receiveMsg.match(expr);

                if ( !emotions || emotions.length < 1 ){
                    return {
                        isemotion: false
                        , body: [
                            {
                                type: "txt"
                                , data: message
                            }
                        ]
                    };
                }
                var isemotion = false;
                for ( var i = 0; i < emotions.length; i++ ) {
                    var tmsg = receiveMsg.substring(0, receiveMsg.indexOf(emotions[i])),
                        existEmotion = Easemob.im.EMOTIONS.map[emotions[i]];

                    if ( tmsg ) {
                        emessage.push({
                            type: "txt"
                            , data: tmsg
                        });
                    }
                    if ( !existEmotion ) {
                        emessage.push({
                            type: "txt"
                            , data: emotions[i]
                        });
                        continue;
                    }
                    var emotion = Easemob.im.EMOTIONS.map ? Easemob.im.EMOTIONS.path + existEmotion : null;

                    if ( emotion ) {
                        isemotion = true;
                        emessage.push({
                            type: 'emotion'
                            , data: emotion
                        });
                    } else {
                        emessage.push({
                            type: 'txt'
                            , data: emotions[i]
                        });
                    }
                    var restMsgIndex = receiveMsg.indexOf(emotions[i]) + emotions[i].length;
                    receiveMsg = receiveMsg.substring(restMsgIndex);
                }
                if ( receiveMsg ) {
                    emessage.push({
                        type: 'txt'
                        , data: receiveMsg
                    });
                }
                if ( isemotion ) {
                    return {
                        isemotion: isemotion
                        , body: emessage
                    };
                }
                return {
                    isemotion: false
                    , body: [
                        {
                            type: "txt"
                            , data: message
                        }
                    ]
                };
            }

            , xmlrequest: _xmlrequest

            , ajax: function ( options ) {
                var dataType = options.dataType || 'text';
                var suc = options.success || EMPTYFN;
                var error = options.error || EMPTYFN;
                var xhr = Utils.xmlrequest();

                xhr.onreadystatechange = function () {
                    if ( xhr.readyState === 4 ) {
                        var status = xhr.status || 0;
                        if ( status === 200 ) {
                            if ( dataType === 'text' ) {
                                suc(xhr.responseText,xhr);
                                return;
                            }
                            if ( dataType === 'json' ) {
                                try {
                                    var json = Utils.parseJSON(xhr.responseText);
                                    suc(json,xhr);
                                } catch ( e ) {
                                    error(xhr.responseText,xhr,"错误的数据,无法转换为json");
                                }
                                return;
                            }
                            if ( dataType === 'xml' ) {
                                if ( xhr.responseXML && xhr.responseXML.documentElement ) {
                                    suc(xhr.responseXML.documentElement,xhr);
                                } else {
                                    error(xhr.responseText,xhr,"浏览器不支持ajax返回xml对象");
                                }
                                return;
                            }
                            suc(xhr.response || xhr.responseText,xhr);
                            return;
                        } else {
                            if ( dataType === 'json' ) {
                                try {
                                    var json = Utils.parseJSON(xhr.responseText);
                                    error(json,xhr,"服务器返回错误信息");
                                } catch ( e ) {
                                    error(xhr.responseText,xhr,"服务器返回错误信息");
                                }
                                return;
                            }
                            if ( dataType === 'xml' ) {
                                if ( xhr.responseXML && xhr.responseXML.documentElement ) {
                                    error(xhr.responseXML.documentElement,xhr,"服务器返回错误信息");
                                } else {
                                    error(xhr.responseText,xhr,"服务器返回错误信息");
                                }
                                return;
                            }
                            error(xhr.responseText,xhr,"服务器返回错误信息");
                            return;
                        }
                    }
                    if ( xhr.readyState === 0 ) {
                        error(xhr.responseText,xhr,"服务器异常");
                    }
                };

                if ( options.responseType ) {
                    if ( xhr.responseType ) {
                        xhr.responseType = options.responseType;
                    } else {
                        error('', xhr, "当前浏览器不支持设置响应类型");
                        return null;
                    }
                }
                if ( options.mimeType ) {
                    if ( Utils.hasOverrideMimeType ) {
                        xhr.overrideMimeType(options.mimeType);
                    } else {
                        error('', xhr, "当前浏览器不支持设置mimeType");
                        return null;
                    }
                }

                var type = options.type || "POST",
                    data = options.data || null,
                    tempData = '';

                if ( type.toLowerCase() === 'get' && data ) {
                    for ( var o in data ) {
                        if ( data.hasOwnProperty(o) ) {
                            tempData += o + '=' + data[o] + '&';
                        }
                    }
                    tempData = tempData ? tempData.slice(0, -1) : tempData;
                    options.url += (options.url.indexOf('?') > 0 ? '&' : '?') + (tempData ? tempData + '&' : tempData) + '_v=' + new Date().getTime();
                    data = null, tempData = null;
                }
                xhr.open(type, options.url);

                if ( Utils.isCanSetRequestHeader ) {
                    var headers = options.headers || {};
                    for ( var key in headers ) {
                        if ( headers.hasOwnProperty(key) ) {
                            xhr.setRequestHeader(key, headers[key]);
                        }
                    }
                }

                xhr.send(data);
                return xhr;
            }
        };
    }());



    /**
     * Module2: EmMessage: Various types of messages
     */
    var EmMessage = function ( type, id ) {
        if ( !this instanceof EmMessage ) {
            return new EmMessage(type);
        }

        this._msg = {};

        if ( typeof EmMessage[type] === 'function' ) {
            EmMessage[type].prototype.setGroup = this.setGroup;
            this._msg = new EmMessage[type](id);
        }
        return this._msg;
    }
    EmMessage.prototype.setGroup = function ( group ) {
        this.body.group = group;
    }



    /**
     *  Module3: Message
     */
    var _msgHash = {};
    var Message = function ( message ) {

        if( !this instanceof Message ) {
            return new Message(message, conn);
        }

        this.msg = message;
    }

    Message.prototype.send = function ( conn ) {
        var me = this;

        var _send = function ( message ) {

            message.ext = message.ext || {};
            message.ext.weichat = message.ext.weichat || {};
            message.ext.weichat.originType = message.ext.weichat.originType || 'webim';

            var json = {
                from: conn.context.userId || ''
                , to: message.to
                , bodies: [message.body]
                , ext: message.ext || {}
            };

            var jsonstr = Utils.stringify(json);
            var dom = $msg({
                type: message.group || 'chat'
                , to: message.toJid
                , id: message.id
                , xmlns: "jabber:client"
            }).c("body").t(jsonstr);

            if ( message.roomType ) {
                dom.up().c("roomtype", { xmlns: "easemob:x:roomtype", type: "chatroom" });
            }

            conn.retry && setTimeout(function () {
                if ( _msgHash[message.id] ) {
                    if ( typeof _msgHash[message.id].timeout === 'undefined' ) {
                        _msgHash[message.id].timeout = 2;
                    }
                    if ( _msgHash[message.id].timeout === 0 ) {
                        _msgHash[message.id].timeout = 2;
                        _msgHash[message.id].msg.fail instanceof Function
                        && _msgHash[message.id].msg.fail(message.id);
                    } else {
                        _msgHash[message.id].timeout -= 1;
                        _send(message);
                    }
                }
            }, 20000);
            conn.sendCommand(dom.tree(), message.id);
        }


        if ( me.msg.file ) {
            if ( me.msg.body && me.msg.body.url ) {//only send msg
                _send(me.msg);
                return;
            }
            var _tmpComplete = me.msg.onFileUploadComplete;
            var _complete = function ( data ) {

                if ( data.entities[0]['file-metadata'] ) {
                    var file_len = data.entities[0]['file-metadata']['content-length'];
                    me.msg.file_length = file_len;
                    me.msg.filetype = data.entities[0]['file-metadata']['content-type'];
                    if ( file_len > 204800 ) {
                        me.msg.thumbnail = true;
                    }
                }

                me.msg.body = {
                    type: me.msg.type || 'file'
                    , url: data.uri + '/' + data.entities[0]['uuid']
                    , secret: data.entities[0]['share-secret']
                    , filename: me.msg.file.filename || me.msg.filename
                    , size: {
                        width: me.msg.width || 0
                        , height: me.msg.height || 0
                    }
                    , length: me.msg.file_length || 0
                    , file_length: me.msg.file_length || 0
                    , filetype: me.msg.filetype
                }

                _send(me.msg);
                _tmpComplete instanceof Function && _tmpComplete(data, me.msg.id);
            };

            me.msg.onFileUploadComplete = _complete;
            Utils.uploadFile.call(conn, me.msg);
        } else {
            me.msg.body = {
                type: me.msg.type === 'chat' ? 'txt' : me.msg.type
                , msg: me.msg.msg
            };
            if ( me.msg.type === 'cmd' ) {
                me.msg.body.action = me.msg.action;
            } else if ( me.msg.type === 'loc' ) {
                me.msg.body.addr = me.msg.addr;
                me.msg.body.lat = me.msg.lat;
                me.msg.body.lng = me.msg.lng;
            }

            _send(me.msg);
        }
    }



    /*
     * Module4: Connection
     */
    var Connection = (function () {

        var _networkSt;
        var _listenNetwork = function ( onlineCallback, offlineCallback ) {

            if ( window.addEventListener ) {
                window.addEventListener('online', onlineCallback);
                window.addEventListener('offline', offlineCallback);

            } else if ( window.attachEvent ) {
                if ( document.body ) {
                    document.body.attachEvent('onoffline', offlineCallback);
                    document.body.attachEvent('onoffline', offlineCallback);
                } else {
                    window.attachEvent('load', function () {
                        document.body.attachEvent('onoffline', offlineCallback);
                        document.body.attachEvent('onoffline', offlineCallback);
                    });
                }
            } else {
                /*var onlineTmp = window.ononline;
                 var offlineTmp = window.onoffline;

                 window.attachEvent('ononline', function () {
                 try {
                 typeof onlineTmp === 'function' && onlineTmp();
                 } catch ( e ) {}
                 onlineCallback();
                 });
                 window.attachEvent('onoffline', function () {
                 try {
                 typeof offlineTmp === 'function' && offlineTmp();
                 } catch ( e ) {}
                 offlineCallback();
                 });*/
            }
        };

        var _parseRoomFn = function ( result ) {
            var rooms = [];
            var items = result.getElementsByTagName("item");
            if ( items ) {
                for ( var i = 0; i < items.length; i++ ) {
                    var item = items[i];
                    var roomJid = item.getAttribute('jid');
                    var tmp = roomJid.split("@")[0];
                    var room = {
                        jid: roomJid
                        , name: item.getAttribute('name')
                        , roomId: tmp.split('_')[1]
                    };
                    rooms.push(room);
                }
            }
            return rooms;
        }

        var _parseRoomOccupantsFn = function ( result ) {
            var occupants = [];
            var items = result.getElementsByTagName("item");
            if ( items ) {
                for ( var i = 0; i < items.length; i++ ) {
                    var item = items[i];
                    var room = {
                        jid: item.getAttribute('jid')
                        , name: item.getAttribute('name')
                    };
                    occupants.push(room);
                }
            }
            return occupants;
        }

        var _parseResponseMessage = function ( msginfo ) {
            var parseMsgData = { errorMsg: true, data: [] };

            var msgBodies = msginfo.getElementsByTagName("body");
            if ( msgBodies ) {
                for ( var i = 0; i < msgBodies.length; i++ ) {
                    var msgBody = msgBodies[i];
                    var childNodes = msgBody.childNodes;
                    if ( childNodes && childNodes.length > 0 ) {
                        var childNode = msgBody.childNodes[0];
                        if ( childNode.nodeType == Strophe.ElementType.TEXT ) {
                            var jsondata = childNode.wholeText ||childNode.nodeValue;
                            jsondata = jsondata.replace('\n','<br>');
                            try {
                                var data = eval("(" + jsondata + ")");
                                parseMsgData.errorMsg = false;
                                parseMsgData.data = [data];
                            } catch ( e ) {}
                        }
                    }
                }

                var delayTags = msginfo.getElementsByTagName("delay");
                if ( delayTags && delayTags.length > 0 ) {
                    var delayTag = delayTags[0];
                    var delayMsgTime = delayTag.getAttribute("stamp");
                    if ( delayMsgTime ) {
                        parseMsgData.delayTimeStamp = delayMsgTime;
                    }
                }
            } else {
                var childrens = msginfo.childNodes;
                if ( childrens && childrens.length>0 ) {
                    var child = msginfo.childNodes[0];
                    if ( child.nodeType == Strophe.ElementType.TEXT ) {
                        try {
                            var data = eval("("+child.nodeValue+")");
                            parseMsgData.errorMsg = false;
                            parseMsgData.data = [data];
                        } catch ( e ) {}
                    }
                }
            }
            return parseMsgData;
        }

        var _parseNameFromJidFn = function ( jid, domain ) {
            domain = domain || "";
            var tempstr = jid;
            var findex = tempstr.indexOf("_");

            if ( findex !== -1 ) {
                tempstr = tempstr.substring(findex+1);
            }
            var atindex = tempstr.indexOf("@" + domain);
            if ( atindex !== -1 ) {
                tempstr = tempstr.substring(0,atindex);
            }
            return tempstr;
        }

        var _parseFriendFn = function ( queryTag ) {
            var rouster = [];
            var items = queryTag.getElementsByTagName("item");
            if ( items ) {
                for( var i = 0; i < items.length; i++ ) {
                    var item = items[i];
                    var jid = item.getAttribute('jid');
                    if ( !jid ) {
                        continue;
                    }
                    var subscription = item.getAttribute('subscription');
                    var friend = {
                        subscription: subscription
                        , jid: jid
                    };
                    var ask = item.getAttribute('ask');
                    if ( ask ) {
                        friend.ask = ask;
                    }
                    var name = item.getAttribute('name');
                    if ( name ) {
                        friend.name = name;
                    } else {
                        var n = _parseNameFromJidFn(jid);
                        friend.name = n;
                    }
                    var groups = [];
                    Strophe.forEachChild(item, 'group',function ( group ) {
                        groups.push(Strophe.getText(group));
                    });
                    friend.groups = groups;
                    rouster.push(friend);
                }
            }
            return rouster;
        }

        var _dologin2IM = function ( options, conn ) {
            var accessToken = options.access_token || '';
            if ( accessToken == '' ) {
                var loginfo = Utils.stringify(options);
                conn.onError({
                    type: EASEMOB_IM_CONNCTION_OPEN_USERGRID_ERROR
                    , msg: "登录失败," + loginfo
                    , data: options
                    , xhr: xhr
                });
                return;
            }
            conn.context.accessToken = options.access_token;
            conn.context.accessTokenExpires = options.expires_in;
            var stropheConn = null;
            if ( conn.isOpening() && conn.context.stropheConn ) {
                stropheConn = conn.context.stropheConn;
            } else if ( conn.isOpened() && conn.context.stropheConn ) {
                return;
            } else {
                stropheConn = new Strophe.Connection(conn.url, {
                    inactivity: conn.inactivity
                    , maxRetries: conn.maxRetries
                    , pollingTime: conn.pollingTime
                });
            }

            var callback = function ( status, msg ) {
                _login2ImCallback(status,msg,conn);
            };

            conn.context.stropheConn = stropheConn;
            if ( conn.route ) {
                stropheConn.connect(conn.context.jid,"$t$" + accessToken,callback,conn.wait,conn.hold,conn.route);
            } else {
                stropheConn.connect(conn.context.jid,"$t$" + accessToken,callback,conn.wait,conn.hold);
            }
        };

        var _parseMessageType = function ( msginfo ) {
            var msgtype = 'normal';
            var receiveinfo = msginfo.getElementsByTagName("received");
            if ( receiveinfo && receiveinfo.length > 0 && receiveinfo[0].namespaceURI === "urn:xmpp:receipts" ) {
                msgtype = 'received';
            } else {
                var inviteinfo =  msginfo.getElementsByTagName("invite");
                if ( inviteinfo && inviteinfo.length > 0 ) {
                    msgtype = 'invite';
                }
            }
            return msgtype;
        };

        var _handleQueueMessage = function ( conn ) {
            for ( var i in _msgHash ) {
                if ( _msgHash.hasOwnProperty(i) ) {
                    _msgHash[i].send(conn);
                }
            }
        };

        var _login2ImCallback = function ( status, msg, conn ) {
            if ( status == Strophe.Status.CONNFAIL ) {
                conn.onError({
                    type: EASEMOB_IM_CONNCTION_SERVER_CLOSE_ERROR
                    , msg: msg
                    , reconnect: true
                });
            } else if ( status == Strophe.Status.ATTACHED || status == Strophe.Status.CONNECTED ) {
                var handleMessage = function ( msginfo ) {
                    var type = _parseMessageType(msginfo);

                    if ( 'received' === type ) {
                        conn.handleReceivedMessage(msginfo);
                        return true;
                    } else if ( 'invite' === type ) {
                        conn.handleInviteMessage(msginfo);
                        return true;
                    } else {
                        conn.handleMessage(msginfo);
                        return true;
                    }
                };
                var handlePresence = function ( msginfo ) {
                    conn.handlePresence(msginfo);
                    return true;
                };
                var handlePing = function ( msginfo ) {
                    conn.handlePing(msginfo);
                    return true;
                };
                var handleIq = function ( msginfo ) {
                    conn.handleIq(msginfo);
                    return true;
                };

                conn.addHandler(handleMessage, null, 'message', null, null,  null);
                conn.addHandler(handlePresence, null, 'presence', null, null,  null);
                conn.addHandler(handlePing, "urn:xmpp:ping", 'iq', "get", null,  null);
                conn.addHandler(handleIq, "jabber:iq:roster", 'iq', "set", null,  null);

                conn.context.status = STATUS_OPENED;

                var supportRecMessage = [
                    EASEMOB_IM_MESSAGE_REC_TEXT,
                    EASEMOB_IM_MESSAGE_REC_EMOTION ];

                if ( Utils.isCanDownLoadFile ) {
                    supportRecMessage.push(EASEMOB_IM_MESSAGE_REC_PHOTO);
                    supportRecMessage.push(EASEMOB_IM_MESSAGE_REC_AUDIO_FILE);
                }
                var supportSedMessage = [ EASEMOB_IM_MESSAGE_SED_TEXT ];
                if ( Utils.isCanUploadFile ) {
                    supportSedMessage.push(EASEMOB_IM_MESSAGE_REC_PHOTO);
                    supportSedMessage.push(EASEMOB_IM_MESSAGE_REC_AUDIO_FILE);
                }
                conn.notifyVersion();
                conn.retry && _handleQueueMessage(conn);
                conn.onOpened({
                    canReceive: supportRecMessage
                    , canSend: supportSedMessage
                    , accessToken: conn.context.accessToken
                });
                conn.heartBeat();
            } else if ( status == Strophe.Status.DISCONNECTING ) {
                if ( conn.isOpened() ) {// 不是主动关闭
                    conn.stopHeartBeat();
                    conn.context.status = STATUS_CLOSING;
                    conn.onError({
                        type: EASEMOB_IM_CONNCTION_SERVER_CLOSE_ERROR
                        , msg: msg
                        , reconnect: true
                    });
                }
            } else if ( status == Strophe.Status.DISCONNECTED ) {
                conn.context.status = STATUS_CLOSED;
                conn.clear();
                conn.onClosed();
            } else if ( status == Strophe.Status.AUTHFAIL ) {
                conn.onError({
                    type: EASEMOB_IM_CONNCTION_AUTH_ERROR
                    , msg: '登录失败,请输入正确的用户名和密码'
                });
                conn.clear();
            } else if ( status == Strophe.Status.ERROR ) {
                conn.onError({
                    type: EASEMOB_IM_CONNCTION_SERVER_ERROR
                    , msg: msg || '服务器异常'
                });
            }
        };

        var _getJid = function ( options, conn ) {
            var jid = options.toJid || '';

            if ( jid === '' ) {
                var appKey = conn.context.appKey || '';
                var toJid = appKey + "_" + options.to + "@" + conn.domain;

                if ( options.resource ) {
                    toJid = toJid + "/" + options.resource;
                }
                jid = toJid;
            }
            return jid;
        };

        var _innerCheck = function ( options, conn ) {
            options = options || {};

            if ( options.user == '' ) {
                conn.onError({
                    type: EASEMOB_IM_CONNCTION_USER_NOT_ASSIGN_ERROR
                    , msg: '未指定用户'
                });
                return false;
            }

            var user = options.user || '';
            var appKey = options.appKey || '';
            var devInfos = appKey.split('#');

            if ( devInfos.length !== 2 ) {
                conn.onError({
                    type: EASEMOB_IM_CONNCTION_OPEN_ERROR
                    , msg: '请指定正确的开发者信息(appKey)'
                });
                return false;
            }
            var orgName = devInfos[0];
            var appName = devInfos[1];

            if ( !orgName ) {
                conn.onError({
                    type: EASEMOB_IM_CONNCTION_OPEN_ERROR
                    , msg: '请指定正确的开发者信息(appKey)'
                });
                return false;
            }
            if ( !appName ) {
                conn.onError({
                    type: EASEMOB_IM_CONNCTION_OPEN_ERROR
                    , msg: '请指定正确的开发者信息(appKey)'
                });
                return false;
            }

            var jid = appKey + "_" + user.toLowerCase() + "@" + conn.domain,
                resource = options.resource || 'webim';

            if ( conn.multiResources ) {
                resource += user + new Date().getTime() + Math.floor(Math.random().toFixed(6) * 1000000);
            }

            conn.context.jid = jid + '/' + resource;/*jid: {appkey}_{username}@domain/resource*/
            conn.context.userId = user;
            conn.context.appKey = appKey;
            conn.context.appName = appName;
            conn.context.orgName = orgName;

            return true;
        }

        var _getXmppUrl = function ( baseUrl, https ) {
            if ( /^(ws|http)s?:\/\/?/.test(baseUrl) ) {
                return baseUrl;
            }

            var url = {
                prefix: 'http',
                base: '://' + (baseUrl || 'im-api.easemob.com'),
                suffix: '/http-bind/'
            };

            if ( https && Utils.isSupportWss ) {
                url.prefix = 'wss';
                url.suffix = '/ws/';
            } else {
                if ( https ) {
                    url.prefix = 'https';
                } else if ( window.WebSocket ) {
                    url.prefix = 'ws';
                    url.suffix = '/ws/';
                }
            }

            return url.prefix + url.base + url.suffix;
        };

        //class
        var connection = function ( options ) {
            if ( !this instanceof Connection ) {
                return new Connection(options);
            }

            var options = options || {};

            this.multiResources = options.multiResources || false;
            this.wait = options.wait || 30;
            this.retry = options.retry || false;
            this.https = options.https || https;
            this.url = _getXmppUrl(options.url, this.https);
            this.hold = options.hold || 1;
            this.route = options.route || null;
            this.domain = options.domain || "easemob.com";
            this.inactivity = options.inactivity || 30;
            this.heartBeatWait = options.heartBeatWait || 60000;
            this.maxRetries = options.maxRetries || 5;
            this.pollingTime = options.pollingTime || 800;
            this.stropheConn = false;
            this.context = { status: STATUS_INIT };
        };

        connection.prototype.listen = function ( options ) {
            options.url && (this.url = _getXmppUrl(options.url, this.https));//just compatible
            this.onOpened = options.onOpened || EMPTYFN;
            this.onClosed = options.onClosed || EMPTYFN;
            this.onTextMessage = options.onTextMessage || EMPTYFN;
            this.onEmotionMessage = options.onEmotionMessage || EMPTYFN;
            this.onPictureMessage = options.onPictureMessage || EMPTYFN;
            this.onAudioMessage = options.onAudioMessage || EMPTYFN;
            this.onVideoMessage = options.onVideoMessage || EMPTYFN;
            this.onFileMessage = options.onFileMessage || EMPTYFN;
            this.onLocationMessage = options.onLocationMessage || EMPTYFN;
            this.onCmdMessage = options.onCmdMessage || EMPTYFN;
            this.onPresence = options.onPresence || EMPTYFN;
            this.onRoster = options.onRoster || EMPTYFN;
            this.onError = options.onError || EMPTYFN;
            this.onReceivedMessage = options.onReceivedMessage || EMPTYFN;
            this.onInviteMessage = options.onInviteMessage || EMPTYFN;
            this.onOffline = options.onOffline || EMPTYFN;
            this.onOnline = options.onOnline || EMPTYFN;

            _listenNetwork(this.onOnline, this.onOffline);
        }

        connection.prototype.heartBeat = function () {
            var me = this;

            if ( me.heartBeatID ) {
                return;
            }

            var options = {
                to : me.domain,
                type : "normal"
            };
            me.heartBeatID = setInterval(function () {
                me.sendHeartBeatMessage(options);
            }, me.heartBeatWait);
        };

        connection.prototype.sendHeartBeatMessage = function ( options ) {
            var json = {},
                jsonstr = Utils.stringify(json),
                dom = $msg({
                    to : options.to,
                    type : options.type,
                    id : this.getUniqueId(),
                    xmlns : "jabber:client"
                }).c("body").t(jsonstr);

            this.sendCommand(dom.tree());
        };

        connection.prototype.stopHeartBeat = function () {
            this.heartBeatID = clearInterval(this.heartBeatID);
        };


        connection.prototype.sendReceiptsMessage = function ( options ) {
            var dom = $msg({
                from: this.context.jid || ''
                , to: "easemob.com"
                , id: options.id || ''
            }).c("received",{
                xmlns: "urn:xmpp:receipts"
                , id: options.id || ''
            });
            this.sendCommand(dom.tree());
        };

        connection.prototype.open = function ( options ) {
            var pass = _innerCheck(options,this);

            if ( !pass ) {
                return;
            }

            var conn = this;

            if ( conn.isOpening() || conn.isOpened() ) {
                return;
            }

            if ( options.accessToken ) {
                options.access_token = options.accessToken;
                _dologin2IM(options,conn);
            } else {
                var apiUrl = options.apiUrl || (this.https ? 'https' : 'http') + '://a1.easemob.com';
                var userId = this.context.userId;
                var pwd = options.pwd || '';
                var appName = this.context.appName;
                var orgName = this.context.orgName;
                var successCallback = options.success;
                var errorCallback = options.error;

                var suc = function ( data, xhr ) {
                    if(successCallback){
                        successCallback(data);
                    }
                    conn.context.status = STATUS_DOLOGIN_IM;
                    _dologin2IM(data,conn);
                };
                var error = function ( res, xhr, msg ) {
                    if(errorCallback){
                        errorCallback(res,msg);
                    }
                    conn.clear();
                    if ( res.error && res.error_description ) {
                        conn.onError({
                            type: EASEMOB_IM_CONNCTION_OPEN_USERGRID_ERROR
                            , msg: "登录失败,"+res.error_description
                            , data: res
                            , xhr: xhr
                        });
                    } else {
                        conn.onError({
                            type: EASEMOB_IM_CONNCTION_OPEN_USERGRID_ERROR
                            , msg: "登录失败"
                            , data: res
                            , xhr: xhr
                        });
                    }
                };
                this.context.status = STATUS_DOLOGIN_USERGRID;

                var loginJson = {
                    grant_type: 'password'
                    , username: userId
                    , password: pwd
                };
                var loginfo = Utils.stringify(loginJson);

                var options = {
                    url: apiUrl + "/" + orgName + "/" + appName + "/token"
                    , dataType: 'json'
                    , data: loginfo
                    , success: suc || EMPTYFN
                    , error: error || EMPTYFN
                };
                Utils.ajax(options);
            }

        };

        connection.prototype.attach = function ( options ) {
            var pass = _innerCheck(options, this);

            if ( !pass ) {
                return;
            }

            options = options || {};

            var accessToken = options.accessToken || '';
            if ( accessToken == '' ) {
                this.onError({
                    type: EASEMOB_IM_CONNCTION_ATTACH_USERGRID_ERROR
                    , msg: '未指定用户的accessToken'
                });
                return;
            }

            var sid = options.sid || '';
            if ( sid === '') {
                this.onError({
                    type: EASEMOB_IM_CONNCTION_ATTACH_ERROR
                    , msg: '未指定用户的会话信息'
                });
                return;
            }

            var rid = options.rid || '';
            if ( rid === '') {
                this.onError({
                    type: EASEMOB_IM_CONNCTION_ATTACH_ERROR
                    , msg: '未指定用户的消息id'
                });
                return;
            }

            var stropheConn = new Strophe.Connection(this.url, {
                inactivity: this.inactivity,
                maxRetries: this.maxRetries,
                pollingTime: this.pollingTime
            });

            this.context.accessToken = accessToken;
            this.context.stropheConn = stropheConn;
            this.context.status = STATUS_DOLOGIN_IM;

            var conn = this;
            var callback = function ( status, msg ) {
                _login2ImCallback(status,msg,conn);
            };

            var jid = this.context.jid;
            var wait = this.wait;
            var hold = this.hold;
            var wind = this.wind || 5;
            stropheConn.attach(jid, sid, rid, callback, wait, hold, wind);
        };

        connection.prototype.close = function () {
            var status = this.context.status;
            if ( status == STATUS_INIT ) {
                return;
            }

            if ( this.isClosed() || this.isClosing() ) {
                return;
            }
            this.stopHeartBeat();
            this.context.status = STATUS_CLOSING;
            this.context.stropheConn.disconnect();
        };

        // see stropheConn.addHandler
        connection.prototype.addHandler = function ( handler, ns, name, type, id, from, options ) {
            this.context.stropheConn.addHandler(handler, ns, name, type, id, from, options);
        };

        connection.prototype.notifyVersion = function ( suc, fail ) {
            var jid = _getJid({},this);
            var dom = $iq({
                from: this.context.jid || ''
                , to: this.domain
                , type: "result"
            })
                .c("query", { xmlns: "jabber:iq:version" })
                .c("name")
                .t("easemob")
                .up()
                .c("version")
                .t(Easemob.im.version)
                .up()
                .c("os")
                .t("webim");

            suc = suc || EMPTYFN;
            error = fail || this.onError;
            var failFn = function ( ele ) {
                error({
                    type: EASEMOB_IM_CONNCTION_NOTIFYVERSION_ERROR
                    , msg: '发送版本信息给服务器时失败'
                    , data: ele
                });
            };
            this.context.stropheConn.sendIQ(dom.tree(), suc, failFn);
            return;
        };

        connection.prototype.handlePresence = function ( msginfo ) {
            if ( this.isClosed() ) {
                return;
            }
            //TODO: maybe we need add precense ack?
            //var id = msginfo.getAttribute('id') || '';
            //this.sendReceiptsMessage({
            //    id: id
            //});

            var from = msginfo.getAttribute('from') || '';
            var to = msginfo.getAttribute('to') || '';
            var type = msginfo.getAttribute('type') || '';
            var presence_type = msginfo.getAttribute('presence_type') || '';
            var fromUser = _parseNameFromJidFn(from);
            var toUser = _parseNameFromJidFn(to);
            var info = {
                from: fromUser
                , to: toUser
                , fromJid: from
                , toJid: to
                , type: type
                , chatroom: msginfo.getElementsByTagName('roomtype').length ? true : false
            };

            var showTags = msginfo.getElementsByTagName("show");
            if ( showTags && showTags.length > 0 ) {
                var showTag = showTags[0];
                info.show = Strophe.getText(showTag);
            }
            var statusTags = msginfo.getElementsByTagName("status");
            if ( statusTags && statusTags.length > 0 ) {
                var statusTag = statusTags[0];
                info.status = Strophe.getText(statusTag);
                info.code = statusTag.getAttribute('code');
            }

            var priorityTags = msginfo.getElementsByTagName("priority");
            if ( priorityTags && priorityTags.length > 0 ) {
                var priorityTag = priorityTags[0];
                info.priority  = Strophe.getText(priorityTag);
            }

            var error = msginfo.getElementsByTagName("error");
            if ( error && error.length > 0 ) {
                var error = error[0];
                info.error = {
                    code: error.getAttribute('code')
                };
            }

            var destroy = msginfo.getElementsByTagName("destroy");
            if ( destroy && destroy.length > 0 ) {
                var destroy = destroy[0];
                info.destroy = true;

                var reason = destroy.getElementsByTagName("reason");
                if ( reason && reason.length > 0 ) {
                    info.reason = Strophe.getText(reason[0]);
                }
            }

            if ( info.chatroom ) {
                var reflectUser = from.slice(from.lastIndexOf('/') + 1);

                if ( reflectUser === this.context.userId ) {
                    if ( info.type === '' && !info.code ) {
                        info.type = 'joinChatRoomSuccess';
                    } else if ( presence_type === 'unavailable' || info.type === 'unavailable' ) {
                        if ( !info.status ) {//web正常退出
                            info.type = 'leaveChatRoom';
                        } else if ( info.code == 110 ) {//app先退或被管理员踢
                            info.type = 'leaveChatRoom';
                        } else if ( info.error && info.error.code == 406 ) {//聊天室人已满，无法加入
                            info.type = 'joinChatRoomFailed';
                        }
                    }
                }
            } else if ( presence_type === 'unavailable' || type === 'unavailable' ) {//聊天室被删除没有roomtype, 需要区分群组被踢和解散
                if ( info.destroy ) {//群组和聊天室被删除
                    info.type = 'deleteGroupChat';
                } else if ( info.code == 307 || info.code == 321 ) {//群组被踢
                    info.type = 'leaveGroup';
                }
            }

            this.onPresence(info,msginfo);
        };

        connection.prototype.handlePing = function ( e ) {
            if ( this.isClosed() ) {
                return;
            }
            var id = e.getAttribute('id');
            var from = e.getAttribute('from');
            var to = e.getAttribute('to');
            var dom = $iq({
                from: to
                , to: from
                , id: id
                , type: 'result'
            });
            this.sendCommand(dom.tree());
        };

        connection.prototype.handleIq = function ( e ) {
            var id = e.getAttribute('id');
            var from = e.getAttribute('from') || '';
            var name = _parseNameFromJidFn(from);
            var curJid = this.context.jid;
            var curUser = this.context.userId;

            /*if ( !from || from === curJid ) {
             return true;
             }*/

            var iqresult = $iq({ type: 'result', id: id, from: curJid });
            this.sendCommand(iqresult.tree());

            var msgBodies = e.getElementsByTagName("query");
            if ( msgBodies&&msgBodies.length > 0 ) {
                var queryTag = msgBodies[0];
                var rouster = _parseFriendFn(queryTag);
                this.onRoster(rouster);
            }
            return true;
        };

        connection.prototype.handleMessage = function ( msginfo ) {
            if ( this.isClosed() ) {
                return;
            }

            var id = msginfo.getAttribute('id') || '';
            this.sendReceiptsMessage({
                id: id
            });
            var parseMsgData = _parseResponseMessage(msginfo);
            if ( parseMsgData.errorMsg ) {
                this.handlePresence(msginfo);
                return;
            }
            var msgDatas = parseMsgData.data;
            for ( var i in msgDatas ) {
                if ( !msgDatas.hasOwnProperty(i) ) {
                    continue;
                }
                var msg = msgDatas[i];
                if ( !msg.from || !msg.to ) {
                    continue;
                }

                var from = msg.from.toLowerCase();
                var too = msg.to.toLowerCase();
                var extmsg = msg.ext || {};
                var chattype = '';
                var typeEl = msginfo.getElementsByTagName("roomtype");
                if ( typeEl.length ) {
                    chattype = typeEl[0].getAttribute('type') || 'chat';
                } else {
                    chattype = msginfo.getAttribute('type') || 'chat';
                }

                var msgBodies = msg.bodies;
                if ( !msgBodies || msgBodies.length == 0 ) {
                    continue;
                }
                var msgBody = msg.bodies[0];
                var type = msgBody.type;
                if ( "txt" === type ) {
                    var receiveMsg = msgBody.msg;
                    var emotionsbody = Utils.parseTextMessage(receiveMsg, Easemob.im.EMOTIONS);
                    if ( emotionsbody.isemotion ) {
                        this.onEmotionMessage({
                            id: id
                            , type: chattype
                            , from: from
                            , to: too
                            , delay: parseMsgData.delayTimeStamp
                            , data: emotionsbody.body
                            , ext: extmsg
                        });
                    } else {
                        this.onTextMessage({
                            id: id
                            , type: chattype
                            , from: from
                            , to: too
                            , delay: parseMsgData.delayTimeStamp
                            , data: receiveMsg
                            , ext: extmsg
                        });
                    }
                } else if ( "img" === type ) {
                    var rwidth = 0;
                    var rheight = 0;
                    if ( msgBody.size ) {
                        rwidth = msgBody.size.width;
                        rheight = msgBody.size.height;
                    }
                    var msg = {
                        id: id
                        , type: chattype
                        , from: from
                        , to: too
                        , url: msgBody.url
                        , secret: msgBody.secret
                        , filename: msgBody.filename
                        , thumb: msgBody.thumb
                        , thumb_secret: msgBody.thumb_secret
                        , file_length: msgBody.file_length || ''
                        , width: rwidth
                        , height: rheight
                        , filetype: msgBody.filetype || ''
                        , accessToken: this.context.accessToken || ''
                        , ext: extmsg
                        , delay: parseMsgData.delayTimeStamp
                    };
                    this.onPictureMessage(msg);
                } else if ( "audio" === type ) {
                    this.onAudioMessage({
                        id: id
                        , type: chattype
                        , from: from
                        , to: too
                        , url: msgBody.url
                        , secret: msgBody.secret
                        , filename: msgBody.filename
                        , length: msgBody.length || ''
                        , file_length: msgBody.file_length || ''
                        , filetype: msgBody.filetype || ''
                        , accessToken: this.context.accessToken || ''
                        , ext: extmsg
                        , delay: parseMsgData.delayTimeStamp
                    });
                } else if ( "file" === type ) {
                    this.onFileMessage({
                        id: id
                        , type: chattype
                        , from: from
                        , to: too
                        , url: msgBody.url
                        , secret: msgBody.secret
                        , filename: msgBody.filename
                        , file_length: msgBody.file_length
                        , accessToken: this.context.accessToken || ''
                        , ext: extmsg
                        , delay: parseMsgData.delayTimeStamp
                    });
                } else if ( "loc" === type ) {
                    this.onLocationMessage({
                        id: id
                        , type: chattype
                        , from: from
                        , to: too
                        , addr: msgBody.addr
                        , lat: msgBody.lat
                        , lng: msgBody.lng
                        , ext: extmsg
                        , delay: parseMsgData.delayTimeStamp
                    });
                } else if ( "video" === type ) {
                    this.onVideoMessage({
                        id: id
                        , type: chattype
                        , from: from
                        , to: too
                        , url: msgBody.url
                        , secret: msgBody.secret
                        , filename: msgBody.filename
                        , file_length: msgBody.file_length
                        , accessToken: this.context.accessToken || ''
                        , ext: extmsg
                        , delay: parseMsgData.delayTimeStamp
                    });
                } else if ( "cmd" === type ) {
                    this.onCmdMessage({
                        id: id
                        , from: from
                        , to: too
                        , action: msgBody.action
                        , ext: extmsg
                        , delay: parseMsgData.delayTimeStamp
                    });
                }
            }
        };

        connection.prototype.handleReceivedMessage = function ( message ) {
            this.onReceivedMessage(message);

            var rcv = message.getElementsByTagName('received'),
                id,
                mid;

            if ( rcv.length > 0 ) {
                if ( rcv[0].childNodes && rcv[0].childNodes.length > 0 ) {
                    id = rcv[0].childNodes[0].nodeValue;
                } else {
                    id = rcv[0].innerHTML || rcv[0].innerText;
                }
                mid = rcv[0].getAttribute('mid');
            }

            if ( _msgHash[id] ) {
                _msgHash[id].msg.success instanceof Function && _msgHash[id].msg.success(id, mid);
                delete _msgHash[id];
            }
        };

        connection.prototype.handleInviteMessage = function ( message ) {
            var form = null;
            var invitemsg = message.getElementsByTagName('invite');
            var id = message.getAttribute('id') || '';
            this.sendReceiptsMessage({
                id: id
            });

            if ( invitemsg && invitemsg.length > 0 ) {
                var fromJid = invitemsg[0].getAttribute('from');
                form = _parseNameFromJidFn(fromJid);
            }
            var xmsg = message.getElementsByTagName('x');
            var roomid = null;
            if ( xmsg && xmsg.length > 0 ) {
                for ( var i = 0; i < xmsg.length; i++ ) {
                    if ( 'jabber:x:conference' === xmsg[i].namespaceURI ) {
                        var roomjid = xmsg[i].getAttribute('jid');
                        roomid = _parseNameFromJidFn(roomjid);
                    }
                }
            }
            this.onInviteMessage({
                type: 'invite'
                , from: form
                , roomid: roomid
            });
        };

        connection.prototype.sendCommand = function ( dom, id ) {
            if ( this.isOpened() ) {
                this.context.stropheConn.send(dom);
            } else {
                this.onError({
                    type : EASEMOB_IM_CONNCTION_OPEN_ERROR,
                    msg : '连接还未建立,请先登录或等待登录处理完毕'
                    , reconnect: true
                });
            }
        };

        connection.prototype.getUniqueId = function ( prefix ) {
            var cdate = new Date();
            var offdate = new Date(2010,1,1);
            var offset = cdate.getTime()-offdate.getTime();
            var hexd = parseInt(offset).toString(16);

            if ( typeof prefix === 'string' || typeof prefix === 'number' ) {
                return prefix + '_' + hexd;
            } else {
                return 'WEBIM_' + hexd;
            }
        };

        connection.prototype.send = function ( message ) {
            if ( Object.prototype.toString.call(message) === '[object Object]' ) {
                var appKey = this.context.appKey || '';
                var toJid = appKey + "_" + message.to + "@" + this.domain;

                if ( message.group ) {
                    toJid = appKey + "_" + message.to + '@conference.' + this.domain;
                }
                if ( message.resource ) {
                    toJid = toJid + "/" + message.resource;
                }

                message.toJid = toJid;
                message.id = message.id || this.getUniqueId();
                _msgHash[message.id] = new Message(message);
                _msgHash[message.id].send(this);
            } else if ( typeof message === 'string' ) {
                _msgHash[message] && _msgHash[message].send(this);
            }
        }

        connection.prototype.addRoster = function ( options ) {
            var jid = _getJid(options, this);
            var name = options.name || '';
            var groups = options.groups || '';

            var iq = $iq({type: 'set'});
            iq.c("query", {xmlns:'jabber:iq:roster'});
            iq.c("item", {jid: jid, name: name});

            if ( groups ) {
                for ( var i = 0; i < groups.length; i++ ) {
                    iq.c('group').t(groups[i]).up();
                }
            }
            var suc = options.success || EMPTYFN;
            var error = options.error || EMPTYFN;
            this.context.stropheConn.sendIQ(iq.tree(),suc,error);
        };

        connection.prototype.removeRoster = function ( options ) {
            var jid = _getJid(options,this);
            var iq = $iq({ type: 'set' }).c('query', { xmlns: "jabber:iq:roster" }).c('item', { jid: jid, subscription: "remove" });

            var suc = options.success || EMPTYFN;
            var error = options.error || EMPTYFN;
            this.context.stropheConn.sendIQ(iq,suc,error);
        };

        connection.prototype.getRoster = function ( options ) {
            var conn = this;
            var dom  = $iq({
                type: 'get'
            }).c('query', { xmlns: 'jabber:iq:roster' });

            options = options || {};
            suc = options.success || this.onRoster;
            var completeFn = function ( ele ) {
                var rouster = [];
                var msgBodies = ele.getElementsByTagName("query");
                if ( msgBodies&&msgBodies.length > 0 ) {
                    var queryTag = msgBodies[0];
                    rouster = _parseFriendFn(queryTag);
                }
                suc(rouster,ele);
            };
            error = options.error || this.onError;
            var failFn = function ( ele ) {
                error({
                    type: EASEMOB_IM_CONNCTION_GETROSTER_ERROR
                    , msg: '获取联系人信息失败'
                    , data: ele
                });
            };
            if ( this.isOpened() ) {
                this.context.stropheConn.sendIQ(dom.tree(),completeFn,failFn);
            } else {
                error({
                    type: EASEMOB_IM_CONNCTION_OPEN_ERROR
                    , msg: '连接还未建立,请先登录或等待登录处理完毕'
                });
            }
        };

        connection.prototype.subscribe = function ( options ) {
            var jid = _getJid(options, this);
            var pres = $pres({ to: jid, type: "subscribe" });
            if ( options.message ) {
                pres.c("status").t(options.message).up();
            }
            if ( options.nick ) {
                pres.c('nick', { 'xmlns': "http://jabber.org/protocol/nick" }).t(options.nick);
            }
            this.sendCommand(pres.tree());
        };

        connection.prototype.subscribed = function ( options ) {
            var jid = _getJid(options,this);
            var pres = $pres({to: jid, type: "subscribed"});

            if ( options.message ) {
                pres.c("status").t(options.message).up();
            }
            this.sendCommand(pres.tree());
        };

        connection.prototype.unsubscribe = function ( options ) {
            var jid = _getJid(options,this);
            var pres = $pres({to: jid, type: "unsubscribe"});

            if ( options.message ) {
                pres.c("status").t(options.message);
            }
            this.sendCommand(pres.tree());
        };

        connection.prototype.unsubscribed = function ( options ) {
            var jid = _getJid(options,this);
            var pres = $pres({ to: jid, type: "unsubscribed" });

            if ( options.message ) {
                pres.c("status").t(options.message).up();
            }
            this.sendCommand(pres.tree());
        };

        connection.prototype.createRoom = function ( options ) {
            var suc =options.success || EMPTYFN;
            var err =  options.error || EMPTYFN;
            var roomiq;

            roomiq = $iq({
                to: options.rooomName,
                type: "set"
            })
                .c("query", { xmlns: Strophe.NS.MUC_OWNER })
                .c("x", { xmlns: "jabber:x:data", type: "submit" });

            return this.context.stropheConn.sendIQ(roomiq.tree(), suc, err);
        };

        connection.prototype.join = function ( options ) {
            var roomJid = this.context.appKey + "_" + options.roomId + '@conference.' + this.domain;
            var room_nick = roomJid + "/" + this.context.userId;
            var suc = options.success || EMPTYFN;
            var err = options.error || EMPTYFN;
            var errorFn = function ( ele ) {
                err({
                    type: EASEMOB_IM_CONNCTION_JOINROOM_ERROR
                    , msg: '加入房间失败'
                    , data: ele
                });
            };
            var iq = $pres({
                from: this.context.jid,
                to: room_nick
            })
                .c("x", { xmlns: Strophe.NS.MUC });

            this.context.stropheConn.sendIQ(iq.tree(), suc, errorFn);
        };

        connection.prototype.listRooms = function ( options ) {
            var iq = $iq({
                to: options.server||'conference.' + this.domain,
                from: this.context.jid,
                type: "get"
            })
                .c("query", { xmlns: Strophe.NS.DISCO_ITEMS });

            var suc =options.success || EMPTYFN;
            var completeFn = function ( result ) {
                var rooms = [];
                rooms = _parseRoomFn(result);
                suc(rooms);
            }
            var err =  options.error || EMPTYFN;
            var errorFn = function ( ele ) {
                err({
                    type: EASEMOB_IM_CONNCTION_GETROOM_ERROR
                    , msg: '获取群组列表失败'
                    , data: ele
                });
            }
            this.context.stropheConn.sendIQ(iq.tree(), completeFn, errorFn);
        };

        connection.prototype.queryRoomMember = function ( options ) {
            var domain = this.domain;
            var members = [];
            var iq= $iq({
                to: this.context.appKey + "_" + options.roomId + '@conference.' + this.domain
                , type: 'get'
            })
                .c('query', { xmlns: Strophe.NS.MUC+'#admin' })
                .c('item', { affiliation: 'member' });

            var suc =options.success || EMPTYFN;
            var completeFn = function ( result ) {
                var items = result.getElementsByTagName('item');

                if ( items ) {
                    for ( var i = 0; i < items.length; i++ ) {
                        var item = items[i];
                        var mem = {
                            jid: item.getAttribute('jid')
                            , affiliation: 'member'
                        };
                        members.push(mem);
                    }
                }
                suc(members);
            };
            var err =  options.error || EMPTYFN;
            var errorFn = function ( ele ) {
                err({
                    type: EASEMOB_IM_CONNCTION_GETROOMMEMBER_ERROR
                    , msg: '获取群组成员列表失败'
                    , data: ele
                });
            };
            this.context.stropheConn.sendIQ(iq.tree(), completeFn, errorFn);
        };

        connection.prototype.queryRoomInfo = function ( options ) {
            var domain = this.domain;
            var iq= $iq({
                to:  this.context.appKey+"_"+options.roomId+'@conference.' + domain,
                type: "get"
            }).c("query", { xmlns: Strophe.NS.DISCO_INFO });

            var suc =options.success || EMPTYFN;
            var members = [];
            var completeFn = function ( result ) {
                var fields = result.getElementsByTagName('field');
                if ( fields ) {
                    for ( var i = 0; i < fields.length; i++ ) {
                        var field = fields[i];
                        if ( field.getAttribute('label') === 'owner' ) {
                            var mem = {
                                jid: (field.textContent || field.text) + "@" + domain
                                , affiliation: 'owner'
                            };
                            members.push(mem);
                        }
                    }
                }
                suc(members);
            };
            var err =  options.error || EMPTYFN;
            var errorFn = function ( ele ) {
                err({
                    type: EASEMOB_IM_CONNCTION_GETROOMINFO_ERROR
                    , msg: '获取群组信息失败'
                    , data: ele
                });
            };
            this.context.stropheConn.sendIQ(iq.tree(), completeFn, errorFn);
        };

        connection.prototype.queryRoomOccupants = function ( options ) {
            var suc =options.success || EMPTYFN;
            var completeFn = function ( result ) {
                var occupants = [];
                occupants = _parseRoomOccupantsFn(result);
                suc(occupants);
            }
            var err =  options.error || EMPTYFN;
            var errorFn = function ( ele ) {
                err({
                    type: EASEMOB_IM_CONNCTION_GETROOMOCCUPANTS_ERROR
                    , msg: '获取群组出席者列表失败'
                    , data: ele
                });
            };
            var attrs = {
                xmlns: Strophe.NS.DISCO_ITEMS
            };
            var info = $iq({
                from: this.context.jid
                , to: this.context.appKey + "_" + options.roomId + '@conference.' + this.domain
                , type: 'get'
            }).c('query', attrs);
            this.context.stropheConn.sendIQ(info.tree(), completeFn, errorFn);
        };

        connection.prototype.setUserSig = function ( desc ) {
            var dom = $pres({ xmlns: 'jabber:client' });
            desc = desc || "";
            dom.c("status").t(desc);
            this.sendCommand(dom.tree());
        };

        connection.prototype.setPresence = function ( type, status ) {
            var dom = $pres({ xmlns: 'jabber:client' });
            if ( type ) {
                if ( status ) {
                    dom.c("show").t(type);
                    dom.up().c("status").t(status);
                } else {
                    dom.c("show").t(type);
                }
            }
            this.sendCommand(dom.tree());
        };

        connection.prototype.getPresence = function () {
            var dom = $pres({ xmlns: 'jabber:client' });
            var conn = this;
            this.sendCommand(dom.tree());
        };

        connection.prototype.ping = function ( options ) {
            options = options || {};
            var jid = _getJid(options,this);

            var dom = $iq({
                from: this.context.jid || ''
                , to: jid
                , type: "get"
            }).c("ping", { xmlns: "urn:xmpp:ping" });

            suc = options.success || EMPTYFN;
            error = options.error || this.onError;
            var failFn = function ( ele ) {
                error({
                    type: EASEMOB_IM_CONNCTION_PING_ERROR
                    , msg: 'ping失败'
                    , data: ele
                });
            };
            if ( this.isOpened() ) {
                this.context.stropheConn.sendIQ(dom.tree(),suc,failFn);
            } else {
                error({
                    type: EASEMOB_IM_CONNCTION_OPEN_ERROR
                    , msg: '连接还未建立,请先登录或等待登录处理完毕'
                });
            }
            return;
        };

        connection.prototype.isOpened = function () {
            return this.context.status == STATUS_OPENED;
        };

        connection.prototype.isOpening = function () {
            var status = this.context.status;
            return status == STATUS_DOLOGIN_USERGRID || status == STATUS_DOLOGIN_IM;
        };

        connection.prototype.isClosing = function () {
            return this.context.status == STATUS_CLOSING;
        };

        connection.prototype.isClosed = function () {
            return this.context.status == STATUS_CLOSED;
        };

        connection.prototype.clear = function () {
            var key = this.context.appKey;
            this.context = {
                status: STATUS_INIT
                , appKey: key
            };
        };

        //rooms list
        connection.prototype.getChatRooms = function ( options ) {

            if ( !Utils.isCanSetRequestHeader ) {
                conn.onError({
                    type: EASEMOB_IM_CONNCTION_AUTH_ERROR
                    , msg: "当前浏览器不支持聊天室功能"
                });
                return;
            }

            var conn = this,
                token = options.accessToken || this.context.accessToken;

            if ( token ) {
                var apiUrl = options.apiUrl || (this.https ? 'https' : 'http') + '://a1.easemob.com';
                var appName = this.context.appName;
                var orgName = this.context.orgName;

                if ( !appName || !orgName ) {
                    conn.onError({
                        type: EASEMOB_IM_CONNCTION_AUTH_ERROR
                        , msg: "token无效"
                        , data: null
                    });
                    return;
                }

                var suc = function ( data, xhr ) {
                    typeof options.success === 'function' && options.success(data);
                };

                var error = function ( res, xhr, msg ) {
                    if ( res.error && res.error_description ) {
                        conn.onError({
                            type: EASEMOB_IM_LOAD_CHATROOM_ERROR
                            , msg: "获取聊天室失败," + res.error_description
                            , data: res
                            , xhr: xhr
                        });
                    }
                };

                var opts = {
                    url: apiUrl + "/" + orgName + "/" + appName + "/chatrooms"
                    , dataType: 'json'
                    , type: 'get'
                    , headers: {Authorization: 'Bearer ' + token}
                    , success: suc || EMPTYFN
                    , error: error || EMPTYFN
                };
                Utils.ajax(opts);
            } else {
                conn.onError({
                    type: EASEMOB_IM_CONNCTION_AUTH_ERROR
                    , msg: "token无效"
                    , data: null
                });
            }

        };

        connection.prototype.joinChatRoom = function ( options ) {
            var roomJid = this.context.appKey + "_" + options.roomId + '@conference.' + this.domain;
            var room_nick = roomJid + "/" + this.context.userId;
            var suc = options.success || EMPTYFN;
            var err = options.error || EMPTYFN;
            var errorFn = function ( ele ) {
                err({
                    type: EASEMOB_IM_CONNCTION_JOINROOM_ERROR
                    , msg: '加入聊天室失败'
                    , data: ele
                });
            };

            var iq = $pres({
                from: this.context.jid,
                to: room_nick
            })
                .c("x", { xmlns: Strophe.NS.MUC + '#user' })
                .c('item', { affiliation: 'member', role: 'participant' })
                .up().up()
                .c("roomtype", { xmlns: "easemob:x:roomtype", type: "chatroom" });

            this.context.stropheConn.sendIQ(iq.tree(), suc, errorFn);
        };

        connection.prototype.quitChatRoom = function ( options ) {
            var roomJid = this.context.appKey + "_" + options.roomId + '@conference.' + this.domain;
            var room_nick = roomJid + "/" + this.context.userId;
            var suc = options.success || EMPTYFN;
            var err = options.error || EMPTYFN;
            var errorFn = function ( ele ) {
                err({
                    type: EASEMOB_IM_CONNCTION_JOINROOM_ERROR
                    , msg: '退出房间失败'
                    , data: ele
                });
            };
            var iq = $pres({
                from: this.context.jid,
                to: room_nick,
                type: 'unavailable'
            })
                .c("x", { xmlns: Strophe.NS.MUC + '#user' })
                .c('item', { affiliation: 'none', role: 'none' })
                .up().up()
                .c("roomtype", { xmlns: "easemob:x:roomtype", type: "chatroom" });

            this.context.stropheConn.sendIQ(iq.tree(), suc, errorFn);
        };

        return connection;
    }());



    /*
     * CONST     
     */
    var EMPTYFN = function() {};

    tempIndex = 0;
    EASEMOB_IM_CONNCTION_USER_NOT_ASSIGN_ERROR = tempIndex++;
    EASEMOB_IM_CONNCTION_OPEN_ERROR = tempIndex++;
    EASEMOB_IM_CONNCTION_AUTH_ERROR = tempIndex++;
    EASEMOB_IM_CONNCTION_OPEN_USERGRID_ERROR = tempIndex++;
    EASEMOB_IM_CONNCTION_ATTACH_ERROR = tempIndex++;
    EASEMOB_IM_CONNCTION_ATTACH_USERGRID_ERROR = tempIndex++;
    EASEMOB_IM_CONNCTION_REOPEN_ERROR = tempIndex++;
    EASEMOB_IM_CONNCTION_SERVER_CLOSE_ERROR = tempIndex++;
    EASEMOB_IM_CONNCTION_SERVER_ERROR = tempIndex++;
    EASEMOB_IM_CONNCTION_IQ_ERROR = tempIndex++;
    EASEMOB_IM_CONNCTION_PING_ERROR = tempIndex++;
    EASEMOB_IM_CONNCTION_NOTIFYVERSION_ERROR = tempIndex++;
    EASEMOB_IM_CONNCTION_GETROSTER_ERROR = tempIndex++;
    EASEMOB_IM_CONNCTION_CROSSDOMAIN_ERROR = tempIndex++;
    EASEMOB_IM_CONNCTION_LISTENING_OUTOF_MAXRETRIES = tempIndex++;
    EASEMOB_IM_CONNCTION_RECEIVEMSG_CONTENTERROR = tempIndex++;
    EASEMOB_IM_CONNCTION_JOINROOM_ERROR = tempIndex++;
    EASEMOB_IM_CONNCTION_GETROOM_ERROR = tempIndex++;
    EASEMOB_IM_CONNCTION_GETROOMINFO_ERROR = tempIndex++;
    EASEMOB_IM_CONNCTION_GETROOMMEMBER_ERROR = tempIndex++;
    EASEMOB_IM_CONNCTION_GETROOMOCCUPANTS_ERROR = tempIndex++;

    EASEMOB_IM_UPLOADFILE_BROWSER_ERROR = tempIndex++;
    EASEMOB_IM_UPLOADFILE_ERROR = tempIndex++;
    EASEMOB_IM_UPLOADFILE_NO_LOGIN = tempIndex++;
    EASEMOB_IM_UPLOADFILE_NO_FILE = tempIndex++;
    EASEMOB_IM_DOWNLOADFILE_ERROR = tempIndex++;
    EASEMOB_IM_DOWNLOADFILE_NO_LOGIN = tempIndex++;
    EASEMOB_IM_DOWNLOADFILE_BROWSER_ERROR = tempIndex++;

    EASEMOB_IM_RESISTERUSER_ERROR = tempIndex++;

    EASEMOB_IM_LOAD_CHATROOM_ERROR = tempIndex++;
    EASEMOB_IM_JOIN_CHATROOM_ERROR = tempIndex++;
    EASEMOB_IM_QUIT_CHATROOM_ERROR = tempIndex++;

    tempIndex = 0;
    EASEMOB_IM_MESSAGE_REC_TEXT = tempIndex++;
    EASEMOB_IM_MESSAGE_REC_TEXT_ERROR = tempIndex++;
    EASEMOB_IM_MESSAGE_REC_EMOTION = tempIndex++;
    EASEMOB_IM_MESSAGE_REC_PHOTO = tempIndex++;
    EASEMOB_IM_MESSAGE_REC_AUDIO = tempIndex++;
    EASEMOB_IM_MESSAGE_REC_AUDIO_FILE = tempIndex++;
    EASEMOB_IM_MESSAGE_REC_VEDIO = tempIndex++;
    EASEMOB_IM_MESSAGE_REC_VEDIO_FILE = tempIndex++;
    EASEMOB_IM_MESSAGE_REC_FILE = tempIndex++;

    EASEMOB_IM_MESSAGE_SED_TEXT = tempIndex++;
    EASEMOB_IM_MESSAGE_SED_EMOTION = tempIndex++;
    EASEMOB_IM_MESSAGE_SED_PHOTO = tempIndex++;
    EASEMOB_IM_MESSAGE_SED_AUDIO = tempIndex++;
    EASEMOB_IM_MESSAGE_SED_AUDIO_FILE = tempIndex++;
    EASEMOB_IM_MESSAGE_SED_VEDIO = tempIndex++;
    EASEMOB_IM_MESSAGE_SED_VEDIO_FILE = tempIndex++;
    EASEMOB_IM_MESSAGE_SED_FILE = tempIndex++;
    EASEMOB_IM_FILESIZE_LIMIT = 10485760;


    tempIndex = 0;
    var STATUS_INIT = tempIndex++;
    var STATUS_DOLOGIN_USERGRID = tempIndex++;
    var STATUS_DOLOGIN_IM = tempIndex++;
    var STATUS_OPENED = tempIndex++;
    var STATUS_CLOSING = tempIndex++;
    var STATUS_CLOSED = tempIndex++;

    delete tempIndex;


    Easemob.im.Connection = Connection;
    Easemob.im.EmMessage = EmMessage;
    Easemob.im.Helper = Easemob.im.Utils = Utils;
    window.Easemob = Easemob;

}(window, undefined));