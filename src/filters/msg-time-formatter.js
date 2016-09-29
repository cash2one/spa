/**
* 消息列表上的日期格式化
* */

module.exports = function(timeStr, tag) {
    //如果是今天，显示 hh:mm 昨天、前天特殊处理，其他显示MM-DD
    var time = (timeStr instanceof Date ? timeStr : new Date(timeStr)),
        month = time.getMonth(), day = time.getDate(),
        hour = time.getHours(), min = time.getMinutes(), sec = time.getSeconds();
    hour = (hour > 9 ? hour : '0' + hour), min = (min > 9 ? min : '0' + min), sec = (sec < 10 ? '0' + sec : sec);
    var str = hour + ':' + min + ':' + sec;
    var tempTime = new Date(), oneDayMillSecond = 24 * 60 * 60 * 1000;
    if (time.getFullYear() == tempTime.getFullYear()) {
        if (month == tempTime.getMonth()) {
            if (day == tempTime.getDate()) { //是否是今天
                return tag ? str : hour + ':' + min;
            }
            else {
                tempTime.setTime(tempTime.getTime() - oneDayMillSecond);
                if (day == tempTime.getDate()) {
                    return tag ? '昨天 ' + str : '昨天';
                }
                else {
                    tempTime.setTime(tempTime.getTime() - oneDayMillSecond);
                    if (day == tempTime.getDate()) {
                        return tag ? '前天 ' + str : '前天';
                    }
                }
            }
        }
        month = month + 1;
        return (month < 9 ? '0' + month : month) + '-' + (day < 9 ? '0' + day : day) + (tag ? ' ' + str : '');
    }
    month = month + 1;
    return time.getFullYear() + '-' + (month < 9 ? '0' + month : month) + '-' + (day < 9 ? '0' + day : day) + (tag ? ' ' + str : '');
};