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

            stateRequest = tester.chrome.
                tabs.
                current.
                nextMessage().
                expectToContain({
                    method: 'get_state',
                });
        });

        afterEach(function() {
            tester.chrome.
                tabs.
                current.
                nextMessage().
                expectNotToExist();
        });

        describe('Проходит некоторое время. Запрос состояния отправлен ещё раз.', function() {
            beforeEach(function() {
                spendTime(1000);

                stateRequest = tester.chrome.
                    tabs.
                    current.
                    nextMessage().
                    expectToContain({
                        method: 'get_state',
                    });
            });

            it('Проходит некоторое время. Запрос состояния отправлен ещё раз.', function() {
                spendTime(1000);

                tester.chrome.
                    tabs.
                    current.
                    nextMessage().
                    expectToContain({
                        method: 'get_state',
                    });
            });
            it('Получен ответ. Состояние страницы изменилось.', function() {
                stateRequest.receiveResponse({
                    visible: true,
                });

                tester.button('Скрыть софтфон').expectToBeVisible();
                spendTime(1000);
            });
        });
        it('Софтфон видим. Нажимаю на кнопку "Скрыть софтфон". Отображена кнопка "Показать софтфон".', function() {
            stateRequest.receiveResponse({
                visible: true,
            });

            tester.button('Скрыть софтфон').click();

            tester.chrome.
                tabs.
                current.
                nextMessage().
                expectToContain({
                    method: 'toggle_widget_visibility',
                }).
                receiveResponse({
                    visible: false,
                });

            tester.button('Показать софтфон').expectToBeVisible();
            spendTime(1000);
        });
        it('Софтфон скрыт. Нажимаю на кнопку "Показать софтфон". Отображена кнопка "Скрыть софтфон".', function() {
            stateRequest.receiveResponse({
                visible: false,
            });

            tester.button('Показать софтфон').click();

            tester.chrome.
                tabs.
                current.
                nextMessage().
                expectToContain({
                    method: 'toggle_widget_visibility',
                }).
                receiveResponse({
                    visible: true,
                });

            tester.button('Скрыть софтфон').expectToBeVisible();
        });
        it('Отображен спиннер.', function() {
            tester.body.expectToHaveTextContent('Загрузка...');
        });
    });
    return;
    describe('Открываю вкладку.', function() {
        let authenticatedUserRequest,
            ticketsContactsRequest,
            tester;

        beforeEach(function() {
            tester = new Tester({
                ...options,
            });
        });

        xdescribe('', function() {
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
        describe('Получен запрос изменения видимости виджета.', function() {
            beforeEach(function() {
                tester.chrome.
                    runtime.
                    receiveMessage({
                        method: 'toggle_widget_visibility'
                    }).
                    expectResponseToContain({
                        visible: true,
                    });
            });

            it('Нажимаю на кнопку авторизации. Производится авторизация.', function() {
                tester.anchor('ссылку').click();

                tester.chrome.
                    identity.
                    nextLaunching().
                    expectDetailsToContain({
                        url: 'https://uc-sso-prod-api.uiscom.ru',
                        interactive: true,
                    }).
                    receiveResponse('https://somedomain.com');
            });
            return;
            it('Отображено сообщение о том, что софтофон не авторизован.', function() {
                tester.softphone.expectToHaveTextContent(
                    'Не авторизован ' +
                    'Нажмите на ссылку , чтобы авторизоваться'
                );
            });
        });
        return;
        it('Получен запрос состояния. В ответ на запрос было отправлено текущее состояние.', function() {
            tester.chrome.
                runtime.
                receiveMessage({
                    method: 'get_state'
                }).
                expectResponseToContain({
                    visible: false,
                });
        });
    });
});
