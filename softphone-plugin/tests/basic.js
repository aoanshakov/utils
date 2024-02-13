tests.addTest(options => {
    const {
        Tester,
        notificationTester,
        spendTime,
        postMessages,
        setNow,
        setDocumentVisible,
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
        });

        describe('Открыт IFrame.', function() {
            beforeEach(function() {
                tester = new Tester({
                    application: 'iframeContent',
                    softphoneHost: 'my.uiscom.ru',
                    ...options,
                });

                tester.stateSettingRequest().expectToBeSent();
            });

            describe('Получен запрос изменения видимости софтфофона.', function() {
                beforeEach(function() {
                    postMessages.receive({
                        method: 'toggle_widget_visibility',
                    });
                    
                    tester.stateSettingRequest().
                        visible().
                        expectToBeSent();
                });

                describe('Получен токен авторизации.', function() {
                    let widgetSettings;

                    beforeEach(function() {
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
                                        visible().
                                        expanded().
                                        lostCalls(1).
                                        expectToBeSent();

                                    tester.callsRequest().receiveResponse();

                                    tester.stateSettingRequest().
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
                                expectHostPermissionToBeRequested('https://uc-sso-prod-api.uiscom.ru/*').
                                expectHostPermissionToBeRequested('https://my.uiscom.ru/*');
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
        describe('Открываю страницу с расширением. Токен авторизации не был сохранен.', function() {
            let authenticatedUserRequest;

            beforeEach(function() {
                tester = new Tester({
                    softphoneHost: 'my.uiscom.ru',
                    ...options,
                });
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
                    it('Нажимаю на номер телефона. Отправлен запрос вызова.', function() {
                        tester.phoneButton.atIndex(2).click();

                        postMessages.nextMessage().expectMessageToContain({
                            method: 'start_call',
                            data: '74951234571',
                        });
                    });
                    it('Нажиюма на кнопку видимости. Отправлен запрос изменения видимости.', function() {
                        tester.visibilityButton.click();

                        postMessages.nextMessage().expectMessageToContain({
                            method: 'toggle_widget_visibility'
                        });
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

                        tester.iframe.expectNotToExist();
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
                it('Время хранения настроек истекло. Настройки запрошены заново.', function() {
                    widgetSettings.
                        expired().
                        receive();

                    tester.stateSettingRequest().receive();

                    tester.widgetSettings().
                        storageData().
                        noSettings().
                        expectToBeSaved();

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
                it('URL страницы не соответствует wildcard. Кнопка видимости не была добавлена.', function() {
                    widgetSettings.
                        anotherWildcart().
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
                it('Настройки отсутствуют. Кнопка видимости не была добавлена.', function() {
                    widgetSettings.
                        noData().
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
        describe(
            'Открываю background-скрипт. Софтфон авторизован. Получен запрос выхода. Производится выход.',
        function() {
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
                tester.widgetSettings().request().receiveResponse();
                tester.widgetSettings().storageData().expectToBeSaved();
            });
            it('Токен авторизации удалён.', function() {
                tester.widgetSettings().
                    storageData().
                    noData().
                    expectToBeSaved();
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
                tester.widgetSettings().request().receiveResponse();
                tester.widgetSettings().storageData().expectToBeSaved();
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
            it('Нажимаю на кнопку "Обновить настройки". Настройки обновлены.', function() {
                tester.button('Обновить настройки').click();

                tester.widgetSettings().
                    storageData().
                    noSettings().
                    expectToBeSaved();
            });
            it('Кнопка входа скрыта.', function() {
                tester.button('Войти').expectNotToExist();
            });
        });
        it('Открываю страницу с расширением. Токен авторизации был сохранен. В IFrame отправлен токен.', function() {
            tester = new Tester({
                softphoneHost: 'my.uiscom.ru',
                isAuthorized: true,
                ...options,
            });

            tester.stateSettingRequest().receive();
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
                noData().
                expectToBeSaved();
        });
    });
});
