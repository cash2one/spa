/**
* 一元夺美女页面号码的显示
* */

module.exports = function(nos,winningNo) {
    var tempArr = [], nos = nos.split(","), k=0;
    for(;k<nos.length;k++){
        if(nos[k] == winningNo){
            tempArr.push("<strong>"+nos[k]+"</strong>");
        }
        else{
            tempArr.push("<span>"+nos[k]+"</span>");
        }
    }
    return tempArr.join("");
};