tests.addTest(options => {
    const {
        utils,
        Tester,
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
        setDocumentVisible
    } = options;

    describe('Открываю лк. Ни лидген, ни РМО, ни аналитика не доступны.', function() {
        let tester,
            reportGroupsRequest,
            settingsRequest,
            accountRequest,
            permissionsRequest,
            authenticatedUserRequest,
            registrationRequest,
            statsRequest,
            statusesRequest;

        beforeEach(function() {
            setNow('2019-12-19T12:10:06');

            tester = new Tester(options);

            tester.input.withFieldLabel('Логин').fill('botusharova');
            tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

            tester.button('Войти').click();

            tester.loginRequest().receiveResponse();
            tester.accountRequest().receiveResponse();

            const requests = ajax.inAnyOrder();

            reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
            const reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                authCheckRequest = tester.authCheckRequest().expectToBeSent(requests),
                secondAccountRequest = tester.accountRequest().expectToBeSent(requests);

            requests.expectToBeSent();

            reportsListRequest.noData().receiveResponse();
            reportTypesRequest.receiveResponse();
            secondAccountRequest.receiveResponse();
            reportGroupsRequest.receiveResponse();

            tester.masterInfoMessage().receive();
            tester.slavesNotification().expectToBeSent();
            tester.slavesNotification().additional().expectToBeSent();

            tester.notificationChannel().tellIsLeader().expectToBeSent();
            tester.masterInfoMessage().tellIsLeader().expectToBeSent();

            tester.notificationChannel().applyLeader().expectToBeSent();
            tester.notificationChannel().applyLeader().expectToBeSent();

            authCheckRequest.receiveResponse();
            statusesRequest = tester.statusesRequest().expectToBeSent();

            settingsRequest = tester.settingsRequest().expectToBeSent();
            tester.talkOptionsRequest().receiveResponse();
            tester.permissionsRequest().receiveResponse();

            notificationTester.grantPermission();

            settingsRequest.receiveResponse();
            tester.slavesNotification().twoChannels().enabled().expectToBeSent();

            tester.othersNotification().widgetStateUpdate().expectToBeSent();
            tester.othersNotification().updateSettings().shouldNotPlayCallEndingSignal().expectToBeSent();

            tester.connectEventsWebSocket();
            tester.slavesNotification().twoChannels().enabled().softphoneServerConnected().expectToBeSent();

            tester.connectSIPWebSocket();
            tester.slavesNotification().twoChannels().webRTCServerConnected().softphoneServerConnected().
                expectToBeSent();

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
            tester.slavesNotification().twoChannels().available().userDataFetched().expectToBeSent();

            statusesRequest.receiveResponse();
        });

        it('Кнопка софтфона видима.', function() {
            tester.button('Софтфон').expectToBeVisible();
        });
    });
    describe('Я уже аутентифицирован. Открываю новый личный кабинет.', function() {
        let authenticatedUserRequest,
            tester;

        beforeEach(function() {
            tester = new Tester({
                ...options,
                isAlreadyAuthenticated: true
            });

            tester.accountRequest().receiveResponse();
            tester.notificationChannel().applyLeader().expectToBeSent();

            const requests = ajax.inAnyOrder();

            const reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests),
                reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                authCheckRequest = tester.authCheckRequest().expectToBeSent(requests),
                secondAccountRequest = tester.accountRequest().expectToBeSent(requests);

            requests.expectToBeSent();

            reportGroupsRequest.receiveResponse();
            reportsListRequest.receiveResponse();
            reportTypesRequest.receiveResponse();
            secondAccountRequest.receiveResponse();

            tester.masterInfoMessage().receive();
            tester.slavesNotification().expectToBeSent();
            tester.slavesNotification().additional().expectToBeSent();

            tester.masterInfoMessage().tellIsLeader().expectToBeSent();
            tester.notificationChannel().tellIsLeader().expectToBeSent();
            tester.notificationChannel().applyLeader().expectToBeSent();

            authCheckRequest.receiveResponse();
            tester.statusesRequest().receiveResponse();

            tester.settingsRequest().receiveResponse();
            tester.slavesNotification().twoChannels().enabled().expectToBeSent();

            tester.othersNotification().widgetStateUpdate().expectToBeSent();
            tester.othersNotification().updateSettings().shouldNotPlayCallEndingSignal().expectToBeSent();

            notificationTester.grantPermission();
            tester.talkOptionsRequest().receiveResponse();
            tester.permissionsRequest().receiveResponse();

            tester.connectEventsWebSocket();
            tester.slavesNotification().twoChannels().enabled().softphoneServerConnected().expectToBeSent();

            tester.connectSIPWebSocket();
            tester.slavesNotification().twoChannels().softphoneServerConnected().webRTCServerConnected().
                expectToBeSent();

            authenticatedUserRequest = tester.authenticatedUserRequest().expectToBeSent();

            tester.registrationRequest().receiveResponse();
            tester.slavesNotification().twoChannels().softphoneServerConnected().webRTCServerConnected().registered().
                expectToBeSent();

            tester.allowMediaInput();
            tester.slavesNotification().twoChannels().available().expectToBeSent();

            authenticatedUserRequest.receiveResponse();
            tester.slavesNotification().userDataFetched().twoChannels().available().expectToBeSent();
        });
            
        describe('Получено событие изменения сотрудника. Статус сотрудника изменился.', function() {
            let notificationOfUserStateChanging;

            beforeEach(function() {
                notificationOfUserStateChanging = tester.notificationOfUserStateChanging().anotherStatus();
            });

            it('Структура некорректна. Отображен новый статус сотрудника.', function() {
                notificationOfUserStateChanging.wrongStructure().receive();

                tester.slavesNotification().
                    userDataFetched().
                    twoChannels().
                    available().
                    anotherStatus().
                    expectToBeSent();

                tester.body.expectTextContentToHaveSubstring('karadimova Нет на месте');
            });
            it('Структура корректна. Отображен новый статус сотрудника.', function() {
                notificationOfUserStateChanging.receive();

                tester.slavesNotification().
                    userDataFetched().
                    twoChannels().
                    available().
                    anotherStatus().
                    expectToBeSent();

                tester.body.expectTextContentToHaveSubstring('karadimova Нет на месте');
            });
        });
        it('Отображен статус сотрудника.', function() {
            tester.body.expectTextContentToHaveSubstring('karadimova Не беспокоить');
        });
    });
    it('Ранее софтфон был развернут. Софтфон развернут.', function() {
        localStorage.setItem('isSoftphoneHigh', true);
            
        setNow('2019-12-19T12:10:06');

        const tester = new Tester(options);

        tester.input.withFieldLabel('Логин').fill('botusharova');
        tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

        tester.button('Войти').click();

        tester.loginRequest().receiveResponse();
        tester.accountRequest().receiveResponse();

        tester.notificationChannel().applyLeader().expectToBeSent();

        const requests = ajax.inAnyOrder();

        const reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests),
            reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
            reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
            authCheckRequest = tester.authCheckRequest().expectToBeSent(requests),
            accountRequest = tester.accountRequest().expectToBeSent(requests);

        requests.expectToBeSent();

        reportsListRequest.receiveResponse();
        reportTypesRequest.receiveResponse();
        accountRequest.receiveResponse();
        reportGroupsRequest.receiveResponse();

        tester.masterInfoMessage().receive();
        tester.slavesNotification().expectToBeSent();
        tester.slavesNotification().additional().expectToBeSent();

        tester.notificationChannel().tellIsLeader().expectToBeSent();
        tester.masterInfoMessage().tellIsLeader().expectToBeSent();
        tester.notificationChannel().applyLeader().expectToBeSent();

        authCheckRequest.receiveResponse();
        tester.statusesRequest().receiveResponse();
        
        tester.settingsRequest().secondRingtone().isNeedDisconnectSignal().receiveResponse();
        tester.slavesNotification().twoChannels().enabled().expectToBeSent();

        tester.othersNotification().widgetStateUpdate().expectToBeSent();
        tester.othersNotification().updateSettings().shouldPlayCallEndingSignal().anotherCustomRingtone().
            expectToBeSent();

        notificationTester.grantPermission();
        tester.talkOptionsRequest().receiveResponse();
        tester.permissionsRequest().receiveResponse();

        tester.ringtoneRequest().receiveResponse();
        fileReader.accomplishFileLoading(tester.secondRingtone);
        mediaStreamsTester.setIsAbleToPlayThough('data:audio/wav;base64,' + tester.secondRingtone);

        tester.connectEventsWebSocket();
        tester.slavesNotification().twoChannels().enabled().softphoneServerConnected().expectToBeSent();

        tester.connectSIPWebSocket();
        tester.slavesNotification().twoChannels().webRTCServerConnected().softphoneServerConnected().expectToBeSent();

        tester.authenticatedUserRequest().receiveResponse();
        tester.slavesNotification().userDataFetched().twoChannels().webRTCServerConnected().softphoneServerConnected().
            expectToBeSent();

        tester.registrationRequest().receiveResponse();
        tester.slavesNotification().userDataFetched().twoChannels().webRTCServerConnected().softphoneServerConnected().
            registered().expectToBeSent();

        tester.allowMediaInput();
        tester.slavesNotification().userDataFetched().twoChannels().available().expectToBeSent();

        tester.button('Софтфон').click();
        tester.slavesNotification().additional().visible().expectToBeSent();

        tester.softphone.expectToBeExpanded();
        tester.phoneField.expectToBeVisible();
    });
    it('Ранее софтфон был свернут. Софтфон свернут.', function() {
        localStorage.setItem('isSoftphoneHigh', false);
            
        setNow('2019-12-19T12:10:06');

        const tester = new Tester(options);

        tester.input.withFieldLabel('Логин').fill('botusharova');
        tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

        tester.button('Войти').click();

        tester.loginRequest().receiveResponse();
        tester.accountRequest().receiveResponse();

        tester.notificationChannel().applyLeader().expectToBeSent();

        const requests = ajax.inAnyOrder();

        const reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests),
            reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
            reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
            authCheckRequest = tester.authCheckRequest().expectToBeSent(requests),
            accountRequest = tester.accountRequest().expectToBeSent(requests);

        requests.expectToBeSent();

        reportsListRequest.receiveResponse();
        reportTypesRequest.receiveResponse();
        accountRequest.receiveResponse();
        reportGroupsRequest.receiveResponse();

        tester.masterInfoMessage().receive();
        tester.slavesNotification().expectToBeSent();
        tester.slavesNotification().additional().expectToBeSent();

        tester.notificationChannel().tellIsLeader().expectToBeSent();
        tester.masterInfoMessage().tellIsLeader().expectToBeSent();
        tester.notificationChannel().applyLeader().expectToBeSent();

        authCheckRequest.receiveResponse();
        tester.statusesRequest().receiveResponse();

        tester.settingsRequest().secondRingtone().isNeedDisconnectSignal().receiveResponse();
        tester.slavesNotification().twoChannels().enabled().expectToBeSent();

        tester.othersNotification().widgetStateUpdate().expectToBeSent();
        tester.othersNotification().updateSettings().shouldPlayCallEndingSignal().anotherCustomRingtone().
            expectToBeSent();

        notificationTester.grantPermission();
        tester.talkOptionsRequest().receiveResponse();
        tester.permissionsRequest().receiveResponse();

        tester.ringtoneRequest().receiveResponse();
        fileReader.accomplishFileLoading(tester.secondRingtone);
        mediaStreamsTester.setIsAbleToPlayThough('data:audio/wav;base64,' + tester.secondRingtone);

        tester.connectEventsWebSocket();
        tester.slavesNotification().twoChannels().enabled().softphoneServerConnected().expectToBeSent();

        tester.connectSIPWebSocket();
        tester.slavesNotification().twoChannels().webRTCServerConnected().softphoneServerConnected().expectToBeSent();

        tester.authenticatedUserRequest().receiveResponse();
        tester.slavesNotification().userDataFetched().twoChannels().webRTCServerConnected().softphoneServerConnected().
            expectToBeSent();

        tester.registrationRequest().receiveResponse();
        tester.slavesNotification().userDataFetched().twoChannels().webRTCServerConnected().registered().
            softphoneServerConnected().expectToBeSent();

        tester.allowMediaInput();
        tester.slavesNotification().userDataFetched().twoChannels().available().expectToBeSent();

        tester.button('Софтфон').click();
        tester.slavesNotification().additional().visible().expectToBeSent();

        tester.softphone.expectToBeCollapsed();
        tester.phoneField.expectToBeVisible();
    });
    it('Идентификатор браузера сохранен. Открываю софтфон. Идентификатор браузера передается в запросах.', function() {
        localStorage.setItem('uis-webrtc-browser-id', '2b5af1d8-108c-4527-aceb-c93614b8a0da');
            
        setNow('2019-12-19T12:10:06');

        const tester = new Tester(options);

        tester.input.withFieldLabel('Логин').fill('botusharova');
        tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

        tester.button('Войти').click();

        tester.loginRequest().receiveResponse();
        tester.accountRequest().receiveResponse();

        tester.notificationChannel().applyLeader().expectToBeSent();

        const requests = ajax.inAnyOrder();

        const reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests),
            reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
            reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
            authCheckRequest = tester.authCheckRequest().knownWidgetId().expectToBeSent(requests),
            accountRequest = tester.accountRequest().expectToBeSent(requests);

        requests.expectToBeSent();

        reportsListRequest.receiveResponse();
        reportTypesRequest.receiveResponse();
        accountRequest.receiveResponse();
        reportGroupsRequest.receiveResponse();

        tester.masterInfoMessage().receive();
        tester.slavesNotification().expectToBeSent();
        tester.slavesNotification().additional().expectToBeSent();

        tester.notificationChannel().tellIsLeader().expectToBeSent();
        tester.masterInfoMessage().tellIsLeader().expectToBeSent();
        tester.notificationChannel().applyLeader().expectToBeSent();

        authCheckRequest.receiveResponse();
        tester.statusesRequest().receiveResponse();

        tester.settingsRequest().secondRingtone().isNeedDisconnectSignal().receiveResponse();
        tester.slavesNotification().twoChannels().enabled().expectToBeSent();

        tester.othersNotification().widgetStateUpdate().expectToBeSent();
        tester.othersNotification().updateSettings().shouldPlayCallEndingSignal().anotherCustomRingtone().
            expectToBeSent();

        notificationTester.grantPermission();
        tester.talkOptionsRequest().receiveResponse();
        tester.permissionsRequest().receiveResponse();

        tester.ringtoneRequest().receiveResponse();
        fileReader.accomplishFileLoading(tester.secondRingtone);
        mediaStreamsTester.setIsAbleToPlayThough('data:audio/wav;base64,' + tester.secondRingtone);

        tester.connectEventsWebSocket();
        tester.slavesNotification().twoChannels().enabled().softphoneServerConnected().expectToBeSent();

        tester.connectSIPWebSocket();
        tester.slavesNotification().twoChannels().webRTCServerConnected().softphoneServerConnected().expectToBeSent();

        tester.authenticatedUserRequest().receiveResponse();
        tester.slavesNotification().userDataFetched().twoChannels().webRTCServerConnected().softphoneServerConnected().
            expectToBeSent();

        tester.registrationRequest().receiveResponse();
        tester.slavesNotification().userDataFetched().twoChannels().webRTCServerConnected().registered().
            softphoneServerConnected().expectToBeSent();

        tester.allowMediaInput();
        tester.slavesNotification().userDataFetched().twoChannels().available().expectToBeSent();
    });
});
