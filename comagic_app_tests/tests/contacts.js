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

                    xdescribe('Получены данные для списка контактов.', function() {
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
                                        tester.contactList.item('Тончева Десислава Пламеновна').scrollIntoView();
                                        tester.input.fill('паска');
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
                                                tester.contactList.item('Тончева Десислава Пламеновна').
                                                    scrollIntoView();

                                                tester.spinWrapper.scrollIntoView();
                                                tester.contactsRequest().search().secondPage().receiveResponse();

                                                tester.contactList.expectTextContentToHaveSubstringsConsideringOrder(
                                                    'Тончева Десислава Пламеновна',
                                                    'Паска лева Бисера Илковна #100',
                                                    'Паска лева Бисера Илковна #200'
                                                );
                                            });
                                            it('Отображен список контаков.', function() {
                                                tester.contactList.expectTextContentToHaveSubstringsConsideringOrder(
                                                    'Тончева Десислава Пламеновна',
                                                    'Паска лева Бисера Илковна #100'
                                                );

                                                tester.contactList.expectTextContentNotToHaveSubstring(
                                                    'Паска лева Бисера Илковна #200'
                                                );
                                            });
                                        });
                                        it('Получен только один контакт. Отображен только один контакт.', function() {
                                            contactsRequest.oneItem().receiveResponse();
                                            tester.contactList.expectToHaveTextContent('П Паска лева Бисера Илковна');
                                        });
                                    });
                                    it('Значение введено.', function() {
                                        tester.input.expectToHaveValue('паска');
                                    });
                                });
                                it(
                                    'Прокручиваю список контактов до последней страницы. Прокручиваю список ' +
                                    'контактов до конца. Запрос следующей страницы не был отправлен.',
                                function() {
                                    tester.spinWrapper.scrollIntoView();
                                    tester.contactsRequest().thirdPage().receiveResponse();

                                    tester.spinWrapper.scrollIntoView();

                                    tester.contactList.expectTextContentToHaveSubstringsConsideringOrder(
                                        'Тончева Десислава Пламеновна',
                                        'Паскалева Бисера Илковна #100',
                                        'Паскалева Бисера Илковна #200',
                                        'Паскалева Бисера Илковна #250'
                                    );
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
                            'Ввожу значение в поле поиска. Не удалось получить данные. Запрос не отправляется ' +
                            'повторно.',
                        function() {
                            tester.input.fill('паска');
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
                            let contactCommunicationsRequest;

                            beforeEach(function() {
                                tester.contactList.item('Бележкова Грета Ервиновна').click();

                                contactCommunicationsRequest = tester.contactCommunicationsRequest().expectToBeSent();
                                tester.contactRequest().receiveResponse();
                            });

                            describe('Сообщений немного.', function() {
                                beforeEach(function() {
                                    contactCommunicationsRequest.receiveResponse();
                                });
                                
                                xdescribe('Открываю меню номера.', function() {
                                    beforeEach(function() {
                                        tester.contactBar.section('Телефоны').option('79162729533').putMouseOver();

                                        tester.contactBar.section('Телефоны').option('79162729533').dropdownTrigger.
                                            click();
                                    });

                                    it('Удаляю номер. Номер удален.', function() {
                                        tester.select.option('Удалить').click();

                                        tester.contactUpdatingRequest().completeData().noPhoneNumbers().
                                            receiveResponse();

                                        tester.contactBar.section('Телефоны').option('79162729533').expectNotToExist();
                                    });
                                    it('Изменяю номер телефона. Отправлен запрос обновления контакта.', function() {
                                        tester.select.option('Редактировать').click();

                                        tester.contactBar.section('Телефоны').input.fill('79162729534').pressEnter();

                                        tester.contactUpdatingRequest().completeData().anotherPhoneNumber().
                                            receiveResponse();
                                    });
                                });
                                xit(
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
                                xit(
                                    'Добавляю поле для ввода номера телефона. Ввожу номер телефона. Отправлен запрос ' +
                                    'обновления контакта.',
                                function() {
                                    tester.contactBar.section('Телефоны').svg.click();
                                    tester.contactBar.section('Телефоны').input.fill('79162729534').pressEnter();

                                    tester.contactUpdatingRequest().completeData().twoPhoneNumbers().receiveResponse();
                                });
                                xit(
                                    'Добавляю поле для E-Mail. Ввожу E-Mail. Отправлен запрос обновления контакта.',
                                function() {
                                    tester.contactBar.section('E-Mail').svg.click();
                                    tester.contactBar.section('E-Mail').input.fill('belezhkova@gmail.com').pressEnter();

                                    tester.contactUpdatingRequest().completeData().twoEmails().receiveResponse();
                                });
                                xit('Нажимаю на другое имя. Запрошен другой контакт.', function() {
                                    tester.contactList.item('Белоконска-Вражалска Калиса Еньовна').click();

                                    tester.contactCommunicationsRequest().anotherContact().receiveResponse();
                                    tester.contactRequest().anotherContact().receiveResponse();

                                    tester.contactBar.expectTextContentToHaveSubstring(
                                        'ФИО ' +
                                        'Белоконска-Вражалска Калиса Еньовна ' +

                                        'Телефоны ' +
                                        '79162729534 ' +

                                        'E-Mail ' +
                                        'belokonska-vrazhelska@gmail.com ' +

                                        'Мессенджеры ' +
                                        '+7 (928) 381 09-89 ' +
                                        '+7 (928) 381 09-29'
                                    );
                                });
                                xit('Нажимаю на номер телефона. Совершается звонок.', function() {
                                    tester.contactBar.section('Телефоны').anchor('79162729533').click();

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
                                describe('Нажимаю на кнопку проигрывания записи звонка.', function() {
                                    beforeEach(function() {
                                        tester.chatHistory.message.atTime('12:14').playIcon.click();

                                        tester.talkRecordRequest().receiveResponse();
                                        audioDecodingTester.accomplishAudioDecoding();
                                    });

                                    it(
                                        'Обновлена длительность и время. Запись проигрывается. Отображено ' +
                                        'обновленное время и длительность.',
                                    function() {
                                        tester.chatHistory.message.atTime('12:14').audio.
                                            duration(674).
                                            time(337).
                                            play();

                                        tester.chatHistory.message.atTime('12:14').expectToHaveTextContent(
                                            'Запись звонка ' +
                                            '05:37 / 11:14 12:14'
                                        );
                                    });
                                    return;
                                    it('Отображена длительность.', function() {
                                        tester.chatHistory.message.atTime('12:14').expectToHaveTextContent(
                                            'Запись звонка ' +
                                            '53:40 12:14'
                                        );
                                    });
                                });
                                return;
                                it('Нажимаю на превью вложения. Вложение скачивается.', function() {
                                    tester.chatHistory.message.atTime('12:15').preview.click();
                                    tester.resourcePayloadRequest().expectToBeSent();
                                });
                                it('Имя выделено. Отображен контакт. Отображена история коммуникаций.', function() {
                                    tester.contactList.item('Балканска Берислава Силаговна').expectNotToBeSelected();
                                    tester.contactList.item('Бележкова Грета Ервиновна').expectToBeSelected();

                                    tester.chatHistory.expectToHaveTextContent(
                                        '10 февраля 2020 ' +

                                        'Здравствуйте 12:12 ' +
                                        'Привет 12:13 ' +

                                        '00:00 12:14 ' +

                                        'png 925 B heart.png 12:15'
                                    );

                                    tester.contactBar.expectTextContentToHaveSubstring(
                                        'ФИО ' +
                                        'Бележкова Грета Ервиновна ' +

                                        'Телефоны ' +
                                        '79162729533 ' +

                                        'E-Mail ' +
                                        'endlesssprinп.of@comagic.dev ' +

                                        'Мессенджеры ' +
                                        '+7 (928) 381 09-88 ' +
                                        '+7 (928) 381 09-28'
                                    );

                                    tester.button('Создать контакт').expectNotToExist();
                                });
                            });
                            return;
                            describe('Сообщений много.', function() {
                                beforeEach(function() {
                                    contactCommunicationsRequest.firstPage().receiveResponse();
                                });

                                describe('Прокручиваю наверх.', function() {
                                    beforeEach(function() {
                                        tester.chatHistory.spinWrapper.scrollIntoView();
                                        tester.contactCommunicationsRequest().secondPage().receiveResponse();
                                    });
                                    
                                    it(
                                        'Выбираю другой контакт. Его история коммуникаций пуста. События не ' +
                                        'отображены.',
                                    function() {
                                        tester.contactList.item('Белоконска-Вражалска Калиса Еньовна').click();

                                        tester.contactCommunicationsRequest().anotherContact().receiveResponse();
                                        tester.contactRequest().anotherContact().receiveResponse();

                                        tester.chatHistory.expectToHaveTextContent(
                                            '10 февраля 2020 ' +

                                            'Здравствуйте 12:12 ' +
                                            'Привет 12:13 ' +

                                            '00:00 12:14 ' +

                                            'png 925 B heart.png 12:15'
                                        );
                                    });
                                    it('Получена следующая страница.', function() {
                                        tester.chatHistory.expectTextContentToHaveSubstringsConsideringOrder(
                                            '30 октября 2019 ' +

                                            'Пинг # 1 00:44 ' +
                                                'Понг # 1 06:49 ',

                                            '18 декабря 2019 ' +

                                            'Пинг # 98 05:33 ' +
                                                'Понг # 98 11:39 ' +
                                            'Пинг # 99 17:44 ' +
                                                'Понг # 99 23:49 ' +

                                            '19 декабря 2019 ' +

                                            'Пинг # 100 05:54 ' +
                                                'Понг # 100 12:00'
                                        );
                                    });
                                });
                                it('Следующая страница не была запрошена.', function() {
                                    tester.chatHistory.expectTextContentToHaveSubstring(
                                        '18 декабря 2019 ' +

                                        'Пинг # 98 05:33 ' +
                                            'Понг # 98 11:39 ' +
                                        'Пинг # 99 17:44 ' +
                                            'Понг # 99 23:49 ' +

                                        '19 декабря 2019 ' +

                                        'Пинг # 100 05:54 ' +
                                            'Понг # 100 12:00'
                                    );
                                });
                            });
                            it('URL записи звонка не был получен. Отображено сообщение о входящем звонке.', function() {
                                contactCommunicationsRequest.noTalkRecordFileLink().receiveResponse();

                                tester.chatHistory.expectToHaveTextContent(
                                    '10 февраля 2020 ' +

                                    'Здравствуйте 12:12 ' +
                                    'Привет 12:13 ' +

                                    'Входящий звонок 12:14 ' +

                                    'png 925 B heart.png 12:15'
                                );
                            });
                        });
                        return;
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
                    return;
                    it('Токен авторизации истек. Токен обновлен. Отправлен повторный запрос контактов.', function() {
                        contactsRequest.accessTokenExpired().receiveResponse();
                        tester.refreshRequest().receiveResponse();

                        tester.contactsRequest().anotherAuthorizationToken().receiveResponse();
                    });
                    it('Не удалось получить данные. Запрос не отправлен повторно.', function() {
                        contactsRequest.failed().receiveResponse();
                    });
                    it('Отображен спиннер.', function() {
                        tester.spin.expectToBeVisible();
                    });
                });
                return;
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
                                    tester.contactBar.section('ФИО').svg.click();

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
                                'Телефоны ' +
                                '79161234567 '
                            );
                        });
                    });
                    it('Контакт найден. Нажимаю на кнопку открытия контакта. Контакт открыт.', function() {
                        outCallEvent.knownContact().receive();
                        tester.outCallEvent().knownContact().slavesNotification().expectToBeSent();

                        tester.contactOpeningButton.click();

                        tester.contactsRequest().differentNames().receiveResponse();
                        tester.contactCommunicationsRequest().receiveResponse();
                        tester.contactRequest().receiveResponse();

                        tester.contactList.item('Балканска Берислава Силаговна').expectNotToBeSelected();
                        tester.contactList.item('Бележкова Грета Ервиновна').expectToBeSelected();

                        tester.body.expectTextContentToHaveSubstring(
                            'ФИО ' +
                            'Бележкова Грета Ервиновна ' +

                            'Телефоны ' +
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
            return;
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

                tester.contactCommunicationsRequest().receiveResponse();
                tester.contactRequest().receiveResponse();

                tester.contactBar.section('Телефоны').anchor('79162729533').click();
                tester.softphone.expectTextContentToHaveSubstring('Используется на другом устройстве');
            });
        });
        return;
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
