tests.requireClass('Comagic.account.integration.integrationslist.controller.Page');

function AccountIntegrationInfoclinica(requestsManager, testersFactory, utils) {
    var controller = Comagic.getApplication().
        getController('Comagic.account.integration.integrationslist.controller.Page');

    controller.init();
    controller.actionIndex();

    this.destroy = function() {
        controller.destroy();
    };
}
