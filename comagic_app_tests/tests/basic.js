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
                employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(requests),
                employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(requests),
                employeeRequest = tester.employeeRequest().expectToBeSent(requests);

            requests.expectToBeSent();

            reportGroupsRequest.receiveResponse();
            reportsListRequest.receiveResponse();
            reportTypesRequest.receiveResponse();
            employeeSettingsRequest.receiveResponse();
            employeeStatusesRequest.receiveResponse();
            employeeRequest.receiveResponse();

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

            tester.button('Софтфон').click();

            tester.slavesNotification().
                additional().
                visible().
                expectToBeSent();
        });
            
        describe('Проходит некоторое время. Отправлен пинг.', function() {
            beforeEach(function() {
                tester.spendTime(5000);
                tester.expectPingToBeSent();

                tester.employeesPing().expectToBeSent();
                tester.employeesPing().receive();
            });

            describe('Проходит большой промежуток времени. Понг не получен.', function() {
                beforeEach(function() {
                    tester.spendTime(2000);

                    tester.slavesNotification().
                        twoChannels().
                        microphoneAccessGranted().
                        webRTCServerConnected().
                        userDataFetched().
                        registered().
                        expectToBeSent();
                });

                describe('Пинг отправляется еще несколько раз с меньшим интервалом.', function() {
                    beforeEach(function() {
                        // 1-ая попытка
                        spendTime(1000);
                        Promise.runAll(false, true);
                        tester.expectPingToBeSent();

                        // 2-ая попытка
                        spendTime(1001);
                        Promise.runAll(false, true);
                        tester.expectPingToBeSent();

                        // 3-ая попытка
                        spendTime(1003);
                        Promise.runAll(false, true);
                        tester.expectPingToBeSent();

                        tester.employeesPing().expectToBeSent();
                        tester.employeesPing().receive();

                        // 4-ая попытка
                        spendTime(1009);
                        Promise.runAll(false, true);
                        tester.expectPingToBeSent();

                        // 5-ая попытка
                        spendTime(1026);
                        Promise.runAll(false, true);
                        tester.expectPingToBeSent();
                    });

                    describe('Пинг отправляется еще несколько раз.', function() {
                        beforeEach(function() {
                            // 6-ая попытка
                            spendTime(1073);
                            Promise.runAll(false, true);
                            tester.expectPingToBeSent();

                            // 7-ая попытка
                            spendTime(1199);
                            Promise.runAll(false, true);
                            tester.expectPingToBeSent();

                            // 8-ая попытка
                            spendTime(1541);
                            Promise.runAll(false, true);
                            tester.expectPingToBeSent();

                            tester.employeesPing().expectToBeSent();
                            tester.employeesPing().receive();

                            // 9-ая попытка
                            spendTime(2000);
                            spendTime(471);
                            Promise.runAll(false, true);
                            tester.expectPingToBeSent();
                        });

                        describe('Проходит большой промежуток времени. Понг не получен.', function() {
                            beforeEach(function() {
                                tester.spendTime(2000);
                                tester.spendTime(1000);

                                tester.employeesPing().expectToBeSent();
                                tester.employeesPing().receive();
                            });

                            describe('Отправлен пинг.', function() {
                                beforeEach(function() {
                                    // 10-ая попытка
                                    tester.spendTime(2000);
                                    tester.expectPingToBeSent();
                                });

                                describe(
                                    'Проходит большой промежуток времени. Понг не получен. ' +
                                    'Разрывается соединения с веб-сокетом.',
                                function() {
                                    beforeEach(function() {
                                        tester.spendTime(2000);
                                        tester.eventsWebSocket.finishDisconnecting();

                                        tester.spendTime(1000);

                                        tester.employeesPing().expectToBeSent();
                                        tester.employeesPing().receive();
                                    });

                                    it(
                                        'Вебсокет сервера интеграции подключен повторно. Статус сотрудника изменен. ' +
                                        'Вкладка является мастером. Отправлен пинг. Понг не получен вовремя. Снова ' +
                                        'дается несколько попыток получить понг.',
                                    function() {
                                        tester.connectEventsWebSocket(1);

                                        tester.slavesNotification().
                                            twoChannels().
                                            available().
                                            expectToBeSent();

                                        tester.authenticatedUserRequest().
                                            anotherStatus().
                                            receiveResponse();

                                        tester.slavesNotification().
                                            twoChannels().
                                            available().
                                            anotherStatus().
                                            expectToBeSent();

                                        tester.spendTime(5000);
                                        tester.expectPingToBeSent();

                                        tester.employeesPing().expectToBeSent();
                                        tester.employeesPing().receive();

                                        tester.spendTime(2000);

                                        tester.slavesNotification().
                                            twoChannels().
                                            microphoneAccessGranted().
                                            webRTCServerConnected().
                                            anotherStatus().
                                            userDataFetched().
                                            registered().
                                            expectToBeSent();

                                        tester.spendTime(1000);
                                        
                                        // 1-ая попытка
                                        spendTime(1000);
                                        Promise.runAll(false, true);
                                        tester.expectPingToBeSent();

                                        // 2-ая попытка
                                        spendTime(1001);
                                        Promise.runAll(false, true);
                                        tester.expectPingToBeSent();

                                        tester.employeesPing().expectToBeSent();
                                        tester.employeesPing().receive();

                                        // 3-ая попытка
                                        spendTime(1003);
                                        Promise.runAll(false, true);
                                        tester.expectPingToBeSent();

                                        // 4-ая попытка
                                        spendTime(1009);
                                        Promise.runAll(false, true);
                                        tester.expectPingToBeSent();

                                        // 5-ая попытка
                                        spendTime(1026);
                                        Promise.runAll(false, true);
                                        tester.expectPingToBeSent();
                                        
                                        // 6-ая попытка
                                        spendTime(1073);
                                        Promise.runAll(false, true);
                                        tester.expectPingToBeSent();

                                        // 7-ая попытка
                                        spendTime(1199);
                                        Promise.runAll(false, true);
                                        tester.expectPingToBeSent();

                                        tester.employeesPing().expectToBeSent();
                                        tester.employeesPing().receive();

                                        // 8-ая попытка
                                        spendTime(1541);
                                        Promise.runAll(false, true);
                                        tester.expectPingToBeSent();

                                        // 9-ая попытка
                                        spendTime(2000);
                                        spendTime(471);
                                        Promise.runAll(false, true);
                                        tester.expectPingToBeSent();

                                        spendTime(2000);
                                        spendTime(1000);
                                        Promise.runAll(false, true);

                                        tester.employeesPing().expectToBeSent();
                                        tester.employeesPing().receive();

                                        // 10-ая попытка
                                        spendTime(2000);
                                        tester.expectPingToBeSent();

                                        tester.spendTime(2000);
                                        tester.eventsWebSocket.finishDisconnecting();

                                        tester.employeesPing().expectToBeSent();
                                        tester.employeesPing().receive();

                                        tester.spendTime(1000);
                                        tester.discconnectEventsWebSocket(2);
                                    });
                                    it(
                                        'Не удалось повторно подключиться к вебсокету. WebRTC-сокет ' +
                                        'закрывается. Интервал попыток повторного подключения ' +
                                        'растет, пока не достигнет максимального значения. Наконец ' +
                                        'удалось подключиться к вебсокету.',
                                    function() {
                                        tester.discconnectEventsWebSocket(1);

                                        tester.spendTime(1001);
                                        tester.discconnectEventsWebSocket(2);

                                        tester.spendTime(1003);
                                        tester.discconnectEventsWebSocket(3);

                                        tester.spendTime(1009);
                                        tester.discconnectEventsWebSocket(4);

                                        tester.spendTime(1026);
                                        tester.discconnectEventsWebSocket(5);

                                        tester.spendTime(1073);
                                        tester.discconnectEventsWebSocket(6);

                                        tester.employeesPing().expectToBeSent();
                                        tester.employeesPing().receive();

                                        tester.spendTime(1199);
                                        tester.discconnectEventsWebSocket(7);

                                        tester.spendTime(1541);
                                        tester.discconnectEventsWebSocket(8);

                                        tester.spendTime(2471);
                                        tester.discconnectEventsWebSocket(9);

                                        tester.employeesPing().expectToBeSent();
                                        tester.employeesPing().receive();

                                        tester.spendTime(5000);
                                        tester.discconnectEventsWebSocket(10);

                                        tester.employeesPing().expectToBeSent();
                                        tester.employeesPing().receive();

                                        tester.spendTime(5000);
                                        tester.connectEventsWebSocket(11);

                                        tester.employeesPing().expectToBeSent();
                                        tester.employeesPing().receive();

                                        tester.authenticatedUserRequest().receiveResponse();

                                        tester.slavesNotification().
                                            twoChannels().
                                            available().
                                            expectToBeSent();

                                        tester.spendTime(5000);
                                        tester.expectPingToBeSent();

                                        tester.employeesPing().expectToBeSent();
                                        tester.employeesPing().receive();

                                        tester.callsHistoryButton.expectNotToHaveClass('cmg-button-disabled');
                                    });
                                });
                                it(
                                    'Виджет открыт в другом браузере. SIP-сокет закрыт. Попытка ' +
                                    'повторного подключения не производится.',
                                function() {
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

                                    tester.spendTime(2000);
                                    tester.webrtcWebsocket.finishDisconnecting();

                                    tester.spendTime(1000);

                                    tester.employeesPing().expectToBeSent();
                                    tester.employeesPing().receive();
                                });
                                it(
                                    'Проходит небольшой промежуток времени. Понг получен. Сообщение ' +
                                    'о том, что в данный момент устанавливается соединение с ' +
                                    'сервером не отображается. Кнопки доступны.',
                                function() {
                                    tester.spendTime(1000);
                                    tester.receivePong();

                                    tester.slavesNotification().
                                        twoChannels().
                                        available().
                                        expectToBeSent();

                                    tester.authenticatedUserRequest().receiveResponse();

                                    tester.callsHistoryButton.
                                        expectNotToHaveClass('cmg-button-disabled');

                                    tester.softphone.expectTextContentNotToHaveSubstring(
                                        'Устанавливается соединение...'
                                    );
                                });
                            });
                            it(
                                'Отображается сообщение о том, что в данный момент устанавливается ' +
                                'соединение с сервером.',
                            function() {
                                tester.callsHistoryButton.expectToHaveClass('cmg-button-disabled');
                                tester.softphone.expectToHaveTextContent('Устанавливается соединение...');
                            });
                        });
                        describe(
                            'Проходит небольшой промежуток времени. Получен понг. Запрошен статус ' +
                            'сотрудника. Запрошены номера для обзвона. Слейв-вкладки оповещены о ' +
                            'состоянии мастер-вкладки.',
                        function() {
                            beforeEach(function() {
                                tester.spendTime(1000);
                                tester.receivePong();

                                tester.slavesNotification().
                                    twoChannels().
                                    available().
                                    expectToBeSent();

                                tester.authenticatedUserRequest().receiveResponse();
                            });

                            it(
                                'Отправлен пинг. Понг не получен вовремя. Снова дается несколько попыток получить ' +
                                'понг.',
                            function() {
                                tester.spendTime(5000);
                                tester.expectPingToBeSent();

                                tester.employeesPing().expectToBeSent();
                                tester.employeesPing().receive();

                                tester.spendTime(2000);

                                tester.slavesNotification().
                                    twoChannels().
                                    microphoneAccessGranted().
                                    webRTCServerConnected().
                                    userDataFetched().
                                    registered().
                                    expectToBeSent();

                                tester.spendTime(1000);
                                tester.spendTime(1000);

                                tester.expectPingToBeSent();
                            });
                            it(
                                'Сообщение о том, что в данный момент устанавливается соединение с ' +
                                'сервером не отображается.',
                            function() {
                                tester.softphone.expectTextContentNotToHaveSubstring(
                                    'Устанавливается соединение...'
                                );
                            });
                        });
                        it(
                            'Отображается сообщение о том, что в данный момент устанавливается ' +
                            'соединение с сервером.',
                        function() {
                            tester.softphone.expectToHaveTextContent('Устанавливается соединение...');
                        });
                    });
                    describe('Получен понг.', function() {
                        beforeEach(function() {
                            tester.spendTime(500);
                            tester.receivePong();

                            tester.slavesNotification().
                                twoChannels().
                                available().
                                expectToBeSent();

                            tester.authenticatedUserRequest().receiveResponse();
                            tester.spendTime(4999);

                            tester.employeesPing().expectToBeSent();
                            tester.employeesPing().receive();
                        });

                        it(
                            'Пинг отправлен со стандарным интервалом. Понг не получен вовремя. Снова ' +
                            'дается несколько попыток получить понг.',
                        function() {
                            tester.spendTime(1);
                            tester.expectPingToBeSent();

                            tester.spendTime(2000);

                            tester.slavesNotification().
                                twoChannels().
                                microphoneAccessGranted().
                                webRTCServerConnected().
                                userDataFetched().
                                registered().
                                expectToBeSent();

                            tester.spendTime(1000);
                            tester.spendTime(1000);

                            tester.expectPingToBeSent();
                        });
                        it(
                            'Сообщение о том, что в данный момент устанавливается соединение с ' +
                            'сервером не отображается.',
                        function() {
                            tester.softphone.
                                expectTextContentNotToHaveSubstring('Устанавливается соединение...');
                        });
                    });
                });
                it(
                    'Отображается сообщение о том, что в данный момент устанавливается соединение с ' +
                    'сервером.',
                function() {
                    tester.softphone.expectToHaveTextContent('Устанавливается соединение...');
                    tester.callsHistoryButton.expectToHaveClass('cmg-button-disabled');
                });
            });
            it(
                'Проходит небольшой промежуток времени. Получен понг. Сообщение о том, что в данный ' +
                'момент устанавливается соединение с сервером не отображается.',
            function() {
                tester.spendTime(1000);
                tester.receivePong();

                tester.spendTime(4000);
                tester.expectPingToBeSent();

                tester.employeesPing().expectToBeSent();
                tester.employeesPing().receive();

                tester.softphone.expectTextContentNotToHaveSubstring('Устанавливается соединение...');
            });
        });
        it('Токен авторизации в инфопине истек.', function() {
            ticketsContactsRequest.accessTokenExpired().receiveResponse();
            tester.refreshRequest().receiveResponse();

            tester.ticketsContactsRequest().receiveResponse();
        });
        it('Отображен статус сотрудника.', function() {
            tester.body.expectTextContentToHaveSubstring('Ганева Стефка Доступен');
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
                    employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(requests),
                    employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(requests),
                    employeeRequest = tester.employeeRequest().expectToBeSent(requests);

                requests.expectToBeSent();

                ticketsContactsRequest.receiveResponse();
                reportsListRequest.noData().receiveResponse();
                reportTypesRequest.receiveResponse();
                employeeStatusesRequest.receiveResponse();
                employeeSettingsRequest.receiveResponse();
                employeeRequest.receiveResponse();
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
            employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(requests),
            employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(requests),
            employeeRequest = tester.employeeRequest().expectToBeSent(requests);

        requests.expectToBeSent();

        ticketsContactsRequest.receiveResponse();
        reportsListRequest.receiveResponse();
        reportTypesRequest.receiveResponse();
        employeeStatusesRequest.receiveResponse();
        employeeSettingsRequest.receiveResponse();
        employeeRequest.receiveResponse();
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
            employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(requests),
            employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(requests),
            employeeRequest = tester.employeeRequest().expectToBeSent(requests);

        requests.expectToBeSent();

        ticketsContactsRequest.receiveResponse();
        reportsListRequest.receiveResponse();
        reportTypesRequest.receiveResponse();
        employeeStatusesRequest.receiveResponse();
        employeeSettingsRequest.receiveResponse();
        employeeRequest.receiveResponse();
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
            employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(requests),
            employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(requests),
            employeeRequest = tester.employeeRequest().expectToBeSent(requests);

        requests.expectToBeSent();

        ticketsContactsRequest.receiveResponse();
        reportsListRequest.receiveResponse();
        reportTypesRequest.receiveResponse();
        employeeSettingsRequest.receiveResponse();
        employeeStatusesRequest.receiveResponse();
        employeeRequest.receiveResponse();
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
            employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(requests),
            employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(requests),
            employeeRequest = tester.employeeRequest().expectToBeSent(requests);
        authCheckRequest = tester.authCheckRequest().expectToBeSent(requests);

        requests.expectToBeSent();

        ticketsContactsRequest.receiveResponse();
        reportsListRequest.receiveResponse();
        reportTypesRequest.receiveResponse();
        employeeStatusesRequest.receiveResponse();
        employeeSettingsRequest.receiveResponse();
        employeeRequest.receiveResponse();

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
