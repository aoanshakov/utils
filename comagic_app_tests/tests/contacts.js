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

                tester.masterInfoMessage().receive();
                tester.slavesNotification().expectToBeSent();
                tester.slavesNotification().additional().expectToBeSent();
                tester.masterInfoMessage().tellIsLeader().expectToBeSent();

                tester.notificationChannel().tellIsLeader().expectToBeSent();
                tester.notificationChannel().applyLeader().expectToBeSent();
                tester.notificationChannel().applyLeader().expectToBeSent();

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
                                                'Прокручиваю список контактов до конца. Запрошена следующая страница ' +
                                                'списка контактов.',
                                            function() {
                                                tester.contactList.item('Анчева Десислава Пламеновна').
                                                    scrollIntoView();

                                                tester.spinWrapper.scrollIntoView();
                                                tester.contactsRequest().search().secondPage().receiveResponse();

                                                tester.contactList.expectTextContentToHaveSubstringsConsideringOrder(
                                                    'Анчева Десислава Пламеновна',
                                                    'Паска лева Бисера Илковна #100',
                                                    'Паска лева Бисера Илковна #200'
                                                );
                                            });
                                            it('Отображен список контаков.', function() {
                                                tester.contactList.expectTextContentToHaveSubstringsConsideringOrder(
                                                    'Анчева Десислава Пламеновна',
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
                                'Анчева Десислава Пламеновна',
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
                            let contactCommunicationsRequest,
                                contactRequest;

                            beforeEach(function() {
                                tester.contactList.item('Бележкова Грета Ервиновна').click();

                                const requests = ajax.inAnyOrder();

                                contactCommunicationsRequest = tester.contactCommunicationsRequest().
                                    expectToBeSent(requests);

                                contactRequest = tester.contactRequest().expectToBeSent(requests);
                                const usersRequest = tester.usersRequest().forContacts().expectToBeSent(requests);

                                requests.expectToBeSent();

                                usersRequest.receiveResponse();
                            });

                            describe('Для контакта установлен персональный менеджер.', function() {
                                beforeEach(function() {
                                    contactRequest.receiveResponse();
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
                                                });

                                                it(
                                                    'Выбираю персонального менеджера. Нажимаю на кнопку "Сохранить". ' +
                                                    'Выбираю опцию "Не выбрано". Нажимаю на кнопку "Сохранить". ' +
                                                    'Контакт сохранен.',
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

                                                    tester.contactBar.section('Персональный менеджер').content.
                                                        expectToHaveTextContent('');
                                                });
                                                it('Контакт сохранен.', function() {
                                                    tester.contactBar.section('Персональный менеджер').content.
                                                        expectToHaveTextContent('');
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

                                        it('Удаляю номер. Номер удален.', function() {
                                            tester.select.option('Удалить').click();

                                            tester.contactUpdatingRequest().completeData().noPhoneNumbers().
                                                receiveResponse();

                                            tester.contactBar.
                                                section('Телефоны').
                                                option('79162729533').
                                                expectNotToExist();
                                        });
                                        it('Изменяю номер телефона. Отправлен запрос обновления контакта.', function() {
                                            tester.select.option('Редактировать').click();

                                            tester.contactBar.
                                                section('Телефоны').
                                                input.
                                                fill('79162729534');

                                            tester.contactBar.
                                                section('Телефоны').
                                                button('Сохранить').
                                                click();

                                            tester.contactsRequest()
                                                .phoneSearching()
                                                .noData()
                                                .receiveResponse();

                                            tester.contactUpdatingRequest().
                                                completeData().
                                                anotherPhoneNumber().
                                                receiveResponse();
                                        });
                                        it('Пунт "Редактировать" доступен.', function() {
                                            tester.select.option('Редактировать').expectToBeEnabled();
                                        });
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
                                        it('Отображена длительность.', function() {
                                            tester.chatHistory.message.atTime('12:14').expectToHaveTextContent(
                                                'Запись звонка ' +
                                                '53:40 12:14'
                                            );
                                        });
                                    });
                                    describe('Нажимаю на другое имя. Запрошен другой контакт.', function() {
                                        beforeEach(function() {
                                            tester.contactList.item('Белоконска-Вражалска Калиса Еньовна').click();

                                            tester.contactCommunicationsRequest().anotherContact().receiveResponse();
                                            tester.contactRequest().anotherContact().receiveResponse();
                                        });

                                        it(
                                            'Выбираю другого менеджера. Нажимаю на кнпоку "Отменить". В списке ' +
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
                                    describe('Перехожу в другой раздел. Перехожу обратно в контакты.', function() {
                                        beforeEach(function() {
                                            tester.button('Статистика').click();
                                            tester.statsRequest().receiveResponse();

                                            tester.button('Контакты').click();
                                            tester.contactsRequest().differentNames().receiveResponse();
                                        });

                                        it('Выбираю тот же контакт. Данные запрошены заново.', function() {
                                            tester.contactList.item('Бележкова Грета Ервиновна').click();

                                            const requests = ajax.inAnyOrder();

                                            const contactCommunicationsRequest = tester.contactCommunicationsRequest().
                                                expectToBeSent(requests);
                                            const contactRequest = tester.contactRequest().expectToBeSent(requests);
                                            const usersRequest = tester.usersRequest().forContacts().
                                                expectToBeSent(requests);

                                            requests.expectToBeSent();

                                            contactCommunicationsRequest.receiveResponse();
                                            contactRequest.receiveResponse();
                                            usersRequest.receiveResponse();
                                        });
                                        it('Отображен список контактов.', function() {
                                            tester.contactList.item('Балканска Берислава Силаговна').
                                                expectNotToBeSelected();
                                            tester.contactList.item('Бележкова Грета Ервиновна').
                                                expectNotToBeSelected();
                                        });
                                    });
                                    describe('Добавляю поле для E-Mail.', function() {
                                        beforeEach(function() {
                                            tester.contactBar.section('E-Mail').svg.click();
                                        });

                                        it(
                                            'Нажимаю на кнпоку "Сохранить". Пустая строка в качестве E-Mail не ' +
                                            'сохранилась.',
                                        function() {
                                            tester.contactBar.section('E-Mail').button('Сохранить').click();
                                            tester.contactUpdatingRequest().completeData().receiveResponse();
                                        });
                                        it('Ввожу E-Mail. Отправлен запрос обновления контакта.', function() {
                                            tester.contactBar.section('E-Mail').input.fill('belezhkova@gmail.com');
                                            tester.contactBar.section('E-Mail').button('Сохранить').click();

                                            tester.contactsRequest().emailSearching().noData().receiveResponse();
                                            tester.contactUpdatingRequest().completeData().twoEmails().
                                                receiveResponse();
                                        });
                                    });
                                    it(
                                        'Изменяю значение полей имени. Нажимаю на кнопку "Сохранить". Отправлен ' +
                                        'запрос обновления контакта.',
                                    function() {
                                        tester.contactBar.section('ФИО').svg.click();

                                        tester.input.withPlaceholder('Фамилия (Обязательное поле)').fill('Неделчева');
                                        tester.input.withPlaceholder('Имя').fill('Роза');
                                        tester.input.withPlaceholder('Отчество').fill('Ангеловна');

                                        tester.button('Сохранить').click();
                                        tester.contactUpdatingRequest().completeData().anotherName().receiveResponse();
                                    });
                                    it(
                                        'Добавляю поле для ввода номера телефона. Ввожу номер телефона. Отправлен ' +
                                        'запрос обновления контакта.',
                                    function() {
                                        tester.contactBar.section('Телефоны').svg.click();
                                        tester.contactBar.section('Телефоны').input.fill('79162729534');
                                        tester.contactBar.section('Телефоны').button('Сохранить').click();

                                        tester.contactsRequest().phoneSearching().noData().receiveResponse();
                                        tester.contactUpdatingRequest().completeData().twoPhoneNumbers().
                                            receiveResponse();
                                    });
                                    it('Нажимаю на номер телефона. Совершается звонок.', function() {
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
                                    it('Нажимаю на превью вложения. Вложение скачивается.', function() {
                                        tester.chatHistory.message.atTime('12:15').preview.click();
                                        tester.resourcePayloadRequest().receiveResponse();

                                        tester.chatHistory.message.atTime('12:15').downloadedFile.
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
                                    it('Редактирование мессенджеров недоступно.', function() {
                                        tester.contactBar.
                                            section('Каналы связи').
                                            option('+7 (928) 381 09-88').
                                            putMouseOver();

                                        tester.contactBar.
                                            section('Каналы связи').
                                            option('+7 (928) 381 09-88').
                                            toolsIcon.
                                            expectNotToExist();
                                    });
                                    it('Имя выделено. Отображен контакт. Отображена история коммуникаций.', function() {
                                        tester.contactList.item('Балканска Берислава Силаговна').
                                            expectNotToBeSelected();
                                        tester.contactList.item('Бележкова Грета Ервиновна').expectToBeSelected();

                                        tester.chatHistory.message.atTime('12:13').expectToHaveNoStatus();

                                        tester.chatHistory.expectToHaveTextContent(
                                            '10 февраля 2020 ' +

                                            'Здравствуйте 12:12 ' +
                                            'Привет 12:13 ' +
                                            'Входящий звонок Запись звонка 53:40 12:14 ' +
                                            'png 925 B heart.png 12:15'
                                        );

                                        tester.contactBar.
                                            section('E-Mail').
                                            option('endlesssprinп.of@comagic.dev').
                                            svg.
                                            expectNotToExist();

                                        tester.contactBar.
                                            section('Каналы связи').
                                            option('+7 (928) 381 09-88').
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
                                            '+7 (928) 381 09-88 ' +
                                            '+7 (928) 381 09-28 ' +

                                            'Персональный менеджер ' +
                                            'Господинова Николина'
                                        );

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

                                            tester.contactCommunicationsRequest().anotherContact().receiveResponse();
                                            tester.contactRequest().anotherContact().receiveResponse();

                                            tester.chatHistory.expectToHaveTextContent(
                                                '10 февраля 2020 ' +

                                                'Здравствуйте 12:12 ' +
                                                'Привет 12:13 ' +
                                                'Входящий звонок Запись звонка 53:40 12:14 ' +
                                                'png 925 B heart.png 12:15'
                                            );
                                        });
                                        it('Получена следующая страница.', function() {
                                            tester.chatHistory.expectTextContentToHaveSubstringsConsideringOrder(
                                                '30 октября 2019 ' +

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
                                it('Получено сообщение с аудио-вложением.', function() {
                                    contactCommunicationsRequest.audioAttachment().receiveResponse();

                                    tester.chatHistory.message.atTime('12:14').ellipsisButton.click();
                                    tester.button('Скачать').click();

                                    tester.resourcePayloadRequest().anotherFile().receiveResponse();

                                    tester.chatHistory.message.atTime('12:14').downloadedFile.
                                        expectToHaveName('call.mp3').
                                        expectToHaveContent('8gj23o2u4g2j829sk');
                                });
                                it(
                                    'URL записи звонка не был получен. Отображено сообщение о входящем звонке.',
                                function() {
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
                            describe('Получена история коммуникаций.', function() {
                                beforeEach(function() {
                                    contactCommunicationsRequest.receiveResponse();
                                });

                                it(
                                    'Для контакта не установлен персональный менеджер. Выбираю другой контакт. Для ' +
                                    'контакта установлен персональный менеджер.',
                                function() {
                                    contactRequest.noPersonalManager().receiveResponse();

                                    tester.contactList.item('Белоконска-Вражалска Калиса Еньовна').click();

                                    tester.contactCommunicationsRequest().anotherContact().receiveResponse();
                                    tester.contactRequest().anotherContact().receiveResponse();

                                    tester.contactBar.
                                        section('Персональный менеджер').
                                        select.
                                        expectNotToExist();
                                });
                                it(
                                    'В качестве E-Mail используется пустая строка. Поле для ввода почты скрыто.',
                                function() {
                                    contactRequest.emptyEmailList().receiveResponse();

                                    tester.contactBar.section('E-Mail').input.expectNotToExist(); 
                                    tester.contactBar.section('E-Mail').option('').expectNotToExist();
                                });
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
                    it('Не удалось получить данные. Запрос не отправлен повторно.', function() {
                        contactsRequest.failed().receiveResponse();
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
                            tester.usersRequest().forContacts().receiveResponse();
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

                                    tester.contactBar.section('ФИО').content.button('Сохранить').click()

                                    tester.contactUpdatingRequest().
                                        anotherName().
                                        anotherContactId().
                                        receiveResponse();

                                    tester.contactList.item('Неделчева Роза Ангеловна').expectToBeVisible();
                                });
                                it('В списке отображен новый контакт.', function() {
                                    tester.contactList.item('Неделчева').expectToBeSelected();
                                    tester.contactList.item('Балканска Берислава Силаговна').expectNotToBeSelected();
                                });
                            });
                            it(
                                'Стираю значение в поле "Фамилия". Поле фамилии отмечено как невалидное. Кнопка ' +
                                '"Создать контакт" заблокирована.',
                            function() {
                                tester.input.withPlaceholder('Фамилия (Обязательное поле)').clear();

                                tester.input.withPlaceholder('Фамилия (Обязательное поле)').expectToHaveError();
                                tester.input.withPlaceholder('Имя').expectNotToHaveError();
                                tester.button('Создать контакт').expectToBeDisabled();
                            });
                            it('В поле "Фамилия" введен номер телефона.', function() {
                                tester.input.withPlaceholder('Фамилия (Обязательное поле)').
                                    expectToHaveValue('79161234567');
                                tester.input.withPlaceholder('Имя').expectToHaveValue('');
                                tester.input.withPlaceholder('Отчество').expectToHaveValue('');

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
                                'Кнопка с плюсом рядом с текстом "Персональный менеджер" скрыта. Кнопка "Сохранить" ' +
                                'заблокирована.',
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
                        tester.contactCommunicationsRequest().receiveResponse();
                        tester.usersRequest().forContacts().receiveResponse();
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

                            'Каналы связи ' +
                            '+7 (928) 381 09-88 ' +
                            '+7 (928) 381 09-28'
                        );
                    });
                });
            });
            describe('Номер должен быть скрыт. Открываю карточку контакта.', function() {
                beforeEach(function() {
                    settingsRequest.shouldHideNumbers().receiveResponse();
                    tester.slavesNotification().twoChannels().enabled().expectToBeSent();

                    tester.othersNotification().widgetStateUpdate().isNeedHideNumbers().expectToBeSent();
                    tester.othersNotification().updateSettings().shouldNotPlayCallEndingSignal().
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
                    tester.slavesNotification().twoChannels().available().userDataFetched().
                        expectToBeSent();

                    tester.button('Контакты').click();
                    tester.contactsRequest().differentNames().receiveResponse();

                    tester.contactList.item('Бележкова Грета Ервиновна').click();

                    const requests = ajax.inAnyOrder();

                    contactCommunicationsRequest = tester.contactCommunicationsRequest().expectToBeSent(requests);

                    const contactRequest = tester.contactRequest().expectToBeSent(requests),
                        usersRequest = tester.usersRequest().forContacts().expectToBeSent(requests);

                    requests.expectToBeSent();

                    contactRequest.receiveResponse();
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

                    tester.select.option('Редактировать').expectToBeDisabled();
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

                const requests = ajax.inAnyOrder();

                const contactCommunicationsRequest = tester.contactCommunicationsRequest().expectToBeSent(requests),
                    contactRequest = tester.contactRequest().expectToBeSent(requests),
                    usersRequest = tester.usersRequest().forContacts().expectToBeSent(requests);

                requests.expectToBeSent();

                contactCommunicationsRequest.receiveResponse();
                contactRequest.receiveResponse();
                usersRequest.receiveResponse();

                tester.contactBar.section('Телефоны').anchor('79162729533').click();
                tester.softphone.expectTextContentToHaveSubstring('Используется на другом устройстве');
            });
        });
        describe('Редактирование контактов недоступно. Открываю раздел контактов. Нажимаю на имя.', function() {
            beforeEach(function() {
                accountRequest.addressBookUpdatingUnavailable().receiveResponse();

                const requests = ajax.inAnyOrder();

                reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
                const reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                    reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                    secondAccountRequest = tester.accountRequest().expectToBeSent(requests);

                requests.expectToBeSent();

                reportsListRequest.receiveResponse();
                reportTypesRequest.receiveResponse();
                secondAccountRequest.addressBookUpdatingUnavailable().receiveResponse();
                reportGroupsRequest.receiveResponse();

                tester.configRequest().softphone().receiveResponse();

                tester.masterInfoMessage().receive();
                tester.slavesNotification().expectToBeSent();
                tester.slavesNotification().additional().expectToBeSent();
                tester.masterInfoMessage().tellIsLeader().expectToBeSent();

                tester.notificationChannel().tellIsLeader().expectToBeSent();
                tester.notificationChannel().applyLeader().expectToBeSent();
                tester.notificationChannel().applyLeader().expectToBeSent();

                tester.authCheckRequest().receiveResponse();
                statusesRequest = tester.statusesRequest().expectToBeSent();

                settingsRequest = tester.settingsRequest().expectToBeSent();
                tester.talkOptionsRequest().receiveResponse();
                tester.permissionsRequest().receiveResponse();

                notificationTester.grantPermission();

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

                tester.button('Контакты').click();
                tester.contactsRequest().differentNames().receiveResponse();

                tester.contactList.item('Бележкова Грета Ервиновна').click();

                {
                    const requests = ajax.inAnyOrder();

                    const contactCommunicationsRequest = tester.contactCommunicationsRequest().expectToBeSent(requests),
                        contactRequest = tester.contactRequest().expectToBeSent(requests),
                        usersRequest = tester.usersRequest().forContacts().expectToBeSent(requests);

                    requests.expectToBeSent();

                    contactRequest.receiveResponse();
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

            tester.masterInfoMessage().receive();
            tester.slavesNotification().expectToBeSent();
            tester.slavesNotification().additional().expectToBeSent();
            tester.masterInfoMessage().tellIsLeader().expectToBeSent();

            tester.notificationChannel().tellIsLeader().expectToBeSent();
            tester.notificationChannel().applyLeader().expectToBeSent();
            tester.notificationChannel().applyLeader().expectToBeSent();

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
