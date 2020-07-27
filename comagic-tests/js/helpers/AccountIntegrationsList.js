 tests.requireClass('Comagic.account.integration.integrationslist.controller.Page');
     
 function AccountIntegrationsList(requestsManager, testersFactory, utils) {
     var controller = Comagic.getApplication().
         getController('Comagic.account.integration.integrationslist.controller.Page');
             
     controller.init();
     controller.actionIndex();

     this.requestIntegrations = function () {
         var integration = {
            brand_name: 'amoCRM',
            crm_id: null,
            crm_type: 'amo_crm_ws',
            crm_type_id: 1,
            hint: 'Зарегистрируйтесь в amoCRM, используя в качестве логина тот же email-адрес, ' +
                'который был Вами использован для регистрации в {pageTitle}. В amoCRM в меню ' +
                'Настройки/Интеграции выберите виджет {pageTitle} и активируйте его.',
            is_active: true,
            is_available: true,
            is_component_available: true,
            name: 'amoCRM',
            ui_display: true
        };

         return {
             setEnabled: function () {
                 integration.crm_id = 3750;
                 return this;
             },
             send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/account/integration/read_all/').
                    respondSuccessfullyWith({
                        success: true,
                        data: [integration]
                    });
             }
         };
     };

     this.enableButton = testersFactory.createDomElementTester(function () {
         return utils.findElementByTextContent(document.body, 'Подключить', '.x-btn-inner');
     });
         
     this.destroy = function() {
         controller.destroy();
     };
}
