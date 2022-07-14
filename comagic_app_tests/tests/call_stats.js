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

    const getPackage = Tester.createPackagesGetter(options);

    describe('Открываю новый ЛК.', function() {
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
            accountRequest = tester.accountRequest().expectToBeSent();

            tester.masterInfoMessage().receive();
            tester.masterInfoMessage().tellIsLeader().expectToBeSent();
        });

        describe('Пользователь является сотрудником.', function() {
            beforeEach(function() {
                accountRequest.receiveResponse();

                const requests = ajax.inAnyOrder();

                reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
                const reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                    reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                    secondAccountRequest = tester.accountRequest().expectToBeSent(requests);

                requests.expectToBeSent();

                reportsListRequest.receiveResponse();
                reportTypesRequest.receiveResponse();
                secondAccountRequest.receiveResponse();
                reportGroupsRequest.receiveResponse();

                tester.configRequest().softphone().receiveResponse();

                tester.slavesNotification().expectToBeSent();
                tester.slavesNotification().additional().expectToBeSent();

                tester.notificationChannel().applyLeader().expectToBeSent();
                spendTime(1000);
                tester.notificationChannel().applyLeader().expectToBeSent();
                spendTime(1000);
                tester.notificationChannel().tellIsLeader().expectToBeSent();

                tester.authCheckRequest().receiveResponse();
                statusesRequest = tester.statusesRequest().expectToBeSent();

                settingsRequest = tester.settingsRequest().expectToBeSent();
                tester.talkOptionsRequest().receiveResponse();

                settingsRequest.receiveResponse();
                tester.slavesNotification().twoChannels().enabled().expectToBeSent();

                permissionsRequest = tester.permissionsRequest().expectToBeSent();

                tester.othersNotification().widgetStateUpdate().expectToBeSent();
                tester.othersNotification().updateSettings().shouldNotPlayCallEndingSignal().expectToBeSent();

                permissionsRequest.receiveResponse();

                tester.connectEventsWebSocket();
                tester.slavesNotification().twoChannels().enabled().softphoneServerConnected().expectToBeSent();

                tester.connectSIPWebSocket();
                tester.slavesNotification().twoChannels().webRTCServerConnected().softphoneServerConnected().
                    expectToBeSent();

                notificationTester.grantPermission();

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
                tester.slavesNotification().twoChannels().available().userDataFetched().
                    expectToBeSent();
            });

            describe('Статусов мало. Открываю статистику звонков.', function() {
                beforeEach(function() {
                    statusesRequest.receiveResponse();

                    tester.button('Статистика звонков').click();
                    tester.statsRequest().receiveResponse();
                });

                it('Нажимаю на кнопку "Выгрузить отчёт". Совершается загрузка отчета.', function() {
                    tester.anchor('Выгрузить отчёт').
                        expectAttributeToHaveValue(
                            'download',
                            'stats_from_2019-12-19T00:00:00.000+03:00_to_2019-12-19T12:10:07.000+03:00.csv'
                        ).
                        expectHrefToBeBlobWithContent([
                            '"";"Карадимова Веска Анастасовна"',

                            '"Статус - Доступен";"17:03:30"',
                            '"Статус - Перерыв";"23:28:10"',
                            '"Статус - Не беспокоить";"04:59:20"',
                            '"Статус - Нет на месте";"09:31:12"',
                            '"Статус - Нет на работе";"03:52:53"',
                            '"Статус - Неизвестно";"00:00:00"',
                            
                            '"Всего вызовов, входящие";"5729"',
                            '"Всего вызовов, исходящие";"927"',

                            '"Общее время в разговоре, входящие";"04:57:40"',
                            '"Общее время в разговоре, исходящие";"02:33:46"',

                            '"Среднее время ответа, входящие";"02:36:13"',
                            '"Среднее время ответа, исходящие";"07:42:43"',

                            '"Среднее время в разговоре, входящие";"01:33:37"',
                            '"Среднее время в разговоре, исходящие";"00:44:23"',

                            '"Успешные, входящие";"85570"',
                            '"Успешные, исходящие";"64539"',

                            '"Успешные, входящие (трансферные)";"273"',
                            '"Успешные, исходящие (трансферные)";"57823"',

                            '"Неуспешные, входящие";"60376"',
                            '"Неуспешные, исходящие";"14006"',

                            '"Неуспешные, входящие (трансферные)";"7627"',
                            '"Неуспешные, исходящие (трансферные)";"6723"',
                        ].join("\n"));
                });
                it('Отображена статистика звонков.', function() {
                    tester.body.expectTextContentToHaveSubstringsConsideringOrder(
                        'Доступен 17:03:30 ' +
                        'Перерыв 23:28:10 ' +
                        'Не беспокоить 04:59:20 ' +
                        'Нет на месте 09:31:12 ' +
                        'Нет на работе 03:52:53 ' +
                        'Неизвестно 00:00:00 ',
                        
                        'Общие сведения ' +
                        'Входящие ' +
                        'Исходящие ' +

                        'Всего вызовов ' +
                        '5729 ' +
                        '927 ' +

                        'Общее время в разговоре ' +
                        '04:57:40 ' +
                        '02:33:46 ' +

                        'Среднее время ответа ' +
                        '02:36:13 ' +
                        '07:42:43 ' +

                        'Среднее время в разговоре ' +
                        '01:33:37 ' +
                        '00:44:23 ' +

                        'По направлениям (из них трансферные) ' +

                        'Успешные ' +
                        '85570 (273) ' +
                        '64539 (57823) ' +

                        'Неуспешные ' +
                        '60376 (7627) ' +
                        '14006 (6723)'
                    );
                });
            });
            describe('Зафиксирую ширину окна.', function() {
                beforeEach(function() {
                    document.querySelector('.cm-app').style = 'width: 1015px;';
                });

                describe('Статусов много. Открываю статистику звонков.', function() {
                    beforeEach(function() {
                        statusesRequest.includesAutoCall().receiveResponse();

                        tester.button('Статистика звонков').click();
                        tester.statsRequest().receiveResponse();
                    });

                    it('Растягиваю окно. Кнопка разворачивания статусов скрыта.', function() {
                        document.querySelector('.cm-app').style = 'width: 2015px;';
                        tester.dispatchResizeEvent();

                        tester.button('Показать все статусы').expectNotToExist();
                    });
                    it('Нажимаю на кнопку разворачивания статусов. Статусы развернуты.', function() {
                        tester.button('Показать все статусы').click();
                        tester.statusDurations.expectHeightToBeMoreThan(48);
                    });
                    it('Статусы свернуты.', function() {
                        tester.statusDurations.expectToHaveHeight(48);
                    });
                });
                it('Открываю статистику звонков. Статусов много. Статусы свернуты.', function() {
                    tester.button('Статистика звонков').click();
                    tester.statsRequest().receiveResponse();

                    statusesRequest.includesAutoCall().receiveResponse();

                    tester.statusDurations.expectToHaveHeight(48);
                    tester.button('Показать все статусы').expectToBeVisible();
                });
                it('Статусов мало. Кнопка разворачивания статусов скрыта.', function() {
                    statusesRequest.receiveResponse();

                    tester.button('Статистика звонков').click();
                    tester.statsRequest().receiveResponse();

                    tester.button('Показать все статусы').expectNotToExist();
                });
            });
        });
        it(
            'Пользователь является руководителем. Открываю статистику по звонкам. Отображено время проведенное в ' +
            'удаленном статусе.',
        function() {
            accountRequest.manager().receiveResponse();

            const requests = ajax.inAnyOrder();

            reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
            const reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                secondAccountRequest = tester.accountRequest().expectToBeSent(requests);

            requests.expectToBeSent();

            reportsListRequest.receiveResponse();
            reportTypesRequest.receiveResponse();
            secondAccountRequest.manager().receiveResponse();
            reportGroupsRequest.receiveResponse();

            tester.configRequest().softphone().receiveResponse();

            tester.slavesNotification().expectToBeSent();
            tester.slavesNotification().additional().expectToBeSent();

            tester.notificationChannel().applyLeader().expectToBeSent();
            spendTime(1000);
            tester.notificationChannel().applyLeader().expectToBeSent();
            spendTime(1000);
            tester.notificationChannel().tellIsLeader().expectToBeSent();

            tester.authCheckRequest().receiveResponse();
            statusesRequest = tester.statusesRequest().expectToBeSent();

            settingsRequest = tester.settingsRequest().expectToBeSent();
            tester.talkOptionsRequest().receiveResponse();

            settingsRequest.receiveResponse();
            tester.slavesNotification().twoChannels().enabled().expectToBeSent();

            permissionsRequest = tester.permissionsRequest().expectToBeSent();

            tester.othersNotification().widgetStateUpdate().expectToBeSent();
            tester.othersNotification().updateSettings().shouldNotPlayCallEndingSignal().expectToBeSent();

            permissionsRequest.receiveResponse();

            tester.connectEventsWebSocket();
            tester.slavesNotification().twoChannels().enabled().softphoneServerConnected().expectToBeSent();

            tester.connectSIPWebSocket();
            tester.slavesNotification().twoChannels().webRTCServerConnected().softphoneServerConnected().
                expectToBeSent();

            notificationTester.grantPermission();

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
            tester.slavesNotification().twoChannels().available().userDataFetched().
                expectToBeSent();

            statusesRequest.receiveResponse();

            tester.button('Статистика звонков').click();
            tester.statsRequest().receiveResponse();

            tester.body.expectTextContentToHaveSubstring('Удаленный 00:00:00');
        });
        it('Статистика по звонкам недоступна. Пункт меню скрыт.', function() {
            accountRequest.callStatsFeatureFlagDisabled().receiveResponse();

            const requests = ajax.inAnyOrder();

            reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
            const reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                secondAccountRequest = tester.accountRequest().callStatsFeatureFlagDisabled().expectToBeSent(requests);

            requests.expectToBeSent();

            reportsListRequest.receiveResponse();
            reportTypesRequest.receiveResponse();
            secondAccountRequest.manager().receiveResponse();
            reportGroupsRequest.receiveResponse();

            tester.configRequest().softphone().receiveResponse();

            tester.slavesNotification().expectToBeSent();
            tester.slavesNotification().additional().expectToBeSent();

            tester.notificationChannel().applyLeader().expectToBeSent();
            spendTime(1000);
            tester.notificationChannel().applyLeader().expectToBeSent();
            spendTime(1000);
            tester.notificationChannel().tellIsLeader().expectToBeSent();

            tester.authCheckRequest().receiveResponse();
            statusesRequest = tester.statusesRequest().expectToBeSent();

            settingsRequest = tester.settingsRequest().expectToBeSent();
            tester.talkOptionsRequest().receiveResponse();

            settingsRequest.receiveResponse();
            tester.slavesNotification().twoChannels().enabled().expectToBeSent();

            permissionsRequest = tester.permissionsRequest().expectToBeSent();

            tester.othersNotification().widgetStateUpdate().expectToBeSent();
            tester.othersNotification().updateSettings().shouldNotPlayCallEndingSignal().expectToBeSent();

            permissionsRequest.receiveResponse();

            tester.connectEventsWebSocket();
            tester.slavesNotification().twoChannels().enabled().softphoneServerConnected().expectToBeSent();

            tester.connectSIPWebSocket();
            tester.slavesNotification().twoChannels().webRTCServerConnected().softphoneServerConnected().
                expectToBeSent();

            notificationTester.grantPermission();

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
            tester.slavesNotification().twoChannels().available().userDataFetched().
                expectToBeSent();

            statusesRequest.receiveResponse();

            tester.button('Статистика звонков').expectNotToExist();
        });
    });
});
