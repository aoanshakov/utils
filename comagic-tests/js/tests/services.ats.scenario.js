tests.addTest(function(args) {
    var requestsManager = args.requestsManager,
        testersFactory = args.testersFactory,
        wait = args.wait,
        utils = args.utils;

    describe((
        'Открываю раздел "Сервисы/Виртуальная АТС/Виртуальные номера и правила". Выбираю сценарий для ' +
        'редактирования.'
    ), function() {
        var helper,
            scenarioRequest,
            actionTypesRequest,
            batchReloadRequest;

        beforeEach(function() {
            if (helper) {
                helper.destroy();
            }

            helper = new ServicesAtsScenario(args);

            Comagic.Directory.load();
            batchReloadRequest = helper.batchReloadRequest().expectToBeSent();
        });

        describe('Не использую данные реального клиента.', function() {
            beforeEach(function() {
                batchReloadRequest.receiveResponse();

                helper.actionIndex({
                    recordId: 210948
                });

                wait();

                helper.actionTypesRequest().receiveResponse();

                helper.returnCodesRequest().receiveResponse();
                helper.markersTypesRequest().receiveResponse();

                scenarioRequest = helper.scenarioRequest().expectToBeSent();
            });

            describe('Сценарий не содержит опцию распределения по данным из CRM.', function() {
                beforeEach(function() {
                    scenarioRequest.receiveResponse();
                    wait();
                    wait();
                });

                describe('Выбираю действие для редактирования.', function() {
                    beforeEach(function() {
                        helper.actionIcon().withName('Меню 1').find().click();
                        wait();
                        wait();
                    });

                    describe('Нажимаю на кнопку открытия видеоинструкции.', function() {
                        beforeEach(function() {
                            helper.openVideoButton.click();
                        });

                        it('Окно с видеоинструкцией открыто.', function() {
                            helper.videoWindow.expectToBeVisible();
                        });
                        it('Нажимаю на модальную маску. Окно с видеоинструкцией закрыто.', function() {
                            helper.modalMask.click();
                            helper.videoWindow.expectToBeHiddenOrNotExist();
                        });
                        it('Нажимаю на клавишу "Escape". Окно с видеоинструкцией закрыто.', function() {
                            utils.pressEscape();
                            helper.videoWindow.expectToBeHiddenOrNotExist();
                        });
                        it('Нажимаю на кнопку открытия видеоинструкции. Окно с видеоинструкцией открыто.', function() {
                            helper.openVideoButton.click();
                            helper.videoWindow.expectToBeVisible();
                        });
                    });
                    it(
                        'Нажимаю на кнопку свертывания превью видеоинструкции. Превью видеоинструкции свернуто.',
                    function() {
                        helper.collapseVideoButton.click();
                        helper.collapseVideoButton.expectToBeHidden();
                        helper.expandVideoButton.expectToBeVisible();
                    });
                    it('Превью видеоинструкции развернуто.', function() {
                        helper.collapseVideoButton.expectToBeVisible();
                        helper.expandVideoButton.expectToBeHidden();
                        helper.videoWindow.expectToBeHiddenOrNotExist();
                    });
                });
                describe(
                    'Добавляю действие "Распределение вызовов". Добавляю к нему еще одно действие. Нажимаю на кнопку ' +
                    'сохранения. Отправлен запрос сохранения.',
                function() {
                    helper.actionIcon().withName('Меню 1').find().putMouseOver();

                    helper.addActionButton.click();
                    wait();
                    helper.component('Клавиша 4').click();
                    wait();

                    helper.tabTitle('Распределение вызовов').click();
                    wait();
                    helper.actionButton('По данным из CRM').click();
                    wait();
                    helper.button('Выбрать').click();
                    wait();
                    wait();
                    wait();

                    helper.headerCollapseArrow.click();
                    helper.actionIcon().withName('По данным из CRM 1').find().putMouseOver();
                    helper.addActionButton.click();
                    wait();

                    helper.actionReturnCodesList.row.first().combobox().withPlaceholder('Поле в CRM').click();
                    wait();
                    helper.treeNode('Сделка').expander.click();
                    wait();
                    helper.treeNode('Воронка продаж').click();
                    wait();

                    helper.actionReturnCodesList.row.first().combobox().withPlaceholder('Оператор').click();
                    wait();
                    helper.actionReturnCodesList.row.first().combobox().withPlaceholder('Оператор').
                        option('Точно соответствует').click();
                    wait();

                    helper.actionReturnCodesList.row.first().combobox().withPlaceholder('Выберите значение').click();
                    wait();
                    helper.actionReturnCodesList.row.first().combobox().withPlaceholder('Выберите значение').
                        option('Воронка').click();
                    wait();

                    helper.actionReturnCodesList.row.first().component('Добавить операцию').click();
                    wait();
                    helper.actionButton('Меню').click();
                    wait();
                    helper.button('Выбрать').click();
                    wait();
                    wait();
                    wait();

                    helper.headerCollapseArrow.click();

                    helper.button('Сохранить сценарий').click();
                    wait();
                    helper.scenarioChangingRequest().addingDistributionByCRMData().expectToBeSent();
                });
            });
            describe('Сценарий содержит опцию распределения по данным из CRM.', function() {
                beforeEach(function() {
                    scenarioRequest.includesDistributionByCrmDataAction().receiveResponse();

                    wait();
                    wait();

                    helper.actionIcon().withName('По данным из CRM 1').find().putMouseOver();
                    helper.addActionButton.click();
                    wait();
                });

                describe('Открываю выпадающий список полей с пустым значением.', function() {
                    beforeEach(function() {
                        helper.actionReturnCodesList.row.atIndex(1).combobox().withPlaceholder('Поле в CRM').click();
                        wait();
                    });

                    it(
                        'Добавляю поле без сущности. Нажимаю на кнопку "Сохранить сценарий". Сценарий сохранен.',
                    function() {
                        helper.treeNode('Сделка').expander.click();
                        wait();
                        helper.treeNode('1/2 оплаты').click();
                        wait();

                        helper.actionReturnCodesList.row.atIndex(1).combobox().withPlaceholder('Оператор').click();
                        wait();
                        helper.actionReturnCodesList.row.atIndex(1).combobox().withPlaceholder('Оператор').
                            option('Точно соответствует').click();
                        wait();

                        helper.actionReturnCodesList.row.atIndex(1).combobox().withPlaceholder('Выберите значение').
                            click();
                        wait();
                        helper.actionReturnCodesList.row.atIndex(1).combobox().withPlaceholder('Выберите значение').
                            option('Допродажи').click();
                        wait();

                        helper.actionReturnCodesList.row.atIndex(1).component('Добавить операцию').click();
                        wait();
                        helper.actionButton('Голосовая почта').click();
                        wait();
                        helper.button('Выбрать').click();
                        wait();
                        wait();
                        wait();

                        helper.headerCollapseArrow.click();

                        helper.button('Сохранить сценарий').click();
                        wait();
                        helper.scenarioChangingRequest().addingSecondCrmField().expectToBeSent();
                    });
                    it(
                        'Добавляю поле с сущностью. Нажимаю на кнопку "Сохранить сценарий". Сценарий сохранен.',
                    function() {
                        helper.treeNode('Контакт').expander.click();
                        wait();
                        helper.treeNode('UTM_CAMPAIGN').click();
                        wait();

                        helper.actionReturnCodesList.row.atIndex(1).combobox().withPlaceholder('Оператор').click();
                        wait();
                        helper.actionReturnCodesList.row.atIndex(1).combobox().withPlaceholder('Оператор').
                            option('Точно соответствует').click();
                        wait();

                        helper.actionReturnCodesList.row.atIndex(1).textfield().withPlaceholder('Введите значение').
                            fill('UIS');
                        wait();

                        helper.actionReturnCodesList.row.atIndex(1).component('Добавить операцию').click();
                        wait();
                        helper.actionButton('Голосовая почта').click();
                        wait();
                        helper.button('Выбрать').click();
                        wait();
                        wait();
                        wait();

                        helper.headerCollapseArrow.click();

                        helper.button('Сохранить сценарий').click();
                        wait();
                        helper.scenarioChangingRequest().addingSecondCrmFieldWithEntity().expectToBeSent();
                    });
                });
                it('Открываю выпадающий список полей с непустым значением. Выбранное поле отмечено.', function() {
                    helper.actionReturnCodesList.row.first().combobox().withValue('Воронка продаж').click();
                    wait();

                    helper.treeNode('Сделка').expectToBeExpanded();
                    helper.treeNode('Воронка продаж').expectToBeSelected();
                    helper.treeNode('UTM_CAMPAIGN').expectNotToBeSelected();
                    helper.treeNode('Контакт').expectToBeCollapsed();
                });
            });
            describe('Сценарий содержит опцию распределения по данным из CRM и поле с сущностью.', function() {
                beforeEach(function() {
                    scenarioRequest.includesCrmFieldWithEntity().receiveResponse();

                    wait();
                    wait();
                });

                describe('Меняю тип интерфейса. Открываю настройки распределения.', function() {
                    beforeEach(function() {
                        helper.scenarioTreeTypeButton.click();

                        helper.actionIcon().withName('По данным из CRM 1').find().click();
                        wait();
                        wait();
                    });

                    describe(
                        'Выбираю поле и оператор, ввожу значение. Добавляю связь с операцией.',
                    function() {
                        beforeEach(function() {
                            helper.actionReturnCodesList.row.atIndex(1).combobox().withPlaceholder('Поле в CRM').click();
                            wait();
                            helper.treeNode('Сделка').expander.click();
                            wait();
                            helper.treeNode('UTM_CONTENT').click();
                            wait();

                            helper.actionReturnCodesList.row.atIndex(1).combobox().withPlaceholder('Оператор').click();
                            wait();
                            helper.actionReturnCodesList.row.atIndex(1).combobox().withPlaceholder('Оператор').
                                option('Точно соответствует').click();
                            wait();

                            helper.actionReturnCodesList.row.atIndex(1).textfield().withPlaceholder('Введите значение').
                                fill('qwe123');
                            wait();

                            helper.actionReturnCodesList.row.atIndex(1).component('Добавить операцию').click();
                            wait();
                            helper.actionTypesRequest().receiveResponse();

                            helper.menuItem('Связать с операцией...').click();
                            wait();
                        });

                        it('Поле и оператор выбраны.', function() {
                            /*helper.actionReturnCodesList.row.atIndex(1).combobox().withValue('Точно соответствует').
                                expectToBeVisible();

                            helper.actionReturnCodesList.row.atIndex(1).combobox().withValue('UTM_CONTENT').
                                expectToBeVisible();
                            */
                        });
                    });
                    it('Отображается значение введенное в поле.', function() {
                        helper.actionReturnCodesList.row.first().
                            expectTextContentToHaveSubstring('Поле "Контакт/UTM_CAMPAIGN" точно соответствует "UIS"');
                    });
                });
                it('Открываю настройки распределения. Выбранное поле отмечено.', function() {
                    helper.actionIcon().withName('По данным из CRM 1').find().putMouseOver();
                    helper.addActionButton.click();
                    wait();

                    helper.actionReturnCodesList.row.first().combobox().withValue('UTM_CAMPAIGN').click();
                    wait();

                    helper.treeNode('Сделка').expectToBeCollapsed();
                    helper.treeNode('Контакт').expectToBeExpanded();
                    helper.treeNode('UTM_CONTENT').expectNotToBeSelected();
                    helper.treeNode('UTM_CAMPAIGN').expectToBeSelected();
                });
            });
            describe(
                'Сценарий содержит опцию распределения по данным из CRM с двумя кодами.',
            function() {
                beforeEach(function() {
                    scenarioRequest.includesDistributionByCrmDataAction().includesTwoCrmFields().receiveResponse();
                    wait();
                    wait();
                });

                it(
                    'Открываю окно редактирования распределения. Открываю выпадающий список полей. Нужное поле ' +
                    'выбрано.',
                function() {
                    helper.actionIcon().withName('По данным из CRM 1').find().putMouseOver();
                    helper.addActionButton.click();
                    wait();

                    helper.actionReturnCodesList.row.atIndex(1).combobox().withValue('1/2 оплаты').click();
                    wait();

                    helper.treeNode('Сделка').expectToBeExpanded();
                    helper.treeNode('Воронка продаж').expectNotToBeSelected();
                    helper.treeNode('1/2 оплаты').expectToBeSelected();
                    helper.treeNode('Контакт').expectToBeCollapsed();
                });
                it('Добавляю элемент меню. Нажимаю на кнопку "Сохранить сценарий". Сценарий сохранен.', function() {
                    helper.actionIcon().withName('Меню 2').find().putMouseOver();

                    helper.addActionButton.click();
                    wait();
                    helper.component('Клавиша 5').click();
                    wait();

                    helper.actionButton('Голосовая почта').click();
                    wait();
                    helper.button('Выбрать').click();
                    wait();
                    wait();
                    wait();

                    helper.headerCollapseArrow.click();

                    helper.button('Сохранить сценарий').click();
                    wait();
                    helper.scenarioChangingRequest().addingSecondVoiceMail().expectToBeSent();
                });
            });
        });
        describe('Не использую данные реального клиента. Для воронки указана сущность.', function() {
            beforeEach(function() {
                batchReloadRequest.salesFunnelWithEntity().receiveResponse();

                helper.actionIndex({
                    recordId: 210948
                });

                wait();

                helper.actionTypesRequest().receiveResponse();

                helper.returnCodesRequest().receiveResponse();
                helper.markersTypesRequest().receiveResponse();
            });

            describe(
                'В сценарии присутствует распределение по данным из CRM. В качестве поля в CRM выбрана воронка. ' +
                'Открываю настройки распределения.',
            function() {
                beforeEach(function() {
                    helper.scenarioRequest().includesDistributionByCrmDataAction().salesFunnelWithEntity().
                        receiveResponse();
                    wait();
                    wait();

                    helper.scenarioTreeTypeButton.click();

                    helper.actionIcon().withName('По данным из CRM 1').find().click();
                    wait();
                    wait();
                });

                it('Выбираю другое поле. Нажимаю на кнпоку "Сохранить сценарий". Сценарий сохранен.', function() {
                    helper.actionReturnCodesList.row.first().distributionItemNames.click();

                    helper.actionReturnCodesList.row.first().combobox().withValue('Воронка продаж').click();
                    wait();
                    helper.treeNode('1/2 оплаты').click();
                    wait();

                    helper.headerCollapseArrow.click();

                    helper.button('Создать').click();
                    wait();

                    helper.scenarioChangingRequest().updateCRMField().expectToBeSent();
                });
                it('Добавляю еще одно поле. Выбранное поле отображено.', function() {
                    helper.actionReturnCodesList.row.atIndex(1).combobox().withPlaceholder('Поле в CRM').click();
                    wait();
                    helper.treeNode('Сделка').expander.click();
                    wait();
                    helper.treeNode('1/2 оплаты').click();
                    wait();

                    helper.actionReturnCodesList.row.atIndex(1).combobox().withPlaceholder('Оператор').click();
                    wait();
                    helper.actionReturnCodesList.row.atIndex(1).combobox().withPlaceholder('Оператор').
                        option('Точно соответствует').click();
                    wait();

                    helper.actionReturnCodesList.row.atIndex(1).combobox().withPlaceholder('Выберите значение').
                        click();
                    wait();
                    helper.actionReturnCodesList.row.atIndex(1).combobox().withPlaceholder('Выберите значение').
                        option('Допродажи').click();
                    wait();

                    helper.actionReturnCodesList.row.atIndex(1).component('Добавить операцию').click();
                    wait();

                    helper.actionTypesRequest().receiveResponse();

                    helper.menuItem('Голосовая почта').click();
                    wait();

                    helper.actionReturnCodesList.row.atIndex(1).
                        expectTextContentToHaveSubstring('Поле "Сделка/1/2 оплаты" точно соответствует "Допродажи"');
                });
                it('Выбранное поле отображено.', function() {
                    helper.actionReturnCodesList.row.first().
                        expectTextContentToHaveSubstring('Поле "Сделка/Воронка продаж" точно соответствует "Воронка"');
                });
            });
            it(
                'В сценарии отсутствует распределение по данным из CRM. Добавляю распределение с воронкой. Нажимаю ' +
                'на кнопку "Сохранить сценарий". Сценарий сохраняется.',
            function() {
                helper.scenarioRequest().receiveResponse();
                wait();
                wait();

                helper.actionIcon().withName('Меню 1').find().putMouseOver();

                helper.addActionButton.click();
                wait();
                helper.component('Клавиша 4').click();
                wait();

                helper.tabTitle('Распределение вызовов').click();
                wait();
                helper.actionButton('По данным из CRM').click();
                wait();
                helper.button('Выбрать').click();
                wait();
                wait();
                wait();

                helper.headerCollapseArrow.click();
                helper.actionIcon().withName('По данным из CRM 1').find().putMouseOver();
                helper.addActionButton.click();
                wait();

                helper.actionReturnCodesList.row.first().combobox().withPlaceholder('Поле в CRM').click();
                wait();
                helper.treeNode('Сделка').expander.click();
                wait();
                helper.treeNode('Воронка продаж').click();
                wait();

                helper.actionReturnCodesList.row.first().combobox().withPlaceholder('Оператор').click();
                wait();
                helper.actionReturnCodesList.row.first().combobox().withPlaceholder('Оператор').
                option('Точно соответствует').click();
                wait();

                helper.actionReturnCodesList.row.first().combobox().withPlaceholder('Выберите значение').click();
                wait();
                helper.actionReturnCodesList.row.first().combobox().withPlaceholder('Выберите значение').
                option('Воронка').click();
                wait();

                helper.actionReturnCodesList.row.first().component('Добавить операцию').click();
                wait();
                helper.actionButton('Меню').click();
                wait();
                helper.button('Выбрать').click();
                wait();
                wait();
                wait();

                helper.headerCollapseArrow.click();

                helper.button('Сохранить сценарий').click();
                wait();
                helper.scenarioChangingRequest().addingDistributionByCRMData().salesFunnelWithEntity().expectToBeSent();
            });
        });
        it(
            'Не использую данные реального клиента. Одна из сущностей содержит только одно поле. Открываю настройки ' +
            'распределения. Выбранное поле отмечено.',
        function() {
            batchReloadRequest.onlyOneContactField().receiveResponse();

            helper.actionIndex({
                recordId: 210948
            });

            wait();

            helper.actionTypesRequest().receiveResponse();

            helper.returnCodesRequest().receiveResponse();
            helper.markersTypesRequest().receiveResponse();

            helper.scenarioRequest().includesCrmFieldWithEntity().receiveResponse();
            wait();
            wait();

            helper.actionIcon().withName('По данным из CRM 1').find().putMouseOver();
            helper.addActionButton.click();
            wait();

            helper.actionReturnCodesList.row.first().combobox().withValue('UTM_CAMPAIGN').click();
            wait();

            helper.treeNode('Сделка').expectToBeCollapsed();
            helper.treeNode('Контакт').expectToBeExpanded();
            helper.treeNode('UTM_CAMPAIGN').expectToBeSelected();
        });
        it(
            'Не использую данные реального клиента. Одно из текстовых полей не имеет ни одного допустимого значения. ' +
            'Меняю тип интерфейса. Открываю настройки распределения. Значение введенное в поле не отображается.',
        function() {
            batchReloadRequest.noAvailableValue().receiveResponse();

            helper.actionIndex({
                recordId: 210948
            });

            wait();

            helper.actionTypesRequest().receiveResponse();

            helper.returnCodesRequest().receiveResponse();
            helper.markersTypesRequest().receiveResponse();

            scenarioRequest = helper.scenarioRequest().expectToBeSent();
            scenarioRequest.includesCrmFieldWithEntity().receiveResponse();

            wait();
            wait();
            helper.scenarioTreeTypeButton.click();

            helper.actionIcon().withName('По данным из CRM 1').find().click();
            wait();
            wait();

            helper.actionReturnCodesList.row.first().
                expectTextContentToHaveSubstring('Поле "Контакт/UTM_CAMPAIGN" точно соответствует ""');
        });
        it(
            'Использую данные реального клиента. Изменяю сценарий. Нажимаю на кнопку сохранения. Сценарий сохраняется.',
        function() {
            batchReloadRequest.app59274Request().receiveResponse();

            helper.actionIndex({
                recordId: 210948
            });

            wait();

            actionTypesRequest = helper.actionTypesRequest().expectToBeSent();

            actionTypesRequest.app59274().receiveResponse();
            helper.returnCodesRequest().app59274().receiveResponse();
            helper.markersTypesRequest().receiveResponse();

            helper.scenarioRequest().app59274().receiveResponse();
            wait();
            wait();

            helper.actionIcon().withName('Оплаченный1').find().putMouseOver();
            helper.addActionButton.click();
            wait();

            helper.component('Постобработка звонка сотрудником').click();
            wait();
            wait();
            wait();

            helper.headerCollapseArrow.click();

            helper.button('Сохранить сценарий').click();
            wait();
            helper.scenarioChangingRequest().addProstprocessForApp59274().expectToBeSent();
        });
        it(
            'Использую данные реального клиента, у которого возникли проблемы с открытием выпадающего списка полей ' +
            'CRM. Ошибка воспроизводится.',
        function() {
            batchReloadRequest.app24913Request().receiveResponse();

            helper.actionIndex({
                recordId: 210948
            });

            wait();

            helper.actionTypesRequest().receiveResponse();

            helper.returnCodesRequest().receiveResponse();
            helper.markersTypesRequest().receiveResponse();

            helper.scenarioRequest().receiveResponse();

            wait();
            wait();

            helper.actionIcon().withName('Меню 1').find().putMouseOver();

            helper.addActionButton.click();
            wait();
            helper.component('Клавиша 4').click();
            wait();

            helper.tabTitle('Распределение вызовов').click();
            wait();
            helper.actionButton('По данным из CRM').click();
            wait();
            helper.button('Выбрать').click();
            wait();
            wait();
            wait();

            helper.headerCollapseArrow.click();
            helper.actionIcon().withName('По данным из CRM 1').find().putMouseOver();
            helper.addActionButton.click();
            wait();

            helper.actionReturnCodesList.row.first().combobox().withPlaceholder('Поле в CRM').click();
            wait();

            helper.treeNode('Лид').expander.click();
            wait();

            utils.expectExtErrorToOccur('Discontiguous range would result from inserting 10 nodes at 10', function () {
                helper.treeNode('Сделка').expander.click();
            });
        });
    });
});
