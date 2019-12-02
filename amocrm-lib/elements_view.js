define("elements_view", ["backbone"], function(e) {
    "use strict";
    var t = /%(\((\w*?)\))?s/g;

    function n(e, n) {
        if (typeof e !== "string") {
            throw new TypeError("Classes and selectors should be strings, check the values in the objects inside _classes and _selectors methods")
        }
        if (typeof n[1] === "object") {
            n = n[1]
        }
        if (!n) {
            throw new TypeError("Selector or class replacement error. Second argument must be an object or an array")
        }
        var i = 1;
        return e.replace(t, function(t, r, o) {
            var s = typeof o !== "undefined",
                a = s ? n[o] : n[i++];
            if (typeof a === "undefined") {
                throw new Error("Replacement is undefined during processing selector: " + e + " for " + (s ? "key " + o : "position " + (i - 1)))
            }
            return a
        })
    }
    var i = e.View.extend({
        _$window: e.$(window),
        _$document: e.$(document),
        _$body: e.$(document.body),
        initialize: function() {
            var t = e.View.prototype.initialize.apply(this, arguments);
            this._cachedClasses = null;
            this._cachedSelectors = null;
            this._cachedElements = {};
            return t
        },
        setElement: function() {
            var t = e.View.prototype.setElement.apply(this, arguments);
            this._data = this.$el.data() || {};
            this._dropElemCache();
            return t
        },
        _classes: function() {
            return {}
        },
        _retrieveClass: function(e) {
            if (!this._cachedClasses) {
                this._cachedClasses = this._classes()
            }
            return this._cachedClasses[e]
        },
        _class: function(e, t) {
            var i = this._retrieveClass(e);
            if (!i) {
                throw new Error("CSS class for `" + e + "` does not found")
            }
            if (arguments.length > 1) {
                i = n(i, arguments)
            }
            return i
        },
        _runClassMethod: function(e, t, n, i) {
            var r = n ? Array.isArray(n) ? this._elem.apply(this, n) : typeof n === "string" ? this._elem(n) : n : this.$el,
                o = Array.isArray(t) ? this._class.apply(this, t) : this._class(t);
            if (typeof i !== "undefined") {
                i.unshift(o)
            } else {
                i = [o]
            }
            return r[e].apply(r, i)
        },
        _hasClass: function(e, t) {
            return this._runClassMethod("hasClass", e, t)
        },
        _addClass: function(e, t) {
            return this._runClassMethod("addClass", e, t)
        },
        _removeClass: function(e, t) {
            return this._runClassMethod("removeClass", e, t)
        },
        _toggleClass: function(e, t, n) {
            if (arguments.length === 2) {
                if (typeof t === "boolean") {
                    n = t;
                    t = undefined
                }
            }
            return this._runClassMethod("toggleClass", e, t, [n])
        },
        _selectors: function() {
            return {}
        },
        _retrieveSelector: function(e) {
            if (!this._cachedSelectors) {
                this._cachedSelectors = this._selectors()
            }
            return this._cachedSelectors[e]
        },
        _selector: function(e, t) {
            var i = this._getCacheKey.apply(this, arguments),
                r = this._retrieveSelector(i);
            if (typeof r === "undefined") {
                r = this._cachedSelectors[e];
                if (typeof r === "undefined") {
                    r = "." + this._class(e);
                    this._cachedSelectors[e] = r
                }
                if (arguments.length > 1) {
                    r = n(r, arguments);
                    this._cachedSelectors[i] = r
                }
            }
            return r
        },
        _hasDescribedSelector: function(e) {
            return !!(this._retrieveClass(e) || this._retrieveSelector(e))
        },
        _elem: function(e, t) {
            var n = this._getCacheKey.apply(this, arguments),
                i = this._cachedElements[n];
            if (i) {
                return i
            }
            i = this._findElem.apply(this, arguments);
            this._cachedElements[n] = i;
            return i
        },
        _getCacheKey: function(e, t) {
            return JSON.stringify(Array.prototype.slice.call(arguments, 0))
        },
        _findElem: function(e, t) {
            return this.$(this._selector.apply(this, arguments))
        },
        _dropElemCache: function(e) {
            if (e) {
                delete this._cachedElements[this._getCacheKey.apply(this, arguments)]
            } else {
                this._cachedElements = {}
            }
            return this
        },
        _getElemData: function(e, t) {
            var n = this._elem(e).data();
            return t ? n[t] : n
        }
    });
    return i
});
