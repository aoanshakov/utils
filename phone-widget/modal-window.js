define(function () {
    function getHtml (options) {
        return '<div class="uis_widget">' +
            '<div class="widget-settings__modal modal">' +
                '<div class="modal-scroller custom-scroll">' +
                    '<div class="modal-body modal-body-relative" style="margin-bottom: -660px;">' +
                        '<div class="widget-settings ">' +
                            '<div class="widget-settings__base-space">' +
                                '<div class="widget_main_info">' +
                                    '<div class="widget_settings_block__img">' +
                                        '<img src="http://127.0.0.1/amocrm_deploy/images/logo_main.png">' +
                                    '</div>' +
                                    '<div class="widget_settings_block__head">' +
                                        '<div class="widget_settings_block__title h-text-overflow" title="' +
                                            options.i18n.widget.name +
                                        '">' + options.i18n.widget.name +
                                        '</div>' +
                                        '<div class="widget_settings_block__head-desc">' +
                                            options.i18n.widget.short_description +
                                        '</div>' +
                                    '</div>' +
                                    '<div class="widget-settings__command-plate ">' +
                                            options.commandPlate +
                                    '</div>' +
                                '</div>' +
                                '<hr class="widget_settings_block__separator">' +
                                '<div class="widget-settings__additional-block">' +
                                    '<div class="widget-additional-info">' +
                                        '<div class="widget-additional-info__support-page">' +
                                            '<div class="widget-support-page__desc">' +
                                                'Обратитесь в техподдержку ' + options.i18n.widget.name + ' в случае ' +
                                                'неправильной работы интеграции' +
                                            '</div>' +
                                            '<div class="widget-support-page__link">' +
                                                '<a ' +
                                                    'href="https://www.uiscom.ru/podderzhka" ' +
                                                    'target="_blank" ' +
                                                    'class="button-input widget-support-page__button"' +
                                                '>' +
                                                    'Обратная связь' +
                                                    '<svg class="svg-icon svg-settings--widgets--support_page-dims">' +
                                                        '<use xlink:href="#settings--widgets--support_page"></use>' +
                                                    '</svg>' +
                                                '</a>' +
                                            '</div>' +
                                        '</div>' +
                                        '<div class="widget-rating-box">' +
                                            '<span class="widget-rating-box__rating-count">4.2</span>' +
                                            '<div class="widget-rating-box__stars">' +
                                                '<svg class="svg-icon svg-common--star ">' +
                                                    '<use xlink:href="#common--star"></use>' +
                                                '</svg>' +
                                                '<svg class="svg-icon svg-common--star ">' +
                                                    '<use xlink:href="#common--star"></use>' +
                                                '</svg>' +
                                                '<svg class="svg-icon svg-common--star ">' +
                                                    '<use xlink:href="#common--star"></use>' +
                                                '</svg>' +
                                                '<svg class="svg-icon svg-common--star ">' +
                                                    '<use xlink:href="#common--star"></use>' +
                                                '</svg>' +
                                                '<svg class="svg-icon svg-common--star-border ">' +
                                                    '<use xlink:href="#common--star-border"></use>' +
                                                '</svg>' +
                                            '</div>' +
                                            '<span class="widget-rating-box__reviews-count">(57)</span>' +
                                        '</div>' +
                                        '<div class="widget-additional-info__reviews-wrapper">' +
                                            '<div class="' +
                                                'widget-additional-info__reviews-list '  +
                                                'widget-additional-info__reviews-list_initially-hidden' +
                                            '">' +
                                                '<div class="widget-additional-info__review">' +
                                                    '<div class="widget-additional-info__review-info">' +
                                                        '<p class="widget-additional-info__review-text">огонь</p>' +
                                                        '<div class="widget-additional-info__review-meta">' +
                                                            '<span class="widget-additional-info__review-name">' +
                                                                'Василий,' +
                                                            '</span>' +
                                                            '<span class="widget-additional-info__review-date">' +
                                                                '03/05/2019' +
                                                            '</span>' +
                                                            '<span class="widget-additional-info__review-rating">' +
                                                                '<span>5</span>' +
                                                                '<svg class="' +
                                                                    'svg-icon svg-settings--widgets--rating-star-dims' +
                                                                '">' +
                                                                    '<use xlink:href="' +
                                                                        '#settings--widgets--rating-star' +
                                                                    '">' +
                                                                    '</use>' +
                                                                '</svg>' +
                                                            '</span>' +
                                                        '</div>' +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' +
                                            '<span class="widget-additional-info__reviews-more ">' +
                                                'Больше отзывов' +
                                            '</span>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                            '<div class="widget-settings__desc-space">' +
                                '<div class="widget_settings_block">' +
                                    '<div class="' +
                                        'widget_settings_block__descr widget-settings-block__desc-expander_hidden' +
                                    '">' + options.i18n.widget.description + '</div>' +
                                    '<div class="widget-settings-block__desc-expander">' +
                                        '<span class="js-widget-settings-desc-expander">показать полностью</span>' +
                                    '</div>' +
                                    '<div style="display: none">' +
                                        '<input type="text">' +
                                        '<input type="password" name="password" autocomplete="new-password">' +
                                    '</div>' +
                                    '<div class="widget_settings_block__fields" id="widget_settings__fields_wrapper">' +
                                        '<div class="widget_settings_block__item_field">' +
                                            '<div class="widget_settings_block__title_field" title="">' +
                                                'Контактный телефон: ' +
                                            '</div>' +
                                            '<div class="widget_settings_block__input_field">' +
                                                '<input name="phone" ' +
                                                    'class="widget_settings_block__controls__ text-input" ' +
                                                    'type="text" ' +
                                                    'placeholder="" ' +
                                                    'autocomplete="off" ' +
                                                    'value="74951234567"' +
                                                '>' +
                                            '</div>' +
                                        '</div>' +
                                        '<div class="widget_settings_block__item_field">' +
                                            '<div class="widget_settings_block__title_field" title="">ФИО: </div>' +
                                            '<div class="widget_settings_block__input_field">' +
                                                '<input ' +
                                                    'name="name" ' +
                                                    'class="widget_settings_block__controls__ text-input" ' +
                                                    'type="text" ' +
                                                    'placeholder="" ' +
                                                    'autocomplete="off"' +
                                                '>' +
                                            '</div>' +
                                        '</div>' +
                                        options.saveButton +
                                        '<div class="switcher_wrapper">' +
                                            '<label ' +
                                                'for="widget_active__sw" ' +
                                                'class="' +
                                                    'switcher switcher__off switcher_blue widget-settings__switcher' +
                                                '" ' +
                                                'id=""' +
                                            '></label>' +
                                            '<input ' +
                                                'type="checkbox" ' +
                                                'value="Y" ' +
                                                'name="widget_active" ' +
                                                'id="widget_active__sw" ' +
                                                'class="switcher__checkbox js-widget-install"' +
                                            '>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="default-overlay modal-overlay  modal-overlay_white">' +
                    '<span class="modal-overlay__spinner spinner-icon spinner-icon-abs-center">' +
                    '</span>' +
                '</div>' +
            '</div>' +
        '</div>';
    }

    return function (i18n) {
        var options = {
            i18n: i18n,
            saveButton: '',
            commandPlate: (
                '<div class="widget-state widget-state_status_install">' +
                    '<span class="widget-state__name">install</span>' +
                    '<svg class="svg-icon widget-state__icon svg-common--refresh-dims">' +
                        '<use xlink:href="#common--refresh"></use>' +
                    '</svg>' +
                '</div>' +
                '<div>' +
                    '<button ' +
                        'type="button" ' +
                        'data-id="3529" ' +
                        'class="' +
                            'button-input ' +
                            'js-widget-install ' +
                            'button-input_blue ' +
                            'install-widget__button ' +
                            'button-input-disabled' +
                        '"'  +
                        'tabindex="" '  +
                        'id="uis_widget" '  +
                        'disabled=""' +
                    '>' +
                        '<span class="button-input-inner ">' +
                            '<svg class="svg-icon svg-controls--button-add-dims">' +
                                '<use xlink:href="#controls--button-add"></use>' +
                            '</svg>' +
                            '<span class="button-input-inner__text">Установить </span>' +
                        '</span>' +
                    '</button>' +
                '</div>'
            )
        };

        return {
            setInstalled: function () {
                options.commandPlate = (
                    '<div class="widget-state widget-state_status_installed">' +
                        '<span class="widget-state__name">Установлен</span>' +
                        '<svg class="svg-icon widget-state__icon svg-common--refresh-dims">' +
                            '<use xlink:href="#common--refresh"></use>' +
                        '</svg>' +
                    '</div>' +
                    '<div class="widget_settings_block__controls_top">' +
                        '<button ' +
                            'type="button" ' +
                            'data-id="470095" ' +
                            'class="button-input button-cancel js-widget-uninstall" ' +
                            'tabindex="" ' +
                            'id="uis_widget" ' +
                            'style=""' +
                        '>' +
                            '<span>Отключить</span>' +
                        '</button>' +
                    '</div>'
                );

                options.saveButton = 
                    '<div class="' +
                        'widget_settings_block__controls widget_settings_block__controls_top' +
                    '">' +
                        '<button ' +
                            'type="button" data-onsave-destroy-modal="true" ' +
                            'data-id="4959" ' +
                            'class="button-input   js-widget-save ' +
                                'button-input-disabled' +
                            '" ' +
                            'tabindex="" ' +
                            'id="save_comagic_widget"' +
                        '>' +
                            '<span class="button-input-inner ">' +
                                '<span class="button-input-inner__text">Сохранить</span>' +
                            '</span>' +
                        '</button>' +
                    '</div>';

                return this;
            },
            show: function () {
                document.body.innerHTML = getHtml(options);
            }
        };
    };
});
