tests.requireClass('Comagic.services.ats.sip.store.Record');
tests.requireClass('Comagic.services.ats.sip.controller.EditPage');

function ServicesAtsSipEditPage(args) {
    var requestsManager = args.requestsManager,
        testersFactory = args.testersFactory,
        utils = args.utils,
        controller = Comagic.getApplication().getController('Comagic.services.ats.sip.controller.EditPage');

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
                                data: {
                                }
                            });
                    }
                };
            },
            receiveResponse: function () {
                this.expectToBeSent().receiveResponse();
            }
        };
    };

    this.sipLineRequest = function () {
        return {
            expectToBeSent: function () {
                return {
                    receiveResponse: function () {
                        requestsManager.recentRequest().
                            expectToHavePath('/services/ats__sip/read/sip_line/210948/').
                            expectToHaveMethod('GET').
                            respondSuccessfullyWith({
                                success: true,
                                data: {
                                }
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
                                    'billing:public:physical_limit_left': [{
                                        id: 'max_sip_line',
                                        name: 'Максимальное количество SIP-линий'
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
        }, data);
    };

    this.destroy = function() {
        controller.destroy();
    };
}
