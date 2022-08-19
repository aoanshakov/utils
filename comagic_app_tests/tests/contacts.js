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
                tester.permissionsRequest().receiveResponse();

                notificationTester.grantPermission();
            });

            describe('Звонки из софтфона доступны.', function() {
                beforeEach(function() {
                    settingsRequest.receiveResponse();
                    tester.slavesNotification().twoChannels().enabled().expectToBeSent();

                    tester.othersNotification().widgetStateUpdate().expectToBeSent();
                    tester.othersNotification().updateSettings().shouldNotPlayCallEndingSignal().expectToBeSent();

                    tester.connectEventsWebSocket();
                    tester.slavesNotification().twoChannels().enabled().softphoneServerConnected().expectToBeSent();

                    tester.connectSIPWebSocket();
                    tester.slavesNotification().twoChannels().webRTCServerConnected().softphoneServerConnected().
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
                                            contactsRequest = tester.contactsRequest().search().expectToBeSent();
                                        });

                                        describe('Получены контакты.', function() {
                                            beforeEach(function() {
                                                contactsRequest.receiveResponse();
                                            });

                                            it(
                                                'Прокручиваю список контактов до конца. Запрошена следующая страница ' +
                                                'списка контактов.',
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
                                        it('Получен только один контакт. Отображен только один контакт.', function() {
                                            contactsRequest.oneItem().receiveResponse();
                                            tester.contactList.expectToHaveTextContent('П Паскалева Бисера Илковна');
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

                            describe('Открываю меню номера.', function() {
                                beforeEach(function() {
                                    tester.contactBar.section('Номера').option('79162729533').putMouseOver();
                                    tester.contactBar.section('Номера').option('79162729533').dropdownTrigger.click();
                                });

                                it('Удаляю номер. Номер удален.', function() {
                                    tester.select.option('Удалить').click();
                                    tester.contactUpdatingRequest().completeData().noPhoneNumbers().receiveResponse();

                                    tester.contactBar.section('Номера').option('79162729533').expectNotToExist();
                                });
                                it('Изменяю номер телефона. Отправлен запрос обновления контакта.', function() {
                                    tester.select.option('Редактировать').click();

                                    tester.contactBar.section('Номера').input.fill('79162729534').pressEnter();
                                    tester.contactUpdatingRequest().completeData().anotherPhoneNumber().receiveResponse();
                                });
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
                            it(
                                'Добавляю поле для ввода номера телефона. Ввожу номер телефона. Отправлен запрос ' +
                                'обновления контакта.',
                            function() {
                                tester.contactBar.section('Номера').svg.click();
                                tester.contactBar.section('Номера').input.fill('79162729534').pressEnter();

                                tester.contactUpdatingRequest().completeData().twoPhoneNumbers().receiveResponse();
                            });
                            it('Добавляю поле для E-Mail. Ввожу E-Mail. Отправлен запрос обновления контакта.', function() {
                                tester.contactBar.section('E-Mail').svg.click();
                                tester.contactBar.section('E-Mail').input.fill('belezhkova@gmail.com').pressEnter();

                                tester.contactUpdatingRequest().completeData().twoEmails().receiveResponse();
                            });
                            it('Нажимаю на другое имя. Запрошен другой контакт.', function() {
                                tester.contactList.item('Белоконска-Вражалска Калиса Еньовна').click();
                                tester.contactRequest().anotherContact().receiveResponse();

                                tester.contactBar.expectTextContentToHaveSubstring(
                                    'ФИО ' +
                                    'Калиса Белоконска-Вражалска ' +

                                    'Номера ' +
                                    '79162729534 ' +

                                    'E-Mail ' +
                                    'belokonska-vrazhelska@gmail.com ' +

                                    'Мессенджеры ' +
                                    '+7 (928) 381 09-89 ' +
                                    '+7 (928) 381 09-29'
                                );
                            });
                            it('Нажимаю на номер телефона. Совершается звонок.', function() {
                                tester.contactBar.section('Номера').anchor('79162729533').click();

                                tester.firstConnection.connectWebRTC();
                                tester.allowMediaInput();

                                const outgoingCall = tester.outgoingCall().fifthPhoneNumber().expectToBeSent();

                                tester.slavesNotification().
                                    available().
                                    userDataFetched().
                                    twoChannels().
                                    sending().
                                    sixthPhoneNumber().
                                    expectToBeSent();

                                outgoingCall.setRinging();

                                tester.slavesNotification().
                                    available().
                                    userDataFetched().
                                    twoChannels().
                                    progress().
                                    sixthPhoneNumber().
                                    expectToBeSent();
                                
                                tester.firstConnection.callTrackHandler();
                                tester.numaRequest().fourthPhoneNumber().receiveResponse();

                                tester.softphone.expectTextContentToHaveSubstring('+7 (916) 272-95-33');
                            });
                            it('Имя выделено. Отображен контакт.', function() {
                                tester.contactList.item('Балканска Берислава Силаговна').expectNotToBeSelected();
                                tester.contactList.item('Бележкова Грета Ервиновна').expectToBeSelected();

                                tester.button('Создать контакт').expectNotToExist();

                                tester.contactBar.expectTextContentToHaveSubstring(
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
                describe('Поступил входящий звонок.', function() {
                    let outCallEvent;

                    beforeEach(function() {
                        tester.incomingCall().receive();

                        tester.slavesNotification().
                            twoChannels().
                            available().
                            incoming().
                            progress().
                            userDataFetched().
                            expectToBeSent();

                        tester.numaRequest().receiveResponse();

                        outCallEvent = tester.outCallEvent();
                    });

                    describe('Контакт не найден. Нажимаю на кнопку открытия контакта.', function() {
                        beforeEach(function() {
                            outCallEvent.noCrmContactLink().receive();
                            tester.outCallEvent().noCrmContactLink().slavesNotification().expectToBeSent();

                            tester.contactOpeningButton.click();
                            tester.contactsRequest().differentNames().receiveResponse();
                        });

                        describe('Открываю поля имени.', function() {
                            beforeEach(function() {
                                tester.contactBar.section('ФИО').svg.click();
                            });

                            describe(
                                'Заполняю поле фамилии. Нажимаю на кнопку "Создать контакт". Создан контакт.',
                            function() {
                                beforeEach(function() {
                                    tester.input.withPlaceholder('Фамилия (Обязательное поле)').fill('Неделчева');

                                    tester.button('Создать контакт').click();

                                    tester.contactCreatingRequest().
                                        anotherPhoneNumber().
                                        anotherContactId().
                                        receiveResponse();
                                });

                                it(
                                    'Заполняю остальные поля. Нажимаю на кнпоку "Сохранить". В списке изменено имя ' +
                                    'контакта.',
                                function() {
                                    tester.input.withPlaceholder('Имя').fill('Роза');
                                    tester.input.withPlaceholder('Отчество').fill('Ангеловна');

                                    tester.button('Сохранить').click();

                                    tester.contactUpdatingRequest().
                                        anotherName().
                                        anotherContactId().
                                        receiveResponse();

                                    tester.contactList.item('Неделчева Роза Ангеловна').expectToBeVisible();
                                });
                                it('В списке отображен новый контакт.', function() {
                                    tester.contactList.item('Неделчева').expectToBeSelected();
                                });
                            });
                            it('Поля имени пусты.', function() {
                                tester.input.withPlaceholder('Фамилия (Обязательное поле)').expectToHaveValue('');
                                tester.input.withPlaceholder('Имя').expectToHaveValue('');
                                tester.input.withPlaceholder('Отчество').expectToHaveValue('');
                            });
                        });
                        it('Открыта форма создания контакта.', function() {
                            tester.contactBar.expectTextContentToHaveSubstring(
                                'Номера ' +
                                '79161234567 '
                            );
                        });
                    });
                    it('Контакт найден. Нажимаю на кнопку открытия контакта. Контакт открыт.', function() {
                        outCallEvent.knownContact().receive();
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
            });
            it('Выбрано другое устройство для управления звонками.', function() {
                settingsRequest.callsAreManagedByAnotherDevice().receiveResponse();

                tester.slavesNotification().
                    twoChannels().
                    disabled().
                    expectToBeSent();

                tester.othersNotification().
                    widgetStateUpdate().
                    isNotUsingWidgetForCalls().
                    expectToBeSent();

                tester.othersNotification().
                    updateSettings().
                    shouldNotPlayCallEndingSignal().
                    expectToBeSent();

                tester.connectEventsWebSocket();

                tester.slavesNotification().
                    softphoneServerConnected().
                    twoChannels().
                    disabled().
                    expectToBeSent();

                tester.authenticatedUserRequest().receiveResponse();

                tester.slavesNotification().
                    userDataFetched().
                    softphoneServerConnected().
                    twoChannels().
                    disabled().
                    expectToBeSent();

                tester.button('Контакты').click();
                tester.contactsRequest().differentNames().receiveResponse();

                tester.contactList.item('Бележкова Грета Ервиновна').click();
                tester.contactRequest().receiveResponse();

                tester.contactBar.section('Номера').anchor('79162729533').click();
                tester.softphone.expectTextContentToHaveSubstring('Используется на другом устройстве');
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
