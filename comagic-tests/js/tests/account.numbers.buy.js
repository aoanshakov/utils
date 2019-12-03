tests.addTest(function(requestsManager, testersFactory, wait, utils) {
    describe((
        'Пользователь не обладает компонентом клиентских номеров. Открываю раздел "Аккаунт/Управление номерами". ' +
        'Нажимаю на кнопку "Подключить номер".'
    ), function() {
        var helper;

        beforeEach(function() {
            Comagic.getApplication().setHasNotComponent('private_number');
            
            helper = new AccountNumbers(requestsManager, testersFactory, utils);

            helper.accountNumbersRequest().send();
            helper.batchReloadRequest().send();

            helper.buyNumberButton.click();
            helper.freeNumbersRequest().send();
            helper.numberLimitValuesRequest().send();

            helper.discoverNumberBuyingWindow();

        });
        afterEach(function() {
            helper.destroy();
        });

        it('Вкладка "Добавить номер стороннего провайдера" скрыта.', function() {
            helper.numberBuyingTabPanel.tab('Добавить номер стороннего провайдера').expectToBeHidden();
        });
    });
    describe((
        'Пользватель не обладает компонентом виртуальной АТС. Открываю раздел "Аккаунт/Управление номерами". Нажимаю ' +
        'на кнопку "Подключить номер".'
    ), function() {
        var helper;

        beforeEach(function() {
            Comagic.getApplication().setHasNoVaComponent();
            
            helper = new AccountNumbers(requestsManager, testersFactory, utils);

            helper.accountNumbersRequest().send();
            helper.batchReloadRequest().send();

            helper.buyNumberButton.click();
            helper.freeNumbersRequest().send();
            helper.numberLimitValuesRequest().send();
            wait();

            helper.discoverNumberBuyingWindow();
        });
        afterEach(function() {
            helper.destroy();
        });

        it('Чекбокс "Использовать в виртуальной АТС" скрыт.', function() {
            helper.numberBuyingForm.checkbox().withBoxLabel('Использовать в виртуальной АТС').expectToBeHidden();
        });
        describe('Открываю вкладку "Добавить номер стороннего провайдера". Ввожу значение в поле "Номер".', function() {
            beforeEach(function() {
                helper.numberBuyingTabPanel.tab('Добавить номер стороннего провайдера').click();
                helper.getPrivateNumberCostRequest().send();
                wait();

                helper.basicSettingsForm.textfield().withFieldLabel('Номер *').fill('4951234567');
            });

            it('Чекбокс "Использовать в виртуальной АТС" скрыт.', function() {
                helper.basicSettingsForm.checkbox().withBoxLabel('Использовать в виртуальной АТС').expectToBeHidden();
            });
            it((
                'Нажимаю на кнопку "Далее". Отправлен запрос первого шага добавления номера стороннего провайдера не ' +
                'для использования в виртуальной АТС. Отмечаю чекбокс "Я подтверждаю владение номером телефона, в ' +
                'соответствии с пользовательским соглашением". Нажимаю на кнопку "Получить код". Отправлен запрос ' +
                'кода подтверждения.'
            ), function() {
                helper.basicSettingsNextButton.click();
                helper.numberValidationRequest().setNotUsedForVa().send();
                wait();

                helper.numberVerificationForm.checkbox().withBoxLabel(
                    'Я подтверждаю владение номером телефона, в соответствии с пользовательским соглашением'
                ).click();
                wait();

                helper.numberVerificationForm.textfield().withFieldLabel('Доб. номер').fill('001');
                wait();

                helper.numberVerificationForm.combobox().withFieldLabel('Пауза, с').clickArrow().option('15').click();
                wait();

                helper.codeGettingButton.click();
                helper.verificationCodeRequest().send();
            });
        });
    });
    describe((
        'Пользователь не обладает компонентом коллтрекинга. Открываю раздел "Аккаунт/Управление номерами". Нажимаю ' +
        'на кнопку "Подключить номер".'
    ), function() {
        var helper;

        beforeEach(function() {
            Comagic.getApplication().setHasNotComponent('call_tracking');
            
            helper = new AccountNumbers(requestsManager, testersFactory, utils);

            helper.accountNumbersRequest().send();
            helper.batchReloadRequest().send();

            helper.buyNumberButton.click();
            helper.freeNumbersRequest().send();
            helper.numberLimitValuesRequest().send();

            helper.discoverNumberBuyingWindow();
        });
        afterEach(function() {
            helper.destroy();
        });

        it('Чекбокс "Использовать в виртуальной АТС" скрыт.', function() {
            helper.numberBuyingForm.checkbox().withBoxLabel('Использовать в виртуальной АТС').expectToBeHidden();
        });
        it(
            'Отмечаю чекбокс в строке таблицы номеров. Отправлен запрос cтоимости расширения лимита номеров.',
        function() {
            helper.numbersToBuyGrid.row().first().column().first().checkbox().click();
            helper.limitPriceRequest().send();
        });
        describe('Открываю вкладку "Добавить номер стороннего провайдера". Ввожу значение в поле "Номер".', function() {
            beforeEach(function() {
                helper.numberBuyingTabPanel.tab('Добавить номер стороннего провайдера').click();
                helper.getPrivateNumberCostRequest().send();
                wait();

                helper.basicSettingsForm.textfield().withFieldLabel('Номер *').fill('4951234567');
            });

            it('Чекбокс "Использовать в виртуальной АТС" скрыт.', function() {
                helper.basicSettingsForm.checkbox().withBoxLabel('Использовать в виртуальной АТС').expectToBeHidden();
            });
            it((
                'Нажимаю на кнопку "Далее". Отправлен запрос первого шага добавления номера стороннего провайдера ' +
                'для использования в виртуальной АТС.'
            ), function() {
                helper.basicSettingsNextButton.click();
                helper.numberValidationRequest().send();
            });
        });
    });
    describe('Открываю раздел "Аккаунт/Управление номерами". Нажимаю на кнопку "Подключить номер".', function() {
        var helper;

        beforeEach(function() {
            helper = new AccountNumbers(requestsManager, testersFactory, utils);

            helper.accountNumbersRequest().send();
            helper.batchReloadRequest().send();

            helper.buyNumberButton.click();
            helper.freeNumbersRequest().send();
        });
        afterEach(function() {
            helper.destroy();
        });

        describe((
            'Лимит номеров стороннего провайдера достигнут и не может быть расширен. Открываю вкладку "Добавить ' +
            'номер стороннего провайдера".'
        ), function() {
            beforeEach(function() {
                helper.numberLimitValuesRequest().setPrivateNumbersLimitAlmostExceeded().send();
                helper.discoverNumberBuyingWindow();

                helper.numberBuyingTabPanel.tab('Добавить номер стороннего провайдера').click();
            });

            it((
                'Ответ на запрос стоимости добавления номера стороннего провайдера является пустым. Абонентская ' +
                'плата не отображается.'
            ), function() {
                helper.getPrivateNumberCostRequest().setResponseEmpty().send();
                wait();

                helper.basicSettingsForm.expectToBeVisible();
                helper.privateNumberInformationContainer.expectToBeHidden();
            });
            describe((
                'Ответ на запрос стоимости добавления номера стороннего провайдера не является пустым. Ввожу ' +
                'значение в поле "Номер".'
            ), function() {
                beforeEach(function() {
                    helper.getPrivateNumberCostRequest().send();
                    helper.basicSettingsForm.textfield().withFieldLabel('Номер *').fill('4951234567');
                });

                it('Кнопка "Далее" заблокирована.', function() {
                    helper.basicSettingsNextButton.expectToBeDisabled();
                });
                it('Отмечаю чекбокс "Использовать в виртуальной АТС". Кнопка "Далее" заблокирована.', function() {
                    helper.basicSettingsForm.checkbox().withBoxLabel('Использовать в виртуальной АТС').click();
                    wait();

                    helper.basicSettingsNextButton.expectToBeDisabled();
                });
            });
        });
        it((
            'Количество номеров для использования в виртуальной АТС существенно ниже максимального значения. Отмечаю ' +
            'чекбокс "Использовать в виртуальной АТС". Отмечаю чекбокс в строке таблицы номеров, доступных для ' +
            'покупки. Отмечаю чекбокс "Согласен с условиями". Нажимаю на кнопку "Подключить". Отправлен запрос ' +
            'добавления номера.'
        ), function() {
            helper.numberLimitValuesRequest().setVaNumbersCountIsMuchBelowLimit().send();
            helper.discoverNumberBuyingWindow();

            helper.numberBuyingForm.checkbox().withBoxLabel('Использовать в виртуальной АТС').click();
            helper.numbersToBuyGrid.row().first().column().first().checkbox().click();
            helper.numberBuyingForm.checkbox().withBoxLabel('Согласен с условиями').click();

            helper.plugInButton.click();
            helper.buyNumberRequest().setVaNumbersCountIsMuchBelowLimit().send();
            helper.freeNumbersRequest().send();
        });
        it((
            'Ответ на запрос лимита номеров стороннего провайдера является пустым. Открываю вкладку "Добавить номер ' +
            'стороннего провайдера". Сообщение о превышении лимита не отображается.'
        ), function() {
            helper.numberLimitValuesRequest().setNoPrivateNumbersLimit().send();
            wait();
            helper.discoverNumberBuyingWindow();

            helper.numberBuyingTabPanel.tab('Добавить номер стороннего провайдера').click();
            helper.getPrivateNumberCostRequest().send();
            wait();

            helper.privateNumberInformationContainer.expectToHaveTextContent(
                'Ежемесячная плата за расширение лимита 255,00 руб/мес');
        });
        describe((
            'Лимиты номеров стороннего провайдера и номеров для использования в виртуальной АТС достигнуты, но могут ' +
            'быть увеличены на один номер. Количество номеров, которые не предназначены для использования в ' +
            'виртуальной АТС на два меньше лимита, при том, что лимит не может быть расширен.'
        ), function() {
            beforeEach(function() {
                helper.numberLimitValuesRequest().send();
                wait();

                helper.discoverNumberBuyingWindow();
            });

            describe('Открываю вкладку "Добавить номер стороннего провайдера".', function() {
                beforeEach(function() {
                    helper.numberBuyingTabPanel.tab('Добавить номер стороннего провайдера').click();
                    helper.getPrivateNumberCostRequest().send();
                    wait();
                });

                it('Отображено сообщение о стоимости расширения лимита.', function() {
                    helper.privateNumberInformationContainer.expectToHaveTextContent(
                        'Ежемесячная плата за расширение лимита 255,00 руб/мес ' +

                        'Вы использовали весь лимит "Клиентских номеров". При добавлении новых номеров сторонних ' +
                        'провайдеров, лимит будет расширен на необходимое количество автоматически.'
                    );
                });
                it((
                    'При наведении курсора на поле "Номер" не отображается сообщение об обязательности этого поля ' +
                    'для заполнения.'
                ), function() {
                    helper.basicSettingsForm.textfield().withFieldLabel('Номер *').expectToHaveNoError();
                });
                it((
                    'Фокусирую поле "Номер". Снимаю фокус с поля "Номер". При наведении курсора на поле "Номер" ' +
                    'отображается сообщение об обязательности этого поля для заполнения.'
                ), function() {
                    helper.basicSettingsForm.textfield().withFieldLabel('Номер *').focus();
                    helper.basicSettingsForm.textfield().withFieldLabel('Номер *').blur();

                    wait();

                    helper.basicSettingsForm.textfield().withFieldLabel('Номер *').expectToHaveError(
                        'Это поле обязательно для заполнения');
                });
                it('Кнопка "Далее" заблокирована.', function() {
                    helper.basicSettingsNextButton.expectToBeDisabled();
                });
                describe('Ввожу значение в поле "Номер".', function() {
                    beforeEach(function() {
                        helper.basicSettingsForm.textfield().withFieldLabel('Номер *').fill('4951234567');
                    });

                    describe((
                        'Отмечаю радиокнопку "Исходящие звонки по тарифам стороннего оператора". Нажимаю на кнопку ' +
                        '"Далее". Заполняю поля формы шага "Настрока подключения". Нажимаю на кнопку "Назад".'
                    ), function() {
                        beforeEach(function() {
                            helper.basicSettingsForm.radiofield().
                                withBoxLabel('Исходящие звонки по тарифам стороннего оператора').click();
                            wait();

                            helper.basicSettingsNextButton.click();
                            helper.numberValidationRequest().setPrivateTrunk().send();
                            wait();

                            helper.connectionSetttingsForm.textfield().withFieldLabel('Логин *').fill('somelogin');
                            helper.connectionSetttingsForm.textfield().withFieldLabel('Имя сервера *').
                                fill('111.111.111.111');

                            helper.connectionSetttingsForm.textfield().withFieldLabel('Порт *').fill('12345');
                            helper.connectionSetttingsForm.textfield().withFieldLabel('Пароль *').fill('somepass');

                            helper.connectionSettingsBackButton.click();
                            wait();
                        });

                        it((
                            'Ввожу другое значение в поле "Номер". Нажимаю на кнопку "Далее". Поле "Порт" имеет ' +
                            'значение "5060". Другие поля являются пустыми.'
                        ), function() {
                            helper.basicSettingsForm.textfield().withFieldLabel('Номер *').fill('4951234568');

                            helper.basicSettingsNextButton.click();
                            helper.numberValidationRequest().setAnotherNumber().setPrivateTrunk().send();
                            wait();

                            helper.connectionSetttingsForm.textfield().withFieldLabel('Логин *').expectToHaveValue('');
                            helper.connectionSetttingsForm.textfield().withFieldLabel('Порт *').
                                expectToHaveValue('5060');
                        });
                        it('Нажимаю на кнопку "Далее". Поля формы сохранили прежние значения.', function() {
                            helper.basicSettingsNextButton.click();
                            helper.numberValidationRequest().setPrivateTrunk().send();
                            wait();

                            helper.connectionSetttingsForm.textfield().withFieldLabel('Логин *').
                                expectToHaveValue('somelogin');
                            helper.connectionSetttingsForm.textfield().withFieldLabel('Порт *').
                                expectToHaveValue('12345');
                        });
                    });
                    it((
                        'Снимаю отметку с чекбокса "Использовать в виртуальной АТС". Нажимаю на кнопку "Далее". ' +
                        'Отправлен запрос первого шага добавления номера стороннего провайдера не использующегося в ' +
                        'виртульной АТС.'
                    ), function() {
                        helper.basicSettingsForm.checkbox().withBoxLabel('Использовать в виртуальной АТС').click();
                        wait();

                        helper.basicSettingsNextButton.click();
                        helper.numberValidationRequest().setNotUsedForVa().send();
                        wait();
                    });
                    describe('Нажимаю на кнопку "Далее".', function() {
                        beforeEach(function() {
                            helper.basicSettingsNextButton.click();
                        });

                        it((
                            'Отправлен запрос первого шага добавления номера стороннего провайдера. Нажимаю на ' +
                            'кнопку "Назад". Нажимаю на кнопку "Далее". Отправлен тот же самый запрос.'
                        ), function() {
                            helper.numberValidationRequest().send();
                            wait();

                            helper.numberVerificationBackButton.click();
                            wait();

                            helper.basicSettingsNextButton.click();
                            helper.numberValidationRequest().send();
                            wait();
                        });
                        it((
                            'Ответ на запрос первого шага добавления номера стороннего провайдера является пустым. ' +
                            'Переход на шаг "Проверка номера" не был совершен.'
                        ), function() {
                            helper.numberValidationRequest().setNoResponse().send();
                            wait();

                            helper.numberVerificationForm.expectToBeHidden();
                        });
                        it((
                            'Номер уже был проверен ранее. Активен шаг "Настройка подключения". Форма шага заполнена ' +
                            'данными, которые были введены ренее.'
                        ), function() {
                            helper.numberValidationRequest().setCodeAlreadyVerified().send();
                            wait();

                            helper.connectionSetttingsForm.textfield().withFieldLabel('Логин *').
                                expectToHaveValue('somelogin');
                        });
                        it('Номер уже используется. Переход на шаг "Проверка номера" не был совершен.', function() {
                            helper.numberValidationRequest().setNumberAlreadyExists().send();
                            wait();

                            helper.numberVerificationForm.expectToBeHidden();
                        });
                        describe((
                            'Отмечаю чекбокс "Я подтверждаю владение номером телефона, в соответствии с ' +
                            'пользовательским соглашением". Нажимаю на кнопку "Получить код". Ввожу значение в поле ' +
                            '"Код подтверждения". Нажимаю на кнопку "Далее". Ввожу значения в поля формы шага ' +
                            '"Настройка подключения". Нажимаю на кнопку "Подключить". Отправлен запрос завершения ' +
                            'добавления номера стороннего провайдера.'
                        ), function() {
                            beforeEach(function() {
                                helper.numberValidationRequest().send();

                                helper.numberVerificationForm.checkbox().withBoxLabel([
                                    'Я подтверждаю владение номером телефона, в соответствии с пользовательским ',
                                    'соглашением'
                                ].join('')).click();
                                wait();

                                helper.numberVerificationForm.textfield().withFieldLabel('Доб. номер').fill('001');
                                wait();

                                helper.numberVerificationForm.combobox().withFieldLabel('Пауза, с').clickArrow().
                                    option('15').click();
                                wait();

                                helper.codeGettingButton.click();
                                helper.verificationCodeRequest().send();
                                wait();

                                helper.numberVerificationForm.textfield().withFieldLabel('Код подтверждения *').
                                    fill('1234');
                                wait();

                                helper.numberVerificationNextButton.click();
                                helper.verificationCodeCheckRequest().send();
                                wait();

                                helper.connectionSetttingsForm.textfield().withFieldLabel('Логин *').fill('somelogin');

                                helper.connectionSetttingsForm.textfield().withFieldLabel('Имя сервера *').
                                    fill('111.111.111.111');

                                helper.connectionSetttingsForm.textfield().withFieldLabel('Порт *').fill('12345');

                                helper.connectionSetttingsForm.textfield().withFieldLabel('Пароль *').fill('somepass');

                                helper.applyButton.click();
                                helper.connectionConfigurationRequest().send();
                                helper.accountNumbersRequest().send();
                            });

                            it('Отображено сообщение о том, что номер был добавлен.', function() {
                                testersFactory.createDomElementTester(
                                    document.querySelector('.cm-notification-window')
                                ).expectToHaveTextContent('Номер добавлен Номер +7 (495) 123-45-67 успешно добавлен');
                            });
                            it('Жду некоторое время. Окно добавления номера и окно с сообщением закрыто.', function() {
                                wait();

                                testersFactory.createComponentTester(utils.getFloatingComponent()).
                                    expectToBeHiddenOrNotExist();
                            });
                            describe('Закрываю окно с сообщением о том, что номер был добавлен.', function() {
                                beforeEach(function() {
                                    testersFactory.createDomElementTester(
                                        document.querySelector('.cm-notification-window .x-tool-close')
                                    ).click();
                                });

                                it(
                                    'Жду некоторое время. Окно добавления номера и окно с сообщением закрыто.',
                                function() {
                                    wait();

                                    testersFactory.createComponentTester(utils.getFloatingComponent()).
                                        expectToBeHiddenOrNotExist();
                                });
                                it('Окно добавления номера и окно с сообщением закрыто.', function() {
                                    testersFactory.createComponentTester(utils.getFloatingComponent()).
                                        expectToBeHiddenOrNotExist();
                                });
                                it((
                                    'Нажимаю на кнопку "Подключить номер". Открываю вкладку "Добавить номер ' +
                                    'стороннего провайдера". Поле "Номер" не заполнено.'
                                ), function() {
                                    helper.buyNumberButton.click();
                                    helper.freeNumbersRequest().send();
                                    helper.numberLimitValuesRequest().send();
                                    wait();

                                    helper.discoverNumberBuyingWindow();

                                    helper.numberBuyingTabPanel.tab('Добавить номер стороннего провайдера').click();
                                    helper.getPrivateNumberCostRequest().send();
                                    wait();

                                    helper.basicSettingsForm.textfield().withFieldLabel('Номер *').
                                        expectToHaveValue('+7 (___) ___-__-__');
                                });
                            });
                        });
                    });
                });
            });
            it('Отображена нулевая абонентская плата и стоимость подключения.', function() {
                helper.buyingNumberInformationContainer.expectToHaveTextContent(
                    'Ежемесячная абонентская плата 0,00 руб/мес ' +
                    'Стоимость подключения 0,00 руб'
                );
            });
            describe((
                'Отмечаю чекбокс "Использовать в виртуальной АТС". Отмечаю чекбокс в строке таблицы номеров ' +
                'доступных для покупки. Отправлен запрос стоимости расширения лимита номеров, используемых в ' +
                'виртуальной АТС.'
            ), function() {
                beforeEach(function() {
                    helper.numberBuyingForm.checkbox().withBoxLabel('Использовать в виртуальной АТС').click();
                    helper.numbersToBuyGrid.row().first().column().first().checkbox().click();
                    helper.limitPriceRequest().send();
                });

                it((
                    'Отображена абонентская плата, стоимость подключения и информация об автоматическом расширении ' +
                    'лимита.'
                ), function() {
                    helper.buyingNumberInformationContainer.expectToHaveTextContent(
                        'Ежемесячная абонентская плата 1 номер = 250,00 руб/мес ' +

                        'Стоимость подключения 250,00 руб ' +

                        'Вы использовали весь лимит "Виртуальных номеров ВАТС". При добавлении новых виртуальных ' +
                        'номеров ВАТС, лимит будет расширен на необходимое количество автоматически. Текущее ' +
                        'значение: 5000 . Стоимость услуги 524,00 руб/мес .'
                    );
                });
                it(
                    'При наведении курсора мыши на кнопку "Подключить" не отображается сообщение об ошибке.',
                function() {
                    helper.plugInButton.expectNoTooltipToBeShownOnMouseOver();
                });
                it((
                    'Отмечаю чекбокс "Согласен с условиями". Нажимаю на кнопку "Подключить". Отправлен запрос ' +
                    'добавления номера и расширения лимита.'
                ), function() {
                    helper.numberBuyingForm.checkbox().withBoxLabel('Согласен с условиями').click();

                    helper.plugInButton.click();
                    helper.buyNumberRequest().setVaLimitExtending().send();
                    helper.freeNumbersRequest().send();
                });
            });
            describe((
                'Отмечаю чекбоксы в двух строках таблицы номеров, доступных для покупки. Отмечаю чекбокс "Согласен с ' +
                'условиями".'
            ), function() {
                beforeEach(function() {
                    helper.numbersToBuyGrid.row().first().column().first().checkbox().click();
                    helper.numbersToBuyGrid.row().atIndex(2).column().first().checkbox().click();

                    helper.numberBuyingForm.checkbox().withBoxLabel('Согласен с условиями').click();
                });

                describe('Отмечаю чекбокс в третьей строке таблицы номеров доступных для покупки.', function() {
                    beforeEach(function() {
                        helper.numbersToBuyGrid.row().atIndex(1).column().first().checkbox().click();
                    });

                    it('Чекбокс "Согласен с условиями" заблокирован.', function() {
                        helper.numberBuyingForm.checkbox().withBoxLabel('Согласен с условиями').expectToBeDisabled();
                    });
                    it('Отображено сообщение об исчерпании лимита.', function() {
                        helper.buyingNumberInformationContainer.expectToHaveTextContent(
                            'Ежемесячная абонентская плата 3 номера = 1 190,00 руб/мес ' +

                            'Стоимость подключения 910,00 руб ' +

                            'Минимальный счёт, в месяц 5,00 руб/мес ' +

                            'Вы использовали весь лимит "Виртуальных номеров", предусмотренный вашим Тарифном ' +
                            'планом. Расширение лимита невозможно. Обратитесь к менеджеру.'
                        );
                    });
                    it(
                        'При наведении курсора мыши на кнопку "Подключить" отображения сообщение об исчерпании лимита.',
                    function() {
                        helper.plugInButton.expectTooltipWithText(
                            'Внимание! Текущий тарифный план предполагает подключение не более 10000 номеров для ' +
                            'использования в ВАТС. Увеличение числа виртуальных номеров возможно после заключения ' +
                            'Договора на оказания услуг связи. За консультацией обратитесь, пожалуйста, к нашим ' +
                            'специалистам.'
                        ).toBeShownOnMouseOver();
                    });
                });
                it('Отображена абонентская плата и стоимость подключения двух номеров.', function() {
                    helper.buyingNumberInformationContainer.expectToHaveTextContent(
                        'Ежемесячная абонентская плата 2 номера = 760,00 руб/мес ' +
                        'Стоимость подключения 590,00 руб'
                    );
                });
                it(
                    'При наведении курсора мыши на кнопку "Подключить" не отображается сообщение об исчерпании лимита.',
                function() {
                    helper.plugInButton.expectNoTooltipToBeShownOnMouseOver();
                });
                describe('Отмечаю чекбокс "Использовать в виртуальной АТС".', function() {
                    beforeEach(function() {
                        helper.numberBuyingForm.checkbox().withBoxLabel('Использовать в виртуальной АТС').click();
                    });

                    it((
                        'Нажимаю на крестик справа от одного из отмеченных номеров. Отправлен запрос стоимости ' +
                        'расширения лимита. Чекбокс "Согласен с условиями" доступен.'
                    ), function() {
                        helper.choosenNumbersListItemWithText('+7 (495) 106-06-84').click();
                        helper.limitPriceRequest().send();

                        helper.numberBuyingForm.checkbox().withBoxLabel('Согласен с условиями').expectToBeEnabled();
                    });
                    it((
                        'Снимаю отметку с одного из номеров, отмеченных в таблицы номеров доступных для покупки. ' +
                        'Отправлен запрос стоимости расширения лимита. Чекбокс "Согласен с условиями" доступен.'
                    ), function() {
                        helper.numbersToBuyGrid.row().atIndex(2).column().first().checkbox().click();
                        helper.limitPriceRequest().send();

                        helper.numberBuyingForm.checkbox().withBoxLabel('Согласен с условиями').expectToBeEnabled();
                    });
                    it(
                        'Отображено сообщение об исчерпании лимита и о том, что лимит не может быть расширен.',
                    function() {
                        helper.buyingNumberInformationContainer.expectToHaveTextContent(
                            'Ежемесячная абонентская плата 2 номера = 760,00 руб/мес ' +

                            'Стоимость подключения 590,00 руб ' +

                            'Вы использовали весь лимит "Виртуальных номеров ВАТС", предусмотренный вашим Тарифном ' +
                            'планом. Расширение лимита невозможно. Обратитесь к менеджеру.'
                        );
                    });
                    it((
                        'При наведении курсора мыши на кнопку "Подключить" отображается сообщение об исчерпании ' +
                        'лимита и о том, что лимит не может быть расширен.'
                    ), function() {
                        helper.plugInButton.expectTooltipWithText(
                            'Внимание! Текущий тарифный план предполагает подключение не более 5000 номеров для ' +
                            'использования в ВАТС. Увеличение числа виртуальных номеров возможно после заключения ' +
                            'Договора на оказания услуг связи. За консультацией обратитесь, пожалуйста, к нашим ' +
                            'специалистам.'
                        ).toBeShownOnMouseOver();
                    });
                    it('Кнопка "Подключить" заблокирована.', function() {
                        helper.plugInButton.expectToBeDisabled();
                    });
                });
                describe('Нажимаю на кнопку "Подключить".', function() {
                    beforeEach(function() {
                        helper.plugInButton.click();
                        helper.buyNumberRequest().send();
                        helper.freeNumbersRequest().send();
                    });

                    it('Отображено сообщение о том, что были подключены два номера.', function() {
                        testersFactory.createAlertWindowTester().expectToHaveText('Номеров подключено: 2');
                    });
                    it((
                        'Нажимаю но кнопку "ОК" в окне с сообщением о том, что были подключены два номера. Отправлен ' +
                        'запрос данных для таблицы номеров.'
                    ), function() {
                        testersFactory.createAlertWindowTester().clickOk();

                        helper.batchReloadRequest().send();
                        helper.accountNumbersRequest().send();
                    });
                });
            });
        });
    });
});
