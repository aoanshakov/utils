tests.addTest(function(requestsManager, testersFactory, wait, utils, windowOpener) {
    describe('Открываю раздел "Аккаунт/Интеграция/Настройка интеграции с amoCRM".', function() {
        var helper;

        beforeEach(function() {
            if (helper) {
                helper.destroy();
            }

            helper = new AccountIntegrationAmocrm(requestsManager, testersFactory, utils);

            Comagic.Directory.load();
            helper.batchReloadRequest().send();

            helper.actionIndex();
            helper.requestSalesFunnelComponentAvailability().send();
            helper.requestSalesFunnelComponentTariffInfo().send();
        });
        
        xdescribe(
            'Обновление ответственного отключено и время заполнения карточки не установлено. Открываю вкладку ' +
            '"Телефония". Нельзя использовать неразобранное.',
        function() {
            beforeEach(function() {
                helper.requestAmocrmData().send();
                helper.requestAmocrmStatus().send();
                wait(10);

                helper.tabPanel.tab('Телефония').click();
                wait(10);
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
        });
        xit(
            'Открываю вкладку "Телефония". Можно использовать неразобранное. Опция "Использовать функциональность ' +
            '"Неразобранное"" доступна.',
        function() {
            helper.requestAmocrmData().send();
            helper.requestAmocrmStatus().setUnsortedEnabled().send();
            wait(10);

            helper.tabPanel.tab('Телефония').click();
            wait(10);

            helper.unsortedRadioField().expectToBeEnabled();
        });
        describe('Открываю вкладку "Мультиворонки".', function() {
            beforeEach(function() {
                helper.requestAmocrmData().send();
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

                it('Сообщение об условиях при которых будут работать мультиворонки не отображается.', function() {
                    helper.incomingCallsMessage.expectToBeHiddenOrNotExist();
                    helper.outboundCallsMessage.expectToBeHiddenOrNotExist();
                    helper.chatsMessage.expectToBeHiddenOrNotExist();
                    helper.offlineMessage.expectToBeHiddenOrNotExist();
                });
                it(
                    'Открываю вкладку "Исходящие звонки". Сообщение об условиях при которых будут работать ' +
                    'мультиворонки не отображается.',
                function() {
                    helper.innerTab('Исходящие звонки').mousedown();
                    wait(10);

                    helper.incomingCallsMessage.expectToBeHiddenOrNotExist();
                    helper.outboundCallsMessage.expectToBeHiddenOrNotExist();
                    helper.chatsMessage.expectToBeHiddenOrNotExist();
                    helper.offlineMessage.expectToBeHiddenOrNotExist();
                });
                it(
                    'Открываю вкладку "Офлайн Заявки". Сообщение об условиях при которых будут работать ' +
                    'мультиворонки не отображается.',
                function() {
                    helper.innerTab('Офлайн Заявки').mousedown();
                    wait(10);

                    helper.incomingCallsMessage.expectToBeHiddenOrNotExist();
                    helper.outboundCallsMessage.expectToBeHiddenOrNotExist();
                    helper.chatsMessage.expectToBeHiddenOrNotExist();
                    helper.offlineMessage.expectToBeHiddenOrNotExist();
                });
                it(
                    'Открываю вкладку "Чаты". Сообщение об условиях при которых будут работать мультиворонки не ' +
                    'отображается.',
                function() {
                    helper.innerTab('Чаты').mousedown();
                    wait(10);

                    helper.incomingCallsMessage.expectToBeHiddenOrNotExist();
                    helper.outboundCallsMessage.expectToBeHiddenOrNotExist();
                    helper.chatsMessage.expectToBeHiddenOrNotExist();
                    helper.offlineMessage.expectToBeHiddenOrNotExist();
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
                    helper.incomingCallsMessage.expectToBeVisible();
                    helper.noMultiFunnelsForUnsortedMessage.expectToBeHiddenOrNotExist();
                });
                it(
                    'Открываю вкладку "Исходящие звонки". Настройки заблокированы. Отображено сообщение об условиях ' +
                    'при которых будут работать мультиворонки.',
                function() {
                    helper.innerTab('Исходящие звонки').mousedown();
                    wait(10);

                    helper.addFunnelButton.expectToBeDisabled();
                    helper.outboundCallsMessage.expectToBeVisible();
                });
            });
            it(
                'Для чатов создаются сделки. Повторные обращения не обрабатываются. Открыта вкладка "Входящие ' +
                'звонки". Открываю вкладку "Чаты". Настройки заблокированы. Отображено сообщение об условиях при ' +
                'которых будут работать мультиворонки.',
            function() {
                helper.requestMultiFunnels().setChatActContact().send();
                helper.requestSalesFunnel().send();
                helper.requestSalesFunnelStatus().send();
                wait(10);

                helper.innerTab('Чаты').mousedown();
                wait(10);

                helper.addFunnelButton.expectToBeDisabled();
                helper.chatsMessage.expectToBeVisible();
            });
            it(
                'Для офлайн заявок создаются сделки. Повторные обращения не обрабатываются. Открыта вкладка ' +
                '"Входящие звонки". Открываю вкладку "Офлайн Заявки". Настройки заблокированы. Отображено сообщение ' +
                'об условиях при которых будут работать мультиворонки.',
            function() {
                helper.requestMultiFunnels().setOfflineActContact().send();
                helper.requestSalesFunnel().send();
                helper.requestSalesFunnelStatus().send();
                wait(10);

                helper.innerTab('Офлайн Заявки').mousedown();
                wait(10);

                helper.addFunnelButton.expectToBeDisabled();
                helper.offlineMessage.expectToBeVisible();
            });
            it(
                'Для первичных обращений используется функциональность "Неразобранное". Повторные обращения не ' +
                'обрабатываются. Настройки заблокированы. Отображается сообщение о том, что мультиворонки недоступны ' +
                'для неразобранного.',
            function() {
                helper.requestMultiFunnels().setFirstActUnsorted().setSecondaryActNoAction().send();
                helper.requestSalesFunnel().send();
                helper.requestSalesFunnelStatus().send();
                wait(10);

                helper.addFunnelButton.expectToBeDisabled();
                helper.noMultiFunnelsForUnsortedMessage.expectToBeVisible();
            });
            it(
                'Для чатов используется функциональность "Неразобранное". Открываю вкладку "Чаты". Настройки ' +
                'заблокированы. Отображается сообщение о том, что мультиворонки недоступны для неразобранного.',
            function() {
                helper.requestMultiFunnels().setChatActUnsorted().send();
                helper.requestSalesFunnel().send();
                helper.requestSalesFunnelStatus().send();
                wait(10);

                helper.innerTab('Чаты').mousedown();
                wait(10);

                helper.addFunnelButton.expectToBeDisabled();
                helper.noMultiFunnelsForUnsortedMessage.expectToBeVisible();
            });
            it(
                'Для офлайн заявок используется функциональность "Неразобранное". Повторные обращения не ' +
                'обрабатываются. Настройки заблокированы. Отображается сообщение о том, что мультиворонки недоступны ' +
                'для неразобранного.',
            function() {
                helper.requestMultiFunnels().setOfflineActUnsorted().send();
                helper.requestSalesFunnel().send();
                helper.requestSalesFunnelStatus().send();
                wait(10);

                helper.innerTab('Офлайн Заявки').mousedown();
                wait(10);

                helper.addFunnelButton.expectToBeDisabled();
                helper.noMultiFunnelsForUnsortedMessage.expectToBeVisible();
            });
            return;
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
                'доступны.',
            function() {
                helper.requestMultiFunnels().setFirstActManual().send();
                helper.requestSalesFunnel().send();
                helper.requestSalesFunnelStatus().send();
                wait(10);

                helper.addFunnelButton.expectToBeEnabled();
            });
        });
        return;
        it(
            'Обновление ответственного отключено, время заполнения карточки установлено. Открываю вкладку ' +
            '"Телефония". В выпадающем списке "После завершения звонка обновлять ответственного сотрудника через" ' +
            'выбрана опция "0 мин".',
        function() {
            helper.requestAmocrmData().set15MinutesContactUpdateTimout().send();
            helper.requestAmocrmStatus().send();
            wait(10);

            helper.tabPanel.tab('Телефония').click();
            wait(10);

            helper.updateContactOnCallFinishedTimeoutCombobox().expectToHaveValue('0 мин');
        });
        describe(
            'Обновление ответственного включено, время заполнения карточки установлено. Открываю вкладку ' +
            '"Телефония".',
        function() {
            beforeEach(function() {
                helper.requestAmocrmData().setUpdateContact().set15MinutesContactUpdateTimout().send();
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
        describe(
            'Тип переадресации на ответственного сотрудника не определен. Открываю вкладку "Телефония".',
        function() {
            beforeEach(function() {
                helper.requestAmocrmData().send();
                helper.requestAmocrmStatus().send();
                wait(10);

                helper.tabPanel.tab('Телефония').click();
                wait(10);
            });

            it('Отмечена радиокнопка "Из контакта".', function() {
                helper.form.radiofield().withBoxLabel('Из контакта').expectToBeChecked();
                helper.form.radiofield().withBoxLabel('Из сделки').expectNotToBeChecked();
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
            describe('Отмечаю радиокнопку "Из сделки".', function() {
                beforeEach(function() {
                    helper.form.radiofield().withBoxLabel('Из сделки').click();
                    wait(10);
                });

                it('Радиокнопка "Из контакта" не отмечена.', function() {
                    helper.form.radiofield().withBoxLabel('Из контакта').expectNotToBeChecked();
                    helper.form.radiofield().withBoxLabel('Из сделки').expectToBeChecked();
                });
                it(
                    'Сохраняю настройки телефонии. Сохранена переадресация на ответственного сотрудника из сделки.',
                function() {
                    helper.saveButton.click();
                    wait(10);

                    helper.requestAmocrmDataSave().setForwardingToResponsibleForDeal().send();
                });
            });
        });
        it(
            'Установлена переадресация на ответственного сотрудника из контакта. Открываю вкладку "Телефония". ' +
            'Отмечена радиокнопка "Из контакта".',
        function() {
            helper.requestAmocrmData().setForwardingToResponsibleForContact().send();
            helper.requestAmocrmStatus().send();
            wait(10);

            helper.tabPanel.tab('Телефония').click();
            wait(10);

            helper.form.radiofield().withBoxLabel('Из контакта').expectToBeChecked();
            helper.form.radiofield().withBoxLabel('Из сделки').expectNotToBeChecked();
        });
        it(
            'Установлена переадресация на ответственного сотрудника из сделки. Открываю вкладку "Телефония". ' +
            'Отмечена радиокнопка "Из сделки".',
        function() {
            helper.requestAmocrmData().setForwardingToResponsibleForDeal().send();
            helper.requestAmocrmStatus().send();
            wait(10);

            helper.tabPanel.tab('Телефония').click();
            wait(10);

            helper.form.radiofield().withBoxLabel('Из контакта').expectNotToBeChecked();
            helper.form.radiofield().withBoxLabel('Из сделки').expectToBeChecked();
        });
    });
    return;
    describe(
        'Открываю раздел "Аккаунт/Интеграция/Настройка интеграции с amoCRM". Открыта вкладка "Доступ к данным".',
    function() {
        var helper;

        beforeEach(function() {
            if (helper) {
                helper.destroy();
            }

            helper = new AccountIntegrationAmocrm(requestsManager, testersFactory, utils);

            Comagic.Directory.load();
            helper.batchReloadRequest().send();

            helper.actionIndex();
            helper.requestSalesFunnelComponentAvailability().send();
            helper.requestSalesFunnelComponentTariffInfo().send();
            helper.requestAmocrmData().send();
            helper.requestAmocrmStatus().send();
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
        describe('Открываю вкладку "Ответственные".', function() {
            beforeEach(function() {
                helper.tabPanel.tab('Ответственные').click();
                wait(10);
                helper.requestResponsibles().send();
                wait(10);
            });

            it('Открываю вкладку "Исходящие звонки".', function() {
                helper.innerTab('Исходящие звонки').mousedown();
                wait(10);
            });
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

            it('Выбираю другой этап.', function() {
                helper.form.combobox().withValue('Некий статус').clickArrow().option('Иной статус').
                    click();
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
        it('Открываю вкладку "Воронки продаж".', function() {
            helper.tabPanel.tab('Воронки продаж').click();
            wait(10);

            helper.requestSalesFunnels().send();
            wait(10);
        });
    });
});
