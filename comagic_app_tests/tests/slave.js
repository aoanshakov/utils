tests.addTest(options => {
    const {
        utils,
        Tester,
        broadcastChannels,
        spendTime,
        windowOpener,
        mediaStreamsTester,
        unload,
        ajax,
        fetch,
        soundSources,
        setNow,
        fileReader,
        userMedia,
        audioDecodingTester,
        blobsTester,
        windowSize,
        notificationTester,
        setDocumentVisible,
        setFocus
    } = options;

    describe('', function() {
        let tester,
            reportGroupsRequest,
            settingsRequest,
            accountRequest,
            permissionsRequest,
            authCheckRequest;

        beforeEach(function() {
            setNow('2019-12-19T12:10:06');

            tester = new Tester(options);

            tester.input.withFieldLabel('Логин').fill('botusharova');
            tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

            tester.button('Войти').click();

            tester.loginRequest().receiveResponse();
            tester.accountRequest().receiveResponse();

            tester.notificationChannel().applyLeader().expectToBeSent();

            const requests = ajax.inAnyOrder();

            reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
            const ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(requests),
                reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(requests),
                employeeRequest = tester.employeeRequest().expectToBeSent(requests);
            authCheckRequest = tester.authCheckRequest().expectToBeSent(requests);

            requests.expectToBeSent();

            ticketsContactsRequest.receiveResponse();
            reportsListRequest.receiveResponse();
            reportTypesRequest.receiveResponse();
            employeeStatusesRequest.receiveResponse();
            employeeRequest.receiveResponse();
        });

        describe('Вкладка является ведомой. Открываю софтфон.', function() {
            beforeEach(function() {
                tester.masterInfoMessage().isNotMaster().receive();
                tester.masterNotification().tabOpened().expectToBeSent();

                authCheckRequest.receiveResponse();
                tester.talkOptionsRequest().receiveResponse();

                tester.permissionsRequest().
                    allowNumberCapacitySelect().
                    allowNumberCapacityUpdate().
                    receiveResponse();

                tester.settingsRequest().
                    dontTriggerScrollRecalculation().
                    allowNumberCapacitySelect().
                    receiveResponse();

                notificationTester.grantPermission();

                tester.numberCapacityRequest().receiveResponse();
                tester.authenticatedUserRequest().receiveResponse();
                reportGroupsRequest.receiveResponse();

                tester.slavesNotification().
                    twoChannels().
                    available().
                    receive();

                tester.button('Софтфон').click();

                tester.masterNotification().toggleWidgetVisiblity().expectToBeSent();

                tester.slavesNotification().
                    additional().
                    visible().
                    receive();
            });

            describe('Скрываю окно.', function() {
                beforeEach(function() {
                    setDocumentVisible(false);
                    tester.masterNotification().tabBecameHidden().expectToBeSent();
                });

                describe('Вкладка становится ведущей. Поднимается webRTC-сокет.', function() {
                    beforeEach(function() {
                        tester.masterInfoMessage().receive();

                        tester.employeesWebSocket.connect();
                        tester.employeesInitMessage().expectToBeSent();

                        tester.slavesNotification().
                            additional().
                            visible().
                            expectToBeSent();

                        tester.slavesNotification().
                            tabsVisibilityRequest().
                            expectToBeSent();

                        tester.slavesNotification().
                            userDataFetched().
                            twoChannels().
                            hidden().
                            enabled().
                            expectToBeSent();

                        tester.connectEventsWebSocket();

                        tester.slavesNotification().
                            userDataFetched().
                            twoChannels().
                            hidden().
                            enabled().
                            softphoneServerConnected().
                            expectToBeSent();

                        tester.connectSIPWebSocket();

                        tester.slavesNotification().
                            userDataFetched().
                            twoChannels().
                            webRTCServerConnected().
                            hidden().
                            softphoneServerConnected().
                            expectToBeSent();

                        tester.masterInfoMessage().tellIsLeader().expectToBeSent();
                        tester.notificationChannel().tellIsLeader().expectToBeSent();
                        tester.notificationChannel().applyLeader().expectToBeSent();

                        tester.allowMediaInput();

                        tester.slavesNotification().
                            userDataFetched().
                            twoChannels().
                            webRTCServerConnected().
                            hidden().
                            softphoneServerConnected().
                            microphoneAccessGranted().
                            expectToBeSent();

                        tester.authenticatedUserRequest().receiveResponse();
                        tester.registrationRequest().receiveResponse();

                        tester.slavesNotification().
                            twoChannels().
                            available().
                            hidden().
                            expectToBeSent();
                    });

                    it('Поступил входящий звонок. Отображено браузерное уведомление.', function() {
                        tester.incomingCall().receive();

                        tester.slavesNotification().
                            available().
                            twoChannels().
                            incoming().
                            progress().
                            hidden().
                            expectToBeSent();

                        tester.numaRequest().receiveResponse();

                        tester.outCallEvent().receive();
                        tester.outCallEvent().slavesNotification().expectToBeSent();

                        notificationTester.grantPermission().
                            recentNotification().
                            expectToHaveTitle('Входящий звонок').
                            expectToHaveBody('Шалева Дора, +7 (916) 123-45-67, somesite.com').
                            expectToBeOpened();
                    });
                    it(
                        'Прошло некоторое время. Проверка наличия ведущей вкладки не ' +
                        'совершается.',
                    function() {
                        spendTime(3000);
                        Promise.runAll(false, true);
                    });
                    it(
                        'Существует другая открытая вкладка. Поступил входящий звонок. Браузерное ' +
                        'уведомление не отображено.',
                    function() {
                        tester.masterNotification().tabBecameVisible().receive();

                        tester.slavesNotification().
                            twoChannels().
                            available().
                            expectToBeSent();

                        tester.incomingCall().receive();

                        tester.slavesNotification().
                            available().
                            twoChannels().
                            incoming().
                            progress().
                            expectToBeSent();

                        tester.numaRequest().receiveResponse();

                        tester.outCallEvent().receive();
                        tester.outCallEvent().slavesNotification().expectToBeSent();
                    });
                });
                it('Получен запрос видимости окна. Ничего не происходит.', function() {
                    tester.slavesNotification().tabsVisibilityRequest().receive();
                });
                it('Поступил входящий звонок. Отображена информация о звонке.', function() {
                    tester.slavesNotification().
                        available().
                        twoChannels().
                        incoming().
                        progress().
                        receive();

                    tester.outCallEvent().slavesNotification().receive();

                    tester.softphone.expectTextContentToHaveSubstring(
                        'Шалева Дора +7 (916) 123-45-67 ' +
                        'Путь лида'
                    );
                });
            });
            it(
                'Вкладка становится ведущей. Скрываю вкладку. Раскрываю вкладку. Поступил входящий звонок. ' +
                'Информация о звонке не отображена.',
            function() {
                tester.masterInfoMessage().receive();

                tester.employeesWebSocket.connect();
                tester.employeesInitMessage().expectToBeSent();

                tester.slavesNotification().
                    additional().
                    visible().
                    expectToBeSent();

                tester.slavesNotification().
                    tabsVisibilityRequest().
                    expectToBeSent();

                tester.slavesNotification().
                    userDataFetched().
                    twoChannels().
                    enabled().
                    expectToBeSent();

                tester.connectEventsWebSocket();

                tester.slavesNotification().
                    userDataFetched().
                    twoChannels().
                    enabled().
                    softphoneServerConnected().
                    expectToBeSent();

                tester.connectSIPWebSocket();

                tester.slavesNotification().
                    userDataFetched().
                    twoChannels().
                    webRTCServerConnected().
                    softphoneServerConnected().
                    expectToBeSent();

                tester.masterInfoMessage().tellIsLeader().expectToBeSent();
                tester.notificationChannel().tellIsLeader().expectToBeSent();
                tester.notificationChannel().applyLeader().expectToBeSent();

                tester.allowMediaInput();

                tester.slavesNotification().
                    userDataFetched().
                    twoChannels().
                    webRTCServerConnected().
                    softphoneServerConnected().
                    microphoneAccessGranted().
                    expectToBeSent();

                tester.authenticatedUserRequest().receiveResponse();
                tester.registrationRequest().receiveResponse();

                tester.slavesNotification().
                    twoChannels().
                    available().
                    expectToBeSent();

                setDocumentVisible(false);

                tester.slavesNotification().
                    twoChannels().
                    available().
                    hidden().
                    expectToBeSent();

                setDocumentVisible(true);

                tester.slavesNotification().
                    twoChannels().
                    available().
                    expectToBeSent();

                tester.incomingCall().receive();

                tester.slavesNotification().
                    available().
                    twoChannels().
                    incoming().
                    progress().
                    expectToBeSent();

                tester.numaRequest().receiveResponse();

                tester.outCallEvent().receive();
                tester.outCallEvent().slavesNotification().expectToBeSent();
            });
            it(
                'Сессионная кука уже удалена. На ведущей вкладке был совершен выход из софтфона. Отображается ' +
                'форма аутентификации.',
            function() {
                document.cookie = '';

                window.isLogEnabled = true;

                tester.slavesNotification().
                    userDataFetched().
                    twoChannels().
                    microphoneAccessGranted().
                    destroyed().
                    enabled().
                    receive();

                tester.masterInfoMessage().leaderDeath().expectToBeSent();
                tester.masterInfoMessage().leaderDeath().receive();
                
                tester.authLogoutRequest().receiveResponse();

                tester.input.withFieldLabel('Логин').fill('botusharova');
                tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                tester.button('Войти').click();

                tester.loginRequest().receiveResponse();
                tester.accountRequest().receiveResponse();

                tester.authCheckRequest().receiveResponse(),
                tester.reportGroupsRequest().receiveResponse();
                tester.reportsListRequest().receiveResponse();
                tester.reportTypesRequest().receiveResponse();

                tester.masterInfoMessage().receive();
                tester.slavesNotification().additional().visible().expectToBeSent();
                tester.slavesNotification().expectToBeSent();

                tester.masterInfoMessage().tellIsLeader().expectToBeSent();
                tester.notificationChannel().tellIsLeader().expectToBeSent();
                tester.notificationChannel().applyLeader().expectToBeSent();

                tester.talkOptionsRequest().receiveResponse();
                tester.permissionsRequest().receiveResponse();
                tester.settingsRequest().receiveResponse();
                tester.employeeStatusesRequest().receiveResponse();

                tester.slavesNotification().
                    twoChannels().
                    enabled().
                    expectToBeSent();

                tester.connectEventsWebSocket();

                tester.slavesNotification().
                    twoChannels().
                    enabled().
                    softphoneServerConnected().
                    expectToBeSent();

                tester.connectSIPWebSocket();
                
                tester.slavesNotification().
                    twoChannels().
                    webRTCServerConnected().
                    softphoneServerConnected().
                    expectToBeSent();

                notificationTester.grantPermission();

                const requests = ajax.inAnyOrder();
                    ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(requests),
                    employeeRequest = tester.employeeRequest().expectToBeSent(requests);

                requests.expectToBeSent();

                ticketsContactsRequest.receiveResponse();
                employeeRequest.receiveResponse();

                tester.authenticatedUserRequest().receiveResponse();

                tester.slavesNotification().
                    twoChannels().
                    webRTCServerConnected().
                    softphoneServerConnected().
                    userDataFetched().
                    expectToBeSent();

                tester.registrationRequest().receiveResponse();

                tester.slavesNotification().
                    twoChannels().
                    webRTCServerConnected().
                    softphoneServerConnected().
                    userDataFetched().
                    registered().
                    expectToBeSent();

                tester.allowMediaInput();

                tester.slavesNotification().
                    twoChannels().
                    available().
                    expectToBeSent();
            });
            it(
                'Сессионная кука еще не удалена. На ведущей вкладке был совершен выход из софтфона. Отображается ' +
                'форма аутентификации.',
            function() {
                tester.slavesNotification().
                    userDataFetched().
                    twoChannels().
                    microphoneAccessGranted().
                    destroyed().
                    enabled().
                    receive();
                
                tester.masterInfoMessage().leaderDeath().expectToBeSent();
                tester.masterInfoMessage().leaderDeath().receive();

                tester.authLogoutRequest().receiveResponse();
                tester.userLogoutRequest().receiveResponse();

                tester.input.withFieldLabel('Логин').fill('botusharova');
                tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                tester.button('Войти').click();

                tester.loginRequest().receiveResponse();
                tester.accountRequest().receiveResponse();

                tester.authCheckRequest().receiveResponse(),
                tester.reportGroupsRequest().receiveResponse();
                tester.reportsListRequest().receiveResponse();
                tester.reportTypesRequest().receiveResponse();

                tester.masterInfoMessage().receive();
                tester.slavesNotification().additional().visible().expectToBeSent();
                tester.slavesNotification().expectToBeSent();

                tester.masterInfoMessage().tellIsLeader().expectToBeSent();
                tester.notificationChannel().tellIsLeader().expectToBeSent();
                tester.notificationChannel().applyLeader().expectToBeSent();

                tester.talkOptionsRequest().receiveResponse();
                tester.permissionsRequest().receiveResponse();
                tester.settingsRequest().receiveResponse();
                tester.employeeStatusesRequest().receiveResponse();

                tester.slavesNotification().
                    twoChannels().
                    enabled().
                    expectToBeSent();

                tester.connectEventsWebSocket();

                tester.slavesNotification().
                    twoChannels().
                    enabled().
                    softphoneServerConnected().
                    expectToBeSent();

                tester.connectSIPWebSocket();
                
                tester.slavesNotification().
                    twoChannels().
                    webRTCServerConnected().
                    softphoneServerConnected().
                    expectToBeSent();

                notificationTester.grantPermission();

                const requests = ajax.inAnyOrder();
                    ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(requests),
                    employeeRequest = tester.employeeRequest().expectToBeSent(requests);

                requests.expectToBeSent();

                ticketsContactsRequest.receiveResponse();
                employeeRequest.receiveResponse();

                tester.authenticatedUserRequest().receiveResponse();

                tester.slavesNotification().
                    twoChannels().
                    webRTCServerConnected().
                    softphoneServerConnected().
                    userDataFetched().
                    expectToBeSent();

                tester.registrationRequest().receiveResponse();

                tester.slavesNotification().
                    twoChannels().
                    webRTCServerConnected().
                    softphoneServerConnected().
                    userDataFetched().
                    registered().
                    expectToBeSent();

                tester.allowMediaInput();

                tester.slavesNotification().
                    twoChannels().
                    available().
                    expectToBeSent();
            });
            it(
                'Софтфон открыт в другом окне. Отображено сообщение о том, что софтфон открыт в другом окне.',
            function() {
                tester.slavesNotification().
                    userDataFetched().
                    twoChannels().
                    appAlreadyOpened().
                    enabled().
                    microphoneAccessGranted().
                    receive();

                tester.authLogoutRequest().receiveResponse();
                tester.softphone.expectTextContentToHaveSubstring('Софтфон открыт в другом окне');
            });
            it(
                'Ввожу номер телефона. Приходит сообщение о том, что вкладка все еще остается ведомой. Номер ' +
                'телефона все еще введен.',
            function() {
                tester.phoneField.fill('79161234567');
                tester.masterInfoMessage().tellIsLeader().receive();
                tester.phoneField.expectToHaveValue('79161234567');
            });
            it('С другой ведомой вкладки поступил запрос скрытия виджета. Виджет остался видимым.', function() {
                tester.masterNotification().toggleWidgetVisiblity().receive();
                tester.phoneField.expectToBeVisible();
            });
            it('Получен запрос выбора номера от другой вкладки.', function() {
                tester.othersNotification().
                    widgetStateUpdate().
                    fixedNumberCapacityRule().
                    anotherNumberCapacity().
                    receive();

                tester.select.expectToHaveTextContent('+7 (916) 123-89-29');
            });
            it('Выбран другой статус. Отображен выбранный статус.', function() {
                tester.entityChangeEvent().
                    anotherStatus().
                    slavesNotification().
                    receive();

                tester.body.expectTextContentToHaveSubstring('Гонева Стевка Нет на месте');
            });
            it('Окно свернуто. В ведущую вкладку отправлено сообщение о том, что окно свернуто.', function() {
                setDocumentVisible(false);
                tester.masterNotification().tabBecameHidden().expectToBeSent();
            });
            it('Закрываю окно. Отправляется сообщение о скрытии окна.', function() {
                unload();
                tester.masterNotification().tabBecameHidden().expectToBeSent();
            });
            it('Получен запрос видимости окна. Отправлено сообщение о видимости вкладки.', function() {
                tester.slavesNotification().tabsVisibilityRequest().receive();
                tester.masterNotification().tabBecameVisible().expectToBeSent();
            });
            it(
                'Нажимаю на кнпоку выход. Софтфон разлогинивается. Отправлен запрос выключения софтфона в мастер ' +
                'вкладку.',
            function() {
                tester.userName.putMouseOver();
                tester.logoutButton.click();

                tester.notificationChannel().applyLeader().expectToBeSent();

                tester.userLogoutRequest().receiveResponse();
                tester.authLogoutRequest().receiveResponse();

                tester.masterInfoMessage().leaderDeath().expectToBeSent();
                tester.masterNotification().destroy().expectToBeSent();
            });
            it('Прошло некоторое время. Проверяется наличие ведущей вкладки.', function() {
                spendTime(2000);
                Promise.runAll(false, true);

                tester.masterInfoMessage().applyLeader().expectToBeSent();
            });
            it('Нажимаю на кнопку с жуком. Скачивается лог.', function() {
                tester.bugButton.click();

                tester.anchor.withFileName('20191219.121006.000.log.txt').
                    expectHrefToBeBlobWithSubstring(
                        'Broadcast message sent: {"type":"notify_master","data":{"action":"tab_opened","visible":true}}'
                    );

                tester.anchor.withFileName('20191219.121006.000.log.txt').
                    expectHrefToBeBlobWithSubstring(
                        'Broadcast message received: {"type":"notify_slaves","data":{"type":"webrtc_state_updating"'//}}
                    );
            });
            it('Попытка восстановления соединения не совершается.', function() {
                tester.expectNoWebsocketConnecting();

                tester.select.expectToHaveTextContent('+7 (495) 021-68-06');
                tester.body.expectTextContentToHaveSubstring('Ганева Стефка Доступен');
            });
        });
        describe(
            'Окно свернуто. Вкладка является ведомой. Отправлено сообщение о том, что вкладка открыта в фоне.',
        function() {
            beforeEach(function() {
                setDocumentVisible(false);

                tester.masterInfoMessage().isNotMaster().receive();
                tester.masterNotification().tabOpenedInBackground().expectToBeSent();

                authCheckRequest.receiveResponse();
                tester.talkOptionsRequest().receiveResponse();

                tester.permissionsRequest().
                    allowNumberCapacitySelect().
                    allowNumberCapacityUpdate().
                    receiveResponse();

                tester.settingsRequest().
                    dontTriggerScrollRecalculation().
                    allowNumberCapacitySelect().
                    receiveResponse();

                notificationTester.grantPermission();

                tester.numberCapacityRequest().receiveResponse();
                tester.authenticatedUserRequest().receiveResponse();
                reportGroupsRequest.receiveResponse();
            });

            it('Закрываю окно. Сообщение о скрытии окна не отправляется.', function() {
                unload();
            });
            it('Окно развернуто. В ведущую вкладку отправлено сообщение о том, что окно развернуто.', function() {
                setDocumentVisible(true);
                tester.masterNotification().tabBecameVisible().expectToBeSent();
            });
        });
    });
});
