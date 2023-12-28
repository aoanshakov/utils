tests.addTest(options => {
    const {
        Tester,
        ajax,
        notificationTester,
        spendTime,
        utils,
    } = options;

    describe('Открываю попап. Отправлен запрос состояния.', function() {
        let tester,
            stateRequest;

        beforeEach(function() {
            tester = new Tester({
                application: 'popup',
                ...options,
            });

            stateRequest = tester.stateRequest().expectToBeSent();
        });

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
                identity.
                authFlow.
                nextLaunching().
                expectNotToExist();
        });

        describe('Софтфон скрыт.', function() {
            beforeEach(function() {
                stateRequest.receiveResponse();
            });

            describe('Нажимаю на кнопку "Войти". Отправлен запрос получения кода авторизации.', function() {
                beforeEach(function() {
                    tester.button('Войти').click();
                    tester.authorizationRequest().receiveResponse();
                });

                describe('Авторизация завершена.', function() {
                    let stateRequest;

                    beforeEach(function() {
                        tester.chrome.
                            storage.
                            local.
                            set({
                                '5829373782': JSON.stringify({
                                    isAuthorizing: false,
                                }),
                            })

                        stateRequest = tester.stateRequest().expectToBeSent();
                    });

                    it('Софтфон авторизован. Кнопка "Войти" скрыта.', function() {
                        stateRequest.
                            authorized().
                            receiveResponse();

                        tester.button('Войти').expectNotToExist();
                    });
                    it('Софтон не авторизован. Кнопка "Войти" доступна.', function() {
                        stateRequest.receiveResponse();
                        tester.button('Войти').expectToBeEnabled();
                    });
                });
                it('Кнопка "Войти" заблокирована.', function() {
                    tester.button('Войти').expectToBeDisabled();
                });
            });
            it('Нажимаю на кнопку "Показать софтфон". Отображена кнопка "Скрыть софтфон".', function() {
                tester.button('Показать софтфон').click();

                tester.toggleWidgetVisibilityRequest().
                    visible().
                    receiveResponse();

                tester.button('Скрыть софтфон').expectToBeVisible();
            });
        });
        describe('Проходит некоторое время. Запрос состояния отправлен ещё раз.', function() {
            beforeEach(function() {
                spendTime(1000);
                stateRequest = tester.stateRequest().expectToBeSent();
            });

            it('Проходит некоторое время. Запрос состояния отправлен ещё раз.', function() {
                spendTime(1000);
                tester.stateRequest().expectToBeSent();
            });
            it('Получен ответ. Состояние страницы изменилось.', function() {
                stateRequest.
                    visible().
                    receiveResponse();

                tester.button('Скрыть софтфон').expectToBeVisible();
                spendTime(1000);
            });
        });
        it('Софтфон авторизован. Кнопка авторизации скрыта.', function() {
            stateRequest.
                authorized().
                receiveResponse();

            tester.button('Войти').expectNotToExist();
        });
        it('Софтфон видим. Нажимаю на кнопку "Скрыть софтфон". Отображена кнопка "Показать софтфон".', function() {
            stateRequest.
                visible().
                receiveResponse();

            tester.button('Скрыть софтфон').click();
            tester.toggleWidgetVisibilityRequest().receiveResponse();

            tester.button('Показать софтфон').expectToBeVisible();
            spendTime(1000);
        });
        it('Отображен спиннер.', function() {
            tester.body.expectToHaveTextContent('Загрузка...');
        });
    });
    describe('Токен авторизации не был сохранен.', function() {
        let authenticatedUserRequest,
            tester;

        beforeEach(function() {
            tester = new Tester({
                softphoneHost: 'my.uiscom.ru',
                ...options,
            });
        });

        it(
            'Получен токен авторизации. Производится инициализация софтфона. Получен запрос состояния. Отправлено ' +
            'текущее состояние. Получено сообщение о необходимости показать виджет. Виджет видим.',
        function() {
            tester.tokenSettingRequest().
                authorized().
                expectResponseToBeSent();

            tester.masterInfoMessage().receive();
            tester.slavesNotification().additional().expectToBeSent();
            tester.slavesNotification().expectToBeSent();
            tester.masterInfoMessage().tellIsLeader().expectToBeSent();

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

            tester.allowMediaInput();

            tester.slavesNotification().
                twoChannels().
                softphoneServerConnected().
                webRTCServerConnected().
                registered().
                microphoneAccessGranted().
                expectToBeSent();

            authenticatedUserRequest.receiveResponse();

            tester.slavesNotification().
                twoChannels().
                available().
                expectToBeSent();

            tester.toggleWidgetVisibilityRequest().
                visible().
                authorized().
                expectResponseToBeSent();

            tester.slavesNotification().
                additional().
                visible().
                expectToBeSent();

            tester.phoneField.expectToBeVisible();
            tester.authToken.expectToBeSaved();
        });
        it(
            'Получен запрос изменения видимости виджета. Отображено сообщение о том, что софтофон не авторизован.',
        function() {
            tester.toggleWidgetVisibilityRequest().
                visible().
                expectResponseToBeSent();

            tester.softphone.expectToHaveTextContent(
                'Не авторизован ' +
                'Для использования софтфона необходимо авторизоваться'
            );
        });
        it('Получен запрос состояния. В ответ на запрос было отправлено текущее состояние.', function() {
            tester.stateRequest().expectResponseToBeSent();
        });
    });
    describe('Открываю background-скрипт.', function() {
        let tester;

        beforeEach(function() {
            tester = new Tester({
                application: 'background',
                ...options,
            });
        });
        
        describe('Приходит запрос авторизации. Открыта форма авторизации.', function() {
            let authFlow;

            beforeEach(function() {
                tester.authorizationRequest().expectResponseToBeSent();
                authFlow = tester.authFlow().expectToBeLaunched();
            });

            describe('Получен код авторизации.', function() {
                let oauthRequest;

                beforeEach(function() {
                    authFlow.receiveResponse();
                    oauthRequest = tester.oauthRequest().expectToBeSent();
                });

                describe('Получен авторизационный токен.', function() {
                    let tokenSettingRequest;

                    beforeEach(function() {
                        oauthRequest.receiveResponse();
                        tokenSettingRequest = tester.tokenSettingRequest().expectToBeSent();
                    });

                    it(
                        'В текущей вкладке установлен авторизационный токен. В хранилище сохранено состояние вкладки.',
                    function() {
                        tokenSettingRequest.
                            authorized().
                            receiveResponse();

                        tester.chrome.
                            storage.
                            local.
                            expectToContain({
                                '5829373782': utils.expectJSONToContain({
                                    isAuthorizing: false,
                                }),
                            });
                    });
                    it('В хранилище сохранено состояние вкладки.', function() {
                        tester.chrome.
                            storage.
                            local.
                            expectToContain({
                                '5829373782': utils.expectJSONToContain({
                                    isAuthorizing: true,
                                }),
                            });
                    });
                });
                it('В хранилище сохранено состояние вкладки.', function() {
                    tester.chrome.
                        storage.
                        local.
                        expectToContain({
                            '5829373782': utils.expectJSONToContain({
                                isAuthorizing: true,
                            }),
                        });
                });
            });
            it('В хранилище сохранено состояние вкладки.', function() {
                tester.chrome.
                    storage.
                    local.
                    expectToContain({
                        '5829373782': utils.expectJSONToContain({
                            isAuthorizing: true,
                        }),
                    });
            });
        });
        it('Приходит запрос, не являющийся запросом авторизации. Ответ не был отправлен.', function() {
            tester.tokenSettingRequest().expectNoResponseToBeSent();
        });
    });
    it(
        'Токен авторизации был сохранен. Производится инициализация софтфона. Получен запрос состояния. ' +
        'Отправлено текущее состояние. Получено сообщение о необходимости показать виджет. Виджет видим.',
    function() {
        const tester = new Tester({
            softphoneHost: 'my.uiscom.ru',
            isAuthorized: true,
            ...options,
        });

        tester.masterInfoMessage().receive();
        tester.slavesNotification().additional().expectToBeSent();
        tester.slavesNotification().expectToBeSent();
        tester.masterInfoMessage().tellIsLeader().expectToBeSent();

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

        tester.allowMediaInput();

        tester.slavesNotification().
            twoChannels().
            softphoneServerConnected().
            webRTCServerConnected().
            registered().
            microphoneAccessGranted().
            expectToBeSent();

        authenticatedUserRequest.receiveResponse();

        tester.slavesNotification().
            twoChannels().
            available().
            expectToBeSent();

        tester.toggleWidgetVisibilityRequest().
            visible().
            authorized().
            expectResponseToBeSent();

        tester.slavesNotification().
            additional().
            visible().
            expectToBeSent();

        tester.phoneField.expectToBeVisible();
    });
    describe('Открываю попап. Происходит авторизация.', function() {
        let tester,
            stateRequest;

        beforeEach(function() {
            tester = new Tester({
                application: 'popup',
                ...options,
                storage: {
                    '5829373782': JSON.stringify({
                        isAuthorizing: true,
                    }),
                },
            });

            tester.stateRequest().receiveResponse();
        });

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
                identity.
                authFlow.
                nextLaunching().
                expectNotToExist();
        });

        it('Кнопка "Войти" заблокирована.', function() {
            tester.button('Войти').expectToBeDisabled();
        });
    });
});
