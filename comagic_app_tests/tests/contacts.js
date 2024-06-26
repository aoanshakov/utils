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
            employeeStatusesRequest;

        beforeEach(function() {
            setNow('2019-12-19T12:10:06');

            tester = new Tester(options);

            tester.input.withFieldLabel('Логин').fill('botusharova');
            tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

            tester.button('Войти').click();

            tester.loginRequest().receiveResponse();
            accountRequest = tester.accountRequest().expectToBeSent();
        });

        describe('Раздел контактов доступен.', function() {
            let employeeStatusesRequest;

            beforeEach(function() {
                accountRequest.receiveResponse();

                const requests = ajax.inAnyOrder();

                employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(requests);
                reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
                const ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(requests),
                    reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                    reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                    employeeRequest = tester.employeeRequest().expectToBeSent(requests),
                    employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(requests),
                    authCheckRequest = tester.authCheckRequest().expectToBeSent(requests);

                requests.expectToBeSent();

                ticketsContactsRequest.receiveResponse();
                reportsListRequest.receiveResponse();
                reportTypesRequest.receiveResponse();
                reportGroupsRequest.receiveResponse();
                authCheckRequest.receiveResponse();
                employeeRequest.receiveResponse();
                employeeSettingsRequest.receiveResponse();

                tester.masterInfoMessage().receive();
                tester.slavesNotification().additional().expectToBeSent();
                tester.slavesNotification().expectToBeSent();

                tester.employeesWebSocket.connect();
                tester.employeesInitMessage().expectToBeSent();

                tester.notificationChannel().tellIsLeader().expectToBeSent();
                tester.masterInfoMessage().tellIsLeader().expectToBeSent();
                tester.notificationChannel().applyLeader().expectToBeSent();
                tester.notificationChannel().applyLeader().expectToBeSent();

                tester.talkOptionsRequest().receiveResponse();
                tester.permissionsRequest().receiveResponse();
                settingsRequest = tester.settingsRequest().expectToBeSent();

                notificationTester.grantPermission();
            });

            describe('Статусы получены.', function() {
                beforeEach(function() {
                    employeeStatusesRequest.receiveResponse();
                });

                describe('Звонки из софтфона доступны.', function() {
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

                    describe('Открываю раздел контактов.', function() {
                        beforeEach(function() {
                            tester.button('Контакты').click();

                            contactsRequest = tester.contactsRequest().expectToBeSent();
                            tester.contactGroupsRequest().receiveResponse();
                        });

                        xdescribe('Получены разные имена.', function() {
                            beforeEach(function() {
                                contactsRequest.differentNames().receiveResponse();
                            });

                            describe('Нажимаю на имя.', function() {
                                let contactCommunicationsRequest,
                                    contactRequest;

                                beforeEach(function() {
                                    tester.contactList.item('Бележкова Грета Ервиновна').click();

                                    const requests = ajax.inAnyOrder();

                                    contactCommunicationsRequest = tester.
                                        contactCommunicationsRequest().
                                        expectToBeSent(requests);

                                    contactRequest = tester.contactRequest().expectToBeSent(requests);
                                    const usersRequest = tester.usersRequest().forContacts().expectToBeSent(requests);

                                    requests.expectToBeSent();
                                    usersRequest.receiveResponse();
                                });

                                describe('Для контакта установлен персональный менеджер.', function() {
                                    beforeEach(function() {
                                        contactRequest.receiveResponse();

                                        tester.groupsContainingContactRequest().receiveResponse();
                                        tester.contactGroupsRequest().receiveResponse();
                                    });

                                    describe('Сообщений немного.', function() {
                                        beforeEach(function() {
                                            contactCommunicationsRequest.receiveResponse();
                                        });
                                        
                                        describe('Нажимаю на кнопку редактирования менеджера.', function() {
                                            beforeEach(function() {
                                                tester.contactBar.
                                                    section('Персональный менеджер').
                                                    option('Господинова Николина').
                                                    putMouseOver();

                                                tester.contactBar.
                                                    section('Персональный менеджер').
                                                    option('Господинова Николина').
                                                    toolsIcon.
                                                    click();
                                            });

                                            describe('Раскрываю список менеджеров.', function() {
                                                beforeEach(function() {
                                                    tester.select.click();
                                                });
                                                
                                                describe(
                                                    'Выбираю опцию "Не выбрано". Нажимаю на кнопку "Сохранить".',
                                                function() {
                                                    beforeEach(function() {
                                                        tester.select.option('Не выбрано').click();
                                                        tester.button('Сохранить').click();

                                                        tester.contactUpdatingRequest().
                                                            completeData().
                                                            noPersonalManager().
                                                            receiveResponse();

                                                        tester.groupsContainingContactRequest().receiveResponse();

                                                        tester.contactRequest().
                                                            noPersonalManager().
                                                            receiveResponse();
                                                    });

                                                    it(
                                                        'Выбираю персонального менеджера. Нажимаю на кнопку ' +
                                                        '"Сохранить". Выбираю опцию "Не выбрано". Нажимаю на кнопку ' +
                                                        '"Сохранить". Контакт сохранен.',
                                                    function() {
                                                        tester.contactBar.
                                                            section('Персональный менеджер').
                                                            header.
                                                            svg.
                                                            click();
                                                        
                                                        tester.contactBar.
                                                            section('Персональный менеджер').
                                                            select.
                                                            click();

                                                        tester.select.option('Шалева Дора').click();
                                                        tester.button('Сохранить').click();

                                                        tester.contactUpdatingRequest().
                                                            completeData().
                                                            anotherPersonalManager().
                                                            receiveResponse();

                                                        tester.groupsContainingContactRequest().receiveResponse();

                                                        tester.contactRequest().
                                                            anotherPersonalManager().
                                                            receiveResponse();

                                                        tester.contactBar.
                                                            section('Персональный менеджер').
                                                            option('Шалева Дора').
                                                            putMouseOver();

                                                        tester.contactBar.
                                                            section('Персональный менеджер').
                                                            option('Шалева Дора').
                                                            toolsIcon.
                                                            click();

                                                        tester.select.click();
                                                        tester.select.option('Не выбрано').click();

                                                        tester.button('Сохранить').click();

                                                        tester.contactUpdatingRequest().
                                                            completeData().
                                                            noPersonalManager().
                                                            receiveResponse();

                                                        tester.groupsContainingContactRequest().receiveResponse();

                                                        tester.contactRequest().
                                                            noPersonalManager().
                                                            receiveResponse();

                                                        tester.contactBar.section('Персональный менеджер').content.
                                                            expectToHaveTextContent('');
                                                    });
                                                    it('Контакт сохранен.', function() {
                                                        tester.contactBar.section('Персональный менеджер').content.
                                                            expectToHaveTextContent('');
                                                    });
                                                });
                                                describe('Выбираю другого менеджера.', function() {
                                                    beforeEach(function() {
                                                        tester.select.option('Шалева Дора').click();
                                                    });

                                                    it(
                                                        'Нажимаю на кнопку "Сохранить". Отправлен запрос обновления ' +
                                                        'контакта.',
                                                    function() {
                                                        tester.button('Сохранить').click();

                                                        tester.contactUpdatingRequest().
                                                            completeData().
                                                            anotherPersonalManager().
                                                            receiveResponse();

                                                        tester.groupsContainingContactRequest().receiveResponse();

                                                        tester.contactRequest().
                                                            anotherPersonalManager().
                                                            receiveResponse();

                                                        tester.select.expectNotToExist();

                                                        tester.contactBar.section('Персональный менеджер').content.
                                                            expectToHaveTextContent('Шалева Дора');
                                                    });
                                                    it(
                                                        'Нажимаю на кнопку "Отменить". В выпадающем списке выбран ' +
                                                        'прежний менеджер.',
                                                    function() {
                                                        tester.button('Отменить').click();

                                                        tester.select.expectNotToExist();

                                                        tester.contactBar.section('Персональный менеджер').content.
                                                            expectToHaveTextContent('Господинова Николина');
                                                    });
                                                    it('Выбран другой менеджер.', function() {
                                                        tester.select.expectToHaveTextContent('Шалева Дора');
                                                    });
                                                });
                                                it(
                                                    'Ввожу строку в поле поиска. Отображен отфильтрованый список ' +
                                                    'менеджеров.',
                                                function() {
                                                    tester.select.popup.input.fill('шал');
                                                    tester.select.popup.expectToHaveTextContent('Шалева Дора');
                                                });
                                                it('Отображен список менеджеров.', function() {
                                                    tester.select.popup.expectToHaveTextContent(
                                                        'Не выбрано ' +
                                                        'Ганева Стефка ' +
                                                        'Шалева Дора ' +
                                                        'Господинова Николина ' +
                                                        'Божилова Йовка'
                                                    );
                                                });
                                            });
                                            it('Отображено имя выбранного ранее менеджера.', function() {
                                                tester.select.expectToHaveTextContent('Господинова Николина');
                                            });
                                        });
                                        describe('Нажимаю на кнопку проигрывания записи звонка.', function() {
                                            let talkRecordRequest;

                                            beforeEach(function() {
                                                tester.chatHistory.message.atTime('12:14').playIcon.click();
                                                talkRecordRequest = tester.talkRecordRequest().expectToBeSent();
                                            });

                                            describe('Запись скачена.', function() {
                                                beforeEach(function() {
                                                    talkRecordRequest.receiveResponse();
                                                    audioDecodingTester.accomplishAudioDecoding();
                                                });

                                                it(
                                                    'Обновлена длительность и время. Запись проигрывается. ' +
                                                    'Отображено обновленное время и длительность.',
                                                function() {
                                                    tester.chatHistory.message.atTime('12:14').audio.
                                                        duration(674).
                                                        time(337).
                                                        play();

                                                    tester.chatHistory.message.atTime('12:14').expectToHaveTextContent(
                                                        '12:14 Входящий звонок с номера 79161234567 оператору ' +
                                                        'Карадимова Веска Анастасовна ' +

                                                        'Запись звонка ' +
                                                        '05:37 / 11:14 12:14'
                                                    );
                                                });
                                                it('Спиннер скрыт.', function() {
                                                    tester.chatHistory.message.atTime('12:14').spin.expectNotToExist();
                                                });
                                            });
                                            it('Отображена длительность. Спиннер видим.', function() {
                                                tester.chatHistory.message.atTime('12:14').spin.expectToBeVisible();

                                                tester.chatHistory.message.atTime('12:14').expectToHaveTextContent(
                                                    '12:14 Входящий звонок с номера 79161234567 оператору ' +
                                                    'Карадимова Веска Анастасовна ' +

                                                    'Запись звонка ' +
                                                    '53:40 12:14'
                                                );
                                            });
                                        });
                                        describe('Открываю меню номера.', function() {
                                            beforeEach(function() {
                                                tester.contactBar.
                                                    section('Телефоны').
                                                    option('79162729533').
                                                    putMouseOver();

                                                tester.contactBar.
                                                    section('Телефоны').
                                                    option('79162729533').
                                                    toolsIcon.
                                                    click();
                                            });

                                            describe('Изменяю номер телефона.', function() {
                                                beforeEach(function() {
                                                    tester.select.option('Редактировать').click();

                                                    tester.contactBar.
                                                        section('Телефоны').
                                                        input.
                                                        fill('79162729534');

                                                    tester.contactBar.
                                                        section('Телефоны').
                                                        button('Сохранить').
                                                        click();

                                                    contactsRequest = tester.contactsRequest().phoneSearching().
                                                        expectToBeSent();
                                                });

                                                describe('Получен другой контакт с таким же номером.', function() {
                                                    beforeEach(function() {
                                                        contactsRequest.oneItem().receiveResponse();
                                                    });

                                                    it(
                                                        'Нажимаю на кнопку "Отменить". Отображено предыдущее значение.',
                                                    function() {
                                                        tester.button('Отменить').click();

                                                        tester.contactBar.
                                                            section('Телефоны').
                                                            content.
                                                            expectToHaveTextContent('79162729533');
                                                    });
                                                    it(
                                                        'Открываю список для выбора основного контакта. Отображен ' +
                                                        'список контактов.',
                                                    function() {
                                                        tester.contactBar.
                                                            section('Телефоны').
                                                            select.
                                                            first.
                                                            click();

                                                        tester.select.popup.expectToHaveTextContent(
                                                            'Бележкова Грета Ервиновна (текущий) ' +
                                                            '79162729534 ' +

                                                            'Паскалева Бисера Илковна ' +
                                                            '79162729533 ' +
                                                            '79162722748'
                                                        );
                                                    });
                                                    it('Отображено сообщение об ошибке.', function() {
                                                        tester.contactBar.
                                                            section('Телефоны').
                                                            expectTextContentToHaveSubstring(
                                                                'Данный номер телефона уже используется'
                                                            );
                                                    });
                                                });
                                                it(
                                                    'Получен текущий контакт с таким же номером. Отправлен запрос ' +
                                                    'обновления контакта.',
                                                function() {
                                                    contactsRequest.onlySecondItem().receiveResponse();

                                                    tester.contactUpdatingRequest().
                                                        completeData().
                                                        anotherPhoneNumber().
                                                        thirdNewChannel().
                                                        receiveResponse();

                                                    tester.groupsContainingContactRequest().receiveResponse();

                                                    tester.contactRequest().
                                                        anotherPhoneNumber().
                                                        receiveResponse();
                                                });
                                                it(
                                                    'Дубликаты не найдены. Отправлен запрос обновления контакта.',
                                                function() {
                                                    contactsRequest.noData().receiveResponse();

                                                    tester.contactUpdatingRequest().
                                                        completeData().
                                                        anotherPhoneNumber().
                                                        thirdNewChannel().
                                                        receiveResponse();

                                                    tester.groupsContainingContactRequest().receiveResponse();

                                                    tester.contactRequest().
                                                        anotherPhoneNumber().
                                                        receiveResponse();
                                                });
                                            });
                                            describe('Удаляю номер.', function() {
                                                beforeEach(function() {
                                                    tester.select.option('Удалить').click();

                                                    spendTime(0);
                                                    spendTime(0);
                                                    tester.modalWindow.endTransition('transform');
                                                });

                                                describe(
                                                    'Нажимаю на кнопку "Удалить" в окне подтверждения.',
                                                function() {
                                                    beforeEach(function() {
                                                        tester.modalWindow.button('Удалить').click();

                                                        tester.contactUpdatingRequest().
                                                            completeData().
                                                            noPhoneNumbers().
                                                            receiveResponse();

                                                        tester.groupsContainingContactRequest().receiveResponse();

                                                        tester.contactRequest().
                                                            noPhoneNumbers().
                                                            receiveResponse();
                                                    });

                                                    it('Нажимаю на кнопку добавления номера телефона.', function() {
                                                        tester.contactBar.
                                                            section('Телефоны').
                                                            plusButton.
                                                            click();

                                                        tester.modalWindow.expectNotToExist();

                                                        tester.contactBar.
                                                            section('Телефоны').
                                                            input.
                                                            expectToBeVisible();
                                                    });
                                                    it('Номер удален.', function() {
                                                        tester.contactBar.
                                                            section('Телефоны').
                                                            option('79162729533').
                                                            expectNotToExist();
                                                    });
                                                });
                                                it('Отображено окно подтверждения.', function() {
                                                    tester.modalWindow.expectToHaveTextContent(
                                                        'Удалить номер телефона ' +
                                                        'Вы уверены, что хотите удалить номер телефона 79162729533? ' +
                                                        'Удалить Отменить'
                                                    );
                                                });
                                            });
                                            it('Пунт "Редактировать" доступен.', function() {
                                                tester.select.option('Редактировать').expectToBeEnabled();
                                            });
                                        });
                                        describe('Нажимаю на другое имя. Запрошен другой контакт.', function() {
                                            beforeEach(function() {
                                                tester.contactList.item('Белоконска-Вражалска Калиса Еньовна').click();

                                                tester.contactCommunicationsRequest().
                                                    anotherContact().
                                                    receiveResponse();

                                                tester.contactRequest().anotherContact().receiveResponse();

                                                tester.groupsContainingContactRequest().
                                                    fifthContact().
                                                    receiveResponse();
                                            });

                                            it(
                                                'Выбираю другого менеджера. Нажимаю на кнопку "Отменить". В списке ' +
                                                'выбрано прежнее значение.',
                                            function() {
                                                tester.contactBar.
                                                    section('Персональный менеджер').
                                                    option('Божилова Йовка').
                                                    putMouseOver();

                                                tester.contactBar.
                                                    section('Персональный менеджер').
                                                    option('Божилова Йовка').
                                                    toolsIcon.
                                                    click();

                                                tester.select.click();
                                                tester.select.option('Шалева Дора').click();

                                                tester.button('Отменить').click();

                                                tester.contactBar.
                                                    section('Персональный менеджер').
                                                    content.
                                                    expectToHaveTextContent('Божилова Йовка');
                                            });
                                            it(
                                                'Открываю поле редактирования. Нажимаю на кнопку "Отменить". ' +
                                                'Возвращено оригинальное Значение поля.',
                                            function() {
                                                tester.contactBar.
                                                    section('Телефоны').
                                                    option('79162729534').
                                                    putMouseOver();

                                                tester.contactBar.
                                                    section('Телефоны').
                                                    option('79162729534').
                                                    toolsIcon.
                                                    click();

                                                tester.select.option('Редактировать').click();

                                                tester.contactBar.
                                                    section('Телефоны').
                                                    input.
                                                    fill('79162729535');

                                                tester.contactBar.
                                                    section('Телефоны').
                                                    button('Отменить').
                                                    click();

                                                tester.contactBar.
                                                    section('Телефоны').
                                                    content.
                                                    expectToHaveTextContent('79162729534');
                                            });
                                            it('Отображены данные другого контакта.', function() {
                                                tester.contactBar.expectTextContentToHaveSubstring(
                                                    'ФИО ' +
                                                    'Белоконска-Вражалска Калиса Еньовна ' +

                                                    'Телефоны ' +
                                                    '79162729534 ' +

                                                    'E-Mail ' +
                                                    'belokonska-vrazhelska@gmail.com ' +

                                                    'Каналы связи ' +
                                                    '+7 (928) 381 09-89 ' +
                                                    '+7 (928) 381 09-29'
                                                );
                                            });
                                        });
                                        describe('Добавляю поле для E-Mail.', function() {
                                            beforeEach(function() {
                                                tester.contactBar.section('E-Mail').svg.click();
                                            });

                                            describe('Ввожу E-Mail. Нажимаю на кнопку "Сохранить".', function() {
                                                let contactsRequest;

                                                beforeEach(function() {
                                                    tester.contactBar.
                                                        section('E-Mail').
                                                        input.
                                                        fill('belezhkova@gmail.com');

                                                    tester.contactBar.section('E-Mail').button('Сохранить').click();

                                                    contactsRequest = tester.contactsRequest().
                                                        emailSearching().
                                                        expectToBeSent();
                                                });

                                                it('Найден дубль. Отображено сообщение об ошибке.', function() {
                                                    contactsRequest.
                                                        oneItem().
                                                        receiveResponse();

                                                    tester.contactBar.
                                                        section('E-Mail').
                                                        expectTextContentToHaveSubstring(
                                                            'Данная почта уже используется'
                                                        );

                                                    tester.contactBar.
                                                        section('E-Mail').
                                                        select.
                                                        first.
                                                        click();

                                                    tester.select.popup.expectToHaveTextContent(
                                                        'Бележкова Грета Ервиновна (текущий) ' +

                                                        'endlesssprinп.of@comagic.dev ' +
                                                        'belezhkova@gmail.com ' +

                                                        'Паскалева Бисера Илковна ' +

                                                        'paskaleva@gmail.com ' +
                                                        'belezhkova@gmail.com (дубликат)'
                                                    );
                                                });
                                                it(
                                                    'Дубли не найдены. Отправлен запрос обновления контакта.',
                                                function() {
                                                    contactsRequest.
                                                        noData().
                                                        receiveResponse();

                                                    tester.contactUpdatingRequest().
                                                        completeData().
                                                        twoEmails().
                                                        receiveResponse();

                                                    tester.groupsContainingContactRequest().receiveResponse();

                                                    tester.contactRequest().
                                                        addEmail().
                                                        receiveResponse();
                                                });
                                            });
                                            it(
                                                'Нажимаю на кнопку "Сохранить". Пустая строка в качестве E-Mail не ' +
                                                'сохранилась.',
                                            function() {
                                                tester.contactBar.
                                                    section('E-Mail').
                                                    button('Сохранить').
                                                    click();

                                                tester.contactUpdatingRequest().
                                                    completeData().
                                                    receiveResponse();

                                                tester.groupsContainingContactRequest().receiveResponse();
                                                tester.contactRequest().receiveResponse();
                                            });
                                            it(
                                                'Ввожу слишком длинный E-Mail. Отображено сообщение об ошибке.',
                                            function() {
                                                tester.contactBar.
                                                    section('E-Mail').
                                                    input.
                                                    fill('ydwjbrehzzxvixizydtuvxrpxwxuuymztqgndrfinjdncket@gmail.com');

                                                tester.contactBar.
                                                    section('E-Mail').
                                                    button('Сохранить').
                                                    click();

                                                tester.contactBar.
                                                    section('E-Mail').
                                                    expectTextContentToHaveSubstring(
                                                        'Количество символов, введенных в поле не должно превышать 48'
                                                    );
                                            });
                                            it(
                                                'Ввожу некорректный E-Mail. Отображено сообщение об ошибке.',
                                            function() {
                                                tester.contactBar.
                                                    section('E-Mail').
                                                    input.
                                                    fill('belezhkova gmail.com');

                                                tester.contactBar.
                                                    section('E-Mail').
                                                    button('Сохранить').
                                                    click();

                                                tester.contactBar.
                                                    section('E-Mail').
                                                    expectTextContentToHaveSubstring('Некорректный E-Mail');
                                            });
                                        });
                                        describe(
                                            'Нажимаю на иконку с плюсом справа от надписи "Каналы связи".',
                                        function() {
                                            beforeEach(function() {
                                                tester.contactBar.
                                                    section('Каналы связи').
                                                    plusButton.
                                                    click();
                                            });

                                            it(
                                                'Ввожу значение в поле. Нажимаю на кнопку "Сохранить". Отправлен ' +
                                                'запрос обновления контакта.',
                                            function() {
                                                tester.contactBar.
                                                    section('Каналы связи').
                                                    input.
                                                    fill('79283810987')

                                                tester.button('Сохранить').click();

                                                tester.contactUpdatingRequest().
                                                    completeData().
                                                    newChannel().
                                                    receiveResponse();

                                                tester.contactBar.
                                                    section('Каналы связи').
                                                    option('79283810988').
                                                    messengerIcon.
                                                    expectToHaveClass('cm-contacts-messenger-icon-whatsapp')
                                            });
                                            it(
                                                'Рядом с полем для ввода номера телефона отображена иконка WhatsApp.',
                                            function() {
                                                tester.contactBar.
                                                    section('Каналы связи').
                                                    option.
                                                    atIndex(0).
                                                    input.
                                                    expectToBeVisible();

                                                tester.contactBar.
                                                    section('Каналы связи').
                                                    option.
                                                    atIndex(0).
                                                    messengerIcon.
                                                    expectToHaveClass('cm-contacts-messenger-icon-whatsapp');
                                            });
                                        });
                                        describe('Нажимаю на кнпоку удаления контакта.', function() {
                                            beforeEach(function() {
                                                tester.contactBar.title.deleteButton.click();
                                            });

                                            describe(
                                                'Нажимаю на кнопку "Удалить". Отправлен запрос удаления контакта.',
                                            function() {
                                                let contactDeletingRequest;

                                                beforeEach(function() {
                                                    tester.modalWindow.button('Удалить').click();

                                                    contactDeletingRequest = tester.contactDeletingRequest().
                                                        expectToBeSent();
                                                });

                                                it(
                                                    'Не удалось удалить контакт. Отображено сообщение об ошибке.',
                                                function() {
                                                    contactDeletingRequest.failed().receiveResponse();

                                                    tester.notificationWindow.expectToHaveTextContent(
                                                        'Не удалось удалить контакт'
                                                    );
                                                });
                                                it(
                                                    'Удалось удалить контакт. Контакт больше не отображается.',
                                                function() {
                                                    contactDeletingRequest.receiveResponse();

                                                    tester.modalWindow.expectNotToExist();
                                                    tester.contactBar.expectNotToExist();

                                                    tester.contactList.
                                                        item('Бележкова Грета Ервиновна').
                                                        expectNotToExist();

                                                    tester.notificationWindow.expectToHaveTextContent('Контакт удален');
                                                });
                                                it('Отображен спиннер.', function() {
                                                    tester.spin.expectToBeVisible();
                                                });
                                            });
                                            it('Нажимаю на кнопку "Отменить". Модальное окно скрыто.', function() {
                                                tester.modalWindow.button('Отменить').click();
                                                tester.modalWindow.expectNotToExist();
                                            });
                                            it('Отображено модальное окно.', function() {
                                                tester.modalWindow.expectTextContentToHaveSubstring(
                                                    'Вы собираетесь удалить контакт Бележкова Грета Ервиновна'
                                                );
                                            });
                                        });
                                        describe('Перехожу в другой раздел. Перехожу обратно в контакты.', function() {
                                            beforeEach(function() {
                                                tester.button('Статистика').click();
                                                tester.statsRequest().receiveResponse();

                                                tester.button('Контакты').click();

                                                tester.contactsRequest().differentNames().receiveResponse();
                                                tester.contactGroupsRequest().receiveResponse();
                                            });

                                            it('Выбираю тот же контакт. Данные запрошены заново.', function() {
                                                tester.contactList.item('Бележкова Грета Ервиновна').click();

                                                const requests = ajax.inAnyOrder();

                                                const contactCommunicationsRequest = tester.
                                                    contactCommunicationsRequest().
                                                    expectToBeSent(requests);

                                                const contactRequest = tester.contactRequest().
                                                    expectToBeSent(requests);

                                                const usersRequest = tester.usersRequest().forContacts().
                                                    expectToBeSent(requests);

                                                requests.expectToBeSent();

                                                contactCommunicationsRequest.receiveResponse();
                                                usersRequest.receiveResponse();
                                                contactRequest.receiveResponse();

                                                tester.groupsContainingContactRequest().receiveResponse();
                                                tester.contactGroupsRequest().receiveResponse();
                                            });
                                            it('Отображен список контактов.', function() {
                                                tester.contactList.item('Балканска Берислава Силаговна').
                                                    expectNotToBeSelected();
                                                tester.contactList.item('Бележкова Грета Ервиновна').
                                                    expectNotToBeSelected();
                                            });
                                        });
                                        describe('Изменяю значение полей имени.', function() {
                                            beforeEach(function() {
                                                tester.contactBar.section('ФИО').svg.click();

                                                tester.input.withPlaceholder('Фамилия (Обязательное поле)').
                                                    fill('Неделчева');
                                                tester.input.withPlaceholder('Имя').fill('Роза');
                                                tester.input.withPlaceholder('Отчество').fill('Ангеловна');
                                            });

                                            it('Ввожу слишком длинное имя.', function() {
                                                tester.input.
                                                    withPlaceholder('Отчество').
                                                    input('aycffbymxgipxtvnrjmhmnmrzymmaxxt');

                                                tester.contactBar.
                                                    section('ФИО').
                                                    expectTextContentToHaveSubstring(
                                                        'Количество символов, введенных в поле не должно превышать 32'
                                                    );

                                                tester.button('Сохранить').click();
                                            });
                                            it('Открываю другой контакт. Поля ввода имени скрыты.', function() {
                                                tester.contactList.item('Белоконска-Вражалска Калиса Еньовна').click();

                                                tester.contactCommunicationsRequest().
                                                    anotherContact().
                                                    receiveResponse();

                                                tester.contactRequest().
                                                    anotherContact().
                                                    receiveResponse();

                                                tester.groupsContainingContactRequest().
                                                    fifthContact().
                                                    receiveResponse();

                                                tester.input.
                                                    withPlaceholder('Фамилия (Обязательное поле)').
                                                    expectNotToExist();
                                            });
                                            it(
                                                'Нажимаю на кнопку "Сохранить". Отправлен запрос обновления контакта.',
                                            function() {
                                                tester.button('Сохранить').click();

                                                tester.contactUpdatingRequest().
                                                    completeData().
                                                    anotherName().
                                                    receiveResponse();

                                                tester.groupsContainingContactRequest().receiveResponse();

                                                tester.contactRequest().
                                                    anotherName().
                                                    receiveResponse();
                                            });
                                        });
                                        describe('Добавляю поле для ввода номера телефона.', function() {
                                            beforeEach(function() {
                                                tester.contactBar.section('Телефоны').svg.click();
                                            });

                                            describe('Ввожу номер телефона.', function() {
                                                beforeEach(function() {
                                                    tester.contactBar.
                                                        section('Телефоны').
                                                        input.fill('79162729534');
                                                });

                                                it(
                                                    'Нажимаю на кнопку "Сохранить". Отправлен запрос обновления ' +
                                                    'контакта.',
                                                function() {
                                                    tester.contactBar.
                                                        section('Телефоны').
                                                        button('Сохранить').click();

                                                    tester.contactsRequest().
                                                        phoneSearching().
                                                        noData().
                                                        receiveResponse();

                                                    tester.contactUpdatingRequest().
                                                        completeData().
                                                        twoPhoneNumbers().
                                                        thirdNewChannel().
                                                        receiveResponse();

                                                    tester.groupsContainingContactRequest().receiveResponse();

                                                    tester.contactRequest().
                                                        addPhoneNumber().
                                                        receiveResponse();
                                                });
                                                it('Редактирование полей доступно.', function() {
                                                    tester.contactBar.
                                                        section('Персональный менеджер').
                                                        option('Господинова Николина').
                                                        putMouseOver();

                                                    tester.contactBar.
                                                        section('Персональный менеджер').
                                                        option('Господинова Николина').
                                                        toolsIcon.
                                                        expectToBeVisible();

                                                    tester.contactBar.section('ФИО').svg.expectToBeVisible();
                                                });
                                            });
                                            it(
                                                'Ввожу слишком длинный номер телефона. Отображено сообщение об ошибке.',
                                            function() {
                                                tester.contactBar.
                                                    section('Телефоны').
                                                    input.fill('79161234567890123456');

                                                tester.contactBar.
                                                    section('Телефоны').
                                                    button('Сохранить').click();

                                                tester.contactBar.
                                                    section('Телефоны').
                                                    expectTextContentToHaveSubstring(
                                                        'Количество символов, введенных в поле не должно превышать 16'
                                                    );

                                                tester.contactBar.
                                                    section('Персональный менеджер').
                                                    option('Господинова Николина').
                                                    putMouseOver();

                                                tester.contactBar.
                                                    section('Персональный менеджер').
                                                    option('Господинова Николина').
                                                    toolsIcon.
                                                    expectNotToExist();

                                                tester.contactBar.section('ФИО').svg.expectNotToExist();
                                            });
                                        });
                                        it('Нажимаю на номер телефона. Совершается звонок.', function() {
                                            tester.contactBar.section('Телефоны').anchor('79162729533').click();

                                            tester.firstConnection.connectWebRTC();
                                            tester.allowMediaInput();

                                            const outgoingCall = tester.outgoingCall().
                                                fifthPhoneNumber().
                                                expectToBeSent();

                                            tester.slavesNotification().
                                                available().
                                                twoChannels().
                                                sending().
                                                sixthPhoneNumber().
                                                expectToBeSent();

                                            outgoingCall.setRinging();

                                            tester.slavesNotification().
                                                available().
                                                twoChannels().
                                                progress().
                                                sixthPhoneNumber().
                                                expectToBeSent();
                                            
                                            tester.firstConnection.callTrackHandler();
                                            tester.numaRequest().fourthPhoneNumber().receiveResponse();

                                            tester.softphone.expectTextContentToHaveSubstring('+7 (916) 272-95-33');
                                        });
                                        it('Нажимаю на превью вложения. Вложение скачивается.', function() {
                                            tester.chatHistory.message.atTime('12:15').notSystem.preview.click();
                                            tester.resourcePayloadRequest().receiveResponse();

                                            tester.chatHistory.message.atTime('12:15').notSystem.downloadedFile.
                                                expectToHaveName('heart.png').
                                                expectToHaveContent('glg5lg5j8mcrj3o8f');
                                        });
                                        it('Нажимаю на кнопку скачивания. Запись скачивается.', function() {
                                            tester.chatHistory.message.atTime('12:14').downloadIcon.click();
                                            tester.talkRecordRequest().receiveResponse();

                                            tester.chatHistory.message.atTime('12:14').downloadedFile.
                                                expectToHaveName(
                                                    '2020-02-10_12-14-14.000_from_79161234567_session_482060_talk.mp3'
                                                ).
                                                expectToHaveContent('29f2f28ofjowf829f');
                                        });
                                        it(
                                            'Нажимаю на номер WhatsApp. Выбираю канал. Нажимаю на кнопку перехода в ' +
                                            'чат. Отображено сообщение о невозможности перейти в чат.',
                                        function() {
                                            tester.contactBar.
                                                section('Каналы связи').
                                                option('79283810988').
                                                click();

                                            tester.chatChannelSearchRequest().receiveResponse();

                                            tester.searchResultsRequest().
                                                onlyWhatsAppOut().
                                                channelSearch().
                                                receiveResponse();

                                            tester.notificationWindow.expectToHaveTextContent(
                                                'Невозможно перейти в чат, отсутствуют права на "Чаты и заявки"'
                                            );
                                        });
                                        it(
                                            'Нажимаю на кнопку удаления канала связи. Отображено окно подтверждения ' +
                                            'удаления.',
                                        function() {
                                            tester.contactBar.
                                                section('Каналы связи').
                                                option('79283810988').
                                                putMouseOver();

                                            tester.contactBar.
                                                section('Каналы связи').
                                                option('79283810988').
                                                toolsIcon.
                                                click();

                                            tester.select.option('Удалить').click();

                                            spendTime(0);
                                            spendTime(0);
                                            tester.modalWindow.endTransition('transform');

                                            tester.modalWindow.expectToHaveTextContent(
                                                'Удалить канал связи ' +
                                                'Вы уверены, что хотите удалить канал связи 79283810988? ' +
                                                'Удалить Отменить'
                                            );
                                        });
                                        it(
                                            'Помещаю курсор над сообщением о звонке. Отображена всплывающая подсказка.',
                                        function() {
                                            tester.chatHistory.message.atTime('12:14').inner.putMouseOver();

                                            tester.tooltip.expectToHaveTextContent(
                                                'Виртуальный номер: 74952727438'
                                            );
                                        });
                                        it(
                                            'Имя выделено. Отображен контакт. Отображена история коммуникаций.',
                                        function() {
                                            tester.button('Софтфон').expectToBeVisible();
                                            tester.button('Контакты').expectToBePressed();
                                            tester.button('Статистика').expectNotToBePressed();

                                            tester.contactBar.title.expectToHaveTextContent('Контакт');

                                            tester.contactList.item('Балканска Берислава Силаговна').
                                                expectNotToBeSelected();
                                            tester.contactList.item('Бележкова Грета Ервиновна').expectToBeSelected();

                                            tester.chatHistory.message.atTime('12:11').messengerIcon.
                                                expectToHaveClass('cm-contacts-messenger-icon-telegram');
                                            
                                            tester.chatHistory.message.atTime('12:12').expectSourceToBeVisitor();
                                            tester.chatHistory.message.atTime('12:13').expectSourceToBeOperator();

                                            tester.chatHistory.message.atTime('12:14').expectSourceToBeVisitor();

                                            tester.chatHistory.
                                                message.
                                                atTime('12:14').
                                                directionIcon.
                                                expectToHaveClass('ui-direction-icon-incoming');

                                            tester.chatHistory.
                                                message.
                                                atTime('12:14').
                                                directionIcon.
                                                expectToHaveNoneOfClasses([
                                                    'ui-direction-icon-failed',
                                                    'ui-direction-icon-transfer'
                                                ]);

                                            tester.chatHistory.
                                                message.
                                                atTime('12:15').
                                                notSystem.
                                                expectSourceToBeOperator();

                                            tester.chatHistory.expectToHaveTextContent(
                                                '10 февраля 2020 ' +

                                                'Заявка ' +

                                                'Имя клиента: Помакова Бисерка Драгановна ' +
                                                'Телефон: 79161212122 ' +
                                                'Email: msjdasj@mail.com ' +
                                                'Комментарий клиента: Я хочу о чем-то заявить. ' +

                                                '12:10 ' +

                                                '12:11 Чат принят оператором Карадимова Веска Анастасовна ' +
                                                '(79283810928) ' +

                                                'Здравствуйте 12:12 ' +

                                                    'Бележкова Грета Ервиновна ' +
                                                    'Здравствуйте ' +
                                                    'Привет 12:13 ' +

                                                '12:14 Входящий звонок с номера 79161234567 оператору Карадимова ' +
                                                    'Веска Анастасовна ' +
                                                'Запись звонка 53:40 12:14 ' +

                                                '12:15 Чат с оператором Карадимова Веска Анастасовна. ' +

                                                    'png 925 B heart.png 12:15 ' +

                                                'Карадимова Веска Анастасовна ' +
                                                'heart.png ' +
                                                'Прикольная картинка 12:16'
                                            );

                                            tester.contactBar.
                                                section('E-Mail').
                                                option('endlesssprinп.of@comagic.dev').
                                                svg.
                                                expectNotToExist();

                                            tester.contactBar.
                                                section('Каналы связи').
                                                option('79283810988').
                                                svg.
                                                expectToBeVisible();

                                            tester.contactBar.section('Персональный менеджер').header.svg.
                                                expectNotToExist();

                                            tester.contactBar.expectTextContentToHaveSubstring(
                                                'ФИО ' +
                                                'Бележкова Грета Ервиновна ' +

                                                'Телефоны ' +
                                                '79162729533 ' +

                                                'E-Mail ' +
                                                'endlesssprinп.of@comagic.dev ' +

                                                'Каналы связи ' +
                                                '79283810988 ' +
                                                '79283810928 ' +

                                                'Персональный менеджер ' +
                                                'Господинова Николина'
                                            );

                                            tester.button('Вернуться к чату').expectNotToExist();
                                            tester.button('Создать контакт').expectNotToExist();
                                        });
                                    });
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

                                                tester.contactCommunicationsRequest().
                                                    anotherContact().
                                                    receiveResponse();

                                                tester.contactRequest().anotherContact().receiveResponse();

                                                tester.groupsContainingContactRequest().
                                                    fifthContact().
                                                    receiveResponse();

                                                tester.chatHistory.expectToHaveTextContent(
                                                    '10 февраля 2020 ' +

                                                    'Заявка ' +

                                                    'Имя клиента: Помакова Бисерка Драгановна ' +
                                                    'Телефон: 79161212122 ' +
                                                    'Email: msjdasj@mail.com ' +
                                                    'Комментарий клиента: Я хочу о чем-то заявить. ' +

                                                    '12:10 ' +

                                                    '12:11 Чат принят оператором Карадимова Веска Анастасовна ' +
                                                        '(79283810928) ' +

                                                    'Здравствуйте 12:12 ' +

                                                        'Белоконска-Вражалска Калиса Еньовна ' +
                                                        'Здравствуйте ' +
                                                        'Привет 12:13 ' +

                                                    '12:14 Входящий звонок с номера 79161234567 оператору Карадимова ' +
                                                        'Веска Анастасовна ' +
                                                    'Запись звонка 53:40 12:14 ' +

                                                    '12:15 Чат с оператором Карадимова Веска Анастасовна. ' +

                                                        'png 925 B heart.png 12:15 ' +

                                                    'Карадимова Веска Анастасовна ' +
                                                    'heart.png ' +
                                                    'Прикольная картинка 12:16'
                                                );
                                            });
                                            it('Получена следующая страница.', function() {
                                                tester.chatHistory.expectTextContentToHaveSubstringsConsideringOrder(
                                                    '30 октября 2019 ' +
                                                    '00:44 Чат с оператором Карадимова Веска Анастасовна. ' +

                                                    'Пинг # 1 00:44 ' +
                                                        'Понг # 1 06:49 ',

                                                    '24 ноября 2019 ' +

                                                        'Понг # 50 03:19 ' +
                                                    'Пинг # 51 09:24 ' +
                                                        'Понг # 51 15:30 ' +
                                                    'Пинг # 52 21:35 ' +

                                                    '25 ноября 2019 ' +

                                                        'Понг # 52 03:40 ',

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
                                    describe('URL записи звонка не был получен.', function() {
                                        beforeEach(function() {
                                            contactCommunicationsRequest = contactCommunicationsRequest.
                                                noTalkRecordFileLink();
                                        });

                                        describe('Длительность разговора получена.', function() {
                                            beforeEach(function() {
                                                contactCommunicationsRequest.receiveResponse();
                                            });

                                            it(
                                                'Помещаю курсор над сообщением о звонке. Отображена всплывающая ' +
                                                'подсказка.',
                                            function() {
                                                tester.chatHistory.message.atTime('12:14').inner.putMouseOver();

                                                tester.tooltip.expectToHaveTextContent(
                                                    'Время ожидания ответа: 53:39 ' +
                                                    'Длительность: 53:40 ' +
                                                    'Виртуальный номер: 74952727438 ' +
                                                    'Статус: Клиент не взял трубку'
                                                );
                                            });
                                            it('Отображено сообщение о входящем звонке.', function() {
                                                tester.chatHistory.
                                                    message.
                                                    atTime('12:14').
                                                    directionIcon.
                                                    expectToHaveAllOfClasses([
                                                        'ui-direction-icon-incoming',
                                                        'ui-direction-icon-failed',
                                                    ]);

                                                tester.chatHistory.
                                                    message.
                                                    atTime('12:14').
                                                    directionIcon.
                                                    expectNotToHaveClass('ui-direction-icon-transfer');

                                                tester.chatHistory.message.atTime('12:14').expectToHaveTextContent(
                                                    '12:14 ' +

                                                    'Входящий звонок с номера 79161234567 оператору ' +
                                                    'Карадимова Веска Анастасовна'
                                                );
                                            });
                                        });
                                        it('Длительность разговора не получена.', function() {
                                            contactCommunicationsRequest.noTalkDuration().receiveResponse();

                                            tester.chatHistory.
                                                message.
                                                atTime('12:14').
                                                inner.
                                                putMouseOver();

                                            tester.tooltip.expectToHaveTextContent(
                                                'Время ожидания ответа: 53:39 ' +
                                                'Виртуальный номер: 74952727438 ' +
                                                'Статус: Клиент не взял трубку'
                                            );
                                        });
                                    });
                                    describe('Получено системное сообщение Comagic.', function() {
                                        beforeEach(function() {
                                            contactCommunicationsRequest.comagicSystemMessage().receiveResponse();
                                        });

                                        it('Подсказка корректно отображена.', function() {
                                            tester.chatHistory.message.atTime('12:11').inner.putMouseOver();
                                            tester.tooltip.expectToHaveTextContent('www.site.ru');
                                        });
                                        it('Сообщение корректно отображено.', function() {
                                            tester.chatHistory.message.atTime('12:11').expectToHaveTextContent(
                                                '12:11 Чат принят оператором Карадимова Веска Анастасовна (79283810928)'
                                            );
                                        });
                                    });
                                    it('Получено сообщение с аудио-вложением.', function() {
                                        contactCommunicationsRequest.audioAttachment().receiveResponse();

                                        tester.chatHistory.message.atTime('12:14').ellipsisButton.click();
                                        tester.button('Скачать').click();

                                        tester.resourcePayloadRequest().anotherFile().receiveResponse();

                                        tester.chatHistory.message.atTime('12:14').downloadedFile.
                                            expectToHaveName('call.mp3').
                                            expectToHaveContent('8gj23o2u4g2j829sk');
                                    });
                                    it('Получена заявка от контакта. Отображено имя.', function() {
                                        contactCommunicationsRequest.offlineMessageFromContact().receiveResponse();

                                        tester.chatHistory.message.atTime('12:10').expectToHaveTextContent(
                                            'Заявка ' +

                                            'Имя клиента: Помакова Бисерка Драгановна ' +
                                            'Телефон: 79161212122 ' +
                                            'Email: msjdasj@mail.com ' +
                                            'Комментарий клиента: Я хочу о чем-то заявить. ' +

                                            '12:10'
                                        );
                                    });
                                });
                                describe('Получена история коммуникаций.', function() {
                                    beforeEach(function() {
                                        contactCommunicationsRequest.receiveResponse();
                                    });

                                    describe('У контакта больше одного номера телефона.', function() {
                                        beforeEach(function() {
                                            contactRequest = contactRequest.addSecondPhoneNumber();
                                        });

                                        describe('У контакта три номера.', function() {
                                            beforeEach(function() {
                                                contactRequest.addThirdPhoneNumber().receiveResponse();

                                                tester.groupsContainingContactRequest().receiveResponse();
                                                tester.contactGroupsRequest().receiveResponse();
                                            });

                                            describe(
                                                'Нажимаю на иконку с плюсом справа от заголовка "Телефоны".',
                                            function() {
                                                beforeEach(function() {
                                                    tester.contactBar.
                                                        section('Телефоны').
                                                        plusButton.
                                                        click();
                                                });

                                                describe('Ввожу номер телефона.', function() {
                                                    beforeEach(function() {
                                                        tester.contactBar.
                                                            section('Телефоны').
                                                            input.
                                                            fill('79162729537');
                                                    });

                                                    describe('Сохраняю.', function() {
                                                        beforeEach(function() {
                                                            tester.contactBar.
                                                                section('Телефоны').
                                                                button('Сохранить').
                                                                click();

                                                            contactsRequest = tester.contactsRequest().
                                                                anotherPhoneSearching().
                                                                expectToBeSent();
                                                        });

                                                        describe('Нашелся дубль.', function() {
                                                            beforeEach(function() {
                                                                contactsRequest.
                                                                    oneItem().
                                                                    receiveResponse();
                                                            });

                                                            describe(
                                                                'Раскрываю список основных контактов.',
                                                            function() {
                                                                beforeEach(function() {
                                                                    tester.contactBar.
                                                                        section('Телефоны').
                                                                        select.
                                                                        first.
                                                                        click();
                                                                });

                                                                describe(
                                                                    'Выбираю дубликат, как основной аккаунт.',
                                                                function() {
                                                                    beforeEach(function() {
                                                                        tester.select.option(
                                                                            'Паскалева Бисера Илковна ' +
                                                                            '79162729533 (дубликат) ' +
                                                                            '79162722748'
                                                                        ).click();
                                                                    });

                                                                    it('Нажимаю на кнопку "Объединить".', function() {
                                                                        tester.button('Объединить').click();

                                                                        tester.contactsMergingRequest().
                                                                            deleteCurrent().
                                                                            addPhone().
                                                                            addSecondPhone().
                                                                            addThirdPhone().
                                                                            receiveResponse();

                                                                        tester.groupsContainingContactRequest().
                                                                            fourthContact().
                                                                            receiveResponse();

                                                                        tester.contactCommunicationsRequest().
                                                                            thirdContact().
                                                                            receiveResponse();

                                                                        tester.contactRequest().
                                                                            thirdContact().
                                                                            receiveResponse();

                                                                        tester.contactList.
                                                                            item('Паскалева Бисера Илковна').
                                                                            expectToBeVisible();

                                                                        tester.contactList.
                                                                            item('Бележкова Грета Ервиновна').
                                                                            expectNotToExist();
                                                                    });
                                                                    it(
                                                                        'Выпадающий список дубликатов заблокирован.',
                                                                    function() {
                                                                        tester.contactBar.
                                                                            section('Телефоны').
                                                                            select.
                                                                            atIndex(1).
                                                                            expectTextContentToHaveSubstring(
                                                                                'Бележкова Грета Ервиновна (текущий)'
                                                                            );

                                                                        tester.contactBar.
                                                                            section('Телефоны').
                                                                            select.
                                                                            atIndex(1).
                                                                            expectToBeDisabled();
                                                                    });
                                                                });
                                                                it(
                                                                    'Выбираю осовной аккаунт и дубликат. Нажимаю на ' +
                                                                    'кнопку "Объединить". Аккаунты успешно ' +
                                                                    'объединились. Отображен только один телефон.',
                                                                function() {
                                                                    tester.select.option(
                                                                        'Бележкова Грета Ервиновна (текущий) ' +
                                                                        '79162729533 ' +
                                                                        '79162729535 ' +
                                                                        '79162729536 ' +
                                                                        '79162729537'
                                                                    ).click();

                                                                    tester.contactBar.
                                                                        section('Телефоны').
                                                                        select.
                                                                        atIndex(1).
                                                                        click();

                                                                    tester.select.option(
                                                                        'Паскалева Бисера Илковна ' +
                                                                        '79162729533 (дубликат) ' +
                                                                        '79162722748'
                                                                    ).click();

                                                                    tester.button('Объединить').click();

                                                                    tester.contactsMergingRequest().
                                                                        addPhone().
                                                                        addSecondPhone().
                                                                        addThirdPhone().
                                                                        receiveResponse();

                                                                    tester.contactBar.
                                                                        section('Телефоны').
                                                                        expectToHaveTextContent(
                                                                            'Телефоны (4) ' +
                                                                            '79162729533'
                                                                        );
                                                                });
                                                            });
                                                            it(
                                                                'Нажимаю на кнопку "Отменить". Дублирующийся телефон.',
                                                            function() {
                                                                tester.button('Отменить').click();

                                                                tester.contactUpdatingRequest().
                                                                    completeData().
                                                                    threePhoneNumbers().
                                                                    receiveResponse();

                                                                tester.groupsContainingContactRequest().
                                                                    receiveResponse();

                                                                tester.contactRequest().receiveResponse();
                                                            });
                                                            it('Отображено сообщение об ошибке.', function() {
                                                                tester.contactBar.
                                                                    section('Телефоны').
                                                                    expectTextContentToHaveSubstring(
                                                                        'Телефоны (3) ' +

                                                                        '79162729533 ' +
                                                                        '79162729537 ' +

                                                                        'Данный номер телефона уже используется'
                                                                    );
                                                            });
                                                        });
                                                        it('Сохранилось успешно. Отображен один номер.', function() {
                                                            contactsRequest.
                                                                noData().
                                                                receiveResponse();

                                                            tester.contactUpdatingRequest().
                                                                completeData().
                                                                fourPhoneNumbers().
                                                                fourthNewChannel().
                                                                receiveResponse();

                                                            tester.groupsContainingContactRequest().receiveResponse();

                                                            tester.contactRequest().
                                                                addSecondPhoneNumber().
                                                                addThirdPhoneNumber().
                                                                addFourthPhoneNumber().
                                                                receiveResponse();
                                                                
                                                            tester.contactBar.section('Телефоны').
                                                                expectToHaveTextContent(
                                                                    'Телефоны (4) ' +
                                                                    '79162729533'
                                                                );
                                                        });
                                                    });
                                                    it(
                                                        'Отменяю редактирование. Отображен только один телефон.',
                                                    function() {
                                                        tester.contactBar.
                                                            section('Телефоны').
                                                            button('Отменить').
                                                            click();

                                                        tester.contactUpdatingRequest().
                                                            completeData().
                                                            threePhoneNumbers().
                                                            receiveResponse();

                                                        tester.groupsContainingContactRequest().receiveResponse();

                                                        tester.contactRequest().
                                                            addSecondPhoneNumber().
                                                            addThirdPhoneNumber().
                                                            receiveResponse();

                                                        tester.contactBar.section('Телефоны').expectToHaveTextContent(
                                                            'Телефоны (3) ' +
                                                            '79162729533'
                                                        );
                                                    });
                                                    it(
                                                        'Выбираю другой контакт с четырьмя телефонами. Отображается ' +
                                                        'один.',
                                                    function() {
                                                        tester.contactList.
                                                            item('Белоконска-Вражалска Калиса Еньовна').
                                                            click();

                                                        tester.contactUpdatingRequest().
                                                            completeData().
                                                            threePhoneNumbers().
                                                            receiveResponse();

                                                        tester.contactCommunicationsRequest().
                                                            anotherContact().
                                                            receiveResponse();

                                                        tester.contactRequest().
                                                            anotherContact().
                                                            addSecondPhoneNumber().
                                                            addThirdPhoneNumber().
                                                            addFourthPhoneNumber().
                                                            receiveResponse();

                                                        tester.groupsContainingContactRequest().
                                                            fifthContact().
                                                            receiveResponse();

                                                        tester.contactBar.section('Телефоны').expectToHaveTextContent(
                                                            'Телефоны (4) ' +
                                                            '79162729534'
                                                        );
                                                    });
                                                    it('Отображен только один телефон.', function() {
                                                        tester.contactBar.
                                                            section('Телефоны').
                                                            input.
                                                            expectToHaveValue('79162729537');

                                                        tester.contactBar.section('Телефоны').expectToHaveTextContent(
                                                            'Телефоны (3) ' +
                                                            '79162729533 ' +

                                                            'Отменить Сохранить'
                                                        );
                                                    });
                                                });
                                                it('Отображен только один телефон.', function() {
                                                    tester.contactBar.section('Телефоны').expectToHaveTextContent(
                                                        'Телефоны (3) ' +
                                                        '79162729533 ' +

                                                        'Поле должно быть заполнено ' +
                                                        'Отменить Сохранить'
                                                    );
                                                });
                                            });
                                            it(
                                                'Изменяю телефон. Сохраняю контакт. Переданы все три телефона.',
                                            function() {
                                                tester.contactBar.
                                                    section('Телефоны').
                                                    option('79162729533').
                                                    putMouseOver();

                                                tester.contactBar.
                                                    section('Телефоны').
                                                    option('79162729533').
                                                    toolsIcon.
                                                    click();

                                                tester.select.option('Редактировать').click();

                                                tester.contactBar.
                                                    section('Телефоны').
                                                    input.
                                                    fill('79162729534');

                                                tester.contactBar.
                                                    section('Телефоны').
                                                    button('Сохранить').
                                                    click();

                                                tester.contactsRequest().
                                                    phoneSearching().
                                                    noData().
                                                    receiveResponse();

                                                tester.contactUpdatingRequest().
                                                    completeData().
                                                    threePhoneNumbers().
                                                    anotherPhoneNumber().
                                                    thirdNewChannel().
                                                    receiveResponse();

                                                tester.groupsContainingContactRequest().receiveResponse();
                                                
                                                tester.contactRequest().
                                                    anotherPhoneNumber().
                                                    addSecondPhoneNumber().
                                                    addThirdPhoneNumber().
                                                    receiveResponse();

                                                tester.contactBar.section('Телефоны').expectToHaveTextContent(
                                                    'Телефоны (3) ' +
                                                    '79162729534'
                                                );
                                            });
                                            it('Изменяю имя. Сохраняю контакт. Переданы все три телефона.', function() {
                                                tester.contactBar.section('ФИО').svg.click();

                                                tester.input.
                                                    withPlaceholder('Фамилия (Обязательное поле)').
                                                    fill('Неделчева');

                                                tester.input.
                                                    withPlaceholder('Имя').
                                                    fill('Роза');

                                                tester.input.
                                                    withPlaceholder('Отчество').
                                                    fill('Ангеловна');

                                                tester.button('Сохранить').click();

                                                tester.contactUpdatingRequest().
                                                    completeData().
                                                    threePhoneNumbers().
                                                    anotherName().
                                                    receiveResponse();

                                                tester.groupsContainingContactRequest().receiveResponse();

                                                tester.contactRequest().
                                                    addSecondPhoneNumber().
                                                    addThirdPhoneNumber().
                                                    anotherName().
                                                    receiveResponse();
                                            });
                                            it(
                                                'Раскрываю список телефонов. Все номера телефонов отображены.',
                                            function() {
                                                tester.contactBar.section('Телефоны').collapsednessToggleButton.click();

                                                tester.contactBar.
                                                    section('Телефоны').
                                                    collapsednessToggleButton.
                                                    expectToHaveClass(
                                                        'cm-contacts-collapsedness-toggle-button-expanded'
                                                    );

                                                tester.contactBar.section('Телефоны').expectToHaveTextContent(
                                                    'Телефоны (3) ' +

                                                    '79162729533 ' +
                                                    '79162729535 ' +
                                                    '79162729536'
                                                );
                                            });
                                            it('Только один номер телефона отображен.', function() {
                                                tester.contactBar.section('Телефоны').expectToHaveTextContent(
                                                    'Телефоны (3) ' +
                                                    '79162729533'
                                                );

                                                tester.contactBar.
                                                    section('Телефоны').
                                                    collapsednessToggleButton.
                                                    expectNotToHaveClass(
                                                        'cm-contacts-collapsedness-toggle-button-expanded'
                                                    );
                                            });
                                        });
                                        describe('У контакта два номера. Все номера телефонов отображены.', function() {
                                            beforeEach(function() {
                                                contactRequest.receiveResponse();

                                                tester.groupsContainingContactRequest().receiveResponse();
                                                tester.contactGroupsRequest().receiveResponse();

                                                tester.contactBar.
                                                    section('Телефоны').
                                                    collapsednessToggleButton.
                                                    expectNotToExist();
                                            });

                                            describe(
                                                'Нажимаю на иконку с плюсом рядом с текстом "Телефоны".',
                                            function() {
                                                beforeEach(function() {
                                                    tester.contactBar.
                                                        section('Телефоны').
                                                        plusButton.
                                                        click();
                                                });

                                                describe('Ввожу номер телефона.', function() {
                                                    beforeEach(function() {
                                                        tester.contactBar.
                                                            section('Телефоны').
                                                            input.
                                                            fill('79162729536');
                                                    });

                                                    it(
                                                        'Нажимаю на кнопку "Сохранить". Отображен только один телефон.',
                                                    function() {
                                                        tester.contactBar.
                                                            section('Телефоны').
                                                            button('Сохранить').
                                                            click();

                                                        tester.contactsRequest().
                                                            thirdPhoneSearching().
                                                            noData().
                                                            receiveResponse();

                                                        tester.contactUpdatingRequest().
                                                            completeData().
                                                            threePhoneNumbers().
                                                            anotherNewChannel().
                                                            receiveResponse();

                                                        tester.groupsContainingContactRequest().receiveResponse();

                                                        tester.contactRequest().
                                                            addSecondPhoneNumber().
                                                            addThirdPhoneNumber().
                                                            receiveResponse();

                                                        tester.contactBar.section('Телефоны').expectToHaveTextContent(
                                                            'Телефоны (3) ' +
                                                            '79162729533'
                                                        );
                                                    });
                                                    it('Все номера телефонов отображены.', function() {
                                                        tester.contactBar.
                                                            section('Телефоны').
                                                            input.
                                                            expectToHaveValue('79162729536');

                                                        tester.contactBar.section('Телефоны').expectToHaveTextContent(
                                                            'Телефоны ' +

                                                            '79162729533 ' +
                                                            '79162729535 ' +

                                                            'Отменить Сохранить'
                                                        );
                                                    });
                                                });
                                                it('Все номера телефонов отображены.', function() {
                                                    tester.contactBar.section('Телефоны').expectToHaveTextContent(
                                                        'Телефоны ' +

                                                        '79162729533 ' +
                                                        '79162729535 ' +

                                                        'Поле должно быть заполнено ' +
                                                        'Отменить Сохранить'
                                                    );
                                                });
                                            });
                                            it('Все номера телефонов отображены.', function() {
                                                tester.contactBar.section('Телефоны').expectToHaveTextContent(
                                                    'Телефоны ' +

                                                    '79162729533 ' +
                                                    '79162729535'
                                                );
                                            });
                                        });
                                    });
                                    describe('У контакта есть два телеграма и три ватсапа.', function() {
                                        beforeEach(function() {
                                            contactRequest.
                                                addTelegram().
                                                addWhatsApp().
                                                addSecondTelegram().
                                                receiveResponse();

                                            tester.groupsContainingContactRequest().receiveResponse();
                                            tester.contactGroupsRequest().receiveResponse();
                                        });

                                        describe(
                                            'Изменяю имя телеграм-канала имя которого непустое. Нажимаю на кнопку ' +
                                            '"Сохранить". Отправлено имя телеграм-канала.',
                                        function() {
                                            beforeEach(function() {
                                                tester.contactBar.
                                                    section('Каналы связи').
                                                    option('@kotik70600 (bot)').
                                                    putMouseOver();

                                                tester.contactBar.
                                                    section('Каналы связи').
                                                    option('@kotik70600 (bot)').
                                                    toolsIcon.
                                                    click();

                                                tester.select.
                                                    option('Редактировать').
                                                    click();

                                                tester.contactBar.
                                                    section('Каналы связи').
                                                    input.
                                                    input('1');
                                            });

                                            it(
                                                'Нажимаю на кнопку "Отменить". Отображено прежнее значение.',
                                            function() {
                                                tester.button('Отменить').click();

                                                tester.contactBar.
                                                    section('Каналы связи').
                                                    option('@kotik70600 (bot)').
                                                    expectToBeVisible();
                                            });
                                            it(
                                                'Нажимаю на кнопку "Сохранить". Отправлено имя телеграм-канала.',
                                            function() {
                                                tester.button('Сохранить').click();

                                                tester.contactsRequest().
                                                    anotherChannelSearching().
                                                    noData().
                                                    receiveResponse();

                                                tester.contactUpdatingRequest().
                                                    completeData().
                                                    existingTelegramChannel().
                                                    existingChannel().
                                                    anotherExistingTelegramChannel().
                                                    receiveResponse();

                                                tester.groupsContainingContactRequest().receiveResponse();

                                                tester.contactRequest().
                                                    addTelegram().
                                                    addWhatsApp().
                                                    addSecondTelegram().
                                                    receiveResponse();
                                            });
                                        });
                                        it('Раскрываю список WhatsApp. Все WhatsApp отображены.', function() {
                                            tester.contactBar.
                                                section('Каналы связи').
                                                chatChannelGroup('WhatsApp').
                                                collapsednessToggleButton.
                                                click();

                                            tester.contactBar.
                                                section('Каналы связи').
                                                expectToHaveTextContent(
                                                    'Каналы связи ' +

                                                    'WhatsApp (3) ' +
                                                        '79283810988 ' +
                                                        '79283810928 ' +
                                                        '79283810987 ' +

                                                    '79218307632 (bot) ' +
                                                    '@kotik70600 (bot)'
                                                );
                                        });
                                        it(
                                            'Изменяю имя телеграм-канала имя которого пустое. Нажимаю на кнопку ' +
                                            '"Сохранить". Отправлено имя телеграм-канала.',
                                        function() {
                                            tester.contactBar.
                                                section('Каналы связи').
                                                option('79218307632 (bot)').
                                                putMouseOver();

                                            tester.contactBar.
                                                section('Каналы связи').
                                                option('79218307632 (bot)').
                                                toolsIcon.
                                                click();

                                            tester.select.
                                                option('Редактировать').
                                                click();

                                            tester.contactBar.
                                                section('Каналы связи').
                                                input.
                                                input('1');

                                            tester.button('Сохранить').click();

                                            tester.contactsRequest().
                                                thirdChannelSearching().
                                                noData().
                                                receiveResponse();

                                            tester.contactUpdatingRequest().
                                                completeData().
                                                fourthExistingTelegramChannel().
                                                existingChannel().
                                                thirdExistingTelegramChannel().
                                                receiveResponse();

                                            tester.groupsContainingContactRequest().receiveResponse();

                                            tester.contactRequest().
                                                addTelegram().
                                                addWhatsApp().
                                                addSecondTelegram().
                                                receiveResponse();
                                        });
                                        it('Отображен только один ватсап.', function() {
                                            tester.contactBar.
                                                section('Каналы связи').
                                                chatChannelGroup('WhatsApp').
                                                messengerIcon.
                                                expectToHaveClass('cm-contacts-messenger-icon-whatsapp');

                                            tester.contactBar.
                                                section('Каналы связи').
                                                option('79218307632 (bot)').
                                                messengerIcon.
                                                expectToHaveClass('cm-contacts-messenger-icon-telegram')

                                            tester.contactBar.
                                                section('Каналы связи').
                                                option('@kotik70600 (bot)').
                                                messengerIcon.
                                                expectToHaveClass('cm-contacts-messenger-icon-telegram')

                                            tester.contactBar.
                                                section('Каналы связи').
                                                expectToHaveTextContent(
                                                    'Каналы связи ' +

                                                    'WhatsApp (3) ' +
                                                        '79283810988 ' +

                                                    '79218307632 (bot) ' +
                                                    '@kotik70600 (bot)'
                                                );
                                        });
                                    });
                                    describe('В данных контакта сохранен некоррекнтый E-Mail.', function() {
                                        beforeEach(function() {
                                            contactRequest = contactRequest.addInvalidEmail();
                                        });

                                        describe('Персональный менеджер выбран.', function() {
                                            beforeEach(function() {
                                                contactRequest.receiveResponse();

                                                tester.groupsContainingContactRequest().receiveResponse();
                                                tester.contactGroupsRequest().receiveResponse();
                                            });

                                            describe('Открываю поле редактирования E-Mail.', function() {
                                                beforeEach(function() {
                                                    tester.contactBar.
                                                        section('E-Mail').
                                                        option('belezhkova gmail.com').
                                                        putMouseOver();

                                                    tester.contactBar.
                                                        section('E-Mail').
                                                        option('belezhkova gmail.com').
                                                        toolsIcon.
                                                        click();

                                                    tester.select.
                                                        option('Редактировать').
                                                        click();
                                                });

                                                it('Исправляю E-Mail, сохраняю контакт. Контакт сохранен.', function() {
                                                    tester.contactBar.
                                                        section('E-Mail').
                                                        input.
                                                        fill('belezhkova@gmail.com');

                                                    tester.button('Сохранить').click();

                                                    tester.contactsRequest().
                                                        emailSearching().
                                                        noData().
                                                        receiveResponse();

                                                    tester.contactUpdatingRequest().receiveResponse();
                                                    tester.groupsContainingContactRequest().receiveResponse();
                                                    tester.contactRequest().receiveResponse();
                                                });
                                                it('Кнопка сохранения заблокирована.', function() {
                                                    tester.button('Сохранить').click();
                                                });
                                            });
                                            it(
                                                'Изменяю корректный E-Mail, сохраняю контакт. Контакт сохранен.',
                                            function() {
                                                tester.contactBar.
                                                    section('E-Mail').
                                                    option('endlesssprinп.of@comagic.dev').
                                                    putMouseOver();

                                                tester.contactBar.
                                                    section('E-Mail').
                                                    option('endlesssprinп.of@comagic.dev').
                                                    toolsIcon.
                                                    click();

                                                tester.select.
                                                    option('Редактировать').
                                                    click();

                                                tester.contactBar.
                                                    section('E-Mail').
                                                    input.
                                                    fill('belezhkova@gmail.com');

                                                tester.button('Сохранить').click();

                                                tester.contactsRequest().
                                                    emailSearching().
                                                    noData().
                                                    receiveResponse();

                                                tester.contactUpdatingRequest().receiveResponse();
                                                tester.groupsContainingContactRequest().receiveResponse();
                                                tester.contactRequest().receiveResponse();
                                            });
                                            it(
                                                'Выбераю опцию "Не выбрано" в выпадающем списке персональных ' +
                                                'менеджеров. Контакт сохранен.',
                                            function() {
                                                tester.contactBar.
                                                    section('Персональный менеджер').
                                                    option('Господинова Николина').
                                                    putMouseOver();

                                                tester.contactBar.
                                                    section('Персональный менеджер').
                                                    option('Господинова Николина').
                                                    toolsIcon.
                                                    click();

                                                tester.select.click();
                                                tester.select.option('Не выбрано').click();
                                                tester.button('Сохранить').click();

                                                tester.contactUpdatingRequest().
                                                    noPersonalManager().
                                                    receiveResponse();

                                                tester.groupsContainingContactRequest().receiveResponse();

                                                tester.contactRequest().
                                                    noPersonalManager().
                                                    receiveResponse();
                                            });
                                            it('Кнопки добавления видимы.', function() {
                                                tester.contactBar.
                                                    section('Телефоны').
                                                    plusButton.
                                                    expectToBeVisible();
                                            });
                                        });
                                        it('Персональный менеджер не выбран.', function() {
                                            contactRequest.noPersonalManager().receiveResponse();

                                            tester.groupsContainingContactRequest().receiveResponse();
                                            tester.contactGroupsRequest().receiveResponse();

                                            tester.contactBar.
                                                section('Персональный менеджер').
                                                plusButton.
                                                expectToBeVisible();
                                        });
                                    });
                                    describe('В данных контакта сохранен некоррекнтое имя контакта.', function() {
                                        beforeEach(function() {
                                            contactRequest.longName().receiveResponse();

                                            tester.groupsContainingContactRequest().receiveResponse();
                                            tester.contactGroupsRequest().receiveResponse();

                                            tester.contactBar.section('ФИО').svg.click();
                                        });

                                        it('Исправляю имя контакта, сохраняю контакт. Контакт сохранен.', function() {
                                            tester.input.withPlaceholder('Отчество').fill('Ервиновна');

                                            tester.button('Сохранить').click();

                                            tester.contactUpdatingRequest().receiveResponse();
                                            tester.groupsContainingContactRequest().receiveResponse();
                                            tester.contactRequest().receiveResponse();
                                        });
                                        it('Отображено сообщение об ошибке.', function() {
                                            tester.contactBar.
                                                section('ФИО').
                                                expectTextContentToHaveSubstring(
                                                    'Количество символов, введенных в поле не должно превышать 32'
                                                );
                                        });
                                    });
                                    describe(
                                        'Для контакта не установлен персональный менеджер. Выбираю другой контакт. ' +
                                        'Для контакта установлен персональный менеджер.',
                                    function() {
                                        beforeEach(function() {
                                            contactRequest.noPersonalManager().receiveResponse();

                                            tester.groupsContainingContactRequest().receiveResponse();
                                            tester.contactGroupsRequest().receiveResponse();

                                            tester.contactList.
                                                item('Белоконска-Вражалска Калиса Еньовна').
                                                click();

                                            tester.contactCommunicationsRequest().
                                                anotherContact().
                                                receiveResponse();

                                            contactRequest = tester.contactRequest().
                                                anotherContact().
                                                expectToBeSent();
                                        });

                                        it('Выпадающий список менеджеров не отображен.', function() {
                                            contactRequest.receiveResponse();

                                            tester.groupsContainingContactRequest().
                                                fifthContact().
                                                receiveResponse();

                                            tester.contactBar.
                                                section('Персональный менеджер').
                                                select.
                                                expectNotToExist();
                                        });
                                        it('Отображен спиннер.', function() {
                                            tester.spin.expectToBeVisible();
                                        });
                                    });
                                    it(
                                        'В качестве E-Mail используется пустая строка. Поле для ввода почты скрыто.',
                                    function() {
                                        contactRequest.emptyEmailList().receiveResponse();

                                        tester.groupsContainingContactRequest().receiveResponse();
                                        tester.contactGroupsRequest().receiveResponse();

                                        tester.contactBar.section('E-Mail').input.expectNotToExist(); 
                                        tester.contactBar.section('E-Mail').option('').expectNotToExist();
                                    });
                                    it('В цитате отображено имя контакта.', function() {
                                        contactRequest.receiveResponse();

                                        tester.groupsContainingContactRequest().receiveResponse();
                                        tester.contactGroupsRequest().receiveResponse();

                                        tester.chatHistory.message.atTime('12:13').expectToHaveTextContent(
                                            'Бележкова Грета Ервиновна ' +
                                            'Здравствуйте ' +
                                            'Привет 12:13'
                                        );
                                    });
                                });
                            });
                            describe('Нажимаю на иконку с плюсом в заголовке списка контактов.', function() {
                                beforeEach(function() {
                                    tester.contactList.plusButton.putMouseOver();
                                    tester.select.option('Контакт').click();

                                    tester.usersRequest().forContacts().receiveResponse();
                                    tester.contactGroupsRequest().receiveResponse();
                                });

                                describe('Ввожу фамилию.', function() {
                                    beforeEach(function() {
                                        tester.input.
                                            withPlaceholder('Фамилия (Обязательное поле)').
                                            fill('Неделчева');
                                    });

                                    describe('Ввожу номер телефона.', function() {
                                        beforeEach(function() {
                                            tester.contactBar.
                                                section('Телефоны').
                                                plusButton.
                                                click();

                                            tester.contactBar.
                                                section('Телефоны').
                                                input.
                                                fill('74950230625');
                                        });

                                        describe('Нажимаю на кнопку "Сохранить".', function() {
                                            beforeEach(function() {
                                                tester.contactBar.
                                                    section('Телефоны').
                                                    button('Сохранить').
                                                    click();

                                                contactsRequest = tester.contactsRequest().
                                                    fourthPhoneSearching().
                                                    expectToBeSent();
                                            });

                                            it(
                                                'Изменяю номер телефона. Нажимаю на кнпоку "Отменить". Отображено ' +
                                                'прежнее значение.',
                                            function() {
                                                contactsRequest.
                                                    noData().
                                                    receiveResponse();

                                                tester.contactBar.
                                                    section('Телефоны').
                                                    option('74950230625').
                                                    putMouseOver();

                                                tester.contactBar.
                                                    section('Телефоны').
                                                    option('74950230625').
                                                    toolsIcon.
                                                    click();

                                                tester.select.option('Редактировать').click();

                                                tester.contactBar.
                                                    section('Телефоны').
                                                    input.
                                                    fill('74950230626');

                                                tester.contactBar.
                                                    section('Телефоны').
                                                    button('Отменить').
                                                    click();

                                                tester.contactBar.
                                                    section('Телефоны').
                                                    option('74950230625').
                                                    expectToBeVisible();
                                            });
                                            it('Найден дубль.', function() {
                                                contactsRequest.
                                                    oneItem().
                                                    receiveResponse();

                                                tester.contactBar.
                                                    section('Телефоны').
                                                    select.
                                                    first.
                                                    click();

                                                tester.select.option(
                                                    'Неделчева (текущий) ' +
                                                    '74950230625'
                                                ).click();

                                                tester.contactBar.
                                                    section('Телефоны').
                                                    select.
                                                    atIndex(1).
                                                    click();

                                                tester.select.option(
                                                    'Паскалева Бисера Илковна ' +
                                                    '79162729533 ' +
                                                    '79162722748'
                                                ).click();

                                                tester.button('Объединить').click();

                                                tester.contactsMergingRequest().
                                                    newContact().
                                                    receiveResponse();

                                                tester.contactBar.
                                                    section('Телефоны').
                                                    collapsednessToggleButton.
                                                    click();

                                                tester.input.
                                                    withPlaceholder('Фамилия (Обязательное поле)').
                                                    expectToHaveValue('Бележкова-Паскалева');

                                                tester.contactBar.
                                                    section('Телефоны').
                                                    expectToHaveTextContent(
                                                        'Телефоны (3) ' +

                                                        '74950230625 ' +
                                                        '79162729533 ' +
                                                        '79162722748'
                                                    );
                                            });
                                        });
                                        it('Нажимаю на кнопку "Отменить". Телефон скрыт.', function() {
                                            tester.contactBar.
                                                section('Телефоны').
                                                button('Отменить').
                                                click();

                                            spendTime(0);
                                            spendTime(0);
                                            tester.modalWindow.expectNotToExist();

                                            tester.contactBar.
                                                section('Телефоны').
                                                content.
                                                expectToHaveTextContent('');
                                        });
                                    });
                                    describe('Выбираю персонального менеджера.', function() {
                                        beforeEach(function() {
                                            tester.contactBar.
                                                section('Персональный менеджер').
                                                plusButton.
                                                click();

                                            tester.contactBar.
                                                section('Персональный менеджер').
                                                select.
                                                click();

                                            tester.select.
                                                option('Шалева Дора').
                                                click();
                                        });

                                        it(
                                            'Нажимаю на кнопку "Сохранить". Выбираю другого персонального менеджера. ' +
                                            'Нажимаю на кнопку "Отменить".',
                                        function() {
                                            tester.contactBar.
                                                section('Персональный менеджер').
                                                button('Сохранить').
                                                click();

                                            tester.contactBar.
                                                section('Персональный менеджер').
                                                option('Шалева Дора').
                                                putMouseOver();

                                            tester.contactBar.
                                                section('Персональный менеджер').
                                                option('Шалева Дора').
                                                svg.
                                                click();

                                            tester.contactBar.
                                                section('Персональный менеджер').
                                                select.
                                                click();

                                            tester.select.
                                                option('Господинова Николина').
                                                click();

                                            tester.contactBar.
                                                section('Персональный менеджер').
                                                button('Отменить').
                                                click();

                                            tester.contactBar.
                                                section('Персональный менеджер').
                                                content.
                                                expectToHaveTextContent('Шалева Дора');
                                        });
                                        it('Нажимаю на кнопку "Отменить".', function() {
                                            tester.contactBar.
                                                section('Персональный менеджер').
                                                button('Отменить').
                                                click();

                                            tester.contactBar.
                                                section('Персональный менеджер').
                                                content.
                                                expectToHaveTextContent('');
                                        });
                                    });
                                    it(
                                        'Пытаюсь создать контакт. Не удалось создать контакт. В поле фамилии введена ' +
                                        'фамилия.',
                                    function() {
                                        tester.button('Создать контакт').click();

                                        tester.contactCreatingRequest().
                                            noPhone().
                                            failed().
                                            receiveResponse();

                                        tester.input.
                                            withPlaceholder('Фамилия (Обязательное поле)').
                                            expectToHaveValue('Неделчева');
                                    });
                                });
                                it('Нажимаю на кнопку "Отменить". Панель контакта скрыта. ', function() {
                                    tester.button('Отменить').click();
                                    tester.contactBar.section('ФИО').expectNotToExist();
                                });
                                it('Кнопка "Создать контакт" заблокирована.', function() {
                                    tester.contactBar.title.deleteButton.expectNotToExist();
                                    tester.button('Создать контакт').expectToBeDisabled();
                                    tester.input.withPlaceholder('Фамилия (Обязательное поле)').expectToHaveError();
                                });
                            });
                            it('Открываю софтфон. Нажимаю на кнопку с жуком. Скачивается лог. ', function() {
                                tester.button('Софтфон').click();

                                tester.slavesNotification().
                                    additional().
                                    visible().
                                    expectToBeSent();

                                tester.bugButton.click();

                                tester.anchor.withFileName('20191219.121007.000.log.txt').
                                    expectHrefToBeBlobWithSubstring(
                                        'GET $REACT_APP_BASE_URL/contacts' + 
                                        "\n\n" +
                                        '{"limit":100,"search":null,"scroll_direction":"forward"}' +
                                        "\n\n" +
                                        '{"data":[{"first_name":"Берислава",'//}]}
                                    );
                            });
                            it('Имена сгруппированы по первым буквам.', function() {
                                tester.contactBar.section('ФИО').expectNotToExist();

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
                                            tester.contactList.item('Анчева Десислава Пламеновна').scrollIntoView();
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
                                                    'Прокручиваю список контактов до конца. Запрошена следующая ' +
                                                    'страница списка контактов.',
                                                function() {
                                                    tester.contactList.item('Анчева Десислава Пламеновна').
                                                        scrollIntoView();

                                                    tester.spinWrapper.scrollIntoView();
                                                    tester.contactsRequest().search().secondPage().receiveResponse();

                                                    tester.contactList.
                                                        expectTextContentToHaveSubstringsConsideringOrder(
                                                            'Анчева Десислава Пламеновна',
                                                            'Паска лева Бисера Илковна #100',
                                                            'Паска лева Бисера Илковна #200'
                                                        );
                                                });
                                                it('Отображен список контаков.', function() {
                                                    tester.contactList.
                                                        expectTextContentToHaveSubstringsConsideringOrder(
                                                            'Анчева Десислава Пламеновна',
                                                            'Паска лева Бисера Илковна #100'
                                                        );

                                                    tester.contactList.expectTextContentNotToHaveSubstring(
                                                        'Паска лева Бисера Илковна #200'
                                                    );
                                                });
                                            });
                                            it(
                                                'Получен только один контакт. Отображен только один контакт.',
                                            function() {
                                                contactsRequest.oneItem().receiveResponse();

                                                tester.contactList.expectToHaveTextContent(
                                                    'Контакты Группы ' +
                                                    'П Паска лева Бисера Илковна'
                                                );
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
                                            'Анчева Десислава Пламеновна',
                                            'Паскалева Бисера Илковна #100',
                                            'Паскалева Бисера Илковна #200',
                                            'Паскалева Бисера Илковна #250'
                                        );
                                    });
                                    it('Отображен список контаков.', function() {
                                        tester.contactList.expectTextContentToHaveSubstringsConsideringOrder(
                                            'Анчева Десислава Пламеновна',
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

                                tester.outCallSessionEvent().receive();
                                tester.outCallSessionEvent().slavesNotification().expectToBeSent();
                            });
                            it('Отображена страница контактов.', function() {
                                tester.contactList.expectTextContentToHaveSubstringsConsideringOrder(
                                    'Анчева Десислава Пламеновна',
                                    'Паскалева Бисера Илковна #100'
                                );

                                tester.spin.expectNotToExist();
                            });
                        });
                        it(
                            'Токен авторизации истек. Токен обновлен. Отправлен повторный запрос контактов.',
                        function() {
                            contactsRequest.accessTokenExpired().receiveResponse();
                            tester.refreshRequest().receiveResponse();

                            tester.contactsRequest().anotherAuthorizationToken().receiveResponse();
                        });
return;
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
                                tester.contactGroupsRequest().receiveResponse();
                                tester.usersRequest().forContacts().receiveResponse();
                                tester.contactGroupsRequest().receiveResponse();
                            });

                            describe('Открываю поля имени.', function() {
                                beforeEach(function() {
                                    tester.contactBar.section('ФИО').svg.click();
                                });

                                describe('Заполняю поле фамилии.', function() {
                                    beforeEach(function() {
                                        tester.input.withPlaceholder('Фамилия (Обязательное поле)').fill('Неделчева');
                                    });

                                    describe('Нажимаю на кнопку "Создать контакт". Создан контакт.', function() {
                                        beforeEach(function() {
                                            tester.button('Создать контакт').click();

                                            tester.contactCreatingRequest().
                                                anotherPhoneNumber().
                                                anotherContactId().
                                                receiveResponse();

                                            const requests = ajax.inAnyOrder();

                                            const contactRequest = tester.contactRequest().
                                                fourthContact().
                                                noPersonalManager().
                                                noPhoneNumbers().
                                                noEmails().
                                                noChannels().
                                                noPatronymic().
                                                noFirstName().
                                                expectToBeSent(requests);

                                            const groupsContainingContactRequest = tester.
                                                groupsContainingContactRequest().
                                                sixthContact().
                                                expectToBeSent(requests);

                                            const contactCommunicationsRequest = tester.contactCommunicationsRequest().
                                                fourthContact().
                                                expectToBeSent(requests);

                                            requests.expectToBeSent();

                                            contactRequest.receiveResponse();
                                            contactCommunicationsRequest.receiveResponse();
                                            groupsContainingContactRequest.receiveResponse();
                                        });

                                        describe('Закрываю уведомление о создании контакта.', function() {
                                            beforeEach(function() {
                                                tester.notificationWindow.closeButton.click();
                                            });

                                            it('Уведомление скрыто.', function() {
                                                tester.notificationWindow.expectToHaveTextContent('');
                                            });
                                            it(
                                                'Заполняю остальные поля. Нажимаю на кнопку "Сохранить". В списке ' +
                                                'изменено имя контакта.',
                                            function() {
                                                tester.contactBar.
                                                    section('ФИО').
                                                    svg.
                                                    click();

                                                tester.input.
                                                    withPlaceholder('Имя').
                                                    fill('Роза');

                                                tester.input.
                                                    withPlaceholder('Отчество').
                                                    fill('Ангеловна');

                                                tester.contactBar.
                                                    section('ФИО').
                                                    content.
                                                    button('Сохранить').
                                                    click()

                                                tester.contactUpdatingRequest().
                                                    anotherName().
                                                    anotherContactId().
                                                    receiveResponse();

                                                tester.groupsContainingContactRequest().
                                                    sixthContact().
                                                    receiveResponse();

                                                tester.contactRequest().
                                                    fourthContact().
                                                    receiveResponse();

                                                tester.contactList.
                                                    item('Неделчева Роза Ангеловна').
                                                    expectToBeVisible();
                                                
                                                tester.notificationWindow.expectToHaveTextContent('');
                                            });
                                        });
                                        it('В списке отображен новый контакт.', function() {
                                            tester.contactList.
                                                item('Неделчева').
                                                expectToBeSelected();

                                            tester.contactList.
                                                item('Балканска Берислава Силаговна').
                                                expectNotToBeSelected();

                                            tester.notificationWindow.
                                                expectTextContentToHaveSubstring('Контакт создан');
                                        });
                                    });
                                    it(
                                        'Нажимаю на кнопку "Очистить". Значение поля для ввода фамилии возвращено к ' +
                                        'изначальному.',
                                    function() {
                                        tester.button('Очистить').click();

                                        tester.input.
                                            withPlaceholder('Фамилия (Обязательное поле)').
                                            expectToHaveValue('980925456');
                                    });
                                });
                                describe('Стираю значение в поле "Фамилия".', function() {
                                    beforeEach(function() {
                                        tester.input.withPlaceholder('Фамилия (Обязательное поле)').clear();
                                    });

                                    it('Помещаю курсор над номером телефона. Меню скрыто.', function() {
                                        tester.contactBar.
                                            section('Телефоны').
                                            option('79161234567').
                                            putMouseOver();

                                        tester.contactBar.
                                            section('Телефоны').
                                            option('79161234567').
                                            toolsIcon.
                                            expectNotToExist();
                                    });
                                    it(
                                        'Поле фамилии отмечено как невалидное. Кнопка "Создать контакт" заблокирована.',
                                    function() {
                                        tester.input.withPlaceholder('Фамилия (Обязательное поле)').expectToHaveError();
                                        tester.input.withPlaceholder('Имя').expectNotToHaveError();

                                        tester.contactBar.
                                            section('Телефоны').
                                            plusButton.
                                            expectNotToExist();

                                        tester.contactBar.
                                            section('Персональный менеджер').
                                            plusButton.
                                            expectNotToExist();

                                        tester.button('Создать контакт').expectToBeDisabled();
                                    });
                                });
                                it('Нажимаю на кнопку "Отменить". Поля ввода имени скрыты.', function() {
                                    tester.button('Отменить').click();

                                    tester.contactBar.
                                        section('ФИО').
                                        content.
                                        expectToHaveTextContent('980925456')

                                    tester.input.
                                        withPlaceholder('Фамилия (Обязательное поле)').
                                        expectNotToExist();
                                });
                                it('В поле "Фамилия" введен номер телефона.', function() {
                                    tester.input.
                                        withPlaceholder('Фамилия (Обязательное поле)').
                                        expectToHaveValue('980925456');

                                    tester.input.
                                        withPlaceholder('Имя').
                                        expectToHaveValue('');

                                    tester.input.
                                        withPlaceholder('Отчество').
                                        expectToHaveValue('');

                                    tester.button('Создать контакт').expectToBeEnabled();
                                });
                            });
                            describe('Нажимаю на кнопку с плюсом рядом с текстом "Персональный менеджер".', function() {
                                beforeEach(function() {
                                    tester.contactBar.section('Персональный менеджер').header.svg.click();
                                });

                                it(
                                    'Выбираю контакт без персонального менеджера. Блок персонального менеджера ' +
                                    'скрыт.',
                                function() {
                                    tester.contactList.
                                        item('Белоконска-Вражалска Калиса Еньовна').
                                        click();

                                    const requests = ajax.inAnyOrder();

                                    const contactRequest = tester.contactRequest().
                                        anotherContact().
                                        noPersonalManager().
                                        expectToBeSent(requests);

                                    const contactCommunicationsRequest = tester.contactCommunicationsRequest().
                                        anotherContact().
                                        expectToBeSent(requests);

                                    requests.expectToBeSent();

                                    contactRequest.receiveResponse();
                                    contactCommunicationsRequest.receiveResponse();

                                    tester.groupsContainingContactRequest().
                                        fifthContact().
                                        receiveResponse();
                                        
                                    tester.contactBar.
                                        section('Персональный менеджер').
                                        header.
                                        svg.
                                        expectToBeVisible();

                                    tester.contactBar.
                                        section('Персональный менеджер').
                                        select.
                                        expectNotToExist();

                                    tester.contactBar.
                                        section('Персональный менеджер').
                                        option('').
                                        expectNotToExist();
                                });
                                it('Выбираю персонального менеджера. Персональный менеджер выбран.', function() {
                                    tester.contactBar.
                                        section('Персональный менеджер').
                                        content.
                                        select.
                                        click();

                                    tester.select.
                                        option('Шалева Дора').
                                        click();

                                    tester.contactBar.
                                        section('Персональный менеджер').
                                        content.
                                        button('Сохранить').
                                        click();

                                    tester.contactBar.
                                        section('Персональный менеджер').
                                        content.
                                        select.
                                        expectNotToExist();

                                    tester.contactBar.
                                        section('Персональный менеджер').
                                        content.
                                        expectToHaveTextContent('Шалева Дора');
                                });
                                it('Нажимаю на кнопку "Отменить". Блок персонального менеджера удален.', function() {
                                    tester.contactBar.
                                        section('Персональный менеджер').
                                        content.
                                        button('Отменить').
                                        click();

                                    tester.contactBar.
                                        section('Персональный менеджер').
                                        option('').
                                        expectNotToExist();
                                });
                                it(
                                    'Кнопка с плюсом рядом с текстом "Персональный менеджер" скрыта. Кнопка ' +
                                    '"Сохранить" заблокирована.',
                                function() {
                                    tester.contactBar.
                                        section('Персональный менеджер').
                                        header.
                                        svg.
                                        expectNotToExist();

                                    tester.contactBar.
                                        section('Персональный менеджер').
                                        content.
                                        button('Сохранить').
                                        expectToHaveAttribute('disabled');
                                });
                            });
                            it('Открыта форма создания контакта.', function() {
                                tester.contactBar.expectTextContentToHaveSubstring(
                                    'Телефоны ' +
                                    '79161234567 '
                                );

                                tester.button('Сохранить').expectNotToExist();
                            });
                        });
                        it('Контакт найден. Нажимаю на кнопку открытия контакта. Контакт открыт.', function() {
                            outCallEvent.knownContact().receive();
                            tester.outCallEvent().knownContact().slavesNotification().expectToBeSent();

                            tester.contactOpeningButton.click();

                            tester.contactsRequest().differentNames().receiveResponse();
                            tester.contactGroupsRequest().receiveResponse();

                            const requests = ajax.inAnyOrder();

                            const usersRequest = tester.usersRequest().
                                forContacts().
                                expectToBeSent(requests);

                            const contactRequest = tester.contactRequest().
                                expectToBeSent(requests);

                            const contactCommunicationsRequest = tester.contactCommunicationsRequest().
                                expectToBeSent(requests);

                            requests.expectToBeSent();

                            usersRequest.receiveResponse();
                            contactRequest.receiveResponse();
                            contactCommunicationsRequest.receiveResponse();

                            tester.groupsContainingContactRequest().receiveResponse();
                            tester.contactGroupsRequest().receiveResponse();

                            tester.contactList.item('Балканска Берислава Силаговна').expectNotToBeSelected();
                            tester.contactList.item('Бележкова Грета Ервиновна').expectToBeSelected();

                            tester.body.expectTextContentToHaveSubstring(
                                'ФИО ' +
                                'Бележкова Грета Ервиновна ' +

                                'Телефоны ' +
                                '79162729533 ' +

                                'E-Mail ' +
                                'endlesssprinп.of@comagic.dev ' +

                                'Каналы связи ' +
                                '79283810988 ' +
                                '79283810928'
                            );
                        });
                    });
                });
