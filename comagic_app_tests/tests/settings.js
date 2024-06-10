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
            reportGroupsRequest,
            settingsRequest,
            accountRequest,
            permissionsRequest,
            authCheckRequest;

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
            const ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(requests),
                reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(requests),
                employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(requests),
                employeeRequest = tester.employeeRequest().expectToBeSent(requests);
            authCheckRequest = tester.authCheckRequest().expectToBeSent(requests);

            requests.expectToBeSent();

            reportsListRequest.receiveResponse();
            reportTypesRequest.receiveResponse();
            employeeStatusesRequest.receiveResponse();
            employeeRequest.receiveResponse();
            employeeSettingsRequest.receiveResponse();
        });

        describe(
            'Вкладка является ведущей. Получены права. Получены настройки софтфона. Получен доступ к микрофону. ' +
            'SIP-линия зарегистрирована. Получены данные для отчета. SIP-регистрация завершена.',
        function() {
            let authenticatedUserRequest,
                registrationRequest,
                settingsRequest;

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
                settingsRequest = tester.settingsRequest().expectToBeSent();
            });

            describe('Настройки определены.', function() {
                beforeEach(function() {
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

                    reportGroupsRequest.receiveResponse();
                    registrationRequest.receiveResponse();

                    tester.slavesNotification().
                        twoChannels().
                        available().
                        expectToBeSent();
                });

                describe('Нажимаю на кнопку "Настройки".', function() {
                    beforeEach(function() {
                        tester.button('Настройки').click();
                    });

                    describe('Нажимаю на кнпоку "Софтфон".', function() {
                        beforeEach(function() {
                            tester.popover.button('Софтфон').click();
                        });

                        describe('Открываю вкладку "Звук".', function() {
                            beforeEach(function() {
                                tester.button('Звук').click();
                            });

                            describe('Настраиваю звук.', function() {
                                let ringtoneRequest;

                                beforeEach(function() {
                                    tester.slider.click(25);

                                    tester.othersNotification().
                                        updateSettings().
                                        ringtoneVolumeChanged().
                                        noMicrophoneDevice().
                                        noRingtoneDevice().
                                        noOutputDevice().
                                        shouldNotPlayCallEndingSignal().
                                        expectToBeSent();

                                    tester.fieldRow('Микрофон').select.arrow.click();
                                    tester.select.option('Микрофон SURE').click();

                                    tester.othersNotification().
                                        updateSettings().
                                        ringtoneVolumeChanged().
                                        microphoneDevice().
                                        noRingtoneDevice().
                                        noOutputDevice().
                                        shouldNotPlayCallEndingSignal().
                                        expectToBeSent();

                                    tester.fieldRow('Динамики').select.arrow.click();
                                    tester.select.option('Колонка JBL').click();

                                    tester.othersNotification().
                                        updateSettings().
                                        ringtoneVolumeChanged().
                                        microphoneDevice().
                                        noRingtoneDevice().
                                        anotherOutputDevice().
                                        shouldNotPlayCallEndingSignal().
                                        expectToBeSent();

                                    tester.fieldRow('Звонящее устройство').select.arrow.click();
                                    tester.select.option('Встроенный динамик').click();

                                    tester.othersNotification().
                                        updateSettings().
                                        anotherRingtoneDevice().
                                        ringtoneVolumeChanged().
                                        microphoneDevice().
                                        anotherOutputDevice().
                                        shouldNotPlayCallEndingSignal().
                                        expectToBeSent();
                                });

                                describe('Продолжаю настраивать звук.', function() {
                                    beforeEach(function() {
                                        tester.button('Сигнал о завершении звонка').click();
                                        tester.settingsUpdatingRequest().isNeedDisconnectSignal().receiveResponse();
                                        tester.settingsRequest().isNeedDisconnectSignal().receiveResponse();

                                        tester.othersNotification().
                                            updateSettings().
                                            shouldPlayCallEndingSignal().
                                            expectToBeSent();

                                        tester.othersNotification().
                                            widgetStateUpdate().
                                            expectToBeSent();

                                        tester.fieldRow('Мелодия звонка').select.arrow.click();
                                        tester.select.option('Мелодия звонка 2').click();

                                        tester.settingsUpdatingRequest().
                                            secondRingtone().
                                            receiveResponse();

                                        tester.settingsRequest().
                                            secondRingtone().
                                            isNeedDisconnectSignal().
                                            receiveResponse();

                                        tester.othersNotification().
                                            updateSettings().
                                            shouldPlayCallEndingSignal().
                                            incomingRingtone().
                                            expectToBeSent();

                                        tester.othersNotification().
                                            widgetStateUpdate().
                                            expectToBeSent();

                                        ringtoneRequest = tester.ringtoneRequest().expectToBeSent();
                                    });

                                    describe('Мелодия загружена.', function() {
                                        beforeEach(function() {
                                            ringtoneRequest.receiveResponse();
                                            fileReader.accomplishFileLoading(tester.secondRingtone);

                                            mediaStreamsTester.setIsAbleToPlayThough(
                                                'data:audio/wav;base64,' +
                                                tester.secondRingtone
                                            );
                                        });

                                        describe('Поступает входящий звонок.', function() {
                                            let incomingCall;

                                            beforeEach(function() {
                                                incomingCall = tester.incomingCall().receive();

                                                tester.slavesNotification().
                                                    available().
                                                    twoChannels().
                                                    incoming().
                                                    progress().
                                                    expectToBeSent();

                                                tester.numaRequest().receiveResponse();
                                                tester.accountRequest().receiveResponse();

                                                tester.outCallEvent().receive();
                                                tester.outCallEvent().slavesNotification().expectToBeSent();
                                            });

                                            it(
                                                'Принимаю звонок. Выбранные настройки звука ' +
                                                'применены.',
                                            function() {
                                                tester.callStartingButton.click();

                                                tester.firstConnection.connectWebRTC();
                                                tester.firstConnection.callTrackHandler();

                                                const mediaStream = tester.allowMediaInput();

                                                tester.firstConnection.addCandidate();
                                                incomingCall.expectOkToBeSent().receiveResponse();

                                                tester.slavesNotification().
                                                    available().
                                                    twoChannels().
                                                    incoming().
                                                    confirmed().
                                                    expectToBeSent();

                                                tester.firstConnection.expectSinkIdToEqual(
                                                    'g8294gjg29guslg82pgj2og8ogjwog8u29gj0pagulo48g92gj28ogtjog82jgab');

                                                tester.expectMicrophoneDeviceIdToEqual(
                                                    mediaStream, 
                                                    '98g2j2pg9842gi2gh89hl48ogh2og82h9g724hg427gla8g2hg289hg9a48ghal4'
                                                );
                                            });
                                            it('Настройки применены.', function() {
                                                mediaStreamsTester.expectStreamsToPlay(
                                                    'data:audio/wav;base64,' + tester.secondRingtone
                                                );

                                                mediaStreamsTester.expectVolumeToEqual(
                                                    'data:audio/wav;base64,' +
                                                    tester.secondRingtone, 25
                                                );

                                                mediaStreamsTester.expectSinkIdToEqual(
                                                    'data:audio/wav;base64,' +
                                                    tester.secondRingtone,

                                                    '6943f509802439f2c170bea3f42991df56faee134b25b3a2f2a13f0fad6943ab'
                                                );

                                                tester.body.expectTextContentToHaveSubstring('Громкость звонка 25%');

                                                tester.fieldRow('Микрофон').
                                                    select. 
                                                    expectToHaveTextContent('Микрофон SURE');

                                                tester.fieldRow('Динамики').
                                                    select.
                                                    expectToHaveTextContent('Колонка JBL');

                                                tester.fieldRow('Звонящее устройство').
                                                    select.
                                                    expectToHaveTextContent('Встроенный динамик');

                                                tester.button('Сигнал о завершении звонка').expectToBeChecked();

                                                utils.expectJSONObjectToContain(
                                                    localStorage.getItem('audioSettings'),
                                                    {
                                                        microphone: {
                                                            deviceId: '98g2j2pg9842gi2gh89hl48ogh2og82h9g724hg427gla8' +
                                                                'g2hg289hg9a48ghal4'
                                                        },
                                                        ringtone: {
                                                            deviceId: '6943f509802439f2c170bea3f42991df56faee134b25b3' +
                                                                'a2f2a13f0fad6943ab',
                                                            volume: 25
                                                        },
                                                        outputDeviceId: 'g8294gjg29guslg82pgj2og8ogjwog8u29gj0pagulo' +
                                                            '48g92gj28ogtjog82jgab'
                                                    }
                                                );
                                            });
                                        });
                                        it(
                                            'Нажимаю на кнопку проигрывания. Рингтон ' +
                                            'проигрывается. Отображена иконка остановки.',
                                        function() {
                                            tester.playerButton.click();

                                            mediaStreamsTester.expectStreamsToPlay(
                                                'data:audio/wav;base64,' +
                                                tester.secondRingtone
                                            );

                                            tester.playerButton.findElement('svg').
                                                expectNotToExist();
                                        });
                                        it('Кнопка проигрывания доступна.', function() {
                                            tester.playerButton.expectNotToHaveClass(
                                                'cmg-ringtone-player-disabled'
                                            );
                                        });
                                    });
                                    it('Кнопка проигрывания заблокирования.', function() {
                                        tester.playerButton.
                                            expectToHaveClass('cmg-ringtone-player-disabled');
                                    });
                                });
                                it('Настройки сохранены в locaStorage.', function() {
                                    utils.expectJSONObjectToContain(
                                        localStorage.getItem('audioSettings'),
                                        {
                                            shouldPlayCallEndingSignal: false,
                                            microphone: {
                                                deviceId: '98g2j2pg9842gi2gh89hl48ogh2og82h9g724hg427gla8g2hg289hg9a48ghal4'
                                            },
                                            ringtone: {
                                                deviceId: '6943f509802439f2c170bea3f42991df56faee134b25b3a2f2a13f0fad6943' +
                                                    'ab',
                                                volume: 25,
                                                value: 'default'
                                            },
                                            outputDeviceId: 'g8294gjg29guslg82pgj2og8ogjwog8u29gj0pagulo48g92gj28ogtjog82' +
                                                'jgab'
                                        }
                                    );
                                });
                            });
                            it('Настройки не выбраны.', function() {
                                tester.fieldRow('Микрофон').select.expectToHaveTextContent('По умолчанию');
                                tester.fieldRow('Динамики').select.expectToHaveTextContent('По умолчанию');
                                tester.fieldRow('Звонящее устройство').select.expectToHaveTextContent('По умолчанию');

                                tester.button('Сигнал о завершении звонка').expectNotToBeChecked();
                                
                                tester.playerButton.expectNotToHaveClass('cmg-ringtone-player-disabled');
                                tester.playerButton.findElement('svg').expectToExist();
                            });
                        });
                        describe('Выбираю режим IP-телефон.', function() {
                            beforeEach(function() {
                                tester.button('Софтфон').click();
                                tester.accountRequest().receiveResponse();

                                tester.slavesNotification().
                                    additional().
                                    visible().
                                    expectToBeSent();

                                tester.dialpadVisibilityButton.click();
                                tester.button('IP-телефон').click();

                                tester.settingsUpdatingRequest().
                                    callsAreManagedByAnotherDevice().
                                    receiveResponse();

                                tester.settingsRequest().
                                    callsAreManagedByAnotherDevice().
                                    receiveResponse();

                                tester.slavesNotification().
                                    userDataFetched().
                                    twoChannels().
                                    disabled().
                                    microphoneAccessGranted().
                                    softphoneServerConnected().
                                    expectToBeSent();

                                tester.othersNotification().
                                    widgetStateUpdate().
                                    isNotUsingWidgetForCalls().
                                    expectToBeSent();

                                tester.registrationRequest().expired().receiveResponse();
                            });

                            it(
                                'Выбираю текущее устройство. Новый вебсокет открыт. Старый Вебсокет закрыт. Сообщение ' +
                                '"Устанавливается соединение..." скрыто.',
                            function() {
                                tester.button('Текущее устройство').click();
                                
                                tester.settingsUpdatingRequest().receiveResponse();
                                tester.settingsRequest().dontTriggerScrollRecalculation().receiveResponse();

                                tester.slavesNotification().
                                    userDataFetched().
                                    twoChannels().
                                    enabled().
                                    softphoneServerConnected().
                                    microphoneAccessGranted().
                                    expectToBeSent();

                                tester.othersNotification().
                                    widgetStateUpdate().
                                    expectToBeSent();

                                tester.connectSIPWebSocket(1);

                                tester.slavesNotification().
                                    userDataFetched().
                                    twoChannels().
                                    webRTCServerConnected().
                                    softphoneServerConnected().
                                    microphoneAccessGranted().
                                    expectToBeSent();

                                tester.registrationRequest().receiveResponse();

                                tester.slavesNotification().
                                    twoChannels().
                                    available().
                                    expectToBeSent();

                                spendTime(1000);
                                tester.getWebRtcSocket(0).finishDisconnecting();

                                tester.softphone.expectTextContentNotToHaveSubstring('Устанавливается соединение...');
                            });
                            it('Вебсокет закрыт.', function() {
                                spendTime(1000);
                                tester.webrtcWebsocket.finishDisconnecting();
                            });
                            it('Разворачиваю виджет. Отображен заблокированный диалпад.', function() {
                                tester.collapsednessToggleButton.click();
                                tester.dialpadButton(1).expectToHaveAttribute('disabled');
                            });
                            it('Свитчбокс "IP-телефон" отмечен.', function() {
                                tester.button('Текущее устройство').expectNotToBeChecked();
                                tester.button('IP-телефон').expectToBeChecked();

                                tester.dialpadVisibilityButton.expectToHaveClass('cmg-button-disabled');
                                tester.dialpadVisibilityButton.expectNotToHaveClass('cmg-button-pressed');

                                tester.dialpadButton(1).expectNotToExist();
                            });
                        });
                        it('Установлены настройки по умолчанию.', function() {
                            tester.button('Текущее устройство').expectToBeChecked();
                            tester.button('IP-телефон').expectNotToBeChecked();
                            tester.button('Автозапуск приложения').expectNotToExist();
                            tester.button('Помощь').expectNotToExist();
                        });
                    });
                    it('Открыто меню настроек.', function() {
                        tester.body.expectTextContentToHaveSubstring(
                            'Настройки ' +

                            'Софтфон ' +
                            'Коллтрекинг ' +
                            'Сценарии' 
                        );
                    });
                });
                describe('Открываю софтфон.', function() {
                    beforeEach(function() {
                        tester.button('Софтфон').click();
                        tester.accountRequest().receiveResponse();

                        tester.slavesNotification().
                            additional().
                            visible().
                            expectToBeSent();
                    });

                    it('Нажимаю на кнопку настроек в нижнем тулбаре. Открыт раздел настроек.', function() {
                        tester.settingsButton.click();

                        tester.settingsButton.expectToBePressed();
                        tester.phoneField.expectToBeVisible();
                        tester.button('Текущее устройство').expectToBeChecked();
                    });
                    it('Кнопка настроек не нажата.', function() {
                        tester.settingsButton.expectNotToBePressed();
                    });
                });
            });
            it('Настройки не определены.', function() {
                settingsRequest.
                    undefinedParams().
                    receiveResponse();

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

                reportGroupsRequest.receiveResponse();
                registrationRequest.receiveResponse();

                tester.slavesNotification().
                    twoChannels().
                    available().
                    expectToBeSent();

                tester.button('Настройки').click();
                tester.popover.button('Софтфон').click();

                tester.button('Открывать во время звонка').expectToBeChecked();
                tester.button('Скрывать после звонка').expectNotToBeChecked();
            });
        });
        it(
            'Вкладка является ведомой. Открываю софтфон. Открываю настройки звука. На другой вкладке ' +
            'изменены настройки звука.',
        function() {
            tester.masterInfoMessage().
                isNotMaster().
                receive();

            tester.notificationChannel().
                applyLeader().
                expectToBeSent();

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

            tester.settingsRequest().
                allowNumberCapacitySelect().
                receiveResponse();

            tester.notificationChannel().
                applyLeader().
                expectToBeSent();

            tester.notificationChannel().
                applyLeader().
                expectToBeSent();

            notificationTester.grantPermission();

            tester.numberCapacityRequest().receiveResponse();
            tester.authenticatedUserRequest().receiveResponse();
            reportGroupsRequest.receiveResponse();

            tester.slavesNotification().
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

            tester.accountRequest().receiveResponse();

            tester.button('Настройки').click();
            tester.popover.button('Софтфон').click();
            tester.button('Звук').click();

            localStorage.setItemInAnotherTab('audioSettings', JSON.stringify({
                shouldPlayCallEndingSignal: true,
                microphone: {
                    deviceId: '98g2j2pg9842gi2gh89hl48ogh2og82h9g724hg427gla8g2hg289hg9a48ghal4'
                },
                ringtone: {
                    deviceId: '6943f509802439f2c170bea3f42991df56faee134b25b3a2f2a13f0fad6943ab',
                    volume: 25,
                    value: 'softphone_ringtone2'
                },
                outputDeviceId: 'g8294gjg29guslg82pgj2og8ogjwog8u29gj0pagulo48g92gj28ogtjog82jgab'
            }));

            tester.othersNotification().
                updateSettings().
                anotherRingtoneDevice().
                ringtoneVolumeChanged().
                microphoneDevice().
                anotherOutputDevice().
                shouldPlayCallEndingSignal().
                incomingRingtone().
                receive();

            tester.ringtoneRequest().receiveResponse();
            fileReader.accomplishFileLoading(tester.secondRingtone);

            mediaStreamsTester.setIsAbleToPlayThough(
                'data:audio/wav;base64,' +
                tester.secondRingtone
            );

            tester.body.expectTextContentToHaveSubstring('Громкость звонка 25%');

            tester.fieldRow('Мелодия звонка').select.expectToHaveTextContent('Мелодия звонка 2');
            tester.fieldRow('Микрофон').select.expectToHaveTextContent('Микрофон SURE');
            tester.fieldRow('Динамики').select.expectToHaveTextContent('Колонка JBL');
            tester.fieldRow('Звонящее устройство').select.expectToHaveTextContent('Встроенный динамик');

            tester.button('Сигнал о завершении звонка').expectToBeChecked();
        });
    });
    describe('Ранее были выбраны настройки звука. Открываю настройки звука.', function() {
        let tester;

        beforeEach(function() {
            localStorage.setItem('audioSettings', JSON.stringify({
                shouldPlayCallEndingSignal: false,
                microphone: {
                    deviceId: '98g2j2pg9842gi2gh89hl48ogh2og82h9g724hg427gla8g2hg289hg9a48ghal4'
                },
                ringtone: {
                    deviceId: '6943f509802439f2c170bea3f42991df56faee134b25b3a2f2a13f0fad6943ab',
                    volume: 25,
                    value: 'default'
                },
                outputDeviceId: 'g8294gjg29guslg82pgj2og8ogjwog8u29gj0pagulo48g92gj28ogtjog82jgab'
            }));
                
            setNow('2019-12-19T12:10:06');

            tester = new Tester(options);

            tester.input.withFieldLabel('Логин').fill('botusharova');
            tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

            tester.button('Войти').click();

            tester.loginRequest().receiveResponse();
            tester.accountRequest().receiveResponse();

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
            employeeSettingsRequest.receiveResponse(),
            employeeStatusesRequest.receiveResponse();
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
            tester.permissionsRequest().receiveResponse();
            
            tester.settingsRequest().
                secondRingtone().
                isNeedDisconnectSignal().
                receiveResponse();

            tester.othersNotification().
                updateSettings().
                shouldPlayCallEndingSignal().
                anotherCustomRingtone().
                expectToBeSent();

            tester.slavesNotification().
                twoChannels().
                enabled().
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
                softphoneServerConnected().
                webRTCServerConnected().
                registered().
                expectToBeSent();

            tester.allowMediaInput();

            tester.slavesNotification().
                twoChannels().
                available().
                expectToBeSent();

            tester.button('Настройки').click();
            tester.popover.button('Софтфон').click();

            tester.button('Звук').click();
        });

        describe('Поступил входящий звонок.', function() {
            let incomingCall;

            beforeEach(function() {
                incomingCall = tester.incomingCall().receive();

                tester.slavesNotification().
                    available().
                    twoChannels().
                    incoming().
                    progress().
                    expectToBeSent();

                tester.numaRequest().receiveResponse();
                tester.accountRequest().receiveResponse();

                tester.outCallEvent().receive();
                tester.outCallEvent().slavesNotification().expectToBeSent();
            });

            describe('Событие canplaythrough вызвано.', function() {
                beforeEach(function() {
                    mediaStreamsTester.setIsAbleToPlayThough('data:audio/wav;base64,' + tester.secondRingtone);
                });
                
                describe('Принимаю звонок.', function() {
                    beforeEach(function() {
                        tester.callButton.click();

                        tester.firstConnection.connectWebRTC();
                        tester.firstConnection.callTrackHandler();
                        tester.allowMediaInput();
                        tester.firstConnection.addCandidate();

                        incomingCall.expectOkToBeSent().receiveResponse();

                        tester.slavesNotification().
                            available().
                            twoChannels().
                            incoming().
                            confirmed().
                            expectToBeSent();
                    });

                    it('Выбираю другой рингтон. Звучит больше не звучит.', function() {
                        tester.fieldRow('Мелодия звонка').
                            select.
                            arrow.
                            click();

                        tester.select.
                            option('Мелодия звонка 3').
                            click();

                        tester.settingsUpdatingRequest().
                            thirdRingtone().
                            receiveResponse();

                        tester.settingsRequest().
                            thirdRingtone().
                            isNeedDisconnectSignal().
                            receiveResponse();

                        tester.othersNotification().
                            updateSettings().
                            shouldPlayCallEndingSignal().
                            customRingtone().
                            expectToBeSent();

                        tester.othersNotification().
                            widgetStateUpdate().
                            expectToBeSent();

                        tester.ringtoneRequest().third().receiveResponse();

                        fileReader.accomplishFileLoading(tester.thirdRingtone);

                        mediaStreamsTester.setIsAbleToPlayThough('data:audio/wav;base64,' + tester.thirdRingtone);
                        tester.firstConnection.expectRemoteStreamToPlay();
                    });
                    it('Событие canplaythrough вызвано. Рингтон больше не звучит.', function() {
                        mediaStreamsTester.setIsAbleToPlayThough('data:audio/wav;base64,' + tester.secondRingtone);
                        tester.firstConnection.expectRemoteStreamToPlay();
                    });
                    it('Рингтон больше не звучит.', function() {
                        tester.firstConnection.expectRemoteStreamToPlay();
                    });
                });
                it('Звучит рингтон.', function() {
                    mediaStreamsTester.expectStreamsToPlay('data:audio/wav;base64,' + tester.secondRingtone);
                });
            });
            it('Принимаю звонок. Выбранные настройки звука применены.', function() {
                tester.callStartingButton.click();

                tester.firstConnection.connectWebRTC();
                tester.firstConnection.callTrackHandler();
                const mediaStream = tester.allowMediaInput();
                tester.firstConnection.addCandidate();

                incomingCall.expectOkToBeSent().receiveResponse();

                tester.slavesNotification().
                    available().
                    twoChannels().
                    incoming().
                    confirmed().
                    expectToBeSent();
                    
                tester.firstConnection.expectRemoteStreamToPlay();

                tester.firstConnection.expectSinkIdToEqual('g8294gjg29guslg82pgj' +
                    '2og8ogjwog8u29gj0pagulo48g92gj28ogtjog82jgab');

                tester.expectMicrophoneDeviceIdToEqual(
                    mediaStream, 

                    '98g2j2pg9842gi2gh89hl48ogh2og82h9g724hg427gla8g2hg289hg9a48' +
                    'ghal4'
                );
            });
            it('Выбираю другой рингтон. Звучит рингтон.', function() {
                tester.fieldRow('Мелодия звонка').select.arrow.click();
                tester.select.option('Мелодия звонка 3').click();

                tester.settingsUpdatingRequest().thirdRingtone().receiveResponse();
                tester.settingsRequest().thirdRingtone().isNeedDisconnectSignal().receiveResponse();

                tester.othersNotification().
                    updateSettings().
                    shouldPlayCallEndingSignal().
                    customRingtone().
                    expectToBeSent();

                tester.othersNotification().
                    widgetStateUpdate().
                    expectToBeSent();

                tester.ringtoneRequest().third().receiveResponse();
 
                fileReader.accomplishFileLoading(tester.thirdRingtone);

                mediaStreamsTester.setIsAbleToPlayThough('data:audio/wav;base64,' + tester.thirdRingtone);

                tester.softphone.expectTextContentToHaveSubstring('Шалева Дора');
                mediaStreamsTester.expectStreamsToPlay('data:audio/wav;base64,' + tester.thirdRingtone);
            });
            it('Выбранные настройки звука применены.', function() {
                mediaStreamsTester.expectStreamsToPlay('data:audio/wav;base64,' + tester.secondRingtone);
                mediaStreamsTester.expectVolumeToEqual('data:audio/wav;base64,' + tester.secondRingtone, 25);

                mediaStreamsTester.expectSinkIdToEqual(
                    'data:audio/wav;base64,' + tester.secondRingtone,

                    '6943f509802439f2c170bea3f42991df56faee134b25b3a2f2a13f0fad6' +
                    '943ab'
                );
            });
        });
        it('Отключаю выбранное устройство. Выбрано устройство по умолчанию.', function() {
            userMedia.unplugDevice();
            tester.fieldRow('Динамики').select.expectToHaveTextContent('По умолчанию');
        });
        it('Настройки звука отображены.', function() {
            tester.body.expectTextContentToHaveSubstring('Громкость звонка 25%');
            tester.fieldRow('Мелодия звонка').select.expectToHaveTextContent('Мелодия звонка 2');
            tester.fieldRow('Микрофон').select.expectToHaveTextContent('Микрофон SURE');
            tester.fieldRow('Динамики').select.expectToHaveTextContent('Колонка JBL');
            tester.fieldRow('Звонящее устройство').select.expectToHaveTextContent('Встроенный динамик');
            tester.button('Сигнал о завершении звонка').expectToBeChecked();

            localStorage.setItem('audioSettings', JSON.stringify({
                shouldPlayCallEndingSignal: true,
                microphone: {
                    deviceId: '98g2j2pg9842gi2gh89hl48ogh2og82h9g724hg427gla8g2hg289hg9a48ghal4'
                },
                ringtone: {
                    deviceId: '6943f509802439f2c170bea3f42991df56faee134b25b3a2f2a13f0fad6943ab',
                    volume: 25,
                    value: 'softphone_ringtone2'
                },
                outputDeviceId: 'g8294gjg29guslg82pgj2og8ogjwog8u29gj0pagulo48g92gj28ogtjog82jgab'
            }));
        });
    });
    it('Открываю настройки софтфона. Страница локализована.', function() {
        const tester = new Tester({
            ...options,
            path: '/softphone/settings',
            isAlreadyAuthenticated: true
        });

        tester.accountRequest().receiveResponse();

        const requests = ajax.inAnyOrder();

        const reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
            ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(requests),
            reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
            reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
            authCheckRequest = tester.authCheckRequest().expectToBeSent(requests),
            employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(requests),
            employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(requests),
            employeeRequest = tester.employeeRequest().expectToBeSent(requests);

        requests.expectToBeSent();

        ticketsContactsRequest.receiveResponse();
        reportGroupsRequest.receiveResponse();
        reportsListRequest.receiveResponse();
        reportTypesRequest.receiveResponse();
        employeeSettingsRequest.receiveResponse(),
        employeeStatusesRequest.receiveResponse();
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

        tester.masterInfoMessage().
            applyLeader().
            expectToBeSent();

        tester.employeesBroadcastChannel().
            tellIsLeader().
            expectToBeSent();

        tester.notificationChannel().
            tellIsLeader().
            expectToBeSent();

        tester.employeesWebSocket.connect();
        tester.employeesInitMessage().expectToBeSent();

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
            twoChannels().
            available().
            expectToBeSent();

        tester.body.expectTextContentToHaveSubstring('Общие Звук');
        tester.body.expectTextContentNotToHaveSubstring('Common Sound');
    });
});
