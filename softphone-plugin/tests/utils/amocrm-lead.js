define(function () {
    const getUrl = url => `/tests/utils/amocrm/${url}`,
        backgroundUrl = `url('${getUrl('10.jpeg')}')`;

    return (

'<style>' +
    'li {' +
        'list-style-type: none;' +
    '}' +
'</style>' +

`<link rel="stylesheet" type="text/css" href="${getUrl('app.css')}" />` +
`<link rel="stylesheet" type="text/css" href="${getUrl('cards.css')}" />` +

'<div style="width: 65px; position: static;" class="nav__menu-scroll-hide">' +
    '<div style="width: 65px;" class="nav__menu-wrapper">' +
        '<div class="nav__menu" id="nav_menu">' +
            '<div class="nav__menu__item" data-entity="settings">' +
                '<a class="nav__menu__item__link" href="/settings/">' +
                    '<div class="nav__menu__item__icon  icon-settings ">' +
                        '<span ' +
                            'class="' +
                                'js-notifications_counter ' +
                                'nav__notifications__counter' +
                            '" ' +
                            'style="display: none"' +
                        '></span>' +
                    '</div>' +
                    '<div class="nav__menu__item__title"> Настройки </div>' +
                '</a>' +
            '</div>' +
        '</div>' +
    '</div>' +
'</div>' +

'<div style="left: 65px;" class="card-holder__fields">' +

'<li class="linked-forms__item linked-forms__item-active" data-main-item="true">' +
    '<form action="/ajax/contacts/detail/" autocomplete="off" enctype="multipart/form-data" class="linked-form " id="linked_form_22874819" method="post">' +
        '<input type="hidden" name="ID" value="22874819">' +
        '<input type="hidden" name="ELEMENT_TYPE" value="1">' +
        '<input type="hidden" name="MAIN_ID" value="19706781">' +
        '<input type="hidden" name="MAIN_USER_ID" value="9508870">' +
        '<div class="linked-form__field linked-form__field-name">' +
            '<div class="linked-form__field-userpic">' +
                '<input type="hidden" name="avatar" value="">' +
                '<div class="linked-form__field-userpic_inner">' +
                    '<div ' +
                        'class="n-avatar " ' +
                        'id="22874819" ' +
                        'style="' +
                            'background-image: ' +
                                `${backgroundUrl}, ` +
                                `${backgroundUrl}` +
                        '"' +
                    '></div>' +
                '</div>' +
            '</div>' +
            '<div class="linked-form__field__value-name">' +
                '<div class="linked-form__field__link-wrapper">' +
                    '<a data-href="/contacts/detail/22874819" tabindex="-1" class="linked-form__field__link linked-form__field__link_name js-linked-name-control">' +
                        '<input name="" class="linked-form__cf js-linked-name-view js-form-changes-skip text-input" type="text" value="Александр Аншаков" placeholder="..." readonly="readonly" data-comfort-zone="0" autocomplete="off" style="width: 160px;">' +
                        '<tester style="position: absolute; top: -9999px; left: -9999px; width: auto; font-size: 16px; font-family: &quot;PT Sans&quot;, Arial, sans-serif; font-weight: 700; font-style: normal; letter-spacing: 0px; text-transform: none; white-space: pre;">Александр Аншаков</tester>' +
                        '<div class="linked-form__field__value-name-editing js-linked-name-editing-holder hidden">' +
                            '<div class="control-fullname control-fullname_autosized  js-control-fullname " data-comfort-zone="0" data-rerender-name="contact[N]" data-rerender-input-class="linked-form__cf" data-rerender-input-type="" data-rerender-placeholder="..." data-rerender-placeholder-color="" data-rerender-autosized="true">' +
                                '<input type="text" class="text-input control-fullname__separated  control-fullname__separated_firstname  linked-form__cf" value="Александр" name="contact[FN]" placeholder="Имя" style="width: 0px;">' +
                                '<tester style="position: absolute; top: -9999px; left: -9999px; width: auto; font-size: 16px; font-family: &quot;PT Sans&quot;, Arial, sans-serif; font-weight: 700; font-style: normal; letter-spacing: 0px; text-transform: none; white-space: pre;">Александр</tester>' +
                                '<input type="text" class="text-input control-fullname__separated  control-fullname__separated_lastname control-fullname__separated_nomargin linked-form__cf" value="Аншаков" name="contact[LN]" placeholder="Фамилия" style="width: 0px;">' +
                                '<tester style="position: absolute; top: -9999px; left: -9999px; width: auto; font-size: 16px; font-family: &quot;PT Sans&quot;, Arial, sans-serif; font-weight: 700; font-style: normal; letter-spacing: 0px; text-transform: none; white-space: pre;">Аншаков</tester>' +
                            '</div>' +
                        '</div>' +
                    '</a>' +
                    '<span class="linked-form__field__more  js-tip-holder">' +
                        '<svg class="svg-icon svg-controls--button-more-dims">' +
                            '<defs>' +
                                '<style>' +
                                    '.aidcls-1 {' +
                                        'fill-rule: evenodd' +
                                    '}' +
                                '</style>' +
                            '</defs>' +
                            '<path id="aidmore" class="aidcls-1" d="M2134 268.5a1.5 1.5 0 11-1.5 1.5 1.5 1.5 0 011.5-1.5zm5 0a1.5 1.5 0 11-1.5 1.5 1.5 1.5 0 011.5-1.5zm5 0a1.5 1.5 0 11-1.5 1.5 1.5 1.5 0 011.5-1.5z" transform="translate(-2132.5 -268.5)"></path>' +
                        '</svg>' +
                        '<div class="tips js-tip linked-form__field__more__tip " id="">' +
                            '<div class="tips__inner custom-scroll js-tip-items">' +
                                '<div class="tips-item js-tips-item js-linked-entity-show " data-id="" data-forced="" data-value="" data-suggestion-type="">' +
                                    '<span class="tips-icon-container">' +
                                        '<span class="tips-icon tips-svg-icon">' +
                                            '<svg class="svg-icon svg-dashboard--open-pipeline-dims">' +
                                                '<use xlink:href="#dashboard--open-pipeline"></use>' +
                                            '</svg>' +
                                        '</span>' +
                                    '</span>' +
                                    '<a href="/contacts/detail/22874819" class="js-navigate-link"> Перейти в карточку </a>' +
                                '</div>' +
                                '<div class="tips-item js-tips-item js-linked-entity-name-copy " data-copied="Скопировано!" data-clipboard-text="Александр Аншаков" data-id="" data-forced="" data-value="" data-suggestion-type="">' +
                                    '<span class="tips-icon-container">' +
                                        '<span class="tips-icon tips-svg-icon">' +
                                            '<svg class="svg-icon svg-common--copy-dims">' +
                                                '<use xlink:href="#common--copy"></use>' +
                                            '</svg>' +
                                        '</span>' +
                                    '</span>' +
                                    '<span class="js-linked-entity-name-copy-inner">Скопировать имя</span>' +
                                '</div>' +
                                '<div class="tips-item js-tips-item js-linked-entity-unlink " data-id="" data-forced="" data-value="" data-suggestion-type="">' +
                                    '<span class="tips-icon-container">' +
                                        '<span class="tips-icon icon icon-inline icon-unlink"></span>' +
                                    '</span> Открепить' +
                                '</div>' +
                                '<div class="tips-item js-tips-item js-linked-entity-set_main hidden " data-id="" data-forced="" data-value="" data-suggestion-type="">' +
                                    '<span class="tips-icon-container">' +
                                        '<span class="tips-icon icon icon-inline icon-star-dark-grey"></span>' +
                                    '</span> Сделать основным' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</span>' +
                '</div>' +
            '</div>' +
        '</div>' +
        '<div class="linked-form__fields">' +
            '<div class="linked-form__field linked-form__field-company">' +
                '<div class="linked-form__field__label " title="Компания"> Компания </div>' +
                '<!--' +
      '-->' +
                '<div class="linked-form__field__value linked-form__field__value-company">' +
                    '<div class="js-linked-with-actions js-linked-has-actions " data-check="company">' +
                        '<input type="hidden" name="company[ID]" value="">' +
                        '<div class="control-wrapper control--suggest " spellcheck="false">' +
                            '<ul class="control--suggest--list js-control--suggest--list custom-scroll "></ul>' +
                            '<input data-enable-filter="y" autocomplete="off" name="company[NAME]" class="text-input control--suggest--input js-control--suggest--input-ajax linked-form__cf js-linked-contact-company" type="text" placeholder="..." value="" data-value-id="" data-type="" data-url="/private/ajax/search.php" data-params="query_type=name&amp;type=companies&amp;q=#q#" data-headers="" spellcheck="false">' +
                        '</div>' +
                        '<div class="js-tip-holder">' +
                            '<div class="tips js-tip card-cf-actions-tip " id="">' +
                                '<div class="tips__inner custom-scroll js-tip-items">' +
                                    '<div class="tips-item js-tips-item js-cf-actions-item " data-type="company" data-id="" data-forced="" data-value="" data-suggestion-type="">' +
                                        '<span class="tips-icon-container">' +
                                            '<span class="tips-icon icon icon-inline icon-in-new-window"></span>' +
                                        '</span>' +
                                        '<a href="/companies/detail/" class=""> Перейти в карточку </a>' +
                                    '</div>' +
                                    '<div class="tips-item js-tips-item js-cf-actions-item " data-type="edit" data-id="" data-forced="" data-value="" data-suggestion-type="">' +
                                        '<span class="tips-icon-container">' +
                                            '<span class="tips-icon icon icon-inline icon-pencil"></span>' +
                                        '</span> Редактировать' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="linked-form__multiple-container">' +
                '<div class="linked-form__field linked-form__field-pei">' +
                    '<div class="linked-form__field__label linked-form__field__label-multiple">' +
                        '<div class="control--select linked-form__select ">' +
                            '<ul class="custom-scroll control--select--list  ">' +
                                '<li data-value="386749" data-color="" class="control--select--list--item control--select--list--item-selected   " style="">' +
                                    '<span class="control--select--list--item-inner" title="Раб. тел."> Раб. тел. </span>' +
                                '</li>' +
                                '<li data-value="386751" data-color="" class="control--select--list--item    " style="">' +
                                    '<span class="control--select--list--item-inner" title="Раб.прямой"> Раб.прямой </span>' +
                                '</li>' +
                                '<li data-value="386753" data-color="" class="control--select--list--item    " style="">' +
                                    '<span class="control--select--list--item-inner" title="Мобильный"> Мобильный </span>' +
                                '</li>' +
                                '<li data-value="386755" data-color="" class="control--select--list--item    " style="">' +
                                    '<span class="control--select--list--item-inner" title="Факс"> Факс </span>' +
                                '</li>' +
                                '<li data-value="386757" data-color="" class="control--select--list--item    " style="">' +
                                    '<span class="control--select--list--item-inner" title="Домашний"> Домашний </span>' +
                                '</li>' +
                                '<li data-value="386759" data-color="" class="control--select--list--item    " style="">' +
                                    '<span class="control--select--list--item-inner" title="Другой"> Другой </span>' +
                                '</li>' +
                            '</ul>' +
                            '<button class="control--select--button    " tabindex="" type="button" data-value="386749">' +
                                '<span class="control--select--button-inner"> Раб. тел. </span>' +
                            '</button>' +
                            '<input type="hidden" class="control--select--input " name="CFV[801693][iJRCgghrsJ][DESCRIPTION]" value="386749" data-prev-value="386749">' +
                        '</div>' +
                    '</div>' +
                    '<div class="linked-form__field__value">' +
                        '<div class="js-linked-with-actions js-linked-has-actions js-linked-has-value" data-pei-code="phone">' +
                            '<div class="js-control-phone control-phone">' +
                                '<input name="" class="control-phone__formatted js-form-changes-skip linked-form__cf js-linked-pei text-input" type="text" value="74951234575" placeholder="..." autocomplete="off">' +
                                '<div class="control-wrapper control--suggest control-phone__suggest">' +
                                    '<ul class="control--suggest--list js-control--suggest--list custom-scroll "></ul>' +
                                    '<input data-enable-filter="y" autocomplete="off" name="CFV[801693][iJRCgghrsJ][VALUE]" class="text-input control--suggest--input js-control--suggest--input control--suggest--input-inline linked-form__cf js-linked-pei" type="hidden" placeholder="..." value="74951234575" data-value-id="" data-type="phone">' +
                                '</div>' +
                            '</div>' +
                            '<div class="js-tip-holder">' +
                                '<div class="tips js-tip card-cf-actions-tip " id="">' +
                                    '<div class="tips__inner custom-scroll js-tip-items">' +
                                        '<div class="tips-item js-tips-item js-cf-actions-item " data-type="phone" data-id="" data-forced="" data-value="" data-suggestion-type="">' +
                                            '<span class="tips-icon-container">' +
                                                '<span class="tips-icon icon icon-inline icon-phone-dark"></span>' +
                                            '</span> Позвонить' +
                                        '</div>' +
                                        '<div class="tips-item js-tips-item js-cf-actions-item " data-type="copy" data-id="" data-forced="" data-value="" data-suggestion-type="">' +
                                            '<span class="tips-icon-container">' +
                                                '<span class="tips-icon tips-svg-icon">' +
                                                    '<svg class="svg-icon svg-common--copy-dims">' +
                                                        '<use xlink:href="#common--copy"></use>' +
                                                    '</svg>' +
                                                '</span>' +
                                            '</span> Копировать' +
                                        '</div>' +
                                        '<div class="tips-item js-tips-item js-cf-actions-item " data-type="edit" data-id="" data-forced="" data-value="" data-suggestion-type="">' +
                                            '<span class="tips-icon-container">' +
                                                '<span class="tips-icon icon icon-inline icon-pencil"></span>' +
                                            '</span> Редактировать' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="linked-form__field-add-multiple" style="display: block">' +
                    '<div class="linked-form__field__value"></div>' +
                '</div>' +
            '</div>' +
            '<div class="linked-form__field-no-value">' +
                '<div class="linked-form__multiple-container">' +
                    '<div class="linked-form__field linked-form__field-pei">' +
                        '<div class="linked-form__field__label linked-form__field__label-multiple">' +
                            '<div class="control--select linked-form__select ">' +
                                '<ul class="custom-scroll control--select--list  ">' +
                                    '<li data-value="386761" data-color="" class="control--select--list--item control--select--list--item-selected   " style="">' +
                                        '<span class="control--select--list--item-inner" title="Email раб."> Email раб. </span>' +
                                    '</li>' +
                                    '<li data-value="386763" data-color="" class="control--select--list--item    " style="">' +
                                        '<span class="control--select--list--item-inner" title="Email личн."> Email личн. </span>' +
                                    '</li>' +
                                    '<li data-value="386765" data-color="" class="control--select--list--item    " style="">' +
                                        '<span class="control--select--list--item-inner" title="Email др."> Email др. </span>' +
                                    '</li>' +
                                '</ul>' +
                                '<button class="control--select--button    " tabindex="" type="button" data-value="386761">' +
                                    '<span class="control--select--button-inner"> Email раб. </span>' +
                                '</button>' +
                                '<input type="hidden" class="control--select--input " name="CFV[801695][tZGpAutduf][DESCRIPTION]" value="386761" data-prev-value="386761">' +
                            '</div>' +
                        '</div>' +
                        '<div class="linked-form__field__value">' +
                            '<div class="js-linked-with-actions js-linked-has-actions " data-pei-code="email">' +
                                '<div class="control-wrapper control--suggest ">' +
                                    '<ul class="control--suggest--list js-control--suggest--list custom-scroll "></ul>' +
                                    '<input data-enable-filter="y" autocomplete="off" name="CFV[801695][tZGpAutduf][VALUE]" class="text-input control--suggest--input js-control--suggest--input control--suggest--input-inline linked-form__cf js-linked-pei" type="text" placeholder="..." value="" data-value-id="" data-type="email">' +
                                '</div>' +
                                '<div class="js-tip-holder">' +
                                    '<div class="tips js-tip card-cf-actions-tip " id="">' +
                                        '<div class="tips__inner custom-scroll js-tip-items">' +
                                            '<div class="tips-item js-tips-item js-cf-actions-item " data-type="email" data-id="" data-forced="" data-value="" data-suggestion-type="">' +
                                                '<span class="tips-icon-container">' +
                                                    '<span class="tips-icon icon icon-inline icon-mail-dark"></span>' +
                                                '</span> Написать' +
                                            '</div>' +
                                            '<div class="tips-item js-tips-item js-cf-actions-item " data-type="email_with_template" data-id="" data-forced="" data-value="" data-suggestion-type="">' +
                                                '<span class="tips-icon-container">' +
                                                    '<span class="tips-icon icon icon-inline icon-mail-dark"></span>' +
                                                '</span> Написать из amoCRM' +
                                            '</div>' +
                                            '<div class="tips-item js-tips-item js-cf-actions-item " data-type="copy" data-id="" data-forced="" data-value="" data-suggestion-type="">' +
                                                '<span class="tips-icon-container">' +
                                                    '<span class="tips-icon tips-svg-icon">' +
                                                        '<svg class="svg-icon svg-common--copy-dims">' +
                                                            '<use xlink:href="#common--copy"></use>' +
                                                        '</svg>' +
                                                    '</span>' +
                                                '</span> Копировать' +
                                            '</div>' +
                                            '<div class="tips-item js-tips-item js-cf-actions-item " data-type="edit" data-id="" data-forced="" data-value="" data-suggestion-type="">' +
                                                '<span class="tips-icon-container">' +
                                                    '<span class="tips-icon icon icon-inline icon-pencil"></span>' +
                                                '</span> Редактировать' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="linked-form__field-add-multiple">' +
                        '<div class="linked-form__field__value"></div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="linked-form__field-no-value">' +
                '<div class="linked-form__field linked-form__field-text    hide " data-id="1059441">' +
                    '<div class="linked-form__field__label linked-form__field__label_disabled" title="Source">' +
                        '<span>Source</span>' +
                    '</div>' +
                    '<div class="linked-form__field__value linked-form__field__value_disabled linked-form__field__value_api">' +
                        '<input name="CFV[1059441]" class="linked-form__cf text-input" type="text" value="" placeholder="..." disabled="disabled" readonly="readonly" spellcheck="false" autocomplete="off">' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="linked-form__field-no-value">' +
                '<div class="linked-form__field linked-form__field-url    hide " data-id="1059443">' +
                    '<div class="linked-form__field__label linked-form__field__label_disabled" title="Source url">' +
                        '<span>Source url</span>' +
                    '</div>' +
                    '<div class="linked-form__field__value linked-form__field__value_disabled linked-form__field__value_api">' +
                        '<div class="js-linked-with-actions js-linked-has-actions ">' +
                            '<input name="CFV[1059443]" class="linked-form__cf text-input" type="url" value="" placeholder="..." disabled="disabled" readonly="readonly" spellcheck="false" autocomplete="off">' +
                            '<div class="js-tip-holder">' +
                                '<div class="tips js-tip card-cf-actions-tip " id="">' +
                                    '<div class="tips__inner custom-scroll js-tip-items">' +
                                        '<div class="tips-item js-tips-item js-cf-actions-item " data-type="link" data-id="" data-forced="" data-value="" data-suggestion-type="">' +
                                            '<span class="tips-icon-container">' +
                                                '<span class="tips-icon tips-svg-icon">' +
                                                    '<svg class="svg-icon svg-common--in-new-window-dims">' +
                                                        '<use xlink:href="#common--in-new-window"></use>' +
                                                    '</svg>' +
                                                '</span>' +
                                            '</span> Перейти' +
                                        '</div>' +
                                        '<div class="tips-item js-tips-item js-cf-actions-item " data-type="copy" data-id="" data-forced="" data-value="" data-suggestion-type="">' +
                                            '<span class="tips-icon-container">' +
                                                '<span class="tips-icon tips-svg-icon">' +
                                                    '<svg class="svg-icon svg-common--copy-dims">' +
                                                        '<use xlink:href="#common--copy"></use>' +
                                                    '</svg>' +
                                                '</span>' +
                                            '</span> Копировать' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="linked-form__field-no-value">' +
                '<div class="linked-form__field linked-form__field-numeric    hide " data-id="1060281">' +
                    '<div class="linked-form__field__label linked-form__field__label_disabled" title="visitor_id">' +
                        '<span>visitor_id</span>' +
                    '</div>' +
                    '<div class="linked-form__field__value linked-form__field__value_disabled linked-form__field__value_api">' +
                        '<input name="CFV[1060281]" class="linked-form__cf js-control-allow-numeric-negative text-input control-price_autosized" type="numeric" value="" placeholder="..." disabled="disabled" readonly="readonly" data-allow-zero="y" autocomplete="off">' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="linked-form__field-no-value">' +
                '<div class="linked-form__field linked-form__field-select    hide " data-id="1059439">' +
                    '<div class="linked-form__field__label linked-form__field__label_disabled" title="Source type">' +
                        '<span>Source type</span>' +
                    '</div>' +
                    '<div class="linked-form__field__value linked-form__field__value_disabled linked-form__field__value_api">' +
                        '<div class="control--select linked-form__select ">' +
                            '<ul class="custom-scroll control--select--list  ">' +
                                '<li data-value="" data-color="" class="control--select--list--item control--select--list--item-selected   " style="">' +
                                    '<span class="control--select--list--item-inner" title="..."> ... </span>' +
                                '</li>' +
                                '<li data-value="673875" data-color="" class="control--select--list--item    " style="">' +
                                    '<span class="control--select--list--item-inner" title="UTM_campaign"> UTM_campaign </span>' +
                                '</li>' +
                                '<li data-value="673877" data-color="" class="control--select--list--item    " style="">' +
                                    '<span class="control--select--list--item-inner" title="UTM_medium"> UTM_medium </span>' +
                                '</li>' +
                                '<li data-value="673879" data-color="" class="control--select--list--item    " style="">' +
                                    '<span class="control--select--list--item-inner" title="UTM_source"> UTM_source </span>' +
                                '</li>' +
                                '<li data-value="673881" data-color="" class="control--select--list--item    " style="">' +
                                    '<span class="control--select--list--item-inner" title="organic_all"> organic_all </span>' +
                                '</li>' +
                                '<li data-value="673883" data-color="" class="control--select--list--item    " style="">' +
                                    '<span class="control--select--list--item-inner" title="organic_google"> organic_google </span>' +
                                '</li>' +
                                '<li data-value="673885" data-color="" class="control--select--list--item    " style="">' +
                                    '<span class="control--select--list--item-inner" title="organic_yandex"> organic_yandex </span>' +
                                '</li>' +
                                '<li data-value="673887" data-color="" class="control--select--list--item    " style="">' +
                                    '<span class="control--select--list--item-inner" title="direct"> direct </span>' +
                                '</li>' +
                                '<li data-value="673889" data-color="" class="control--select--list--item    " style="">' +
                                    '<span class="control--select--list--item-inner" title="referer"> referer </span>' +
                                '</li>' +
                                '<li data-value="673891" data-color="" class="control--select--list--item    " style="">' +
                                    '<span class="control--select--list--item-inner" title="offline"> offline </span>' +
                                '</li>' +
                                '<li data-value="673893" data-color="" class="control--select--list--item    " style="">' +
                                    '<span class="control--select--list--item-inner" title="geo"> geo </span>' +
                                '</li>' +
                                '<li data-value="673895" data-color="" class="control--select--list--item    " style="">' +
                                    '<span class="control--select--list--item-inner" title="default_source"> default_source </span>' +
                                '</li>' +
                                '<li data-value="673897" data-color="" class="control--select--list--item    " style="">' +
                                    '<span class="control--select--list--item-inner" title="UTM_content"> UTM_content </span>' +
                                '</li>' +
                            '</ul>' +
                            '<button class="control--select--button    " tabindex="" type="button" data-value="" disabled="Y">' +
                                '<span class="control--select--button-inner"> ... </span>' +
                            '</button>' +
                            '<input type="hidden" class="control--select--input " name="CFV[1059439]" value="" data-prev-value="">' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="linked-form__field-no-value">' +
                '<div class="linked-form__field linked-form__field-text   " data-id="801691">' +
                    '<div class="linked-form__field__label" title="Должность">' +
                        '<span>Должность</span>' +
                    '</div>' +
                    '<div class="linked-form__field__value ">' +
                        '<input name="CFV[801691]" class="linked-form__cf text-input" type="text" value="" placeholder="..." spellcheck="false" autocomplete="off">' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="linked-form__field linked-form__field-shower">' +
                '<div class="linked-form__field__value">' +
                    '<input type="text" class="js-linked-fields-shower-input" style="opacity: 0; height: 0; width: 0;">' +
                    '<span class="linked-form__field-shower-text js-linked-show-all-fields">еще</span>' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</form>' +
'</li>' +

'</div>'


    );
});