return;
                describe('Номер должен быть скрыт. Открываю карточку контакта.', function() {
                    beforeEach(function() {
                        settingsRequest.shouldHideNumbers().receiveResponse();

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

                        tester.button('Контакты').click();

                        tester.contactsRequest().differentNames().receiveResponse();
                        tester.contactGroupsRequest().receiveResponse();

                        tester.contactList.item('Бележкова Грета Ервиновна').click();

                        const requests = ajax.inAnyOrder();

                        contactCommunicationsRequest = tester.contactCommunicationsRequest().expectToBeSent(requests);

                        const contactRequest = tester.contactRequest().expectToBeSent(requests),
                            usersRequest = tester.usersRequest().forContacts().expectToBeSent(requests);

                        requests.expectToBeSent();

                        contactRequest.receiveResponse();

                        tester.groupsContainingContactRequest().receiveResponse();
                        tester.contactGroupsRequest().receiveResponse();

                        usersRequest.receiveResponse();
                        contactCommunicationsRequest.receiveResponse();
                    });
                    
                    it(
                        'Нажимаю на иконку с плюсом рядом с текстом "Телефоны". Отображено поле для ввода номера.',
                    function() {
                        tester.contactBar.section('Телефоны').svg.click();

                        tester.contactBar.
                            section('Телефоны').
                            input.
                            expectToBeVisible();
                    });
                    it('Открываю меню телефона. Пункт "Редактировать" заблокирован..', function() {
                        tester.contactBar.
                            section('Телефоны').
                            option('Неизвестный номер').
                            putMouseOver();

                        tester.contactBar.
                            section('Телефоны').
                            option('Неизвестный номер').
                            toolsIcon.
                            click();

                        tester.select.
                            option('Редактировать').
                            expectToBeDisabled();
                    });
                    it('Номер скрыт.', function() {
                        tester.contactBar.
                            section('Телефоны').
                            option('Неизвестный номер').
                            expectToBeVisible();
                    });
                });
                it('Выбрано другое устройство для управления звонками.', function() {
                    settingsRequest.callsAreManagedByAnotherDevice().receiveResponse();

                    tester.slavesNotification().
                        twoChannels().
                        disabled().
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
                    tester.contactGroupsRequest().receiveResponse();

                    tester.contactList.item('Бележкова Грета Ервиновна').click();

                    const requests = ajax.inAnyOrder();

                    const contactCommunicationsRequest = tester.contactCommunicationsRequest().expectToBeSent(requests),
                        contactRequest = tester.contactRequest().expectToBeSent(requests),
                        usersRequest = tester.usersRequest().forContacts().expectToBeSent(requests);

                    requests.expectToBeSent();

                    contactCommunicationsRequest.receiveResponse();
                    contactRequest.receiveResponse();

                    tester.groupsContainingContactRequest().receiveResponse();
                    tester.contactGroupsRequest().receiveResponse();

                    usersRequest.receiveResponse();

                    tester.contactBar.section('Телефоны').anchor('79162729533').click();

                    tester.slavesNotification().
                        additional().
                        visible().
                        expectToBeSent();

                    tester.softphone.expectTextContentToHaveSubstring('Используется на другом устройстве');
                });
            });
