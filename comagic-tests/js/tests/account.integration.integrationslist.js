tests.addTest(function(requestsManager, testersFactory, wait, utils, windowOpener) {
    describe('Открываю раздел "Аккаунт/Интеграция".', function() {
        var helper;

        beforeEach(function() {
            helper && helper.destroy();
            helper = new AccountIntegrationsList(requestsManager, testersFactory, utils);
        });
        
        it('Ни одна интеграция не подключена.', function() {
            helper.requestIntegrations().send();
            helper.enableButton.click();
         });
     });     
 });
