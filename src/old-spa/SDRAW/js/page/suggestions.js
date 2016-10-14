(function(){
    /*************************************定义常用变量*************************************/
    var score=['非常差','不满意','一般','满意','非常好'],
        starLayer=$('#content>div:nth-of-type(2)>div>div:nth-of-type(2)'),
        star=$('#content>div:nth-of-type(2)>div>div:nth-of-type(2)>div'),
        scoreText=$('#content>div:nth-of-type(2)>div>div:nth-of-type(3)'),
        footer=$('#footer>div');
    /*************************************加载数据*************************************/
    scoreText.Text(score[4]);
    /*************************************定义逻辑*************************************/
    //点击星星
    starLayer.Click(function(e,item,index){
        var v=Math.ceil((e.offsetX|e.layerX)/item.clientWidth/0.2);
        star[index].style.width=v*20+'%';
        scoreText[index].innerHTML=score[v-1];
    });
    //点击提交
    footer.Class('active');
    footer.Click(function(){
        var contentStr = $("#content>div:nth-of-type(3)>div:nth-of-type(2)>textarea")[0].value;
        if(contentStr && contentStr.length>1000) 
	contentStr = contentStr.substr(0,1000);
        $.ajax({
            url : "../../profile/user/feedback/create",
            type : "post",
            data : {
                "token" : $.$.userToken,
                "clubId" : $.$.clubID,
                "environmentalScore" : star[0].style.width.slice(0,-1),
                "serviceScore" : star[1].style.width.slice(0,-1),
                "comments" : contentStr
            },
            success : function(){
                $.tipShow("提交成功！");
                $.page();
            }
        });
    });
    //执行页面切换
    $.pageSwitch(true,false);
})();