define("lib/utils/format/index", [
    "underscore", "moment", "accounting", "lib/utils/format/transliterate", "google-libphonenumber", "lib/utils/tester"
], function(t, n, i, r, o, a) {
    "use strict";
    var s = new o.AsYouTypeFormatter(AMOCRM.constant("account").country),
        l;
    l = {
        transliterate: r,
        transliterateFileName: function(e, t) {
            return r(e).replace(/\s/gi, "_").replace(/[^\w\s]/gi, "").toLowerCase() + (t ? "." + t : "")
        },
        phone: function(e) {
            var t = e,
                n, i;
            if (a.isPhoneValid(e)) {
                n = e.replace(/[\s-]/g, "");
                s.clear();
                for (i = 0; i < n.length; i++) {
                    t = s.inputDigit(n[i])
                }
            }
            return t
        },
        formatFileSize: function(e) {
            var t, n, i;
            if (!e) {
                return ""
            }
            switch (AMOCRM.lang_id) {
                case "ru":
                    t = [" Байт", " КБ", " МБ", " ГБ", " ТБ", " ПБ"];
                    break;
                default:
                    t = [" Bytes", " KB", " MB", " GB", " TB", " PB"]
            }
            n = parseInt(Math.floor(Math.log(e) / Math.log(1024)));
            e /= Math.pow(1024, n);
            i = n > 1 ? Math.round(e * 100) / 100 : Math.round(e);
            i += t[n] ? t[n] : "";
            return i
        },
        formatDate: function(e, t, i, r) {
            var o, s, a = [],
                l = n.utc(),
                u = AMOCRM.system.format.date.date + " " + AMOCRM.system.format.date.time;
            if (!e) {
                return ""
            }
            if (e === "today" || e === "tomorrow") {
                if (!r) {
                    l.set("hour", 23).set("minute", 59)
                }
                l.add(e === "tomorrow" ? 1 : 0, "days");
                o = n().tz(AMOCRM.system.timezone).set("year", l.get("year")).set("month", l.get("month")).
                    set("date", l.get("date")).set("hour", l.get("hour")).set("minute", l.get("minute"));
                return t === "timestamp" ? o : o.format(u)
            } else if (e === "now") {
                s = n()
            } else if (parseFloat(e).toString() === e.toString()) {
                s = n.unix(e).tz(AMOCRM.system.timezone)
            } else {
                s = n(e, u)
            }
            if (t !== "time") {
                if (s.isSame(new Date, "day")) {
                    a.push(s.format(n().localeData().calendar("today")))
                } else if (s.isSame(n().add(1, "days"), "day")) {
                    a.push(s.format(n().localeData().calendar("tomorrow")))
                } else if (s.isSame(n().subtract(1, "days"), "day")) {
                    a.push(s.format(n().localeData().calendar("yesterday")))
                } else {
                    a.push(s.format(AMOCRM.system.format.date.date))
                }
            }
            if (t !== "date") {
                if (s.format("HH:mm") === "23:59" && i !== true) {
                    a.push(AMOCRM.lang.tasks_all_day.toString())
                } else {
                    a.push(s.format(AMOCRM.system.format.date.time))
                }
            }
            return a.join(" ")
        },
        twigFilterDate: function(e, t) {
            var i, r;
            if (!e) {
                return ""
            }
            if (e === "now") {
                i = n()
            } else if (e === "tomorrow") {
                i = n().add(1, "days")
            } else {
                if (typeof e === "string" && parseInt(e).toString() !== e) {
                    i = n(e, AMOCRM.system.format.date.date + " " + AMOCRM.system.format.date.time)
                } else {
                    i = n.utc(e, "X").tz(AMOCRM.system.timezone)
                }
                if (!i.isValid()) {
                    if (t === "short") {
                        i = n(e, AMOCRM.system.format.date.date)
                    } else {
                        i = n(e, "DD.MM.YYYY HH:mm:ss")
                    }
                }
            }
            if (t) {
                r = AMOCRM.system.format.date;
                if (t === "timestamp") {
                    return i.format("X")
                }
                if (t === "date_short") {
                    if (i.format("YYYY") !== n().format("YYYY")) {
                        t = "short"
                    }
                }
                if (t === "short") {
                    return i.format(r.date)
                } else if (r[t]) {
                    return i.format(r[t])
                }
            }
            return i.calendar()
        },
        time: function(e, t) {
            var n, i, r;
            t = t || 0;
            if (!e) {
                return ""
            }
            n = Math.floor(e / 60);
            if (e < 60) {
                n = "00";
                r = parseInt(e)
            } else {
                n = parseInt(n);
                r = parseInt(e - n * 60);
                if (n < 10) {
                    n = "0" + n
                } else if (n > 100) {
                    if (t !== 1) {
                        n = l.time(n, 1)
                    }
                }
            }
            r = (r < 10 ? ":0" : ":") + r;
            i = n + r;
            return i
        },
        escapeTags: function(e) {
            return (e || "").toString().replace(/[<]/gi, "&lt;").replace(/[>]/gi, "&gt;")
        },
        stripTags: function(e) {
            return (e || "").toString().replace(/<\/?[^>]+>/gi, "")
        },
        trim: function(e) {
            return (e || "").toString().replace(/^\s+|\s+$/g, "")
        },
        parseNum: function(e, n) {
            var i = parseFloat(t.isString(e) ? e.replace(",", ".") : e);
            return isNaN(i) ? 0 : i
        },
        numeralWord: function(e, n, i) {
            var r, o, s, a;
            if (!n) {
                return ""
            }
            r = n.toString().split(",");
            switch (AMOCRM.lang_id) {
                case "ru":
                    s = Math.abs(e) % 100;
                    a = s % 10;
                    switch (true) {
                        case e === "all":
                            o = r[3];
                            break;
                        case s > 10 && s < 20:
                            o = r[2];
                            break;
                        case a > 1 && a < 5:
                            o = r[1];
                            break;
                        case a === 1:
                            o = r[0];
                            break;
                        default:
                            o = r[2]
                    }
                    break;
                default:
                    switch (true) {
                        case e === "all":
                            o = t.isEmpty(r[2]) ? r[1] : r[2];
                            break;
                        case e !== 1:
                            o = r[1];
                            break;
                        default:
                            o = r[0]
                    }
            }
            if (i === true) {
                o = e + " " + o
            }
            return o
        },
        prettyNumber: function(e) {
            var n = "",
                i = 0,
                r = false,
                o, s;
            e = e === null || t.isUndefined(e) ? 0 : e + "";
            o = e.length;
            if (!o) {
                return e
            }
            i = o % 3;
            if (i) {
                r = true
            }
            for (s = 1; s <= o; s++) {
                n += e[s - 1];
                if (s < o) {
                    if (r) {
                        if (i === s) {
                            n += " ";
                            r = false
                        }
                    } else if (s % 3 - i === 0) {
                        n += " "
                    }
                }
            }
            return n
        },
        replaceAll: function(e, t, n) {
            return (n || "").replace(new RegExp(e, "g"), t)
        },
        currency: function(e, n, r, o, s) {
            var a = "",
                l = AMOCRM.lang.currency_class.reductions,
                u, c, d = 0,
                f;
            r = r || 0;
            o = o || AMOCRM.system.locale;
            n = !t.isUndefined(n) && n ? "" : o.currency_symbol;
            s = s ? parseInt(s) : 0;
            if (s >= 3) {
                u = ("" + parseInt(e)).length;
                switch (true) {
                    case u > s + 6:
                        d = 9;
                        a = " " + l.billions;
                        break;
                    case u > s + 3:
                        d = 6;
                        a = " " + l.millions;
                        break;
                    case u > s:
                        d = 3;
                        a = " " + l.thousands;
                        break
                }
                if (d > 0) {
                    e /= Math.pow(10, d)
                }
            }
            e = parseFloat(e);
            e = Math.round(e * Math.pow(10, r)) / Math.pow(10, r);
            if (r) {
                f = Math.round(parseFloat(e));
                if (f == e) {
                    r = 0
                }
            }
            c = o.currency_pattern;
            if (a) {
                c = c.replace("%v", "%v" + a)
            }
            return i.formatMoney(e, {
                symbol: n,
                precision: t.isUndefined(r) ? 0 : r,
                thousand: o.mon_thousands_sep,
                decimal: o.mon_decimal_point,
                format: {
                    pos: c,
                    neg: "-" + c,
                    zero: c
                }
            })
        },
        plugPrice: function(e) {
            var t;
            e = e || 3;
            t = "" + l.currency(new Array(++e).join("1"));
            return l.replaceAll("1", "0", t)
        },
        reductNumericValue: function(e) {
            e = e || {};
            var t, n = e.value || 0,
                i = e.max_value || 99999999,
                r = AMOCRM.lang.currency_class.reductions,
                o = "",
                s = "",
                a = [],
                u = 0,
                c = AMOCRM.system.locale.currency_symbol;
            if (n) {
                t = s = l.prettyNumber(n);
                a = s.split(" ");
                if (n > i) {
                    u = +(n / Math.pow(1e3, a.length - 1)).toFixed(1);
                    if (u === +a[0] || e.round_value) {
                        u = u.toFixed()
                    }
                    t = u;
                    if (!e.is_plain_number) {
                        switch (a.length) {
                            case 2:
                                o = r.thousands;
                                break;
                            case 3:
                                o = r.millions;
                                break;
                            case 4:
                                o = r.billions;
                                break;
                            default:
                                t = s
                        }
                    }
                }
                if (o) {
                    t += " " + o
                }
            } else {
                t = "0"
            }
            if (e.is_currency) {
                t += " " + c
            }
            return t
        },
        changeKeysCase: function(e, n) {
            var i = {};
            t.each(e, function(e, r) {
                var o = n === "upper" ? r.toString().toUpperCase() : r.toString().toLowerCase();
                if (t.isObject(e)) {
                    i[o] = l.changeKeysCase(e, n)
                } else if (t.isArray(e)) {
                    i[o] = t.map(e, function(e) {
                        l.changeKeysCase(e, n)
                    })
                } else {
                    i[o] = e
                }
            });
            return i
        },
        i18n: function(e) {
            if (typeof AMOCRM.lang[e] !== "undefined") {
                return AMOCRM.lang[e]
            }
            return e
        },
        toTitleCase: function(e) {
            return (e || "").replace(/(\w)(\w*)/g, function(e, t, n) {
                return t.toUpperCase() + (n === null ? "" : n)
            })
        },
        isDarkColor: function(e, n, i) {
            var r;
            i = i || .5;
            if (e === "transparent") {
                return false
            }
            if (t.isEmpty(n)) {
                n = l.hex2rgb(e)
            }
            r = n[0] * 299 + n[1] * 587 + n[2] * 114;
            r /= 255e3;
            return r < i
        },
        hex2rgb: function(e) {
            if (e.lastIndexOf("#") > -1) {
                e = e.replace(/#/, "0x")
            } else {
                e = "0x" + e
            }
            return [e >> 16, (e & 65280) >> 8, e & 255]
        },
        leadName: function(e, t) {
            return e || l.i18n("Lead #") + t
        },
        getMoment: function(e) {
            var t, i;
            if (typeof e === "string" && parseInt(e) != e) {
                i = e.match(/^\d{4}-\d{2}-\d{2}/) ? "YYYY-MM-DD HH:mm:ss" : AMOCRM.system.format.date.date + " " +
                    AMOCRM.system.format.date.time;
                t = n(e, i)
            } else {
                t = n.unix(e)
            }
            return t
        },
        unescapeHTML: function(e) {
            return $("<div/>").html(e).text()
        },
        capitalize: function(e) {
            return e ? e.charAt(0).toUpperCase() + e.substr(1) : ""
        },
        getNumberTypeUnsorted: function(e) {
            var t = {
                sip: 1,
                mail: 2,
                forms: 3,
                chats: 4
            };
            return t[e]
        }
    };
    return l
});
