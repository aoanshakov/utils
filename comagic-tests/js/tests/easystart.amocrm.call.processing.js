tests.addTest(function(requestsManager, testersFactory, wait, utils, windowOpener, postMessages) {
    var tester;
    
    beforeEach(function() {
        tester = new EasystartAmocrm(requestsManager, testersFactory, utils);
    });

    describe('Открываю страницу легкого входа amoCRM. Перехожу к шагу "Правила обработки вызовов".', function() {
        beforeEach(function() {
            EasyStart.getApplication().checkIfPartnerReady();
            wait(100);

            tester.settingsStep('Номер телефона').nextButton().click();
            tester.requestSyncEmployees().setDone().send();
            tester.requestEmployees().send();
            wait(100);

            tester.settingsStep('Сотрудники').nextButton().click();
            wait(100);
        });

        it(
            'Ни один из сотрудников не получает звонки на виджет. Перехожу к шагу "Тестовый звонок". Сообщение ' +
            '"Убедитесь, что виджет UIS установлен в amoCRM." не отображено.',
        function() {
            tester.requestChooseEmployees().setDontChangeEmployees().setVerified().send();
            wait(100);

            tester.settingsStep('Правила обработки вызовов').nextButton().click();
            wait(100);
            tester.requestCallProcessingConfig().setAll().setIgnoreTimeout().send();
            wait(100);

            tester.settingsStep('Настройка интеграции').nextButton().click();
            tester.requestIntegrationConfig().send();
            tester.requestAnswers().send();
            postMessages.expectMessageToBeSent('UISamoCRMWidgetRequestSettings');

            tester.testCallPanelDescendantWithText('Убедитесь, что виджет UIS установлен в amoCRM.').expectToBeHidden();
        });
        it(
            'Один из сотрудников получает звонки на виджет. Перехожу к шагу "Тестовый звонок". Отображено сообщение ' +
            '"Убедитесь, что виджет UIS установлен в amoCRM.". В родительское окно отправлен запрос обновления ' +
            'настроек.',
        function() {
            tester.requestChooseEmployees().setDontChangeEmployees().setToWidget().send();
            wait(100);

            tester.settingsStep('Правила обработки вызовов').nextButton().click();
            wait(100);
            tester.requestCallProcessingConfig().setIgnoreTimeout().setToWidget().setAll().send();
            wait(100);

            tester.settingsStep('Настройка интеграции').nextButton().click();
            tester.requestIntegrationConfig().send();
            tester.requestAnswers().send();

            postMessages.expectMessageToBeSent('UISamoCRMWidgetRequestSettings');

            tester.testCallPanelDescendantWithText('Убедитесь, что виджет UIS установлен в amoCRM.').
                expectToBeVisible();
        });
    });
    describe('Открываю страницу легкого входа amoCRM. Перехожу к шагу "Правила обработки вызовов".', function() {
        beforeEach(function() {
            EasyStart.getApplication().checkIfPartnerReady();
            wait(100);

            tester.settingsStep('Номер телефона').nextButton().click();
            tester.requestSyncEmployees().setDone().send();

            tester.requestEmployees().send();
            wait(100);

            tester.employeesGrid.row().atIndex(1).column().first().checkbox().click();
            tester.employeesGrid.row().first().column().first().checkbox().click();
            tester.employeesGrid.row().atIndex(3).column().first().checkbox().click();
            tester.employeesGrid.row().atIndex(2).column().first().checkbox().click();
            wait(100);

            tester.settingsStep('Сотрудники').nextButton().click();
            wait(100);
        });

        describe('У одного из сотрудников номер телефона подтвержден.', function() {
            beforeEach(function() {
                tester.requestChooseEmployees().setVerified().send();
                wait(100);
            });

            it(
                'Ввожу номер телефона другого сотрудника и подтверждаю его. Нажимаю на кнопку "Продолжить". ' +
                'Отправлен запрос, в котором переданы данные двух сотрудников.',
            function() {
                tester.secondEmployeePhoneField().fill('9162345678');
                wait(100);

                tester.secondReceiveSmsButton.click();
                wait(100);
                tester.requestSms().setSecondEmployee().send();
                wait(100);

                tester.secondSmsCodeField().input('2345');
                wait(100);

                tester.secondConfirmNumberButton.click();
                wait(100);
                tester.requestCodeInput().setSecondEmployee().send();
                wait(100);

                tester.settingsStep('Правила обработки вызовов').nextButton().click();
                wait(100);
                tester.requestCallProcessingConfig().setAll().setDontChangeTimeout().setSecondEmployeePhoneVerified().
                    send();
                wait(100);
            });
            it(
                'Выбираю переадресацию в виджет для второго сотрудника. Нажимаю на кнопку "Продолжить". Отправлен ' +
                'запрос, в котором переданы данные двух сотрудников.',
            function() {
                tester.secondToWidgetRadioButton().click();
                wait(100);

                tester.settingsStep('Правила обработки вызовов').nextButton().click();
                wait(100);
                tester.requestCallProcessingConfig().setAll().setDontChangeTimeout().
                    setSecondEmployeeForwardingToWidget().send();
                wait(100);
            });
        });
        describe('У двоих из сотрудников номера телефонов подтверждены.', function() {
            beforeEach(function() {
                tester.requestChooseEmployees().setVerified().setSecondEmployeePhoneVerified().send();
                wait(100);
            });

            describe('Нажимаю на иконку удаления в строке одного из сотрудников с подтвердженным номером.', function() {
                beforeEach(function() {
                    tester.callProcessingGrid.row().atIndex(1).createTester().forDescendant('.easystart-remove-column').
                        createTesterForAscendant('.x-grid-cell').click();
                    wait(100);
                });

                it('Нажимаю на кнопку "Назад". Удаленный сотрудник не отмечен.', function() {
                    tester.settingsStep('Правила обработки вызовов').backButton().click();

                    tester.employeesGrid.row().first().expectNotToBeSelected();
                    tester.employeesGrid.row().atIndex(1).expectNotToBeSelected();
                    tester.employeesGrid.row().atIndex(2).expectToBeSelected();
                    tester.employeesGrid.row().atIndex(3).expectNotToBeSelected();
                    tester.employeesGrid.row().atIndex(4).expectNotToBeSelected();
                    tester.employeesGrid.row().atIndex(5).expectNotToBeSelected();
                    tester.employeesGrid.row().atIndex(6).expectNotToBeSelected();
                    tester.employeesGrid.row().atIndex(7).expectNotToBeSelected();
                    tester.employeesGrid.row().atIndex(8).expectToBeSelected();
                    tester.employeesGrid.row().atIndex(9).expectNotToBeSelected();
                });
                it('Строка сотрудника удалена. Кнопки выбора типа переадресации видимы.', function() {
                    tester.callProcessingGrid.row().atIndex(1).column().withHeader('Сотрудники').
                        expectToHaveTextContent('Эдуард Закиров Менеджер');

                    tester.forwardingTypeButtons.expectToBeVisible();
                });
                it(
                    'Нажимаю на иконку удаления в строке последнего оставшегося сотрудника с подтвердженным номером. ' +
                    'Кнопка "Подтвердить" заблокирована. Кнопки выбора типа переадресации скрыты.',
                function() {
                    tester.callProcessingGrid.row().first().createTester().forDescendant('.easystart-remove-column').
                        createTesterForAscendant('.x-grid-cell').click();
                    wait(100);

                    tester.settingsStep('Правила обработки вызовов').nextButton().expectToBeDisabled();
                    tester.forwardingTypeButtons.expectToBeHidden();
                });
                it(
                    'Нажимаю на кнопку "По очереди".Нажимаю на иконку удаления в строке сотрудника с ' +
                    'неподтвердженным номером. Нажимаю на кнопку "Проолжить". Отправлен запрос в котором передан ' +
                    'одновременный тип переадресации.',
                function() {
                    tester.sequentialForwardingTypeButton().click();

                    tester.callProcessingGrid.row().atIndex(1).createTester().forDescendant('.easystart-remove-column').
                        createTesterForAscendant('.x-grid-cell').click();
                    wait(100);

                    tester.settingsStep('Правила обработки вызовов').nextButton().click();
                    wait(100);
                    tester.requestCallProcessingConfig().setAll().setDontChangeTimeout().send();
                    wait(100);
                });
                it(
                    'Нажимаю на кнопку "Проолжить". Отправлен запрос в котором переданы данные только одного ' +
                    'сотрудника.',
                function() {
                    tester.settingsStep('Правила обработки вызовов').nextButton().click();
                    wait(100);
                    tester.requestCallProcessingConfig().setAll().setDontChangeTimeout().send();
                    wait(100);
                });
            });
            it(
                'Стираю значение в поле номера телефона. Нажимаю на кнопку "Продолжить". Отправлен запрос в котором ' +
                'переданы данные только одного сотрудника.',
            function() {
                tester.secondEmployeePhoneField().clear();
                wait(100);

                tester.settingsStep('Правила обработки вызовов').nextButton().click();
                wait(100);
                tester.requestCallProcessingConfig().setAll().setDontChangeTimeout().send();
                wait(100);
            });
        });
    });
    describe(
        'Открываю страницу легкого входа amoCRM. Нажимаю на кнопку "Продолжить". В соответствии с данными, ' +
        'полученными от сервера ни один сотрудник не был выбран ранее.',
    function() {
        beforeEach(function() {
            EasyStart.getApplication().checkIfPartnerReady();
            wait(10);

            tester.settingsStep('Номер телефона').nextButton().click();
            tester.requestSyncEmployees().setDone().send();
            tester.requestEmployees().setNoEmployeesSelected().send();
            wait();
        });

        describe('Выбираю одного сотрудника.', function() {
            beforeEach(function() {
                tester.employeesGrid.row().atIndex(1).column().first().checkbox().click();
                wait();
            });

            describe('Нажимаю на кнопку "Продолжить".', function() {
                beforeEach(function() {
                    tester.settingsStep('Сотрудники').nextButton().click();
                    tester.requestChooseEmployees().setOnlyOneEmployeeSelected().setQueue().send();
                    wait(2);
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
                        wait();

                        tester.receiveSmsButton.click();
                        tester.requestSms().setOnlyOneEmployeeSelected().send();
                        wait();

                        tester.smsCodeField().input('1234');
                        wait();
                        
                        tester.confirmNumberButton.click();
                        tester.requestCodeInput().setOnlyOneEmployeeSelected().send();
                        wait(2);
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
        it('Кнопка "Продолжить" заблокирована.', function() {
            tester.settingsStep('Сотрудники').nextButton().expectToBeDisabled();
        });
    });
    describe(
        'Открываю страницу легкого входа amoCRM. Нажимаю на кнопку "Тестировать бесплатно". Нажимаю на кнпоку ' +
        '"Продолжить". В соответствии с данными, полученными от сервера ранее были выбраны три сотрудника. Отмечаю ' +
        'других трех сотрудников. Нажимаю на кнопку "Продолжить".',
    function() {
        beforeEach(function() {
            EasyStart.getApplication().checkIfPartnerReady();
            wait(100);

            tester.settingsStep('Номер телефона').nextButton().click();
            tester.requestSyncEmployees().setDone().send();
            tester.requestEmployees().send();
            wait(100);

            tester.employeesGrid.row().atIndex(1).column().first().checkbox().click();
            tester.employeesGrid.row().first().column().first().checkbox().click();
            tester.employeesGrid.row().atIndex(3).column().first().checkbox().click();
            tester.employeesGrid.row().atIndex(2).column().first().checkbox().click();
            wait(100);

            tester.settingsStep('Сотрудники').nextButton().click();
            wait(100);
        });

        describe(
            'В соответствии с данными, полученными от сервера ранее был выбран тип переадресации "По очереди", ' +
            'все выбранные сотрудники принимают звонки на мобильный телефон и у одного из сотрудников номер был ' +
            'подтвержден.',
        function() {
            beforeEach(function() {
                tester.requestChooseEmployees().setQueue().setVerified().send();
                wait(100);
            });

            it('Отмечена радиокнопка "На мобильный телефон".', function() {
                tester.toMobilePhoneButton().expectToBeChecked();
                tester.toWidgetRadioButton().expectNotToBeChecked();
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
            'всем", все выбранные сотрудники принимают звонки на мобильный телефон и ни у одного из них не номер ' +
            'не был подтвержден.',
        function() {
            beforeEach(function() {
                tester.requestChooseEmployees().send();
                wait(100);
            });

            it('Колонка "Время дозвона" скрыта. Колонка изменения порядка строк скрыта.', function() {
                tester.callProcessingGrid.column().withHeader('Время дозвона').expectToBeHiddenOrNotExist();

                tester.callProcessingGrid.row().first().column().first().createTester().
                    forDescendant('.ul-drag-handle').expectToBeHiddenOrNotExist();
            });
            it(
                'Нажимаю на кнопку "По очереди". Колонка "Время дозвона" видима. Колонка изменения порядка строк ' +
                'видима.',
            function() {
                tester.sequentialForwardingTypeButton().click();
                wait(100);

                tester.callProcessingGrid.column().withHeader('Время дозвона').expectToBeVisible();

                tester.callProcessingGrid.row().first().column().first().createTester().
                    forDescendant('.ul-drag-handle').expectToBeVisible();
            });
        });
        it(
            'В соответствии с данными, полученными от сервера один из выбранных сотрудников принимает звонки на ' +
            'виджет. Отмечена радиокнопка "В виджет".',
        function() {
            tester.requestChooseEmployees().setQueue().setToWidget().send();
            wait(100);

            tester.toMobilePhoneButton().expectNotToBeChecked();
            tester.toWidgetRadioButton().expectToBeChecked();
        });
    });
});
