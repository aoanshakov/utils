tests.addTest(function(args) {
    var requestsManager = args.requestsManager,
        testersFactory = args.testersFactory,
        wait = args.wait,
        utils = args.utils;

    describe('Открываю раздел правил.', function() {
        var helper, 
            autoBackCallRequest;

        beforeEach(function() {
            if (helper) {
                helper.destroy();
            }

            helper = new ServicesAutocallsAutobackcall(args);

            Comagic.Directory.load();
            helper.batchReloadRequest().receiveResponse();

            helper.actionIndex();
            autoBackCallRequest = helper.autoBackCallRequest().expectToBeSent();
            helper.masterBackCallActivityRequest().receiveResponse();
        });

        describe(
            'Значение поля "Не перезванивать, если абонент ожидал ответа менее" не должно быть пустым.',
        function() {
            beforeEach(function() {
                autoBackCallRequest.receiveResponse();
            });

            describe('Нажимаю на кнопку "Добавить правило".', function() {
                beforeEach(function() {
                    helper.button('Добавить правило').click();
                });

                describe('Заполняю форму.', function() {
                    beforeEach(function() {
                        helper.editForm.combobox().withFieldLabel('Место потери звонка').clickArrow();
                        helper.editForm.combobox().withFieldLabel('Место потери звонка').option('Некий фильтр').click();
                        
                        helper.editForm.combobox().withFieldLabel('Как перезванивать').clickArrow();
                        helper.editForm.combobox().withFieldLabel('Как перезванивать').option('Некий метод обработки').
                            click();

                        helper.editForm.combobox().withFieldLabel('Звонить с номера').clickArrow();
                        helper.editForm.combobox().withFieldLabel('Звонить с номера').option('79161234567').click();

                        helper.editForm.checkbox().
                            withFieldLabel('Использовать для потерянных звонков из digital pipeline CRM').
                            click();
                    });

                    describe(
                        'Снимаю отметку с чекбокс справа от поля "Не перезванивать, если абонент ожидал ответа менее".',
                    function() {
                        beforeEach(function() {
                            helper.minWaitDurationCheckbox().click();
                        });

                        it('Нажимаю на кнопку "Сохранить". Правило сохранено.', function() {
                            helper.button('Сохранить').click();
                            helper.autoBackCallCreatingRequest().noMinWaitDuration().receiveResponse();

                            helper.rulesListItem.first.informationBlock.atIndex(1).expectToHaveTextContent(
                                'Дополнительно: ' +

                                'Не перезванивать, если абонент ожидал ответа менее 15 с ' +
                                'Ограничить количество одномоментных вызовов до 3'
                            );

                            helper.rulesListItem.atIndex(1).informationBlock.atIndex(1).expectToHaveTextContent(
                                'Дополнительно: ' +
                                'Ограничить количество одномоментных вызовов до 1'
                            );
                        });
                        it(
                            'Отмечаю чекбокс справа от поля "Не перезванивать, если абонент ожидал ответа менее". Поле ' +
                            '"Не перезванивать, если абонент ожидал ответа менее" доступно и заполнено значением.',
                        function() {
                            helper.minWaitDurationCheckbox().click();

                            helper.editForm.textfield().withFieldLabel(
                                'Не перезванивать, если абонент ожидал ответа менее'
                            ).expectToHaveValue('5');

                            helper.editForm.textfield().withFieldLabel(
                                'Не перезванивать, если абонент ожидал ответа менее'
                            ).expectToBeEnabled();
                        });
                        it(
                            'Поле "Не перезванивать, если абонент ожидал ответа менее" заблокировано и очищено.',
                        function() {
                            helper.editForm.textfield().withFieldLabel(
                                'Не перезванивать, если абонент ожидал ответа менее'
                            ).expectToHaveValue('');

                            helper.editForm.textfield().withFieldLabel(
                                'Не перезванивать, если абонент ожидал ответа менее'
                            ).expectToBeDisabled();
                        });
                    });
                    it(
                        'Оставляю отмеченным чекбокс справа от поля "Не перезванивать, если абонент ожидал ответа ' +
                        'менее". Нажимаю на кнопку "Сохранить". Правило сохранено.',
                    function() {
                        helper.editForm.textfield().withFieldLabel('Не перезванивать, если абонент ожидал ответа менее').
                            fill('15');
                        
                        helper.button('Сохранить').click();
                        helper.autoBackCallCreatingRequest().receiveResponse();
                    });
                });
                it('Форма редактирования заполнена значениями по умолчанию.', function() {
                    helper.minWaitDurationCheckbox().expectToBeChecked();
                    
                    helper.editForm.textfield().withFieldLabel('Не перезванивать, если абонент ожидал ответа менее').
                        expectToHaveValue('5');
                    helper.editForm.textfield().withFieldLabel('Не перезванивать, если абонент ожидал ответа менее').
                        expectToBeEnabled();

                    helper.editForm.checkbox().
                        withFieldLabel('Использовать для потерянных звонков из digital pipeline CRM').
                        expectToBeChecked();
                });
            });
            it(
                'Открываю окно редактирования правила. Форма редактирования заполнена настройками редактируемого ' +
                'правила.',
            function() {
                helper.editButton.click();

                helper.minWaitDurationCheckbox().expectToBeChecked();

                helper.editForm.textfield().withFieldLabel('Не перезванивать, если абонент ожидал ответа менее').
                    expectToHaveValue('15');

                helper.editForm.textfield().withFieldLabel('Не перезванивать, если абонент ожидал ответа менее').
                    expectToBeEnabled();

                helper.editForm.checkbox().withFieldLabel('Использовать для потерянных звонков из digital pipeline CRM').
                    expectNotToBeChecked();
            });
        });
        it(
            'Значение поля "Не перезванивать, если абонент ожидал ответа менее" должно быть пустым. Открываю окно ' +
            'редактирования правила. Форма редактирования заполнена настройками редактируемого правила.',
        function() {
            autoBackCallRequest.noMinWaitDuration().receiveResponse();
            helper.editButton.click();

            helper.minWaitDurationCheckbox().expectNotToBeChecked();

            helper.editForm.textfield().withFieldLabel('Не перезванивать, если абонент ожидал ответа менее').
                expectToHaveValue('');

            helper.editForm.textfield().withFieldLabel('Не перезванивать, если абонент ожидал ответа менее').
                expectToBeDisabled();
        });
    });
});
