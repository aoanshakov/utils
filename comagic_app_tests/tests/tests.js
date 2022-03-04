tests.addTest(options => {
    const {
        utils,
        Tester,
        spendTime,
        windowOpener,
        mediaStreamsTester,
        ajax,
        fetch,
        soundSources,
        setNow,
        fileReader,
        userMedia,
        audioDecodingTester,
        notificationTester,
        setFocus,
        setBrowserHidden
    } = options;

    afterEach(function() {
        spendTime(0);
    });

    describe('Открываю новый личный кабинет.', function() {
        let tester,
            reportGroupsRequest,
            settingsRequest,
            accountRequest,
            permissionsRequest;

        beforeEach(function() {
            setNow('2019-12-19T12:10:06');

            tester = new Tester(options);

            tester.input.withFieldLabel('Логин').fill('botusharova');
            tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

            tester.button('Войти').click();

            tester.loginRequest().receiveResponse();
            accountRequest = tester.accountRequest().expectToBeSent();
        });

        describe('Фичафлаг софтфона включен.', function() {
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

                tester.configRequest().softphone().receiveResponse();

                tester.authCheckRequest().receiveResponse();
                tester.statusesRequest().receiveResponse();
                settingsRequest = tester.settingsRequest().expectToBeSent();
                tester.talkOptionsRequest().receiveResponse();
                permissionsRequest = tester.permissionsRequest().expectToBeSent();
            });

            describe('Получены права.', function() {
                beforeEach(function() {
                    permissionsRequest.receiveResponse();
                });

                describe('Получены настройки софтфона.', function() {
                    let authenticatedUserRequest,
                        registrationRequest;

                    beforeEach(function() {
                        settingsRequest.receiveResponse();
                        notificationTester.grantPermission();

                        tester.connectEventsWebSocket();
                        tester.connectSIPWebSocket();

                        authenticatedUserRequest = tester.authenticatedUserRequest().expectToBeSent();
                        registrationRequest = tester.registrationRequest().expectToBeSent();
                    });

                    describe('Получен доступ к микрофону.', function() {
                        beforeEach(function() {
                            tester.allowMediaInput();
                        });

                        describe('SIP-линия зарегистрирована.', function() {
                            beforeEach(function() {
                                authenticatedUserRequest.receiveResponse();
                            });

                            describe('Получены данные для отчета.', function() {
                                beforeEach(function() {
                                    reportGroupsRequest.receiveResponse();
                                });

                                describe('SIP-регистрация завершена.', function() {
                                    beforeEach(function() {
                                        registrationRequest.receiveResponse();
                                    });

                                    describe('Поступил входящий звонок.', function() {
                                        let incomingCall;

                                        beforeEach(function() {
                                            incomingCall = tester.incomingCall().receive();
                                            tester.numaRequest().receiveResponse();
                                        });

                                        describe('Контакт найден.', function() {
                                            beforeEach(function() {
                                                tester.outCallEvent().receive();
                                            });

                                            describe('Принимаю звонок.', function() {
                                                beforeEach(function() {
                                                    tester.callStartingButton.click();

                                                    tester.firstConnection.connectWebRTC();
                                                    tester.firstConnection.callTrackHandler();

                                                    tester.allowMediaInput();
                                                    tester.firstConnection.addCandidate();
                                                    tester.requestAcceptIncomingCall();
                                                });

                                                describe('Нажимаю на кнопку трансфера.', function() {
                                                    let usersRequest,
                                                        usersInGroupsRequest;

                                                    beforeEach(function() {
                                                        tester.transferButton.click();

                                                        usersRequest = tester.usersRequest().expectToBeSent();
                                                        usersInGroupsRequest = tester.usersInGroupsRequest().
                                                            expectToBeSent();
                                                        tester.groupsRequest().receiveResponse();
                                                    });

                                                    describe('Сотрдников мало.', function() {
                                                        beforeEach(function() {
                                                            usersRequest.receiveResponse();
                                                            usersInGroupsRequest.receiveResponse();
                                                        });

                                                        describe('Нажимаю на кнопку поиска.', function() {
                                                            beforeEach(function() {
                                                                tester.searchButton.click();
                                                            });

                                                            describe('Ввожу значение в поле поиска.', function() {
                                                                beforeEach(function() {
                                                                    tester.softphone.input.fill('ова');
                                                                });

                                                                it(
                                                                    'Нажимаю на иконку очищения поля. Отображены все ' +
                                                                    'сотрудники.',
                                                                function() {
                                                                    tester.softphone.input.clearIcon.click();

                                                                    tester.softphone.expectToHaveTextContent(
                                                                        'Сотрудники Группы ' +

                                                                        'Божилова Йовка 296 ' +
                                                                        'Господинова Николина 295 ' +
                                                                        'Шалева Дора 8258'
                                                                    );
                                                                });
                                                                it('Отображены найденные сотрудники.', function() {
                                                                    tester.softphone.expectToHaveTextContent(
                                                                        'Божил ова Йовка 296 ' +
                                                                        'Господин ова Николина 295'
                                                                    );
                                                                });
                                                            });
                                                            it(
                                                                'Ввожу значение в поле поиска. Ничего не найдено. ' +
                                                                'Отображено сообщение о том, что ничего не найдено.',
                                                            function() {
                                                                tester.softphone.input.fill('йцукен');
                                                                tester.softphone.
                                                                    expectToHaveTextContent('Сотрудник не найден');
                                                            });
                                                        });
                                                        describe('Открываю вкладку групп.', function() {
                                                            beforeEach(function() {
                                                                tester.button('Группы').click();
                                                            });

                                                            it(
                                                                'Соединение разрывается. Кнопка звонка заблокирована.',
                                                            function() {
                                                                tester.disconnectEventsWebSocket();

                                                                tester.employeeRow('Отдел дистрибуции').
                                                                    expectToBeDisaled();
                                                            });
                                                            it('Отображена таблица групп.', function() {
                                                                tester.employeeRow('Отдел дистрибуции').
                                                                    expectToBeEnabled();

                                                                tester.softphone.expectToHaveTextContent(
                                                                    'Сотрудники Группы ' +

                                                                    'Отдел дистрибуции 298 1 /1 ' +
                                                                    'Отдел по работе с ключевыми клиентами 726 0 /1 ' +
                                                                    'Отдел региональных продаж 828 2 /2'
                                                                );
                                                            });
                                                        });
                                                        it('Нажимаю на строку в таблице сотрудника.', function() {
                                                            tester.employeeRow('Господинова Николина').click();

                                                            tester.dtmf('#').expectToBeSent();
                                                            spendTime(600);
                                                            tester.dtmf('2').expectToBeSent();
                                                            spendTime(600);
                                                            tester.dtmf('9').expectToBeSent();
                                                            spendTime(600);
                                                            tester.dtmf('5').expectToBeSent();
                                                            spendTime(600);

                                                            tester.transferButton.click();

                                                            tester.dtmf('#').expectToBeSent();
                                                        });
                                                        it('Отображена таблица сотрудников.', function() {
                                                            tester.softphone.expectToHaveTextContent(
                                                                'Сотрудники Группы ' +

                                                                'Божилова Йовка 296 ' +
                                                                'Господинова Николина 295 ' +
                                                                'Шалева Дора 8258'
                                                            );

                                                            tester.employeeRow('Божилова Йовка').transferIcon.
                                                                expectToBeVisible();
                                                            tester.employeeRow('Божилова Йовка').expectToBeDisaled();
                                                            tester.employeeRow('Шалева Дора').expectToBeEnabled();
                                                        });
                                                    });
                                                    it('Сотрудников много.', function() {
                                                        usersRequest.addMore().receiveResponse();
                                                        usersInGroupsRequest.addMore().receiveResponse();
                                                    });
                                                });
                                                describe('Нажимаю на кнопку выключения микрофона.', function() {
                                                    beforeEach(function() {
                                                        tester.microphoneButton.click();
                                                    });

                                                    it(
                                                        'Собеседник повесил трубку. Поступил входящий звонок. ' +
                                                        'Микрофон включен.',
                                                    function() {
                                                        incomingCall.receiveBye();

                                                        tester.incomingCall().receive();
                                                        tester.numaRequest().receiveResponse();
                                                        tester.outCallEvent().receive();

                                                        tester.callStartingButton.click();

                                                        tester.secondConnection.connectWebRTC();
                                                        tester.secondConnection.callTrackHandler();

                                                        tester.allowMediaInput();
                                                        tester.secondConnection.addCandidate();
                                                        tester.requestAcceptIncomingCall();

                                                        tester.microphoneButton.
                                                            expectNotToHaveClass('clct-call-option--pressed');
                                                            
                                                        tester.secondConnection.expectNotToBeMute();
                                                    });
                                                    it('Микрофон выключен.', function() {
                                                        tester.firstConnection.expectToBeMute();

                                                        tester.microphoneButton.
                                                            expectToHaveClass('clct-call-option--pressed');
                                                    });
                                                });
                                                it('Нажимаю на кнопку удержания. Звонок удерживается.', function() {
                                                    tester.holdButton.click();
                                                    audioDecodingTester.accomplishAudioDecoding();

                                                    tester.firstConnection.expectHoldMusicToPlay();
                                                });
                                                it('Отображено направление и номер.', function() {
                                                    tester.microphoneButton.
                                                        expectNotToHaveClass('clct-call-option--pressed');

                                                    tester.firstConnection.expectSinkIdToEqual('default');
                                                    tester.firstConnection.expectInputDeviceIdToEqual('default');
                                                    tester.firstConnection.expectNotToBeMute();

                                                    tester.incomingIcon.expectToBeVisible();
                                                    tester.softphone.expectTextContentToHaveSubstring(
                                                        'Шалева Дора +7 (916) 123-45-67 00:00:00'
                                                    );
                                                });
                                            });
                                            describe(
                                                'Сворачиваю софтфон. Звонок отменен. Разворачиваю софтфон. Поступает ' +
                                                'входящий звонок.',
                                            function() {
                                                beforeEach(function() {
                                                    tester.collapsednessToggleButton.click();
                                                    incomingCall.receiveCancel();
                                                    tester.collapsednessToggleButton.click();

                                                    tester.incomingCall().receive();
                                                    tester.numaRequest().receiveResponse();
                                                    tester.outCallEvent().receive();
                                                });

                                                it('Принимаю звонок. Отображен диалпад.', function() {
                                                    tester.callStartingButton.click();

                                                    tester.firstConnection.connectWebRTC();
                                                    tester.firstConnection.callTrackHandler();

                                                    tester.allowMediaInput();
                                                    tester.firstConnection.addCandidate();
                                                    tester.requestAcceptIncomingCall();

                                                    tester.dialpadButton(1).expectToBeVisible();;
                                                });
                                                it('Отображена информация о контакте.', function() {
                                                    tester.softphone.expectTextContentToHaveSubstring(
                                                        'Шалева Дора +7 (916) 123-45-67 ' +
                                                        'Путь лида'
                                                    );
                                                });
                                            });
                                            it('Нажимаю на кнопку открытия контакта.', function() {
                                                tester.contactOpeningButton.click();

                                                windowOpener.expectToHavePath(
                                                    'https://comagicwidgets.amocrm.ru/contacts/detail/382030'
                                                );
                                            });
                                            it('Нажимаю на кнопку сворачивания виджета. Виджет свернут.', function() {
                                                tester.collapsednessToggleButton.click();

                                                tester.collapsednessToggleButton.
                                                    expectToHaveClass('expand_svg__cmg-expand-icon');

                                                tester.softphone.expectTextContentNotToHaveSubstring('Путь лида');
                                            });
                                            it('Отображена информация о контакте.', function() {
                                                tester.collapsednessToggleButton.
                                                    expectToHaveClass('collapse_svg__cmg-collapse-icon');

                                                tester.contactOpeningButton.expectNotToHaveClass('cmg-button-disabled');
                                                tester.incomingIcon.expectToBeVisible();

                                                tester.softphone.expectTextContentToHaveSubstring(
                                                    'Шалева Дора +7 (916) 123-45-67 ' +
                                                    'Путь лида'
                                                );

                                                tester.firstLineButton.expectToHaveClass('cmg-bottom-button-selected');
                                                tester.secondLineButton.
                                                    expectNotToHaveClass('cmg-bottom-button-selected');

                                                tester.softphone.expectToBeExpanded();
                                            });
                                        });
                                        describe('Звонок переведен от другого сотрудника.', function() {
                                            let outCallEvent;

                                            beforeEach(function() {
                                                outCallEvent = tester.outCallEvent().isTransfer();
                                            });

                                            describe('Автоответ отключен.', function() {
                                                beforeEach(function() {
                                                    outCallEvent.receive();
                                                });

                                                it('Принимаю звонок. Отображен знак трансфера номер и таймер.', function() {
                                                    tester.callStartingButton.click();

                                                    tester.firstConnection.connectWebRTC();
                                                    tester.firstConnection.callTrackHandler();

                                                    tester.allowMediaInput();
                                                    tester.firstConnection.addCandidate();
                                                    tester.requestAcceptIncomingCall();

                                                    tester.transferIncomingIcon.expectToBeVisible();
                                                    tester.softphone.expectTextContentToHaveSubstring(
                                                        'Шалева Дора +7 (916) 123-45-67 00:00:00'
                                                    );
                                                });
                                                it('Отображено сообщение о переводе звонка.', function() {
                                                    tester.incomingIcon.expectNotToExist();
                                                    tester.outgoingIcon.expectNotToExist();

                                                    tester.softphone.expectTextContentToHaveSubstring(
                                                        'Шалева Дора +7 (916) 123-45-67 Трансфер от Бисерка Макавеева'
                                                    );
                                                });
                                            });
                                            it('Автоответ включен. Звонок не принимается автоматически.', function() {
                                                outCallEvent.needAutoAnswer().receive();
                                            });
                                        });
                                        describe('Звонок производится в рамках исходящего обзвона.', function() {
                                            var outCallEvent;

                                            beforeEach(function() {
                                                outCallEvent = tester.outCallEvent().autoCallCampaignName();
                                            });

                                            it('Автоответ включен. Звонок принимается.', function() {
                                                outCallEvent.needAutoAnswer().receive();

                                                tester.firstConnection.connectWebRTC();
                                                tester.firstConnection.callTrackHandler();

                                                tester.allowMediaInput();
                                                tester.firstConnection.addCandidate();
                                                tester.requestAcceptIncomingCall();

                                                tester.softphone.expectTextContentToHaveSubstring(
                                                    'Шалева Дора +7 (916) 123-45-67 00:00:00'
                                                );
                                            });
                                            it(
                                                'Имя контакта отсутствует. Звонок обозначен, как исходящий обзвон.',
                                            function() {
                                                outCallEvent.noName().receive();

                                                tester.outgoingIcon.expectToBeVisible();
                                                tester.softphone.expectTextContentToHaveSubstring(
                                                    '+7 (916) 123-45-67 Исходящий обзвон'
                                                );
                                            });
                                            it('Звонок отображается как исходящий.', function() {
                                                outCallEvent.receive();

                                                tester.outgoingIcon.expectToBeVisible();
                                                tester.softphone.expectTextContentToHaveSubstring(
                                                    'Шалева Дора +7 (916) 123-45-67'
                                                );
                                            });
                                        });
                                        it(
                                            'Контакт не найден. Отображно направление звонка. Кнопка открытия ' +
                                            'контакта заблокирована.',
                                        function() {
                                            tester.outCallEvent().noName().noCrmContactLink().receive();
                                            tester.contactOpeningButton.click();

                                            tester.contactOpeningButton.expectToHaveClass('cmg-button-disabled');
                                            windowOpener.expectNoWindowToBeOpened();

                                            tester.incomingIcon.expectToBeVisible();
                                            tester.softphone.expectTextContentToHaveSubstring(
                                                '+7 (916) 123-45-67 Входящий звонок'
                                            );
                                        });
                                        it('Открытые сделки существуют. Открытые сделки отображены.', function() {
                                            tester.outCallEvent().activeLeads().receive();

                                            tester.anchor('По звонку с 79154394340').expectHrefToHavePath(
                                                'https://comagicwidgets.amocrm.ru/leads/detail/3003651'
                                            );
                                        });
                                        it(
                                            'Потеряно соединение с сервером. Звонок отменен. Рингтон не звучит.',
                                        function() {
                                            tester.eventsWebSocket.disconnectAbnormally(1006);
                                            incomingCall.receiveCancel();

                                            tester.expectNoSoundToPlay();
                                        });
                                        it('Звонок отменен. Рингтон не звучит.', function() {
                                            incomingCall.receiveCancel();
                                            tester.expectNoSoundToPlay();
                                        });
                                        it('У контакта длинное имя.', function() {
                                            tester.outCallEvent().longName().receive();
                                        });
                                        it('Отображено сообщение о поиске контакта.', function() {
                                            tester.interceptButton.expectNotToExist();
                                            tester.contactOpeningButton.expectNotToExist();
                                            tester.dialpadVisibilityButton.expectNotToExist();
                                            tester.microphoneButton.expectNotToExist();
                                            tester.transferButton.expectNotToExist();
                                            tester.incomingIcon.expectToBeVisible();
                                            tester.softphone.expectTextContentToHaveSubstring(
                                                '+7 (916) 123-45-67 Поиск контакта...'
                                            );

                                            mediaStreamsTester.
                                                expectStreamsToPlay(soundSources.incomingCall);

                                            mediaStreamsTester.expectSinkIdToEqual(
                                                soundSources.incomingCall,
                                                'default'
                                            );
                                        });
                                    });
                                    describe('Нажимаю на кнопку "Настройки". Нажимаю на кнопку "Софтфон".', function() {
                                        beforeEach(function() {
                                            tester.button('Настройки').click();
                                            tester.popover.button('Софтфон').click();
                                        });

                                        describe('Открываю вкладку "Звук".', function() {
                                            beforeEach(function() {
                                                tester.button('Звук').click();
                                            });

                                            describe('Настраиваю звук.', function() {
                                                let ringtoneRequest;

                                                beforeEach(function() {
                                                    tester.slider.click(26);

                                                    tester.fieldRow('Микрофон').select.arrow.click();
                                                    tester.select.option('Микрофон SURE').click();

                                                    tester.fieldRow('Динамики').select.arrow.click();
                                                    tester.select.option('Колонка JBL').click();

                                                    tester.fieldRow('Звонящее устройство').select.arrow.click();
                                                    tester.select.option('Встроенный динамик').click();

                                                    tester.button('Сигнал о завершении звонка').click();
                                                    tester.settingsUpdatingRequest().isNeedDisconnectSignal().
                                                        receiveResponse();
                                                    tester.settingsRequest().isNeedDisconnectSignal().receiveResponse();

                                                    tester.fieldRow('Мелодия звонка').select.arrow.click();
                                                    tester.select.option('Мелодия звонка 2').click();
                                                    tester.settingsUpdatingRequest().secondRingtone().receiveResponse();
                                                    tester.settingsRequest().secondRingtone().isNeedDisconnectSignal().
                                                        receiveResponse();

                                                    ringtoneRequest = tester.ringtoneRequest().
                                                        expectToBeSent();
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
                                                        beforeEach(function() {
                                                            tester.incomingCall().receive();
                                                            tester.numaRequest().receiveResponse();

                                                            tester.outCallEvent().receive();
                                                        });

                                                        it(
                                                            'Принимаю звонок. Выбранные настройки звука применены.',
                                                        function() {
                                                            tester.callStartingButton.click();

                                                            tester.firstConnection.connectWebRTC();
                                                            tester.firstConnection.callTrackHandler();

                                                            const mediaStream = tester.allowMediaInput();

                                                            tester.firstConnection.addCandidate();
                                                            tester.requestAcceptIncomingCall();

                                                            tester.firstConnection.expectSinkIdToEqual('g8294gjg29gus' +
                                                                'lg82pgj2og8ogjwog8u29gj0pagulo48g92gj28ogtjog82jgab');

                                                            tester.expectMicrophoneDeviceIdToEqual(
                                                                mediaStream, 

                                                                '98g2j2pg9842gi2gh89hl48ogh2og82h9g724hg427gla8g2hg28' +
                                                                '9hg9a48ghal4'
                                                            );
                                                        });
                                                        it('Настройки применены.', function() {
                                                            mediaStreamsTester.expectStreamsToPlay(
                                                                'data:audio/wav;base64,' + tester.secondRingtone
                                                            );

                                                            mediaStreamsTester.expectVolumeToEqual(
                                                                'data:audio/wav;base64,' + tester.secondRingtone,
                                                                25
                                                            );

                                                            mediaStreamsTester.expectSinkIdToEqual(
                                                                'data:audio/wav;base64,' + tester.secondRingtone,

                                                                '6943f509802439f2c170bea3f42991df56faee134b25b3a2f2a1' +
                                                                '3f0fad6943ab'
                                                            );

                                                            tester.body.expectTextContentToHaveSubstring(
                                                                'Громкость звонка 25%'
                                                            );

                                                            tester.fieldRow('Микрофон').select.
                                                                expectToHaveTextContent('Микрофон SURE');

                                                            tester.fieldRow('Динамики').select.
                                                                expectToHaveTextContent('Колонка JBL');

                                                            tester.fieldRow('Звонящее устройство').select.
                                                                expectToHaveTextContent('Встроенный динамик');

                                                            tester.button('Сигнал о завершении звонка').
                                                                expectToBeChecked();

                                                            utils.expectJSONObjectToContain(
                                                                localStorage.getItem('audioSettings'),
                                                                {
                                                                    microphone: {
                                                                        deviceId: '98g2j2pg9842gi2gh89hl48ogh2og82h9g' +
                                                                            '724hg427gla8g2hg289hg9a48ghal4'
                                                                    },
                                                                    ringtone: {
                                                                        deviceId: '6943f509802439f2c170bea3f42991df56' +
                                                                            'faee134b25b3a2f2a13f0fad6943ab',
                                                                        volume: 25
                                                                    },
                                                                    outputDeviceId: 'g8294gjg29guslg82pgj2og8ogjwog8u' +
                                                                        '29gj0pagulo48g92gj28ogtjog82jgab',
                                                                }
                                                            );
                                                        });
                                                    });
                                                    it(
                                                        'Нажимаю на кнопку проигрывания. Рингтон проигрывается. ' +
                                                        'Отображена иконка остановки.',
                                                    function() {
                                                        tester.playerButton.click();

                                                        mediaStreamsTester.expectStreamsToPlay(
                                                            'data:audio/wav;base64,' +
                                                            tester.secondRingtone
                                                        );

                                                        tester.playerButton.findElement('svg').expectNotToExist();
                                                    });
                                                    it('Кнопка проигрывания доступна.', function() {
                                                        tester.playerButton.
                                                            expectNotToHaveClass('cmg-ringtone-player-disabled');
                                                    });
                                                });
                                                it('Кнопка проигрывания заблокирования.', function() {
                                                    tester.playerButton.
                                                        expectToHaveClass('cmg-ringtone-player-disabled');
                                                });
                                            });
                                            it('Настройки не выбраны.', function() {
                                                tester.fieldRow('Микрофон').select.
                                                    expectToHaveTextContent('По умолчанию');
                                                tester.fieldRow('Динамики').select.
                                                    expectToHaveTextContent('По умолчанию');
                                                tester.fieldRow('Звонящее устройство').select.
                                                    expectToHaveTextContent('По умолчанию');

                                                tester.button('Сигнал о завершении звонка').expectNotToBeChecked();
                                                
                                                tester.playerButton.
                                                    expectNotToHaveClass('cmg-ringtone-player-disabled');

                                                tester.playerButton.findElement('svg').expectToExist();
                                            });
                                        });
                                        describe('Выбираю режим IP-телефон.', function() {
                                            beforeEach(function() {
                                                tester.button('IP-телефон').click();
                                                tester.settingsUpdatingRequest().callsAreManagedByAnotherDevice().
                                                    receiveResponse();
                                                tester.settingsRequest().callsAreManagedByAnotherDevice().
                                                    receiveResponse();

                                                tester.registrationRequest().expired().receiveResponse();
                                            });

                                            it(
                                                'Выбираю текущее устройство. Новый вебсокет открыт. Старый Вебсокет ' +
                                                'закрыт. Сообщение "Устанавливается соединение..." скрыто.',
                                            function() {
                                                tester.button('Текущее устройство').click();
                                                
                                                tester.settingsUpdatingRequest().receiveResponse();
                                                tester.settingsRequest().dontTriggerScrollRecalculation().
                                                    receiveResponse();

                                                tester.connectSIPWebSocket(1);
                                                tester.registrationRequest().receiveResponse();

                                                tester.button('Софтфон').click();

                                                spendTime(1000);
                                                tester.getWebRtcSocket(0).finishDisconnecting();

                                                tester.softphone.expectTextContentNotToHaveSubstring(
                                                    'Устанавливается соединение...'
                                                );
                                            });
                                            it('Вебсокет закрыт.', function() {
                                                spendTime(1000);
                                                tester.webrtcWebsocket.finishDisconnecting();
                                            });
                                            it('Свитчбокс "IP-телефон" отмечен.', function() {
                                                tester.button('Текущее устройство').expectNotToBeChecked();
                                                tester.button('IP-телефон').expectToBeChecked();
                                            });
                                        });
                                        it('Установлены настройки по умолчанию.', function() {
                                            tester.button('Текущее устройство').expectToBeChecked();
                                            tester.button('IP-телефон').expectNotToBeChecked();
                                        });
                                    });
                                    it(
                                        'Браузер скрыт. Поступил входящий звонок. Отображено браузерное уведомление.',
                                    function() {
                                        setFocus(false);
                                        setBrowserHidden(true);

                                        tester.incomingCall().receive();
                                        tester.numaRequest().receiveResponse();
                                        tester.outCallEvent().receive();

                                        notificationTester.grantPermission().
                                            recentNotification().
                                            expectToHaveTitle('Входящий звонок').
                                            expectToHaveBody('Шалева Дора +7 (916) 123-45-67').
                                            expectToBeOpened();
                                    });
                                });
                                describe('Нажимаю на иконку с телефоном.', function() {
                                    beforeEach(function() {
                                        tester.button('Софтфон').click();
                                    });

                                    describe('Ввожу номер телефона.', function() {
                                        beforeEach(function() {
                                            tester.phoneField.fill('79161234567');
                                        });

                                        describe('SIP-регистрация завершена. Нажимаю на кнпоку вызова.', function() {
                                            let numaRequest,
                                                outboundCall;

                                            beforeEach(function() {
                                                registrationRequest.receiveResponse();

                                                tester.callStartingButton.click();
                                                
                                                tester.firstConnection.connectWebRTC();
                                                tester.allowMediaInput();

                                                outboundCall = tester.outboundCall().start().setRinging();
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
                                                        });

                                                        describe('Звонок принят.', function() {
                                                            beforeEach(function() {
                                                                outboundCall.setAccepted();
                                                            });

                                                            describe('Поступил входящий звонок.', function() {
                                                                beforeEach(function() {
                                                                    tester.incomingCall().thirdNumber().receive();
                                                                    tester.numaRequest().thirdNumber().
                                                                        receiveResponse();
                                                                    tester.outCallEvent().anotherPerson().receive();
                                                                });

                                                                it(
                                                                    'Принимаю звонок на второй линии. Отображаются ' +
                                                                    'данные о звонке.',
                                                                function() {
                                                                    tester.otherChannelCallNotification.
                                                                        callStartingButton.click();

                                                                    tester.secondConnection.connectWebRTC();
                                                                    tester.secondConnection.callTrackHandler();
                                                                    tester.allowMediaInput();
                                                                    tester.secondConnection.addCandidate();
                                                                    tester.requestAcceptIncomingCall();

                                                                    audioDecodingTester.accomplishAudioDecoding();

                                                                    tester.firstConnection.expectHoldMusicToPlay();
                                                                    tester.secondConnection.expectRemoteStreamToPlay();

                                                                    tester.softphone.expectTextContentToHaveSubstring(
                                                                        'Гигова Петранка ' +
                                                                        '+7 (916) 123-45-10 00:00:00'
                                                                    );
                                                                });
                                                                it(
                                                                    'Нажимаю на кнопку второй линии. Принимаю звонок ' +
                                                                    'на второй линии. Отображаются данные о звонке.',
                                                                function() {
                                                                    tester.secondLineButton.click();
                                                                    tester.callStartingButton.click();

                                                                    tester.secondConnection.connectWebRTC();
                                                                    tester.secondConnection.callTrackHandler();
                                                                    tester.allowMediaInput();
                                                                    tester.secondConnection.addCandidate();
                                                                    tester.requestAcceptIncomingCall();

                                                                    audioDecodingTester.accomplishAudioDecoding();

                                                                    tester.firstConnection.expectHoldMusicToPlay();
                                                                    tester.secondConnection.expectRemoteStreamToPlay();

                                                                    tester.softphone.expectTextContentToHaveSubstring(
                                                                        'Гигова Петранка ' +
                                                                        '+7 (916) 123-45-10 00:00:00'
                                                                    );
                                                                });
                                                                it(
                                                                    'Нажимаю на сообщение о звонке. Открыта вторая ' +
                                                                    'линия.',
                                                                function() {
                                                                    tester.otherChannelCallNotification.click();

                                                                    tester.softphone.expectTextContentToHaveSubstring(
                                                                        'Гигова Петранка ' +
                                                                        '+7 (916) 123-45-10'
                                                                    );
                                                                });
                                                                it('Отображено сообщение о звонке.', function() {
                                                                    tester.softphone.expectTextContentToHaveSubstring(
                                                                        'Гигова Петранка Входящий...'
                                                                    );

                                                                    tester.otherChannelCallNotification.
                                                                        callStartingButton.
                                                                        expectNotToHaveClass('cmg-button-disabled');
                                                                });
                                                            });
                                                            it('Отображено имя, номер и таймер.', function() {
                                                                tester.outgoingIcon.expectToBeVisible();

                                                                tester.softphone.expectTextContentToHaveSubstring(
                                                                    'Шалева Дора ' +
                                                                    '+7 (916) 123-45-67 00:00:00'
                                                                );
                                                                
                                                                tester.body.expectTextContentToHaveSubstring(
                                                                    'karadimova Не беспокоить'
                                                                );
                                                            });
                                                        });
                                                        describe('Поступил входящий звонок.', function() {
                                                            let incomingCall;

                                                            beforeEach(function() {
                                                                incomingCall = tester.incomingCall().thirdNumber().
                                                                    receive();
                                                                tester.numaRequest().thirdNumber().receiveResponse();
                                                                tester.outCallEvent().anotherPerson().receive();
                                                            });

                                                            it(
                                                                'Вызываемый занят. Отображено сообщение о звонке.',
                                                            function() {
                                                                outboundCall.receiveBusy();

                                                                tester.softphone.expectTextContentToHaveSubstring(
                                                                    'Гигова Петранка Входящий...'
                                                                );
                                                            });
                                                            it(
                                                                'Нажимаю на кнопку отклонения звонка на второй линии.',
                                                            function() {
                                                                tester.otherChannelCallNotification.
                                                                    stopCallButton.
                                                                    click();

                                                                incomingCall.expectTemporarilyUnavailableToBeSent();

                                                                tester.softphone.expectToHaveTextContent(
                                                                    'Шалева Дора ' +
                                                                    '+7 (916) 123-45-67 00:00:00'
                                                                );
                                                            });
                                                            it(
                                                                'Нажимаю на кнопку второй линии. Кнпока принятия ' +
                                                                'звонка заблокирована.',
                                                            function() {
                                                                tester.secondLineButton.click();
                                                                tester.callStartingButton.click();

                                                                tester.callStartingButton.
                                                                    expectToHaveAttribute('disabled');
                                                            });
                                                            it(
                                                                'Кнопка принятия звонка на второй линии заблокирована.',
                                                            function() {
                                                                tester.otherChannelCallNotification.
                                                                    callStartingButton.
                                                                    click();

                                                                tester.otherChannelCallNotification.
                                                                    callStartingButton.
                                                                    expectToHaveClass('cmg-button-disabled');

                                                                tester.firstConnection.expectRemoteStreamToPlay();

                                                                tester.softphone.expectTextContentToHaveSubstring(
                                                                    'Шалева Дора ' +
                                                                    '+7 (916) 123-45-67 00:00:00'
                                                                );
                                                            });
                                                        });
                                                        it(
                                                            'Нажимаю на кнопку остановки звонка. Ввожу тот же самый ' +
                                                            'номер. Отображается поле номера.',
                                                        function() {
                                                            tester.stopCallButton.click();
                                                            tester.requestCancelOutgoingCall();

                                                            tester.phoneField.fill('79161234567');

                                                            tester.phoneField.expectToHaveValue('79161234567');
                                                        });
                                                        it('Отображено имя, номер и таймер.', function() {
                                                            tester.softphone.expectToBeCollapsed();
                                                            tester.outgoingIcon.expectToBeVisible();
                                                            tester.softphone.expectTextContentToHaveSubstring(
                                                                'Шалева Дора +7 (916) 123-45-67 00:00:00'
                                                            );
                                                        });
                                                    });
                                                    it('Есть активные сделки. Отображены активные сделки.', function() {
                                                        outCallSessionEvent.activeLeads().receive();

                                                        tester.softphone.expectToBeExpanded();
                                                        tester.anchor('По звонку с 79154394340').expectHrefToHavePath(
                                                            'https://comagicwidgets.amocrm.ru/leads/detail/3003651'
                                                        );
                                                    });
                                                });
                                                it('Данные контакта не найдены.', function() {
                                                    tester.outCallSessionEvent().noName().receive();

                                                    tester.outgoingIcon.expectToBeVisible();
                                                    tester.softphone.expectTextContentToHaveSubstring(
                                                        '+7 (916) 123-45-67 Исходящий звонок 00:00:00'
                                                    );
                                                });
                                                it(
                                                    'Отображен номер, таймер, направление и сообщение о поиске ' +
                                                    'контакта.',
                                                function() {
                                                    tester.outgoingIcon.expectToBeVisible();
                                                    tester.softphone.expectTextContentToHaveSubstring(
                                                        '+7 (916) 123-45-67 Поиск контакта... 00:00:00'
                                                    );
                                                });
                                            });
                                            describe('Контакт является сотрудником.', function() {
                                                beforeEach(function() {
                                                    numaRequest.employeeNameIsFound().receiveResponse();
                                                });

                                                it(
                                                    'Нажимаю на кнопку остановки звонка. Ввожу тот же самый номер. ' +
                                                    'Отображается поле номера.',
                                                function() {
                                                    tester.stopCallButton.click();
                                                    tester.requestCancelOutgoingCall();

                                                    tester.phoneField.fill('79161234567');

                                                    tester.phoneField.expectToHaveValue('79161234567');
                                                });
                                                it('Отображено имя, номер и таймер.', function() {
                                                    tester.outgoingIcon.expectToBeVisible();
                                                    tester.softphone.expectToBeCollapsed();

                                                    tester.softphone.expectTextContentToHaveSubstring(
                                                        'Шалева Дора +7 (916) 123-45-67 00:00:00'
                                                    );
                                                });
                                            });
                                        });
                                        it('Кнопка вызова заблокирована.', function() {
                                            tester.callStartingButton.expectToHaveAttribute('disabled');
                                        });
                                    });
                                    describe('SIP-регистрация завершена.', function() {
                                        beforeEach(function() {
                                            registrationRequest.receiveResponse();
                                        });

                                        describe('Открываю историю звонков.', function() {
                                            let callsRequest;
                                            
                                            beforeEach(function() {
                                                tester.callsHistoryButton.click();
                                                callsRequest = tester.callsRequest();
                                            });

                                            describe('Звонок не является трансфером.', function() {
                                                beforeEach(function() {
                                                    callsRequest.receiveResponse();
                                                });

                                                describe('Соединение разрывается.', function() {
                                                    beforeEach(function() {
                                                        tester.disconnectEventsWebSocket();
                                                    });

                                                    describe('Нажимаю на кнопку закрытия сообщения.', function() {
                                                        beforeEach(function() {
                                                            tester.closeButton.click();
                                                        });

                                                        it(
                                                            'Соединение востановлено и снова разорвано. Отображено ' +
                                                            'сообщение о разрыве сети.',
                                                        function() {
                                                            spendTime(1001);
                                                            Promise.runAll(false, true);

                                                            tester.connectEventsWebSocket(1);
                                                            Promise.runAll(false, true);
                                                            tester.authenticatedUserRequest().receiveResponse();

                                                            tester.disconnectEventsWebSocket(1);

                                                            tester.softphone.
                                                                expectTextContentToHaveSubstring('Разрыв сети');
                                                        });
                                                        it('Сообщение скрыто.', function() {
                                                            tester.softphone.
                                                                expectTextContentNotToHaveSubstring('Разрыв сети');
                                                        });
                                                    });
                                                    it(
                                                        'Кнопка звонка заблокирована. Отображено сообщение о разрыве ' +
                                                        'сети.',
                                                    function() {
                                                        tester.callsHistoryRow.withText('Гяурова Марийка').callIcon.
                                                            expectToHaveAttribute('disabled');

                                                        tester.softphone.expectTextContentToHaveSubstring(
                                                            'Разрыв сети'
                                                        );
                                                    });
                                                });
                                                describe('Прокручиваю историю.', function() {
                                                    beforeEach(function() {
                                                        tester.callsGridScrolling().toTheEnd().scroll();
                                                        tester.callsGridScrolling().toTheEnd().scroll();
                                                        tester.callsGridScrolling().toTheEnd().scroll();
                                                        tester.callsGridScrolling().toTheEnd().scroll();
                                                        tester.callsGridScrolling().toTheEnd().scroll();
                                                        tester.callsGridScrolling().toTheEnd().scroll();
                                                        tester.callsGridScrolling().toTheEnd().scroll();
                                                        tester.callsGridScrolling().toTheEnd().scroll();
                                                    });

                                                    it(
                                                        'Прокручиваю историю до конца. Запрошена вторая страница ' +
                                                        'истории.',
                                                    function() {
                                                        tester.callsGridScrolling().toTheEnd().scroll();
                                                        tester.callsRequest().secondPage().expectToBeSent();
                                                    });
                                                    it('Вторая страница истории еще не запрошена.', function() {
                                                        ajax.expectNoRequestsToBeSent();
                                                    });
                                                });
                                                it('Нажимаю на иконку звонка.', function() {
                                                    tester.callsHistoryRow.withText('Гяурова Марийка').callIcon.click();

                                                    tester.firstConnection.connectWebRTC();
                                                    tester.firstConnection.callTrackHandler();
                                                    tester.allowMediaInput();

                                                    tester.numaRequest().anotherNumber().receiveResponse();
                                                    tester.outboundCall().setNumberFromCallsGrid().start().setRinging();

                                                    tester.callStartingButton.expectToBeVisible();
                                                });
                                                it('Нажимаю на имя. Открыта страница контакта.', function() {
                                                    tester.callsHistoryRow.withText('Гяурова Марийка').name.click();

                                                    windowOpener.expectToHavePath(
                                                        'https://comagicwidgets.amocrm.ru/contacts/detail/218401'
                                                    );
                                                });
                                                it(
                                                    'Нажимаю на кнопку сворачивания софтфона. Отображено поле для ' +
                                                    'ввода телефона.',
                                                function() {
                                                    tester.collapsednessToggleButton.click();
                                                    tester.phoneField.expectToBeVisible();
                                                });
                                                it(
                                                    'Нажимаю на кнопку первой линии. Отображено поле для ввода номера.',
                                                function() {
                                                    tester.firstLineButton.click();
                                                    tester.phoneField.expectToBeVisible();
                                                });
                                                it('Отображены иконки направлений.', function() {
                                                    tester.callsHistoryRow.withText('Гяурова Марийка').callIcon.
                                                        expectNotToHaveAttribute('disabled');

                                                    tester.callsHistoryRow.withText('Гяурова Марийка').directory.
                                                        expectToHaveClass('cmg-direction-incoming');

                                                    tester.callsHistoryRow.withText('Манова Тома').directory.
                                                        expectToHaveClass('cmg-direction-outgoing');

                                                    tester.softphone.expectToBeExpanded();
                                                });
                                            });
                                            it('Звонок является трансфером. Отображена иконка трансфера.', function() {
                                                callsRequest.transfer().receiveResponse();

                                                tester.callsHistoryRow.withText('Гяурова Марийка').directory.
                                                    expectToHaveClass('cmg-direction-transfer');
                                            });
                                            it(
                                                'Не было ни одного звонка. Отображено сообщение об отсутствии звонков.',
                                            function() {
                                                callsRequest.noCalls().receiveResponse();

                                                tester.softphone.
                                                    expectToHaveTextContent('Совершите звонок для отображения истории');
                                            });
                                        });
                                        describe('Нажимаю на кнопку "Выход". Вхожу в лк заново.', function() {
                                            beforeEach(function() {
                                                tester.userName.putMouseOver();
                                                tester.logoutButton.click();

                                                tester.userLogoutRequest().receiveResponse();

                                                Promise.runAll(false, true);
                                                spendTime(0);
                                                Promise.runAll(false, true);
                                                spendTime(0);
                                                Promise.runAll(false, true);
                                                spendTime(0);

                                                tester.authLogoutRequest().receiveResponse();
                                                tester.eventsWebSocket.finishDisconnecting();
                                                tester.registrationRequest().expired().receiveResponse();

                                                spendTime(2000);
                                                tester.webrtcWebsocket.finishDisconnecting();

                                                tester.input.withFieldLabel('Логин').fill('botusharova');
                                                tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                                                tester.button('Войти').click();

                                                tester.loginRequest().anotherAuthorizationToken().receiveResponse();
                                                accountRequest = tester.accountRequest().anotherAuthorizationToken().
                                                    expectToBeSent();
                                            });

                                            it('Софтфон недоступен.', function() {
                                                accountRequest.softphoneUnavailable().receiveResponse();

                                                tester.reportGroupsRequest().anotherAuthorizationToken().
                                                    receiveResponse();
                                                tester.reportsListRequest().receiveResponse();
                                                tester.reportTypesRequest().receiveResponse();

                                                tester.softphone.expectNotToExist();
                                                tester.button('Софтфон').expectNotToExist();
                                            });
                                            it('Софтфон доступен. Отображен софтфон.', function() {
                                                accountRequest.receiveResponse();
                                                tester.accountRequest().anotherAuthorizationToken().receiveResponse();

                                                tester.reportGroupsRequest().anotherAuthorizationToken().
                                                    receiveResponse();
                                                tester.reportsListRequest().receiveResponse();
                                                tester.reportTypesRequest().receiveResponse();

                                                tester.authCheckRequest().anotherAuthorizationToken().receiveResponse();
                                                tester.configRequest().softphone().receiveResponse();

                                                tester.statusesRequest().createExpectation().
                                                    anotherAuthorizationToken().checkCompliance().receiveResponse();

                                                tester.settingsRequest().anotherAuthorizationToken().receiveResponse();
                                                tester.talkOptionsRequest().receiveResponse();
                                                tester.permissionsRequest().receiveResponse();

                                                tester.connectEventsWebSocket(1);
                                                tester.connectSIPWebSocket(1);

                                                tester.authenticatedUserRequest().receiveResponse();
                                                tester.registrationRequest().receiveResponse();
                                                tester.allowMediaInput();

                                                tester.phoneField.fill('79161234567');

                                                tester.callStartingButton.expectNotToHaveAttribute('disabled');
                                                tester.button('Софтфон').expectToBeVisible();
                                            });
                                        });
                                        describe('Нажимаю на кнопку открытия диалпада.', function() {
                                            beforeEach(function() {
                                                tester.dialpadVisibilityButton.click();
                                            });

                                            describe('Поступил входящий звонок.', function() {
                                                beforeEach(function() {
                                                    tester.incomingCall().receive();
                                                    tester.numaRequest().receiveResponse();
                                                });

                                                describe('Поступили данные о звонке.', function() {
                                                    beforeEach(function() {
                                                        tester.outCallEvent().receive();
                                                    });

                                                    describe('Принимаю звонок.', function() {
                                                        beforeEach(function() {
                                                            tester.callButton.click();

                                                            tester.firstConnection.connectWebRTC();
                                                            tester.firstConnection.callTrackHandler();

                                                            tester.allowMediaInput();
                                                            tester.firstConnection.addCandidate();
                                                            tester.requestAcceptIncomingCall();
                                                        });

                                                        describe('Нажимаю на кнопку сворачивания.', function() {
                                                            beforeEach(function() {
                                                                tester.collapsednessToggleButton.click();
                                                            });
                                                            
                                                            it(
                                                                'Нажимаю на кнопку разворачивания. Софтфон развернут.',
                                                            function() {
                                                                tester.collapsednessToggleButton.click();

                                                                tester.softphone.
                                                                    expectTextContentToHaveSubstring('Путь лида');
                                                            });
                                                            it('Софтфон свернут.', function() {
                                                                tester.softphone.expectToBeCollapsed();
                                                            });
                                                        });
                                                        describe(
                                                            'Открываю историю звонков. Нажимаю на кнопку ' +
                                                            'сворачивания софтфона.',
                                                        function() {
                                                            beforeEach(function() {
                                                                tester.callsHistoryButton.click();
                                                                tester.callsRequest().receiveResponse();

                                                                tester.collapsednessToggleButton.click();
                                                            });

                                                            it(
                                                                'Открываю историю звонков. Нажимаю на кнопку ' +
                                                                'сворачивания софтфона. Софтфон свернут.',
                                                            function() {
                                                                tester.callsHistoryButton.click();
                                                                tester.callsRequest().receiveResponse();

                                                                tester.collapsednessToggleButton.click();
                                                                tester.softphone.expectToBeCollapsed();
                                                            });
                                                            it('Софтфон свернут.', function() {
                                                                tester.softphone.expectToBeCollapsed();
                                                            });
                                                        });
                                                        it('Кнопка диалпада нажата.', function() {
                                                            tester.dialpadButton(1).expectToBeVisible();;

                                                            tester.dialpadVisibilityButton.
                                                                expectNotToHaveClass('cmg-button-disabled');
                                                            tester.dialpadVisibilityButton.
                                                                expectToHaveClass('cmg-button-pressed');
                                                        });
                                                    });
                                                    it(
                                                        'Нажимаю на кнопку сворачивания софтфона. Софтфон свернут.',
                                                    function() {
                                                        tester.collapsednessToggleButton.click();
                                                        tester.softphone.expectToBeCollapsed();
                                                    });
                                                    it('Отображен путь лида.', function() {
                                                        tester.softphone.expectTextContentToHaveSubstring('Путь лида');
                                                    });
                                                });
                                                it('Принимаю звонок. Диалпад разблокирован.', function() {
                                                    tester.callButton.click();

                                                    tester.firstConnection.connectWebRTC();
                                                    tester.firstConnection.callTrackHandler();

                                                    tester.allowMediaInput();
                                                    tester.firstConnection.addCandidate();
                                                    tester.requestAcceptIncomingCall();

                                                    tester.dialpadButton(1).expectNotToHaveAttribute('disabled');;
                                                });
                                                it('Диалпад заблокирован.', function() {
                                                    tester.dialpadButton(1).expectToHaveAttribute('disabled');;
                                                });
                                            });
                                            describe('Нажимаю на кнопку таблицы сотрудников.', function() {
                                                beforeEach(function() {
                                                    tester.addressBookButton.click();

                                                    tester.usersRequest().receiveResponse();
                                                    tester.usersInGroupsRequest().receiveResponse();
                                                    tester.groupsRequest().receiveResponse();
                                                });

                                                it('Нажата кнопка таблицы сотрудников.', function() {
                                                    tester.dialpadVisibilityButton.
                                                        expectNotToHaveClass('cmg-button-pressed');
                                                    tester.addressBookButton.expectToHaveClass('cmg-button-pressed');
                                                });
                                                it('Нажимаю на кнопку первой линии. Софтфон развернут.', function() {
                                                    tester.firstLineButton.click();
                                                    tester.softphone.expectToBeExpanded();
                                                });
                                                it(
                                                    'Нажимаю на кнопку сворачивания софтфона. Софтфон свернут.',
                                                function() {
                                                    tester.collapsednessToggleButton.click();
                                                    tester.softphone.expectToBeCollapsed();
                                                });
                                                it('Нажимаю на кнопку диалпада. Отображен диалпад.', function() {
                                                    tester.dialpadVisibilityButton.click();
                                                    tester.dialpadButton(1).expectToBeVisible();;
                                                });
                                            });
                                            describe('Совершаю исходящий звонок.', function() {
                                                let outboundCall,
                                                    outCallSessionEvent;

                                                beforeEach(function() {
                                                    tester.phoneField.fill('79161234567');
                                                    tester.callButton.click();

                                                    tester.firstConnection.connectWebRTC();
                                                    tester.allowMediaInput();

                                                    outboundCall = tester.outboundCall().start().setRinging();
                                                    tester.firstConnection.callTrackHandler();

                                                    tester.numaRequest().receiveResponse();
                                                    outCallSessionEvent = tester.outCallSessionEvent();
                                                });

                                                describe('Есть открытые сделки.', function() {
                                                    beforeEach(function() {
                                                        outCallSessionEvent.activeLeads().receive();
                                                    });

                                                    describe('Нажимаю на кнопку сворачивания.', function() {
                                                        beforeEach(function() {
                                                            tester.collapsednessToggleButton.click();
                                                        });

                                                        it(
                                                            'Нажимаю на кнопку разворачивания. Отображены открытые ' +
                                                            'сделки.',
                                                        function() {
                                                            tester.collapsednessToggleButton.click();

                                                            tester.anchor('По звонку с 79154394340').
                                                                expectHrefToHavePath(
                                                                    'https://comagicwidgets.amocrm.ru/leads/detail/' +
                                                                    '3003651'
                                                                );
                                                        });
                                                        it('Софтфон свернут.', function() {
                                                            tester.softphone.expectToBeCollapsed();
                                                        });
                                                    });
                                                    it('Отображены открытые сделки.', function() {
                                                        tester.softphone.expectToBeExpanded();
                                                        tester.anchor('По звонку с 79154394340').expectHrefToHavePath(
                                                            'https://comagicwidgets.amocrm.ru/leads/detail/3003651'
                                                        );

                                                        tester.dialpadVisibilityButton.
                                                            expectToHaveClass('cmg-button-disabled');
                                                        tester.dialpadVisibilityButton.
                                                            expectNotToHaveClass('cmg-button-pressed');
                                                    });
                                                });
                                                it('Нет открытых сделки. Отображен диалпад.', function() {
                                                    outCallSessionEvent.receive();
                                                    tester.dialpadButton(1).expectToBeVisible();;

                                                    tester.dialpadVisibilityButton.
                                                        expectNotToHaveClass('cmg-button-disabled');
                                                    tester.dialpadVisibilityButton.
                                                        expectToHaveClass('cmg-button-pressed');
                                                });
                                            });
                                            it('Диалпад открыт.', function() {
                                                tester.dialpadVisibilityButton.
                                                    expectNotToHaveClass('cmg-button-disabled');
                                                tester.dialpadVisibilityButton.expectToHaveClass('cmg-button-pressed');
                                                tester.addressBookButton.expectNotToHaveClass('cmg-button-pressed');
                                                tester.digitRemovingButton.expectToBeVisible();
                                                tester.softphone.expectToBeExpanded();

                                                if (localStorage.getItem('isSoftphoneHigh') != 'true') {
                                                    throw new Error(
                                                        'В локальном хранилище должна быть сохранена развернутость ' +
                                                        'софтфона.'
                                                    );
                                                }
                                            });
                                        });
                                        describe('Нажимаю на кнопку аккаунта.', function() {
                                            beforeEach(function() {
                                                tester.userName.putMouseOver();
                                            });

                                            describe('Выбираю другой статус.', function() {
                                                let userStateUpdateRequest;

                                                beforeEach(function() {
                                                    tester.statusesList.item('Нет на месте').click();

                                                    userStateUpdateRequest = tester.userStateUpdateRequest().
                                                        expectToBeSent();
                                                });

                                                it(
                                                    'Токен авторизации истек. Отображена форма авторизации. ' +
                                                    'Авторизуюсь заново.',
                                                function() {
                                                    userStateUpdateRequest.accessTokenExpired().receiveResponse();
                                                    tester.refreshRequest().refreshTokenExpired().receiveResponse();
                                                    tester.userLogoutRequest().receiveResponse();

                                                    tester.authLogoutRequest().receiveResponse();
                                                    tester.eventsWebSocket.finishDisconnecting();
                                                    tester.registrationRequest().expired().receiveResponse();

                                                    spendTime(2000);
                                                    tester.webrtcWebsocket.finishDisconnecting();

                                                    tester.input.withFieldLabel('Логин').fill('botusharova');
                                                    tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                                                    tester.button('Войти').click();

                                                    tester.loginRequest().receiveResponse();
                                                    tester.accountRequest().receiveResponse();

                                                    const requests = ajax.inAnyOrder();

                                                    const reportGroupsRequest = tester.reportGroupsRequest().
                                                        expectToBeSent(requests);
                                                    const reportsListRequest = tester.reportsListRequest().
                                                        expectToBeSent(requests);
                                                    const reportTypesRequest = tester.reportTypesRequest().
                                                        expectToBeSent(requests);
                                                    const secondAccountRequest = tester.accountRequest().
                                                        expectToBeSent(requests);

                                                    requests.expectToBeSent();

                                                    reportsListRequest.receiveResponse();
                                                    reportTypesRequest.receiveResponse();
                                                    secondAccountRequest.receiveResponse();
                                                    reportGroupsRequest.receiveResponse();

                                                    tester.configRequest().softphone().receiveResponse();

                                                    tester.authCheckRequest().receiveResponse();
                                                    tester.statusesRequest().receiveResponse();
                                                    tester.settingsRequest().receiveResponse();
                                                    tester.talkOptionsRequest().receiveResponse();
                                                    tester.permissionsRequest().receiveResponse();

                                                    tester.connectEventsWebSocket(1);
                                                    tester.connectSIPWebSocket(1);

                                                    tester.authenticatedUserRequest().receiveResponse();
                                                    tester.registrationRequest().receiveResponse();

                                                    tester.allowMediaInput();

                                                    tester.phoneField.fill('79161234567');
                                                    tester.callButton.expectNotToHaveAttribute('disabled');
                                                });
                                                it('Другой статус выбран.', function() {
                                                    userStateUpdateRequest.receiveResponse();
                                                    tester.notificationOfUserStateChanging().anotherStatus().receive();

                                                    tester.statusesList.item('Не беспокоить').expectNotToBeSelected();
                                                    tester.statusesList.item('Нет на месте').expectToBeSelected();

                                                    tester.body.expectTextContentToHaveSubstring(
                                                        'karadimova Нет на месте'
                                                    );
                                                });
                                            });
                                            it('Отображен список статусов.', function() {
                                                tester.statusesList.item('Не беспокоить').expectToBeSelected();
                                                tester.statusesList.item('Нет на месте').expectNotToBeSelected();

                                                tester.statusesList.expectTextContentToHaveSubstring(
                                                    'Ганева Стефка ' +
                                                    'Внутренний номер: 9119 ' +

                                                    'Статусы ' +

                                                    'Доступен ' +
                                                    'Перерыв ' +
                                                    'Не беспокоить ' +
                                                    'Нет на месте ' +
                                                    'Нет на работе'
                                                );
                                            });
                                        });
                                        describe('Нажимаю на кнопку таблицы сотрудников.', function() {
                                            beforeEach(function() {
                                                tester.addressBookButton.click();

                                                tester.usersRequest().receiveResponse();
                                                tester.usersInGroupsRequest().receiveResponse();
                                                tester.groupsRequest().receiveResponse();
                                            });

                                            it('Соединение разрывается.', function() {
                                                tester.disconnectEventsWebSocket();
                                                tester.employeeRow('Шалева Дора').expectToBeDisaled();

                                                tester.softphone.expectTextContentToHaveSubstring('Разрыв сети');
                                            });
                                            it('Нажимаю на кнопку первой линии. Софтфон свернут.', function() {
                                                tester.firstLineButton.click();
                                                tester.softphone.expectToBeCollapsed();
                                            });
                                            it('Нажимаю на кнопку диалпада. Отображен диалпад.', function() {
                                                tester.dialpadVisibilityButton.click();
                                                tester.dialpadButton(1).expectToBeVisible();;
                                            });
                                            it('Отображена таблица сотрудников.', function() {
                                                tester.employeeRow('Божилова Йовка').callIcon.expectToBeVisible();
                                                tester.softphone.expectToBeExpanded();
                                            });
                                        });
                                        describe('Нажимаю на кнопку разворачивания софтфона.', function() {
                                            beforeEach(function() {
                                                tester.collapsednessToggleButton.click();
                                            });

                                            it(
                                                'Нажимаю на кнопку сворачивания софтфона. Кнопка удаления цифры ' +
                                                'скрыта.',
                                            function() {
                                                tester.collapsednessToggleButton.click();
                                                tester.digitRemovingButton.expectNotToExist();
                                            });
                                            it('Кнопка удаления цифры видима.', function() {
                                                tester.digitRemovingButton.expectToBeVisible();
                                            });
                                        });
                                        it(
                                            'Софтфон открыт в другом окне. Отображено сообщение о том, что софтфон ' +
                                            'открыт в другом окне.',
                                        function() {
                                            tester.eventsWebSocket.disconnect(4429);
                                            tester.authLogoutRequest().receiveResponse();
                                            tester.registrationRequest().expired().receiveResponse();
                                            
                                            spendTime(2000);
                                            tester.webrtcWebsocket.finishDisconnecting();

                                            tester.softphone.
                                                expectTextContentToHaveSubstring('Софтфон открыт в другом окне');
                                        });
                                        it(
                                            'Прошло некоторое время. Сервер событий не отвечает. Отображено ' +
                                            'сообщение об установке соединения.',
                                        function() {
                                            spendTime(5000);
                                            tester.expectPingToBeSent();
                                            spendTime(2000);

                                            tester.softphone.expectToHaveTextContent(
                                                'Устанавливается соединение...'
                                            );
                                        });
                                        it(
                                            'Соединение разрывается. Отображено сообщение об установке соединения.',
                                        function() {
                                            tester.disconnectEventsWebSocket();
                                            tester.softphone.expectToHaveTextContent('Устанавливается соединение...');
                                        });
                                        it(
                                            'Прошло некоторое время. Сервер событий не отвечает. Отображено ' +
                                            'сообщение об установке соединения.',
                                        function() {
                                            spendTime(5000);
                                            tester.expectPingToBeSent();
                                            spendTime(2000);

                                            tester.firstLineButton.expectToHaveClass('cmg-bottom-button-selected');
                                            tester.secondLineButton.expectNotToHaveClass('cmg-bottom-button-selected');

                                            tester.softphone.expectToHaveTextContent(
                                                'Устанавливается соединение...'
                                            );
                                        });
                                        it(
                                            'Перехожу на вторую линию. Выхожу и вхожу в софтфон заново. Активна ' +
                                            'первая линия.',
                                        function() {
                                            tester.secondLineButton.click();

                                            tester.userName.putMouseOver();
                                            tester.logoutButton.click();

                                            tester.userLogoutRequest().receiveResponse();

                                            Promise.runAll(false, true);
                                            spendTime(0);
                                            Promise.runAll(false, true);
                                            spendTime(0);
                                            Promise.runAll(false, true);
                                            spendTime(0);

                                            tester.authLogoutRequest().receiveResponse();
                                            tester.eventsWebSocket.finishDisconnecting();
                                            tester.registrationRequest().expired().receiveResponse();

                                            spendTime(2000);
                                            tester.webrtcWebsocket.finishDisconnecting();

                                            tester.input.withFieldLabel('Логин').fill('botusharova');
                                            tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                                            tester.button('Войти').click();

                                            tester.loginRequest().anotherAuthorizationToken().receiveResponse();
                                            accountRequest = tester.accountRequest().anotherAuthorizationToken().
                                                expectToBeSent();
                                            accountRequest.receiveResponse();
                                            tester.accountRequest().anotherAuthorizationToken().receiveResponse();

                                            tester.reportGroupsRequest().anotherAuthorizationToken().
                                                receiveResponse();
                                            tester.reportsListRequest().receiveResponse();
                                            tester.reportTypesRequest().receiveResponse();

                                            tester.authCheckRequest().anotherAuthorizationToken().receiveResponse();
                                            tester.configRequest().softphone().receiveResponse();

                                            tester.statusesRequest().createExpectation().
                                                anotherAuthorizationToken().checkCompliance().receiveResponse();

                                            tester.settingsRequest().anotherAuthorizationToken().receiveResponse();
                                            tester.talkOptionsRequest().receiveResponse();
                                            tester.permissionsRequest().receiveResponse();

                                            tester.connectEventsWebSocket(1);
                                            tester.connectSIPWebSocket(1);

                                            tester.authenticatedUserRequest().receiveResponse();
                                            tester.registrationRequest().receiveResponse();
                                            tester.allowMediaInput();

                                            tester.firstLineButton.expectToHaveClass('cmg-bottom-button-selected');
                                            tester.secondLineButton.expectNotToHaveClass('cmg-bottom-button-selected');
                                        });
                                        it(
                                            'Нажимаю на кнопку перехвата. Совершается исходящий звонок на номер 88.',
                                        function() {
                                            tester.interceptButton.click();

                                            tester.firstConnection.connectWebRTC();
                                            tester.allowMediaInput();

                                            tester.outboundCall().intercept().start().setRinging();
                                            tester.firstConnection.callTrackHandler();

                                            tester.numaRequest().intercept().receiveResponse();
                                        });
                                        it('Нажимаю на кнпоку вызова. Ничего не проиcходит.', function() {
                                            tester.callStartingButton.click();
                                        });
                                        it('Отображен софтфон.', function() {
                                            if (localStorage.getItem('isSoftphoneHigh') != 'false') {
                                                throw new Error(
                                                    'В локальном хранилище должна быть сохранена свернутость софтфона.'
                                                );
                                            }

                                            tester.select.expectNotToExist();

                                            tester.softphone.expectTextContentNotToHaveSubstring(
                                                'Микрофон не обнаружен'
                                            );

                                            tester.digitRemovingButton.expectNotToExist();
                                            tester.body.expectTextContentToHaveSubstring('karadimova Не беспокоить');
                                            tester.softphone.expectToBeCollapsed();
                                            tester.settingsButton.expectNotToExist();
                                            tester.callStartingButton.expectNotToHaveAttribute('disabled');
                                        });
                                    });
                                    it('Нажимаю на кнопку скрытия софтфона. Сотфтфон скрыт.', function() {
                                        tester.hideButton.click();
                                        tester.callStartingButton.expectNotToExist();
                                    });
                                    it('Нажимаю на иконку с телефоном. Сотфтфон скрыт.', function() {
                                        tester.button('Софтфон').click();
                                        tester.callStartingButton.expectNotToExist();
                                    });
                                });
                                it('Отображен пункт меню. Софтфон скрыт. Отображается статус сотрудника.', function() {
                                    tester.callStartingButton.expectNotToExist();
                                    tester.body.expectTextContentToHaveSubstring('Дашборды');
                                });
                            });
                            describe('SIP-регистрация завершена. Срок действия токена авторизации истек.', function() {
                                let refreshRequest;

                                beforeEach(function() {
                                    registrationRequest.receiveResponse();

                                    reportGroupsRequest.accessTokenExpired().receiveResponse();
                                    refreshRequest = tester.refreshRequest().expectToBeSent();

                                    spendTime(0);
                                });

                                it(
                                    'Токен авторизации обновлен. Получены данные для отчета. Отображен пункт меню.',
                                function() {
                                    refreshRequest.receiveResponse();
                                    tester.reportGroupsRequest().anotherAuthorizationToken().receiveResponse();

                                    tester.body.expectTextContentToHaveSubstring('Дашборды');
                                });
                                it('Пункт меню не отображен.', function() {
                                    tester.body.expectTextContentNotToHaveSubstring('Дашборды');

                                    refreshRequest.receiveResponse();
                                    tester.reportGroupsRequest().anotherAuthorizationToken().expectToBeSent();
                                });
                            });
                        });
                        it(
                            'SIP-линия не зарегистрирована. Нажимаю на иконку с телефоном. Отображено сообщение о ' +
                            'том, что SIP-линия не зарегистрирована.',
                        function() {
                            tester.button('Софтфон').click();
                            tester.phoneField.fill('79161234567');

                            authenticatedUserRequest.sipIsOffline().receiveResponse();
                            registrationRequest.receiveResponse();
                            reportGroupsRequest.receiveResponse();

                            tester.softphone.expectToBeCollapsed();
                            tester.callStartingButton.expectToHaveAttribute('disabled');

                            tester.softphone.expectTextContentToHaveSubstring(
                                'Sip-линия не зарегистрирована'
                            );
                        });
                    });
                    describe('Доступ к микрофону отклонен. Нажимаю на иконку телефона.', function() {
                        beforeEach(function() {
                            tester.disallowMediaInput();

                            authenticatedUserRequest.receiveResponse();
                            reportGroupsRequest.receiveResponse();
                            registrationRequest.receiveResponse();

                            tester.button('Софтфон').click();
                        });

                        it('Нажимаю на кнопку закрытия сообщения. Сообщение скрыто.', function() {
                            tester.closeButton.click();
                            tester.softphone.expectTextContentNotToHaveSubstring('Микрофон не обнаружен');
                        });
                        it('Отображено сообщение об отсутствии доступа к микрофону.', function() {
                            tester.softphone.expectTextContentToHaveSubstring('Микрофон не обнаружен');
                        });
                    });
                });
                describe('Номера должны быть скрыты.', function() {
                    beforeEach(function() {
                        reportGroupsRequest.receiveResponse();
                        settingsRequest.shouldHideNumbers().receiveResponse();
                        notificationTester.grantPermission();

                        tester.connectEventsWebSocket();
                        tester.connectSIPWebSocket();

                        tester.authenticatedUserRequest().receiveResponse();
                        tester.registrationRequest().receiveResponse();
                        tester.allowMediaInput();
                    });

                    it('Открываю историю звонков.', function() {
                        tester.button('Софтфон').click();

                        tester.callsHistoryButton.click();
                        tester.callsRequest().noContactName().receiveResponse();

                        tester.softphone.expectTextContentToHaveSubstring(
                            'Сегодня ' +
                            'Неизвестный номер 08:03 ' +

                            'Вчера ' +
                            'Манова Тома 18:08'
                        );
                    });
                    it('Поступает входящий звонок. Поступает входящий звонок.', function() {
                        tester.incomingCall().receive();
                        tester.numaRequest().receiveResponse();

                        tester.softphone.expectTextContentToHaveSubstring('Неизвестный номер Поиск контакта...');
                    });
                });
                it(
                    'Сначала запрос от лк, а потом и запрос от софтфона завершился ошибкой истечения токена ' +
                    'авторизации. Отправлен только один запрос обновления токена.',
                function() {
                    reportGroupsRequest.accessTokenExpired().receiveResponse();

                    tester.refreshRequest().receiveResponse();

                    settingsRequest.accessTokenExpired().receiveResponse();
                    tester.reportGroupsRequest().anotherAuthorizationToken().expectToBeSent();

                    tester.refreshRequest().anotherAuthorizationToken().receiveResponse();
                    tester.settingsRequest().thirdAuthorizationToken().expectToBeSent();
                });
                it(
                    'Сначала запрос от софтфона, а потом и запрос от лк завершился ошибкой истечения токена ' +
                    'авторизации. Отправлен только один запрос обновления токена.',
                function() {
                    settingsRequest.accessTokenExpired().receiveResponse();
                    tester.refreshRequest().receiveResponse();

                    reportGroupsRequest.accessTokenExpired().receiveResponse();
                    tester.settingsRequest().anotherAuthorizationToken().expectToBeSent();

                    tester.refreshRequest().anotherAuthorizationToken().receiveResponse();
                    tester.reportGroupsRequest().thirdAuthorizationToken().expectToBeSent();
                });
                it(
                    'Срок действия токена авторизации истек. Токен авторизации обновлен. Софтфон подключен.',
                function() {
                    settingsRequest.accessTokenExpired().receiveResponse();
                    tester.refreshRequest().receiveResponse();
                    tester.settingsRequest().anotherAuthorizationToken().receiveResponse();
                    notificationTester.grantPermission();

                    tester.connectEventsWebSocket();
                    tester.connectSIPWebSocket();

                    tester.allowMediaInput();

                    tester.authenticatedUserRequest().anotherAuthorizationToken().receiveResponse();
                    tester.registrationRequest().receiveResponse();
                });
                it('Токен невалиден. Отображена форма аутентификации.', function() {
                    settingsRequest.accessTokenInvalid().receiveResponse();
                    notificationTester.grantPermission();
                    tester.userLogoutRequest().receiveResponse();
                    tester.authLogoutRequest().receiveResponse();

                    tester.input.withFieldLabel('Логин').expectToBeVisible();
                });
            });
            describe('Нажимаю на иконку с телефоном.', function() {
                beforeEach(function() {
                    reportGroupsRequest.receiveResponse();
                    tester.button('Софтфон').click();
                });

                describe('Пользователь имеет права на список номеров.', function() {
                    beforeEach(function() {
                        permissionsRequest = permissionsRequest.allowNumberCapacitySelect();
                        settingsRequest = settingsRequest.allowNumberCapacitySelect();
                    });

                    describe('У выбранного номера нет комментария.', function() {
                        beforeEach(function() {
                            settingsRequest.receiveResponse();
                            notificationTester.grantPermission();
                        });

                        describe('Пользователь имеет права на выбор номера.', function() {
                            let authenticatedUserRequest,
                                numberCapacityRequest;

                            beforeEach(function() {
                                permissionsRequest.allowNumberCapacityUpdate().receiveResponse();

                                tester.connectEventsWebSocket();
                                tester.connectSIPWebSocket();

                                tester.allowMediaInput();
                                numberCapacityRequest = tester.numberCapacityRequest().expectToBeSent();
                                tester.registrationRequest().receiveResponse();
                                authenticatedUserRequest = tester.authenticatedUserRequest().expectToBeSent();
                            });

                            describe('У пользователя есть несколько номеров.', function() {
                                beforeEach(function() {
                                    numberCapacityRequest.receiveResponse();
                                });

                                describe('SIP-линия зарегистрирована.', function() {
                                    beforeEach(function() {
                                        authenticatedUserRequest.receiveResponse();
                                    });

                                    describe('Раскрываю список номеров.', function() {
                                        beforeEach(function() {
                                            tester.select.arrow.click();
                                        });

                                        describe(
                                            'Выбираю номер. Отправлен запрос смены номера.',
                                        function() {
                                            beforeEach(function() {
                                                tester.select.option('+7 (916) 123-89-29 Некий номер').click();
                                                tester.saveNumberCapacityRequest().receiveResponse();
                                            });

                                            it(
                                                'Нажимаю на кнопку открытия диалпада. Отображен выбранный номер с ' +
                                                'комментарием.',
                                            function() {
                                                tester.dialpadVisibilityButton.click();

                                                tester.softphone.expectTextContentToHaveSubstring(
                                                    '+7 (916) 123-89-29 ' +
                                                    'Некий номер ' +
                                                    'Некий номер'
                                                );
                                            });
                                            it('Отображен выбранный номер.', function() {
                                                tester.softphone.expectToHaveTextContent(
                                                    '+7 (916) 123-89-29 ' +
                                                    'Некий номер'
                                                );
                                            });
                                        });
                                        describe('Ввожу номер в поле поиска.', function() {
                                            beforeEach(function() {
                                                tester.input.withPlaceholder('Найти').fill('62594');
                                            });

                                            it(
                                                'Стираю введенное в поле поиска значение. Отображены все номера.',
                                            function() {
                                                tester.input.withPlaceholder('Найти').clear();

                                                tester.select.popup.expectTextContentToHaveSubstring(
                                                    '+7 (916) 123-89-27'
                                                );
                                            });
                                            it('Номер найден.', function() {
                                                tester.select.popup.
                                                    expectToHaveTextContent('+7 (916) 259-47-27 Другой номер');
                                            });
                                        });
                                        it('Ввожу комментарий в поле поиска. Номер найден.', function() {
                                            tester.input.withPlaceholder('Найти').fill('один');
                                            tester.select.popup.
                                                expectToHaveTextContent('+7 (916) 123-89-35 Еще один номер');
                                        });
                                        it('Выбранный номер выделен.', function() {
                                            tester.select.option('+7 (916) 123-89-27').
                                                expectNotToHaveClass('ui-list-option-selected');

                                            tester.select.option('+7 (495) 021-68-06').
                                                expectToHaveClass('ui-list-option-selected');
                                        });
                                    });
                                    it(
                                        'Софтфон открыт в другом окне. Отображено сообщение о том, что софтфон ' +
                                        'открыт в другом окне.',
                                    function() {
                                        tester.eventsWebSocket.disconnect(4429);
                                        tester.authLogoutRequest().receiveResponse();
                                        tester.registrationRequest().expired().receiveResponse();
                                        
                                        spendTime(2000);
                                        tester.webrtcWebsocket.finishDisconnecting();

                                        tester.softphone.
                                            expectTextContentToHaveSubstring('Софтфон открыт в другом окне');

                                        tester.select.expectNotToExist();
                                    });
                                    it('Отображен выбранный номер телефона.', function() {
                                        tester.select.expectToHaveTextContent('+7 (495) 021-68-06');

                                    });
                                });
                                it(
                                    'SIP-линия не зарегистрирована. Отображено сообщение о том, что SIP-линия не ' +
                                    'зарегистрирована.',
                                function() {
                                    authenticatedUserRequest.sipIsOffline().receiveResponse();

                                    tester.softphone.expectToHaveTextContent(
                                        'Sip-линия не зарегистрирована ' +
                                        '+7 (495) 021-68-06'
                                    );
                                });
                                it('Отображен выбранный номер телефона.', function() {
                                    tester.softphone.expectToHaveTextContent('+7 (495) 021-68-06');
                                });
                            });
                            it('Доступен только один номер. Отображен выбранный номер.', function() {
                                numberCapacityRequest.onlyOneNumber().receiveResponse();
                                authenticatedUserRequest.receiveResponse();

                                tester.select.expectToHaveTextContent('+7 (495) 021-68-06');
                            });
                        });
                        it('Безуспешно пытаюсь выбрать номер.', function() {
                            permissionsRequest.receiveResponse();

                            tester.connectEventsWebSocket();
                            tester.connectSIPWebSocket();

                            tester.allowMediaInput();

                            tester.numberCapacityRequest().receiveResponse();
                            tester.authenticatedUserRequest().receiveResponse();
                            tester.registrationRequest().receiveResponse();

                            tester.select.arrow.click();
                            tester.select.option('+7 (916) 123-89-29 Некий номер').click();
                        });
                    });
                    describe(
                        'У выбранного номера есть комментарий. Пользователь имеет права на выбор номера.',
                    function() {
                        let authenticatedUserRequest;

                        beforeEach(function() {
                            settingsRequest.numberCapacityComment().receiveResponse();
                            notificationTester.grantPermission();
                            permissionsRequest.allowNumberCapacityUpdate().receiveResponse();

                            tester.connectEventsWebSocket();
                            tester.connectSIPWebSocket();

                            tester.allowMediaInput();

                            tester.numberCapacityRequest().receiveResponse();
                            tester.registrationRequest().receiveResponse();
                            authenticatedUserRequest = tester.authenticatedUserRequest().expectToBeSent();
                        });

                        it(
                            'SIP-линия не зарегистрирована. Отображено сообщение о том, что SIP-линия не ' +
                            'зарегистрирована.',
                        function() {
                            authenticatedUserRequest.sipIsOffline().receiveResponse();

                            tester.softphone.expectToBeCollapsed();
                            tester.softphone.expectToHaveTextContent(
                                'Sip-линия не зарегистрирована ' +

                                '+7 (495) 021-68-06'
                            );
                        });
                        it('Отображен выбранный номер.', function() {
                            authenticatedUserRequest.receiveResponse();
                            tester.softphone.expectToHaveTextContent('+7 (495) 021-68-06');
                        });
                    });
                    describe('В качестве устройства для приема звонков исползуется IP-телефон.', function() {
                        beforeEach(function() {
                            settingsRequest.callsAreManagedByAnotherDevice().receiveResponse();
                            notificationTester.grantPermission();
                            permissionsRequest.allowNumberCapacityUpdate().receiveResponse();

                            tester.connectEventsWebSocket();

                            tester.numberCapacityRequest().receiveResponse();
                            tester.authenticatedUserRequest().receiveResponse();
                        });

                        describe('Получена неокончательная информация о звонке. Автоответ включен.', function() {
                            beforeEach(function() {
                                tester.outCallEvent().needAutoAnswer().notFinal().receive();
                            });

                            it(
                                'Получена окончательная информация о звонке. Отображена информация о звонке.',
                            function() {
                                tester.outCallEvent().needAutoAnswer().receive();

                                tester.incomingIcon.expectToBeVisible();

                                tester.softphone.expectTextContentToHaveSubstring(
                                    'Шалева Дора ' +
                                    '+7 (916) 123-45-67 ' +

                                    'Путь лида'
                                );
                            });
                            it('Отображено сообщение о поиске контакта.', function() {
                                tester.softphone.expectTextContentToHaveSubstring(
                                    '+7 (916) 123-45-67 ' +
                                    'Поиск контакта... ' +

                                    'Путь лида'
                                );
                            });
                        });
                        it('Получена окончательная информация о звонке. Отображена информация о звонке.', function() {
                            tester.outCallEvent().receive();

                            tester.incomingIcon.expectToBeVisible();
                            tester.softphone.
                                expectTextContentToHaveSubstring('Шалева Дора +7 (916) 123-45-67 Путь лида');
                        });
                        it('Совершается исходящий звонок. Отображена информация о звонке.', function() {
                            tester.outCallSessionEvent().receive();

                            tester.outgoingIcon.expectToBeVisible();
                            tester.softphone.
                                expectTextContentToHaveSubstring('Шалева Дора +7 (916) 123-45-67');
                        });
                        it('Отбражен выпадающий список номеров.', function() {
                            tester.select.expectToHaveTextContent('+7 (495) 021-68-06');
                        });
                    });
                    it('У выбранного номера есть длинный комментарий.', function() {
                        settingsRequest.longNumberCapacityComment().receiveResponse();
                        notificationTester.grantPermission();
                        permissionsRequest.allowNumberCapacityUpdate().receiveResponse();

                        tester.connectEventsWebSocket();
                        tester.connectSIPWebSocket();

                        tester.allowMediaInput();

                        tester.numberCapacityRequest().receiveResponse();
                        tester.registrationRequest().receiveResponse();
                        tester.authenticatedUserRequest().receiveResponse();

                        tester.dialpadVisibilityButton.click();

                        tester.softphone.expectTextContentToHaveSubstring(
                            '+7 (495) 021-68-06 ' +
                            'Кобыла и трупоглазые жабы искали цезию, нашли поздно утром свистящего хна'
                        );
                    });
                });
                describe('Пользователь не имеет права на список номеров.', function() {
                    beforeEach(function() {
                        permissionsRequest.receiveResponse();
                    });

                    describe('Включено управление звонками на другом устройстве.', function() {
                        beforeEach(function() {
                            settingsRequest.callsAreManagedByAnotherDevice().receiveResponse();
                            notificationTester.grantPermission();
                        });

                        describe('Соединение установлено.', function() {
                            beforeEach(function() {
                                tester.connectEventsWebSocket();
                                tester.authenticatedUserRequest().sipIsOffline().receiveResponse();
                            });

                            it('Нажимаю на кнопку аккаунта. Выбираю другой статус. Другой статус выбран.', function() {
                                tester.userName.putMouseOver();
                                tester.statusesList.item('Нет на месте').click();

                                tester.userStateUpdateRequest().receiveResponse();
                                tester.notificationOfUserStateChanging().anotherStatus().receive();

                                tester.statusesList.item('Не беспокоить').expectNotToBeSelected();
                                tester.statusesList.item('Нет на месте').expectToBeSelected();

                                tester.body.expectTextContentToHaveSubstring('karadimova Нет на месте');
                            });
                            it(
                                'Отображено сообщение о том, включено управление звонками с другого устройстви или ' +
                                'программы.',
                            function() {
                                tester.softphone.expectToBeCollapsed();

                                tester.softphone.expectToHaveTextContent(
                                    'Используется на другом устройстве ' +
                                    'Включено управление звонками с другого устройства или программы'
                                );
                            });
                        });
                        it('Устанавливается соединение. Отображено сообщение об установке соединения.', function() {
                            tester.getEventsWebSocket().expectToBeConnecting();

                            tester.softphone.expectToHaveTextContent(
                                'Используется на другом устройстве ' +
                                'Устанавливается соединение...'
                            );
                        });
                    });
                    it('Необходимо подключиться к РТУ напрямую. Подключаюсь.', function() {
                        tester.setJsSIPRTUUrl();
                        settingsRequest.setRTU().receiveResponse();
                        notificationTester.grantPermission();

                        tester.connectEventsWebSocket();
                        tester.connectSIPWebSocket();

                        tester.allowMediaInput();

                        tester.authenticatedUserRequest().receiveResponse();
                        tester.requestRegistration().setRTU().receiveResponse();
                    });
                    it('Получена некорректная конфигурация прямого подключения к РТУ. Подключаюсь к каме.', function() {
                        settingsRequest.setInvalidRTUConfig().receiveResponse();
                        notificationTester.grantPermission();

                        tester.connectEventsWebSocket();
                        tester.connectSIPWebSocket();

                        tester.allowMediaInput();

                        tester.authenticatedUserRequest().receiveResponse();
                        tester.requestRegistration().receiveResponse();
                    });
                    it('Телефония недоступна. Отображено сообщение "Sip-линия не зарегистрирована".', function() {
                        settingsRequest.noTelephony().receiveResponse();
                        notificationTester.grantPermission();

                        tester.connectEventsWebSocket();
                        tester.authenticatedUserRequest().receiveResponse();

                        tester.softphone.expectToBeCollapsed();

                        tester.softphone.expectTextContentToHaveSubstring(
                            'Нет доступной sip-линии'
                        );
                    });
                });
            });
        });
        describe('Чаты доступны.', function() {
            beforeEach(function() {
                accountRequest.operatorWorkplaceAvailable();
            });

            describe('Софтфон недоступен.', function() {
                beforeEach(function() {
                    accountRequest.softphoneUnavailable();
                });

                describe('Аналитика недоступна.', function() {
                    beforeEach(function() {
                        accountRequest.receiveResponse();

                        tester.reportGroupsRequest().receiveResponse();
                        tester.reportsListRequest().receiveResponse();
                        tester.reportTypesRequest().receiveResponse();

                        let requests = fetch.inAnyOrder();

                        const configRequest1 = tester.configRequest().expectToBeSent(requests),
                            configRequest2 = tester.configRequest().expectToBeSent(requests),
                            configRequest3 = tester.configRequest().expectToBeSent(requests);

                        requests.expectToBeSent();

                        configRequest1.receiveResponse();
                        configRequest2.receiveResponse();
                        configRequest3.receiveResponse();

                        requests = ajax.inAnyOrder();

                        const secondOperatorAccountRequest = tester.operatorAccountRequest().expectToBeSent(requests),
                            chatChannelListRequest = tester.chatChannelListRequest().expectToBeSent(requests),
                            operatorStatusListRequest = tester.operatorStatusListRequest().expectToBeSent(requests),
                            operatorListRequest = tester.operatorListRequest().expectToBeSent(requests),
                            operatorSiteListRequest = tester.operatorSiteListRequest().expectToBeSent(requests),
                            thirdOperatorAccountRequest = tester.operatorAccountRequest().expectToBeSent(requests);
                            operatorOfflineMessageListRequest =
                                tester.operatorOfflineMessageListRequest().expectToBeSent(requests);
                            chatListRequest = tester.chatListRequest().expectToBeSent(requests);

                        requests.expectToBeSent();

                        secondOperatorAccountRequest.receiveResponse();
                        chatChannelListRequest.receiveResponse();
                        operatorStatusListRequest.receiveResponse();
                        operatorListRequest.receiveResponse();
                        operatorSiteListRequest.receiveResponse();
                        thirdOperatorAccountRequest.receiveResponse();

                        tester.chatsWebSocket.connect();
                        tester.chatsInitMessage().expectToBeSent();

                        operatorOfflineMessageListRequest.receiveResponse();
                    });

                    describe('Использует старый API чатов.', function() {
                        beforeEach(function() {
                            chatListRequest.receiveResponse();
                            tester.messageListRequest().receiveResponse();
                            tester.messageListRequest().receiveResponse();
                        });

                        describe('Нажимаю на кнопку аккаунта.', function() {
                            beforeEach(function() {
                                tester.userName.putMouseOver();
                            });

                            it('Выбираю другой статус. Другой статус выбран.', function() {
                                tester.statusesList.item('Перерыв').click();

                                tester.operatorStatusUpdateRequest().receiveResponse();
                                tester.chatsEmployeeChangeMessage().receive();

                                tester.statusesList.item('Доступен').expectNotToBeSelected();
                                tester.statusesList.item('Перерыв').expectToBeSelected();

                                tester.body.expectTextContentToHaveSubstring('karadimova Перерыв');
                            });
                            it('Отображен список статусов.', function() {
                                tester.statusesList.item('Доступен').expectToBeSelected();
                                tester.statusesList.item('Перерыв').expectNotToBeSelected();

                                tester.statusesList.expectTextContentToHaveSubstring(
                                    'Доступен ' +
                                    'Перерыв ' +
                                    'Не беспокоить ' +
                                    'Нет на месте ' +
                                    'Нет на работе'
                                );
                            });
                        });
                        it('Отображается статус сотрудника.', function() {
                            tester.body.expectTextContentToHaveSubstring('karadimova Доступен');

                            tester.body.expectTextContentToHaveSubstring(
                                'Помакова Бисерка Драгановна ' +
                                '16:24 ' +
                                'Привет'
                            );
                        });
                    });
                    describe('Использует новый API чатов.', function() {
                        beforeEach(function() {
                            chatListRequest.extendedLastMessage().receiveResponse();
                            tester.messageListRequest().receiveResponse();
                            tester.messageListRequest().receiveResponse();
                        });

                        it('Поступил перевод чата. Отображено оповещие о переводе чата.', function() {
                            tester.transferCreatingMessage().receive();
                                
                            tester.body.expectTextContentToHaveSubstring(
                                'Перевод чата от оператора ' +
                                'ЧР Чакърова Райна Илковна ' +

                                'Поговори с ней сама, я уже устала ' +

                                'ВИ Върбанова Илиана Милановна ' +
                                'uiscom.ru/ ' +

                                'Больше не могу разговаривать с тобой, дай мне Веску!'
                            );
                        });
                        it('Поступило новое сообщение от оператора. Отображено оповещение.', function() {
                            tester.newMessage().fromOperator().withAttachment().receive();

                            tester.expectChatsStoreToContain({
                                chatListStore: {
                                    chatListItems: [{
                                        id: 2718935,
                                        last_message: {
                                            message: 'Я люблю тебя',
                                            date: 1613910293000,
                                            is_operator: true,
                                            resource_type: 'photo'
                                        }
                                    }]
                                }
                            });
                        });
                        it('Поступило новое сообщение от посетителя. Отображено оповещение.', function() {
                            tester.newMessage().receive();

                            notificationTester.grantPermission().
                                recentNotification().
                                expectToHaveTitle('Помакова Бисерка Драгановна').
                                expectToHaveBody('Я люблю тебя').
                                expectToBeOpened();

                            tester.changeMessageStatusRequest().receiveResponse();

                            tester.expectChatsStoreToContain({
                                chatListStore: {
                                    chatListItems: [{
                                        id: 2718935,
                                        last_message: {
                                            message: 'Я люблю тебя',
                                            date: 1613910293000,
                                            is_operator: false,
                                            resource_type: null
                                        }
                                    }]
                                }
                            });
                        });
                        it('Отображено сообщение.', function() {
                            tester.body.expectTextContentToHaveSubstring(
                                'Помакова Бисерка Драгановна ' +
                                '16:24 ' +
                                'Привет'
                            );
                        });
                    });
                });
                describe('Аналитика доступна.', function() {
                    beforeEach(function() {
                        accountRequest.webAccountLoginAvailable().receiveResponse();

                        tester.reportGroupsRequest().receiveResponse();
                        tester.reportsListRequest().allRequests().receiveResponse();
                        tester.reportTypesRequest().receiveResponse();

                        tester.configRequest().receiveResponse();
                        tester.operatorAccountRequest().receiveResponse();
                    });

                    it(
                        'Открываю раздел "Все обращения". Нажимаю на ссылку с количеством сообщение. Отображены ' +
                        'сообщения.',
                    function() {
                        tester.button('Сырые данные').click();
                        tester.button('Все обращения').click();
                            
                        tester.reportGroupsRequest().receiveResponse();
                        tester.reportsListRequest().allRequests().receiveResponse();
                        tester.reportsListRequest().allRequests().receiveResponse();
                        tester.reportTypesRequest().receiveResponse();

                        tester.reportGroupsRequest().receiveResponse();
                        tester.reportsListRequest().allRequests().receiveResponse();
                        tester.reportsListRequest().allRequests().receiveResponse();
                        tester.reportTypesRequest().receiveResponse();

                        tester.reportStateRequest().allRequests().receiveResponse();
                        tester.reportRapidFiltersRequest().communications().receiveResponse();
                        tester.reportFiltersRequest().receiveResponse();
                        tester.columnsTreeRequest().receiveResponse();
                        tester.tagsRequest().receiveResponse();
                        tester.customFiltersRequest().receiveResponse();
                        tester.communicationsRequest().receiveResponse()

                        tester.table.row.first().column.withHeader('Сообщений').button('4').click();

                        tester.configRequest().receiveResponse();
                        tester.messageListRequest().chat().receiveResponse();
                        tester.chatListRequest().visitor().receiveResponse();

                        tester.body.expectTextContentToHaveSubstring('Привет 12:13');
                    });
                    it('Открываю РМО.', function() {
                        tester.productsButton.click();
                        tester.button('Рабочее место оператора').click();
                            
                        tester.configRequest().receiveResponse();
                        tester.configRequest().receiveResponse();
                        tester.operatorOfflineMessageListRequest().receiveResponse();
                        tester.chatListRequest().receiveResponse();
                        tester.chatChannelListRequest().receiveResponse();
                        tester.operatorStatusListRequest().receiveResponse();
                        tester.operatorListRequest().receiveResponse();
                        tester.operatorSiteListRequest().receiveResponse();

                        tester.chatsWebSocket.connect();
                        tester.chatsInitMessage().expectToBeSent();
                        tester.operatorAccountRequest().receiveResponse();
                        tester.messageListRequest().receiveResponse();
                        tester.messageListRequest().receiveResponse();
                    });
                });
            });
            it('Аналитика доступна.', function() {
                accountRequest.webAccountLoginAvailable().receiveResponse();

                const requests = ajax.inAnyOrder();

                const reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests),
                    reportsListRequest = tester.reportsListRequest().allRequests().expectToBeSent(requests),
                    reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests);

                const secondAccountRequest = tester.accountRequest().
                    operatorWorkplaceAvailable().
                    webAccountLoginAvailable().
                    expectToBeSent(requests);

                requests.expectToBeSent();

                reportsListRequest.receiveResponse();
                reportTypesRequest.receiveResponse();
                secondAccountRequest.receiveResponse();
                reportGroupsRequest.receiveResponse();

                tester.configRequest().softphone().receiveResponse();

                tester.authCheckRequest().receiveResponse();
                tester.statusesRequest().receiveResponse();
                tester.settingsRequest().receiveResponse();
                tester.talkOptionsRequest().receiveResponse();
                tester.permissionsRequest().receiveResponse();

                notificationTester.grantPermission();

                tester.connectEventsWebSocket();
                tester.connectSIPWebSocket();

                tester.authenticatedUserRequest().receiveResponse();
                tester.registrationRequest().receiveResponse();

                tester.allowMediaInput();

                tester.button('Сырые данные').click();
                tester.button('Все обращения').click();
                    
                tester.reportGroupsRequest().receiveResponse();
                tester.reportsListRequest().allRequests().receiveResponse();
                tester.reportsListRequest().allRequests().receiveResponse();
                tester.reportTypesRequest().receiveResponse();

                tester.reportGroupsRequest().receiveResponse();
                tester.reportsListRequest().allRequests().receiveResponse();
                tester.reportsListRequest().allRequests().receiveResponse();
                tester.reportTypesRequest().receiveResponse();

                tester.reportStateRequest().allRequests().receiveResponse();
                tester.reportRapidFiltersRequest().communications().receiveResponse();
                tester.reportFiltersRequest().receiveResponse();
                tester.columnsTreeRequest().receiveResponse();
                tester.tagsRequest().receiveResponse();
                tester.customFiltersRequest().receiveResponse();
                tester.communicationsRequest().receiveResponse()

                tester.table.row.first().column.withHeader('Сообщений').button('4').click();

                tester.configRequest().receiveResponse();
                tester.messageListRequest().chat().receiveResponse();
                tester.chatListRequest().visitor().receiveResponse();

                tester.body.expectTextContentToHaveSubstring('Привет 12:13');
            });
        });
        it('Софтфон недоступен. Кнопка софтфона скрыта.', function() {
            accountRequest.softphoneUnavailable().receiveResponse();

            tester.reportGroupsRequest().receiveResponse();
            tester.reportsListRequest().receiveResponse();
            tester.reportTypesRequest().receiveResponse();

            tester.button('Софтфон').expectNotToExist();
        });
        it('Фичафлаг софтфона выключен. Кнопка софтфона скрыта.', function() {
            accountRequest.softphoneFeatureFlagDisabled().receiveResponse();

            tester.reportGroupsRequest().receiveResponse();
            tester.reportsListRequest().receiveResponse();
            tester.reportTypesRequest().receiveResponse();

            tester.button('Софтфон').expectNotToExist();
        });
    });
    describe('Ранее были выбраны настройки звука. Открываю настройки звука.', function() {
        let tester;

        beforeEach(function() {
            localStorage.setItem('audioSettings', JSON.stringify({
                microphone: {
                    deviceId: '98g2j2pg9842gi2gh89hl48ogh2og82h9g724hg42' +
                        '7gla8g2hg289hg9a48ghal4'
                },
                ringtone: {
                    deviceId: '6943f509802439f2c170bea3f42991df56faee134' +
                        'b25b3a2f2a13f0fad6943ab',
                    volume: 25
                },
                outputDeviceId: 'g8294gjg29guslg82pgj2og8ogjwog8u29gj0p' +
                    'agulo48g92gj28ogtjog82jgab'
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
                reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                accountRequest = tester.accountRequest().expectToBeSent(requests);

            requests.expectToBeSent();

            reportsListRequest.receiveResponse();
            reportTypesRequest.receiveResponse();
            accountRequest.receiveResponse();
            reportGroupsRequest.receiveResponse();

            tester.configRequest().softphone().receiveResponse();

            tester.authCheckRequest().receiveResponse();
            tester.statusesRequest().receiveResponse();
            tester.settingsRequest().secondRingtone().isNeedDisconnectSignal().receiveResponse();
            notificationTester.grantPermission();
            tester.talkOptionsRequest().receiveResponse();
            tester.permissionsRequest().receiveResponse();

            tester.ringtoneRequest().receiveResponse();
            fileReader.accomplishFileLoading(tester.secondRingtone);
            mediaStreamsTester.setIsAbleToPlayThough('data:audio/wav;base64,' + tester.secondRingtone);

            tester.connectEventsWebSocket();
            tester.connectSIPWebSocket();

            tester.authenticatedUserRequest().receiveResponse();
            tester.registrationRequest().receiveResponse();

            tester.allowMediaInput();

            tester.button('Настройки').click();
            tester.popover.button('Софтфон').click();

            tester.button('Звук').click();
        });

        describe('Поступил входящий звонок.', function() {
            beforeEach(function() {
                tester.incomingCall().receive();
                tester.numaRequest().receiveResponse();

                tester.outCallEvent().receive();
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
                        tester.requestAcceptIncomingCall();
                    });

                    it('Выбираю другой рингтон. Звучит больше не звучит.', function() {
                        tester.fieldRow('Мелодия звонка').select.arrow.click();
                        tester.select.option('Мелодия звонка 3').click();

                        tester.settingsUpdatingRequest().thirdRingtone().receiveResponse();
                        tester.settingsRequest().thirdRingtone().isNeedDisconnectSignal().receiveResponse();

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
                tester.requestAcceptIncomingCall();
                    
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

                tester.ringtoneRequest().third().receiveResponse();
                fileReader.accomplishFileLoading(tester.thirdRingtone);

                mediaStreamsTester.setIsAbleToPlayThough('data:audio/wav;base64,' + tester.thirdRingtone);

                tester.softphone.expectTextContentToHaveSubstring('Шалева Дора');
                mediaStreamsTester.expectStreamsToPlay('data:audio/wav;base64,' + tester.thirdRingtone);
            });
            it('Выбираю рингтон по умолчанию. Звучит рингтон.', function() {
                tester.fieldRow('Мелодия звонка').select.arrow.click();
                tester.select.option('По умолчанию').click();

                tester.settingsUpdatingRequest().defaultRingtone().receiveResponse();
                tester.settingsRequest().isNeedDisconnectSignal().receiveResponse();

                mediaStreamsTester.expectStreamsToPlay(soundSources.incomingCall);
                tester.fieldRow('Мелодия звонка').select.expectToHaveTextContent('По умолчанию');
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
        });
    });
    describe('Я уже аутентифицирован. Открываю новый личный кабинет.', function() {
        let authenticatedUserRequest,
            tester;

        beforeEach(function() {
            tester = new Tester({
                ...options,
                isAlreadyAuthenticated: true
            });

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

            tester.authCheckRequest().receiveResponse();
            tester.statusesRequest().receiveResponse();
            tester.settingsRequest().receiveResponse();
            notificationTester.grantPermission();
            tester.talkOptionsRequest().receiveResponse();
            tester.permissionsRequest().receiveResponse();

            tester.connectEventsWebSocket();
            tester.connectSIPWebSocket();

            authenticatedUserRequest = tester.authenticatedUserRequest().expectToBeSent();
            tester.registrationRequest().receiveResponse();
            tester.allowMediaInput();

            authenticatedUserRequest.receiveResponse();
        });
            
        it('Статус сотрудника изменился. Отображен новый статус сотрудника.', function() {
            tester.notificationOfUserStateChanging().anotherStatus().receive();
            tester.body.expectTextContentToHaveSubstring('karadimova Нет на месте');
        });
        it('Отображен статус сотрудника.', function() {
            tester.body.expectTextContentToHaveSubstring('karadimova Не беспокоить');
        });
    });
    it('Открываю настройки софтфона.', function() {
        let authenticatedUserRequest,
            tester;

        tester = new Tester({
            ...options,
            path: '/settings/softphone',
            isAlreadyAuthenticated: true
        });

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

        tester.authCheckRequest().receiveResponse();
        tester.statusesRequest().receiveResponse();
        tester.settingsRequest().receiveResponse();
        notificationTester.grantPermission();
        tester.talkOptionsRequest().receiveResponse();
        tester.permissionsRequest().receiveResponse();

        tester.connectEventsWebSocket();
        tester.connectSIPWebSocket();

        tester.authenticatedUserRequest().receiveResponse();
        tester.registrationRequest().receiveResponse();
        tester.allowMediaInput();

        tester.body.expectTextContentToHaveSubstring(
            'Настройки ' +
            'Общие Звук'
        );

        tester.body.expectTextContentNotToHaveSubstring(
            'Settings ' +
            'Common Sound'
        );
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

        const requests = ajax.inAnyOrder();

        const reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests),
            reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
            reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
            accountRequest = tester.accountRequest().expectToBeSent(requests);

        requests.expectToBeSent();

        reportsListRequest.receiveResponse();
        reportTypesRequest.receiveResponse();
        accountRequest.receiveResponse();
        reportGroupsRequest.receiveResponse();

        tester.configRequest().softphone().receiveResponse();

        tester.authCheckRequest().receiveResponse();
        tester.statusesRequest().receiveResponse();
        tester.settingsRequest().secondRingtone().isNeedDisconnectSignal().receiveResponse();
        notificationTester.grantPermission();
        tester.talkOptionsRequest().receiveResponse();
        tester.permissionsRequest().receiveResponse();

        tester.ringtoneRequest().receiveResponse();
        fileReader.accomplishFileLoading(tester.secondRingtone);
        mediaStreamsTester.setIsAbleToPlayThough('data:audio/wav;base64,' + tester.secondRingtone);

        tester.connectEventsWebSocket();
        tester.connectSIPWebSocket();

        tester.authenticatedUserRequest().receiveResponse();
        tester.registrationRequest().receiveResponse();

        tester.allowMediaInput();

        tester.button('Софтфон').click();

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

        const requests = ajax.inAnyOrder();

        const reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests),
            reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
            reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
            accountRequest = tester.accountRequest().expectToBeSent(requests);

        requests.expectToBeSent();

        reportsListRequest.receiveResponse();
        reportTypesRequest.receiveResponse();
        accountRequest.receiveResponse();
        reportGroupsRequest.receiveResponse();

        tester.configRequest().softphone().receiveResponse();

        tester.authCheckRequest().receiveResponse();
        tester.statusesRequest().receiveResponse();
        tester.settingsRequest().secondRingtone().isNeedDisconnectSignal().receiveResponse();
        notificationTester.grantPermission();
        tester.talkOptionsRequest().receiveResponse();
        tester.permissionsRequest().receiveResponse();

        tester.ringtoneRequest().receiveResponse();
        fileReader.accomplishFileLoading(tester.secondRingtone);
        mediaStreamsTester.setIsAbleToPlayThough('data:audio/wav;base64,' + tester.secondRingtone);

        tester.connectEventsWebSocket();
        tester.connectSIPWebSocket();

        tester.authenticatedUserRequest().receiveResponse();
        tester.registrationRequest().receiveResponse();

        tester.allowMediaInput();

        tester.button('Софтфон').click();

        tester.softphone.expectToBeCollapsed();
        tester.phoneField.expectToBeVisible();
    });
});
