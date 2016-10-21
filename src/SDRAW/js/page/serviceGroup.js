(function(){
    $.ajax({
        url: 'service',
        success: function (data) {
            /*************************************定义常用变量*************************************/
            var str = '';
            /*************************************加载数据*************************************/
            for (var i = 0; i < data.length; i++) {
                str +='<div style="background-image: url(\''+data[i]['imageUrl']+'\')" hh="'+data[i]['id']+'"></div>';
            }
            /**********************************************************************/
            if(str=='')
                $('#content').Class('nullData');
            else
                $('#content').Html(str);
            /*************************************定义逻辑*************************************/
            $('#content>div').Click(function(e,item){
                $.page('serviceList&id='+item.getAttribute('hh'));
            });
            $.pageSwitch();
        }
    });
})();