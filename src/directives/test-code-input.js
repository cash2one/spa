/**
 * 限定只能输入4位的数字
 */
module.exports = {
    twoWay : true,
    bind: function() {
        var _this = this;
        _this.handler = function () {
            var val = _this.el.value;
            if (/\D/.test(val)) {
                val = val.replace(/\D/g, '');
            }
            if (val.length > 4) {
                val = val.substring(0,4);
            }
            _this.el.value = val;
            _this.set(/^\d{4}$/.test(val));
        }.bind(_this);
        _this.el.addEventListener('input', _this.handler);
    },
    update: function() {

    },
    unbind: function() {
        this.el.removeEventListener('input', this.handler);
    }
};