tests.addTest(function(requestsManager, testersFactory, wait, utils) {
    describe('Открываю раздел "Аккаунт/Управление номерами".', function() {
        var helper;

        beforeEach(function() {
            Comagic.getApplication().setHasNoAppParameter('transit_dst_app_id');
            helper = new AccountNumbers(requestsManager, testersFactory, utils);
        });
        afterEach(function() {
            helper.destroy();
        });

        describe((
            'Ответ на запрос данных для таблицы номеров содержит номер стороннего провайдера, для которого не ' +
            'удалось зарегистрировать шлюз.'
        ), function() {
            beforeEach(function() {
                helper.accountNumbersRequest().setExternalProvider().setGatewayNotRegistered().send();
                helper.batchReloadRequest().send();
            });

            it('Справа от номера в колонке "Номер" отображена иконка с шестеренкой.', function() {
                helper.numbersManagementGrid.row().first().column().withHeader('Номер').
                    createTester().forDescendant('.cm-grid-cell-number-settings-icon').expectToExist();
            });
            it('Слева от номера в колонке "Номер" отображена иконка с воклицательным знаком.', function() {
                helper.numbersManagementGrid.row().first().column().withHeader('Номер').
                    createTester().forDescendant('.cm-grid-cell-number-warning-icon').expectToExist();
            });
            it((
                'При наведении курсора мыши на иконку с восклицательным знаком отображается сообщение о том, что ' +
                'шлюз зарегистрировать не удалось.'
            ), function() {
                helper.numbersManagementGrid.row().first().column().withHeader('Номер').
                    createTester().forDescendant('.cm-grid-cell-number-warning-icon').
                    expectTooltipContainingText('Произошел сбой подключения.').toBeShownOnMouseOver();
            });
        });
        it((
            'Ответ на запрос данных для таблицы номеров содержит номер стороннего провайдера, для которого не ' +
            'удалось произвести тестовый звонок. При наведении курсора мыши на иконку с восклицательным знаком ' +
            'отображается сообщение о том, что тестовый звонок произвести не удалось.'
        ), function() {
            helper.accountNumbersRequest().setExternalProvider().setTestCallFailed().send();
            helper.batchReloadRequest().send();

            helper.numbersManagementGrid.row().first().column().withHeader('Номер').
                createTester().forDescendant('.cm-grid-cell-number-warning-icon').
                expectTooltipContainingText('Входящие звонки не фиксируются в системе').toBeShownOnMouseOver();
        });
        describe(
            'Ответ на запрос данных для таблицы номеров содержит успешно добавленный номер стороннего провайдера.',
        function() {
            beforeEach(function() {
                helper.accountNumbersRequest().setExternalProvider().send();
                helper.batchReloadRequest().send();
            });

            it('Содержимое колонки "Номер" выделено синим цветом.', function() {
                helper.numbersManagementGrid.row().first().column().
                    withHeader('Номер').expectToHaveStyle('color', '#3572b0');
            });
            it('Справа от номера в колонке "Номер" отображается иконка с шестеренкой.', function() {
                helper.numbersManagementGrid.row().first().column().withHeader('Номер').
                    createTester().forDescendant('.cm-grid-cell-number-settings-icon').expectToExist();
            });
            it((
                'При наведении курсора мыши на иконку с шестеренкой отображается подсказка в которой написано, что ' +
                'данный номер является номером стороннего провайдера.'
            ), function() {
                helper.numbersManagementGrid.row().first().column().withHeader('Номер').
                    createTester().forDescendant('.cm-grid-cell-number-settings-icon').
                    expectTooltipWithText('Номер стороннего провайдера').toBeShownOnMouseOver();
            });
            it('Иконка с восклицательным знаком не отображается в колонке "Номер".', function() {
                helper.numbersManagementGrid.row().first().column().withHeader('Номер').
                    createTester().forDescendant('.cm-grid-cell-number-warning-icon').expectNotToExist();
            });
            it('Содержимое колонки "Номер" отформатировано по маске "+7 (###) ###-##-##".', function() {
                helper.numbersManagementGrid.row().first().column().withHeader('Номер').
                    expectToHaveTextContent('+7 (495) 255-13-54');
            });
        });
        describe((
            'Ответ на запрос данных для таблицы номеров содержит номер стороннего провайдера, который будет добавлен ' +
            'в течении нескольких минут.'
        ), function() {
            beforeEach(function() {
                helper.accountNumbersRequest().setExternalProvider().setWaitingToBeConnected().send();
                helper.batchReloadRequest().send();
            });

            it('Справа от номера в колонке "Номер" отображается иконка с часами.', function() {
                helper.numbersManagementGrid.row().first().column().withHeader('Номер').
                    createTester().forDescendant('.cm-grid-cell-number-waiting-icon').expectToExist();
            });
            it((
                'При наведении курсора мыши на иконку с часами отображается сообщение о том, что номер будет ' +
                'добавлен в течении нескольких минут.'
            ), function() {
                helper.numbersManagementGrid.row().first().column().withHeader('Номер').
                    createTester().forDescendant('.cm-grid-cell-number-waiting-icon').
                    expectTooltipWithText('Номер будет добавлен в течении нескольких минут').toBeShownOnMouseOver();
            });
        });
        describe('Ответ на запрос данных для таблицы номеров не содержит номер стороннего провайдера.', function() {
            beforeEach(function() {
                helper.accountNumbersRequest().send();
                helper.batchReloadRequest().send();
            });

            it('Иконка с шестеренкой не отображается в колонке "Номер".', function() {
                helper.numbersManagementGrid.row().first().column().withHeader('Номер').
                    createTester().forDescendant('.cm-grid-cell-number-settings-icon').expectNotToExist();
            });
            it('Содержимое колонки "Номер" не выделено синим цветом.', function() {
                helper.numbersManagementGrid.row().first().column().withHeader('Номер').
                    expectNotToHaveStyle('color', '#3572b0');
            });
            it('Содержимое колонки "Номер" отформатировано по маске "+7 (###) ###-##-##".', function() {
                helper.numbersManagementGrid.row().first().column().withHeader('Номер').
                    expectToHaveTextContent('+7 (495) 255-13-54');
            });
        });
    });
});
