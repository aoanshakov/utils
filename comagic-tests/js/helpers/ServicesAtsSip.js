tests.requireClass('Comagic.services.ats.sip.store.Records');
tests.requireClass('Comagic.services.ats.sip.controller.Page');

var style = document.createElement('style');

style.appendChild(document.createTextNode('.x-viewport > .x-body { ' +
    'overflow-x: auto; ' +
    'overflow-y: hidden; ' +
'}'));

document.getElementsByTagName('head')[0].appendChild(style);

function ServicesAtsSip(args) {
    var requestsManager = args.requestsManager,
        testersFactory = args.testersFactory,
        utils = args.utils,
        controller = Comagic.getApplication().getController('Comagic.services.ats.sip.controller.Page');

    this.sipLimitsRequest = function () {
        return {
            expectToBeSent: function () {
                return {
                    receiveResponse: function () {
                        requestsManager.recentRequest().
                            expectToHavePath('services/ats__sip/read/sip_limits/').
                            expectToHaveMethod('GET').
                            respondSuccessfullyWith({
                                success: true,
                                data: []
                            });
                    }
                };
            },
            receiveResponse: function () {
                this.expectToBeSent().receiveResponse();
            }
        };
    };

    this.sipRecordsRequest = function () {
        var item = {
            state: '',
            is_mobile_terminal_enabled: false,
            employee_id: 48284
        };

        function addResponseModifiers (me) {
            me.isMobileTerminalEnabled = function () {
                item.is_mobile_terminal_enabled = true;
                return me;
            };

            return me;
        };
        
        return addResponseModifiers({
            expectToBeSent: function () {
                return addResponseModifiers({
                    receiveResponse: function () {
                        requestsManager.recentRequest().
                            expectToHavePath('/services/ats__sip/records/read/').
                            expectToHaveMethod('GET').
                            respondSuccessfullyWith({
                                success: true,
                                data: [item]
                            });
                    }
                });
            },
            receiveResponse: function () {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    this.employeesRequest = function () {
        return {
            expectToBeSent: function () {
                return {
                    receiveResponse: function () {
                        requestsManager.recentRequest().
                            expectToHavePath('/directory/comagic:staff:employee/').
                            expectToHaveMethod('GET').
                            respondSuccessfullyWith({
                                success: true,
                                data: [{
                                    id: 48284,
                                    name: 'Абакаев Герман Райбекович'
                                }]
                            });
                    }
                };
            },
            receiveResponse: function () {
                this.expectToBeSent().receiveResponse();
            }
        };
    };

    this.batchReloadRequest = function () {
        function addMethods (me) {
            return me;
        }

        return addMethods({
            expectToBeSent: function () {
                return addMethods({
                    receiveResponse: function () {
                        requestsManager.recentRequest().
                            expectToHavePath('/directory/batch_reload/').
                            expectToHaveMethod('POST').
                            respondSuccessfullyWith({
                                success: true,
                                data: {
                                    'billing:public:physical_limit': [],
                                    'billing:public:physical_limit_left': [],
                                    'comagic:staff:employee': [{
                                        id: 48284,
                                        name: 'Абакаев Герман Райбекович'
                                    }]
                                } 
                            });
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

    this.destroy = function() {
        controller.destroy();
    };
}
