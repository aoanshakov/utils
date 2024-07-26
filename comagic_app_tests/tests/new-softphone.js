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
            settingsRequest,
            accountRequest,
            permissionsRequest,
            authCheckRequest,
            authenticatedUserRequest,
            registrationRequest;

        beforeEach(function() {
            localStorage.setItem('softphone-position-x', '174');
            setNow('2019-12-19T12:10:06');

            tester = new Tester({
                ...options,
                shouldShowNewSoftphone: true,
            });

            tester.input.withFieldLabel('Логин').fill('botusharova');
            tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

            tester.button('Войти').click();

            tester.loginRequest().receiveResponse();
            accountRequest = tester.accountRequest().expectToBeSent();

            accountRequest.receiveResponse();
            tester.notificationChannel().applyLeader().expectToBeSent();

            const requests = ajax.inAnyOrder();

            reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
            const ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(requests),
                reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
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
            employeeSettingsRequest.receiveResponse(),
            employeeRequest.receiveResponse();

            tester.masterInfoMessage().receive();

            tester.employeesBroadcastChannel().
                applyLeader().
                expectToBeSent();

            tester.notificationChannel().
                applyLeader().
                expectToBeSent();

            tester.masterInfoMessage().
                applyLeader().
                expectToBeSent();

            tester.employeesBroadcastChannel().
                tellIsLeader().
                expectToBeSent();

            tester.notificationChannel().
                tellIsLeader().
                expectToBeSent();

            tester.masterInfoMessage().
                tellIsLeader().
                expectToBeSent();

            tester.employeesWebSocket.connect();
            tester.employeesInitMessage().expectToBeSent();

            tester.slavesNotification().expectToBeSent();

            tester.slavesNotification().
                additional().
                expectToBeSent();

            authCheckRequest.receiveResponse();
            tester.callsRequest().receiveResponse();
            tester.talkOptionsRequest().receiveResponse();
            permissionsRequest = tester.permissionsRequest().expectToBeSent();

            permissionsRequest.receiveResponse();
            settingsRequest = tester.settingsRequest().expectToBeSent();

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
            authenticatedUserRequest = tester.authenticatedUserRequest().expectToBeSent();

            tester.registrationRequest().receiveUnauthorized();

            registrationRequest = tester.registrationRequest().
                authorization().
                expectToBeSent();
            
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

            tester.button('Софтфон').click();

            tester.slavesNotification().
                additional().
                visible().
                expectToBeSent();

            registrationRequest.receiveResponse();

            tester.slavesNotification().
                twoChannels().
                available().
                expectToBeSent();
        });

        describe('Поступил входящий звонок.', function() {
            let incomingCall;
            
            beforeEach(function() {
                incomingCall = tester.incomingCall().receive();

                tester.slavesNotification().
                    twoChannels().
                    available().
                    incoming().
                    progress().
                    expectToBeSent();

                tester.numaRequest().receiveResponse();

                tester.outCallEvent().receive();
                tester.outCallEvent().slavesNotification().expectToBeSent();

                tester.usersRequest().forContacts().receiveResponse();
                tester.contactGroupsRequest().receiveResponse();
            });

            describe('Принимаю звонок.', function() {
                beforeEach(function() {
                    tester.callStartingButton.click();

                    tester.firstConnection.connectWebRTC();
                    tester.firstConnection.callTrackHandler();

                    tester.allowMediaInput();
                    tester.firstConnection.addCandidate();

                    incomingCall.expectOkToBeSent().receiveAck();

                    tester.slavesNotification().
                        available().
                        twoChannels().
                        incoming().
                        confirmed().
                        expectToBeSent();
                });

                describe('Нажимаю на кнопку трансфера.', function() {
                    let usersRequest;

                    beforeEach(function() {
                        tester.transferButton.click();
                        usersRequest = tester.usersRequest().expectToBeSent();
                    });

                    describe('Сотрудников мало.', function() {
                        beforeEach(function() {
                            usersRequest.receiveResponse();
                        });

                        describe('Открываю вкладку "Группы".', function() {
                            let usersRequest,
                                usersInGroupsRequest,
                                groupsRequest;

                            beforeEach(function() {
                                tester.button('Группы').click();

                                usersRequest = tester.usersRequest().expectToBeSent();
                                usersInGroupsRequest = tester.usersInGroupsRequest().expectToBeSent();
                                groupsRequest = tester.groupsRequest().expectToBeSent();
                            });

                            it('Раскрываю выпадающий список групп. Отображён список групп.', function() {
                                usersRequest.receiveResponse();
                                usersInGroupsRequest.receiveResponse();
                                groupsRequest.receiveResponse();

                                tester.select.click();

                                tester.select.
                                    option(
                                        'Отдел дистрибуции ' +
                                        '1 /1 298'
                                    ).
                                    findElement(
                                        '.misc-softphone-misc-sip_lib-src-new-softphone-transfer-styles-module__list-' +
                                        'item'
                                    ).
                                    expectNotToHaveClass(
                                        'misc-softphone-misc-sip_lib-src-new-softphone-transfer-styles-module__disabled'
                                    );
                                    
                                tester.select.
                                    option(
                                        'Отдел по работе с ключевыми клиентами ' +
                                        '0 /1 726'
                                    ).
                                    findElement(
                                        '.misc-softphone-misc-sip_lib-src-new-softphone-transfer-styles-module__list-' +
                                        'item'
                                    ).
                                    expectToHaveClass(
                                        'misc-softphone-misc-sip_lib-src-new-softphone-transfer-styles-module__disabled'
                                    );


                                tester.body.expectTextContentToHaveSubstring(
                                    'Отдел дистрибуции ' +
                                    '1 /1 298 ' +

                                    'Отдел по работе с ключевыми клиентами ' +
                                    '0 /1 726 ' +

                                    'Отдел региональных продаж ' +
                                    '2 /2 828'
                                );
                            });
                            /*
                            it(
                                'Групп много. Очень часто меняются статусы. Не смотря на это список не тормозит.',
                            function() {
                                let time = (new Date()).getTime();

                                groupsRequest.addMore().receiveResponse();
                                usersRequest.addMore().receiveResponse();
                                usersInGroupsRequest.addMore().receiveResponse();

                                console.log('BEFORE OPEN LIST', (new Date()).getTime() - time);
                                time = (new Date()).getTime();

                                tester.select.click();
                                console.log('AFTER OPEN LIST', (new Date()).getTime() - time);

                                time = (new Date()).getTime();

                                for (let i = 0; i < 20; i ++) {
                                    const time = (new Date()).getTime();

                                    tester.entityChangeEvent().
                                        fourthEmployee().
                                        receive();

                                    tester.entityChangeEvent().
                                        fourthEmployee().
                                        slavesNotification().
                                        expectToBeSent();

                                    tester.entityChangeEvent().
                                        fourthEmployee().
                                        thirdStatus().
                                        receive();

                                    tester.entityChangeEvent().
                                        fourthEmployee().
                                        thirdStatus().
                                        slavesNotification().
                                        expectToBeSent();

                                    console.log('ITERATION', (new Date()).getTime() - time);
                                }

                                console.log('DONE', (new Date()).getTime() - time);
                            });
                            */
                        });
                        describe('Раскрываю выпадающий список сотрудников.', function() {
                            beforeEach(function() {
                                tester.select.click();
                            });

                            it('Нажимаю на доступную опцию. Опция выбрана.', function() {
                                tester.select.
                                    option('Господинова Николина 295').
                                    findElement(
                                        '.misc-softphone-misc-sip_lib-src-new-softphone-transfer-styles-module__list-' +
                                        'item'
                                    ).
                                    click();

                                spendTime(0);
                                spendTime(0);

                                tester.select.expectToHaveTextContent('Господинова Николина 295');
                            });
                            it('Нажимаю на заблокированную опцию. Опция не выбрана.', function() {
                                tester.select.
                                    option('Божилова Йовка 296').
                                    findElement(
                                        '.misc-softphone-misc-sip_lib-src-new-softphone-transfer-styles-module__list-' +
                                        'item'
                                    ).
                                    click();

                                spendTime(0);
                                spendTime(0);

                                tester.select.expectToHaveTextContent('Выберите сотрудника');
                            });
                            it('Отображён список сотрудников.', function() {
                                tester.select.
                                    option('Божилова Йовка 296').
                                    findElement(
                                        '.misc-softphone-misc-sip_lib-src-new-softphone-transfer-styles-module__list-' +
                                        'item'
                                    ).
                                    expectToHaveClass(
                                        'misc-softphone-misc-sip_lib-src-new-softphone-transfer-styles-module__disabled'
                                    );
                                    
                                tester.select.
                                    option('Господинова Николина 295').
                                    findElement(
                                        '.misc-softphone-misc-sip_lib-src-new-softphone-transfer-styles-module__list-' +
                                        'item'
                                    ).
                                    expectNotToHaveClass(
                                        'misc-softphone-misc-sip_lib-src-new-softphone-transfer-styles-module__disabled'
                                    );

                                tester.body.expectTextContentToHaveSubstring(
                                    'Божилова Йовка 296 ' +
                                    'Господинова Николина 295 ' +
                                    'Шалева Дора 8258'
                                );
                            });
                        });
                    });
                    /*
                    it(
                        'Сотрудников много. Очень часто меняются статусы. Не смотря на это список не тормозит.',
                    function() {
                        let time = (new Date()).getTime();
                        usersRequest.addMore().receiveResponse();

                        console.log('BEFORE OPEN LIST', (new Date()).getTime() - time);
                        time = (new Date()).getTime();

                        tester.select.click();
                        console.log('AFTER OPEN LIST', (new Date()).getTime() - time);

                        time = (new Date()).getTime();

                        for (let i = 0; i < 20; i ++) {
                            const time = (new Date()).getTime();

                            tester.entityChangeEvent().
                                fourthEmployee().
                                receive();

                            tester.entityChangeEvent().
                                fourthEmployee().
                                slavesNotification().
                                expectToBeSent();

                            tester.entityChangeEvent().
                                fourthEmployee().
                                thirdStatus().
                                receive();

                            tester.entityChangeEvent().
                                fourthEmployee().
                                thirdStatus().
                                slavesNotification().
                                expectToBeSent();

                            console.log('ITERATION', (new Date()).getTime() - time);
                        }

                        console.log('DONE', (new Date()).getTime() - time);
                    });
                    */
                });
                it('Отображено время разговора.', function() {
                    tester.body.expectTextContentToHaveSubstring(
                        'ШД Шалева Дора ' +
                        '00:00'
                    );

                    tester.body.expectTextContentToHaveSubstring(
                        '1 Линия: В разговоре 00:00'
                    );
                });
            });
            it('Отображёна информация о звонке.', function() {
                tester.body.expectTextContentToHaveSubstring(
                    'ШД Шалева Дора ' +
                    'Входящий звонок ' +

                    'Информация о звонке ' +

                    'Номер абонента ' +
                    '+7 (916) 123-45-67 ' +

                    'Виртуальный номер ' +
                    '+7 (916) 123-45-68 ' +

                    'Сайт ' +
                    'somesite.com ' +

                    'Поисковый запрос ' +
                    'Какой-то поисковый запрос, который не помещается в одну строчку ' +

                    'Рекламная кампания ' +
                    'Некая рекламная кампания'
                );

                tester.body.expectTextContentNotToHaveSubstring(
                    '1 Линия: В разговоре 00:00'
                );

                tester.body.expectTextContentToHaveSubstring(
                    'О контакте ' +

                    'ФИО ' +
                    '980925456 ' +

                    'Телефоны ' +
                    '79161234567'
                );
            });
        });
        it('Отображена история звонков.', function() {
            tester.body.expectTextContentToHaveSubstring(
                'Информация ' +
                'История звонков Контакты ' +

                'Сегодня ' +

                'Гяурова Марийка ' +
                'Входящие 08:03 ' +

                'Вчера ' +

                'Манова Тома ' +
                'Исходящие 18:08 ' +

                '17 декабря 2019 ' +

                'Сотирова Атанаска ' +
                'Входящие 12:02 ' +

                'Сотирова Атанаска ' +
                'Входящие 05:57'
            );
        });
    });
});
