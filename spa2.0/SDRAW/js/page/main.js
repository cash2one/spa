!function (a, b) {
  "function" == typeof define && (define.amd || define.cmd) ? define(function () {
    return b(a)
  }) : b(a, !0)
}(this, function (a, b) {
  function c(b, c, d) {
    a.WeixinJSBridge ? WeixinJSBridge.invoke(b, e(c), function (a) {
      g(b, a, d)
    }) : j(b, d)
  }

  function d(b, c, d) {
    a.WeixinJSBridge ? WeixinJSBridge.on(b, function (a) {
      d && d.trigger && d.trigger(a), g(b, a, c)
    }) : d ? j(b, d) : j(b, c)
  }

  function e(a) {
    return a = a || {}, a.appId = E.appId, a.verifyAppId = E.appId, a.verifySignType = "sha1", a.verifyTimestamp = E.timestamp + "", a.verifyNonceStr = E.nonceStr, a.verifySignature = E.signature, a
  }

  function f(a) {
    return {
      timeStamp: a.timestamp + "",
      nonceStr: a.nonceStr,
      "package": a.package,
      paySign: a.paySign,
      signType: a.signType || "SHA1"
    }
  }

  function g(a, b, c) {
    var d, e, f;
    switch (delete b.err_code, delete b.err_desc, delete b.err_detail, d = b.errMsg, d || (d = b.err_msg, delete b.err_msg, d = h(a, d), b.errMsg = d), c = c || {}, c._complete && (c._complete(b), delete c._complete), d = b.errMsg || "", E.debug && !c.isInnerInvoke && alert(JSON.stringify(b)), e = d.indexOf(":"), f = d.substring(e + 1)) {
      case"ok":
        c.success && c.success(b);
        break;
      case"cancel":
        c.cancel && c.cancel(b);
        break;
      default:
        c.fail && c.fail(b)
    }
    c.complete && c.complete(b)
  }

  function h(a, b) {
    var e, f, c = a, d = p[c];
    return d && (c = d), e = "ok", b && (f = b.indexOf(":"), e = b.substring(f + 1), "confirm" == e && (e = "ok"), "failed" == e && (e = "fail"), -1 != e.indexOf("failed_") && (e = e.substring(7)), -1 != e.indexOf("fail_") && (e = e.substring(5)), e = e.replace(/_/g, " "), e = e.toLowerCase(), ("access denied" == e || "no permission to execute" == e) && (e = "permission denied"), "config" == c && "function not exist" == e && (e = "ok"), "" == e && (e = "fail")), b = c + ":" + e
  }

  function i(a) {
    var b, c, d, e;
    if (a) {
      for (b = 0, c = a.length; c > b; ++b)d = a[b], e = o[d], e && (a[b] = e);
      return a
    }
  }

  function j(a, b) {
    if (!(!E.debug || b && b.isInnerInvoke)) {
      var c = p[a];
      c && (a = c), b && b._complete && delete b._complete, console.log('"' + a + '",', b || "")
    }
  }

  function k() {
    u || v || E.debug || "6.0.2" > z || D.systemType < 0 || A || (A = !0, D.appId = E.appId, D.initTime = C.initEndTime - C.initStartTime, D.preVerifyTime = C.preVerifyEndTime - C.preVerifyStartTime, H.getNetworkType({
      isInnerInvoke: !0,
      success: function (a) {
        var b, c;
        D.networkType = a.networkType, b = "http://open.weixin.qq.com/sdk/report?v=" + D.version + "&o=" + D.isPreVerifyOk + "&s=" + D.systemType + "&c=" + D.clientVersion + "&a=" + D.appId + "&n=" + D.networkType + "&i=" + D.initTime + "&p=" + D.preVerifyTime + "&u=" + D.url, c = new Image, c.src = b
      }
    }))
  }

  function l() {
    return (new Date).getTime()
  }

  function m(b) {
    w && (a.WeixinJSBridge ? b() : q.addEventListener && q.addEventListener("WeixinJSBridgeReady", b, !1))
  }

  function n() {
    H.invoke || (H.invoke = function (b, c, d) {
      a.WeixinJSBridge && WeixinJSBridge.invoke(b, e(c), d)
    }, H.on = function (b, c) {
      a.WeixinJSBridge && WeixinJSBridge.on(b, c)
    })
  }

  var o, p, q, r, s, t, u, v, w, x, y, z, A, B, C, D, E, F, G, H;
  if (!a.jWeixin)return o = {
    config: "preVerifyJSAPI",
    onMenuShareTimeline: "menu:share:timeline",
    onMenuShareAppMessage: "menu:share:appmessage",
    onMenuShareQQ: "menu:share:qq",
    onMenuShareWeibo: "menu:share:weiboApp",
    onMenuShareQZone: "menu:share:QZone",
    previewImage: "imagePreview",
    getLocation: "geoLocation",
    openProductSpecificView: "openProductViewWithPid",
    addCard: "batchAddCard",
    openCard: "batchViewCard",
    chooseWXPay: "getBrandWCPayRequest"
  }, p = function () {
    var b, a = {};
    for (b in o)a[o[b]] = b;
    return a
  }(), q = a.document, r = q.title, s = navigator.userAgent.toLowerCase(), t = navigator.platform.toLowerCase(), u = !(!t.match("mac") && !t.match("win")), v = -1 != s.indexOf("wxdebugger"), w = -1 != s.indexOf("micromessenger"), x = -1 != s.indexOf("android"), y = -1 != s.indexOf("iphone") || -1 != s.indexOf("ipad"), z = function () {
    var a = s.match(/micromessenger\/(\d+\.\d+\.\d+)/) || s.match(/micromessenger\/(\d+\.\d+)/);
    return a ? a[1] : ""
  }(), A = !1, B = !1, C = {
    initStartTime: l(),
    initEndTime: 0,
    preVerifyStartTime: 0,
    preVerifyEndTime: 0
  }, D = {
    version: 1,
    appId: "",
    initTime: 0,
    preVerifyTime: 0,
    networkType: "",
    isPreVerifyOk: 1,
    systemType: y ? 1 : x ? 2 : -1,
    clientVersion: z,
    url: encodeURIComponent(location.href)
  }, E = {}, F = {_completes: []}, G = {state: 0, data: {}}, m(function () {
    C.initEndTime = l()
  }), H = {
    config: function (a) {
      E = a, j("config", a);
      var b = E.check === !1 ? !1 : !0;
      m(function () {
        var a, d, e;
        if (b)c(o.config, {verifyJsApiList: i(E.jsApiList)}, function () {
          F._complete = function (a) {
            C.preVerifyEndTime = l(), G.state = 1, G.data = a
          }, F.success = function () {
            D.isPreVerifyOk = 0
          }, F.fail = function (a) {
            F._fail ? F._fail(a) : G.state = -1
          };
          var a = F._completes;
          return a.push(function () {
            k()
          }), F.complete = function () {
            for (var c = 0, d = a.length; d > c; ++c)a[c]();
            F._completes = []
          }, F
        }()), C.preVerifyStartTime = l(); else {
          for (G.state = 1, a = F._completes, d = 0, e = a.length; e > d; ++d)a[d]();
          F._completes = []
        }
      }), E.beta && n()
    }, ready: function (a) {
      0 != G.state ? a() : (F._completes.push(a), !w && E.debug && a())
    }, error: function (a) {
      "6.0.2" > z || B || (B = !0, -1 == G.state ? a(G.data) : F._fail = a)
    }, checkJsApi: function (a) {
      var b = function (a) {
        var c, d, b = a.checkResult;
        for (c in b)d = p[c], d && (b[d] = b[c], delete b[c]);
        return a
      };
      c("checkJsApi", {jsApiList: i(a.jsApiList)}, function () {
        return a._complete = function (a) {
          if (x) {
            var c = a.checkResult;
            c && (a.checkResult = JSON.parse(c))
          }
          a = b(a)
        }, a
      }())
    }, onMenuShareTimeline: function (a) {
      d(o.onMenuShareTimeline, {
        complete: function () {
          c("shareTimeline", {
            title: a.title || r,
            desc: a.title || r,
            img_url: a.imgUrl || "",
            link: a.link || location.href,
            type: a.type || "link",
            data_url: a.dataUrl || ""
          }, a)
        }
      }, a)
    }, onMenuShareAppMessage: function (a) {
      console.log(a);
      d(o.onMenuShareAppMessage, {
        complete: function () {
          console.log({
            title: a.title || r,
            desc: a.desc || "",
            link: a.link || location.href,
            img_url: a.imgUrl || "",
            type: a.type || "link",
            data_url: a.dataUrl || ""
          });
          c("sendAppMessage", {
            title: a.title || r,
            desc: a.desc || "",
            link: a.link || location.href,
            img_url: a.imgUrl || "",
            type: a.type || "link",
            data_url: a.dataUrl || ""
          }, a)
        }
      }, a)
    }, onMenuShareQQ: function (a) {
      d(o.onMenuShareQQ, {
        complete: function () {
          c("shareQQ", {
            title: a.title || r,
            desc: a.desc || "",
            img_url: a.imgUrl || "",
            link: a.link || location.href
          }, a)
        }
      }, a)
    }, onMenuShareWeibo: function (a) {
      d(o.onMenuShareWeibo, {
        complete: function () {
          c("shareWeiboApp", {
            title: a.title || r,
            desc: a.desc || "",
            img_url: a.imgUrl || "",
            link: a.link || location.href
          }, a)
        }
      }, a)
    }, onMenuShareQZone: function (a) {
      d(o.onMenuShareQZone, {
        complete: function () {
          c("shareQZone", {
            title: a.title || r,
            desc: a.desc || "",
            img_url: a.imgUrl || "",
            link: a.link || location.href
          }, a)
        }
      }, a)
    }, startRecord: function (a) {
      c("startRecord", {}, a)
    }, stopRecord: function (a) {
      c("stopRecord", {}, a)
    }, onVoiceRecordEnd: function (a) {
      d("onVoiceRecordEnd", a)
    }, playVoice: function (a) {
      c("playVoice", {localId: a.localId}, a)
    }, pauseVoice: function (a) {
      c("pauseVoice", {localId: a.localId}, a)
    }, stopVoice: function (a) {
      c("stopVoice", {localId: a.localId}, a)
    }, onVoicePlayEnd: function (a) {
      d("onVoicePlayEnd", a)
    }, uploadVoice: function (a) {
      c("uploadVoice", {localId: a.localId, isShowProgressTips: 0 == a.isShowProgressTips ? 0 : 1}, a)
    }, downloadVoice: function (a) {
      c("downloadVoice", {serverId: a.serverId, isShowProgressTips: 0 == a.isShowProgressTips ? 0 : 1}, a)
    }, translateVoice: function (a) {
      c("translateVoice", {localId: a.localId, isShowProgressTips: 0 == a.isShowProgressTips ? 0 : 1}, a)
    }, chooseImage: function (a) {
      c("chooseImage", {
        scene: "1|2",
        count: a.count || 9,
        sizeType: a.sizeType || ["original", "compressed"],
        sourceType: a.sourceType || ["album", "camera"]
      }, function () {
        return a._complete = function (a) {
          if (x) {
            var b = a.localIds;
            b && (a.localIds = JSON.parse(b))
          }
        }, a
      }())
    }, previewImage: function (a) {
      c(o.previewImage, {current: a.current, urls: a.urls}, a)
    }, uploadImage: function (a) {
      c("uploadImage", {localId: a.localId, isShowProgressTips: 0 == a.isShowProgressTips ? 0 : 1}, a)
    }, downloadImage: function (a) {
      c("downloadImage", {serverId: a.serverId, isShowProgressTips: 0 == a.isShowProgressTips ? 0 : 1}, a)
    }, getNetworkType: function (a) {
      var b = function (a) {
        var c, d, e, b = a.errMsg;
        if (a.errMsg = "getNetworkType:ok", c = a.subtype, delete a.subtype, c)a.networkType = c; else switch (d = b.indexOf(":"), e = b.substring(d + 1)) {
          case"wifi":
          case"edge":
          case"wwan":
            a.networkType = e;
            break;
          default:
            a.errMsg = "getNetworkType:fail"
        }
        return a
      };
      c("getNetworkType", {}, function () {
        return a._complete = function (a) {
          a = b(a)
        }, a
      }())
    }, openLocation: function (a) {
      c("openLocation", {
        latitude: a.latitude,
        longitude: a.longitude,
        name: a.name || "",
        address: a.address || "",
        scale: a.scale || 28,
        infoUrl: a.infoUrl || ""
      }, a)
    }, getLocation: function (a) {
      a = a || {}, c(o.getLocation, {type: a.type || "wgs84"}, function () {
        return a._complete = function (a) {
          delete a.type
        }, a
      }())
    }, hideOptionMenu: function (a) {
      c("hideOptionMenu", {}, a)
    }, showOptionMenu: function (a) {
      c("showOptionMenu", {}, a)
    }, closeWindow: function (a) {
      a = a || {}, c("closeWindow", {}, a)
    }, hideMenuItems: function (a) {
      c("hideMenuItems", {menuList: a.menuList}, a)
    }, showMenuItems: function (a) {
      c("showMenuItems", {menuList: a.menuList}, a)
    }, hideAllNonBaseMenuItem: function (a) {
      c("hideAllNonBaseMenuItem", {}, a)
    }, showAllNonBaseMenuItem: function (a) {
      c("showAllNonBaseMenuItem", {}, a)
    }, scanQRCode: function (a) {
      a = a || {}, c("scanQRCode", {
        needResult: a.needResult || 0,
        scanType: a.scanType || ["qrCode", "barCode"]
      }, function () {
        return a._complete = function (a) {
          var b, c;
          y && (b = a.resultStr, b && (c = JSON.parse(b), a.resultStr = c && c.scan_code && c.scan_code.scan_result))
        }, a
      }())
    }, openProductSpecificView: function (a) {
      c(o.openProductSpecificView, {pid: a.productId, view_type: a.viewType || 0, ext_info: a.extInfo}, a)
    }, addCard: function (a) {
      var e, f, g, h, b = a.cardList, d = [];
      for (e = 0, f = b.length; f > e; ++e)g = b[e], h = {card_id: g.cardId, card_ext: g.cardExt}, d.push(h);
      c(o.addCard, {card_list: d}, function () {
        return a._complete = function (a) {
          var c, d, e, b = a.card_list;
          if (b) {
            for (b = JSON.parse(b), c = 0, d = b.length; d > c; ++c)e = b[c], e.cardId = e.card_id, e.cardExt = e.card_ext, e.isSuccess = e.is_succ ? !0 : !1, delete e.card_id, delete e.card_ext, delete e.is_succ;
            a.cardList = b, delete a.card_list
          }
        }, a
      }())
    }, chooseCard: function (a) {
      c("chooseCard", {
        app_id: E.appId,
        location_id: a.shopId || "",
        sign_type: a.signType || "SHA1",
        card_id: a.cardId || "",
        card_type: a.cardType || "",
        card_sign: a.cardSign,
        time_stamp: a.timestamp + "",
        nonce_str: a.nonceStr
      }, function () {
        return a._complete = function (a) {
          a.cardList = a.choose_card_info, delete a.choose_card_info
        }, a
      }())
    }, openCard: function (a) {
      var e, f, g, h, b = a.cardList, d = [];
      for (e = 0, f = b.length; f > e; ++e)g = b[e], h = {card_id: g.cardId, code: g.code}, d.push(h);
      c(o.openCard, {card_list: d}, a)
    }, chooseWXPay: function (a) {
      c(o.chooseWXPay, f(a), a)
    }
  }, b && (a.wx = a.jWeixin = H), H
});
/**
 * @fileoverview
 * - Using the 'QRCode for Javascript library'
 * - Fixed dataset of 'QRCode for Javascript library' for support full-spec.
 * - this library has no dependencies.
 *
 * @author davidshimjs
 * @see <a href="http://www.d-project.com/" target="_blank">http://www.d-project.com/</a>
 * @see <a href="http://jeromeetienne.github.com/jquery-qrcode/" target="_blank">http://jeromeetienne.github.com/jquery-qrcode/</a>
 */
var QRCode;

