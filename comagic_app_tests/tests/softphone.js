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
            authCheckRequest;

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
                tester.notificationChannel().applyLeader().expectToBeSent();

                const requests = ajax.inAnyOrder();

                reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
                const reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                    reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                    secondAccountRequest = tester.accountRequest().expectToBeSent(requests);
                authCheckRequest = tester.authCheckRequest().expectToBeSent(requests);

                requests.expectToBeSent();

                reportsListRequest.receiveResponse();
                reportTypesRequest.receiveResponse();
                secondAccountRequest.receiveResponse();
            });

            describe('Вкладка является ведущей.', function() {
                beforeEach(function() {
                    tester.masterInfoMessage().receive();
                    tester.slavesNotification().expectToBeSent();
                    tester.slavesNotification().additional().expectToBeSent();

                    tester.notificationChannel().tellIsLeader().expectToBeSent();
                    tester.masterInfoMessage().tellIsLeader().expectToBeSent();
                    tester.notificationChannel().applyLeader().expectToBeSent();

                    authCheckRequest.receiveResponse();
                    tester.talkOptionsRequest().receiveResponse();
                    permissionsRequest = tester.permissionsRequest().expectToBeSent();
                    tester.statusesRequest().receiveResponse();
                    settingsRequest = tester.settingsRequest().expectToBeSent();
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

                            tester.slavesNotification().
                                twoChannels().
                                enabled().
                                expectToBeSent();

                            tester.othersNotification().
                                updateSettings().
                                shouldNotPlayCallEndingSignal().
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

                                    describe('Нажимаю на иконку с телефоном.', function() {
                                        beforeEach(function() {
                                            tester.button('Софтфон').click();
                                            tester.slavesNotification().additional().visible().expectToBeSent();
                                        });

                                        describe('SIP-регистрация завершена.', function() {
                                            beforeEach(function() {
                                                registrationRequest.receiveResponse();

                                                tester.slavesNotification().
                                                    twoChannels().
                                                    available().
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
                                                            tester.callsHistoryRow.
                                                                withText('Гяурова Марийка').
                                                                callIcon.
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

                                                            tester.callsRequest().infiniteScrollSecondPage().
                                                                expectToBeSent();
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

                                                        const outgoingCall = tester.outgoingCall().
                                                            setNumberFromCallsGrid().expectToBeSent();

                                                        tester.slavesNotification().
                                                            available().
                                                            twoChannels().
                                                            sending().
                                                            thirdPhoneNumber().expectToBeSent();

                                                        outgoingCall.setRinging();

                                                        tester.slavesNotification().
                                                            available().
                                                            twoChannels().
                                                            progress().
                                                            thirdPhoneNumber().
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
                                                        'Нажимаю на строку с контактом. Открывается раздел контактов.',
                                                    function() {
                                                        tester.callsHistoryRow.
                                                            withText('Манова Тома').
                                                            name.
                                                            click();

                                                        tester.contactsRequest().
                                                            differentNames().
                                                            receiveResponse();

                                                        tester.contactCommunicationsRequest().
                                                            receiveResponse();

                                                        tester.usersRequest().
                                                            forContacts().
                                                            receiveResponse();

                                                        tester.contactRequest().receiveResponse();
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

                                                        tester.callsHistoryRow.
                                                            withText('Гяурова Марийка').
                                                            direction.
                                                            expectNotToHaveClass('cmg-direction-icon-failed');

                                                        tester.callsHistoryRow.
                                                            withText('Гяурова Марийка').
                                                            direction.
                                                            expectToHaveClass('cmg-incoming-direction-icon');

                                                        tester.callsHistoryRow.
                                                            withText('Гяурова Марийка').
                                                            direction.
                                                            expectNotToHaveClass('cmg-direction-icon-transfer');

                                                        tester.callsHistoryRow.
                                                            withText('Манова Тома').
                                                            direction.
                                                            expectNotToHaveClass('cmg-direction-icon-failed');

                                                        tester.callsHistoryRow.
                                                            withText('Манова Тома').
                                                            direction.
                                                            expectToHaveClass('cmg-outgoing-direction-icon');

                                                        tester.callsHistoryRow.
                                                            withText('Манова Тома').
                                                            direction.
                                                            expectNotToHaveClass('cmg-direction-icon-transfer');

                                                        tester.softphone.expectToBeExpanded();
                                                    });
                                                });
                                                describe('Не было ни одного звонка за три месяца.', function() {
                                                    beforeEach(function() {
                                                        callsRequest.noCalls().receiveResponse();

                                                        callsRequest = tester.callsRequest().
                                                            fromHalfOfTheYearAgo().
                                                            expectToBeSent();
                                                    });

                                                    it('Найдены звонки за полгода. Звонки отображены.', function() {
                                                        callsRequest.receiveResponse();

                                                        tester.softphone.
                                                            expectTextContentToHaveSubstring('Гяурова Марийка 08:03');
                                                    });
                                                    it(
                                                        'Не было ни одного звонка за полгода. Отображено сообщение ' +
                                                        'об отсутствии звонков.',
                                                    function() {
                                                        callsRequest.noCalls().receiveResponse();

                                                        tester.softphone.expectToHaveTextContent(
                                                            'Совершите звонок для отображения истории'
                                                        );
                                                    });
                                                });
                                                it(
                                                    'Есть записи в которых не найденн контакт. Нажимаю на номер записи. ' +
                                                    'Открыта форма создания контакта.',
                                                function() {
                                                    callsRequest.noContact().receiveResponse();

                                                    tester.callsHistoryRow.
                                                        withText('+7 (495) 023-06-26').
                                                        name.
                                                        click();

                                                    tester.contactsRequest().
                                                        differentNames().
                                                        receiveResponse();

                                                    tester.usersRequest().
                                                        forContacts().
                                                        receiveResponse();

                                                    tester.contactBar.expectTextContentToHaveSubstring(
                                                        'Телефоны ' +
                                                        '74950230626'
                                                    );

                                                    tester.button('Сохранить').expectNotToExist();
                                                });
                                                it(
                                                    'Звонок является трансфером. Отображена иконка трансфера.',
                                                function() {
                                                    callsRequest.transferCall().receiveResponse();

                                                    tester.callsHistoryRow.
                                                        withText('Гяурова Марийка').
                                                        direction.
                                                        expectNotToHaveClass('cmg-direction-icon-failed');

                                                    tester.callsHistoryRow.
                                                        withText('Гяурова Марийка').
                                                        direction.
                                                        expectToHaveClass('cmg-incoming-direction-icon');

                                                    tester.callsHistoryRow.
                                                        withText('Гяурова Марийка').
                                                        direction.
                                                        expectToHaveClass('cmg-direction-icon-transfer');
                                                });
                                            });
                                            describe('Нажимаю на кнопку "Выход". Вхожу в лк заново.', function() {
                                                beforeEach(function() {
                                                    tester.userName.putMouseOver();
                                                    tester.logoutButton.click();

                                                    tester.userLogoutRequest().receiveResponse();
                                                    tester.masterInfoMessage().leaderDeath().expectToBeSent();

                                                    tester.slavesNotification().
                                                        userDataFetched().
                                                        twoChannels().
                                                        microphoneAccessGranted().
                                                        destroyed().
                                                        enabled().
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

                                                    tester.loginRequest().
                                                        anotherAuthorizationToken().
                                                        receiveResponse();

                                                    accountRequest = tester.accountRequest().
                                                        anotherAuthorizationToken().
                                                        expectToBeSent();
                                                });

                                                it('Софтфон недоступен.', function() {
                                                    accountRequest.softphoneUnavailable().receiveResponse();
                                                    
                                                    tester.reportGroupsRequest().
                                                        anotherAuthorizationToken().
                                                        receiveResponse();

                                                    tester.reportsListRequest().receiveResponse();
                                                    tester.reportTypesRequest().receiveResponse();

                                                    tester.softphone.expectNotToExist();
                                                    tester.button('Софтфон').expectNotToExist();
                                                });
                                                it('Софтфон доступен. Отображен софтфон.', function() {
                                                    accountRequest.receiveResponse();

                                                    tester.reportGroupsRequest().
                                                        anotherAuthorizationToken().
                                                        receiveResponse();

                                                    tester.reportsListRequest().receiveResponse();
                                                    tester.reportTypesRequest().receiveResponse();

                                                    const requests = ajax.inAnyOrder();

                                                    const secondAccountRequest = tester.accountRequest().
                                                        anotherAuthorizationToken().
                                                        expectToBeSent(requests);

                                                    const authCheckRequest = tester.authCheckRequest().
                                                        anotherAuthorizationToken().
                                                        expectToBeSent(requests);

                                                    requests.expectToBeSent();

                                                    secondAccountRequest.receiveResponse();
                                                    authCheckRequest.receiveResponse();

                                                    tester.masterInfoMessage().receive();
                                                    tester.slavesNotification().expectToBeSent();
                                                    
                                                    tester.slavesNotification().
                                                        additional().
                                                        visible().
                                                        expectToBeSent();

                                                    tester.masterInfoMessage().tellIsLeader().expectToBeSent();

                                                    tester.talkOptionsRequest().receiveResponse();
                                                    tester.permissionsRequest().receiveResponse();

                                                    tester.statusesRequest().
                                                        createExpectation().
                                                        anotherAuthorizationToken().
                                                        checkCompliance().
                                                        createResponse().
                                                        noNotAtWorkplace().
                                                        includesAutoCall().
                                                        receive();

                                                    tester.settingsRequest().
                                                        anotherAuthorizationToken().
                                                        receiveResponse();

                                                    tester.slavesNotification().
                                                        twoChannels().
                                                        enabled().
                                                        expectToBeSent();

                                                    tester.othersNotification().
                                                        updateSettings().
                                                        shouldNotPlayCallEndingSignal().
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
                                                        softphoneServerConnected().
                                                        webRTCServerConnected().
                                                        expectToBeSent();

                                                    tester.authenticatedUserRequest().receiveResponse();

                                                    tester.slavesNotification().
                                                        userDataFetched().
                                                        twoChannels().
                                                        softphoneServerConnected().
                                                        webRTCServerConnected().
                                                        expectToBeSent();

                                                    tester.registrationRequest().receiveResponse();

                                                    tester.slavesNotification().
                                                        userDataFetched().
                                                        twoChannels().
                                                        webRTCServerConnected().
                                                        registered().
                                                        softphoneServerConnected().
                                                        expectToBeSent();

                                                    tester.allowMediaInput();

                                                    tester.slavesNotification().
                                                        twoChannels().
                                                        available().
                                                        expectToBeSent();

                                                    tester.callStartingButton.expectNotToHaveAttribute('disabled');
                                                    tester.button('Софтфон').expectToBeVisible();

                                                    tester.userName.putMouseOver();

                                                    tester.statusesList.item('Исходящий обзвон').expectToBeVisible();
                                                    tester.statusesList.item('Нет на месте').expectNotToExist();
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

                                                        tester.slavesNotification().
                                                            available().
                                                            twoChannels().
                                                            incoming().
                                                            progress().
                                                            expectToBeSent();

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

                                                                incomingCall.expectOkToBeSent().receiveResponse();

                                                                tester.slavesNotification().
                                                                    available().
                                                                    twoChannels().
                                                                    incoming().
                                                                    confirmed().
                                                                    expectToBeSent();
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
                                                                tester.dialpadButton(1).expectToBeVisible();

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

                                                        incomingCall.expectOkToBeSent().receiveResponse();

                                                        tester.slavesNotification().
                                                            available().
                                                            twoChannels().
                                                            incoming().
                                                            confirmed().
                                                            expectToBeSent();

                                                        tester.dialpadButton(1).expectNotToHaveAttribute('disabled');
                                                    });
                                                    it('Диалпад заблокирован.', function() {
                                                        tester.dialpadButton(1).expectToHaveAttribute('disabled');
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
                                                        tester.dialpadButton(1).expectToBeVisible();
                                                    });
                                                });
                                                describe('Совершаю исходящий звонок.', function() {
                                                    let outgoingCall,
                                                        outCallSessionEvent;

                                                    beforeEach(function() {
                                                        tester.phoneField.fill('79161234567');
                                                        tester.callButton.click();

                                                        tester.firstConnection.connectWebRTC();
                                                        tester.allowMediaInput();

                                                        outgoingCall = tester.outgoingCall().start();

                                                        tester.slavesNotification().
                                                            available().
                                                            twoChannels().
                                                            sending().
                                                            expectToBeSent();

                                                        outgoingCall.setRinging();

                                                        tester.slavesNotification().
                                                            available().
                                                            twoChannels().
                                                            progress().
                                                            expectToBeSent();

                                                        tester.firstConnection.callTrackHandler();

                                                        tester.numaRequest().receiveResponse();
                                                        outCallSessionEvent = tester.outCallSessionEvent();
                                                    });

                                                    describe('Есть открытые сделки.', function() {
                                                        beforeEach(function() {
                                                            outCallSessionEvent.activeLeads().receive();

                                                            tester.outCallSessionEvent().
                                                                activeLeads().
                                                                slavesNotification().
                                                                expectToBeSent();
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
                                                                tester.anchor('По звонку с 79154394340').click();

                                                                windowOpener.expectToHavePath(
                                                                    'https://comagicwidgets.amocrm.ru/leads/detail/' +
                                                                    '3003651'
                                                                );
                                                            });
                                                            it('Софтфон свернут.', function() {
                                                                tester.softphone.expectToBeCollapsed();
                                                            });
                                                        });
                                                        it('Нажимаю на ссылку сделки. Открыта сделка.', function() {
                                                            tester.anchor('По звонку с 79154394340').click();

                                                            windowOpener.expectToHavePath(
                                                                'https://comagicwidgets.amocrm.ru/leads/detail/3003651'
                                                            );
                                                        });
                                                        it('Отображены открытые сделки.', function() {
                                                            tester.softphone.expectToBeExpanded();

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

                                                        tester.dialpadButton(1).expectToBeVisible();

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
                                                        tester.masterInfoMessage().leaderDeath().expectToBeSent();

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

                                                        tester.reportGroupsRequest().receiveResponse();
                                                        tester.reportsListRequest().receiveResponse();
                                                        tester.reportTypesRequest().receiveResponse();

                                                        const requests = ajax.inAnyOrder();

                                                        const secondAccountRequest = tester.accountRequest().
                                                            expectToBeSent(requests);

                                                        const authCheckRequest = tester.authCheckRequest().
                                                            expectToBeSent(requests);

                                                        requests.expectToBeSent();

                                                        secondAccountRequest.receiveResponse();
                                                        authCheckRequest.receiveResponse();

                                                        tester.masterInfoMessage().receive();
                                                        tester.slavesNotification().expectToBeSent();

                                                        tester.slavesNotification().
                                                            additional().
                                                            visible().
                                                            expectToBeSent();

                                                        tester.masterInfoMessage().tellIsLeader().expectToBeSent();

                                                        tester.talkOptionsRequest().receiveResponse();
                                                        tester.permissionsRequest().receiveResponse();
                                                        tester.statusesRequest().receiveResponse();
                                                        tester.settingsRequest().receiveResponse();

                                                        tester.slavesNotification().
                                                            twoChannels().
                                                            enabled().
                                                            expectToBeSent();

                                                        tester.othersNotification().
                                                            updateSettings().
                                                            shouldNotPlayCallEndingSignal().
                                                            expectToBeSent();

                                                        tester.connectEventsWebSocket(1);

                                                        tester.slavesNotification().
                                                            twoChannels().
                                                            softphoneServerConnected().
                                                            enabled().
                                                            expectToBeSent();

                                                        tester.connectSIPWebSocket(1);

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
                                                            registered().
                                                            softphoneServerConnected().
                                                            webRTCServerConnected().
                                                            expectToBeSent();

                                                        tester.allowMediaInput();

                                                        tester.slavesNotification().
                                                            twoChannels().
                                                            available().
                                                            expectToBeSent();

                                                        tester.phoneField.fill('79161234567');
                                                        tester.callButton.expectNotToHaveAttribute('disabled');
                                                    });
                                                    it('Другой статус выбран.', function() {
                                                        userStateUpdateRequest.receiveResponse();

                                                        tester.employeeChangedEvent().
                                                            secondStatus().
                                                            receive();

                                                        tester.employeeChangedEvent().
                                                            secondStatus().
                                                            slavesNotification().
                                                            expectToBeSent();

                                                        tester.slavesNotification().
                                                            twoChannels().
                                                            available().
                                                            anotherStatus().
                                                            expectToBeSent();

                                                        tester.statusesList.item('Не беспокоить').
                                                            expectNotToBeSelected();
                                                        tester.statusesList.item('Нет на месте').expectToBeSelected();

                                                        tester.body.expectTextContentToHaveSubstring(
                                                            'karadimova Нет на месте'
                                                        );
                                                    });
                                                });
                                                it('Обновлен статус. Отображен обновленный статус.', function() {
                                                    tester.statusChangedEvent().
                                                        update().
                                                        receive();

                                                    tester.statusChangedEvent().
                                                        update().
                                                        slavesNotification().
                                                        expectToBeSent();

                                                    tester.statusesList.expectTextContentToHaveSubstring(
                                                        'Ганева Стефка ' +
                                                        'Внутренний номер: 9119 ' +

                                                        'Статусы ' +

                                                        'Доступен ' +
                                                        'Пауза ' +
                                                        'Не беспокоить ' +
                                                        'Нет на месте ' +
                                                        'Нет на работе'
                                                    );
                                                });
                                                it('Удален статус. Удаленный статус не отображается.', function() {
                                                    tester.statusChangedEvent().
                                                        remove().
                                                        receive();

                                                    tester.statusChangedEvent().
                                                        remove().
                                                        slavesNotification().
                                                        expectToBeSent();

                                                    tester.statusesList.expectTextContentToHaveSubstring(
                                                        'Ганева Стефка ' +
                                                        'Внутренний номер: 9119 ' +

                                                        'Статусы ' +

                                                        'Доступен ' +
                                                        'Не беспокоить ' +
                                                        'Нет на месте ' +
                                                        'Нет на работе'
                                                    );
                                                });
                                                it('Добавлен новый статус. Отображен добавленный статус.', function() {
                                                    tester.statusChangedEvent().receive();

                                                    tester.statusChangedEvent().
                                                        slavesNotification().
                                                        expectToBeSent();

                                                    tester.statusesList.
                                                        item('Воронка').
                                                        expectToBeVisible();

                                                    tester.statusesList.
                                                        item('Доступен').
                                                        findElement('circle').
                                                        expectToHaveStyle('fill', '#48b882');
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
                                            describe(
                                                'Получено сообщение о том, что другая вкладка стала ведущей. ' +
                                                'Разрывается соединение с вебсокетами. Получено оповещение о ' +
                                                'состоянии ведущей вкладки.',
                                            function() {
                                                beforeEach(function() {
                                                    tester.masterInfoMessage().tellIsLeader().receive();
                                                    tester.masterNotification().tabOpened().expectToBeSent();

                                                    tester.authenticatedUserRequest().receiveResponse();

                                                    tester.eventsWebSocket.finishDisconnecting();
                                                    tester.registrationRequest().expired().receiveResponse();

                                                    spendTime(2000);
                                                    tester.webrtcWebsocket.finishDisconnecting();

                                                    tester.slavesNotification().
                                                        available().
                                                        twoChannels().
                                                        receive();
                                                });

                                                describe(
                                                    'Вкладка снова становится ведущей. Устанавливается соединение.',
                                                function() {
                                                    beforeEach(function() {
                                                        tester.masterInfoMessage().receive();

                                                        tester.slavesNotification().
                                                            tabsVisibilityRequest().
                                                            expectToBeSent();

                                                        tester.slavesNotification().
                                                            userDataFetched().
                                                            enabled().
                                                            twoChannels().
                                                            expectToBeSent();

                                                        tester.slavesNotification().
                                                            additional().
                                                            visible().
                                                            expectToBeSent();

                                                        tester.masterInfoMessage().
                                                            tellIsLeader().
                                                            expectToBeSent();

                                                        tester.connectSIPWebSocket(1);

                                                        tester.slavesNotification().
                                                            userDataFetched().
                                                            enabled().
                                                            twoChannels().
                                                            webRTCServerConnected().
                                                            expectToBeSent();

                                                        tester.allowMediaInput();

                                                        tester.slavesNotification().
                                                            userDataFetched().
                                                            enabled().
                                                            twoChannels().
                                                            webRTCServerConnected().
                                                            microphoneAccessGranted().
                                                            expectToBeSent();

                                                        tester.registrationRequest().receiveResponse();

                                                        tester.slavesNotification().
                                                            userDataFetched().
                                                            enabled().
                                                            twoChannels().
                                                            webRTCServerConnected().
                                                            microphoneAccessGranted().
                                                            registered().
                                                            expectToBeSent();
                                                        
                                                        tester.getEventsWebSocket(1).expectToBeConnecting();
                                                    });
                                                        
                                                    describe('Соединение установлено.', function() {
                                                        beforeEach(function() {
                                                            tester.connectEventsWebSocket(1);
                                                            tester.authenticatedUserRequest().receiveResponse();

                                                            tester.slavesNotification().
                                                                twoChannels().
                                                                available().
                                                                expectToBeSent();
                                                        });

                                                        it(
                                                            'Прошло некоторое время. Проверка наличия ведущей ' +
                                                            'вкладки не совершается.',
                                                        function() {
                                                            spendTime(3000);
                                                            Promise.runAll(false, true);
                                                        });
                                                        it('Софтфон доступен.', function() {
                                                            tester.callButton.expectNotToHaveAttribute('disabled');

                                                            tester.softphone.expectTextContentNotToHaveSubstring(
                                                                'Устанавливается соединение...'
                                                            );
                                                        });
                                                    });
                                                    it('Отображено сообщение об установке соедниния.', function() {
                                                        tester.softphone.
                                                            expectToHaveTextContent('Устанавливается соединение...');
                                                    });
                                                });
                                                it(
                                                    'Прошло некоторое время. Проверяется наличие ведущей вкладки.',
                                                function() {
                                                    spendTime(1000);
                                                    Promise.runAll(false, true);

                                                    tester.masterInfoMessage().applyLeader().expectToBeSent();
                                                });
                                                it('Софтфон приведен в актуальное состояние.', function() {
                                                    tester.callButton.expectNotToHaveAttribute('disabled');

                                                    tester.softphone.expectTextContentNotToHaveSubstring(
                                                        'Устанавливается соединение...'
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

                                                    tester.employeeRow('Шалева Дора').expectToBeDisabled();
                                                    tester.softphone.expectTextContentToHaveSubstring('Разрыв сети');
                                                });
                                                it('Нажимаю на кнопку первой линии. Софтфон свернут.', function() {
                                                    tester.firstLineButton.click();
                                                    tester.softphone.expectToBeCollapsed();
                                                });
                                                it('Нажимаю на кнопку диалпада. Отображен диалпад.', function() {
                                                    tester.dialpadVisibilityButton.click();
                                                    tester.dialpadButton(1).expectToBeVisible();
                                                });
                                                it('Отображена таблица сотрудников.', function() {
                                                    tester.employeeRow('Божилова Йовка').expectToBeDisabled();
                                                    tester.employeeRow('Шалева Дора').expectToBeEnabled();

                                                    tester.softphone.expectToBeExpanded();
                                                });
                                            });
                                            it(
                                                'Софтфон открыт в другом окне. Отображено сообщение о том, что ' +
                                                'софтфон открыт в другом окне.',
                                            function() {
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
                                                spendTime(0);

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
                                                spendTime(0);

                                                tester.slavesNotification().
                                                    twoChannels().
                                                    webRTCServerConnected().
                                                    microphoneAccessGranted().
                                                    registered().
                                                    userDataFetched().
                                                    expectToBeSent();

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

                                                tester.slavesNotification().
                                                    twoChannels().
                                                    changedChannelToSecond().
                                                    available().
                                                    expectToBeSent();

                                                tester.userName.putMouseOver();

                                                tester.logoutButton.click();

                                                tester.userLogoutRequest().receiveResponse();
                                                tester.masterInfoMessage().leaderDeath().expectToBeSent();
                                                
                                                tester.slavesNotification().
                                                    userDataFetched().
                                                    twoChannels().
                                                    changedChannelToSecond().
                                                    destroyed().
                                                    microphoneAccessGranted().
                                                    enabled().
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
                                                tester.accountRequest().anotherAuthorizationToken().receiveResponse();

                                                tester.reportGroupsRequest().
                                                    anotherAuthorizationToken().
                                                    receiveResponse();

                                                tester.reportsListRequest().receiveResponse();
                                                tester.reportTypesRequest().receiveResponse();

                                                const requests = ajax.inAnyOrder();

                                                const secondAccountRequest = tester.accountRequest().
                                                    anotherAuthorizationToken().
                                                    expectToBeSent(requests);

                                                const authCheckRequest = tester.authCheckRequest().
                                                    anotherAuthorizationToken().
                                                    expectToBeSent(requests);

                                                requests.expectToBeSent();

                                                secondAccountRequest.receiveResponse();
                                                authCheckRequest.receiveResponse();

                                                tester.masterInfoMessage().receive();
                                                tester.slavesNotification().expectToBeSent();

                                                tester.slavesNotification().
                                                    additional().
                                                    visible().
                                                    expectToBeSent();

                                                tester.masterInfoMessage().tellIsLeader().expectToBeSent();

                                                tester.talkOptionsRequest().receiveResponse();
                                                tester.permissionsRequest().receiveResponse();

                                                tester.statusesRequest().
                                                    createExpectation().
                                                    anotherAuthorizationToken().
                                                    checkCompliance().
                                                    receiveResponse();

                                                tester.settingsRequest().anotherAuthorizationToken().receiveResponse();
                                                
                                                tester.slavesNotification().
                                                    twoChannels().
                                                    enabled().
                                                    expectToBeSent();

                                                tester.othersNotification().
                                                    updateSettings().
                                                    shouldNotPlayCallEndingSignal().
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

                                                const outgoingCall = tester.outgoingCall().intercept().start();

                                                tester.slavesNotification().
                                                    available().
                                                    twoChannels().
                                                    intercept().
                                                    sending().
                                                    expectToBeSent();

                                                outgoingCall.setRinging();

                                                tester.slavesNotification().
                                                    available().
                                                    twoChannels().
                                                    intercept().
                                                    progress().
                                                    expectToBeSent();

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

                                                tester.slavesNotification().
                                                    twoChannels().
                                                    available().
                                                    expectToBeSent();

                                                tester.slavesNotification().
                                                    additional().
                                                    visible().
                                                    expectToBeSent();
                                            });
                                            it(
                                                'На ведомой вкладке была нажата кнопка вызова. Совершается вызов.',
                                            function() {
                                                tester.masterNotification().call().receive();

                                                tester.firstConnection.connectWebRTC();
                                                tester.allowMediaInput();

                                                tester.outgoingCall().expectToBeSent()

                                                tester.slavesNotification().
                                                    available().
                                                    twoChannels().
                                                    sending().
                                                    expectToBeSent();

                                                tester.numaRequest().receiveResponse();

                                                spendTime(0);
                                                spendTime(0);
                                                spendTime(0);
                                                spendTime(0);

                                                tester.outgoingIcon.expectToBeVisible();
                                                tester.softphone.expectTextContentToHaveSubstring(
                                                    '+7 (916) 123-45-67 Поиск контакта... 00:00'
                                                );
                                            });
                                            it('От ведомой вкладки получен токен. Ничего не сломалось.', function() {
                                                tester.masterInfoMessage().applyLeader().receive();
                                                tester.masterInfoMessage().tellIsLeader().expectToBeSent();
                                            });
                                            it(
                                                'Получен запрос на выход из софтфона. Отображена форма авторизации.',
                                            function() {
                                                tester.masterNotification().destroy().receive();
                                                tester.masterInfoMessage().leaderDeath().expectToBeSent();

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
                                                tester.masterInfoMessage().leaderDeath().expectToBeSent();

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
                                            it(
                                                'Прошло некоторое время. Проверка наличия ведущей вкладки не ' +
                                                'совершается.',
                                            function() {
                                                spendTime(3000);
                                                Promise.runAll(false, true);
                                            });
                                            it('Нажимаю на кнопку с жуком. Скачивается лог.', function() {
                                                tester.bugButton.click();

                                                windowOpener.expectTextToContain(
                                                    'URL "https://$REACT_APP_SOFTPHONE_BACKEND_HOST/sup/auth/check"'
                                                );
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

                                                tester.callStartingButton.expectNotToHaveAttribute('disabled');
                                                tester.softphone.expectToBeCollapsed();
                                                tester.maximizednessButton.expectNotToExist();

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
                                describe(
                                    'SIP-регистрация завершена. Срок действия токена авторизации истек.',
                                function() {
                                    let refreshRequest;

                                    beforeEach(function() {
                                        registrationRequest.receiveResponse();

                                        tester.slavesNotification().
                                            twoChannels().
                                            available().
                                            expectToBeSent();

                                        reportGroupsRequest.accessTokenExpired().receiveResponse();
                                        refreshRequest = tester.refreshRequest().expectToBeSent();
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
                            describe('SIP-линия не зарегистрирована. Нажимаю на иконку с телефоном.', function() {
                                beforeEach(function() {
                                    tester.button('Софтфон').click();
                                    tester.slavesNotification().additional().visible().expectToBeSent();

                                    tester.phoneField.fill('79161234567');

                                    authenticatedUserRequest.sipIsOffline().receiveResponse();

                                    tester.slavesNotification().
                                        userDataFetched().
                                        sipIsOffline().
                                        twoChannels().
                                        softphoneServerConnected().
                                        webRTCServerConnected().
                                        microphoneAccessGranted().
                                        expectToBeSent();

                                    registrationRequest.receiveResponse();

                                    tester.slavesNotification().
                                        userDataFetched().
                                        sipIsOffline().
                                        twoChannels().
                                        softphoneServerConnected().
                                        webRTCServerConnected().
                                        registered().
                                        microphoneAccessGranted().
                                        expectToBeSent();

                                    reportGroupsRequest.receiveResponse();
                                });
                                
                                it(
                                    'SIP-линия зарегистрирована. Сообщение о том, что SIP-линия не зарегистрирована ' +
                                    'не отображено.',
                                function() {
                                    tester.employeeChangedEvent().
                                        isSipOnline().
                                        receive();

                                    tester.employeeChangedEvent().
                                        isSipOnline().
                                        slavesNotification().
                                        expectToBeSent();
                                     
                                    tester.slavesNotification().
                                        available().
                                        twoChannels().
                                        expectToBeSent();

                                    tester.callStartingButton.expectNotToHaveAttribute('disabled');
                                    tester.softphone.
                                        expectTextContentNotToHaveSubstring('Sip-линия не зарегистрирована');
                                });
                                it('Отображено сообщение о том, что SIP-линия не зарегистрирована.', function() {
                                    tester.softphone.expectToBeCollapsed();
                                    tester.callStartingButton.expectToHaveAttribute('disabled');
                                    tester.softphone.expectTextContentToHaveSubstring('Sip-линия не зарегистрирована');
                                });
                            });
                        });
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
                    describe('Номера должны быть скрыты.', function() {
                        beforeEach(function() {
                            reportGroupsRequest.receiveResponse();

                            settingsRequest.shouldHideNumbers().receiveResponse();

                            tester.slavesNotification().
                                twoChannels().
                                enabled().
                                expectToBeSent();

                            tester.othersNotification().
                                updateSettings().
                                shouldNotPlayCallEndingSignal().
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
                                registered().
                                softphoneServerConnected().
                                expectToBeSent();

                            tester.allowMediaInput();

                            tester.slavesNotification().
                                twoChannels().
                                available().
                                expectToBeSent();
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

                            tester.slavesNotification().
                                available().
                                twoChannels().
                                incoming().
                                progress().
                                expectToBeSent();

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

                        tester.slavesNotification().
                            twoChannels().
                            enabled().
                            expectToBeSent();

                        tester.othersNotification().
                            updateSettings().
                            shouldNotPlayCallEndingSignal().
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

                        tester.allowMediaInput();

                        tester.slavesNotification().
                            twoChannels().
                            webRTCServerConnected().
                            softphoneServerConnected().
                            microphoneAccessGranted().
                            expectToBeSent();

                        tester.authenticatedUserRequest().anotherAuthorizationToken().receiveResponse();

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
                    });
                    it('Токен невалиден. Отображена форма аутентификации.', function() {
                        settingsRequest.accessTokenInvalid().receiveResponse();
                        notificationTester.grantPermission();

                        const requests = ajax.inAnyOrder();

                        userLogoutRequest = tester.userLogoutRequest().expectToBeSent(requests);
                        authLogoutRequest = tester.authLogoutRequest().expectToBeSent(requests);

                        requests.expectToBeSent();

                        userLogoutRequest.receiveResponse();
                        authLogoutRequest.receiveResponse();

                        tester.masterInfoMessage().leaderDeath().expectToBeSent();
                        tester.slavesNotification().destroyed().expectToBeSent();

                        tester.input.withFieldLabel('Логин').expectToBeVisible();
                    });
                });
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

                                tester.slavesNotification().
                                    twoChannels().
                                    enabled().
                                    expectToBeSent();

                                tester.othersNotification().
                                    updateSettings().
                                    shouldNotPlayCallEndingSignal().
                                    expectToBeSent();

                                notificationTester.grantPermission();
                            });

                            describe('Пользователь имеет права на выбор номера.', function() {
                                let authenticatedUserRequest,
                                    numberCapacityRequest;

                                beforeEach(function() {
                                    permissionsRequest.allowNumberCapacityUpdate().receiveResponse();

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

                                    tester.allowMediaInput();

                                    tester.slavesNotification().
                                        twoChannels().
                                        webRTCServerConnected().
                                        softphoneServerConnected().
                                        microphoneAccessGranted().
                                        expectToBeSent();

                                    numberCapacityRequest = tester.numberCapacityRequest().expectToBeSent();

                                    tester.registrationRequest().receiveResponse();

                                    tester.slavesNotification().
                                        twoChannels().
                                        webRTCServerConnected().
                                        softphoneServerConnected().
                                        microphoneAccessGranted().
                                        registered().
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

                                            tester.slavesNotification().
                                                twoChannels().
                                                available().
                                                expectToBeSent();
                                        });

                                        describe('Раскрываю список номеров.', function() {
                                            beforeEach(function() {
                                                tester.select.arrow.click();
                                                tester.numberCapacityRequest().receiveResponse();
                                            });

                                            describe('Выбираю номер. Отправлен запрос смены номера.', function() {
                                                beforeEach(function() {
                                                    tester.select.option('+7 (916) 123-89-29 Некий номер').click();

                                                    tester.numberCapacitySavingRequest().receiveResponse();

                                                    tester.othersNotification().
                                                        widgetStateUpdate().
                                                        fixedNumberCapacityRule().
                                                        anotherNumberCapacity().
                                                        expectToBeSent();

                                                    tester.othersNotification().
                                                        updateSettings().
                                                        shouldNotPlayCallEndingSignal().
                                                        expectToBeSent();
                                                });

                                                it(
                                                    'Нажимаю на кнопку открытия диалпада. Отображен выбранный номер ' +
                                                    'с комментарием.',
                                                function() {
                                                    tester.dialpadVisibilityButton.click();

                                                    tester.softphone.expectTextContentToHaveSubstring(
                                                        '+7 (916) 123-89-29 ' +
                                                        'Некий номер'
                                                    );
                                                });
                                                it('Отображен выбранный номер.', function() {
                                                    tester.softphone.expectToHaveTextContent('+7 (916) 123-89-29');
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

                                            tester.slavesNotification().
                                                userDataFetched().
                                                twoChannels().
                                                appAlreadyOpened().
                                                microphoneAccessGranted().
                                                enabled().
                                                expectToBeSent();

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

                                        tester.slavesNotification().
                                            userDataFetched().
                                            sipIsOffline().
                                            twoChannels().
                                            softphoneServerConnected().
                                            webRTCServerConnected().
                                            registered().
                                            microphoneAccessGranted().
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

                                    tester.slavesNotification().
                                        twoChannels().
                                        available().
                                        expectToBeSent();

                                    tester.select.expectToHaveTextContent('+7 (495) 021-68-06');
                                });
                            });
                            it('Безуспешно пытаюсь выбрать номер.', function() {
                                permissionsRequest.receiveResponse();

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

                                tester.allowMediaInput();

                                tester.slavesNotification().
                                    twoChannels().
                                    webRTCServerConnected().
                                    softphoneServerConnected().
                                    microphoneAccessGranted().
                                    expectToBeSent();

                                tester.numberCapacityRequest().receiveResponse();

                                tester.authenticatedUserRequest().receiveResponse();

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

                                tester.select.arrow.click();
                                tester.numberCapacityRequest().receiveResponse();

                                tester.select.option('+7 (916) 123-89-29 Некий номер').click();
                            });
                        });
                        describe(
                            'У выбранного номера есть комментарий. Пользователь имеет права на выбор номера.',
                        function() {
                            let authenticatedUserRequest;

                            beforeEach(function() {
                                settingsRequest.numberCapacityComment().receiveResponse();

                                tester.slavesNotification().
                                    twoChannels().
                                    enabled().
                                    expectToBeSent();

                                tester.othersNotification().
                                    updateSettings().
                                    shouldNotPlayCallEndingSignal().
                                    expectToBeSent();

                                notificationTester.grantPermission();
                                permissionsRequest.allowNumberCapacityUpdate().receiveResponse();

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

                                tester.allowMediaInput();

                                tester.slavesNotification().
                                    twoChannels().
                                    webRTCServerConnected().
                                    softphoneServerConnected().
                                    microphoneAccessGranted().
                                    expectToBeSent();

                                tester.numberCapacityRequest().withComment().receiveResponse();
                                
                                tester.registrationRequest().receiveResponse();

                                tester.slavesNotification().
                                    twoChannels().
                                    webRTCServerConnected().
                                    softphoneServerConnected().
                                    microphoneAccessGranted().
                                    registered().
                                    expectToBeSent();

                                authenticatedUserRequest = tester.authenticatedUserRequest().expectToBeSent();
                            });

                            describe('SIP-линия зарегистрирована.', function() {
                                beforeEach(function() {
                                    authenticatedUserRequest.receiveResponse();

                                    tester.slavesNotification().
                                        twoChannels().
                                        available().
                                        expectToBeSent();
                                });

                                describe('Раскрываю диалпад.', function() {
                                    beforeEach(function() {
                                        tester.dialpadVisibilityButton.click();
                                    });

                                    it('Изменился комментарий. Отображен новый комментарий к номеру.', function() {
                                        tester.numberCapacityChangedEvent().receive();

                                        tester.numberCapacityChangedEvent().
                                            slavesNotification().
                                            expectToBeSent();

                                        tester.othersNotification().
                                            updateSettings().
                                            shouldNotPlayCallEndingSignal().
                                            expectToBeSent();

                                        tester.softphone.expectTextContentToHaveSubstring('Другой комментарий');
                                    });
                                    it('Отображен комментарий к номеру.', function() {
                                        tester.softphone.expectTextContentToHaveSubstring('Отдел консалтинга');
                                    });
                                });
                                it('Отображен выбранный номер.', function() {
                                    tester.softphone.expectToHaveTextContent('+7 (495) 021-68-06');
                                });
                            });
                            it(
                                'SIP-линия не зарегистрирована. Отображено сообщение о том, что SIP-линия не ' +
                                'зарегистрирована.',
                            function() {
                                authenticatedUserRequest.sipIsOffline().receiveResponse();

                                tester.slavesNotification().
                                    userDataFetched().
                                    sipIsOffline().
                                    twoChannels().
                                    softphoneServerConnected().
                                    webRTCServerConnected().
                                    registered().
                                    microphoneAccessGranted().
                                    expectToBeSent();

                                tester.softphone.expectToBeCollapsed();

                                tester.softphone.expectToHaveTextContent(
                                    'Sip-линия не зарегистрирована ' +
                                    '+7 (495) 021-68-06'
                                );
                            });
                        });
                        describe('В качестве устройства для приема звонков исползуется IP-телефон.', function() {
                            beforeEach(function() {
                                settingsRequest.callsAreManagedByAnotherDevice().receiveResponse();

                                tester.slavesNotification().
                                    twoChannels().
                                    disabled().
                                    expectToBeSent();

                                tester.othersNotification().
                                    updateSettings().
                                    shouldNotPlayCallEndingSignal().
                                    expectToBeSent();

                                notificationTester.grantPermission();
                                permissionsRequest.allowNumberCapacityUpdate().receiveResponse();

                                tester.connectEventsWebSocket();

                                tester.slavesNotification().
                                    softphoneServerConnected().
                                    twoChannels().
                                    disabled().
                                    expectToBeSent();

                                tester.numberCapacityRequest().receiveResponse();

                                tester.authenticatedUserRequest().receiveResponse();

                                tester.slavesNotification().
                                    userDataFetched().
                                    softphoneServerConnected().
                                    twoChannels().
                                    disabled().
                                    expectToBeSent();
                            });

                            describe('Получена неокончательная информация о звонке. Автоответ включен.', function() {
                                beforeEach(function() {
                                    tester.outCallEvent().
                                        needAutoAnswer().
                                        notFinal().
                                        receive();

                                    tester.outCallEvent().
                                        needAutoAnswer().
                                        notFinal().
                                        slavesNotification().
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
                                tester.softphone.expectTextContentToHaveSubstring('Шалева Дора +7 (916) 123-45-67');
                            });
                            it('Отбражен выпадающий список номеров.', function() {
                                tester.select.expectToHaveTextContent('+7 (495) 021-68-06');
                            });
                        });
                        describe('У выбранного номера есть длинный комментарий.', function() {
                            beforeEach(function() {
                                settingsRequest.longNumberCapacityComment().receiveResponse();

                                tester.slavesNotification().
                                    twoChannels().
                                    enabled().
                                    expectToBeSent();

                                tester.othersNotification().
                                    updateSettings().
                                    shouldNotPlayCallEndingSignal().
                                    expectToBeSent();

                                notificationTester.grantPermission();
                                permissionsRequest.allowNumberCapacityUpdate().receiveResponse();

                                tester.connectEventsWebSocket();

                                tester.slavesNotification().
                                    twoChannels().
                                    softphoneServerConnected().
                                    enabled().
                                    expectToBeSent();

                                tester.connectSIPWebSocket();

                                tester.slavesNotification().
                                    twoChannels().
                                    webRTCServerConnected().
                                    softphoneServerConnected().
                                    expectToBeSent();

                                tester.allowMediaInput();

                                tester.slavesNotification().
                                    twoChannels().
                                    webRTCServerConnected().
                                    microphoneAccessGranted().
                                    softphoneServerConnected().
                                    expectToBeSent();

                                tester.numberCapacityRequest().withLongComment().receiveResponse();

                                tester.registrationRequest().receiveResponse();
                                
                                tester.slavesNotification().
                                    twoChannels().
                                    webRTCServerConnected().
                                    microphoneAccessGranted().
                                    softphoneServerConnected().
                                    registered().
                                    expectToBeSent();
                                
                                tester.authenticatedUserRequest().receiveResponse();

                                tester.slavesNotification().
                                    twoChannels().
                                    available().
                                    expectToBeSent();
                            });

                            it('Открываю список номеров.', function() {
                                tester.select.arrow.click();
                                tester.numberCapacityRequest().withLongComment().receiveResponse();
                            });
                            it('Открываю диалпад. Отображен длинный комментарий.', function() {
                                tester.dialpadVisibilityButton.click();

                                tester.softphone.expectTextContentToHaveSubstring(
                                    '+7 (495) 021-68-06 ' +
                                    'Кобыла и трупоглазые жабы искали цезию, нашли поздно утром свистящего хна'
                                );
                            });
                        });
                    });
                    describe('Пользователь не имеет права на список номеров.', function() {
                        beforeEach(function() {
                            permissionsRequest.receiveResponse();
                        });

                        describe('Включено управление звонками на другом устройстве.', function() {
                            beforeEach(function() {
                                settingsRequest.callsAreManagedByAnotherDevice().receiveResponse();

                                tester.slavesNotification().
                                    twoChannels().
                                    disabled().
                                    expectToBeSent();

                                tester.othersNotification().
                                    updateSettings().
                                    shouldNotPlayCallEndingSignal().
                                    expectToBeSent();

                                notificationTester.grantPermission();
                            });

                            describe('Соединение установлено.', function() {
                                beforeEach(function() {
                                    tester.connectEventsWebSocket();

                                    tester.slavesNotification().
                                        twoChannels().
                                        disabled().
                                        softphoneServerConnected().
                                        expectToBeSent();

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

                                it(
                                    'Нажимаю на кнопку аккаунта. Выбираю другой статус. Другой статус выбран.',
                                function() {
                                    tester.userName.putMouseOver();
                                    tester.statusesList.item('Нет на месте').click();

                                    tester.userStateUpdateRequest().receiveResponse();

                                    tester.employeeChangedEvent().
                                        secondStatus().
                                        receive();

                                    tester.employeeChangedEvent().
                                        secondStatus().
                                        slavesNotification().
                                        expectToBeSent();

                                    tester.slavesNotification().
                                        userDataFetched().
                                        twoChannels().
                                        sipIsOffline().
                                        disabled().
                                        anotherStatus().
                                        softphoneServerConnected().
                                        expectToBeSent();

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
                        describe('Телефония недоступна.', function() {
                            beforeEach(function() {
                                settingsRequest.
                                    noTelephony().
                                    receiveResponse();

                                tester.slavesNotification().
                                    twoChannels().
                                    disabled().
                                    expectToBeSent();

                                tester.slavesNotification().expectToBeSent();

                                tester.othersNotification().
                                    updateSettings().
                                    shouldNotPlayCallEndingSignal().
                                    expectToBeSent();

                                tester.connectEventsWebSocket();

                                tester.slavesNotification().
                                    twoChannels().
                                    disabled().
                                    softphoneServerConnected().
                                    expectToBeSent();

                                notificationTester.grantPermission();

                                tester.authenticatedUserRequest().receiveResponse();

                                tester.slavesNotification().
                                    userDataFetched().
                                    twoChannels().
                                    disabled().
                                    softphoneServerConnected().
                                    expectToBeSent();
                            });
                            
                            it('Нажимаю на кнопку контактов.', function() {
                                tester.contactsButton.click();

                                tester.contactsRequest().
                                    differentNames().
                                    receiveResponse();

                                tester.dialpadButton(1).expectNotToExist();
                            });
                            it('Открываю список сотрудников.', function() {
                                tester.addressBookButton.click();

                                tester.usersRequest().receiveResponse();
                                tester.usersInGroupsRequest().receiveResponse();
                                tester.groupsRequest().receiveResponse();

                                tester.employeeRow('Шалева Дора').expectToBeDisabled();
                            });
                            it('Отображено сообщение "Нет доступной sip-линии".', function() {
                                tester.softphone.expectToBeCollapsed();
                                tester.softphone.expectTextContentToHaveSubstring('Нет доступной sip-линии');
                            });
                        });
                        it('Необходимо подключиться к РТУ напрямую. Подключаюсь.', function() {
                            tester.setJsSIPRTUUrl();

                            settingsRequest.
                                setRTU().
                                receiveResponse();

                            tester.slavesNotification().
                                twoChannels().
                                enabled().
                                expectToBeSent();

                            tester.othersNotification().
                                updateSettings().
                                shouldNotPlayCallEndingSignal().
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

                            tester.allowMediaInput();

                            tester.slavesNotification().
                                twoChannels().
                                webRTCServerConnected().
                                softphoneServerConnected().
                                microphoneAccessGranted().
                                expectToBeSent();

                            tester.authenticatedUserRequest().receiveResponse();

                            tester.slavesNotification().
                                userDataFetched().
                                twoChannels().
                                webRTCServerConnected().
                                softphoneServerConnected().
                                microphoneAccessGranted().
                                expectToBeSent();
                            
                            tester.requestRegistration().
                                setRTU().
                                receiveResponse();

                            tester.slavesNotification().
                                twoChannels().
                                available().
                                expectToBeSent();
                        });
                        it('Необходимо подключиться к Janus. Подключаюсь.', function() {
                            tester.setTwoJanusUrls();
                            settingsRequest.receiveResponse();

                            tester.slavesNotification().
                                twoChannels().
                                enabled().
                                expectToBeSent();

                            tester.othersNotification().
                                updateSettings().
                                shouldNotPlayCallEndingSignal().
                                expectToBeSent();

                            notificationTester.grantPermission();

                            tester.connectEventsWebSocket();

                            tester.slavesNotification().
                                twoChannels().
                                enabled().
                                softphoneServerConnected().
                                expectToBeSent();

                            tester.connectSIPWebSocket();
                            tester.janusTransactionCreationRequest().receiveResponse();

                            tester.slavesNotification().
                                twoChannels().
                                webRTCServerConnected().
                                softphoneServerConnected().
                                expectToBeSent();

                            tester.allowMediaInput();

                            tester.slavesNotification().
                                twoChannels().
                                webRTCServerConnected().
                                softphoneServerConnected().
                                microphoneAccessGranted().
                                expectToBeSent();

                            tester.authenticatedUserRequest().receiveResponse();

                            tester.slavesNotification().
                                userDataFetched().
                                twoChannels().
                                webRTCServerConnected().
                                softphoneServerConnected().
                                microphoneAccessGranted().
                                expectToBeSent();

                            tester.janusPluginAttachRequest().receiveResponse();
                            tester.janusRegisterRequest().receiveResponse();
                            tester.janusRegisteredMessage().receive();

                            tester.janusPluginAttachRequest().
                                expectToBeSent().
                                setHelper().
                                receiveResponse();

                            tester.janusRegisterRequest().
                                setHelper().
                                expectToBeSent().
                                receiveResponse();

                            tester.janusRegisteredMessage().
                                setHelper().
                                receive();
                            
                            tester.slavesNotification().
                                twoChannels().
                                available().
                                expectToBeSent();
                        });
                        it('Используется свойство sip. Необходимо подключиться к Janus. Подключаюсь.', function() {
                            tester.anotherWebRTCURL();

                            settingsRequest.
                                sipPropertySpecified().
                                receiveResponse();

                            tester.slavesNotification().
                                twoChannels().
                                enabled().
                                expectToBeSent();

                            tester.othersNotification().
                                updateSettings().
                                shouldNotPlayCallEndingSignal().
                                expectToBeSent();
                            
                            notificationTester.grantPermission();

                            tester.connectEventsWebSocket();

                            tester.slavesNotification().
                                twoChannels().
                                enabled().
                                softphoneServerConnected().
                                expectToBeSent();

                            tester.connectSIPWebSocket();
                            tester.janusTransactionCreationRequest().receiveResponse();

                            tester.slavesNotification().
                                twoChannels().
                                webRTCServerConnected().
                                softphoneServerConnected().
                                expectToBeSent();

                            tester.allowMediaInput();

                            tester.slavesNotification().
                                twoChannels().
                                webRTCServerConnected().
                                softphoneServerConnected().
                                microphoneAccessGranted().
                                expectToBeSent();

                            tester.authenticatedUserRequest().receiveResponse();

                            tester.slavesNotification().
                                userDataFetched().
                                twoChannels().
                                webRTCServerConnected().
                                softphoneServerConnected().
                                microphoneAccessGranted().
                                expectToBeSent();

                            tester.janusPluginAttachRequest().receiveResponse();

                            tester.janusRegisterRequest().
                                thirdUser().
                                receiveResponse();

                            tester.janusRegisteredMessage().receive();

                            tester.janusPluginAttachRequest().
                                expectToBeSent().
                                setHelper().
                                receiveResponse();

                            tester.janusRegisterRequest().
                                thirdUser().
                                setHelper().
                                expectToBeSent().
                                receiveResponse();

                            tester.janusRegisteredMessage().
                                setHelper().
                                receive();
                            
                            tester.slavesNotification().
                                twoChannels().
                                available().
                                expectToBeSent();
                        });
                        it('Выбран кастомный рингтон. Сигнал завершения звонка включен.', function() {
                            settingsRequest.secondRingtone().isNeedDisconnectSignal().receiveResponse();

                            tester.slavesNotification().
                                twoChannels().
                                enabled().
                                expectToBeSent();

                            tester.othersNotification().
                                updateSettings().
                                shouldPlayCallEndingSignal().
                                incomingRingtone().
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

                            tester.allowMediaInput();

                            tester.slavesNotification().
                                twoChannels().
                                webRTCServerConnected().
                                softphoneServerConnected().
                                microphoneAccessGranted().
                                expectToBeSent();

                            tester.ringtoneRequest().receiveResponse();
                            fileReader.accomplishFileLoading(tester.secondRingtone);
                            mediaStreamsTester.setIsAbleToPlayThough('data:audio/wav;base64,' + tester.secondRingtone);

                            tester.authenticatedUserRequest().receiveResponse();

                            tester.slavesNotification().
                                userDataFetched().
                                twoChannels().
                                webRTCServerConnected().
                                softphoneServerConnected().
                                microphoneAccessGranted().
                                expectToBeSent();

                            tester.requestRegistration().receiveResponse();

                            tester.slavesNotification().
                                twoChannels().
                                available().
                                expectToBeSent();

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
            });
            describe('Вкладка является ведомой. Открываю софтфон.', function() {
                beforeEach(function() {
                    tester.masterInfoMessage().isNotMaster().receive();
                    tester.masterNotification().tabOpened().expectToBeSent();

                    authCheckRequest.receiveResponse();
                    tester.talkOptionsRequest().receiveResponse();

                    tester.permissionsRequest().
                        allowNumberCapacitySelect().
                        allowNumberCapacityUpdate().
                        receiveResponse();

                    tester.statusesRequest().receiveResponse();

                    tester.settingsRequest().
                        dontTriggerScrollRecalculation().
                        allowNumberCapacitySelect().
                        receiveResponse();

                    tester.othersNotification().
                        updateSettings().
                        shouldNotPlayCallEndingSignal().
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
                });

                describe('Скрываю окно.', function() {
                    beforeEach(function() {
                        setDocumentVisible(false);
                        tester.masterNotification().tabBecameHidden().expectToBeSent();
                    });

                    describe('Вкладка становится ведущей. Поднимается webRTC-сокет.', function() {
                        beforeEach(function() {
                            tester.masterInfoMessage().receive();

                            tester.slavesNotification().
                                tabsVisibilityRequest().
                                expectToBeSent();

                            tester.slavesNotification().
                                userDataFetched().
                                twoChannels().
                                hidden().
                                enabled().
                                expectToBeSent();

                            tester.slavesNotification().
                                additional().
                                visible().
                                expectToBeSent();

                            tester.connectEventsWebSocket();

                            tester.slavesNotification().
                                userDataFetched().
                                twoChannels().
                                hidden().
                                enabled().
                                softphoneServerConnected().
                                expectToBeSent();

                            tester.connectSIPWebSocket();

                            tester.slavesNotification().
                                userDataFetched().
                                twoChannels().
                                webRTCServerConnected().
                                hidden().
                                softphoneServerConnected().
                                expectToBeSent();

                            tester.masterInfoMessage().tellIsLeader().expectToBeSent();
                            tester.notificationChannel().tellIsLeader().expectToBeSent();
                            tester.notificationChannel().applyLeader().expectToBeSent();

                            tester.allowMediaInput();

                            tester.slavesNotification().
                                userDataFetched().
                                twoChannels().
                                webRTCServerConnected().
                                hidden().
                                softphoneServerConnected().
                                microphoneAccessGranted().
                                expectToBeSent();

                            tester.authenticatedUserRequest().receiveResponse();

                            tester.registrationRequest().receiveResponse();

                            tester.slavesNotification().
                                twoChannels().
                                available().
                                hidden().
                                expectToBeSent();
                        });

                        it('Поступил входящий звонок. Отображено браузерное уведомление.', function() {
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
                        it(
                            'Прошло некоторое время. Проверка наличия ведущей вкладки не ' +
                            'совершается.',
                        function() {
                            spendTime(3000);
                            Promise.runAll(false, true);
                        });
                        it(
                            'Существует другая открытая вкладка. Поступил входящий звонок. Браузерное ' +
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
                    });
                    it('Получен запрос видимости окна. Ничего не происходит.', function() {
                        tester.slavesNotification().tabsVisibilityRequest().receive();
                    });
                    it('Поступил входящий звонок. Отображена информация о звонке.', function() {
                        tester.slavesNotification().
                            available().
                            twoChannels().
                            incoming().
                            progress().
                            receive();

                        tester.outCallEvent().slavesNotification().receive();

                        tester.softphone.expectTextContentToHaveSubstring(
                            'Шалева Дора +7 (916) 123-45-67 ' +
                            'Путь лида'
                        );
                    });
                });
                it(
                    'Вкладка становится ведущей. Скрываю вкладку. Раскрываю вкладку. Поступил входящий звонок. ' +
                    'Информация о звонке не отображена.',
                function() {
                    tester.masterInfoMessage().receive();

                    tester.slavesNotification().
                        tabsVisibilityRequest().
                        expectToBeSent();

                    tester.slavesNotification().
                        userDataFetched().
                        twoChannels().
                        enabled().
                        expectToBeSent();

                    tester.slavesNotification().
                        additional().
                        visible().
                        expectToBeSent();

                    tester.connectEventsWebSocket();

                    tester.slavesNotification().
                        userDataFetched().
                        twoChannels().
                        enabled().
                        softphoneServerConnected().
                        expectToBeSent();

                    tester.connectSIPWebSocket();

                    tester.slavesNotification().
                        userDataFetched().
                        twoChannels().
                        webRTCServerConnected().
                        softphoneServerConnected().
                        expectToBeSent();

                    tester.masterInfoMessage().tellIsLeader().expectToBeSent();
                    tester.notificationChannel().tellIsLeader().expectToBeSent();
                    tester.notificationChannel().applyLeader().expectToBeSent();

                    tester.allowMediaInput();

                    tester.slavesNotification().
                        userDataFetched().
                        twoChannels().
                        webRTCServerConnected().
                        softphoneServerConnected().
                        microphoneAccessGranted().
                        expectToBeSent();

                    tester.authenticatedUserRequest().receiveResponse();

                    tester.registrationRequest().receiveResponse();

                    tester.slavesNotification().
                        twoChannels().
                        available().
                        expectToBeSent();

                    setDocumentVisible(false);

                    tester.slavesNotification().
                        twoChannels().
                        available().
                        hidden().
                        expectToBeSent();

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
                it(
                    'Сессионная кука уже удалена. На ведущей вкладке был совершен выход из софтфона. Отображается ' +
                    'форма аутентификации.',
                function() {
                    document.cookie = '';

                    tester.slavesNotification().
                        userDataFetched().
                        twoChannels().
                        microphoneAccessGranted().
                        destroyed().
                        enabled().
                        receive();

                    tester.masterInfoMessage().leaderDeath().expectToBeSent();
                    tester.masterInfoMessage().leaderDeath().receive();

                    tester.authLogoutRequest().receiveResponse();

                    tester.input.withFieldLabel('Логин').fill('botusharova');
                    tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                    tester.button('Войти').click();

                    tester.loginRequest().receiveResponse();
                    tester.accountRequest().receiveResponse();

                    tester.reportGroupsRequest().receiveResponse();
                    tester.reportsListRequest().receiveResponse();
                    tester.reportTypesRequest().receiveResponse();

                    const requests = ajax.inAnyOrder();

                    const secondAccountRequest = tester.accountRequest().expectToBeSent(requests),
                        authCheckRequest = tester.authCheckRequest().expectToBeSent(requests);

                    requests.expectToBeSent();

                    secondAccountRequest.receiveResponse();
                    authCheckRequest.receiveResponse();

                    tester.masterInfoMessage().receive();
                    tester.slavesNotification().expectToBeSent();
                    tester.slavesNotification().additional().visible().expectToBeSent();

                    tester.masterInfoMessage().tellIsLeader().expectToBeSent();
                    tester.notificationChannel().tellIsLeader().expectToBeSent();
                    tester.notificationChannel().applyLeader().expectToBeSent();

                    tester.talkOptionsRequest().receiveResponse();
                    tester.permissionsRequest().receiveResponse();
                    tester.statusesRequest().receiveResponse();
                    tester.settingsRequest().receiveResponse();

                    tester.slavesNotification().
                        twoChannels().
                        enabled().
                        expectToBeSent();

                    tester.othersNotification().
                        updateSettings().
                        shouldNotPlayCallEndingSignal().
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
                        expectToBeSent();
                });
                it(
                    'Сессионная кука еще не удалена. На ведущей вкладке был совершен выход из софтфона. Отображается ' +
                    'форма аутентификации.',
                function() {
                    tester.slavesNotification().
                        userDataFetched().
                        twoChannels().
                        microphoneAccessGranted().
                        destroyed().
                        enabled().
                        receive();

                    tester.masterInfoMessage().leaderDeath().expectToBeSent();
                    tester.masterInfoMessage().leaderDeath().receive();

                    tester.authLogoutRequest().receiveResponse();
                    tester.userLogoutRequest().receiveResponse();

                    tester.input.withFieldLabel('Логин').fill('botusharova');
                    tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                    tester.button('Войти').click();

                    tester.loginRequest().receiveResponse();
                    tester.accountRequest().receiveResponse();

                    tester.reportGroupsRequest().receiveResponse();
                    tester.reportsListRequest().receiveResponse();
                    tester.reportTypesRequest().receiveResponse();

                    const requests = ajax.inAnyOrder();

                    const secondAccountRequest = tester.accountRequest().expectToBeSent(requests),
                        authCheckRequest = tester.authCheckRequest().expectToBeSent(requests);

                    requests.expectToBeSent();

                    secondAccountRequest.receiveResponse();
                    authCheckRequest.receiveResponse();

                    tester.masterInfoMessage().receive();
                    tester.slavesNotification().expectToBeSent();
                    tester.slavesNotification().additional().visible().expectToBeSent();

                    tester.masterInfoMessage().tellIsLeader().expectToBeSent();
                    tester.notificationChannel().tellIsLeader().expectToBeSent();
                    tester.notificationChannel().applyLeader().expectToBeSent();

                    tester.talkOptionsRequest().receiveResponse();
                    tester.permissionsRequest().receiveResponse();
                    tester.statusesRequest().receiveResponse();
                    tester.settingsRequest().receiveResponse();

                    tester.slavesNotification().
                        twoChannels().
                        enabled().
                        expectToBeSent();

                    tester.othersNotification().
                        updateSettings().
                        shouldNotPlayCallEndingSignal().
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
                        expectToBeSent();
                });
                it(
                    'Софтфон открыт в другом окне. Отображено сообщение о том, что софтфон открыт в другом окне.',
                function() {
                    tester.slavesNotification().
                        userDataFetched().
                        twoChannels().
                        appAlreadyOpened().
                        enabled().
                        microphoneAccessGranted().
                        receive();

                    tester.authLogoutRequest().receiveResponse();
                    tester.softphone.expectTextContentToHaveSubstring('Софтфон открыт в другом окне');
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
                    tester.othersNotification().
                        widgetStateUpdate().
                        fixedNumberCapacityRule().
                        anotherNumberCapacity().
                        receive();

                    tester.othersNotification().
                        updateSettings().
                        shouldNotPlayCallEndingSignal().
                        expectToBeSent();

                    tester.select.expectToHaveTextContent('+7 (916) 123-89-29');
                });
                it('Выбран другой статус. Отображен выбранный статус.', function() {
                    tester.slavesNotification().
                        twoChannels().
                        available().
                        anotherStatus().
                        receive();

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

                    tester.notificationChannel().applyLeader().expectToBeSent();

                    tester.userLogoutRequest().receiveResponse();
                    tester.authLogoutRequest().receiveResponse();

                    tester.masterInfoMessage().leaderDeath().expectToBeSent();
                    tester.masterNotification().destroy().expectToBeSent();
                });
                it('Прошло некоторое время. Проверяется наличие ведущей вкладки.', function() {
                    spendTime(2000);
                    Promise.runAll(false, true);

                    tester.masterInfoMessage().applyLeader().expectToBeSent();
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

                    authCheckRequest.receiveResponse();
                    tester.talkOptionsRequest().receiveResponse();
                    tester.permissionsRequest().allowNumberCapacitySelect().allowNumberCapacityUpdate().
                        receiveResponse();
                    tester.statusesRequest().receiveResponse();

                    tester.settingsRequest().
                        dontTriggerScrollRecalculation().
                        allowNumberCapacitySelect().
                        receiveResponse();

                    tester.othersNotification().
                        updateSettings().
                        shouldNotPlayCallEndingSignal().
                        expectToBeSent();
                    
                    notificationTester.grantPermission();

                    tester.numberCapacityRequest().receiveResponse();
                    tester.authenticatedUserRequest().receiveResponse();
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
        describe('Пользователь является руководителем.', function() {
            beforeEach(function() {
                accountRequest = accountRequest.manager();
            });

            it('Фичефлаг софтфона включен. Кнопка софтфона отображена.', function() {
                accountRequest.receiveResponse();

                tester.masterInfoMessage().receive();
                tester.slavesNotification().expectToBeSent();
                tester.slavesNotification().additional().expectToBeSent();

                tester.notificationChannel().tellIsLeader().expectToBeSent();
                tester.masterInfoMessage().tellIsLeader().expectToBeSent();

                tester.notificationChannel().applyLeader().expectToBeSent();
                tester.notificationChannel().applyLeader().expectToBeSent();

                const requests = ajax.inAnyOrder();

                const reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests),
                    reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                    reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                    secondAccountRequest = tester.accountRequest().expectToBeSent(requests);
                authCheckRequest = tester.authCheckRequest().expectToBeSent(requests);

                requests.expectToBeSent();

                reportsListRequest.receiveResponse();
                reportTypesRequest.receiveResponse();
                reportGroupsRequest.receiveResponse();
                secondAccountRequest.manager().receiveResponse();
                authCheckRequest.receiveResponse();

                tester.talkOptionsRequest().receiveResponse();
                tester.permissionsRequest().receiveResponse();
                tester.statusesRequest().receiveResponse();
                tester.settingsRequest().dontTriggerScrollRecalculation().receiveResponse();

                tester.slavesNotification().
                    twoChannels().
                    enabled().
                    expectToBeSent();

                tester.othersNotification().
                    updateSettings().
                    shouldNotPlayCallEndingSignal().
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
                    expectToBeSent();

                tester.button('Софтфон').expectToBeVisible();
            });
            it('Фичефлаг софтфона для руководителя включен. Кнопка софтфона отображена.', function() {
                accountRequest.managerSoftphoneFeatureFlagEnabled().receiveResponse();

                const requests = ajax.inAnyOrder();

                const reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests),
                    reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                    reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                    authCheckRequest = tester.authCheckRequest().expectToBeSent(requests),
                    secondAccountRequest = tester.accountRequest().expectToBeSent(requests);

                requests.expectToBeSent();

                reportsListRequest.receiveResponse();
                reportTypesRequest.receiveResponse();
                reportGroupsRequest.receiveResponse();
                secondAccountRequest.receiveResponse();

                tester.masterInfoMessage().receive();
                tester.slavesNotification().expectToBeSent();
                tester.slavesNotification().additional().expectToBeSent();

                tester.notificationChannel().tellIsLeader().expectToBeSent();
                tester.masterInfoMessage().tellIsLeader().expectToBeSent();

                tester.notificationChannel().applyLeader().expectToBeSent();
                tester.notificationChannel().applyLeader().expectToBeSent();

                authCheckRequest.receiveResponse();
                tester.talkOptionsRequest().receiveResponse();
                tester.permissionsRequest().receiveResponse();
                tester.statusesRequest().receiveResponse();
                tester.settingsRequest().dontTriggerScrollRecalculation().receiveResponse();

                tester.slavesNotification().
                    twoChannels().
                    enabled().
                    expectToBeSent();

                tester.othersNotification().
                    updateSettings().
                    shouldNotPlayCallEndingSignal().
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
                    expectToBeSent();
            });
            it('Фичафлаг софтфона выключен. Кнопка софтфона скрыта.', function() {
                accountRequest.softphoneFeatureFlagDisabled().receiveResponse();
                tester.notificationChannel().applyLeader().expectToBeSent();

                tester.reportGroupsRequest().receiveResponse();
                tester.reportsListRequest().receiveResponse();
                tester.reportTypesRequest().receiveResponse();

                tester.button('Софтфон').expectNotToExist();
                tester.button('История звонков').expectNotToExist();
            });
        });
        describe('Раздел контактов недоступен.', function() {
            beforeEach(function() {
                accountRequest.contactsFeatureFlagDisabled().receiveResponse();

                const requests = ajax.inAnyOrder();

                reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
                const reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                    reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                    authCheckRequest = tester.authCheckRequest().expectToBeSent(requests),
                    secondAccountRequest = tester.accountRequest().expectToBeSent(requests);

                requests.expectToBeSent();

                reportsListRequest.receiveResponse();
                reportTypesRequest.receiveResponse();
                secondAccountRequest.contactsFeatureFlagDisabled().receiveResponse();
                reportGroupsRequest.receiveResponse();

                tester.masterInfoMessage().receive();
                tester.slavesNotification().expectToBeSent();
                tester.slavesNotification().additional().expectToBeSent();

                tester.notificationChannel().tellIsLeader().expectToBeSent();
                tester.masterInfoMessage().tellIsLeader().expectToBeSent();

                tester.notificationChannel().applyLeader().expectToBeSent();
                tester.notificationChannel().applyLeader().expectToBeSent();

                authCheckRequest.receiveResponse();
                tester.talkOptionsRequest().receiveResponse();
                tester.permissionsRequest().receiveResponse();
                tester.statusesRequest().receiveResponse();
                tester.settingsRequest().receiveResponse();

                tester.slavesNotification().
                    twoChannels().
                    enabled().
                    expectToBeSent();

                tester.othersNotification().
                    updateSettings().
                    shouldNotPlayCallEndingSignal().
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
            });

            it(
                'Нажимаю на кнопку "Софтфон". Открываю историю звонков. Нажатие на имя контакта не приводит к ' +
                'открытию раздела контактов.',
            function() {
                tester.button('Софтфон').click();

                tester.slavesNotification().
                    additional().
                    visible().
                    expectToBeSent();

                tester.callsHistoryButton.click();
                tester.callsRequest().receiveResponse();

                tester.callsHistoryRow.
                    withText('Манова Тома').
                    name.
                    click();
            });
            it('Поступил входящий звонок. Кнопка открытия контакта заблокирована.', function() {
                tester.incomingCall().receive();

                tester.slavesNotification().
                    twoChannels().
                    available().
                    incoming().
                    progress().
                    expectToBeSent();

                tester.numaRequest().receiveResponse();

                tester.outCallEvent().knownContact().receive();
                tester.outCallEvent().knownContact().slavesNotification().expectToBeSent();

                tester.contactOpeningButton.click();

                tester.contactOpeningButton.expectToHaveClass('cmg-button-disabled');
                windowOpener.expectNoWindowToBeOpened();
            });
        });
        it(
            'Используеся проект CallGear. Необходимо подключиться к Janus. Подключаюсь.',
        function() {
            accountRequest.callGear().receiveResponse();
            tester.notificationChannel().applyLeader().expectToBeSent();

            const requests = ajax.inAnyOrder();

            reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
            const reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                secondAccountRequest = tester.accountRequest().expectToBeSent(requests);
            authCheckRequest = tester.authCheckRequest().expectToBeSent(requests);

            requests.expectToBeSent();

            reportsListRequest.receiveResponse();
            reportTypesRequest.receiveResponse();
            secondAccountRequest.callGear().receiveResponse();

            tester.masterInfoMessage().receive();
            tester.slavesNotification().expectToBeSent();
            tester.slavesNotification().additional().expectToBeSent();

            tester.notificationChannel().tellIsLeader().expectToBeSent();
            tester.masterInfoMessage().tellIsLeader().expectToBeSent();
            tester.notificationChannel().applyLeader().expectToBeSent();

            authCheckRequest.receiveResponse();
            tester.talkOptionsRequest().receiveResponse();
            permissionsRequest = tester.permissionsRequest().expectToBeSent();
            tester.statusesRequest().receiveResponse();
            settingsRequest = tester.settingsRequest().expectToBeSent();
            reportGroupsRequest.receiveResponse();

            tester.button('Софтфон').click();

            tester.slavesNotification().
                additional().
                visible().
                expectToBeSent();

            permissionsRequest.receiveResponse();

            tester.setTwoCallGearJanusUrls();
            settingsRequest.receiveResponse();

            tester.slavesNotification().
                twoChannels().
                enabled().
                expectToBeSent();

            tester.othersNotification().
                updateSettings().
                shouldNotPlayCallEndingSignal().
                expectToBeSent();
            
            notificationTester.grantPermission();

            tester.connectEventsWebSocket();

            tester.slavesNotification().
                twoChannels().
                enabled().
                softphoneServerConnected().
                expectToBeSent();

            tester.connectSIPWebSocket();
            tester.janusTransactionCreationRequest().receiveResponse();

            tester.slavesNotification().
                twoChannels().
                webRTCServerConnected().
                softphoneServerConnected().
                expectToBeSent();

            tester.allowMediaInput();

            tester.slavesNotification().
                twoChannels().
                webRTCServerConnected().
                softphoneServerConnected().
                microphoneAccessGranted().
                expectToBeSent();

            tester.authenticatedUserRequest().receiveResponse();

            tester.slavesNotification().
                userDataFetched().
                twoChannels().
                webRTCServerConnected().
                softphoneServerConnected().
                microphoneAccessGranted().
                expectToBeSent();

            tester.janusPluginAttachRequest().receiveResponse();
            tester.janusRegisterRequest().receiveResponse();
            tester.janusRegisteredMessage().receive();

            tester.janusPluginAttachRequest().
                expectToBeSent().
                setHelper().
                receiveResponse();

            tester.janusRegisterRequest().
                setHelper().
                expectToBeSent().
                receiveResponse();

            tester.janusRegisteredMessage().
                setHelper().
                receive();

            tester.slavesNotification().
                twoChannels().
                available().
                expectToBeSent();

            tester.webrtcWebsocket.disconnectAbnormally();

            spendTime(200);
            tester.connectSIPWebSocket(1);

            tester.janusTransactionCreationRequest().
                setAnotherSession().
                receiveResponse();

            tester.janusPluginAttachRequest().
                setAnotherSession().
                receiveResponse();

            tester.janusRegisterRequest().
                setAnotherSession().
                receiveResponse();

            tester.janusRegisteredMessage().
                setAnotherSession().
                receive();

            tester.janusPluginAttachRequest().
                setAnotherSession().
                expectToBeSent().
                setHelper().
                receiveResponse();

            tester.janusRegisterRequest().
                setAnotherSession().
                setHelper().
                expectToBeSent().
                receiveResponse();

            tester.janusRegisteredMessage().
                setAnotherSession().
                setHelper().
                receive();
        });
        it('Фичафлаг софтфона выключен. Кнопка софтфона скрыта.', function() {
            accountRequest.softphoneFeatureFlagDisabled().receiveResponse();

            tester.notificationChannel().applyLeader().expectToBeSent();
            spendTime(1000);
            tester.notificationChannel().applyLeader().expectToBeSent();
            spendTime(1000);
            tester.notificationChannel().tellIsLeader().expectToBeSent();

            tester.reportGroupsRequest().receiveResponse();
            tester.reportsListRequest().receiveResponse();
            tester.reportTypesRequest().receiveResponse();

            tester.button('Софтфон').expectNotToExist();
            tester.button('История звонков').expectNotToExist();
            tester.button('Статистика звонков').expectNotToExist();
        });
        it('Софтфон недоступен. Кнопка софтфона скрыта.', function() {
            accountRequest.softphoneUnavailable().receiveResponse();
            tester.notificationChannel().applyLeader().expectToBeSent();

            tester.reportGroupsRequest().receiveResponse();
            tester.reportsListRequest().receiveResponse();
            tester.reportTypesRequest().receiveResponse();

            tester.button('Софтфон').expectNotToExist();
            tester.button('История звонков').expectNotToExist();
            tester.button('Статистика звонков').expectNotToExist();
        });
    });
});
