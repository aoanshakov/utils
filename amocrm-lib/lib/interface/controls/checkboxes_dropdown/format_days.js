define("lib/interface/controls/checkboxes_dropdown/format_days", ["underscore"], function(t) {
    "use strict";
    return {
        daysFormater: function(e, n) {
            var i, r, o;
            if (n && t.last(e).value === 7) {
                t.last(e).value = 0;
                e = t.sortBy(e, "value")
            }
            t.every(e, function(e) {
                if (!r && r !== 0) {
                    r = e.value;
                    i = "dash"
                } else if (r + 1 === e.value) {
                    r = e.value;
                    i = "dash"
                } else {
                    i = "comma"
                }
                return i === "dash"
            });
            t.find(e, function(n) {
                if (t.isUndefined(o)) {
                    o = n.name
                } else if (i === "dash") {
                    o += " - " + t.last(e).name;
                    return true
                } else {
                    o += ", " + n.name
                }
            });
            return o
        }
    }
});
