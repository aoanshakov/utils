define("lib/utils/generator", ["store"], function(t) {
    "use strict";
    var n = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
        i = ["abcdefghijklmnopqrstuvwxyz", "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "123456789"];
    return {
        randHex: function() {
            return ((1 + Math.random()) * 65536 | 0).toString(16).substring(1)
        },
        randString: function(e) {
            var t = n.length,
                i = "",
                r = 0;
            e = e || 4;
            for (r; r < e; r++) {
                i += n[parseInt(Math.floor(Math.random() * t))]
            }
            return i
        },
        randInt: function(e, t) {
            return Math.floor(Math.random() * (t - e + 1)) + e
        },
        password: function(e) {
            var t = i,
                n = "",
                r = e / 2 - 1,
                o = e - r - r,
                s;
            for (s = 0; s < r; s++) {
                n += t[0].charAt(Math.floor(Math.random() * t[0].length))
            }
            for (s = 0; s < r; s++) {
                n += t[1].charAt(Math.floor(Math.random() * t[1].length))
            }
            for (s = 0; s < o; s++) {
                n += t[2].charAt(Math.floor(Math.random() * t[2].length))
            }
            n = n.split("").sort(function() {
                return .5 - Math.random()
            }).join("");
            return n
        },
        storeWithExpiration: {
            set: function(e, n, i) {
                t.set(e, {
                    val: n,
                    exp: i,
                    time: (new Date).getTime()
                })
            },
            get: function(e) {
                var n = t.get(e);
                if (!n || (new Date).getTime() - n.time > n.exp) {
                    return null
                }
                return n.val
            },
            remove: function(e) {
                t.remove(e)
            }
        }
    }
});
