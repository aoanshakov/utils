tests.addTest(options => {
    const {
        Tester,
        ajax,
        notificationTester,
        spendTime,
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
                identity.
                authFlow.
                nextLaunching().
                expectNotToExist();
        });

        describe('Софтфон скрыт.', function() {
            beforeEach(function() {
                stateRequest.receiveResponse();
            });

            describe('Нажимаю на кнопку "Авторизоваться". Отправлен запрос получения кода авторизации.', function() {
                let authorizationRequest,
                    authFlowLaunching;

                beforeEach(function() {
                    tester.button('Авторизоваться').click();

                    authFlowLaunching = tester.chrome.
                        identity.
                        authFlow.
                        nextLaunching().
                        expectDetailsToContain({
                            interactive: true,
                            url: 'https://uc-sso-prod-api.uiscom.ru' +
                                '/oauth2/authorize?' + 
                                'response_type=code&' +
                                'client_id=faaeopllmpfoeobihkiojkbhnlfkleik.chromiumapp.org&' +
                                'redirect_uri=https%3A%2F%2Ffaaeopllmpfoeobihkiojkbhnlfkleik.chromiumapp.org%2F',
                        });
                });

                describe('Получен код авторизации. Отправлен запрос авторизации.', function() {
                    beforeEach(function() {
                        authFlowLaunching.
                            receiveResponse(
                                'https://faaeopllmpfoeobihkiojkbhnlfkleik.chromiumapp.org/?code=28gjs8o24rfsd42',
                            );

                        authorizationRequest = tester.authorizationRequest().expectToBeSent();
                    });

                    describe('Получено уведомление о том, что производится авторизация.', function() {
                        beforeEach(function() {
                            authorizationRequest.
                                authorizing().
                                receiveResponse();
                        });

                        describe('Прошло некоторое время. Отправлен запрос сосотяния.', function() {
                            beforeEach(function() {
                                spendTime(1000);
                                stateRequest = tester.stateRequest().expectToBeSent();
                            });

                            it(
                                'Авторизация продолжает производиться. Прошло некоторое время. Отправлен запрос ' +
                                'сосотяния.',
                            function() {
                                stateRequest.
                                    authorizing().
                                    receiveResponse();

                                spendTime(1000);
                                spendTime(0);

                                tester.stateRequest().expectToBeSent();
                            });
                            it('Авторизация завершена. Кнопка "Авторизоваться" скрыта.', function() {
                                stateRequest.
                                    authorized().
                                    receiveResponse();

                                tester.button('Авторизоваться').expectNotToExist();
                                spendTime(1000);
                            });
                        });
                        it('Кнопка "Авторизоваться" заблокирована.', function() {
                            tester.button('Авторизоваться').expectToBeDisabled();
                        });
                    });
                    it(
                        'Получено уведомление о том, что авторизация не производится. Кнопка "Авторизоваться" ' +
                        'доступна.',
                    function() {
                        authorizationRequest.receiveResponse();

                        tester.button('Авторизоваться').expectToBeEnabled();
                        spendTime(1000);
                    });
                });
                it('Кнопка "Авторизоваться" заблокирована.', function() {
                    tester.button('Авторизоваться').expectToBeDisabled();
                    spendTime(1000);
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
        it('Софтфон видим. Нажимаю на кнопку "Скрыть софтфон". Отображена кнопка "Показать софтфон".', function() {
            stateRequest.
                visible().
                receiveResponse();

            tester.button('Скрыть софтфон').click();
            tester.toggleWidgetVisibilityRequest().receiveResponse();

            tester.button('Показать софтфон').expectToBeVisible();
            spendTime(1000);
        });
        it('Софтфон авторизован. Кнопка авторизации скрыта.', function() {
            stateRequest.
                authorized().
                receiveResponse();

            tester.button('Авторизоваться').expectNotToExist();
        });
        it('Отображен спиннер.', function() {
            tester.body.expectToHaveTextContent('Загрузка...');
        });
    });
    describe('Открываю вкладку.', function() {
        let authenticatedUserRequest,
            ticketsContactsRequest,
            tester;

        beforeEach(function() {
            tester = new Tester({
                softphoneHost: 'my.uiscom.ru',
                ...options,
            });
        });

        describe('Получен код авторизации. Отправлен запрос авторизации.', function() {
            let oauthRequest;

            beforeEach(function() {
                tester.authorizationRequest().
                    authorizing().
                    expectResponseToBeSent();

                oauthRequest = tester.oauthRequest().expectToBeSent();
            });

            it(
                'Получен токен авторизации. Производится инициализация софтфона. Получен запрос состояния. ' +
                'Отправлено текущее состояние. Получено сообщение о необходимости показать виджет. Виджет видим.',
            function() {
                oauthRequest.receiveResponse();

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
            it('Получен запрос состояния. Отправлено текущее состояние.', function() {
                tester.stateRequest().
                    authorizing().
                    expectResponseToBeSent();
            });
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
});
