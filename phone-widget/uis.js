tests.addTest(function (
    ajax, testersFactory, wait, spendTime, utils, windowOpener, webSockets, webSocketLogger, userMedia,
    rtcConnectionsMock, navigatorMock, timeoutLogger, registerFiles, setup, Sip, files, PhoneActionModel,
    modalWindow
) {
    webSocketLogger.disable();
    timeoutLogger.disable();

    describe('Авторизуюсь в UIS. Регистируюсь на SIP-сервере.', function() {
        var sip,
            clickPhoneIcon,
            notifications,
            widgetActions,
            i18n,
            widget,
            userData,
            errorNotifications;

        function Stream (id) {
            var element = document.querySelector('#' + id);

            this.expectNotToHaveSource = function () {
                if (element.srcObject) {
                    throw new Error('Источник потока не должен быть опеределен.');
                }
            };
            this.expectToHaveSource = function () {
                if (!element.srcObject) {
                    throw new Error('Источник потока должен быть опеределен.');
                }
            };
        }

        var localStream = function () {
            return new Stream('cmg-local-video');
        };

        var remoteStream = function () {
            return new Stream('cmg-local-video');
        };

        var onlineSwitcher = testersFactory.createDomElementTester(function () {
            return document.querySelector('#cmg__online_wrapper .online_switcher');
        });

        var hangUpButton = testersFactory.createDomElementTester(function () {
            return document.querySelector('#cmg__incall_wrapper .js-hungup_call');
        });

        var closeButton = testersFactory.createDomElementTester(function () {
            return document.querySelector('#cmg__incoming_call_wrapper .js-incoming-close');
        });

        var declineButton = testersFactory.createDomElementTester(function () {
            return document.querySelector('#cmg__incoming_call_wrapper .js-incoming-hangup');
        });

        var openContactButton = testersFactory.createDomElementTester(function () {
            return document.querySelector('#cmg__incoming_call_wrapper .js-incoming-answer-with-card');
        });

        var answerButton = testersFactory.createDomElementTester(function () {
            return document.querySelector('#cmg__incoming_call_wrapper .js-incoming-answer');
        });
        
        var tryButton = testersFactory.createDomElementTester(function () {
            return utils.findElementByTextContent(document.querySelector('#cmg_choose_the_pill_buttons'),
                'Хочу попробовать UIS', '.button-input');
        });

        var usingUisButton = testersFactory.createDomElementTester(function () {
            return utils.findElementByTextContent(document.querySelector('#cmg_choose_the_pill_buttons'),
                'Уже использую UIS', '.button-input');
        });

        var tryInstructionsHeader = testersFactory.createDomElementTester(function () {
            return utils.findElementByTextContent(document.querySelector('.modal-body'),
                'Да, я хочу стать клиентом UIS', '.widget_header__description_h');
        });

        var usingUisInstructionsHeader = testersFactory.createDomElementTester(function () {
            return utils.findElementByTextContent(document.querySelector('.modal-body'),
                'Я уже являюсь клиентом UIS и хочу подключить интеграцию с amoCRM', '.widget_header__description_h');
        });

        var settingsErrorMessage = testersFactory.createDomElementTester(function () {
            return document.querySelector('.modal-body .cmg-error-text');
        });

        var settingsInformationBlock = testersFactory.createDomElementTester(function () {
            return document.querySelector('#cmg-settings-info');
        });

        var abonentInformationBlock = testersFactory.createDomElementTester(function () {
            return document.querySelector('#cmg__incoming_call_wrapper .cmg-call-notify-wrapper');
        });

        var outgoingCallContactInformation = testersFactory.createDomElementTester(function () {
            return document.querySelector('#cmg__incall_wrapper .cmg_call__status__contact');
        });

        var outgoingCallWidget = testersFactory.createDomElementTester(function () {
            return document.querySelector('#cmg__incall_wrapper');
        });

        var incomingCallWidget = testersFactory.createDomElementTester(function () {
            return document.querySelector('#cmg__incoming_call_wrapper');
        });

        var talkTimeBlock = testersFactory.createDomElementTester(function () {
            return document.querySelector('#cmg__incall_wrapper .cmg_call__status__talk__time');
        });

        var talkWidget = testersFactory.createDomElementTester(function () {
            return document.querySelector('#cmg__incall_wrapper');
        });

        var agreementCheckbox = testersFactory.createDomElementTester(function () {
            return document.querySelector('#cmg_cb_agreement');
        });

        var nameField = testersFactory.createTextFieldTester(function () {
            return document.querySelector('input[name=name]');
        });

        var installButton = testersFactory.createDomElementTester(function () {
            return document.querySelector('#uis_widget.js-widget-install');
        });

        var dialpadButton = testersFactory.createDomElementTester(function () {
            return document.querySelector('#cmg__online_wrapper #cmg__dial_btn');
        });

        var numberButton = function (number) {
            return testersFactory.createDomElementTester(utils.findElementByTextContent(
                document.querySelector('.cmg_call__dial_keyboard'),
                number,
                '.cmg_call__dial_keyboard__item_number'
            ));
        };

        var dialButton = testersFactory.createDomElementTester(function () {
            return document.querySelector('#cmg__online_wrapper #cmg__call_btn');
        });

        var settingsFormSubmitButton = testersFactory.createDomElementTester(function () {
            return document.querySelector('#widget_settings__fields_wrapper .cmg-uis-settings-button');
        });

        var tryForFreeButton = testersFactory.createDomElementTester(function () {
            return utils.findElementByTextContent(document.querySelector('.modal-body'), 'Протестировать бесплатно',
                '.cmg-uis-settings-button');
        });

        var views = function () {
            var views = document.querySelectorAll('.cmg_wrapper');

            function isVisible () {
                return Array.prototype.some.call(views, function (view) {
                    return utils.isVisible(view);
                });
            }

            return {
                expectAllViewsToBeHidden: function () {
                    if (isVisible()) {
                        throw new Error('Виджет должен быть скрытым.');
                    }
                },
                expectSomeViewsToBeVisible: function () {
                    if (!isVisible()) {
                        throw new Error('Виджет должен быть видимым.');
                    }
                }
            };
        };

        function getModalWindow (text) {
            return testersFactory.createDomElementTester(function () {
                return utils.descendantOfBody().matchesSelector('.cmg-uis-modal-window').
                    textContains(text).find();
            });
        }

        var dontCloseTabMessage = getModalWindow('Не закрывайте текущую вкладку с виджетом'),
            userIsArchiveMessage = getModalWindow('Пользователь с e-mail darya.simha@gmail.com уже существует и ' +
                'находится в статусе "Заблокирован".');

        var phoneField = testersFactory.createTextFieldTester(function () {
            return document.querySelector('.cmg-uis-modal-window input');
        });

        function modalWindowButton (text) {
            return testersFactory.createDomElementTester(function () {
                return utils.findElementByTextContent(document.body, text, '.modal-body .cmg-uis-settings-button');
            });
        }

        var settingsWindowOverlay = testersFactory.createDomElementTester(function () {
            return document.querySelector('.widget-settings__modal .modal-overlay');
        });

        beforeEach(function() {
            document.body.innerHTML = '';
            
            registerFiles(files);
        });

        it(
            'Вкладка не является мастером. В мастер-вкладке закрывается сокет crm_websocket. Ошибке не происходит.',
        function() {
            localStorage.setItem('uis_amo_tab_v2_qwe123', 'true:' + ((new Date()).getTime() - 50));

            var result = setup(ajax, function (Widget, Twig, Util, Notification, Comagic) {
                Comagic.userAgentConf.navigator = navigatorMock;
            });

            clickPhoneIcon = result.clickPhoneIcon;
            notifications = result.notifications;
            widgetActions = result.widgetActions;
            i18n = result.i18n;
            widget = result.widget;
            userData = result.userData;
            errorNotifications = result.errorNotifications;

            ajax.recentRequest().
                expectToHavePath('/private/widget/proxy.php').
                expectToHaveMethod('POST').
                expectBodyToContain({
                    target: ['https://va.uiscom.ru:443/widget_api/be2243dddacb680da2702552fd6269ee/']
                }).
                testBodyParam('data', function (data) {
                    utils.expectObjectToContain(JSON.parse(data[0]), {
                        method: 'external_auth',
                        params: {
                            app: 'comagic',
                            service: 'amo',
                            subdomain: 'comagicwidgets',
                            domain: 'comagicwidgets.amocrm.ru',
                            email: 'darya.simha@gmail.com',
                            hash: '442bd71353615168b7907d2a63b72f9e0def8d40',
                            phone: '79252117620',
                            name: 'Darya Simha',
                            user_id: 2851135,
                            widget_type: 'uis',
                            widget_version: '1.7.0'
                        }
                    });
                }).
                respondSuccessfullyWith({
                    result: {
                        account_id: '21829480',
                        comagic_key: '19451194',
                        display_name: 'Dar`ya Rahvalova (amoCRM)',
                        max_version: null,
                        min_version: '1.1.0',
                        no_telephony: false,
                        registrar_server: 'vo19.uiscom.ru',
                        sip_login: '082481',
                        sip_password: '_3A5H_dc_C'
                    }
                });

            spendTime(1000);

            localStorage.setItemInAnotherTab('uis_amo_is_state_change', JSON.stringify({
                action: 'change:connected',
                value: false
            }));

            errorNotifications.expectToHaveNoError();
        });
        describe('Вкладка является мастером.', function() {
            beforeEach(function() {
                var result = setup(ajax, function (Widget, Twig, Util, Notification, Comagic) {
                    Comagic.userAgentConf.navigator = navigatorMock;
                });

                clickPhoneIcon = result.clickPhoneIcon;
                notifications = result.notifications;
                widgetActions = result.widgetActions;
                i18n = result.i18n;
                widget = result.widget;
                userData = result.userData;
                errorNotifications = result.errorNotifications;

                ajax.recentRequest().
                    expectToHavePath('/private/widget/proxy.php').
                    expectToHaveMethod('POST').
                    expectBodyToContain({
                        target: ['https://va.uiscom.ru:443/widget_api/be2243dddacb680da2702552fd6269ee/']
                    }).
                    testBodyParam('data', function (data) {
                        utils.expectObjectToContain(JSON.parse(data[0]), {
                            method: 'external_auth',
                            params: {
                                app: 'comagic',
                                service: 'amo',
                                subdomain: 'comagicwidgets',
                                domain: 'comagicwidgets.amocrm.ru',
                                email: 'darya.simha@gmail.com',
                                hash: '442bd71353615168b7907d2a63b72f9e0def8d40',
                                phone: '79252117620',
                                name: 'Darya Simha',
                                user_id: 2851135,
                                widget_type: 'uis',
                                widget_version: '1.7.0'
                            }
                        });
                    }).
                    respondSuccessfullyWith({
                        result: {
                            account_id: '21829480',
                            comagic_key: '19451194',
                            display_name: 'Dar`ya Rahvalova (amoCRM)',
                            max_version: null,
                            min_version: '1.1.0',
                            no_telephony: false,
                            registrar_server: 'vo19.uiscom.ru',
                            sip_login: '082481',
                            sip_password: '_3A5H_dc_C'
                        }
                    });

                webSockets.getSocket(
                    'wss://va.uiscom.ru:443/crm_websocket'
                ).connect().expectSentMessageToContain({
                    service: 'amo_crm_ws',
                    event: 'start_session',
                    context: {
                        account_id: 21829480,
                        comagic_key: '19451194',
                        reg_id: 2851135
                    }
                }).receiveMessage({
                    event: 'start_session',
                    data: {
                        status: 'success',
                        employee_last_status: 'available',
                        employee_status_list: [{
                            id: 'available',
                            name: 'Доступен'
                        }, {
                            id: 'break',
                            name: 'Перерыв'
                        }, {
                            id: 'do_not_disturb',
                            name: 'Не беспокоить'
                        }, {
                            id: 'not_at_workplace',
                            name: 'Нет на месте'
                        }, {
                            id: 'not_at_work',
                            name: 'Нет на работе'
                        }, {
                            id: 'unknown',
                            name: 'Неизвестно'
                        }]
                    }
                });

                sip = new Sip(webSockets.getSocket('wss://kama.uiscom.ru:443').connect());

                sip.recentRequest().
                    expectToHaveMethod('REGISTER').
                    expectToHaveServerName('sip:vo19.uiscom.ru').
                    expectHeaderToContain('From', '"Dar`ya Rahvalova (amoCRM)" <sip:082481@vo19.uiscom.ru>').
                    expectHeaderToContain('To', '<sip:082481@vo19.uiscom.ru>').
                    expectHeaderToContain('Expires', '600').
                    response().
                    setUnauthorized().
                    addHeader('WWW-Authenticate: Digest realm="{server_name}", nonce="{to_tag}"').
                    send();

                spendTime(50);

                ajax.recentRequest().
                    expectToHavePath('/amocrm_deploy/templates/Online.twig').
                    expectToHaveMethod('GET').
                    respondSuccessfullyWith(files['http://127.0.0.1/amocrm_deploy/templates/Online.twig']);

                ajax.recentRequest().
                    expectToHavePath('/amocrm_deploy/templates/EmployeeStatus.twig').
                    expectToHaveMethod('GET').
                    respondSuccessfullyWith(files['http://127.0.0.1/amocrm_deploy/templates/EmployeeStatus.twig']);

                sip.recentRequest().
                    expectToHaveMethod('REGISTER').
                    expectToHaveHeader('Authorization').
                    response().
                    copyHeader('Contact').
                    send();

                spendTime(10);
            });
            afterEach(function() {
                errorNotifications.expectToHaveNoError();
            });
            
            describe('Открываю окно настройки.', function() {
                var saved;

                beforeEach(function() {
                    userMedia.disallowMediaInput();
                    modalWindow(i18n).show();
                    spendTime(1000);

                    widget.callbacks.settings($('.widget-settings__modal .modal-body'));

                    ajax.recentRequest().
                        expectToHavePath('/amocrm_deploy/templates/Settings.twig').
                        expectToHaveMethod('GET').
                        respondSuccessfullyWith(files['http://127.0.0.1/amocrm_deploy/templates/Settings.twig']);
                    
                    spendTime(1000);

                    saved = false;

                    document.querySelector('#uis_widget.js-widget-install').addEventListener('click',
                        function () {
                            var value = Promise.resolve(widget.callbacks.onSave({
                                fields: {
                                    phone: '74951234567',
                                    name: 'Darya+Rahvalova',
                                    active: 'N'
                                }
                            })).then(function (value) {
                                if (value !== true && value !== false) {
                                    throw new Error(
                                        'Успешность сохранения должна быть выражена булевским значением.'
                                    );
                                }

                                saved = saved || value;
                            });
                        });
                });

                it('Окно не заблокировано.', function() {
                    settingsWindowOverlay.expectToBeHidden();
                });
                describe(
                    'Нажимаю на кнопку "Протестировать бесплатно".',
                function() {
                    beforeEach(function() {
                        tryForFreeButton.click();
                        spendTime(1000);
                    });

                    it('Окно заблокировано.', function() {
                        ajax.expectSomeRequestsToBeSent();
                        settingsWindowOverlay.expectToBeVisible();
                    });
                    describe('Тестовый пользователь успешно создан.', function() {
                        beforeEach(function() {
                            ajax.recentRequest().
                                expectToHavePath('/private/widget/proxy.php').
                                expectToHaveMethod('POST').
                                expectBodyToContain({
                                    target: ['https://app.uiscom.ru/easystart/amocrm/create_account/']
                                }).
                                testBodyParam('data', function (data) {
                                    utils.expectObjectToContain(JSON.parse(data[0]), {
                                        account_id: 939285,
                                        user_id: 2851135,
                                        email: 'darya.simha@gmail.com',
                                        name: 'Darya Simha',
                                        phone: '79252117620',
                                        hash: '442bd71353615168b7907d2a63b72f9e0def8d40',
                                        domain: 'comagicwidgets.amocrm.ru',
                                        widget_type: 'uis'
                                    });
                                }).
                                respondSuccessfullyWith({
                                    success: true,
                                    result: true
                                });

                            spendTime(1000);
                        });

                        it('Окно заблокировано.', function() {
                            ajax.expectSomeRequestsToBeSent();
                            settingsWindowOverlay.expectToBeVisible();
                        });
                        it(
                            'Запрос проверки регистрации завершился ошибкой. Нажимаю на кнопку "Закрыть" в окне ' +
                            'сообщения об ошибке. Окно настроек не заблокировано.',
                        function() {
                            ajax.recentRequest().
                                expectToHavePath('/private/widget/proxy.php').
                                expectToHaveMethod('POST').
                                expectBodyToContain({
                                    target: [
                                        'https://va.uiscom.ru:443/widget_api/be2243dddacb680da2702552fd6269ee/'
                                    ]
                                }).
                                testBodyParam('data', function (data) {
                                    utils.expectObjectToContain(JSON.parse(data[0]), {
                                        method: 'external_check_registration',
                                        params: {
                                            app: 'comagic',
                                            service: 'amo',
                                            subdomain: 'comagicwidgets',
                                            domain: 'comagicwidgets.amocrm.ru',
                                            email: 'darya.simha@gmail.com',
                                            hash: '442bd71353615168b7907d2a63b72f9e0def8d40',
                                            phone: '79252117620',
                                            name: 'Darya Simha',
                                            user_id: 2851135,
                                            widget_type: 'uis',
                                            widget_version: '1.7.0'
                                        }
                                    });
                                }).
                                respondUnsuccessfullyWith({
                                    success: false,
                                    error: 'Some error'
                                });

                            ajax.recentRequest().
                                expectToHavePath('/amocrm_deploy/templates/ModalWindow.twig').
                                expectToHaveMethod('GET').
                                respondSuccessfullyWith(files[
                                    'http://127.0.0.1/amocrm_deploy/templates/ModalWindow.twig'
                                ]);

                            spendTime(1000);

                            modalWindowButton('Закрыть').click();
                            spendTime(1000);

                            settingsWindowOverlay.expectToBeHidden();
                        });
                        describe('Регистрация подтверждена.', function() {
                            beforeEach(function() {
                                ajax.recentRequest().
                                    expectToHavePath('/private/widget/proxy.php').
                                    expectToHaveMethod('POST').
                                    expectBodyToContain({
                                        target: [
                                            'https://va.uiscom.ru:443/widget_api/be2243dddacb680da2702552fd6269ee/'
                                        ]
                                    }).
                                    testBodyParam('data', function (data) {
                                        utils.expectObjectToContain(JSON.parse(data[0]), {
                                            method: 'external_check_registration',
                                            params: {
                                                app: 'comagic',
                                                service: 'amo',
                                                subdomain: 'comagicwidgets',
                                                domain: 'comagicwidgets.amocrm.ru',
                                                email: 'darya.simha@gmail.com',
                                                hash: '442bd71353615168b7907d2a63b72f9e0def8d40',
                                                phone: '79252117620',
                                                name: 'Darya Simha',
                                                user_id: 2851135,
                                                widget_type: 'uis',
                                                widget_version: '1.7.0'
                                            }
                                        });
                                    }).
                                    respondSuccessfullyWith({
                                        success: true,
                                        result: {
                                            registration_message: 'exist application',
                                            registration_email: 'darya.r@gmail.com',
                                            state: 'active',
                                            has_va_component: true,
                                            has_amocrm_component: true,
                                            is_integrated: false
                                        }
                                    });
                            });

                            it('Окно заблокировано.', function() {
                                ajax.expectSomeRequestsToBeSent();
                                settingsWindowOverlay.expectToBeVisible();
                            });
                            it(
                                'Запрос интеграции завершился ошибкой. Нажимаю на кнопку "Закрыть" в окне сообщения ' +
                                'об ошибке. Окно настроек не заблокировано.',
                            function() {
                                ajax.recentRequest().
                                    expectToHavePath('/private/widget/proxy.php').
                                    expectToHaveMethod('POST').
                                    expectBodyToContain({
                                        target: [
                                            'https://va.uiscom.ru:443/widget_api/be2243dddacb680da2702552fd6269ee/'
                                        ]
                                    }).
                                    testBodyParam('data', function (data) {
                                        utils.expectObjectToContain(JSON.parse(data[0]), {
                                            method: 'external_add_or_integrate',
                                            params: {
                                                app: 'comagic',
                                                service: 'amo',
                                                subdomain: 'comagicwidgets',
                                                domain: 'comagicwidgets.amocrm.ru',
                                                email: 'darya.simha@gmail.com',
                                                hash: '442bd71353615168b7907d2a63b72f9e0def8d40',
                                                phone: '74951234567',
                                                name: 'Darya Rahvalova',
                                                user_id: 2851135,
                                                widget_type: 'uis',
                                                widget_version: '1.7.0'
                                            }
                                        });
                                    }).
                                    respondUnsuccessfullyWith({
                                        success: false,
                                        error: 'Some error'
                                    });

                                ajax.recentRequest().
                                    expectToHavePath('/amocrm_deploy/templates/ModalWindow.twig').
                                    expectToHaveMethod('GET').
                                    respondSuccessfullyWith(files[
                                        'http://127.0.0.1/amocrm_deploy/templates/ModalWindow.twig'
                                    ]);

                                spendTime(1000);

                                modalWindowButton('Закрыть').click();
                                spendTime(1000);

                                settingsWindowOverlay.expectToBeHidden();
                            });
                            describe('Интеграция успешно завершена.', function() {
                                beforeEach(function() {
                                    ajax.recentRequest().
                                        expectToHavePath('/private/widget/proxy.php').
                                        expectToHaveMethod('POST').
                                        expectBodyToContain({
                                            target: [
                                                'https://va.uiscom.ru:443/widget_api/be2243dddacb680da2702552fd6269ee/'
                                            ]
                                        }).
                                        testBodyParam('data', function (data) {
                                            utils.expectObjectToContain(JSON.parse(data[0]), {
                                                method: 'external_add_or_integrate',
                                                params: {
                                                    app: 'comagic',
                                                    service: 'amo',
                                                    subdomain: 'comagicwidgets',
                                                    domain: 'comagicwidgets.amocrm.ru',
                                                    email: 'darya.simha@gmail.com',
                                                    hash: '442bd71353615168b7907d2a63b72f9e0def8d40',
                                                    phone: '74951234567',
                                                    name: 'Darya Rahvalova',
                                                    user_id: 2851135,
                                                    widget_type: 'uis',
                                                    widget_version: '1.7.0'
                                                }
                                            });
                                        }).
                                        respondSuccessfullyWith({
                                            success: true,
                                            result: {
                                                status: 'integrated',
                                                data: {}
                                            }
                                        });
                                });

                                it('Окно заблокировано.', function() {
                                    ajax.expectSomeRequestsToBeSent();
                                    settingsWindowOverlay.expectToBeVisible();
                                });
                                describe('Пользователь успешно авторизован.', function() {
                                    beforeEach(function() {
                                        ajax.recentRequest().
                                            expectToHavePath('/private/widget/proxy.php').
                                            expectToHaveMethod('POST').
                                            expectBodyToContain({
                                                target: ['https://va.uiscom.ru:443/widget_api/' +
                                                    'be2243dddacb680da2702552fd6269ee/']
                                            }).
                                            testBodyParam('data', function (data) {
                                                utils.expectObjectToContain(JSON.parse(data[0]), {
                                                    method: 'external_auth',
                                                    params: {
                                                        app: 'comagic',
                                                        service: 'amo',
                                                        subdomain: 'comagicwidgets',
                                                        domain: 'comagicwidgets.amocrm.ru',
                                                        email: 'darya.simha@gmail.com',
                                                        hash: '442bd71353615168b7907d2a63b72f9e0def8d40',
                                                        phone: '74951234567',
                                                        name: 'Darya Rahvalova',
                                                        user_id: 2851135,
                                                        widget_type: 'uis',
                                                        widget_version: '1.7.0'
                                                    }
                                                });
                                            }).
                                            respondSuccessfullyWith({
                                                result: {
                                                    account_id: '21829480',
                                                    comagic_key: '19451194',
                                                    display_name: 'Dar`ya Rahvalova (amoCRM)',
                                                    max_version: null,
                                                    min_version: '1.1.0',
                                                    no_telephony: false,
                                                    registrar_server: 'vo19.uiscom.ru',
                                                    sip_login: '082481',
                                                    sip_password: '_3A5H_dc_C'
                                                }
                                            });

                                        ajax.recentRequest().
                                            expectToHavePath('/amocrm_deploy/templates/ModalWindow.twig').
                                            expectToHaveMethod('GET').
                                            respondSuccessfullyWith(files[
                                                'http://127.0.0.1/amocrm_deploy/templates/ModalWindow.twig'
                                            ]);

                                        spendTime(1000);
                                    });

                                    it(
                                        'Открыто окно с сообщение о том, что вкладка с видежетом должна оставаться ' +
                                        'открытой.',
                                    function() {
                                        dontCloseTabMessage.expectToBeVisible();
                                    });
                                    it(
                                        'Нажимаю на кнопку "OK". Закрыто окно с сообщение о том, что вкладка с ' +
                                        'видежетом должна оставаться открытой. Виджет установлен. Открывается ' +
                                        'страница лекого входа.',
                                    function() {
                                        modalWindowButton('OK').click();
                                        spendTime(1000);
                                        Promise.runAll();

                                        expect(saved).toBe(true);
                                        dontCloseTabMessage.expectToBeHiddenOrNotExist();

                                        windowOpener.expectToHavePath('https://app.uiscom.ru/easystart/amocrm/').
                                            expectQueryToContain({
                                                account_id: '939285',
                                                user_id: '2851135',
                                                email: 'darya.simha@gmail.com',
                                                name: 'Darya Simha',
                                                phone: '79252117620',
                                                hash: '442bd71353615168b7907d2a63b72f9e0def8d40',
                                                domain: 'comagicwidgets.amocrm.ru',
                                                widget_type: 'uis'
                                            });
                                    });
                                });
                            });
                        });
                    });
                    describe(
                        'Не удалось создать тестового пользователя, так как в UIS уже есть заблокированный ' +
                        'пользователь с E-Mail совпадающим с E-Mail пользователя, авторизованного в amoCRM.',
                    function() {
                        beforeEach(function() {
                            ajax.recentRequest().
                                expectToHavePath('/private/widget/proxy.php').
                                expectToHaveMethod('POST').
                                expectBodyToContain({
                                    target: ['https://app.uiscom.ru/easystart/amocrm/create_account/']
                                }).
                                testBodyParam('data', function (data) {
                                    utils.expectObjectToContain(JSON.parse(data[0]), {
                                        account_id: 939285,
                                        user_id: 2851135,
                                        email: 'darya.simha@gmail.com',
                                        name: 'Darya Simha',
                                        phone: '79252117620',
                                        hash: '442bd71353615168b7907d2a63b72f9e0def8d40',
                                        domain: 'comagicwidgets.amocrm.ru',
                                        widget_type: 'uis'
                                    });
                                }).
                                respondSuccessfullyWith({
                                    success: false,
                                    error: 'user_is_archive'
                                });

                            ajax.recentRequest().
                                expectToHavePath('/amocrm_deploy/templates/ModalWindow.twig').
                                expectToHaveMethod('GET').
                                respondSuccessfullyWith(files[
                                    'http://127.0.0.1/amocrm_deploy/templates/ModalWindow.twig'
                                ]);

                            spendTime(1000);
                        });

                        it('Открыто окно с сообщение об ошикбе.', function() {
                            userIsArchiveMessage.expectToBeVisible();
                        });
                        it('Нажимаю на кнопку "Закрыть". Окно настроек не заблокировано.', function() {
                            modalWindowButton('Закрыть').click();
                            settingsWindowOverlay.expectToBeHidden();
                        });
                    });
                    describe(
                        'Не удалось создать тестового пользователя, так как в профиле amoCRM не был указан номер ' +
                        'телефона. Частично ввожу номер телефона в поле.',
                    function() {
                        beforeEach(function() {
                            ajax.recentRequest().
                                expectToHavePath('/private/widget/proxy.php').
                                expectToHaveMethod('POST').
                                expectBodyToContain({
                                    target: ['https://app.uiscom.ru/easystart/amocrm/create_account/']
                                }).
                                testBodyParam('data', function (data) {
                                    utils.expectObjectToContain(JSON.parse(data[0]), {
                                        account_id: 939285,
                                        user_id: 2851135,
                                        email: 'darya.simha@gmail.com',
                                        name: 'Darya Simha',
                                        phone: '79252117620',
                                        hash: '442bd71353615168b7907d2a63b72f9e0def8d40',
                                        domain: 'comagicwidgets.amocrm.ru',
                                        widget_type: 'uis'
                                    });
                                }).
                                respondSuccessfullyWith({
                                    success: false,
                                    error: 'incorrect_phone'
                                });

                            ajax.recentRequest().
                                expectToHavePath('/amocrm_deploy/templates/PhoneEnteringWindow.twig').
                                expectToHaveMethod('GET').
                                respondSuccessfullyWith(files[
                                    'http://127.0.0.1/amocrm_deploy/templates/PhoneEnteringWindow.twig'
                                ]);

                            ajax.recentRequest().
                                expectToHavePath('/amocrm_deploy/templates/ModalWindow.twig').
                                expectToHaveMethod('GET').
                                respondSuccessfullyWith(files[
                                    'http://127.0.0.1/amocrm_deploy/templates/ModalWindow.twig'
                                ]);

                            spendTime(1000);

                            phoneField.fill('+ 7 (916) 123-45-');
                        });

                        it('Кнопка "Отправить" заблокирована.', function() {
                            modalWindowButton('Отправить').expectToHaveClass('button-input-disabled');
                            modalWindowButton('Отправить').click();
                        });
                        describe('Ввожу оставшуюся часть номера телефона.', function() {
                            beforeEach(function() {
                                phoneField.input('67');
                            });

                            it('Кнопка "Отправить" доступна.', function() {
                                modalWindowButton('Отправить').expectNotToHaveClass('button-input-disabled');
                            });
                            it(
                                'Нажимаю на кнопку "Отправить". Открыто окно с сообщение о том, что вкладка с ' +
                                'видежетом должна оставаться открытой. Окно с полем для ввода номера телефона ' +
                                'скрыто. Нажимаю на кнопку "OK". Закрыто окно с сообщение о том, что вкладка с ' +
                                'видежетом должна оставаться открытой. Виджет установлен. Открывается страница ' +
                                'лекого входа.',
                            function() {
                                modalWindowButton('Отправить').click();

                                ajax.recentRequest().
                                    expectToHavePath('/private/widget/proxy.php').
                                    expectToHaveMethod('POST').
                                    expectBodyToContain({
                                        target: ['https://app.uiscom.ru/easystart/amocrm/create_account/']
                                    }).
                                    testBodyParam('data', function (data) {
                                        utils.expectObjectToContain(JSON.parse(data[0]), {
                                            account_id: 939285,
                                            user_id: 2851135,
                                            email: 'darya.simha@gmail.com',
                                            name: 'Darya Simha',
                                            phone: '+ 7 (916) 123-45-67',
                                            hash: '442bd71353615168b7907d2a63b72f9e0def8d40',
                                            domain: 'comagicwidgets.amocrm.ru',
                                            widget_type: 'uis'
                                        });
                                    }).
                                    respondSuccessfullyWith({
                                        success: true,
                                        result: true
                                    });

                                ajax.recentRequest().
                                    expectToHavePath('/private/widget/proxy.php').
                                    expectToHaveMethod('POST').
                                    expectBodyToContain({
                                        target: [
                                            'https://va.uiscom.ru:443/widget_api/be2243dddacb680da2702552fd6269ee/'
                                        ]
                                    }).
                                    testBodyParam('data', function (data) {
                                        utils.expectObjectToContain(JSON.parse(data[0]), {
                                            method: 'external_check_registration',
                                            params: {
                                                app: 'comagic',
                                                service: 'amo',
                                                subdomain: 'comagicwidgets',
                                                domain: 'comagicwidgets.amocrm.ru',
                                                email: 'darya.simha@gmail.com',
                                                hash: '442bd71353615168b7907d2a63b72f9e0def8d40',
                                                phone: '+ 7 (916) 123-45-67',
                                                name: 'Darya Simha',
                                                user_id: 2851135,
                                                widget_type: 'uis',
                                                widget_version: '1.7.0'
                                            }
                                        });
                                    }).
                                    respondSuccessfullyWith({
                                        success: true,
                                        result: {
                                            registration_message: 'exist application',
                                            registration_email: 'darya.r@gmail.com',
                                            state: 'active',
                                            has_va_component: true,
                                            has_amocrm_component: true,
                                            is_integrated: false
                                        }
                                    });

                                ajax.recentRequest().
                                    expectToHavePath('/private/widget/proxy.php').
                                    expectToHaveMethod('POST').
                                    expectBodyToContain({
                                        target: [
                                            'https://va.uiscom.ru:443/widget_api/be2243dddacb680da2702552fd6269ee/'
                                        ]
                                    }).
                                    testBodyParam('data', function (data) {
                                        utils.expectObjectToContain(JSON.parse(data[0]), {
                                            method: 'external_add_or_integrate',
                                            params: {
                                                app: 'comagic',
                                                service: 'amo',
                                                subdomain: 'comagicwidgets',
                                                domain: 'comagicwidgets.amocrm.ru',
                                                email: 'darya.simha@gmail.com',
                                                hash: '442bd71353615168b7907d2a63b72f9e0def8d40',
                                                phone: '74951234567',
                                                name: 'Darya Rahvalova',
                                                user_id: 2851135,
                                                widget_type: 'uis',
                                                widget_version: '1.7.0'
                                            }
                                        });
                                    }).
                                    respondSuccessfullyWith({
                                        success: true,
                                        result: {
                                            status: 'integrated',
                                            data: {}
                                        }
                                    });

                                ajax.recentRequest().
                                    expectToHavePath('/private/widget/proxy.php').
                                    expectToHaveMethod('POST').
                                    expectBodyToContain({
                                        target: [
                                            'https://va.uiscom.ru:443/widget_api/be2243dddacb680da2702552fd6269ee/'
                                        ]
                                    }).
                                    testBodyParam('data', function (data) {
                                        utils.expectObjectToContain(JSON.parse(data[0]), {
                                            method: 'external_auth',
                                            params: {
                                                app: 'comagic',
                                                service: 'amo',
                                                subdomain: 'comagicwidgets',
                                                domain: 'comagicwidgets.amocrm.ru',
                                                email: 'darya.simha@gmail.com',
                                                hash: '442bd71353615168b7907d2a63b72f9e0def8d40',
                                                phone: '74951234567',
                                                name: 'Darya Rahvalova',
                                                user_id: 2851135,
                                                widget_type: 'uis',
                                                widget_version: '1.7.0'
                                            }
                                        });
                                    }).
                                    respondSuccessfullyWith({
                                        result: {
                                            account_id: '21829480',
                                            comagic_key: '19451194',
                                            display_name: 'Dar`ya Rahvalova (amoCRM)',
                                            max_version: null,
                                            min_version: '1.1.0',
                                            no_telephony: false,
                                            registrar_server: 'vo19.uiscom.ru',
                                            sip_login: '082481',
                                            sip_password: '_3A5H_dc_C'
                                        }
                                    });

                                spendTime(1000);

                                modalWindowButton('OK').click();
                                spendTime(1000);
                                Promise.runAll();

                                expect(saved).toBe(true);
                                dontCloseTabMessage.expectToBeHiddenOrNotExist();
                                phoneField.expectToBeHiddenOrNotExist();

                                windowOpener.expectToHavePath('https://app.uiscom.ru/easystart/amocrm/').
                                    expectQueryToContain({
                                        account_id: '939285',
                                        user_id: '2851135',
                                        email: 'darya.simha@gmail.com',
                                        name: 'Darya Simha',
                                        phone: '+ 7 (916) 123-45-67',
                                        hash: '442bd71353615168b7907d2a63b72f9e0def8d40',
                                        domain: 'comagicwidgets.amocrm.ru',
                                        widget_type: 'uis'
                                    });
                            });
                        });
                    });
                });
                it('Кнопка "Хочу попробовать UIS" заблокирована. Кнопка "Установить" заблокирована.', function() {
                    tryButton.expectToHaveClass('button-input-disabled');
                    installButton.expectToHaveClass('button-input-disabled');
                    settingsFormSubmitButton.expectToHaveClass('button-input-disabled');
                });
                it('Кнопка установки содержит текст "Установить".', function() {
                    installButton.expectToHaveTextContent('Установить');
                    settingsFormSubmitButton.expectToHaveTextContent('Установить');
                });
                describe('Отмечаю чекбокс соглашения.', function() {
                    beforeEach(function() {
                        agreementCheckbox.click();
                    });

                    describe((
                        'Нажимаю на кнопку "Уже использую UIS". В ответ на запрос регистрации в UIS пришло ' +
                        'сообщение о том, что пользователь еще не зарегистрирован.'
                    ), function() {
                        beforeEach(function() {
                            usingUisButton.click();

                            ajax.recentRequest().
                                expectToHavePath('/private/widget/proxy.php').
                                expectToHaveMethod('POST').
                                expectBodyToContain({
                                    target: ['https://va.uiscom.ru:443/widget_api/be2243dddacb680da2702552fd6269ee/']
                                }).
                                testBodyParam('data', function (data) {
                                    utils.expectObjectToContain(JSON.parse(data[0]), {
                                        method: 'external_check_registration',
                                        params: {
                                            app: 'comagic',
                                            service: 'amo',
                                            subdomain: 'comagicwidgets',
                                            domain: 'comagicwidgets.amocrm.ru',
                                            email: 'darya.simha@gmail.com',
                                            hash: '442bd71353615168b7907d2a63b72f9e0def8d40',
                                            phone: '79252117620',
                                            name: 'Darya Simha',
                                            user_id: 2851135,
                                            widget_type: 'uis',
                                            widget_version: '1.7.0'
                                        }
                                    });
                                }).
                                respondSuccessfullyWith({
                                    success: true,
                                    result: {
                                        registration_message: 'no customer',
                                        registration_email: 'darya.r@gmail.com',
                                        state: 'inactive',
                                        has_va_component: false,
                                        has_amocrm_component: false,
                                        is_integrated: false
                                    }
                                });

                            spendTime(1000);
                        });

                        it(
                            'Отображается инструкция по подключению интеграции с amoCRM. Кнопка "Установить" ' +
                            'доступна.',
                        function() {
                            settingsErrorMessage.expectToBeHiddenOrNotExist();
                            usingUisInstructionsHeader.expectToBeVisible();
                            settingsFormSubmitButton.expectToHaveTextContent('Установить');
                            installButton.expectToHaveTextContent('Установить');
                            installButton.expectNotToHaveClass('button-input-disabled');
                            settingsFormSubmitButton.expectNotToHaveClass('button-input-disabled');
                        });
                        it((
                            'Нажимаю на кнопку "Установить". Отображается сообщение о том, что аккаунт не ' +
                            'зарегистрирован в UIS.'
                        ), function() {
                            nameField.fill('Darya Rahvalova');
                            spendTime(1);

                            installButton.click();
                            Promise.runAll();

                            ajax.recentRequest().
                                expectToHavePath('/private/widget/proxy.php').
                                expectToHaveMethod('POST').
                                expectBodyToContain({
                                    target: ['https://va.uiscom.ru:443/widget_api/be2243dddacb680da2702552fd6269ee/']
                                }).
                                testBodyParam('data', function (data) {
                                    utils.expectObjectToContain(JSON.parse(data[0]), {
                                        method: 'external_process_delayed_error',
                                        params: {
                                            app: 'comagic',
                                            service: 'amo',
                                            subdomain: 'comagicwidgets',
                                            domain: 'comagicwidgets.amocrm.ru',
                                            email: 'darya.simha@gmail.com',
                                            hash: '442bd71353615168b7907d2a63b72f9e0def8d40',
                                            phone: '74951234567',
                                            name: 'Darya Rahvalova',
                                            user_id: 2851135,
                                            widget_type: 'uis',
                                            widget_version: '1.7.0',
                                            isNew: false,
                                            errorMnemonic: 'error_settings_existing_no_customer',
                                            errorContext: {
                                                registration_email: "darya.r@gmail.com"
                                            }
                                        }
                                    });
                                }).
                                respondSuccessfullyWith({
                                    success: true,
                                    result: true
                                });

                            spendTime(1000);

                            expect(saved).toBe(false);
                            installButton.expectToHaveClass('button-input-disabled');
                            usingUisInstructionsHeader.expectToBeHiddenOrNotExist();

                            settingsErrorMessage.expectToHaveTextContent((
                                'Аккаунт "darya.r@gmail.com" не найден в базе данных портала UIS app.uiscom.ru. ' +
                                'Возможно, Вы в настоящее время подключены к старому порталу universe.uiscom.ru. ' +
                                'Обратитесь к Вашему персональному менеджеру UIS по вопросу перехода на ' +
                                'обслуживание в новый портал UIS'
                            ));
                        });
                    });
                    describe('Нажимаю на кнопку "Хочу попробовать UIS".', function() {
                        beforeEach(function() {
                            tryButton.expectNotToHaveClass('button-input-disabled');
                            tryButton.click();
                        });

                        describe((
                            'В ответ на запрос регистрации в UIS пришло сообщение о том, что пользователь еще не ' +
                            'зарегистрирован.'
                        ), function() {
                            beforeEach(function() {
                                ajax.recentRequest().
                                    expectToHavePath('/private/widget/proxy.php').
                                    expectToHaveMethod('POST').
                                    expectBodyToContain({
                                        target: [
                                            'https://va.uiscom.ru:443/widget_api/be2243dddacb680da2702552fd6269ee/'
                                        ]
                                    }).
                                    testBodyParam('data', function (data) {
                                        utils.expectObjectToContain(JSON.parse(data[0]), {
                                            method: 'external_check_registration',
                                            params: {
                                                app: 'comagic',
                                                service: 'amo',
                                                subdomain: 'comagicwidgets',
                                                domain: 'comagicwidgets.amocrm.ru',
                                                email: 'darya.simha@gmail.com',
                                                hash: '442bd71353615168b7907d2a63b72f9e0def8d40',
                                                phone: '79252117620',
                                                name: 'Darya Simha',
                                                user_id: 2851135,
                                                widget_type: 'uis',
                                                widget_version: '1.7.0'
                                            }
                                        });
                                    }).
                                    respondSuccessfullyWith({
                                        success: true,
                                        result: {
                                            registration_message: 'no customer',
                                            registration_email: 'darya.r@gmail.com',
                                            state: 'inactive',
                                            has_va_component: false,
                                            has_amocrm_component: false,
                                            is_integrated: false
                                        }
                                    });
                            });

                            it((
                                'Снимаю отметку с чекбокса соглашения. Кнопки "Зарегистрироваться в UIS" и "Хочу ' +
                                'попробовать UIS" заблокированы.'
                            ), function() {
                                agreementCheckbox.click();

                                installButton.expectToHaveClass('button-input-disabled');
                                tryButton.expectToHaveClass('button-input-disabled');
                            });
                            it(
                                'Отображается инструкция по регистрации в UIS. Кнопка "Зарегистрироваться в UIS" ' +
                                'доступна.',
                            function() {
                                installButton.expectToHaveTextContent('Установить');
                                installButton.expectNotToHaveClass('button-input-disabled');
                                settingsFormSubmitButton.expectToHaveTextContent('Зарегистрироваться в UIS');
                                settingsFormSubmitButton.expectNotToHaveClass('button-input-disabled');
                                tryInstructionsHeader.expectToBeVisible();
                                settingsErrorMessage.expectToBeHiddenOrNotExist();
                            });
                            describe('Нажимаю на кнопку "Установить".', function() {
                                beforeEach(function() {
                                    nameField.fill('Darya Rahvalova');
                                    spendTime(1);

                                    installButton.click();
                                    installButton.click();
                                    Promise.runAll();
                                });

                                it(
                                    'Интеграция с UIS успешно подключена. Отображено сообщение об успешной ' +
                                    'интеграции.',
                                function() {
                                    ajax.recentRequest().
                                        expectToHavePath('/private/widget/proxy.php').
                                        expectToHaveMethod('POST').
                                        expectBodyToContain({
                                            target: [
                                                'https://va.uiscom.ru:443/widget_api/be2243dddacb680da2702552fd6269ee/'
                                            ]
                                        }).
                                        testBodyParam('data', function (data) {
                                            utils.expectObjectToContain(JSON.parse(data[0]), {
                                                method: 'external_add_or_integrate',
                                                params: {
                                                    app: 'comagic',
                                                    service: 'amo',
                                                    subdomain: 'comagicwidgets',
                                                    domain: 'comagicwidgets.amocrm.ru',
                                                    email: 'darya.simha@gmail.com',
                                                    hash: '442bd71353615168b7907d2a63b72f9e0def8d40',
                                                    phone: '74951234567',
                                                    name: 'Darya Rahvalova',
                                                    user_id: 2851135,
                                                    widget_type: 'uis',
                                                    widget_version: '1.7.0'
                                                }
                                            });
                                        }).
                                        respondSuccessfullyWith({
                                            success: true,
                                            result: {
                                                status: 'integrated',
                                                data: {}
                                            }
                                        });

                                    ajax.recentRequest().
                                        expectToHavePath('/private/widget/proxy.php').
                                        expectToHaveMethod('POST').
                                        expectBodyToContain({
                                            target: [
                                                'https://va.uiscom.ru:443/widget_api/be2243dddacb680da2702552fd6269ee/'
                                            ]
                                        }).
                                        testBodyParam('data', function (data) {
                                            utils.expectObjectToContain(JSON.parse(data[0]), {
                                                method: 'external_auth',
                                                params: {
                                                    app: 'comagic',
                                                    service: 'amo',
                                                    subdomain: 'comagicwidgets',
                                                    domain: 'comagicwidgets.amocrm.ru',
                                                    email: 'darya.simha@gmail.com',
                                                    hash: '442bd71353615168b7907d2a63b72f9e0def8d40',
                                                    phone: '74951234567',
                                                    name: 'Darya Rahvalova',
                                                    user_id: 2851135,
                                                    widget_type: 'uis',
                                                    widget_version: '1.7.0'
                                                }
                                            });
                                        }).
                                        respondSuccessfullyWith({
                                            result: {
                                                account_id: '21829480',
                                                comagic_key: '19451194',
                                                display_name: 'Dar`ya Rahvalova (amoCRM)',
                                                max_version: null,
                                                min_version: '1.1.0',
                                                no_telephony: false,
                                                registrar_server: 'vo19.uiscom.ru',
                                                sip_login: '082481',
                                                sip_password: '_3A5H_dc_C'
                                            }
                                        });

                                    Promise.runAll();

                                    expect(saved).toBe(true);
                                    settingsErrorMessage.expectToBeHiddenOrNotExist();
                                    settingsInformationBlock.expectToHaveTextContent(
                                        'Вы успешно подключили интеграцию с amoCRM. Аккаунт в amoCRM - ' +
                                        'comagicwidgets'
                                    );
                                });
                                it(
                                    'Пользователь успешно зарегистрировался в UIS. Отображено сообщение об ' +
                                    'успешной регистрации.',
                                function() {
                                    ajax.recentRequest().
                                        expectToHavePath('/private/widget/proxy.php').
                                        expectToHaveMethod('POST').
                                        expectBodyToContain({
                                            target: [
                                                'https://va.uiscom.ru:443/widget_api/be2243dddacb680da2702552fd6269ee/'
                                            ]
                                        }).
                                        testBodyParam('data', function (data) {
                                            utils.expectObjectToContain(JSON.parse(data[0]), {
                                                method: 'external_add_or_integrate',
                                                params: {
                                                    app: 'comagic',
                                                    service: 'amo',
                                                    subdomain: 'comagicwidgets',
                                                    domain: 'comagicwidgets.amocrm.ru',
                                                    email: 'darya.simha@gmail.com',
                                                    hash: '442bd71353615168b7907d2a63b72f9e0def8d40',
                                                    phone: '74951234567',
                                                    name: 'Darya Rahvalova',
                                                    user_id: 2851135,
                                                    widget_type: 'uis',
                                                    widget_version: '1.7.0'
                                                }
                                            });
                                        }).
                                        respondSuccessfullyWith({
                                            success: true,
                                            result: {
                                                status: 'added',
                                                data: {}
                                            }
                                        });

                                    expect(saved).toBe(false);
                                    settingsErrorMessage.expectToBeHiddenOrNotExist();
                                    settingsInformationBlock.expectToHaveTextContent(
                                        'В ближайшее время Вы получите письмо с инструкцией по подтверждению ' +
                                        'Вашего электронного адреса "darya.simha@gmail.com". После подтверждения ' +
                                        'нажмите "Установить". Телефон поддержки: +7 (495) 926-86-86'
                                    );
                                });
                            });
                        });
                        describe((
                            'В ответ на запрос регистрации в UIS пришло сообщение о том, что пользователь уже ' +
                            'зарегистрирован. Отображается сообщение об ошибке.'
                        ), function() {
                            beforeEach(function() {
                                ajax.recentRequest().
                                    expectToHavePath('/private/widget/proxy.php').
                                    expectToHaveMethod('POST').
                                    expectBodyToContain({
                                        target: [
                                            'https://va.uiscom.ru:443/widget_api/be2243dddacb680da2702552fd6269ee/'
                                        ]
                                    }).
                                    testBodyParam('data', function (data) {
                                        utils.expectObjectToContain(JSON.parse(data[0]), {
                                            method: 'external_check_registration',
                                            params: {
                                                app: 'comagic',
                                                service: 'amo',
                                                subdomain: 'comagicwidgets',
                                                domain: 'comagicwidgets.amocrm.ru',
                                                email: 'darya.simha@gmail.com',
                                                hash: '442bd71353615168b7907d2a63b72f9e0def8d40',
                                                phone: '79252117620',
                                                name: 'Darya Simha',
                                                user_id: 2851135,
                                                widget_type: 'uis',
                                                widget_version: '1.7.0'
                                            }
                                        });
                                    }).
                                    respondSuccessfullyWith({
                                        success: true,
                                        result: {
                                            registration_message: 'exist application',
                                            registration_email: 'darya.r@gmail.com',
                                            state: 'active',
                                            has_va_component: true,
                                            has_amocrm_component: true,
                                            is_integrated: false
                                        }
                                    });
                            });

                            it((
                                'Нажимаю на кнопку "Уже использую UIS". В ответ на запрос регистрации в UIS ' +
                                'пришло сообщение о том, что пользователь уже зарегистрирован. Отображается ' +
                                'инструкция по подключению интеграции с amoCRM. Кнопка "Установить" доступна.'
                            ), function() {
                                usingUisButton.click();

                                ajax.recentRequest().
                                    expectToHavePath('/private/widget/proxy.php').
                                    expectToHaveMethod('POST').
                                    expectBodyToContain({
                                        target: [
                                            'https://va.uiscom.ru:443/widget_api/be2243dddacb680da2702552fd6269ee/'
                                        ]
                                    }).
                                    testBodyParam('data', function (data) {
                                        utils.expectObjectToContain(JSON.parse(data[0]), {
                                            method: 'external_check_registration',
                                            params: {
                                                app: 'comagic',
                                                service: 'amo',
                                                subdomain: 'comagicwidgets',
                                                domain: 'comagicwidgets.amocrm.ru',
                                                email: 'darya.simha@gmail.com',
                                                hash: '442bd71353615168b7907d2a63b72f9e0def8d40',
                                                phone: '79252117620',
                                                name: 'Darya Simha',
                                                user_id: 2851135,
                                                widget_type: 'uis',
                                                widget_version: '1.7.0'
                                            }
                                        });
                                    }).
                                    respondSuccessfullyWith({
                                        success: true,
                                        result: {
                                            registration_message: 'exist application',
                                            registration_email: 'darya.r@gmail.com',
                                            state: 'active',
                                            has_va_component: true,
                                            has_amocrm_component: true,
                                            is_integrated: false
                                        }
                                    });

                                spendTime(1000);

                                settingsErrorMessage.expectToBeHiddenOrNotExist();
                                usingUisInstructionsHeader.expectToBeVisible();
                                installButton.expectToHaveTextContent('Установить');
                                installButton.expectNotToHaveClass('button-input-disabled');
                            });
                            it('Кнопка "Зарегистрироваться в UIS" заблокирована.', function() {
                                installButton.expectToHaveClass('button-input-disabled');
                                tryInstructionsHeader.expectToBeHiddenOrNotExist();
                                settingsErrorMessage.expectToHaveTextContent((
                                    'Клиент с адресом "darya.r@gmail.com" уже существует в UIS. Если Вы хотите ' +
                                    'подключить виджет для этого клиента, нажмите "Уже пользуюсь UIS"'
                                ));
                            });
                        });
                    });
                });
            });
            describe('Микрофон не подключен. Нажимаю на иконку с телефоном.', function() {
                beforeEach(function() {
                    userMedia.disallowMediaInput();
                    clickPhoneIcon();
                });

                it(
                    'Нажимаю на номер телефона в списке контактов. В данных абонента не указан URL сайта. В ' +
                    'веб-сокет отправлено SIP-сообщение об исходящем звонке на выбранный номер. Отображена ссылка на ' +
                    'страницу с данными абонента.',
                function() {
                    widgetActions.executeAction('phone', {
                        value: '74951234567',
                        model: new PhoneActionModel({
                            name: {
                                text: 'Ivanov Ivan Ivanovich'
                            },
                            company_name: {
                                text: 'UIS'
                            }
                        }, {
                            id: 12345,
                            attributes: {
                                entity: 'contact'
                            }
                        })
                    });
                    
                    rtcConnectionsMock.getConnectionAtIndex(0).connect();

                    ajax.recentRequest().
                        expectToHavePath('/amocrm_deploy/templates/InCall.twig').
                        expectToHaveMethod('GET').
                        respondSuccessfullyWith(files['http://127.0.0.1/amocrm_deploy/templates/InCall.twig']);

                    ajax.recentRequest().
                        expectToHavePath('/amocrm_deploy/templates/CallStatus.twig').
                        expectToHaveMethod('GET').
                        respondSuccessfullyWith(files['http://127.0.0.1/amocrm_deploy/templates/CallStatus.twig']);

                    Promise.runAll();
                    userMedia.allowMediaInput();
                    Promise.runAll();

                    var request = sip.recentRequest().
                        expectToHaveMethod('INVITE').
                        expectToHaveServerName('sip:74951234567@vo19.uiscom.ru').
                        expectHeaderToContain('From', '"Dar`ya Rahvalova (amoCRM)" <sip:082481@vo19.uiscom.ru>').
                        expectHeaderToContain('To', '<sip:74951234567@vo19.uiscom.ru>');
                        
                    var response = request.response().
                        setTrying().
                        copyHeader('Contact');
                    response.send();

                    request.response().
                        setToTag(response.getToTag()).
                        setRinging().
                        copyHeader('Contact').
                        send();

                    request.response().
                        setToTag(response.getToTag()).
                        setOk().
                        copyHeader('Contact').
                        setBody('v=0').
                        send();

                    Promise.runAll();

                    sip.recentRequest().
                        expectToHaveMethod('ACK').
                        expectHeaderToContain('From', '"Dar`ya Rahvalova (amoCRM)" <sip:082481@vo19.uiscom.ru>').
                        expectHeaderToContain('To', '<sip:74951234567@vo19.uiscom.ru>');

                    outgoingCallContactInformation.expectToHaveTextContent(
                        'Исходящий звонок: 74951234567 Ivanov Ivan Ivanovich , UIS');

                    outgoingCallContactInformation.findAnchor('Ivanov Ivan Ivanovich').
                        expectHrefToHavePath('/contacts/detail/12345');
                });
                it(
                    'Нажимаю на номер телефона в списке контактов. В данных абонента указан URL сайта. В ' +
                    'веб-сокет отправлено SIP-сообщение об исходящем звонке на выбранный номер. Отображена ' +
                    'ссылка на сайт, указанная данных абонента.',
                function() {
                    widgetActions.executeAction('phone', {
                        value: '74951234567',
                        model: new PhoneActionModel({
                            name: {
                                text: 'Ivanov Ivan Ivanovich'
                            },
                            company_name: {
                                text: 'UIS'
                            }
                        }, {
                            id: 12345,
                            attributes: {
                                url: 'http://uiscom.ru',
                                entity: 'contact'
                            }
                        })
                    });

                    rtcConnectionsMock.getConnectionAtIndex(0).connect();

                    ajax.recentRequest().
                        expectToHavePath('/amocrm_deploy/templates/InCall.twig').
                        expectToHaveMethod('GET').
                        respondSuccessfullyWith(files['http://127.0.0.1/amocrm_deploy/templates/InCall.twig']);

                    ajax.recentRequest().
                        expectToHavePath('/amocrm_deploy/templates/CallStatus.twig').
                        expectToHaveMethod('GET').
                        respondSuccessfullyWith(files['http://127.0.0.1/amocrm_deploy/templates/CallStatus.twig']);

                    Promise.runAll();
                    userMedia.allowMediaInput();
                    Promise.runAll();

                    var request = sip.recentRequest().
                        expectToHaveMethod('INVITE').
                        expectToHaveServerName('sip:74951234567@vo19.uiscom.ru').
                        expectHeaderToContain('From', '"Dar`ya Rahvalova (amoCRM)" <sip:082481@vo19.uiscom.ru>').
                        expectHeaderToContain('To', '<sip:74951234567@vo19.uiscom.ru>');
                        
                    request.response().setTrying().send();
                    request.response().setRinging().send();

                    outgoingCallContactInformation.expectToHaveTextContent(
                        'Исходящий звонок: 74951234567 Ivanov Ivan Ivanovich , UIS');

                    outgoingCallContactInformation.findAnchor('Ivanov Ivan Ivanovich').
                        expectHrefToHavePath('http://uiscom.ru/');
                });
                describe(
                    'Устанавливаю состояние "Офлайн" переключателя. В веб-сокет отправлен SIP-запрос разрыва ' +
                    'соединения.',
                function() {
                    beforeEach(function() {
                        onlineSwitcher.click();
                        spendTime(10);

                        sip.recentRequest().
                            expectToHaveMethod('REGISTER').
                            expectHeaderToContain('Expires', '0').
                            response().
                            send();

                        spendTime(10);
                    });

                    it((
                        'Нажимаю на номер телефона в списке контактов. В веб-сокет отправлено сообщение об ' +
                        'исходящем звонке на выбранный номер. Отображено всплывающее сообщение "Ожидайте входящий ' +
                        'звонок".'
                    ), function() {
                        widgetActions.executeAction('phone', {
                            value: '74951234567',
                            model: new PhoneActionModel({
                                name: {
                                    text: 'Ivanov Ivan Ivanovich'
                                },
                                company_name: {
                                    text: 'UIS'
                                }
                            }, {
                                id: 12345,
                                attributes: {
                                    url: 'http://uiscom.ru',
                                    entity: 'contact'
                                }
                            })
                        });

                        webSockets.getSocket('wss://va.uiscom.ru:443/crm_websocket').expectSentMessageToContain({
                            service: 'amo_crm_ws',
                            event: 'start_call',
                            context: {
                                account_id: 21829480,
                                user_id: 2851135,
                                contact_phone_number: '74951234567'
                            }
                        }).receiveMessage({
                            status: 'success',
                            event: 'start_call',
                            mnemonic: 'info_click_to_call_send'
                        });

                        notifications.recentMessage().expectToHaveText('Ожидайте входящий звонок');
                    });
                    describe('Из веб-сокета получено сообщение о входящем звонке на мобльник.', function() {
                        beforeEach(function() {
                            webSockets.getSocket('wss://va.uiscom.ru:443/crm_websocket').receiveMessage({
                                event: 'notify',
                                type: 'call',
                                data: {
                                    ani: '79161234567',
                                    comagic_context: {
                                        site: 'zakzak.ucoz.net',
                                        search_query: null,
                                        campaign: 'dokhera'
                                    },
                                    customer: {
                                        company_name: 'UIS',
                                        person_name: 'Ivanov Ivan Ivanovich',
                                        id: 382030
                                    },
                                    did: '74951250516',
                                    start_time: 1565166168
                                }
                            });

                            ajax.recentRequest().
                                expectToHavePath('/amocrm_deploy/templates/IncomingCall.twig').
                                expectToHaveMethod('GET').
                                respondSuccessfullyWith(
                                    files['http://127.0.0.1/amocrm_deploy/templates/IncomingCall.twig']
                                );
                            
                            spendTime(10);

                            ajax.recentRequest().
                                expectToHavePath('/amocrm_deploy/templates/CallStatus.twig').
                                expectToHaveMethod('GET').
                                respondSuccessfullyWith(files[
                                    'http://127.0.0.1/amocrm_deploy/templates/CallStatus.twig'
                                ]);
                        });

                        it('Нажимаю на иконку с трубкой. Виджет скрыт.', function() {
                            clickPhoneIcon();
                            views().expectAllViewsToBeHidden();
                        });
                        it('В виджете отображены данные звонящего абонента.', function() {
                            abonentInformationBlock.expectToHaveTextContent('Входящий звонок : 79161234567 ' +
                            'Ivanov Ivan Ivanovich , UIS Сайт: zakzak.ucoz.net Рекламная кампания: dokhera');
                        });
                        it('Отображено всплывающее сообщение с данными звонящего абонента.', function() {
                            notifications.recentMessage().expectToHaveText([
                                'Ivanov Ivan Ivanovich, UIS.',
                                'Сайт: http://zakzak.ucoz.net.',
                                'Рекламная кампания: dokhera'
                            ].join("\n"));
                        });
                        it(
                            'Кнопки "Ответить", "Закрыть" и "Отклонить" скрыты, а кнопка "Открыть контакт" видима.',
                        function() {
                            openContactButton.expectToBeVisible();
                            answerButton.expectToBeHidden();
                            declineButton.expectToBeHidden();
                            closeButton.expectToBeHidden();
                        });
                        it('Нажимаю на кнопку "Открыть контакт". Открыта страница контакта', function() {
                            openContactButton.click();
                            spendTime(10);

                            window.AMOCRM.router.expectToHaveUrl('/contacts/detail/382030');
                        });
                        it('Звонящий абонент положил трубку. Виджет скрыт.', function() {
                            webSockets.getSocket('wss://va.uiscom.ru:443/crm_websocket').receiveMessage({
                                event: 'notify',
                                type: 'release_call'
                            });

                            views().expectAllViewsToBeHidden();
                        });
                    });
                });
            });
            describe('Микрофон подключен. Нажимаю на иконку с телефоном.', function() {
                beforeEach(function() {
                    userMedia.allowMediaInput();
                    clickPhoneIcon();
                });

                it('Установлено состояние "Онлайн" переключателя.', function() {
                    onlineSwitcher.expectToHaveClass('cmg-switcher__on');
                });
                describe((
                    'Нажимаю на кнопку набора номера. Набираю номер. Нажимаю на кнопку звонка. На сервер по ' +
                    'SIP-протоколу отправлено сообщение об исходящем звонке.'
                ), function() {
                    beforeEach(function() {
                        dialpadButton.click();

                        ajax.recentRequest().
                            expectToHavePath('/amocrm_deploy/templates/Dialpad.twig').
                            expectToHaveMethod('GET').
                            respondSuccessfullyWith(files['http://127.0.0.1/amocrm_deploy/templates/Dialpad.twig']);

                        numberButton(7).click();
                        numberButton(4).click();
                        numberButton(9).click();
                        numberButton(5).click();
                        numberButton(1).click();
                        numberButton(2).click();
                        numberButton(3).click();
                        numberButton(4).click();
                        numberButton(5).click();
                        numberButton(6).click();
                        numberButton(7).click();

                        dialButton.click();
                        rtcConnectionsMock.getConnectionAtIndex(0).connect();

                        ajax.recentRequest().
                            expectToHavePath('/amocrm_deploy/templates/InCall.twig').
                            expectToHaveMethod('GET').
                            respondSuccessfullyWith(files['http://127.0.0.1/amocrm_deploy/templates/InCall.twig']);

                        ajax.recentRequest().
                            expectToHavePath('/amocrm_deploy/templates/CallStatus.twig').
                            expectToHaveMethod('GET').
                            respondSuccessfullyWith(files['http://127.0.0.1/amocrm_deploy/templates/CallStatus.twig']);

                        Promise.runAll();
                        userMedia.allowMediaInput();
                        Promise.runAll();


                        var request = sip.recentRequest().
                            expectToHaveMethod('INVITE').
                            expectToHaveServerName('sip:74951234567@vo19.uiscom.ru').
                            expectHeaderToContain('From', '"Dar`ya Rahvalova (amoCRM)" <sip:082481@vo19.uiscom.ru>').
                            expectHeaderToContain('To', '<sip:74951234567@vo19.uiscom.ru>');
                            
                        var response = request.response().
                            setTrying().
                            copyHeader('Contact');
                        response.send();

                        request.response().
                            setToTag(response.getToTag()).
                            setRinging().
                            copyHeader('Contact').
                            send();

                        request.response().
                            setToTag(response.getToTag()).
                            copyHeader('Contact').
                            setBody('v=0').
                            send();
                    });

                    it('Источники потоков не определены.', function() {
                        localStream().expectNotToHaveSource();
                        remoteStream().expectNotToHaveSource();
                    });
                    describe('Получено сообщение о принятии исходящего звонка.', function() {
                        beforeEach(function() {
                            Promise.runAll();

                            sip.recentRequest().
                                expectToHaveMethod('ACK').
                                expectHeaderToContain('From',
                                    '"Dar`ya Rahvalova (amoCRM)" <sip:082481@vo19.uiscom.ru>').
                                expectHeaderToContain('To', '<sip:74951234567@vo19.uiscom.ru>');
                        });

                        it('Нажимаю на кнопку завершения звонка. RTC соединение разорвано.', function() {
                            hangUpButton.click();

                            sip.recentRequest().expectToHaveMethod('BYE').response().send();
                            spendTime(10);

                            rtcConnectionsMock.getConnectionAtIndex(0).expectToBeClosed();
                        });
                        it('Источники потоков определены.', function() {
                            localStream().expectToHaveSource();
                            remoteStream().expectToHaveSource();
                        });
                        it('В виджете отображается номер, на который совершается звонок.', function() {
                            outgoingCallContactInformation.expectToHaveTextContent('Исходящий звонок: 74951234567');
                        });
                        describe(
                            'Сообщение о входящем звонке по SIP-протоколу не пришло. Из веб-сокета получено ' +
                            'сообщение о входящем звонке на мобльник.',
                        function() {
                            beforeEach(function() {
                                webSockets.getSocket('wss://va.uiscom.ru:443/crm_websocket').receiveMessage({
                                    event: 'notify',
                                    type: 'call',
                                    data: {
                                        ani: '79161234567',
                                        comagic_context: {
                                            site: 'zakzak.ucoz.net',
                                            search_query: null,
                                            campaign: 'dokhera'
                                        },
                                        customer: {
                                            company_name: 'UIS',
                                            person_name: 'Ivanov Ivan Ivanovich',
                                            id: 382030
                                        },
                                        did: '74951250516',
                                        start_time: 1565166168
                                    }
                                });

                                ajax.recentRequest().
                                    expectToHavePath('/amocrm_deploy/templates/IncomingCall.twig').
                                    expectToHaveMethod('GET').
                                    respondSuccessfullyWith(
                                        files['http://127.0.0.1/amocrm_deploy/templates/IncomingCall.twig']
                                    );
                                spendTime(10);
                            });

                            it('Нажимаю на кнопку "Закрыть". Панель входящего звонка скрыта.', function() {
                                closeButton.click();

                                incomingCallWidget.expectToBeHidden();
                                outgoingCallWidget.expectToBeVisible();
                            });
                            it(
                                'Кнопки "Ответить" и "Отклонить" скрыты, а кнопки "Открыть контакт" и "Закрыть" ' +
                                'видимы.',
                            function() {
                                answerButton.expectToBeHidden();
                                declineButton.expectToBeHidden();
                                openContactButton.expectToBeVisible();
                                closeButton.expectToBeVisible();
                            });
                            it('Звонящий абонент положил трубку.', function() {
                                webSockets.getSocket('wss://va.uiscom.ru:443/crm_websocket').receiveMessage({
                                    event: 'notify',
                                    type: 'release_call'
                                });

                                incomingCallWidget.expectToBeHidden();
                                outgoingCallWidget.expectToBeVisible();
                            });
                            it('Нажимаю на кнопку "Открыть контакт".  Открывается страница контакта.', function() {
                                openContactButton.click();
                                spendTime(10);

                                window.AMOCRM.router.expectToHaveUrl('/contacts/detail/382030');
                            });
                        });
                    });
                });
                describe('Сервер закрыл сокет. Прошло шесть секунд. Не пытаюсь подключиться заново.', function() {
                    beforeEach(function() {
                        webSockets.getSocket('wss://va.uiscom.ru:443/crm_websocket').disconnect();
                        spendTime(6000);
                    });

                    it('Установлено состояние "Оффлайн" переключателя.', function() {
                        onlineSwitcher.expectToHaveClass('cmg-switcher__off');
                    });
                    it('Открываю другую вкладку с виджетом. Иконка с трубкой отображается.', function() {
                        localStorage.setItemInAnotherTab('uis_amo_tab_v2_qwe123', 'false:1565166168');
                        expect(JSON.parse(localStorage.getItem('uis_amo_sip_state_change')).value).toBe(true);
                    });
                });
                describe((
                    'Получено сообщение о входящем звонке по SIP-протоколу. Получено сообщение без данных ' +
                    'звонящего. Отправлено SIP-сообщение о том, что телефон зазвонил.'
                ), function() {
                    beforeEach(function() {
                        sip.request().
                            setServerName('vo19.uiscom.ru').
                            setMethod('INVITE').
                            setCallReceiverName('Dar`ya Rahvalova (amoCRM)').
                            setCallReceiverLogin('082481').
                            setSdpType().
                            addHeader('From: <sip:79161234567@132.121.82.37:5060;user=phone>').
                            addHeader('Contact: <sip:79161234567@132.121.82.37:5060;user=phone>').
                            setBody(
                                'v=0',
                                'o=bell 53655765 2353687637 IN IР4 12.3.4.5',
                                'c=IN IP4 kton.bell-tel.com',
                                'm=audio 3456 RTP/AVP 0345'
                            ).
                            receive();
                        
                        sip.recentResponse().expectTrying();
                        sip.recentResponse().expectRinging();

                        webSockets.getSocket('wss://va.uiscom.ru:443/crm_websocket').receiveMessage({
                            event: 'notify',
                            type: 'call',
                            data: {
                                ani: '79161234567',
                                comagic_context: {
                                    site: null,
                                    search_query: null,
                                    campaign: null
                                },
                                customer: {
                                    company_name: null,
                                    person_name: null,
                                    id: null
                                },
                                did: '74951250516',
                                start_time: 1565166168
                            }
                        });

                        ajax.recentRequest().
                            expectToHavePath('/amocrm_deploy/templates/IncomingCall.twig').
                            expectToHaveMethod('GET').
                            respondSuccessfullyWith(files[
                                'http://127.0.0.1/amocrm_deploy/templates/IncomingCall.twig'
                            ]);
                        
                        spendTime(50);

                        ajax.recentRequest().
                            expectToHavePath('/amocrm_deploy/templates/CallStatus.twig').
                            expectToHaveMethod('GET').
                            respondSuccessfullyWith(files['http://127.0.0.1/amocrm_deploy/templates/CallStatus.twig']);

                        ajax.recentRequest().
                            expectToHavePath('/amocrm_deploy/templates/CallStatus.twig').
                            expectToHaveMethod('GET').
                            respondSuccessfullyWith(files['http://127.0.0.1/amocrm_deploy/templates/CallStatus.twig']);
                    });

                    it('Отображен номер, телефона с которого производится звонок.', function() {
                        abonentInformationBlock.expectToHaveTextContent((
                            'Входящий звонок : 79161234567'
                        ));
                    });
                    it('Нажимаю на иконку с трубкой. Виджет видим.', function() {
                        clickPhoneIcon();
                        views().expectSomeViewsToBeVisible();
                    });
                });
                describe((
                    'Получено сообщение о входящем звонке по SIP-протоколу. Получено сообщение с данными ' +
                    'звонящего. Отправлено SIP-сообщение о том, что телефон зазвонил.'
                ), function() {
                    beforeEach(function() {
                        sip.request().
                            setServerName('vo19.uiscom.ru').
                            setMethod('INVITE').
                            setCallReceiverName('Dar`ya Rahvalova (amoCRM)').
                            setCallReceiverLogin('082481').
                            setSdpType().
                            addHeader('From: <sip:79161234567@132.121.82.37:5060;user=phone>').
                            addHeader('Contact: <sip:79161234567@132.121.82.37:5060;user=phone>').
                            setBody(
                                'v=0',
                                'o=bell 53655765 2353687637 IN IР4 12.3.4.5',
                                'c=IN IP4 kton.bell-tel.com',
                                'm=audio 3456 RTP/AVP 0345'
                            ).
                            receive();
                        
                        sip.recentResponse().expectTrying();
                        sip.recentResponse().expectRinging();

                        webSockets.getSocket('wss://va.uiscom.ru:443/crm_websocket').receiveMessage({
                            event: 'notify',
                            type: 'call',
                            data: {
                                ani: '79161234567',
                                comagic_context: {
                                    site: 'zakzak.ucoz.net',
                                    search_query: null,
                                    campaign: 'dokhera'
                                },
                                customer: {
                                    company_name: 'UIS',
                                    person_name: 'Ivanov Ivan Ivanovich',
                                    id: 382030
                                },
                                did: '74951250516',
                                start_time: 1565166168
                            }
                        });

                        ajax.recentRequest().
                            expectToHavePath('/amocrm_deploy/templates/IncomingCall.twig').
                            expectToHaveMethod('GET').
                            respondSuccessfullyWith(files[
                                'http://127.0.0.1/amocrm_deploy/templates/IncomingCall.twig'
                            ]);
                        
                        spendTime(50);

                        ajax.recentRequest().
                            expectToHavePath('/amocrm_deploy/templates/CallStatus.twig').
                            expectToHaveMethod('GET').
                            respondSuccessfullyWith(files[
                                'http://127.0.0.1/amocrm_deploy/templates/CallStatus.twig'
                            ]);

                        ajax.recentRequest().
                            expectToHavePath('/amocrm_deploy/templates/CallStatus.twig').
                            expectToHaveMethod('GET').
                            respondSuccessfullyWith(files[
                                'http://127.0.0.1/amocrm_deploy/templates/CallStatus.twig'
                            ]);

                    });

                    it('В виджете отображены данные звонящего абонента.', function() {
                        abonentInformationBlock.expectToHaveTextContent((
                            'Входящий звонок : 79161234567 Ivanov Ivan Ivanovich , UIS Сайт: zakzak.ucoz.net ' +
                            'Рекламная кампания: dokhera'
                        ));
                    });
                    it(
                        'Кнопки "Ответить", "Отклонить" и "Открыть контакт" видимы, а кнопка "Закрыть" скрыта.',
                    function() {
                        openContactButton.expectToBeVisible();
                        answerButton.expectToBeVisible();
                        declineButton.expectToBeVisible();
                        closeButton.expectToBeHidden();
                    });
                    it((
                        'Нажимаю на кнопку "Открыть контакт". Открывается окно контакта с телефоном, с которого ' +
                        'был произведен звонок.'
                    ), function() {
                        openContactButton.click();

                        rtcConnectionsMock.getConnectionAtIndex(0).connect();
                        Promise.runAll();

                        userMedia.allowMediaInput();
                        Promise.runAll();

                        rtcConnectionsMock.getConnectionAtIndex(0).addCandidate();
                        Promise.runAll();

                        sip.recentResponse().
                            expectOk().
                            request().
                            setServerName('vo19.uiscom.ru').
                            setMethod('ACK').
                            setCallReceiverName('Dar`ya Rahvalova (amoCRM)').
                            setCallReceiverLogin('082481').
                            receive();

                        ajax.recentRequest().
                            expectToHavePath('/amocrm_deploy/templates/InCall.twig').
                            expectToHaveMethod('GET').
                            respondSuccessfullyWith(files['http://127.0.0.1/amocrm_deploy/templates/InCall.twig']);

                        window.AMOCRM.router.expectToHaveUrl('/contacts/detail/382030');
                    });
                    describe((
                        'Нажимаю на кнопку "Ответить". Установлено WebRTC-соединение. В веб-сокет отправлен ' +
                        'SIP-ответ с сообщением о принятии звонка.'
                    ), function() {
                        beforeEach(function() {
                            answerButton.click();
                            rtcConnectionsMock.getConnectionAtIndex(0).connect();
                            Promise.runAll();

                            userMedia.allowMediaInput();
                            Promise.runAll();

                            rtcConnectionsMock.getConnectionAtIndex(0).addCandidate();
                            Promise.runAll();

                            sip.recentResponse().
                                expectOk().
                                request().
                                setServerName('vo19.uiscom.ru').
                                setMethod('ACK').
                                setCallReceiverName('Dar`ya Rahvalova (amoCRM)').
                                setCallReceiverLogin('082481').
                                receive();

                            ajax.recentRequest().
                                expectToHavePath('/amocrm_deploy/templates/InCall.twig').
                                expectToHaveMethod('GET').
                                respondSuccessfullyWith(files[
                                    'http://127.0.0.1/amocrm_deploy/templates/InCall.twig'
                                ]);
                        });
                        
                        it('В виджете отображена длительность разговора.', function() {
                            talkTimeBlock.expectToHaveTextContent('00:00');
                        });
                        it((
                            'Нажимаю на кнопку завершения разговора. В веб-сокет отправлен SIP-запрос с ' +
                            'сообщением о завершении разговора.'
                        ), function() {
                            hangUpButton.click();

                            ajax.recentRequest().
                                expectToHavePath('/amocrm_deploy/templates/Dialpad.twig').
                                expectToHaveMethod('GET').
                                respondSuccessfullyWith(files[
                                    'http://127.0.0.1/amocrm_deploy/templates/Dialpad.twig'
                                ]);

                            sip.recentRequest().expectToHaveMethod('BYE').response().send();
                            spendTime(10);

                            talkWidget.expectToBeHidden();
                        });
                    });
                });
            });
        });
    });
});
