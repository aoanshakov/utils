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
    } = options;

    describe('Включено расширение Chrome виджет amoCRM.', function() {
        let tester;

        beforeEach(function() {
            setNow('2019-12-19T12:10:06');
        });

        afterEach(function() {
            postMessages.nextMessage().expectNotToExist();

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

            describe('Получен запрос изменения видимости софтфофона.', function() {
                let widgetSettings,
                    authTokenRequest;

                beforeEach(function() {
                    tester.softphoneVisibilityToggleRequest().receive();

                    tester.stateSettingRequest().
                        visible().
                        expectToBeSent();

                    widgetSettings = tester.widgetSettings().windowMessage();
                });

                describe('Используется русский язык.', function() {
                    beforeEach(function() {
                        widgetSettings.receive();
                        tester.masterInfoMessage().receive();

                        tester.slavesNotification().
                            additional().
                            visible().
                            expectToBeSent();

                        tester.slavesNotification().expectToBeSent();
                        tester.masterInfoMessage().tellIsLeader().expectToBeSent();
                            
                        authTokenRequest = tester.authTokenRequest().expectToBeSent()
                    });

                    describe('Получен токен авторизации.', function() {
                        let authCheckRequest;

                        beforeEach(function() {
                            authTokenRequest.receiveResponse()
                            authCheckRequest = tester.authCheckRequest().expectToBeSent();
                        });

                        describe('Произведена авторизация.', function() {
                            let permissionsRequest;

                            beforeEach(function() {
                                authCheckRequest.receiveResponse();

                                tester.talkOptionsRequest().receiveResponse();
                                tester.statusesRequest().receiveResponse();
                                permissionsRequest = tester.permissionsRequest().expectToBeSent();
                            });

                            describe('Выбор номера запрещён.', function() {
                                let settingsRequest;

                                beforeEach(function() {
                                    permissionsRequest.receiveResponse();
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

                                            authenticatedUserRequest = tester.authenticatedUserRequest().
                                                expectToBeSent();

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

                                                it(
                                                    'Поступил входящий звонок. Поступил еще один входящий звонок. В ' +
                                                    'родительское окно отправлено сообщение об изменении размера ' +
                                                    'софтфона.',
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
                                                        userDataFetched().
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
                                                        visible().
                                                        userDataFetched().
                                                        expanded().
                                                        noIdleChannels().
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
                                                'Доступ к микрофону запрещён. Отображено сообщение о недоступности ' +
                                                'микрофона.',
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
                                            'Есть пропущенные звонки. Родительское окно оповещено о количестве ' +
                                            'пропущенных звонков. Сворачиваю окно. Звонок пропущен. В родительское ' +
                                            'окно передано сообщение о пропущенном звонке. Разворачиваю окно. В ' +
                                            'родительское окно передано сообщение об отсутствии пропущенных звонков.',
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
                            it('Выбор номер разрешён.', function() {
                                permissionsRequest.
                                    allowNumberCapacitySelect().
                                    allowNumberCapacityUpdate().
                                    receiveResponse();

                                tester.settingsRequest().
                                    allowNumberCapacitySelect().
                                    receiveResponse();

                                tester.slavesNotification().
                                    twoChannels().
                                    enabled().
                                    expectToBeSent();

                                tester.numberCapacityRequest().receiveResponse();

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
                                    tester.allowMediaInput();

                                tester.slavesNotification().
                                    twoChannels().
                                    available().
                                    expectToBeSent();

                                tester.select.arrow.click();
                                tester.numberCapacityRequest().receiveResponse();

                                tester.select.popup.expectToHaveTopOffset(4);
                                tester.select.popup.expectToHaveHeight(204);

                                tester.button('Отменить').expectToBeVisible();
                            });
                            it(
                                'Доступ к софтфону запрещён. Отображено сообщение о том, что доступ к софтфону ' +
                                'запрещён.',
                            function() {
                                permissionsRequest.
                                    disallowSoftphoneLogin().
                                    receiveResponse();

                                tester.masterInfoMessage().leaderDeath().expectToBeSent();

                                tester.slavesNotification().
                                    destroyed().
                                    expectToBeSent();

                                tester.authLogoutRequest().receiveResponse();

                                tester.stateSettingRequest().
                                    visible().
                                    destroyed().
                                    expectToBeSent();

                                tester.body.expectToHaveTextContent(
                                    'Софтфон недоступен ' +
                                    'Не хватает прав'
                                );
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
                                destroyed().
                                expectToBeSent();
                        });
                    });
                    it('Отображено сообщение о том, что происходит авторизация.', function() {
                        tester.body.expectToHaveTextContent(
                            'Происохдит авторизация... ' +
                            'Подождите, пожалуйста'
                        );
                    });
                });
                it('Используется английский язык. Интерфейс переведён.', function() {
                    widgetSettings.
                        thirdToken().
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
                        thirdToken().
                        receiveResponse();

                    tester.authCheckRequest().expectToBeSent();

                    tester.body.expectToHaveTextContent(
                        'Authorizing... ' +
                        'Please wait'
                    );
                });
            });
            describe('Доступ к софтфону запрещён.', function() {
                beforeEach(function() {
                    tester.widgetSettings().
                        windowMessage().
                        receive();

                    tester.masterInfoMessage().receive();

                    tester.slavesNotification().
                        additional().
                        expectToBeSent();

                    tester.slavesNotification().expectToBeSent();

                    tester.masterInfoMessage().
                        tellIsLeader().
                        expectToBeSent();

                    tester.authTokenRequest().receiveResponse();
                    tester.authCheckRequest().receiveResponse();

                    tester.talkOptionsRequest().receiveResponse();
                    tester.statusesRequest().receiveResponse();

                    tester.permissionsRequest().
                        disallowSoftphoneLogin().
                        receiveResponse();

                    tester.masterInfoMessage().
                        leaderDeath().
                        expectToBeSent();

                    tester.slavesNotification().
                        destroyed().
                        expectToBeSent();

                    tester.authLogoutRequest().receiveResponse();

                    tester.stateSettingRequest().
                        destroyed().
                        expectToBeSent();
                });

                it('Получен запрос отобржаения софтфона. Софтфон видим.', function() {
                    tester.softphoneVisibilityToggleRequest().receive();

                    tester.stateSettingRequest().
                        destroyed().
                        visible().
                        expectToBeSent();

                    tester.body.expectToHaveTextContent(
                        'Софтфон недоступен ' +
                        'Не хватает прав'
                    );
                });
                it('Получен запрос звонка. Софтфон видим.', function() {
                    postMessages.receive({
                        method: 'start_call',
                        data: '74951234571',
                    });

                    tester.stateSettingRequest().
                        destroyed().
                        visible().
                        expectToBeSent();

                    tester.body.expectToHaveTextContent(
                        'Софтфон недоступен ' +
                        'Не хватает прав'
                    );
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
            it('Получен токен англоязычного сотрудника. Интерфейс переведён на английский.', function() {
                tester.widgetSettings().
                    storageData().
                    thirdToken().
                    receive();

                tester.switchButton('Показать чаты').expectNotToExist();
                tester.switchButton('Show chats').expectToBeVisible();
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

                notificationTester.
                    grantPermission().
                    recentNotification();

                tester.installmentSettingsProbableUpdatingRequest().receiveResponse();

                tester.popupStateSettingRequest().
                    disabled().
                    receiveResponse();

                tester.chatsVisibilitySettingRequest().
                    disabled().
                    receiveResponse();

                tester.missedEventsCountSettingRequest().receiveResponse();
            });

            describe('Получен токен авторизации и настройки.', function() {
                let widgetSettings;

                beforeEach(function() {
                    widgetSettings = tester.widgetSettings().storageData();
                });

                describe('Кнопка видимости должна добавляться перед элементом.', function() {
                    beforeEach(function() {
                        widgetSettings.receive();

                        tester.popupStateSettingRequest().receiveResponse();
                        tester.chatsVisibilitySettingRequest().receiveResponse();

                        tester.stateSettingRequest().
                            userDataFetched().
                            receive();

                        tester.popupStateSettingRequest().
                            userDataFetched().
                            receiveResponse();

                        tester.notificationSettingRequest().
                            success().
                            expectToBeSent();

                        tester.notificationsClosingRequest().receive();

                        tester.widgetSettings().
                            windowMessage().
                            expectToBeSent();
                    });

                    describe('Получено событие инициализации субмодуля сотрудников.', function() {
                        beforeEach(function() {
                            tester.submoduleInitilizationEvent().
                                operatorWorkplace().
                                receive();
                        });

                        describe('Получено событие инициализации субмодуля чатов.', function() {
                            beforeEach(function() {
                                tester.submoduleInitilizationEvent().receive();
                                tester.unreadMessagesCountSettingRequest().receive();

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

                                it('Настройки изменились. Изменился DOM. Кнопки добавлены.', function() {
                                    tester.widgetSettings().
                                        storageData().
                                        insertAfter().
                                        receive();

                                    tester.widgetSettings().
                                        windowMessage().
                                        insertAfter().
                                        expectToBeSent();

                                    tester.widgetSettings().
                                        windowMessage().
                                        chatsSettings().
                                        expectToBeSent();

                                    tester.page.triplicate();
                                    spendTime(1000);

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
                                        '[+7 (495) 123-45-63] ' +

                                        'Первый элемент #2 ' +
                                        'Некий элемент #2 ' +
                                        'Трубочка ' +
                                        'Последний элемент #2 ' +

                                        'Телефон: 74951234577 ' +
                                        'Телефон: 74951234579 ' +
                                        'Номер телефона: +74951234581 (74951234580) ' +
                                        'Номер телефона: +74951234583 (74951234582) ' +
                                        '[+7 (495) 123-45-64] ' +
                                        '[+7 (495) 123-45-63] ' +

                                        'Первый элемент #3 ' +
                                        'Некий элемент #3 ' +
                                        'Трубочка ' +
                                        'Последний элемент #3 ' +

                                        'Телефон: 74951234586 ' +
                                        'Телефон: 74951234588 ' +
                                        'Номер телефона: +74951234590 (74951234589) ' +
                                        'Номер телефона: +74951234592 (74951234591) ' +
                                        '[+7 (495) 123-45-64] ' +
                                        '[+7 (495) 123-45-63]'
                                    );
                                });
                                it(
                                    'Содержимое страницы снова изменилось. Прошло некоторое время.  Кнопка добавлена ' +
                                    'в измененное содержимое страницы.',
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

                                        'Телефон: 74951234577 ' +
                                        'Телефон: 74951234579 ' +
                                        'Номер телефона: +74951234581 (74951234580) ' +
                                        'Номер телефона: +74951234583 (74951234582) ' +
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

                                        'Телефон: 74951234577 ' +
                                        'Телефон: 74951234579 ' +
                                        'Номер телефона: +74951234581 (74951234580) ' +
                                        'Номер телефона: +74951234583 (74951234582) ' +
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

                                        '+74951234577 ' +
                                        '+74951234579 ' +
                                        '+74951234581 ' +
                                        '+74951234583 ' +
                                        '[+7 (495) 123-45-64] ' +
                                        '[+7 (495) 123-45-63]'
                                    );
                                });
                            });
                            describe('Получен запрос изменения видимости чатов.', function() {
                                beforeEach(function() {
                                    tester.toggleChatsVisibilityRequest().expectResponseToBeSent();

                                    tester.chatsVisibilitySettingRequest().
                                        visible().
                                        receiveResponse();

                                    tester.chatListOpeningRequest().expectToBeSent();
                                });

                                it('Приходит новое сообщение. Уведомление не было отображено.', function() {
                                    tester.notificationShowingRequest().receive();
                                });
                                it('Получаю запрос скрытия окна чатов. Окно скрыто.', function() {
                                    tester.chatsHidingRequest().receive();
                                    tester.chatsVisibilitySettingRequest().receiveResponse();

                                    tester.iframe.atIndex(1).expectToBeHidden();
                                    tester.iframe.first.expectToBeHidden();
                                });
                                it('Чаты видимы.', function() {
                                    tester.iframe.atIndex(1).expectToBeHidden();
                                    tester.iframe.first.expectToBeVisible();
                                });
                            });
                            describe('От IFrame получено сообщение о показе софтфона.', function() {
                                beforeEach(function() {
                                    tester.stateSettingRequest().
                                        userDataFetched().
                                        visible().
                                        receive();

                                    tester.popupStateSettingRequest().
                                        userDataFetched().
                                        visible().
                                        receiveResponse();
                                });

                                it('От IFrame получено сообщение о скрытии софтфона. Софтфон скрыт.', function() {
                                    tester.stateSettingRequest().
                                        userDataFetched().
                                        receive();

                                    tester.popupStateSettingRequest().
                                        userDataFetched().
                                        receiveResponse();

                                    tester.iframe.atIndex(1).expectToBeHidden();
                                    tester.iframe.first.expectToBeHidden();

                                    tester.localStorage.
                                        key('softphone-visibility').
                                        expectToHaveValue('false');
                                });
                                it('Отображён софтфон.', function() {
                                    tester.iframe.atIndex(1).expectToHaveWidth(340);
                                    tester.iframe.atIndex(1).expectToHaveHeight(212);
                                    tester.iframe.first.expectToBeHidden();

                                    tester.localStorage.
                                        key('softphone-visibility').
                                        expectToHaveValue('true');
                                });
                            });
                            describe('Получен запрос отображения уведомления.', function() {
                                let notificationShowingRequest,
                                    notification;

                                beforeEach(function() {
                                    notificationShowingRequest = tester.notificationShowingRequest().receive();

                                    notification = notificationTester.
                                        grantPermission().
                                        recentNotification();
                                });

                                it('Нажимаю на уведомление. Отправлен запрос нажатия на уведомление.', function() {
                                    notification.click();
 
                                    notificationShowingRequest.
                                        click().
                                        expectToBeSent();

                                    tester.chatsVisibilitySettingRequest().
                                        visible().
                                        receiveResponse();

                                    tester.iframe.
                                        withSrc('https://prod-msk-softphone-widget-iframe.uiscom.ru/chrome/softphone').
                                        expectToBeHidden();

                                    tester.iframe.
                                        withSrc('https://prod-msk-softphone-widget-iframe.uiscom.ru/chrome/chats').
                                        expectToBeVisible();
                                });
                                it('Отображены данные сообщения.', function() {
                                    notification.
                                        expectToHaveTitle('Помакова Бисерка Драгановна').
                                        expectToHaveTag('16479303').
                                        expectToHaveBody('Я люблю тебя').
                                        expectToBeOpened();
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
                                tester.softphoneVisibilityToggleRequest().receive();
                                tester.softphoneVisibilityToggleRequest().expectToBeSent();
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
                                tester.softphoneVisibilityToggleRequest().expectToBeSent();
                            });
                            it(
                                'Получено сообщение о пропущенном звонке. Отображено количество пропущенных звонков.',
                            function() {
                                tester.stateSettingRequest().
                                    userDataFetched().
                                    lostCalls(1).
                                    receive();

                                tester.missedEventsCountSettingRequest().
                                    value(1).
                                    receiveResponse();

                                tester.visibilityButton.expectToHaveTextContent('Трубочка (1)');
                            });
                            it(
                                'Получаю запрос изменения видимости. В IFrame отправлен запрос изменения видимости.',
                            function() {
                                tester.toggleWidgetVisibilityRequest().expectResponseToBeSent();
                                tester.softphoneVisibilityToggleRequest().expectToBeSent();
                            });
                            it(
                                'Получен запрос видимости. В ответ на запрос было отправлено текущее состояние.',
                            function() {
                                tester.stateRequest().expectResponseToBeSent();

                                tester.popupStateSettingRequest().
                                    userDataFetched().
                                    receiveResponse();

                                tester.chatsVisibilitySettingRequest().receiveResponse();
                                tester.iframe.atIndex(1).expectToBeHidden();
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
                                
                                tester.iframe.
                                    atIndex(1).
                                    expectAttributeToHaveValue(
                                        'src',
                                        'https://prod-msk-softphone-widget-iframe.uiscom.ru/chrome/softphone',
                                    );
                                
                                tester.localStorage.
                                    key('softphone-visibility').
                                    expectNotToHaveValue('true');
                            });
                        });
                        it('Запрос установления настроек чатов не был отправлен.', function() {
                            postMessages.nextMessage().expectNotToExist();
                        });
                    });
                    describe('Получено запрос регистрации вложенного контент-скрипта.', function() {
                        beforeEach(function() {
                            tester.nestedContentScriptRegistrationRequest().expectResponseToBeSent();
                            tester.initializednessEvent().expectToBeSent();
                        });

                        it(
                            'Получено событие инициализации субмодуля чатов. Был отправлен запрос инициализации ' +
                            'чатов.',
                        function() {
                            tester.submoduleInitilizationEvent().receive();
                            tester.unreadMessagesCountSettingRequest().receive();

                            tester.widgetSettings().
                                windowMessage().
                                chatsSettings().
                                expectToBeSent();

                            tester.initializednessEvent().
                                chats().
                                expectToBeSent();
                        });
                        it('Запрос инициализации чатов не был отправлен.', function() {
                            postMessages.nextMessage().expectNotToExist();
                        });
                    });
                });
                describe('URL страницы не соответствует wildcard.', function() {
                    beforeEach(function() {
                        widgetSettings.
                            anotherSoftphoneWildcart().
                            receive();

                        tester.chatsVisibilitySettingRequest().receiveResponse();

                        tester.notificationSettingRequest().
                            success().
                            expectToBeSent();

                        tester.submoduleInitilizationEvent().
                            operatorWorkplace().
                            receive();

                        tester.submoduleInitilizationEvent().receive();
                        tester.unreadMessagesCountSettingRequest().receive();

                        tester.widgetSettings().
                            windowMessage().
                            chatsSettings().
                            noSettings().
                            expectToBeSent();
                    });

                    describe('Получен запрос отображения софтфона.', function() {
                        beforeEach(function() {
                            tester.toggleWidgetVisibilityRequest().receive();
                            tester.popupStateSettingRequest().receiveResponse();
                        });

                        it('Получен запрос изменения состояния софтфона.', function() {
                            tester.stateSettingRequest().receive();

                            tester.widgetSettings().
                                noSettings().
                                windowMessage().
                                expectToBeSent();

                            tester.softphoneVisibilityToggleRequest().expectToBeSent();
                        });
                        it('Отображен IFrame софтфона.', function() {
                            tester.iframe.atIndex(1).expectAttributeToHaveValue(
                                'src',
                                'https://prod-msk-softphone-widget-iframe.uiscom.ru/chrome/softphone',
                            );

                            tester.iframe.first.expectAttributeToHaveValue(
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

                        tester.iframe.
                            withSrc('https://prod-msk-softphone-widget-iframe.uiscom.ru/chrome/softphone').
                            expectNotToExist();
                    });
                });
                describe('Для отображения телефона должно использоваться необработанное значение.', function() {
                    beforeEach(function() {
                        widgetSettings.
                            rawPhone().
                            receive();

                        tester.notificationSettingRequest().
                            success().
                            expectToBeSent();

                        tester.stateSettingRequest().receive();

                        tester.popupStateSettingRequest().receiveResponse();
                        tester.chatsVisibilitySettingRequest().receiveResponse();

                        tester.widgetSettings().
                            rawPhone().
                            windowMessage().
                            expectToBeSent();

                        tester.submoduleInitilizationEvent().
                            operatorWorkplace().
                            receive();

                        tester.submoduleInitilizationEvent().receive();
                        tester.unreadMessagesCountSettingRequest().receive();

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
                        widgetSettings.textSelectorRegExp();
                    });

                    describe('Используется режим замены.', function() {
                        beforeEach(function() {
                            widgetSettings.receive();

                            tester.notificationSettingRequest().
                                success().
                                expectToBeSent();

                            tester.popupStateSettingRequest().receiveResponse();
                            tester.chatsVisibilitySettingRequest().receiveResponse();

                            tester.stateSettingRequest().receive();

                            tester.widgetSettings().
                                textSelectorRegExp().
                                windowMessage().
                                expectToBeSent();

                            tester.submoduleInitilizationEvent().
                                operatorWorkplace().
                                receive();

                            tester.submoduleInitilizationEvent().receive();
                            tester.unreadMessagesCountSettingRequest().receive();

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
                    it('Используется режим вставки. Номера вставлены.', function() {
                        widgetSettings.
                            insertHandlerAfterElement().
                            receive();

                        tester.notificationSettingRequest().
                            success().
                            expectToBeSent();

                        tester.stateSettingRequest().receive();

                        tester.popupStateSettingRequest().receiveResponse();
                        tester.chatsVisibilitySettingRequest().receiveResponse();

                        tester.widgetSettings().
                            textSelectorRegExp().
                            insertHandlerAfterElement().
                            windowMessage().
                            expectToBeSent();

                        tester.submoduleInitilizationEvent().
                            operatorWorkplace().
                            receive();

                        tester.submoduleInitilizationEvent().receive();
                        tester.unreadMessagesCountSettingRequest().receive();

                        tester.widgetSettings().
                            windowMessage().
                            chatsSettings().
                            expectToBeSent();

                        tester.body.expectTextContentToHaveSubstring(
                            '[ +7 (495) 123-45-64: 74951234564 ] ' +
                            '[ +7 (495) 123-45-63: 74951234563 ]'
                        );
                    });
                });
                describe('Кнопка видимости должна добавляться после элемента.', function() {
                    beforeEach(function() {
                        widgetSettings.
                            insertAfter().
                            receive();

                        tester.notificationSettingRequest().
                            success().
                            expectToBeSent();

                        tester.popupStateSettingRequest().receiveResponse();
                        tester.chatsVisibilitySettingRequest().receiveResponse();

                        tester.stateSettingRequest().receive();

                        tester.widgetSettings().
                            insertAfter().
                            windowMessage().
                            expectToBeSent();
                    });

                    it('URL изменился. Кнопка видимости добавлена перед элементом.', function() {
                        tester.changeCurrentUrl();

                        tester.page.triggerMutation();
                        spendTime(1000);

                        tester.widgetSettings().
                            windowMessage().
                            expectToBeSent();

                        tester.widgetSettings().
                            windowMessage().
                            chatsSettings().
                            noSettings().
                            expectToBeSent();

                        tester.chatsVisibilitySettingRequest().
                            disabled().
                            receiveResponse();

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
                    it('Кнопка видимости добавлена после элемента.', function() {
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
                });
                it( 'Получены стили. Открываю окно чатов. Стили применены.', function() {
                    widgetSettings.
                        style().
                        receive();

                    tester.notificationSettingRequest().
                        success().
                        expectToBeSent();

                    tester.popupStateSettingRequest().receiveResponse();
                    tester.chatsVisibilitySettingRequest().receiveResponse();

                    tester.stateSettingRequest().receive();

                    tester.widgetSettings().
                        windowMessage().
                        style().
                        expectToBeSent();

                    tester.submoduleInitilizationEvent().
                        operatorWorkplace().
                        receive();

                    tester.submoduleInitilizationEvent().receive();
                    tester.unreadMessagesCountSettingRequest().receive();

                    tester.widgetSettings().
                        windowMessage().
                        chatsSettings().
                        expectToBeSent();

                    tester.toggleChatsVisibilityRequest().expectResponseToBeSent();

                    tester.chatsVisibilitySettingRequest().
                        visible().
                        receiveResponse();

                    tester.chatListOpeningRequest().expectToBeSent();
                });
                it(
                    'Получены настройки размера окна чатов. Открываю окно чатов. Окно чатов имеет указаный в ' +
                    'настройках размер.',
                function() {
                    widgetSettings.
                        padding().
                        receive();

                    tester.notificationSettingRequest().
                        success().
                        expectToBeSent();

                    tester.popupStateSettingRequest().receiveResponse();
                    tester.chatsVisibilitySettingRequest().receiveResponse();

                    tester.stateSettingRequest().receive();

                    tester.widgetSettings().
                        windowMessage().
                        expectToBeSent();

                    tester.submoduleInitilizationEvent().
                        operatorWorkplace().
                        receive();

                    tester.submoduleInitilizationEvent().receive();
                    tester.unreadMessagesCountSettingRequest().receive();

                    tester.widgetSettings().
                        windowMessage().
                        chatsSettings().
                        padding().
                        expectToBeSent();

                    tester.toggleChatsVisibilityRequest().expectResponseToBeSent();

                    tester.chatsVisibilitySettingRequest().
                        visible().
                        receiveResponse();

                    tester.chatListOpeningRequest().expectToBeSent();

                    tester.iframe.first.expectToHaveTopOffset(5);
                    tester.iframe.first.expectToHaveLeftOffset(200);
                });
                it('Получен дубайский токен. Отображен IFrame с дубайского сервера.', function() {
                    widgetSettings.
                        anotherToken().
                        receive();

                    tester.notificationSettingRequest().
                        success().
                        expectToBeSent();

                    tester.popupStateSettingRequest().receiveResponse();
                    tester.chatsVisibilitySettingRequest().receiveResponse();

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

                    tester.submoduleInitilizationEvent().
                        operatorWorkplace().
                        receive();

                    tester.submoduleInitilizationEvent().receive();
                    tester.unreadMessagesCountSettingRequest().receive();

                    tester.widgetSettings().
                        anotherToken().
                        windowMessage().
                        chatsSettings().
                        expectToBeSent();

                    tester.iframe.atIndex(1).expectAttributeToHaveValue(
                        'src',
                        'https://prod-msk-softphone-widget-iframe.callgear.ae/chrome/softphone',
                    );
                });
                it(
                    'Кнопка видимости должна добавляться после несуществующего элемента. Кнопка видимости не была ' +
                    'добавлена.',
                function() {
                    widgetSettings.
                        insertBeforeNonExistingElement().
                        receive();

                    tester.notificationSettingRequest().
                        success().
                        expectToBeSent();

                    tester.stateSettingRequest().receive();

                    tester.popupStateSettingRequest().receiveResponse();
                    tester.chatsVisibilitySettingRequest().receiveResponse();

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

                    tester.notificationSettingRequest().
                        success().
                        expectToBeSent();

                    tester.stateSettingRequest().receive();

                    tester.popupStateSettingRequest().receiveResponse();
                    tester.chatsVisibilitySettingRequest().receiveResponse();

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
                    'Кнопка видимости должна добавляться внутрь элемента. Кнопка видимости добавлена внурть элемента.',
                function() {
                    widgetSettings.
                        insertInto().
                        receive();

                    tester.notificationSettingRequest().
                        success().
                        expectToBeSent();

                    tester.stateSettingRequest().receive();

                    tester.popupStateSettingRequest().receiveResponse();
                    tester.chatsVisibilitySettingRequest().receiveResponse();

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

                    tester.notificationSettingRequest().
                        success().
                        expectToBeSent();

                    tester.stateSettingRequest().receive();

                    tester.popupStateSettingRequest().receiveResponse();
                    tester.chatsVisibilitySettingRequest().receiveResponse();

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

                    tester.notificationSettingRequest().
                        success().
                        expectToBeSent();

                    tester.stateSettingRequest().receive();

                    tester.popupStateSettingRequest().receiveResponse();
                    tester.chatsVisibilitySettingRequest().receiveResponse();

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

                    tester.notificationSettingRequest().
                        success().
                        expectToBeSent();

                    tester.notificationsClosingRequest().receive();

                    tester.popupStateSettingRequest().receiveResponse();
                    tester.chatsVisibilitySettingRequest().receiveResponse();

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

                    tester.submoduleInitilizationEvent().
                        operatorWorkplace().
                        receive();

                    tester.submoduleInitilizationEvent().receive();
                    tester.unreadMessagesCountSettingRequest().receive();

                    tester.widgetSettings().
                        windowMessage().
                        chatsSettings().
                        expectToBeSent();

                    tester.iframe.
                        withSrc('https://prod-msk-softphone-widget-iframe.uiscom.ru/chrome/chats').
                        expectToBeHidden();

                    tester.iframe.
                        withSrc('https://prod-msk-softphone-widget-iframe.uiscom.ru/chrome/softphone').
                        expectToBeVisible();

                    tester.iframe.
                        withSrc('https://prod-msk-softphone-widget-iframe.uiscom.ru/chrome/notifications').
                        expectToBeHidden();
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

                    tester.iframe.
                        withSrc('https://prod-msk-softphone-widget-iframe.uiscom.ru/chrome/chats').
                        expectNotToExist();

                    tester.iframe.
                        withSrc('https://prod-msk-softphone-widget-iframe.uiscom.ru/chrome/softphone').
                        expectNotToExist();

                    tester.iframe.
                        withSrc('https://prod-msk-softphone-widget-iframe.uiscom.ru/chrome/notifications').
                        expectToBeHidden();
                });
                it('Настройки для чатов отсутствуют. IFrame чатов скрыт.', function() {
                    widgetSettings.
                        anotherChatsWildcart().
                        receive();

                    tester.popupStateSettingRequest().receiveResponse();

                    tester.notificationSettingRequest().
                        success().
                        expectToBeSent();

                    tester.stateSettingRequest().
                        userDataFetched().
                        receive();

                    tester.popupStateSettingRequest().
                        userDataFetched().
                        receiveResponse();

                    tester.notificationsClosingRequest().receive();

                    tester.widgetSettings().
                        windowMessage().
                        expectToBeSent();

                    tester.iframe.
                        withSrc('https://prod-msk-softphone-widget-iframe.uiscom.ru/chrome/chats').
                        expectNotToExist();

                    tester.iframe.
                        withSrc('https://prod-msk-softphone-widget-iframe.uiscom.ru/chrome/softphone').
                        expectToBeHidden();

                    tester.iframe.
                        withSrc('https://prod-msk-softphone-widget-iframe.uiscom.ru/chrome/notifications').
                        expectToBeHidden();
                });
            });
            describe('Получен запрос регистрации вложенного контент-скрипта.', function() {
                beforeEach(function() {
                    tester.nestedContentScriptRegistrationRequest().expectResponseToBeSent();
                });

                describe('Получены настройки. Было отправлено событие инициализации.', function() {
                    beforeEach(function() {
                        tester.widgetSettings().
                            storageData().
                            receive();

                        tester.notificationSettingRequest().
                            success().
                            expectToBeSent();

                        tester.popupStateSettingRequest().receiveResponse();
                        tester.chatsVisibilitySettingRequest().receiveResponse();

                        tester.stateSettingRequest().
                            userDataFetched().
                            receive();

                        tester.popupStateSettingRequest().
                            userDataFetched().
                            receiveResponse();

                        tester.widgetSettings().
                            windowMessage().
                            expectToBeSent();

                        tester.submoduleInitilizationEvent().
                            operatorWorkplace().
                            receive();
                        
                        tester.initializednessEvent().expectToBeSent();
                    });

                    it('Инициализирован субмодуль чатов. Было отправлено событие инициализации.', function() {
                        tester.submoduleInitilizationEvent().receive();
                        tester.unreadMessagesCountSettingRequest().receive();

                        tester.widgetSettings().
                            windowMessage().
                            chatsSettings().
                            expectToBeSent();

                        tester.initializednessEvent().
                            chats().
                            expectToBeSent();
                    });
                    it(
                        'Получен запрос регистрации вложенного контент-скрипта. Было отправлено событие инициализации.',
                    function() {
                        tester.nestedContentScriptRegistrationRequest().expectResponseToBeSent();
                        tester.initializednessEvent().expectToBeSent();
                    });
                    it('Ничего не происходит.', function() {
                        postMessages.nextMessage().expectNotToExist();
                    });
                });
                it('Событие инициализации не было отправлено.', function() {
                    postMessages.nextMessage().expectNotToExist();
                });
            });
            describe('Получено сообщение о безуспешной попытке авторизации.', function() {
                beforeEach(function() {
                    tester.widgetSettings().
                        failedToAuthorize().
                        storageData().
                        receive();

                    tester.notificationSettingRequest().expectToBeSent();
                });
                
                it('Получен запрос закрытия уведомления. Уведомление закрыто.', function() {
                    tester.notificationsClosingRequest().receive();

                    tester.iframe.
                        withSrc('https://prod-msk-softphone-widget-iframe.uiscom.ru/chrome/notifications').
                        expectToBeHidden();
                });
                it('IFrame уведомлений инициализирован. Отправлена мнемоника ошибки.', function() {
                    tester.notificationInitializednessEvent().receive();
                    tester.notificationSettingRequest().expectToBeSent();
                });
                it('Отображено сообщение об ошибке.', function() {
                    postMessages.nextMessage().expectNotToExist();

                    tester.widgetSettings().
                        failedToAuthorize().
                        noError().
                        storageData().
                        expectToBeSaved();

                    tester.iframe.
                        withSrc('https://prod-msk-softphone-widget-iframe.uiscom.ru/chrome/notifications').
                        expectToBeVisible();
                });
            });
            it('Получен запрос скачивание лога. Лог скачен.', function() {
                postMessages.receive(
                    'ignore:log:Set token after operator-workplace submodule initialization'
                );

                tester.logDownloadingRequest().expectResponseToBeSent();

                tester.anchor.
                    withFileName('20191219.121006.000.log.txt').
                    expectHrefToBeBlobWithSubstring(
                        'Thu Dec 19 2019 12:10:06 GMT+0300 (Moscow Standard Time) ' +
                        'Set token after operator-workplace submodule initialization'
                    );

                tester.anchor.
                    withFileName('20191219.121006.000.log.txt').
                    expectHrefToBeBlobWithSubstring(
                        'Thu Dec 19 2019 12:10:06 GMT+0300 (Moscow Standard Time) ' +
                        'Storage data {"token":null,"settings":null}'
                    );
            });
            it('IFrame отсутствует.', function() {
                tester.body.expectTextContentNotToHaveSubstring('Не удалось авторизоваться');

                tester.iframe.
                    withSrc('https://prod-msk-softphone-widget-iframe.uiscom.ru/chrome/softphone').
                    expectNotToExist();

                tester.iframe.
                    withSrc('https://prod-msk-softphone-widget-iframe.uiscom.ru/chrome/chats').
                    expectNotToExist();

                tester.iframe.
                    withSrc('https://prod-msk-softphone-widget-iframe.uiscom.ru/chrome/notifications').
                    expectToBeHidden();
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
                        tester.installmentSettingsUpdatingRequest().expectToBeSent();
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
                it('Получено длинное имя. Отображено имя.', function() {
                    popupStateSettingRequest.
                        longName().
                        expectResponseToBeSent();

                    tester.body.expectTextContentToHaveSubstring(
                        'Кобыла и трупоглазые жабы искали цезию, нашли поздно утром свистящего хна'
                    );
                });
            });
            it('Отображён логин авторизованного пользователя.', function() {
                tester.body.expectTextContentToHaveSubstring('bitrixtest');
                tester.switchButton('Показать чаты').expectToBeVisible();
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

                    tester.widgetSettings().
                        chatsSettings().
                        request().
                        receiveResponse();
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
                            chatsSettings().
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
                    'Не удалось получить настройки. Ответ имеет формат JSON. Сообщение об ошибке сохранено.',
                function() {
                    widgetSettings.
                        failedToGetSettingsWithJsonResponse().
                        receiveResponse();

                    tester.widgetSettings().
                        failedToGetSettingsWithJsonResponse().
                        storageData().
                        expectToBeSaved();
                });
                it('Отсутствует интеграция. Сообщение об ошибке не было сохранено.', function() {
                    widgetSettings.
                        noIntegrations().
                        receiveResponse();

                    tester.widgetSettings().
                        storageData().
                        expectToBeSaved();
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
                        chatsSettings().
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

                    tester.widgetSettings().
                        chatsSettings().
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
                        chatsSettings().
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
            it('Нет пропущенных событий. Количество пропущенных событий не отображается.', function() {
                tester.missedEventsCountSettingRequest().expectResponseToBeSent();

                tester.chrome.
                    browserAction.
                    expectToHaveNoBadgeText();
            });
            it('Есть пропущенные события. Отображено количество пропущенных событий.', function() {
                tester.missedEventsCountSettingRequest().
                    value(75).
                    expectResponseToBeSent();

                tester.chrome.
                    browserAction.
                    expectBadgeTextHaveValue(75);
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
                        expectHostPermissionToBeRequested('https://uc-sso-dub-api.callgear.ae/*').
                        expectHostPermissionToBeRequested('https://uc-sso-dub-api.callgear.com/*').
                        expectHostPermissionToBeRequested('https://my.uiscom.ru/*').
                        expectHostPermissionToBeRequested('https://my.callgear.ae/*').
                        expectHostPermissionToBeRequested('https://my.comagic.com/*').
                        expectHostPermissionToBeRequested('https://dev-int0-chats-logic.uis.st/v1/*').
                        expectHostPermissionToBeRequested('https://chats-cg-logic.callgear.ae/v1/*').
                        expectHostPermissionToBeRequested('https://chats-cg-logic.callgear.com/v1/*');
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

                        describe('Получен авторизационный токен. Отправлены запросы настроек.', function() {
                            let softphoneWidgetSettingsRequest,
                                chatsWidgetSettingsRequest;

                            beforeEach(function() {
                                oauthRequest.receiveResponse();

                                softphoneWidgetSettingsRequest = tester.widgetSettings().
                                    request().
                                    expectToBeSent();
                                
                                chatsWidgetSettingsRequest = tester.widgetSettings().
                                    chatsSettings().
                                    request().
                                    expectToBeSent();
                            });

                            it('Один из запросов завершился ошибкой. Сообщение об ошибке сохранено.', function() {
                                chatsWidgetSettingsRequest.receiveResponse();

                                softphoneWidgetSettingsRequest.
                                    failedToGetSettings().
                                    receiveResponse();

                                tester.widgetSettings().
                                    failedToGetSettings().
                                    noSoftphoneSettings().
                                    storageData().
                                    expectToBeSaved();
                            });
                            it('Получены ответы на запрос настроек. Настройки сохранены в хранилище.', function() {
                                softphoneWidgetSettingsRequest.receiveResponse();
                                chatsWidgetSettingsRequest.receiveResponse();

                                tester.widgetSettings().
                                    storageData().
                                    expectToBeSaved();
                            });
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
                                chatsSettings().
                                anotherToken().
                                request().
                                receiveResponse();

                            tester.widgetSettings().
                                anotherToken().
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
                                chatsSettings().
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
                    it('Получен дубайский код. Запрос токена отправлен на дубайский сервер.', function() {
                        authFlow.
                            anotherCode().
                            receiveResponse();

                        tester.oauthRequest().
                            dubai().
                            expectToBeSent();
                    });
                    it('Пользователь отменил авторизацию. Ошибка не была сохранена.', function() {
                        authFlow.cancel();

                        tester.widgetSettings().
                            storageData().
                            noData().
                            loaded().
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
                tester.popupStateSettingRequest().expectResponseToBeSent();
            });
        });
        describe('Контент скрипт встроился в IFrame. Сотрудник авторизован.', function() {
            beforeEach(function() {
                tester = new Tester({
                    softphoneHost: 'my.uiscom.ru',
                    isAuthorized: true,
                    isIframe: true,
                    ...options,
                });

                tester.installmentSettingsProbableUpdatingRequest().receiveResponse();
                tester.nestedContentScriptRegistrationRequest().receiveResponse();
            });

            describe('Было получено событие инициализации чатов.', function() {
                beforeEach(function() {
                    tester.initializednessEvent().
                        chats().
                        receive();
                });

                describe('Было получено событие инициализации софтфона.', function() {
                    beforeEach(function() {
                        tester.initializednessEvent().receive();
                    });

                    it('Нажимаю на номер телефона. Отправлен запрос вызова.', function() {
                        tester.phoneButton.atIndex(2).click();
                        tester.installmentSettingsProbableUpdatingRequest().receiveResponse();

                        postMessages.nextMessage().expectMessageToContain({
                            method: 'start_call',
                            data: '74951234571',
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
                        tester.softphoneVisibilityToggleRequest().receive();
                        tester.softphoneVisibilityToggleRequest().expectToBeSent();
                    });
                    it('Получен запрос состояния от popup-скрипта. Ответ не был отправлен.', function() {
                        tester.stateRequest().receive();
                    });
                    it('Добавлены кнопки видимости и кнопки телефонов. IFrame софтфона отсутствует.', function() {
                        tester.iframe.atIndex(1).expectNotToExist();

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
                });
                it('Кнопки не были добавлены.', function() {
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
                });
            });
            it('Кнопки не были добавлены.', function() {
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
                        tester.statusesRequest().receiveResponse();
                        tester.permissionsRequest().receiveResponse();
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
                        tester.softphoneVisibilityToggleRequest().receive();

                        tester.slavesNotification().
                            additional().
                            visible().
                            expectToBeSent();

                        tester.stateSettingRequest().
                            userDataFetched().
                            visible().
                            expectToBeSent();

                        tester.eventsWebSocket.disconnect(4429);

                        tester.stateSettingRequest().
                            userDataFetched().
                            visible().
                            destroyed().
                            expectToBeSent();

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
                        tester.localStorage.
                            key('token').
                            expectToHaveValue(tester.oauthToken);
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
                        destroyed().
                        expectToBeSent();

                    tester.localStorage.
                        key('token').
                        expectToBeEmpty();
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
                tester.softphoneVisibilityToggleRequest().receive();

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

                        tester.amocrmStateSettingRequest().expectToBeSent();
                        tester.softphoneVisibilityToggleRequest().expectToBeSent();

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
                        tester.iframe.expectToBeVisible();

                        tester.localStorage.
                            key('data_center').
                            expectToHaveValue('dubai');

                        tester.iframe.expectAttributeToHaveValue(
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
                        tester.iframe.expectToBeVisible();

                        tester.localStorage.
                            key('data_center').
                            expectToBeEmpty();

                        tester.iframe.expectAttributeToHaveValue(
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
                    tester.softphoneVisibilityToggleRequest().expectToBeSent();
                });
                it('Софтфон отображен.', function() {
                    tester.iframe.expectToBeVisible();

                    tester.iframe.expectAttributeToHaveValue(
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
                tester.iframe.expectToBeHidden();
            });
        });
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
                tester.statusesRequest().receiveResponse();
                tester.permissionsRequest().receiveResponse();
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

                        tester.softphoneVisibilityToggleRequest().receive();

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

                        tester.stateSettingRequest().
                            userDataFetched().
                            visible().
                            destroyed().
                            expectToBeSent();

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
                        tester.softphoneVisibilityToggleRequest().receive();

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
                        anotherSoftphoneWildcart().
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
                    tester.softphoneVisibilityToggleRequest().receive();

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
        describe('Открываю IFrame чатов. Получены настройки.', function() {
            let accountRequest,
                secondAccountRequest,
                widgetSettings;

            beforeEach(function() {
                tester = new Tester({
                    application: 'chatsIframe',
                    isIframe: true,
                    ...options,
                });

                tester.submoduleInitilizationEvent().
                    operatorWorkplace().
                    expectToBeSent();

                unfilteredPostMessages.nextMessage().expectMessageToStartsWith(
                    'ignore:log:Set token after operator-workplace submodule initialization'
                );

                tester.submoduleInitilizationEvent().expectToBeSent();
                tester.unreadMessagesCountSettingRequest().expectToBeSent();

                widgetSettings = tester.widgetSettings().
                    windowMessage().
                    chatsSettings();
            });

            describe('Получен российский токен.', function() {
                beforeEach(function() {
                    widgetSettings.receive();

                    accountRequest = tester.accountRequest().
                        forIframe().
                        webAccountLoginUnavailable().
                        expectToBeSent();

                    secondAccountRequest = tester.accountRequest().
                        forIframe().
                        fromIframe().
                        webAccountLoginUnavailable().
                        expectToBeSent();

                    tester.chatSettingsRequest().receiveResponse();
                    tester.chatChannelListRequest().receiveResponse();

                    tester.employeeStatusesRequest().
                        oauthToken().
                        receiveResponse();

                    tester.listRequest().receiveResponse();
                    tester.siteListRequest().receiveResponse();
                    tester.messageTemplateListRequest().receiveResponse();
                    tester.commonMessageTemplatesRequest().receiveResponse();
                    tester.messageTemplatesSettingsRequest().receiveResponse();
                });

                describe('Чаты доступны.', function() {
                    let chatListRequest;

                    beforeEach(function() {
                        accountRequest.
                            operatorWorkplaceAvailable().
                            receiveResponse();

                        tester.employeesBroadcastChannel().
                            applyLeader().
                            expectToBeSent().
                            waitForSecond();

                        tester.employeesBroadcastChannel().
                            applyLeader().
                            expectToBeSent().
                            waitForSecond();

                        tester.employeesBroadcastChannel().
                            tellIsLeader().
                            expectToBeSent();

                        tester.employeesWebSocket.connect();

                        tester.employeesInitMessage().
                            oauthToken().
                            expectToBeSent();

                        secondAccountRequest.
                            operatorWorkplaceAvailable().
                            receiveResponse();

                        tester.chatsWebSocket.connect();

                        tester.chatsInitMessage().
                            oauthToken().
                            expectToBeSent();

                        tester.employeeSettingsRequest().receiveResponse();

                        tester.employeeRequest().
                            oauthToken().
                            receiveResponse();

                        tester.accountRequest().
                            forIframe().
                            fromIframe().
                            webAccountLoginUnavailable().
                            operatorWorkplaceAvailable().
                            receiveResponse();

                        tester.searchResultsRequest().
                            anotherToken().
                            emptySearchString().
                            receiveResponse();

                        tester.countersRequest().
                            noNewChats().
                            noClosedChats().
                            receiveResponse();

                        tester.unreadMessagesCountSettingRequest().
                            value(75).
                            expectToBeSent();

                        tester.offlineMessageCountersRequest().receiveResponse();
                        tester.chatChannelListRequest().receiveResponse();
                        tester.siteListRequest().receiveResponse();
                        tester.markListRequest().receiveResponse();

                        tester.chatListRequest().
                            forCurrentEmployee().
                            noData().
                            receiveResponse();

                        chatListRequest = tester.chatListRequest().
                            forCurrentEmployee().
                            active().
                            expectToBeSent();

                        tester.chatListRequest().forCurrentEmployee().
                            closed().
                            noData().
                            receiveResponse();

                        tester.chatChannelTypeListRequest().receiveResponse();

                        tester.offlineMessageListRequest().notProcessed().receiveResponse();
                        tester.offlineMessageListRequest().processing().receiveResponse();
                        tester.offlineMessageListRequest().processed().receiveResponse();

                        tester.chatChannelSearchRequest().
                            emptySearchString().
                            receiveResponse();

                        tester.button('В работе 75').click();
                    });

                    describe('Контакт не найден.', function() {
                        beforeEach(function() {
                            chatListRequest.receiveResponse();
                        });

                        describe('Получен запрос поиска каналов.', function() {
                            let searchResultsRequest,
                                chatChannelSearchRequest;

                            beforeEach(function() {
                                tester.channelsSearchingRequest().receive();

                                searchResultsRequest = tester.searchResultsRequest().
                                    anotherToken().
                                    fourthSearchString().
                                    newVisitor().
                                    telegramPrivate().
                                    expectToBeSent();

                                chatChannelSearchRequest = tester.chatChannelSearchRequest().
                                    thirdSearchString().
                                    telegramPrivate().
                                    addTelegramPrivate();
                            });

                            describe('В канале есть чужие чаты.', function() {
                                beforeEach(function() {
                                    chatChannelSearchRequest.anotherEmployee();
                                });

                                describe('Поиск каналов завершен. Ответ отправлен в родительское окно.', function() {
                                    beforeEach(function() {
                                        searchResultsRequest.receiveResponse();
                                        chatChannelSearchRequest.receiveResponse();

                                        tester.channelsSearchingResponse().
                                            addChannel().
                                            unavailable().
                                            expectToBeSent();
                                    });

                                    describe(
                                        'Получен запрос открытия чата с номером по которому не производился поиск.', 
                                    function() {
                                        beforeEach(function() {
                                            tester.chatOpeningRequest().
                                                anotherPhone().
                                                anotherChannel().
                                                receive();

                                            tester.searchResultsRequest().
                                                anotherToken().
                                                fifthSearchString().
                                                newVisitor().
                                                telegramPrivate().
                                                receiveResponse();

                                            tester.chatChannelSearchRequest().
                                                fourthSearchString().
                                                telegramPrivate().
                                                anotherChannel().
                                                noChat().
                                                receiveResponse();

                                            tester.chatListRequest().
                                                forCurrentEmployee().
                                                noData().
                                                receiveResponse();

                                            tester.chatListRequest().
                                                active().
                                                secondPage().
                                                forCurrentEmployee().
                                                receiveResponse();

                                            tester.chatListRequest().
                                                closed().
                                                noData().
                                                forCurrentEmployee().
                                                receiveResponse();

                                            tester.chatListRequest().
                                                active().
                                                noData().
                                                forCurrentEmployee().
                                                isOtherEmployeesAppeals().
                                                receiveResponse();

                                            tester.chatStartingRequest().
                                                thirdPhone().
                                                anotherChannel().
                                                receiveResponse();

                                            tester.chatListRequest().
                                                thirdChat().
                                                receiveResponse();

                                            tester.submoduleInitilizationEvent().
                                                contacts().
                                                expectToBeSent();

                                            tester.visitorCardRequest().receiveResponse();
                                            tester.scheduledMessagesRequest().receiveResponse();
                                            tester.chatInfoRequest().receiveResponse();

                                            tester.usersRequest().
                                                forContacts().
                                                forIframe().
                                                receiveResponse();

                                            tester.contactGroupsRequest().
                                                forIframe().
                                                receiveResponse();

                                            tester.contactGroupsRequest().
                                                forIframe().
                                                receiveResponse();

                                            tester.usersRequest().
                                                forContacts().
                                                forIframe().
                                                receiveResponse();
                                        });

                                        it(
                                            'Перевожу чат другому оператору. Чат закрывается, список чатов отображён.',
                                        function() {
                                            tester.button('Принять чат в работу').click();
                                            tester.acceptChatRequest().receiveResponse();

                                            tester.moreIcon.click();

                                            tester.select.
                                                option('Переадресовать чат').
                                                click();

                                            tester.select.click();

                                            tester.chatTransferGroupsRequest().receiveResponse();

                                            tester.select.
                                                option('Костова Марвуда Любенова').
                                                click();

                                            tester.button('Отправить').click();
                                            tester.requestTransfer().receiveResponse();

                                            tester.countersRequest().
                                                noNewChats().
                                                noClosedChats().
                                                receiveResponse();

                                            tester.button('Закрыть').click();
                                            tester.transferAcceptedMessage().receive();

                                            spendTime(5000);

                                            tester.employeesPing().expectToBeSent();
                                            tester.employeesPing().receive();

                                            tester.countersRequest().
                                                noNewChats().
                                                noClosedChats().
                                                receiveResponse();

                                            tester.button('В работе 75').expectToBeVisible();
                                        });
                                        it('Чат открыт.', function() {
                                            tester.button('В работе 75').expectNotToExist();

                                            tester.contactBar.expectTextContentToHaveSubstring(
                                                'ФИО ' +
                                                'Помакова Бисерка Драгановна'
                                            );
                                        });
                                    });
                                    it(

                                        'Получен такой же запрос поиска каналов. Ответ отправлен в родительское окно.',
                                    function() {
                                        tester.channelsSearchingRequest().receive();

                                        tester.channelsSearchingResponse().
                                            addChannel().
                                            unavailable().
                                            expectToBeSent();
                                    });
                                    it('Ничего не произошло.', function() {
                                        postMessages.nextMessage().expectNotToExist();
                                        ajax.expectNoRequestsToBeSent();
                                    });
                                });
                                describe('Получен другой запрос поиска каналов.', function() {
                                    beforeEach(function() {
                                        tester.channelsSearchingRequest().
                                            anotherPhone().
                                            receive();
                                    });

                                    it(
                                        'Поиск каналов завершен. Отправлен запрос в сервер. Ответы отправлены в ' +
                                        'родительское окно.',
                                    function() {
                                        searchResultsRequest.receiveResponse();
                                        chatChannelSearchRequest.receiveResponse();
                                       
                                        tester.searchResultsRequest().
                                            anotherToken().
                                            fifthSearchString().
                                            newVisitor().
                                            telegramPrivate().
                                            receiveResponse();

                                        tester.chatChannelSearchRequest().
                                            fourthSearchString().
                                            telegramPrivate().
                                            anotherChannel().
                                            noChat().
                                            receiveResponse();

                                        tester.channelsSearchingResponse().
                                            addChannel().
                                            unavailable().
                                            expectToBeSent();

                                        tester.channelsSearchingResponse().
                                            anotherChannel().
                                            expectToBeSent();
                                    });
                                    it(
                                        'Поиск каналов завершен. Один из запросов завершился неудачей. Отправлен ' +
                                        'запрос в сервер. Ответы отправлены в родительское окно.',
                                    function() {
                                        searchResultsRequest.receiveResponse();

                                        chatChannelSearchRequest.
                                            invalidFormat().
                                            receiveResponse();
                                       
                                        tester.searchResultsRequest().
                                            anotherToken().
                                            fifthSearchString().
                                            newVisitor().
                                            telegramPrivate().
                                            receiveResponse();

                                        tester.chatChannelSearchRequest().
                                            fourthSearchString().
                                            telegramPrivate().
                                            anotherChannel().
                                            noChat().
                                            receiveResponse();

                                        tester.channelsSearchingResponse().
                                            nothingFound().
                                            expectToBeSent();

                                        tester.channelsSearchingResponse().
                                            anotherChannel().
                                            expectToBeSent();
                                    });
                                    it('Запрос в сервер не был отправлен.', function() {
                                        ajax.expectNoRequestsToBeSent();
                                    });
                                });
                                it(
                                    'Получен такой же запрос поиска каналов. Ответ отправелен в родительское окно ' +
                                    'только один раз.',
                                function() {
                                    tester.channelsSearchingRequest().receive();

                                    searchResultsRequest.receiveResponse();
                                    chatChannelSearchRequest.receiveResponse();

                                    tester.channelsSearchingResponse().
                                        addChannel().
                                        unavailable().
                                        expectToBeSent();
                                });
                            });
                            describe(
                                'В канале нет чатов. Получен запрос открытия чата с номером по которому производился ' +
                                'поиск.',
                            function() {
                                let newChatListRequest,
                                    activeChatListRequest,
                                    closedChatListRequest,
                                    otherChatListRequest;

                                beforeEach(function() {
                                    searchResultsRequest.receiveResponse();
                                    chatChannelSearchRequest.noChat().receiveResponse();

                                    tester.channelsSearchingResponse().
                                        addChannel().
                                        expectToBeSent();

                                    tester.chatOpeningRequest().receive();

                                    newChatListRequest = tester.chatListRequest().
                                        forCurrentEmployee().
                                        noData().
                                        expectToBeSent();

                                    activeChatListRequest = tester.chatListRequest().
                                        active().
                                        forCurrentEmployee().
                                        secondPage().
                                        expectToBeSent();

                                    closedChatListRequest = tester.chatListRequest().
                                        closed().
                                        noData().
                                        forCurrentEmployee().
                                        expectToBeSent();

                                    otherChatListRequest = tester.chatListRequest().
                                        active().
                                        noData().
                                        forCurrentEmployee().
                                        isOtherEmployeesAppeals().
                                        expectToBeSent();
                                });

                                describe('Получен список чатов.', function() {
                                    beforeEach(function() {
                                        newChatListRequest.receiveResponse();
                                        activeChatListRequest.receiveResponse();
                                        closedChatListRequest.receiveResponse();
                                        otherChatListRequest.receiveResponse();

                                        tester.chatStartingRequest().
                                            anotherPhone().
                                            receiveResponse();

                                        tester.chatListRequest().
                                            thirdChat().
                                            receiveResponse();
            
                                        tester.submoduleInitilizationEvent().
                                            contacts().
                                            expectToBeSent();

                                        tester.visitorCardRequest().receiveResponse();
                                        tester.scheduledMessagesRequest().receiveResponse();
                                        tester.chatInfoRequest().receiveResponse();

                                        tester.usersRequest().
                                            forContacts().
                                            forIframe().
                                            receiveResponse();

                                        tester.contactGroupsRequest().
                                            forIframe().
                                            receiveResponse();

                                        tester.contactGroupsRequest().
                                            forIframe().
                                            receiveResponse();

                                        tester.usersRequest().
                                            forContacts().
                                            forIframe().
                                            receiveResponse();
                                    });

                                    it('Получен запрос отображения списка чатов. Список чатов отображён.', function() {
                                        tester.chatListOpeningRequest().receive();

                                        tester.chatList.
                                            first.
                                            item('Помакова Бисерка').
                                            expectToBeVisible();
                                    });
                                    it('Чат начат.', function() {
                                        tester.chatList.first.expectNotToExist();
                                        tester.spin.expectNotToExist();

                                        tester.contactBar.expectTextContentToHaveSubstring(
                                            'ФИО ' +
                                            'Помакова Бисерка Драгановна'
                                        );
                                    });
                                });
                                it('Плейсхолдер не отображается.', function() {
                                    tester.spin.expectToBeVisible();
                                    tester.body.expectToHaveTextContent('');
                                });
                            });
                        });
                        describe('Приходит новое сообщение.', function() {
                            let notificationShowingRequest;

                            beforeEach(function() {
                                tester.newMessage().receive();

                                tester.chatListRequest().
                                    chat().
                                    receiveResponse();

                                tester.countersRequest().
                                    noNewChats().
                                    noClosedChats().
                                    receiveResponse();

                                notificationShowingRequest = tester.notificationShowingRequest().expectToBeSent();
                            });

                            it('Нажимаю на уведомление. Открыт чат.', function() {
                                notificationShowingRequest.
                                    click().
                                    receive();

                                tester.visitorCardRequest().receiveResponse();

                                tester.scheduledMessagesRequest().
                                    anotherChat().
                                    receiveResponse();

                                tester.messageListRequest().receiveResponse();

                                tester.chatInfoRequest().
                                    anotherChat().
                                    receiveResponse();

                                tester.usersRequest().
                                    forContacts().
                                    forIframe().
                                    receiveResponse();

                                tester.contactGroupsRequest().
                                    forIframe().
                                    receiveResponse();

                                tester.contactGroupsRequest().
                                    forIframe().
                                    receiveResponse();

                                tester.usersRequest().
                                    forContacts().
                                    forIframe().
                                    receiveResponse();

                                tester.submoduleInitilizationEvent().
                                    contacts().
                                    expectToBeSent();

                                tester.contactBar.expectTextContentToHaveSubstring(
                                    'ФИО ' +
                                    'Помакова Бисерка Драгановна'
                                );
                            });
                            it('Ничего не происходит.', function() {
                                postMessages.nextMessage().expectNotToExist();
                            });
                        });
                        describe('Выбираю чат.', function() {
                            beforeEach(function() {
                                tester.chatList.
                                    first.
                                    item('Привет').
                                    click();

                                tester.submoduleInitilizationEvent().
                                    contacts().
                                    expectToBeSent();

                                tester.visitorCardRequest().receiveResponse();

                                tester.scheduledMessagesRequest().
                                    anotherChat().
                                    receiveResponse();

                                tester.messageListRequest().receiveResponse();

                                tester.chatInfoRequest().
                                    anotherChat().
                                    receiveResponse();

                                tester.usersRequest().
                                    forContacts().
                                    forIframe().
                                    receiveResponse();

                                tester.contactGroupsRequest().
                                    forIframe().
                                    receiveResponse();

                                tester.contactGroupsRequest().
                                    forIframe().
                                    receiveResponse();

                                tester.usersRequest().
                                    forContacts().
                                    forIframe().
                                    receiveResponse();

                                tester.changeMessageStatusRequest().
                                    read().
                                    anotherMessage().
                                    receiveResponse();

                                tester.countersRequest().
                                    noNewChats().
                                    noClosedChats().
                                    receiveResponse();
                            });

                            it('Нажимаю на кнопку закрытия окна. Отпрвален запрос закрытия окна.', function() {
                                tester.chatHistory.
                                    header.
                                    closeButton.
                                    click();

                                tester.chatsHidingRequest().expectToBeSent();;
                            });
                            it('Чат открыт.', function() {
                                tester.contactBar.expectTextContentToHaveSubstring(
                                    'ФИО ' +
                                    'Помакова Бисерка Драгановна'
                                );
                            });
                        });
                        it(
                            'Приложение открыто в другом браузере. Отображено сообщение о том, что приложение ' +
                            'открыто в другом браузере.',
                        function() {
                            tester.chatsWebSocket.disconnect(4429);
                            tester.body.expectToHaveTextContent('Приложение открыто в другом браузере');
                        });
                        it('Нажимаю на кнопку закрытия окна. Отпрвален запрос закрытия окна.', function() {
                            tester.closeButton.click();
                            tester.chatsHidingRequest().expectToBeSent();
                        });
                        it('Отображен список чатов.', function() {
                            tester.chatList.
                                first.
                                item('Привет').
                                expectToBeVisible();

                            tester.spin.expectNotToExist();
                            tester.body.expectTextContentNotToHaveSubstring('Недостаточно прав на раздел чатов');

                            tester.body.expectTextContentToHaveSubstring(
                                'Выберите чат слева для отображения переписки'
                            );

                            unfilteredPostMessages.nextMessage().expectMessageToStartsWith('ignore:log:Time consumed');
                        });
                    });
                    it('Найден контакт.', function() {
                        chatListRequest.
                            contactExists().
                            receiveResponse();

                        tester.chatList.
                            first.
                            item('Привет').
                            click();

                        tester.submoduleInitilizationEvent().
                            contacts().
                            expectToBeSent();

                        tester.visitorCardRequest().receiveResponse();

                        tester.scheduledMessagesRequest().
                            anotherChat().
                            receiveResponse();

                        tester.messageListRequest().receiveResponse();

                        tester.chatInfoRequest().
                            anotherChat().
                            receiveResponse();

                        tester.usersRequest().
                            forContacts().
                            forIframe().
                            receiveResponse();

                        tester.contactRequest().receiveResponse();

                        tester.changeMessageStatusRequest().
                            read().
                            anotherMessage().
                            receiveResponse();

                        tester.countersRequest().
                            noNewChats().
                            noClosedChats().
                            receiveResponse();

                        tester.groupsContainingContactRequest().
                            forIframe().
                            receiveResponse();

                        tester.contactGroupsRequest().
                            forIframe().
                            receiveResponse();

                        tester.anchor('Бележкова Грета Ервиновна').expectNotToExist();
                        tester.anchor('79162729533').expectNotToExist();
                    });
                });
                it('Чаты недоступны. Чаты скрыты.', function() {
                    accountRequest.
                        softphoneFeatureFlagDisabled().
                        receiveResponse();

                    secondAccountRequest.
                        softphoneFeatureFlagDisabled().
                        receiveResponse();

                    tester.chatsWebSocket.connect();

                    tester.chatsInitMessage().
                        oauthToken().
                        expectToBeSent();

                    tester.employeeSettingsRequest().receiveResponse();

                    tester.employeeRequest().
                        oauthToken().
                        receiveResponse();

                    tester.body.expectToHaveTextContent('Недостаточно прав на раздел чатов');
                });
            });
            describe('Получен запрос поиска каналов.', function() {
                beforeEach(function() {
                    tester.channelsSearchingRequest().receive();
                });

                it('Получен российский токен. Совершён поиск каналов. Отправлен результат поиска.', function() {
                    widgetSettings.receive();

                    accountRequest = tester.accountRequest().
                        forIframe().
                        webAccountLoginUnavailable().
                        softphoneFeatureFlagDisabled().
                        expectToBeSent();

                    secondAccountRequest = tester.accountRequest().
                        forIframe().
                        fromIframe().
                        webAccountLoginUnavailable().
                        softphoneFeatureFlagDisabled().
                        expectToBeSent();

                    tester.chatSettingsRequest().receiveResponse();
                    tester.chatChannelListRequest().receiveResponse();

                    tester.employeeStatusesRequest().
                        oauthToken().
                        receiveResponse();

                    tester.listRequest().receiveResponse();
                    tester.siteListRequest().receiveResponse();
                    tester.messageTemplateListRequest().receiveResponse();
                    tester.commonMessageTemplatesRequest().receiveResponse();
                    tester.messageTemplatesSettingsRequest().receiveResponse();

                    accountRequest.
                        operatorWorkplaceAvailable().
                        receiveResponse();

                    tester.employeesBroadcastChannel().
                        applyLeader().
                        expectToBeSent().
                        waitForSecond();

                    tester.employeesBroadcastChannel().
                        applyLeader().
                        expectToBeSent().
                        waitForSecond();

                    tester.employeesBroadcastChannel().
                        tellIsLeader().
                        expectToBeSent();

                    tester.employeesWebSocket.connect();

                    tester.employeesInitMessage().
                        oauthToken().
                        expectToBeSent();

                    secondAccountRequest.
                        operatorWorkplaceAvailable().
                        receiveResponse();

                    tester.chatsWebSocket.connect();

                    tester.chatsInitMessage().
                        oauthToken().
                        expectToBeSent();

                    tester.searchResultsRequest().
                        anotherToken().
                        fourthSearchString().
                        newVisitor().
                        telegramPrivate().
                        receiveResponse();

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

                    tester.searchResultsRequest().
                        anotherToken().
                        emptySearchString().
                        receiveResponse();

                    tester.chatChannelSearchRequest().
                        thirdSearchString().
                        telegramPrivate().
                        addTelegramPrivate().
                        noChat().
                        receiveResponse();

                    tester.channelsSearchingResponse().
                        addChannel().
                        expectToBeSent();

                    tester.countersRequest().
                        noNewChats().
                        noClosedChats().
                        receiveResponse();

                    tester.unreadMessagesCountSettingRequest().
                        value(75).
                        expectToBeSent();

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

                    tester.chatChannelSearchRequest().
                        emptySearchString().
                        addWaba().
                        addThirdTelegramPrivate().
                        receiveResponse();
                });
                it('Ничего не происходит.', function() {
                    postMessages.nextMessage().expectNotToExist();
                    ajax.expectNoRequestsToBeSent();
                });
            });
            it('Получен дубайский токен. Запрос аккаунта отправлен на дубайский сервер.', function() {
                widgetSettings.
                    anotherToken().
                    receive();

                tester.accountRequest().
                    forIframe().
                    dubai().
                    webAccountLoginUnavailable().
                    softphoneFeatureFlagDisabled().
                    expectToBeSent();

                tester.accountRequest().
                    forIframe().
                    fromIframe().
                    dubai().
                    webAccountLoginUnavailable().
                    softphoneFeatureFlagDisabled().
                    expectToBeSent();

                tester.chatSettingsRequest().expectToBeSent();
                tester.chatChannelListRequest().expectToBeSent();

                tester.employeeStatusesRequest().
                    anotherOauthToken().
                    expectToBeSent();

                tester.listRequest().expectToBeSent();
                tester.siteListRequest().expectToBeSent();
                tester.messageTemplateListRequest().expectToBeSent();
                tester.commonMessageTemplatesRequest().expectToBeSent();
                tester.messageTemplatesSettingsRequest().expectToBeSent();
            });
        });
        describe('Открываю страницу с расширением. Есть номера чатов.', function() {
            beforeEach(function() {
                tester = new Tester({
                    softphoneHost: 'my.uiscom.ru',
                    chatsPhoneNumbers: true,
                    ...options,
                });

                notificationTester.
                    grantPermission().
                    recentNotification();

                tester.installmentSettingsProbableUpdatingRequest().receiveResponse();

                tester.popupStateSettingRequest().
                    disabled().
                    receiveResponse();

                tester.chatsVisibilitySettingRequest().
                    disabled().
                    receiveResponse();

                tester.widgetSettings().
                    storageData().
                    receive();

                tester.notificationSettingRequest().
                    success().
                    expectToBeSent();

                tester.missedEventsCountSettingRequest().receiveResponse();
                tester.popupStateSettingRequest().receiveResponse();
                tester.chatsVisibilitySettingRequest().receiveResponse();

                tester.stateSettingRequest().
                    userDataFetched().
                    receive();

                tester.popupStateSettingRequest().
                    userDataFetched().
                    receiveResponse();

                tester.widgetSettings().
                    windowMessage().
                    expectToBeSent();

                tester.submoduleInitilizationEvent().
                    operatorWorkplace().
                    receive();

                tester.submoduleInitilizationEvent().receive();
                tester.unreadMessagesCountSettingRequest().receive();

                tester.channelsSearchingRequest().expectToBeSent();

                tester.channelsSearchingRequest().
                    anotherPhone().
                    expectToBeSent();

                tester.widgetSettings().
                    windowMessage().
                    chatsSettings().
                    expectToBeSent();
            });

            describe('Получен список каналов. Для всех номеров есть доступные каналы.', function() {
                beforeEach(function() {
                    tester.channelsSearchingResponse().
                        addChannel().
                        addThirdChannel().
                        unavailable().
                        receive();

                    tester.channelsSearchingResponse().
                        anotherChannel().
                        receive();
                });

                describe('Содержимое страницы изменилось.', function() {
                    beforeEach(function() {
                        tester.page.duplicate();

                        spendTime(1000);
                        spendTime(0);

                        tester.channelsSearchingRequest().
                            thirdPhone().
                            expectToBeSent();

                        tester.channelsSearchingRequest().
                            fourthPhone().
                            expectToBeSent();
                    });

                    describe('Получен список каналов.', function() {
                        beforeEach(function() {
                            tester.channelsSearchingResponse().
                                thirdChannel().
                                receive();

                            tester.channelsSearchingResponse().
                                fourthChannel().
                                receive();
                        });

                        it('Повторно получен список каналов. Список каналов не был обновлён.', function() {
                            tester.channelsSearchingResponse().
                                addChannel().
                                receive();

                            tester.channelsSearchingResponse().
                                anotherChannel().
                                receive();

                            tester.body.expectToHaveTextContent(
                                'Первый элемент #1 ' +
                                'Трубочка ' +

                                'Некий элемент #1 ' +
                                'Последний элемент #1 ' +

                                'Чаты ' +
                                'Ещё один элемент #1 ' +

                                'Телефон: 74951234568 ' +
                                'Телефон: 74951234570 ' +
                                'Номер телефона: +74951234572 (74951234571) ' +
                                'Номер телефона: +74951234574 (74951234573) ' +
                                '[+7 (495) 123-45-64] ' +
                                '[+7 (495) 123-45-63] ' +

                                'Каналы связанные с телефоном 74951234575: ' +

                                    'Канал "Белгород" ' +
                                    'Канал "Астана" ' +

                                'Каналы связанные с телефоном 74951234576: ' +

                                    'Канал "Ереван" ' +

                                'Первый элемент #2 ' +
                                'Трубочка ' +

                                'Некий элемент #2 ' +
                                'Последний элемент #2 ' +

                                'Чаты ' +
                                'Ещё один элемент #2 ' +

                                'Телефон: 74951234577 ' +
                                'Телефон: 74951234579 ' +
                                'Номер телефона: +74951234581 (74951234580) ' +
                                'Номер телефона: +74951234583 (74951234582) ' +
                                '[+7 (495) 123-45-64] ' +
                                '[+7 (495) 123-45-63] ' +

                                'Каналы связанные с телефоном 74951234584: ' +

                                    'Канал "Тбилиси" ' +

                                'Каналы связанные с телефоном 74951234585: ' +

                                    'Канал "Белград"'
                            );
                        });
                        it('Отображены каналы.', function() {
                            tester.body.expectToHaveTextContent(
                                'Первый элемент #1 ' +
                                'Трубочка ' +

                                'Некий элемент #1 ' +
                                'Последний элемент #1 ' +

                                'Чаты ' +
                                'Ещё один элемент #1 ' +

                                'Телефон: 74951234568 ' +
                                'Телефон: 74951234570 ' +
                                'Номер телефона: +74951234572 (74951234571) ' +
                                'Номер телефона: +74951234574 (74951234573) ' +
                                '[+7 (495) 123-45-64] ' +
                                '[+7 (495) 123-45-63] ' +

                                'Каналы связанные с телефоном 74951234575: ' +

                                    'Канал "Белгород" ' +
                                    'Канал "Астана" ' +

                                'Каналы связанные с телефоном 74951234576: ' +

                                    'Канал "Ереван" ' +

                                'Первый элемент #2 ' +
                                'Трубочка ' +

                                'Некий элемент #2 ' +
                                'Последний элемент #2 ' +

                                'Чаты ' +
                                'Ещё один элемент #2 ' +

                                'Телефон: 74951234577 ' +
                                'Телефон: 74951234579 ' +
                                'Номер телефона: +74951234581 (74951234580) ' +
                                'Номер телефона: +74951234583 (74951234582) ' +
                                '[+7 (495) 123-45-64] ' +
                                '[+7 (495) 123-45-63] ' +

                                'Каналы связанные с телефоном 74951234584: ' +

                                    'Канал "Тбилиси" ' +

                                'Каналы связанные с телефоном 74951234585: ' +

                                    'Канал "Белград"'
                            );
                        });
                    });
                    it('Раннее полученные каналы не были скрыты.', function() {
                        tester.body.expectToHaveTextContent(
                            'Первый элемент #1 ' +
                            'Трубочка ' +

                            'Некий элемент #1 ' +
                            'Последний элемент #1 ' +

                            'Чаты ' +
                            'Ещё один элемент #1 ' +

                            'Телефон: 74951234568 ' +
                            'Телефон: 74951234570 ' +
                            'Номер телефона: +74951234572 (74951234571) ' +
                            'Номер телефона: +74951234574 (74951234573) ' +
                            '[+7 (495) 123-45-64] ' +
                            '[+7 (495) 123-45-63] ' +

                            'Каналы связанные с телефоном 74951234575: ' +

                                'Канал "Белгород" ' +
                                'Канал "Астана" ' +

                            'Каналы связанные с телефоном 74951234576: ' +

                                'Канал "Ереван" ' +

                            'Первый элемент #2 ' +
                            'Трубочка ' +

                            'Некий элемент #2 ' +
                            'Последний элемент #2 ' +

                            'Чаты ' +
                            'Ещё один элемент #2 ' +

                            'Телефон: 74951234577 ' +
                            'Телефон: 74951234579 ' +
                            'Номер телефона: +74951234581 (74951234580) ' +
                            'Номер телефона: +74951234583 (74951234582) ' +
                            '[+7 (495) 123-45-64] ' +
                            '[+7 (495) 123-45-63] ' +

                            'Каналы связанные с телефоном 74951234584: ' +
                            'Каналы связанные с телефоном 74951234585:'
                        );
                    });
                });
                it('Нажимаю на кнопку "Чаты". Отображен IFrame чатов.', function() {
                    tester.button('Чаты').click();
                    tester.chatListOpeningRequest().expectToBeSent();

                    tester.chatsVisibilitySettingRequest().
                        visible().
                        receiveResponse();

                    tester.iframe.atIndex(1).expectToBeHidden();

                    tester.iframe.first.
                        expectToBeVisible().
                        expectAttributeToHaveValue(
                            'src',
                            'https://prod-msk-softphone-widget-iframe.uiscom.ru/chrome/chats',
                        );
                });
                it(
                    'Получено сообщение о количестве пропущенных сообщений. Отображено количество пропущенных ' +
                    'сообщений.',
                function() {
                    tester.unreadMessagesCountSettingRequest().
                        value(75).
                        receive();

                    tester.missedEventsCountSettingRequest().
                        value(75).
                        expectToBeSent();

                    tester.button('Чаты (75)').expectToBeVisible();
                });
                it('Нажимаю на кнопку канала. Отправлен запрос открытия чата.', function() {
                    tester.channelButton.first.click();
                    tester.installmentSettingsProbableUpdatingRequest().receiveResponse();

                    tester.chatOpeningRequest().
                        thirdChannel().
                        expectToBeSent();

                    tester.chatsVisibilitySettingRequest().
                        visible().
                        receiveResponse();
                });
                it('Отображён непустой список каналов.', function() {
                    tester.body.expectTextContentToHaveSubstring(
                        'Каналы связанные с телефоном 74951234575: ' +

                            'Канал "Белгород" ' +
                            'Канал "Астана" ' +

                        'Каналы связанные с телефоном 74951234576: ' +

                            'Канал "Ереван"'
                    );
                });
            });
            it(
                'Получен список каналов. Не для всех номеров есть доступные каналы. Отображены каналы тех номеров, ' +
                'где каналы есть.',
            function() {
                tester.channelsSearchingResponse().
                    unavailable().
                    receive();

                tester.channelsSearchingResponse().
                    anotherChannel().
                    receive();

                tester.body.expectTextContentToHaveSubstring(
                    'Каналы связанные с телефоном 74951234575: ' +
                    'Каналы связанные с телефоном 74951234576: ' +

                        'Канал "Ереван"'
                );
            });
            it('Отображён пустой список каналов.', function() {
                tester.body.expectTextContentToHaveSubstring(
                    'Каналы связанные с телефоном 74951234575: ' +
                    'Каналы связанные с телефоном 74951234576:'
                );
            });
        });
        describe('Контент скрипт встроился в IFrame.', function() {
            beforeEach(function() {
                tester = new Tester({
                    softphoneHost: 'my.uiscom.ru',
                    isIframe: true,
                    ...options,
                });

                tester.installmentSettingsProbableUpdatingRequest().receiveResponse();
            });

            describe(
                'Сотрудник авторизован. Запрос регистрации вложенного контент-скрипта был отправлен.',
            function() {
                let nestedContentScriptRegistrationRequest;

                beforeEach(function() {
                    tester.widgetSettings().
                        storageData().
                        receive();

                    nestedContentScriptRegistrationRequest = tester.nestedContentScriptRegistrationRequest().
                        expectToBeSent();
                });

                it(
                    'IFrame софтфона был инициализирован. Прошло некоторое время. Запрос регистрации вложенного ' +
                    'контент-скрипта не был отправлен повторно. ',
                function() {
                    nestedContentScriptRegistrationRequest.receiveResponse();
                    spendTime(1000);
                });
                it(
                    'Прошло некоторое время. Запрос регистрации вложенного контент-скрипта был отправлен повторно. ',
                function() {
                    spendTime(1000);
                    tester.nestedContentScriptRegistrationRequest().expectToBeSent();
                });
            });
            describe(
                'Получен запрос регистрации вложенного контент-скрипта. Запрос регистрации вложенного ' +
                'контент-скрипта был отправлен.',
            function() {
                let nestedContentScriptRegistrationRequest;

                beforeEach(function() {
                    tester.nestedContentScriptRegistrationRequest().receive();

                    nestedContentScriptRegistrationRequest = tester.nestedContentScriptRegistrationRequest().
                        expectToBeSent();
                });

                it(
                    'Получено подтверждение регистрации вложенного контент-скрипта. Отправлено подтверждение ' +
                    'регистрации вложенного контент-скрипта',
                function() {
                    nestedContentScriptRegistrationRequest.receiveResponse();
                    nestedContentScriptRegistrationRequest.expectResponseToBeSent();
                });
                it('Ничего не происходит.', function() {
                    postMessages.nextMessage().expectNotToExist();
                });
            });
            it('Запрос регистрации вложенного контент-скрипта не был отправлен.', function() {
                postMessages.nextMessage().expectNotToExist();
            });
        });
        describe('Контент-скрипт встроился в IFrame. Есть номера чатов.', function() {
            let widgetSettings;

            beforeEach(function() {
                tester = new Tester({
                    softphoneHost: 'my.uiscom.ru',
                    isIframe: true,
                    chatsPhoneNumbers: true,
                    ...options,
                });

                tester.installmentSettingsProbableUpdatingRequest().receiveResponse();
                widgetSettings = tester.widgetSettings().storageData();
            });

            describe('Получены настройки чатов. Отправлен запрос регистрации вложенного контент-скрипта.', function() {
                beforeEach(function() {
                    widgetSettings.receive();

                    tester.nestedContentScriptRegistrationRequest().receiveResponse();
                    tester.initializednessEvent().receive();
                });

                describe('Получен запрос регистрации вложенного контент-скрипта.', function() {
                    let nestedContentScriptRegistrationRequest,
                        anotherNestedContentScriptRegistrationRequest;

                    beforeEach(function() {
                        anotherNestedContentScriptRegistrationRequest = tester.nestedContentScriptRegistrationRequest().
                            receive();
     
                        nestedContentScriptRegistrationRequest = tester.nestedContentScriptRegistrationRequest().
                            expectToBeSent();
                    });

                    it(
                        'Было получено событие инициализации чатов. Найдены каналы. Отображён список каналов.',
                    function() {
                        tester.initializednessEvent().
                            chats().
                            receive();

                        tester.initializednessEvent().
                            chats().
                            expectToBeSent();

                        tester.channelsSearchingRequest().expectToBeSent();

                        tester.channelsSearchingRequest().
                            anotherPhone().
                            expectToBeSent();

                        tester.channelsSearchingResponse().
                            addChannel().
                            receive();

                        tester.channelsSearchingResponse().
                            addChannel().
                            expectToBeSent();

                        tester.channelsSearchingResponse().
                            anotherChannel().
                            receive();

                        tester.channelsSearchingResponse().
                            anotherChannel().
                            expectToBeSent();

                        tester.body.expectTextContentToHaveSubstring(
                            'Каналы связанные с телефоном 74951234575: ' +

                                'Канал "Нижний Новгород" ' +
                                'Канал "Белгород" ' +

                            'Каналы связанные с телефоном 74951234576: ' +

                                'Канал "Ереван"'
                        );
                    });
                    it('Ответ на запрос передан другим вложенным контент-скриптам.', function() {
                        nestedContentScriptRegistrationRequest.receiveResponse();
                        anotherNestedContentScriptRegistrationRequest.expectResponseToBeSent();
                    });
                });
                describe('Было получено событие инициализации чатов. Найдены каналы.', function() {
                    beforeEach(function() {
                        tester.initializednessEvent().
                            chats().
                            receive();

                        tester.channelsSearchingRequest().expectToBeSent();

                        tester.channelsSearchingRequest().
                            anotherPhone().
                            expectToBeSent();

                        tester.channelsSearchingResponse().
                            addChannel().
                            receive();

                        tester.channelsSearchingResponse().
                            anotherChannel().
                            receive();
                    });

                    it('Нажимаю на кнопку канала. Отправлен запрос открытия чата.', function() {
                        tester.channelButton.first.click();

                        tester.installmentSettingsProbableUpdatingRequest().receiveResponse();
                        tester.chatOpeningRequest().expectToBeSent();
                    });
                    it('Отображён список каналов.', function() {
                        tester.body.expectTextContentToHaveSubstring(
                            'Каналы связанные с телефоном 74951234575: ' +

                                'Канал "Нижний Новгород" ' +
                                'Канал "Белгород" ' +

                            'Каналы связанные с телефоном 74951234576: ' +

                                'Канал "Ереван"'
                        );
                    });
                });
                it('Получен запрос поиска каналов. Отправлен запрос поиска каналов.', function() {
                    tester.channelsSearchingRequest().receive();
                    tester.channelsSearchingRequest().expectToBeSent();
                });
                it('Получен запрос открытия чата. Отправлен запрос открытия чата.', function() {
                    tester.chatOpeningRequest().receive();
                    tester.chatOpeningRequest().expectToBeSent();
                });
                it('Кнопки чатов не были добавлены.', function() {
                    tester.body.expectToHaveTextContent(
                        'Первый элемент #1 ' +
                        'Некий элемент #1 ' +
                        'Последний элемент #1 ' +
                        'Ещё один элемент #1 ' +

                        'Телефон: 74951234568 ' +
                        'Телефон: 74951234570 ' +
                        'Номер телефона: +74951234572 (74951234571) ' +
                        'Номер телефона: +74951234574 (74951234573) ' +
                        '[+7 (495) 123-45-64] ' +
                        '[+7 (495) 123-45-63] ' +
                        '74951234575 ' +
                        '74951234576'
                    );
                });
            });
            it(
                'Настройки чатов не получены. Было получено событие инициализации чатов. Кнопки чатов не были ' +
                'добавлены.',
            function() {
                widgetSettings.
                    anotherChatsWildcart().
                    receive();

                tester.nestedContentScriptRegistrationRequest().receiveResponse();
                tester.initializednessEvent().receive();

                tester.initializednessEvent().
                    chats().
                    receive();

                tester.body.expectToHaveTextContent(
                    'Первый элемент #1 ' +
                    'Некий элемент #1 ' +
                    'Последний элемент #1 ' +
                    'Ещё один элемент #1 ' +

                    'Телефон: 74951234568 ' +
                    'Телефон: 74951234570 ' +
                    'Номер телефона: +74951234572 (74951234571) ' +
                    'Номер телефона: +74951234574 (74951234573) ' +
                    '[+7 (495) 123-45-64] ' +
                    '[+7 (495) 123-45-63] ' +
                    '74951234575 ' +
                    '74951234576'
                );
            });
        });
        describe('Открываю уведомления.', function() {
            beforeEach(function() {
                tester = new Tester({
                    application: 'notificationsIframe',
                    isIframe: true,
                    ...options,
                });

                tester.notificationInitializednessEvent().expectToBeSent();
            });
            
            describe('Получена мнемоника ошибки.', function() {
                beforeEach(function() {
                    tester.notificationSettingRequest().receive();
                });

                it('Закрываю уведомление. Отправлен запрос скрытия уведомления.', function() {
                    tester.notificationWindow.closeButton.click();
                    tester.notificationsClosingRequest().expectToBeSent();
                });
                it('Отображено уведомление.', function() {
                    tester.body.expectToHaveTextContent('Не удалось авторизоваться');
                });
            });
            it('Получено сообщение об успешной авторизации. Отображено сообщение об успешной авторизации.', function() {
                tester.notificationSettingRequest().
                    success().
                    receive();

                tester.body.expectToHaveTextContent('Успешно авторизован');
            });
        });
        describe(
            'Открываю страницу с расширением. Токен авторизации был сохранен. В IFrame отправлен токен.',
        function() {
            beforeEach(function() {
                tester = new Tester({
                    softphoneHost: 'my.uiscom.ru',
                    isAuthorized: true,
                    ...options,
                });

                notificationTester.
                    grantPermission().
                    recentNotification();

                tester.installmentSettingsProbableUpdatingRequest().receiveResponse();

                tester.popupStateSettingRequest().
                    disabled().
                    receiveResponse();

                tester.chatsVisibilitySettingRequest().
                    disabled().
                    receiveResponse();

                tester.missedEventsCountSettingRequest().receiveResponse();
                tester.popupStateSettingRequest().receiveResponse();
                tester.chatsVisibilitySettingRequest().receiveResponse();

                tester.stateSettingRequest().receive();

                tester.widgetSettings().
                    windowMessage().
                    expectToBeSent();

                tester.submoduleInitilizationEvent().
                    operatorWorkplace().
                    receive();

                tester.submoduleInitilizationEvent().receive();
                tester.unreadMessagesCountSettingRequest().receive();

                tester.widgetSettings().
                    windowMessage().
                    chatsSettings().
                    expectToBeSent();
            });

            it(
                'Произведён выход из аккаунта. Произведён вход в аккаунт. Отобржено уведомление об успешной ' +
                'автоирзации.',
            function() {
                tester.widgetSettings().
                    storageData().
                    noData().
                    receive();

                tester.widgetSettings().
                    windowMessage().
                    emptyToken().
                    expectToBeSent();

                tester.widgetSettings().
                    windowMessage().
                    chatsSettings().
                    emptyToken().
                    expectToBeSent();

                tester.popupStateSettingRequest().
                    disabled().
                    receiveResponse();

                tester.chatsVisibilitySettingRequest().
                    disabled().
                    receiveResponse();

                tester.widgetSettings().
                    storageData().
                    receive();

                tester.popupStateSettingRequest().receiveResponse();
                tester.chatsVisibilitySettingRequest().receiveResponse();

                tester.notificationSettingRequest().
                    success().
                    expectToBeSent();

                tester.widgetSettings().
                    windowMessage().
                    expectToBeSent();

                tester.widgetSettings().
                    windowMessage().
                    chatsSettings().
                    expectToBeSent();
            });
            it('Уведомление об успешной автоирзации не отобржено.', function() {
                postMessages.nextMessage().expectNotToExist();
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
            tester.softphoneVisibilityToggleRequest().receive();
            
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
                chatsSettings().
                request().
                receiveResponse();

            tester.widgetSettings().
                storageData().
                expectToBeSaved();
        });
        it('Ранее был открыт дубайский IFrame. Дубайский IFrame снова открыт.', function() {
            window.localStorage.setItem('data_center', 'dubai'),

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
            tester.iframe.expectToBeVisible();

            tester.iframe.expectAttributeToHaveValue(
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
        it('Ранее софтфон был отображён. Открываю страницу с расширением.', function() {
            window.localStorage.setItem('softphone-visibility', 'true');

            tester = new Tester({
                softphoneHost: 'my.uiscom.ru',
                isAuthorized: true,
                ...options,
            });

            notificationTester.
                grantPermission().
                recentNotification();

            tester.installmentSettingsProbableUpdatingRequest().receiveResponse();
            tester.popupStateSettingRequest().receiveResponse();

            tester.chatsVisibilitySettingRequest().
                disabled().
                receiveResponse();

            tester.missedEventsCountSettingRequest().receiveResponse();
            tester.chatsVisibilitySettingRequest().receiveResponse();
            tester.stateSettingRequest().receive();

            tester.widgetSettings().
                windowMessage().
                expectToBeSent();

            tester.submoduleInitilizationEvent().
                operatorWorkplace().
                receive();

            tester.submoduleInitilizationEvent().receive();
            tester.unreadMessagesCountSettingRequest().receive();

            tester.softphoneVisibilityToggleRequest().expectToBeSent();

            tester.widgetSettings().
                windowMessage().
                chatsSettings().
                expectToBeSent();
        });
        it('Открываю страницу с расширением в amoCRM. Добавлены кнопки каналов.', function() {
            tester = new Tester({
                softphoneHost: 'my.uiscom.ru',
                isAuthorized: true,
                renderAmocrmLead: true,
                ...options,
            });

            notificationTester.
                grantPermission().
                recentNotification();

            tester.installmentSettingsProbableUpdatingRequest().receiveResponse();

            tester.popupStateSettingRequest().
                disabled().
                receiveResponse();

            tester.chatsVisibilitySettingRequest().
                disabled().
                receiveResponse();

            tester.missedEventsCountSettingRequest().receiveResponse();
            tester.popupStateSettingRequest().receiveResponse();
            tester.chatsVisibilitySettingRequest().receiveResponse();

            tester.stateSettingRequest().receive();

            tester.widgetSettings().
                windowMessage().
                expectToBeSent();

            tester.submoduleInitilizationEvent().
                operatorWorkplace().
                receive();

            tester.submoduleInitilizationEvent().receive();
            tester.unreadMessagesCountSettingRequest().receive();

            tester.channelsSearchingRequest().expectToBeSent();

            tester.channelsSearchingRequest().
                anotherPhone().
                expectToBeSent();

            tester.channelsSearchingRequest().
                email().
                expectToBeSent();

            tester.widgetSettings().
                windowMessage().
                chatsSettings().
                amocrmExtension().
                expectToBeSent();

            tester.channelsSearchingResponse().
                addChannel().
                addThirdChannel().
                receive();

            tester.channelsSearchingResponse().
                email().
                receive();

            tester.channelsSearchingResponse().
                anotherChannel().
                addFourthChannel().
                receive();

            tester.unreadMessagesCountSettingRequest().
                value(75).
                receive();

            tester.missedEventsCountSettingRequest().
                value(75).
                receiveResponse();

            tester.body.expectTextContentToHaveSubstringsConsideringOrder(
                'Александр Аншаков' ,

                'a.anshakov@comagic.dev Сантьяго ' +
                '74951234576 Ереван ' +
                '74951234576 Буэнос‑Айрес ' +
                '74951234575 Нижний Новгород ' +
                '74951234575 Белгород ' +
                '74951234575 Астана'
            );
        });
    });
});
