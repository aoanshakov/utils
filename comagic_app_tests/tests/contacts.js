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

    describe('Открываю страницу контактов.', function() {
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
            accountRequest = tester.accountRequest().expectToBeSent();

            tester.masterInfoMessage().receive();
            tester.masterInfoMessage().tellIsLeader().expectToBeSent();
        });

        describe('Раздел контактов доступен. Открываю раздел контактов.', function() {
            let phoneBookContactsRequest;

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
                reportGroupsRequest.receiveResponse();

                tester.configRequest().softphone().receiveResponse();

                tester.slavesNotification().expectToBeSent();
                tester.slavesNotification().additional().expectToBeSent();

                tester.notificationChannel().applyLeader().expectToBeSent();
                spendTime(1000);
                tester.notificationChannel().applyLeader().expectToBeSent();
                spendTime(1000);
                tester.notificationChannel().tellIsLeader().expectToBeSent();

                tester.authCheckRequest().receiveResponse();
                statusesRequest = tester.statusesRequest().expectToBeSent();

                settingsRequest = tester.settingsRequest().expectToBeSent();
                tester.talkOptionsRequest().receiveResponse();

                settingsRequest.receiveResponse();
                tester.slavesNotification().twoChannels().enabled().expectToBeSent();

                permissionsRequest = tester.permissionsRequest().expectToBeSent();

                tester.othersNotification().widgetStateUpdate().expectToBeSent();
                tester.othersNotification().updateSettings().shouldNotPlayCallEndingSignal().expectToBeSent();

                permissionsRequest.receiveResponse();

                tester.connectEventsWebSocket();
                tester.slavesNotification().twoChannels().enabled().softphoneServerConnected().expectToBeSent();

                tester.connectSIPWebSocket();
                tester.slavesNotification().twoChannels().webRTCServerConnected().softphoneServerConnected().
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
                tester.slavesNotification().twoChannels().available().userDataFetched().expectToBeSent();

                statusesRequest.receiveResponse();

                tester.button('Контакты').click();
                phoneBookContactsRequest = tester.phoneBookContactsRequest().expectToBeSent();
            });

            describe('Получены данные для списка контактов.', function() {
                beforeEach(function() {
                    phoneBookContactsRequest.receiveResponse();
                });

                describe(
                    'Прокручиваю список контактов до конца. Запрошена следующая страница списка контактов.',
                function() {
                    beforeEach(function() {
                        tester.spinWrapper.scrollIntoView();
                        phoneBookContactsRequest = tester.phoneBookContactsRequest().secondPage().expectToBeSent();
                    });

                    describe('Получены данные для списка контактов.', function() {
                        beforeEach(function() {
                            phoneBookContactsRequest.receiveResponse();
                        });
                        
                        describe('Ввожу значение в поле поиска.', function() {
                            beforeEach(function() {
                                tester.input.fill('пас');
                            });

                            describe('Проходит некоторое время. Отправлен запрос контактов.', function() {
                                beforeEach(function() {
                                    spendTime(500);
                                    tester.phoneBookContactsRequest().search().receiveResponse();
                                });

                                it(
                                    'Прокручиваю список контактов до конца. Запрошена следующая страница списка ' +
                                    'контактов.',
                                function() {
                                    tester.spinWrapper.scrollIntoView();
                                    tester.phoneBookContactsRequest().search().secondPage().receiveResponse();

                                    tester.contactList.expectTextContentToHaveSubstringsConsideringOrder(
                                        'Тончева Десислава Пламеновна',
                                        'Паскалева Бисера Илковна #100',
                                        'Паскалева Бисера Илковна #200'
                                    );
                                });
                                it('Отображен список контаков.', function() {
                                    tester.contactList.expectTextContentToHaveSubstringsConsideringOrder(
                                        'Тончева Десислава Пламеновна',
                                        'Паскалева Бисера Илковна #100'
                                    );

                                    tester.contactList.expectTextContentNotToHaveSubstring(
                                        'Паскалева Бисера Илковна #200'
                                    );
                                });
                            });
                            it('Значение введено.', function() {
                                tester.input.expectToHaveValue('пас');
                            });
                        });
                        it('Отображен список контаков.', function() {
                            tester.contactList.expectTextContentToHaveSubstringsConsideringOrder(
                                'Тончева Десислава Пламеновна',
                                'Паскалева Бисера Илковна #100',
                                'Паскалева Бисера Илковна #200'
                            );

                            tester.input.expectToHaveValue('');
                            tester.spin.expectNotToExist();
                        });
                    });
                    it('Отображен спиннер.', function() {
                        tester.spin.expectToBeVisible();
                    });
                });
                it('Отображена страница контактов.', function() {
                    tester.contactList.expectTextContentToHaveSubstringsConsideringOrder(
                        'Тончева Десислава Пламеновна',
                        'Паскалева Бисера Илковна #100'
                    );

                    tester.spin.expectNotToExist();
                });
            });
            describe('Получены разные имена.', function() {
                beforeEach(function() {
                    phoneBookContactsRequest.differentNames().receiveResponse();
                });

                it('Нажимаю на имя. Имя выделено.', function() {
                    tester.contactList.item('Бележкова Грета Ервиновна').click();

                    tester.contactList.item('Балканска Берислава Силаговна').expectNotToBeSelected();
                    tester.contactList.item('Бележкова Грета Ервиновна').expectToBeSelected();
                });
                it('Имена сгруппированы по первым буквам.', function() {
                    tester.contactList.item('Балканска Берислава Силаговна').expectNotToBeSelected();
                    tester.contactList.item('Бележкова Грета Ервиновна').expectNotToBeSelected();

                    tester.contactList.expectTextContentToHaveSubstring(
                        'Б ' +

                        'Балканска Берислава Силаговна ' +
                        'Бележкова Грета Ервиновна ' +
                        'Белоконска-Вражалска Калиса Еньовна ' +

                        'В ' +

                        'Вампирска Джиневра Ериновна ' +
                        'Васовa Дилмана Златовна'
                    );
                });
            });
            it('Токен авторизации истек. Токен обновлен. Отправлен повторный запрос контактов.', function() {
                phoneBookContactsRequest.accessTokenExpired().receiveResponse();
                tester.refreshRequest().receiveResponse();

                tester.phoneBookContactsRequest().anotherAuthorizationToken().receiveResponse();
            });
            it('Отображен спиннер.', function() {
                tester.spin.expectToBeVisible();
            });
        });
        it('Раздел контактов недоступен. Пункт меню "Контакты" скрыт.', function() {
            accountRequest.contactsFeatureFlagDisabled().receiveResponse();

            const requests = ajax.inAnyOrder();

            reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
            const reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                secondAccountRequest = tester.accountRequest().expectToBeSent(requests);

            requests.expectToBeSent();

            reportsListRequest.receiveResponse();
            reportTypesRequest.receiveResponse();
            secondAccountRequest.contactsFeatureFlagDisabled().receiveResponse();
            reportGroupsRequest.receiveResponse();

            tester.configRequest().softphone().receiveResponse();

            tester.slavesNotification().expectToBeSent();
            tester.slavesNotification().additional().expectToBeSent();

            tester.notificationChannel().applyLeader().expectToBeSent();
            spendTime(1000);
            tester.notificationChannel().applyLeader().expectToBeSent();
            spendTime(1000);
            tester.notificationChannel().tellIsLeader().expectToBeSent();

            tester.authCheckRequest().receiveResponse();
            statusesRequest = tester.statusesRequest().expectToBeSent();

            settingsRequest = tester.settingsRequest().expectToBeSent();
            tester.talkOptionsRequest().receiveResponse();

            settingsRequest.receiveResponse();
            tester.slavesNotification().twoChannels().enabled().expectToBeSent();

            permissionsRequest = tester.permissionsRequest().expectToBeSent();

            tester.othersNotification().widgetStateUpdate().expectToBeSent();
            tester.othersNotification().updateSettings().shouldNotPlayCallEndingSignal().expectToBeSent();

            permissionsRequest.receiveResponse();

            tester.connectEventsWebSocket();
            tester.slavesNotification().twoChannels().enabled().softphoneServerConnected().expectToBeSent();

            tester.connectSIPWebSocket();
            tester.slavesNotification().twoChannels().webRTCServerConnected().softphoneServerConnected().
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
            tester.slavesNotification().twoChannels().available().userDataFetched().expectToBeSent();

            statusesRequest.receiveResponse();

            tester.button('Контакты').expectNotToExist();
        });
    });
});
