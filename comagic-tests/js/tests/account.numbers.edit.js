tests.addTest(function(requestsManager, testersFactory, wait, utils) {
    describe(
        'Открываю раздел "Аккаунт/Управление номерами". Выбираю номер стороннего провайдера для редактирования.',
    function() {
        var helper;

        beforeEach(function() {
            if (helper) {
                helper.destroy();
            }

            helper = new AccountNumbers(requestsManager, testersFactory, utils);

            helper.accountNumbersRequest().setExternalProvider().send();
            helper.batchReloadRequest().send();

            helper.numbersManagementGrid.row().first().column().withHeader('Номер').
                findElement('.cm-grid-cell-number-settings-icon').click();
        });

        describe('Для номера указан корректный SIP-логин.', function() {
            beforeEach(function() {
                helper.requestNumberParams().send();
                wait();
            });

            it('Кнопка "Повторить подключение" заблокирована.', function() {
                helper.repeatConnectionButton.expectToBeDisabled();
            });
            it('Измению значение полей формы. Кнопка "Повторить подключение" доступна.', function() {
                helper.windowForm.textfield().withFieldLabel('Логин *').input('4');
                wait();

                helper.repeatConnectionButton.expectToBeEnabled();
            });
        });
        it((
            'Для номера указан некорректный SIP-логин. Измению значение полей формы. Кнопка "Повторить подключение" ' +
            'заблокирована.'
        ), function() {
            helper.requestNumberParams().setInvalidLogin().send();
            wait();

            helper.windowForm.textfield().withFieldLabel('Логин *').input('4');
            wait();

            helper.repeatConnectionButton.expectToBeDisabled();
        });
    });
});
