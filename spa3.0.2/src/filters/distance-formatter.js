/**
 * club list 页面会所距离的格式化显示
 * */

module.exports = function (d) {
    if (!d || d == Number.MAX_VALUE) {
        return '- m'
    }
    d = parseFloat(d, 10) * 1000
    if (isNaN(d) || d == 1000000 * 1000) {
        return '- m'
    }
    if (d > 1000) {
        return (d / 1000.0).toFixed(1) + 'km'
    }
    return (d).toFixed(0) + 'm'
}
