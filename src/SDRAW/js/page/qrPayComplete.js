(function () {
  var score = ['非常差','很差','一般','很好','非常好'],
      $starLayer = $('.stars-area'),
      $star = $('.stars-area>div'),
      $scoreText = $('.comment-star > div > div:last-child'),
      $sureBtn = $('#sureBtn'),
    clubId = $.param('clubId') || $.getUrlParam('clubId') || '',
    money = $.param('money');
  if(clubId == '' || !money){
    $.tipShow('参数错误');
    return $.pageCancel();
  }

  $('.success-info > div > span:nth-of-type(2) > span:first-child').Text($.param('money'));

  $starLayer.Click(function(e,item,index){
    var v=Math.ceil((e.offsetX||e.layerX)/item.clientWidth/0.2);
    $star[index].style.width=v*20+'%';
    $scoreText[index].innerHTML=score[v-1];
  });

  $sureBtn.Click(function () {
    var contentStr = $(".comment-text")[0].value;
    if(contentStr && contentStr.length>1000)
      contentStr = contentStr.substr(0,1000);
    $.ajax({
      url : "../api/v2/profile/user/feedback/create",
      isReplaceUrl:true,
      type : "post",
      data : {
        "clubId" : clubId,
        "environmentalScore" : parseInt($star[0].style.width),
        "serviceScore" : parseInt($star[1].style.width),
        "comments" : encodeURIComponent(contentStr),
        token: $.$.payToken
      },
      success : function(){
        $.tipShow("提交成功！");
        $.page();
      }
    });
  });

  //执行页面切换
  $.pageSwitch();
})();