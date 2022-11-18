tests.addTest(function({
    requestsManager,
    testersFactory,
    wait,
    utils,
    windowOpener,
    copiedTexts,
    postMessagesTester
}) {
    var tester;
    
    beforeEach(function() {
        tester = new EasystartAmocrm({
            requestsManager,
            testersFactory,
            utils
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
        '"Время дозвона". Нажимаю на кнопку "Продолжить". Нажимаю на кнопку "Продолжить".',
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
            postMessagesTester.expectMessageToBeSent('UISamoCRMWidgetRequestSettings');
        });

        describe('Нажимаю на кнопку "Тестовый исходящий".', function() {
            var easyStartRequest;
            
            beforeEach(function() {
                tester.button('Тестовый исходящий').click();
                wait();

                easyStartRequest = tester.easyStartRequest().expectToBeSent();
                tester.requestAnswers().send();
            });

            describe('Получено состояние тестового звонка.', function() {
                beforeEach(function() {
                    easyStartRequest.receiveResponse();

                    wait();
                    tester.requestAnswers().send();
                });

                describe('Ввожу номер телефона. Нажимаю на кнопку "Получить SMS".', function() {
                    beforeEach(function() {
                        tester.input.first.fill('9169275692');
                        tester.requestAnswers().send();
                    });

                    describe('Нажимаю на кнопку "Получить SMS".', function() {
                        beforeEach(function() {
                            tester.button('Получить SMS').click();
                            tester.testOutCallSmsRequest().receiveResponse();

                            wait();
                            tester.requestAnswers().send();
                        });

                        describe('Ввожу код.', function() {
                            beforeEach(function() {
                                tester.input.withPlaceholder('Код').fill('2840');
                                tester.requestAnswers().send();

                                wait();
                                tester.requestAnswers().send();
                            });

                            describe('Нажиаю на кнопку "Подтвердить".', function() {
                                var testOutCallCodeInputRequest;

                                beforeEach(function() {
                                    tester.button('Подтвердить').click();

                                    testOutCallCodeInputRequest = tester.testOutCallCodeInputRequest().
                                        expectToBeSent();
                                });

                                it('Не удалось подтвердить код. Отображено сообщение об ошибке.', function() {
                                    testOutCallCodeInputRequest.invaild().receiveResponse();

                                    wait();
                                    tester.requestAnswers().send();

                                    tester.input.withPlaceholder('Код').
                                        expectTooltipWithText('Неверный код. Попробуйте запросить код ещё раз').
                                        toBeShownOnMouseOver();

                                    tester.requestAnswers().send();
                                    tester.button('Получить SMS').expectToBeVisible();
                                });
                                it('Код подтверджен. Отображено сообщение о том, что код подтвержден.', function() {
                                    testOutCallCodeInputRequest.receiveResponse();

                                    wait();
                                    tester.requestAnswers().send();

                                    tester.input.first.expectToBeDisabled();
                                    tester.numberIsConfirmedText.expectToBeVisible();
                                });
                            });
                            it('Кнопка "Подтвердить" стала доступной.', function() {
                                tester.input.first.expectToBeEnabled();
                                tester.button('Подтвердить').expectToBeEnabled();

                                tester.numberIsConfirmedText.expectToBeHiddenOrNotExist();
                            });
                        });
                        describe('Прошло некоторое время.', function() {
                            beforeEach(function() {
                                wait();
                                tester.requestAnswers().send();

                                wait();
                                tester.requestAnswers().send();
                            });

                            it('Прошло еще какое-то время. Кнопка "Получить SMS" стала доступной.', function() {
                                for (i = 0; i < (59 * 2); i ++) {
                                    wait();
                                    tester.requestAnswers().send();
                                }

                                tester.button('Получить SMS').expectToBeEnabled();
                            });
                            it('Текст кнопки изменился.', function() {
                                tester.button('59 секунд').expectToBeDisabled();
                            });
                        });
                        it('Поле для ввода кода стало доступным.', function() {
                            tester.button('1 минута').expectToBeDisabled();
                            tester.input.withPlaceholder('Код').expectToBeEnabled();
                            tester.button('Подтвердить').expectToBeDisabled();
                        });
                    });
                    it('Кнопка "Получить SMS" стала доступной.', function() {
                        tester.button('Получить SMS').expectToBeEnabled();
                        tester.input.withPlaceholder('Код').expectToBeDisabled();
                        tester.button('Подтвердить').expectToBeDisabled();
                    });
                });
                it('Ввожу городской номер телефона. Отображено сообщение об ошибке.', function() {
                    tester.input.first.fill('4951234567');
                    tester.requestAnswers().send();

                    tester.input.first.
                        expectTooltipWithText('Должен быть введен номер мобильного телефона').
                        toBeShownOnMouseOver();

                    tester.requestAnswers().send();
                    tester.button('Получить SMS').expectToBeDisabled();
                });
                it(
                    'Ввожу номер телефона, который был указан в разделе "Правила обработки вызовов". Отображено ' +
                    'сообщение об ошибке.',
                function() {
                    tester.input.first.fill('9161234567');
                    tester.requestAnswers().send();

                    tester.input.first.
                        expectTooltipWithText('Нельзя добавить номер из «Правила обработки вызовов»').
                        toBeShownOnMouseOver();

                    tester.requestAnswers().send();
                    tester.button('Получить SMS').expectToBeDisabled();
                });
                it('Нажимаю на кнопку "Скопировать". Номер скопирован.', function() {
                    tester.button('Скопировать').click();
                    copiedTexts.last().expectToEqual('+79162739283');
                });
                it('Спиннер скрыт. Отображен номер отдела продаж.', function() {
                    tester.spinner.expectToBeHidden();

                    tester.settingsStep('Тестовый звонок').expectTextContentToHaveSubstring(
                        'Или сделайте тестовый звонок в наш отдел продаж ' +
                        '+7 (916) 273-92-83'
                    );
                });
            });
            describe('Ранее номер уже был введен.', function() {
                beforeEach(function() {
                    easyStartRequest = easyStartRequest.numberSpecified();
                });

                describe('Ранее код уже был отправлен.', function() {
                    beforeEach(function() {
                        easyStartRequest = easyStartRequest.codeFieldAvailable();
                    });

                    describe('Ранне код уже был введен.', function() {
                        beforeEach(function() {
                            easyStartRequest = easyStartRequest.smsCodeSpecified();
                        });

                        describe('Ранее код уже был верифицирован. Форма заполнена корректно.', function() {
                            beforeEach(function() {
                                easyStartRequest.verified().receiveResponse();

                                wait();
                                tester.requestAnswers().send();
                            });

                            it('Нажимаю на кнпоку "Изменить". Форма возвращена к исходному состоянию.', function() {
                                tester.button('Изменить').click();

                                wait();
                                tester.requestAnswers().send();

                                tester.input.first.expectToHaveValue('+7 (___) ___-__-__');
                                tester.button('Получить SMS').expectToBeDisabled();
                                tester.input.withPlaceholder('Код').expectToBeDisabled();
                                tester.button('Подтвердить').expectToBeDisabled();
                            });
                            it('Форма заполнена корректно.', function() {
                                tester.input.first.expectToBeDisabled();
                                tester.button('Получить SMS').expectToBeHiddenOrNotExist();
                                tester.input.withPlaceholder('Код').expectToBeHiddenOrNotExist();
                                tester.button('Подтвердить').expectToBeHiddenOrNotExist();

                                tester.numberIsConfirmedText.expectToBeVisible();
                            });
                        });
                        it('Форма заполнена корректно.', function() {
                            easyStartRequest.receiveResponse();

                            wait();
                            tester.requestAnswers().send();

                            tester.input.first.expectToBeEnabled();
                            tester.input.withPlaceholder('Код').expectToHaveValue('2840');
                            tester.button('Подтвердить').expectToBeEnabled();

                            tester.numberIsConfirmedText.expectToBeHiddenOrNotExist();
                        });
                    });
                    it('Форма заполнена корректно.', function() {
                        easyStartRequest.receiveResponse();

                        wait();
                        tester.requestAnswers().send();

                        tester.input.withPlaceholder('Код').expectToBeEnabled();
                        tester.button('Подтвердить').expectToBeDisabled();
                    });
                });
                it('Форма заполнена корректно.', function() {
                    easyStartRequest.receiveResponse();

                    wait();
                    tester.requestAnswers().send();
                    
                    tester.input.first.expectToHaveValue('+7 (916) 285-91-34');
                    tester.button('Получить SMS').expectToBeEnabled();
                    tester.input.withPlaceholder('Код').expectToBeDisabled();
                    tester.button('Подтвердить').expectToBeDisabled();
                });
            });
            it('Открыта вкладка "Тестовый исходящий". Спиннер видим.', function() {
                tester.spinner.expectToBeVisible();

                tester.input.first.expectToHaveValue('+7 (___) ___-__-__');
                tester.button('Получить SMS').expectToBeDisabled();
                tester.input.withPlaceholder('Код').expectToBeDisabled();
                tester.button('Подтвердить').expectToBeDisabled();

                tester.orderTestCallButton.expectToBeHidden();
            });
        });
        describe('Нажимаю на кнопку "Заказать тестовый звонок". Отправлен запрос тестового звонка.', function() {
            beforeEach(function() {
                tester.orderTestCallButton.click();
                tester.requestTestCall().send();
            });

            describe(
                'Прошло некоторое время. Отправлен запрос состояния заказа тестового звонка. В соответствии с ' +
                'ответом сервера тестовый звонок еще не завершен.',
            function() {
                beforeEach(function() {
                    wait();
                    tester.requestCallState().send();
                    tester.requestAnswers().send();
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

                    it(
                        'Нажимаю на кнопку заказа тестового звонка. Прошло некоторое время. Отправлен запрос ' +
                        'состояния заказа тестового звонка. В соответствии с ответом сервера тестовый звонок ' +
                        'завершен успешно. Сообщение об ошибке не отображается.',
                    function() {
                        tester.orderTestCallButton.click();
                        tester.requestTestCall().send();

                        wait();
                        tester.requestCallState().setProcessed().send();
                        tester.requestAnswers().send();

                        tester.errorMessage('Произошла ошибка').expectToBeHiddenOrNotExist();
                    });
                    it('Отображено сообщение об ошибке. Кнопка заказа тестового звонка доступна.', function() {
                        tester.errorMessage('Произошла ошибка').expectToBeVisible();
                        tester.orderTestCallButton.expectNotToBeMasked();
                    });
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

                    it('Повторное нажатие на кнопку заказа тестового звонка приводит к отправке запроса.', function() {
                        tester.orderTestCallButton.click();
                        tester.requestTestCall().send();
                    });
                    it('Кнопка заказа тестового звонка доступна. Сообщение об ошибке не отображено.', function() {
                        tester.orderTestCallButton.expectNotToBeMasked();
                        tester.errorMessage('Произошла ошибка').expectToBeHiddenOrNotExist();
                    });
                });
                it('Повторное нажатие на кнопку заказа тестового звонка не приводит к отправке запроса.', function() {
                    tester.orderTestCallButton.click();
                });
                it('Кнопка заказа тестового звонка заблокирована.', function() {
                    tester.orderTestCallButton.expectToBeMasked();
                });
            });
            it('Кнопка заказа тестового звонка заблокирована.', function() {
                tester.orderTestCallButton.expectToBeMasked();
            });
        });
        it('Отображен телефон.', function() {
            tester.settingsStep('Тестовый звонок').expectTextContentToHaveSubstring('Позвоните на +7 (903) 123-45-67');
        });
    });
    describe(
        'Открываю страницу легкого входа amoCRM. Нажимаю на кнопку "Тестировать бесплатно". Нажимаю на кнпоку ' +
        '"Продолжить". В соответствии с данными, полученными от сервера ранее были выбраны три сотрудника. Отмечаю ' +
        'других трех сотрудников. Нажимаю на кнопку "Продолжить". В соответствии с данными, полученными от сервера ' +
        'ранее был выбран тип переадресации "Одновременно всем", все выбранные сотрудники принимают звонки на ' +
        'мобильный телефон и ни у одного из них не номер не был подтвержден. Нажимаю на кнопку "По очереди". Ввожу ' +
        'номер телефона сотрудника. Нажимаю на кнопку "Получить SMS". Прошло 34 секунды. Ввожу код подтверждения. ' +
        'Нажимаю на кнопку "Подтвердить". В соответствии с данными, полученными от сервера код подтверждения был ' +
        'корректным. Ввожу значение в поле "Время дозвона". Нажимаю на кнопку "Продолжить". Нажимаю на кнопку ' +
        '"Продолжить".',
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
            postMessagesTester.expectMessageToBeSent('UISamoCRMWidgetRequestSettings');
        });

        describe('Нажимаю на кнопку "Стать клиентом".', function() {
            beforeEach(function() {
                tester.requestAnswers().addFirstUser().send();
                wait();
                tester.requestAnswers().addFirstUser().addSecondUser().send();

                tester.settingsStep('Тестовый звонок').applyButton().click();
                wait();
                tester.requestAnswers().addFirstUser().addSecondUser().send();
            });

            describe('Заполняю форму заказа обратного звонка.', function() {
                beforeEach(function() {
                    tester.floatingForm.textfield().withFieldLabel('Номер телефона *').input('4951234567');
                    tester.requestAnswers().addFirstUser().addSecondUser().send();

                    tester.floatingForm.textfield().withFieldLabel('День *').fill(tester.nextDay('d.m.Y'));
                    tester.requestAnswers().addFirstUser().addSecondUser().send();

                    tester.floatingForm.textfield().withFieldLabel('С *').fill('13:54');
                    tester.requestAnswers().addFirstUser().addSecondUser().send();

                    tester.floatingForm.textfield().withFieldLabel('До *').fill('20:05');
                    tester.requestAnswers().addFirstUser().addSecondUser().send();
                    wait();
                    tester.requestAnswers().addFirstUser().addSecondUser().send();
                });

                describe(
                    'Нажимаю на кнопку "Заказать обратный звонок". Отправлена заявка на обратный звонок.',
                function() {
                    beforeEach(function() {
                        tester.orderCallbackButton.click();

                        wait();
                        tester.requestAnswers().addFirstUser().addSecondUser().send();

                        tester.supportRequestSender.respondSuccessfully();
                        wait();
                        tester.requestAnswers().addFirstUser().addSecondUser().send();

                        tester.supportRequestSender.expectRequestParamsToContain({
                            email: 'chigrakov@example.com',
                            message: 'Заявка со страницы amoCRM Легкий вход. Номер телефона пользоватeля ' +
                                '+74951234567. Удобное время для звонка - ' + tester.nextDay('Y-m-d') + ' с 13:54 до ' +
                                '20:05',
                            name: 'Марк Чиграков Брониславович',
                            phone: '74951234567'
                        });
                    });

                    it(
                        'Нажимаю на кнопку "Закрыть". Нажимаю на кнопку "Стать клентом". Изменяю значение в форме ' +
                        'заказа обратного звонка. Нажимаю на кнопку "Заказать обратный звонок". В окне с заголовком ' +
                        '"Спасибо" отображено выбранное время и день.',
                    function() {
                        tester.closeWindowButton.click();

                        tester.settingsStep('Тестовый звонок').applyButton().click();
                        wait();
                        tester.requestAnswers().addFirstUser().addSecondUser().send();

                        tester.floatingForm.textfield().withFieldLabel('День *').fill(tester.dayAfterTomorrow('d.m.Y'));
                        tester.requestAnswers().addFirstUser().addSecondUser().send();

                        tester.floatingForm.textfield().withFieldLabel('С *').fill('13:55');
                        tester.requestAnswers().addFirstUser().addSecondUser().send();

                        tester.floatingForm.textfield().withFieldLabel('До *').fill('20:15');
                        tester.requestAnswers().addFirstUser().addSecondUser().send();

                        tester.orderCallbackButton.click();
                        wait();
                        tester.requestAnswers().addFirstUser().addSecondUser().send();

                        tester.supportRequestSender.respondSuccessfully();
                        wait();
                        tester.requestAnswers().addFirstUser().addSecondUser().send();

                        tester.floatingComponent.expectTextContentToHaveSubstring(tester.dayAfterTomorrow('d.m.Y') +
                            ' с 13:55 по 20:15 по МСК');
                    });
                    it('В окне с заголовком "Спасибо" отображено выбранное время и день.', function() {
                        tester.floatingComponent.expectTextContentToHaveSubstring(tester.nextDay('d.m.Y') +
                            ' с 13:54 по 20:05 по МСК');
                    });
                });
                it(
                    'Нажимаю на кнопку "Заказать обратный звонок". В соответствии с данными, полученными от сервера ' +
                    'попытка заказа обратного звонка была безуспешной. Отображено сообщение об ошбибке.',
                function() {
                    tester.orderCallbackButton.click();
                    wait();
                    tester.requestAnswers().addFirstUser().addSecondUser().send();

                    tester.supportRequestSender.respondUnsuccessfully();
                    wait();
                    tester.requestAnswers().addFirstUser().addSecondUser().send();

                    tester.errorMessage('Invalid type for field "phone"').expectToBeVisible();
                    tester.floatingComponent.expectNotToBeMasked();
                });
                it(
                    'Сайтфон не подключен. Нажимаю на кнопку "Заказать обратный звонок". Отображено сообщение об ' +
                    'ошбибке.',
                function() {
                    tester.supportRequestSender.setNoSitePhone();
                    tester.orderCallbackButton.click();

                    wait();
                    tester.requestAnswers().addFirstUser().addSecondUser().send();

                    tester.errorMessage('Произошла ошибка').expectToBeVisible();
                    tester.floatingComponent.expectNotToBeMasked();
                });
                it('Нажимаю на кнопку "Заказать обратный звонок". Окно заблокировано.', function() {
                    tester.orderCallbackButton.click();
                    wait();
                    tester.requestAnswers().addFirstUser().addSecondUser().send();

                    tester.floatingComponent.expectToBeMasked();
                });
            });
            it(
                'Ввожу в поле "День" значение, меньшее текущего времени. При наведении курсора мыши на поле ' +
                'отображается сообщение о некорректности значения.',
            function() {
                tester.floatingForm.textfield().withFieldLabel('День *').fill(tester.previousDay('d.m.Y'));
                tester.requestAnswers().addFirstUser().addSecondUser().send();

                tester.floatingForm.textfield().withFieldLabel('День *').
                    expectTooltipContainingText('Дата в этом поле должна быть позже').toBeShownOnMouseOver();
                tester.requestAnswers().addFirstUser().addSecondUser().send();
            });
            it('Поля формы заказа обратного звонка заполнены значениями по умолчанию.', function() {
                tester.floatingForm.textfield().withFieldLabel('День *').expectValueToMatch(/^\d{2}\.\d{2}\.\d{4}$/);
                tester.floatingForm.textfield().withFieldLabel('С *').expectToHaveValue('11:00');
                tester.floatingForm.textfield().withFieldLabel('До *').expectToHaveValue('19:00');
            });
        });
        describe('Отправлен запрос звонков.', function() {
            beforeEach(function() {
                tester.requestAnswers().send();
            });

            it(
                'Прошло некоторое время. Отправлен еще один запрос звонков. В соответствии с ответом сервера звонок ' +
                'был пропущенным. Колонка "Ответил" пуста. Колонка "Статус звонка" имеет содержимое "Пропущенный".',
            function() {
                wait();

                tester.requestAnswers().addFirstUnsuccessfulCall().send();

                tester.callsHistoryGrid.row().first().column().withHeader('Ответил').expectToHaveTextContent('');
                tester.callsHistoryGrid.row().first().column().withHeader('Статус звонка').
                    expectToHaveTextContent('Пропущенный');
            });
            it(
                'Прошло некоторое время. Отправлен еще один запрос звонков. В соответствии с ответом сервера звонок ' +
                'был успешным.',
            function() {
                wait();
                tester.requestAnswers().addFirstUser().send();

                tester.callsHistoryGrid.row().first().column().withHeader('Ответил').
                    expectToHaveTextContent('Доминика Языкина');

                tester.callsHistoryGrid.row().first().column().withHeader('Статус звонка').
                    expectToHaveTextContent('Успешный');
            });
            it('Таблица скрыта.', function() {
                tester.callsHistoryGrid.expectToBeHidden();
            });
        });
        it(
            'Ответ сервера на запрос звонков содержит сообщение об ошибке. Отображено сообщние об ошибке. Повторный ' +
            'запрос звонков не был отправлен.',
        function() {
            tester.requestAnswers().setError().send();
            wait();

            tester.errorMessage('Что-то пошло не так').expectToBeVisible();
        });
        it('Не удалось разобрать ответ сервера. Отображено сообщение об ошибке.', function() {
            tester.requestAnswers().setFatalError().send();
            wait();

            tester.errorMessage('Произошла ошибка').expectToBeVisible();
        });
    });
});
