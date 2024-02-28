tests.addTest(options => {
    const {
        Tester,
        notificationTester,
        spendTime,
        postMessages,
        setNow,
        setDocumentVisible,
        windowOpener,
    } = options;

    describe('Включено расширение Chrome.', function() {
        let tester;

        beforeEach(function() {
            setNow('2019-12-19T12:10:06');
        });

        afterEach(function() {
            tester.restoreIFrameContentWindow();

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

        describe('Открыт IFrame.', function() {
            beforeEach(function() {
                tester = new Tester({
                    application: 'iframeContent',
                    isIframe: true,
                    softphoneHost: 'my.uiscom.ru',
                    ...options,
                });

                tester.stateSettingRequest().expectToBeSent();
            });

            describe('Получен запрос изменения видимости софтфофона. Получен токен авторизации.', function() {
                let widgetSettings;

                beforeEach(function() {
                    postMessages.receive({
                        method: 'toggle_widget_visibility',
                    });
                    
                    tester.stateSettingRequest().
                        visible().
                        expectToBeSent();

                    widgetSettings = tester.widgetSettings().windowMessage();
                });

                describe('Звонки совершаются через WebRTC.', function() {
                    beforeEach(function() {
                        widgetSettings.receive();
                        tester.masterInfoMessage().receive();

                        tester.slavesNotification().
                            additional().
                            visible().
                            expectToBeSent();

                        tester.slavesNotification().expectToBeSent();
                        tester.masterInfoMessage().tellIsLeader().expectToBeSent();
                            
                        tester.authTokenRequest().receiveResponse()

                        tester.stateSettingRequest().
                            authenticated().
                            visible().
                            expectToBeSent();

                        authCheckRequest = tester.authCheckRequest().expectToBeSent();
                    });

                    describe('Произведена авторизация.', function() {
                        beforeEach(function() {
                            authCheckRequest.receiveResponse();

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
                            });

                            describe('Нет пропущенных звонков.', function() {
                                beforeEach(function() {
                                    authenticatedUserRequest.receiveResponse();

                                    tester.slavesNotification().
                                        twoChannels().
                                        softphoneServerConnected().
                                        webRTCServerConnected().
                                        registered().
                                        userDataFetched().
                                        expectToBeSent();
                                });
                                
                                describe('Доступ к микрофону разрешён.', function() {
                                    beforeEach(function() {
                                        tester.allowMediaInput();

                                        tester.slavesNotification().
                                            twoChannels().
                                            available().
                                            expectToBeSent();
                                    });

                                    it(
                                        'Поступил входящий звонок. Поступил еще один входящий звонок. В ' +
                                        'родительское окно отправлено сообщение об изменении размера софтфона.',
                                    function() {
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
                                            authenticated().
                                            visible().
                                            expanded().
                                            expectToBeSent();

                                        tester.incomingCall().thirdNumber().receive();

                                        tester.slavesNotification().
                                            twoChannels().
                                            available().
                                            incoming().
                                            progress().
                                            secondChannel().
                                                incoming().
                                                progress().
                                                fifthPhoneNumber().
                                            expectToBeSent();

                                        tester.numaRequest().thirdNumber().receiveResponse();

                                        tester.outCallEvent().
                                            anotherPerson().
                                            receive();

                                        tester.outCallEvent().
                                            anotherPerson().
                                            slavesNotification().
                                            expectToBeSent();

                                        tester.stateSettingRequest().
                                            authenticated().
                                            noIdleChannels().
                                            expanded().
                                            visible().
                                            expectToBeSent();
                                    });
                                    it('Получен запрос вызова. Производится вызов.', function() {
                                        postMessages.receive({
                                            method: 'start_call',
                                            data: '79161234567',
                                        });

                                        tester.numaRequest().receiveResponse();

                                        tester.firstConnection.connectWebRTC();
                                        tester.allowMediaInput();
                                        tester.outboundCall().start();

                                        tester.slavesNotification().
                                            twoChannels().
                                            available().
                                            sending().
                                            expectToBeSent();
                                    });
                                    it('Раскрываю список статусов. Отображён список статусов.', function() {
                                        tester.userName.click();
                                        
                                        tester.statusesList.
                                            item('Не беспокоить').
                                            expectToBeSelected();
                                        
                                        tester.statusesList.
                                            item('Нет на месте').
                                            expectNotToBeSelected();
                                    });
                                    it('Софтфон готов к использованию.', function() {
                                        tester.phoneField.expectToBeVisible();
                                    });
                                });
                                it(
                                    'Доступ к микрофону запрещён. Отображено сообщение о недоступности микрофона.',
                                function() {
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
                            });
                            it(
                                'Есть пропущенные звонки. Родительское окно оповещено о количестве пропущенных ' +
                                'звонков. Сворачиваю окно. Звонок пропущен. В родительское окно передано ' +
                                'сообщение о пропущенном звонке. Разворачиваю окно. В родительское окно передано ' +
                                'сообщение об отсутствии пропущенных звонков.',
                            function() {
                                authenticatedUserRequest.
                                    newCall().
                                    receiveResponse();

                                tester.stateSettingRequest().
                                    authenticated().
                                    visible().
                                    lostCalls(1).
                                    expectToBeSent();

                                tester.slavesNotification().
                                    twoChannels().
                                    softphoneServerConnected().
                                    webRTCServerConnected().
                                    registered().
                                    userDataFetched().
                                    expectToBeSent();

                                tester.allowMediaInput();

                                tester.slavesNotification().
                                    twoChannels().
                                    available().
                                    expectToBeSent();

                                tester.callsHistoryButton.click();

                                tester.stateSettingRequest().
                                    authenticated().
                                    visible().
                                    expanded().
                                    lostCalls(1).
                                    expectToBeSent();

                                tester.callsRequest().receiveResponse();

                                tester.stateSettingRequest().
                                    authenticated().
                                    visible().
                                    expanded().
                                    expectToBeSent();

                                setDocumentVisible(false);

                                tester.slavesNotification().
                                    twoChannels().
                                    available().
                                    hidden().
                                    expectToBeSent();

                                tester.lostCallSessionEvent().receive();

                                tester.lostCallSessionEvent().
                                    slavesNotification().
                                    expectToBeSent();

                                tester.stateSettingRequest().
                                    authenticated().
                                    visible().
                                    expanded().
                                    lostCalls(1).
                                    expectToBeSent();

                                setDocumentVisible(true);

                                tester.slavesNotification().
                                    twoChannels().
                                    available().
                                    expectToBeSent();

                                tester.stateSettingRequest().
                                    authenticated().
                                    visible().
                                    expanded().
                                    expectToBeSent();
                            });
                        });
                        it('Отображено сообщение об установки соединения.', function() {
                            tester.getEventsWebSocket().expectToBeConnecting();
                            tester.softphone.expectToHaveTextContent('Устанавливается соединение...');
                        });
                    });
                    it('Ну удалось произвести авторизацию.', function() {
                        authCheckRequest.
                            invalidToken().
                            receiveResponse();

                        tester.masterInfoMessage().leaderDeath().expectToBeSent();

                        tester.slavesNotification().
                            destroyed().
                            expectToBeSent();

                        tester.authLogoutRequest().receiveResponse();

                        tester.stateSettingRequest().
                            visible().
                            expectToBeSent();

                        postMessages.nextMessage().expectMessageToContain({
                            method: 'logout',
                        });
                    });
                });
                it('Звонки совершаются через Call API. Получен запрос вызова. Производится вызов.', function() {
                    widgetSettings.
                        callapi().
                        receive();

                    tester.masterInfoMessage().receive();

                    tester.slavesNotification().
                        additional().
                        visible().
                        expectToBeSent();

                    tester.slavesNotification().expectToBeSent();
                    tester.masterInfoMessage().tellIsLeader().expectToBeSent();
                        
                    tester.authTokenRequest().receiveResponse();

                    tester.stateSettingRequest().
                        visible().
                        authenticated().
                        expectToBeSent();

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

                    const authenticatedUserRequest = tester.authenticatedUserRequest().expectToBeSent();
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

                    tester.allowMediaInput();

                    tester.slavesNotification().
                        twoChannels().
                        available().
                        expectToBeSent();

                    postMessages.receive({
                        method: 'start_call',
                        data: '79161234567',
                    });

                    tester.click2CallRequest().receiveResponse();
                });
            });
            it('Софтфон скрыт.', function() {
                tester.softphone.expectNotToExist();
            });
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
                    visibilitySettingRequest.visible().expectResponseToBeSent();
                });

                it('Настройки загружаются. Кнопка входа заблокирована.', function() {
                    tester.widgetSettings().
                        storageData().
                        emptyToken().
                        settingsLoading().
                        receive();

                    tester.button('Войти').expectToBeDisabled();
                });
                it('Нажимаю на кнопку "Войти. Отправлен запрос получения кода авторизации.', function() {
                    tester.button('Войти').click();
                    tester.authorizationRequest().receiveResponse();
                });
                it('Софтфон скрыт. Отображена кнопка "Показать софтфон".', function() {
                    tester.button('Обновить настройки').expectNotToExist();
                    tester.button('Скрыть софтфон').expectNotToExist();
                    tester.button('Показать софтфон').expectNotToExist();
                });
            });
            it('Не удалось отправить сообщение. Отображено сообщение об ошибке.', function() {
                visibilityRequest.fail();
                tester.body.expectTextContentToHaveSubstring('Что-то пошло не так');
            });
        });
        describe('Открываю страницу с расширением. Токен авторизации не был сохранен.', function() {
            beforeEach(function() {
                tester = new Tester({
                    softphoneHost: 'my.uiscom.ru',
                    ...options,
                });

                tester.installmentSettingsProbableUpdatingRequest().receiveResponse();
            });

            describe('Получен токен авторизации и настройки.', function() {
                let widgetSettings;

                beforeEach(function() {
                    widgetSettings = tester.widgetSettings().storageData();
                });

                describe('Кнопка видимости должна добавляться перед элементом.', function() {
                    beforeEach(function() {
                        widgetSettings.receive();

                        tester.stateSettingRequest().receive();
                        tester.visibilitySettingRequest().receiveResponse();

                        tester.widgetSettings().
                            windowMessage().
                            expectToBeSent();
                    });

                    describe('Содержимое страницы изменилось.', function() {
                        beforeEach(function() {
                            tester.page.duplicate();
                            spendTime(999);
                        });

                        it(
                            'Содержимое страницы снова изменилось. Прошло некоторое время.  Кнопка добавлена в ' +
                            'измененное содержимое страницы.',
                        function() {
                            tester.page.triggerMutation();
                            spendTime(1);

                            tester.body.expectToHaveTextContent(
                                'Первый элемент #1 ' +
                                'Трубочка ' +
                                'Некий элемент #1 ' +
                                'Последний элемент #1 ' +

                                'Телефон: 74951234568 ' +
                                'Телефон: 74951234570 ' +
                                'Номер телефона: +74951234572 (74951234571) ' +
                                'Номер телефона: +74951234574 (74951234573) ' +

                                'Первый элемент #2 ' +
                                'Трубочка ' +
                                'Некий элемент #2 ' +
                                'Последний элемент #2 ' +

                                'Телефон: 74951234576 ' +
                                'Телефон: 74951234578 ' +
                                'Номер телефона: +74951234580 (74951234579) ' +
                                'Номер телефона: +74951234582 (74951234581)'
                            );

                            tester.visibilityButton.first.expectToHaveTextContent('Трубочка');
                            tester.visibilityButton.atIndex(1).expectToHaveTextContent('Трубочка');
                        });
                        it('Прошло некоторое время. Кнопка добавлена в измененное содержимое страницы.', function() {
                            spendTime(1);

                            tester.body.expectToHaveTextContent(
                                'Первый элемент #1 ' +
                                'Трубочка ' +
                                'Некий элемент #1 ' +
                                'Последний элемент #1 ' +

                                'Телефон: 74951234568 ' +
                                'Телефон: 74951234570 ' +
                                'Номер телефона: +74951234572 (74951234571) ' +
                                'Номер телефона: +74951234574 (74951234573) ' +

                                'Первый элемент #2 ' +
                                'Трубочка ' +
                                'Некий элемент #2 ' +
                                'Последний элемент #2 ' +

                                'Телефон: 74951234576 ' +
                                'Телефон: 74951234578 ' +
                                'Номер телефона: +74951234580 (74951234579) ' +
                                'Номер телефона: +74951234582 (74951234581)'
                            );

                            tester.visibilityButton.first.expectToHaveTextContent('Трубочка');
                            tester.visibilityButton.atIndex(1).expectToHaveTextContent('Трубочка');
                        });
                        it('Кнопка не была добавлена.', function() {
                            tester.body.expectToHaveTextContent(
                                'Первый элемент #1 ' +
                                'Трубочка ' +
                                'Некий элемент #1 ' +
                                'Последний элемент #1 ' +

                                'Телефон: 74951234568 ' +
                                'Телефон: 74951234570 ' +
                                'Номер телефона: +74951234572 (74951234571) ' +
                                'Номер телефона: +74951234574 (74951234573) ' +

                                'Первый элемент #2 ' +
                                'Некий элемент #2 ' +
                                'Последний элемент #2 ' +

                                '+74951234576 ' +
                                '+74951234578 ' +
                                '+74951234580 ' +
                                '+74951234582'
                            );
                        });
                    });
                    it('В дочернем IFrame  нажимаю на номер телефона. Отправлен запрос вызова.', function() {
                        postMessages.receive({
                            method: 'start_call',
                            data: '74951234571',
                        });

                        postMessages.nextMessage().expectMessageToContain({
                            method: 'start_call',
                            data: '74951234571',
                        });
                    });
                    it(
                        'В дочернем IFrame нажимаю на кнопку видимости. Отправлен запрос изменения видимости.',
                    function() {
                        postMessages.receive({
                            method: 'toggle_widget_visibility'
                        });

                        postMessages.nextMessage().expectMessageToContain({
                            method: 'toggle_widget_visibility'
                        });
                    });
                    it('Нажимаю на номер телефона. Отправлен запрос вызова.', function() {
                        tester.phoneButton.atIndex(2).click();
                        tester.installmentSettingsProbableUpdatingRequest().receiveResponse();

                        postMessages.nextMessage().expectMessageToContain({
                            method: 'start_call',
                            data: '74951234571',
                        });
                    });
                    it('Нажимаю на кнопку видимости. Отправлен запрос изменения видимости.', function() {
                        tester.visibilityButton.click();
                        tester.installmentSettingsProbableUpdatingRequest().receiveResponse();

                        postMessages.nextMessage().expectMessageToContain({
                            method: 'toggle_widget_visibility'
                        });
                    });
                    it(
                        'От IFrame получено сообщение изменения видимости. В popup-скрипт отправлено сообщение об ' +
                        'изменении видимости.',
                    function() {
                        tester.stateSettingRequest().
                            visible().
                            receive();

                        tester.visibilitySettingRequest().
                            visible().
                            receiveResponse();

                        tester.iframe.expectToHaveWidth(340);
                        tester.iframe.expectToHaveHeight(212);
                    });
                    it(
                        'Получено сообщение о пропущенном звонке. Отображено количество пропущенных звонков.',
                    function() {
                        tester.stateSettingRequest().
                            lostCalls(1).
                            receive();

                        tester.visibilitySettingRequest().receiveResponse();
                        tester.visibilityButton.expectToHaveTextContent('Трубочка (1)');
                    });
                    it(
                        'Получаю запрос изменения видимости. В IFrame отправлен запрос изменения видимости.',
                    function() {
                        tester.toggleWidgetVisibilityRequest().expectResponseToBeSent();

                        postMessages.nextMessage().expectMessageToContain({
                            method: 'toggle_widget_visibility'
                        });
                    });
                    it('Получен запрос видимости. В ответ на запрос было отправлено текущее состояние.', function() {
                        tester.visibilityRequest().expectResponseToBeSent();
                        tester.visibilitySettingRequest().receiveResponse();

                        tester.iframe.expectToBeHidden();
                    });
                    it('Получены другие настройки. Кнопка видимости добавлена после элемента.', function() {
                        tester.widgetSettings().
                            storageData().
                            insertAfter().
                            anotherClick2CallHandlers().
                            receive();

                        tester.widgetSettings().
                            windowMessage().
                            insertAfter().
                            anotherClick2CallHandlers().
                            expectToBeSent();

                        tester.phoneButton.
                            first.
                            expectToHaveTag('a');

                        tester.body.expectToHaveTextContent(
                            'Первый элемент #1 ' +
                            'Некий элемент #1 ' +
                            'Трубочка ' +
                            'Последний элемент #1 ' +

                            'Тел: 74951234568 ' +
                            'Тел: 74951234570 ' +
                            'Номер тел: +74951234572 [74951234571] ' +
                            'Номер тел: +74951234574 [74951234573]'
                        );
                    });
                    it('Кнопка видимости добавлена перед элементом.', function() {
                        tester.body.expectToHaveTextContent(
                            'Первый элемент #1 ' +
                            'Трубочка ' +
                            'Некий элемент #1 ' +
                            'Последний элемент #1 ' +

                            'Телефон: 74951234568 ' +
                            'Телефон: 74951234570 ' +
                            'Номер телефона: +74951234572 (74951234571) ' +
                            'Номер телефона: +74951234574 (74951234573)'
                        );

                        tester.phoneButton.
                            first.
                            expectToHaveTag('button');

                        tester.visibilityButton.expectToHaveTextContent('Трубочка');
                    });
                });
                describe('URL страницы не соответствует wildcard.', function() {
                    beforeEach(function() {
                        widgetSettings.
                            anotherWildcart().
                            receive();

                        tester.stateSettingRequest().receive();
                    });

                    it('Получен запрос видимости. В ответ на запрос было отправлено текущее состояние.', function() {
                        tester.visibilityRequest().expectResponseToBeSent();

                        tester.visibilitySettingRequest().
                            disabled().
                            receiveResponse();
                    });
                    it('Кнопка видимости не была добавлена.', function() {
                        tester.body.expectToHaveTextContent(
                            'Первый элемент #1 ' +
                            'Некий элемент #1 ' +
                            'Последний элемент #1 ' +

                            '+74951234568 ' +
                            '+74951234570 ' +
                            '+74951234572 ' +
                            '+74951234574'
                        );

                        tester.iframe.expectNotToExist();
                    });
                });
                describe('Для отображения телефона должно использоваться необработанное значение.', function() {
                    beforeEach(function() {
                        widgetSettings.
                            rawPhone().
                            receive();

                        tester.stateSettingRequest().receive();
                        tester.visibilitySettingRequest().receiveResponse();

                        tester.widgetSettings().
                            rawPhone().
                            windowMessage().
                            expectToBeSent();
                    });

                    it('Нажимаю на кнопку вызова. Отправлен запрос вызова.', function() {
                        tester.phoneButton.
                            first.
                            click();

                        tester.installmentSettingsProbableUpdatingRequest().receiveResponse();

                        postMessages.nextMessage().expectMessageToContain({
                            method: 'start_call',
                            data: '74951234568',
                        });
                    });
                    it('Для отображения телефона используется необработанное значение.', function() {
                        tester.body.expectToHaveTextContent(
                            'Первый элемент #1 ' +
                            'Трубочка ' +
                            'Некий элемент #1 ' +
                            'Последний элемент #1 ' +

                            'Телефон: +74951234568 ' +
                            'Телефон: +74951234570 ' +
                            'Номер телефона: +74951234572 (74951234571) ' +
                            'Номер телефона: +74951234574 (74951234573)'
                        );
                    });
                });
                it(
                    'Кнопка видимости должна быть дефолтной. Кнопка видимости является дефолтной.',
                function() {
                    widgetSettings.
                        noButtonElementSettings().
                        receive();

                    tester.stateSettingRequest().receive();
                    tester.visibilitySettingRequest().receiveResponse();

                    tester.widgetSettings().
                        noButtonElementSettings().
                        windowMessage().
                        expectToBeSent();

                    tester.body.expectToHaveTextContent(
                        'Первый элемент #1 ' +
                        'Софтфон ' +
                        'Некий элемент #1 ' +
                        'Последний элемент #1 ' +

                        'Телефон: 74951234568 ' +
                        'Телефон: 74951234570 ' +
                        'Номер телефона: +74951234572 (74951234571) ' +
                        'Номер телефона: +74951234574 (74951234573)'
                    );

                    tester.visibilityButton.default.expectToHaveTextContent('Софтфон');
                });
                it(
                    'Кнопка видимости должна добавляться после несуществующего элемента. Кнопка видимости не была ' +
                    'добавлена.',
                function() {
                    widgetSettings.
                        insertBeforeNonExistingElement().
                        receive();

                    tester.stateSettingRequest().receive();
                    tester.visibilitySettingRequest().receiveResponse();

                    tester.widgetSettings().
                        insertBeforeNonExistingElement().
                        windowMessage().
                        expectToBeSent();

                    tester.body.expectToHaveTextContent(
                        'Первый элемент #1 ' +
                        'Некий элемент #1 ' +
                        'Последний элемент #1 ' +

                        'Телефон: 74951234568 ' +
                        'Телефон: 74951234570 ' +
                        'Номер телефона: +74951234572 (74951234571) ' +
                        'Номер телефона: +74951234574 (74951234573)'
                    );
                });
                it(
                    'Кнопка видимости должна добавляться после последнего элемента. Кнопка видимости добавлена в ' +
                    'конец.',
                function() {
                    widgetSettings.
                        insertAfterLastElement().
                        receive();

                    tester.stateSettingRequest().receive();
                    tester.visibilitySettingRequest().receiveResponse();

                    tester.widgetSettings().
                        insertAfterLastElement().
                        windowMessage().
                        expectToBeSent();

                    tester.body.expectToHaveTextContent(
                        'Первый элемент #1 ' +
                        'Некий элемент #1 ' +
                        'Последний элемент #1 ' +
                        'Трубочка ' +

                        'Телефон: 74951234568 ' +
                        'Телефон: 74951234570 ' +
                        'Номер телефона: +74951234572 (74951234571) ' +
                        'Номер телефона: +74951234574 (74951234573)'
                    );
                });
                it(
                    'Кнопка видимости должна добавляться после элемента. Кнопка видимости добавлена после элемента.',
                function() {
                    widgetSettings.
                        insertAfter().
                        receive();

                    tester.stateSettingRequest().receive();
                    tester.visibilitySettingRequest().receiveResponse();

                    tester.widgetSettings().
                        insertAfter().
                        windowMessage().
                        expectToBeSent();

                    tester.body.expectToHaveTextContent(
                        'Первый элемент #1 ' +
                        'Некий элемент #1 ' +
                        'Трубочка ' +
                        'Последний элемент #1 ' +

                        'Телефон: 74951234568 ' +
                        'Телефон: 74951234570 ' +
                        'Номер телефона: +74951234572 (74951234571) ' +
                        'Номер телефона: +74951234574 (74951234573)'
                    );
                });
                it(
                    'Кнопка видимости должна добавляться внутрь элемента. Кнопка видимости добавлена внурть элемента.',
                function() {
                    widgetSettings.
                        insertInto().
                        receive();

                    tester.stateSettingRequest().receive();
                    tester.visibilitySettingRequest().receiveResponse();

                    tester.widgetSettings().
                        insertInto().
                        windowMessage().
                        expectToBeSent();

                    tester.body.expectToHaveTextContent(
                        'Первый элемент #1 ' +
                        'Некий элемент #1 ' +
                        'Последний элемент #1 ' +

                        'Трубочка ' +

                        'Телефон: 74951234568 ' +
                        'Телефон: 74951234570 ' +
                        'Номер телефона: +74951234572 (74951234571) ' +
                        'Номер телефона: +74951234574 (74951234573)'
                    );
                });
                it(
                    'Использую XPath для поиска элемента, перед которым нужно вставить кнопку видиомсти. Кнопка ' +
                    'видимости вставлена.',
                function() {
                    widgetSettings.
                        buttonElementXpath().
                        receive();

                    tester.stateSettingRequest().receive();
                    tester.visibilitySettingRequest().receiveResponse();

                    tester.widgetSettings().
                        buttonElementXpath().
                        windowMessage().
                        expectToBeSent();

                    tester.body.expectToHaveTextContent(
                        'Первый элемент #1 ' +
                        'Некий элемент #1 ' +
                        'Трубочка ' +
                        'Последний элемент #1 ' +

                        'Телефон: 74951234568 ' +
                        'Телефон: 74951234570 ' +
                        'Номер телефона: +74951234572 (74951234571) ' +
                        'Номер телефона: +74951234574 (74951234573)'
                    );
                });
                it(
                    'По XPath номера телефона удается найти несколько элементов. Значения подставлены в кнопки ' +
                    'номеров телефонов.',
                function() {
                    widgetSettings.
                        phoneListXpath().
                        receive();

                    tester.stateSettingRequest().receive();
                    tester.visibilitySettingRequest().receiveResponse();

                    tester.widgetSettings().
                        phoneListXpath().
                        windowMessage().
                        expectToBeSent();

                    tester.body.expectToHaveTextContent(
                        'Первый элемент #1 ' +
                        'Трубочка ' +
                        'Некий элемент #1 ' +
                        'Последний элемент #1 ' +

                        'Телефон: 74951234565 ' +
                        'Телефон: 74951234566 ' +
                        'Номер телефона: +74951234572 (74951234571) ' +
                        'Номер телефона: +74951234574 (74951234573)'
                    );
                });
                it('Не переданы настройки доступного для перемещения пространства. IFrame отображен.', function() {
                    widgetSettings.
                        noPadding().
                        receive();

                    tester.stateSettingRequest().
                        visible().
                        receive();

                    tester.visibilitySettingRequest().
                        visible().
                        receiveResponse();

                    tester.widgetSettings().
                        noPadding().
                        windowMessage().
                        expectToBeSent();

                    tester.iframe.expectToBeVisible();
                });
                it('Настройки отсутствуют. Кнопка видимости не была добавлена.', function() {
                    widgetSettings.
                        emptyToken().
                        receive();

                    tester.stateSettingRequest().receive();

                    tester.body.expectToHaveTextContent(
                        'Первый элемент #1 ' +
                        'Некий элемент #1 ' +
                        'Последний элемент #1 ' +

                        '+74951234568 ' +
                        '+74951234570 ' +
                        '+74951234572 ' +
                        '+74951234574'
                    );

                    tester.iframe.expectNotToExist();
                });
            });
            it('IFrame отсутствует.', function() {
                tester.iframe.expectNotToExist();
            });
        });
        describe('Открываю попап. Отправлен запрос состояния.', function() {
            let visibilitySettingRequest;

            beforeEach(function() {
                tester = new Tester({
                    application: 'popup',
                    isAuthorized: true,
                    ...options,
                });

                tester.visibilityRequest().receiveResponse();
                visibilitySettingRequest = tester.visibilitySettingRequest();
            });

            describe('Софтон скрыт.', function() {
                beforeEach(function() {
                    visibilitySettingRequest.expectResponseToBeSent();
                });

                it('Нажимаю на кнопку выхода. Отправлен запрос выхода.', function() {
                    tester.button('Выйти').click();
                    tester.logoutRequest().receiveResponse();
                });
                it('Нажимаю на кнопку "Обновить настройки". Настройки обновлены.', function() {
                    tester.button('Обновить настройки').click();

                    tester.installmentSettingsUpdatingRequest().
                        fromPopup().
                        expectToBeSent();
                });
                it('Настройки загружаются. Кнопки заблокированы.', function() {
                    tester.widgetSettings().
                        storageData().
                        settingsLoading().
                        receive();

                    tester.button('Выйти').expectToBeDisabled();
                    tester.button('Показать софтфон').expectToBeDisabled();
                    tester.button('Обновить настройки').expectToBeDisabled();
                });
                it('Кнопка входа скрыта.', function() {
                    tester.button('Войти').expectNotToExist();
                    tester.button('Показать софтфон').expectToBeVisible();
                });
            });
            it('Софтфон видим. Нажимаю на кнопку "Скрыть софтфон". Отправлен запрос изменения видимости.', function() {
                visibilitySettingRequest.visible().expectResponseToBeSent();

                tester.button('Скрыть софтфон').click();

                tester.chrome.
                    permissions.
                    nextRequest().
                    grant();

                tester.installmentSettingsProbableUpdatingRequest().
                    fromPopup().
                    receiveResponse();

                tester.toggleWidgetVisibilityRequest().receiveResponse();
            });
            it('Софтфон отсутствует. Кнопки видимости софтфона скрыты.', function() {
                visibilitySettingRequest.
                    disabled().
                    expectResponseToBeSent();

                tester.button('Скрыть софтфон').expectNotToExist();
                tester.button('Показать софтфон').expectNotToExist();
            });
        });
        describe('Открываю background-скрипт. Софтфон авторизован.', function() {
            let oauthRequest;

            beforeEach(function() {
                tester = new Tester({
                    application: 'background',
                    isAuthorized: true,
                    ...options,
                });
            });

            describe('Получен запрос обновления настроек.', function() {
                let widgetSettings;

                beforeEach(function() {
                    tester.installmentSettingsUpdatingRequest().expectResponseToBeSent();

                    tester.chrome.
                        permissions.
                        nextRequest().
                        grant();

                    widgetSettings = tester.widgetSettings().
                        request().
                        expectToBeSent();
                });

                it(
                    'Настройки обновлены. Получен ещё один запрос обновления настроек. Настройки ещё раз обновлены.',
                function() {
                    widgetSettings.receiveResponse();

                    tester.widgetSettings().
                        storageData().
                        expectToBeSaved();

                    tester.installmentSettingsUpdatingRequest().expectResponseToBeSent();

                    tester.chrome.
                        permissions.
                        nextRequest().
                        grant();

                    tester.widgetSettings().
                        request().
                        receiveResponse();

                    tester.widgetSettings().
                        storageData().
                        expectToBeSaved();
                });
                it(
                    'Прошло некоторое время. Получен ещё один запрос обновления настроек. Настройки не обновлены.',
                function() {
                    setNow('2019-12-19T12:11:06');
                    tester.installmentSettingsUpdatingRequest().expectResponseToBeSent();

                    tester.chrome.
                        permissions.
                        nextRequest().
                        grant();

                    tester.widgetSettings().
                        request().
                        expectToBeSent();
                });
                it('Получен ещё один запрос обновления настроек. Настройки не обновлены.', function() {
                    tester.installmentSettingsUpdatingRequest().expectResponseToBeSent();

                    tester.chrome.
                        permissions.
                        nextRequest().
                        grant();
                });
            });
            describe('Получен запрос выхода. Производится выход.', function() {
                beforeEach(function() {
                    tester.logoutRequest().expectResponseToBeSent();

                    tester.chrome.
                        permissions.
                        nextRequest().
                        grant();

                    tester.authFlow().
                        logout().
                        expectToBeLaunched().
                        receiveResponse();

                    oauthRequest = tester.oauthRequest().expectToBeSent();
                });

                it('Получен новый токен авторизации. Токен сохранен.', function() {
                    oauthRequest.receiveResponse();

                    tester.widgetSettings().
                        request().
                        receiveResponse();

                    tester.widgetSettings().
                        storageData().
                        expectToBeSaved();
                });
                it('Получен запрос обновления настроек. Настройки не обновлены.', function() {
                    tester.installmentSettingsUpdatingRequest().expectResponseToBeSent();

                    tester.chrome.
                        permissions.
                        nextRequest().
                        grant();
                });
                it('Токен авторизации удалён.', function() {
                    tester.widgetSettings().
                        storageData().
                        emptyToken().
                        settingsLoading().
                        expectToBeSaved();
                });
            });
            it('Получен запрос возможного обновления настроек. Настройки не обновлены.', function() {
                tester.installmentSettingsProbableUpdatingRequest().expectResponseToBeSent();

                tester.chrome.
                    permissions.
                    nextRequest().
                    grant();
            });
        });
        describe('Открываю background-скрипт.', function() {
            beforeEach(function() {
                tester = new Tester({
                    application: 'background',
                    ...options,
                });
            });
            
            describe('Приходит запрос авторизации.', function() {
                beforeEach(function() {
                    tester.authorizationRequest().expectResponseToBeSent();

                    permissionsRequest = tester.chrome.
                        permissions.
                        nextRequest().
                        expectHostPermissionToBeRequested('https://uc-sso-prod-api.uiscom.ru/*').
                        expectHostPermissionToBeRequested('https://my.uiscom.ru/*');
                });

                describe('Права предоставлены. Производится попытка открыть форму авторизации.', function() {
                    let authFlow;

                    beforeEach(function() {
                        permissionsRequest.grant();
                        authFlow = tester.authFlow().expectToBeLaunched();
                    });

                    it(
                        'Не удалось открыть форму авторизации. Приходит запрос авторизации. Производится попытка ' +
                        'открыть форму авторизации.',
                    function() {
                        authFlow.fail();
                        tester.authorizationRequest().expectResponseToBeSent();

                        tester.chrome.
                            permissions.
                            nextRequest().
                            grant();

                        tester.authFlow().expectToBeLaunched();
                    });
                    it(
                        'Получен код авторизации. Получен авторизационный токен. В текущей вкладке установлен ' +
                        'авторизационный токен. В хранилище сохранено состояние вкладки.',
                    function() {
                        authFlow.receiveResponse();
                        tester.oauthRequest().receiveResponse();

                        tester.widgetSettings().
                            request().
                            receiveResponse();

                        tester.widgetSettings().
                            storageData().
                            expectToBeSaved();
                    });
                    it('Приходит запрос авторизации. Попытка открыть форму авторизации не производится.', function() {
                        tester.authorizationRequest().expectResponseToBeSent();

                        tester.chrome.
                            permissions.
                            nextRequest().
                            grant();
                    });
                });
                it('Права не были предоставлены. Форма авторизации не была открыта .', function() {
                    permissionsRequest.deny();
                });
            });
            it('Получен запрос возможного обновления настроек. Настройки не обновлены.', function() {
                tester.installmentSettingsProbableUpdatingRequest().expectResponseToBeSent();

                tester.chrome.
                    permissions.
                    nextRequest().
                    grant();

                tester.widgetSettings().
                    storageData().
                    noData().
                    expectToBeSaved();
            });
            it('Приходит запрос, не являющийся запросом авторизации. Авторизация не производится.', function() {
                tester.visibilitySettingRequest().expectResponseToBeSent();
            });
        });
        describe('Контент скрипт встроился в IFrame.', function() {
            beforeEach(function() {
                tester = new Tester({
                    softphoneHost: 'my.uiscom.ru',
                    isAuthorized: true,
                    isIframe: true,
                    ...options,
                });

                tester.installmentSettingsProbableUpdatingRequest().receiveResponse();
            });

            it('Нажимаю на номер телефона. Отправлен запрос вызова.', function() {
                tester.phoneButton.atIndex(2).click();
                tester.installmentSettingsProbableUpdatingRequest().receiveResponse();

                postMessages.nextMessage().expectMessageToContain({
                    method: 'start_call',
                    data: '74951234571',
                });
            });
            it('Нажимаю на кнопку видимости. Отправлен запрос изменения видимости.', function() {
                tester.visibilityButton.click();
                tester.installmentSettingsProbableUpdatingRequest().receiveResponse();

                postMessages.nextMessage().expectMessageToContain({
                    method: 'toggle_widget_visibility'
                });
            });
            it('В дочернем IFrame  нажимаю на номер телефона. Отправлен запрос вызова.', function() {
                postMessages.receive({
                    method: 'start_call',
                    data: '74951234571',
                });

                postMessages.nextMessage().expectMessageToContain({
                    method: 'start_call',
                    data: '74951234571',
                });
            });
            it('В дочернем IFrame нажимаю на кнопку видимости. Отправлен запрос изменения видимости.', function() {
                postMessages.receive({
                    method: 'toggle_widget_visibility'
                });

                postMessages.nextMessage().expectMessageToContain({
                    method: 'toggle_widget_visibility'
                });
            });
            it('Добавлены кнопки видимости и кнопи телефонов. IFrame софтфона отсутствует.', function() {
                tester.iframe.expectNotToExist();

                tester.body.expectToHaveTextContent(
                    'Первый элемент #1 ' +
                    'Трубочка ' +
                    'Некий элемент #1 ' +
                    'Последний элемент #1 ' +

                    'Телефон: 74951234568 ' +
                    'Телефон: 74951234570 ' +
                    'Номер телефона: +74951234572 (74951234571) ' +
                    'Номер телефона: +74951234574 (74951234573)'
                );
            });
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

            describe('Из родительского окна приходит токен. Прозиводится авторизация.', function() {
                let authCheckRequest;

                beforeEach(function() {
                    postMessages.receive({
                        method: 'set_token',
                        data: '23f8DS8sdflsdf8DslsdfLSD0ad31Ffsdf',
                    });

                    tester.masterInfoMessage().receive();

                    tester.slavesNotification().
                        additional().
                        expectToBeSent();

                    tester.slavesNotification().expectToBeSent();
                    tester.masterInfoMessage().tellIsLeader().expectToBeSent();
                        
                    tester.authTokenRequest().receiveResponse()

                    tester.stateSettingRequest().
                        authenticated().
                        expectToBeSent();

                    authCheckRequest = tester.authCheckRequest().expectToBeSent();
                });

                it('Ну удалось произвести авторизацию.', function() {
                    authCheckRequest.
                        invalidToken().
                        receiveResponse();

                    tester.masterInfoMessage().leaderDeath().expectToBeSent();

                    tester.slavesNotification().
                        destroyed().
                        expectToBeSent();

                    tester.authLogoutRequest().receiveResponse();
                    tester.stateSettingRequest().expectToBeSent();

                    postMessages.nextMessage().expectMessageToContain({
                        method: 'logout',
                    });

                    {
                        const actualValue = window.localStorage.getItem('token');

                        if (!!actualValue) {
                            throw new Error(
                                'Токен не должен быть сохранен, тогда как был сохранен токен "' + actualValue + '".'
                            );
                        }
                    }
                });
                it('Удалось авторизоваться. Софтон готов к использованию.', function() {
                    authCheckRequest.receiveResponse();

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

                    authenticatedUserRequest.receiveResponse();

                    tester.slavesNotification().
                        twoChannels().
                        softphoneServerConnected().
                        webRTCServerConnected().
                        registered().
                        userDataFetched().
                        expectToBeSent();
                        tester.allowMediaInput();

                    tester.slavesNotification().
                        twoChannels().
                        available().
                        expectToBeSent();

                    {
                        const actualValue = window.localStorage.getItem('token'),
                            expectedValue = '23f8DS8sdflsdf8DslsdfLSD0ad31Ffsdf';

                        if (actualValue != expectedValue) {
                            throw new Error(
                                'Должен быть сохранен токен "' + expectedValue + '", а не "' + actualValue + '".'
                            );
                        }
                    }
                });
            });
            it('Приходит запрос изменения видимости. Софтфон отображён.', function() {
                postMessages.receive({
                    method: 'toggle_widget_visibility'
                });

                tester.stateSettingRequest().
                    visible().
                    expectToBeSent();

                tester.span('Для использования софтфона необходимо авторизоваться').click();
                windowOpener.expectToHavePath('https://uc-sso-amocrm-prod-api.uiscom.ru');
            });
        });
        describe('Открываю виджет amoCRM.', function() {
            beforeEach(function() {
                tester = new Tester({
                    softphoneHost: 'my.uiscom.ru',
                    ...options,
                    application: 'amocrm',
                });
            });

            describe('Получено состояние софтфона. Софтфон должен быть видимым.', function() {
                beforeEach(function() {
                    tester.stateSettingRequest().
                        visible().
                        receive();
                });

                it('Получаю токен. Передаю токен в софтфон.', function() {
                    postMessages.receive({
                        method: 'set_token',
                        data: '23f8DS8sdflsdf8DslsdfLSD0ad31Ffsdf',
                    });

                    postMessages.nextMessage().expectMessageToContain({
                        method: 'set_token',
                        data: '23f8DS8sdflsdf8DslsdfLSD0ad31Ffsdf',
                    });
                });
                it('Нажимаю на номер телефона. В софтфон отправлен запрос звонка.', function() {
                    tester.contactPhone('79161234567').click();

                    postMessages.nextMessage().expectMessageToContain({
                        method: 'start_call',
                        data: '79161234567',
                    });
                });
                it(
                    'Нажимаю на иконку с телефоном. В IFrame софтфона отправлен запрос изменения видимости.',
                function() {
                    tester.clickPhoneIcon();

                    postMessages.nextMessage().expectMessageToContain({
                        method: 'toggle_widget_visibility'
                    });
                });
                it('Открываю настройки. Нажимаю на кнопку входа. Открыта страница авторизации.', function() {
                    tester.openSettings();
                    tester.button('Войти').expectToBeVisible();
                });
                it('Софтфон отображен.', function() {
                    tester.iframe.expectToBeVisible();
                });
            });
            describe('Открываю настройки.', function() {
                beforeEach(function() {
                    tester.openSettings();
                });

                describe('Получено состояние софтфона.', function() {
                    let stateSettingRequest;

                    beforeEach(function() {
                        stateSettingRequest = tester.stateSettingRequest();
                    });

                    it('Софтон авторизован. Отображена кнопка выхода.', function() {
                        stateSettingRequest.authenticated().receive();

                        tester.button('Выйти').click();
                        windowOpener.expectToHavePath('https://uc-sso-amocrm-prod-api.uiscom.ru');
                    });
                    it('Софтон не авторизован. Отображена кнопка входа.', function() {
                        stateSettingRequest.receive();

                        tester.button('Войти').click();
                        windowOpener.expectToHavePath('https://uc-sso-amocrm-prod-api.uiscom.ru');
                    });
                });
                it('Кнопки авторизации скрыты.', function() {
                    tester.button('Войти').expectToBeHiddenOrNotExist();
                    tester.button('Выйти').expectToBeHiddenOrNotExist();
                });
            });
            it('IFrame скрыт.', function() {
                tester.iframe.expectToBeHidden();
            });
        });
        it(
            'В локальном хранилище сохранен токен. Открыт IFrame софтфона amoCRM. Производится авторизация.',
        function() {
            window.localStorage.setItem('token', '23f8DS8sdflsdf8DslsdfLSD0ad31Ffsdf');

            tester = new Tester({
                application: 'amocrmIframeContent',
                isIframe: true,
                softphoneHost: 'my.uiscom.ru',
                ...options,
            });

            tester.stateSettingRequest().expectToBeSent();
            tester.masterInfoMessage().receive();

            tester.slavesNotification().
                additional().
                expectToBeSent();

            tester.slavesNotification().expectToBeSent();
            tester.masterInfoMessage().tellIsLeader().expectToBeSent();
                
            tester.authTokenRequest().receiveResponse()

            tester.stateSettingRequest().
                authenticated().
                expectToBeSent();

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
                authenticatedUserRequest.receiveResponse();

            tester.slavesNotification().
                twoChannels().
                softphoneServerConnected().
                webRTCServerConnected().
                registered().
                userDataFetched().
                expectToBeSent();
                tester.allowMediaInput();

            tester.slavesNotification().
                twoChannels().
                available().
                expectToBeSent();
        });
        it(
            'Контент скрипт встроился в IFrame. URL не находится в списке тех, на которых расширение должно ' +
            'работать. Приходит запрос изменения видимости.',
        function() {
            tester = new Tester({
                softphoneHost: 'my.uiscom.ru',
                isAuthorized: true,
                anotherWildcart: true,
                isIframe: true,
                ...options,
            });

            tester.installmentSettingsProbableUpdatingRequest().receiveResponse();

            postMessages.receive({
                method: 'toggle_widget_visibility'
            });
        });
        it(
            'Открываю background-скрипт. Софтфон авторизован. Время хранения настроек истекло. Получен запрос ' +
            'возможного обновления настроек. Настройки обновлены.',
        function() {
            tester = new Tester({
                application: 'background',
                isAuthorized: true,
                areSettingsExpired: true,
                ...options,
            });

            tester.installmentSettingsProbableUpdatingRequest().expectResponseToBeSent();

            tester.chrome.
                permissions.
                nextRequest().
                grant();

            tester.widgetSettings().
                request().
                receiveResponse();

            tester.widgetSettings().
                storageData().
                expectToBeSaved();
        });
        it('Открываю страницу с расширением. Токен авторизации был сохранен. В IFrame отправлен токен.', function() {
            tester = new Tester({
                softphoneHost: 'my.uiscom.ru',
                isAuthorized: true,
                ...options,
            });

            tester.installmentSettingsProbableUpdatingRequest().receiveResponse();

            tester.stateSettingRequest().
                authenticated().
                receive();
            
            tester.visibilitySettingRequest().receiveResponse();

            tester.widgetSettings().
                windowMessage().
                expectToBeSent();

            postMessages.receive({
                method: 'logout',
            });

            tester.widgetSettings().
                windowMessage().
                emptyToken().
                expectToBeSent();

            tester.widgetSettings().
                storageData().
                emptyToken().
                expectToBeSaved();
        });
    });
});
