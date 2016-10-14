;(function(window,undefined){
    /**
     * imageCut v2.0
     *      creator:ics
     * @method imageCut
     * @param set={
     *             dom:div//需要构建的dom，建议使用调用div
     *             width:300,//容器内容大小，与样式大小无关，默认为样式大小
     *             height:300,
     *             widthCut：150，//剪切版内容大小，与样式大小无关，默认为样式大小
     *             heightCut：150
     *          }
     */
    window.imageCut=function(set){//win入口
        set=set||{};
        if(set.dom==null)
            return;
        return makeImageCut(set);
    };
    function makeImageCut(set){//使用make是防止页面出现2个imageCut控件导致全局参数冲突
        var img,//图片源
            imgX,//图片当前坐标
            imgY,
            imgW,//图片当前大小
            imgH,
            imgWN,//图片原始大小
            imgHN,
            allW=set.width||300,//容器大小
            allH=set.height||300,
            _$,//操作容器
            _$$,//导出容器
            $,//操作容器内容符
            $$,//导出容器内容符
            vW=set.widthCut||150,//可视区域大小 parseInt(((dw-cw)/2).toFixed())
            vW=vW<allW?vW:allW,
            vH=set.heightCut||150,
            vH=vH<allH?vH:allH,
            vL=(allW-vW)/2,//可视区域左上右下坐标
            vT=(allH-vH)/2,
            vR=vL+vW,
            vB=vT+vH,
            _vT_add_vB=vT + vB,
            _vL_add_vR=vL + vR,
            _vL_mes_1=vL-1,
            _vT_mes_1=vT-1,
            _vW_add_2=vW+2,
            _vH_add_2=vH+ 2,
            rotateBtn,
            currRotateStep = 0;
        function imageCut(set){
            var div=set.dom,//外壳容器
                pM,//移动点
                pZ,//放大倍率
                type=0;
            div.style.display="none;";
            div.style.width=allW+"px";
            div.style.height=allH+"px";
            div.style.position="relative";

            div.innerHTML=
                '<canvas width="'+allW+'" height="'+allH+'" style="width:'+allW+'px;height:'+allH+'px;background: #000;"></canvas>\
                <canvas style="display: none;position: absolute;top:'+vT+'px;left:'+vL+'px;width:'+vW+'px;height:'+vH+'px;background:#000;"></canvas>\
                <div style="height:2.08rem;width:6.324rem;position: absolute;left:50%;margin-left:-3.167rem;top:'+(vT+vH+15)+'px;line-height:2.08rem;border-radius:1.1rem;font-size:0.9rem;color:#666;text-align:center;background-color:#ccc">翻转</div>';

            _$=div.children[0];
            $=_$.getContext("2d");
            _$$=div.children[1];
            $$=_$$.getContext("2d");
            rotateBtn = div.getElementsByTagName("div")[0];

            div.addEventListener('touchstart', function(e) {
                if(e.target != rotateBtn){
                    e.preventDefault();
                    pM=[e.targetTouches[0].clientX,e.targetTouches[0].clientY];
                    type=1;
                    if(e.targetTouches.length==2){//缩放
                        pZ=getZ(pM[0]-e.targetTouches[1].clientX,pM[1]-e.targetTouches[1].clientY);
                        type=2;
                    }
                }
            }, false);

            div.addEventListener('touchmove', function(e) {
                if(e.target != rotateBtn){
                    e.preventDefault();
                    var p=[e.targetTouches[0].clientX,e.targetTouches[0].clientY];
                    if(type==1&&e.targetTouches.length==1) {
                        imgX += p[0] - pM[0];
                        imgY += p[1] - pM[1];
                        pM = p;
                        //移动位置修正
                        if (imgW > vW) {
                            if (imgX > vL)
                                imgX = vL;
                            else if (imgX + imgW < vR)
                                imgX = vR - imgW;
                        } else
                            imgX = (_vL_add_vR - imgW) / 2;

                        if (imgH > vH) {
                            if (imgY > vT)
                                imgY = vT;
                            else if (imgY + imgH < vB)
                                imgY = vB - imgH;
                        } else
                            imgY = (_vT_add_vB - imgH) / 2;

                    }else if(type==2&&e.targetTouches.length==2) {
                        var z=getZ(p[0] - e.targetTouches[1].clientX,p[1] - e.targetTouches[1].clientY),
                            zAdd = z / pZ,
                            w = imgW * zAdd,
                            h = imgH * zAdd;

                        if(w>vW||h>vH){//缩放大小限制
                            imgX -= (w - imgW) / imgW*(allW/2-imgX);
                            imgY -= (h - imgH) / imgH*(allH/2-imgY);
                            imgW=w;
                            imgH=h;
                            pZ = z;
                        }
                    }
                    draw();
                }
            }, false);

            rotateBtn.onclick = function(){
                rotateImg();
            };

            div.addEventListener('mousewheel', function(e) {
                e.preventDefault();
                if(e.wheelDelta>0){
                    imgW*=1.05;
                    imgH*=1.05;
                }else if(e.wheelDelta<0){
                    imgW/=1.05;
                    imgH/=1.05;
                }
                draw();
            }, false);
            drawMask();
        };
        imageCut.prototype={
            putImageFromImg:function(imgTag){//使用img标签传入数据
                if(imgTag==null||typeof imgTag!="object"||imgTag.tagName.toLowerCase()!='img')
                    return false;
                img=imgTag;
                initImg();
            },
            putImageUrl:function(url){//使用url或者base64数据传入数据
                if(url==null||url=="")
                    return false;
                img = new Image();
                img.onload = function(){
                    initImg();
                };
                img.src = url;
            },
            getImageBase64:function(rw,rh){//割图数据,参数不填默认为原比例输出，填写为固定大小输出
                _$$.style.display='block';

                var zW=rw/vW,
                    zH=rh/vH;
                _$$.width=rw;
                _$$.height=rh;

                var px = (imgX-vL)*zW, py = (imgY-vT)*zH;
                var ow = imgW*zW, oh = imgH*zH;
                var cx = px+ow/ 2, cy = py+oh/2;
                $$.save();
                $$.translate(cx, cy);
                $$.rotate(90*currRotateStep * Math.PI / 180);
                $$.translate(-cx, -cy);
                $$.drawImage(img,px,py,ow,oh);
                $$.restore();
                return $$.canvas.toDataURL("image/png");
            }
        };
        function draw(){
            var cx =imgX+imgW/ 2, cy =imgY+imgH/2;
            $.clearRect(0,0,allW,allH);
            $.save();
            $.translate(cx, cy);
            $.rotate(90*currRotateStep * Math.PI / 180);
            $.translate(-cx, -cy);
            $.drawImage(img,imgX,imgY,imgW,imgH);
            $.restore();
            drawMask();
        }
        function rotateImg(){
            currRotateStep = ( currRotateStep==3 ? 0 : currRotateStep+1);
            draw();
        }
        function drawMask(){
            $.fillStyle = 'rgba(0,0,0,0.7)';
            $.fillRect(0,0,allW,vT);//上下
            $.fillRect(0,vB,allW,vT);
            $.fillRect(0,vT,vL,vH);//左右
            $.fillRect(vR,vT,vL,vH);//左右
            $.strokeStyle = 'rgba(225,255,225,1)';//可视
            $.strokeRect(_vL_mes_1,_vT_mes_1,_vW_add_2,_vH_add_2);
        }
        function getZ(a,b){
            return Math.sqrt(a*a+b*b);
        }
        function initImg(){
            imgW=imgWN=img.width;
            imgH=imgHN=img.height;
            var z=1/Math.min(imgW/vW,imgH/vH);
            imgW*=z;
            imgH*=z;
            imgX=(_vL_add_vR-imgW)/2;
            imgY=(_vT_add_vB-imgH)/2;
            draw();
        }
        return new imageCut(set);
    }
})(window);