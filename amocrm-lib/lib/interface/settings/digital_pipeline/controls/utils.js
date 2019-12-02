define("lib/interface/settings/digital_pipeline/controls/utils", [
    "underscore", "lib/common/fn", "moment", "lib/interface/controls/checkboxes_dropdown/format_days"
], function(t, n, i, r) {
    "use strict";
    return {
        getTitleWorkingHours: function(e) {
            var i = "";
            t.each(e, function(e, t) {
                var o = this.getWeekDaysString(e.week_days),
                    s = e.time_to;
                if (s === "11:59 PM" || s === "23:59") {
                    s = s === "11:59 PM" ? "12:00 AM" : "00:00"
                }
                i += r.daysFormater(o, this.isSundayFirst()) + " " + n.i18n("from time") + " " + e.time_from + " " + n.i18n("till time") + " " + s + "; \r\n"
            }, this);
            return i
        },
        getWeekDaysString: function(e) {
            return t.map(e, function(e) {
                return {
                    name: this.getMomentDays(e),
                    value: e
                }
            }, this)
        },
        getMomentDays: function(e) {
            return i().days(e).format("dd")
        },
        isSundayFirst: function() {
            return parseInt(i().endOf("week").format("d")) === 6
        }
    }
});
