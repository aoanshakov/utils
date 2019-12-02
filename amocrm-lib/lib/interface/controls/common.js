define("lib/interface/controls/common", [
    "jquery", "underscore", "device", "lib/common/urlparams", "lib/dev/timer"
], function(t, i, s, n, o) {
    "use strict";
    var r = document.documentElement,
        a = /^(https?:\/\/)?([0-9a-z\-.]{1,})(\.amocrm\.(ru|com)|\.amocrm2\.saas).*/i,
        l = /^(https?:\/\/?[0-9a-z\-.]{1,}\.amocrm\.(ru|com)|\.amocrm2\.saas)?\/\w+\/(detail)\/.*/i;
    AMOCRM.controls = {};
    AMOCRM.is_touch_device = s.tablet() && !s.windowsTablet() || s.mobile();
    jQuery.fn.reverse = [].reverse;
    jQuery.fn.prepareTransition = function(e) {
        var s = t(this);
        if (i.isFunction(e) && s.length) {
            setTimeout(function() {
                e.call(s[0])
            }, 0)
        } else if (jQuery.contains(r, this)) {
            s.offset()
        }
        return s
    };
    t(document).on("page:back", function() {
        AMOCRM.router.back()
    }).on("click", ".js-card-back-button, .js-back-button", function(e) {
        e.preventDefault();
        e.stopPropagation();
        AMOCRM.router.back()
    }).on("click link:navigate", ".js-navigate-link", function(e) {
        var i = t(this),
            s = i.attr("href").toString().split("?"),
            r = s[1] ? "?" + s[1] : "",
            a = s[0].match(l),
            c;
        e.preventDefault();
        e.stopPropagation();
        o.start();
        if (e.metaKey || e.ctrlKey) {
            if (a && a[3] === "detail") {
                r = n.setQueryParam({
                    compact: "yes"
                }, {
                    only_query_string: true,
                    query_string: s[1] || ""
                }) || ""
            }
            c = window.open();
            c.opener = null;
            c.location = s[0] + r
        } else if (AMOCRM.router) {
            AMOCRM.router.navigate(s.join("?"), {
                trigger: true
            })
        }
    }).on("click", 'a[target="_blank"]:not(.js-navigate-link)', function(e) {
        var i = t(this).attr("href"),
            s;
        if (!(i[0] === "/" || a.test(i))) {
            s = window.open();
            s.opener = null;
            s.location = i;
            return false
        }
    });
    /*t(function() {
        var e = "/frontend/images/interface/svg_sprite.svg",
            i = Date.now();
        if (AMOCRM.build_hashes) {
            i = AMOCRM.build_hashes[e]
        }
        t.get(AMOCRM.need_cdn ? AMOCRM.cdn_domain.replace("#NUM#", "") + AMOCRM.constant("version") + e : AMOCRM.static_domain + e + "?" + i, function(e) {
            var t = document.createElement("div");
            t.innerHTML = (new XMLSerializer).serializeToString(e.documentElement);
            t.childNodes[0].setAttribute("id", "svg-sprite");
            document.body.insertBefore(t.childNodes[0], document.body.childNodes[0])
        });
        t("html").toggleClass("touch", AMOCRM.is_touch_device).toggleClass("no-touch", !AMOCRM.is_touch_device)
    })*/
});
