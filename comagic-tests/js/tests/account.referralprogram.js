tests.addTest(function(requestsManager, testersFactory, wait, utils) {
    describe(
        'Открываю раздел "Аккаунт/Реферальная программа". Сервер прислал содержимое таблицы приглашенных клиентов. ' +
        'Отправлен запрос промо-кода.',
     function() {
        var helper;

        beforeEach(function() {
            if (helper) {
                helper.destroy();
            }

            helper = new AccountReferralProgram(requestsManager, testersFactory, utils);
            helper.requestInvitedClients().send();
        });

        it('В таблице корректно отображены, полученные от сервера данные.', function() {
            helper.invitedClientsGrid.row().first().column().withHeader('Приглашенные').
                expectToHaveContent('ИП Иванов М. Д.');

            helper.invitedClientsGrid.row().first().column().withHeader('Статус').
                expectToHaveContent('Пробует UIS');

            helper.invitedClientsGrid.row().atIndex(1).column().withHeader('Статус').
                expectToHaveContent('Пробует UIS');

            helper.invitedClientsGrid.row().atIndex(2).column().withHeader('Статус').
                expectToHaveContent('Подключен');

            helper.requestReferralLink().send();
        });
        it('Кнопка копирования реферальной ссылки заблокирована.', function() {
            helper.copyButton.expectToBeDisabled();
            helper.requestReferralLink().send();
        });
        describe('Сервер прислал промо-код.', function() {
            beforeEach(function() {
                helper.requestReferralLink().send();
            });

            it('Кнопка копирования реферальной ссылки доступна.', function() {
                helper.copyButton.expectToBeEnabled();
            });
            it('В поле отображения реферальной ссылки отображена ссылка, содержащая промо-код.', function() {
                helper.linkField.expectToHaveValue('https://www.uiscom.ru/invite/z7jH4w');
            });
            it(
                'Нажимаю на кнопку копирования реферальной ссылки. Значение поля реферальной ссылки скопировано.',
            function() {
                helper.copyButton.click();
                helper.linkField.expectAllContentToBeSelected();
            });
        });
    });
});
