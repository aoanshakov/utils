define("lib/interface/controls/overlay", [
    "jquery", "underscore", "lib/common/fn", "pubsub", "vendor/nonbounce", "lib/interface/controls/common"
], function(t, i, s, n) {
    "use strict";
    var o = t(document),
        r = {};
    r.overlay_stack = 0;
    r.getHolder = function() {
        var e = t("#page_holder");
        if (AMOCRM.getBaseEntity() === "mail" && AMOCRM.data.is_card) {
            e = t("#card_holder")
        }
        if (e.is(":hidden")) {
            return {}
        }
        return e
    };
    r.show = function(e, i) {
        if (!i || !i.skip_fix) {
            o.trigger("overlay:fix")
        }
        e = e instanceof jQuery ? e : t(e);
        e.prepareTransition().addClass("default-overlay-visible")
    };
    r.hide = function(e, s) {
        var n;
        s = s || {};
        e = e instanceof jQuery ? e : t(e);
        n = function() {
            if (i.isFunction(s.callback)) {
                s.callback()
            }
            e.remove();
            if (!s || !s.skip_fix) {
                o.trigger("overlay:unfix")
            }
        };
        if (s.instantly) {
            n()
        } else {
            i.delay(n, 200);
            e.prepareTransition().addClass("default-overlay-fading")
        }
    };
    r.checkScroll = function(e, t) {
        return e.outerHeight() > t.outerHeight()
    };
    r.fixScroll = function(e, i, n) {
        var o = t(".list__body-right__top"),
            a = o.length && s._getV3Plug(),
            l;
        if (AMOCRM.getBaseEntity() === "mail" && AMOCRM.data.is_card) {
            a = true
        }
        if (e.length) {
            if (n && r.checkScroll(e, i)) {
                l = t(window).scrollTop();
                e.css("overflow-y", "scroll").scrollTop(l);
                if (a) {
                    o.css("marginRight", s.scrollBarWidth + "px")
                }
            } else {
                e.css("overflow-y", "").scrollTop(0);
                if (a) {
                    o.css("marginRight", "")
                }
            }
        }
    };
    o.on("overlay:fix", function() {
        var e = document.body,
            i = r.getHolder();
        if (!parseInt(e.getAttribute("data-body-fixed")) && !AMOCRM.is_touch_device) {
            r.fixScroll(i, t(e), true)
        }
        e.setAttribute("data-body-fixed", ++r.overlay_stack);
        if (!AMOCRM.is_touch_device) {
            e.style.overflow = "hidden"
        } else {
            t.nonbounce("destroy");
            t.nonbounce()
        }
    }).on("overlay:unfix", function() {
        var e = document.body,
            i = r.getHolder();
        --r.overlay_stack;
        if (r.overlay_stack < 0) {
            r.overlay_stack = 0
        }
        if (r.overlay_stack === 0) {
            if (!AMOCRM.is_touch_device) {
                e.style.overflow = "";
                r.fixScroll(i, t(e))
            } else {
                t.nonbounce("destroy")
            }
        }
        e.setAttribute("data-body-fixed", r.overlay_stack);
        o.trigger("overlay:unfixed")
    }).on("touchmove", ".default-overlay", function() {
        return false
    }).on("overlay:show", ".default-overlay", function(e, t) {
        r.show(this, t)
    }).on("overlay:hide", ".default-overlay", function(e, t) {
        r.hide(this, t)
    });
    n.subscribe("overlay:show", function(e, t) {
        r.show(t.el, t.params)
    });
    n.subscribe("overlay:hide", function(e, t) {
        r.hide(t.el, t.params)
    })
});
