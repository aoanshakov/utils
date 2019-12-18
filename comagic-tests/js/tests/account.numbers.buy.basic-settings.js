tests.addTest(function(requestsManager, testersFactory, wait, utils) {
    describe((
        'Открываю раздел "Аккаунт/Управление номерами". Нажимаю на кнопку "Подключить номер". Открываю вкладку ' +
        '"Добавить номер стороннего провайдера".'
    ), function() {
        var helper;

        beforeEach(function() {
            if (helper) {
                helper.destroy();
            }

            helper = new AccountNumbers(requestsManager, testersFactory, utils);

            helper.accountNumbersRequest().send();
            helper.batchReloadRequest().send();

            helper.buyNumberButton.click();
            helper.freeNumbersRequest().send();

            helper.numberLimitValuesRequest().send();
            helper.discoverNumberBuyingWindow();

            helper.numberBuyingTabPanel.tab('Добавить номер стороннего провайдера').click();
            helper.getPrivateNumberCostRequest().send();
            wait();
        });

        it((
            'Радиокнопка "Исходящие звонки по тарифам UIS" и "Исходящие звонки по тарифам стороннего оператора" ' +
            'доступны.'
        ), function() {
            helper.basicSettingsForm.radiofield().withBoxLabel('Исходящие звонки по тарифам UIS').expectToBeEnabled();

            helper.basicSettingsForm.radiofield().withBoxLabel('Исходящие звонки по тарифам стороннего оператора').
                expectToBeEnabled();
        });
        it('Отмечена радиокнопка "Исходящие звонки по тарифам UIS".', function() {
            helper.basicSettingsForm.radiofield().withBoxLabel('Исходящие звонки по тарифам UIS').
                expectToBeChecked();

            helper.basicSettingsForm.radiofield().withBoxLabel('Исходящие звонки по тарифам стороннего оператора').
                expectNotToBeChecked();
        });
        it('Сообщение о невозможности подключения телефона по тарифам UIS не отображается.', function() {
            helper.basicSettingsForm.createTester().forDescendantWithText(
                'Исходящие звонки с мобильного номера возможны только по тарифам стороннего оператора'
            ).expectToBeHiddenOrNotExist();
        });
        describe('Ввожу номер мобильного телефона в поле "Номер".', function() {
            beforeEach(function() {
                helper.basicSettingsForm.textfield().withFieldLabel('Номер *').fill('9161234567');
                wait();
            });

            it('Отмечена радиокнопка "Исходящие звонки по тарифам UIS".', function() {
                helper.basicSettingsForm.radiofield().withBoxLabel('Исходящие звонки по тарифам UIS').
                    expectToBeChecked();

                helper.basicSettingsForm.radiofield().withBoxLabel('Исходящие звонки по тарифам стороннего оператора').
                    expectNotToBeChecked();
            });
            it('Радиокнопка "Исходящие звонки по тарифам UIS" доступна.', function() {
                helper.basicSettingsForm.radiofield().withBoxLabel('Исходящие звонки по тарифам UIS').
                    expectToBeEnabled();

                helper.basicSettingsForm.radiofield().withBoxLabel('Исходящие звонки по тарифам стороннего оператора').
                    expectToBeEnabled();
            });
            it('Сообщение о невозможности подключения телефона по тарифам UIS не отображается.', function() {
                helper.basicSettingsForm.createTester().forDescendantWithText(
                    'Исходящие звонки с мобильного номера возможны только по тарифам стороннего оператора'
                ).expectToBeHiddenOrNotExist();
            });
        });
        describe((
            'Ввожу значение в поле "Номер". Нажимаю на кнопку "Далее". Сервер ответил мнемоникой ошибки ' +
            'используемого номера.'
        ), function() {
            beforeEach(function() {
                helper.basicSettingsForm.textfield().withFieldLabel('Номер *').fill('4951234567');
                wait();

                helper.basicSettingsNextButton.click();
                helper.numberValidationRequest().setNumberAlreadyExists().send();
                wait();
            });

            it('Отображено сообщение о том, что номер уже используется.', function() {
                helper.basicSettingsForm.textfield().withFieldLabel('Номер *').expectToHaveError(
                    'Номер уже используется. Пожалуйста, обратитесь в техническую поддержку для уточнения'
                );
            });
            it('Кнопка "Далее" заблокирована.', function() {
                helper.basicSettingsNextButton.expectToBeDisabled();
            });
            it((
                'Ввожу лишнюю цифру в поле "Номер". При наведении курсора мыши на поле отображается сообщение об ' +
                'ошибке.'
            ), function() {
                helper.basicSettingsForm.textfield().withFieldLabel('Номер *').input('8');
                wait();

                helper.basicSettingsForm.textfield().withFieldLabel('Номер *').expectToHaveError(
                    'Номер должен содержать 11 цифр. Пример правильного заполнения: +7 (495) 123-45-67. Иностранные ' +
                    'номера можно завести с помощью вашего персонального менеджера.'
                );
            });
            describe('Ввожу другое значение в поле "Номер".', function() {
                beforeEach(function() {
                    helper.basicSettingsForm.textfield().withFieldLabel('Номер *').pressBackspace().input('8');
                    wait();
                });

                it('При наведении курсора мыши на поле "Номер" не отображается сообщение об ошибке.', function() {
                    helper.basicSettingsForm.textfield().withFieldLabel('Номер *').expectToHaveNoError();
                });
                describe('Ввожу номер, который был введен ранее.', function() {
                    beforeEach(function() {
                        helper.basicSettingsForm.textfield().withFieldLabel('Номер *').pressBackspace().input('7');
                        wait();
                    });

                    it('Отображено сообщение о том, что номер уже используется.', function() {
                        helper.basicSettingsForm.textfield().withFieldLabel('Номер *').expectToHaveError(
                            'Номер уже используется. Пожалуйста, обратитесь в техническую поддержку для уточнения'
                        );
                    });
                    it('Кнопка "Далее" заблокирована.', function() {
                        helper.basicSettingsNextButton.expectToBeDisabled();
                    });
                });
                describe(
                    'Нажимаю на кнопку "Далее". Нажимаю на кнопку "Назад". Ввожу номер, который был введен ранее.',
                function() {
                    beforeEach(function() {
                        helper.basicSettingsNextButton.click();
                        helper.numberValidationRequest().setAnotherNumber().send();
                        wait();

                        helper.numberVerificationBackButton.click();
                        wait();

                        helper.basicSettingsForm.textfield().withFieldLabel('Номер *').pressBackspace().input('7');
                        wait();
                    });

                    it('Отображено сообщение о том, что номер уже используется.', function() {
                        helper.basicSettingsForm.textfield().withFieldLabel('Номер *').expectToHaveError(
                            'Номер уже используется. Пожалуйста, обратитесь в техническую поддержку для уточнения'
                        );
                    });
                    it('Кнопка "Далее" заблокирована.', function() {
                        helper.basicSettingsNextButton.expectToBeDisabled();
                    });
                });
            });
        });
    });
});
