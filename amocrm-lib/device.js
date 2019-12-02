define("device", [], function() {
    return function(e) {
        var t = {};

        function n(i) {
            if (t[i]) {
                return t[i].exports
            }
            var r = t[i] = {
                i: i,
                l: false,
                exports: {}
            };
            e[i].call(r.exports, r, r.exports, n);
            r.l = true;
            return r.exports
        }
        n.m = e;
        n.c = t;
        n.d = function(e, t, i) {
            if (!n.o(e, t)) {
                Object.defineProperty(e, t, {
                    enumerable: true,
                    get: i
                })
            }
        };
        n.r = function(e) {
            if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
                Object.defineProperty(e, Symbol.toStringTag, {
                    value: "Module"
                })
            }
            Object.defineProperty(e, "__esModule", {
                value: true
            })
        };
        n.t = function(e, t) {
            if (t & 1) e = n(e);
            if (t & 8) return e;
            if (t & 4 && typeof e === "object" && e && e.__esModule) return e;
            var i = Object.create(null);
            n.r(i);
            Object.defineProperty(i, "default", {
                enumerable: true,
                value: e
            });
            if (t & 2 && typeof e != "string")
                for (var r in e) n.d(i, r, function(t) {
                    return e[t]
                }.bind(null, r));
            return i
        };
        n.n = function(e) {
            var t = e && e.__esModule ? function t() {
                return e["default"]
            } : function t() {
                return e
            };
            n.d(t, "a", t);
            return t
        };
        n.o = function(e, t) {
            return Object.prototype.hasOwnProperty.call(e, t)
        };
        n.p = "";
        return n(n.s = 0)
    }([function(e, t, n) {
        e.exports = n(1)
    }, function(e, t, n) {
        n.r(t);
        var i = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(e) {
            return typeof e
        } : function(e) {
            return e && typeof Symbol === "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
        };
        var r = window.device;
        var o = {};
        var s = [];
        window.device = o;
        var a = window.document.documentElement;
        var l = window.navigator.userAgent.toLowerCase();
        var u = ["googletv", "viera", "smarttv", "internet.tv", "netcast", "nettv", "appletv", "boxee", "kylo", "roku", "dlnadoc", "pov_tv", "hbbtv", "ce-html"];
        o.macos = function() {
            return c("mac")
        };
        o.ios = function() {
            return o.iphone() || o.ipod() || o.ipad()
        };
        o.iphone = function() {
            return !o.windows() && c("iphone")
        };
        o.ipod = function() {
            return c("ipod")
        };
        o.ipad = function() {
            return c("ipad")
        };
        o.android = function() {
            return !o.windows() && c("android")
        };
        o.androidPhone = function() {
            return o.android() && c("mobile")
        };
        o.androidTablet = function() {
            return o.android() && !c("mobile")
        };
        o.blackberry = function() {
            return c("blackberry") || c("bb10") || c("rim")
        };
        o.blackberryPhone = function() {
            return o.blackberry() && !c("tablet")
        };
        o.blackberryTablet = function() {
            return o.blackberry() && c("tablet")
        };
        o.windows = function() {
            return c("windows")
        };
        o.windowsPhone = function() {
            return o.windows() && c("phone")
        };
        o.windowsTablet = function() {
            return o.windows() && c("touch") && !o.windowsPhone()
        };
        o.fxos = function() {
            return (c("(mobile") || c("(tablet")) && c(" rv:")
        };
        o.fxosPhone = function() {
            return o.fxos() && c("mobile")
        };
        o.fxosTablet = function() {
            return o.fxos() && c("tablet")
        };
        o.meego = function() {
            return c("meego")
        };
        o.cordova = function() {
            return window.cordova && location.protocol === "file:"
        };
        o.nodeWebkit = function() {
            return i(window.process) === "object"
        };
        o.mobile = function() {
            return o.androidPhone() || o.iphone() || o.ipod() || o.windowsPhone() || o.blackberryPhone() || o.fxosPhone() || o.meego()
        };
        o.tablet = function() {
            return o.ipad() || o.androidTablet() || o.blackberryTablet() || o.windowsTablet() || o.fxosTablet()
        };
        o.desktop = function() {
            return !o.tablet() && !o.mobile()
        };
        o.television = function() {
            var e = 0;
            while (e < u.length) {
                if (c(u[e])) {
                    return true
                }
                e++
            }
            return false
        };
        o.portrait = function() {
            if (screen.orientation && Object.prototype.hasOwnProperty.call(window, "onorientationchange")) {
                return screen.orientation.type.includes("portrait")
            }
            return window.innerHeight / window.innerWidth > 1
        };
        o.landscape = function() {
            if (screen.orientation && Object.prototype.hasOwnProperty.call(window, "onorientationchange")) {
                return screen.orientation.type.includes("landscape")
            }
            return window.innerHeight / window.innerWidth < 1
        };
        o.noConflict = function() {
            window.device = r;
            return this
        };

        function c(e) {
            return l.indexOf(e) !== -1
        }

        function d(e) {
            return a.className.match(new RegExp(e, "i"))
        }

        function f(e) {
            var t = null;
            if (!d(e)) {
                t = a.className.replace(/^\s+|\s+$/g, "");
                a.className = t + " " + e
            }
        }

        function h(e) {
            if (d(e)) {
                a.className = a.className.replace(" " + e, "")
            }
        }
        if (o.ios()) {
            if (o.ipad()) {
                f("ios ipad tablet")
            } else if (o.iphone()) {
                f("ios iphone mobile")
            } else if (o.ipod()) {
                f("ios ipod mobile")
            }
        } else if (o.macos()) {
            f("macos desktop")
        } else if (o.android()) {
            if (o.androidTablet()) {
                f("android tablet")
            } else {
                f("android mobile")
            }
        } else if (o.blackberry()) {
            if (o.blackberryTablet()) {
                f("blackberry tablet")
            } else {
                f("blackberry mobile")
            }
        } else if (o.windows()) {
            if (o.windowsTablet()) {
                f("windows tablet")
            } else if (o.windowsPhone()) {
                f("windows mobile")
            } else {
                f("windows desktop")
            }
        } else if (o.fxos()) {
            if (o.fxosTablet()) {
                f("fxos tablet")
            } else {
                f("fxos mobile")
            }
        } else if (o.meego()) {
            f("meego mobile")
        } else if (o.nodeWebkit()) {
            f("node-webkit")
        } else if (o.television()) {
            f("television")
        } else if (o.desktop()) {
            f("desktop")
        }
        if (o.cordova()) {
            f("cordova")
        }

        function p() {
            if (o.landscape()) {
                h("portrait");
                f("landscape");
                g("landscape")
            } else {
                h("landscape");
                f("portrait");
                g("portrait")
            }
            b()
        }

        function g(e) {
            for (var t in s) {
                s[t](e)
            }
        }
        o.onChangeOrientation = function(e) {
            if (typeof e == "function") {
                s.push(e)
            }
        };
        var m = "resize";
        if (Object.prototype.hasOwnProperty.call(window, "onorientationchange")) {
            m = "orientationchange"
        }
        if (window.addEventListener) {
            window.addEventListener(m, p, false)
        } else if (window.attachEvent) {
            window.attachEvent(m, p)
        } else {
            window[m] = p
        }
        p();

        function v(e) {
            for (var t = 0; t < e.length; t++) {
                if (o[e[t]]()) {
                    return e[t]
                }
            }
            return "unknown"
        }
        o.type = v(["mobile", "tablet", "desktop"]);
        o.os = v(["ios", "iphone", "ipad", "ipod", "android", "blackberry", "windows", "fxos", "meego", "television"]);

        function b() {
            o.orientation = v(["portrait", "landscape"])
        }
        b();
        t["default"] = o
    }])["default"]
});
