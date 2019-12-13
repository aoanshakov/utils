tests.addTest(function(requestsManager, testersFactory, wait, utils) {
    var tester;
    
    beforeEach(function() {
        tester = new EasystartAmocrm(requestsManager, testersFactory, utils);
    });

    describe(
        'Открываю страницу легкого входа amoCRM. Нажимаю на кнопку "Тестировать бесплатно". Нажимаю на кнопку ' +
        '"Продолжить". Выбираю сотрудников. Нажимаю на кнопку "Продолжить". Нажимаю на кнопку "По очереди". Ввожу ' +
        'номер телефона. Нажимаю на кнопку "Код из SMS". Ввожу код. Нажимаю на кнопку "Подтвердить". Ввожу время ' +
        'дозвона. Нажимаю на кнопку "Продолжить".',
    function() {
        beforeEach(function() {
            EasyStart.getApplication().checkIfPartnerReady();
            wait(10);

            tester.settingsStep('Номер телефона').nextButton().click();
            tester.requestSyncEmployees().setDone().send();
            tester.requestEmployees().send();
            wait(10);

            tester.employeesGrid.row().atIndex(1).column().first().checkbox().click();
            tester.employeesGrid.row().first().column().first().checkbox().click();
            tester.employeesGrid.row().atIndex(3).column().first().checkbox().click();
            tester.employeesGrid.row().atIndex(2).column().first().checkbox().click();
            wait(10);

            tester.settingsStep('Сотрудники').nextButton().click();
            wait(10);

            tester.requestChooseEmployees().send();
            wait(10);

            tester.sequentialForwardingTypeButton().click();
            wait(10);

            tester.employeePhoneField().input('9161234567');
            wait(10);

            tester.receiveSmsButton.click();
            tester.requestSms().send();
            wait(10);

            wait(10);

            tester.smsCodeField().input('1234');
            wait(10);

            tester.confirmNumberButton.click();

            tester.requestCodeInput().send();
            wait(10);

            tester.dialTimeField().fill('15');
            wait(10);

            tester.settingsStep('Правила обработки вызовов').
                nextButton().click();
            wait(10);
        });
        
        describe('Пользователь заходит в легкий вход впервые.', function() {
            beforeEach(function() {
                tester.requestCallProcessingConfig().setNoNextStepParams().send();
                wait(10);
            });

            describe('Открываю вкладку "Мультиворонки". Выбираю воронку.', function() {
                beforeEach(function() {
                    tester.integrationSettingsTabpanel.
                        tab('Мультиворонки').click();
                    wait(10);

                    tester.integrationConfigForm.combobox().withFieldLabel('Создавать сделку в воронке').clickArrow().
                        option('Другая воронка').click();
                    wait(10);
                });

                it(
                    'В выпадающем списке этапов отсутствуют этапы, которые не относятся к выбранной воронке.',
                function() {
                    tester.integrationConfigForm.combobox().withFieldLabel('Создавать сделку в этапе').clickArrow().
                        option('Некий статус').expectNotToExist();
                    tester.integrationConfigForm.combobox().withFieldLabel('Создавать сделку в этапе').clickArrow().
                        option('Другой статус').expectToExist();
                });
                it(
                    'Выбираю другую воронку. В выпадающем списке этапов отсутствуют этапы, которые не относятся к ' +
                    'выбранной воронке.',
                function() {
                    tester.integrationConfigForm.combobox().withFieldLabel('Создавать сделку в воронке').clickArrow().
                        option('Некая воронка').click();
                    wait(10);

                    tester.integrationConfigForm.combobox().withFieldLabel('Создавать сделку в этапе').clickArrow().
                        option('Некий статус').expectToExist();
                    tester.integrationConfigForm.combobox().withFieldLabel('Создавать сделку в этапе').clickArrow().
                        option('Другой статус').expectNotToExist();
                });
            });
            describe('Открываю вкладку "Дополнительные поля".', function() {
                beforeEach(function() {
                    tester.integrationSettingsTabpanel.
                        tab('Дополнительные поля').click();
                    wait(10);
                });

                it('Выбираю опцию, отличную от опции "Виртульный номер". Опция не выбрана.', function() {
                    tester.integrationConfigForm.combobox().
                        withFieldLabel('В дополнительное поле amoCRM').
                        clickArrow().
                        option('Это поле').
                        click();
                    wait(10);

                    tester.integrationConfigForm.combobox().withFieldLabel('В дополнительное поле amoCRM').
                        expectToHaveValue('');
                });
                it('Выбираю опцию Виртульный номер". Опция выбрана.', function() {
                    tester.integrationConfigForm.combobox().
                        withFieldLabel('В дополнительное поле amoCRM').
                        clickArrow().
                        option('Виртуальный номер').
                        click();
                    wait(10);

                    tester.integrationConfigForm.combobox().withFieldLabel('В дополнительное поле amoCRM').
                        expectToHaveValue('Виртуальный номер');
                });
                it('Опция отличная от опции "Виртульный номер" выделена серым цветом.', function() {
                    tester.integrationConfigForm.combobox().
                        withFieldLabel('В дополнительное поле amoCRM').
                        clickArrow().
                        option('Это поле').
                        expectToHaveClass('easystart-grey-text');
                });
                it('Опция "Виртульный номер" не выделена серым цветом.', function() {
                    tester.integrationConfigForm.combobox().
                        withFieldLabel('В дополнительное поле amoCRM').
                        clickArrow().
                        option('Виртуальный номер').
                        expectNotToHaveClass('easystart-grey-text');
                });
            });
            it('В полях настроек интеграции установлены значения по умолчанию.', function() {
                tester.integrationConfigForm.combobox().
                    withFieldLabel('Для первичных обращений').
                    expectToHaveValue('Создать сделку и контакт');

                tester.integrationSettingsTabpanel.
                    tab('Потерянные обращения').click();
                wait(10);

                tester.integrationConfigForm.combobox().
                    withFieldLabel('Ответственный за потерянные звонки').
                    expectToHaveValue('Чиграков Марк (Менеджер)');


                tester.integrationConfigForm.combobox().
                    withFieldLabel('Срок задачи').
                    expectToHaveValue('Весь день');
            });
            describe('Открываю вкладку "Тегирование".', function() {
                beforeEach(function() {
                    tester.integrationSettingsTabpanel.
                        tab('Тегирование').click();
                    wait(10);
                });

                it(
                    'Выбираю в выпадающем списке тегов опцию отличную от опции "Виртульный номер". Тег не добавлен.',
                function() {
                    tester.successfulCallsTagsCombo().clickArrow().option('Тэг номер одиннадцать').click();
                    wait(10);

                    tester.tagRemoveTool('Тэг номер одиннадцать').expectNotToExist();
                });
                it(
                    'Выбираю в выпадающем списке тегов опцию "Виртульный номер". Тег добавлен.',
                function() {
                    tester.successfulCallsTagsCombo().clickArrow().option('Виртуальный номер').click();
                    wait(10);
                    
                    tester.tagRemoveTool('Виртуальный номер').expectToExist();
                });
                it('Опция отличная от опции "Виртуальный номер" выделена серым цветом.', function() {
                    tester.successfulCallsTagsCombo().clickArrow().option('Тэг номер одиннадцать').
                        expectToHaveClass('easystart-grey-text');
                });
                it('Опция "Виртуальный номер" не выделена серым цветом.', function() {
                    tester.successfulCallsTagsCombo().clickArrow().option('Виртуальный номер').
                        expectNotToHaveClass('easystart-grey-text');
                });
                describe('Ввожу в один из выпадающих списков тег, отсутсвующий в списке.', function() {
                    beforeEach(function() {
                        tester.successfulCallsTagsCombo().input('Тэг номер один');
                        wait(10);
                        tester.addSuccessfulCallTagButton.click();
                        wait(10);
                    });

                    it('Тег добавлен.', function() {
                        tester.successfulCallsTagRemoveTool('Тэг номер один').expectToExist();
                    });
                    it('Выбираю в другом выпадающем списке введенный ране тег. Тег добавлен.', function() {
                        tester.lostCallsTagsCombo().clickArrow().option('Тэг номер один').click();
                        wait(10);

                        tester.lostCallsTagRemoveTool('Тэг номер один').expectToExist();
                    });
                    it('В другом выпадающем списке введенный ране тег не отмечен серым.', function() {
                        tester.lostCallsTagsCombo().clickArrow().option('Тэг номер один').
                            expectNotToHaveClass('easystart-grey-text');
                    });
                });
            });
            it(
                'Заполняю поля настроек интеграции. Нажимаю на кнопку "Продолжить". На сервер отправлены значения, ' +
                'установленные для полей.',
            function() {
                tester.integrationSettingsTabpanel.
                    tab('Потерянные обращения').click();
                wait(10);

                tester.integrationConfigForm.combobox().
                    withFieldLabel('Ответственный за потерянные звонки').
                    clickArrow().
                    option('Закиров Эдуард (Менеджер)').
                    click();
                wait(10);

                tester.integrationSettingsTabpanel.
                    tab('Тегирование').click();
                wait(10);

                tester.successfulCallsTagsCombo().input('Тэг номер один');
                wait(10);
                tester.addSuccessfulCallTagButton.click();
                wait(10);

                tester.successfulCallsTagsCombo().input('Тэг номер два');
                wait(10);
                tester.addSuccessfulCallTagButton.click();
                wait(10);

                tester.lostCallsTagsCombo().input('Тэг номер три');
                wait(10);
                tester.addLostCallTagButton.click();
                wait(10);

                tester.lostCallsTagsCombo().input('Тэг номер четыре');
                wait(10);
                tester.addLostCallTagButton.click();
                wait(10);

                tester.integrationSettingsTabpanel.
                    tab('Дополнительные поля').click();
                wait(10);

                tester.integrationConfigForm.combobox().
                    withFieldLabel('Передавать значение из UIS').
                    clickArrow();
                wait(10);

                tester.uisFieldExpander.click();
                wait(10);
                tester.uisFieldRow.click();
                wait(10);

                tester.integrationConfigForm.combobox().
                    withFieldLabel('В дополнительное поле amoCRM').
                    clickArrow().
                    option('Это поле').
                    click();
                wait(10);

                tester.settingsStep('Настройка интеграции').nextButton().click();
                wait(10);

                tester.requestIntegrationConfig().send();
                tester.requestAnswers().send();
            });
        });
        it(
            'В соответствии с данными, полученными от сервера опция "Использовать функциональность "Неразобранное"" ' +
            'должна быть выбрана и заблокирована. При наведении курсора мыши на опцию "Использовать функциональность ' +
            '"Неразобранное"" отображается сообщение о невозможности сохранения изменений.',
        function() {
            tester.requestCallProcessingConfig().setUnsorted().send();
            wait(10);

            tester.integrationConfigForm.combobox().
                withFieldLabel('Для первичных обращений').clickArrow().
                option('Использовать функциональность "Неразобранное"').
                expectTooltipWithText(
                    'Невозможно сохранить изменения, так как в личном кабинете amoCRM "Неразобранное" ' +
                    'деактивировано. Активируйте "Неразобранное" в личном кабинете amoCRM и попробуйте снова или ' +
                    'отключите использование "Неразобранного" в настройках интеграции.'
                ).toBeShownOnMouseOver();
        });
        describe(
            'В соответствии с данными, полученными от сервера опция "Использовать функциональность "Неразобранное"" ' +
            'должна быть доступна.',
        function() {
            beforeEach(function() {
                tester.requestCallProcessingConfig().setUnsortedEnabled().send();
                wait(10);
            });
            
            it(
                'При наведении курсора мыши на опцию "Обрабатывать вручную" не отображается всплывающее сообщение.',
            function() {
                tester.integrationConfigForm.combobox().
                    withFieldLabel('Для первичных обращений').clickArrow().
                    option('Использовать функциональность "Неразобранное"').
                    expectNoTooltipToBeShownOnMouseOver();
            });
            it('Опция "Использовать функциональность "Неразобранное"" не выделена серым цветом.', function() {
                tester.integrationConfigForm.combobox().
                    withFieldLabel('Для первичных обращений').clickArrow().
                    option('Использовать функциональность "Неразобранное"').
                    expectNotToHaveClass('easystart-grey-text');
            });
            it('Опцию "Использовать функциональность "Неразобранное"" можно выбрать.', function() {
                tester.integrationConfigForm.combobox().
                    withFieldLabel('Для первичных обращений').clickArrow().
                    option('Использовать функциональность "Неразобранное"').
                    click();

                tester.integrationConfigForm.combobox().
                    withFieldLabel('Для первичных обращений').
                    expectToHaveValue('Использовать функциональность "Неразобранное"');
            });
        });
        describe(
            'В соответствии с данными, полученными от сервера один из выбранных ранее тегов является динамическим. ' +
            'Открываю вкладку "Тегирование"',
        function() {
            beforeEach(function() {
                tester.requestCallProcessingConfig().addDynamicalTag().send();
                wait(10);

                tester.integrationSettingsTabpanel.tab('Тегирование').click();
                wait(10);
            });

            it('Выбранные ранее теги не являющиеся динамическими присутствуют в выпадающем списке тегов.', function() {
                tester.successfulCallsTagsCombo().clickArrow().option('Тэг номер один').expectToExist();
            });
            it('Выбранные ранее теги являющиеся динамическими отсутсвтуют в выпадающем списке тегов.', function() {
                tester.successfulCallsTagsCombo().clickArrow().option('{{virtual_phone_number}}').expectNotToExist();
            });
        });
        describe(
            'В соответствии с данными, полученными от сервера опция "Использовать функциональность "Неразобранное"" ' +
            'должна быть заблокирована.',
        function() {
            beforeEach(function() {
                tester.requestCallProcessingConfig().send();
                wait(10);
            });

            it('Опция "Использовать функциональность "Неразобранное"" отмечена серым цветом.', function() {
                tester.integrationConfigForm.combobox().
                    withFieldLabel('Для первичных обращений').clickArrow().
                    option('Использовать функциональность "Неразобранное"').
                    expectToHaveClass('easystart-grey-text');
            });
            it('Опцию "Обрабатывать вручную" можно выбрать.', function() {
                tester.integrationConfigForm.combobox().
                    withFieldLabel('Для первичных обращений').clickArrow().
                    option('Обрабатывать вручную').
                    click();

                tester.integrationConfigForm.combobox().
                    withFieldLabel('Для первичных обращений').
                    expectToHaveValue('Обрабатывать вручную');
            });
            it('Опцию "Использовать функциональность "Неразобранное"" невозможно выбрать.', function() {
                tester.integrationConfigForm.combobox().
                    withFieldLabel('Для первичных обращений').clickArrow().
                    option('Использовать функциональность "Неразобранное"').
                    click();

                tester.integrationConfigForm.combobox().
                    withFieldLabel('Для первичных обращений').
                    expectToHaveValue('Создать сделку');
            });
            it(
                'При наведении курсора мыши на опцию "Обрабатывать вручную" не отображается всплывающее сообщение.',
            function() {
                tester.integrationConfigForm.combobox().
                    withFieldLabel('Для первичных обращений').clickArrow().
                    option('Обрабатывать вручную').
                    expectNoTooltipToBeShownOnMouseOver();
            });
            it(
                'При наведении курсора мыши на опцию "Использовать функциональность "Неразобранное"" отображается ' +
                'сообщение о неактивности опции.',
            function() {
                tester.integrationConfigForm.combobox().
                    withFieldLabel('Для первичных обращений').clickArrow().
                    option('Использовать функциональность "Неразобранное"').
                    expectTooltipWithText(
                        'Неразобранное неактивно на уровне аккаунта в amoCRM. Для использования данного функционала ' +
                        'активируйте его в amoCRM.'
                    ).toBeShownOnMouseOver();
            });
            it(
                'Открываю вкладку "Тегирование". Изменяю значение полей для ввода тегов. Нажимаю на кнпоку ' +
                '"Продолжить". На сервер отправлены выбранные теги.',
            function() {
                tester.integrationSettingsTabpanel.
                    tab('Тегирование').click();
                wait(10);

                tester.tagRemoveTool('Тэг номер один').click();
                wait(10);
                tester.tagRemoveTool('Тэг номер четыре').click();
                wait(10);
                
                tester.successfulCallsTagsCombo().clickArrow().
                    option('Тэг номер четыре').click();
                wait(10);
                tester.successfulCallsTagsCombo().input('Еще один тег');
                wait(10);
                tester.addSuccessfulCallTagButton.click();
                wait(10);

                tester.lostCallsTagsCombo().clickArrow().
                    option('Виртуальный номер').click();
                wait(10);
                tester.lostCallsTagsCombo().input('Какой-то тег');
                wait(10);
                tester.addLostCallTagButton.click();
                wait(10);

                tester.settingsStep('Настройка интеграции').
                    nextButton().click();
                wait(10);
                tester.requestIntegrationConfig().changeTags().send();
                tester.requestAnswers().send();
            });
            it('Поля настроек интеграции заполнены значениями, полученными от сервера.', function() {
                tester.integrationConfigForm.combobox().
                    withFieldLabel('Для первичных обращений').
                    expectToHaveValue('Создать сделку');

                tester.integrationSettingsTabpanel.
                    tab('Потерянные обращения').click();
                wait(10);

                tester.integrationConfigForm.combobox().
                    withFieldLabel('Ответственный за потерянные звонки').
                    expectToHaveValue('Закиров Эдуард (Менеджер)');

                tester.integrationConfigForm.combobox().
                    withFieldLabel('Срок задачи').
                    expectToHaveValue('Некий срок');

                tester.integrationSettingsTabpanel.
                    tab('Дополнительные поля').click();
                wait(10);

                tester.integrationConfigForm.combobox().
                    withFieldLabel('Передавать значение из UIS').
                    expectToHaveValue('Другое поле');

                tester.integrationConfigForm.combobox().
                    withFieldLabel('В дополнительное поле amoCRM').
                    expectToHaveValue('Это поле');
            });
        });
    });
});
