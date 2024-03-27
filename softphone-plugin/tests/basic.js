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
            tester.restoreSoftphoneIFrameContentWindow();

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

                    tester.widgetSettings().
                        windowMessage().
                        receive();

                    tester.masterInfoMessage().receive();

                    tester.slavesNotification().
                        additional().
                        visible().
                        expectToBeSent();

                    tester.slavesNotification().expectToBeSent();
                    tester.masterInfoMessage().tellIsLeader().expectToBeSent();
                        
                    tester.authTokenRequest().receiveResponse()
                    authCheckRequest = tester.authCheckRequest().expectToBeSent();
                });

                describe('Произведена авторизация.', function() {
                    let settingsRequest;

                    beforeEach(function() {
                        authCheckRequest.receiveResponse();

                        tester.talkOptionsRequest().receiveResponse();
                        tester.permissionsRequest().receiveResponse();
                        tester.statusesRequest().receiveResponse();
                        settingsRequest = tester.settingsRequest().expectToBeSent();
                    });

                    describe('Управление звонками производится при помощи софтфона.', function() {
                        beforeEach(function() {
                            settingsRequest.receiveResponse();

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

                                    tester.stateSettingRequest().
                                        visible().
                                        userDataFetched().
                                        expectToBeSent();

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

                                    describe(
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
                                            noIdleChannels().
                                            expanded().
                                            visible().
                                            expectToBeSent();
                                    });
                                    describe('Получен запрос вызова. Производится вызов.', function() {
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
                                    describe('Раскрываю список статусов. Отображён список статусов.', function() {
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
                                    visible().
                                    lostCalls(1).
                                    expectToBeSent();

                                tester.stateSettingRequest().
                                    visible().
                                    userDataFetched().
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
                                    visible().
                                    userDataFetched().
                                    expanded().
                                    lostCalls(1).
                                    expectToBeSent();

                                tester.callsRequest().receiveResponse();

                                tester.stateSettingRequest().
                                    visible().
                                    userDataFetched().
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
                                    visible().
                                    userDataFetched().
                                    expanded().
                                    lostCalls(1).
                                    expectToBeSent();

                                setDocumentVisible(true);

                                tester.slavesNotification().
                                    twoChannels().
                                    available().
                                    expectToBeSent();

                                tester.stateSettingRequest().
                                    visible().
                                    expanded().
                                    userDataFetched().
                                    expectToBeSent();
                            });
                        });
                        it('Отображено сообщение об установки соединения.', function() {
                            tester.getEventsWebSocket().expectToBeConnecting();
                            tester.softphone.expectToHaveTextContent('Устанавливается соединение...');
                        });
                    });
                    it('Включено управление звонками на другом устройстве.', function() {
                        settingsRequest.callsAreManagedByAnotherDevice().receiveResponse();

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

                        tester.authenticatedUserRequest().receiveResponse();

                        tester.stateSettingRequest().
                            userDataFetched().
                            visible().
                            expectToBeSent();

                        tester.slavesNotification().
                            userDataFetched().
                            twoChannels().
                            disabled().
                            softphoneServerConnected().
                            expectToBeSent();

                        postMessages.receive({
                            method: 'start_call',
                            data: '79161234567',
                        });

                        tester.click2CallRequest().receiveResponse();
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

                    postMessages.nextMessage().expectMessageToContain({
                        method: 'logout',
                    });
                });
            });
            it('Софтфон скрыт.', function() {
                tester.softphone.expectNotToExist();
            });
        });
        describe('Открываю попап. Отправлен запрос состояния.', function() {
            let stateRequest,
                popupStateSettingRequest;

            beforeEach(function() {
                tester = new Tester({
                    application: 'popup',
                    ...options,
                });

                stateRequest = tester.stateRequest().expectToBeSent();
                popupStateSettingRequest = tester.popupStateSettingRequest();
            });

            describe('Получен ответ.', function() {
                beforeEach(function() {
                    stateRequest.receiveResponse();

                    popupStateSettingRequest.
                        visible().
                        expectResponseToBeSent();
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
                it('Кнопки видимости софтфона скрыты.', function() {
                    tester.refreshButton.expectNotToExist();
                    tester.switchButton('Показать софтфон').expectNotToExist();
                    tester.body.expectTextContentToHaveSubstring('Вы не авторизованы');
                });
            });
            describe('Получено сообщение о безуспешной попытке авторизации.', function() {
                beforeEach(function() {
                    tester.widgetSettings().
                        failedToAuthorize().
                        storageData().
                        receive();
                });

                it('Получен авторизационный токен. Сообщение об ошибке скрыто.', function() {
                    tester.widgetSettings().
                        storageData().
                        receive();

                    tester.body.expectTextContentNotToHaveSubstring('Не удалось авторизоваться');
                });
                it('Отображено сообщение об ошибке.', function() {
                    tester.body.expectTextContentToHaveSubstring('Не удалось авторизоваться');

                    tester.widgetSettings().
                        failedToAuthorize().
                        noError().
                        storageData().
                        expectToBeSaved();
                });
            });
            it('Не удалось отправить сообщение. Отображено сообщение об ошибке.', function() {
                stateRequest.fail();
                tester.body.expectTextContentToHaveSubstring('Что-то пошло не так');

                tester.button('Обновить').click();

                tester.chrome.
                    tabs.
                    current.
                    expectToBeReloaded();
            });
        });
        describe('Открываю страницу с расширением. Токен авторизации не был сохранен.', function() {
            beforeEach(function() {
                tester = new Tester({
                    softphoneHost: 'my.uiscom.ru',
                    ...options,
                });

                tester.installmentSettingsProbableUpdatingRequest().receiveResponse();
                tester.chatsVisibilitySettingRequest().receiveResponse();
            });

            describe('Получен токен авторизации и настройки.', function() {
                let widgetSettings;

                beforeEach(function() {
                    widgetSettings = tester.widgetSettings().storageData();
                });

                describe('Кнопка видимости должна добавляться перед элементом.', function() {
                    beforeEach(function() {
                        widgetSettings.receive();

                        tester.stateSettingRequest().
                            userDataFetched().
                            receive();

                        tester.popupStateSettingRequest().
                            userDataFetched().
                            receiveResponse();

                        tester.widgetSettings().
                            windowMessage().
                            expectToBeSent();
                    });

                    describe('Получено событие инициализации чатов.', function() {
                        beforeEach(function() {
                            tester.submoduleInitilizationEvent().receive();

                            tester.widgetSettings().
                                windowMessage().
                                chatsSettings().
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
                                    '[+7 (495) 123-45-64] ' +
                                    '[+7 (495) 123-45-63] ' +

                                    'Первый элемент #2 ' +
                                    'Трубочка ' +
                                    'Некий элемент #2 ' +
                                    'Последний элемент #2 ' +

                                    'Телефон: 74951234576 ' +
                                    'Телефон: 74951234578 ' +
                                    'Номер телефона: +74951234580 (74951234579) ' +
                                    'Номер телефона: +74951234582 (74951234581) ' +
                                    '[+7 (495) 123-45-64] ' +
                                    '[+7 (495) 123-45-63]'
                                );

                                tester.visibilityButton.first.expectToHaveTextContent('Трубочка');
                                tester.visibilityButton.atIndex(1).expectToHaveTextContent('Трубочка');
                            });
                            it(
                                'Прошло некоторое время. Кнопка добавлена в измененное содержимое страницы.',
                            function() {
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
                                    '[+7 (495) 123-45-64] ' +
                                    '[+7 (495) 123-45-63] ' +

                                    'Первый элемент #2 ' +
                                    'Трубочка ' +
                                    'Некий элемент #2 ' +
                                    'Последний элемент #2 ' +

                                    'Телефон: 74951234576 ' +
                                    'Телефон: 74951234578 ' +
                                    'Номер телефона: +74951234580 (74951234579) ' +
                                    'Номер телефона: +74951234582 (74951234581) ' +
                                    '[+7 (495) 123-45-64] ' +
                                    '[+7 (495) 123-45-63]'
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
                                    '[+7 (495) 123-45-64] ' +
                                    '[+7 (495) 123-45-63] ' +

                                    'Первый элемент #2 ' +
                                    'Некий элемент #2 ' +
                                    'Последний элемент #2 ' +

                                    '+74951234576 ' +
                                    '+74951234578 ' +
                                    '+74951234580 ' +
                                    '+74951234582 ' +
                                    '[+7 (495) 123-45-64] ' +
                                    '[+7 (495) 123-45-63]'
                                );
                            });
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

                            tester.widgetSettings().
                                windowMessage().
                                chatsSettings().
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
                                'Номер тел: +74951234574 [74951234573] ' +
                                '[+7 (495) 123-45-64] ' +
                                '[+7 (495) 123-45-63]'
                            );
                        });
                        it('Получен запрос изменения видимости чатов. Чаты видимы.', function() {
                            tester.toggleChatsVisibilityRequest().expectResponseToBeSent();

                            tester.chatsVisibilitySettingRequest().
                                visible().
                                receiveResponse();

                            tester.iframe.first.expectToBeHidden();
                            tester.iframe.atIndex(1).expectToBeVisible();
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
                            'От IFrame получено сообщение изменения видимости. В popup-скрипт отправлено сообщение ' +
                            'об изменении видимости.',
                        function() {
                            tester.stateSettingRequest().
                                userDataFetched().
                                visible().
                                receive();

                            tester.popupStateSettingRequest().
                                userDataFetched().
                                visible().
                                receiveResponse();

                            tester.iframe.first.expectToHaveWidth(340);
                            tester.iframe.first.expectToHaveHeight(212);

                            tester.iframe.atIndex(1).expectToBeHidden();
                        });
                        it(
                            'Получено сообщение о пропущенном звонке. Отображено количество пропущенных звонков.',
                        function() {
                            tester.stateSettingRequest().
                                userDataFetched().
                                lostCalls(1).
                                receive();

                            tester.popupStateSettingRequest().
                                userDataFetched().
                                receiveResponse();

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
                        it(
                            'Получен запрос видимости. В ответ на запрос было отправлено текущее состояние.',
                        function() {
                            tester.stateRequest().expectResponseToBeSent();

                            tester.popupStateSettingRequest().receiveResponse();
                            tester.chatsVisibilitySettingRequest().receiveResponse();

                            tester.iframe.first.expectToBeHidden();
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
                                'Номер телефона: +74951234574 (74951234573) ' +
                                '[+7 (495) 123-45-64] ' +
                                '[+7 (495) 123-45-63]'
                            );

                            tester.phoneButton.
                                first.
                                expectToHaveTag('button');

                            tester.visibilityButton.expectToHaveTextContent('Трубочка');
                            
                            tester.iframe.first.expectAttributeToHaveValue(
                                'src',
                                'https://prod-msk-softphone-widget-iframe.uiscom.ru/chrome/softphone',
                            );
                        });
                    });
                    it('Запрос установления настроек чатов не был отправлен.', function() {
                        postMessages.nextMessage().expectNotToExist();
                    });
                });
                describe('URL страницы не соответствует wildcard.', function() {
                    beforeEach(function() {
                        widgetSettings.
                            anotherWildcart().
                            receive();

                        tester.submoduleInitilizationEvent().receive();

                        tester.widgetSettings().
                            windowMessage().
                            chatsSettings().
                            expectToBeSent();
                    });

                    describe('Получен запрос отображения софтфона.', function() {
                        beforeEach(function() {
                            tester.toggleWidgetVisibilityRequest().receive();
                        });

                        it('Получен запрос изменения состояния софтфона.', function() {
                            tester.stateSettingRequest().receive();

                            tester.widgetSettings().
                                noSettings().
                                windowMessage().
                                expectToBeSent();

                            tester.popupStateSettingRequest().receiveResponse();

                            postMessages.nextMessage().expectMessageToContain({
                                method: 'toggle_widget_visibility'
                            });
                        });
                        it('Отображен IFrame софтфона.', function() {
                            tester.iframe.first.expectAttributeToHaveValue(
                                'src',
                                'https://prod-msk-softphone-widget-iframe.uiscom.ru/chrome/softphone',
                            );

                            tester.iframe.atIndex(1).expectAttributeToHaveValue(
                                'src',
                                'https://prod-msk-softphone-widget-iframe.uiscom.ru/chrome/chats',
                            );
                        });
                    });
                    it('Получен запрос видимости. В ответ на запрос было отправлено текущее состояние.', function() {
                        tester.stateRequest().expectResponseToBeSent();

                        tester.popupStateSettingRequest().
                            disabled().
                            receiveResponse();

                        tester.chatsVisibilitySettingRequest().receiveResponse();
                    });
                    it('Кнопка видимости не была добавлена.', function() {
                        tester.body.expectToHaveTextContent(
                            'Первый элемент #1 ' +
                            'Некий элемент #1 ' +
                            'Последний элемент #1 ' +

                            '+74951234568 ' +
                            '+74951234570 ' +
                            '+74951234572 ' +
                            '+74951234574 ' +
                            '[+7 (495) 123-45-64] ' +
                            '[+7 (495) 123-45-63]'
                        );

                        tester.iframe.first.expectAttributeToHaveValue(
                            'src',
                            'https://prod-msk-softphone-widget-iframe.uiscom.ru/chrome/chats',
                        );

                        tester.iframe.atIndex(1).expectNotToExist();
                    });
                });
                describe('Для отображения телефона должно использоваться необработанное значение.', function() {
                    beforeEach(function() {
                        widgetSettings.
                            rawPhone().
                            receive();

                        tester.stateSettingRequest().receive();
                        tester.popupStateSettingRequest().receiveResponse();

                        tester.widgetSettings().
                            rawPhone().
                            windowMessage().
                            expectToBeSent();

                        tester.submoduleInitilizationEvent().receive();

                        tester.widgetSettings().
                            windowMessage().
                            chatsSettings().
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
                            'Номер телефона: +74951234574 (74951234573) ' +
                            '[+7 (495) 123-45-64] ' +
                            '[+7 (495) 123-45-63]'
                        );
                    });
                });
                describe('Укзано регулярное выражение для замены номера.', function() {
                    beforeEach(function() {
                        widgetSettings.
                            textSelectorRegExp().
                            receive();

                        tester.stateSettingRequest().receive();
                        tester.popupStateSettingRequest().receiveResponse();

                        tester.widgetSettings().
                            textSelectorRegExp().
                            windowMessage().
                            expectToBeSent();

                        tester.submoduleInitilizationEvent().receive();

                        tester.widgetSettings().
                            windowMessage().
                            chatsSettings().
                            expectToBeSent();
                    });

                    it('Нажимаю на кнопку номера телефона. Отправлен запрос вызова.', function() {
                        tester.phoneButton.
                            atIndex(2).
                            click();

                        tester.installmentSettingsProbableUpdatingRequest().receiveResponse();

                        postMessages.nextMessage().expectMessageToContain({
                            method: 'start_call',
                            data: '74951234564',
                        });
                    });
                    it('Обновляю настройки. Разметка вернулась к исходному состоянию.', function() {
                        tester.widgetSettings().
                            storageData().
                            receive();

                        tester.stateSettingRequest().receive();
                        tester.popupStateSettingRequest().receiveResponse();

                        tester.widgetSettings().
                            windowMessage().
                            expectToBeSent();

                        tester.widgetSettings().
                            windowMessage().
                            chatsSettings().
                            expectToBeSent();

                        tester.body.expectToHaveTextContent(
                            'Первый элемент #1 ' +
                            'Трубочка ' +
                            'Некий элемент #1 ' +
                            'Последний элемент #1 ' +

                            'Телефон: 74951234568 ' +
                            'Телефон: 74951234570 ' +
                            'Номер телефона: +74951234572 (74951234571) ' +
                            'Номер телефона: +74951234574 (74951234573) ' +
                            '[+7 (495) 123-45-64] ' +
                            '[+7 (495) 123-45-63]'
                        );
                    });
                    it('Замена произведена.', function() {
                        tester.body.expectToHaveTextContent(
                            'Первый элемент #1 ' +
                            'Трубочка ' +
                            'Некий элемент #1 ' +
                            'Последний элемент #1 ' +

                            'Телефон: 74951234568 ' +
                            'Телефон: 74951234570 ' +
                            '+74951234572 ' +
                            '+74951234574 ' +
                            '[ Номер телефона: +7 (495) 123-45-64 (74951234564) ] ' +
                            '[ Номер телефона: +7 (495) 123-45-63 (74951234563) ]'
                        );
                    });
                });
                it('Получен дубайский токен. Отображен IFrame с дубайского сервера.', function() {
                    widgetSettings.
                        anotherToken().
                        receive();

                    tester.stateSettingRequest().
                        userDataFetched().
                        receive();

                    tester.popupStateSettingRequest().
                        userDataFetched().
                        receiveResponse();

                    tester.widgetSettings().
                        anotherToken().
                        windowMessage().
                        expectToBeSent();

                    tester.submoduleInitilizationEvent().receive();

                    tester.widgetSettings().
                        anotherToken().
                        windowMessage().
                        chatsSettings().
                        expectToBeSent();

                    tester.iframe.first.expectAttributeToHaveValue(
                        'src',
                        'https://prod-msk-softphone-widget-iframe.callgear.ae/chrome/softphone',
                    );
                });
                it(
                    'Кнопка видимости должна быть дефолтной. Кнопка видимости является дефолтной.',
                function() {
                    widgetSettings.
                        noButtonElementSettings().
                        receive();

                    tester.stateSettingRequest().receive();
                    tester.popupStateSettingRequest().receiveResponse();

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
                        'Номер телефона: +74951234574 (74951234573) ' +
                        '[+7 (495) 123-45-64] ' +
                        '[+7 (495) 123-45-63]'
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
                    tester.popupStateSettingRequest().receiveResponse();

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
                        'Номер телефона: +74951234574 (74951234573) ' +
                        '[+7 (495) 123-45-64] ' +
                        '[+7 (495) 123-45-63]'
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
                    tester.popupStateSettingRequest().receiveResponse();

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
                        'Номер телефона: +74951234574 (74951234573) ' +
                        '[+7 (495) 123-45-64] ' +
                        '[+7 (495) 123-45-63]'
                    );
                });
                it(
                    'Кнопка видимости должна добавляться после элемента. Кнопка видимости добавлена после элемента.',
                function() {
                    widgetSettings.
                        insertAfter().
                        receive();

                    tester.stateSettingRequest().receive();
                    tester.popupStateSettingRequest().receiveResponse();

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
                        'Номер телефона: +74951234574 (74951234573) ' +
                        '[+7 (495) 123-45-64] ' +
                        '[+7 (495) 123-45-63]'
                    );
                });
                it(
                    'Кнопка видимости должна добавляться внутрь элемента. Кнопка видимости добавлена внурть элемента.',
                function() {
                    widgetSettings.
                        insertInto().
                        receive();

                    tester.stateSettingRequest().receive();
                    tester.popupStateSettingRequest().receiveResponse();

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
                        'Номер телефона: +74951234574 (74951234573) ' +
                        '[+7 (495) 123-45-64] ' +
                        '[+7 (495) 123-45-63]'
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
                    tester.popupStateSettingRequest().receiveResponse();

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
                        'Номер телефона: +74951234574 (74951234573) ' +
                        '[+7 (495) 123-45-64] ' +
                        '[+7 (495) 123-45-63]'
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
                    tester.popupStateSettingRequest().receiveResponse();

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
                        'Номер телефона: +74951234574 (74951234573) ' +
                        '[+7 (495) 123-45-64] ' +
                        '[+7 (495) 123-45-63]'

                    );
                });
                it('Не переданы настройки доступного для перемещения пространства. IFrame отображен.', function() {
                    widgetSettings.
                        noPadding().
                        receive();

                    tester.stateSettingRequest().
                        visible().
                        receive();

                    tester.popupStateSettingRequest().
                        visible().
                        receiveResponse();

                    tester.widgetSettings().
                        noPadding().
                        windowMessage().
                        expectToBeSent();

                    tester.submoduleInitilizationEvent().receive();

                    tester.widgetSettings().
                        windowMessage().
                        chatsSettings().
                        expectToBeSent();

                    tester.iframe.first.expectToBeVisible();
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
                        '+74951234574 ' +
                        '[+7 (495) 123-45-64] ' +
                        '[+7 (495) 123-45-63]'
                    );

                    tester.iframe.first.expectNotToExist();
                });
            });
            it('IFrame отсутствует.', function() {
                tester.iframe.first.expectNotToExist();
            });
        });
        describe('Открываю попап. Отправлен запрос состояния.', function() {
            beforeEach(function() {
                tester = new Tester({
                    application: 'popup',
                    isAuthorized: true,
                    ...options,
                });

                tester.stateRequest().receiveResponse();
            });
            
            describe('Получено имя сотрудника.', function() {
                let popupStateSettingRequest;

                beforeEach(function() {
                    popupStateSettingRequest = tester.popupStateSettingRequest();
                });

                describe('Софтон скрыт.', function() {
                    beforeEach(function() {
                        popupStateSettingRequest.
                            userDataFetched().
                            expectResponseToBeSent();
                    });

                    describe('Чаты скрыты.', function() {
                        beforeEach(function() {
                            tester.chatsVisibilitySettingRequest().expectResponseToBeSent();
                        });

                        it('Нажимаю на кнопку чатов. Отправлен запрос отображения чатов.', function() {
                            tester.switchButton('Показать чаты').click();

                            tester.chrome.
                                permissions.
                                nextRequest().
                                grant();

                            tester.installmentSettingsProbableUpdatingRequest().receiveResponse();
                            tester.toggleChatsVisibilityRequest().expectToBeSent();
                        });
                        it('Кнопка чатов не нажата.', function() {
                            tester.switchButton('Показать чаты').expectNotToBeChecked();
                        });
                    });
                    describe('Получено сообщение о безуспешной попытке получить настройки.', function() {
                        beforeEach(function() {
                            tester.widgetSettings().
                                failedToGetSettings().
                                storageData().
                                receive();
                        });

                        it('Получены настройки. Сообщение об ошибке скрыто.', function() {
                            tester.widgetSettings().
                                anotherTime().
                                storageData().
                                receive();
                            
                            tester.body.expectTextContentNotToHaveSubstring('Не удалось получить настройки');
                        });
                        it('Отображено сообщение об ошибке.', function() {
                            tester.body.expectTextContentToHaveSubstring('Не удалось получить настройки');

                            tester.widgetSettings().
                                storageData().
                                expectToBeSaved();
                        });
                    });
                    it('Чаты видимы. Кнопка чатов нажата.', function() {
                        tester.chatsVisibilitySettingRequest().
                            visible().
                            expectResponseToBeSent();

                        tester.switchButton('Показать чаты').expectToBeChecked();
                    });
                    it('Нажимаю на кнопку выхода. Отправлен запрос выхода.', function() {
                        tester.popupLogoutButton.click();
                        tester.logoutRequest().receiveResponse();
                    });
                    it('Нажимаю на кнопку "Обновить настройки". Настройки обновлены.', function() {
                        tester.refreshButton.click();

                        tester.installmentSettingsUpdatingRequest().
                            expectToBeSent();
                    });
                    it('Настройки загружаются. Кнопки заблокированы.', function() {
                        tester.widgetSettings().
                            storageData().
                            settingsLoading().
                            receive();

                        tester.popupLogoutButton.expectToHaveAttribute('disabled');
                        tester.switchButton('Показать софтфон').expectToBeDisabled();
                        tester.refreshButton.expectToHaveAttribute('disabled');
                    });
                    it('Кнопка входа скрыта.', function() {
                        tester.button('Войти').expectNotToExist();
                        tester.switchButton('Показать софтфон').expectNotToBeChecked();

                        tester.body.expectTextContentToHaveSubstring('Ганева Стефка');
                    });
                });
                describe('Софтфон видим.', function() {
                    beforeEach(function() {
                        popupStateSettingRequest.
                            visible().
                            expectResponseToBeSent();
                    });

                    it('Нажимаю на кнопку "Показать софтфон". Отправлен запрос изменения видимости.', function() {
                        tester.switchButton('Показать софтфон').click();

                        tester.chrome.
                            permissions.
                            nextRequest().
                            grant();

                        tester.installmentSettingsProbableUpdatingRequest().receiveResponse();
                        tester.toggleWidgetVisibilityRequest().receiveResponse();

                        tester.switchButton('Показать софтфон').expectToBeEnabled();
                    });
                    it('Кнопка "Показать софтфон" отмечена.', function() {
                        tester.switchButton('Показать софтфон').expectToBeChecked();
                    });
                });
                describe('Софтфон отсутствует. Нажимаю на кнопку видимости софтфона.', function() {
                    beforeEach(function() {
                        popupStateSettingRequest.
                            disabled().
                            expectResponseToBeSent();

                        tester.switchButton('Показать софтфон').click();

                        tester.chrome.
                            permissions.
                            nextRequest().
                            grant();

                        tester.installmentSettingsProbableUpdatingRequest().receiveResponse();
                        tester.toggleWidgetVisibilityRequest().receiveResponse();
                    });

                    it('Получено сообщение о видимости софтфона. Кнопка видимости софтфона доступна.', function() {
                        tester.popupStateSettingRequest().
                            visible().
                            expectResponseToBeSent();

                        tester.switchButton('Показать софтфон').expectToBeEnabled();
                    });
                    it('Кнопка видимости софтфона заблокирована.', function() {
                        tester.switchButton('Показать софтфон').expectToBeDisabled();
                    });
                });
            });
            it('Отображён логин авторизованного пользователя.', function() {
                tester.body.expectTextContentToHaveSubstring('bitrixtest');
                tester.switchButton('Показать чаты').expectNotToExist();
                tester.switchButton('Показать софтфон').expectToBeVisible();
                tester.body.expectTextContentNotToHaveSubstring('Вы не авторизованы');
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

                describe('Не удалось получить настройки.', function() {
                    beforeEach(function() {
                        widgetSettings.
                            failedToGetSettings().
                            receiveResponse();
                    });

                    it('Получен запрос обновления настроек. Сообщение об ошибке удалено.', function() {
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
                    it('Сообщение об ошибке сохранено.', function() {
                        tester.widgetSettings().
                            failedToGetSettings().
                            storageData().
                            expectToBeSaved();
                    });
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
                        expectHostPermissionToBeRequested('https://my.uiscom.ru/*').
                        expectHostPermissionToBeRequested('https://my.callgear.ae/*').
                        expectHostPermissionToBeRequested('https://my.comagic.com/*');
                });

                describe('Права предоставлены. Производится попытка открыть форму авторизации.', function() {
                    let authFlow;

                    beforeEach(function() {
                        permissionsRequest.grant();
                        authFlow = tester.authFlow().expectToBeLaunched();
                    });

                    describe('Получен код авторизации.', function() {
                        let oauthRequest;

                        beforeEach(function() {
                            authFlow.receiveResponse();
                            oauthRequest = tester.oauthRequest().expectToBeSent();
                        });

                        it('Получен дубайский токен. Отправлен запрос настроек в дубайский сервер.', function() {
                            oauthRequest.
                                anotherToken().
                                receiveResponse();

                            tester.widgetSettings().
                                anotherToken().
                                request().
                                receiveResponse();

                            tester.widgetSettings().
                                anotherToken().
                                storageData().
                                expectToBeSaved();
                        });
                        it(
                            'Получен авторизационный токен. В текущей вкладке установлен авторизационный токен. В ' +
                            'хранилище сохранено состояние вкладки.',
                        function() {
                            oauthRequest.receiveResponse();

                            tester.widgetSettings().
                                request().
                                receiveResponse();

                            tester.widgetSettings().
                                storageData().
                                expectToBeSaved();
                        });
                    });
                    describe('Не удалось открыть форму авторизации.', function() {
                        beforeEach(function() {
                            authFlow.fail();
                        });

                        it('Приходит запрос авторизации. Производится попытка открыть форму авторизации.', function() {
                            tester.authorizationRequest().expectResponseToBeSent();

                            tester.chrome.
                                permissions.
                                nextRequest().
                                grant();

                            tester.authFlow().receiveResponse();
                            tester.oauthRequest().receiveResponse();

                            tester.widgetSettings().
                                request().
                                receiveResponse();

                            tester.widgetSettings().
                                storageData().
                                expectToBeSaved();
                        });
                        it('В хранилище сохранено сообщение об ошибке.', function() {
                            tester.widgetSettings().
                                failedToAuthorize().
                                storageData().
                                expectToBeSaved();
                        });
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
                tester.popupStateSettingRequest().expectResponseToBeSent();
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
            it('Получен запрос состояния от popup-скрипта. Ответ не был отправлен.', function() {
                tester.stateRequest().receive();
            });
            it('Добавлены кнопки видимости и кнопи телефонов. IFrame софтфона отсутствует.', function() {
                tester.iframe.first.expectNotToExist();

                tester.body.expectToHaveTextContent(
                    'Первый элемент #1 ' +
                    'Трубочка ' +
                    'Некий элемент #1 ' +
                    'Последний элемент #1 ' +

                    'Телефон: 74951234568 ' +
                    'Телефон: 74951234570 ' +
                    'Номер телефона: +74951234572 (74951234571) ' +
                    'Номер телефона: +74951234574 (74951234573) ' +
                    '[+7 (495) 123-45-64] ' +
                    '[+7 (495) 123-45-63]'
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

                postMessages.nextMessage().expectMessageToContain({
                    method: 'set_token',
                    data: '',
                });

                tester.stateSettingRequest().expectToBeSent();
                tester.amocrmStateSettingRequest().receive();
            });

            describe('Из окна авторизации приходит токен. Прозиводится авторизация.', function() {
                let authCheckRequest;

                beforeEach(function() {
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
                        receiveResponse();

                    tester.masterInfoMessage().receive();

                    tester.slavesNotification().
                        additional().
                        expectToBeSent();

                    tester.slavesNotification().expectToBeSent();
                    tester.masterInfoMessage().tellIsLeader().expectToBeSent();
                        
                    tester.authTokenRequest().receiveResponse()
                    authCheckRequest = tester.authCheckRequest().expectToBeSent();
                });

                describe('Удалось авторизоваться. Софтон готов к использованию.', function() {
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

                        tester.stateSettingRequest().
                            userDataFetched().
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
                    });

                    it(
                        'Софтон открыт в другом окне. Отображено сообщение о том, что софтфон открыт в другом окне.',
                    function() {
                        postMessages.receive({
                            method: 'toggle_widget_visibility'
                        });

                        tester.slavesNotification().
                            additional().
                            visible().
                            expectToBeSent();

                        tester.stateSettingRequest().
                            userDataFetched().
                            visible().
                            expectToBeSent();

                        tester.eventsWebSocket.disconnect(4429);

                        tester.slavesNotification().
                            userDataFetched().
                            twoChannels().
                            appAlreadyOpened().
                            enabled().
                            microphoneAccessGranted().
                            expectToBeSent();

                        tester.authLogoutRequest().receiveResponse();
                        tester.registrationRequest().expired().receiveResponse();
                        
                        spendTime(2000);
                        tester.webrtcWebsocket.finishDisconnecting();

                        tester.softphone.expectTextContentToHaveSubstring(
                            'Софтфон открыт в другом окне'
                        );
                    });
                    it('Токен сохранен.', function() {
                        {
                            const actualValue = window.localStorage.getItem('token'),
                                expectedValue = tester.oauthToken;

                            if (actualValue != expectedValue) {
                                throw new Error(
                                    'Должен быть сохранен токен "' + expectedValue + '", а не "' + actualValue + '".'
                                );
                            }
                        }
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

                postMessages.receive({
                    method: 'set_token',
                    data: '',
                });
            });

            describe('Получено состояние софтфона. Софтфон должен быть видимым.', function() {
                beforeEach(function() {
                    tester.stateSettingRequest().
                        visible().
                        receive();

                    tester.amocrmStateSettingRequest().expectToBeSent();
                });

                describe('Получен дубайский токен авторизации.', function() {
                    beforeEach(function() {
                        postMessages.receive({
                            method: 'set_token',
                            data: tester.anotherOauthToken,
                        });
                    });

                    it('Получен запрос изменения состояния.', function() {
                        tester.stateSettingRequest().receive();

                        postMessages.nextMessage().expectMessageToContain({
                            method: 'toggle_widget_visibility'
                        });

                        tester.amocrmStateSettingRequest().expectToBeSent();

                        tester.stateSettingRequest().
                            visible().
                            receive();

                        postMessages.receive({
                            method: 'set_token',
                            data: '',
                        });

                        postMessages.nextMessage().expectMessageToContain({
                            method: 'set_token',
                            data: tester.anotherOauthToken,
                        });

                        postMessages.receive({
                            method: 'set_token',
                            data: tester.anotherOauthToken,
                        });
                    });
                    it('IFrame изменился.', function() {
                        tester.iframe.first.expectToBeVisible();

                        {
                            const actualValue = window.localStorage.getItem('datacenter'),
                                expectedValue = 'dubai';

                            if (actualValue != expectedValue) {
                                throw new Error(
                                    'Должен быть сохранен data center "' + expectedValue + '", а не "' + actualValue +
                                    '".'
                                );
                            }
                        }

                        tester.iframe.first.expectAttributeToHaveValue(
                            'src',
                            'https://prod-msk-softphone-widget-iframe.callgear.ae/amocrm'
                        );
                    });
                });
                describe('Получен токен авторизации.', function() {
                    beforeEach(function() {
                        postMessages.receive({
                            method: 'set_token',
                            data: tester.oauthToken,
                        });
                    });

                    it('Получен пустой токен. Предыдущий сохраненный токен не был передан в IFrame.', function() {
                        tester.stateSettingRequest().receive();

                        postMessages.receive({
                            method: 'set_token',
                            data: '',
                        });
                    });
                    it('URL IFrame не изменился.', function() {
                        tester.iframe.first.expectToBeVisible();

                        {
                            const actualValue = !!window.localStorage.getItem('datacenter'),
                                expectedValue = false;

                            if (actualValue != expectedValue) {
                                throw new Error(
                                    'Data center не должен быть сохранен, однако было сохранено значение "' +
                                    actualValue + '".'
                                );
                            }
                        }

                        tester.iframe.first.expectAttributeToHaveValue(
                            'src',
                            'https://prod-msk-softphone-widget-iframe.uiscom.ru/amocrm',
                        );
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
                it('Софтфон отображен.', function() {
                    tester.iframe.first.expectToBeVisible();

                    tester.iframe.first.expectAttributeToHaveValue(
                        'src',
                        'https://prod-msk-softphone-widget-iframe.uiscom.ru/amocrm',
                    );
                });
            });
            it(
                'Открываю настройки. Нажимаю на кнопку установки. Открыто окно установки. Нажимаю на кнопоку ' +
                'настроек. Открыто окно настроек.',
            function() {
                tester.openSettings();
                tester.button('Завершить установку').click();

                windowOpener.
                    expectToHavePath('https://uc-sso-prod-api.uiscom.ru/login').
                    expectQueryToContain({
                        continue: 'https://www.amocrm.ru/oauth?client_id=e4830af5-279e-440b-a955-18a3cf60fd3c',
                    });

                tester.button('Перейти к настройкам').click();
                windowOpener.expectToHavePath('https://go.uiscom.ru/marketplace/integration_list');
            });
            it('IFrame скрыт.', function() {
                tester.iframe.first.expectToBeHidden();
            });
        });
        describe(
            'В локальном хранилище сохранен токен. Открыт IFrame софтфона amoCRM. Производится авторизация.',
        function() {
            let settingsRequest,
                widgetSettings;

            beforeEach(function() {
                window.localStorage.setItem('token', tester.oauthToken);

                tester = new Tester({
                    application: 'amocrmIframeContent',
                    isIframe: true,
                    softphoneHost: 'my.uiscom.ru',
                    ...options,
                });

                widgetSettings = tester.widgetSettings().
                    amocrm().
                    request().
                    expectToBeSent();

                postMessages.nextMessage().expectMessageToContain({
                    method: 'set_token',
                    data: tester.oauthToken,
                });

                tester.stateSettingRequest().expectToBeSent();
                tester.amocrmStateSettingRequest().receive();

                tester.masterInfoMessage().receive();

                tester.slavesNotification().
                    additional().
                    expectToBeSent();

                tester.slavesNotification().expectToBeSent();
                tester.masterInfoMessage().tellIsLeader().expectToBeSent();
                    
                tester.authTokenRequest().receiveResponse()
                tester.authCheckRequest().receiveResponse();

                tester.talkOptionsRequest().receiveResponse();
                tester.permissionsRequest().receiveResponse();
                tester.statusesRequest().receiveResponse();
                settingsRequest = tester.settingsRequest().expectToBeSent();
            });

            describe('Получены настройки для IP-телефона.', function() {
                beforeEach(function() {
                    widgetSettings.receiveResponse();
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

                        tester.stateSettingRequest().
                            userDataFetched().
                            expectToBeSent();

                        postMessages.receive({
                            method: 'toggle_widget_visibility',
                        });

                        tester.slavesNotification().
                            additional().
                            visible().
                            expectToBeSent();

                        tester.stateSettingRequest().
                            userDataFetched().
                            visible().
                            expectToBeSent();
                    });

                    it('Получен запрос выхода. Отображена ссылка на страницу авторизации.', function() {
                        postMessages.receive({
                            method: 'set_token',
                            data: '',
                        });

                        postMessages.nextMessage().expectMessageToContain({
                            method: 'set_token',
                            data: '',
                        });

                        tester.masterInfoMessage().leaderDeath().expectToBeSent();
                        tester.eventsWebSocket.finishDisconnecting();

                        tester.slavesNotification().
                            userDataFetched().
                            twoChannels().
                            enabled().
                            destroyed().
                            microphoneAccessGranted().
                            expectToBeSent();

                        tester.authLogoutRequest().receiveResponse();
                        tester.registrationRequest().expired().receiveResponse();
                        
                        spendTime(2000);
                        tester.webrtcWebsocket.finishDisconnecting();

                        tester.span('Для использования софтфона необходимо авторизоваться').expectToBeVisible();
                    });
                    it('Нажимаю на кнпоку выхода. Открывается окно выхода.', function() {
                        tester.userName.click();
                        tester.logoutButton.click();

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

                        tester.authenticatedUserRequest().receiveResponse();

                        tester.stateSettingRequest().
                            userDataFetched().
                            expectToBeSent();

                        tester.slavesNotification().
                            userDataFetched().
                            twoChannels().
                            disabled().
                            softphoneServerConnected().
                            expectToBeSent();

                        postMessages.receive({
                            method: 'start_call',
                            data: '79161234567',
                        });

                        tester.click2CallRequest().receiveResponse();
                    });
                    
                    it('Получен запрос изменения видимости софтфона. Сообщение об ошибке не отображено.', function() {
                        postMessages.receive({
                            method: 'toggle_widget_visibility',
                        });

                        tester.slavesNotification().
                            additional().
                            visible().
                            expectToBeSent();

                        tester.stateSettingRequest().
                            userDataFetched().
                            visible().
                            expectToBeSent();

                        tester.softphone.expectTextContentNotToHaveSubstring(
                            'Отстутствуют настройки для вызова IP-телефона'
                        );
                    });
                    it('Софтфон скрыт.', function() {
                        tester.softphone.expectNotToExist();
                    });
                });
            });
            describe(
                'Настройки для IP-телефона получены. Включено управление звонками на другом устройстве.',
            function() {
                beforeEach(function() {
                    widgetSettings.
                        anotherWildcart().
                        receiveResponse();

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

                    tester.authenticatedUserRequest().receiveResponse();

                    tester.stateSettingRequest().
                        userDataFetched().
                        expectToBeSent();

                    tester.slavesNotification().
                        userDataFetched().
                        twoChannels().
                        disabled().
                        softphoneServerConnected().
                        expectToBeSent();
                });

                it(
                    'Получен запрос изменения видимости софтфона. Нажимаю на номер телефона. Отображено сообщение об ' +
                    'отстутствии настроек IP-телефона.',
                function() {
                    postMessages.receive({
                        method: 'toggle_widget_visibility',
                    });

                    tester.slavesNotification().
                        additional().
                        visible().
                        expectToBeSent();

                    tester.stateSettingRequest().
                        userDataFetched().
                        visible().
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
                        expectToBeSent();

                    tester.softphone.expectTextContentToHaveSubstring(
                        'Отстутствуют настройки для вызова IP-телефона'
                    );
                });
            });
        });
        describe('Открываю IFrame чатов. Получены настройки. Отображены чаты.', function() {
            beforeEach(function() {
                tester = new Tester({
                    application: 'chatsIframe',
                    ...options,
                });

                tester.submoduleInitilizationEvent().expectToBeSent();
                tester.submoduleInitilizationEvent().expectToBeSent();

                tester.widgetSettings().
                    windowMessage().
                    chatsSettings().
                    receive();

                tester.accountRequest().
                    forIframe().
                    webAccountLoginUnavailable().
                    softphoneFeatureFlagDisabled().
                    operatorWorkplaceAvailable().
                    receiveResponse();

                tester.masterInfoMessage().receive();
                tester.masterInfoMessage().tellIsLeader().expectToBeSent();

                tester.accountRequest().
                    forIframe().
                    fromIframe().
                    webAccountLoginUnavailable().
                    softphoneFeatureFlagDisabled().
                    operatorWorkplaceAvailable().
                    receiveResponse();

                tester.employeesWebSocket.connect();

                tester.employeesInitMessage().
                    oauthToken().
                    expectToBeSent();

                tester.chatsWebSocket.connect();

                tester.chatsInitMessage().
                    oauthToken().
                    expectToBeSent();

                tester.chatSettingsRequest().receiveResponse();
                tester.chatChannelListRequest().receiveResponse();

                tester.employeeStatusesRequest().
                    oauthToken().
                    receiveResponse();

                tester.listRequest().receiveResponse();
                tester.siteListRequest().receiveResponse();
                tester.messageTemplateListRequest().receiveResponse();
                tester.employeeSettingsRequest().receiveResponse();

                tester.employeeRequest().
                    oauthToken().
                    receiveResponse();

                tester.accountRequest().
                    forIframe().
                    fromIframe().
                    webAccountLoginUnavailable().
                    softphoneFeatureFlagDisabled().
                    operatorWorkplaceAvailable().
                    receiveResponse();

                tester.countersRequest().
                    noNewChats().
                    noClosedChats().
                    receiveResponse();

                tester.offlineMessageCountersRequest().receiveResponse();
                tester.chatChannelListRequest().receiveResponse();
                tester.siteListRequest().receiveResponse();
                tester.markListRequest().receiveResponse();

                tester.chatListRequest().
                    forCurrentEmployee().
                    noData().
                    receiveResponse();

                tester.chatListRequest().
                    forCurrentEmployee().
                    active().
                    receiveResponse();

                tester.chatListRequest().forCurrentEmployee().
                    closed().
                    noData().
                    receiveResponse();

                tester.chatChannelTypeListRequest().receiveResponse();

                tester.offlineMessageListRequest().notProcessed().receiveResponse();
                tester.offlineMessageListRequest().processing().receiveResponse();
                tester.offlineMessageListRequest().processed().receiveResponse();

                tester.button('В работе 75').click();
            });

            it('Выбираю чат.', function() {
                tester.chatList.
                    first.
                    item('Привет').
                    click();

                tester.submoduleInitilizationEvent().expectToBeSent();

                tester.visitorCardRequest().receiveResponse();
                tester.messageListRequest().receiveResponse();

                tester.changeMessageStatusRequest().
                    read().
                    anotherMessage().
                    receiveResponse();

                tester.countersRequest().
                    noNewChats().
                    noClosedChats().
                    receiveResponse();

                tester.widgetSettings().
                    windowMessage().
                    chatsSettings().
                    receive();

                tester.usersRequest().
                    forContacts().
                    forIframe().
                    receiveResponse();

                tester.groupsContainingContactRequest().
                    forIframe().
                    noContact().
                    receiveResponse();

                tester.contactGroupsRequest().
                    forIframe().
                    receiveResponse();

                tester.contactBar.expectTextContentToHaveSubstring(
                    'ФИО ' +
                    'Помакова Бисерка Драгановна'
                );
            });
            it('Отображен список чатов.', function() {
                tester.chatList.
                    first.
                    item('Привет').
                    expectToBeVisible();
            });
        });
        it('Открыт IFrame. Получен дубайский токен. Отправлен запрос авторизации в дубайский сервер.', function() {
            tester = new Tester({
                application: 'iframeContent',
                isIframe: true,
                softphoneHost: 'my.callgear.ae',
                ...options,
            });

            tester.stateSettingRequest().expectToBeSent();

            postMessages.receive({
                method: 'toggle_widget_visibility',
            });
            
            tester.stateSettingRequest().
                visible().
                expectToBeSent();

            tester.widgetSettings().
                anotherToken().
                windowMessage().
                receive();

            tester.masterInfoMessage().receive();

            tester.slavesNotification().
                additional().
                visible().
                expectToBeSent();

            tester.slavesNotification().expectToBeSent();

            tester.masterInfoMessage().
                tellIsLeader().
                expectToBeSent();
                
            tester.authTokenRequest().
                anotherToken().
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
        it('Ранее был открыт дубайский IFrame. Дубайский IFrame снова открыт.', function() {
            window.localStorage.setItem('datacenter', 'dubai'),

            tester = new Tester({
                softphoneHost: 'my.uiscom.ru',
                ...options,
                application: 'amocrm',
            });

            postMessages.receive({
                method: 'set_token',
                data: '',
            });

            tester.stateSettingRequest().
                visible().
                receive();

            tester.amocrmStateSettingRequest().expectToBeSent();
            tester.iframe.first.expectToBeVisible();

            tester.iframe.first.expectAttributeToHaveValue(
                'src',
                'https://prod-msk-softphone-widget-iframe.callgear.ae/amocrm',
            );
        });
        it('Виджет установлен. Открываю настройки. Кнопока настроек видима.', function() {
            tester = new Tester({
                softphoneHost: 'my.uiscom.ru',
                ...options,
                application: 'amocrm',
                active: true,
            });

            tester.openSettings();
            tester.button('Перейти к настройкам').expectToBeVisible();
        });
        it('Должен использоваться английский язык. Открываю настройки. Используется английский язык.', function() {
            tester = new Tester({
                softphoneHost: 'my.uiscom.ru',
                ...options,
                application: 'amocrm',
                lang: 'en',
                active: true,
            });

            tester.openSettings();
            tester.button('Open settings').expectToBeVisible();
        });
        it('Открываю страницу с расширением. Токен авторизации был сохранен. В IFrame отправлен токен.', function() {
            tester = new Tester({
                softphoneHost: 'my.uiscom.ru',
                isAuthorized: true,
                ...options,
            });

            tester.installmentSettingsProbableUpdatingRequest().receiveResponse();
            tester.chatsVisibilitySettingRequest().receiveResponse();

            tester.stateSettingRequest().receive();
            tester.popupStateSettingRequest().receiveResponse();

            tester.widgetSettings().
                windowMessage().
                expectToBeSent();

            tester.submoduleInitilizationEvent().receive();

            tester.widgetSettings().
                windowMessage().
                chatsSettings().
                expectToBeSent();

            postMessages.receive({
                method: 'logout',
            });

            tester.widgetSettings().
                windowMessage().
                emptyToken().
                chatsSettings().
                expectToBeSent();

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
