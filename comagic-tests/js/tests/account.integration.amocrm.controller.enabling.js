 tests.addTest(function(requestsManager, testersFactory, wait, utils, windowOpener) {
     describe(
         'Открываю раздел "Аккаунт/Интеграция/AmoCRM/Подключить".',
     function() {
         var helper;
     
         beforeEach(function() {
             helper && helper.destroy();
             helper = new AccountIntegrationAmocrmEnabling(requestsManager, testersFactory, utils);
         });

         describe('Нажимаю на кнопку "Подключить".', function() {
             beforeEach(function() {
                 helper.enableButton.click();
             });

             it(
                 'Не удалось получить URL для подключения интеграции. Отображено сообщение об ошибке. Панель ' +
                 'разблокирована.',
             function() {
                 helper.requestIntegrationEnablingUrl().setInternalError().send();
                 wait();

                 helper.errorMessage.expectTextContentToHaveSubstring('Произошла непредвиденная ошибка');
                 helper.panel.expectNotToBeMasked();
             });
             it('Получен URL для подключения интеграции. Панель разблокирована.', function() {
                 helper.requestIntegrationEnablingUrl().send();
                 windowOpener.expectToHavePath('https://amocrm.ru');
                 helper.panel.expectNotToBeMasked();
             });
             it('Панель заблокирована.', function() {
                 helper.panel.expectToBeMasked();
                 helper.requestIntegrationEnablingUrl().send();
             });
         });
     });     
 });
