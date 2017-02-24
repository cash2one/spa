(function(){
  var techs = null,currPage = 1,pageSize = 10,lastPage = 0,isLoadEnd = []
      ,timeSpan = $('#jumpHome>div>div:nth-of-type(1)>span')
      ,timeCount = 5
      ,jumpBtn = $('#jumpHome>div>div:nth-of-type(2)')
      ,countDownTimer = 0
      ,indexSpan = $('#content>div.image-area>div:nth-of-type(4)>span');

  if(!$.$.clubID){
    $.tipShow('无会所ID');
    return $.pageCancel();
  }

  function countDown(){
    --timeCount;
    if(countDownTimer) clearTimeout(countDownTimer);
    if(timeCount > 0){
      timeSpan.Text(timeCount);
      countDownTimer = setTimeout(countDown,1000);
    }else{
      $.page('home',-1,true);
    }
  }

  function queryData(page,callback){
    currPage = page = page || 1;
    if(isLoadEnd[page]) return;
    $.ajax({
      url:'../api/v2/club/'+ $.$.clubID +'/technician/list',
      isReplaceUrl:true,
      data:{
        page: page,
        pageSize: pageSize
      },
      success: function (result) {
        if(result.statusCode == 200){
          if(page === 1 && result.respData.length === 0){
            indexSpan.Text('0/0');
            timeSpan.Text(timeCount);
            $('#jumpHome').ClassClear('hide');
            countDownTimer = setTimeout(countDown,1000);
            jumpBtn.Click(function () {
              if(countDownTimer) clearTimeout(countDownTimer);
              $.page('home',-1,true);
            });
            $.pageSwitch(false);
            return;
          }
          if(lastPage == 0){
            techs = new Array((result.pageCount - 1) * pageSize);
            isLoadEnd = new Array(result.pageCount);
            lastPage = result.pageCount;
          }else if(page === lastPage){
            techs = techs.concat(result.respData || []);
          }
          isLoadEnd[page] = true;
          var args = [(page - 1) * pageSize,pageSize]
          Array.prototype.push.apply(args,result.respData || []);
          Array.prototype.splice.apply(techs,args);

          /*if(page == 1){
            initPage();
          }*/
          if(callback) callback();
        }else{
          $.tipShow(result.msg || '查询数据失败');
        }
      }
    });
  }
  //加载数据
  queryData(1, function () {
    if(lastPage > 1){
      queryData(lastPage,initPage);
    }else{
      initPage();
    }
  });

  function initPage(){
    $.pageSwitch(false);
    var page1 = $('#content>div.image-area>div:nth-of-type(4)>div:nth-of-type(1)'),
      pageImg1 = $('#content>div.image-area>div:nth-of-type(4)>div:nth-of-type(1)>div:nth-of-type(1)>img'),
      pageTechCode1 = $('#content>div.image-area>div:nth-of-type(4)>div:nth-of-type(1)>div:nth-of-type(1)>span'),
      pageTechName1 = $('#content>div.image-area>div:nth-of-type(4)>div:nth-of-type(1)>div:nth-of-type(2)'),
      pageTechService1 = $('#content>div.image-area>div:nth-of-type(4)>div:nth-of-type(1)>div:nth-of-type(3)'),
      pageTechDesc1 = $('#content>div.image-area>div:nth-of-type(4)>div:nth-of-type(1)>div:nth-of-type(4)'),

      page2 = $('#content>div.image-area>div:nth-of-type(3)>div:nth-of-type(1)'),
      pageImg2 = $('#content>div.image-area>div:nth-of-type(3)>div:nth-of-type(1)>div:nth-of-type(1)>img'),
      pageTechCode2 = $('#content>div.image-area>div:nth-of-type(3)>div:nth-of-type(1)>div:nth-of-type(1)>span'),
      pageTechName2 = $('#content>div.image-area>div:nth-of-type(3)>div:nth-of-type(1)>div:nth-of-type(2)'),
      pageTechService2 = $('#content>div.image-area>div:nth-of-type(3)>div:nth-of-type(1)>div:nth-of-type(3)'),
      pageTechDesc2 = $('#content>div.image-area>div:nth-of-type(3)>div:nth-of-type(1)>div:nth-of-type(4)'),

      page3 = $('#content>div.image-area>div:nth-of-type(2)>div:nth-of-type(1)'),
      pageImg3 = $('#content>div.image-area>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type(1)>img'),
      pageTechCode3 = $('#content>div.image-area>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type(1)>span'),
      pageTechName3 = $('#content>div.image-area>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type(2)'),
      pageTechService3 = $('#content>div.image-area>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type(3)'),
      pageTechDesc3 = $('#content>div.image-area>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type(4)'),

      //回退时，右辅助视图
      pageRight = $('#content>div.image-area>div:nth-of-type(5)>div:nth-of-type(1)'),
      pageRightImg = $('#content>div.image-area>div:nth-of-type(5)>div:nth-of-type(1)>div:nth-of-type(1)>img'),
      pageRightTechCode = $('#content>div.image-area>div:nth-of-type(5)>div:nth-of-type(1)>div:nth-of-type(1)>span'),
      pageRightTechName = $('#content>div.image-area>div:nth-of-type(5)>div:nth-of-type(1)>div:nth-of-type(2)'),
      pageRightTechService = $('#content>div.image-area>div:nth-of-type(5)>div:nth-of-type(1)>div:nth-of-type(3)'),
      pageRightTechDesc = $('#content>div.image-area>div:nth-of-type(5)>div:nth-of-type(1)>div:nth-of-type(4)'),

      //回退时，左辅助视图
      pageLeft = $('#content>div.image-area>div:nth-of-type(6)>div:nth-of-type(1)'),
      pageLeftImg = $('#content>div.image-area>div:nth-of-type(6)>div:nth-of-type(1)>div:nth-of-type(1)>img'),
      pageLeftTechCode = $('#content>div.image-area>div:nth-of-type(6)>div:nth-of-type(1)>div:nth-of-type(1)>span'),
      pageLeftTechName = $('#content>div.image-area>div:nth-of-type(6)>div:nth-of-type(1)>div:nth-of-type(2)'),
      pageLeftTechService = $('#content>div.image-area>div:nth-of-type(6)>div:nth-of-type(1)>div:nth-of-type(3)'),
      pageLeftTechDesc = $('#content>div.image-area>div:nth-of-type(6)>div:nth-of-type(1)>div:nth-of-type(4)'),

      //slide
      slideDiv = $('#content>div.image-area>div:nth-of-type(4)>div:nth-of-type(2)'),

      collectBtn = $('#content>div:nth-of-type(3)>div:nth-of-type(1)'),
      collectText = $('#content>div:nth-of-type(3)>div:nth-of-type(1)>div:nth-of-type(2)'),

      startPoint,isDrag = false,isNeedChange = false,
      //第一次滑动的方向，此后与此方向相同表示查看下一页，相反为往回翻页
      startDirection = 0, // 0：未确定方法  -1：向左   1：向右
      //此次滑动的方向
      currDirection = 0,  //同上
      isBack = false, //是否为往回翻页

      secondTy = 2, //第二个视图初始translateY的值
      thirdTy = 4, //第三个视图初始translateY的值
      tyDt = thirdTy - secondTy,

      secondScale = .94,
      thirdScale = .88,
      scaleDt = .06,

      secondOpacity = .9,
      thirdOpacity = 1,
      opacityDt = .1,

      touchCount = 0,
      currIndex = 0,

      currQueryTechCollectId,

      divWidth = page1[0].getBoundingClientRect().width,
    ///==== 浏览器特性  ====
      transitionEnd = (function(){
        var t,el = document.createElement('tmpelement'),
          transitions = {
            'transition':'transitionend',
            'OTransition':'oTransitionEnd',
            'MozTransition':'transitionend',
            'WebkitTransition':'webkitTransitionEnd',
            'MsTransition':'msTransitionEnd'
          };

        for(t in transitions){
          if( el.style[t] !== undefined ){
            return transitions[t];
          }
        }
      })(),
      transform = (function(){
        var t,el = document.createElement('tmpelement'),
          transitions = {
            'transform':'transform',
            'OTransform':'oTransform',
            'MozTransform':'transform',
            'WebkitTransform':'webkitTransform',
            'MsTransform':'msTransform'
          };

        for(t in transitions){
          if( el.style[t] !== undefined ){
            return transitions[t];
          }
        }
      })(),
      transitionDuration = transitionEnd.replace(/end$/i,'') + 'Duration';

    indexSpan.Text(1+'/'+techs.length);
    if(techs.length > 1){
      showData(techs[techs.length - 1],'left');
      showData(techs[techs.length - 1],'right');

      techs[techs.length - 1].imageLoaded = true;

      showData(techs[0],1);
      showData(techs[calcIndex(1)],2);
      showData(techs[calcIndex(2)],3);
      techs[0].imageLoaded = true;
      techs[calcIndex(1)].imageLoaded = true;
      techs[calcIndex(1)].imageLoaded = true;
      bindTouch();
    }else{
      showData(techs[0],1);
      $('#content>div.image-area>div:nth-of-type(1),#content>div.image-area>div:nth-of-type(2),#content>div.image-area>div:nth-of-type(3),#content>div.image-area>div:nth-of-type(5),#content>div.image-area>div:nth-of-type(6)').Hide();
      slideDiv.Hide();
    }

    currIndex = 0;
    currQueryTechCollectId = techs[0].id;
    isCollected(techs[0]);

    $('#content>div.image-area').Event('touchmove', function (e) {
      if (e.preventDefault) {
        e.preventDefault();
      } else {
        e.returnValue = false;
      }
    });

    //动画结束是否已调用过,防止瞬间调用两次
    var isCalled = false;
    function bindTouch(){
      page1.Event('touchstart', function (e) {
        startPoint = {
          x:e.touches[0].clientX,
          y:e.touches[0].clientY
        };
        isDrag = false;
        isNeedChange = false;
      });
      page1.Event('touchmove', function (e) {
        if (e.preventDefault) {
          e.preventDefault();
        } else {
          e.returnValue = false;
        }
        var touch = e.touches[0],cx = touch.clientX,cy = touch.clientY,ds;
        currDirection = 0;
        if(isDrag || Math.abs((cx - startPoint.x)/(cy - startPoint.y)) > 1){
          currDirection = (cx - startPoint.x)/Math.abs(cx - startPoint.x);
          //if(startDirection === 0){
            startDirection = currDirection;
          //}
          slideDiv[0].style.display = 'none';
          ds = Math.abs((cx - startPoint.x) / divWidth);
          if(!isDrag){
            touchCount ++;
            isDrag = true;
          }

          //if(touchCount === 1 || currDirection === startDirection) {   //第一次翻页 下一页
          if(currDirection < 0) {
            isBack = false;
            page1[0].style[transform] = 'translate(' + (cx - startPoint.x) + 'px,0)';
            page1[0].style.opacity = 1 - ds;
            page2[0].style[transform] = 'translate(0,' + (secondTy - tyDt * ds)
              + '%) scale(' + (secondScale + scaleDt * ds) + ',1)';
            page2[0].style.opacity = secondOpacity + opacityDt * ds;
            page3[0].style[transform] = 'translate(0,' + (thirdTy - tyDt * ds)
              + '%) scale(' + (thirdScale + scaleDt * ds) + ',1)';
            page3[0].style.opacity = thirdOpacity - opacityDt * ds;
          /*}else if(touchCount > 1){*/
          }else{
            isBack = true;
            page1[0].style[transform] = 'translate(0,' + tyDt * ds
              + '%) scale(' + (1 - scaleDt * ds) + ',1)';
            page1[0].style.opacity = 1 - opacityDt * ds;

            page2[0].style[transform] = 'translate(0,' + (secondTy + tyDt * ds)
              + '%) scale(' + (secondScale - scaleDt * ds) + ',1)';
            page2[0].style.opacity = secondOpacity - opacityDt * ds;

            if(startDirection > 0){
              pageLeft[0].style[transform] = 'translate(' + (cx - startPoint.x - divWidth) + 'px,0)';
              pageLeft[0].style.opacity = ds;
            }else{
              pageRight[0].style[transform] = 'translate(' + (cx - startPoint.x + divWidth) + 'px,0)';
              pageRight[0].style.opacity = ds;
            }
          }


        }
      });
      page1.Event('touchend', function (e) {
        touchend(e);
      });
      page1.Event('touchcancel', function (e) {
        touchend(e);
      });
      page1.Event(transitionEnd, function (e) {
        if(isCalled) return;
        isCalled = true;
        setTimeout(function () {
          isCalled = false;
        },0);
        page1[0].style[transitionDuration] = '0ms';
        page2[0].style[transitionDuration] = '0ms';
        page3[0].style[transitionDuration] = '0ms';
        pageLeft[0].style[transitionDuration] = '0ms';
        pageRight[0].style[transitionDuration] = '0ms';
        page1[0].style[transform] = 'translate(0,0)';
        page1[0].style.opacity = 1;
        page2[0].style[transform] = 'translate(0,'+secondTy+'%) scale('+secondScale+',1)';
        page2[0].style.opacity = secondOpacity;
        page3[0].style[transform] = 'translate(0,'+thirdTy+'%) scale('+thirdScale+',1)';
        page3[0].style.opacity = thirdOpacity;
        if(isBack){
          if(startDirection > 0){
            pageLeft[0].style[transform] = 'translate(' + -divWidth + 'px,0)';
            pageLeft[0].style.opacity = 0;
          }else{
            pageRight[0].style[transform] = 'translate(' + divWidth + 'px,0)';
            pageRight[0].style.opacity = 0;
          }
        }
        if(isNeedChange){
          var startIndex = 0;
          if(isBack){
            currIndex = calcIndex(currIndex - 1);
            if(!techs[calcIndex(currIndex - 2)]){   //加载上一页的内容
              queryData((lastPage + ((Math.ceil((currIndex+1)/pageSize)-1) % lastPage)) % lastPage, function () {
                //缓存下次可能显示的图片
                loadImage(techs[calcIndex(currIndex - 2)]);
              });
            }else{
              loadImage(techs[calcIndex(currIndex - 2)]);
            }
          }else{
            currIndex = calcIndex(currIndex + 1);
            //加载未加载的内容
            if(!techs[calcIndex(currIndex + 3)]){   //加载下一页的内容
              queryData(Math.ceil((currIndex+1)/pageSize) + 1, function () {
                //缓存下次可能显示的图片
                loadImage(techs[calcIndex(currIndex + 3)]);
              });
            }else{
              loadImage(techs[calcIndex(currIndex + 3)]);
            }
          }
          currQueryTechCollectId = techs[currIndex].id;
          isCollected(techs[currIndex]);
          startIndex = calcIndex(currIndex - 1);
          indexSpan.Text((currIndex + 1)+'/'+techs.length);
          showData(techs[startIndex],'left');
          showData(techs[startIndex],'right');
          for(var i = 1; i <= 3; i++){
            showData(techs[calcIndex(startIndex + i)],i);
          }

        }
      });
    }

    function touchend(e){
      var touch = e.changedTouches[0],cx = touch.clientX,cy = touch.clientY,ds,direction;
      if(isDrag){
        ds = Math.abs((cx - startPoint.x) / divWidth);
        direction = (cx - startPoint.x)/Math.abs(cx - startPoint.x);
        if(ds>.3){
          if(isBack){
            page1[0].style[transform] = 'translate(0,'+secondTy+'%) scale('+secondScale+',1)';
            page1[0].style.opacity = secondOpacity;
            page2[0].style[transform] = 'translate(0,'+thirdTy+'%) scale('+thirdScale+',1)';
            page2[0].style.opacity = thirdOpacity;
            page3[0].style[transform] = 'translate(0,'+thirdTy+'%) scale('+thirdScale+',1)';
            page3[0].style.opacity = 1;
            if(startDirection > 0){
              pageLeft[0].style[transform] = 'translate(0,0)';
              pageLeft[0].style.opacity = 1;
            }else{
              pageRight[0].style[transform] = 'translate(0,0)';
              pageRight[0].style.opacity = 1;
            }
          }else{
            page1[0].style[transform] = 'translate('+(divWidth * direction)+'px,0)';
            page1[0].style.opacity = 0;
            page2[0].style[transform] = 'translate(0,0) scale(1,1)';
            page2[0].style.opacity = 1;
            page3[0].style[transform] = 'translate(0,'+secondTy+'%) scale('+secondScale+',1)';
            page3[0].style.opacity = secondOpacity;
          }
          isNeedChange = true;
        }else{
          page1[0].style[transform] = 'translate(0,0)';
          page1[0].style.opacity = 1;
          page2[0].style[transform] = 'translate(0,'+secondTy+'%) scale('+secondScale+',1)';
          page2[0].style.opacity = secondOpacity;
          page3[0].style[transform] =  'translate(0,'+thirdTy+'%) scale('+thirdScale+',1)';
          page3[0].style.opacity = thirdOpacity;

          if(isBack){
            if(startDirection > 0){
              pageLeft[0].style[transform] = 'translate(' + -divWidth + 'px,0)';
              pageLeft[0].style.opacity = 0;
            }else{
              pageRight[0].style[transform] = 'translate(' + divWidth + 'px,0)';
              pageRight[0].style.opacity = 0;
            }
          }
        }
        page1[0].style[transitionDuration] = '200ms';
        page2[0].style[transitionDuration] = '200ms';
        page3[0].style[transitionDuration] = '200ms';
        pageLeft[0].style[transitionDuration] = '200ms';
        pageRight[0].style[transitionDuration] = '200ms';
        isDrag = false;
      }
    }

    function calcIndex(index) {
      return (techs.length + (index % techs.length)) % techs.length;
    }

    function showData(data,page){
      var img,techCode,techName,service,desc;
      switch (page){
        case 1:{
          img = pageImg1;
          techCode = pageTechCode1;
          techName = pageTechName1;
          service = pageTechService1;
          desc = pageTechDesc1;
        }break;
        case 2:{
          img = pageImg2;
          techCode = pageTechCode2;
          techName = pageTechName2;
          service = pageTechService2;
          desc = pageTechDesc2;
        }break;
        case 3:{
          img = pageImg3;
          techCode = pageTechCode3;
          techName = pageTechName3;
          service = pageTechService3;
          desc = pageTechDesc3;
        }break;
        case 'left':{
          img = pageLeftImg;
          techCode = pageLeftTechCode;
          techName = pageLeftTechName;
          service = pageLeftTechService;
          desc = pageLeftTechDesc;
        }break;
        case 'right':{
          img = pageRightImg;
          techCode = pageRightTechCode;
          techName = pageRightTechName;
          service = pageRightTechService;
          desc = pageRightTechDesc;
        }break;
      }
      img[0].src = data.avatarUrl || $.$.defaultHeader;
      techCode.Text(data.serialNo || '无编号');
      techName.Text(data.name);
      service.Html(concatTag(data.techTags));
      desc.Text(data.description || '此技师暂无说明');
    }

    function concatTag(tags){
      var tmpArr = [];
      (tags || []).forEach(function (tag,i) {
        if(i<3){
          tmpArr.push('<span>'+tag.tagName+'</span>');
        }else if( i == 3){
          tmpArr.push('<span>...</span>');
        }
      });
      tmpArr.length == 0 && tmpArr.push('<span>此技师暂无服务类型</span>');
      return tmpArr.join('');
    }
    //缓存图片
    function loadImage(data){
      if(!data.imageLoaded){
        var img = new Image();
        img.onload = function () {
          data.imageLoaded = true;
        };
        if(data.avatarUrl){
          img.src = data.avatarUrl;
        }else {
          data.imageLoaded = true;
        }
      }
    }

    //判断是否收藏此技师
    function isCollected(tech){
      if(!$.$.userToken) return;
      if(typeof tech.isColleced === 'undefined'){
        (function (tech){
          $.ajax({
            url:'../api/v2/profile/is_favorite/tech',
            isReplaceUrl: true,
            data:{
              techId: tech.id
            },
            success: function (result) {
              if(result.statusCode == 200){
                if(result.respData.isFavorite == 'Y'){
                  if(currQueryTechCollectId === tech.id){
                    collectBtn.Class('active');
                    collectText.Text('已收藏');
                  }
                  tech.isColleced = true;
                }else{
                  if(currQueryTechCollectId === tech.id){
                    collectBtn.ClassClear('active');
                    collectText.Text('收藏');
                  }
                  tech.isColleced = false;
                }
              }else{
                $.tipShow('查询收藏状态出错：'+(result.msg || '错误'));
              }
            }
          });
        }(tech));
      }else{
        if(tech.isColleced){
          collectBtn.Class('active');
          collectText.Text('已收藏');
        }else{
          collectBtn.ClassClear('active');
          collectText.Text('收藏');
        }
      }
    }

    //抢优惠
    $('#content>div:nth-of-type(4)').Page('activities');

    //收藏
    collectBtn.Click(function () {
      if (!$.$.userToken) {
        $.$.loginUrl = "appointTech";
        $.page("login");
        return;
      }
      var tech = techs[currIndex];
      $.ajax({
        url: "../api/v2/profile/user/favorite/" + (tech.isColleced ? 'delete' : 'create'),
        isReplaceUrl:true,
        data: {id: tech.id},
        success: function () {
          if (tech.isColleced) {
            collectBtn.ClassClear('active');
            collectText.Text('收藏');
            tech.isColleced = false;
          } else {
            collectBtn.Class('active');
            collectText.Text('已收藏');
            tech.isColleced = true;
          }
        }
      });
    });

    //相册
    $('#content>div:nth-of-type(3)>div:nth-of-type(2)').Click(function (e) {
      $.page('technicianDetail&id='+techs[currIndex].id);
    });

  }
})();