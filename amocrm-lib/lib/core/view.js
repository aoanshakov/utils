define("lib/core/view", ["underscore", "elements_view", "backbone", "lib/common/fn"], function(t, i, s, n) {
    "use strict";
    var o, r = ".default:page:ns";
    i.prototype.remove = function(e) {
        this.undelegateEvents().$el.off(this.ns);
        if (e === false) {
            this.stopListening()
        }
        if (e === undefined || e === true) {
            s.View.prototype.remove.apply(this, arguments)
        }
    };
    o = i.extend({
        ns: r,
        initialize: function(e) {
            this.setNS();
            i.prototype.initialize.call(this);
            e = e || {};
            this._page_components = {
                active: [],
                all: {}
            };
            if (e.init_components !== false) {
                this._initComponents()
            }
        },
        delegateEvents: function() {
            var e = i.prototype.delegateEvents.apply(this, arguments),
                s = t.result(this, "document_events", {});
            t.each(s, function(e, i) {
                var s = i.split(" "),
                    n = [];
                n.push(s.shift() + this.ns + ".document");
                if (s.length) {
                    n.push(s.join(" "))
                }
                n.push(t.bind(this[e], this));
                this._has_global_events = !!n.length;
                this._$document.on.apply(this._$document, n)
            }, this);
            return e
        },
        undelegateEvents: function() {
            if (this._has_global_events) {
                t.each(t.result(this, "document_events", {}), function(e, t) {
                    var i = t.split(" "),
                        s = [];
                    s.push(i.shift() + this.ns + ".document");
                    if (i.length) {
                        s.push(i.join(" "))
                    }
                    this._$document.off.apply(this._$document, s)
                }, this);
                this._has_global_events = false
            }
            return i.prototype.undelegateEvents.apply(this, arguments)
        },
        destroy: function(e) {
            e = t.isUndefined(e) ? false : e;
            this._$window.off(this.ns);
            if (this._page_components) {
                this._page_components.active = t.filter(this._page_components.active, function(t) {
                    this._destroyComponent(t, e);
                    return false
                }, this)
            }
            this.remove(e)
        },
        setNS: function() {
            if (this.ns === r) {
                this.ns = "." + t.uniqueId("amo_view_")
            }
        },
        _initComponents: function() {
            var e;
            e = this.components && this.components.apply(this, arguments);
            t.each(e, function(e) {
                this._addComponent.apply(this, e)
            }, this)
        },
        _addComponent: function() {
            var e, i, s, o;
            if (!t.isFunction(arguments[0])) {
                throw new Error("First argument of a component must be a function")
            }
            e = arguments[0];
            i = Array.prototype.slice.call(arguments, 1);
            s = this._initComponent(e, i);
            o = "component_" + n.randHex();
            if (t.isFunction(s.destroy)) {
                s.destroy = this._wrapComponentDestroy(s.destroy, this)
            }
            s.__page_component_hash = o;
            this._page_components.active.push(s);
            this._page_components.all[o] = {
                Component: e,
                args: i
            };
            return s
        },
        _wrapComponentDestroy: function(e, i) {
            return t.wrap(e, function(e) {
                var s = Array.prototype.slice.call(arguments, 1);
                e.apply(this, s);
                i._page_components.active = t.without(i._page_components.active, this);
                i._page_components.all = t.omit(i._page_components.all, this.__page_component_hash)
            })
        },
        _initComponent: function(e, t) {
            t = [e].concat(t || []);
            return new(e.bind.apply(e, t))
        },
        _destroyComponent: function(e, i) {
            if (e && e.__page_component_hash) {
                if (t.isFunction(e.destroy)) {
                    e.destroy(i)
                } else if (t.isFunction(e.remove)) {
                    e.remove(i)
                }
                e = null
            }
            return this
        },
        _disableComponent: function(e) {
            var i;
            if (e && e.__page_component_hash) {
                i = t.indexOf(this._page_components.active, e);
                this._destroyComponent(e);
                if (i !== -1) {
                    this._page_components.active.splice(i, 1)
                }
            }
            return this
        },
        _enableComponent: function(e) {
            var i;
            if (e && e.__page_component_hash && t.indexOf(this._page_components.active, e) === -1) {
                i = this._page_components.all[e.__page_component_hash];
                e = this._initComponent(i.Component, i.args)
            }
            return this
        }
    });
    return o
});
