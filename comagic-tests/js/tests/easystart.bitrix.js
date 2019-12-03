tests.addTest(function(requestsManager, testersFactory, wait, utils) {
    var tester;
    
    beforeEach(function() {
        tester = new EasystartBitrix(requestsManager, testersFactory, utils);
    });

    it('Открываю страницу легкого входа Битрикс24. Отображена страница авторизации.', function() {
        EasyStart.getApplication().checkIfPartnerReady();
        tester.tryForFreeButton.expectToBeVisible();
    });
    it(
        'Открываю страницу легкого входа Битрикс24. Произошла фатальная ошибка. Отображено сообщение об ошибке.',
    function() {
        tester.setFatalError();
        EasyStart.getApplication().checkIfPartnerReady();
        wait(10);
        tester.fatalErrorMessage.expectToBeVisible();
    });
    describe('Открываю страницу легкого входа Битрикс24. Нажимаю на кнопку "Тестировать бесплатно".', function() {
        beforeEach(function() {
            EasyStart.getApplication().checkIfPartnerReady();
            tester.tryForFreeButton.click();
        });

        it('Сервер отвечает, что пользователь заблокирован. Отображено сообщение об ошибке.', function() {
            tester.requestCreateAccount().setArchive().send();
            wait();

            tester.errorMessage(function (textContent) {
                return textContent.indexOf(
                    'Пользователь с e-mail chigrakov@example.com уже существует и находится в статусе "Заблокирован".'
                ) != -1;
            }).expectToBeVisible();
        });
        it('Сервер отвечает, что пользователь уже существует. Отображено сообщение об ошибке.', function() {
            tester.requestCreateAccount().setActive().send();
            wait();

            tester.errorMessage(function (textContent) {
                return textContent.indexOf('Пользователь с e-mail chigrakov@example.com уже существует.') != -1;
            }).expectToBeVisible();
        });
        it('Сервер отвечает, что E-Mail уже привязан к другой интеграции. Отображено сообщение об ошибке.', function() {
            tester.requestCreateAccount().setIdMismatch().send();
            wait();

            tester.errorMessage('E-mail chigrakov@example.com уже привязан к другой интеграции').expectToBeVisible();
        });
        it('Сервер отвечает, что номер телефона не был указан в профиле. Отображено сообщение об ошибке.', function() {
            tester.requestCreateAccount().setNoPhone().send();
            wait();

            tester.errorMessage('Пожалуйста, укажите номер телефона в своем профиле в Битрикс24').expectToBeVisible();
        });
        it(
            'Сервер отвечает, что аккаунт Битрикс24 уже привязан к аккануту UIS. Отображено сообщение об ошибке.',
        function() {
            tester.requestCreateAccount().setExtIdWasAlreadyUsed().send();
            wait();

            tester.errorMessage(function (textContent) {
                return textContent.indexOf('Ваша учетная запись Битрикс уже использовалась в аккаунте UIS.') != -1;
            }).expectToBeVisible();
        });
        describe('От сервера получен выделенный номер телефона.', function() {
            beforeEach(function() {
                tester.requestCreateAccount().send();
                wait();
            });

            it('Отображен номер телефона.', function() {
                tester.phoneNumber.expectToHaveTextContent('+7 (903) 123-45-67');
            });
            it(
                'Помещаю курсор мыши над текстом "Как выбрать другой номер". Отображается всплывающая подсказка.',
            function() {
                tester.tooltipTrigger.putMouseOver();
                tester.titleOfPhoneNumberTooltip.expectToBeVisible();
            });
        });
    });
    describe(
        'Открываю страницу легкого входа Битрикс24. Нажимаю на кнопку "Тестировать бесплатно". Нажимаю на кнопку ' +
        '"Продолжить". В соответствии с данными, полученными от сервера ни один сотрудник не был выбран ранее.',
    function() {
        beforeEach(function() {
            EasyStart.getApplication().checkIfPartnerReady();
            tester.tryForFreeButton.click();
            tester.requestCreateAccount().send();
            wait(10);

            tester.settingsStep('Номер телефона').nextButton().click();
            tester.requestEmployees().setNoEmployeesSelected().send();
            wait(10);
        });

        it('Кнопка "Продолжить" заблокирована.', function() {
            tester.settingsStep('Сотрудники').nextButton().expectToBeDisabled();
        });
        describe('Выбираю одного сотрудника.', function() {
            beforeEach(function() {
                tester.employeesGrid.row().atIndex(1).column().first().checkbox().click();
                wait(10);
            });

            describe('Нажимаю на кнопку "Продолжить".', function() {
                beforeEach(function() {
                    tester.settingsStep('Сотрудники').nextButton().click();
                    tester.requestChooseEmployees().setOnlyOneEmployeeSelected().setQueue().send();
                    tester.requestSyncEmployees().setDone().send();
                    wait(10);
                });

                it('Кнопки выбора типа переадресации скрыты.', function() {
                    tester.forwardingTypeButtons.expectToBeHidden();
                });
                describe(
                    'Ввожу номер телефона. Нажимаю на кнопку "Получить SMS". Ввожу код. Нажимаю на кнопку ' +
                    '"Подтвердить".',
                function() {
                    beforeEach(function() {
                        tester.employeePhoneField().input('9161234567');
                        wait(10);

                        tester.receiveSmsButton.click();
                        tester.requestSms().setOnlyOneEmployeeSelected().send();
                        wait(10);

                        tester.smsCodeField().input('1234');
                        wait(10);
                        
                        tester.confirmNumberButton.click();
                        tester.requestCodeInput().setOnlyOneEmployeeSelected().send();
                        wait(10);
                    });

                    it(
                        'Нажимаю на кнопку "Назад". Нажимаю на кнопку "Продолжить". Кнопка "Продолжить" доступна.',
                    function() {
                        tester.settingsStep('Правила обработки вызовов').backButton().click();
                        wait(10);

                        tester.settingsStep('Сотрудники').nextButton().click();
                        wait(10);
                        tester.requestChooseEmployees().setOnlyOneEmployeeSelected().setVerified().send();
                        wait(10);
                        tester.requestSyncEmployees().setDone().send();
                        wait(10);

                        tester.settingsStep('Правила обработки вызовов').nextButton().expectToBeEnabled();
                    });
                    it(
                        'Нажимаю на кнпоку "Продолжить". Отправлен запрос сохранения правил обработки вызовов, в ' +
                        'котором передан тип переадресации "Одновременно всем".',
                    function() {
                        tester.settingsStep('Правила обработки вызовов').nextButton().click();
                        tester.requestCallProcessingConfig().setOtherEmployee().setAll().send();
                    });
                });
            });
            it('Кнопка "Продолжить" доступна.', function() {
                tester.settingsStep('Сотрудники').nextButton().expectToBeEnabled();
            });
            it('Снимаю отметку с единственного отмеченного сотрудника. Кнопка "Продолжить" заблокирована.', function() {
                tester.employeesGrid.row().atIndex(1).column().first().checkbox().click();
                wait(10);

                tester.settingsStep('Сотрудники').nextButton().expectToBeDisabled();
            });
        });
    });
    describe(
        'Открываю страницу легкого входа amoCRM. Нажимаю на кнопку "Тестировать бесплатно". Нажимаю на кнпоку ' +
        '"Продолжить". В соответствии с данными, полученными от сервера ранее были выбраны три сотрудника.',
    function() {
        beforeEach(function() {
            EasyStart.getApplication().checkIfPartnerReady();
            tester.tryForFreeButton.click();
            tester.requestCreateAccount().send();
            wait(100);

            tester.settingsStep('Номер телефона').nextButton().click();
            tester.requestEmployees().send();
            wait(100);
        });

        it('Чебоксы отмечены в трех строках таблицы сотрудников.', function() {
            tester.employeesGrid.row().first().expectNotToBeSelected();
            tester.employeesGrid.row().atIndex(1).expectToBeSelected();
            tester.employeesGrid.row().atIndex(2).expectNotToBeSelected();
            tester.employeesGrid.row().atIndex(3).expectToBeSelected();
            tester.employeesGrid.row().atIndex(4).expectNotToBeSelected();
            tester.employeesGrid.row().atIndex(5).expectNotToBeSelected();
            tester.employeesGrid.row().atIndex(6).expectNotToBeSelected();
            tester.employeesGrid.row().atIndex(7).expectNotToBeSelected();
            tester.employeesGrid.row().atIndex(8).expectToBeSelected();
            tester.employeesGrid.row().atIndex(9).expectNotToBeSelected();
        });
        describe('Отмечаю других трех сотрудников. Нажимаю на кнопку "Продолжить".', function() {
            beforeEach(function() {
                tester.employeesGrid.row().atIndex(1).column().first().checkbox().click();
                tester.employeesGrid.row().first().column().first().checkbox().click();
                tester.employeesGrid.row().atIndex(3).column().first().checkbox().click();
                tester.employeesGrid.row().atIndex(2).column().first().checkbox().click();
                wait(100);

                tester.settingsStep('Сотрудники').nextButton().click();
                wait(100);
            });

            describe(
                'В соответствии с данными, полученными от сервера ранее был выбран тип переадресации "По очереди" и ' +
                'у одного из сотрудников номер был подтвержден.',
            function() {
                beforeEach(function() {
                    tester.requestChooseEmployees().setQueue().setVerified().send();
                    tester.requestSyncEmployees().setDone().send();
                    wait(100);
                });

                it('Кнопка "Получить SMS" скрыта.', function() {
                    tester.receiveSmsButton.expectToBeHidden();
                });
                describe('Изменяю номер телефона.', function() {
                    beforeEach(function() {
                        tester.employeePhoneField().fill('9161234568');
                        wait(100);
                    });

                    it('Кнопка "Получить SMS" видима.', function() {
                        tester.receiveSmsButton.expectToBeVisible();
                    });
                    it('Нажимаю на кнопку "Одновременно всем". Кнопка "Получить SMS" видима.', function() {
                        tester.simoultaneousForwardingTypeButton().click();
                        wait(100);

                        tester.receiveSmsButton.expectToBeVisible();
                    });
                });
            });
            describe(
                'В соответствии с данными, полученными от сервера ранее был выбран тип переадресации "Одновременно ' +
                'всем" и ни у одного из них не номер не был подтвержден.',
            function() {
                beforeEach(function() {
                    tester.requestChooseEmployees().send();
                });

                describe('Отправлен запрос синхронизации с amoCRM. Синхронизация еще не завершена.', function() {
                    beforeEach(function() {
                        tester.requestSyncEmployees().send();
                    });

                    it('Спиннер загрузки видим.', function() {
                        tester.expectSpinnerToBeVisible();
                    });
                    describe('Отправлен запрос проверки синхронизации. Синхронизация еще не завершена.', function() {
                        beforeEach(function() {
                            wait();
                            tester.requestUserSyncState().send();
                        });

                        it('Спиннер загрузки видим.', function() {
                            tester.expectSpinnerToBeVisible();
                        });
                        it(
                            'Отправлен запрос проверки синхронизации. Синхронизация завершена. Спиннер загрузки скрыт.',
                        function() {
                            wait();
                            tester.requestUserSyncState().setDone().send();
                            wait(100);
                            
                            tester.expectSpinnerToBeHidden();
                        });
                    });
                });
                describe('Синхронизация сотрудников завершена.', function() {
                    beforeEach(function() {
                        tester.requestSyncEmployees().setDone().send();
                        wait(100);
                    });

                    it('Колонка "Время дозвона" скрыта. Колонка изменения порядка строк скрыта.', function() {
                        tester.callProcessingGrid.column().withHeader('Время дозвона').expectToBeHiddenOrNotExist();

                        tester.callProcessingGrid.row().first().column().first().createTester().
                            forDescendant('.ul-drag-handle').expectToBeHiddenOrNotExist();
                    });
                    describe('Нажимаю на кнопку "По очереди".', function() {
                        beforeEach(function() {
                            tester.sequentialForwardingTypeButton().click();
                            wait(100);
                        });

                        it('Колонка "Время дозвона" видима. Колонка изменения порядка строк видима.', function() {
                            tester.callProcessingGrid.column().withHeader('Время дозвона').expectToBeVisible();

                            tester.callProcessingGrid.row().first().column().first().createTester().
                                forDescendant('.ul-drag-handle').expectToBeVisible();
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
                                                    describe(
                                                        'Нажимаю на кнопку "Продолжить". Нажимаю на кнопку ' +
                                                        '"Продолжить".',
                                                    function() {
                                                        beforeEach(function() {
                                                            tester.settingsStep('Правила обработки вызовов').
                                                                nextButton().click();
                                                            wait(10);
                                                            tester.requestCallProcessingConfig().send();
                                                            wait(10);

                                                            tester.settingsStep('Настройка интеграции').
                                                                nextButton().click();
                                                            wait();
                                                            tester.requestIntegrationConfig().send();
                                                        });

                                                        it(
                                                            'Нажимаю на кнопку "Заказать тестовый звонок". Отправлен ' +
                                                            'запрос тестового звонка.',
                                                        function() {
                                                            tester.requestAnswers().send();
                                                            tester.orderTestCallButton.click();
                                                            tester.requestTestCall().send();
                                                        });
                                                        it(
                                                            'Ответ сервера на запрос звонков содержит сообщение об ' +
                                                            'ошибке. Отображено сообщние об ошибке. Повторный запрос ' +
                                                            'звонков не был отправлен.',
                                                        function() {
                                                            tester.requestAnswers().setError().send();
                                                            wait();

                                                            tester.errorMessage('Что-то пошло не так').
                                                                expectToBeVisible();
                                                        });
                                                        it(
                                                            'Не удалось разобрать ответ сервера. Отображено ' +
                                                            'сообщение об ошибке.',
                                                        function() {
                                                            tester.requestAnswers().setFatalError().send();
                                                            wait();

                                                            tester.errorMessage('Произошла ошибка').expectToBeVisible();
                                                        });
                                                        describe('Отправлен запрос звонков.', function() {
                                                            beforeEach(function() {
                                                                tester.requestAnswers().send();
                                                            });

                                                            it('Таблица скрыта.', function() {
                                                                tester.callsHistoryGrid.expectToBeHidden();
                                                            });
                                                            it(
                                                                'Прошло некоторое время. Отправлен еще один запрос ' +
                                                                'звонков. В соответствии с ответом сервера звонок ' +
                                                                'был пропущенным. Колонка "Ответил" пуста. Колонка ' +
                                                                '"Статус звонка" имеет содержимое "Пропущенный".',
                                                            function() {
                                                                wait();

                                                                tester.requestAnswers().
                                                                    addFirstUnsuccessfulCall().send();

                                                                tester.callsHistoryGrid.row().first().column().
                                                                    withHeader('Ответил').
                                                                    expectToHaveTextContent('');

                                                                tester.callsHistoryGrid.row().first().column().
                                                                    withHeader('Статус звонка').
                                                                    expectToHaveTextContent('Пропущенный');
                                                            });
                                                            it(
                                                                'Прошло некоторое время. Отправлен еще один запрос ' +
                                                                'звонков. В соответствии с ответом сервера звонок ' +
                                                                'был успешным.',
                                                            function() {
                                                                wait();
                                                                tester.requestAnswers().addFirstUser().send();

                                                                tester.callsHistoryGrid.row().first().column().
                                                                    withHeader('Ответил').
                                                                    expectToHaveTextContent('Доминика Языкина');

                                                                tester.callsHistoryGrid.row().first().column().
                                                                    withHeader('Статус звонка').
                                                                    expectToHaveTextContent('Успешный');
                                                            });
                                                        });
                                                        describe('Нажимаю на кнопку "Стать клиентом".', function() {
                                                            beforeEach(function() {
                                                                tester.requestAnswers().addFirstUser().send();
                                                                wait();
                                                                tester.requestAnswers().addFirstUser().
                                                                    addSecondUser().send();

                                                                tester.settingsStep('Тестовый звонок').
                                                                    applyButton().click();
                                                                wait();
                                                                tester.requestAnswers().addFirstUser().
                                                                    addSecondUser().send();
                                                            });

                                                            it(
                                                                'Поля формы заказа обратного звонка заполнены ' +
                                                                'значениями по умолчанию.',
                                                            function() {
                                                                tester.floatingForm.textfield().
                                                                    withFieldLabel('День *').
                                                                    expectValueToMatch(/^\d{2}\.\d{2}\.\d{4}$/);

                                                                tester.floatingForm.textfield().
                                                                    withFieldLabel('С *').expectToHaveValue('11:00');

                                                                tester.floatingForm.textfield().
                                                                    withFieldLabel('До *').expectToHaveValue('19:00');
                                                            });
                                                            describe(
                                                                'Заполняю форму заказа обратного звонка.',
                                                            function() {
                                                                beforeEach(function() {
                                                                    tester.floatingForm.textfield().
                                                                        withFieldLabel('Номер телефона *').
                                                                        input('4951234567');
                                                                    tester.requestAnswers().addFirstUser().
                                                                        addSecondUser().send();

                                                                    wait();
                                                                    tester.requestAnswers().addFirstUser().
                                                                        addSecondUser().send();

                                                                    tester.floatingForm.textfield().
                                                                        withFieldLabel('День *').
                                                                        fill(tester.nextDay('d.m.Y'));
                                                                    tester.requestAnswers().addFirstUser().
                                                                        addSecondUser().send();

                                                                    wait();
                                                                    tester.requestAnswers().addFirstUser().
                                                                        addSecondUser().send();

                                                                    tester.floatingForm.textfield().
                                                                        withFieldLabel('С *').fill('13:54');
                                                                    tester.requestAnswers().addFirstUser().
                                                                        addSecondUser().send();

                                                                    wait();
                                                                    tester.requestAnswers().addFirstUser().
                                                                        addSecondUser().send();

                                                                    tester.floatingForm.textfield().
                                                                        withFieldLabel('До *').fill('20:05');
                                                                    tester.requestAnswers().addFirstUser().
                                                                        addSecondUser().send();

                                                                    wait();
                                                                    tester.requestAnswers().addFirstUser().
                                                                        addSecondUser().send();
                                                                });

                                                                it(
                                                                    'Нажимаю на кнопку "Заказать обратный звонок". В ' +
                                                                    'соответствии с данными, полученными от сервера ' +
                                                                    'попытка заказа обратного звонка была ' +
                                                                    'безуспешной. Отображено сообщение об ошбибке.',
                                                                function() {
                                                                    tester.orderCallbackButton.click();

                                                                    wait();
                                                                    tester.requestAnswers().addFirstUser().
                                                                        addSecondUser().send();

                                                                    tester.supportRequestSender.respondUnsuccessfully();

                                                                    wait();
                                                                    tester.requestAnswers().addFirstUser().
                                                                        addSecondUser().send();

                                                                    tester.errorMessage(
                                                                        'Invalid type for field "phone"'
                                                                    ).expectToBeVisible();

                                                                    tester.floatingComponent.expectNotToBeMasked();
                                                                });
                                                                it(
                                                                    'Сайтфон не подключен. Нажимаю на кнопку ' +
                                                                    '"Заказать обратный звонок". Отображено ' +
                                                                    'сообщение об ошбибке.',
                                                                function() {
                                                                    tester.supportRequestSender.setNoSitePhone();
                                                                    tester.orderCallbackButton.click();

                                                                    wait();
                                                                    tester.requestAnswers().addFirstUser().
                                                                        addSecondUser().send();

                                                                    tester.errorMessage('Произошла ошибка').
                                                                        expectToBeVisible();

                                                                    tester.floatingComponent.expectNotToBeMasked();
                                                                });
                                                                it(
                                                                    'Нажимаю на кнопку "Заказать обратный звонок". ' +
                                                                    'Окно заблокировано.',
                                                                function() {
                                                                    tester.orderCallbackButton.click();
                                                                    wait();
                                                                    tester.requestAnswers().addFirstUser().
                                                                        addSecondUser().send();

                                                                    tester.floatingComponent.expectToBeMasked();
                                                                });
                                                                describe(
                                                                    'Нажимаю на кнопку "Заказать обратный звонок".',
                                                                function() {
                                                                    beforeEach(function() {
                                                                        tester.orderCallbackButton.click();

                                                                        wait();
                                                                        tester.requestAnswers().addFirstUser().
                                                                            addSecondUser().send();

                                                                        tester.supportRequestSender.
                                                                            respondSuccessfully();
                                                                        wait();
                                                                        tester.requestAnswers().addFirstUser().
                                                                            addSecondUser().send();
                                                                    });

                                                                    it(
                                                                        'Отправлена заявка на обратный звонок.',
                                                                    function() {
                                                                        tester.supportRequestSender.
                                                                            expectRequestParamsToContain({
                                                                                email: 'chigrakov@example.com',
                                                                                message: 'Заявка со страницы ' +
                                                                                    'Битрикс24 Легкий вход. Номер ' +
                                                                                    'телефона пользоватeля ' +
                                                                                    '+74951234567. Удобное время для ' +
                                                                                    'звонка - ' +
                                                                                    tester.nextDay('Y-m-d') + ' с ' +
                                                                                    '13:54 до 20:05',
                                                                                name: 'Марк Брониславович Чиграков',
                                                                                phone: '74951234567'
                                                                            });
                                                                    });
                                                                    it(
                                                                        'В окне с заголовком "Спасибо" отображено ' +
                                                                        'выбранное время и день.',
                                                                    function() {
                                                                        tester.floatingComponent.
                                                                            expectTextContentToHaveSubstring(
                                                                                tester.nextDay('d.m.Y') + ' с 13:54 ' +
                                                                                'по 20:05 по МСК');
                                                                    });
                                                                    it(
                                                                        'Нажимаю на кнопку "Закрыть". Нажимаю на ' +
                                                                        'кнопку "Стать клентом". Изменяю значение в ' +
                                                                        'форме заказа обратного звонка. Нажимаю на ' +
                                                                        'кнопку "Заказать обратный звонок". В окне с ' +
                                                                        'заголовком "Спасибо" отображено выбранное ' +
                                                                        'время и день.',
                                                                    function() {
                                                                        tester.closeWindowButton.click();

                                                                        tester.settingsStep('Тестовый звонок').
                                                                            applyButton().click();
                                                                        wait();
                                                                        tester.requestAnswers().addFirstUser().
                                                                            addSecondUser().send();

                                                                        tester.floatingForm.textfield().
                                                                            withFieldLabel('День *').
                                                                            fill(tester.dayAfterTomorrow('d.m.Y'));
                                                                        tester.requestAnswers().
                                                                            addFirstUser().addSecondUser().
                                                                            send();

                                                                        tester.floatingForm.textfield().
                                                                            withFieldLabel('С *').
                                                                            fill('13:55');
                                                                        tester.requestAnswers().
                                                                            addFirstUser().addSecondUser().
                                                                            send();

                                                                        tester.floatingForm.textfield().
                                                                            withFieldLabel('До *').
                                                                            fill('20:15');
                                                                        tester.requestAnswers().
                                                                            addFirstUser().addSecondUser().
                                                                            send();

                                                                        tester.orderCallbackButton.click();
                                                                        wait();
                                                                        tester.requestAnswers().
                                                                            addFirstUser().addSecondUser().
                                                                            send();

                                                                        tester.supportRequestSender.
                                                                            respondSuccessfully();
                                                                        wait();
                                                                        tester.requestAnswers().addFirstUser().
                                                                            addSecondUser().send();

                                                                        tester.floatingComponent.
                                                                            expectTextContentToHaveSubstring(
                                                                                tester.dayAfterTomorrow('d.m.Y') +
                                                                                    ' с 13:55 по 20:15 по МСК');
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
                            });
                        });
                    });
                });
            });
        });
    });
});
