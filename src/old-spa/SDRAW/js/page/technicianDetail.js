(function(){
    var techId = $.param("id"),clubId,techInfo,
        /*isNeedBindPhone = $.localStorage('pop_bind_phone_dialog') || false,*/
        payAuthCode = $.param('code') || $.getUrlParam('code') || $.$.payAuthCode;
  if(!techId){
    $.tipShow("技师不存在！");
    return $.pageCancel();
  }

  if($.$.ua.isWX){
    if(!$.$.openId || $.$.openId.length < 10){
      if((new Date().getTime() - ($.getUrlParam('_t') || 0) > 24000) || !payAuthCode){
        $.getOauthCode('','9358','confirm-tech-pay','base');
        return;
      }else{
        $.ajax({
          url: "../api/v2/wx/oauth2/openid",
          isReplaceUrl:true,
          data: {
            code:payAuthCode,
            scope:'snsapi_base',
            wxmp: '9358',
            openId: '',
            webSessionId: ''
          },
          success: function (resp) {
            if (resp.statusCode == 200){
              $.$.openId =  resp.respData.openid;
              initPage();
            }else if(resp.statusCode == '40029'){
              $.getOauthCode('','9358','confirm-tech-pay','base');
            }
            else{
              $.tipShow(resp.msg || "获取openId失败！");
              return $.pageCancel();
            }
          }
        });
      }
    }else{
      initPage();
    }
  }else{
    initPage();
  }
  function initPage(){
    /*if(!isNeedBindPhone && $.$.userToken && !$.$.userTel){
      $.bindPhone(false);
    }*/
    //解决QQ浏览器上头部图片无法滑动的问题
    $("#content").CSS("overflow-y","hidden");

    $.ajax({
        url:  ($.$.clubID ? "../" : "") + '/technician/'+ techId,
        success: function (data) {
            if(!data.id){
              $.tipShow(data.msg || '无相关技师信息');
              return $.pageCancel();
            }
          //===  跳转到会所首页  ===
          $('#backHome').Click(function () {
            if($.$.clubID){
              $.page('home',-1,true);
            }else{
              location.href = location.origin+location.pathname+ "?club=" + data.info.clubId + "#"+home+($.$.visitChannel == '9358'?'&clubsource=9358':'');
            }
          });
            //==== 倒计时 ===
          var startDate = +new Date(),endDate = +new Date(),isStart = false,isEnd = false;
          calcTime();
          function calcTime(){
            var round = Math.round,floor = Math.floor,millis,endTimeProject,
              currTime = +new Date(),
              millisec,sec,min,hour,day
              ,spans = $('#content>div:nth-of-type(1)>div:nth-of-type(2)>span')
              ,labels = $('#content>div:nth-of-type(1)>div:nth-of-type(2)>span>div'),timeData;       //是否启用毫秒

            if(endTimeProject > 0 || true){
              sec = floor(endTimeProject%60);
              min = floor(endTimeProject/60%60);

              //timeData = [floor(day/10),day%10,floor(hour/10),hour%10,floor(min/10),min%10,floor(sec/10),sec%10,floor(millisec/10),floor(millis%10)];
              timeData = [1,0,0,1];

              labels.Index(0).Children().Text(timeData[0]);
              labels.Index(1).Children().Text(timeData[1]);
              labels.Index(2).Children().Text(timeData[2]);
              labels.Index(3).Children().Text(timeData[3]);

              //== 开始计时
              setTimeout(startToggle,1000);


              //==== 添加动画回调事件 =======
              spans.Event((function(){
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
              }()), function (e, item) {
                var $item = $(item),cs = $item.Children().Index(0).Children();
                cs.Index(1).Text(cs.Index(0).Text());
                $item.ClassClear('toggle');
              });

              //========= 数值渐变 =========
              function startToggle(){
                var tmpArr = [];
                if(timeData[3]>0){
                  timeData = [timeData[0],timeData[1],timeData[2],timeData[3] - 1];
                  tmpArr = tmpArr.concat([3]);
                }else if(timeData[2]>0){
                  timeData = [timeData[0],timeData[1],timeData[2]-1,9];
                  tmpArr = tmpArr.concat([2,3]);
                }else if(timeData[1]>0){
                  timeData = [timeData[0],timeData[1] - 1,5,9,];
                  tmpArr = tmpArr.concat([1,2,3]);
                }else if(timeData[0]>0){
                  timeData = [timeData[0] - 1,9,5,9];
                  tmpArr = tmpArr.concat([0,1,2,3]);
                }else{
                    return true;
                }
                changeNums(tmpArr);
                setTimeout(startToggle,1000);
              }
              function changeNums(_indexs){
                _indexs.forEach(function (v) {
                  labels.Index(v).Children().Index(0).Text(timeData[v]);
                  spans.Index(v).Class('toggle');
                })
              }
            }
          }
            /*************************************定义常用变量*************************************/
            var str='',
                str1='',
                str2='',
                dataLength,
                i,
                collectBtn = $('#content>div:nth-of-type(1)>div:nth-of-type(1)>div:nth-of-type(3)'),
                collectTip = $('#content>div:nth-of-type(1)>div:nth-of-type(1)>div:nth-of-type(3)>span'),
                collectCount = $('#content>div:nth-of-type(1)>div:nth-of-type(1)>div:nth-of-type(3)>div:nth-of-type(2)'),
                footer=$('#footer>div:nth-of-type(4)'),
                telDetail=$('#telDetail'),
                tel,
                telCancel,
                selectedItem;
            /*************************************加载数据*************************************/
            clubId = data['info']['clubId'];
        techInfo = data['info'];
        techInfo['emchatId'] = data['emchatId'];
        getCouponList();
            collectCount.Text(data['favoriteCount']);   //技师被收藏数
            $('#content>div:nth-of-type(1)>div:nth-of-type(1)>div:nth-of-type(1)>div:nth-of-type(1)').CSS('backgroundImage','url('+(data['info']['avatarUrl']|| $.$.defaultHeader)+')');
            $('#content>div:nth-of-type(1)>div:nth-of-type(1)>div:nth-of-type(2)>div:nth-of-type(1)').Text(data['info']['name']|| $.$.defaultTechName);
            if(data['info']['serialNo'])
                $('#content>div:nth-of-type(1)>div:nth-of-type(1)>div:nth-of-type(2)>div:nth-of-type(2)').Text(data['info']['serialNo']);
            else
                $('#content>div:nth-of-type(1)>div:nth-of-type(1)>div:nth-of-type(2)>div:nth-of-type(2)').Hide();
            $('#content>div:nth-of-type(3)>div:nth-of-type(2)>div:nth-of-type(1)>div').CSS('width',(data['info']['star']||0)+'%');
            $('#content>div:nth-of-type(3)>div:nth-of-type(2)>div:nth-of-type(2)').Text((data['info']['commentCount']||0)+'评论');
            $('#content>div:nth-of-type(1)>div:nth-of-type(1)>div:nth-of-type(2)>div:nth-of-type(3)').Text(data['info']['status']=='free'?'闲':'忙');
            $('#content>div:nth-of-type(1)>div:nth-of-type(1)>div:nth-of-type(2)>div:nth-of-type(3)').Class(data['info']['status']);
            if(!data['info']['description']){
                $('#content>div:nth-of-type(1)>div:nth-of-type(3)').Hide();
                //$('#content>div:nth-of-type(1)>div:nth-of-type(1)').CSS("height","10.556rem");
            }else{
                $('#content>div:nth-of-type(1)>div:nth-of-type(3)').Html(data['info']['description']||'');
            }

            for(i=0,dataLength=data['albums'].length;i<dataLength;i++){
                if(!data['albums'][i]['imageUrl']) continue;
                str+='<div style="background-image: url(\''+data['albums'][i]['imageUrl']+'\')"></div>';
                str1+='<img imageCache="'+data['albums'][i]['bigImageUrl']+'"/>';
                str2+='<span></span>';
            }
            $('#content>div:nth-of-type(2)>div>div')[0].innerHTML=str;

            //解决QQ浏览器上头部图片无法滑动的问题
            setTimeout(function(){
                $("#content").CSS("overflow-y","auto");
            },1000);

            $('#_picture>div:nth-of-type(1)')[0].innerHTML=str1;
            $('#_picture>div:nth-of-type(2)')[0].innerHTML=str2;
            if(str=='')
                $('#content>div:nth-of-type(2)').Hide();
            str='';

            for(i= 0,dataLength=data['service'].length;i<dataLength;i++){
                str+=
                    '<div hh="'+data["service"][i]["id"]+'">\
                        <div></div>\
                        <div style="background-image: url(\''+(data['service'][i]['imageUrl']|| $.$.defaultService)+'\')"></div>\
                        <div>'+(data['service'][i]['name']||'')+'</div>\
                        <div>\
                            <div>'+$.formatPrice(data['service'][i]['price1'],data['service'][i]['duration1'],data['service'][i]['durationUnit'])+'</div>\
                            <div>'+$.formatPrice(data['service'][i]['price2'],data['service'][i]['duration2'],data['service'][i]['durationUnitPlus'])+'</div>\
                        </div>\
                    </div>';
        }
        if(str==''){
          $('#content>div:nth-of-type(5)').Hide();
        }
        else{
          $('#content>div:nth-of-type(5)>div:nth-of-type(2)').Html(str);
          //add select event
          $('#content>div:nth-of-type(5)>div:nth-of-type(2)>div').Click(function(e,item){
            if(item.className != "selected"){
              $('#content>div:nth-of-type(5)>div:nth-of-type(2)>div.selected').ClassClear("selected");
              item.className = "selected";
              selectedItem = item.getAttribute("hh");
            }
            else{
              item.className = "";
              selectedItem = null;
            }
          });
        }

           if((data["isFavorite"]||'n').toLowerCase() == "y")
                collectBtn.Class("collected");
            if((data['appointment']||'y').toLowerCase()!='n'||(data['phoneAppointment']||'y').toLowerCase()!='n')
                footer.Class('active');

            //电话号码
            str='';
            if(data['telephone']!=''){
                for(i= 0,str1=data['telephone'].split(','),length=str1.length;i<length;i++){
                    str+='<div>'+str1[i]+'</div>';
                }
            }
            $('#telDetail>div').Html(str+'<div>取消</div>');
            /*************************************定义逻辑*************************************/
            //点击相册
            $('#pics>div>div>div').Click(function(e,item,index){
                scroll.IndexX(index);
                pic.style.display='';
            });
            //点击照片
            var pic=$('#_picture')[0],tx,tt;
            pic.addEventListener('touchstart',function(e){
                tx= e['touches'][0].clientX;
                tt= Date.now();
            });
            pic.addEventListener('touchend',function(e){
                if(Date.now()-tt<500&&Math.abs(e['changedTouches'][0].clientX-tx)<20){
                    pic.style.display='none';
                    e.preventDefault();
                }
            },false);
            var scroll=$.scroll({
                content:pic,
                contentX:pic.children[0],
                flagX:pic.children[1]
            });
            //点击评论
            $('#content>div:nth-of-type(3)')[0].onclick=function(){
                $.page('review&id='+$.param('id'));
        };
        //点击 查看店内其他技师
        $('#content>div:nth-of-type(4)')[0].onclick=function(){
          $.page('technicianList',1,true);
            };
            //点击收藏
            var colledAniTimer = null;
           collectBtn.Click(function(){
                if(!$.$.userToken){
                    $.$.loginUrl = "technicianDetail&id="+$.param('id');
                    $.page("login");
                    return;
                }
                var isCollected = collectBtn.ClassHave("collected");
                if(colledAniTimer){
                   clearTimeout(colledAniTimer);
                   collectTip.CSS('display','none');
                   collectTip.ClassClear('active');
                }
                $.ajax({
                    url : ($.$.clubID ? "../" : "")+"../profile/user/favorite/"+(isCollected ? 'delete' : 'create'),
                    data : { id : $.param('id') },
                    success:function(){
                        isCollected ? collectBtn.ClassClear('collected') : collectBtn.Class('collected');
                        if(isCollected){
                            collectTip.Text('已取消');
                            collectCount.Text(collectCount.Text() - 1);
                        }else{
                            collectTip.Text('已收藏');
                            collectCount.Text(collectCount.Text() - 0 + 1);
                        }
                        collectTip.CSS('display','block');
                        collectTip.Class('active');
                        colledAniTimer = setTimeout(function () {
                            collectTip.CSS('display','none');
                            collectTip.ClassClear('active');
                        },1100);
                    }
                });
            });

            //点击聊天
            $("#footer>div:nth-of-type(3)").Click(function(){
                //==== 防止在聊天与技师首页间多次点击后，地址栏地址无限增长，及返回操作无限在此两者间跳转 ====
                if(!!history.replaceState)
                  history.replaceState(null, document.title, location.search
                    + location.hash.toString().replace(new RegExp('chat&techId='+techId+($.$.visitChannel=="9358" ? "&clubId="+data["info"]["clubId"] : "")+'[^\/]*/'),''));
                $.login("chat&techId="+techId+($.$.visitChannel=="9358" ? "&clubId="+data["info"]["clubId"] : "")+"&backPublic=true");
            });

            //点击预约
            footer.Click(function(e,item){
                if(footer.ClassHave('active')){
                    if((data['phoneAppointment']||'y').toLowerCase()!='n'){
                        if($.login()) return;
                        if(data['telephone']=='') $.tipShow('暂无电话');
                        else telDetail.Class('active');
                    }else if((data['appointment']||'y').toLowerCase()!='n'){
                        if(data.payAppointment == 'on' && !$.$.ua.isWX){
							if($.checkAccessMenu('confirmOrder')){
								$.tipShow('【此会所需支付预约，请在微信客户端中打开】');
							}
                        }else{
                            $.login('confirmOrder&techId='+techId+(selectedItem ? "&itemId="+selectedItem : '')+($.$.visitChannel=="9358" ? "&clubId="+data["info"]["clubId"] : ""),false,true,true);
                        }
                    }
                }
            });
            telDetail.Event('touchmove',function(e){
                e.preventDefault();
            },false);
            telDetail.Click(function(e,item){
                if(e.target==item) telDetail.ClassClear();
            });
            tel=$('#telDetail>div>div');
            telCancel=tel.Remove(tel.length-1);
            tel.Click(function(e,item){
                location.href='tel:'+item.innerHTML;
            });
            telCancel.Click(function(){
                telDetail.ClassClear();
            });
            //执行页面切换
            $.pageSwitch(false,false);

            //分享设置
            if($.$.ua.isWX){
                $.X5Config({
                    "title" : ( data['info']['name'] || $.$.defaultTechName)+"欢迎您",
                    "desc" : "点我聊聊，更多优惠，更好服务！",
                    "link" : location.href.split("?")[0]+"?club="+ data["info"]["clubId"]+"#technicianDetail&id="+$.param('id'),
                    "imgUrl" : (data['info']['avatarUrl'] || $.$.defaultHeader)
                });
            }

            //点评
            $("#footer>div:nth-of-type(1)").Click(function(){
              if(data['toDayCommentCount'] == 1){
                $.tipShow('您今天已经评论过该技师了');
              }else{
                $.login("comment&techId="+techId+"&type=tech"+"&backPublic=true");
              }
            });
            //打赏
            $("#footer>div:nth-of-type(2)").Click(function(){
              if($.$.ua.isWX){
                $.login("techReward&techId=" + techId +"&backPublic=true");
              }else{
                $.tipShow('请在微信中打开',4000);
              }
            });
            //内容图片开始加载
            $('#_picture>div:nth-of-type(1) img').ImgSrcCacheBack(true);

      },
      error : function(text){
        $.tipShow(text);
        $.pageCancel();
      }
    });

    function getCouponList(){
      $.ajax({
        url:'../api/v2/club/'+clubId+'/coupons',
        isReplaceUrl:true,
        data:{
          clubId:clubId
        },
        success: function (result) {
          if(result.statusCode == 200 ){
            var $couponList = $('#couponList'),
                moneys = [],
                paids = [];
            result = result.respData.coupons || [];
            result.sort(function (a, b) {
              return a.useType >= b.useType?((b.consumeMoney - b.actValue) - (a.consumeMoney - a.actValue)):-1;
            });
            result.forEach(function (v) {
              if(v.couponType == 'paid'){
                paids.push('<div class="hour-coupon">\
                              <div data-act-id="'+ v.actId +'">\
                                <div>'+ v.actTitle +'</div>\
                                <div>'+ v.consumeMoneyDescription +'</div>\
                              </div>\
                              <div>\
                                <div>点钟券</div>\
                                <div class="sure-btn" data-act-id="'+ v.actId +'" data-act-value="'+ v.actValue +'">立即购买</div>\
                              </div>\
                            </div>');
              }else {
                moneys.push('<div class="money-coupon">\
                              <div data-act-id="'+ v.actId +'">\
                                <div>'+ v.actTitle +'</div>\
                                <div>'+ (v.useType == 'money'?(v.actValue+'元现金券，'):'') + v.consumeMoneyDescription +'</div>\
                              </div>\
                              <div>\
                                <div>'+ v.useTypeName +'</div>\
                                <div class="sure-btn '+((v.getFlag == 'already_get' || v.getFlag == 'finish_get')?'disabled':'')+'" data-act-id="'+ v.actId
                                  +'" data-act-value="'+ v.actValue +'" data-act-title="'+ v.actTitle +'" data-user-get-count="'+ v.userGetCount+'"  data-user-get-counts="'+ v.userGetCounts+'">'
                                  +(v.getFlag == 'already_get'?'已领取':(v.getFlag == 'finish_get'?'已领完':'立即领取'))+'</div>\
                              </div>\
                            </div>');
              }
            });
            if(paids.length == 0){
                $('#couponList>div>div:nth-of-type(2)>div:nth-of-type(1)').CSS('display','none');
            }
            if(moneys.length == 0){
              $('#couponList>div>div:nth-of-type(2)>div:nth-of-type(2)').CSS('display','none');
            }
            $('#couponList>div>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type(2)').Html(paids.join(''));
            $('#couponList>div>div:nth-of-type(2)>div:nth-of-type(2)>div:nth-of-type(2)').Html(moneys.join(''));

            if(paids.length > 0 || moneys.length > 0 ){
              $('#paidCoupon').Event('click', function () {
                $couponList.Class('active');
              }).ClassClear('hide');
            }

            $('#couponList>div>div:nth-of-type(1)>div').Click(function () {
              $couponList.ClassClear('active');
            });

            $couponList.Delegate('click','.hour-coupon .sure-btn', function (e, item) {
              var $this = $(item),data = item.dataset;
              if(!$.$.ua.isWX) return $.tipShow('需在微信中打开才可购买');
              if(!$.$.userToken){//未登录
                $.tipShow("请您先登录！");
                $.$.loginUrl="paidCoupon"+location.hash.split("paidCoupon")[1];
                $.page("login");
                return true;
              }else if(!$.$.userTel){
                $.$.loginUrl = location.hash;
                $.bindPhone(false);
                return true;
              }
              if($this.ClassHave('processing')) return $.tipShow('购买中,请稍候...');
              $this.Class('processing');
              $this.Text('购买中...');
              $.ajax({
                url : "../api/v2/wx/pay/paid_coupon",
                isReplaceUrl:true,
                type : "post",
                data : {
                  actId : data.actId,//点钟券id
                  businessType : "paid_coupon",
                  businessChannel : $.param("chanel") || 'link',
                  clubId : clubId,
                  money : data.actValue,
                  openId : $.$.openId,
                  techId : techId,
                  tradeChannel : "wx",
                  token: $.$.userToken,
                  sessionType: $.$.sessionType
                },
                success : function(result){
                  if(result.statusCode==200){
                    result =  JSON.parse(result.respData);

                    function onBridgeReady() {
                      WeixinJSBridge.invoke(
                        'getBrandWCPayRequest', {
                          "appId": result.appId,     //公众号名称，由商户传入
                          "timeStamp": result.timeStamp+"",  //时间戳，自1970年以来的秒数
                          "nonceStr": result.nonceStr, //随机串
                          "package": result.package,
                          "signType": result.signType,   //微信签名方式
                          "paySign" : result.paySign
                        },
                        function (res) {
                          $this.ClassClear('processing').Text('立即购买');
                          if (res.err_msg.indexOf("ok")>=0) {//支付成功之后
                            $.tipShow("支付成功！");
                            $this.Text('购买成功');
                            /////给技师发送我已购买点钟券的消息
                            var eb = $.$.easemob;
                            if (eb.userId && !eb.conn.isOpened()) {//未登录
                              var waitEasemobInit = setInterval(function () {//等待环信初始化完成
                                if (eb.conn.isOpened()) {
                                  clearInterval(waitEasemobInit);
                                  sendPaidCouponMsg(result.bizId,data);
                                }
                              }, 10);
                            }
                            else {
                              sendPaidCouponMsg(result.bizId,data);
                            }
                          }// res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠
                          else{
                            $.tipShow("未能成功支付！");
                          }
                        });
                    }

                    if (typeof WeixinJSBridge == "undefined") {
                      if (doc.addEventListener) {
                        doc.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
                      } else if (doc.attachEvent) {
                        doc.attachEvent('WeixinJSBridgeReady', onBridgeReady);
                        doc.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
                      }
                    } else {
                      onBridgeReady();
                    }
                  }else if(result.statusCode == '935801'){
                    $.localStorage('paid-coupon-param',true);
                    $.getOauthCode('','9358','paid-coupon','base');
                  }
                  else{
                    $this.ClassClear('processing').Text('立即购买');
                    $.tipShow(result.msg || "购买点钟券请求失败！");
                  }
                },
                error : function(){
                  $this.ClassClear('processing').Text('立即购买');
                }
              })
            }).Delegate('click','.money-coupon .sure-btn', function (e, item) {
              var $this = $(item),data = item.dataset;
              if($this.ClassHave('disabled')) return;
              if(!$.$.userToken){//跳转到登录
                $.$.loginUrl = location.hash;
                $.page("login");
                return true;
              }else if(!$.$.userTel){
                $.$.loginUrl = location.hash;
                $.bindPhone(false);
                return true;
              }
              if($this.ClassHave('processing')) return $.tipShow('领取中,请稍候...');
              $this.Class('processing');
              $this.Text('领取中...');
              $.ajax({
                url : '../get/redpacket',
                data:{
                  actId : data["actId"],
                  phoneNum : $.$.userTel,
                  openId : $.$.openId,
                  techCode: techInfo['inviteCode']
                },
                success : function(res){
                  $this.ClassClear('processing').Text('立即领取');
                  if(res.statusCode == 200){
                    if(data.userGetCount - 0 > data.userGetCounts - 0 + 1){
                      item.dataset['userGetCounts'] = data.userGetCounts - 0 + 1;
                    }else{
                      $this.Text('已领取').Class('disabled');
                    }
                    $.tipShow('领取成功');
                  }
                  else if(res.statusCode == 206){
                    $this.Text('已领取').Class('disabled');
                    $.tipShow(res.msg || "你已经领取过了！");
                  }
                  else{
                    $.tipShow(res.msg || "领取失败！");
                  }
                },
                error : function(res){
                  if(res.msg){
                    $.tipShow(res.msg);
                  }
                  $this.ClassClear('processing').Text('立即领取');
                }
              });
            });
            //======== 点击查看点钟券详情 =========
            $('.hour-coupon>div:nth-of-type(1)').Click(function (e, item) {
              $.page('paidCoupon&actId='+item.dataset.actId+'&techCode='+techInfo.inviteCode+'&chanel='+($.param("chanel") || 'link'));
            });

            ////////给技师发送我已购买点钟券的消息
            function sendPaidCouponMsg(bizId,data){
              var chatHeader = $.$.userHeader,
                chatName = ($.$.userName == $.$.defaultUserName ? $.$.defaultUserName + "(" + $.$.userTel.substr(0, 3) + "****" + $.$.userTel.slice(-4) + ")" : $.$.userName ),
                eb = $.$.easemob;

              ///////////////////////////////保存-存储
              var msgObj = {
                from: eb.userId,
                to: techInfo.emchatId,
                data: "您购买了"+techInfo.name+'的"'+data.actTitle+'"',
                ext: { name: techInfo.name, header: techInfo.avatarUrl, avatar: '', no: techInfo.serialNo, techId: techInfo.id, clubId: clubId, msgType: "paidCouponTip" }
              };

              var sendFailTimer = setTimeout(function(){
                msgObj.status = 0;
                afterSend();
              },5000);

              if(eb.conn.isOpened()){
                eb.conn.send({
                  to: techInfo.emchatId,
                  msg: data.actTitle+"&"+actId,
                  type: "chat",
                  ext: { name: chatName, header: chatHeader, msgType: "paidCouponTip", time: Date.now() , avatar : $.$.userAvatar },
                  success: function(){
                    $.sendFriend(techInfo.emchatId,"business_process");
                    clearTimeout(sendFailTimer);
                    msgObj.status = 1;
                    afterSend();
                  }
                });
              }

              function afterSend(){
                $.updateSessionList(msgObj, "text", false);
                $.addToMsgList(msgObj, "text");
                $.page("paidCouponDetail&userActId="+bizId);
              }
            }
          }else{
            $.tipShow(result.msg || '查询优惠券列表失败');
          }
        }
      });
    }
  }
})();