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

    describe('Я уже аутентифицирован. Открываю новый личный кабинет.', function() {
        let authenticatedUserRequest,
            ticketsContactsRequest,
            tester;

        beforeEach(function() {
            tester = new Tester({
                ...options,
                isAlreadyAuthenticated: true
            });

            tester.accountRequest().receiveResponse();
            tester.notificationChannel().applyLeader().expectToBeSent();

            const requests = ajax.inAnyOrder();

            ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(requests);
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
            tester.slavesNotification().additional().expectToBeSent();
            tester.slavesNotification().expectToBeSent();

            tester.employeesWebSocket.connect();
            tester.employeesInitMessage().expectToBeSent();

            tester.notificationChannel().tellIsLeader().expectToBeSent();
            tester.masterInfoMessage().tellIsLeader().expectToBeSent();
            tester.notificationChannel().applyLeader().expectToBeSent();

            authCheckRequest.receiveResponse();
            tester.talkOptionsRequest().receiveResponse();
            tester.permissionsRequest().receiveResponse();
            tester.settingsRequest().receiveResponse();
            tester.employeeStatusesRequest().receiveResponse();

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

            tester.employeeRequest().receiveResponse();
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
        });
            
        describe('Получено событие изменения сотрудника. Статус сотрудника изменился.', function() {
            let employeeChangedEvent;

            beforeEach(function() {
                employeeChangedEvent = tester.employeeChangedEvent().secondStatus();
                ticketsContactsRequest.receiveResponse();
            });

            it('Структура некорректна. Отображен новый статус сотрудника.', function() {
                employeeChangedEvent.wrongStructure().receive();

                tester.employeeChangedEvent().
                    secondStatus().
                    wrongStructure().
                    slavesNotification().
                    expectToBeSent();

                tester.slavesNotification().
                    userDataFetched().
                    twoChannels().
                    available().
                    anotherStatus().
                    expectToBeSent();

                tester.body.expectTextContentToHaveSubstring('karadimova Нет на месте');
            });
            it('Структура корректна. Отображен новый статус сотрудника.', function() {
                employeeChangedEvent.receive();

                tester.employeeChangedEvent().
                    secondStatus().
                    slavesNotification().
                    expectToBeSent();

                tester.slavesNotification().
                    userDataFetched().
                    twoChannels().
                    available().
                    anotherStatus().
                    expectToBeSent();

                tester.body.expectTextContentToHaveSubstring('karadimova Нет на месте');
            });
        });
        it('Токен авторизации в инфопине истек.', function() {
            ticketsContactsRequest.accessTokenExpired().receiveResponse();
            tester.refreshRequest().receiveResponse();

            tester.ticketsContactsRequest().receiveResponse();
        });
        it('Отображен статус сотрудника.', function() {
            tester.body.expectTextContentToHaveSubstring('karadimova Не беспокоить');
        });
    });
    describe('Открываю лк. Ни лидген, ни РМО, ни аналитика не доступны.', function() {
        let tester,
            reportGroupsRequest,
            settingsRequest,
            accountRequest,
            permissionsRequest,
            authenticatedUserRequest,
            registrationRequest,
            statsRequest,
            employeeStatusesRequest;

        beforeEach(function() {
            setNow('2019-12-19T12:10:06');

            tester = new Tester(options);

            tester.input.withFieldLabel('Логин').fill('botusharova');
            tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');
        });

        describe('Нажимаю на кнопку входа.', function() {
            beforeEach(function() {
                tester.button('Войти').click();

                tester.loginRequest().receiveResponse();
                tester.accountRequest().receiveResponse();

                const requests = ajax.inAnyOrder();

                reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
                const reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                    ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(requests),
                    reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                    authCheckRequest = tester.authCheckRequest().expectToBeSent(requests),
                    secondAccountRequest = tester.accountRequest().expectToBeSent(requests);

                requests.expectToBeSent();

                ticketsContactsRequest.receiveResponse();
                reportsListRequest.noData().receiveResponse();
                reportTypesRequest.receiveResponse();
                secondAccountRequest.receiveResponse();
                reportGroupsRequest.receiveResponse();

                tester.masterInfoMessage().receive();
                tester.slavesNotification().additional().expectToBeSent();
                tester.slavesNotification().expectToBeSent();

                tester.employeesWebSocket.connect();
                tester.employeesInitMessage().expectToBeSent();

                tester.notificationChannel().tellIsLeader().expectToBeSent();
                tester.masterInfoMessage().tellIsLeader().expectToBeSent();
                tester.notificationChannel().applyLeader().expectToBeSent();
                tester.notificationChannel().applyLeader().expectToBeSent();

                authCheckRequest.receiveResponse();
                tester.talkOptionsRequest().receiveResponse();
                tester.permissionsRequest().receiveResponse();
                tester.settingsRequest().receiveResponse();
                employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent();

                notificationTester.grantPermission();

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

                tester.employeeRequest().receiveResponse();
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

                employeeStatusesRequest.receiveResponse();
            });

            it('Кнопка софтфона видима.', function() {
                tester.button('Софтфон').expectToBeVisible();
            });
        });
        it(
            'Помещаую курсор над иконкой подсказки. Отображено сообщение о том, что пароль не сохранится в ' +
            'приложении.',
        function() {
            tester.labelHelp.putMouseOver();
            tester.tooltip.expectToHaveTextContent('Пароль не сохранится в браузере');
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
            ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(requests),
            reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
            reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
            authCheckRequest = tester.authCheckRequest().expectToBeSent(requests),
            accountRequest = tester.accountRequest().expectToBeSent(requests);

        requests.expectToBeSent();

        ticketsContactsRequest.receiveResponse();
        reportsListRequest.receiveResponse();
        reportTypesRequest.receiveResponse();
        accountRequest.receiveResponse();
        reportGroupsRequest.receiveResponse();

        tester.masterInfoMessage().receive();
        tester.slavesNotification().additional().expectToBeSent();
        tester.slavesNotification().expectToBeSent();

        tester.employeesWebSocket.connect();
        tester.employeesInitMessage().expectToBeSent();

        tester.notificationChannel().tellIsLeader().expectToBeSent();
        tester.masterInfoMessage().tellIsLeader().expectToBeSent();
        tester.notificationChannel().applyLeader().expectToBeSent();

        authCheckRequest.receiveResponse();
        tester.talkOptionsRequest().receiveResponse();
        tester.permissionsRequest().receiveResponse();
        
        tester.settingsRequest().
            secondRingtone().
            isNeedDisconnectSignal().
            receiveResponse();

        tester.employeeStatusesRequest().receiveResponse();

        tester.slavesNotification().
            twoChannels().
            enabled().
            expectToBeSent();

        tester.othersNotification().
            updateSettings().
            shouldPlayCallEndingSignal().
            anotherCustomRingtone().
            expectToBeSent();

        notificationTester.grantPermission();

        tester.ringtoneRequest().receiveResponse();
        fileReader.accomplishFileLoading(tester.secondRingtone);
        mediaStreamsTester.setIsAbleToPlayThough('data:audio/wav;base64,' + tester.secondRingtone);

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

        tester.employeeRequest().receiveResponse();
        tester.authenticatedUserRequest().receiveResponse();

        tester.slavesNotification().
            userDataFetched().
            twoChannels().
            webRTCServerConnected().
            softphoneServerConnected().
            expectToBeSent();

        tester.registrationRequest().receiveResponse();

        tester.slavesNotification().
            userDataFetched().
            twoChannels().
            webRTCServerConnected().
            softphoneServerConnected().
            registered().
            expectToBeSent();

        tester.allowMediaInput();

        tester.slavesNotification().
            userDataFetched().
            twoChannels().
            available().
            expectToBeSent();

        tester.button('Софтфон').click();

        tester.slavesNotification().
            additional().
            visible().
            expectToBeSent();

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
            ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(requests),
            reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
            reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
            authCheckRequest = tester.authCheckRequest().expectToBeSent(requests),
            accountRequest = tester.accountRequest().expectToBeSent(requests);

        requests.expectToBeSent();

        ticketsContactsRequest.receiveResponse();
        reportsListRequest.receiveResponse();
        reportTypesRequest.receiveResponse();
        accountRequest.receiveResponse();
        reportGroupsRequest.receiveResponse();

        tester.masterInfoMessage().receive();
        tester.slavesNotification().additional().expectToBeSent();
        tester.slavesNotification().expectToBeSent();

        tester.employeesWebSocket.connect();
        tester.employeesInitMessage().expectToBeSent();

        tester.notificationChannel().tellIsLeader().expectToBeSent();
        tester.masterInfoMessage().tellIsLeader().expectToBeSent();
        tester.notificationChannel().applyLeader().expectToBeSent();

        authCheckRequest.receiveResponse();
        tester.talkOptionsRequest().receiveResponse();
        tester.permissionsRequest().receiveResponse();

        tester.settingsRequest().
            secondRingtone().
            isNeedDisconnectSignal().
            receiveResponse();

        tester.employeeStatusesRequest().receiveResponse();

        tester.slavesNotification().
            twoChannels().
            enabled().
            expectToBeSent();

        tester.othersNotification().
            updateSettings().
            shouldPlayCallEndingSignal().
            anotherCustomRingtone().
            expectToBeSent();

        notificationTester.grantPermission();

        tester.ringtoneRequest().receiveResponse();
        fileReader.accomplishFileLoading(tester.secondRingtone);
        mediaStreamsTester.setIsAbleToPlayThough('data:audio/wav;base64,' + tester.secondRingtone);

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

        tester.employeeRequest().receiveResponse();
        tester.authenticatedUserRequest().receiveResponse();

        tester.slavesNotification().
            userDataFetched().
            twoChannels().
            webRTCServerConnected().
            softphoneServerConnected().
            expectToBeSent();

        tester.registrationRequest().receiveResponse();

        tester.slavesNotification().
            userDataFetched().
            twoChannels().
            webRTCServerConnected().
            registered().
            softphoneServerConnected().
            expectToBeSent();

        tester.allowMediaInput();

        tester.slavesNotification().
            userDataFetched().
            twoChannels().
            available().
            expectToBeSent();

        tester.button('Софтфон').click();

        tester.slavesNotification().
            additional().
            visible().
            expectToBeSent();

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
            ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(requests),
            reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
            reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
            authCheckRequest = tester.authCheckRequest().knownWidgetId().expectToBeSent(requests),
            accountRequest = tester.accountRequest().expectToBeSent(requests);

        requests.expectToBeSent();

        ticketsContactsRequest.receiveResponse();
        reportsListRequest.receiveResponse();
        reportTypesRequest.receiveResponse();
        accountRequest.receiveResponse();
        reportGroupsRequest.receiveResponse();

        tester.masterInfoMessage().receive();
        tester.slavesNotification().additional().expectToBeSent();
        tester.slavesNotification().expectToBeSent();

        tester.employeesWebSocket.connect();
        tester.employeesInitMessage().expectToBeSent();

        tester.notificationChannel().tellIsLeader().expectToBeSent();
        tester.masterInfoMessage().tellIsLeader().expectToBeSent();
        tester.notificationChannel().applyLeader().expectToBeSent();

        authCheckRequest.receiveResponse();
        tester.talkOptionsRequest().receiveResponse();
        tester.permissionsRequest().receiveResponse();

        tester.settingsRequest().
            secondRingtone().
            isNeedDisconnectSignal().
            receiveResponse();

        tester.employeeStatusesRequest().receiveResponse();

        tester.slavesNotification().
            twoChannels().
            enabled().
            expectToBeSent();

        tester.othersNotification().
            updateSettings().
            shouldPlayCallEndingSignal().
            anotherCustomRingtone().
            expectToBeSent();

        notificationTester.grantPermission();

        tester.ringtoneRequest().receiveResponse();
        fileReader.accomplishFileLoading(tester.secondRingtone);
        mediaStreamsTester.setIsAbleToPlayThough('data:audio/wav;base64,' + tester.secondRingtone);

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

        tester.employeeRequest().receiveResponse();
        tester.authenticatedUserRequest().receiveResponse();

        tester.slavesNotification().
            userDataFetched().
            twoChannels().
            webRTCServerConnected().
            softphoneServerConnected().
            expectToBeSent();

        tester.registrationRequest().receiveResponse();

        tester.slavesNotification().
            userDataFetched().
            twoChannels().
            webRTCServerConnected().
            registered().
            softphoneServerConnected().
            expectToBeSent();

        tester.allowMediaInput();
        tester.slavesNotification().userDataFetched().twoChannels().available().expectToBeSent();
    });
    it('Получен фичефлаг нового бэкенда софтфона. Используется новый бекэнд софтфона.', function() {
        let tester,
            reportGroupsRequest,
            settingsRequest,
            accountRequest,
            permissionsRequest,
            authCheckRequest;

        setNow('2019-12-19T12:10:06');

        tester = new Tester({
            ...options,
            softphoneHost: '$REACT_APP_NEW_SOFTPHONE_BACKEND_HOST',
        });

        tester.input.withFieldLabel('Логин').fill('botusharova');
        tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

        tester.button('Войти').click();

        tester.loginRequest().receiveResponse();
        tester.accountRequest().newSoftphoneBackendFeatureFlagEnabled().receiveResponse();

        tester.notificationChannel().applyLeader().expectToBeSent();

        const requests = ajax.inAnyOrder();

        reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
        const reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
            ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(requests),
            reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
            secondAccountRequest = tester.accountRequest().expectToBeSent(requests);
        authCheckRequest = tester.authCheckRequest().expectToBeSent(requests);

        requests.expectToBeSent();

        ticketsContactsRequest.receiveResponse();
        reportsListRequest.receiveResponse();
        reportTypesRequest.receiveResponse();
        secondAccountRequest.receiveResponse();

        tester.masterInfoMessage().receive();
        tester.slavesNotification().additional().expectToBeSent();
        tester.slavesNotification().expectToBeSent();

        tester.employeesWebSocket.connect();
        tester.employeesInitMessage().expectToBeSent();

        tester.notificationChannel().tellIsLeader().expectToBeSent();
        tester.masterInfoMessage().tellIsLeader().expectToBeSent();
        tester.notificationChannel().applyLeader().expectToBeSent();

        authCheckRequest.receiveResponse();
        tester.talkOptionsRequest().receiveResponse();
        tester.permissionsRequest().receiveResponse();
        tester.settingsRequest().receiveResponse();
        tester.employeeStatusesRequest().receiveResponse(); 

        notificationTester.grantPermission();

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

        tester.employeeRequest().receiveResponse();
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

        reportGroupsRequest.receiveResponse();
        registrationRequest.receiveResponse();

        tester.slavesNotification().
            twoChannels().
            available().
            userDataFetched().
            expectToBeSent();
    });
});
