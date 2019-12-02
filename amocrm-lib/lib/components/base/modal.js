define("lib/components/base/modal", [
    "jquery", "underscore", "twig-augmented", "lib/core/view", "lib/interface/controls/overlay", 'Modernizr'
], function(t, i, s, n) {
    "use strict";

    var o = i.template(
        '<div class="modal-scroller custom-scroll">' +
        '<div class="modal-body modal-body-loading <% if (float_animation) { %>' +
            'modal-body-float-animation' +
        '<% } %>"></div>' + "</div>"
    );

    var r = i.template(
        '<div class="default-overlay modal-overlay <% if (!default_overlay) { %> modal-overlay_white <% } %>">' +
        '<span class="modal-overlay__spinner spinner-icon spinner-icon-abs-center"></span>' + "</div>"
    );

    var a = 13,
        l = 27,
        c = 500,
        d = 500,
        u = 500;

    return n.extend({
        className: "modal",
        _classes: function() {
            return {
                accept_button: "js-modal-accept",
                body: "modal-body",
                body_inner: "modal-body__inner",
                close_button: "modal-body__close",
                modal_error: "js-modal-error",
                overlay: "modal-overlay",
                scroller: "modal-scroller",
                try_again_button: "js-modal-try-again"
            }
        },
        _selectors: function() {
            return {
                cancel_button: ".modal-body__actions .button-cancel",
                overlay_spinner: ".modal-overlay .modal-overlay__spinner"
            }
        },
        events: function() {
            var e = i.result(n.prototype, "events", {});
            e["click " + this._selector("try_again_button")] = "onModalTryAgainClick";
            e["click " + this._selector("accept_button")] = "onModalAcceptClick";
            e["click " + this._selector("close_button")] = "onModalCloseClick";
            e["click " + this._selector("cancel_button")] = "onModalCancelClick";
            e["click " + this._selector("scroller")] = "onModalScrollerClick";
            e["modal:loaded " + this._selector("body")] = "onModalLoaded";
            e["modal:centrify " + this._selector("body")] = "onModalCentrify";
            e["modal:need-page-reload " + this._selector("body")] = "onPageReloadAfterModalClose";
            return e
        },
        document_events: function() {
            var e = i.result(n.prototype, "document_events", {
                "page:changed": "onPageChanged",
                keydown: "onModalKeydown"
            });
            return e
        },
        _setOptions: function(e) {
            this.options = t.extend({
                class_name: "modal-list",
                can_centrify: false,
                init: i.noop,
                destroy: i.noop,
                container: document.body,
                disable_overlay_click: false,
                disable_escape_keydown: false,
                disable_enter_keydown: false,
                init_animation: false,
                default_overlay: false,
                preload_templates: [],
                focus_element: ".js-modal-accept"
            }, e || {});
            return this
        },
        initialize: function(e) {
            var t;
            n.prototype.initialize.call(this);
            this._setOptions(e).render();
            if (AMOCRM.is_touch_device && this.options.can_centrify) {
                i.delay(i.bind(this.onModalCentrify, this), u)
            }
            if (!this.options.disable_resize) {
                this._$window.on("resize" + this.ns, i.debounce(i.bind(this.onModalCentrify, this), 50))
            }
            this.delegateEvents();
            t = i.bind(this.options.init, this, this._elem("body"));
            if (this.options.preload_templates.length) {
                s._preload(this.options.preload_templates)().then(t)
            } else {
                t()
            }
            return this
        },
        destroy: function() {
            if (this.$overlay.hasClass("permanent-overlay") || this.options.destroy() === false || this._destroyed) {
                return false
            }
            this._destroyed = true;
            this.$overlay.trigger("overlay:hide", {
                callback: i.bind(n.prototype.destroy, this, true)
            });
            this._elem("body").remove();
            if (this.options.need_page_reload) {
                this._$document.trigger("page:reload")
            }
        },
        setNS: function() {
            this.ns = ".modal:core." + i.uniqueId("modal_")
        },
        render: function() {
            this.$el.addClass(this.options.class_name);
            this.$el.html(o({
                float_animation: this.options.init_animation
            }));
            this.$modal = this.$el;
            this.$overlay = t(r({
                default_overlay: this.options.default_overlay
            }));
            this.$el.append(this.$overlay);
            t(this.options.container).append(this.$el);
            if (t(".modal").length > 1) {
                this.$overlay.css(Modernizr.prefixed("transition"), "none")
            }
            this.$overlay.trigger("overlay:show");
            this.disable_overlay_click = this.options.disable_overlay_click;
            this.$el.find(this.options.focus_element).focus();
            this.$el.prepareTransition();
            return this
        },
        onModalAcceptClick: function(e) {
            this._elem("overlay_spinner").show()
        },
        onModalTryAgainClick: function(e) {
            this._elem("body").css("width", "");
            this._findElem("modal_error").remove();
            this._findElem("body_inner").show();
            this.onModalCentrify()
        },
        onModalKeydown: function(e) {
            var s = t(".modal:visible", document.body),
                n = t(e.target),
                o;
            if (!s.length) {
                return
            }
            o = i.findIndex(s, function(e) {
                return e.isSameNode(this.el)
            }, this);
            if (o !== s.length - 1) {
                return
            }
            switch (e.keyCode) {
                case a:
                    if (this.options.disable_enter_keydown) {
                        return
                    }
                    if (!n.closest(".modal").length || !n.is(":input") || s.hasClass("js-modal-confirm")) {
                        n.blur();
                        e.stopImmediatePropagation();
                        this._findElem("accept_button").trigger("click")
                    }
                    break;
                case l:
                    if (!this.disable_overlay_click && !this.options.disable_escape_keydown) {
                        this.destroy()
                    }
                    break
            }
        },
        onModalCloseClick: function(e) {
            e.stopPropagation();
            this.destroy()
        },
        onModalCancelClick: function(e) {
            if (!this.options.disable_cancel_click) {
                this.destroy();
                e.stopPropagation()
            }
        },
        onModalScrollerClick: function(e) {
            var i = t(e.target);

            if (
                i.hasClass("modal-scroller") && !this.disable_overlay_click || i.closest(".button-cancel").length &&
                !this.disable_cancel_click
            ) {
                this.destroy()
            }
        },
        onPageChanged: function() {
            if (this.options.can_destroy !== false) {
                this.destroy()
            }
        },
        onModalLoaded: function() {
            this._elem("body").removeClass("modal-body-loading");
            this._elem("overlay_spinner").hide()
        },
        onModalCentrify: function() {
            var e, t, i, s, n;
            this.onModalLoaded();
            e = this._findElem("body");
            t = e.get(0);
            i = t.offsetHeight;
            s = t.parentNode.offsetHeight;
            if (i < s) {
                n = t.offsetWidth;
                e.css({
                    marginTop: (s / 2 - i / 2 + i) * -1,
                    marginLeft: n / 2 * -1
                }).removeClass("modal-body-relative")
            } else {
                e.addClass("modal-body-relative").css({
                    marginTop: "",
                    marginLeft: ""
                })
            }
            if (this.options.init_animation) {
                e.prepareTransition().removeClass("modal-body-float-animation")
            }
            if (this.options.centrify_animation) {
                this.centrifyAnimation()
            }
        },
        centrifyAnimation: function(e) {
            if (e === false) {
                this._elem("body").removeClass("modal-body-centrified")
            } else {
                this._elem("body").offset();
                this._elem("body").addClass("modal-body-centrified")
            }
        },
        show: function() {
            this.$el.show()
        },
        hide: function() {
            this.$el.hide()
        },
        showError: s._preload(["/tmpl/common/modal/error.twig"], "_showError"),
        _showError: function(e, t) {
            t = i.isBoolean(t) ? t : true;
            this.centrifyAnimation(false);
            this._elem("overlay_spinner").hide();
            this._findElem("body_inner").hide();
            this._elem("body").first().show().width(c).append(s({
                ref: "/tmpl/common/modal/error.twig"
            }).render({
                text: e || false,
                no_retry: !t
            })).trigger("modal:loaded").trigger("modal:centrify")
        },
        showSuccess: s._preload(["/tmpl/common/modal/success.twig"], "_showSuccess"),
        _showSuccess: function(e, t, n) {
            this.centrifyAnimation(false);
            this._elem("overlay_spinner").hide();
            this._findElem("body_inner").hide();
            this._elem("body").first().show().width(c).append(s({
                ref: "/tmpl/common/modal/success.twig"
            }).render({
                msg: e || false
            })).trigger("modal:loaded").trigger("modal:centrify");
            i.delay(i.bind(function() {
                this.destroy();
                if (i.isFunction(t)) {
                    t()
                }
            }, this), n || d)
        },
        requestStart: function() {
            this._elem("overlay_spinner").show();
            this._elem("body").hide();
            return this
        },
        shakeError: function() {
            this._elem("overlay_spinner").hide();
            this._elem("body").one(AMOCRM.animation_event, i.bind(function(e) {
                t(e.currentTarget).removeClass("animated shake")
            }, this)).addClass("animated shake")
        },
        onPageReloadAfterModalClose: function() {
            this.options.need_page_reload = true
        }
    })
});
