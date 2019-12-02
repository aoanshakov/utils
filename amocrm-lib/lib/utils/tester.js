define("lib/utils/tester", ["underscore"], function(t) {
    "use strict";
    var n = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,15}(?:\.[a-z]{2,15})?)$/i,
        i = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i,
        r = /^(?:(?:https?|ftp):\/\/)(.+)?$/i,
        o = /^([\w-+]+(?:\.[\w-]+)*)(\.)?@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,11}(?:\.[a-z]{2,11})?)$/i;
    return {
        EMAIL_REGEX: n,
        URL_REGEX: i,
        PROTOCOL_REGEX: r,
        isValidUrl: function(e) {
            return i.test(e)
        },
        isValidUrlProtocol: function(e) {
            return r.test(e)
        },
        endsWith: function(e, t) {
            e = e || "";
            return e.indexOf(t, e.length - t.length) !== -1
        },
        isValidEmail: function(e) {
            e = e || "";
            return n.test(e.toString().trim())
        },
        isValidEmailForSending: function(e) {
            e = e || "";
            return o.test(e.toString().trim())
        },
        isPhoneValid: function(e) {
            return /^\+?[\d]+$/.test(e)
        },
        hasKeys: function(e, n) {
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
        replaceBoolean: function(e) {
            if (t.isBoolean(e)) {
                return e ? "Y" : "N"
            }
            if (t.isArray(e)) {
                return t.map(e, function(e) {
                    return this.replaceBoolean(e)
                }, this)
            }
            if (t.isObject(e)) {
                return t.mapObject(e, function(e) {
                    return this.replaceBoolean(e)
                }, this)
            }
            return e
        },
        isV3Design: function() {
            var e = ["leads", "customers", "contacts", "todo", "catalogs", "mail"],
                n = ["settings-users", "settings-communications"];
            return function() {
                return t.include(e, AMOCRM.getBaseEntity()) || t.include(n, AMOCRM.data.current_entity)
            }
        }(),
        isBase64: function(e) {
            var t = /^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i;
            return !!e.match(t)
        }
    }
});
