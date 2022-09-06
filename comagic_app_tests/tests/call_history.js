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

            tester.masterInfoMessage().receive();
            tester.masterInfoMessage().tellIsLeader().expectToBeSent();

            tester.input.withFieldLabel('Логин').fill('botusharova');
            tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

            tester.button('Войти').click();

            tester.loginRequest().receiveResponse();
            accountRequest = tester.accountRequest().expectToBeSent();
        });

        describe('История звонков доступна.', function() {
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
                tester.statusesRequest().receiveResponse();

                settingsRequest = tester.settingsRequest().expectToBeSent();
                tester.talkOptionsRequest().receiveResponse();
                permissionsRequest = tester.permissionsRequest().expectToBeSent();
            });

            describe('Номера не должны быть скрыты.', function() {
                beforeEach(function() {
                    settingsRequest.receiveResponse();
                    tester.slavesNotification().twoChannels().enabled().expectToBeSent();

                    tester.othersNotification().widgetStateUpdate().expectToBeSent();
                    tester.othersNotification().updateSettings().shouldNotPlayCallEndingSignal().expectToBeSent();
                });

                describe(
                    'Получены права. Получены настройки софтфона. Получен доступ к микрофону. SIP-линия ' +
                    'зарегистрирована. Получены данные для отчета. SIP-регистрация завершена. Открываю раздел ' +
                    '"История звонков".',
                function() {
                    let authenticatedUserRequest,
                        registrationRequest,
                        callsRequest,
                        marksRequest;

                    beforeEach(function() {
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
                            userDataFetched().
                            expectToBeSent();

                        tester.button('История звонков').click();

                        callsRequest = tester.callsRequest().fromFirstWeekDay().firstPage().
                            expectToBeSent();
                        marksRequest = tester.marksRequest().expectToBeSent();
                    });

                    describe('Тэги получены.', function() {
                        beforeEach(function() {
                            marksRequest.receiveResponse();
                        });

                        describe('Все звонки успешны.', function() {
                            beforeEach(function() {
                                callsRequest.receiveResponse();
                            });

                            describe('Нажимаю на кнопку "Необработанные".', function() {
                                let notProcessedCallsRequest;

                                beforeEach(function() {
                                    tester.radioButton('Необработанные').click();

                                    tester.groupsRequest().receiveResponse();
                                    notProcessedCallsRequest = tester.notProcessedCallsRequest().isProcessedByAny().
                                        expectToBeSent();
                                    tester.marksRequest().receiveResponse();
                                });

                                describe('Данные получены.', function() {
                                    beforeEach(function() {
                                        notProcessedCallsRequest.receiveResponse();
                                    });

                                    describe('Нажимаю на кнопку "Выход". Вхожу в лк заново.', function() {
                                        let permissionsRequest;

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

                                            tester.eventsWebSocket.finishDisconnecting();
                                            tester.registrationRequest().expired().receiveResponse();

                                            tester.authLogoutRequest().receiveResponse();

                                            spendTime(2000);
                                            tester.webrtcWebsocket.finishDisconnecting();

                                            tester.input.withFieldLabel('Логин').fill('botusharova');
                                            tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                                            tester.button('Войти').click();

                                            tester.loginRequest().anotherAuthorizationToken().receiveResponse();
                                            tester.accountRequest().anotherAuthorizationToken().receiveResponse();

                                            tester.configRequest().softphone().receiveResponse();

                                            tester.masterInfoMessage().receive();
                                            tester.slavesNotification().expectToBeSent();
                                            tester.slavesNotification().additional().expectToBeSent();
                                            tester.masterInfoMessage().tellIsLeader().expectToBeSent();

                                            const requests = ajax.inAnyOrder();

                                            const secondAccountRequest = tester.accountRequest().
                                                anotherAuthorizationToken().expectToBeSent(requests);
                                            const authCheckRequest = tester.authCheckRequest().
                                                anotherAuthorizationToken().expectToBeSent(requests);

                                            requests.expectToBeSent();

                                            secondAccountRequest.receiveResponse();
                                            authCheckRequest.receiveResponse();

                                            tester.reportGroupsRequest().anotherAuthorizationToken().
                                                receiveResponse();
                                            tester.reportsListRequest().receiveResponse();
                                            tester.reportTypesRequest().receiveResponse();

                                            tester.statusesRequest().createExpectation().
                                                anotherAuthorizationToken().checkCompliance().receiveResponse();

                                            tester.settingsRequest().anotherAuthorizationToken().
                                                receiveResponse();

                                            tester.slavesNotification().
                                                twoChannels().
                                                enabled().
                                                expectToBeSent();

                                            tester.othersNotification().
                                                widgetStateUpdate().
                                                expectToBeSent();

                                            tester.othersNotification().
                                                updateSettings().
                                                shouldNotPlayCallEndingSignal().
                                                expectToBeSent();

                                            tester.talkOptionsRequest().receiveResponse();
                                            permissionsRequest = tester.permissionsRequest().expectToBeSent();
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
                                                userDataFetched().
                                                twoChannels().
                                                available().
                                                expectToBeSent();
                                        });

                                        it(
                                            'Получены права. Получены данные для таблицы истории. Вкладки "Все" и ' +
                                            '"Необработанные" заблокированы.',
                                        function() {
                                            permissionsRequest.disallowSoftphoneAllCallsStatSelect().receiveResponse();

                                            tester.callsRequest().fromFirstWeekDay().firstPage().receiveResponse();
                                            tester.marksRequest().receiveResponse();

                                            tester.radioButton('Мои').expectNotToExist();
                                            tester.radioButton('Все').expectNotToExist();
                                            tester.radioButton('Необработанные').expectNotToExist();
                                        });
                                        it('Таблица скрыта.', function() {
                                            tester.table.expectNotToExist();
                                        });
                                    });
                                    describe('Открываю выпадающий список "Звонки".', function() {
                                        beforeEach(function() {
                                            tester.select.withValue('Звонки: Все').click();
                                        });

                                        it('Выбираю опцию "Внешние". Отправлен запрос истории звонков.', function() {
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

                                        tester.notProcessedCallsRequest().
                                            isProcessedByAny().
                                            group().
                                            receiveResponse();

                                        tester.marksRequest().receiveResponse();

                                        tester.select.option('Отдел по работе с ключевыми клиентами').click();

                                        tester.notProcessedCallsRequest().
                                            isProcessedByAny().
                                            group().
                                            thirdGroup().
                                            receiveResponse();

                                        tester.marksRequest().receiveResponse();

                                        tester.select.option('Отдел дистрибуции').expectToBeSelected();
                                        tester.select.option('Отдел региональных продаж').expectNotToBeSelected();
                                        tester.select.option('Отдел по работе с ключевыми клиентами').
                                            expectToBeSelected();
                                    });
                                    it('Снимаю отметку со свитчбокса. Отправлен запрос истории звонков.', function() {
                                        tester.switchButton.click();

                                        tester.notProcessedCallsRequest().
                                            isNotProcessedByAny().
                                            receiveResponse();

                                        tester.marksRequest().receiveResponse();

                                        tester.switchButton.expectNotToBeChecked();
                                    });
                                    it('Отображена история звонков.', function() {
                                        tester.radioButton('Мои').expectNotToBeSelected();
                                        tester.radioButton('Все').expectNotToBeSelected();
                                        tester.radioButton('Необработанные').expectToBeSelected();

                                        tester.switchButton.expectToBeChecked();

                                        tester.table.row.first.
                                            expectToHaveClass('cmg-softphone-call-history-failed-call-row');
                                        tester.table.row.atIndex(1).
                                            expectNotToHaveClass('cmg-softphone-call-history-failed-call-row');

                                        tester.table.expectTextContentToHaveSubstring(
                                            'Дата / время ' +
                                            'ФИО контакта ' +
                                            'Номер абонента ' +
                                            'Теги ' +
                                            'Комментарий ' +
                                            'Длительность ' +
                                            'Запись ' +

                                            '19 дек 2019 08:03 ' +
                                            'Тодорова Гера ' +
                                            '+7 (495) 023-06-25 ' +
                                            '00:00:20 ' +

                                            '19 дек 2019 10:13 ' +
                                            'Михайлова Врабка ' +
                                            '+7 (495) 023-06-26 ' +
                                            '00:00:24'
                                        );
                                    });
                                });
                                it('Нет имени. Отображен номер вместо имени.', function() {
                                    notProcessedCallsRequest.noContactName().receiveResponse();

                                    tester.table.expectTextContentToHaveSubstring(
                                        '19 дек 2019 10:13 ' +
                                        '+7 (495) 023-06-26 ' +
                                        '+7 (495) 023-06-26 ' +
                                        '00:00:24'
                                    );
                                });
                                it('Не удалось получить данные. Таблица пуста.', function() {
                                    notProcessedCallsRequest.serverError().receiveResponse();
                                    tester.table.expectTextContentToHaveSubstring('Нет данных');
                                });
                            });
                            describe('Ввожу значеие в поле поиска.', function() {
                                beforeEach(function() {
                                    tester.input.withPlaceholder('Имя или телефон').input('qwe12');
                                });

                                describe('Проходит некоторое время.', function() {
                                    beforeEach(function() {
                                        spendTime(499);
                                    });

                                    describe('Ввожу еще некоторые символы. ', function() {
                                        beforeEach(function() {
                                            tester.input.withPlaceholder('Имя или телефон').input('3');
                                        });

                                        it('Проходит некоторое время. История звонков не была запрошена.', function() {
                                            spendTime(1);
                                        });
                                        it('Значение введено в поле поиска.', function() {
                                            tester.input.withPlaceholder('Имя или телефон').expectToHaveValue('qwe123');
                                        });
                                    });
                                    it('Проходит еще некоторое время. Отправлен запрос истории звонков.', function() {
                                        spendTime(1);

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
                                    'Нажимаю на кнопку удаления тег "Нецелевой контакт". Отправлен запрос удаления ' +
                                    'тега.',
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

                                        tester.button('Редактировать').click();
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
                                    'Изменяю фильтр по дате вручную. Нажимаю на кнопку "Применить". Отправлен запрос ' +
                                    'истории звонков.',
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
                            describe('Нажимаю на кнопку комментария.', function() {
                                beforeEach(function() {
                                    tester.table.row.first.column.withHeader('Комментарий').svg.click();
                                });

                                describe('Нажимаю на кнопку "Редактировать".', function() {
                                    beforeEach(function() {
                                        tester.button('Редактировать').click();
                                    });

                                    it(
                                        'Изменяю значение поля. Нажимаю на кнопку "Сохранить". Значение сохраняется.',
                                    function() {
                                        tester.modalWindow.textarea.fill('Другой комментарий');

                                        tester.button('Сохранить').click();
                                        tester.commentUpdatingRequest().receiveResponse();
                                    });
                                    it('Отображен комментарий.', function() {
                                        tester.modalWindow.textarea.expectToHaveValue([
                                            'Некий https://ya.ru комментарий ' +
                                            'http://ya.ru http тоже можно ' +
                                            'hhttp://ya.ru уже нельзя',
                                            'ищет на всех https://go.comagic.ru/', 'строках'
                                        ].join("\n"));
                                    });
                                });
                                it('Нажимаю на кнпоку закрытие модального окна. Окно закрыто.', function() {
                                    tester.modalWindow.closeButton.click();
                                    tester.modalWindow.expectNotToExist();
                                });
                                it('Отображен комментарий.', function() {
                                    tester.modalWindow.expectToHaveTextContent(
                                        'Комментарий ' +

                                        'Некий https://ya.ru комментарий ' +
                                        'http://ya.ru http тоже можно ' +
                                        'hhttp://ya.ru уже нельзя ' +
                                        'ищет на всех https://go.comagic.ru/ строках ' +

                                        'Редактировать ' +
                                        'Отмена Сохранить'
                                    );

                                    tester.modalWindow.
                                        anchor('https://ya.ru').
                                        expectAttributeToHaveValue('href', 'https://ya.ru');

                                    tester.modalWindow.
                                        anchor('http://ya.ru').
                                        expectAttributeToHaveValue('href', 'http://ya.ru');

                                    tester.modalWindow.
                                        anchor('https://go.comagic.ru/').
                                        expectAttributeToHaveValue('href', 'https://go.comagic.ru/');

                                    tester.modalWindow.
                                        anchor('hhttp://ya.ru').
                                        expectNotToExist();
                                });
                            });
                            describe('Поступил входящий звонок.', function() {
                                let incomingCall;

                                beforeEach(function() {
                                    incomingCall = tester.incomingCall().receive();

                                    tester.slavesNotification().
                                        twoChannels().
                                        available().
                                        incoming().
                                        progress().
                                        userDataFetched().
                                        expectToBeSent();

                                    tester.numaRequest().receiveResponse();
                                    tester.outCallEvent().receive();
                                    tester.outCallEvent().slavesNotification().expectToBeSent();
                                });

                                describe(
                                    'Получено событие завершения звонка. Позвонивший перестал дозваниваться.',
                                function() {
                                    beforeEach(function() {
                                        tester.callSessionFinish().receive();
                                        tester.callSessionFinish().slavesNotification().expectToBeSent();
                                        incomingCall.cancel();

                                        tester.marksRequest().receiveResponse();

                                        tester.slavesNotification().
                                            available().
                                            userDataFetched().
                                            twoChannels().
                                            failed().
                                            expectToBeSent();

                                        spendTime(499);
                                    });

                                    it(
                                        'Прошло некоторое время. Отправлеяется запрос истори  звонков.',
                                    function() {
                                        spendTime(1);
                                        tester.callsRequest().fromFirstWeekDay().firstPage().receiveResponse();
                                    });
                                    it('Спиннер видим.', function() {
                                        tester.spin.expectToBeVisible();
                                    });
                                });
                                describe('Позвонивший перестал дозваниваться.', function() {
                                    beforeEach(function() {
                                        incomingCall.cancel();
                                        tester.callSessionFinish().receive();
                                        tester.callSessionFinish().slavesNotification().expectToBeSent();

                                        tester.marksRequest().receiveResponse();

                                        tester.slavesNotification().
                                            available().
                                            userDataFetched().
                                            twoChannels().
                                            failed().
                                            expectToBeSent();

                                        spendTime(1499);
                                    });

                                    it(
                                        'Прошло некоторое время. Отправлеяется запрос истори  звонков.',
                                    function() {
                                        spendTime(1);
                                        tester.callsRequest().fromFirstWeekDay().firstPage().receiveResponse();
                                    });
                                    it('Спиннер видим.', function() {
                                        tester.spin.expectToBeVisible();
                                    });
                                });
                                it('Нажимаю на клавишу Enter в поле поиска. Прием звонка не происходит.', function() {
                                    tester.input.withPlaceholder('Имя или телефон').click();
                                    tester.input.withPlaceholder('Имя или телефон').pressEnter();
                                });
                            });
                            describe(
                                'Нажимаю на кнопку второй страницы. Отправлен запрос второй страницы.',
                            function() {
                                beforeEach(function() {
                                    tester.table.pagingPanel.pageButton('2').click();

                                    tester.callsRequest().fromFirstWeekDay().secondPage().receiveResponse();
                                    tester.marksRequest().receiveResponse();
                                });

                                it('Ввожу значение в поле поиска. Отправлен запрос поиска.', function() {
                                    tester.input.withPlaceholder('Имя или телефон').input('qwe12');
                                    spendTime(500);

                                    tester.callsRequest().
                                        fromFirstWeekDay().
                                        search('qwe12').
                                        firstPage().
                                        receiveResponse();

                                    tester.marksRequest().receiveResponse();

                                    tester.table.pagingPanel.pageButton('1').expectToBePressed();
                                    tester.table.pagingPanel.pageButton('2').expectNotToBePressed();
                                    tester.table.pagingPanel.pageButton('3').expectNotToExist();
                                });
                                it('Нажимаю на кнопку "Все". Отправлен запрос истории звонков.', function() {
                                    tester.radioButton('Все').click();

                                    tester.notProcessedCallsRequest().receiveResponse();
                                    tester.marksRequest().receiveResponse();
                                });
                                it('Отображена вторая страница.', function() {
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

                                        '1 2 Всего записей 15 Страница 10'
                                    );
                                });
                            });
                            describe('Нажимаю на кнопку проигрывания записи. Запись проигрывается.', function() {
                                beforeEach(function() {
                                    tester.table.row.first.column.withHeader('Запись').playIcon.click();
                                    
                                    tester.talkRecordRequest().receiveResponse();
                                    audioDecodingTester.accomplishAudioDecoding();
                                });

                                describe('Нажимаю на кнопку закрытия плеера.', function() {
                                    beforeEach(function() {
                                        tester.closeButton.click();
                                    });

                                    it('Нажимаю на кнопку проигрывания записи. Плеер отображается.', function() {
                                        tester.table.row.first.column.withHeader('Запись').playIcon.click();
                                        tester.audioPlayer.expectToBeVisible();
                                    });
                                    it('Плеер скрыт.', function() {
                                        tester.audioPlayer.expectNotToExist();
                                    });
                                });
                                it('Меняю громкость. Плеер отображается.', function() {
                                    tester.audioPlayer.button.atIndex(1).putMouseOver();
                                    tester.slider.click(50, 25);
                                    
                                    tester.audioPlayer.expectToBeVisible();
                                });
                                it('Меняю скорость. Плеер отображается.', function() {
                                    tester.audioPlayer.button.atIndex(2).putMouseOver();
                                    tester.select.option('1.25').click();

                                    tester.audioPlayer.expectToBeVisible();
                                });
                                it('Нажимаю на кнопку скачивания записи. Запись скачивается.', function() {
                                    tester.audioPlayer.anchor.click();
                                    tester.talkRecordRequest().receiveResponse();

                                    tester.audioPlayer.anchor.
                                        expectHrefToBeBlobWithContent('29f2f28ofjowf829f').
                                        expectAttributeToHaveValue(
                                            'download',
                                            '2019-12-19_08-03-02.522_from_74950230625_session_980925444_talk.mp3'
                                        );
                                });
                                it('Кликаю на элемент вне плеера. Плеер скрыт.', function() {
                                    tester.input.withPlaceholder('Имя или телефон').click();
                                    tester.audioPlayer.expectNotToExist();
                                });
                            });
                            describe('Имя скачиваемой записи читаемо.', function() {
                                beforeEach(function() {
                                    tester.table.row.atIndex(1).column.withHeader('Запись').playIcon.click();

                                    tester.talkRecordRequest().second().receiveResponse();
                                    tester.talkRecordRequest().third().receiveResponse();

                                    audioDecodingTester.accomplishAudioDecoding();
                                    audioDecodingTester.accomplishAudioDecoding();

                                    tester.audioPlayer.button.atIndex(3).putMouseOver();
                                });

                                it('Нажимаю на первую опцию списка записей. Запись скачивается.', function() {
                                    tester.anchor(
                                        '2019-12-18_18-08-25.522_from_74950230626_session_980925445_1_talk.mp3'
                                    ).click();

                                    tester.talkRecordRequest().second().receiveResponse();

                                    tester.anchor(
                                        '2019-12-18_18-08-25.522_from_74950230626_session_980925445_1_talk.mp3'
                                    ).
                                        expectAttributeToHaveValue(
                                            'download',
                                            '2019-12-18_18-08-25.522_from_74950230626_session_980925445_1_talk.mp3'
                                        ).
                                        expectHrefToBeBlobWithContent('j7927g028hhs084kf');
                                });
                                it('Нажимаю на вторую опцию списка записей. Запись скачивается.', function() {
                                    tester.anchor(
                                        '2019-12-18_18-08-25.522_from_74950230626_session_980925445_2_talk.mp3'
                                    ).click();

                                    tester.talkRecordRequest().third().receiveResponse();
                                    
                                    tester.anchor(
                                        '2019-12-18_18-08-25.522_from_74950230626_session_980925445_2_talk.mp3'
                                    ).
                                        expectAttributeToHaveValue(
                                            'download',
                                            '2019-12-18_18-08-25.522_from_74950230626_session_980925445_2_talk.mp3'
                                        ).
                                        expectHrefToBeBlobWithContent('h398j0184hhls0283');
                                });
                            });
                            describe('Нажимаю на имя контакта.', function() {
                                beforeEach(function() {
                                    tester.table.row.atIndex(1).column.withHeader('ФИО контакта').link.click();
                                    tester.contactRequest().receiveResponse();
                                });
                                
                                it('Изменяю имя. Отправлен запрос обновления контакта.', function() {
                                    tester.contactBar.section('ФИО').svg.click();

                                    tester.input.withPlaceholder('Фамилия (Обязательное поле)').fill('Неделчева');
                                    tester.input.withPlaceholder('Имя').fill('Роза');
                                    tester.input.withPlaceholder('Отчество').fill('Ангеловна');

                                    tester.button('Сохранить').click();
                                    tester.contactUpdatingRequest().completeData().anotherName().receiveResponse();
                                });
                                it('Нажимаю на иконку с крестиком. Карточка контакта скрыта.', function() {
                                    tester.contactBar.closeButton.click();
                                    tester.contactBar.expectNotToExist();
                                });
                                it('Открыта карточка контакта.', function() {
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
                                    'ФИО контакта ' +
                                    'Номер абонента ' +
                                    'Теги ' +
                                    'Комментарий ' +
                                    'Длительность ' +
                                    'Запись ' +

                                    '19 дек 2019 08:03 ' +
                                    'Тодорова Гера ' +
                                    '+7 (495) 023-06-25 ' +
                                    '00:00:20 ' +

                                    '19 дек 2019 10:13 ' +
                                    'Михайлова Врабка ' +
                                    '+7 (495) 023-06-26 ' +
                                    '00:00:24'
                                );
                            });
                            it('Нажимаю на кнопку скачивания записи. Открыт выпадающий список записей.', function() {
                                tester.table.row.atIndex(1).column.withHeader('Запись').downloadIcon.click();

                                tester.select.option(
                                    '2019-12-18_18-08-25.522_from_74950230626_session_980925445_1_talk.mp3'
                                ).expectToBeVisible();

                                tester.select.option(
                                    '2019-12-18_18-08-25.522_from_74950230626_session_980925445_2_talk.mp3'
                                ).expectToBeVisible();
                            });
                            it('Нажимаю на ссылку в колонке "Номер абонента". Совершается звонок.', function() {
                                tester.table.row.first.column.withHeader('Номер абонента').link.click();

                                tester.firstConnection.connectWebRTC();
                                tester.allowMediaInput();

                                const outgoingCall = tester.outgoingCall().setNumberFromCallsGrid().expectToBeSent();

                                tester.slavesNotification().
                                    available().
                                    thirdPhoneNumber().
                                    userDataFetched().
                                    twoChannels().
                                    sending().
                                    expectToBeSent();

                                outgoingCall.setRinging();

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

                                    '1 Всего записей 15 Страница 25'
                                );
                            });
                            it('Отображена ссылка на страницу контакта в CRM.', function() {
                                tester.table.row.first.column.withHeader('ФИО контакта').link.click();

                                windowOpener.expectToHavePath(
                                    'https://comagicwidgets.amocrm.ru/contacts/detail/218401'
                                );
                            });
                            it('Получено событие скрытия номеров.', function() {
                                tester.entityChangedEvent().isNeedHideNumbers().receive();

                                tester.othersNotification().
                                    updateSettings().
                                    shouldNotPlayCallEndingSignal().
                                    expectToBeSent();
                                
                                tester.entityChangedEvent().isNeedHideNumbers().slavesNotification().expectToBeSent();
                                
                                tester.table.expectTextContentToHaveSubstring(
                                    'Гяурова Марийка ' +
                                    'Позвонить'
                                );
                            });
                            it('Отображена история звонков.', function() {
                                tester.calendarField.expectToHaveValue('16 дек 2019 - 19 дек 2019');

                                tester.radioButton('Мои').expectToBeSelected();
                                tester.radioButton('Все').expectNotToBeSelected();
                                tester.radioButton('Необработанные').expectNotToBeSelected();

                                tester.select.withValue('Звонки: Все').expectNotToExist();
                                tester.select.withValue('Направления: Все').expectNotToExist();
                                tester.select.withPlaceholder('Группы').expectNotToExist();
                                tester.switchButton.expectNotToExist();

                                tester.table.
                                    row.first.
                                    column.first.
                                    svg.
                                    expectToHaveClass('incoming_svg__cmg-direction-icon');

                                tester.table.
                                    row.atIndex(1).
                                    column.first.
                                    svg.
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

                                    '1 2 Всего записей 15 Страница 10'
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
                        describe('Имя контакта не было получено.', function() {
                            beforeEach(function() {
                                callsRequest.
                                    noContactName().
                                    noCrmContactLink().
                                    receiveResponse();
                            });

                            describe('Нажимаю на номер телефона.', function() {
                                beforeEach(function() {
                                    tester.table.row.first.column.withHeader('ФИО контакта').link.click();
                                });

                                describe('Открываю поля ФИО.', function() {
                                    beforeEach(function() {
                                        tester.contactBar.section('ФИО').svg.click();
                                    });

                                    describe('Ввожу значение в поле фамилии.', function() {
                                        let contactCreatingRequest;

                                        beforeEach(function() {
                                            tester.input.withPlaceholder('Фамилия (Обязательное поле)').
                                                fill('Неделчева');
                                        });
                                        
                                        describe(
                                            'Нажимаю на кнопку "Создать контакт". Отправлен запрос создания контакта.',
                                        function() {
                                            beforeEach(function() {
                                                tester.button('Создать контакт').click();

                                                contactCreatingRequest = tester.contactCreatingRequest().
                                                    expectToBeSent();
                                            });

                                            describe('Получен ответ на запрос.', function() {
                                                beforeEach(function() {
                                                    contactCreatingRequest.receiveResponse();
                                                    tester.contactBar.section('ФИО').svg.click();
                                                });

                                                it(
                                                    'Ввожу имя и отчество. Нажимаю на кнопку "Сохранить". Отправлен ' +
                                                    'запрос обновления контакта.',
                                                function() {
                                                    tester.input.withPlaceholder('Имя').fill('Роза');
                                                    tester.input.withPlaceholder('Отчество').fill('Ангеловна');

                                                    tester.button('Сохранить').click();

                                                    tester.contactUpdatingRequest().anotherName().receiveResponse();
                                                });
                                                it('Спиннер скрыт.', function() {
                                                    tester.spin.expectNotToExist();
                                                    tester.button('Создать контакт').expectNotToExist();

                                                    tester.input.withPlaceholder('Фамилия (Обязательное поле)').
                                                        expectNotToHaveError();
                                                });
                                            });
                                            it('Отображен спиннер.', function() {
                                                tester.spin.expectToBeVisible();
                                            });
                                        });
                                        it('Поле фамилии не отмечено как невалидное.', function() {
                                            tester.input.withPlaceholder('Фамилия (Обязательное поле)').
                                                expectNotToHaveError();
                                        });
                                    });
                                    it('Поле фамилии отмечено как невалидное.', function() {
                                        tester.input.withPlaceholder('Фамилия (Обязательное поле)').expectToHaveError();
                                        tester.input.withPlaceholder('Имя').expectNotToHaveError();
                                    });
                                });
                                it('Добавляю почту. Запрос сохранения контакта не был отправлен.', function() {
                                    tester.contactBar.section('E-Mail').svg.click();
                                    tester.contactBar.section('E-Mail').input.fill('nedelcheva@gmail.com').pressEnter();
                                });
                                it('Открывается форма создания контакта.', function() {
                                    tester.contactBar.expectTextContentToHaveSubstring(
                                        'ФИО ' +
                                        '74950230625 ' +

                                        'Телефоны ' +
                                        '74950230625 '
                                    );

                                    tester.button('Создать контакт').expectToBeDisabled();
                                });
                            });
                            it('Оторажен номер.', function() {
                                tester.table.row.first.column.withHeader('ФИО контакта').link.
                                    expectToHaveTextContent('+7 (495) 023-06-25');
                            });
                        });
                        it(
                            'Идентфикатор сессии дублируется. Нажимаю на кнопку второй страницы. Отправлен запрос ' +
                            'второй страницы. Отображена вторая страница.',
                        function() {
                            callsRequest.duplicatedCallSessionId().receiveResponse();

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

                                '1 2 Всего записей 15 Страница 10'
                            );
                        });
                        it(
                            'Есть неуспешные звонки. Строки с неуспешными звонками внешне отличаются от строк с ' +
                            'успешными звонками.',
                        function() {
                            callsRequest.isFailed().receiveResponse();
                            tester.table.row.first.expectToHaveClass('cmg-softphone-call-history-failed-call-row');
                        });
                        it('Записи для таблицы не были получены. Панель пагинации скрыта.', function() {
                            callsRequest.noCalls().receiveResponse();
                            tester.table.pagingPanel.expectNotToExist();
                        });
                        it('В таблицу содержится звонок от сотрудника. Отображено имя сотрудника.', function() {
                            callsRequest.employeeName().receiveResponse();

                            tester.table.expectTextContentToHaveSubstring(
                                '19 дек 2019 08:03 ' +
                                'Гяурова Марийка ' +
                                '+7 (495) 023-06-25 ' +
                                'Нецелевой контакт, Отложенный звонок ' +
                                '00:00:20 ',
                            );
                        });
                        it('В таблице содержится короткий номер. Номер не сформатирован.', function() {
                            callsRequest.shortPhoneNumber().receiveResponse();
                            tester.table.expectTextContentToHaveSubstring('56123');
                        });
                        it('В таблице содержится чилийский номер. Номер сформатирован корректно.', function() {
                            callsRequest.chilePhoneNumber().receiveResponse();
                            tester.table.expectTextContentToHaveSubstring(' +56 (123) 45-6789 ');
                        });
                        it('Общее количество записей не было получено. Отображена история звонков.', function() {
                            callsRequest.noTotal().receiveResponse();

                            tester.spin.expectNotToExist();

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
                        it('Спиннер видим.', function() {
                            tester.spin.expectToBeVisible();
                        });
                    });
                    describe('Звонки получены.', function() {
                        beforeEach(function() {
                            callsRequest.receiveResponse();
                        });

                        it('Тэги получены. Спиннер скрыт.', function() {
                            marksRequest.receiveResponse();
                            tester.spin.expectNotToExist();
                        });
                        it('Спиннер видим.', function() {
                            tester.spin.expectToBeVisible();
                        });
                    });
                });
                describe('Обновление комментария недоступно.', function() {
                    beforeEach(function() {
                        permissionsRequest = permissionsRequest.disallowCallSessionCommentingUpdate();
                    });

                    describe('Открываю раздел "История звонков".', function() {
                        beforeEach(function() {
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
                                tester.button('Редактировать').click();
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
                            'Нажимаю на кнопку комментария там где комментария нет. Ввожу комментарий. Кнопка ' +
                            'сохранения доступна.',
                        function() {
                            tester.table.row.atIndex(1).column.withHeader('Комментарий').svg.click();
                            tester.modalWindow.textarea.fill('Другой комментарий');

                            tester.button('Сохранить').expectNotToHaveAttribute('disabled');
                        });
                    });
                    it('Удаление комментария недоступно. Открываю раздел "История звонков".', function() {
                        permissionsRequest.disallowCallSessionCommentingDelete().receiveResponse();

                        tester.connectEventsWebSocket();
                        tester.slavesNotification().twoChannels().enabled().softphoneServerConnected().expectToBeSent();

                        tester.connectSIPWebSocket();
                        tester.slavesNotification().twoChannels().webRTCServerConnected().softphoneServerConnected().
                            expectToBeSent();

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

                        tester.table.row.first.column.withHeader('Комментарий').svg.click();
                        tester.button('Редактировать').expectNotToExist();
                    });
                });
                describe('Добавление комментария недоступно. Открываю раздел "История звонков".', function() {
                    beforeEach(function() {
                        permissionsRequest.disallowCallSessionCommentingInsert().receiveResponse();

                        tester.connectEventsWebSocket();
                        tester.slavesNotification().twoChannels().enabled().softphoneServerConnected().expectToBeSent();

                        tester.connectSIPWebSocket();
                        tester.slavesNotification().twoChannels().webRTCServerConnected().softphoneServerConnected().
                            expectToBeSent();

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
                            tester.button('Редактировать').click();
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

                        tester.connectEventsWebSocket();
                        tester.slavesNotification().twoChannels().enabled().softphoneServerConnected().expectToBeSent();

                        tester.connectSIPWebSocket();
                        tester.slavesNotification().twoChannels().webRTCServerConnected().softphoneServerConnected().
                            expectToBeSent();

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
                            tester.button('Редактировать').click();
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
                it(
                    'Статистика по всем звонкам недоступна. Открываю раздел "История звонков". Вкладки "Все" и ' +
                    '"Необработанные" заблокированы.',
                function() {
                    permissionsRequest.disallowSoftphoneAllCallsStatSelect().receiveResponse();

                    tester.connectEventsWebSocket();
                    tester.slavesNotification().twoChannels().enabled().softphoneServerConnected().expectToBeSent();

                    tester.connectSIPWebSocket();
                    tester.slavesNotification().twoChannels().webRTCServerConnected().softphoneServerConnected().
                        expectToBeSent();

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

                    tester.radioButton('Мои').expectNotToExist();
                    tester.radioButton('Все').expectNotToExist();
                    tester.radioButton('Необработанные').expectNotToExist();
                });
                it(
                    'Просмотр комментариев недоступен. Открываю раздел "История звонков". Комментарии не отображатся.',
                function() {
                    permissionsRequest.disallowCallSessionCommentingSelect().receiveResponse();

                    tester.connectEventsWebSocket();
                    tester.slavesNotification().twoChannels().enabled().softphoneServerConnected().expectToBeSent();

                    tester.connectSIPWebSocket();
                    tester.slavesNotification().twoChannels().webRTCServerConnected().softphoneServerConnected().
                        expectToBeSent();

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

                    tester.connectEventsWebSocket();
                    tester.slavesNotification().twoChannels().enabled().softphoneServerConnected().expectToBeSent();

                    tester.connectSIPWebSocket();
                    tester.slavesNotification().twoChannels().webRTCServerConnected().softphoneServerConnected().
                        expectToBeSent();

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
                it(
                    'Редактирование тегов недоступно. Открываю раздел "История звонков". Теги не изменяются.',
                function() {
                    permissionsRequest.disallowTagManagementUpdate().receiveResponse();

                    tester.connectEventsWebSocket();
                    tester.slavesNotification().twoChannels().enabled().softphoneServerConnected().expectToBeSent();

                    tester.connectSIPWebSocket();
                    tester.slavesNotification().twoChannels().webRTCServerConnected().softphoneServerConnected().
                        expectToBeSent();

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

                    tester.table.row.first.column.withHeader('Теги').svg.click();

                    tester.select.tag('Нецелевой контакт').closeButton.expectNotToExist();
                    tester.select.option('Генератор лидов').click();
                });
            });
            describe('Номера должны быть скрыты. Открываю историю звонков.', function() {
                let callsRequest;

                beforeEach(function() {
                    settingsRequest.shouldHideNumbers().receiveResponse();
                    tester.slavesNotification().twoChannels().enabled().expectToBeSent();

                    tester.othersNotification().widgetStateUpdate().isNeedHideNumbers().expectToBeSent();
                    tester.othersNotification().updateSettings().shouldNotPlayCallEndingSignal().
                        expectToBeSent();

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
                    tester.slavesNotification().twoChannels().available().userDataFetched().
                        expectToBeSent();

                    tester.button('История звонков').click();

                    callsRequest = tester.callsRequest().fromFirstWeekDay().firstPage().expectToBeSent();
                    tester.marksRequest().receiveResponse();
                });

                describe('Имя контакта получено.', function() {
                    beforeEach(function() {
                        callsRequest.receiveResponse();
                    });

                    it('Нажимаю на кнопку "Все". Номера скрыты.', function() {
                        tester.radioButton('Все').click();

                        tester.notProcessedCallsRequest().receiveResponse();
                        tester.marksRequest().receiveResponse();

                        tester.table.expectTextContentToHaveSubstring(
                            'Дата / время ' +
                            'ФИО контакта ' +
                            'Номер абонента ' +
                            'Теги ' +
                            'Комментарий ' +
                            'Длительность ' +
                            'Запись ' +

                            '19 дек 2019 08:03 ' +
                            'Тодорова Гера ' +
                            'Позвонить ' +
                            '00:00:20 ' +

                            '19 дек 2019 10:13 ' +
                            'Михайлова Врабка ' +
                            'Позвонить ' +
                            '00:00:24'
                        );
                    });
                    it('Номера скрыты.', function() {
                        tester.table.expectTextContentToHaveSubstring(
                            'Гяурова Марийка ' +
                            'Позвонить'
                        );
                    });
                });
                describe('Имя контакта не было получено.', function() {
                    beforeEach(function() {
                        callsRequest = callsRequest.noContactName();
                    });

                    it('Ссылка на страницу контакта не была получена.', function() {
                        callsRequest.noCrmContactLink().receiveResponse();

                        tester.table.expectTextContentToHaveSubstring(
                            '19 дек 2019 08:03 ' +
                            '' +
                            'Позвонить ' +
                            'Нецелевой контакт'
                        );
                    });
                    it('Номер скрыт.', function() {
                        callsRequest.receiveResponse();

                        tester.table.expectTextContentToHaveSubstring(
                            '19 дек 2019 08:03 ' +
                            'Неизвестный номер ' +
                            'Позвонить ' +
                            'Нецелевой контакт'
                        );
                    });
                });
            });
        });
        it('У пользователя нет роли. Вкладки "Все" и "Необработанные" заблокированы.', function() {
            accountRequest.noCallCenterRole().receiveResponse();

            const requests = ajax.inAnyOrder();

            reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
            const reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                secondAccountRequest = tester.accountRequest().expectToBeSent(requests);

            requests.expectToBeSent();

            reportsListRequest.receiveResponse();
            reportTypesRequest.receiveResponse();
            secondAccountRequest.noCallCenterRole().receiveResponse();
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
            tester.statusesRequest().receiveResponse();

            settingsRequest = tester.settingsRequest().expectToBeSent();
            tester.talkOptionsRequest().receiveResponse();
            permissionsRequest = tester.permissionsRequest().expectToBeSent();

            settingsRequest.receiveResponse();
            tester.slavesNotification().twoChannels().enabled().expectToBeSent();

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

            tester.button('История звонков').click();

            tester.callsRequest().fromFirstWeekDay().firstPage().receiveResponse();
            tester.marksRequest().receiveResponse();

            tester.select.withValue('Звонки: Все').expectNotToExist();
            tester.select.withValue('Направления: Все').expectNotToExist();
            tester.select.withPlaceholder('Группы').expectNotToExist();

            tester.radioButton('Мои').expectNotToExist();
            tester.radioButton('Все').expectNotToExist();
            tester.radioButton('Необработанные').expectNotToExist();

            tester.body.expectTextContentNotToHaveSubstring('Скрыть обработанные другими группами');
        });
        it('Пользователь является менеджером. Пункт меню скрыт.', function() {
            accountRequest.manager().receiveResponse();

            const requests = ajax.inAnyOrder();

            reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
            const reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                secondAccountRequest = tester.accountRequest().expectToBeSent(requests);

            requests.expectToBeSent();

            reportsListRequest.receiveResponse();
            reportTypesRequest.receiveResponse();
            secondAccountRequest.manager().receiveResponse();
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
            tester.statusesRequest().receiveResponse();

            settingsRequest = tester.settingsRequest().expectToBeSent();
            tester.talkOptionsRequest().receiveResponse();
            permissionsRequest = tester.permissionsRequest().expectToBeSent();

            settingsRequest.receiveResponse();
            tester.slavesNotification().twoChannels().enabled().expectToBeSent();

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

            tester.button('История звонков').expectNotToExist();
        });
        it('История недоступна. Пункт меню скрыт.', function() {
            accountRequest.callHistoryFeatureFlagDisabled().receiveResponse();

            const requests = ajax.inAnyOrder();

            reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
            const reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests);

            const secondAccountRequest = tester.accountRequest().
                callHistoryFeatureFlagDisabled().
                expectToBeSent(requests);

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
            tester.slavesNotification().twoChannels().available().userDataFetched().
                expectToBeSent();

            statusesRequest.receiveResponse();

            tester.button('История звонков').expectNotToExist();
        });
        it(
            'Контакты недоступны. Открываю историю звонков. Ссылка на редактирование контакта не отображается.',
        function() {
            accountRequest.contactsFeatureFlagDisabled().receiveResponse();

            const requests = ajax.inAnyOrder();

            reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
            const reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests);

            const secondAccountRequest = tester.accountRequest().
                contactsFeatureFlagDisabled().
                expectToBeSent(requests);

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
            tester.slavesNotification().twoChannels().available().userDataFetched().
                expectToBeSent();

            statusesRequest.receiveResponse();

            tester.button('История звонков').click();

            tester.callsRequest().fromFirstWeekDay().firstPage().receiveResponse();
            tester.marksRequest().receiveResponse();

            tester.table.row.first.column.withHeader('ФИО контакта').link.expectToBeVisible();
            tester.table.row.atIndex(1).column.withHeader('ФИО контакта').link.expectNotToExist();
        });
    });
    describe('Открываю историю звонков.', function() {
        let tester,
            permissionsRequest;

        beforeEach(function() {
            setNow('2019-12-19T12:10:06');

            tester = new Tester({
                ...options,
                path: '/softphone/call-history',
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

            tester.notificationChannel().tellIsLeader().expectToBeSent();
            tester.masterInfoMessage().tellIsLeader().expectToBeSent();
            tester.notificationChannel().applyLeader().expectToBeSent();
            tester.notificationChannel().applyLeader().expectToBeSent();

            tester.authCheckRequest().receiveResponse();
            tester.statusesRequest().receiveResponse();
            tester.settingsRequest().receiveResponse();

            tester.slavesNotification().twoChannels().enabled().expectToBeSent();
            tester.othersNotification().widgetStateUpdate().expectToBeSent();
            tester.othersNotification().updateSettings().shouldNotPlayCallEndingSignal().expectToBeSent();

            notificationTester.grantPermission();
            tester.talkOptionsRequest().receiveResponse();
            permissionsRequest = tester.permissionsRequest().expectToBeSent();

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
                softphoneServerConnected().
                registered().
                expectToBeSent();

            tester.allowMediaInput();

            tester.slavesNotification().
                userDataFetched().
                twoChannels().
                available().
                expectToBeSent();
        });

        it('Получены права. Получены данные для таблицы истории. Страница локализована.', function() {
            permissionsRequest.receiveResponse();

            tester.callsRequest().fromFirstWeekDay().firstPage().receiveResponse();
            tester.marksRequest().receiveResponse();

            tester.body.expectTextContentToHaveSubstring('Необработанные');
            tester.body.expectTextContentNotToHaveSubstring('Unprocessed');
        });
        it('Таблица скрыта.', function() {
            tester.table.expectNotToExist();
        });
    });
});
