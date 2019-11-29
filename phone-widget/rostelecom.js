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

        describe('Открываю окно настройки.', function() {
            var saved;

            beforeEach(function() {
                var result = setup(ajax);

                clickPhoneIcon = result.clickPhoneIcon;
                notifications = result.notifications;
                widgetActions = result.widgetActions;
                i18n = result.i18n;
                widget = result.widget;
                userData = result.userData;
                errorNotifications = result.errorNotifications;

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

                document.querySelector('.js-widget-settings-desc-expander').style.display = 'none';
                document.querySelector('.widget-settings-block__desc-expander_hidden').classList.remove(
                    'widget-settings-block__desc-expander_hidden');
            });
            afterEach(function() {
                errorNotifications.expectToHaveNoError();
            });

            it('', function() {
            });
        });
    });
});
