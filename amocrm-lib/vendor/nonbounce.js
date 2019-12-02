define("vendor/nonbounce", ["jquery"], function(e) {
    "use strict";
    if (!("ontouchstart" in window)) {
        return false
    }
    var t, n, i = function() {
            return {
                $these: [],
                touchstart_init: false,
                touchmove_init: false,
                class_name: ".custom-scroll:not(.js-nonbounce-skip)",
                event_name_space: ".custom-scroll:touch"
            }
        },
        r = [],
        o = i();
    var s = function() {
        if (!o.touchstart_init) {
            o.touchstart_init = true;
            e(window).on("touchstart" + o.event_name_space, u)
        }
        if (!o.touchmove_init) {
            o.touchmove_init = true;
            e(window).on("touchmove" + o.event_name_space, c)
        }
    };
    var a = function(t, n, i) {
        return !!e(i).closest(t).length
    };
    var l = function(i) {
        var r = i.originalEvent.touches ? i.originalEvent.touches[0].screenY : i.originalEvent.screenY,
            s = i.originalEvent.touches ? i.originalEvent.touches[0].screenX : i.originalEvent.screenX,
            a = e(i.target).closest(o.class_name)[0];
        if (!a) {
            return true
        }
        if (a.getAttribute("data-horizontal") == "y") {
            if (Math.abs(t - r) < 10) {
                if (a.scrollLeft === 0 && n <= s) {
                    return false
                }
                if (a.scrollWidth - a.offsetWidth === a.scrollLeft && n >= s) {
                    return false
                }
                return true
            }
            return false
        } else {
            if (a.scrollTop === 0 && t <= r) {
                return false
            }
            if (a.scrollHeight - a.offsetHeight === a.scrollTop && t >= r) {
                return false
            }
        }
        return true
    };
    var u = function(e) {
        e = e.originalEvent || e;
        t = e.touches ? e.touches[0].screenY : e.screenY;
        n = e.touches ? e.touches[0].screenX : e.screenX
    };
    var c = function(t) {
        if (!(t.originalEvent.touches && t.originalEvent.touches.length > 1)) {
            if (!~e.inArray(true, e.map(o.$these, a, t.target))) {
                t.preventDefault()
            }
            if (!l(t)) {
                t.preventDefault()
            }
        }
    };
    var d = function(t) {
        o.$these.push(e(t))
    };
    var f = new MutationObserver(function(t) {
        t.forEach(function(t) {
            switch (t.type) {
                case "childList":
                    e.each(t.addedNodes, function(e, t) {
                        d(t)
                    });
                    break
            }
        })
    });
    e.nonbounce = function(t, n) {
        var a;
        n = n || "default";
        if (typeof t === "string" && t === "destroy") {
            a = r.indexOf(n);
            if (a !== -1) {
                r.splice(a, 1)
            }
            if (!r.length) {
                o = i();
                f.disconnect();
                e(window).off(o.event_name_space)
            }
        } else {
            r.push(n);
            if (r.length === 1) {
                e.extend(o, t || {});
                e(o.class_name).each(function() {
                    d(this)
                });
                f.observe(document.body, {
                    childList: true,
                    subtree: true
                });
                s()
            }
        }
    }
});
