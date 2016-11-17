/**
* 日期的格式化
* */
import Util from "../libs/util";

module.exports = function(timeStr,formatStr) {
    return Util.dateFormat(new Date(timeStr),formatStr);
};