tests.addTest(function(requestsManager, testersFactory, wait, utils, windowOpener) {
    var helper;

    describe(
        'Расширенная интеграция доступна. Открываю раздел "Аккаунт/Интеграция/Настройка интеграции с amoCRM".',
    function() {
        beforeEach(function() {
            if (helper) {
                helper.destroy();
            }

            helper = new AccountIntegrationAmocrm(requestsManager, testersFactory, utils);

            Comagic.Directory.load();
            helper.batchReloadRequest().send();

            helper.actionIndex();
            helper.requestSalesFunnelComponentAvailability().send();
        });
        
        xdescribe('Открываю вкладку "Мультиворонки".', function() {
            beforeEach(function() {
                helper.requestAmocrmData().send();
                helper.requestTariffs().send();
                helper.requestAmocrmStatus().send();
                wait(10);

                helper.tabPanel.tab('Мультиворонки').click();
                wait(10);
                helper.requestSyncSalesFunnel().send();
            });

            describe(
                'При первичном обращении создается сделка. Для офлайн сообщений создаются сделки. Для чатов ' +
                'создаются сделки. При повторных обращениях создается сделка. Открыта вкладка "Входящие звонки".',
            function() {
                beforeEach(function() {
                    helper.requestMultiFunnels().send();
                    helper.requestSalesFunnel().send();
                    helper.requestSalesFunnelStatus().send();
                    wait(10);
                });

                it('Открываю вкладку "Исходящие звонки". Настройки доступны.', function() {
                    helper.innerTab('Исходящие звонки').mousedown();
                    wait(10);

                    helper.addFunnelButton.expectToBeEnabled();
                });
                it('Открываю вкладку "Офлайн Заявки". Настройки доступны.', function() {
                    helper.innerTab('Офлайн Заявки').mousedown();
                    wait(10);

                    helper.addFunnelButton.expectToBeEnabled();
                });
                it('Открываю вкладку "Чаты". Настройки доступны.', function() {
                    helper.innerTab('Чаты').mousedown();
                    wait(10);

                    helper.addFunnelButton.expectToBeEnabled();
                });
                it('Настройки доступны.', function() {
                    helper.addFunnelButton.expectToBeEnabled();
                });
            });
            describe(
                'Первичные обращения обрабатываются вручную. Повторные обращения не обрабатываются. Открыта вкладка ' +
                '"Входящие звонки".',
            function() {
                beforeEach(function() {
                    helper.requestMultiFunnels().setFirstActManual().setSecondaryActNoAction().send();
                    helper.requestSalesFunnel().send();
                    helper.requestSalesFunnelStatus().send();
                    wait(10);
                });

                it(
                    'Настройки заблокированы. Отображено сообщение об условиях при которых будут работать ' +
                    'мультиворонки. Сообщение о том, что мультиворонки недоступны для неразобранного не отображаются.',
                function() {
                    helper.addFunnelButton.expectToBeDisabled();
                });
                it(
                    'Открываю вкладку "Исходящие звонки". Настройки заблокированы. Отображено сообщение об условиях ' +
                    'при которых будут работать мультиворонки.',
                function() {
                    helper.innerTab('Исходящие звонки').mousedown();
                    wait(10);

                    helper.addFunnelButton.expectToBeDisabled();
                });
            });
            it(
                'Для чатов создаются сделки. Повторные обращения не обрабатываются. Открыта вкладка "Входящие ' +
                'звонки". Открываю вкладку "Чаты". Настройки заблокированы.',
            function() {
                helper.requestMultiFunnels().setChatActContact().send();
                helper.requestSalesFunnel().send();
                helper.requestSalesFunnelStatus().send();
                wait(10);

                helper.innerTab('Чаты').mousedown();
                wait(10);

                helper.addFunnelButton.expectToBeDisabled();
            });
            it(
                'Для офлайн заявок создаются сделки. Повторные обращения не обрабатываются. Открыта вкладка ' +
                '"Входящие звонки". Открываю вкладку "Офлайн Заявки". Настройки заблокированы.',
            function() {
                helper.requestMultiFunnels().setOfflineActContact().send();
                helper.requestSalesFunnel().send();
                helper.requestSalesFunnelStatus().send();
                wait(10);

                helper.innerTab('Офлайн Заявки').mousedown();
                wait(10);

                helper.addFunnelButton.expectToBeDisabled();
            });
            describe(
                'При первичном обращении создается сделка. Повторные обращения не обрабатываются. Открыта вкладка ' +
                '"Входящие звонки".',
            function() {
                beforeEach(function() {
                    helper.requestMultiFunnels().setSecondaryActNoAction().send();
                    helper.requestSalesFunnel().send();
                    helper.requestSalesFunnelStatus().send();
                    wait(10);
                });

                it('Настройки доступны.', function() {
                    helper.addFunnelButton.expectToBeEnabled();
                });
                it('Открываю вкладку "Исходящие звонки". Настройки доступны.', function() {
                    helper.innerTab('Исходящие звонки').mousedown();
                    wait(10);

                    helper.addFunnelButton.expectToBeEnabled();
                });
            });
            it(
                'Первичные обращения обрабатываются вручную. При повторных обращениях создается сделка. Настройки ' +
                'доступны. Кнопка "Подключить Мультиворонки" скрыта. Выпадащий список воронок видим.',
            function() {
                helper.requestMultiFunnels().setFirstActManual().send();
                helper.requestSalesFunnel().send();
                helper.requestSalesFunnelStatus().send();
                wait(10);

                helper.addFunnelButton.expectToBeEnabled();
                helper.activateMultifunnelsButton.expectToBeHiddenOrNotExist();
                helper.form.combobox().withValue('Некая воронка').expectToBeVisible();
            });
        });
        xdescribe(
            'Тип переадресации на ответственного сотрудника не определен. Открываю вкладку "Телефония".',
        function() {
            beforeEach(function() {
                helper.requestAmocrmData().send();
                helper.requestTariffs().send();
                helper.requestAmocrmStatus().send();
                wait(10);

                helper.tabPanel.tab('Телефония').click();
                wait(10);
            });

            describe('Отмечаю радиокнопку "Из сделки".', function() {
                beforeEach(function() {
                    helper.form.radiofield().withBoxLabel('Из сделки').click();
                    wait(10);
                });

                it('Радиокнопка "Из контакта" не отмечена.', function() {
                    helper.form.radiofield().withBoxLabel('Из сделки').expectToBeChecked();
                    helper.form.radiofield().withBoxLabel('Из контакта').expectNotToBeChecked();
                });
                it(
                    'Сохраняю настройки телефонии. Сохранена переадресация на ответственного сотрудника из сделки.',
                function() {
                    helper.saveButton.click();
                    wait(10);

                    helper.requestAmocrmDataSave().setForwardingToResponsibleForDeal().send();
                });
            });
            it(
                'Сохраняю настройки телефонии. Сохранена переадресация на ответственного сотрудника из контакта.',
            function() {
                helper.form.radiofield().withBoxLabel('Не обрабатывать').click();
                wait(10);
                helper.saveButton.click();
                wait(10);

                helper.requestAmocrmDataSave().setForwardingToResponsibleForContact().send();
            });
            it('Отмечена радиокнопка "Из контакта".', function() {
                helper.form.radiofield().withBoxLabel('Из контакта').expectToBeChecked();
                helper.form.radiofield().withBoxLabel('Из сделки').expectNotToBeChecked();
            });
        });
        xdescribe(
            'Обновление ответственного отключено и время заполнения карточки не установлено. Открываю вкладку ' +
            '"Телефония". Нельзя использовать неразобранное.',
        function() {
            beforeEach(function() {
                helper.requestAmocrmData().send();
                helper.requestTariffs().send();
                helper.requestAmocrmStatus().send();
                wait(10);

                helper.tabPanel.tab('Телефония').click();
                wait(10);
            });

            it(
                'Выбираю время в выпдающем спике "После завершения звонка обновлять ответственного сотрудника ' +
                'через". Выбираю опцию "На ответственного из настроек интеграции" в выпадающем списке "Назначать". ' +
                'Нажимаю на кнопку "Сохранить". Измененные данные сохранены.',
            function() {
                helper.form.combobox().withFieldLabel('Назначать').clickArrow().
                    option('На ответственного из настроек интеграции').click();
                wait(10);

                helper.updateContactOnCallFinishedTimeoutCombobox().clickArrow().option('15 мин').click();
                wait(10);

                helper.saveButton.click();
                wait(10);
                helper.requestAmocrmDataSave().setUpdateContact().set15MinutesContactUpdateTimout().send();
            });
            it(
                'В выпадающем списке "После завершения звонка обновлять ответственного сотрудника через" выбрана ' +
                'опция "0 мин". В выпадающем списке "Назначать" выбрана опция "На звонящего". Опция "Использовать ' +
                'функциональность "Неразобранное"" заблокирована.',
            function() {
                helper.form.combobox().withFieldLabel('Назначать').expectToHaveValue('На звонящего');
                helper.updateContactOnCallFinishedTimeoutCombobox().expectToHaveValue('0 мин');
                helper.unsortedRadioField().expectToBeDisabled();
            });
        });
        xdescribe(
            'Обновление ответственного включено, время заполнения карточки установлено. Открываю вкладку ' +
            '"Телефония".',
        function() {
            beforeEach(function() {
                helper.requestAmocrmData().setUpdateContact().set15MinutesContactUpdateTimout().send();
                helper.requestTariffs().send();
                helper.requestAmocrmStatus().send();
                wait(10);

                helper.tabPanel.tab('Телефония').click();
                wait(10);
            });

            it(
                'Выбираю опцию "0 мин" в выпдающем спике "После завершения звонка обновлять ответственного ' +
                'сотрудника через". Нажимаю на кнопку "Сохранить". Сохранено выключение обновления ответственного и ' +
                'нулевое время заполнения карточки.',
            function() {
                helper.updateContactOnCallFinishedTimeoutCombobox().clickArrow().option('0 мин').click();
                wait(10);

                helper.saveButton.click();
                wait(10);
                helper.requestAmocrmDataSave().setNotUpdateContact().setNoContactUpdateTimout().send();
            });
            it(
                'В выпадающем списке "После завершения звонка обновлять ответственного сотрудника через" выбрано ' +
                'время.',
            function() {
                helper.updateContactOnCallFinishedTimeoutCombobox().expectToHaveValue('15 мин');
            });
        });
        xit(
            'Открываю вкладку "Телефония". Можно использовать неразобранное. Опция "Использовать функциональность ' +
            '"Неразобранное"" доступна.',
        function() {
            helper.requestAmocrmData().send();
            helper.requestTariffs().send();
            helper.requestAmocrmStatus().setUnsortedEnabled().send();
            wait(10);

            helper.tabPanel.tab('Телефония').click();
            wait(10);

            helper.unsortedRadioField().expectToBeEnabled();
        });
        xit(
            'Обновление ответственного отключено, время заполнения карточки установлено. Открываю вкладку ' +
            '"Телефония". В выпадающем списке "После завершения звонка обновлять ответственного сотрудника через" ' +
            'выбрана опция "0 мин".',
        function() {
            helper.requestAmocrmData().set15MinutesContactUpdateTimout().send();
            helper.requestTariffs().send();
            helper.requestAmocrmStatus().send();
            wait(10);

            helper.tabPanel.tab('Телефония').click();
            wait(10);

            helper.updateContactOnCallFinishedTimeoutCombobox().expectToHaveValue('0 мин');
        });
        xit(
            'Установлена переадресация на ответственного сотрудника из контакта. Открываю вкладку "Телефония". ' +
            'Отмечена радиокнопка "Из контакта".',
        function() {
            helper.requestAmocrmData().setForwardingToResponsibleForContact().send();
            helper.requestTariffs().send();
            helper.requestAmocrmStatus().send();
            wait(10);

            helper.tabPanel.tab('Телефония').click();
            wait(10);

            helper.form.radiofield().withBoxLabel('Из контакта').expectToBeChecked();
            helper.form.radiofield().withBoxLabel('Из сделки').expectNotToBeChecked();
        });
        xit(
            'Установлена переадресация на ответственного сотрудника из сделки. Открываю вкладку "Телефония". ' +
            'Отмечена радиокнопка "Из сделки".',
        function() {
            helper.requestAmocrmData().setForwardingToResponsibleForDeal().send();
            helper.requestTariffs().send();
            helper.requestAmocrmStatus().send();
            wait(10);

            helper.tabPanel.tab('Телефония').click();
            wait(10);

            helper.form.radiofield().withBoxLabel('Из контакта').expectNotToBeChecked();
            helper.form.radiofield().withBoxLabel('Из сделки').expectToBeChecked();
        });
        it('', function() {
            helper.requestAmocrmData().send();
            helper.requestTariffs().send();
            helper.requestAmocrmStatus().send();
            wait(10);

            helper.form.textfield().withFieldLabel('Адрес портала amoCRM').fill('https://petrov.amocrm.ru/');
            wait(10);

            helper.saveButton.click();
            wait(10);

            helper.requestAmocrmDataSave().send();
            helper.requestAmocrmStatus().send();
            wait(10);
        });
    });
    return;
    describe(
        'Расширенная интеграция доступна. Открываю раздел "Аккаунт/Интеграция/Настройка интеграции с amoCRM". ' +
        'Открыта вкладка "Доступ к данным".',
    function() {
        beforeEach(function() {
            if (helper) {
                helper.destroy();
            }

            helper = new AccountIntegrationAmocrm(requestsManager, testersFactory, utils);

            Comagic.Directory.load();
            helper.batchReloadRequest().send();

            helper.actionIndex();
            helper.requestSalesFunnelComponentAvailability().send();
            helper.requestAmocrmData().send();
            helper.requestTariffs().send();
            helper.requestAmocrmStatus().send();
            wait(10);
        });
        
        describe('Открываю вкладку "Мультиворонки".', function() {
            beforeEach(function() {
                helper.tabPanel.tab('Мультиворонки').click();
                wait(10);
                helper.requestSyncSalesFunnel().send();
                helper.requestMultiFunnels().send();
                helper.requestSalesFunnel().send();
                helper.requestSalesFunnelStatus().send();
                wait(10);
            });

            describe('Открываю вкладку "Исходящие звонки".', function() {
                beforeEach(function() {
                    helper.innerTab('Исходящие звонки').mousedown();
                    wait(10);
                });

                it(
                    'Нажимаю на кнопку "Добавить воронку". Выбираю значения в выпадающих списках группы условий.',
                function() {
                    helper.addFunnelButton.click();
                    wait(10);

                    helper.listItem('Ну эта уже точно последняя').click();
                    wait(10);

                    helper.form.combobox().withPlaceholder('Выберите значение').clickArrow().
                        option('Виртуальный номер').click();
                    wait(10);

                    helper.form.combobox().withPlaceholder('Выберите значение').clickArrow().option('74959759581').
                        click();
                    wait(10);

                    helper.form.combobox().withValue('74959759581').clickArrow();
                    wait(10);
                });
                it(
                    'Выбираю другую воронку. Выбираю другой этап. Нажимаю на кнопку "Сохранить". Настройки сохранены.',
                function() {
                    helper.form.combobox().withValue('Другая воронка').clickArrow().option('Нет, все же не последнюю').
                        click();
                    wait(10);

                    helper.saveButton.click();
                    wait(10);

                    helper.requestMultiFunnelsSaving().changeOutgoingSalesFunnel().changeOutgoingSalesFunnel().send();
                    wait(10);

                    helper.requestMultiFunnels().send();
                    wait(10);
                });
            });
            it('Выбираю другой этап.', function() {
                helper.form.combobox().withValue('Некий статус').clickArrow().option('Иной статус').
                    click();
                wait(10);
            });
        });
        it('Открываю вкладку "Ответственные". Открываю вкладку "Исходящие звонки".', function() {
            helper.tabPanel.tab('Ответственные').click();
            wait(10);
            helper.requestResponsibles().send();
            wait(10);

            helper.innerTab('Исходящие звонки').mousedown();
            wait(10);
        });
        it('Открываю вкладку "Дополнительные поля".', function() {
            helper.tabPanel.tab('Дополнительные поля').click();
            wait(10);
            helper.requestAdditionalFields().send();
            wait(10);
            helper.requestUserFields().send();
            wait(10);
        });
        it('Открываю вкладку "Фильтр обращений".', function() {
            helper.tabPanel.tab('Фильтр обращений').click();
            wait(10);

            helper.requestEventFilters().send();
            wait(10);
        });
        it('Открываю вкладку "Сквозная аналитика".', function() {
            helper.tabPanel.tab('Сквозная аналитика').click();
            wait(10);

            helper.requestSalesFunnels().send();
            wait(10);
        });
        it('Открываю вкладку "Телефония".', function() {
            helper.tabPanel.tab('Телефония').click();
            wait(10);
        });
        it('Открываю вкладку "Чаты и заявки".', function() {
            helper.tabPanel.tab('Чаты и заявки').click();
            wait(10);
        });
    });
    it(
        'Расширенная интеграция недоступна. Открываю раздел "Аккаунт/Интеграция/Настройка интеграции с amoCRM". ' +
        'Открываю вкладку "Мультиворонки". Первичные обращения обрабатываются вручную. При повторных обращениях ' +
        'создается сделка. Настройки доступны. Кнопка "Подключить Мультиворонки" видима. Выпадащий список воронок ' +
        'скрыт.',
    function() {
            if (helper) {
                helper.destroy();
            }

            Comagic.getApplication().setHasNotComponent('amocrm_extended_integration');
            helper = new AccountIntegrationAmocrm(requestsManager, testersFactory, utils);

            Comagic.Directory.load();
            helper.batchReloadRequest().send();

            helper.actionIndex();
            helper.requestSalesFunnelComponentAvailability().send();

            helper.requestAmocrmData().send();
            helper.requestTariffs().send();
            helper.requestAmocrmStatus().send();
            wait(10);

            helper.tabPanel.tab('Мультиворонки').click();
            wait(10);

            helper.requestMultiFunnels().setFirstActManual().send();
            helper.requestSalesFunnel().send();
            helper.requestSalesFunnelStatus().send();
            wait(10);

            helper.addFunnelButton.expectToBeHiddenOrNotExist();
            helper.activateMultifunnelsButton.expectToBeVisible();
            helper.form.combobox().withValue('Некая воронка').expectToBeHiddenOrNotExist();
    });
});
