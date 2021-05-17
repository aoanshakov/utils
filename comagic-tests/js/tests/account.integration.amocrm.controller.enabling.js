 tests.addTest(function(requestsManager, testersFactory, wait, utils, windowOpener) {
     var helper;

     describe('Открываю раздел "Аккаунт/Интеграция/AmoCRM/Подключить".', function() {
         beforeEach(function() {
             helper && helper.destroy();

             helper = new AccountIntegrationAmocrmEnabling({
                 requestsManager: requestsManager,
                 testersFactory: testersFactory,
                 utils: utils
             });
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
         it('Сообщение об ошибке не отображено .', function() {
             helper.panel.expectTextContentNotToHaveSubstring('Обратитесь в службу поддержки.');
         });     
     });     
     it(
         'Открываю раздел "Аккаунт/Интеграция/AmoCRM/Подключить". В URL передана некорректная ошибка. Сообщение об ' +
         'ошибке не отображено .',
     function() {
         helper && helper.destroy();

         helper = new AccountIntegrationAmocrmEnabling({
             requestsManager: requestsManager,
             testersFactory: testersFactory,
             utils: utils,
             error: '<script>alert("Hello world!");</script>'
         });

         helper.panel.expectTextContentNotToHaveSubstring('Обратитесь в службу поддержки.');
     });     
     it(
         'Открываю раздел "Аккаунт/Интеграция/AmoCRM/Подключить". В URL передана ошибка. Отображено сообщение об ' +
         'ошибке.',
     function() {
         helper && helper.destroy();

         helper = new AccountIntegrationAmocrmEnabling({
             requestsManager: requestsManager,
             testersFactory: testersFactory,
             utils: utils,
             error: 'other_app_integrated.69239'
         });

         helper.panel.expectTextContentToHaveSubstring(
             'Интеграция уже подключена к аккаунту 69239. Обратитесь в службу поддержки.');
     });     
 });
