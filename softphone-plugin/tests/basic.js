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

        xdescribe('Открыт IFrame.', function() {
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

                        unfilteredPostMessages.
                            nextMessage().
                            expectMessageToStartsWith('ignore:log:').
                            expectMessageToContain('Window message received');

                        unfilteredPostMessages.
                            nextMessage().
                            expectMessageToStartsWith('ignore:log:').
                            expectMessageToContain('Tab state is unknown');
                    });

                    describe('Вкладка является ведущей.', function() {
                        beforeEach(function() {
                            tester.masterInfoMessage().receive();

                            tester.stateSettingRequest().
                                visible().
                                leader().
                                expectToBeSent();

                            tester.slavesNotification().
                                additional().
                                visible().
                                expectToBeSent();

                            tester.slavesNotification().expectToBeSent();

                            tester.masterInfoMessage().
                                tellIsLeader().
                                expectToBeSent();
                                
                            authTokenRequest = tester.authTokenRequest().expectToBeSent()
                        });

                        describe('Получен токен авторизации.', function() {
                            let authCheckRequest;

                            beforeEach(function() {
                                postMessages.nextMessage().expectNotToExist();

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
                                                        leader().
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
                                                        'Поступил входящий звонок. Поступил еще один входящий ' +
                                                        'звонок. В родительское окно отправлено сообщение об ' +
                                                        'изменении размера софтфона.',
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
                                                            leader().
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
                                                            leader().
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
                                                    it(
                                                        'Раскрываю список статусов. Отображён список статусов.',
                                                    function() {
                                                        tester.userName.click();
                                                        
                                                        tester.statusesList.
                                                            item('Не беспокоить').
                                                            expectToBeSelected();
                                                        
                                                        tester.statusesList.
                                                            item('Нет на месте').
                                                            expectNotToBeSelected();
                                                    });
                                                    it(
                                                        'От ведомой вкладки получен запрос скачивания лога. В ' +
                                                        'ведомую вкладку отправлен запрос скачивания лога.',
                                                    function() {
                                                        tester.logDownloadingRequest().
                                                            broadcastMessage().
                                                            forLeader().
                                                            receive();

                                                        tester.logsRequest().receiveResponse();

                                                        unfilteredPostMessages.
                                                            nextMessage().
                                                            expectMessageToStartsWith('ignore:log:').
                                                            expectMessageToContain('{"method":"set_logs","data":"*"}');
                                                            
                                                        tester.logDownloadingRequest().
                                                            broadcastMessage().
                                                            forFollower().
                                                            expectToBeSent();

                                                        unfilteredPostMessages.
                                                            nextMessage().
                                                            expectMessageToStartsWith('ignore:log:').
                                                            expectMessageToContain(JSON.stringify({
                                                                type: 'notify_slaves',
                                                                data: {
                                                                    action: 'download_log',
                                                                    id: '5314f800-0f23-425d-bf20-683f0d149675',
                                                                    data: '*',
                                                                },
                                                            }));
                                                    });
                                                    it(
                                                        'Нажимаю на кнопку скачивания лога. В родительское окно ' +
                                                        'отправлен запрос скачивания лога.',
                                                    function() {
                                                        tester.bugButton.click();

                                                        tester.logDownloadingRequest().
                                                            windowMessage().
                                                            expectToBeSent();
                                                    });
                                                    it('Софтфон готов к использованию.', function() {
                                                        tester.phoneField.expectToBeVisible();
                                                    });
                                                });
                                                it(
                                                    'Доступ к микрофону запрещён. Отображено сообщение о ' +
                                                    'недоступности микрофона.',
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
                                                'пропущенных звонков. Сворачиваю окно. Звонок пропущен. В ' +
                                                'родительское окно передано сообщение о пропущенном звонке. ' +
                                                'Разворачиваю окно. В родительское окно передано сообщение об ' +
                                                'отсутствии пропущенных звонков.',
                                            function() {
                                                authenticatedUserRequest.
                                                    newCall().
                                                    receiveResponse();

                                                tester.stateSettingRequest().
                                                    visible().
                                                    leader().
                                                    lostCalls(1).
                                                    expectToBeSent();

                                                tester.stateSettingRequest().
                                                    visible().
                                                    leader().
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
                                                    leader().
                                                    expanded().
                                                    lostCalls(1).
                                                    expectToBeSent();

                                                tester.callsRequest().receiveResponse();

                                                tester.stateSettingRequest().
                                                    visible().
                                                    userDataFetched().
                                                    expanded().
                                                    leader().
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
                                                    leader().
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
                                                    leader().
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
                                            leader().
                                            expectToBeSent();

                                        tester.slavesNotification().
                                            userDataFetched().
                                            twoChannels().
                                            disabled().
                                            softphoneServerConnected().
                                            expectToBeSent();

                                        postMessages.nextMessage().expectNotToExist();

                                        postMessages.receive({
                                            method: 'start_call',
                                            data: '79161234567',
                                        });

                                        tester.click2CallRequest().receiveResponse();

                                        unfilteredPostMessages.
                                            nextMessage().
                                            expectMessageToStartsWith('ignore:log:').
                                            expectMessageToContain('Window message received');

                                        unfilteredPostMessages.
                                            nextMessage().
                                            expectMessageToStartsWith('ignore:log:').
                                            expectMessageToContain([
                                                'Time consumed 0 ms',
                                                'POST https://somedomain.com/click2call/79161234567'
                                            ].join("\n\n"));
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
                                        leader().
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
                                        leader().
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
                                    leader().
                                    destroyed().
                                    expectToBeSent();

                                unfilteredPostMessages.
                                    nextMessage().
                                    expectMessageToStartsWith('ignore:log:').
                                    expectMessageToContain('Broadcast message sent');

                                unfilteredPostMessages.
                                    nextMessage().
                                    expectMessageToStartsWith('ignore:log:').
                                    expectMessageToContain('Time consumed 0 ms');
                            });
                        });
                        it('Отображено сообщение о том, что происходит авторизация.', function() {
                            tester.body.expectToHaveTextContent(
                                'Происохдит авторизация... ' +
                                'Подождите, пожалуйста'
                            );
                        });
                    });
                    describe('Вкладка является ведомой.', function() {
                        beforeEach(function() {
                            tester.masterInfoMessage().
                                isNotMaster().
                                receive();

                            tester.stateSettingRequest().
                                visible().
                                follower().
                                expectToBeSent();

                            tester.masterNotification().
                                tabOpened().
                                expectToBeSent();

                            tester.spendTime(1000);
                            tester.spendTime(1000);
                            tester.spendTime(1000);

                            tester.masterInfoMessage().
                                applyLeader().
                                expectToBeSent();

                            tester.authTokenRequest().receiveResponse()
                            tester.authCheckRequest().receiveResponse();
                            tester.talkOptionsRequest().receiveResponse();
                            tester.statusesRequest().receiveResponse();
                            tester.permissionsRequest().receiveResponse();
                            tester.settingsRequest().receiveResponse();
                            tester.authenticatedUserRequest().receiveResponse();

                            tester.stateSettingRequest().
                                userDataFetched().
                                visible().
                                follower().
                                expectToBeSent();

                            notificationTester.grantPermission();

                            tester.slavesNotification().
                                twoChannels().
                                available().
                                receive();
                        });

                        describe(
                            'Нажимаю на кнопку скачивания лога. В ведущую вкладку отправлен запрос скачивания лога.',
                        function() {
                            beforeEach(function() {
                                tester.bugButton.click();

                                tester.logDownloadingRequest().
                                    broadcastMessage().
                                    forLeader().
                                    expectToBeSent();
                            });

                            it(
                                'Получен лог ведущей вкладки. В родительское окно отправлен запрос скачивания лога.',
                            function() {
                                tester.logDownloadingRequest().
                                    broadcastMessage().
                                    forFollower().
                                    receive();

                                tester.logDownloadingRequest().
                                    windowMessage().
                                    withMessageFromLeader().
                                    expectToBeSent();
                            });
                            it(
                                'Получен лог ведущей вкладки предназначавшийся для другой вкладки. Запрос скачивания ' +
                                'лога не был отправлен в родительское окно.',
                            function() {
                                tester.logDownloadingRequest().
                                    broadcastMessage().
                                    forFollower().
                                    anotherId().
                                    receive();
                            });
                        });
                        it(
                            'Получен запрос скачивания лога. В ведущую вкладку отправлен запрос скачивания лога.',
                        function() {
                            tester.logDownloadingRequest().
                                windowMessage().
                                receive();

                            tester.logDownloadingRequest().
                                broadcastMessage().
                                forLeader().
                                expectToBeSent();
                        });
                    });
                });
                it('Используется английский язык. Интерфейс переведён.', function() {
                    widgetSettings.
                        thirdToken().
                        receive();

                    tester.masterInfoMessage().receive();

                    tester.stateSettingRequest().
                        visible().
                        leader().
                        expectToBeSent();

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

                    tester.stateSettingRequest().
                        leader().
                        expectToBeSent();

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
                        leader().
                        destroyed().
                        expectToBeSent();
                });

                it('Получен запрос отобржаения софтфона. Софтфон видим.', function() {
                    tester.softphoneVisibilityToggleRequest().receive();

                    tester.stateSettingRequest().
                        destroyed().
                        visible().
                        leader().
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
                        leader().
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
        xdescribe('Открываю попап. Отправлен запрос состояния.', function() {
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
                it('Нажимаю на кнопку "Скачать лог". Отправлен запрос скачивания лога.', function() {
                    tester.bugButton.click();
                    tester.logDownloadingRequest().expectToBeSent();
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
        xdescribe('Открываю страницу с расширением. Токен авторизации не был сохранен.', function() {
            beforeEach(function() {
                tester = new Tester({
                    softphoneHost: 'my.uiscom.ru',
                    ...options,
                });

                notificationTester.
                    grantPermission().
                    recentNotification();

                tester.installmentSettingsProbableUpdatingRequest().receiveResponse();

                tester.popupStateSettingRequest().receiveResponse();
                tester.chatsVisibilitySettingRequest().receiveResponse();

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

                        tester.popupStateSettingRequest().
                            settingsFetched().
                            receiveResponse();

                        tester.chatsVisibilitySettingRequest().
                            settingsFetched().
                            receiveResponse();

                        tester.notificationSettingRequest().
                            success().
                            expectToBeSent();

                        tester.notificationsClosingRequest().receive();
                    });

                    describe('Вкладка является ведущей.', function() {
                        beforeEach(function() {
                            tester.stateSettingRequest().
                                userDataFetched().
                                leader().
                                receive();

                            tester.popupStateSettingRequest().
                                userDataFetched().
                                settingsFetched().
                                initialized().
                                receiveResponse();

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

                                    tester.chatsVisibilitySettingRequest().
                                        initialized().
                                        settingsFetched().
                                        receiveResponse();

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
                                        'Содержимое страницы снова изменилось. Прошло некоторое время.  Кнопка ' +
                                        'добавлена в измененное содержимое страницы.',
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
                                            initialized().
                                            settingsFetched().
                                            receiveResponse();

                                        tester.chatListOpeningRequest().expectToBeSent();
                                    });

                                    it('Приходит новое сообщение. Уведомление не было отображено.', function() {
                                        tester.notificationShowingRequest().receive();
                                    });
                                    it('Получаю запрос скрытия окна чатов. Окно скрыто.', function() {
                                        tester.chatsHidingRequest().receive();

                                        tester.chatsVisibilitySettingRequest().
                                            initialized().
                                            settingsFetched().
                                            receiveResponse();

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
                                            leader().
                                            visible().
                                            receive();

                                        tester.popupStateSettingRequest().
                                            userDataFetched().
                                            settingsFetched().
                                            initialized().
                                            visible().
                                            receiveResponse();
                                    });

                                    it('От IFrame получено сообщение о скрытии софтфона. Софтфон скрыт.', function() {
                                        tester.stateSettingRequest().
                                            userDataFetched().
                                            leader().
                                            receive();

                                        tester.popupStateSettingRequest().
                                            userDataFetched().
                                            settingsFetched().
                                            initialized().
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
                                            initialized().
                                            settingsFetched().
                                            receiveResponse();

                                        tester.iframe.
                                            withSrc(
                                                'https://prod-msk-softphone-widget-iframe.uiscom.ru/chrome/softphone'
                                            ).
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
                                it(
                                    'В дочернем IFrame  нажимаю на номер телефона. Отправлен запрос вызова.',
                                function() {
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
                                    'В дочернем IFrame нажимаю на кнопку видимости. Отправлен запрос изменения ' +
                                    'видимости.',
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
                                    'Получено сообщение о пропущенном звонке. Отображено количество пропущенных ' +
                                    'звонков.',
                                function() {
                                    tester.stateSettingRequest().
                                        userDataFetched().
                                        lostCalls(1).
                                        leader().
                                        receive();

                                    tester.missedEventsCountSettingRequest().
                                        value(1).
                                        receiveResponse();

                                    tester.visibilityButton.expectToHaveTextContent('Трубочка (1)');
                                });
                                it(
                                    'Получаю запрос изменения видимости. В IFrame отправлен запрос изменения ' +
                                    'видимости.',
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
                                        settingsFetched().
                                        initialized().
                                        receiveResponse();

                                    tester.chatsVisibilitySettingRequest().
                                        initialized().
                                        settingsFetched().
                                        receiveResponse();

                                    tester.iframe.atIndex(1).expectToBeHidden();
                                });
                                it(
                                    'Получен запрос скачивание лога из софтфона с логами с другой влкадки. Лог скачен.',
                                function() {
                                    tester.logDownloadingRequest().
                                        windowMessage().
                                        withMessageFromLeader().
                                        receive();

                                    tester.anchor.
                                        withFileName('20191219.121006.000.log.txt').
                                        expectHrefToBeBlobWithSubstring([
                                            'LEADER TAB',
                                            'Message from leader',

                                            'FOLLOWER TAB',

                                            'Wed Dec 18 2019 12:10:06 GMT+0300 (Moscow Standard Time) ' +
                                                'First message',
                                        ].join("\n\n"));

                                    tester.anchor.
                                        withFileName('20191219.121006.000.log.txt').
                                        expectHrefToBeBlobWithSubstring(
                                            'Thu Dec 19 2019 12:10:06 GMT+0300 (Moscow Standard Time) ' +
                                            'Storage data values for keys: "error"'
                                        );

                                    tester.anchor.
                                        withFileName('20191219.121006.000.log.txt').
                                        expectHrefToBeBlobWithSubstring('{"method":"download_log","data":"*"}');
                                });
                                it('Получен запрос скачивание лога из софтфона. Лог скачен.', function() {
                                    tester.logDownloadingRequest().
                                        windowMessage().
                                        receive();

                                    tester.anchor.
                                        withFileName('20191219.121006.000.log.txt').
                                        expectHrefToBeBlobWithSubstring([
                                            'Wed Dec 18 2019 12:10:06 GMT+0300 (Moscow Standard Time) ' +
                                                'First message',

                                            'Thu Dec 19 2019 12:10:06 GMT+0300 (Moscow Standard Time) ' +
                                                'Second message',
                                        ].join("\n\n"));

                                    tester.anchor.
                                        withFileName('20191219.121006.000.log.txt').
                                        expectHrefToBeBlobWithSubstring(
                                            'Thu Dec 19 2019 12:10:06 GMT+0300 (Moscow Standard Time) ' +
                                            'Storage data values for keys: "error"'
                                        );
                                });
                                it('Получен запрос лога. В родетельское окно отправлен лог.', function() {
                                    tester.logsRequest().expectResponseToBeSent();
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
                                    
                                tester.chatsVisibilitySettingRequest().
                                    settingsFetched().
                                    initialized().
                                    receiveResponse();

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
                    describe('Прошло некоторое время.', function() {
                        beforeEach(function() {
                            setNow('2019-12-19T12:10:16');
                            spendTime(10000);
                        });

                        describe('Прошло ещё какое-то время.', function() {
                            beforeEach(function() {
                                setNow('2019-12-19T12:10:26');
                                spendTime(10000);
                            });

                            it(
                                'Содержимое IFrame инициализировано. Прошло некоторое время. Время ожидания ' +
                                'инициализации IFrame не логируется.',
                            function() {
                                tester.stateSettingRequest().
                                    userDataFetched().
                                    leader().
                                    receive();

                                tester.popupStateSettingRequest().
                                    userDataFetched().
                                    settingsFetched().
                                    initialized().
                                    receiveResponse();

                                tester.widgetSettings().
                                    windowMessage().
                                    expectToBeSent();

                                tester.submoduleInitilizationEvent().
                                    operatorWorkplace().
                                    receive();

                                tester.submoduleInitilizationEvent().receive();
                                tester.unreadMessagesCountSettingRequest().receive();

                                tester.chatsVisibilitySettingRequest().
                                    initialized().
                                    settingsFetched().
                                    receiveResponse();

                                tester.widgetSettings().
                                    windowMessage().
                                    chatsSettings().
                                    expectToBeSent();


                                setNow('2019-12-19T12:10:36');
                                spendTime(10000);

                                tester.logDownloadingRequest().receive();

                                tester.anchor.
                                    withFileName('20191219.121036.000.log.txt').
                                    expectHrefToBeBlobWithoutSubstring([
                                        'Waiting for initialization of ' +
                                        'https://prod-msk-softphone-widget-iframe.uiscom.ru/chrome/chats: ' +
                                        '30000ms',
                                    ].join("\n\n"));

                            });
                            it('Логируется время ожидания инициализации IFrame.', function() {
                                tester.logDownloadingRequest().receive();

                                tester.anchor.
                                    withFileName('20191219.121026.000.log.txt').
                                    expectHrefToBeBlobWithSubstring([
                                        'Waiting for initialization of ' +
                                        'https://prod-msk-softphone-widget-iframe.uiscom.ru/chrome/chats: ' +
                                        '20000ms',
                                    ].join("\n\n"));
                            });
                        });
                        it('Логируется время ожидания инициализации IFrame.', function() {
                            tester.logDownloadingRequest().receive();

                            tester.anchor.
                                withFileName('20191219.121016.000.log.txt').
                                expectHrefToBeBlobWithSubstring([
                                    'Waiting for initialization of ' +
                                    'https://prod-msk-softphone-widget-iframe.uiscom.ru/chrome/chats: ' +
                                    '10000ms',
                                ].join("\n\n"));

                        });
                    });
                    it('Вкладка является ведомой.', function() {
                        tester.stateSettingRequest().
                            userDataFetched().
                            follower().
                            receive();

                        tester.popupStateSettingRequest().
                            userDataFetched().
                            settingsFetched().
                            initialized().
                            receiveResponse();

                        tester.widgetSettings().
                            windowMessage().
                            expectToBeSent();

                        tester.logDownloadingRequest().expectResponseToBeSent();

                        tester.logDownloadingRequest().
                            windowMessage().
                            expectToBeSent();

                        tester.anchor.
                            withFileName('20191219.121006.000.log.txt').
                            expectNotToExist();
                    });
                });
                describe('URL страницы не соответствует wildcard.', function() {
                    beforeEach(function() {
                        widgetSettings.
                            anotherSoftphoneWildcart().
                            receive();

                        tester.chatsVisibilitySettingRequest().
                            settingsFetched().
                            receiveResponse();

                        tester.notificationSettingRequest().
                            success().
                            expectToBeSent();

                        tester.submoduleInitilizationEvent().
                            operatorWorkplace().
                            receive();

                        tester.submoduleInitilizationEvent().receive();
                        tester.unreadMessagesCountSettingRequest().receive();

                        tester.chatsVisibilitySettingRequest().
                            settingsFetched().
                            initialized().
                            receiveResponse();

                        tester.widgetSettings().
                            windowMessage().
                            chatsSettings().
                            noSettings().
                            expectToBeSent();
                    });

                    describe('Получен запрос отображения софтфона.', function() {
                        beforeEach(function() {
                            tester.toggleWidgetVisibilityRequest().receive();

                            tester.popupStateSettingRequest().
                                showed().
                                receiveResponse();
                        });

                        it('Получен запрос изменения состояния софтфона.', function() {
                            tester.stateSettingRequest().receive();

                            tester.widgetSettings().
                                noSettings().
                                windowMessage().
                                expectToBeSent();

                            tester.popupStateSettingRequest().
                                showed().
                                initialized().
                                receiveResponse();

                            tester.softphoneVisibilityToggleRequest().expectToBeSent();
                        });
                        it('IFrame софтфона существует.', function() {
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
                        tester.popupStateSettingRequest().receiveResponse();

                        tester.chatsVisibilitySettingRequest().
                            settingsFetched().
                            initialized().
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

                        tester.popupStateSettingRequest().
                            settingsFetched().
                            receiveResponse();

                        tester.chatsVisibilitySettingRequest().
                            settingsFetched().
                            receiveResponse();

                        tester.notificationSettingRequest().
                            success().
                            expectToBeSent();

                        tester.stateSettingRequest().
                            leader().
                            receive();

                        tester.popupStateSettingRequest().
                            settingsFetched().
                            initialized().
                            receiveResponse();

                        tester.widgetSettings().
                            rawPhone().
                            windowMessage().
                            expectToBeSent();

                        tester.submoduleInitilizationEvent().
                            operatorWorkplace().
                            receive();

                        tester.submoduleInitilizationEvent().receive();
                        tester.unreadMessagesCountSettingRequest().receive();

                        tester.chatsVisibilitySettingRequest().
                            settingsFetched().
                            initialized().
                            receiveResponse();

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

                            tester.popupStateSettingRequest().
                                settingsFetched().
                                receiveResponse();

                            tester.chatsVisibilitySettingRequest().
                                settingsFetched().
                                receiveResponse();

                            tester.stateSettingRequest().
                                leader().
                                receive();

                            tester.popupStateSettingRequest().
                                settingsFetched().
                                initialized().
                                receiveResponse();

                            tester.widgetSettings().
                                textSelectorRegExp().
                                windowMessage().
                                expectToBeSent();

                            tester.submoduleInitilizationEvent().
                                operatorWorkplace().
                                receive();

                            tester.submoduleInitilizationEvent().receive();
                            tester.unreadMessagesCountSettingRequest().receive();

                            tester.chatsVisibilitySettingRequest().
                                settingsFetched().
                                initialized().
                                receiveResponse();

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

                            tester.stateSettingRequest().
                                leader().
                                receive();

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

                        tester.popupStateSettingRequest().
                            settingsFetched().
                            receiveResponse();

                        tester.chatsVisibilitySettingRequest().
                            settingsFetched().
                            receiveResponse();

                        tester.notificationSettingRequest().
                            success().
                            expectToBeSent();

                        tester.stateSettingRequest().
                            leader().
                            receive();

                        tester.popupStateSettingRequest().
                            settingsFetched().
                            initialized().
                            receiveResponse();

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

                        tester.chatsVisibilitySettingRequest().
                            settingsFetched().
                            initialized().
                            receiveResponse();

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

                        tester.popupStateSettingRequest().
                            settingsFetched().
                            receiveResponse();

                        tester.chatsVisibilitySettingRequest().
                            settingsFetched().
                            receiveResponse();

                        tester.stateSettingRequest().
                            leader().
                            receive();

                        tester.popupStateSettingRequest().
                            settingsFetched().
                            initialized().
                            receiveResponse();

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

                        tester.chatsVisibilitySettingRequest().receiveResponse();

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
                describe(
                    'Получены настройки размера окна чатов зависимые от элемента. Открываю окно чатов.',
                function() {
                    beforeEach(function() {
                        widgetSettings.
                            elementDependentPadding().
                            receive();

                        tester.notificationSettingRequest().
                            success().
                            expectToBeSent();

                        tester.popupStateSettingRequest().
                            settingsFetched().
                            receiveResponse();

                        tester.chatsVisibilitySettingRequest().
                            settingsFetched().
                            receiveResponse();

                        tester.stateSettingRequest().
                            leader().
                            receive();

                        tester.popupStateSettingRequest().
                            settingsFetched().
                            initialized().
                            receiveResponse();

                        tester.widgetSettings().
                            windowMessage().
                            expectToBeSent();

                        tester.submoduleInitilizationEvent().
                            operatorWorkplace().
                            receive();

                        tester.submoduleInitilizationEvent().receive();
                        tester.unreadMessagesCountSettingRequest().receive();

                        tester.chatsVisibilitySettingRequest().
                            settingsFetched().
                            initialized().
                            receiveResponse();

                        tester.widgetSettings().
                            windowMessage().
                            chatsSettings().
                            elementDependentPadding().
                            expectToBeSent();

                        tester.toggleChatsVisibilityRequest().expectResponseToBeSent();

                        tester.chatsVisibilitySettingRequest().
                            settingsFetched().
                            initialized().
                            visible().
                            receiveResponse();

                        tester.chatListOpeningRequest().expectToBeSent();
                    });

                    it('Размер элемента зменен. Размер окна чатов изменен.', function() {
                        document.querySelector('#pages-container').style.width = '270px';
                        document.querySelector('#pages-container').style.height = '250px';

                        tester.page.triggerMutation();

                        tester.iframe.first.expectToHaveTopOffset(250);
                        tester.iframe.first.expectToHaveLeftOffset(270);
                    });
                    it('Окно чатов имеет указаный в настройках размер.', function() {
                        tester.iframe.first.expectToHaveTopOffset(247);
                        tester.iframe.first.expectToHaveLeftOffset(265);
                    });
                });
                it(
                    'Получены настройки размера окна чатов зависимые от элемента в другом свойстве. Открываю окно ' +
                    'чатов. Окно чатов имеет указаный в настройках размер.',
                function() {
                    widgetSettings.
                        elementDependentPaddingInDifferentProperty().
                        receive();

                    tester.notificationSettingRequest().
                        success().
                        expectToBeSent();

                    tester.popupStateSettingRequest().
                        settingsFetched().
                        receiveResponse();

                    tester.chatsVisibilitySettingRequest().
                        settingsFetched().
                        receiveResponse();

                    tester.stateSettingRequest().
                        leader().
                        receive();

                    tester.popupStateSettingRequest().
                        settingsFetched().
                        initialized().
                        receiveResponse();

                    tester.widgetSettings().
                        windowMessage().
                        expectToBeSent();

                    tester.submoduleInitilizationEvent().
                        operatorWorkplace().
                        receive();

                    tester.submoduleInitilizationEvent().receive();
                    tester.unreadMessagesCountSettingRequest().receive();

                    tester.chatsVisibilitySettingRequest().
                        settingsFetched().
                        initialized().
                        receiveResponse();

                    tester.widgetSettings().
                        windowMessage().
                        chatsSettings().
                        elementDependentPaddingInDifferentProperty().
                        expectToBeSent();

                    tester.toggleChatsVisibilityRequest().expectResponseToBeSent();

                    tester.chatsVisibilitySettingRequest().
                        settingsFetched().
                        initialized().
                        visible().
                        receiveResponse();

                    tester.chatListOpeningRequest().expectToBeSent();

                    tester.iframe.first.expectToHaveTopOffset(247);
                    tester.iframe.first.expectToHaveLeftOffset(265);
                });
                it('Получены стили. Открываю окно чатов. Стили применены.', function() {
                    widgetSettings.
                        style().
                        receive();

                    tester.notificationSettingRequest().
                        success().
                        expectToBeSent();

                    tester.popupStateSettingRequest().
                        settingsFetched().
                        receiveResponse();

                    tester.chatsVisibilitySettingRequest().
                        settingsFetched().
                        receiveResponse();

                    tester.stateSettingRequest().
                        leader().
                        receive();

                    tester.popupStateSettingRequest().
                        settingsFetched().
                        initialized().
                        receiveResponse();

                    tester.widgetSettings().
                        windowMessage().
                        style().
                        expectToBeSent();

                    tester.submoduleInitilizationEvent().
                        operatorWorkplace().
                        receive();

                    tester.submoduleInitilizationEvent().receive();
                    tester.unreadMessagesCountSettingRequest().receive();

                    tester.chatsVisibilitySettingRequest().
                        settingsFetched().
                        initialized().
                        receiveResponse();

                    tester.widgetSettings().
                        windowMessage().
                        chatsSettings().
                        expectToBeSent();

                    tester.toggleChatsVisibilityRequest().expectResponseToBeSent();

                    tester.chatsVisibilitySettingRequest().
                        settingsFetched().
                        initialized().
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

                    tester.popupStateSettingRequest().
                        settingsFetched().
                        receiveResponse();

                    tester.chatsVisibilitySettingRequest().
                        settingsFetched().
                        receiveResponse();

                    tester.stateSettingRequest().
                        leader().
                        receive();

                    tester.popupStateSettingRequest().
                        settingsFetched().
                        initialized().
                        receiveResponse();

                    tester.widgetSettings().
                        windowMessage().
                        expectToBeSent();

                    tester.submoduleInitilizationEvent().
                        operatorWorkplace().
                        receive();

                    tester.submoduleInitilizationEvent().receive();
                    tester.unreadMessagesCountSettingRequest().receive();

                    tester.chatsVisibilitySettingRequest().
                        settingsFetched().
                        initialized().
                        receiveResponse();

                    tester.widgetSettings().
                        windowMessage().
                        chatsSettings().
                        padding().
                        expectToBeSent();

                    tester.toggleChatsVisibilityRequest().expectResponseToBeSent();

                    tester.chatsVisibilitySettingRequest().
                        settingsFetched().
                        initialized().
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

                    tester.popupStateSettingRequest().
                        settingsFetched().
                        receiveResponse();

                    tester.chatsVisibilitySettingRequest().
                        settingsFetched().
                        receiveResponse();

                    tester.stateSettingRequest().
                        userDataFetched().
                        leader().
                        receive();

                    tester.popupStateSettingRequest().
                        userDataFetched().
                        settingsFetched().
                        initialized().
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

                    tester.chatsVisibilitySettingRequest().
                        settingsFetched().
                        initialized().
                        receiveResponse();

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

                    tester.popupStateSettingRequest().
                        settingsFetched().
                        receiveResponse();

                    tester.chatsVisibilitySettingRequest().
                        settingsFetched().
                        receiveResponse();

                    tester.notificationSettingRequest().
                        success().
                        expectToBeSent();

                    tester.stateSettingRequest().
                        leader().
                        receive();

                    tester.popupStateSettingRequest().
                        settingsFetched().
                        initialized().
                        receiveResponse();

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

                    tester.popupStateSettingRequest().
                        settingsFetched().
                        receiveResponse();

                    tester.chatsVisibilitySettingRequest().
                        settingsFetched().
                        receiveResponse();

                    tester.notificationSettingRequest().
                        success().
                        expectToBeSent();

                    tester.stateSettingRequest().
                        leader().
                        receive();

                    tester.popupStateSettingRequest().
                        settingsFetched().
                        initialized().
                        receiveResponse();

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
                    'Кнопка видимости должна добавляться внутрь элемента последней. Кнопка видимости добавлена ' +
                    'внурть элемента последней.',
                function() {
                    widgetSettings.
                        insertInto().
                        receive();

                    tester.popupStateSettingRequest().
                        settingsFetched().
                        receiveResponse();

                    tester.chatsVisibilitySettingRequest().
                        settingsFetched().
                        receiveResponse();

                    tester.notificationSettingRequest().
                        success().
                        expectToBeSent();

                    tester.stateSettingRequest().
                        leader().
                        receive();

                    tester.popupStateSettingRequest().
                        settingsFetched().
                        initialized().
                        receiveResponse();

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
                    'Кнопка видимости должна добавляться внутрь элемента. Кнопка видимости добавлена внурть элемента ' +
                    'первой.',
                function() {
                    widgetSettings.
                        prependChild().
                        receive();

                    tester.popupStateSettingRequest().
                        settingsFetched().
                        receiveResponse();

                    tester.chatsVisibilitySettingRequest().
                        settingsFetched().
                        receiveResponse();

                    tester.notificationSettingRequest().
                        success().
                        expectToBeSent();

                    tester.stateSettingRequest().
                        leader().
                        receive();

                    tester.popupStateSettingRequest().
                        settingsFetched().
                        initialized().
                        receiveResponse();

                    tester.widgetSettings().
                        prependChild().
                        windowMessage().
                        expectToBeSent();

                    tester.body.expectToHaveTextContent(
                        'Трубочка ' +

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
                    'Использую XPath для поиска элемента, перед которым нужно вставить кнопку видиомсти. Кнопка ' +
                    'видимости вставлена.',
                function() {
                    widgetSettings.
                        buttonElementXpath().
                        receive();

                    tester.popupStateSettingRequest().
                        settingsFetched().
                        receiveResponse();

                    tester.chatsVisibilitySettingRequest().
                        settingsFetched().
                        receiveResponse();

                    tester.notificationSettingRequest().
                        success().
                        expectToBeSent();

                    tester.stateSettingRequest().
                        leader().
                        receive();

                    tester.popupStateSettingRequest().
                        settingsFetched().
                        initialized().
                        receiveResponse();

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

                    tester.popupStateSettingRequest().
                        settingsFetched().
                        receiveResponse();

                    tester.chatsVisibilitySettingRequest().
                        settingsFetched().
                        receiveResponse();

                    tester.notificationSettingRequest().
                        success().
                        expectToBeSent();

                    tester.stateSettingRequest().
                        leader().
                        receive();

                    tester.popupStateSettingRequest().
                        settingsFetched().
                        initialized().
                        receiveResponse();

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

                    tester.popupStateSettingRequest().
                        settingsFetched().
                        receiveResponse();

                    tester.chatsVisibilitySettingRequest().
                        settingsFetched().
                        receiveResponse();

                    tester.notificationSettingRequest().
                        success().
                        expectToBeSent();

                    tester.notificationsClosingRequest().receive();

                    tester.stateSettingRequest().
                        leader().
                        visible().
                        receive();

                    tester.popupStateSettingRequest().
                        settingsFetched().
                        initialized().
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

                    tester.chatsVisibilitySettingRequest().
                        settingsFetched().
                        initialized().
                        receiveResponse();

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

                    tester.stateSettingRequest().
                        leader().
                        receive();

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

                    tester.popupStateSettingRequest().
                        settingsFetched().
                        receiveResponse();

                    tester.notificationSettingRequest().
                        success().
                        expectToBeSent();

                    tester.stateSettingRequest().
                        userDataFetched().
                        leader().
                        receive();

                    tester.popupStateSettingRequest().
                        userDataFetched().
                        settingsFetched().
                        initialized().
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

                        tester.popupStateSettingRequest().
                            settingsFetched().
                            receiveResponse();

                        tester.chatsVisibilitySettingRequest().
                            settingsFetched().
                            receiveResponse();

                        tester.stateSettingRequest().
                            userDataFetched().
                            leader().
                            receive();

                        tester.popupStateSettingRequest().
                            userDataFetched().
                            settingsFetched().
                            initialized().
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

                        tester.chatsVisibilitySettingRequest().
                            settingsFetched().
                            initialized().
                            receiveResponse();

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

                unfilteredPostMessages.
                    nextMessage().
                    expectNotToExist();

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
                        'Storage data values for keys: "error"'
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
        xdescribe('Открываю попап. Отправлен запрос состояния.', function() {
            beforeEach(function() {
                tester = new Tester({
                    application: 'popup',
                    isAuthorized: true,
                    ...options,
                });

                tester.stateRequest().receiveResponse();
            });
            
            describe('Настройки софтфона еще не получены.', function() {
                beforeEach(function() {
                    tester.popupStateSettingRequest().expectResponseToBeSent();
                });

                describe('Получены настройки софтфтона.', function() {
                    beforeEach(function() {
                        tester.popupStateSettingRequest().
                            settingsFetched().
                            expectResponseToBeSent();
                    });

                    describe('Софтфон инициализирован.', function() {
                        beforeEach(function() {
                            tester.popupStateSettingRequest().
                                settingsFetched().
                                initialized().
                                expectResponseToBeSent();
                        });

                        describe('Получено имя сотрудника.', function() {
                            let popupStateSettingRequest;

                            beforeEach(function() {
                                popupStateSettingRequest = tester.popupStateSettingRequest().
                                    settingsFetched().
                                    initialized();
                            });

                            describe('Софтон скрыт.', function() {
                                beforeEach(function() {
                                    popupStateSettingRequest.
                                        userDataFetched().
                                        expectResponseToBeSent();
                                });

                                describe('Чаты скрыты.', function() {
                                    beforeEach(function() {
                                        tester.chatsVisibilitySettingRequest().
                                            settingsFetched().
                                            initialized().
                                            expectResponseToBeSent();
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
                                        
                                        tester.body.expectTextContentNotToHaveSubstring(
                                            'Не удалось получить настройки'
                                        );
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
                                        settingsFetched().
                                        initialized().
                                        visible().
                                        expectResponseToBeSent();

                                    tester.switchButton('Показать чаты').expectToBeChecked();
                                });
                                it('Нажимаю на кнопку выхода. Отправлен запрос выхода.', function() {
                                    tester.logoutButton.click();
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

                                    tester.logoutButton.expectToHaveAttribute('disabled');
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

                                it(
                                    'Нажимаю на кнопку "Показать софтфон". Отправлен запрос изменения видимости.',
                                function() {
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
                                    tester.switchButton('Показать чаты').expectNotToBeChecked();
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
                        it('Кнопка видимости софтфона доступна.', function() {
                            tester.switchButton('Показать софтфон').expectToBeEnabled();
                        });
                    });
                    it('Кнопка видимости софтфона заблокирована.', function() {
                        tester.switchButton('Показать софтфон').expectToBeDisabled();
                    });
                });
                describe('Софтфон был принудитльно показан.', function() {
                    beforeEach(function() {
                        tester.popupStateSettingRequest().
                            showed().
                            expectResponseToBeSent();
                    });

                    describe('Получены настройки софтфтона.', function() {
                        beforeEach(function() {
                            tester.popupStateSettingRequest().
                                showed().
                                settingsFetched().
                                expectResponseToBeSent();
                        });

                        describe('Софтфон инициализирован.', function() {
                            beforeEach(function() {
                                tester.popupStateSettingRequest().
                                    showed().
                                    settingsFetched().
                                    initialized().
                                    expectResponseToBeSent();
                            });

                            it('Кнопка видимости софтфона доступна.', function() {
                                tester.switchButton('Показать софтфон').expectToBeEnabled();
                            });
                        });

                        it('Кнопка видимости софтфона доступна.', function() {
                            tester.switchButton('Показать софтфон').expectToBeDisabled();
                        });
                    });
                    it('Кнопка видимости софтфона заблокирована.', function() {
                        tester.switchButton('Показать софтфон').expectToBeDisabled();
                    });
                });
                it('Кнопка видимости софтфона доступна.', function() {
                    tester.switchButton('Показать софтфон').expectToBeEnabled();
                });
            });
            it('Отображён логин авторизованного пользователя.', function() {
                tester.body.expectTextContentToHaveSubstring('bitrixtest');
                tester.switchButton('Показать чаты').expectToBeDisabled();
                tester.switchButton('Показать софтфон').expectToBeDisabled();
                tester.body.expectTextContentNotToHaveSubstring('Вы не авторизованы');
            });
        });
        xdescribe('Открываю background-скрипт. Софтфон авторизован.', function() {
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

                    tester.chrome.
                        storage.
                        local.
                        expectToContain({
                            log: utils.expectJSONToContain({
                                'https://my.uiscom.ru/extension/uc_flow/installment_settings': {
                                    message: utils.expectToHaveSubstring(
                                        '[{' +
                                            '"loc":["root"],' +
                                            '"msg":"Server got itself in trouble",' +
                                            '"type":"value_error.exception"' +
                                        '}]'
                                    ),
                                },
                            }),
                        });
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
                    action.
                    expectToHaveNoBadgeText();
            });
            it('Есть пропущенные события. Отображено количество пропущенных событий.', function() {
                tester.missedEventsCountSettingRequest().
                    value(75).
                    expectResponseToBeSent();

                tester.chrome.
                    action.
                    expectBadgeTextHaveValue('75');
            });
            it('Получен запрос возможного обновления настроек. Настройки не обновлены.', function() {
                tester.installmentSettingsProbableUpdatingRequest().expectResponseToBeSent();

                tester.chrome.
                    permissions.
                    nextRequest().
                    grant();
            });
        });
        xdescribe('Открываю background-скрипт.', function() {
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
                            let softphoneWidgetSettingsRequest;

                            beforeEach(function() {
                                oauthRequest.receiveResponse();

                                softphoneWidgetSettingsRequest = tester.widgetSettings().
                                    request().
                                    expectToBeSent();
                                
                                tester.widgetSettings().
                                    chatsSettings().
                                    request().
                                    receiveResponse();
                            });

                            it('Получены ответы на запрос настроек. Настройки сохранены в хранилище.', function() {
                                softphoneWidgetSettingsRequest.receiveResponse();

                                tester.widgetSettings().
                                    storageData().
                                    expectToBeSaved();

                                tester.chrome.
                                    storage.
                                    local.
                                    expectToContain({
                                        log: utils.expectJSONToContain({
                                            launchWebAuthFlow: {
                                                time: utils.expectTime('2019-12-19T12:10:06'),
                                                message: [
                                                    'chrome.identity.launchWebAuthFlow was called with options',
                                                    '',
                                                    '"interactive": true,',
                                                    '"url": https://uc-sso-prod-api.uiscom.ru/oauth2/authorize?',
                                                    '    response_type=code&',
                                                    '    client_id=' +
                                                            'https://faaeopllmpfoeobihkiojkbhnlfkleik.chromiumapp.org&',
                                                    '    redirect_uri=' +
                                                            'https://faaeopllmpfoeobihkiojkbhnlfkleik.chromiumapp.org&',
                                                    '    prompt=login',
                                                    '',
                                                    'and returned ' +
                                                        '"https://faaeopllmpfoeobihkiojkbhnlfkleik.chromiumapp.org/' +
                                                        '?code=28gjs8o24rfsd42"',
                                                ].join("\n"),
                                            },

                                            'https://uc-sso-prod-api.uiscom.ru/oauth2/token': {
                                                time: utils.expectTime('2019-12-19T12:10:06'),
                                                message: utils.expectToStartWith([
                                                    'Response status: 200',
                                                    '',
                                                    'POST https://uc-sso-prod-api.uiscom.ru/oauth2/token',
                                                    'Authorization: Basic aHR0cHMlM0ElMkYlMkZmYWFlb3BsbG1wZm9lb2J' +
                                                        'paGtpb2prYmhubGZrbGVpay5jaHJvbWl1bWFwcC5vcmc6aHR0cHMlM0E' +
                                                        'lMkYlMkZmYWFlb3BsbG1wZm9lb2JpaGtpb2prYmhubGZrbGVpay5jaHJ' +
                                                        'vbWl1bWFwcC5vcmc=',
                                                    '',
                                                    'redirect_uri=https://faaeopllmpfoeobihkiojkbhnlfkleik.' +
                                                        'chromiumapp.org&',
                                                    'code=28gjs8o24rfsd42&',
                                                    'grant_type=authorization_code',
                                                    '',
                                                    '{"access_token":',//}
                                                ].join("\n")),
                                            },

                                            'https://my.uiscom.ru/extension/uc_flow/installment_settings': {
                                                time: utils.expectTime('2019-12-19T12:10:06'),
                                                message: utils.expectToStartWith([
                                                    'Response status: 200',
                                                    '',
                                                    'GET https://my.uiscom.ru/extension/uc_flow/' +
                                                        'installment_settings',
                                                    `Authorization: Bearer ${tester.oauthToken}`,
                                                    'X-Auth-Type: jwt',
                                                    '',
                                                    'widget_id=chrome',
                                                    '',
                                                    '{"softphone":',//}
                                                ].join("\n")),
                                            },

                                            [
                                                'https://dev-int0-chats-logic.uis.st/v1/settings/uc_flow/' +
                                                'installment_settings'
                                            ]: {
                                                time: utils.expectTime('2019-12-19T12:10:06'),
                                                message: utils.expectToStartWith([
                                                    'Response status: 200',
                                                    '',
                                                    'GET https://dev-int0-chats-logic.uis.st/v1/settings/uc_flow/' +
                                                        'installment_settings',
                                                    `Authorization: Bearer ${tester.oauthToken}`,
                                                    'X-Auth-Type: jwt',
                                                    '',
                                                    'widget_id=chrome',
                                                    '',
                                                    '{"chats":',//}
                                                ].join("\n")),
                                            },
                                        }),
                                    });
                            });
                            it('Один из запросов завершился ошибкой. Сообщение об ошибке сохранено.', function() {
                                softphoneWidgetSettingsRequest.
                                    failedToGetSettings().
                                    receiveResponse();

                                tester.widgetSettings().
                                    failedToGetSettings().
                                    noSoftphoneSettings().
                                    storageData().
                                    expectToBeSaved();

                                tester.chrome.
                                    storage.
                                    local.
                                    expectToContain({
                                        log: utils.expectJSONToContain({
                                            'https://my.uiscom.ru/extension/uc_flow/installment_settings': {
                                                message: utils.expectToStartWith('Failed; Response status: 500'),
                                            },
                                        }),
                                    });

                                tester.chrome.
                                    storage.
                                    local.
                                    expectToContain({
                                        log: utils.expectJSONToContain({
                                            'https://my.uiscom.ru/extension/uc_flow/installment_settings': {
                                                message: utils.expectToHaveSubstring(
                                                    '500 Internal Server Error Server got itself in trouble'
                                                ),
                                            },
                                        }),
                                    });
                            });
                            it('Один из запросов завершился ошибкой сети. Сообщение об ошибке сохранено.', function() {
                                softphoneWidgetSettingsRequest.
                                    failedToGetSettingsBecauseOfNetworkError().
                                    receiveResponse();

                                tester.widgetSettings().
                                    failedToGetSettingsBecauseOfNetworkError().
                                    noSoftphoneSettings().
                                    storageData().
                                    expectToBeSaved();

                                tester.chrome.
                                    storage.
                                    local.
                                    expectToContain({
                                        log: utils.expectJSONToContain({
                                            'https://my.uiscom.ru/extension/uc_flow/installment_settings': {
                                                message: utils.expectToHaveSubstring('Error: Network error'),
                                            },
                                        }),
                                    });
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

                            tester.chrome.
                                storage.
                                local.
                                expectToContain({
                                    log: utils.expectJSONToContain({
                                        launchWebAuthFlow: {
                                            message: utils.expectToHaveSubstring('Failed to open authorization page'),
                                        },
                                    }),
                                });
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
        xdescribe('Контент скрипт встроился в IFrame. Сотрудник авторизован.', function() {
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
            it('Получено сообщение от вложенного IFrame. Сообщение передано родителю.', function() {
                postMessages.nextMessage().expectNotToExist();
                postMessages.receive('ignore:log:[https://somedomain] Message to parent');

                unfilteredPostMessages.
                    nextMessage().
                    expectMessageToStartsWith('ignore:log:').
                    expectMessageToContain('[https://somedomain] Message to parent');
            });
            it('Получен запрос скачивания логов. Логи не скачиваются.', function() {
                tester.logDownloadingRequest().expectResponseToBeSent();

                tester.anchor.
                    withFileName('20191219.121006.000.log.txt').
                    expectNotToExist();
            });
            it('Сообщения в лог передаются родительскому окну.', function() {
                unfilteredPostMessages.
                    nextMessage().
                    expectMessageToStartsWith('ignore:log:').
                    expectMessageToContain(
                        'Settings' + "\n\n" +

                        'URL: https://app.uiscom.ru' + "\n" +
                        'Type: softphone'
                    );
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
        xdescribe('Открыт IFrame софтфона amoCRM.', function() {
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

                    tester.stateSettingRequest().
                        leader().
                        expectToBeSent();

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
                            leader().
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
                            leader().
                            expectToBeSent();

                        tester.eventsWebSocket.disconnect(4429);

                        tester.stateSettingRequest().
                            userDataFetched().
                            visible().
                            destroyed().
                            leader().
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
                        leader().
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

                tester.localStorage.
                    key('token').
                    expectToBeEmpty();
            });
            it(
                'Приходит запрос изменения видимости. Софтфон отображён. Нажимаю на ссылку на страницу авторизации. ' +
                'Открыта страница авторизации.',
            function() {
                tester.softphoneVisibilityToggleRequest().receive();

                tester.stateSettingRequest().
                    visible().
                    expectToBeSent();

                tester.span('Для использования софтфона необходимо авторизоваться').click();
                windowOpener.expectToHavePath('https://uc-sso-amocrm-prod-api.uiscom.ru');
            });
        });
        xdescribe('Открываю виджет amoCRM.', function() {
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
                        leader().
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
                        tester.stateSettingRequest().
                            leader().
                            receive();

                        tester.amocrmStateSettingRequest().expectToBeSent();
                        tester.softphoneVisibilityToggleRequest().expectToBeSent();

                        tester.stateSettingRequest().
                            visible().
                            leader().
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
                            'https://prod-msk-softphone-widget-iframe.callgear.ae/amocrm/softphone'
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
                        tester.stateSettingRequest().
                            leader().
                            receive();

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
                            'https://prod-msk-softphone-widget-iframe.uiscom.ru/amocrm/softphone',
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
                        'https://prod-msk-softphone-widget-iframe.uiscom.ru/amocrm/softphone',
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
        describe('Открываю виджет чатов amoCRM.', function() {
            beforeEach(function() {
                tester = new Tester({
                    softphoneHost: 'my.uiscom.ru',
                    ...options,
                    application: 'amocrmChats',
                });

                notificationTester.grantPermission();

                postMessages.receive({
                    method: 'set_token',
                    data: '',
                });
            });

            describe('Открываю страницу контакта.', function() {
                beforeEach(function() {
                    tester.renderContact();
                });

                describe('Инициализировано содержимое IFrame.', function() {
                    beforeEach(function() {
                        tester.unreadMessagesCountSettingRequest().receive();

                        tester.amocrmStateSettingRequest().
                            chats().
                            expectToBeSent();
                    });

                    describe('Сотрудник авторизован.', function() {
                        beforeEach(function() {
                            postMessages.receive({
                                method: 'set_token',
                                data: tester.oauthToken,
                            });

                            tester.channelsSearchingRequest().expectToBeSent();

                            tester.channelsSearchingRequest().
                                anotherPhone().
                                expectToBeSent();

                            tester.channelsSearchingRequest().
                                email().
                                expectToBeSent();

                            tester.channelsSearchingRequest().
                                thirdPhone().
                                expectToBeSent();
                        });

                        describe('Получен список каналов.', function() {
                            beforeEach(function() {
                                tester.channelsSearchingResponse().
                                    addChannel().
                                    addThirdChannel().
                                    unavailable().
                                    receive();

                                tester.channelsSearchingResponse().
                                    anotherChannel().
                                    receive();

                                tester.channelsSearchingResponse().
                                    thirdChannel().
                                    receive();

                                tester.channelsSearchingResponse().
                                    fourthChannel().
                                    receive();

                                tester.channelsSearchingResponse().
                                    email().
                                    receive();
                            });

                            describe('Выбираю канал.', function() {
                                beforeEach(function() {
                                    tester.button('Белгород').click();

                                    tester.chatOpeningRequest().
                                        fourthChannel().
                                        expectToBeSent();
                                });

                                it('Появилась левая панель. IFrame не закрывает левую панель.', function() {
                                    tester.page.triggerMutation();
                                    tester.iframe.expectToHaveLeftOffset(200);
                                });
                                it('IFrame не закрывает левое меню.', function() {
                                    tester.iframe.expectToHaveLeftOffset(65);
                                });
                            });
                            it('Количество нетвеченных сообщений не отображено.', function() {
                                tester.navMenuItem.expectToHaveTextContent('UIS Чаты');
                            });
                            it('Отображён список каналов.', function() {
                                tester.body.expectTextContentToHaveSubstring(
                                    '74951234575 ' +
                                    'Белгород ' +
                                    'Астана ' +

                                    '74951234576 ' +
                                    'Ереван ' +

                                    'a.anshakov@comagic.dev ' +
                                    'Сантьяго ' +

                                    '74951234584 ' +
                                    'Тбилиси'
                                );
                            });
                        });
                        describe('Получены сообщения.', function() {
                            beforeEach(function() {
                                tester.unreadMessagesCountSettingRequest().
                                    value(75).
                                    receive();
                            });

                            it('Получены ещё больше сообщений.', function() {
                                tester.unreadMessagesCountSettingRequest().
                                    value(76).
                                    receive();

                                tester.navMenuItem.expectToHaveTextContent('UIS Чаты 76');
                            });
                            it('Отображено количество непросмотренных сообщений.', function() {
                                tester.navMenuItem.expectToHaveTextContent('UIS Чаты 75');
                            });
                        });
                        it('Отбражен список номера телефонов и E-Mail.', function() {
                            tester.body.expectTextContentToHaveSubstring(
                                '74951234575 ' +
                                '74951234576 ' +
                                'a.anshakov@comagic.dev ' +
                                '74951234584'
                            );
                        });
                    });
                    it('Запрос каналов не был отправлен.', function() {
                        postMessages.nextMessage().expectNotToExist();
                    });
                });
                it('В DOM добавлен IFrame чатов.', function() {
                    tester.iframe.expectToBeHidden();

                    tester.iframe.expectAttributeToHaveValue(
                        'src',
                        'https://prod-msk-softphone-widget-iframe.uiscom.ru/amocrm/chats/messages',
                    );
                });
            });
            return;
            describe('Инициализировано содержимое IFrame. Сотрудник авторизован.', function() {
                beforeEach(function() {
                    tester.unreadMessagesCountSettingRequest().receive();

                    tester.amocrmStateSettingRequest().
                        chats().
                        expectToBeSent();

                    postMessages.receive({
                        method: 'set_token',
                        data: tester.oauthToken,
                    });
                });

                it('Открываю страницу контакта. Был отправлен запрос каналов.', function() {
                    tester.renderContact();

                    tester.channelsSearchingRequest().expectToBeSent();

                    tester.channelsSearchingRequest().
                        anotherPhone().
                        expectToBeSent();

                    tester.channelsSearchingRequest().
                        email().
                        expectToBeSent();

                    tester.channelsSearchingRequest().
                        thirdPhone().
                        expectToBeSent();
                });
                it('Запрос каналов не был отправлен.', function() {
                    postMessages.nextMessage().expectNotToExist();
                });
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

                tester.stateSettingRequest().
                    leader().
                    expectToBeSent();

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
                            leader().
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
                        leader().
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

                tester.popupStateSettingRequest().receiveResponse(); 
                tester.chatsVisibilitySettingRequest().receiveResponse();

                tester.missedEventsCountSettingRequest().receiveResponse();

                tester.widgetSettings().
                    storageData().
                    receive();

                tester.popupStateSettingRequest().
                    settingsFetched().
                    receiveResponse();

                tester.chatsVisibilitySettingRequest().
                    settingsFetched().
                    receiveResponse();

                tester.notificationSettingRequest().
                    success().
                    expectToBeSent();

                tester.notificationsClosingRequest().receive();

                tester.stateSettingRequest().
                    userDataFetched().
                    leader().
                    receive();

                tester.popupStateSettingRequest().
                    userDataFetched().
                    settingsFetched().
                    initialized().
                    receiveResponse();

                tester.widgetSettings().
                    windowMessage().
                    expectToBeSent();

                tester.submoduleInitilizationEvent().
                    operatorWorkplace().
                    receive();

                tester.submoduleInitilizationEvent().receive();
                tester.unreadMessagesCountSettingRequest().receive();

                tester.chatsVisibilitySettingRequest().
                    settingsFetched().
                    initialized().
                    receiveResponse();

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

                        it('Повторно получен список каналов. Список каналов был обновлён.', function() {
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

                                    'Канал "Нижний Новгород" ' +
                                    'Канал "Белгород" ' +

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
                        settingsFetched().
                        initialized().
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
                        fourthChannel().
                        expectToBeSent();

                    tester.chatsVisibilitySettingRequest().
                        settingsFetched().
                        initialized().
                        visible().
                        receiveResponse();
                });
                it('Получен запрос открытия чата. Отправлен запрос открытия чата.', function() {
                    tester.chatOpeningRequest().receive();
                    tester.installmentSettingsProbableUpdatingRequest().receiveResponse();

                    tester.chatOpeningRequest().expectToBeSent();

                    tester.chatsVisibilitySettingRequest().
                        settingsFetched().
                        initialized().
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

                    it('Сообщение об инициализации чатов получено повторно. Отображён список каналов.', function() {
                        tester.initializednessEvent().
                            chats().
                            receive();

                        tester.body.expectTextContentToHaveSubstring(
                            'Каналы связанные с телефоном 74951234575: ' +

                                'Канал "Нижний Новгород" ' +
                                'Канал "Белгород" ' +

                            'Каналы связанные с телефоном 74951234576: ' +

                                'Канал "Ереван"'
                        );
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
            describe('Получены сообщения об инициализации софтфона и чатов.', function() {
                beforeEach(function() {
                    tester.initializednessEvent().receive();

                    tester.initializednessEvent().
                        chats().
                        receive();
                });
                
                it('Получены настройки. Отображён список каналов.', function() {
                    widgetSettings.receive();
                    tester.nestedContentScriptRegistrationRequest().receiveResponse();

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

                    tester.body.expectTextContentToHaveSubstring(
                        'Каналы связанные с телефоном 74951234575: ' +

                            'Канал "Нижний Новгород" ' +
                            'Канал "Белгород" ' +

                        'Каналы связанные с телефоном 74951234576: ' +

                            'Канал "Ереван"'
                    );
                });
                it('Кнопки чатов не были добавлены.', function() {
                    tester.body.expectToHaveTextContent(
                        'Первый элемент #1 ' +
                        'Некий элемент #1 ' +
                        'Последний элемент #1 ' +
                        'Ещё один элемент #1 ' +

                        '+74951234568 ' +
                        '+74951234570 ' +
                        '+74951234572 ' +
                        '+74951234574 ' +

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

                tester.body.expectToHaveTextContent('Сотрудник yспешно авторизован');
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

                tester.popupStateSettingRequest().receiveResponse();
                tester.chatsVisibilitySettingRequest().receiveResponse();

                tester.missedEventsCountSettingRequest().receiveResponse();

                tester.popupStateSettingRequest().
                    settingsFetched().
                    receiveResponse();

                tester.chatsVisibilitySettingRequest().
                    settingsFetched().
                    receiveResponse();

                tester.stateSettingRequest().
                    leader().
                    receive();

                tester.popupStateSettingRequest().
                    settingsFetched().
                    initialized().
                    receiveResponse();

                tester.widgetSettings().
                    windowMessage().
                    expectToBeSent();

                tester.submoduleInitilizationEvent().
                    operatorWorkplace().
                    receive();

                tester.submoduleInitilizationEvent().receive();
                tester.unreadMessagesCountSettingRequest().receive();

                tester.chatsVisibilitySettingRequest().
                    settingsFetched().
                    initialized().
                    receiveResponse();

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
                    initialized().
                    receiveResponse();

                tester.chatsVisibilitySettingRequest().
                    initialized().
                    receiveResponse();

                tester.widgetSettings().
                    storageData().
                    receive();

                tester.popupStateSettingRequest().
                    initialized().
                    settingsFetched().
                    receiveResponse();

                tester.chatsVisibilitySettingRequest().
                    initialized().
                    settingsFetched().
                    receiveResponse();

                tester.chatsVisibilitySettingRequest().
                    settingsFetched().
                    receiveResponse();

                tester.popupStateSettingRequest().
                    settingsFetched().
                    receiveResponse();

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
        describe('Открываю страницу с расширением UIS в amoCRM.', function() {
            beforeEach(function() {
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

                tester.popupStateSettingRequest().receiveResponse();
                tester.chatsVisibilitySettingRequest().receiveResponse();

                tester.missedEventsCountSettingRequest().receiveResponse();

                tester.popupStateSettingRequest().
                    settingsFetched().
                    receiveResponse();

                tester.chatsVisibilitySettingRequest().
                    settingsFetched().
                    receiveResponse();

                tester.stateSettingRequest().
                    leader().
                    receive();

                tester.popupStateSettingRequest().
                    settingsFetched().
                    initialized().
                    receiveResponse();

                tester.widgetSettings().
                    windowMessage().
                    expectToBeSent();

                tester.submoduleInitilizationEvent().
                    operatorWorkplace().
                    receive();

                tester.submoduleInitilizationEvent().receive();
                tester.unreadMessagesCountSettingRequest().receive();

                tester.chatsVisibilitySettingRequest().
                    settingsFetched().
                    initialized().
                    receiveResponse();

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
            });

            it('Нажимаю на кнопку канала. Чат открыт.', function() {
                tester.channelButton.
                    atIndex(3).
                    click();

                tester.installmentSettingsProbableUpdatingRequest().receiveResponse();

                tester.chatOpeningRequest().
                    fourthChannel().
                    expectToBeSent();

                tester.chatsVisibilitySettingRequest().
                    settingsFetched().
                    initialized().
                    visible().
                    receiveResponse();
            });
            it('Добавлены кнопки каналов.', function() {
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

            tester.stateSettingRequest().
                visible().
                leader().
                expectToBeSent();

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
                'https://prod-msk-softphone-widget-iframe.callgear.ae/amocrm/softphone',
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

            tester.popupStateSettingRequest().
                showed().
                receiveResponse();

            tester.chatsVisibilitySettingRequest().receiveResponse();

            tester.missedEventsCountSettingRequest().receiveResponse();

            tester.popupStateSettingRequest().
                showed().
                settingsFetched().
                receiveResponse();

            tester.chatsVisibilitySettingRequest().
                settingsFetched().
                receiveResponse();

            tester.stateSettingRequest().
                leader().
                receive();

            tester.popupStateSettingRequest().
                showed().
                settingsFetched().
                initialized().
                receiveResponse();

            tester.widgetSettings().
                windowMessage().
                expectToBeSent();

            tester.submoduleInitilizationEvent().
                operatorWorkplace().
                receive();

            tester.submoduleInitilizationEvent().receive();
            tester.unreadMessagesCountSettingRequest().receive();

            tester.chatsVisibilitySettingRequest().
                settingsFetched().
                initialized().
                receiveResponse();

            tester.softphoneVisibilityToggleRequest().expectToBeSent();

            tester.widgetSettings().
                windowMessage().
                chatsSettings().
                expectToBeSent();
        });
        it('Открываю страницу с расширением CallGear в amoCRM. Добавлены кнопки каналов.', function() {
            tester = new Tester({
                softphoneHost: 'my.uiscom.ru',
                isAuthorized: true,
                renderAmocrmCallgearLead: true,
                ...options,
            });

            notificationTester.
                grantPermission().
                recentNotification();

            tester.installmentSettingsProbableUpdatingRequest().receiveResponse();

            tester.popupStateSettingRequest().receiveResponse();
            tester.chatsVisibilitySettingRequest().receiveResponse();

            tester.missedEventsCountSettingRequest().receiveResponse();

            tester.popupStateSettingRequest().
                settingsFetched().
                receiveResponse();

            tester.chatsVisibilitySettingRequest().
                settingsFetched().
                receiveResponse();

            tester.stateSettingRequest().
                leader().
                receive();

            tester.popupStateSettingRequest().
                settingsFetched().
                initialized().
                receiveResponse();

            tester.widgetSettings().
                windowMessage().
                expectToBeSent();

            tester.submoduleInitilizationEvent().
                operatorWorkplace().
                receive();

            tester.submoduleInitilizationEvent().receive();
            tester.unreadMessagesCountSettingRequest().receive();

            tester.chatsVisibilitySettingRequest().
                settingsFetched().
                initialized().
                receiveResponse();

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
                amocrmCallGearExtension().
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
