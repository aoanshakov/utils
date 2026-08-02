tests.addTest(options => {
    const {
        Tester,
        setFocus,
        notificationTester,
        spendTime,
        postMessages,
        unfilteredPostMessages,
        setNow,
        setDocumentVisible,
        windowOpener,
        ajax,
        utils,
        webSockets,
        audioDecodingTester,
        unload,
    } = options;

    describe('Включено расширение Chrome или виджет интеграции с CRM.', function() {
        let tester;

        beforeEach(function() {
            setNow('2019-12-19T12:10:06');
        });

        afterEach(function() {
            postMessages.nextMessage().expectNotToExist();

            if (!tester) {
                return;
            }

            tester.restoreSalesbotIFrameContentWindow();
            tester.restoreSoftphoneIFrameContentWindow();
            tester.restoreNotificationIFrameContentWindow();

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

            tester.chrome.
                permissions.
                nextRequest().
                expectNotToExist();
        });

        describe('Открыт IFrame софтфона amoCRM.', function() {
            beforeEach(function() {
                tester = new Tester({
                    application: 'amocrmIframeContent',
                    isIframe: true,
                    softphoneHost: 'my.uiscom.ru',
                    ...options,
                });

                tester.stateSettingRequest().expectToBeSent();
            });

            describe('Получена русская локаль.', function() {
                beforeEach(function() {
                    tester.amocrmStateSettingRequest().receive();

                    tester.tokenInitializationRequest().
                        emptyToken().
                        expectToBeSent();

                    postMessages.receive({
                        method: 'set_token',
                        data: '',
                    });

                    postMessages.nextMessage().expectMessageToContain({
                        method: 'set_token',
                        data: '',
                    });
                });

                describe('Из окна авторизации приходит токен.', function() {
                    let authCheckRequest,
                        widgetSettings;

                    beforeEach(function() {
                        postMessages.receive({
                            method: 'set_token',
                            data: tester.oauthToken,
                        });

                        postMessages.nextMessage().expectMessageToContain({
                            method: 'set_token',
                            data: tester.oauthToken,
                        });

                        widgetSettings = tester.widgetSettings().
                            amocrm().
                            request().
                            expectToBeSent();
                    });

                    describe('Софтфон доступен. Прозиводится авторизация.', function() {
                        beforeEach(function() {
                            widgetSettings.receiveResponse();
                            tester.availabilitySettingRequest().expectToBeSent();

                            tester.masterInfoMessage().receive();

                            tester.stateSettingRequest().
                                leader().
                                expectToBeSent();

                            tester.masterInfoMessage().
                                tellIsLeader().
                                expectToBeSent();

                            tester.slavesNotification().expectToBeSent();

                            tester.slavesNotification().
                                additional().
                                expectToBeSent();

                            postMessages.nextMessage().expectNotToExist();

                            tester.authTokenRequest().
                                amocrm().
                                receiveResponse()

                            authCheckRequest = tester.authCheckRequest().expectToBeSent();

                            unfilteredPostMessages.
                                nextMessage().
                                expectMessageToStartsWith('ignore:log:').
                                expectMessageToContain('POST https://my.uiscom.ru/sup/auth/token');
                        });

                        it('', function() {
                        });
                        return;
                        describe('Удалось авторизоваться.', function() {
                            let settingsRequest;

                            beforeEach(function() {
                                authCheckRequest.receiveResponse();

                                tester.statusesRequest().receiveResponse();
                                tester.talkOptionsRequest().receiveResponse();
                                tester.permissionsRequest().receiveResponse();
                                settingsRequest = tester.settingsRequest().expectToBeSent();
                            });

                            describe('Софтон готов к использованию.', function() {
                                beforeEach(function() {
                                    settingsRequest.receiveResponse();

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

                                    tester.marksRequest().receiveResponse();
                                    authenticatedUserRequest = tester.authenticatedUserRequest().expectToBeSent();

                                    tester.registrationRequest().
                                        amocrmWidget().
                                        receiveResponse();

                                    tester.slavesNotification().
                                        twoChannels().
                                        softphoneServerConnected().
                                        webRTCServerConnected().
                                        registered().
                                        expectToBeSent();

                                    authenticatedUserRequest.receiveResponse();

                                    tester.stateSettingRequest().
                                        userDataFetched().
                                        leader().
                                        expectToBeSent();

                                    tester.employeeFetchedMessage().expectToBeSent();
                                    tester.allowMediaInput();

                                    tester.slavesNotification().
                                        twoChannels().
                                        available().
                                        expectToBeSent();
                                });

                                describe('Нажимаю на кнопку видимости софтфона.', function() {
                                    beforeEach(function() {
                                        tester.softphoneVisibilityToggleRequest().receive();

                                        tester.slavesNotification().
                                            additional().
                                            visible().
                                            expectToBeSent();

                                        tester.stateSettingRequest().
                                            userDataFetched().
                                            visible().
                                            leader().
                                            expectToBeSent();
                                    });

                                    it(
                                        'Софтон открыт в другом окне. Отображено сообщение о том, что софтфон открыт ' +
                                        'в другом окне.',
                                    function() {
                                        tester.eventsWebSocket.disconnect(4429);

                                        tester.stateSettingRequest().
                                            userDataFetched().
                                            visible().
                                            destroyed().
                                            leader().
                                            expectToBeSent();

                                        tester.slavesNotification().
                                            twoChannels().
                                            appAlreadyOpened().
                                            enabled().
                                            microphoneAccessGranted().
                                            expectToBeSent();

                                        tester.authLogoutRequest().receiveResponse();

                                        tester.registrationRequest().
                                            amocrmWidget().
                                            expired().
                                            receiveResponse();
                                        
                                        spendTime(2000);
                                        tester.webrtcWebsocket.finishDisconnecting();

                                        tester.softphone.expectTextContentToHaveSubstring(
                                            'Софтфон открыт в другом окне'
                                        );
                                    });
                                    it('Получен входящий звонок.', function() {
                                        const incomingCall = tester.incomingCall().receive();

                                        tester.slavesNotification().
                                            twoChannels().
                                            available().
                                            incoming().
                                            progress().
                                            expectToBeSent();

                                        tester.numaRequest().receiveResponse();

                                        tester.outCallEvent().receive();
                                        tester.outCallEvent().slavesNotification().expectToBeSent();

                                        tester.stateSettingRequest().
                                            visible().
                                            leader().
                                            userDataFetched().
                                            expanded().
                                            expectToBeSent();
                                    });
                                    it('Нажимаю на кнопку с жучком.', function() {
                                        tester.bugButton.click();

                                        tester.logDownloadingRequest().
                                            windowMessage().
                                            expectToBeSent();
                                    });
                                });
                                it('Токен сохранен.', function() {
                                    tester.localStorage.
                                        key('token').
                                        expectToHaveValue(tester.oauthToken);
                                });
                            });
                            describe('Нет доступной SIP-линии. Открываю софтфон.', function() {
                                beforeEach(function() {
                                    settingsRequest.
                                        noSipLine().
                                        receiveResponse();

                                    tester.slavesNotification().expectToBeSent();

                                    tester.slavesNotification().
                                        disabled().
                                        expectToBeSent();

                                    notificationTester.grantPermission();
                                    tester.connectEventsWebSocket();

                                    tester.slavesNotification().
                                        softphoneServerConnected().
                                        disabled().
                                        expectToBeSent();

                                    tester.marksRequest().receiveResponse();

                                    tester.authenticatedUserRequest().receiveResponse();
                                    tester.employeeFetchedMessage().expectToBeSent();

                                    tester.stateSettingRequest().
                                        userDataFetched().
                                        leader().
                                        expectToBeSent();

                                    tester.softphoneVisibilityToggleRequest().receive();

                                    tester.slavesNotification().
                                        additional().
                                        visible().
                                        expectToBeSent();

                                    tester.stateSettingRequest().
                                        userDataFetched().
                                        visible().
                                        leader().
                                        expectToBeSent();
                                });

                                it('Нажимаю на номер телефона. Отображены теги исходящего звонка.', function() {
                                    postMessages.receive({
                                        method: 'start_call',
                                        data: '79161234567',
                                    });

                                    tester.click2CallRequest().receiveResponse();

                                    tester.outCallSessionEvent().receive();
                                    tester.outCallSessionEvent().slavesNotification().expectToBeSent();

                                    tester.stateSettingRequest().
                                        visible().
                                        leader().
                                        userDataFetched().
                                        expanded().
                                        expectToBeSent();

                                    tester.body.expectToHaveTextContent(
                                        'Нет доступной sip-линии ' +
                                        'Обратитесь к администратору ' +

                                        'Путь лида ' +

                                        'Виртуальный номер ' +
                                        '+7 (916) 123-45-67 ' +

                                        'Теги: ' +
                                        'Некий тег'
                                    );
                                });
                                it('Отображено сообщение об отсутствии SIP-линии.', function() {
                                    tester.body.expectToHaveTextContent(
                                        'Нет доступной sip-линии ' +
                                        'Обратитесь к администратору'
                                    );
                                });
                            });
                        });
                        describe('Не удалось произвести авторизацию.', function() {
                            beforeEach(function() {
                                authCheckRequest.
                                    serverError().
                                    receiveResponse();

                                tester.slavesNotification().
                                    destroyed().
                                    expectToBeSent();

                                tester.masterInfoMessage().
                                    leaderDeath().
                                    expectToBeSent();

                                tester.authLogoutRequest().receiveResponse();

                                tester.stateSettingRequest().
                                    destroyed().
                                    leader().
                                    expectToBeSent();

                                tester.softphoneVisibilityToggleRequest().receive();

                                tester.stateSettingRequest().
                                    destroyed().
                                    visible().
                                    leader().
                                    expectToBeSent();
                            });

                            it('Нажимаю на кнпоку выхода. Открывается окно выхода.', function() {
                                tester.accountButton.click();
                                tester.button('Выход').click();

                                windowOpener.expectToHavePath('https://uc-sso-amocrm-prod-api.uiscom.ru/ru/logout');
                            });
                            it('Отображено сообщение об отуствтвии прав.', function() {
                                tester.localStorage.
                                    key('token').
                                    expectToHaveValue(tester.oauthToken);

                                tester.body.expectToHaveTextContent(
                                    'Софтфон недоступен ' +
                                    'Не хватает прав'
                                );
                            });
                        });
                    });
                    return;
                    describe('Нужно всегда использвать Call-API. WebRTC выключен.', function() {
                        beforeEach(function() {
                            widgetSettings.
                                useCallapiAlways().
                                receiveResponse();

                            tester.availabilitySettingRequest().expectToBeSent();
                            tester.masterInfoMessage().receive();

                            tester.stateSettingRequest().
                                leader().
                                expectToBeSent();

                            tester.masterInfoMessage().
                                tellIsLeader().
                                expectToBeSent();

                            tester.slavesNotification().expectToBeSent();

                            tester.slavesNotification().
                                additional().
                                expectToBeSent();

                            tester.authTokenRequest().
                                amocrm().
                                receiveResponse()

                            tester.authCheckRequest().receiveResponse();
                            tester.statusesRequest().receiveResponse();
                            tester.talkOptionsRequest().receiveResponse();
                            tester.permissionsRequest().receiveResponse();
                            tester.settingsRequest().receiveResponse();

                            tester.slavesNotification().
                                twoChannels().
                                disabled().
                                expectToBeSent();

                            notificationTester.grantPermission();
                            tester.connectEventsWebSocket();

                            tester.slavesNotification().
                                softphoneServerConnected().
                                twoChannels().
                                disabled().
                                expectToBeSent();

                            tester.marksRequest().receiveResponse();

                            tester.authenticatedUserRequest().receiveResponse();
                            tester.employeeFetchedMessage().expectToBeSent();

                            tester.stateSettingRequest().
                                userDataFetched().
                                leader().
                                expectToBeSent();

                            tester.softphoneVisibilityToggleRequest().receive();

                            tester.slavesNotification().
                                additional().
                                visible().
                                expectToBeSent();

                            tester.stateSettingRequest().
                                userDataFetched().
                                visible().
                                leader().
                                expectToBeSent();
                        });

                        describe('Получен запрос выхода.', function() {
                            beforeEach(function() {
                                postMessages.receive({
                                    method: 'set_token',
                                    data: '',
                                });

                                postMessages.nextMessage().expectMessageToContain({
                                    method: 'set_token',
                                    data: '',
                                });

                                tester.stateSettingRequest().
                                    userDataFetched().
                                    visible().
                                    destroyed().
                                    leader().
                                    expectToBeSent();

                                tester.slavesNotification().
                                    twoChannels().
                                    disabled().
                                    destroyed().
                                    expectToBeSent();

                                tester.masterInfoMessage().
                                    leaderDeath().
                                    expectToBeSent();

                                tester.eventsWebSocket.finishDisconnecting();
                                tester.authLogoutRequest().receiveResponse();
                            });

                            it('Авторизуюсь заново. Отображено уведомление о том, что WebRTC выключен.', function() {
                                postMessages.receive({
                                    method: 'set_token',
                                    data: tester.oauthToken,
                                });

                                postMessages.nextMessage().expectMessageToContain({
                                    method: 'set_token',
                                    data: tester.oauthToken,
                                });

                                tester.widgetSettings().
                                    amocrm().
                                    request().
                                    useCallapiAlways().
                                    receiveResponse();

                                tester.availabilitySettingRequest().expectToBeSent();
                                tester.masterInfoMessage().receive();

                                tester.stateSettingRequest().
                                    userDataFetched().
                                    visible().
                                    leader().
                                    expectToBeSent();

                                tester.masterInfoMessage().
                                    tellIsLeader().
                                    expectToBeSent();

                                tester.slavesNotification().expectToBeSent();

                                tester.slavesNotification().
                                    additional().
                                    visible().
                                    expectToBeSent();

                                tester.authTokenRequest().
                                    amocrm().
                                    receiveResponse()

                                tester.authCheckRequest().receiveResponse();
                                tester.statusesRequest().receiveResponse();
                                tester.talkOptionsRequest().receiveResponse();
                                tester.permissionsRequest().receiveResponse();
                                tester.settingsRequest().receiveResponse();

                                tester.slavesNotification().
                                    twoChannels().
                                    disabled().
                                    expectToBeSent();

                                notificationTester.grantPermission();
                                tester.connectEventsWebSocket(1);

                                tester.slavesNotification().
                                    softphoneServerConnected().
                                    twoChannels().
                                    disabled().
                                    expectToBeSent();

                                tester.authenticatedUserRequest().receiveResponse();
                                tester.employeeFetchedMessage().expectToBeSent();

                                tester.body.expectToHaveTextContent(
                                    'Используется на другом устройстве ' +
                                    'Включено управление звонками с другого устройства или программы'
                                );
                            });
                            it('Отображена ссылка на страницу авторизации.', function() {
                                tester.span('Для использования софтфона необходимо авторизоваться').expectToBeVisible();
                            });
                        });
                        it('Отображено уведомление о том, что WebRTC выключен.', function() {
                            tester.body.expectToHaveTextContent(
                                'Используется на другом устройстве ' +
                                'Включено управление звонками с другого устройства или программы'
                            );
                        });
                    });
                    it('Не удалось получить настройки из-за ошибки сервера. Производится авторизация.', function() {
                         widgetSettings.
                            failedToGetSettings().
                            receiveResponse();

                        tester.availabilitySettingRequest().expectToBeSent();
                        tester.masterInfoMessage().receive();

                        tester.stateSettingRequest().
                            leader().
                            expectToBeSent();

                        tester.masterInfoMessage().
                            tellIsLeader().
                            expectToBeSent();

                        tester.slavesNotification().expectToBeSent();

                        tester.slavesNotification().
                            additional().
                            expectToBeSent();

                        tester.authTokenRequest().
                            amocrm().
                            expectToBeSent()
                    });
                    it('Интеграция отсутствует. Авторизация не прозиводится.', function() {
                        widgetSettings.
                            noIntegrations().
                            receiveResponse();

                        tester.availabilitySettingRequest().
                            unavailable().
                            expectToBeSent();
                    });
                    it('Софтфон недоступен. Авторизация не прозиводится.', function() {
                        widgetSettings.
                            unavailable().
                            receiveResponse();

                        tester.availabilitySettingRequest().
                            unavailable().
                            expectToBeSent();
                    });
                });
                return;
                describe('Приходит запрос изменения видимости.', function() {
                    beforeEach(function() {
                        tester.softphoneVisibilityToggleRequest().receive();

                        tester.stateSettingRequest().
                            visible().
                            expectToBeSent();
                    });
                        
                    it('Нажимаю на ссылку на страницу авторизации. Открыта страница авторизации.', function() {
                        tester.span('Для использования софтфона необходимо авторизоваться').click();
                        windowOpener.expectToHavePath('https://uc-sso-amocrm-prod-api.uiscom.ru');
                    });
                    it('Нажимаю на кнопку акканта. Кнопка выхода отсутствует.', function() {
                        tester.accountButton.click();
                        tester.button('Выход').expectNotToExist();
                    });
                    it('Софтфон отображён.', function() {
                        tester.body.expectToHaveTextContent(
                            'Не авторизован ' +
                            'Для использования софтфона необходимо авторизоваться'
                        );
                    });
                });
                it('Из окна авторизации приходит дубайский токен. Авторизация не производится.', function() {
                    postMessages.receive({
                        method: 'set_token',
                        data: tester.anotherOauthToken,
                    });

                    postMessages.nextMessage().expectMessageToContain({
                        method: 'set_token',
                        data: tester.anotherOauthToken,
                    });

                    tester.localStorage.
                        key('token').
                        expectToBeEmpty();
                });
            });
            return;
            it('Получена английская локаль. Используется английский язык.', function() {
                tester.amocrmStateSettingRequest().
                    en().
                    receive();

                tester.tokenInitializationRequest().
                    emptyToken().
                    expectToBeSent();

                postMessages.receive({
                    method: 'set_token',
                    data: '',
                });

                postMessages.nextMessage().expectMessageToContain({
                    method: 'set_token',
                    data: '',
                });

                tester.softphoneVisibilityToggleRequest().receive();

                tester.stateSettingRequest().
                    visible().
                    expectToBeSent();

                tester.body.expectTextContentToHaveSubstring('Please authorize to use softphone');
            });
        });
        return;
        describe(
            'В локальном хранилище сохранен токен. Открыт IFrame софтфона amoCRM. Производится авторизация.',
        function() {
            let settingsRequest,
                widgetSettings;

            beforeEach(function() {
                tester = new Tester({
                    application: 'amocrmIframeContent',
                    isIframe: true,
                    isAuthorized: true,
                    softphoneHost: 'my.uiscom.ru',
                    ...options,
                });

                tester.stateSettingRequest().expectToBeSent();
                tester.amocrmStateSettingRequest().receive();
                tester.tokenInitializationRequest().expectToBeSent();

                postMessages.receive({
                    method: 'set_token',
                    data: tester.oauthToken,
                });

                postMessages.nextMessage().expectMessageToContain({
                    method: 'set_token',
                    data: tester.oauthToken,
                });

                widgetSettings = tester.widgetSettings().
                    amocrm().
                    request().
                    expectToBeSent();
            });

            describe('Получены настройки для IP-телефона.', function() {
                beforeEach(function() {
                    widgetSettings.receiveResponse();
                    tester.masterInfoMessage().receive();

                    tester.stateSettingRequest().
                        leader().
                        expectToBeSent();

                    tester.availabilitySettingRequest().expectToBeSent();

                    tester.masterInfoMessage().
                        tellIsLeader().
                        expectToBeSent();

                    tester.slavesNotification().expectToBeSent();
                    
                    tester.slavesNotification().
                        additional().
                        expectToBeSent();

                    tester.authTokenRequest().
                        amocrm().
                        receiveResponse()

                    tester.authCheckRequest().receiveResponse();

                    tester.statusesRequest().receiveResponse();
                    tester.talkOptionsRequest().receiveResponse();
                    tester.permissionsRequest().receiveResponse();
                    settingsRequest = tester.settingsRequest().expectToBeSent();
                });

                describe('Управление звонками производится при помощи виджета.', function() {
                    beforeEach(function() {
                        settingsRequest.receiveResponse();

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

                        tester.marksRequest().receiveResponse();
                        authenticatedUserRequest = tester.authenticatedUserRequest().expectToBeSent();

                        tester.registrationRequest().
                            amocrmWidget().
                            receiveResponse();

                        tester.slavesNotification().
                            twoChannels().
                            softphoneServerConnected().
                            webRTCServerConnected().
                            registered().
                            expectToBeSent();

                        authenticatedUserRequest.receiveResponse();
                        tester.employeeFetchedMessage().expectToBeSent();

                        tester.allowMediaInput();

                        tester.slavesNotification().
                            twoChannels().
                            available().
                            expectToBeSent();

                        tester.stateSettingRequest().
                            userDataFetched().
                            leader().
                            expectToBeSent();

                        tester.softphoneVisibilityToggleRequest().receive();

                        tester.slavesNotification().
                            additional().
                            visible().
                            expectToBeSent();

                        tester.stateSettingRequest().
                            userDataFetched().
                            visible().
                            leader().
                            expectToBeSent();
                    });

                    it('Получен запрос выхода. Отображена ссылка на страницу авторизации.', function() {
                        postMessages.receive({
                            method: 'set_token',
                            data: '',
                        });

                        tester.stateSettingRequest().
                            userDataFetched().
                            visible().
                            destroyed().
                            leader().
                            expectToBeSent();

                        postMessages.nextMessage().expectMessageToContain({
                            method: 'set_token',
                            data: '',
                        });

                        tester.slavesNotification().
                            twoChannels().
                            enabled().
                            destroyed().
                            microphoneAccessGranted().
                            expectToBeSent();

                        tester.masterInfoMessage().
                            leaderDeath().
                            expectToBeSent();

                        tester.eventsWebSocket.finishDisconnecting();
                        tester.authLogoutRequest().receiveResponse();

                        tester.registrationRequest().
                            amocrmWidget().
                            expired().
                            receiveResponse();
                        
                        spendTime(2000);
                        tester.webrtcWebsocket.finishDisconnecting();

                        tester.span('Для использования софтфона необходимо авторизоваться').expectToBeVisible();
                    });
                    it('Нажимаю на кнпоку выхода. Открывается окно выхода.', function() {
                        tester.accountButton.click();
                        tester.button('Выход').click();

                        windowOpener.expectToHavePath('https://uc-sso-amocrm-prod-api.uiscom.ru/ru/logout');
                    });
                });
                describe(
                    'Включено управление звонками на другом устройстве. Нажимаю на номер телефона. Отправлен запрос ' +
                    'звонка.',
                function() {
                    beforeEach(function() {
                        settingsRequest.
                            callsAreManagedByAnotherDevice().
                            receiveResponse();

                        tester.slavesNotification().
                            twoChannels().
                            disabled().
                            expectToBeSent();

                        notificationTester.grantPermission();
                        tester.connectEventsWebSocket();

                        tester.slavesNotification().
                            twoChannels().
                            disabled().
                            softphoneServerConnected().
                            expectToBeSent();

                        tester.marksRequest().receiveResponse();

                        tester.authenticatedUserRequest().receiveResponse();
                        tester.employeeFetchedMessage().expectToBeSent();

                        tester.stateSettingRequest().
                            userDataFetched().
                            leader().
                            expectToBeSent();

                        postMessages.receive({
                            method: 'start_call',
                            data: '79161234567',
                        });

                        tester.click2CallRequest().receiveResponse();
                    });
                    
                    it('Получен запрос изменения видимости софтфона. Сообщение об ошибке не отображено.', function() {
                        tester.softphoneVisibilityToggleRequest().receive();

                        tester.slavesNotification().
                            additional().
                            visible().
                            expectToBeSent();

                        tester.stateSettingRequest().
                            userDataFetched().
                            visible().
                            leader().
                            expectToBeSent();

                        tester.softphone.expectTextContentNotToHaveSubstring(
                            'Отстутствуют настройки для вызова IP-телефона'
                        );
                    });
                    it('Софтфон скрыт.', function() {
                        tester.softphone.expectNotToExist();
                    });
                });
                describe('Открываю софтфона.', function() {
                    beforeEach(function() {
                        tester.softphoneVisibilityToggleRequest().receive();

                        tester.stateSettingRequest().
                            leader().
                            visible().
                            expectToBeSent();

                        tester.slavesNotification().
                            additional().
                            visible().
                            expectToBeSent();
                    });

                    it('Не удалось получить настройки из-за ошибки сервера.', function() {
                        settingsRequest.
                            serverError().
                            receiveResponse();

                        tester.stateSettingRequest().
                            leader().
                            visible().
                            destroyed().
                            expectToBeSent();

                        tester.slavesNotification().
                            authorzationFailed().
                            expectToBeSent();

                        tester.masterInfoMessage().
                            leaderDeath().
                            expectToBeSent();

                        tester.authLogoutRequest().receiveResponse();

                        tester.body.expectToHaveTextContent(
                            'Софтфон недоступен ' +
                            'Не хватает прав'
                        );
                    });
                    it(
                        'Не удалось получить настройки, потому что сотрудник не авторизован. Отображена ссылка на ' +
                        'страницу авторизации.',
                    function() {
                        settingsRequest.
                            accessTokenInvalid().
                            receiveResponse();

                        tester.stateSettingRequest().
                            leader().
                            visible().
                            destroyed().
                            expectToBeSent();

                        tester.slavesNotification().
                            invalidToken().
                            expectToBeSent();

                        tester.masterInfoMessage().
                            leaderDeath().
                            expectToBeSent();

                        tester.authLogoutRequest().receiveResponse();

                        tester.body.expectToHaveTextContent(
                            'Не авторизован ' +
                            'Для использования софтфона необходимо авторизоваться'
                        );
                    });
                });
            });
            describe(
                'Настройки для IP-телефона получены. Включено управление звонками на другом устройстве.',
            function() {
                beforeEach(function() {
                    widgetSettings.
                        anotherSoftphoneWildcart().
                        receiveResponse();

                    tester.masterInfoMessage().receive();

                    tester.stateSettingRequest().
                        leader().
                        expectToBeSent();

                    tester.availabilitySettingRequest().expectToBeSent();

                    tester.masterInfoMessage().
                        tellIsLeader().
                        expectToBeSent();

                    tester.slavesNotification().expectToBeSent();

                    tester.slavesNotification().
                        additional().
                        expectToBeSent();

                    tester.authTokenRequest().
                        amocrm().
                        receiveResponse()

                    tester.authCheckRequest().receiveResponse();

                    tester.statusesRequest().receiveResponse();
                    tester.talkOptionsRequest().receiveResponse();
                    tester.permissionsRequest().receiveResponse();
                    settingsRequest = tester.settingsRequest().expectToBeSent();

                    settingsRequest.
                        callsAreManagedByAnotherDevice().
                        receiveResponse();

                    tester.slavesNotification().
                        twoChannels().
                        disabled().
                        expectToBeSent();

                    notificationTester.grantPermission();
                    tester.connectEventsWebSocket();

                    tester.slavesNotification().
                        twoChannels().
                        disabled().
                        softphoneServerConnected().
                        expectToBeSent();

                    tester.marksRequest().receiveResponse();

                    tester.authenticatedUserRequest().receiveResponse();
                    tester.employeeFetchedMessage().expectToBeSent();

                    tester.stateSettingRequest().
                        userDataFetched().
                        leader().
                        expectToBeSent();
                });

                it(
                    'Получен запрос изменения видимости софтфона. Нажимаю на номер телефона. Отображено сообщение об ' +
                    'отстутствии настроек IP-телефона.',
                function() {
                    tester.softphoneVisibilityToggleRequest().receive();

                    tester.slavesNotification().
                        additional().
                        visible().
                        expectToBeSent();

                    tester.stateSettingRequest().
                        userDataFetched().
                        visible().
                        leader().
                        expectToBeSent();

                    postMessages.receive({
                        method: 'start_call',
                        data: '79161234567',
                    });

                    tester.softphone.expectTextContentToHaveSubstring(
                        'Отстутствуют настройки для вызова IP-телефона'
                    );
                });
                it('Нажимаю на номер телефона. Отображено сообщение об отстутствии настроек IP-телефона.', function() {
                    postMessages.receive({
                        method: 'start_call',
                        data: '79161234567',
                    });

                    tester.slavesNotification().
                        additional().
                        visible().
                        expectToBeSent();

                    tester.stateSettingRequest().
                        visible().
                        userDataFetched().
                        leader().
                        expectToBeSent();

                    tester.softphone.expectTextContentToHaveSubstring(
                        'Отстутствуют настройки для вызова IP-телефона'
                    );
                });
            });
        });
        describe(
            'Открыт IFrame софтфона amoCRM. Получен URL страницы с виджетом Новофон. Сотрудник ввел логин и пароль.',
        function() {
            beforeEach(function() {
                tester = new Tester({
                    application: 'amocrmIframeContent',
                    isIframe: true,
                    softphoneHost: 'my.uiscom.ru',
                    env: { REACT_APP_PROJECT: 'novofon' },
                    ...options,
                });

                tester.stateSettingRequest().expectToBeSent();
                tester.originSettingRequest().receive();

                postMessages.nextMessage().expectMessageToContain({
                    method: 'set_token',
                    data: '',
                });

                postMessages.receive({
                    method: 'set_token',
                    data: tester.oauthToken,
                });

                postMessages.nextMessage().expectMessageToContain({
                    method: 'set_token',
                    data: tester.oauthToken,
                });

                widgetSettings = tester.widgetSettings().
                    amocrm().
                    request().
                    receiveResponse();

                tester.availabilitySettingRequest().expectToBeSent();
                tester.masterInfoMessage().receive();

                tester.stateSettingRequest().
                    leader().
                    expectToBeSent();

                tester.masterInfoMessage().
                    tellIsLeader().
                    expectToBeSent();

                tester.slavesNotification().expectToBeSent();

                tester.slavesNotification().
                    additional().
                    expectToBeSent();

                postMessages.nextMessage().expectNotToExist();

                tester.authTokenRequest().receiveResponse()
                tester.authCheckRequest().receiveResponse();
                tester.statusesRequest().receiveResponse();
                tester.talkOptionsRequest().receiveResponse();
                tester.permissionsRequest().receiveResponse();

                tester.settingsRequest().
                    noSipLine().
                    receiveResponse();

                tester.slavesNotification().expectToBeSent();

                tester.slavesNotification().
                    disabled().
                    expectToBeSent();

                notificationTester.grantPermission();
                tester.connectEventsWebSocket();

                tester.slavesNotification().
                    softphoneServerConnected().
                    disabled().
                    expectToBeSent();

                tester.marksRequest().receiveResponse();

                tester.authenticatedUserRequest().receiveResponse();
                tester.employeeFetchedMessage().expectToBeSent();

                tester.stateSettingRequest().
                    userDataFetched().
                    leader().
                    expectToBeSent();

                tester.softphoneVisibilityToggleRequest().receive();

                tester.slavesNotification().
                    additional().
                    visible().
                    expectToBeSent();

                tester.stateSettingRequest().
                    userDataFetched().
                    visible().
                    leader().
                    expectToBeSent();
            });

            it('Получен запрос исходящего звонка. Производится исходящий звонок.', function() {
                postMessages.receive({
                    method: 'start_call',
                    data: '79161234567',
                });

                tester.click2CallRequest().receiveResponse();
            });
            it('Нажимаю на кнопку скачивания лога. Лог скачивается.', function() {
                tester.bugButton.click();

                tester.anchor.withFileName('20191219.121007.000.log.txt').
                    expectHrefToBeBlobWithSubstrings([
                        '"set_origin"',
                        'POST https://my.uiscom.ru/sup/auth/token',
                    ]);
            });
        });
    });
});
