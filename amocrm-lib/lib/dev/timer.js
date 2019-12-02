define("lib/dev/timer", ["lib/common/urlparams"], function(t) {
    "use strict";
    var i = t.getQueryParam("beautifultimer"),
        s, n;
    return {
        fix: function(e, t) {
            if (s && i) {
                $("#mybeautifultimer").parent().append('<div class="animated tada">' + e + ": " + (Date.now() - s) + "</div>");
                if (t) {
                    t.append('<span class="animated tada" style="position:fixed;top:0;z-index:1000;background:#000;color:#fff;">' + (Date.now() - s) + "</span>")
                }
            }
            return this
        },
        start: function() {
            if (i) {
                $("#mybeautifultimer").parent().remove();
                $(document.body).append('<div style="text-align:right;background:#000;color:#fff;position:fixed;top:0;right:0;z-index:110111010;"><span id="mybeautifultimer"></span></div>');
                s = Date.now();
                n = setInterval(function() {
                    document.getElementById("mybeautifultimer").innerHTML = Date.now() - s
                }, 1)
            }
            return this
        },
        stop: function() {
            if (i) {
                clearInterval(n)
            }
            return this
        }
    }
});
