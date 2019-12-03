tests.requireClass('Comagic.account.integration.infoclinica.store.FilialStates');
tests.requireClass('Comagic.account.integration.infoclinica.store.Record');
tests.requireClass('Comagic.account.integration.infoclinica.controller.Page');

function AccountIntegrationInfoclinica(requestsManager, testersFactory, utils) {
    var controller = Comagic.getApplication().getController('Comagic.account.integration.infoclinica.controller.Page');

    controller.init();
    controller.actionIndex();

    this.requestSalesFunnelComponentTariffInfo = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/account/integration/get_sales_funnel_component_tariff_info/').
                    respondSuccessfullyWith({
                        success: true,
                        data: {
                            user_charge: 183.22
                        }
                    });
            }
        };
    };
    this.requestInfoclinicaStatus = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/account/integration/infoclinica/status/').
                    respondSuccessfullyWith({
                        success: true,
                        data: {
                            success: true,
                            data: {
                                mnemonic: 'sync_deals',
                                result: {
                                }
                            }
                        }
                    });
            }
        };
    };
    this.requestAvailabilityOfSalesFunnelComponentInTariff = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/account/integration/is_available_sales_funnel_component_in_tariff/').
                    respondSuccessfullyWith({
                        success: true,
                        data: {
                            is_available_sales_funnel_component_in_tariff: true
                        }
                    });
            }
        };
    };
    this.requestInfoclinicaData = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/account/integration/infoclinica/read/').
                    respondSuccessfullyWith({
                        success: true,
                        data: {
                            id: 38928,
                            app_id: 4735,
                            url: 'http://infoclinica.ru',
                            time_zone: 4,
                            is_active: true,
                            is_import_deal: true,
                            is_process_call: true,
                            is_process_chat: true,
                            is_process_offline_message: true
                        }
                    });
            }
        };
    };
    this.destroy = function() {
        controller.destroy();
    };

    var salesFunnelsTab = function () {
        return Comagic.getApplication().findComponent('panel[title="Воронки продаж"]');
    };

    this.salesFunnelsTab = testersFactory.createComponentTester(salesFunnelsTab);

    this.infoclinicaSettingsTabPanel = testersFactory.createTabPanelTester(function () {
        return salesFunnelsTab().up('tabpanel');
    });
}
