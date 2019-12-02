define("twig-core", ['twig89'], function() {
    var e = void 0,
        t = !0,
        n = null,
        i = !1,
        r, o = this;
    var s = /["'<>]/;

    function a(e) {
        var t = "" + e;
        var n = s.exec(t);
        if (!n) {
            return t
        }
        var i;
        var r = "";
        var o = 0;
        var a = 0;
        for (o = n.index; o < t.length; o++) {
            switch (t.charCodeAt(o)) {
                case 34:
                    i = "&quot;";
                    break;
                case 39:
                    i = "&#39;";
                    break;
                case 60:
                    i = "&lt;";
                    break;
                case 62:
                    i = "&gt;";
                    break;
                default:
                    continue
            }
            if (a !== o) {
                r += t.substring(a, o)
            }
            a = o + 1;
            r += i
        }
        return a !== o ? r + t.substring(a, o) : r
    }

    function l(t, n, i) {
        t = t.split(".");
        i = i || o;
        !(t[0] in i) && i.execScript && i.execScript("var " + t[0]);
        for (var r; t.length && (r = t.shift());) {
            !t.length && n !== e ? i[r] = n : i = i[r] ? i[r] : i[r] = {}
        }
    }

    function u(e) {
        var t = typeof e;
        if ("object" == t) {
            if (e) {
                if (e instanceof Array) {
                    return "array"
                }
                if (e instanceof Object) {
                    return t
                }
                var n = Object.prototype.toString.call(e);
                if ("[object Window]" == n) {
                    return "object"
                }
                if ("[object Array]" == n || "number" == typeof e.length && "undefined" != typeof e.splice &&
                    "undefined" != typeof e.propertyIsEnumerable && !e.propertyIsEnumerable("splice")) {
                    return "array"
                }
                if ("[object Function]" == n || "undefined" != typeof e.call &&
                    "undefined" != typeof e.propertyIsEnumerable && !e.propertyIsEnumerable("call")) {
                    return "function"
                }
            } else {
                return "null"
            }
        } else {
            if ("function" == t && "undefined" == typeof e.call) {
                return "object"
            }
        }
        return t
    }

    function c(e) {
        return "array" == u(e)
    }

    function d(e) {
        return "string" == typeof e
    }

    function f(e) {
        var t = typeof e;
        return "object" == t && e != n || "function" == t
    }
    var h = "closure_uid_" + Math.floor(2147483648 * Math.random()).toString(36),
        p = 0;

    function g(e, t, n) {
        return e.call.apply(e.bind, arguments)
    }

    function m(e, t, n) {
        if (!e) {
            throw Error()
        }
        if (2 < arguments.length) {
            var i = Array.prototype.slice.call(arguments, 2);
            return function() {
                var n = Array.prototype.slice.call(arguments);
                Array.prototype.unshift.apply(n, i);
                return e.apply(t, n)
            }
        }
        return function() {
            return e.apply(t, arguments)
        }
    }

    function v(e, t, i) {
        v = Function.prototype.bind && -1 != Function.prototype.bind.toString().indexOf("native code") ? g : m;
        return v.apply(n, arguments)
    }

    function b(t, n) {
        l(t, n, e)
    }

    function y(e, t) {
        function n() {}
        n.prototype = t.prototype;
        e.$superClass_$ = t.prototype;
        e.prototype = new n
    }

    function M(e, t) {
        for (var n = 1; n < arguments.length; n++) {
            var i = String(arguments[n]).replace(/\$/g, "$$$$"),
                e = e.replace(/\%s/, i)
        }
        return e
    }
    var _ = /&/g,
        w = /</g,
        A = />/g,
        x = /\"/g,
        N = /[&<>\"]/,
        C = {
            "\0": "\\0",
            "\b": "\\b",
            "\f": "\\f",
            "\n": "\\n",
            "\r": "\\r",
            "\t": "\\t",
            "\v": "\\x0B",
            '"': '\\"',
            "\\": "\\\\"
        },
        T = {
            "'": "\\'"
        };

    function O(e, t) {
        e != n && this.append.apply(this, arguments)
    }
    O.prototype.$buffer_$ = "";
    O.prototype.append = function e(t, i, r) {
        this.$buffer_$ += t;
        if (i != n) {
            for (var o = 1; o < arguments.length; o++) {
                this.$buffer_$ += arguments[o]
            }
        }
        return this
    };
    O.prototype.toString = function e() {
        return this.$buffer_$
    };

    function z(e, t, n) {
        var i = Object.keys(e || {}),
            r;
        for (var o = 0, s = i.length; o < s; o++) {
            r = i[o];
            t.call(n, e[r], r, e)
        }
    }

    function E(e) {
        var t = [],
            n = 0,
            i;
        for (i in e) {
            t[n++] = e[i]
        }
        return t
    }

    function S(e) {
        var t = [],
            n = 0,
            i;
        for (i in e) {
            t[n++] = i
        }
        return t
    }
    var L = "constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");

    function P(e, t) {
        for (var n, i, r = 1; r < arguments.length; r++) {
            i = arguments[r];
            for (n in i) {
                e[n] = i[n]
            }
            for (var o = 0; o < L.length; o++) {
                n = L[o], Object.prototype.hasOwnProperty.call(i, n) && (e[n] = i[n])
            }
        }
    }

    function $(e) {
        Error.captureStackTrace ? Error.captureStackTrace(this, $) : this.stack = Error().stack || "";
        e && (this.message = String(e))
    }
    y($, Error);

    function k(e, t) {
        t.unshift(e);
        $.call(this, M.apply(n, t));
        t.shift();
        this.$messagePattern$ = e
    }
    y(k, $);

    function D(e, t, n) {
        if (!e) {
            var i = Array.prototype.slice.call(arguments, 2),
                r = "Assertion failed";
            if (t) {
                var r = r + (": " + t),
                    o = i
            }
            throw new k("" + r, o || [])
        }
    }
    var R = Array.prototype,
        q = R.indexOf ? function(e, t, i) {
            D(e.length != n);
            return R.indexOf.call(e, t, i)
        } : function(e, t, i) {
            i = i == n ? 0 : 0 > i ? Math.max(0, e.length + i) : i;
            if (d(e)) {
                return !d(t) || 1 != t.length ? -1 : e.indexOf(t, i)
            }
            for (; i < e.length; i++) {
                if (i in e && e[i] === t) {
                    return i
                }
            }
            return -1
        },
        I = R.forEach ? function(e, t, i) {
            D(e.length != n);
            R.forEach.call(e, t, i)
        } : function(e, t, n) {
            for (var i = e.length, r = d(e) ? e.split("") : e, o = 0; o < i; o++) {
                o in r && t.call(n, r[o], o, e)
            }
        };
    var B = v,
        h = "twig_ui_" + Math.floor(2147483648 * Math.random()).toString(36);

    function F(r) {
        return n === r || i === r || e === r || 0 === r ? t : j(r) ? 0 === X(r) : i
    }

    function W(e, t) {
        P.apply(n, Array.prototype.slice.call(arguments, 0));
        return e
    }

    function j(e) {
        return c(e) || d(e) || f(e)
    }

    function X(e) {
        if (c(e)) {
            e = e.length
        } else {
            if (d(e)) {
                e = e.length
            } else {
                if (f(e)) {
                    var t = 0,
                        n;
                    for (n in e) {
                        t++
                    }
                    e = t
                } else {
                    e = ("number" === typeof e ? e.toString() : "").length
                }
            }
        }
        return e
    }

    function H(e, t, n) {
        c(e) ? I(e, t, n) : z(e, t, n)
    }

    function U(e) {
        return e.replace(/[\.\\+*?\[\]<>(){}^$=!|:-]/g, "\\$&")
    }

    function V(e) {
        this.env_ = e;
        this.$blocks_$ = [];
        this.$traits_$ = {}
    }
    r = V.prototype;
    r.$getBlocks$ = function e() {
        return this.$blocks_$
    };
    r.$setBlocks$ = function e(t) {
        this.$blocks_$ = t
    };
    r.$setTraits$ = function e(t) {
        this.$traits_$ = t
    };
    r.getParent = function e(t) {
        t = this.getParent_(t);
        return i === t ? i : this.env_.$createTemplate$(t)
    };
    r.$renderParentBlock$ = function e(t, n, r) {
        if (t in this.$traits_$) {
            var o = new O;
            this.$traits_$[t](o, n, r || {});
            return o.toString()
        }
        o = this.getParent(n);
        if (i !== o) {
            return o.$renderBlock$(t, n, r)
        }
        throw Error("The template '" + this.$getTemplateName$() + "' has no parent, and no trait defining the block '" +
            t + "'.")
    };
    r.$renderBlock$ = function e(t, r, o) {
        if (o && t in o) {
            var s = new O,
                a = o[t];
            delete o[t];
            a(s, r, o);
            return s.toString()
        }
        if (t in this.$blocks_$) {
            return s = new O, this.$blocks_$[t](s, r, o || n), s.toString()
        }
        s = this.getParent(r);
        return i !== s ? s.$renderBlock$(t, r, o) : ""
    };
    r.$render$ = function e(t, n) {
        var i = new O;
        this.render_(i, t || {}, n || {});
        return i.toString()
    };
    r.$callMacro$ = function t(n, i, r, o) {
        if (!n["get" + i]) {
            throw Error("The macro " + i + " is not defined in " + n.$getTemplateName$() + ".")
        }
        if (o === e) {
            return n["get" + i].apply(n, r)
        }
        throw Error("Positional arguments, or default values in macro arguments are not supported, yet.")
    };

    function Y(e) {
        this.$content_$ = e
    }
    Y.prototype.toString = function e() {
        return this.$content_$
    };

    function G(e, t, i, r, o) {
        if (o && t instanceof Y) {
            return t.toString()
        }
        t = t == n ? "" : String(t);
        if (Z === i) {
            e = String(t);
            if (e.quote) {
                t = e.quote()
            } else {
                t = ['"'];
                for (i = 0; i < e.length; i++) {
                    var s = e.charAt(i),
                        l = s.charCodeAt(0),
                        r = t,
                        o = i + 1,
                        u;
                    if (!(u = C[s])) {
                        if (!(31 < l && 127 > l)) {
                            if (s in T) {
                                s = T[s]
                            } else {
                                if (s in C) {
                                    s = T[s] = C[s]
                                } else {
                                    l = s;
                                    u = s.charCodeAt(0);
                                    if (31 < u && 127 > u) {
                                        l = s
                                    } else {
                                        if (256 > u) {
                                            if (l = "\\x", 16 > u || 256 < u) {
                                                l += "0"
                                            }
                                        } else {
                                            l = "\\u", 4096 > u && (l += "0")
                                        }
                                        l += u.toString(16).toUpperCase()
                                    }
                                    s = T[s] = l
                                }
                            }
                        }
                        u = s
                    }
                    r[o] = u
                }
                t.push('"');
                t = t.join("")
            }
            return t.substring(1, t.length - 1)
        }
        if ("light_escape" === i) {
            return a(t)
        }
        if (!i || K === i) {
            return e = t, N.test(e) && (-1 != e.indexOf("&") && (e = e.replace(_, "&amp;")), -1 != e.indexOf("<") && (
                e = e.replace(w, "&lt;")
            ), -1 != e.indexOf(">") && (e = e.replace(A, "&gt;")), -1 != e.indexOf('"') && (
                e = e.replace(x, "&quot;")
            )), e
        }
        if (Q === i) {
            return encodeURIComponent(t)
        }
        throw Error("The type '" + i + "' is not supported.")
    }
    var K = "html",
        Z = "js",
        Q = "url";

    function J() {
        this.$extensions_$ = {};
        this.$filters_$ = {};
        this.$functions_$ = {};
        this.$tests_$ = {};
        this.$createdTemplates_$ = {};
        this.$globals_$ = {};
        this.$runtimeInitialized$ = i;
        this.$charset_$ = "UTF-8"
    }
    r = J.prototype;
    r.$render$ = function e(t, n) {
        var i = this.$createTemplate$(t);
        return i.$render$.call(i, W({}, this.$globals_$, n || {}))
    };
    r.filter = function e(t, i, r) {
        if (!(t in this.$filters_$)) {
            throw Error("The filter '" + t + "' does not exist.")
        }
        return this.$filters_$[t].apply(n, Array.prototype.slice.call(arguments, 1))
    };
    r.$invoke$ = function e(t, i, r) {
        if (!(t in this.$functions_$)) {
            throw Error("The function '" + t + "' does not exist.")
        }
        return this.$functions_$[t].apply(n, Array.prototype.slice.call(arguments, 1))
    };
    r.test = function e(t, i, r) {
        if (!(t in this.$tests_$)) {
            throw Error("The test '" + t + "' does not exist.")
        }
        return this.$tests_$[t].apply(n, Array.prototype.slice.call(arguments, 1))
    };
    r.escape = function e(t, n, i, r) {
        return G(0, t, n, 0, r)
    };
    r.$macro$ = function e(t, n, i) {
        var r = this.$createTemplate$(t),
            o = r["get" + n];
        if (!o) {
            throw Error("The macro '" + n + "' does not exist on template '" + r.$getTemplateName$() + "'.")
        }
        return o.apply(r, Array.prototype.slice.call(arguments, 2)).toString()
    };
    r.$setFilter$ = function e(t, n) {
        this.$filters_$[t] = n
    };
    r.$setFunction$ = function e(t, n) {
        this.$functions_$[t] = n
    };
    r.$setTest$ = function e(t, n) {
        this.$tests_$[t] = n
    };
    r.$setGlobals$ = function e(t) {
        this.$globals_$ = t
    };
    r.$setGlobal$ = function e(t, n) {
        this.$globals_$[t] = n
    };
    r.$getGlobals$ = function e() {
        return this.$globals_$
    };
    r.$initRuntime$ = function e() {
        this.$runtimeInitialized$ = t;
        z(this.$extensions_$, function(e) {
            e.$initRuntime$()
        }, this)
    };
    r.$hasExtension$ = function e(t) {
        return t in this.$extensions_$
    };
    r.getExtension = function e(t) {
        if (!(t in this.$extensions_$)) {
            throw Error('The "' + t + '" extension is not enabled.')
        }
        return this.$extensions_$[t]
    };
    r.$addExtension$ = function e(t) {
        this.$extensions_$[t.getName()] = t
    };
    r.$removeExtension$ = function e(t) {
        delete this.$extensions_$[t]
    };
    r.$setExtensions$ = function e(t) {
        z(t, function(e) {
            this.$addExtension$(e)
        })
    };
    r.$getExtensions$ = function e() {
        return this.$extensions_$
    };
    r.$createTemplate$ = function e(t) {
        var n = t[h] || (t[h] = ++p);
        if (n in this.$createdTemplates_$) {
            return this.$createdTemplates_$[n]
        }
        i === this.$runtimeInitialized$ && this.$initRuntime$();
        t = new t(this);
        return this.$createdTemplates_$[n] = t
    };
    b("goog.provide", function(e) {
        l(e)
    });
    b("goog.require", function() {});
    b("twig.attr", function(t, n, r, o, s) {
        var a = o || "any";
        var l = s !== e ? s : i;
        if (!f(t) && !c(t)) {
            return l ? false : null
        }
        if (n in t) {
            if ("array" !== a && "function" == u(t[n])) {
                if (l) {
                    return true
                }
                return t[n].apply(t, r || [])
            }
            if ("method" !== a) {
                if (l) {
                    return true
                }
                return t[n]
            }
        }
        if ("array" === a || c(t)) {
            if (l) {
                return false
            }
            return ""
        }
        n = n.toLowerCase();
        var d = "get" + n;
        var h = "is" + n;
        var p = Object.keys(t).find(function(e) {
            var n = t[e];
            e = e.toLowerCase();
            return e === d || e === h
        });
        if (p && "function" == u(t[p])) {
            if (l) {
                return true
            }
            return t[p].apply(t, r || [])
        }
        if (l) {
            return false
        }
        return ""
    });
    b("twig.bind", B);
    b("twig.inherits", y);
    b("twig.extend", W);
    b("twig.spaceless", function(e) {
        return e.replace(/>[\s\xa0]+</g, "><").replace(/^[\s\xa0]+|[\s\xa0]+$/g, "")
    });
    b("twig.range", function(e, t) {
        for (var n = []; e <= t; e += 1) {
            n.push(e)
        }
        return n
    });
    b("twig.contains", function(e, n) {
        var r;
        if (c(e)) {
            r = 0 <= q(e, n)
        } else {
            if (d(e)) {
                r = -1 != e.indexOf(n) && ("" !== n || "" === e)
            } else {
                e: {
                    for (r in e) {
                        if (e[r] == n) {
                            r = t;
                            break e
                        }
                    }
                    r = i
                }
            }
        }
        return r
    });
    b("twig.countable", j);
    b("twig.count", X);
    b("twig.forEach", H);
    b("twig.empty", F);
    b("twig.createObj", function(e) {
        for (var t = {}, n = 0; n < arguments.length; n += 2) {
            t[arguments[n]] = arguments[n + 1]
        }
        return t
    });
    b("twig.pregQuote", U);
    b("twig.filter.capitalize", function(e, t) {
        return t ? t.charAt(0).toUpperCase() + t.substring(1) : ""
    });
    b("twig.filter.escape", G);
    b("twig.filter.first", function(e, t) {
        return c(t) ? t[0] : f(t) ? t[Object.keys(t)[0]] : d(t) ? t.charAt(0) : ""
    });
    b("twig.filter.length", function(e, t) {
        return X(t)
    });
    b("twig.filter.def", function(e, t) {
        return F(e) ? t || "" : e
    });
    b("twig.filter.replace", function(e, t) {
        for (var n in t) {
            var i;
            i = U(n);
            e = e.replace(RegExp(i, "g"), t[n])
        }
        return e
    });
    b("twig.filter.join", function(e, n) {
        var r = n || "",
            o = new O,
            s = t;
        H(e, function(e) {
            s || o.append(r);
            s = i;
            o.append(e)
        });
        return o.toString()
    });
    b("twig.filter.keys", S);
    b("twig.filter.upper", function(e, t) {
        return t.toUpperCase()
    });
    b("twig.filter.lower", function(e, t) {
        return t.toLowerCase()
    });
    b("twig.filter.nl2br", function(e) {
        return e.replace(/\n/g, "<br />")
    });
    b("twig.filter.abs", function(e) {
        return Math.abs(e)
    });
    b("twig.filter.title", function(e, t) {
        return t.split(" ").map(function(e) {
            return e.charAt(0).toUpperCase() + e.substr(1).toLowerCase()
        }).join(" ")
    });
    b("twig.filter.trim", function(e, t) {
        var n = "\n ";
        t && (n = U(t));
        e = e.replace(RegExp("^[" + n + "]+"), "");
        return e = e.replace(RegExp("[" + n + "]+$"), "")
    });
    b("twig.filter.json_encode", function(e) {
        return JSON.stringify(e)
    });
    b("twig.filter.last", function(e, t) {
        if (c(t)) {
            return t[t.length - 1]
        }
        if (f(t)) {
            var n = Object.keys(t);
            return t[n[n.length - 1]]
        }
        return d(t) ? t.charAt(t.length - 1) : ""
    });
    b("twig.filter.reverse", function(e, t) {
        if (c(t)) {
            return t.reverse()
        }
        if (f(t)) {
            for (var n = {}, i = S(t).reverse(), r = 0; r < i.length; r++) {
                n[i[r]] = t[i[r]]
            }
            return n
        }
        return d(t) ? t.split("").reverse().join("") : t
    });
    b("twig.filter.batch", function(e, t, n) {
        for (var i = Array(Math.ceil(e.length / t)), r = i.length * t, o = 0; o < r; o++) {
            var s = Math.floor(o / t);
            "undefined" === typeof i[s] && (i[s] = []);
            "undefined" !== typeof e[o] ? i[s].push(e[o]) : d(n) && i[s].push(n)
        }
        return i
    });
    b("twig.filter.merge", function(e, n) {
        var i = [];
        if (c(e) && c(n)) {
            for (var r = i = e.concat(n), o = {}, s = 0, a = 0; a < r.length;) {
                var l = r[a++],
                    u = f(l) ? "o" + (l[h] || (l[h] = ++p)) : (typeof l).charAt(0) + l;
                Object.prototype.hasOwnProperty.call(o, u) || (o[u] = t, r[s++] = l)
            }
            r.length = s
        } else {
            if (f(e) && f(n)) {
                r = {};
                for (o in e) {
                    r[o] = e[o]
                }
                i = r;
                z(n, function(e, t) {
                    i[t] = e
                })
            }
        }
        return i
    });
    b("twig.functions.max", function(e) {
        return c(e) ? Math.max.apply(n, e) : f(e) ? Math.max.apply(n, E(e)) : Math.max.apply(n, arguments)
    });
    b("twig.functions.min", function(e) {
        return c(e) ? Math.min.apply(n, e) : f(e) ? Math.min.apply(n, E(e)) : Math.min.apply(n, arguments)
    });
    b("twig.functions.random", function(e, t) {
        return c(t) || d(t) ? t[Math.floor(Math.random() * t.length)] : "number" == typeof t ?
            Math.floor(Math.random() * t) : t === n || "undefined" === typeof t ?
            Math.floor(2147483647 * Math.random()) : ""
    });
    b("twig.StringBuffer", O);
    O.prototype.append = O.prototype.append;
    O.prototype.toString = O.prototype.toString;
    b("twig.Environment", J);
    J.prototype.createTemplate = J.prototype.$createTemplate$;
    J.prototype.filter = J.prototype.filter;
    J.prototype.invoke = J.prototype.$invoke$;
    J.prototype.test = J.prototype.test;
    J.prototype.escape = J.prototype.escape;
    J.prototype.macro = J.prototype.$macro$;
    J.prototype.setFilter = J.prototype.$setFilter$;
    J.prototype.setFunction = J.prototype.$setFunction$;
    J.prototype.setTest = J.prototype.$setTest$;
    J.prototype.render = J.prototype.$render$;
    J.prototype.getGlobals = J.prototype.$getGlobals$;
    J.prototype.setGlobals = J.prototype.$setGlobals$;
    J.prototype.setGlobal = J.prototype.$setGlobal$;
    J.prototype.initRuntime = J.prototype.$initRuntime$;
    J.prototype.hasExtension = J.prototype.$hasExtension$;
    J.prototype.getExtension = J.prototype.getExtension;
    J.prototype.addExtension = J.prototype.$addExtension$;
    J.prototype.removeExtension = J.prototype.$removeExtension$;
    J.prototype.setExtensions = J.prototype.$setExtensions$;
    J.prototype.getExtensions = J.prototype.$getExtensions$;
    b("twig.Template", V);
    V.prototype.setTraits = V.prototype.$setTraits$;
    V.prototype.setBlocks = V.prototype.$setBlocks$;
    V.prototype.getBlocks = V.prototype.$getBlocks$;
    V.prototype.renderParentBlock = V.prototype.$renderParentBlock$;
    V.prototype.renderBlock = V.prototype.$renderBlock$;
    V.prototype.callMacro = V.prototype.$callMacro$;
    b("twig.Markup", Y)

    return new J
});
