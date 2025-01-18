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

    const getPackage = Tester.createPackagesGetter(options);

    describe('Открываю новый личный кабинет.', function() {
        let tester,
            reportGroupsRequest,
            accountRequest,
            permissionsRequest,
            authCheckRequest,
            settingsRequest;

        beforeEach(function() {
            localStorage.setItem('softphone-position-x', '174');
            setNow('2019-12-19T12:10:06');

            tester = new Tester(options);

            tester.input.withFieldLabel('Логин').fill('botusharova');
            tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

            tester.button('Войти').click();

            tester.loginRequest().receiveResponse();
            accountRequest = tester.accountRequest().expectToBeSent();

            tester.hostBroadcastChannel().
                applyLeader().
                expectToBeSent().
                waitForSecond();

            tester.hostBroadcastChannel().
                applyLeader().
                expectToBeSent().
                waitForSecond();

            tester.hostBroadcastChannel().
                tellIsLeader().
                expectToBeSent();
        });

        describe('Цифры в имени контакта не должны быть скрыты при скрытии номеров.', function() {
            beforeEach(function() {
                accountRequest.receiveResponse();

                tester.notificationChannel().
                    applyLeader().
                    expectToBeSent();

                tester.masterInfoMessage().
                    applyLeader().
                    expectToBeSent();

                tester.employeesBroadcastChannel().
                    applyLeader().
                    expectToBeSent().
                    waitForSecond();

                tester.notificationChannel().
                    applyLeader().
                    expectToBeSent();

                tester.masterInfoMessage().
                    applyLeader().
                    expectToBeSent();

                tester.employeesBroadcastChannel().
                    applyLeader().
                    expectToBeSent().
                    waitForSecond();

                tester.slavesNotification().
                    additional().
                    expectToBeSent();

                tester.slavesNotification().expectToBeSent();

                tester.notificationChannel().
                    tellIsLeader().
                    expectToBeSent();

                tester.masterInfoMessage().
                    tellIsLeader().
                    expectToBeSent();

                tester.employeesBroadcastChannel().
                    tellIsLeader().
                    expectToBeSent();

                tester.employeesWebSocket.connect();
                tester.employeesInitMessage().expectToBeSent();
                tester.employeesWebsocketConnectedMessage().expectToBeSent();

                const requests = ajax.inAnyOrder();

                reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
                const ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(requests),
                    reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                    reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                    authCheckRequest = tester.authCheckRequest().expectToBeSent(requests),
                    employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(requests),
                    employeeRequest = tester.employeeRequest().expectToBeSent(requests),
                    employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(requests);

                requests.expectToBeSent();

                ticketsContactsRequest.receiveResponse();
                reportsListRequest.receiveResponse();
                reportTypesRequest.receiveResponse();
                reportGroupsRequest.receiveResponse();
                employeeStatusesRequest.receiveResponse();
                employeeRequest.receiveResponse();
                employeeSettingsRequest.receiveResponse();

                authCheckRequest.receiveResponse();

                tester.talkOptionsRequest().receiveResponse();
                tester.permissionsRequest().receiveResponse();
                settingsRequest = tester.settingsRequest().expectToBeSent();
            });

            describe('Номера телефонов должны быть скрыты. Поступил входящий звонок.', function() {
                beforeEach(function() {
                    settingsRequest.
                        shouldHideNumbers().
                        receiveResponse();

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

                    tester.marksRequest().receiveResponse();
                    authenticatedUserRequest = tester.authenticatedUserRequest().expectToBeSent();

                    registrationRequest = tester.registrationRequest().expectToBeSent();
                    tester.allowMediaInput();

                    tester.slavesNotification().
                        twoChannels().
                        softphoneServerConnected().
                        webRTCServerConnected().
                        microphoneAccessGranted().
                        expectToBeSent();

                    authenticatedUserRequest.receiveResponse();

                    tester.slavesNotification().
                        twoChannels().
                        softphoneServerConnected().
                        webRTCServerConnected().
                        microphoneAccessGranted().
                        userDataFetched().
                        expectToBeSent();

                    registrationRequest.receiveResponse();

                    tester.slavesNotification().
                        twoChannels().
                        available().
                        expectToBeSent();
                });

                it('Открываю историю звонков. Цифры в имени контакта скрыты.', function() {
                    tester.button('Софтфон').click();

                    tester.accountRequest().
                        shouldHideNumbersInContactName().
                        receiveResponse();

                    tester.slavesNotification().
                        additional().
                        visible().
                        expectToBeSent();

                    tester.callsHistoryButton.expectToBeVisible();
                });
                it('Поступил входящий звонок. Цифры в имени контакта скрыты.', function() {
                    tester.incomingCall().receive();

                    tester.slavesNotification().
                        available().
                        twoChannels().
                        incoming().
                        progress().
                        expectToBeSent();

                    tester.numaRequest().receiveResponse();

                    tester.accountRequest().
                        shouldHideNumbersInContactName().
                        receiveResponse();

                    tester.outCallEvent().
                        contactNameWithWithDigits().
                        receive();

                    tester.outCallEvent().
                        contactNameWithWithDigits().
                        slavesNotification().
                        expectToBeSent();

                    tester.softphone.expectTextContentToHaveSubstring(
                        'Мой номер ... ' +
                        'Неизвестный номер'
                    );
                });
            });
            describe('Номера телефонов не должны быть скрыты. Поступил входящий звонок.', function() {
                beforeEach(function() {
                    settingsRequest.receiveResponse();

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

                    tester.marksRequest().receiveResponse();
                    authenticatedUserRequest = tester.authenticatedUserRequest().expectToBeSent();

                    registrationRequest = tester.registrationRequest().expectToBeSent();
                    tester.allowMediaInput();

                    tester.slavesNotification().
                        twoChannels().
                        softphoneServerConnected().
                        webRTCServerConnected().
                        microphoneAccessGranted().
                        expectToBeSent();

                    authenticatedUserRequest.receiveResponse();

                    tester.slavesNotification().
                        twoChannels().
                        softphoneServerConnected().
                        webRTCServerConnected().
                        microphoneAccessGranted().
                        userDataFetched().
                        expectToBeSent();

                    registrationRequest.receiveResponse();

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
                    tester.accountRequest().receiveResponse();

                    tester.outCallEvent().
                        contactNameWithWithDigits().
                        receive();

                    tester.outCallEvent().
                        contactNameWithWithDigits().
                        slavesNotification().
                        expectToBeSent();
                });

                it('Включено скрытие номеров. Цифры в имени контакта не скрыты.', function() {
                    tester.employeeChangedEvent().
                        isNeedHideNumbers().
                        receive();

                    tester.employeeChangedEvent().
                        isNeedHideNumbers().
                        slavesNotification().
                        expectToBeSent();

                    tester.marksRequest().receiveResponse();

                    tester.softphone.expectTextContentToHaveSubstring(
                        'Мой номер +7 (916) 234-56-78 ' +
                        'Неизвестный номер'
                    );
                });
                it('Цифры в имени контакта видимы.', function() {
                    tester.softphone.expectTextContentToHaveSubstring(
                        'Мой номер +7 (916) 234-56-78 ' +
                        '+7 (916) 123-45-67'
                    );
                });
            });
        });
        describe('Цифры в имени контакта не должны быть скрыты при скрытии номеров.', function() {
            beforeEach(function() {
                accountRequest.
                    shouldHideNumbersInContactName().
                    receiveResponse();

                tester.notificationChannel().
                    applyLeader().
                    expectToBeSent();

                tester.masterInfoMessage().
                    applyLeader().
                    expectToBeSent();

                tester.employeesBroadcastChannel().
                    applyLeader().
                    expectToBeSent().
                    waitForSecond();

                tester.notificationChannel().
                    applyLeader().
                    expectToBeSent();

                tester.masterInfoMessage().
                    applyLeader().
                    expectToBeSent();

                tester.employeesBroadcastChannel().
                    applyLeader().
                    expectToBeSent().
                    waitForSecond();

                tester.slavesNotification().
                    additional().
                    expectToBeSent();

                tester.slavesNotification().expectToBeSent();

                tester.notificationChannel().
                    tellIsLeader().
                    expectToBeSent();

                tester.masterInfoMessage().
                    tellIsLeader().
                    expectToBeSent();

                tester.employeesBroadcastChannel().
                    tellIsLeader().
                    expectToBeSent();

                tester.employeesWebSocket.connect();
                tester.employeesInitMessage().expectToBeSent();
                tester.employeesWebsocketConnectedMessage().expectToBeSent();

                const requests = ajax.inAnyOrder();

                reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
                const ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(requests),
                    reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                    reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                    authCheckRequest = tester.authCheckRequest().expectToBeSent(requests),
                    employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(requests),
                    employeeRequest = tester.employeeRequest().expectToBeSent(requests),
                    employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(requests);

                requests.expectToBeSent();

                ticketsContactsRequest.receiveResponse();
                reportsListRequest.receiveResponse();
                reportTypesRequest.receiveResponse();
                reportGroupsRequest.receiveResponse();
                employeeStatusesRequest.receiveResponse();
                employeeRequest.receiveResponse();
                employeeSettingsRequest.receiveResponse();

                authCheckRequest.receiveResponse();

                tester.talkOptionsRequest().receiveResponse();
                tester.permissionsRequest().receiveResponse();
                settingsRequest = tester.settingsRequest().expectToBeSent();
            });

            describe('Номера телефонов должны быть скрыты. Поступил входящий звонок.', function() {
                beforeEach(function() {
                    settingsRequest.
                        shouldHideNumbers().
                        receiveResponse();

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

                    tester.marksRequest().receiveResponse();
                    authenticatedUserRequest = tester.authenticatedUserRequest().expectToBeSent();

                    registrationRequest = tester.registrationRequest().expectToBeSent();
                    tester.allowMediaInput();

                    tester.slavesNotification().
                        twoChannels().
                        softphoneServerConnected().
                        webRTCServerConnected().
                        microphoneAccessGranted().
                        expectToBeSent();

                    authenticatedUserRequest.receiveResponse();

                    tester.slavesNotification().
                        twoChannels().
                        softphoneServerConnected().
                        webRTCServerConnected().
                        microphoneAccessGranted().
                        userDataFetched().
                        expectToBeSent();

                    registrationRequest.receiveResponse();

                    tester.slavesNotification().
                        twoChannels().
                        available().
                        expectToBeSent();
                });

                it('Открываю историю звонков. Цифры в имени контакта скрыты.', function() {
                    tester.button('Софтфон').click();
                    tester.accountRequest().receiveResponse();

                    tester.slavesNotification().
                        additional().
                        visible().
                        expectToBeSent();

                    tester.callsHistoryButton.expectNotToExist();
                });
                it('Поступил входящий звонок. Цифры в имени контакта скрыты.', function() {
                    tester.incomingCall().receive();

                    tester.slavesNotification().
                        available().
                        twoChannels().
                        incoming().
                        progress().
                        expectToBeSent();

                    tester.numaRequest().receiveResponse();
                    tester.accountRequest().receiveResponse();

                    tester.outCallEvent().
                        contactNameWithWithDigits().
                        receive();

                    tester.outCallEvent().
                        contactNameWithWithDigits().
                        slavesNotification().
                        expectToBeSent();

                    tester.softphone.expectTextContentToHaveSubstring(
                        'Мой номер +7 (916) 234-56-78 ' +
                        'Неизвестный номер'
                    );
                });
            });
        });
    });
});
