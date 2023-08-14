tests.addTest(function(args) {
    var tester,
        requestsManager = args.requestsManager, testersFactory = args.testersFactory,
        wait = args.wait,
        utils = args.utils,
        windowOpener = args.windowOpener;

    describe(
        'Расширенная интеграция доступна. Открываю раздел "Аккаунт/Интеграция/Настройка интеграции с amoCRM".',
    function() {
        let amocrmDataRequest;

        beforeEach(function() {
            if (tester) {
                tester.destroy();
            }

            tester = new AccountIntegrationAmocrm(args);

            Comagic.Directory.load();
            tester.batchReloadRequest().send();

            tester.actionIndex();
            tester.requestSalesFunnelComponentAvailability().send();
            amocrmDataRequest = tester.amocrmDataRequest().expectToBeSent();
        });
        
        describe('Настройки чатов включены.', function() {
            beforeEach(function() {
                amocrmDataRequest.allChatSettingsEnabled().receiveResponse();
                tester.requestTariffs().send();
                tester.requestAmocrmStatus().send();
                wait(10);
            });

            describe(
                'Снимаю отметку с свитчбокса "Интеграция". Нажимаю на кнопку "Сохранить". Отправлен запрос ' +
                'обновления интеграции.',
            function() {
                beforeEach(function() {
                    tester.switchButton('Интеграция').click();
                    wait(10);

                    tester.button('Сохранить').click();

                    tester.amocrmSavingRequest().notActive().receiveResponse();
                    tester.requestAmocrmStatus().send();
                });

                describe('Открываю вкладку "Чаты и заявки".', function() {
                    beforeEach(function() {
                        tester.tabPanel.tab('Чаты и заявки').click();
                        wait(10);

                        tester.entityNameTemplateNsParamsRequest().receiveResponse();
                    });

                    it('Открываю вкладку "Доступ к данным". Окно подтверждения не отображено.', function() {
                        tester.tabPanel.tab('Доступ к данным').click();
                        wait(10);

                        tester.messageBox.expectToBeHiddenOrNotExist();
                    });
                    it(
                        'Отмечаю чекбоксы настроек чатов. Нажимаю на кнопку "Сохранить". Запрос сохранения не ' +
                        'отправляется.',
                    function() {
                        tester.form.
                            checkbox().
                            withBoxLabel('Передавать чаты в amoCRM').
                            click();

                        tester.form.
                            checkbox().
                            withBoxLabel('Вести переписку в amoCRM').
                            click();

                        wait(10);
                        tester.button('Сохранить').click();
                    });
                    it('Чекбоксы настроек чатов неотмечены.', function() {
                        tester.form.
                            checkbox().
                            withBoxLabel('Передавать чаты в amoCRM').
                            expectNotToBeChecked();

                        tester.form.
                            checkbox().
                            withBoxLabel('Вести переписку в amoCRM').
                            expectNotToBeChecked();

                        tester.form.
                            checkbox().
                            withBoxLabel('Автоматическое прикрепление сценария').
                            expectNotToBeChecked();

                        tester.container.
                            withLabel('Работа с чатами').
                            checkbox.
                            withBoxLabel('Только для первичных обращений').
                            expectNotToBeChecked();
                    });
                });
                it('Свитчбокс "Интеграция" неотмечен.', function() {
                    tester.switchButton('Интеграция').expectAttributeToHaveValue('data-checked', 'false');
                });
            });
            describe('Открываю вкладку "Чаты и заявки".', function() {
                beforeEach(function() {
                    tester.tabPanel.tab('Чаты и заявки').click();
                    wait(10);

                    tester.entityNameTemplateNsParamsRequest().receiveResponse();
                });

                it(
                    'Снимаю отметку с чекбокса. Нажимаю на кнопку "Сохранить". Отправлен запрос сохранения настроек.',
                function() {
                    tester.form.
                        checkbox().
                        withBoxLabel('Передавать чаты в amoCRM').
                        click();

                    wait(10);

                    tester.button('Сохранить').click();
                    tester.amocrmSavingRequest().receiveResponse();
                });
                it('Отмечены чекбоксы настроек чатов.', function() {
                    tester.form.
                        checkbox().
                        withBoxLabel('Передавать чаты в amoCRM').
                        expectToBeChecked();

                    tester.form.
                        checkbox().
                        withBoxLabel('Вести переписку в amoCRM').
                        expectToBeChecked();

                    tester.form.
                        checkbox().
                        withBoxLabel('Автоматическое прикрепление сценария').
                        expectToBeChecked();

                    tester.container.
                        withLabel('Работа с чатами').
                        checkbox.
                        withBoxLabel('Только для первичных обращений').
                        expectToBeChecked();
                });
            });
            it('Свитчбокс "Интеграция" отмечен.', function() {
                tester.switchButton('Интеграция').expectAttributeToHaveValue('data-checked', 'true');
            });
        });
        it(
            'Интеграция выключена. Отмечаю чекбоксы настроек чатов. Нажимаю на кнопку "Сохранить". Запрос сохранения ' +
            'не отправляется.',
        function() {
            amocrmDataRequest.notActive().receiveResponse();
            tester.requestTariffs().send();
            tester.requestAmocrmStatus().send();
            wait(10);

            tester.tabPanel.tab('Чаты и заявки').click();
            wait(10);

            tester.entityNameTemplateNsParamsRequest().receiveResponse();

            tester.form.
                checkbox().
                withBoxLabel('Передавать чаты в amoCRM').
                click();

            tester.form.
                checkbox().
                withBoxLabel('Вести переписку в amoCRM').
                click();

            wait(10);
            tester.button('Сохранить').click();
        });
        return;
        describe('Настройки получены.', function() {
            beforeEach(function() {
                amocrmDataRequest.receiveResponse();
                tester.requestTariffs().send();
                tester.requestAmocrmStatus().send();
                wait(10);
            });

            describe('Открываю вкладку "Мультиворонки".', function() {
                beforeEach(function() {
                    tester.tabPanel.tab('Мультиворонки').click();
                    wait(10);
                    tester.requestSyncSalesFunnel().send();
                });

                describe(
                    'При первичном обращении создается сделка. Для офлайн сообщений создаются сделки. Для чатов ' +
                    'создаются сделки. При повторных обращениях создается сделка. Открыта вкладка "Входящие звонки".',
                function() {
                    beforeEach(function() {
                        tester.requestMultiFunnels().send();
                        tester.requestSalesFunnel().send();
                        tester.requestSalesFunnelStatus().send();
                        wait(10);
                    });

                    it('Открываю вкладку "Исходящие звонки". Настройки доступны.', function() {
                        tester.innerTab('Исходящие звонки').mousedown();
                        wait(10);

                        tester.addFunnelButton.expectToBeEnabled();
                    });
                    it('Открываю вкладку "Офлайн Заявки". Настройки доступны.', function() {
                        tester.innerTab('Офлайн Заявки').mousedown();
                        wait(10);

                        tester.addFunnelButton.expectToBeEnabled();
                    });
                    it(
                        'Открываю вкладку "Чаты". Добавляю воронку. Выбираю условие "Название канала чата". В списке ' +
                        'значений отображены значения условия.',
                    function() {
                        tester.innerTab('Чаты').mousedown();
                        wait(10);

                        tester.addFunnelButton.click();
                        wait(10);

                        tester.listItem('Ну эта уже точно последняя').click();
                        wait(10);

                        tester.form.combobox().withPlaceholder('Выберите значение').clickArrow().
                            option('Название канала чата').click();
                        wait(10);

                        tester.form.combobox().withPlaceholder('Выберите значение').clickArrow().option('Некий чат').
                            click();
                        wait(10);

                        tester.form.combobox().withValue('Некий чат').clickArrow();
                        wait(10);
                    });
                    it('Настройки доступны.', function() {
                        tester.addFunnelButton.expectToBeEnabled();
                    });
                });
                describe(
                    'Первичные обращения обрабатываются вручную. Повторные обращения не обрабатываются. Открыта ' +
                    'вкладка "Входящие звонки".',
                function() {
                    beforeEach(function() {
                        tester.requestMultiFunnels().setFirstActManual().setSecondaryActNoAction().send();
                        tester.requestSalesFunnel().send();
                        tester.requestSalesFunnelStatus().send();
                        wait(10);
                    });

                    it(
                        'Настройки заблокированы. Отображено сообщение об условиях при которых будут работать ' +
                        'мультиворонки. Сообщение о том, что мультиворонки недоступны для неразобранного не ' +
                        'отображаются.',
                    function() {
                        tester.addFunnelButton.expectToBeDisabled();
                    });
                    it(
                        'Открываю вкладку "Исходящие звонки". Настройки заблокированы. Отображено сообщение об ' +
                        'условиях при которых будут работать мультиворонки.',
                    function() {
                        tester.innerTab('Исходящие звонки').mousedown();
                        wait(10);

                        tester.addFunnelButton.expectToBeDisabled();
                    });
                });
                it(
                    'Для чатов создаются сделки. Повторные обращения не обрабатываются. Открыта вкладка "Входящие ' +
                    'звонки". Открываю вкладку "Чаты". Настройки заблокированы.',
                function() {
                    tester.requestMultiFunnels().setChatActContact().send();
                    tester.requestSalesFunnel().send();
                    tester.requestSalesFunnelStatus().send();
                    wait(10);

                    tester.innerTab('Чаты').mousedown();
                    wait(10);

                    tester.addFunnelButton.expectToBeDisabled();
                });
                it(
                    'Для офлайн заявок создаются сделки. Повторные обращения не обрабатываются. Открыта вкладка ' +
                    '"Входящие звонки". Открываю вкладку "Офлайн Заявки". Настройки заблокированы.',
                function() {
                    tester.requestMultiFunnels().setOfflineActContact().send();
                    tester.requestSalesFunnel().send();
                    tester.requestSalesFunnelStatus().send();
                    wait(10);

                    tester.innerTab('Офлайн Заявки').mousedown();
                    wait(10);

                    tester.addFunnelButton.expectToBeDisabled();
                });
                describe(
                    'При первичном обращении создается сделка. Повторные обращения не обрабатываются. Открыта ' +
                    'вкладка "Входящие звонки".',
                function() {
                    beforeEach(function() {
                        tester.requestMultiFunnels().setSecondaryActNoAction().send();
                        tester.requestSalesFunnel().send();
                        tester.requestSalesFunnelStatus().send();
                        wait(10);
                    });

                    it('Настройки доступны.', function() {
                        tester.addFunnelButton.expectToBeEnabled();
                    });
                    it('Открываю вкладку "Исходящие звонки". Настройки доступны.', function() {
                        tester.innerTab('Исходящие звонки').mousedown();
                        wait(10);

                        tester.addFunnelButton.expectToBeEnabled();
                    });
                });
                it(
                    'Первичные обращения обрабатываются вручную. При повторных обращениях создается сделка. ' +
                    'Настройки доступны. Кнопка "Подключить Мультиворонки" скрыта. Выпадащий список воронок видим.',
                function() {
                    tester.requestMultiFunnels().setFirstActManual().send();
                    tester.requestSalesFunnel().send();
                    tester.requestSalesFunnelStatus().send();
                    wait(10);

                    tester.addFunnelButton.expectToBeEnabled();
                    tester.activateMultifunnelsButton.expectToBeHiddenOrNotExist();
                    tester.form.combobox().withValue('Некая воронка').expectToBeVisible();
                });
            });
            describe('Открываю вкладку "Чаты и заявки".', function() {
                beforeEach(function() {
                    tester.tabPanel.tab('Чаты и заявки').click();
                    wait(10);

                    tester.entityNameTemplateNsParamsRequest().receiveResponse();
                });

                it(
                    'Изменяю шаблоны названий заявок. Нажимаю на кнопку "Сохранить". Отправлен запрос сохранения.',
                function() {
                    tester.container.
                        withLabel('Работа с офлайн заявками').
                        textarea.
                        withLabel('Контакты').
                        fill(
                            'Новый контакт {{visitor_contact_info}} по заявке с сайта CoMagic'
                        );

                    tester.container.
                        withLabel('Работа с офлайн заявками').
                        textarea.
                        withLabel('Сделки').
                        fill(
                            'Новая заявка с сайта под номером {{communication_id}} из CoMagic'
                        );

                    tester.container.
                        withLabel('Работа с офлайн заявками').
                        textarea.
                        withLabel('Задачи').
                        fill(
                            'Дать ответ на заявку с сайта под номером {{communication_id}} из CoMagic'
                        );

                    tester.container.
                        withLabel('Работа с чатами').
                        textarea.
                        withLabel('Контакты').
                        fill(
                            'Новый контакт {{visitor_contact_info}} по чату с сайта CoMagic'
                        );

                    tester.container.
                        withLabel('Работа с чатами').
                        textarea.
                        withLabel('Сделки').
                        fill(
                            'Новая заявка из чата под номером {{communication_id}} из CoMagic'
                        );

                    tester.container.
                        withLabel('Работа с чатами').
                        textarea.
                        withLabel('Задачи').
                        fill(
                            'Дать ответ на сообщение в чате с сайта под номером {{communication_id}} из CoMagic'
                        );

                    tester.button('Сохранить').click();

                    tester.amocrmSavingRequest().
                        offlineMessageTemplatesChanged().
                        chatTemplatesChanged().
                        receiveResponse();
                });
                it(
                    'Снимаю отметку с чекбокса "Передавать офлайн заявки в amoCRM". Контейнер "Шаблоны названий" ' +
                    'заблокирован.',
                function() {
                    tester.label('Передавать офлайн заявки в amoCRM').click();

                    tester.container.
                        withLabel('Работа с офлайн заявками').
                        container.
                        withLabel('Шаблоны названий').
                        expectToBeDisabled();

                    tester.container.
                        withLabel('Работа с чатами').
                        container.
                        withLabel('Шаблоны названий').
                        expectToBeEnabled();
                });
                it(
                    'Снимаю отметку с чекбокса "Передавать чаты в amoCRM". Контейнер "Шаблоны названий" заблокирован.',
                function() {
                    tester.label('Передавать чаты в amoCRM').click();

                    tester.container.
                        withLabel('Работа с офлайн заявками').
                        container.
                        withLabel('Шаблоны названий').
                        expectToBeEnabled();

                    tester.container.
                        withLabel('Работа с чатами').
                        container.
                        withLabel('Шаблоны названий').
                        expectToBeDisabled();
                });
                it(
                    'Открываю таблицу параметров заявки по контакту. В таблице отображены параметры заявок по ' +
                    'контакту.',
                function() {
                    tester.container.
                        withLabel('Работа с офлайн заявками').
                        textarea.
                        withLabel('Контакты').
                        click();

                    tester.container.
                        withLabel('Работа с офлайн заявками').
                        container.
                        withLabel('Контакты').
                        plusIcon.
                        click();

                    tester.grid.expectTextContentToHaveSubstring('Третий параметр');
                });
                it(
                    'Открываю таблицу параметров чата по контакту. В таблице отображены параметры чата по контакту.',
                function() {
                    tester.container.
                        withLabel('Работа с чатами').
                        textarea.
                        withLabel('Контакты').
                        click();

                    tester.container.
                        withLabel('Работа с чатами').
                        container.
                        withLabel('Контакты').
                        plusIcon.
                        click();

                    tester.grid.expectTextContentToHaveSubstring('Шестой параметр');
                });
                it('Форма заполнена данными полученными от сервевра.', function() {
                    tester.container.
                        withLabel('Работа с офлайн заявками').
                        container.
                        withLabel('Шаблоны названий').
                        expectToBeEnabled();

                    tester.container.
                        withLabel('Работа с чатами').
                        container.
                        withLabel('Шаблоны названий').
                        expectToBeEnabled();

                    tester.container.
                        withLabel('Работа с офлайн заявками').
                        textarea.
                        withLabel('Контакты').
                        expectToHaveValue(
                            'Новый контакт {{visitor_contact_info}} по заявке с сайта UIS'
                        );

                    tester.container.
                        withLabel('Работа с офлайн заявками').
                        textarea.
                        withLabel('Сделки').
                        expectToHaveValue(
                            'Новая заявка с сайта под номером {{communication_id}} из UIS'
                        );

                    tester.container.
                        withLabel('Работа с офлайн заявками').
                        textarea.
                        withLabel('Задачи').
                        expectToHaveValue(
                            'Дать ответ на заявку с сайта под номером {{communication_id}}'
                        );

                    tester.container.
                        withLabel('Работа с чатами').
                        textarea.
                        withLabel('Контакты').
                        expectToHaveValue(
                            'Новый контакт {{visitor_contact_info}} по чату с сайта UIS'
                        );

                    tester.container.
                        withLabel('Работа с чатами').
                        textarea.
                        withLabel('Сделки').
                        expectToHaveValue(
                            'Новая заявка из чата под номером {{communication_id}} из UIS'
                        );

                    tester.container.
                        withLabel('Работа с чатами').
                        textarea.
                        withLabel('Задачи').
                        expectToHaveValue(
                            'Дать ответ на сообщение в чате с сайта под номером {{communication_id}}'
                        );
                });
            });
            describe('Нажимаю на кнопку "Синхронизировать".', function() {
                let syncEmployeesRequest;

                beforeEach(function() {
                    tester.button('Синхронизировать').click();
                    syncEmployeesRequest = tester.syncEmployeesRequest().expectToBeSent();
                });

                it(
                    'Синхронизация производится. Отображена подсказка о том, что синхронизация производится.',
                function() {
                    syncEmployeesRequest.sync().receiveResponse();

                    tester.userSyncStatusTextOk.expectToBeHiddenOrNotExist()
                    tester.userSyncStatusTextError.expectToBeHiddenOrNotExist();
                    tester.userSyncErrorIcon.expectToBeHiddenOrNotExist();

                    tester.userSyncWarningIcon.expectAttributeToHaveValue(
                        'data-qtip',
                        'Производится синхронизация'
                    );
                });
                it('Синхронизация прошла успешно. Отображено сообщение об успешной синхронизации.', function() {
                    syncEmployeesRequest.receiveResponse();

                    tester.body.expectTextContentToHaveSubstring('2023-06-09');
                    tester.userSyncStatusTextOk.expectToBeVisible()
                    tester.userSyncStatusTextError.expectToBeHiddenOrNotExist();
                    tester.userSyncWarningIcon.expectToBeHiddenOrNotExist();
                    tester.userSyncErrorIcon.expectToBeHiddenOrNotExist();
                });
                it(
                    'Синхронизация не произведена. Отображено сообщение о том, что синхронизация не производилась.',
                function() {
                    syncEmployeesRequest.noTime().receiveResponse();

                    tester.userSyncWarningIcon.expectAttributeToHaveValue(
                        'data-qtip',
                        'Синхронизация не производилась'
                    );
                });
                it('Произошла ошибка синхронизации с сообщением об ошибке.', function() {
                    syncEmployeesRequest.errorMessage().receiveResponse();

                    tester.userSyncStatusTextOk.expectToBeHiddenOrNotExist()
                    tester.userSyncStatusTextError.expectToHaveTextContent('Ошибка синхронизации');
                    tester.userSyncErrorIcon.expectAttributeToHaveValue('data-qtip', 'Некая ошибка произошла');
                });
                it('Произошла ошибка синхронизации.', function() {
                    syncEmployeesRequest.failure().receiveResponse();

                    tester.userSyncStatusTextOk.expectToBeHiddenOrNotExist()
                    tester.userSyncStatusTextError.expectToHaveTextContent('Ошибка синхронизации');
                });
            });
            it('Отображено время синхронизации.', function() {
                tester.body.expectTextContentToHaveSubstring('2018-12-02T12:43:54');

                tester.userSyncStatusTextOk.expectToBeVisible()
                tester.userSyncStatusTextError.expectToBeHiddenOrNotExist();
            });
        });
        describe(
            'Тип переадресации на ответственного сотрудника не определен. Открываю вкладку "Телефония".',
        function() {
            beforeEach(function() {
                amocrmDataRequest.receiveResponse();
                tester.requestTariffs().send();
                tester.requestAmocrmStatus().send();
                wait(10);

                tester.tabPanel.tab('Телефония').click();
                wait(10);

                tester.entityNameTemplateNsParamsRequest().receiveResponse();
            });

            describe('Отмечаю радиокнопку "Из сделки".', function() {
                beforeEach(function() {
                    tester.form.radiofield().withBoxLabel('Из сделки').click();
                    wait(10);
                });

                it('Радиокнопка "Из контакта" не отмечена.', function() {
                    tester.form.radiofield().withBoxLabel('Из сделки').expectToBeChecked();
                    tester.form.radiofield().withBoxLabel('Из контакта').expectNotToBeChecked();
                });
                it(
                    'Сохраняю настройки телефонии. Сохранена переадресация на ответственного сотрудника из сделки.',
                function() {
                    tester.saveButton.click();
                    wait(10);

                    tester.requestAmocrmDataSave().setForwardingToResponsibleForDeal().send();
                });
            });
            it(
                'Сохраняю настройки телефонии. Сохранена переадресация на ответственного сотрудника из контакта.',
            function() {
                tester.form.radiofield().withBoxLabel('Не обрабатывать').click();
                wait(10);

                tester.saveButton.click();
                wait(10);

                tester.requestAmocrmDataSave().setForwardingToResponsibleForContact().send();
            });
            it(
                'Сохраняю настройки телефонии. Сохранено значение переключателя "Передавать записи звонков в ' +
                'карточку контакта, если включен фильтр на операцию сценария ВАТС".',
            function() {
                tester.switchButton(
                    'Передавать записи звонков в карточку контакта и создавать задачи, если настроен фильтр по ' +
                    'операции сценария.'
                ).click();
                wait(10);

                tester.saveButton.click();
                wait(10);

                tester.requestAmocrmDataSave().setIsAnywaySendTalkRecords().send();
            });
            it('Отмечена радиокнопка "Из контакта".', function() {
                tester.button('Из контакта').expectToHaveClass('x-btn-pressed');
                tester.button('Из сделки').expectNotToHaveClass('x-btn-pressed');

                tester.switchButton(
                    'Передавать записи звонков в карточку контакта и создавать задачи, если настроен фильтр по ' +
                    'операции сценария.'
                ).expectNotToHaveClass('x-form-cb-checked');

                tester.row('Создавать новую сделку после закрытия последней сделки не ранее, чем через').
                    column(1).
                    combobox().
                    expectToHaveValue('1 час');

                tester.row('Создавать новую сделку после закрытия последней сделки не ранее, чем через').
                    column(2).
                    combobox().
                    expectToHaveValue('1 час');

                tester.row('Создавать новую сделку после закрытия последней сделки не ранее, чем через').
                    column(1).
                    combobox().
                    click()

                tester.row('Создавать новую сделку после закрытия последней сделки не ранее, чем через').
                    column(1).
                    combobox().
                    options().
                    expectToHaveTextContent(
                        '5 минут ' +
                        '10 минут ' +
                        '15 минут ' +
                        '20 минут ' +
                        '30 минут ' +
                        '45 минут ' +
                        '1 час ' +
                        '12 часов ' +
                        '1 день ' +
                        '3 дня ' +
                        '1 неделя ' +
                        '1 месяц ' +
                        '2 месяца ' +
                        '3 месяца ' +
                        '4 месяца ' +
                        '6 месяцев'
                    );
            });
        });
        describe(
            'Обновление ответственного отключено и время заполнения карточки не установлено. Открываю вкладку ' +
            '"Телефония". Нельзя использовать неразобранное.',
        function() {
            beforeEach(function() {
                amocrmDataRequest.receiveResponse();
                tester.requestTariffs().send();
                tester.requestAmocrmStatus().send();
                wait(10);

                tester.tabPanel.tab('Телефония').click();
                wait(10);

                tester.entityNameTemplateNsParamsRequest().receiveResponse();
            });

            it(
                'Выбираю время в выпдающем спике "После завершения звонка обновлять ответственного сотрудника ' +
                'через". Выбираю опцию "На ответственного из настроек интеграции" в выпадающем списке "Назначать при ' +
                'потерянном звонке". Нажимаю на кнопку "Сохранить". Измененные данные сохранены.',
            function() {
                tester.row('Назначать при потерянном звонке').column(1).combobox().clickArrow().
                    option('На ответственного из настроек интеграции').click();
                wait(10);

                tester.updateContactOnCallFinishedTimeoutCombobox().clickArrow().option('15 мин').click();
                wait(10);

                tester.saveButton.click();
                wait(10);
                tester.requestAmocrmDataSave().setUpdateContact().set15MinutesContactUpdateTimout().send();
            });
            it(
                'В выпадающем списке "После завершения звонка обновлять ответственного сотрудника через" выбрана ' +
                'опция "0 мин". В выпадающем списке "Назначать при потерянном звонке" выбрана опция "На звонящего". ' +
                'Опция "Использовать функциональность "Неразобранное"" заблокирована.',
            function() {
                tester.row('Для первичных обращений').column(1).combobox().clickArrow().
                    option('Использовать функциональность "Неразобранное"').createTester().
                    forDescendant('.x-form-error-msg').
                    expectTooltipWithText('Необходимо активировать “Неразобранное” в amoCRM').
                    toBeShownOnMouseOver();

                wait()

                tester.row('Назначать при потерянном звонке').column(1).combobox().expectToHaveValue('На звонящего');
                tester.updateContactOnCallFinishedTimeoutCombobox().expectToHaveValue('0 мин');
            });
        });
        describe(
            'Обновление ответственного включено, время заполнения карточки установлено. Открываю вкладку ' +
            '"Телефония".',
        function() {
            beforeEach(function() {
                amocrmDataRequest.setUpdateContact().set15MinutesContactUpdateTimout().receiveResponse();
                tester.requestTariffs().send();
                tester.requestAmocrmStatus().send();
                wait(10);

                tester.tabPanel.tab('Телефония').click();
                wait(10);
            });

            it(
                'Выбираю опцию "0 мин" в выпдающем спике "После завершения звонка обновлять ответственного ' +
                'сотрудника через". Нажимаю на кнопку "Сохранить". Сохранено выключение обновления ответственного и ' +
                'нулевое время заполнения карточки.',
            function() {
                tester.updateContactOnCallFinishedTimeoutCombobox().clickArrow().option('0 мин').click();
                wait(10);

                tester.saveButton.click();
                wait(10);
                tester.requestAmocrmDataSave().setNotUpdateContact().setNoContactUpdateTimout().send();
            });
            it(
                'В выпадающем списке "После завершения звонка обновлять ответственного сотрудника через" выбрано ' +
                'время.',
            function() {
                tester.updateContactOnCallFinishedTimeoutCombobox().expectToHaveValue('15 мин');
            });
        });
        it('Шаблоны названий чатов и заявок не определены. Открываю вкладку "Чаты и заявки".', function() {
            amocrmDataRequest.noChatTemplate().noOfflineMessageTemplate().receiveResponse();
            tester.requestTariffs().send();
            tester.requestAmocrmStatus().send();
            wait(10);

            tester.tabPanel.tab('Чаты и заявки').click();
            wait(10);

            tester.entityNameTemplateNsParamsRequest().receiveResponse();

            tester.container.
                withLabel('Работа с офлайн заявками').
                textarea.
                withLabel('Контакты').
                expectAttributeToHaveValue(
                    'placeholder',
                    'Некий шаблон заявки для конткта'
                );

            tester.container.
                withLabel('Работа с офлайн заявками').
                textarea.
                withLabel('Сделки').
                expectAttributeToHaveValue(
                    'placeholder',
                    'Некий шаблон заявки для лида'
                );

            tester.container.
                withLabel('Работа с офлайн заявками').
                textarea.
                withLabel('Задачи').
                expectAttributeToHaveValue(
                    'placeholder',
                    'Некий шаблон заявки для задачи'
                );

            tester.container.
                withLabel('Работа с чатами').
                textarea.
                withLabel('Контакты').
                expectAttributeToHaveValue(
                    'placeholder',
                    'Некий шаблон чата для конткта'
                );

            tester.container.
                withLabel('Работа с чатами').
                textarea.
                withLabel('Сделки').
                expectAttributeToHaveValue(
                    'placeholder',
                    'Некий шаблон чата для лида'
                );

            tester.container.
                withLabel('Работа с чатами').
                textarea.
                withLabel('Задачи').
                expectAttributeToHaveValue(
                    'placeholder',
                    'Некий шаблон чата для задачи'
                );
        });
        it('Ввожу адрес портала. Нажимаю на кнопку "Сохранить". Настройки сохранены.', function() {
            tester.requestAmocrmData().send();
            tester.requestTariffs().send();
            tester.requestAmocrmStatus().send();
            wait(10);

            tester.form.textfield().withFieldLabel('Адрес портала amoCRM').fill('https://petrov.amocrm.ru/');
            wait(10);

            tester.saveButton.click();
            wait(10);

            tester.requestAmocrmDataSave().send();
            tester.requestAmocrmStatus().send();
            wait(10);
        });
        it(
            'Открываю вкладку "Телефония". Можно использовать неразобранное. Опция "Использовать функциональность ' +
            '"Неразобранное"" доступна.',
        function() {
            amocrmDataRequest.receiveResponse();
            tester.requestTariffs().send();
            tester.requestAmocrmStatus().setUnsortedEnabled().send();
            wait(10);

            tester.tabPanel.tab('Телефония').click();
            wait(10);
        });
        it(
            'Обновление ответственного отключено, время заполнения карточки установлено. Открываю вкладку ' +
            '"Телефония". В выпадающем списке "После завершения звонка обновлять ответственного сотрудника через" ' +
            'выбрана опция "0 мин".',
        function() {
            amocrmDataRequest.set15MinutesContactUpdateTimout().receiveResponse();
            tester.requestTariffs().send();
            tester.requestAmocrmStatus().send();
            wait(10);

            tester.tabPanel.tab('Телефония').click();
            wait(10);

            tester.updateContactOnCallFinishedTimeoutCombobox().expectToHaveValue('0 мин');
        });
        it(
            'Установлена переадресация на ответственного сотрудника из контакта. Открываю вкладку "Телефония". ' +
            'Отмечена радиокнопка "Из контакта".',
        function() {
            amocrmDataRequest.setForwardingToResponsibleForContact().receiveResponse();
            tester.requestTariffs().send();
            tester.requestAmocrmStatus().send();
            wait(10);

            tester.tabPanel.tab('Телефония').click();
            wait(10);

            tester.form.radiofield().withBoxLabel('Из контакта').expectToBeChecked();
            tester.form.radiofield().withBoxLabel('Из сделки').expectNotToBeChecked();
        });
        it(
            'Установлена переадресация на ответственного сотрудника из сделки. Открываю вкладку "Телефония". ' +
            'Отмечена радиокнопка "Из сделки".',
        function() {
            amocrmDataRequest.setForwardingToResponsibleForDeal().receiveResponse();
            tester.requestTariffs().send();
            tester.requestAmocrmStatus().send();
            wait(10);

            tester.tabPanel.tab('Телефония').click();
            wait(10);

            tester.form.radiofield().withBoxLabel('Из контакта').expectNotToBeChecked();
            tester.form.radiofield().withBoxLabel('Из сделки').expectToBeChecked();
        });
    });
    return;
    describe(
        'Расширенная интеграция доступна. Открываю раздел "Аккаунт/Интеграция/Настройка интеграции с amoCRM". ' +
        'Открыта вкладка "Доступ к данным".',
    function() {
        beforeEach(function() {
            if (tester) {
                tester.destroy();
            }

            tester = new AccountIntegrationAmocrm(args);

            Comagic.Directory.load();
            tester.batchReloadRequest().send();

            tester.actionIndex();
            tester.requestSalesFunnelComponentAvailability().send();
            tester.requestAmocrmData().send();
            tester.requestTariffs().send();
            tester.requestAmocrmStatus().send();
            wait(10);
        });
        
        describe('Открываю вкладку "Мультиворонки".', function() {
            beforeEach(function() {
                tester.tabPanel.tab('Мультиворонки').click();
                wait(10);
                tester.requestSyncSalesFunnel().send();
                tester.requestMultiFunnels().send();
                tester.requestSalesFunnel().send();
                tester.requestSalesFunnelStatus().send();
                wait(10);
            });

            describe('Открываю вкладку "Исходящие звонки".', function() {
                beforeEach(function() {
                    tester.innerTab('Исходящие звонки').mousedown();
                    wait(10);
                });

                it(
                    'Нажимаю на кнопку "Добавить воронку". Выбираю значения в выпадающих списках группы условий.',
                function() {
                    tester.addFunnelButton.click();
                    wait(10);

                    tester.listItem('Ну эта уже точно последняя').click();
                    wait(10);

                    tester.form.combobox().withPlaceholder('Выберите значение').clickArrow().
                        option('Виртуальный номер').click();
                    wait(10);

                    tester.form.combobox().withPlaceholder('Выберите значение').clickArrow().option('74959759581').
                        click();
                    wait(10);

                    tester.form.combobox().withValue('74959759581').clickArrow();
                    wait(10);
                });
                it(
                    'Выбираю другую воронку. Выбираю другой этап. Нажимаю на кнопку "Сохранить". Настройки сохранены.',
                function() {
                    tester.form.combobox().withValue('Другая воронка').clickArrow().option('Нет, все же не последнюю').
                        click();
                    wait(10);

                    tester.saveButton.click();
                    wait(10);

                    tester.requestMultiFunnelsSaving().changeOutgoingSalesFunnel().changeOutgoingSalesFunnel().send();
                    wait(10);

                    tester.requestMultiFunnels().send();
                    wait(10);
                });
            });
            it('Выбираю другой этап.', function() {
                tester.form.combobox().withValue('Некий статус').clickArrow().option('Иной статус').
                    click();
                wait(10);
            });
        });
        describe('Открываю вкладку "Сквозная аналитика". Изменяю поля формы.', function() {
            beforeEach(function() {
                tester.tabPanel.tab('Сквозная аналитика').click();
                wait(10);

                tester.requestSalesFunnels().send();
                tester.requestSelectMultiselectUserFields().send();
                wait(10);

                tester.form.combobox().withFieldLabel('Из какого поля передавать категорию продаж').clickArrow().
                    option('Второе поле для категорий и причин').click();
                tester.form.combobox().withFieldLabel('Из какого поля передавать категорию продаж').
                    option('Четвертое поле для категорий и причин').click();
                tester.form.combobox().withFieldLabel('Из какого поля передавать категорию продаж').
                    option('Первое поле для категорий и причин').click();
                tester.form.combobox().withFieldLabel('Из какого поля передавать категорию продаж').
                    option('Пятое поле для категорий и причин').click();
            });

            describe('Выбираю максимальное количество опций.', function() {
                beforeEach(function() {
                    tester.form.combobox().withFieldLabel('Из какого поля передавать категорию продаж').
                        option('Третье поле для категорий и причин').click();
                });

                describe('Пытаюсь выбрать еще одну опцию. Снимаю отметку с другой опции.', function() {
                    beforeEach(function() {
                        tester.form.combobox().withFieldLabel('Из какого поля передавать категорию продаж').
                            option('Седьмое поле для категорий и причин').click();

                        tester.form.combobox().withFieldLabel('Из какого поля передавать категорию продаж').
                            option('Пятое поле для категорий и причин').click();
                    });

                    it('Нажимаю на кнпоку "Сохранить". Отправляется запрос сохранения.', function() {
                        tester.form.combobox().withFieldLabel('Из какого поля передавать категорию продаж').
                            option('Шестое поле для категорий и причин').click();
                        wait(10);

                        tester.form.combobox().withFieldLabel('Из какого поля передавать категорию продаж').
                            clickArrow();
                        wait(10);

                        tester.form.combobox().withFieldLabel('Из какого поля передавать причину отказа').clickArrow().
                            option('Первое поле для категорий и причин').click();
                        tester.form.combobox().withFieldLabel('Из какого поля передавать причину отказа').
                            option('Пятое поле для категорий и причин').click();
                        wait(10);

                        tester.form.combobox().withFieldLabel('Из какого поля передавать причину отказа').clickArrow();
                        wait(10);

                        tester.saveButton.click();
                        wait(10);

                        tester.requestAmocrmDataSave().setSaleCategoryUserFieldValueIds().
                            setLossReasonUserFieldValueId().send();
                        tester.requestTariffs().send();
                    });
                    it('Опции доступны.', function() {
                        tester.boundList.expectNotToHaveClass('cm-multi-select-field-options-disabled');
                    });
                });
                it('Опции заблокированы.', function() {
                    tester.boundList.expectToHaveClass('cm-multi-select-field-options-disabled');
                });
            });
            it('Опции доступны.', function() {
                tester.boundList.expectNotToHaveClass('cm-multi-select-field-options-disabled');
            });
        });
        it('Открываю вкладку "Ответственные". Открываю вкладку "Исходящие звонки".', function() {
            tester.tabPanel.tab('Ответственные').click();
            wait(10);
            tester.requestResponsibles().send();
            wait(10);

            tester.innerTab('Исходящие звонки').mousedown();
            wait(10);
        });
        it('Открываю вкладку "Дополнительные поля".', function() {
            tester.tabPanel.tab('Дополнительные поля').click();
            wait(10);
            tester.requestAdditionalFields().send();
            wait(10);
            tester.requestUserFields().send();
            wait(10);
        });
        it('Открываю вкладку "Фильтр обращений".', function() {
            tester.tabPanel.tab('Фильтр обращений').click();
            wait(10);

            tester.requestEventFilters().send();
            wait(10);
        });
        it('Открываю вкладку "Телефония".', function() {
            tester.tabPanel.tab('Телефония').click();
            wait(10);
        });
        it('Открываю вкладку "Чаты и заявки".', function() {
            tester.tabPanel.tab('Чаты и заявки').click();
            wait(10);
        });
    });
    it(
        'Расширенная интеграция недоступна. Открываю раздел "Аккаунт/Интеграция/Настройка интеграции с amoCRM". ' +
        'Открываю вкладку "Мультиворонки". Первичные обращения обрабатываются вручную. При повторных обращениях ' +
        'создается сделка. Настройки доступны. Кнопка "Подключить Мультиворонки" видима. Выпадащий список воронок ' +
        'скрыт.',
    function() {
            if (tester) {
                tester.destroy();
            }

            Comagic.getApplication().setHasNotComponent('amocrm_extended_integration');
            tester = new AccountIntegrationAmocrm(args);

            Comagic.Directory.load();
            tester.batchReloadRequest().send();

            tester.actionIndex();
            tester.requestSalesFunnelComponentAvailability().send();

            tester.requestAmocrmData().send();
            tester.requestTariffs().send();
            tester.requestAmocrmStatus().send();
            wait(10);

            tester.tabPanel.tab('Мультиворонки').click();
            wait(10);

            tester.requestMultiFunnels().setFirstActManual().send();
            tester.requestSalesFunnel().send();
            tester.requestSalesFunnelStatus().send();
            wait(10);

            tester.addFunnelButton.expectToBeHiddenOrNotExist();
            tester.activateMultifunnelsButton.expectToBeVisible();
            tester.form.combobox().withValue('Некая воронка').expectToBeHiddenOrNotExist();
    });
    it(
        'Расширенная интеграция доступна. Открываю раздел "Аккаунт/Интеграция/Настройка интеграции с amoCRM". ' +
        'Открыта вкладка "Доступ к данным". Открываю вкладку "Сквозная аналитика". Изменяю поля формы. Опции доступны.',
    function() {
        if (tester) {
            tester.destroy();
        }

        tester = new AccountIntegrationAmocrm(args);

        Comagic.Directory.load();
        tester.batchReloadRequest().send();

        tester.actionIndex();
        tester.requestSalesFunnelComponentAvailability().send();
        tester.requestAmocrmData().setSaleCategories().setLossReasons().send();
        tester.requestTariffs().send();
        tester.requestAmocrmStatus().send();
        wait(10);

        tester.tabPanel.tab('Сквозная аналитика').click();
        wait(10);

        tester.requestSalesFunnels().send();
        tester.requestSelectMultiselectUserFields().send();
        wait(10);

        tester.form.combobox().withFieldLabel('Из какого поля передавать категорию продаж').
            expectToHaveValue('Второе поле для категорий и причин, Третье поле для категорий и причин');
        tester.form.combobox().withFieldLabel('Из какого поля передавать причину отказа').
            expectToHaveValue('Первое поле для категорий и причин, Четвертое поле для категорий и причин');
    });
});
