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

            describe('Открываю раздел "Переотправка событий" без фильтра.', function() {
                beforeEach(function() {
                    tester.path.open('/event-resending');
                    Promise.runAll();
                });

                describe('Заполняю поле "App ID".', function() {
                    beforeEach(function() {
                        tester.textfield().withPlaceholder('App ID').fill('4735');
                    });

                    describe('Заполняю остальные поля фильтра.', function() {
                        beforeEach(function() {
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
                            var amocrmEventsRequest;

                            beforeEach(function() {
                                tester.button('Применить').click();
                                Promise.runAll();
                                amocrmEventsRequest = tester.amocrmEventsRequest().expectToBeSent();
                            });

                            describe('Ни одно событие не отправляется в данный момент.', function() {
                                beforeEach(function() {
                                    amocrmEventsRequest.receiveResponse();
                                });
                                
                                describe('Проходит время.', function() {
                                    beforeEach(function() {
                                        spendTime(2000);
                                        Promise.runAll(false, true);
                                    });

                                    escribe(
                                        'Нажимаю на кнопку "Применить". Отправлен запрос событий.',
                                    function() {
                                        var amocrmEventsRequest;

                                        beforeEach(function() {
                                            tester.button('Применить').click();
                                            Promise.runAll(false, true);
                                            amocrmEventsRequest = tester.amocrmEventsRequest().expectToBeSent();
                                        });

                                        describe('Приходит ответ сервера. Проходит время.', function() {
                                            beforeEach(function() {
                                                amocrmEventsRequest.receiveResponse();

                                                spendTime(1000);
                                                Promise.runAll(false, true);
                                            });

                                            it('Проходит время. Отправлен запрос событий.', function() {
                                                spendTime(2000);
                                                Promise.runAll(false, true);
                                                tester.amocrmEventsRequest().receiveResponse();
                                            });
                                            it('Запрос событий не отправлен.', function() {
                                                ajax.expectNoRequestsToBeSent();
                                            });
                                        });
                                        it('Проходит время. Запрос событий не отправлен.', function() {
                                            spendTime(1000);
                                            spendTime(1000);
                                            spendTime(1000);
                                            spendTime(1000);

                                            ajax.expectNoRequestsToBeSent();
                                        });
                                    });
                                    describe('Нажимаю на пункт меню "Пользователи". Прошло время.', function() {
                                        beforeEach(function() {
                                            tester.menuitem('Пользователи').click();
                                            Promise.runAll();

                                            spendTime(1000);
                                            Promise.runAll(false, true);
                                        });

                                        it(
                                            'Нажимаю на пункт меню "Переотправка событий". Заполняю поля фильтра. ' +
                                            'Нажимаю на кнопку "Применить". Отправлен запрос событий. Проходит ' +
                                            'время. Отправлен запрос событий.',
                                        function() {
                                            tester.menuitem('Переотправка событий').click();
                                            Promise.runAll();

                                            tester.textfield().withPlaceholder('App ID').fill('4735');
                                            tester.textfield().withPlaceholder('ID сессия').fill('28394');
                                            tester.textfield().withPlaceholder('Номер абонента').fill('79162937183');
                                            tester.textfield().withPlaceholder('Начальная дата').click();
                                            tester.forceUpdate();

                                            tester.calendar().left().cell('26').click();
                                            tester.forceUpdate();
                                            tester.calendar().right().cell('17').click();
                                            tester.forceUpdate();

                                            tester.button('Применить').click();
                                            Promise.runAll(false, true);
                                            tester.amocrmEventsRequest().receiveResponse();

                                            spendTime(3000);
                                            Promise.runAll(false, true);
                                            tester.amocrmEventsRequest().receiveResponse();
                                        });
                                        it('Запрос событий не отправлен.', function() {
                                            ajax.expectNoRequestsToBeSent();
                                        });
                                    });
                                    it('Проходит время. Отправлен запрос событий.', function() {
                                        spendTime(1000);
                                        Promise.runAll(false, true);
                                        tester.amocrmEventsRequest().receiveResponse();
                                    });
                                    it('Запрос событий не отправлен.', function() {
                                        ajax.expectNoRequestsToBeSent();
                                    });
                                });
                                describe(
                                    'Отмечаю строки. Нажимаю на кнопку "Повторить отправку". Отправлен запрос ' +
                                    'переотправки событий.',
                                function() {
                                    var amocrmEventsResendingRequest;
                                    
                                    beforeEach(function() {
                                        tester.table().cell().withContent('79157389283').row().checkbox().click();
                                        tester.table().cell().withContent('79157389285').row().checkbox().click();

                                        tester.button('Повторить отправку').click();
                                        Promise.runAll();
                                        amocrmEventsResendingRequest = tester.amocrmEventsResendingRequest().
                                            expectToBeSent();
                                    });

                                    it('Таблица заблокирована.', function() {
                                        tester.spinner.expectToBeVisible();
                                        tester.button('Применить').expectToHaveAttribute('disabled');
                                        tester.button('Повторить отправку').expectToHaveAttribute('disabled');
                                    });
                                    
                                    it(
                                        'Получен ответ сервера. Таблица доступна. Ни одна строка не выбрана.',
                                    function() {
                                        amocrmEventsResendingRequest.receiveResponse();
                                        tester.amocrmEventsRequest().receiveResponse();

                                        tester.spinner.expectToBeHiddenOrNotExist();
                                        tester.button('Применить').expectNotToHaveAttribute('disabled');
                                        tester.button('Повторить отправку').expectToHaveAttribute('disabled');

                                        tester.table().cell().withContent('79157389283').row().checkbox().
                                            expectNotToBeChecked();
                                        tester.table().cell().withContent('79157389284').row().checkbox().
                                            expectNotToBeChecked();
                                        tester.table().cell().withContent('79157389285').row().checkbox().
                                            expectNotToBeChecked();
                                    });
                                });
                                it(
                                    'Нажимаю на кнопку "Выбрать все недоставленные". Все недоставленные события ' +
                                    'выбраны.',
                                function() {
                                    tester.button('Выбрать все недоставленные').click();

                                    tester.table().cell().withContent('79157389283').row().checkbox().
                                        expectToBeChecked();
                                    tester.table().cell().withContent('79157389284').row().checkbox().
                                        expectNotToBeChecked();
                                    tester.table().cell().withContent('79157389285').row().checkbox().
                                        expectNotToBeChecked();
                                });
                                it(
                                    'Отображена таблица событий. Кнопка "Повторить отправку" заблокирована. Таблица ' +
                                    'доступна.',
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
                                        date_from: '2020-08-26 00:00:00',
                                        id: '28394',
                                        app_id: '4735',
                                        numa: '79162937183',
                                        date_till: '2020-09-17 23:59:59',
                                        is_show_undelivered: 'true',
                                        is_show_delivered: 'true',
                                        limit: '50',
                                        offset: '0',
                                        sort: ['{"field":"send_time","order":"desc"}']
                                    });
                                });
                            });
                            it(
                                'Некоторые события не отправляется в данный момент. Вместо даты отображен текст ' +
                                '"Отправляется".',
                            function() {
                                amocrmEventsRequest.setSending().receiveResponse();

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
                                    'Отправляется ' +
                                    '39286 ' +

                                    '79157389285 ' +
                                    '05.02.2021 в 09:56 ' +
                                    '10.06.2021 в 18:59 ' +
                                    '39287 ' +

                                    '1 ' +
                                    'Строк на странице 50 ' +
                                    'Всего записей 2'
                                );
                            });
                        });
                        it(
                            'Снимаю отметку с чекбокса "Недоставленные". Нажимаю на кнопку "Применить". Отправлен ' +
                            'запрос событий.',
                        function() {
                            tester.checkbox().withLabel('Недоставленные').click();

                            tester.button('Применить').click();
                            Promise.runAll();
                            tester.amocrmEventsRequest().setDeliveredOnly().receiveResponse();

                            tester.path.expectQueryToContain({
                                is_show_undelivered: 'false',
                                is_show_delivered: 'true'
                            });
                        });
                        it(
                            'Снимаю отметку с чекбокса "Доставленные". Нажимаю на кнопку "Применить". Отправлен ' +
                            'запрос событий.',
                        function() {
                            tester.checkbox().withLabel('Доставленные').click();

                            tester.button('Применить').click();
                            Promise.runAll();
                            tester.amocrmEventsRequest().setUndeliveredOnly().receiveResponse();

                            tester.path.expectQueryToContain({
                                is_show_undelivered: 'true',
                                is_show_delivered: 'false'
                            });
                        });
                        it('Проходит время. Ничего не происходит.', function() {
                            spendTime(3000);
                            Promise.runAll(false, true);
                        });
                    });
                    it('Стираю значение в календаре. Кнопка "Применить" заблокирована.', function() {
                        tester.calendar().clearIcon().click();
                        tester.button('Применить').expectToHaveAttribute('disabled');
                    });
                    it(
                        'Нажимаю на кнопка "Применить". Отправляется запрос событий с дефолтными параметрами.',
                    function() {
                        tester.button('Применить').click();
                        Promise.runAll();
                        tester.amocrmEventsRequest().setDefaultParams().expectToBeSent();
                    });
                });
                it('Кнопка "Применить" заблокирована. Выбран период со вчерашнего дня по сегдняшний.', function() {
                    tester.button('Применить').expectToHaveAttribute('disabled');

                    tester.textfield().withPlaceholder('Начальная дата').expectToHaveValue('23.08.2020');
                    tester.textfield().withPlaceholder('Конечная дата').expectToHaveValue('24.08.2020');
                });
            });
            it(
                'Открываю раздел "Переотправка событий" с фильтром. Отправлен запрос событий с фильтрацией. Поля ' +
                'фильтра заполнены.',
            function() {
                tester.path.open('/event-resending', {
                    date_from: '2020-08-26 00:00:00',
                    id: '28394',
                    app_id: '4735',
                    numa: '79162937183',
                    date_till: '2020-09-17 23:59:59',
                    is_show_undelivered: 'true',
                    is_show_delivered: 'false',
                    limit: '50',
                    offset: '0',
                    sort: ['{"field":"send_time","order":"desc"}']
                });

                Promise.runAll();
                tester.amocrmEventsRequest().setUndeliveredOnly().receiveResponse();

                tester.textfield().withPlaceholder('App ID').expectToHaveValue('4735');
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