return;
            it(
                'Отправка сообщений запрещена. Выбираю контакт. Нажимаю на канал связи. Ничего не происходит.',
            function() {
                employeeStatusesRequest.
                    unableToSendChatMessages().
                    receiveResponse();

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

                tester.button('Контакты').click();

                tester.contactsRequest().differentNames().receiveResponse()
                tester.contactGroupsRequest().receiveResponse();

                tester.contactList.item('Бележкова Грета Ервиновна').click();

                const requests = ajax.inAnyOrder();

                const contactCommunicationsRequest = tester.contactCommunicationsRequest().expectToBeSent(requests),
                    contactRequest = tester.contactRequest().expectToBeSent(requests),
                    usersRequest = tester.usersRequest().forContacts().expectToBeSent(requests);

                requests.expectToBeSent();

                usersRequest.receiveResponse();
                contactRequest.receiveResponse();

                tester.groupsContainingContactRequest().receiveResponse();
                tester.contactGroupsRequest().receiveResponse();

                contactCommunicationsRequest.receiveResponse();

                tester.contactBar.
                    section('Каналы связи').
                    option('79283810988').
                    click();
            });
        });
return;
        describe('Рабочее место оператора доступно.', function() {
            let contactChatRequest;

            beforeEach(function() {
                accountRequest = accountRequest.
                    operatorWorkplaceAvailable();
            });

            describe(
                'Есть доступ к чужим чатам. Открываю раздел контактов. Открываю контакт.',
            function() {
                beforeEach(function() {
                    accountRequest.otherEmployeeChatsAccessAvailable().receiveResponse();

                    const requests = ajax.inAnyOrder();

                    reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
                    const reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                        ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(requests),
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
                    employeeSettingsRequest.receiveResponse();
                    employeeStatusesRequest.receiveResponse();
                    employeeRequest.receiveResponse();

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

                    tester.button('Контакты').click();

                    tester.contactsRequest().differentNames().receiveResponse();
                    tester.contactGroupsRequest().receiveResponse();

                    tester.contactList.item('Бележкова Грета Ервиновна').click();

                    {
                        const requests = ajax.inAnyOrder();

                        const contactCommunicationsRequest = tester.
                            contactCommunicationsRequest().
                            expectToBeSent(requests);

                        const contactRequest = tester.contactRequest().addTelegram().expectToBeSent(requests);
                        const usersRequest = tester.usersRequest().forContacts().expectToBeSent(requests);

                        requests.expectToBeSent();

                        usersRequest.receiveResponse();
                        contactRequest.receiveResponse();

                        tester.groupsContainingContactRequest().receiveResponse();
                        tester.contactGroupsRequest().receiveResponse();

                        contactCommunicationsRequest.receiveResponse();
                    }
                });

                describe('Нажимаю на номер Telegram.', function() {
                    beforeEach(function() {
                        tester.contactBar.
                            section('Каналы связи').
                            option('79218307632 (bot)').
                            click();

                        contactChatRequest = tester.contactChatRequest().
                            anotherChannelType().
                            anotherChannelId().
                            thirdPhone().
                            expectToBeSent();
                    });

                    describe('Получен чужой чат.', function() {
                        beforeEach(function() {
                            contactChatRequest.anotherEmployee();
                        });

                        it('Чат активен. Открыт раздел чатов.', function() {
                            contactChatRequest.
                                anotherEmployee().
                                receiveResponse();

                            tester.chatListRequest().receiveResponse();
                            
                            tester.chatListRequest().active().receiveResponse();
                            tester.chatListRequest().closed().receiveResponse();
                            tester.chatListRequest().isOtherEmployeesAppeals().active().receiveResponse();

                            tester.accountRequest().
                                forChats().
                                operatorWorkplaceAvailable().
                                receiveResponse();

                            tester.chatsWebSocket.connect();
                            tester.chatsInitMessage().expectToBeSent();

                            const requests = ajax.inAnyOrder();

                            const chatSettingsRequest = tester.chatSettingsRequest().expectToBeSent(requests);
                            const chatChannelListRequest = tester.chatChannelListRequest().expectToBeSent(requests);
                            const listRequest = tester.listRequest().expectToBeSent(requests);
                            const siteListRequest = tester.siteListRequest().expectToBeSent(requests);
                            const reportsListRequest = tester.reportsListRequest().expectToBeSent(requests);

                            const messageTemplateListRequest = tester.messageTemplateListRequest().
                                expectToBeSent(requests);

                            const accountRequest = tester.accountRequest().
                                forChats().
                                operatorWorkplaceAvailable().
                                expectToBeSent(requests);

                            requests.expectToBeSent();

                            chatSettingsRequest.receiveResponse();
                            chatChannelListRequest.receiveResponse();
                            listRequest.receiveResponse();
                            siteListRequest.receiveResponse();
                            messageTemplateListRequest.receiveResponse();
                            reportsListRequest.receiveResponse();
                            accountRequest.receiveResponse();

                            tester.chatListRequest().thirdChat().receiveResponse();
                            tester.countersRequest().receiveResponse();
                            tester.offlineMessageCountersRequest().receiveResponse();
                            tester.chatChannelListRequest().receiveResponse();
                            tester.siteListRequest().receiveResponse();
                            tester.markListRequest().receiveResponse();

                            tester.chatListRequest().
                                forCurrentEmployee().
                                secondPage().
                                receiveResponse();

                            tester.chatListRequest().
                                forCurrentEmployee().
                                secondPage().
                                active().
                                receiveResponse();

                            tester.chatListRequest().
                                forCurrentEmployee().
                                secondPage().
                                closed().
                                receiveResponse();

                            tester.chatChannelTypeListRequest().receiveResponse();

                            tester.offlineMessageListRequest().notProcessed().receiveResponse();
                            tester.offlineMessageListRequest().processing().receiveResponse();
                            tester.offlineMessageListRequest().processed().receiveResponse();

                            tester.messageListRequest().receiveResponse();
                            tester.visitorCardRequest().receiveResponse();
                            tester.groupsContainingContactRequest().receiveResponse();
                            tester.contactGroupsRequest().receiveResponse();
                            tester.usersRequest().forContacts().receiveResponse();
                            tester.contactGroupsRequest().receiveResponse();
                            tester.usersRequest().forContacts().receiveResponse();

                            tester.contactBar.
                                section('Каналы связи').
                                content.
                                expectToHaveTextContent('Помакова Бисерка Драгановна (bot)');
                        });
                        it('Чат закрыт. Отображено сообщение о невозможности перейти в чат.', function() {
                            contactChatRequest.closed().receiveResponse();

                            tester.notificationWindow.expectToHaveTextContent(
                                'Невозможно перейти в чат, посетитель участвует в чате с другим оператором'
                            );
                        });
                    });
                    it('Получен свой чат. Чат закрыт. Совершён переход в чат.', function() {
                        contactChatRequest.closed().receiveResponse();

                        tester.chatListRequest().receiveResponse();
                        tester.chatListRequest().active().receiveResponse();
                        tester.chatListRequest().closed().receiveResponse();
                        tester.chatListRequest().isOtherEmployeesAppeals().active().receiveResponse();

                        tester.accountRequest().
                            forChats().
                            operatorWorkplaceAvailable().
                            receiveResponse();

                        tester.chatsWebSocket.connect();
                        tester.chatsInitMessage().expectToBeSent();

                        const requests = ajax.inAnyOrder();

                        const chatSettingsRequest = tester.chatSettingsRequest().expectToBeSent(requests);
                        const chatChannelListRequest = tester.chatChannelListRequest().expectToBeSent(requests);
                        const listRequest = tester.listRequest().expectToBeSent(requests);
                        const siteListRequest = tester.siteListRequest().expectToBeSent(requests);
                        const reportsListRequest = tester.reportsListRequest().expectToBeSent(requests);

                        const messageTemplateListRequest = tester.messageTemplateListRequest().
                            expectToBeSent(requests);

                        const accountRequest = tester.accountRequest().
                            forChats().
                            operatorWorkplaceAvailable().
                            expectToBeSent(requests);

                        requests.expectToBeSent();

                        chatSettingsRequest.receiveResponse();
                        chatChannelListRequest.receiveResponse();
                        listRequest.receiveResponse();
                        siteListRequest.receiveResponse();
                        messageTemplateListRequest.receiveResponse();
                        reportsListRequest.receiveResponse();
                        accountRequest.receiveResponse();

                        tester.chatListRequest().thirdChat().receiveResponse();
                        tester.countersRequest().receiveResponse();
                        tester.offlineMessageCountersRequest().receiveResponse();
                        tester.chatChannelListRequest().receiveResponse();
                        tester.siteListRequest().receiveResponse();
                        tester.markListRequest().receiveResponse();

                        tester.chatListRequest().
                            forCurrentEmployee().
                            secondPage().
                            receiveResponse();

                        tester.chatListRequest().
                            forCurrentEmployee().
                            secondPage().
                            active().
                            receiveResponse();

                        tester.chatListRequest().
                            forCurrentEmployee().
                            secondPage().
                            closed().
                            receiveResponse();

                        tester.chatChannelTypeListRequest().receiveResponse();

                        tester.offlineMessageListRequest().notProcessed().receiveResponse();
                        tester.offlineMessageListRequest().processing().receiveResponse();
                        tester.offlineMessageListRequest().processed().receiveResponse();

                        tester.messageListRequest().receiveResponse();
                        tester.visitorCardRequest().receiveResponse();
                        tester.groupsContainingContactRequest().receiveResponse();
                        tester.contactGroupsRequest().receiveResponse();
                        tester.usersRequest().forContacts().receiveResponse();
                        tester.contactGroupsRequest().receiveResponse();
                        tester.usersRequest().forContacts().receiveResponse();

                        tester.contactBar.
                            section('Каналы связи').
                            content.
                            expectToHaveTextContent('Помакова Бисерка Драгановна (bot)');
                    });
                });
                describe('Нажимаю на номер WhatsApp.', function() {
                    let chatChannelSearchRequest;

                    beforeEach(function() {
                        tester.contactBar.
                            section('Каналы связи').
                            option('79283810988').
                            click();

                        chatChannelSearchRequest = tester.chatChannelSearchRequest().
                            expectToBeSent();
                    });

                    it(
                        'Чат не найден. Отображено предложение начать новый чат. Нажимаю на кнопку "Создать". Открыт ' +
                        'новый чат.',
                    function() {
                        chatChannelSearchRequest.noChat().receiveResponse();

                        tester.searchResultsRequest().
                            onlyWhatsAppOut().
                            channelSearch().
                            receiveResponse();

                        const requests = ajax.inAnyOrder();

                        const newChatListRequest = tester.chatListRequest().expectToBeSent(requests),
                            activeChatListRequest = tester.chatListRequest().active().expectToBeSent(requests),
                            closedChatListRequest = tester.chatListRequest().closed().expectToBeSent(requests);

                        const chatListRequest = tester.chatListRequest().
                            isOtherEmployeesAppeals().
                            active().
                            expectToBeSent(requests);

                        const chatChannelListRequest = tester.chatChannelListRequest().expectToBeSent(requests);
                            listRequest = tester.listRequest().expectToBeSent(requests),
                            siteListRequest = tester.siteListRequest().expectToBeSent(requests),
                            reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                            messageTemplateListRequest = tester.messageTemplateListRequest().expectToBeSent(requests),
                            chatSettingsRequest = tester.chatSettingsRequest().expectToBeSent(requests);

                        const accountRequest = tester.accountRequest().
                            forChats().
                            operatorWorkplaceAvailable().
                            expectToBeSent(requests);

                        const secondAccountRequest = tester.accountRequest().
                            forChats().
                            operatorWorkplaceAvailable().
                            expectToBeSent(requests);

                        requests.expectToBeSent();

                        newChatListRequest.receiveResponse();
                        activeChatListRequest.receiveResponse();
                        closedChatListRequest.receiveResponse();
                        chatListRequest.receiveResponse();
                        chatChannelListRequest.receiveResponse();
                        listRequest.receiveResponse();
                        reportsListRequest.receiveResponse();
                        siteListRequest.receiveResponse();
                        messageTemplateListRequest.receiveResponse();
                        chatSettingsRequest.receiveResponse();
                        accountRequest.receiveResponse();
                        secondAccountRequest.receiveResponse();

                        tester.chatsWebSocket.connect();
                        tester.chatsInitMessage().expectToBeSent();
                        
                        tester.chatStartingRequest().receiveResponse();
                        tester.countersRequest().receiveResponse();

                        tester.offlineMessageCountersRequest().receiveResponse();
                        tester.chatChannelListRequest().receiveResponse();
                        tester.siteListRequest().receiveResponse();
                        tester.markListRequest().receiveResponse();

                        tester.chatListRequest().
                            forCurrentEmployee().
                            secondPage().
                            receiveResponse();

                        tester.chatListRequest().
                            forCurrentEmployee().
                            secondPage().
                            active().
                            receiveResponse();

                        tester.chatListRequest().
                            forCurrentEmployee().
                            secondPage().
                            closed().
                            receiveResponse();

                        tester.chatChannelTypeListRequest().receiveResponse();

                        tester.offlineMessageListRequest().notProcessed().receiveResponse();
                        tester.offlineMessageListRequest().processing().receiveResponse();
                        tester.offlineMessageListRequest().processed().receiveResponse();

                        tester.chatListRequest().thirdChat().receiveResponse();
                        tester.visitorCardRequest().receiveResponse();
                        tester.groupsContainingContactRequest().receiveResponse();
                        tester.contactGroupsRequest().receiveResponse();
                        tester.usersRequest().forContacts().receiveResponse();
                        tester.contactGroupsRequest().receiveResponse();
                        tester.usersRequest().forContacts().receiveResponse();

                        tester.button('Софтфон').click();

                        tester.slavesNotification().
                            additional().
                            visible().
                            expectToBeSent();

                        tester.bugButton.click();

                        tester.anchor.withFileName('20191219.121007.000.log.txt').
                            expectHrefToBeBlobWithSubstring(
                                'POST $REACT_APP_CHAT_BASE_URL?method=get_search_results' +
                                "\n\n" +

                                JSON.stringify({
                                    jsonrpc: '2.0',
                                    id: 'number',
                                    method: 'get_search_results',
                                    params: {
                                        search_string: '79283810988',
                                        is_only_whatsapp_out: true,
                                    },
                                }) +

                                "\n\n" +
                                '{"result":{"data":{"found_list":[{"chat_channel_id":101,'//}}}}
                            );
                    });
                    it(
                        'Есть доступный чат. Выбираю канал. Нажимаю на кнопку перехода в чат. Открыт раздел чатов.',
                    function() {
                        chatChannelSearchRequest.receiveResponse();

                        tester.searchResultsRequest().
                            onlyWhatsAppOut().
                            channelSearch().
                            receiveResponse();

                        const requests = ajax.inAnyOrder();

                        const newChatListRequest = tester.chatListRequest().expectToBeSent(requests),
                            activeChatListRequest = tester.chatListRequest().active().expectToBeSent(requests),
                            closedChatListRequest = tester.chatListRequest().closed().expectToBeSent(requests);

                        const chatListRequest = tester.chatListRequest().
                            isOtherEmployeesAppeals().
                            active().
                            expectToBeSent(requests);

                        const chatChannelListRequest = tester.chatChannelListRequest().expectToBeSent(requests);
                            listRequest = tester.listRequest().expectToBeSent(requests),
                            siteListRequest = tester.siteListRequest().expectToBeSent(requests),
                            reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                            messageTemplateListRequest = tester.messageTemplateListRequest().expectToBeSent(requests),
                            chatSettingsRequest = tester.chatSettingsRequest().expectToBeSent(requests);

                        const accountRequest = tester.accountRequest().
                            forChats().
                            operatorWorkplaceAvailable().
                            expectToBeSent(requests);

                        const secondAccountRequest = tester.accountRequest().
                            forChats().
                            operatorWorkplaceAvailable().
                            expectToBeSent(requests);

                        requests.expectToBeSent();

                        newChatListRequest.receiveResponse();
                        activeChatListRequest.receiveResponse();
                        closedChatListRequest.receiveResponse();
                        chatListRequest.receiveResponse();
                        chatChannelListRequest.receiveResponse();
                        listRequest.receiveResponse();
                        siteListRequest.receiveResponse();
                        reportsListRequest.receiveResponse();
                        messageTemplateListRequest.receiveResponse();
                        chatSettingsRequest.receiveResponse();
                        accountRequest.receiveResponse();
                        secondAccountRequest.receiveResponse();

                        tester.chatsWebSocket.connect();
                        tester.chatsInitMessage().expectToBeSent();
                        
                        tester.chatListRequest().thirdChat().receiveResponse();
                        tester.countersRequest().receiveResponse();
                        tester.offlineMessageCountersRequest().receiveResponse();
                        tester.chatChannelListRequest().receiveResponse();
                        tester.siteListRequest().receiveResponse();
                        tester.markListRequest().receiveResponse();

                        tester.chatListRequest().
                            forCurrentEmployee().
                            secondPage().
                            receiveResponse();

                        tester.chatListRequest().
                            forCurrentEmployee().
                            secondPage().
                            active().
                            receiveResponse();

                        tester.chatListRequest().
                            forCurrentEmployee().
                            secondPage().
                            closed().
                            receiveResponse();

                        tester.chatChannelTypeListRequest().receiveResponse();

                        tester.offlineMessageListRequest().
                            notProcessed().
                            receiveResponse();

                        tester.offlineMessageListRequest().
                            processing().
                            receiveResponse();

                        tester.offlineMessageListRequest().
                            processed().
                            receiveResponse();

                        tester.messageListRequest().receiveResponse();
                        tester.visitorCardRequest().receiveResponse();
                        tester.groupsContainingContactRequest().receiveResponse();
                        tester.contactGroupsRequest().receiveResponse();
                        tester.usersRequest().forContacts().receiveResponse();
                        tester.contactGroupsRequest().receiveResponse();
                        tester.usersRequest().forContacts().receiveResponse();

                        tester.contactBar.
                            section('Каналы связи').
                            content.
                            expectToHaveTextContent('Помакова Бисерка Драгановна (bot)');
                    });
                });
            });
            describe(
                'Нет доступа к чужим чатам. Открываю раздел контактов. Открываю контакт. Нажимаю на номер WhatsApp.',
            function() {
                let contactChatRequest;

                beforeEach(function() {
                    accountRequest.receiveResponse();

                    const requests = ajax.inAnyOrder();

                    reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
                    const reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                        ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(requests),
                        reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                        employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(requests),
                        employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(requests),
                        employeeRequest = tester.employeeRequest().expectToBeSent(requests),
                        authCheckRequest = tester.authCheckRequest().expectToBeSent(requests);

                    requests.expectToBeSent();

                    ticketsContactsRequest.receiveResponse();
                    reportsListRequest.receiveResponse();
                    reportTypesRequest.receiveResponse();
                    reportGroupsRequest.receiveResponse();
                    employeeSettingsRequest.receiveResponse();
                    employeeStatusesRequest.receiveResponse();
                    employeeRequest.receiveResponse();

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

                    tester.button('Контакты').click();

                    tester.contactsRequest().differentNames().receiveResponse();
                    tester.contactGroupsRequest().receiveResponse();

                    tester.contactList.item('Бележкова Грета Ервиновна').click();

                    {
                        const requests = ajax.inAnyOrder();

                        const contactCommunicationsRequest = tester.
                            contactCommunicationsRequest().
                            expectToBeSent(requests);

                        const contactRequest = tester.contactRequest().addTelegram().expectToBeSent(requests);
                        const usersRequest = tester.usersRequest().forContacts().expectToBeSent(requests);

                        requests.expectToBeSent();

                        usersRequest.receiveResponse();
                        contactRequest.receiveResponse();

                        tester.groupsContainingContactRequest().receiveResponse();
                        tester.contactGroupsRequest().receiveResponse();

                        contactCommunicationsRequest.receiveResponse();
                    }

                    tester.contactBar.
                        section('Каналы связи').
                        option('79218307632 (bot)').
                        click();

                    contactChatRequest = tester.contactChatRequest().
                        anotherChannelType().
                        anotherChannelId().
                        thirdPhone().
                        expectToBeSent();
                });

                it('Получен свой чат.', function() {
                    contactChatRequest.receiveResponse();

                    tester.chatListRequest().receiveResponse();
                    tester.chatListRequest().active().receiveResponse();
                    tester.chatListRequest().closed().receiveResponse();
                    tester.chatListRequest().isOtherEmployeesAppeals().active().receiveResponse();

                    tester.accountRequest().
                        forChats().
                        operatorWorkplaceAvailable().
                        receiveResponse();

                    tester.chatsWebSocket.connect();
                    tester.chatsInitMessage().expectToBeSent();

                    const requests = ajax.inAnyOrder();

                    const chatSettingsRequest = tester.chatSettingsRequest().expectToBeSent(requests);
                    const chatChannelListRequest = tester.chatChannelListRequest().expectToBeSent(requests);
                    const listRequest = tester.listRequest().expectToBeSent(requests);
                    const siteListRequest = tester.siteListRequest().expectToBeSent(requests);
                    const reportsListRequest = tester.reportsListRequest().expectToBeSent(requests);
                    const messageTemplateListRequest = tester.messageTemplateListRequest().expectToBeSent(requests);

                    const accountRequest = tester.accountRequest().
                        forChats().
                        operatorWorkplaceAvailable().
                        expectToBeSent(requests);

                    requests.expectToBeSent();

                    chatSettingsRequest.receiveResponse();
                    chatChannelListRequest.receiveResponse();
                    listRequest.receiveResponse();
                    siteListRequest.receiveResponse();
                    messageTemplateListRequest.receiveResponse();
                    reportsListRequest.receiveResponse();
                    accountRequest.receiveResponse();

                    tester.chatListRequest().thirdChat().receiveResponse();
                    tester.countersRequest().receiveResponse();
                    tester.offlineMessageCountersRequest().receiveResponse();
                    tester.chatChannelListRequest().receiveResponse();
                    tester.siteListRequest().receiveResponse();
                    tester.markListRequest().receiveResponse();

                    tester.chatListRequest().
                        forCurrentEmployee().
                        secondPage().
                        receiveResponse();

                    tester.chatListRequest().
                        forCurrentEmployee().
                        secondPage().
                        active().
                        receiveResponse();

                    tester.chatListRequest().
                        forCurrentEmployee().
                        secondPage().
                        closed().
                        receiveResponse();

                    tester.chatChannelTypeListRequest().receiveResponse();

                    tester.offlineMessageListRequest().notProcessed().receiveResponse();
                    tester.offlineMessageListRequest().processing().receiveResponse();
                    tester.offlineMessageListRequest().processed().receiveResponse();

                    tester.messageListRequest().receiveResponse();
                    tester.visitorCardRequest().receiveResponse();
                    tester.groupsContainingContactRequest().receiveResponse();
                    tester.contactGroupsRequest().receiveResponse();
                    tester.usersRequest().forContacts().receiveResponse();
                    tester.contactGroupsRequest().receiveResponse();
                    tester.usersRequest().forContacts().receiveResponse();

                    tester.contactBar.
                        section('Каналы связи').
                        content.
                        expectToHaveTextContent('Помакова Бисерка Драгановна (bot)');
                });
                it(
                    'Получен чужой чат. Отображено сообщение о невозможности перейти в чат другого оператора.',
                function() {
                    contactChatRequest.
                        anotherEmployee().
                        receiveResponse();

                    tester.notificationWindow.expectToHaveTextContent(
                        'Невозможно перейти в чат, посетитель участвует в чате с другим оператором'
                    );
                });
            });
            it('Софтфон недоступен. Открываю контакт. Нажимаю на номер телефона. Звонок не совершается.', function() {
                accountRequest.softphoneUnavailable().receiveResponse();

                tester.masterInfoMessage().receive();
                tester.notificationChannel().tellIsLeader().expectToBeSent();
                tester.masterInfoMessage().tellIsLeader().expectToBeSent();
                tester.notificationChannel().applyLeader().expectToBeSent();
                tester.masterInfoMessage().applyLeader().expectToBeSent();

                tester.employeesWebSocket.connect();
                tester.employeesInitMessage().expectToBeSent();

                tester.ticketsContactsRequest().receiveResponse();

                const requests = ajax.inAnyOrder();

                const reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
                const reportsListRequest = tester.reportsListRequest().expectToBeSent(requests);
                const reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests);
                const employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(requests);
                const employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(requests);
                const employeeRequest = tester.employeeRequest().expectToBeSent(requests);

                requests.expectToBeSent();

                reportGroupsRequest.receiveResponse();
                reportsListRequest.receiveResponse();
                reportTypesRequest.receiveResponse();
                employeeSettingsRequest.receiveResponse();
                employeeStatusesRequest.receiveResponse();
                employeeRequest.receiveResponse();
                
                tester.button('Контакты').click();

                tester.contactsRequest().differentNames().receiveResponse();
                tester.contactGroupsRequest().receiveResponse();

                tester.contactList.item('Бележкова Грета Ервиновна').click();

                {
                    const requests = ajax.inAnyOrder();

                    const contactCommunicationsRequest = tester.contactCommunicationsRequest().
                        secondEarlier().
                        expectToBeSent(requests);

                    const contactRequest = tester.contactRequest().expectToBeSent(requests);
                    const usersRequest = tester.usersRequest().forContacts().expectToBeSent(requests);

                    requests.expectToBeSent();

                    usersRequest.receiveResponse();
                    contactRequest.receiveResponse();

                    tester.groupsContainingContactRequest().receiveResponse();
                    tester.contactGroupsRequest().receiveResponse();

                    contactCommunicationsRequest.receiveResponse();
                }

                tester.contactBar.
                    section('Телефоны').
                    option('79162729533').
                    click();

                tester.contactBar.
                    section('Телефоны').
                    anchor('79162729533').
                    expectNotToExist();
            });
        });
        describe('Редактирование контактов недоступно. Открываю раздел контактов. Нажимаю на имя.', function() {
            beforeEach(function() {
                accountRequest.addressBookUpdatingUnavailable().receiveResponse();

                const requests = ajax.inAnyOrder();

                reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
                const reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                    ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(requests),
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
                employeeSettingsRequest.receiveResponse();
                employeeStatusesRequest.receiveResponse();
                employeeRequest.receiveResponse();

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

                tester.button('Контакты').click();

                tester.contactsRequest().differentNames().receiveResponse();
                tester.contactGroupsRequest().receiveResponse();

                tester.contactList.item('Бележкова Грета Ервиновна').click();

                {
                    const requests = ajax.inAnyOrder();

                    const contactCommunicationsRequest = tester.contactCommunicationsRequest().expectToBeSent(requests),
                        contactRequest = tester.contactRequest().expectToBeSent(requests),
                        usersRequest = tester.usersRequest().forContacts().expectToBeSent(requests);

                    requests.expectToBeSent();

                    contactRequest.addTelegram().receiveResponse();
                    tester.groupsContainingContactRequest().receiveResponse();
                    tester.contactGroupsRequest().receiveResponse();

                    usersRequest.receiveResponse();
                    contactCommunicationsRequest.receiveResponse();
                }
            });

            it('Меню номер недоступно.', function() {
                tester.contactBar.
                    section('Телефоны').
                    option('79162729533').
                    putMouseOver();

                tester.contactBar.
                    section('Телефоны').
                    option('79162729533').
                    toolsIcon.
                    expectNotToExist();
            });
            it('Помещаю курсор над именем персонального менеджера. Иконка редактирования скрыта.', function() {
                tester.contactBar.
                    section('Персональный менеджер').
                    option('Господинова Николина').
                    putMouseOver();

                tester.contactBar.
                    section('Персональный менеджер').
                    option('Господинова Николина').
                    toolsIcon.
                    expectNotToExist();
            });
            it('Кнопки добавления телефонов и E-Mail скрыты.', function() {
                tester.contactBar.section('Телефоны').svg.expectNotToExist();
                tester.contactBar.section('E-Mail').svg.expectNotToExist();
            });
            it('Нажимаю на канал Telegram. Отображено сообщение об отсутсвии прав.', function() {
                tester.contactBar.
                    section('Каналы связи').
                    option('79218307632 (bot)').
                    click();

                tester.notificationWindow.expectToHaveTextContent(
                    'Невозможно перейти в чат, отсутствуют права на "Чаты и заявки"'
                );
            });
        });
        describe('Добавление каналов недоступно.', function() {
            beforeEach(function() {
                accountRequest.contactChannelCreatingFeatureFlagDisabled().receiveResponse();

                const requests = ajax.inAnyOrder();

                reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
                const reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                    ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(requests),
                    reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                    employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(requests),
                    employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(requests),
                    employeeRequest = tester.employeeRequest().expectToBeSent(requests),
                    authCheckRequest = tester.authCheckRequest().expectToBeSent(requests);

                requests.expectToBeSent();

                ticketsContactsRequest.receiveResponse();
                reportsListRequest.receiveResponse();
                reportTypesRequest.receiveResponse();
                reportGroupsRequest.receiveResponse();
                employeeSettingsRequest.receiveResponse();
                employeeStatusesRequest.receiveResponse();
                employeeRequest.receiveResponse();

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

                tester.button('Контакты').click();

                tester.contactsRequest().differentNames().receiveResponse();
                tester.contactGroupsRequest().receiveResponse();

                tester.contactList.item('Бележкова Грета Ервиновна').click();

                {
                    const requests = ajax.inAnyOrder();

                    const contactCommunicationsRequest = tester.contactCommunicationsRequest().expectToBeSent(requests),
                        contactRequest = tester.contactRequest().expectToBeSent(requests),
                        usersRequest = tester.usersRequest().forContacts().expectToBeSent(requests);

                    requests.expectToBeSent();

                    contactRequest.receiveResponse();

                    tester.groupsContainingContactRequest().receiveResponse();
                    tester.contactGroupsRequest().receiveResponse();

                    usersRequest.receiveResponse();
                    contactCommunicationsRequest.receiveResponse();
                }
            });

            it('Меню редактирования каналов связи скрыта.', function() {
                tester.contactBar.
                    section('Каналы связи').
                    option('79283810988').
                    putMouseOver();

                tester.contactBar.
                    section('Каналы связи').
                    option('79283810988').
                    toolsIcon.
                    expectNotToExist();
            });
            it('Кнопка добавления канала скрыта.', function() {
                tester.contactBar.
                    section('Каналы связи').
                    plusButton.
                    expectNotToExist();
            });
        });
        it(
            'Фичефлаг телеграма выключен. Раскрываю меню действий канала. Кнопка "Редактировать" заблокирована.',
        function() {
            accountRequest.
                telegramContactChannelFeatureFlagDisabled().
                operatorWorkplaceAvailable().
                receiveResponse();

            const requests = ajax.inAnyOrder();

            reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
            const reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(requests),
                reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(requests),
                employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(requests),
                employeeRequest = tester.employeeRequest().expectToBeSent(requests),
                authCheckRequest = tester.authCheckRequest().expectToBeSent(requests);

            requests.expectToBeSent();

            ticketsContactsRequest.receiveResponse();
            reportsListRequest.receiveResponse();
            reportTypesRequest.receiveResponse();
            reportGroupsRequest.receiveResponse();
            employeeSettingsRequest.receiveResponse();
            employeeStatusesRequest.receiveResponse()
            employeeRequest.receiveResponse();

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

            tester.button('Контакты').click();

            tester.contactsRequest().differentNames().receiveResponse();
            tester.contactGroupsRequest().receiveResponse();

            tester.contactList.item('Бележкова Грета Ервиновна').click();

            {
                const requests = ajax.inAnyOrder();

                const contactCommunicationsRequest = tester.contactCommunicationsRequest().expectToBeSent(requests),
                    contactRequest = tester.contactRequest().expectToBeSent(requests),
                    usersRequest = tester.usersRequest().forContacts().expectToBeSent(requests);

                requests.expectToBeSent();

                contactRequest.legacyChannelList().addSecondTelegram().receiveResponse();

                tester.groupsContainingContactRequest().receiveResponse();
                tester.contactGroupsRequest().receiveResponse();

                usersRequest.receiveResponse();
                contactCommunicationsRequest.receiveResponse();
            }

            tester.contactBar.
                section('Каналы связи').
                option('@kotik70600 (bot)').
                putMouseOver();

            tester.contactBar.
                section('Каналы связи').
                option('@kotik70600 (bot)').
                toolsIcon.
                click();

            tester.select.
                option('Редактировать').
                expectToBeDisabled();
        });
        it('Создание контакта недоступно. Кнопка добавления контакта заблокирована.', function() {
            accountRequest.addressBookCreatingUnavailable().receiveResponse();

            const requests = ajax.inAnyOrder();

            reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
            const reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(requests),
                reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(requests),
                employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(requests),
                employeeRequest = tester.employeeRequest().expectToBeSent(requests),
                authCheckRequest = tester.authCheckRequest().expectToBeSent(requests);

            requests.expectToBeSent();

            ticketsContactsRequest.receiveResponse();
            reportsListRequest.receiveResponse();
            reportTypesRequest.receiveResponse();
            reportGroupsRequest.receiveResponse();
            employeeSettingsRequest.receiveResponse();
            employeeStatusesRequest.receiveResponse();
            employeeRequest.receiveResponse();

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

            tester.button('Контакты').click();

            tester.contactsRequest().differentNames().receiveResponse();
            tester.contactGroupsRequest().receiveResponse();

            tester.contactList.plusButton.expectToBeDisabled();
            tester.contactList.plusButton.putMouseOver();

            tester.tooltip.expectToHaveTextContent('Отсутствуют права на создание, обратитесь к Администратору');
        });
        it('Фичефлаг создания контакта выключен. Кнопка добавления контакта скрыта.', function() {
            accountRequest.contactCreatingFeatureFlagDisabled().receiveResponse();

            const requests = ajax.inAnyOrder();

            reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
            const reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(requests),
                reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(requests),
                employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(requests),
                employeeRequest = tester.employeeRequest().expectToBeSent(requests),
                authCheckRequest = tester.authCheckRequest().expectToBeSent(requests);

            requests.expectToBeSent();

            ticketsContactsRequest.receiveResponse();
            reportsListRequest.receiveResponse();
            reportTypesRequest.receiveResponse();
            reportGroupsRequest.receiveResponse();
            employeeSettingsRequest.receiveResponse();
            employeeStatusesRequest.receiveResponse();
            employeeRequest.receiveResponse();

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

            tester.button('Контакты').click();
            
            tester.contactsRequest().differentNames().receiveResponse();
            tester.contactGroupsRequest().receiveResponse();

            tester.contactList.plusButton.expectNotToExist();
        });
        it('Удаление контакта недоступно. Кнопка уделения заблокирована.', function() {
            accountRequest.addressBookDeletingUnavailable().receiveResponse();

            const requests = ajax.inAnyOrder();

            reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
            const reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(requests),
                reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(requests),
                employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(requests),
                employeeRequest = tester.employeeRequest().expectToBeSent(requests),
                authCheckRequest = tester.authCheckRequest().expectToBeSent(requests);

            requests.expectToBeSent();

            ticketsContactsRequest.receiveResponse();
            reportsListRequest.receiveResponse();
            reportTypesRequest.receiveResponse();
            reportGroupsRequest.receiveResponse();
            employeeSettingsRequest.receiveResponse();
            employeeStatusesRequest.receiveResponse();
            employeeRequest.receiveResponse();

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

            tester.button('Контакты').click();

            tester.contactsRequest().differentNames().receiveResponse();
            tester.contactGroupsRequest().receiveResponse();

            tester.contactList.item('Бележкова Грета Ервиновна').click();

            {
                const requests = ajax.inAnyOrder();

                const contactCommunicationsRequest = tester.contactCommunicationsRequest().expectToBeSent(requests),
                    contactRequest = tester.contactRequest().expectToBeSent(requests),
                    usersRequest = tester.usersRequest().forContacts().expectToBeSent(requests);

                requests.expectToBeSent();

                contactRequest.receiveResponse();

                tester.groupsContainingContactRequest().receiveResponse();
                tester.contactGroupsRequest().receiveResponse();

                usersRequest.receiveResponse();
                contactCommunicationsRequest.receiveResponse();
            }

            tester.contactBar.title.deleteButton.putMouseOver();

            tester.tooltip.expectToHaveTextContent(
                'Отсутствуют права на удаление контакта, обратитесь к Администратору'
            );
        });
        it('Фичефлаг удаления контакта выключен. Кнопка уделения скрыта.', function() {
            accountRequest.contactDeletingFeatureFlagDisabled().receiveResponse();

            const requests = ajax.inAnyOrder();

            reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
            const reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(requests),
                reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(requests),
                employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(requests),
                employeeRequest = tester.employeeRequest().expectToBeSent(requests),
                authCheckRequest = tester.authCheckRequest().expectToBeSent(requests);

            requests.expectToBeSent();

            ticketsContactsRequest.receiveResponse();
            reportsListRequest.receiveResponse();
            reportTypesRequest.receiveResponse();
            reportGroupsRequest.receiveResponse();
            employeeSettingsRequest.receiveResponse();
            employeeStatusesRequest.receiveResponse();
            employeeRequest.receiveResponse();

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
            tester.settingsRequest().receiveResponse();

            tester.slavesNotification().
                twoChannels().
                enabled().
                expectToBeSent();

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

            tester.slavesNotification().
                twoChannels().
                available().
                expectToBeSent();

            tester.button('Контакты').click();

            tester.contactsRequest().differentNames().receiveResponse();
            tester.contactGroupsRequest().receiveResponse();

            tester.contactList.item('Бележкова Грета Ервиновна').click();

            {
                const requests = ajax.inAnyOrder();

                const contactCommunicationsRequest = tester.contactCommunicationsRequest().expectToBeSent(requests),
                    contactRequest = tester.contactRequest().expectToBeSent(requests),
                    usersRequest = tester.usersRequest().forContacts().expectToBeSent(requests);

                requests.expectToBeSent();

                contactRequest.receiveResponse();

                tester.groupsContainingContactRequest().receiveResponse();
                tester.contactGroupsRequest().receiveResponse();

                usersRequest.receiveResponse();
                contactCommunicationsRequest.receiveResponse();
            }

            tester.contactBar.title.deleteButton.expectNotToExist();
        });
        it('Фичефлаг исходящего чата выключен. Нажимаю на канал связи. Ничего не происходит.', function() {
            accountRequest.
                outgoingChatFeatureFlagDisabled().
                operatorWorkplaceAvailable().
                receiveResponse();

            const requests = ajax.inAnyOrder();

            reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
            const reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(requests),
                reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(requests),
                employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(requests),
                employeeRequest = tester.employeeRequest().expectToBeSent(requests),
                authCheckRequest = tester.authCheckRequest().expectToBeSent(requests);

            requests.expectToBeSent();

            ticketsContactsRequest.receiveResponse();
            reportsListRequest.receiveResponse();
            reportTypesRequest.receiveResponse();
            reportGroupsRequest.receiveResponse();
            employeeSettingsRequest.receiveResponse();
            employeeStatusesRequest.receiveResponse();
            employeeRequest.receiveResponse();

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
            tester.settingsRequest().receiveResponse();

            tester.slavesNotification().
                twoChannels().
                enabled().
                expectToBeSent();

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

            tester.slavesNotification().
                twoChannels().
                available().
                expectToBeSent();

            tester.button('Контакты').click();
            tester.contactsRequest().differentNames().receiveResponse();
            tester.contactGroupsRequest().receiveResponse();

            tester.contactList.item('Бележкова Грета Ервиновна').click();

            {
                const requests = ajax.inAnyOrder();

                const contactCommunicationsRequest = tester.contactCommunicationsRequest().expectToBeSent(requests),
                    contactRequest = tester.contactRequest().expectToBeSent(requests),
                    usersRequest = tester.usersRequest().forContacts().expectToBeSent(requests);

                requests.expectToBeSent();

                contactRequest.receiveResponse();

                tester.groupsContainingContactRequest().receiveResponse();
                tester.contactGroupsRequest().receiveResponse();

                usersRequest.receiveResponse();
                contactCommunicationsRequest.receiveResponse();
            }

            tester.contactBar.
                section('Каналы связи').
                option('79283810988').
                click();
        });
        it('Раздел контактов недоступен. Пункт меню "Контакты" скрыт.', function() {
            accountRequest.contactsFeatureFlagDisabled().receiveResponse();

            const requests = ajax.inAnyOrder();

            reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
            const reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(requests),
                reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(requests),
                employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(requests),
                employeeRequest = tester.employeeRequest().expectToBeSent(requests),
                authCheckRequest = tester.authCheckRequest().expectToBeSent(requests);

            requests.expectToBeSent();

            ticketsContactsRequest.receiveResponse();
            reportsListRequest.receiveResponse();
            reportTypesRequest.receiveResponse();
            reportGroupsRequest.receiveResponse();
            employeeSettingsRequest.receiveResponse();
            employeeStatusesRequest.receiveResponse();
            employeeRequest.receiveResponse();

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
            tester.settingsRequest().receiveResponse();

            tester.slavesNotification().
                twoChannels().
                enabled().
                expectToBeSent();

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

            tester.slavesNotification().
                twoChannels().
                available().
                expectToBeSent();

            tester.button('Контакты').expectNotToExist();
        });
    });
});
