tests.addTest(function (options) {
    var webSocketLogger = options.webSocketLogger,
        timeoutLogger = options.timeoutLogger,
        AdminFrontendTester = options.AdminFrontendTester,
        spendTime = options.spendTime,
        setNow = options.setNow,
        ajax = options.ajax,
        utils = options.utils,
        webSockets = options.webSockets,
        audioDecodingTester = options.audioDecodingTester,
        setFocus = options.setFocus,
        notificationTester = options.notificationTester,
        webSockets = options.webSockets;

    webSocketLogger.disable();
    timeoutLogger.disable();

    describe('Открываю новую админку. Аутентифицируюсь.', function() {
        let tester;

        beforeEach(function() {
            setNow('2020-08-24 13:21:55');
            tester = new AdminFrontendTester(options);
            tester.path.open('/');

            tester.textfield().withPlaceholder('Username').fill('s.karamanova');
            tester.textfield().withPlaceholder('Password').fill('2i3g8h89sdG32r');

            tester.button('Sign in').click();
            Promise.runAll();
            tester.userLoginRequest().receiveResponse();
        });

        describe('Доступны разделы "Пользователи" и "Переотправка событий".', function() {
            beforeEach(function() {
                tester.userRequest().allowReadEventResending().allowReadUsers().receiveResponse();
            });

            describe('Открываю раздел "Переотправка событий" без фильтра. Заполняю поля фильтра.', function() {
                beforeEach(function() {
                    tester.path.open('/event-resending');
                    Promise.runAll();

                    tester.textfield().withPlaceholder('ID сессия').fill('28394');
                    tester.textfield().withPlaceholder('Номер абонента').fill('79162937183');
                    tester.textfield().withPlaceholder('Начальная дата').click();
                    tester.forceUpdate();

                    tester.calendar().left().cell('26').click();
                    tester.forceUpdate();
                    tester.calendar().right().cell('17').click();
                    tester.forceUpdate();
                });

                describe('Нажимаю на кнопку "Применить".', function() {
                    beforeEach(function() {
                        tester.button('Применить').click();
                        Promise.runAll();
                        tester.amocrmEventsRequest().receiveResponse();
                    });

                    describe(
                        'Отмечаю строки. Нажимаю на кнопку "Повторить отправку". Отправлен запрос переотправки ' +
                        'событий.',
                    function() {
                        var amocrmEventsResendingRequest;
                        
                        beforeEach(function() {
                            tester.table().cell().withContent('79157389283').row().checkbox().click();
                            tester.table().cell().withContent('79157389285').row().checkbox().click();

                            tester.button('Повторить отправку').click();
                            Promise.runAll();
                            amocrmEventsResendingRequest = tester.amocrmEventsResendingRequest().expectToBeSent();
                        });

                        it('Таблица заблокирована.', function() {
                            tester.spinner.expectToBeVisible();
                            tester.button('Применить').expectToHaveAttribute('disabled');
                            tester.button('Повторить отправку').expectToHaveAttribute('disabled');
                        });
                        it('Получен ответ сервера. Таблица доступна. Ни одна строка не выбрана.', function() {
                            amocrmEventsResendingRequest.receiveResponse();

                            tester.spinner.expectToBeHiddenOrNotExist();
                            tester.button('Применить').expectNotToHaveAttribute('disabled');
                            tester.button('Повторить отправку').expectToHaveAttribute('disabled');

                            tester.table().cell().withContent('79157389283').row().checkbox().expectNotToBeChecked();
                            tester.table().cell().withContent('79157389284').row().checkbox().expectNotToBeChecked();
                            tester.table().cell().withContent('79157389285').row().checkbox().expectNotToBeChecked();
                        });
                    });
                    it(
                        'Нажимаю на кнопку "Выбрать все недоставленные". Все недоставленные события выбраны.',
                    function() {
                        tester.button('Выбрать все недоставленные').click();

                        tester.table().cell().withContent('79157389283').row().checkbox().expectToBeChecked();
                        tester.table().cell().withContent('79157389284').row().checkbox().expectNotToBeChecked();
                        tester.table().cell().withContent('79157389285').row().checkbox().expectNotToBeChecked();
                    });
                    it(
                        'Отображена таблица событий. Кнопка "Повторить отправку" заблокирована. Таблица доступна.',
                    function() {
                        tester.spinner.expectNotToExist();

                        tester.button('Повторить отправку').expectToHaveAttribute('disabled');

                        tester.root.expectToHaveTextContent(
                            'Новосистем ' +
                            'Admin Panel ' +

                            'Пользователи ' +
                            'Переотправка событий ' +

                            'Переотправка событий ' +

                            'Фильтры: ' +

                            '~ ' +
                            'Доставленные ' +
                            'Недоставленные ' +

                            'Применить ' +
                            'Повторить отправку ' +
                            'Выбрать все недоставленные ' +

                            'Номер абонента ' +
                            'Дата и время события ' +
                            'Дата и время доставки в CRM ' +
                            'ID сессия ' +

                            '79157389283 ' +
                            '03.02.2021 в 09:58 ' +
                            'Сервер не отвечает 10.04.2021 в 16:59 ' +
                            '39285 ' +

                            '79157389284 ' +
                            '04.02.2021 в 09:59 ' +
                            '10.04.2021 в 17:59 ' +
                            '39286 ' +

                            '79157389285 ' +
                            '05.02.2021 в 09:56 ' +
                            '10.06.2021 в 18:59 ' +
                            '39287 ' +

                            '1 ' +
                            'Строк на странице 50 ' +
                            'Всего записей 2'
                        );


                        tester.checkbox().withLabel('Недоставленные').expectToBeChecked();
                        tester.checkbox().withLabel('Доставленные').expectToBeChecked();

                        tester.path.expectQueryToContain({
                            from_event_date: '2020-08-26 00:00:00',
                            id: '28394',
                            numa: '79162937183',
                            to_event_date: '2020-09-17 23:59:59',
                            undelivered: 'true',
                            delivered: 'true',
                            limit: '50',
                            offset: '0',
                            sort: ['{"field":"delivery_date","order":"desc"}']
                        });
                    });
                });
                it(
                    'Снимаю отметку с чекбокса "Недоставленные". Нажимаю на кнопку "Применить". Отправлен запрос ' +
                    'событий.',
                function() {
                    tester.checkbox().withLabel('Недоставленные').click();

                    tester.button('Применить').click();
                    Promise.runAll();
                    tester.amocrmEventsRequest().setDeliveredOnly().receiveResponse();

                    tester.path.expectQueryToContain({
                        undelivered: 'false',
                        delivered: 'true'
                    });
                });
                it(
                    'Снимаю отметку с чекбокса "Доставленные". Нажимаю на кнопку "Применить". Отправлен запрос ' +
                    'событий.',
                function() {
                    tester.checkbox().withLabel('Доставленные').click();

                    tester.button('Применить').click();
                    Promise.runAll();
                    tester.amocrmEventsRequest().setUndeliveredOnly().receiveResponse();

                    tester.path.expectQueryToContain({
                        undelivered: 'true',
                        delivered: 'false'
                    });
                });
            });
            it(
                'Открываю раздел "Переотправка событий" с фильтром. Отправлен запрос событий с фильтрацией. Поля ' +
                'фильтра заполнены.',
            function() {
                tester.path.open('/event-resending', {
                    from_event_date: '2020-08-26 00:00:00',
                    id: '28394',
                    numa: '79162937183',
                    to_event_date: '2020-09-17 23:59:59',
                    undelivered: 'true',
                    delivered: 'false',
                    limit: '50',
                    offset: '0',
                    sort: ['{"field":"delivery_date","order":"desc"}']
                });

                Promise.runAll();
                tester.amocrmEventsRequest().setUndeliveredOnly().receiveResponse();

                tester.textfield().withPlaceholder('ID сессия').expectToHaveValue('28394');
                tester.textfield().withPlaceholder('Номер абонента').expectToHaveValue('79162937183');
                tester.textfield().withPlaceholder('Начальная дата').expectToHaveValue('26.08.2020');
                tester.textfield().withPlaceholder('Конечная дата').expectToHaveValue('17.09.2020');
                tester.checkbox().withLabel('Недоставленные').expectToBeChecked();
                tester.checkbox().withLabel('Доставленные').expectNotToBeChecked();
            });
            it('Отображены пункты меню "Пользователи" и "Переотправка событий".', function() {
                tester.menuitem('Переотправка событий').expectHrefToHavePath('/event-resending');
            });
        });
        describe('Доступен только раздел "Пользовтатели".', function() {
            beforeEach(function() {
                tester.userRequest().allowReadUsers().receiveResponse();
            });

            it('Заполняю поле "App ID". Нажимаю на кнопку "Применить".', function() {
                tester.textfield().withPlaceholder('App ID').fill('4735');

                tester.button('Применить').click();
                Promise.runAll();
                tester.usersRequest().receiveResponse();

                tester.root.expectToHaveTextContent(
                    'Новосистем ' +
                    'Admin Panel ' +
                    'Пользователи ' +

                    'Пользователи ' +

                    'Фильтры: Пользователь софтфона Применить ' +

                    'App ID ' +
                    'Customer ID ' +
                    'Имя клиента ' +
                    'Пользователь ' +
                    'Сотрудник ' +
                    'Логин в софтфоне ' +
                    'Номер ' +

                    '4735 ' +
                    '94285 ' +
                    'ООО "Трупоглазые жабы" ' +
                    'Администратор ' +
                    'Барова Елена ' +
                    'admin@corpseeydtoads.com ' +
                    '79162938296 ' +

                    '1 ' +
                    'Строк на странице 50 ' +
                    'Всего записей 1'
                );
            });
            it('Отображен только пункт меню "Пользователи".', function() {
                tester.menuitem('Переотправка событий').expectNotToExist();
                tester.menuitem('Пользователи').expectToBeVisible();

                tester.root.expectToHaveTextContent(
                    'Новосистем ' +
                    'Admin Panel ' +
                    'Пользователи ' +

                    'Пользователи ' +

                    'Фильтры: Пользователь софтфона Применить ' +

                    'App ID ' +
                    'Customer ID ' +
                    'Имя клиента ' +
                    'Пользователь ' +
                    'Сотрудник ' +
                    'Логин в софтфоне ' +
                    'Номер ' +

                    'Нет данных ' +

                    '1 ' +
                    'Строк на странице 50 ' +
                    'Всего записей 0'
                );
            });
        });
    });
});
