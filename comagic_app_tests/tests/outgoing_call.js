tests.addTest(options => {
    const {
        utils,
        Tester,
        addSecond,
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

    describe('Открываю лк. Ни лидген, ни РМО, ни аналитика не доступны. Ввожу номер телефона.', function() {
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
            localStorage.setItem('softphone-position-x', '174');

            tester = new Tester(options);

            tester.input.withFieldLabel('Логин').fill('botusharova');
            tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

            tester.button('Войти').click();

            tester.loginRequest().receiveResponse();
            accountRequest = tester.accountRequest().expectToBeSent();
        });

        describe('Сотрудник относится к проекту CoMagic.', function() {
            beforeEach(function() {
                accountRequest.receiveResponse();
                const requests = ajax.inAnyOrder();

                reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
                const ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(requests),
                    reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
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

                tester.employeesBroadcastChannel().
                    applyLeader().
                    expectToBeSent();

                tester.notificationChannel().
                    applyLeader().
                    expectToBeSent();

                tester.masterInfoMessage().
                    applyLeader().
                    expectToBeSent();

                tester.masterInfoMessage().
                    applyLeader().
                    expectToBeSent();

                tester.employeesBroadcastChannel().
                    tellIsLeader().
                    expectToBeSent();

                tester.employeesWebSocket.connect();
                tester.employeesInitMessage().expectToBeSent();

                tester.notificationChannel().
                    tellIsLeader().
                    expectToBeSent();

                tester.masterInfoMessage().
                    tellIsLeader().
                    expectToBeSent();

                tester.slavesNotification().expectToBeSent();

                tester.slavesNotification().
                    additional().
                    expectToBeSent();

                authCheckRequest.receiveResponse();
                tester.talkOptionsRequest().receiveResponse();

                tester.permissionsRequest().
                    allowNumberCapacitySelect().
                    receiveResponse();

                tester.settingsRequest().
                    allowNumberCapacitySelect().
                    receiveResponse();

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

                tester.numberCapacityRequest().receiveResponse();
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

                tester.button('Софтфон').click();
                tester.accountRequest().receiveResponse();

                tester.slavesNotification().
                    additional().
                    visible().
                    expectToBeSent();
            });

            describe('Ввожу русский номер телефона начинающийся с цифры 7.', function() {
                beforeEach(function() {
                    tester.phoneField.fill('79161234567ghi');
                });

                describe('SIP-регистрация завершена.', function() {
                    let numaRequest,
                        outgoingCall;

                    beforeEach(function() {
                        registrationRequest.receiveResponse();

                        tester.slavesNotification().
                            userDataFetched().
                            twoChannels().
                            available().
                            expectToBeSent();
                    });

                    describe('Нажимаю на кнпоку вызова.', function() {
                        beforeEach(function() {
                            tester.callStartingButton.click();
                            
                            tester.firstConnection.connectWebRTC();
                            tester.allowMediaInput();

                            outgoingCall = tester.outgoingCall().expectToBeSent()

                            tester.slavesNotification().
                                available().
                                userDataFetched().
                                twoChannels().
                                sending().
                                expectToBeSent();

                            outgoingCall.setRinging();

                            tester.slavesNotification().
                                available().
                                userDataFetched().
                                twoChannels().
                                progress().
                                expectToBeSent();
                            
                            tester.firstConnection.callTrackHandler();

                            numaRequest = tester.numaRequest().expectToBeSent();
                        });

                        describe('Контакт не является сотрудником.', function() {
                            beforeEach(function() {
                                numaRequest.receiveResponse();
                            });

                            describe('Получены данные контакта.', function() {
                                let outCallSessionEvent;

                                beforeEach(function() {
                                    outCallSessionEvent = tester.outCallSessionEvent();
                                });

                                describe('Нет активных сделок.', function() {
                                    beforeEach(function() {
                                        outCallSessionEvent.receive();

                                        tester.outCallSessionEvent().
                                            slavesNotification().
                                            expectToBeSent();
                                    });

                                    describe('Звонок принят.', function() {
                                        beforeEach(function() {
                                            outgoingCall.setAccepted();

                                            tester.slavesNotification().
                                                available().
                                                userDataFetched().
                                                twoChannels().
                                                confirmed().
                                                expectToBeSent();
                                        });

                                        describe('Поступил входящий звонок.', function() {
                                            let incomingCall;

                                            beforeEach(function() {
                                                incomingCall = tester.incomingCall().
                                                    thirdNumber().receive();

                                                tester.slavesNotification().
                                                    available().
                                                    userDataFetched().
                                                    twoChannels().
                                                    confirmed().
                                                    secondChannel().
                                                        incoming().
                                                        progress().
                                                        fifthPhoneNumber().
                                                    expectToBeSent();

                                                tester.numaRequest().thirdNumber().
                                                    receiveResponse();

                                                tester.outCallEvent().
                                                    anotherPerson().
                                                    receive();

                                                tester.outCallEvent().
                                                    anotherPerson().
                                                    slavesNotification().
                                                    expectToBeSent();
                                            });

                                            it(
                                                'Принимаю звонок на второй линии. ' +
                                                'Отображаются данные о звонке.',
                                            function() {
                                                tester.otherChannelCallNotification.
                                                    callStartingButton.click();

                                                tester.secondConnection.connectWebRTC();
                                                tester.secondConnection.callTrackHandler();
                                                tester.allowMediaInput();
                                                tester.secondConnection.addCandidate();

                                                incomingCall.expectOkToBeSent().
                                                    receiveResponse();

                                                tester.slavesNotification().
                                                    available().
                                                    userDataFetched().
                                                    twoChannels().
                                                    confirmed().
                                                    secondChannel().
                                                        incoming().
                                                        confirmed().
                                                        fifthPhoneNumber().
                                                    currentChannelIsSecond().
                                                    expectToBeSent();

                                                audioDecodingTester.
                                                    accomplishAudioDecoding();

                                                tester.firstConnection.
                                                    expectHoldMusicToPlay();
                                                tester.secondConnection.
                                                    expectRemoteStreamToPlay();

                                                tester.softphone.
                                                    expectTextContentToHaveSubstring(
                                                        'Гигова Петранка ' +
                                                        '+7 (916) 123-45-10 00:00'
                                                    );
                                            });
                                            it(
                                                'Нажимаю на кнопку второй линии. ' +
                                                'Принимаю звонок на второй линии. ' +
                                                'Отображаются данные о звонке.',
                                            function() {
                                                tester.secondLineButton.click();

                                                tester.slavesNotification().
                                                    available().
                                                    userDataFetched().
                                                    twoChannels().
                                                    confirmed().
                                                    secondChannel().
                                                        incoming().
                                                        progress().
                                                        fifthPhoneNumber().
                                                    changedChannelToSecond().
                                                    expectToBeSent();

                                                tester.callStartingButton.click();

                                                tester.secondConnection.connectWebRTC();
                                                tester.secondConnection.callTrackHandler();
                                                tester.allowMediaInput();
                                                tester.secondConnection.addCandidate();

                                                incomingCall.expectOkToBeSent().
                                                    receiveResponse();

                                                tester.slavesNotification().
                                                    available().
                                                    userDataFetched().
                                                    twoChannels().
                                                    confirmed().
                                                    secondChannel().
                                                        incoming().
                                                        confirmed().
                                                        fifthPhoneNumber().
                                                    changedChannelToSecond().
                                                    wasInProgressAtTheMomentOfChannelChanging().
                                                    expectToBeSent();

                                                audioDecodingTester.
                                                    accomplishAudioDecoding();

                                                tester.firstConnection.
                                                    expectHoldMusicToPlay();
                                                tester.secondConnection.
                                                    expectRemoteStreamToPlay();

                                                tester.softphone.
                                                    expectTextContentToHaveSubstring(
                                                        'Гигова Петранка ' +
                                                        '+7 (916) 123-45-10 00:00'
                                                    );
                                            });
                                            it(
                                                'Нажимаю на сообщение о звонке. Открыта ' +
                                                'вторая линия.',
                                            function() {
                                                tester.otherChannelCallNotification.click();

                                                tester.slavesNotification().
                                                    available().
                                                    userDataFetched().
                                                    twoChannels().
                                                    confirmed().
                                                    secondChannel().
                                                        incoming().
                                                        progress().
                                                        fifthPhoneNumber().
                                                    changedChannelToSecond().
                                                    expectToBeSent();

                                                tester.softphone.
                                                    expectTextContentToHaveSubstring(
                                                        'Гигова Петранка ' +
                                                        '+7 (916) 123-45-10'
                                                    );
                                            });
                                            it(
                                                'Отображено сообщение о звонке.',
                                            function() {
                                                tester.body.
                                                    expectTextContentToHaveSubstring(
                                                        'Гигова Петранка ' +
                                                        'Входящий (2-ая линия)...'
                                                    );

                                                tester.otherChannelCallNotification.
                                                    callStartingButton.
                                                    expectNotToHaveClass(
                                                        'cmg-button-disabled'
                                                    );
                                            });
                                        });
                                        it('Отображено имя, номер и таймер.', function() {
                                            tester.outgoingIcon.expectToBeVisible();

                                            tester.softphone.
                                                expectTextContentToHaveSubstring(
                                                    'Шалева Дора ' +
                                                    '+7 (916) 123-45-67 00:00'
                                                );
                                            
                                            tester.body.expectTextContentToHaveSubstring(
                                                'Ганева Стефка Доступен'
                                            );
                                        });
                                    });
                                    describe('Прошла секунда.', function() {
                                        beforeEach(function() {
                                            addSecond();
                                        });

                                        describe('Звонок принят.', function() {
                                            beforeEach(function() {
                                                outgoingCall.setAccepted();

                                                tester.slavesNotification().
                                                    available().
                                                    userDataFetched().
                                                    twoChannels().
                                                    confirmed().
                                                    expectToBeSent();
                                            });

                                            it('Прошла секунда. Таймер изменился.', function() {
                                                addSecond();
                                                tester.softphone.expectTextContentToHaveSubstring('00:01');
                                            });
                                            it('Таймер обнулился.', function() {
                                                tester.softphone.expectTextContentToHaveSubstring('00:00');
                                            });
                                        });
                                        it('Таймер изменился.', function() {
                                            tester.softphone.expectTextContentToHaveSubstring('00:01');
                                        });
                                    });
                                    describe('Поступил входящий звонок.', function() {
                                        let incomingCall;

                                        beforeEach(function() {
                                            incomingCall = tester.incomingCall().
                                                thirdNumber().
                                                receive();

                                            tester.slavesNotification().
                                                available().
                                                userDataFetched().
                                                twoChannels().
                                                progress().
                                                secondChannel().
                                                    incoming().
                                                    progress().
                                                    fifthPhoneNumber().
                                                expectToBeSent();
                                            
                                            tester.numaRequest().
                                                thirdNumber().
                                                receiveResponse();

                                            tester.outCallEvent().
                                                anotherPerson().
                                                receive();

                                            tester.outCallEvent().
                                                anotherPerson().
                                                slavesNotification().
                                                expectToBeSent();
                                        });

                                        it(
                                            'Вызываемый занят. Отображено сообщение о ' +
                                            'звонке.',
                                        function() {
                                            outgoingCall.receiveBusy();

                                            tester.slavesNotification().
                                                available().
                                                userDataFetched().
                                                twoChannels().
                                                failed().
                                                secondChannel().
                                                    incoming().
                                                    progress().
                                                    fifthPhoneNumber().
                                                expectToBeSent();

                                            tester.body.expectTextContentToHaveSubstring(
                                                'Гигова Петранка Входящий (2-ая линия)...'
                                            );
                                        });
                                        it(
                                            'Нажимаю на кнопку отклонения звонка на ' +
                                            'второй линии.',
                                        function() {
                                            tester.otherChannelCallNotification.
                                                stopCallButton.
                                                click();

                                            tester.slavesNotification().
                                                available().
                                                userDataFetched().
                                                twoChannels().
                                                progress().
                                                secondChannel().
                                                ended().
                                                expectToBeSent();

                                            incomingCall.expectBusyHereToBeSent();

                                            tester.softphone.expectToHaveTextContent(
                                                'Шалева Дора ' +
                                                '+7 (916) 123-45-67 00:00'
                                            );
                                        });
                                        it(
                                            'Нажимаю на кнопку второй линии. Кнпока ' +
                                            'принятия звонка заблокирована.',
                                        function() {
                                            tester.secondLineButton.click();

                                            tester.slavesNotification().
                                                available().
                                                userDataFetched().
                                                twoChannels().
                                                progress().
                                                secondChannel().
                                                    incoming().
                                                    progress().
                                                    fifthPhoneNumber().
                                                changedChannelToSecond().
                                                expectToBeSent();
                                            
                                            tester.callStartingButton.click();

                                            tester.callStartingButton.
                                                expectToHaveAttribute('disabled');
                                        });
                                        it(
                                            'Кнопка принятия звонка на второй линии ' +
                                            'заблокирована.',
                                        function() {
                                            tester.otherChannelCallNotification.
                                                callStartingButton.
                                                click();

                                            spendTime(0);

                                            tester.otherChannelCallNotification.
                                                callStartingButton.
                                                expectToHaveClass('cmg-button-disabled');

                                            tester.firstConnection.
                                                expectRemoteStreamToPlay();

                                            tester.softphone.
                                                expectTextContentToHaveSubstring(
                                                    'Шалева Дора ' +
                                                    '+7 (916) 123-45-67 00:00'
                                                );
                                        });
                                    });
                                    it(
                                        'Нажимаю на кнопку остановки звонка. Ввожу тот ' +
                                        'же самый номер. Отображается поле номера.',
                                    function() {
                                        tester.stopCallButton.click();

                                        tester.slavesNotification().
                                            available().
                                            userDataFetched().
                                            twoChannels().
                                            ended().
                                            expectToBeSent();

                                        outgoingCall.expectCancelToBeSent();

                                        tester.phoneField.fill('79161234567');
                                        tester.phoneField.expectToHaveValue('79161234567');
                                    });
                                    it('Отображено имя, номер и таймер.', function() {
                                        tester.softphone.expectToBeCollapsed();
                                        tester.outgoingIcon.expectToBeVisible();

                                        tester.softphone.expectTextContentToHaveSubstring(
                                            'Шалева Дора +7 (916) 123-45-67 00:00'
                                        );
                                    });
                                });
                                it('Сворачиваю окно. Уведомление о звонке не было отображено.', function() {
                                    setDocumentVisible(false);

                                    tester.slavesNotification().
                                        available().
                                        hidden().
                                        userDataFetched().
                                        twoChannels().
                                        progress().
                                        expectToBeSent();

                                    outCallSessionEvent.receive();

                                    tester.outCallSessionEvent().
                                        slavesNotification().
                                        expectToBeSent();
                                });
                                it('Есть активные сделки. Отображены активные сделки.', function() {
                                    outCallSessionEvent.activeLeads().receive();

                                    tester.outCallSessionEvent().
                                        activeLeads().
                                        slavesNotification().
                                        expectToBeSent();

                                    tester.softphone.expectToBeExpanded();

                                    tester.anchor('По звонку с 79154394340').click();
                                    windowOpener.expectToHavePath('https://comagicwidgets.amocrm.ru/leads/detail/3003651');
                                });
                            });
                            it('Данные контакта не найдены.', function() {
                                tester.outCallSessionEvent().
                                    noName().
                                    receive();

                                tester.outCallSessionEvent().
                                    noName().
                                    slavesNotification().
                                    expectToBeSent();

                                tester.outgoingIcon.expectToBeVisible();
                                tester.softphone.expectTextContentToHaveSubstring(
                                    '+7 (916) 123-45-67 Исходящий звонок 00:00'
                                );
                            });
                            it(
                                'Отображен номер, таймер, направление и сообщение о ' +
                                'поиске контакта.',
                            function() {
                                tester.outgoingIcon.expectToBeVisible();
                                tester.softphone.expectTextContentToHaveSubstring(
                                    '+7 (916) 123-45-67 Поиск контакта... 00:00'
                                );
                            });
                        });
                        describe('Контакт является сотрудником.', function() {
                            beforeEach(function() {
                                numaRequest.employeeNameIsFound().receiveResponse();

                                tester.slavesNotification().
                                    additional().
                                    name().
                                    visible().
                                    expectToBeSent();
                            });

                            it(
                                'Нажимаю на кнопку остановки звонка. Ввожу тот же самый ' +
                                'номер. Отображается поле номера.',
                            function() {
                                tester.stopCallButton.click();

                                tester.slavesNotification().
                                    available().
                                    userDataFetched().
                                    twoChannels().
                                    ended().
                                    expectToBeSent();

                                outgoingCall.expectCancelToBeSent();

                                tester.phoneField.fill('79161234567');
                                tester.phoneField.expectToHaveValue('79161234567');
                            });
                            it('Отображено имя, номер и таймер.', function() {
                                tester.outgoingIcon.expectToBeVisible();
                                tester.softphone.expectToBeCollapsed();

                                tester.softphone.expectTextContentToHaveSubstring(
                                    'Шалева Дора +7 (916) 123-45-67 00:00'
                                );
                            });
                        });
                    });
                    it(
                        'Нажимаю на клавишу Enter. Совершается исходящий звонок.',
                    function() {
                        tester.phoneField.pressEnter();

                        tester.firstConnection.connectWebRTC();
                        tester.allowMediaInput();

                        outgoingCall = tester.outgoingCall().expectToBeSent()

                        tester.slavesNotification().
                            available().
                            userDataFetched().
                            twoChannels().
                            sending().
                            expectToBeSent();

                        outgoingCall.setRinging();

                        tester.slavesNotification().
                            available().
                            userDataFetched().
                            twoChannels().
                            progress().
                            expectToBeSent();

                        tester.firstConnection.callTrackHandler();

                        tester.numaRequest().receiveResponse();

                        tester.outCallSessionEvent().receive();
                        tester.outCallSessionEvent().slavesNotification().expectToBeSent();
                    });
                });
                it('Нажимаю на кнопку удаления цифры. Цифра удалена.', function() {
                    tester.digitRemovingButton.click();
                    tester.phoneField.expectToHaveValue('7916123456');
                });
                it('Кнопка вызова заблокирована.', function() {
                    tester.callStartingButton.expectToHaveAttribute('disabled');
                    tester.phoneField.expectToHaveValue('79161234567');
                });
            });
            it('Ввожу русский номер телефона начинающийся с цифры 8. Номер телефона был нормализован.', function() {
                registrationRequest.receiveResponse();

                tester.slavesNotification().
                    userDataFetched().
                    twoChannels().
                    available().
                    expectToBeSent();

                tester.phoneField.fill('89161234567');
                tester.callStartingButton.click();
                
                tester.firstConnection.connectWebRTC();
                tester.allowMediaInput();

                outgoingCall = tester.outgoingCall().expectToBeSent()

                tester.slavesNotification().
                    available().
                    userDataFetched().
                    twoChannels().
                    sending().
                    expectToBeSent();

                outgoingCall.setRinging();

                tester.slavesNotification().
                    available().
                    userDataFetched().
                    twoChannels().
                    progress().
                    expectToBeSent();
                
                tester.firstConnection.callTrackHandler();
                tester.numaRequest().receiveResponse();

                tester.body.expectTextContentToHaveSubstring('+7 (916) 123-45-67');
            });
        });
        describe('Используеся проект Rolands. Ввожу в номер телефона.', function() {
            let reportsListRequest,
                reportTypesRequest,
                employeeStatusesRequest,
                employeeRequest;

            beforeEach(function() {
                accountRequest.rolands().receiveResponse();

                tester.notificationChannel().
                    applyLeader().
                    expectToBeSent();

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

                tester.employeesWebSocket.connect();
                tester.employeesInitMessage().expectToBeSent();

                tester.notificationChannel().
                    tellIsLeader().
                    expectToBeSent();

                tester.masterInfoMessage().
                    tellIsLeader().
                    expectToBeSent();

                tester.slavesNotification().expectToBeSent();

                tester.slavesNotification().
                    additional().
                    expectToBeSent();

                tester.ticketsContactsRequest().receiveResponse();

                const requests = ajax.inAnyOrder();
                
                authCheckRequest = tester.authCheckRequest().expectToBeSent(requests);
                reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
                reportsListRequest = tester.reportsListRequest().expectToBeSent(requests);
                reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests);
                employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(requests);
                employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(requests),
                employeeRequest = tester.employeeRequest().expectToBeSent(requests);

                requests.expectToBeSent();

                authCheckRequest.receiveResponse();
                reportGroupsRequest.receiveResponse();
                reportsListRequest.receiveResponse();
                reportTypesRequest.receiveResponse();
                employeeStatusesRequest.receiveResponse();
                employeeSettingsRequest.receiveResponse();
                employeeRequest.receiveResponse();

                tester.talkOptionsRequest().receiveResponse();
                permissionsRequest = tester.permissionsRequest().expectToBeSent();
                settingsRequest = tester.settingsRequest();

                tester.button('Софтфон').click();

                tester.accountRequest().
                    rolands().
                    receiveResponse();

                tester.slavesNotification().
                    additional().
                    visible().
                    expectToBeSent();

                permissionsRequest.receiveResponse();
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

                tester.phoneField.fill('79161234567ghi');
            });

            it('Нажимаю на кнопку вызова. Совершается вызов по введённому номеру.', function() {
                tester.callStartingButton.click();
                
                tester.firstConnection.connectWebRTC();
                tester.allowMediaInput();

                tester.outgoingCall().
                    seventhPhone().
                    expectToBeSent();

                tester.slavesNotification().
                    available().
                    userDataFetched().
                    twoChannels().
                    sending().
                    seventhPhone().
                    expectToBeSent();

                tester.numaRequest().
                    seventhPhone().
                    expectToBeSent();
            });
            it('Номер телефона введён.', function() {
                tester.phoneField.expectToHaveValue('79161234567gh');
            });
        });
        it('Используеся проект CallGear. Ввожу в номер телефона. Номер телефона введён.', function() {
            let reportsListRequest,
                reportTypesRequest,
                employeeStatusesRequest,
                employeeRequest;

            accountRequest.callGear().receiveResponse();

            tester.notificationChannel().
                applyLeader().
                expectToBeSent();

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

            tester.employeesWebSocket.connect();
            tester.employeesInitMessage().expectToBeSent();

            tester.notificationChannel().
                tellIsLeader().
                expectToBeSent();

            tester.masterInfoMessage().
                tellIsLeader().
                expectToBeSent();

            tester.slavesNotification().expectToBeSent();

            tester.slavesNotification().
                additional().
                expectToBeSent();

            tester.ticketsContactsRequest().receiveResponse();

            const requests = ajax.inAnyOrder();
            
            authCheckRequest = tester.authCheckRequest().expectToBeSent(requests);
            reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
            reportsListRequest = tester.reportsListRequest().expectToBeSent(requests);
            reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests);
            employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(requests);
            employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(requests),
            employeeRequest = tester.employeeRequest().expectToBeSent(requests);

            requests.expectToBeSent();

            authCheckRequest.receiveResponse();
            reportGroupsRequest.receiveResponse();
            reportsListRequest.receiveResponse();
            reportTypesRequest.receiveResponse();
            employeeStatusesRequest.receiveResponse();
            employeeSettingsRequest.receiveResponse();
            employeeRequest.receiveResponse();

            tester.talkOptionsRequest().receiveResponse();
            permissionsRequest = tester.permissionsRequest().expectToBeSent();
            settingsRequest = tester.settingsRequest();

            tester.button('Софтфон').click();

            tester.accountRequest().
                callGear().
                receiveResponse();

            tester.slavesNotification().
                additional().
                visible().
                expectToBeSent();

            permissionsRequest.receiveResponse();
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

            tester.phoneField.fill('79161234567ghi');
            tester.phoneField.expectToHaveValue('79161234567g');
        });
    });
});
