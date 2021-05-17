 tests.requireClass('Comagic.account.integration.amocrm.controller.Enabling');
     
function AccountIntegrationAmocrmEnabling(args) {
    var requestsManager = args.requestsManager,
        testersFactory = args.testersFactory,
        utils = args.utils,
        error = args.error,
        controller = Comagic.getApplication().getController('Comagic.account.integration.amocrm.controller.Enabling');

    if (error) {
        Comagic.getApplication().stateManager.setState({
            error: error
        });
    }
            
    controller.init();
    controller.actionIndex();

    this.errorMessage = testersFactory.createDomElementTester(function () {
        return document.querySelector('.x-window-body');
    });

    this.enableButton = testersFactory.createDomElementTester(function () {
        return utils.findElementByTextContent(document.body, 'Подключить', '.x-btn-inner');
    });

    this.subdomainField = function () {
        return testersFactory.createTextFieldTester(Comagic.application.findComponent('textfield[name=domain]'));
    };

    this.panel = testersFactory.createComponentTester(function () {
        return Comagic.application.findComponent('account-integration-amocrm-enable');
    });

    this.requestIntegrationEnablingUrl = function () {
        var response ={
            success: true,
            data: 'https://amocrm.ru'
        };
        
        return {
            setInternalError: function () {
                response = {
                    success: false,
                    error_code: 3,
                    error_message: {
                        type: 'CrmAccountError',
                        data: ['internal_error']
                    }
                };

                return this;
            },
            send: function () {
               requestsManager.recentRequest().
                   expectToHavePath('/account/integration/oauth_url/').
                   expectToHaveMethod('GET').
                   testQueryParam('redirect_url', function (value) {
                       if (
                           !/^http(s)?:\/\/.*\/#controller\.id="account\.integration\.amocrm\.controller\.Page"$/.
                               test(value)
                       ) {
                           throw new Error('Некорректный URL для редиректа "' + value + '".');
                       }
                   }).
                   respondSuccessfullyWith(response);
            }
        };
    };

    this.destroy = function() {
        controller.destroy();
    };
}
