define("lib/common/urlparams", ["jquery", "underscore"], function(t, n) {
    "use strict";
    var i;

    function r(e) {
        if (e.indexOf("?") >= 0) {
            return e.split("?")[1]
        }
        return e
    }

    function o(e) {
        try {
            e = decodeURIComponent(e.toString().replace(/\+/gi, " "))
        } catch (t) {
            e = ""
        }
        return e.toString()
    }

    function s(e) {
        try {
            e = decodeURIComponent(e.toString().replace(/\+/gi, " "))
        } catch (t) {
            e = ""
        }
        try {
            return JSON.parse(e)
        } catch (t) {
            return e.toString()
        }
    }

    function a(e) {
        var n = {},
            i = r(e),
            s;
        if (!i) {
            return n
        }
        t.each(i.split("&"), function(e, t) {
            t = t.split("=");
            t[0] = decodeURIComponent(t[0]);
            if (typeof n[t[0]] === "undefined") {
                n[t[0]] = o(t[1] || "")
            } else if (n[t[0]] instanceof Array) {
                n[t[0]].push(o(t[1] || ""))
            } else {
                s = n[t[0]].toString();
                n[t[0]] = [s, o(t[1] || "")]
            }
        });
        return n
    }

    function l(e) {
        var n = {},
            i = r(e),
            a;
        if (!i) {
            return n
        }
        t.each(i.split("&"), function(e, t) {
            var i;
            t = t.split("=");
            t[0] = decodeURIComponent(t[0]);
            if (typeof n[t[0]] !== "undefined") {
                if (n[t[0]] instanceof Array) {
                    n[t[0]].push(o(t[1] || ""))
                } else {
                    a = n[t[0]].toString();
                    n[t[0]] = [a, o(t[1] || "")]
                }
            } else if (t[0].indexOf("[", 1) > 0) {
                i = t[0].split("[");
                i[i.length] = o(t[1]);
                var r = 0,
                    l = function(e, t) {
                        if (r < t.length - 1) {
                            t[r] = t[r].replace("]", "");
                            if (t[r] === "") {
                                if (Object.keys(e).length) {
                                    e[Object.keys(e).length] = t[t.length - 1]
                                } else {
                                    e[0] = t[t.length - 1]
                                }
                            } else {
                                e[t[r]] = e[t[r]] || {};
                                var n = e[t[r]];
                                r++;
                                if (r === t.length - 1) {
                                    e[t[r - 1]] = t[r]
                                } else {
                                    l(n, t)
                                }
                            }
                        }
                    };
                l(n, i)
            } else {
                n[t[0]] = s(t[1] || "")
            }
        });
        return n
    }

    function u(e) {
        var t = [];
        n.each(e, function(e, i) {
            if (typeof e === "object") {
                n.each(e, function(e, n) {
                    t.push(i + "[" + (isNaN(n, 10) ? n : "") + "]=" + encodeURIComponent(e))
                })
            } else {
                t.push(i + "=" + encodeURIComponent(e))
            }
        });
        return t.join("&")
    }
    i = {
        QStoJSON: function(e, t) {
            t = t || false;
            if (typeof e === "string") {
                return t ? l(e) : a(e)
            }
            return u(e)
        },
        getQueryString: function() {
            var e = window.location.href.replace(/.*\?/, "").toString();
            if (e === window.location.href) {
                e = ""
            }
            return e ? e : ""
        },
        getParam: function(e) {
            var t = window.location.pathname || "",
                n, i = new RegExp(e.toString() + "/([^\\/]+)", "i");
            if (t.length) {
                n = t.match(i);
                if (n && n.length === 2) {
                    return (n[1] || 1) | 0
                }
            }
            return false
        },
        setParam: function(e, t) {
            var r = window.location.pathname,
                o = i.getQueryString();
            t = t || {};
            n.each(e, function(e, t) {
                if (i.getParam(t)) {
                    r = r.replace(new RegExp("(" + t + ")/([^/]?)+(/)?(.*)"), e && e.toString().length ? "$1/" + e + "/$4" : "$4")
                } else if (e && e.toString().length) {
                    if (r.charAt(r.length - 1) !== "/") {
                        r += "/"
                    }
                    r += t + "/" + e + "/"
                }
            });
            return r + (t.only_path !== true && o.length ? "?" + o : "")
        },
        getQueryParam: function(e) {
            var t, r, o, s, a = "?" + i.getQueryString().replace(/\[/g, "%5B").replace(/\]/g, "%5D");
            e = e.replace(/\[/g, "%5B").replace(/\]/g, "%5D");
            t = "[\\?&]" + e + "=([^&#]*)";
            r = new RegExp(t);
            o = r.exec(a);
            if (n.isNull(o)) {
                return false
            }
            if (e === "phone") {
                s = o[1]
            } else {
                s = o[1].replace(/\+/g, " ")
            }
            return decodeURIComponent(s)
        },
        setQueryParam: function(e, t) {
            var r, o, s, a, l;
            t = t || {};
            r = window.location.pathname;
            o = n.isString(t.query_string) ? t.query_string : i.getQueryString();
            if (o.indexOf("?") !== 0) {
                o = "?" + o
            }
            n.each(e, function(e, t) {
                s = "";
                if (o !== "?") {
                    s = o.indexOf("?") === -1 ? "?" : "&"
                }
                o = this.removeQueryParam(t, o);
                if (typeof e === "object") {
                    o = o + s + t + "=" + e.join("&" + t + "=")
                } else {
                    e = encodeURIComponent(e);
                    a = new RegExp("([?|&])" + t.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&") + "=.*?(&|$)", "ig");
                    l = o.match(a);
                    if (l) {
                        if (e) {
                            o = o.replace(a, "$1" + t + "=" + e + "$2")
                        } else {
                            var n = l[0],
                                i = n[0],
                                r = n[n.length - 1],
                                u = "";
                            if (r === "&") {
                                u = i
                            }
                            o = o.replace(a, u)
                        }
                    } else {
                        o += e ? s + t + "=" + e : ""
                    }
                }
            }, this);
            if (o.indexOf("?") !== 0) {
                o = "?" + o
            }
            return (t.only_query_string === true ? "" : r) + (o === "?" ? "" : o)
        },
        removeQueryParam: function(e, t) {
            var r, o = n.isUndefined(t) ? i.getQueryString() : t,
                s = (o.replace(/\+/g, " ") || "").split(/[&;]/g);
            if (!n.isArray(e)) {
                e = [e]
            }
            n.each(e, function(e, t) {
                r = decodeURIComponent(e) + "=";
                for (t = s.length; t-- > 0;) {
                    if (decodeURIComponent(s[t]).lastIndexOf(r, 0) !== -1) {
                        s.splice(t, 1)
                    }
                }
            });
            return s.join("&")
        }
    };
    return i
});
