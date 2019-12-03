tests.addTest(function(requestsManager, testersFactory, wait, utils, windowOpener, debug, fakeNow) {
    var tester;
    
    beforeEach(function() {
        tester = new EasystartAmocrm(requestsManager, testersFactory, utils);
    });

    it(
        'Открываю страницу легкого входа amoCRM. От сервера получен выделенный номер телефона. Отображен номер ' +
        'телефона. Открываю страницу легкого входа amoCRM. От сервера получен выделенный номер телефона. Отображен ' +
        'номер телефона.',
    function() {
        EasyStart.getApplication().checkIfPartnerReady();
        wait(10);

        tester.phoneNumber.expectToHaveTextContent('+7 (903) 123-45-67');

        tester.tooltipTrigger.putMouseOver();
        tester.titleOfPhoneNumberTooltip.expectToBeVisible();
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

        it('Ни один из сотрудников не получает звонки на виджет. Перехожу к шагу "Тестовый звонок".', function() {
            tester.requestChooseEmployees().setDontChangeEmployees().setVerified().send();
            wait(100);

            tester.settingsStep('Правила обработки вызовов').nextButton().click();
            wait(100);
            tester.requestCallProcessingConfig().setAll().setIgnoreTimeout().send();
            wait(100);

            tester.settingsStep('Настройка интеграции').nextButton().click();
            tester.requestIntegrationConfig().send();
            tester.requestAnswers().send();

            tester.testCallPanelDescendantWithText('Убедитесь, что виджет UIS установлен в amoCRM.').expectToBeHidden();
        });
        it('Один из сотрудников получает звонки на виджет. Перехожу к шагу "Тестовый звонок".', function() {
            tester.requestChooseEmployees().setDontChangeEmployees().setToWidget().send();
            wait(100);

            tester.settingsStep('Правила обработки вызовов').nextButton().click();
            wait(100);
            tester.requestCallProcessingConfig().setIgnoreTimeout().setToWidget().setAll().send();
            wait(100);

            tester.settingsStep('Настройка интеграции').nextButton().click();
            tester.requestIntegrationConfig().send();
            tester.requestAnswers().send();

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
    describe('Открываю страницу легкого входа amoCRM. Нажимаю на кнопку "Продолжить".', function() {
        beforeEach(function() {
            EasyStart.getApplication().checkIfPartnerReady();
            wait(10);

            tester.settingsStep('Номер телефона').nextButton().click();
            wait();
        });

        it(
            'Сервер оповестил об истечении времени действия сессии. Отображено окно с сообщением о том, что время ' +
            'действия сессии истекло.',
        function() {
            tester.requestSyncEmployees().setError().send();
            wait();

            tester.sessionErrorMessage.expectToBeVisible();
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
                    'Отправлен запрос проверки синхронизации. Синхронизация завершена. Отправлен запрос списка ' +
                    'сотрудников. Список сотрудников получен от сервера. Спиннер загрузки скрыт.',
                function() {
                    wait();
                    tester.requestUserSyncState().setDone().send();
                    wait(2);
                    tester.requestEmployees().send();
                    wait();

                    tester.expectSpinnerToBeHidden();
                });
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

        it('Кнопка "Продолжить" заблокирована.', function() {
            tester.settingsStep('Сотрудники').nextButton().expectToBeDisabled();
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
    });
    describe(
        'Открываю страницу легкого входа amoCRM. Нажимаю на кнпоку "Продолжить". В соответствии с данными, ' +
        'полученными от сервера ранее были выбраны три сотрудника. Отмечаю других трех сотрудников. Нажимаю на ' +
        'кнопку "Продолжить". В соответствии с данными, полученными от сервера ранее был выбран тип переадресации ' +
        '"Одновременно всем", все выбранные сотрудники принимают звонки на мобильный телефон и ни у одного из них не ' +
        'номер не был подтвержден. Нажимаю на кнопку "По очереди". Ввожу номер телефона сотрудника. Нажимаю на ' +
        'кнопку "Получить SMS". Прошло 34 секунды. Ввожу код подтверждения. Нажимаю на кнопку "Подтвердить". В ' +
        'соответствии с данными, полученными от сервера код подтверждения был корректным. Ввожу значение в поле ' +
        '"Время дозвона". Нажимаю на кнопку "Продолжить". Нажимаю на кнопку "Продолжить". Нажимаю на кнопку ' +
        '"Заказать тестовый звонок". Отправлен запрос тестового звонка.',
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

            tester.requestChooseEmployees().send();
            wait(100);

            tester.sequentialForwardingTypeButton().click();
            wait(100);

            tester.employeePhoneField().input('9161234567');
            wait(100);

            tester.receiveSmsButton.click();
            tester.requestSms().send();
            wait();

            wait(2 * 34);

            tester.smsCodeField().input('1234');
            wait();

            tester.confirmNumberButton.click();
            wait();

            wait(200);
            tester.requestCodeInput().send();
            wait(200);

            tester.dialTimeField().fill('15');
            wait();

            tester.settingsStep('Правила обработки вызовов').
                nextButton().click();
            wait(10);
            tester.requestCallProcessingConfig().send();
            wait(10);

            tester.settingsStep('Настройка интеграции').
                nextButton().click();
            wait();

            tester.requestIntegrationConfig().send();
            tester.requestAnswers().send();

            tester.orderTestCallButton.click();
            tester.requestTestCall().send();
        });

        it('Кнопка заказа тестового звонка заблокирована.', function() {
            tester.orderTestCallButton.expectToBeMasked();
        });
        describe(
            'Прошло некоторое время. Отправлен запрос состояния заказа тестового звонка. В соответствии с ответом ' +
            'сервера тестовый звонок еще не завершен.',
        function() {
            beforeEach(function() {
                wait();
                tester.requestCallState().send();
                tester.requestAnswers().send();
            });

            it('Кнопка заказа тестового звонка заблокирована.', function() {
                tester.orderTestCallButton.expectToBeMasked();
            });
            it('Повторное нажатие на кнопку заказа тестового звонка не приводит к отправке запроса.', function() {
                tester.orderTestCallButton.click();
            });
            describe(
                'Прошло некоторое время. Отправлен запрос состояния заказа тестового звонка. В соответствии с ' +
                'ответом сервера тестовый звонок завершен успешно.',
            function() {
                beforeEach(function() {
                    wait();
                    tester.requestCallState().setProcessed().send();
                    tester.requestAnswers().send();
                });

                it('Кнопка заказа тестового звонка доступна.', function() {
                    tester.orderTestCallButton.expectNotToBeMasked();
                });
                it('Сообщение об ошибке не отображено.', function() {
                    tester.errorMessage('Произошла ошибка').expectToBeHiddenOrNotExist();
                });
                it('Повторное нажатие на кнопку заказа тестового звонка приводит к отправке запроса.', function() {
                    tester.orderTestCallButton.click();
                    tester.requestTestCall().send();
                });
            });
            describe(
                'Прошло некоторое время. Отправлен запрос состояния заказа тестового звонка. В соответствии с ' +
                'ответом сервера тестовый звонок завершен ошибкой.',
            function() {
                beforeEach(function() {
                    wait();
                    tester.requestCallState().setError().send();
                    tester.requestAnswers().send();
                });

                it('Кнопка заказа тестового звонка доступна.', function() {
                    tester.orderTestCallButton.expectNotToBeMasked();
                });
                it('Отображено Сообщение об ошибке.', function() {
                    tester.errorMessage('Произошла ошибка').expectToBeVisible();
                });
                it(
                    'Нажимаю на кнопку заказа тестового звонка. Прошло некоторое время. Отправлен запрос состояния ' +
                    'заказа тестового звонка. В соответствии с ответом сервера тестовый звонок завершен успешно. ' +
                    'Сообщение об ошибке не отображается.',
                function() {
                    tester.orderTestCallButton.click();
                    tester.requestTestCall().send();

                    wait();
                    tester.requestCallState().setProcessed().send();
                    tester.requestAnswers().send();

                    tester.errorMessage('Произошла ошибка').expectToBeHiddenOrNotExist();
                });
            });
        });
    });
    describe(
        'Открываю страницу легкого входа amoCRM. Нажимаю на кнопку "Тестировать бесплатно". Нажимаю на кнопку ' +
        '"Продолжить". Выбираю сотрудников. Нажимаю на кнопку "Продолжить". Нажимаю на кнопку "По очереди". Ввожу ' +
        'номер телефона. Нажимаю на кнопку "Код из SMS". Ввожу код. Нажимаю на кнопку "Подтвердить". Ввожу время ' +
        'дозвона. Нажимаю на кнопку "Продолжить".',
    function() {
        beforeEach(function() {
            EasyStart.getApplication().checkIfPartnerReady();
            wait(10);

            tester.settingsStep('Номер телефона').nextButton().click();
            tester.requestSyncEmployees().setDone().send();
            tester.requestEmployees().send();
            wait(10);

            tester.employeesGrid.row().atIndex(1).column().first().checkbox().click();
            tester.employeesGrid.row().first().column().first().checkbox().click();
            tester.employeesGrid.row().atIndex(3).column().first().checkbox().click();
            tester.employeesGrid.row().atIndex(2).column().first().checkbox().click();
            wait(10);

            tester.settingsStep('Сотрудники').nextButton().click();
            wait(10);

            tester.requestChooseEmployees().send();
            wait(10);

            tester.sequentialForwardingTypeButton().click();
            wait(10);

            tester.employeePhoneField().input('9161234567');
            wait(10);

            tester.receiveSmsButton.click();
            tester.requestSms().send();
            wait(10);

            wait(10);

            tester.smsCodeField().input('1234');
            wait(10);

            tester.confirmNumberButton.click();

            tester.requestCodeInput().send();
            wait(10);

            tester.dialTimeField().fill('15');
            wait(10);

            tester.settingsStep('Правила обработки вызовов').
                nextButton().click();
            wait(10);
        });
        
        describe('Пользователь заходит в легкий вход впервые.', function() {
            beforeEach(function() {
                tester.requestCallProcessingConfig().setNoNextStepParams().send();
                wait(10);
            });

            describe('Открываю вкладку "Мультиворонки". Выбираю воронку.', function() {
                beforeEach(function() {
                    tester.integrationSettingsTabpanel.
                        tab('Мультиворонки').click();
                    wait(10);

                    tester.integrationConfigForm.combobox().withFieldLabel('Создавать сделку в воронке').clickArrow().
                        option('Другая воронка').click();
                    wait(10);
                });

                it(
                    'В выпадающем списке этапов отсутствуют этапы, которые не относятся к выбранной воронке.',
                function() {
                    tester.integrationConfigForm.combobox().withFieldLabel('Создавать сделку в этапе').clickArrow().
                        option('Некий статус').expectNotToExist();
                    tester.integrationConfigForm.combobox().withFieldLabel('Создавать сделку в этапе').clickArrow().
                        option('Другой статус').expectToExist();
                });
                it(
                    'Выбираю другую воронку. В выпадающем списке этапов отсутствуют этапы, которые не относятся к ' +
                    'выбранной воронке.',
                function() {
                    tester.integrationConfigForm.combobox().withFieldLabel('Создавать сделку в воронке').clickArrow().
                        option('Некая воронка').click();
                    wait(10);

                    tester.integrationConfigForm.combobox().withFieldLabel('Создавать сделку в этапе').clickArrow().
                        option('Некий статус').expectToExist();
                    tester.integrationConfigForm.combobox().withFieldLabel('Создавать сделку в этапе').clickArrow().
                        option('Другой статус').expectNotToExist();
                });
            });
            describe('Открываю вкладку "Дополнительные поля".', function() {
                beforeEach(function() {
                    tester.integrationSettingsTabpanel.
                        tab('Дополнительные поля').click();
                    wait(10);
                });

                it('Выбираю опцию, отличную от опции "Виртульный номер". Опция не выбрана.', function() {
                    tester.integrationConfigForm.combobox().
                        withFieldLabel('В дополнительное поле amoCRM').
                        clickArrow().
                        option('Это поле').
                        click();
                    wait(10);

                    tester.integrationConfigForm.combobox().withFieldLabel('В дополнительное поле amoCRM').
                        expectToHaveValue('');
                });
                it('Выбираю опцию Виртульный номер". Опция выбрана.', function() {
                    tester.integrationConfigForm.combobox().
                        withFieldLabel('В дополнительное поле amoCRM').
                        clickArrow().
                        option('Виртуальный номер').
                        click();
                    wait(10);

                    tester.integrationConfigForm.combobox().withFieldLabel('В дополнительное поле amoCRM').
                        expectToHaveValue('Виртуальный номер');
                });
                it('Опция отличная от опции "Виртульный номер" выделена серым цветом.', function() {
                    tester.integrationConfigForm.combobox().
                        withFieldLabel('В дополнительное поле amoCRM').
                        clickArrow().
                        option('Это поле').
                        expectToHaveClass('easystart-grey-text');
                });
                it('Опция "Виртульный номер" не выделена серым цветом.', function() {
                    tester.integrationConfigForm.combobox().
                        withFieldLabel('В дополнительное поле amoCRM').
                        clickArrow().
                        option('Виртуальный номер').
                        expectNotToHaveClass('easystart-grey-text');
                });
            });
            it('В полях настроек интеграции установлены значения по умолчанию.', function() {
                tester.integrationConfigForm.combobox().
                    withFieldLabel('Для первичных обращений').
                    expectToHaveValue('Создать сделку и контакт');

                tester.integrationSettingsTabpanel.
                    tab('Потерянные обращения').click();
                wait(10);

                tester.integrationConfigForm.combobox().
                    withFieldLabel('Ответственный за потерянные звонки').
                    expectToHaveValue('Чиграков Марк (Менеджер)');


                tester.integrationConfigForm.combobox().
                    withFieldLabel('Срок задачи').
                    expectToHaveValue('Весь день');
            });
            describe('Открываю вкладку "Тегирование".', function() {
                beforeEach(function() {
                    tester.integrationSettingsTabpanel.
                        tab('Тегирование').click();
                    wait(10);
                });

                it(
                    'Выбираю в выпадающем списке тегов опцию отличную от опции "Виртульный номер". Тег не добавлен.',
                function() {
                    tester.successfulCallsTagsCombo().clickArrow().option('Тэг номер одиннадцать').click();
                    wait(10);

                    tester.tagRemoveTool('Тэг номер одиннадцать').expectNotToExist();
                });
                it(
                    'Выбираю в выпадающем списке тегов опцию "Виртульный номер". Тег добавлен.',
                function() {
                    tester.successfulCallsTagsCombo().clickArrow().option('Виртуальный номер').click();
                    wait(10);
                    
                    tester.tagRemoveTool('Виртуальный номер').expectToExist();
                });
                it('Опция отличная от опции "Виртуальный номер" выделена серым цветом.', function() {
                    tester.successfulCallsTagsCombo().clickArrow().option('Тэг номер одиннадцать').
                        expectToHaveClass('easystart-grey-text');
                });
                it('Опция "Виртуальный номер" не выделена серым цветом.', function() {
                    tester.successfulCallsTagsCombo().clickArrow().option('Виртуальный номер').
                        expectNotToHaveClass('easystart-grey-text');
                });
                describe('Ввожу в один из выпадающих списков тег, отсутсвующий в списке.', function() {
                    beforeEach(function() {
                        tester.successfulCallsTagsCombo().input('Тэг номер один');
                        wait(10);
                        tester.addSuccessfulCallTagButton.click();
                        wait(10);
                    });

                    it('Тег добавлен.', function() {
                        tester.successfulCallsTagRemoveTool('Тэг номер один').expectToExist();
                    });
                    it('Выбираю в другом выпадающем списке введенный ране тег. Тег добавлен.', function() {
                        tester.lostCallsTagsCombo().clickArrow().option('Тэг номер один').click();
                        wait(10);

                        tester.lostCallsTagRemoveTool('Тэг номер один').expectToExist();
                    });
                    it('В другом выпадающем списке введенный ране тег не отмечен серым.', function() {
                        tester.lostCallsTagsCombo().clickArrow().option('Тэг номер один').
                            expectNotToHaveClass('easystart-grey-text');
                    });
                });
            });
            it(
                'Заполняю поля настроек интеграции. Нажимаю на кнопку "Продолжить". На сервер отправлены значения, ' +
                'установленные для полей.',
            function() {
                tester.integrationSettingsTabpanel.
                    tab('Потерянные обращения').click();
                wait(10);

                tester.integrationConfigForm.combobox().
                    withFieldLabel('Ответственный за потерянные звонки').
                    clickArrow().
                    option('Закиров Эдуард (Менеджер)').
                    click();
                wait(10);

                tester.integrationSettingsTabpanel.
                    tab('Тегирование').click();
                wait(10);

                tester.successfulCallsTagsCombo().input('Тэг номер один');
                wait(10);
                tester.addSuccessfulCallTagButton.click();
                wait(10);

                tester.successfulCallsTagsCombo().input('Тэг номер два');
                wait(10);
                tester.addSuccessfulCallTagButton.click();
                wait(10);

                tester.lostCallsTagsCombo().input('Тэг номер три');
                wait(10);
                tester.addLostCallTagButton.click();
                wait(10);

                tester.lostCallsTagsCombo().input('Тэг номер четыре');
                wait(10);
                tester.addLostCallTagButton.click();
                wait(10);

                tester.integrationSettingsTabpanel.
                    tab('Дополнительные поля').click();
                wait(10);

                tester.integrationConfigForm.combobox().
                    withFieldLabel('Передавать значение из UIS').
                    clickArrow();
                wait(10);

                tester.uisFieldExpander.click();
                wait(10);
                tester.uisFieldRow.click();
                wait(10);

                tester.integrationConfigForm.combobox().
                    withFieldLabel('В дополнительное поле amoCRM').
                    clickArrow().
                    option('Это поле').
                    click();
                wait(10);

                tester.settingsStep('Настройка интеграции').nextButton().click();
                wait(10);

                tester.requestIntegrationConfig().send();
                tester.requestAnswers().send();
            });
        });
        it(
            'В соответствии с данными, полученными от сервера опция "Использовать функциональность "Неразобранное"" ' +
            'должна быть выбрана и заблокирована. При наведении курсора мыши на опцию "Использовать функциональность ' +
            '"Неразобранное"" отображается сообщение о невозможности сохранения изменений.',
        function() {
            tester.requestCallProcessingConfig().setUnsorted().send();
            wait(10);

            tester.integrationConfigForm.combobox().
                withFieldLabel('Для первичных обращений').clickArrow().
                option('Использовать функциональность "Неразобранное"').
                expectTooltipWithText(
                    'Невозможно сохранить изменения, так как в личном кабинете amoCRM "Неразобранное" ' +
                    'деактивировано. Активируйте "Неразобранное" в личном кабинете amoCRM и попробуйте снова или ' +
                    'отключите использование "Неразобранного" в настройках интеграции.'
                ).toBeShownOnMouseOver();
        });
        describe(
            'В соответствии с данными, полученными от сервера опция "Использовать функциональность "Неразобранное"" ' +
            'должна быть доступна.',
        function() {
            beforeEach(function() {
                tester.requestCallProcessingConfig().setUnsortedEnabled().send();
                wait(10);
            });
            
            it(
                'При наведении курсора мыши на опцию "Обрабатывать вручную" не отображается всплывающее сообщение.',
            function() {
                tester.integrationConfigForm.combobox().
                    withFieldLabel('Для первичных обращений').clickArrow().
                    option('Использовать функциональность "Неразобранное"').
                    expectNoTooltipToBeShownOnMouseOver();
            });
            it('Опция "Использовать функциональность "Неразобранное"" не выделена серым цветом.', function() {
                tester.integrationConfigForm.combobox().
                    withFieldLabel('Для первичных обращений').clickArrow().
                    option('Использовать функциональность "Неразобранное"').
                    expectNotToHaveClass('easystart-grey-text');
            });
            it('Опцию "Использовать функциональность "Неразобранное"" можно выбрать.', function() {
                tester.integrationConfigForm.combobox().
                    withFieldLabel('Для первичных обращений').clickArrow().
                    option('Использовать функциональность "Неразобранное"').
                    click();

                tester.integrationConfigForm.combobox().
                    withFieldLabel('Для первичных обращений').
                    expectToHaveValue('Использовать функциональность "Неразобранное"');
            });
        });
        describe(
            'В соответствии с данными, полученными от сервера один из выбранных ранее тегов является динамическим. ' +
            'Открываю вкладку "Тегирование"',
        function() {
            beforeEach(function() {
                tester.requestCallProcessingConfig().addDynamicalTag().send();
                wait(10);

                tester.integrationSettingsTabpanel.tab('Тегирование').click();
                wait(10);
            });

            it('Выбранные ранее теги не являющиеся динамическими присутствуют в выпадающем списке тегов.', function() {
                tester.successfulCallsTagsCombo().clickArrow().option('Тэг номер один').expectToExist();
            });
            it('Выбранные ранее теги являющиеся динамическими отсутсвтуют в выпадающем списке тегов.', function() {
                tester.successfulCallsTagsCombo().clickArrow().option('{{virtual_phone_number}}').expectNotToExist();
            });
        });
        describe(
            'В соответствии с данными, полученными от сервера опция "Использовать функциональность "Неразобранное"" ' +
            'должна быть заблокирована.',
        function() {
            beforeEach(function() {
                tester.requestCallProcessingConfig().send();
                wait(10);
            });

            it('Опция "Использовать функциональность "Неразобранное"" отмечена серым цветом.', function() {
                tester.integrationConfigForm.combobox().
                    withFieldLabel('Для первичных обращений').clickArrow().
                    option('Использовать функциональность "Неразобранное"').
                    expectToHaveClass('easystart-grey-text');
            });
            it('Опцию "Обрабатывать вручную" можно выбрать.', function() {
                tester.integrationConfigForm.combobox().
                    withFieldLabel('Для первичных обращений').clickArrow().
                    option('Обрабатывать вручную').
                    click();

                tester.integrationConfigForm.combobox().
                    withFieldLabel('Для первичных обращений').
                    expectToHaveValue('Обрабатывать вручную');
            });
            it('Опцию "Использовать функциональность "Неразобранное"" невозможно выбрать.', function() {
                tester.integrationConfigForm.combobox().
                    withFieldLabel('Для первичных обращений').clickArrow().
                    option('Использовать функциональность "Неразобранное"').
                    click();

                tester.integrationConfigForm.combobox().
                    withFieldLabel('Для первичных обращений').
                    expectToHaveValue('Создать сделку');
            });
            it(
                'При наведении курсора мыши на опцию "Обрабатывать вручную" не отображается всплывающее сообщение.',
            function() {
                tester.integrationConfigForm.combobox().
                    withFieldLabel('Для первичных обращений').clickArrow().
                    option('Обрабатывать вручную').
                    expectNoTooltipToBeShownOnMouseOver();
            });
            it(
                'При наведении курсора мыши на опцию "Использовать функциональность "Неразобранное"" отображается ' +
                'сообщение о неактивности опции.',
            function() {
                tester.integrationConfigForm.combobox().
                    withFieldLabel('Для первичных обращений').clickArrow().
                    option('Использовать функциональность "Неразобранное"').
                    expectTooltipWithText(
                        'Неразобранное неактивно на уровне аккаунта в amoCRM. Для использования данного функционала ' +
                        'активируйте его в amoCRM.'
                    ).toBeShownOnMouseOver();
            });
            it(
                'Открываю вкладку "Тегирование". Изменяю значение полей для ввода тегов. Нажимаю на кнпоку ' +
                '"Продолжить". На сервер отправлены выбранные теги.',
            function() {
                tester.integrationSettingsTabpanel.
                    tab('Тегирование').click();
                wait(10);

                tester.tagRemoveTool('Тэг номер один').click();
                wait(10);
                tester.tagRemoveTool('Тэг номер четыре').click();
                wait(10);
                
                tester.successfulCallsTagsCombo().clickArrow().
                    option('Тэг номер четыре').click();
                wait(10);
                tester.successfulCallsTagsCombo().input('Еще один тег');
                wait(10);
                tester.addSuccessfulCallTagButton.click();
                wait(10);

                tester.lostCallsTagsCombo().clickArrow().
                    option('Виртуальный номер').click();
                wait(10);
                tester.lostCallsTagsCombo().input('Какой-то тег');
                wait(10);
                tester.addLostCallTagButton.click();
                wait(10);

                tester.settingsStep('Настройка интеграции').
                    nextButton().click();
                wait(10);
                tester.requestIntegrationConfig().changeTags().send();
                tester.requestAnswers().send();
            });
            it('Поля настроек интеграции заполнены значениями, полученными от сервера.', function() {
                tester.integrationConfigForm.combobox().
                    withFieldLabel('Для первичных обращений').
                    expectToHaveValue('Создать сделку');

                tester.integrationSettingsTabpanel.
                    tab('Потерянные обращения').click();
                wait(10);

                tester.integrationConfigForm.combobox().
                    withFieldLabel('Ответственный за потерянные звонки').
                    expectToHaveValue('Закиров Эдуард (Менеджер)');

                tester.integrationConfigForm.combobox().
                    withFieldLabel('Срок задачи').
                    expectToHaveValue('Некий срок');

                tester.integrationSettingsTabpanel.
                    tab('Дополнительные поля').click();
                wait(10);

                tester.integrationConfigForm.combobox().
                    withFieldLabel('Передавать значение из UIS').
                    expectToHaveValue('Другое поле');

                tester.integrationConfigForm.combobox().
                    withFieldLabel('В дополнительное поле amoCRM').
                    expectToHaveValue('Это поле');
            });
        });
    });
    describe(
        'Открываю страницу легкого входа amoCRM. Нажимаю на кнопку "Тестировать бесплатно". Нажимаю на кнпоку ' +
        '"Продолжить". В соответствии с данными, полученными от сервера ранее были выбраны три сотрудника.',
    function() {
        beforeEach(function() {
            EasyStart.getApplication().checkIfPartnerReady();
            wait(100);

            tester.settingsStep('Номер телефона').nextButton().click();
            tester.requestSyncEmployees().setDone().send();
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

            it(
                'В соответствии с данными, полученными от сервера один из выбранных сотрудников принимает звонки на ' +
                'виджет. Отмечена радиокнопка "В виджет".',
            function() {
                tester.requestChooseEmployees().setQueue().setToWidget().send();
                wait(100);

                tester.toMobilePhoneButton().expectNotToBeChecked();
                tester.toWidgetRadioButton().expectToBeChecked();
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
                            wait(100);
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
                                'станет снова доступным через четыре минуты. Прошла одна секунда. Кнопка получения ' +
                                'кода подтвеждения содержит текст "3 минуты 59 секунд".',
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

                                    it('Кнопка "Продолжить" заблокирована.', function() {
                                        tester.settingsStep('Правила обработки вызовов').nextButton().
                                            expectToBeDisabled();
                                    });
                                    it(
                                        'Нажимаю на кнопку "В виджет". Нажимаю на кнопку "Продолжить". Отправляется ' +
                                        'запрос сохранения правил обработки вызовов, устанавливающий переадресацию в ' +
                                        'виджет для одного из сотрудников.',
                                    function() {
                                        tester.toWidgetRadioButton().click();
                                        wait(3);

                                        tester.dialTimeField().fill('15');
                                        wait();

                                        tester.settingsStep('Правила обработки вызовов').nextButton().click();
                                        wait(10);
                                        tester.requestCallProcessingConfig().setToWidget().send();
                                        wait(10);
                                    });
                                    it('Текст "Номер подтвержден" не отображается.', function() {
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
                                            'В соответствии с данными, полученными от сервера код подтверждения был ' +
                                            'некорректным.',
                                        function() {
                                            beforeEach(function() {
                                                tester.requestCodeInput().setCodeInvalid().send();
                                                wait(6);
                                            });

                                            it(
                                                'Отображено сообщение о том, что код подтверждения некорректен. ' +
                                                'Кнопка "Продолжить" заблокирована.',
                                            function() {
                                                tester.errorMessage('Неверный код, пожалуйста, запросите новый код').
                                                    expectToBeVisible();
                                                
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
                                            'В соответствии с данными, полученными от сервера код подтверждения был ' +
                                            'корректным.',
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
                                                    withHeader('Переадресация на телефон сотрудника *').createTester().
                                                    forDescendantWithText('Номер подтвержден').expectToBeVisible();
                                            });
                                            it(
                                                'Нажимаю на кнпоку "Продолжить". Нажимаю на кнопку "Назад".Кнопка ' +
                                                '"Продолжить" доступна. Отображено сообщение "Номер подтвержден".',
                                            function() {
                                                tester.dialTimeField().fill('15');
                                                wait(10);

                                                tester.settingsStep('Правила обработки вызовов').nextButton().click();
                                                wait(10);
                                                tester.requestCallProcessingConfig().send();
                                                wait(10);

                                                tester.settingsStep('Настройка интеграции').backButton().click();
                                                wait(10);

                                                tester.settingsStep('Правила обработки вызовов').nextButton().
                                                    expectToBeEnabled();

                                                tester.callProcessingGrid.row().first().column().
                                                    withHeader('Переадресация на телефон сотрудника *').createTester().
                                                    forDescendantWithText('Номер подтвержден').expectToBeVisible();
                                            });
                                            it(
                                                'Нажимаю на кнопку "В виджет". Нажимаю на кнпоку "Продолжить". ' +
                                                'Нажимаю на кнопку "Назад". Нажимаю на кнопку "На мобильный ' +
                                                'телеофон". Кнопка "Продолжить" заблокирована. Сообщение "Номер ' +
                                                'подтвержден" не отображается. Кнопка "Получить SMS" видима.',
                                            function() {
                                                tester.dialTimeField().fill('15');
                                                wait(10);

                                                tester.toWidgetRadioButton().click();
                                                wait(10);

                                                tester.settingsStep('Правила обработки вызовов').nextButton().click();
                                                wait(10);
                                                tester.requestCallProcessingConfig().setToWidget().send();
                                                wait(10);

                                                tester.settingsStep('Настройка интеграции').backButton().click();
                                                wait(10);

                                                tester.toMobilePhoneButton().click();
                                                wait(10);

                                                tester.settingsStep('Правила обработки вызовов').nextButton().
                                                    expectToBeDisabled();

                                                tester.callProcessingGrid.row().first().column().
                                                    withHeader('Переадресация на телефон сотрудника *').createTester().
                                                    forDescendantWithText('Номер подтвержден').expectToBeHidden();

                                                tester.receiveSmsButton.expectToBeVisible();
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
                                                'Изменяю номер телефона сотрудника. Кнопка "Продолжить" заблокирована.',
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
                                                    'Нажимаю на кнокпку "Одновременно всем". Кнопка "Продолжить" ' +
                                                    'досутпна.',
                                                function() {
                                                    tester.simoultaneousForwardingTypeButton().click();
                                                    wait(100);

                                                    tester.settingsStep('Правила обработки вызовов').nextButton().
                                                        expectToBeEnabled();
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
                                            describe('Ввожу номер телефона другого сотрудника частично.', function() {
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
                                                                'Прошло некторое время. До возобновления доступности ' +
                                                                'кнопки "Получть SMS" осталась одна секунда. Нажимаю ' +
                                                                'на кнопку "Продолжить". Проходит одна секунда. ' +
                                                                'Нажимаю на кнопку "Назад". Содержимое колонки ' +
                                                                '"Переадресация на телефон сотрудника" является ' +
                                                                'видимым.',
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
                                                                    tester.secondEmployeePhoneField().pressBackspace();
                                                                    wait(3);
                                                                });

                                                                it(
                                                                    'Поле "Код из SMS" скрыто. Кнопка "Продолжить" ' +
                                                                    'заблокирована.',
                                                                function() {
                                                                    tester.secondSmsCodeField().expectToBeHidden();

                                                                    tester.settingsStep('Правила обработки вызовов').
                                                                        nextButton().expectToBeDisabled();
                                                                });
                                                                it(
                                                                    'Ввожу заново последнюю цифру номера телефона ' +
                                                                    'другого сотрудника. Поле "Код из SMS" видимо. ' +
                                                                    'Кнопка "Продолжить" заблокирована.',
                                                                function() {
                                                                    tester.secondEmployeePhoneField().input('8');
                                                                    wait(2);

                                                                    tester.secondSmsCodeField().expectToBeVisible();
                                                                    tester.
                                                                        settingsStep('Правила обработки вызовов').
                                                                        nextButton().expectToBeDisabled();
                                                                });
                                                                it(
                                                                    'Изменил номер телефона другого сотрудника. Поле ' +
                                                                    '"Код из SMS" скрыто. Кнопка "Продолжить" ' +
                                                                    'заблокирована.',
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
                                                    'Нажимаю на кнопку "Продолжить". Нажимаю на кнопку "Продолжить".',
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
                                                        'Ответ сервера на запрос звонков содержит сообщение об ' +
                                                        'ошибке. Отображено сообщние об ошибке. Повторный запрос ' +
                                                        'звонков не был отправлен.',
                                                    function() {
                                                        tester.requestAnswers().setError().send();
                                                        wait();

                                                        tester.errorMessage('Что-то пошло не так').expectToBeVisible();
                                                    });
                                                    it(
                                                        'Не удалось разобрать ответ сервера. Отображено сообщение об ' +
                                                        'ошибке.',
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
                                                            'звонков. В соответствии с ответом сервера звонок был ' +
                                                            'пропущенным. Колонка "Ответил" пуста. Колонка "Статус ' +
                                                            'звонка" имеет содержимое "Пропущенный".',
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
                                                            'звонков. В соответствии с ответом сервера звонок был ' +
                                                            'успешным.',
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
                                                            'Ввожу в поле "День" значение, меньшее текущего времени. ' +
                                                            'При наведении курсора мыши на поле отображается ' +
                                                            'сообщение о некорректности значения.',
                                                        function() {
                                                            tester.floatingForm.textfield().
                                                                withFieldLabel('День *').
                                                                fill(tester.previousDay('d.m.Y'));
                                                            tester.requestAnswers().addFirstUser().
                                                                addSecondUser().send();

                                                            tester.floatingForm.textfield().withFieldLabel('День *').
                                                                expectTooltipContainingText(
                                                                    'Дата в этом поле должна быть позже'
                                                                ).toBeShownOnMouseOver();
                                                            tester.requestAnswers().addFirstUser().
                                                                addSecondUser().send();
                                                        });
                                                        it(
                                                            'Поля формы заказа обратного звонка заполнены значениями ' +
                                                            'по умолчанию.',
                                                        function() {
                                                            tester.floatingForm.textfield().withFieldLabel('День *').
                                                                expectValueToMatch(/^\d{2}\.\d{2}\.\d{4}$/);

                                                            tester.floatingForm.textfield().
                                                                withFieldLabel('С *').expectToHaveValue('11:00');

                                                            tester.floatingForm.textfield().
                                                                withFieldLabel('До *').expectToHaveValue('19:00');
                                                        });
                                                        describe('Заполняю форму заказа обратного звонка.', function() {
                                                            beforeEach(function() {
                                                                tester.floatingForm.textfield().
                                                                    withFieldLabel('Номер телефона *').
                                                                    input('4951234567');
                                                                tester.requestAnswers().addFirstUser().
                                                                    addSecondUser().send();

                                                                tester.floatingForm.textfield().
                                                                    withFieldLabel('День *').
                                                                    fill(tester.nextDay('d.m.Y'));
                                                                tester.requestAnswers().addFirstUser().
                                                                    addSecondUser().send();

                                                                tester.floatingForm.textfield().
                                                                    withFieldLabel('С *').fill('13:54');
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
                                                                'попытка заказа обратного звонка была безуспешной. ' +
                                                                'Отображено сообщение об ошбибке.',
                                                            function() {
                                                                tester.orderCallbackButton.click();

                                                                wait();
                                                                tester.requestAnswers().addFirstUser().
                                                                    addSecondUser().send();

                                                                tester.supportRequestSender.respondUnsuccessfully();

                                                                wait();
                                                                tester.requestAnswers().addFirstUser().
                                                                    addSecondUser().send();

                                                                tester.errorMessage('Invalid type for field "phone"').
                                                                    expectToBeVisible();

                                                                tester.floatingComponent.expectNotToBeMasked();
                                                            });
                                                            it(
                                                                'Сайтфон не подключен. Нажимаю на кнопку "Заказать ' +
                                                                'обратный звонок". Отображено сообщение об ошбибке.',
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
                                                                'Нажимаю на кнопку "Заказать обратный звонок". Окно ' +
                                                                'заблокировано.',
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

                                                                    tester.supportRequestSender.respondSuccessfully();
                                                                    wait();
                                                                    tester.requestAnswers().addFirstUser().
                                                                        addSecondUser().send();
                                                                });

                                                                it('Отправлена заявка на обратный звонок.', function() {
                                                                    tester.supportRequestSender.
                                                                        expectRequestParamsToContain({
                                                                            email: 'chigrakov@example.com',
                                                                            message: 'Заявка со страницы ' +
                                                                                'amoCRM Легкий вход. Номер ' +
                                                                                'телефона пользоватeля ' +
                                                                                '+74951234567. Удобное время для ' +
                                                                                'звонка - ' + tester.nextDay('Y-m-d') +
                                                                                ' с 13:54 до 20:05',
                                                                            name: 'Марк Чиграков Брониславович',
                                                                            phone: '74951234567'
                                                                        });
                                                                });
                                                                it(
                                                                    'В окне с заголовком "Спасибо" отображено ' +
                                                                    'выбранное время и день.',
                                                                function() {
                                                                    tester.floatingComponent.
                                                                        expectTextContentToHaveSubstring(
                                                                            tester.nextDay('d.m.Y') + ' с 13:54 по ' +
                                                                            '20:05 по МСК');
                                                                });
                                                                it(
                                                                    'Нажимаю на кнопку "Закрыть". Нажимаю на кнопку ' +
                                                                    '"Стать клентом". Изменяю значение в форме ' +
                                                                    'заказа обратного звонка. Нажимаю на кнопку ' +
                                                                    '"Заказать обратный звонок". В окне с заголовком ' +
                                                                    '"Спасибо" отображено выбранное время и день.',
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

                                                                    tester.supportRequestSender.respondSuccessfully();
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
