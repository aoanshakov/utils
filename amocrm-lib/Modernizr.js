define('Modernizr', [], function () {
    window.Modernizr = function(e, t, n) {
        function i(e) {
            v.cssText = e
        }

        function r(e, t) {
            return i(_.join(e + ";") + (t || ""))
        }

        function o(e, t) {
            return typeof e === t
        }

        function s(e, t) {
            return !!~("" + e).indexOf(t)
        }

        function a(e, t) {
            for (var i in e) {
                var r = e[i];
                if (!s(r, "-") && v[r] !== n) return t == "pfx" ? r : !0
            }
            return !1
        }

        function l(e, t, i) {
            for (var r in e) {
                var s = t[e[r]];
                if (s !== n) return i === !1 ? e[r] : o(s, "function") ? s.bind(i || t) : s
            }
            return !1
        }

        function u(e, t, n) {
            var i = e.charAt(0).toUpperCase() + e.slice(1),
                r = (e + " " + A.join(i + " ") + i).split(" ");
            return o(t, "string") || o(t, "undefined") ? a(r, t) : (r = (e + " " + x.join(i + " ") + i).split(" "), l(r, t, n))
        }

        function c() {
            f.input = function(n) {
                for (var i = 0, r = n.length; i < r; i++) O[n[i]] = n[i] in b;
                return O.list && (O.list = !!t.createElement("datalist") && !!e.HTMLDataListElement), O
            }("autocomplete autofocus list placeholder max min multiple pattern required step".split(" ")), f.inputtypes = function(e) {
                for (var i = 0, r, o, s, a = e.length; i < a; i++) b.setAttribute("type", o = e[i]), r = b.type !== "text", r && (b.value = y, b.style.cssText = "position:absolute;visibility:hidden;", /^range$/.test(o) && b.style.WebkitAppearance !== n ? (p.appendChild(b), s = t.defaultView, r = s.getComputedStyle && s.getComputedStyle(b, null).WebkitAppearance !== "textfield" && b.offsetHeight !== 0, p.removeChild(b)) : /^(search|tel)$/.test(o) || (/^(url|email)$/.test(o) ? r = b.checkValidity && b.checkValidity() === !1 : r = b.value != y)), T[e[i]] = !!r;
                return T
            }("search tel url email datetime date month week time datetime-local number range color".split(" "))
        }
        var d = "2.6.2",
            f = {},
            h = !0,
            p = t.documentElement,
            g = "modernizr",
            m = t.createElement(g),
            v = m.style,
            b = t.createElement("input"),
            y = ":)",
            M = {}.toString,
            _ = " -webkit- -moz- -o- -ms- ".split(" "),
            w = "Webkit Moz O ms",
            A = w.split(" "),
            x = w.toLowerCase().split(" "),
            N = {
                svg: "http://www.w3.org/2000/svg"
            },
            C = {},
            T = {},
            O = {},
            z = [],
            E = z.slice,
            S, L = function(e, n, i, r) {
                var o, s, a, l, u = t.createElement("div"),
                    c = t.body,
                    d = c || t.createElement("body");
                if (parseInt(i, 10))
                    while (i--) a = t.createElement("div"), a.id = r ? r[i] : g + (i + 1), u.appendChild(a);
                return o = ["&#173;", '<style id="s', g, '">', e, "</style>"].join(""), u.id = g, (c ? u : d).innerHTML += o, d.appendChild(u), c || (d.style.background = "", d.style.overflow = "hidden", l = p.style.overflow, p.style.overflow = "hidden", p.appendChild(d)), s = n(u, e), c ? u.parentNode.removeChild(u) : (d.parentNode.removeChild(d), p.style.overflow = l), !!s
            },
            P = function() {
                function e(e, r) {
                    r = r || t.createElement(i[e] || "div"), e = "on" + e;
                    var s = e in r;
                    return s || (r.setAttribute || (r = t.createElement("div")), r.setAttribute && r.removeAttribute && (r.setAttribute(e, ""), s = o(r[e], "function"), o(r[e], "undefined") || (r[e] = n), r.removeAttribute(e))), r = null, s
                }
                var i = {
                    select: "input",
                    change: "input",
                    submit: "form",
                    reset: "form",
                    error: "img",
                    load: "img",
                    abort: "img"
                };
                return e
            }(),
            $ = {}.hasOwnProperty,
            k;
        !o($, "undefined") && !o($.call, "undefined") ? k = function(e, t) {
            return $.call(e, t)
        } : k = function(e, t) {
            return t in e && o(e.constructor.prototype[t], "undefined")
        }, Function.prototype.bind || (Function.prototype.bind = function(e) {
            var t = this;
            if (typeof t != "function") throw new TypeError;
            var n = E.call(arguments, 1),
                i = function() {
                    if (this instanceof i) {
                        var r = function() {};
                        r.prototype = t.prototype;
                        var o = new r,
                            s = t.apply(o, n.concat(E.call(arguments)));
                        return Object(s) === s ? s : o
                    }
                    return t.apply(e, n.concat(E.call(arguments)))
                };
            return i
        }), C.flexbox = function() {
            return u("flexWrap")
        }, C.flexboxlegacy = function() {
            return u("boxDirection")
        }, C.canvas = function() {
            var e = t.createElement("canvas");
            return !!e.getContext && !!e.getContext("2d")
        }, C.canvastext = function() {
            return !!f.canvas && !!o(t.createElement("canvas").getContext("2d").fillText, "function")
        }, C.webgl = function() {
            return !!e.WebGLRenderingContext
        }, C.geolocation = function() {
            return "geolocation" in navigator
        }, C.postmessage = function() {
            return !!e.postMessage
        }, C.websqldatabase = function() {
            return !!e.openDatabase
        }, C.indexedDB = function() {
            return !!u("indexedDB", e)
        }, C.hashchange = function() {
            return P("hashchange", e) && (t.documentMode === n || t.documentMode > 7)
        }, C.history = function() {
            return !!e.history && !!history.pushState
        }, C.draganddrop = function() {
            var e = t.createElement("div");
            return "draggable" in e || "ondragstart" in e && "ondrop" in e
        }, C.websockets = function() {
            return "WebSocket" in e || "MozWebSocket" in e
        }, C.rgba = function() {
            return i("background-color:rgba(150,255,150,.5)"), s(v.backgroundColor, "rgba")
        }, C.hsla = function() {
            return i("background-color:hsla(120,40%,100%,.5)"), s(v.backgroundColor, "rgba") || s(v.backgroundColor, "hsla")
        }, C.multiplebgs = function() {
            return i("background:url(https://),url(https://),red url(https://)"), /(url\s*\(.*?){3}/.test(v.background)
        }, C.backgroundsize = function() {
            return u("backgroundSize")
        }, C.borderimage = function() {
            return u("borderImage")
        }, C.borderradius = function() {
            return u("borderRadius")
        }, C.boxshadow = function() {
            return u("boxShadow")
        }, C.textshadow = function() {
            return t.createElement("div").style.textShadow === ""
        }, C.opacity = function() {
            return r("opacity:.55"), /^0.55$/.test(v.opacity)
        }, C.cssanimations = function() {
            return u("animationName")
        }, C.csscolumns = function() {
            return u("columnCount")
        }, C.cssgradients = function() {
            var e = "background-image:",
                t = "gradient(linear,left top,right bottom,from(#9f9),to(white));",
                n = "linear-gradient(left top,#9f9, white);";
            return i((e + "-webkit- ".split(" ").join(t + e) + _.join(n + e)).slice(0, -e.length)), s(v.backgroundImage, "gradient")
        }, C.cssreflections = function() {
            return u("boxReflect")
        }, C.csstransforms = function() {
            return !!u("transform")
        }, C.csstransforms3d = function() {
            var e = !!u("perspective");
            return e && "webkitPerspective" in p.style && L("@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}", function(t, n) {
                e = t.offsetLeft === 9 && t.offsetHeight === 3
            }), e
        }, C.csstransitions = function() {
            return u("transition")
        }, C.fontface = function() {
            var e;
            return L('@font-face {font-family:"font";src:url("https://")}', function(n, i) {
                var r = t.getElementById("smodernizr"),
                    o = r.sheet || r.styleSheet,
                    s = o ? o.cssRules && o.cssRules[0] ? o.cssRules[0].cssText : o.cssText || "" : "";
                e = /src/i.test(s) && s.indexOf(i.split(" ")[0]) === 0
            }), e
        }, C.generatedcontent = function() {
            var e;
            return L(["#", g, "{font:0/0 a}#", g, ':after{content:"', y, '";visibility:hidden;font:3px/1 a}'].join(""), function(t) {
                e = t.offsetHeight >= 3
            }), e
        }, C.video = function() {
            var e = t.createElement("video"),
                n = !1;
            try {
                if (n = !!e.canPlayType) n = new Boolean(n), n.ogg = e.canPlayType('video/ogg; codecs="theora"').replace(/^no$/, ""), n.h264 = e.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/, ""), n.webm = e.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/, "")
            } catch (e) {}
            return n
        }, C.audio = function() {
            var e = t.createElement("audio"),
                n = !1;
            try {
                if (n = !!e.canPlayType) n = new Boolean(n), n.ogg = e.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ""), n.mp3 = e.canPlayType("audio/mpeg;").replace(/^no$/, ""), n.wav = e.canPlayType('audio/wav; codecs="1"').replace(/^no$/, ""), n.m4a = (e.canPlayType("audio/x-m4a;") || e.canPlayType("audio/aac;")).replace(/^no$/, "")
            } catch (e) {}
            return n
        }, C.localstorage = function() {
            try {
                return localStorage.setItem(g, g), localStorage.removeItem(g), !0
            } catch (e) {
                return !1
            }
        }, C.sessionstorage = function() {
            try {
                return sessionStorage.setItem(g, g), sessionStorage.removeItem(g), !0
            } catch (e) {
                return !1
            }
        }, C.webworkers = function() {
            return !!e.Worker
        }, C.applicationcache = function() {
            return !!e.applicationCache
        }, C.svg = function() {
            return !!t.createElementNS && !!t.createElementNS(N.svg, "svg").createSVGRect
        }, C.inlinesvg = function() {
            var e = t.createElement("div");
            return e.innerHTML = "<svg/>", (e.firstChild && e.firstChild.namespaceURI) == N.svg
        }, C.smil = function() {
            return !!t.createElementNS && /SVGAnimate/.test(M.call(t.createElementNS(N.svg, "animate")))
        }, C.svgclippaths = function() {
            return !!t.createElementNS && /SVGClipPath/.test(M.call(t.createElementNS(N.svg, "clipPath")))
        };
        for (var D in C) k(C, D) && (S = D.toLowerCase(), f[S] = C[D](), z.push((f[S] ? "" : "no-") + S));
        return f.input || c(), f.addTest = function(e, t) {
                if (typeof e == "object")
                    for (var i in e) k(e, i) && f.addTest(i, e[i]);
                else {
                    e = e.toLowerCase();
                    if (f[e] !== n) return f;
                    t = typeof t == "function" ? t() : t, typeof h != "undefined" && h && (p.className += " " + (t ? "" : "no-") + e), f[e] = t
                }
                return f
            }, i(""), m = b = null,
            function(e, t) {
                function n(e, t) {
                    var n = e.createElement("p"),
                        i = e.getElementsByTagName("head")[0] || e.documentElement;
                    return n.innerHTML = "x<style>" + t + "</style>", i.insertBefore(n.lastChild, i.firstChild)
                }

                function i() {
                    var e = v.elements;
                    return typeof e == "string" ? e.split(" ") : e
                }

                function r(e) {
                    var t = g[e[h]];
                    return t || (t = {}, p++, e[h] = p, g[p] = t), t
                }

                function o(e, n, i) {
                    n || (n = t);
                    if (m) return n.createElement(e);
                    i || (i = r(n));
                    var o;
                    return i.cache[e] ? o = i.cache[e].cloneNode() : d.test(e) ? o = (i.cache[e] = i.createElem(e)).cloneNode() : o = i.createElem(e), o.canHaveChildren && !c.test(e) ? i.frag.appendChild(o) : o
                }

                function s(e, n) {
                    e || (e = t);
                    if (m) return e.createDocumentFragment();
                    n = n || r(e);
                    var o = n.frag.cloneNode(),
                        s = 0,
                        a = i(),
                        l = a.length;
                    for (; s < l; s++) o.createElement(a[s]);
                    return o
                }

                function a(e, t) {
                    t.cache || (t.cache = {}, t.createElem = e.createElement, t.createFrag = e.createDocumentFragment, t.frag = t.createFrag()), e.createElement = function(n) {
                        return v.shivMethods ? o(n, e, t) : t.createElem(n)
                    }, e.createDocumentFragment = Function("h,f", "return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&(" + i().join().replace(/\w+/g, function(e) {
                        return t.createElem(e), t.frag.createElement(e), 'c("' + e + '")'
                    }) + ");return n}")(v, t.frag)
                }

                function l(e) {
                    e || (e = t);
                    var i = r(e);
                    return v.shivCSS && !f && !i.hasCSS && (i.hasCSS = !!n(e, "article,aside,figcaption,figure,footer,header,hgroup,nav,section{display:block}mark{background:#FF0;color:#000}")), m || a(e, i), e
                }
                var u = e.html5 || {},
                    c = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,
                    d = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,
                    f, h = "_html5shiv",
                    p = 0,
                    g = {},
                    m;
                (function() {
                    try {
                        var e = t.createElement("a");
                        e.innerHTML = "<xyz></xyz>", f = "hidden" in e, m = e.childNodes.length == 1 || function() {
                            t.createElement("a");
                            var e = t.createDocumentFragment();
                            return typeof e.cloneNode == "undefined" || typeof e.createDocumentFragment == "undefined" || typeof e.createElement == "undefined"
                        }()
                    } catch (e) {
                        f = !0, m = !0
                    }
                })();
                var v = {
                    elements: u.elements || "abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video",
                    shivCSS: u.shivCSS !== !1,
                    supportsUnknownElements: m,
                    shivMethods: u.shivMethods !== !1,
                    type: "default",
                    shivDocument: l,
                    createElement: o,
                    createDocumentFragment: s
                };
                e.html5 = v, l(t)
            }(this, t), f._version = d, f._prefixes = _, f._domPrefixes = x, f._cssomPrefixes = A, f.hasEvent = P, f.testProp = function(e) {
                return a([e])
            }, f.testAllProps = u, f.testStyles = L, f.prefixed = function(e, t, n) {
                return t ? u(e, t, n) : u(e, "pfx")
            }, p.className = p.className.replace(/(^|\s)no-js(\s|$)/, "$1$2") + (h ? " js " + z.join(" ") : ""), f
    }(this, this.document),
    function(e, t, n) {
        function i(e) {
            return "[object Function]" == p.call(e)
        }

        function r(e) {
            return "string" == typeof e
        }

        function o() {}

        function s(e) {
            return !e || "loaded" == e || "complete" == e || "uninitialized" == e
        }

        function a() {
            var e = g.shift();
            m = 1, e ? e.t ? f(function() {
                ("c" == e.t ? T.injectCss : T.injectJs)(e.s, 0, e.a, e.x, e.e, 1)
            }, 0) : (e(), a()) : m = 0
        }

        function l(e, n, i, r, o, l, u) {
            function c(t) {
                if (!p && s(d.readyState) && (M.r = p = 1, !m && a(), d.onload = d.onreadystatechange = null, t)) {
                    "img" != e && f(function() {
                        y.removeChild(d)
                    }, 50);
                    for (var i in x[n]) x[n].hasOwnProperty(i) && x[n][i].onload()
                }
            }
            var u = u || T.errorTimeout,
                d = t.createElement(e),
                p = 0,
                v = 0,
                M = {
                    t: i,
                    s: n,
                    e: o,
                    a: l,
                    x: u
                };
            1 === x[n] && (v = 1, x[n] = []), "object" == e ? d.data = n : (d.src = n, d.type = e), d.width = d.height = "0", d.onerror = d.onload = d.onreadystatechange = function() {
                c.call(this, v)
            }, g.splice(r, 0, M), "img" != e && (v || 2 === x[n] ? (y.insertBefore(d, b ? null : h), f(c, u)) : x[n].push(d))
        }

        function u(e, t, n, i, o) {
            return m = 0, t = t || "j", r(e) ? l("c" == t ? _ : M, e, t, this.i++, n, i, o) : (g.splice(this.i++, 0, e), 1 == g.length && a()), this
        }

        function c() {
            var e = T;
            return e.loader = {
                load: u,
                i: 0
            }, e
        }
        var d = t.documentElement,
            f = e.setTimeout,
            h = t.getElementsByTagName("script")[0],
            p = {}.toString,
            g = [],
            m = 0,
            v = "MozAppearance" in d.style,
            b = v && !!t.createRange().compareNode,
            y = b ? d : h.parentNode,
            d = e.opera && "[object Opera]" == p.call(e.opera),
            d = !!t.attachEvent && !d,
            M = v ? "object" : d ? "script" : "img",
            _ = d ? "script" : M,
            w = Array.isArray || function(e) {
                return "[object Array]" == p.call(e)
            },
            A = [],
            x = {},
            N = {
                timeout: function(e, t) {
                    return t.length && (e.timeout = t[0]), e
                }
            },
            C, T;
        T = function(e) {
            function t(e) {
                var e = e.split("!"),
                    t = A.length,
                    n = e.pop(),
                    i = e.length,
                    n = {
                        url: n,
                        origUrl: n,
                        prefixes: e
                    },
                    r, o, s;
                for (o = 0; o < i; o++) s = e[o].split("="), (r = N[s.shift()]) && (n = r(n, s));
                for (o = 0; o < t; o++) n = A[o](n);
                return n
            }

            function s(e, r, o, s, a) {
                var l = t(e),
                    u = l.autoCallback;
                l.url.split(".").pop().split("?").shift(), l.bypass || (r && (r = i(r) ? r : r[e] || r[s] || r[e.split("/").pop().split("?")[0]]), l.instead ? l.instead(e, r, o, s, a) : (x[l.url] ? l.noexec = !0 : x[l.url] = 1, o.load(l.url, l.forceCSS || !l.forceJS && "css" == l.url.split(".").pop().split("?").shift() ? "c" : n, l.noexec, l.attrs, l.timeout), (i(r) || i(u)) && o.load(function() {
                    c(), r && r(l.origUrl, a, s), u && u(l.origUrl, a, s), x[l.url] = 2
                })))
            }

            function a(e, t) {
                function n(e, n) {
                    if (e) {
                        if (r(e)) n || (u = function() {
                            var e = [].slice.call(arguments);
                            c.apply(this, e), d()
                        }), s(e, u, t, 0, a);
                        else if (Object(e) === e)
                            for (h in f = function() {
                                    var t = 0,
                                        n;
                                    for (n in e) e.hasOwnProperty(n) && t++;
                                    return t
                                }(), e) e.hasOwnProperty(h) && (!n && !--f && (i(u) ? u = function() {
                                var e = [].slice.call(arguments);
                                c.apply(this, e), d()
                            } : u[h] = function(e) {
                                return function() {
                                    var t = [].slice.call(arguments);
                                    e && e.apply(this, t), d()
                                }
                            }(c[h])), s(e[h], u, t, h, a))
                    } else !n && d()
                }
                var a = !!e.test,
                    l = e.load || e.both,
                    u = e.callback || o,
                    c = u,
                    d = e.complete || o,
                    f, h;
                n(a ? e.yep : e.nope, !!l), l && n(l)
            }
            var l, u, d = this.yepnope.loader;
            if (r(e)) s(e, 0, d, 0);
            else if (w(e))
                for (l = 0; l < e.length; l++) u = e[l], r(u) ? s(u, 0, d, 0) : w(u) ? T(u) : Object(u) === u && a(u, d);
            else Object(e) === e && a(e, d)
        }, T.addPrefix = function(e, t) {
            N[e] = t
        }, T.addFilter = function(e) {
            A.push(e)
        }, T.errorTimeout = 1e4, null == t.readyState && t.addEventListener && (t.readyState = "loading", t.addEventListener("DOMContentLoaded", C = function() {
            t.removeEventListener("DOMContentLoaded", C, 0), t.readyState = "complete"
        }, 0)), e.yepnope = c(), e.yepnope.executeStack = a, e.yepnope.injectJs = function(e, n, i, r, l, u) {
            var c = t.createElement("script"),
                d, p, r = r || T.errorTimeout;
            c.src = e;
            for (p in i) c.setAttribute(p, i[p]);
            n = u ? a : n || o, c.onreadystatechange = c.onload = function() {
                !d && s(c.readyState) && (d = 1, n(), c.onload = c.onreadystatechange = null)
            }, f(function() {
                d || (d = 1, n(1))
            }, r), l ? c.onload() : h.parentNode.insertBefore(c, h)
        }, e.yepnope.injectCss = function(e, n, i, r, s, l) {
            var r = t.createElement("link"),
                u, n = l ? a : n || o;
            r.href = e, r.rel = "stylesheet", r.type = "text/css";
            for (u in i) r.setAttribute(u, i[u]);
            s || (h.parentNode.insertBefore(r, h), f(n, 0))
        }
    }(this, document), Modernizr.load = function() {
        yepnope.apply(window, [].slice.call(arguments, 0))
    };
});
