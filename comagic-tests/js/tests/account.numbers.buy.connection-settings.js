tests.addTest(function(requestsManager, testersFactory, wait, utils) {
    describe((
        'Открываю раздел "Аккаунт/Управление номерами". Нажимаю на кнопку "Подключить номер". Открываю вкладку ' +
        '"Добавить номер стороннего провайдера". Ввожу значение в поле "Номер". '
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

            helper.basicSettingsForm.textfield().withFieldLabel('Номер *').fill('4951234567');
            wait();
        });

        it('Заголовок шага "Проверка номера" видим.', function() {
            helper.numberVerificationStepTitle.expectToBeVisible();
        });
        describe((
            'Отмечаю радиокнопку "Исходящие звонки по тарифам стороннего оператора". Нажимаю на кнопку "Далее". ' +
            'Активен шаг "Настройка подключения". Нажимаю на кнопку "Назад". Отмечаю радиокнопку "Исходящие звонки ' +
            'по тарифам UIS".'
        ), function() {
            beforeEach(function() {
                helper.basicSettingsForm.radiofield().withBoxLabel('Исходящие звонки по тарифам стороннего оператора').
                    click();
                wait();

                helper.basicSettingsNextButton.click();
                helper.numberValidationRequest().setPrivateTrunk().send();
                wait();

                helper.connectionSettingsBackButton.click();
                wait();

                helper.basicSettingsForm.radiofield().withBoxLabel('Исходящие звонки по тарифам UIS').click();
                wait();
            });

            it('Заголовок шага "Проверка номера" видим.', function() {
                helper.numberVerificationStepTitle.expectToBeVisible();
            });
            it('Нажимаю на кнопку "Далее". Активен шаг "Проверка номера".', function() {
                helper.basicSettingsNextButton.click();
                wait();
                wait();
                helper.numberValidationRequest().send();
                wait();
                wait();

                helper.numberVerificationForm.expectToBeVisible();
            });
            it((
                'Отмечаю радиокнопку "Исходящие звонки по тарифам стороннего оператора". Заголовок шага "Проверка ' +
                'номера" скрыт.'
            ), function() {
                helper.basicSettingsForm.radiofield().withBoxLabel('Исходящие звонки по тарифам стороннего оператора').
                    click();
                wait();

                helper.numberVerificationStepTitle.expectToBeHidden();
            });
        });
        describe((
            'Нажимаю на кнопку "Далее". Отмечаю чекбокс "Я подтверждаю владение номером телефона, в соответствии с ' +
            'пользовательским соглашением". Нажимаю на кнопку "Получить код". Ввожу значение в поле "Код ' +
            'подтверждения". Нажимаю на кнопку "Далее".'
        ), function() {
            beforeEach(function() {
                helper.basicSettingsNextButton.click();
                helper.numberValidationRequest().send();
                wait();

                helper.numberVerificationForm.checkbox().withBoxLabel(
                    'Я подтверждаю владение номером телефона, в соответствии с пользовательским соглашением'
                ).click();
                wait();

                helper.numberVerificationForm.textfield().withFieldLabel('Доб. номер').fill('001');
                wait();

                helper.numberVerificationForm.combobox().withFieldLabel('Пауза, с').clickArrow().option('15').click();

                helper.codeGettingButton.click();
                helper.verificationCodeRequest().send();
                wait();

                helper.numberVerificationForm.textfield().withFieldLabel('Код подтверждения *').fill('1234');
                wait();

                helper.numberVerificationNextButton.click();
                helper.verificationCodeCheckRequest().send();
                wait();
            });

            it('Для поле "Порт" установлено значение "5060".', function() {
                helper.connectionSetttingsForm.textfield().withFieldLabel('Порт *').expectToHaveValue('5060');
            });
            describe('Ввожу значения в поля "Логин", "Имя сервера", "Порт" и "Пароль".', function() {
                beforeEach(function() {
                    helper.connectionSetttingsForm.textfield().withFieldLabel('Логин *').fill('somelogin');
                    helper.connectionSetttingsForm.textfield().withFieldLabel('Имя сервера *').fill('111.111.111.111');
                    helper.connectionSetttingsForm.textfield().withFieldLabel('Порт *').fill('12345');
                    helper.connectionSetttingsForm.textfield().withFieldLabel('Пароль *').fill('somepass');
                    wait();
                });

                describe('Нажимаю на кнопку "Подключить".', function() {
                    beforeEach(function() {
                        helper.applyButton.click();
                    });

                    it('Введенные учетные данные уже имеются в системе. Отображается сообщение об ошибке.', function() {
                        helper.connectionConfigurationRequest().setSipCredentialsAlreadyExist().send();
                        wait();

                        helper.supportRequestWindow.expectToBeHiddenOrNotExist();
                        helper.connectionSettingsErrorMessageBlock.expectToHaveTextContent(
                            'Введенные учетные данные уже имеются в системе. Пожалуйста, смените логин.'
                        );
                    });
                    describe('Шаблон оператора не найден.', function() {
                        beforeEach(function() {
                            helper.connectionConfigurationRequest().setNoOperatorTemplateMatch().send();
                            helper.requestUserContacts().send();
                            wait();
                        });

                        it('Открыто окно создания запроса в техподдержку.', function() {
                            helper.supportRequestWindow.expectToBeVisible();
                        });
                        describe('Нажимаю на кнопку "Отменить".', function() {
                            beforeEach(function() {
                                helper.supportRequestWindowCancelButton.click();
                                wait();
                            });


                            it('Окно запроса в техподдержку закрыто.', function() {
                                helper.supportRequestWindow.expectToBeHiddenOrNotExist();
                            });
                            it('Кнопка "Подключить" заблокирована.', function() {
                                helper.applyButton.expectToBeDisabled();
                            });
                            it('Изменяю значение в поле "Имя сервера". Кнопка "Подключить" доступна.', function() {
                                helper.connectionSetttingsForm.textfield().withFieldLabel('Имя сервера *').
                                    pressBackspace();
                                wait();

                                helper.applyButton.expectToBeEnabled();
                            });
                        });
                        it('Кнопка "Получить уведомление" заблокирована.', function() {
                            helper.supportRequestWindowSubmitButton.expectToBeDisabled();
                        });
                        it((
                            'Заполняю форму в окне создания запроса. Нажимаю на кпноку "Получить уведомление". ' +
                            'Отправлен запрос создания запроса. Окно добавления номера и окно создания запроса закрыто.'
                        ), function() {
                            helper.supportRequestWindow.combobox().withFieldLabel('Ф.И.О. *').clickArrow().
                                option('Иванов Иван Иванович').click();
                            helper.supportRequestWindow.combobox().withFieldLabel('Телефон *').clickArrow().
                                option('74951234567').click();
                            helper.supportRequestWindow.combobox().withFieldLabel('E-mail *').clickArrow().
                                option('ivanov@gmail.com').click();
                            wait();

                            helper.supportRequestWindowSubmitButton.click();
                            helper.requestCreateTicket().send();
                            helper.accountNumbersRequest().send();
                            wait();

                            testersFactory.createComponentTester(utils.getFloatingComponent()).
                                expectToBeHiddenOrNotExist();
                        });
                    });
                });
                describe('Нажимаю на кнопку "Назад".', function() {
                    beforeEach(function() {
                        helper.connectionSettingsBackButton.click();
                        wait();
                    });

                    it('Активен шаг "Основные настройки".', function() {
                        helper.basicSettingsForm.expectToBeVisible();
                    });
                    it(
                        'Ввожу значение в поле "Номер". Нажимаю на кнопку "Далее". Активен шаг "Проверка номера".',
                    function() {
                        helper.basicSettingsForm.textfield().withFieldLabel('Номер *').fill('4951234568');
                        wait();

                        helper.basicSettingsNextButton.click();
                        helper.numberValidationRequest().setAnotherNumber().send();
                        wait();

                        helper.numberVerificationForm.expectToBeVisible();
                    });
                });
            });
            it((
                'Ввожу значение "some  _#аыаАGвlogin*#аыаыв_   1#$Аыав" в поле "Логин". При наведении курсора мыши ' +
                'на поле отображается сообщение об ошибке.'
            ), function() {
                helper.connectionSetttingsForm.textfield().withFieldLabel('Логин *').
                    fill('some  _#аыаАGвlogin*#аыаыв_   1#$Аыав');
                wait();

                helper.connectionSetttingsForm.textfield().withFieldLabel('Логин *'). expectToHaveError('Это поле ' +
                    'должно содержать только буквы латинского алфавита, цифры, точки, - и _');
            });
            it((
                'Ввожу значение "so   АУыав**me-doопоmaПУывавы))in1аыа .com" в поле "Имя сервера". При наведении ' +
                'курсора мыши на поле отображается сообщение об ошибке.'
            ), function() {
                helper.connectionSetttingsForm.textfield().withFieldLabel('Имя сервера *').fill(
                    'so   АУыав**me-doопоmaПУывавы))in1аыа .com'
                );
                wait();

                helper.connectionSetttingsForm.textfield().withFieldLabel('Имя сервера *').
                    expectToHaveError('Значение должно быть валидным доменным именем сервера или IPv4-адресом');
            });
            it((
                'Ввожу значение "somedomain" в поле "Имя сервера". При наведении курсора мыши на поле отображается ' +
                'сообщение об ошибке.'
            ), function() {
                helper.connectionSetttingsForm.textfield().withFieldLabel('Имя сервера *').fill('somedomain');
                wait();

                helper.connectionSetttingsForm.textfield().withFieldLabel('Имя сервера *').expectToHaveError(
                    'Значение должно быть валидным доменным именем сервера или IPv4-адресом'
                );
            });
            it((
                'Ввожу значение "somedomain.com." в поле "Имя сервера". При наведении курсора мыши на поле ' +
                'отображается сообщение об ошибке.'
            ), function() {
                helper.connectionSetttingsForm.textfield().withFieldLabel('Имя сервера *').fill('somedomain.com.');
                wait();

                helper.connectionSetttingsForm.textfield().withFieldLabel('Имя сервера *').
                    expectToHaveError('Значение должно быть валидным доменным именем сервера или IPv4-адресом');
            });
            it((
                'Ввожу значение "somedomain..com" в поле "Имя сервера". При наведении курсора мыши на поле ' +
                'отображается сообщение об ошибке.'
            ), function() {
                helper.connectionSetttingsForm.textfield().withFieldLabel('Имя сервера *').fill('somedomain..com');
                wait();

                helper.connectionSetttingsForm.textfield().withFieldLabel('Имя сервера *').
                    expectToHaveError('Значение должно быть валидным доменным именем сервера или IPv4-адресом');
            });
            it((
                'Ввожу значение "1.2.3" в поле "Имя сервера". При наведении курсора мыши на поле отображается ' +
                'сообщение об ошибке.'
            ), function() {
                helper.connectionSetttingsForm.textfield().withFieldLabel('Имя сервера *').fill('1.2.3');
                wait();

                helper.connectionSetttingsForm.textfield().  withFieldLabel('Имя сервера *').
                    expectToHaveError('Значение должно быть валидным доменным именем сервера или IPv4-адресом');
            });
            it((
                'Ввожу значение "1.2.3.04" в поле "Имя сервера". При наведении курсора мыши на поле отображается ' +
                'сообщение об ошибке.'
            ), function() {
                helper.connectionSetttingsForm.textfield().withFieldLabel('Имя сервера *').fill('1.2.3.04');
                wait();

                helper.connectionSetttingsForm.textfield().withFieldLabel('Имя сервера *').
                    expectToHaveError('Значение должно быть валидным доменным именем сервера или IPv4-адресом');
            });
            it((
                'Ввожу значение "1.2.3.257" в поле "Имя сервера". При наведении курсора мыши на поле отображается ' +
                'сообщение об ошибке.'
            ), function() {
                helper.connectionSetttingsForm.textfield().withFieldLabel('Имя сервера *').fill('1.2.3.257');
                wait();

                helper.connectionSetttingsForm.textfield().withFieldLabel('Имя сервера *').
                    expectToHaveError('Значение должно быть валидным доменным именем сервера или IPv4-адресом');
            });
            it((
                'Ввожу значение "1.2.somedomain.4" в поле "Имя сервера". При наведении курсора мыши на поле ' +
                'отображается сообщение об ошибке.'
            ), function() {
                helper.connectionSetttingsForm.textfield().withFieldLabel('Имя сервера *').fill('1.2.somedomain.4');
                wait();

                helper.connectionSetttingsForm.textfield().withFieldLabel('Имя сервера *').
                    expectToHaveError('Значение должно быть валидным доменным именем сервера или IPv4-адресом');
            });
            it((
                'Ввожу значение "1.2.com" в поле "Имя сервера". При наведении курсора мыши на поле не отображается ' +
                'сообщение об ошибке.'
            ), function() {
                helper.connectionSetttingsForm.textfield().withFieldLabel('Имя сервера *').fill('1.2.com');
                wait();
                helper.connectionSetttingsForm.textfield().withFieldLabel('Имя сервера *').expectToHaveNoError();
            });
            it((
                'Ввожу значение "1.257.com" в поле "Имя сервера". При наведении курсора мыши на поле не отображается ' +
                'сообщение об ошибке.'
            ), function() {
                helper.connectionSetttingsForm.textfield().withFieldLabel('Имя сервера *').fill('1.257.com');
                wait();
                helper.connectionSetttingsForm.textfield().withFieldLabel('Имя сервера *').expectToHaveNoError();
            });
            it((
                'Ввожу значение "1.2.3.4" в поле "Имя сервера". При наведении курсора мыши на поле не отображается ' +
                'сообщение об ошибке.'
            ), function() {
                helper.connectionSetttingsForm.textfield().withFieldLabel('Имя сервера *').fill('1.2.3.4');
                wait();
                helper.connectionSetttingsForm.textfield().withFieldLabel('Имя сервера *').expectToHaveNoError();
            });
            it((
                'Ввожу значение "11.22.33.44" в поле "Имя сервера". При наведении курсора мыши на поле не ' +
                'отображается сообщение об ошибке.'
            ), function() {
                helper.connectionSetttingsForm.textfield().withFieldLabel('Имя сервера *').fill('11.22.33.44');
                wait();
                helper.connectionSetttingsForm.textfield().withFieldLabel('Имя сервера *').expectToHaveNoError();
            });
            it((
                'Ввожу значение "1.2.0.4" в поле "Имя сервера". При наведении курсора мыши на поле не отображается ' +
                'сообщение об ошибке.'
            ), function() {
                helper.connectionSetttingsForm.textfield().withFieldLabel('Имя сервера *').fill('1.2.0.4');
                wait();
                helper.connectionSetttingsForm.textfield().withFieldLabel('Имя сервера *').expectToHaveNoError();
            });
            it((
                'Ввожу значение "somedomain.com" в поле "Имя сервера". При наведении курсора мыши на поле не ' +
                'отображается сообщение об ошибке.'
            ), function() {
                helper.connectionSetttingsForm.textfield().withFieldLabel('Имя сервера *').fill('somedomain.com');
                wait();
                helper.connectionSetttingsForm.textfield().withFieldLabel('Имя сервера *').expectToHaveNoError();
            });
        });
    });
});
