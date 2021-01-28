window.runTests = function () {
    tests.addTest(function (options) {
        const {ProposalGeneratorFrontendTester} = options;

        describe('Аутентифицируюсь.', function() {
            let tester;

            beforeEach(function() {
                tester = new ProposalGeneratorFrontendTester(options);
                tester.path.open('/');

                tester.textfield().withLabel('Логин').fill('t.daskalova');
                tester.textfield().withLabel('Пароль').fill('2G892H4gsGjk12ef');

                tester.button('Войти').click();
                Promise.runAll();
                tester.loginUserRequest().receiveResponse();
                tester.accountRequest().receiveResponse();
                tester.cpTemplatesRequest().receiveResponse();
            });

            describe('Нажимаю на кнопку "Продолжить".', function() {
                beforeEach(function() {
                    tester.textfield().withLabel('Название компании *').fill('Некая кампания');
                    tester.select().withLabel('Шаблон КП').click();
                    tester.select().option('Шаблон CoMagic').click();

                    tester.button('Продолжить').click();
                    Promise.runAll();
                    tester.cpTasksRequest().receiveResponse();
                    tester.cpRequirementsRequest().receiveResponse();
                    tester.flushUpdates();
                });

                describe('Перехожу на шаг "Настройка номеров".', function() {
                    beforeEach(function() {
                        tester.button('Продолжить').click();
                        Promise.runAll();
                        tester.tpsRequest().receiveResponse();
                        tester.flushUpdates();

                        tester.select().withLabel('Тарифный план').click();
                        tester.select().option('Простой коллтрекинг').click();
                        tester.flushUpdates();
                        Promise.runAll();
                        tester.opsRequest().receiveResponse();
                        tester.componentsRequest().receiveResponse();

                        tester.table().row().atIndex(0).column().withHeader('Название опции').select().click();
                        tester.select().option('Сквозная аналитика Simple').click();
                        tester.flushUpdates();
                        Promise.runAll();
                        tester.componentsRequest().addOption().receiveResponse();
                        tester.flushUpdates();

                        tester.button('Продолжить').click();
                        tester.flushUpdates();
                    });

                    describe('Заполняю одно из полей.', function() {
                        beforeEach(function() {
                            tester.formRow().withLabel('Выбор номера').table().row().atIndex(0).column().
                                withHeader('Сайт').textfield().fill('somesite.com');
                            tester.flushUpdates();
                        });

                        describe('Заполняю остальные поля.', function() {
                            beforeEach(function() {
                                tester.formRow().withLabel('Выбор номера').table().row().atIndex(0).column().
                                    withHeader('Префикс для пула ДТ').select().click();
                                tester.select().option('+7 (499)').click();
                                tester.flushUpdates();
                            });

                            describe('Заполняю еще одну строку.', function() {
                                beforeEach(function() {
                                    tester.formRow().withLabel('Выбор номера').table().row().atIndex(1).column().
                                        withHeader('Сайт').textfield().fill('secondsite.com');
                                    tester.flushUpdates();

                                    tester.formRow().withLabel('Выбор номера').table().row().atIndex(1).column().
                                        withHeader('Префикс для пула ДТ').select().click();
                                    tester.select().option('+7 (495)').click();
                                    tester.flushUpdates();
                                });

                                it(
                                    'Перехожу на следующий шаг и возвращаюсь обратно. Заполняю еще одну строку. ' +
                                    'Перехожу на следующий шаг и возвращаюсь обратно. Отображены три заполненные ' +
                                    'строки.',
                                function() {
                                    tester.button('Продолжить').click();
                                    tester.flushUpdates();
                                    tester.stepTitle('Настройка номеров').click();
                                    tester.flushUpdates();

                                    tester.formRow().withLabel('Выбор номера').table().row().atIndex(2).column().
                                        withHeader('Сайт').textfield().fill('thirdsite.com');
                                    tester.flushUpdates();

                                    tester.formRow().withLabel('Выбор номера').table().row().atIndex(2).column().
                                        withHeader('Префикс для пула ДТ').select().click();
                                    tester.select().option('+7 (916)').click();
                                    tester.flushUpdates();

                                    tester.button('Продолжить').click();
                                    tester.flushUpdates();
                                    tester.stepTitle('Настройка номеров').click();
                                    tester.flushUpdates();

                                    tester.formRow().withLabel('Выбор номера').table().row().atIndex(0).column().
                                        withHeader('Сайт').textfield().expectToHaveValue('somesite.com');
                                    tester.formRow().withLabel('Выбор номера').table().row().atIndex(0).column().
                                        withHeader('Префикс для пула ДТ').select().expectToHaveTextContent('+7 (499)');

                                    tester.formRow().withLabel('Выбор номера').table().row().atIndex(1).column().
                                        withHeader('Сайт').textfield().expectToHaveValue('secondsite.com');
                                    tester.formRow().withLabel('Выбор номера').table().row().atIndex(1).column().
                                        withHeader('Префикс для пула ДТ').select().expectToHaveTextContent('+7 (495)');

                                    tester.formRow().withLabel('Выбор номера').table().row().atIndex(2).column().
                                        withHeader('Сайт').textfield().expectToHaveValue('thirdsite.com');
                                    tester.formRow().withLabel('Выбор номера').table().row().atIndex(2).column().
                                        withHeader('Префикс для пула ДТ').select().expectToHaveTextContent('+7 (916)');

                                    tester.formRow().withLabel('Выбор номера').table().row().atIndex(3).column().
                                        withHeader('Сайт').textfield().expectToHaveValue('');
                                    tester.formRow().withLabel('Выбор номера').table().row().atIndex(3).column().
                                        withHeader('Префикс для пула ДТ').select().expectToHaveTextContent('Выбрать');

                                    tester.formRow().withLabel('Выбор номера').table().row().atIndex(4).
                                        expectNotToExist();
                                });
                                it(
                                    'Заполняю еще одну строку. Удяляю одну из строк. Перехожу на следующий шаг и ' +
                                    'возвращаюсь обратно. Отображены две заполненные строки.',
                                function() {
                                    tester.formRow().withLabel('Выбор номера').table().row().atIndex(2).column().
                                        withHeader('Сайт').textfield().fill('thirdsite.com');
                                    tester.flushUpdates();

                                    tester.formRow().withLabel('Выбор номера').table().row().atIndex(2).column().
                                        withHeader('Префикс для пула ДТ').select().click();
                                    tester.select().option('+7 (916)').click();
                                    tester.flushUpdates();

                                    tester.formRow().withLabel('Выбор номера').table().row().atIndex(1).removeButton().
                                        click();
                                    tester.flushUpdates();

                                    tester.button('Продолжить').click();
                                    tester.flushUpdates();
                                    tester.stepTitle('Настройка номеров').click();
                                    tester.flushUpdates();

                                    tester.formRow().withLabel('Выбор номера').table().row().atIndex(0).column().
                                        withHeader('Сайт').textfield().expectToHaveValue('somesite.com');
                                    tester.formRow().withLabel('Выбор номера').table().row().atIndex(0).column().
                                        withHeader('Префикс для пула ДТ').select().expectToHaveTextContent('+7 (499)');

                                    tester.formRow().withLabel('Выбор номера').table().row().atIndex(1).column().
                                        withHeader('Сайт').textfield().expectToHaveValue('thirdsite.com');
                                    tester.formRow().withLabel('Выбор номера').table().row().atIndex(1).column().
                                        withHeader('Префикс для пула ДТ').select().expectToHaveTextContent('+7 (916)');

                                    tester.formRow().withLabel('Выбор номера').table().row().atIndex(2).column().
                                        withHeader('Сайт').textfield().expectToHaveValue('');
                                    tester.formRow().withLabel('Выбор номера').table().row().atIndex(2).column().
                                        withHeader('Префикс для пула ДТ').select().expectToHaveTextContent('Выбрать');

                                    tester.formRow().withLabel('Выбор номера').table().row().atIndex(3).
                                        expectNotToExist();
                                });
                            });
                            it('Нажимаю на кнопку удаления непустой строки. Строка удалена.', function() {
                                tester.formRow().withLabel('Выбор номера').table().row().atIndex(0).removeButton().
                                    click();
                                tester.flushUpdates();

                                tester.formRow().withLabel('Выбор номера').table().row().atIndex(0).column().
                                    withHeader('Сайт').textfield().expectToHaveValue('');

                                tester.formRow().withLabel('Выбор номера').table().row().atIndex(0).column().
                                    withHeader('Префикс для пула ДТ').select().expectToHaveTextContent('Выбрать');

                                tester.formRow().withLabel('Выбор номера').table().row().atIndex(1).expectNotToExist();
                            });
                            it('Нажимаю на кнопку удаления пустой строки. Ничего не произошло.', function() {
                                tester.formRow().withLabel('Выбор номера').table().row().atIndex(1).removeButton().
                                    click();
                                tester.flushUpdates();

                                tester.formRow().withLabel('Выбор номера').table().row().atIndex(0).expectToBeVisible();
                                tester.formRow().withLabel('Выбор номера').table().row().atIndex(1).expectToBeVisible();
                            });
                            it(
                                'Поля заполнены. Появилась пустая строка снизу. Кнопка удаления пустой строки ' +
                                'заблокирована.',
                            function() {
                                tester.formRow().withLabel('Выбор номера').table().row().atIndex(0).column().
                                    withHeader('Сайт').textfield().expectToHaveValue('somesite.com');
                                tester.formRow().withLabel('Выбор номера').table().row().atIndex(0).column().
                                    withHeader('Префикс для пула ДТ').select().expectToHaveTextContent('+7 (499)');

                                tester.formRow().withLabel('Выбор номера').table().row().atIndex(1).column().
                                    withHeader('Сайт').textfield().expectToHaveValue('');
                                tester.formRow().withLabel('Выбор номера').table().row().atIndex(1).column().
                                    withHeader('Префикс для пула ДТ').select().expectToHaveTextContent('Выбрать');

                                tester.formRow().withLabel('Выбор номера').table().row().atIndex(1).removeButton().
                                    expectToHaveClass('cm-disabled');
                            });
                        });
                        describe('Перехожу на следующий шаг и возвращаюсь обратно.', function() {
                            beforeEach(function() {
                                tester.button('Продолжить').click();
                                tester.flushUpdates();
                                tester.stepTitle('Настройка номеров').click();
                                tester.flushUpdates();
                            });

                            it(
                                'Заполняю остальные поля. Поля заполнены. Появилась пустая строка снизу. Кнопка ' +
                                'удаления пустой строки заблокирована.',
                            function() {
                                tester.formRow().withLabel('Выбор номера').table().row().atIndex(0).column().
                                    withHeader('Префикс для пула ДТ').select().click();
                                tester.flushUpdates();
                                tester.select().option('+7 (499)').click();
                                tester.flushUpdates();

                                tester.formRow().withLabel('Выбор номера').table().row().atIndex(0).column().
                                    withHeader('Сайт').textfield().expectToHaveValue('somesite.com');
                                tester.formRow().withLabel('Выбор номера').table().row().atIndex(0).column().
                                    withHeader('Префикс для пула ДТ').select().expectToHaveTextContent('+7 (499)');

                                tester.formRow().withLabel('Выбор номера').table().row().atIndex(1).column().
                                    withHeader('Сайт').textfield().expectToHaveValue('');
                                tester.formRow().withLabel('Выбор номера').table().row().atIndex(1).column().
                                    withHeader('Префикс для пула ДТ').select().expectToHaveTextContent('Выбрать');

                                tester.formRow().withLabel('Выбор номера').table().row().atIndex(1).removeButton().
                                    expectToHaveClass('cm-disabled');
                            });
                            it('Поле заполнено. Отображена только одна строка.', function() {
                                tester.formRow().withLabel('Выбор номера').table().row().atIndex(0).column().
                                    withHeader('Сайт').textfield().expectToHaveValue('somesite.com');
                                tester.formRow().withLabel('Выбор номера').table().row().atIndex(1).expectNotToExist();
                            });
                        });
                        it('Поле заполнено. Отображена только одна строка.', function() {
                            tester.formRow().withLabel('Выбор номера').table().row().atIndex(0).column().
                                withHeader('Сайт').textfield().expectToHaveValue('somesite.com');

                            tester.formRow().withLabel('Выбор номера').table().row().atIndex(1).expectNotToExist();
                        });
                    });
                    it('Отображена строка с пустыми полями.', function() {
                        tester.formRow().withLabel('Выбор номера').table().row().atIndex(0).column().withHeader('Сайт').
                            textfield().expectToHaveAttribute('placeholder', 'site.ru');

                        tester.formRow().withLabel('Выбор номера').table().row().atIndex(0).column().
                            withHeader('Префикс для пула ДТ').select().expectToHaveTextContent('Выбрать');

                        tester.formRow().withLabel('Выбор номера').table().row().atIndex(1).expectNotToExist();
                    });
                });
                describe('Выбираю задачу.', function() {
                    beforeEach(function() {
                        tester.table().row().atIndex(0).column().withHeader('Задача').select().click();
                        tester.flushUpdates();
                        tester.select().option('Номер для организации связи с клиентами').click();
                        tester.flushUpdates();
                    });

                    it(
                        'Перехожу на следующий шаг и возвращаюсь обратно. Отображена одна запролненная строка.',
                    function() {
                        tester.button('Продолжить').click();
                        tester.flushUpdates();
                        tester.stepTitle('Задачи и требования').click();
                        tester.flushUpdates();

                        tester.table().row().atIndex(0).column().withHeader('Задача').select().
                            expectToHaveTextContent('Номер для организации связи с клиентами');
                        tester.table().row().atIndex(0).column().withHeader('Решение').textarea().
                            expectToHaveTextContent('Единый канал коммуникаций с компанией');

                        tester.table().row().atIndex(1).expectToBeVisible();
                        tester.table().row().atIndex(2).expectNotToExist();
                    });
                    it('Нажимаю на кнопку удаления. Отображена только одна строка и она пуста.', function() {
                        tester.table().row().atIndex(0).removeButton().click();
                        tester.flushUpdates();

                        tester.table().row().atIndex(0).column().withHeader('Задача').select().
                            expectToHaveTextContent('');
                        tester.table().row().atIndex(0).column().withHeader('Решение').textarea().
                            expectToHaveTextContent('');

                        tester.table().row().atIndex(1).expectNotToExist();
                    });
                    it('Поле "Решение" заполненно автоматически. Добавлена новая строка.', function() {
                        tester.table().row().atIndex(0).column().withHeader('Решение').textarea().
                            expectToHaveTextContent('Единый канал коммуникаций с компанией');

                        tester.table().row().atIndex(1).expectToBeVisible();
                        tester.table().row().atIndex(2).expectNotToExist();
                    });
                });
                it('Ввожу решение. Новая строка не была добавлена.', function() {
                    tester.table().row().atIndex(0).column().withHeader('Решение').textarea().
                        fill('Некое решение');
                    tester.flushUpdates();

                    tester.table().row().atIndex(0).column().withHeader('Решение').textarea().
                        expectToHaveTextContent('Некое решение');
                    tester.table().row().atIndex(1).expectNotToExist();
                });
                it('Нажимаю на кнпоку "Начать сначала". Отображен первый шаг.', function() {
                    tester.button('Начать сначала').click();

                    tester.body.expectToHaveTextContent(
                        'Создание коммерческого предложения ' +
                        'Выйти ' +

                        '1 Название компании ' +

                        'Название компании * ' +
                        'Название агентства ' +

                        'Проект ' +

                        'CoMagic ' +
                        'UIS ' +
                        'CallGear ' +

                        'Шаблон КП ' +
                        'Шаблон CoMagic ' +

                        'Подпись менеджера ' +

                        'Продолжить ' +

                        '2 Задачи и требования ' +
                        '3 Конфигурация тарифного плана ' +
                        '4 Настройка номеров ' +
                        '5 Лимиты ' +
                        '6 Отображение сервисов в КП ' +
                        '7 Стоимостное предложение'
                    );
                });
                it('Отображен второй шаг.', function() {
                    tester.switchField().withLabel('Задачи').expectToBeTurnedOn();
                    tester.switchField().withLabel('Требования').expectToBeTurnedOff();

                    tester.body.expectToHaveTextContent(
                        'Создание коммерческого предложения ' +
                        'Выйти ' +

                        'Название компании ' +
                        '2 Задачи и требования ' +

                        'Задачи ' +
                        'Задача Решение ' +
                        'Требования ' +

                        'Продолжить ' +
                        'Начать сначала ' +

                        '3 Конфигурация тарифного плана ' +
                        '4 Настройка номеров ' +
                        '5 Лимиты ' +
                        '6 Отображение сервисов в КП ' +
                        '7 Стоимостное предложение'
                    );
                });
            });
            it('Нажимаю на кнопку "Выйти". Попадаю на страницу аутентификации.', function() {
                tester.button('Выйти').click();
                Promise.runAll();
                tester.logoutUserRequest().receiveResponse();

                tester.body.expectToHaveTextContent('Логин Пароль Войти');
            });
            it('Отображен первый шаг.', function() {
                tester.body.expectToHaveTextContent(
                    'Создание коммерческого предложения ' +
                    'Выйти ' +

                    '1 Название компании ' +

                    'Название компании * ' +
                    'Название агентства ' +

                    'Проект ' +

                    'CoMagic ' +
                    'UIS ' +
                    'CallGear ' +

                    'Шаблон КП ' +
                    'Шаблон CoMagic ' +

                    'Подпись менеджера ' +

                    'Продолжить ' +

                    '2 Задачи и требования ' +
                    '3 Конфигурация тарифного плана ' +
                    '4 Настройка номеров ' +
                    '5 Лимиты ' +
                    '6 Отображение сервисов в КП ' +
                    '7 Стоимостное предложение'
                );
            });
        });
    })
};
