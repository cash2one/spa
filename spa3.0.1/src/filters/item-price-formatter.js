/**
* 服务项目的价格时间
* */

module.exports = function(price, duration, unit) {
    return ( (price && duration) ? price + '元/' + duration + (unit || '分钟') : '');
};