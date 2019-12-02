define("accounting", [], function() {
    var n = {};
    n.version = "0.3.2";
    n.settings = {
        currency: {
            symbol: "$",
            format: "%s%v",
            decimal: ".",
            thousand: ",",
            precision: 2,
            grouping: 3
        },
        number: {
            precision: 0,
            grouping: 3,
            thousand: ",",
            decimal: "."
        }
    };
    var i = Array.prototype.map,
        r = Array.isArray,
        o = Object.prototype.toString;

    function s(e) {
        return !!(e === "" || e && e.charCodeAt && e.substr)
    }

    function a(e) {
        return r ? r(e) : o.call(e) === "[object Array]"
    }

    function l(e) {
        return o.call(e) === "[object Object]"
    }

    function u(e, t) {
        var n;
        e = e || {};
        t = t || {};
        for (n in t) {
            if (t.hasOwnProperty(n)) {
                if (e[n] == null) e[n] = t[n]
            }
        }
        return e
    }

    function c(e, t, n) {
        var r = [],
            o, s;
        if (!e) return r;
        if (i && e.map === i) return e.map(t, n);
        for (o = 0, s = e.length; o < s; o++) {
            r[o] = t.call(n, e[o], o, e)
        }
        return r
    }

    function d(e, t) {
        e = Math.round(Math.abs(e));
        return isNaN(e) ? t : e
    }

    function f(e) {
        var t = n.settings.currency.format;
        if (typeof e === "function") e = e();
        if (s(e) && e.match("%v")) {
            return {
                pos: e,
                neg: e.replace("-", "").replace("%v", "-%v"),
                zero: e
            }
        } else if (!e || !e.pos || !e.pos.match("%v")) {
            return !s(t) ? t : n.settings.currency.format = {
                pos: t,
                neg: t.replace("%v", "-%v"),
                zero: t
            }
        }
        return e
    }
    var h = n.unformat = n.parse = function(e, t) {
        if (a(e)) {
            return c(e, function(e) {
                return h(e, t)
            })
        }
        e = e || 0;
        if (typeof e === "number") return e;
        t = t || ".";
        var n = new RegExp("[^0-9-" + t + "]", ["g"]),
            i = parseFloat(("" + e).replace(/\((.*)\)/, "-$1").replace(n, "").replace(t, "."));
        return !isNaN(i) ? i : 0
    };
    var p = n.toFixed = function(e, t) {
        t = d(t, n.settings.number.precision);
        var i = Math.pow(10, t);
        return (Math.round(n.unformat(e) * i) / i).toFixed(t)
    };
    var g = n.formatNumber = function(e, t, i, r) {
        if (a(e)) {
            return c(e, function(e) {
                return g(e, t, i, r)
            })
        }
        e = h(e);
        var o = u(l(t) ? t : {
                precision: t,
                thousand: i,
                decimal: r
            }, n.settings.number),
            s = d(o.precision),
            f = e < 0 ? "-" : "",
            m = parseInt(p(Math.abs(e || 0), s), 10) + "",
            v = m.length > 3 ? m.length % 3 : 0;
        return f + (v ? m.substr(0, v) + o.thousand : "") + m.substr(v).replace(/(\d{3})(?=\d)/g, "$1" + o.thousand) + (s ? o.decimal + p(Math.abs(e), s).split(".")[1] : "")
    };
    var m = n.formatMoney = function(e, t, i, r, o, s) {
        if (a(e)) {
            return c(e, function(e) {
                return m(e, t, i, r, o, s)
            })
        }
        e = h(e);
        var p = u(l(t) ? t : {
                symbol: t,
                precision: i,
                thousand: r,
                decimal: o,
                format: s
            }, n.settings.currency),
            v = f(p.format),
            b = e > 0 ? v.pos : e < 0 ? v.neg : v.zero;
        return b.replace("%s", p.symbol).replace("%v", g(Math.abs(e), d(p.precision), p.thousand, p.decimal))
    };
    n.formatColumn = function(e, t, i, r, o, p) {
        if (!e) return [];
        var m = u(l(t) ? t : {
                symbol: t,
                precision: i,
                thousand: r,
                decimal: o,
                format: p
            }, n.settings.currency),
            v = f(m.format),
            b = v.pos.indexOf("%s") < v.pos.indexOf("%v") ? true : false,
            y = 0,
            M = c(e, function(e, t) {
                if (a(e)) {
                    return n.formatColumn(e, m)
                } else {
                    e = h(e);
                    var i = e > 0 ? v.pos : e < 0 ? v.neg : v.zero,
                        r = i.replace("%s", m.symbol).replace("%v", g(Math.abs(e), d(m.precision), m.thousand, m.decimal));
                    if (r.length > y) y = r.length;
                    return r
                }
            });
        return c(M, function(e, t) {
            if (s(e) && e.length < y) {
                return b ? e.replace(m.symbol, m.symbol + new Array(y - e.length + 1).join(" ")) : new Array(y - e.length + 1).join(" ") + e
            }
            return e
        })
    };

    return n;
});
