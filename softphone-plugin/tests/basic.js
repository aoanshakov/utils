tests.addTest(options => {
    const {
        Tester,
        notificationTester,
        spendTime,
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
                identity.
                authFlow.
                nextLaunching().
                expectNotToExist();
        });

        describe('Открываю попап. Отправлен запрос состояния.', function() {
            let stateRequest;

            beforeEach(function() {
                tester = new Tester({
                    application: 'popup',
                    ...options,
                });

                stateRequest = tester.stateRequest().expectToBeSent();
            });

            describe('Софтфон скрыт.', function() {
                beforeEach(function() {
                    stateRequest.receiveResponse();
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

                    it('Получен доступ к хосту авторизации. Отправлен запрос получения кода авторизации.', function() {
                        permissionsRequest.grant();
                        tester.authorizationRequest().receiveResponse();
                    });
                    it(
                        'Доступ к хосту авторизации отклонен. Запрос получения кода авторизации не был отправлен.',
                    function() {
                        permissionsRequest.deny();
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
            it('Софтфон видим. Нажимаю на кнопку "Скрыть софтфон". Отображена кнопка "Показать софтфон".', function() {
                stateRequest.
                    visible().
                    receiveResponse();

                tester.button('Скрыть софтфон').click();
                tester.toggleWidgetVisibilityRequest().receiveResponse();

                tester.button('Показать софтфон').expectToBeVisible();
            });
            it('Не удалось отправить сообщение. Отображено сообщение об ошибке.', function() {
                stateRequest.fail();
                tester.body.expectTextContentToHaveSubstring('Произошла ошибка');
            });
            it('Отображен спиннер.', function() {
                tester.body.expectToHaveTextContent('Загрузка...');
            });
        });
        describe('Токен авторизации не был сохранен.', function() {
            let authenticatedUserRequest;

            beforeEach(function() {
                tester = new Tester({
                    softphoneHost: 'my.uiscom.ru',
                    ...options,
                });
            });

            describe('Получен запрос изменения видимости виджета.', function() {
                beforeEach(function() {
                    tester.toggleWidgetVisibilityRequest().
                        visible().
                        expectResponseToBeSent();
                });

                it(
                    'Получен токен авторизации. Удалось авторизвоваться с полученным токеном. Производится ' +
                    'инициализация софтфона. Получено сообщение о необходимости показать виджет. Виджет видим.',
                function() {
                    tester.chrome.
                        storage.
                        local.
                        set({
                            access_token: '23f8DS8sdflsdf8DslsdfLSD0ad31Ffsdf',
                        });

                    tester.authTokenRequest().receiveResponse()
                    tester.authCheckRequest().receiveResponse();

                    tester.masterInfoMessage().receive();

                    tester.slavesNotification().
                        additional().
                        visible().
                        expectToBeSent();

                    tester.slavesNotification().expectToBeSent();
                    tester.masterInfoMessage().tellIsLeader().expectToBeSent();

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

                    tester.phoneField.expectToBeVisible();

                    tester.chrome.
                        storage.
                        local.
                        expectToContain({
                            jwt_token: 'XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0',
                        });
                });
                it('Отображено сообщение о том, что софтофон не авторизован.', function() {
                    tester.softphone.expectToHaveTextContent(
                        'Не авторизован ' +
                        'Для использования софтфона необходимо авторизоваться'
                    );
                });
            });
            it('Получен запрос состояния. В ответ на запрос было отправлено текущее состояние.', function() {
                tester.stateRequest().expectResponseToBeSent();
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
                        access_token: '23f8DS8sdflsdf8DslsdfLSD0ad31Ffsdf',
                    });
            });
            it('Приходит запрос, не являющийся запросом авторизации. Ответ не был отправлен.', function() {
                tester.toggleWidgetVisibilityRequest().expectNoResponseToBeSent();
            });
        });
        it(
            'Токен авторизации был сохранен. Производится инициализация софтфона. Получен запрос состояния. ' +
            'Отправлено текущее состояние. Получено сообщение о необходимости показать виджет. Виджет видим.',
        function() {
            tester = new Tester({
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
                expectResponseToBeSent();

            tester.slavesNotification().
                additional().
                visible().
                expectToBeSent();

            tester.phoneField.expectToBeVisible();
        });
    });
});
