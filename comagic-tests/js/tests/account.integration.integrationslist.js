tests.addTest(function({requestsManager, testersFactory, wait, utils, windowOpener}) {
    describe('Открываю раздел "Аккаунт/Интеграция".', function() {
        var helper,
            integrationsRequest;

        beforeEach(function() {
            helper && helper.destroy();
            helper = new AccountIntegrationsList({ requestsManager, testersFactory, utils });
                
            integrationsRequest = helper.integrationsRequest().expectToBeSent();
        });
        
        describe('Подключена интеграция с amoCRM.', function() {
            beforeEach(function() {
                integrationsRequest.setAmoCRMEnabled().receiveResponse();
            });

            it('Нажимаю на кнопку отключения.', function() {
                helper.button('Отключить').click();
                wait(10);

                helper.textarea.fill('Некая причина');

                helper.button('Да').click();
                wait(10);

                helper.disableCrmRequest().receiveResponse();
                helper.integrationsRequest().receiveResponse();
            });
            return;
            it('Отображена кнопка отключения.', function() {
                helper.body.expectToHaveTextContent('Интеграция Отключить Настройки');
            });
        });
        return;
        it('Ни одна интеграция не подключена.', function() {
            integrationsRequest.receiveResponse();
            helper.enableButton(0).click();
        });
     });     
 });
