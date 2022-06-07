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
            });

            describe('Вкладка является ведущей.', function() {
                beforeEach(function() {
                    tester.masterInfoMessage().receive();
                    tester.slavesNotification().expectToBeSent();
                    tester.slavesNotification().additional().expectToBeSent();
                    tester.masterInfoMessage().tellIsLeader().expectToBeSent();

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
                            tester.slavesNotification().twoChannels().enabled().expectToBeSent();

                            tester.connectEventsWebSocket();
                            tester.slavesNotification().twoChannels().enabled().softphoneServerConnected().
                                expectToBeSent();

                            tester.connectSIPWebSocket();
                            tester.slavesNotification().twoChannels().webRTCServerConnected().
                                softphoneServerConnected().expectToBeSent();

                            tester.othersNotification().widgetStateUpdate().expectToBeSent();
                            tester.othersNotification().updateSettings().shouldNotPlayCallEndingSignal().
                                expectToBeSent();

                            notificationTester.grantPermission();

                            authenticatedUserRequest = tester.authenticatedUserRequest().expectToBeSent();
                            registrationRequest = tester.registrationRequest().expectToBeSent();
                        });

                        describe('Получен доступ к микрофону.', function() {
                            beforeEach(function() {
                                tester.allowMediaInput();

                                tester.slavesNotification().
                                    twoChannels().
                                    softphoneServerConnected().
                                    webRTCServerConnected().
                                    microphoneAccessGranted().
                                    expectToBeSent();
                            });

                            describe('SIP-линия зарегистрирована.', function() {
                                beforeEach(function() {
                                    authenticatedUserRequest.receiveResponse();

                                    tester.slavesNotification().
                                        twoChannels().
                                        softphoneServerConnected().
                                        webRTCServerConnected().
                                        microphoneAccessGranted().
                                        userDataFetched().
                                        expectToBeSent();
                                });

                                describe('Получены данные для отчета.', function() {
                                    beforeEach(function() {
                                        reportGroupsRequest.receiveResponse();
                                    });

                                    describe('SIP-регистрация завершена.', function() {
                                        beforeEach(function() {
                                            registrationRequest.receiveResponse();
                                            tester.slavesNotification().twoChannels().available().userDataFetched().
                                                expectToBeSent();
                                        });

                                        xdescribe('Поступил входящий звонок.', function() {
                                            let incomingCall;

                                            beforeEach(function() {
                                                incomingCall = tester.incomingCall().receive();

                                                tester.slavesNotification().twoChannels().available().incoming().
                                                    progress().userDataFetched().expectToBeSent();

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

                                                        incomingCall.expectOkToBeSent();
                                                        tester.slavesNotification().available().userDataFetched().
                                                            twoChannels().incoming().confirmed().expectToBeSent();
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
                                                                            expectToBeDisaled();
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

                                                                            'Господинова Николина 29 5 ' +
                                                                            'Божилова Йовка 29 6'
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

                                                                    tester.slavesNotification().additional().visible().
                                                                        transfered().dtmf('#295').outCallEvent().
                                                                        expectToBeSent();

                                                                    tester.transferButton.click();
                                                                    tester.dtmf('#').expectToBeSent();

                                                                    tester.slavesNotification().additional().visible().
                                                                        outCallEvent().notTransfered().dtmf('#295#').
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
                                                                        expectToBeDisaled();
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

                                                            tester.slavesNotification().available().userDataFetched().
                                                                twoChannels().incoming().confirmed().muted().
                                                                expectToBeSent();
                                                        });

                                                        it(
                                                            'Собеседник повесил трубку. Поступил входящий звонок. ' +
                                                            'Микрофон включен.',
                                                        function() {
                                                            incomingCall.receiveBye();

                                                            tester.slavesNotification().available().userDataFetched().
                                                                twoChannels().ended().expectToBeSent();

                                                            incomingCall = tester.incomingCall().receive();
                                                            tester.slavesNotification().available().userDataFetched().
                                                                twoChannels().incoming().progress().expectToBeSent();

                                                            tester.numaRequest().receiveResponse();

                                                            tester.outCallEvent().receive();
                                                            tester.outCallEvent().slavesNotification().expectToBeSent();

                                                            tester.callStartingButton.click();

                                                            tester.secondConnection.connectWebRTC();
                                                            tester.secondConnection.callTrackHandler();

                                                            tester.allowMediaInput();
                                                            tester.secondConnection.addCandidate();

                                                            incomingCall.expectOkToBeSent();
                                                            tester.slavesNotification().available().userDataFetched().
                                                                twoChannels().incoming().confirmed().expectToBeSent();

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
                                                        tester.slavesNotification().available().userDataFetched().
                                                            twoChannels().incoming().confirmed().holded().
                                                            expectToBeSent();

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
                                                            'Шалева Дора +7 (916) 123-45-67 00:00'
                                                        );
                                                    });
                                                });
                                                describe(
                                                    'Сворачиваю софтфон. Звонок отменен. Разворачиваю софтфон. ' +
                                                    'Поступает входящий звонок.',
                                                function() {
                                                    beforeEach(function() {
                                                        tester.collapsednessToggleButton.click();
                                                        incomingCall.receiveCancel();

                                                        tester.slavesNotification().available().userDataFetched().
                                                            twoChannels().failed().expectToBeSent();

                                                        tester.collapsednessToggleButton.click();

                                                        incomingCall = tester.incomingCall().receive();

                                                        tester.slavesNotification().available().userDataFetched().
                                                            twoChannels().incoming().progress().expectToBeSent();

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

                                                        incomingCall.expectOkToBeSent();
                                                        tester.slavesNotification().available().userDataFetched().
                                                            twoChannels().incoming().confirmed().expectToBeSent();

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
                                                        userDataFetched().
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
                                                    tester.outCallEvent().anotherPerson().receive();
                                                    tester.outCallEvent().anotherPerson().slavesNotification().
                                                        expectToBeSent();

                                                    tester.body.expectTextContentToHaveSubstring(
                                                        'Гигова Петранка Входящий...'
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

                                                    tester.collapsednessToggleButton.
                                                        expectToHaveClass('expand_svg__cmg-expand-icon');

                                                    tester.softphone.expectTextContentNotToHaveSubstring('Путь лида');
                                                });
                                                it('Отображена информация о контакте.', function() {
                                                    tester.collapsednessToggleButton.
                                                        expectToHaveClass('collapse_svg__cmg-collapse-icon');

                                                    tester.contactOpeningButton.
                                                        expectNotToHaveClass('cmg-button-disabled');
                                                    tester.incomingIcon.expectToBeVisible();

                                                    tester.softphone.expectTextContentToHaveSubstring(
                                                        'Шалева Дора +7 (916) 123-45-67 ' +
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

                                                        incomingCall.expectOkToBeSent();
                                                        tester.slavesNotification().available().userDataFetched().
                                                            twoChannels().incoming().confirmed().expectToBeSent();

                                                        tester.transferIncomingIcon.expectToBeVisible();
                                                        tester.softphone.expectTextContentToHaveSubstring(
                                                            'Шалева Дора +7 (916) 123-45-67 00:00'
                                                        );
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

                                                    incomingCall.expectOkToBeSent();
                                                    tester.slavesNotification().available().userDataFetched().
                                                        twoChannels().incoming().confirmed().expectToBeSent();

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
                                            it(
                                                'Контакт не найден. Отображно направление звонка. Кнопка открытия ' +
                                                'контакта заблокирована.',
                                            function() {
                                                tester.outCallEvent().noName().noCrmContactLink().receive();
                                                tester.outCallEvent().noName().noCrmContactLink().slavesNotification().
                                                    expectToBeSent();

                                                tester.contactOpeningButton.click();

                                                tester.contactOpeningButton.expectToHaveClass('cmg-button-disabled');
                                                windowOpener.expectNoWindowToBeOpened();

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
                                                tester.outCallEvent().clickToCall().slavesNotification().
                                                    expectToBeSent();

                                                tester.outgoingIcon.expectToBeVisible();
                                            });
                                            it('Открытые сделки существуют. Открытые сделки отображены.', function() {
                                                tester.outCallEvent().activeLeads().receive();
                                                tester.outCallEvent().activeLeads().slavesNotification().
                                                    expectToBeSent();


                                                tester.anchor('По звонку с 79154394340').click();

                                                windowOpener.expectToHavePath(
                                                    'https://comagicwidgets.amocrm.ru/leads/detail/3003651'
                                                );
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
                                                tester.slavesNotification().available().userDataFetched().twoChannels().
                                                    failed().expectToBeSent();

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
                                        xdescribe(
                                            'Нажимаю на кнопку "Настройки". Нажимаю на кнопку "Софтфон".',
                                        function() {
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
                                                            tester.settingsUpdatingRequest().isNeedDisconnectSignal().
                                                                receiveResponse();
                                                            tester.settingsRequest().isNeedDisconnectSignal().
                                                                receiveResponse();

                                                            tester.othersNotification().widgetStateUpdate().
                                                                expectToBeSent();
                                                            tester.othersNotification().updateSettings().
                                                                shouldPlayCallEndingSignal().expectToBeSent();

                                                            tester.fieldRow('Мелодия звонка').select.arrow.click();
                                                            tester.select.option('Мелодия звонка 2').click();

                                                            tester.settingsUpdatingRequest().secondRingtone().
                                                                receiveResponse();
                                                            tester.settingsRequest().secondRingtone().
                                                                isNeedDisconnectSignal().receiveResponse();

                                                            tester.othersNotification().widgetStateUpdate().
                                                                expectToBeSent();
                                                            tester.othersNotification().updateSettings().
                                                                shouldPlayCallEndingSignal().incomingRingtone().
                                                                expectToBeSent();

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
                                                                let incomingCall;

                                                                beforeEach(function() {
                                                                    incomingCall = tester.incomingCall().receive();

                                                                    tester.slavesNotification().available().
                                                                        userDataFetched().twoChannels().incoming().
                                                                        progress().expectToBeSent();

                                                                    tester.numaRequest().receiveResponse();

                                                                    tester.outCallEvent().receive();
                                                                    tester.outCallEvent().slavesNotification().
                                                                        expectToBeSent();
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
                                                                    incomingCall.expectOkToBeSent();

                                                                    tester.slavesNotification().available().
                                                                        userDataFetched().twoChannels().incoming().
                                                                        confirmed().expectToBeSent();

                                                                    tester.firstConnection.expectSinkIdToEqual(
                                                                        'g8294gjg29guslg82pgj2og8ogjwog8u29gj0pagulo4' +
                                                                        '8g92gj28ogtjog82jgab');

                                                                    tester.expectMicrophoneDeviceIdToEqual(
                                                                        mediaStream, 

                                                                        '98g2j2pg9842gi2gh89hl48ogh2og82h9g724hg427gl' +
                                                                        'a8g2hg289hg9a48ghal4'
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

                                                                        '6943f509802439f2c170bea3f42991df56faee134b2' +
                                                                        '5b3a2f2a13f0fad6943ab'
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
                                                                                deviceId: '98g2j2pg9842gi2gh89hl48ogh' +
                                                                                    '2og82h9g724hg427gla8g2hg289hg9a4' +
                                                                                    '8ghal4'
                                                                            },
                                                                            ringtone: {
                                                                                deviceId: '6943f509802439f2c170bea3f4' +
                                                                                    '2991df56faee134b25b3a2f2a13f0fad' +
                                                                                    '6943ab',
                                                                                volume: 25
                                                                            },
                                                                            outputDeviceId: 'g8294gjg29guslg82pgj2og8' +
                                                                                'ogjwog8u29gj0pagulo48g92gj28ogtjog82' +
                                                                                'jgab'
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
                                                                    deviceId: '98g2j2pg9842gi2gh89hl48ogh' +
                                                                        '2og82h9g724hg427gla8g2hg289hg9a4' +
                                                                        '8ghal4'
                                                                },
                                                                ringtone: {
                                                                    deviceId: '6943f509802439f2c170bea3f4' +
                                                                        '2991df56faee134b25b3a2f2a13f0fad' +
                                                                        '6943ab',
                                                                    volume: 25,
                                                                    value: 'default'
                                                                },
                                                                outputDeviceId: 'g8294gjg29guslg82pgj2og8' +
                                                                    'ogjwog8u29gj0pagulo48g92gj28ogtjog82' +
                                                                    'jgab'
                                                            }
                                                        );
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

                                                    tester.slavesNotification().userDataFetched().twoChannels().
                                                        disabled().microphoneAccessGranted().softphoneServerConnected().
                                                        expectToBeSent();

                                                    tester.othersNotification().widgetStateUpdate().
                                                        isNotUsingWidgetForCalls().expectToBeSent();

                                                    tester.othersNotification().updateSettings().
                                                        shouldNotPlayCallEndingSignal().expectToBeSent();

                                                    tester.registrationRequest().expired().receiveResponse();
                                                });

                                                it(
                                                    'Выбираю текущее устройство. Новый вебсокет открыт. Старый ' +
                                                    'Вебсокет закрыт. Сообщение "Устанавливается соединение..." ' +
                                                    'скрыто.',
                                                function() {
                                                    tester.button('Текущее устройство').click();
                                                    
                                                    tester.settingsUpdatingRequest().receiveResponse();
                                                    tester.settingsRequest().dontTriggerScrollRecalculation().
                                                        receiveResponse();

                                                    tester.slavesNotification().userDataFetched().twoChannels().
                                                        enabled().softphoneServerConnected().microphoneAccessGranted().
                                                        expectToBeSent();

                                                    tester.othersNotification().widgetStateUpdate().expectToBeSent();
                                                    tester.othersNotification().updateSettings().
                                                        shouldNotPlayCallEndingSignal().expectToBeSent();

                                                    tester.connectSIPWebSocket(1);
                                                    tester.slavesNotification().userDataFetched().twoChannels().
                                                        webRTCServerConnected().softphoneServerConnected().
                                                        microphoneAccessGranted().expectToBeSent();

                                                    tester.registrationRequest().receiveResponse();
                                                    tester.slavesNotification().userDataFetched().twoChannels().
                                                        available().expectToBeSent();

                                                    tester.button('Софтфон').click();
                                                    tester.slavesNotification().additional().visible().expectToBeSent();

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
                                        xdescribe('Браузер скрыт.', function() {
                                            beforeEach(function() {
                                                setDocumentVisible(false);

                                                tester.slavesNotification().userDataFetched().twoChannels().available().
                                                    hidden().expectToBeSent();
                                            });

                                            describe('Открывается новая вкладка.', function() {
                                                beforeEach(function() {
                                                    tester.masterNotification().tabOpened().receive();

                                                    tester.slavesNotification().userDataFetched().twoChannels().
                                                        available().expectToBeSent();
                                                    tester.slavesNotification().additional().expectToBeSent();
                                                });

                                                describe('Вкладка скрыта.', function() {
                                                    beforeEach(function() {
                                                        tester.masterNotification().tabBecameHidden().receive();

                                                        tester.slavesNotification().userDataFetched().twoChannels().
                                                            available().hidden().expectToBeSent();
                                                    });

                                                    it(
                                                        'Вкладка снова открыта. Поступил входящий звонок. браузерное ' +
                                                        'уведомление не отображено.',
                                                    function() {
                                                        tester.masterNotification().tabBecameVisible().receive();

                                                        tester.slavesNotification().userDataFetched().twoChannels().
                                                            available().expectToBeSent();

                                                        tester.incomingCall().receive();
                                                        tester.slavesNotification().available().userDataFetched().
                                                            twoChannels().incoming().progress().expectToBeSent();

                                                        tester.numaRequest().receiveResponse();

                                                        tester.outCallEvent().receive();
                                                        tester.outCallEvent().slavesNotification().expectToBeSent();
                                                    });
                                                    it(
                                                        'Поступил входящий звонок. Отображено браузерное уведомление.',
                                                    function() {
                                                        tester.incomingCall().receive();
                                                        tester.slavesNotification().available().userDataFetched().
                                                            twoChannels().incoming().progress().hidden().
                                                            expectToBeSent();

                                                        tester.numaRequest().receiveResponse();

                                                        tester.outCallEvent().receive();
                                                        tester.outCallEvent().slavesNotification().expectToBeSent();

                                                        notificationTester.grantPermission().
                                                            recentNotification().
                                                            expectToHaveTitle('Входящий звонок').
                                                            expectToHaveBody('Шалева Дора +7 (916) 123-45-67').
                                                            expectToBeOpened();
                                                    });
                                                });
                                                it(
                                                    'Поступил входящий звонок. браузерное уведомление не отображено.',
                                                function() {
                                                    tester.incomingCall().receive();
                                                    tester.slavesNotification().available().userDataFetched().
                                                        twoChannels().incoming().progress().expectToBeSent();

                                                    tester.numaRequest().receiveResponse();

                                                    tester.outCallEvent().receive();
                                                    tester.outCallEvent().slavesNotification().expectToBeSent();
                                                });
                                            });
                                            it(
                                                'Вкладка снова открыта. Поступил входящий звонок. браузерное ' +
                                                'уведомление не отображено.',
                                            function() {
                                                setDocumentVisible(true);

                                                tester.slavesNotification().userDataFetched().twoChannels().available().
                                                    expectToBeSent();

                                                tester.incomingCall().receive();
                                                tester.slavesNotification().available().userDataFetched().twoChannels().
                                                    incoming().progress().expectToBeSent();

                                                tester.numaRequest().receiveResponse();

                                                tester.outCallEvent().receive();
                                                tester.outCallEvent().slavesNotification().expectToBeSent();
                                            });
                                            it(
                                                'Поступил входящий звонок. Отображено браузерное уведомление.',
                                            function() {
                                                tester.incomingCall().receive();
                                                tester.slavesNotification().available().userDataFetched().twoChannels().
                                                    incoming().progress().hidden().expectToBeSent();

                                                tester.numaRequest().receiveResponse();

                                                tester.outCallEvent().receive();
                                                tester.outCallEvent().slavesNotification().expectToBeSent();

                                                notificationTester.grantPermission().
                                                    recentNotification().
                                                    expectToHaveTitle('Входящий звонок').
                                                    expectToHaveBody('Шалева Дора +7 (916) 123-45-67').
                                                    expectToBeOpened();
                                            });
                                        });
                                        describe('Открываю раздел "История звонков".', function() {
                                            beforeEach(function() {
                                                tester.button('История звонков').click();

                                                tester.callsRequest().receiveResponse();
                                                tester.marksRequest().receiveResponse();
                                            });

                                            xdescribe('Нажимаю на кнопку "Необработанные".', function() {
                                                beforeEach(function() {
                                                    tester.radioButton('Необработанные').click();

                                                    tester.groupsRequest().receiveResponse();
                                                    tester.notProcessedCallsRequest().isProcessedByAny().
                                                        receiveResponse();
                                                    tester.marksRequest().receiveResponse();
                                                });

                                                describe('Открываю выпадающий список "Звонки".', function() {
                                                    beforeEach(function() {
                                                        tester.select.withValue('Звонки: Все').click();
                                                    });

                                                    it(
                                                        'Выбираю опцию "Внешние". Отправлен запрос истории звонков.',
                                                    function() {
                                                        tester.select.option('Внешние').click();

                                                        tester.notProcessedCallsRequest().isProcessedByAny().external().
                                                            receiveResponse();
                                                        tester.marksRequest().receiveResponse();
                                                    });
                                                    it(
                                                        'Выбираю опцию "Внутренние". Отправлен запрос истории звонков.',
                                                    function() {
                                                        tester.select.option('Внутренние').click();

                                                        tester.notProcessedCallsRequest().isProcessedByAny().internal().
                                                            receiveResponse();
                                                        tester.marksRequest().receiveResponse();
                                                    });
                                                });
                                                describe('Открываю выпадающий список "Направления".', function() {
                                                    beforeEach(function() {
                                                        tester.select.withValue('Направления: Все').click();
                                                    });

                                                    it(
                                                        'Выбираю опцию "Входящие". Отправлен запрос истории звонков.',
                                                    function() {
                                                        tester.select.option('Входящие').click();

                                                        tester.notProcessedCallsRequest().isProcessedByAny().incoming().
                                                            receiveResponse();
                                                        tester.marksRequest().receiveResponse();
                                                    });
                                                    it(
                                                        'Выбираю опцию "Исходящие". Отправлен запрос истории звонков.',
                                                    function() {
                                                        tester.select.option('Исходящие').click();

                                                        tester.notProcessedCallsRequest().isProcessedByAny().outgoing().
                                                            receiveResponse();
                                                        tester.marksRequest().receiveResponse();
                                                    });
                                                });
                                                it('Выбираю группы. Отправлен запрос истории звонков.', function() {
                                                    tester.select.withPlaceholder('Группы').click();

                                                    tester.select.option('Отдел дистрибуции').click();

                                                    tester.notProcessedCallsRequest().isProcessedByAny().group().
                                                        receiveResponse();
                                                    tester.marksRequest().receiveResponse();

                                                    tester.select.option('Отдел по работе с ключевыми клиентами').
                                                        click();

                                                    tester.notProcessedCallsRequest().isProcessedByAny().group().
                                                        thirdGroup().receiveResponse();
                                                    tester.marksRequest().receiveResponse();

                                                    tester.select.option('Отдел дистрибуции').expectToBeSelected();
                                                    tester.select.option('Отдел региональных продаж').
                                                        expectNotToBeSelected();
                                                    tester.select.option('Отдел по работе с ключевыми клиентами').
                                                        expectToBeSelected(true);
                                                });
                                                it(
                                                    'Снимаю отметку со свитчбокса. Отправлен запрос истории звонков.',
                                                function() {
                                                    tester.switchButton.click();

                                                    tester.notProcessedCallsRequest().isNotProcessedByAny().
                                                        receiveResponse();
                                                    tester.marksRequest().receiveResponse();

                                                    tester.switchButton.expectNotToBeChecked();
                                                });
                                                it('Отображена история звонков.', function() {
                                                    tester.radioButton('Мои').expectNotToBeSelected();
                                                    tester.radioButton('Все').expectNotToBeSelected();
                                                    tester.radioButton('Необработанные').expectToBeSelected();

                                                    tester.switchButton.expectToBeChecked();

                                                    tester.table.expectTextContentToHaveSubstring(
                                                        'Дата / время ' +
                                                        'Номер абонента ' +
                                                        'Виртуальный номер ' +
                                                        'Длительность ' +

                                                        '19 дек 2019 08:03 ' +
                                                        '+7 (495) 023-06-25 ' +
                                                        '+7 (495) 023-06-30 ' +
                                                        '00:00:20 ' +

                                                        '19 дек 2019 10:13 ' +
                                                        '+7 (495) 023-06-26 ' +
                                                        '+7 (495) 023-06-31 ' +
                                                        '00:00:24'
                                                    );
                                                });
                                            });
                                            xdescribe('Нажимаю на кнопку тегов.', function() {
                                                beforeEach(function() {
                                                    tester.table.row.first.column.withHeader('Теги').svg.click();
                                                });

                                                it('Изменяю теги. Теги изменены.', function() {
                                                    tester.select.option('Генератор лидов').click();
                                                    tester.markAddingRequest().receiveResponse();

                                                    tester.select.option('Нецелевой контакт').click();
                                                    tester.markDeletingRequest().receiveResponse();

                                                    tester.select.option('Генератор лидов').expectToBeSelected();
                                                    tester.select.option('Нецелевой контакт').expectNotToBeSelected();
                                                    tester.select.option('Отложенный звонок').expectToBeSelected();

                                                    tester.table.expectTextContentToHaveSubstring(
                                                        'Дата / время ' +
                                                        'ФИО контакта ' +
                                                        'Номер абонента ' +
                                                        'Теги ' +
                                                        'Длительность ' +

                                                        '19 дек 2019 08:03 ' +
                                                        'Гяурова Марийка ' +
                                                        '+7 (495) 023-06-25 ' +
                                                        'Отложенный звонок, Генератор лидов ' +
                                                        '00:00:20 ' +

                                                        '18 дек 2019 18:08 ' +
                                                        'Манова Тома ' +
                                                        '+7 (495) 023-06-26 ' +
                                                        '00:00:21'
                                                    );
                                                });
                                                it('Ввожу значеиние в поле поиска. Теги отфильтрованы.', function() {
                                                    tester.input.withPlaceholder('Найти').fill('не');

                                                    tester.input.withPlaceholder('Найти').expectToHaveValue('не');
                                                    tester.select.option('Отложенный звонок').expectNotToExist();
                                                    tester.select.option('Нецелевой контакт').expectToBeVisible();
                                                });
                                                it('Отмечены опции выранных тегов.', function() {
                                                    tester.select.option('Генератор лидов').expectNotToBeSelected();
                                                    tester.select.option('Нецелевой контакт').expectToBeSelected();
                                                    tester.select.option('Отложенный звонок').expectToBeSelected();
                                                });
                                            });
                                            xit(
                                                'Нажимаю на кнопку "Все". Отправлен запрос истории звонков.',
                                            function() {
                                                tester.radioButton('Все').click();

                                                tester.notProcessedCallsRequest().receiveResponse();
                                                tester.marksRequest().receiveResponse();

                                                tester.radioButton('Мои').expectNotToBeSelected();
                                                tester.radioButton('Все').expectToBeSelected();
                                                tester.radioButton('Необработанные').expectNotToBeSelected();

                                                tester.table.expectTextContentToHaveSubstring(
                                                    'Дата / время ' +
                                                    'Номер абонента ' +
                                                    'Виртуальный номер ' +
                                                    'Длительность ' +

                                                    '19 дек 2019 08:03 ' +
                                                    '+7 (495) 023-06-25 ' +
                                                    '+7 (495) 023-06-30 ' +
                                                    '00:00:20 ' +

                                                    '19 дек 2019 10:13 ' +
                                                    '+7 (495) 023-06-26 ' +
                                                    '+7 (495) 023-06-31 ' +
                                                    '00:00:24'
                                                );
                                            });
                                            xit(
                                                'Изменяю фильтр по дате. Отправлен запрос истории звонков.',
                                            function() {
                                                tester.calendarField.click();
                                                tester.calendarField.popup.leftButton.click();

                                                tester.calendarField.popup.firstMonthPanel.day(15).click();
                                                tester.calendarField.popup.secondMonthPanel.day(18).click();

                                                tester.calendarField.popup.button('Применить').click();

                                                tester.callsRequest().changeDate().receiveResponse();
                                                tester.marksRequest().receiveResponse();

                                                tester.calendarField.expectToHaveValue('15 ноя 2019 - 18 дек 2019');
                                            });
                                            xit(
                                                'Ввожу значеие в поле поиска. Отправлен запрос истории звонков.',
                                            function() {
                                                tester.input.fill('qwe123');
                                                tester.callsRequest().search('qwe123').receiveResponse();
                                            });
                                            it('Нажимаю на кнопку комментария. Изменяю значение поля.', function() {
                                                tester.table.row.first.column.withHeader('Комментарий').svg.click();
                                                tester.modalWindowBody.textarea.fill('Другой комментарий');

                                                tester.button('Сохранить').click();
                                                tester.commentUpdatingRequest().receiveResponse();
                                            });
                                            return;
                                            it('Отображена история звонков.', function() {
                                                tester.calendarField.expectToHaveValue('16 дек 2019 - 19 дек 2019');

                                                tester.radioButton('Мои').expectToBeSelected();
                                                tester.radioButton('Все').expectNotToBeSelected();
                                                tester.radioButton('Необработанные').expectNotToBeSelected();

                                                tester.select.withValue('Звонки: Все').expectToBeDisaled();
                                                tester.select.withValue('Направления: Все').expectToBeDisaled();
                                                tester.select.withPlaceholder('Группы').expectToBeDisaled();
                                                tester.switchButton.expectToBeDisaled();

                                                tester.table.expectTextContentToHaveSubstring(
                                                    'Дата / время ' +
                                                    'ФИО контакта ' +
                                                    'Номер абонента ' +
                                                    'Теги ' +
                                                    'Комментарий ' +
                                                    'Длительность ' +

                                                    '19 дек 2019 08:03 ' +
                                                    'Гяурова Марийка ' +
                                                    '+7 (495) 023-06-25 ' +
                                                    'Нецелевой контакт, Отложенный звонок ' +
                                                    '00:00:20 ' +

                                                    '18 дек 2019 18:08 ' +
                                                    'Манова Тома ' +
                                                    '+7 (495) 023-06-26 ' +
                                                    '00:00:21'
                                                );
                                            });
                                        });
                                    });
                                    return;
                                    describe('Нажимаю на иконку с телефоном.', function() {
                                        beforeEach(function() {
                                            tester.button('Софтфон').click();
                                            tester.slavesNotification().additional().visible().expectToBeSent();
                                        });

                                        describe('Ввожу номер телефона.', function() {
                                            beforeEach(function() {
                                                tester.phoneField.fill('79161234567');
                                            });

                                            describe(
                                                'SIP-регистрация завершена. Нажимаю на кнпоку вызова.',
                                            function() {
                                                let numaRequest,
                                                    outboundCall;

                                                beforeEach(function() {
                                                    registrationRequest.receiveResponse();
                                                    tester.slavesNotification().userDataFetched().twoChannels().
                                                        available().expectToBeSent();

                                                    tester.callStartingButton.click();
                                                    
                                                    tester.firstConnection.connectWebRTC();
                                                    tester.allowMediaInput();

                                                    outboundCall = tester.outboundCall().expectToBeSent()
                                                    tester.slavesNotification().available().userDataFetched().
                                                        twoChannels().sending().expectToBeSent();

                                                    outboundCall.setRinging();
                                                    tester.slavesNotification().available().userDataFetched().
                                                        twoChannels().progress().expectToBeSent();
                                                    
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

                                                                tester.outCallSessionEvent().slavesNotification().
                                                                    expectToBeSent();
                                                            });

                                                            describe('Звонок принят.', function() {
                                                                beforeEach(function() {
                                                                    outboundCall.setAccepted();

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

                                                                        tester.outCallEvent().anotherPerson().receive();
                                                                        tester.outCallEvent().anotherPerson().
                                                                            slavesNotification().expectToBeSent();
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

                                                                        incomingCall.expectOkToBeSent();

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

                                                                        audioDecodingTester.accomplishAudioDecoding();

                                                                        tester.firstConnection.expectHoldMusicToPlay();
                                                                        tester.secondConnection.
                                                                            expectRemoteStreamToPlay();

                                                                        tester.softphone.
                                                                            expectTextContentToHaveSubstring(
                                                                                'Гигова Петранка ' +
                                                                                '+7 (916) 123-45-10 00:00'
                                                                            );
                                                                    });
                                                                    it(
                                                                        'Нажимаю на кнопку второй линии. Принимаю ' +
                                                                        'звонок на второй линии. Отображаются данные ' +
                                                                        'о звонке.',
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

                                                                        incomingCall.expectOkToBeSent();

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

                                                                        audioDecodingTester.accomplishAudioDecoding();

                                                                        tester.firstConnection.expectHoldMusicToPlay();
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
                                                                    it('Отображено сообщение о звонке.', function() {
                                                                        tester.body.expectTextContentToHaveSubstring(
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
                                                                        '+7 (916) 123-45-67 00:00'
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
                                                                    
                                                                    tester.numaRequest().thirdNumber().
                                                                        receiveResponse();

                                                                    tester.outCallEvent().anotherPerson().receive();
                                                                    tester.outCallEvent().anotherPerson().
                                                                        slavesNotification().expectToBeSent();
                                                                });

                                                                it(
                                                                    'Вызываемый занят. Отображено сообщение о звонке.',
                                                                function() {
                                                                    outboundCall.receiveBusy();

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
                                                                        'Гигова Петранка Входящий...'
                                                                    );
                                                                });
                                                                it(
                                                                    'Нажимаю на кнопку отклонения звонка на второй ' +
                                                                    'линии.',
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

                                                                    incomingCall.expectTemporarilyUnavailableToBeSent();

                                                                    tester.softphone.expectToHaveTextContent(
                                                                        'Шалева Дора ' +
                                                                        '+7 (916) 123-45-67 00:00'
                                                                    );
                                                                });
                                                                it(
                                                                    'Нажимаю на кнопку второй линии. Кнпока принятия ' +
                                                                    'звонка заблокирована.',
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

                                                                    tester.otherChannelCallNotification.
                                                                        callStartingButton.
                                                                        expectToHaveClass('cmg-button-disabled');

                                                                    tester.firstConnection.expectRemoteStreamToPlay();

                                                                    tester.softphone.expectTextContentToHaveSubstring(
                                                                        'Шалева Дора ' +
                                                                        '+7 (916) 123-45-67 00:00'
                                                                    );
                                                                });
                                                            });
                                                            it(
                                                                'Нажимаю на кнопку остановки звонка. Ввожу тот же ' +
                                                                'самый номер. Отображается поле номера.',
                                                            function() {
                                                                tester.stopCallButton.click();

                                                                tester.slavesNotification().
                                                                    available().
                                                                    userDataFetched().
                                                                    twoChannels().
                                                                    ended().
                                                                    expectToBeSent();

                                                                outboundCall.expectCancelingRequestToBeSent();
                                                                tester.callSessionFinish().thirdId().
                                                                    slavesNotification().expectToBeSent();

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
                                                        it(
                                                            'Есть активные сделки. Отображены активные сделки.',
                                                        function() {
                                                            outCallSessionEvent.activeLeads().receive();
                                                            tester.outCallSessionEvent().activeLeads().
                                                                slavesNotification().expectToBeSent();

                                                            tester.softphone.expectToBeExpanded();

                                                            tester.anchor('По звонку с 79154394340').
                                                                expectHrefToHavePath(
                                                                    'https://comagicwidgets.amocrm.ru/leads/detail/' +
                                                                    '3003651'
                                                                );
                                                        });
                                                    });
                                                    it('Данные контакта не найдены.', function() {
                                                        tester.outCallSessionEvent().noName().receive();
                                                        tester.outCallSessionEvent().noName().
                                                            slavesNotification().expectToBeSent();

                                                        tester.outgoingIcon.expectToBeVisible();
                                                        tester.softphone.expectTextContentToHaveSubstring(
                                                            '+7 (916) 123-45-67 Исходящий звонок 00:00'
                                                        );
                                                    });
                                                    it(
                                                        'Отображен номер, таймер, направление и сообщение о поиске ' +
                                                        'контакта.',
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

                                                        outboundCall.expectCancelingRequestToBeSent();

                                                        tester.callSessionFinish().thirdId().slavesNotification().
                                                            expectToBeSent();

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
                                            it('Нажимаю на кнопку удаления цифры. Цифра удалена.', function() {
                                                tester.digitRemovingButton.click();
                                                tester.phoneField.fill('7916123456');
                                            });
                                            it('Кнопка вызова заблокирована.', function() {
                                                tester.callStartingButton.expectToHaveAttribute('disabled');
                                            });
                                        });
                                        describe('SIP-регистрация завершена.', function() {
                                            beforeEach(function() {
                                                registrationRequest.receiveResponse();

                                                tester.slavesNotification().userDataFetched().twoChannels().available().
                                                    expectToBeSent();
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

                                                            tester.slavesNotification().
                                                                twoChannels().
                                                                webRTCServerConnected().
                                                                registered().
                                                                microphoneAccessGranted().
                                                                userDataFetched().
                                                                expectToBeSent();
                                                        });

                                                        describe('Нажимаю на кнопку закрытия сообщения.', function() {
                                                            beforeEach(function() {
                                                                tester.closeButton.click();
                                                            });

                                                            it(
                                                                'Соединение востановлено и снова разорвано. ' +
                                                                'Отображено сообщение о разрыве сети.',
                                                            function() {
                                                                spendTime(1001);
                                                                Promise.runAll(false, true);

                                                                tester.connectEventsWebSocket(1);
                                                                Promise.runAll(false, true);
                                                                tester.authenticatedUserRequest().receiveResponse();

                                                                tester.slavesNotification().
                                                                    twoChannels().
                                                                    available().
                                                                    userDataFetched().
                                                                    expectToBeSent();

                                                                tester.disconnectEventsWebSocket(1);

                                                                tester.slavesNotification().
                                                                    twoChannels().
                                                                    registered().
                                                                    webRTCServerConnected().
                                                                    microphoneAccessGranted().
                                                                    userDataFetched().
                                                                    expectToBeSent();

                                                                tester.softphone.
                                                                    expectTextContentToHaveSubstring('Разрыв сети');
                                                            });
                                                            it('Сообщение скрыто.', function() {
                                                                tester.softphone.
                                                                    expectTextContentNotToHaveSubstring('Разрыв сети');
                                                            });
                                                        });
                                                        it(
                                                            'Кнопка звонка заблокирована. Отображено сообщение о ' +
                                                            'разрыве сети.',
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
                                                        tester.callsHistoryRow.withText('Гяурова Марийка').callIcon.
                                                            click();

                                                        tester.firstConnection.connectWebRTC();
                                                        tester.firstConnection.callTrackHandler();
                                                        tester.allowMediaInput();

                                                        tester.numaRequest().anotherNumber().receiveResponse();

                                                        const outboundCall = tester.outboundCall().
                                                            setNumberFromCallsGrid().expectToBeSent();

                                                        tester.slavesNotification().available().userDataFetched().
                                                            twoChannels().sending().thirdPhoneNumber().expectToBeSent();

                                                        outboundCall.setRinging();
                                                        tester.slavesNotification().available().userDataFetched().
                                                            twoChannels().progress().thirdPhoneNumber().
                                                            expectToBeSent();

                                                        tester.callStartingButton.expectToBeVisible();
                                                    });
                                                    it('Нажимаю на имя. Открыта страница контакта.', function() {
                                                        tester.callsHistoryRow.withText('Гяурова Марийка').name.click();

                                                        windowOpener.expectToHavePath(
                                                            'https://comagicwidgets.amocrm.ru/contacts/detail/218401'
                                                        );
                                                    });
                                                    it(
                                                        'Нажимаю на кнопку сворачивания софтфона. Отображено поле ' +
                                                        'для ввода телефона.',
                                                    function() {
                                                        tester.collapsednessToggleButton.click();
                                                        tester.phoneField.expectToBeVisible();
                                                    });
                                                    it(
                                                        'Нажимаю на кнопку первой линии. Отображено поле для ввода ' +
                                                        'номера.',
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
                                                it(
                                                    'Звонок является трансфером. Отображена иконка трансфера.',
                                                function() {
                                                    callsRequest.transfer().receiveResponse();

                                                    tester.callsHistoryRow.withText('Гяурова Марийка').directory.
                                                        expectToHaveClass('cmg-direction-transfer');
                                                });
                                                it(
                                                    
                                                    'Не было ни одного звонка. Отображено сообщение об отсутствии ' +
                                                    'звонков.',
                                                function() {
                                                    callsRequest.noCalls().receiveResponse();

                                                    tester.softphone.expectToHaveTextContent(
                                                        'Совершите звонок для отображения истории'
                                                    );
                                                });
                                            });
                                            describe('Нажимаю на кнопку "Выход". Вхожу в лк заново.', function() {
                                                beforeEach(function() {
                                                    tester.userName.putMouseOver();
                                                    tester.logoutButton.click();

                                                    tester.userLogoutRequest().receiveResponse();

                                                    tester.slavesNotification().userDataFetched().twoChannels().
                                                        microphoneAccessGranted().destroyed().enabled().
                                                        expectToBeSent();

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
                                                    accountRequest = tester.accountRequest().
                                                        anotherAuthorizationToken().expectToBeSent();
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

                                                    tester.configRequest().softphone().receiveResponse();

                                                    tester.slavesNotification().expectToBeSent();
                                                    tester.slavesNotification().additional().visible().expectToBeSent();

                                                    const requests = ajax.inAnyOrder();

                                                    const secondAccountRequest = tester.accountRequest().
                                                        anotherAuthorizationToken().expectToBeSent(requests);
                                                    const authCheckRequest = tester.authCheckRequest().
                                                        anotherAuthorizationToken().expectToBeSent(requests);
                                                    const reportGroupsRequest = tester.reportGroupsRequest().
                                                        anotherAuthorizationToken().expectToBeSent(requests);
                                                    const reportsListRequest = tester.reportsListRequest().
                                                        expectToBeSent(requests);
                                                    const reportTypesRequest = tester.reportTypesRequest().
                                                        expectToBeSent(requests);

                                                    requests.expectToBeSent();

                                                    secondAccountRequest.receiveResponse();
                                                    authCheckRequest.receiveResponse();
                                                    reportGroupsRequest.receiveResponse();
                                                    reportsListRequest.receiveResponse();
                                                    reportTypesRequest.receiveResponse();

                                                    tester.statusesRequest().createExpectation().
                                                        anotherAuthorizationToken().checkCompliance().receiveResponse();

                                                    tester.settingsRequest().anotherAuthorizationToken().
                                                        receiveResponse();

                                                    tester.slavesNotification().twoChannels().enabled().
                                                        expectToBeSent();

                                                    tester.othersNotification().widgetStateUpdate().expectToBeSent();
                                                    tester.othersNotification().updateSettings().
                                                        shouldNotPlayCallEndingSignal().expectToBeSent();

                                                    tester.talkOptionsRequest().receiveResponse();
                                                    tester.permissionsRequest().receiveResponse();

                                                    tester.connectEventsWebSocket(1);
                                                    tester.slavesNotification().twoChannels().enabled().
                                                        softphoneServerConnected().expectToBeSent();

                                                    tester.connectSIPWebSocket(1);
                                                    tester.slavesNotification().twoChannels().
                                                        softphoneServerConnected().webRTCServerConnected().
                                                        expectToBeSent();

                                                    tester.authenticatedUserRequest().receiveResponse();
                                                    tester.slavesNotification().userDataFetched().twoChannels().
                                                        softphoneServerConnected().webRTCServerConnected().
                                                        expectToBeSent();

                                                    tester.registrationRequest().receiveResponse();
                                                    tester.slavesNotification().userDataFetched().twoChannels().
                                                        webRTCServerConnected().registered().softphoneServerConnected().
                                                        expectToBeSent();

                                                    tester.allowMediaInput();
                                                    tester.slavesNotification().userDataFetched().twoChannels().
                                                        available().expectToBeSent();

                                                    tester.callStartingButton.expectNotToHaveAttribute('disabled');
                                                    tester.button('Софтфон').expectToBeVisible();
                                                });
                                            });
                                            describe('Нажимаю на кнопку открытия диалпада.', function() {
                                                beforeEach(function() {
                                                    tester.dialpadVisibilityButton.click();
                                                });

                                                describe('Поступил входящий звонок.', function() {
                                                    let incomingCall;

                                                    beforeEach(function() {
                                                        incomingCall = tester.incomingCall().receive();
                                                        tester.slavesNotification().available().userDataFetched().
                                                            twoChannels().incoming().progress().expectToBeSent();

                                                        tester.numaRequest().receiveResponse();
                                                    });

                                                    describe('Поступили данные о звонке.', function() {
                                                        beforeEach(function() {
                                                            tester.outCallEvent().receive();
                                                            tester.outCallEvent().slavesNotification().expectToBeSent();
                                                        });

                                                        describe('Принимаю звонок.', function() {
                                                            beforeEach(function() {
                                                                tester.callButton.click();

                                                                tester.firstConnection.connectWebRTC();
                                                                tester.firstConnection.callTrackHandler();

                                                                tester.allowMediaInput();
                                                                tester.firstConnection.addCandidate();

                                                                incomingCall.expectOkToBeSent();
                                                                tester.slavesNotification().available().
                                                                    userDataFetched().twoChannels().incoming().
                                                                    confirmed().expectToBeSent();
                                                            });

                                                            describe('Нажимаю на кнопку сворачивания.', function() {
                                                                beforeEach(function() {
                                                                    tester.collapsednessToggleButton.click();
                                                                });
                                                                
                                                                it(
                                                                    'Нажимаю на кнопку разворачивания. Софтфон ' +
                                                                    'развернут.',
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
                                                            tester.softphone.expectTextContentToHaveSubstring(
                                                                'Путь лида'
                                                            );
                                                        });
                                                    });
                                                    it('Принимаю звонок. Диалпад разблокирован.', function() {
                                                        tester.callButton.click();

                                                        tester.firstConnection.connectWebRTC();
                                                        tester.firstConnection.callTrackHandler();

                                                        tester.allowMediaInput();
                                                        tester.firstConnection.addCandidate();

                                                        incomingCall.expectOkToBeSent();
                                                        tester.slavesNotification().available().userDataFetched().
                                                            twoChannels().incoming().confirmed().expectToBeSent();

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
                                                        tester.addressBookButton.
                                                            expectToHaveClass('cmg-button-pressed');
                                                    });
                                                    it(
                                                        'Нажимаю на кнопку первой линии. Софтфон развернут.',
                                                    function() {
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

                                                        outboundCall = tester.outboundCall().start();
                                                        tester.slavesNotification().available().userDataFetched().
                                                            twoChannels().sending().expectToBeSent();

                                                        outboundCall.setRinging();
                                                        tester.slavesNotification().available().userDataFetched().
                                                            twoChannels().progress().expectToBeSent();

                                                        tester.firstConnection.callTrackHandler();

                                                        tester.numaRequest().receiveResponse();
                                                        outCallSessionEvent = tester.outCallSessionEvent();
                                                    });

                                                    describe('Есть открытые сделки.', function() {
                                                        beforeEach(function() {
                                                            outCallSessionEvent.activeLeads().receive();

                                                            tester.outCallSessionEvent().activeLeads().
                                                                slavesNotification().expectToBeSent();
                                                        });

                                                        describe('Нажимаю на кнопку сворачивания.', function() {
                                                            beforeEach(function() {
                                                                tester.collapsednessToggleButton.click();
                                                            });

                                                            it(
                                                                'Нажимаю на кнопку разворачивания. Отображены ' +
                                                                'открытые сделки.',
                                                            function() {
                                                                tester.collapsednessToggleButton.click();

                                                                tester.anchor('По звонку с 79154394340').
                                                                    expectHrefToHavePath(
                                                                        'https://comagicwidgets.amocrm.ru/leads/' +
                                                                        'detail/3003651'
                                                                    );
                                                            });
                                                            it('Софтфон свернут.', function() {
                                                                tester.softphone.expectToBeCollapsed();
                                                            });
                                                        });
                                                        it('Отображены открытые сделки.', function() {
                                                            tester.softphone.expectToBeExpanded();
                                                            tester.anchor('По звонку с 79154394340').
                                                                expectHrefToHavePath(
                                                                    'https://comagicwidgets.amocrm.ru/leads/detail/' +
                                                                    '3003651'
                                                                );

                                                            tester.dialpadVisibilityButton.
                                                                expectToHaveClass('cmg-button-disabled');
                                                            tester.dialpadVisibilityButton.
                                                                expectNotToHaveClass('cmg-button-pressed');
                                                        });
                                                    });
                                                    it('Нет открытых сделки. Отображен диалпад.', function() {
                                                        outCallSessionEvent.receive();

                                                        tester.outCallSessionEvent().slavesNotification().
                                                            expectToBeSent();

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
                                                    tester.dialpadVisibilityButton.
                                                        expectToHaveClass('cmg-button-pressed');
                                                    tester.addressBookButton.expectNotToHaveClass('cmg-button-pressed');
                                                    tester.digitRemovingButton.expectToBeVisible();
                                                    tester.softphone.expectToBeExpanded();

                                                    if (localStorage.getItem('isSoftphoneHigh') != 'true') {
                                                        throw new Error(
                                                            'В локальном хранилище должна быть сохранена ' +
                                                            'развернутость софтфона.'
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

                                                        tester.slavesNotification().
                                                            userDataFetched().
                                                            twoChannels().
                                                            destroyed().
                                                            microphoneAccessGranted().
                                                            enabled().
                                                            expectToBeSent();

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

                                                        tester.configRequest().softphone().receiveResponse();

                                                        tester.slavesNotification().expectToBeSent();
                                                        tester.slavesNotification().additional().visible().
                                                            expectToBeSent();

                                                        const requests = ajax.inAnyOrder();

                                                        const reportGroupsRequest = tester.reportGroupsRequest().
                                                            expectToBeSent(requests);
                                                        const reportsListRequest = tester.reportsListRequest().
                                                            expectToBeSent(requests);
                                                        const reportTypesRequest = tester.reportTypesRequest().
                                                            expectToBeSent(requests);
                                                        const secondAccountRequest = tester.accountRequest().
                                                            expectToBeSent(requests);
                                                        const authCheckRequest = tester.authCheckRequest().
                                                            expectToBeSent(requests);

                                                        requests.expectToBeSent();

                                                        reportsListRequest.receiveResponse();
                                                        reportTypesRequest.receiveResponse();
                                                        secondAccountRequest.receiveResponse();
                                                        reportGroupsRequest.receiveResponse();
                                                        authCheckRequest.receiveResponse();

                                                        tester.statusesRequest().receiveResponse();
                                                        tester.settingsRequest().receiveResponse();

                                                        tester.slavesNotification().twoChannels().enabled().
                                                            expectToBeSent();

                                                        tester.othersNotification().widgetStateUpdate().
                                                            expectToBeSent();
                                                        tester.othersNotification().updateSettings().
                                                            shouldNotPlayCallEndingSignal().expectToBeSent();

                                                        tester.talkOptionsRequest().receiveResponse();
                                                        tester.permissionsRequest().receiveResponse();

                                                        tester.connectEventsWebSocket(1);
                                                        tester.slavesNotification().twoChannels().
                                                            softphoneServerConnected().enabled().expectToBeSent();

                                                        tester.connectSIPWebSocket(1);
                                                        tester.slavesNotification().twoChannels().
                                                            webRTCServerConnected().softphoneServerConnected().
                                                            expectToBeSent();

                                                        tester.authenticatedUserRequest().receiveResponse();
                                                        tester.slavesNotification().userDataFetched().twoChannels().
                                                            webRTCServerConnected().softphoneServerConnected().
                                                            expectToBeSent();

                                                        tester.registrationRequest().receiveResponse();
                                                        tester.slavesNotification().userDataFetched().twoChannels().
                                                            registered().softphoneServerConnected().
                                                            webRTCServerConnected().expectToBeSent();

                                                        tester.allowMediaInput();
                                                        tester.slavesNotification().userDataFetched().twoChannels().
                                                            available().expectToBeSent();

                                                        tester.phoneField.fill('79161234567');
                                                        tester.callButton.expectNotToHaveAttribute('disabled');
                                                    });
                                                    it('Другой статус выбран.', function() {
                                                        userStateUpdateRequest.receiveResponse();
                                                        tester.notificationOfUserStateChanging().anotherStatus().
                                                            receive();

                                                        tester.slavesNotification().twoChannels().available().
                                                            anotherStatus().expectToBeSent();

                                                        tester.statusesList.item('Не беспокоить').
                                                            expectNotToBeSelected();
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

                                                    tester.slavesNotification().
                                                        twoChannels().
                                                        registered().
                                                        webRTCServerConnected().
                                                        microphoneAccessGranted().
                                                        userDataFetched().
                                                        expectToBeSent();

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
                                            it(
                                                'Софтфон открыт в другом окне. Отображено сообщение о том, что ' +
                                                'софтфон открыт в другом окне.',
                                            function() {
                                                tester.eventsWebSocket.disconnect(4429);

                                                tester.slavesNotification().userDataFetched().twoChannels().destroyed().
                                                    enabled().microphoneAccessGranted().expectToBeSent();

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

                                                tester.slavesNotification().
                                                    twoChannels().
                                                    registered().
                                                    webRTCServerConnected().
                                                    microphoneAccessGranted().
                                                    userDataFetched().
                                                    expectToBeSent();

                                                tester.softphone.expectToHaveTextContent(
                                                    'Устанавливается соединение...'
                                                );
                                            });
                                            it(
                                                'Прошло некоторое время. Сервер событий не отвечает. Отображено ' +
                                                'сообщение об установке соединения.',
                                            function() {
                                                spendTime(5000);
                                                tester.expectPingToBeSent();
                                                spendTime(2000);

                                                tester.firstLineButton.expectToHaveClass('cmg-bottom-button-selected');

                                                tester.secondLineButton.expectNotToHaveClass(
                                                    'cmg-bottom-button-selected'
                                                );

                                                tester.softphone.expectToHaveTextContent(
                                                    'Устанавливается соединение...'
                                                );
                                            });
                                            it(
                                                'Перехожу на вторую линию. Выхожу и вхожу в софтфон заново. Активна ' +
                                                'первая линия.',
                                            function() {
                                                tester.secondLineButton.click();
                                                tester.slavesNotification().userDataFetched().twoChannels().
                                                    changedChannelToSecond().available().expectToBeSent();

                                                tester.userName.putMouseOver();

                                                tester.logoutButton.click();

                                                tester.userLogoutRequest().receiveResponse();
                                                tester.slavesNotification().userDataFetched().twoChannels().
                                                    changedChannelToSecond().destroyed().microphoneAccessGranted().
                                                    enabled().expectToBeSent();

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
                                                tester.accountRequest().anotherAuthorizationToken().receiveResponse();

                                                tester.configRequest().softphone().receiveResponse();

                                                tester.slavesNotification().expectToBeSent();
                                                tester.slavesNotification().additional().visible().expectToBeSent();

                                                const requests = ajax.inAnyOrder();

                                                const authCheckRequest = tester.authCheckRequest().
                                                    anotherAuthorizationToken().expectToBeSent(requests);
                                                const accountRequest = tester.accountRequest().
                                                    anotherAuthorizationToken().expectToBeSent(requests);
                                                const reportGroupsRequest = tester.reportGroupsRequest().
                                                    anotherAuthorizationToken().expectToBeSent(requests);
                                                const reportsListRequest = tester.reportsListRequest().
                                                    expectToBeSent(requests);
                                                const reportTypesRequest = tester.reportTypesRequest().
                                                    expectToBeSent(requests);

                                                requests.expectToBeSent();

                                                authCheckRequest.receiveResponse();
                                                accountRequest.receiveResponse();
                                                reportGroupsRequest.receiveResponse();
                                                reportsListRequest.receiveResponse();
                                                reportTypesRequest.receiveResponse();

                                                tester.statusesRequest().createExpectation().
                                                    anotherAuthorizationToken().checkCompliance().receiveResponse();

                                                tester.settingsRequest().anotherAuthorizationToken().receiveResponse();
                                                tester.slavesNotification().twoChannels().enabled().expectToBeSent();

                                                tester.othersNotification().widgetStateUpdate().expectToBeSent();
                                                tester.othersNotification().updateSettings().
                                                    shouldNotPlayCallEndingSignal().expectToBeSent();

                                                tester.talkOptionsRequest().receiveResponse();
                                                tester.permissionsRequest().receiveResponse();

                                                tester.connectEventsWebSocket(1);
                                                tester.slavesNotification().twoChannels().enabled().
                                                    softphoneServerConnected().expectToBeSent();

                                                tester.connectSIPWebSocket(1);
                                                tester.slavesNotification().twoChannels().webRTCServerConnected().
                                                    softphoneServerConnected().expectToBeSent();

                                                tester.authenticatedUserRequest().receiveResponse();
                                                tester.slavesNotification().userDataFetched().twoChannels().
                                                    webRTCServerConnected().softphoneServerConnected().expectToBeSent();

                                                tester.registrationRequest().receiveResponse();
                                                tester.slavesNotification().userDataFetched().twoChannels().
                                                    webRTCServerConnected().softphoneServerConnected().registered().
                                                    expectToBeSent();

                                                tester.allowMediaInput();
                                                tester.slavesNotification().userDataFetched().twoChannels().available().
                                                    expectToBeSent();

                                                tester.firstLineButton.expectToHaveClass('cmg-bottom-button-selected');
                                                
                                                tester.secondLineButton.expectNotToHaveClass(
                                                    'cmg-bottom-button-selected'
                                                );
                                            });
                                            it(
                                                'Нажимаю на кнопку перехвата. Совершается исходящий звонок на номер ' +
                                                '88.',
                                            function() {
                                                tester.interceptButton.click();

                                                tester.firstConnection.connectWebRTC();
                                                tester.allowMediaInput();

                                                const outboundCall = tester.outboundCall().intercept().start();
                                                tester.slavesNotification().available().userDataFetched().twoChannels().
                                                    intercept().sending().expectToBeSent();

                                                outboundCall.setRinging();
                                                tester.slavesNotification().available().userDataFetched().twoChannels().
                                                    intercept().progress().expectToBeSent();

                                                tester.firstConnection.callTrackHandler();
                                                tester.numaRequest().intercept().receiveResponse();
                                            });
                                            it('Нажимаю на кнпоку вызова. Ничего не проиcходит.', function() {
                                                tester.callStartingButton.click();
                                            });
                                            it(
                                                'Открывается новая вкладка. Отправляется запрос обновления состояния.',
                                            function() {
                                                tester.masterNotification().tabOpened().receive();

                                                tester.slavesNotification().userDataFetched().twoChannels().available().
                                                    expectToBeSent();
                                                tester.slavesNotification().additional().visible().expectToBeSent();
                                            });
                                            it(
                                                'На ведомой вкладке была нажата кнопка вызова. Совершается вызов.',
                                            function() {
                                                tester.masterNotification().call().receive();

                                                tester.firstConnection.connectWebRTC();
                                                tester.allowMediaInput();

                                                tester.outboundCall().expectToBeSent()

                                                tester.slavesNotification().available().userDataFetched().twoChannels().
                                                    sending().expectToBeSent();

                                                tester.numaRequest().receiveResponse();

                                                tester.outgoingIcon.expectToBeVisible();
                                                tester.softphone.expectTextContentToHaveSubstring(
                                                    '+7 (916) 123-45-67 Поиск контакта... 00:00'
                                                );
                                            });
                                            it('От ведомой вкладки получен токен. Ничего не сломалось.', function() {
                                                tester.masterInfoMessage().applyLeader().receive();
                                            });
                                            it(
                                                'Получен запрос на выход из софтфона. Отображена форма авторизации.',
                                            function() {
                                                tester.masterNotification().destroy().receive();

                                                tester.authLogoutRequest().receiveResponse();
                                                tester.userLogoutRequest().receiveResponse();

                                                tester.eventsWebSocket.finishDisconnecting();
                                                tester.registrationRequest().expired().receiveResponse();

                                                spendTime(2000);
                                                tester.webrtcWebsocket.finishDisconnecting();

                                                tester.slavesNotification().
                                                    userDataFetched().
                                                    twoChannels().
                                                    destroyed().
                                                    microphoneAccessGranted().
                                                    enabled().
                                                    expectToBeSent();

                                                tester.input.withFieldLabel('Логин').expectToBeVisible();
                                            });
                                            it(
                                                'Авторизационная кука удалена. Получен запрос на выход из софтфона. ' +
                                                'Отображена форма авторизации.',
                                            function() {
                                                document.cookie = '';
                                                tester.masterNotification().destroy().receive();

                                                tester.authLogoutRequest().receiveResponse();

                                                tester.eventsWebSocket.finishDisconnecting();
                                                tester.registrationRequest().expired().receiveResponse();

                                                spendTime(2000);
                                                tester.webrtcWebsocket.finishDisconnecting();

                                                tester.slavesNotification().
                                                    userDataFetched().
                                                    twoChannels().
                                                    destroyed().
                                                    microphoneAccessGranted().
                                                    enabled().
                                                    expectToBeSent();

                                                tester.input.withFieldLabel('Логин').expectToBeVisible();
                                            });
                                            it('Отображен софтфон.', function() {
                                                if (localStorage.getItem('isSoftphoneHigh') != 'false') {
                                                    throw new Error(
                                                        'В локальном хранилище должна быть сохранена свернутость ' +
                                                        'софтфона.'
                                                    );
                                                }

                                                tester.select.expectNotToExist();

                                                tester.softphone.expectTextContentNotToHaveSubstring(
                                                    'Микрофон не обнаружен'
                                                );

                                                tester.body.expectTextContentToHaveSubstring(
                                                    'karadimova Не беспокоить'
                                                );

                                                tester.softphone.expectToBeCollapsed();
                                                tester.settingsButton.expectNotToExist();
                                                tester.callStartingButton.expectNotToHaveAttribute('disabled');

                                                utils.expectJSONObjectToContain(
                                                    localStorage.getItem('audioSettings'),
                                                    {
                                                        microphone: {
                                                            deviceId: null
                                                        },
                                                        ringtone: {
                                                            deviceId: null,
                                                            volume: 100,
                                                            value: 'default'
                                                        },
                                                        outputDeviceId: null,
                                                        shouldPlayCallEndingSignal: false
                                                    }
                                                );
                                            });
                                        });
                                        it('Нажимаю на кнопку скрытия софтфона. Сотфтфон скрыт.', function() {
                                            tester.hideButton.click();
                                            tester.slavesNotification().additional().expectToBeSent();

                                            tester.callStartingButton.expectNotToExist();
                                        });
                                        it('Нажимаю на иконку с телефоном. Сотфтфон скрыт.', function() {
                                            tester.button('Софтфон').click();
                                            tester.slavesNotification().additional().expectToBeSent();

                                            tester.callStartingButton.expectNotToExist();
                                        });
                                    });
                                    it(
                                        'От ведомой вкладки пришел запрос отображения софтфона. Софтфон отображен.',
                                    function() {
                                        tester.masterNotification().toggleWidgetVisiblity().receive();
                                        tester.callStartingButton.expectToBeVisible();
                                        tester.slavesNotification().additional().visible().expectToBeSent();
                                    });
                                    it(
                                        'Отображен пункт меню. Софтфон скрыт. Отображается статус сотрудника.',
                                    function() {
                                        tester.callStartingButton.expectNotToExist();
                                        tester.body.expectTextContentToHaveSubstring('Дашборды');
                                    });
                                });
return;
                                describe(
                                    'SIP-регистрация завершена. Срок действия токена авторизации истек.',
                                function() {
                                    let refreshRequest;

                                    beforeEach(function() {
                                        registrationRequest.receiveResponse();
                                        tester.slavesNotification().userDataFetched().twoChannels().available().
                                            expectToBeSent();

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
return;
                            it(
                                'SIP-линия не зарегистрирована. Нажимаю на иконку с телефоном. Отображено сообщение ' +
                                'о том, что SIP-линия не зарегистрирована.',
                            function() {
                                tester.button('Софтфон').click();
                                tester.slavesNotification().additional().visible().expectToBeSent();

                                tester.phoneField.fill('79161234567');

                                authenticatedUserRequest.sipIsOffline().receiveResponse();

                                tester.slavesNotification().
                                    userDataFetched().
                                    twoChannels().
                                    softphoneServerConnected().
                                    webRTCServerConnected().
                                    microphoneAccessGranted().
                                    expectToBeSent();

                                registrationRequest.receiveResponse();
                                tester.slavesNotification().userDataFetched().twoChannels().available().
                                    expectToBeSent();

                                reportGroupsRequest.receiveResponse();

                                tester.softphone.expectToBeCollapsed();
                                tester.callStartingButton.expectToHaveAttribute('disabled');

                                tester.softphone.expectTextContentToHaveSubstring(
                                    'Sip-линия не зарегистрирована'
                                );
                            });
                        });
return;
                        describe('Доступ к микрофону отклонен. Нажимаю на иконку телефона.', function() {
                            beforeEach(function() {
                                tester.disallowMediaInput();

                                tester.slavesNotification().twoChannels().webRTCServerConnected().
                                    microphoneAccessDenied().softphoneServerConnected().expectToBeSent();

                                authenticatedUserRequest.receiveResponse();

                                tester.slavesNotification().
                                    userDataFetched().
                                    twoChannels().
                                    webRTCServerConnected().
                                    microphoneAccessDenied().
                                    softphoneServerConnected().
                                    expectToBeSent();

                                reportGroupsRequest.receiveResponse();

                                registrationRequest.receiveResponse();

                                tester.slavesNotification().
                                    userDataFetched().
                                    twoChannels().
                                    registered().
                                    webRTCServerConnected().
                                    microphoneAccessDenied().
                                    softphoneServerConnected().
                                    expectToBeSent();

                                tester.button('Софтфон').click();
                                tester.slavesNotification().additional().visible().expectToBeSent();
                            });

                            it('Нажимаю на кнопку второй линии. Происходит переход на вторую линию.', function() {
                                tester.secondLineButton.click();

                                tester.slavesNotification().
                                    userDataFetched().
                                    twoChannels().
                                    changedChannelToSecond().
                                    registered().
                                    webRTCServerConnected().
                                    microphoneAccessDenied().
                                    softphoneServerConnected().
                                    expectToBeSent();

                                tester.firstLineButton.expectNotToHaveClass('cmg-bottom-button-selected');
                                tester.secondLineButton.expectToHaveClass('cmg-bottom-button-selected');
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
return;
                    describe('Номера должны быть скрыты.', function() {
                        beforeEach(function() {
                            reportGroupsRequest.receiveResponse();

                            settingsRequest.shouldHideNumbers().receiveResponse();
                            tester.slavesNotification().twoChannels().enabled().expectToBeSent();

                            tester.othersNotification().widgetStateUpdate().isNeedHideNumbers().expectToBeSent();
                            tester.othersNotification().updateSettings().shouldNotPlayCallEndingSignal().
                                expectToBeSent();

                            notificationTester.grantPermission();

                            tester.connectEventsWebSocket();
                            tester.slavesNotification().twoChannels().enabled().
                                softphoneServerConnected().expectToBeSent();

                            tester.connectSIPWebSocket();
                            tester.slavesNotification().twoChannels().webRTCServerConnected().
                                softphoneServerConnected().expectToBeSent();

                            tester.authenticatedUserRequest().receiveResponse();
                            tester.slavesNotification().userDataFetched().twoChannels().webRTCServerConnected().
                                softphoneServerConnected().expectToBeSent();

                            tester.registrationRequest().receiveResponse();
                            tester.slavesNotification().userDataFetched().twoChannels().webRTCServerConnected().
                                registered().softphoneServerConnected().expectToBeSent();

                            tester.allowMediaInput();
                            tester.slavesNotification().userDataFetched().twoChannels().available().expectToBeSent();
                        });

                        it('Открываю историю звонков.', function() {
                            tester.button('Софтфон').click();
                            tester.slavesNotification().additional().visible().expectToBeSent();

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
                            tester.slavesNotification().available().userDataFetched().twoChannels().incoming().
                                progress().expectToBeSent();

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
                        tester.slavesNotification().twoChannels().enabled().expectToBeSent();

                        tester.othersNotification().widgetStateUpdate().expectToBeSent();
                        tester.othersNotification().updateSettings().shouldNotPlayCallEndingSignal().
                            expectToBeSent();

                        notificationTester.grantPermission();

                        tester.connectEventsWebSocket();
                        tester.slavesNotification().twoChannels().enabled().
                            softphoneServerConnected().expectToBeSent();

                        tester.connectSIPWebSocket();
                        tester.slavesNotification().twoChannels().webRTCServerConnected().
                            softphoneServerConnected().expectToBeSent();

                        tester.allowMediaInput();
                        tester.slavesNotification().twoChannels().webRTCServerConnected().softphoneServerConnected().
                            microphoneAccessGranted().expectToBeSent();

                        tester.authenticatedUserRequest().anotherAuthorizationToken().receiveResponse();
                        tester.slavesNotification().userDataFetched().twoChannels().webRTCServerConnected().
                            softphoneServerConnected().microphoneAccessGranted().expectToBeSent();

                        tester.registrationRequest().receiveResponse();
                        tester.slavesNotification().userDataFetched().twoChannels().available().expectToBeSent();
                    });
                    it('Токен невалиден. Отображена форма аутентификации.', function() {
                        settingsRequest.accessTokenInvalid().receiveResponse();
                        notificationTester.grantPermission();
                        tester.userLogoutRequest().receiveResponse();
                        tester.authLogoutRequest().receiveResponse();

                        tester.slavesNotification().destroyed().expectToBeSent();

                        tester.input.withFieldLabel('Логин').expectToBeVisible();
                    });
                });
return;
                describe('Нажимаю на иконку с телефоном.', function() {
                    beforeEach(function() {
                        reportGroupsRequest.receiveResponse();

                        tester.button('Софтфон').click();
                        tester.slavesNotification().additional().visible().expectToBeSent();
                    });

                    describe('Пользователь имеет права на список номеров.', function() {
                        beforeEach(function() {
                            permissionsRequest = permissionsRequest.allowNumberCapacitySelect();
                            settingsRequest = settingsRequest.allowNumberCapacitySelect();
                        });

                        describe('У выбранного номера нет комментария.', function() {
                            beforeEach(function() {
                                settingsRequest.receiveResponse();
                                tester.slavesNotification().twoChannels().enabled().expectToBeSent();

                                tester.othersNotification().widgetStateUpdate().fixedNumberCapacityRule().
                                    expectToBeSent();
                                tester.othersNotification().updateSettings().shouldNotPlayCallEndingSignal().
                                    expectToBeSent();

                                notificationTester.grantPermission();
                            });

                            describe('Пользователь имеет права на выбор номера.', function() {
                                let authenticatedUserRequest,
                                    numberCapacityRequest;

                                beforeEach(function() {
                                    permissionsRequest.allowNumberCapacityUpdate().receiveResponse();

                                    tester.connectEventsWebSocket();
                                    tester.slavesNotification().twoChannels().enabled().
                                        softphoneServerConnected().expectToBeSent();

                                    tester.connectSIPWebSocket();
                                    tester.slavesNotification().twoChannels().webRTCServerConnected().
                                        softphoneServerConnected().expectToBeSent();

                                    tester.allowMediaInput();
                                    tester.slavesNotification().twoChannels().webRTCServerConnected().
                                        softphoneServerConnected().microphoneAccessGranted().expectToBeSent();

                                    numberCapacityRequest = tester.numberCapacityRequest().expectToBeSent();

                                    tester.registrationRequest().receiveResponse();
                                    tester.slavesNotification().twoChannels().available().
                                        expectToBeSent();

                                    authenticatedUserRequest = tester.authenticatedUserRequest().expectToBeSent();
                                });

                                describe('У пользователя есть несколько номеров.', function() {
                                    beforeEach(function() {
                                        numberCapacityRequest.receiveResponse();
                                    });

                                    describe('SIP-линия зарегистрирована.', function() {
                                        beforeEach(function() {
                                            authenticatedUserRequest.receiveResponse();
                                            tester.slavesNotification().userDataFetched().twoChannels().available().
                                                expectToBeSent();
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
                                                    tester.othersNotification().numberCapacityUpdate().expectToBeSent();
                                                });

                                                it(
                                                    'Нажимаю на кнопку открытия диалпада. Отображен выбранный номер ' +
                                                    'с комментарием.',
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

                                            tester.slavesNotification().userDataFetched().twoChannels().destroyed().
                                                microphoneAccessGranted().enabled().expectToBeSent();

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
                                        tester.slavesNotification().userDataFetched().twoChannels().available().
                                            expectToBeSent();

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
                                    tester.slavesNotification().userDataFetched().twoChannels().available().
                                        expectToBeSent();

                                    tester.select.expectToHaveTextContent('+7 (495) 021-68-06');
                                });
                            });
                            it('Безуспешно пытаюсь выбрать номер.', function() {
                                permissionsRequest.receiveResponse();

                                tester.connectEventsWebSocket();
                                tester.slavesNotification().twoChannels().enabled().softphoneServerConnected().
                                    expectToBeSent();

                                tester.connectSIPWebSocket();
                                tester.slavesNotification().twoChannels().webRTCServerConnected().
                                    softphoneServerConnected().expectToBeSent();

                                tester.allowMediaInput();
                                tester.slavesNotification().twoChannels().webRTCServerConnected().
                                    softphoneServerConnected().microphoneAccessGranted().expectToBeSent();

                                tester.numberCapacityRequest().receiveResponse();

                                tester.authenticatedUserRequest().receiveResponse();
                                tester.slavesNotification().userDataFetched().twoChannels().webRTCServerConnected().
                                    softphoneServerConnected().microphoneAccessGranted().expectToBeSent();

                                tester.registrationRequest().receiveResponse();
                                tester.slavesNotification().userDataFetched().twoChannels().available().
                                    expectToBeSent();

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
                                tester.slavesNotification().twoChannels().enabled().expectToBeSent();

                                tester.othersNotification().widgetStateUpdate().fixedNumberCapacityRule().
                                    expectToBeSent();
                                tester.othersNotification().updateSettings().shouldNotPlayCallEndingSignal().
                                    expectToBeSent();

                                notificationTester.grantPermission();
                                permissionsRequest.allowNumberCapacityUpdate().receiveResponse();

                                tester.connectEventsWebSocket();
                                tester.slavesNotification().twoChannels().enabled().softphoneServerConnected().
                                    expectToBeSent();

                                tester.connectSIPWebSocket();
                                tester.slavesNotification().twoChannels().webRTCServerConnected().
                                    softphoneServerConnected().expectToBeSent();

                                tester.allowMediaInput();
                                tester.slavesNotification().twoChannels().webRTCServerConnected().
                                    softphoneServerConnected().microphoneAccessGranted().expectToBeSent();

                                tester.numberCapacityRequest().receiveResponse();
                                
                                tester.registrationRequest().receiveResponse();
                                tester.slavesNotification().twoChannels().available().expectToBeSent();

                                authenticatedUserRequest = tester.authenticatedUserRequest().expectToBeSent();
                            });

                            it(
                                'SIP-линия не зарегистрирована. Отображено сообщение о том, что SIP-линия не ' +
                                'зарегистрирована.',
                            function() {
                                authenticatedUserRequest.sipIsOffline().receiveResponse();
                                tester.slavesNotification().userDataFetched().twoChannels().available().
                                    expectToBeSent();

                                tester.softphone.expectToBeCollapsed();
                                tester.softphone.expectToHaveTextContent(
                                    'Sip-линия не зарегистрирована ' +

                                    '+7 (495) 021-68-06'
                                );
                            });
                            it('Отображен выбранный номер.', function() {
                                authenticatedUserRequest.receiveResponse();
                                tester.slavesNotification().userDataFetched().twoChannels().available().
                                    expectToBeSent();

                                tester.softphone.expectToHaveTextContent('+7 (495) 021-68-06');
                            });
                        });
                        describe('В качестве устройства для приема звонков исползуется IP-телефон.', function() {
                            beforeEach(function() {
                                settingsRequest.callsAreManagedByAnotherDevice().receiveResponse();
                                tester.slavesNotification().twoChannels().disabled().expectToBeSent();

                                tester.othersNotification().widgetStateUpdate().isNotUsingWidgetForCalls().
                                    fixedNumberCapacityRule().expectToBeSent();
                                tester.othersNotification().updateSettings().shouldNotPlayCallEndingSignal().
                                    expectToBeSent();

                                notificationTester.grantPermission();
                                permissionsRequest.allowNumberCapacityUpdate().receiveResponse();

                                tester.connectEventsWebSocket();
                                tester.slavesNotification().softphoneServerConnected().twoChannels().disabled().
                                    expectToBeSent();

                                tester.numberCapacityRequest().receiveResponse();

                                tester.authenticatedUserRequest().receiveResponse();
                                tester.slavesNotification().userDataFetched().softphoneServerConnected().twoChannels().
                                    disabled().expectToBeSent();
                            });

                            describe('Получена неокончательная информация о звонке. Автоответ включен.', function() {
                                beforeEach(function() {
                                    tester.outCallEvent().needAutoAnswer().notFinal().receive();
                                    tester.outCallEvent().needAutoAnswer().notFinal().slavesNotification().
                                        expectToBeSent();
                                });

                                it(
                                    'Получена окончательная информация о звонке. Отображена информация о звонке.',
                                function() {
                                    tester.outCallEvent().needAutoAnswer().receive();
                                    tester.outCallEvent().needAutoAnswer().slavesNotification().expectToBeSent();

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
                            it(
                                'Получена окончательная информация о звонке. Имя длинное. Отображена информация о ' +
                                'звонке.',
                            function() {
                                tester.outCallEvent().longName().receive();
                                tester.outCallEvent().longName().slavesNotification().expectToBeSent();

                                tester.incomingIcon.expectToBeVisible();

                                tester.softphone.expectTextContentToHaveSubstring(
                                    'Кобыла и трупоглазые жабы искали цезию, нашли поздно утром свистящего хна ' +
                                    '+7 (916) 123-45-67 ' +

                                    'Путь лида'
                                );
                            });
                            it(
                                'Получена окончательная информация о звонке. Отображена информация о звонке.',
                            function() {
                                tester.outCallEvent().receive();
                                tester.outCallEvent().slavesNotification().expectToBeSent();

                                tester.incomingIcon.expectToBeVisible();
                                tester.softphone.
                                    expectTextContentToHaveSubstring('Шалева Дора +7 (916) 123-45-67 Путь лида');
                            });
                            it('Совершается исходящий звонок. Отображена информация о звонке.', function() {
                                tester.outCallSessionEvent().receive();
                                tester.outCallSessionEvent().slavesNotification().expectToBeSent();

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
                            tester.slavesNotification().twoChannels().enabled().expectToBeSent();

                            tester.othersNotification().widgetStateUpdate().fixedNumberCapacityRule().expectToBeSent();
                            tester.othersNotification().updateSettings().shouldNotPlayCallEndingSignal().
                                expectToBeSent();

                            notificationTester.grantPermission();
                            permissionsRequest.allowNumberCapacityUpdate().receiveResponse();

                            tester.connectEventsWebSocket();
                            tester.slavesNotification().twoChannels().softphoneServerConnected().enabled().
                                expectToBeSent();

                            tester.connectSIPWebSocket();
                            tester.slavesNotification().twoChannels().webRTCServerConnected().
                                softphoneServerConnected().expectToBeSent();

                            tester.allowMediaInput();
                            tester.slavesNotification().twoChannels().webRTCServerConnected().microphoneAccessGranted().
                                softphoneServerConnected().expectToBeSent();

                            tester.numberCapacityRequest().receiveResponse();

                            tester.registrationRequest().receiveResponse();
                            tester.slavesNotification().twoChannels().available().expectToBeSent();
                            
                            tester.authenticatedUserRequest().receiveResponse();
                            tester.slavesNotification().userDataFetched().twoChannels().available().expectToBeSent();

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
                                tester.slavesNotification().twoChannels().disabled().expectToBeSent();

                                tester.othersNotification().widgetStateUpdate().isNotUsingWidgetForCalls().
                                    expectToBeSent();
                                tester.othersNotification().updateSettings().shouldNotPlayCallEndingSignal().
                                    expectToBeSent();

                                notificationTester.grantPermission();
                            });

                            describe('Соединение установлено.', function() {
                                beforeEach(function() {
                                    tester.connectEventsWebSocket();
                                    tester.slavesNotification().twoChannels().disabled().
                                        softphoneServerConnected().expectToBeSent();

                                    tester.authenticatedUserRequest().sipIsOffline().receiveResponse();
                                    tester.slavesNotification().userDataFetched().twoChannels().disabled().
                                        softphoneServerConnected().expectToBeSent();
                                });

                                it(
                                    'Нажимаю на кнопку аккаунта. Выбираю другой статус. Другой статус выбран.',
                                function() {
                                    tester.userName.putMouseOver();
                                    tester.statusesList.item('Нет на месте').click();

                                    tester.userStateUpdateRequest().receiveResponse();
                                    tester.notificationOfUserStateChanging().anotherStatus().receive();

                                    tester.slavesNotification().userDataFetched().twoChannels().disabled().
                                        anotherStatus().softphoneServerConnected().expectToBeSent();

                                    tester.statusesList.item('Не беспокоить').expectNotToBeSelected();
                                    tester.statusesList.item('Нет на месте').expectToBeSelected();

                                    tester.body.expectTextContentToHaveSubstring('karadimova Нет на месте');
                                });
                                it(
                                    'Отображено сообщение о том, включено управление звонками с другого устройстви ' +
                                    'или программы.',
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
                            tester.slavesNotification().twoChannels().enabled().expectToBeSent();
                            
                            tester.othersNotification().widgetStateUpdate().expectToBeSent();
                            tester.othersNotification().updateSettings().shouldNotPlayCallEndingSignal().
                                expectToBeSent();

                            notificationTester.grantPermission();

                            tester.connectEventsWebSocket();
                            tester.slavesNotification().twoChannels().enabled().softphoneServerConnected().
                                expectToBeSent();

                            tester.connectSIPWebSocket();
                            tester.slavesNotification().twoChannels().webRTCServerConnected().
                                softphoneServerConnected().expectToBeSent();

                            tester.allowMediaInput();
                            tester.slavesNotification().twoChannels().webRTCServerConnected().
                                softphoneServerConnected().microphoneAccessGranted().expectToBeSent();

                            tester.authenticatedUserRequest().receiveResponse();
                            tester.slavesNotification().userDataFetched().twoChannels().webRTCServerConnected().
                                softphoneServerConnected().microphoneAccessGranted().expectToBeSent();
                            
                            tester.requestRegistration().setRTU().receiveResponse();
                            tester.slavesNotification().userDataFetched().twoChannels().available().expectToBeSent();
                        });
                        it(
                            'Получена некорректная конфигурация прямого подключения к РТУ. Подключаюсь к каме.',
                        function() {
                            settingsRequest.setInvalidRTUConfig().receiveResponse();
                            tester.slavesNotification().twoChannels().enabled().expectToBeSent();

                            tester.othersNotification().widgetStateUpdate().expectToBeSent();
                            tester.othersNotification().updateSettings().shouldNotPlayCallEndingSignal().
                                expectToBeSent();

                            notificationTester.grantPermission();

                            tester.connectEventsWebSocket();
                            tester.slavesNotification().twoChannels().enabled().softphoneServerConnected().
                                expectToBeSent();

                            tester.connectSIPWebSocket();
                            tester.slavesNotification().twoChannels().webRTCServerConnected().
                                softphoneServerConnected().expectToBeSent();

                            tester.allowMediaInput();
                            tester.slavesNotification().twoChannels().webRTCServerConnected().
                                softphoneServerConnected().microphoneAccessGranted().expectToBeSent();

                            tester.authenticatedUserRequest().receiveResponse();
                            tester.slavesNotification().userDataFetched().twoChannels().webRTCServerConnected().
                                softphoneServerConnected().microphoneAccessGranted().expectToBeSent();

                            tester.requestRegistration().receiveResponse();
                            tester.slavesNotification().userDataFetched().twoChannels().available().expectToBeSent();
                        });
                        it('Телефония недоступна. Отображено сообщение "Sip-линия не зарегистрирована".', function() {
                            settingsRequest.noTelephony().receiveResponse();
                            tester.slavesNotification().twoChannels().disabled().expectToBeSent();
                            tester.slavesNotification().expectToBeSent();

                            tester.connectEventsWebSocket();
                            tester.slavesNotification().twoChannels().disabled().softphoneServerConnected().
                                expectToBeSent();

                            tester.othersNotification().widgetStateUpdate().noTelephony().expectToBeSent();
                            tester.othersNotification().updateSettings().shouldNotPlayCallEndingSignal().
                                expectToBeSent();

                            notificationTester.grantPermission();

                            tester.authenticatedUserRequest().receiveResponse();
                            tester.slavesNotification().userDataFetched().twoChannels().disabled().
                                softphoneServerConnected().expectToBeSent();

                            tester.softphone.expectToBeCollapsed();
                            tester.softphone.expectTextContentToHaveSubstring(
                                'Нет доступной sip-линии'
                            );
                        });
                        it('Выбран кастомный рингтон. Сигнал завершения звонка включен.', function() {
                            settingsRequest.secondRingtone().isNeedDisconnectSignal().receiveResponse();
                            tester.slavesNotification().twoChannels().enabled().expectToBeSent();

                            notificationTester.grantPermission();

                            tester.othersNotification().widgetStateUpdate().expectToBeSent();
                            tester.othersNotification().updateSettings().shouldPlayCallEndingSignal().
                                incomingRingtone().expectToBeSent();

                            tester.connectEventsWebSocket();
                            tester.slavesNotification().twoChannels().enabled().softphoneServerConnected().
                                expectToBeSent();

                            tester.connectSIPWebSocket();
                            tester.slavesNotification().twoChannels().webRTCServerConnected().
                                softphoneServerConnected().expectToBeSent();

                            tester.allowMediaInput();
                            tester.slavesNotification().twoChannels().webRTCServerConnected().
                                softphoneServerConnected().microphoneAccessGranted().expectToBeSent();

                            tester.ringtoneRequest().receiveResponse();
                            fileReader.accomplishFileLoading(tester.secondRingtone);
                            mediaStreamsTester.setIsAbleToPlayThough('data:audio/wav;base64,' + tester.secondRingtone);

                            tester.authenticatedUserRequest().receiveResponse();
                            tester.slavesNotification().userDataFetched().twoChannels().webRTCServerConnected().
                                softphoneServerConnected().microphoneAccessGranted().expectToBeSent();

                            tester.requestRegistration().receiveResponse();
                            tester.slavesNotification().userDataFetched().twoChannels().available().expectToBeSent();

                            utils.expectJSONObjectToContain(
                                localStorage.getItem('audioSettings'),
                                {
                                    microphone: {
                                        deviceId: null
                                    },
                                    ringtone: {
                                        deviceId: null,
                                        volume: 100,
                                        value: 'softphone_ringtone2'
                                    },
                                    outputDeviceId: null,
                                    shouldPlayCallEndingSignal: true
                                }
                            );
                        });
                    });
                });
                it('Статистика по всем звонкам недоступна. Открываю раздел "История звонков".', function() {
                    permissionsRequest.disallowSoftphoneAllCallsStatSelect().receiveResponse();
                    settingsRequest.receiveResponse();
                    tester.slavesNotification().twoChannels().enabled().expectToBeSent();

                    reportGroupsRequest.receiveResponse();

                    tester.connectEventsWebSocket();
                    tester.slavesNotification().twoChannels().enabled().softphoneServerConnected().expectToBeSent();

                    tester.connectSIPWebSocket();
                    tester.slavesNotification().twoChannels().webRTCServerConnected().softphoneServerConnected().
                        expectToBeSent();

                    tester.othersNotification().widgetStateUpdate().expectToBeSent();
                    tester.othersNotification().updateSettings().shouldNotPlayCallEndingSignal().expectToBeSent();

                    notificationTester.grantPermission();

                    tester.allowMediaInput();

                    tester.slavesNotification().
                        twoChannels().
                        softphoneServerConnected().
                        webRTCServerConnected().
                        microphoneAccessGranted().
                        expectToBeSent();

                    tester.authenticatedUserRequest().receiveResponse();

                    tester.slavesNotification().
                        twoChannels().
                        softphoneServerConnected().
                        webRTCServerConnected().
                        microphoneAccessGranted().
                        userDataFetched().
                        expectToBeSent();

                    tester.registrationRequest().receiveResponse();
                    tester.slavesNotification().twoChannels().available().userDataFetched().expectToBeSent();

                    tester.button('История звонков').click();

                    tester.callsRequest().receiveResponse();
                    tester.marksRequest().receiveResponse();
                });
            });
return;
            describe('Вкладка является ведомой. Открываю софтфон.', function() {
                beforeEach(function() {
                    tester.masterInfoMessage().isNotMaster().receive();
                    tester.masterNotification().tabOpened().expectToBeSent();

                    tester.authCheckRequest().receiveResponse();
                    tester.statusesRequest().receiveResponse();

                    tester.settingsRequest().allowNumberCapacitySelect().receiveResponse();

                    tester.othersNotification().widgetStateUpdate().fixedNumberCapacityRule().expectToBeSent();
                    tester.othersNotification().updateSettings().shouldNotPlayCallEndingSignal().expectToBeSent();
                    
                    tester.talkOptionsRequest().receiveResponse();
                    tester.permissionsRequest().allowNumberCapacitySelect().allowNumberCapacityUpdate().
                        receiveResponse();

                    notificationTester.grantPermission();

                    tester.authenticatedUserRequest().receiveResponse();
                    tester.numberCapacityRequest().receiveResponse();
                    reportGroupsRequest.receiveResponse();

                    tester.slavesNotification().userDataFetched().twoChannels().available().receive();

                    tester.button('Софтфон').click();

                    tester.masterNotification().toggleWidgetVisiblity().expectToBeSent();
                    tester.slavesNotification().additional().visible().receive();
                });

                describe('Скрываю окно.', function() {
                    beforeEach(function() {
                        setDocumentVisible(false);
                        tester.masterNotification().tabBecameHidden().expectToBeSent();
                    });

                    describe('Вкладка становится ведущей. Поднимается webRTC-сокет.', function() {
                        beforeEach(function() {
                            tester.masterInfoMessage().receive();

                            tester.slavesNotification().tabsVisibilityRequest().expectToBeSent();
                            tester.slavesNotification().userDataFetched().twoChannels().hidden().enabled().
                                expectToBeSent();
                            tester.slavesNotification().additional().visible().expectToBeSent();

                            tester.connectEventsWebSocket();
                            tester.slavesNotification().userDataFetched().twoChannels().hidden().enabled().
                                softphoneServerConnected().expectToBeSent();

                            tester.connectSIPWebSocket();
                            tester.slavesNotification().userDataFetched().twoChannels().webRTCServerConnected().
                                hidden().softphoneServerConnected().expectToBeSent();

                            tester.masterInfoMessage().tellIsLeader().expectToBeSent();

                            tester.allowMediaInput();
                            tester.slavesNotification().userDataFetched().twoChannels().webRTCServerConnected().
                                hidden().softphoneServerConnected().microphoneAccessGranted().expectToBeSent();

                            tester.authenticatedUserRequest().receiveResponse();

                            tester.registrationRequest().receiveResponse();
                            tester.slavesNotification().userDataFetched().twoChannels().available().hidden().
                                expectToBeSent();
                        });

                        it('Поступил входящий звонок. Отображено браузерное уведомление.', function() {
                            tester.incomingCall().receive();
                            tester.slavesNotification().available().userDataFetched().twoChannels().
                                incoming().progress().hidden().expectToBeSent();

                            tester.numaRequest().receiveResponse();

                            tester.outCallEvent().receive();
                            tester.outCallEvent().slavesNotification().expectToBeSent();

                            notificationTester.grantPermission().
                                recentNotification().
                                expectToHaveTitle('Входящий звонок').
                                expectToHaveBody('Шалева Дора +7 (916) 123-45-67').
                                expectToBeOpened();
                        });
                        it(
                            'Существует другая открытая вкладка. Поступил входящий звонок. Браузерное ' +
                            'уведомление не отображено.',
                        function() {
                            tester.masterNotification().tabBecameVisible().receive();
                            tester.slavesNotification().userDataFetched().twoChannels().available().expectToBeSent();

                            tester.incomingCall().receive();
                            tester.slavesNotification().available().userDataFetched().twoChannels().
                                incoming().progress().expectToBeSent();

                            tester.numaRequest().receiveResponse();

                            tester.outCallEvent().receive();
                            tester.outCallEvent().slavesNotification().expectToBeSent();
                        });
                    });
                    it('Получен запрос видимости окна. Ничего не происходит.', function() {
                        tester.slavesNotification().tabsVisibilityRequest().receive();
                    });
                    it('Поступил входящий звонок. Отображена информация о звонке.', function() {
                        tester.slavesNotification().available().twoChannels().incoming().progress().userDataFetched().
                            receive();
                        tester.outCallEvent().slavesNotification().receive();

                        tester.softphone.expectTextContentToHaveSubstring(
                            'Шалева Дора +7 (916) 123-45-67 ' +
                            'Путь лида'
                        );
                    });
                });
                it('Открываю настройки звука. На другой вкладке изменены настройки звука.', function() {
                    tester.button('Настройки').click();
                    tester.popover.button('Софтфон').click();
                    tester.button('Звук').click();

                    localStorage.setItemInAnotherTab('audioSettings', JSON.stringify({
                        shouldPlayCallEndingSignal: true,
                        microphone: {
                            deviceId: '98g2j2pg9842gi2gh89hl48ogh2og82h9g724hg42' +
                                '7gla8g2hg289hg9a48ghal4'
                        },
                        ringtone: {
                            deviceId: '6943f509802439f2c170bea3f42991df56faee134' +
                                'b25b3a2f2a13f0fad6943ab',
                            volume: 25,
                            value: 'softphone_ringtone2'
                        },
                        outputDeviceId: 'g8294gjg29guslg82pgj2og8ogjwog8u29gj0p' +
                            'agulo48g92gj28ogtjog82jgab'
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

                    tester.body.expectTextContentToHaveSubstring('Громкость звонка 25%');

                    tester.fieldRow('Мелодия звонка').select.expectToHaveTextContent('Мелодия звонка 2');
                    tester.fieldRow('Микрофон').select.expectToHaveTextContent('Микрофон SURE');
                    tester.fieldRow('Динамики').select.expectToHaveTextContent('Колонка JBL');
                    tester.fieldRow('Звонящее устройство').select.expectToHaveTextContent('Встроенный динамик');

                    tester.button('Сигнал о завершении звонка').expectToBeChecked();
                });
                it(
                    'Вкладка становится ведущей. Скрываю вкладку. Раскрываю вкладку. Поступил входящий звонок. ' +
                    'Информация о звонке не отображена.',
                function() {
                    tester.masterInfoMessage().receive();

                    tester.slavesNotification().tabsVisibilityRequest().expectToBeSent();
                    tester.slavesNotification().userDataFetched().twoChannels().enabled().expectToBeSent();
                    tester.slavesNotification().additional().visible().expectToBeSent();

                    tester.connectEventsWebSocket();
                    tester.slavesNotification().userDataFetched().twoChannels().enabled().softphoneServerConnected().
                        expectToBeSent();

                    tester.connectSIPWebSocket();
                    tester.slavesNotification().userDataFetched().twoChannels().webRTCServerConnected().
                        softphoneServerConnected().expectToBeSent();

                    tester.masterInfoMessage().tellIsLeader().expectToBeSent();

                    tester.allowMediaInput();
                    tester.slavesNotification().userDataFetched().twoChannels().webRTCServerConnected().
                        softphoneServerConnected().microphoneAccessGranted().expectToBeSent();

                    tester.authenticatedUserRequest().receiveResponse();

                    tester.registrationRequest().receiveResponse();
                    tester.slavesNotification().userDataFetched().twoChannels().available().expectToBeSent();

                    setDocumentVisible(false);
                    tester.slavesNotification().userDataFetched().twoChannels().available().hidden().expectToBeSent();

                    setDocumentVisible(true);
                    tester.slavesNotification().userDataFetched().twoChannels().available().expectToBeSent();

                    tester.incomingCall().receive();
                    tester.slavesNotification().available().userDataFetched().twoChannels().
                        incoming().progress().expectToBeSent();

                    tester.numaRequest().receiveResponse();

                    tester.outCallEvent().receive();
                    tester.outCallEvent().slavesNotification().expectToBeSent();
                });
                it(
                    'Сессионная кука уже удалена. На ведущей вкладке был совершен выход из софтфона. Отображается ' +
                    'форма аутентификации.',
                function() {
                    document.cookie = '';

                    tester.slavesNotification().userDataFetched().twoChannels().microphoneAccessGranted().
                        destroyed().enabled().receive();
                    tester.masterNotification().destroy().expectToBeSent();

                    tester.authLogoutRequest().receiveResponse();

                    tester.input.withFieldLabel('Логин').expectToBeVisible();
                });
                it(
                    'Сессионная кука еще не удалена. На ведущей вкладке был совершен выход из софтфона. Отображается ' +
                    'форма аутентификации.',
                function() {
                    tester.slavesNotification().userDataFetched().twoChannels().microphoneAccessGranted().
                        destroyed().enabled().receive();

                    tester.authLogoutRequest().receiveResponse();
                    tester.userLogoutRequest().receiveResponse();

                    tester.input.withFieldLabel('Логин').expectToBeVisible();
                });
                it(
                    'Ввожу номер телефона. Приходит сообщение о том, что вкладка все еще остается ведомой. Номер ' +
                    'телефона все еще введен.',
                function() {
                    tester.phoneField.fill('79161234567');
                    tester.masterInfoMessage().tellIsLeader().receive();
                    tester.phoneField.expectToHaveValue('79161234567');
                });
                it('С другой ведомой вкладки поступил запрос скрытия виджета. Виджет остался видимым.', function() {
                    tester.masterNotification().toggleWidgetVisiblity().receive();
                    tester.phoneField.expectToBeVisible();
                });
                it('Получен запрос выбора номера от другой вкладки.', function() {
                    tester.othersNotification().numberCapacityUpdate().receive();
                    tester.select.expectToHaveTextContent('+7 (916) 123-89-29 Некий номер');
                });
                it('Выбран другой статус. Отображен выбранный статус.', function() {
                    tester.slavesNotification().twoChannels().available().anotherStatus().receive();
                    tester.body.expectTextContentToHaveSubstring('karadimova Нет на месте');
                });
                it('Окно свернуто. В ведущую вкладку отправлено сообщение о том, что окно свернуто.', function() {
                    setDocumentVisible(false);
                    tester.masterNotification().tabBecameHidden().expectToBeSent();
                });
                it('Закрываю окно. Отправляется сообщение о скрытии окна.', function() {
                    unload();
                    tester.masterNotification().tabBecameHidden().expectToBeSent();
                });
                it('Получен запрос видимости окна. Отправлено сообщение о видимости вкладки.', function() {
                    tester.slavesNotification().tabsVisibilityRequest().receive();
                    tester.masterNotification().tabBecameVisible().expectToBeSent();
                });
                it(
                    'Нажимаю на кнпоку выход. Софтфон разлогинивается. Отправлен запрос выключения софтфона в мастер ' +
                    'вкладку.',
                function() {
                    tester.userName.putMouseOver();
                    tester.logoutButton.click();

                    tester.userLogoutRequest().receiveResponse();
                    tester.authLogoutRequest().receiveResponse();

                    tester.masterNotification().destroy().expectToBeSent();
                });
                it('Попытка восстановления соединения не совершается.', function() {
                    tester.expectNoWebsocketConnecting();

                    tester.select.expectToHaveTextContent('+7 (495) 021-68-06');
                    tester.body.expectTextContentToHaveSubstring('karadimova Не беспокоить');
                });
            });
            describe(
                'Окно свернуто. Вкладка является ведомой. Отправлено сообщение о том, что вкладка открыта в фоне.',
            function() {
                beforeEach(function() {
                    setDocumentVisible(false);

                    tester.masterInfoMessage().isNotMaster().receive();
                    tester.masterNotification().tabOpenedInBackground().expectToBeSent();

                    tester.authCheckRequest().receiveResponse();
                    tester.statusesRequest().receiveResponse();

                    tester.settingsRequest().allowNumberCapacitySelect().receiveResponse();

                    tester.othersNotification().widgetStateUpdate().fixedNumberCapacityRule().expectToBeSent();
                    tester.othersNotification().updateSettings().shouldNotPlayCallEndingSignal().expectToBeSent();
                    
                    tester.talkOptionsRequest().receiveResponse();
                    tester.permissionsRequest().allowNumberCapacitySelect().allowNumberCapacityUpdate().
                        receiveResponse();

                    notificationTester.grantPermission();

                    tester.authenticatedUserRequest().receiveResponse();
                    tester.numberCapacityRequest().receiveResponse();
                    reportGroupsRequest.receiveResponse();
                });

                it('Закрываю окно. Сообщение о скрытии окна не отправляется.', function() {
                    unload();
                });
                it('Окно развернуто. В ведущую вкладку отправлено сообщение о том, что окно развернуто.', function() {
                    setDocumentVisible(true);
                    tester.masterNotification().tabBecameVisible().expectToBeSent();
                });
            });
        });
return;
        it('Софтфон недоступен. Кнопка софтфона скрыта.', function() {
            accountRequest.softphoneUnavailable().receiveResponse();

            tester.reportGroupsRequest().receiveResponse();
            tester.reportsListRequest().receiveResponse();
            tester.reportTypesRequest().receiveResponse();

            tester.button('Софтфон').expectNotToExist();
            tester.button('История звонков').expectNotToExist();
        });
        it('Фичафлаг софтфона выключен. Кнопка софтфона скрыта.', function() {
            accountRequest.softphoneFeatureFlagDisabled().receiveResponse();

            tester.reportGroupsRequest().receiveResponse();
            tester.reportsListRequest().receiveResponse();
            tester.reportTypesRequest().receiveResponse();

            tester.button('Софтфон').expectNotToExist();
            tester.button('История звонков').expectNotToExist();
        });
    });
return;
    describe('Открываю десктопное приложение софтфона.', function() {
        let tester;

        describe('Софтфон не должен отображаться поверх окон при входящем.', function() {
            let authenticatedUserRequest,
                accountRequest;

            beforeEach(function() {
                localStorage.setItem('clct:to_top_on_call', 'false');

                tester = new Tester({
                    ...options,
                    appName: 'softphone'
                });

                tester.input.withFieldLabel('Логин').fill('botusharova');
                tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                tester.button('Войти').click();

                tester.loginRequest().receiveResponse();
                tester.configRequest().softphone().receiveResponse();

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('resize').
                    expectToBeSentWithArguments({
                        width: 340,
                        height: 212
                    });

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('app-ready');

                accountRequest = tester.accountRequest().expectToBeSent();
            });

            describe('Софтфон доступен.', function() {
                let authCheckRequest;

                beforeEach(function() {
                    accountRequest.receiveResponse();

                    getPackage('electron').ipcRenderer.
                        recentlySentMessage().
                        expectToBeSentToChannel('feature-flags-fetched').
                        expectToBeSentWithArguments(['softphone', undefined]);

                    authCheckRequest = tester.authCheckRequest().expectToBeSent();
                });

                describe('Софтфон авторизован.', function() {
                    beforeEach(function() {
                        authCheckRequest.receiveResponse();
                        tester.statusesRequest().receiveResponse();
                        tester.settingsRequest().allowNumberCapacitySelect().receiveResponse();
                        notificationTester.grantPermission();
                        tester.talkOptionsRequest().receiveResponse();

                        tester.permissionsRequest().allowNumberCapacitySelect().allowNumberCapacityUpdate().
                            receiveResponse();

                        tester.connectEventsWebSocket();
                        tester.connectSIPWebSocket();

                        tester.allowMediaInput();

                        tester.numberCapacityRequest().receiveResponse();
                        authenticatedUserRequest = tester.authenticatedUserRequest().expectToBeSent();
                        tester.registrationRequest().desktopSoftphone().receiveResponse();
                    });

                    describe('SIP-линия зарегистрирована.', function() {
                        beforeEach(function() {
                            authenticatedUserRequest.receiveResponse();
                        });

                        describe('Нажимаю на кнопку настроек.', function() {
                            beforeEach(function() {
                                tester.settingsButton.click();

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('resize').
                                    expectToBeSentWithArguments({
                                        width: 340,
                                        height: 568
                                    });
                            });
                            
                            describe('Софтфон должен запускаться автоматически.', function() {
                                beforeEach(function() {
                                    getPackage('electron').ipcRenderer.receiveMessage('checkautolauncher', {
                                        isStartApp: true
                                    });
                                });

                                it(
                                    'Отмечаю переключатель "Запускать свернуто". Отправлено событие о необходимости ' +
                                    'запускать софтфон свернуто.',
                                function() {
                                    tester.button('Запускать свернуто').click();

                                    getPackage('electron').ipcRenderer.
                                        recentlySentMessage().
                                        expectToBeSentToChannel('startminimizechange').
                                        expectToBeSentWithArguments(true);

                                    tester.button('Открывать во время звонка').expectNotToBeChecked();
                                    tester.button('Автозапуск приложения').expectToBeChecked();
                                    tester.button('Запускать свернуто').expectToBeChecked();
                                });
                                it('Приложение должно запускаться свернутым.', function() {
                                    getPackage('electron').ipcRenderer.receiveMessage('checkstartminimize', {
                                        isStartMinimize: true
                                    });

                                    tester.button('Открывать во время звонка').expectNotToBeChecked();
                                    tester.button('Автозапуск приложения').expectToBeChecked();
                                    tester.button('Запускать свернуто').expectToBeChecked();
                                });
                                it('Форма настроек корректно заполнена.', function() {
                                    tester.button('Открывать во время звонка').expectNotToBeChecked();
                                    tester.button('Автозапуск приложения').expectToBeChecked();

                                    tester.button('Запускать свернуто').expectToBeEnabled();
                                    tester.button('Запускать свернуто').expectNotToBeChecked();
                                });
                            });
                            it(
                                'Отмечаю свитчбокс "Автозапуск приложения". Отправлено сообщение о ' +
                                'необходимости запускать приложение автоматически.',
                            function() {
                                tester.button('Автозапуск приложения').click();

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('autolauncherchange').
                                    expectToBeSentWithArguments(true);

                                tester.button('Открывать во время звонка').expectNotToBeChecked();
                                tester.button('Автозапуск приложения').expectToBeChecked();
                                tester.button('Запускать свернуто').expectNotToBeChecked();
                            });
                            it(
                                'Отмечаю свитчбокс "Открывать во время звонка". Значение параметра сохранено.',
                            function() {
                                tester.button('Открывать во время звонка').click();

                                tester.button('Открывать во время звонка').expectToBeChecked();
                                tester.button('Автозапуск приложения').expectNotToBeChecked();
                                tester.button('Запускать свернуто').expectNotToBeChecked();

                                if (localStorage.getItem('clct:to_top_on_call') !== 'true') {
                                    throw new Error(
                                        'Значение параметра "Открывать во время звонка" должно быть сохранено.'
                                    );
                                }
                            });
                            it('Нажимаю на кнопку "Смена статуса". Нажима на кнопку "Автоматически".', function() {
                                tester.button('Автоматически').click();
                                tester.settingsUpdatingRequest().autoSetStatus().receiveResponse();
                                tester.settingsRequest().autoSetStatus().receiveResponse();

                                tester.fieldRow('При входе').select.arrow.click();
                                tester.select.option('Перерыв').click();
                                tester.settingsUpdatingRequest().pauseOnLogin().receiveResponse();
                                tester.settingsRequest().autoSetStatus().pauseOnLogin().receiveResponse();

                                tester.fieldRow('При выходе').select.arrow.click();
                                tester.select.option('Не беспокоить').click();
                                tester.settingsUpdatingRequest().dontDisturbOnLogout().receiveResponse();
                                tester.settingsRequest().autoSetStatus().pauseOnLogin().dontDisturbOnLogout().
                                    receiveResponse();
                            });
                            it(
                                'Нажимаю на кнопку "Общие настройки". Нажимаю на кнопку "Софтфон или IP-телефон". ' +
                                'Отмечена кнопка "IP-телефон".',
                            function() {
                                tester.button('IP-телефон').click();
                                tester.settingsUpdatingRequest().callsAreManagedByAnotherDevice().receiveResponse();
                                tester.settingsRequest().callsAreManagedByAnotherDevice().receiveResponse();

                                tester.registrationRequest().desktopSoftphone().expired().receiveResponse();
                                
                                spendTime(2000);
                                tester.webrtcWebsocket.finishDisconnecting();

                                tester.button('Текущее устройство').expectNotToBeChecked();
                                tester.button('IP-телефон').expectToBeChecked();
                            });
                            it(
                                'Прошло некоторое время. Сервер событий не отвечает. Отображено сообщение об ' +
                                'установке соединения.',
                            function() {
                                spendTime(5000);
                                tester.expectPingToBeSent();
                                spendTime(2000);

                                tester.softphone.expectTextContentToHaveSubstring('Разрыв сети');
                            });
                            it('Открываю вкладку "Звук". Отображены настройки звука.', function() {
                                tester.button('Звук').click();
                                tester.body.expectTextContentToHaveSubstring('Громкость звонка 100%');
                            });
                            it('Форма настроек заполнена правильно.', function() {
                                tester.button('Текущее устройство').expectToBeChecked();
                                tester.button('IP-телефон').expectNotToBeChecked();

                                tester.button('Открывать во время звонка').expectNotToBeChecked();
                                tester.button('Скрывать после звонка').expectToBeChecked();
                                tester.button('Автозапуск приложения').expectNotToBeChecked();

                                tester.button('Запускать свернуто').expectNotToBeChecked();
                                tester.button('Запускать свернуто').expectToBeDisabled();
                            });
                        });
                        describe('Раскрываю список статусов.', function() {
                            beforeEach(function() {
                                tester.userName.click();
                            });

                            it('Нажимаю на кнопку "Выход". Вхожу в софтфон заново. Удалось войти.', function() {
                                tester.statusesList.item('Выход').click();

                                tester.userLogoutRequest().receiveResponse();
                                
                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('resize').
                                    expectToBeSentWithArguments({
                                        width: 300,
                                        height: 350
                                    });

                                tester.eventsWebSocket.finishDisconnecting();
                                tester.authLogoutRequest().receiveResponse();
                                tester.registrationRequest().desktopSoftphone().expired().receiveResponse();

                                spendTime(2000);
                                tester.webrtcWebsocket.finishDisconnecting();

                                tester.input.withFieldLabel('Логин').fill('botusharova');
                                tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                                tester.button('Войти').click();

                                tester.loginRequest().anotherAuthorizationToken().receiveResponse();

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('resize').
                                    expectToBeSentWithArguments({
                                        width: 340,
                                        height: 212
                                    });

                                tester.configRequest().softphone().receiveResponse();

                                tester.accountRequest().anotherAuthorizationToken().receiveResponse();

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('feature-flags-fetched').
                                    expectToBeSentWithArguments(['softphone', undefined]);

                                tester.authCheckRequest().anotherAuthorizationToken().receiveResponse();
                                tester.statusesRequest().createExpectation().
                                    anotherAuthorizationToken().checkCompliance().receiveResponse();
                                tester.settingsRequest().anotherAuthorizationToken().receiveResponse();
                                tester.talkOptionsRequest().receiveResponse();
                                tester.permissionsRequest().receiveResponse();

                                tester.connectEventsWebSocket(1);
                                tester.connectSIPWebSocket(1);

                                tester.authenticatedUserRequest().receiveResponse();
                                tester.registrationRequest().desktopSoftphone().receiveResponse();

                                tester.allowMediaInput();
                            });
                            it('Выбираю статус. Список статусов скрыт.', function() {
                                tester.statusesList.item('Нет на месте').click();
                                tester.userStateUpdateRequest().receiveResponse();

                                tester.statusesList.expectNotToExist();
                            });
                            it('Отображены статусы.', function() {
                                tester.statusesList.item('Не беспокоить').expectToBeSelected();
                                tester.body.expectTextContentNotToHaveSubstring('karadimova Не беспокоить');
                            });
                        });
                        describe('Поступает входящий звонок от пользователя имеющего открытые сделки.', function() {
                            let incomingCall;

                            beforeEach(function() {
                                incomingCall = tester.incomingCall().receive();
                                tester.numaRequest().receiveResponse();
                                tester.outCallEvent().activeLeads().receive();

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('resize').
                                    expectToBeSentWithArguments({
                                        width: 340,
                                        height: 568
                                    });

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('incoming-call').
                                    expectToBeSentWithArguments(false);
                            });

                            it(
                                'Нажимаю на цифру. Звонок принят. Нажимаю на решетку. Отправляется DTMF. Звучит тон.',
                            function() {
                                utils.pressEnter();

                                tester.firstConnection.connectWebRTC();
                                tester.firstConnection.callTrackHandler();

                                tester.allowMediaInput();
                                tester.firstConnection.addCandidate();
                                tester.requestAcceptIncomingCall();

                                utils.pressKey('7');
                                tester.dtmf('7').send();
                                tester.expectToneSevenToPlay();
                            });
                            it('Нажимаю на клавишу Esc. Звонок отклоняется.', function() {
                                utils.pressEscape();

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('call-end').
                                    expectToBeSentWithArguments(true);

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('resize').
                                    expectToBeSentWithArguments({
                                        width: 340,
                                        height: 212
                                    });

                                incomingCall.expectTemporarilyUnavailableToBeSent();
                            });
                            it('Нажимаю на открытую сделку. Открывается страница сделки.', function() {
                                tester.anchor('По звонку с 79154394340').click();

                                getPackage('electron').shell.expectExternalUrlToBeOpened(
                                    'https://comagicwidgets.amocrm.ru/leads/detail/3003651'
                                );
                            });
                        });
                        describe('Нажимаю на кнопку дебага.', function() {
                            beforeEach(function() {
                                tester.bugButton.click();

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('collect_logs');
                            });

                            it('Логи собраны. Загружается архив с логами. Спиннер скрыт.', function() {
                                tester.disableTimeout(() => getPackage('electron').ipcRenderer.receiveMessage(
                                    'logs_collected',
                                    new JsTester_ZipArchive()
                                ));

                                blobsTester.getLast().
                                    expectToHaveType('application/zip').
                                    expectToBeCreatedFromArray(new JsTester_ZipArchive());

                                tester.spinner.expectNotToExist();
                            });
                            it('Отображен спиннер.', function() {
                                tester.spinner.expectToBeVisible();
                            });
                        });
                        describe('Открываю таблицу сотрудников. Токен истек.', function() {
                            let refreshRequest;

                            beforeEach(function() {
                                tester.addressBookButton.click();

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('resize').
                                    expectToBeSentWithArguments({
                                        width: 340,
                                        height: 568
                                    });

                                tester.usersRequest().receiveResponse();
                                tester.usersInGroupsRequest().expectToBeSent();
                                tester.groupsRequest().accessTokenExpired().receiveResponse();

                                refreshRequest = tester.refreshRequest().expectToBeSent()
                            });

                            it(
                                'Не удалось обновить токен. Авторизуюсь заново. Пытаюсь поменять статус, но токен ' +
                                'истек.',
                            function() {
                                refreshRequest.refreshTokenExpired().receiveResponse();
                                tester.userLogoutRequest().receiveResponse();

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('resize').
                                    expectToBeSentWithArguments({
                                        width: 300,
                                        height: 350
                                    });

                                tester.authLogoutRequest().receiveResponse();
                                tester.eventsWebSocket.finishDisconnecting();
                                tester.registrationRequest().desktopSoftphone().expired().receiveResponse();

                                spendTime(2000);
                                tester.webrtcWebsocket.finishDisconnecting();

                                tester.input.withFieldLabel('Логин').fill('botusharova');
                                tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                                tester.button('Войти').click();

                                tester.loginRequest().receiveResponse();

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('resize').
                                    expectToBeSentWithArguments({
                                        width: 340,
                                        height: 212
                                    });

                                tester.configRequest().softphone().receiveResponse();

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('resize').
                                    expectToBeSentWithArguments({
                                        width: 340,
                                        height: 568
                                    });

                                tester.usersRequest().receiveResponse(),
                                tester.usersInGroupsRequest().receiveResponse(),
                                tester.groupsRequest().receiveResponse();

                                tester.accountRequest().receiveResponse();
                                
                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('feature-flags-fetched').
                                    expectToBeSentWithArguments(['softphone', undefined]);

                                tester.authCheckRequest().receiveResponse();
                                tester.statusesRequest().receiveResponse();
                                    
                                tester.settingsRequest().receiveResponse();
                                tester.talkOptionsRequest().receiveResponse();
                                tester.permissionsRequest().receiveResponse();

                                tester.connectEventsWebSocket(1);
                                tester.connectSIPWebSocket(1);

                                tester.authenticatedUserRequest().receiveResponse();
                                tester.registrationRequest().desktopSoftphone().receiveResponse();

                                tester.allowMediaInput();

                                tester.userName.click();

                                tester.statusesList.item('Нет на месте').click();
                                tester.userStateUpdateRequest().accessTokenExpired().receiveResponse();

                                tester.refreshRequest().receiveResponse();
                                tester.userStateUpdateRequest().receiveResponse();
                            });
                            it('Токен обновлен. Запросы переотправлены.', function() {
                                refreshRequest.receiveResponse();

                                tester.groupsRequest().receiveResponse();

                                tester.softphone.expectToHaveTextContent(
                                    'Сотрудники Группы ' +

                                    'Божилова Йовка 296 ' +
                                    'Господинова Николина 295 ' +
                                    'Шалева Дора 8258'
                                );
                            });
                        });
                        describe('Открываю список номеров.', function() {
                            beforeEach(function() {
                                windowSize.setHeight(212);
                                tester.select.arrow.click();
                            });

                            it('Нажимаю на кнопку сворачивания списка.', function() {
                                tester.button('Отменить').click();
                                tester.select.popup.expectNotToExist();
                            });
                            it('Растягиваю окно. Список меняет положение и размер.', function() {
                                windowSize.setHeight(568);

                                tester.select.popup.expectToHaveTopOffset(92);
                                tester.select.popup.expectToHaveHeight(331);

                                tester.button('Отменить').expectNotToExist();
                            });
                            it(
                                'Закрываю список. Растягиваю окно. Открываю список. Список меняет положение и размер.',
                            function() {
                                tester.select.arrow.click();
                                windowSize.setHeight(568);
                                tester.select.arrow.click();

                                tester.select.popup.expectToHaveTopOffset(92);
                                tester.select.popup.expectToHaveHeight(331);

                                tester.button('Отменить').expectNotToExist();
                            });
                            it('Список вписан в окно.', function() {
                                tester.select.popup.expectToHaveTopOffset(4);
                                tester.select.popup.expectToHaveHeight(204);
                            });
                        });
                        describe('Получено обновление.', function() {
                            beforeEach(function() {
                                getPackage('electron').ipcRenderer.receiveMessage('update-downloaded');
                            });

                            it('Нажимаю на кнопку "Обновить".', function() {
                                tester.button('Обновить').click();

                                getPackage('electron').ipcRenderer.
                                    recentlySentMessage().
                                    expectToBeSentToChannel('quit-and-install');
                            });
                            it('Отображено сообщение о получении обновления.', function() {
                                tester.body.expectTextContentToHaveSubstring('Получено обновление');
                            });
                        });
                        it(
                            'Софтфон открыт в другом окне. Раскрываю список статусов. Нажимаю на кнопку "Выход". ' +
                            'Вхожу в софтфон заново. Удалось войти. Софтфон готов к работе.',
                        function() {
                            tester.eventsWebSocket.disconnect(4429);
                            tester.authLogoutRequest().receiveResponse();
                            tester.registrationRequest().desktopSoftphone().expired().receiveResponse();
                            
                            spendTime(2000);
                            tester.webrtcWebsocket.finishDisconnecting();

                            tester.userName.click();
                            tester.statusesList.item('Выход').click();

                            tester.userLogoutRequest().receiveResponse();

                            getPackage('electron').ipcRenderer.
                                recentlySentMessage().
                                expectToBeSentToChannel('resize').
                                expectToBeSentWithArguments({
                                    width: 300,
                                    height: 350
                                });

                            tester.input.withFieldLabel('Логин').fill('botusharova');
                            tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                            tester.button('Войти').click();

                            tester.loginRequest().anotherAuthorizationToken().receiveResponse();

                            getPackage('electron').ipcRenderer.
                                recentlySentMessage().
                                expectToBeSentToChannel('resize').
                                expectToBeSentWithArguments({
                                    width: 340,
                                    height: 212
                                });

                            tester.configRequest().softphone().receiveResponse();

                            tester.accountRequest().anotherAuthorizationToken().receiveResponse();

                            getPackage('electron').ipcRenderer.
                                recentlySentMessage().
                                expectToBeSentToChannel('feature-flags-fetched').
                                expectToBeSentWithArguments(['softphone', undefined]);

                            tester.authCheckRequest().anotherAuthorizationToken().receiveResponse();
                            tester.statusesRequest().createExpectation().
                                anotherAuthorizationToken().checkCompliance().receiveResponse();
                            tester.settingsRequest().anotherAuthorizationToken().receiveResponse();
                            tester.talkOptionsRequest().receiveResponse();
                            tester.permissionsRequest().receiveResponse();

                            tester.connectEventsWebSocket(1);
                            tester.connectSIPWebSocket(1);

                            tester.authenticatedUserRequest().receiveResponse();
                            tester.registrationRequest().desktopSoftphone().receiveResponse();

                            tester.allowMediaInput();

                            tester.phoneField.fill('79161234567');
                            tester.callStartingButton.expectNotToHaveAttribute('disabled');
                            tester.select.expectNotToExist();
                        });
                        it(
                            'Ввожу номер телефона. Нажимаю на кнпоку вызова. Поступил входящий звонок. Отображено ' +
                            'сообщение о звонке.',
                        function() {
                            tester.phoneField.fill('79161234567');
                            tester.callStartingButton.click();

                            tester.firstConnection.connectWebRTC();
                            tester.allowMediaInput();

                            tester.outboundCall().start().setRinging().setAccepted();
                            tester.firstConnection.callTrackHandler();

                            tester.numaRequest().receiveResponse();
                            tester.outCallSessionEvent().receive();

                            tester.incomingCall().thirdNumber().receive();
                            tester.numaRequest().thirdNumber().receiveResponse();
                            tester.outCallEvent().anotherPerson().receive();

                            getPackage('electron').ipcRenderer.
                                recentlySentMessage().
                                expectToBeSentToChannel('incoming-call').
                                expectToBeSentWithArguments(false);

                            tester.softphone.expectTextContentToHaveSubstring(
                                'Гигова Петранка Входящий...'
                            );
                        });
                        it('Открываю историю звонков. Открывается страница контакта.', function() {
                            tester.callsHistoryButton.click();

                            getPackage('electron').ipcRenderer.
                                recentlySentMessage().
                                expectToBeSentToChannel('resize').
                                expectToBeSentWithArguments({
                                    width: 340,
                                    height: 568
                                });

                            tester.callsRequest().receiveResponse();
                            tester.callsHistoryRow.withText('Гяурова Марийка').name.click();

                            getPackage('electron').shell.
                                expectExternalUrlToBeOpened('https://comagicwidgets.amocrm.ru/contacts/detail/218401');
                        });
                        it('Нажимаю на кнопку диалпада. Раскрываю список статусов. Отображены статусы.', function() {
                            tester.dialpadVisibilityButton.click();

                            getPackage('electron').ipcRenderer.
                                recentlySentMessage().
                                expectToBeSentToChannel('resize').
                                expectToBeSentWithArguments({
                                    width: 340,
                                    height: 568
                                });

                            tester.userName.click();

                            tester.statusesList.item('Не беспокоить').expectToBeSelected();
                            tester.body.expectTextContentNotToHaveSubstring('karadimova Не беспокоить');
                        });
                        it('Помещаю курсор над иконкой аккаунта. Список статусов не открывается.', function() {
                            tester.userName.putMouseOver();
                            tester.statusesList.item('Не беспокоить').expectNotToExist();
                        });
                        it('Нажимаю на цифру. Поле для ввода номера фокусируется.', function() {
                            utils.pressKey('7');
                            tester.phoneField.expectToBeFocused();
                        });
                        it('Получена новая версия. Отправлено сообщение в бэк электрона.', function() {
                            tester.applicationVersionChanged().receive();

                            getPackage('electron').ipcRenderer.
                                recentlySentMessage().
                                expectToBeSentToChannel('application-version-changed').
                                expectToBeSentWithArguments('6.6.666');
                        });
                        it('Некие сообщения выведены в лог.', function() {
                            tester.phoneField.expectNotToBeFocused();

                            getPackage('electron-log').expectToContain('State changed');
                            getPackage('electron-log').expectToContain('$REACT_APP_AUTH_URL');
                        });
                    });
                    it('SIP-линия не зарегистрирована. Раскрываю список статусов. Отображены статусы.', function() {
                        authenticatedUserRequest.sipIsOffline().receiveResponse();
                        tester.userName.click();

                        tester.statusesList.item('Не беспокоить').expectToBeSelected();
                    });
                });
                it('Не удалось авторизоваться в софтфоне.', function() {
                    authCheckRequest.invalidToken().receiveResponse();
                    tester.userLogoutRequest().receiveResponse();

                    getPackage('electron').ipcRenderer.
                        recentlySentMessage().
                        expectToBeSentToChannel('resize').
                        expectToBeSentWithArguments({
                            width: 300,
                            height: 350
                        });
                    
                    tester.authLogoutRequest().invalidToken().receiveResponse();

                    tester.button('Войти').expectToBeVisible();
                });
            });
            it('Софтфон недоступен. Отображена форма аутентификации.', function() {
                accountRequest.softphoneUnavailable().receiveResponse();
                tester.userLogoutRequest().receiveResponse();

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('resize').
                    expectToBeSentWithArguments({
                        width: 300,
                        height: 350
                    });

                tester.button('Войти').expectToBeVisible();
            });
        });
        describe(
            'Настройки отображения поверх окон при входящем и скрывания при завершении звонка не сохранены.',
        function() {
            beforeEach(function() {
                tester = new Tester({
                    ...options,
                    appName: 'softphone'
                });

                tester.input.withFieldLabel('Логин').fill('botusharova');
                tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                tester.button('Войти').click();

                tester.loginRequest().receiveResponse();
                tester.configRequest().softphone().receiveResponse();
                    
                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('resize').
                    expectToBeSentWithArguments({
                        width: 340,
                        height: 212
                    });

                getPackage('electron').ipcRenderer.recentlySentMessage().expectToBeSentToChannel('app-ready');

                tester.accountRequest().receiveResponse();

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('feature-flags-fetched').
                    expectToBeSentWithArguments(['softphone', undefined]);

                tester.authCheckRequest().receiveResponse();
                tester.statusesRequest().receiveResponse();
                tester.settingsRequest().receiveResponse();
                notificationTester.grantPermission();
                tester.talkOptionsRequest().receiveResponse();
                tester.permissionsRequest().receiveResponse();

                tester.connectEventsWebSocket();
                tester.connectSIPWebSocket();

                tester.allowMediaInput();

                tester.authenticatedUserRequest().receiveResponse();
                tester.registrationRequest().desktopSoftphone().receiveResponse();
            });

            describe('Поступил входящий звонок.', function() {
                let incomingCall;

                beforeEach(function() {
                    incomingCall = tester.incomingCall().receive();
                    tester.numaRequest().receiveResponse();
                    tester.outCallEvent().receive();

                    getPackage('electron').ipcRenderer.
                        recentlySentMessage().
                        expectToBeSentToChannel('resize').
                        expectToBeSentWithArguments({
                            width: 340,
                            height: 568
                        });

                    getPackage('electron').ipcRenderer.
                        recentlySentMessage().
                        expectToBeSentToChannel('incoming-call').
                        expectToBeSentWithArguments(true);
                });

                it('Звонок завершен. Отправлено сообщение о необходимости закрыть окно софтфона.', function() {
                    tester.stopCallButton.click();

                    getPackage('electron').ipcRenderer.
                        recentlySentMessage().
                        expectToBeSentToChannel('resize').
                        expectToBeSentWithArguments({
                            width: 340,
                            height: 212
                        });

                    getPackage('electron').ipcRenderer.
                        recentlySentMessage().
                        expectToBeSentToChannel('call-end').
                        expectToBeSentWithArguments(true);

                    incomingCall.expectTemporarilyUnavailableToBeSent();
                });
                it('Не одно сообщение не отправлено в бэк электрона.', function() {
                    getPackage('electron').ipcRenderer.
                        recentlySentMessage().
                        expectNotToBeSent();
                });
            });
            describe('Открываю настройки.', function() {
                beforeEach(function() {
                    tester.settingsButton.click();

                    getPackage('electron').ipcRenderer.
                        recentlySentMessage().
                        expectToBeSentToChannel('resize').
                        expectToBeSentWithArguments({
                            width: 340,
                            height: 568
                        });
                });

                it('Снимаю отметку со свитчбокса "Скрывать после звонка". Отметка снята.', function() {
                    tester.button('Скрывать после звонка').click();

                    if (localStorage.getItem('clct:close_on_call_end') !== 'false') {
                        throw new Error('Значение свитчбокса должно быть сохранено.');
                    }

                    tester.button('Скрывать после звонка').expectNotToBeChecked();
                });
                it('Свитчбоксы "Открывать во время звонка" и "Скрывать после звонка" отмечены.', function() {
                    tester.button('Открывать во время звонка').expectToBeChecked();
                    tester.button('Скрывать после звонка').expectToBeChecked();
                });
            });
        });
        describe('Софтфон должен отображаться поверх окон при входящем.', function() {
            beforeEach(function() {
                localStorage.setItem('clct:to_top_on_call', 'true');

                tester = new Tester({
                    ...options,
                    appName: 'softphone'
                });

                tester.input.withFieldLabel('Логин').fill('botusharova');
                tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                tester.button('Войти').click();

                tester.loginRequest().receiveResponse();
                tester.configRequest().softphone().receiveResponse();

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('resize').
                    expectToBeSentWithArguments({
                        width: 340,
                        height: 212
                    });

                getPackage('electron').ipcRenderer.recentlySentMessage().expectToBeSentToChannel('app-ready');

                tester.accountRequest().receiveResponse();

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('feature-flags-fetched').
                    expectToBeSentWithArguments(['softphone', undefined]);

                tester.authCheckRequest().receiveResponse();
                tester.statusesRequest().receiveResponse();
                tester.settingsRequest().receiveResponse();
                notificationTester.grantPermission();
                tester.talkOptionsRequest().receiveResponse();
                tester.permissionsRequest().receiveResponse();

                tester.connectEventsWebSocket();
                tester.connectSIPWebSocket();

                tester.allowMediaInput();

                tester.authenticatedUserRequest().receiveResponse();
                tester.registrationRequest().desktopSoftphone().receiveResponse();
            });

            it('Поступил входящий звонок. Отправлено сообщение о необходимости поднять окно софтфона.', function() {
                tester.incomingCall().receive();
                tester.numaRequest().receiveResponse();
                tester.outCallEvent().receive();

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('resize').
                    expectToBeSentWithArguments({
                        width: 340,
                        height: 568
                    });

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('incoming-call').
                    expectToBeSentWithArguments(true);
            });
            it('Открываю настройки. Свитчбокс "Открывать во время звонка" отмечен.', function() {
                tester.settingsButton.click();

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('resize').
                    expectToBeSentWithArguments({
                        width: 340,
                        height: 568
                    });

                tester.button('Открывать во время звонка').expectToBeChecked();
            });
        });
        describe('Софтфон не должен скрываться после звонка.', function() {
            beforeEach(function() {
                localStorage.setItem('clct:close_on_call_end', 'false');

                tester = new Tester({
                    ...options,
                    appName: 'softphone'
                });

                tester.input.withFieldLabel('Логин').fill('botusharova');
                tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                tester.button('Войти').click();

                tester.loginRequest().receiveResponse();
                tester.configRequest().softphone().receiveResponse();

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('resize').
                    expectToBeSentWithArguments({
                        width: 340,
                        height: 212
                    });

                getPackage('electron').ipcRenderer.recentlySentMessage().expectToBeSentToChannel('app-ready');

                tester.accountRequest().receiveResponse();

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('feature-flags-fetched').
                    expectToBeSentWithArguments(['softphone', undefined]);

                tester.authCheckRequest().receiveResponse();
                tester.statusesRequest().receiveResponse();
                tester.settingsRequest().receiveResponse();
                notificationTester.grantPermission();
                tester.talkOptionsRequest().receiveResponse();
                tester.permissionsRequest().receiveResponse();

                tester.connectEventsWebSocket();
                tester.connectSIPWebSocket();

                tester.allowMediaInput();

                tester.authenticatedUserRequest().receiveResponse();
                tester.registrationRequest().desktopSoftphone().receiveResponse();
            });

            it(
                'Поступил входящий звонок. Звонок завершен. Отправлено сообщение о том, что скрывать окно софтфона ' +
                'не нужно.',
            function() {
                const incomingCall = tester.incomingCall().receive();
                tester.numaRequest().receiveResponse();
                tester.outCallEvent().receive();

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('resize').
                    expectToBeSentWithArguments({
                        width: 340,
                        height: 568
                    });

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('incoming-call').
                    expectToBeSentWithArguments(true);

                tester.stopCallButton.click();

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('resize').
                    expectToBeSentWithArguments({
                        width: 340,
                        height: 212
                    });

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('call-end').
                    expectToBeSentWithArguments(false);

                incomingCall.expectTemporarilyUnavailableToBeSent();
            });
            it('Открываю настройки. Свитчбокс "Скрывать после звонка" не отмечен.', function() {
                tester.settingsButton.click();

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('resize').
                    expectToBeSentWithArguments({
                        width: 340,
                        height: 568
                    });

                tester.button('Открывать во время звонка').expectToBeChecked();
                tester.button('Скрывать после звонка').expectNotToBeChecked();
            });
        });
        describe('Софтфон должен скрываться после звонка.', function() {
            beforeEach(function() {
                localStorage.setItem('clct:close_on_call_end', 'true');

                tester = new Tester({
                    ...options,
                    appName: 'softphone'
                });

                tester.input.withFieldLabel('Логин').fill('botusharova');
                tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                tester.button('Войти').click();

                tester.loginRequest().receiveResponse();
                tester.configRequest().softphone().receiveResponse();

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('resize').
                    expectToBeSentWithArguments({
                        width: 340,
                        height: 212
                    });

                getPackage('electron').ipcRenderer.recentlySentMessage().expectToBeSentToChannel('app-ready');

                tester.accountRequest().receiveResponse();

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('feature-flags-fetched').
                    expectToBeSentWithArguments(['softphone', undefined]);

                tester.authCheckRequest().receiveResponse();
                tester.statusesRequest().receiveResponse();
                tester.settingsRequest().receiveResponse();
                notificationTester.grantPermission();
                tester.talkOptionsRequest().receiveResponse();
                tester.permissionsRequest().receiveResponse();

                tester.connectEventsWebSocket();
                tester.connectSIPWebSocket();

                tester.allowMediaInput();

                tester.authenticatedUserRequest().receiveResponse();
                tester.registrationRequest().desktopSoftphone().receiveResponse();
            });

            it(
                'Поступил входящий звонок. Звонок завершен. Отправлено сообщение о необходимости скрыть окно софтфона.',
            function() {
                const incomingCall = tester.incomingCall().receive();
                tester.numaRequest().receiveResponse();
                tester.outCallEvent().receive();

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('resize').
                    expectToBeSentWithArguments({
                        width: 340,
                        height: 568
                    });

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('incoming-call').
                    expectToBeSentWithArguments(true);

                tester.stopCallButton.click();
                
                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('resize').
                    expectToBeSentWithArguments({
                        width: 340,
                        height: 212
                    });

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('call-end').
                    expectToBeSentWithArguments(true);

                incomingCall.expectTemporarilyUnavailableToBeSent();
            });
            it('Открываю настройки. Свитчбокс "Скрывать после звонка" отмечен.', function() {
                tester.settingsButton.click();

                getPackage('electron').ipcRenderer.
                    recentlySentMessage().
                    expectToBeSentToChannel('resize').
                    expectToBeSentWithArguments({
                        width: 340,
                        height: 568
                    });

                tester.button('Скрывать после звонка').expectToBeChecked();
            });
        });
        it('Я уже аутентифицирован. Плейсхолдер поля для ввода номера локализован.', function() {
            tester = new Tester({
                ...options,
                isAlreadyAuthenticated: true,
                appName: 'softphone'
            });

            tester.configRequest().softphone().receiveResponse();

            getPackage('electron').ipcRenderer.
                recentlySentMessage().
                expectToBeSentToChannel('resize').
                expectToBeSentWithArguments({
                    width: 340,
                    height: 212
                });

            getPackage('electron').ipcRenderer.recentlySentMessage().expectToBeSentToChannel('app-ready');

            tester.accountRequest().receiveResponse();

            getPackage('electron').ipcRenderer.
                recentlySentMessage().
                expectToBeSentToChannel('feature-flags-fetched').
                expectToBeSentWithArguments(['softphone', undefined]);

            tester.authCheckRequest().receiveResponse();
            tester.statusesRequest().receiveResponse();
            tester.settingsRequest().receiveResponse();
            notificationTester.grantPermission();
            tester.talkOptionsRequest().receiveResponse();
            tester.permissionsRequest().receiveResponse();

            tester.connectEventsWebSocket();
            tester.connectSIPWebSocket();

            tester.allowMediaInput();

            tester.authenticatedUserRequest().receiveResponse();
            tester.registrationRequest().desktopSoftphone().receiveResponse();

            tester.phoneField.expectToHaveValue('Введите номер');
        });
    });
    describe('Ранее были выбраны настройки звука. Открываю настройки звука.', function() {
        let tester;

        beforeEach(function() {
            localStorage.setItem('audioSettings', JSON.stringify({
                shouldPlayCallEndingSignal: false,
                microphone: {
                    deviceId: '98g2j2pg9842gi2gh89hl48ogh2og82h9g724hg42' +
                        '7gla8g2hg289hg9a48ghal4'
                },
                ringtone: {
                    deviceId: '6943f509802439f2c170bea3f42991df56faee134' +
                        'b25b3a2f2a13f0fad6943ab',
                    volume: 25,
                    value: 'default'
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

            tester.masterInfoMessage().receive();
            tester.slavesNotification().expectToBeSent();
            tester.slavesNotification().additional().expectToBeSent();
            tester.masterInfoMessage().tellIsLeader().expectToBeSent();

            tester.authCheckRequest().receiveResponse();
            tester.statusesRequest().receiveResponse();
            
            tester.settingsRequest().secondRingtone().isNeedDisconnectSignal().receiveResponse();
            tester.slavesNotification().twoChannels().enabled().expectToBeSent();

            tester.othersNotification().widgetStateUpdate().expectToBeSent();
            tester.othersNotification().updateSettings().shouldPlayCallEndingSignal().anotherCustomRingtone().
                expectToBeSent();

            notificationTester.grantPermission();
            tester.talkOptionsRequest().receiveResponse();
            tester.permissionsRequest().receiveResponse();

            tester.ringtoneRequest().receiveResponse();
            fileReader.accomplishFileLoading(tester.secondRingtone);
            mediaStreamsTester.setIsAbleToPlayThough('data:audio/wav;base64,' + tester.secondRingtone);

            tester.connectEventsWebSocket();
            tester.slavesNotification().twoChannels().enabled().softphoneServerConnected().expectToBeSent();

            tester.connectSIPWebSocket();
            tester.slavesNotification().twoChannels().webRTCServerConnected().softphoneServerConnected().
                expectToBeSent();

            tester.authenticatedUserRequest().receiveResponse();
            tester.slavesNotification().userDataFetched().twoChannels().webRTCServerConnected().
                softphoneServerConnected().expectToBeSent();

            tester.registrationRequest().receiveResponse();
            tester.slavesNotification().userDataFetched().twoChannels().softphoneServerConnected().
                webRTCServerConnected().registered().expectToBeSent();

            tester.allowMediaInput();
            tester.slavesNotification().userDataFetched().twoChannels().available().expectToBeSent();

            tester.button('Настройки').click();
            tester.popover.button('Софтфон').click();

            tester.button('Звук').click();
        });

        describe('Поступил входящий звонок.', function() {
            let incomingCall;

            beforeEach(function() {
                incomingCall = tester.incomingCall().receive();
                tester.slavesNotification().available().userDataFetched().twoChannels().incoming().progress().
                    expectToBeSent();

                tester.numaRequest().receiveResponse();

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

                        incomingCall.expectOkToBeSent();
                        tester.slavesNotification().available().userDataFetched().twoChannels().incoming().confirmed().
                            expectToBeSent();
                    });

                    it('Выбираю другой рингтон. Звучит больше не звучит.', function() {
                        tester.fieldRow('Мелодия звонка').select.arrow.click();
                        tester.select.option('Мелодия звонка 3').click();

                        tester.settingsUpdatingRequest().thirdRingtone().receiveResponse();
                        tester.settingsRequest().thirdRingtone().isNeedDisconnectSignal().receiveResponse();

                        tester.othersNotification().widgetStateUpdate().expectToBeSent();
                        tester.othersNotification().updateSettings().shouldPlayCallEndingSignal().customRingtone().
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

                incomingCall.expectOkToBeSent();
                tester.slavesNotification().available().userDataFetched().twoChannels().incoming().confirmed().
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

                tester.othersNotification().widgetStateUpdate().expectToBeSent();
                tester.othersNotification().updateSettings().shouldPlayCallEndingSignal().customRingtone().
                    expectToBeSent();

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

                tester.othersNotification().widgetStateUpdate().expectToBeSent();
                tester.othersNotification().updateSettings().shouldPlayCallEndingSignal().defaultRingtone().
                    expectToBeSent();

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

            tester.masterInfoMessage().receive();
            tester.slavesNotification().expectToBeSent();
            tester.slavesNotification().additional().expectToBeSent();
            tester.masterInfoMessage().tellIsLeader().expectToBeSent();

            tester.authCheckRequest().receiveResponse();
            tester.statusesRequest().receiveResponse();

            tester.settingsRequest().receiveResponse();
            tester.slavesNotification().twoChannels().enabled().expectToBeSent();

            tester.othersNotification().widgetStateUpdate().expectToBeSent();
            tester.othersNotification().updateSettings().shouldNotPlayCallEndingSignal().expectToBeSent();

            notificationTester.grantPermission();
            tester.talkOptionsRequest().receiveResponse();
            tester.permissionsRequest().receiveResponse();

            tester.connectEventsWebSocket();
            tester.slavesNotification().twoChannels().enabled().softphoneServerConnected().expectToBeSent();

            tester.connectSIPWebSocket();
            tester.slavesNotification().twoChannels().softphoneServerConnected().webRTCServerConnected().
                expectToBeSent();

            authenticatedUserRequest = tester.authenticatedUserRequest().expectToBeSent();

            tester.registrationRequest().receiveResponse();
            tester.slavesNotification().twoChannels().softphoneServerConnected().webRTCServerConnected().registered().
                expectToBeSent();

            tester.allowMediaInput();
            tester.slavesNotification().twoChannels().available().expectToBeSent();

            authenticatedUserRequest.receiveResponse();
            tester.slavesNotification().userDataFetched().twoChannels().available().expectToBeSent();
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

        tester.masterInfoMessage().receive();
        tester.slavesNotification().expectToBeSent();
        tester.slavesNotification().additional().expectToBeSent();
        tester.masterInfoMessage().tellIsLeader().expectToBeSent();

        tester.authCheckRequest().receiveResponse();
        tester.statusesRequest().receiveResponse();
        
        tester.settingsRequest().receiveResponse();
        tester.slavesNotification().twoChannels().enabled().expectToBeSent();

        tester.othersNotification().widgetStateUpdate().expectToBeSent();
        tester.othersNotification().updateSettings().shouldNotPlayCallEndingSignal().expectToBeSent();

        notificationTester.grantPermission();
        tester.talkOptionsRequest().receiveResponse();
        tester.permissionsRequest().receiveResponse();

        tester.connectEventsWebSocket();
        tester.slavesNotification().twoChannels().enabled().softphoneServerConnected().expectToBeSent();

        tester.connectSIPWebSocket();
        tester.slavesNotification().twoChannels().webRTCServerConnected().softphoneServerConnected().expectToBeSent();

        tester.authenticatedUserRequest().receiveResponse();
        tester.slavesNotification().userDataFetched().twoChannels().webRTCServerConnected().softphoneServerConnected().
            expectToBeSent();
        
        tester.registrationRequest().receiveResponse();
        tester.slavesNotification().userDataFetched().twoChannels().webRTCServerConnected().softphoneServerConnected().
            registered().expectToBeSent();

        tester.allowMediaInput();
        tester.slavesNotification().userDataFetched().twoChannels().available().expectToBeSent();

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

        tester.masterInfoMessage().receive();
        tester.slavesNotification().expectToBeSent();
        tester.slavesNotification().additional().expectToBeSent();
        tester.masterInfoMessage().tellIsLeader().expectToBeSent();

        tester.authCheckRequest().receiveResponse();
        tester.statusesRequest().receiveResponse();
        
        tester.settingsRequest().secondRingtone().isNeedDisconnectSignal().receiveResponse();
        tester.slavesNotification().twoChannels().enabled().expectToBeSent();

        tester.othersNotification().widgetStateUpdate().expectToBeSent();
        tester.othersNotification().updateSettings().shouldPlayCallEndingSignal().anotherCustomRingtone().
            expectToBeSent();

        notificationTester.grantPermission();
        tester.talkOptionsRequest().receiveResponse();
        tester.permissionsRequest().receiveResponse();

        tester.ringtoneRequest().receiveResponse();
        fileReader.accomplishFileLoading(tester.secondRingtone);
        mediaStreamsTester.setIsAbleToPlayThough('data:audio/wav;base64,' + tester.secondRingtone);

        tester.connectEventsWebSocket();
        tester.slavesNotification().twoChannels().enabled().softphoneServerConnected().expectToBeSent();

        tester.connectSIPWebSocket();
        tester.slavesNotification().twoChannels().webRTCServerConnected().softphoneServerConnected().expectToBeSent();

        tester.authenticatedUserRequest().receiveResponse();
        tester.slavesNotification().userDataFetched().twoChannels().webRTCServerConnected().softphoneServerConnected().
            expectToBeSent();

        tester.registrationRequest().receiveResponse();
        tester.slavesNotification().userDataFetched().twoChannels().webRTCServerConnected().softphoneServerConnected().
            registered().expectToBeSent();

        tester.allowMediaInput();
        tester.slavesNotification().userDataFetched().twoChannels().available().expectToBeSent();

        tester.button('Софтфон').click();
        tester.slavesNotification().additional().visible().expectToBeSent();

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

        tester.masterInfoMessage().receive();
        tester.slavesNotification().expectToBeSent();
        tester.slavesNotification().additional().expectToBeSent();
        tester.masterInfoMessage().tellIsLeader().expectToBeSent();

        tester.authCheckRequest().receiveResponse();
        tester.statusesRequest().receiveResponse();

        tester.settingsRequest().secondRingtone().isNeedDisconnectSignal().receiveResponse();
        tester.slavesNotification().twoChannels().enabled().expectToBeSent();

        tester.othersNotification().widgetStateUpdate().expectToBeSent();
        tester.othersNotification().updateSettings().shouldPlayCallEndingSignal().anotherCustomRingtone().
            expectToBeSent();

        notificationTester.grantPermission();
        tester.talkOptionsRequest().receiveResponse();
        tester.permissionsRequest().receiveResponse();

        tester.ringtoneRequest().receiveResponse();
        fileReader.accomplishFileLoading(tester.secondRingtone);
        mediaStreamsTester.setIsAbleToPlayThough('data:audio/wav;base64,' + tester.secondRingtone);

        tester.connectEventsWebSocket();
        tester.slavesNotification().twoChannels().enabled().softphoneServerConnected().expectToBeSent();

        tester.connectSIPWebSocket();
        tester.slavesNotification().twoChannels().webRTCServerConnected().softphoneServerConnected().expectToBeSent();

        tester.authenticatedUserRequest().receiveResponse();
        tester.slavesNotification().userDataFetched().twoChannels().webRTCServerConnected().softphoneServerConnected().
            expectToBeSent();

        tester.registrationRequest().receiveResponse();
        tester.slavesNotification().userDataFetched().twoChannels().webRTCServerConnected().registered().
            softphoneServerConnected().expectToBeSent();

        tester.allowMediaInput();
        tester.slavesNotification().userDataFetched().twoChannels().available().expectToBeSent();

        tester.button('Софтфон').click();
        tester.slavesNotification().additional().visible().expectToBeSent();

        tester.softphone.expectToBeCollapsed();
        tester.phoneField.expectToBeVisible();
    });
});
