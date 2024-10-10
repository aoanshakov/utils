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
            localStorage.setItem('softphone-position-x', '174');
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
                const ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(requests),
                    reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                    reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                    employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(requests),
                    employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(requests),
                    employeeRequest = tester.employeeRequest().expectToBeSent(requests);

                authCheckRequest = tester.authCheckRequest().
                    xWidgetType().
                    expectToBeSent(requests);

                requests.expectToBeSent();

                ticketsContactsRequest.receiveResponse();
                reportsListRequest.receiveResponse();
                reportTypesRequest.receiveResponse();
                employeeStatusesRequest.receiveResponse();
                employeeSettingsRequest.receiveResponse(),
                employeeRequest.receiveResponse();
            });

            describe('Вкладка является ведущей.', function() {
                beforeEach(function() {
                    tester.masterInfoMessage().receive();

                    tester.employeesWebSocket.connect();
                    tester.employeesInitMessage().expectToBeSent();

                    tester.slavesNotification().
                        additional().
                        expectToBeSent();

                    tester.slavesNotification().expectToBeSent();

                    tester.masterInfoMessage().
                        tellIsLeader().
                        expectToBeSent();

                    tester.notificationChannel().
                        tellIsLeader().
                        expectToBeSent();

                    tester.employeesBroadcastChannel().
                        tellIsLeader().
                        expectToBeSent();

                    tester.notificationChannel().
                        applyLeader().
                        expectToBeSent();

                    tester.employeesBroadcastChannel().
                        applyLeader().
                        expectToBeSent();

                    tester.employeesBroadcastChannel().
                        applyLeader().
                        expectToBeSent();
                });

                describe('Авторизцацие прошла удачно.', function() {
                    beforeEach(function() {
                        authCheckRequest.receiveResponse();
                        tester.talkOptionsRequest().receiveResponse();
                        permissionsRequest = tester.permissionsRequest().expectToBeSent();
                    });

                    describe('Получены права.', function() {
                        beforeEach(function() {
                            permissionsRequest.receiveResponse();
                            settingsRequest = tester.settingsRequest().expectToBeSent();
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
                                                tester.accountRequest().receiveResponse();

                                                tester.slavesNotification().
                                                    additional().
                                                    visible().
                                                    expectToBeSent();
                                            });

                                            describe('SIP-регистрация завершена.', function() {
                                                beforeEach(function() {
                                                    registrationRequest.receiveResponse();

                                                    tester.slavesNotification().
                                                        twoChannels().
                                                        available().
                                                        expectToBeSent();
                                                });

                                                xdescribe('Открываю историю звонков.', function() {
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

                                                            describe(
                                                                'Нажимаю на кнопку закрытия сообщения.',
                                                            function() {
                                                                beforeEach(function() {
                                                                    tester.alert.closeButton.click();
                                                                });

                                                                it(
                                                                    'Соединение востановлено и снова разорвано. ' +
                                                                    'Отображено сообщение о разрыве сети.',
                                                                function() {
                                                                    spendTime(1001);
                                                                    Promise.runAll(false, true);

                                                                    tester.connectEventsWebSocket(1);
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

                                                                    tester.alert.
                                                                        expectTextContentToHaveSubstring('Разрыв сети');
                                                                });
                                                                it('Сообщение скрыто.', function() {
                                                                    tester.alert.expectNotToExist();
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
                                                                'Прокручиваю историю до конца. Запрошена вторая ' +
                                                                'страница истории.',
                                                            function() {
                                                                tester.callsGridScrolling().
                                                                    toTheEnd().
                                                                    scroll();

                                                                tester.callsRequest().
                                                                    infiniteScrollSecondPage().
                                                                    expectToBeSent();
                                                            });
                                                            it('Вторая страница истории еще не запрошена.', function() {
                                                                ajax.expectNoRequestsToBeSent();
                                                            });
                                                        });
                                                        it('Нажимаю на иконку звонка.', function() {
                                                            tester.callsHistoryRow.
                                                                withText('Гяурова Марийка').
                                                                callIcon.
                                                                click();

                                                            tester.firstConnection.connectWebRTC();
                                                            tester.firstConnection.callTrackHandler();
                                                            tester.allowMediaInput();

                                                            tester.numaRequest().anotherNumber().receiveResponse();

                                                            const outgoingCall = tester.outgoingCall().
                                                                setNumberFromCallsGrid().
                                                                expectToBeSent();

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
                                                            tester.callsHistoryRow.
                                                                withText('Гяурова Марийка').
                                                                name.
                                                                click();

                                                            windowOpener.expectToHavePath(
                                                                'https://comagicwidgets.amocrm.ru/contacts/detail/' +
                                                                '218401'
                                                            );
                                                        });
                                                        it(
                                                            'Нажимаю на строку с контактом. Открывается раздел ' +
                                                            'контактов.',
                                                        function() {
                                                            tester.callsHistoryRow.
                                                                withText('Манова Тома').
                                                                name.
                                                                click();

                                                            const usersRequest = tester.usersRequest().
                                                                forContacts().
                                                                expectToBeSent();

                                                            const secondUsersRequest = tester.usersRequest().
                                                                forContacts().
                                                                expectToBeSent();

                                                            const contactRequest = tester.contactRequest().
                                                                expectToBeSent();

                                                            const contactCommunicationsRequest =
                                                                tester.contactCommunicationsRequest().
                                                                    expectToBeSent();

                                                            const contactGroupsRequest =
                                                                tester.contactGroupsRequest().expectToBeSent();

                                                            const contactsRequest = tester.contactsRequest().
                                                                differentNames().
                                                                expectToBeSent();

                                                            usersRequest.receiveResponse();
                                                            secondUsersRequest.receiveResponse();
                                                            contactRequest.receiveResponse();
                                                            contactCommunicationsRequest.receiveResponse();
                                                            contactGroupsRequest.receiveResponse();
                                                            contactsRequest.receiveResponse();

                                                            tester.groupsContainingContactRequest().
                                                                receiveResponse();
                                                        });
                                                        it(
                                                            'Нажимаю на кнопку сворачивания софтфона. Отображено ' +
                                                            'поле для ввода телефона.',
                                                        function() {
                                                            tester.collapsednessToggleButton.click();
                                                            tester.phoneField.expectToBeVisible();
                                                        });
                                                        it(
                                                            'Нажимаю на кнопку первой линии. Отображено поле для ' +
                                                            'ввода номера.',
                                                        function() {
                                                            tester.firstLineButton.click();
                                                            tester.phoneField.expectToBeVisible();
                                                        });
                                                        it('Отображены иконки направлений.', function() {
                                                            tester.callsHistoryRow.
                                                                withText('Гяурова Марийка').
                                                                callIcon.
                                                                expectNotToHaveAttribute('disabled');

                                                            tester.callsHistoryRow.
                                                                withText('Гяурова Марийка').
                                                                direction.
                                                                expectNotToHaveClass('ui-direction-icon-failed');

                                                            tester.callsHistoryRow.
                                                                withText('Гяурова Марийка').
                                                                direction.
                                                                expectToHaveClass('ui-direction-icon-incoming');

                                                            tester.callsHistoryRow.
                                                                withText('Гяурова Марийка').
                                                                direction.
                                                                expectNotToHaveClass('ui-direction-icon-transfer');

                                                            tester.callsHistoryRow.
                                                                withText('Манова Тома').
                                                                direction.
                                                                expectNotToHaveClass('ui-direction-icon-failed');

                                                            tester.callsHistoryRow.
                                                                withText('Манова Тома').
                                                                direction.
                                                                expectToHaveClass('ui-direction-icon-outgoing');

                                                            tester.callsHistoryRow.
                                                                withText('Манова Тома').
                                                                direction.
                                                                expectNotToHaveClass('ui-direction-icon-transfer');

                                                            tester.softphone.expectToBeExpanded();
                                                        });
                                                    });
                                                    describe('Не было ни одного звонка за три месяца.', function() {
                                                        beforeEach(function() {
                                                            callsRequest.
                                                                noCalls().
                                                                receiveResponse();

                                                            callsRequest = tester.callsRequest().
                                                                fromHalfOfTheYearAgo().
                                                                expectToBeSent();
                                                        });

                                                        it('Найдены звонки за полгода. Звонки отображены.', function() {
                                                            callsRequest.receiveResponse();

                                                            tester.softphone.expectTextContentToHaveSubstring(
                                                                'Гяурова Марийка 08:03'
                                                            );
                                                        });
                                                        it(
                                                            'Не было ни одного звонка за полгода. Отображено ' +
                                                            'сообщение об отсутствии звонков.',
                                                        function() {
                                                            callsRequest.noCalls().receiveResponse();

                                                            tester.softphone.expectToHaveTextContent(
                                                                'Совершите звонок для отображения истории'
                                                            );
                                                        });
                                                    });
                                                    it(
                                                        'Есть записи в которых не найденн контакт. Нажимаю на номер ' +
                                                        'записи. Открыта форма создания контакта.',
                                                    function() {
                                                        callsRequest.
                                                            noContact().
                                                            receiveResponse();

                                                        tester.triggerScrollRecalculation();

                                                        tester.callsHistoryRow.
                                                            withText('+7 (495) 023-06-26').
                                                            name.
                                                            click();

                                                        tester.usersRequest().
                                                            forContacts().
                                                            receiveResponse();

                                                        tester.usersRequest().
                                                            forContacts().
                                                            receiveResponse();

                                                        tester.contactGroupsRequest().receiveResponse();

                                                        tester.contactsRequest().
                                                            differentNames().
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
                                                        callsRequest.
                                                            transferCall().
                                                            receiveResponse();

                                                        tester.triggerScrollRecalculation();

                                                        tester.body.expectTextContentToHaveSubstring(
                                                            'Сегодня ' +
                                                            'Гяурова Марийка 08:03 ' +

                                                            'Вчера ' +
                                                            'Манова Тома 18:08 ' +

                                                            '17 декабря 2019 ' +

                                                            'Сотирова Атанаска 12:02 ' +
                                                            'Сотирова Атанаска 05:57'
                                                        );

                                                        tester.callsHistoryRow.
                                                            withText('Гяурова Марийка').
                                                            direction.
                                                            expectNotToHaveClass('ui-direction-icon-failed');

                                                        tester.callsHistoryRow.
                                                            withText('Гяурова Марийка').
                                                            direction.
                                                            expectToHaveClass('ui-direction-icon-incoming');

                                                        tester.callsHistoryRow.
                                                            withText('Гяурова Марийка').
                                                            direction.
                                                            expectToHaveClass('ui-direction-icon-transfer');
                                                    });
                                                });
                                                xdescribe('Нажимаю на кнопку "Выход". Вхожу в лк заново.', function() {
                                                    beforeEach(function() {
                                                        tester.header.userName.click();
                                                        tester.logoutButton.click();

                                                        tester.userLogoutRequest().receiveResponse();

                                                        tester.slavesNotification().
                                                            userDataFetched().
                                                            twoChannels().
                                                            microphoneAccessGranted().
                                                            destroyed().
                                                            enabled().
                                                            expectToBeSent();

                                                        tester.masterInfoMessage().leaderDeath().expectToBeSent();
                                                        tester.authLogoutRequest().receiveResponse();

                                                        tester.employeesWebSocket.finishDisconnecting();
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
                                                        tester.ticketsContactsRequest().receiveResponse();

                                                        tester.softphone.expectNotToExist();
                                                        tester.button('Софтфон').expectNotToExist();
                                                    });
                                                    it('Софтфон доступен. Отображен софтфон.', function() {
                                                        accountRequest.receiveResponse();
                                                        tester.employeesWebSocket.connect();

                                                        tester.employeesInitMessage().
                                                            anotherAuthorizationToken().
                                                            expectToBeSent();

                                                        tester.authCheckRequest().
                                                            anotherAuthorizationToken().
                                                            receiveResponse()

                                                        tester.reportGroupsRequest().
                                                            anotherAuthorizationToken().
                                                            receiveResponse();

                                                        tester.reportsListRequest().receiveResponse();
                                                        tester.reportTypesRequest().receiveResponse();

                                                        tester.masterInfoMessage().receive();

                                                        tester.masterInfoMessage().
                                                            tellIsLeader().
                                                            expectToBeSent();

                                                        tester.slavesNotification().expectToBeSent();

                                                        tester.slavesNotification().
                                                            additional().
                                                            visible().
                                                            expectToBeSent();

                                                        tester.talkOptionsRequest().receiveResponse();
                                                        tester.permissionsRequest().receiveResponse();

                                                        tester.employeeStatusesRequest().
                                                            anotherAuthorizationToken().
                                                            noNotAtWorkplace().
                                                            includesAutoCall().
                                                            receiveResponse();

                                                        tester.employeeSettingsRequest().receiveResponse();

                                                        tester.employeeRequest().
                                                            anotherAuthorizationToken().
                                                            receiveResponse();

                                                        tester.ticketsContactsRequest().receiveResponse();

                                                        tester.accountRequest().
                                                            anotherAuthorizationToken().
                                                            receiveResponse();

                                                        tester.settingsRequest().
                                                            anotherAuthorizationToken().
                                                            receiveResponse();

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

                                                        tester.registrationRequest().receiveUnauthorized();

                                                        tester.registrationRequest().
                                                            authorization().
                                                            receiveResponse();

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

                                                        tester.softphone.userName.click();

                                                        tester.statusesList.
                                                            item('Исходящий обзвон').
                                                            expectToBeVisible();

                                                        tester.statusesList.
                                                            item('Нет на месте').
                                                            expectNotToExist();

                                                        tester.statusesList.expectHeightToBeMoreThan(172);
                                                    });
                                                });
                                                xdescribe('Нажимаю на кнопку открытия диалпада.', function() {
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

                                                                tester.outCallEvent().
                                                                    slavesNotification().
                                                                    expectToBeSent();
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
                                                                            expectTextContentToHaveSubstring(
                                                                                'Путь лида'
                                                                            );
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
                                                                'Нажимаю на кнопку сворачивания софтфона. Софтфон ' +
                                                                'свернут.',
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

                                                            tester.dialpadButton(1).
                                                                expectNotToHaveAttribute('disabled');
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
                                                        it(
                                                            'Нажимаю на кнопку диалпада. Отображен диалпад.',
                                                        function() {
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
                                                                        'https://comagicwidgets.amocrm.ru/leads/' +
                                                                        'detail/3003651'
                                                                    );
                                                                });
                                                                it('Софтфон свернут.', function() {
                                                                    tester.softphone.expectToBeCollapsed();
                                                                });
                                                            });
                                                            it('Нажимаю на ссылку сделки. Открыта сделка.', function() {
                                                                tester.anchor('По звонку с 79154394340').click();

                                                                windowOpener.expectToHavePath(
                                                                    'https://comagicwidgets.amocrm.ru/leads/detail/' +
                                                                    '3003651'
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
                                                        it('Нет открытых сделок. Отображен диалпад.', function() {
                                                            outCallSessionEvent.receive();

                                                            tester.outCallSessionEvent().
                                                                slavesNotification().
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

                                                        tester.addressBookButton.
                                                            expectNotToHaveClass('cmg-button-pressed');

                                                        tester.digitRemovingButton.expectToBeVisible();
                                                        tester.softphone.expectToBeExpanded();

                                                        if (localStorage.getItem('isExpanded') != 'true') {
                                                            throw new Error(
                                                                'В локальном хранилище должна быть сохранена ' +
                                                                'развернутость софтфона.'
                                                            );
                                                        }
                                                    });
                                                });
                                                xdescribe('Нажимаю на кнопку аккаунта.', function() {
                                                    beforeEach(function() {
                                                        tester.header.userName.click();
                                                    });

                                                    describe('Выбираю другой статус.', function() {
                                                        let employeeUpdatingRequest;

                                                        beforeEach(function() {
                                                            tester.statusesList.
                                                                item('Нет на месте').
                                                                click();

                                                            employeeUpdatingRequest = tester.employeeUpdatingRequest().
                                                                expectToBeSent();
                                                        });

                                                        it(
                                                            'Токен авторизации истек. Отображена форма авторизации. ' +
                                                            'Авторизуюсь заново.',
                                                        function() {
                                                            employeeUpdatingRequest.
                                                                accessTokenExpired().
                                                                receiveResponse();
                                                            
                                                            tester.refreshRequest().
                                                                refreshTokenExpired().
                                                                receiveResponse();

                                                            tester.userLogoutRequest().receiveResponse();

                                                            tester.slavesNotification().
                                                                userDataFetched().
                                                                twoChannels().
                                                                destroyed().
                                                                microphoneAccessGranted().
                                                                enabled().
                                                                expectToBeSent();

                                                            tester.masterInfoMessage().
                                                                leaderDeath().
                                                                expectToBeSent();

                                                            tester.authLogoutRequest().receiveResponse();

                                                            tester.employeesWebSocket.finishDisconnecting();
                                                            tester.eventsWebSocket.finishDisconnecting();

                                                            tester.registrationRequest().
                                                                expired().
                                                                receiveResponse();

                                                            spendTime(2000);
                                                            tester.webrtcWebsocket.finishDisconnecting();

                                                            tester.input.
                                                                withFieldLabel('Логин').
                                                                fill('botusharova');

                                                            tester.input.
                                                                withFieldLabel('Пароль').
                                                                fill('8Gls8h31agwLf5k');

                                                            tester.button('Войти').click();

                                                            tester.loginRequest().receiveResponse();
                                                            tester.accountRequest().receiveResponse();

                                                            tester.authCheckRequest().receiveResponse();
                                                            tester.reportGroupsRequest().receiveResponse();
                                                            tester.reportsListRequest().receiveResponse();
                                                            tester.reportTypesRequest().receiveResponse();

                                                            tester.employeesWebSocket.connect();
                                                            tester.employeesInitMessage().expectToBeSent();

                                                            tester.talkOptionsRequest().receiveResponse();
                                                            tester.permissionsRequest().receiveResponse();

                                                            tester.employeeStatusesRequest().receiveResponse();
                                                            tester.employeeSettingsRequest().receiveResponse();
                                                            tester.employeeRequest().receiveResponse();
                                                            tester.ticketsContactsRequest().receiveResponse();

                                                            tester.masterInfoMessage().receive();

                                                            tester.masterInfoMessage().
                                                                tellIsLeader().
                                                                expectToBeSent();

                                                            tester.slavesNotification().expectToBeSent();

                                                            tester.slavesNotification().
                                                                additional().
                                                                visible().
                                                                expectToBeSent();

                                                            tester.settingsRequest().receiveResponse();
                                                            tester.accountRequest().receiveResponse();

                                                            tester.slavesNotification().
                                                                twoChannels().
                                                                enabled().
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

                                                            tester.registrationRequest().receiveUnauthorized();

                                                            tester.registrationRequest().
                                                                authorization().
                                                                receiveResponse();

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
                                                            employeeUpdatingRequest.receiveResponse();

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

                                                            tester.entityChangeEvent().
                                                                anotherStatus().
                                                                receive();

                                                            tester.entityChangeEvent().
                                                                anotherStatus().
                                                                slavesNotification().
                                                                expectToBeSent();

                                                            tester.statusesList.item('Доступен').
                                                                expectNotToBeSelected();

                                                            tester.statusesList.item('Нет на месте').
                                                                expectToBeSelected();

                                                            tester.body.expectTextContentToHaveSubstring(
                                                                'Гонева Стевка Нет на месте'
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

                                                        tester.entityChangeEvent().
                                                            updateStatus().
                                                            receive();

                                                        tester.entityChangeEvent().
                                                            updateStatus().
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
                                                            
                                                        tester.entityChangeEvent().
                                                            removeStatus().
                                                            receive();

                                                        tester.entityChangeEvent().
                                                            removeStatus().
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
                                                    it(
                                                        'Добавлен новый статус. Отображен добавленный статус.',
                                                    function() {
                                                        tester.statusChangedEvent().receive();

                                                        tester.statusChangedEvent().
                                                            slavesNotification().
                                                            expectToBeSent();

                                                        tester.entityChangeEvent().
                                                            insertStatus().
                                                            receive();

                                                        tester.entityChangeEvent().
                                                            insertStatus().
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
                                                        tester.statusesList.
                                                            item('Доступен').
                                                            expectToBeSelected();

                                                        tester.statusesList.
                                                            item('Нет на месте').
                                                            expectNotToBeSelected();

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
                                                xdescribe('Нажимаю на кнопку таблицы сотрудников.', function() {
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

                                                        tester.softphone.
                                                            expectTextContentToHaveSubstring('Разрыв сети');
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
                                                xdescribe(
                                                    'Прошло некоторое время. Сервер событий не отвечает.',
                                                function() {
                                                    beforeEach(function() {
                                                        spendTime(5000);
                                                        tester.expectPingToBeSent();
                                                        tester.employeesPing().expectToBeSent();
                                                        spendTime(1000);
                                                        tester.receivePong();
                                                        tester.employeesPing().receive();

                                                        spendTime(5000);
                                                        tester.expectPingToBeSent();
                                                        tester.employeesPing().expectToBeSent();
                                                        spendTime(2000);
                                                        spendTime(0);

                                                        tester.slavesNotification().
                                                            twoChannels().
                                                            registered().
                                                            webRTCServerConnected().
                                                            microphoneAccessGranted().
                                                            userDataFetched().
                                                            expectToBeSent();
                                                    });

                                                    it(
                                                        'Получен понг. Нажимаю на кнопку с жуком. Скачивается лог. В ' +
                                                        'логе отсутствует пинг-понг.',
                                                    function() {
                                                        tester.receivePong();

                                                        tester.slavesNotification().
                                                            twoChannels().
                                                            available().
                                                            expectToBeSent();

                                                        tester.authenticatedUserRequest().receiveResponse();
                                                        tester.bugButton.click();

                                                        tester.anchor.withFileName('20191219.121007.000.log.txt').
                                                            expectHrefToBeBlobWithoutSubstring(
                                                                'message sent:' +
                                                                "\n\n" +
                                                                '{"type":"ping","data":"ping"}'
                                                            );

                                                        tester.anchor.withFileName('20191219.121007.000.log.txt').
                                                            expectHrefToBeBlobWithoutSubstring(
                                                                'message received:' +
                                                                "\n\n" +
                                                                '{"type":"ping","data":"pong"}'
                                                            );

                                                        tester.anchor.withFileName('20191219.121007.000.log.txt').
                                                            expectHrefToBeBlobWithoutSubstring(
                                                                'message sent:' +
                                                                "\n\n" +
                                                                '{}'
                                                            );

                                                        tester.anchor.withFileName('20191219.121007.000.log.txt').
                                                            expectHrefToBeBlobWithoutSubstring(
                                                                'message received:' +
                                                                "\n\n" +
                                                                '{}'
                                                            );

                                                        tester.anchor.withFileName('20191219.121007.000.log.txt').
                                                            expectHrefToBeBlobWithSubstring(
                                                                '"name":"init",' +
                                                                '"params":{' +
                                                                    '"jwt":' +
                                                                        '"XaRnb2KVS0V7v08oa4Ua-' +
                                                                        'sTvpxMKSg9XuKrYaGSinB0"' +
                                                                '}'
                                                            );

                                                        tester.anchor.withFileName('20191219.121007.000.log.txt').
                                                            expectHrefToBeBlobWithSubstring('Pong received');
                                                    });
                                                    it(
                                                        'Нажимаю на кнопку с жуком. Скачивается лог. В логе ' +
                                                        'присутствует сообщение о том, что понг не был получен ' +
                                                        'вовремя.',
                                                    function() {
                                                        tester.bugButton.click();

                                                        tester.anchor.withFileName('20191219.121007.000.log.txt').
                                                            expectHrefToBeBlobWithSubstring(
                                                                'Pong was not received in time'
                                                            );

                                                        tester.anchor.withFileName('20191219.121007.000.log.txt').
                                                            expectHrefToBeBlobWithoutSubstring('Pong received');
                                                    });
                                                    it('Отображено сообщение об установке соединения.', function() {
                                                        tester.softphone.expectToHaveTextContent(
                                                            'Устанавливается соединение...'
                                                        );
                                                    });
                                                });
                                                describe('Выбирай другой статус.', function() {
                                                    let employeeUpdatingRequest;

                                                    beforeEach(function() {
                                                        tester.softphone.userName.click();

                                                        tester.statusesList.
                                                            item('Нет на месте').
                                                            click();

                                                        employeeUpdatingRequest = tester.employeeUpdatingRequest().
                                                            expectToBeSent();
                                                    });

                                                    xit(
                                                        'Сервер ответил сообщением о внутренней ошибке сервера. ' +
                                                        'Отображён прежний статус.',
                                                    function() {
                                                        employeeUpdatingRequest.
                                                            internalError().
                                                            receiveResponse();

                                                        tester.softphone.
                                                            userName.
                                                            icon.
                                                            expectAttributeToHaveValue('color', '#cc5d35');
                                                    });
                                                    it(
                                                        'Не удалось соединиться с сервером. Отображён прежний статус.',
                                                    function() {
                                                        employeeUpdatingRequest.
                                                            networkError().
                                                            receiveResponse();

                                                        tester.softphone.
                                                            userName.
                                                            icon.
                                                            expectAttributeToHaveValue('color', '#cc5d35');
                                                    });
                                                    return;
                                                    it('Другой статус выбран.', function() {
                                                        employeeUpdatingRequest.receiveResponse();

                                                        tester.slavesNotification().
                                                            twoChannels().
                                                            anotherStatus().
                                                            available().
                                                            expectToBeSent();

                                                        tester.softphone.
                                                            userName.
                                                            icon.
                                                            expectAttributeToHaveValue('color', '#ebb03b');
                                                    });
                                                });
                                                return;
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

                                                    tester.registrationRequest().
                                                        expired().
                                                        receiveResponse();
                                                    
                                                    spendTime(2000);
                                                    tester.webrtcWebsocket.finishDisconnecting();

                                                    tester.softphone.expectTextContentToHaveSubstring(
                                                        'Софтфон открыт в другом окне'
                                                    );
                                                });
                                                it(
                                                    'Доступ к серверу кол-центра отключен. Выход из аккаунта не ' +
                                                    'произошёл.',
                                                function() {
                                                    tester.eventsWebSocket.disconnect(4404);
                                                    tester.authLogoutRequest().receiveResponse();

                                                    tester.slavesNotification().
                                                        userDataFetched().
                                                        enabled().
                                                        twoChannels().
                                                        destroyed().
                                                        microphoneAccessGranted().
                                                        expectToBeSent();

                                                    tester.masterInfoMessage().
                                                        leaderDeath().
                                                        expectToBeSent();

                                                    tester.registrationRequest().
                                                        expired().
                                                        receiveResponse();

                                                    spendTime(2000);
                                                    tester.webrtcWebsocket.finishDisconnecting();

                                                    tester.softphone.expectToBeVisible();
                                                });
                                                it(
                                                    'Соединение разрывается. Отображено сообщение об установке ' +
                                                    'соединения.',
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
                                                    tester.employeesPing().expectToBeSent();
                                                    spendTime(2000);
                                                    spendTime(0);

                                                    tester.slavesNotification().
                                                        twoChannels().
                                                        webRTCServerConnected().
                                                        microphoneAccessGranted().
                                                        registered().
                                                        userDataFetched().
                                                        expectToBeSent();

                                                    tester.firstLineButton.expectToHaveClass(
                                                        'cmg-bottom-button-selected'
                                                    );

                                                    tester.secondLineButton.expectNotToHaveClass(
                                                        'cmg-bottom-button-selected'
                                                    );

                                                    tester.softphone.expectToHaveTextContent(
                                                        'Устанавливается соединение...'
                                                    );
                                                });
                                                it(
                                                    'Перехожу на вторую линию. Выхожу и вхожу в софтфон заново. ' +
                                                    'Активна первая линия.',
                                                function() {
                                                    tester.secondLineButton.click();

                                                    tester.slavesNotification().
                                                        twoChannels().
                                                        changedChannelToSecond().
                                                        available().
                                                        expectToBeSent();

                                                    tester.header.userName.click();
                                                    tester.logoutButton.click();

                                                    tester.userLogoutRequest().receiveResponse();

                                                    tester.slavesNotification().
                                                        userDataFetched().
                                                        twoChannels().
                                                        changedChannelToSecond().
                                                        destroyed().
                                                        microphoneAccessGranted().
                                                        enabled().
                                                        expectToBeSent();

                                                    tester.masterInfoMessage().
                                                        leaderDeath().
                                                        expectToBeSent();
                                                    
                                                    tester.employeesWebSocket.finishDisconnecting();
                                                    tester.authLogoutRequest().receiveResponse();
                                                    tester.eventsWebSocket.finishDisconnecting();

                                                    tester.registrationRequest().
                                                        expired().
                                                        receiveResponse();

                                                    spendTime(2000);
                                                    tester.webrtcWebsocket.finishDisconnecting();

                                                    tester.input.
                                                        withFieldLabel('Логин').
                                                        fill('botusharova');

                                                    tester.input.
                                                        withFieldLabel('Пароль').
                                                        fill('8Gls8h31agwLf5k');

                                                    tester.button('Войти').click();

                                                    tester.loginRequest().
                                                        anotherAuthorizationToken().
                                                        receiveResponse();

                                                    tester.accountRequest().
                                                        anotherAuthorizationToken().
                                                        receiveResponse();

                                                    tester.employeesWebSocket.connect();

                                                    tester.employeesInitMessage().
                                                        anotherAuthorizationToken().
                                                        expectToBeSent();

                                                    tester.authCheckRequest().
                                                        anotherAuthorizationToken().
                                                        receiveResponse();

                                                    tester.reportGroupsRequest().
                                                        anotherAuthorizationToken().
                                                        receiveResponse();

                                                    tester.reportsListRequest().receiveResponse();
                                                    tester.reportTypesRequest().receiveResponse();

                                                    tester.masterInfoMessage().receive();

                                                    tester.masterInfoMessage().
                                                        tellIsLeader().
                                                        expectToBeSent();

                                                    tester.slavesNotification().expectToBeSent();

                                                    tester.slavesNotification().
                                                        additional().
                                                        visible().
                                                        expectToBeSent();

                                                    broadcastChannels.
                                                        nextMessage().
                                                        expectNotToExist();

                                                    tester.talkOptionsRequest().receiveResponse();
                                                    tester.permissionsRequest().receiveResponse();

                                                    tester.employeeStatusesRequest().
                                                        anotherAuthorizationToken().
                                                        receiveResponse();

                                                    tester.employeeSettingsRequest().receiveResponse();

                                                    tester.employeeRequest().
                                                        anotherAuthorizationToken().
                                                        receiveResponse();

                                                    tester.ticketsContactsRequest().receiveResponse();

                                                    tester.accountRequest().
                                                        anotherAuthorizationToken().
                                                        receiveResponse();

                                                    tester.settingsRequest().
                                                        anotherAuthorizationToken().
                                                        receiveResponse();

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
                                                        userDataFetched().
                                                        twoChannels().
                                                        webRTCServerConnected().
                                                        softphoneServerConnected().
                                                        expectToBeSent();

                                                    tester.registrationRequest().receiveUnauthorized();

                                                    tester.registrationRequest().
                                                        authorization().
                                                        receiveResponse();

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

                                                    tester.firstLineButton.expectToHaveClass(
                                                        'cmg-bottom-button-selected'
                                                    );
                                                    
                                                    tester.secondLineButton.expectNotToHaveClass(
                                                        'cmg-bottom-button-selected'
                                                    );
                                                });
                                                it(
                                                    'Нажимаю на кнопку перехвата. Совершается исходящий звонок на ' +
                                                    'номер 88.',
                                                function() {
                                                    tester.interceptButton.click();

                                                    tester.firstConnection.connectWebRTC();
                                                    tester.allowMediaInput();

                                                    const outgoingCall = tester.outgoingCall().
                                                        intercept().
                                                        start();

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

                                                    tester.numaRequest().
                                                        intercept().
                                                        receiveResponse();
                                                });
                                                it('Нажимаю на кнпоку вызова. Ничего не проиcходит.', function() {
                                                    tester.callStartingButton.click();
                                                });
                                                it(
                                                    'Открывается новая вкладка. Отправляется запрос обновления ' +
                                                    'состояния.',
                                                function() {
                                                    tester.masterNotification().
                                                        tabOpened().
                                                        receive();

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
                                                    tester.masterNotification().
                                                        call().
                                                        receive();

                                                    tester.firstConnection.connectWebRTC();
                                                    tester.allowMediaInput();

                                                    tester.outgoingCall().expectToBeSent()

                                                    tester.slavesNotification().
                                                        available().
                                                        twoChannels().
                                                        sending().
                                                        expectToBeSent();

                                                    tester.numaRequest().receiveResponse();

                                                    tester.outgoingIcon.expectToBeVisible();

                                                    tester.softphone.expectTextContentToHaveSubstring(
                                                        '+7 (916) 123-45-67 ' +
                                                        'Поиск контакта... 00:00'
                                                    );
                                                });
                                                it(
                                                    'От ведомой вкладки получен токен. Ничего не сломалось.',
                                                function() {
                                                    tester.masterInfoMessage().
                                                        applyLeader().
                                                        receive();

                                                    tester.masterInfoMessage().
                                                        tellIsLeader().
                                                        expectToBeSent();
                                                });
                                                it(
                                                    'Получен запрос на выход из софтфона. Отображена форма ' +
                                                    'авторизации.',
                                                function() {
                                                    tester.masterNotification().
                                                        destroy().
                                                        receive();

                                                    tester.slavesNotification().
                                                        userDataFetched().
                                                        twoChannels().
                                                        destroyed().
                                                        microphoneAccessGranted().
                                                        enabled().
                                                        expectToBeSent();

                                                    tester.masterInfoMessage().
                                                        leaderDeath().
                                                        expectToBeSent();

                                                    tester.authLogoutRequest().receiveResponse();
                                                    tester.userLogoutRequest().receiveResponse();

                                                    tester.employeesWebSocket.finishDisconnecting();
                                                    tester.eventsWebSocket.finishDisconnecting();

                                                    tester.registrationRequest().
                                                        expired().
                                                        receiveResponse();

                                                    spendTime(2000);
                                                    tester.webrtcWebsocket.finishDisconnecting();

                                                    tester.input.withFieldLabel('Логин').expectToBeVisible();
                                                });
                                                it(
                                                    'Авторизационная кука удалена. Получен запрос на выход из ' +
                                                    'софтфона. Отображена форма авторизации.',
                                                function() {
                                                    document.cookie = '';

                                                    tester.masterNotification().
                                                        destroy().
                                                        receive();

                                                    tester.slavesNotification().
                                                        userDataFetched().
                                                        twoChannels().
                                                        destroyed().
                                                        microphoneAccessGranted().
                                                        enabled().
                                                        expectToBeSent();

                                                    tester.masterInfoMessage().
                                                        leaderDeath().
                                                        expectToBeSent();

                                                    broadcastChannels.
                                                        nextMessage().
                                                        expectNotToExist();

                                                    tester.authLogoutRequest().receiveResponse();

                                                    tester.employeesWebSocket.finishDisconnecting();
                                                    tester.eventsWebSocket.finishDisconnecting();

                                                    tester.registrationRequest().
                                                        expired().
                                                        receiveResponse();

                                                    spendTime(2000);
                                                    tester.webrtcWebsocket.finishDisconnecting();

                                                    tester.input.
                                                        withFieldLabel('Логин').
                                                        expectToBeVisible();
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

                                                    tester.anchor.withFileName('20191219.121007.000.log.txt').
                                                        expectHrefToBeBlobWithSubstring(
                                                            'GET https://$REACT_APP_SOFTPHONE_BACKEND_HOST' +
                                                            '/sup/auth/check'
                                                        );
                                                });
                                                it('Отображен софтфон.', function() {
                                                    if (localStorage.getItem('isExpanded') != 'false') {
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
                                                        'Ганева Стефка Доступен'
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

                                                    tester.softphone.
                                                        userName.
                                                        icon.
                                                        expectAttributeToHaveValue('color', '#cc5d35');
                                                });
                                            });
                                            return;
                                            it('Не удалось зарегистрировать SIP-линию.', function() {
                                                registrationRequest.receiveForbidden();

                                                tester.slavesNotification().
                                                    twoChannels().
                                                    enabled().
                                                    registrationFailed().
                                                    microphoneAccessGranted().
                                                    userDataFetched().
                                                    expectToBeSent();
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
                                        return;
                                        it(
                                            'Нажимаю на кнопку "Поддержка". Открыто окно формы для ввода сообщения в ' +
                                            'техническую поддержку.',
                                        function() {
                                            tester.button('Поддержка').click();
                                            spendTime(10);

                                            tester.input.withPlaceholder('Фамилия Имя Отчество').
                                                fill('Валчева Албена Станимир');

                                            tester.input.withPlaceholder('7').fill('79161234567');

                                            tester.input.withPlaceholder('example@example.com').
                                                fill('valcheva@gmail.com');

                                            tester.textarea.withPlaceholder('Опишите проблему').
                                                fill('Что-то нехорошее произошло');

                                            tester.button('Отправить').click();

                                            tester.ticketCreatingRequest().
                                                logAttached().
                                                receiveResponse();

                                            blobsTester.some(blob => blob.expectToHaveSubstring(
                                                ' wss://webrtc.uiscom.ru message sent:' +
                                                 "\n\n" +
                                                'REGISTER sip:voip.uiscom.ru SIP/2.0'
                                            ));
                                        });
                                        it(
                                            'От ведомой вкладки пришел запрос отображения софтфона. Софтфон отображен.',
                                        function() {
                                            tester.masterNotification().
                                                toggleWidgetVisiblity().
                                                receive();

                                            tester.accountRequest().receiveResponse();
                                            tester.callStartingButton.expectToBeVisible();

                                            tester.slavesNotification().
                                                additional().
                                                visible().
                                                expectToBeSent();
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

                                            tester.slavesNotification().
                                                twoChannels().
                                                available().
                                                expectToBeSent();

                                            reportGroupsRequest.accessTokenExpired().receiveResponse();
                                            refreshRequest = tester.refreshRequest().expectToBeSent();
                                        });

                                        it(
                                            'Токен авторизации обновлен. Получены данные для отчета. Отображен пункт ' +
                                            'меню.',
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
                                describe('SIP-линия не зарегистрирована. Нажимаю на иконку с телефоном.', function() {
                                    beforeEach(function() {
                                        tester.button('Софтфон').click();
                                        tester.accountRequest().receiveResponse();

                                        tester.slavesNotification().
                                            additional().
                                            visible().
                                            expectToBeSent();

                                        tester.phoneField.fill('79161234567');

                                        authenticatedUserRequest.
                                            sipIsOffline().
                                            receiveResponse();

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
                                        'SIP-линия зарегистрирована. Сообщение о том, что SIP-линия не ' +
                                        'зарегистрирована не отображено.',
                                    function() {
                                        tester.employeeChangedEvent().
                                            isSipOnline().
                                            receive();

                                        tester.slavesNotification().
                                            available().
                                            twoChannels().
                                            expectToBeSent();

                                        tester.employeeChangedEvent().
                                            isSipOnline().
                                            slavesNotification().
                                            expectToBeSent();
                                         
                                        tester.callStartingButton.
                                            expectNotToHaveAttribute('disabled');

                                        tester.softphone.
                                            expectTextContentNotToHaveSubstring('Sip-линия не зарегистрирована');
                                    });
                                    it('Отображено сообщение о том, что SIP-линия не зарегистрирована.', function() {
                                        tester.softphone.expectToBeCollapsed();
                                        tester.callStartingButton.expectToHaveAttribute('disabled');

                                        tester.softphone.expectTextContentToHaveSubstring(
                                            'Sip-линия не зарегистрирована'
                                        );
                                    });
                                });
                            });
return;
                            describe('Доступ к микрофону отклонен. Нажимаю на иконку телефона.', function() {
                                beforeEach(function() {
                                    tester.disallowMediaInput();

                                    tester.slavesNotification().
                                        twoChannels().
                                        webRTCServerConnected().
                                        microphoneAccessDenied().
                                        softphoneServerConnected().
                                        expectToBeSent();

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
                                    tester.accountRequest().receiveResponse();

                                    tester.slavesNotification().
                                        additional().
                                        visible().
                                        expectToBeSent();
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

                                tester.registrationRequest().receiveUnauthorized();

                                tester.registrationRequest().
                                    authorization().
                                    receiveResponse();

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

                            describe('Поступает входящий звонок.', function() {
                                let numaRequest;

                                beforeEach(function() {
                                    tester.incomingCall().receive();

                                    tester.slavesNotification().
                                        available().
                                        twoChannels().
                                        incoming().
                                        progress().
                                        expectToBeSent();

                                    numaRequest = tester.numaRequest().expectToBeSent();
                                    tester.accountRequest().receiveResponse();
                                });

                                describe('Позвонивший не является сотрудником.', function() {
                                    beforeEach(function() {
                                        numaRequest.receiveResponse();
                                    });

                                    it(
                                        'Контакт не найден. Вместо номера звонка отображен идентификатор сессии.',
                                    function() {
                                        tester.outCallEvent().
                                            noName().
                                            noCrmContactLink().
                                            receive();

                                        tester.outCallEvent().
                                            noName().
                                            noCrmContactLink().
                                            slavesNotification().
                                            expectToBeSent();

                                        tester.softphone.expectTextContentToHaveSubstring(
                                            '980925456 ' +
                                            'Неизвестный номер'
                                        );
                                    });
                                    it('Получена информация о звонке.', function() {
                                        tester.outCallEvent().
                                            contactNameWithWithDigits().
                                            receive();

                                        tester.outCallEvent().
                                            contactNameWithWithDigits().
                                            slavesNotification().
                                            expectToBeSent();

                                        tester.softphone.expectTextContentToHaveSubstring(
                                            'Мой номер +7 (916) 234-56-78 ' +
                                            'Неизвестный номер'
                                        );
                                    });
                                    it('Номер скрыт.', function() {
                                        tester.copyIcon.expectNotToExist();

                                        tester.softphone.expectTextContentToHaveSubstring(
                                            'Неизвестный номер ' +
                                            'Поиск контакта...'
                                        );
                                    });
                                });
                                it(
                                    'Позвонивший является сотрудником и его имя было получено. Отображено имя ' +
                                    'сотрудника.',
                                function() {
                                    numaRequest.employeeNameFound().receiveResponse();

                                    tester.slavesNotification().
                                        additional().
                                        visible().
                                        name().
                                        expectToBeSent();

                                    tester.softphone.expectTextContentToHaveSubstring(
                                        'Шалева Дора ' +
                                        'Неизвестный номер'
                                    );
                                });
                            });
                            it('Открываю историю звонков.', function() {
                                tester.button('Софтфон').click();
                                tester.accountRequest().receiveResponse();

                                tester.slavesNotification().
                                    additional().
                                    visible().
                                    expectToBeSent();

                                tester.callsHistoryButton.click();
                                tester.callsRequest().noContactName().receiveResponse();

                                tester.softphone.expectTextContentToHaveSubstring(
                                    'Сегодня ' +
                                    'Неизвестный номер 08:03 ' +

                                    'Вчера ' +
                                    'Манова Тома 18:08'
                                );
                            });
                        });
                        it(
                            'Сначала запрос от лк, а потом и запрос от софтфона завершился ошибкой истечения токена ' +
                            'авторизации. Отправлен только один запрос обновления токена.',
                        function() {
                            reportGroupsRequest.
                                accessTokenExpired().
                                receiveResponse();

                            tester.refreshRequest().receiveResponse();

                            settingsRequest.
                                accessTokenExpired().
                                receiveResponse();
                            
                            tester.reportGroupsRequest().
                                anotherAuthorizationToken().
                                expectToBeSent();

                            tester.refreshRequest().
                                anotherAuthorizationToken().
                                receiveResponse();

                            tester.settingsRequest().
                                thirdAuthorizationToken().
                                expectToBeSent();
                        });
                        it(
                            'Сначала запрос от софтфона, а потом и запрос от лк завершился ошибкой истечения токена ' +
                            'авторизации. Отправлен только один запрос обновления токена.',
                        function() {
                            settingsRequest.
                                accessTokenExpired().
                                receiveResponse();

                            tester.refreshRequest().receiveResponse();

                            reportGroupsRequest.
                                accessTokenExpired().
                                receiveResponse();

                            tester.settingsRequest().
                                anotherAuthorizationToken().
                                expectToBeSent();

                            tester.refreshRequest().
                                anotherAuthorizationToken().
                                receiveResponse();

                            tester.reportGroupsRequest().
                                thirdAuthorizationToken().
                                expectToBeSent();
                        });
                        it(
                            'Срок действия токена авторизации истек. Токен авторизации обновлен. Софтфон подключен.',
                        function() {
                            settingsRequest.
                                accessTokenExpired().
                                receiveResponse();

                            tester.refreshRequest().receiveResponse();

                            tester.settingsRequest().
                                anotherAuthorizationToken().
                                receiveResponse();

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

                            tester.allowMediaInput();

                            tester.slavesNotification().
                                twoChannels().
                                webRTCServerConnected().
                                softphoneServerConnected().
                                microphoneAccessGranted().
                                expectToBeSent();

                            tester.authenticatedUserRequest().
                                anotherAuthorizationToken().
                                receiveResponse();

                            tester.slavesNotification().
                                userDataFetched().
                                twoChannels().
                                webRTCServerConnected().
                                softphoneServerConnected().
                                microphoneAccessGranted().
                                expectToBeSent();

                            tester.registrationRequest().receiveUnauthorized();

                            tester.registrationRequest().
                                authorization().
                                receiveResponse();

                            tester.slavesNotification().
                                twoChannels().
                                available().
                                expectToBeSent();
                        });
                        it('Токен невалиден. Отображена форма аутентификации.', function() {
                            settingsRequest.
                                accessTokenInvalid().
                                receiveResponse();

                            notificationTester.grantPermission();

                            const requests = ajax.inAnyOrder();

                            userLogoutRequest = tester.userLogoutRequest().expectToBeSent(requests);
                            authLogoutRequest = tester.authLogoutRequest().expectToBeSent(requests);

                            requests.expectToBeSent();

                            userLogoutRequest.receiveResponse();
                            authLogoutRequest.receiveResponse();

                            tester.employeesWebSocket.finishDisconnecting();

                            tester.slavesNotification().
                                destroyed().
                                expectToBeSent();

                            tester.masterInfoMessage().
                                leaderDeath().
                                expectToBeSent();

                            tester.input.
                                withFieldLabel('Логин').
                                expectToBeVisible();
                        });
                        it('Получен абсолютный URL сервера. Открыт веб-сокет.', function() {
                            settingsRequest.
                                anotherWsUrl().
                                receiveResponse();

                            notificationTester.grantPermission();

                            tester.slavesNotification().
                                twoChannels().
                                enabled().
                                expectToBeSent();

                            tester.thirdEventWebSocketPath();
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
                                userDataFetched().
                                expectToBeSent();
                        });
                    });
return;
                    describe('Нажимаю на иконку с телефоном.', function() {
                        beforeEach(function() {
                            reportGroupsRequest.receiveResponse();

                            tester.button('Софтфон').click();
                            tester.accountRequest().receiveResponse();

                            tester.slavesNotification().
                                additional().
                                visible().
                                expectToBeSent();
                        });

                        describe('Пользователь имеет права на список номеров.', function() {
                            beforeEach(function() {
                                permissionsRequest = permissionsRequest.allowNumberCapacitySelect();
                                settingsRequest = tester.settingsRequest().allowNumberCapacitySelect();
                            });

                            describe(
                                'У выбранного номера нет комментария. Пользователь имеет права на выбор номера.',
                            function() {
                                let authenticatedUserRequest,
                                    numberCapacityRequest;

                                beforeEach(function() {
                                    permissionsRequest.
                                        allowNumberCapacityUpdate().
                                        receiveResponse();

                                    settingsRequest.receiveResponse();

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

                                    tester.allowMediaInput();

                                    tester.slavesNotification().
                                        twoChannels().
                                        webRTCServerConnected().
                                        softphoneServerConnected().
                                        microphoneAccessGranted().
                                        expectToBeSent();

                                    numberCapacityRequest = tester.numberCapacityRequest().expectToBeSent();

                                    tester.registrationRequest().receiveUnauthorized();

                                    tester.registrationRequest().
                                        authorization().
                                        receiveResponse();

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
                                                });

                                                it(
                                                    'Нажимаю на кнопку открытия диалпада. Отображен выбранный ' +
                                                    'номер с комментарием.',
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
                                                    'Стираю введенное в поле поиска значение. Отображены все ' +
                                                    'номера.',
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
                                                tester.input.
                                                    withPlaceholder('Найти').
                                                    fill('один');

                                                tester.select.
                                                    popup.
                                                    expectToHaveTextContent('+7 (916) 123-89-35 Еще один номер');
                                            });
                                            it('Выбранный номер выделен.', function() {
                                                tester.select.
                                                    option('+7 (916) 123-89-27').
                                                    expectNotToHaveClass('ui-list-option-selected');

                                                tester.select.
                                                    option('+7 (495) 021-68-06').
                                                    expectToHaveClass('ui-list-option-selected');

                                                tester.select.popup.expectNotToHaveTopOffset(4);
                                                tester.select.popup.expectToHaveHeight(331);

                                                tester.button('Отменить').expectNotToExist();
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
                                        'SIP-линия не зарегистрирована. Отображено сообщение о том, что ' +
                                        'SIP-линия не зарегистрирована.',
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
                            describe(
                                'У выбранного номера есть комментарий. Пользователь имеет права на выбор номера.',
                            function() {
                                let authenticatedUserRequest;

                                beforeEach(function() {
                                    permissionsRequest.allowNumberCapacityUpdate().receiveResponse();
                                    settingsRequest.numberCapacityComment().receiveResponse();

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

                                    tester.allowMediaInput();

                                    tester.slavesNotification().
                                        twoChannels().
                                        webRTCServerConnected().
                                        softphoneServerConnected().
                                        microphoneAccessGranted().
                                        expectToBeSent();

                                    tester.numberCapacityRequest().withComment().receiveResponse();
                                        
                                    tester.registrationRequest().receiveUnauthorized();

                                    tester.registrationRequest().
                                        authorization().
                                        receiveResponse();

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
                                    authenticatedUserRequest.
                                        sipIsOffline().
                                        receiveResponse();

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
                                    permissionsRequest.
                                        allowNumberCapacityUpdate().
                                        receiveResponse();

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

                                describe(
                                    'Получена неокончательная информация о звонке. Автоответ включен.',
                                function() {
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
                                        tester.outCallEvent().
                                            needAutoAnswer().
                                            receive();

                                        tester.outCallEvent().
                                            needAutoAnswer().
                                            slavesNotification().
                                            expectToBeSent();

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
                                    'Получена окончательная информация о звонке. Имя длинное. Отображена информация ' +
                                    'о звонке.',
                                function() {
                                    tester.outCallEvent().
                                        longName().
                                        receive();

                                    tester.outCallEvent().
                                        longName().
                                        slavesNotification().
                                        expectToBeSent();

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

                                    tester.outCallEvent().
                                        slavesNotification().
                                        expectToBeSent();

                                    tester.incomingIcon.expectToBeVisible();

                                    tester.softphone.
                                        expectTextContentToHaveSubstring(
                                            'Шалева Дора ' +
                                            '+7 (916) 123-45-67 ' +

                                            'Путь лида'
                                        );
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
                                    permissionsRequest.allowNumberCapacityUpdate().receiveResponse();
                                    settingsRequest.longNumberCapacityComment().receiveResponse();

                                    tester.slavesNotification().
                                        twoChannels().
                                        enabled().
                                        expectToBeSent();

                                    notificationTester.grantPermission();

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

                                    tester.registrationRequest().receiveUnauthorized();

                                    tester.registrationRequest().
                                        authorization().
                                        receiveResponse();
                                    
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
                                    tester.select.
                                        arrow.
                                        click();

                                    tester.numberCapacityRequest().
                                        withLongComment().
                                        receiveResponse();
                                });
                                it('Открываю диалпад. Отображен длинный комментарий.', function() {
                                    tester.dialpadVisibilityButton.click();

                                    tester.softphone.expectTextContentToHaveSubstring(
                                        '+7 (495) 021-68-06 ' +
                                        'Кобыла и трупоглазые жабы искали цезию, нашли поздно утром свистящего хна'
                                    );
                                });
                            });
                            it('У выбранного номера нет комментария. Безуспешно пытаюсь выбрать номер.', function() {
                                permissionsRequest.receiveResponse();
                                settingsRequest.receiveResponse();

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

                                tester.registrationRequest().receiveUnauthorized();

                                tester.registrationRequest().
                                    authorization().
                                    receiveResponse();

                                tester.slavesNotification().
                                    twoChannels().
                                    available().
                                    expectToBeSent();

                                tester.select.arrow.click();
                                tester.numberCapacityRequest().receiveResponse();

                                tester.select.
                                    option('+7 (916) 123-89-29 Некий номер').
                                    click();
                            });
                        });
                        describe('Пользователь не имеет права на список номеров.', function() {
                            beforeEach(function() {
                                permissionsRequest.receiveResponse();
                                settingsRequest = tester.settingsRequest().expectToBeSent();
                            });

                            describe('Включено управление звонками на другом устройстве.', function() {
                                beforeEach(function() {
                                    settingsRequest.callsAreManagedByAnotherDevice().receiveResponse();

                                    tester.slavesNotification().
                                        twoChannels().
                                        disabled().
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
                                        tester.header.userName.click();
                                        tester.statusesList.item('Нет на месте').click();

                                        tester.employeeUpdatingRequest().receiveResponse();

                                        tester.entityChangeEvent().
                                            anotherStatus().
                                            receive();

                                        tester.entityChangeEvent().
                                            anotherStatus().
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

                                        tester.statusesList.
                                            item('Не беспокоить').
                                            expectNotToBeSelected();

                                        tester.statusesList.
                                            item('Нет на месте').
                                            expectToBeSelected();

                                        tester.body.expectTextContentToHaveSubstring('Гонева Стевка Нет на месте');
                                    });
                                    it(
                                        'Отображено сообщение о том, включено управление звонками с другого ' +
                                        'устройства или программы.',
                                    function() {
                                        tester.softphone.expectToBeCollapsed();

                                        tester.softphone.expectToHaveTextContent(
                                            'Используется на другом устройстве ' +
                                            'Включено управление звонками с другого устройства или программы'
                                        );
                                    });
                                });
                                it(
                                    'Устанавливается соединение. Отображено сообщение об установке соединения.',
                                function() {
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

                                    notificationTester.grantPermission();

                                    tester.slavesNotification().expectToBeSent();

                                    tester.slavesNotification().
                                        twoChannels().
                                        disabled().
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

                                    tester.usersRequest().
                                        forContacts().
                                        expectToBeSent();

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
                                settingsRequest.
                                    secondRingtone().
                                    isNeedDisconnectSignal().
                                    receiveResponse();

                                tester.othersNotification().
                                    updateSettings().
                                    shouldPlayCallEndingSignal().
                                    incomingRingtone().
                                    expectToBeSent();

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

                                tester.allowMediaInput();

                                tester.slavesNotification().
                                    twoChannels().
                                    webRTCServerConnected().
                                    softphoneServerConnected().
                                    microphoneAccessGranted().
                                    expectToBeSent();

                                tester.ringtoneRequest().receiveResponse();
                                fileReader.accomplishFileLoading(tester.secondRingtone);

                                mediaStreamsTester.setIsAbleToPlayThough(
                                    'data:audio/wav;base64,' + tester.secondRingtone
                                );

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
return;
                it(
                    'Токен истек. Токен обновлен. Повторный запрос авторизации закончился успешно. Софтфон доступен.',
                function() {
                    authCheckRequest.expiredToken().receiveResponse();
                    tester.refreshRequest().receiveResponse();

                    tester.authCheckRequest().
                        anotherAuthorizationToken().
                        receiveResponse();

                    tester.talkOptionsRequest().receiveResponse();
                    tester.permissionsRequest().receiveResponse();

                    tester.settingsRequest().
                        anotherAuthorizationToken().
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

                    tester.allowMediaInput();

                    tester.slavesNotification().
                        twoChannels().
                        webRTCServerConnected().
                        softphoneServerConnected().
                        microphoneAccessGranted().
                        expectToBeSent();

                    tester.authenticatedUserRequest().receiveResponse();

                    tester.slavesNotification().
                        twoChannels().
                        webRTCServerConnected().
                        softphoneServerConnected().
                        microphoneAccessGranted().
                        userDataFetched().
                        expectToBeSent();

                    tester.registrationRequest().receiveUnauthorized();

                    tester.registrationRequest().
                        authorization().
                        receiveResponse();

                    tester.slavesNotification().
                        twoChannels().
                        available().
                        expectToBeSent();
                });
            });
return;
            describe('Вкладка является ведомой. Открываю софтфон.', function() {
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

                    tester.settingsRequest().
                        dontTriggerScrollRecalculation().
                        allowNumberCapacitySelect().
                        receiveResponse();

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
                });

                describe('Скрываю окно.', function() {
                    beforeEach(function() {
                        setDocumentVisible(false);
                        tester.masterNotification().tabBecameHidden().expectToBeSent();
                    });

                    describe('Вкладка становится ведущей. Поднимается webRTC-сокет.', function() {
                        beforeEach(function() {
                            tester.masterInfoMessage().receive();

                            tester.employeesWebSocket.connect();
                            tester.employeesInitMessage().expectToBeSent();

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

                            tester.slavesNotification().
                                userDataFetched().
                                twoChannels().
                                enabled().
                                hidden().
                                expectToBeSent();

                            tester.slavesNotification().
                                tabsVisibilityRequest().
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
                                hidden().
                                expectToBeSent();

                            tester.connectSIPWebSocket();

                            tester.slavesNotification().
                                userDataFetched().
                                twoChannels().
                                webRTCServerConnected().
                                softphoneServerConnected().
                                hidden().
                                expectToBeSent();

                            tester.allowMediaInput();

                            tester.slavesNotification().
                                userDataFetched().
                                twoChannels().
                                webRTCServerConnected().
                                softphoneServerConnected().
                                microphoneAccessGranted().
                                hidden().
                                expectToBeSent();

                            tester.authenticatedUserRequest().receiveResponse();
                            tester.registrationRequest().receiveUnauthorized();

                            tester.registrationRequest().
                                authorization().
                                receiveResponse();

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
                        it( 'Прошло некоторое время. Проверка наличия ведущей вкладки не совершается.', function() {
                            spendTime(3000);
                            spendTime(0);
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
                        tester.slavesNotification().
                            tabsVisibilityRequest().
                            receive();
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

                    tester.employeesWebSocket.connect();
                    tester.employeesInitMessage().expectToBeSent();

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

                    tester.slavesNotification().
                        userDataFetched().
                        twoChannels().
                        enabled().
                        expectToBeSent();

                    tester.slavesNotification().
                        tabsVisibilityRequest().
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

                    tester.allowMediaInput();

                    tester.slavesNotification().
                        userDataFetched().
                        twoChannels().
                        webRTCServerConnected().
                        softphoneServerConnected().
                        microphoneAccessGranted().
                        expectToBeSent();

                    tester.authenticatedUserRequest().receiveResponse();
                    tester.registrationRequest().receiveUnauthorized();

                    tester.registrationRequest().
                        authorization().
                        receiveResponse();

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

                    tester.masterInfoMessage().receive();

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
                        visible().
                        expectToBeSent();

                    tester.authCheckRequest().receiveResponse();
                    tester.reportGroupsRequest().receiveResponse();
                    tester.reportsListRequest().receiveResponse();
                    tester.reportTypesRequest().receiveResponse();

                    tester.talkOptionsRequest().receiveResponse();
                    tester.permissionsRequest().receiveResponse();

                    tester.employeeStatusesRequest().receiveResponse();
                    tester.employeeSettingsRequest().receiveResponse();
                    tester.employeeRequest().receiveResponse();
                    tester.ticketsContactsRequest().receiveResponse();

                    tester.settingsRequest().receiveResponse();

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
                    
                    tester.accountRequest().receiveResponse();
                    tester.authenticatedUserRequest().receiveResponse();

                    tester.slavesNotification().
                        twoChannels().
                        webRTCServerConnected().
                        softphoneServerConnected().
                        userDataFetched().
                        expectToBeSent();

                    tester.registrationRequest().receiveUnauthorized();

                    tester.registrationRequest().
                        authorization().
                        receiveResponse();

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

                    tester.masterInfoMessage().receive();

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
                        visible().
                        expectToBeSent();

                    tester.authCheckRequest().receiveResponse();
                    tester.reportGroupsRequest().receiveResponse();
                    tester.reportsListRequest().receiveResponse();
                    tester.reportTypesRequest().receiveResponse();

                    tester.talkOptionsRequest().receiveResponse();
                    tester.permissionsRequest().receiveResponse();

                    tester.employeeStatusesRequest().receiveResponse();
                    tester.employeeSettingsRequest().receiveResponse();
                    tester.employeeRequest().receiveResponse();
                    tester.ticketsContactsRequest().receiveResponse();

                    tester.settingsRequest().receiveResponse();

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

                    tester.accountRequest().receiveResponse();
                    tester.authenticatedUserRequest().receiveResponse();

                    tester.slavesNotification().
                        twoChannels().
                        webRTCServerConnected().
                        softphoneServerConnected().
                        userDataFetched().
                        expectToBeSent();

                    tester.registrationRequest().receiveUnauthorized();

                    tester.registrationRequest().
                        authorization().
                        receiveResponse();

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
                    tester.masterNotification().
                        toggleWidgetVisiblity().
                        receive();

                    tester.phoneField.expectToBeVisible();
                });
                it('Получен запрос выбора номера от другой вкладки.', function() {
                    tester.othersNotification().
                        widgetStateUpdate().
                        fixedNumberCapacityRule().
                        anotherNumberCapacity().
                        receive();

                    tester.select.expectToHaveTextContent('+7 (916) 123-89-29');
                });
                it('Выбран другой статус. Отображен выбранный статус.', function() {
                    tester.entityChangeEvent().
                        slavesNotification().
                        receive();

                    tester.body.expectTextContentToHaveSubstring('Гонева Стевка Перерыв');
                });
                it('Окно свернуто. В ведущую вкладку отправлено сообщение о том, что окно свернуто.', function() {
                    setDocumentVisible(false);

                    tester.masterNotification().
                        tabBecameHidden().
                        expectToBeSent();
                });
                it('Закрываю окно. Отправляется сообщение о скрытии окна.', function() {
                    unload();

                    tester.masterNotification().
                        tabBecameHidden().
                        expectToBeSent();
                });
                it('Получен запрос видимости окна. Отправлено сообщение о видимости вкладки.', function() {
                    tester.slavesNotification().
                        tabsVisibilityRequest().
                        receive();

                    tester.masterNotification().
                        tabBecameVisible().
                        expectToBeSent();
                });
                it(
                    'Нажимаю на кнпоку выход. Софтфон разлогинивается. Отправлен запрос выключения софтфона в мастер ' +
                    'вкладку.',
                function() {
                    tester.header.userName.click();
                    tester.logoutButton.click();

                    tester.userLogoutRequest().receiveResponse();
                    tester.authLogoutRequest().receiveResponse();

                    tester.masterNotification().
                        destroy().
                        expectToBeSent();

                    tester.masterInfoMessage().
                        leaderDeath().
                        expectToBeSent();
                });
                it('Прошло некоторое время. Проверяется наличие ведущей вкладки.', function() {
                    spendTime(2000);
                    spendTime(0);

                    tester.masterInfoMessage().
                        applyLeader().
                        expectToBeSent();

                    tester.notificationChannel().
                        applyLeader().
                        expectToBeSent();
                });
                it('Попытка восстановления соединения не совершается.', function() {
                    tester.expectNoWebsocketConnecting();

                    tester.select.expectToHaveTextContent('+7 (495) 021-68-06');
                    tester.body.expectTextContentToHaveSubstring('Ганева Стефка Доступен');
                });
            });
            describe(
                'Окно свернуто. Вкладка является ведомой. Отправлено сообщение о том, что вкладка открыта в фоне.',
            function() {
                beforeEach(function() {
                    setDocumentVisible(false);

                    tester.masterInfoMessage().
                        isNotMaster().
                        receive();

                    tester.masterInfoMessage().
                        applyLeader().
                        expectToBeSent();

                    tester.masterNotification().
                        tabOpenedInBackground().
                        expectToBeSent();

                    authCheckRequest.receiveResponse();
                    tester.talkOptionsRequest().receiveResponse();

                    tester.permissionsRequest().
                        allowNumberCapacitySelect().
                        allowNumberCapacityUpdate().
                        receiveResponse();

                    tester.settingsRequest().
                        dontTriggerScrollRecalculation().
                        allowNumberCapacitySelect().
                        receiveResponse();

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

                    tester.masterNotification().
                        tabBecameVisible().
                        expectToBeSent();
                });
            });
        });
return;
        describe('Пользователь является руководителем.', function() {
            beforeEach(function() {
                accountRequest = accountRequest.manager();
            });

            it('Фичефлаг софтфона включен. Кнопка софтфона отображена.', function() {
                accountRequest.receiveResponse();

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
                reportGroupsRequest.receiveResponse();
                authCheckRequest.receiveResponse();
                employeeStatusesRequest.receiveResponse();
                employeeSettingsRequest.receiveResponse();
                employeeRequest.receiveResponse();

                tester.talkOptionsRequest().receiveResponse();
                tester.permissionsRequest().receiveResponse();
                tester.settingsRequest().dontTriggerScrollRecalculation().receiveResponse();

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

                tester.registrationRequest().receiveUnauthorized();

                tester.registrationRequest().
                    authorization().
                    receiveResponse();

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

                const ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(requests),
                    reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests),
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
                reportGroupsRequest.receiveResponse();
                employeeStatusesRequest.receiveResponse();
                employeeSettingsRequest.receiveResponse();
                employeeRequest.receiveResponse();

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

                authCheckRequest.receiveResponse();
                tester.talkOptionsRequest().receiveResponse();
                tester.permissionsRequest().receiveResponse();
                tester.settingsRequest().dontTriggerScrollRecalculation().receiveResponse();

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

                tester.registrationRequest().receiveUnauthorized();

                tester.registrationRequest().
                    authorization().
                    receiveResponse();

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
                accountRequest.
                    softphoneFeatureFlagDisabled().
                    receiveResponse();

                tester.notificationChannel().
                    applyLeader().
                    expectToBeSent();

                tester.ticketsContactsRequest().receiveResponse(),
                tester.reportGroupsRequest().receiveResponse();
                tester.reportsListRequest().receiveResponse();
                tester.reportTypesRequest().receiveResponse();

                tester.button('Софтфон').expectNotToExist();
                tester.button('История звонков').expectNotToExist();
            });
        });
        describe('Раздел контактов недоступен.', function() {
            beforeEach(function() {
                accountRequest.
                    contactsFeatureFlagDisabled().
                    receiveResponse();

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
                reportsListRequest.receiveResponse();
                reportTypesRequest.receiveResponse();
                reportGroupsRequest.receiveResponse();
                employeeStatusesRequest.receiveResponse();
                employeeSettingsRequest.receiveResponse();
                employeeRequest.receiveResponse();

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

                authCheckRequest.receiveResponse();
                tester.talkOptionsRequest().receiveResponse();
                tester.permissionsRequest().receiveResponse();
                tester.settingsRequest().receiveResponse();

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
            });

            it(
                'Нажимаю на кнопку "Софтфон". Открываю историю звонков. Нажатие на имя контакта не приводит к ' +
                'открытию раздела контактов.',
            function() {
                tester.button('Софтфон').click();

                tester.accountRequest().
                    contactsFeatureFlagDisabled().
                    receiveResponse();

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

                tester.accountRequest().
                    contactsFeatureFlagDisabled().
                    receiveResponse();

                tester.outCallEvent().knownContact().receive();
                tester.outCallEvent().knownContact().slavesNotification().expectToBeSent();

                tester.contactOpeningButton.click();

                tester.contactOpeningButton.expectToHaveClass('cmg-button-disabled');
                windowOpener.expectNoWindowToBeOpened();
            });
        });
        describe('Цифры в имени контакта должны быть скрыты при скрытии номеров.', function() {
            let settingsRequest;

            beforeEach(function() {
                accountRequest.
                    shouldHideNumbersInContactName().
                    receiveResponse();

                tester.notificationChannel().
                    applyLeader().
                    expectToBeSent();

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
                reportsListRequest.receiveResponse();
                reportTypesRequest.receiveResponse();
                reportGroupsRequest.receiveResponse();
                employeeStatusesRequest.receiveResponse();
                employeeSettingsRequest.receiveResponse();
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
                tester.talkOptionsRequest().receiveResponse();
                tester.permissionsRequest().receiveResponse();
                settingsRequest = tester.settingsRequest().expectToBeSent();
            });

            describe('Номера телефонов не должны быть скрыты. Поступил входящий звонок.', function() {
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

                    registrationRequest.receiveResponse();

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

                    tester.accountRequest().
                        shouldHideNumbersInContactName().
                        receiveResponse();

                    tester.outCallEvent().
                        contactNameWithWithDigits().
                        receive();

                    tester.outCallEvent().
                        contactNameWithWithDigits().
                        slavesNotification().
                        expectToBeSent();
                });

                it('Включено скрытие номеров. Цифры в имени контакта скрыты.', function() {
                    tester.employeeChangedEvent().
                        isNeedHideNumbers().
                        receive();

                    tester.employeeChangedEvent().
                        isNeedHideNumbers().
                        slavesNotification().
                        expectToBeSent();

                    tester.softphone.expectTextContentToHaveSubstring(
                        'Мой номер ... ' +
                        'Неизвестный номер'
                    );
                });
                it('Цифры в имени контакта видимы.', function() {
                    tester.softphone.expectTextContentToHaveSubstring(
                        'Мой номер +7 (916) 234-56-78 ' +
                        '+7 (916) 123-45-67'
                    );
                });
            });
            describe('Номера телефонов должны быть скрыты.', function() {
                beforeEach(function() {
                    settingsRequest.
                        shouldHideNumbers().
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

                    registrationRequest.receiveResponse();

                    tester.slavesNotification().
                        twoChannels().
                        available().
                        expectToBeSent();
                });

                it('Открываю историю звонков. Цифры в имени контакта скрыты.', function() {
                    tester.button('Софтфон').click();

                    tester.accountRequest().
                        shouldHideNumbersInContactName().
                        receiveResponse();

                    tester.slavesNotification().
                        additional().
                        visible().
                        expectToBeSent();

                    tester.callsHistoryButton.click();

                    tester.callsRequest().
                        contactNameWithWithDigits().
                        receiveResponse();

                    tester.softphone.expectTextContentToHaveSubstring('Мой номер ... 08:03');
                });
                it('Поступил входящий звонок. Цифры в имени контакта скрыты.', function() {
                    tester.incomingCall().receive();

                    tester.slavesNotification().
                        available().
                        twoChannels().
                        incoming().
                        progress().
                        expectToBeSent();

                    tester.numaRequest().receiveResponse();

                    tester.accountRequest().
                        shouldHideNumbersInContactName().
                        receiveResponse();

                    tester.outCallEvent().
                        contactNameWithWithDigits().
                        receive();

                    tester.outCallEvent().
                        contactNameWithWithDigits().
                        slavesNotification().
                        expectToBeSent();

                    tester.softphone.expectTextContentToHaveSubstring(
                        'Мой номер ... ' +
                        'Неизвестный номер'
                    );
                });
            });
        });
        it('Используеся проект CallGear. Необходимо подключиться к Janus. Подключаюсь.', function() {
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

            tester.setTwoCallGearJanusUrls();
            settingsRequest.receiveResponse();

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

            tester.ticketsContactsRequest().receiveResponse(),
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

            tester.ticketsContactsRequest().receiveResponse(),
            tester.reportGroupsRequest().receiveResponse();
            tester.reportsListRequest().receiveResponse();
            tester.reportTypesRequest().receiveResponse();

            tester.button('Софтфон').expectNotToExist();
            tester.button('История звонков').expectNotToExist();
            tester.button('Статистика звонков').expectNotToExist();
        });
    });
});
