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

            helper = new ServicesAtsScenarioEditPage(args);

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

                describe('Открываю окно выбора действия.', function() {
                    beforeEach(function() {
                        helper.scenarioTreeTypeButton.click();

                        helper.actionIcon().withName('Меню 1').find().click();
                        wait();
                        wait();
                        helper.component('Клавиша 4').click();
                        wait();

                        helper.actionTypesRequest().receiveResponse();
                    });

                    describe('Выбираю сегмент. Выбираю связь с операцией.', function() {
                        beforeEach(function() {
                            helper.menuItem('Распределение по сегментам').click();
                            wait();
                            wait();
                            wait();

                            helper.actionReturnCodesList.row.first().combobox().withPlaceholder('Сегменты').click();
                            wait();
                            helper.treeNode('somesite.com').expander.click();
                            wait();
                            helper.treeNode('Второй сегмент').checkbox.click();
                            wait();

                            helper.actionReturnCodesList.row.first().component('Добавить операцию').click();
                            wait();
                            helper.actionTypesRequest().receiveResponse();
                            helper.menuItem('Голосовая почта').click();
                            wait();
                            wait();

                            helper.headerCollapseArrow.click();

                            helper.actionIcon().withName('Распределение по сегментам 1').find().click();
                            wait();
                            wait();

                            helper.actionReturnCodesList.row.atIndex(1).combobox().withPlaceholder('Сегменты').click();
                            wait();
                            helper.treeNode('somesite.com').expander.click();
                            wait();
                            helper.treeNode('othersite.com').expander.click();
                            wait();
                            helper.treeNode('Первый сегмент').checkbox.click();
                            wait();
                            helper.treeNode('Третий сегмент').checkbox.click();
                            wait();

                            helper.actionReturnCodesList.row.atIndex(1).component('Добавить операцию').click();
                            wait();
                            helper.actionTypesRequest().receiveResponse();
                            helper.menuItem('Связать с операцией...').click();
                            wait();
                        });

                        describe('Выбираю операцию.', function() {
                            beforeEach(function() {
                                helper.actionIcon().withName('Меню 1').find().linkAddingButton.click();
                                wait();
                            });

                            it('Нажимаю на кнопку "Создать". Отправлен запрос сохранения.', function() {
                                helper.headerCollapseArrow.click();

                                helper.button('Создать').click();
                                wait();

                                helper.scenarioChangingRequest().addingLinkToSegment().expectToBeSent();
                            });
                            it('Отображен выбранный регион.', function() {
                                helper.actionReturnCodesList.expectToHaveTextContent(
                                    'Связанные операции ' +

                                    'Сегменты Второй сегмент Голосовая почта 2 ' +
                                    'Сегменты Первый сегмент , Третий сегмент Меню 1'
                                );
                            });
                        });
                        it('Отображен выбранный регион.', function() {
                            helper.actionReturnCodesList.row.atIndex(1).combobox().
                                withValue('Первый сегмент; Третий сегмент').expectToBeVisible();
                        });
                    });
                    describe('Выбираю регион. Выбираю связь с операцией.', function() {
                        beforeEach(function() {
                            helper.menuItem('Распределение по регионам').click();
                            wait();
                            wait();
                            wait();

                            helper.actionReturnCodesList.row.first().combobox().withPlaceholder('Регионы').click();
                            wait();
                            helper.treeNode('Австралия').expander.click();
                            wait();
                            helper.treeNode('toll free').checkbox.click();
                            wait();

                            helper.actionReturnCodesList.row.first().component('Добавить операцию').click();
                            wait();
                            helper.actionTypesRequest().receiveResponse();
                            helper.menuItem('Голосовая почта').click();
                            wait();
                            wait();

                            helper.headerCollapseArrow.click();

                            helper.actionIcon().withName('Распределение по регионам 1').find().click();
                            wait();
                            wait();

                            helper.actionReturnCodesList.row.atIndex(1).combobox().withPlaceholder('Регионы').click();
                            wait();
                            helper.treeNode('Азербайджан').expander.click();
                            wait();
                            helper.treeNode('Австралия (все регионы)').checkbox.click();
                            wait();
                            helper.treeNode('Агдаш').checkbox.click();
                            wait();

                            helper.actionReturnCodesList.row.atIndex(1).component('Добавить операцию').click();
                            wait();
                            helper.actionTypesRequest().receiveResponse();
                            helper.menuItem('Связать с операцией...').click();
                            wait();
                            helper.actionIcon().withName('Меню 1').find().linkAddingButton.click();
                            wait();
                        });

                        it('Произошла ошибка из-за которой Регион не выбран.', function() {
                            helper.actionReturnCodesList.row.first().distributionItemNames.click();

                            helper.actionReturnCodesList.row.first().combobox().withValue('toll free').
                                expectNotToExist();
                        });
                        it('Нажимаю на кнопку "Создать". Отправлен запрос сохранения.', function() {
                            helper.headerCollapseArrow.click();

                            helper.button('Создать').click();
                            wait();

                            helper.scenarioChangingRequest().addingLinkToRegion().expectToBeSent();
                        });
                        it('Произошла ошибка из-за которой существует скрытое сообщение об ошибке.', function() {
                            helper.actionReturnCodesList.expectTextContentNotToHaveSubstring(
                                'Связанные операции ' +

                                'Регионы toll free Голосовая почта 2 ' +
                                'Регионы Австралия (все регионы), Агдаш Меню 1'
                            );
                        });
                    });
                    it('', function() {
                        helper.menuItem('По данным из CRM').click();
                        wait();
                        wait();
                        wait();

                        helper.actionReturnCodesList.row.first().combobox().withPlaceholder('Поле в CRM').click();
                        helper.treeNode('Сделка').expander.click();
                        helper.treeNode('UTM_CONTENT').click();

                        helper.actionReturnCodesList.row.first().combobox().withPlaceholder('Оператор').click();
                        helper.actionReturnCodesList.row.first().combobox().withPlaceholder('Оператор').
                            option('Точно соответствует').click();

                        helper.actionReturnCodesList.row.first().textfield().withPlaceholder('Введите значение').
                            fill('qwe123');

                        helper.actionReturnCodesList.row.first().component('Добавить операцию').click();
                        wait();
                        helper.actionTypesRequest().receiveResponse();
                        helper.menuItem('Голосовая почта').click();
                        wait();
                        wait();

                        helper.actionIcon().withName('По данным из CRM 1').find().click();
                        wait();
                        wait();

                        helper.actionReturnCodesList.row.first().distributionItemNames.click();
                        helper.actionReturnCodesList.row.first().textfield().withValue('qwe123').clear();
                        helper.button('Создать').click();
                        wait();

                        helper.button('OK').click();

                        helper.actionReturnCodesList.row.first().textfield().withPlaceholder('Введите значение').
                            fill('wer234');
                        helper.button('Создать').click();
                        wait();

                        helper.scenarioChangingRequest().addingDistributionByCRMData().voiceMail().expectToBeSent();
                    });
                });
                describe('Добавляю действие "Распределение вызовов".', function() {
                    beforeEach(function() {
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
                    });

                    describe('Открываю сущность.', function() {
                        beforeEach(function() {
                            helper.actionReturnCodesList.row.first().combobox().withPlaceholder('Поле в CRM').click();
                            wait();
                            helper.treeNode('Сделка').expander.click();
                            wait();
                        });
                        
                        describe('Выбираю поле.', function() {
                            beforeEach(function() {
                                helper.treeNode('Воронка продаж').click();
                                wait();

                                helper.actionReturnCodesList.row.first().combobox().withPlaceholder('Оператор').click();
                                wait();
                            });

                            it(
                                'Выбираю оператор со значением. Нажимаю на кнопку сохранения. Отправлен запрос ' +
                                'сохранения.',
                            function() {
                                helper.actionReturnCodesList.row.first().combobox().withPlaceholder('Оператор').
                                    option('Точно соответствует').click();
                                wait();

                                helper.actionReturnCodesList.row.first().combobox().
                                    withPlaceholder('Выберите значение').click();
                                wait();
                                helper.actionReturnCodesList.row.first().combobox().
                                    withPlaceholder('Выберите значение').option('Воронка').click();
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
                            it(
                                'Выбираю оператор без значения. Нажимаю на кнопку сохранения. Отправлен запрос ' +
                                'сохранения.',
                            function() {
                                helper.actionReturnCodesList.row.first().combobox().withPlaceholder('Оператор').
                                    option('Не пустое').click();
                                wait();

                                helper.actionReturnCodesList.row.first().component('Добавить операцию').click();
                                wait();

                                helper.tabTitle('Инструменты').click();

                                helper.actionButton('Голосовая почта').click();
                                wait();
                                helper.button('Выбрать').click();
                                wait();
                                wait();
                                wait();

                                helper.headerCollapseArrow.click();

                                helper.button('Сохранить сценарий').click();
                                wait();
                                helper.scenarioChangingRequest().addingCRMFieldWithoutValue().expectToBeSent();
                            });
                        });
                        it(
                            'Выбираю сущность. Выбираю оператор "Не существует". Добавляю операцию. Нажимаю на ' +
                            'кнопку "Сохранить сценарий". Сценарий сохраняется.',
                        function() {
                            helper.treeNode('Сделка').click();

                            helper.actionReturnCodesList.row.first().combobox().withPlaceholder('Оператор').click();
                            wait();

                            helper.actionReturnCodesList.row.first().combobox().withPlaceholder('Оператор').
                                option('Не существует').click();
                            wait();

                            helper.actionReturnCodesList.row.first().component('Добавить операцию').click();
                            wait();

                            helper.tabTitle('Инструменты').click();

                            helper.actionButton('Голосовая почта').click();
                            wait();
                            helper.button('Выбрать').click();
                            wait();
                            wait();
                            wait();

                            helper.headerCollapseArrow.click();

                            helper.button('Сохранить сценарий').click();
                            wait();
                            helper.scenarioChangingRequest().addingEntityField().expectToBeSent();
                        });
                    });
                    it(
                        'Нажимаю на кнопку "Добавить операцию" в строке "Ошибка при запросе к CRM". Открыто окно ' +
                        'выбора операции.',
                    function() {
                        helper.actionReturnCodesList.row.atIndex(3).component('Добавить операцию').click();
                        wait();

                        helper.tabTitle('Инструменты').click();

                        helper.actionButton('Голосовая почта').click();
                        wait();
                        helper.button('Выбрать').click();
                        wait();
                        wait();
                        wait();

                        helper.headerCollapseArrow.click();

                        helper.button('Сохранить сценарий').click();
                        wait();
                        helper.scenarioChangingRequest().addingFailProcessing().expectToBeSent();
                    });
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
                            helper.actionReturnCodesList.row.atIndex(2).combobox().withPlaceholder('Поле в CRM').
                                click();
                            wait();

                            helper.treeNode('Контакт').expander.click();
                            wait();
                            helper.treeNode('UTM_CONTENT').click();
                            wait();

                            helper.actionReturnCodesList.row.atIndex(2).combobox().withPlaceholder('Оператор').click();
                            wait();
                            helper.actionReturnCodesList.row.atIndex(2).combobox().withPlaceholder('Оператор').
                                option('Точно соответствует').click();
                            wait();

                            helper.actionReturnCodesList.row.atIndex(2).textfield().withPlaceholder('Введите значение').
                                fill('wer123');
                            wait();

                            helper.actionReturnCodesList.row.atIndex(2).component('Добавить операцию').click();
                            wait();
                            helper.actionTypesRequest().receiveResponse();

                            helper.menuItem('Голосовая почта').click();
                            wait();
                            wait();

                            helper.headerCollapseArrow.click();

                            helper.actionIcon().withName('По данным из CRM 1').find().click();
                            wait();
                            wait();

                            helper.actionReturnCodesList.row.atIndex(1).combobox().withPlaceholder('Поле в CRM').
                                click();
                            wait();
                            helper.treeNode('Контакт').expander.click();
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

                        describe('Выбираю операцию для связи.', function() {
                            beforeEach(function() {
                                helper.actionIcon().withName('Меню 1').find().linkAddingButton.click();
                            });

                            it('Нажимаю на кнопку "Создать". Отправлен запрос сохранения сценария.', function() {
                                helper.headerCollapseArrow.click();

                                helper.button('Создать').click();
                                wait();

                                helper.scenarioChangingRequest().addingLinkToCRMField().expectToBeSent();
                            });
                            it('Поле и оператор выбраны.', function() {
                                helper.actionReturnCodesList.row.atIndex(1).distributionItemNames.click();

                                helper.actionReturnCodesList.row.atIndex(1).combobox().withValue('Точно соответствует').
                                    expectToBeVisible();

                                helper.actionReturnCodesList.row.atIndex(1).combobox().withValue('UTM_CONTENT').
                                    expectToBeVisible();
                            });
                            it('Отображены выбранные поля.', function() {
                                helper.actionReturnCodesList.expectToHaveTextContent(
                                    'Связанные операции ' +

                                    'Поле "Контакт/UTM_CAMPAIGN" точно соответствует "UIS" Меню 2 ' +
                                    'Поле "Сделка/UTM_CONTENT" точно соответствует "qwe123" Меню 1 ' +
                                    'Поле "Контакт/UTM_CONTENT" точно соответствует "wer123" Голосовая почта 2 ' +
                                    'Ошибка при запросе к CRM Добавить операцию'
                                );
                            });
                        });
                        it('Поле и оператор выбраны.', function() {
                            helper.actionReturnCodesList.row.atIndex(1).combobox().withValue('UTM_CONTENT').
                                expectToBeVisible();

                            helper.actionReturnCodesList.row.atIndex(1).combobox().withValue('Точно соответствует').
                                expectToBeVisible();

                            helper.actionReturnCodesList.expectToHaveTextContent(
                                'Связанные операции ' +

                                'Поле "Контакт/UTM_CAMPAIGN" точно соответствует "UIS" Меню 2 ' +
                                'Добавить операцию ' +
                                'Поле "Контакт/UTM_CONTENT" точно соответствует "wer123" Голосовая почта 2 ' +
                                'Ошибка при запросе к CRM Добавить операцию'
                            );
                        });
                    });
                    it('Отображается значение введенное в поле.', function() {
                        helper.actionReturnCodesList.row.first().
                            expectTextContentToHaveSubstring('Поле "Контакт/UTM_CAMPAIGN" точно соответствует "UIS"');
                    });
                });
                describe('Открываю настройки распределения.', function() {
                    beforeEach(function() {
                        helper.actionIcon().withName('По данным из CRM 1').find().putMouseOver();
                        helper.addActionButton.click();
                        wait();
                    });

                    it(
                        'Добавляю условие по полю, выбираю связь с операцию. Поля настроек распределения заполнены.',
                    function() {
                        helper.actionReturnCodesList.row.atIndex(2).combobox().withPlaceholder('Поле в CRM').
                            click();
                        wait();

                        helper.treeNode('Контакт').expander.click();
                        wait();
                        helper.treeNode('UTM_CONTENT').click();
                        wait();

                        helper.actionReturnCodesList.row.atIndex(2).combobox().withPlaceholder('Оператор').click();
                        wait();
                        helper.actionReturnCodesList.row.atIndex(2).combobox().withPlaceholder('Оператор').
                            option('Точно соответствует').click();
                        wait();

                        helper.actionReturnCodesList.row.atIndex(2).textfield().withPlaceholder('Введите значение').
                            fill('wer123');
                        wait();

                        helper.actionReturnCodesList.row.atIndex(2).component('Добавить операцию').click();
                        wait();
                        helper.actionButton('Голосовая почта').click();
                        wait();
                        helper.button('Выбрать').click();
                        wait();
                        wait();
                        wait();

                        helper.headerCollapseArrow.click();
                        
                        helper.actionIcon().withName('По данным из CRM 1').find().putMouseOver();
                        helper.addActionButton.click();
                        wait();

                        helper.actionReturnCodesList.row.atIndex(1).combobox().withPlaceholder('Поле в CRM').
                            click();
                        wait();
                        helper.treeNode('Контакт').expander.click();
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
                        helper.tabTitle('Инструменты').click();
                        wait();
                        helper.actionButton('Связать с операцией').click();
                        wait();
                        helper.button('Выбрать').click();
                        wait();

                        helper.actionReturnCodesList.row.atIndex(0).combobox().withValue('UTM_CAMPAIGN').
                            expectToBeVisible();
                        helper.actionReturnCodesList.row.atIndex(0).combobox().withValue('Точно соответствует').
                            expectToBeVisible();
                        helper.actionReturnCodesList.row.atIndex(0).textfield().withValue('UIS').
                            expectToBeVisible();

                        helper.actionReturnCodesList.row.atIndex(1).combobox().withValue('UTM_CONTENT').
                            expectToBeVisible();
                        helper.actionReturnCodesList.row.atIndex(1).combobox().withValue('Точно соответствует').
                            expectToBeVisible();
                        helper.actionReturnCodesList.row.atIndex(1).textfield().withValue('qwe123').
                            expectToBeVisible();

                        helper.actionReturnCodesList.row.atIndex(2).combobox().withValue('UTM_CONTENT').
                            expectToBeVisible();
                        helper.actionReturnCodesList.row.atIndex(2).combobox().withValue('Точно соответствует').
                            expectToBeVisible();
                        helper.actionReturnCodesList.row.atIndex(2).textfield().withValue('wer123').
                            expectToBeVisible();
                    });
                    it('Выбранное поле отмечено.', function() {
                        helper.actionReturnCodesList.row.first().combobox().withValue('UTM_CAMPAIGN').click();
                        wait();

                        helper.treeNode('Сделка').expectToBeCollapsed();
                        helper.treeNode('Контакт').expectToBeExpanded();
                        helper.treeNode('UTM_CONTENT').expectNotToBeSelected();
                        helper.treeNode('UTM_CAMPAIGN').expectToBeSelected();
                    });
                });
            });
            describe('Сценарий содержит опцию распределения по данным из CRM с двумя кодами.', function() {
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
            describe(
                'В сценарии присутствует распределение по данным из CRM с условием по отсутствию сущности. Открываю ' +
                'настройки распределения.',
            function() {
                beforeEach(function() {
                    scenarioRequest.includesDistributionByCrmDataAction().includesEntityCrmField().receiveResponse();
                    wait();
                    wait();

                    helper.scenarioTreeTypeButton.click();

                    helper.actionIcon().withName('По данным из CRM 1').find().click();
                    wait();
                    wait();
                });

                it('Сущность выбрана в выпадающем списке полей.', function() {
                    helper.actionReturnCodesList.row.first().distributionItemNames.click();
                    helper.actionReturnCodesList.row.first().combobox().withValue('Сделка').click();

                    helper.treeNode('Сделка').expectToBeCollapsed();
                    helper.treeNode('Контакт').expectToBeCollapsed();
                    helper.treeNode('Сделка').expectToBeSelected();
                    helper.treeNode('Контакт').expectNotToBeSelected();
                });
                it('Отображено условие.', function() {
                    helper.actionReturnCodesList.row.first().expectTextContentToHaveSubstring('Сделка не существует');
                });
            });
            it(
                'В сценарии присутствует распределение по данным из CRM. Распределение является корневым действием. ' +
                'Меняю тип интерфейса. Действие распределения доступно.',
            function() {
                scenarioRequest.includesOnlyDistributionByCrmDataAction().receiveResponse();
                wait();
                wait();

                helper.scenarioTreeTypeButton.click();

                helper.actionIcon().withName('По данным из CRM 1').find().click();
                wait();
                wait();

                helper.actionReturnCodesList.expectToBeVisible();
            });
            it(
                'В сценарии присутствует распределение по данным из CRM с условием по значению текстового поля. ' +
                'Открываю настройки распределения. Стираю значение введенное в поле значения. Нажимаю на кноку ' +
                '"Сохранить сценарий". Отображено сообщение об ошибке.',
            function() {
                scenarioRequest.includesDistributionByCrmDataAction().includesTextCrmField().receiveResponse();
                wait();
                wait();

                helper.actionIcon().withName('По данным из CRM 1').find().putMouseOver();
                helper.addActionButton.click();
                wait();

                helper.actionReturnCodesList.row.atIndex(0).textfield().withValue('qwe123').clear();

                helper.button('Сохранить сценарий').click();
                wait();

                helper.windowText.expectToHaveTextContent('Проверьте заполненность полей');
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
        describe('Не использую данные реального клиента. Ни одно поле не получено.', function() {
            var actionTypesRequest;

            beforeEach(function() {
                batchReloadRequest.noCrmFields().receiveResponse();

                helper.actionIndex({
                    recordId: 210948
                });

                wait();

                actionTypesRequest = helper.actionTypesRequest().expectToBeSent();
            });

            describe('Интеграция не подключена.', function() {
                var scenarioRequest;

                beforeEach(function() {
                    actionTypesRequest.distributionByCrmDataUnavailable().receiveResponse();
                    helper.returnCodesRequest().receiveResponse();
                    helper.markersTypesRequest().receiveResponse();

                    scenarioRequest = helper.scenarioRequest().expectToBeSent();
                });

                describe('Распределение вложенно в другое действие.', function() {
                    beforeEach(function() {
                        scenarioRequest.includesDistributionByCrmDataAction().receiveResponse();
                        wait();
                        wait();
                    });

                    it('Меняю тип интерфейса. Действие распределения заблокировано.', function() {
                        helper.scenarioTreeTypeButton.click();

                        helper.actionIcon().withName('По данным из CRM 1').find().click();
                        wait();
                        wait();

                        helper.actionReturnCodesList.expectNotToExist();
                    });
                    it('Действие распределения заблокировано.', function() {
                        helper.actionIcon().withName('По данным из CRM 1').find().putMouseOver();
                        helper.addActionButton.expectNotToExist();
                    });
                });
                describe('Распределение является корневым действием.', function() {
                    beforeEach(function() {
                        scenarioRequest.includesOnlyDistributionByCrmDataAction().receiveResponse();
                        wait();
                        wait();
                    });

                    it('Меняю тип интерфейса. Действие распределения заблокировано.', function() {
                        helper.scenarioTreeTypeButton.click();

                        helper.actionIcon().withName('По данным из CRM 1').find().click();
                        wait();
                        wait();

                        helper.actionReturnCodesList.expectNotToExist();
                    });
                    it('Действие распределения заблокировано.', function() {
                        helper.actionIcon().withName('По данным из CRM 1').find().putMouseOver();
                        helper.addActionButton.expectNotToExist();
                    });
                });
            });
            it(
                'Интеграция подключена. Открываю окно редактирования настроек распределения. В выпадающем списке ' +
                'полей ничего не выбрано.',
            function() {
                actionTypesRequest.receiveResponse();
                helper.returnCodesRequest().receiveResponse();
                helper.markersTypesRequest().receiveResponse();

                helper.scenarioRequest().includesDistributionByCrmDataAction().receiveResponse();
                wait();
                wait();

                helper.actionIcon().withName('По данным из CRM 1').find().putMouseOver();
                helper.addActionButton.click();
                wait();

                helper.actionReturnCodesList.row.first().combobox().withPlaceholder('Поле в CRM').expectToHaveValue('');
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

            helper.actionTypesRequest().app59274().receiveResponse();
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
    });
});
