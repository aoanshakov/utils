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
        });

        describe('Софтфон скрыт.', function() {
            beforeEach(function() {
                stateRequest.receiveResponse();
            });

            it('Нажимаю на кнопку "Авторизоваться". Производится авторизация.', function() {
                tester.button('Авторизоваться').click();

                tester.chrome.
                    identity.
                    nextLaunching().
                    expectDetailsToContain({
                        url: 'https://uc-sso-prod-api.uiscom.ru',
                        interactive: true,
                    }).
                    receiveResponse('https://somedomain.com');
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
                ...options,
            });
        });

        /*
        describe('', function() {
            beforeEach(function() {
                tester.input.fill('XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0');
                tester.button('Войти').click();

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

                tester.button('Софтфон').click();

                tester.slavesNotification().
                    additional().
                    visible().
                    expectToBeSent();
            });

            it('', function() {
            });
        });
        */
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
