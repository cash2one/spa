/**
* 金额的格式化
* */

module.exports = function(money) {
    return  (money/100).toFixed(2);
};