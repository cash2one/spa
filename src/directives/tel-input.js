/**
 * 限定只能输入11位的手机号码
 */
module.exports = {
    bind: function() {
        var _this = this;
        _this.handler = function () {
            var val = _this.el.value;
            if (/\D/.test(val)) {
                val = val.replace(/\D/g, '');
            }
            if (val.length == 1 && val != 1) {
                val = "";
            }
            if (val.length == 2 && !/^1[34578]$/.test(val)) {
                val = 1;
            }
            if (val.length > 11) {
                val = val.substring(0, 11);
            }
            _this.el.value = val;
            _this.set(/^1[34578]\d{9}$/.test(val));
        }.bind(_this);
        _this.el.addEventListener('input', _this.handler);
    },
    update: function() {

    },
    unbind: function() {
        this.el.removeEventListener('input', this.handler);
    }
};