(function () {
  //---------------------------------------------------------------------
  // QRCode for JavaScript
  //
  // Copyright (c) 2009 Kazuhiko Arase
  //
  // URL: http://www.d-project.com/
  //
  // Licensed under the MIT license:
  //   http://www.opensource.org/licenses/mit-license.php
  //
  // The word "QR Code" is registered trademark of
  // DENSO WAVE INCORPORATED
  //   http://www.denso-wave.com/qrcode/faqpatent-e.html
  //
  //---------------------------------------------------------------------
  function QR8bitByte(data) {
    this.mode = QRMode.MODE_8BIT_BYTE;
    this.data = data;
    this.parsedData = [];

    // Added to support UTF-8 Characters
    for (var i = 0, l = this.data.length; i < l; i++) {
      var byteArray = [];
      var code = this.data.charCodeAt(i);

      if (code > 0x10000) {
        byteArray[0] = 0xF0 | ((code & 0x1C0000) >>> 18);
        byteArray[1] = 0x80 | ((code & 0x3F000) >>> 12);
        byteArray[2] = 0x80 | ((code & 0xFC0) >>> 6);
        byteArray[3] = 0x80 | (code & 0x3F);
      } else if (code > 0x800) {
        byteArray[0] = 0xE0 | ((code & 0xF000) >>> 12);
        byteArray[1] = 0x80 | ((code & 0xFC0) >>> 6);
        byteArray[2] = 0x80 | (code & 0x3F);
      } else if (code > 0x80) {
        byteArray[0] = 0xC0 | ((code & 0x7C0) >>> 6);
        byteArray[1] = 0x80 | (code & 0x3F);
      } else {
        byteArray[0] = code;
      }

      this.parsedData.push(byteArray);
    }

    this.parsedData = Array.prototype.concat.apply([], this.parsedData);

    if (this.parsedData.length != this.data.length) {
      this.parsedData.unshift(191);
      this.parsedData.unshift(187);
      this.parsedData.unshift(239);
    }
  }

  QR8bitByte.prototype = {
    getLength: function (buffer) {
      return this.parsedData.length;
    },
    write: function (buffer) {
      for (var i = 0, l = this.parsedData.length; i < l; i++) {
        buffer.put(this.parsedData[i], 8);
      }
    }
  };

  function QRCodeModel(typeNumber, errorCorrectLevel) {
    this.typeNumber = typeNumber;
    this.errorCorrectLevel = errorCorrectLevel;
    this.modules = null;
    this.moduleCount = 0;
    this.dataCache = null;
    this.dataList = [];
  }

  QRCodeModel.prototype = {
    addData: function (data) {
      var newData = new QR8bitByte(data);
      this.dataList.push(newData);
      this.dataCache = null;
    }, isDark: function (row, col) {
      if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <= col) {
        throw new Error(row + "," + col);
      }
      return this.modules[row][col];
    }, getModuleCount: function () {
      return this.moduleCount;
    }, make: function () {
      this.makeImpl(false, this.getBestMaskPattern());
    }, makeImpl: function (test, maskPattern) {
      this.moduleCount = this.typeNumber * 4 + 17;
      this.modules = new Array(this.moduleCount);
      for (var row = 0; row < this.moduleCount; row++) {
        this.modules[row] = new Array(this.moduleCount);
        for (var col = 0; col < this.moduleCount; col++) {
          this.modules[row][col] = null;
        }
      }
      this.setupPositionProbePattern(0, 0);
      this.setupPositionProbePattern(this.moduleCount - 7, 0);
      this.setupPositionProbePattern(0, this.moduleCount - 7);
      this.setupPositionAdjustPattern();
      this.setupTimingPattern();
      this.setupTypeInfo(test, maskPattern);
      if (this.typeNumber >= 7) {
        this.setupTypeNumber(test);
      }
      if (this.dataCache == null) {
        this.dataCache = QRCodeModel.createData(this.typeNumber, this.errorCorrectLevel, this.dataList);
      }
      this.mapData(this.dataCache, maskPattern);
    }, setupPositionProbePattern: function (row, col) {
      for (var r = -1; r <= 7; r++) {
        if (row + r <= -1 || this.moduleCount <= row + r)continue;
        for (var c = -1; c <= 7; c++) {
          if (col + c <= -1 || this.moduleCount <= col + c)continue;
          if ((0 <= r && r <= 6 && (c == 0 || c == 6)) || (0 <= c && c <= 6 && (r == 0 || r == 6)) || (2 <= r && r <= 4 && 2 <= c && c <= 4)) {
            this.modules[row + r][col + c] = true;
          } else {
            this.modules[row + r][col + c] = false;
          }
        }
      }
    }, getBestMaskPattern: function () {
      var minLostPoint = 0;
      var pattern = 0;
      for (var i = 0; i < 8; i++) {
        this.makeImpl(true, i);
        var lostPoint = QRUtil.getLostPoint(this);
        if (i == 0 || minLostPoint > lostPoint) {
          minLostPoint = lostPoint;
          pattern = i;
        }
      }
      return pattern;
    }, createMovieClip: function (target_mc, instance_name, depth) {
      var qr_mc = target_mc.createEmptyMovieClip(instance_name, depth);
      var cs = 1;
      this.make();
      for (var row = 0; row < this.modules.length; row++) {
        var y = row * cs;
        for (var col = 0; col < this.modules[row].length; col++) {
          var x = col * cs;
          var dark = this.modules[row][col];
          if (dark) {
            qr_mc.beginFill(0, 100);
            qr_mc.moveTo(x, y);
            qr_mc.lineTo(x + cs, y);
            qr_mc.lineTo(x + cs, y + cs);
            qr_mc.lineTo(x, y + cs);
            qr_mc.endFill();
          }
        }
      }
      return qr_mc;
    }, setupTimingPattern: function () {
      for (var r = 8; r < this.moduleCount - 8; r++) {
        if (this.modules[r][6] != null) {
          continue;
        }
        this.modules[r][6] = (r % 2 == 0);
      }
      for (var c = 8; c < this.moduleCount - 8; c++) {
        if (this.modules[6][c] != null) {
          continue;
        }
        this.modules[6][c] = (c % 2 == 0);
      }
    }, setupPositionAdjustPattern: function () {
      var pos = QRUtil.getPatternPosition(this.typeNumber);
      for (var i = 0; i < pos.length; i++) {
        for (var j = 0; j < pos.length; j++) {
          var row = pos[i];
          var col = pos[j];
          if (this.modules[row][col] != null) {
            continue;
          }
          for (var r = -2; r <= 2; r++) {
            for (var c = -2; c <= 2; c++) {
              if (r == -2 || r == 2 || c == -2 || c == 2 || (r == 0 && c == 0)) {
                this.modules[row + r][col + c] = true;
              } else {
                this.modules[row + r][col + c] = false;
              }
            }
          }
        }
      }
    }, setupTypeNumber: function (test) {
      var bits = QRUtil.getBCHTypeNumber(this.typeNumber);
      for (var i = 0; i < 18; i++) {
        var mod = (!test && ((bits >> i) & 1) == 1);
        this.modules[Math.floor(i / 3)][i % 3 + this.moduleCount - 8 - 3] = mod;
      }
      for (var i = 0; i < 18; i++) {
        var mod = (!test && ((bits >> i) & 1) == 1);
        this.modules[i % 3 + this.moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
      }
    }, setupTypeInfo: function (test, maskPattern) {
      var data = (this.errorCorrectLevel << 3) | maskPattern;
      var bits = QRUtil.getBCHTypeInfo(data);
      for (var i = 0; i < 15; i++) {
        var mod = (!test && ((bits >> i) & 1) == 1);
        if (i < 6) {
          this.modules[i][8] = mod;
        } else if (i < 8) {
          this.modules[i + 1][8] = mod;
        } else {
          this.modules[this.moduleCount - 15 + i][8] = mod;
        }
      }
      for (var i = 0; i < 15; i++) {
        var mod = (!test && ((bits >> i) & 1) == 1);
        if (i < 8) {
          this.modules[8][this.moduleCount - i - 1] = mod;
        } else if (i < 9) {
          this.modules[8][15 - i - 1 + 1] = mod;
        } else {
          this.modules[8][15 - i - 1] = mod;
        }
      }
      this.modules[this.moduleCount - 8][8] = (!test);
    }, mapData: function (data, maskPattern) {
      var inc = -1;
      var row = this.moduleCount - 1;
      var bitIndex = 7;
      var byteIndex = 0;
      for (var col = this.moduleCount - 1; col > 0; col -= 2) {
        if (col == 6)col--;
        while (true) {
          for (var c = 0; c < 2; c++) {
            if (this.modules[row][col - c] == null) {
              var dark = false;
              if (byteIndex < data.length) {
                dark = (((data[byteIndex] >>> bitIndex) & 1) == 1);
              }
              var mask = QRUtil.getMask(maskPattern, row, col - c);
              if (mask) {
                dark = !dark;
              }
              this.modules[row][col - c] = dark;
              bitIndex--;
              if (bitIndex == -1) {
                byteIndex++;
                bitIndex = 7;
              }
            }
          }
          row += inc;
          if (row < 0 || this.moduleCount <= row) {
            row -= inc;
            inc = -inc;
            break;
          }
        }
      }
    }
  };
  QRCodeModel.PAD0 = 0xEC;
  QRCodeModel.PAD1 = 0x11;
  QRCodeModel.createData = function (typeNumber, errorCorrectLevel, dataList) {
    var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectLevel);
    var buffer = new QRBitBuffer();
    for (var i = 0; i < dataList.length; i++) {
      var data = dataList[i];
      buffer.put(data.mode, 4);
      buffer.put(data.getLength(), QRUtil.getLengthInBits(data.mode, typeNumber));
      data.write(buffer);
    }
    var totalDataCount = 0;
    for (var i = 0; i < rsBlocks.length; i++) {
      totalDataCount += rsBlocks[i].dataCount;
    }
    if (buffer.getLengthInBits() > totalDataCount * 8) {
      throw new Error("code length overflow. ("
        + buffer.getLengthInBits()
        + ">"
        + totalDataCount * 8
        + ")");
    }
    if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
      buffer.put(0, 4);
    }
    while (buffer.getLengthInBits() % 8 != 0) {
      buffer.putBit(false);
    }
    while (true) {
      if (buffer.getLengthInBits() >= totalDataCount * 8) {
        break;
      }
      buffer.put(QRCodeModel.PAD0, 8);
      if (buffer.getLengthInBits() >= totalDataCount * 8) {
        break;
      }
      buffer.put(QRCodeModel.PAD1, 8);
    }
    return QRCodeModel.createBytes(buffer, rsBlocks);
  };
  QRCodeModel.createBytes = function (buffer, rsBlocks) {
    var offset = 0;
    var maxDcCount = 0;
    var maxEcCount = 0;
    var dcdata = new Array(rsBlocks.length);
    var ecdata = new Array(rsBlocks.length);
    for (var r = 0; r < rsBlocks.length; r++) {
      var dcCount = rsBlocks[r].dataCount;
      var ecCount = rsBlocks[r].totalCount - dcCount;
      maxDcCount = Math.max(maxDcCount, dcCount);
      maxEcCount = Math.max(maxEcCount, ecCount);
      dcdata[r] = new Array(dcCount);
      for (var i = 0; i < dcdata[r].length; i++) {
        dcdata[r][i] = 0xff & buffer.buffer[i + offset];
      }
      offset += dcCount;
      var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
      var rawPoly = new QRPolynomial(dcdata[r], rsPoly.getLength() - 1);
      var modPoly = rawPoly.mod(rsPoly);
      ecdata[r] = new Array(rsPoly.getLength() - 1);
      for (var i = 0; i < ecdata[r].length; i++) {
        var modIndex = i + modPoly.getLength() - ecdata[r].length;
        ecdata[r][i] = (modIndex >= 0) ? modPoly.get(modIndex) : 0;
      }
    }
    var totalCodeCount = 0;
    for (var i = 0; i < rsBlocks.length; i++) {
      totalCodeCount += rsBlocks[i].totalCount;
    }
    var data = new Array(totalCodeCount);
    var index = 0;
    for (var i = 0; i < maxDcCount; i++) {
      for (var r = 0; r < rsBlocks.length; r++) {
        if (i < dcdata[r].length) {
          data[index++] = dcdata[r][i];
        }
      }
    }
    for (var i = 0; i < maxEcCount; i++) {
      for (var r = 0; r < rsBlocks.length; r++) {
        if (i < ecdata[r].length) {
          data[index++] = ecdata[r][i];
        }
      }
    }
    return data;
  };
  var QRMode = {MODE_NUMBER: 1 << 0, MODE_ALPHA_NUM: 1 << 1, MODE_8BIT_BYTE: 1 << 2, MODE_KANJI: 1 << 3};
  var QRErrorCorrectLevel = {L: 1, M: 0, Q: 3, H: 2};
  var QRMaskPattern = {
    PATTERN000: 0,
    PATTERN001: 1,
    PATTERN010: 2,
    PATTERN011: 3,
    PATTERN100: 4,
    PATTERN101: 5,
    PATTERN110: 6,
    PATTERN111: 7
  };
  var QRUtil = {
    PATTERN_POSITION_TABLE: [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54], [6, 32, 58], [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78], [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90], [6, 28, 50, 72, 94], [6, 26, 50, 74, 98], [6, 30, 54, 78, 102], [6, 28, 54, 80, 106], [6, 32, 58, 84, 110], [6, 30, 58, 86, 114], [6, 34, 62, 90, 118], [6, 26, 50, 74, 98, 122], [6, 30, 54, 78, 102, 126], [6, 26, 52, 78, 104, 130], [6, 30, 56, 82, 108, 134], [6, 34, 60, 86, 112, 138], [6, 30, 58, 86, 114, 142], [6, 34, 62, 90, 118, 146], [6, 30, 54, 78, 102, 126, 150], [6, 24, 50, 76, 102, 128, 154], [6, 28, 54, 80, 106, 132, 158], [6, 32, 58, 84, 110, 136, 162], [6, 26, 54, 82, 110, 138, 166], [6, 30, 58, 86, 114, 142, 170]],
    G15: (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0),
    G18: (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0),
    G15_MASK: (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1),
    getBCHTypeInfo: function (data) {
      var d = data << 10;
      while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15) >= 0) {
        d ^= (QRUtil.G15 << (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15)));
      }
      return ((data << 10) | d) ^ QRUtil.G15_MASK;
    },
    getBCHTypeNumber: function (data) {
      var d = data << 12;
      while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18) >= 0) {
        d ^= (QRUtil.G18 << (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18)));
      }
      return (data << 12) | d;
    },
    getBCHDigit: function (data) {
      var digit = 0;
      while (data != 0) {
        digit++;
        data >>>= 1;
      }
      return digit;
    },
    getPatternPosition: function (typeNumber) {
      return QRUtil.PATTERN_POSITION_TABLE[typeNumber - 1];
    },
    getMask: function (maskPattern, i, j) {
      switch (maskPattern) {
        case QRMaskPattern.PATTERN000:
          return (i + j) % 2 == 0;
        case QRMaskPattern.PATTERN001:
          return i % 2 == 0;
        case QRMaskPattern.PATTERN010:
          return j % 3 == 0;
        case QRMaskPattern.PATTERN011:
          return (i + j) % 3 == 0;
        case QRMaskPattern.PATTERN100:
          return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 == 0;
        case QRMaskPattern.PATTERN101:
          return (i * j) % 2 + (i * j) % 3 == 0;
        case QRMaskPattern.PATTERN110:
          return ((i * j) % 2 + (i * j) % 3) % 2 == 0;
        case QRMaskPattern.PATTERN111:
          return ((i * j) % 3 + (i + j) % 2) % 2 == 0;
        default:
          throw new Error("bad maskPattern:" + maskPattern);
      }
    },
    getErrorCorrectPolynomial: function (errorCorrectLength) {
      var a = new QRPolynomial([1], 0);
      for (var i = 0; i < errorCorrectLength; i++) {
        a = a.multiply(new QRPolynomial([1, QRMath.gexp(i)], 0));
      }
      return a;
    },
    getLengthInBits: function (mode, type) {
      if (1 <= type && type < 10) {
        switch (mode) {
          case QRMode.MODE_NUMBER:
            return 10;
          case QRMode.MODE_ALPHA_NUM:
            return 9;
          case QRMode.MODE_8BIT_BYTE:
            return 8;
          case QRMode.MODE_KANJI:
            return 8;
          default:
            throw new Error("mode:" + mode);
        }
      } else if (type < 27) {
        switch (mode) {
          case QRMode.MODE_NUMBER:
            return 12;
          case QRMode.MODE_ALPHA_NUM:
            return 11;
          case QRMode.MODE_8BIT_BYTE:
            return 16;
          case QRMode.MODE_KANJI:
            return 10;
          default:
            throw new Error("mode:" + mode);
        }
      } else if (type < 41) {
        switch (mode) {
          case QRMode.MODE_NUMBER:
            return 14;
          case QRMode.MODE_ALPHA_NUM:
            return 13;
          case QRMode.MODE_8BIT_BYTE:
            return 16;
          case QRMode.MODE_KANJI:
            return 12;
          default:
            throw new Error("mode:" + mode);
        }
      } else {
        throw new Error("type:" + type);
      }
    },
    getLostPoint: function (qrCode) {
      var moduleCount = qrCode.getModuleCount();
      var lostPoint = 0;
      for (var row = 0; row < moduleCount; row++) {
        for (var col = 0; col < moduleCount; col++) {
          var sameCount = 0;
          var dark = qrCode.isDark(row, col);
          for (var r = -1; r <= 1; r++) {
            if (row + r < 0 || moduleCount <= row + r) {
              continue;
            }
            for (var c = -1; c <= 1; c++) {
              if (col + c < 0 || moduleCount <= col + c) {
                continue;
              }
              if (r == 0 && c == 0) {
                continue;
              }
              if (dark == qrCode.isDark(row + r, col + c)) {
                sameCount++;
              }
            }
          }
          if (sameCount > 5) {
            lostPoint += (3 + sameCount - 5);
          }
        }
      }
      for (var row = 0; row < moduleCount - 1; row++) {
        for (var col = 0; col < moduleCount - 1; col++) {
          var count = 0;
          if (qrCode.isDark(row, col))count++;
          if (qrCode.isDark(row + 1, col))count++;
          if (qrCode.isDark(row, col + 1))count++;
          if (qrCode.isDark(row + 1, col + 1))count++;
          if (count == 0 || count == 4) {
            lostPoint += 3;
          }
        }
      }
      for (var row = 0; row < moduleCount; row++) {
        for (var col = 0; col < moduleCount - 6; col++) {
          if (qrCode.isDark(row, col) && !qrCode.isDark(row, col + 1) && qrCode.isDark(row, col + 2) && qrCode.isDark(row, col + 3) && qrCode.isDark(row, col + 4) && !qrCode.isDark(row, col + 5) && qrCode.isDark(row, col + 6)) {
            lostPoint += 40;
          }
        }
      }
      for (var col = 0; col < moduleCount; col++) {
        for (var row = 0; row < moduleCount - 6; row++) {
          if (qrCode.isDark(row, col) && !qrCode.isDark(row + 1, col) && qrCode.isDark(row + 2, col) && qrCode.isDark(row + 3, col) && qrCode.isDark(row + 4, col) && !qrCode.isDark(row + 5, col) && qrCode.isDark(row + 6, col)) {
            lostPoint += 40;
          }
        }
      }
      var darkCount = 0;
      for (var col = 0; col < moduleCount; col++) {
        for (var row = 0; row < moduleCount; row++) {
          if (qrCode.isDark(row, col)) {
            darkCount++;
          }
        }
      }
      var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
      lostPoint += ratio * 10;
      return lostPoint;
    }
  };
  var QRMath = {
    glog: function (n) {
      if (n < 1) {
        throw new Error("glog(" + n + ")");
      }
      return QRMath.LOG_TABLE[n];
    }, gexp: function (n) {
      while (n < 0) {
        n += 255;
      }
      while (n >= 256) {
        n -= 255;
      }
      return QRMath.EXP_TABLE[n];
    }, EXP_TABLE: new Array(256), LOG_TABLE: new Array(256)
  };
  for (var i = 0; i < 8; i++) {
    QRMath.EXP_TABLE[i] = 1 << i;
  }
  for (var i = 8; i < 256; i++) {
    QRMath.EXP_TABLE[i] = QRMath.EXP_TABLE[i - 4] ^ QRMath.EXP_TABLE[i - 5] ^ QRMath.EXP_TABLE[i - 6] ^ QRMath.EXP_TABLE[i - 8];
  }
  for (var i = 0; i < 255; i++) {
    QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]] = i;
  }
  function QRPolynomial(num, shift) {
    if (num.length == undefined) {
      throw new Error(num.length + "/" + shift);
    }
    var offset = 0;
    while (offset < num.length && num[offset] == 0) {
      offset++;
    }
    this.num = new Array(num.length - offset + shift);
    for (var i = 0; i < num.length - offset; i++) {
      this.num[i] = num[i + offset];
    }
  }

  QRPolynomial.prototype = {
    get: function (index) {
      return this.num[index];
    }, getLength: function () {
      return this.num.length;
    }, multiply: function (e) {
      var num = new Array(this.getLength() + e.getLength() - 1);
      for (var i = 0; i < this.getLength(); i++) {
        for (var j = 0; j < e.getLength(); j++) {
          num[i + j] ^= QRMath.gexp(QRMath.glog(this.get(i)) + QRMath.glog(e.get(j)));
        }
      }
      return new QRPolynomial(num, 0);
    }, mod: function (e) {
      if (this.getLength() - e.getLength() < 0) {
        return this;
      }
      var ratio = QRMath.glog(this.get(0)) - QRMath.glog(e.get(0));
      var num = new Array(this.getLength());
      for (var i = 0; i < this.getLength(); i++) {
        num[i] = this.get(i);
      }
      for (var i = 0; i < e.getLength(); i++) {
        num[i] ^= QRMath.gexp(QRMath.glog(e.get(i)) + ratio);
      }
      return new QRPolynomial(num, 0).mod(e);
    }
  };
  function QRRSBlock(totalCount, dataCount) {
    this.totalCount = totalCount;
    this.dataCount = dataCount;
  }

  QRRSBlock.RS_BLOCK_TABLE = [[1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9], [1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16], [1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13], [1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9], [1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12], [2, 86, 68], [4, 43, 27], [4, 43, 19], [4, 43, 15], [2, 98, 78], [4, 49, 31], [2, 32, 14, 4, 33, 15], [4, 39, 13, 1, 40, 14], [2, 121, 97], [2, 60, 38, 2, 61, 39], [4, 40, 18, 2, 41, 19], [4, 40, 14, 2, 41, 15], [2, 146, 116], [3, 58, 36, 2, 59, 37], [4, 36, 16, 4, 37, 17], [4, 36, 12, 4, 37, 13], [2, 86, 68, 2, 87, 69], [4, 69, 43, 1, 70, 44], [6, 43, 19, 2, 44, 20], [6, 43, 15, 2, 44, 16], [4, 101, 81], [1, 80, 50, 4, 81, 51], [4, 50, 22, 4, 51, 23], [3, 36, 12, 8, 37, 13], [2, 116, 92, 2, 117, 93], [6, 58, 36, 2, 59, 37], [4, 46, 20, 6, 47, 21], [7, 42, 14, 4, 43, 15], [4, 133, 107], [8, 59, 37, 1, 60, 38], [8, 44, 20, 4, 45, 21], [12, 33, 11, 4, 34, 12], [3, 145, 115, 1, 146, 116], [4, 64, 40, 5, 65, 41], [11, 36, 16, 5, 37, 17], [11, 36, 12, 5, 37, 13], [5, 109, 87, 1, 110, 88], [5, 65, 41, 5, 66, 42], [5, 54, 24, 7, 55, 25], [11, 36, 12], [5, 122, 98, 1, 123, 99], [7, 73, 45, 3, 74, 46], [15, 43, 19, 2, 44, 20], [3, 45, 15, 13, 46, 16], [1, 135, 107, 5, 136, 108], [10, 74, 46, 1, 75, 47], [1, 50, 22, 15, 51, 23], [2, 42, 14, 17, 43, 15], [5, 150, 120, 1, 151, 121], [9, 69, 43, 4, 70, 44], [17, 50, 22, 1, 51, 23], [2, 42, 14, 19, 43, 15], [3, 141, 113, 4, 142, 114], [3, 70, 44, 11, 71, 45], [17, 47, 21, 4, 48, 22], [9, 39, 13, 16, 40, 14], [3, 135, 107, 5, 136, 108], [3, 67, 41, 13, 68, 42], [15, 54, 24, 5, 55, 25], [15, 43, 15, 10, 44, 16], [4, 144, 116, 4, 145, 117], [17, 68, 42], [17, 50, 22, 6, 51, 23], [19, 46, 16, 6, 47, 17], [2, 139, 111, 7, 140, 112], [17, 74, 46], [7, 54, 24, 16, 55, 25], [34, 37, 13], [4, 151, 121, 5, 152, 122], [4, 75, 47, 14, 76, 48], [11, 54, 24, 14, 55, 25], [16, 45, 15, 14, 46, 16], [6, 147, 117, 4, 148, 118], [6, 73, 45, 14, 74, 46], [11, 54, 24, 16, 55, 25], [30, 46, 16, 2, 47, 17], [8, 132, 106, 4, 133, 107], [8, 75, 47, 13, 76, 48], [7, 54, 24, 22, 55, 25], [22, 45, 15, 13, 46, 16], [10, 142, 114, 2, 143, 115], [19, 74, 46, 4, 75, 47], [28, 50, 22, 6, 51, 23], [33, 46, 16, 4, 47, 17], [8, 152, 122, 4, 153, 123], [22, 73, 45, 3, 74, 46], [8, 53, 23, 26, 54, 24], [12, 45, 15, 28, 46, 16], [3, 147, 117, 10, 148, 118], [3, 73, 45, 23, 74, 46], [4, 54, 24, 31, 55, 25], [11, 45, 15, 31, 46, 16], [7, 146, 116, 7, 147, 117], [21, 73, 45, 7, 74, 46], [1, 53, 23, 37, 54, 24], [19, 45, 15, 26, 46, 16], [5, 145, 115, 10, 146, 116], [19, 75, 47, 10, 76, 48], [15, 54, 24, 25, 55, 25], [23, 45, 15, 25, 46, 16], [13, 145, 115, 3, 146, 116], [2, 74, 46, 29, 75, 47], [42, 54, 24, 1, 55, 25], [23, 45, 15, 28, 46, 16], [17, 145, 115], [10, 74, 46, 23, 75, 47], [10, 54, 24, 35, 55, 25], [19, 45, 15, 35, 46, 16], [17, 145, 115, 1, 146, 116], [14, 74, 46, 21, 75, 47], [29, 54, 24, 19, 55, 25], [11, 45, 15, 46, 46, 16], [13, 145, 115, 6, 146, 116], [14, 74, 46, 23, 75, 47], [44, 54, 24, 7, 55, 25], [59, 46, 16, 1, 47, 17], [12, 151, 121, 7, 152, 122], [12, 75, 47, 26, 76, 48], [39, 54, 24, 14, 55, 25], [22, 45, 15, 41, 46, 16], [6, 151, 121, 14, 152, 122], [6, 75, 47, 34, 76, 48], [46, 54, 24, 10, 55, 25], [2, 45, 15, 64, 46, 16], [17, 152, 122, 4, 153, 123], [29, 74, 46, 14, 75, 47], [49, 54, 24, 10, 55, 25], [24, 45, 15, 46, 46, 16], [4, 152, 122, 18, 153, 123], [13, 74, 46, 32, 75, 47], [48, 54, 24, 14, 55, 25], [42, 45, 15, 32, 46, 16], [20, 147, 117, 4, 148, 118], [40, 75, 47, 7, 76, 48], [43, 54, 24, 22, 55, 25], [10, 45, 15, 67, 46, 16], [19, 148, 118, 6, 149, 119], [18, 75, 47, 31, 76, 48], [34, 54, 24, 34, 55, 25], [20, 45, 15, 61, 46, 16]];
  QRRSBlock.getRSBlocks = function (typeNumber, errorCorrectLevel) {
    var rsBlock = QRRSBlock.getRsBlockTable(typeNumber, errorCorrectLevel);
    if (rsBlock == undefined) {
      throw new Error("bad rs block @ typeNumber:" + typeNumber + "/errorCorrectLevel:" + errorCorrectLevel);
    }
    var length = rsBlock.length / 3;
    var list = [];
    for (var i = 0; i < length; i++) {
      var count = rsBlock[i * 3 + 0];
      var totalCount = rsBlock[i * 3 + 1];
      var dataCount = rsBlock[i * 3 + 2];
      for (var j = 0; j < count; j++) {
        list.push(new QRRSBlock(totalCount, dataCount));
      }
    }
    return list;
  };
  QRRSBlock.getRsBlockTable = function (typeNumber, errorCorrectLevel) {
    switch (errorCorrectLevel) {
      case QRErrorCorrectLevel.L:
        return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
      case QRErrorCorrectLevel.M:
        return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
      case QRErrorCorrectLevel.Q:
        return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
      case QRErrorCorrectLevel.H:
        return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
      default:
        return undefined;
    }
  };
  function QRBitBuffer() {
    this.buffer = [];
    this.length = 0;
  }

  QRBitBuffer.prototype = {
    get: function (index) {
      var bufIndex = Math.floor(index / 8);
      return ((this.buffer[bufIndex] >>> (7 - index % 8)) & 1) == 1;
    }, put: function (num, length) {
      for (var i = 0; i < length; i++) {
        this.putBit(((num >>> (length - i - 1)) & 1) == 1);
      }
    }, getLengthInBits: function () {
      return this.length;
    }, putBit: function (bit) {
      var bufIndex = Math.floor(this.length / 8);
      if (this.buffer.length <= bufIndex) {
        this.buffer.push(0);
      }
      if (bit) {
        this.buffer[bufIndex] |= (0x80 >>> (this.length % 8));
      }
      this.length++;
    }
  };
  var QRCodeLimitLength = [[17, 14, 11, 7], [32, 26, 20, 14], [53, 42, 32, 24], [78, 62, 46, 34], [106, 84, 60, 44], [134, 106, 74, 58], [154, 122, 86, 64], [192, 152, 108, 84], [230, 180, 130, 98], [271, 213, 151, 119], [321, 251, 177, 137], [367, 287, 203, 155], [425, 331, 241, 177], [458, 362, 258, 194], [520, 412, 292, 220], [586, 450, 322, 250], [644, 504, 364, 280], [718, 560, 394, 310], [792, 624, 442, 338], [858, 666, 482, 382], [929, 711, 509, 403], [1003, 779, 565, 439], [1091, 857, 611, 461], [1171, 911, 661, 511], [1273, 997, 715, 535], [1367, 1059, 751, 593], [1465, 1125, 805, 625], [1528, 1190, 868, 658], [1628, 1264, 908, 698], [1732, 1370, 982, 742], [1840, 1452, 1030, 790], [1952, 1538, 1112, 842], [2068, 1628, 1168, 898], [2188, 1722, 1228, 958], [2303, 1809, 1283, 983], [2431, 1911, 1351, 1051], [2563, 1989, 1423, 1093], [2699, 2099, 1499, 1139], [2809, 2213, 1579, 1219], [2953, 2331, 1663, 1273]];

  function _isSupportCanvas() {
    return typeof CanvasRenderingContext2D != "undefined";
  }

  // android 2.x doesn't support Data-URI spec
  function _getAndroid() {
    var android = false;
    var sAgent = navigator.userAgent;

    if (/android/i.test(sAgent)) { // android
      android = true;
      var aMat = sAgent.toString().match(/android ([0-9]\.[0-9])/i);

      if (aMat && aMat[1]) {
        android = parseFloat(aMat[1]);
      }
    }

    return android;
  }

  // Drawing in DOM by using Table tag
  var Drawing = (function () { // Drawing in Canvas
    function _onMakeImage() {
      this._elImage.src = this._elCanvas.toDataURL("image/png");
      this._elImage.style.display = "block";
      this._elCanvas.style.display = "none";
    }

    // Android 2.1 bug workaround
    // http://code.google.com/p/android/issues/detail?id=5141
    if (this._android && this._android <= 2.1) {
      var factor = 1 / window.devicePixelRatio;
      var drawImage = CanvasRenderingContext2D.prototype.drawImage;
      CanvasRenderingContext2D.prototype.drawImage = function (image, sx, sy, sw, sh, dx, dy, dw, dh) {
        if (("nodeName" in image) && /img/i.test(image.nodeName)) {
          for (var i = arguments.length - 1; i >= 1; i--) {
            arguments[i] = arguments[i] * factor;
          }
        } else if (typeof dw == "undefined") {
          arguments[1] *= factor;
          arguments[2] *= factor;
          arguments[3] *= factor;
          arguments[4] *= factor;
        }

        drawImage.apply(this, arguments);
      };
    }

    /**
     * Check whether the user's browser supports Data URI or not
     *
     * @private
     * @param {Function} fSuccess Occurs if it supports Data URI
     * @param {Function} fFail Occurs if it doesn't support Data URI
     */
    function _safeSetDataURI(fSuccess, fFail) {
      var self = this;
      self._fFail = fFail;
      self._fSuccess = fSuccess;

      // Check it just once
      if (self._bSupportDataURI === null) {
        var el = document.createElement("img");
        var fOnError = function () {
          self._bSupportDataURI = false;

          if (self._fFail) {
            self._fFail.call(self);
          }
        };
        var fOnSuccess = function () {
          self._bSupportDataURI = true;

          if (self._fSuccess) {
            self._fSuccess.call(self);
          }
        };

        el.onabort = fOnError;
        el.onerror = fOnError;
        el.onload = fOnSuccess;
        el.src = "data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="; // the Image contains 1px data.
        return;
      } else if (self._bSupportDataURI === true && self._fSuccess) {
        self._fSuccess.call(self);
      } else if (self._bSupportDataURI === false && self._fFail) {
        self._fFail.call(self);
      }
    };

    /**
     * Drawing QRCode by using canvas
     *
     * @constructor
     * @param {HTMLElement} el
     * @param {Object} htOption QRCode Options
     */
    var Drawing = function (el, htOption) {
      this._bIsPainted = false;
      this._android = _getAndroid();

      this._htOption = htOption;
      this._elCanvas = document.createElement("canvas");
      this._elCanvas.width = htOption.width;
      this._elCanvas.height = htOption.height;
      el.appendChild(this._elCanvas);
      this._el = el;
      this._oContext = this._elCanvas.getContext("2d");
      this._bIsPainted = false;
      this._elImage = document.createElement("img");
      this._elImage.alt = "Scan me!";
      this._elImage.style.display = "none";
      this._el.appendChild(this._elImage);
      this._bSupportDataURI = null;
    };

    /**
     * Draw the QRCode
     *
     * @param {QRCode} oQRCode
     */
    Drawing.prototype.draw = function (oQRCode) {
      var _elImage = this._elImage;
      var _oContext = this._oContext;
      var _htOption = this._htOption;

      var nCount = oQRCode.getModuleCount();
      var nWidth = _htOption.width / nCount;
      var nHeight = _htOption.height / nCount;
      var nRoundedWidth = Math.round(nWidth);
      var nRoundedHeight = Math.round(nHeight);

      _elImage.style.display = "none";
      this.clear();

      for (var row = 0; row < nCount; row++) {
        for (var col = 0; col < nCount; col++) {
          var bIsDark = oQRCode.isDark(row, col);
          var nLeft = col * nWidth;
          var nTop = row * nHeight;
          _oContext.strokeStyle = bIsDark ? _htOption.colorDark : _htOption.colorLight;
          _oContext.lineWidth = 1;
          _oContext.fillStyle = bIsDark ? _htOption.colorDark : _htOption.colorLight;
          _oContext.fillRect(nLeft, nTop, nWidth, nHeight);

          // 안티 앨리어싱 방지 처리
          _oContext.strokeRect(
            Math.floor(nLeft) + 0.5,
            Math.floor(nTop) + 0.5,
            nRoundedWidth,
            nRoundedHeight
          );

          _oContext.strokeRect(
            Math.ceil(nLeft) - 0.5,
            Math.ceil(nTop) - 0.5,
            nRoundedWidth,
            nRoundedHeight
          );
        }
      }

      this._bIsPainted = true;
    };

    /**
     * Make the image from Canvas if the browser supports Data URI.
     */
    Drawing.prototype.makeImage = function () {
      if (this._bIsPainted) {
        _safeSetDataURI.call(this, _onMakeImage);
      }
    };

    /**
     * Return whether the QRCode is painted or not
     *
     * @return {Boolean}
     */
    Drawing.prototype.isPainted = function () {
      return this._bIsPainted;
    };

    /**
     * Clear the QRCode
     */
    Drawing.prototype.clear = function () {
      this._oContext.clearRect(0, 0, this._elCanvas.width, this._elCanvas.height);
      this._bIsPainted = false;
    };

    /**
     * @private
     * @param {Number} nNumber
     */
    Drawing.prototype.round = function (nNumber) {
      if (!nNumber) {
        return nNumber;
      }

      return Math.floor(nNumber * 1000) / 1000;
    };

    return Drawing;
  })();

  /**
   * Get the type by string length
   *
   * @private
   * @param {String} sText
   * @param {Number} nCorrectLevel
   * @return {Number} type
   */
  function _getTypeNumber(sText, nCorrectLevel) {
    var nType = 1;
    var length = _getUTF8Length(sText);

    for (var i = 0, len = QRCodeLimitLength.length; i <= len; i++) {
      var nLimit = 0;

      switch (nCorrectLevel) {
        case QRErrorCorrectLevel.L :
          nLimit = QRCodeLimitLength[i][0];
          break;
        case QRErrorCorrectLevel.M :
          nLimit = QRCodeLimitLength[i][1];
          break;
        case QRErrorCorrectLevel.Q :
          nLimit = QRCodeLimitLength[i][2];
          break;
        case QRErrorCorrectLevel.H :
          nLimit = QRCodeLimitLength[i][3];
          break;
      }

      if (length <= nLimit) {
        break;
      } else {
        nType++;
      }
    }

    if (nType > QRCodeLimitLength.length) {
      throw new Error("Too long data");
    }

    return nType;
  }

  function _getUTF8Length(sText) {
    var replacedText = encodeURI(sText).toString().replace(/\%[0-9a-fA-F]{2}/g, 'a');
    return replacedText.length + (replacedText.length != sText ? 3 : 0);
  }

  /**
   * @class QRCode
   * @constructor
   * @example
   * new QRCode(document.getElementById("test"), "http://jindo.dev.naver.com/collie");
   *
   * @example
   * var oQRCode = new QRCode("test", {
	 *    text : "http://naver.com",
	 *    width : 128,
	 *    height : 128
	 * });
   *
   * oQRCode.clear(); // Clear the QRCode.
   * oQRCode.makeCode("http://map.naver.com"); // Re-create the QRCode.
   *
   * @param {HTMLElement|String} el target element or 'id' attribute of element.
   * @param {Object|String} vOption
   * @param {String} vOption.text QRCode link data
   * @param {Number} [vOption.width=256]
   * @param {Number} [vOption.height=256]
   * @param {String} [vOption.colorDark="#000000"]
   * @param {String} [vOption.colorLight="#ffffff"]
   * @param {QRCode.CorrectLevel} [vOption.correctLevel=QRCode.CorrectLevel.H] [L|M|Q|H]
   */
  QRCode = function (el, vOption) {
    this._htOption = {
      width: 256,
      height: 256,
      typeNumber: 4,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRErrorCorrectLevel.H
    };

    if (typeof vOption === 'string') {
      vOption = {
        text: vOption
      };
    }

    // Overwrites options
    if (vOption) {
      for (var i in vOption) {
        this._htOption[i] = vOption[i];
      }
    }

    if (typeof el == "string") {
      el = document.getElementById(el);
    }


    this._android = _getAndroid();
    this._el = el;
    this._oQRCode = null;
    this._oDrawing = new Drawing(this._el, this._htOption);

    if (this._htOption.text) {
      this.makeCode(this._htOption.text);
    }
  };

  /**
   * Make the QRCode
   *
   * @param {String} sText link data
   */
  QRCode.prototype.makeCode = function (sText) {
    this._oQRCode = new QRCodeModel(_getTypeNumber(sText, this._htOption.correctLevel), this._htOption.correctLevel);
    this._oQRCode.addData(sText);
    this._oQRCode.make();
    this._el.title = sText;
    this._oDrawing.draw(this._oQRCode);
    this.makeImage();
  };

  /**
   * Make the Image from Canvas element
   * - It occurs automatically
   * - Android below 3 doesn't support Data-URI spec.
   *
   * @private
   */
  QRCode.prototype.makeImage = function () {
    if (typeof this._oDrawing.makeImage == "function" && (!this._android || this._android >= 3)) {
      this._oDrawing.makeImage();
    }
  };

  /**
   * Clear the QRCode
   */
  QRCode.prototype.clear = function () {
    this._oDrawing.clear();
  };

  /**
   * @name QRCode.CorrectLevel
   */
  QRCode.CorrectLevel = QRErrorCorrectLevel;
})();

