tests.addTest(function({requestsManager, testersFactory, wait, utils}) {
    var tester;
    
    beforeEach(function() {
        tester = new EasystartBitrix({requestsManager, testersFactory, utils});
    });

    describe(
        'Открываю страницу легкого входа amoCRM. Нажимаю на кнопку "Тестировать бесплатно". Нажимаю на кнпоку ' +
        '"Продолжить". В соответствии с данными, полученными от сервера ранее были выбраны три сотрудника. Отмечаю ' +
        'других трех сотрудников. Нажимаю на кнопку "Продолжить". В соответствии с данными, полученными от сервера ' +
        'ранее был выбран тип переадресации "Одновременно всем" и ни у одного из них не номер не был подтвержден. ' +
        'Синхронизация сотрудников завершена. Нажимаю на кнопку "По очереди". Ввожу номер телефона сотрудника. ' +
        'Нажимаю на кнопку "Получить SMS". Прошло 34 секунды. Ввожу код подтверждения. Нажимаю на кнопку ' +
        '"Подтвердить". В соответствии с данными, полученными от сервера код подтверждения был корректным. Ввожу ' +
        'значение в поле "Время дозвона". Нажимаю на кнопку "Продолжить". Нажимаю на кнопку "Продолжить".',
    function() {
        beforeEach(function() {
            EasyStart.getApplication().checkIfPartnerReady();
            tester.tryForFreeButton.click();
            tester.requestCreateAccount().send();
            tester.supportRequestSender.respondSuccessfully();
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
            wait(100);

            tester.requestSyncEmployees().setDone().send();
            wait(100);

            tester.sequentialForwardingTypeButton().click();
            wait(100);

            tester.employeePhoneField().input('9161234567');
            wait();

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

            tester.settingsStep('Правила обработки вызовов').nextButton().click();
            wait(10);
            tester.requestCallProcessingConfig().send();
            wait(10);

            tester.settingsStep('Настройка интеграции').nextButton().click();
            wait();
            tester.requestIntegrationConfig().send();
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

                    wait();
                    tester.requestAnswers().addFirstUser().addSecondUser().send();

                    tester.floatingForm.textfield().withFieldLabel('День *').fill(tester.nextDay('d.m.Y'));
                    tester.requestAnswers().addFirstUser().addSecondUser().send();

                    wait();
                    tester.requestAnswers().addFirstUser().addSecondUser().send();

                    tester.floatingForm.textfield().withFieldLabel('С *').fill('13:54');
                    tester.requestAnswers().addFirstUser().addSecondUser().send();

                    wait();
                    tester.requestAnswers().addFirstUser().addSecondUser().send();

                    tester.floatingForm.textfield().withFieldLabel('До *').fill('20:05');
                    tester.requestAnswers().addFirstUser().addSecondUser().send();

                    wait();
                    tester.requestAnswers().addFirstUser().addSecondUser().send();
                });

                describe('Нажимаю на кнопку "Заказать обратный звонок".', function() {
                    beforeEach(function() {
                        tester.orderCallbackButton.click();

                        wait();
                        tester.requestAnswers().addFirstUser().addSecondUser().send();

                        tester.supportRequestSender.respondSuccessfully();
                        wait();
                        tester.requestAnswers().addFirstUser().addSecondUser().send();
                    });

                    xit(
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
                    it(
                        'Отправлена заявка на обратный звонок. В окне с заголовком "Спасибо" отображено выбранное ' +
                        'время и день.',
                    function() {
                        tester.supportRequestSender.expectRequestParamsToContain({
                            email: 'chigrakov@example.com',
                            message:
                                'Заявка со страницы Битрикс24 Легкий вход. ' +
                                'Номер телефона пользоватeля - +74951234567. ' +
                                'Домен - chigrakov.bitrix24.ru. ' +
                                'Удобное время для звонка - ' + tester.nextDay('Y-m-d') + ' с 13:54 до 20:05',
                            name: 'Марк Брониславович Чиграков',
                            phone: '74951234567'
                        });

                        tester.floatingComponent.expectTextContentToHaveSubstring(tester.nextDay('d.m.Y') +
                            ' с 13:54 по 20:05 по МСК');
                    });
                });
                return;
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
                    'ошибке.',
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
            return;
            it('Поля формы заказа обратного звонка заполнены значениями по умолчанию.', function() {
                tester.floatingForm.textfield().withFieldLabel('День *').expectValueToMatch(/^\d{2}\.\d{2}\.\d{4}$/);
                tester.floatingForm.textfield().withFieldLabel('С *').expectToHaveValue('11:00');
                tester.floatingForm.textfield().withFieldLabel('До *').expectToHaveValue('19:00');
            });
        });
        return;
        describe('Отправлен запрос звонков.', function() {
            beforeEach(function() {
                tester.requestAnswers().send();
            });

            it('Таблица скрыта.', function() {
                tester.callsHistoryGrid.expectToBeHidden();
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
        });
        it(
            'Нажимаю на кнопку "Заказать тестовый звонок". Отправлен запрос тестового звонка. Кнопка достунпа.',
        function() {
            tester.requestAnswers().send();
            tester.orderTestCallButton.click();
            tester.requestTestCall().send();

            wait();
            tester.requestCallState().setProcessed().send();
            tester.requestAnswers().send();
            tester.orderTestCallButton.expectNotToBeMasked();
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
