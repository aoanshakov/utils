define("twig-augmented", [
    "underscore", "twig-core", "moment", "lib/utils/format/index", "lib/utils/generator",
    "lib/utils/url_parser", "lib/utils/account/system", "lib/interface/notes/constants",
    "lib/interface/settings/digital_pipeline/controls/utils"
], function(t, i, s, n, o, r, a, c, d) {
    "use strict";
    var l = AMOCRM.constant("account"),
        u, h, _, p, f = {},
        m = new RegExp("/[\\W]{1}" + s().year() + "/", "gi"),
        g = /.js$/;
    i.setTest("iterable", function(e) {
        return e && (t.isArray(e) || t.isObject(e))
    });
    p = {
        i18n: "i18n",
        date: "twigFilterDate",
        count: "prettyNumber",
        phone: "phone",
        striptags: "stripTags",
        task_date: "formatDate",
        lead_name: "leadName",
        plug_price: "plugPrice"
    };
    t.each(p, function(e, s) {
        if (!t.isFunction(n[e])) {
            throw new Error("Twig filter handler is not defined!")
        }
        i.setFilter(s, t.bind(n[e], n))
    });
    i.setFilter("random_string", t.bind(o.randString, o));
    i.setFunction("is_dark_color", t.bind(n.isDarkColor, n));
    i.setFilter("split", function(e, i, s) {
        if (t.isString(i)) {
            return i.split(s)
        }
        return []
    });
    i.setFilter("element_type", t.bind(a.convertElementType, a));
    i.setFilter("mark_last_item", function(e) {
        if (t.isArray(e) && e.length) {
            t.last(e).is_last = true
        }
        return e
    });
    i.setFilter("check_account_version", t.bind(function(e) {
        return a.getVersion() > e
    }, a));
    i.setFilter("feed_date", function(e) {
        var i = e;
        if (!t.isString(i)) {
            i = n.formatDate.apply(this, arguments)
        }
        return i.replace(m, "")
    });
    i.setFilter("number_format", function(e, i, s, n, o) {
        var r, a, l, c, d;
        if (isNaN(s = Math.abs(s))) {
            s = 2
        }
        if (t.isUndefined(n)) {
            n = ","
        }
        if (t.isUndefined(o)) {
            o = "."
        }
        r = parseInt(i = (+i || 0).toFixed(s)) + "";
        if ((a = r.length) > 3) {
            a %= 3
        } else {
            a = 0
        }
        d = a ? r.substr(0, a) + o : "";
        l = r.substr(a).replace(/(\d{3})(?=\d)/g, "$1" + o);
        c = s ? n + Math.abs(i - r).toFixed(s).replace(/-/, 0).slice(2) : "";
        return d + l + c
    });
    i.setFilter("color", function(e) {
        var t = 0,
            i = "#",
            s, n, o;
        e = e || "";
        if (e.length) {
            for (n = 0; n < e.length; n++) {
                o = e.charCodeAt(n);
                t = (t << 5) - t + o;
                t &= t
            }
        }
        for (n = 0; n < 3; n++) {
            s = t >> n * 8 & 255;
            i += ("00" + s.toString(16)).substr(-2)
        }
        return i
    });
    i.setFilter("avatar", function(e) {
        e = parseInt(e) || 0;
        return "/frontend/images/interface/avatars/" + (Math.abs(e % 10) + 1) + ".jpeg"
    });
    i.setFilter("parse_urls", function(e) {
        return r.parse(e)
    });
    i.setFilter("slice_text_and_save_urls", function(e, t, i) {
        var s = e.substring(0, t),
            n = e.substring(t, i),
            o = e.substring(i),
            a = n.indexOf(" "),
            l = n.lastIndexOf(" "),
            c = s.lastIndexOf(" "),
            d = e.substring(c + 1, t + a),
            u = o.indexOf(" "),
            h = e.substring(t + l + 1, i + u);
        c = r.has_url_or_email(d) ? t - s.lastIndexOf(" ") : 0;
        u = r.has_url_or_email(h) ? o.indexOf(" ") : 0;
        return e.substring(t - c, i + u)
    });
    i.setFilter("task_text", function(e) {
        if (e === AMOCRM.lang.tasks_follow_up) {
            return ""
        }
        return e
    });
    i.setFilter("period", function(e, t) {
        var i, s;
        i = Math.floor(e % 31536e3 / 86400);
        if (i > 0) {
            if (t === true) {
                if (AMOCRM.lang_id === "ru") {
                    s = i % 10 === 1 && i !== 11 ? "дня" : "дней"
                } else {
                    s = i === 1 ? "day" : "days"
                }
            } else {
                s = n.numeralWord(i, n.i18n("day,days,days,days"))
            }
            return i + " " + s
        }
        return ""
    });
    i.setFilter("default_task_type_icon", function(e) {
        e = parseInt(e);
        if (e > 0) {
            return e
        }
        return 0
    });
    i.setFilter("default_task_type_color", function(e) {
        if (e) {
            return "#" + e.replace("#", "")
        }
        return "#568FFA"
    });
    i.setFilter("time", function(e) {
        var i, s, n;
        if (!e || t.isNaN(parseFloat(e))) {
            return "00:00"
        }
        i = Math.floor(e / 60);
        if (e < 60) {
            i = "00";
            n = parseInt(e)
        } else {
            i = parseInt(i);
            i = (i < 10 ? "0" : "") + i;
            n = parseInt(e - i * 60)
        }
        n = (n < 10 ? ":0" : ":") + n;
        s = i + n;
        return s
    });
    i.setFilter("raw", function(e) {
        e = e || "";
        return e.toString().replace(/&amp;/g, "&")
    });
    i.setFilter("random", function(e) {
        var t = 0,
            i, s;
        if (!e) {
            i = 2147483647
        } else if (typeof e === "string" || typeof e === "object" && e.length) {
            i = e.length
        } else {
            i = parseInt(i)
        }
        s = Math.floor(Math.random() * (i - t + 1)) + t;
        if (typeof e === "string" || typeof e === "object" && e.length) {
            return e[s]
        }
        return s
    });
    i.setFilter("nl2br", function(e) {
        e = e || "";
        return e.toString().replace(/\n/g, "<br/>")
    });
    i.setFilter("by_paragraphs", function(e, t) {
        if (Object.prototype.toString.call(e) !== "[object Array]") {
            e = (e || "").toString().split("\n\n").join("\n")
        }
        t = t || "split";
        return e[t]("\n")
    });
    i.setFilter("nl2p", function(e, t) {
        var i, s = "",
            o;
        e = (e || "").split("\n");
        for (i in e) {
            o = n.trim(e[i]);
            if (t && !o) {
                o = "&nbsp;"
            }
            if (o !== "") {
                s += "<p>" + o + "</p>"
            }
        }
        return s
    });
    i.setFilter("price", function(e, t) {
        var i, s, o;
        t = t || [];
        e = e || 0;
        i = t[0] || false;
        s = t[1] || 0;
        o = t[2] || false;
        return n.currency(e, i, s, false, o)
    });
    i.setFilter("round", function(e, t, i) {
        t = 0;
        i = i || "round";
        switch (i) {
            case "round":
                return Math.round(e);
            case "ceil":
                return Math.ceil(e);
            case "floor":
                return Math.floor(e)
        }
    });
    i.setFilter("relative_date", function(e, i) {
        var o, r = [],
            a = e;
        if (!e) {
            return ""
        }
        if (!t.isArray(i)) {
            i = [i]
        }
        if (typeof e == "number") {
            e = s.unix(e)
        }
        o = s(e, AMOCRM.system.format.date.date + " " + AMOCRM.system.format.date.time);
        if (o.isSame(new Date, "day")) {
            r.push(o.format(s().localeData().calendar("today")));
            r.push(o.format(AMOCRM.system.format.date.time))
        } else if (o.isSame(s().add(1, "days"), "day")) {
            r.push(o.format(s().localeData().calendar("tomorrow")));
            r.push(o.format(AMOCRM.system.format.date.time))
        } else if (o.isSame(s().subtract(1, "days"), "day")) {
            r.push(o.format(s().localeData().calendar("yesterday")));
            r.push(o.format(AMOCRM.system.format.date.time))
        } else if (i && i.length) {
            if (i.length === 1 && i[0] === "full_with_year") {
                r.push(o.format(AMOCRM.system.format.date.calendar))
            } else {
                i.unshift(a);
                r.push(n.formatDate.apply(this, i))
            }
        } else if (o.isSame(s(), "year")) {
            r.push(o.format(AMOCRM.system.format.date.calendar_no_year))
        } else {
            r.push(o.format(AMOCRM.system.format.date.calendar))
        }
        return r.join(", ")
    });
    i.setFilter("pipeline_date", function(e) {
        var t = s.unix(e).tz(AMOCRM.system.timezone),
            i = t.isSame(new Date, "day") || t.isSame(s().subtract(1, "days"), "day");
        return n.formatDate.call(this, e, i ? null : "date")
    });
    i.setFunction("dump", function(e) {
        function t(e, i) {
            var s = "",
                n;
            i = i || 1;
            switch (typeof e) {
                case "object":
                    s += "(" + typeof e + ")\n";
                    for (n in e) {
                        s += new Array(i).join(" ") + n + ": ";
                        s += t(e[n], i + 3)
                    }
                    break;
                default:
                    s += e + " (" + typeof e + ")\n";
                    break
            }
            return s
        }
        return "<pre>" + t(e) + "</pre>"
    });
    i.setFilter("slice", function(e, i, s, n) {
        var o, r, a;
        if (t.isUndefined(i) || t.isNull(i)) {
            return
        }
        if (t.isNumber(i)) {
            i = i.toString()
        }
        s = s || 0;
        n = n || i.length;
        o = s >= 0 ? s : Math.max(i.length + s, 0);
        if (t.isArray(i)) {
            r = [];
            for (a = o; a < o + n && a < i.length; a++) {
                r.push(i[a])
            }
            return r
        } else if (t.isString(i)) {
            return i.substr(o, n)
        }
        throw new Error("slice filter expects value to be an array or string")
    });
    i.setFilter("numeral", function(e, t) {
        var i = (e || "").toString().split(","),
            n, o;
        if (s.locale() === "ru") {
            if (t === "all") {
                return i[3] || ""
            }
            n = Math.abs(t) % 100;
            o = n % 10;
            if (n > 10 && n < 20) {
                return i[2] || ""
            }
            if (o > 1 && o < 5) {
                return i[1] || ""
            }
            if (o === 1) {
                return i[0] || ""
            }
            return i[2] || ""
        }
        return t !== 1 || t === "all" ? i[1] || "" : i[0] || ""
    });
    i.setFilter("format", function() {
        var e = arguments[0] || "";
        var t;
        for (t = 1; t < arguments.length; ++t) {
            if (typeof arguments[t] === "undefined") {
                break
            }
            e = e.replace("%s", arguments[t])
        }
        return e
    });
    i.setFilter("work_time_title", function(e, t, i) {
        var s;
        if (e) {
            s = e
        } else if (t.work_time_id && i) {
            s = i[t.work_time_id].data
        }
        if (s) {
            return d.getTitleWorkingHours(s)
        }
        return n.i18n("always")
    });
    i.setFilter("feed_cf", function(e, s, o) {
        var r = "",
            a;
        if (s === "name" && t.contains([
            c.PRICE_CHANGED_EVENT, c.NAME_CHANGED_EVENT, c.LTV_CHANGED_EVENT
        ], o.field_type)) {
            switch (o.field_type) {
                case c.NAME_CHANGED_EVENT:
                    return n.i18n("Name");
                case c.PRICE_CHANGED_EVENT:
                    return n.i18n("leads_edit_lead_budget");
                case c.LTV_CHANGED_EVENT:
                    return n.i18n("Total sales value")
            }
        } else if (s === "name") {
            a = l.cf[e] || t.findWhere(l.predefined_cf, {
                ID: e
            }) || {};
            r = t.escape(a.NAME || n.i18n("Field removed"));
            if (!t.isEmpty(a) && o.subtype_id) {
                r += " (" + AMOCRM.lang[a.sub_types[o.subtype_id] + "_placeholder"] + ")"
            }
            return r
        }
        switch (o.field_type) {
            case AMOCRM.cf_types.birthday:
            case AMOCRM.cf_types.date:
                return i.filter("date", t.escape(e), "date");
            case AMOCRM.cf_types.url:
                return i.filter("parse_urls", t.escape(e));
            case AMOCRM.cf_types.checkbox:
                return e ? n.i18n("on") : n.i18n("off");
            default:
                return t.escape(e)
        }
    });
    h = function(e) {
        e = e.split(".twig").join("");
        return n.trim(e.replace("/tmpl", "interface"))
    };
    _ = function(e) {
        var t = f[h(e)];
        if (!t) {
            if (console) {
                console.error("Template (" + e + ") not found")
            }
            return {
                render: function() {
                    return ""
                }
            }
        }
        return {
            render: function(e) {
                return i.render(t, $.extend(true, {
                    lang: AMOCRM.lang
                }, e || {}, {
                    lang_id: AMOCRM.lang_id,
                    _time_format: AMOCRM.system.format.time
                }))
            }
        }
    };
    u = function(e) {
        if (!e.ref) {
            throw new Error("Twig.js only working by ref argument")
        }
        return _(e.ref)
    };
    u._preload = function(i, s) {
        var n = [],
            o;
        return function() {
            var r = this,
                a = [].splice.call(arguments, 0);
            return new Promise(function(l, c) {
                var d = s;
                if (t.isString(d)) {
                    d = r[d]
                }
                if (!t.isFunction(d)) {
                    d = t.noop
                }
                if (!t.isArray(i)) {
                    i = [i]
                }
                n = n.concat(t.chain(i).filter(function(e) {
                    return !u._get(e)
                }).map(function(e) {
                    if (g.test(e)) {
                        return e
                    }
                    o = e.replace("/tmpl/", "templates/interface/");
                    o = o.replace(".twig", "");
                    o = o.replace(/templates\/interface\/([^\/]+).*/gi, "$1");
                    return "/frontend/build/templates/" + o + ".js"
                }).unique().value());
                if (!n.length) {
                    d.apply(r, a);
                    l();
                    return
                }
                e(n, t.bind(function() {
                    d.apply(this, arguments[0]);
                    l()
                }, r, a), c)
            })
        }
    };
    u._add = function(e, t) {
        f[e] = t
    };
    u._get = function(e) {
        return f[h(e)]
    };
    u._twig = i;
    return u
});
