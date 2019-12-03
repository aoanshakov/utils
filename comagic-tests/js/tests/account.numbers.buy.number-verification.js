tests.addTest(function(requestsManager, testersFactory, wait, utils) {
    describe((
        'Открываю раздел "Аккаунт/Управление номерами". Нажимаю на кнопку "Подключить номер". Открываю вкладку ' +
        '"Добавить номер стороннего провайдера". Ввожу значение в поле "Номер". Нажимаю на кнопку "Далее".'
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
            wait();

            helper.discoverNumberBuyingWindow();

            helper.numberBuyingTabPanel.tab('Добавить номер стороннего провайдера').click();
            helper.getPrivateNumberCostRequest().send();
            wait();

            helper.basicSettingsForm.textfield().withFieldLabel('Номер *').fill('4951234567');
            wait();

            helper.basicSettingsNextButton.click();
            wait();
        });

        describe((
            'Ответ на запрос первого шага добавления номера стороннего провайдера содержит неизвестную мнемонику ' +
            'ошибки.'
        ), function() {
            beforeEach(function() {
                helper.numberValidationRequest().setSomeError().send();
                wait();
            });

            it('Отображено сообщение об ошибке.', function() {
                helper.basicSettingsErrorMessageBlock.expectToHaveTextContent('Произошла ошибка.');
            });
            it((
                'Нажимаю на кнопку "Далее". Запрос первого шага добавления номера стороннего провайдера завершился ' +
                'успешно. Сообщение об ошибке не отображается.'
            ), function() {
                helper.basicSettingsNextButton.click();
                helper.numberValidationRequest().send();
                wait();

                helper.numberVerificationBackButton.click();
                wait();
                helper.basicSettingsErrorMessageBlock.expectToBeHidden();
            });
        });
        describe('Запрос первого шага добавления номера стороннего провайдера завершился успешно.', function() {
            beforeEach(function() {
                helper.numberValidationRequest().send();
                wait();
            });

            it('Поля "Пауза, с" и "Доб. номер" заблокированы.', function() {
                helper.numberVerificationForm.textfield().withFieldLabel('Пауза, с').expectToBeDisabled();
                helper.numberVerificationForm.textfield().withFieldLabel('Доб. номер').expectToBeDisabled();
            });
            it('Значение поля "Номер" отформатировано по маске "+7 (###) ###-##-##".', function() {
                helper.numberVerificationForm.textfield().withFieldLabel('Номер').
                    expectToHaveValue('+7 (495) 123-45-67');
            });
            it('Кнопка "Далее" заблокирована.', function() {
                helper.numberVerificationNextButton.expectToBeDisabled();
            });
            it('Кнопка "Получить код" заблокирована.', function() {
                helper.codeGettingButton.expectToBeDisabled();
            });
            it('Поле "Код подтверждения" заблокировано.', function() {
                helper.numberVerificationForm.textfield().withFieldLabel('Код подтверждения *').expectToBeDisabled();
            });
            describe((
                'Отмечаю чекбокс "Я подтверждаю владение номером телефона, в соответствии с пользовательским ' +
                'соглашением".'
            ), function() {
                beforeEach(function() {
                    helper.numberVerificationForm.checkbox().withBoxLabel(
                        'Я подтверждаю владение номером телефона, в соответствии с пользовательским соглашением'
                    ).click();
                    wait();
                });

                it('Поле "Доб. номер" доступно.  Поле "Пауза, с" заблокировано.', function() {
                    helper.numberVerificationForm.textfield().withFieldLabel('Пауза, с').expectToBeDisabled();
                    helper.numberVerificationForm.textfield().withFieldLabel('Доб. номер').expectToBeEnabled();
                });
                it('В поле "Доб. номер" можно ввести цифры, а также символы "*" и "#".', function() {
                    helper.numberVerificationForm.textfield().withFieldLabel('Доб. номер').
                        fill('qi38u2349fe201w#(232@*&$)');

                    helper.numberVerificationForm.textfield().withFieldLabel('Доб. номер').
                        expectToHaveValue('382349201#232*');
                });
                it('Кнопка "Далее" заблокирована.', function() {
                    helper.numberVerificationNextButton.expectToBeDisabled();
                });
                it('Кнопка "Получить код" доступна.', function() {
                    helper.codeGettingButton.expectToBeEnabled();
                });
                it('Поле "Код подтверждения" заблокировано.', function() {
                    helper.numberVerificationForm.textfield().withFieldLabel('Код подтверждения *').
                        expectToBeDisabled();
                });
                it('Снизу кнопки "Получить код" не отображен никакой текст.', function() {
                    helper.codeGettingTimer.expectToHaveTextContent('');
                });
                it('Ввожу значение "0" в поле "Доб. номер". Поле "Пауза, с" доступно.', function() {
                    helper.numberVerificationForm.textfield().withFieldLabel('Доб. номер').fill('0');
                    wait();

                    helper.numberVerificationForm.textfield().withFieldLabel('Пауза, с').expectToBeEnabled();
                });
                describe('Ввожу значение "001" в поле "Доб. номер".', function() {
                    beforeEach(function() {
                        helper.numberVerificationForm.textfield().withFieldLabel('Доб. номер').fill('001');
                        wait();
                    });

                    it('Стираю значение в поле "Доб. номер". Поле "Пауза, с" заблокировано.', function() {
                        helper.numberVerificationForm.textfield().withFieldLabel('Доб. номер').clear();
                        wait();

                        helper.numberVerificationForm.textfield().withFieldLabel('Пауза, с').expectToBeDisabled();
                    });
                    it('Поле "Пауза, с" доступно.', function() {
                        helper.numberVerificationForm.textfield().withFieldLabel('Пауза, с').expectToBeEnabled();
                    });
                    it('Поле "Пауза, с" имеет значение 2.', function() {
                        helper.numberVerificationForm.textfield().withFieldLabel('Пауза, с').expectToHaveValue(2);
                    });
                    it((
                        'Снимаю отметку с чекбокса "Я подтверждаю владение номером телефона, в соответствии с ' +
                        'пользовательским соглашением". Поле "Пауза, с" заблокировано.'
                    ), function() {
                        helper.numberVerificationForm.checkbox().withBoxLabel(
                            'Я подтверждаю владение номером телефона, в соответствии с пользовательским соглашением'
                        ).click();
                        wait();

                        helper.numberVerificationForm.textfield().withFieldLabel('Пауза, с').expectToBeDisabled();
                    });
                    describe('Ввожу значение в поле "Пауза, с".', function() {
                        beforeEach(function() {
                            helper.numberVerificationForm.combobox().withFieldLabel('Пауза, с').clickArrow().
                                option('15').click();
                        });

                        describe((
                            'Нажимаю на кнопку "Получить код". Ответ на запрос получения кода содержит неизвестную ' +
                            'мнемонику ошибки.'
                        ), function() {
                            beforeEach(function() {
                                helper.codeGettingButton.click();
                                helper.verificationCodeRequest().setSomeError().send();
                                wait();
                            });

                            it('Отображено сообщение об ошибке.', function() {
                                helper.numberVerificationErrorMessageBlock.expectToHaveTextContent('Произошла ошибка.');
                            });
                            it((
                                'Нажимаю на кнопку "Получить код". Запрос получени кода успешно завершен. Сообщение ' +
                                'об ошибке не отображается.'
                            ), function() {
                                helper.codeGettingButton.click();
                                helper.verificationCodeRequest().send();
                                wait();

                                helper.numberVerificationErrorMessageBlock.expectToBeHidden();
                            });
                        });
                        describe((
                            'Нажимаю на кнопку "Получить код". Жду пять минут. Нажимаю на кнопку "Получить код". ' +
                            'Лимит попыток получения кода исчерпан.'
                        ), function() {
                            beforeEach(function() {
                                helper.codeGettingButton.click();
                                helper.verificationCodeRequest().send();
                                wait(601);

                                helper.codeGettingButton.click();
                                helper.verificationCodeRequest().setAttemptLimitExceeded().send();
                                wait();
                            });

                            it('Отображено сообщение об исчерпании лимита попыток получения кода.', function() {
                                helper.numberVerificationErrorMessageBlock.expectToHaveTextContent(
                                    'Превышено допустимое количество попыток. Обратитесь в техническую поддержку.'
                                );
                            });
                            it('Кнопка "Получить код" заблокирована.', function() {
                                helper.codeGettingButton.expectToBeDisabled();
                            });
                            it('Поле "Код подтверждения" заблокировано.', function() {
                                helper.numberVerificationForm.textfield().withFieldLabel('Код подтверждения *').
                                    expectToBeDisabled();
                            });
                        });
                        describe('Нажимаю на кнопку "Получить код".', function() {
                            beforeEach(function() {
                                helper.codeGettingButton.click();
                                helper.verificationCodeRequest().send();
                                wait();
                            });

                            it((
                                'При наведении курсора мыши на поле "Код подтверждения" отображается сообщение об ' +
                                'обязательности заполнения поля.'
                            ), function() {
                                helper.numberVerificationForm.textfield().withFieldLabel('Код подтверждения *').focus();
                                helper.numberVerificationForm.textfield().withFieldLabel('Код подтверждения *').blur();
                                helper.numberVerificationForm.textfield().withFieldLabel('Код подтверждения *').
                                    expectToHaveError('Это поле обязательно для заполнения');
                            });
                            it('Кнопка "Далее" заблокирована.', function() {
                                helper.numberVerificationNextButton.expectToBeDisabled();
                            });
                            it('Кнопка "Получить код" заблокирована.', function() {
                                helper.codeGettingButton.expectToBeDisabled();
                            });
                            it('Снизу кнопки "Получить код" отображен текст "Через 5 минут".', function() {
                                helper.codeGettingTimer.expectToHaveTextContent('Через 5 минут');
                            });
                            it((
                                'Жду одну секунду. Снизу кнопки "Получить код" отображен текст "Через 4 минуты 59 ' +
                                'секунд".'
                            ), function() {
                                wait(2);
                                helper.codeGettingTimer.expectToHaveTextContent('Через 4 минуты 59 секунд');
                            });
                            it((
                                'Жду 6 секунд. Снизу кнопки "Получить код" отображен текст "Через 4 минуты 54 секунды".'
                            ), function() {
                                wait(12);
                                helper.codeGettingTimer.expectToHaveTextContent('Через 4 минуты 54 секунды');
                            });
                            it((
                                'Жду 9 секунд. Снизу кнопки "Получить код" отображен текст "Через 4 минуты 51 секунду".'
                            ), function() {
                                wait(18);
                                helper.codeGettingTimer.expectToHaveTextContent('Через 4 минуты 51 секунду');
                            });
                            it((
                                'Жду 46 секунд. Снизу кнопки "Получить код" отображен текст "Через 4 минуты 14 секунд".'
                            ), function() {
                                wait(92);
                                helper.codeGettingTimer.expectToHaveTextContent('Через 4 минуты 14 секунд');
                            });
                            it((
                                'Жду 49 секунд. Снизу кнопки "Получить код" отображен текст "Через 4 минуты 11 секунд".'
                            ), function() {
                                wait(98);
                                helper.codeGettingTimer.expectToHaveTextContent('Через 4 минуты 11 секунд');
                            });
                            it((
                                'Жду 56 секунд. Снизу кнопки "Получить код" отображен текст "Через 4 минуты 4 секунды".'
                            ), function() {
                                wait(112);
                                helper.codeGettingTimer.expectToHaveTextContent('Через 4 минуты 4 секунды');
                            });
                            it(
                                'Жду 240 секунд. Снизу кнопки "Получить код" отображен текст "Через 1 минуту".',
                            function() {
                                wait(480);
                                helper.codeGettingTimer.expectToHaveTextContent('Через 1 минуту');
                            });
                            it(
                                'Жду 241 секунду. Снизу кнопки "Получить код" отображен текст "Через 59 секунд".',
                            function() {
                                wait(482);
                                helper.codeGettingTimer.expectToHaveTextContent('Через 59 секунд');
                            });
                            describe('Жду пять минут.', function() {
                                beforeEach(function() {
                                    wait(601);
                                });

                                it('Снизу кнопки "Получить код" не отображен никакой текст.', function() {
                                    helper.codeGettingTimer.expectToHaveTextContent('');
                                });
                                it(
                                    'Жду одну секунду. Снизу кнопки "Получить код" не отображен никакой текст.',
                                function() {
                                    wait(2);
                                    helper.codeGettingTimer.expectToHaveTextContent('');
                                });
                                it('Кнопка "Получить код" доступна.', function() {
                                    helper.codeGettingButton.expectToBeEnabled();
                                });
                            });
                            it((
                                'Снимаю отметку с чекбокса "Я подтверждаю владение номером телефона, в соответствии ' +
                                'с пользовательским соглашением". Кнопка "Далее" заблокирована.'
                            ), function() {
                                helper.numberVerificationForm.checkbox().withBoxLabel(
                                    'Я подтверждаю владение номером телефона, в соответствии с пользовательским ' +
                                    'соглашением'
                                ).click();
                                wait();

                                helper.numberVerificationNextButton.expectToBeDisabled();
                            });
                            it('Сообщение об ошибке не отображено.', function() {
                                helper.numberVerificationErrorMessageBlock.expectToBeHidden();
                            });
                            describe(
                                'Ввожу значение в поле "Код подтверждения". Нажимаю на кнопку "Далее".',
                            function() {
                                beforeEach(function() {
                                    helper.numberVerificationForm.textfield().withFieldLabel('Код подтверждения *').
                                        fill('1234');
                                    wait();

                                    helper.numberVerificationNextButton.click();
                                    wait();
                                });

                                it((
                                    'Код подтверждения оказался некорректным. Отбражено сообщение о некорректности ' +
                                    'кода подтверждения.'
                                ), function() {
                                    helper.verificationCodeCheckRequest().setInvalidVerificationCode().send();
                                    wait();

                                    helper.numberVerificationErrorMessageBlock.expectToHaveTextContent(
                                        'Неверный код подтверждения, получите новый код'
                                    );
                                });
                                describe((
                                    'Ответ на запрос второго шага добавления номера стороннего провайдера содержит ' +
                                    'неизвестную мнемонику ошибки.'
                                ), function() {
                                    beforeEach(function() {
                                        helper.verificationCodeCheckRequest().setSomeError().send();
                                        wait();
                                    });

                                    it('Отображено сообщение об ошибке.', function() {
                                        helper.numberVerificationErrorMessageBlock.expectToHaveTextContent(
                                            'Произошла ошибка.');
                                    });
                                    it((
                                        'Нажимаю на кнопку "Назад". Нажимаю на кнопку "Далее". Сообщение об ошибке ' +
                                        'по-прежнему отображено.'
                                    ), function() {
                                        helper.numberVerificationBackButton.click();
                                        wait();

                                        helper.basicSettingsNextButton.click();
                                        helper.numberValidationRequest().send();
                                        wait();

                                        helper.numberVerificationErrorMessageBlock.expectToHaveTextContent(
                                            'Произошла ошибка.');
                                    });
                                    it((
                                        'Нажимаю на кнопк "Назад". Ввожу другое значение в поле "Номер". Нажимаю на ' +
                                        'кнопку "Далее". Сообщение об ошибке не отображено.'
                                    ), function() {
                                        helper.numberVerificationBackButton.click();
                                        wait();

                                        helper.basicSettingsForm.textfield().withFieldLabel('Номер *').
                                            fill('4951234568');
                                        wait();

                                        helper.basicSettingsNextButton.click();
                                        helper.numberValidationRequest().setAnotherNumber().send();
                                        wait();

                                        helper.numberVerificationErrorMessageBlock.expectToBeHidden();
                                    });
                                    it('Поле "Код подтверждения" является пустым.', function() {
                                        helper.numberVerificationForm.textfield().withFieldLabel('Код подтверждения *').
                                            expectToHaveValue('');
                                    });
                                    it('Поле "Код подтверждения" заблокировано.', function() {
                                        helper.numberVerificationForm.textfield().withFieldLabel('Код подтверждения *').
                                            expectToBeDisabled();
                                    });
                                    it('Кнопка "Далее" заблокирована.', function() {
                                        helper.numberVerificationNextButton.expectToBeDisabled();
                                    });
                                    it((
                                        'Нажимаю на кнопку "Назад". Нажимаю на кнопку "Далее". Поле "Код ' +
                                        'подтверждения" заблокировано.'
                                    ), function() {
                                        helper.numberVerificationBackButton.click();
                                        wait();

                                        helper.basicSettingsNextButton.click();
                                        helper.numberValidationRequest().send();
                                        wait();

                                        helper.numberVerificationForm.textfield().withFieldLabel('Код подтверждения *').
                                            expectToBeDisabled();
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
