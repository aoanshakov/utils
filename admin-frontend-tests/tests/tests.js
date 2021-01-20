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
            const notificationsContainer = document.querySelector('.ant-notification span');
            notificationsContainer && (notificationsContainer.innerHTML = '');

            setNow('2020-08-24 13:21:55');
            tester = new AdminFrontendTester(options);
            tester.path.open('/');

            tester.textfield().withPlaceholder('Username').fill('s.karamanova');
            tester.textfield().withPlaceholder('Password').fill('2i3g8h89sdG32r');

            tester.button('Sign in').click();
            Promise.runAll();
            tester.userLoginRequest().receiveResponse();
        });

        describe('Доступны разделы "Пользователи", "CRM-интеграции" и "Переотправка событий".', function() {
            beforeEach(function() {
                tester.userRequest().
                    allowReadEventResending().
                    allowWriteEventResending().
                    allowReadCrmIntegration().
                    allowReadUsers().
                    receiveResponse();
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
                            tester.textfield().withPlaceholder('ID сессии').fill('28394');
                            tester.textfield().withPlaceholder('Номер абонента').fill('79162937183');
                            tester.textfield().withPlaceholder('Начальная дата').click();
                            tester.forceUpdate();
                        });

                        describe('Дата окончания меньше текущей.', function() {
                            beforeEach(function() {
                                tester.calendar().left().prevMonth().click();
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

                                describe('Событий много.', function() {
                                    beforeEach(function() {
                                        amocrmEventsRequest.addEvents(0, 24).receiveResponse();
                                    });

                                    describe(
                                        'Нажимаю на кнпоку "Далее". Отправлен запрос второй страницы.',
                                    function() {
                                        beforeEach(function() {
                                            tester.button('Далее').click();
                                            Promise.runAll();
                                            amocrmEventsRequest = tester.amocrmEventsRequest().setOffset(25).
                                                expectToBeSent();
                                        });

                                        describe('На второй странице есть события.', function() {
                                            beforeEach(function() {
                                                amocrmEventsRequest.addEvents(25, 49).receiveResponse()
                                            });

                                            describe('Перехожу на пятую страницу.', function() {
                                                beforeEach(function() {
                                                    tester.button('Далее').click();
                                                    Promise.runAll();
                                                    tester.amocrmEventsRequest().setOffset(50).expectToBeSent().
                                                        addEvents(50, 74).receiveResponse();

                                                    tester.button('Далее').click();
                                                    Promise.runAll();
                                                    tester.amocrmEventsRequest().setOffset(75).expectToBeSent().
                                                        addEvents(75, 99).receiveResponse();

                                                    tester.button('Далее').click();
                                                    Promise.runAll();
                                                    tester.amocrmEventsRequest().setOffset(100).expectToBeSent().
                                                        addEvents(100, 124).receiveResponse();
                                                });

                                                describe(
                                                    'Нажимаю на кнопку четвертой страницы. Отправлен запрос ' +
                                                    'четвертой страницы.',
                                                function() {
                                                    beforeEach(function() {
                                                        tester.table().paging().page(4).click();
                                                        Promise.runAll();
                                                        amocrmEventsRequest = tester.amocrmEventsRequest().
                                                            setOffset(75).expectToBeSent();
                                                    });

                                                    it(
                                                        'На четвертой странице есть события. Отображена четвертая ' +
                                                        'страница.',
                                                    function() {
                                                        amocrmEventsRequest.addEvents(75, 99).receiveResponse();

                                                        tester.root.expectToHaveTextContent(
                                                            'В начало ' +
                                                            '1 ' +
                                                            '2 ' +
                                                            '3 ' +
                                                            '4 ' +
                                                            'Далее ' +
                                                            'Строк на странице 25'
                                                        );
                                                    });
                                                    it(
                                                        'На четвертой странице нет событий. Запрошена первая страница.',
                                                    function() {
                                                        amocrmEventsRequest.setNoEvents().receiveResponse();
                                                        tester.amocrmEventsRequest().receiveResponse();
                                                    });
                                                });
                                                describe('Перехожу на шестую страницу.', function() {
                                                    beforeEach(function() {
                                                        tester.button('Далее').click();
                                                        Promise.runAll();
                                                        tester.amocrmEventsRequest().setOffset(125).expectToBeSent().
                                                            addEvents(125, 149).receiveResponse();
                                                    });

                                                    it('Отображены пять кнопок страниц.', function() {
                                                        tester.root.expectToHaveTextContent(
                                                            'В начало ' +
                                                            '2 ' +
                                                            '3 ' +
                                                            '4 ' +
                                                            '5 ' +
                                                            '6 ' +
                                                            'Далее ' +
                                                            'Строк на странице 25'
                                                        );
                                                    });
                                                });
                                                it(
                                                    'Нажимаю на кнопку "В начало". Запрошена первая страница.',
                                                function() {
                                                    tester.button('В начало').click();
                                                    Promise.runAll();
                                                    tester.amocrmEventsRequest().expectToBeSent();
                                                });
                                                it('Отображены пять кнопок страниц.', function() {
                                                    tester.root.expectToHaveTextContent(
                                                        'В начало ' +
                                                        '1 ' +
                                                        '2 ' +
                                                        '3 ' +
                                                        '4 ' +
                                                        '5 ' +
                                                        'Далее ' +
                                                        'Строк на странице 25'
                                                    );
                                                });
                                            });
                                            it('Отображена вторая страница.', function() {
                                                tester.table().paging().page(1).
                                                    expectNotToHaveClass('pagination-item-active');
                                                tester.table().paging().page(2).expectToHaveClass(
                                                    'pagination-item-active'
                                                );

                                                tester.root.expectToHaveTextContent(
                                                    '79157389337 ' +
                                                    '05.02.2021 в 09:56 ' +
                                                    '10.06.2021 в 18:59 ' +
                                                    '39339 ' +

                                                    'В начало ' +
                                                    '1 ' +
                                                    '2 ' +
                                                    'Далее ' +
                                                    'Строк на странице 25'
                                                );
                                            });
                                        });
                                        it('На второй странице нет событий. Отображена первая страница.', function() {
                                            amocrmEventsRequest.setNoEvents().receiveResponse()

                                            tester.table().paging().page(1).expectToHaveClass('pagination-item-active');
                                            tester.table().paging().page(2).
                                                expectNotToHaveClass('pagination-item-active');

                                            tester.root.expectToHaveTextContent(
                                                '79157389312 ' +
                                                '05.02.2021 в 09:56 ' +
                                                '10.06.2021 в 18:59 ' +
                                                '39314 ' +

                                                '1 ' +
                                                'Далее ' +
                                                'Строк на странице 25'
                                            );
                                        });
                                    });
                                    it('Отображена первая страница.', function() {
                                        tester.table().paging().page(1).expectToHaveClass('pagination-item-active');
                                        tester.table().paging().page(2).expectNotToHaveClass('pagination-item-active');

                                        tester.root.expectToHaveTextContent(
                                            '79157389312 ' +
                                            '05.02.2021 в 09:56 ' +
                                            '10.06.2021 в 18:59 ' +
                                            '39314 ' +

                                            '1 ' +
                                            'Далее ' +
                                            'Строк на странице 25'
                                        );
                                    });
                                });
                                describe('Событий мало. Ни одно событие не отправляется в данный момент.', function() {
                                    beforeEach(function() {
                                        amocrmEventsRequest.receiveResponse();
                                    });
                                    
                                    xdescribe(
                                        'Отмечаю две строки. Нажимаю на кнопку "Повторить отправку". Отправлен ' +
                                        'запрос переотправки событий.',
                                    function() {
                                        var amocrmEventsResendingRequest;
                                        
                                        beforeEach(function() {
                                            tester.table().cell().withContent('79157389283').row().checkbox().click();
                                            tester.table().cell().withContent('79157389285').row().checkbox().click();

                                            tester.button('Повторить отправку').click();
                                            Promise.runAll();
                                            amocrmEventsResendingRequest = tester.amocrmEventsResendingRequest().
                                                setTwoEvents().expectToBeSent();
                                        });

                                        describe('Получен ответ сервера. Отправлен запрос событий.', function() {
                                            beforeEach(function() {
                                                amocrmEventsResendingRequest.receiveResponse();
                                                amocrmEventsRequest = tester.amocrmEventsRequest().expectToBeSent();
                                            });

                                            it(
                                                'Таблица заблокирована. Отображено оповещение о добавлении событий в ' +
                                                'очередь.',
                                            function() {
                                                tester.spinner.expectToBeVisible();
                                                tester.notification.
                                                    expectToHaveTextContent('В очередь добавлено 2 события');
                                            });
                                            it(
                                                'Получен ответ сервера. Таблица доступна. Ни одна строка не выбрана.',
                                            function() {
                                                amocrmEventsRequest.receiveResponse();

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
                                        it('Таблица заблокирована.', function() {
                                            tester.spinner.expectToBeVisible();
                                            tester.button('Применить').expectToHaveAttribute('disabled');
                                            tester.button('Повторить отправку').expectToHaveAttribute('disabled');
                                        });
                                    });
                                    xit(
                                        'Отмечаю одну строку. Нажимаю на кнопку "Повторить отправку". Отображено ' +
                                        'оповещение о добавлении события в очередь.',
                                    function() {
                                        tester.table().cell().withContent('79157389283').row().checkbox().click();

                                        tester.button('Повторить отправку').click();
                                        Promise.runAll();

                                        tester.amocrmEventsResendingRequest().receiveResponse();
                                        tester.amocrmEventsRequest().expectToBeSent();

                                        tester.notification.expectToHaveTextContent('В очередь добавлено 1 событие');
                                    });
                                    xit(
                                        'Отмечаю пять строк. Нажимаю на кнопку "Повторить отправку". Отображено ' +
                                        'оповещение о добавлении события в очередь.',
                                    function() {
                                        tester.table().cell().withContent('79157389283').row().checkbox().click();
                                        tester.table().cell().withContent('79157389284').row().checkbox().click();
                                        tester.table().cell().withContent('79157389285').row().checkbox().click();
                                        tester.table().cell().withContent('79157389286').row().checkbox().click();
                                        tester.table().cell().withContent('79157389287').row().checkbox().click();

                                        tester.button('Повторить отправку').click();
                                        Promise.runAll();

                                        tester.amocrmEventsResendingRequest().receiveResponse();
                                        tester.amocrmEventsRequest().expectToBeSent();

                                        tester.notification.expectToHaveTextContent('В очередь добавлено 5 событий');
                                    });
                                    xit(
                                        'Нажимаю на кнопку "Выбрать все недоставленные". Все недоставленные события ' +
                                        'выбраны.',
                                    function() {
                                        tester.button('Выбрать все недоставленные').click();
                                        Promise.runAll(false, true);

                                        tester.table().cell().withContent('79157389283').row().checkbox().
                                            expectToBeChecked();
                                        tester.table().cell().withContent('79157389284').row().checkbox().
                                            expectNotToBeChecked();
                                        tester.table().cell().withContent('79157389285').row().checkbox().
                                            expectNotToBeChecked();
                                    });
                                    xit(
                                        'Навожу курсор на иконку условия. Отображается подсказка с описанием условия.',
                                    function() {
                                        tester.table().cell().withContent('79157389283').row().
                                            querySelector(
                                                '.event-resending-condition-icon-is_common_conditions_passed'
                                            ).
                                            putMouseOver();

                                        tester.tooltip.
                                            expectToHaveTextContent('Общие для всех клиентов условия отправки в CRM');
                                    });
                                    it('Нажимаю на кнопку "Далее". Запрошены данные первой страницы.', function() {
                                        tester.button('Далее').click();
                                        Promise.runAll();
                                        tester.amocrmEventsRequest().receiveResponse();

                                        tester.root.expectTextContentToHaveSubstring(
                                            'Номер абонента ' +
                                            'Дата и время события ' +
                                            'Дата и время доставки в CRM ' +
                                            'ID сессии ' +

                                            '79157389283 ' +
                                            '03.02.2021 в 09:58 ' +
                                            'Сервер не отвечает 10.04.2021 в 16:59 ' +
                                            '39285'
                                        );
                                    });
                                    return;
                                    it(
                                        'Отображена таблица событий. Кнопка "Повторить отправку" заблокирована. ' +
                                        'Таблица доступна.',
                                    function() {
                                        tester.spinner.expectNotToExist();
                                        tester.button('Повторить отправку').expectToHaveAttribute('disabled');

                                        tester.root.expectToHaveTextContent(
                                            'Новосистем ' +
                                            'Admin Panel ' +

                                            'Пользователи ' +
                                            'CRM-интеграции ' +
                                            'Переотправка событий ' +

                                            'Переотправка событий ' +

                                            'Фильтры: ' +

                                            'Тип CRM: amoCRM ' +
                                            '~ ' +
                                            'Доставленные ' +
                                            'Недоставленные ' +
                                            'Отправляются ' +
                                            'Не отправлялись ' +

                                            'Применить ' +
                                            'Повторить отправку ' +
                                            'Выбрать все недоставленные ' +

                                            'Номер абонента ' +
                                            'Дата и время события ' +
                                            'Дата и время доставки в CRM ' +
                                            'ID сессии ' +

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

                                            '79157389286 ' +
                                            '05.02.2021 в 09:56 ' +
                                            '10.06.2021 в 18:59 ' +
                                            '39288 ' +

                                            '79157389287 ' +
                                            '05.02.2021 в 09:56 ' +
                                            '10.06.2021 в 18:59 ' +
                                            '39289 ' +

                                            '1 ' +
                                            'Далее ' +
                                            'Строк на странице 25'
                                        );

                                        tester.checkbox().withLabel('Недоставленные').expectToBeChecked();
                                        tester.checkbox().withLabel('Доставленные').expectToBeChecked();
                                        tester.checkbox().withLabel('Отправляются').expectToBeChecked();
                                        tester.checkbox().withLabel('Не отправлялись').expectToBeChecked();

                                        tester.path.expectQueryToContain({
                                            date_from: '2020-07-26 00:00:00',
                                            id: '28394',
                                            app_id: '4735',
                                            numa: '79162937183',
                                            date_till: '2020-08-17 23:59:59',
                                            is_show_not_sent: 'true',
                                            is_show_in_process: 'true',
                                            is_show_undelivered: 'true',
                                            is_show_delivered: 'true',
                                            limit: '50',
                                            offset: '0',
                                            sort: ['{"field":"event_time","order":"desc"}']
                                        });

                                        tester.table().cell().withContent('79157389283').row().
                                            querySelector(
                                                '.event-resending-condition-icon-is_common_conditions_passed'
                                            ).
                                            expectNotToHaveClass('event-resending-condition-icon-complied');
                                        tester.table().cell().withContent('79157389283').row().
                                            querySelector(
                                                '.event-resending-condition-icon-is_setting_conditions_passed'
                                            ).
                                            expectToHaveClass('event-resending-condition-icon-complied');
                                        tester.table().cell().withContent('79157389283').row().
                                            querySelector(
                                                '.event-resending-condition-icon-is_filter_conditions_passed'
                                            ).
                                            expectToHaveClass('event-resending-condition-icon-complied');

                                        tester.table().cell().withContent('79157389284').row().
                                            querySelector(
                                                '.event-resending-condition-icon-is_common_conditions_passed'
                                            ).
                                            expectToHaveClass('event-resending-condition-icon-complied');
                                        tester.table().cell().withContent('79157389284').row().
                                            querySelector(
                                                '.event-resending-condition-icon-is_setting_conditions_passed'
                                            ).
                                            expectNotToHaveClass('event-resending-condition-icon-complied');
                                        tester.table().cell().withContent('79157389284').row().
                                            querySelector(
                                                '.event-resending-condition-icon-is_filter_conditions_passed'
                                            ).
                                            expectToHaveClass('event-resending-condition-icon-complied');

                                        tester.table().cell().withContent('79157389285').row().
                                            querySelector(
                                                '.event-resending-condition-icon-is_common_conditions_passed'
                                            ).
                                            expectToHaveClass('event-resending-condition-icon-complied');
                                        tester.table().cell().withContent('79157389285').row().
                                            querySelector(
                                                '.event-resending-condition-icon-is_setting_conditions_passed'
                                            ).
                                            expectToHaveClass('event-resending-condition-icon-complied');
                                        tester.table().cell().withContent('79157389285').row().
                                            querySelector(
                                                '.event-resending-condition-icon-is_filter_conditions_passed'
                                            ).
                                            expectNotToHaveClass('event-resending-condition-icon-complied');
                                    });
                                });
                                return;
                                it(
                                    'Некоторые события отправляются в данный момент. Вместо даты отображен текст ' +
                                    '"Отправляется".',
                                function() {
                                    amocrmEventsRequest.setSending().receiveResponse();

                                    tester.root.expectToHaveTextContent(
                                        'Новосистем ' +
                                        'Admin Panel ' +

                                        'Пользователи ' +
                                        'CRM-интеграции ' +
                                        'Переотправка событий ' +

                                        'Переотправка событий ' +

                                        'Фильтры: ' +

                                        'Тип CRM: amoCRM ' +
                                        '~ ' +
                                        'Доставленные ' +
                                        'Недоставленные ' +
                                        'Отправляются ' +
                                        'Не отправлялись ' +

                                        'Применить ' +
                                        'Повторить отправку ' +
                                        'Выбрать все недоставленные ' +

                                        'Номер абонента ' +
                                        'Дата и время события ' +
                                        'Дата и время доставки в CRM ' +
                                        'ID сессии ' +

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

                                        '79157389286 ' +
                                        '05.02.2021 в 09:56 ' +
                                        '10.06.2021 в 18:59 ' +
                                        '39288 ' +

                                        '79157389287 ' +
                                        '05.02.2021 в 09:56 ' +
                                        '10.06.2021 в 18:59 ' +
                                        '39289 ' +

                                        '1 ' +
                                        'Далее ' +
                                        'Строк на странице 25'
                                    );
                                });
                                it('Некоторые события никогда не отправлялись.', function() {
                                    amocrmEventsRequest.setNoSendTime().receiveResponse();

                                    tester.root.expectTextContentToHaveSubstring(
                                        '79157389284 ' +
                                        '04.02.2021 в 09:59 ' +
                                        'Не отправлялось ' +
                                        '39286'
                                    );
                                });
                            });
                            return;
                            it(
                                'Снимаю отметку с чекбокса "Недоставленные". Нажимаю на кнопку "Применить". ' +
                                'Отправлен запрос событий.',
                            function() {
                                tester.checkbox().withLabel('Недоставленные').click();

                                tester.button('Применить').click();
                                Promise.runAll();
                                tester.amocrmEventsRequest().setAllExceptUndelivered().receiveResponse();

                                tester.path.expectQueryToContain({
                                    is_show_not_sent: 'true',
                                    is_show_in_process: 'true',
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
                                tester.amocrmEventsRequest().setAllExceptDelivered().receiveResponse();

                                tester.path.expectQueryToContain({
                                    is_show_not_sent: 'true',
                                    is_show_in_process: 'true',
                                    is_show_undelivered: 'true',
                                    is_show_delivered: 'false'
                                });
                            });
                        });
                        return;
                        describe('Дата начала и дата окончания больше текущей.', function() {
                            beforeEach(function() {
                                tester.calendar().left().cell('26').click();
                                tester.forceUpdate();
                                tester.calendar().right().cell('17').click();
                                tester.forceUpdate();
                            });

                            it('Выбрана сегодняшняя дата.', function() {
                                tester.textfield().withPlaceholder('Начальная дата').expectToHaveValue('24.08.2020');
                                tester.textfield().withPlaceholder('Конечная дата').expectToHaveValue('24.08.2020');
                            });
                            it('Нажимаю на кнопку "Применить". Отправляется запрос сегодняшних событий.', function() {
                                tester.button('Применить').click();
                                Promise.runAll();
                                tester.amocrmEventsRequest().setDefaultDateRange().expectToBeSent();
                            });
                        });
                        describe('Дата начала меньше текущей, а дата окончания больше текущей.', function() {
                            beforeEach(function() {
                                tester.calendar().left().cell('10').click();
                                tester.forceUpdate();
                                tester.calendar().right().cell('17').click();
                                tester.forceUpdate();
                            });

                            it('Выбрана сегодняшняя дата в качестве конечной.', function() {
                                tester.textfield().withPlaceholder('Начальная дата').expectToHaveValue('10.08.2020');
                                tester.textfield().withPlaceholder('Конечная дата').expectToHaveValue('24.08.2020');
                            });
                            it(
                                'Нажимаю на кнопку "Применить". Отправляется запрос событий отфильтрованый по ' +
                                'периоду, окончанием которого является сегодняшний день.',
                            function() {
                                tester.button('Применить').click();
                                Promise.runAll();
                                tester.amocrmEventsRequest().setAnotherDateRange().expectToBeSent();
                            });
                        });
                    });
                    return;
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
                return;
                it('Кнопка "Применить" заблокирована. Выбран период со вчерашнего дня по сегдняшний.', function() {
                    tester.button('Применить').expectToHaveAttribute('disabled');

                    tester.root.expectTextContentToHaveSubstring('Тип CRM: amoCRM');
                    tester.textfield().withPlaceholder('Начальная дата').expectToHaveValue('24.08.2020');
                    tester.textfield().withPlaceholder('Конечная дата').expectToHaveValue('24.08.2020');
                });
            });
            return;
            describe('Открываю раздел "CRM-интеграции". Нажимаю на кнопку "Применить".', function() {
                beforeEach(function() {
                    tester.path.open('/crm-integrations');
                    Promise.runAll();
                    tester.directionRequest().addAppStates().receiveResponse();

                    tester.button('Применить').click();
                    Promise.runAll();
                    tester.integrationsRequest().receiveResponse();
                });

                it(
                    'Нажимаю на кнопку действий в строке, относящейся к amoCRM. Отображена ссылка на раздел ' +
                    'переотправки событий.',
                function() {
                    tester.table().cell().withContent('amoCRM').row().actionsMenu().click();

                    tester.menuitem('Переотправить события').expectHrefToHavePath('/event-resending');
                    tester.menuitem('Переотправить события').expectHrefQueryToContain({
                        app_id: '295684',
                        partner: 'amocrm'
                    });
                });
                it(
                    'В строках, не относящихся к amoCRM отображается ссылка на раздел переотправки событий.',
                function() {
                    tester.table().cell().withContent('customCRM').row().actionsMenu().click();
                    tester.menuitem('Переотправить события').expectToHaveClass('ant-dropdown-menu-item-disabled');
                });
            });
            it(
                'Открываю раздел "Переотправка событий" с фильтром. Дата начала и дата окончания больше текущей. ' +
                'Выбрана сегодняшняя дата.',
            function() {
                tester.path.open('/event-resending', {
                    date_from: '2020-08-26 00:00:00',
                    date_till: '2020-09-17 23:59:59',
                    id: '28394',
                    app_id: '4735',
                    partner: 'amocrm',
                    numa: '79162937183',
                    is_show_not_sent: 'true',
                    is_show_in_process: 'true',
                    is_show_undelivered: 'true',
                    is_show_delivered: 'true',
                    limit: '50',
                    offset: '0',
                    sort: ['{"field":"event_time","order":"desc"}']
                });

                Promise.runAll();
                tester.amocrmEventsRequest().setDefaultDateRange().receiveResponse();

                tester.textfield().withPlaceholder('Начальная дата').expectToHaveValue('24.08.2020');
                tester.textfield().withPlaceholder('Конечная дата').expectToHaveValue('24.08.2020');
            });
            it(
                'Открываю раздел "Переотправка событий" с фильтром. Дата начала меньше текущей, а дата окончания ' +
                'больше текущей. Выбрана сегодняшняя дата в качестве конечной.',
            function() {
                tester.path.open('/event-resending', {
                    date_from: '2020-08-10 00:00:00',
                    date_till: '2020-09-17 23:59:59',
                    id: '28394',
                    app_id: '4735',
                    partner: 'amocrm',
                    numa: '79162937183',
                    is_show_not_sent: 'true',
                    is_show_in_process: 'true',
                    is_show_undelivered: 'true',
                    is_show_delivered: 'true',
                    limit: '50',
                    offset: '0',
                    sort: ['{"field":"event_time","order":"desc"}']
                });

                Promise.runAll();
                tester.amocrmEventsRequest().setAnotherDateRange().receiveResponse();

                tester.textfield().withPlaceholder('Начальная дата').expectToHaveValue('10.08.2020');
                tester.textfield().withPlaceholder('Конечная дата').expectToHaveValue('24.08.2020');
            });
            it(
                'Открываю раздел "Переотправка событий" с фильтром. Дата окончания меншье текущей. Отправлен запрос ' +
                'событий с фильтрацией. Поля фильтра заполнены.',
            function() {
                tester.path.open('/event-resending', {
                    date_from: '2020-07-26 00:00:00',
                    date_till: '2020-08-17 23:59:59',
                    id: '28394',
                    app_id: '4735',
                    partner: 'customCRM',
                    numa: '79162937183',
                    is_show_not_sent: 'false',
                    is_show_in_process: 'false',
                    is_show_undelivered: 'true',
                    is_show_delivered: 'false',
                    limit: '50',
                    offset: '0',
                    sort: ['{"field":"event_time","order":"desc"}']
                });

                Promise.runAll();
                tester.amocrmEventsRequest().setUndeliveredOnly().setCustomCRM().receiveResponse();

                tester.root.expectTextContentToHaveSubstring('Тип CRM: customCRM');
                tester.textfield().withPlaceholder('App ID').expectToHaveValue('4735');
                tester.textfield().withPlaceholder('ID сессии').expectToHaveValue('28394');
                tester.textfield().withPlaceholder('Номер абонента').expectToHaveValue('79162937183');
                tester.textfield().withPlaceholder('Начальная дата').expectToHaveValue('26.07.2020');
                tester.textfield().withPlaceholder('Конечная дата').expectToHaveValue('17.08.2020');
                tester.checkbox().withLabel('Недоставленные').expectToBeChecked();
                tester.checkbox().withLabel('Доставленные').expectNotToBeChecked();
                tester.checkbox().withLabel('Отправляются').expectNotToBeChecked();
                tester.checkbox().withLabel('Не отправлялись').expectNotToBeChecked();
            });
            it('Пункт меню "Переотправка событий" отображен.', function() {
                tester.menuitem('Переотправка событий').expectHrefToHavePath('/event-resending');
            });
        });
        return;
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
        describe('Доступен только раздел "Клиенты".', function() {
            beforeEach(function() {
                tester.userRequest().allowReadApps().allowWriteApps().receiveResponse();
                tester.directionRequest().addAppStates().addTpTpvAll().receiveResponse();
            });

            describe('Нажимаю на кнпоку "Применить".', function() {
                beforeEach(function() {
                    tester.button('Применить').click();
                    Promise.runAll();
                    tester.appsRequest().receiveResponse();
                });

                it('Нажимаю на кнпоку меню в строке таблицы. Открывается меню.', function() {
                    tester.table().cell().withContent('ООО "Трупоглазые жабы"').row().actionsMenu().click();
                    Promise.runAll();
                    tester.appUsersRequest().receiveResponse();

                    tester.dropdown.expectToHaveTextContent(
                        'История изменений ' +
                        'Редактирование клиента ' +
                        'Перейти в ЛК ' +
                        'Ок'
                    );
                });
                it(
                    'Нажимаю на кнопку второй страницы. Получены данные второй страницы. Отображена вторая страница.',
                function() {
                    tester.table().paging().page(2).click();
                    Promise.runAll();
                    tester.appsRequest().setSecondPage().receiveResponse();

                    tester.table().paging().page(1).expectNotToHaveClass('pagination-item-active');
                    tester.table().paging().page(2).expectToHaveClass('pagination-item-active');
                });
                it('Отображена первая страница.', function() {
                    tester.table().paging().page(1).expectToHaveClass('pagination-item-active');
                    tester.table().paging().page(2).expectNotToHaveClass('pagination-item-active');

                    tester.root.expectTextContentToHaveSubstring(
                        '1 2 ' +
                        'Строк на странице 50 ' +
                        'Всего записей 75'
                    );
                });
            });
            it('В поле статусов отображены названия статусов.', function() {
                tester.root.expectToHaveTextContent(
                    'Новосистем ' +
                    'Admin Panel ' +
                    'Клиенты ' +

                    'Клиенты ' +
                    'Тарифные планы ' +
                    'Статусы ' +

                    'Ждет ' +
                    'Активен ' +
                    'Заблокирован вручную ' +
                    'Заблокирован по лимиту ' +
                    'Заблокирован по долгу ' +

                    'Применить ' +
                    'Настроить столбцы ' +

                    'App ID ' +
                    'Customer ID ' +
                    'Имя клиента ' +
                    'Статус ' +
                    'Тарифный план ' +
                    'Номера ' +
                    'Лицевой счет ' +
                    'Баланс ' +
                    'Сайты ' +
                    'Логины/E-mail ' +
                    'Тип клиента ' +
                    'Нода ' +
                    'ID агента ' +
                    'Наблюдатели ' +

                    'Нет данных ' +

                    '1 ' +
                    'Строк на странице 50 ' +
                    'Всего записей 0'
                );
            });
        });
        it(
            'Доступен только раздел "CRM-интеграции". Нажимаю на кнопку действий в строке, относящейся к amoCRM. ' +
            'Ссылка на раздел переотправки событий заблокирована. ',
        function() {
            tester.userRequest().allowReadCrmIntegration().receiveResponse();
            tester.directionRequest().addAppStates().receiveResponse();

            tester.button('Применить').click();
            Promise.runAll();
            tester.integrationsRequest().receiveResponse();

            tester.table().cell().withContent('amoCRM').row().actionsMenu().click();
            tester.menuitem('Переотправить события').expectToHaveClass('ant-dropdown-menu-item-disabled');
        });
        it(
            'Доступен раздел "Переотправка событий". Прав на запись в разделе нет. Заполняю поля фильтра. Кнопка ' +
            '"Применить" заблокирована.',
        function() {
            tester.userRequest().allowReadEventResending().receiveResponse();

            tester.textfield().withPlaceholder('App ID').fill('4735');
            tester.textfield().withPlaceholder('ID сессии').fill('28394');
            tester.textfield().withPlaceholder('Номер абонента').fill('79162937183');
            tester.textfield().withPlaceholder('Начальная дата').click();
            tester.forceUpdate();

            tester.calendar().left().prevMonth().click();
            tester.calendar().left().cell('26').click();
            tester.forceUpdate();
            tester.calendar().right().cell('17').click();
            tester.forceUpdate();

            tester.button('Применить').click();
            Promise.runAll();
            tester.amocrmEventsRequest().receiveResponse();

            tester.table().cell().withContent('79157389283').row().checkbox().click();
            tester.button('Повторить отправку').expectToHaveAttribute('disabled');
        });
    });
});
