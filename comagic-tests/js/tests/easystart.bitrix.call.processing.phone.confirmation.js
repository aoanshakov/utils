tests.addTest(function(requestsManager, testersFactory, wait, utils) {
    var tester;
    
    beforeEach(function() {
        tester = new EasystartBitrix(requestsManager, testersFactory, utils);
    });

    describe(
        'Открываю страницу легкого входа amoCRM. Нажимаю на кнопку "Тестировать бесплатно". Нажимаю на кнпоку ' +
        '"Продолжить". В соответствии с данными, полученными от сервера ранее были выбраны три сотрудника. Отмечаю ' +
        'других трех сотрудников. Нажимаю на кнопку "Продолжить". В соответствии с данными, полученными от сервера ' +
        'ранее был выбран тип переадресации "Одновременно всем" и ни у одного из них не номер не был подтвержден. ' +
        'Синхронизация сотрудников завершена. Нажимаю на кнопку "По очереди".',
    function() {
        beforeEach(function() {
            EasyStart.getApplication().checkIfPartnerReady();
            tester.tryForFreeButton.click();
            tester.requestCreateAccount().send();
            wait(100);

            tester.settingsStep('Номер телефона').nextButton().click();
            tester.requestEmployees().send();
            wait(100);

            tester.employeesGrid.row().atIndex(1).column().first().checkbox().click();
            tester.employeesGrid.row().first().column().first().checkbox().click();
            tester.employeesGrid.row().atIndex(3).column().first().checkbox().click();
            tester.employeesGrid.row().atIndex(2).column().first().checkbox().click();
            wait(100);

            tester.settingsStep('Сотрудники').nextButton().click();
            wait(100);

            tester.requestChooseEmployees().send();

            tester.requestSyncEmployees().setDone().send();
            wait(100);

            tester.sequentialForwardingTypeButton().click();
            wait(100);
        });

        it('Кнопка "Получить SMS" заблокирована.', function() {
            tester.receiveSmsButton.expectToBeDisabled();
        });
        describe('Ввожу номер телефона сотрудника.', function() {
            beforeEach(function() {
                tester.employeePhoneField().input('9161234567');
                wait();
            });

            it('Кнопка "Получить SMS" доступна. Кнопка "Подтвердить" скрыта.', function() {
                tester.receiveSmsButton.expectToBeEnabled();
                tester.confirmNumberButton.expectToBeHidden();
            });
            describe('Нажимаю на кнопку "Получить SMS".', function() {
                beforeEach(function() {
                    tester.receiveSmsButton.click();
                });

                it(
                    'В соответствии с данными, полученными от сервера получение кода подтверждения ' +
                    'станет снова доступным через одну минуту. Прошла одна секунда. Кнопка получения ' +
                    'кода подтвеждения содержит текст "59 секунд".',
                function() {
                    tester.requestSms().send();
                    wait(3);

                    tester.receiveSmsButton.expectToHaveTextContent('59 секунд');
                });
                it(
                    'В соответствии с данными, полученными от сервера получение кода подтверждения ' +
                    'станет снова доступным через четыре часа. Прошла одна секунда. Кнопка получения ' +
                    'кода подтвеждения содержит текст "3 часа 59 минут".',
                function() {
                    tester.requestSms().setFourHours().send();
                    wait(3);

                    tester.receiveSmsButton.expectToHaveTextContent('3 часа 59 минут');
                });
                it(
                    'В соответствии с данными, полученными от сервера получение кода подтверждения ' +
                    'станет снова доступным через четыре минуты. Прошла одна секунда. Кнопка ' +
                    'получения кода подтвеждения содержит текст "3 минуты 59 секунд".',
                function() {
                    tester.requestSms().setFourMinutes().send();
                    wait(3);

                    tester.receiveSmsButton.expectToHaveTextContent('3 минуты 59 секунд');
                });
            });
            describe('Нажимаю на кнопку "Получить SMS".', function() {
                beforeEach(function() {
                    tester.receiveSmsButton.click();
                    tester.requestSms().send();
                    wait();
                });

                it('Кнопка "Подтвердить" видима.', function() {
                    tester.confirmNumberButton.expectToBeVisible();
                });
                describe('Прошло 34 секунды.', function() {
                    beforeEach(function() {
                        wait(2 * 34);
                    });

                    it('Кнопка получения кода подтверждения содержит текст "26 секунд".', function() {
                        tester.receiveSmsButton.expectToHaveTextContent('26 секунд');
                    });
                    describe('Ввожу код подтверждения.', function() {
                        beforeEach(function() {
                            tester.smsCodeField().input('1234');
                            wait();
                        });

                        it(
                            'Кнопка "Продолжить" заблокирована. Текст "Номер подтвержден" не ' +
                            'отображается.',
                        function() {
                            tester.settingsStep('Правила обработки вызовов').nextButton().
                                expectToBeDisabled();

                            tester.callProcessingGrid.row().first().column().
                                withHeader('Переадресация на телефон сотрудника *').createTester().
                                forDescendantWithText('Номер подтвержден').expectToBeHiddenOrNotExist();
                        });
                        describe('Нажимаю на кнопку "Подтвердить".', function() {
                            beforeEach(function() {
                                tester.confirmNumberButton.click();
                                wait();
                            });

                            describe(
                                'В соответствии с данными, полученными от сервера код подтверждения ' +
                                'был некорректным.',
                            function() {
                                beforeEach(function() {
                                    tester.requestCodeInput().setCodeInvalid().send();
                                    wait(6);
                                });

                                it(
                                    'Отображено сообщение о том, что код подтверждения некорректен. ' +
                                    'Кнопка "Продолжить" заблокирована.',
                                function() {
                                    tester.errorMessage(
                                        'Неверный код, пожалуйста, запросите новый код'
                                    ).expectToBeVisible();
                                    
                                    tester.settingsStep('Правила обработки вызовов').nextButton().
                                        expectToBeDisabled();
                                });
                                it(
                                    'Прошло некоторое время. Кнопка "Получить SMS" снова стала ' +
                                    'доступной. Нажимаю на кнопку "Получить SMS". Поле "Код из SMS" ' +
                                    'является пустым.',
                                function() {
                                    wait(24 * 2);

                                    tester.receiveSmsButton.click();
                                    tester.requestSms().send();
                                    wait();

                                    tester.smsCodeField().expectToHaveValue('');
                                });
                            });
                            describe(
                                'В соответствии с данными, полученными от сервера код подтверждения ' +
                                'был корректным.',
                            function() {
                                beforeEach(function() {
                                    wait(200);
                                    tester.requestCodeInput().send();
                                    wait(200);
                                });

                                it(
                                    'Кнопка "Продолжить" доступна. Отображено сообщение "Номер ' +
                                    'подтвержден".',
                                function() {
                                    tester.settingsStep('Правила обработки вызовов').nextButton().
                                        expectToBeEnabled();

                                    tester.callProcessingGrid.row().first().column().
                                        withHeader('Переадресация на телефон сотрудника *').
                                        createTester().forDescendantWithText('Номер подтвержден').
                                        expectToBeVisible();
                                });
                                it(
                                    'Стираю последнюю цифру телефона сотрудника. Кнопка "Продолжить" ' +
                                    'заблокирована.',
                                function() {
                                    tester.employeePhoneField().pressBackspace();
                                    wait(2);

                                    tester.settingsStep('Правила обработки вызовов').nextButton().
                                        expectToBeDisabled();
                                });
                                it(
                                    'Изменяю номер телефона сотрудника. Кнопка "Продолжить" ' +
                                    'заблокирована.',
                                function() {
                                    tester.employeePhoneField().fill('9161234568');
                                    wait();

                                    tester.settingsStep('Правила обработки вызовов').nextButton().
                                        expectToBeDisabled();
                                });
                                describe(
                                    'Ввожу значение большее 100 в поле, находящееся внутри колонки ' +
                                    '"Время дозвона".',
                                function() {
                                    beforeEach(function() {
                                        tester.dialTimeField().fill('123');
                                        wait();
                                    });

                                    it('Кнопка "Продолжить" заблокирована.', function() {
                                        tester.settingsStep('Правила обработки вызовов').nextButton().
                                            expectToBeDisabled();
                                    });
                                    it(
                                        'Изменяю значение поля, находящегося внутри колонки "Время ' +
                                        'дозвона" на корректное. Кнопка "Продолжить" доступна.',
                                    function() {
                                        tester.dialTimeField().pressBackspace();
                                        wait(2);

                                        tester.settingsStep('Правила обработки вызовов').nextButton().
                                            expectToBeEnabled();
                                    });
                                });
                                describe(
                                    'Ввожу номер телефона другого сотрудника частично.',
                                function() {
                                    beforeEach(function() {
                                        tester.secondEmployeePhoneField().fill('916234');
                                        wait();
                                    });

                                    it('Кнопка "Продолжить" заблокирована.', function() {
                                        tester.settingsStep('Правила обработки вызовов').nextButton().
                                            expectToBeDisabled();
                                    });
                                    describe(
                                        'Ввожу оставшуюся часть номера телефона другого сотрудника.',
                                    function() {
                                        beforeEach(function() {
                                            tester.secondEmployeePhoneField().input('5678');
                                            wait();
                                        });

                                        it('Кнопка "Продолжить" заблокирована.', function() {
                                            tester.settingsStep('Правила обработки вызовов').
                                                nextButton().expectToBeDisabled();
                                        });
                                        describe('Нажимаю на кнопку "Получить SMS".', function() {
                                            beforeEach(function() {
                                                tester.secondReceiveSmsButton.click();
                                                tester.requestSms().setSecondEmployee().send();
                                                wait(2);
                                            });

                                            it('Кнопка "Продолжить" заблокирована.', function() {
                                                tester.settingsStep('Правила обработки вызовов').
                                                    nextButton().expectToBeDisabled();
                                            });
                                            describe('Изменяю номер телефона сотрудника.', function() {
                                                beforeEach(function() {
                                                    tester.secondEmployeePhoneField().pressBackspace();
                                                    wait(2);

                                                    tester.secondEmployeePhoneField().input('9');
                                                    wait(2);
                                                });

                                                it('Поле "Код из SMS" скрыто.', function() {
                                                    tester.secondSmsCodeField().expectToBeHidden();
                                                });
                                                it('Кнопка "Продолжить" заблокирована.', function() {
                                                    tester.settingsStep('Правила обработки вызовов').
                                                        nextButton().expectToBeDisabled();
                                                });
                                            });
                                            describe('Ввожу код подтверждения.', function() {
                                                beforeEach(function() {
                                                    tester.secondSmsCodeField().input('2345');
                                                    wait(2);
                                                });

                                                it('Кнопка "Продолжить" заблокирована.', function() {
                                                    tester.settingsStep('Правила обработки вызовов').
                                                        nextButton().expectToBeDisabled();
                                                });
                                                it(
                                                    'Прошло некторое время. До возобновления ' +
                                                    'доступности кнопки "Получть SMS" осталась одна ' +
                                                    'секунда. Нажимаю на кнопку "Продолжить". ' +
                                                    'Проходит одна секунда. Нажимаю на кнопку ' +
                                                    '"Назад". Содержимое колонки "Переадресация на ' +
                                                    'телефон сотрудника" является видимым.',
                                                function() {
                                                    tester.dialTimeField().fill('15');
                                                    tester.secondEmployeePhoneField().clear();
                                                    wait(2 * 56);
                                                    
                                                    tester.settingsStep('Правила обработки вызовов').
                                                        nextButton().click();
                                                    tester.requestCallProcessingConfig().send();
                                                    wait(2);

                                                    tester.settingsStep('Настройка интеграции').
                                                        backButton().click();

                                                    tester.secondEmployeeNumberFieldsContainer.
                                                        expectNotToBeCollapsed();
                                                });
                                                describe(
                                                    'Стираю последнюю цифру номера телефона другого ' +
                                                    'сотрудника.',
                                                function() {
                                                    beforeEach(function() {
                                                        tester.secondEmployeePhoneField().
                                                            pressBackspace();
                                                        wait(3);
                                                    });

                                                    it(
                                                        'Поле "Код из SMS" скрыто. Кнопка ' +
                                                        '"Продолжить" заблокирована.',
                                                    function() {
                                                        tester.secondSmsCodeField().expectToBeHidden();

                                                        tester.
                                                            settingsStep('Правила обработки вызовов').
                                                            nextButton().expectToBeDisabled();
                                                    });
                                                    it(
                                                        'Ввожу заново последнюю цифру номера ' +
                                                        'телефона другого сотрудника. Поле "Код из ' +
                                                        'SMS" видимо. Кнопка "Продолжить" ' +
                                                        'заблокирована.',
                                                    function() {
                                                        tester.secondEmployeePhoneField().input('8');
                                                        wait(2);

                                                        tester.secondSmsCodeField().expectToBeVisible();
                                                        tester.
                                                            settingsStep('Правила обработки вызовов').
                                                            nextButton().expectToBeDisabled();
                                                    });
                                                    it(
                                                        'Изменил номер телефона другого сотрудника. ' +
                                                        'Поле "Код из SMS" скрыто. Кнопка ' +
                                                        '"Продолжить" заблокирована.',
                                                    function() {
                                                        tester.secondEmployeePhoneField().input('9');
                                                        wait(2);

                                                        tester.secondSmsCodeField().expectToBeHidden();
                                                        tester.
                                                            settingsStep('Правила обработки вызовов').
                                                            nextButton().expectToBeDisabled();
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                                describe('Ввожу значение в поле "Время дозвона".', function() {
                                    beforeEach(function() {
                                        tester.dialTimeField().fill('15');
                                        wait();
                                    });

                                    it('Отображен текст "Номер подтвержден".', function() {
                                        tester.callProcessingGrid.row().first().column().
                                            withHeader('Переадресация на телефон сотрудника *').
                                            createTester().forDescendantWithText('Номер подтвержден').
                                            expectToBeVisible();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
