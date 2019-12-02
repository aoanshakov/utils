define("store", [], function() {
    var e = {},
        t = typeof window != "undefined" ? window : global,
        n = t.document,
        i = "localStorage",
        r = "script",
        o;
    e.disabled = false;
    e.version = "1.3.20";
    e.set = function(e, t) {};
    e.get = function(e, t) {};
    e.has = function(t) {
        return e.get(t) !== undefined
    };
    e.remove = function(e) {};
    e.clear = function() {};
    e.transact = function(t, n, i) {
        if (i == null) {
            i = n;
            n = null
        }
        if (n == null) {
            n = {}
        }
        var r = e.get(t, n);
        i(r);
        e.set(t, r)
    };
    e.getAll = function() {};
    e.forEach = function() {};
    e.serialize = function(e) {
        return JSON.stringify(e)
    };
    e.deserialize = function(e) {
        if (typeof e != "string") {
            return undefined
        }
        try {
            return JSON.parse(e)
        } catch (t) {
            return e || undefined
        }
    };

    function s() {
        try {
            return i in t && t[i]
        } catch (e) {
            return false
        }
    }
    if (s()) {
        o = t[i];
        e.set = function(t, n) {
            if (n === undefined) {
                return e.remove(t)
            }
            o.setItem(t, e.serialize(n));
            return n
        };
        e.get = function(t, n) {
            var i = e.deserialize(o.getItem(t));
            return i === undefined ? n : i
        };
        e.remove = function(e) {
            o.removeItem(e)
        };
        e.clear = function() {
            o.clear()
        };
        e.getAll = function() {
            var t = {};
            e.forEach(function(e, n) {
                t[e] = n
            });
            return t
        };
        e.forEach = function(t) {
            for (var n = 0; n < o.length; n++) {
                var i = o.key(n);
                t(i, e.get(i))
            }
        }
    } else if (n && n.documentElement.addBehavior) {
        var a, l;
        try {
            l = new ActiveXObject("htmlfile");
            l.open();
            l.write("<" + r + ">document.w=window</" + r + '><iframe src="/favicon.ico"></iframe>');
            l.close();
            a = l.w.frames[0].document;
            o = a.createElement("div")
        } catch (e) {
            o = n.createElement("div");
            a = n.body
        }
        var u = function(t) {
            return function() {
                var n = Array.prototype.slice.call(arguments, 0);
                n.unshift(o);
                a.appendChild(o);
                o.addBehavior("#default#userData");
                o.load(i);
                var r = t.apply(e, n);
                a.removeChild(o);
                return r
            }
        };
        var c = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]", "g");
        var d = function(e) {
            return e.replace(/^d/, "___$&").replace(c, "___")
        };
        e.set = u(function(t, n, r) {
            n = d(n);
            if (r === undefined) {
                return e.remove(n)
            }
            t.setAttribute(n, e.serialize(r));
            t.save(i);
            return r
        });
        e.get = u(function(t, n, i) {
            n = d(n);
            var r = e.deserialize(t.getAttribute(n));
            return r === undefined ? i : r
        });
        e.remove = u(function(e, t) {
            t = d(t);
            e.removeAttribute(t);
            e.save(i)
        });
        e.clear = u(function(e) {
            var t = e.XMLDocument.documentElement.attributes;
            e.load(i);
            for (var n = t.length - 1; n >= 0; n--) {
                e.removeAttribute(t[n].name)
            }
            e.save(i)
        });
        e.getAll = function(t) {
            var n = {};
            e.forEach(function(e, t) {
                n[e] = t
            });
            return n
        };
        e.forEach = u(function(t, n) {
            var i = t.XMLDocument.documentElement.attributes;
            for (var r = 0, o; o = i[r]; ++r) {
                n(o.name, e.deserialize(t.getAttribute(o.name)))
            }
        })
    }
    try {
        var f = "__storejs__";
        e.set(f, f);
        if (e.get(f) != f) {
            e.disabled = true
        }
        e.remove(f)
    } catch (t) {
        e.disabled = true
    }
    e.enabled = !e.disabled;
    return e
});
