define("lib/utils/url_parser", ["underscore", "lib/utils/generator"], function(t, n) {
    "use strict";
    var i = {
            "#URL": /(\b([a-z]{3,8}):\/\/[-a-zа-я0-9+&@#\/%?=~_|!:,.;]*[-a-zа-я0-9+&@#\/%=~_|])/gim,
            "#WWW": /(www.[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&\/\/=]*))/gim,
            "#EMAILS": /([-a-zа-я0-9!#$%&'*+\/=?^_`{|}~]+(?:\.[-а-яa-z0-9!#$%&'*+\/=?^_`{|}~]+)*@(?:[a-zа-я0-9]([-a-zа-я0-9]{0,61}[а-яa-z0-9])?\.)*([a-zа-я]{2,8}))/gim
        },
        r;
    r = function(e) {
        this.options = e || {};
        this.md_link_replacement = '<a href="$2" target="_blank" rel="nofollow">$1</a>'
    };
    t.extend(r.prototype, {
        parseSimple: function(e) {
            var r = e,
                o = {},
                s = "",
                a = this.options.mail_params || "",
                l;
            if (!r) {
                return ""
            }
            t.each(i, function(e, i) {
                t.each(r.match(e), function(e) {
                    s = i + "_" + n.randHex() + "#";
                    o[s] = e;
                    r = r.replace(e, s)
                })
            });
            t.each(o, function(e, t) {
                switch (t.split("_")[0]) {
                    case "#URL":
                        l = '<a href="' + e + '" target="_blank" rel="nofollow">' + e + "</a>";
                        break;
                    case "#WWW":
                        l = '<a href="http://' + e + '" target="_blank" rel="nofollow">' + e + "</a>";
                        break;
                    case "#EMAILS":
                        l = '<a href="mailto:' + e + a + '">' + e + "</a>";
                        break
                }
                r = r.replace(t, l)
            });
            return r || ""
        },
        isSafe: function(e) {
            var t;
            try {
                t = decodeURIComponent(unescape(e)).replace(/[^\w:]/g, "").toLowerCase()
            } catch (e) {
                return false
            }
            if (t.indexOf("javascript:") === 0 || t.indexOf("vbscript:") === 0 || t.indexOf("data:") === 0) {
                return false
            }
            return true
        },
        has_url_or_email: function(e) {
            return i["#URL"].test(e) || i["#WWW"].test(e) || i["#EMAILS"].test(e)
        },
        parse: function(e) {
            var t = "",
                n = 0,
                i, r = 100,
                o = /\[([^\[\]]+)\]\((\b([a-z]{3,8}):\/\/[-a-zа-я0-9+&@#\/%?=~_|!:,.;]*[-a-zа-я0-9+&@#\/%=~_|])\)/gim;
            if (!e) {
                return t
            }
            while (i = o.exec(e)) {
                t += this.parseSimple(e.substring(n, i.index));
                t += this.md_link_replacement.replace("$1", i[1]).replace("$2", this.isSafe(i[2]) ? i[2] : "");
                n = o.lastIndex;
                r -= 1;
                if (r <= 0) {
                    break
                }
            }
            if (n) {
                t += this.parseSimple(e.substring(n, e.length))
            } else {
                t = this.parseSimple(e)
            }
            return t || ""
        }
    });
    return new r({
        mail_params: AMOCRM.lang.mail ? "?bcc=" + AMOCRM.lang.mail : ""
    })
});
