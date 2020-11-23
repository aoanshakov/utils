tests.requireClass('Comagic.services.ats.callblocking.store.BlackListRecords');
tests.requireClass('Comagic.services.ats.callblocking.controller.Page');

function ServicesAtsCallblocking(requestsManager, testersFactory, utils) {
    var controller = Comagic.getApplication().
        getController('Comagic.services.ats.callblocking.controller.Page');

    controller.init();

    Comagic.getApplication().enableActionRunning();

    controller.actionIndex({
        siteId: 1234
    });

    Comagic.getApplication().disableActionRunning();

    this.blackListGrid = testersFactory.createGridTester(function () {
        return Comagic.getApplication().findComponent(
            'gridcolumn[text="Блокировка входящих с номера"]'
        ).up('grid');
    });

    this.requestOfBlackListItemUpdate = function () {
        return {
            createResponse: function () {
                var bodyParams = {
                    incoming: false,
                    id: 82532
                };

                return {
                    setOutgoingEnabled: function () {
                        bodyParams = {
                            outgoing: true,
                            id: 82532
                        };

                        return this;
                    },
                    receive: function () {
                        requestsManager.recentRequest().
                            expectToHavePath('/services/ats__callblocking/blacklist/update/').
                            expectToHaveMethod('POST').
                            expectBodyToContain(bodyParams).
                            respondSuccessfullyWith({
                                data: true,
                                success: true
                            });
                    }
                };
            },
            receiveResponse: function () {
                return this.createResponse().receive();
            }
        };
    };

    this.blackListRequest = function () {
        return {
            receiveResponse: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/services/ats__callblocking/blacklist/read/').
                    expectToHaveMethod('GET').
                    respondSuccessfullyWith({
                        data: [{
                            id: 82532,
                            name: 'Шалева Дора',
                            numa: '79161234567',
                            add_comment: 'Некий комментарий',
                            add_ruser_name: 'Администратор',
                            add_time: '2020-01-01 12:04:53',
                            incoming: true,
                            outgoing: false
                        }, {
                            id: 82533,
                            name: 'Ганева Стефка',
                            numa: '79161234568',
                            add_comment: 'Еще один комментарий',
                            add_ruser_name: 'Администратор',
                            add_time: '2020-01-01 11:04:53',
                            incoming: false,
                            outgoing: true
                        }],
                        success: true
                    });
            }
        };
    };

    this.destroy = function() {
        controller.destroy();
    };
}
