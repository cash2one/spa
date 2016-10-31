/**
 * club list 页面会所距离的格式化显示
 * */

module.exports = function (d) {
    d = parseFloat(d, 10) * 1000
    if (isNaN(d) || d === 1000000 * 1000) {
        return '- 米'
    }
    if (d > 1000) {
        return (d / 1000.0).toFixed(1) + '千米'
    }
    return (d).toFixed(0) + '米'
}
