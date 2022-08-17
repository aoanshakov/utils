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

        describe('Раздел контактов доступен.', function() {
            let contactsRequest;

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
            });

            describe('Открываю раздел контактов.', function() {
                beforeEach(function() {
                    tester.button('Контакты').click();
                    contactsRequest = tester.contactsRequest().expectToBeSent();
                });

                describe('Получены данные для списка контактов.', function() {
                    beforeEach(function() {
                        contactsRequest.receiveResponse();
                    });

                    describe(
                        'Прокручиваю список контактов до конца. Запрошена следующая страница списка контактов.',
                    function() {
                        beforeEach(function() {
                            tester.spinWrapper.scrollIntoView();
                            contactsRequest = tester.contactsRequest().secondPage().expectToBeSent();
                        });

                        describe('Получены данные для списка контактов.', function() {
                            beforeEach(function() {
                                contactsRequest.receiveResponse();
                            });
                            
                            describe('Ввожу значение в поле поиска.', function() {
                                beforeEach(function() {
                                    tester.input.fill('пас');
                                });

                                describe('Проходит некоторое время. Отправлен запрос контактов.', function() {
                                    beforeEach(function() {
                                        spendTime(500);
                                        tester.contactsRequest().search().receiveResponse();
                                    });

                                    it(
                                        'Прокручиваю список контактов до конца. Запрошена следующая страница списка ' +
                                        'контактов.',
                                    function() {
                                        tester.spinWrapper.scrollIntoView();
                                        tester.contactsRequest().search().secondPage().receiveResponse();

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
                            it(
                                'Прокручиваю список контактов до последней страницы. Прокручиваю список ' +
                                'контактов до конца. Запрос следующей страницы не был отправлен.',
                            function() {
                                tester.spinWrapper.scrollIntoView();
                                tester.contactsRequest().thirdPage().receiveResponse();

                                tester.spinWrapper.scrollIntoView();
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
                    it(
                        'Ввожу значение в поле поиска. Не удалось получить данные. Запрос не отправляется повторно.',
                    function() {
                        tester.input.fill('пас');
                        spendTime(500);

                        tester.contactsRequest().search().failed().receiveResponse();
                        tester.spinWrapper.scrollIntoView();

                        tester.spin.expectNotToExist();
                    });
                    it('Вызвано событие исходящего звонка. Совершается исходящий звонок.', function() {
                        tester.outgoingCallEvent().dispatch();

                        tester.firstConnection.connectWebRTC();
                        tester.allowMediaInput();

                        const outgoingCall = tester.outgoingCall().expectToBeSent()

                        tester.slavesNotification().
                            available().
                            userDataFetched().
                            twoChannels().
                            sending().
                            expectToBeSent();

                        outgoingCall.setRinging();

                        tester.slavesNotification().
                            available().
                            userDataFetched().
                            twoChannels().
                            progress().
                            expectToBeSent();

                        tester.firstConnection.callTrackHandler();

                        tester.numaRequest().receiveResponse();

                        tester.outCallSessionEvent().receive();
                        tester.outCallSessionEvent().slavesNotification().expectToBeSent();
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
                        contactsRequest.differentNames().receiveResponse();
                    });

                    describe('Нажимаю на имя.', function() {
                        beforeEach(function() {
                            tester.contactList.item('Бележкова Грета Ервиновна').click();
                            tester.contactRequest().receiveResponse();
                        });

                        it(
                            'Изменяю значение полей имени. Нажимаю на кнопку "Сохранить". Отправлен запрос ' +
                            'обновления контакта.',
                        function() {
                            tester.contactBar.section('ФИО').svg.click();

                            tester.input.withPlaceholder('Фамилия (Обязательное поле)').fill('Неделчева');
                            tester.input.withPlaceholder('Имя').fill('Роза');
                            tester.input.withPlaceholder('Отчество').fill('Ангеловна');

                            tester.button('Сохранить').click();
                            tester.contactUpdatingRequest().completeData().anotherName().receiveResponse();
                        });
                        it('Изменяю номер телефона. Отправлен запрос обновления контакта.', function() {
                            tester.contactBar.section('Номера').option('79162729533').putMouseOver();
                            tester.contactBar.section('Номера').option('79162729533').dropdownTrigger.click();
                            tester.select.option('Редактировать').click();

                            tester.contactBar.section('Номера').input.fill('79162729534').pressEnter();
                            tester.contactUpdatingRequest().completeData().anotherPhoneNumber().receiveResponse();
                        });
                        it(
                            'Добавляю поле для ввода номера телефона. Ввожу номер телефона. Отправлен запрос ' +
                            'обновления контакта.',
                        function() {
                            tester.contactBar.section('Номера').svg.click();
                            tester.contactBar.section('Номера').input.fill('79162729534').pressEnter();

                            tester.contactUpdatingRequest().completeData().twoPhoneNumbers().receiveResponse();
                        });
                        it('Нажимаю на другое имя. Запрошен другой контакт.', function() {
                            tester.contactList.item('Белоконска-Вражалска Калиса Еньовна').click();
                            tester.contactRequest().anotherContact().receiveResponse();
                        });
                        it('Имя выделено. Отображен контакт.', function() {
                            tester.contactList.item('Балканска Берислава Силаговна').expectNotToBeSelected();
                            tester.contactList.item('Бележкова Грета Ервиновна').expectToBeSelected();

                            tester.button('Создать контакт').expectNotToExist();

                            tester.body.expectTextContentToHaveSubstring(
                                'ФИО ' +
                                'Грета Бележкова ' +

                                'Номера ' +
                                '79162729533 ' +

                                'E-Mail ' +
                                'endlesssprinп.of@comagic.dev ' +

                                'Мессенджеры ' +
                                '+7 (928) 381 09-88 ' +
                                '+7 (928) 381 09-28'
                            );
                        });
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
                    contactsRequest.accessTokenExpired().receiveResponse();
                    tester.refreshRequest().receiveResponse();

                    tester.contactsRequest().anotherAuthorizationToken().receiveResponse();
                });
                it('Отображен спиннер.', function() {
                    tester.spin.expectToBeVisible();
                });
            });
            it('Поступил входящий звонок. Нажимаю на кнопку открытия контакта. Контакт открыт.', function() {
                tester.incomingCall().receive();

                tester.slavesNotification().
                    twoChannels().
                    available().
                    incoming().
                    progress().
                    userDataFetched().
                    expectToBeSent();

                tester.numaRequest().receiveResponse();

                tester.outCallEvent().knownContact().receive();
                tester.outCallEvent().knownContact().slavesNotification().expectToBeSent();

                tester.contactOpeningButton.click();

                tester.contactsRequest().differentNames().receiveResponse();
                tester.contactRequest().receiveResponse();

                tester.contactList.item('Балканска Берислава Силаговна').expectNotToBeSelected();
                tester.contactList.item('Бележкова Грета Ервиновна').expectToBeSelected();

                tester.body.expectTextContentToHaveSubstring(
                    'ФИО ' +
                    'Грета Бележкова ' +

                    'Номера ' +
                    '79162729533 ' +

                    'E-Mail ' +
                    'endlesssprinп.of@comagic.dev ' +

                    'Мессенджеры ' +
                    '+7 (928) 381 09-88 ' +
                    '+7 (928) 381 09-28'
                );
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
