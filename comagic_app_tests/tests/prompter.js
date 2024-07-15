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
        setDocumentVisible,
        broadcastChannels,
    } = options;

    const getPackage = Tester.createPackagesGetter(options);

    describe('Открываю новый личный кабинет. Фичафлаг софтфона включен.', function() {
        let tester,
            authCheckRequest,
            ipcPrompterCallPreparationMessage;

        beforeEach(function() {
            setNow('2019-12-19T12:10:06');
            localStorage.setItem('softphone-position-x', '174');

            tester = new Tester(options);

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
                employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(requests),
                employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(requests),
                employeeRequest = tester.employeeRequest().expectToBeSent(requests);
            authCheckRequest = tester.authCheckRequest().expectToBeSent(requests);

            requests.expectToBeSent();

            ticketsContactsRequest.receiveResponse();
            reportGroupsRequest.receiveResponse();
            reportsListRequest.receiveResponse();
            reportTypesRequest.receiveResponse();
            employeeSettingsRequest.receiveResponse(),
            employeeStatusesRequest.receiveResponse();
            employeeRequest.receiveResponse();
        });

        afterEach(function() {
            tester.eventBus.nextEvent().expectNotToExist();
        });

        describe(
            'Вкладка является ведущей. Получены права. Получены настройки софтфона. Получен доступ к микрофону. ' +
            'SIP-линия зарегистрирована. Получены данные для отчета. SIP-регистрация завершена.',
        function() {
            beforeEach(function() {
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
                    webRTCServerConnected().
                    softphoneServerConnected().
                    expectToBeSent();

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
                    userDataFetched().
                    expectToBeSent();

                tester.authorizednessSettingRequest().expectToBeSent();
                tester.authorizednessSettingRequest().expectToBeSent();
                tester.authorizednessGettingRequest().expectToBeSent();
                tester.authorizednessSettingRequest().expectToBeSent();
                tester.submoduleInitilizationRequest().expectToBeSent();
                tester.resizeMessage().expectToBeSent();
                tester.authorizednessGettingRequest().expectToBeSent();
                tester.authorizednessSettingRequest().expectToBeSent();
                tester.appReadyMessage().expectToBeSent();
                tester.unmaximizeMessage().expectToBeSent();
                tester.authorizednessGettingRequest().expectToBeSent();
                tester.authorizednessSettingRequest().expectToBeSent();
                tester.submoduleInitilizationRequest().expectToBeSent();
                tester.unreadMessagesCountSettingRequest().expectToBeSent();
                tester.settingsFetchedMessage().expectToBeSent();
                tester.settingsFetchedMessage().expectToBeSent();
            });

            describe(
                'Происходит подготовка к подключению ко звонку. Поступил входящий звонок с ожидаемого номера.',
            function() {
                let incomingCall;

                beforeEach(function() {
                    tester.ipcPrompterCallPreparationMessage().receive();
                    tester.othersNotification().prompterCallPreparation().expectToBeSent();

                    tester.slavesNotification().
                        additional().
                        thirdContact().
                        visible().
                        expectToBeSent();

                    tester.ipcPrompterCallAwaitMessage().expectToBeSent();

                    incomingCall = tester.incomingCall().receive();
                    tester.callStartMessage().expectToBeSent();

                    tester.slavesNotification().
                        twoChannels().
                        available().
                        incoming().
                        progress().
                        userDataFetched().
                        expectToBeSent();

                    tester.slavesNotification().
                        twoChannels().
                        available().
                        incoming().
                        muted().
                        progress().
                        userDataFetched().
                        expectToBeSent();

                    tester.accountRequest().receiveResponse();
                    tester.numaRequest().normalizedNumber().receiveResponse();

                    tester.firstConnection.connectWebRTC();
                    tester.firstConnection.callTrackHandler();

                    tester.allowMediaInput();
                    tester.firstConnection.addCandidate();

                    incomingCall = incomingCall.expectOkToBeSent();
                });

                describe('Получена информация о звонке.', function() {
                    beforeEach(function() {
                        tester.outCallEvent().receive();
                        tester.outCallEvent().slavesNotification().expectToBeSent();

                        tester.resizeMessage().expectToBeSent();
                    });

                    describe('Звонок принимается автоматически.', function() {
                        beforeEach(function() {
                            incomingCall = incomingCall.receiveResponse();

                            tester.slavesNotification().
                                available().
                                userDataFetched().
                                twoChannels().
                                incoming().
                                muted().
                                confirmed().
                                expectToBeSent();
                        });

                        describe('Завершаю звонок.', function() {
                            beforeEach(function() {
                                tester.stopCallButton.click();

                                tester.callEndMessage().expectToBeSent();
                                tester.resizeMessage().expectToBeSent();

                                tester.slavesNotification().
                                    available().
                                    userDataFetched().
                                    twoChannels().
                                    ended().
                                    expectToBeSent();

                                incomingCall.expectByeRequestToBeSent();
                            });

                            it(
                                'Поступает входящий звонок. Звонок принимается автоматически.',
                            function() {
                                incomingCall = tester.incomingCall().receive();
                                tester.callStartMessage().expectToBeSent();

                                tester.slavesNotification().
                                    twoChannels().
                                    available().
                                    incoming().
                                    progress().
                                    userDataFetched().
                                    expectToBeSent();

                                tester.slavesNotification().
                                    twoChannels().
                                    available().
                                    incoming().
                                    muted().
                                    progress().
                                    userDataFetched().
                                    expectToBeSent();

                                tester.numaRequest().receiveResponse();

                                tester.secondConnection.connectWebRTC();
                                tester.secondConnection.callTrackHandler();

                                tester.allowMediaInput();
                                tester.secondConnection.addCandidate();

                                incomingCall = incomingCall.expectOkToBeSent();

                                tester.outCallEvent().receive();
                                tester.outCallEvent().slavesNotification().expectToBeSent();

                                tester.resizeMessage().expectToBeSent();
                                incomingCall.receiveResponse();

                                tester.slavesNotification().
                                    available().
                                    userDataFetched().
                                    twoChannels().
                                    incoming().
                                    muted().
                                    confirmed().
                                    expectToBeSent();
                            });
                            it(
                                'Проходит некоторое время. Поступает входящий звонок. Звонок не ' +
                                'принимается автоматически.',
                            function() {
                                new Array(6).fill(null).forEach(function () {
                                    spendTime(5000);
                                    tester.expectPingToBeSent();
                                    tester.employeesPing().expectToBeSent();
                                    tester.receivePong();
                                    tester.employeesPing().receive();
                                });

                                incomingCall = tester.incomingCall().receive();
                                tester.callStartMessage().expectToBeSent();

                                tester.slavesNotification().
                                    twoChannels().
                                    available().
                                    incoming().
                                    progress().
                                    userDataFetched().
                                    expectToBeSent();

                                tester.numaRequest().receiveResponse();

                                tester.outCallEvent().receive();
                                tester.outCallEvent().slavesNotification().expectToBeSent();

                                tester.resizeMessage().expectToBeSent();
                                tester.expectIncomingCallSoundToPlay();
                            });
                            it(
                                'Происходит подготовка к подключению ко звонку. Сообщение о том, что ' +
                                'подключение ко звонку уже произведено не отправлено.',
                            function() {
                                tester.ipcPrompterCallPreparationMessage().
                                    anotherPhoneNumber().
                                    receive();

                                tester.othersNotification().
                                    prompterCallPreparation().
                                    anotherPhoneNumber().
                                    expectToBeSent();

                                tester.slavesNotification().
                                    additional().
                                    fourthContact().
                                    visible().
                                    expectToBeSent();

                                tester.ipcPrompterCallAwaitMessage().expectToBeSent();
                            });
                        });
                        it(
                            'Подключение ко звонку завершено. Происходит подготовка к подключению ко ' +
                            'звонку. Сообщение о том, что подключение ко звонку уже ' +
                            'произведено не отправлено.',
                        function() {
                            tester.ipcPrompterCallEndMessage().receive();
                            tester.callEndMessage().expectToBeSent();

                            incomingCall.expectByeRequestToBeSent();
                            tester.resizeMessage().expectToBeSent();

                            tester.slavesNotification().
                                available().
                                userDataFetched().
                                twoChannels().
                                ended().
                                expectToBeSent();

                            tester.ipcPrompterCallPreparationMessage().
                                anotherPhoneNumber().
                                receive();
                            
                            tester.othersNotification().
                                prompterCallPreparation().
                                anotherPhoneNumber().
                                expectToBeSent();

                            tester.slavesNotification().
                                additional().
                                fourthContact().
                                visible().
                                expectToBeSent();

                            tester.ipcPrompterCallAwaitMessage().expectToBeSent();
                        });
                        it(
                            'Происходит подготовка к подключению ко звонку. Отправлено сообщение о ' +
                            'том, что подключение ко звонку уже произведено.',
                        function() {
                            tester.ipcPrompterCallPreparationMessage().
                                anotherPhoneNumber().
                                receive();

                            tester.othersNotification().
                                prompterCallPreparation().
                                anotherPhoneNumber().
                                expectToBeSent();

                            tester.ipcPrompterCallAwaitMessage().
                                alreadyPreparing().
                                expectToBeSent();
                        });
                        it('Кнопки заблокированы.', function() {
                            tester.microphoneButton.expectToHaveClass('clct-call-option--pressed');
                            tester.holdButton.expectToHaveAttribute('disabled');
                            tester.transferButton.expectToHaveClass('cmg-button-disabled');

                            tester.dialpadVisibilityButton.expectNotToHaveClass('cmg-button-disabled');
                            tester.dialpadVisibilityButton.expectNotToHaveClass('cmg-button-pressed');

                            tester.softphone.expectTextContentToHaveSubstring(
                                'Шалева Дора ' +

                                '+7 (916) 123-45-69 00:00 ' +

                                'Путь лида ' +

                                'Виртуальный номер ' +
                                '+7 (916) 123-45-68'
                            );
                        });
                    });
                    it('Рингтон не звучит.', function() {
                        tester.expectNoSoundToPlay();
                    });
                });
                it('Отображен номер полученный из события подготовки к подключению ко звонку..', function() {
                    tester.body.expectTextContentToHaveSubstring('+7 (916) 123-45-69');
                });
            });
            describe('Браузер скрыт. Происходит подготовка к подключению ко звонку.', function() {
                let incomingCall;

                beforeEach(function() {
                    setDocumentVisible(false);

                    tester.slavesNotification().userDataFetched().twoChannels().available().
                        hidden().expectToBeSent();

                    ipcPrompterCallPreparationMessage = tester.ipcPrompterCallPreparationMessage();
                });

                describe('Звонок должен прийти с ожидаемого номера.', function() {
                    beforeEach(function() {
                        ipcPrompterCallPreparationMessage.receive();
                        tester.accountRequest().receiveResponse();

                        tester.othersNotification().
                            prompterCallPreparation().
                            expectToBeSent();
 
                        tester.slavesNotification().
                            additional().
                            thirdContact().
                            visible().
                            expectToBeSent();

                        tester.ipcPrompterCallAwaitMessage().expectToBeSent();
                    });

                    it(
                        'Поступил входящий звонок. Получена информация о звонке. Звонок принимается автоматически. ' +
                        'Отображается уведомление с заголовком "Подключение к звонку".',
                    function() {
                        incomingCall = tester.incomingCall().receive();
                        tester.callStartMessage().expectToBeSent();

                        tester.slavesNotification().
                            twoChannels().
                            available().
                            incoming().
                            progress().
                            hidden().
                            userDataFetched().
                            expectToBeSent();

                        tester.slavesNotification().
                            twoChannels().
                            available().
                            incoming().
                            muted().
                            progress().
                            hidden().
                            userDataFetched().
                            expectToBeSent();

                        tester.numaRequest().receiveResponse();

                        tester.firstConnection.connectWebRTC();
                        tester.firstConnection.callTrackHandler();

                        tester.allowMediaInput();
                        tester.firstConnection.addCandidate();

                        tester.outCallEvent().receive();
                        tester.outCallEvent().slavesNotification().expectToBeSent();

                        tester.resizeMessage().expectToBeSent();
                        incomingCall.expectOkToBeSent().receiveResponse();

                        tester.slavesNotification().
                            available().
                            userDataFetched().
                            twoChannels().
                            incoming().
                            muted().
                            confirmed().
                            hidden().
                            expectToBeSent();

                        notificationTester.grantPermission().recentNotification().
                            expectToHaveTitle('Подключение к звонку').
                            expectToHaveBody('Шалева Дора Добриновна +7 (916) 123-45-69');
                    });
                    it(
                        'Получена информация о звонке. Поступил входящий звонок. Звонок принимается автоматически. ' +
                        'Отображается уведомление с заголовком "Подключение к звонку".',
                    function() {
                        tester.outCallEvent().receive();
                        tester.outCallEvent().slavesNotification().expectToBeSent();

                        incomingCall = tester.incomingCall().receive();

                        tester.resizeMessage().expectToBeSent();
                        tester.callStartMessage().expectToBeSent();

                        tester.slavesNotification().
                            twoChannels().
                            available().
                            incoming().
                            progress().
                            hidden().
                            userDataFetched().
                            expectToBeSent();

                        tester.slavesNotification().
                            twoChannels().
                            available().
                            incoming().
                            muted().
                            progress().
                            hidden().
                            userDataFetched().
                            expectToBeSent();

                        tester.numaRequest().receiveResponse();

                        tester.firstConnection.connectWebRTC();
                        tester.firstConnection.callTrackHandler();

                        tester.allowMediaInput();
                        tester.firstConnection.addCandidate();

                        incomingCall.expectOkToBeSent().receiveResponse();

                        tester.slavesNotification().
                            available().
                            userDataFetched().
                            twoChannels().
                            incoming().
                            muted().
                            confirmed().
                            hidden().
                            expectToBeSent();

                        notificationTester.
                            grantPermission().
                            recentNotification().
                            expectToHaveTitle('Подключение к звонку').
                            expectToHaveBody('Шалева Дора Добриновна +7 (916) 123-45-69');
                    });
                });
                it(
                    'Поступил входящий звонок с номером отличающимся от ожидаемого. Отображается ' +
                    'уведомление с заголовком "Входящий вызов".',
                function() {
                    ipcPrompterCallPreparationMessage.
                        anotherPhoneNumber().
                        receive();

                    tester.accountRequest().receiveResponse();

                    tester.othersNotification().
                        prompterCallPreparation().
                        anotherPhoneNumber().
                        expectToBeSent();

                    tester.slavesNotification().
                        additional().
                        fourthContact().
                        visible().
                        expectToBeSent();

                    tester.ipcPrompterCallAwaitMessage().expectToBeSent();
                    tester.incomingCall().receive();

                    tester.callStartMessage().expectToBeSent();

                    tester.slavesNotification().
                        twoChannels().
                        available().
                        incoming().
                        progress().
                        userDataFetched().
                        hidden().
                        expectToBeSent();

                    tester.numaRequest().receiveResponse();

                    tester.outCallEvent().receive();
                    tester.outCallEvent().slavesNotification().expectToBeSent();

                    tester.resizeMessage().expectToBeSent();

                    notificationTester.grantPermission().
                        recentNotification().
                        expectToHaveTitle('Входящий звонок').
                        expectToHaveBody('Шалева Дора, +7 (916) 123-45-67, somesite.com');
                });
                it(
                    'Уведомление не должно отобразиться. Поступил входящий звонок с ожидаемого номера. ' +
                    'Звонок принимается автоматически. Уведомление не отображается.',
                function() {
                    ipcPrompterCallPreparationMessage.dontShowNotification().receive();
                    tester.accountRequest().receiveResponse();

                    tester.othersNotification().
                        prompterCallPreparation().
                        dontShowNotification().
                        expectToBeSent();

                    tester.slavesNotification().
                        additional().
                        thirdContact().
                        visible().
                        expectToBeSent();

                    tester.ipcPrompterCallAwaitMessage().expectToBeSent();

                    incomingCall = tester.incomingCall().receive();
                    tester.callStartMessage().expectToBeSent();

                    tester.slavesNotification().
                        twoChannels().
                        available().
                        incoming().
                        progress().
                        userDataFetched().
                        hidden().
                        expectToBeSent();

                    tester.slavesNotification().
                        twoChannels().
                        available().
                        incoming().
                        muted().
                        progress().
                        userDataFetched().
                        hidden().
                        expectToBeSent();

                    tester.numaRequest().receiveResponse();

                    tester.firstConnection.connectWebRTC();
                    tester.firstConnection.callTrackHandler();

                    tester.allowMediaInput();
                    tester.firstConnection.addCandidate();

                    tester.outCallEvent().receive();
                    tester.outCallEvent().slavesNotification().expectToBeSent();

                    tester.resizeMessage().expectToBeSent();
                    incomingCall.expectOkToBeSent().receiveResponse();

                    tester.slavesNotification().
                        available().
                        userDataFetched().
                        twoChannels().
                        incoming().
                        muted().
                        confirmed().
                        hidden().
                        expectToBeSent();
                });
            });
            describe('Софтфон открыт в другом окне.', function() {
                beforeEach(function() {
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
                    
                    spendTime(2000);
                    tester.webrtcWebsocket.finishDisconnecting();
                });

                describe('На активной вкладке происходит подготовка к подключению ко звонку.', function() {
                    beforeEach(function() {
                        tester.ipcPrompterCallPreparationMessage().receive();

                        tester.othersNotification().
                            prompterCallPreparation().
                            expectToBeSent();

                        tester.slavesNotification().expectToBeSent();

                        tester.slavesNotification().
                            additional().
                            visible().
                            expectToBeSent();
                        
                        tester.slavesNotification().
                            additional().
                            thirdContact().
                            visible().
                            expectToBeSent();

                        tester.authCheckRequest().receiveResponse();
                        tester.accountRequest().receiveResponse();
                        tester.talkOptionsRequest().receiveResponse();
                        tester.permissionsRequest().receiveResponse();
                        tester.settingsRequest().receiveResponse();

                        tester.slavesNotification().
                            twoChannels().
                            enabled().
                            expectToBeSent();

                        tester.connectEventsWebSocket(1);

                        tester.slavesNotification().
                            twoChannels().
                            enabled().
                            softphoneServerConnected().
                            expectToBeSent();

                        tester.connectSIPWebSocket(1);

                        tester.slavesNotification().
                            twoChannels().
                            webRTCServerConnected().
                            softphoneServerConnected().
                            expectToBeSent();

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
                    });

                    it(
                        'Софтфон активируется. Вызвано событие ожидания подключения ко звонку. Поступает входящий ' +
                        'звонок. Кнопки заблокированы.',
                    function() {
                        tester.allowMediaInput();

                        tester.slavesNotification().
                            twoChannels().
                            available().
                            userDataFetched().
                            expectToBeSent();

                        tester.settingsFetchedMessage().expectToBeSent();
                        tester.ipcPrompterCallAwaitMessage().expectToBeSent();
                        tester.settingsFetchedMessage().expectToBeSent();

                        let incomingCall = tester.incomingCall().receive();
                        tester.callStartMessage().expectToBeSent();

                        tester.slavesNotification().
                            twoChannels().
                            available().
                            incoming().
                            progress().
                            userDataFetched().
                            expectToBeSent();

                        tester.slavesNotification().
                            twoChannels().
                            available().
                            incoming().
                            muted().
                            progress().
                            userDataFetched().
                            expectToBeSent();

                        tester.numaRequest().receiveResponse();

                        tester.firstConnection.connectWebRTC();
                        tester.firstConnection.callTrackHandler();

                        tester.allowMediaInput();
                        tester.firstConnection.addCandidate();

                        tester.outCallEvent().receive();
                        tester.outCallEvent().slavesNotification().expectToBeSent();

                        tester.resizeMessage().expectToBeSent();
                        incomingCall.expectOkToBeSent().receiveResponse();

                        tester.slavesNotification().
                            available().
                            userDataFetched().
                            twoChannels().
                            incoming().
                            muted().
                            confirmed().
                            expectToBeSent();

                        tester.stopCallButton.expectNotToHaveAttribute('disabled');
                        tester.microphoneButton.expectToHaveClass('clct-call-option--pressed');
                        tester.holdButton.expectToHaveAttribute('disabled');
                        tester.transferButton.expectToHaveClass('cmg-button-disabled');

                        tester.dialpadVisibilityButton.expectNotToHaveClass('cmg-button-disabled');
                        tester.dialpadVisibilityButton.expectNotToHaveClass('cmg-button-pressed');

                        tester.softphone.expectTextContentToHaveSubstring(
                            'Шалева Дора ' +

                            '+7 (916) 123-45-69 00:00 ' +

                            'Путь лида ' +

                            'Виртуальный номер ' +
                            '+7 (916) 123-45-68'
                        );
                    });
                    it('Событие ожидания подключения ко звонку не вызвано.', function() {
                        userMedia.expectToBeRequested();
                        tester.eventBus.nextEvent().expectNotToExist();
                    });
                });
                it(
                    'Происходит подготовка к подключению ко звонку на другой вкладке. Софтфон активируется заново. ' +
                    'Поступает входящий звонок. Кнопки заблокированы.',
                function() {
                    tester.othersNotification().
                        prompterCallPreparation().
                        receive();

                    tester.slavesNotification().expectToBeSent();

                    tester.slavesNotification().
                        additional().
                        expectToBeSent();
                    
                    tester.slavesNotification().
                        additional().
                        thirdContact().
                        expectToBeSent();

                    tester.authCheckRequest().receiveResponse();
                    tester.talkOptionsRequest().receiveResponse();
                    tester.permissionsRequest().receiveResponse();
                    tester.settingsRequest().receiveResponse();
                    
                    tester.slavesNotification().
                        twoChannels().
                        enabled().
                        expectToBeSent();

                    tester.connectEventsWebSocket(1);

                    tester.slavesNotification().
                        twoChannels().
                        enabled().
                        softphoneServerConnected().
                        expectToBeSent();

                    tester.connectSIPWebSocket(1);

                    tester.slavesNotification().
                        twoChannels().
                        webRTCServerConnected().
                        softphoneServerConnected().
                        expectToBeSent();

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
                        userDataFetched().
                        expectToBeSent();

                    tester.settingsFetchedMessage().expectToBeSent();
                    tester.settingsFetchedMessage().expectToBeSent();

                    let incomingCall = tester.incomingCall().receive();
                    tester.callStartMessage().expectToBeSent();

                    tester.slavesNotification().
                        twoChannels().
                        available().
                        incoming().
                        progress().
                        userDataFetched().
                        expectToBeSent();

                    tester.slavesNotification().
                        twoChannels().
                        available().
                        incoming().
                        muted().
                        progress().
                        userDataFetched().
                        expectToBeSent();

                    tester.numaRequest().receiveResponse();
                    tester.accountRequest().receiveResponse();

                    tester.firstConnection.connectWebRTC();
                    tester.firstConnection.callTrackHandler();

                    tester.allowMediaInput();
                    tester.firstConnection.addCandidate();

                    tester.outCallEvent().receive();
                    tester.outCallEvent().slavesNotification().expectToBeSent();

                    tester.resizeMessage().expectToBeSent();

                    incomingCall.
                        expectOkToBeSent().
                        receiveResponse();

                    tester.slavesNotification().
                        available().
                        userDataFetched().
                        twoChannels().
                        incoming().
                        muted().
                        confirmed().
                        expectToBeSent();

                    tester.stopCallButton.expectNotToHaveAttribute('disabled');
                    tester.microphoneButton.expectToHaveClass('clct-call-option--pressed');
                    tester.holdButton.expectToHaveAttribute('disabled');
                    tester.transferButton.expectToHaveClass('cmg-button-disabled');

                    tester.dialpadVisibilityButton.expectNotToHaveClass('cmg-button-disabled');
                    tester.dialpadVisibilityButton.expectNotToHaveClass('cmg-button-pressed');

                    tester.softphone.expectTextContentToHaveSubstring(
                        'Шалева Дора ' +

                        '+7 (916) 123-45-69 00:00 ' +

                        'Путь лида ' +

                        'Виртуальный номер ' +
                        '+7 (916) 123-45-68'
                    );
                });
            });
            it(
                'Получена информация о звонке. Происходит подготовка к подключению ко звонку. Номер клинета ' +
                'неизвестен. Поступил входящий звонок с ожидаемого номера. Отображен номер полученный из события ' +
                'входящего звонка.',
            function() {
                tester.outCallEvent().receive();

                tester.outCallEvent().
                    slavesNotification().
                    expectToBeSent();

                tester.ipcPrompterCallPreparationMessage().
                    noSubscriberNumber().
                    receive();

                tester.accountRequest().receiveResponse();

                tester.othersNotification().
                    prompterCallPreparation().
                    noSubscriberNumber().
                    expectToBeSent();
                        
                tester.ipcPrompterCallAwaitMessage().expectToBeSent();

                tester.slavesNotification().
                    additional().
                    thirdContact().
                    visible().
                    outCallEvent().include().
                    expectToBeSent();

                incomingCall = tester.incomingCall().receive();

                tester.resizeMessage().expectToBeSent();
                tester.callStartMessage().expectToBeSent();

                tester.slavesNotification().
                    twoChannels().
                    available().
                    incoming().
                    progress().
                    userDataFetched().
                    expectToBeSent();

                tester.slavesNotification().
                    twoChannels().
                    available().
                    incoming().
                    muted().
                    progress().
                    userDataFetched().
                    expectToBeSent();

                tester.numaRequest().receiveResponse();

                tester.firstConnection.connectWebRTC();
                tester.firstConnection.callTrackHandler();

                tester.allowMediaInput();
                tester.firstConnection.addCandidate();

                incomingCall.expectOkToBeSent().receiveResponse();

                tester.slavesNotification().
                    twoChannels().
                    available().
                    incoming().
                    muted().
                    confirmed().
                    userDataFetched().
                    expectToBeSent();

                tester.softphone.expectTextContentToHaveSubstring(
                    'Шалева Дора ' +

                    '+7 (916) 123-45-67 00:00 ' +

                    'Путь лида ' +

                    'Виртуальный номер ' +
                    '+7 (916) 123-45-68'
                );
            });
            it(
                'Происходит подготовка к подключению ко звонку. Поступил входящий звонок с ожидаемого номера. ' +
                'Получена информация о звонке. Звонок принимается автоматически. Кнопки заблокированы.',
            function() {
                tester.othersNotification().
                    prompterCallPreparation().
                    receive();

                tester.slavesNotification().
                    additional().
                    thirdContact().
                    expectToBeSent();

                let incomingCall = tester.incomingCall().receive();
                tester.callStartMessage().expectToBeSent();

                tester.slavesNotification().
                    twoChannels().
                    available().
                    incoming().
                    progress().
                    userDataFetched().
                    expectToBeSent();

                tester.slavesNotification().
                    twoChannels().
                    available().
                    incoming().
                    muted().
                    progress().
                    userDataFetched().
                    expectToBeSent();

                tester.numaRequest().receiveResponse();
                tester.accountRequest().receiveResponse();

                tester.firstConnection.connectWebRTC();
                tester.firstConnection.callTrackHandler();

                tester.allowMediaInput();
                tester.firstConnection.addCandidate();

                incomingCall = incomingCall.expectOkToBeSent();

                tester.outCallEvent().receive();
                tester.outCallEvent().slavesNotification().expectToBeSent();

                tester.resizeMessage().expectToBeSent();
                incomingCall = incomingCall.receiveResponse();

                tester.slavesNotification().
                    available().
                    userDataFetched().
                    twoChannels().
                    incoming().
                    muted().
                    confirmed().
                    expectToBeSent();

                tester.microphoneButton.expectToHaveClass('clct-call-option--pressed');
                tester.holdButton.expectToHaveAttribute('disabled');
                tester.transferButton.expectToHaveClass('cmg-button-disabled');

                tester.dialpadVisibilityButton.expectNotToHaveClass('cmg-button-disabled');
                tester.dialpadVisibilityButton.expectNotToHaveClass('cmg-button-pressed');

                tester.softphone.expectTextContentToHaveSubstring(
                    'Шалева Дора ' +

                    '+7 (916) 123-45-69 00:00 ' +

                    'Путь лида ' +

                    'Виртуальный номер ' +
                    '+7 (916) 123-45-68'
                );
            });
        });
        describe('Вкладка является ведомой.', function() {
            beforeEach(function() {
                tester.masterInfoMessage().
                    isNotMaster().
                    receive();

                tester.masterInfoMessage().
                    applyLeader().
                    expectToBeSent();

                tester.masterNotification().
                    tabOpened().
                    expectToBeSent();

                authCheckRequest.receiveResponse();
                tester.talkOptionsRequest().receiveResponse();

                tester.permissionsRequest().
                    allowNumberCapacitySelect().
                    allowNumberCapacityUpdate().
                    receiveResponse();

                tester.settingsRequest().allowNumberCapacitySelect().receiveResponse();

                tester.notificationChannel().
                    applyLeader().
                    expectToBeSent();

                tester.notificationChannel().
                    applyLeader().
                    expectToBeSent();

                notificationTester.grantPermission();

                tester.numberCapacityRequest().receiveResponse();
                tester.authenticatedUserRequest().receiveResponse();

                tester.slavesNotification().
                    userDataFetched().
                    twoChannels().
                    available().
                    receive();

                tester.authorizednessSettingRequest().expectToBeSent();
                tester.authorizednessSettingRequest().expectToBeSent();
                tester.authorizednessGettingRequest().expectToBeSent();
                tester.authorizednessSettingRequest().expectToBeSent();
                tester.submoduleInitilizationRequest().expectToBeSent();
                tester.resizeMessage().expectToBeSent();
                tester.authorizednessGettingRequest().expectToBeSent();
                tester.authorizednessSettingRequest().expectToBeSent();
                tester.appReadyMessage().expectToBeSent();
                tester.unmaximizeMessage().expectToBeSent();
                tester.authorizednessGettingRequest().expectToBeSent();
                tester.authorizednessSettingRequest().expectToBeSent();
                tester.submoduleInitilizationRequest().expectToBeSent();
                tester.unreadMessagesCountSettingRequest().expectToBeSent();
                tester.settingsFetchedMessage().expectToBeSent();
                tester.settingsFetchedMessage().expectToBeSent();

                tester.button('Софтфон').click();

                tester.masterNotification().
                    toggleWidgetVisiblity().
                    expectToBeSent();

                tester.slavesNotification().
                    additional().
                    visible().
                    receive();

                tester.accountRequest().receiveResponse();
            });

            describe('Софтфон открыт в другом окне.', function() {
                beforeEach(function() {
                    tester.slavesNotification().
                        userDataFetched().
                        twoChannels().
                        appAlreadyOpened().
                        enabled().
                        microphoneAccessGranted().
                        receive();

                    tester.authLogoutRequest().receiveResponse();
                });

                describe('Подготовка к подключению ко звонку происходит на активной вкладке.', function() {
                    beforeEach(function() {
                        tester.ipcPrompterCallPreparationMessage().receive();
                        tester.othersNotification().prompterCallPreparation().expectToBeSent();

                        tester.slavesNotification().receive();
                        tester.slavesNotification().additional().thirdContact().receive();

                        tester.masterNotification().tabOpened().expectToBeSent();

                        tester.authCheckRequest().receiveResponse();
                        tester.talkOptionsRequest().receiveResponse();
                        tester.permissionsRequest().receiveResponse();
                        tester.settingsRequest().receiveResponse();

                        tester.authenticatedUserRequest().receiveResponse();

                        tester.employeesBroadcastChannel().
                            tellIsLeader().
                            expectToBeSent();

                        tester.employeesWebSocket.connect();
                        tester.employeesInitMessage().expectToBeSent();

                        tester.notificationChannel().
                            tellIsLeader().
                            expectToBeSent();

                        tester.slavesNotification().
                            twoChannels().
                            enabled().
                            receive();

                        tester.slavesNotification().
                            twoChannels().
                            enabled().
                            softphoneServerConnected().
                            receive();

                        tester.slavesNotification().
                            twoChannels().
                            webRTCServerConnected().
                            softphoneServerConnected().
                            receive();

                        tester.slavesNotification().
                            twoChannels().
                            webRTCServerConnected().
                            softphoneServerConnected().
                            userDataFetched().
                            receive();

                        tester.slavesNotification().
                            twoChannels().
                            webRTCServerConnected().
                            softphoneServerConnected().
                            userDataFetched().
                            registered().
                            receive();
                    });

                    it(
                        'Софтфон активируется. Вызвано событие ожидания подключения ко звонку. Поступил входящий ' +
                        'звонок. Кнопки заблокированы.',
                    function() {
                        tester.slavesNotification().
                            twoChannels().
                            available().
                            userDataFetched().
                            receive();

                        tester.ipcPrompterCallAwaitMessage().expectToBeSent();
                        tester.settingsFetchedMessage().expectToBeSent();
                        tester.settingsFetchedMessage().expectToBeSent();

                        tester.slavesNotification().
                            twoChannels().
                            available().
                            incoming().
                            muted().
                            progress().
                            userDataFetched().
                            receive();

                        tester.callStartMessage().expectToBeSent();
                        tester.accountRequest().receiveResponse();

                        tester.slavesNotification().
                            twoChannels().
                            available().
                            incoming().
                            progress().
                            userDataFetched().
                            receive();

                        tester.outCallEvent().slavesNotification().receive();
                        tester.resizeMessage().expectToBeSent();

                        tester.slavesNotification().
                            available().
                            userDataFetched().
                            twoChannels().
                            incoming().
                            muted().
                            confirmed().
                            receive();

                        tester.stopCallButton.expectNotToHaveAttribute('disabled');
                        tester.microphoneButton.expectToHaveClass('clct-call-option--pressed');
                        tester.holdButton.expectToHaveAttribute('disabled');
                        tester.transferButton.expectToHaveClass('cmg-button-disabled');

                        tester.dialpadVisibilityButton.expectNotToHaveClass('cmg-button-disabled');
                        tester.dialpadVisibilityButton.expectNotToHaveClass('cmg-button-pressed');

                        tester.softphone.expectTextContentToHaveSubstring(
                            'Шалева Дора ' +

                            '+7 (916) 123-45-69 00:00 ' +

                            'Путь лида ' +

                            'Виртуальный номер ' +
                            '+7 (916) 123-45-68'
                        );
                    });
                    it('Событие ожидания подключения ко звонку не вызвано.', function() {
                        tester.eventBus.nextEvent().expectNotToExist();
                    });
                });
                it(
                    'Подготовка к подключению ко звонку происходит на другой вкладке. Софтфон активируется. ' +
                    'Поступил входящий звонок. Кнопки заблокированы.',
                function() {
                    tester.othersNotification().prompterCallPreparation().receive();

                    tester.slavesNotification().receive();
                    tester.slavesNotification().additional().receive();

                    tester.masterNotification().tabOpened().expectToBeSent();

                    tester.authCheckRequest().receiveResponse();
                    tester.talkOptionsRequest().receiveResponse();
                    tester.permissionsRequest().receiveResponse();
                    tester.settingsRequest().receiveResponse();

                    tester.employeesBroadcastChannel().
                        tellIsLeader().
                        expectToBeSent();

                    tester.employeesWebSocket.connect();
                    tester.employeesInitMessage().expectToBeSent();

                    tester.notificationChannel().
                        tellIsLeader().
                        expectToBeSent();

                    tester.authenticatedUserRequest().receiveResponse();

                    tester.slavesNotification().
                        twoChannels().
                        enabled().
                        receive();

                    tester.slavesNotification().
                        twoChannels().
                        enabled().
                        softphoneServerConnected().
                        receive();

                    tester.slavesNotification().
                        twoChannels().
                        webRTCServerConnected().
                        softphoneServerConnected().
                        receive();

                    tester.slavesNotification().
                        twoChannels().
                        webRTCServerConnected().
                        softphoneServerConnected().
                        userDataFetched().
                        receive();

                    tester.slavesNotification().
                        twoChannels().
                        webRTCServerConnected().
                        softphoneServerConnected().
                        userDataFetched().
                        registered().
                        receive();

                    tester.slavesNotification().
                        twoChannels().
                        available().
                        userDataFetched().
                        receive();

                    tester.settingsFetchedMessage().expectToBeSent();
                    tester.settingsFetchedMessage().expectToBeSent();

                    tester.slavesNotification().
                        twoChannels().
                        available().
                        incoming().
                        muted().
                        progress().
                        userDataFetched().
                        receive();

                    tester.accountRequest().receiveResponse();
                    tester.callStartMessage().expectToBeSent();

                    tester.slavesNotification().
                        twoChannels().
                        available().
                        incoming().
                        progress().
                        userDataFetched().
                        receive();

                    tester.outCallEvent().slavesNotification().receive();
                    tester.resizeMessage().expectToBeSent();

                    tester.slavesNotification().
                        available().
                        userDataFetched().
                        twoChannels().
                        incoming().
                        muted().
                        confirmed().
                        receive();

                    tester.stopCallButton.expectNotToHaveAttribute('disabled');
                    tester.microphoneButton.expectToHaveClass('clct-call-option--pressed');
                    tester.holdButton.expectToHaveAttribute('disabled');
                    tester.transferButton.expectToHaveClass('cmg-button-disabled');

                    tester.dialpadVisibilityButton.expectNotToHaveClass('cmg-button-disabled');
                    tester.dialpadVisibilityButton.expectNotToHaveClass('cmg-button-pressed');

                    tester.softphone.expectTextContentToHaveSubstring(
                        'Шалева Дора ' +

                        '+7 (916) 123-45-69 00:00 ' +

                        'Путь лида ' +

                        'Виртуальный номер ' +
                        '+7 (916) 123-45-68'
                    );
                });
            });
            it(
                'Скрываю вкладку. Из другой вкладки передано сообщение о подготовке к подключению ко звонку. ' +
                'Поступил входящий звонок с ожидаемого номера. Уведомление не отображается.',
            function() {
                setDocumentVisible(false);
                tester.masterNotification().tabBecameHidden().expectToBeSent();

                tester.othersNotification().prompterCallPreparation().receive();

                tester.slavesNotification().
                    twoChannels().
                    available().
                    incoming().
                    muted().
                    progress().
                    userDataFetched().
                    receive();

                tester.callStartMessage().expectToBeSent();

                tester.slavesNotification().
                    twoChannels().
                    available().
                    incoming().
                    progress().
                    userDataFetched().
                    receive();

                tester.outCallEvent().
                    slavesNotification().
                    receive();

                tester.resizeMessage().expectToBeSent();

                tester.slavesNotification().
                    available().
                    userDataFetched().
                    twoChannels().
                    incoming().
                    muted().
                    confirmed().
                    receive();
            });
            it('Поступил входящий звонок с ожидаемого номера. Кнопки заблокированы.', function() {
                tester.othersNotification().prompterCallPreparation().receive();

                tester.slavesNotification().
                    twoChannels().
                    available().
                    incoming().
                    muted().
                    progress().
                    userDataFetched().
                    receive();

                tester.callStartMessage().expectToBeSent();

                tester.slavesNotification().
                    twoChannels().
                    available().
                    incoming().
                    progress().
                    userDataFetched().
                    receive();

                tester.outCallEvent().
                    slavesNotification().
                    receive();

                tester.resizeMessage().expectToBeSent();

                tester.slavesNotification().
                    available().
                    userDataFetched().
                    twoChannels().
                    incoming().
                    muted().
                    confirmed().
                    receive();

                tester.microphoneButton.expectToHaveClass('clct-call-option--pressed');
                tester.holdButton.expectToHaveAttribute('disabled');
                tester.transferButton.expectToHaveClass('cmg-button-disabled');

                tester.dialpadVisibilityButton.expectNotToHaveClass('cmg-button-disabled');
                tester.dialpadVisibilityButton.expectNotToHaveClass('cmg-button-pressed');

                tester.softphone.expectTextContentToHaveSubstring(
                    'Шалева Дора ' +

                    '+7 (916) 123-45-69 00:00 ' +

                    'Путь лида ' +

                    'Виртуальный номер ' +
                    '+7 (916) 123-45-68'
                );
            });
            it(
                'Происходит подготовка к подключению ко звонку. В другие вкладки передано сообщение о подготовке к ' +
                'подключению ко звонку.',
            function() {
                tester.ipcPrompterCallPreparationMessage().receive();
                
                tester.slavesNotification().
                    additional().
                    thirdContact().
                    visible().
                    receive();

                tester.othersNotification().
                    prompterCallPreparation().
                    expectToBeSent();

                tester.ipcPrompterCallAwaitMessage().expectToBeSent();

                tester.slavesNotification().
                    twoChannels().
                    available().
                    incoming().
                    muted().
                    progress().
                    userDataFetched().
                    receive();

                tester.callStartMessage().expectToBeSent();

                tester.slavesNotification().
                    twoChannels().
                    available().
                    incoming().
                    progress().
                    userDataFetched().
                    receive();

                tester.outCallEvent().
                    slavesNotification().
                    receive();

                tester.resizeMessage().expectToBeSent();

                tester.slavesNotification().
                    available().
                    userDataFetched().
                    twoChannels().
                    incoming().
                    muted().
                    confirmed().
                    receive();

                tester.microphoneButton.expectToHaveClass('clct-call-option--pressed');
                tester.holdButton.expectToHaveAttribute('disabled');
                tester.transferButton.expectToHaveClass('cmg-button-disabled');

                tester.dialpadVisibilityButton.expectNotToHaveClass('cmg-button-disabled');
                tester.dialpadVisibilityButton.expectNotToHaveClass('cmg-button-pressed');

                tester.softphone.expectTextContentToHaveSubstring(
                    'Шалева Дора ' +

                    '+7 (916) 123-45-69 00:00 ' +

                    'Путь лида ' +

                    'Виртуальный номер ' +
                    '+7 (916) 123-45-68'
                );
            });
        });
    });
});
