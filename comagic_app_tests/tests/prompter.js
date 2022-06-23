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

    describe('Открываю новый личный кабинет. Фичафлаг софтфона включен.', function() {
        let tester,
            ipcPrompterCallPreparationMessage;

        beforeEach(function() {
            setNow('2019-12-19T12:10:06');

            tester = new Tester(options);

            tester.input.withFieldLabel('Логин').fill('botusharova');
            tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

            tester.button('Войти').click();

            tester.loginRequest().receiveResponse();
            tester.accountRequest().receiveResponse();

            const requests = ajax.inAnyOrder();

            const reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
                reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                secondAccountRequest = tester.accountRequest().expectToBeSent(requests);

            requests.expectToBeSent();

            reportGroupsRequest.receiveResponse();
            reportsListRequest.receiveResponse();
            reportTypesRequest.receiveResponse();
            secondAccountRequest.receiveResponse();

            tester.configRequest().softphone().receiveResponse();
        });

        describe(
            'Вкладка является ведущей. Получены права. Получены настройки софтфона. Получен доступ к микрофону. ' +
            'SIP-линия зарегистрирована. Получены данные для отчета. SIP-регистрация завершена.',
        function() {
            beforeEach(function() {
                tester.masterInfoMessage().receive();
                tester.slavesNotification().expectToBeSent();
                tester.slavesNotification().additional().expectToBeSent();
                tester.masterInfoMessage().tellIsLeader().expectToBeSent();

                tester.authCheckRequest().receiveResponse();
                tester.statusesRequest().receiveResponse();

                tester.settingsRequest().receiveResponse();
                tester.talkOptionsRequest().receiveResponse();
                tester.permissionsRequest().receiveResponse();

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

                tester.othersNotification().
                    widgetStateUpdate().
                    expectToBeSent();

                tester.othersNotification().
                    updateSettings().
                    shouldNotPlayCallEndingSignal().
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
            });

            afterEach(function() {
                tester.eventBus.nextEvent().expectNotToExist();
            });

            describe('Происходит подготовка к подключению ко звонку.', function() {
                beforeEach(function() {
                    ipcPrompterCallPreparationMessage = tester.ipcPrompterCallPreparationMessage();
                });

                describe('Поступил входящий звонок с ожидаемого номера.', function() {
                    let incomingCall;
                    
                    beforeEach(function() {
                        ipcPrompterCallPreparationMessage.receive();
                        tester.othersNotification().prompterCallPreparation().expectToBeSent();

                        tester.ipcPrompterCallAwaitMessage().expectToBeSent();

                        incomingCall = tester.incomingCall().receive();

                        tester.slavesNotification().
                            twoChannels().
                            available().
                            incoming().
                            muted().
                            progress().
                            userDataFetched().
                            expectToBeSent();

                        tester.slavesNotification().
                            twoChannels().
                            available().
                            incoming().
                            progress().
                            userDataFetched().
                            expectToBeSent();

                        tester.numaRequest().receiveResponse();

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

                                    tester.slavesNotification().
                                        available().
                                        userDataFetched().
                                        twoChannels().
                                        ended().
                                        expectToBeSent();

                                    incomingCall.expectByeRequestToBeSent();
                                    tester.callSessionFinish().thirdId().slavesNotification().expectToBeSent();
                                });

                                it(
                                    'Поступает входящий звонок. Звонок принимается автоматически.',
                                function() {
                                    incomingCall = tester.incomingCall().receive();

                                    tester.slavesNotification().
                                        twoChannels().
                                        available().
                                        incoming().
                                        muted().
                                        progress().
                                        userDataFetched().
                                        expectToBeSent();

                                    tester.slavesNotification().
                                        twoChannels().
                                        available().
                                        incoming().
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
                                        tester.receivePong();
                                    });

                                    incomingCall = tester.incomingCall().receive();

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

                                    tester.expectIncomingCallSoundToPlay();
                                });
                                it(
                                    'Происходит подготовка к подключению ко звонку. Сообщение о том, что ' +
                                    'подключение ко звонку уже произведено не отправлено.',
                                function() {
                                    tester.ipcPrompterCallPreparationMessage().anotherPhoneNumber().receive();

                                    tester.othersNotification().prompterCallPreparation().anotherPhoneNumber().
                                        expectToBeSent();

                                    tester.ipcPrompterCallAwaitMessage().anotherPhoneNumber().expectToBeSent();
                                });
                            });
                            it(
                                'Подключение ко звонку завершено. Происходит подготовка к подключению ко ' +
                                'звонку. Сообщение о том, что подключение ко звонку уже ' +
                                'произведено не отправлено.',
                            function() {
                                tester.ipcPrompterCallEndMessage().receive();

                                incomingCall.expectByeRequestToBeSent();
                                tester.callSessionFinish().thirdId().slavesNotification().expectToBeSent();

                                tester.slavesNotification().
                                    available().
                                    userDataFetched().
                                    twoChannels().
                                    ended().
                                    expectToBeSent();

                                tester.ipcPrompterCallPreparationMessage().anotherPhoneNumber().receive();
                                
                                tester.othersNotification().prompterCallPreparation().anotherPhoneNumber().
                                    expectToBeSent();

                                tester.ipcPrompterCallAwaitMessage().anotherPhoneNumber().expectToBeSent();
                            });
                            it(
                                'Происходит подготовка к подключению ко звонку. Отправлено сообщение о ' +
                                'том, что подключение ко звонку уже произведено.',
                            function() {
                                tester.ipcPrompterCallPreparationMessage().anotherPhoneNumber().receive();

                                tester.othersNotification().prompterCallPreparation().anotherPhoneNumber().
                                    expectToBeSent();

                                tester.ipcAlreadyPrompterMessage().expectToBeSent();
                            });
                            it('Кнопки заблокированы.', function() {
                                tester.microphoneButton.expectToHaveClass('clct-call-option--pressed');
                                tester.holdButton.expectToHaveAttribute('disabled');
                                tester.transferButton.expectToHaveClass('cmg-button-disabled');

                                tester.dialpadVisibilityButton.expectToHaveClass('cmg-button-disabled');
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
            });
            describe('Браузер скрыт. Происходит подготовка к подключению ко звонку.', function() {
                let incomingCall;

                beforeEach(function() {
                    setDocumentVisible(false);

                    tester.slavesNotification().userDataFetched().twoChannels().available().
                        hidden().expectToBeSent();

                    ipcPrompterCallPreparationMessage = tester.ipcPrompterCallPreparationMessage();
                });

                it(
                    'Поступил входящий звонок с ожидаемого номера. Получена информация о звонке. Звонок принимается ' +
                    'автоматически. Отображается уведомление с заголовком "Подключение к звонку".',
                function() {
                    ipcPrompterCallPreparationMessage.receive();
                    tester.othersNotification().prompterCallPreparation().expectToBeSent();

                    tester.ipcPrompterCallAwaitMessage().expectToBeSent();

                    incomingCall = tester.incomingCall().receive();

                    tester.slavesNotification().
                        twoChannels().
                        available().
                        incoming().
                        muted().
                        progress().
                        hidden().
                        userDataFetched().
                        expectToBeSent();

                    tester.slavesNotification().
                        twoChannels().
                        available().
                        incoming().
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
                    'Поступил входящий звонок с номером отличающимся от ожидаемого. Отображается ' +
                    'уведомление с заголовком "Входящий вызов".',
                function() {
                    ipcPrompterCallPreparationMessage.anotherPhoneNumber().receive();
                    tester.othersNotification().prompterCallPreparation().anotherPhoneNumber().expectToBeSent();

                    tester.ipcPrompterCallAwaitMessage().anotherPhoneNumber().expectToBeSent();

                    tester.incomingCall().receive();

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

                    notificationTester.grantPermission().
                        recentNotification().
                        expectToHaveTitle('Входящий звонок').
                        expectToHaveBody('Шалева Дора +7 (916) 123-45-67');
                });
                it(
                    'Уведомление не должно отобразиться. Поступил входящий звонок с ожидаемого номера. ' +
                    'Звонок принимается автоматически. Уведомление не отображается.',
                function() {
                    ipcPrompterCallPreparationMessage.dontShowNotification().receive();
                    tester.othersNotification().prompterCallPreparation().dontShowNotification().expectToBeSent();

                    tester.ipcPrompterCallAwaitMessage().expectToBeSent();

                    incomingCall = tester.incomingCall().receive();

                    tester.slavesNotification().
                        twoChannels().
                        available().
                        incoming().
                        muted().
                        progress().
                        userDataFetched().
                        hidden().
                        expectToBeSent();

                    tester.slavesNotification().
                        twoChannels().
                        available().
                        incoming().
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
            it(
                'Получена информация о звонке. Происходит подготовка к подключению ко звонку. Номер клинета ' +
                'неизвестен. Поступил входящий звонок с ожидаемого номера. Отображен номер полученный из события ' +
                'входящего звонка.',
            function() {
                tester.outCallEvent().anotherContactNumber().receive();
                tester.outCallEvent().anotherContactNumber().slavesNotification().expectToBeSent();

                tester.ipcPrompterCallPreparationMessage().noSubscriberNumber().receive();
                tester.othersNotification().prompterCallPreparation().noSubscriberNumber().expectToBeSent();

                tester.ipcPrompterCallAwaitMessage().expectToBeSent();

                incomingCall = tester.incomingCall().receive();

                tester.slavesNotification().
                    twoChannels().
                    available().
                    incoming().
                    muted().
                    progress().
                    userDataFetched().
                    expectToBeSent();

                tester.slavesNotification().
                    twoChannels().
                    available().
                    incoming().
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

                    '+7 (916) 123-45-70 00:00 ' +

                    'Путь лида ' +

                    'Виртуальный номер ' +
                    '+7 (916) 123-45-68'
                );
            });
            it(
                'Происходит подготовка к подключению ко звонку. Поступил входящий звонок с ожидаемого номера. ' +
                'Получена информация о звонке. Звонок принимается автоматически. Кнопки заблокированы.',
            function() {
                tester.othersNotification().prompterCallPreparation().receive();
                tester.ipcPrompterCallAwaitMessage().expectToBeSent();

                let incomingCall = tester.incomingCall().receive();

                tester.slavesNotification().
                    twoChannels().
                    available().
                    incoming().
                    muted().
                    progress().
                    userDataFetched().
                    expectToBeSent();

                tester.slavesNotification().
                    twoChannels().
                    available().
                    incoming().
                    progress().
                    userDataFetched().
                    expectToBeSent();

                tester.numaRequest().receiveResponse();

                tester.firstConnection.connectWebRTC();
                tester.firstConnection.callTrackHandler();

                tester.allowMediaInput();
                tester.firstConnection.addCandidate();

                incomingCall = incomingCall.expectOkToBeSent();

                tester.outCallEvent().receive();
                tester.outCallEvent().slavesNotification().expectToBeSent();

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

                tester.dialpadVisibilityButton.expectToHaveClass('cmg-button-disabled');
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
                tester.masterInfoMessage().isNotMaster().receive();
                tester.masterNotification().tabOpened().expectToBeSent();

                tester.authCheckRequest().receiveResponse();
                tester.statusesRequest().receiveResponse();

                tester.settingsRequest().allowNumberCapacitySelect().receiveResponse();

                tester.othersNotification().
                    widgetStateUpdate().
                    fixedNumberCapacityRule().
                    expectToBeSent();

                tester.othersNotification().
                    updateSettings().
                    shouldNotPlayCallEndingSignal().
                    expectToBeSent();
                
                tester.talkOptionsRequest().receiveResponse();

                tester.permissionsRequest().
                    allowNumberCapacitySelect().
                    allowNumberCapacityUpdate().
                    receiveResponse();

                notificationTester.grantPermission();

                tester.authenticatedUserRequest().receiveResponse();
                tester.numberCapacityRequest().receiveResponse();

                tester.slavesNotification().
                    userDataFetched().
                    twoChannels().
                    available().
                    receive();

                tester.button('Софтфон').click();

                tester.masterNotification().
                    toggleWidgetVisiblity().
                    expectToBeSent();

                tester.slavesNotification().
                    additional().
                    visible().
                    receive();
            });

            it(
                'Скрываю вкладку. Из другой вкладки передано сообщение о подготовке к подключению ко звонку. ' +
                'Поступил входящий звонок с ожидаемого номера. Уведомление не отображается.',
            function() {
                setDocumentVisible(false);
                tester.masterNotification().tabBecameHidden().expectToBeSent();

                tester.othersNotification().prompterCallPreparation().receive();
                tester.ipcPrompterCallAwaitMessage().expectToBeSent();

                tester.slavesNotification().
                    twoChannels().
                    available().
                    incoming().
                    muted().
                    progress().
                    userDataFetched().
                    receive();

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
                tester.ipcPrompterCallAwaitMessage().expectToBeSent();

                tester.slavesNotification().
                    twoChannels().
                    available().
                    incoming().
                    muted().
                    progress().
                    userDataFetched().
                    receive();

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

                tester.dialpadVisibilityButton.expectToHaveClass('cmg-button-disabled');
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
                tester.othersNotification().prompterCallPreparation().expectToBeSent();

                tester.ipcPrompterCallAwaitMessage().expectToBeSent();

                tester.slavesNotification().
                    twoChannels().
                    available().
                    incoming().
                    muted().
                    progress().
                    userDataFetched().
                    receive();

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

                tester.dialpadVisibilityButton.expectToHaveClass('cmg-button-disabled');
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
