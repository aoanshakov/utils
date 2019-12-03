tests.addTest(function(requestsManager, testersFactory, wait, utils, windowOpener) {
    describe('Открываю раздел "Аккаунт/Интеграция/Инфо Клиника".', function() {
        var helper;

        beforeEach(function() {
            helper = new AccountIntegrationInfoclinica(requestsManager, testersFactory, utils);
            helper.requestInfoclinicaData().send();
            helper.requestAvailabilityOfSalesFunnelComponentInTariff().send();
            helper.requestInfoclinicaStatus().send();
        });
        afterEach(function() {
            helper.destroy();
        });
        
        it((
            'Открываю вкладку "Воронки продаж". На вкладке отображен текст "Получение данных по оплатам по умолчанию ' +
            'отключено.".'
        ), function() {
            helper.infoclinicaSettingsTabPanel.tab('Воронки продаж').click();
            helper.requestSalesFunnelComponentTariffInfo().send();

            helper.salesFunnelsTab.expectTextContentToHaveSubstring(
                'Получение данных по оплатам по умолчанию отключено.'
            );
        });
    });
});
