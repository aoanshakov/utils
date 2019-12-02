define('pubsub', [], function() {
    "use strict";
    var t = {},
        n = -1,
        e = {};

    function i(e) {
        var t;
        for (t in e) {
            if (e.hasOwnProperty(t)) {
                return true
            }
        }
        return false
    }

    function r(e) {
        return function t() {
            throw e
        }
    }

    function o(e, t, n) {
        try {
            e(t, n)
        } catch (e) {
            setTimeout(r(e), 0)
        }
    }

    function s(e, t, n) {
        e(t, n)
    }

    function a(e, n, i, r) {
        var a = t[n],
            l = r ? s : o,
            u;
        if (!t.hasOwnProperty(n)) {
            return
        }
        for (u in a) {
            if (a.hasOwnProperty(u)) {
                l(a[u], e, i)
            }
        }
    }

    function l(e, t, n) {
        return function i() {
            var r = String(e),
                o = r.lastIndexOf(".");
            a(e, e, t, n);
            while (o !== -1) {
                r = r.substr(0, o);
                o = r.lastIndexOf(".");
                a(e, r, t, n)
            }
        }
    }

    function u(e) {
        var n = String(e),
            r = Boolean(t.hasOwnProperty(n) && i(t[n])),
            o = n.lastIndexOf(".");
        while (!r && o !== -1) {
            n = n.substr(0, o);
            o = n.lastIndexOf(".");
            r = Boolean(t.hasOwnProperty(n) && i(t[n]))
        }
        return r
    }

    function c(e, t, n, i) {
        var r = l(e, t, i),
            o = u(e);
        if (!o) {
            return false
        }
        if (n === true) {
            r()
        } else {
            setTimeout(r, 0)
        }
        return true
    }
    e.publish = function(t, n) {
        return c(t, n, false, e.immediateExceptions)
    };
    e.publishSync = function(t, n) {
        return c(t, n, true, e.immediateExceptions)
    };
    e.subscribe = function(e, i) {
        if (typeof i !== "function") {
            return false
        }
        if (!t.hasOwnProperty(e)) {
            t[e] = {}
        }
        var r = "uid_" + String(++n);
        t[e][r] = i;
        return r
    };
    e.clearAllSubscriptions = function e() {
        t = {}
    };
    e.clearSubscriptions = function e(n) {
        var i;
        for (i in t) {
            if (t.hasOwnProperty(i) && i.indexOf(n) === 0) {
                delete t[i]
            }
        }
    };
    e.unsubscribe = function(e) {
        var n = typeof e === "string" && t.hasOwnProperty(e),
            i = !n && typeof e === "string",
            r = typeof e === "function",
            o = false,
            s, a, l;
        if (n) {
            delete t[e];
            return
        }
        for (s in t) {
            if (t.hasOwnProperty(s)) {
                a = t[s];
                if (i && a[e]) {
                    delete a[e];
                    o = e;
                    break
                }
                if (r) {
                    for (l in a) {
                        if (a.hasOwnProperty(l) && a[l] === e) {
                            delete a[l];
                            o = true
                        }
                    }
                }
            }
        }
        return o
    };

    return e;
});
