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

    describe('Открываю новый личный кабинет. Фичафлаг софтфона включен. Вкладка является ведущей.', function() {
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
            tester.accountRequest().receiveResponse();

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

        describe(
            'Получены права. Получены настройки софтфона. Получен доступ к микрофону. SIP-линия ' +
            'зарегистрирована. Получены данные для отчета. SIP-регистрация завершена. Открываю раздел ' +
            '"История звонков".',
        function() {
            let authenticatedUserRequest,
                registrationRequest,
                callsRequest;

            beforeEach(function() {
                permissionsRequest.receiveResponse();

                settingsRequest.receiveResponse();
                tester.slavesNotification().twoChannels().enabled().expectToBeSent();

                tester.connectEventsWebSocket();
                tester.slavesNotification().twoChannels().enabled().softphoneServerConnected().expectToBeSent();

                tester.connectSIPWebSocket();
                tester.slavesNotification().twoChannels().webRTCServerConnected().softphoneServerConnected().
                    expectToBeSent();

                tester.othersNotification().widgetStateUpdate().expectToBeSent();
                tester.othersNotification().updateSettings().shouldNotPlayCallEndingSignal().expectToBeSent();

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

                reportGroupsRequest.receiveResponse();

                registrationRequest.receiveResponse();
                tester.slavesNotification().twoChannels().available().userDataFetched().
                    expectToBeSent();

                tester.button('История звонков').click();

                callsRequest = tester.callsRequest().fromFirstWeekDay().firstPage().
                    expectToBeSent();
                tester.marksRequest().receiveResponse();
            });

            describe('Все звонки успешны.', function() {
                beforeEach(function() {
                    callsRequest.receiveResponse();
                });

                describe('Нажимаю на кнопку "Необработанные".', function() {
                    beforeEach(function() {
                        tester.radioButton('Необработанные').click();

                        tester.groupsRequest().receiveResponse();
                        tester.notProcessedCallsRequest().isProcessedByAny().receiveResponse();
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

                            tester.notProcessedCallsRequest().
                                isProcessedByAny().
                                external().
                                receiveResponse();

                            tester.marksRequest().receiveResponse();
                        });
                        it('Выбираю опцию "Внутренние". Отправлен запрос истории звонков.', function() {
                            tester.select.option('Внутренние').click();

                            tester.notProcessedCallsRequest().
                                isProcessedByAny().
                                internal().
                                receiveResponse();

                            tester.marksRequest().receiveResponse();
                        });
                    });
                    describe('Открываю выпадающий список "Направления".', function() {
                        beforeEach(function() {
                            tester.select.withValue('Направления: Все').click();
                        });

                        it('Выбираю опцию "Входящие". Отправлен запрос истории звонков.', function() {
                            tester.select.option('Входящие').click();

                            tester.notProcessedCallsRequest().
                                isProcessedByAny().
                                incoming().
                                receiveResponse();

                            tester.marksRequest().receiveResponse();
                        });
                        it('Выбираю опцию "Исходящие". Отправлен запрос истории звонков.', function() {
                            tester.select.option('Исходящие').click();

                            tester.notProcessedCallsRequest().
                                isProcessedByAny().
                                outgoing().
                                receiveResponse();

                            tester.marksRequest().receiveResponse();
                        });
                    });
                    it('Выбираю группы. Отправлен запрос истории звонков.', function() {
                        tester.select.withPlaceholder('Группы').click();

                        tester.select.option('Отдел дистрибуции').click();

                        tester.notProcessedCallsRequest().isProcessedByAny().group().receiveResponse();
                        tester.marksRequest().receiveResponse();

                        tester.select.option('Отдел по работе с ключевыми клиентами').click();

                        tester.notProcessedCallsRequest().isProcessedByAny().group().thirdGroup().
                            receiveResponse();
                        tester.marksRequest().receiveResponse();

                        tester.select.option('Отдел дистрибуции').expectToBeSelected();
                        tester.select.option('Отдел региональных продаж').expectNotToBeSelected();
                        tester.select.option('Отдел по работе с ключевыми клиентами').expectToBeSelected(true);
                    });
                    it('Снимаю отметку со свитчбокса. Отправлен запрос истории звонков.', function() {
                        tester.switchButton.click();

                        tester.notProcessedCallsRequest().isNotProcessedByAny().receiveResponse();
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
                            'Теги ' +
                            'Комментарий ' +
                            'Длительность ' +
                            'Запись ' +

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
                describe('Ввожу значеие в поле поиска.', function() {
                    beforeEach(function() {
                        tester.input.withPlaceholder('Имя или телефон').input('qwe12');
                    });

                    describe('Проходит некоторое время.', function() {
                        beforeEach(function() {
                            spendTime(499);
                            Promise.runAll(false, true);
                        });

                        describe('Ввожу еще некоторые символы. ', function() {
                            beforeEach(function() {
                                tester.input.withPlaceholder('Имя или телефон').input('3');
                            });

                            it('Проходит некоторое время. История звонков не была запрошена.', function() {
                                spendTime(1);
                                Promise.runAll(false, true);
                            });
                            it('Значение введено в поле поиска.', function() {
                                tester.input.withPlaceholder('Имя или телефон').expectToHaveValue('qwe123');
                            });
                        });
                        it('Проходит еще некоторое время. Отправлен запрос истории звонков.', function() {
                            spendTime(1);
                            Promise.runAll(false, true);

                            tester.callsRequest().fromFirstWeekDay().search('qwe12').firstPage().
                                receiveResponse();
                            tester.marksRequest().receiveResponse();
                        });
                        it('История звонков не была запрошена.', function() {
                            ajax.expectNoRequestsToBeSent();
                        });
                    });
                    it('Значение введено в поле поиска.', function() {
                        tester.input.withPlaceholder('Имя или телефон').expectToHaveValue('qwe12');
                    });
                });
                describe('Нажимаю на кнопку тегов.', function() {
                    beforeEach(function() {
                        tester.table.row.first.column.withHeader('Теги').svg.click();
                    });

                    describe(
                        'Нажимаю на кнопку удаления тег "Нецелевой контакт". Отправлен запрос удаления тега.',
                    function() {
                        beforeEach(function() {
                            tester.select.tag('Нецелевой контакт').closeButton.click();
                            tester.markDeletingRequest().receiveResponse();
                        });

                        it('Удаляю все теги. Теги не отмечены.', function() {
                            tester.select.tag('Отложенный звонок').closeButton.click();
                            tester.markDeletingRequest().anotherMark().receiveResponse();

                            tester.select.tag('Генератор лидов').expectNotToExist();
                            tester.select.tag('Нецелевой контакт').expectNotToExist();
                            tester.select.tag('Отложенный звонок').expectNotToExist();

                            tester.select.option('Генератор лидов').expectNotToBeSelected();
                            tester.select.option('Нецелевой контакт').expectNotToBeSelected();
                            tester.select.option('Отложенный звонок').expectNotToBeSelected();
                        });
                        it('Тег не отмечен.', function() {
                            tester.select.tag('Генератор лидов').expectNotToExist();
                            tester.select.tag('Нецелевой контакт').expectNotToExist();
                            tester.select.tag('Отложенный звонок').expectToBeVisible();

                            tester.select.option('Генератор лидов').expectNotToBeSelected();
                            tester.select.option('Нецелевой контакт').expectNotToBeSelected();
                            tester.select.option('Отложенный звонок').expectToBeSelected();
                        });
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
                            'Комментарий ' +
                            'Длительность ' +
                            'Запись ' +

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

                        tester.select.tag('Нецелевой контакт').expectToBeVisible();
                        tester.select.tag('Отложенный звонок').expectToBeVisible();
                        tester.select.tag('Генератор лидов').expectNotToExist();
                    });
                    it('Отмечены опции выранных тегов.', function() {
                        tester.select.tag('Генератор лидов').expectNotToExist();
                        tester.select.option('Нецелевой контакт').expectToBeVisible();
                        tester.select.option('Отложенный звонок').expectToBeVisible();

                        tester.select.option('Генератор лидов').expectNotToBeSelected();
                        tester.select.option('Нецелевой контакт').expectToBeSelected();
                        tester.select.option('Отложенный звонок').expectToBeSelected();
                    });
                });
                describe('Открываю окно добавления комментария.', function() {
                    beforeEach(function() {
                        tester.
                            table.
                            row.atIndex(1).
                            column.withHeader('Комментарий').
                            svg.
                            click();
                    });
                    
                    describe('Ввожу непустой комментарий.', function() {
                        beforeEach(function() {
                            tester.modalWindow.textarea.fill('   Другой комментарий ');

                            tester.button('Сохранить').click();
                            tester.commentUpdatingRequest().anotherCall().receiveResponse();
                        });

                        it('Открываю окно редактирования комментария. Комментарий изменен.', function() {
                            tester.
                                table.
                                row.atIndex(1).
                                column.withHeader('Комментарий').
                                svg.
                                click();

                            tester.modalWindow.textarea.expectToHaveValue('Другой комментарий');
                        });
                        it('Комментарий добавлен.', function() {
                            tester.
                                table.
                                row.first.
                                column.withHeader('Комментарий').
                                svg.
                                expectToHaveClass(
                                    'comment_svg__cmg-softphone-call-history-comment-cell'
                                );

                            tester.
                                table.
                                row.atIndex(1).
                                column.withHeader('Комментарий').
                                svg.
                                expectToHaveClass(
                                    'comment_svg__cmg-softphone-call-history-comment-cell'
                                );
                        });
                    });
                    it('Ввожу пробелы. Кнопка "Сохранить" заблокирована.', function() {
                        tester.modalWindow.textarea.fill('  ');
                        tester.button('Сохранить').expectToHaveAttribute('disabled');
                    });
                    it('Кнопка "Сохранить" заблокирована.', function() {
                        tester.button('Сохранить').expectToHaveAttribute('disabled');
                    });
                });
                describe('Нажимаю на кнопку комментария.', function() {
                    beforeEach(function() {
                        tester.table.row.first.column.withHeader('Комментарий').svg.click();
                    });

                    it('Изменяю значение поля.', function() {
                        tester.modalWindow.textarea.fill('Другой комментарий');

                        tester.button('Сохранить').click();
                        tester.commentUpdatingRequest().receiveResponse();
                    });
                    it(
                        'Нажимаю на кнпоку закрытие модального окна. Окно закрыто.',
                    function() {
                        tester.modalWindow.closeButton.click();
                        tester.modalWindow.expectNotToExist();
                    });
                    it('Отображен комментарий.', function() {
                        tester.modalWindow.textarea.expectToHaveValue('Некий комментарий');
                    });
                });
                describe(
                    'Нажимаю на кнопку проигрывания записи. Запись проигрывается. Нажимаю на кнопку закрытия плеера.',
                function() {
                    beforeEach(function() {
                        tester.table.row.first.column.withHeader('Запись').playIcon.click();
                        
                        tester.talkRecordRequest().receiveResponse();
                        audioDecodingTester.accomplishAudioDecoding();

                        tester.closeButton.click();
                    });

                    it('Нажимаю на кнопку проигрывания записи. Плеер отображается.', function() {
                        tester.table.row.first.column.withHeader('Запись').playIcon.click();
                        tester.closeButton.expectToBeVisible();
                    });
                    it('Плеер скрыт.', function() {
                        tester.closeButton.expectNotToExist();
                    });
                });
                describe('Открываю календарь', function() {
                    beforeEach(function() {
                        tester.calendarField.click();
                    });

                    describe('Изменяю фильтр по дате.', function() {
                        beforeEach(function() {
                            tester.calendarField.popup.leftButton.click();

                            tester.calendarField.popup.firstMonthPanel.day(15).click();
                            tester.calendarField.popup.secondMonthPanel.day(18).click();
                        });

                        it('Нажимаю на кнопку "Применить". Отправлен запрос истории звонков.', function() {
                            tester.calendarField.popup.button('Применить').click();

                            tester.callsRequest().changeDate().firstPage().receiveResponse();
                            tester.marksRequest().receiveResponse();

                            tester.calendarField.expectToHaveValue('15 ноя 2019 - 18 дек 2019');
                        });
                        it('Поля даты заполнены.', function() {
                            tester.calendarField.popup.input.first.expectToHaveValue('15.11.2019');
                            tester.calendarField.popup.input.atIndex(1).expectToHaveValue('18.12.2019');
                        });
                    });
                    it(
                        'Изменяю фильтр по дате вручную. Нажимаю на кнопку "Применить". Отправлен запрос истории ' +
                        'звонков.',
                    function() {
                        tester.calendarField.popup.input.first.fill('15.11.2019').pressEnter();
                        tester.calendarField.popup.input.atIndex(1).fill('18.12.2019').pressEnter();

                        tester.calendarField.popup.button('Применить').click();
                        
                        tester.callsRequest().changeDate().firstPage().receiveResponse();
                        tester.marksRequest().receiveResponse();

                        tester.calendarField.expectToHaveValue('15 ноя 2019 - 18 дек 2019');
                    });
                    it('Поля даты заполнены.', function() {
                        tester.calendarField.popup.input.first.expectToHaveValue('16.12.2019');
                        tester.calendarField.popup.input.atIndex(1).expectToHaveValue('19.12.2019');
                    });
                });
                it('Нажимаю на кнопку "Все". Отправлен запрос истории звонков.', function() {
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
                        'Теги ' +
                        'Комментарий ' +
                        'Длительность ' +
                        'Запись ' +

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
                it('Нажимаю на кнопку скачивания записи. Открыт выпадающий список записей.', function() {
                    tester.table.row.atIndex(1).column.withHeader('Запись').downloadIcon.click();

                    tester.select.option('baf9be6ace6b0cb2f9b0e1ed0738db1a.mp3').expectToBeVisible();
                    tester.select.option('2fj923fholfr32hlf498f8h18f1hfl1c.mp3').expectToBeVisible();
                });
                it('Нажимаю на ссылку в колонке "Номер абонента". Совершается звонок.', function() {
                    tester.table.row.first.column.withHeader('Номер абонента').phoneLink.click();

                    tester.firstConnection.connectWebRTC();
                    tester.allowMediaInput();

                    const outboundCall = tester.outboundCall().setNumberFromCallsGrid().expectToBeSent();

                    tester.slavesNotification().
                        available().
                        thirdPhoneNumber().
                        userDataFetched().
                        twoChannels().
                        sending().
                        expectToBeSent();

                    outboundCall.setRinging();

                    tester.slavesNotification().
                        thirdPhoneNumber().
                        available().
                        userDataFetched().
                        twoChannels().
                        progress().
                        expectToBeSent();
                    
                    tester.firstConnection.callTrackHandler();
                    tester.numaRequest().anotherNumber().receiveResponse();
                });
                it('Нажимаю на ссылку в колонке "ФИО контакта". Совершается звонок.', function() {
                    tester.table.row.first.column.withHeader('ФИО контакта').phoneLink.click();

                    tester.firstConnection.connectWebRTC();
                    tester.allowMediaInput();

                    const outboundCall = tester.outboundCall().setNumberFromCallsGrid().expectToBeSent();

                    tester.slavesNotification().
                        available().
                        thirdPhoneNumber().
                        userDataFetched().
                        twoChannels().
                        sending().
                        expectToBeSent();

                    outboundCall.setRinging();

                    tester.slavesNotification().
                        thirdPhoneNumber().
                        available().
                        userDataFetched().
                        twoChannels().
                        progress().
                        expectToBeSent();
                    
                    tester.firstConnection.callTrackHandler();
                    tester.numaRequest().anotherNumber().receiveResponse();
                });
                it('Нажимаю на кнопку второй страницы. Отправлен запрос второй страницы.', function() {
                    tester.table.pagingPanel.pageButton('2').click();

                    tester.callsRequest().fromFirstWeekDay().secondPage().receiveResponse();
                    tester.marksRequest().receiveResponse();

                    tester.table.pagingPanel.pageButton('1').expectNotToBePressed();
                    tester.table.pagingPanel.pageButton('2').expectToBePressed();
                    tester.table.pagingPanel.pageButton('3').expectNotToExist();

                    tester.table.expectTextContentToHaveSubstringsConsideringOrder(
                        'Дата / время ' +
                        'ФИО контакта ' +
                        'Номер абонента ' +
                        'Теги ' +
                        'Комментарий ' +
                        'Длительность ' +
                        'Запись ' +

                        '17 мая 2021 12:02 ' +
                        'Сотирова Атанаска ' +
                        '+7 (495) 023-06-27 ' +
                        '00:00:22',

                        '16 мая 2021 11:41 ' +
                        'Сотирова Атанаска ' +
                        '+7 (495) 023-06-27 ' +
                        '00:00:22 ' +

                        '1 2 15 строк Страница 10'
                    );
                });
                it(
                    'Выбираю другое количество строк на странице. Отправлен запрос истории звонков.',
                function() {
                    tester.table.pagingPanel.select.click();
                    tester.select.option('25').click();

                    tester.callsRequest().fromFirstWeekDay().anotherLimit().receiveResponse();
                    tester.marksRequest().receiveResponse();

                    tester.table.expectTextContentToHaveSubstringsConsideringOrder(
                        'Дата / время ' +
                        'ФИО контакта ' +
                        'Номер абонента ' +
                        'Теги ' +
                        'Комментарий ' +
                        'Длительность ' +
                        'Запись ' +

                        '19 дек 2019 08:03 ' +
                        'Гяурова Марийка ' +
                        '+7 (495) 023-06-25 ' +
                        'Нецелевой контакт, Отложенный звонок ' +
                        '00:00:20',

                        '14 дек 2019 10:59 ' +
                        'Сотирова Атанаска ' +
                        '+7 (495) 023-06-27 ' +
                        '00:00:22 ' +

                        '1 15 строк Страница 25'
                    );
                });
                it('Отображена история звонков.', function() {
                    tester.calendarField.expectToHaveValue('16 дек 2019 - 19 дек 2019');

                    tester.radioButton('Мои').expectToBeSelected();
                    tester.radioButton('Все').expectNotToBeSelected();
                    tester.radioButton('Необработанные').expectNotToBeSelected();

                    tester.select.withValue('Звонки: Все').expectToBeDisaled();
                    tester.select.withValue('Направления: Все').expectToBeDisaled();
                    tester.select.withPlaceholder('Группы').expectToBeDisaled();
                    tester.switchButton.expectToBeDisaled();

                    tester.table.row.first.column.first.svg.
                        expectToHaveClass('incoming_svg__cmg-direction-icon');
                    tester.table.row.atIndex(1).column.first.svg.
                        expectToHaveClass('outgoing_svg__cmg-direction-icon');

                    tester.table.pagingPanel.pageButton('1').expectToBePressed();
                    tester.table.pagingPanel.pageButton('2').expectNotToBePressed();
                    tester.table.pagingPanel.pageButton('3').expectNotToExist();

                    tester.table.row.first.
                        expectNotToHaveClass('cmg-softphone-call-history-failed-call-row');

                    tester.
                        table.
                        row.first.
                        column.withHeader('Комментарий').
                        svg.
                        expectToHaveClass(
                            'comment_svg__cmg-softphone-call-history-comment-cell'
                        );

                    tester.
                        table.
                        row.atIndex(1).
                        column.withHeader('Комментарий').
                        svg.
                        expectToHaveClass(
                            'add_svg__cmg-softphone-call-history-comment-cell'
                        );

                    tester.table.expectTextContentToHaveSubstringsConsideringOrder(
                        'Дата / время ' +
                        'ФИО контакта ' +
                        'Номер абонента ' +
                        'Теги ' +
                        'Комментарий ' +
                        'Длительность ' +
                        'Запись ' +

                        '19 дек 2019 08:03 ' +
                        'Гяурова Марийка ' +
                        '+7 (495) 023-06-25 ' +
                        'Нецелевой контакт, Отложенный звонок ' +
                        '00:00:20 ' +

                        '18 дек 2019 18:08 ' +
                        'Манова Тома ' +
                        '+7 (495) 023-06-26 ' +
                        '00:00:21',

                        '15 дек 2019 17:25 ' +
                        'Сотирова Атанаска ' +
                        '+7 (495) 023-06-27 ' +
                        '00:00:22 ' +

                        '1 2 15 строк Страница 10'
                    );
                });
            });
            describe('Есть звонки трансфера.', function() {
                beforeEach(function() {
                    callsRequest = callsRequest.transferCall();
                });

                it('Есть пропущенные звонки. Звонки трансфера отличаются от обычных.', function() {
                    callsRequest.isFailed().receiveResponse();

                    tester.table.row.first.column.first.svg.
                        expectToHaveClass('transfer_incoming_failed_svg__cmg-direction-icon');
                    tester.table.row.atIndex(1).column.first.svg.
                        expectToHaveClass('transfer_outgoing_failed_svg__cmg-direction-icon');
                });
                it('Звонки трансфера отличаются от обычных.', function() {
                    callsRequest.receiveResponse();

                    tester.table.row.first.column.first.svg.
                        expectToHaveClass('transfer_incoming_successful_svg__cmg-direction-icon');
                    tester.table.row.atIndex(1).column.first.svg.
                        expectToHaveClass('transfer_outgoing_successful_svg__cmg-direction-icon');
                });
            });
            it('Общее количество записей не было получено. Отображена история звонков.', function() {
                callsRequest.noTotal().receiveResponse();

                tester.table.expectTextContentToHaveSubstringsConsideringOrder(
                    'Дата / время ' +
                    'ФИО контакта ' +
                    'Номер абонента ' +
                    'Теги ' +
                    'Комментарий ' +
                    'Длительность ' +
                    'Запись ' +

                    '19 дек 2019 08:03 ' +
                    'Гяурова Марийка ' +
                    '+7 (495) 023-06-25 ' +
                    'Нецелевой контакт, Отложенный звонок ' +
                    '00:00:20 ',

                    '14 дек 2019 10:59 ' +
                    'Сотирова Атанаска ' +
                    '+7 (495) 023-06-27 ' +
                    '00:00:22'
                );
            });
            it('Записи для таблицы не были получены. Панель пагинации скрыта.', function() {
                callsRequest.noCalls().receiveResponse();
                tester.table.pagingPanel.expectNotToExist();
            });
            it(
                'Есть неуспешные звонки. Строки с неуспешными звонками внешне отличаются от строк с ' +
                'успешными звонками.',
            function() {
                callsRequest.isFailed().receiveResponse();

                tester.table.row.first.
                    expectToHaveClass('cmg-softphone-call-history-failed-call-row');
            });
        });
        describe('Обновление комментария недоступно. Открываю раздел "История звонков".', function() {
            beforeEach(function() {
                permissionsRequest.disallowCallSessionCommentingUpdate().receiveResponse();
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

                tester.callsRequest().fromFirstWeekDay().firstPage().receiveResponse();
                tester.marksRequest().receiveResponse();
            });

            describe('Нажимаю на кнопку комментария там где комментарий есть.', function() {
                beforeEach(function() {
                    tester.table.row.first.column.withHeader('Комментарий').svg.click();
                });

                it('Стираю комментарий. Кнопка сохранения доступна.', function() {
                    tester.modalWindow.textarea.clear();
                    tester.button('Сохранить').expectNotToHaveAttribute('disabled');
                });
                it('Ввожу другой комментарий. Кнопка сохранения заблокирована.', function() {
                    tester.modalWindow.textarea.fill('Другой комментарий');
                    tester.button('Сохранить').expectToHaveAttribute('disabled');
                });
            });
            it(
                'Нажимаю на кнопку комментария там где комментария нет. Ввожу комментарий. Кнопка сохранения ' +
                'доступна.',
            function() {
                tester.table.row.atIndex(1).column.withHeader('Комментарий').svg.click();
                tester.modalWindow.textarea.fill('Другой комментарий');

                tester.button('Сохранить').expectNotToHaveAttribute('disabled');
            });
        });
        describe('Добавление комментария недоступно. Открываю раздел "История звонков".', function() {
            beforeEach(function() {
                permissionsRequest.disallowCallSessionCommentingInsert().receiveResponse();
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

                tester.callsRequest().fromFirstWeekDay().firstPage().receiveResponse();
                tester.marksRequest().receiveResponse();
            });

            describe('Нажимаю на кнопку комментария там где комментарий есть.', function() {
                beforeEach(function() {
                    tester.table.row.first.column.withHeader('Комментарий').svg.click();
                });

                it('Стираю комментарий. Кнопка сохранения доступна.', function() {
                    tester.modalWindow.textarea.clear();
                    tester.button('Сохранить').expectNotToHaveAttribute('disabled');
                });
                it('Ввожу другой комментарий. Кнопка сохранения доступна.', function() {
                    tester.modalWindow.textarea.fill('Другой комментарий');
                    tester.button('Сохранить').expectNotToHaveAttribute('disabled');
                });
            });
            it(
                'Нажимаю на кнопку комментария там где комментария нет. Ввожу комментарий. Кнопка сохранения ' +
                'заблокирована.',
            function() {
                tester.table.row.atIndex(1).column.withHeader('Комментарий').svg.click();
                tester.modalWindow.textarea.fill('Другой комментарий');

                tester.button('Сохранить').expectToHaveAttribute('disabled');
            });
        });
        describe('Удаление комментария недоступно. Открываю раздел "История звонков".', function() {
            beforeEach(function() {
                permissionsRequest.disallowCallSessionCommentingDelete().receiveResponse();
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

                tester.callsRequest().fromFirstWeekDay().firstPage().receiveResponse();
                tester.marksRequest().receiveResponse();
            });

            describe('Нажимаю на кнопку комментария там где комментарий есть.', function() {
                beforeEach(function() {
                    tester.table.row.first.column.withHeader('Комментарий').svg.click();
                });

                it('Стираю комментарий. Кнопка сохранения доступна.', function() {
                    tester.modalWindow.textarea.clear();
                    tester.button('Сохранить').expectToHaveAttribute('disabled');
                });
                it('Ввожу другой комментарий. Кнопка сохранения доступна.', function() {
                    tester.modalWindow.textarea.fill('Другой комментарий');
                    tester.button('Сохранить').expectNotToHaveAttribute('disabled');
                });
            });
            it(
                'Нажимаю на кнопку комментария там где комментария нет. Ввожу комментарий. Кнопка сохранения ' +
                'заблокирована.',
            function() {
                tester.table.row.atIndex(1).column.withHeader('Комментарий').svg.click();
                tester.modalWindow.textarea.fill('Другой комментарий');

                tester.button('Сохранить').expectNotToHaveAttribute('disabled');
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

            tester.callsRequest().fromFirstWeekDay().firstPage().receiveResponse();
            tester.marksRequest().receiveResponse();
        });
        it(
            'Просмотр комментариев недоступен. Открываю раздел "История звонков". Комментарии не отображатся.',
        function() {
            permissionsRequest.disallowCallSessionCommentingSelect().receiveResponse();
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

            tester.callsRequest().fromFirstWeekDay().firstPage().receiveResponse();
            tester.marksRequest().receiveResponse();

            tester.table.expectTextContentNotToHaveSubstring('Комментарий');
        });
        it(
            'Просмотр тегов недоступен. Открываю раздел "История звонков". Теги не отображатся.',
        function() {
            permissionsRequest.disallowTagManagementSelect().receiveResponse();
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

            tester.callsRequest().fromFirstWeekDay().firstPage().receiveResponse();
            tester.marksRequest().receiveResponse();

            tester.table.expectTextContentNotToHaveSubstring('Теги');
        });
    });
    it('Открываю историю звонков. Страница локализована.', function() {
        setNow('2019-12-19T12:10:06');

        const tester = new Tester({
            ...options,
            path: '/call-history',
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

        tester.callsRequest().fromFirstWeekDay().firstPage().receiveResponse();
        tester.marksRequest().receiveResponse();

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

        tester.body.expectTextContentToHaveSubstring('Скрыть обработанные другими группами');
        tester.body.expectTextContentNotToHaveSubstring('Hide calls processed by another groups');
    });
});
