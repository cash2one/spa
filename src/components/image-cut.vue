<style scoped>
    div.image-cut-container{
        position: relative;
        background: #000;
    }
    div.image-cut-container>canvas:nth-of-type(2){
        display: none;
        position: absolute;
        background:#000;
    }
    div.image-cut-container>div.flip-btn{
        position: absolute;
        height:2.08rem;
        width:6.324rem;
        left:50%;
        margin-left:-3.167rem;
        line-height:2.08rem;
        border-radius:1.1rem;
        font-size:0.9rem;
        color:#666;
        text-align:center;
        background-color:#ccc
    }
</style>
<template>
    <div class="image-cut-container" :style="{ width : allW+'px', height : allH+'px' }" @touchstart="doTouchStartHandler($event)" @touchmove="doTouchMoveHandler($event)" @mousewheel="doMouseWheelHandler($event)">
        <canvas :width="allW" :height="allH" :style="{ width : allW+'px', height : allH+'px' }"></canvas>
        <canvas :style="{ top : vT+'px', left : vL+'px',width : vW+'px', height : vH+'px' }"></canvas>
        <div class="flip-btn" :style="{ top : (vT+vH+15)+'px'}" @click="doRotateImg()">翻转</div>
    </div>
</template>
<script>
    module.exports = {
        props : [ 'allW','allH', 'vW','vH' ],
        data: function() {
            return {
                img : null,//图片源
                imgX : 0,//图片当前坐标
                imgY : 0,
                imgW : 0,//图片当前大小
                imgH : 0,
                imgWN : 0,//图片原始大小
                imgHN : 0,
                allW : 300,//容器大小
                allH : 300,
                _$ : null,//操作容器
                _$$ : null,//导出容器
                $ : null,//操作容器内容符
                $$ : null,//导出容器内容符
                vW :  0,//可视区域大小 parseInt(((dw-cw)/2).toFixed())
                vH : 0,
                vL :  0,//可视区域左上右下坐标
                vT : 0,
                vR : 0,
                vB : 0,
                _vT_add_vB : 0,
                _vL_add_vR : 0,
                _vL_mes_1 : 0,
                _vT_mes_1 : 0,
                _vW_add_2 : 0,
                _vH_add_2 : 0,
                rotateBtn : null,
                currRotateStep : 0,

                touchType : 0,
                pM : null,
                pZ : null
            }
        },
        ready: function() {
            var _this = this;
            _this.vW = _this.vW<_this.allW ? _this.vW : _this.allW;
            _this.vH = _this.vH<_this.allH ? _this.vH : _this.allH;
            _this.vL = (_this.allW-_this.vW)/2;
            _this.vT = (_this.allH-_this.vH)/2;
            _this.vR = _this.vL+_this.vW;
            _this.vB = _this.vT+_this.vH;
            _this._vT_add_vB = _this.vT + _this.vB;
            _this._vL_add_vR = _this.vL + _this.vR;
            _this._vL_mes_1 = _this.vL-1;
            _this._vT_mes_1 = _this.vT-1;
            _this._vW_add_2 = _this.vW+2;
            _this._vH_add_2 = _this.vH+ 2;

            _this._$ = _this.$el.children[0];
            _this.$ = _this._$.getContext("2d");
            _this._$$ = _this.$el.children[1];
            _this.$$ = _this._$$.getContext("2d");
            _this.rotateBtn = _this.$el.querySelector("div.flip-btn");

            _this.drawMask();
            if(window._fileReader){
                _this.putImageUrl(window._fileReader.result);
            }
        },
        beforeDestroy: function() {

        },
        events : {
            "get-base64" : function(option){
                var _this = this, imgData = _this.getImageBase64(option.width,option.height);
                _this.$dispatch('put-base64', imgData);
            }
        },
        methods: {
            doTouchStartHandler : function(e){
                var _this = this;
                if(e.target != _this.rotateBtn){
                    e.preventDefault();
                    _this.pM=[e.targetTouches[0].clientX,e.targetTouches[0].clientY];
                    _this.touchType=1;
                    if(e.targetTouches.length==2){//缩放
                        _this.pZ=_this.getZ(_this.pM[0]-e.targetTouches[1].clientX,_this.pM[1]-e.targetTouches[1].clientY);
                        _this.touchType=2;
                    }
                }
            },
            doTouchMoveHandler : function(e){
                var _this = this;
                if(e.target != _this.rotateBtn){
                    e.preventDefault();
                    var p=[e.targetTouches[0].clientX,e.targetTouches[0].clientY];
                    if(_this.touchType == 1 && e.targetTouches.length==1) {
                        _this.imgX += p[0] - _this.pM[0];
                        _this.imgY += p[1] - _this.pM[1];
                        _this.pM = p;
                        //移动位置修正
                        if (_this.imgW > _this.vW) {
                            if (_this.imgX > _this.vL) _this.imgX = _this.vL;
                            else if (_this.imgX + _this.imgW < _this.vR) _this.imgX = _this.vR - _this.imgW;
                        } else{
                            _this.imgX = (_this._vL_add_vR - _this.imgW) / 2;
                        }

                        if (_this.imgH > _this.vH) {
                            if (_this.imgY > _this.vT) _this.imgY = _this.vT;
                            else if (_this.imgY + _this.imgH < _this.vB) _this.imgY = _this.vB - _this.imgH;
                        } else{
                            _this.imgY = (_this._vT_add_vB - _this.imgH) / 2;
                        }
                    }else if(_this.touchType == 2 && e.targetTouches.length==2) {
                        var z = _this.getZ(p[0] - e.targetTouches[1].clientX,p[1] - e.targetTouches[1].clientY),
                                zAdd = z / _this.pZ,
                                w = _this.imgW * zAdd,
                                h = _this.imgH * zAdd;

                        if(w>_this.vW || h>_this.vH){//缩放大小限制
                            _this.imgX -= (w - _this.imgW) / _this.imgW*(_this.allW/2-_this.imgX);
                            _this.imgY -= (h - _this.imgH) / _this.imgH*(_this.allH/2-_this.imgY);
                            _this.imgW=w;
                            _this.imgH=h;
                            _this.pZ = z;
                        }
                    }
                    _this.draw();
                }
            },
            doMouseWheelHandler : function(e){
                e.preventDefault();
                var _this = this;
                if(e.wheelDelta>0){
                    _this.imgW *= 1.05;
                    _this.imgH *= 1.05;
                }else if(e.wheelDelta<0){
                    _this.imgW/=1.05;
                    _this.imgH/=1.05;
                }
                _this.draw();
            },
            doRotateImg : function(){
                var _this = this;
                _this.currRotateStep = ( _this.currRotateStep==3 ? 0 : _this.currRotateStep+1);
                _this.draw();
            },
            getZ : function(a,b){
                return Math.sqrt(a*a+b*b);
            },
            drawMask : function(){
                var _this = this, $ = _this.$;
                $.fillStyle = 'rgba(0,0,0,0.7)';
                $.fillRect(0,0,_this.allW,_this.vT);//上下
                $.fillRect(0,_this.vB,_this.allW,_this.vT);
                $.fillRect(0,_this.vT,_this.vL,_this.vH);//左右
                $.fillRect(_this.vR,_this.vT,_this.vL,_this.vH);//左右
                $.strokeStyle = 'rgba(225,255,225,1)';//可视
                $.strokeRect(_this._vL_mes_1,_this._vT_mes_1,_this._vW_add_2,_this._vH_add_2);
            },
            draw : function(){
                var _this = this, cx = _this.imgX+_this.imgW/ 2, cy = _this.imgY+_this.imgH/ 2, $ = _this.$;
                $.clearRect(0,0,_this.allW,_this.allH);
                $.save();
                $.translate(cx, cy);
                $.rotate(90*_this.currRotateStep * Math.PI / 180);
                $.translate(-cx, -cy);
                $.drawImage(_this.img,_this.imgX,_this.imgY,_this.imgW,_this.imgH);
                $.restore();
                _this.drawMask();
            },
            initImg : function(){
                var _this = this;
                _this.imgW = _this.imgWN = _this.img.width;
                _this.imgH = _this.imgHN=_this.img.height;
                var z=1/Math.min(_this.imgW/_this.vW,_this.imgH/_this.vH);
                _this.imgW*=z;
                _this.imgH*=z;
                _this.imgX=(_this._vL_add_vR-_this.imgW)/2;
                _this.imgY=(_this._vT_add_vB-_this.imgH)/2;
                _this.draw();
            },
            putImageFromImg : function(imgTag){
                if(imgTag == null || typeof imgTag != "object" || imgTag.tagName.toLowerCase() != 'img') return false;
                this.img = imgTag;
                this.initImg();
            },
            putImageUrl : function(url){
                var _this = this;
                if(url == null || url== "") return false;
                _this.img = new Image();
                _this.img.onload = function(){
                    _this.initImg();
                };
                _this.img.src = url;
            },
            getImageBase64 : function(rw,rh){
                var _this = this, _$$ = _this._$$;
                _$$.style.display = 'block';
                var zW = rw/_this.vW, zH = rh/_this.vH;
                _$$.width = rw;
                _$$.height = rh;

                var   px = (_this.imgX-_this.vL)*zW, py = (_this.imgY-_this.vT)*zH,
                        ow = _this.imgW*zW, oh = _this.imgH*zH,
                        cx = px+ow/ 2, cy = py+oh/ 2,
                        $$ = _this.$$;

                $$.save();
                $$.translate(cx, cy);
                $$.rotate(90*_this.currRotateStep * Math.PI / 180);
                $$.translate(-cx, -cy);
                $$.drawImage(_this.img,px,py,ow,oh);
                $$.restore();
                return $$.canvas.toDataURL("image/png");
            }
        }
    }
</script>