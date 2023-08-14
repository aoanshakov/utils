tests.requireClass('Comagic.services.ats.scenario.store.Records');
tests.requireClass('Comagic.services.ats.scenario.controller.Page');

function ServicesAtsScenario(args) {
    var requestsManager = args.requestsManager,
        testersFactory = args.testersFactory,
        utils = args.utils,
        controller = Comagic.getApplication().getController('Comagic.services.ats.scenario.controller.Page');

    this.grid = testersFactory.createGridTester(function () {
        return Comagic.getApplication().findComponent('grid');
    });

    this.scenarioRemovingAvailabilityRequest = function () {
        var response = {
            success: true,
            data: {
                is_removal_available: true,
                scenario_usage: {
                    default_scenario_site_list: [{
                        name: 'somedomain.com',
                    }, {
                        name: 'otherdomain.com',
                    }],
                    sitephone_site_list: [{
                        name: 'thirddomain.com',
                    }, {
                        name: 'fourthdomain.com',
                    }],
                    lead_scenario_list: [{
                        name: 'Некий генератор',
                    }, {
                        name: 'Другой генератор',
                    }],
                    number_capacity_list: [{
                        name: '74951234567',
                    }, {
                        name: '74951234568',
                    }],
                    group_list: [{
                        name: 'Некая группа',
                    }, {
                        name: 'Другая группа',
                    }],
                }
            },
        };

        function addMethods (me) {
            me.unavailable = function () {
                response.data.is_removal_available = false;
                return me;
            };

            return me;
        }

        return addMethods({
            expectToBeSent: function () {
                var request = requestsManager.recentRequest().
                    expectToHavePath('/services/ats__scenario/try_to_remove_scenario/428598/');

                return addMethods({
                    receiveResponse: function () {
                        request.respondSuccessfullyWith(response);
                    }
                });
            },
            receiveResponse: function () {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    this.scenariosRequest = function () {
        var response = {
            success: true,
            data: [{
                id: 428598,
                name: 'Некий сценарий',
                last_change_dt: '2018-10-22 12:47:03',
                cdr_processed_cnt: 34,
                used_in_nc: ['Тут', 'Там'],
                used_in_ac: [{
                    campaign_id: 50283,
                    campaign_name: 'Некая кампания',
                    number_pool_id: 864827,
                    number_pool_name: 'Некий пул номеров',
                    site_id: 74729,
                    site_domain_name: 'somedomain.com'
                }],
                used_in_site: [{
                    campaign_id: 50284,
                    campaign_name: 'Другая кампания',
                    number_pool_id: 864828,
                    number_pool_name: 'Другой пул номеров',
                    site_id: 74729,
                    site_domain_name: 'otherdomain.com'
                }]
            }],
        };

        function addMethods (me) {
            return me;
        }

        return addMethods({
            expectToBeSent: function () {
                var request = requestsManager.recentRequest().
                    expectToHavePath('/services/ats__scenario/records/read/');

                return addMethods({
                    receiveResponse: function () {
                        request.respondSuccessfullyWith(response);
                    }
                });
            },
            receiveResponse: function () {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    this.actionIndex = function (data) {
        controller.init();

        controller.actionIndex({
            siteId: 1234
        }, data || {});
    };

    this.batchReloadRequest = function () {
        var response = {
            success: true,
            data: {
            } 
        };

        function addResponseModifiers (me) {
            return me;
        }

        return addResponseModifiers({
            expectToBeSent: function () {
                return addResponseModifiers({
                    receiveResponse: function () {
                        requestsManager.recentRequest().
                            expectToHavePath('/directory/batch_reload/').
                            expectToHaveMethod('POST').
                            respondSuccessfullyWith(response);
                    }
                });
            },
            receiveResponse: function () {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    this.destroy = function() {
        controller.destroy();
    };
}
