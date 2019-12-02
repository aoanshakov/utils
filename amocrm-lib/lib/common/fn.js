define("lib/common/fn", [
    "underscore", "moment", "store", "accounting", "jquery", "underscore", "lib/common/urlparams"
], function(t, n, S, L, P, t, $) {
    var i = {},
        r = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
            "/": "&#x2F;"
        },
        o = {
            translit: {
                "а": "a",
                "б": "b",
                "в": "v",
                "г": "g",
                "д": "d",
                "е": "e",
                "ё": "e",
                "ж": "zh",
                "з": "z",
                "и": "i",
                "й": "i",
                "к": "k",
                "л": "l",
                "м": "m",
                "н": "n",
                "о": "o",
                "п": "p",
                "р": "r",
                "с": "s",
                "т": "t",
                "у": "u",
                "ф": "f",
                "х": "kh",
                "ц": "tc",
                "ч": "ch",
                "ш": "sh",
                "щ": "shch",
                "ъ": "",
                "ы": "y",
                "ь": "",
                "э": "e",
                "ю": "iu",
                "я": "ia"
            },
            punto: {
                "й": "q",
                "ц": "w",
                "у": "e",
                "к": "r",
                "е": "t",
                "н": "y",
                "г": "u",
                "ш": "i",
                "щ": "o",
                "з": "p",
                "х": "[",
                "ъ": "]",
                "ф": "a",
                "ы": "s",
                "в": "d",
                "а": "f",
                "п": "g",
                "р": "h",
                "о": "j",
                "л": "k",
                "д": "l",
                "ж": ";",
                "э": "'",
                "я": "z",
                "ч": "x",
                "с": "c",
                "м": "v",
                "и": "b",
                "т": "n",
                "ь": "m",
                "б": ",",
                "ю": "."
            }
        },
        s = 142,
        a = 143,
        l = {
            win: s,
            lost: a
        },
        u = AMOCRM.element_types.leads,
        c = "leads",
        d = "lead",
        f = AMOCRM.element_types.contacts,
        h = "contacts",
        p = "contact",
        g = AMOCRM.element_types.companies,
        m = "companies",
        v = "company",
        b = AMOCRM.element_types.customers,
        y = "customers",
        M = "customer",
        _ = AMOCRM.element_types.transactions,
        w = "transactions",
        A = "transaction",
        x = AMOCRM.element_types.catalogs,
        N = "catalogs",
        C = "catalog",
        T = AMOCRM.element_types.mail,
        O = "mails",
        z = "mail",
        E = [{
            int: u,
            string: c,
            single: d
        }, {
            int: f,
            string: h,
            single: p
        }, {
            int: g,
            string: m,
            single: v
        }, {
            int: b,
            string: y,
            single: M
        }, {
            int: _,
            string: w,
            single: A
        }, {
            int: x,
            string: N,
            single: C
        }, {
            int: T,
            string: O,
            single: z
        }];
    i = {
        getScrollBarWidth: function(e) {
            var t = document.createElement("div"),
                n, i, r;
            t.style.visibility = "hidden";
            t.style.width = "100px";
            document.body.appendChild(t);
            n = t.offsetWidth;
            t.style.overflow = "scroll";
            t.className = e || "";
            r = document.createElement("div");
            r.style.width = "100%";
            t.appendChild(r);
            i = r.offsetWidth;
            t.parentNode.removeChild(t);
            return n - i
        },
        delay: function() {
            return function() {
                var e = 0;
                return function(t, n) {
                    clearTimeout(e);
                    e = setTimeout(t, n)
                }
            }()
        },
        parseNum: function(e, t) {
            var n = parseFloat(typeof e === "string" ? e.replace(",", ".") : e);
            return isNaN(n) ? 0 : n
        },
        numberWithCommas: function(e) {
            return e.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
        },
        numeralWord: function(e, n, i) {
            var r, o;
            if (!n) {
                return ""
            }
            r = n.toString().split(",");
            if (AMOCRM.lang_id == "ru") {
                var s = Math.abs(e) % 100;
                var a = s % 10;
                if (e == "all") {
                    o = r[3]
                } else if (s > 10 && s < 20) {
                    o = r[2]
                } else if (a > 1 && a < 5) {
                    o = r[1]
                } else if (a == 1) {
                    o = r[0]
                } else {
                    o = r[2]
                }
            } else {
                if (e == "all") {
                    o = !t.isEmpty(r[2]) ? r[2] : r[1]
                } else if (e != 1) {
                    o = r[1]
                } else {
                    o = r[0]
                }
            }
            if (i === true) {
                o = e + " " + o
            }
            return o
        },
        formatFileSize: function(e) {
            var t, n, i;
            if (!e) {
                return ""
            }
            if (AMOCRM.lang_id == "ru") {
                t = [" Байт", " КБ", " МБ", " ГБ", " ТБ", " ПБ"]
            } else {
                t = [" Bytes", " KB", " MB", " GB", " TB", " PB"]
            }
            n = parseInt(Math.floor(Math.log(e) / Math.log(1024)));
            e /= Math.pow(1024, n);
            if (n > 1) {
                i = Math.round(e * 100) / 100
            } else {
                i = Math.round(e)
            }
            i += t[n] ? t[n] : "";
            return i
        },
        currency: function(e, t, n, i, r) {
            var o = "",
                s, a, l = 0;
            n = n || 0;
            i = i || AMOCRM.system.locale;
            t = typeof t != "undefined" && t ? "" : i.currency_symbol;
            r = r ? parseInt(r, 10) : 0;
            if (r >= 3) {
                s = ("" + parseInt(e, 10)).length;
                switch (true) {
                    case s > r + 6:
                        l = 9;
                        o = " " + AMOCRM.lang.currency_class["reductions"]["billions"];
                        break;
                    case s > r + 3:
                        l = 6;
                        o = " " + AMOCRM.lang.currency_class["reductions"]["millions"];
                        break;
                    case s > r:
                        l = 3;
                        o = " " + AMOCRM.lang.currency_class["reductions"]["thousands"];
                        break
                }
                if (l > 0) {
                    e /= Math.pow(10, l)
                }
            }
            e = parseFloat(e);
            e = Math.round(e * Math.pow(10, n)) / Math.pow(10, n);
            if (n) {
                var u = Math.round(parseFloat(e));
                if (u == e) {
                    n = 0
                }
            }
            a = i.currency_pattern;
            if (o) {
                a = a.replace("%v", "%v" + o)
            }
            return L.formatMoney(e, {
                symbol: t,
                precision: typeof n == "undefined" ? 0 : n,
                thousand: i.mon_thousands_sep,
                decimal: i.mon_decimal_point,
                format: {
                    pos: a,
                    neg: "-" + a,
                    zero: a
                }
            })
        },
        replaceAll: function(e, t, n) {
            return n.replace(new RegExp(e, "g"), t)
        },
        scrollBarWidth: i.scrollBarWidth || 0,
        isFFWithBuggyScrollbar: function() {
            var e, t, n;
            t = window.navigator.userAgent;
            e = /(?=.+Mac OS X)(?=.+Firefox)/.test(t);
            if (!e) {
                return false
            }
            n = /Firefox\/\d{2}\./.exec(t);
            if (n) {
                n = n[0].replace(/\D+/g, "")
            }
            return e && +n > 23
        },
        digits_only: function(e) {
            if (e == undefined) {
                return
            }
            var t = e.which;
            if ((t < 48 || t > 57) && t && e.keyCode !== 8) {
                e.preventDefault()
            }
        },
        randHex: function() {
            return ((1 + Math.random()) * 65536 | 0).toString(16).substring(1)
        },
        randString: function(e) {
            var t = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
                n = t.length,
                i, r = "";
            e = e || 4;
            for (i = 0; i < e; i++) {
                r += t[parseInt(Math.floor(Math.random() * n))]
            }
            return r
        },
        unescapeHTML: function(e) {
            return P("<div/>").html(e).text()
        },
        escapeHTML: function(e) {
            return String(e).replace(/[&<>"'\/]/g, function(e) {
                return r[e]
            })
        },
        escapeTags: function(e) {
            return (e || "").toString().replace(/[\<]/gi, "&lt;").replace(/[\>]/gi, "&gt;")
        },
        stripTags: function(e) {
            return (e || "").replace(/<\/?[^>]+>/gi, "")
        },
        trim: function(e) {
            return (e || "").toString().replace(/^\s+|\s+$/g, "")
        },
        formatDate: function(e, t, i, r) {
            var o, s, a = [],
                l;
            if (!e) {
                return ""
            }
            if (e == "today") {
                if (r) {
                    l = n().format("HH:mm")
                } else {
                    l = "23:59"
                }
                o = n(n().format("DD.MM.YYYY") + " " + l, "DD.MM.YYYY HH:mm");
                return t === "timestamp" ? o : o.format(
                    AMOCRM.system.format.date.date + " " + AMOCRM.system.format.date.time
                )
            }
            if (e == "now") {
                s = n()
            } else {
                if (typeof e === "string" || parseInt(e) != e) {
                    s = n(e, AMOCRM.system.format.date.date + " " + AMOCRM.system.format.date.time)
                } else {
                    s = n.unix(e).tz(AMOCRM.system.timezone)
                }
            }
            if (t != "time") {
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
            if (t != "date") {
                if (s.format("HH:mm") == "23:59" && i !== true) {
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
                if (t == "short") {
                    return i.format(r.date)
                } else if (r[t]) {
                    return i.format(r[t])
                }
            }
            return i.calendar()
        },
        leadName: function(e, t) {
            return e || this.i18n("Lead #") + t
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
        mousewheel: function(e, t) {
            if (e.addEventListener) {
                if ("onwheel" in document) {
                    e.addEventListener("wheel", t, false)
                } else if ("onmousewheel" in document) {
                    e.addEventListener("mousewheel", t, false)
                } else {
                    e.addEventListener("MozMousePixelScroll", t, false)
                }
            } else {
                e.attachEvent("onmousewheel", t)
            }
            return e
        },
        getUserName: function(e) {
            if (!this.users) {
                this.users = {};
                var t = AMOCRM.constant("account");
                if (t && t.users) {
                    this.users = t.users
                }
            }
            return this.users[e]
        },
        time: function(e) {
            var t, n, i;
            if (!e) {
                return ""
            }
            t = Math.floor(e / 60);
            if (e < 60) {
                t = "00";
                i = parseInt(e, 10)
            } else {
                t = parseInt(t, 10);
                i = parseInt(e - t * 60, 10);
                if (t < 10) {
                    t = "0" + t
                } else if (t > 100) {
                    t = this.time(t)
                }
            }
            i = (i < 10 ? ":0" : ":") + i;
            n = t + i;
            return n
        },
        convert_to_readable_time_format: function(e) {
            var t = 60,
                n = Math.pow(60, 2),
                i = n * 24,
                r = {
                    time: 0,
                    time_metric: ""
                },
                o = 0;
            if (Math.round(e / i) > 0) {
                r["time"] = Math.round(e / i);
                r["time_metric"] = AMOCRM.lang.days
            } else if (Math.round(e / n) > 0 && e >= 3600) {
                o = Math.round(e / n - e % n / n);
                o += e % n > n / 2 ? .5 : 0;
                r["time"] = o;
                r["time_metric"] = AMOCRM.lang.hours
            } else if (Math.floor(e / t) > 0) {
                r["time"] = Math.round(e / t);
                r["time_metric"] = AMOCRM.lang.minutes
            } else if (e > 0) {
                r["time"] = e;
                r["time_metric"] = AMOCRM.lang.seconds
            }
            r["time_metric"] = this.numeralWord(r["time"], r["time_metric"]);
            return r
        },
        replaceHtml: function(e, t) {
            var n = typeof e === "string" ? document.getElementById(e) : e;
            var i = n.cloneNode(false);
            i.innerHTML = t;
            var r = n.querySelector("#search-options");
            var o = i.querySelector("#search-options");
            if (o && r && r.parentNode.classList.contains("list-top-search-options-showed")) {
                o.parentNode.querySelector("#search_clear_button").style.display = "block";
                o.parentNode.classList.add("list-top-search-options-showed");
                o.parentNode.replaceChild(r, o)
            }
            n.parentNode.replaceChild(i, n);
            return i
        },
        getUserRights: function(e) {
            if (Boolean(AMOCRM.constant("user_rights")[AMOCRM.data.current_entity]) !== false) {
                var t = AMOCRM.data.current_entity,
                    n = AMOCRM.constant("user_rights")[t],
                    i = Object.keys(n),
                    r = 0,
                    o, s;
                for (s in n) {
                    if (r == 2) {
                        break
                    }
                    if ("CONTACT" == s || "COMPANY" == s) {
                        r++
                    }
                }
                switch (r) {
                    case 1:
                        o = i[0] != "restore" ? n[i[0]] : n;
                        break;
                    case 2:
                        o = [];
                        for (s in n["CONTACT"]) {
                            o[s] = n[i[1]][s] && n[i[0]][s]
                        }
                        break;
                    default:
                        o = e;
                        break
                }
            }
            return o !== undefined ? o : e
        },
        transliterate: function(e, t) {
            t = o[t];
            if (!t) {
                t = o.translit
            }
            return e.replace(/([а-яё])/gi, function(e) {
                var n, i;
                n = e.toLowerCase();
                i = t[n];
                if (typeof i === "undefined") {
                    return e
                }
                if (n === e) {
                    return i
                }
                return i.substring(0, 1).toUpperCase() + i.substring(1)
            })
        },
        isValidUrl: function(e) {
            var t = new RegExp(
                '/^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.' +
                '254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1' +
                '-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d' +
                '|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)' +
                '*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i'
            );

            return t.test(e)
        },
        storeWithExpiration: {
            set: function(e, t, n) {
                S.set(e, {
                    val: t,
                    exp: n,
                    time: (new Date).getTime()
                })
            },
            get: function(e) {
                var t = S.get(e);
                if (!t || (new Date).getTime() - t.time > t.exp) {
                    return null
                }
                return t.val
            }
        },
        endsWith: function(e, t) {
            return e.indexOf(t, e.length - t.length) !== -1
        },
        checkEmail: function(e) {
            return (new RegExp(
                '/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,11}(?:\.[a-z]{2,11})?)$/i'
            )).test(
                i.trim(e)
            )
        },
        make_lead_name_from_wordpress_form: function(e) {
            var t = false,
                n = AMOCRM.constant("amoforms") || {},
                i = n["types"] && n["types"]["wordpress"] ? n["types"]["wordpress"] : null;

            if (
                P.isPlainObject(e) && e.origin && e.origin["form_type"] == i && e.origin["request_id"] &&
                e.origin["url"]
            ) {
                t = AMOCRM.lang["request_number"] + e.origin["request_id"] + " " + AMOCRM.lang["from_site"] + " " +
                    e.origin["url"].replace(new RegExp('/^https?:\/\//'), "")
            }

            return t
        },
        setCursorPosition: function(e, t) {
            var n;
            if (e instanceof jQuery) {
                e.focus().each(function(e, i) {
                    if (i.setSelectionRange) {
                        i.setSelectionRange(t, t)
                    } else if (i.createTextRange) {
                        n = i.createTextRange();
                        n.collapse(true);
                        n.moveEnd("character", t);
                        n.moveStart("character", t);
                        n.select()
                    }
                })
            }
        },
        has_keys: function(e, n) {
            var i = true,
                r = t.clone(e);
            t.each(n, function(e) {
                i = i && t.has(r, e);
                if (i) {
                    r = t.clone(r[e])
                }
            });
            return i
        },
        changeKeysCase: function(e, n) {
            var r = {};
            t.each(e, function(e, o) {
                var s = n === "upper" ? o.toString().toUpperCase() : o.toString().toLowerCase();
                if (t.isObject(e)) {
                    r[s] = i.changeKeysCase(e, n)
                } else if (t.isArray(e)) {
                    r[s] = t.map(e, function(e) {
                        i.changeKeysCase(e, n)
                    })
                } else {
                    r[s] = e
                }
            });
            return r
        },
        prettyNumber: function(e) {
            e = e === null || e === undefined ? 0 : e + "";
            var t = "",
                n = e.length,
                i = 0,
                r = false;
            if (!n) {
                return e
            }
            i = n % 3;
            if (i) {
                r = true
            }
            for (var o = 1; o <= n; o++) {
                t += e[o - 1];
                if (o < n) {
                    if (r) {
                        if (i == o) {
                            t += " ";
                            r = false
                        }
                    } else if (o % 3 - i == 0) {
                        t += " "
                    }
                }
            }
            return t
        },
        resizeFontSize: function(e) {
            var t = e.targetElements,
                n = e.minFontSize,
                i, r = e.compressor,
                o = parseFloat(e.maxFontSize),
                s = function(e) {
                    var t = e.width();
                    i = Math.max(Math.min(t / (r * 10), o), n);
                    e.css("font-size", Math.floor(i))
                };
            t.each(function() {
                var e = P(this);
                s(e)
            })
        },
        mergeChatsMessages: function(e) {
            var n = 0,
                i, r = t.values(e);
            return t.each(r, function(e, r, o) {
                var s = e.date - n;
                e.text = t.isArray(e.text) ? e.text : [e.text];
                n = e.date;
                e.text = t.map(e.text, function(e) {
                    return {
                        type: "text",
                        text: e
                    }
                });
                if (!e.links) {
                    e.links = []
                } else if (e.links.links) {
                    e.links = [e.links]
                } else {
                    e.links = t.values(e.links)
                }
                e.data = e.links.concat(e.text);
                if (s >= 60) {
                    e.prepend_date = true;
                    i = r;
                    return
                }
                if (!(i && o[i])) {
                    i = r;
                    return
                }
                if (o[i].manager == e.manager && s <= 10) {
                    Array.prototype.push.apply(o[i].text, e.text);
                    Array.prototype.push.apply(o[i].links, e.links);
                    Array.prototype.push.apply(o[i].data, e.data);
                    e.hide = true;
                    return
                }
                i = r
            })
        },
        checkVisible: function(e) {
            var t = e.getBoundingClientRect();
            var n = Math.max(document.documentElement.clientHeight, window.innerHeight);
            return !(t.bottom < 0 || t.top - n >= 0)
        },
        reductNumericValue: function(e) {
            e = e || {};
            var t, n = e.value || 0,
                r = e.maxValue || 99999999,
                o = AMOCRM.lang.currency_class.reductions,
                s = "",
                a = "",
                l = [],
                u = 0,
                c = AMOCRM.system.locale.currency_symbol,
                d = e.isShortened || 0;
            if (n) {
                t = a = i.prettyNumber(n);
                l = a.split(" ");
                if (n > r) {
                    u = +(n / Math.pow(1e3, l.length - 1)).toFixed(1);
                    if (u == +l[0] || e.roundValue) {
                        u = u.toFixed()
                    }
                    t = u;
                    if (!e.is_plain_number) {
                        if (l.length == 2) {
                            if (d) {
                                s = "k"
                            } else {
                                s = o["thousands"]
                            }
                        } else if (l.length == 3) {
                            if (d) {
                                s = "m"
                            } else {
                                s = o["millions"]
                            }
                        } else if (l.length == 4) {
                            if (d) {
                                s = "b"
                            } else {
                                s = o["billions"]
                            }
                        }
                    }
                }
                if (s) {
                    if (d) {
                        t += s
                    } else {
                        t += " " + s
                    }
                }
            } else {
                t = "0"
            }
            if (e.isCurrency) {
                t += " " + c
            }
            return t
        },
        i18n: function(e) {
            if (typeof AMOCRM.lang[e] !== "undefined") {
                return AMOCRM.lang[e]
            }
            return e
        },
        _getV3Plug: function() {
            var e = ["leads", "customers", "contacts", "dashboard", "todo", "catalogs", "mail", "events", "settings"];
            return function() {
                return t.include(e, AMOCRM.getBaseEntity())
            }
        }(),
        toTitleCase: function(e) {
            return (e || "").replace(/(\w)(\w*)/g, function(e, t, n) {
                return t.toUpperCase() + (n != null ? n : "")
            })
        },
        getTextWidth: function(e, t) {
            var n, i, r;
            n = this.canvas || (this.canvas = document.createElement("canvas"));
            i = n.getContext("2d");
            t = t || 'normal 15px "PT Sans"';
            i.font = t;
            r = i.measureText(e);
            return r.width
        },
        getMatchingEntity: function(e) {
            var n = {
                    contacts: ["companies"]
                },
                i;
            e = e || AMOCRM.data.current_entity;
            t.each(n, function(n, r) {
                if (t.contains(n, e)) {
                    i = r
                }
            });
            return i || e
        },
        getLeadsWinlostStatuses: function(e) {
            if (!t.isUndefined(e)) {
                return l[e]
            }
            return t.values(l)
        },
        getEntityByTypeId: function(e) {
            return t.invert(AMOCRM.element_types)[e]
        },
        convertElementType: function(e, n) {
            var i = {
                int: false,
                string: false,
                single: false
            };
            if (i[n] == undefined) {
                return false
            }
            E.forEach(function(n) {
                var r = t.find(n, function(t) {
                    return t == e
                });
                if (r != undefined) {
                    i = n
                }
            });
            return i[n]
        },
        parseLinkedType: function(e) {
            if (!e) {
                throw new Error("Invalid type given: " + JSON.stringify([e]))
            }
            if (!e.id) {
                throw new Error("Type id must be defined")
            }
            if (!e.type) {
                e.type = i.convertElementType(e.id, "string") || "catalog_elements"
            }
            if (!e.name) {
                throw new Error("Type name must be defined")
            }
            return t.pick(e, ["id", "type", "name"])
        },
        cleanResponse: function(e) {
            e = e || {};
            if (e.responseJSON) {
                e = e.responseJSON
            }
            if (e.response) {
                e = e.response
            }
            return e
        },
        passwordGen: function(e) {
            var t = ["abcdefghijklmnopqrstuvwxyz", "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "123456789"],
                n = "",
                i = e / 2 - 1,
                r = e - i - i,
                o;
            for (o = 0; o < i; o++) {
                n += t[0].charAt(Math.floor(Math.random() * t[0].length))
            }
            for (o = 0; o < i; o++) {
                n += t[1].charAt(Math.floor(Math.random() * t[1].length))
            }
            for (o = 0; o < r; o++) {
                n += t[2].charAt(Math.floor(Math.random() * t[2].length))
            }
            n = n.split("").sort(function() {
                return .5 - Math.random()
            }).join("");
            return n
        },
        getWidgetCallbacks: function(e) {
            if (AMOCRM.widgets.list && AMOCRM.widgets.list[e] && AMOCRM.widgets.list[e].callbacks) {
                return AMOCRM.widgets.list[e].callbacks
            }
        },
        capitalize: function(e) {
            var n = String(e).split(" ");
            return t.map(n, function(e) {
                return e.charAt(0).toUpperCase() + e.substr(1)
            }).join(" ")
        },
        isDarkColor: function(e) {
            var t, n;
            if (e === "transparent") {
                return false
            }
            t = this.hex2rgb(e);
            n = t[0] * 299 + t[1] * 587 + t[2] * 114;
            n = n / 255e3;
            return n < .5
        },
        hex2rgb: function(e) {
            if (e.lastIndexOf("#") > -1) {
                e = e.replace(/#/, "0x")
            } else {
                e = "0x" + e
            }
            return [e >> 16, (e & 65280) >> 8, e & 255]
        }
    };
    P(function() {
        i.scrollBarWidth = i.getScrollBarWidth()
    });
    return i
});
