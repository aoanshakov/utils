tests.addTest(options => {
    const {
        Tester,
        setFocus,
        notificationTester,
        spendTime,
        postMessages,
        unfilteredPostMessages,
        setNow,
        setDocumentVisible,
        windowOpener,
        ajax,
        utils,
        webSockets,
        audioDecodingTester,
        unload,
    } = options;

    describe('Включено расширение Chrome виджет amoCRM.', function() {
        let tester;

        beforeEach(function() {
            setNow('2019-12-19T12:10:06');
        });

        afterEach(function() {
            postMessages.nextMessage().expectNotToExist();

            tester.restoreSoftphoneIFrameContentWindow();
            tester.restoreNotificationIFrameContentWindow();

            tester.chrome.
                tabs.
                current.
                nextMessage().
                expectNotToExist();

            tester.chrome.
                runtime.
                background.
                nextMessage().
                expectNotToExist();

            tester.chrome.
                runtime.
                popup.
                nextMessage().
                expectNotToExist();

            tester.chrome.
                identity.
                authFlow.
                nextLaunching().
                expectNotToExist();

            tester.chrome.
                permissions.
                nextRequest().
                expectNotToExist();
        });

        describe('Открываю Битрикс24 c приложением софтфона. Открыта background-встройка.', function() {
            beforeEach(function() {
                tester = new Tester({
                    application: 'bitrixSoftphoneIframe',
                    softphoneHost: 'my.uiscom.ru',
                    isIframe: true,
                    ...options,
                });
            });

            describe('Ввожу логин и пароль. Отправлен запрос авторизации.', function() {
                let authTokenRequest;

                beforeEach(function() {
                    localStorage.setItemInAnotherTab('token', tester.oauthToken);
                    authTokenRequest = tester.authTokenRequest().expectToBeSent();
                });

                describe('URL бэкенда не указан.', function() {
                    let settingsRequest;

                    beforeEach(function() {
                        authTokenRequest.receiveResponse();

                        tester.authCheckRequest().receiveResponse();
                        tester.talkOptionsRequest().receiveResponse();
                        tester.statusesRequest().receiveResponse();
                        tester.permissionsRequest().receiveResponse();

                        settingsRequest = tester.settingsRequest().
                            dontTriggerScrollRecalculation().
                            expectToBeSent();

                        notificationTester.grantPermission();

                        tester.masterInfoMessage().
                            applyLeader().
                            expectToBeSent().
                            waitForSecond();

                        tester.masterInfoMessage().
                            applyLeader().
                            expectToBeSent();
                    });

                    describe('Доступна только одна SIP-линия.', function() {
                        beforeEach(function() {
                            settingsRequest.
                                oneChannel().
                                receiveResponse();

                            tester.marksRequest().receiveResponse();
                        });

                        describe('Вкладка является ведущей.', function() {
                            let authenticatedUserRequest;

                            beforeEach(function() {
                                spendTime(1000);
                                spendTime(0);

                                tester.slavesNotification().
                                    additional().
                                    expectToBeSent();

                                tester.slavesNotification().
                                    enabled().
                                    oneChannel().
                                    expectToBeSent();

                                tester.masterInfoMessage().
                                    tellIsLeader().
                                    expectToBeSent();

                                tester.connectEventsWebSocket();

                                tester.slavesNotification().
                                    enabled().
                                    oneChannel().
                                    softphoneServerConnected().
                                    expectToBeSent();

                                authenticatedUserRequest = tester.authenticatedUserRequest().expectToBeSent();
                            });

                            describe('SIP-линия зарегистрирована.', function() {
                                beforeEach(function() {
                                    authenticatedUserRequest.receiveResponse();

                                    tester.slavesNotification().
                                        enabled().
                                        oneChannel().
                                        softphoneServerConnected().
                                        userDataFetched().
                                        expectToBeSent();

                                    tester.connectSIPWebSocket();

                                    tester.slavesNotification().
                                        enabled().
                                        oneChannel().
                                        softphoneServerConnected().
                                        userDataFetched().
                                        webRTCServerConnected().
                                        expectToBeSent();

                                    tester.registrationRequest().receiveResponse();

                                    tester.slavesNotification().
                                        enabled().
                                        oneChannel().
                                        softphoneServerConnected().
                                        userDataFetched().
                                        webRTCServerConnected().
                                        registered().
                                        expectToBeSent();
                                });

                                describe('Получен доступ к микрофону.', function() {
                                    beforeEach(function() {
                                        tester.allowMediaInput();

                                        tester.slavesNotification().
                                            available().
                                            oneChannel().
                                            expectToBeSent();
                                    });

                                    describe('Инициализируется SDK Битркс24.', function() {
                                        beforeEach(function() {
                                            tester.BX24.initialize();
                                        });

                                        describe(
                                            'Поступил входящий звонок. Пользователь нажимает на кнопку принятия ' +
                                            'звонка. Звонок принят.',
                                        function() {
                                            beforeEach(function() {
                                                tester.BX24.incomingCall();
                                                incomingCall = tester.incomingCall().receive();

                                                tester.BX24.recentCall().expectToHaveMethod('CallCardSetUiState').
                                                    expectParamsToContain({
                                                        uiState: 'incoming'
                                                    });

                                                tester.numaRequest().receiveResponse();

                                                tester.slavesNotification().
                                                    oneChannel().
                                                    available().
                                                    incoming().
                                                    progress().
                                                    expectToBeSent();

                                                tester.outCallEvent().receive();
                                                tester.outCallEvent().slavesNotification().expectToBeSent();

                                                tester.BX24.recentCall().expectToHaveMethod('CallCardSetStatusText').
                                                    expectParamsToContain({
                                                        statusText:
                                                            'ВН: +7 (916) 123-45-68, ' +
                                                            'Сценарий ВАТС: Некий сценарий'
                                                    });

                                                tester.BX24.answer();

                                                tester.firstConnection.connectWebRTC();
                                                tester.firstConnection.callTrackHandler();

                                                mediaStream = tester.allowMediaInput();
                                                tester.firstConnection.addCandidate();

                                                incomingCall.expectOkToBeSent().receiveResponse();

                                                tester.slavesNotification().
                                                    oneChannel().
                                                    available().
                                                    incoming().
                                                    confirmed().
                                                    expectToBeSent();

                                                tester.BX24.recentCall().expectToHaveMethod('CallCardSetUiState').
                                                    expectParamsToContain({
                                                        uiState: 'connected'
                                                    });
                                            });

                                            describe(
                                                'Выбираю оператора для трансфера. Нажимаю на кнпоку "Перенаправить". ',
                                            function() {
                                                let userRequest;

                                                beforeEach(function() {
                                                    tester.BX24.chooseOperatorForTransfer();
                                                    userRequest = tester.userRequest().expectToBeSent();
                                                });

                                                describe('Номер оператора не найден.', function() {
                                                    let recentCall;

                                                    beforeEach(function() {
                                                        userRequest.noShortNumber().receiveResponse();

                                                        recentCall = tester.BX24.recentCall();

                                                        tester.BX24.
                                                            recentCall().
                                                            expectToHaveMethod('CallCardSetUiState').
                                                            expectParamsToContain({
                                                                uiState: 'connectingOutgoing'
                                                            });
                                                    });

                                                    it(
                                                        'Завершаю звонок. Поступает входящий звонок. Сообщение об ' +
                                                        'ошибке не отображено.',
                                                    function() {
                                                        tester.BX24.close();
                                                        
                                                        incomingCall.expectByeToBeSent();
                                                        tester.BX24.recentCall().expectToHaveMethod('CallCardClose');

                                                        tester.slavesNotification().
                                                            oneChannel().
                                                            available().
                                                            ended().
                                                            expectToBeSent();

                                                        tester.BX24.incomingCall();
                                                        incomingCall = tester.incomingCall().receive();

                                                        tester.BX24.recentCall().
                                                            expectToHaveMethod('CallCardSetUiState').
                                                            expectParamsToContain({
                                                                uiState: 'incoming'
                                                            });

                                                        tester.numaRequest().receiveResponse();

                                                        tester.slavesNotification().
                                                            oneChannel().
                                                            available().
                                                            incoming().
                                                            progress().
                                                            expectToBeSent();

                                                        tester.outCallEvent().receive();
                                                        tester.outCallEvent().slavesNotification().expectToBeSent();

                                                        tester.BX24.recentCall().
                                                            expectToHaveMethod('CallCardSetStatusText').
                                                            expectParamsToContain({
                                                                statusText:
                                                                    'ВН: +7 (916) 123-45-68, ' +
                                                                    'Сценарий ВАТС: Некий сценарий'
                                                            });
                                                    });
                                                    it('Отображено сообщение об ошибке.', function() {
                                                        recentCall.
                                                            expectToHaveMethod('CallCardSetStatusText').
                                                            expectParamsToContain({
                                                                statusText: 'Не удалось найти номер оператора'
                                                            });
                                                    });
                                                });
                                                it('Отправлен запрос трансфера.', function() {
                                                    userRequest.receiveResponse();

                                                    tester.dtmf('#').send();
                                                    spendTime(600);
                                                    tester.dtmf('3').send();
                                                    spendTime(600);
                                                    tester.dtmf('6').send();
                                                    spendTime(600);
                                                    tester.dtmf('2').send();
                                                    spendTime(600);

                                                    tester.slavesNotification().
                                                        additional().
                                                        dtmf('#362').
                                                        transfered().
                                                        outCallEvent().include().
                                                        visible().
                                                        expectToBeSent();
                                                });
                                            });
                                            describe(
                                                'Выбираю оператора для трансфера. Нажимаю на кнпоку "Перенаправить". ' +
                                                'Отправлен запрос трансфера.',
                                            function() {
                                                beforeEach(function() {
                                                    tester.BX24.choosePhoneNumberForTransfer();

                                                    tester.dtmf('#').send();
                                                    spendTime(600);
                                                    tester.dtmf('2').send();
                                                    spendTime(600);
                                                    tester.dtmf('9').send();
                                                    spendTime(600);
                                                    tester.dtmf('5').send();
                                                    spendTime(600);

                                                    tester.slavesNotification().
                                                        additional().
                                                        dtmf('#295').
                                                        transfered().
                                                        outCallEvent().include().
                                                        visible().
                                                        expectToBeSent();
                                                });

                                                it(
                                                    'Возвращаюсь к звонку. Отправлен запрос возвращения к звонку.',
                                                function() {
                                                    tester.BX24.cancelTransfer();

                                                    tester.dtmf('#').send();
                                                    spendTime(600);

                                                    tester.slavesNotification().
                                                        additional().
                                                        dtmf('#295#').
                                                        notTransfered().
                                                        outCallEvent().include().
                                                        visible().
                                                        expectToBeSent();
                                                });
                                                it('Ни одно сообщение не было передано в вебсокет.', function() {
                                                    tester.webrtcWebsocket.expectNoMessageToBeSent();
                                                });
                                            });
                                            describe('Пользователь нажимает на кнопку удержания.', function() {
                                                beforeEach(function() {
                                                    tester.BX24.hold();

                                                    tester.slavesNotification().
                                                        oneChannel().
                                                        available().
                                                        incoming().
                                                        confirmed().
                                                        holded().
                                                        expectToBeSent();

                                                    tester.BX24.recentCall().expectToHaveMethod('CallCardSetHold').
                                                        expectParamsToContain({
                                                            held: true
                                                        });

                                                    audioDecodingTester.accomplishAudioDecoding();
                                                });

                                                it(
                                                    'Пользователь нажимает на кнопку снятия с удержания. Звонк снят ' +
                                                    'с удержания.',
                                                function() {
                                                    tester.BX24.unhold();

                                                    tester.slavesNotification().
                                                        oneChannel().
                                                        available().
                                                        incoming().
                                                        confirmed().
                                                        expectToBeSent();

                                                    tester.BX24.recentCall().expectToHaveMethod('CallCardSetHold').
                                                        expectParamsToContain({
                                                            held: false
                                                        });

                                                    tester.firstConnection.
                                                        expectToPlayTrack(mediaStream.getTracks()[0]);
                                                });
                                                it('Звонок удерживается.', function() {
                                                    tester.firstConnection.expectHoldMusicToPlay();
                                                });
                                            });
                                            describe(
                                                'Пользователь нажимает на кнопку выключения микрофона.',
                                            function() {
                                                beforeEach(function() {
                                                    tester.BX24.mute();

                                                    tester.slavesNotification().
                                                        oneChannel().
                                                        available().
                                                        incoming().
                                                        confirmed().
                                                        muted().
                                                        expectToBeSent();

                                                    tester.BX24.recentCall().expectToHaveMethod('CallCardSetMute').
                                                        expectParamsToContain({
                                                            muted: true  
                                                        });
                                                });

                                                it(
                                                    'Пользователь нажимает на кнопку включения микрофона. Собеседник ' +
                                                    'слышит голос пользователя.',
                                                function() {
                                                    tester.BX24.unmute();

                                                    tester.slavesNotification().
                                                        oneChannel().
                                                        available().
                                                        incoming().
                                                        confirmed().
                                                        expectToBeSent();

                                                    tester.BX24.recentCall().expectToHaveMethod('CallCardSetMute').
                                                        expectParamsToContain({
                                                            muted: false  
                                                        });

                                                    tester.firstConnection.expectNotToBeMute();
                                                });
                                                it('Собеседник не слышит голос пользователя.', function() {
                                                    tester.firstConnection.expectToBeMute();
                                                });
                                            }
                                            );
                                            it('Пользватель завершает звонок.', function() {
                                                tester.BX24.close();
                                                
                                                incomingCall.expectByeToBeSent();
                                                tester.BX24.recentCall().expectToHaveMethod('CallCardClose');

                                                tester.slavesNotification().
                                                    oneChannel().
                                                    available().
                                                    ended().
                                                    expectToBeSent();
                                            });
                                            it('Пользватель завершает звонок немного иначе.', function() {
                                                tester.BX24.hangup();
                                                
                                                incomingCall.expectByeToBeSent();
                                                tester.BX24.recentCall().expectToHaveMethod('CallCardClose');

                                                tester.slavesNotification().
                                                    oneChannel().
                                                    available().
                                                    ended().
                                                    expectToBeSent();
                                            });
                                            it('Пользватель завершает звонок третьим способом.', function() {
                                                tester.BX24.skip();
                                                
                                                incomingCall.expectByeToBeSent();
                                                tester.BX24.recentCall().expectToHaveMethod('CallCardClose');

                                                tester.slavesNotification().
                                                    oneChannel().
                                                    available().
                                                    ended().
                                                    expectToBeSent();
                                            });
                                            it('Закрываю вкладку. Звонок завешается.', function() {
                                                unload();
                                                //tester.masterInfoMessage().leaderDeath().expectToBeSent();
                                                
                                                incomingCall.expectByeToBeSent();
                                                tester.BX24.recentCall().expectToHaveMethod('CallCardClose');

                                                tester.slavesNotification().
                                                    oneChannel().
                                                    available().
                                                    ended().
                                                    expectToBeSent();
                                            });
                                            it('Нажимаю на кнопку в диалпаде.', function() {
                                                tester.BX24.dtmf('2');
                                                tester.dtmf('2').expectToBeSent();

                                                tester.slavesNotification().
                                                    additional().
                                                    visible().
                                                    dtmf('2').
                                                    outCallEvent().include().
                                                    expectToBeSent();
                                            });
                                            it('Собеседник слышит голос пользователя.', function() {
                                                tester.firstConnection.expectNotToBeMute();
                                                tester.firstConnection.expectToPlayTrack(mediaStream.getTracks()[0]);
                                            });
                                        });
                                        describe('Поступил входящий звонок.', function() {
                                            beforeEach(function() {
                                                incomingCall = tester.incomingCall().receive();
                                                tester.numaRequest().receiveResponse();

                                                tester.slavesNotification().
                                                    oneChannel().
                                                    available().
                                                    incoming().
                                                    progress().
                                                    expectToBeSent();
                                            });

                                            describe('Получена информация о звонке.', function() {
                                                beforeEach(function() {
                                                    tester.outCallEvent().receive();
                                                    tester.outCallEvent().slavesNotification().expectToBeSent();
                                                });

                                                it(
                                                    'Открыта карточка исходящего звонка. Карточка исходящего звонка ' +
                                                    'стала карточкой входящего звонка.',
                                                function() {
                                                    tester.BX24.outgoingCall();

                                                    tester.BX24.
                                                        recentCall().
                                                        expectToHaveMethod('CallCardSetStatusText').
                                                        expectParamsToContain({
                                                            statusText:
                                                                'ВН: +7 (916) 123-45-68, ' +
                                                                'Сценарий ВАТС: Некий сценарий'
                                                        });

                                                    tester.BX24.recentCall().expectToHaveMethod('CallCardSetUiState').
                                                        expectParamsToContain({
                                                            uiState: 'incoming'
                                                        });
                                                });
                                                it(
                                                    'Открыта карточка звонка. Отображена информация о звонке.',
                                                function() {
                                                    tester.BX24.incomingCall();

                                                    tester.BX24.
                                                        recentCall().
                                                        expectToHaveMethod('CallCardSetStatusText').
                                                        expectParamsToContain({
                                                            statusText: 'ВН: +7 (916) 123-45-68, ' +
                                                                'Сценарий ВАТС: Некий сценарий'
                                                        });

                                                    tester.BX24.recentCall().expectToHaveMethod('CallCardSetUiState').
                                                        expectParamsToContain({
                                                            uiState: 'incoming'
                                                        });
                                                });
                                            });
                                            describe('Вкладка свернута.', function() {
                                                beforeEach(function() {
                                                    setDocumentVisible(false);

                                                    tester.slavesNotification().
                                                        oneChannel().
                                                        hidden().
                                                        available().
                                                        incoming().
                                                        progress().
                                                        expectToBeSent();
                                                });

                                                it('Закрываю вкладку. Звонок завешается.', function() {
                                                    unload();
                                                    //tester.masterInfoMessage().leaderDeath().expectToBeSent();

                                                    incomingCall.expectBusyHereToBeSent();

                                                    tester.slavesNotification().
                                                        oneChannel().
                                                        available().
                                                        hidden().
                                                        ended().
                                                        expectToBeSent();
                                                });
                                                it(
                                                    'Получена информация о звонке. Открыта карточка звонка. ' +
                                                    'Отображено оповещение.',
                                                function() {
                                                    tester.outCallEvent().receive();
                                                    tester.outCallEvent().slavesNotification().expectToBeSent();

                                                    tester.BX24.incomingCall();

                                                    tester.BX24.
                                                        recentCall().
                                                        expectToHaveMethod('CallCardSetStatusText').
                                                        expectParamsToContain({
                                                            statusText:
                                                                'ВН: +7 (916) 123-45-68, ' +
                                                                'Сценарий ВАТС: Некий сценарий'
                                                        });

                                                    tester.BX24.recentCall().expectToHaveMethod('CallCardSetUiState').
                                                        expectParamsToContain({
                                                            uiState: 'incoming'
                                                        });

                                                    notificationTester.grantPermission().
                                                        recentNotification().
                                                        expectToHaveTitle('Входящий звонок').
                                                        expectToHaveBody(
                                                            'Шалева Дора, +7 (916) 123-45-67, somesite.com'
                                                        ).
                                                        expectToBeOpened();
                                                });
                                            });
                                        });
                                        describe(
                                            'Открывается карточка исходящего звонка. Совершается исходящий звонок. ' +
                                            'Отбражено время дозвона. Карточка звонка переведена в состояние дозвона.',
                                        function() {
                                            let outgoingCall;

                                            beforeEach(function() {
                                                tester.BX24.outgoingCall();

                                                tester.BX24.recentCall().expectToHaveMethod('CallCardSetStatusText').
                                                    expectParamsToContain({
                                                        statusText: 'Продолжительность дозвона 00:00 мин.'
                                                    });

                                                tester.BX24.recentCall().expectToHaveMethod('CallCardSetUiState').
                                                    expectParamsToContain({
                                                        uiState: 'connectingOutgoing'
                                                    });

                                                tester.firstConnection.connectWebRTC();
                                                tester.allowMediaInput();
                                                outgoingCall = tester.outgoingCall().expectToBeSent();

                                                tester.numaRequest().receiveResponse();

                                                tester.slavesNotification().
                                                    oneChannel().
                                                    available().
                                                    sending().
                                                    expectToBeSent();
                                            });

                                            it('Прошло время. Время дозвона обновилось.', function() {
                                                setNow('2019-12-19T12:11:21');
                                                spendTime(1000);

                                                tester.BX24.recentCall().expectToHaveMethod('CallCardSetStatusText').
                                                    expectParamsToContain({
                                                        statusText: 'Продолжительность дозвона 01:15 мин.'
                                                    });

                                                setNow('2019-12-19T14:11:21');
                                                spendTime(1000);

                                                tester.BX24.recentCall().expectToHaveMethod('CallCardSetStatusText').
                                                    expectParamsToContain({
                                                        statusText: 'Продолжительность дозвона 02:01:15 часов'
                                                    });
                                            });
                                            it('Звонок принят. Текст статуса стал пустым.', function() {
                                                outgoingCall.receiveRinging();

                                                tester.slavesNotification().
                                                    oneChannel().
                                                    available().
                                                    progress().
                                                    expectToBeSent();

                                                outgoingCall.receiveAccepted();

                                                tester.slavesNotification().
                                                    oneChannel().
                                                    available().
                                                    confirmed().
                                                    expectToBeSent();

                                                tester.BX24.recentCall().expectToHaveMethod('CallCardSetStatusText').
                                                    expectParamsToContain({
                                                        statusText: ''
                                                    });

                                                tester.BX24.recentCall().expectToHaveMethod('CallCardSetUiState').
                                                    expectParamsToContain({
                                                        uiState: 'connected'
                                                    });
                                            });
                                            it('Ни один вызов метода BX24 не был вызван.', function() {
                                                tester.BX24.recentCall().expectNotToExist();
                                            });
                                        });
                                        describe(
                                            'Получено сообщение о том, что нужно воспринимать исходящий звонок, как',
                                        function() {
                                            let callCardStateChangingMessage;

                                            beforeEach(function() {
                                                callCardStateChangingMessage = tester.callCardStateChangingMessage();
                                            });

                                            it(
                                                'ошибку. Открывается карточка исходящего звонка. Поступил входящий ' +
                                                'звонок. Карточка становится карточкой входящего звонка.',
                                            function() {
                                                callCardStateChangingMessage.showErrorCallCard().receive();

                                                tester.callCardStateChangingMessage().
                                                    showErrorCallCard().
                                                    slavesNotification().
                                                    expectToBeSent();

                                                tester.BX24.outgoingCall();

                                                tester.BX24.recentCall().expectToHaveMethod('CallCardSetUiState').
                                                    expectParamsToContain({
                                                        uiState: 'error'
                                                    });

                                                tester.incomingCall().receive();
                                                tester.numaRequest().receiveResponse();

                                                tester.slavesNotification().
                                                    oneChannel().
                                                    available().
                                                    incoming().
                                                    progress().
                                                    expectToBeSent();

                                                tester.outCallEvent().receive();
                                                tester.outCallEvent().slavesNotification().expectToBeSent();

                                                tester.BX24.recentCall().expectToHaveMethod('CallCardSetStatusText').
                                                    expectParamsToContain({
                                                        statusText:
                                                            'ВН: +7 (916) 123-45-68, ' +
                                                            'Сценарий ВАТС: Некий сценарий'
                                                    });
                                            });
                                            it(
                                                'входящий. Открывается карточка исходящего звонка. Поступил входящий ' +
                                                'звонок. Карточка становится карточкой входящего звонка.',
                                            function() {
                                                callCardStateChangingMessage.receive();

                                                tester.callCardStateChangingMessage().
                                                    slavesNotification().
                                                    expectToBeSent();

                                                tester.BX24.outgoingCall();

                                                tester.BX24.recentCall().expectToHaveMethod('CallCardSetUiState').
                                                    expectParamsToContain({
                                                        uiState: 'error'
                                                    });

                                                tester.incomingCall().receive();
                                                tester.numaRequest().receiveResponse();

                                                tester.slavesNotification().
                                                    oneChannel().
                                                    available().
                                                    incoming().
                                                    progress().
                                                    expectToBeSent();

                                                tester.outCallEvent().receive();
                                                tester.outCallEvent().slavesNotification().expectToBeSent();

                                                tester.BX24.recentCall().expectToHaveMethod('CallCardSetStatusText').
                                                    expectParamsToContain({
                                                        statusText:
                                                            'ВН: +7 (916) 123-45-68, ' +
                                                            'Сценарий ВАТС: Некий сценарий'
                                                    });

                                                tester.BX24.recentCall().expectToHaveMethod('CallCardSetUiState').
                                                    expectParamsToContain({
                                                        uiState: 'incoming'
                                                    });
                                            });
                                        });
                                        describe(
                                            'Открывается карточка исходящего звонка со скрытым номером.',
                                        function() {
                                            beforeEach(function() {
                                                tester.BX24.callListMode().outgoingCall();

                                                tester.BX24.recentCall().expectToHaveMethod('CallCardSetUiState').
                                                    expectParamsToContain({
                                                        uiState: 'outgoing'
                                                    });
                                            });

                                            it(
                                                'Получено событие изменения сущности. Совершается исходящий звонок. ' +
                                                'Звонок завершен. Снова получено событие изменения сущности. ' +
                                                'Совершается исходящий звонок.',
                                            function() {
                                                tester.BX24.entityChanged();

                                                tester.BX24.recentCall().expectToHaveMethod('CallCardSetStatusText').
                                                    expectParamsToContain({
                                                        statusText: 'Продолжительность дозвона 00:00 мин.'
                                                    });

                                                tester.BX24.recentCall().expectToHaveMethod('CallCardSetUiState').
                                                    expectParamsToContain({
                                                        uiState: 'connectingOutgoing'
                                                    });

                                                tester.firstConnection.connectWebRTC();
                                                tester.allowMediaInput();
                                                const outgoingCall = tester.outgoingCall().expectToBeSent();

                                                tester.numaRequest().receiveResponse();

                                                tester.slavesNotification().
                                                    oneChannel().
                                                    available().
                                                    sending().
                                                    expectToBeSent();

                                                outgoingCall.receiveBusy();

                                                tester.slavesNotification().
                                                    oneChannel().
                                                    available().
                                                    failed().
                                                    expectToBeSent();

                                                tester.BX24.recentCall().expectToHaveMethod('CallCardSetStatusText').
                                                    expectParamsToContain({
                                                        statusText: ''
                                                    });

                                                tester.BX24.recentCall().expectToHaveMethod('CallCardSetUiState').
                                                    expectParamsToContain({
                                                        uiState: 'outgoing'
                                                    });

                                                tester.BX24.anotherPhone().entityChanged();

                                                tester.BX24.recentCall().expectToHaveMethod('CallCardSetStatusText').
                                                    expectParamsToContain({
                                                        statusText: 'Продолжительность дозвона 00:00 мин.'
                                                    });

                                                tester.BX24.recentCall().expectToHaveMethod('CallCardSetUiState').
                                                    expectParamsToContain({
                                                        uiState: 'connectingOutgoing'
                                                    });

                                                tester.secondConnection.connectWebRTC();
                                                tester.allowMediaInput();

                                                tester.outgoingCall().
                                                    anotherPhone().
                                                    expectToBeSent();

                                                tester.numaRequest().
                                                    fifthPhone().
                                                    receiveResponse();

                                                tester.slavesNotification().
                                                    oneChannel().
                                                    available().
                                                    sending().
                                                    anotherPhone().
                                                    expectToBeSent();
                                            });
                                            it('Исходящий звонок не совершается.', function() {
                                                tester.BX24.recentCall().expectNotToExist();
                                            });
                                        });
                                        describe('Включен режим "IP-телефон".', function() {
                                            beforeEach(function() {
                                                tester.othersNotification().
                                                    widgetStateUpdate().
                                                    callsAreManagedByAnotherDevice().
                                                    receive();

                                                tester.slavesNotification().
                                                    oneChannel().
                                                    disabled().
                                                    userDataFetched().
                                                    softphoneServerConnected().
                                                    microphoneAccessGranted().
                                                    expectToBeSent();

                                                tester.registrationRequest().expired().receiveResponse();

                                                spendTime(2000);
                                                tester.webrtcWebsocket.finishDisconnecting();
                                            });

                                            it(
                                                'Открывается карточка звонка со скрытым новером. Получено событие ' +
                                                'изменения сущности. Исходящий звонок производится с помощью ' +
                                                'click-to-call.',
                                            function() {
                                                tester.BX24.callListMode().outgoingCall();

                                                tester.BX24.recentCall().expectToHaveMethod('CallCardSetUiState').
                                                    expectParamsToContain({
                                                        uiState: 'outgoing'
                                                    });

                                                tester.BX24.entityChanged();
                                                tester.startCallRequest().callListMode().expectToBeSent();
                                            });
                                            it(
                                                'Открывается карточка звонка. Исходящий звонок производится с ' +
                                                'помощью click-to-call.',
                                            function() {
                                                tester.BX24.outgoingCall();
                                                tester.startCallRequest().expectToBeSent();

                                                tester.BX24.entityChanged();
                                            });
                                        });
                                        it(
                                            'С ведомой вкладки получен запрос скачивания лога. Лог скачивается.',
                                        function() {
                                            tester.logDownloadingRequest().
                                                broadcastMessage().
                                                forLeader().
                                                receive();

                                            tester.logDownloadingRequest().
                                                broadcastMessage().
                                                forFollower().
                                                containsSubstrings([
                                                    'BX24 inititializing',
                                                    'POST https://my.uiscom.ru/sup/auth/token',
                                                ]).
                                                expectToBeSent();
                                        });
                                        it(
                                            'Получено сообщение о том, что нужно воспринимать исходящий звонок, как ' +
                                            'входящий. Открывается карточка другого исходящего звонка. Совершается ' +
                                            'исходящий звонок.',
                                        function() {
                                            tester.callCardStateChangingMessage().
                                                anotherCallId().
                                                receive();

                                            tester.callCardStateChangingMessage().
                                                anotherCallId().
                                                slavesNotification().
                                                expectToBeSent();

                                            tester.BX24.outgoingCall();

                                            tester.BX24.recentCall().expectToHaveMethod('CallCardSetStatusText').
                                                expectParamsToContain({
                                                    statusText: 'Продолжительность дозвона 00:00 мин.'
                                                });

                                            tester.BX24.recentCall().expectToHaveMethod('CallCardSetUiState').
                                                expectParamsToContain({
                                                    uiState: 'connectingOutgoing'
                                                });
                                                
                                            tester.firstConnection.connectWebRTC();
                                            tester.allowMediaInput();
                                            tester.outgoingCall().expectToBeSent();

                                            tester.numaRequest().receiveResponse();

                                            tester.slavesNotification().
                                                oneChannel().
                                                available().
                                                sending().
                                                expectToBeSent();
                                        });
                                    });
                                    it(
                                        'Поступил входящий звонок. Инициализируется SDK Битркс24. Карточка звонка ' +
                                        'переводится в режим входящего звонка.',
                                    function() {
                                        tester.incomingCall().receive();

                                        tester.BX24.initialize();
                                        tester.BX24.incomingCall();

                                        tester.BX24.recentCall().
                                            expectToHaveMethod('CallCardSetUiState').
                                            expectParamsToContain({
                                                uiState: 'incoming'
                                            });

                                        tester.numaRequest().receiveResponse();

                                        tester.slavesNotification().
                                            oneChannel().
                                            available().
                                            incoming().
                                            progress().
                                            expectToBeSent();
                                    });
                                    it(
                                        'Потеряно соединене c сервером. Открывается карточка звонка. Отображено ' +
                                        'сообщение об ошибке.',
                                    function() {
                                        tester.spendTime(5000);
                                        tester.expectPingToBeSent();

                                        tester.spendTime(2000);

                                        tester.slavesNotification().
                                            oneChannel().
                                            microphoneAccessGranted().
                                            webRTCServerConnected().
                                            userDataFetched().
                                            registered().
                                            expectToBeSent();

                                        tester.BX24.initialize();
                                        tester.BX24.outgoingCall();

                                        tester.BX24.recentCall().expectToHaveMethod('CallCardSetStatusText').
                                            expectParamsToContain({
                                                statusText: 'Отсутствует интернет соединение'
                                            });

                                        tester.BX24.recentCall().expectToHaveMethod('CallCardSetUiState').
                                            expectParamsToContain({
                                                uiState: 'connectingOutgoing'
                                            });
                                    });
                                    it(
                                        'С другой вкладки получены настройки с другим URL вебсокета. Соединение с ' +
                                        'вебсокетом не устанавливается.',
                                    function() {
                                        tester.othersNotification().
                                            anotherWsUrl().
                                            widgetStateUpdate().
                                            receive();
                                    });
                                    it(
                                        'С другой вкладки получены настройки без URL вебсокета. Соединение с ' +
                                        'вебсокетом не разрывается.',
                                    function() {
                                        tester.othersNotification().
                                            noWsUrl().
                                            widgetStateUpdate().
                                            receive();
                                    });
                                });
                                describe('Доступ к микрофону не был получен.', function() {
                                    beforeEach(function() {
                                        tester.disallowMediaInput();

                                        tester.slavesNotification().
                                            enabled().
                                            oneChannel().
                                            softphoneServerConnected().
                                            userDataFetched().
                                            webRTCServerConnected().
                                            registered().
                                            microphoneAccessDenied().
                                            expectToBeSent();

                                        tester.BX24.initialize();
                                    });

                                    it(
                                        'Поступил входящий звонок. Отображено сообщение об отсутствии доступа к ' +
                                        'микрофону.',
                                    function() {
                                        tester.BX24.incomingCall();

                                        tester.BX24.recentCall().expectToHaveMethod('CallCardSetStatusText').
                                            expectParamsToContain({
                                                statusText:
                                                    'Ошибка, отсутствует доступ к микрофону. Для продолжения работы ' +
                                                    'необходимо предоставить доступ к микрофону и обновить страницу'
                                            });

                                        tester.BX24.recentCall().expectToHaveMethod('CallCardSetUiState').
                                            expectParamsToContain({
                                                uiState: 'connectingOutgoing'
                                            });
                                    });
                                    it(
                                        'Открывается карточка исходящего звонка. Отображено сообщение об отстутвии ' +
                                        'доступа к микрофону.',
                                    function() {
                                        tester.BX24.outgoingCall();

                                        tester.BX24.recentCall().expectToHaveMethod('CallCardSetStatusText').
                                            expectParamsToContain({
                                                statusText:
                                                    'Ошибка, отсутствует доступ к микрофону. Для продолжения работы ' +
                                                    'необходимо предоставить доступ к микрофону и обновить страницу'
                                            });

                                        tester.BX24.recentCall().expectToHaveMethod('CallCardSetUiState').
                                            expectParamsToContain({
                                                uiState: 'connectingOutgoing'
                                            });
                                    });
                                });
                            });
                            it(
                                'SIP-линия не зарегистрирована. Открывается карточка звонка. Отображено сообщение об ' +
                                'ошибке.',
                            function() {
                                authenticatedUserRequest.sipIsOffline().receiveResponse();

                                tester.slavesNotification().
                                    enabled().
                                    oneChannel().
                                    softphoneServerConnected().
                                    userDataFetched().
                                    sipIsOffline().
                                    expectToBeSent();

                                tester.connectSIPWebSocket();

                                tester.slavesNotification().
                                    enabled().
                                    oneChannel().
                                    softphoneServerConnected().
                                    userDataFetched().
                                    sipIsOffline().
                                    webRTCServerConnected().
                                    expectToBeSent();

                                tester.registrationRequest().receiveResponse();

                                tester.slavesNotification().
                                    enabled().
                                    oneChannel().
                                    softphoneServerConnected().
                                    userDataFetched().
                                    webRTCServerConnected().
                                    sipIsOffline().
                                    registered().
                                    expectToBeSent();

                                tester.allowMediaInput();

                                tester.slavesNotification().
                                    enabled().
                                    oneChannel().
                                    softphoneServerConnected().
                                    userDataFetched().
                                    webRTCServerConnected().
                                    sipIsOffline().
                                    microphoneAccessGranted().
                                    registered().
                                    expectToBeSent();
                                
                                tester.BX24.initialize();
                                tester.BX24.outgoingCall();

                                tester.BX24.recentCall().expectToHaveMethod('CallCardSetStatusText').
                                    expectParamsToContain({
                                        statusText: 'SIP-линия не зарегистрирована'
                                    });

                                tester.BX24.recentCall().expectToHaveMethod('CallCardSetUiState').
                                    expectParamsToContain({
                                        uiState: 'connectingOutgoing'
                                    });
                            });
                        });
                        describe('Вкладка является ведомой.', function() {
                            beforeEach(function() {
                                tester.masterInfoMessage().
                                    tellIsLeader().
                                    receive();

                                tester.masterNotification().
                                    tabOpened().
                                    expectToBeSent();

                                tester.authenticatedUserRequest().receiveResponse();

                                tester.slavesNotification().
                                    oneChannel().
                                    available().
                                    receive();

                                tester.BX24.initialize();
                            });

                            describe('Открывается карточка исходящего звонка.', function() {
                                beforeEach(function() {
                                    tester.BX24.outgoingCall();

                                    tester.slavesNotification().
                                        oneChannel().
                                        available().
                                        sending().
                                        receive();

                                    tester.BX24.recentCall().expectToHaveMethod('CallCardSetStatusText').
                                        expectParamsToContain({
                                            statusText: 'Продолжительность дозвона 00:00 мин.'
                                        });

                                    tester.BX24.recentCall().expectToHaveMethod('CallCardSetUiState').
                                        expectParamsToContain({
                                            uiState: 'connectingOutgoing'
                                        });
                                });

                                describe('Дозвон отменен.', function() {
                                    beforeEach(function() {
                                        tester.slavesNotification().
                                            oneChannel().
                                            available().
                                            ended().
                                            receive();

                                        tester.BX24.recentCall().expectToHaveMethod('CallCardClose');
                                    });

                                    describe('Поступил входящий звонок. Получена информация о звонке.', function() {
                                        beforeEach(function() {
                                            tester.slavesNotification().
                                                oneChannel().
                                                available().
                                                incoming().
                                                progress().
                                                receive();

                                            tester.outCallEvent().slavesNotification().receive();
                                        });

                                        it(
                                            'Открыта карточка звонка. Отображается кнопка принятия звонка. ' +
                                            'Отображается информация о звонке.',
                                        function() {
                                            tester.BX24.incomingCall();

                                            tester.BX24.recentCall().expectToHaveMethod('CallCardSetStatusText').
                                                expectParamsToContain({
                                                    statusText: 'ВН: +7 (916) 123-45-68, Сценарий ВАТС: Некий сценарий'
                                                });

                                            tester.BX24.recentCall().expectToHaveMethod('CallCardSetUiState').
                                                expectParamsToContain({
                                                    uiState: 'incoming'
                                                });
                                        });
                                        it('Ни один метод BX24 не был вызван.', function() {
                                            tester.BX24.recentCall().expectNotToExist();
                                        });
                                    });
                                    it(
                                        'Снова совершается исходящий звонок. Карточка звонка переведена в состояние ' +
                                        'дозвона.',
                                    function() {
                                        tester.slavesNotification().
                                            oneChannel().
                                            available().
                                            sending().
                                            receive();

                                        tester.BX24.outgoingCall();

                                        tester.BX24.recentCall().expectToHaveMethod('CallCardSetStatusText').
                                            expectParamsToContain({
                                                statusText: 'Продолжительность дозвона 00:00 мин.'
                                            });
                                        
                                        tester.BX24.recentCall().expectToHaveMethod('CallCardSetUiState').
                                            expectParamsToContain({
                                                uiState: 'connectingOutgoing'
                                            });
                                    });
                                });
                                describe('Звонок принят.', function() {
                                    beforeEach(function() {
                                        tester.slavesNotification().
                                            oneChannel().
                                            available().
                                            progress().
                                            receive();

                                        tester.slavesNotification().
                                            oneChannel().
                                            available().
                                            confirmed().
                                            receive();

                                        tester.BX24.recentCall().expectToHaveMethod('CallCardSetStatusText').
                                            expectParamsToContain({
                                                statusText: ''
                                            });

                                        tester.BX24.recentCall().expectToHaveMethod('CallCardSetUiState').
                                            expectParamsToContain({
                                                uiState: 'connected'
                                            });
                                    });

                                    describe(
                                        'Пользователь нажимает на кнопку выключения микрофона на ведущей вкладке. ' +
                                        'Кнопка нажата.',
                                    function() {
                                        beforeEach(function() {
                                            tester.slavesNotification().
                                                oneChannel().
                                                available().
                                                confirmed().
                                                muted().
                                                receive();

                                            tester.BX24.recentCall().expectToHaveMethod('CallCardSetMute').
                                                expectParamsToContain({
                                                    muted: true  
                                                });
                                        });

                                        it(
                                            'Пользователь нажимает на кнопку выключения микрофона. Кнопка не нажата.',
                                        function() {
                                            tester.slavesNotification().
                                                oneChannel().
                                                available().
                                                confirmed().
                                                receive();

                                            tester.BX24.recentCall().expectToHaveMethod('CallCardSetMute').
                                                expectParamsToContain({
                                                    muted: false
                                                });
                                        });
                                        it(
                                            'Пользователь нажимает на кнопку выключения микрофона на ведомой ' +
                                            'вкладке. В ведущую вкладку отправлен запрос выключения микрофона.',
                                        function() {
                                            tester.BX24.mute();
                                            tester.masterNotification().mute().expectToBeSent();
                                        });
                                        it('Ни один метод SDK не был вызван.', function() {
                                            tester.BX24.recentCall().expectNotToExist();
                                        });
                                    });
                                    describe(
                                        'Пользователь нажимает на кнопку удержания на ведущей вкладке. Кнопка ' +
                                        'удержания нажата.',
                                    function() {
                                        beforeEach(function() {
                                            tester.slavesNotification().
                                                oneChannel().
                                                available().
                                                confirmed().
                                                holded().
                                                receive();

                                            tester.BX24.recentCall().expectToHaveMethod('CallCardSetHold').
                                                expectParamsToContain({
                                                    held: true
                                                });
                                        });

                                        it(
                                            'Пользователь нажимает на кнопку снятия с удержания на ведущей вкладке. ' +
                                            'Кнопка удержания не нажата.',
                                        function() {
                                            tester.slavesNotification().
                                                oneChannel().
                                                available().
                                                confirmed().
                                                receive();

                                            tester.BX24.recentCall().expectToHaveMethod('CallCardSetHold').
                                                expectParamsToContain({
                                                    held: false
                                                });
                                        });
                                        it('Ни один метод SDK не был вызван.', function() {
                                            tester.BX24.recentCall().expectNotToExist();
                                        });
                                    });
                                });
                            });
                            it(
                                'Поступил входящий звонок. Пользователь пытается принять звонок. Доступ к микрофону ' +
                                'запрещен. Отображено сообщение о том, что доступ к микрофону запрещен. Отклоняю ' +
                                'звонок. В ведущую вкладку отправлен запрос отклонения звонка.',
                            function() {
                                tester.slavesNotification().
                                    enabled().
                                    oneChannel().
                                    incoming().
                                    progress().
                                    softphoneServerConnected().
                                    userDataFetched().
                                    webRTCServerConnected().
                                    registered().
                                    microphoneAccessDenied().
                                    receive();

                                tester.BX24.incomingCall();

                                tester.BX24.recentCall().expectToHaveMethod('CallCardSetStatusText').
                                    expectParamsToContain({
                                        statusText: 'Ошибка, отсутствует доступ к микрофону. Для продолжения работы ' +
                                            'необходимо предоставить доступ к микрофону и обновить страницу'
                                    });

                                tester.BX24.recentCall().expectToHaveMethod('CallCardSetUiState').
                                    expectParamsToContain({
                                        uiState: 'connectingOutgoing'
                                    });

                                tester.BX24.skip();
                                tester.masterNotification().terminate().expectToBeSent();

                                tester.slavesNotification().
                                    enabled().
                                    oneChannel().
                                    ended().
                                    softphoneServerConnected().
                                    userDataFetched().
                                    webRTCServerConnected().
                                    registered().
                                    microphoneAccessDenied().
                                    receive();

                                tester.BX24.recentCall().expectToHaveMethod('CallCardClose');
                            });
                        });
                    });
                    describe('Вкладка является ведущей.', function() {
                        beforeEach(function() {
                            spendTime(1000);
                            spendTime(0);

                            tester.slavesNotification().
                                additional().
                                expectToBeSent();

                            tester.slavesNotification().expectToBeSent();

                            tester.masterInfoMessage().
                                tellIsLeader().
                                expectToBeSent();
                        });

                        it('Открывается карточка звонка. Отображено сообщение об ошибке.', function() {
                            tester.BX24.initialize();
                            tester.BX24.outgoingCall();

                            tester.BX24.recentCall().expectToHaveMethod('CallCardSetStatusText').
                                expectParamsToContain({
                                    statusText: 'Приложение не успело загрузиться, пожалуйста подождите'
                                });

                            tester.BX24.recentCall().expectToHaveMethod('CallCardSetUiState').
                                expectParamsToContain({
                                    uiState: 'connectingOutgoing'
                                });
                        });
                        it(
                            'С ведомой вкладки приходят настройки. Соединеине с вебсокетом не производится.',
                        function() {
                            tester.othersNotification().
                                widgetStateUpdate().
                                receive();

                            tester.marksRequest().receiveResponse();
                        });
                    });
                    it(
                        'Доступны две SIP-линии. Поступил входящий звонок. Поступил еще один входящий звонок. Звонок ' +
                        'отклонен.',
                    function() {
                        settingsRequest.receiveResponse();

                        spendTime(1000);
                        spendTime(0);

                        tester.slavesNotification().
                            additional().
                            expectToBeSent();

                        tester.slavesNotification().
                            enabled().
                            oneChannel().
                            expectToBeSent();

                        tester.masterInfoMessage().
                            tellIsLeader().
                            expectToBeSent();

                        tester.connectEventsWebSocket();

                        tester.slavesNotification().
                            enabled().
                            oneChannel().
                            softphoneServerConnected().
                            expectToBeSent();

                        tester.marksRequest().receiveResponse();
                        tester.authenticatedUserRequest().receiveResponse();

                        tester.slavesNotification().
                            enabled().
                            oneChannel().
                            softphoneServerConnected().
                            userDataFetched().
                            expectToBeSent();

                        tester.connectSIPWebSocket();

                        tester.slavesNotification().
                            enabled().
                            oneChannel().
                            softphoneServerConnected().
                            userDataFetched().
                            webRTCServerConnected().
                            expectToBeSent();

                        tester.registrationRequest().receiveResponse();

                        tester.slavesNotification().
                            enabled().
                            oneChannel().
                            softphoneServerConnected().
                            userDataFetched().
                            webRTCServerConnected().
                            registered().
                            expectToBeSent();

                        tester.allowMediaInput();

                        tester.slavesNotification().
                            available().
                            oneChannel().
                            expectToBeSent();

                        tester.BX24.initialize();

                        tester.incomingCall().receive();
                        tester.BX24.incomingCall();

                        tester.BX24.recentCall().expectToHaveMethod('CallCardSetUiState').expectParamsToContain({
                            uiState: 'incoming'
                        });

                        tester.numaRequest().receiveResponse();

                        tester.slavesNotification().
                            oneChannel().
                            available().
                            incoming().
                            progress().
                            expectToBeSent();

                        tester.incomingCall().
                            anotherPhoneNumber().
                            busy().
                            receive();
                    });
                });
                describe('URL бэкенда указан. Запрос авторизации отсылается заново по указанному URL.', function() {
                    beforeEach(function() {
                        tester.masterInfoMessage().
                            applyLeader().
                            expectToBeSent().
                            waitForSecond();

                        tester.masterInfoMessage().
                            applyLeader().
                            expectToBeSent().
                            waitForSecond();;

                        tester.slavesNotification().
                            additional().
                            expectToBeSent();

                        tester.slavesNotification().expectToBeSent();

                        tester.masterInfoMessage().
                            tellIsLeader().
                            expectToBeSent();

                        authTokenRequest.
                            appUrlSpecified().
                            receiveResponse();

                        authTokenRequest = tester.authTokenRequest().
                            appUrlSpecified().
                            anotherUrl().
                            expectToBeSent();
                    });

                    it('Запросы отправляются по указанному URL.', function() {
                        authTokenRequest.receiveResponse();
                        tester.setSoftphoneHost('somedomain.com');

                        tester.authCheckRequest().receiveResponse();
                        tester.talkOptionsRequest().receiveResponse();
                        tester.statusesRequest().receiveResponse();
                        tester.permissionsRequest().receiveResponse();
                        tester.settingsRequest().receiveResponse();

                        notificationTester.grantPermission();

                        tester.slavesNotification().
                            oneChannel().
                            enabled().
                            expectToBeSent();

                        tester.connectEventsWebSocket();

                        tester.slavesNotification().
                            oneChannel().
                            enabled().
                            softphoneServerConnected().
                            expectToBeSent();

                        tester.marksRequest().receiveResponse();
                        tester.authenticatedUserRequest().receiveResponse();

                        tester.slavesNotification().
                            oneChannel().
                            enabled().
                            softphoneServerConnected().
                            userDataFetched().
                            expectToBeSent();

                        tester.connectSIPWebSocket();

                        tester.slavesNotification().
                            oneChannel().
                            enabled().
                            softphoneServerConnected().
                            userDataFetched().
                            webRTCServerConnected().
                            expectToBeSent();

                        tester.registrationRequest().receiveResponse();

                        tester.slavesNotification().
                            oneChannel().
                            enabled().
                            softphoneServerConnected().
                            userDataFetched().
                            webRTCServerConnected().
                            registered().
                            expectToBeSent();

                        tester.allowMediaInput();

                        tester.slavesNotification().
                            oneChannel().
                            available().
                            expectToBeSent();
                    });
                    it('Не один запрос не отправлен.', function() {
                        ajax.expectNoRequestsToBeSent();
                    });
                });
            });
            it('Ни одно сообщение не было отправлено в ', function() {
                postMessages.nextMessage().expectNotToExist();
            });
        });
    });
});
