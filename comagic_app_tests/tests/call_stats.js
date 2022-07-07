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

    describe('Открываю новый лк.', function() {
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
                secondAccountRequest = tester.accountRequest().expectToBeSent(requests);

            requests.expectToBeSent();

            reportsListRequest.receiveResponse();
            reportTypesRequest.receiveResponse();
            secondAccountRequest.receiveResponse();
            reportGroupsRequest.receiveResponse();

            tester.configRequest().softphone().receiveResponse();

            tester.masterInfoMessage().receive();
            tester.slavesNotification().expectToBeSent();
            tester.slavesNotification().additional().expectToBeSent();

            tester.notificationChannel().tellIsLeader().expectToBeSent();
            tester.masterInfoMessage().tellIsLeader().expectToBeSent();
            tester.notificationChannel().applyLeader().expectToBeSent();
            tester.notificationChannel().applyLeader().expectToBeSent();

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
                statsRequest = tester.statsRequest().expectToBeSent();
            });

            describe('Все параметры статистики по звонка получены.', function() {
                beforeEach(function() {
                    statsRequest.receiveResponse();
                });

                it('Нажимаю на кнопку "Выгрузить отчет". Совершается загрузка отчета.', function() {
                    tester.anchor('Выгрузить отчет').
                        expectAttributeToHaveValue(
                            'download',
                            'stats_from_2020-01-01T00:00:00.000+03:00_to_2020-01-01T12:04:23.000+03:00.csv'
                        ).
                        expectHrefToBeBlobWithContent([
                            '"Статус - Нет на работе";"2:10:26"',
                            '"Статус - Исходящий обзвон";"1:53:42"',
                            '"Статус - Нет на месте";"57:02"',
                            '"Статус - Не беспокоить";"18:59:32"',
                            '"Статус - Перерыв";"41:22"',
                            '"Статус - Доступен";"34:43"',

                            '"Всего вызовов, входящие";"5729"',
                            '"Всего вызовов, исходящие";"927"',
                            '"Вызовы пропущенные";"60376"',
                            '"Вызовы принятые";"85570"',
                            '"Неуспешные исходящие";"14006"',
                            '"Успешные исходящие";"64539"',

                            '" ";"Карадимова Веска Анастасовна"',

                            '"Среднее время в разговоре, входящие";"1:33:37"',
                            '"Общее время в разговоре, входящие";"4:57:40"',
                            '"Среднее время в разговоре, исходящие";"44:23"',
                            '"Общее время в разговоре, исходящие";"2:33:46"',
                            '"Среднее время ответа, входящие";"2:36:13"',
                            '"Среднее время ответа, исходящие";"7:42:43"',

                            '"Вызовы пропущенные (трансферные)";"7627"',
                            '"Вызовы принятые (трансферные)";"273"',
                            '"Неуспешные исходящие (трансферные)";"6723"',
                            '"Успешные исходящие (трансферные)";"57823"'
                        ].join("\n"));
                });
                it('Отображена статистика звонков.', function() {
                    tester.body.expectTextContentToHaveSubstring(
                        'Доступен ' +
                        '17:03:30 ' +
                        'Перерыв ' +
                        '23:28:10 ' +
                        'Не беспокоить ' +
                        '04:59:20 ' +
                        'Нет на месте ' +
                        '09:31:12 ' +
                        'Нет на работе ' +
                        '03:52:53 ' +
                        'Неизвестно ' +
                        '00:00:00 ' +
                        
                        'Общие сведения ' +
                        'Входящие ' +
                        'Исходящие ' +

                        'Всего вызовов ' +
                        '5729 ' +
                        '927 ' +

                        'Общее время в разговоре ' +
                        '04:57:40 ' +
                        '02:33:46 ' +

                        'Общее время ответа ' +
                        '02:36:13 ' +
                        '07:42:43 ' +

                        'Среднее время в разговоре ' +
                        '01:33:37 ' +
                        '00:44:23 ' +

                        'По направлениям (из них трансферные) ' +

                        'Успешные ' +
                        '85297 (273) ' +
                        '6716 (57823) ' +

                        'Неуспешные ' +
                        '52749 (7627) ' +
                        '6723 (6723)'
                    );
                });
            });
            it(
                'Не все параметры статистики по звонкам получены. Нажимаю на кнопку "Выгрузить отчет". Совершается ' +
                'загрузка отчета.',
            function() {
                statsRequest.noInCallCount().receiveResponse();

                tester.anchor('Выгрузить отчет').
                    expectAttributeToHaveValue(
                        'download',
                        'stats_from_2020-01-01T00:00:00.000+03:00_to_2020-01-01T12:04:23.000+03:00.csv'
                    ).
                    expectHrefToBeBlobWithContent([
                        '"Статус - Нет на работе";"2:10:26"',
                        '"Статус - Исходящий обзвон";"1:53:42"',
                        '"Статус - Нет на месте";"57:02"',
                        '"Статус - Не беспокоить";"18:59:32"',
                        '"Статус - Перерыв";"41:22"',
                        '"Статус - Доступен";"34:43"',

                        '"Всего вызовов, исходящие";"927"',
                        '"Вызовы пропущенные";"60376"',
                        '"Вызовы принятые";"85570"',
                        '"Неуспешные исходящие";"14006"',
                        '"Успешные исходящие";"64539"',

                        '" ";"Карадимова Веска Анастасовна"',

                        '"Среднее время в разговоре, входящие";"1:33:37"',
                        '"Общее время в разговоре, входящие";"4:57:40"',
                        '"Среднее время в разговоре, исходящие";"44:23"',
                        '"Общее время в разговоре, исходящие";"2:33:46"',
                        '"Среднее время ответа, входящие";"2:36:13"',
                        '"Среднее время ответа, исходящие";"7:42:43"',

                        '"Вызовы пропущенные (трансферные)";"7627"',
                        '"Вызовы принятые (трансферные)";"273"',
                        '"Неуспешные исходящие (трансферные)";"6723"',
                        '"Успешные исходящие (трансферные)";"57823"'
                    ].join("\n"));
            });
        });
        describe('Зафиксирую ширину окна.', function() {
            beforeEach(function() {
                document.querySelector('.cm-app').style = 'width: 1015px;';
            });

            describe('Статусов много. Открываю статистику звонков.', function() {
                beforeEach(function() {
                    statusesRequest.many().receiveResponse();

                    tester.button('Статистика звонков').click();
                    tester.statsRequest().receiveResponse();
                });

                it('Открываю другой раздел. Растягиваю окно. Ошибка не происходит.', function() {
                    tester.button('История звонков').click();

                    tester.callsRequest().fromFirstWeekDay().firstPage().receiveResponse();
                    tester.marksRequest().receiveResponse();

                    document.querySelector('.cm-app').style = 'width: 2015px;';
                    tester.dispatchResizeEvent();
                });
                it('Растягиваю окно. Кнопка разворачивания статусов скрыта.', function() {
                    document.querySelector('.cm-app').style = 'width: 2015px;';
                    tester.dispatchResizeEvent();

                    tester.button('Показать все статусы').expectNotToExist();
                });
                it('Нажимаю на кнопку разворачивания статусов. Статусы развернуты.', function() {
                    tester.button('Показать все статусы').click();
                    tester.statusDurations.expectHeightToBeMoreThan(96);
                });
                it('Статусы свернуты.', function() {
                    tester.statusDurations.expectToHaveHeight(96);
                });
            });
            it('Статусов не слишком много. Кнопка разворачивания статусов скрыта.', function() {
                statusesRequest.includesAutoCall().receiveResponse();

                tester.button('Статистика звонков').click();
                tester.statsRequest().receiveResponse();

                tester.button('Показать все статусы').expectNotToExist();
            });
        });
    });
});