(function (win, doc, loc) {
    var version = '2016111104c',//版本标记
        storeFont = 'spa_',
        DEBUG_ENABLE = false,   //=== 是否开启debug模式，开启后，部分$.tipShow才会显示 ===
        supportReplaceState = !!history.replaceState;

    /*
     * index为全部页面外壳 用于进行页面控制，控件定义的顶层页面，也是网站入口
     *
     *   $控制器，返回封装后的选择器结果集
     *       $(selector,all) dom的C3选择器,经过封装更灵活的调用当前hash页面数据
     *           selector    css3表达式
     *           all         全站检索，防止选择器选到其他页面内容，默认false
     *
     *           return      doms数组
     *
     *       $.$             常用变量储存于此
     * */
    addEventListener ? win.addEventListener('load', initAll, false) : win.attachEvent('onload', initAll);

    function initAll() {
        FastClick.attach(document.body);
        /////////////////////////////////////////////////////////////////兼容函数
        try {
            localStorage.setItem('testKey', 'testValue');
            localStorage.getItem('testKey');
            localStorage.removeItem('testKey');

            function ls(key, value, prefix) {//prefix自定义前缀
                key = (prefix || storeFont) + key;
                if (value) localStorage.setItem(key, value);
                else return localStorage.getItem(key);
            }

            function lsc(key, prefix) {
                if (key) localStorage.removeItem((prefix || storeFont) + key);
            }
        } catch (error) {
            ls = function () {
                return false
            };
            lsc = function () {
                return false
            };
        }

        try {
            sessionStorage.setItem('testKey', 'testValue');
            sessionStorage.getItem('testKey');
            sessionStorage.removeItem('testKey');

            function ss(key, value, expires, prefix) {//expires :单位ms
                key = (prefix || storeFont) + key;
                if (value) {
                    sessionStorage.setItem(key, value);
                    if (typeof expires == 'number' && expires > 0) {
                        //如果已经有过期时间，则删除
                        if (sessionStorageExpires[key]) clearTimeout(sessionStorageExpires[key]);
                        //设置过期时间
                        sessionStorageExpires[key] = setTimeout(function () {
                            $.sessionStorageClear(key);
                            delete sessionStorageExpires[key];
                        }, expires);
                    }
                } else {
                    return sessionStorage.getItem(key);
                }
            }

            function ssc(key, prefix) {
                if (key) sessionStorage.removeItem((prefix || storeFont) + key);
            }
        } catch (error) {
            ss = function () {
                return false
            };
            ssc = function () {
                return false
            };
        }

        function cookie(name, value, expireDay) {
            if (!name) return;
            name = storeFont + name;
            var arr, reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)');
            if (value == null) {//获取cookie
                if (arr = doc.cookie.match(reg)) return decodeURIComponent(arr[2]);
                return null;
            } else { //设置cookie
                if (!expireDay) expireDay = 10;
                var exp = new Date();
                exp.setTime(exp.getTime() + expireDay * 24 * 60 * 60 * 1000);
                doc.cookie = name + '=' + encodeURIComponent(value) + ';expires=' + exp.toGMTString();
            }
        }

        function cookieClear(name) {
            name = storeFont + name;
            var arr, reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)'), exp = new Date(), cVal;
            exp.setTime(exp.getTime() - 1);
            if (arr = doc.cookie.match(reg)) cVal = decodeURIComponent(arr[2]);
            if (cVal) doc.cookie = name + '=' + cVal + ';expires=' + exp.toGMTString();
        }

        ///////////////////////////////////////////////////////////选择器
        function SelectorResult(doms) {
            var list = [], length = 0, i;
            if (typeof doms == 'string') {
                try {
                    list = doc.querySelectorAll(doms);
                } catch (e) {
                }
                length = list.length;
                this.selector = doms;
            } else if (typeof doms == 'object') {
                if (doms == win || doms.length == null) doms = [doms];
                list = doms;
                length = list.length;
            }
            this.length = length;
            for (i = 0; i < length; i++) this[i] = list[i];
        }

        SelectorResult.prototype = {
            //////////////////////////////////////////选择
            Each: function (event) {
                var l = this.length, i = 0;
                while (i < l) event(this[i], i++);
                return this;
            },
            Index: function (index) {
                return new SelectorResult(this[index]);
            },
            Last: function () {
                return new SelectorResult(this[this.length - 1]);
            },
            Children: function () {
                var arr = [];
                this.Each(function (item) {
                    var c = item.children, l = c.length, i = 0;
                    while (i < l) arr.push(c[i++]);
                });
                return new SelectorResult(arr);
            },
            Add: function (result) {
                var i = this.length, j = 0, l = i + result.length;
                while (i < l) this[i++] = result[j++];
                this.length = l;
                return this;
            },
            Remove: function (index) {
                var item = this[index], l = this.length - 1, i = index;
                while (i < l) this[i] = this[i++ + 1];
                delete this[l];
                this.length--;
                return new SelectorResult(item);
            },
            //////////////////////////////////////////事件
            /**
             *
             * @param event 事件类型，单个
             * @param fun   执行事件
             * @param useCapture
             * @param bindEventId   此标明事件ID，在移除对应事件时有用，因为removeEventListener中移除的事件函数
             *                       必需为addEventListener对应添加的事件函数，否则将不能移除事件绑定
             * @constructor
             */
            Event: function (event, fun, useCapture, bindEventId) {
                if (addEventListener) {
                    useCapture = useCapture == true;
                    this.Each(function (item, i) {
                        var handlerFunc = function (e) {
                            fun(e, item, i);
                        };
                        item.addEventListener(event, handlerFunc, useCapture);
                        if (bindEventId) {
                            item[event + '_' + bindEventId] = handlerFunc;
                        }
                    });
                } else {
                    event = 'on' + event;
                    this.Each(function (item, i) {
                        var handlerFunc = function (e) {
                            fun(e, item, i);
                        };
                        item.attachEvent(event, handlerFunc);
                        if (bindEventId) {
                            item[event + '_' + bindEventId] = handlerFunc;
                        }
                    });
                }
                return this;
            },
            /**
             *
             * @param event 事件类型
             * @param fun
             * @param useCapture
             * @param bindEventId  移除事件的ID，因为removeEventListener中移除的事件函数必需为addEventListener对应添
             *                      加的事件函数，否则将不能移除事件绑定
             * @constructor
             */
            EventRemove: function (event, fun, useCapture, bindEventId) {
                if (removeEventListener) {
                    useCapture = useCapture == true;
                    this.Each(function (item) {
                        if (bindEventId) {
                            item.removeEventListener(event, item[event + '_' + bindEventId], useCapture);
                        } else {
                            item.removeEventListener(event, fun, useCapture);
                        }
                    });
                } else {
                    event = 'on' + event;
                    this.Each(function (item) {
                        if (bindEventId) {
                            item.detachEvent(event, item[event + '_' + bindEventId]);
                        } else {
                            item.detachEvent(event, fun);
                        }
                    });
                }
                return this;
            },
            /**
             * 事件委托
             * @param event  事件
             * @param selector  选择器
             * @param fun       回调
             * @param useCapture
             * @author cheng.xing
             */
            Delegate: function (event, selector, fun, useCapture, bindEventId) {
                function _isTarget(targets, cur, end) {
                    targets = Array.isArray(targets) ? targets : [targets];
                    var isEnd = false;
                    while (!isEnd) {
                        if (!cur) {
                            return;
                        }
                        isEnd = targets.some(function (o) {
                            return o == cur && cur != end.parentNode;
                        });
                        if (!isEnd) {
                            cur = cur.parentNode;
                        } else {
                            return cur;
                        }
                    }
                }

                var that = this, preSelector = this.selector.substring(this.selector.indexOf(' ')),
                    selectors = selector.split(','), tmpSelector = [];
                selectors.forEach(function (v) {
                    tmpSelector.push(preSelector + ' ' + v);
                });
                if (addEventListener) {
                    useCapture = useCapture == true;
                    this.Each(function (item, i) {
                        var handlerFunc = function (e) {
                            var targetNode = _isTarget(Array.prototype.slice.call($(tmpSelector.join())), e.target || e.srcElement, that[i]);
                            if (targetNode) {
                                fun(e, targetNode, i);
                            }
                        };
                        item.addEventListener(event, handlerFunc, useCapture);
                        if (bindEventId) {
                            item[event + '_' + bindEventId] = handlerFunc;
                        }
                    });
                } else {
                    event = 'on' + event;
                    this.Each(function (item, i) {
                        var handlerFunc = function (e) {
                            var targetNode = _isTarget(Array.prototype.slice.call($(tmpSelector.join())), e.target || e.srcElement, that[i]);
                            if (targetNode) {
                                fun(e, targetNode, i);
                            }
                        };
                        item.attachEvent(event, handlerFunc);
                        if (bindEventId) {
                            item[event + '_' + bindEventId] = handlerFunc;
                        }
                    });
                }
                return this;
            },
            Click: function (fun, bindEventId) {
                this.Event('click', fun, false, bindEventId);
                return this;
            },
            //////////////////////////////////////////属性
            Attr: function (key, value) {
                if (value) {
                    this.Each(function (item) {
                        item.setAttribute(key, value);
                    })
                    return this;
                }
                else return this.length > 0 ? this[0].getAttribute(key) : null;
            },
            AttrRemove: function (key) {
                this.Each(function (item) {
                    item.removeAttribute(key);
                });
                return this;
            },
            Html: function (html, isAdd) {
                if (html != null) {
                    isAdd = isAdd == true;
                    var list = this, newItem;
                    this.Each(function (item, index) {
                        newItem = item.cloneNode(false);
                        newItem.innerHTML = (isAdd ? item.innerHTML : "") + html;
                        item.parentNode.replaceChild(newItem, item);
                        list[index] = newItem;
                    });
                    return this;
                } else return this.length > 0 ? this[0].innerHTML : null;
            },
            Text: function (text, isAdd) {
                if (text != null) {
                    isAdd = isAdd == true;
                    this.Each(function (item) {
                        if (item.innerText != null) item.innerText = (isAdd ? item.innerText : "") + text;
                        else item.textContent = (isAdd ? item.textContent : "") + text;
                    });
                    return this;
                } else {
                    return this.length > 0 ? this[0].innerText || this[0].textContent : null;
                }
            },
            Value: function (value) {
                if (value != null) {
                    this.Each(function (item) {
                        item.value += value;
                    });
                    return this;
                } else {
                    return this.length > 0 ? this[0].value : null;
                }
            },
            //////////////////////////////////////////样式
            Class: function (name) {
                this.Each(function (item) {
                    item.classList.add(name);
                });
                return this;
            },
            ClassHave: function (name) {
                return this.length > 0 ? new RegExp('( |^)' + name + '( |$)').test(this[0].className) : false;
            },
            ClassClear: function (name) {
                if (name) {
                    this.Each(function (item) {
                        item.classList.remove(name);
                    })
                }
                else {
                    this.Each(function (item) {
                        item.className = '';
                    })
                }
                return this;
            },
            CSS: function (key, value) {
                if (typeof key == 'string') {
                    if (value != null) {
                        this.Each(function (item) {
                            item.style[key] = value;
                        });
                        return this;
                    } else {
                        return this.length > 0 ? this[0].style[key] : null;
                    }
                } else {
                    this.Each(function (item) {
                        for (var a in key) item.style[a] = key[a];
                    });
                    return this;
                }
            },
            Show: function () {
                this.CSS('display', 'block');
                return this;
            },
            Hide: function () {
                this.CSS('display', 'none');
                return this;
            },
            TransitionDelay: function (ms) {
                this.Each(function (item) {
                    item.style.webkitTransition = item.style.transition = ms + 'ms';
                });
            },
            Translate: function (x, y, z) {
                x = x || 0;
                y = y || 0;
                z = z || 0;
                this.Each(function (item) {
                    item.style.webkitTransform = item.style.transform = 'translate(' + x + ',' + y + ') translateZ(' + z + ')';
                });
            },
            TranslateX: function (x) {
                x=x||0;
                this.Each(function (item) {
                    item.style.webkitTransform = item.style.transform = 'translateX(' + x + ')';
                });
            },
            //////////////////////////////////////////需求函数
            Page: function (url, type, resetHash) {
                this.Click(function () {
                    $.page(url, type, resetHash);
                });
            },
            Login: function (url,reset,ani,isNeedBind) {
                this.Click(function () {
                    $.login(url,reset,ani,isNeedBind);
                })
            },
            DivBackgroundCacheBack: function () {
                this.Each(function (item) {
                    if (item.getAttribute('imageCache')) {
                        item.style.backgroundImage = 'url("' + item.getAttribute('imageCache') + '")';
                        item.removeAttribute('imageCache');
                    }
                });
            },
            ImgSrcCacheBack: function () {
                this.Each(function (item) {
                    var u = item.getAttribute('imageCache');
                    if (u) {
                        if (!/^http/.test(u)) u = '/' + u;
                        item.src = u;
                        item.removeAttribute('imageCache');
                    }
                });
            },
            Verify: function (type, callback, length) {
                if (!type) return;
                if (type == '*')
                    this.Event('change', function (e, item, index) {
                        var value = item.value;
                        if (length != null) value = value.substring(0, length);
                        item.value = value;
                        if (callback) callback(value != '', index);
                    });
                else if (type == 'tel')
                    this.Event('input', function (e, item, index) {
                        if (/\D/.test(item.value)) {
                            item.value = item.value.replace(/\D/g, '');
                        }
                        if (item.value.length == 1 && item.value != 1) {
                            item.value = "";
                        }
                        if (item.value.length == 2 && !/^1[34578]$/.test(item.value)) {
                            item.value = 1;
                        }
                        if (item.value.length > 11) {
                            item.value = item.value.substring(0, 11);
                        }
                        if (callback) {
                            callback(/^1[34578]\d{9}$/.test(item.value));
                        }
                    });
                else if (type == 'authcode')
                    this.Event('input', function (e, item, index) {
                        var value = item.value.replace(/\D/g, '').substring(0, 4);
                        item.value = value;
                        if (callback) callback(/^\d{4}$/.test(value), index);
                    });
                else if (type == 'password')
                    this.Event('input', function (e, item, index) {
                        var value = item.value.replace(/\W/g, '').substring(0, 20);
                        item.value = value;
                        if (callback) callback(/^\w{6,20}$/.test(value), index);
                    });
                else if (type == 'num')
                    this.Event('input', function (e, item, index) {
                        var value = item.value.replace(/\D/g, '');
                        if (length != null) value = value.substring(0, length);
                        item.value = value;
                        if (callback) callback(/^\d*$/.test(value), index);
                    });
                else if (type == 'word')
                    this.Event('input', function (e, item, index) {
                        var value = item.value.replace(/[^a-zA-Z]/g, '');
                        if (length != null) value = value.substring(0, length);
                        item.value = value;
                        if (callback) callback(/^\d*$/.test(value), index);
                    });
                else if (type == 'wordnum')
                    this.Event('input', function (e, item, index) {
                        var value = item.value.replace(/[^a-zA-Z\d]/g, '');
                        if (length != null) value = value.substring(0, length);
                        item.value = value;
                        if (callback) callback(/^[a-zA-Z\d]*$/.test(value), index);
                    });
            }
        };

        //////////////////////////////////////////////////////ajax
        $._ajax = function (url, data, success, error) {
            //初始化参数
            var set;
            if (typeof url === 'string') {
                set = {url: url, data: data, success: success, error: error}
            } else if (typeof url === 'object') set = url;
            else return false;
            set.type = set.type == 'get' ? 'get' : 'post';
            set.async = set.async != false;
            if (set.contentType == null) set.contentType = 'application/x-www-form-urlencoded;charset=UTF-8';
            if (typeof set.data === 'object') {
                var tmp = '';
                for (var a in set.data)
                    tmp += '&' + a + '=' + set.data[a];
                set.data = tmp.substring(1);
            } else if (!set.type && typeof set.data != 'string') return false;
            if (set.type == 'get') {
                if (set.data && set.data != '') set.url += '?' + set.data;
                else set.data = null;
            }
            //定义ajax对象
            var ajaxObj = false;
            if (window.XMLHttpRequest) {
                ajaxObj = new XMLHttpRequest();
                if (ajaxObj.overrideMimeType) ajaxObj.overrideMimeType('text/xml');
            } else if (window.ActiveXObject) {
                ajaxObj = new ActiveXObject('Microsoft.XMLHTTP');
            }
            if (!ajaxObj) return false;

            ajaxObj['onreadystatechange'] = function () {
                if (ajaxObj.readyState == 4) {
                    if (/^(200|204)$/.test(ajaxObj.status)) {
                        if (set.success) set.success(ajaxObj.responseText);
                    } else if (ajaxObj.status == 0) { //网络断开的情况下
                        $.tipShow('请检查您的网络连接！');
                        if (pageIsLoading) {
                            $.pageCancel();
                        }
                    } else if (set.error) {
                        set.error(ajaxObj.responseText, ajaxObj.status);
                    }
                }
            };
            ajaxObj.open(set.type, set.url, set.async);
            ajaxObj.setRequestHeader('Content-Type', set.contentType);
            ajaxObj.send(set.data);
        };
        $.ajax = function (set) {//主要调用方法
            set = set || {};
            if (set.data == null)
                set.data = {timestamp: Date.now(), sessionType: $.$.sessionType, token: $.$.userToken || ''};
            else if (typeof set.data == 'object') {
                set.data.timestamp = Date.now();
                if (!set.data.sessionType) set.data.sessionType = $.$.sessionType;
                set.data.token = set.data.token || $.$.userToken || '';
            } else if (typeof set.data == 'string') {
                if (!/(&|\?)token=/.test(set.data)) set.data += '&token=' + ($.$.userToken || '') + '&timestamp=' + Date.now() + '&sessionType=' + $.$.sessionType;
            }

            $._ajax({
                url: set.isReplaceUrl === true?set.url:(ajaxUrl + set.url),
                data: set.data,
                type: set.type == 'post' ? 'post' : 'get',
                async: set.async,
                success: function (text) {
                    text = text.trim();
                    if (set.success) {
                        try {
                            text = JSON.parse(text);
                        } catch (e) {
                        }
                        set.success(text);
                    }
                },
                error: function (text, code) {
                    text = text.trim();
                    if (code == 0) $.tipShow("请检查您的网络连接！");
                    else if (!/user\/info\/view/.test(set.url)) {
                        if (code == 401) {
                            $.$.loginUrl = pageHashAll;
                            $.page('login', 1, true);
                        } else if (set.error) {
                            try {
                                text = JSON.parse(text);
                            } catch (e) {
                            }
                            set.error(text, code);
                        } else if (text) {
                            $.tipShow(text);
                        }
                    }
                }
            })
        };

        /******************************************************************************
         * 页面初始化
         * *****************************************************************************/
        init$();
        win.$ = $;

        var winWidth,
            scale,
            sessionStorageExpires = {},
            pageIsLoading = false,
            pageSwitchType = 0,
            pageSwitchIsFun = false,
            pageSwitchNeedGetPage = true,
            pageSwitchIsSafariGesture = false,
            pageSwitchAnimate = true,
            pageParam = {},
            pageUrl = '',
            pageHash = '',
            pageHashAll = '',
            pageHashAllLast = '',
            baseUrl = loc.origin + loc.pathname + loc.search,
            ajaxUrl = '../api/v2/club/' + ( $.$.clubID ? ( $.$.clubID + '/' ) : '' ),
            BDurl = location.pathname + '/',
            pageKit = {//页面url对应插件   语法  url:插件    url:[插件，插件]
                map: 'map',
                clubList:['map','customSwiper'],
                picture: 'ic',
                home:'customSwiper',
                robProjectSuccess:'customSwiper'
            },
            kitList = {//插件对应路径
                map: 'http://webapi.amap.com/maps?v=1.3&key=ff9e41d1f7fcaed686817ad278502750', //高德地图
                ic: 'COMPRESSED/js/kit/ic.js', //图片上传裁剪
                customSwiper:'COMPRESSED/js/kit/customSwiper.js'        //图片轮播
            },
            pageMenu = {home: true, message: true, order: true, personal: true, technicianList: true},
            publicNavMenu = {clubList: true, message: true, personal: true},
            html = doc.querySelector('html'),
            content = doc.querySelector('#_content'),
            loading = doc.querySelector('#_loading'),
            tip = doc.querySelector('#_tip'),
            eventMask = doc.querySelector('#_eventMask'),
            clubMenu = doc.querySelector('#_clubMenu'),
            publicMenu = doc.querySelector('#_publicMenu'),
            currLoadKey = '',       //当前正在加载的页面唯一标识（当前时间的毫秒数）
            currLoadStatus = {};    //当前页面加载的状态：是否已加载完js及html

        //////////////////////////////////////////////////////////////////控制器
        function $(selector, isAll) {
            if (typeof selector == 'string') {
                selector = (isAll ? '' : '#_content>div#' + pageUrl + ' ') + selector;
            }
            return new SelectorResult(selector);
        }

        ////////////////////////////////////////////////////////////////初始化页面
        function init$() {
            var v = loc.search.substring(1).split('&'),
                l = v.length,
                p = {},
                ua = navigator.userAgent.toLowerCase(),
                isQQB = /mqqbrowser/.test(ua),
                isQQ = /qq/.test(ua) && !isQQB,
                isWX = /micromessenger/.test(ua),
                isUC = /ucbrowser/.test(ua),
                isDolphin = /dolphinbrowsercn/.test(ua),
                is360 = /360 aphone browser/.test(ua),
                isBaidu = /baidubrowser/.test(ua),
                isOpera = /opera|opr/.test(ua),
                isSafari = /safari/.test(ua),
                isFirefox = /firefox/.test(ua),
                isNetscape = /netscape/.test(ua),
                isChrome = /chrome/.test(ua),
                isiPhone = /iPhone/i.test(ua),
                isPresto = /oresto/.test(ua),
                isWebkit = /webkit/.test(ua),
                isTrident = /trident/.test(ua),
                isGecko = /gecko/.test(ua),
                sessionType,
                hash = loc.hash;
            hash = hash.replace(/^\/?#+!?/, '').replace(/\/+/g, '/').replace(/\/$/, '');
            if (hash == '') hash = 'home';
            else if (/^&/.test(hash)) hash = 'home' + hash;
            supportReplaceState && history.replaceState(null, doc.title, loc.search + '#' + hash);

            for (var i = 0; i < l; i++) {
                v[i] = v[i].split('=');
                v[i][1] = decodeURIComponent(v[i][1]);
                p[v[i][0]] = v[i][1] ? v[i][1].split('/')[0] : '';
            }

            if (loc.hash.indexOf("?") >= 0) {
                v = loc.hash.split("?")[1];
                if (v) v = v.split("&");
            }
            else v = loc.hash.split("&");
            l = v.length;
            for (i = 0; i < l; i++) {
                v[i] = v[i].split('=');
                v[i][1] = decodeURIComponent(v[i][1]);
                p[v[i][0]] = v[i][1] ? v[i][1].split('/')[0] : '';
            }
            sessionType = ((p["code"] && /9358/.test(p["state"]) || p["openId"]) ? "9358" : (ss('sessionType') || 'web'));
            var defaultHeader = "img/header_default.jpg";
            $.$ = {
                winWidth: 0,
                scale: 0,
                loginUrl:ls('loginUrl') || '',//登录之后跳转的页面
                ua: {
                    value: ua,
                    isWX: isWX,
                    isX5: isQQ || isWX,
                    isFirefox: isFirefox,
                    isiPhone: isiPhone,
                    isSafari: isSafari && isiPhone && isWebkit && !isPresto && !isTrident && isGecko && !isNetscape && !isChrome && !isUC && !isOpera && !isQQB && !isWX && !isDolphin && !is360 && !isBaidu
                },
                clubID: (p['club'] || '').substring(0, 18),
                clubName: '',
                clubLogo: '',
                userToken: '',
                userID: ls('userID') || cookie("userID") || '',
                userTel: ls('userTel') || cookie("userTel") || '',
                userName: ls('userName') || cookie("userName") || '游客',
                userHeader: ls('userHeader') || defaultHeader,
                userAvatar: ls('userAvatar') || "",
                userLoginName: ls('userLoginName') || cookie("userLoginName") || '',
                sessionType: sessionType,

                nickName: ls('nickName'),//////微信的昵称
                headerImgUrl: ls('headerImgUrl'),////////微信的头像
                authCode: (p['code']) ,
                loginChanel: ss('loginChanel'),
                openId: ls("openId") || cookie("openId"),
                sessionId: ls('sessionId'),
                clubInviteCode: ss("clubInviteCode"),
                techSerialNo: ss("techSerialNo") || (p["techCode"]),
                techInviteCode : ss("techInviteCode") || (p["techInviteCode"]),
                currLngx: ss("currLngx") || '',
                currLaty: ss("currLaty") || '',
                isLogin: ss("isLogin") || 'N',

                //预支付ID
                prePayId: ls('prePayId'),
                payAuthCode: null,
                payOpenId: ls('openId'),
                paySessionId: ls('paySessionId'),
                afterReward: false,//是否弹出感谢打赏窗口的标志
                afterRewardInfo:null, //感谢页面质量信息
                visitChannel: (p['visitChannel'] || (!p['club'] && p["code"] && (/9358/.test(p["state"]) || p["openId"]) ? "9358" : '')),//是否在公众号里面
                showGetCouponInfo: false,//在进入优惠活动页的时候是否显示'您已获得一张优惠券'的提示

                easemob: {
                    userId: ls('easemobUserId'),
                    secondUserId: ls('easemobSecondUserId'),
                    appKey: /spa.93wifi.com/.test(loc.hostname) ? "xiaomodo#spa" : "xiaomodo#spatest",
                    conn: null,
                    secondConn : null,//////第二个连接只作为接收消息之用
                    reConnTimer: null,//重连的定时器
                    currChatTech: {/////当前聊天的技师信息
                        chatId: null,
                        name: null,
                        header: null,
                        avatar: null,
                        no: null,
                        techId: null,
                        clubId: null
                    },
                    sessionList: null,//存储每个会话的最后一条消息
                    msgList: {} //放置每个会话的历史记录
                },
                scanimg: null,
                lastScanImgParent: null,
                defaultHeader: defaultHeader,
                defaultUserName: '匿名用户',
                defaultTechName: "小摩豆技师",
                defaultClubLogo: "img/logo_default.jpg",
                defaultClubName: "小摩豆",
                defaultClubAddress: "(暂无地址)",
                defaultBanner: "img/banner_default.jpg",
                defaultService: "img/serviceItem_default.jpg",
                is_telphone_user: ls("is_telphone_user") || cookie("is_telphone_user") || false,
                viewClubType:ls("viewClubType") || cookie("viewClubType") || 'all_club', //all_club  my_club
                accessMenus:null,   //会所已开通的功能
            };
            if($.$.visitChannel.indexOf('/')!=-1){
                $.$.visitChannel = $.$.visitChannel.substring(0,$.$.visitChannel.indexOf('/'));
            }
            //=========================监听userToken的变化===========================//
            $.$.__userToken = null;
            Object.defineProperty($.$, 'userToken', {
                set: function (v) {
                    if (v && $.$.clubID) {
                        if(v != this.__userToken){
                            $._ajax({
                                url: '../api/v2/log/add',
                                type: 'post',
                                data: {
                                    clubId: $.$.clubID,
                                    timestamp: Date.now(),
                                    sessionType: $.$.sessionType,
                                    token: v,
                                    module: 'LOGIN',
                                    remark: $.$.ua.value
                                },
                                success: function (response) {}
                            });
                        }

                        setTimeout(function(){
                            $._ajax({
                                url: '../api/v2/log/user_bind_club_tech',
                                type: 'post',
                                data: {
                                    clubId: $.$.clubID,
                                    timestamp: Date.now(),
                                    token: v,
                                    techCode : ($.$.techInviteCode?$.$.techInviteCode.split('/')[0]:''),
                                    openId : $.$.openId || "",
                                    source : (/scan/.test($.$.loginChanel) ? "qrCode" : "web")
                                },
                                success: function (response) {}
                            });
                        },350)
                    }
                    this.__userToken = v;
                },
                get: function () {
                    return this.__userToken;
                }
            });
            $.$.__loginUrl = null;
            Object.defineProperty($.$, 'loginUrl', {
                set: function (v) {
                    this.__loginUrl = v;
                    ls('loginUrl',v);
                },
                get: function () {
                    return this.__loginUrl;
                }
            });
            //=========================监听userToken的变化===========================//
            $.$.userToken = ls('userToken_' + sessionType) || ls('userToken') || cookie("userToken");
            $.$.loginUrl = ls('loginUrl') || '';

            ss('sessionType', $.$.sessionType);
            cookie('userToken', $.$.userToken);
            cookie('userID', $.$.userID);
            cookie('userTel', $.$.userTel);
            cookie('userName', $.$.userName);
            cookie('userLoginName', $.$.userLoginName);

            if ($.$.userName == "游客" && $.$.nickName) {
                $.$.userName = $.$.nickName;
            }
            if ($.$.userHeader == defaultHeader && $.$.headerImgUrl) {
                $.$.userHeader = $.$.headerImgUrl;
            }
        }
        //========== 加载权限列表 =========
        if($.$.clubID){
            $.ajax({
                url:'../api/v2/club/menu/all',
                isReplaceUrl:true,
                async:false,
                data:{
                    clubId: $.$.clubID
                },
                success: function (result) {
                    if(result.statusCode == 200){
                        $.$.accessMenus = {};
                        result.respData.enabledResourcesIds = result.respData.enabledResourcesIds || [];
                        menuToObject(result.respData.menuList, $.$.accessMenus);
                        function menuToObject(arr,obj){
                            arr = arr || [];
                            obj = obj || {};
                            for(var i= 0,l = arr.length;i<l;i++){
                                obj[arr[i].code] = arr[i];
                                arr[i]['isPass'] = result.respData.enabledResourcesIds.some(function (v) {
                                    return v == arr[i].id;
                                });
                                if(arr[i].children && arr[i].children.length > 0){
                                    menuToObject(arr[i].children,obj);
                                }
                            }
                        }

                    }
                }
            });
        }

        //重置hash
        function hashReset() {
            pageHashAll = loc.hash.substring(1);//记录完整hash
            pageHash = pageHashAll.split('/');//记录当前页hash
            pageHash = pageHash[pageHash.length - 1];
            pageUrl = pageHash.split('&'); //记录参数
            pageParam = {};
            if (pageUrl.length != 1) {
                for (var i = 1; i < pageUrl.length; i++) {
                    pageUrl[i] = pageUrl[i].split('=');
                    pageUrl[i][1] = decodeURIComponent(pageUrl[i][1]);
                    pageParam[pageUrl[i][0]] = pageUrl[i][1] ? pageUrl[i][1].split('/')[0] : '';
                }
            }
            //记录页面url
            pageUrl = pageUrl[0] || "home";
        }

        //localStorage操作：设置值---$.localStorage(key,value) 读取值 localStorage(key)
        $.localStorage = ls;

        //localStorage清除值
        $.localStorageClear = lsc;

        //sessionStorage操作
        $.sessionStorage = ss;

        //sessionStorage清除值
        $.sessionStorageClear = ssc;

        //cookie操作
        $.cookie = cookie;
        $.cookieClear = cookieClear;

        //页面大小控制
        function initWidth() {
            if (!win.baseWidth) win.baseWidth = doc.body.clientWidth || 320;
            $.$.winWidth = winWidth = doc.documentElement.clientWidth || win.innerWidth || doc.body.clientWidth;
            $.$.winHeight = doc.documentElement.clientHeight || win.innerHeight;
            $.$.scale = scale = winWidth / win.baseWidth;
            html.style.fontSize = doc.documentElement.style.fontSize = scale * 16 + 'px';

            var pageContent = doc.querySelectorAll('#_content>div');
            if ($.$.ua.isiPhone && pageContent) {
                for (var i = 0; i < pageContent.length; i++) {
                    pageContent[i].style.position = "fixed";
                    pageContent[i].style.top = 0;
                    pageContent[i].style.bottom = 0;
                    pageContent[i].style.left = 0;
                    pageContent[i].style.right = 0;
                }
            }
        }

        //百度统计  统计PV的页面URL 必须是以"/"（斜杠）开头的相对路径
        $.BDPV = function (url) {
            if (win._hmt) win._hmt.push(['_trackPageview', BDurl + url]);
        };

        /*
         index	必选	Int	自定义变量所占用的位置	索引的范围是从1到5
         name	必选	String	自定义变量的名字	每个索引对应的名字在使用一次后就会固定以后无法更改
         value	必选	String	自定义变量的值
         opt_scope	可选	Int	自定义变量的作用范围	1为访客级别（对该访客始终有效）
         2为访次级别（在当前访次内生效）
         3为页面级别（仅在当前页面生效,默认）
         */
        $.BD = function (index, name, value, opt_scope) {
            if (win._hmt) win._hmt.push(['_setCustomVar', index, name, value, opt_scope]);
        };

        //设置、获取页面参数 param('data') param('data',1)
        $.param = function (key, value) {
            if (value != null) {
                var reg = new RegExp('&' + key + '=.*?&|&' + key + '=.*?$'), hash = loc.search + '#';
                if (reg.test(pageHash)) hash += pageHashAll.replace('/' + pageHash, '/' + pageHash.replace(reg, '&' + key + '=' + value + '&').replace(/&$/, ''));
                else hash += pageHashAll + '&' + key + '=' + value;
                pageSwitchIsFun = true;
                supportReplaceState && history.replaceState(null, doc.title, hash);
                hashReset();
            } else {
                return key ? pageParam[key] : pageParam;
            }
        };

        //清除页面参数 paramClear()
        $.paramClear = function (key) {
            if(!$.param(key)) return;
            if (supportReplaceState) {
                if (pageHashAll == pageHash) {
                    history.replaceState(null, doc.title, loc.search + '#' + (key ? pageHash.replace(new RegExp('&' + key + '=.*?&|&' + key + '=.*?$'), '&').replace(/&$/, '') : pageHash.split('&')[0]));
                }
                else {
                    history.replaceState(null, doc.title, loc.search + '#' + (key ? pageHashAll.replace('/' + pageHash, '/' + pageHash.replace(new RegExp('&' + key + '=.*?&|&' + key + '=.*?$'), '&').replace(/&$/, '')) : pageHashAll.replace('/' + pageHash, '/' + pageUrl) ));
                }
            }
            hashReset();
        };

        //页面载入效果 loadingShow(false)
        $.loadingShow = function (ope) {
            ope = ope ? 'add' : 'remove';
            loading.classList[ope]('active');
            loading.children[0].classList[ope]('active');
            loading.children[1].classList[ope]('active');

            //=== 解决在IPhone中，聊天过后，遮罩层会向上偏移（实际原因为_content元素存在margin-bottom值，
            // 此时_content已经滚动到了最底部，使用scrollIntoView，使其滚动到顶部） ===
            content.scrollIntoView();
        };
        $.eventMaskShow = function (open) {
            eventMask.style.display = open ? "block" : "none";
        };

        //文本提示, isDebug为true，且DEBUG_ENABLE为true时，此文本才会提示
        $.tipShow = function (value, time, isDebug) {
            if (!isDebug || DEBUG_ENABLE && isDebug === true) {
                tip.children[0].innerHTML = value;
                tip.classList.add('active');
                setTimeout(function () {
                    tip.classList.remove('active');
                }, (time || 2500));
            }
        };

        //页面跳转控制 pageSwitch()
        $.pageSwitch = function () {
        };

        //检测此次跳转进入的页面 会所是否已开通此功能 =========
        function checkAccessMenu (auth,type){
            if(!$.$.clubID) return true;
            auth = auth || '';
            if(auth == '') return true;
            if(!$.$.accessMenus) return true;
            var reg = null,regResult;
            auth = auth.split('/');
            auth = auth[auth.length - 1].split('&')[0];
            /*if(type == 'url'){              //页面跳转
                for(var key in $.$.accessMenus){
                    reg = new RegExp('^(\/|#)?('+key+')(&[\s\S]+)?$');
                    regResult = reg.exec(auth);
                    if(regResult) return true;
                }
            }else{*/
                return $.$.accessMenus[auth]?$.$.accessMenus[auth].isPass:true;
            /*}
            return false;*/
        }
        //检测此次跳转进入的页面 会所是否已开通此功能 =========
        $.checkAccessMenu = function (url) {
            var flag = checkAccessMenu(url,'url');
            if(!flag) $.tipShow('会所未开通该功能');
            return flag;
        };

        //login('home')
        /**
         *
         * @param url
         * @param resetUrl
         * @param ani       是否需要页面间的切换动画。 默认为true
         * @param isNeedBind 是否需要绑定手机才可以进行下一步的操作
         * @returns {boolean}
         */
        $.login = function (url, resetUrl, ani, isNeedBind) {//用于判断石豆注册再跳转,返回是否需要登录
            url = url || '';
            if ($.$.userToken) {
                if (url) {
                    if(!!isNeedBind && !$.$.userTel){
                        $.localStorage('pop_bind_phone_dialog',true);
                        $.eventMaskShow(true);
                        $.$.loginUrl = (pageHashAll + '/' + url).replace(/^\//, '').replace(/\/$/, '');
                        $('#_bindPhone',true).Class('active');
                        return true;
                    }else{
                        resetUrl === true ? $.page(url, -1, true, ani) : $.page(url);
                    }
                }
                return false;
            } else {
                if($.checkAccessMenu(url)){
                    $.$.loginUrl = (pageHashAll + '/' + url).replace(/^\//, '').replace(/\/$/, '');
                    $.page($.$.loginUrl.replace(/\/[^\/]*$/, '/login'), 1, true, ani);
                    return true;
                }else{
                    return false;
                }
            }
        };

        //Page('home',1) Page('home') Page('home',0,true)
        /**
         *
         * @param url
         * @param type
         * @param resetHash
         * @param ani       是否需要页面间的切换动画。 默认为true
         */
        $.page = function (url, type, resetHash, ani) {//入口函数    type:-1 后退加载 0直接刷新 1前进加载
            if(!$.checkAccessMenu(url)) return;
            if (!type &&type!==0) type = 1;
            pageSwitchType = type;
            resetHash = resetHash == true;
            if (!url || url == '') {
                pageSwitchType = -1;
            }
            pageSwitchIsFun = true;
            pageSwitchAnimate = ani !== false;

            if (resetHash) {
                loc.hash = url;
            }
            else if (pageSwitchType == -1) {
                pageHashAllLast = pageHashAll;
                loc.hash = loc.hash.replace(new RegExp('(/|#)' + pageHash + '$'), '') || 'home';
            } else if (pageSwitchType == 0) {
                supportReplaceState && history.replaceState(null, doc.title, loc.search + '#' + loc.hash.replace(new RegExp('(/|#)' + pageHash + '$'), '/' + url));
            } else if (pageSwitchType == 1) {
                if (win.top != win) win.top.loc = loc.origin + loc.pathname + loc.search + '#' + url;
                else {
                    pageHashAllLast = pageHashAll;
                    loc.hash += '/' + url;
                }
            }
        };

        //pageCancel()
        $.pageCancel = function () {//取消页面加载
            pageSwitchNeedGetPage = false;
            var p = $('#_content>div#' + pageUrl, true)[0];
            if (p) content.removeChild(p);
            supportReplaceState && history.replaceState(null, doc.title, loc.search + '#' + pageHashAllLast);
            hashReset();
            $.loadingShow(false);
            $.eventMaskShow(false);
            pageSwitchNeedGetPage = true;
        };

        if ($.$.ua.isSafari) {
            $(content).Event('touchstart', function (e) {
                var x = e['touches'][0].clientX, left = x < 25, right = winWidth - x < 25;
                if (left || right) { //safari切页
                    pageSwitchIsSafariGesture = true;
                }
            });
        }

        //url的变化
        $(win).Event('hashchange', function (e) {
            //不需要更新
            if ($.param('imgScan') == 'true') {
                $.$.scanimg.close();
                return;
            }
            if (!pageSwitchNeedGetPage) return;
            //是否浏览器控制跳转
            if (pageSwitchIsFun) {
                pageSwitchIsFun = false;
            }
            else {
                var oldURL = e['oldURL'], newURL = e['newURL'];
                //是否项目内跳转
                if (oldURL.indexOf(baseUrl) != 0) return;
                //判断前进还是后退
                pageSwitchType = oldURL.indexOf(newURL) == 0 ? -1 : 1;
                //页面在加载则劫持前进&后退操作
                if (pageIsLoading) {
                    pageSwitchType == 1 ? history.back() : history.forward();
                    pageSwitchIsFun = true;
                    return;
                }
                //获得页面
                oldURL = oldURL.replace(baseUrl, '').substring(1).split('/');
                newURL = newURL.replace(baseUrl, '').substring(1).split('/');
                oldURL = oldURL[oldURL.length - 1].split('&')[0];
                newURL = newURL[newURL.length - 1].split('&')[0];
            }
            setPage();
        });

        function showPage(defaultPage,force) {
            defaultPage = defaultPage || "clubList";
            if(!$.checkAccessMenu(defaultPage)) defaultPage = 'home';
            var hash = loc.hash;
            hash = hash.replace(/^\/?#+!?/, '').replace(/\/+/g, '/').replace(/\/$/, '').replace(/\?/, "&");
            if (hash == '' || hash == "home" || force === true) hash = defaultPage;
            else if (/^&/.test(hash)) hash = defaultPage + hash;
            supportReplaceState && history.replaceState(null, doc.title, (loc.search || '?') + '#' + hash);
            setPage();
        }

        function setPage() {
            var tmpUrl = loc.hash.substring(1).split('/');
            tmpUrl = tmpUrl[tmpUrl.length - 1];
            if(!$.checkAccessMenu(tmpUrl)){return false;}

            $.loadingShow(true);
            $.eventMaskShow(true);
            pageIsLoading = true;

            //定义上下页
            var pageOld = $('#_content>div#' + pageUrl, true), pageNew;
            if (pageOld) pageOld = pageOld[0];
            hashReset();
            //定义页面切换函数
            $.pageSwitch = function (useDefaultShareConfig) {
                //定义页面返回按钮
                $('#backBtn').Page();
                $('div#title>div:nth-of-type(2)').Page();

                if (pageSwitchType == -1) {
                    if (pageOld) {//初始化
                        pageOld.style.zIndex = 4;
                        if (pageSwitchIsSafariGesture) {
                            $(pageOld).TransitionDelay(0);
                            $(pageOld).Translate('100%');
                        }
                        else {
                            if (pageSwitchAnimate)
                                pageOld.classList.add('ready');
                        }
                    }
                    pageNew.style.zIndex = 3;
                    if (pageSwitchAnimate) {
                        setTimeout(function () {
                            $.eventMaskShow(false);
                            if (pageOld && pageOld.parentNode == content) {
                                content.removeChild(pageOld);
                            }
                        }, 500);
                    } else {
                        $.eventMaskShow(false);
                        if (pageOld && pageOld.parentNode == content) {
                            content.removeChild(pageOld);
                        }
                    }
                }
                else if (pageSwitchType == 0) {
                    $.eventMaskShow(false);
                }
                else if (pageSwitchType == 1) {
                    if (pageSwitchIsSafariGesture) {
                        $(pageNew).TransitionDelay(0);
                        $(pageNew).Translate();
                    }
                    else {
                        if (!pageSwitchAnimate){
                            $(pageNew).TransitionDelay(0);
                            $(pageNew).Translate();
                            pageNew.className = "";
                        }else{
                            pageNew.className = "normal";
                        }
                    }
                    if (pageSwitchAnimate) {
                        setTimeout(function () {
                            $.eventMaskShow(false);
                            if (pageOld && pageOld.parentNode == content) {
                                content.removeChild(pageOld);
                            }
                        }, 550);
                    } else {
                        $.eventMaskShow(false);
                        if (pageOld && pageOld.parentNode == content) {
                            content.removeChild(pageOld);
                        }
                    }
                }
                //=== 暂时性的修复：SPA-1591  ===
                setTimeout(function () {
                    if($('#_content',true).Children().length > 1){
                        var tmpNode = $('#confirmLogin',true);
                        $('#_content',true)[0].removeChild($('#_content',true).Children()[0]);
                    }
                },500);
                pageSwitchIsSafariGesture = false;
                //setTimeout(function () {
                $.loadingShow(false);
                //},500);
                pageIsLoading = false;

                ////////////////////////////////////////////////////////设置页面分享
                if ($.$.ua.isWX && useDefaultShareConfig !== false) {
                    $.globalShareConfig();
                }

                //根据页面设置底部menu的active状态
                if ($.$.visitChannel != '9358' || getUrlParam('club')) {
                    if (pageMenu[pageUrl]) {
                        if (clubMenu.style.display == 'none') $.showOrderMenu();
                        if (!$('#_clubMenu>div.active', true).ClassHave(pageUrl)) $.setOrderMenuActive(pageUrl);
                    } else {
                        $.hideOrderMenu();
                    }
                } else {
                    if (publicNavMenu[pageUrl]) {
                        if (publicMenu.style.display == 'none')  $.showOrderMenu();
                        if (!$('#_publicMenu>div.active', true).ClassHave(pageUrl)) $.setNavMenuActive(pageUrl);
                    } else {
                        $.hideOrderMenu();
                    }
                }
            };
            //加载新页
            getPage(pageUrl, function (p) {
                pageNew = p;
            });
        }

        function getPage(url, callback) {
            var p = $('#_content>div#' + pageUrl, true)[0];
            if (p != null) content.removeChild(p);

            addKit(pageKit[url], function () {
                delete pageKit[url];
                $.BDPV(pageHashAll.replace(/&.*\//g, '/').replace(/&.*$/g, ''));
                loadPage(url, callback);
            });
        }

        function addKit(list, call) {
            if (list) {
                if (typeof list == 'string') list = [list];
                run(list.length - 1);
            } else call();

            function run(i) {
                var kitName = list[i];
                i--;
                if (kitList[kitName]) {//插件尚在列表里
                    var j = document.createElement('script');
                    j.type = 'text/javascript';
                    j.onload = function () {
                        delete kitList[kitName];//加载后卸载插件列表 防止重复加载
                        if (i >= 0) run(i);
                        else call();
                    };
                    j.src = kitList[kitName];
                    document.getElementsByTagName('head')[0].appendChild(j);
                } else if (i < 0) call();
                else run(i);
            }
        }

        function loadPage(url, callback) {
            //version = Date.now();
            delete currLoadStatus[currLoadStatus];
            currLoadKey = (+new Date()).toString(32);
            currLoadStatus[currLoadKey] = false;
            var n = 2, contents = [];
            if(url.indexOf('?') !=-1){
                url = url.substring(0,url.indexOf('?'));
            }
            if(!doc.querySelector("#"+url+"-css")){
                n = 3;
                var linkNode = document.createElement("link");
                linkNode.setAttribute("id",url+"-css");
                linkNode.setAttribute("rel","stylesheet");
                linkNode.setAttribute("href","COMPRESSED/css/page/"+url+".css?v="+version);
                function loadCssCb(){
                    n--;
                    if (n == 0) {
                        loadCb();
                    }
                }
                doc.querySelector("head").appendChild(linkNode);
                //====== 魅族自带的浏览器不会执行onload事件，所以使用其它方法 ===
                if(!$.$.ua.isWX && /m[a-z\d]* build/i.test($.$.ua.value)){
                    function _cssIsLoaded(cssStylesheet) {
                        var cssLoaded = 0;
                        try {
                            if ( cssStylesheet.sheet && cssStylesheet.sheet.cssRules.length > 0 )
                                cssLoaded = 1;
                            else if ( cssStylesheet.styleSheet && cssStylesheet.styleSheet.cssText.length > 0 )
                                cssLoaded = 1;
                            else if ( cssStylesheet.innerHTML && cssStylesheet.innerHTML.length > 0 )
                                cssLoaded = 1;
                        }
                        catch(ex){ }

                        if(cssLoaded) {
                            loadCssCb();
                        } else {
                            setTimeout(function () {
                                _cssIsLoaded(cssStylesheet);
                            },50);
                        }
                    }
                    _cssIsLoaded(linkNode);
                }else{
                    linkNode.onload = linkNode.onreadystatechange = loadCssCb;
                }
            }
            $._ajax({
                url: url + '.html?v=' + version,
                type: 'get',
                success: function (html) {
                    n--;
                    contents[0] = html;
                    if (n == 0) {
                        loadCb();
                    }
                }
            });
            $._ajax({
                url: 'COMPRESSED/js/page/' + url + '.js?v=' + version,
                type: 'get',
                success: function (js) {
                    n--;
                    contents[1] = js;
                    if (n == 0) {
                        loadCb();
                    }
                }
            });

            function loadCb() {
                if(currLoadStatus[currLoadKey] !== undefined){
                    currLoadStatus[currLoadKey] = true;
                    createPage(url, contents[0], contents[1], callback);
                }
            }

            if ($.$.afterReward) {
                $('#_afterReward>div>div:nth-of-type(1)>div>i',true).CSS('background-image','url('+ ($.$.afterRewardInfo['avatarUrl'] || $.$.defaultHeader)+')');
                $('#_afterReward>div>div:nth-of-type(1)>div>div>div:first-child',true).Text($.$.afterRewardInfo.name || $.$.defaultTechName);
                $('#_afterReward>div>div:nth-of-type(1)>div>div>div:last-child',true).Text($.$.clubName || $.$.afterRewardInfo['clubName']);
                $('#_afterReward', true).Class('active');
                $.$.afterReward = false;

                /*setTimeout(function () {
                    $('#_afterReward', true).ClassClear();
                }, 2500)*/
            }
        }

        function createPage(url, html, js, callback) {
            var dc = document.createElement('div');
            dc.id = url;
            dc.innerHTML = html;
            var j = document.createElement('script');
            j.type = 'text/javascript';
            j.id = '_pageJS';
            j.innerHTML = js;
            dc.appendChild(j);

            if (pageSwitchType == -1) {
                dc.style.zIndex = 2;
                dc.classList.add('normal');
            } else if (pageSwitchType == 0) {
                dc.style.zIndex = 3;
                dc.classList.add('normal');
            } else if (pageSwitchType == 1) {
                dc.style.zIndex = 3;
                dc.classList.add('newPage');
            }
            callback(dc);//防止pageFun执行过快,所以在页面生成之前执行页面分配
            content.appendChild(dc);
            //=== 控制权限提示事件绑定 ===
            $('[data-tip-auth]').Click(function (e, item) {
                if(item.dataset.tipAuth && !checkAccessMenu(item.dataset.tipAuth)){
                    e.stopImmediatePropagation();
                    $.tipShow('会所未开通该功能');
                }
            });
            //==== 根据权限控制页面中的元素的显示与隐藏 ====
            $('[data-hide-auth]').Each(function (item) {
                if(!checkAccessMenu(item.dataset.hideAuth)){
                    item.style.display = 'none';
                }
            });
            $('[data-show-auth]').Each(function (item) {
                if(checkAccessMenu(item.dataset.showAuth)){
                    item.style.display = item.dataset.showAuth.split(':')[1] || 'block';
                }
            });
            initWidth();
        }

        ///////////////////////////////////////////////////////滚动切换
        /*
         css3滚动控制
         set={
         content:操作控制的容器     单个DOM

         contentX:左右移动的容器    单个DOM
         flag:左右移动时候的标记
         //loop:左右移动时候循环
         index:初始化左右索引位置
         xEnd:左右移动结束时候的回调函数 function(index)

         contentY:上下移动的容器    数组DOM
         top:初始化上下移动的高度
         yDelay:上下移动结束的渐变延迟
         yEnd:上下结束时候的回调函数
         }
         返回对象
         obj{
         Index(i)    左右跳转到索引位置
         }
         */
        $.scroll = function (set) {
            set = set || {};
            if (!set.contentX && !set.contentY)
                return;
            var x,//最后触点坐标
                y,
                xe,//当前触点坐标
                ye,
                xInit,//初始触点坐标
                yInit,
                moveType = 0,//触点操作方式
                time,//触点开始时间
                timeMove,//触点时间
                content = set.content,//操作板块
                content$ = $(content),
                contentX = set.contentX,//左右移动板块
                contentX$ = $(contentX),
                contentXChildren = contentX ? contentX.children : [],//左右移动子项
                lengthX = contentXChildren.length,//左右移动子项数量
                flagX = set.flagX,//左右移动索引板块
                loopX = set.loopX && lengthX > 1 || false,//左右移动循环
                autoX = set.autoX || false,//左右自动循环
                autoXDelay = set.autoXDelay || 3000,//自动循环的时延
                autoXEvent,
                autoXTouched = set.autoXTouched || false,//当移动之后是否继续自动切换
                indexX = set.indexX || 0,//左右移动当前索引
                widthX = set.widthX || winWidth,//视区宽度
                numsX = set.numsX || 1,//视区中可见子项数目
                wp = set.perX || (widthX / numsX),//contentXChildren.length>0?contentXChildren[0].clientWidth:0,//左右移动单项框度
                wa = wp * (lengthX - 1),//左右移动最大宽度
                xNow = -wp * indexX,//左右移动板块当前x值
                xNowInit = xNow,//左右移动操作前x值
                xR = wa,//左右移动最大x值，超过此值则停止/切换
                endX = set.endX,//右移动完毕事件
                str = '',//修正循环用的str
                contentY = set.contentY,//上下移动板块
                contentY$,
                endY = set.endY,//下移动完毕事件
                topY = parseFloat(set.topY || 0),//初始化上下移动值
                yv = [topY],//上下移动各个子项高度值
                delayY = set.delayY || 300,//上下移动自动滚动值
                ps = widthX,//屏幕宽度
                allowTouch = true,//是否响应touch事件
                clickItem = null,
                touchEndTimer = null,
                hm,
                d,
                i,
                onlyX=set.onlyX || false;
            if (numsX > 1 && contentXChildren.length <= numsX) {//auto和loop失效
                autoX = false;
                loopX = false;
                allowTouch = false;
            }

            if (loopX && lengthX > 0) {//循环的话增加html作为视觉
                for (i = contentXChildren.length - numsX; i < contentXChildren.length; i++)
                    str += contentXChildren[i].outerHTML;
                str += contentX.innerHTML;
                for (i = 0; i < numsX; i++)
                    str += contentXChildren[i].outerHTML;

                contentX$.Html(str);
                xNowInit = xNow = -((set.perX || wp) * numsX * (indexX + 1));
                if(onlyX){
                    contentX$.TranslateX(xNowInit + 'px');
                }else{
                    contentX$.Translate(xNowInit + 'px');
                }
                xR = wp * lengthX;
            }
            for (i = 0; i < lengthX; i++)
                yv[i] = topY;
            //初始化
            if (indexX != 0) {
                contentX$.TransitionDelay(0);
                if(onlyX){
                    contentX$.TranslateX(-wp * indexX + 'px');
                }else{
                    contentX$.Translate(-wp * indexX + 'px');
                }
            }
            if (flagX && flagX.children[indexX])
                flagX.children[indexX].classList.add('active');

            function X(add) {
                xNow += add;
                if (!loopX) {
                    if (xNow > 0)
                        xNow = 0;
                    else if (xNow < -xR)
                        xNow = -xR;
                }
                contentX$.Translate(xNow + 'px');
            }

            function DoX() {
                X(xe - x);
                x = xe;
            }

            function Y(e) {
                var v = e['changedTouches'][0].clientY - y + yv[indexX];
                if (v > 0 || hm >= 0)
                    v = 0;
                else if (v < hm)
                    v = hm;
                contentY$.Translate(0, v + 'px');
            }

            //定义操作
            if (set.click) {
                var items = content.children[0].children;
                for (i = 0; i < items.length; i++) {
                    if (allowTouch) {
                        $(items[i]).Event('touchend', function (e, item) {
                            clickItem = item;
                        });
                    }
                    else {
                        $(items[i]).Event('click', function (e, item) {
                            set.click(item);
                        });
                    }
                }
            }

            function setAutoScroll() {
                if (!autoXEvent) autoXEvent = setInterval(function () {
                    X(-wp);
                    xNowInit = xNow = xNowInit - wp;
                    if (loopX) {
                        if (xNow > -wp) {
                            xNowInit -= xR;
                        } else if (xNow < -xR) {
                            xNowInit += xR;
                        }
                    } else {
                        if (xNow > 0) {
                            xNowInit = 0;
                            clearInterval(autoXEvent);
                            autoXEvent = null;
                            return;
                        } else if (xNow < -xR) {
                            xNowInit = -xR;
                            clearInterval(autoXEvent);
                            autoXEvent = null;
                            return;
                        }
                        xNow = xNowInit;
                    }
                    //去掉当前索引
                    if (flagX && flagX.children[indexX]) flagX.children[indexX].classList.remove('active');
                    //修改索引
                    var tmp = indexX;
                    indexX++;
                    if (indexX < 0) indexX = lengthX - 1;
                    else if (indexX >= lengthX) indexX = 0;
                    //动画移动
                    contentX$.TransitionDelay(300);
                    contentX$.Translate(xNow + 'px');
                    setTimeout(function () {
                        contentX$.TransitionDelay(0);//重置动画时间
                        xNow = xNowInit;
                        contentX$.Translate(xNow + 'px');
                        if(onlyX){
                            setTimeout(function () {
                                contentX$.TranslateX(xNow + 'px');
                            },10);
                        }
                        if (contentY) {//初始化其他上下移动项的高度
                            yv[indexX] = topY;
                            contentY$ = $(contentY[tmp]);
                            contentY$.TransitionDelay(0);
                            contentY$.Translate(yv[indexX] + 'px');
                        }
                    }, 300);
                    //增加当前索引
                    if (flagX && flagX.children[indexX]) flagX.children[indexX].classList.add('active');
                }, autoXDelay);
            }

            if (allowTouch) {
                content$.Event('touchstart', function (e) {
                    //e.preventDefault();
                    if (autoXEvent != null) {
                        clearInterval(autoXEvent);
                        autoXEvent = null;
                    }
                    x = xInit = e['touches'][0].clientX;
                    y = yInit = e['touches'][0].clientY;
                    moveType = 0;
                    time = timeMove = Date.now();
                });
                content$.Event('touchmove', function (e) {
                    ///================
                    /*if (touchEndTimer) clearTimeout(touchEndTimer);
                    touchEndTimer = setTimeout(function () {
                        touchEnd(e);
                    }, 200);*/
                    xe = e['changedTouches'][0].clientX;
                    ye = e['changedTouches'][0].clientY;
                    if (moveType == 1) {
                        e.preventDefault();
                        DoX();
                    } else if (moveType == 2) {
                        e.preventDefault();
                        Y(e);
                    } else if (moveType == 0) {
                        var xa = Math.abs(xe - xInit),
                            ya = Math.abs(ye - yInit),
                            d = xa > 2 || ya > 2 ? xa > ya ? 1 : 2 : 0;
                        if (d == 1 && contentX) {
                            e.preventDefault();
                            moveType = 1;
                            contentX$.TransitionDelay(0);
                            DoX();
                        } else if (d == 2 && contentY) {
                            e.preventDefault();
                            moveType = 2;
                            contentY$ = $(contentY[indexX]);
                            contentY$.TransitionDelay(0);
                            hm = -contentY[indexX].scrollHeight + content.clientHeight;
                            Y(e);
                        }
                    }
                    timeMove = Date.now();
                });
                content$.Event('touchend', function (e) {
                    if (touchEndTimer) clearTimeout(touchEndTimer);
                    touchEnd(e);
                });
            }

            function touchEnd(e) {
                //e.preventDefault();
                xe = e['changedTouches'][0].clientX;
                ye = e['changedTouches'][0].clientY;
                var timeNow = Date.now();
                timeMove = timeNow - timeMove;//最后过程花费时间
                time = timeNow - time;//所有过程花费时间
                if (!timeMove) timeMove = 1;

                if (moveType == 1) {
                    e.preventDefault();
                    var s = xe - x,//最后过程花费距离
                        v = s / timeMove,//最后过程速度
                        sa = xe - xInit,//整个过程距离
                        va = sa / time,//整个过程速度
                        c = true;//需要翻页
                    DoX();
                    if (Math.abs(v) > 0.2) d = v > 0 ? 1 : -1;
                    else if (Math.abs(va) > 0.2) d = va > 0 ? 1 : -1;
                    else if (s > wp / 2) d = 1;
                    else if (s < -wp / 2) d = -1;
                    else d = 0;

                    if (numsX > 1) {
                        if (numsX < contentXChildren.length && d != 0) {
                            d = Math.round(sa / wp);
                        }
                        else d = 0;
                    }

                    xNowInit = xNow = xNowInit + d * wp;
                    if (loopX) {
                        if (xNow > -wp) xNowInit -= xR;
                        else if (xNow < -xR) xNowInit += xR;
                    } else {
                        if (xNow > 0) {
                            xNowInit = 0;
                            c = false;
                        } else if (xNow < -xR) {
                            xNowInit = -xR;
                            c = false;
                        }
                        xNow = xNowInit;
                    }
                    if (c) {
                        //去掉当前索引
                        if (flagX && flagX.children[indexX]) flagX.children[indexX].classList.remove('active');
                        //修改索引
                        var tmp = indexX;
                        indexX -= d;
                        if (indexX < 0) indexX = lengthX - 1;
                        else if (indexX >= lengthX) indexX = 0;
                    }
                    //动画移动
                    contentX$.TransitionDelay(300);
                    contentX$.Translate(xNow + 'px');
                    setTimeout(function () {
                        contentX$.TransitionDelay(0);//重置动画时间
                        xNow = xNowInit;
                        contentX$.Translate(xNow + 'px');
                        if(onlyX){
                            setTimeout(function () {
                                contentX$.TranslateX(xNow + 'px');
                            },10);
                        }
                        if (c && contentY) {//初始化其他上下移动项的高度
                            yv[indexX] = topY;
                            contentY$ = $(contentY[tmp]);
                            contentY$.TransitionDelay(0);
                            contentY$.Translate(yv[indexX] + 'px');
                        }
                    }, 300);
                    //增加当前索引
                    if (c && flagX && flagX.children[indexX])
                        flagX.children[indexX].classList.add('active');
                    //执行结束事件
                    if (endX) endX(indexX);
                    if (autoXTouched) setAutoScroll();
                }
                else if (moveType == 2) {
                    e.preventDefault();
                    var s = ye - y,//最后过程花费距离
                        v = s / timeMove,//最后过程速度
                        sa = ye - yInit,//整个过程距离
                        va = sa / time,//整个过程速度
                        c = false,//需要滑动
                        m = ye - yInit + yv[indexX];
                    Y(e);
                    if (Math.abs(v) > 30 || Math.abs(va) > 0.5) {
                        m += v * 3;
                        c = true;
                    } else if (Math.abs(v) > 30 || Math.abs(va) > 0.5) {
                        m += va * 3;
                        c = true;
                    }
                    if (c) {
                        contentY$.TransitionDelay(delayY);
                        if (m > 0) m = 0;
                        else {
                            if (hm >= 0) {
                                m = 0;
                                if (endY) endY();
                            } else if (m < hm) {
                                m = hm;
                                if (endY) endY();
                            }
                        }
                        if (timeMove < 200) contentY$.Translate(0, m + 'px');
                    }
                    yv[indexX] = m;
                }
                else if (x == xe && y == ye && timeMove < 250) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (set.click) {
                        if (clickItem) set.click(clickItem, indexX);
                        else {
                            var thisIndex = parseInt(-xNowInit / wp) + parseInt(x / wp, 10);
                            set.click(content.children[0].children[thisIndex], thisIndex);
                        }
                    }
                    else if (e['target'].click) {
                        e['target'].click();
                    }
                    else {
                        var evt = doc.createEvent('Event');
                        evt.initEvent('click', true, true);
                        e['target'].dispatchEvent(evt);
                    }
                }
                else if (moveType == 0) {
                    if (autoXTouched) setAutoScroll();
                }
                moveType = 0;
            }

            //定义autoX事件
            if (autoX) {
                contentX$.TransitionDelay(300);
                setAutoScroll();
            }
            //定义接口
            function scrollAPI() {
            }

            scrollAPI.prototype = {
                IndexX: function (i) {
                    if (i == null) return indexX;
                    else {
                        if (flagX && flagX.children[indexX]) flagX.children[indexX].classList.remove('active');
                        indexX = i;
                        contentX$.TransitionDelay(0);
                        xNow = xNowInit = -widthX * (indexX + (loopX ? 1 : 0));
                        contentX$.Translate(xNow + 'px');
                        if (flagX && flagX.children[indexX]) flagX.children[indexX].classList.add('active');
                    }
                }
            };
            return new scrollAPI();
        };

        ///////////////////////////////////////////////////////////X5分享
        $.X5Config = function (set) {
            if (!win['wx']) return;
            set = set || {};
            if (win['wx']["signReady"]) {
                if (set.title) {
                    wx.hideMenuItems({menuList: ['menuItem:copyUrl']});
                    wx.showAllNonBaseMenuItem();
                    wx.onMenuShareAppMessage(set);//分享给朋友
                    wx.onMenuShareTimeline(set);//分享到朋友圈
                    wx.onMenuShareQQ(set);//分享到QQ
                    wx.onMenuShareWeibo(set);//分享到腾讯微博
                    wx.onMenuShareQZone(set);//分享到QQ空间
                }
                else {
                    wx.hideAllNonBaseMenuItem();//屏蔽分享菜单
                }
            }
            else {
                win["requestSignCount"] = 2;
                requestWXSign(set);
            }
        };

        function requestWXSign(set) {
            var signUrl = baseUrl;
            /*var signUrl = baseUrl.replace(/(&|\?)gw_id=[\da-zA-Z_]+(&?)/g, function (v1, v2, v3) {
                return (v2 == '?') ? ( v3 ? '?' : '') : (v3 ? '&' : '');
            });

            signUrl = signUrl.replace(/(&|\?)_t=[\da-zA-Z_]+(&?)/g, function (v1, v2, v3) {
                return (v2 == '?') ? ( v3 ? '?' : '') : (v3 ? '&' : '');
            }); */
            $._ajax({
                url: '../api/v1/wx/sign',
                isReplaceUrl:true,
                data: { url: encodeURIComponent(signUrl), refresh: Date.now(), sessionType:'9358' },
                type: 'get',
                dataType: 'json',
                success: function (data) {
                    try {
                        data = JSON.parse(data);
                        win['wx'].config({
                            debug: false,
                            appId: data.appId,
                            timestamp: data.timestamp,
                            nonceStr: data.nonceStr,
                            signature: data.signature,
                            jsApiList: ['onMenuShareAppMessage', 'onMenuShareTimeline', 'onMenuShareQQ', 'onMenuShareWeibo', 'onMenuShareQZone', 'hideAllNonBaseMenuItem', 'showAllNonBaseMenuItem', 'hideMenuItems']
                        });

                        if (!win["wxError"]) {
                            win["wxError"] = true;
                            win['wx'].error(function (res) {/////////////微信分享配置失败
                                win['wx']["signReady"] = false;
                                win["requestSignCount"]--;
                                if (win["requestSignCount"] != 0) requestWXSign();
                                else{
                                    //当分享出错时，有可以点击按钮，提示分享有问题
                                    if(set.proxyDom){
                                        set.proxyDom.Click(function (e) {
                                            e.stopImmediatePropagation();
                                            $.tipShow('分享出错，请刷新页面后再试');
                                        });
                                    }
                                }

                                $.ajax({
                                    url:'../api/v2/user/share/info',
                                    isReplaceUrl:true,
                                    type: 'post',
                                    data: {
                                        url: encodeURIComponent(loc.href),
                                        browser: "signUrl：" + encodeURIComponent(signUrl),
                                        message: encodeURIComponent(JSON.stringify(data))
                                    },
                                    error: function (){}
                                });
                            });
                        }

                        if (!win["wxReady"]) {
                            win["wxReady"] = true;
                            win['wx'].ready(function () {
                                win['wx']["signReady"] = true;
                                $.X5Config(set);
                            });
                        }
                    } catch (e) {
                        $.tipShow("微信签名返回数据转换成json失败！");
                    }
                }
            });
        }

        //////////////////////////////////////////////////////////全局页面分享设置
        $.globalShareConfig = function () {
            if ($.$.clubID && $.$.clubName) {
                $.X5Config({
                    title: $.$.clubName + '欢迎您',
                    desc: '选个技师，选个项目，给身体放个假，这里太合适不过了。',
                    link: loc.href.split('?')[0] + '?club=' + $.$.clubID+'#home&visitChannel=9358&isNeedFollow=true',
                    imgUrl: $.$.clubLogo
                });
            }
            else $.X5Config();
        };

        /////////////////////////////////////////////////////////////////清除用户信息
        $.clearUserInfo = function () {
            $.$.userToken = '';
            $.$.userID = '';
            $.$.userHeader = $.$.defaultHeader;
            $.$.userTel = '';
            $.$.userName = $.$.defaultUserName;
            $.$.userToken = '';
            $.$.userLoginName = '';
            $.cookieClear('userToken');
            $.cookieClear('userID');
            $.cookieClear('userTel');
            $.cookieClear('userName');
            $.cookieClear('userLoginName');
            $.localStorageClear('userToken');
            $.localStorageClear('userToken_9358');
            $.localStorageClear('userToken_web');
            $.localStorageClear('userID');
            $.localStorageClear('userHeader');
            $.localStorageClear('userTel');
            $.localStorageClear('userName');
            $.localStorageClear('userLoginName');

            //easemob
            $.localStorageClear('easemobUserId');
            $.localStorageClear('easemobSecondUserId');
            $.localStorageClear('easemobAccessToken');

            var eb = $.$.easemob;
            eb.currChatTech = {};
            eb.sessionList = null;
            eb.msgList = {};
            eb.userId = null;
            eb.secondUserId = null;
            if (eb.conn) {
                eb.conn.stopHeartBeat(eb.conn);
                eb.conn.close();
            }

            if(eb.secondConn){
                eb.secondConn.stopHeartBeat(eb.secondConn);
                eb.secondConn.close();
            }
        };

        /////////////////////////////////////////////////////////////////日期转文本
        $.formatDate = function (start, end, splitChar) {
            if (!splitChar) splitChar = '—';
            if (!start) start = '';
            if (!end) end = '';
            if (start && end) {
                return start + splitChar + end;
            } else if (end) {
                return '截止至' + end;
            }
            return '长期有效';
        };

        //================= 通用日期转文本 =============
        $.commonDateFormat = function (date,format) {
            format || (format = 'yyyy-MM-dd hh:mm:ss');
            var o = {
                "M+" : date.getMonth()+1, //month
                "d+" : date.getDate(), //day
                "h+" : date.getHours(), //hour
                "m+" : date.getMinutes(), //minute
                "s+" : date.getSeconds(), //second
                "q+" : Math.floor((date.getMonth()+3)/3), //quarter
                "S" : date.getMilliseconds() //millisecond
            }

            if(/(y+)/.test(format)) {
                format = format.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));
            }

            for(var k in o) {
                if(new RegExp("("+ k +")").test(format)) {
                    format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
                }
            }
            return format;
        }

        /////////////////////////////////////////////////////////////////单价转文本
        $.formatPrice = function (price, duration, unit) {
            return ( (price && duration) ? price + '元/' + duration + (unit || '分钟') : '');
        };

        /////////////////////////////////////////////////////////////////对底部菜单的一些操作
        $.hideOrderMenu = function () {
            if ($.$.visitChannel == '9358' && !getUrlParam('club')) publicMenu.style.display = 'none';
            else clubMenu.style.display = 'none';
            $('#content', true).Class('noneMenu');
        };

        $.showOrderMenu = function () {
            if ($.$.visitChannel == '9358' && !getUrlParam('club')) publicMenu.style.display = 'block';
            else clubMenu.style.display = 'block';
            $('#content', true).ClassClear('noneMenu');
        };

        $.setOrderMenuActive = function (menu) {
            $('#_clubMenu>div', true).ClassClear('active');
            $('#_clubMenu>div.' + menu, true).Class('active');
        };

        $.setNavMenuActive = function (menu) {
            $('#_publicMenu>div', true).ClassClear('active');
            $('#_publicMenu>div.' + menu, true).Class('active');
        };

        $('#_clubMenu>div', true).Click(function (e, item, i) {
            var $item = $(item);
            if (!$item.ClassHave('active')) {
                $('#_clubMenu>div', true).ClassClear('active');
                $item.Class('active');
                switch (i) {
                    case 0 :
                        $.page('home', -1, true, false);
                        break;
                    case 1 :
                        $.page('message', -1, true, false);
                        break;
                    case 2 :
                        $.page('technicianList', -1, true, false);
                        break;
                    case 3 :
                        $.login('order',false,false, true);
                        break;
                    case 4 :
                        $.page('personal', -1, true, false);
                        break;
                }
            }
        });

        $('#_publicMenu>div', true).Click(function (e, item, i) {
            var $item = $(item);
            if (!$item.ClassHave('active')) {
                $('#_publicMenu>div', true).ClassClear('active');
                $item.Class('active');
                switch (i) {
                    case 0 :
                        $.page("clubList", -1, true, false);
                        break;
                    case 1 :
                        $.page("message", -1, true, false);
                        break;
                    case 2 :
                        $.page('personal', -1, true, false);
                        break;
                }
            }
        });

        $.updateUserNameAndHeader = function (tag) {
            $.ajax({
                url: ($.$.clubID ? "../" : "") + "../profile/user/info/view",
                data: { refresh : (+new Date()) },
                async: tag,
                login: false,
                success: function (res) {
                    if (res.statusCode == 200) {
                        res = res.respData;
                        $.$.userAvatar = res.avatar || "";
                        $.$.userName = res.name || $.$.defaultUserName;
                        $.$.userHeader = res.avatarUrl || $.$.defaultHeader;
                        ls("userAvatar", res.avatar);
                        ls("userName", res.name);
                        ls("userHeader", res.avatarUrl);
                    }
                }
            })
        };

        ///////////////////////////////////////////////////////////环信有关的
        $.showMsgNum = function (n) {
            var tip = $(($.$.visitChannel == "9358" ? "#_publicMenu" : "#_clubMenu") + ">div.message>div:nth-of-type(1)>i", true);
            if(pageUrl !== 'message'){
                n = parseInt(tip[0].innerHTML) + n;
            }
            if (n <= 0) {
                tip[0].innerHTML = 0;
                tip.CSS("visibility", "hidden");
            }
            else {
                tip[0].innerHTML = n;
                tip.CSS("visibility", "visible");
            }
        };

        //格式化显示消息中的时间
        $.formatMsgTime = function (timeStr, tag) {
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

        ////合并用户的sessionList&messageList
        $.switchUserChatInfo = function(oldUserId,newUserId){
            var sl, item, eb = $.$.easemob;
            /////切换会话列表-----合并操作
            var oldSl = ls(oldUserId+ '_SessionList'), newSl = ls(newUserId + '_SessionList') || '{}';
            if(oldSl){
                var oldSlList = JSON.parse(oldSl);
                if(newSl){
                    var newSlList = JSON.parse(newSl);
                    for(item in oldSlList){
                        if(!newSlList[item] || newSlList[item].time-0 < oldSlList[item].time-0){
                            newSlList[item] = oldSlList[item];
                        }
                    }
                    ls(newUserId + '_SessionList',JSON.stringify(newSlList));//直接用旧的替换
                    sl = newSlList;
                }
                else{
                    ls(newUserId + '_SessionList',oldSl);//直接用旧的替换
                    sl = oldSlList;
                }
                lsc(oldUserId+ '_SessionList');//删除旧会话列表
            }
            else{
                sl = JSON.parse(newSl);
            }

            eb.sessionList = null;
            $.getSessionList();//////重新获取会话列表

            /////切换消息列表--------合并操作
            var newMsgList, oldMsgList, k, oldMsgListObj, newMsgListObj;
            var oldChatId = eb.secondUserId, newChatId = eb.userId;
            for(item in sl){
                newMsgList = ls(newUserId + '_MsgList_'+item);
                oldMsgList = ls(oldUserId + '_MsgList_'+item);
                if(oldMsgList){
                    oldMsgList = oldMsgList.replace(new RegExp(oldChatId,"g"),newChatId);
                    if(!newMsgList){
                        ls(newUserId + '_MsgList_'+item,oldMsgList);///旧消息列表放到新的里面
                    }
                    else{
                        oldMsgListObj = JSON.parse(oldMsgList);
                        newMsgListObj = JSON.parse(newMsgList);
                        for(k=0;k<oldMsgListObj.list.length;k++){
                            newMsgListObj.list.push(oldMsgListObj.list[k]);
                        }
                        if(k!=0){
                            newMsgListObj.list.sort(function(a,b){ return (a.time < b.time ? -1 : 1) });
                        }
                        ls(newUserId + '_MsgList_'+item,JSON.stringify(newMsgListObj));///旧消息列表放到新的里面
                    }
                    lsc(oldUserId+ '_MsgList_'+item);
                }
            }
            eb.msgList = null;
        };

        $.getSessionList = function (async, reGet) {//返回SessionList 或者空对象
            var eb = $.$.easemob;
            if (!eb.sessionList || reGet == true) {
                var cacheStr = ls($.$.userID + '_SessionList');
                if ($.$.userID && cacheStr) {
                    eb.sessionList = JSON.parse(cacheStr);
                    var avatarArr = [], item, avatar; //刷新头像
                    for (item in eb.sessionList) {
                        avatar = eb.sessionList[item].avatar;
                        if (avatar && avatar.length > 0) {
                            avatarArr.push(eb.sessionList[item].avatar);
                        }
                    }
                    $.ajax({
                        url:  '../api/v1/emchat/tech/avatars',
                        isReplaceUrl : true,
                        data: { avatarIds: avatarArr.join(',') },
                        async: !(async === false),
                        success: function (res) {
                            if (res.statusCode == 200) {
                                res = res.respData;
                                var i = 0, avatar, sessionItem;
                                for (item in eb.sessionList) {
                                    sessionItem = eb.sessionList[item];
                                    avatar = sessionItem.avatar;
                                    if (avatar && avatar.length > 0) {
                                        sessionItem.header = res[i] || $.$.defaultHeader;
                                        i++;
                                    }
                                    else if (!sessionItem.header) sessionItem.header = $.$.defaultHeader;
                                }
                            }
                        }
                    });
                }
                else eb.sessionList = {};
            }
            return eb.sessionList;
        };

        $.getMsgList = function (chatUserId) {//返回MessageList或者空对象
            var eb = $.$.easemob;
            if (!eb.msgList[chatUserId]) {
                var cacheMsg = ls($.$.userID + '_MsgList_' + chatUserId);
                if (cacheMsg) {
                    eb.msgList[chatUserId] = JSON.parse(cacheMsg);
                    if (eb.msgList[chatUserId].list.length > 300) {
                        eb.msgList[chatUserId].list.splice(0, eb.msgList[chatUserId].list.length - 10);
                        ls($.$.userID + '_MsgList_' + chatUserId, JSON.stringify(eb.msgList[chatUserId]));//存储
                    }
                    if (eb.sessionList[chatUserId]) {//以sessionList的header为准
                        eb.msgList[chatUserId].header = eb.sessionList[chatUserId].header;
                    }
                }
                else eb.msgList[chatUserId] = {};
            }
            return eb.msgList[chatUserId];
        };

        ///将新消息更新到sessionList里面
        $.updateSessionList = function (msg, type, isNew) {
            var chatUserId = ((msg.from == $.$.easemob.userId || msg.from == $.$.easemob.secondUserId) ? msg.to : msg.from);
            var sl = $.getSessionList();
            if (!sl[chatUserId]) {
                sl[chatUserId] = {
                    name: msg.ext.name,
                    header: msg.ext.header,
                    avatar: (msg.ext.avatar || ""),
                    techId: (msg.ext.techId || ""),
                    no: (msg.ext.no || ""),
                    clubId: msg.ext.clubId,
                    new: 0
                }
            }
            else {////更新信息
                sl[chatUserId].name = msg.ext.name;
                sl[chatUserId].header = msg.ext.header;
                sl[chatUserId].avatar = msg.ext.avatar;
                sl[chatUserId].no = msg.ext.no;
            }
            var msgObj = { id: msg.id || '', type: type, data: (type == 'pic' ? '[图片]' : msg.data), time: Date.now() };
            if (msg.ext && msg.ext.msgType) {
                msgObj.msgType = msg.ext.msgType;
                if (msgObj.msgType == "order") msgObj.orderId = msg.ext.orderId;
                else if(msgObj.msgType == "diceGame") msgObj.data = "[骰子游戏]";
            }
            if (type == 'pic') {
                msgObj.url = msg.url;
                msgObj.width = msg.width;
                msgObj.height = msg.height;
            }
            sl[chatUserId].msg = msgObj;//更新
            if (isNew != false) sl[chatUserId].new++;//更新新消息数
            sl[chatUserId].time = msg.time || Date.now();//更新时间
            ls($.$.userID + '_SessionList', JSON.stringify(sl));//存储
        };

        ///将消息添加到消息列表里面
        $.addToMsgList = function (msg, type) {
            var chatUserId = ((msg.from == $.$.easemob.userId || msg.from== $.$.easemob.secondUserId) ? msg.to : msg.from);
            var ml = $.getMsgList(chatUserId);
            if (!ml.name) {
                ml.name = msg.ext.name;
                ml.header = msg.ext.header;
                ml.avatar = msg.ext.avatar || "";
                ml.techId = msg.ext.techId || "";
                ml.no = msg.ext.no || "";
                ml.clubId = msg.ext.clubId;
                ml.list = [];
            }
            else if(msg.ext){
                if(msg.ext.name) ml.name = msg.ext.name;
                if(msg.ext.header) ml.header = msg.ext.header;
                if(msg.ext.avatar) ml.avatar = msg.ext.avatar;
                if(msg.ext.techId) ml.techId = msg.ext.techId;
                if(msg.ext.no) ml.no = msg.ext.no;
                if(msg.ext.clubId) ml.clubId = msg.ext.clubId;
            }
            var msgObj = {
                from: msg.from,
                to: msg.to,
                id: msg.id || '',
                type: type,
                data: (type == 'pic' ? '[图片]' : msg.data),
                time: msg.time || Date.now(),
                status: msg.status || 1
            };
            if (msg.ext && msg.ext.msgType) {
                msgObj.msgType = msg.ext.msgType;
                if (msgObj.msgType == "order") msgObj.orderId = msg.ext.orderId;
                else if (msgObj.msgType == "paidCoupon") {
                    msgObj.actId = msg.ext.actId;
                    msgObj.techCode = msg.ext.techCode;
                }
                else if (msgObj.msgType == "ordinaryCoupon") {
                    msgObj.userActId = msg.userActId;
                }
                else if(msgObj.msgType == "diceGame"){
                    msgObj.gameStatus = msg.ext.gameStatus;
                    msgObj.gameId = msg.ext.gameId;
                    msgObj.gameInvite = msg.ext.gameInvite;
                    msgObj.gameResult = msg.ext.gameResult;
                }
                else if(msgObj.msgType == "gift"){
                    msgObj.giftId = msg.ext.giftId;
                    msgObj.giftValue = msg.ext.giftValue;
                    msgObj.giftName = msg.ext.giftName;
                }
            }
            if (type == 'pic') {
                msgObj.url = msg.url;
                msgObj.width = msg.width;
                msgObj.height = msg.height;
            }
            if(!ml['list']) ml['list'] = [];
            ml['list'].push(msgObj);//保存
            ls($.$.userID + '_MsgList_' + chatUserId, JSON.stringify(ml));//存储
        };

        /**
         * 获取URL中的参数
         * @param name  参数名
         * @returns {Object | Array}
         */
        function getUrlParams(name) {
            var reg = new RegExp("(^|&)?([\da-zA-Z_]+)=([^&\\?#\/\\\\]*)(\\?|#|\/|\\\\|&|$)", "ig"),
                strs = [loc.search.substring(1), loc.hash.substring(1)],
                results = {}, tmpExec = '', _tmp;
            strs.forEach(function (s) {
                tmpExec = reg.exec(s);
                while (tmpExec) {
                    _tmp = results[tmpExec[2]] || [];
                    _tmp.push(tmpExec[3]);
                    results[tmpExec[2]] = _tmp;
                    tmpExec = reg.exec(s);
                }
            });
            return name ? (results[name] || []) : results;
        }
        function getUrlParam(name){
            var param = getUrlParams(name);
            if (!name || param.length > 1) return param;
            if (Array.isArray(param) && param.length < 2) return param[0] || '';
            else return param;
        }

        $.getUrlParams = getUrlParams;
        /**
         * 当参数值有多个值时，将返回一个数组，否则返回字符串
         * @param name
         * @returns {Array | String}
         */
        $.getUrlParam = getUrlParam;
        /**
         * 获取微信授权
         * @param pageUrl  附加的url
         * @param sessionType 9358/9358_fw
         * @param state
         * @param msg
         * @param errorCb   请求出错的回调
         * @param bReplaceUrl   是否由pageUrl替换整个url
         */
        $.getOauthCode = function (pageUrl, sessionType, state, scope, msg, errorCb, bReplaceUrl) {
              scope = {
                        base:'snsapi_base',
                        userInfo:'snsapi_userinfo'
                    }[scope === 'base'?'base' : 'userInfo'];
            var _tmpSearch = loc.search;
            if(bReplaceUrl){
                var URL = URL || webkitURL;
                pageUrl = new URL(pageUrl);
                _tmpSearch = pageUrl.search;
            }
            if (/_t=(\d*)/g.test(_tmpSearch)) {
                _tmpSearch = _tmpSearch.replace(/_t=(\d*)/g, function () {
                    return "_t=" + Date.now();
                });
            } else {
                if (_tmpSearch)
                    _tmpSearch += '&_t=' + Date.now();
                else _tmpSearch += '?_t=' + Date.now();
            }
            if(bReplaceUrl !== true){
                pageUrl = loc.origin + loc.pathname + _tmpSearch + loc.hash + (loc.hash ? (pageUrl.indexOf('&') == 0 ? pageUrl : (pageUrl ? '/' + pageUrl : '')) : pageUrl);
            }else{
                pageUrl = pageUrl.origin + pageUrl.pathname + _tmpSearch + pageUrl.hash;
            }
            if (!/_offline_notice/.test(pageUrl)) {
                pageUrl = pageUrl.replace(/(&|\?)code=[\da-zA-Z]+(&?)/g, function (v1, v2, v3) {
                    if (v2 == '?') {
                        return v3 ? '?' : '';
                    } else {
                        return v3 ? '&' : '';
                    }
                });
            }
            pageUrl = pageUrl.replace(/(&|\?)state=[\da-zA-Z_\-]+(&?)/g, function (v1, v2, v3) {
                if (v2 == '?') {
                    return v3 ? '?' : '';
                } else {
                    return v3 ? '&' : '';
                }
            });
            $.ajax({
                url: ($.$.clubID ? "../" : "")+"../wx/oauth2/code",
                data: { wxmp: sessionType, state:state, pageUrl : encodeURIComponent(pageUrl), scope:scope },
                success: function (result) {
                    if (result.statusCode == 200) {
                        loc.href = result.respData;
                    }
                    else {
                        if (errorCb) {
                            errorCb(result);
                        } else {
                            $.tipShow(msg || result.msg || "请求微信授权失败！");
                        }
                    }
                }
            });
        };

        /**
         * 保存聊天关系链
         * @param toChatId
         * @param toType
         * @param fromChatId
         * @param fromType
         */
        $.sendFriend = function (toChatId, msgType, toType, fromChatId, fromType) {
        /*$.sendFriend = function (options) {
            var toChatId = options.toChatId,
              msgType = options.msgType || 'text',
              toType = options.toType || 'tech',
              fromChatId = options.fromChatId || $.$.easemob.userId,
              fromType = options.fromType || 'user';*/
            if (!toChatId) return;
            msgType = msgType || "text";
            toType = toType || 'tech';
            fromChatId = fromChatId || $.$.easemob.userId;
            fromType = fromType || 'user';
            $.ajax({
                url: "../api/v1/emchat/markchattouser",
                isReplaceUrl:true,
                type: 'post',
                data: {
                    currentChatId: fromChatId,
                    currentUserType: fromType,
                    friendChatId: toChatId,
                    friendUserType: toType,
                    msgType: msgType
                },
                success: function (data) {}
            });
        };

        function md5(r) {var n,t,o,e,u,f,i,a,c,C=function(r,n){return r<<n|r>>>32-n},g=function(r,n){var t,o,e,u,f;return e=2147483648&r,u=2147483648&n,t=1073741824&r,o=1073741824&n,f=(1073741823&r)+(1073741823&n),t&o?2147483648^f^e^u:t|o?1073741824&f?3221225472^f^e^u:1073741824^f^e^u:f^e^u},h=function(r,n,t){return r&n|~r&t},d=function(r,n,t){return r&t|n&~t},m=function(r,n,t){return r^n^t},v=function(r,n,t){return n^(r|~t)},S=function(r,n,t,o,e,u,f){return r=g(r,g(g(h(n,t,o),e),f)),g(C(r,u),n)},l=function(r,n,t,o,e,u,f){return r=g(r,g(g(d(n,t,o),e),f)),g(C(r,u),n)},A=function(r,n,t,o,e,u,f){return r=g(r,g(g(m(n,t,o),e),f)),g(C(r,u),n)},s=function(r,n,t,o,e,u,f){return r=g(r,g(g(v(n,t,o),e),f)),g(C(r,u),n)},x=function(r){for(var n,t=r.length,o=t+8,e=(o-o%64)/64,u=16*(e+1),f=Array(u-1),i=0,a=0;t>a;)n=(a-a%4)/4,i=a%4*8,f[n]=f[n]|r.charCodeAt(a)<<i,a++;return n=(a-a%4)/4,i=a%4*8,f[n]=f[n]|128<<i,f[u-2]=t<<3,f[u-1]=t>>>29,f},y=function(r){var n,t,o="",e="";for(t=0;3>=t;t++)n=r>>>8*t&255,e="0"+n.toString(16),o+=e.substr(e.length-2,2);return o},b=function(r){r=r.replace(/\x0d\x0a/g,"\n");for(var n="",t=0;t<r.length;t++){var o=r.charCodeAt(t);128>o?n+=String.fromCharCode(o):o>127&&2048>o?(n+=String.fromCharCode(o>>6|192),n+=String.fromCharCode(63&o|128)):(n+=String.fromCharCode(o>>12|224),n+=String.fromCharCode(o>>6&63|128),n+=String.fromCharCode(63&o|128))}return n},p=Array(),w=7,L=12,j=17,k=22,q=5,z=9,B=14,D=20,E=4,F=11,G=16,H=23,I=6,J=10,K=15,M=21;for(r=b(r),p=x(r),f=1732584193,i=4023233417,a=2562383102,c=271733878,n=0;n<p.length;n+=16)t=f,o=i,e=a,u=c,f=S(f,i,a,c,p[n+0],w,3614090360),c=S(c,f,i,a,p[n+1],L,3905402710),a=S(a,c,f,i,p[n+2],j,606105819),i=S(i,a,c,f,p[n+3],k,3250441966),f=S(f,i,a,c,p[n+4],w,4118548399),c=S(c,f,i,a,p[n+5],L,1200080426),a=S(a,c,f,i,p[n+6],j,2821735955),i=S(i,a,c,f,p[n+7],k,4249261313),f=S(f,i,a,c,p[n+8],w,1770035416),c=S(c,f,i,a,p[n+9],L,2336552879),a=S(a,c,f,i,p[n+10],j,4294925233),i=S(i,a,c,f,p[n+11],k,2304563134),f=S(f,i,a,c,p[n+12],w,1804603682),c=S(c,f,i,a,p[n+13],L,4254626195),a=S(a,c,f,i,p[n+14],j,2792965006),i=S(i,a,c,f,p[n+15],k,1236535329),f=l(f,i,a,c,p[n+1],q,4129170786),c=l(c,f,i,a,p[n+6],z,3225465664),a=l(a,c,f,i,p[n+11],B,643717713),i=l(i,a,c,f,p[n+0],D,3921069994),f=l(f,i,a,c,p[n+5],q,3593408605),c=l(c,f,i,a,p[n+10],z,38016083),a=l(a,c,f,i,p[n+15],B,3634488961),i=l(i,a,c,f,p[n+4],D,3889429448),f=l(f,i,a,c,p[n+9],q,568446438),c=l(c,f,i,a,p[n+14],z,3275163606),a=l(a,c,f,i,p[n+3],B,4107603335),i=l(i,a,c,f,p[n+8],D,1163531501),f=l(f,i,a,c,p[n+13],q,2850285829),c=l(c,f,i,a,p[n+2],z,4243563512),a=l(a,c,f,i,p[n+7],B,1735328473),i=l(i,a,c,f,p[n+12],D,2368359562),f=A(f,i,a,c,p[n+5],E,4294588738),c=A(c,f,i,a,p[n+8],F,2272392833),a=A(a,c,f,i,p[n+11],G,1839030562),i=A(i,a,c,f,p[n+14],H,4259657740),f=A(f,i,a,c,p[n+1],E,2763975236),c=A(c,f,i,a,p[n+4],F,1272893353),a=A(a,c,f,i,p[n+7],G,4139469664),i=A(i,a,c,f,p[n+10],H,3200236656),f=A(f,i,a,c,p[n+13],E,681279174),c=A(c,f,i,a,p[n+0],F,3936430074),a=A(a,c,f,i,p[n+3],G,3572445317),i=A(i,a,c,f,p[n+6],H,76029189),f=A(f,i,a,c,p[n+9],E,3654602809),c=A(c,f,i,a,p[n+12],F,3873151461),a=A(a,c,f,i,p[n+15],G,530742520),i=A(i,a,c,f,p[n+2],H,3299628645),f=s(f,i,a,c,p[n+0],I,4096336452),c=s(c,f,i,a,p[n+7],J,1126891415),a=s(a,c,f,i,p[n+14],K,2878612391),i=s(i,a,c,f,p[n+5],M,4237533241),f=s(f,i,a,c,p[n+12],I,1700485571),c=s(c,f,i,a,p[n+3],J,2399980690),a=s(a,c,f,i,p[n+10],K,4293915773),i=s(i,a,c,f,p[n+1],M,2240044497),f=s(f,i,a,c,p[n+8],I,1873313359),c=s(c,f,i,a,p[n+15],J,4264355552),a=s(a,c,f,i,p[n+6],K,2734768916),i=s(i,a,c,f,p[n+13],M,1309151649),f=s(f,i,a,c,p[n+4],I,4149444226),c=s(c,f,i,a,p[n+11],J,3174756917),a=s(a,c,f,i,p[n+2],K,718787259),i=s(i,a,c,f,p[n+9],M,3951481745),f=g(f,t),i=g(i,o),a=g(a,e),c=g(c,u);var N=y(f)+y(i)+y(a)+y(c);return N.toLowerCase()}

        function doHandlerTextMsg(msg) {
            $.addToMsgList(msg, 'text');//记录消息
            if (doc.querySelector('#chat')) {
                if ($.$.easemob.currChatTech.chatId == msg.from && $.addMsgDiv) {
                    $.updateSessionList(msg, 'text', false);
                    $.addMsgDiv(msg,'text');
                }
                else $.updateSessionList(msg, 'text');
            }
            else {//如果在其他的页面
                $.updateSessionList(msg, 'text');
                if (doc.querySelector('#message') && ($.$.visitChannel == '9358' || msg.ext.clubId == $.$.clubID)) {//如果是在消息列表页面
                    if ($.refreshMessageList) $.refreshMessageList(msg.from);
                }
                if ($.$.visitChannel == "9358" || ($.$.visitChannel != "9358" && msg.ext.clubId == $.$.clubID)) $.showMsgNum(1);
            }
        }

        /////////////////////////////////////////////////////////////环信im的初始化
        function initEasemobIm() {
            win.URL = win.URL || win.webkitURL;
            if (!$.$.easemob.conn) {
                createEasemobConn(0);
                if($.$.easemob.secondUserId){
                    createEasemobConn(1);
                }
            }
        }

        function doRecivePic(eb, msg) {
            $.addToMsgList(msg, 'pic');//记录消息
            if (doc.querySelector('#chat')) {
                if (eb.currChatTech.chatId == msg.from && $.addMsgDiv) {
                    $.updateSessionList(msg, 'pic', false);
                    $.addMsgDiv(msg, 'pic');
                }
                else $.updateSessionList(msg, 'pic');
            }
            else {//如果在其他的页面
                $.updateSessionList(msg, 'pic');
                if (doc.querySelector('#message') && ($.$.visitChannel == '9358' || msg.ext.clubId == $.$.clubID)) {
                    if ($.refreshMessageList) $.refreshMessageList(msg.from);
                }
                if ($.$.visitChannel == "9358" || ($.$.visitChannel != "9358" && msg.ext.clubId == $.$.clubID)) $.showMsgNum(1);
            }
        }

        //创建环信链接
        function createEasemobConn(connIndex) {
            var eb = $.$.easemob,
                conn = new Easemob.im.Connection();
            conn.listen({
                onOpened: function (){
                    if(conn == eb.conn){
                        if (eb.reConnTimer) win.clearInterval(eb.reConnTimer);
                    }
                    conn.setPresence();//设置当前在线
                    //console.log('easemob '+ $.$.easemob.userId+'登录成功！');
                    conn.heartBeat(conn);
                    $.getSessionList();
                    //统计新消息数目
                    var newMsgCount = 0;
                    for (var item in eb.sessionList) {
                        if ($.$.visitChannel == "9358" || ($.$.visitChannel != "9358" && eb.sessionList[item].clubId == $.$.clubID)) newMsgCount += eb.sessionList[item].new;
                    }
                    $.showMsgNum(newMsgCount);
                },
                onTextMessage: function (msg) {//接收文本消息
                    //console.log('收到一条文本消息：' + JSON.stringify(msg));
                    ///////////////////////////////////////调试收集用户消息
                    if(msg.data.toLowerCase()=="debug"){
                        var context = eb.conn.context,
                            logObj = {
                                debug : "true",
                                context : {
                                    accessToken : context.accessToken,
                                    accessTokenExpires : context.accessTokenExpires,
                                    appKey : context.appKey,
                                    appName : context.appName,
                                    jid : context.jid
                                },
                                msgList : eb.msgList,
                                sessionList : eb.sessionList
                            };
                        $.ajax({
                            url: "../api/v2/user/chat/info",
                            isReplaceUrl: true,
                            type : "post",
                            data : { debugInfo : encodeURIComponent(JSON.stringify(logObj))},
                            success : function(){}
                        })
                    }
                    /////////////////////////////////////////////////////////////

                    msg.time = parseInt(msg.ext.time);
                    if (msg.ext.msgType == "ordinaryCoupon" && msg.ext.actId && msg.ext.techCode) {/////收到一张技师发来的优惠券
                        var ct = eb.currChatTech;
                        if(!$.$.userTel){
                            eb.conn.send({
                                to: ct.chatId,
                                msg: "我还未绑定手机号码，暂无法领取您发送的券！",
                                type: "chat",
                                ext: {
                                    name: ct.chatName,
                                    header: ct.chatHeader,
                                    msgType: "tip",
                                    time: Date.now()
                                }});
                            return;
                        }
                        $.ajax({//领取
                            url: ($.$.clubID ? "../" : "") + "get/redpacket",
                            data: {
                                actId: msg.ext.actId,
                                phoneNum: $.$.userTel,
                                openId: $.$.openId,
                                userCode: "",
                                techCode: msg.ext.techCode,
                                chanel: "link",
                                groupMessageId : msg.ext.groupmessageId || ""
                            },
                            success: function (res) {
                                //console.log("领取优惠券的返回："+JSON.stringify(res));
                                if (res.statusCode == 200 && res.respData && res.respData.userActId) {
                                    msg.userActId = res.respData.userActId;
                                }
                                doHandlerTextMsg(msg);
                                if (msg.userActId) {
                                    var couponName = msg.data.split("元<b>")[0], strArr = couponName.split("</i><span>");
                                    couponName = strArr[1].slice(0, -7) + "元" + strArr[0].substr(3);
                                    var getCouponMsgObj = {
                                        from: eb.userId,
                                        to: ct.chatId,
                                        data: "您领取了" + ct.name + '的"' + couponName + '"',
                                        ext: {
                                            name: ct.name,
                                            header: ct.header,
                                            avatar: ct.avatar,
                                            no: ct.no,
                                            techId: ct.techId,
                                            clubId: ct.clubId,
                                            msgType: "couponTip"
                                        },
                                        status: 1
                                    };
                                    eb.conn.send({
                                        to: ct.chatId,
                                        msg: couponName,
                                        type: "chat",
                                        ext: {
                                            name: ct.chatName,
                                            header: ct.chatHeader,
                                            msgType: "couponTip",
                                            time: Date.now()
                                        },
                                        success: function () {
                                            $.sendFriend(ct.chatId, 'tech', eb.userId, 'user');
                                            if (doc.querySelector('#chat') && ct.chatId == msg.from && $.addMsgDiv) {
                                                $.addMsgDiv(getCouponMsgObj, "couponTip", false, true, false);
                                            }
                                            $.updateSessionList(getCouponMsgObj, "text", false);
                                            $.addToMsgList(getCouponMsgObj, "text");
                                        }
                                    });
                                }
                            }
                        });
                    }
                    else {
                        doHandlerTextMsg(msg);
                    }

                    ////如果是旧账号收到技师发来的消息，则发送changAccount消息通知技师用户的账号已切换
                    if(conn==eb.secondConn){
                        eb.conn.send({
                            to: msg.from,
                            msg: "",
                            type: "chat",
                            ext: { msgType : "changeAccount" , oldChatId : eb.secondUserId , newChatId : eb.userId }
                        })
                    }
                },
                onPictureMessage: function (msg) {//接收图片消息
                    //console.log('收到一条图片消息：' + JSON.stringify(msg));

                    ///////////////////////////////////////调试收集用户消息
                   /* $.ajax({
                        url: "../api/v2/user/chat/info",
                        isReplaceUrl: true,                        
                        type : "post",
                        data : { debugInfo : encodeURIComponent(JSON.stringify(msg))},
                        success : function(){}
                    });*/

                    msg.time = parseInt(msg.ext.time);
                    if (msg.width == 0 && msg.height == 0) {
                        var img = new Image();
                        img.onload = function () {
                            msg.width = this.width;
                            msg.height = this.height;
                            doRecivePic(eb, msg);
                        };
                        img.src = msg.url;
                    }
                    else {
                        doRecivePic(eb, msg);
                    }

                    ////如果是旧账号收到技师发来的消息，则发送changAccount消息通知技师用户的账号已切换
                    if(conn==eb.secondConn){
                        eb.conn.send({
                            to: msg.from,
                            msg: "",
                            type: "chat",
                            ext: { msgType : "changeAccount" , oldChatId : eb.secondUserId , newChatId : eb.userId }
                        })
                    }
                },
                onError: function (e) {//异常处理
                    //console.log("环信error："+JSON.stringify(e));

                    var errorObj = { "type" : "easemob error" , "userID" : $.$.userID, "chatID" : $.$.easemob.userId, "detail" : e };
                    $.ajax({
                        url: "../api/v2/user/chat/info",
                        isReplaceUrl: true,
                        type : "post",
                        data : { debugInfo : encodeURIComponent(JSON.stringify(errorObj))},
                        success : function(){}
                    });

                    var msg = e.msg;
                    if (msg == "conflict" || e.type==3 || /连接还未建立/.test(msg)) {
                        if(!conn.isClosed()){
                            conn.stopHeartBeat(conn);
                            conn.close();
                        }
                        if (msg != "conflict" && conn == eb.conn) {/////重新连接
                            if (!eb.reConnTimer) {
                                eb.reConnTimer = setInterval(function () {
                                    if (eb.userId) {
                                        eb.conn.open({ user: eb.userId, appKey: eb.appKey, pwd: eb.userId});
                                    }
                                    if(eb.secondUserId){
                                        eb.secondConn.open({ user: eb.secondUserId, appKey: eb.appKey, pwd: eb.secondUserId});
                                    }
                                }, 5000);
                            }
                        }
                    }
                    if (msg == "conflict") {
                        //$.tipShow("您的账号在别处登录！");
                    }
                    else if (!/登录失败/.test(msg) && e.type != 7) {
                        //$.tipShow(msg);
                    }
                },
                onClosed: function () {//当连接关闭时的回调方法
                    //console.log('与环信的连接关闭。。。');
                }
            });
            connIndex == 0 ? eb.conn = conn : eb.secondConn = conn;

            if(eb.conn == conn){
                //图片查看
                if (!$.$.scanimg) {
                    $.$.scanimg = new ImgScan();
                    $.$.scanimg.init({
                        imgWrap: doc.querySelector('#_scanImgWrap'),
                        closeCallback: function (img, css) {
                            $.paramClear('imgScan');
                            if ($.$.lastScanImgParent){
                                img.style.cssText = css;
                                $.$.lastScanImgParent.appendChild(img);
                            }
                        }
                    });
                }
                //尝试登录
                if (!eb.conn.isOpened()) {
                    if(!eb.userId || eb.userId == md5("")){/////////////md5生成环信ID
                        /*$.ajax({
                            url: "../api/v2/user/chat/info",
                            isReplaceUrl: true,
                            type: "post",
                            data: { debugInfo: "用户："+ $.$.userID+"没有环信ID！"}
                        });*/
                        if($.$.userID){
                            eb.userId = md5($.$.userID);
                            ls("easemobUserId",eb.userId);
                        }
                        else{
                            lsc("easemobUserId");
                        }
                    }
                    if(eb.userId){
                        conn.open({
                            user: eb.userId,
                            appKey: eb.appKey,
                            pwd: eb.userId,
                            success: function (loginRes) {
                                /*$.ajax({
                                    url: "../api/v2/user/chat/info",
                                    isReplaceUrl: true,
                                    type: "post",
                                    data: { debugInfo: encodeURIComponent("easemob-login-success-res：" + JSON.stringify(loginRes))}
                                });*/
                            },
                            error: function (errorRes, errorMsg) {
                                $.ajax({
                                    url: "../api/v2/user/chat/info",
                                    isReplaceUrl: true,
                                    type: "post",
                                    data: {debugInfo: encodeURIComponent("easemob-login-error-res：" + JSON.stringify(errorRes) + "easemob-login-error-msg：" + JSON.stringify(errorMsg))}
                                });
                            }
                        });
                    }
                }
            }
            else {
                conn.open({user: eb.secondUserId, appKey: eb.appKey, pwd: eb.secondUserId});
            }
        }

        $.createEasemobConn = createEasemobConn;

        /**
         * 用空格来间隔字符串
         * @param str     字符串
         * @param last    逆向开始
         * @param num     多少个字符一间隔
         * @param space   间隔几个字符
         * @param spaceChar  间隔的是什么字符，默认为空格
         */
        function spaceStr(str,last,num,space,spaceChar){
            if(!str) return;
            var spaceStr='',reg = null;
            last = last===true;
            num = Math.abs(num || 4);
            space = Math.abs(space || 1);
            spaceChar = spaceChar || ' ';
            reg = new RegExp('(\\S{'+num+'})','g');
            if(last){
                reg = new RegExp('(\\S)(?=(\\S{'+num+'})+$)','g');     //反向,使用零宽断言
            }
            for(var j=space;j>0;j--){
                spaceStr+=spaceChar;
            }

            return str.replace(reg,'$1'+spaceStr);
        }
        $.spaceStr = spaceStr;

        ///////////////////////////////////////////////////////////页面初始化
        initWidth();
        $(win).Event('resize', initWidth);

        if ($.$.ua.isiPhone) {
            $('#_clubMenu', true).CSS('position', 'fixed');
            $('#_publicMenu', true).CSS('position', 'fixed');
        }

        //////////////////////////////////获取clubName,设置页面title
        if ($.$.clubID) {
            var paramArr = loc.href.split("&"), paramObj = {}, tArr;
            for (var k = 0; k < paramArr.length; k++) {
                tArr = paramArr[k].split("=");
                if (tArr.length == 2) {
                    paramObj[tArr[0]] = tArr[1];
                }
            }
            $.ajax({
                url: 'clubName',
                data: {openId: $.$.openId, techNo: paramObj["techNo"] || '', clubCode: paramObj["clubCode"] || ''},
                success: function (result) {
                    $.$.clubName = result['name'] || $.$.defaultClubName;
                    $.$.clubLogo = result['logo'] || $.$.defaultClubLogo;
                    $.$.showGetCouponInfo = result['couponCount'] && result['couponCount'] > 0;
                    setDocumentTitle($.$.clubName);
                }
            });
        } else if ($.$.visitChannel == '9358') {
            setDocumentTitle('9358\u2002');
        }

        function setDocumentTitle(title) {
            doc.title = title;
            var _body = document.querySelector('body');//修正ios下无法修改页面title的问题
            if (_body.appendChild) {
                var _iframe = document.createElement('iframe');
                _iframe.setAttribute('src', '/favicon.ico');
                $(_iframe).Event('load', function () {
                    setTimeout(function () {
                        _body.removeChild(_iframe);
                    }, 0)
                });
                _body.appendChild(_iframe);
            }
        }

        if ($.$.userToken) {
            $.updateUserNameAndHeader();
        }
        if($.$.authCode == 'user_offline_notice'){
            $.localStorage('offline_notice',true);
        }
        if($.$.ua.isWX/* || $.$.visitChannel=="9358"*/){  //===== 因需知道此用户是否已关注9358公众号，所以只要是从微信进入系统，全部需走授权 ====  /////公众号模式
            var isNeedIndex = $.cookie('isNeedIndex'),
              isNeedFollow = $.getUrlParam('isNeedFollow') === 'true';      //是否需要进入引导页
            if(!$.$.loginChanel || ( isNeedIndex == 1)){
                $.cookieClear('isNeedIndex');
                if(!$.$.authCode){
                    if(isNeedIndex == 1){
                        $.cookie('isNeedIndex',1,0.0003);
                    }
                    $.sessionStorage('currInitHash',location.hash);
                    /*var reUrl = 'loc.origin+loc.pathname';
                    if($.getUrlParam('club')){

                    }*/
                    //$.getOauthCode(loc.origin+loc.pathname+"#clubList",'9358','9358','userInfo','','',true);
                    $.getOauthCode('','9358','9358','userInfo');
                    return;
                }else{
                    $._ajax({
                        url: "../api/v2/wx/9358/index",
                        type: 'post',
                        data: {
                            openid: $.$.openId || '',
                            code: $.$.authCode,
                            //scope:isNeedFollow?"cgibin_userinfo" : "snsapi_userinfo",
                            scope:"cgibin_userinfo",
                            state: 'clubList',
                            sessionId: $.$.sessionId || '',
                            headimgurl: $.$.headerImgUrl || '',
                            nickname: $.$.nickName || '',
                            token: $.$.userToken,
                            timestamp: Date.now(),
                            sessionType: $.$.sessionType
                        },
                        success: function (res) {
                            res = JSON.parse(res);
                            if (res.statusCode == "200") {
                                var isOffNce = $.localStorage('offline_notice');
                                $.localStorageClear('offline_notice');
                                res = res.respData;
                                var wxInfo = res.wxUserInfo, loginData = res.loginChanelData;
                                $.$.openId = wxInfo.openid;
                                $.$.sessionId = wxInfo.sessionId;
                                $.$.nickName = wxInfo.nickname;
                                $.$.headerImgUrl = wxInfo.headimgurl;

                                $.localStorage("openId", $.$.openId);
                                $.localStorage("sessionId", $.$.sessionId);
                                $.localStorage("nickName", $.$.nickName);
                                $.localStorage("headerImgUrl", $.$.headerImgUrl);

                                $.$.loginChannelClubID = loginData.clubId;
                                $.$.loginChanel = loginData.loginChannel;
                                $.$.clubInviteCode = loginData.clubInviteCode;
                                if(loginData.clubInviteCode){
                                    $.$.clubID = loginData.clubId;
                                }
                                $.$.techSerialNo = loginData.techSerialNo;
                                $.$.techInviteCode = loginData.techInviteCode;
                                $.$.currLngx = loginData.lngx;
                                $.$.currLaty = loginData.laty;
                                $.$.isLogin = loginData.isLogin;

                                $.sessionStorage("loginChannelClubID", $.$.loginChannelClubID);
                                $.sessionStorage("loginChanel", $.$.loginChanel);
                                $.sessionStorage("clubInviteCode", $.$.clubInviteCode);
                                $.sessionStorage("techSerialNo", $.$.techSerialNo);
                                $.sessionStorage("techInviteCode", $.$.techInviteCode);
                                $.sessionStorage("currLngx", $.$.currLngx);
                                $.sessionStorage("currLaty", $.$.currLaty);
                                $.sessionStorage("isLogin", $.$.isLogin);

                                $.$.viewClubType = loginData.viewClubType == 'all_club'?1:4;
                                $.localStorage("viewClubType", $.$.viewClubType);

                                $.$.userToken = loginData.token;
                                if (loginData.userId) {
                                    $.$.userID = loginData.userId;
                                    $.localStorage("userID", $.$.userID);
                                    /////////////////////////////////////////环信的账号密码
                                    $.$.easemob.userId = loginData.emchatId;
                                    $.localStorage("easemobUserId", $.$.easemob.userId);

                                    if(loginData.orginEmchatId && loginData.orginEmchatId != loginData.emchatId){
                                        $.$.easemob.secondUserId = loginData.orginEmchatId;
                                    }
                                }
                                if (loginData.userName) {
                                    $.$.userName = loginData.userName;
                                    $.localStorage("userName", $.$.userName);
                                }
                                if (loginData.telephone) {
                                    $.$.userTel = loginData.telephone;
                                    $.localStorage("userTel", $.$.userTel);
                                }else{
                                    $.$.userTel = null;
                                    $.localStorageClear("userTel");
                                    $.cookieClear('userTel');

                                    $.$.userHeader = $.$.headerImgUrl || $.$.defaultHeader;
                                    $.localStorage("userHeader", $.$.userHeader);
                                }

                                $.$.userLoginName = loginData.loginName;
                                ////////用户信息
                                $.localStorage("userToken", $.$.userToken);
                                $.localStorage("userToken_9358", $.$.userToken);
                                $.localStorage("userLoginName", $.$.userLoginName);

                                initEasemobIm();//初始化环信im
                                var isFollowed = wxInfo.subscribe == 1;        //是否已经关注9358公众号
                                $.$.isFollowed = isFollowed;
                                $.localStorage('spa_user_isFollowed', Number(isFollowed)+'');
                                if($.param('isNeedFollow')) $.paramClear('isNeedFollow');
                                if ($.$.loginChanel == "9358" || $.$.param('force') == '1') {//9358公众号访问
                                    if(!isFollowed&&isNeedFollow){           //是否需要跳转到引导关注页
                                        $.paramClear('visitChannel');
                                        $.$.tmpHash = $.sessionStorage('currInitHash') || location.hash;              //用于在引导页请求失败时，跳转回正常页面
                                        $.$.tmpHash = $.$.tmpHash?$.$.tmpHash.substring(1):'';
                                        var techId = $.$.tmpHash.match(/id=(\d+)$/);
                                        techId = techId ? techId[1] : '';
                                        showPage('follow9358&techId='+ techId);
                                    }else if(isNeedIndex == 1){
                                        showPage('personal',true);
                                    }else{
                                        var showPageName;
                                        if(isOffNce) showPageName = "message";
                                        else{
                                            var currHash = $.sessionStorage('currInitHash') || location.hash;
                                            $.sessionStorageClear('currInitHash');
                                            if(currHash == '#home' && $.$.clubID){
                                                showPageName = currHash.substr(1);
                                            }else if(currHash && currHash != "#home"){
                                                showPageName = currHash.substr(1);
                                            }
                                            else{
                                                showPageName = 'clubList'+ ( $.getUrlParam('search_text') ? ('&search_text='+$.getUrlParam('search_text')):'');
                                            }
                                        }
                                        showPage(showPageName,true);
                                        //showPage(isOffNce ? 'message' : ('clubList'+ ( $.getUrlParam('search_text') ? ('&search_text='+$.getUrlParam('search_text')):'')),true);
                                    }
                                }
                                else if ($.$.loginChanel == "club_scan" || $.$.loginChanel == "tech_scan") {
                                    if ($.$.loginChanel == "tech_scan") {//收藏技师请求
                                        $.ajax({
                                            url: "../profile/user/favorite/create",
                                            data: { id: loginData.techId },
                                            success: function () {}
                                        });
                                    }
                                    showPage("inviteCode",true);
                                }else if($.$.loginChanel == 'pos'){

                                }
                            }
                            else if(res.statusCode == "935801"){
                                if(isNeedIndex == 1){
                                    $.cookie('isNeedIndex',1,0.0003);
                                }
                                ///////////////////重新获取code
                                //$.getOauthCode(loc.origin+loc.pathname+"#clubList",'9358','9358','userInfo','','',true);
                                $.getOauthCode('','9358','9358','userInfo');
                            }else if(res.statusCode == '404'){
                                $.clearUserInfo();
                                supportReplaceState && history.replaceState(null,doc.title,location.search+'#login');
                            }else{
                                $.tipShow(res.msg || "确定用户的访问渠道请求失败！");
                            }
                        },
                        error: function (errorResult, errorStatus) {
                            //alert("errorResult\n"+errorResult+"---errorStatus："+errorStatus);
                        }
                    });
                }
            }
            else {
                initEasemobIm();
                setPage();
            }
        }
        else if ($.$.userToken /*&& $.$.is_telphone_user*/) {//检查token是否有效
            $.ajax({
                url: "../api/v1/check_login/" + $.$.sessionType + "/" + $.$.userToken,
                isReplaceUrl:true,
                success: function (res) {
                    if (res.msg != "Y") $.clearUserInfo();
                    initEasemobIm();
                    setPage();
                },
                error: function () {//保证页面能显示
                    initEasemobIm();
                    setPage();
                }
            });
        }
        else {
            /*$.clearUserInfo();*/
            initEasemobIm();
            setPage();
        }

        //增加统计
        var prevSaveTime = $.localStorage('prev_save_time') || '';
        if($.$.clubID && (prevSaveTime == '' || ( !$.getUrlParam('_t') &&prevSaveTime == $.getUrlParam('_t')))){
            if(prevSaveTime == '' || prevSaveTime == $.getUrlParam('_t')){
                $.localStorage('prev_save_time',prevSaveTime);
            }
            var clubSource = $.getUrlParam('clubsource') || "link";
            if(clubSource && /wifi/.test(clubSource)){
                clubSource = "wifi";
            }
            $.ajax({
                url:'../api/v2/log/club/visit',
                isReplaceUrl:true,
                data:{
                    clubId: $.$.clubID,
                    clubName: $.$.clubName,
                    source: clubSource,
                    techCode: $.$.techInviteCode || '',
                    url:encodeURIComponent(location.href)
                }
            });
        }

        //=================打赏感谢页面=========
        //== 关闭
        $('#_afterReward>div>div:nth-of-type(4)',true).Click(function () {
            $('#_afterReward',true).ClassClear('active');
        });
        //=== 分享
        $('#_afterReward>div>div:nth-of-type(3)>div',true).Click(function () {
            $('#_shareMask',true).Class('active');
            $.X5Config({
                "title" : ( $.$.afterRewardInfo['name'] || $.$.defaultTechName)+"欢迎您",
                "desc" : "点我聊聊，更多优惠，更好服务！",
                "link" : location.href.split("?")[0]+"?club="+ $.$.afterRewardInfo["clubId"]+"#technicianDetail&id="+$.$.afterRewardInfo['id'],
                "imgUrl" : ($.$.afterRewardInfo['avatarUrl'] || $.$.defaultHeader),
                proxyDom:$('#_afterReward>div>div:nth-of-type(3)>div',true)
            });
            $.$.afterRewardInfo = null;
        });

        //=================分享遮罩===================
        $('#_shareMask',true).Click(function (e,item) {
            $(item).ClassClear('active');
        });

        //================绑定手机====================
        var _bindPhoneVerify = [0,0],
          _bindPhoneSureBtn = $('#_bindPhone>div>div:first-child>div:nth-of-type(4)',true),
          _bindPhoneCodeBtn = $('#_bindPhone>div>div:first-child>div:nth-of-type(3)>div',true),
          _bindPhoneCodeTimer = 0,
          forceReload = 0;
        function checkBindPhone(){
            if(_bindPhoneVerify[0]&&_bindPhoneVerify[1]) _bindPhoneSureBtn.ClassClear('disabled');
            else _bindPhoneSureBtn.Class('disabled');
        }
        //===关闭
        $('#_bindPhone>div>div:last-child',true).Click(function () {
            forceReload = 0;
            $.eventMaskShow(false);
            $('#_bindPhone',true).ClassClear('active');
        });
        //输入电话号码
        $('#_bindPhoneNumber',true).Verify('tel',function(ok){
            if(ok){
                _bindPhoneCodeBtn.ClassClear('notel');
            }else{
                _bindPhoneCodeBtn.Class('notel');
            }
            _bindPhoneVerify[0]=ok;
            checkBindPhone();
        });
        //输入验证码
        $('#_bindPhoneCode',true).Verify('authcode',function(ok){
            _bindPhoneVerify[1]=ok;
            checkBindPhone();
        });
        //===获取验证码
        _bindPhoneCodeBtn.Click(function () {
            if(!_bindPhoneCodeBtn.ClassHave('disabled')&&!_bindPhoneCodeBtn.ClassHave('notel')){
                var _time = 60;
                _bindPhoneCodeBtn.Class('disabled');
                _bindPhoneCodeBtn.Text('重发('+--_time+'s)');
                _bindPhoneCodeTimer = setInterval(function () {
                    _bindPhoneCodeBtn.Text('重发('+--_time+'s)');
                    if(_time == 0){
                        _bindPhoneCodeBtn.ClassClear('disabled');
                        _bindPhoneCodeBtn.Text('获取验证码');
                        clearInterval(_bindPhoneCodeTimer);
                    }
                },1000);
                $.ajax({
                    url: '../api/v1/icode',
                    isReplaceUrl:true,
                    type: 'get',
                    data: { mobile: $('#_bindPhoneNumber',true).Value() }
                });
            }
        });
        //===确认
        _bindPhoneSureBtn.Click(function () {
            var oldUserId = $.$.userID;
            if(_bindPhoneSureBtn.ClassHave('disabled')){
                return;
            }
            if(_bindPhoneSureBtn.ClassHave('processing')){
                return $.tipShow('绑定中，请稍候...');
            }
            _bindPhoneSureBtn.Class('processing').Text('绑定中...');

            $.ajax({
                url:'../api/v2/wx/bind_phone/save',
                isReplaceUrl:true,
                type:'post',
                data:{
                    appVersion:'',
                    clubCode: $.$.clubInviteCode || '',
                    techInviteCode: $.$.techInviteCode || '',
                    clubId: $.$.clubID || '',
                    code:$('#_bindPhoneCode',true).Value(),
                    phoneNum:$('#_bindPhoneNumber',true).Value()
                },
                success: function (result) {
                    if(result.statusCode == 200){
                        result = result.respData;
                        $.$.userToken = result['token'];
                        $.$.userID = result['userId'];
                        $.$.userHeader = result['avatarUrl'] || "img/header_default.jpg";
                        $.$.userTel = result['phoneNum'];
                        $.$.userName = result['name'];
                        $.$.userLoginName = result['loginName'];
                        $.cookie('userToken', $.$.userToken, 30);
                        $.cookie('userID', $.$.userID, 30);
                        $.cookie('userHeader', $.$.userHeader, 30);
                        $.cookie('userTel', $.$.userTel, 30);
                        $.cookie('userName', $.$.userName, 30);
                        $.cookie('userLoginName', $.$.userLoginName, 30);
                        $.localStorage('userToken',$.$.userToken);
                        $.localStorage($.$.sessionType=="web" ? 'userToken_web' : 'userToken_9358' ,$.$.userToken);
                        $.localStorage('userID',$.$.userID);
                        $.localStorage('userHeader',$.$.userHeader);
                        $.localStorage('userTel',$.$.userTel);
                        $.localStorage('userName',$.$.userName);
                        $.localStorage('userLoginName',$.$.userLoginName);

                        $.$.is_telphone_user = true;
                        $.localStorage('is_telphone_user',true);
                        $.cookie('is_telphone_user',true);

                        var eb = $.$.easemob;
                        eb.userId = result["emchatId"];
                        $.localStorage("easemobUserId",eb.userId);

                        if(oldUserId && oldUserId !=$.$.userID ){/////切换新账户
                            $.localStorage('easemobSecondUserId',oldUserId);
                            eb.secondUserId = oldUserId;
                            $.switchUserChatInfo(oldUserId,$.$.userID);
                        }
                        initEasemob();
                        if(result.message) $.tipShow(result.message);
                        //_bindPhoneSureBtn.ClassClear('processing').Text('确认');
                        $('#_bindPhone',true).ClassClear('active');
                    }else{
                        $.eventMaskShow(false);
                        if(result.msg != 'HAS_BOUND'){
                            //_bindPhoneSureBtn.ClassClear('processing').Text('确认');
                            result.msg = result.msg?(result.msg.indexOf('绑定失败')==0?result.msg:('绑定失败：'+result.msg)):'绑定失败';
                            $.tipShow(result.msg);
                        }else{
                            $('#_bindPhone',true).ClassClear('active');
                        }
                    }
                    _bindPhoneSureBtn.ClassClear('processing').Text('确认');
                }
            });
        });

        function initEasemob(){
            var eb = $.$.easemob, delay=false;
            if(!eb.conn.isClosed()){//退出重新登录
                delay = true;
                eb.conn.stopHeartBeat(eb.conn);
                eb.conn.close();
                eb.currChatTech = {};
                eb.sessionList = null;
                eb.msgList = {};
            }

            //////////////////////////等待关闭
            setTimeout(function(){
                eb.conn.open({ user : eb.userId, pwd : eb.userId, appKey : eb.appKey });
                if(eb.secondUserId){ ///////旧账号登录
                    $.createEasemobConn(1);
                }
                if($.$.loginUrl && ($.$.loginUrl.indexOf('techReward&')!=-1 || $.$.loginUrl.indexOf('comment&')!=-1)){
                    $.localStorage('backIndex',3);//==使在打赏页时，返回键不返回登录页
                }
                if($.$.loginUrl && forceReload !== false){
                    if($.$.loginUrl==pageHash || forceReload){
                        //如果是当前页，需刷新页面
                        location.reload();
                    }else{
                        $.$.loginUrl ?  $.page($.$.loginUrl,1,true) : $.page("home",-1,true);
                    }
                }
                forceReload = 0;
                $.$.loginUrl = '';
                $.eventMaskShow(false);
            },(delay ? 500 : 1))
        }

        $.bindPhone = function (flag) {
            forceReload = flag;
            $.eventMaskShow(true);
            $.localStorage('pop_bind_phone_dialog',true);
            $('#_bindPhone',true).Class('active');
        };

        //=== 加载动画中的 关闭按钮 ===
        var $menus = $('#_clubMenu>div,#_publicMenu>div',true);
        $('#_loading>span',true).Event('click', function () {
            var tmp = currLoadStatus[currLoadKey],tmpDom;
            delete currLoadStatus[currLoadKey];
            if(tmp == true){        //页面所需的js,html已加载完成的情况，为回退页面
                $.page();
            }else{                                          // 否则为取消页面加载
                $.pageCancel();
            }
            $menus.ClassClear('active');
            for(var i= 0,l = $menus.length;i<l;i++){
                tmpDom = $menus.Index(i);
                if(tmpDom.ClassHave(pageUrl)){
                    tmpDom.Class('active');
                    break;
                }
            }
        })

        /////////////////////////////////////////////////////外网增加百度统计
        if (/spa.93wifi.com/.test(loc.hostname)) {
            var js = doc.createElement("script");
            js.onload = function () {
                win['_hmt'] = win['_hmt'] || [];
            };
            js.src = 'http://hm.baidu.com/h.js?2b7f463ac6f2cf5b303005839e722cdc';
            doc.querySelector("head").appendChild(js);
        }
    }
})(window, document, location);
;(function () {
	'use strict';

	/**
	 * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
	 *
	 * @codingstandard ftlabs-jsv2
	 * @copyright The Financial Times Limited [All Rights Reserved]
	 * @license MIT License (see LICENSE.txt)
	 */

	/*jslint browser:true, node:true*/
	/*global define, Event, Node*/


	/**
	 * Instantiate fast-clicking listeners on the specified layer.
	 *
	 * @constructor
	 * @param {Element} layer The layer to listen on
	 * @param {Object} [options={}] The options to override the defaults
	 */
	function FastClick(layer, options) {
		var oldOnClick;

		options = options || {};

		/**
		 * Whether a click is currently being tracked.
		 *
		 * @type boolean
		 */
		this.trackingClick = false;


		/**
		 * Timestamp for when click tracking started.
		 *
		 * @type number
		 */
		this.trackingClickStart = 0;


		/**
		 * The element being tracked for a click.
		 *
		 * @type EventTarget
		 */
		this.targetElement = null;


		/**
		 * X-coordinate of touch start event.
		 *
		 * @type number
		 */
		this.touchStartX = 0;


		/**
		 * Y-coordinate of touch start event.
		 *
		 * @type number
		 */
		this.touchStartY = 0;


		/**
		 * ID of the last touch, retrieved from Touch.identifier.
		 *
		 * @type number
		 */
		this.lastTouchIdentifier = 0;


		/**
		 * Touchmove boundary, beyond which a click will be cancelled.
		 *
		 * @type number
		 */
		this.touchBoundary = options.touchBoundary || 10;


		/**
		 * The FastClick layer.
		 *
		 * @type Element
		 */
		this.layer = layer;

		/**
		 * The minimum time between tap(touchstart and touchend) events
		 *
		 * @type number
		 */
		this.tapDelay = options.tapDelay || 200;

		/**
		 * The maximum time for a tap
		 *
		 * @type number
		 */
		this.tapTimeout = options.tapTimeout || 700;

		if (FastClick.notNeeded(layer)) {
			return;
		}

		// Some old versions of Android don't have Function.prototype.bind
		function bind(method, context) {
			return function() { return method.apply(context, arguments); };
		}


		var methods = ['onMouse', 'onClick', 'onTouchStart', 'onTouchMove', 'onTouchEnd', 'onTouchCancel'];
		var context = this;
		for (var i = 0, l = methods.length; i < l; i++) {
			context[methods[i]] = bind(context[methods[i]], context);
		}

		// Set up event handlers as required
		if (deviceIsAndroid) {
			layer.addEventListener('mouseover', this.onMouse, true);
			layer.addEventListener('mousedown', this.onMouse, true);
			layer.addEventListener('mouseup', this.onMouse, true);
		}

		layer.addEventListener('click', this.onClick, true);
		layer.addEventListener('touchstart', this.onTouchStart, false);
		layer.addEventListener('touchmove', this.onTouchMove, false);
		layer.addEventListener('touchend', this.onTouchEnd, false);
		layer.addEventListener('touchcancel', this.onTouchCancel, false);

		// Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
		// which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
		// layer when they are cancelled.
		if (!Event.prototype.stopImmediatePropagation) {
			layer.removeEventListener = function(type, callback, capture) {
				var rmv = Node.prototype.removeEventListener;
				if (type === 'click') {
					rmv.call(layer, type, callback.hijacked || callback, capture);
				} else {
					rmv.call(layer, type, callback, capture);
				}
			};

			layer.addEventListener = function(type, callback, capture) {
				var adv = Node.prototype.addEventListener;
				if (type === 'click') {
					adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
						if (!event.propagationStopped) {
							callback(event);
						}
					}), capture);
				} else {
					adv.call(layer, type, callback, capture);
				}
			};
		}

		// If a handler is already declared in the element's onclick attribute, it will be fired before
		// FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
		// adding it as listener.
		if (typeof layer.onclick === 'function') {

			// Android browser on at least 3.2 requires a new reference to the function in layer.onclick
			// - the old one won't work if passed to addEventListener directly.
			oldOnClick = layer.onclick;
			layer.addEventListener('click', function(event) {
				oldOnClick(event);
			}, false);
			layer.onclick = null;
		}
	}

	/**
	* Windows Phone 8.1 fakes user agent string to look like Android and iPhone.
	*
	* @type boolean
	*/
	var deviceIsWindowsPhone = navigator.userAgent.indexOf("Windows Phone") >= 0;

	/**
	 * Android requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0 && !deviceIsWindowsPhone;


	/**
	 * iOS requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent) && !deviceIsWindowsPhone;


	/**
	 * iOS 4 requires an exception for select elements.
	 *
	 * @type boolean
	 */
	var deviceIsIOS4 = deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);


	/**
	 * iOS 6.0-7.* requires the target element to be manually derived
	 *
	 * @type boolean
	 */
	var deviceIsIOSWithBadTarget = deviceIsIOS && (/OS [6-7]_\d/).test(navigator.userAgent);

	/**
	 * BlackBerry requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsBlackBerry10 = navigator.userAgent.indexOf('BB10') > 0;

	/**
	 * Determine whether a given element requires a native click.
	 *
	 * @param {EventTarget|Element} target Target DOM element
	 * @returns {boolean} Returns true if the element needs a native click
	 */
	FastClick.prototype.needsClick = function(target) {
		switch (target.nodeName.toLowerCase()) {

		// Don't send a synthetic click to disabled inputs (issue #62)
		case 'button':
		case 'select':
		case 'textarea':
			if (target.disabled) {
				return true;
			}

			break;
		case 'input':

			// File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
			if ((deviceIsIOS && target.type === 'file') || target.disabled) {
				return true;
			}

			break;
		case 'label':
		case 'iframe': // iOS8 homescreen apps can prevent events bubbling into frames
		case 'video':
			return true;
		}

		return (/\bneedsclick\b/).test(target.className);
	};


	/**
	 * Determine whether a given element requires a call to focus to simulate click into element.
	 *
	 * @param {EventTarget|Element} target Target DOM element
	 * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.
	 */
	FastClick.prototype.needsFocus = function(target) {
		switch (target.nodeName.toLowerCase()) {
		case 'textarea':
			return true;
		case 'select':
			return !deviceIsAndroid;
		case 'input':
			switch (target.type) {
			case 'button':
			case 'checkbox':
			case 'file':
			case 'image':
			case 'radio':
			case 'submit':
				return false;
			}

			// No point in attempting to focus disabled inputs
			return !target.disabled && !target.readOnly;
		default:
			return (/\bneedsfocus\b/).test(target.className);
		}
	};


	/**
	 * Send a click event to the specified element.
	 *
	 * @param {EventTarget|Element} targetElement
	 * @param {Event} event
	 */
	FastClick.prototype.sendClick = function(targetElement, event) {
		var clickEvent, touch;

		// On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
		if (document.activeElement && document.activeElement !== targetElement) {
			document.activeElement.blur();
		}

		touch = event.changedTouches[0];

		// Synthesise a click event, with an extra attribute so it can be tracked
		clickEvent = document.createEvent('MouseEvents');
		clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
		clickEvent.forwardedTouchEvent = true;
		targetElement.dispatchEvent(clickEvent);
	};

	FastClick.prototype.determineEventType = function(targetElement) {

		//Issue #159: Android Chrome Select Box does not open with a synthetic click event
		if (deviceIsAndroid && targetElement.tagName.toLowerCase() === 'select') {
			return 'mousedown';
		}

		return 'click';
	};


	/**
	 * @param {EventTarget|Element} targetElement
	 */
	FastClick.prototype.focus = function(targetElement) {
		var length;

		// Issue #160: on iOS 7, some input elements (e.g. date datetime month) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
		if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time' && targetElement.type !== 'month') {
			length = targetElement.value.length;
			targetElement.setSelectionRange(length, length);
		} else {
			targetElement.focus();
		}
	};


	/**
	 * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.
	 *
	 * @param {EventTarget|Element} targetElement
	 */
	FastClick.prototype.updateScrollParent = function(targetElement) {
		var scrollParent, parentElement;

		scrollParent = targetElement.fastClickScrollParent;

		// Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
		// target element was moved to another parent.
		if (!scrollParent || !scrollParent.contains(targetElement)) {
			parentElement = targetElement;
			do {
				if (parentElement.scrollHeight > parentElement.offsetHeight) {
					scrollParent = parentElement;
					targetElement.fastClickScrollParent = parentElement;
					break;
				}

				parentElement = parentElement.parentElement;
			} while (parentElement);
		}

		// Always update the scroll top tracker if possible.
		if (scrollParent) {
			scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
		}
	};


	/**
	 * @param {EventTarget} targetElement
	 * @returns {Element|EventTarget}
	 */
	FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {

		// On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
		if (eventTarget.nodeType === Node.TEXT_NODE) {
			return eventTarget.parentNode;
		}

		return eventTarget;
	};


	/**
	 * On touch start, record the position and scroll offset.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchStart = function(event) {
		var targetElement, touch, selection;

		// Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).
		if (event.targetTouches.length > 1) {
			return true;
		}

		targetElement = this.getTargetElementFromEventTarget(event.target);
		touch = event.targetTouches[0];

		if (deviceIsIOS) {

			// Only trusted events will deselect text on iOS (issue #49)
			selection = window.getSelection();
			if (selection.rangeCount && !selection.isCollapsed) {
				return true;
			}

			if (!deviceIsIOS4) {

				// Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
				// when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
				// with the same identifier as the touch event that previously triggered the click that triggered the alert.
				// Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
				// immediately preceeding touch event (issue #52), so this fix is unavailable on that platform.
				// Issue 120: touch.identifier is 0 when Chrome dev tools 'Emulate touch events' is set with an iOS device UA string,
				// which causes all touch events to be ignored. As this block only applies to iOS, and iOS identifiers are always long,
				// random integers, it's safe to to continue if the identifier is 0 here.
				if (touch.identifier && touch.identifier === this.lastTouchIdentifier) {
					event.preventDefault();
					return false;
				}

				this.lastTouchIdentifier = touch.identifier;

				// If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
				// 1) the user does a fling scroll on the scrollable layer
				// 2) the user stops the fling scroll with another tap
				// then the event.target of the last 'touchend' event will be the element that was under the user's finger
				// when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
				// is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
				this.updateScrollParent(targetElement);
			}
		}

		this.trackingClick = true;
		this.trackingClickStart = event.timeStamp;
		this.targetElement = targetElement;

		this.touchStartX = touch.pageX;
		this.touchStartY = touch.pageY;

		// Prevent phantom clicks on fast double-tap (issue #36)
		if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
			event.preventDefault();
		}

		return true;
	};


	/**
	 * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.touchHasMoved = function(event) {
		var touch = event.changedTouches[0], boundary = this.touchBoundary;

		if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
			return true;
		}

		return false;
	};


	/**
	 * Update the last position.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchMove = function(event) {
		if (!this.trackingClick) {
			return true;
		}

		// If the touch has moved, cancel the click tracking
		if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
			this.trackingClick = false;
			this.targetElement = null;
		}

		return true;
	};


	/**
	 * Attempt to find the labelled control for the given label element.
	 *
	 * @param {EventTarget|HTMLLabelElement} labelElement
	 * @returns {Element|null}
	 */
	FastClick.prototype.findControl = function(labelElement) {

		// Fast path for newer browsers supporting the HTML5 control attribute
		if (labelElement.control !== undefined) {
			return labelElement.control;
		}

		// All browsers under test that support touch events also support the HTML5 htmlFor attribute
		if (labelElement.htmlFor) {
			return document.getElementById(labelElement.htmlFor);
		}

		// If no for attribute exists, attempt to retrieve the first labellable descendant element
		// the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
		return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
	};


	/**
	 * On touch end, determine whether to send a click event at once.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchEnd = function(event) {
		var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;

		if (!this.trackingClick) {
			return true;
		}

		// Prevent phantom clicks on fast double-tap (issue #36)
		if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
			this.cancelNextClick = true;
			return true;
		}

		if ((event.timeStamp - this.trackingClickStart) > this.tapTimeout) {
			return true;
		}

		// Reset to prevent wrong click cancel on input (issue #156).
		this.cancelNextClick = false;

		this.lastClickTime = event.timeStamp;

		trackingClickStart = this.trackingClickStart;
		this.trackingClick = false;
		this.trackingClickStart = 0;

		// On some iOS devices, the targetElement supplied with the event is invalid if the layer
		// is performing a transition or scroll, and has to be re-detected manually. Note that
		// for this to function correctly, it must be called *after* the event target is checked!
		// See issue #57; also filed as rdar://13048589 .
		if (deviceIsIOSWithBadTarget) {
			touch = event.changedTouches[0];

			// In certain cases arguments of elementFromPoint can be negative, so prevent setting targetElement to null
			targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
			targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
		}

		targetTagName = targetElement.tagName.toLowerCase();
		if (targetTagName === 'label') {
			forElement = this.findControl(targetElement);
			if (forElement) {
				this.focus(targetElement);
				if (deviceIsAndroid) {
					return false;
				}

				targetElement = forElement;
			}
		} else if (this.needsFocus(targetElement)) {

			// Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
			// Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
			if ((event.timeStamp - trackingClickStart) > 100 || (deviceIsIOS && window.top !== window && targetTagName === 'input')) {
				this.targetElement = null;
				return false;
			}

			this.focus(targetElement);
			this.sendClick(targetElement, event);

			// Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
			// Also this breaks opening selects when VoiceOver is active on iOS6, iOS7 (and possibly others)
			if (!deviceIsIOS || targetTagName !== 'select') {
				this.targetElement = null;
				event.preventDefault();
			}

			return false;
		}

		if (deviceIsIOS && !deviceIsIOS4) {

			// Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
			// and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
			scrollParent = targetElement.fastClickScrollParent;
			if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
				return true;
			}
		}

		// Prevent the actual click from going though - unless the target node is marked as requiring
		// real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
		if (!this.needsClick(targetElement)) {
			event.preventDefault();
			this.sendClick(targetElement, event);
		}

		return false;
	};


	/**
	 * On touch cancel, stop tracking the click.
	 *
	 * @returns {void}
	 */
	FastClick.prototype.onTouchCancel = function() {
		this.trackingClick = false;
		this.targetElement = null;
	};


	/**
	 * Determine mouse events which should be permitted.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onMouse = function(event) {

		// If a target element was never set (because a touch event was never fired) allow the event
		if (!this.targetElement) {
			return true;
		}

		if (event.forwardedTouchEvent) {
			return true;
		}

		// Programmatically generated events targeting a specific element should be permitted
		if (!event.cancelable) {
			return true;
		}

		// Derive and check the target element to see whether the mouse event needs to be permitted;
		// unless explicitly enabled, prevent non-touch click events from triggering actions,
		// to prevent ghost/doubleclicks.
		if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

			// Prevent any user-added listeners declared on FastClick element from being fired.
			if (event.stopImmediatePropagation) {
				event.stopImmediatePropagation();
			} else {

				// Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
				event.propagationStopped = true;
			}

			// Cancel the event
			event.stopPropagation();
			event.preventDefault();

			return false;
		}

		// If the mouse event is permitted, return true for the action to go through.
		return true;
	};


	/**
	 * On actual clicks, determine whether this is a touch-generated click, a click action occurring
	 * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
	 * an actual click which should be permitted.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onClick = function(event) {
		var permitted;

		// It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
		if (this.trackingClick) {
			this.targetElement = null;
			this.trackingClick = false;
			return true;
		}

		// Very odd behaviour on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
		if (event.target.type === 'submit' && event.detail === 0) {
			return true;
		}

		permitted = this.onMouse(event);

		// Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
		if (!permitted) {
			this.targetElement = null;
		}

		// If clicks are permitted, return true for the action to go through.
		return permitted;
	};


	/**
	 * Remove all FastClick's event listeners.
	 *
	 * @returns {void}
	 */
	FastClick.prototype.destroy = function() {
		var layer = this.layer;

		if (deviceIsAndroid) {
			layer.removeEventListener('mouseover', this.onMouse, true);
			layer.removeEventListener('mousedown', this.onMouse, true);
			layer.removeEventListener('mouseup', this.onMouse, true);
		}

		layer.removeEventListener('click', this.onClick, true);
		layer.removeEventListener('touchstart', this.onTouchStart, false);
		layer.removeEventListener('touchmove', this.onTouchMove, false);
		layer.removeEventListener('touchend', this.onTouchEnd, false);
		layer.removeEventListener('touchcancel', this.onTouchCancel, false);
	};


	/**
	 * Check whether FastClick is needed.
	 *
	 * @param {Element} layer The layer to listen on
	 */
	FastClick.notNeeded = function(layer) {
		var metaViewport;
		var chromeVersion;
		var blackberryVersion;
		var firefoxVersion;

		// Devices that don't support touch don't need FastClick
		if (typeof window.ontouchstart === 'undefined') {
			return true;
		}

		// Chrome version - zero for other browsers
		chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

		if (chromeVersion) {

			if (deviceIsAndroid) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					// Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// Chrome 32 and above with width=device-width or less don't need FastClick
					if (chromeVersion > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}

			// Chrome desktop doesn't need FastClick (issue #15)
			} else {
				return true;
			}
		}

		if (deviceIsBlackBerry10) {
			blackberryVersion = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);

			// BlackBerry 10.3+ does not require Fastclick library.
			// https://github.com/ftlabs/fastclick/issues/251
			if (blackberryVersion[1] >= 10 && blackberryVersion[2] >= 3) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					// user-scalable=no eliminates click delay.
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// width=device-width (or less than device-width) eliminates click delay.
					if (document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}
			}
		}

		// IE10 with -ms-touch-action: none or manipulation, which disables double-tap-to-zoom (issue #97)
		if (layer.style.msTouchAction === 'none' || layer.style.touchAction === 'manipulation') {
			return true;
		}

		// Firefox version - zero for other browsers
		firefoxVersion = +(/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

		if (firefoxVersion >= 27) {
			// Firefox 27+ does not have tap delay if the content is not zoomable - https://bugzilla.mozilla.org/show_bug.cgi?id=922896

			metaViewport = document.querySelector('meta[name=viewport]');
			if (metaViewport && (metaViewport.content.indexOf('user-scalable=no') !== -1 || document.documentElement.scrollWidth <= window.outerWidth)) {
				return true;
			}
		}

		// IE11: prefixed -ms-touch-action is no longer supported and it's recomended to use non-prefixed version
		// http://msdn.microsoft.com/en-us/library/windows/apps/Hh767313.aspx
		if (layer.style.touchAction === 'none' || layer.style.touchAction === 'manipulation') {
			return true;
		}

		return false;
	};


	/**
	 * Factory method for creating a FastClick object
	 *
	 * @param {Element} layer The layer to listen on
	 * @param {Object} [options={}] The options to override the defaults
	 */
	FastClick.attach = function(layer, options) {
		return new FastClick(layer, options);
	};


	if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {

		// AMD. Register as an anonymous module.
		define(function() {
			return FastClick;
		});
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = FastClick.attach;
		module.exports.FastClick = FastClick;
	} else {
		window.FastClick = FastClick;
	}
}());
