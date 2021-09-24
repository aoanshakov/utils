tests.addTest(function(requestsManager, testersFactory, wait, utils, windowOpener) {
    describe('Открываю раздел "Аккаунт/Интеграция".', function() {
        var helper,
            integrationsRequest;

        beforeEach(function() {
            helper && helper.destroy();
            helper = new AccountIntegrationsList(requestsManager, testersFactory, utils);
                
            integrationsRequest = helper.integrationsRequest().expectToBeSent();
        });
        
        xit('Подключена интеграция с amoCRM.', function() {
            integrationsRequest.setAmoCRMEnabled().receiveResponse();
            helper.body.expectToHaveTextContent('Интеграция Отключить Настройки');
        });
        it('Ни одна интеграция не подключена.', function() {
            integrationsRequest.receiveResponse();
            helper.enableButton(0).click();
        });
     });     
 });
