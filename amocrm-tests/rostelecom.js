tests.addTest(function (
    ajax, testersFactory, wait, spendTime, utils, windowOpener, webSockets, webSocketLogger, userMedia,
    rtcConnectionsMock, navigatorMock, timeoutLogger, registerFiles, setup, Sip, files, PhoneActionModel,
    modalWindow
) {
    webSocketLogger.disable();
    timeoutLogger.disable();

    describe('Открываю окно настроек виджета Rostelecom.', function() {
        var sip,
            setSettingsParam,
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

        var getSaveButtonElement = function () {
            return document.querySelector('.js-widget-save');
        };

        var saveButton = testersFactory.createDomElementTester(getSaveButtonElement);

        var getIsAgreementConfirmedField = function () {
            return document.querySelector('input[name=is_agreement_confirmed]');
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

        describe('Открываю окно настройки. Чекбокс соглашения не был отмечен ранее.', function() {
            var saved;

            beforeEach(function() {
                var result = setup(ajax);

                clickPhoneIcon = result.clickPhoneIcon;
                clickPhoneIcon = result.clickPhoneIcon;
                notifications = result.notifications;
                widgetActions = result.widgetActions;
                i18n = result.i18n;
                widget = result.widget;
                userData = result.userData;
                errorNotifications = result.errorNotifications;

                modalWindow(i18n).setRostelecom().show();
                spendTime(1000);

                widget.callbacks.settings($('.widget-settings__modal .modal-body'));

                ajax.recentRequest().
                    expectToHavePath('/amocrm-widget/templates/Settings.twig').
                    expectToHaveMethod('GET').
                    respondSuccessfullyWith(files['/amocrm-widget/templates/Settings.twig']);
                
                spendTime(1000);

                saved = false;

                getSaveButtonElement().addEventListener('click', function () {
                    if (
                        getSaveButtonElement().classList.contains('button-input-disabled') ||
                        getSaveButtonElement().hasAttribute('disabled')
                    ) {
                        return;
                    }

                    var value = Promise.resolve(widget.callbacks.onSave({
                        fields: {
                            is_agreement_confirmed: getIsAgreementConfirmedField().value,
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

            afterEach(function() {
                errorNotifications.expectToHaveNoError();
            });

            describe('Отмечаю чекбокс соглашения.', function() {
                beforeEach(function() {
                    agreementCheckbox.click();
                });

                it(
                    'Нажимаю на кнопку сохранения. Отправлен запрос создания аккаунта. Отображено сообщение об ' +
                    'успешном подключении интеграции.',
                function() {
                    saveButton.click();

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
                                    app: 'rostelecom',
                                    service: 'amo',
                                    subdomain: 'comagicwidgets',
                                    domain: 'comagicwidgets.amocrm.ru',
                                    email: 'darya.simha@gmail.com',
                                    phone: '79252117620',
                                    name: 'Darya Simha',
                                    user_id: 2851135,
                                    widget_type: 'rostelecom'
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
                                    app: 'rostelecom',
                                    service: 'amo',
                                    subdomain: 'comagicwidgets',
                                    domain: 'comagicwidgets.amocrm.ru',
                                    email: 'darya.simha@gmail.com',
                                    phone: '79252117620',
                                    name: 'Darya Simha',
                                    user_id: 2851135,
                                    widget_type: 'rostelecom'
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

                    settingsInformationBlock.expectToHaveTextContent(
                        'Вы успешно подключили интеграцию с amoCRM. Аккаунт в amoCRM - ' +
                        'comagicwidgets'
                    );
                });
                it('Кнопка сохранения доступна.', function() {
                    saveButton.expectNotToHaveClass('button-input-disabled');
                });
            });
            it('Кнопка сохранения заблокирована. Чекбокс не отмечен.', function() {
                if (document.querySelector('#cmg_cb_agreement').checked) {
                    throw new Error('Чекбокс не должен быть отмечен.');
                }

                saveButton.expectToHaveClass('button-input-disabled');
            });
        });
        it(
            'Открываю окно настройки. Чекбокс соглашения был отмечен ранее. Кнопка сохранения доступна. Чекбокс ' +
            'отмечен.',
        function() {
            var result = setup(ajax);

            setSettingsParam = result.setSettingsParam;
            i18n = result.i18n;
            widget = result.widget;
            errorNotifications = result.errorNotifications;

            setSettingsParam('is_agreement_confirmed', '1');

            modalWindow(i18n).setRostelecom().setAgreementConfirmed().show();
            spendTime(1000);

            widget.callbacks.settings($('.widget-settings__modal .modal-body'));

            ajax.recentRequest().
                expectToHavePath('/amocrm-widget/templates/Settings.twig').
                expectToHaveMethod('GET').
                respondSuccessfullyWith(files['/amocrm-widget/templates/Settings.twig']);
            
            spendTime(1000);

            if (!document.querySelector('#cmg_cb_agreement').checked) {
                throw new Error('Чекбокс должен быть отмечен.');
            }

            saveButton.expectNotToHaveClass('button-input-disabled');
            errorNotifications.expectToHaveNoError();
        });
    });
});
