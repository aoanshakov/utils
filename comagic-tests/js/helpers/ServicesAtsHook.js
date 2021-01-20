tests.requireClass('Comagic.base.store.Condition');
tests.requireClass('Comagic.services.ats.hook.controller.EditPage');

function ServicesAtsHook(requestsManager, testersFactory, utils) {
    var controller = Comagic.getApplication().getController('Comagic.services.ats.hook.controller.EditPage');

    this.actionIndex = function (data) {
        controller.init();
        controller.actionIndex({
            siteId: 1234
        }, data);
    };

    this.batchReloadRequest = function () {
        return {
            receiveResponse: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/directory/batch_reload/').
                    expectToHaveMethod('POST').
                    respondSuccessfullyWith({
                        success: true,
                        data: {
                            'comagic:public:true_false': [],
                            'comagic:public:number_capacity_with_common': [],
                            'comagic:ns:event_param_v2.0': [],
                            'comagic:ns:handler': [{
                                id: 'sms_http_request',
                                required_components: []
                            }, {
                                id: 'send_mail',
                                required_components: []
                            }, {
                                id: 'http_request',
                                required_components: []
                            }]
                        }
                    });
            }
        };
    };

    this.hookRequest = function () {
        return {
            receiveResponse: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/services/ats__hook/hook/read/hook/').
                    expectToHaveMethod('GET').
                    expectQueryToContain({
                        id: '104561'
                    }).
                    respondSuccessfullyWith({
                        success: true,
                        notification: {
                            event_version_id: 348925
                        }
                    });
            }
        };
    };

    this.conditionsRequest = function () {
        var params = {
            event_version_id: undefined
        };

        return {
            setEventVersion: function () {
                params.event_version_id = '348925';
                return this;
            },
            receiveResponse: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/directory_tree/comagic:condition/').
                    expectQueryToContain(params).
                    expectToHaveMethod('GET').
                    respondSuccessfullyWith({
                        success: true,
                        children: [{
                        }]
                    });
            }
        };
    };

    this.destroy = function() {
        controller.destroy();
    };
}
