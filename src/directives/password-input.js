/**
 * 限定输入6~20位的密码
 */
module.exports = {
    twoWay : true,
    bind: function() {
        var _this = this;
        _this.handler = function () {
            var val = _this.el.value;
            if (val.length > 20) {
                val = val.substring(0,20);
            }
            _this.el.value = val;
            _this.set(val.length>=6);
        }.bind(_this);
        _this.el.addEventListener('input', _this.handler);
    },
    update: function() {

    },
    unbind: function() {
        this.el.removeEventListener('input', this.handler);
    }
};