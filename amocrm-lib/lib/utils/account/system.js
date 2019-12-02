define("lib/utils/account/system", ["underscore"], function(t) {
    "use strict";
    var n = 142,
        i = 143,
        r = {
            win: n,
            lost: i
        },
        o = AMOCRM.element_types.leads,
        s = "leads",
        a = "lead",
        l = AMOCRM.element_types.contacts,
        u = "contacts",
        c = "contact",
        d = AMOCRM.element_types.companies,
        f = "companies",
        h = "company",
        p = AMOCRM.element_types.customers,
        g = "customers",
        m = "customer",
        v = AMOCRM.element_types.transactions,
        b = "transactions",
        y = "transaction",
        M = AMOCRM.element_types.catalogs,
        _ = "catalogs",
        w = "catalog",
        A = AMOCRM.element_types.tags,
        x = "tags",
        N = "tag",
        C = AMOCRM.element_types.unsorted,
        T = "unsorted",
        O = "unsorted",
        z = AMOCRM.element_types.todo,
        E = "todos",
        S = "todo",
        L = [{
            int: o,
            string: s,
            single: a
        }, {
            int: l,
            string: u,
            single: c
        }, {
            int: d,
            string: f,
            single: h
        }, {
            int: p,
            string: g,
            single: m
        }, {
            int: v,
            string: b,
            single: y
        }, {
            int: M,
            string: _,
            single: w
        }, {
            int: A,
            string: x,
            single: N
        }, {
            int: C,
            string: T,
            single: O
        }, {
            int: z,
            string: E,
            single: S
        }],
        P;
    P = {
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
        isWonStatus: function(e) {
            return r.win === parseInt(e)
        },
        isLostStatus: function(e) {
            return r.lost === parseInt(e)
        },
        isUnsortedStatus: function(e) {
            return AMOCRM.constant("unsorted_statuses")[e]
        },
        getLeadsWinlostStatuses: function(e) {
            if (!t.isUndefined(e)) {
                return r[e]
            }
            return t.values(r)
        },
        isWonLostStatus: function(e) {
            return t.contains(P.getLeadsWinlostStatuses(), +e)
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
            if (t.isUndefined(i[n])) {
                return false
            }
            L.forEach(function(n) {
                var r = t.find(n, function(t) {
                    return t == e
                });
                if (!t.isUndefined(r)) {
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
                e.type = P.convertElementType(e.id, "string") || "catalog_elements"
            }
            if (!e.name) {
                throw new Error("Type name must be defined")
            }
            return t.pick(e, ["id", "type", "name"])
        },
        getLangId: function() {
            return AMOCRM.lang_id
        },
        isHelpbotEnabled: function() {
            return AMOCRM.constant("account").helpbot_enabled
        },
        getVersion: function() {
            return AMOCRM.constant("account").version
        }
    };
    return P
});
