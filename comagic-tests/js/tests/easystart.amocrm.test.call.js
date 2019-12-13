tests.addTest(function(requestsManager, testersFactory, wait, utils) {
    var tester;
    
    beforeEach(function() {
        tester = new EasystartAmocrm(requestsManager, testersFactory, utils);
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
        'Открываю страницу легкого входа amoCRM. Нажимаю на кнопку "Тестировать бесплатно". Нажимаю на кнпоку ' +
        '"Продолжить". В соответствии с данными, полученными от сервера ранее были выбраны три сотрудника. Отмечаю ' +
        'других трех сотрудников. Нажимаю на кнопку "Продолжить". В соответствии с данными, полученными от сервера ' +
        'ранее был выбран тип переадресации "Одновременно всем", все выбранные сотрудники принимают звонки на ' +
        'мобильный телефон и ни у одного из них не номер не был подтвержден. Нажимаю на кнопку "По очереди". Ввожу ' +
        'номер телефона сотрудника. Нажимаю на кнопку "Получить SMS". Прошло 34 секунды.',
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
        });

        describe('', function() {
            describe('', function() {
                describe('', function() {
                    describe('', function() {
                        describe('Ввожу код подтверждения.', function() {
                            beforeEach(function() {
                                tester.smsCodeField().input('1234');
                                wait();
                            });

                            describe('Нажимаю на кнопку "Подтвердить".', function() {
                                beforeEach(function() {
                                    tester.confirmNumberButton.click();
                                    wait();
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

                                    describe('Ввожу значение в поле "Время дозвона".', function() {
                                        beforeEach(function() {
                                            tester.dialTimeField().fill('15');
                                            wait();
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
