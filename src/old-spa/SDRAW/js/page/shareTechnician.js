(function(){
    $.ajax({
        url: '../shared/techs',
        data:{
            id: $.param('id'), type:$.param('type')
        },
        success:function(data){
            if(data['statusCode']==400){
                $.tipShow(data['message']);
                $.pageCancel();
                return;
            }
            /*************************************定义常用变量*************************************/
            var str='',
                str1='',
                i,
                length=data['sliderPic'].length,
                telDetail=$('#telDetail'),
                tel,
                telCancel,
                bannerX=$('#content>div:nth-of-type(1)>div:nth-of-type(1)>div:nth-of-type(1)'),
                bannerFlag=$('#content>div:nth-of-type(1)>div:nth-of-type(1)>div:nth-of-type(3)'),
                logo=$('#content>div:nth-of-type(1)>div:nth-of-type(2)>div'),
                footer=$('#footer>div');
            /*************************************加载数据*************************************/
            //初始化可能出错的字段
            if(!data['club']['telephone'])
                data['club']['telephone']='';
            if(length==0){
                data['sliderPic']=[{
                    imageUrl: $.$.defaultBanner
                }];
                length=1;
            }
            //生成banner和banner的小圆点
            for(i=0;i<length;i++){
                str+='<img src="'+(data['sliderPic'][i]['imageUrl']|| $.$.defaultBanner)+'"/>';
                str1+='<span></span>';
            }
            //banner
            bannerX.Html(str);
            //banner小圆点
            bannerFlag.Html(str1);
            //会所logo
            logo.CSS('backgroundImage','url("'+(data['club']['imageUrl']|| $.$.defaultClubLogo)+'")');
            //会所名字
            $('#content>div:nth-of-type(1)>div:nth-of-type(3)').Text(data['club']['name']||$.$.defaultClubName);
            //会所地址
            $('#content>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type(2)>div').Text(data['club']['address']||$.$.defaultClubAddress);
            //生成会所电话
            str='';
            if(data['club']['telephone']!='')
                for(i= 0,str1=data['club']['telephone'].split(','),length=str1.length;i<length;i++){
                    str+='<div>'+str1[i]+'</div>';
                }
            $('#telDetail>div').Html(str+'<div>取消</div>');

            $('#content>div:nth-of-type(3)>div:nth-of-type(1)').CSS('backgroundImage','url("' + (data['tech']['avatarUrl']|| $.$.defaultHeader) + '")');
            $('#content>div:nth-of-type(3)>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type(1)').Text(data['tech']['name']|| $.$.defaultUserName);
            $('#content>div:nth-of-type(3)>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type(2)>div:nth-of-type(1)>div').CSS('width',data['tech']['star'] + '%');
            $('#content>div:nth-of-type(3)>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type(2)>div:nth-of-type(2)').Text(data['tech']['commentCount'] + '评论');
            $('#content>div:nth-of-type(3)>div:nth-of-type(2)>div:nth-of-type(2)').Html(data['tech']['serialNo']?'编号【<span>' + data['tech']['serialNo'] + '</span>】':'');

            $('#content>div:nth-of-type(4)>div:nth-of-type(2)>div:nth-of-type(2)>div').CSS('width',data['comment']['rate'] + '%');
            $('#content>div:nth-of-type(4)>div:nth-of-type(3)>div:nth-of-type(2)').Text(data['comment']['comment']);

            $('#footer>div').Class('active');
            /*************************************定义逻辑*************************************/
                //设置banner滚动
            $.scroll({
                content:$('#content>div:nth-of-type(1)>div:nth-of-type(1)')[0],
                contentX:bannerX[0],
                flagX:bannerFlag[0]
            });
            //点击logo
            $('#content>div:nth-of-type(1)>div:nth-of-type(2)>div').Page('home',1,true);
            //切换到地图
            if(data['club']['address'])
                $('#content>div:nth-of-type(2)>div:nth-of-type(1)').Page('map');
            //弹出电话选择界面
            $('#content>div:nth-of-type(2)>div:nth-of-type(2)').Click(
                data['club']['telephone']==''?
                    function() {
                        $.tipShow('暂无电话');
                    }:function(){
                    telDetail.CSS('display','');
                }
            );
            telDetail.Event('touchmove',function(e){
                e.preventDefault();
            },false);
            telDetail.Click(function(e,item){
                if(e.target==item)
                    telDetail.Hide();
            });
            //拨号
            tel=$('#telDetail>div>div');
            telCancel=tel.Remove(tel.length-1);
            tel.Click(function(e,item){
                location.href='tel:'+item.innerHTML;
            });
            telCancel.Click(function(){
                telDetail.Hide();
            });
            //点击技师
            $('#content>div:nth-of-type(3)').Page('technicianList/technicianDetail&id='+ data['tech']['id'],1,true);
            //点击提交
            footer.Click(function(e,item){
                if(footer.ClassHave('active'))
                    $.login('technicianList/technicianDetail&id='+ data['tech']['id']+'/confirmOrder&techId='+data['tech']['id'],1,true,true);
            });
            //执行页面切换
            $.pageSwitch();
        }
    });
})();