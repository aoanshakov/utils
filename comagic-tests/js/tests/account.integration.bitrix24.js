tests.addTest(function(args) {
    var requestsManager = args.requestsManager,
        testersFactory = args.testersFactory,
        wait = args.wait,
        utils = args.utils,
        windowOpener = args.windowOpener;

    describe('Открываю раздел "Аккаунт/Интеграция/Bitrix 24".', function() {
        var helper;

        beforeEach(function() {
            if (helper) {
                helper.destroy();
            }
        });
        
        describe('Открыта вкладка "Доступ к данным".', function() {
            var bitrix24StatusRequest,
                bitrix24DataRequest;

            beforeEach(function() {
                helper = new AccountIntegrationBitrix24(args);

                Comagic.Directory.load();
                helper.batchReloadRequest().send();

                helper.actionIndex();
                helper.requestRegionsTreeDirectory().send();
                bitrix24DataRequest = helper.bitrix24DataRequest().expectToBeSent();
            });

            describe('Телефония включена.', function() {
                beforeEach(function() {
                    bitrix24DataRequest.isProcessCall();
                });

                describe('Открываю вкладку "Телефония".', function() {
                    beforeEach(function() {
                        bitrix24DataRequest.receiveResponse();
                        helper.requestSalesFunnelComponentAvailability().send();
                        helper.requestTariffs().send();
                        helper.bitrix24StatusRequest().receiveResponse();
                        wait(10);

                        helper.tabPanel.tab('Телефония').click();
                        wait(10);
                    });

                    describe('Нажимаю на чекбокс "Передавать записи разговора ".', function() {
                        beforeEach(function() {
                            helper.form.checkbox().withBoxLabel('Передавать записи разговора').click();
                            wait(10);
                        });

                        describe(
                            'Нажимаю на чекбокс "Передавать если настроен фильтр исключения по операции сценария".',
                        function() {
                            beforeEach(function() {
                                helper.form.checkbox().
                                    withBoxLabel('Передавать записи, если настроен фильтр по операции сценария').
                                    click();

                                wait(10);
                            });

                            it(
                                'Нажимаю на чекбокс "Передавать записи разговора". Чекбокс "Передавать если настроен ' +
                                'фильтр исключения по операции сценария" не отмечен.',
                            function() {
                                helper.form.checkbox().withBoxLabel('Передавать записи разговора').click();
                                wait(10);

                                helper.form.checkbox().
                                    withBoxLabel('Передавать записи, если настроен фильтр по операции сценария').
                                    expectNotToBeChecked();
                            });
                            it('Нажимаю на кнопку "Сохранить". Настройки сохраняются.', function() {
                                helper.saveButton.click();
                                wait(10);

                                helper.requestBitrix24DataSave().isTransferTalks().isAnywaySendTalkRecords().send();
                            });
                        });
                        it(
                            'Нажимаю на кнопку "Сохранить". Настройки сохраняются.',
                        function() {
                            helper.saveButton.click();
                            wait(10);

                            helper.requestBitrix24DataSave().isTransferTalks().isNotAnywaySendTalkRecords().send();
                        });
                        it(
                            'Чекбокс "Передавать если настроен фильтр исключения по операции сценария" доступен.',
                        function() {
                            helper.form.checkbox().
                                withBoxLabel('Передавать записи, если настроен фильтр по операции сценария').
                                expectToBeEnabled();
                        });
                    });
                    it(
                        'Чекбокс "Передавать если настроен фильтр исключения по операции сценария" заблокирован.',
                    function() {
                        helper.form.checkbox().withBoxLabel('Исходящий звонок по клику').expectToBeVisible();
                        helper.form.combobox().withFieldLabel('Номер для звонка по клику').expectToBeVisible();

                        helper.form.checkbox().
                            withBoxLabel('Передавать записи, если настроен фильтр по операции сценария').
                            expectToBeDisabled();
                    });
                });
                it(
                    'Записи разговора должны быть переданы, если настроен фильтр исключения по операции сценария. ' +
                    'Нажимаю на чекбокс "Передавать записи разговора". Нажимаю на кнпоку сохранения. Отправлен ' +
                    'запрос сохранения.',
                function() {
                    bitrix24DataRequest.isAnywaySendTalkRecords().isTransferTalks().receiveResponse();
                    helper.requestSalesFunnelComponentAvailability().send();
                    helper.requestTariffs().send();
                    helper.bitrix24StatusRequest().receiveResponse();
                    wait(10);

                    helper.tabPanel.tab('Телефония').click();
                    wait(10);

                    helper.form.checkbox().withBoxLabel('Передавать записи разговора').click();
                    wait(10);

                    helper.saveButton.click();
                    wait(10);

                    helper.requestBitrix24DataSave().isNotTransferTalks().isNotAnywaySendTalkRecords().send();
                });
            });
            describe('Импорт статусов выключен.', function() {
                beforeEach(function() {
                    bitrix24DataRequest.receiveResponse();
                    helper.requestSalesFunnelComponentAvailability().send();
                    helper.requestTariffs().send();
                    bitrix24StatusRequest = helper.bitrix24StatusRequest().expectToBeSent();
                });

                describe('Импорт статусов доступен.', function() {
                    beforeEach(function() {
                        bitrix24StatusRequest.receiveResponse();
                        wait(10);
                    });

                    it(
                        'Открываю вкладку "Сквозная аналитика". Изменяю значение полей. Нажимаю на кнопку ' +
                        '"Сохранить". Отправлен запрос сохранения.',
                    function() {
                        helper.tabPanel.tab('Сквозная аналитика').click();
                        wait(10);
                        helper.requestSalesFunnels().send();
                        helper.requestSelectMultiselectUserFields().send();

                        helper.form.combobox().withFieldLabel('Из какого поля передавать категорию продаж').
                            clickArrow().option('Второе поле для категорий и причин').click();
                        helper.form.combobox().withFieldLabel('Из какого поля передавать категорию продаж').
                            option('Четвертое поле для категорий и причин').click();
                        helper.form.combobox().withFieldLabel('Из какого поля передавать категорию продаж').
                            clickArrow();
                        wait(10);

                        helper.form.combobox().withFieldLabel('Из какого поля передавать причину отказа').clickArrow().
                            option('Первое поле для категорий и причин').click();
                        helper.form.combobox().withFieldLabel('Из какого поля передавать причину отказа').
                            option('Пятое поле для категорий и причин').click();
                        helper.form.combobox().withFieldLabel('Из какого поля передавать причину отказа').clickArrow();
                        wait(10);

                        helper.saveButton.click();
                        wait(10);

                        helper.requestBitrix24DataSave().setSaleCategoryUserFieldValueIds().
                            setLossReasonUserFieldValueId().send();
                        helper.requestTariffs().send();
                    });
                    it('Открываю вкладку "Чаты и заявки".', function() {
                        helper.tabPanel.tab('Чаты и заявки').click();
                        wait(10);
                    });
                    it('Открываю вкладку "Дополнительные поля".', function() {
                        helper.tabPanel.tab('Дополнительные поля').click();
                        wait(10);
                        helper.requestAdditionalFields().send();
                        wait(10);
                        helper.requestUserFieldDirectory().send();
                        wait(10);
                    });
                    it('Открываю вкладку "Воронки продаж".', function() {
                        helper.tabPanel.tab('Воронки продаж').click();
                        wait(10);
                        helper.requestSalesFunnels().send();
                        wait(10);
                    });
                    it(
                        'Открываю вкладку "Ответственные". Выбираю другого ответственного. Нажимаю на кнопку ' +
                        '"Сохранить".',
                    function() {
                        helper.tabPanel.tab('Ответственные').click();
                        helper.requestResponsibleUsers().send();
                        wait();

                        helper.form.combobox().withValue('Иванов Иван Иванович').clickArrow().
                            option('Андреев Андрей Андреевич').click();
                        wait(10);

                        helper.saveButton.click();
                        wait(10);
                        helper.requestResponsibleUsersSaving().send();
                        wait(10);
                        helper.requestResponsibleUsers().send();
                        wait(10);
                    });
                    it(
                        'Выключаю свичбокс "Импорт статуса рабочего дня". Нажимаю на кнопку "Сохранить". Настройки ' +
                        'сохранены.',
                    function() {
                        helper.switchButton('Импорт статуса рабочего дня').click();
                        wait(10);

                        helper.saveButton.click();
                        wait(10);
                        helper.requestBitrix24DataSave().setIsNeedUseRemoteUserStatuses().send();
                        helper.requestBitrix24Status().send();
                    });
                    it('Свитчбокс "Импорт статуса рабочего дня" доступен.', function() {
                        helper.fieldLabel('Импорт статуса рабочего дня').
                            createTester().
                            forDescendant('.x-form-error-msg').
                            expectToBeHidden();
                    });
                });
                it('Импорт статусов недоступен. Свитчбокс "Импорт статуса рабочего дня" заблокирован.', function() {
                    bitrix24StatusRequest.userStatusSyncUnavailable().receiveResponse();
                    wait(10);

                    helper.fieldLabel('Импорт статуса рабочего дня').
                        createTester().
                        forDescendant('.x-form-error-msg').
                        expectTooltipWithText('На вашем тарифе Битрикс24 недоступен учет рабочего времени').
                        toBeShownOnMouseOver();
                });
            });
            describe('Импорт статусов включен.', function() {
                beforeEach(function() {
                    bitrix24DataRequest.isNeedUseRemoteUserStatuses().receiveResponse();
                    helper.requestSalesFunnelComponentAvailability().send();
                    helper.requestTariffs().send();
                    bitrix24StatusRequest = helper.bitrix24StatusRequest().expectToBeSent();
                });

                it('Импорт статусов недоступен. Свитчбокс "Импорт статуса рабочего дня" выключен.', function() {
                    bitrix24StatusRequest.userStatusSyncUnavailable().receiveResponse();
                    wait(10);

                    helper.requestBitrix24DataSave().setIsNotNeedUseRemoteUserStatuses().send();
                    helper.bitrix24StatusRequest().userStatusSyncUnavailable().receiveResponse();
                    wait(10);

                    helper.switchButton('Импорт статуса рабочего дня').
                        createTesterForAscendant('.x-field').
                        expectNotToHaveClass('x-form-cb-checked');
                });
                it('Импорт статусов доступен. Свитчбокс "Импорт статуса рабочего дня" включен.', function() {
                    bitrix24StatusRequest.receiveResponse();
                    wait(10);

                    helper.switchButton('Импорт статуса рабочего дня').
                        createTesterForAscendant('.x-field').
                        expectToHaveClass('x-form-cb-checked');
                });
            });
        });
        it('Включен новый виджет Битрикс24.', function() {
            helper = new AccountIntegrationBitrix24({
                ...args,
                features: ['bitrix_webrtc']
            });

            Comagic.Directory.load();
            helper.batchReloadRequest().send();

            helper.actionIndex();
            helper.requestRegionsTreeDirectory().send();
            helper.bitrix24DataRequest().expectToBeSent().isProcessCall().receiveResponse();
            helper.requestSalesFunnelComponentAvailability().send();
            helper.requestTariffs().send();
            helper.bitrix24StatusRequest().receiveResponse();
            wait(10);

            helper.tabPanel.tab('Телефония').click();
            wait(10);
            helper.form.checkbox().withBoxLabel('Обработка звонков в Б24').expectToBeVisible();
            helper.form.combobox().withFieldLabel('Номер для исходящего звонка по клику').expectToBeVisible();
        });
        it(
            'В аккаунте Битрикс24 мало сотрудников. Открываю вкладку "Ответственные". Нажимаю на кнопку "Добавить ' +
            'сотрудника". В выпадающем списке сотрудников нет скроллера.',
        function() {
            helper = new AccountIntegrationBitrix24(args);

            Comagic.Directory.load();
            helper.batchReloadRequest().addManyUsers().send();
            
            helper.actionIndex();
            helper.requestRegionsTreeDirectory().send();
            helper.requestBitrix24Data().send();
            helper.requestSalesFunnelComponentAvailability().send();
            helper.requestSalesFunnelComponentTariffInfo().send();
            helper.requestBitrix24Status().send();

            helper.tabPanel.tab('Ответственные').click();
            helper.requestResponsibleUsers().send();
            wait();

            helper.addEmployeeButton.click();
        });
        it('В аккаунте Битрикс24 много сотрудников. В выпадающем списке сотрудников есть скроллер.', function() {
            helper = new AccountIntegrationBitrix24(args);

            Comagic.Directory.load();
            helper.batchReloadRequest().addManyUsers().send();
            
            helper.actionIndex();
            helper.requestRegionsTreeDirectory().send();
            helper.requestBitrix24Data().send();
            helper.requestSalesFunnelComponentAvailability().send();
            helper.requestSalesFunnelComponentTariffInfo().send();
            helper.requestBitrix24Status().send();

            helper.tabPanel.tab('Ответственные').click();
            helper.requestResponsibleUsers().send();
            wait();

            helper.addEmployeeButton.click();
        });
    });
});
