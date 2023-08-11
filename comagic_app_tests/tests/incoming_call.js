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
        broadcastChannels,
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

    describe('Открываю лк. Ни лидген, ни РМО, ни аналитика не доступны.', function() {
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
                ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(requests),
                reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                authCheckRequest = tester.authCheckRequest().expectToBeSent(requests),
                secondAccountRequest = tester.accountRequest().expectToBeSent(requests);

            requests.expectToBeSent();

            ticketsContactsRequest.receiveResponse();
            reportsListRequest.noData().receiveResponse();
            reportTypesRequest.receiveResponse();
            secondAccountRequest.receiveResponse();
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
            settingsRequest = tester.settingsRequest().expectToBeSent();
            tester.employeeStatusesRequest().receiveResponse();

            notificationTester.grantPermission();
        });

        describe('Получены настройки.', function() {
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

                tester.employeeRequest().receiveResponse();
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
                });

                describe('Контакт найден.', function() {
                    beforeEach(function() {
                        tester.outCallEvent().receive();
                        tester.outCallEvent().slavesNotification().expectToBeSent();
                    });

                    describe('Принимаю звонок.', function() {
                        beforeEach(function() {
                            tester.callStartingButton.click();

                            tester.firstConnection.connectWebRTC();
                            tester.firstConnection.callTrackHandler();

                            tester.allowMediaInput();
                            tester.firstConnection.addCandidate();

                            incomingCall = incomingCall.expectOkToBeSent();
                        });

                        describe('Сервер подтвердил принятие звонка.', function() {
                            beforeEach(function() {
                                incomingCall = incomingCall.receiveAck();

                                tester.slavesNotification().
                                    available().
                                    twoChannels().
                                    incoming().
                                    confirmed().
                                    expectToBeSent();
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
                                        usersInGroupsRequest.receiveResponse();
                                    });

                                    describe(
                                        'Ни один из номеров не включает в себя другой.',
                                    function() {
                                        beforeEach(function() {
                                            usersRequest.receiveResponse();
                                        });

                                        describe('Открываю вкладку групп.', function() {
                                            beforeEach(function() {
                                                tester.button('Группы').click();
                                            });

                                            it(
                                                'Соединение разрывается. Кнопка звонка ' +
                                                'заблокирована.',
                                            function() {
                                                tester.disconnectEventsWebSocket();

                                                tester.slavesNotification().
                                                    twoChannels().
                                                    registered().
                                                    webRTCServerConnected().
                                                    microphoneAccessGranted().
                                                    userDataFetched().
                                                    incoming().
                                                    confirmed().
                                                    expectToBeSent();

                                                tester.employeeRow('Отдел дистрибуции').
                                                    expectToBeDisabled();
                                            });
                                            it('Отображена таблица групп.', function() {
                                                tester.employeeRow('Отдел дистрибуции').
                                                    expectToBeEnabled();

                                                tester.softphone.expectToHaveTextContent(
                                                    'Сотрудники Группы ' +

                                                    'Отдел дистрибуции 298 1 /1 ' +
                                                    'Отдел по работе с ключевыми клиентами ' +
                                                        '726 0 ' +
                                                    '/1 Отдел региональных продаж 828 2 /2'
                                                );
                                            });
                                        });
                                        describe('Ввожу значение в поле поиска.', function() {
                                            beforeEach(function() {
                                                tester.softphone.input.fill('ова');
                                            });

                                            it(
                                                'Нажимаю на иконку очищения поля. Отображены ' +
                                                'все сотрудники.',
                                            function() {
                                                tester.softphone.input.clearIcon.click();

                                                tester.softphone.expectToHaveTextContent(
                                                    'Сотрудники Группы ' +

                                                    'Божилова Йовка 296 ' +
                                                    'Господинова Николина 295 ' +
                                                    'Шалева Дора 8258'
                                                );

                                                tester.softphone.input.expectToHaveValue('');
                                            });
                                            it('Отображены найденные сотрудники.', function() {
                                                tester.softphone.expectToHaveTextContent(
                                                    'Сотрудники Группы ' +

                                                    'Божил ова Йовка 296 ' +
                                                    'Господин ова Николина 295'
                                                );
                                            });
                                        });
                                        describe('Ввожу номер в поле поиска.', function() {
                                            beforeEach(function() {
                                                tester.softphone.input.fill('29');
                                            });

                                            it(
                                                'Открываю вкладку "Группы". Список групп ' +
                                                'отфильтрован по номеру.',
                                            function() {
                                                tester.button('Группы').click();

                                                tester.softphone.expectToHaveTextContent(
                                                    'Сотрудники Группы ' +
                                                    'Отдел дистрибуции 29 8 1 /1'
                                                );
                                            });
                                            it('Сотрудники фильтруются по номеру.', function() {
                                                tester.softphone.expectToHaveTextContent(
                                                    'Сотрудники Группы ' +

                                                    'Божилова Йовка 29 6 ' +
                                                    'Господинова Николина 29 5'
                                                );
                                            });
                                        });
                                        it(
                                            'Ввожу значение в поле поиска. Ничего не ' +
                                            'найдено. Отображено сообщение о том, что ничего ' +
                                            'не найдено.',
                                        function() {
                                            tester.softphone.input.fill('йцукен');

                                            tester.softphone.expectToHaveTextContent(
                                                'Сотрудники Группы ' +
                                                'Сотрудник не найден'
                                            );
                                        });
                                        it(
                                            'Нажимаю на строку в таблице сотрудника.',
                                        function() {
                                            tester.employeeRow('Господинова Николина').click();

                                            tester.dtmf('#').expectToBeSent();
                                            spendTime(600);
                                            tester.dtmf('2').expectToBeSent();
                                            spendTime(600);
                                            tester.dtmf('9').expectToBeSent();
                                            spendTime(600);
                                            tester.dtmf('5').expectToBeSent();
                                            spendTime(600);

                                            tester.slavesNotification().
                                                additional().
                                                visible().
                                                transfered().
                                                dtmf('#295').
                                                outCallEvent().include().
                                                expectToBeSent();

                                            tester.transferButton.click();
                                            tester.dtmf('#').expectToBeSent();

                                            tester.slavesNotification().
                                                additional().
                                                visible().
                                                outCallEvent().include().
                                                notTransfered().
                                                dtmf('#295#').
                                                expectToBeSent();
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
                                            tester.employeeRow('Божилова Йовка').
                                                expectToBeDisabled();
                                            tester.employeeRow('Шалева Дора').
                                                expectToBeEnabled();
                                        });
                                    });
                                    it(
                                        'Один из номеров включает в себя другой. Ввожу один ' +
                                        'из номеров в поле поиска.',
                                    function() {
                                        usersRequest.anotherShortPhone().receiveResponse();

                                        tester.softphone.input.fill('296');

                                        tester.softphone.expectToHaveTextContent(
                                            'Сотрудники Группы ' +

                                            'Божилова Йовка 296 ' +
                                            'Господинова Николина 296 3'
                                        );
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

                                    tester.slavesNotification().
                                        available().
                                        twoChannels().
                                        incoming().
                                        confirmed().
                                        muted().
                                        expectToBeSent();
                                });

                                it(
                                    'Собеседник повесил трубку. Поступил входящий звонок. ' +
                                    'Микрофон включен.',
                                function() {
                                    incomingCall.receiveBye();

                                    tester.slavesNotification().
                                        available().
                                        twoChannels().
                                        ended().
                                        expectToBeSent();

                                    incomingCall = tester.incomingCall().receive();

                                    tester.slavesNotification().
                                        available().
                                        twoChannels().
                                        incoming().
                                        progress().
                                        expectToBeSent();

                                    tester.numaRequest().receiveResponse();

                                    tester.outCallEvent().receive();
                                    tester.outCallEvent().slavesNotification().expectToBeSent();

                                    tester.callStartingButton.click();

                                    tester.secondConnection.connectWebRTC();
                                    tester.secondConnection.callTrackHandler();

                                    tester.allowMediaInput();
                                    tester.secondConnection.addCandidate();

                                    incomingCall.expectOkToBeSent().receiveResponse();

                                    tester.slavesNotification().
                                        available().
                                        twoChannels().
                                        incoming().
                                        confirmed().
                                        expectToBeSent();

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
                            describe('Убираю фокус с окна. ', function() {
                                beforeEach(function() {
                                    setFocus(false);
                                });

                                it(
                                    'Фокусирую окно. Нажимаю на кнопку диалпада. ' +
                                    'Отправляется DTMF. Звучит тон.',
                                function() {
                                    setFocus(true);

                                    utils.pressKey('7');
                                    tester.dtmf('7').expectToBeSent();

                                    tester.slavesNotification().
                                        additional().
                                        visible().
                                        outCallEvent().include().
                                        dtmf('7').
                                        expectToBeSent();

                                    tester.expectToneSevenToPlay();
                                });
                                it(
                                    'Нажимаю на кнопку диалпада. DTMF не отправляется.',
                                function() {
                                    utils.pressKey('7');
                                });
                            });
                            describe('Нажимаю на кнопку удержания.', function() {
                                beforeEach(function() {
                                    tester.holdButton.click();
                                    
                                    tester.slavesNotification().
                                        available().
                                        twoChannels().
                                        incoming().
                                        confirmed().
                                        holded().
                                        expectToBeSent();

                                    audioDecodingTester.accomplishAudioDecoding();
                                });

                                it(
                                    'Нажимаю на кнопку удержания. Разговор продолжается.',
                                function() {
                                    tester.holdButton.click();

                                    tester.slavesNotification().
                                        available().
                                        twoChannels().
                                        incoming().
                                        confirmed().
                                        expectToBeSent();

                                    tester.firstConnection.expectRemoteStreamToPlay();
                                });
                                it('Звонок удерживается.', function() {
                                    tester.firstConnection.expectHoldMusicToPlay();
                                    tester.expectNoSoundToPlay();
                                });
                            });
                            it('Отображено направление и номер.', function() {
                                tester.microphoneButton.
                                    expectNotToHaveClass('clct-call-option--pressed');

                                tester.firstConnection.expectSinkIdToEqual('default');
                                tester.firstConnection.expectInputDeviceIdToEqual('default');
                                tester.firstConnection.expectNotToBeMute();

                                tester.incomingIcon.expectToBeVisible();
                                tester.softphone.expectTextContentToHaveSubstring(
                                    'Шалева Дора +7 (916) 123-45-67 00:00'
                                );
                            });
                        });
                        describe('Сервер отклонил принятие звонка.', function() {
                            beforeEach(function() {
                                incomingCall = incomingCall.
                                    receiveCancel().
                                    expectOkToBeSent();
                            });
                            
                            it('Проходит некоторое время. Звонок завершается.', function() {
                                spendTime(32000);

                                tester.expectPingToBeSent();
                                tester.receivePong();

                                incomingCall.expectByeToBeSent();

                                tester.slavesNotification().
                                    available().
                                    twoChannels().
                                    ended().
                                    expectToBeSent();
                            });
                            it('Кнопка принятия звонка видима.', function() {
                                tester.callStartingButton.expectToBeVisible();
                            });
                        });
                    });
                    describe(
                        'Сворачиваю софтфон. Звонок отменен. Разворачиваю софтфон. ' +
                        'Поступает входящий звонок.',
                    function() {
                        beforeEach(function() {
                            tester.collapsednessToggleButton.click();
                            incomingCall.receiveCancel();

                            tester.slavesNotification().
                                available().
                                twoChannels().
                                failed().
                                expectToBeSent();

                            tester.collapsednessToggleButton.click();
                            incomingCall = tester.incomingCall().receive();

                            tester.slavesNotification().
                                available().
                                twoChannels().
                                incoming().
                                progress().
                                expectToBeSent();

                            tester.numaRequest().receiveResponse();

                            tester.outCallEvent().receive();
                            tester.outCallEvent().slavesNotification().expectToBeSent();
                        });

                        it('Принимаю звонок. Отображен диалпад.', function() {
                            tester.callStartingButton.click();

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

                            tester.dialpadButton(1).expectToBeVisible();;
                        });
                        it('Отображена информация о контакте.', function() {
                            tester.softphone.expectTextContentToHaveSubstring(
                                'Шалева Дора +7 (916) 123-45-67 ' +
                                'Путь лида'
                            );
                        });
                    });
                    it(
                        'Поступил второй входящий звонок. Отображено сообщение о звонке ' +
                        'на вторую линию.',
                    function() {
                        tester.incomingCall().thirdNumber().receive();

                        tester.slavesNotification().
                            twoChannels().
                            available().
                            incoming().
                            progress().
                            secondChannel().
                                incoming().
                                progress().
                                fifthPhoneNumber().
                            expectToBeSent();

                        tester.numaRequest().thirdNumber().receiveResponse();

                        tester.outCallEvent().
                            anotherPerson().
                            receive();

                        tester.outCallEvent().
                            anotherPerson().slavesNotification().
                            expectToBeSent();

                        tester.body.expectTextContentToHaveSubstring(
                            'Гигова Петранка Входящий (2-ая линия)...'
                        );
                    });
                    it('Нажимаю на кнопку открытия контакта.', function() {
                        tester.contactOpeningButton.click();

                        windowOpener.expectToHavePath(
                            'https://comagicwidgets.amocrm.ru/contacts/detail/382030'
                        );
                    });
                    it(
                        'Нажимаю на кнопку сворачивания виджета. Виджет свернут.',
                    function() {
                        tester.collapsednessToggleButton.click();

                        tester.collapsednessToggleButton.expectToBeCollapsed();
                        tester.softphone.expectTextContentNotToHaveSubstring('Путь лида');
                    });
                    it('Отображена информация о контакте.', function() {
                        tester.collapsednessToggleButton.expectToBeExpanded();

                        tester.contactOpeningButton.
                            expectNotToHaveClass('cmg-button-disabled');
                        tester.incomingIcon.expectToBeVisible();

                        tester.softphone.expectTextContentToHaveSubstring(
                            'Шалева Дора ' +
                            '+7 (916) 123-45-67 ' +

                            'Путь лида'
                        );

                        tester.firstLineButton.
                            expectToHaveClass('cmg-bottom-button-selected');
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

                            tester.outCallEvent().isTransfer().slavesNotification().
                                expectToBeSent();
                        });

                        it(
                            'Принимаю звонок. Отображен знак трансфера номер и таймер.',
                        function() {
                            tester.callStartingButton.click();

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

                            tester.directionIcon.expectToHaveAllOfClasses([
                                'ui-direction-icon-incoming',
                                'ui-direction-icon-transfer'
                            ]);

                            tester.directionIcon.expectNotToHaveClass('ui-direction-icon-failed');

                            tester.softphone.
                                expectTextContentToHaveSubstring('Шалева Дора +7 (916) 123-45-67 00:00');
                        });
                        it('Отображено сообщение о переводе звонка.', function() {
                            tester.incomingIcon.expectNotToExist();
                            tester.outgoingIcon.expectNotToExist();

                            tester.softphone.expectTextContentToHaveSubstring(
                                'Шалева Дора +7 (916) 123-45-67 Трансфер от Бисерка ' +
                                'Макавеева'
                            );
                        });
                    });
                    it('Имя контакта неизвестно. Отображено имя сотрудника, певедшего звонок.', function() {
                        outCallEvent.noName().receive();

                        tester.outCallEvent().
                            isTransfer().
                            noName().
                            slavesNotification().
                            expectToBeSent();

                        tester.softphone.expectTextContentToHaveSubstring(
                            '7 (916) 123-45-67 Трансфер от Бисерка Макавеева'
                        );
                    });
                    it(
                        'Автоответ включен. Звонок не принимается автоматически.',
                    function() {
                        outCallEvent.needAutoAnswer().receive();

                        tester.outCallEvent().needAutoAnswer().isTransfer().
                            slavesNotification().expectToBeSent();
                    });
                });
                describe('Звонок производится в рамках исходящего обзвона.', function() {
                    var outCallEvent;

                    beforeEach(function() {
                        outCallEvent = tester.outCallEvent().autoCallCampaignName();
                    });

                    it('Автоответ включен. Звонок принимается.', function() {
                        outCallEvent.needAutoAnswer().receive();
                        tester.outCallEvent().needAutoAnswer().autoCallCampaignName().
                            slavesNotification().expectToBeSent();

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

                        tester.softphone.expectTextContentToHaveSubstring(
                            'Шалева Дора +7 (916) 123-45-67 00:00'
                        );
                    });
                    it(
                        'Имя контакта отсутствует. Звонок обозначен, как исходящий обзвон.',
                    function() {
                        outCallEvent.noName().receive();
                        tester.outCallEvent().noName().autoCallCampaignName().
                            slavesNotification().expectToBeSent();

                        tester.outgoingIcon.expectToBeVisible();
                        tester.softphone.expectTextContentToHaveSubstring(
                            '+7 (916) 123-45-67 Исходящий обзвон'
                        );
                    });
                    it('Звонок отображается как исходящий.', function() {
                        outCallEvent.receive();
                        tester.outCallEvent().autoCallCampaignName().slavesNotification().
                            expectToBeSent();

                        tester.outgoingIcon.expectToBeVisible();
                        tester.softphone.expectTextContentToHaveSubstring(
                            'Шалева Дора +7 (916) 123-45-67'
                        );
                    });
                });
                describe('Открытые сделки существуют.', function() {
                    beforeEach(function() {
                        tester.outCallEvent().
                            activeLeads().
                            receive();

                        tester.outCallEvent().
                            activeLeads().
                            slavesNotification().
                            expectToBeSent();
                    });
                    
                    it('Нажимаю на ссылку на открытую сделку. Открыта сделка.', function() {
                        tester.anchor('По звонку с 79154394340').click();

                        windowOpener.expectToHavePath(
                            'https://comagicwidgets.amocrm.ru/leads/detail/3003651'
                        );
                    });
                    it('Открытые сделки отображены.', function() {
                        tester.softphone.expectTextContentToHaveSubstring(
                            'Шалева Дора ' +
                            '+7 (916) 123-45-67 ' +

                            'Открытые сделки ' +

                            'По звонку на 79154394339 ' +
                            'Переговоры / Открыт ' +

                            'По звонку с 79154394340 ' +
                            'Согласование договора / Закрыт ' +

                            'Путь лида ' +

                            'Виртуальный номер ' +
                            '+7 (916) 123-45-68 ' +

                            'Сайт ' +
                            'somesite.com ' +

                            'Поисковый запрос ' +
                            'Какой-то поисковый запрос, который не помещается в одну строчку ' +

                            'Рекламная кампания ' +
                            'Некая рекламная кампания'
                        );
                    });
                });
                it(
                    'Контакт не найден. Отображно направление звонка. Кнопка открытия ' +
                    'контакта заблокирована.',
                function() {
                    tester.outCallEvent().noName().noCrmContactLink().receive();
                    tester.outCallEvent().noName().noCrmContactLink().slavesNotification().
                        expectToBeSent();

                    tester.incomingIcon.expectToBeVisible();
                    tester.softphone.expectTextContentToHaveSubstring(
                        '+7 (916) 123-45-67 Входящий звонок'
                    );
                });
                it(
                    'Звонок совершается с помощью click-to-call. Звонок отображается как ' +
                    'исходящий.',
                function() {
                    tester.outCallEvent().clickToCall().receive();

                    tester.outCallEvent().
                        clickToCall().
                        slavesNotification().
                        expectToBeSent();

                    tester.outgoingIcon.expectToBeVisible();
                });
                it(
                    'Потеряно соединение с сервером. Звонок отменен. Рингтон не звучит.',
                function() {
                    tester.eventsWebSocket.disconnectAbnormally(1006);

                    tester.slavesNotification().
                        twoChannels().
                        registered().
                        webRTCServerConnected().
                        microphoneAccessGranted().
                        userDataFetched().
                        incoming().
                        progress().
                        expectToBeSent();

                    incomingCall.receiveCancel();

                    tester.slavesNotification().
                        twoChannels().
                        registered().
                        webRTCServerConnected().
                        microphoneAccessGranted().
                        userDataFetched().
                        failed().
                        expectToBeSent();

                    tester.expectNoSoundToPlay();
                });
                it('Звонок отменен. Рингтон не звучит.', function() {
                    incomingCall.receiveCancel();
                    
                    tester.slavesNotification().
                        available().
                        twoChannels().
                        failed().
                        expectToBeSent();

                    tester.expectNoSoundToPlay();
                });
                it('У контакта длинное имя.', function() {
                    tester.outCallEvent().longName().receive();
                    tester.outCallEvent().longName().slavesNotification().expectToBeSent();
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
            describe('Браузер скрыт.', function() {
                beforeEach(function() {
                    setDocumentVisible(false);

                    tester.slavesNotification().
                        twoChannels().
                        available().
                        hidden().
                        expectToBeSent();
                });

                describe('Открывается новая вкладка.', function() {
                    beforeEach(function() {
                        tester.masterNotification().tabOpened().receive();

                        tester.slavesNotification().
                            additional().
                            expectToBeSent();

                        tester.slavesNotification().
                            twoChannels().
                            available().
                            expectToBeSent();
                    });

                    describe('Вкладка скрыта.', function() {
                        beforeEach(function() {
                            tester.masterNotification().tabBecameHidden().receive();

                            tester.slavesNotification().
                                twoChannels().
                                available().
                                hidden().
                                expectToBeSent();
                        });

                        it(
                            'Вкладка снова открыта. Поступил входящий звонок. браузерное ' +
                            'уведомление не отображено.',
                        function() {
                            tester.masterNotification().tabBecameVisible().receive();

                            tester.slavesNotification().
                                twoChannels().
                                available().
                                expectToBeSent();

                            tester.incomingCall().receive();

                            tester.slavesNotification().
                                available().
                                twoChannels().
                                incoming().
                                progress().
                                expectToBeSent();

                            tester.numaRequest().receiveResponse();

                            tester.outCallEvent().receive();
                            tester.outCallEvent().slavesNotification().expectToBeSent();
                        });
                        it(
                            'Поступил входящий звонок. Отображено браузерное уведомление.',
                        function() {
                            tester.incomingCall().receive();

                            tester.slavesNotification().
                                available().
                                twoChannels().
                                incoming().
                                progress().
                                hidden().
                                expectToBeSent();

                            tester.numaRequest().receiveResponse();

                            tester.outCallEvent().receive();
                            tester.outCallEvent().slavesNotification().expectToBeSent();

                            notificationTester.grantPermission().
                                recentNotification().
                                expectToHaveTitle('Входящий звонок').
                                expectToHaveBody('Шалева Дора, +7 (916) 123-45-67, somesite.com').
                                expectToBeOpened();
                        });
                    });
                    it(
                        'Поступил входящий звонок. браузерное уведомление не отображено.',
                    function() {
                        tester.incomingCall().receive();

                        tester.slavesNotification().
                            available().
                            twoChannels().
                            incoming().
                            progress().
                            expectToBeSent();

                        tester.numaRequest().receiveResponse();

                        tester.outCallEvent().receive();
                        tester.outCallEvent().slavesNotification().expectToBeSent();
                    });
                });
                describe('Поступила информация о звонке.', function() {
                    beforeEach(function() {
                        tester.outCallEvent().receive();
                        tester.outCallEvent().slavesNotification().expectToBeSent();
                    });

                    it('Поступил звонок. Отображено уведомление о звонке.', function() {
                        tester.incomingCall().receive();

                        tester.slavesNotification().
                            available().
                            twoChannels().
                            incoming().
                            progress().
                            hidden().
                            expectToBeSent();

                        tester.numaRequest().receiveResponse();

                        notificationTester.grantPermission().
                            recentNotification().
                            expectToHaveTitle('Входящий звонок').
                            expectToHaveBody('Шалева Дора, +7 (916) 123-45-67, somesite.com').
                            expectToBeOpened();
                    });
                    it('Уведомление о звонке не отобразилось.', function() {
                        notificationTester.recentNotification().expectNotToExist();
                    });
                });
                describe('Поступил входящий звонок.', function() {
                    beforeEach(function() {
                        tester.incomingCall().receive();

                        tester.slavesNotification().
                            available().
                            twoChannels().
                            incoming().
                            progress().
                            hidden().
                            expectToBeSent();

                        tester.numaRequest().receiveResponse();
                    });

                    it(
                        'Поступила информация о звонке. Отображено браузерное уведомление.',
                    function() {
                        tester.outCallEvent().receive();
                        tester.outCallEvent().slavesNotification().expectToBeSent();

                        notificationTester.grantPermission().
                            recentNotification().
                            expectToHaveTitle('Входящий звонок').
                            expectToHaveBody('Шалева Дора, +7 (916) 123-45-67, somesite.com').
                            expectToBeOpened();
                    });
                    it('Уведомление о звонке не отобразилось.', function() {
                        notificationTester.recentNotification().expectNotToExist();
                    });
                });
                it(
                    'Вкладка снова открыта. Поступил входящий звонок. браузерное ' +
                    'уведомление не отображено.',
                function() {
                    setDocumentVisible(true);

                    tester.slavesNotification().
                        twoChannels().
                        available().
                        expectToBeSent();

                    tester.incomingCall().receive();

                    tester.slavesNotification().
                        available().
                        twoChannels().
                        incoming().
                        progress().
                        expectToBeSent();

                    tester.numaRequest().receiveResponse();

                    tester.outCallEvent().receive();
                    tester.outCallEvent().slavesNotification().expectToBeSent();
                });
            });
            it(
                'Поступила информация о звонке. Поступил звонок. Отображена информация о ' +
                'звонке.',
            function() {
                tester.outCallEvent().receive();
                tester.outCallEvent().slavesNotification().expectToBeSent();

                tester.incomingCall().receive();

                tester.slavesNotification().
                    twoChannels().
                    available().
                    incoming().
                    progress().
                    expectToBeSent();

                tester.numaRequest().receiveResponse();
                    
                tester.softphone.expectTextContentToHaveSubstring(
                    'Шалева Дора +7 (916) 123-45-67 ' +
                    'Путь лида'
                );
            });
        });
        describe('Софтофон должен скрываться при завершении звонка.', function() {
            let incomingCall;

            beforeEach(function() {
                settingsRequest = settingsRequest.shouldCloseWidgetOnCallFinished();
            });

            describe('Поступил входящий звонок.', function() {
                beforeEach(function() {
                    settingsRequest.
                        shouldCloseWidgetOnCallFinished().
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

                    tester.employeeRequest().receiveResponse();
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

                    incomingCall = tester.incomingCall().receive();

                    tester.slavesNotification().
                        twoChannels().
                        available().
                        incoming().
                        progress().
                        expectToBeSent();

                    tester.numaRequest().receiveResponse();
                });

                describe('Получены данные звонка.', function() {
                    let secondIncomingCall;

                    beforeEach(function() {
                        tester.outCallEvent().receive();
                        tester.outCallEvent().slavesNotification().expectToBeSent();
                    });

                    describe('Поступил второй входящий звонок.', function() {
                        beforeEach(function() {
                            secondIncomingCall = tester.incomingCall().thirdNumber().receive();

                            tester.slavesNotification().
                                twoChannels().
                                available().
                                incoming().
                                progress().
                                secondChannel().
                                    incoming().
                                    progress().
                                    fifthPhoneNumber().
                                expectToBeSent();

                            tester.numaRequest().thirdNumber().receiveResponse();

                            tester.outCallEvent().
                                anotherPerson().
                                receive();

                            tester.outCallEvent().
                                anotherPerson().slavesNotification().
                                expectToBeSent();
                        });

                        describe('Второй звонок отменен.', function() {
                            beforeEach(function() {
                                secondIncomingCall.receiveCancel();

                                tester.slavesNotification().
                                    twoChannels().
                                    available().
                                    incoming().
                                    progress().
                                    secondChannel().
                                        failed().
                                    expectToBeSent();
                            });

                            it('Первый звонок отменен. Софтфон скрыт.', function() {
                                incomingCall.receiveCancel();

                                tester.slavesNotification().
                                    additional().
                                    expectToBeSent();

                                tester.slavesNotification().
                                    twoChannels().
                                    available().
                                    failed().
                                    secondChannel().
                                        failed().
                                    expectToBeSent();

                                tester.softphone.expectNotToExist();
                            });
                            it('Софтфон отображен.', function() {
                                tester.softphone.expectTextContentToHaveSubstring('Шалева Дора');
                            });
                        });
                        it('Софтфон отображен.', function() {
                            tester.softphone.expectTextContentToHaveSubstring('Шалева Дора');
                        });
                    });
                    it('Софтфон отображен.', function() {
                        tester.softphone.expectTextContentToHaveSubstring('Шалева Дора');
                    });
                });
                it('Софтфон отображен.', function() {
                    tester.softphone.expectTextContentToHaveSubstring('+7 (916) 123-45-67');
                });
            });
            describe('Включено управление звонками на другом устройстве.', function() {
                beforeEach(function() {
                    settingsRequest.
                        callsAreManagedByAnotherDevice().
                        receiveResponse();

                    tester.slavesNotification().
                        twoChannels().
                        disabled().
                        expectToBeSent();

                    notificationTester.grantPermission();

                    tester.connectEventsWebSocket();

                    tester.slavesNotification().
                        twoChannels().
                        disabled().
                        softphoneServerConnected().
                        expectToBeSent();

                    tester.employeeRequest().receiveResponse();

                    tester.authenticatedUserRequest().
                        sipIsOffline().
                        receiveResponse();

                    tester.slavesNotification().
                        userDataFetched().
                        sipIsOffline().
                        twoChannels().
                        disabled().
                        softphoneServerConnected().
                        expectToBeSent();
                });

                describe('Поступил входящий звонок.', function() {
                    beforeEach(function() {
                        tester.outCallEvent().receive();
                        tester.outCallEvent().slavesNotification().expectToBeSent();

                        tester.slavesNotification().
                            additional().
                            visible().
                            outCallEvent().include().
                            expectToBeSent();
                    });

                    it('Звонок завершен. Софтфон скрыт.', function() {
                        tester.callSessionFinish().receive();
                        tester.callSessionFinish().slavesNotification().expectToBeSent();

                        tester.slavesNotification().
                            additional().
                            expectToBeSent();

                        tester.softphone.expectNotToExist();
                    });
                    it('Софтфон видим.', function() {
                        tester.softphone.expectTextContentToHaveSubstring('Шалева Дора');
                    });
                });
                it('Софтфон скрыт.', function() {
                    tester.softphone.expectNotToExist();
                });
            });
        });
    });
});
