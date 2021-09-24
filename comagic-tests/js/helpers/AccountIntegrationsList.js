tests.requireClass('Comagic.account.integration.integrationslist.controller.Page');
    
function AccountIntegrationsList(requestsManager, testersFactory, utils) {
    var controller = Comagic.getApplication().
        getController('Comagic.account.integration.integrationslist.controller.Page');
            
    controller.init();
    controller.actionIndex();

    this.integrationsRequest = function () {
        var amoCRMIntegration = {
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

        function addMethods (me) {
            me.setAmoCRMEnabled = function () {
                amoCRMIntegration.crm_id = 3750;
                return me;
            };

            return me;
        }

        return addMethods({
            expectToBeSent: function () {
                var request = requestsManager.recentRequest().
                    expectToHavePath('/account/integration/read_all/');
 
                return addMethods({
                    receiveResponse: function () {
                       request.respondSuccessfullyWith({
                           success: true,
                           data: [amoCRMIntegration, {
                               brand_name: 'RetailCRM',
                               crm_id: null,
                               crm_type: 'retailcrm',
                               crm_type_id: 2,
                               hint: '',
                               is_active: true,
                               is_available: true,
                               is_component_available: true,
                               name: 'RetailCRM',
                               ui_display: true
                           }]
                       });
                    }
                });
            },
            receiveResponse: function () {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    this.body = testersFactory.createDomElementTester(function () {
        return document.body;
    });

    this.enableButton = function (index) {
        return testersFactory.createDomElementTester(utils.findElementsByTextContent(
            document.body, 'Подключить', '.x-btn-inner'
        )[index]);
    };
        
    this.destroy = function() {
        controller.destroy();
    };
}
