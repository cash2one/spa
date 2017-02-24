(function () {
    var info = $.param("info");
    $("#content>div>span").Html(info)
    $.pageSwitch();

    setTimeout(function(){
        $.page("home");
    },3000)
})();