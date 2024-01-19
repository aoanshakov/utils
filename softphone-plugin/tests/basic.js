tests.addTest(options => {
    const {
        Tester,
        notificationTester,
        spendTime,
        postMessages,
    } = options;

    describe('Включено расширение Chrome.', function() {
        let tester;

        afterEach(function() {
            tester.chrome.
                tabs.
                current.
                nextMessage().
                expectNotToExist();

            tester.chrome.
                runtime.
                background.
                nextMessage().
                expectNotToExist();

            tester.chrome.
                runtime.
                popup.
                nextMessage().
                expectNotToExist();

            tester.chrome.
                identity.
                authFlow.
                nextLaunching().
                expectNotToExist();
        });

        describe('Открываю попап. Отправлен запрос состояния.', function() {
            let visibilityRequest,
                visibilitySettingRequest;

            beforeEach(function() {
                tester = new Tester({
                    application: 'popup',
                    ...options,
                });

                visibilityRequest = tester.visibilityRequest().expectToBeSent();
                visibilitySettingRequest = tester.visibilitySettingRequest();
            });

            describe('Получен ответ.', function() {
                beforeEach(function() {
                    visibilityRequest.receiveResponse();
                });

                describe('Софтфон видим.', function() {
                    beforeEach(function() {
                        visibilitySettingRequest.visible().expectResponseToBeSent();
                    });

                    describe('Нажимаю на кнопку "Войти.', function() {
                        let permissionsRequest;

                        beforeEach(function() {
                            tester.button('Войти').click();

                            permissionsRequest = tester.chrome.
                                permissions.
                                nextRequest().
                                expectHostPermissionToBeRequested('https://uc-sso-prod-api.uiscom.ru/*');
                        });

                        it(
                            'Получен доступ к хосту авторизации. Отправлен запрос получения кода авторизации.',
                        function() {
                            permissionsRequest.grant();
                            tester.authorizationRequest().receiveResponse();
                        });
                        it(
                            'Доступ к хосту авторизации отклонен. Запрос получения кода авторизации не был отправлен.',
                        function() {
                            permissionsRequest.deny();
                        });
                    });
                    it('Нажимаю на кнопку "Скрыть софтфон". Отправлен запрос изменения видимости.', function() {
                        tester.button('Скрыть софтфон').click();
                        tester.toggleWidgetVisibilityRequest().receiveResponse();
                    });
                });
                it('Софтфон скрыт. Отображена кнопка "Показать софтфон".', function() {
                    visibilitySettingRequest.expectResponseToBeSent();

                    tester.button('Выйти').expectNotToExist();
                    tester.button('Показать софтфон').expectToBeVisible();
                });
            });
            it('Не удалось отправить сообщение. Отображено сообщение об ошибке.', function() {
                visibilityRequest.fail();
                tester.body.expectTextContentToHaveSubstring('Произошла ошибка');
            });
            it('Отображен спиннер.', function() {
                tester.body.expectToHaveTextContent('Загрузка...');
            });
        });
        describe('Открыт IFrame.', function() {
            beforeEach(function() {
                tester = new Tester({
                    application: 'iframeContent',
                    softphoneHost: 'my.uiscom.ru',
                    ...options,
                });

                postMessages.nextMessage().expectMessageToContain({
                    method: 'set_visibility',
                    data: false,
                });
            });

            describe('Получен запрос изменения видимости софтфофона.', function() {
                beforeEach(function() {
                    postMessages.receive({
                        method: 'toggle_widget_visibility',
                    });
                    
                    postMessages.nextMessage().expectMessageToContain({
                        method: 'set_visibility',
                        data: true,
                    });
                });

                describe('Получен токен авторизации. Произведена авторизация.', function() {
                    beforeEach(function() {
                        postMessages.receive({
                            method: 'set_token',
                            data: '23f8DS8sdflsdf8DslsdfLSD0ad31Ffsdf',
                        });

                        tester.masterInfoMessage().receive();

                        tester.slavesNotification().
                            additional().
                            visible().
                            expectToBeSent();

                        tester.slavesNotification().expectToBeSent();
                        tester.masterInfoMessage().tellIsLeader().expectToBeSent();
                            
                        tester.authTokenRequest().receiveResponse()
                        tester.authCheckRequest().receiveResponse();
                        tester.talkOptionsRequest().receiveResponse();
                        tester.permissionsRequest().receiveResponse();
                        tester.statusesRequest().receiveResponse();
                        tester.settingsRequest().receiveResponse();

                        tester.slavesNotification().
                            twoChannels().
                            enabled().
                            expectToBeSent();

                        notificationTester.grantPermission();
                    });

                    describe('Произведено подключение к серверам.', function() {
                        beforeEach(function() {
                            tester.connectEventsWebSocket();

                            tester.slavesNotification().
                                twoChannels().
                                enabled().
                                softphoneServerConnected().
                                expectToBeSent();

                            tester.connectSIPWebSocket();

                            tester.slavesNotification().
                                twoChannels().
                                softphoneServerConnected().
                                webRTCServerConnected().
                                expectToBeSent();

                            authenticatedUserRequest = tester.authenticatedUserRequest().expectToBeSent();
                            tester.registrationRequest().receiveResponse();

                            tester.slavesNotification().
                                twoChannels().
                                softphoneServerConnected().
                                webRTCServerConnected().
                                registered().
                                expectToBeSent();

                            authenticatedUserRequest.receiveResponse();

                            tester.slavesNotification().
                                twoChannels().
                                softphoneServerConnected().
                                webRTCServerConnected().
                                registered().
                                userDataFetched().
                                expectToBeSent();
                        });

                        it('Доступ к микрофону запрещён. Отображено сообщение о недоступности микрофона.', function() {
                            tester.disallowMediaInput();

                            tester.slavesNotification().
                                twoChannels().
                                enabled().
                                softphoneServerConnected().
                                webRTCServerConnected().
                                userDataFetched().
                                microphoneAccessDenied().
                                registered().
                                expectToBeSent();

                            tester.softphone.expectToHaveTextContent(
                                'Микрофон не обнаружен ' +
                                'Подключите микрофон или разрешите доступ к микрофону для сайта'
                            );
                        });
                        it('Доступ к микрофону разрешён. Софтфон готов к использованию.', function() {
                            tester.allowMediaInput();

                            tester.slavesNotification().
                                twoChannels().
                                available().
                                expectToBeSent();

                            tester.phoneField.expectToBeVisible();
                        });
                    });
                    it('Отображено сообщение об установки соединения.', function() {
                        tester.getEventsWebSocket().expectToBeConnecting();
                        tester.softphone.expectToHaveTextContent('Устанавливается соединение...');
                    });
                });
                it('Отображено сообщение о том, что софтофон не авторизован.', function() {
                    tester.softphone.expectToHaveTextContent(
                        'Не авторизован ' +
                        'Для использования софтфона необходимо авторизоваться'
                    );
                });
            });
            it('Софтфон скрыт.', function() {
                tester.softphone.expectNotToExist();
            });
        });
        describe('Токен авторизации не был сохранен.', function() {
            let authenticatedUserRequest;

            beforeEach(function() {
                tester = new Tester({
                    softphoneHost: 'my.uiscom.ru',
                    ...options,
                });

                postMessages.nextMessage().expectMessageToContain({
                    method: 'set_token',
                    data: '',
                });
            });

            it(
                'От IFrame получено сообщение изменения видимости. В popup-скрипт отправлено сообщение об изменении ' +
                'видимости.',
            function() {
                postMessages.receive({
                    method: 'set_visibility',
                    data: true,
                });

                tester.visibilitySettingRequest().
                    visible().
                    receiveResponse();

                postMessages.nextMessage().expectMessageToContain({
                    method: 'set_token',
                    data: '',
                });
            });
            it('Получен токен авторизации. Токен авторизации передан в IFrame.', function() {
                tester.chrome.
                    storage.
                    local.
                    set({
                        token: '23f8DS8sdflsdf8DslsdfLSD0ad31Ffsdf',
                    });

                postMessages.nextMessage().expectMessageToContain({
                    method: 'set_token',
                    data: '23f8DS8sdflsdf8DslsdfLSD0ad31Ffsdf',
                });
            });
            it('Получаю запрос изменения видимости. В IFrame отправлен запрос изменения видимости.', function() {
                tester.toggleWidgetVisibilityRequest().expectResponseToBeSent();

                postMessages.nextMessage().expectMessageToContain({
                    method: 'toggle_widget_visibility'
                });
            });
            it('Получен запрос состояния. В ответ на запрос было отправлено текущее состояние.', function() {
                tester.visibilityRequest().expectResponseToBeSent();
                tester.visibilitySettingRequest().receiveResponse();
            });
        });
        describe('Софтфон авторизован. Получен запрос выхода. Производится выход.', function() {
            let oauthRequest;

            beforeEach(function() {
                tester = new Tester({
                    application: 'background',
                    isAuthorized: true,
                    ...options,
                });

                tester.logoutRequest().expectResponseToBeSent();

                tester.authFlow().
                    logout().
                    expectToBeLaunched().
                    receiveResponse();

                oauthRequest = tester.oauthRequest().expectToBeSent();
            });

            it('Получен новый токен авторизации. Токен сохранен.', function() {
                oauthRequest.receiveResponse();

                tester.chrome.
                    storage.
                    local.
                    expectToContain({
                        token: '23f8DS8sdflsdf8DslsdfLSD0ad31Ffsdf',
                    });
            });
            it('Токен авторизации удалён.', function() {
                tester.chrome.
                    storage.
                    local.
                    expectToContain({
                        token: '',
                    });
            });
        });
        describe('Открываю background-скрипт.', function() {
            beforeEach(function() {
                tester = new Tester({
                    application: 'background',
                    ...options,
                });
            });
            
            it(
                'Приходит запрос авторизации. Открыта форма авторизации. Получен код авторизации. Получен ' +
                'авторизационный токен. В текущей вкладке установлен авторизационный токен. В хранилище сохранено ' +
                'состояние вкладки.',
            function() {
                tester.authorizationRequest().expectResponseToBeSent();

                tester.authFlow().
                    expectToBeLaunched().
                    receiveResponse();

                tester.oauthRequest().receiveResponse();

                tester.chrome.
                    storage.
                    local.
                    expectToContain({
                        token: '23f8DS8sdflsdf8DslsdfLSD0ad31Ffsdf',
                    });
            });
            it('Приходит запрос, не являющийся запросом авторизации. Авторизация не производится.', function() {
                tester.visibilitySettingRequest().expectResponseToBeSent();
            });
        });
        describe('Открываю попап. Отправлен запрос состояния.', function() {
            beforeEach(function() {
                tester = new Tester({
                    application: 'popup',
                    isAuthorized: true,
                    ...options,
                });

                tester.visibilityRequest().receiveResponse();
                tester.visibilitySettingRequest().expectResponseToBeSent();
            });

            it('Нажимаю на кнопку выхода. Отправлен запрос выхода.', function() {
                tester.button('Выйти').click();

                tester.chrome.
                    permissions.
                    nextRequest().
                    expectHostPermissionToBeRequested('https://uc-sso-prod-api.uiscom.ru/*').
                    grant();

                tester.logoutRequest().receiveResponse();
            });
            it('Кнопка входа скрыта.', function() {
                tester.button('Войти').expectNotToExist();
            });
        });
        it('Токен авторизации был сохранен. В IFrame отправлен токен.', function() {
            tester = new Tester({
                softphoneHost: 'my.uiscom.ru',
                isAuthorized: true,
                ...options,
            });

            postMessages.nextMessage().expectMessageToContain({
                method: 'set_token',
                data: '23f8DS8sdflsdf8DslsdfLSD0ad31Ffsdf',
            });
        });
    });
});
