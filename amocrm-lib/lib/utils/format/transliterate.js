define("lib/utils/format/transliterate", function() {
    "use strict";
    var t = {};
    t.translit = {
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
    };
    t.punto = {
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
    };
    return function(e, n) {
        n = t[n];
        if (!n) {
            n = t.translit
        }
        return (e || "").replace(/([а-яё])/gi, function(e) {
            var t, i;
            t = e.toLowerCase();
            i = n[t];
            if (typeof i === "undefined") {
                return e
            }
            if (t === e) {
                return i
            }
            return i.substring(0, 1).toUpperCase() + i.substring(1)
        })
    }
});
